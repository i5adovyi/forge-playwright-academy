import { expect, type APIRequestContext, type Browser, type BrowserContext, type BrowserContextOptions, type Page, type TestInfo } from '@playwright/test';

export const demoCredentials = { email: 'demo@forge.test', password: 'Playwright123!' };
export const emptyStorage = () => ({ cookies: [], origins: [] });

/** Explicitly clear runner defaults before making an independent control. */
export function freshContext(browser: Browser, baseURL: string | undefined, options: BrowserContextOptions = {}) {
  return browser.newContext({ baseURL, storageState: emptyStorage(), extraHTTPHeaders: {}, ...options });
}
export async function loginWithCookies(request: APIRequestContext) {
  const response = await request.post('/api/login', { data: demoCredentials });
  expect(response.status(), 'Cookie-based setup must succeed.').toBe(200);
  expect((await response.json()).user.email).toBe(demoCredentials.email);
}
export async function assertGuest(request: APIRequestContext) {
  const session = await request.get('/api/session');
  expect(session.status()).toBe(200);
  expect((await session.json()).user).toBeNull();
  const orders = await request.get('/api/orders');
  expect(orders.status()).toBe(401);
  expect((await orders.json()).error.code).toBe('AUTH_REQUIRED');
}
export async function visitBench(page: Page) {
  await page.goto('/state/');
  await expect(page.getByTestId('bench-ready')).toHaveText('Ready to inspect.');
}
export async function seedBrowserNotes(page: Page) {
  await page.getByLabel('Theme', { exact: true }).selectOption('dark');
  await page.getByRole('button', { name: 'Save shared preference' }).click();
  await page.getByLabel('Draft note', { exact: true }).fill('Only this tab');
  await page.getByRole('button', { name: 'Save tab draft' }).click();
  await page.getByLabel('Notebook note', { exact: true }).fill('Evidence survives export');
  await page.getByRole('button', { name: 'Save notebook note' }).click();
  await expect(page.getByTestId('notebook-value')).toHaveText('Evidence survives export');
}
export async function restoreDraftBeforeApp(context: BrowserContext, origin: string, value: string) {
  await context.addInitScript(({ expectedOrigin, draft }) => {
    if (window.location.origin === expectedOrigin) sessionStorage.setItem('forge-state-draft', draft);
  }, { expectedOrigin: origin, draft: value });
}
/** Attach only chosen observations. Never pass storageState or cookie values here. */
export async function attachEvidence(testInfo: TestInfo, name: string, observations: Record<string, unknown>) {
  await testInfo.attach(`${name}.json`, { body: JSON.stringify(observations, null, 2), contentType: 'application/json' });
}
