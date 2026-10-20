# Incident diagnosis lab

Three reproducible assignments for a junior-to-mid automation interview or a
team debugging exercise. Use the real local Forge shop. The harness controls the
interleaving so that the failure is explainable; this is a simulation of a CI
incident, not a claim that these defects were found in production.

## Run and inspect

From the repository root after `npm ci` and `npx playwright install chromium`:

```sh
npm run test:incidents:broken
```

This command **intentionally exits 1 with three failed tests**. Do not add it to
ordinary green test jobs. It creates fresh traces, screenshots, JSON attachments,
a console log, an HTML report and source metadata in a unique
`quality-results/incidents/run-*` directory. No prerecorded trace is shipped.
The printed report path is the one from your run.

```sh
npx playwright show-report quality-results/incidents/run-YOUR-RUN/broken/report
# Use the exact trace.zip path from the report/JSON attachments:
npx playwright show-trace /absolute/path/to/trace.zip
npm run test:incidents:broken -- --grep IN-02
```

The runner starts and stops its own local server on port 14828. If that port is
already occupied, choose a free `PORT`; it deliberately refuses to reuse an
unknown server. The evidence log contains synthetic session identifiers and shop
data. No environment variables are dumped.

Open `practice.spec.ts` and implement one repair point. Leave the business
requirement intact and replace its `unfinished(...)` sentinel:

```sh
npm run test:incidents:practice
# The default reports three unfinished skipped starters.
npm run test:incidents:practice -- --enable-starters --grep IN-01
# An enabled untouched starter exits 1 with STARTER_NOT_IMPLEMENTED.
npm run test:incidents:practice -- --enable-starters --grep IN-01 --with-defects
# After repair, the controlled product fault must still fail the business check.
npm run test:incidents
# The three worked repairs should pass.
npm run test:incidents -- --grep IN-02 --repeat-each=3 --workers=3
npm run test:incidents:proof
```

The proof command accepts no extra filters. It checks all three original failures,
all three passing solutions, all three controlled defects, and the three
unmodified starter sentinels. It validates exact case identities, one result per
case, expected assertion messages, trace files and causal attachments.
Infrastructure failures, timeouts in unrelated code, `test.fail()` annotations,
skips and retry recoveries cannot satisfy it. Once you implement the starters,
the repository's **unmodified-starter sentinel proof** is no longer applicable;
use your passing starter run plus `--with-defects` evidence for learner work.

## Ticket IN-01: “The CI machine needs a longer timeout”

**Requirement:** one successfully seeded Studio Headphones appears as `Cart (1)`
and costs $129.00. The inherited test times out waiting for the badge.

1. Run only IN-01 and inspect the setup request, response and later UI.
2. Identify the earliest event inconsistent with the requirement. Classify it:
   test/data setup, application, infrastructure, or insufficient evidence.
3. Write one competing explanation and an experiment that could reject it.
4. Fix both the setup input and its validation boundary. Preserve the badge and
   price assertions. Do not change the expected cart to empty to make the test pass.
5. Show the repaired test passes. With the missing-item response defect enabled,
   the repaired test must fail at `IN-01_CART_BADGE`.

**Interview prompt:** Which error should this test report if stock rules change
tomorrow? Why would doubling the UI timeout fail to repair today's incident?

## Ticket IN-02: “Playwright contexts leak state”

**Requirement:** customer A owns one $129 headphone; another customer adding a
$89 keyboard must not change A's cart. A's cart instead becomes $218.

1. Inspect both context identities and both cart snapshots. Distinguish an
   independent cookie/storage container from an independent server data owner.
2. Preserve the adversarial order: A seeds, B mutates, A observes. This explicit
   schedule reproduces the conflict without a lucky parallel-worker race.
3. Repair data ownership. Assert the exact item identities and expected amounts
   for both customers; keep A's UI assertion.
4. Close manually created browser contexts in `finally`, including on failure.
5. Run the worked case alone and repeatedly with three workers. Introduce the
   other-customer-item response defect and confirm A's original amount fails.

**Interview prompt:** Does using another browser context, another worker, another
account, or another `storageState` file necessarily produce isolated server data?
Trace the actual identifier used by this application before answering.

## Ticket IN-03: “Search is randomly broken”

**Requirement:** searching `headphones` renders exactly `Studio Headphones`.
The inherited assertion sometimes observes the previous six-product list.

1. Inspect the held request and snapshot attachment. Establish whether the
   response existed at the time of observation.
2. Explain the difference between retrying a locator condition and comparing
   a plain array returned by `allTextContents()`.
3. Replace the premature assertion, coordinate release of the held response,
   and await completion. Preserve exact list membership.
4. Do not add a sleep, force the field action, or accept “one product” as enough.
5. With the controlled defect enabled, the response contains one keyboard.
   Your repaired assertion must still reject that same-sized wrong list.

The broken case releases its held response in `finally` so it leaves no blocked
request behind. A screenshot taken during teardown can therefore show the
correct filtered list even though the earlier assertion saw six items. Compare
the trace timeline and `premature-dom-snapshot` attachment; a final screenshot
alone does not establish what the test observed when it failed.

**Interview prompt:** Why does a successful `fill()` say nothing about whether a
debounced search response has rendered? Which observation closes that gap?

## Submit a small incident report

For each case submit: the original failing command and generated run directory;
the first unexpected event with an attachment or trace reference; your initial
hypothesis and a rejected alternative; a minimal patch; a passing repaired run;
and the controlled-defect failure showing the requirement still has protection.
Separate observation from inference. Repeat passes support the repair but cannot
prove the absence of every future race or environmental failure.

Use `worked.spec.ts` as a reviewer key after attempting the diagnosis. In the
reference repairs:

- IN-01 seeds one item, validates status and exact cart, then tests the UI.
- IN-02 allocates another server identity for another customer and checks both
  owners; the two contexts remain independent browser containers in both versions.
- IN-03 uses a web-first locator assertion while the controlled response completes.
  A snapshot remains useful diagnostic evidence, but not a retrying condition.

The three control faults alter browser responses only: missing cart item,
another customer's item, and a same-sized wrong search result. They prove these
business assertions detect those defects; they do not prove every possible
backend or browser failure is covered.

Primary references checked for this lab:
[assertions](https://playwright.dev/docs/test-assertions),
[browser-context isolation](https://playwright.dev/docs/browser-contexts),
[API setup](https://playwright.dev/docs/api-testing),
[trace viewer](https://playwright.dev/docs/trace-viewer),
[route handling](https://playwright.dev/docs/api/class-route).
