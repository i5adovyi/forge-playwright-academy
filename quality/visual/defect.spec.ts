import { test, expect } from '@playwright/test';
import { openVisualLab, visualSnapshots } from './helpers';

test('VS-04 · controlled price styling defect MUST fail the unchanged baseline', async ({ page }, testInfo) => {
  if (testInfo.config.updateSnapshots !== 'none') {
    throw new Error('Defect mode refuses baseline updates. Keep the reviewed oracle unchanged.');
  }
  await openVisualLab(page, { defect: true });
  // A text assertion alone misses this CSS regression: the exact amount is unchanged.
  await expect(page.getByTestId('order-total')).toHaveText('$79.20');
  await expect(page.getByTestId('order-summary')).toHaveScreenshot(visualSnapshots.summary);
});
