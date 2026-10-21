# Forge Academy curriculum map

An original practice-first program: **8 stages, 67 lessons, 134 written exercises, and 67 knowledge checks**. Each lesson contains objectives, original explanations, a code or workflow example, two distinct assignments with acceptance criteria, hints and worked guidance, and primary-source reading. The guided estimates total **70 hours 20 minutes**. Budget additional time for independent implementation, debugging, and the **12–20 hour capstone**; these are planning estimates rather than a completion guarantee.

Start the portal with `npm run dev`, then open the local academy. The practice application is `/lab/`. The repository browser project is named **ui** and runs Chromium; `chromium` is the browser install name. The personal server uses 4173 and tests own an isolated service on 4175. If overriding `PORT`, choose separate unused ports for the personal server and tests. See [the exact lab contract](lab-api.md) before implementing endpoint assertions.

## Start from zero: the optional beginner runway

All original lesson IDs and exercises remain. The six additions live inside
the foundation stage, before 01-01, and have the same notes, quizzes and
completion tracking. Read [the beginner guide](BEGINNER-START.md).

| Lesson | Topic | Practice |
| --- | --- | --- |
| 00-01 | Your computer is the workshop | Setup log and one known run |
| 00-02 | Read small pieces of JavaScript | BG-01–03: values, containers, functions |
| 00-03 | Between a click and a response | Manual Network investigation |
| 00-04 | Your first browser test, line by line | BG-04–06: await, heading, search recovery |
| 00-05 | Your first API test and rejected input | BG-07–08: catalog and unchanged cart |
| 00-06 | Get unstuck and save your work | Failure diagnosis and exit gate |

## How to use a lesson

1. Read the objectives and explanation, then inspect the referenced behavior in the live lab.
2. Attempt both exercises before opening their hints or solutions. Save your implementation and a short evidence note.
3. Run the focused check, inspect a real failure, and explain why the oracle is meaningful.
4. Complete the quiz and mark the lesson complete only when its acceptance criteria are satisfied.
5. Revisit a completed lesson if later work reveals a gap. Portal completion is a local learning record, not independent grading.

Lesson code blocks are teaching fragments unless a complete test or configuration is explicitly shown. They assume the relevant `test`, `expect`, fixtures and imports are available. Some examples intentionally require setup described in the surrounding text. Instructions containing a placeholder path must be adapted using `npx playwright test --list`. Follow the repository configuration rather than overwriting it with an illustrative config. The runnable reference suite, starter specs and solutions provide complete examples.

The **134 written exercises** are separate from **82 executable starter drills**: 8 beginner drills in `beginner/`, 24 shop challenges in `exercises/`, 6 browser-skills drills in `skills/`, 4 accessibility drills in `quality/accessibility/`, 4 visual drills in `quality/visual/`, 10 fixtures/state drills in `state/`, 4 advanced API drills in `api-workshop/`, 4 UI transition drills in `ui-workshop/`, 9 workplace assignments and 9 real-world systems assignments in `workplace/`. Shop starters have worked examples in `solutions/`; the other tracks keep `practice.spec.ts` and `worked.spec.ts` together in their respective directories. Most starters are skipped until implemented. Incident starters use an explicit enable flag; CI gate modules reject with an unfinished sentinel. The workplace workbook explains each mode. Those counts describe different practice formats and should not be conflated.

## The Playwright Docs specialization

Open **PW Docs track** in the portal sidebar for eight connected lessons, with the same progress and notes as the main path. Start at 03-08 after the isolation introduction (03-03), then continue through 03-10. Work through 05-06 to 05-10 after the fixture introduction (05-01). The [fixtures and state workbook](FIXTURES-AND-STATE.md) supplies the official reading map, storage and ownership tables, FS drill sequence, and debugging cases.

```sh
npm run test:state
npm run test:state:practice -- --grep FS-01
```

FS-01–FS-03 explain fixture lifecycle, worker resources, and options; FS-04–FS-07 explore tab, context, and storage boundaries; FS-08–FS-10 connect API cookies, shared server sessions, and authenticated fixture ownership. These ten drills are included in `test:all`. Use the local `/state/` workbench to inspect storage before automating it.

## Before lesson 01-02

Use Node **22 or newer**, npm, a terminal opened at this repository, and enough disk space for the selected browser binaries. Run `node --version`, `npm --version`, and `git status` to establish your environment. Install the lockfile dependencies with `npm ci`, then install Chromium with `npx playwright install chromium`. Run `npm run typecheck` separately from Playwright; executing a TypeScript test does not guarantee its types are correct.

The supplied `webServer` starts the target automatically when running tests. You only need `npm run dev` to browse the academy independently or keep a manual target open. Stopping a manually started server will not reliably produce a connection-refused exercise because the runner can start another one.

Save additional learner tests under `exercises/*.spec.ts` and run them with `npm run test:exercises`. The configured project patterns do not discover a new file at `tests/seed.spec.ts`; the AI seed in lesson 07-02 belongs at `tests/ui/seed.spec.ts`. Always confirm discovery with `--list` before diagnosing a test that appears never to run.

## Choose the right session experiment

- The repository fixture in `tests/support/fixtures.ts` intentionally shares a unique **x-lab-session** header between `request` and `page`. API setup will be visible in the browser even though their cookie jars are separate.
- To study cookie isolation or `storageState`, explicitly clear inherited headers with `browser.newContext({baseURL, extraHTTPHeaders:{}})` and, for a standalone API client, `playwright.request.newContext({baseURL, extraHTTPHeaders:{}})`. Omitting the header option can retain the configured identity. Add `storageState` only when deliberately restoring a session. Establish a cookie through the context's request client before navigation; `page.goto('/lab/')` does not itself wait for the app's asynchronous session initialization.
- Restoring storage state restores access to the same server session. It does not duplicate server-side data. Give separate tests independent identities; use two contexts within one test when intentionally proving state reuse.
- A schema-valid quantity can still exceed stock. For p1, 12 succeeds, 13 and 99 return `409 INSUFFICIENT_STOCK`, and 100 returns `400 INVALID_QUANTITY`. Separate these boundaries in your cases.

## Find an executable drill

The portal includes matching practice links inside each relevant lesson. This table records the same mapping as `portal/content/practice.js`; a drill may reinforce several lessons. Choose one starter, remove only its skip, and implement all acceptance criteria before opening the solution.

```sh
# One shop assignment and its worked example
npm run test:exercises -- --grep EX-12
npm run test:solutions -- --grep EX-12

# One browser-skills assignment and its worked example
npm run test:skills:practice -- --grep SK-02
npm run test:skills -- --grep SK-02

# Accessibility and visual assignments, then their worked examples
npm run test:a11y:practice -- --grep AX-02
npm run test:a11y -- --grep AX-02
npm run test:visual:practice -- --grep VS-01
npm run test:visual -- --grep VS-01
```

A skipped result means unfinished work. A passing solution run demonstrates the reference implementation; it does not establish that you completed the assignment yourself.

| Drill | Practice | Lessons | Starter |
|---|---|---|---|
| EX-01 | Your first observable outcome | 01-02, 02-01 | [exercises/01-foundations.spec.ts](../exercises/01-foundations.spec.ts) |
| EX-02 | Search like a user | 02-02, 02-04 | [exercises/01-foundations.spec.ts](../exercises/01-foundations.spec.ts) |
| EX-03 | Empty results and recovery | 01-05, 02-04 | [exercises/01-foundations.spec.ts](../exercises/01-foundations.spec.ts) |
| EX-04 | Category + sort | 02-04 | [exercises/01-foundations.spec.ts](../exercises/01-foundations.spec.ts) |
| EX-05 | Unavailable products | 02-02 | [exercises/01-foundations.spec.ts](../exercises/01-foundations.spec.ts) |
| EX-06 | Cart lifecycle | 02-02, 02-05 | [exercises/01-foundations.spec.ts](../exercises/01-foundations.spec.ts) |
| EX-07 | Discount arithmetic | 02-05, 03-01, 04-05 | [exercises/01-foundations.spec.ts](../exercises/01-foundations.spec.ts) |
| EX-08 | Keyboard activation and focus return | 03-05 | [exercises/01-foundations.spec.ts](../exercises/01-foundations.spec.ts) |
| EX-09 | Catalog contract | 01-03, 04-01 | [exercises/02-api.spec.ts](../exercises/02-api.spec.ts) |
| EX-10 | Query parameters | 04-02 | [exercises/02-api.spec.ts](../exercises/02-api.spec.ts) |
| EX-11 | Create then update | 04-03 | [exercises/02-api.spec.ts](../exercises/02-api.spec.ts) |
| EX-12 | Boundary table | 01-05, 04-03, 05-03 | [exercises/02-api.spec.ts](../exercises/02-api.spec.ts) |
| EX-13 | Authentication contract | 02-03, 04-04 | [exercises/02-api.spec.ts](../exercises/02-api.spec.ts) |
| EX-14 | Order lifecycle | 04-05 | [exercises/02-api.spec.ts](../exercises/02-api.spec.ts) |
| EX-15 | Session isolation | 03-03, 04-04, 05-01, 05-04 | [exercises/02-api.spec.ts](../exercises/02-api.spec.ts) |
| EX-16 | Malformed and missing data | 04-01, 04-03 | [exercises/02-api.spec.ts](../exercises/02-api.spec.ts) |
| EX-17 | Hybrid checkout | 02-05, 04-05, 05-02, 08-02 | [exercises/03-advanced.spec.ts](../exercises/03-advanced.spec.ts) |
| EX-18 | Service outage | 03-02, 08-03 | [exercises/03-advanced.spec.ts](../exercises/03-advanced.spec.ts) |
| EX-19 | Deterministic empty state | 03-02 | [exercises/03-advanced.spec.ts](../exercises/03-advanced.spec.ts) |
| EX-20 | Receipt download | 03-04 | [exercises/03-advanced.spec.ts](../exercises/03-advanced.spec.ts) |
| EX-21 | Mobile commerce | 03-05, 05-05, 06-04 | [exercises/03-advanced.spec.ts](../exercises/03-advanced.spec.ts) |
| EX-22 | Stock error preserves state | 02-05, 04-03, 08-03 | [exercises/03-advanced.spec.ts](../exercises/03-advanced.spec.ts) |
| EX-23 | Observe network without racing | 01-04, 03-01, 06-02 | [exercises/03-advanced.spec.ts](../exercises/03-advanced.spec.ts) |
| EX-24 | Reset and recovery | 03-03, 05-01, 08-02 | [exercises/03-advanced.spec.ts](../exercises/03-advanced.spec.ts) |
| SK-01 | Timer boundary | 03-04 | [skills/practice.spec.ts](../skills/practice.spec.ts) |
| SK-02 | Reuse cookie authentication | 03-03, 04-04, 05-01 | [skills/practice.spec.ts](../skills/practice.spec.ts) |
| SK-03 | Upload and inspect a file | 03-04 | [skills/practice.spec.ts](../skills/practice.spec.ts) |
| SK-04 | Scope an iframe locator | 02-02, 03-04 | [skills/practice.spec.ts](../skills/practice.spec.ts) |
| SK-05 | Capture a popup | 03-04 | [skills/practice.spec.ts](../skills/practice.spec.ts) |
| SK-06 | Accept and dismiss a dialog | 03-04 | [skills/practice.spec.ts](../skills/practice.spec.ts) |
| AX-01 | Scoped scan and complete evidence | 03-05, 03-06 | [quality/accessibility/practice.spec.ts](../quality/accessibility/practice.spec.ts) |
| AX-02 | Detect and repair a missing accessible name | 03-06 | [quality/accessibility/practice.spec.ts](../quality/accessibility/practice.spec.ts) |
| AX-03 | Keyboard focus and modal recovery | 03-05, 03-07 | [quality/accessibility/practice.spec.ts](../quality/accessibility/practice.spec.ts) |
| AX-04 | Form states and contrast detection | 02-03, 03-07 | [quality/accessibility/practice.spec.ts](../quality/accessibility/practice.spec.ts) |
| VS-01 | Stable desktop baseline | 03-05, 06-06 | [quality/visual/practice.spec.ts](../quality/visual/practice.spec.ts) |
| VS-02 | Mobile expanded summary | 06-04, 06-06 | [quality/visual/practice.spec.ts](../quality/visual/practice.spec.ts) |
| VS-03 | Mask only volatile metadata | 06-07 | [quality/visual/practice.spec.ts](../quality/visual/practice.spec.ts) |
| VS-04 | Review a controlled visual regression | 06-07, 08-03 | [quality/visual/practice.spec.ts](../quality/visual/practice.spec.ts) |

The [accessibility manual](ACCESSIBILITY-LABS.md) covers scans, keyboard behavior, error states and unchanged-oracle defect experiments at `/quality/accessibility/`. The [visual manual](VISUAL-BASELINES.md) covers reviewed platform-specific expectations at `/quality/visual/`. **`npm run test:all` does not run the separate visual projects.** Run `npm run test:visual` explicitly. Missing visual baselines fail until deliberately generated and reviewed; never update a baseline against the controlled defect.

The [browser-skills manual](BROWSER-SKILLS.md) explains the local `/skills/` harness and six additional drills. Uploads, frames, popups, and native dialogs have explicit teaching fixtures there; they are not invented shop features. Clock and authentication drills exercise observable timer boundaries and real session cookies.

### Fixtures and state drill map

| Drill | Focus | Lessons | Starter |
|---|---|---|---|
| FS-01 | Trace fixture setup and reverse teardown | 05-01, 05-06 | `state/practice.spec.ts` |
| FS-02 | Worker lifetime, fresh test resources | 05-04, 05-07 | `state/practice.spec.ts` |
| FS-03 | Options, automatic evidence, and lazy fixtures | 05-08 | `state/practice.spec.ts` |
| FS-04 | Two tabs, one context | 03-08, 03-09 | `state/practice.spec.ts` |
| FS-05 | Separate contexts, separate storage | 03-08, 03-09 | `state/practice.spec.ts` |
| FS-06 | Storage snapshots and IndexedDB | 03-09, 03-10 | `state/practice.spec.ts` |
| FS-07 | Restore tab state before application startup | 03-10 | `state/practice.spec.ts` |
| FS-08 | Browser-owned and standalone API cookies | 03-08, 04-04, 05-09 | `state/practice.spec.ts` |
| FS-09 | Copied authentication is not a cloned account | 03-10, 05-09, 05-10 | `state/practice.spec.ts` |
| FS-10 | An authenticated fixture with a guest control | 05-06, 05-09, 05-10 | `state/practice.spec.ts` |

Worked solutions for this track are in `state/worked.spec.ts`. Run a single completed example with `npm run test:state -- --grep FS-06`; implement the corresponding starter before running `npm run test:state:practice -- --grep FS-06`.

## Evidence gates before advancing

| After stage | Demonstrate before marking the stage complete |
|---|---|
| Foundations | Run one discovered test, explain one boundary distinction, and show a deliberate assertion failure. |
| First UI suite | Complete a persisted purchase and demonstrate a visible rejection, using scoped role/label locators. |
| Resilient UI | Produce an outage and recovery, prove session separation, inspect a receipt, complete browser-skills drills, and retain scoped accessibility scans, a keyboard focus journey, and unchanged-oracle name/contrast defect evidence. Document manual-review gaps. |
| API | Assert exact status/error codes, independent monetary expectations, and unchanged state for rejected mutations. |
| Architecture | Explain fixture setup/use/teardown, then run selected tests alone and with multiple workers without shared-state interference. |
| Delivery | Diagnose a trace, retain actual CI or local evidence, review desktop/mobile baselines, justify a narrow metadata mask, and prove the original screenshot rejects the controlled styling defect. Distinguish configured browsers/platforms from those tested. |
| AI agents | Map a reviewed plan to assertions, inspect the generated diff, and reject a repair that removes the protected rule. Manual planning/review works without paid agent access. |
| Capstone | Demonstrate critical-risk coverage, a controlled defect detected by the intended oracle, a reproducible run, and explicit limitations. |

No stage requires a perfect quiz score before experimenting; knowledge checks guide review. Completion remains a self-assessment based on your evidence. Supplemental drills add practice time beyond the lesson estimates.

For the optional three-engine UI run in lesson 06-04, use `npm run browsers:all`, inspect `npm run test:matrix -- --list`, then run `npm run test:matrix`. The separate `playwright.matrix.config.ts` selects UI checks for Chromium, Firefox, and WebKit; API checks run once in the main configuration. A declared project is not proof it was executed: retain your actual results and platform details.

## Learning stages

### 1. Build your foundation

Turn product risks into evidence. Learn the TypeScript and async patterns that make browser automation understandable.

| Lesson | Focus | Guided estimate |
|---|---|---:|
| 01-01 | The automation engineer’s mindset | 35 min |
| 01-02 | Set up a reproducible workshop | 40 min |
| 01-03 | TypeScript for people who test | 45 min |
| 01-04 | Async without superstition | 45 min |
| 01-05 | Test design that catches real bugs | 50 min |

Stage output: a risk map, reproducible first run, typed scenario table, and checkout state model.

### 2. Your first UI suite

Discover the live shop, write accessible locators, exercise forms, and protect a complete customer journey.

| Lesson | Focus | Guided estimate |
|---|---|---:|
| 02-01 | Your first meaningful browser test | 40 min |
| 02-02 | Locators that survive change | 50 min |
| 02-03 | Forms, validation, and authentication | 50 min |
| 02-04 | Search, filters, and collections | 50 min |
| 02-05 | A customer journey with real evidence | 65 min |

Stage output: a small browser suite covering discovery, forms, search, and a persisted purchase.

### 3. Make it resilient

Replace fragile waits with observable conditions. Control dependencies, audit meaningful interface states, and verify keyboard access with deliberate fault experiments.

| Lesson | Focus | Guided estimate |
|---|---|---:|
| 03-01 | Auto-waiting and the race-condition clinic | 50 min |
| 03-02 | Control the network, expose the edge cases | 55 min |
| 03-03 | Browser isolation, sessions, and storage | 55 min |
| 03-04 | Events, downloads, and deterministic time | 60 min |
| 03-05 | Visual and accessibility checks with judgment | 60 min |
| 03-06 | Accessibility audits grounded in UI state | 65 min |
| 03-07 | Keyboard journeys and accessible recovery | 70 min |
| 03-08 | Browser, context, and page ownership | 65 min |
| 03-09 | Know which storage owns your state | 70 min |
| 03-10 | Restore state without losing the boundary | 75 min |
| 03-11 | Prove transitions: failed saves and stale results | 75 min |

Stage output: controlled network experiments, independent browser sessions, a receipt check, scoped axe reports with incomplete checks retained, a keyboard/modal journey, and name/contrast defect-detection evidence with a manual investigation note. Also demonstrate tab/context boundaries, storage snapshots, and origin-guarded tab-state restoration.

### 4. Go below the UI

Test the real API, explore invalid inputs, isolate sessions, and combine fast setup with meaningful browser evidence.

| Lesson | Focus | Guided estimate |
|---|---|---:|
| 04-01 | HTTP as a testable contract | 50 min |
| 04-02 | Query parameters, sorting, and invariants | 50 min |
| 04-03 | Mutations, invalid input, and unchanged state | 60 min |
| 04-04 | Authentication and session boundaries | 60 min |
| 04-05 | Hybrid testing and order invariants | 65 min |
| 04-06 | Request controls, response ownership, and safe retries | 75 min |
| 04-07 | Recover a lost reply without duplicating the write | 100 min |
| 04-08 | Observe asynchronous jobs without creating more work | 100 min |

Stage output: API contract tests for filtering, mutations, access rules, discounts, and order invariants.

### 5. Engineer your framework

Create focused fixtures, typed helpers, data builders, project boundaries, and parallel-safe tests.

| Lesson | Focus | Guided estimate |
|---|---|---:|
| 05-01 | Fixtures that own their cleanup | 60 min |
| 05-02 | Page objects that reveal intent | 55 min |
| 05-03 | Data builders and parameterized tests | 55 min |
| 05-04 | Parallel-safe by construction | 60 min |
| 05-05 | Projects, configuration, and suite boundaries | 55 min |
| 05-06 | Read a fixture dependency graph | 75 min |
| 05-07 | Worker scope, retries, and unique ownership | 70 min |
| 05-08 | Options, overrides, and automatic evidence | 75 min |
| 05-09 | Authentication setup that fits the workload | 80 min |
| 05-10 | A docs-guided fixture and state investigation | 80 min |
| 05-11 | Refactor page objects without losing evidence | 75 min |
| 05-12 | Build independent data and a complete validation matrix | 75 min |

Stage output: typed fixtures, focused page objects, data builders, and independent parallel execution. Trace dependency teardown, distinguish worker/test lifetime, apply typed options, and defend authentication ownership.

### 6. Ship reliable signals

Diagnose failures from artifacts, review visual baselines, choose a useful browser matrix, and make CI a credible release signal.

| Lesson | Focus | Guided estimate |
|---|---|---:|
| 06-01 | Trace-driven debugging | 55 min |
| 06-02 | Flakiness, retries, and false confidence | 55 min |
| 06-03 | A CI pipeline people can trust | 65 min |
| 06-04 | Browser matrix, sharding, and cost | 55 min |
| 06-05 | Reports that lead to decisions | 55 min |
| 06-06 | Build a visual baseline you can defend | 65 min |
| 06-07 | Investigate visual differences and prove detection | 70 min |
| 06-08 | Diagnose incidents from competing hypotheses | 75 min |
| 06-09 | Make CI reject missing and misleading coverage | 80 min |
| 06-10 | Prove you are testing the intended build | 80 min |

Stage output: trace-based diagnoses, a CI policy, reproducible reports, reviewed desktop/mobile images, a narrowly justified mask, unchanged-baseline defect evidence, and a release brief.

### 7. Work with AI agents

Use official Playwright agents, write executable plans, review generated code, and prevent false-green repairs.

| Lesson | Focus | Guided estimate |
|---|---|---:|
| 07-01 | AI as a test engineering teammate | 50 min |
| 07-02 | Planner: turn exploration into an executable plan | 60 min |
| 07-03 | Generator: from plan to reviewed executable evidence | 60 min |
| 07-04 | Healer: repair tests without erasing defects | 65 min |
| 07-05 | Build your AI testing operating system | 65 min |

Stage output: reviewed planner/generator/healer prompts, generated-test evaluations, and a reusable agent brief.

### 8. Prove your craft

Deliver a risk-based checkout suite, investigate defects, publish evidence, and defend your engineering decisions.

| Lesson | Focus | Guided estimate |
|---|---|---:|
| 08-01 | The checkout quality charter | 70 min |
| 08-02 | Build the critical-path suite | 90 min |
| 08-03 | Adversarial testing and defect investigation | 80 min |
| 08-04 | Package a portfolio another engineer can run | 80 min |
| 08-05 | The final review and your next 90 days | 75 min |

Stage output: a runnable portfolio with a risk charter, critical-path tests, controlled defect experiments, and a technical defense.

## Assessment and evidence

Use [the assessment rubric](ASSESSMENT.md) for the eight weighted dimensions totaling 100 points. The target is at least 80 with no blocking integrity or critical-coverage issues. This is an internal self-assessment, not an accredited certificate. The [capstone guide](CAPSTONE.md) defines the portfolio deliverables and review process.

For each implemented exercise retain: scenario ID, rule under test, isolated setup, exact command, observed result, and one sentence describing what the result does not prove. For critical rules, perform a reversible controlled fault to show the oracle detects the intended defect. Never label a simulated defect as a real finding.

## Source and version notes

Original lesson prose and exercises were written for this project. Official Playwright documentation was consulted on **20 October 2026**, including [writing tests](https://playwright.dev/docs/writing-tests), [API testing](https://playwright.dev/docs/api-testing), [fixtures](https://playwright.dev/docs/test-fixtures), [network control](https://playwright.dev/docs/network), [trace viewer](https://playwright.dev/docs/trace-viewer), and [official Test Agents](https://playwright.dev/docs/test-agents). Every lesson links to relevant primary documentation; the learning library supplies additional courses, books and videos through legitimate source links.

The accessibility and visual extension also uses [Playwright accessibility testing](https://playwright.dev/docs/accessibility-testing), [visual comparisons](https://playwright.dev/docs/test-snapshots), [screenshot assertions](https://playwright.dev/docs/api/class-pageassertions), [axe result documentation](https://github.com/dequelabs/axe-core/blob/develop/doc/API.md), [W3C modal-dialog guidance](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/), and [W3C Easy Checks](https://www.w3.org/WAI/test-evaluate/preliminary/), checked on 20 October 2026. The lab scenarios, fault controls, acceptance criteria and review workflows are original exercises.

Use the installed package and lockfile as the execution baseline. Agent definitions and optional features can change; confirm the installed version and current official instructions before initializing or refreshing agents. The official planner/generator/healer workflow is taught with explicit review of business expectations and execution evidence.

The shop uses in-memory state, simplified demo authentication, integer-cent prices, and no real payments. It is a teaching target, not a reference implementation for production security or inventory management. Broader production concerns belong in the capstone's limitations section.

## API testing specialization

Open **API testing track** in the sidebar. The five existing Stage 04 lessons retain their
original IDs; 04-06 adds request controls and resource ownership, while 04-07/08 add lost replies and asynchronous jobs on separate local services. Work
through EX-09–16 first, then AP-01–04. EX-17 connects API setup with an observed UI
purchase and persisted evidence. Read the [API workbook](API-TESTING.md) for the
claim, negative control, and fault experiment for each drill.

| Drill | Practice | Lessons | Starter |
| --- | --- | --- | --- |
| AP-01 | Request policy and response ownership | 04-01, 04-06 | `api-workshop/practice.spec.ts` |
| AP-02 | JSON bytes and rejected-body boundaries | 04-03, 04-06 | `api-workshop/practice.spec.ts` |
| AP-03 | Receipts belong to a session | 04-04, 04-05 | `api-workshop/practice.spec.ts` |
| AP-04 | Orders remain immutable after later purchases | 04-05 | `api-workshop/practice.spec.ts` |

```sh
npm run test:api:workshop
npm run test:api:practice -- --grep AP-01
```

Each command selecting a starter remains skipped until you implement its
criteria, replace its sentinel, and remove `.skip`. A passing worked example
is a comparator for your reasoning, not evidence that you completed the assignment.


## UI testing specialization

Open **UI testing track** for 02-01–05, 03-01–05, and 03-11: eleven lessons with
EX-01–08, EX-17–24, and UI-01–04. Related SK, AX, VS, and FS drills remain linked
specializations. The [UI workbook](UI-TESTING.md) explains the evidence and limits
of each experiment. Existing lesson IDs and saved progress are preserved.

| Drill | Practice | Lessons | Starter |
| --- | --- | --- | --- |
| UI-01 | Native validation, server rejection, and correction | 02-03 | `ui-workshop/practice.spec.ts` |
| UI-02 | Guest recovery through a complete UI purchase | 02-05 | `ui-workshop/practice.spec.ts` |
| UI-03 | Failed checkout preserves input and retries once | 02-05, 03-02, 03-11 | `ui-workshop/practice.spec.ts` |
| UI-04 | The newest catalog selection survives an older response | 02-04, 03-01, 03-02, 03-11 | `ui-workshop/practice.spec.ts` |

```sh
npm run test:ui:workshop
npm run test:ui:practice -- --grep UI-01
```

Run starters only after implementing their TODOs, replacing the sentinel, and
removing `.skip`. Worked examples are comparators, not completed learner work.


## Workplace specialization

Follow **06-08 → 06-09 → 05-11 → 05-12** in the portal's Workplace practice route.
The [workplace workbook](WORKPLACE-LABS.md) connects diagnosis, coverage policy,
refactoring, and data ownership with reviewable evidence. The same lessons remain
in their natural architecture/delivery stages in the complete curriculum.

| Assignments | Focus | Starter location |
| --- | --- | --- |
| IN-01–03 | Rejected setup, shared identity, premature observation | `workplace/incidents/practice.spec.ts` |
| CG-01–02 | Required execution and truthful outcomes | `workplace/gates/starter-inventory.mjs`, `starter-outcomes.mjs` |
| RF-01–02 | Independent consumers and locator lifetime | `workplace/refactoring/practice.spec.ts`, `shop.starter.ts` |
| DB-01–02 | Nested data ownership and field boundaries | `workplace/builders/practice.spec.ts`, `builders.starter.ts` |

The nine IDs describe assignments. RF-01 expands to two consumers; DB-02 expands
to 48 separately registered cases. Do not equate the 82 assignment IDs with a
Playwright report's discovered or skipped test count.

## Real-world systems specialization

Continue **06-10 → 04-07 → 04-08** after the workplace fundamentals. The
[systems workbook](REAL-WORLD-SYSTEMS.md) defines the separate fixture contracts.

| Assignments | Focus | Starter |
| --- | --- | --- |
| WB-01–03 | Wrong builds, diagnostic classification, zero-write gates | `workplace/preflight/practice.spec.ts` |
| LR-01–03 | After-commit response loss, replay policy, bounded reconciliation | `workplace/recovery/practice.spec.ts` |
| AJ-01–03 | Submit once, terminal results, bounded observation | `workplace/jobs/practice.spec.ts` |

All nine use an explicit `--enable-starters` flag. Implement the typed helper and
acceptance cases before replacing the sentinel. Dedicated runners start their
own services and retain evidence under `quality-results/`; these suites are
separate from `test:all` and run explicitly in CI.
