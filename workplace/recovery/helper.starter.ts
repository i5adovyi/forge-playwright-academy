import type { APIRequestContext } from '@playwright/test';
import type { Intent, Order, Reconciliation } from './helper';

// LR-01: preserve one key across at most two explicit POST attempts.
// Do not retry 409/422 as though they were transport failures. maxRetries: 0.
export async function recoverOrder(_request: APIRequestContext, _intent: Intent): Promise<Order> {
  throw new Error('LR-01_STARTER_NOT_IMPLEMENTED: recover the committed intent without another effect');
}

// LR-02: add independent replay/conflict/customer-scope assertions in practice.spec.ts.
export function verifyIdempotencyContract(): never {
  throw new Error('LR-02_STARTER_NOT_IMPLEMENTED: verify replay, conflict and scope controls');
}

// LR-03: GET-only reconciliation, three reads maximum, explicit uncertain result.
export async function reconcileOrder(
  _request: APIRequestContext, _customer: Intent['customer'], _key: string, _maxLookups = 3,
): Promise<Reconciliation> {
  throw new Error('LR-03_STARTER_NOT_IMPLEMENTED: distinguish committed, absent and uncertain');
}
