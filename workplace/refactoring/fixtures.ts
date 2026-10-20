import { test as base, expect } from '../../tests/support/fixtures';
import { ShopPage } from './shop';

// Test scope is the default. Never cache a Page, locator, or POM in module state.
// Playwright tears down its Page/context even if a business assertion fails.
export const test = base.extend<{ shop: ShopPage }>({
  shop: async ({ page }, use) => {
    await use(new ShopPage(page));
  },
});
export { expect };
