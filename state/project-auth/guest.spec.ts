import { test, expect } from '@playwright/test';
import { assertGuest, visitBench } from '../support/helpers';

test('guest: an unrelated project remains anonymous', async ({ page, context }) => {
  await visitBench(page);
  await expect(page.getByTestId('identity')).toHaveText('Guest session');
  await assertGuest(context.request);
  expect((await (await context.request.get('/api/cart')).json()).items).toEqual([]);
});
