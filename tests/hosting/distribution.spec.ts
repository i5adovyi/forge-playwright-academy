import { test, expect } from '@playwright/test';

test('built static portal has lessons and downloads without advertising an unavailable local API', async ({ page, request }) => {
  await page.goto('/#/start');
  await expect(page.locator('main')).toContainText('You are using the static learning portal.');
  await page.goto('/#/lab');
  await expect(page.locator('a[href="/lab/"]')).toHaveCount(0);
  await expect(page.locator('a[href="./downloads/forge-academy.zip"]').first()).toBeVisible();
  await page.goto('/#/curriculum');
  await expect(page.locator('.lesson-row')).toHaveCount(67);
  await page.goto('/#/manual/RUN-ANYWHERE');
  await expect(page.locator('.prose')).toContainText('npm run local');
  await page.getByRole('combobox', { name: 'Color theme' }).selectOption('dark');
  await page.reload();
  await expect(page.getByRole('combobox', { name: 'Color theme' })).toHaveValue('dark');
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(21, 27, 23)');
  const zip = await request.get('/downloads/forge-academy.zip');
  expect(zip.status()).toBe(200);
  expect(zip.headers()['content-type']).toBe('application/zip');
  expect((await zip.body()).subarray(0, 4)).toEqual(Buffer.from([0x50, 0x4b, 0x03, 0x04]));
});

test('static preview confines files to dist and exposes no live mutation API', async ({ request }) => {
  expect((await request.get('/api/forge-health')).status()).toBe(404);
  expect((await request.post('/api/reset')).status()).toBe(405);
  expect((await request.get('/%2e%2e%2fpackage.json')).status()).toBe(403);
  expect((await request.get('/%E0%A4%A')).status()).toBe(400);
  expect((await request.get('/.git/config')).status()).toBe(404);
  expect((await request.get('/.openai/hosting.json')).status()).toBe(404);
});
