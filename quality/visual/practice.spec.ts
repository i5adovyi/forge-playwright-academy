import { test, expect } from '@playwright/test';
import { openVisualLab, visualSnapshots } from './helpers';

// Implement ONE starter, remove its .skip, and keep the shared screenshot name.
// Do not generate a second oracle under a test-file-specific snapshot directory.
test.skip('VS-01 · Stable desktop baseline', async ({ page }) => {
  await openVisualLab(page);
  // TODO: prove both product headings and total are correct, then compare the full page
  // using visualSnapshots.desktop. Keep deterministic date/fonts/viewport from the helper.
  // Done: comparison passes against the reviewed desktop baseline without updating it.
  expect(false, 'Implement every criterion, then remove this sentinel').toBe(true);
});

test.skip('VS-02 · Mobile expanded summary', async ({ page }) => {
  await openVisualLab(page, { mobile: true });
  // TODO: prove order lines start hidden, activate Show order details, assert expanded
  // state and visible line items, and prove no horizontal overflow. Move pointer to0,0.
  // Compare full page with visualSnapshots.mobile. Capture the expanded meaningful state.
  expect(false, 'Implement every criterion, then remove this sentinel').toBe(true);
});

test.skip('VS-03 · Mask only volatile metadata', async ({ page }) => {
  await openVisualLab(page);
  // TODO: compare full page with visualSnapshots.masked, masking ONLY render-token.
  // Refresh receipt reference; prove token changes RUN-0001 -> RUN-0002 while total
  // remains $79.20. Compare the same oracle again. Also compare order-summary screenshots
  // before/after to prove those important pixels did not change. Never mask the summary.
  expect(false, 'Implement every criterion, then remove this sentinel').toBe(true);
});

test.skip('VS-04 · Review a controlled visual regression', async ({ page }) => {
  await openVisualLab(page);
  // TODO: compare order-summary against visualSnapshots.summary; keep this normal test green.
  // Separately run npm run test:visual:defect and inspect expected/actual/diff. It MUST fail
  // on the unchanged summary baseline even though the total text is still $79.20.
  // Record the cause, changed region, and fix in your review notes. Restore normal source.
  // For an intentional design change, follow docs/VISUAL-BASELINES.md update/review protocol.
  expect(false, 'Implement every criterion, then remove this sentinel').toBe(true);
});

// Imported names are supplied to make the required shared oracle easy to discover.
void visualSnapshots;
