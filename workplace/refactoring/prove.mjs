import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { mkdir, mkdtemp, readFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';

const require = createRequire(import.meta.url);
const root = resolve(import.meta.dirname, '../..');
const parent = join(root, 'quality-results/refactoring-proof');
await mkdir(parent, { recursive: true });
const directory = await mkdtemp(join(parent, 'run-'));
const flatten = suites => suites.flatMap(s => [...(s.specs || []), ...flatten(s.suites || [])]);
const requiredCases = [
  'workplace/refactoring/baseline.spec.ts::RF-01 baseline · headphone cart',
  'workplace/refactoring/baseline.spec.ts::RF-01 baseline · lamp cart',
  'workplace/refactoring/baseline.spec.ts::RF-02 baseline · locators survive both rerenders',
  'workplace/refactoring/worked.spec.ts::RF-01 solution · Studio Headphones cart',
  'workplace/refactoring/worked.spec.ts::RF-01 solution · Focus Lamp cart',
  'workplace/refactoring/worked.spec.ts::RF-02 solution · locators survive both rerenders',
].sort();
for (const [mode, fault] of [['control', '0'], ['price-fault', '1']]) {
  const runDir = join(directory, mode);
  const exitCode = await new Promise((resolveExit, reject) => {
    const child = spawn(process.execPath, [require.resolve('@playwright/test/cli'), 'test',
      '--config=workplace/refactoring/proof.config.ts'], {
      cwd: root, stdio: 'inherit',
      env: { ...process.env, PLAYWRIGHT_JSON_OUTPUT_FILE: join(runDir, 'results.json'), PORT: process.env.PORT || '14832', FORGE_RF_PRICE_FAULT: fault, FORGE_RF_PROOF_DIR: runDir },
    });
    child.once('error', reject);
    child.once('exit', code => resolveExit(code ?? 1));
  });
  const report = JSON.parse(await readFile(join(runDir, 'results.json'), 'utf8'));
  const specs = flatten(report.suites);
  const identities = specs.map(spec => `${spec.file.replaceAll('\\', '/')}::${spec.title}`).sort();
  const inventoryMatches = JSON.stringify(identities) === JSON.stringify(requiredCases);
  const allExpected = specs.length === 6 && specs.every(spec =>
    spec.tests.length === 1 && spec.tests[0].results.length === 1
    && spec.tests[0].results[0].status === (fault === '1' ? 'failed' : 'passed')
    && (fault === '0' || spec.tests[0].results[0].errors.some(error => error.message?.includes('RF_CART_TOTAL_ORACLE'))));
  if (exitCode !== (fault === '1' ? 1 : 0) || report.errors.length || !inventoryMatches || !allExpected) {
    throw new Error(`${mode}: expected exactly six ${fault === '1' ? 'price-oracle failures' : 'passing cases'}; inspect ${runDir}`);
  }
}
console.log(`Refactor proven: all 3 baseline and 3 worked cases pass normally and detect the same +$1 UI total fault. Evidence: ${directory}`);
