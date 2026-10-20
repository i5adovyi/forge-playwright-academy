import { test, expect } from '@playwright/test';
import { credentials } from '../tests/support/fixtures';

// These tests intentionally use the base fixture: SK-02 demonstrates cookie state,
// without Forge's x-lab-session header overriding the browser cookie.
test('SK-01 · timer has a precise expiration boundary', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') });
  await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'));
  await page.goto('/skills/');
  await page.getByRole('button', { name: 'Reserve for 30 seconds' }).click();
  await page.clock.runFor(29_999);
  await expect(page.locator('#reservation')).toHaveText('Reservation active');
  await page.clock.runFor(1);
  await expect(page.locator('#reservation')).toHaveText('Reservation expired');
});

test('SK-02 · storageState transfers cookie authentication but leaves fresh contexts anonymous', async ({ browser, playwright, baseURL }) => {
  const api = await playwright.request.newContext({ baseURL, extraHTTPHeaders: {} });
  try {
    expect((await api.post('/api/login', { data: credentials })).status()).toBe(200);
    const state = await api.storageState();
    const signedIn = await browser.newContext({ baseURL, storageState: state, extraHTTPHeaders: {} });
    const anonymous = await browser.newContext({ baseURL, extraHTTPHeaders: {} });
    try {
      const member = await signedIn.newPage();
      await member.goto('/lab/');
      await expect(member.getByRole('button', { name: 'Sign out' })).toBeVisible();
      expect((await signedIn.request.get('/api/session')).ok()).toBe(true);
      expect((await (await signedIn.request.get('/api/session')).json()).user.email).toBe(credentials.email);
      expect((await (await anonymous.request.get('/api/session')).json()).user).toBeNull();
      // Logout changes the shared server session. A copied cookie does not make an independent account.
      expect((await api.post('/api/logout')).ok()).toBe(true);
      expect((await (await signedIn.request.get('/api/session')).json()).user).toBeNull();
    } finally { await signedIn.close(); await anonymous.close(); }
  } finally { await api.dispose(); }
});

test('SK-03 · upload checks actual contents and rejects another extension', async ({ page }) => {
  await page.goto('/skills/');
  const input=page.getByLabel('Test note (.txt)');
  await input.setInputFiles({ name:'risk-note.txt', mimeType:'text/plain', buffer:Buffer.from('Risk: incorrect total\nOracle: exact cents') });
  await expect(page.locator('#upload-status')).toHaveText('Loaded risk-note.txt');
  await expect(page.getByLabel('File preview')).toHaveText('Risk: incorrect total\nOracle: exact cents');
  await input.setInputFiles({ name:'risk-note.csv', mimeType:'text/csv', buffer:Buffer.from('risk,total') });
  await expect(page.locator('#upload-status')).toHaveText('Choose a .txt file');
  await expect(page.getByLabel('File preview')).toBeEmpty();
});

test('SK-04 · frameLocator changes the embedded contact without editing the parent', async ({ page }) => {
  await page.goto('/skills/');
  const frame=page.frameLocator('iframe[title="Shipping contact"]');
  await frame.getByLabel('Name', { exact:true }).fill('Alex Tester');
  await frame.getByRole('button', { name:'Save contact' }).click();
  await expect(frame.getByRole('status')).toHaveText('Contact saved: Alex Tester');
  await expect(page.getByLabel('Name', { exact:true })).toHaveValue('Parent page');
});

test('SK-05 · capture and inspect a new page before returning to the original', async ({ page }) => {
  await page.goto('/skills/');
  const opened=page.waitForEvent('popup');
  await page.getByRole('link', { name:'Open sample receipt' }).click();
  const receipt=await opened;
  try {
    await expect(receipt).toHaveURL(/\/skills\/receipt\.html\?order=SK-42$/);
    await expect(receipt.getByRole('heading', { name:'Sample receipt' })).toBeVisible();
    await expect(receipt.locator('#order')).toHaveText('SK-42');
  } finally { await receipt.close(); }
  await expect(page.getByRole('button', { name:'Delete draft' })).toBeVisible();
});

test('SK-06 · dismiss preserves a draft; accept deletes it', async ({ page }) => {
  await page.goto('/skills/');
  const messages:string[]=[];
  page.once('dialog', async dialog=>{messages.push(dialog.message());await dialog.dismiss();});
  await page.getByRole('button', { name:'Delete draft' }).click();
  await expect(page.locator('#draft-status')).toHaveText('Draft saved');
  page.once('dialog', async dialog=>{messages.push(dialog.message());await dialog.accept();});
  await page.getByRole('button', { name:'Delete draft' }).click();
  await expect(page.locator('#draft-status')).toHaveText('Draft deleted');
  expect(messages).toEqual(['Delete this draft?','Delete this draft?']);
});
