import { test, expect, addProduct, login, credentials, shipping, type Product } from '../tests/support/fixtures';

test('EX-09 solution · catalog contract', async ({ request }) => {
  const response = await request.get('/api/products');
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('application/json');
  const { products, total } = await response.json();
  expect(Array.isArray(products)).toBe(true);
  expect(total).toBe(6); expect(products).toHaveLength(6);
  expect(new Set(products.map((p: Product) => p.id)).size).toBe(6);
  expect(products.map((p: Product) => p.id).sort()).toEqual(['p1', 'p2', 'p3', 'p4', 'p5', 'p6']);
  for (const p of products) {
    expect(typeof p.id).toBe('string'); expect(p.id.trim()).not.toBe('');
    expect(Number.isInteger(p.price)).toBe(true); expect(p.price).toBeGreaterThan(0);
    expect(Number.isInteger(p.stock)).toBe(true); expect(p.stock).toBeGreaterThanOrEqual(0);
  }
  expect(products.find((p: Product) => p.id === 'p1').name).toBe('Studio Headphones');
  expect(products).toContainEqual(expect.objectContaining({
    id: 'p2', name: 'Mechanical Keyboard', price: 8900, category: 'Desk',
  }));
});
test('EX-10 solution · query composition', async ({ request }) => {
  const filtered = await request.get('/api/products', { params: { category: 'Audio', search: 'HEAD' } });
  expect(filtered.status()).toBe(200);
  const body = await filtered.json();
  expect(body.total).toBe(1);
  expect(body.products.map((p: Product) => p.id)).toEqual(['p1']);
  const contradictory = await request.get('/api/products', { params: { category: 'Desk', search: 'HEAD' } });
  expect(contradictory.status()).toBe(200);
  expect(await contradictory.json()).toEqual({ products: [], total: 0 });
  const empty = await request.get('/api/products?search=quantum-toaster');
  expect(empty.status()).toBe(200);
  expect(await empty.json()).toEqual({ products: [], total: 0 });
  const desk = await request.get('/api/products', { params: { category: 'Desk', sort: 'price-asc' } });
  expect(desk.status()).toBe(200);
  const deskBody = await desk.json();
  expect(deskBody.total).toBe(3);
  expect(deskBody.products.map((p: Product) => p.id)).toEqual(['p4', 'p6', 'p2']);
  expect(deskBody.products.map((p: Product) => p.price)).toEqual([5900, 7900, 8900]);
  expect(deskBody.products.every((p: Product) => p.category === 'Desk')).toBe(true);
  const sorted: number[][] = [];
  for (const sort of ['price-asc', 'price-desc']) {
    const response = await request.get('/api/products', { params: { sort } });
    expect(response.status()).toBe(200);
    const result = await response.json();
    expect(result.total).toBe(6);
    expect(result.products.map((p: Product) => p.id).sort()).toEqual(['p1', 'p2', 'p3', 'p4', 'p5', 'p6']);
    sorted.push(result.products.map((p: Product) => p.price));
  }
  expect(sorted[0]).toEqual([4900, 5900, 7900, 8900, 12900, 14900]);
  expect(sorted[1]).toEqual([...sorted[0]].reverse());
  const invalid = await request.get('/api/products', { params: { sort: 'sideways' } });
  expect(invalid.status()).toBe(400);
  expect((await invalid.json()).error.code).toBe('INVALID_SORT');
});
test('EX-11 solution · quantity is replacement', async ({ request }) => {
  await addProduct(request); await addProduct(request, 'p1', 3);
  await addProduct(request, 'p1', 3); // Repeating the same write must not increment.
  const response = await request.get('/api/cart');
  expect(response.status()).toBe(200);
  expect(await response.json()).toEqual({
    items: [{ productId: 'p1', name: 'Studio Headphones', quantity: 3, price: 12900, lineTotal: 38700 }],
    subtotal: 38700, discount: 0, total: 38700, promoCode: null,
  });
  await addProduct(request, 'p2');
  const deleted = await request.delete('/api/cart/p1');
  expect(deleted.status()).toBe(200);
  const remaining = {
    items: [{ productId: 'p2', name: 'Mechanical Keyboard', quantity: 1, price: 8900, lineTotal: 8900 }],
    subtotal: 8900, discount: 0, total: 8900, promoCode: null,
  };
  expect(await deleted.json()).toEqual(remaining);
  const repeated = await request.delete('/api/cart/p1');
  expect(repeated.status()).toBe(404);
  expect((await repeated.json()).error.code).toBe('CART_ITEM_NOT_FOUND');
  const afterDelete = await request.get('/api/cart');
  expect(afterDelete.status()).toBe(200);
  expect(await afterDelete.json()).toEqual(remaining);
});
for (const quantity of [0, -1, 1.5, '2', 100, 13]) {
  test(`EX-12 solution · boundary ${JSON.stringify(quantity)}`, async ({ request }) => {
    await addProduct(request, 'p2');
    const promo = await request.post('/api/cart/promo', { data: { code: 'SAVE10' } });
    expect(promo.status()).toBe(200);
    const before = await promo.json();
    expect(before.total).toBe(8010);
    const response = await request.post('/api/cart', { data: { productId: 'p1', quantity } });
    expect(response.status()).toBe(quantity === 13 ? 409 : 400);
    expect((await response.json()).error.code).toBe(quantity === 13 ? 'INSUFFICIENT_STOCK' : 'INVALID_QUANTITY');
    const after = await request.get('/api/cart');
    expect(after.status()).toBe(200);
    expect(await after.json()).toEqual(before);
    if (quantity === 13) {
      const accepted = await addProduct(request, 'p1', 12);
      expect(accepted.items).toEqual([
        { productId: 'p2', name: 'Mechanical Keyboard', price: 8900, quantity: 1, lineTotal: 8900 },
        { productId: 'p1', name: 'Studio Headphones', price: 12900, quantity: 12, lineTotal: 154800 },
      ]);
      expect(accepted).toMatchObject({ subtotal: 163700, discount: 16370, total: 147330, promoCode: 'SAVE10' });
    }
  });
}
test('EX-13 solution · authenticate and invalidate', async ({ request }) => {
  const before = await addProduct(request, 'p4');
  const guestOrder = await request.post('/api/orders', { data: shipping });
  expect(guestOrder.status()).toBe(401);
  expect((await guestOrder.json()).error.code).toBe('AUTH_REQUIRED');
  expect(await (await request.get('/api/cart')).json()).toEqual(before);
  const rejected = await request.post('/api/login', { data: { ...credentials, password: 'incorrect' } });
  expect(rejected.status()).toBe(401);
  expect((await rejected.json()).error.code).toBe('INVALID_CREDENTIALS');
  expect(await (await request.get('/api/session')).json()).toEqual({ user: null });
  expect(await (await request.get('/api/cart')).json()).toEqual(before);
  const accepted = await request.post('/api/login', { data: credentials });
  expect(accepted.status()).toBe(200);
  expect((await accepted.json()).user.email).toBe(credentials.email);
  expect((await (await request.get('/api/session')).json()).user.email).toBe(credentials.email);
  const history = await request.get('/api/orders');
  expect(history.status()).toBe(200);
  expect(await history.json()).toEqual({ orders: [] });
  expect(await (await request.get('/api/cart')).json()).toEqual(before);
  const logout = await request.post('/api/logout');
  expect(logout.status()).toBe(200);
  expect(await logout.json()).toEqual({ user: null });
  expect(await (await request.get('/api/session')).json()).toEqual({ user: null });
  const protectedRead = await request.get('/api/orders');
  expect(protectedRead.status()).toBe(401);
  expect((await protectedRead.json()).error.code).toBe('AUTH_REQUIRED');
  expect(await (await request.get('/api/cart')).json()).toEqual(before);
});
test('EX-14 solution · persisted order and cleanup', async ({ request }) => {
  await login(request); await addProduct(request, 'p2', 2);
  expect((await request.post('/api/cart/promo', { data: { code: 'SAVE10' } })).status()).toBe(200);
  const response = await request.post('/api/orders', { data: shipping });
  expect(response.status()).toBe(201);
  const { order } = await response.json();
  expect(order).toMatchObject({
    id: 'ORD-0001', status: 'confirmed', subtotal: 17800, discount: 1780, total: 16020,
    promoCode: 'SAVE10', customer: credentials.email, shipping,
    items: [{ productId: 'p2', name: 'Mechanical Keyboard', price: 8900, quantity: 2, lineTotal: 17800 }],
  });
  expect(new Date(order.createdAt).toISOString()).toBe(order.createdAt);
  const history = await request.get('/api/orders');
  expect(history.status()).toBe(200);
  expect(await history.json()).toEqual({ orders: [order] });
  const empty = await request.get('/api/cart');
  expect(empty.status()).toBe(200);
  expect(await empty.json()).toEqual({ items: [], subtotal: 0, discount: 0, total: 0, promoCode: null });
  const nextCart = await addProduct(request, 'p4');
  expect(nextCart).toMatchObject({ total: 5900, promoCode: null });
  const afterMutation = await request.get('/api/orders');
  expect(afterMutation.status()).toBe(200);
  expect(await afterMutation.json()).toEqual({ orders: [order] });
});
test('EX-15 solution · explicit independent contexts', async ({ request, playwright, baseURL }) => {
  const other = await playwright.request.newContext({
    baseURL, storageState: { cookies: [], origins: [] },
    extraHTTPHeaders: { 'x-lab-session': `solution-${crypto.randomUUID()}` },
  });
  try {
    await login(request);
    await addProduct(request);
    expect((await (await other.get('/api/cart')).json()).items).toEqual([]);
    await login(other);
    const otherBefore = await addProduct(other, 'p4');
    const reset = await request.post('/api/reset');
    expect(reset.status()).toBe(200);
    expect(await reset.json()).toEqual({ reset: true });
    expect(await (await request.get('/api/cart')).json()).toEqual({ items: [], subtotal: 0, discount: 0, total: 0, promoCode: null });
    expect(await (await request.get('/api/session')).json()).toEqual({ user: null });
    expect(await (await other.get('/api/cart')).json()).toEqual(otherBefore);
    expect((await (await other.get('/api/session')).json()).user.email).toBe(credentials.email);
  } finally { await other.dispose(); }
});
test('EX-16 solution · negative contracts preserve state', async ({ request }) => {
  await addProduct(request, 'p1', 2);
  const promo = await request.post('/api/cart/promo', { data: { code: 'SAVE10' } });
  expect(promo.status()).toBe(200);
  const before = await promo.json();
  const malformed = await request.post('/api/cart', { data: '{broken', headers: { 'Content-Type': 'application/json' } });
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
