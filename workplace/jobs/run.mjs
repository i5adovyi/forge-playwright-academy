import { mkdir, mkdtemp, readFile, writeFile, stat } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { spawn, execFileSync } from 'node:child_process';
import { join, resolve } from 'node:path';
import assert from 'node:assert/strict';

const root = resolve(import.meta.dirname, '../..');
const require = createRequire(import.meta.url);
const args = process.argv.slice(2);
const proof = args.includes('--proof');
const practice = args.includes('--practice');
const enabled = args.includes('--enable-starters');
const forwarded = args.filter(value => !['--proof', '--practice', '--enable-starters'].includes(value));
if (proof && (practice || enabled || forwarded.length)) throw new Error('--proof runs a fixed reference experiment. Omit extra flags.');
if (enabled && !practice) throw new Error('--enable-starters belongs to --practice.');
const parent = join(root, 'quality-results/jobs');
await mkdir(parent, { recursive: true });
const directory = await mkdtemp(join(parent, 'run-'));
const names = [
  'AJ-01 API correlates one submission with the completed report',
  'AJ-01 browser shows the correlated report and exact business values',
  'AJ-02 terminal failure reports its cause before the deadline',
  'AJ-03 stalled job exhausts the observation deadline without resubmission',
  'AJ-03 status identity mismatch is rejected before artifact access',
  'AJ-03 successful status with another jobs artifact is rejected',
  'AJ-03 status read ceiling is independent of the time budget',
  'AJ-03 held response respects its request limit and allows cleanup',
  'AJ-03 remaining deadline caps a longer request timeout',
  'AJ-03 browser preserves unknown outcome and resumes the same job without writing',
];
const flatten = suites => suites.flatMap(suite => [...(suite.specs || []), ...flatten(suite.suites || [])]);
const sources = ['server.mjs', 'app.js', 'index.html', 'observer.ts', 'observer.starter.ts', 'fixtures.ts',
  'cases.ts', 'worked.spec.ts', 'practice.spec.ts', 'playwright.config.ts', 'run.mjs'];
const hash = createHash('sha256');
for (const name of sources) hash.update(name).update(await readFile(join(root, 'workplace/jobs', name)));
let commit = 'Source archive without Git metadata';
try { commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch {}
await writeFile(join(directory, 'run-info.json'), JSON.stringify({
  generatedAt: new Date().toISOString(), commit, node: process.version,
  playwright: require('@playwright/test/package.json').version, sourceSHA256: hash.digest('hex'),
  sources, mode: proof ? 'proof' : practice ? 'practice' : 'worked',
}, null, 2));

async function run(label, { fault = '', starter = false, enable = false, grep, extra = [] } = {}) {
  const output = join(directory, label);
  await mkdir(output, { recursive: true });
  const transcript = [];
  const code = await new Promise((resolveExit, reject) => {
    const child = spawn(process.execPath, [require.resolve('@playwright/test/cli'), 'test',
      '--config=workplace/jobs/playwright.config.ts', `--project=${starter ? 'jobs-practice' : 'jobs-worked'}`,
      ...(grep ? ['--grep', grep] : []), ...extra,
    ], {
      cwd: root,
      env: { ...process.env, JOBS_FAULT: fault, JOBS_ENABLE_STARTERS: enable ? '1' : '0', JOBS_RESULTS_DIR: output,
        PLAYWRIGHT_JSON_OUTPUT_FILE: join(output, 'results.json'),
        PLAYWRIGHT_HTML_OUTPUT_DIR: join(output, 'report'), PLAYWRIGHT_HTML_OPEN: 'never' },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    for (const stream of [child.stdout, child.stderr]) stream.on('data', chunk => {
      transcript.push(chunk); process.stdout.write(chunk);
    });
    child.on('error', reject);
    child.on('exit', (exitCode, signal) => resolveExit(signal ? 128 : exitCode ?? 1));
  });
  await writeFile(join(output, 'console.log'), Buffer.concat(transcript));
  return { code, output };
}
async function verify(result, titles, marker, starter = false) {
  assert.equal(result.code, marker ? 1 : 0, 'Unexpected runner exit; an infrastructure error is not fault evidence.');
  const report = JSON.parse(await readFile(join(result.output, 'results.json'), 'utf8'));
  assert.deepEqual(report.errors, [], 'Runner errors cannot prove a controlled defect.');
  assert.equal(resolve(report.config.rootDir), join(root, 'workplace/jobs'));
  const specs = flatten(report.suites);
  assert.deepEqual(specs.map(spec => `${spec.file}::${spec.title}`).sort(),
    titles.map(title => `cases.ts::${title}`).sort(),
    'Proof requires the complete independent case inventory.');
  const evidence = new Map();
  for (const spec of specs) {
    assert.equal(spec.tests.length, 1);
    const execution = spec.tests[0];
    assert.equal(execution.projectName, starter ? 'jobs-practice' : 'jobs-worked');
    assert.equal(execution.expectedStatus, 'passed', 'Do not use test.fail to convert a defective result to green.');
    assert.equal(execution.results.length, 1, 'Retries must not hide the first result.');
    assert.equal(execution.status, marker ? 'unexpected' : 'expected');
    const outcome = execution.results[0];
    assert.equal(outcome.retry, 0);
    assert.equal(outcome.status, marker ? 'failed' : 'passed');
    assert.equal(outcome.errors.length, marker ? 1 : 0);
    if (marker) assert.ok(outcome.errors[0].message.includes(marker), `${spec.title}: unrelated failure is not proof.`);
    for (const name of ['trace', 'job-evidence']) {
      const attachment = outcome.attachments.find(item => item.name === name);
      assert.ok(attachment?.path, `Missing fresh ${name} evidence for ${spec.title}`);
      assert.ok((await stat(attachment.path)).size > 0);
      if (name === 'job-evidence') evidence.set(spec.title, JSON.parse(await readFile(attachment.path, 'utf8')));
    }
    if (spec.title === names[2] && !starter) {
      const attachment = outcome.attachments.find(item => item.name === 'observation-error');
      assert.ok(attachment?.path);
      evidence.set(`${spec.title}::error`, JSON.parse(await readFile(attachment.path, 'utf8')));
    }
  }
  return evidence;
}
let code = 1;
try {
  if (proof) {
    await verify(await run('01-control'), names);
    const wrongArtifact = await verify(await run('02-wrong-artifact', { fault: 'wrong-artifact', grep: 'AJ-01 API' }),
      [names[0]], 'JOB_ARTIFACT_ORACLE');
    assert.equal(wrongArtifact.get(names[0]).artifacts.length, 1);
    assert.equal(wrongArtifact.get(names[0]).artifacts[0].summary.totalCents, 1);
    assert.equal(wrongArtifact.get(names[0]).jobs[0].state, 'succeeded');
    const repeatedWrites = await verify(await run('03-post-inside-poll', { fault: 'post-inside-poll', grep: 'AJ-01 API' }),
      [names[0]], 'JOB_SINGLE_WRITE_ORACLE');
    assert.ok(repeatedWrites.get(names[0]).writes.length > 1);
    assert.equal(repeatedWrites.get(names[0]).writes.length, repeatedWrites.get(names[0]).jobs.length);
    const ignoredFailure = await verify(await run('04-ignore-terminal-failure', { fault: 'ignore-terminal-failure', grep: 'AJ-02' }),
      [names[2]], 'JOB_TERMINAL_CODE_ORACLE');
    assert.ok(ignoredFailure.get(names[2]).reads.length > 1);
    assert.ok(ignoredFailure.get(names[2]).reads.every(read => read.state === 'failed'));
    assert.equal(ignoredFailure.get(names[2]).artifactReads, 0);
    assert.equal(ignoredFailure.get(`${names[2]}::error`).code, 'OBSERVATION_DEADLINE',
      'A later transport error must not masquerade as ignored-terminal-failure evidence.');
    assert.equal(ignoredFailure.get(`${names[2]}::error`).evidence.lastState, 'failed');
    await verify(await run('05-unfinished-starters', { starter: true, enable: true }),
      names, 'AJ_STARTER_NOT_IMPLEMENTED', true);
    await writeFile(join(directory, 'proof.json'), JSON.stringify({
      result: 'proven', assignments: ['AJ-01', 'AJ-02', 'AJ-03'], referenceCases: names.length,
      controlledFaults: ['wrong-artifact', 'post-inside-poll', 'ignore-terminal-failure'],
      unfinishedStarterCasesRejected: names.length,
    }, null, 2));
    console.log(`Jobs proof passed: ten controls, three exact mutant failures, ten rejected untouched starters. Evidence: ${directory}`);
    code = 0;
  } else {
    const result = await run(practice ? 'practice' : 'worked', { starter: practice, enable: enabled, extra: forwarded });
    console.log(`Jobs report: ${join(result.output, 'report/index.html')}`);
    code = result.code;
  }
} catch (error) {
  console.error(error);
  console.error(`Inspect fresh evidence in ${directory}`);
}
process.exitCode = code;
