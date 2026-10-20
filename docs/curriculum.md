# Forge Academy curriculum map

An original practice-first program: **8 stages, 40 lessons, 80 written exercises, and 40 knowledge checks**. Each lesson contains objectives, original explanations, a code or workflow example, two distinct assignments with acceptance criteria, hints and worked guidance, and primary-source reading. The guided estimates total **38 hours 20 minutes**. Budget additional time for independent implementation, debugging, and the **12–20 hour capstone**; these are planning estimates rather than a completion guarantee.

Start the portal with `npm run dev`, then open the local academy. The practice application is `/lab/`. The repository browser project is named **ui** and runs Chromium; `chromium` is the browser install name. If the default port is occupied, set the same `PORT` for server and test commands. See [the exact lab contract](lab-api.md) before implementing endpoint assertions.

## How to use a lesson

1. Read the objectives and explanation, then inspect the referenced behavior in the live lab.
2. Attempt both exercises before opening their hints or solutions. Save your implementation and a short evidence note.
3. Run the focused check, inspect a real failure, and explain why the oracle is meaningful.
4. Complete the quiz and mark the lesson complete only when its acceptance criteria are satisfied.
5. Revisit a completed lesson if later work reveals a gap. Portal completion is a local learning record, not independent grading.

Lesson code blocks are teaching fragments unless a complete test or configuration is explicitly shown. They assume the relevant `test`, `expect`, fixtures and imports are available. Some examples intentionally require setup described in the surrounding text. Instructions containing a placeholder path must be adapted using `npx playwright test --list`. Follow the repository configuration rather than overwriting it with an illustrative config. The runnable reference suite, starter specs and solutions provide complete examples.

The **80 written exercises** are separate from the **24 executable starter challenges** in `exercises/`; the starter challenges have corresponding runnable worked examples in `solutions/`. Those counts describe different practice formats and should not be conflated.

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

Replace fragile waits with observable conditions. Control dependencies and build useful visual and accessibility checks.

| Lesson | Focus | Guided estimate |
|---|---|---:|
| 03-01 | Auto-waiting and the race-condition clinic | 50 min |
| 03-02 | Control the network, expose the edge cases | 55 min |
| 03-03 | Browser isolation, sessions, and storage | 55 min |
| 03-04 | Events, downloads, and deterministic time | 60 min |
| 03-05 | Visual and accessibility checks with judgment | 60 min |

Stage output: controlled network experiments, independent browser sessions, a receipt check, and focused visual/keyboard evidence.

### 4. Go below the UI

Test the real API, explore invalid inputs, isolate sessions, and combine fast setup with meaningful browser evidence.

| Lesson | Focus | Guided estimate |
|---|---|---:|
| 04-01 | HTTP as a testable contract | 50 min |
| 04-02 | Query parameters, sorting, and invariants | 50 min |
| 04-03 | Mutations, invalid input, and unchanged state | 60 min |
| 04-04 | Authentication and session boundaries | 60 min |
| 04-05 | Hybrid testing and order invariants | 65 min |

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

Stage output: typed fixtures, focused page objects, data builders, and independent parallel execution.

### 6. Ship reliable signals

Diagnose failures from artifacts, choose a useful browser matrix, and make CI a credible release signal.

| Lesson | Focus | Guided estimate |
|---|---|---:|
| 06-01 | Trace-driven debugging | 55 min |
| 06-02 | Flakiness, retries, and false confidence | 55 min |
| 06-03 | A CI pipeline people can trust | 65 min |
| 06-04 | Browser matrix, sharding, and cost | 55 min |
| 06-05 | Reports that lead to decisions | 55 min |

Stage output: trace-based diagnoses, a CI policy, reproducible reports, and a release brief.

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

Use the installed package and lockfile as the execution baseline. Agent definitions and optional features can change; confirm the installed version and current official instructions before initializing or refreshing agents. The official planner/generator/healer workflow is taught with explicit review of business expectations and execution evidence.

The shop uses in-memory state, simplified demo authentication, integer-cent prices, and no real payments. It is a teaching target, not a reference implementation for production security or inventory management. Broader production concerns belong in the capstone's limitations section.
