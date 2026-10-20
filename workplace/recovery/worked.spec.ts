import { randomUUID } from 'node:crypto';
import { test, expect, intent, control, evidence, assertCommittedBeforeLoss, fault } from './support';
import { recoverOrder, reconcileOrder, submitOrder } from './helper';

test('LR-01 API · committed response disappears and the same key recovers one order', async ({ request }) => {
  await control(request, 'immediate', true);
  const purchase = intent();
  let order;
  if (fault === 'regenerate-key') {
    // Deliberate client mutant: one business intent is retried with a new key.
    await submitOrder(request, purchase).catch(() => undefined);
    const response = await submitOrder(request, { ...purchase, key: randomUUID() });
    order = await response.json();
  } else order = await recoverOrder(request, purchase);
  const data = await evidence(request);
  assertCommittedBeforeLoss(data);
  expect(data.orders, 'LR01_SINGLE_EFFECT: recovery must not create another order').toHaveLength(1);
  expect(order).toEqual({ id: 'REC-001', customer: 'alice', sku: 'headphones', quantity: 1, total: 12900 });
  expect(data.orders).toEqual([{ id: 'REC-001', customer: 'alice', sku: 'headphones', quantity: 1, total: 12900 }]);
  expect(data.writes).toBe(2);
  expect(data.journal.filter(event => event.type === 'write-attempt').map(event => event.key)).toEqual([purchase.key, purchase.key]);
  expect(data.journal.filter(event => event.type === 'committed')).toHaveLength(1);
  expect(data.journal.filter(event => event.type === 'replay')).toHaveLength(1);
});

test('LR-01 browser · an uncertain purchase offers an explicit same-intent retry', async ({ request, page }) => {
  await control(request, 'immediate', true);
  await page.goto('/');
  await page.getByRole('button', { name: 'Buy headphones', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('Outcome unknown. Your purchase may already exist. Retry this same purchase.');
  await expect(page.getByRole('button', { name: 'Buy headphones', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Retry same purchase', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('Confirmed REC-001 · $129.00');
  const data = await evidence(request);
  assertCommittedBeforeLoss(data);
  expect(data.orders, 'LR01_BROWSER_SINGLE_EFFECT: one click and one recovery mean one order').toHaveLength(1);
  expect(data.orders).toEqual([{ id: 'REC-001', customer: 'alice', sku: 'headphones', quantity: 1, total: 12900 }]);
  expect(data.writes).toBe(2);
  const writes = data.journal.filter(event => event.type === 'write-attempt');
  expect(writes[0].key).toBeTruthy();
  expect(writes[1].key).toBe(writes[0].key);
  expect(data.journal.filter(event => event.type === 'replay')).toHaveLength(1);
  await expect(page.getByRole('button', { name: 'Retry same purchase' })).toBeHidden();
});

test('LR-02 replay · equivalent payload property order returns the original result', async ({ request }) => {
  await control(request);
  const purchase = intent();
  const first = await submitOrder(request, purchase);
  expect(first.status()).toBe(201);
  const original = await first.json();
  const replay = await request.post('/orders', {
    headers: { 'x-customer': 'alice', 'Idempotency-Key': purchase.key },
    data: { quantity: 1, sku: 'headphones' }, maxRetries: 0,
  });
  expect(replay.status()).toBe(200);
  expect(replay.headers()['idempotency-replayed']).toBe('true');
  expect(await replay.json()).toEqual(original);
  expect((await evidence(request)).orders).toEqual([original]);
});

test('LR-02 conflict · changed payload with the same key is rejected without mutation', async ({ request }) => {
  await control(request);
  const purchase = intent();
  const first = await submitOrder(request, purchase);
  expect(first.status()).toBe(201);
  const original = await first.json();
  const conflict = await submitOrder(request, { ...purchase, payload: { sku: 'headphones', quantity: 2 } });
  expect(conflict.status(), 'LR02_CONFLICT_STATUS: a changed intent cannot silently reuse a key').toBe(409);
  expect(await conflict.json()).toEqual({ error: { code: 'IDEMPOTENCY_CONFLICT' } });
  expect((await evidence(request)).orders).toEqual([original]);
  await expect(recoverOrder(request, { ...purchase, payload: { sku: 'headphones', quantity: 2 } }))
    .rejects.toThrow('RECOVERY_REJECTED: 409');
  // Initial purchase + direct conflict + one helper rejection: the HTTP 409
  // must not consume a second transport attempt.
  expect((await evidence(request)).writes).toBe(3);
  expect((await evidence(request)).orders).toEqual([original]);
  const lookup = await reconcileOrder(request, 'alice', purchase.key);
  expect(lookup).toEqual({ state: 'committed', order: original, lookups: 1 });
});

test('LR-02 scope · another customer and another key each create legitimate operations', async ({ request }) => {
  await control(request);
  const alice = intent('shared-intent-key');
  const bob = intent('shared-intent-key', 'bob');
  const secondAlice = intent('another-intent-key');
  for (const purchase of [alice, bob, secondAlice]) {
    expect((await submitOrder(request, purchase)).status()).toBe(201);
  }
  const data = await evidence(request);
  expect(data.orders).toEqual([
    { id: 'REC-001', customer: 'alice', sku: 'headphones', quantity: 1, total: 12900 },
    { id: 'REC-002', customer: 'bob', sku: 'headphones', quantity: 1, total: 12900 },
    { id: 'REC-003', customer: 'alice', sku: 'headphones', quantity: 1, total: 12900 },
  ]);
  const aliceLookup = await reconcileOrder(request, 'alice', alice.key);
  const bobLookup = await reconcileOrder(request, 'bob', bob.key);
  expect(aliceLookup.state === 'committed' && aliceLookup.order.id).toBe('REC-001');
  expect(bobLookup.state === 'committed' && bobLookup.order.id).toBe('REC-002');
});

test('LR-03 uncertain · pending forever exhausts three lookups without another write', async ({ request }) => {
  await control(request, 'pending', true);
  const purchase = intent();
  await expect(submitOrder(request, purchase)).rejects.toThrow();
  const result = await reconcileOrder(request, 'alice', purchase.key, fault === 'unbounded-lookups' ? 4 : 3);
  const data = await evidence(request);
  assertCommittedBeforeLoss(data);
  expect(result, 'LR03_BOUNDED_UNCERTAIN: pending is not absent and must exhaust exactly three reads').toEqual({ state: 'uncertain', lookups: 3 });
  expect(data.lookups).toBe(3);
  expect(data.writes, 'LR03_NO_EXTRA_WRITES: reconcile does not create another intent').toBe(1);
  expect(data.orders).toHaveLength(1);
});

test('LR-03 committed · a delayed lookup result resolves within the read budget', async ({ request }) => {
  await control(request, 'pending-once', true);
  const purchase = intent();
  await expect(submitOrder(request, purchase)).rejects.toThrow();
  const result = await reconcileOrder(request, 'alice', purchase.key);
  expect(result).toEqual({ state: 'committed', lookups: 2,
    order: { id: 'REC-001', customer: 'alice', sku: 'headphones', quantity: 1, total: 12900 } });
  const data = await evidence(request);
  assertCommittedBeforeLoss(data);
  expect(data.writes).toBe(1);
  expect(data.lookups).toBe(2);
});

test('LR-03 absent · an authoritative unused key is different from an unresolved key', async ({ request }) => {
  await control(request);
  const result = await reconcileOrder(request, 'alice', 'never-submitted-key');
  expect(result).toEqual({ state: 'absent', lookups: 1 });
  const data = await evidence(request);
  expect(data.writes).toBe(0);
  expect(data.orders).toEqual([]);
});

test('LR-01 exhausted API · two lost replies stop without a third write', async ({ request }) => {
  await control(request, 'immediate', true, 2);
  const purchase = intent();
  await expect(recoverOrder(request, purchase), 'LR01_EXHAUSTED: a second lost reply remains uncertain')
    .rejects.toThrow(`RECOVERY_UNCERTAIN: two transport attempts exhausted; reconcile key ${purchase.key}`);
  const data = await evidence(request);
  assertCommittedBeforeLoss(data);
  expect(data.writes, 'LR01_EXACT_ATTEMPT_BUDGET: stop after two transport attempts').toBe(2);
  expect(data.orders).toEqual([{ id: 'REC-001', customer: 'alice', sku: 'headphones', quantity: 1, total: 12900 }]);
  expect(data.journal.filter(event => event.type === 'write-attempt').map(event => event.key)).toEqual([purchase.key, purchase.key]);
  expect(data.journal.filter(event => event.type === 'committed')).toHaveLength(1);
  expect(data.journal.filter(event => event.type === 'replay')).toHaveLength(1);
  expect(data.journal.filter(event => event.type === 'reply-lost-on-replay').map(event => event.orderId)).toEqual(['REC-001']);
});

test('LR-01 exhausted browser · a second lost reply prevents another purchase attempt', async ({ request, page }) => {
  await control(request, 'immediate', true, 2);
  await page.goto('/');
  await page.getByRole('button', { name: 'Buy headphones', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('Outcome unknown. Your purchase may already exist. Retry this same purchase.');
  await page.getByRole('button', { name: 'Retry same purchase', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('Outcome still unknown. Stop submitting and reconcile this intent key.');
  await expect(page.getByRole('button', { name: 'Buy headphones', exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Retry same purchase', exact: true })).toBeHidden();
  const data = await evidence(request);
  assertCommittedBeforeLoss(data);
  expect(data.writes, 'LR01_BROWSER_EXACT_ATTEMPT_BUDGET: the UI permits only one explicit retry').toBe(2);
  expect(data.orders).toEqual([{ id: 'REC-001', customer: 'alice', sku: 'headphones', quantity: 1, total: 12900 }]);
  const writes = data.journal.filter(event => event.type === 'write-attempt');
  expect(writes[0].key).toBeTruthy();
  expect(writes[1].key).toBe(writes[0].key);
  expect(data.journal.filter(event => event.type === 'committed')).toHaveLength(1);
  expect(data.journal.filter(event => event.type === 'reply-lost-on-replay').map(event => event.orderId)).toEqual(['REC-001']);
});
