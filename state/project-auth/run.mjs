import { mkdtemp, mkdir, readFile, rm, access } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { resolve, join } from 'node:path';

const require = createRequire(import.meta.url);
const root = resolve(import.meta.dirname, '../..');
const parent = join(root, 'quality-results/state-auth');
await mkdir(parent, { recursive: true });
const runDirectory = await mkdtemp(join(parent, 'run-'));
const authFile = join(runDirectory, '.auth/member.json');
const input = process.argv.slice(2);
const proveGate = input.includes('--prove-gate');
const args = input.filter(value => value !== '--prove-gate');
if (proveGate && args.length) throw new Error('The gate proof runs the fixed complete dependency graph; omit other flags.');
const env = {
  ...process.env,
  FORGE_AUTH_RUN_DIR: runDirectory,
  ...(proveGate ? { FORGE_AUTH_SETUP_FAIL: '1' } : {}),
};
let exitCode = 1;
try {
  exitCode = await new Promise((resolveExit, reject) => {
    const child = spawn(process.execPath, [require.resolve('@playwright/test/cli'), 'test', '--config=playwright.state-auth.config.ts', ...args], {
      cwd: root, env, stdio: 'inherit',
    });
    child.once('error', reject);
    child.once('exit', code => resolveExit(code ?? 1));
  });
  if (proveGate) {
    const report = JSON.parse(await readFile(join(runDirectory, 'results.json'), 'utf8'));
    const all = suites => suites.flatMap(suite => [...(suite.specs || []), ...all(suite.suites || [])]);
    const specs = all(report.suites);
    const setup = specs.find(spec => spec.title.startsWith('setup:'));
    const consumer = specs.find(spec => spec.title.startsWith('member:'));
    const guest = specs.find(spec => spec.title.startsWith('guest:'));
    const cleanup = specs.find(spec => spec.title.startsWith('cleanup:'));
    const results = spec => (spec?.tests || []).flatMap(test => test.results || []);
    const passed = spec => results(spec).length === 1 && results(spec)[0].status === 'passed';
    const failed = results(setup);
    const expectedFailure = failed.length === 1 && failed[0].status === 'failed'
      && failed[0].errors?.length === 1
      && failed[0].errors[0].message?.split('\n')[0] === 'Error: CONTROLLED_AUTH_SETUP_FAILURE';
    const blocked = !!consumer && results(consumer).every(result => result.status === 'skipped');
    let removed = false;
    try { await access(authFile); } catch (error) { if (error.code === 'ENOENT') removed = true; else throw error; }
    if (exitCode !== 1 || specs.length !== 4 || report.errors?.length !== 0
      || !expectedFailure || !blocked || !passed(guest) || !passed(cleanup) || !removed) {
      throw new Error('Gate proof failed: require the exact setup failure, a blocked member, passing independent guest/cleanup, and removed snapshot.');
    }
    console.log('Gate proven: setup rejected; member did not execute; guest and cleanup passed; snapshot removed.');
    exitCode = 0;
  }
} finally {
  // Last-resort deletion is separate from the teardown assertion above.
  await rm(join(runDirectory, '.auth'), { recursive: true, force: true });
  console.log(`Workshop report: ${join(runDirectory, 'report', 'index.html')}`);
}
process.exitCode = exitCode;
