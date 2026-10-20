import { test, expect, addProduct, login, shipping } from '../../../tests/support/fixtures';

const scenario = process.env.FORGE_GATE_SCENARIO || 'baseline';

test('discounted purchase preserves the contract', { tag: '@gate:checkout' }, async ({ request }, testInfo) => {
  test.skip(scenario === 'skipped-required', 'CONTROLLED_GATE_REQUIRED_SKIP');
  test.fail(scenario === 'expected-failed', 'CONTROLLED_GATE_EXPECTED_FAILURE');
  await login(request);
  await addProduct(request, 'p2', 2);
  expect((await request.post('/api/cart/promo', { data: { code: 'SAVE10' } })).status()).toBe(200);
  const response = await request.post('/api/orders', { data: shipping });
  expect(response.status()).toBe(201);
  const { order } = await response.json();
  // Independent arithmetic: 2 × $89.00 − 10% = $160.20.
  const shouldFail = ['failed', 'expected-failed'].includes(scenario)
    || (scenario === 'flaky' && testInfo.retry === 0);
  expect(order.total, shouldFail ? 'CONTROLLED_GATE_CHECKOUT_FAILURE' : 'contract total').toBe(shouldFail ? 1 : 16020);
  expect(order).toMatchObject({ subtotal: 17800, discount: 1780, promoCode: 'SAVE10', status: 'confirmed' });
  expect(await (await request.get('/api/orders')).json()).toEqual({ orders: [order] });
  expect(await (await request.get('/api/cart')).json()).toEqual({
    items: [], subtotal: 0, discount: 0, total: 0, promoCode: null,
  });
});
