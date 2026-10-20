import { test, expect } from '@playwright/test';
// Read docs/BROWSER-SKILLS.md. Remove .skip from one case and replace its failing
// sentinel with the implementation. Do not import the worked solution.
test.skip('SK-01 · Timer boundary', async ({ page }) => {
  // Install and freeze the clock BEFORE opening /skills/. Reserve, advance 29,999ms,
  // verify active, advance 1ms, verify expired. Do not use waitForTimeout.
  expect(false, 'TODO: implement timer boundary evidence').toBe(true);
});
test.skip('SK-02 · Reuse cookie authentication', async ({ browser, playwright, baseURL }) => {
  // Sign in with an isolated API context; obtain storageState; create one browser
  // context from that state and one fresh context. Prove signed-in vs anonymous.
  // Then log out through the original API context and prove shared server invalidation.
  // Dispose every context. Do not use the x-lab-session fixture for this cookie drill.
  expect(false, 'TODO: implement cookie authentication evidence').toBe(true);
});
test.skip('SK-03 · Upload and inspect a file', async ({ page }) => {
  // Open /skills/. Set an in-memory .txt file; verify its actual text in File preview.
  // Select a .csv file next; verify rejection AND the previous preview was cleared.
  expect(false, 'TODO: implement file handling evidence').toBe(true);
});
test.skip('SK-04 · Scope an iframe locator', async ({ page }) => {
  // Fill Name inside Shipping contact frame and save. Assert embedded confirmation.
  // Verify the parent's Name field still contains 'Parent page'.
  expect(false, 'TODO: implement frame scoping evidence').toBe(true);
});
test.skip('SK-05 · Capture a popup', async ({ page }) => {
  // Register popup event before clicking Open sample receipt. Assert popup URL,
  // heading, and order SK-42; close only popup; assert original page still usable.
  expect(false, 'TODO: implement popup evidence').toBe(true);
});
test.skip('SK-06 · Accept and dismiss a dialog', async ({ page }) => {
  // Register a dismiss handler BEFORE Delete draft; assert draft preserved.
  // Register an accept handler before next click; assert draft deleted.
  // Capture and check both dialog messages. Avoid assertions that prevent handling.
  expect(false, 'TODO: implement confirmation evidence').toBe(true);
});
