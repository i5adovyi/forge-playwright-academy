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
  // TODO: search for "head", assert exactly one product card and its name.
  // Clear the field and assert all six return.
  // Constraint: locate the search field by its accessible name.
  expect(false, 'Implement every acceptance criterion before removing this sentinel').toBe(true);
});
test.skip('EX-03 · Empty results and recovery', async ({ page }) => {
  // TODO: search "quantum toaster", assert "No products found", clear filters,
  // and assert all six cards return with Search products empty.
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
  // TODO: add p1 via UI, open cart, quantity 2, assert $258.00,
  // remove it, assert empty state and Cart (0).
  expect(false, 'Implement every acceptance criterion before removing this sentinel').toBe(true);
});
test.skip('EX-07 · Discount arithmetic', async ({ page }) => {
  // TODO: p1 quantity 2 + p2 quantity 1 => subtotal $347.00.
  // Apply SAVE10 => discount $34.70 and total $312.30.
  // Submit SAVE10 a second time and prove it is not compounded.
  expect(false, 'Implement every acceptance criterion before removing this sentinel').toBe(true);
});
test.skip('EX-08 · Keyboard-only dialog', async ({ page }) => {
  // TODO: open Cart using keyboard activation, verify dialog is visible,
  // Escape to close, and verify focus returns to Cart.
  expect(false, 'Implement every acceptance criterion before removing this sentinel').toBe(true);
});
