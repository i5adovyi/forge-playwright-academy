import { test, expect } from '../../tests/support/fixtures';
import { buildCheckoutData, buildShipping } from './builders.starter';

test.skip('DB-01 · Typed builders must return independent data', async ({ request }) => {
  const first = buildCheckoutData(); // Intentionally throws until implemented.
  // TODO: call the builder twice, mutate first.shipping, first.items[0], and its
  // array. Assert the second and a later default are EXACTLY unchanged.
  // Repeat with caller-supplied shipping/item overrides: mutation of a returned
  // object must not change the caller's nested input or a later build.
  // Register a separate positive API test: login, p1 x2 + p2 x1, SAVE10,
  // city Warsaw/postal 00-001 => one confirmed ORD-0001 total 31230,
  // exact line values, history [order], and whole cart empty after purchase.
  // Keep expected money independent of the builder and application internals.
  expect(false, 'DB-01: prove fresh defaults, override ownership, and a real consumer.').toBe(true);
});

test.skip('DB-02 · Register independent shipping validation and boundary cases', async ({ request }) => {
  const valid = buildShipping();
  // TODO: replace this placeholder with separately registered cases, not one
  // giant test loop. Fields: name/address/city max120, postalCode max20.
  // For EACH field reject: omitted, empty, whitespace-only, number, boolean,
  // null, object, array, and maximum+1. One bad field per case.
  // For EACH field accept: one character, exact maximum, padded maximum.
  // Limits apply to trimmed JavaScript string length, NOT raw length.
  // That is 36 rejected +12 accepted cases, discoverable with --list.
  // For EVERY rejection: fresh session, valid login, p1 x2+p2 x1, SAVE10;
  // exact 422 INVALID_ADDRESS, entire discounted cart unchanged, history empty.
  // For EVERY accepted control: 201, exact normalized shipping and known money,
  // history exactly [order], and entire cart empty. Preserve independent values.
  // Malformed payloads belong in Record<string, unknown>, not a widened valid
  // ShippingInput type. Do not use assertions that accept any 4xx status.
  expect(false, 'DB-02: enumerate 48 independent cases and validate the intended layer.').toBe(true);
});
