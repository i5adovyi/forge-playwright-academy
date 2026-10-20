import { test, expect, addProduct, login, shipping } from '../tests/support/fixtures';

test.skip('EX-17 · Hybrid checkout', async ({ page, request }) => {
  // TODO: API login, p1 quantity1 and SAVE10; assert setup responses succeed.
  // Open the shop, observe signed-in UI and cart total $116.10; fill checkout.
  // Arm a POST /api/orders response listener BEFORE Place order; assert201.
  // Independently assert subtotal12900, discount1290, total11610 and p1 line.
  // Confirmation and receipt URL must identify this same response order.
  // Read GET /api/orders and compare the stored order, including shipping.
  // GET /api/cart must be fully empty, with zero totals and promoCode:null.
  // Shared fixtures provide the same session header to browser and API.
  expect(false, 'Implement every acceptance criterion before removing this sentinel').toBe(true);
});
test.skip('EX-18 · Service outage', async ({ page }) => {
  // TODO: route **/api/products?* to a 503 JSON error; assert useful alert, zero
  // product cards and NO "No products found" heading (an error is not empty data).
  // Remove the route; choose Desk and assert the complete featured sequence:
  // Mechanical Keyboard, Focus Lamp, Monitor Arm. Assert stale alert gone and
  // products aria-busy=false. Recovery uses the real backend.
  // Register route BEFORE navigation and document that this is a UI test.
  expect(false, 'Implement every acceptance criterion before removing this sentinel').toBe(true);
});
test.skip('EX-19 · Deterministic empty state', async ({ page }) => {
  // TODO: fulfill products route with {products:[],total:0};
  // assert no product cards, empty heading, clear-filter action, no error alert,
  // count text "0 essentials" and aria-busy=false. Distinguish this 200 contract
  // from EX-18's 503 error, even though both render zero cards.
  expect(false, 'Implement every acceptance criterion before removing this sentinel').toBe(true);
});
test.skip('EX-20 · Receipt download', async ({ page, request }) => {
  // TODO: place demo order; wait for download BEFORE clicking receipt;
  // assert ORD-0001.txt and read downloaded text for total + no payment note.
  expect(false, 'Implement every acceptance criterion before removing this sentinel').toBe(true);
});
test.skip('EX-21 · Mobile commerce', async ({ page }) => {
  // TODO: 390x844 viewport; add Focus Lamp; apply promo; expect $53.10.
  // Assert no horizontal overflow. Do not use device pixel coordinates.
  expect(false, 'Implement every acceptance criterion before removing this sentinel').toBe(true);
});
test.skip('EX-22 · Stock error preserves state', async ({ page, request }) => {
  // TODO: API seed p1 quantity 1; UI set quantity 13; assert error,
  // input restored to 1, total $129, API quantity unchanged.
  expect(false, 'Implement every acceptance criterion before removing this sentinel').toBe(true);
});
test.skip('EX-23 · Observe network without racing', async ({ page }) => {
  // TODO: use waitForResponse predicate before changing category to Video.
  // Assert response URL params, status 200, and one card for 4K Webcam.
  expect(false, 'Implement every acceptance criterion before removing this sentinel').toBe(true);
});
test.skip('EX-24 · Reset and recovery', async ({ page, request }) => {
  // TODO: login, add cart and create order; reset from lab UI;
  // prove UI signed out, cart empty, API orders inaccessible.
  // Log in again and prove previous order history was cleared.
  expect(false, 'Implement every acceptance criterion before removing this sentinel').toBe(true);
});
