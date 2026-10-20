import {
  test, expect, openCart, seed, evidence, cartSnapshot, holdSearch,
  catalogueNames, injectCartFault, unfinished,
} from './support';

// Enable explicitly: npm run test:incidents:practice -- --enable-starters --grep IN-01
// Replace only the repair points and sentinel. Keep the business assertions.
// An enabled untouched starter must fail rather than becoming a false green.
test.beforeEach(() => {
  test.skip(process.env.FORGE_INCIDENT_ENABLE_STARTERS !== '1', 'Unfinished incident repair; enable after implementing it.');
});

test('IN-01 · Repair setup while preserving the cart requirement', async ({ page, request }, info) => {
  const setup = await seed(request, 'p1', 13); // TODO: what data does the ticket require?
  await evidence(info, 'setup-response', setup);
  // TODO: validate the setup status and exact cart before entering the UI.
  unfinished('IN-01');
  await injectCartFault(page, 'missing-item', info);
  await page.goto('/lab/');
  await expect(page.getByRole('button', { name: 'Cart (1)', exact: true }),
    'IN-01_CART_BADGE: one successfully seeded headphone must be visible').toBeVisible();
  const cart = await openCart(page);
  await expect(cart.getByTestId('cart-total')).toHaveText('$129.00');
});

test('IN-02 · Repair data ownership while retaining the interleaving', async ({ page, request, browser, baseURL, sessionId }, info) => {
  expect((await seed(request, 'p1', 1)).status).toBe(200);
  const peerIdentity = sessionId; // TODO: assign another customer's independent server identity.
  const peer = await browser.newContext({ baseURL, extraHTTPHeaders: { 'x-lab-session': peerIdentity } });
  try {
    expect((await seed(peer.request, 'p2', 1)).status).toBe(200);
    await evidence(info, 'context-identities-and-carts', {
      firstHeader: sessionId, secondHeader: peerIdentity,
      firstCart: await cartSnapshot(request), secondCart: await cartSnapshot(peer.request),
    });
    // TODO: prove both customers still own exactly their intended data.
    unfinished('IN-02');
    await injectCartFault(page, 'other-customer-item', info);
    await page.goto('/lab/');
    const cart = await openCart(page);
    await expect(cart.getByTestId('cart-total'),
      'IN-02_OWN_CART: customer A must retain only their $129 headphones').toHaveText('$129.00');
  } finally {
    await peer.close();
  }
});

test('IN-03 · Repair observation while preserving exact membership', async ({ page }, info) => {
  await page.goto('/lab/');
  const names = page.locator('.product-card h3');
  await expect(names).toHaveText(catalogueNames);
  const held = await holdSearch(page, info);
  try {
    await page.getByRole('searchbox', { name: 'Search products' }).fill('headphones');
    await held.arrived;
    await evidence(info, 'before-response', { events: [...held.events], observed: await names.allTextContents() });
    // TODO: replace this snapshot check with a retrying DOM assertion. Coordinate
    // response release, retain exact ['Studio Headphones'], and await both tasks.
    unfinished('IN-03');
    const observed = await names.allTextContents();
    expect(observed, 'IN-03_FILTERED_NAMES: search must render exactly the matching headphone')
      .toEqual(['Studio Headphones']);
  } finally {
    await held.release();
    await evidence(info, 'response-order', held.events);
  }
});
