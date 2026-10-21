import { test, expect } from '../tests/support/fixtures';

// Run ONE example: npm run test:beginner -- --grep BG-05
// Expected values below are chosen from the stated rule, not computed by the
// same implementation under test. These examples never touch learner progress.
// Read beginner/README.md for predictions, optional hints and safe experiments.
// test(title, callback) registers the function between the opening { and final
// });. Keep that wrapper when editing your separate practice.spec.ts starter.
// A statement beginning expect checks an observed value against a chosen rule.

test('BG-01 · Values, types and an independent total', () => {
  const quantity = 2;
  const priceCents = 12900;
  const totalCents = priceCents * quantity;
  // typeof returns text. The second check intentionally inspects quoted digits.
  expect(typeof quantity).toBe('number');
  expect(typeof '2').toBe('string');
  expect(totalCents).toBe(25800);
});

test('BG-02 · Read objects and arrays', () => {
  const product = { name: 'Studio Headphones', price: 12900 };
  const names = [product.name, 'Mechanical Keyboard'];
  // A field, one array position, and the complete sequence are different checks.
  expect(product.price).toBe(12900);
  expect(names[0]).toBe('Studio Headphones');
  expect(names).toEqual(['Studio Headphones', 'Mechanical Keyboard']);
});

test('BG-03 · A function and its boundary decisions', () => {
  function allowedQuantity(quantity: number): boolean {
    // For 1.5 this line returns false immediately, skipping the next return.
    if (!Number.isInteger(quantity)) return false;
    // For 0, the first comparison is false. For 99, both comparisons are true.
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
  // First iteration: value 1 -> resolved number 2 -> observed [2].
  // Second iteration: value 2 -> resolved number 4 -> observed [2, 4].
  // Promise.resolve makes an already-resolved promise for a small language
  // example. This is not evidence about network delay or real browser timing.
  for (const value of [1, 2]) {
    const doubled = await Promise.resolve(value * 2);
    observed.push(doubled);
  }
  expect(observed).toEqual([2, 4]);
});

test('BG-05 · Open the shop and check its heading', async ({ page }) => {
  // The test's configured baseURL supplies http://127.0.0.1:4175 by default.
  await page.goto('/lab/');
  await expect(page.getByRole('heading', {
    name: 'Good tools. Great work.', exact: true
  })).toBeVisible();
});

test('BG-06 · Empty search and visible recovery', async ({ page }) => {
  // Arrange: open this test's fresh page and describe the controls to use.
  await page.goto('/lab/');
  const search = page.getByRole('searchbox', { name: 'Search products' });
  const empty = page.getByRole('heading', { name: 'No products found', exact: true });
  // Act, then check: visible feedback proves the empty result was rendered.
  await search.fill('quantum toaster');
  await expect(empty).toBeVisible();
  await expect(page.getByRole('article')).toHaveCount(0);
  // Recovery is in the SAME test. A new browser page would lose this sequence.
  await search.fill('head');
  await expect(page.getByRole('article')).toHaveCount(1);
  // Count alone is insufficient: one wrong product would also have count 1.
  await expect(page.getByRole('article', { name: 'Studio Headphones', exact: true })).toBeVisible();
  await expect(empty).toBeHidden();
});

test('BG-07 · Read and check a catalog response', async ({ request }) => {
  // params produces ?search=head. The response is not the parsed JSON body yet.
  const response = await request.get('/api/products', { params: { search: 'head' } });
  expect(response.status()).toBe(200);
  const body = await response.json();
  // toHaveLength checks a JavaScript array; toHaveCount above checks DOM matches.
  expect(body.total).toBe(1);
  expect(body.products).toHaveLength(1);
  expect(body.products[0].id).toBe('p1');
  expect(body.products[0].name).toBe('Studio Headphones');
});

test('BG-08 · Reject zero without changing the cart', async ({ request }) => {
  // Read and remember the starting body; this fixture supplies a fresh session.
  const initial = await request.get('/api/cart');
  expect(initial.status()).toBe(200);
  const before = await initial.json();
  expect(before.items).toEqual([]);
  // data wraps the JSON input for POST. The expected 400 is a RESPONSE, not a
  // thrown JavaScript error: this negative-input test should finish green.
  const rejected = await request.post('/api/cart', { data: { productId: 'p1', quantity: 0 } });
  expect(rejected.status()).toBe(400);
  // Parentheses finish parsing the body before .error.code reads its fields.
  expect((await rejected.json()).error.code).toBe('INVALID_QUANTITY');
  // Read independently after rejection. Comparing before with itself is useless.
  const after = await request.get('/api/cart');
  expect(after.status()).toBe(200);
  expect(await after.json()).toEqual(before);
  // This proves the empty cart stayed unchanged for zero. Later API drills
  // preserve populated carts and exercise other boundaries; do not infer those.
});
