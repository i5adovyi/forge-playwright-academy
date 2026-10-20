import { test, expect, addProduct, login, credentials, shipping, openCart } from '../support/fixtures';

test('catalog renders accessible product cards and sold-out state', async ({ page }) => {
  await page.goto('/lab/');
  await expect(page.getByRole('heading', { name: 'Good tools. Great work.' })).toBeVisible();
  await expect(page.locator('.product-card')).toHaveCount(6);
  await expect(page.getByRole('button', { name: 'Add Pocket Speaker to cart' })).toBeDisabled();
});
test('search, clear empty results, and filter a category', async ({ page }) => {
  await page.goto('/lab/');
  await page.getByRole('searchbox', { name: 'Search products' }).fill('nothing matches');
  await expect(page.getByRole('heading', { name: 'No products found' })).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await expect(page.locator('.product-card')).toHaveCount(6);
  await page.getByLabel('Category', { exact: true }).selectOption('Audio');
  await expect(page.locator('.product-card')).toHaveCount(2);
  await expect(page.getByRole('article', { name: 'Studio Headphones', exact: true })).toBeVisible();
});
test('sort by price changes displayed order', async ({ page }) => {
  await page.goto('/lab/');
  await page.getByLabel('Sort by').selectOption('price-desc');
  await expect(page.locator('.product-card').first()).toHaveAccessibleName('4K Webcam');
  await expect(page.locator('.product-card').last()).toHaveAccessibleName('Pocket Speaker');
});
test('add product, change quantity, apply discount, and remove', async ({ page }) => {
  await page.goto('/lab/');
  await page.getByRole('button', { name: 'Add Studio Headphones to cart' }).click();
  const cart = await openCart(page);
  await expect(cart.getByTestId('cart-total')).toHaveText('$129.00');
  await cart.getByLabel('Quantity for Studio Headphones').fill('2');
  await cart.getByLabel('Quantity for Studio Headphones').press('Tab');
  await expect(cart.getByTestId('cart-total')).toHaveText('$258.00');
  await cart.getByLabel('Promo code').fill('SAVE10');
  await cart.getByRole('button', { name: 'Apply promo' }).click();
  await expect(cart.getByTestId('cart-total')).toHaveText('$232.20');
  await cart.getByRole('button', { name: 'Remove Studio Headphones' }).click();
  await expect(cart.getByRole('heading', { name: 'Your cart is empty' })).toBeVisible();
});
test('cart survives a page reload', async ({ page }) => {
  await page.goto('/lab/');
  await page.getByRole('button', { name: 'Add Mechanical Keyboard to cart' }).click();
  await expect(page.getByRole('button', { name: 'Cart (1)', exact: true })).toBeVisible();
  await page.reload();
  const cart = await openCart(page);
  await expect(cart.getByRole('heading', { name: 'Mechanical Keyboard' })).toBeVisible();
  await expect(cart.getByTestId('cart-total')).toHaveText('$89.00');
});
test('quantity above stock displays a useful error and preserves total', async ({ page, request }) => {
  await addProduct(request);
  await page.goto('/lab/');
  const cart = await openCart(page);
  await cart.getByLabel('Quantity for Studio Headphones').fill('13');
  await cart.getByLabel('Quantity for Studio Headphones').press('Tab');
  await expect(cart.getByRole('alert')).toContainText('Only 12 available');
  await expect(cart.getByTestId('cart-total')).toHaveText('$129.00');
  await expect(cart.getByLabel('Quantity for Studio Headphones')).toHaveValue('1');
});
test('invalid promo is visible without changing total', async ({ page, request }) => {
  await addProduct(request);
  await page.goto('/lab/');
  const cart = await openCart(page);
  await cart.getByLabel('Promo code').fill('NOPE');
  await cart.getByRole('button', { name: 'Apply promo' }).click();
  await expect(cart.getByRole('alert')).toContainText('not valid');
  await expect(cart.getByTestId('cart-total')).toHaveText('$129.00');
});
test('login reports failure, then succeeds with valid credentials', async ({ page }) => {
  await page.goto('/lab/');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Your workspace awaits.' });
  await dialog.getByLabel('Email', { exact: true }).fill(credentials.email);
  await dialog.getByLabel('Password', { exact: true }).fill('wrong');
  await dialog.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(dialog.getByRole('alert')).toContainText('incorrect');
  await dialog.getByLabel('Password', { exact: true }).fill(credentials.password);
  await dialog.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign out', exact: true })).toBeVisible();
});
test('guest checkout provides a sign-in recovery path', async ({ page, request }) => {
  await addProduct(request);
  await page.goto('/lab/');
  const cart = await openCart(page);
  await cart.getByRole('button', { name: 'Continue to checkout' }).click();
  await expect(cart.getByRole('alert')).toContainText('Sign in before checkout');
});
test('hybrid checkout creates an API order and a downloadable receipt', async ({ page, request }) => {
  await login(request);
  await addProduct(request, 'p2', 2);
  await page.goto('/lab/');
  const cart = await openCart(page);
  await cart.getByRole('button', { name: 'Continue to checkout' }).click();
  const checkout = page.getByRole('dialog', { name: 'The details.' });
  await checkout.getByLabel('Full name').fill(shipping.name);
  await checkout.getByLabel('Street address').fill(shipping.address);
  await checkout.getByLabel('City', { exact: true }).fill(shipping.city);
  await checkout.getByLabel('Postal code').fill(shipping.postalCode);
  await checkout.getByRole('button', { name: 'Place order' }).click();
  const confirmation = page.getByRole('dialog', { name: "You're all set." });
  await expect(confirmation).toContainText('ORD-0001');
  const [download] = await Promise.all([page.waitForEvent('download'), confirmation.getByRole('link', { name: 'Download receipt' }).click()]);
  expect(download.suggestedFilename()).toBe('ORD-0001.txt');
  expect(await download.failure()).toBeNull();
  const { orders } = await (await request.get('/api/orders')).json();
  expect(orders[0]).toMatchObject({ total: 17800, shipping });
});
test('a server error produces a recoverable catalog state', async ({ page }) => {
  await page.route('**/api/products?*', route => route.fulfill({ status: 503, json: { error: { code: 'UNAVAILABLE', message: 'Catalog is temporarily unavailable.' } } }));
  await page.goto('/lab/');
  await expect(page.getByRole('alert')).toContainText('temporarily unavailable');
  await page.unroute('**/api/products?*');
  await page.getByLabel('Category', { exact: true }).selectOption('Desk');
  await expect(page.locator('.product-card')).toHaveCount(3);
});
test('mobile layout fits the viewport and cart is usable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/lab/');
  await page.getByRole('button', { name: 'Add Focus Lamp to cart' }).click();
  const cart = await openCart(page);
  await expect(cart.getByTestId('cart-total')).toHaveText('$59.00');
  const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  expect(hasOverflow).toBe(false);
});
test('Escape closes the modal and returns focus to its trigger', async ({ page }) => {
  await page.goto('/lab/');
  const cart = await openCart(page);
  await expect(cart).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(cart).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'Cart (0)', exact: true })).toBeFocused();
});
