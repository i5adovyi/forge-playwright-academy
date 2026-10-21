import { test, expect } from '@playwright/test';

test('a new learner can discover the runway, follow its lessons and find the exact starter command', async ({ page }) => {
  await page.goto('/');
  await page.locator('.beginner-entry').getByRole('link', { name: 'Start from zero' }).click();
  await expect(page.getByRole('heading', { name: 'You do not need to know this yet.' })).toBeVisible();
  await expect(page.locator('.beginner-lessons .lesson-row')).toHaveCount(6);
  await expect(page.locator('[data-practice-id]')).toHaveCount(8);
  await expect(page.locator('.beginner-practice-help')).toContainText('you do not need to start the personal server');
  const laterGuidance = page.locator('details').filter({ has: page.locator('summary', { hasText: 'How this fits the full academy' }) });
  await expect(laterGuidance.locator('.practice-drill-body')).toBeHidden();
  await laterGuidance.locator('summary').click();
  await expect(laterGuidance).toContainText('--enable-starters');
  await laterGuidance.locator('summary').click();
  await page.locator('[data-practice-id="BG-05"] summary').first().click();
  await expect(page.locator('[data-practice-id="BG-05"]')).toContainText('npm run test:beginner:practice -- --grep BG-05');
  const example = page.locator('[data-practice-id="BG-05"]').getByText('Where to compare your solution', { exact: true });
  await example.click();
  await expect(page.locator('[data-practice-id="BG-05"]')).toContainText('npm run test:beginner -- --grep BG-05');
  await expect(page.locator('[data-practice-id="BG-05"]')).toContainText('it does not grade your starter');
  await page.locator('.beginner-lessons').getByRole('link', { name: 'Your first browser test, line by line' }).click();
  await expect(page.getByRole('navigation', { name: 'Beginner lesson navigation' })).toContainText('STEP 4 / 6');
  await page.getByRole('link', { name: 'Next beginner lesson' }).click();
  await expect(page).toHaveURL(/#\/lesson\/00-05$/);
  await page.goto('/#/lesson/00-06');
  await page.getByRole('link', { name: 'Continue into Stage 01' }).click();
  await expect(page).toHaveURL(/#\/lesson\/01-01$/);
  await expect(page.getByRole('heading', { name: 'The automation engineer’s mindset' })).toBeVisible();
});

test('a beginner can distinguish terminal commands, JSON data and TypeScript snippets', async ({ page }) => {
  await page.goto('/#/lesson/00-01');
  const install = page.locator('.code-block').filter({ has: page.locator('code', { hasText: 'npm ci' }) });
  await expect(install.locator('.code-label span')).toHaveText('Terminal');
  await page.goto('/#/lesson/00-03');
  const response = page.locator('.code-block').filter({ has: page.locator('code', { hasText: '"products"' }) });
  await expect(response.locator('.code-label span')).toHaveText('JSON');
  await page.goto('/#/lesson/00-04');
  const commands = page.locator('.code-block').filter({ has: page.locator('code', { hasText: '--headed' }) });
  await expect(commands.locator('.code-label span')).toHaveText('Terminal');
  await page.locator('.beginner-practice-help').getByRole('link', { name: 'first-edit walkthrough and result examples' }).click();
  await expect(page).toHaveURL(/#\/manual\/BEGINNER-START$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Complete beginner guide', exact: true })).toBeVisible();
});

test('the beginner guide and narrow-screen route are usable without a live shop', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#/beginner');
  await page.getByRole('link', { name: 'complete beginner setup guide' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Complete beginner guide', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Windows PowerShell', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.goto('/#/beginner');
  await expect(page.getByRole('link', { name: 'Download the runnable project' })).toHaveAttribute('href', './downloads/forge-academy.zip');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
