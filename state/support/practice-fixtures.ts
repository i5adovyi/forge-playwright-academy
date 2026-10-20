import { test as base, expect, type BrowserContext, type Page } from '@playwright/test';

// Typed scaffolds, not reference solutions. Replace each TODO and sentinel.
// Keep assertions outside the test body when they need to observe teardown.
export type Inventory = { open: boolean };
export type Lease = { inventory: Inventory; released: boolean };
type Lifecycle = { lifecycleEvents: string[]; inventory: Inventory; lease: Lease };
export const lifecyclePractice = base.extend<Lifecycle>({
  lifecycleEvents: async ({}, use) => {
    const events: string[] = [];
    await use(events);
    // TODO: assert the complete setup -> use -> reverse teardown sequence here.
    expect(false, 'FS-01: the outer fixture must verify teardown.').toBe(true);
  },
  inventory: async ({ lifecycleEvents }, use) => {
    const inventory: Inventory = { open: false };
    // TODO: acquire inventory and record setup.
    try { await use(inventory); }
    finally { /* TODO: release inventory and record teardown. */ }
  },
  lease: async ({ inventory, lifecycleEvents }, use) => {
    const lease: Lease = { inventory, released: false };
    // TODO: verify/acquire the dependency and record setup.
    try { await use(lease); }
    finally { /* TODO: prove inventory still open, release lease, record teardown. */ }
  },
});

export type WorkerIdentity = {
  id: string; workerIndex: number; issued: Set<string>; live: Set<string>;
};
type Resource = { id: string; owner: string; items: string[] };
export const scopedPractice = base.extend<{ resource: Resource }, { workerIdentity: WorkerIdentity }>({
  workerIdentity: [async ({}, use, workerInfo) => {
    const worker: WorkerIdentity = {
      id: 'TODO-generate-identity', workerIndex: workerInfo.workerIndex,
      issued: new Set(), live: new Set(),
    };
    try { await use(worker); }
    finally {
      // TODO: assert all issued test resources were released.
      expect(false, 'FS-02: verify ownership and release in worker teardown.').toBe(true);
    }
  }, { scope: 'worker' }],
  resource: async ({ workerIdentity }, use) => {
    const resource: Resource = { id: 'TODO-generate-resource', owner: workerIdentity.id, items: [] };
    // TODO: track resource issuance and active ownership.
    try { await use(resource); }
    finally { /* TODO: release this resource and attach observed evidence. */ }
  },
});

type Options = {
  displayLocale: string; optionEvents: string[]; automaticEvidence: void;
  unusedExpensiveFixture: string; localePage: Page;
};
export const optionPractice = base.extend<Options>({
  displayLocale: ['en-GB', { option: true }],
  optionEvents: async ({}, use) => {
    const events: string[] = [];
    await use(events);
    // TODO: assert complete lifecycle after automatic and page teardown.
    expect(false, 'FS-03: logging is not a lifecycle assertion.').toBe(true);
  },
  automaticEvidence: [async ({ optionEvents, displayLocale }, use, testInfo) => {
    // TODO: record automatic setup.
    try { await use(); }
    finally { /* TODO: record teardown and attach sanitized observations. */ }
  }, { auto: true }],
  unusedExpensiveFixture: async ({ optionEvents }, use) => {
    // A tripwire: this lazy fixture is not a dependency of this exercise.
    throw new Error('FS-03: an unused expensive fixture was unexpectedly requested.');
  },
  localePage: async ({ browser, baseURL, displayLocale, optionEvents }, use) => {
    let context: BrowserContext | undefined;
    try {
      // TODO: create an owned context with the locale option, explicit empty
      // storage/headers and Europe/Warsaw timezone; visit /state/ and await ready.
      expect(context, 'FS-03: allocate the context before creating its page.').toBeDefined();
      const page = await context!.newPage();
      await use(page);
    } finally {
      await context?.close();
      // TODO: record locale teardown.
    }
  },
});

type Member = { context: BrowserContext; page: Page };
export const authenticatedPractice = base.extend<{
  member: Member; afterMember: { context?: BrowserContext; page?: Page };
}>({
  afterMember: async ({ browser, playwright, baseURL }, use) => {
    const observed: { context?: BrowserContext; page?: Page } = {};
    // TODO: own an independent observer API context with a COPY of the member's
    // cookie state in memory; add an unrelated seeded control session.
    try {
      await use(observed);
      // TODO: observe page closure/context removal, guest status + empty owned
      // cart AFTER member teardown. Unrelated login/cart must remain untouched.
      expect(false, 'FS-10: observe actual cleanup, not a hardcoded success flag.').toBe(true);
    } finally { /* TODO: dispose owned observer/control request contexts. */ }
  },
  member: async ({ browser, baseURL, afterMember }, use) => {
    let context: BrowserContext | undefined;
    try {
      // TODO: allocate fresh context, login using context.request, register
      // context/page with afterMember, then open and await the authenticated UI.
      expect(context, 'FS-10: allocate and authenticate an owned context.').toBeDefined();
      const page = await context!.newPage();
      await use({ context: context!, page });
    } finally {
      try { /* TODO: reset ONLY the owned server session; check the response. */ }
      finally { await context?.close(); }
    }
  },
});
