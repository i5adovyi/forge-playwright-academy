import { test, expect } from '@playwright/test';
import { assertCleanScan, proveOracleRejects, scanComponent } from './audit';

test.beforeEach(async ({ page }) => {
  await page.goto('/quality/accessibility/');
  await expect(page.getByRole('heading', { name: 'Your next good idea starts here.' })).toBeVisible();
});

test('AX-01 · scoped scan with inspectable evidence', async ({ page }, testInfo) => {
  // These preconditions prevent a clean scan of an empty/wrong component.
  await expect(page.getByRole('textbox', { name: 'Full name (required)', exact: true })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Email address (required)', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Edit workshop preferences' })).toBeVisible();
  const result = await scanComponent(page, testInfo, 'AX-01-initial-signup');
  expect(result.passes.length).toBeGreaterThan(0);
  assertCleanScan(result);
  // Incomplete rules remain attached for human review; they are not "passes".
  await testInfo.attach('AX-01-manual-review.json', {
    body: JSON.stringify({
      scope: '#signup-panel only; closed preferences dialog and training controls excluded by scope',
      incompleteRules: result.incomplete.map(rule => ({ id: rule.id, targets: rule.nodes.map(node => node.target) })),
      manualWorkRemaining: ['Screen-reader names and announcements', 'Visible focus and keyboard order', 'Zoom/reflow', 'Touch target usability'],
      conformanceClaim: false,
    }, null, 2),
    contentType: 'application/json',
  });
});

test('AX-02 · missing-name defect rejects the unchanged oracle, then repair passes', async ({ page }, testInfo) => {
  assertCleanScan(await scanComponent(page, testInfo, 'AX-02-before'));
  await page.getByRole('checkbox', { name: 'Introduce a missing button name' }).check();
  await expect(page.locator('#preferences-open')).toHaveAccessibleName('');
  const broken = await scanComponent(page, testInfo, 'AX-02-defective');
  const nameViolation = broken.violations.find(rule => rule.id === 'button-name');
  expect(nameViolation, 'The deliberately unnamed preferences button must be detected.').toBeDefined();
  expect(nameViolation!.nodes.some(node => node.target.includes('#preferences-open'))).toBe(true);
  await proveOracleRejects(broken, testInfo, 'AX-02');
  await page.getByRole('button', { name: 'Repair both defects' }).click();
  await expect(page.getByRole('button', { name: 'Edit workshop preferences' })).toBeVisible();
  assertCleanScan(await scanComponent(page, testInfo, 'AX-02-repaired'));
});

test('AX-03 · keyboard modal navigation, cancellation and focus return', async ({ page }, testInfo) => {
  const opener = page.getByRole('button', { name: 'Edit workshop preferences' });
  const name = page.getByRole('textbox', { name: 'Full name (required)', exact: true });
  const email = page.getByRole('textbox', { name: 'Email address (required)', exact: true });
  // Anchor a bounded tab-order check; this does not claim to audit the whole page.
  await name.focus();
  await page.keyboard.press('Tab');
  await expect(email).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(name).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(opener).toBeFocused();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Workshop preferences', exact: true });
  const reminders = dialog.getByRole('checkbox', { name: 'Send workshop reminders' });
  await expect(dialog).toBeVisible();
  await expect(reminders).toBeFocused();
  // The modal explicitly wraps both boundaries of its tab order.
  await page.keyboard.press('Shift+Tab');
  await expect(dialog.getByRole('button', { name: 'Cancel', exact: true })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(reminders).toBeFocused();
  await page.keyboard.press('Space');
  await expect(reminders).toBeChecked();
  await page.keyboard.press('Tab');
  await expect(dialog.getByRole('button', { name: 'Save preferences' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(dialog).not.toBeVisible();
  await expect(opener).toBeFocused();
  await expect(page.locator('#preferences-status')).toHaveText('Workshop reminders: on.');
  await page.keyboard.press('Enter');
  await expect(reminders).toBeChecked();
  await page.keyboard.press('Space');
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(opener).toBeFocused();
  // Escape discards the draft instead of silently saving it.
  await page.keyboard.press('Enter');
  await expect(reminders).toBeChecked();
  assertCleanScan(await scanComponent(page, testInfo, 'AX-03-open-dialog', '#preferences-dialog'));
  await page.keyboard.press('Escape');
  await expect(opener).toBeFocused();
});

test('AX-04 · validation states and a real contrast regression', async ({ page }, testInfo) => {
  const name = page.getByRole('textbox', { name: 'Full name (required)', exact: true });
  const email = page.getByRole('textbox', { name: 'Email address (required)', exact: true });
  await page.getByRole('button', { name: 'Join the workshop' }).click();
  const summary = page.getByRole('alert');
  await expect(summary).toBeFocused();
  await expect(summary.getByRole('link')).toHaveCount(2);
  await expect(name).toHaveAttribute('aria-invalid', 'true');
  await expect(name).toHaveAccessibleDescription(/Enter your full name/);
  await expect(email).toHaveAccessibleDescription(/Enter an email address/);
  assertCleanScan(await scanComponent(page, testInfo, 'AX-04-invalid'));
  await summary.getByRole('link', { name: 'Enter your full name.' }).click();
  await expect(name).toBeFocused();
  await name.fill('Alex Tester');
  await email.fill('not-an-email');
  await page.getByRole('button', { name: 'Join the workshop' }).click();
  await expect(summary.getByRole('link')).toHaveCount(1);
  await expect(name).toHaveAttribute('aria-invalid', 'false');
  await email.fill('alex@example.test');
  await page.getByRole('button', { name: 'Join the workshop' }).click();
  await expect(summary).not.toBeVisible();
  await expect(email).toHaveAttribute('aria-invalid', 'false');
  await expect(page.locator('#signup-status')).toContainText("You're on the list, Alex Tester.");
  assertCleanScan(await scanComponent(page, testInfo, 'AX-04-success'));
  await page.getByRole('checkbox', { name: 'Introduce low-contrast text' }).check();
  const broken = await scanComponent(page, testInfo, 'AX-04-low-contrast');
  const contrast = broken.violations.find(rule => rule.id === 'color-contrast');
  expect(contrast, 'The real rendered low-contrast note must be detected.').toBeDefined();
  expect(contrast!.nodes.some(node => node.target.includes('#privacy-note'))).toBe(true);
  await proveOracleRejects(broken, testInfo, 'AX-04');
  await page.getByRole('button', { name: 'Repair both defects' }).click();
  assertCleanScan(await scanComponent(page, testInfo, 'AX-04-repaired'));
});
