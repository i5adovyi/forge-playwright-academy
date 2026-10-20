import test from 'node:test';
import assert from 'node:assert/strict';
import { validateCoverage, validateInventory } from './worked-gate.mjs';

// These synthetic fixtures exercise malformed evidence that Playwright should
// not normally emit. The scenario runner separately proves real reporter output.
function evidence() {
  return {
    manifest: { version: 1, projects: ['critical'], required: [{ project: 'critical', id: 'buy', reason: 'Purchases must work.' }] },
    report: {
      config: { projects: [{ name: 'critical' }] },
      suites: [{ specs: [{
        title: 'purchase', tags: ['gate:buy'], tests: [{
          projectName: 'critical', expectedStatus: 'passed', status: 'expected', annotations: [],
          results: [{ status: 'passed', retry: 0, errors: [] }],
        }],
      }] }],
      errors: [], stats: { expected: 1, unexpected: 0, flaky: 0, skipped: 0 },
    },
  };
}
const single = report => report.suites[0].specs[0].tests[0];
function rejects(mutator, code) {
  const input = evidence();
  mutator(input);
  const result = validateCoverage(input.manifest, input.report);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some(error => error.code === code), `Expected ${code}; received ${JSON.stringify(result.errors)}`);
}

test('accepts a complete clean required run', () => {
  const { manifest, report } = evidence();
  assert.deepEqual(validateCoverage(manifest, report), { ok: true, errors: [] });
});
test('walks nested suites instead of inspecting only the top level', () => {
  const { manifest, report } = evidence();
  report.suites = [{ specs: [], suites: report.suites }];
  assert.equal(validateCoverage(manifest, report).ok, true);
});
test('normalizes an optional @ prefix without losing tag identity', () => {
  const { manifest, report } = evidence();
  report.suites[0].specs[0].tags = ['@gate:buy'];
  assert.equal(validateCoverage(manifest, report).ok, true);
});
test('refuses an empty or duplicate independently reviewed manifest', () => {
  rejects(({ manifest }) => { manifest.required = []; }, 'MANIFEST_FORMAT');
  rejects(({ manifest }) => { manifest.required.push({ ...manifest.required[0] }); }, 'MANIFEST_FORMAT');
});
test('refuses missing top-level report fields', () => {
  rejects(({ report }) => { delete report.errors; }, 'REPORT_FORMAT');
  rejects(({ report }) => { delete report.stats; }, 'REPORT_FORMAT');
});
test('refuses malformed execution evidence and incomplete summary', () => {
  rejects(({ report }) => { single(report).results[0].errors = null; }, 'REPORT_FORMAT');
  rejects(({ report }) => { report.stats.expected = 20; }, 'REPORT_INTEGRITY');
});
test('empty actual results cannot masquerade as a clean expected result', () => {
  rejects(({ report }) => { single(report).results = []; }, 'ATTEMPT_NOT_CLEAN');
});
test('a hidden failed attempt or nonzero retry cannot masquerade as a clean pass', () => {
  rejects(({ report }) => { single(report).results.unshift({ status: 'failed', retry: 0, errors: [{ message: 'first failure' }] }); }, 'ATTEMPT_NOT_CLEAN');
  rejects(({ report }) => { single(report).results[0].retry = 1; }, 'ATTEMPT_NOT_CLEAN');
});
test('timed out and interrupted attempts fail even with an expected aggregate label', () => {
  for (const status of ['timedOut', 'interrupted']) {
    rejects(({ report }) => { single(report).results[0].status = status; }, 'ATTEMPT_NOT_CLEAN');
  }
});
test('unexpected outcomes outside the manifest still fail', () => {
  rejects(({ report }) => {
    report.suites[0].specs.push({
      title: 'additional coverage', tags: [], tests: [{
        projectName: 'critical', expectedStatus: 'passed', status: 'unexpected', annotations: [],
        results: [{ status: 'failed', retry: 0, errors: [{ message: 'broken behavior' }] }],
      }],
    });
    report.stats.unexpected = 1;
  }, 'UNEXPECTED_RESULT');
});
test('duplicate claims and unknown IDs cannot substitute for reviewed coverage', () => {
  rejects(({ report }) => {
    report.suites[0].specs.push(structuredClone(report.suites[0].specs[0]));
    report.stats.expected = 2;
  }, 'DUPLICATE_IDENTITY');
  rejects(({ report }) => { report.suites[0].specs[0].tags = ['@gate:unreviewed']; }, 'REQUIRED_MISSING');
});
test('one test cannot claim two required identities', () => {
  rejects(({ report }) => { report.suites[0].specs[0].tags.push('@gate:other'); }, 'MULTIPLE_IDENTITIES');
});
test('a legitimate optional skipped starter does not block release', () => {
  const { manifest, report } = evidence();
  report.suites[0].specs.push({
    title: 'unfinished exercise', tags: [], tests: [{
      projectName: 'critical', expectedStatus: 'skipped', status: 'skipped', annotations: [{ type: 'skip' }],
      results: [{ status: 'skipped', retry: 0, errors: [] }],
    }],
  });
  report.stats.skipped = 1;
  assert.equal(validateCoverage(manifest, report).ok, true);
});
test('inventory alone makes no claim that required cases passed', () => {
  const { manifest, report } = evidence();
  single(report).status = 'skipped';
  single(report).expectedStatus = 'skipped';
  single(report).results[0].status = 'skipped';
  report.stats = { expected: 0, unexpected: 0, flaky: 0, skipped: 1 };
  assert.equal(validateInventory(manifest, report).ok, true);
  assert.equal(validateCoverage(manifest, report).ok, false);
});
