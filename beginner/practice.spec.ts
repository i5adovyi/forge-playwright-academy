import { test, expect } from '../tests/support/fixtures';

// Start with docs/BEGINNER-START.md and lessons 00-01–00-06.
// Remove .skip from ONE selected test, implement every TODO, and replace its
// failing sentinel. Save before running. Skipped tests have not been completed.
// Run: npm run test:beginner:practice -- --grep BG-01
// TODO means work left for you. A sentinel is the deliberately failing expect
// line at the end of each case. Replace it with real checks, not an empty body.
// Keep the import, test title, opening line and final }); while learning.
// Write inside ONE test's braces. Leave every other test.skip in place.
// Need a smaller step? beginner/README.md has a hint ladder for each BG ID.
// A passing run without meaningful assertions does not complete an exercise.

test.skip('BG-01 · Values, types and an independent total', () => {
  const quantity = 2;
  const priceCents = 12900;
  // TODO: calculate the total; check quantity is a number and '2' is a string.
  // Check total against literal 25800, chosen before running the calculation.
  // Hint 1: * multiplies. Give that result a new name with const.
  // Hint 2: typeof value reports a type as text; toBe compares one value.
  // Before running, predict why quantity 3 would fail the ORIGINAL total check.
  expect(false, 'BG-01: implement the value and total checks').toBe(true);
});

test.skip('BG-02 · Read objects and arrays', () => {
  const product = { name: 'Studio Headphones', price: 12900 };
  const names = [product.name, 'Mechanical Keyboard'];
  // TODO: check price, first item, and the entire expected two-name array.
  // Hint: a dot reads a field; [0] reads the first item. toEqual checks all
  // array items in order. A length-only check would miss the wrong second name.
  expect(false, 'BG-02: implement object and array checks').toBe(true);
});

test.skip('BG-03 · A function and its boundary decisions', () => {
  // TODO: implement allowedQuantity(quantity: number): boolean for integers 1–99.
  // Check 0 -> false, 1 -> true, 99 -> true, 100 -> false, 1.5 -> false.
  // Do not derive the expected values by calling your own function again.
  // First write your five expected booleans on paper. Then write the function.
  // Hint: Number.isInteger asks about fractions; >= and <= include a boundary.
  // An early return finishes this call. The next call starts the function again.
  expect(false, 'BG-03: implement the function and all five checks').toBe(true);
});

test.skip('BG-04 · Await a value before using it', async () => {
  const observed: number[] = [];
  // TODO: use for...of over [1,2], await Promise.resolve(value * 2), push the
  // resolved value, then check observed against the literal array [2,4].
  // Hint: the loop body runs once per item. Push the resolved NUMBER, not the
  // Promise object. Read the optional missing-await experiment in README.md
  // only after the correct sequence passes; it is not a timed browser race.
  expect(false, 'BG-04: implement the awaited sequence').toBe(true);
});

test.skip('BG-05 · Open the shop and check its heading', async ({ page }) => {
  await page.goto('/lab/');
  // TODO: await a visible heading check for exact name 'Good tools. Great work.'.
  // Then do the temporary wrong-heading experiment from lesson 00-04; restore it.
  // Hint: getByRole describes the heading; toBeVisible actually checks it.
  // Keep the assertion's await. A locator declaration alone proves nothing.
  expect(false, 'BG-05: replace this sentinel with the heading assertion').toBe(true);
});

test.skip('BG-06 · Empty search and visible recovery', async ({ page }) => {
  // TODO: visit /lab/. Locate search by role searchbox and name Search products.
  // Fill quantum toaster; check No products found heading AND zero articles.
  // Fill head; check exactly one article, named Studio Headphones, and hidden
  // empty-state heading. Await actions/assertions; do not add a fixed sleep.
  // Work in three saved chunks, leaving this sentinel until all are complete:
  // 1. Navigate, name the search locator and name the empty heading locator.
  // 2. Fill the impossible query; check visible empty feedback, then card count.
  // 3. Fill the recovery query; check count AND product name AND hidden feedback.
  // API hints: locator.fill(text), expect(locator).toHaveCount(number),
  // expect(locator).toBeHidden(). These actions/locator assertions need await.
  // Read beginner/README.md BG-06 for the manual observation and smaller hints.
  expect(false, 'BG-06: implement empty and recovered result checks').toBe(true);
});

test.skip('BG-07 · Read and check a catalog response', async ({ request }) => {
  // TODO: GET /api/products with params search=head. Check status 200, parse JSON,
  // then check total 1, products length 1, first id p1 and name Studio Headphones.
  // Hint: params is the request option for the query, not part of the path text.
  // Await request.get; read response.status(); await response.json() separately.
  // body.products[0] is the first product. A 200 alone can hide the wrong item.
  expect(false, 'BG-07: implement status and independent body checks').toBe(true);
});

test.skip('BG-08 · Reject zero without changing the cart', async ({ request }) => {
  // TODO: GET cart, check 200 and empty items. POST /api/cart with productId p1
  // and quantity 0. Expect 400 and INVALID_QUANTITY. GET cart again, check 200,
  // then compare its full body with the initial cart. Keep one request session.
  // Work in three chunks: READ before -> attempt the REJECTED write -> READ after.
  // Give each response and its parsed body a different, descriptive name.
  // GET needs the path. POST also needs { data: { ...your input fields... } }.
  // An error body is data too: parse it, then read its error.code field.
  // Compare the final PARSED BODY with the saved before body using toEqual.
  // Do not compare a response object, call /api/reset, or start a second test.
  expect(false, 'BG-08: implement rejection and unchanged-state checks').toBe(true);
});
