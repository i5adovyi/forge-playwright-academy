import { test, expect, type Product } from '../../../tests/support/fixtures';

const scenario = process.env.FORGE_GATE_SCENARIO || 'baseline';

test('complete catalog is available', { tag: '@gate:catalog' }, async ({ request }) => {
  const response = await request.get('/api/products');
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.total).toBe(6);
  expect(body.products.map((product: Product) => product.id).sort())
    .toEqual(['p1', 'p2', 'p3', 'p4', 'p5', 'p6']);
});

test('unavailable stock is rejected without adding an item', { tag: '@gate:stock' }, async ({ request }) => {
  const response = await request.post('/api/cart', { data: { productId: 'p5', quantity: 1 } });
  expect(response.status()).toBe(409);
  expect((await response.json()).error.code).toBe('INSUFFICIENT_STOCK');
  expect(await (await request.get('/api/cart')).json()).toEqual({
    items: [], subtotal: 0, discount: 0, total: 0, promoCode: null,
  });
});

// Real academy starters are intentionally skipped and do not claim a required ID.
test.skip('optional learner exercise outside the required manifest', async () => {
  throw new Error('Unfinished optional practice must never stand in for a required case.');
});

if (scenario === 'duplicate-id') {
  test('another test wrongly claims the catalog identity', { tag: '@gate:catalog' }, async ({ request }) => {
    expect((await request.get('/api/forge-health')).status()).toBe(200);
  });
}

if (scenario === 'extra-failure') {
  test('an unlisted selected test also matters', async () => {
    expect('actual behavior', 'CONTROLLED_GATE_EXTRA_FAILURE').toBe('required behavior');
  });
}
