# Verification record

Verified locally on October 20, 2026 with Node.js 24.22.0, Playwright 1.64.1, and Chromium on macOS. The repository supports Node 22+; the GitHub Actions workflow is supplied but has not been executed remotely in this session.

## Executed checks

- `npm run validate`: 8 stages, 40 lessons, 80 challenges, 34 resources, 8 original articles; schema and relationship checks passed.
- `npm run typecheck`: strict TypeScript check passed for configuration, reference tests, solutions, and starters.
- `npm run check`: source syntax and test discovery passed.
- `PORT=14827 npm run test:all`: **78 passed, 24 intentionally skipped**, in 12.2 seconds.
- `npm run build`: static portal, complete source download, and manuals download generated.
- `unzip -t`: both downloadable archives passed integrity checks.
- Desktop, mobile, lesson, and shop screenshots inspected. All 40 lesson routes rendered without JavaScript exceptions in the portal integration test.

The passing tests comprise 37 UI/API reference cases, 29 executable solution cases, and 12 portal integration cases. The 24 skipped cases are learner starter exercises, not verification coverage. They include explicit failing placeholders to prevent an empty implementation passing after removal of `test.skip`.

Port 14827 was used because two unrelated applications already occupied 4173 and 4174. The default project port remains 4173 and is configurable with `PORT`. Tests check the app-specific `/api/forge-health` endpoint before reusing a server.

## Scope and limits

Chromium desktop and selected mobile viewport flows were executed. Firefox, WebKit, real mobile hardware, full accessibility conformance, load testing, and production security were not audited. The lab is a local educational simulation with in-memory state. External links were researched when the library was authored; their future availability is outside this project.

All lesson routes were checked, but the 80 open-ended lesson challenge solutions were not all executed as standalone tests. Some are design, diagnostic, or review tasks; code fragments explain a concept and may require their surrounding exercise setup. The independently runnable worked solution suite is in `solutions/`.
