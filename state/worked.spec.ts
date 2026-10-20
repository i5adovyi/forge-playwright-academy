import { test, expect } from '@playwright/test';
import { lifecycleTest, scopedTest, optionTest, authenticatedTest } from './support/fixtures';
import { assertGuest, attachEvidence, emptyStorage, freshContext, loginWithCookies, restoreDraftBeforeApp, seedBrowserNotes, visitBench } from './support/helpers';

// These exercises intentionally use cookies, never the shop suite's session header.
test.use({ storageState: { cookies: [], origins: [] }, extraHTTPHeaders: {} });

lifecycleTest('FS-01 · dependency setup and reverse teardown', async ({ lease, lifecycleEvents }) => {
  expect(lease.inventory.open).toBe(true);
  expect(lease.released).toBe(false);
  expect(lifecycleEvents).toEqual(['inventory:setup', 'lease:setup']);
  lifecycleEvents.push('test:use');
  // The outer lifecycleEvents fixture asserts the COMPLETE order after this test.
});

scopedTest.describe('FS-02 · worker identity, fresh test resources', () => {
  // Group cases into the same worker when possible; either is valid on its own,
  // in a retry, or after a worker restart. No result depends on execution order.
  scopedTest.describe.configure({ mode: 'default' });
  for (const label of ['alpha', 'beta']) {
    scopedTest(`FS-02 · ${label} begins with its own empty resource`, async ({ resource, workerIdentity }, testInfo) => {
      expect(resource.owner).toBe(workerIdentity.id);
      expect(workerIdentity.workerIndex).toBe(testInfo.workerIndex);
      expect(resource.items).toEqual([]);
      resource.items.push(`owned by ${label}`);
      expect(resource.items).toEqual([`owned by ${label}`]);
      expect(workerIdentity.live.has(resource.id)).toBe(true);
    });
  }
});

optionTest.describe('FS-03 · typed options, automatic evidence, lazy fixtures', () => {
  optionTest.use({ displayLocale: 'de-DE' });
  optionTest('FS-03 · locale override reaches an owned browser context', async ({ localePage, optionEvents, displayLocale, browser, baseURL }) => {
    expect(displayLocale).toBe('de-DE');
    expect(optionEvents[0]).toBe('automatic:setup');
    expect(await localePage.evaluate(() => navigator.language)).toBe('de-DE');
    expect(await localePage.evaluate(() => Intl.DateTimeFormat().resolvedOptions().timeZone)).toBe('Europe/Warsaw');
    optionEvents.push('test:use');
    // Explicit control: it cannot silently inherit the override under test.
    const control = await freshContext(browser, baseURL, { locale: 'en-GB', timezoneId: 'UTC' });
    try {
      const page = await control.newPage();
      await visitBench(page);
      expect(await page.evaluate(() => navigator.language)).toBe('en-GB');
      expect(await page.evaluate(() => Intl.DateTimeFormat().resolvedOptions().timeZone)).toBe('UTC');
    } finally { await control.close(); }
    expect(optionEvents).not.toContain('unused:setup');
  });
});

test('FS-04 · two tabs, one context', async ({ context, page }, testInfo) => {
  // Establish one cookie before simultaneous pages can create separate sessions.
  expect((await context.request.get('/api/session')).status()).toBe(200);
  await visitBench(page);
  await seedBrowserNotes(page);
  const second = await context.newPage(); // No opener, so no initial sessionStorage copy.
  try {
    await visitBench(second);
    await expect(second.getByTestId('theme-value')).toHaveText('dark');
    await expect(second.getByTestId('draft-value')).toHaveText('No draft');
    await expect(second.getByTestId('notebook-value')).toHaveText('Evidence survives export');
    await second.getByLabel('Theme', { exact: true }).selectOption('light');
    await second.getByRole('button', { name: 'Save shared preference' }).click();
    // The first tab reacts to a genuine cross-tab storage event.
    await expect(page.getByTestId('theme-value')).toHaveText('light');
    await expect(page.getByTestId('draft-value')).toHaveText('Only this tab');
    await loginWithCookies(second.request);
    expect((await (await page.request.get('/api/session')).json()).user.name).toBe('Alex Tester');
    await attachEvidence(testInfo, 'FS-04-boundaries', { sharedCookieJar: true, sharedLocalStorage: true, sharedIndexedDB: true, separateSessionStorage: true, openerUsed: false });
  } finally { await second.close(); }
});

test('FS-05 · independent context boundaries', async ({ context, page, browser, baseURL }, testInfo) => {
  await loginWithCookies(context.request);
  await visitBench(page);
  await seedBrowserNotes(page);
  const independent = await freshContext(browser, baseURL);
  try {
    const otherPage = await independent.newPage();
    await visitBench(otherPage);
    await assertGuest(independent.request);
    await expect(otherPage.getByTestId('identity')).toHaveText('Guest session');
    await expect(otherPage.getByTestId('theme-value')).toHaveText('system');
    await expect(otherPage.getByTestId('draft-value')).toHaveText('No draft');
    await expect(otherPage.getByTestId('notebook-value')).toHaveText('No notebook note');
    const ownCookie = (await context.cookies()).find(cookie => cookie.name === 'lab_session');
    const otherCookie = (await independent.cookies()).find(cookie => cookie.name === 'lab_session');
    expect(Boolean(ownCookie && otherCookie && ownCookie.value !== otherCookie.value)).toBe(true);
    await otherPage.getByLabel('Theme', { exact: true }).selectOption('light');
    await otherPage.getByRole('button', { name: 'Save shared preference' }).click();
    await expect(page.getByTestId('theme-value')).toHaveText('dark');
    await attachEvidence(testInfo, 'FS-05-isolation', { separateCookieIdentity: true, sourceTheme: 'dark', controlTheme: 'light', controlNotebook: 'empty', controlAuthenticated: false });
  } finally { await independent.close(); }
});

test('FS-06 · storageState and IndexedDB opt-in', async ({ context, page, browser, baseURL }, testInfo) => {
  await loginWithCookies(context.request);
  await visitBench(page);
  await seedBrowserNotes(page);
  const ordinary = await context.storageState();
  const withDatabase = await context.storageState({ indexedDB: true });
  const origin = new URL(baseURL!).origin;
  expect(Object.hasOwn(ordinary.origins.find(entry => entry.origin === origin) ?? {}, 'indexedDB')).toBe(false);
  expect(Object.hasOwn(withDatabase.origins.find(entry => entry.origin === origin) ?? {}, 'indexedDB')).toBe(true);
  const restoredDefault = await freshContext(browser, baseURL, { storageState: ordinary });
  try {
    // Protect each successful allocation before attempting the next one.
    const restoredFull = await freshContext(browser, baseURL, { storageState: withDatabase });
    try {
      const fresh = await freshContext(browser, baseURL);
      try {
        const defaultPage = await restoredDefault.newPage();
        const fullPage = await restoredFull.newPage();
        const freshPage = await fresh.newPage();
        await visitBench(defaultPage); await visitBench(fullPage); await visitBench(freshPage);
        for (const restored of [defaultPage, fullPage]) {
          await expect(restored.getByTestId('identity')).toHaveText('Signed in as Alex Tester');
          await expect(restored.getByTestId('theme-value')).toHaveText('dark');
          await expect(restored.getByTestId('draft-value')).toHaveText('No draft');
        }
        await expect(defaultPage.getByTestId('notebook-value')).toHaveText('No notebook note');
        await expect(fullPage.getByTestId('notebook-value')).toHaveText('Evidence survives export');
        await expect(freshPage.getByTestId('theme-value')).toHaveText('system');
        await expect(freshPage.getByTestId('notebook-value')).toHaveText('No notebook note');
        await assertGuest(fresh.request);
        // Restoring storage is a copy: later local-storage changes don't sync contexts.
        await fullPage.getByLabel('Theme', { exact: true }).selectOption('light');
        await fullPage.getByRole('button', { name: 'Save shared preference' }).click();
        await expect(page.getByTestId('theme-value')).toHaveText('dark');
        await attachEvidence(testInfo, 'FS-06-export-matrix', { default: ['cookies', 'localStorage'], optIn: ['IndexedDB'], omitted: ['sessionStorage'], snapshotsWrittenToDisk: false });
      } finally { await fresh.close(); }
    } finally { await restoredFull.close(); }
  } finally { await restoredDefault.close(); }
});

test('FS-07 · restore sessionStorage before application code', async ({ context, page, browser, baseURL }, testInfo) => {
  await visitBench(page);
  await seedBrowserNotes(page);
  const state = await context.storageState();
  const draft = await page.evaluate(() => sessionStorage.getItem('forge-state-draft'));
  expect(draft).toBe('Only this tab');
  const control = await freshContext(browser, baseURL, { storageState: state });
  try {
    const restored = await freshContext(browser, baseURL, { storageState: state });
    try {
      await restoreDraftBeforeApp(restored, new URL(baseURL!).origin, draft!);
      const controlPage = await control.newPage();
      const restoredPage = await restored.newPage();
      await visitBench(controlPage); await visitBench(restoredPage);
      await expect(controlPage.getByTestId('draft-value')).toHaveText('No draft');
      await expect(restoredPage.getByTestId('draft-value')).toHaveText('Only this tab');
      // No external request is made: this route is an offline second-origin control.
      const outside = await restored.newPage();
      await outside.route('https://outside.example.test/**', route => route.fulfill({ contentType: 'text/html', body: '<!doctype html><html lang="en"><title>Origin control</title><body>Separate origin</body></html>' }));
      await outside.goto('https://outside.example.test/control');
      expect(await outside.evaluate(() => sessionStorage.getItem('forge-state-draft'))).toBeNull();
      await attachEvidence(testInfo, 'FS-07-bootstrap', { sourceDraft: 'Only this tab', ordinaryRestore: 'No draft', guardedRestore: 'Only this tab', differentOriginReceivedDraft: false });
    } finally { await restored.close(); }
  } finally { await control.close(); }
});

test('FS-08 · context request sharing and standalone isolation', async ({ context, page, playwright, baseURL }, testInfo) => {
  await loginWithCookies(context.request);
  await visitBench(page);
  await expect(page.getByTestId('identity')).toHaveText('Signed in as Alex Tester');
  expect((await (await page.request.get('/api/session')).json()).user.email).toBe('demo@forge.test');
  const standalone = await playwright.request.newContext({ baseURL, storageState: emptyStorage(), extraHTTPHeaders: {} });
  try {
    await assertGuest(standalone);
    await loginWithCookies(standalone);
    expect((await standalone.post('/api/cart', { data: { productId: 'p2', quantity: 2 } })).status()).toBe(200);
    expect((await (await context.request.get('/api/cart')).json()).items).toEqual([]);
    expect((await (await standalone.get('/api/cart')).json()).total).toBe(17800);
    await context.request.post('/api/logout');
    await page.reload();
    await expect(page.getByTestId('identity')).toHaveText('Guest session');
    expect((await (await standalone.get('/api/session')).json()).user.email).toBe('demo@forge.test');
    await attachEvidence(testInfo, 'FS-08-cookie-jars', { browserRequestSharesPageIdentity: true, standaloneInitiallyGuest: true, standaloneLoginUnaffectedByBrowserLogout: true });
  } finally { await standalone.dispose(); }
});

test('FS-09 · copied authentication is a shared server session', async ({ context, page, browser, baseURL }, testInfo) => {
  await loginWithCookies(context.request);
  const sourceCart = await context.request.post('/api/cart', { data: { productId: 'p1', quantity: 1 } });
  expect(sourceCart.status()).toBe(200);
  const copied = await freshContext(browser, baseURL, { storageState: await context.storageState() });
  try {
    const unrelated = await freshContext(browser, baseURL);
    try {
      expect((await (await copied.request.get('/api/cart')).json()).total).toBe(12900);
      expect((await copied.request.post('/api/cart', { data: { productId: 'p1', quantity: 2 } })).status()).toBe(200);
      expect((await (await context.request.get('/api/cart')).json()).total).toBe(25800);
      expect((await (await unrelated.request.get('/api/cart')).json()).items).toEqual([]);
      expect((await copied.request.post('/api/logout')).status()).toBe(200);
      await assertGuest(context.request);
      await visitBench(page);
      await expect(page.getByTestId('identity')).toHaveText('Guest session');
      await attachEvidence(testInfo, 'FS-09-server-session', { copiedCookieSharesCart: true, copiedLogoutInvalidatesSourceSession: true, unrelatedCartUntouched: true, accountCloned: false });
    } finally { await unrelated.close(); }
  } finally { await copied.close(); }
});

authenticatedTest('FS-10 · own an authenticated context per test', async ({ member, browser, baseURL }) => {
  const guest = await freshContext(browser, baseURL);
  try {
    await assertGuest(guest.request);
    expect((await member.context.request.post('/api/cart', { data: { productId: 'p4', quantity: 2 } })).status()).toBe(200);
    await member.page.getByRole('button', { name: /^Cart \(/ }).click();
    const cart = member.page.getByRole('dialog', { name: 'Your cart', exact: true });
    await expect(cart.getByTestId('cart-total')).toHaveText('$118.00');
    await expect(member.page.getByRole('button', { name: 'Sign out', exact: true })).toBeVisible();
    expect((await (await guest.request.get('/api/cart')).json()).items).toEqual([]);
  } finally { await guest.close(); }
  // The member fixture resets its own server state and closes its owned context.
});
