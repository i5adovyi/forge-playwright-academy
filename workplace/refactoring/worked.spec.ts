import { test, expect } from './fixtures';
import { installPriceFault } from './price-fault';

test.beforeEach(async ({ page }) => { await installPriceFault(page); });

// Expected prices are independent literals in the consumer, not values read
// from the cart, calculated by the POM, or imported from application internals.
const products = [
  { id: 'p1', name: 'Studio Headphones', price: 12900, displayTotal: '$129.00' },
  { id: 'p4', name: 'Focus Lamp', price: 5900, displayTotal: '$59.00' },
] as const;

for (const product of products) {
  test(`RF-01 solution · ${product.name} cart`, async ({ shop, request }) => {
    await shop.goto();
    expect((await shop.product(product.name).add()).status()).toBe(200);
    await expect(shop.cartButton).toHaveText('Cart (1)');
    const cart = await shop.openCart();
    await expect(cart.quantity(product.name)).toHaveValue('1');
    await expect(cart.total, 'RF_CART_TOTAL_ORACLE').toHaveText(product.displayTotal);
    const persisted = await request.get('/api/cart');
    expect(persisted.status()).toBe(200);
    expect(await persisted.json()).toEqual({
      items: [{ productId: product.id, name: product.name, price: product.price, quantity: 1, lineTotal: product.price }],
      subtotal: product.price, discount: 0, total: product.price, promoCode: null,
    });
  });
}

test('RF-02 solution · locators survive both rerenders', async ({ shop, request }) => {
  await shop.goto();
  const headphones = shop.product('Studio Headphones');
  await expect(headphones.root).toBeVisible();
  await shop.category.selectOption('Desk');
  await expect(headphones.root).toHaveCount(0);
  await shop.category.selectOption('All');
  await expect(headphones.root).toBeVisible();
  expect((await headphones.add()).status()).toBe(200);
  await expect(shop.cartButton).toHaveText('Cart (1)');
  const cart = await shop.openCart();
  const quantity = cart.quantity('Studio Headphones');
  await expect(cart.total, 'RF_CART_TOTAL_ORACLE').toHaveText('$129.00');
  expect((await cart.setQuantity('Studio Headphones', 3)).status()).toBe(200);
  await expect(quantity).toHaveValue('3');
  await expect(cart.total, 'RF_CART_TOTAL_ORACLE').toHaveText('$387.00');
  const persisted = await request.get('/api/cart');
  expect(persisted.status()).toBe(200);
  expect(await persisted.json()).toEqual({
    items: [{ productId: 'p1', name: 'Studio Headphones', price: 12900, quantity: 3, lineTotal: 38700 }],
    subtotal: 38700, discount: 0, total: 38700, promoCode: null,
  });
});
