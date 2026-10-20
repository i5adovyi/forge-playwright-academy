import { test, expect, shipping, credentials } from '../tests/support/fixtures';

test.skip('EX-09 · Catalog contract', async ({ request }) => {
  // TODO: GET /api/products. Assert 200, JSON content type, total 6,
  // six unique nonempty string IDs, positive integer prices,
  // non-negative integer stock, and p1 name. Assert Array.isArray before iterating;
  // exact IDs p1..p6; p2 name Mechanical Keyboard, price8900, categoryDesk.
  // TypeScript types do not validate JSON.
  expect(false, 'Implement every acceptance criterion before removing this sentinel').toBe(true);
});
test.skip('EX-10 · Query parameters', async ({ request }) => {
  // TODO: use params for category Audio + search HEAD; assert 200, total 1,
  // and exactly p1. Then HEAD + Desk =>200 empty: the positive example alone
  // would pass if the server ignored category entirely.
  // Query an impossible search, expect {products:[],total:0}, status 200.
  // Desk + price-asc must have IDs p4,p6,p2, prices5900,7900,8900, total3.
  // Fetch full catalog ascending AND descending. Anchor both to exact six IDs,
  // total6; ascending prices4900,5900,7900,8900,12900,14900. Compare descending
  // with a REVERSED COPY of ascending. Two empty results must never pass.
  // Unsupported sort 'sideways' =>400 INVALID_SORT, not a successful empty list.
  expect(false, 'Implement every acceptance criterion before removing this sentinel').toBe(true);
});
test.skip('EX-11 · Create then update', async ({ request }) => {
  // TODO: POST /api/cart p1 quantity 1, then p1 quantity 3.
  // Check each write succeeds. GET cart must have ONE p1 line, quantity 3,
  // unit price 12900, lineTotal/subtotal/total 38700, discount 0, promoCode null.
  // Repeat quantity3 and prove it remains3. Add p2 quantity1, delete p1:
  // complete cart contains only p2,total8900. Repeated delete of p1 =>404
  // CART_ITEM_NOT_FOUND, and a fresh GET must preserve that p2-only cart.
  expect(false, 'Implement every acceptance criterion before removing this sentinel').toBe(true);
});
test.skip('EX-12 · Boundary table', async ({ request }) => {
  // TODO: parameterize quantities 0, -1, 1.5, "2", 100 => 400.
  // Quantity 13 for p1 => 409. Check INVALID_QUANTITY vs INSUFFICIENT_STOCK.
  // In EACH independent case first seed p2 quantity 1 and SAVE10; snapshot
  // the entire cart (total 8010). After the rejected p1 write, compare the
  // entire cart with the snapshot. An initially empty cart hides destructive bugs.
  // In the stock case, finish with p1 quantity12 =>200 (the supported stock edge);
  // p2 and SAVE10 remain, total147330. A boundary needs an accepted neighbor too.
  expect(false, 'Implement every acceptance criterion before removing this sentinel').toBe(true);
});
test.skip('EX-13 · Authentication contract', async ({ request }) => {
  // TODO: seed p4 quantity 1 and snapshot the cart. Guest POST /api/orders with
  // otherwise valid shipping =>401 AUTH_REQUIRED and the same cart.
  // Wrong password =>
  // 401 INVALID_CREDENTIALS and /api/session user:null; cart stays unchanged.
  // Correct login => 200 with user.email; /api/orders is accessible and empty,
  // proving the rejected guest checkout created no hidden order.
  // Logout => 200 {user:null}; /api/orders => 401 AUTH_REQUIRED.
  // Cart remains unchanged through login and logout. Logout is not a cart reset.
  expect(false, 'Implement every acceptance criterion before removing this sentinel').toBe(true);
});
test.skip('EX-14 · Order lifecycle', async ({ request }) => {
  // TODO: sign in; p2 quantity 2; SAVE10; place order with shipping;
  // assert each setup status, then 201 and order items/arithmetic/customer/address.
  // Assert total 16020, ID ORD-0001, confirmed status, valid ISO createdAt,
  // and the complete order persisted in GET orders.
  // Compare the WHOLE empty cart: subtotal/discount/total 0 and promoCode null.
  // Add p4 to the next cart; assert total5900 and no promo. GET orders must still
  // equal the original snapshot. AP-04 extends this with a second purchase.
  expect(false, 'Implement every acceptance criterion before removing this sentinel').toBe(true);
});
test.skip('EX-15 · Session isolation', async ({ playwright, baseURL, request }) => {
  // TODO: use playwright.request.newContext with a unique x-lab-session.
  // Sign in and add a product in the first session; prove other is empty;
  // sign in and seed the other before resetting the first. Assert reset's
  // 200 {reset:true}, first empty/guest, and other's complete cart + identity.
  // Set storageState:{cookies:[],origins:[]} explicitly when creating other.
  // Dispose manually created contexts in finally even if an assertion fails.
  expect(false, 'Implement every acceptance criterion before removing this sentinel').toBe(true);
});
test.skip('EX-16 · Malformed and missing data', async ({ request }) => {
  // TODO: malformed JSON => 400 INVALID_BODY; unknown product => 404;
  // signed-in order missing city => 422 INVALID_ADDRESS.
  // Assert error shape and unchanged state, not just status.
  // Seed a nonempty cart AND SAVE10 BEFORE the invalid requests, snapshot it, then compare
  // the whole cart after EACH rejection. A later setup call can hide corruption.
  // Set Content-Type:application/json for the deliberately malformed string.
  expect(false, 'Implement every acceptance criterion before removing this sentinel').toBe(true);
});
