# Forge — Playwright Academy

A complete, hands-on test automation workshop: a learning portal, a real shop and API, a progressive curriculum, practical exercises, worked solutions, and a portfolio capstone.

Built for deliberate practice in **TypeScript + Playwright**. Everything needed for the original learning content lives in this repository. You do not need an AI subscription to use the academy. External courses, books, and optional AI tools have their own availability and terms.

## Start in five minutes

Requirements: **Node.js 22+**, npm, and a supported Playwright operating system. Install from the project folder:

```bash
npm ci
npx playwright install chromium
npm run dev
```

Open **http://127.0.0.1:4173** for the academy and **http://127.0.0.1:4173/lab/** for Forge Shop.

In a second terminal:

```bash
npm test                 # UI and API reference tests
npm run test:solutions   # Worked exercise solutions
npm run test:portal      # Learning portal integration tests
npm run test:skills      # Six browser-feature worked examples
npm run test:a11y        # Four accessibility worked labs
npm run test:visual      # Four visual comparisons using reviewed platform baselines
npm run test:interactive # Playwright UI mode
```

The test runner starts the local server automatically if it is not already running. On Linux CI, install browser dependencies with `npx playwright install --with-deps chromium`.

## OpenAI Sites, localhost, and private GitHub

Use the [OpenAI-hosted academy](https://forge-playwright-academy.igor-sadovyi87.chatgpt.site/)
for learning content, `npm run local` for the complete workshop at
**http://127.0.0.1:4173**, and the [private GitHub repository](https://github.com/i5adovyi/forge-playwright-academy)
for source and history. After `npm run build`, `npm run preview` serves the exact
static portal at **http://127.0.0.1:4174**. A GitHub push does not deploy OpenAI Sites.

[Run anywhere](docs/RUN-ANYWHERE.md) explains both modes, publishing, Git pushes,
and moving your progress between origins and OpenAI accounts.

## What is inside

- **8 stages / 61 original lessons**, from testing fundamentals and TypeScript to resilient browser tests, API testing, framework design, CI, AI agents, and a capstone.
- **122 lesson challenges**, each with a brief, steps, acceptance criteria, a hint, and a worked solution or reference approach.
- **61 knowledge checks**, lesson notes, exercise checklists, completion tracking, and progress import/export.
- **Forge Shop**, a local app with products, search, cart, discounts, login, checkout, and a real HTTP API.
- **74 executable starter exercises** (24 shop drills + 6 browser-skills drills + 4 accessibility labs + 4 visual-baseline exercises + 10 fixtures-and-state drills + 4 advanced API drills + 4 UI transition drills + 9 workplace assignments + 9 real-world systems assignments), reference tests, and executable solutions. Most starter specs use `test.skip` until implemented; incident enable flags and unfinished CI gate modules are explained in the workplace workbook.
- **An original article collection and manuals**, plus a curated external library of documentation, books, courses, and videos.
- **A reproducible CI workflow** with HTML reports, traces on failure, and useful artifacts.
- **A portfolio capstone** with deliverables, review criteria, and a release decision.

Completion is self-reported. The portal does not execute your submitted lesson work or issue an accredited certificate.

Read the [academy review](docs/REVIEW.md) for corrected gaps and optional extensions, and the [verification record](docs/VERIFICATION.md) for executed checks and their limitations. Both are also available in the portal library.

## The learning path

| Stage | Focus | What you build |
| --- | --- | --- |
| 01 | Build your foundation | Risk map, TypeScript patterns, reproducible setup |
| 02 | Your first UI suite | Accessible locators, form checks, a customer journey |
| 03 | Make it resilient | Controlled network behavior, uploads, visual and accessibility checks |
| 04 | Go below the UI | HTTP contract checks, validation, isolated state, hybrid tests |
| 05 | Engineer your framework | Fixtures, data builders, helpers, parallel-safe architecture |
| 06 | Ship reliable signals | Trace diagnosis, browser matrix, useful CI evidence |
| 07 | Work with AI agents | Planner/generator/healer workflows with human verification |
| 08 | Prove your craft | A risk-based release suite and portfolio evidence |

Read a lesson, attempt its exercises, run the relevant code, compare with the solution, and record what changed your understanding. The suggested minutes are estimates, not deadlines. Use `docs/STUDY-PLANS.md` to choose a pace.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run local` | Start the full local workshop; same as dev/start |
| `npm run preview` | Preview built static hosting output on port 4174 |
| `npm run dev` | Serve the portal, shop, and API on port 4173 |
| `npm test` | Run the core UI/API reference suite |
| `npm run test:ui` | Run browser UI reference tests |
| `npm run test:ui:workshop` | Run four form, recovery, failed-save, and stale-response examples |
| `npm run test:ui:practice` | Run the UI starters after implementing them |
| `npm run test:api` | Run HTTP API reference tests |
| `npm run test:portal` | Verify portal navigation and learning tools |
| `npm run test:solutions` | Run executable shop worked solutions |
| `npm run test:api:workshop` | Run four advanced request, body-boundary, receipt, and persistence examples |
| `npm run test:api:practice` | Run the advanced API starters after implementing them |
| `npm run test:state` | Run fixture lifecycle, context, storage, and authentication examples |
| `npm run test:state:practice` | Run the fixtures-and-state starters you implement |
| `npm run test:state:auth` | Run the optional authentication setup, member, guest, and cleanup projects |
| `npm run test:state:auth:gate` | Verify that an intentional setup failure blocks its member consumer and still cleans up |
| `npm run test:skills` | Run timer, auth-state, upload, iframe, popup, and dialog examples |
| `npm run test:skills:practice` | Run the browser-skills starters you implement |
| `npm run test:matrix` | Opt-in shop UI run on Chromium, Firefox, and WebKit; install all engines first |
| `npm run test:exercises` | Discover/run the starter exercises you implement |
| `npm run test:all` | Core, UI/API workshops, browser-skills, accessibility, fixtures/state, refactoring, builders, and portal projects; visual and standalone workplace proof runners run separately |
| `npm run test:a11y` | Axe scans, defect detection, keyboard flows, and form recovery |
| `npm run test:a11y:practice` | Accessibility starters you implement |
| `npm run test:visual` | Compare against committed references for your platform; never create them silently |
| `npm run test:visual:practice` | Visual starters you implement, sharing reviewed references |
| `npm run test:visual:update` | Generate candidate references for deliberate human review |
| `npm run test:visual:defect` | Intentionally fail on a controlled defect; inspect the screenshot diff |
| `npm run test:interactive` | Open Playwright UI mode |
| `npm run test:debug` | Open the inspector for UI tests |
| `npm run test:report` | View the latest HTML report |
| `npm run check` | Syntax checks and test discovery |
| `npm run validate` | Validate the curriculum and resource schema |
| `npm run build` | Create `dist/`, manual downloads, and a complete source ZIP |

The download packager uses the standard `zip` command (available on macOS and Linux; install it or use WSL on Windows). Running the academy and tests does not require `zip`. Run `npm run build` once to enable downloadable bundles in your local portal. The hosted portal already includes them.

## Repository map

```text
portal/                 Learning portal and content modules
  content/curriculum.js 61 lessons, exercises, knowledge checks
  content/library.js    Curated resources and original articles
lab/                    Accessible Forge Shop UI
skills/                 Six browser-feature drills, harness, starters, solutions
ui-workshop/            UI transition starters and worked examples
api-workshop/            Four advanced API starters and worked solutions
workplace/              Incident, gate, refactoring, builder, preflight, recovery, and job workshops
state/                  Fixture lifecycles, storage workbench, 10 starters and solutions
quality/                Accessibility and visual labs, starters, solutions, baselines
server.mjs              Local HTTP server and session-isolated API
tests/                  UI, API, and portal verification
exercises/              Starter assignments; remove test.skip as you work
solutions/              Executable worked examples
docs/                   Setup, field manual, API contract, AI guide, rubric
scripts/                Content validation and download/build packaging
.github/workflows/      CI workflow and test artifacts
playwright.config.ts    Projects, timeouts, reports, and web server
playwright.matrix.config.ts  Optional three-engine UI matrix
playwright.visual.config.ts  Separate visual comparison and practice projects
```

## Your practice environment

Demo login: **demo@forge.test / Playwright123!**. Discount code: **SAVE10**.

Read `docs/lab-api.md` for the exact endpoint and data contract. The lesson pages and practice lab map each EX/SK ID to its starter, solution, and run command. Read `docs/BROWSER-SKILLS.md` for the supplemental browser features and optional cross-browser matrix. Sessions are isolated with a `lab_session` cookie or `x-lab-session` header. Use unique session IDs per API test. Browser tests get a fresh context. Data is in memory and resets when the server restarts. The demo credentials, reset endpoint, and simplified state are for local training; this is not a production commerce service.

The server binds to `127.0.0.1`. To choose another port, set `PORT` and use the same setting for the tests. Avoid pointing destructive reset tests at any external environment.

## Accessibility and visual workshops

Start with lessons **03-06 / 03-07** and [Accessibility labs](docs/ACCESSIBILITY-LABS.md). The dedicated signup fixture at `/quality/accessibility/` includes reversible training defects. Use axe results as investigation evidence, then test keyboard navigation and error recovery. A clean automated scan does not establish accessibility conformance.

Continue with lessons **06-06 / 06-07** and [Visual baselines](docs/VISUAL-BASELINES.md). The fixture at `/quality/visual/` has local fonts, stable data, desktop/mobile states, and a narrow volatile-content mask. Baselines are separated by operating system and reviewed before comparison. The default comparison refuses to create missing images. Use the update command only for candidate generation, inspect the images and diff, and commit approved changes with a reason. Normal CI only compares; a separate manual workflow prepares Linux candidates for review.

The controlled-defect command is supposed to exit unsuccessfully. Its screenshot mismatch is the learning evidence; an unrelated launch or setup failure does not count. The main suite excludes this intentional failure and the separate visual projects.

## Learning progress and privacy

The portal stores progress and notes in this browser’s `localStorage`. There is no learner account, analytics service, cloud sync, grading backend, or external AI request. Export progress from **My progress** before changing browsers or clearing data. Import replaces the current record after confirmation.

The hosted portal and local portal have different browser origins, so export/import is how to transfer progress between them. Google Fonts is used for the presentation with system font fallbacks; original lesson content is local. Linked external resources require internet access.

## Working with AI

Start with `docs/AI-AGENTS.md` and Stage 07. Define the user risk, bound the target to the local lab, ask an agent to inspect the real page, and review the proposed plan. Generated tests must run and must fail for the defect they claim to detect. A healer must not remove assertions or skip failures to produce a green run.

Official Playwright agent tooling depends on the installed version and your chosen AI client. Use the documented commands and current linked documentation, not assumptions about a particular subscription tier.

## Publishing and reuse

`npm run build` generates a standalone static learning portal in `dist/`. You can host that directory on a static host. The **real shop and HTTP API remain local**; the hosted portal offers the source download and setup guide. No learner data is uploaded by the portal.

The original project and writing are MIT licensed. Third-party resources, trademarks, videos, and books remain their authors’ property. Bundled Atkinson Hyperlegible fonts have their own [SIL Open Font License](quality/visual/fonts/OFL.txt). Forge is independent and is not an official Microsoft, Playwright, or OpenAI training program. Commercial reuse is permitted for the original work; conduct your own editorial, accessibility, and product review before presenting it as a commercial course.

## Playwright Docs track: fixtures, contexts, and state

Open **PW Docs track** in the portal sidebar (`#/docs`). Eight added lessons—03-08 through 03-10 and 05-06 through 05-10—connect official guides and API references to ten FS experiments. The [fixtures and state workbook](docs/FIXTURES-AND-STATE.md) includes a reading map, ownership model, storage matrix, debugging guide, and authentication strategy decisions.

```sh
npm run test:state
npm run test:state:practice -- --grep FS-04
```

The local `/state/` workbench makes browser storage observable. Compare same-context tabs with independent contexts; save and restore IndexedDB deliberately; prove that copied login cookies do not clone server data. Begin with FS-04–09 for browser boundaries, then FS-01–03 and FS-10 for fixtures. Implement TODOs and replace sentinels before removing `.skip`. Typed fixture scaffolds are in `state/support/practice-fixtures.ts`; worked examples are in `state/worked.spec.ts`.

The 14 worked cases cover lazy setup, reverse teardown, worker reuse, options, popup copying, reload persistence, and independently observed cleanup. Controlled setup/body failure probes reject additional errors, so an unrelated failure cannot satisfy the exercise. The portal preserves a focused “Next in this track” route between all eight lessons.

The FS drills keep snapshots in memory. Lesson 05-09 also provides an optional project-dependency reference in `state/project-auth/`: `npm run test:state:auth` runs setup, a read-only member, an independent guest, and cleanup. `npm run test:state:auth:gate` proves setup failure blocks the member while the guest and cleanup still pass. This separate example writes a transient synthetic auth file to its own ignored run directory, verifies its removal, and retains reports without raw snapshots. It is an extension of a written challenge, not an extra starter.

## API testing track

Open **API testing track** in the portal (`#/api`). Eight lessons connect the eight EX-09–16 foundations to four advanced AP drills,
six LR/AJ systems assignments, and the related EX-17 hybrid checkout.
The [API workbook](docs/API-TESTING.md) gives a route, exact run commands, evidence
criteria, and deliberate faults. The [endpoint contract](docs/lab-api.md)
describes the actual local backend.

```sh
npm run test:api
npm run test:solutions -- --grep 'EX-(09|1[0-6])'
npm run test:api:workshop
# Implement AP-01 before removing its .skip and failing sentinel.
npm run test:api:practice -- --grep AP-01
```

The revised examples check existing discounted carts after rejections, complete
order arithmetic and persistence, independent sessions, response/client
ownership, JSON byte limits, and text receipt ownership. AP starters and worked
solutions live in `api-workshop/`. Existing lesson IDs and progress remain valid;
04-06 adds request controls, disposal, and the distinctions between request
errors, HTTP errors, polling, and retries.

## UI testing specialization

Open **UI testing track** in the portal for eleven lessons and twenty mapped drills.
Read [the UI workbook](docs/UI-TESTING.md), implement EX-01–08, and use the advanced
EX-17–24 and UI-01–04 cases to practice complete recovery and controlled timing.
Lesson 03-11 adds failed-save and stale-response experiments. Existing lesson IDs
and saved progress remain valid.

```sh
npm run test:ui:workshop
npm run test:ui:practice -- --grep UI-01
```

The four UI starters are intentionally skipped until their TODOs are implemented
and their failing sentinels replaced with meaningful assertions. The browser runs
against the local shop; the hosted portal supplies lessons and downloads.

The [interview and workplace roadmap](docs/INTERVIEW-AND-WORKPLACE.md) audits current coverage, supplies 18 practical interview probes and a 90-minute mock session, and prioritizes the next incident, code-review, refactoring, CI, and integration assignments. Proposed labs are clearly separated from executable material.


## Workplace engineering practice

Open **Workplace practice** (`#/workplace`) for four lessons and nine assignments.
Use the [workplace workbook](docs/WORKPLACE-LABS.md) for the sequence, starter
activation rules, review rubric, and exact proof limits. The implementation lives
under `workplace/`, with detailed briefs beside each starter and worked solution.

```sh
npm run test:incidents:broken  # Intentionally fails; investigate the evidence.
npm run test:incidents        # Worked repairs
npm run test:gates            # Real report checked against reviewed requirements
npm run test:refactoring      # Duplicated baseline and refactored consumers
npm run test:builders         # Fresh nested data and 48 field/boundary cases
npm run test:incidents:proof
npm run test:gates:unit
npm run test:gates:proof
npm run test:refactoring:proof
npm run test:builders:proof
```

A successful proof means the expected intentional faults were detected. It does
not grade an untouched starter. Incident and gate runners have separate
configurations; the other reference cases are also included in `test:all`.
The GitHub workflow runs all four proofs and keeps their fresh evidence.

## Real-world systems: wrong builds, lost replies, asynchronous jobs

Open **Real-world systems** (`#/real-world`) and follow 06-10 → 04-07 → 04-08.
The [systems workbook](docs/REAL-WORLD-SYSTEMS.md) connects nine assignments to
separate local services, typed starters, worked solutions, and defect proofs.

```sh
npm run test:preflight
npm run test:recovery
npm run test:jobs
npm run test:preflight:practice -- --enable-starters --grep WB-01
npm run test:recovery:practice -- --enable-starters --grep LR-01
npm run test:jobs:practice -- --enable-starters --grep AJ-01
```

Run `test:preflight:proof`, `test:recovery:proof`, and `test:jobs:proof` for the
controlled reference checks. These standalone configurations run explicitly in
CI and are separate from `test:all`. Read each README before treating a reference
proof as grading of your edited starter. Missing evidence stays uncertain;
a healthy wrong build, an accepted job, or a lost reply is not proof of success.
