import { randomUUID } from 'node:crypto';
import {
  test, expect, openCart, seed, evidence, cartSnapshot, holdSearch,
  catalogueNames, headphonesCart, injectCartFault,
} from './support';

test('IN-01 · Check the setup boundary before testing the UI', async ({ page, request }, info) => {
  // The ticket wants one headphone. Thirteen exceeds the real stock of twelve.
  const setup = await seed(request, 'p1', 1);
  await evidence(info, 'setup-response', setup);
  expect(setup.status, 'Setup must seed one headphone before UI assertions').toBe(200);
  expect(setup.body).toEqual(headphonesCart);
  await injectCartFault(page, 'missing-item', info);
  await page.goto('/lab/');
  await expect(page.getByRole('button', { name: 'Cart (1)', exact: true }),
    'IN-01_CART_BADGE: one successfully seeded headphone must be visible').toBeVisible();
  const cart = await openCart(page);
  await expect(cart.getByTestId('cart-total')).toHaveText('$129.00');
});

test('IN-02 · Give each data owner a different server identity', async ({ page, request, browser, baseURL, sessionId }, info) => {
  const first = await seed(request, 'p1', 1);
  expect(first.status).toBe(200);
  const peerId = `incident-peer-${randomUUID()}`;
  const peer = await browser.newContext({ baseURL, extraHTTPHeaders: { 'x-lab-session': peerId } });
  try {
    const second = await seed(peer.request, 'p2', 1);
    expect(second.status).toBe(200);
    const firstCart = await cartSnapshot(request);
    const secondCart = await cartSnapshot(peer.request);
    await evidence(info, 'context-identities-and-carts', {
      separateBrowserContexts: peer !== page.context(),
      firstHeader: sessionId, secondHeader: peerId, firstCart, secondCart,
      schedule: ['A seeds headphones', 'B seeds keyboard', 'A refreshes its cart'],
    });
    expect(firstCart).toEqual(headphonesCart);
    expect(secondCart.items.map((item: { productId: string }) => item.productId)).toEqual(['p2']);
    expect(secondCart.total).toBe(8900);
    await injectCartFault(page, 'other-customer-item', info);
    await page.goto('/lab/');
    const cart = await openCart(page);
    await expect(cart.getByTestId('cart-total'),
      'IN-02_OWN_CART: customer A must retain only their $129 headphones').toHaveText('$129.00');
    await expect(cart.getByRole('heading', { level: 3 })).toHaveText(['Studio Headphones']);
  } finally {
    // Own and close every manually created context even after an assertion fails.
    await peer.close();
  }
});

test('IN-03 · Retry the DOM condition through the pending response', async ({ page }, info) => {
  await page.goto('/lab/');
  const names = page.locator('.product-card h3');
  await expect(names).toHaveText(catalogueNames);
  const held = await holdSearch(page, info);
  try {
    await page.getByRole('searchbox', { name: 'Search products' }).fill('headphones');
    await held.arrived;
    await evidence(info, 'before-response', { events: [...held.events], observed: await names.allTextContents() });
    // Start the web-first assertion before releasing the reply. It re-reads the
    // locator until the exact list is rendered; it does not retry an old array.
    const rendered = expect(names,
      'IN-03_FILTERED_NAMES: search must render exactly the matching headphone').toHaveText(['Studio Headphones']);
    await Promise.all([rendered, held.release()]);
    await expect(page.locator('#products')).toHaveAttribute('aria-busy', 'false');
  } finally {
    await held.release();
    await evidence(info, 'response-order', held.events);
  }
});
