import { test, expect, openCart, seed, evidence, cartSnapshot, holdSearch, catalogueNames } from './support';

// Deliberately faulty tests. The dedicated --broken command must exit nonzero.
// Diagnose the first unexpected event before opening worked.spec.ts.
test('IN-01 · A cart-badge timeout after API setup', async ({ page, request }, info) => {
  const setup = await seed(request, 'p1', 13);
  await evidence(info, 'setup-response', setup);
  // The inherited test ignores the setup status and blames the final timeout.
  await page.goto('/lab/');
  await expect(page.getByRole('button', { name: 'Cart (1)', exact: true }),
    'IN-01_CART_BADGE: one successfully seeded headphone must be visible').toBeVisible();
});

test('IN-02 · A cart changes after another context adds a keyboard', async ({ page, request, browser, baseURL, sessionId }, info) => {
  const first = await seed(request, 'p1', 1);
  expect(first.status).toBe(200);
  await page.goto('/lab/');
  await expect(page.getByRole('button', { name: 'Cart (1)', exact: true })).toBeVisible();
  const peer = await browser.newContext({ baseURL, extraHTTPHeaders: { 'x-lab-session': sessionId } });
  try {
    const second = await seed(peer.request, 'p2', 1);
    expect(second.status).toBe(200);
    await evidence(info, 'context-identities-and-carts', {
      separateBrowserContexts: peer !== page.context(),
      firstHeader: sessionId, secondHeader: sessionId,
      firstCart: await cartSnapshot(request), secondCart: await cartSnapshot(peer.request),
      schedule: ['A seeds headphones', 'B seeds keyboard', 'A refreshes its cart'],
    });
    // Deliberate interleaving reproduces shared-data interference without hoping
    // that two workers happen to race in a particular order.
    const cart = await openCart(page);
    await expect(cart.getByTestId('cart-total'),
      'IN-02_OWN_CART: customer A must retain only their $129 headphones').toHaveText('$129.00');
  } finally {
    await peer.close();
  }
});

test('IN-03 · Search fails while the requested response is still pending', async ({ page }, info) => {
  await page.goto('/lab/');
  const names = page.locator('.product-card h3');
  await expect(names).toHaveText(catalogueNames);
  const held = await holdSearch(page, info);
  try {
    await page.getByRole('searchbox', { name: 'Search products' }).fill('headphones');
    await held.arrived;
    const observed = await names.allTextContents();
    await evidence(info, 'premature-dom-snapshot', { events: [...held.events], observed });
    // allTextContents takes a snapshot. toEqual does not retry this old array.
    expect(observed, 'IN-03_FILTERED_NAMES: search must render exactly the matching headphone')
      .toEqual(['Studio Headphones']);
  } finally {
    await held.release();
    await evidence(info, 'response-order', held.events);
  }
});
