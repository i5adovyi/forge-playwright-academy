import { test, expect, addProduct, login, credentials, shipping } from '../support/fixtures';

test('new sessions begin with an empty cart', async ({ request }) => {
  expect(await (await request.get('/api/cart')).json()).toEqual({ items: [], subtotal: 0, discount: 0, total: 0, promoCode: null });
});
test('adding and updating a line sets quantity rather than incrementing it', async ({ request }) => {
  await addProduct(request, 'p1', 1);
  const cart = await addProduct(request, 'p1', 2);
  expect(cart.items).toHaveLength(1);
  expect(cart.items[0]).toMatchObject({ productId: 'p1', quantity: 2, price: 12900, lineTotal: 25800 });
  expect(cart.total).toBe(25800);
});
test('removing a product recalculates totals', async ({ request }) => {
  await addProduct(request, 'p1');
  await addProduct(request, 'p2');
  const response = await request.delete('/api/cart/p1');
  expect(response.status()).toBe(200);
  expect((await response.json()).total).toBe(8900);
});
test('inherited object properties are not removable cart items', async ({ request }) => {
  const response = await request.delete('/api/cart/toString');
  expect(response.status()).toBe(404);
  expect((await response.json()).error.code).toBe('CART_ITEM_NOT_FOUND');
});
for (const quantity of [0, -1, 1.5, '2', 100]) {
  test(`rejects invalid quantity ${JSON.stringify(quantity)} without mutation`, async ({ request }) => {
    const response = await request.post('/api/cart', { data: { productId: 'p1', quantity } });
    expect(response.status()).toBe(400);
    expect((await response.json()).error.code).toBe('INVALID_QUANTITY');
    expect((await (await request.get('/api/cart')).json()).items).toEqual([]);
  });
}
test('sold out and excessive stock requests are rejected', async ({ request }) => {
  for (const data of [{ productId: 'p5', quantity: 1 }, { productId: 'p1', quantity: 13 }]) {
    const response = await request.post('/api/cart', { data });
    expect(response.status()).toBe(409);
    expect((await response.json()).error.code).toBe('INSUFFICIENT_STOCK');
  }
});
test('an unknown product is a 404', async ({ request }) => {
  const response = await request.post('/api/cart', { data: { productId: 'missing', quantity: 1 } });
  expect(response.status()).toBe(404);
  expect((await response.json()).error.code).toBe('PRODUCT_NOT_FOUND');
});
test('SAVE10 applies once and recalculates after quantity changes', async ({ request }) => {
  await addProduct(request);
  await request.post('/api/cart/promo', { data: { code: ' save10 ' } });
  await request.post('/api/cart/promo', { data: { code: 'SAVE10' } });
  const cart = await addProduct(request, 'p1', 2);
  expect(cart).toMatchObject({ subtotal: 25800, discount: 2580, total: 23220, promoCode: 'SAVE10' });
});
test('invalid promo does not change cart', async ({ request }) => {
  await addProduct(request);
  const response = await request.post('/api/cart/promo', { data: { code: 'INVALID' } });
  expect(response.status()).toBe(422);
  expect((await (await request.get('/api/cart')).json()).total).toBe(12900);
});
test('authentication rejects bad passwords and supports logout', async ({ request }) => {
  expect((await request.post('/api/login', { data: { ...credentials, password: 'wrong' } })).status()).toBe(401);
  await login(request);
  expect((await (await request.get('/api/session')).json()).user.email).toBe(credentials.email);
  await request.post('/api/logout');
  expect((await request.get('/api/orders')).status()).toBe(401);
});
test('orders require authentication', async ({ request }) => {
  await addProduct(request);
  const response = await request.post('/api/orders', { data: shipping });
  expect(response.status()).toBe(401);
  expect((await response.json()).error.code).toBe('AUTH_REQUIRED');
});
test('order creation persists a snapshot and clears cart and promo', async ({ request }) => {
  await login(request);
  await addProduct(request, 'p2', 2);
  await request.post('/api/cart/promo', { data: { code: 'SAVE10' } });
  const response = await request.post('/api/orders', { data: shipping });
  expect(response.status()).toBe(201);
  const { order } = await response.json();
  expect(order).toMatchObject({ id: 'ORD-0001', status: 'confirmed', subtotal: 17800, discount: 1780, total: 16020, customer: credentials.email, shipping });
  const history = await (await request.get('/api/orders')).json();
  expect(history.orders).toEqual([order]);
  expect(await (await request.get('/api/cart')).json()).toMatchObject({ items: [], total: 0, promoCode: null });
});
test('invalid address and empty-cart checkout do not create orders', async ({ request }) => {
  await login(request);
  const invalid = await request.post('/api/orders', { data: { ...shipping, city: '' } });
  expect(invalid.status()).toBe(422);
  const empty = await request.post('/api/orders', { data: shipping });
  expect(empty.status()).toBe(409);
  expect((await empty.json()).error.code).toBe('EMPTY_CART');
  expect((await (await request.get('/api/orders')).json()).orders).toEqual([]);
});
test('malformed JSON is a controlled 400', async ({ request }) => {
  const response = await request.post('/api/cart', { data: '{"productId":', headers: { 'Content-Type': 'application/json' } });
  expect(response.status()).toBe(400);
  expect((await response.json()).error.code).toBe('INVALID_BODY');
});
test('session reset clears only its own state', async ({ request, playwright, baseURL }) => {
  await login(request); await addProduct(request);
  const other = await playwright.request.newContext({ baseURL, extraHTTPHeaders: { 'x-lab-session': `other-${crypto.randomUUID()}` } });
  try {
    expect((await (await other.get('/api/cart')).json()).items).toEqual([]);
    await addProduct(other, 'p2');
    await request.post('/api/reset');
    expect((await (await request.get('/api/cart')).json()).items).toEqual([]);
    expect((await (await request.get('/api/session')).json()).user).toBeNull();
    expect((await (await other.get('/api/cart')).json()).total).toBe(8900);
  } finally { await other.dispose(); }
});
