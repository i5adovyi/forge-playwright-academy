import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';

const require = createRequire(import.meta.url);
const root = resolve(import.meta.dirname, '../..');
const parent = join(root, 'quality-results/builders-proof');
await mkdir(parent, { recursive: true });
const directory = await mkdtemp(join(parent, 'run-'));
const original = await readFile(join(root, 'server.mjs'), 'utf8');
const needle = 'value.trim().length <= max';
if (original.split(needle).length !== 2) throw new Error('Validation fault anchor changed; inspect the server contract before updating this proof.');
const mutant = join(directory, 'server-without-length-limit.mjs');
await writeFile(mutant, original.replace(needle, 'true /* controlled missing length limit */'));
const flatten = suites => suites.flatMap(s => [...(s.specs || []), ...flatten(s.suites || [])]);
// An independent discovery contract: do not import the test's parameter table.
// Exact identities catch one omitted case replaced with a duplicate or unrelated
// case, even if the total count is still 50.
const requiredTitles = [
  'DB-01 · Every default and override owns its nested data',
  'DB-01 · Input builder supports a real discounted order',
  ...['name', 'address', 'city', 'postalCode'].flatMap(field => [
    ...['omitted', 'empty', 'whitespace', 'number', 'boolean', 'null', 'object', 'array', 'over maximum']
      .map(example => `DB-02 · ${field} rejects ${example} without mutation`),
    ...['one character', 'exact maximum', 'padded maximum']
      .map(example => `DB-02 · ${field} accepts ${example}`),
  ]),
].sort();

for (const mode of ['control', 'shared-default', 'missing-length-limit']) {
  const runDir = join(directory, mode);
  const exitCode = await new Promise((resolveExit, reject) => {
    const child = spawn(process.execPath, [require.resolve('@playwright/test/cli'), 'test',
      '--config=workplace/builders/proof.config.ts'], {
      cwd: root, stdio: 'inherit',
      env: {
        ...process.env, PLAYWRIGHT_JSON_OUTPUT_FILE: join(runDir, 'results.json'), PORT: process.env.PORT || '14832',
        FORGE_DB_PROOF_DIR: runDir,
        FORGE_DB_SHARED_DEFAULT_FAULT: mode === 'shared-default' ? '1' : '0',
        FORGE_DB_PROOF_SERVER: mode === 'missing-length-limit' ? mutant : join(root, 'server.mjs'),
      },
    });
    child.once('error', reject);
    child.once('exit', code => resolveExit(code ?? 1));
  });
  const report = JSON.parse(await readFile(join(runDir, 'results.json'), 'utf8'));
  const specs = flatten(report.suites);
  const inventoryMatches = specs.every(spec => spec.file.replaceAll('\\', '/') === 'workplace/builders/worked.spec.ts')
    && JSON.stringify(specs.map(spec => spec.title).sort()) === JSON.stringify(requiredTitles);
  const expectedFailures = mode === 'shared-default' ? 1 : mode === 'missing-length-limit' ? 4 : 0;
  const failures = specs.filter(spec => spec.tests.some(test => test.results.some(result => result.status === 'failed')));
  const exactOutcomes = specs.length === 50 && specs.every(spec => {
    const mustFail = mode === 'shared-default'
      ? spec.title.startsWith('DB-01 · Every default')
      : mode === 'missing-length-limit' && spec.title.includes('rejects over maximum');
    const result = spec.tests[0]?.results[0];
    return spec.tests.length === 1 && spec.tests[0].results.length === 1
      && result.status === (mustFail ? 'failed' : 'passed')
      && (!mustFail || result.errors.some(error => error.message?.includes(
        mode === 'shared-default' ? 'DB_SHARED_DEFAULT_ORACLE' : 'DB_ADDRESS_STATUS_ORACLE')));
  });
  if (exitCode !== (expectedFailures ? 1 : 0) || report.errors.length || !inventoryMatches || failures.length !== expectedFailures || !exactOutcomes) {
    throw new Error(`${mode}: expected 50 cases and exactly ${expectedFailures} specific failures; inspect ${runDir}`);
  }
}
console.log(`Builder proof passed: 50 controls; shared-data bug rejected; all four missing upper bounds rejected. Evidence: ${directory}`);
