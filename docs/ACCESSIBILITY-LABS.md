# Accessibility labs: evidence before confidence

These four labs use a fictional Fieldnotes workshop signup form. You will scan rendered components, deliberately introduce defects, prove your checks reject them, and repair the interface without weakening the assertions. No account, message, payment, or external service is involved.

Start the academy with `npm run dev`, then open `http://127.0.0.1:4173/quality/accessibility/`. The hosted portal provides the project download; run this fixture locally after extracting it. If port 4173 is occupied, use `PORT=14828 npm run dev` and run tests with the same `PORT`. Tests start their own server when needed.

```bash
npm ci
npm run browsers
npm run test:a11y
npm run test:a11y:practice -- --grep "AX-01"
npm run test:report
```

The worked suite runs four tests. The practice suite contains four intentionally skipped assignments; skipped tests are not evidence of accessibility. Remove `.skip` from one starter, implement every acceptance criterion, and remove its failing sentinel only when the checks are complete.

| Exercise | Lessons | Time | Evidence to produce |
| --- | --- | --- | --- |
| AX-01 — Scoped scan with inspectable evidence | 03-06 | 25–40 min | Component scan JSON, scan scope, review of inconclusive results |
| AX-02 — Missing-name defect and repair | 03-06 | 35–50 min | Before/defect/repaired scans and rejection by the original assertion |
| AX-03 — Keyboard modal navigation | 03-07 | 35–50 min | Focus sequence, save/cancel behavior, scan of the open dialog |
| AX-04 — Validation states and contrast | 03-07, 03-05 | 45–60 min | Error/success scans, linked-error behavior, contrast failure and repair |

The files live in `quality/accessibility/`: `practice.spec.ts` for your work, `worked.spec.ts` for the worked examples, `audit.ts` for the evidence helper, and `index.html`, `app.js`, and `style.css` for the real fixture.

## The fixture contract

The signup component is `#signup-panel`. Its fields are **Full name (required)** and **Email address (required)**. **Join the workshop** validates them in the browser. An empty submission produces an alert summary headed “Check your details,” with two links; activating a link focuses the relevant input. Each invalid input gets `aria-invalid="true"` and a description pointing to its error. A valid submission reports success through `#signup-status`. Use fictional values such as `Alex Tester` and `alex@example.test`.

The preferences icon is a button named **Edit workshop preferences**. It opens the native **Workshop preferences** dialog. Initial focus goes to **Send workshop reminders**. **Save preferences** persists the choice within the tab; **Cancel** and Escape discard an unsaved change. Closing returns focus to the opener. The fixture explicitly wraps Tab and Shift+Tab at its first and last controls; other elements on the page remain outside the active modal.

Experiment controls sit outside the signup scan scope:

- **Introduce a missing button name** removes the preferences button's `aria-label`; its SVG remains decorative. The button still functions, but axe should report `button-name` on `#preferences-open`.
- **Introduce low-contrast text** changes the rendered color of `#privacy-note`. Axe should report `color-contrast` for that note.
- **Repair both defects** restores the application's original name and color. It does not change the scanner.

State lasts only in the current tab. Reload to start fresh. There are no hidden query parameters, mocks, artificial violation objects, or server writes behind the defect controls.

## AX-01: choose a meaningful scope

Before scanning, assert that the expected heading, fields, and preferences button are visible. Otherwise a wrong route or empty component can accidentally produce a clean result.

Use the helper, or implement the equivalent:

```ts
const result = await new AxeBuilder({ page })
  .include('#signup-panel')
  .analyze();

await testInfo.attach('signup-scan.json', {
  body: JSON.stringify(result, null, 2),
  contentType: 'application/json',
});
expect(result.violations).toEqual([]);
```

This checks the current rendered signup component using axe's default rules. It does not scan a closed dialog or the rest of the academy. Keep the full result, including `passes`, `incomplete`, and engine metadata. Attach it before asserting, so a failing test retains useful evidence. The official [Playwright accessibility guide](https://playwright.dev/docs/accessibility-testing) demonstrates component scoping and report attachments.

Acceptance: the fixture preconditions pass, some rules ran successfully, the clean component has no reported violations, and the JSON attachment is available in the HTML report. Write two sentences identifying what you scanned and what remains outside the claim. Inspect `incomplete`; a result that needs investigation is not a passing accessibility check. The [axe API reference](https://github.com/dequelabs/axe-core/blob/develop/doc/API.md) documents its result categories.

## AX-02: make the original assertion fail

Run `npm run test:a11y -- --grep "AX-02"` to inspect the worked example after your own attempt.

1. Scan the healthy component and apply the zero-violations assertion.
2. Enable **Introduce a missing button name**.
3. Run the same scanner with the same scope and rules. Call the same zero-violations assertion and prove it rejects the result.
4. Inspect the actual violation: rule `button-name`, target `#preferences-open`, impact, and node-level diagnostic. Keep that JSON.
5. Repair through the page, then apply the original scanner and assertion again.

`audit.ts` exposes `assertCleanScan(result)`, which always expects `violations` to equal `[]`. `proveOracleRejects()` calls that exact assertion, catches its expected rejection, and attaches the diagnostic as JSON. It fails the test if the defective state unexpectedly passes. Therefore the worked exercise is green only when the baseline passes, the defect is genuinely rejected, and the repaired state passes.

The caught assertion may appear as an expected failed inner step in the report. Read the enclosing test result and the `oracle-rejection.json` attachment. This is a deliberate detector test; it is not a claim that the defective app is accessible.

For a raw failing run, temporarily call `assertCleanScan(broken)` directly in your practice test after enabling the defect. Run it and inspect the failure, then restore the controlled before/failure/repair flow. Do not commit an accidentally enabled defect.

Acceptance: an actual DOM defect produces the expected rule and target; the original clean-scan assertion rejects it; repair restores that same assertion. Excluding the button, disabling `button-name`, or replacing expected `[]` with an expected-violation list does not meet this exercise.

## AX-03: inspect a keyboard journey

Begin at a known anchor, the Full name field. Tab moves to Email address; Shift+Tab returns to Full name; another Shift+Tab reaches the preferences button. This is a bounded tab-order check, not a complete keyboard audit of the page.

Press Enter to open preferences. Verify checkbox focus. Shift+Tab must wrap to Cancel, and Tab must wrap back to the checkbox. Space toggles it. Tab reaches Save preferences; Enter saves and returns focus to the opener. Reopen, change the checkbox, press Escape, reopen again, and prove the saved choice survived cancellation.

Scan `#preferences-dialog` while it is open. A scan of the closed signup state cannot tell you whether the dialog works. Preserve both kinds of evidence: automated findings and observable focus/behavior. The [W3C dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) describes modal keyboard behavior and return focus.

Acceptance: the test uses keyboard actions for the journey, checks both tab boundaries, proves saved versus cancelled state, and checks return focus after closing. Finding a `role="dialog"` attribute alone does not satisfy any of those behavioral requirements.

Manual extension: follow the full page from its skip link through the workbench. Inspect visible focus at every step. Try a screen reader and record its name, browser, operating system, and actual announcements. If your operating system skips buttons in normal Tab navigation, record that setting instead of silently changing the assertion to match a different journey.

## AX-04: errors and contrast are test states

Submit the empty form. Assert that the summary receives focus and exposes two error links. Check each field's invalid state and accessible description. Follow the name-error link and prove it moves focus. Correct the name, leave an invalid email, and verify that only the email error remains. Finally supply valid fictional details and verify success and removal of the error summary.

Scan the invalid state and the successful state separately. Neither scan proves that a real screen reader announces a live change in a useful way. The [W3C form-notification tutorial](https://www.w3.org/WAI/tutorials/forms/notifications/) explains linked error summaries and associating individual controls with their messages.

Then enable the low-contrast defect. Preserve the actual `color-contrast` node evidence for `#privacy-note`, prove the unchanged clean-scan assertion rejects it, repair, and rerun. Do not fabricate a violation or compare screenshots as a substitute for contrast analysis.

The note uses ordinary small text. Inspect axe's computed foreground/background values and reported contrast ratio, then compare them with [W3C's contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html). If a browser reports the check as inconclusive, investigate its rendering and attachment; do not call the negative control successful until it detects the defect.

Acceptance: the form recovers from both empty and malformed input, the error links actually move focus, both rendered form states are scanned, and the low-contrast defect fails and repairs under the same oracle.

## Evidence checklist and honest limits

For each exercise, retain the command, source revision, browser/OS, relevant state, full scan JSON, and a short observation. Keep fictional data in reports. The attachment names include the exercise and state so before/defect/repaired evidence stays distinguishable.

| Evidence | Supports | Does not establish |
| --- | --- | --- |
| Zero reported axe violations | No findings from enabled rules within the current scan scope | WCAG conformance or accessibility of unvisited states |
| A caught controlled failure | The same check detects the demonstrated regression | Detection of every related defect |
| Focus and keyboard assertions | The specified journey behaved as expected in that test environment | Usability with every keyboard, browser, or assistive technology |
| ARIA attributes and live-region text | The DOM exposes those semantics and messages | What a particular screen reader actually announced |
| Screenshot or visual baseline | Rendered appearance matches the reviewed reference | Accessible names, useful focus order, or sufficient contrast |

Review inconclusive findings. Perform a separate manual pass for reading order, labels in context, focus visibility, keyboard reachability, zoom/reflow, and announcements. Include people who use assistive technologies when assessing a real product. These exercises are practice and evidence collection, not a compliance certification. The [Playwright guide](https://playwright.dev/docs/accessibility-testing) explicitly recommends combining automated and manual assessment.

## Stretch work and AI review

Add a third deliberate defect that matters to this form, such as breaking an error-message association. Keep a known-good baseline, a real rendered defect, and the original acceptance check. First decide whether axe should detect that defect; a missing behavioral association may need a direct semantic assertion or manual investigation.

Ask an AI assistant to review your evidence:

> Review this accessibility test and its attached before/defect/repaired scans. State the exact scope, identify untested states and inconclusive results, and explain whether the same oracle rejected the real defect. Do not disable rules, widen exceptions, or claim conformance. Suggest one behavioral assertion that would improve the evidence.

Verify its claims against the actual attachments and the fixture. A model's confident explanation is not another test result.

Implementation reference: [Deque's Playwright integration](https://github.com/dequelabs/axe-core-npm/tree/develop/packages/playwright). The repository pins the dependency through its lockfile; upgrade deliberately and review changed findings.
