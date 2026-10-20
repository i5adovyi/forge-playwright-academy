import type { Locator, Page } from '@playwright/test';
import { test, expect, addProduct, login, credentials, shipping, openCart } from '../tests/support/fixtures';

// These drills use the shop fixture's fresh x-lab-session header. Browser and
// request observe one server session; each test owns independent mutable data.
const emptyCart = { items: [], subtotal: 0, discount: 0, total: 0, promoCode: null };
const discountedHeadphones = {
  items: [{ productId: 'p1', name: 'Studio Headphones', price: 12900, quantity: 1, lineTotal: 12900 }],
  subtotal: 12900, discount: 1290, total: 11610, promoCode: 'SAVE10',
};

function postResponse(page: Page, path: string) {
  return page.waitForResponse(response =>
    new URL(response.url()).pathname === path && response.request().method() === 'POST');
}

async function fillShipping(form: Locator) {
  await form.getByLabel('Full name').fill(shipping.name);
  await form.getByLabel('Street address').fill(shipping.address);
  await form.getByLabel('City', { exact: true }).fill(shipping.city);
  await form.getByLabel('Postal code').fill(shipping.postalCode);
}

test('UI-01 · Native validation, server rejection, and correction', async ({ page, request }) => {
  const loginRequests: string[] = [];
  page.on('request', incoming => {
    if (new URL(incoming.url()).pathname === '/api/login' && incoming.method() === 'POST') {
      loginRequests.push(incoming.postData() || '');
    }
  });
  await page.goto('/lab/');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Your workspace awaits.' });
  const email = dialog.getByLabel('Email', { exact: true });
  const password = dialog.getByLabel('Password', { exact: true });
  const submit = dialog.getByRole('button', { name: 'Sign in', exact: true });
  await password.fill('wrong');

  // Native invalid is an observable browser event. Do not hardcode its
  // locale-dependent validationMessage, or wait for a request that cannot fire.
  await email.evaluate(input => {
    input.addEventListener('invalid', () => input.setAttribute('data-invalid-observed', 'true'), { once: true });
  });
  await submit.click();
  await expect(email).toHaveAttribute('data-invalid-observed', 'true');
  expect(await email.evaluate(input => (input as HTMLInputElement).validity.valueMissing)).toBe(true);
  await expect(email).toBeFocused();
  expect(loginRequests).toHaveLength(0);
  await expect(dialog.getByRole('alert')).not.toBeVisible();

  await email.fill(credentials.email);
  const rejected = postResponse(page, '/api/login'); // Register before triggering.
  await submit.click();
  const denial = await rejected;
  expect(denial.status()).toBe(401);
  expect(await denial.json()).toMatchObject({ error: { code: 'INVALID_CREDENTIALS' } });
  expect(loginRequests).toHaveLength(1); // Positive control for the request observer.
  expect(JSON.parse(loginRequests[0])).toEqual({ email: credentials.email, password: 'wrong' });
  await expect(dialog.getByRole('alert')).toHaveText('Email or password is incorrect.');
  await expect(email).toHaveValue(credentials.email);
  await expect(submit).toBeEnabled();
  const guest = await request.get('/api/session');
  expect(guest.status()).toBe(200);
  expect((await guest.json()).user).toBeNull();

  await password.fill(credentials.password);
  const corrected = postResponse(page, '/api/login');
  await submit.click();
  expect((await corrected).status()).toBe(200);
  expect(loginRequests).toHaveLength(2);
  await expect(dialog).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign out', exact: true })).toBeFocused();
  const member = await request.get('/api/session');
  expect(member.status()).toBe(200);
  expect((await member.json()).user.email).toBe(credentials.email);
});

test('UI-02 · Guest recovery through a complete UI purchase', async ({ page, request }) => {
  // All setup that defines this user journey happens through the UI.
  await page.goto('/lab/');
  await page.getByRole('button', { name: 'Add Studio Headphones to cart' }).click();
  const cart = await openCart(page);
  await expect(cart.getByTestId('cart-total')).toHaveText('$129.00');
  await cart.getByLabel('Promo code').fill('SAVE10');
  const promotion = postResponse(page, '/api/cart/promo');
  await cart.getByRole('button', { name: 'Apply promo' }).click();
  expect((await promotion).status()).toBe(200);
  await expect(cart.getByTestId('cart-total')).toHaveText('$116.10');
  await cart.getByRole('button', { name: 'Continue to checkout' }).click();
  await expect(cart.getByRole('alert')).toHaveText('Sign in before checkout. Close this cart and choose Sign in.');
  await expect(page.getByRole('dialog', { name: 'The details.' })).not.toBeVisible();

  await cart.getByRole('button', { name: 'Close cart' }).click();
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  const loginDialog = page.getByRole('dialog', { name: 'Your workspace awaits.' });
  await loginDialog.getByLabel('Email', { exact: true }).fill(credentials.email);
  await loginDialog.getByLabel('Password', { exact: true }).fill(credentials.password);
  const signedIn = postResponse(page, '/api/login');
  await loginDialog.getByRole('button', { name: 'Sign in', exact: true }).click();
  expect((await signedIn).status()).toBe(200);
  await expect(loginDialog).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign out', exact: true })).toBeVisible();
  await openCart(page);
  await expect(cart.getByLabel('Quantity for Studio Headphones')).toHaveValue('1');
  await expect(cart.getByTestId('cart-subtotal')).toHaveText('$129.00');
  await expect(cart.getByTestId('cart-discount')).toHaveText('−$12.90 · SAVE10');
  await expect(cart.getByTestId('cart-total')).toHaveText('$116.10');
  await expect(cart.getByRole('alert')).not.toBeVisible();
  await cart.getByRole('button', { name: 'Continue to checkout' }).click();
  const checkout = page.getByRole('dialog', { name: 'The details.' });
  await fillShipping(checkout);
  const placed = postResponse(page, '/api/orders');
  await checkout.getByRole('button', { name: 'Place order' }).click();
  const response = await placed;
  expect(response.status()).toBe(201);
  const { order } = await response.json();
  expect(order).toMatchObject({
    ...discountedHeadphones, id: 'ORD-0001', status: 'confirmed', customer: credentials.email, shipping,
  });
  const confirmation = page.getByRole('dialog', { name: "You're all set." });
  await expect(confirmation).toBeVisible();
  await expect(confirmation).toContainText(order.id);
  await expect(confirmation.getByRole('link', { name: 'Download receipt' }))
    .toHaveAttribute('href', `/api/orders/${order.id}/receipt`);
  const history = await request.get('/api/orders');
  expect(history.status()).toBe(200);
  expect(await history.json()).toEqual({ orders: [order] });
  const cleared = await request.get('/api/cart');
  expect(cleared.status()).toBe(200);
  expect(await cleared.json()).toEqual(emptyCart);
  await confirmation.getByRole('button', { name: 'Close order confirmation' }).click();
  await expect(page.getByRole('button', { name: 'Cart (0)', exact: true })).toBeFocused();
  await openCart(page);
  await expect(cart.getByRole('heading', { name: 'Your cart is empty' })).toBeVisible();
});

test('UI-03 · Failed checkout preserves input and retries once', async ({ page, request }) => {
  await login(request);
  await addProduct(request);
  const promotion = await request.post('/api/cart/promo', { data: { code: 'SAVE10' } });
  expect(promotion.status()).toBe(200);
  expect(await promotion.json()).toEqual(discountedHeadphones);
  await page.goto('/lab/');
  const cart = await openCart(page);
  await expect(cart.getByTestId('cart-total')).toHaveText('$116.10');
  await cart.getByRole('button', { name: 'Continue to checkout' }).click();
  const checkout = page.getByRole('dialog', { name: 'The details.' });
  const submit = checkout.getByRole('button', { name: 'Place order' });
  await fillShipping(checkout);

  // Exactly one browser response is synthetic. No request reaches the server
  // on this attempt; this does not model an ambiguous timeout after a commit.
  let outageResponses = 0;
  await page.route('**/api/orders', async route => {
    expect(route.request().method()).toBe('POST');
    outageResponses++;
    await route.fulfill({
      status: 503,
      json: { error: { code: 'UNAVAILABLE', message: 'Checkout is temporarily unavailable. Try again.' } },
    });
  }, { times: 1 });
  const failed = postResponse(page, '/api/orders');
  await submit.click();
  expect((await failed).status()).toBe(503);
  expect(outageResponses).toBe(1);
  await expect(checkout.getByRole('alert')).toHaveText('Checkout is temporarily unavailable. Try again.');
  await expect(submit).toBeEnabled();
  await expect(checkout.getByLabel('Full name')).toHaveValue(shipping.name);
  await expect(checkout.getByLabel('Street address')).toHaveValue(shipping.address);
  await expect(checkout.getByLabel('City', { exact: true })).toHaveValue(shipping.city);
  await expect(checkout.getByLabel('Postal code')).toHaveValue(shipping.postalCode);
  await expect(page.getByRole('dialog', { name: "You're all set." })).not.toBeVisible();
  const preserved = await request.get('/api/cart');
  expect(preserved.status()).toBe(200);
  expect(await preserved.json()).toEqual(discountedHeadphones);
  const beforeRetry = await request.get('/api/orders');
  expect(beforeRetry.status()).toBe(200);
  expect(await beforeRetry.json()).toEqual({ orders: [] });

  // Do not refill the form. Retrying the retained input is the requirement.
  const retry = postResponse(page, '/api/orders');
  await submit.click();
  const accepted = await retry;
  expect(accepted.status()).toBe(201);
  expect(outageResponses).toBe(1);
  const { order } = await accepted.json();
  expect(order).toMatchObject({
    ...discountedHeadphones, id: 'ORD-0001', status: 'confirmed', customer: credentials.email, shipping,
  });
  const confirmation = page.getByRole('dialog', { name: "You're all set." });
  await expect(confirmation).toContainText(order.id);
  await expect(checkout).not.toBeVisible();
  const history = await request.get('/api/orders');
  expect(history.status()).toBe(200);
  expect(await history.json()).toEqual({ orders: [order] });
  const cleared = await request.get('/api/cart');
  expect(cleared.status()).toBe(200);
  expect(await cleared.json()).toEqual(emptyCart);
});

type CatalogProbe = Window & { catalogJsonTurns: string[] };

test('UI-04 · The newest catalog selection survives an older response', async ({ page }) => {
  // Test-only observation, not a product readiness API. Forge renders directly
  // in promise continuations after response.json(). A posted message runs in a
  // later task after those microtasks drain. It proves the older body was
  // consumed before the final assertion; response.finished() alone does not.
  // Revisit this probe if the app moves rendering into timers/framework effects.
  await page.addInitScript(() => {
    const probe = window as unknown as CatalogProbe;
    probe.catalogJsonTurns = [];
    window.addEventListener('message', event => {
      if (event.source === window && event.data?.type === 'forge-ui-catalog-json') {
        probe.catalogJsonTurns.push(event.data.category);
      }
    });
    const originalJson = Response.prototype.json;
    Response.prototype.json = async function () {
      const data = await originalJson.call(this);
      const url = new URL(this.url, location.href);
      if (url.pathname === '/api/products') {
        window.postMessage({ type: 'forge-ui-catalog-json', category: url.searchParams.get('category') }, location.origin);
      }
      return data;
    };
  });

  let releaseDesk!: () => void;
  const deskGate = new Promise<void>(resolve => { releaseDesk = resolve; });
  let markDeskHeld!: () => void;
  const deskHeld = new Promise<void>(resolve => { markDeskHeld = resolve; });
  await page.route('**/api/products?*', async route => {
    if (new URL(route.request().url()).searchParams.get('category') !== 'Desk') {
      await route.continue();
      return;
    }
    // Fetch the real response, but delay delivery to the browser deterministically.
    const response = await route.fetch();
    try {
      expect(response.status()).toBe(200);
      expect((await response.json()).products.map((product: { name: string }) => product.name))
        .toEqual(['Mechanical Keyboard', 'Focus Lamp', 'Monitor Arm']);
      markDeskHeld();
      await deskGate;
      await route.fulfill({ response });
    } finally {
      await response.dispose();
    }
  });

  try {
    await page.goto('/lab/');
    await expect(page.locator('.product-card')).toHaveCount(6);
    await page.getByLabel('Category', { exact: true }).selectOption('Desk');
    await deskHeld;
    await page.getByLabel('Category', { exact: true }).selectOption('Video');
    await expect(page.locator('.product-card h3')).toHaveText(['4K Webcam']);
    releaseDesk();
    await expect.poll(() => page.evaluate(() => (window as unknown as CatalogProbe).catalogJsonTurns))
      .toContain('Desk');
    await expect(page.getByLabel('Category', { exact: true })).toHaveValue('Video');
    await expect(page.locator('.product-card h3')).toHaveText(['4K Webcam']);
    await expect(page.locator('#product-count')).toHaveText('1 essentials');
    await expect(page.locator('#products')).toHaveAttribute('aria-busy', 'false');
    await expect(page.locator('#catalog-error')).not.toBeVisible();
    await expect(page.getByRole('heading', { name: 'No products found' })).not.toBeVisible();
  } finally {
    releaseDesk(); // A failed assertion must never leave a held route behind.
    await page.unrouteAll({ behavior: 'wait' });
  }
});
