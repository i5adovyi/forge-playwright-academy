import { test, expect } from '@playwright/test';

test('system theme follows the OS until an explicit choice is saved', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/#/docs');
  const theme = page.getByRole('combobox', { name: 'Color theme' });
  await expect(theme).toHaveValue('system');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(21, 27, 23)');
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await theme.selectOption('dark');
  await page.reload();
  await expect(theme).toHaveValue('dark');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.goto('/#/manual/BEGINNER-START');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await theme.selectOption('light');
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await theme.selectOption('system');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await expect(theme).toBeHidden();
});

test('theme is keyboard accessible on mobile and leaves saved lesson work intact', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto('/#/lesson/00-04');
  await page.getByLabel('Your field notes').fill('Keep my practice observations.');
  await expect.poll(() => page.evaluate(() => localStorage.getItem('forge-academy-v1'))).toContain('Keep my practice observations.');
  const before = await page.evaluate(() => localStorage.getItem('forge-academy-v1'));
  const theme = page.getByRole('combobox', { name: 'Color theme' });
  await page.getByRole('button', { name: 'Search academy' }).focus();
  await page.keyboard.press('Tab');
  await expect(theme).toBeFocused();
  // Native select type-ahead works without platform-specific popup shortcuts.
  await page.keyboard.press('d');
  await page.keyboard.press('Tab');
  await expect(theme).toHaveValue('dark');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  expect(await page.evaluate(() => localStorage.getItem('forge-academy-v1'))).toBe(before);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.reload();
  await expect(page.getByLabel('Your field notes')).toHaveValue('Keep my practice observations.');
});

test('unavailable appearance storage does not prevent switching or opening lessons', async ({ page }) => {
  await page.addInitScript(() => {
    const get = Storage.prototype.getItem, set = Storage.prototype.setItem;
    Storage.prototype.getItem = function (key) { if (key === 'forge-color-theme-v1') throw new DOMException('Blocked', 'SecurityError'); return get.call(this, key); };
    Storage.prototype.setItem = function (key, value) { if (key === 'forge-color-theme-v1') throw new DOMException('Blocked', 'QuotaExceededError'); return set.call(this, key, value); };
  });
  await page.goto('/#/docs');
  await page.getByRole('combobox', { name: 'Color theme' }).selectOption('dark');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('#theme-status')).toContainText('lasts for this visit');
  await page.goto('/#/lesson/00-01');
  await expect(page.getByRole('heading', { name: 'Your computer is the workshop', exact: true })).toBeVisible();
});

test('theme selection updates other tabs without reloading their lesson', async ({ context, page }) => {
  await page.goto('/#/docs');
  const other = await context.newPage();
  await other.goto('/#/beginner');
  await page.getByRole('combobox', { name: 'Color theme' }).selectOption('dark');
  await expect(other.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(other.getByRole('combobox', { name: 'Color theme' })).toHaveValue('dark');
  await expect(other).toHaveURL(/#\/beginner$/);
});
