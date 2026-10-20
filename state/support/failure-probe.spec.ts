import { lifecycleTest, authenticatedTest } from './fixtures';

lifecycleTest('lifecycle-body-failure', async ({ lease, lifecycleEvents }) => {
  if (!lease.inventory.open) throw new Error('The dependency was not usable.');
  lifecycleEvents.push('test:use');
  throw new Error('INTENTIONAL FS-01 body failure');
});

lifecycleTest.describe('partial setup', () => {
  lifecycleTest.use({ failLeaseSetup: true });
  lifecycleTest('lifecycle-setup-failure', async ({ lease }) => {
    throw new Error(`The body must never run after failed setup: ${lease.released}`);
  });
});

authenticatedTest('member-body-failure', async ({ member }) => {
  await member.context.request.post('/api/cart', { data: { productId: 'p4', quantity: 2 } });
  throw new Error('INTENTIONAL FS-10 body failure');
});
