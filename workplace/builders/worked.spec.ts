import { test, expect, login, addProduct } from '../../tests/support/fixtures';
import { buildCheckoutData, buildShipping, type ShippingInput } from './builders';
import { buildWithSharedDefaults } from './shared-default.counterexample';

test('DB-01 · Every default and override owns its nested data', async () => {
  // The proof runner substitutes a known shallow-copy bug for this one case.
  const build = process.env.FORGE_DB_SHARED_DEFAULT_FAULT === '1' ? buildWithSharedDefaults : buildCheckoutData;
  const first = build();
  const second = build();
  expect(first, 'DB_SHARED_DEFAULT_ORACLE').not.toBe(second);
  expect(first.shipping, 'DB_SHARED_DEFAULT_ORACLE').not.toBe(second.shipping);
  expect(first.items, 'DB_SHARED_DEFAULT_ORACLE').not.toBe(second.items);
  expect(first.items[0], 'DB_SHARED_DEFAULT_ORACLE').not.toBe(second.items[0]);
  first.shipping.name = 'Changed only in first';
  first.items[0].quantity = 7;
  first.items.push({ productId: 'p2', quantity: 1 });
  expect(second, 'DB_SHARED_DEFAULT_ORACLE').toEqual({
    shipping: { name: 'Alex Tester', address: '1 Test Lane', city: 'London', postalCode: 'SW1A 1AA' },
    items: [{ productId: 'p1', quantity: 1 }], promoCode: null,
  });
  expect(build()).toEqual(second);

  const overrides = {
    shipping: { city: 'Warsaw' },
    items: [{ productId: 'p4', quantity: 2 }],
    promoCode: 'SAVE10',
  };
  const customized = build(overrides);
  customized.shipping.city = 'Changed only in result';
  customized.items[0].quantity = 9;
  customized.items.push({ productId: 'p6', quantity: 1 });
  expect(overrides).toEqual({
    shipping: { city: 'Warsaw' },
    items: [{ productId: 'p4', quantity: 2 }],
    promoCode: 'SAVE10',
  });
  expect(build(overrides)).toEqual({
    shipping: { name: 'Alex Tester', address: '1 Test Lane', city: 'Warsaw', postalCode: 'SW1A 1AA' },
    items: [{ productId: 'p4', quantity: 2 }], promoCode: 'SAVE10',
  });
});

test('DB-01 · Input builder supports a real discounted order', async ({ request }) => {
  const data = buildCheckoutData({
    shipping: { city: 'Warsaw', postalCode: '00-001' },
    items: [{ productId: 'p1', quantity: 2 }, { productId: 'p2', quantity: 1 }],
    promoCode: 'SAVE10',
  });
  await login(request);
  for (const item of data.items) await addProduct(request, item.productId, item.quantity);
  expect((await request.post('/api/cart/promo', { data: { code: data.promoCode } })).status()).toBe(200);
  const placed = await request.post('/api/orders', { data: data.shipping });
  expect(placed.status()).toBe(201);
  const { order } = await placed.json();
  // Independent known expectations remain in the test. The builder supplies
  // only input; it does not reproduce production discount arithmetic.
  expect(order).toMatchObject({
    id: 'ORD-0001', customer: 'demo@forge.test', status: 'confirmed',
    items: [
      { productId: 'p1', name: 'Studio Headphones', price: 12900, quantity: 2, lineTotal: 25800 },
      { productId: 'p2', name: 'Mechanical Keyboard', price: 8900, quantity: 1, lineTotal: 8900 },
    ],
    subtotal: 34700, discount: 3470, total: 31230, promoCode: 'SAVE10',
    shipping: { name: 'Alex Tester', address: '1 Test Lane', city: 'Warsaw', postalCode: '00-001' },
  });
  const history = await request.get('/api/orders');
  expect(history.status()).toBe(200);
  expect(await history.json()).toEqual({ orders: [order] });
  const empty = await request.get('/api/cart');
  expect(empty.status()).toBe(200);
  expect(await empty.json()).toEqual({ items: [], subtotal: 0, discount: 0, total: 0, promoCode: null });
});

const fields: { name: keyof ShippingInput; maximum: number }[] = [
  { name: 'name', maximum: 120 },
  { name: 'address', maximum: 120 },
  { name: 'city', maximum: 120 },
  { name: 'postalCode', maximum: 20 },
];
const invalidValues = [
  { label: 'omitted', omitted: true },
  { label: 'empty', value: '' },
  { label: 'whitespace', value: ' \t\n ' },
  { label: 'number', value: 17 },
  { label: 'boolean', value: false },
  { label: 'null', value: null },
  { label: 'object', value: { text: 'London' } },
  { label: 'array', value: ['London'] },
] as const;
const discountedCart = {
  items: [
    { productId: 'p1', name: 'Studio Headphones', price: 12900, quantity: 2, lineTotal: 25800 },
    { productId: 'p2', name: 'Mechanical Keyboard', price: 8900, quantity: 1, lineTotal: 8900 },
  ],
  subtotal: 34700, discount: 3470, total: 31230, promoCode: 'SAVE10',
};

for (const field of fields) {
  const invalid = [...invalidValues, { label: 'over maximum', value: 'x'.repeat(field.maximum + 1) }];
  for (const example of invalid) {
    test(`DB-02 · ${field.name} rejects ${example.label} without mutation`, async ({ request }) => {
      // Authentication and JSON parsing reach address validation. The OTHER
      // three fields are valid; a discounted cart makes preservation observable.
      await login(request);
      await addProduct(request, 'p1', 2);
      await addProduct(request, 'p2', 1);
      expect((await request.post('/api/cart/promo', { data: { code: 'SAVE10' } })).status()).toBe(200);
      const before = await request.get('/api/cart');
      expect(before.status()).toBe(200);
      expect(await before.json()).toEqual(discountedCart);
      // Unknown is intentional at the API boundary. Do not widen the valid
      // builder's ShippingInput to accept malformed values or use "as any".
      const invalidShipping: Record<string, unknown> = { ...buildShipping() };
      if ('omitted' in example) delete invalidShipping[field.name];
      else invalidShipping[field.name] = example.value;
      const rejected = await request.post('/api/orders', { data: invalidShipping });
      expect(rejected.status(), 'DB_ADDRESS_STATUS_ORACLE').toBe(422);
      expect(await rejected.json()).toEqual({
        error: { code: 'INVALID_ADDRESS', message: 'Enter a name, street address, city, and postal code.' },
      });
      const after = await request.get('/api/cart');
      expect(after.status()).toBe(200);
      expect(await after.json()).toEqual(discountedCart);
      const history = await request.get('/api/orders');
      expect(history.status()).toBe(200);
      expect(await history.json()).toEqual({ orders: [] });
    });
  }

  for (const boundary of [
    { label: 'one character', input: 'x', saved: 'x' },
    { label: 'exact maximum', input: 'x'.repeat(field.maximum), saved: 'x'.repeat(field.maximum) },
    { label: 'padded maximum', input: ` \t${'x'.repeat(field.maximum)}\n `, saved: 'x'.repeat(field.maximum) },
  ]) {
    test(`DB-02 · ${field.name} accepts ${boundary.label}`, async ({ request }) => {
      await login(request);
      await addProduct(request, 'p1', 2);
      await addProduct(request, 'p2', 1);
      expect((await request.post('/api/cart/promo', { data: { code: 'SAVE10' } })).status()).toBe(200);
      const input = buildShipping({ [field.name]: boundary.input });
      const placed = await request.post('/api/orders', { data: input });
      expect(placed.status()).toBe(201);
      const { order } = await placed.json();
      expect(order).toMatchObject({
        ...discountedCart, id: 'ORD-0001', customer: 'demo@forge.test', status: 'confirmed',
        shipping: {
          name: 'Alex Tester', address: '1 Test Lane', city: 'London', postalCode: 'SW1A 1AA',
          [field.name]: boundary.saved,
        },
      });
      const history = await request.get('/api/orders');
      expect(history.status()).toBe(200);
      expect(await history.json()).toEqual({ orders: [order] });
      const emptied = await request.get('/api/cart');
      expect(emptied.status()).toBe(200);
      expect(await emptied.json()).toEqual({ items: [], subtotal: 0, discount: 0, total: 0, promoCode: null });
    });
  }
}
