import { spawn, execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { mkdir, mkdtemp, readFile, writeFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, join } from 'node:path';
import assert from 'node:assert/strict';

const require = createRequire(import.meta.url);
const root = resolve(import.meta.dirname, '../..');
const args = process.argv.slice(2);
const practice = args.includes('--practice');
const proof = args.includes('--prove');
const enabled = args.includes('--enable-starters') || (practice && proof);
const forwarded = args.filter(value => !['--practice', '--prove', '--enable-starters'].includes(value));
if (proof && forwarded.length) throw new Error('A proof must run its full reviewed inventory; omit filters and other flags.');
if (enabled && !practice) throw new Error('--enable-starters belongs to --practice.');
const parent = join(root, 'quality-results/preflight');
await mkdir(parent, { recursive: true });
const directory = await mkdtemp(join(parent, 'run-'));
const required = JSON.parse(await readFile(join(import.meta.dirname, 'required-cases.json'), 'utf8')).sort();
assert.equal(required.length, 21);
assert.equal(new Set(required).size, required.length);
const files = [
  'expected-release.json', 'required-cases.json', 'server.mjs', 'contracts.ts', 'helpers.ts', 'helpers.starter.ts',
  'acceptance.ts', 'mutants.ts', 'worked.spec.ts', 'practice.spec.ts', 'playwright.config.ts', 'run.mjs',
];
const hash = createHash('sha256');
for (const file of files) { hash.update(file); hash.update(await readFile(join(import.meta.dirname, file))); }
let commit = 'Source archive without Git metadata';
try { commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch {}
await writeFile(join(directory, 'run-info.json'), JSON.stringify({
  generatedAt: new Date().toISOString(), commit, sourceSHA256: hash.digest('hex'),
  node: process.version, playwright: require('@playwright/test/package.json').version,
  practice, proof, enabled, files,
}, null, 2));
const flatten = suites => suites.flatMap(suite => [...(suite.specs || []), ...flatten(suite.suites || [])]);
async function run(label, mutant = '') {
  const output = join(directory, label);
  await mkdir(output, { recursive: true });
  const transcript = [];
  const code = await new Promise((resolveExit, reject) => {
    const child = spawn(process.execPath, [require.resolve('@playwright/test/cli'), 'test',
      '--config=workplace/preflight/playwright.config.ts',
      `--project=preflight-${practice ? 'practice' : 'worked'}`, ...forwarded], {
      cwd: root,
      env: {
        ...process.env, FORGE_PREFLIGHT_OUTPUT: output, FORGE_PREFLIGHT_MUTANT: mutant,
        FORGE_PREFLIGHT_ENABLE_STARTERS: enabled ? '1' : '0',
        PLAYWRIGHT_JSON_OUTPUT_FILE: join(output, 'results.json'),
        PLAYWRIGHT_HTML_OUTPUT_DIR: join(output, 'report'), PLAYWRIGHT_HTML_OPEN: 'never',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    for (const stream of [child.stdout, child.stderr]) stream.on('data', chunk => {
      transcript.push(chunk); process.stdout.write(chunk);
    });
    child.once('error', reject);
    child.once('exit', (value, signal) => resolveExit(signal ? 128 : value ?? 1));
  });
  await writeFile(join(output, 'console.log'), Buffer.concat(transcript));
  return { code, output };
}
async function verify(result, failures = new Map()) {
  assert.equal(result.code, failures.size ? 1 : 0, 'Unexpected runner exit; infrastructure failure is not a detected mutation.');
  const report = JSON.parse(await readFile(join(result.output, 'results.json'), 'utf8'));
  assert.deepEqual(report.errors, [], 'Top-level runner errors invalidate the experiment.');
  const specs = flatten(report.suites);
  assert.deepEqual(specs.map(spec => spec.title).sort(), required, 'Missing, duplicate or renamed acceptance case.');
  for (const spec of specs) {
    assert.equal(spec.tests.length, 1);
    const test = spec.tests[0];
    const marker = failures.get(spec.title);
    assert.equal(test.expectedStatus, 'passed', 'Expected-failure annotations cannot waive required checks.');
    assert.equal(test.status, marker ? 'unexpected' : 'expected');
    assert.equal(test.results.length, 1, 'A retry must not erase the first outcome.');
    const attempt = test.results[0];
    assert.equal(attempt.retry, 0);
    assert.equal(attempt.status, marker ? 'failed' : 'passed', `${spec.title}: incorrect outcome`);
    assert.equal(attempt.errors.length, marker ? 1 : 0);
    if (marker) assert.ok(attempt.errors[0].message.includes(`Error: ${marker}:`), `${spec.title}: failure occurred outside its intended oracle.`);
    const trace = attempt.attachments.find(item => item.name === 'trace');
    assert.ok(trace?.path && (await stat(trace.path)).size > 0, `${spec.title}: missing fresh trace`);
    const evidence = attempt.attachments.find(item => item.name === (
      spec.title.startsWith('WB-01') ? 'identity-evidence' :
      spec.title.startsWith('WB-02') ? 'dependency-evidence' : 'guard-and-write-ledger'));
    assert.ok(evidence?.path && (await stat(evidence.path)).size > 0, `${spec.title}: missing diagnostic evidence`);
  }
}
try {
  if (!proof) {
    process.exitCode = (await run(practice ? 'practice' : 'worked')).code;
  } else {
    await verify(await run('01-control'));
    if (!practice) {
      const experiments = [
        ['02-trust-health', 'trust-health', required.filter(title => title.startsWith('WB-01') && title !== 'WB-01 correct release'), 'WB-01_IDENTITY'],
        ['03-collapse-errors', 'collapse-errors', [
          'WB-02 unexpected product response', 'WB-02 malformed success body', 'WB-02 connection reset',
        ], 'WB-02_CLASSIFICATION'],
        ['04-write-first', 'write-first', [
          'WB-03 wrong build makes zero writes', 'WB-03 wrong origin makes zero writes',
        ], 'WB-03_WRITE_GATE'],
      ];
      for (const [label, mutant, titles, marker] of experiments) {
        await verify(await run(label, mutant), new Map(titles.map(title => [title, marker])));
      }
    }
    await writeFile(join(directory, 'proof.json'), JSON.stringify({
      result: 'proven', requiredCases: required,
      candidate: practice ? 'learner helpers' : 'reference helpers',
      controlledMutations: practice ? [] : [
        'trust-health: 12 exact identity failures', 'collapse-errors: 3 exact classification failures',
        'write-first: 2 exact write-gate failures',
      ],
    }, null, 2));
    console.log(practice
      ? 'Preflight learner acceptance proven: all 21 cases passed without retries or skips.'
      : 'Preflight proven: 21 controls passed; 3 weakened helpers caused exactly 17 named failures.');
  }
} finally {
  console.log(`Fresh preflight evidence: ${directory}`);
}
