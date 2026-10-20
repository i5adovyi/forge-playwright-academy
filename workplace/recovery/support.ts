import { test as base, expect, type APIRequestContext } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import type { Order, Intent } from './helper';

export interface JournalEvent {
  sequence: number; type: string; customer?: string; key?: string; order?: Order; orderId?: string; state?: string;
  fault?: string; dropReplies?: number; visibility?: string;
}
export interface Evidence { fault: string; writes: number; lookups: number; orders: Order[]; journal: JournalEvent[] }
export const test = base.extend<{ sessionId: string }>({
  sessionId: async ({}, use) => { await use(randomUUID()); },
  extraHTTPHeaders: async ({ sessionId }, use) => { await use({ 'x-lab-session': sessionId }); },
  // A teardown attachment captures the journal even when the independent oracle fails.
  request: async ({ playwright, baseURL, sessionId }, use, testInfo) => {
    const request = await playwright.request.newContext({ baseURL, extraHTTPHeaders: { 'x-lab-session': sessionId } });
    await use(request);
    const evidence = await request.get('/__evidence');
    await testInfo.attach('persisted-journal', { body: await evidence.body(), contentType: 'application/json' });
    await request.dispose();
  },
});
export { expect };
export const fault = process.env.FORGE_RECOVERY_FAULT || 'none';
export const intent = (key: string = randomUUID(), customer: Intent['customer'] = 'alice'): Intent =>
  ({ key, customer, payload: { sku: 'headphones', quantity: 1 } });
export async function control(request: APIRequestContext, visibility = 'immediate', dropNextCommit = false, dropReplies?: number) {
  const response = await request.post('/__control', { data: { visibility, dropNextCommit, dropReplies }, maxRetries: 0 });
  expect(response.status()).toBe(200);
}
export async function evidence(request: APIRequestContext): Promise<Evidence> {
  const response = await request.get('/__evidence');
  expect(response.status()).toBe(200);
  return await response.json();
}
export function assertCommittedBeforeLoss(data: Evidence) {
  const commit = data.journal.find(event => event.type === 'committed');
  const loss = data.journal.find(event => event.type === 'reply-lost-after-commit');
  expect(commit, 'LOSS_ACTIVATION: an actual commit must precede the socket close').toBeTruthy();
  expect(loss, 'LOSS_ACTIVATION: after-commit response loss must activate').toBeTruthy();
  expect(commit!.sequence).toBeLessThan(loss!.sequence);
  expect(loss!.orderId).toBe(commit!.order!.id);
}
