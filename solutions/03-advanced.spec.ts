import { readFile } from 'node:fs/promises';
import type { Page } from '@playwright/test';
import { test, expect, login, addProduct, shipping, openCart } from '../tests/support/fixtures';

async function checkout(page: Page, expectedTotal = '$129.00') {
  const cart = await openCart(page);
  await expect(cart.getByTestId('cart-total')).toHaveText(expectedTotal);
  await cart.getByRole('button', { name: 'Continue to checkout' }).click();
  const form = page.getByRole('dialog', { name: 'The details.' });
  await form.getByLabel('Full name').fill(shipping.name);
  await form.getByLabel('Street address').fill(shipping.address);
  await form.getByLabel('City', { exact: true }).fill(shipping.city);
  await form.getByLabel('Postal code').fill(shipping.postalCode);
  const responsePromise = page.waitForResponse(response =>
    new URL(response.url()).pathname === '/api/orders' && response.request().method() === 'POST');
  await form.getByRole('button', { name: 'Place order' }).click();
  const response = await responsePromise;
  expect(response.status()).toBe(201);
  const { order } = await response.json();
  const confirmation = page.getByRole('dialog', { name: "You're all set." });
  await expect(confirmation).toBeVisible();
  await expect(confirmation).toContainText(order.id);
  await expect(confirmation.getByRole('link', { name: 'Download receipt' }))
    .toHaveAttribute('href', `/api/orders/${order.id}/receipt`);
  return order;
}
test('EX-17 solution · API setup UI action API evidence', async ({ page, request }) => {
  await login(request); await addProduct(request, 'p1');
  expect((await request.post('/api/cart/promo', { data: { code: 'SAVE10' } })).status()).toBe(200);
  await page.goto('/lab/');
  await expect(page.getByRole('button', { name: 'Sign out', exact: true })).toBeVisible();
  const order = await checkout(page, '$116.10');
  expect(order).toMatchObject({
    subtotal: 12900, discount: 1290, total: 11610, promoCode: 'SAVE10', shipping,
    items: [{ productId: 'p1', price: 12900, quantity: 1, lineTotal: 12900 }],
  });
  const history = await request.get('/api/orders');
  expect(history.status()).toBe(200);
  expect((await history.json()).orders).toEqual([order]);
  const cleared = await request.get('/api/cart');
  expect(cleared.status()).toBe(200);
  expect(await cleared.json()).toEqual({ items: [], subtotal: 0, discount: 0, total: 0, promoCode: null });
});
test('EX-18 solution · UI handles an outage and recovers', async ({ page }) => {
  await page.route('**/api/products?*', route => route.fulfill({ status: 503, json: { error: { code: 'UNAVAILABLE', message: 'Catalog unavailable.' } } }));
  await page.goto('/lab/');
  await expect(page.getByRole('alert')).toContainText('Catalog unavailable.');
  await expect(page.locator('.product-card')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'No products found' })).not.toBeVisible();
  await page.unroute('**/api/products?*');
  await page.getByLabel('Category', { exact: true }).selectOption('Desk');
  await expect(page.locator('.product-card h3')).toHaveText(['Mechanical Keyboard', 'Focus Lamp', 'Monitor Arm']);
  await expect(page.getByRole('alert')).not.toBeVisible();
  await expect(page.locator('#products')).toHaveAttribute('aria-busy', 'false');
});
test('EX-19 solution · synthetic empty response', async ({ page }) => {
  await page.route('**/api/products?*', route => route.fulfill({ json: { products: [], total: 0 } }));
  await page.goto('/lab/');
  await expect(page.getByRole('heading', { name: 'No products found' })).toBeVisible();
  await expect(page.locator('.product-card')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Clear filters' })).toBeVisible();
  await expect(page.getByRole('alert')).not.toBeVisible();
  await expect(page.locator('#product-count')).toHaveText('0 essentials');
  await expect(page.locator('#products')).toHaveAttribute('aria-busy', 'false');
});
test('EX-20 solution · download content, not just a filename', async ({ page, request }) => {
  await login(request); await addProduct(request);
  await page.goto('/lab/'); await checkout(page);
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('link', { name: 'Download receipt' }).click(),
  ]);
  expect(download.suggestedFilename()).toBe('ORD-0001.txt');
  const file = await download.path();
  expect(file).not.toBeNull();
  const content = await readFile(file!, 'utf8');
  expect(content).toContain('Total: $129.00');
  expect(content).toContain('No payment was collected.');
});
test('EX-21 solution · narrow viewport flow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/lab/');
  await page.getByRole('button', { name: 'Add Focus Lamp to cart' }).click();
  const cart = await openCart(page);
  await cart.getByLabel('Promo code').fill('SAVE10');
  await cart.getByRole('button', { name: 'Apply promo' }).click();
  await expect(cart.getByTestId('cart-total')).toHaveText('$53.10');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
test('EX-22 solution · invalid stock does not mutate UI or API', async ({ page, request }) => {
  await addProduct(request); await page.goto('/lab/');
  const cart = await openCart(page);
  await cart.getByLabel('Quantity for Studio Headphones').fill('13');
  await cart.getByLabel('Quantity for Studio Headphones').press('Tab');
  await expect(cart.getByRole('alert')).toContainText('Only 12 available');
  await expect(cart.getByLabel('Quantity for Studio Headphones')).toHaveValue('1');
  await expect(cart.getByTestId('cart-total')).toHaveText('$129.00');
  expect((await (await request.get('/api/cart')).json()).items[0].quantity).toBe(1);
});
test('EX-23 solution · response observation registered before action', async ({ page }) => {
  await page.goto('/lab/');
  await expect(page.locator('.product-card')).toHaveCount(6);
  const responsePromise = page.waitForResponse(response => {
    const url = new URL(response.url());
    return url.pathname === '/api/products' && url.searchParams.get('category') === 'Video';
  });
  await page.getByLabel('Category', { exact: true }).selectOption('Video');
  const response = await responsePromise;
  expect(response.status()).toBe(200);
  expect(new URL(response.url()).searchParams.get('category')).toBe('Video');
  await expect(page.locator('.product-card')).toHaveCount(1);
  await expect(page.locator('.product-card')).toHaveAccessibleName('4K Webcam');
});
test('EX-24 solution · reset invalidates auth and order history', async ({ page, request }) => {
  await login(request); await addProduct(request);
  expect((await request.post('/api/orders', { data: shipping })).status()).toBe(201);
  await addProduct(request, 'p2');
  await page.goto('/lab/');
  await expect(page.getByRole('button', { name: 'Sign out', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Reset my sandbox' }).click();
  await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Cart (0)', exact: true })).toBeVisible();
  expect((await request.get('/api/orders')).status()).toBe(401);
  await login(request);
  expect((await (await request.get('/api/orders')).json()).orders).toEqual([]);
});
