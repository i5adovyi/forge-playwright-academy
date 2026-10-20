import { test, expect } from '../tests/support/fixtures';

// Remove .skip from ONE exercise at a time. Keep the acceptance criteria.
// Run: npm run test:exercises -- --grep "EX-01"
test.skip('EX-01 · Your first observable outcome', async ({ page }) => {
  // TODO: visit /lab/, assert the page title contains "Forge Shop",
  // assert the heading "Good tools. Great work." is visible, and assert six cards.
  // Constraint: use a role locator and a web-first assertion. No sleeps.
  await page.goto('/lab/');
  expect(false, 'Replace this sentinel with your assertions').toBe(true);
});
test.skip('EX-02 · Search like a user', async ({ page }) => {
  // TODO: search for "head", assert the whole name list is [Studio Headphones].
  // Clear the field and assert the six names in documented featured order:
  // Studio Headphones, Mechanical Keyboard, 4K Webcam, Focus Lamp,
  // Pocket Speaker, Monitor Arm. A count alone can pass with wrong products.
  // Constraint: locate the search field by its accessible name.
  expect(false, 'Implement every acceptance criterion before removing this sentinel').toBe(true);
});
test.skip('EX-03 · Empty results and recovery', async ({ page }) => {
  // TODO: choose Desk and price-desc, then search "quantum toaster".
  // Assert "No products found" AND zero cards. Click Clear filters and assert
  // Search products empty, Category All, Sort by featured, and all six names
  // in featured order. The empty heading must disappear without a reload.
  expect(false, 'Implement every acceptance criterion before removing this sentinel').toBe(true);
});
test.skip('EX-04 · Category + sort', async ({ page }) => {
  // TODO: choose Desk, sort price low to high, assert exactly these names:
  // Focus Lamp, Monitor Arm, Mechanical Keyboard. Assert the entire sequence.
  expect(false, 'Implement every acceptance criterion before removing this sentinel').toBe(true);
});
test.skip('EX-05 · Unavailable products', async ({ page }) => {
  // TODO: assert Pocket Speaker exists, costs $49.00, and its Add button
  // is disabled. Scope assertions inside the product article.
  expect(false, 'Implement every acceptance criterion before removing this sentinel').toBe(true);
});
test.skip('EX-06 · Cart lifecycle', async ({ page }) => {
  // TODO: add p1 via UI, open cart, quantity 2, assert quantity AND $258.00.
  // Reload, reopen cart, and prove the quantity and total persisted.
  // Reuse one quantity Locator across re-renders: change to 3 => $387.00,
  // then to 2 => $258.00. Remove it, assert empty state and Cart (0).
  // Reload again and prove the cart is still empty.
  expect(false, 'Implement every acceptance criterion before removing this sentinel').toBe(true);
});
test.skip('EX-07 · Discount arithmetic', async ({ page }) => {
  // TODO: p1 quantity 2 + p2 quantity 1 => subtotal $347.00.
  // Apply SAVE10 => discount $34.70 and total $312.30.
  // Submit SAVE10 a second time and prove it is not compounded.
  // Arm a matching POST /api/cart/promo response wait BEFORE each click.
  // Assert each 200 response has subtotal 34700, discount 3470, total 31230.
  // After each response, assert rendered subtotal/discount/total, then reopen
  // the cart to refresh from persisted state. The same old UI value can pass
  // immediately; it is not evidence that the second action finished.
  expect(false, 'Implement every acceptance criterion before removing this sentinel').toBe(true);
});
test.skip('EX-08 · Keyboard activation and focus return', async ({ page }) => {
  // TODO: focus Cart as an explicit test setup, press Enter, verify the dialog
  // is visible, press Escape, and verify focus returns to Cart.
  // This proves activation/return from a known focus position. It does NOT
  // prove Tab reachability or a keyboard-only end-to-end journey; see AX-03.
  expect(false, 'Implement every acceptance criterion before removing this sentinel').toBe(true);
});
