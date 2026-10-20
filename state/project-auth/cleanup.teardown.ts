import { access, rm } from 'node:fs/promises';
import { test as cleanup, expect } from '@playwright/test';
import { authFile } from './paths';
import { assertGuest } from '../support/helpers';

cleanup('cleanup: revoke the owned session and remove its snapshot', async ({ playwright, baseURL }, testInfo) => {
  try {
    try { await access(authFile); }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return;
      throw error;
    }
    const owned = await playwright.request.newContext({ baseURL, extraHTTPHeaders: {}, storageState: authFile });
    try {
      expect((await owned.post('/api/reset')).status()).toBe(200);
      await assertGuest(owned);
      expect((await (await owned.get('/api/cart')).json()).items).toEqual([]);
    } finally { await owned.dispose(); }
  } finally {
    await rm(authFile, { force: true });
    await expect(access(authFile)).rejects.toMatchObject({ code: 'ENOENT' });
    await testInfo.attach('auth-cleanup.json', {
      body: JSON.stringify({ snapshotRemoved: true }),
      contentType: 'application/json',
    });
  }
});
