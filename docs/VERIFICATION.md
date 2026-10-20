# Verification record

Reviewed and verified locally on October 20, 2026 with Node.js 24.22.0 and Playwright 1.64.1 on macOS. The project supports Node 22+.

## Review verification

- `npm run validate`: 8 stages, 40 lessons, 80 lesson challenges, 34 resources, 8 articles, 30 executable drill mappings, and local document links validated.
- `npm run typecheck`: strict TypeScript checks passed for configuration, reference tests, solutions, skills, and starters.
- `PORT=14827 npm run test:all`: **97 passed, 30 intentionally skipped**, 127 discovered, zero failures/errors, approximately 14 seconds.
- `PORT=14827 npm run test:matrix -- --project=ui-chromium --project=ui-webkit --reporter=list --output=/tmp/forge-verified-matrix`: **30 passed**, 15 shop UI tests on each engine, 9.4 seconds.
- Manual viewport smoke check: all **14 manuals** rendered at **390px and 1440px** (28 checks), with no page errors or document-level horizontal overflow.
- `npm run build`: static portal and downloadable source/manual bundles generated.
- `git diff --check`: passed.

The 97 passing cases comprise 43 UI/API reference cases, 29 shop solution cases, six browser-skills examples, and 19 portal integration cases. The 30 skipped cases are learner starters: 24 EX and six SK assignments. They contain explicit failing placeholders and do not count as verification coverage.

The portal tests include all 40 lesson routes, lesson/checklist/note persistence, quiz feedback, imports/exports, practice mappings, keyboard navigation, malformed paths, and stale asynchronous responses. The lab regressions include delayed cart responses, focus preservation, malformed requests, UTF-8 body limits and chunk boundaries, and receipt isolation.

## Browser-startup limit

Firefox was installed but could not launch on this Mac: it exited with `Could not find profile folder` before executing any page test. A fresh temporary directory produced the same result. This is recorded as an environmental launch failure, not a pass, skip, or application defect. No macOS privacy settings or browser installation were modified to work around it.

The optional GitHub Actions browser matrix runs all three engines on Ubuntu. Select `browser_matrix` when manually running the workflow. The complete Linux run passed on all three engines, as recorded below.

## Linux CI evidence

Verified on GitHub Actions with Node.js 22 and the pinned Playwright package at source commit `087b1633373de98e987b45af7f29bda28fdc6ae6`:

- [Core verification run](https://github.com/i5adovyi/forge-playwright-academy/actions/runs/39444688314): **97 passed, 30 intentionally skipped**, 51.1 seconds. Validation, build, syntax/discovery, and TypeScript checks also passed.
- [Three-engine matrix run](https://github.com/i5adovyi/forge-playwright-academy/actions/runs/39444688299): **45 passed**, 15 per engine (Chromium, Firefox, WebKit), 1.5 minutes; no failed or flaky cases reported.

The first Linux matrix caught a real receipt-download mismatch: WebKit rendered the text attachment as a page. The fix declares download intent on the link, and the regression verifies the downloaded contents and that the shop remains open. The successful run above includes that fix. Subsequent edits to this record and the portal's manual-column CSS do not change the shop matrix; the separate 28-viewport manual check verifies the layout adjustment.

## Reproducibility and scope

Port 14827 avoids unrelated local applications on 4173/4174. The default remains 4173 and is configurable through `PORT`. The runner verifies `/api/forge-health` before reusing a server.

Firefox, Chromium, and WebKit engine testing is distinct from real mobile hardware or every branded browser/device combination. Full accessibility conformance, load testing, and production security have not been audited. The shop is a local simulation with in-memory state. The browser-skills harness is deliberately separate from commerce behavior.

All lesson routes are checked, but the 80 open-ended challenge solutions are not all standalone executed tests. Some are design, investigation, and review tasks; illustrative code requires the surrounding setup. Independently runnable examples live in `solutions/` and `skills/worked.spec.ts`.

## Initial baseline

Before this review, the original Chromium suite had 78 passing cases and 24 intentionally skipped starters. Its GitHub Actions run completed successfully: [initial Linux run](https://github.com/i5adovyi/forge-playwright-academy/actions/runs/39431300647). That baseline is historical evidence, not a substitute for the revised-suite results above.
