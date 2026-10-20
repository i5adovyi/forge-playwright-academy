# Verification record

Verified on October 20, 2026. The project supports Node.js 22+. Local checks used Node.js 24.22.0, Playwright 1.64.1, axe-core/playwright 4.14.0, and Chromium 156.0.8078.4 on macOS arm64.

## UI testing track review

- Content inventory: **54 lessons, 108 written challenges, 39 resources, 8 articles, and 56 executable starter mappings**. Guided lesson estimates total **55 hours 10 minutes**.
- `npm run validate`, `npm run typecheck`, `npm run check`, and `git diff --check` passed after integration.
- `PORT=14827 npm run test:all`: **127 passed, 52 intentionally skipped**, 179 discovered, zero failures, 27.8 seconds. This includes four UI workshop cases and 23 portal cases. The four visual starters run separately, making 56 unfinished starters in total.
- The first integration run exposed two outdated portal expectations: an unscoped Overview link became ambiguous, and the next full-curriculum lesson after 03-10 is now 03-11. Both were corrected; the focused 23-case portal run and subsequent full suite passed.
- All **eight code examples extracted from the revised UI lessons** passed strict TypeScript checking and actual Playwright execution. Setup wrappers were supplied only for fragments that explicitly state their prerequisites. The 03-05 teaching screenshot was generated and inspected in a temporary directory; committed visual baselines were unchanged.
- Three unchanged worked tests rejected controlled, temporary browser-served defects at their intended assertions: removing the email's required constraint (UI-01), clearing shipping input after a checkout failure (UI-03), and allowing an older catalog response to overwrite the latest selection (UI-04). Each fault run exited with one expected failure; tracked application files were not mutated.
- Removing only `.skip` from temporary copies of UI-01–04 produced **four sentinel failures**. The committed starters remain skipped and require actual implementation.
- The UI route and all eleven linked lessons rendered at **390px and 1440px** without page errors or document-level horizontal overflow; representative screenshots were inspected. All 19 then-current manuals passed the same two-width checks. The additional interview/workplace roadmap is verified separately below.
- Sidebar setup navigation remained reachable at **1280×720 and 390×667**, including opening the mobile navigation and scrolling to the setup link.
- The shared `openCart` helper now explicitly waits for the visible dialog. Forge opens that dialog after its refreshed snapshot renders; the helper does not establish a general readiness contract for other applications.
- UI-03 simulates one failure before persistence; it does not test a lost response after a committed order. UI-04 uses a transparent, test-only JSON-consumption probe specific to this application's synchronous rendering. Neither claim extends to arbitrary frontend frameworks.
- The previous API commit `92b384628d26132e22fdba3bcf6aa70088b996cd` completed its [Linux CI workflow](https://github.com/i5adovyi/forge-playwright-academy/actions/runs/39463254651) successfully. New UI commit CI status must be read from its own run; local green results do not imply Linux or optional three-engine success.

## Interview and workplace audit follow-up

- Three subagents reviewed interview topics, delivery/maintenance exercises, and workplace assessment. The resulting roadmap marks all new lab proposals as unimplemented; the lesson and starter inventory is unchanged.
- The roadmap adds 18 interview probes with expected reasoning and a 90-minute mock session referencing existing assignments. It is available in the portal library and linked from the UI track and assessment manual.
- After the roadmap was integrated, all **23 portal tests passed** in 9.0 seconds, including its route and the explicit proposed-lab notice. All **20 manuals × two viewport widths** rendered without page errors or document overflow; the roadmap screenshot was inspected. The UI route and its eleven lessons also passed the final 24-render check.
- Final source and manual bundles were rebuilt; critical source, test, configuration, document, font and baseline files match their working-tree originals. Content validation succeeds from an extracted source bundle, and no auth state, repository internals or test-result directories are included.

## API testing track review

- Content validation: **53 lessons, 106 written challenges, 39 resources, 8 articles, and 52 executable starter mappings**. The guided estimates total **53 hours 55 minutes**.
- `npm run typecheck`, `npm run check`, `npm run validate`, and `git diff --check`: passed after integration.
- `PORT=14827 npm run test:all`: **122 passed, 48 intentionally skipped**, 170 discovered, zero failures, 20.5 seconds. This includes four new AP worked cases, strengthened API reference/EX solutions, and 22 portal cases. Four visual starters run separately, bringing the unfinished starter inventory to 52.
- EX-17's hybrid purchase and EX-20's shared checkout/download helper passed a focused run, then passed again in the complete suite. The hybrid check ties the displayed total and confirmation ID to the order POST response, stored order, and cleared cart.
- All **six extracted API lesson examples** compiled under strict TypeScript and passed headless execution against the local app.
- **Five controlled faults** were tested in isolated scratch copies and rejected by the intended assertion, with no runner errors: omitted response disposal, destructive rejection, counting characters instead of UTF-8 bytes, reading another session's matching receipt ID, and modifying an existing order during a later purchase.
- The API route and all six lessons rendered at **390px and 1440px** without page errors or document-level horizontal overflow; screenshots were inspected. **18 manuals × two widths** also passed those checks.
- The rebuilt source/manual archives include `api-workshop/`, the API workbook, revised lessons, stronger EX starters/solutions, and runner integration. Archive contents are compared with the local source, and validation is run after extraction.

The new AP checks are API-only. The six-lesson track demonstrates the actual
synchronous Forge contract, including session-local ownership, JSON parsing,
read-only receipt access, and immutable order snapshots. It does not claim
production account/role authorization, OAuth, eventual consistency, or a safe
idempotent-write retry protocol. Written design exercises and skipped starters
are not counted as passing coverage. Existing visual references were not changed.

The earlier records below retain the counts, commands, and scope of their own
verification runs.

## Fixtures and browser state: second review

- `npm run validate`, `npm run typecheck`, `npm run check`, and `git diff --check`: passed. Inventory remains **52 lessons, 104 written challenges, 48 executable starters**, including ten FS starters.
- `PORT=14827 npm run test:all`: **117 passed, 44 intentionally skipped**, 161 discovered, zero failures, 15.2 seconds. This includes **14 state worked cases** and 21 portal integration cases.
- `PORT=14829 npm run test:visual`: **4 passed**, 2.1 seconds, against the existing reviewed macOS references without updates.
- `PORT=14827 npm run test:state:auth`: **4 passed**, 1.0 second: setup, read-only member, independent guest, and teardown.
- `PORT=14827 npm run test:state:auth:gate`: the child deliberately reports **one setup failure, one blocked member, and two passing guest/cleanup cases**. The verifier returns zero only after checking the exact single error, no runner errors, the expected dependency outcome, and removal of the temporary auth snapshot. This is evidence for failure handling, not four passing application tests.
- Three isolated lifecycle probes exercise real setup/body failures. They reject additional errors and inspect after-teardown observations. Their parent checks are included in the 117 passing cases.
- In a separate scratch copy, **five controlled regressions were rejected**: worker scope changed to test, automatic teardown omitted, reset replaced with an unrelated HTTP 200 response, lease teardown omitted, and restored draft overwritten on reload. The working source retains no deliberate defects.
- Four complete lesson examples compiled; eight extracted examples/fragments passed headless. A separate documented retry experiment produced the intended first failure and passing retry. That flaky result is an investigation exercise, not clean-suite coverage.
- Desktop and phone-width inspection covers the Docs route, all eight revised lessons, the workbench, and all 17 manuals. The focused-navigation regression verifies that lesson 03-10 continues to 05-06 within this track while the main curriculum retains its own order.
- The rebuilt source download includes typed learner scaffolds, isolated failure probes, and the optional project-auth configuration and runner. Archive contents are compared with source files and the extracted content validator is run.

The FS drills use in-memory snapshots. Only the optional setup-project reference
creates a transient synthetic auth file inside its ignored, unique run
directory. Teardown verifies server reset and file removal; a launcher cleanup
is a separate last resort. Reports omit raw snapshots. The CI workflow runs both
the normal authentication reference and its failure-gate proof.

This review targets Chromium and preserves all 48 unfinished learner starters.
It does not expand the historical cross-engine evidence below.

## Previous fixtures, contexts, and state extension

- `npm run validate`: **8 stages, 52 lessons, 104 written challenges, 39 resources, 8 articles, and 48 executable drill mappings**. Local documentation references validate.
- `npm run typecheck`, `npm run check`, and `git diff --check`: passed after integration.
- `PORT=14827 npm run test:all`: **114 passed, 44 intentionally skipped**, 158 discovered, zero failures, 23.1 seconds. This includes 11 worked cases for the ten FS drills and 21 portal integration tests. FS-02 has two independently valid cases.
- `PORT=14829 npm run test:visual`: **4 passed**, 2.9 seconds, using the existing reviewed macOS references without updates. Four separate visual learner starters remain intentionally skipped; the combined starter inventory is 48.
- An earlier run during the interrupted session reported four portal timeouts and unusually long elapsed times. A complete fresh run passed without changing assertions, timeouts, or retries.
- **17 manuals at two widths (390px and 1440px)** rendered without page errors or document-level horizontal overflow. The new Docs track and state workbench were also checked at both widths and visually inspected.
- The Docs route has eight lesson links and shares completion with the main curriculum. The portal regression checks the workbook, ten FS mappings, starter command, and mobile overflow.
- The downloaded source includes `state/`, its starter/solution and fixture/helper files, the new workbook, updated lessons, and runner configuration. Source and manual archives are checked against their local files and the extracted content validator.

The new state track runs against the local synthetic shop and workbench in Chromium. It checks actual storage restoration and independent guest controls, not only serialized object shapes. Authentication snapshots stay in memory; selected evidence excludes cookie values and raw storage state. Lifecycle checks inspect reverse fixture teardown, and explicitly created contexts have cleanup boundaries around each successful allocation.

The full program now contains 52 hours 40 minutes of guided lesson estimates. Written challenges and skipped starters remain learner work, not additional passing test coverage. The historical accessibility, visual, and browser-matrix evidence below retains its original commit and scope.

## Previous accessibility and visual workshop verification

- `npm run validate`: **8 stages, 44 lessons, 88 written challenges, 34 resources, 8 articles, and 38 executable drill mappings**; document links validated.
- `npm run typecheck`, `npm run check`, and `git diff --check`: passed. Normal visual discovery lists only four worked examples and four starters; the separate defect configuration lists exactly one intentional failure.
- `PORT=14827 npm run test:all`: **102 passed, 34 intentionally skipped**, 136 discovered, zero failures, 25.7 seconds.
- `PORT=14827 npm run test:visual`: **4 passed**, 1.6 seconds, using reviewed macOS references with `maxDiffPixels: 0`, `threshold: 0`, and no update flag.
- `PORT=14827 npm run test:visual:practice`: **4 intentionally skipped**. Together with the main suite, all 38 unfinished learner starters are accounted for; they are not passing coverage.
- `PORT=14827 npm run test:visual:defect`: **1 expected experimental failure**, exit 1. The text amount stayed `$79.20`, but the unchanged summary baseline rejected the tiny, faint price and resulting layout shift. The report showed 23,500 differing pixels and a changed image height. Expected, actual, and diff images were inspected.
- Missing-reference guard: temporarily removed the VS-01 reference, ran ordinary comparison, and observed exit 1 with a missing-snapshot error. No baseline was automatically created. The original reference was restored and its SHA-256 verified unchanged.
- Manual viewport smoke check: **16 manuals × two widths (390px and 1440px)** rendered with no page errors or document-level horizontal overflow. Accessibility desktop/mobile layouts and all four macOS visual references were inspected.
- `npm run build`: portal plus full source/manual download bundles generated, including the new labs, guides, licensed fonts, and visual configuration.

The 102 passing main-suite cases comprise 43 UI/API reference cases, 29 shop solution cases, six browser-skills examples, four accessibility cases, and 20 portal integration cases. Visual comparisons run separately so ordinary API/UI feedback does not require screenshot-baseline maintenance.

AX-02 and AX-04 scan real defective UI states and capture rejection by the original clean-scan assertion before repairing the interface. AX-03 checks keyboard focus behavior and the open dialog. AX-04 also verifies validation, linked errors, and successful recovery. Full axe results, including inconclusive results, are attached for inspection.

VS-03 verifies a changing metadata badge against the same narrow mask while separately comparing the important order-summary image before and after. During development this exposed unstable rendering of a decorative arrow; replacing that glyph with CSS geometry removed the noise without changing the strict comparison policy.

## Baseline ownership and CI

Reviewed references are in `quality/visual/baselines/`, with their environment and review notes in its README. Normal comparison uses committed references and never updates them. The separate manual candidate workflow generates images for review; its success alone is not regression evidence.

Linux candidates were generated from commit `6a8adb9a5d604a6643853b5aa17c55f78ffad231` by the [manual candidate workflow](https://github.com/i5adovyi/forge-playwright-academy/actions/runs/39448007032). All four Linux PNGs were inspected before committing them. Candidate generation is not counted as a passing comparison.

The [ordinary Linux verification run](https://github.com/i5adovyi/forge-playwright-academy/actions/runs/39449034919) passed at commit `1680203e0bee0e89ee68cd40a2517d2bfad3893b`:

- Main verification: **102 passed, 34 intentionally skipped**, approximately one minute; validation, build, syntax/discovery, and TypeScript checks also passed.
- Reviewed visual comparison: **4 passed**, 4.6 seconds, against committed Linux references with no update flag and no retries.

That run predates the fixtures-and-state extension above; it establishes the recorded accessibility and visual baseline evidence at its cited commit.

The previous shop matrix passed **45 tests on Linux**, 15 per engine (Chromium, Firefox, WebKit), at commit `087b1633373de98e987b45af7f29bda28fdc6ae6`: [three-engine run](https://github.com/i5adovyi/forge-playwright-academy/actions/runs/39444688299). This historical matrix does not imply the new accessibility and visual exercises were run on every engine; those new tracks target Chromium.

## Reproducibility and limits

Port 14827 avoids unrelated local applications on 4173/4174. The default remains 4173 and is configurable through `PORT`. The runner checks `/api/forge-health` before reusing a server.

Firefox could not launch in the earlier local macOS review (`Could not find profile folder` before any page test). Its successful Linux shop run above is separate evidence. No operating-system privacy settings were changed to work around that local startup issue.

A clean axe scan is partial evidence for the scanned state and scope. Manual screen-reader, zoom, and assistive-technology review remain necessary for broader accessibility claims. Screenshot comparisons protect reviewed pixels in a specific rendering environment; they do not establish functional correctness, accessibility conformance, real-device behavior, load capacity, or production security.

The 104 written challenges include design and investigation work and are not all independently executed specifications. Runnable examples are in `tests/`, `solutions/`, `skills/`, `quality/`, and `state/`. The shop and quality fixtures use synthetic local data. No real account, registration, payment, or external service is created by these labs.
