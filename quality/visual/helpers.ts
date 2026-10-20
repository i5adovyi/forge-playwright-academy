import { expect, type Page } from '@playwright/test';

export const visualSnapshots = {
  desktop: 'vs-01-desktop.png',
  mobile: 'vs-02-mobile-expanded.png',
  masked: 'vs-03-masked.png',
  summary: 'vs-04-order-summary.png',
} as const;

/** No sleeps: fix the date before app code runs, wait for local fonts and ready UI. */
export async function openVisualLab(page: Page, options: { defect?: boolean; mobile?: boolean } = {}) {
  await page.setViewportSize(options.mobile ? { width: 390, height: 844 } : { width: 1100, height: 800 });
  await page.clock.setFixedTime(new Date('2026-10-20T12:00:00.000Z'));
  const url = `/quality/visual/${options.defect ? '?defect=total' : ''}`;
  await page.goto(url);
  await expect(page.getByRole('heading', { name: 'Your workspace, ready.' })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-ready', 'true');
  await page.evaluate(async () => {
    await Promise.all([
      document.fonts.load('400 16px ForgeAtkinson'),
      document.fonts.load('700 16px ForgeAtkinson'),
    ]);
    await document.fonts.ready;
    if (!document.fonts.check('400 16px ForgeAtkinson') || !document.fonts.check('700 16px ForgeAtkinson')) {
      throw new Error('Bundled visual fixture fonts did not load. Do not approve fallback-font baselines.');
    }
  });
  await expect(page.getByTestId('order-total')).toHaveText('$79.20');
  await expect(page.locator('#review-date')).toHaveText('20 October 2026');
  await page.mouse.move(0, 0);
}
