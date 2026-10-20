import { test as base, expect } from '../../tests/support/fixtures';
import { ShopPage } from './shop.starter';

// Complete shop.starter.ts; do not change this import to the worked solution.
// This fixture wraps the runner-owned Page. It never launches or caches a browser.
const test = base.extend<{ shop: ShopPage }>({
  shop: async ({ page }, use) => { await use(new ShopPage(page)); },
});

test.skip('RF-01 · Refactor two consumers without weakening their oracles', async ({ shop, request }) => {
  await shop.goto(); // Intentionally throws until the starter is implemented.
  // TODO: replace this single placeholder with TWO independent named tests:
  // headphones p1 => $129.00 / 12900; lamp p4 => $59.00 / 5900.
  // Preserve baseline.spec.ts status, quantity, UI total, and ENTIRE persisted
  // cart assertions. Reuse focused objects/actions, not expected output derived
  // from the application or catch-all "assert everything" helpers.
  // Run each consumer alone, both with one worker, and both in parallel.
  // Keep the baseline while comparing; do not make it import the new POM.
  expect(false, 'RF-01: preserve both independent consumer contracts.').toBe(true);
});

test.skip('RF-02 · Test-scoped objects and locators survive rerenders', async ({ shop, request }) => {
  await shop.goto();
  // TODO: keep one ProductCard and one quantity Locator across actual DOM
  // replacement. Desk removes headphones, All restores them. Add headphones,
  // assert $129.00, change quantity to 3 via the same CartPanel and assert 3,
  // $387.00, and the exact persisted cart. Never retain ElementHandles.
  // The fixture must stay test-scoped: no shared Page/POM/context/global session.
  // Run the same controlled +$1 cart-total defect against baseline and refactor;
  // both must fail the same RF_CART_TOTAL_ORACLE. See README for evidence.
  expect(false, 'RF-02: preserve lifecycle ownership and rerender behavior.').toBe(true);
});
