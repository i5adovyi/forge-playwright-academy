import { test, expect, addProduct, login, credentials, shipping, type Product } from '../tests/support/fixtures';

test('EX-09 solution · catalog contract', async ({ request }) => {
  const response = await request.get('/api/products');
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('application/json');
  const { products, total } = await response.json();
  expect(total).toBe(6); expect(products).toHaveLength(6);
  expect(new Set(products.map((p: Product) => p.id)).size).toBe(6);
  for (const p of products) {
    expect(Number.isInteger(p.price)).toBe(true); expect(p.price).toBeGreaterThan(0);
    expect(Number.isInteger(p.stock)).toBe(true); expect(p.stock).toBeGreaterThanOrEqual(0);
  }
  expect(products.find((p: Product) => p.id === 'p1').name).toBe('Studio Headphones');
});
test('EX-10 solution · query composition', async ({ request }) => {
  const filtered = await request.get('/api/products', { params: { category: 'Audio', search: 'HEAD' } });
  expect((await filtered.json()).products.map((p: Product) => p.id)).toEqual(['p1']);
  const empty = await request.get('/api/products?search=quantum-toaster');
  expect(empty.status()).toBe(200);
  expect(await empty.json()).toEqual({ products: [], total: 0 });
});
test('EX-11 solution · quantity is replacement', async ({ request }) => {
  await addProduct(request); await addProduct(request, 'p1', 3);
  const cart = await (await request.get('/api/cart')).json();
  expect(cart.items).toHaveLength(1);
  expect(cart.items[0].quantity).toBe(3);
  expect(cart.total).toBe(38700);
});
for (const quantity of [0, -1, 1.5, '2', 100, 13]) {
  test(`EX-12 solution · boundary ${JSON.stringify(quantity)}`, async ({ request }) => {
    const response = await request.post('/api/cart', { data: { productId: 'p1', quantity } });
    expect(response.status()).toBe(quantity === 13 ? 409 : 400);
    expect((await response.json()).error.code).toBe(quantity === 13 ? 'INSUFFICIENT_STOCK' : 'INVALID_QUANTITY');
    expect((await (await request.get('/api/cart')).json()).items).toEqual([]);
  });
}
test('EX-13 solution · authenticate and invalidate', async ({ request }) => {
  expect((await request.post('/api/login', { data: { ...credentials, password: 'incorrect' } })).status()).toBe(401);
  await login(request);
  expect((await (await request.get('/api/session')).json()).user.email).toBe(credentials.email);
  expect((await request.post('/api/logout')).status()).toBe(200);
  expect((await request.get('/api/orders')).status()).toBe(401);
});
test('EX-14 solution · persisted order and cleanup', async ({ request }) => {
  await login(request); await addProduct(request, 'p2', 2);
  expect((await request.post('/api/cart/promo', { data: { code: 'SAVE10' } })).status()).toBe(200);
  const response = await request.post('/api/orders', { data: shipping });
  expect(response.status()).toBe(201);
  const { order } = await response.json();
  expect(order.total).toBe(16020);
  expect((await (await request.get('/api/orders')).json()).orders).toEqual([order]);
  expect((await (await request.get('/api/cart')).json()).items).toEqual([]);
});
test('EX-15 solution · explicit independent contexts', async ({ request, playwright, baseURL }) => {
  const other = await playwright.request.newContext({ baseURL, extraHTTPHeaders: { 'x-lab-session': `solution-${crypto.randomUUID()}` } });
  try {
    await addProduct(request);
    expect((await (await other.get('/api/cart')).json()).items).toEqual([]);
    await addProduct(other, 'p4');
    await request.post('/api/reset');
    expect((await (await request.get('/api/cart')).json()).items).toEqual([]);
    expect((await (await other.get('/api/cart')).json()).total).toBe(5900);
  } finally { await other.dispose(); }
});
test('EX-16 solution · negative contracts preserve state', async ({ request }) => {
  await addProduct(request, 'p1', 2);
  const before = await (await request.get('/api/cart')).json();
  const malformed = await request.post('/api/cart', { data: '{broken' });
  expect(malformed.status()).toBe(400); expect((await malformed.json()).error.code).toBe('INVALID_BODY');
  expect(await (await request.get('/api/cart')).json()).toEqual(before);
  const missing = await request.post('/api/cart', { data: { productId: 'missing', quantity: 1 } });
  expect(missing.status()).toBe(404);
  expect((await missing.json()).error.code).toBe('PRODUCT_NOT_FOUND');
  expect(await (await request.get('/api/cart')).json()).toEqual(before);
  await login(request);
  const invalid = await request.post('/api/orders', { data: { ...shipping, city: '' } });
  expect(invalid.status()).toBe(422);
  expect((await invalid.json()).error.code).toBe('INVALID_ADDRESS');
  expect(await (await request.get('/api/cart')).json()).toEqual(before);
  expect((await (await request.get('/api/orders')).json()).orders).toEqual([]);
});
