import { test, expect } from '@playwright/test';

// Remove .skip from ONE exercise. These sentinels must fail until you implement
// every acceptance criterion. Never count a skipped assignment as coverage.
// npm run test:state:practice -- --grep "FS-01"
// Use the base test, not the shop fixture that injects x-lab-session.

test.skip('FS-01 · dependency setup and reverse teardown', async ({}, testInfo) => {
  // TODO: create your own typed fixture chain: outer event log -> resource -> lease.
  // Record setup, test use, and teardown. Assert a dependency is still usable
  // while its dependent tears down. The OUTER fixture must assert the full
  // reverse teardown order after await use(); the test body cannot observe it.
  // Attach the final events in teardown and keep cleanup in finally blocks.
  expect(false, 'Implement real fixture dependencies and verify their complete lifecycle.').toBe(true);
});

test.skip('FS-02 · worker identity, fresh test resources', async ({}, testInfo) => {
  // TODO: define a typed worker-scoped identity and a test-scoped mutable resource.
  // Add two independently valid cases: each starts empty, mutates only its own
  // resource, and records owner workerIndex plus a distinct resource ID.
  // Do not require alpha before beta or require every test to share one worker.
  // Release test resources; outer worker teardown asserts there are no live leases.
  expect(false, 'Prove resource lifetime without depending on test execution order.').toBe(true);
});

test.skip('FS-03 · typed options, automatic evidence, lazy fixtures', async ({ browser, baseURL }) => {
  // TODO: add a typed displayLocale option defaulting to en-GB; override to de-DE.
  // An owned page fixture must apply the option to browser.newContext, not just
  // return the string. Assert navigator.language and the configured timezone.
  // Compare an explicit en-GB/UTC control. Include automatic sanitized evidence
  // and an expensive lazy fixture that is never requested and must never execute.
  // Close your manually created contexts in finally/fixture teardown.
  expect(false, 'Exercise option propagation, automatic setup, lazy setup and a control.').toBe(true);
});

test.skip('FS-04 · two tabs, one context', async ({ context, page }) => {
  // TODO: first bootstrap /api/session before parallel pages create cookies.
  // Then visit /state/ and await the bench-ready observable state.
  // Save dark theme, a tab draft and an IndexedDB note through the bench UI.
  // context.newPage() (no opener) shares localStorage/IndexedDB/cookies but not draft.
  // Change theme in tab two and observe tab one's storage-event update.
  // Login through second.request; first.request sees the same authenticated user.
  // Preserve the first tab's draft and close the page you explicitly created.
  expect(false, 'Assert both shared state and an actually independent tab value.').toBe(true);
});

test.skip('FS-05 · independent context boundaries', async ({ context, page, browser, baseURL }) => {
  // TODO: seed source auth/theme/draft/IndexedDB. Create a fresh context with
  // storageState:{cookies:[],origins:[]} and extraHTTPHeaders:{} to clear inherited defaults.
  // Prove guest /api/orders =>401 AUTH_REQUIRED; theme system, draft/no notebook.
  // Mutate control theme to light; source remains dark. Compare cookie identities
  // only as a boolean; never attach token values. Always close your context.
  expect(false, 'Use an independent negative control for every claimed boundary.').toBe(true);
});

test.skip('FS-06 · storageState and IndexedDB opt-in', async ({ context, page, browser, baseURL }) => {
  // TODO: seed login, local preference, tab draft and IndexedDB note.
  // Export context.storageState() and context.storageState({indexedDB:true}) in memory.
  // Restore each into its own context: both have auth/localStorage, only opted-in
  // one has the notebook, neither has sessionStorage. Include a fresh guest control.
  // Change a restored local preference; prove source did not change.
  // Attach only the observed capability matrix, not credentials or raw state.
  expect(false, 'Verify restoration through the UI rather than assuming export copied everything.').toBe(true);
});

test.skip('FS-07 · restore sessionStorage before application code', async ({ context, page, browser, baseURL }) => {
  // TODO: seed a sessionStorage draft. A plain storageState clone must show No draft.
  // For the positive context, addInitScript BEFORE navigation and restore the
  // one allowed key only when location.origin equals the expected app origin.
  // Assert the application reads the restored value on its FIRST load.
  // Fulfill a different-origin route locally and prove that origin receives no draft.
  // Avoid page.evaluate restoration after the application already initialized.
  expect(false, 'Keep the omission control and prove origin scoping and bootstrap timing.').toBe(true);
});

test.skip('FS-08 · context request sharing and standalone isolation', async ({ context, page, playwright, baseURL }) => {
  // TODO: login through context.request and observe the authenticated page.
  // Show page.request reads that same identity. Create standalone request context
  // with explicit empty storage and headers; prove guest before signing it in.
  // Its independent cart and login survive logout through the browser's context.request.
  // Dispose the standalone request context. Never use x-lab-session for this exercise.
  expect(false, 'Distinguish browser-associated requests from an independent API cookie jar.').toBe(true);
});

test.skip('FS-09 · copied authentication is a shared server session', async ({ context, browser, baseURL }) => {
  // TODO: login and seed the real shop cart. Copy context.storageState into a
  // second context. Mutate cart through the copy; source sees the mutation.
  // Logout through the copy; source /api/orders now returns401 AUTH_REQUIRED.
  // A fresh third context must retain its own empty cart. Close all owned contexts.
  // Explain why isolated browser storage did not duplicate server-side identity.
  expect(false, 'Demonstrate shared server mutation and logout, not merely a copied cookie.').toBe(true);
});

test.skip('FS-10 · own an authenticated context per test', async ({ browser, baseURL }) => {
  // TODO: implement a typed fixture owning a fresh browser context, cookie login,
  // and page. Use its context.request to seed p4 quantity2, then verify $118 via UI.
  // An independent guest control remains unauthorized with empty cart.
  // In fixture teardown, reset only its own server session and close context
  // even when reset fails. Attach safe cleanup evidence. Do not close shared browser.
  expect(false, 'Deliver a reusable authenticated fixture with real cleanup and an independent control.').toBe(true);
});
