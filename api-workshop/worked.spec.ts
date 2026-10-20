import { test, expect, type APIRequestContext, type APIResponse } from '@playwright/test';
import { addProduct, login, credentials, shipping } from '../tests/support/fixtures';

// The built-in request fixture owns its lifetime. Contexts created explicitly
// below belong to the test and need disposal. No x-lab-session header is used.
test.use({ storageState: { cookies: [], origins: [] }, extraHTTPHeaders: {} });
const emptyCart = { items: [], subtotal: 0, discount: 0, total: 0, promoCode: null };

// Keep the stable machine contract exact, without coupling tests to message wording.
async function expectError(response: APIResponse, status: number, code: string) {
  expect(response.status()).toBe(status);
  expect(response.headers()['content-type']).toContain('application/json');
  const body = await response.json();
  expect(body).toEqual({ error: { code, message: expect.any(String) } });
  expect(body.error.message.trim()).not.toBe('');
}

async function readCart(request: APIRequestContext) {
  const response = await request.get('/api/cart');
  expect(response.status()).toBe(200);
  return response.json();
}

test('AP-01 · request policy and response ownership', async ({ playwright, baseURL }) => {
  const api = await playwright.request.newContext({
    baseURL, storageState: { cookies: [], origins: [] }, extraHTTPHeaders: {},
    timeout: 5_000, failOnStatusCode: true,
  });
  let snapshot: Awaited<ReturnType<APIRequestContext['storageState']>>;
  const disposalReason = 'AP-01 owned client released';
  try {
    // An expected HTTP rejection is data to inspect, not a transport exception.
    const denied = await api.get('/api/orders', { failOnStatusCode: false, maxRetries: 0 });
    try {
      await expectError(denied, 401, 'AUTH_REQUIRED');
    } finally {
      await denied.dispose();
    }
    // Same endpoint, different client policy. maxRetries does not retry HTTP401.
    await expect(api.get('/api/orders', { maxRetries: 0 })).rejects.toThrow(/401 Unauthorized/);
    await login(api);
    const response = await api.get('/api/session');
    try {
      expect(response.status()).toBe(200);
      expect((await response.json()).user.email).toBe(credentials.email);
    } finally {
      await response.dispose();
    }
    await expect(response.body()).rejects.toThrow(/Response has been disposed/);
    const stillUsable = await api.get('/api/session');
    expect(stillUsable.status()).toBe(200);
    expect((await stillUsable.json()).user.email).toBe(credentials.email);
    snapshot = await api.storageState(); // In memory only; never attach cookie values.
  } finally {
    await api.dispose({ reason: disposalReason });
  }
  await expect(api.get('/api/session')).rejects.toThrow(disposalReason);

  // Context disposal frees the client; it does not revoke the server's session.
  const observer = await playwright.request.newContext({ baseURL, storageState: snapshot, extraHTTPHeaders: {} });
  try {
    const session = await observer.get('/api/session');
    expect(session.status()).toBe(200);
    expect((await session.json()).user.email).toBe(credentials.email);
    expect((await observer.get('/api/orders')).status()).toBe(200);
  } finally {
    await observer.dispose();
  }
});

test('AP-02 · raw JSON and UTF-8 byte boundaries preserve valid state', async ({ request }) => {
  await addProduct(request, 'p2', 2);
  const promo = await request.post('/api/cart/promo', { data: { code: 'SAVE10' } });
  expect(promo.status()).toBe(200);
  const before = await promo.json();
  expect(before).toEqual({
    items: [{ productId: 'p2', name: 'Mechanical Keyboard', price: 8900, quantity: 2, lineTotal: 17800 }],
    subtotal: 17800, discount: 1780, total: 16020, promoCode: 'SAVE10',
  });
  const headers = { 'Content-Type': 'application/json' };
  for (const data of ['{broken', 'null', '[]', 'false', '42', '"hello"']) {
    await test.step(`reject raw body ${data}`, async () => {
      const rejected = await request.post('/api/cart', { data, headers });
      await expectError(rejected, 400, 'INVALID_BODY');
      // Read immediately: a later setup write could hide destructive rejection.
      expect(await readCart(request)).toEqual(before);
    });
  }

  const payload = { productId: 'p2', quantity: 2, padding: '' };
  payload.padding = 'a'.repeat(16_384 - Buffer.byteLength(JSON.stringify(payload), 'utf8'));
  const exact = JSON.stringify(payload);
  expect(Buffer.byteLength(exact, 'utf8')).toBe(16_384);
  const boundary = await request.post('/api/cart', { data: exact, headers });
  expect(boundary.status()).toBe(200);
  expect(await boundary.json()).toEqual(before);
  expect(await readCart(request)).toEqual(before);

  const multibyte = JSON.stringify({ productId: 'p2', quantity: 2, padding: '界'.repeat(6000) });
  expect(multibyte.length).toBeLessThan(16_384);
  expect(Buffer.byteLength(multibyte, 'utf8')).toBeGreaterThan(16_384);
  for (const data of [exact + ' ', multibyte]) {
    const rejected = await request.post('/api/cart', { data, headers });
    await expectError(rejected, 413, 'INVALID_BODY');
    expect(await readCart(request)).toEqual(before);
  }
  const afterValid = await addProduct(request, 'p2', 1);
  expect(afterValid).toEqual({
    items: [{ productId: 'p2', name: 'Mechanical Keyboard', price: 8900, quantity: 1, lineTotal: 8900 }],
    subtotal: 8900, discount: 890, total: 8010, promoCode: 'SAVE10',
  });
  expect(await readCart(request)).toEqual(afterValid);
});

test('AP-03 · receipt ownership across independent sessions', async ({ playwright, baseURL }) => {
  const first = await playwright.request.newContext({
    baseURL, storageState: { cookies: [], origins: [] }, extraHTTPHeaders: {},
  });
  try {
    const second = await playwright.request.newContext({
      baseURL, storageState: { cookies: [], origins: [] }, extraHTTPHeaders: {},
    });
    try {
      await login(first);
      await addProduct(first, 'p1');
      const created = await first.post('/api/orders', { data: shipping });
      expect(created.status()).toBe(201);
      const { order: firstOrder } = await created.json();
      expect(firstOrder).toMatchObject({ id: 'ORD-0001', total: 12900 });
      const receiptPath = `/api/orders/${firstOrder.id}/receipt`;

      await expectError(await second.get(receiptPath), 401, 'AUTH_REQUIRED');
      await login(second); // Same demo email; this is a different SERVER SESSION.
      await expectError(await second.get(receiptPath), 404, 'ORDER_NOT_FOUND');
      const noOrders = await second.get('/api/orders');
      expect(noOrders.status()).toBe(200);
      expect(await noOrders.json()).toEqual({ orders: [] });
      await addProduct(second, 'p4');
      const otherCreated = await second.post('/api/orders', { data: shipping });
      expect(otherCreated.status()).toBe(201);
      const { order: secondOrder } = await otherCreated.json();
      expect(secondOrder).toMatchObject({ id: firstOrder.id, total: 5900 });

      for (const [owner, product, total, otherProduct, otherTotal] of [
        [first, 'Studio Headphones x 1', 'Total: $129.00', 'Focus Lamp', 'Total: $59.00'],
        [second, 'Focus Lamp x 1', 'Total: $59.00', 'Studio Headphones', 'Total: $129.00'],
      ] as const) {
        const receipt = await owner.get(receiptPath);
        expect(receipt.status()).toBe(200);
        expect(receipt.headers()['content-type']).toContain('text/plain');
        expect(receipt.headers()['content-disposition']).toBe('attachment; filename="ORD-0001.txt"');
        const text = await receipt.text(); // A receipt is not a JSON response.
        expect(text).toContain(product);
        expect(text).toContain(total);
        expect(text).not.toContain(otherProduct);
        expect(text).not.toContain(otherTotal);
      }
      const logout = await first.post('/api/logout');
      expect(logout.status()).toBe(200);
      expect(await logout.json()).toEqual({ user: null });
      await expectError(await first.get(receiptPath), 401, 'AUTH_REQUIRED');
      const secondSession = await second.get('/api/session');
      expect(secondSession.status()).toBe(200);
      expect((await secondSession.json()).user.email).toBe(credentials.email);
      const stillOwned = await second.get(receiptPath);
      expect(stillOwned.status()).toBe(200);
      expect(await stillOwned.text()).toContain('Total: $59.00');
    } finally {
      await second.dispose();
    }
  } finally {
    await first.dispose();
  }
});

test('AP-04 · immutable order history after another purchase', async ({ request }) => {
  await login(request);
  await addProduct(request, 'p2', 2);
  const promo = await request.post('/api/cart/promo', { data: { code: 'SAVE10' } });
  expect(promo.status()).toBe(200);
  const created = await request.post('/api/orders', { data: shipping });
  expect(created.status()).toBe(201);
  const { order: firstOrder } = await created.json();
  expect(firstOrder).toEqual({
    id: 'ORD-0001', status: 'confirmed', customer: credentials.email, shipping,
    items: [{ productId: 'p2', name: 'Mechanical Keyboard', price: 8900, quantity: 2, lineTotal: 17800 }],
    subtotal: 17800, discount: 1780, total: 16020, promoCode: 'SAVE10',
    createdAt: expect.any(String),
  });
  expect(new Date(firstOrder.createdAt).toISOString()).toBe(firstOrder.createdAt);
  let history = await request.get('/api/orders');
  expect(history.status()).toBe(200);
  expect(await history.json()).toEqual({ orders: [firstOrder] });
  expect(await readCart(request)).toEqual(emptyCart);

  await addProduct(request, 'p4');
  history = await request.get('/api/orders');
  expect(history.status()).toBe(200);
  expect(await history.json()).toEqual({ orders: [firstOrder] });
  const otherShipping = { ...shipping, city: 'Warsaw' };
  const nextCreated = await request.post('/api/orders', { data: otherShipping });
  expect(nextCreated.status()).toBe(201);
  const { order: secondOrder } = await nextCreated.json();
  expect(secondOrder).toEqual({
    id: 'ORD-0002', status: 'confirmed', customer: credentials.email, shipping: otherShipping,
    items: [{ productId: 'p4', name: 'Focus Lamp', price: 5900, quantity: 1, lineTotal: 5900 }],
    subtotal: 5900, discount: 0, total: 5900, promoCode: null,
    createdAt: expect.any(String),
  });
  expect(new Date(secondOrder.createdAt).toISOString()).toBe(secondOrder.createdAt);
  history = await request.get('/api/orders');
  expect(history.status()).toBe(200);
  expect(await history.json()).toEqual({ orders: [firstOrder, secondOrder] });
  expect(await readCart(request)).toEqual(emptyCart);
  const receipt = await request.get(`/api/orders/${firstOrder.id}/receipt`);
  expect(receipt.status()).toBe(200);
  const receiptText = await receipt.text();
  expect(receiptText).toContain('Mechanical Keyboard x 2');
  expect(receiptText).toContain('Total: $160.20');
  expect(receiptText).not.toContain('Focus Lamp');
  await expectError(await request.post('/api/orders', { data: shipping }), 409, 'EMPTY_CART');
  history = await request.get('/api/orders');
  expect(history.status()).toBe(200);
  expect(await history.json()).toEqual({ orders: [firstOrder, secondOrder] });
});
