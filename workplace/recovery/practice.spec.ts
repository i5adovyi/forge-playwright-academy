import { test, expect, intent, control, evidence } from './support';
import { recoverOrder, reconcileOrder, verifyIdempotencyContract } from './helper.starter';
import { submitOrder } from './helper';

test.skip(!process.env.FORGE_RECOVERY_ENABLE_STARTERS || process.env.FORGE_RECOVERY_ENABLE_STARTERS === '0',
  'Unfinished assignment. Run --practice --enable-starters to make the sentinel fail.');

test('LR-01 starter · recover one purchase in the API and browser', async ({ request }) => {
  await control(request, 'immediate', true);
  const purchase = intent();
  const result = await recoverOrder(request, purchase);
  // TODO: prove disk journal commit-before-loss, two write attempts with same key,
  // one effect, one replay, independently specified ID/customer/payload/money.
  // Add a second separately registered browser test using the provided shop.
  // Add API/browser exhaustion tests with control(request, 'immediate', true, 2):
  // commit reply AND replay reply lost; exactly two same-key attempts, no third,
  // one complete stored order; API RECOVERY_UNCERTAIN, browser retry hidden.
  // Enable the dedupe-off and regenerated-key challenges after the control passes.
  expect(result.id).toBe('REC-001');
  expect(false, 'LR-01: replace this sentinel with the full API and browser oracles').toBe(true);
});

test('LR-02 starter · replay, payload conflict and customer/key scope', async ({ request }) => {
  await control(request);
  verifyIdempotencyContract();
  // TODO: replace this placeholder with three separately registered tests.
  // Equivalent property-order payload -> 200 same body, replay header true.
  // Changed quantity same key -> 409 IDEMPOTENCY_CONFLICT, complete state unchanged.
  // Same key another customer and another key same customer -> three real orders.
  expect((await evidence(request)).orders).toEqual([]);
});

test('LR-03 starter · uncertain, eventually visible and absent outcomes', async ({ request }) => {
  await control(request, 'pending', true);
  const purchase = intent();
  await expect(submitOrder(request, purchase)).rejects.toThrow();
  const result = await reconcileOrder(request, 'alice', purchase.key);
  // TODO: prove 3 GETs / 1 POST / 1 persisted order; unknown must not become absent.
  // Register pending-once -> committed in two reads, and unused key -> absent.
  expect(result).toEqual({ state: 'uncertain', lookups: 3 });
  expect(false, 'LR-03: replace this sentinel with budgets and no-extra-write oracles').toBe(true);
});
