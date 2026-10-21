import { test, expect } from '../tests/support/fixtures';

// Run ONE example: npm run test:beginner -- --grep BG-05
// Expected values below are chosen from the stated rule, not computed by the
// same implementation under test. These examples never touch learner progress.

test('BG-01 · Values, types and an independent total', () => {
  const quantity = 2;
  const priceCents = 12900;
  const totalCents = priceCents * quantity;
  expect(typeof quantity).toBe('number');
  expect(typeof '2').toBe('string');
  expect(totalCents).toBe(25800);
});

test('BG-02 · Read objects and arrays', () => {
  const product = { name: 'Studio Headphones', price: 12900 };
  const names = [product.name, 'Mechanical Keyboard'];
  expect(product.price).toBe(12900);
  expect(names[0]).toBe('Studio Headphones');
  expect(names).toEqual(['Studio Headphones', 'Mechanical Keyboard']);
});

test('BG-03 · A function and its boundary decisions', () => {
  function allowedQuantity(quantity: number): boolean {
    if (!Number.isInteger(quantity)) return false;
    return quantity >= 1 && quantity <= 99;
  }
  expect(allowedQuantity(0)).toBe(false);
  expect(allowedQuantity(1)).toBe(true);
  expect(allowedQuantity(99)).toBe(true);
  expect(allowedQuantity(100)).toBe(false);
  expect(allowedQuantity(1.5)).toBe(false);
});

test('BG-04 · Await a value before using it', async () => {
  const observed: number[] = [];
  for (const value of [1, 2]) {
    const doubled = await Promise.resolve(value * 2);
    observed.push(doubled);
  }
  expect(observed).toEqual([2, 4]);
});

test('BG-05 · Open the shop and check its heading', async ({ page }) => {
  await page.goto('/lab/');
  await expect(page.getByRole('heading', {
    name: 'Good tools. Great work.', exact: true
  })).toBeVisible();
});

test('BG-06 · Empty search and visible recovery', async ({ page }) => {
  await page.goto('/lab/');
  const search = page.getByRole('searchbox', { name: 'Search products' });
  const empty = page.getByRole('heading', { name: 'No products found', exact: true });
  await search.fill('quantum toaster');
  await expect(empty).toBeVisible();
  await expect(page.getByRole('article')).toHaveCount(0);
  await search.fill('head');
  await expect(page.getByRole('article')).toHaveCount(1);
  await expect(page.getByRole('article', { name: 'Studio Headphones', exact: true })).toBeVisible();
  await expect(empty).toBeHidden();
});

test('BG-07 · Read and check a catalog response', async ({ request }) => {
  const response = await request.get('/api/products', { params: { search: 'head' } });
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.total).toBe(1);
  expect(body.products).toHaveLength(1);
  expect(body.products[0].id).toBe('p1');
  expect(body.products[0].name).toBe('Studio Headphones');
});

test('BG-08 · Reject zero without changing the cart', async ({ request }) => {
  const initial = await request.get('/api/cart');
  expect(initial.status()).toBe(200);
  const before = await initial.json();
  expect(before.items).toEqual([]);
  const rejected = await request.post('/api/cart', { data: { productId: 'p1', quantity: 0 } });
  expect(rejected.status()).toBe(400);
  expect((await rejected.json()).error.code).toBe('INVALID_QUANTITY');
  const after = await request.get('/api/cart');
  expect(after.status()).toBe(200);
  expect(await after.json()).toEqual(before);
});
