import { test, expect } from '../../tests/support/fixtures';
import { installPriceFault } from './price-fault';

test.beforeEach(async ({ page }) => { await installPriceFault(page); });

// Inherited code: deliberately duplicated consumers, but strong assertions.
// Refactor the plumbing without replacing their independent business values.
test('RF-01 baseline · headphone cart', async ({ page, request }) => {
  await page.goto('/lab/');
  const card = page.getByRole('article', { name: 'Studio Headphones', exact: true });
  const added = page.waitForResponse(response =>
    new URL(response.url()).pathname === '/api/cart' && response.request().method() === 'POST');
  await card.getByRole('button', { name: 'Add Studio Headphones to cart', exact: true }).click();
  expect((await added).status()).toBe(200);
  await expect(page.getByRole('button', { name: 'Cart (1)', exact: true })).toBeVisible();
  await page.getByRole('button', { name: /^Cart \(/ }).click();
  const cart = page.getByRole('dialog', { name: 'Your cart', exact: true });
  await expect(cart).toBeVisible();
  await expect(cart.getByLabel('Quantity for Studio Headphones', { exact: true })).toHaveValue('1');
  await expect(cart.getByTestId('cart-total'), 'RF_CART_TOTAL_ORACLE').toHaveText('$129.00');
  const persisted = await request.get('/api/cart');
  expect(persisted.status()).toBe(200);
  expect(await persisted.json()).toEqual({
    items: [{ productId: 'p1', name: 'Studio Headphones', price: 12900, quantity: 1, lineTotal: 12900 }],
    subtotal: 12900, discount: 0, total: 12900, promoCode: null,
  });
});

test('RF-01 baseline · lamp cart', async ({ page, request }) => {
  await page.goto('/lab/');
  const card = page.getByRole('article', { name: 'Focus Lamp', exact: true });
  const added = page.waitForResponse(response =>
    new URL(response.url()).pathname === '/api/cart' && response.request().method() === 'POST');
  await card.getByRole('button', { name: 'Add Focus Lamp to cart', exact: true }).click();
  expect((await added).status()).toBe(200);
  await expect(page.getByRole('button', { name: 'Cart (1)', exact: true })).toBeVisible();
  await page.getByRole('button', { name: /^Cart \(/ }).click();
  const cart = page.getByRole('dialog', { name: 'Your cart', exact: true });
  await expect(cart).toBeVisible();
  await expect(cart.getByLabel('Quantity for Focus Lamp', { exact: true })).toHaveValue('1');
  await expect(cart.getByTestId('cart-total'), 'RF_CART_TOTAL_ORACLE').toHaveText('$59.00');
  const persisted = await request.get('/api/cart');
  expect(persisted.status()).toBe(200);
  expect(await persisted.json()).toEqual({
    items: [{ productId: 'p4', name: 'Focus Lamp', price: 5900, quantity: 1, lineTotal: 5900 }],
    subtotal: 5900, discount: 0, total: 5900, promoCode: null,
  });
});

test('RF-02 baseline · locators survive both rerenders', async ({ page, request }) => {
  await page.goto('/lab/');
  const card = page.getByRole('article', { name: 'Studio Headphones', exact: true });
  await expect(card).toBeVisible();
  await page.getByLabel('Category', { exact: true }).selectOption('Desk');
  await expect(card).toHaveCount(0);
  await page.getByLabel('Category', { exact: true }).selectOption('All');
  await expect(card).toBeVisible(); // The original locator resolves a new node.
  const added = page.waitForResponse(response =>
    new URL(response.url()).pathname === '/api/cart' && response.request().method() === 'POST');
  await card.getByRole('button', { name: 'Add Studio Headphones to cart', exact: true }).click();
  expect((await added).status()).toBe(200);
  await expect(page.getByRole('button', { name: 'Cart (1)', exact: true })).toBeVisible();
  await page.getByRole('button', { name: /^Cart \(/ }).click();
  const cart = page.getByRole('dialog', { name: 'Your cart', exact: true });
  const quantity = cart.getByLabel('Quantity for Studio Headphones', { exact: true });
  await expect(cart.getByTestId('cart-total'), 'RF_CART_TOTAL_ORACLE').toHaveText('$129.00');
  const changed = page.waitForResponse(response =>
    new URL(response.url()).pathname === '/api/cart' && response.request().method() === 'POST');
  await quantity.fill('3');
  await quantity.press('Tab');
  expect((await changed).status()).toBe(200);
  await expect(quantity).toHaveValue('3'); // updateCart replaced the line's input.
  await expect(cart.getByTestId('cart-total'), 'RF_CART_TOTAL_ORACLE').toHaveText('$387.00');
  const persisted = await request.get('/api/cart');
  expect(persisted.status()).toBe(200);
  expect(await persisted.json()).toEqual({
    items: [{ productId: 'p1', name: 'Studio Headphones', price: 12900, quantity: 3, lineTotal: 38700 }],
    subtotal: 38700, discount: 0, total: 38700, promoCode: null,
  });
});
