import { request as httpRequest } from 'node:http';
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
test('JSON must be an object and rejected bodies preserve an existing cart', async ({ request }) => {
  await addProduct(request, 'p2', 2);
  const before = await (await request.get('/api/cart')).json();
  for (const data of ['null', '[]', 'false', '42', '"hello"', '{"productId":']) {
    const response = await request.post('/api/cart', { data, headers: { 'Content-Type': 'application/json' } });
    expect(response.status(), data).toBe(400);
    expect((await response.json()).error.code).toBe('INVALID_BODY');
    expect(await (await request.get('/api/cart')).json()).toEqual(before);
  }
});
test('the body limit is 16 KiB of UTF-8 bytes, including the exact boundary', async ({ request }) => {
  const payload = { productId: 'p1', quantity: 1, padding: '' };
  payload.padding = 'a'.repeat(16_384 - Buffer.byteLength(JSON.stringify(payload)));
  const exact = JSON.stringify(payload);
  expect(Buffer.byteLength(exact)).toBe(16_384);
  const accepted = await request.post('/api/cart', { data: exact, headers: { 'Content-Type': 'application/json' } });
  expect(accepted.status()).toBe(200);
  const before = await accepted.json();

  // Each character needs three UTF-8 bytes: a character-count limit misses this.
  const oversized = JSON.stringify({ productId: 'p2', quantity: 2, padding: '界'.repeat(6000) });
  expect(oversized.length).toBeLessThan(16_384);
  expect(Buffer.byteLength(oversized)).toBeGreaterThan(16_384);
  for (const data of [exact + ' ', oversized]) {
    const response = await request.post('/api/cart', { data, headers: { 'Content-Type': 'application/json' } });
    expect(response.status()).toBe(413);
    expect((await response.json()).error.code).toBe('INVALID_BODY');
    expect(await (await request.get('/api/cart')).json()).toEqual(before);
  }
});
test('shipping survives a UTF-8 character split across network chunks', async ({ request, baseURL, sessionId }) => {
  await login(request); await addProduct(request);
  const unicodeShipping = { ...shipping, name: 'Łukasz Tester', city: 'Łódź' };
  const bytes = Buffer.from(JSON.stringify(unicodeShipping));
  const split = bytes.indexOf(Buffer.from('Ł')) + 1;
  const result = await new Promise<{ status: number | undefined; body: string }>((resolve, reject) => {
    const client = httpRequest(new URL('/api/orders', baseURL), {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-lab-session': sessionId },
    }, response => {
      const chunks: Buffer[] = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('end', () => resolve({ status: response.statusCode, body: Buffer.concat(chunks).toString('utf8') }));
      response.on('error', reject);
    });
    client.on('error', reject);
    client.setTimeout(5_000, () => client.destroy(new Error('Timed out sending fragmented JSON')));
    client.write(bytes.subarray(0, split));
    // Intentional transport fragmentation, not a wait for application readiness.
    setTimeout(() => client.end(bytes.subarray(split)), 30);
  });
  expect(result.status).toBe(201);
  expect(JSON.parse(result.body).order.shipping).toEqual(unicodeShipping);
});
test('receipt authorization is session-local even when order IDs overlap', async ({ request, playwright, baseURL }) => {
  await login(request); await addProduct(request, 'p1');
  const created = await request.post('/api/orders', { data: shipping });
  expect(created.status()).toBe(201);
  const { order } = await created.json();
  const receiptPath = `/api/orders/${order.id}/receipt`;
  // Playwright inherits configured context defaults: clear the shared test
  // session header so this context exercises an independent cookie session.
  const other = await playwright.request.newContext({ baseURL, extraHTTPHeaders: {} });
  try {
    const guest = await other.get(receiptPath);
    expect(guest.status()).toBe(401);
    expect((await guest.json()).error.code).toBe('AUTH_REQUIRED');
    await login(other);
    const missing = await other.get(receiptPath);
    expect(missing.status()).toBe(404);
    expect((await missing.json()).error.code).toBe('ORDER_NOT_FOUND');
    await addProduct(other, 'p4');
    const own = await other.post('/api/orders', { data: shipping });
    expect(own.status()).toBe(201);
    expect((await own.json()).order.id).toBe(order.id);
    expect(await (await other.get(receiptPath)).text()).toContain('Total: $59.00');
    const receipt = await request.get(receiptPath);
    expect(receipt.status()).toBe(200);
    expect(receipt.headers()['content-disposition']).toBe('attachment; filename="ORD-0001.txt"');
    expect(await receipt.text()).toContain('Total: $129.00');
    await request.post('/api/logout');
    expect((await request.get(receiptPath)).status()).toBe(401);
  } finally { await other.dispose(); }
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
