import { test, expect, type Product } from '../support/fixtures';

test('catalog exposes six products with integer cents and stock', async ({ request }) => {
  const response = await request.get('/api/products');
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('application/json');
  const body = await response.json();
  expect(Array.isArray(body.products)).toBe(true);
  expect(body.total).toBe(6);
  expect(body.products).toHaveLength(6);
  expect(body.products.map((p: Product) => p.id).sort()).toEqual(['p1', 'p2', 'p3', 'p4', 'p5', 'p6']);
  expect(body.products).toContainEqual(expect.objectContaining({
    id: 'p2', name: 'Mechanical Keyboard', price: 8900, category: 'Desk',
  }));
  expect(new Set(body.products.map((p: Product) => p.id)).size).toBe(6);
  for (const product of body.products) {
    expect(typeof product.id).toBe('string');
    expect(product.id.trim()).not.toBe('');
    expect(Number.isInteger(product.price)).toBe(true);
    expect(product.price).toBeGreaterThan(0);
    expect(Number.isInteger(product.stock)).toBe(true);
    expect(product.stock).toBeGreaterThanOrEqual(0);
  }
});
test('search is case insensitive and combines with category', async ({ request }) => {
  const response = await request.get('/api/products', { params: { search: 'HEAD', category: 'Audio' } });
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.total).toBe(1);
  expect(body.products.map((p: Product) => p.id)).toEqual(['p1']);
  const contradictory = await request.get('/api/products', { params: { search: 'HEAD', category: 'Desk' } });
  expect(contradictory.status()).toBe(200);
  expect(await contradictory.json()).toEqual({ products: [], total: 0 });
});
test('unmatched search returns a valid empty collection', async ({ request }) => {
  const response = await request.get('/api/products?search=does-not-exist');
  expect(response.status()).toBe(200);
  expect(await response.json()).toEqual({ products: [], total: 0 });
});
test('price ascending orders the whole result numerically', async ({ request }) => {
  const response = await request.get('/api/products?sort=price-asc');
  expect(response.status()).toBe(200);
  const prices: number[] = (await response.json()).products.map((p: Product) => p.price);
  expect(prices).toHaveLength(6);
  expect(prices).toEqual([...prices].sort((a, b) => a - b));
  expect(prices[0]).toBe(4900);
});
test('unsupported sort has a stable machine-readable error', async ({ request }) => {
  const response = await request.get('/api/products?sort=magic');
  expect(response.status()).toBe(400);
  expect((await response.json()).error.code).toBe('INVALID_SORT');
});
