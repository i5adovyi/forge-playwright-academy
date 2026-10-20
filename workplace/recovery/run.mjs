import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { mkdir, mkdtemp, readFile, writeFile, stat } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';

const require = createRequire(import.meta.url);
const root = resolve(import.meta.dirname, '../..');
const args = process.argv.slice(2);
const modes = ['--solutions', '--practice', '--proof'];
const selected = args.filter(value => modes.includes(value));
if (selected.length > 1) throw new Error('Choose one recovery mode.');
const mode = selected[0] || '--solutions';
const enabled = args.includes('--enable-starters');
const defects = ['dedupe-off', 'regenerate-key', 'conflict-accepted', 'false-absence', 'unbounded-lookups'];
const defectArguments = args.filter(value => value.startsWith('--defect='));
if (defectArguments.length > 1) throw new Error('Choose one controlled defect.');
const defect = defectArguments[0]?.slice('--defect='.length) || 'none';
if (defect !== 'none' && !defects.includes(defect)) throw new Error(`Unknown defect ${defect}.`);
const forwarded = args.filter(value => !modes.includes(value) && value !== '--enable-starters' && !value.startsWith('--defect='));
if (mode === '--proof' && (enabled || defect !== 'none' || forwarded.length)) {
  throw new Error('The proof owns its exact complete inventory; omit additional flags.');
}
if (enabled && mode !== '--practice') throw new Error('--enable-starters belongs to --practice.');
const parent = join(root, 'quality-results/recovery');
await mkdir(parent, { recursive: true });
const directory = await mkdtemp(join(parent, 'run-'));
const sourceFiles = ['server.mjs', 'shop.html', 'helper.ts', 'helper.starter.ts', 'support.ts',
  'worked.spec.ts', 'practice.spec.ts', 'playwright.config.ts', 'run.mjs'];
const hash = createHash('sha256');
for (const name of sourceFiles) { hash.update(name); hash.update(await readFile(join(import.meta.dirname, name))); }
await writeFile(join(directory, 'run-info.json'), JSON.stringify({
  generatedAt: new Date().toISOString(), node: process.version,
  playwright: require('@playwright/test/package.json').version, mode, defect, enabledStarters: enabled,
  sourceFiles, sourceSHA256: hash.digest('hex'),
}, null, 2));

async function run(label, project = 'recovery-solutions', fault = 'none', extra = [], enable = false) {
  const output = join(directory, label);
  await mkdir(output, { recursive: true });
  const transcript = [];
  const code = await new Promise((resolveExit, reject) => {
    const child = spawn(process.execPath, [require.resolve('@playwright/test/cli'), 'test',
      '--config=workplace/recovery/playwright.config.ts', `--project=${project}`, ...extra], {
      cwd: root,
      env: {
        ...process.env, FORGE_RECOVERY_RUN_DIR: output, FORGE_RECOVERY_FAULT: fault,
        FORGE_RECOVERY_ENABLE_STARTERS: enable ? '1' : '0',
        PLAYWRIGHT_JSON_OUTPUT_FILE: join(output, 'results.json'), PLAYWRIGHT_HTML_OPEN: 'never',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    for (const stream of [child.stdout, child.stderr]) stream.on('data', chunk => { transcript.push(chunk); process.stdout.write(chunk); });
    child.once('error', reject);
    child.once('exit', (exitCode, signal) => resolveExit(signal ? 128 : exitCode ?? 1));
  });
  await writeFile(join(output, 'console.log'), Buffer.concat(transcript));
  return { code, output };
}
const cases = [
  'LR-01 API · committed response disappears and the same key recovers one order',
  'LR-01 browser · an uncertain purchase offers an explicit same-intent retry',
  'LR-02 replay · equivalent payload property order returns the original result',
  'LR-02 conflict · changed payload with the same key is rejected without mutation',
  'LR-02 scope · another customer and another key each create legitimate operations',
  'LR-03 uncertain · pending forever exhausts three lookups without another write',
  'LR-03 committed · a delayed lookup result resolves within the read budget',
  'LR-03 absent · an authoritative unused key is different from an unresolved key',
  'LR-01 exhausted API · two lost replies stop without a third write',
  'LR-01 exhausted browser · a second lost reply prevents another purchase attempt',
];
const starters = [
  'LR-01 starter · recover one purchase in the API and browser',
  'LR-02 starter · replay, payload conflict and customer/key scope',
  'LR-03 starter · uncertain, eventually visible and absent outcomes',
];
const flatten = suites => suites.flatMap(suite => [...(suite.specs || []), ...flatten(suite.suites || [])]);
async function verify(result, inventory, status, marker) {
  assert.equal(result.code, status === 'failed' ? 1 : 0, 'Unexpected exit: runner failures are not a successful proof.');
  const report = JSON.parse(await readFile(join(result.output, 'results.json'), 'utf8'));
  assert.deepEqual(report.errors, [], 'Top-level infrastructure errors do not prove the recovery oracle.');
  const specs = flatten(report.suites);
  assert.deepEqual(specs.map(spec => spec.title).sort(), [...inventory].sort(), 'Exact independent case inventory changed.');
  const outcomes = new Map();
  for (const spec of specs) {
    assert.equal(spec.tests.length, 1);
    const execution = spec.tests[0];
    assert.equal(execution.expectedStatus, status === 'skipped' ? 'skipped' : 'passed', 'Do not mask failures with test.fail().');
    assert.equal(execution.results.length, 1, 'Retries cannot hide a first failed attempt.');
    const outcome = execution.results[0];
    assert.equal(outcome.status, status);
    assert.equal(outcome.retry, 0);
    if (status === 'failed') {
      assert.equal(outcome.errors.length, 1);
      const expectedMarker = marker || `${spec.title.slice(0, 5)}_STARTER_NOT_IMPLEMENTED:`;
      assert.ok(outcome.errors[0].message.includes(expectedMarker), `Wrong failure: expected ${expectedMarker}.`);
    } else assert.equal(outcome.errors?.length || 0, 0);
    if (status !== 'skipped') {
      const trace = outcome.attachments.find(item => item.name === 'trace');
      assert.ok(trace?.path, 'A fresh trace is required.');
      assert.ok((await stat(trace.path)).size > 0);
      const attachment = outcome.attachments.find(item => item.name === 'persisted-journal');
      assert.ok(attachment?.path || attachment?.body, 'Persisted journal evidence is required.');
      const contents = attachment.path ? await readFile(attachment.path, 'utf8')
        : Buffer.from(attachment.body, 'base64').toString('utf8');
      outcomes.set(spec.title, JSON.parse(contents));
    }
  }
  return outcomes;
}
function assertLoss(data) {
  const commit = data.journal.find(event => event.type === 'committed');
  const lost = data.journal.find(event => event.type === 'reply-lost-after-commit');
  assert.ok(commit && lost && commit.sequence < lost.sequence, 'Commit must exist on disk before the deliberately lost response.');
  assert.equal(commit.order.id, lost.orderId);
}
let exitCode = 1;
try {
  if (mode !== '--proof') {
    const result = await run(mode.slice(2), mode === '--practice' ? 'recovery-practice' : 'recovery-solutions', defect, forwarded, enabled);
    exitCode = result.code;
  } else {
    const control = await verify(await run('01-control'), cases, 'passed');
    for (const title of [cases[0], cases[1], cases[5], cases[6], cases[8], cases[9]]) assertLoss(control.get(title));
    for (const title of [cases[0], cases[1], cases[8], cases[9]]) {
      const data = control.get(title);
      assert.equal(data.writes, 2);
      assert.equal(data.orders.length, 1);
      assert.equal(new Set(data.journal.filter(event => event.type === 'write-attempt').map(event => event.key)).size, 1);
    }
    for (const title of [cases[8], cases[9]]) {
      const data = control.get(title);
      assert.equal(data.journal.filter(event => event.type === 'committed').length, 1);
      assert.equal(data.journal.filter(event => event.type === 'reply-lost-on-replay').length, 1);
    }
    assert.equal(control.get(cases[5]).lookups, 3);
    assert.equal(control.get(cases[5]).writes, 1);
    await verify(await run('02-skipped-starters', 'recovery-practice'), starters, 'skipped');
    await verify(await run('03-enabled-starters', 'recovery-practice', 'none', [], true), starters, 'failed');
    const experiments = [
      { fault: 'dedupe-off', index: 0, marker: 'LR01_SINGLE_EFFECT', inspect(data) {
        assertLoss(data); assert.equal(data.orders.length, 2);
        assert.equal(new Set(data.journal.filter(event => event.type === 'write-attempt').map(event => event.key)).size, 1);
      } },
      { fault: 'regenerate-key', index: 0, marker: 'LR01_SINGLE_EFFECT', inspect(data) {
        assertLoss(data); assert.equal(data.orders.length, 2);
        assert.equal(new Set(data.journal.filter(event => event.type === 'write-attempt').map(event => event.key)).size, 2);
      } },
      { fault: 'conflict-accepted', index: 3, marker: 'LR02_CONFLICT_STATUS', inspect(data) {
        assert.equal(data.orders.length, 1); assert.equal(data.journal.filter(event => event.type === 'replay').length, 1);
        assert.equal(data.journal.filter(event => event.type === 'conflict').length, 0);
      } },
      { fault: 'false-absence', index: 5, marker: 'LR03_BOUNDED_UNCERTAIN', inspect(data) {
        assertLoss(data); assert.equal(data.lookups, 1); assert.equal(data.writes, 1);
        assert.equal(data.journal.at(-1).state, 'absent');
      } },
      { fault: 'unbounded-lookups', index: 5, marker: 'LR03_BOUNDED_UNCERTAIN', inspect(data) {
        assertLoss(data); assert.equal(data.lookups, 4); assert.equal(data.writes, 1);
      } },
    ];
    for (const experiment of experiments) {
      const title = cases[experiment.index];
      const result = await run(`04-${experiment.fault}`, 'recovery-solutions', experiment.fault,
        ['--grep', title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')]);
      const data = (await verify(result, [title], 'failed', experiment.marker)).get(title);
      assert.equal(data.fault, experiment.fault);
      assert.ok(data.journal.some(event => event.type === 'control' && event.fault === experiment.fault));
      experiment.inspect(data);
    }
    await writeFile(join(directory, 'proof.json'), JSON.stringify({
      result: 'proven', normalCases: cases, starterAssignments: ['LR-01', 'LR-02', 'LR-03'],
      deliberateFailures: experiments.map(({ fault, marker }) => ({ fault, marker })),
      unfinishedStarters: '3 skipped by default; all 3 fail their exact sentinel when enabled',
      limitation: 'Synthetic loopback service, process-lifetime idempotency ledger; no crash-recovery or universal exactly-once guarantee.',
    }, null, 2));
    console.log('Recovery proof passed: 10 controls, 3 starter sentinels and 5 independently evidenced detected defects.');
    exitCode = 0;
  }
} finally { console.log(`Fresh recovery evidence: ${directory}`); }
process.exitCode = exitCode;
