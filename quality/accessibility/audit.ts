import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, type TestInfo } from '@playwright/test';

export type ScanResult = Awaited<ReturnType<AxeBuilder['analyze']>>;

/** Same scope and default rule configuration in healthy, defective, and repaired states. */
export async function scanComponent(page: Page, testInfo: TestInfo, label: string, scope = '#signup-panel') {
  await expect(page.locator(scope)).toBeVisible();
  const result = await new AxeBuilder({ page }).include(scope).analyze();
  // Keep passes, incomplete, engine metadata and node evidence, not just failures.
  await testInfo.attach(`${label}-axe.json`, {
    body: JSON.stringify({ scope, ...result }, null, 2),
    contentType: 'application/json',
  });
  return result;
}

/** This exact oracle is called before the defect, during it, and after repair. */
export function assertCleanScan(result: ScanResult) {
  expect(result.violations, 'The scanned component must have no axe-detectable violations.').toEqual([]);
}

/** Prove the original zero-violation oracle really rejects the controlled defect. */
export async function proveOracleRejects(result: ScanResult, testInfo: TestInfo, label: string) {
  let rejection: string | undefined;
  try { assertCleanScan(result); }
  catch (error) { rejection = error instanceof Error ? error.message : String(error); }
  expect(rejection, 'The original clean-scan assertion must reject the defective app.').toBeTruthy();
  await testInfo.attach(`${label}-oracle-rejection.json`, {
    body: JSON.stringify({ oracle: 'expect(result.violations).toEqual([])', rejected: Boolean(rejection), diagnostic: rejection }, null, 2),
    contentType: 'application/json',
  });
}
