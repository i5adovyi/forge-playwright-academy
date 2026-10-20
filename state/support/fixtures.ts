import { randomUUID } from 'node:crypto';
import { test as base, expect, type APIRequestContext, type BrowserContext, type Page } from '@playwright/test';
import { assertGuest, attachEvidence, emptyStorage, freshContext, loginWithCookies, visitBench } from './helpers';

type Inventory = { open: boolean };
type Lease = { inventory: Inventory; released: boolean };
type LifecycleFixtures = { lifecycleEvents: string[]; inventory: Inventory; lease: Lease; failLeaseSetup: boolean };

export const lifecycleTest = base.extend<LifecycleFixtures>({
  failLeaseSetup: [false, { option: true }],
  lifecycleEvents: async ({ failLeaseSetup }, use, testInfo) => {
    const events: string[] = [];
    await use(events);
    // This outer fixture tears down AFTER both its dependents.
    await attachEvidence(testInfo, 'FS-01-complete-lifecycle', { events });
    expect(events).toEqual([
      'inventory:setup', 'lease:setup', ...(failLeaseSetup ? [] : ['test:use']),
      'lease:teardown', 'inventory:teardown',
    ]);
  },
  inventory: async ({ lifecycleEvents }, use) => {
    const inventory = { open: true };
    lifecycleEvents.push('inventory:setup');
    try { await use(inventory); }
    finally { inventory.open = false; lifecycleEvents.push('inventory:teardown'); }
  },
  lease: async ({ inventory, lifecycleEvents, failLeaseSetup }, use) => {
    expect(inventory.open).toBe(true);
    const lease = { inventory, released: false };
    lifecycleEvents.push('lease:setup');
    try {
      if (failLeaseSetup) throw new Error('INTENTIONAL FS-01 setup failure');
      await use(lease);
    }
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
    const initialItemCount = resource.items.length;
    try { await use(resource); }
    finally {
      workerIdentity.live.delete(id);
      await attachEvidence(testInfo, 'FS-02-resource-lifetime', {
        workerIdentity: workerIdentity.id, workerIndex: workerIdentity.workerIndex,
        parallelIndex: testInfo.parallelIndex, retry: testInfo.retry,
        repeatEachIndex: testInfo.repeatEachIndex,
        resourceId: id, initialItemCount, finalItemCount: resource.items.length,
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
  optionEvents: async ({}, use, testInfo) => {
    const events: string[] = [];
    await use(events);
    // This dependency outlives both the automatic diagnostic and owned page.
    // Logging the events alone would not detect an early diagnostic teardown.
    await attachEvidence(testInfo, 'FS-03-complete-lifecycle', { events });
    expect(events).toEqual([
      'automatic:setup', 'locale:setup', 'test:use',
      'locale:teardown', 'automatic:teardown',
    ]);
  },
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

type MemberAudit = { context?: BrowserContext; page?: Page; observer?: APIRequestContext };
export const authenticatedTest = base.extend<{
  member: { context: BrowserContext; page: Page };
  memberAudit: MemberAudit;
}>({
  memberAudit: async ({ browser, playwright, baseURL }, use, testInfo) => {
    const audit: MemberAudit = {};
    const unrelated = await playwright.request.newContext({ baseURL, storageState: emptyStorage(), extraHTTPHeaders: {} });
    try {
      await loginWithCookies(unrelated);
      expect((await unrelated.post('/api/cart', { data: { productId: 'p2', quantity: 1 } })).status()).toBe(200);
      await use(audit);
      // This outer fixture runs AFTER member teardown. The observer copied the
      // session cookie before close, so it can inspect the actual server state.
      expect(audit.context, 'The member context must be registered for observation.').toBeDefined();
      expect(browser.contexts()).not.toContain(audit.context);
      expect(audit.page?.isClosed()).toBe(true);
      expect(audit.observer).toBeDefined();
      await assertGuest(audit.observer!);
      expect((await (await audit.observer!.get('/api/cart')).json()).items).toEqual([]);
      expect((await (await unrelated.get('/api/session')).json()).user.email).toBe('demo@forge.test');
      expect((await (await unrelated.get('/api/cart')).json()).total).toBe(8900);
      await attachEvidence(testInfo, 'FS-10-observed-cleanup', {
        ownedContextClosed: !browser.contexts().includes(audit.context!),
        ownedPageClosed: audit.page!.isClosed(),
        serverSessionAnonymous: true, ownedCartEmpty: true, unrelatedCartTotal: 8900,
      });
    } finally {
      try { await audit.observer?.dispose(); }
      finally {
        try {
          expect((await unrelated.post('/api/reset')).status()).toBe(200);
        } finally { await unrelated.dispose(); }
      }
    }
  },
  member: async ({ browser, playwright, baseURL, memberAudit }, use) => {
    const context = await freshContext(browser, baseURL);
    memberAudit.context = context;
    try {
      await loginWithCookies(context.request);
      memberAudit.observer = await playwright.request.newContext({ baseURL, storageState: await context.storageState(), extraHTTPHeaders: {} });
      const page = await context.newPage();
      memberAudit.page = page;
      await page.goto('/lab/');
      await expect(page.getByRole('button', { name: 'Sign out', exact: true })).toBeVisible();
      await use({ context, page });
    } finally {
      try {
        const reset = await context.request.post('/api/reset');
        expect(reset.status(), 'Release the server-side resources owned by this fixture.').toBe(200);
      } finally {
        await context.close();
      }
    }
  },
});
