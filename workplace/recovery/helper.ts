import type { APIRequestContext } from '@playwright/test';

export interface OrderInput { sku: 'headphones'; quantity: number }
export interface Order { id: string; customer: 'alice' | 'bob'; sku: 'headphones'; quantity: number; total: number }
export interface Intent { customer: 'alice' | 'bob'; key: string; payload: OrderInput }
export type Reconciliation =
  | { state: 'committed'; order: Order; lookups: number }
  | { state: 'absent' | 'uncertain'; lookups: number };

export async function submitOrder(request: APIRequestContext, intent: Intent) {
  return request.post('/orders', {
    headers: { 'x-customer': intent.customer, 'Idempotency-Key': intent.key },
    data: intent.payload, maxRetries: 0, timeout: 2_000,
  });
}

export async function recoverOrder(request: APIRequestContext, intent: Intent): Promise<Order> {
  // Two explicit transport attempts maximum. A key is created for the business
  // intent by the caller, never for an individual HTTP attempt.
  for (let attempt = 0; attempt < 2; attempt += 1) {
    let response;
    try { response = await submitOrder(request, intent); }
    catch (error) {
      if (attempt === 0) continue;
      throw new Error(`RECOVERY_UNCERTAIN: two transport attempts exhausted; reconcile key ${intent.key}`, { cause: error });
    }
    // An HTTP rejection is not a transport failure and must not be blindly retried.
    if (![200, 201].includes(response.status())) {
      throw new Error(`RECOVERY_REJECTED: ${response.status()} ${await response.text()}`);
    }
    return await response.json() as Order;
  }
  throw new Error('Unreachable recovery state');
}

export async function reconcileOrder(
  request: APIRequestContext, customer: Intent['customer'], key: string, maxLookups = 3,
): Promise<Reconciliation> {
  if (!Number.isInteger(maxLookups) || maxLookups < 1 || maxLookups > 10) throw new Error('INVALID_LOOKUP_BUDGET');
  for (let lookups = 1; lookups <= maxLookups; lookups += 1) {
    // This educational service changes visibility on reads, so no timer is needed.
    // Real services need a documented deadline, pacing and Retry-After policy too.
    const response = await request.get(`/attempts/${encodeURIComponent(key)}`, {
      headers: { 'x-customer': customer }, maxRetries: 0, timeout: 2_000,
    });
    if (response.status() !== 200) throw new Error(`RECONCILIATION_REJECTED: ${response.status()}`);
    const result = await response.json();
    if (result.state === 'committed') return { state: 'committed', order: result.order, lookups };
    if (result.state === 'absent') return { state: 'absent', lookups };
    if (result.state !== 'pending') throw new Error(`INVALID_RECONCILIATION_STATE: ${result.state}`);
  }
  return { state: 'uncertain', lookups: maxLookups };
}
