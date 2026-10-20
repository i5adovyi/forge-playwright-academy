import { test, expect } from '@playwright/test';
import { openVisualLab, visualSnapshots } from './helpers';

test('VS-01 · Stable desktop baseline', async ({ page }) => {
  await openVisualLab(page);
  await expect(page.getByRole('heading', { name: 'Focus Lamp' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Desk Mat' })).toBeVisible();
  await expect(page).toHaveScreenshot(visualSnapshots.desktop, { fullPage: true });
});

test('VS-02 · Mobile expanded summary', async ({ page }) => {
  await openVisualLab(page, { mobile: true });
  await expect(page.getByTestId('order-lines')).toBeHidden();
  await page.getByRole('button', { name: 'Show order details' }).click();
  await expect(page.getByRole('button', { name: 'Hide order details' })).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByTestId('order-lines')).toContainText('Focus Lamp × 1');
  await expect(page.getByTestId('order-lines')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.mouse.move(0, 0);
  await expect(page).toHaveScreenshot(visualSnapshots.mobile, { fullPage: true });
});

test('VS-03 · Mask only volatile metadata', async ({ page }, testInfo) => {
  await openVisualLab(page);
  const token = page.getByTestId('render-token');
  const importantPixels = page.getByTestId('order-summary');
  const before = await importantPixels.screenshot({ animations: 'disabled' });
  await expect(token).toHaveText('RUN-0001');
  await expect(page).toHaveScreenshot(visualSnapshots.masked, { fullPage: true, mask: [token] });
  await page.getByRole('button', { name: 'Refresh receipt reference' }).click();
  await expect(token).toHaveText('RUN-0002');
  await expect(page.getByTestId('order-total')).toHaveText('$79.20');
  // The refresh changes only metadata. No money, line items or controls were masked.
  const after = await importantPixels.screenshot({ animations: 'disabled' });
  if (!after.equals(before)) {
    await testInfo.attach('summary-before-reference-refresh', { body: before, contentType: 'image/png' });
    await testInfo.attach('summary-after-reference-refresh', { body: after, contentType: 'image/png' });
  }
  expect(after.equals(before), 'Refreshing a reference must not change the order summary pixels').toBe(true);
  await page.mouse.move(0, 0);
  await expect(page).toHaveScreenshot(visualSnapshots.masked, { fullPage: true, mask: [token] });
});

test('VS-04 · Review a controlled visual regression', async ({ page }) => {
  await openVisualLab(page);
  // A component baseline makes the price's visual hierarchy an explicit review contract.
  await expect(page.getByTestId('order-summary')).toHaveScreenshot(visualSnapshots.summary);
  // Deliberate-red proof: npm run test:visual:defect. It uses this exact baseline unchanged.
});
