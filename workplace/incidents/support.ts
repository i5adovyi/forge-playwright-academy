import { expect, type APIRequestContext, type Page, type TestInfo } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
export { test, expect, openCart } from '../../tests/support/fixtures';

export const catalogueNames = [
  'Studio Headphones', 'Mechanical Keyboard', '4K Webcam',
  'Focus Lamp', 'Pocket Speaker', 'Monitor Arm',
];
export const emptyCart = { items: [], subtotal: 0, discount: 0, total: 0, promoCode: null };
export const headphonesCart = {
  items: [{ productId: 'p1', name: 'Studio Headphones', price: 12900, quantity: 1, lineTotal: 12900 }],
  subtotal: 12900, discount: 0, total: 12900, promoCode: null,
};

export async function evidence(info: TestInfo, name: string, value: unknown) {
  console.log(`${info.title.slice(0, 5)} ${name}: ${JSON.stringify(value)}`);
  const path = info.outputPath(`${name}.json`);
  await writeFile(path, JSON.stringify(value, null, 2));
  await info.attach(name, { path, contentType: 'application/json' });
}

export async function seed(request: APIRequestContext, productId: string, quantity: number) {
  const response = await request.post('/api/cart', { data: { productId, quantity } });
  return { request: { productId, quantity }, status: response.status(), body: await response.json() };
}

export async function cartSnapshot(request: APIRequestContext) {
  const response = await request.get('/api/cart');
  expect(response.status(), 'Evidence collection must succeed').toBe(200);
  return response.json();
}

/** A controlled response fault, not a change to the real API or an observed production bug. */
export async function injectCartFault(page: Page, kind: 'missing-item' | 'other-customer-item', info: TestInfo) {
  if (process.env.FORGE_INCIDENT_DEFECTS !== '1') return;
  let deliveries = 0;
  await page.route('**/api/cart', async route => {
    if (route.request().method() !== 'GET') return route.continue();
    const response = await route.fetch();
    expect(response.status(), 'The unmodified cart read must succeed').toBe(200);
    const cart = await response.json();
    if (kind === 'missing-item') {
      await route.fulfill({ response, json: emptyCart });
    } else {
      cart.items.push({ productId: 'p2', name: 'Mechanical Keyboard', price: 8900, quantity: 1, lineTotal: 8900 });
      cart.subtotal += 8900;
      cart.total += 8900;
      await route.fulfill({ response, json: cart });
    }
    await evidence(info, `controlled-cart-response-${++deliveries}`, {
      kind, deliveredStatus: response.status(), body: kind === 'missing-item' ? emptyCart : cart,
    });
  });
}

/** Holds one selected response until the test releases it; no sleep or CPU-speed assumption. */
export async function holdSearch(page: Page, info: TestInfo) {
  let enter!: () => void;
  let unblock!: () => void;
  let finish!: () => void;
  let failure: unknown;
  const arrived = new Promise<void>(resolve => { enter = resolve; });
  const blocked = new Promise<void>(resolve => { unblock = resolve; });
  const completed = new Promise<void>(resolve => { finish = resolve; });
  let entered = false;
  let released = false;
  const events: string[] = [];
  await page.route('**/api/products?*', async route => {
    const url = new URL(route.request().url());
    if (url.searchParams.get('search') !== 'headphones') return route.continue();
    entered = true;
    events.push('filtered request intercepted; response held');
    enter();
    try {
      await blocked;
      // A wrong item with the correct count proves an exact-membership assertion.
      if (process.env.FORGE_INCIDENT_DEFECTS === '1') url.searchParams.set('search', 'keyboard');
      const response = await route.fetch({ url: url.toString() });
      expect(response.status(), 'The held catalogue request must succeed').toBe(200);
      const body = await response.json();
      await evidence(info, 'catalogue-response', { status: response.status(), body });
      await route.fulfill({ response, json: body });
      events.push('filtered response delivered');
    } catch (error) {
      failure = error;
      await route.abort().catch(() => {});
    } finally {
      finish();
    }
  });
  return {
    arrived,
    events,
    async release() {
      if (!released) {
        released = true;
        events.push('test released response');
        unblock();
      }
      if (entered) await completed;
      if (failure) throw failure;
    },
  };
}

export function unfinished(id: string): void {
  throw new Error(`${id}_STARTER_NOT_IMPLEMENTED: replace the repair point; preserve the business assertion.`);
}
