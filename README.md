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
npm run test:interactive # Playwright UI mode
```

The test runner starts the local server automatically if it is not already running. On Linux CI, install browser dependencies with `npx playwright install --with-deps chromium`.

## What is inside

- **8 stages / 40 original lessons**, from testing fundamentals and TypeScript to resilient browser tests, API testing, framework design, CI, AI agents, and a capstone.
- **80 lesson challenges**, each with a brief, steps, acceptance criteria, a hint, and a worked solution or reference approach.
- **40 knowledge checks**, lesson notes, exercise checklists, completion tracking, and progress import/export.
- **Forge Shop**, a local app with products, search, cart, discounts, login, checkout, and a real HTTP API.
- **30 executable starter exercises** (24 shop drills + 6 browser-skills drills), reference tests, and executable solutions. Starter exercises intentionally use `test.skip` until you implement them.
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
| `npm run dev` | Serve the portal, shop, and API on port 4173 |
| `npm test` | Run the core UI/API reference suite |
| `npm run test:ui` | Run browser UI reference tests |
| `npm run test:api` | Run HTTP API reference tests |
| `npm run test:portal` | Verify portal navigation and learning tools |
| `npm run test:solutions` | Run executable shop worked solutions |
| `npm run test:skills` | Run timer, auth-state, upload, iframe, popup, and dialog examples |
| `npm run test:skills:practice` | Run the browser-skills starters you implement |
| `npm run test:matrix` | Opt-in shop UI run on Chromium, Firefox, and WebKit; install all engines first |
| `npm run test:exercises` | Discover/run the starter exercises you implement |
| `npm run test:all` | All configured projects; unimplemented starters stay skipped |
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
  content/curriculum.js 40 lessons, exercises, knowledge checks
  content/library.js    Curated resources and original articles
lab/                    Accessible Forge Shop UI
skills/                 Six browser-feature drills, harness, starters, solutions
server.mjs              Local HTTP server and session-isolated API
tests/                  UI, API, and portal verification
exercises/              Starter assignments; remove test.skip as you work
solutions/              Executable worked examples
docs/                   Setup, field manual, API contract, AI guide, rubric
scripts/                Content validation and download/build packaging
.github/workflows/      CI workflow and test artifacts
playwright.config.ts    Projects, timeouts, reports, and web server
playwright.matrix.config.ts  Optional three-engine UI matrix
```

## Your practice environment

Demo login: **demo@forge.test / Playwright123!**. Discount code: **SAVE10**.

Read `docs/lab-api.md` for the exact endpoint and data contract. The lesson pages and practice lab map each EX/SK ID to its starter, solution, and run command. Read `docs/BROWSER-SKILLS.md` for the supplemental browser features and optional cross-browser matrix. Sessions are isolated with a `lab_session` cookie or `x-lab-session` header. Use unique session IDs per API test. Browser tests get a fresh context. Data is in memory and resets when the server restarts. The demo credentials, reset endpoint, and simplified state are for local training; this is not a production commerce service.

The server binds to `127.0.0.1`. To choose another port, set `PORT` and use the same setting for the tests. Avoid pointing destructive reset tests at any external environment.

## Learning progress and privacy

The portal stores progress and notes in this browser’s `localStorage`. There is no learner account, analytics service, cloud sync, grading backend, or external AI request. Export progress from **My progress** before changing browsers or clearing data. Import replaces the current record after confirmation.

The hosted portal and local portal have different browser origins, so export/import is how to transfer progress between them. Google Fonts is used for the presentation with system font fallbacks; original lesson content is local. Linked external resources require internet access.

## Working with AI

Start with `docs/AI-AGENTS.md` and Stage 07. Define the user risk, bound the target to the local lab, ask an agent to inspect the real page, and review the proposed plan. Generated tests must run and must fail for the defect they claim to detect. A healer must not remove assertions or skip failures to produce a green run.

Official Playwright agent tooling depends on the installed version and your chosen AI client. Use the documented commands and current linked documentation, not assumptions about a particular subscription tier.

## Publishing and reuse

`npm run build` generates a standalone static learning portal in `dist/`. You can host that directory on a static host. The **real shop and HTTP API remain local**; the hosted portal offers the source download and setup guide. No learner data is uploaded by the portal.

The original project and writing are MIT licensed. Third-party resources, trademarks, videos, and books remain their authors’ property. Forge is independent and is not an official Microsoft, Playwright, or OpenAI training program. Commercial reuse is permitted for the original work; conduct your own editorial, accessibility, and product review before presenting it as a commercial course.
