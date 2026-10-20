# Verification record

Verified on October 20, 2026. The project supports Node.js 22+. Local checks used Node.js 24.22.0, Playwright 1.64.1, axe-core/playwright 4.14.0, and Chromium 156.0.8078.4 on macOS arm64.

## Accessibility and visual workshop extension

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

Subsequent edits record this evidence and add AI review prompts to the manual; they do not change the tested fixtures or comparison configuration.

The previous shop matrix passed **45 tests on Linux**, 15 per engine (Chromium, Firefox, WebKit), at commit `087b1633373de98e987b45af7f29bda28fdc6ae6`: [three-engine run](https://github.com/i5adovyi/forge-playwright-academy/actions/runs/39444688299). This historical matrix does not imply the new accessibility and visual exercises were run on every engine; those new tracks target Chromium.

## Reproducibility and limits

Port 14827 avoids unrelated local applications on 4173/4174. The default remains 4173 and is configurable through `PORT`. The runner checks `/api/forge-health` before reusing a server.

Firefox could not launch in the earlier local macOS review (`Could not find profile folder` before any page test). Its successful Linux shop run above is separate evidence. No operating-system privacy settings were changed to work around that local startup issue.

A clean axe scan is partial evidence for the scanned state and scope. Manual screen-reader, zoom, and assistive-technology review remain necessary for broader accessibility claims. Screenshot comparisons protect reviewed pixels in a specific rendering environment; they do not establish functional correctness, accessibility conformance, real-device behavior, load capacity, or production security.

The 88 written challenges include design and investigation work and are not all independently executed specifications. Runnable examples are in `tests/`, `solutions/`, `skills/`, and `quality/`. The shop and quality fixtures use synthetic local data. No real account, registration, payment, or external service is created by these labs.
