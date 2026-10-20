import { test, expect, credentials, shipping } from '../tests/support/fixtures';

// Run one starter: npm run test:ui:practice -- --grep UI-01
// Remove .skip for one drill, implement ALL criteria, then remove the sentinel.
// The full reference is worked.spec.ts; the workbook is docs/UI-TESTING.md.
// Shared fixture session headers keep browser and API evidence in one fresh state.

test.skip('UI-01 · Native validation, server rejection, and correction', async ({ page, request }) => {
  // TODO: observe POST /api/login requests BEFORE interaction. Open Sign in,
  // leave email empty, fill password='wrong', and attempt submit.
  // Observe the email's native invalid event, validity.valueMissing=true,
  // email focus, no visible server alert, and zero POSTs. Avoid validationMessage
  // text (browser/locale dependent) and waits for a request that should not fire.
  // Fill credentials.email; arm a matching POST response wait before clicking.
  // Assert status 401 and INVALID_CREDENTIALS, exactly one observed request with
  // the intended body, visible error, preserved email, enabled button, and
  // /api/session user: null.
  // Correct ONLY the password, submit again; assert status 200, exactly two POSTs,
  // modal closed, Sign out focused, and /api/session identity = credentials.email.
  // The later real requests are positive controls for your zero-request observer.
  // Fault challenge: clear email on a rejected login; preservation must fail.
  expect(false, 'Distinguish native rejection, server rejection, and successful correction.').toBe(true);
});

test.skip('UI-02 · Guest recovery through a complete UI purchase', async ({ page, request }) => {
  // TODO: use UI actions for ALL journey setup (no API login/cart seeding):
  // add Studio Headphones, open cart, apply SAVE10 => $116.10. Continue as a guest.
  // Assert the specific sign-in recovery message and no checkout dialog.
  // Follow that instruction: close cart, sign in through UI using credentials,
  // reopen cart. Assert quantity 1, subtotal $129.00, discount $12.90, total $116.10,
  // and no stale error. Enter shipping in checkout without rebuilding the cart.
  // Arm POST /api/orders response before Place order; assert status 201 and
  // independent expectations: p1 quantity 1, price 12900, subtotal 12900,
  // discount 1290, total 11610, promo SAVE10, customer, shipping, confirmed
  // status, and ID ORD-0001. Match the confirmation and receipt URL.
  // Only now use API evidence: history must contain exactly that one order;
  // entire cart must be empty, all amounts zero, and promoCode null.
  // Close confirmation, assert Cart (0) focused; reopen cart and assert empty state.
  // Fault challenge: dropping the promo on login must fail BEFORE checkout.
  expect(false, 'Recover through the UI and prove the exact persisted purchase.').toBe(true);
});

test.skip('UI-03 · Failed checkout preserves input and retries once', async ({ page, request }) => {
  // TODO: API login, seed p1 quantity 1, and apply SAVE10.
  // Assert the exact discounted cart snapshot.
  // Open checkout and fill ALL shipping fields. Route exactly ONE browser
  // POST /api/orders to status 503 with useful error JSON before it reaches the server.
  // Register the response wait before submit; assert 503 and one fault activation.
  // Assert useful alert, enabled Place order, all four field values retained,
  // no success dialog, unchanged COMPLETE API cart and empty order history.
  // Retry WITHOUT refilling. One-shot route must now allow the REAL request:
  // assert 201, independent order fields and amounts (total 11610), same visible ID,
  // checkout closed, history exactly [order], and a fully empty cart.
  // This models explicit rejection BEFORE a server mutation. Do not claim
  // automatic retries are safe after ambiguous timeouts; idempotency is separate.
  // Fault challenge: reset the form in its error handler; retained-field checks fail.
  expect(false, 'Preserve useful state after failure and observe exactly one real order after retry.').toBe(true);
});

test.skip('UI-04 · The newest catalog selection survives an older response', async ({ page }) => {
  // TODO: start with all six cards; intercept product GETs before navigation.
  // For Desk only, route.fetch() the real response and assert its three expected
  // products; hold its delivery on a test-controlled promise. Other requests pass.
  // Select Desk; await evidence its response is held; select Video and assert
  // the WHOLE visible list is [4K Webcam]. Release Desk in try/finally.
  // IMPORTANT: then await proof the old Desk body was consumed by the app before
  // asserting Video remains selected, [4K Webcam], count 1, aria-busy=false,
  // and neither an error alert nor an empty-results heading is visible.
  // A response event/finished() followed by an already-true assertion can miss
  // a stale overwrite. See the reference's transparent Response.json observer:
  // a posted-message task marks completion after Forge's render microtasks.
  // Explain this lab-specific assumption; it is not a universal framework wait.
  // Always release the gate and unrouteAll({behavior:'wait'}) on failed assertions.
  // Fault challenge: remove the successful-response catalogVersion guard in a
  // temporary local app copy; the final whole-list assertion must fail with Desk.
  expect(false, 'Prove the last user selection wins after the older response has been processed.').toBe(true);
});
