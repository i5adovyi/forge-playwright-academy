import { test, expect, shipping, credentials } from '../tests/support/fixtures';

test.skip('EX-09 · Catalog contract', async ({ request }) => {
  // TODO: GET /api/products. Assert 200, JSON content type, six unique IDs,
  // positive integer prices, non-negative integer stock, and p1 name.
  expect(false, 'Implement every acceptance criterion before removing this sentinel').toBe(true);
});
test.skip('EX-10 · Query parameters', async ({ request }) => {
  // TODO: query category Audio + search HEAD, expect exactly p1.
  // Query an impossible search, expect {products:[],total:0}, status 200.
  expect(false, 'Implement every acceptance criterion before removing this sentinel').toBe(true);
});
test.skip('EX-11 · Create then update', async ({ request }) => {
  // TODO: POST /api/cart p1 quantity 1, then p1 quantity 3.
  // GET cart must have ONE line, quantity 3, total 38700.
  expect(false, 'Implement every acceptance criterion before removing this sentinel').toBe(true);
});
test.skip('EX-12 · Boundary table', async ({ request }) => {
  // TODO: parameterize quantities 0, -1, 1.5, "2", 100 => 400.
  // Quantity 13 for p1 => 409. GET cart remains empty after each.
  expect(false, 'Implement every acceptance criterion before removing this sentinel').toBe(true);
});
test.skip('EX-13 · Authentication contract', async ({ request }) => {
  // TODO: wrong password => 401; correct => 200 with user.email;
  // POST /api/logout; GET /api/orders => 401.
  expect(false, 'Implement every acceptance criterion before removing this sentinel').toBe(true);
});
test.skip('EX-14 · Order lifecycle', async ({ request }) => {
  // TODO: sign in; p2 quantity 2; SAVE10; place order with shipping;
  // assert 201, total 16020, persisted in GET orders, cart empty.
  expect(false, 'Implement every acceptance criterion before removing this sentinel').toBe(true);
});
test.skip('EX-15 · Session isolation', async ({ playwright, baseURL, request }) => {
  // TODO: use playwright.request.newContext with a unique x-lab-session.
  // Add a product in one session; prove other is empty; reset first;
  // prove second retains its own data. Dispose manually created contexts.
  expect(false, 'Implement every acceptance criterion before removing this sentinel').toBe(true);
});
test.skip('EX-16 · Malformed and missing data', async ({ request }) => {
  // TODO: malformed JSON => 400 INVALID_BODY; unknown product => 404;
  // signed-in order missing city => 422 INVALID_ADDRESS.
  // Assert error shape and unchanged state, not just status.
  // Seed a nonempty cart BEFORE the invalid requests, snapshot it, then compare
  // the whole cart after EACH rejection. A later setup call can hide corruption.
  expect(false, 'Implement every acceptance criterion before removing this sentinel').toBe(true);
});
