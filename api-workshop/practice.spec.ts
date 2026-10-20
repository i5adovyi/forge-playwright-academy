import { test, expect } from '@playwright/test';
import { credentials, shipping } from '../tests/support/fixtures';

// Run one starter with npm run test:api:practice -- --grep AP-01.
// Remove .skip and replace the sentinel only after implementing ALL criteria.
// A skipped assignment is unfinished; the reference is worked.spec.ts.
// These API-only tests use cookie sessions, not the shop fixture's session header.
test.use({ storageState: { cookies: [], origins: [] }, extraHTTPHeaders: {} });

test.skip('AP-01 · request policy and response ownership', async ({ playwright, baseURL }) => {
  // TODO: own a standalone API context with baseURL, explicit empty storage/headers,
  // timeout:5000 and failOnStatusCode:true. Wrap its lifetime in try/finally.
  // As a guest GET /api/orders with failOnStatusCode:false; assert401,
  // JSON content type, AUTH_REQUIRED and a nonblank message. Dispose that response.
  // The same request without the override must reject with a 401 HTTP error.
  // Sign in with credentials; read and assert /api/session, then dispose THAT
  // APIResponse. Its body() must now reject, but another /api/session still works.
  // Save storageState in memory; dispose the API context with an explicit reason.
  // Requests through that disposed client must reject with that reason.
  // An observer created from the saved state must still be signed in: disposing
  // a client is not logout/reset. Dispose the observer in its own finally.
  // Fault challenge: remove response.dispose(); the body-rejection oracle must fail.
  expect(false, 'Implement and observe response lifetime, context lifetime, and HTTP error policy.').toBe(true);
});

test.skip('AP-02 · raw JSON and UTF-8 byte boundaries preserve valid state', async ({ request }) => {
  // TODO: seed p2 quantity2 + SAVE10; assert total16020 and snapshot the WHOLE cart.
  // Send strings with Content-Type:application/json. Each of "{broken", "null",
  // "[]", "false", "42", and "\"hello\"" must be400 INVALID_BODY.
  // After EVERY rejection, immediately GET and compare the complete seeded cart.
  // Construct a VALID JSON object for p2 quantity2 padded to EXACTLY16384 UTF-8
  // bytes. It must be200 and leave the same cart. Do not infer bytes from .length.
  // One extra trailing ASCII space (valid JSON whitespace) must be413 INVALID_BODY.
  // A body containing "界".repeat(6000) has <16384 JS code units but >16384 bytes;
  // assert both measurements, then413 INVALID_BODY and identical cart.
  // Validate JSON error content type, exact code and nonblank message.
  // Finally a valid p2 quantity1 write must work, preserving promo,total8010.
  // Fault challenge: clearing cart OR promo on rejection must fail preservation.
  expect(false, 'Prove byte boundaries and non-destructive failures with populated discounted state.').toBe(true);
});

test.skip('AP-03 · receipt ownership across independent sessions', async ({ playwright, baseURL }) => {
  // TODO: create two independently owned API contexts with explicit empty
  // storageState and headers. Protect the first before allocating the second.
  // A signs in and buys p1qty1 =>ORD-0001,total12900.
  // B guest GET that receipt =>401 AUTH_REQUIRED. B signs in with the SAME demo
  // credentials but has no order: receipt =>404 ORDER_NOT_FOUND; history stays[].
  // B buys p4qty1 =>its own ORD-0001,total5900. Assert equal IDs, different receipts.
  // Each receipt:200, text/plain, Content-Disposition attachment filename
  // ORD-0001.txt, correct product/total and absence of the OTHER product/total.
  // Logout A; its receipt=>401 AUTH_REQUIRED; B stays signed in and keeps its receipt.
  // This demonstrates SESSION ownership, not roles or two real account identities.
  // Fault challenge: selecting another session's matching order must fail text checks.
  expect(false, 'Observe guest denial, signed-in absence and independently owned overlapping IDs.').toBe(true);
});

test.skip('AP-04 · immutable order history after another purchase', async ({ request }) => {
  // TODO: sign in, p2qty2+SAVE10, then order with shipping =>201,ORD-0001.
  // Assert exact item/price/quantity, subtotal17800,discount1780,total16020,
  // customer,shipping,status and a valid ISO createdAt; keep the full response.
  // GET history must equal [firstOrder]. WHOLE cart must be empty,allamounts0,promonull.
  // Add p4qty1. Immediately re-read history: firstOrder is UNCHANGED.
  // Place a second order with shipping.city='Warsaw' =>201,ORD-0002,total5900,no discount.
  // GET history must equal [firstOrder,secondOrder]; first shipping/items/promo
  // remain unchanged. Check first receipt still names keyboard/total$160.20.
  // Repeat checkout while empty =>409 EMPTY_CART; history stays exactly those2.
  // Fault challenge: modifying an existing order when a later cart write happens
  // must fail at the intermediate history check, before another POST can hide it.
  expect(false, 'Verify immutable snapshots, exact arithmetic, and history after success and rejection.').toBe(true);
});
