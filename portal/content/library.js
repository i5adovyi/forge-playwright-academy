// Original academy content. External resources checked on 2026-10-20.
export const resources = [
  {
    "id": "pw-contexts",
    "title": "Browser contexts and isolation",
    "type": "Documentation",
    "author": "Playwright team",
    "level": "Intermediate",
    "description": "Predict whether two tabs or two customers should share state before writing setup.",
    "url": "https://playwright.dev/docs/browser-contexts",
    "tags": [
      "context",
      "isolation",
      "state"
    ],
    "cost": "Free",
    "verified": "2026-10-20"
  },
  {
    "id": "pw-context-api",
    "title": "BrowserContext API reference",
    "type": "Documentation",
    "author": "Playwright team",
    "level": "Intermediate",
    "description": "Inspect cookies, storage snapshots, initialization scripts, and context ownership in the API contract.",
    "url": "https://playwright.dev/docs/api/class-browsercontext",
    "tags": [
      "context",
      "storageState",
      "IndexedDB"
    ],
    "cost": "Free",
    "verified": "2026-10-20"
  },
  {
    "id": "pw-use-options",
    "title": "Context configuration and use options",
    "type": "Documentation",
    "author": "Playwright team",
    "level": "Intermediate",
    "description": "Trace the settings supplied to fixtures and newly created contexts.",
    "url": "https://playwright.dev/docs/test-use-options",
    "tags": [
      "fixtures",
      "configuration",
      "context"
    ],
    "cost": "Free",
    "verified": "2026-10-20"
  },
  {
    "id": "pw-setup-dependencies",
    "title": "Project setup and teardown dependencies",
    "type": "Documentation",
    "author": "Playwright team",
    "level": "Intermediate",
    "description": "Connect authentication setup to consuming projects and understand the dependency lifecycle.",
    "url": "https://playwright.dev/docs/test-global-setup-teardown",
    "tags": [
      "auth",
      "projects",
      "fixtures"
    ],
    "cost": "Free",
    "verified": "2026-10-20"
  },
  {
    "id": "pw-request-context",
    "title": "APIRequestContext and cookie ownership",
    "type": "Documentation",
    "author": "Playwright team",
    "level": "Intermediate",
    "description": "Choose a browser-associated or standalone API context for the session experiment you need.",
    "url": "https://playwright.dev/docs/api/class-apirequestcontext",
    "tags": [
      "API",
      "cookies",
      "state"
    ],
    "cost": "Free",
    "verified": "2026-10-20"
  },
  {
    "id": "pw-start",
    "title": "Playwright: installation & first run",
    "type": "Documentation",
    "author": "Playwright team",
    "level": "Beginner",
    "description": "The official starting point. Install browsers, run a test, and understand what the runner creates.",
    "url": "https://playwright.dev/docs/intro",
    "tags": [
      "setup",
      "ui"
    ],
    "cost": "Free",
    "verified": "2026-10-20"
  },
  {
    "id": "pw-locators",
    "title": "Locators that survive UI changes",
    "type": "Documentation",
    "author": "Playwright team",
    "level": "Beginner",
    "description": "Learn role, label, text, test ID, chaining, and filtering. Apply one strategy to the Forge Shop catalog.",
    "url": "https://playwright.dev/docs/locators",
    "tags": [
      "locators",
      "ui"
    ],
    "cost": "Free",
    "verified": "2026-10-20"
  },
  {
    "id": "pw-assertions",
    "title": "Assertions and retrying expectations",
    "type": "Documentation",
    "author": "Playwright team",
    "level": "Beginner",
    "description": "Choose a web assertion for the outcome you need. Compare a retrying locator assertion with an immediate value check.",
    "url": "https://playwright.dev/docs/test-assertions",
    "tags": [
      "assertions",
      "reliability"
    ],
    "cost": "Free",
    "verified": "2026-10-20"
  },
  {
    "id": "pw-api",
    "title": "API testing with Playwright",
    "type": "Documentation",
    "author": "Playwright team",
    "level": "Intermediate",
    "description": "Use APIRequestContext for direct HTTP checks, setup, and cross-layer tests. Read this before the cart API exercises.",
    "url": "https://playwright.dev/docs/api-testing",
    "tags": [
      "api",
      "http"
    ],
    "cost": "Free",
    "verified": "2026-10-20"
  },
  {
    "id": "pw-fixtures",
    "title": "Fixtures and dependency lifecycles",
    "type": "Documentation",
    "author": "Playwright team",
    "level": "Intermediate",
    "description": "Study test and worker scope, dependencies, and teardown. Build a fixture that owns an isolated lab session.",
    "url": "https://playwright.dev/docs/test-fixtures",
    "tags": [
      "architecture",
      "fixtures"
    ],
    "cost": "Free",
    "verified": "2026-10-20"
  },
  {
    "id": "pw-auth",
    "title": "Authentication and saved state",
    "type": "Documentation",
    "author": "Playwright team",
    "level": "Intermediate",
    "description": "Select an authentication strategy that fits shared or mutable server state. Treat saved state as sensitive data.",
    "url": "https://playwright.dev/docs/auth",
    "tags": [
      "auth",
      "state"
    ],
    "cost": "Free",
    "verified": "2026-10-20"
  },
  {
    "id": "pw-trace",
    "title": "Trace Viewer: investigate a failure",
    "type": "Documentation",
    "author": "Playwright team",
    "level": "Beginner",
    "description": "Inspect an action timeline, DOM snapshots, and requests. Use a trace to explain a failure before changing code.",
    "url": "https://playwright.dev/docs/trace-viewer",
    "tags": [
      "debugging",
      "traces"
    ],
    "cost": "Free",
    "verified": "2026-10-20"
  },
  {
    "id": "pw-ci",
    "title": "Run Playwright in CI",
    "type": "Documentation",
    "author": "Playwright team",
    "level": "Intermediate",
    "description": "Official recipes for installing dependencies and running the suite on build infrastructure. Compare with this repository workflow.",
    "url": "https://playwright.dev/docs/ci",
    "tags": [
      "ci",
      "delivery"
    ],
    "cost": "Free",
    "verified": "2026-10-20"
  },
  {
    "id": "pw-practices",
    "title": "Playwright best practices",
    "type": "Documentation",
    "author": "Playwright team",
    "level": "Beginner",
    "description": "A review checklist for meaningful assertions, robust locators, isolation, and controlled dependencies.",
    "url": "https://playwright.dev/docs/best-practices",
    "tags": [
      "strategy",
      "ui"
    ],
    "cost": "Free",
    "verified": "2026-10-20"
  },
  {
    "id": "pw-network",
    "title": "Network control and observation",
    "type": "Documentation",
    "author": "Playwright team",
    "level": "Intermediate",
    "description": "Observe responses and intercept requests. Practice a controlled server error without damaging the practice API.",
    "url": "https://playwright.dev/docs/network",
    "tags": [
      "api",
      "mocking"
    ],
    "cost": "Free",
    "verified": "2026-10-20"
  },
  {
    "id": "pw-parallel",
    "title": "Parallelism and independent tests",
    "type": "Documentation",
    "author": "Playwright team",
    "level": "Advanced",
    "description": "Understand workers and execution order. Use this when a test passes alone but collides with another test.",
    "url": "https://playwright.dev/docs/test-parallel",
    "tags": [
      "parallel",
      "architecture"
    ],
    "cost": "Free",
    "verified": "2026-10-20"
  },
  {
    "id": "pw-retries",
    "title": "Retries and flaky test classification",
    "type": "Documentation",
    "author": "Playwright team",
    "level": "Intermediate",
    "description": "Learn runner behavior after failure. Use retries to gather evidence while keeping the underlying failure visible.",
    "url": "https://playwright.dev/docs/test-retries",
    "tags": [
      "reliability",
      "ci"
    ],
    "cost": "Free",
    "verified": "2026-10-20"
  },
  {
    "id": "pw-visual",
    "title": "Visual comparison testing",
    "type": "Documentation",
    "author": "Playwright team",
    "level": "Advanced",
    "description": "Create and review screenshot expectations. Control the rendering environment before accepting baseline changes.",
    "url": "https://playwright.dev/docs/test-snapshots",
    "tags": [
      "visual",
      "ui"
    ],
    "cost": "Free",
    "verified": "2026-10-20"
  },
  {
    "id": "pw-a11y",
    "title": "Accessibility testing with axe",
    "type": "Documentation",
    "author": "Playwright team",
    "level": "Intermediate",
    "description": "Combine automated scans with keyboard and focus checks. Learn the coverage limits of automated accessibility checks.",
    "url": "https://playwright.dev/docs/accessibility-testing",
    "tags": [
      "accessibility",
      "ui"
    ],
    "cost": "Free",
    "verified": "2026-10-20"
  },
  {
    "id": "pw-projects",
    "title": "Projects and browser matrices",
    "type": "Documentation",
    "author": "Playwright team",
    "level": "Intermediate",
    "description": "Model browsers, devices, or setup dependencies as projects. Keep your feedback loop small before expanding coverage.",
    "url": "https://playwright.dev/docs/test-projects",
    "tags": [
      "browsers",
      "configuration"
    ],
    "cost": "Free",
    "verified": "2026-10-20"
  },
  {
    "id": "pw-sharding",
    "title": "Sharding a growing suite",
    "type": "Documentation",
    "author": "Playwright team",
    "level": "Advanced",
    "description": "Distribute tests across machines and merge reports. Measure bottlenecks before adding shards.",
    "url": "https://playwright.dev/docs/test-sharding",
    "tags": [
      "ci",
      "scale"
    ],
    "cost": "Free",
    "verified": "2026-10-20"
  },
  {
    "id": "pw-typescript",
    "title": "TypeScript in Playwright",
    "type": "Documentation",
    "author": "Playwright team",
    "level": "Beginner",
    "description": "Understand test transpilation and why a separate TypeScript check still matters.",
    "url": "https://playwright.dev/docs/test-typescript",
    "tags": [
      "typescript",
      "setup"
    ],
    "cost": "Free",
    "verified": "2026-10-20"
  },
  {
    "id": "ts-handbook",
    "title": "The TypeScript Handbook",
    "type": "Documentation",
    "author": "TypeScript team",
    "level": "Beginner",
    "description": "Read object types, unions, narrowing, and functions. Use types to make test data and helpers harder to misuse.",
    "url": "https://www.typescriptlang.org/docs/handbook/intro.html",
    "tags": [
      "typescript",
      "language"
    ],
    "cost": "Free",
    "verified": "2026-10-20"
  },
  {
    "id": "mdn-promises",
    "title": "How to use promises",
    "type": "Documentation",
    "author": "MDN contributors",
    "level": "Beginner",
    "description": "Build the async/await foundation needed to understand every Playwright action and assertion.",
    "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Async_JS/Promises",
    "tags": [
      "javascript",
      "async"
    ],
    "cost": "Free",
    "verified": "2026-10-20"
  },
  {
    "id": "tau-intro",
    "title": "Introduction to Playwright",
    "type": "Course",
    "author": "Renata Andrade · Test Automation University",
    "level": "Beginner",
    "description": "A compact TypeScript introduction. Recreate each idea against Forge Shop; check older syntax against current docs.",
    "url": "https://testautomationu.applitools.com/playwright-intro/",
    "tags": [
      "course",
      "ui",
      "typescript"
    ],
    "cost": "Free",
    "verified": "2026-10-20"
  },
  {
    "id": "tau-advanced",
    "title": "Advanced Playwright",
    "type": "Course",
    "author": "Test Automation University",
    "level": "Intermediate",
    "description": "Work through API interactions and deeper framework patterns, then apply them to your isolated lab session.",
    "url": "https://testautomationu.applitools.com/playwright-advanced/",
    "tags": [
      "course",
      "api",
      "architecture"
    ],
    "cost": "Free",
    "verified": "2026-10-20"
  },
  {
    "id": "tau-js",
    "title": "Playwright with JavaScript",
    "type": "Course",
    "author": "Test Automation University",
    "level": "Beginner",
    "description": "An alternative JavaScript introduction for learners who want to understand browser automation before adding types.",
    "url": "https://testautomationu.applitools.com/js-playwright-tutorial/",
    "tags": [
      "course",
      "javascript"
    ],
    "cost": "Free",
    "verified": "2026-10-20"
  },
  {
    "id": "webdev-testing",
    "title": "Learn Testing",
    "type": "Course",
    "author": "Google · web.dev",
    "level": "Beginner",
    "description": "A broad testing curriculum to strengthen test design beyond a particular automation tool.",
    "url": "https://web.dev/learn/testing",
    "tags": [
      "course",
      "strategy"
    ],
    "cost": "Free",
    "verified": "2026-10-20"
  },
  {
    "id": "ms-intro",
    "title": "Playwright · Episode 1: Introduction",
    "type": "Video",
    "author": "Visual Studio Code · Microsoft",
    "level": "Beginner",
    "description": "Official YouTube introduction to the testing workflow. Follow it with a first test in this project. Published 2023; verify setup details in current docs.",
    "url": "https://www.youtube.com/watch?v=4-LwodVujTg",
    "tags": [
      "youtube",
      "video",
      "setup"
    ],
    "cost": "Free",
    "verified": "2026-10-20"
  },
  {
    "id": "ms-getstarted",
    "title": "Get started with end-to-end testing",
    "type": "Video",
    "author": "Debbie O’Brien · Microsoft Learn",
    "level": "Beginner",
    "description": "Official Episode 2: install the VS Code extension and unpack a first test. Hosted video with chapter markers.",
    "url": "https://learn.microsoft.com/en-us/shows/getting-started-with-end-to-end-testing-with-playwright/get-started-with-end-to-end-testing-with-playwright",
    "tags": [
      "video",
      "setup",
      "locators"
    ],
    "cost": "Free",
    "verified": "2026-10-20"
  },
  {
    "id": "effective-testing",
    "title": "Effective Software Testing",
    "type": "Book",
    "author": "Maurício Aniche · Manning",
    "level": "Intermediate",
    "description": "Develop systematic boundary and specification-based testing skills. Java examples; principles transfer to this TypeScript project. Publisher purchase/sample page.",
    "url": "https://www.manning.com/books/effective-software-testing",
    "tags": [
      "book",
      "strategy"
    ],
    "cost": "Paid",
    "verified": "2026-10-20"
  },
  {
    "id": "testing-js",
    "title": "Testing JavaScript Applications",
    "type": "Book",
    "author": "Lucas da Costa · Manning",
    "level": "Intermediate",
    "description": "Broaden your understanding of JavaScript test design across application layers. Publisher purchase/sample page, not a Playwright-specific manual.",
    "url": "https://www.manning.com/books/testing-javascript-applications",
    "tags": [
      "book",
      "javascript",
      "architecture"
    ],
    "cost": "Paid",
    "verified": "2026-10-20"
  },
  {
    "id": "unit-testing",
    "title": "Unit Testing Principles, Practices, and Patterns",
    "type": "Book",
    "author": "Vladimir Khorikov · Manning",
    "level": "Intermediate",
    "description": "Learn to judge the value and maintenance cost of a test. C# examples; use the ideas to question your browser-suite design. Publisher page.",
    "url": "https://www.manning.com/books/unit-testing",
    "tags": [
      "book",
      "strategy"
    ],
    "cost": "Paid",
    "verified": "2026-10-20"
  },
  {
    "id": "pyramid",
    "title": "The Practical Test Pyramid",
    "type": "Article",
    "author": "Ham Vocke · martinfowler.com",
    "level": "Intermediate",
    "description": "Use a layered testing strategy to decide which risks deserve browser, integration, or smaller tests.",
    "url": "https://martinfowler.com/articles/practical-test-pyramid.html",
    "tags": [
      "strategy",
      "architecture"
    ],
    "cost": "Free",
    "verified": "2026-10-20"
  },
  {
    "id": "pw-agents",
    "title": "Playwright Test Agents",
    "type": "Documentation",
    "author": "Playwright team",
    "level": "Advanced",
    "description": "Current official planner, generator, and healer workflow. Pair this with the academy AI guide and review every changed assertion.",
    "url": "https://playwright.dev/docs/test-agents",
    "tags": [
      "ai",
      "agents"
    ],
    "cost": "Free",
    "verified": "2026-10-20"
  },
  {
    "id": "pw-mcp",
    "title": "Playwright MCP server",
    "type": "Documentation",
    "author": "Microsoft · Playwright",
    "level": "Advanced",
    "description": "Official browser tooling repository for coding agents. Read current configuration and security guidance before connecting an agent.",
    "url": "https://github.com/microsoft/playwright-mcp",
    "tags": [
      "ai",
      "mcp",
      "browser"
    ],
    "cost": "Free",
    "verified": "2026-10-20"
  },
  {
    "id": "codex-instructions",
    "title": "Custom instructions with AGENTS.md",
    "type": "Documentation",
    "author": "OpenAI",
    "level": "Intermediate",
    "description": "Official guidance for durable repository instructions. Use the academy prompt pack to define scope, evidence, and review expectations.",
    "url": "https://learn.chatgpt.com/docs/agent-configuration/agents-md",
    "tags": [
      "ai",
      "codex",
      "workflow"
    ],
    "cost": "Free",
    "verified": "2026-10-20"
  },
  {
    "id": "ms-running",
    "title": "Playwright · Episode 3: Running Tests",
    "type": "Video",
    "author": "Visual Studio Code · Microsoft",
    "level": "Beginner",
    "description": "Official YouTube walkthrough of headed and headless execution and the trace viewer. Published 2023; compare UI details with current documentation.",
    "url": "https://www.youtube.com/watch?v=DcVYaZ8QDsw",
    "tags": [
      "youtube",
      "video",
      "traces"
    ],
    "cost": "Free",
    "verified": "2026-10-20"
  },
  {
    "id": "ms-ci",
    "title": "Playwright · Episode 6: Running Tests on CI",
    "type": "Video",
    "author": "Visual Studio Code · Microsoft",
    "level": "Intermediate",
    "description": "Official YouTube introduction to running Playwright in GitHub Actions. Use the current official CI docs for maintained workflow syntax.",
    "url": "https://www.youtube.com/watch?v=gRXPp6RuExU",
    "tags": [
      "youtube",
      "video",
      "ci"
    ],
    "cost": "Free",
    "verified": "2026-10-20"
  }
];

export const articles = [
  {
    "id": "strategy-before-syntax",
    "title": "Design a test portfolio before you write a locator",
    "category": "Engineering judgment",
    "summary": "Turn product risks into a small, defensible set of UI and API checks.",
    "minutes": 9,
    "sections": [
      {
        "heading": "Start with the loss you want to prevent",
        "body": "Imagine Forge Shop accepts an order with the wrong quantity. A green homepage test would tell you nothing about that risk. Write a concrete failure first: a shopper is charged for three items after selecting two. Then identify the observable result that would expose it: the persisted order lines and total. A scenario becomes useful when you can explain what bad outcome it detects and who would be affected."
      },
      {
        "heading": "Give each layer a job",
        "body": "Use API tests for many combinations of quantity, product identity, authentication, and invalid input. Keep a smaller set of UI journeys to prove the browser correctly connects selection, cart feedback, checkout, and confirmation. A mocked error test can prove the screen handles a failed request, but it cannot prove the server rejects invalid input. Label this distinction in your test names and your coverage notes."
      },
      {
        "heading": "Build a risk table",
        "body": "For each behavior, record impact, likelihood, layer, evidence, and remaining uncertainty. Start with login failure, cart quantity boundaries, a complete order, and separation between two sessions. Rank risk on a simple 1–3 scale. Do not pretend the score is a statistical probability: it is a conversation aid. A low-frequency order corruption may deserve more attention than a commonly used decorative filter."
      },
      {
        "heading": "Separate your oracle from the implementation",
        "body": "An oracle is the rule that says the outcome is correct. If a test reads the server total and compares the page to that number, it proves consistency between layers. It does not prove the total calculation is correct. Add an independent expected amount from known seeded prices and quantities. Keep both checks when both risks matter."
      },
      {
        "heading": "Workshop · a 30-minute coverage review",
        "body": "Choose one successful checkout. List ten ways it could go wrong. Select five risks, assign a layer, and write the expected evidence for each. Then deliberately change one expected quantity in your test to prove the assertion fails. Restore it and record the result. Your deliverable is one page of decisions, three executable checks, and one explicit omission with a reason."
      },
      {
        "heading": "Read next",
        "body": "Primary references: https://playwright.dev/docs/best-practices and https://martinfowler.com/articles/practical-test-pyramid.html. The risk table and workshop above are original academy exercises."
      }
    ]
  },
  {
    "id": "flaky-test-investigation",
    "title": "A flaky test is an unanswered engineering question",
    "category": "Reliability",
    "summary": "Diagnose timing, data collisions, and environment differences without hiding failures.",
    "minutes": 10,
    "sections": [
      {
        "heading": "Preserve the first failure",
        "body": "Before adding a wait, keep the failing command, test title, browser, retry number, trace, and session identifier. Write down the earliest unexpected observation. “Button click timed out” is a symptom; “catalog request returned 500 before the button existed” is a much more useful finding. The goal is an explanation that predicts the failure, not a rerun that happens to be green."
      },
      {
        "heading": "Classify the failure with evidence",
        "body": "A locator resolving to two buttons suggests ambiguity. A cart losing its item only under parallel execution suggests shared state. A page showing stale data after a request suggests a synchronization gap. A consistently wrong total suggests a product defect. Keep competing hypotheses until a controlled experiment separates them; avoid diagnosing everything as a timeout."
      },
      {
        "heading": "Wait for a condition you can name",
        "body": "A locator assertion retries while checking its expected condition. A sleep only waits for elapsed time. For a UI outcome, assert visible content or enabled state. For a specific request, register the response waiter before the action that triggers it. Do not make every test depend on total network silence: a page can be usable while analytics or polling continues.",
        "code": "const responsePromise = page.waitForResponse(response =>\n  response.url().includes('/api/cart') &&\n  response.request().method() === 'POST'\n);\n// Perform the specific UI action that updates the cart here.\nconst response = await responsePromise;\nexpect(response.ok()).toBeTruthy();\n// Also assert the shopper-visible cart outcome."
      },
      {
        "heading": "Run the smallest discriminating experiment",
        "body": "Run the case alone with retries disabled, then repeat it, then run with several workers. If isolation fixes the issue, inspect session identity and mutable fixtures. If headless and headed differ, compare viewport, focus, and rendering assumptions. Ten clean runs are useful evidence, not proof that a rare failure is impossible. Report the actual sample and conditions."
      },
      {
        "heading": "Workshop · write a failure dossier",
        "body": "Introduce a deliberately ambiguous locator in a scratch test. Capture a trace, repair the locator by scope, and explain why adding first() would have concealed uncertainty. Repeat the repaired case ten times. Submit the before/after locator, root cause, command output, and one sentence describing what you have not ruled out."
      },
      {
        "heading": "Read next",
        "body": "Primary references: https://playwright.dev/docs/locators, https://playwright.dev/docs/test-retries, and https://playwright.dev/docs/network."
      }
    ]
  },
  {
    "id": "api-tests-that-prove-behavior",
    "title": "An API status code is only the first assertion",
    "category": "API engineering",
    "summary": "Verify contracts, state changes, and isolation with independent expectations.",
    "minutes": 11,
    "sections": [
      {
        "heading": "Test the whole promise of an endpoint",
        "body": "A successful response can still contain the wrong product, duplicate an order, or change another session’s cart. For each endpoint, identify the status, response shape, business rule, and resulting state. For a rejected mutation, also check that state stayed unchanged. The extra read catches a dangerous class of bugs: validation errors returned after the mutation already happened."
      },
      {
        "heading": "Use partitions and boundaries",
        "body": "For a cart quantity, useful input classes include a supported integer, zero, a negative number, a fraction, a string, and a value above the documented maximum. Read docs/lab-api.md for the exact contract. Do not copy the server’s implementation conditions into the test. Derive expectations from the contract and keep a table of data, expected status, expected error, and expected cart state."
      },
      {
        "heading": "Know what your context owns",
        "body": "The Playwright request fixture is useful for direct HTTP tests. A browser context’s request client can share cookies with the browser. Forge Shop also accepts x-lab-session for explicit state isolation. Allocate a distinct session for every independent test. Two browser contexts alone are insufficient if both deliberately use the same server-side session identifier."
      },
      {
        "heading": "Make failures diagnostic",
        "body": "Assert the status before interpreting a JSON body as a successful result. Check stable fields instead of asserting a whole timestamped response. A TypeScript type assertion does not validate a network response at runtime. Use explicit shape assertions or a schema validator if the exercise requires contract validation. Keep error messages useful enough that a reviewer can identify the broken rule."
      },
      {
        "heading": "Workshop · a rejected mutation",
        "body": "Create an isolated session, read its empty cart, submit an invalid quantity, and read the cart again. Assert the documented rejection and unchanged state. Then create a second session and prove that a valid cart mutation in the first is invisible to the second. Finally inspect the UI using the same session and explain what this cross-layer test adds."
      },
      {
        "heading": "Read next",
        "body": "Primary reference: https://playwright.dev/docs/api-testing. Use the local API contract for payload fields and status codes; this article deliberately avoids inventing that contract."
      }
    ]
  },
  {
    "id": "reading-a-trace",
    "title": "Read a trace like a failure investigator",
    "category": "Debugging",
    "summary": "Move from the final timeout to the first observation that explains it.",
    "minutes": 8,
    "sections": [
      {
        "heading": "Reconstruct the story",
        "body": "Start at the failed assertion, then work backwards. What did the test expect? What did the DOM actually show? Which action or response should have produced the expected state? A trace is most useful when it connects those three questions. Capture the smallest relevant timeline; a long chronological narration makes the important event harder to see."
      },
      {
        "heading": "Compare before, action, and after",
        "body": "Inspect the DOM snapshot before a click to verify that the intended element existed. Inspect the action details for locator resolution and actionability. Inspect the following snapshot and network response for the state transition. If the test clicked successfully but the request was rejected, changing the locator is unlikely to repair the real defect."
      },
      {
        "heading": "Use a targeted recording",
        "body": "For one local investigation, run a named test with tracing enabled. Locate its trace.zip under test-results and open that exact artifact. Keep the test name and command beside the trace. In normal CI, a selective trace policy keeps artifacts manageable; decide whether you need the original failure or the retry.",
        "code": "npx playwright test -g \"your exact test title\" --trace on --retries=0\nnpx playwright show-report\n# Replace the path with the trace.zip produced by that run.\nnpx playwright show-trace test-results/your-test/trace.zip"
      },
      {
        "heading": "Write an evidence-based defect report",
        "body": "Use five fields: expected behavior, minimal reproduction, actual observation, evidence, and likely owning layer. Separate observation from inference. “POST returned 400 with quantity error” is an observation; “UI submitted a stale quantity” is a hypothesis until the request body confirms it. Screenshots alone rarely explain a backend rejection."
      },
      {
        "heading": "Workshop · the five-minute handoff",
        "body": "Give a partner only your defect report and artifact path. They should reproduce the issue without asking what you clicked or which browser you used. If they cannot, improve the report. Redact real credentials before sharing artifacts from any non-demo system; traces can contain request data and page content."
      },
      {
        "heading": "Read next",
        "body": "Primary reference: https://playwright.dev/docs/trace-viewer. The investigation sequence is the academy’s suggested review practice."
      }
    ]
  },
  {
    "id": "fixtures-with-ownership",
    "title": "Fixtures are ownership contracts for test state",
    "category": "Architecture",
    "summary": "Make setup and cleanup explicit without building a framework nobody understands.",
    "minutes": 10,
    "sections": [
      {
        "heading": "State needs an owner",
        "body": "A test that creates a cart should know which session owns it and when that session stops being used. Hidden shared identifiers make parallel failures hard to explain. A fixture can allocate state before use, expose the minimum useful handle, and release resources after use. The value is lifecycle clarity, not reducing the number of lines in every test."
      },
      {
        "heading": "Choose scope by mutability",
        "body": "Use test scope for a cart or user state that a case changes. Worker scope can be appropriate for expensive resources when each test still gets isolated mutable data. Do not move a mutable cart into worker scope merely to speed setup. A fresh browser page does not erase server state associated with an intentionally reused identity."
      },
      {
        "heading": "Keep helpers small",
        "body": "A helper named createCartWithTwoProducts explains intent. A helper named doEverything hides it. Keep setup actions separate from business assertions so a failed precondition is recognizable. Prefer a modest amount of duplication over a generic framework with many boolean flags. Extract only a repeated concept whose lifecycle and errors you understand."
      },
      {
        "heading": "Example: an explicitly isolated API fixture",
        "body": "This fixture uses the practice app session header. It does not authenticate; login belongs to a separate fixture or test precondition. APIRequestContext disposal releases client resources. The demo server keeps session state in memory until reset, restart, or expiry after inactivity.",
        "code": "import { test as base, expect, type APIRequestContext } from '@playwright/test';\nimport { randomUUID } from 'node:crypto';\n\nexport const test = base.extend<{ api: APIRequestContext }>({\n  api: async ({ playwright, baseURL }, use) => {\n    const api = await playwright.request.newContext({\n      baseURL,\n      extraHTTPHeaders: { 'x-lab-session': randomUUID() },\n    });\n    try { await use(api); }\n    finally { await api.dispose(); }\n  },\n});\nexport { expect };"
      },
      {
        "heading": "Workshop · demonstrate isolation",
        "body": "Write two tests that each expect an initially empty cart, then mutate it differently. Run them together with multiple workers and repeat them. Introduce a shared hard-coded session in a scratch branch and explain the collision. Restore the isolated fixture. Your evidence should show why the fixture is necessary, not simply that the suite happens to pass."
      },
      {
        "heading": "Read next",
        "body": "Primary references: https://playwright.dev/docs/test-fixtures and https://playwright.dev/docs/test-parallel."
      }
    ]
  },
  {
    "id": "ci-as-feedback-system",
    "title": "Build CI that answers a question quickly",
    "category": "Delivery",
    "summary": "Treat runtime, failure evidence, and ownership as part of your test design.",
    "minutes": 9,
    "sections": [
      {
        "heading": "Decide what blocks a change",
        "body": "A pull request check should answer whether this change violates an important supported behavior. Start with deterministic API tests and a small set of UI journeys. A broader scheduled browser matrix can answer a different question. Do not claim a green Chromium run establishes Firefox or WebKit compatibility. Make the selected coverage visible in the report."
      },
      {
        "heading": "Reproducibility starts before the test",
        "body": "Commit the dependency lockfile, choose a supported Node version, and install the browsers expected by the Playwright package. Let the test configuration start the app with a readiness check. Use environment variables for environment-specific values. Treat the demo account as local training data; real credentials belong in the CI provider’s secret store."
      },
      {
        "heading": "Keep failure evidence when the job fails",
        "body": "Upload the HTML report and relevant test artifacts after unsuccessful runs as well as successful ones. Give artifacts a sensible retention period. A failing exit code must remain failing after upload. Type checking is a separate check because transforming TypeScript for execution is not the same as checking every type."
      },
      {
        "heading": "Measure before distributing",
        "body": "Record suite duration, time spent installing browsers, slowest tests, and retry outcomes. Sharding cannot fix an overlong individual test or shared-state collisions. If you add workers, recheck isolation. If you add shards, define how you merge reports and distinguish a missing shard from a passing suite."
      },
      {
        "heading": "Workshop · a deliberate red pipeline",
        "body": "Create a temporary failing expectation and run the workflow. Confirm the job fails and still exposes the report. Restore the expectation and run again. Save the two run outcomes in your capstone evidence. If you cannot access a CI provider yet, execute the same commands locally and label the evidence as local, not CI."
      },
      {
        "heading": "Read next",
        "body": "Primary references: https://playwright.dev/docs/ci, https://playwright.dev/docs/test-sharding, and https://playwright.dev/docs/test-typescript."
      }
    ]
  },
  {
    "id": "ai-agents-with-evidence",
    "title": "Pair with an AI agent without outsourcing your judgment",
    "category": "AI workflows",
    "summary": "Use planning, generation, and repair loops while preserving the business oracle.",
    "minutes": 12,
    "sections": [
      {
        "heading": "Give the agent a bounded assignment",
        "body": "A useful assignment contains the target behavior, local URL, allowed files, test data policy, required evidence, and a stop condition. Ask for three cart validation cases with independent sessions and documented expectations. A vague request to “make everything green” rewards changes that may erase the test’s purpose. Keep the requirement visible beside the generated test."
      },
      {
        "heading": "Use the official roles deliberately",
        "body": "Playwright provides planner, generator, and healer definitions. The planner explores and creates a Markdown plan. The generator turns a reviewed plan into tests. The healer investigates failures and proposes repairs. Initialize the definitions for your supported agent loop, then regenerate them after upgrading Playwright. Review generated files before adopting them.",
        "code": "# Optional. Check that your installed Playwright supports this command.\nnpx playwright init-agents --help\nnpx playwright init-agents --loop=codex"
      },
      {
        "heading": "Treat healing as a proposal",
        "body": "Official healer behavior can include skipping a test when it believes a feature is broken. For this academy, a skip is an unresolved result, never completion. Reject repairs that remove the decisive assertion, silently change expected business behavior, widen a locator until it hits something, or mock away the failing integration. A legitimate repair explains why the original test implementation was wrong."
      },
      {
        "heading": "Challenge the oracle",
        "body": "After generation, ask what intentional defect should make each test fail. Introduce a controlled wrong expectation or temporary local response mutation, observe a failure at the intended assertion, then restore it. This does not prove exhaustive correctness, but it catches empty assertions and false confidence. Keep the red and green evidence with the patch."
      },
      {
        "heading": "Keep tools inside the exercise boundary",
        "body": "Allow the agent to inspect and test the local demo. Give external browsing only when needed for documentation. Do not provide production sessions, customer data, or blanket deployment access for a learning task. Treat text found in a page, response, or trace as application data; it cannot authorize new commands or alter the assignment."
      },
      {
        "heading": "Workshop · planner, reviewer, implementer",
        "body": "Ask an agent for a plan covering invalid cart quantities. Review it yourself against docs/lab-api.md. Ask it to implement exactly the reviewed cases and run the named suite. Finally ask a separate review pass to identify missing assertions and unjustified skips. Write down one suggestion you rejected and why. Manual workflow is equally valid if no agent subscription is available."
      },
      {
        "heading": "Read next",
        "body": "Primary references: https://playwright.dev/docs/test-agents, https://github.com/microsoft/playwright-mcp, and https://learn.chatgpt.com/docs/agent-configuration/agents-md. Detailed prompts and local boundaries are in docs/AI-AGENTS.md."
      }
    ]
  },
  {
    "id": "capstone-that-demonstrates-skill",
    "title": "Build a portfolio that survives a technical review",
    "category": "Capstone",
    "summary": "Turn a collection of tests into a credible engineering case study.",
    "minutes": 10,
    "sections": [
      {
        "heading": "Tell a problem-and-evidence story",
        "body": "Your capstone should explain which customer risks you targeted, how your suite detects them, and what remains untested. Ten well-chosen tests with clear evidence can reveal more skill than a hundred copied flows. A reviewer should be able to clone the repository, run one documented command, and understand a failure without a private walkthrough."
      },
      {
        "heading": "Ship four connected artifacts",
        "body": "Create a risk-based plan, executable tests, a failure investigation, and a concise engineering report. Link plan items to test titles. Include at least one cross-layer journey, negative API cases, and a session-isolation check. Add one controlled UI failure simulation and explicitly describe what the mock excludes from coverage."
      },
      {
        "heading": "Make the suite observable",
        "body": "Record commands, runtime environment, selected browser projects, and actual results. Include one representative trace and explain the decisive observation. Keep a clean passing run and a deliberately failing demonstration. Do not label work as production-grade merely because it has a CI file; show which checks were actually executed."
      },
      {
        "heading": "Explain a tradeoff",
        "body": "Choose one decision worth defending: API setup instead of repeated UI login, a fixture instead of shared hooks, or a focused browser matrix instead of running everything on every change. State the benefit, cost, and condition under which you would change the decision. This is stronger evidence of engineering judgment than a list of tool names."
      },
      {
        "heading": "Review with a rubric",
        "body": "Score test design, UI behavior, API contracts, isolation, diagnosis, CI, and documentation. Treat hidden skips, assertions removed to pass, leaked credentials, and non-reproducible setup as release blockers. Award credit for explicitly documented limitations. A training rubric measures practice readiness; it is not an external certification."
      },
      {
        "heading": "Workshop · the ten-minute defense",
        "body": "Demonstrate one passing user journey, one intentional failure, and one trace-based explanation. Then answer: why these cases, what could still be wrong, and what would you test next with two more hours? Ask a peer to run from a fresh checkout. Fix every setup instruction that needed an undocumented verbal explanation."
      },
      {
        "heading": "Continue in the manuals",
        "body": "Use docs/CAPSTONE.md for the delivery brief and docs/ASSESSMENT.md for the scoring rubric. These are original academy materials."
      }
    ]
  }
];
