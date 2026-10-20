import { randomUUID } from 'node:crypto';
import { test as base, expect, type BrowserContext, type Page } from '@playwright/test';
import { attachEvidence, freshContext, loginWithCookies, visitBench } from './helpers';

type Inventory = { open: boolean };
type Lease = { inventory: Inventory; released: boolean };
type LifecycleFixtures = { lifecycleEvents: string[]; inventory: Inventory; lease: Lease };

export const lifecycleTest = base.extend<LifecycleFixtures>({
  lifecycleEvents: async ({}, use, testInfo) => {
    const events: string[] = [];
    await use(events);
    // This outer fixture tears down AFTER both its dependents.
    await attachEvidence(testInfo, 'FS-01-complete-lifecycle', { events });
    expect(events).toEqual(['inventory:setup', 'lease:setup', 'test:use', 'lease:teardown', 'inventory:teardown']);
  },
  inventory: async ({ lifecycleEvents }, use) => {
    const inventory = { open: true };
    lifecycleEvents.push('inventory:setup');
    try { await use(inventory); }
    finally { inventory.open = false; lifecycleEvents.push('inventory:teardown'); }
  },
  lease: async ({ inventory, lifecycleEvents }, use) => {
    expect(inventory.open).toBe(true);
    const lease = { inventory, released: false };
    lifecycleEvents.push('lease:setup');
    try { await use(lease); }
    finally {
      expect(inventory.open, 'Dependency must outlive the lease that uses it.').toBe(true);
      lease.released = true;
      lifecycleEvents.push('lease:teardown');
    }
  },
});

type WorkerIdentity = { id: string; workerIndex: number; issued: Set<string>; live: Set<string> };
type ScopedFixtures = { resource: { id: string; owner: string; items: string[] } };

export const scopedTest = base.extend<ScopedFixtures, { workerIdentity: WorkerIdentity }>({
  workerIdentity: [async ({}, use, workerInfo) => {
    const worker = { id: randomUUID(), workerIndex: workerInfo.workerIndex, issued: new Set<string>(), live: new Set<string>() };
    try { await use(worker); }
    finally {
      expect(worker.live.size, 'Every issued test resource must be released before its worker fixture.').toBe(0);
    }
  }, { scope: 'worker' }],
  resource: async ({ workerIdentity }, use, testInfo) => {
    const id = randomUUID();
    expect(workerIdentity.issued.has(id)).toBe(false);
    workerIdentity.issued.add(id);
    workerIdentity.live.add(id);
    const resource = { id, owner: workerIdentity.id, items: [] as string[] };
    try { await use(resource); }
    finally {
      workerIdentity.live.delete(id);
      await attachEvidence(testInfo, 'FS-02-resource-lifetime', {
        workerIdentity: workerIdentity.id, workerIndex: workerIdentity.workerIndex,
        resourceId: id, initialItemCount: 0, finalItemCount: resource.items.length,
        resourcesIssuedInThisWorker: workerIdentity.issued.size, released: !workerIdentity.live.has(id),
      });
    }
  },
});

type OptionFixtures = {
  displayLocale: string;
  optionEvents: string[];
  automaticEvidence: void;
  unusedExpensiveFixture: string;
  localePage: Page;
};
export const optionTest = base.extend<OptionFixtures>({
  displayLocale: ['en-GB', { option: true }],
  optionEvents: async ({}, use) => { await use([]); },
  automaticEvidence: [async ({ optionEvents, displayLocale }, use, testInfo) => {
    optionEvents.push('automatic:setup');
    try { await use(); }
    finally {
      optionEvents.push('automatic:teardown');
      await attachEvidence(testInfo, 'FS-03-automatic-evidence', { displayLocale, events: optionEvents, status: testInfo.status });
      expect(optionEvents).not.toContain('unused:setup');
    }
  }, { auto: true }],
  unusedExpensiveFixture: async ({ optionEvents }, use) => {
    optionEvents.push('unused:setup');
    throw new Error('This exercise never requests this lazy fixture. It must not run.');
    await use('unreachable');
  },
  localePage: async ({ browser, baseURL, displayLocale, optionEvents }, use) => {
    optionEvents.push('locale:setup');
    const context = await freshContext(browser, baseURL, { locale: displayLocale, timezoneId: 'Europe/Warsaw' });
    try {
      const page = await context.newPage();
      await visitBench(page);
      await use(page);
    } finally { await context.close(); optionEvents.push('locale:teardown'); }
  },
});

export const authenticatedTest = base.extend<{ member: { context: BrowserContext; page: Page } }>({
  member: async ({ browser, baseURL }, use, testInfo) => {
    const context = await freshContext(browser, baseURL);
    try {
      await loginWithCookies(context.request);
      const page = await context.newPage();
      await page.goto('/lab/');
      await expect(page.getByRole('button', { name: 'Sign out', exact: true })).toBeVisible();
      await use({ context, page });
    } finally {
      try {
        const reset = await context.request.post('/api/reset');
        expect(reset.status(), 'Release the server-side resources owned by this fixture.').toBe(200);
      } finally {
        await context.close();
        await attachEvidence(testInfo, 'FS-10-fixture-cleanup', { ownedContextClosed: true, status: testInfo.status });
      }
    }
  },
});
