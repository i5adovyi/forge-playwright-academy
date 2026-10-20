import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Remove .skip from ONE exercise. Keep every acceptance criterion.
// npm run test:a11y:practice -- --grep "AX-01"
test.skip('AX-01 · scoped scan with inspectable evidence', async ({ page }, testInfo) => {
  await page.goto('/quality/accessibility/');
  // TODO: assert real signup fields and preferences button are present first.
  // Run new AxeBuilder({ page }).include('#signup-panel').analyze().
  // Attach FULL JSON results with testInfo.attach before asserting violations=[].
  // Inspect passes and incomplete; write which elements/states remain untested.
  expect(false, 'Replace this sentinel with the complete scoped accessibility check.').toBe(true);
});
test.skip('AX-02 · prove a missing-name failure and repair without changing the oracle', async ({ page }, testInfo) => {
  // TODO: scan healthy signup and assert violations=[].
  // Check "Introduce a missing button name"; run SAME scope/rules/assertion.
  // Prove the original zero-violations assertion rejects this result.
  // Inspect button-name and #preferences-open, attach failing scan evidence.
  // Click "Repair both defects", rescan, require the original assertion to pass.
  // Do not exclude the button, disable the rule, or replace expected [].
  expect(false, 'Keep a real negative control and the unchanged clean-scan oracle.').toBe(true);
});
test.skip('AX-03 · follow focus through the preferences dialog', async ({ page }, testInfo) => {
  // TODO: anchor at Full name, Tab to Email address, Shift+Tab back to Full name,
  // then Shift+Tab to "Edit workshop preferences". Press Enter; assert dialog and
  // "Send workshop reminders" focus. Scan #preferences-dialog while open.
  // Shift+Tab wraps to Cancel; Tab returns to checkbox; Space toggles it.
  // Save through keyboard, assert persisted status and focus returned to opener.
  // Reopen, change a draft, Escape, reopen and prove cancellation preserved saved state.
  // Document what still needs real screen-reader/manual verification.
  expect(false, 'Prove behavior, including focus, rather than only finding ARIA attributes.').toBe(true);
});
test.skip('AX-04 · error recovery and contrast evidence', async ({ page }, testInfo) => {
  // TODO: empty submit => focused alert summary with two linked errors.
  // Assert aria-invalid, accessible descriptions, and error-link focus behavior.
  // Try malformed email, then valid fictional details; scan invalid/success states.
  // Check "Introduce low-contrast text"; same scan must reject color-contrast
  // on #privacy-note. Attach JSON, repair, then pass the unchanged oracle.
  // Do not substitute screenshot similarity for a contrast/accessibility check.
  expect(false, 'Implement the state transitions, contrast negative control, and repair.').toBe(true);
});
