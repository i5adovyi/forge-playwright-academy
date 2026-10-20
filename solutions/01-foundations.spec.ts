import { test, expect, openCart } from '../tests/support/fixtures';

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
  await expect(page.locator('.product-card')).toHaveCount(1);
  await expect(page.getByRole('article', { name: 'Studio Headphones', exact: true })).toBeVisible();
  await search.clear();
  await expect(page.locator('.product-card')).toHaveCount(6);
});
test('EX-03 solution · empty state recovery', async ({ page }) => {
  await page.goto('/lab/');
  await page.getByRole('searchbox').fill('quantum toaster');
  await expect(page.getByRole('heading', { name: 'No products found' })).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await expect(page.getByRole('searchbox')).toHaveValue('');
  await expect(page.locator('.product-card')).toHaveCount(6);
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
  await cart.getByLabel('Quantity for Studio Headphones').fill('2');
  await cart.getByLabel('Quantity for Studio Headphones').press('Tab');
  await expect(cart.getByTestId('cart-total')).toHaveText('$258.00');
  await cart.getByRole('button', { name: 'Remove Studio Headphones' }).click();
  await expect(cart.getByRole('heading', { name: 'Your cart is empty' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Cart (0)', exact: true })).toBeVisible();
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
    await cart.getByRole('button', { name: 'Apply promo' }).click();
    await expect(cart.getByTestId('cart-discount')).toContainText('$34.70');
    await expect(cart.getByTestId('cart-total')).toHaveText('$312.30');
  }
});
test('EX-08 solution · keyboard modal focus', async ({ page }) => {
  await page.goto('/lab/');
  const trigger = page.getByRole('button', { name: 'Cart (0)', exact: true });
  await trigger.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog', { name: 'Your cart' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: 'Your cart' })).not.toBeVisible();
  await expect(trigger).toBeFocused();
});
