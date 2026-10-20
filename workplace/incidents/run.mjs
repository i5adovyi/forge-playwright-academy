import { mkdir, mkdtemp, readFile, writeFile, stat } from 'node:fs/promises';
import { spawn, execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { resolve, join } from 'node:path';
import assert from 'node:assert/strict';

const require = createRequire(import.meta.url);
const root = resolve(import.meta.dirname, '../..');
const arguments_ = process.argv.slice(2);
const modes = ['--broken', '--solutions', '--practice', '--prove'];
const selected = arguments_.filter(value => modes.includes(value));
if (selected.length > 1) throw new Error('Choose one incident mode.');
const mode = selected[0] || '--solutions';
const enabled = arguments_.includes('--enable-starters');
const faults = arguments_.includes('--with-defects');
const forwarded = arguments_.filter(value => !modes.includes(value)
  && !['--enable-starters', '--with-defects'].includes(value));
if (mode === '--prove' && (forwarded.length || enabled || faults)) {
  throw new Error('The proof runs its fixed complete experiment; omit extra flags.');
}
if (enabled && mode !== '--practice') throw new Error('--enable-starters belongs to --practice.');
if (faults && !['--practice', '--solutions'].includes(mode)) {
  throw new Error('--with-defects belongs to --practice or --solutions.');
}
const parent = join(root, 'quality-results/incidents');
await mkdir(parent, { recursive: true });
const runDirectory = await mkdtemp(join(parent, 'run-'));
const sourceFiles = [
  ...['broken.spec.ts', 'worked.spec.ts', 'practice.spec.ts', 'support.ts', 'playwright.config.ts', 'run.mjs']
    .map(name => `workplace/incidents/${name}`),
  'server.mjs', 'lab/app.js', 'tests/support/fixtures.ts', 'package-lock.json',
];
const hash = createHash('sha256');
for (const name of sourceFiles) {
  hash.update(name);
  hash.update(await readFile(join(root, name)));
}
let commit = 'unavailable: source ZIP without Git metadata';
let worktreeDirty = null;
try {
  const options = { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] };
  commit = execFileSync('git', ['rev-parse', 'HEAD'], options).trim();
  worktreeDirty = execFileSync('git', ['status', '--porcelain'], options).trim().length > 0;
} catch {}
await writeFile(join(runDirectory, 'run-info.json'), JSON.stringify({
  generatedAt: new Date().toISOString(), node: process.version,
  playwright: require('@playwright/test/package.json').version,
  commit, worktreeDirty, sourceFiles, incidentSourceSHA256: hash.digest('hex'),
  mode, enabledStarters: enabled, controlledDefects: faults,
  // No environment dump: credentials do not belong in diagnostic artifacts.
}, null, 2));

async function run(label, project, extraEnv = {}, args = []) {
  const directory = join(runDirectory, label);
  await mkdir(directory, { recursive: true });
  const transcript = [];
  const code = await new Promise((resolveExit, reject) => {
    const child = spawn(process.execPath, [
      require.resolve('@playwright/test/cli'), 'test',
      '--config=workplace/incidents/playwright.config.ts', `--project=${project}`, ...args,
    ], {
      cwd: root,
      env: {
        ...process.env,
        // Always overwrite inherited fault toggles; the command owns the experiment.
        FORGE_INCIDENT_DEFECTS: '0', FORGE_INCIDENT_ENABLE_STARTERS: '0',
        ...extraEnv, FORGE_INCIDENT_RUN_DIR: directory,
        // Reporter environment settings otherwise take precedence over config.
        PLAYWRIGHT_JSON_OUTPUT_FILE: join(directory, 'results.json'),
        PLAYWRIGHT_HTML_OUTPUT_DIR: join(directory, 'report'),
        PLAYWRIGHT_HTML_OPEN: 'never',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    for (const stream of [child.stdout, child.stderr]) {
      stream.on('data', data => { transcript.push(data); process.stdout.write(data); });
    }
    child.once('error', reject);
    child.once('exit', (exitCode, signal) => resolveExit(signal ? 128 : exitCode ?? 1));
  });
  await writeFile(join(directory, 'console.log'), Buffer.concat(transcript));
  console.log(`Incident report: ${join(directory, 'report/index.html')}`);
  return { code, directory };
}

const flatten = suites => suites.flatMap(suite => [...(suite.specs || []), ...flatten(suite.suites || [])]);
const businessMarkers = {
  'IN-01': 'IN-01_CART_BADGE:', 'IN-02': 'IN-02_OWN_CART:', 'IN-03': 'IN-03_FILTERED_NAMES:',
};
const stripAnsi = value => value.replace(/\u001b\[[0-9;]*m/g, '');

async function verify(result, expected, starter = false) {
  assert.equal(result.code, expected === 'passed' ? 0 : 1, 'Unexpected runner exit; infrastructure errors are not a proven fault.');
  const report = JSON.parse(await readFile(join(result.directory, 'results.json'), 'utf8'));
  assert.deepEqual(report.errors, [], 'Top-level runner errors are not incident evidence.');
  const specs = flatten(report.suites);
  assert.equal(specs.length, 3, 'The proof must execute exactly the three incident cases.');
  const byId = new Map();
  for (const spec of specs) {
    const id = spec.title.slice(0, 5);
    assert.ok(Object.hasOwn(businessMarkers, id), `Unknown incident ${id}`);
    assert.equal(byId.has(id), false, `Duplicate incident ${id}`);
    assert.equal(spec.tests.length, 1);
    const execution = spec.tests[0];
    assert.equal(execution.expectedStatus, 'passed', 'Do not annotate these failures as test.fail().');
    assert.equal(execution.status, expected === 'passed' ? 'expected' : 'unexpected');
    assert.equal(execution.results.length, 1, 'Retries cannot hide the first outcome.');
    const outcome = execution.results[0];
    assert.equal(outcome.retry, 0);
    assert.equal(outcome.status, expected);
    assert.equal(outcome.errors.length, expected === 'passed' ? 0 : 1);
    if (expected !== 'passed') {
      const marker = starter ? `${id}_STARTER_NOT_IMPLEMENTED:` : businessMarkers[id];
      assert.ok(stripAnsi(outcome.errors[0].message).startsWith(`Error: ${marker}`),
        `${id} failed somewhere other than its expected assertion.`);
    }
    const trace = outcome.attachments.find(attachment => attachment.name === 'trace');
    assert.ok(trace?.path, `${id} must have a freshly generated trace.`);
    assert.ok((await stat(trace.path)).size > 0, `${id} trace must not be empty.`);
    byId.set(id, outcome);
  }
  return byId;
}

async function attachment(outcomes, id, name) {
  const item = outcomes.get(id)?.attachments.find(value => value.name === name);
  assert.ok(item?.path, `Missing ${id} ${name} evidence.`);
  return JSON.parse(await readFile(item.path, 'utf8'));
}

let exitCode = 1;
try {
  if (mode === '--prove') {
    const broken = await verify(await run('01-broken', 'incident-broken'), 'failed');
    const denied = await attachment(broken, 'IN-01', 'setup-response');
    assert.equal(denied.status, 409);
    assert.equal(denied.body.error.code, 'INSUFFICIENT_STOCK');
    const shared = await attachment(broken, 'IN-02', 'context-identities-and-carts');
    assert.equal(shared.separateBrowserContexts, true);
    assert.equal(shared.firstHeader, shared.secondHeader);
    assert.deepEqual(shared.firstCart, shared.secondCart);
    assert.deepEqual(shared.firstCart.items.map(item => item.productId), ['p1', 'p2']);
    const premature = await attachment(broken, 'IN-03', 'premature-dom-snapshot');
    assert.deepEqual(premature.events, ['filtered request intercepted; response held']);
    assert.equal(premature.observed.length, 6);
    const delivered = await attachment(broken, 'IN-03', 'catalogue-response');
    assert.deepEqual(delivered.body.products.map(item => item.id), ['p1']);

    const solutions = await verify(await run('02-solutions', 'incident-solutions'), 'passed');
    assert.equal((await attachment(solutions, 'IN-01', 'setup-response')).status, 200);
    const independent = await attachment(solutions, 'IN-02', 'context-identities-and-carts');
    assert.notEqual(independent.firstHeader, independent.secondHeader);
    assert.deepEqual(independent.firstCart.items.map(item => item.productId), ['p1']);
    assert.deepEqual(independent.secondCart.items.map(item => item.productId), ['p2']);

    const mutants = await verify(await run('03-controlled-defects', 'incident-solutions', {
      FORGE_INCIDENT_DEFECTS: '1',
    }), 'failed');
    assert.equal((await attachment(mutants, 'IN-01', 'setup-response')).status, 200);
    const missingItem = await attachment(mutants, 'IN-01', 'controlled-cart-response-1');
    assert.equal(missingItem.kind, 'missing-item');
    assert.equal(missingItem.deliveredStatus, 200);
    assert.deepEqual(missingItem.body.items, []);
    const leakedItem = await attachment(mutants, 'IN-02', 'controlled-cart-response-1');
    assert.equal(leakedItem.kind, 'other-customer-item');
    assert.equal(leakedItem.deliveredStatus, 200);
    assert.deepEqual(leakedItem.body.items.map(item => item.productId), ['p1', 'p2']);
    assert.equal(leakedItem.body.total, 21800);
    const wrongList = await attachment(mutants, 'IN-03', 'catalogue-response');
    assert.deepEqual(wrongList.body.products.map(item => item.id), ['p2']);
    assert.deepEqual(await attachment(mutants, 'IN-03', 'response-order'), [
      'filtered request intercepted; response held', 'test released response', 'filtered response delivered',
    ]);
    await verify(await run('04-unfinished-starters', 'incident-practice', {
      FORGE_INCIDENT_ENABLE_STARTERS: '1',
    }), 'failed', true);

    await writeFile(join(runDirectory, 'proof.json'), JSON.stringify({
      result: 'proven', incidents: ['IN-01', 'IN-02', 'IN-03'],
      broken: '3 exact business-assertion failures with causal evidence',
      solutions: '3 passed without retries',
      controlledDefects: '3 exact business-assertion failures after repair',
      unfinishedStarters: '3 explicit not-implemented failures',
    }, null, 2));
    console.log('Incident proof passed: 3 diagnosed failures, 3 repairs, 3 detected response defects, and 3 unfinished-starter sentinels.');
    exitCode = 0;
  } else {
    const projects = {
      '--broken': 'incident-broken', '--solutions': 'incident-solutions', '--practice': 'incident-practice',
    };
    const result = await run(mode.slice(2), projects[mode], {
      FORGE_INCIDENT_ENABLE_STARTERS: enabled ? '1' : '0',
      FORGE_INCIDENT_DEFECTS: faults ? '1' : '0',
    }, forwarded);
    exitCode = result.code;
  }
} finally {
  console.log(`Fresh incident evidence: ${runDirectory}`);
}
process.exitCode = exitCode;
