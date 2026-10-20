import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = resolve(import.meta.dirname, '../..');
const require = createRequire(import.meta.url);
const args = process.argv.slice(2);
const prove = args.includes('--prove-gate');
const practice = args.includes('--practice');
const stageIndex = args.indexOf('--stage');
const stage = stageIndex < 0 ? 'inventory' : args[stageIndex + 1];
const recognized = args.filter((value, index) => !['--prove-gate', '--practice', '--stage'].includes(value)
  && !(stageIndex >= 0 && index === stageIndex + 1));
if (recognized.length || !['inventory', 'outcomes'].includes(stage) || (stageIndex >= 0 && !practice)) {
  throw new Error('Usage: node workplace/gates/run.mjs [--prove-gate] [--practice [--stage inventory|outcomes]]');
}
const modulePath = join(import.meta.dirname, practice ? `starter-${stage}.mjs` : 'worked-gate.mjs');
const { validateCoverage } = await import(pathToFileURL(modulePath).href);
const manifest = JSON.parse(await readFile(join(import.meta.dirname, 'required-suite.json'), 'utf8'));
const parent = join(root, 'quality-results/workplace-gates');
await mkdir(parent, { recursive: true });
// Fresh directories prevent an old green report from satisfying a failed new run.
const runDirectory = await mkdtemp(join(parent, 'run-'));
const scenarios = [
  { name: 'baseline', exit: 0, codes: [] },
  { name: 'omitted-project', exit: 0, codes: ['PROJECT_MISSING', 'REQUIRED_MISSING'], flags: ['--project=gate-smoke'], inventory: true },
  { name: 'omitted-case', exit: 0, codes: ['REQUIRED_MISSING'], flags: ['--grep-invert=@gate:stock'], inventory: true },
  { name: 'duplicate-id', exit: 0, codes: ['DUPLICATE_IDENTITY'], inventory: true },
  { name: 'skipped-required', exit: 0, codes: ['REQUIRED_SKIPPED'] },
  { name: 'expected-failed', exit: 0, codes: ['EXPECTED_FAILURE'] },
  { name: 'failed', exit: 1, codes: ['UNEXPECTED_RESULT', 'ATTEMPT_NOT_CLEAN'] },
  { name: 'flaky', exit: 0, codes: ['FLAKY_RESULT', 'ATTEMPT_NOT_CLEAN'] },
  { name: 'global-error', exit: 1, codes: ['RUN_ERROR'] },
  { name: 'extra-failure', exit: 1, codes: ['UNEXPECTED_RESULT'] },
];
const selected = !prove ? scenarios.slice(0, 1)
  : practice && stage === 'inventory' ? scenarios.filter(item => item.name === 'baseline' || item.inventory) : scenarios;
const summary = [];
try {
  for (const scenario of selected) {
    const directory = join(runDirectory, scenario.name);
    await mkdir(directory, { recursive: true });
    let log = '';
    const runnerExit = await new Promise((resolveExit, reject) => {
      const child = spawn(process.execPath, [require.resolve('@playwright/test/cli'), 'test',
        '--config=workplace/gates/playwright.config.ts', ...(scenario.flags || [])], {
        cwd: root,
        env: {
          ...process.env,
          PORT: process.env.PORT || '14830',
          FORGE_GATE_OUTPUT: directory,
          FORGE_GATE_SCENARIO: scenario.name,
          // Explicit destination wins even if the invoking shell had reporter variables.
          PLAYWRIGHT_JSON_OUTPUT_FILE: join(directory, 'results.json'),
        },
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      child.stdout.on('data', data => { log += data.toString(); });
      child.stderr.on('data', data => { log += data.toString(); });
      child.once('error', reject);
      child.once('close', code => resolveExit(code ?? -1));
    });
    await writeFile(join(directory, 'runner.log'), log);
    if (runnerExit !== scenario.exit) {
      throw new Error(`${scenario.name}: expected Playwright exit ${scenario.exit}, received ${runnerExit}; inspect ${join(directory, 'runner.log')}`);
    }
    const report = JSON.parse(await readFile(join(directory, 'results.json'), 'utf8'));
    const result = await validateCoverage(manifest, report);
    if (!result || typeof result.ok !== 'boolean' || !Array.isArray(result.errors)
      || result.ok !== (result.errors.length === 0)) {
      throw new Error(`${scenario.name}: validator must return consistent { ok, errors: [{ code, message }] }.`);
    }
    await writeFile(join(directory, 'gate.json'), JSON.stringify(result, null, 2) + '\n');
    const codes = [...new Set(result.errors.map(error => error.code))];
    const mustPass = scenario.name === 'baseline';
    if (result.ok !== mustPass || scenario.codes.some(code => !codes.includes(code))
      || codes.includes('REPORT_FORMAT') || codes.includes('REPORT_INTEGRITY')) {
      throw new Error(`${scenario.name}: expected ${mustPass ? 'acceptance' : scenario.codes.join(', ')}, received ${codes.join(', ') || 'acceptance'}. See ${join(directory, 'gate.json')}`);
    }
    // Ensure the intentionally bad scenarios were produced by the planned cause,
    // not an unrelated crash, unavailable server, or different failing assertion.
    const serialized = JSON.stringify(report);
    const marker = {
      'skipped-required': 'CONTROLLED_GATE_REQUIRED_SKIP',
      'expected-failed': 'CONTROLLED_GATE_CHECKOUT_FAILURE',
      failed: 'CONTROLLED_GATE_CHECKOUT_FAILURE',
      flaky: 'CONTROLLED_GATE_CHECKOUT_FAILURE',
      'global-error': 'CONTROLLED_GATE_GLOBAL_ERROR',
      'extra-failure': 'CONTROLLED_GATE_EXTRA_FAILURE',
    }[scenario.name];
    if (marker && !serialized.includes(marker)) throw new Error(`${scenario.name}: controlled cause is absent from the real report.`);
    if (scenario.name !== 'global-error' && report.errors.length) throw new Error(`${scenario.name}: unexpected run-level errors invalidate this proof.`);
    summary.push({ scenario: scenario.name, runnerExit, gate: result.ok ? 'accepted' : 'rejected', codes });
    console.log(`${scenario.name}: Playwright exit ${runnerExit}; gate ${result.ok ? 'accepted' : `rejected (${codes.join(', ')})`}.`);
  }
  console.log(`${practice ? `CG-${stage === 'inventory' ? '01' : '02'} learner` : 'Worked'} gate verified across ${summary.length} real run${summary.length === 1 ? '' : 's'}.`);
} catch (error) {
  console.error(error.message);
  if (practice) console.error('The starter intentionally fails until you implement it. Keep the manifest and controlled scenarios intact.');
  process.exitCode = 1;
} finally {
  await writeFile(join(runDirectory, 'summary.json'), JSON.stringify(summary, null, 2) + '\n');
  console.log(`Gate evidence: ${runDirectory}`);
}
