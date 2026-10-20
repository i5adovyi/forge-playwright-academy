# Visual baselines: compare, investigate, review

A screenshot comparison answers a narrow question: did this rendered state
change from a deliberately reviewed version? It does not prove that an order is
correct, a control is accessible, or the baseline itself is good. Keep semantic
assertions beside screenshot assertions.

This workshop adds four executable visual exercises to the academy. The small
order-review fixture is entirely local, with fixed product data, local fonts,
and a controlled CSS defect. It is separate from the commerce application so
that screenshot stability does not depend on a customer's cart or login state.

## Start the lab

From the project root:

```bash
npm ci
npx playwright install chromium
npm run dev
```

Open `http://127.0.0.1:4173/quality/visual/`. Use the same `PORT` for the server
and tests if the default port is occupied. The fixture is included in the
project download. The hosted academy supplies the lesson and manual; executable
browser tests run against your local Node server.

In another terminal:

```bash
# Compare worked solutions to the reviewed baselines. Never creates missing ones.
npm run test:visual

# Four unfinished assignments; intentionally skipped until you implement them.
npm run test:visual:practice

# Inspect the latest normal comparison report.
npx playwright show-report quality-results/visual-report
```

The optional configuration is `playwright.visual.config.ts`. The ordinary
reference/portal suite does not run visual comparisons. Invoking this optional
configuration without a project filter runs only the worked and learner
projects, never the controlled defect.

## Your four assignments

| Assignment | State and evidence | Shared screenshot name |
| --- | --- | --- |
| VS-01: Stable desktop baseline | Both product names, correct total, and the complete desktop layout | `vs-01-desktop.png` |
| VS-02: Mobile expanded summary | Hidden details become visible; expanded control state and no horizontal overflow; capture the full page | `vs-02-mobile-expanded.png` |
| VS-03: Mask only volatile metadata | The reference changes but the important order-summary pixels and money stay unchanged; compare the same masked oracle twice | `vs-03-masked.png` |
| VS-04: Review a controlled visual regression | Normal summary comparison passes; a separate unchanged-oracle defect run fails; inspect the diff before any update | `vs-04-order-summary.png` |

Starters: `quality/visual/practice.spec.ts`. Worked solutions:
`quality/visual/worked.spec.ts`. Shared readiness helper and screenshot names:
`quality/visual/helpers.ts`.

Remove `.skip` from one starter and replace its sentinel with your
implementation. Then run the assignment by ID:

```bash
npm run test:visual:practice -- --grep VS-01
```

Use the exported `visualSnapshots` name for the matching assignment. Learners
and solutions intentionally use the same baseline directory. Do not create a
second set of screenshots under your test filename: that would allow your
implementation to approve its own oracle.

## Stabilize the environment before comparing

The configuration and helper make these inputs explicit:

- Chromium comes from the Playwright version locked by `package-lock.json`.
- Desktop is 1100 × 800 CSS pixels; the mobile exercise is 390 × 844, both with
  device scale factor 1.
- Locale is `en-US`, timezone UTC, color scheme light, and reduced motion is on.
- `page.clock.setFixedTime` sets the rendered date before application code runs.
- Product quantities, prices and discount values come from the offline fixture.
- Regular and bold Atkinson Hyperlegible fonts are checked in with their license.
  The helper explicitly loads both weights, waits for `document.fonts.ready`, and
  checks font availability before comparing.
- No remote image, stylesheet, font, API, analytics, or third-party widget is
  required. The product illustrations are local CSS shapes.
- Screenshot animations are disabled, the caret is hidden, and the pointer is
  moved away from controls. No hard sleep is used as a readiness signal.

The screenshot assertion waits for stable consecutive renders. That does not
replace an application-ready condition: the helper also checks the rendered
heading, `data-ready`, date, and total. The mobile exercise waits for the
expanded state before capturing it.

A bundled font may not contain every Unicode symbol. During this lab’s verification,
a decorative arrow changed 56 pixels between otherwise identical captures. Its
fallback glyph was replaced with a small CSS shape; no price, control, mask, or
tolerance was weakened. Check unsupported symbols and fallback fonts when a tiny
region moves even though the main font loaded correctly.

Visual matching here deliberately uses `maxDiffPixels: 0` and `threshold: 0`.
Those strict values are useful for this tightly controlled fixture. Stabilize
the environment or explain the changed pixels before considering a different
policy for another application. Do not increase the allowance to conceal a
product defect.

## Keep platform baselines separate

The shared path template is:

```text
quality/visual/baselines/{platform}/{arg}{ext}
```

`{platform}` resolves to the runner's operating-system identifier, such as
`darwin` on macOS or `linux` on Linux. It is not a promise that all computers on
that OS render identically. The supplied baseline README identifies the reviewer and reference environments. Keep browser version, fonts, CI image, architecture,
and relevant rendering configuration consistent within a baseline environment.
Linux CI uses the repository's pinned workflow environment; consult the workflow
before reproducing it elsewhere.

Never copy a macOS image into the Linux directory to make CI appear provisioned.
Generate candidates on the intended platform and review them there. A new OS
with no baseline should fail with a missing-snapshot explanation. That is a
missing reviewed reference, not proof of a UI regression.

## Mask narrowly, and prove the rest still matters

The lab's `render-token` badge is a controlled stand-in for a changing receipt
reference or request ID. Clicking **Refresh receipt reference** changes its
content from `RUN-0001` to `RUN-0002` without changing the order.

VS-03 masks exactly that fixed-size badge. It does not mask the summary card,
the price, a product, or the whole page. The two comparisons use the same
`vs-03-masked.png` baseline. The worked example also compares before/after
screenshots of `order-summary` byte for byte, proving that the important pixels
were unaffected by the metadata refresh.

```ts
const token = page.getByTestId('render-token');
await expect(page).toHaveScreenshot(visualSnapshots.masked, {
  fullPage: true,
  mask: [token],
});
```

A mask removes evidence. Record why the region is irrelevant to the claim and
why its layout cannot obscure important content. Masking a container with a
changing price would make the suite less trustworthy even if it reduced flakes.

## Demonstrate that the oracle detects a defect

First verify the normal baseline is present and passing. Then run:

```bash
npm run test:visual -- --grep VS-04
npm run test:visual:defect
```

**The second command must exit nonzero.** It is a deliberate failure exercise,
kept in `quality/visual/defect.config.ts`, outside the normal passing projects.
The defect URL is `/quality/visual/?defect=total`. It makes the total tiny and
faint while keeping its text exactly `$79.20`. A text assertion still passes;
the unchanged `vs-04-order-summary.png` screenshot assertion must fail.

Open the failure evidence:

```bash
npx playwright show-report quality-results/visual-defect-report
```

Inspect the expected, actual and diff images. Explain which region changed,
why the total is now harder to read, and why the original baseline remains the
correct oracle. Confirm the failure came from the screenshot mismatch rather
than a missing file, absent font, broken server, or failed setup assertion.

Defect mode rejects any baseline-update setting before taking the comparison.
Do not mark this test expected-to-fail, catch its assertion, skip it, or update
the baseline to the deliberately broken design. Its purpose is to prove that
an ordinary failing assertion exposes the defect.

Restore the normal URL and rerun:

```bash
npm run test:visual -- --grep VS-04
```

The normal command should pass without changing the screenshot. The defect is
an opt-in query parameter; no application source must be patched or reverted to
run this proof.

## Review an intentional design change

Treat baseline updates as changes to expected behavior. Generating a screenshot
is not the same as reviewing or verifying it.

1. Explain the requested design change and its acceptance criteria. Save a clean
   starting commit or inspect your working changes so unrelated edits are not
   silently included.
2. Make the intended change in `quality/visual/styles.css` or the fixture. For
   example, deliberately increase the summary heading's size. Run normal
   comparison and inspect every resulting failure before accepting it.
3. Check setup, fonts, viewport, product values, date and browser environment.
   Rule out environmental noise. If the changed image is wrong, fix the source
   and preserve the baseline.
4. Only for an accepted design change, explicitly generate new candidates:

```bash
npm run test:visual:update
```

This script adds `--update-snapshots=all` for the worked project. The default
configuration is `updateSnapshots: 'none'`, so normal comparison cannot
silently create or replace references. Candidate generation can finish green
while accepting an unwanted design; it is not evidence that review passed.

5. Review each changed PNG and the source diff. A summary-card change can affect
   desktop, mobile, masked and component baselines. Check all affected states,
   including overflow, hierarchy, text legibility, controls and unmasked money.

```bash
git diff --stat -- quality/visual
git diff -- quality/visual/styles.css quality/visual/index.html
```

Open old and new images in your editor or comparison viewer. Record a brief
review note: intended behavior, changed files, exact environment, why the pixels
are acceptable, and who reviewed them. Commit source and reviewed baselines
together only after the unchanged comparison passes:

```bash
npm run test:visual
```

For a new Linux baseline, the manually dispatched
`.github/workflows/visual-baseline-candidates.yml` prepares candidates in the
pinned CI environment and uploads the images/report. Review that artifact
before adding its Linux images to version control. The ordinary CI comparison
job must use committed baselines without an update flag. A successful candidate
workflow by itself is never a passing regression check.

## Troubleshooting by evidence

| Symptom | First investigation |
| --- | --- |
| Missing baseline | Confirm platform and path; obtain a reviewed reference or explicitly prepare candidates on that platform |
| All text differs | Check local fonts loaded, locked browser version, OS image and scale factor |
| Only expanded mobile state differs | Check the button state and visible order lines before capture |
| Full page changes after metadata refresh | Check mask scope, pointer/focus state and whether the reference changed layout |
| Changed total passes | Verify the comparison uses the original baseline, no summary mask, and no broadened tolerance |
| Default command unexpectedly updates files | Inspect CLI flags and confirm this configuration still sets `updateSnapshots: 'none'` |
| Normal suite runs the intentional defect | Use the normal visual config; the defect has its own isolated config |

Expected output artifacts live in `quality-results/`, which is ignored. Reviewed
baseline PNGs live in `quality/visual/baselines/`, which is tracked. Traces and
reports help explain a failure; a passing comparison should not require opening
them or updating an image.

## Completion evidence

For each assignment, keep the exact command, platform/browser version, outcome,
and one sentence about what the screenshot protects. VS-03 needs a written
reason for its mask. VS-04 needs an expected/actual/diff diagnosis and evidence
that the defect failed against an unchanged oracle before the clean run passed.
The skipped starter count is unfinished practice, not passing quality evidence.

## Primary references

Verified for this workshop on 20 October 2026:

- [Playwright visual comparisons](https://playwright.dev/docs/test-snapshots)
- [Screenshot assertion options](https://playwright.dev/docs/api/class-pageassertions#page-assertions-to-have-screenshot-1)
- [Snapshot path templates](https://playwright.dev/docs/api/class-testconfig#test-config-snapshot-path-template)
- [Snapshot update policy](https://playwright.dev/docs/api/class-testconfig#test-config-update-snapshots)
- [Clock control](https://playwright.dev/docs/clock)
- [Bundled font source and license](https://github.com/google/fonts/tree/main/ofl/atkinsonhyperlegible)
