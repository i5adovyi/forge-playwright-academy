import { test, expect } from '@playwright/test';
import { lifecyclePractice, scopedPractice, optionPractice, authenticatedPractice } from './support/practice-fixtures';

// Remove .skip from ONE exercise. These sentinels must fail until you implement
// every acceptance criterion. Never count a skipped assignment as coverage.
// npm run test:state:practice -- --grep "FS-01"
// Use the base test, not the shop fixture that injects x-lab-session.
// FS-01/02/03/10 have typed scaffolds in support/practice-fixtures.ts.
// Implement those fixtures as well as the acceptance checks in this file.

lifecyclePractice.skip('FS-01 · dependency setup and reverse teardown', async ({ lease, lifecycleEvents }, testInfo) => {
  // TODO: create your own typed fixture chain: outer event log -> resource -> lease.
  // Record setup, test use, and teardown. Assert a dependency is still usable
  // while its dependent tears down. The OUTER fixture must assert the full
  // reverse teardown order after await use(); the test body cannot observe it.
  // Attach the final events in teardown and keep cleanup in finally blocks.
  // Then use a separate runner to inject a body failure and partial setup failure.
  // Require the one intentional error plus the complete observed teardown ledger;
  // do not use test.fail() to accidentally accept extra teardown errors.
  expect(false, 'Implement real fixture dependencies and verify their complete lifecycle.').toBe(true);
});

scopedPractice.skip('FS-02 · worker identity, fresh test resources', async ({ resource, workerIdentity }, testInfo) => {
  // TODO: define a typed worker-scoped identity and a test-scoped mutable resource.
  // Add two independently valid cases: each starts empty, mutates only its own
  // resource, and records owner workerIndex plus a distinct resource ID.
  // Do not require alpha before beta or require every test to share one worker.
  // Release test resources; outer worker teardown asserts there are no live leases.
  // Establish workerIdentity in beforeAll and compare it in both test cases.
  // Track observed resource IDs so reusing a mutable resource fails the exercise.
  expect(false, 'Prove resource lifetime without depending on test execution order.').toBe(true);
});

optionPractice.skip('FS-03 · typed options, automatic evidence, lazy fixtures', async ({ localePage, optionEvents, displayLocale, browser, baseURL }) => {
  // TODO: add a typed displayLocale option defaulting to en-GB; override to de-DE.
  // An owned page fixture must apply the option to browser.newContext, not just
  // return the string. Assert navigator.language and the configured timezone.
  // Compare an explicit en-GB/UTC control. Include automatic sanitized evidence
  // and an expensive lazy fixture that is never requested and must never execute.
  // Close your manually created contexts in finally/fixture teardown.
  // The outer event fixture must assert that page teardown precedes diagnostics.
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
  // Reload retains the draft. Click Open a draft copy, armed with a popup listener:
  // this opener-created tab starts with a COPY, then later edits stay separate.
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
  // Read actual localStorage (or reload the source), not just its cached UI value.
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
  // Seed only when the allowed key is absent: edit the restored draft and reload
  // to prove the init script does not overwrite the user's later work.
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
  // A fresh third context must start with its own empty cart. Close owned contexts.
  // After proving its empty/guest start, sign in that third context independently
  // and seed p2 quantity1. Its login and $89 cart must survive the copy's logout.
  // Explain why isolated browser storage did not duplicate server-side identity.
  expect(false, 'Demonstrate shared server mutation and logout, not merely a copied cookie.').toBe(true);
});

authenticatedPractice.skip('FS-10 · own an authenticated context per test', async ({ member, browser, baseURL }) => {
  // TODO: implement a typed fixture owning a fresh browser context, cookie login,
  // and page. Use its context.request to seed p4 quantity2, then verify $118 via UI.
  // An independent guest control remains unauthorized with empty cart.
  // In fixture teardown, reset only its own server session and close context
  // even when reset fails. Attach safe cleanup evidence. Do not close shared browser.
  // Use the outer afterMember fixture to observe closure and inspect the reset
  // session with an independent API context after the owned browser context closes.
  // Prove an unrelated seeded session is unchanged; repeat through a real body
  // failure in an isolated runner and reject any additional teardown errors.
  expect(false, 'Deliver a reusable authenticated fixture with real cleanup and an independent control.').toBe(true);
});
