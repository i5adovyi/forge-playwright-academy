import { test, expect } from '@playwright/test';
import { visitBench } from '../support/helpers';

test('member: a dependency supplies the authenticated read-only context', async ({ page, context }) => {
  await visitBench(page);
  await expect(page.getByTestId('identity')).toHaveText('Signed in as Alex Tester');
  const session = await context.request.get('/api/session');
  expect(session.status()).toBe(200);
  expect((await session.json()).user.email).toBe('demo@forge.test');
  const orders = await context.request.get('/api/orders');
  expect(orders.status()).toBe(200);
  expect((await orders.json()).orders).toEqual([]);
});
