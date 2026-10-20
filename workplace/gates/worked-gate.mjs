import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const problem = (code, message) => ({ code, message });
const finish = errors => ({ ok: errors.length === 0, errors });
const identity = (project, id) => `${project}::${id}`;
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);

/** Parse the complete JSON reporter document; a failure-only report is insufficient. */
export function readEvidence(manifest, report) {
  const errors = [];
  if (!object(manifest) || manifest.version !== 1 || !Array.isArray(manifest.projects)
    || !manifest.projects.length || !Array.isArray(manifest.required) || !manifest.required.length
    || manifest.projects.some(value => typeof value !== 'string' || !value.trim())
    || new Set(manifest.projects).size !== manifest.projects.length
    || manifest.required.some(value => !object(value) || typeof value.id !== 'string'
      || !/^[a-z][a-z0-9-]*$/.test(value.id) || !manifest.projects.includes(value.project)
      || typeof value.reason !== 'string' || !value.reason.trim())
    || new Set(manifest.required.map(value => identity(value.project, value.id))).size !== manifest.required.length
    || manifest.projects.some(project => !manifest.required.some(value => value.project === project))) {
    return { errors: [problem('MANIFEST_FORMAT', 'Require unique projects and reviewed, nonempty identities with reasons.')], cases: [] };
  }
  if (!object(report) || !Array.isArray(report.suites) || !Array.isArray(report.errors)
    || !object(report.config) || !Array.isArray(report.config.projects)
    || report.config.projects.some(value => !object(value) || typeof value.name !== 'string')
    || !object(report.stats) || ['expected', 'unexpected', 'flaky', 'skipped'].some(key => !Number.isInteger(report.stats[key]) || report.stats[key] < 0)) {
    return { errors: [problem('REPORT_FORMAT', 'Require a complete Playwright JSON report, including config, suites, errors and stats.')], cases: [] };
  }
  const cases = [];
  function visit(suites) {
    for (const suite of suites) {
      if (!object(suite) || !Array.isArray(suite.specs) || (suite.suites !== undefined && !Array.isArray(suite.suites))) {
        errors.push(problem('REPORT_FORMAT', 'A suite has an invalid shape.'));
        continue;
      }
      for (const spec of suite.specs) {
        if (!object(spec) || typeof spec.title !== 'string' || !Array.isArray(spec.tags)
          || spec.tags.some(tag => typeof tag !== 'string') || !Array.isArray(spec.tests)) {
          errors.push(problem('REPORT_FORMAT', 'A test specification has an invalid shape.'));
          continue;
        }
        // Playwright 1.64's JSON reporter removes the leading @ from source tags.
        // Accept either representation so the identity is independent of that prefix.
        const ids = spec.tags.map(tag => tag.replace(/^@/, '')).filter(tag => tag.startsWith('gate:')).map(tag => tag.slice(5));
        if (ids.length > 1) errors.push(problem('MULTIPLE_IDENTITIES', `${spec.title} claims multiple required IDs.`));
        for (const test of spec.tests) {
          if (!object(test) || typeof test.projectName !== 'string' || !test.projectName
            || !['skipped', 'expected', 'unexpected', 'flaky'].includes(test.status)
            || !['passed', 'failed', 'timedOut', 'skipped', 'interrupted'].includes(test.expectedStatus)
            || !Array.isArray(test.results) || !Array.isArray(test.annotations)
            || test.annotations.some(value => !object(value) || typeof value.type !== 'string')
            || test.results.some(result => !object(result)
              || !['passed', 'failed', 'timedOut', 'skipped', 'interrupted'].includes(result.status)
              || !Number.isInteger(result.retry) || result.retry < 0 || !Array.isArray(result.errors))) {
            errors.push(problem('REPORT_FORMAT', `${spec.title} has malformed execution evidence.`));
            continue;
          }
          cases.push({ ...test, title: spec.title, id: ids[0], key: identity(test.projectName, ids[0]) });
        }
      }
      visit(suite.suites || []);
    }
  }
  visit(report.suites);
  // A truncated/failure-only report must not quietly lose successful or skipped cases.
  for (const status of ['expected', 'unexpected', 'flaky', 'skipped']) {
    if (cases.filter(test => test.status === status).length !== report.stats[status]) {
      errors.push(problem('REPORT_INTEGRITY', `The ${status} summary does not match the complete test entries.`));
    }
  }
  return { errors, cases };
}

/** CG-01 reference solution: independent required inventory and identity checks. */
export function validateInventory(manifest, report) {
  const { errors, cases } = readEvidence(manifest, report);
  if (errors.length) return finish(errors);
  const required = new Set(manifest.required.map(test => identity(test.project, test.id)));
  for (const project of manifest.projects) {
    if (!report.config.projects.some(value => value.name === project) || !cases.some(test => test.projectName === project)) {
      errors.push(problem('PROJECT_MISSING', `Required project ${project} has no reported cases.`));
    }
  }
  const seen = new Set();
  for (const test of cases.filter(test => test.id !== undefined)) {
    if (seen.has(test.key)) errors.push(problem('DUPLICATE_IDENTITY', `${test.key} is claimed more than once.`));
    seen.add(test.key);
    if (!required.has(test.key)) errors.push(problem('UNKNOWN_IDENTITY', `${test.key} is not in the reviewed manifest.`));
  }
  for (const key of required) {
    if (!seen.has(key)) errors.push(problem('REQUIRED_MISSING', `Required case ${key} is absent.`));
  }
  return finish(errors);
}

/** CG-02 reference solution: required outcomes and every actual attempt. */
export function validateOutcomes(manifest, report) {
  const { errors, cases } = readEvidence(manifest, report);
  if (errors.length) return finish(errors);
  if (report.errors.length) errors.push(problem('RUN_ERROR', 'Playwright reported an error outside an individual test.'));
  const required = new Set(manifest.required.map(test => identity(test.project, test.id)));
  for (const test of cases) {
    if (test.status === 'flaky') errors.push(problem('FLAKY_RESULT', `${test.key}: passing on retry is not a clean pass.`));
    if (test.status === 'unexpected') errors.push(problem('UNEXPECTED_RESULT', `${test.key}: ${test.title} had an unexpected outcome.`));
    if (test.expectedStatus === 'failed' || test.annotations.some(item => item.type === 'fail')) {
      errors.push(problem('EXPECTED_FAILURE', `${test.key}: an expected-failure annotation cannot waive this gate.`));
    }
    if (required.has(test.key)) {
      if (test.expectedStatus === 'skipped' || test.status === 'skipped' || test.results.some(result => result.status === 'skipped')) {
        errors.push(problem('REQUIRED_SKIPPED', `${test.key}: required behavior did not execute.`));
      } else if (test.expectedStatus !== 'passed' || test.status !== 'expected') {
        errors.push(problem('REQUIRED_NOT_PASSED', `${test.key}: the required case did not pass normally.`));
      }
    }
    // Check attempt evidence as well as the aggregate label. This also rejects
    // empty results, interrupted/time-out attempts, and a concealed prior failure.
    const allowedSkip = !required.has(test.key) && test.status === 'skipped'
      && test.results.length === 1 && test.results[0].status === 'skipped';
    const cleanPass = test.expectedStatus === 'passed' && test.status === 'expected'
      && test.results.length === 1 && test.results[0].status === 'passed'
      && test.results[0].retry === 0 && test.results[0].errors.length === 0
      && !test.results[0].error;
    if (!allowedSkip && !cleanPass) {
      errors.push(problem('ATTEMPT_NOT_CLEAN', `${test.key}: require one successful first attempt or an optional skipped starter.`));
    }
  }
  return finish(errors);
}

export function validateCoverage(manifest, report) {
  const inventory = validateInventory(manifest, report);
  if (inventory.errors.some(error => ['MANIFEST_FORMAT', 'REPORT_FORMAT', 'REPORT_INTEGRITY'].includes(error.code))) return inventory;
  return finish([...inventory.errors, ...validateOutcomes(manifest, report).errors]);
}

// Usage: node workplace/gates/worked-gate.mjs manifest.json results.json
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const [, , manifestPath, reportPath] = process.argv;
    if (!manifestPath || !reportPath) throw new Error('Usage: worked-gate.mjs <manifest.json> <results.json>');
    const result = validateCoverage(JSON.parse(await readFile(manifestPath, 'utf8')), JSON.parse(await readFile(reportPath, 'utf8')));
    console.log(JSON.stringify(result, null, 2));
    process.exitCode = result.ok ? 0 : 1;
  } catch (error) {
    console.error(`Gate input rejected: ${error.message}`);
    process.exitCode = 1;
  }
}
