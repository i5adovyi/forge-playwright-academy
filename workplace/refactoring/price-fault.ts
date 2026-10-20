import type { Page } from '@playwright/test';

// Controlled teaching fault: keep the real server and line data, corrupt ONLY
// the total delivered to the browser. This is not a production repair.
export async function installPriceFault(page: Page): Promise<void> {
  if (process.env.FORGE_RF_PRICE_FAULT !== '1') return;
  await page.route('**/api/cart', async route => {
    const response = await route.fetch();
    const cart = await response.json();
    if (cart.items?.length) cart.total += 100;
    await route.fulfill({ response, json: cart });
  });
}
