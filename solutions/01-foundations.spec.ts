import { test, expect, openCart } from '../tests/support/fixtures';

const featuredNames = ['Studio Headphones', 'Mechanical Keyboard', '4K Webcam', 'Focus Lamp', 'Pocket Speaker', 'Monitor Arm'];

test('EX-01 solution · observable first test', async ({ page }) => {
  await page.goto('/lab/');
  await expect(page).toHaveTitle(/Forge Shop/);
  await expect(page.getByRole('heading', { name: 'Good tools. Great work.' })).toBeVisible();
  await expect(page.locator('.product-card')).toHaveCount(6);
});
test('EX-02 solution · search and clear', async ({ page }) => {
  await page.goto('/lab/');
  const search = page.getByRole('searchbox', { name: 'Search products' });
  await search.fill('head');
  await expect(page.locator('.product-card h3')).toHaveText(['Studio Headphones']);
  await search.clear();
  await expect(page.locator('.product-card h3')).toHaveText(featuredNames);
});
test('EX-03 solution · empty state recovery', async ({ page }) => {
  await page.goto('/lab/');
  await page.getByLabel('Category', { exact: true }).selectOption('Desk');
  await page.getByLabel('Sort by').selectOption('price-desc');
  await page.getByRole('searchbox', { name: 'Search products' }).fill('quantum toaster');
  await expect(page.getByRole('heading', { name: 'No products found' })).toBeVisible();
  await expect(page.locator('.product-card')).toHaveCount(0);
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await expect(page.getByRole('searchbox', { name: 'Search products' })).toHaveValue('');
  await expect(page.getByLabel('Category', { exact: true })).toHaveValue('All');
  await expect(page.getByLabel('Sort by')).toHaveValue('featured');
  await expect(page.locator('.product-card h3')).toHaveText(featuredNames);
  await expect(page.getByRole('heading', { name: 'No products found' })).not.toBeVisible();
});
test('EX-04 solution · exact sorted category sequence', async ({ page }) => {
  await page.goto('/lab/');
  await page.getByLabel('Category', { exact: true }).selectOption('Desk');
  await page.getByLabel('Sort by').selectOption('price-asc');
  await expect(page.locator('.product-card h3')).toHaveText(['Focus Lamp', 'Monitor Arm', 'Mechanical Keyboard']);
});
test('EX-05 solution · scope unavailable product', async ({ page }) => {
  await page.goto('/lab/');
  const product = page.getByRole('article', { name: 'Pocket Speaker', exact: true });
  await expect(product).toContainText('$49.00');
  await expect(product.getByRole('button')).toBeDisabled();
});
test('EX-06 solution · full cart lifecycle', async ({ page }) => {
  await page.goto('/lab/');
  await page.getByRole('button', { name: 'Add Studio Headphones to cart' }).click();
  const cart = await openCart(page);
  // A Locator is a query: it re-resolves after updateCart replaces the DOM.
  const quantity = cart.getByLabel('Quantity for Studio Headphones');
  await quantity.fill('2');
  await quantity.press('Tab');
  await expect(cart.getByTestId('cart-total')).toHaveText('$258.00');
  await expect(quantity).toHaveValue('2');
  await page.reload();
  await openCart(page);
  await expect(quantity).toHaveValue('2');
  await expect(cart.getByTestId('cart-total')).toHaveText('$258.00');
  for (const [value, total] of [['3', '$387.00'], ['2', '$258.00']]) {
    await quantity.fill(value);
    await quantity.press('Tab');
    await expect(cart.getByTestId('cart-total')).toHaveText(total);
    await expect(quantity).toHaveValue(value);
  }
  await cart.getByRole('button', { name: 'Remove Studio Headphones' }).click();
  await expect(cart.getByRole('heading', { name: 'Your cart is empty' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Cart (0)', exact: true })).toBeVisible();
  await page.reload();
  await openCart(page);
  await expect(cart.getByRole('heading', { name: 'Your cart is empty' })).toBeVisible();
});
test('EX-07 solution · promotion is not compounded', async ({ page }) => {
  await page.goto('/lab/');
  await page.getByRole('button', { name: 'Add Studio Headphones to cart' }).click();
  await expect(page.getByRole('button', { name: 'Cart (1)', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Add Studio Headphones to cart' }).click();
  await expect(page.getByRole('button', { name: 'Cart (2)', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Add Mechanical Keyboard to cart' }).click();
  const cart = await openCart(page);
  await expect(cart.getByTestId('cart-subtotal')).toHaveText('$347.00');
  await cart.getByLabel('Promo code').fill('SAVE10');
  for (let attempt = 0; attempt < 2; attempt++) {
    // The second expected UI total already exists. Observe THIS submission.
    const pending = page.waitForResponse(response =>
      new URL(response.url()).pathname === '/api/cart/promo' &&
      response.request().method() === 'POST');
    await cart.getByRole('button', { name: 'Apply promo' }).click();
    const response = await pending;
    expect(response.status()).toBe(200);
    expect(await response.json()).toMatchObject({
      subtotal: 34700, discount: 3470, total: 31230, promoCode: 'SAVE10',
    });
    // openCart's GET is ordered after the mutation/UI update in this lab.
    // Reopening also proves the unchanged amount survives a fresh state read.
    await cart.getByRole('button', { name: 'Close cart' }).click();
    await openCart(page);
    await expect(cart).toBeVisible();
    await expect(cart.getByTestId('cart-subtotal')).toHaveText('$347.00');
    await expect(cart.getByTestId('cart-discount')).toContainText('$34.70');
    await expect(cart.getByTestId('cart-total')).toHaveText('$312.30');
  }
});
test('EX-08 solution · keyboard activation and focus return', async ({ page }) => {
  await page.goto('/lab/');
  const trigger = page.getByRole('button', { name: 'Cart (0)', exact: true });
  await trigger.focus(); // Explicit setup; does not prove keyboard reachability.
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog', { name: 'Your cart' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: 'Your cart' })).not.toBeVisible();
  await expect(trigger).toBeFocused();
});
