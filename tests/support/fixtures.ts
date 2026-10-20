import { test as base, expect, type APIRequestContext, type Page } from '@playwright/test';
import { randomUUID } from 'node:crypto';

export const credentials = { email: 'demo@forge.test', password: 'Playwright123!' };
export const shipping = { name: 'Alex Tester', address: '1 Test Lane', city: 'London', postalCode: 'SW1A 1AA' };
export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  icon: string;
  description: string;
  tag: string;
}

/** Every test gets independent server state, including on retries and parallel workers. */
export const test = base.extend<{ sessionId: string }>({
  sessionId: async ({}, use) => { await use(`test-${randomUUID()}`); },
  extraHTTPHeaders: async ({ sessionId }, use) => { await use({ 'x-lab-session': sessionId }); },
});
export { expect };

export async function addProduct(request: APIRequestContext, productId = 'p1', quantity = 1) {
  const response = await request.post('/api/cart', { data: { productId, quantity } });
  expect(response.status(), 'test setup must succeed').toBe(200);
  return response.json();
}
export async function login(request: APIRequestContext) {
  const response = await request.post('/api/login', { data: credentials });
  expect(response.status(), 'test setup must succeed').toBe(200);
}
export async function openCart(page: Page) {
  await page.getByRole('button', { name: /^Cart \(/ }).click();
  const cart = page.getByRole('dialog', { name: 'Your cart', exact: true });
  // Forge opens the dialog after refreshing and rendering the cart snapshot.
  await expect(cart).toBeVisible();
  return cart;
}
