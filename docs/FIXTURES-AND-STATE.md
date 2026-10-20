# Fixtures and state: an engineering workbook

Use this workbook when a test passes alone but fails in a suite, authentication
appears in the wrong browser, cleanup is mysterious, or a fixture abstraction is
getting harder to explain than the scenario itself. The goal is to identify who
owns each resource, how long it lives, and which observations prove isolation.

This is an original practice companion to the official Playwright documentation.
It covers the fixture and state decisions used by this academy; it does not
attempt to teach every Playwright feature. Read a focused documentation section,
predict an outcome, run a local experiment, then explain the evidence.

## Start with the correct kind of documentation

A guide teaches a workflow and its tradeoffs. An API reference defines the
method, arguments, result, and version-specific behavior. Use both: read the
[fixture guide](https://playwright.dev/docs/test-fixtures) to understand ownership,
then consult the [fixture reference](https://playwright.dev/docs/api/class-fixtures)
when deciding which object your test actually receives.

The academy currently pins `@playwright/test` to **1.64.1**. Public documentation
can move ahead of your checkout. Check the installed version before adopting a
method or option from a newer example:

```bash
npm ci
npx playwright --version
npm ls @playwright/test playwright playwright-core
npm run typecheck
```

The `Added in` labels in the API reference and your installed TypeScript types
are useful cross-checks. Type checking verifies names and shapes; it cannot prove
that your chosen fixture scope or isolation strategy fits the product. These
exercises target the local academy server, not public documentation websites.

## Eight-lesson reading route

Work through these lessons in order. Start the context section after 03-03; use
04-04 when API authentication is unfamiliar. Before 05-06, complete the fixture
introduction (05-01) and parallel-state lesson (05-04). The portal's **Next in this
track** link follows this focused order; the separate **Next lesson** link follows
the full academy sequence.

| Order | Academy lesson | Read in the official docs | Produce before moving on |
| --- | --- | --- | --- |
| 1 | 03-08 · Browser, context, and page ownership | [Isolation guide](https://playwright.dev/docs/browser-contexts), [Browser.newContext](https://playwright.dev/docs/api/class-browser#browser-new-context) | An ownership diagram for two tabs and two customers |
| 2 | 03-09 · Know which storage owns your state | [BrowserContext.storageState](https://playwright.dev/docs/api/class-browsercontext#browser-context-storage-state), [authentication guide](https://playwright.dev/docs/auth) | A storage matrix predicting what survives reload, a new tab and a new context |
| 3 | 03-10 · Restore state without losing the boundary | [Session storage guidance](https://playwright.dev/docs/auth#session-storage), [addInitScript](https://playwright.dev/docs/api/class-browsercontext#browser-context-add-init-script) | A restore experiment with an anonymous negative control |
| 4 | 05-06 · Read a fixture dependency graph | [Fixture execution order](https://playwright.dev/docs/test-fixtures#execution-order), [test.extend](https://playwright.dev/docs/api/class-test#test-extend) | A setup/teardown ledger that matches observed events |
| 5 | 05-07 · Worker scope, retries, and unique ownership | [Parallelism](https://playwright.dev/docs/test-parallel), [WorkerInfo](https://playwright.dev/docs/api/class-workerinfo), [retries](https://playwright.dev/docs/test-retries) | A resource-name policy that handles restarts and concurrent runs |
| 6 | 05-08 · Options, overrides, and automatic evidence | [Fixture options](https://playwright.dev/docs/test-fixtures#fixtures-options), [configuration inheritance](https://playwright.dev/docs/test-use-options#explicit-context-creation-and-option-inheritance), [TestInfo](https://playwright.dev/docs/api/class-testinfo) | A typed option and a small, safe diagnostic attachment |
| 7 | 05-09 · Authentication setup that fits the workload | [Authentication strategies](https://playwright.dev/docs/auth), [project dependencies](https://playwright.dev/docs/test-global-setup-teardown#option-1-project-dependencies) | A justified shared, worker or test authentication decision |
| 8 | 05-10 · A docs-guided fixture and state investigation | [APIRequestContext](https://playwright.dev/docs/api/class-apirequestcontext), [TestOptions](https://playwright.dev/docs/api/class-testoptions) | A reproducible diagnosis with source links and explicit limits |

Reading a whole documentation page is optional. Answer the lesson's question,
locate the relevant API contract, and return to the local bench. Reading becomes
useful when it changes a prediction or improves a test.

## Run the fixtures and state bench

```bash
npm run dev
# Open http://127.0.0.1:4173/state/
```

The bench exposes three deliberately different kinds of browser storage:

| Control | Stored value | Observable output |
| --- | --- | --- |
| Theme and Save shared preference | `localStorage['forge-state-theme']` | `theme-value` |
| Draft note and Save tab draft | `sessionStorage['forge-state-draft']` | `draft-value` |
| Notebook note and Save notebook note | IndexedDB database `forge-state-db`, store `notes`, key `lesson` | `notebook-value` |

The `identity` output shows `Guest session` or `Signed in as Alex Tester`. It
does not print the session identifier. `bench-ready` tells a test that the initial
asynchronous storage read has completed. Use these observable states instead of
sleeping or racing an IndexedDB transaction.

Start with passing examples, then attempt one starter at a time:

```bash
npm run test:state
npm run test:state:practice -- --list

# Implement FS-04 in state/practice.spec.ts, remove its .skip and sentinel.
npm run test:state:practice -- --grep FS-04
```

Starters are in `state/practice.spec.ts`; examples are in `state/worked.spec.ts`.
The worked implementation is in `state/support/fixtures.ts` and
`state/support/helpers.ts`. Fixture declarations belong at module scope, outside
test callbacks: declare an extended `test`, then register a test with it. The
learner module `state/support/practice-fixtures.ts` supplies typed scaffolds:
`lifecyclePractice`, `scopedPractice`, `optionPractice`, and `authenticatedPractice`.
The starter already registers the matching extended tests; never
import the worked fixture merely to make an unfinished assignment pass. A skipped starter is an unfinished assignment, not a
passing test. Keep the expected failure sentinel until you have replaced it
with assertions that prove every criterion.

For another port on macOS/Linux, use `PORT=14827 npm run dev` and
`PORT=14827 npm run test:state`. In PowerShell, set `$env:PORT=14827` before each
command in its terminal. Use one hostname consistently: `localhost` and
`127.0.0.1` are different origins.

### Choose an order that matches the skill

For contexts and storage, attempt **FS-04 → FS-05 → FS-06 → FS-07 → FS-08 → FS-09**.
Then build fixtures with **FS-01 → FS-02 → FS-03 → FS-10**. The identifiers group
concepts; their numeric order is not a prerequisite chain. The ordinary worked
command still runs all ten drills.

A fixture assignment has two parts: implement its provider at file scope, then
write the consuming assertions in `practice.spec.ts`. A fixture is requested by
its parameter name; importing it or describing it in a comment does not execute
it. Keep the starter's throwing TODO or failing sentinel until that part is
implemented. Removing a skip without doing the work must produce a failure.

## The ten executable investigations

| Drill | Assignment | Evidence you must explain |
| --- | --- | --- |
| FS-01 | Dependency setup and reverse teardown | The complete event sequence follows dependency edges on success, a real setup failure, and a real consumer failure |
| FS-02 | Worker identity, fresh test resources | Worker ownership can be reused while each case receives its own test resource; the two cases remain independently runnable |
| FS-03 | Typed options, automatic evidence, lazy fixtures | The override changes the locale, a separate control retains its own locale, the complete teardown order holds, and an unused fixture is not created |
| FS-04 | Two tabs, one context | Preferences cross tabs; drafts survive reload, stay absent from a page without an opener, and are copied once rather than synchronized into a popup |
| FS-05 | Independent context boundaries | A second context with explicitly empty state and headers starts clean even though the first has local state |
| FS-06 | storageState and IndexedDB opt-in | Restored default state and explicit IndexedDB state have the expected differences; session storage is not silently transferred |
| FS-07 | Restore sessionStorage before application code | First-render UI observes the restored draft, an edit survives reload, and a clean control remains empty |
| FS-08 | Context request sharing and standalone isolation | Browser-associated API calls share cookies, while a standalone request context has its own jar |
| FS-09 | Copied authentication is a shared server session | Logout invalidates the copied session; an independently authenticated, populated control stays intact |
| FS-10 | Own an authenticated context per test | An outer observer proves context closure, anonymous server state, and empty owned cart after success and real consumer failure; an unrelated cart remains intact |

For each drill, write a prediction before running it. Afterward record the exact
command, observation, owner of the changed state, negative control, cleanup,
and one thing the experiment does not prove.

FS-01 has three worked cases; FS-02 has two; FS-10 has two. The other seven
drills have one each, for **14 worked cases and 10 skipped starters**. Failure
cases run isolated child tests from `state/support/failure-probe.spec.ts`.
Their parent requires exit 1, exactly the intended error, no additional runner
or teardown error, and the correct after-teardown evidence. A broken cleanup
therefore fails the parent. This is a test of failure handling; an arbitrary
red test is never accepted as proof. Child artifacts live under the parent's
test output path. The main runner does not discover the probe file directly.

## Ownership: choose the object before writing the action

The core runner fixtures below have different lifetimes. The `browser` fixture
may serve many tests in one worker; that does not mean those tests share their
browser context. A fresh default context and page belong to each test. The
built-in `request` fixture is an isolated API client for a test. Read the
[fixture API contracts](https://playwright.dev/docs/api/class-fixtures) when a
similarly named object tempts you to assume shared state.

| Object or fixture | Who owns it? | Typical lifetime | What the learner must not assume |
| --- | --- | --- | --- |
| Built-in `browser` | Runner's worker | Worker process | One browser for the entire test run |
| Built-in `context` | Runner's test fixtures | Individual test | A fresh server database or account |
| Built-in `page` | The test's context | Individual test | A second page means a second customer |
| Built-in `request` | Runner's test fixtures | Individual test | Its cookie jar is the page's cookie jar |
| `context.request` / `page.request` | Associated browser context | That context's lifetime | Disposing this client is the same as a standalone API fixture cleanup |
| Your `browser.newContext()` | Your test or custom fixture | Until you close it | The runner supplies the lifecycle contract you forgot to write |
| Your `playwright.request.newContext()` | Your test or custom fixture | Until you dispose it | It shares a browser's cookies just because both use the same URL |
| Your worker fixture | Your fixture definition | A compatible worker process | It runs once globally or survives worker replacement |

Close the manually created context rather than each of its pages individually
when ownership belongs to the context. Let the runner manage its own built-in
browser and context. Document separately which code resets or deletes server
records.

Two different tabs can represent the same customer. Two contexts can still
represent the same server session if both received the same copied credential.
The [isolation guide](https://playwright.dev/docs/browser-contexts) supplies the
browser boundary; your product's identity and persistence model supplies the
server boundary. Both must appear in your test design.

## Draw the dependency graph, then reverse it

Treat a fixture as a resource contract: dependencies, preparation, provided
value, and disposal. Destructured fixture names declare dependencies. File order
is not a reliable substitute for those edges. An unused ordinary fixture stays
lazy; an automatic fixture can still execute without appearing in the test's
arguments. The [execution-order rules](https://playwright.dev/docs/test-fixtures#execution-order)
explain the ordering.

Here is an original ownership sketch for a hypothetical authenticated bench
fixture. The arrows mean “requires,” not “runs immediately afterward.”

```text
worker scope
  browser
  workerOwner
        |
        v
individual test
  ownedContext ----requires----> browser + workerOwner
        |
        v
  signedInPage ----requires----> ownedContext
        |
        v
  test body and hooks using signedInPage

creation:  dependencies -> ownedContext -> signedInPage -> consumer
cleanup:   consumer ends -> signedInPage -> ownedContext -> worker ends later
```

A test-scoped resource can depend on a worker-scoped resource. A worker-scoped
fixture cannot depend on the default test-scoped page: the proposed dependency
would need a different shorter-lived page for every consumer of one long-lived
resource. Change the design rather than suppressing the scope error.

This small original fixture demonstrates explicit context ownership. It is a
design example, not an extra installed lab test:

```ts
import { test as base, type BrowserContext } from '@playwright/test';

type Owned = { ownedContext: BrowserContext };
export const test = base.extend<Owned>({
  ownedContext: async ({ browser, baseURL }, use) => {
    const owned = await browser.newContext({
      baseURL,
      extraHTTPHeaders: {},
      storageState: { cookies: [], origins: [] },
    });
    try {
      await use(owned);
    } finally {
      await owned.close();
    }
  },
});
```

The provider pauses at `await use(owned)` while dependents run. On cleanup it
continues to its closing step. If preparation allocates two resources and the
second allocation fails, place the cleanup boundary around the first allocation
as soon as it exists. Do not wait until all preparation has succeeded before
making it eligible for cleanup.

Fixtures organize normal runner cleanup; a killed machine cannot execute your
`finally` block. For real external data, add expiration or a cleanup job keyed
to a run owner. That operational policy complements fixture teardown.

FS-01 decision exercise: sketch an outer lease, an inner API client, and a
consumer. Predict the event ledger for success, failure in the consumer, and
failure while creating the API client. Mark exactly which resources existed in
each case. Compare your diagram to the actual local fixture before adding more
hooks.

## Scope, worker replacement and useful unique names

Worker scope means process scope within the runner's scheduling model. A failure
can lead the runner to discard a worker and create a replacement. Setup in
`beforeAll` and worker fixtures may therefore execute again. Retries repeat an
attempt; they do not undo mutations the previous attempt made on your server.
Use the [retry workflow](https://playwright.dev/docs/test-retries) to interpret
this behavior, then inspect your own resource ledger.

`parallelIndex` identifies a slot from zero to the configured worker count minus
one. A replacement worker keeps that slot but receives a new `workerIndex`.
Neither index is a globally unique identity across separate CI jobs, shards or
runs. The [WorkerInfo reference](https://playwright.dev/docs/api/class-workerinfo)
and [parallelism guide](https://playwright.dev/docs/test-parallel#worker-index-and-parallel-index)
are the source of those distinctions.

| Requirement | Candidate ownership key | Question to answer |
| --- | --- | --- |
| Lease a stable account slot inside one run | Run ID + shard + project + `parallelIndex` | How will a replacement recover or release an existing lease? |
| Distinguish process attempts | Run ID + shard + project + `workerIndex` | Who removes the failed worker's leftover data? |
| Give every test an independent server record | Run prefix + UUID | Can the test find only records it owns? |
| Name per-attempt diagnostic files | `testInfo.outputPath(...)` | Could the file contain credentials or user data? |

A suitable run prefix may include a CI run ID and attempt number. Add the shard
number when several jobs target the same system. Include a project or account
role when those share a backend. Use a UUID for local, otherwise uncoordinated
runs. The choice between stable reuse and unique replacement is a product/data
strategy, not a preference for a shorter string.

FS-02 experiment:

```bash
npm run test:state -- --grep FS-02 --workers=1
npm run test:state -- --grep FS-02 --workers=2 --repeat-each=3
```

Do not make the second case depend on the first having run. The worked group
uses default mode so compatible cases reuse one worker; its `beforeAll`
captures that worker's identity and each case checks it. A replacement worker
runs `beforeAll` again. The fixture also records `workerIndex`, `parallelIndex`,
`retry`, `repeatEachIndex`, issued resources, and observed item counts.
Compare those attachments across repeats and attempts. Worker IDs need not
match across repeats, replacements, or independently parallel groups. The
properties are reuse within a live worker and a fresh resource for every case.

A retry probe is a separate controlled investigation: introduce a temporary
failure in one local assertion, run with `--retries=1`, inspect both attempts'
metadata, then restore the assertion and rerun without retries. Do not keep a
retry-only pass as proof that the underlying test is reliable.

## Typed options, inheritance and automatic evidence

An option is a declarative input; a fixture uses inputs to create behavior.
Declare a type, a default and `{ option: true }`. Set an override at the smallest
appropriate configuration scope. This pattern lets a reader see why the same
bench is exercising different defaults instead of finding hidden environment
reads throughout helpers.

```ts
import { test as base, expect } from '@playwright/test';

type Options = { startingTheme: 'system' | 'light' | 'dark' };
const test = base.extend<Options>({
  startingTheme: ['system', { option: true }],
});

test.describe('dark-theme decision', () => {
  test.use({ startingTheme: 'dark' });
  test('the chosen scenario is explicit', async ({ startingTheme }) => {
    expect(startingTheme).toBe('dark');
  });
});
```

This example demonstrates the option itself; the FS-03 fixture supplies the
richer executable evidence. `test.use` belongs at declaration time in a file or
describe block, not inside a running test. An override affects its scope and
nested suites. See [test.use](https://playwright.dev/docs/api/class-test#test-use).

Two easily missed details deserve an experiment. Setting an option to
`undefined` can restore its configuration value; it does not always mean
“erase the option.” Array-valued options require the fixture tuple form so the
runner can distinguish the array from fixture registration. Check the
[option examples](https://playwright.dev/docs/test-fixtures#fixtures-options)
before designing either case.

In this installed version, explicit contexts created through the runner's
Playwright instance during a test or hook inherit applicable `use` context
options. Passing explicit options takes precedence. Consequently,
`browser.newContext()` is not a guaranteed anonymous control when the project
has authenticated `storageState`. Use explicit empty storage and cleared custom
headers when the experiment requires that condition. The
[configuration inheritance guide](https://playwright.dev/docs/test-use-options#explicit-context-creation-and-option-inheritance)
is more reliable than older advice that manual contexts ignore all runner
configuration.

An automatic diagnostic fixture should collect a small explanation of the
attempt, not the entire browser profile. Useful fields include the test title,
project name, `retry`, `workerIndex`, `parallelIndex`, setup milestones and the
final status. Attach JSON with `testInfo.attach`; use `testInfo.outputPath` for
per-attempt files. The [TestInfo reference](https://playwright.dev/docs/api/class-testinfo)
defines both APIs. Avoid recording cookies, authorization headers, raw storage
snapshots or request bodies by default.

FS-03 decision exercise: a slow fixture is declared but never requested; a small
automatic evidence fixture is registered. Predict which executes. Then add a
dependent fixture that requests the slow one and explain why the answer changes.
A larger timeout is not the first fix for an unnecessarily eager setup graph.

## State matrix: storage is not one bucket

Use this matrix to predict the FS-04 through FS-07 experiments. “New tab” here
means an independently created page in the same context at the same origin.

| State | Where it belongs | Same-context new tab | `storageState()` transfer | What closing a browser context does not prove |
| --- | --- | --- | --- | --- |
| Cookies | Context cookie jar, with domain/path/security rules | Matching requests can use them | Included | That the matching server session was invalidated |
| localStorage | Origin within a context | Same-origin tabs can read it | Included for captured origins | That a backend preference was deleted |
| sessionStorage | Origin plus top-level page session | Independent page has its own store | Not included | That the user's server draft was deleted |
| IndexedDB | Origin within a context | Same-origin tabs can access the database | Include explicitly with `{ indexedDB: true }` | That server records represented locally were deleted |
| DOM and JavaScript variables | Current document/application instance | Separate document memory | Not included | That a credential's server authority expired |
| Orders, accounts, server carts | Application server or database | Whatever identity/authorization permits | Never cloned by browser storage state | Any server cleanup at all |

The distinction between origin storage and a tab session comes from the browser
platform. Reload usually preserves the tab's sessionStorage. A popup with an
opener can receive an initial copy, so do not generalize FS-04's independently
created page to every popup. See [sessionStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage)
and [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
for these browser rules.

An origin includes scheme, host and port. A localStorage record for
`http://127.0.0.1:4173` does not seed `http://localhost:4173` or a different port.
Cookies use their own domain/path rules and are not isolated by port. When
running two local servers, do not assume a port change creates a separate cookie
identity.

The workbook focuses on cookies, localStorage, sessionStorage and IndexedDB.
Newer Playwright versions also expose optional snapshot support for other state,
including virtual authentication credentials and origin-private files. That is
outside these ten drills; consult the current API rather than assuming this
matrix lists every possible storage mechanism.

## Reset is not one operation

Before choosing a reset, name the state you intend to remove and the state your
test must preserve. A reset that is too broad can erase the very persistence bug
you are trying to detect.

| Action | What changes | What it does not prove or remove |
| --- | --- | --- |
| `page.reload()` | The document and application code run again | Cookies, localStorage, IndexedDB and this tab's sessionStorage normally remain; an init script also runs again |
| `context.clearCookies()` | Cookies in that context are removed | localStorage, sessionStorage, IndexedDB and server records are not cleared; a subsequent request may create a new session |
| `localStorage.removeItem('forge-state-theme')` | This workbench's one preference at the current origin | Other keys, other stores and server state remain; an already rendered value may be stale until a new read/reload |
| `sessionStorage.removeItem('forge-state-draft')` | The draft in this tab and origin is removed | Another tab's draft is unaffected; a retained initialization script might recreate the key on navigation |
| POST `/api/reset` in the owning session | This synthetic shop's server cart, orders and login are reset | Browser preferences, tab drafts and IndexedDB are not cleared; it is not a global database reset |
| New context with explicit empty `storageState` and cleared identity headers | Independent client storage and an independently established shop session | Shared account-level data in another product is not automatically isolated |
| Close an owned context | Its pages and client resources are released | A copied login cookie in another context is not revoked; server-side logout/reset is a separate operation |

For a small experiment, save all three notes, call `/api/reset` through the same
context's request client, then reload the bench. Expect **Guest session** and the
three saved note values. Next remove only the workbench's theme key and reload;
expect **system** while the draft and notebook remain. This is a written transfer
exercise, not another FS starter. Avoid clearing all localStorage on the academy
origin: your portal progress also lives there.

## Snapshot, restore, and prove the boundary

A snapshot copies selected client state at a moment in time. Omitting `path`
keeps the returned object in memory. IndexedDB capture requires the explicit
option used by FS-06:

```ts
const browserState = await context.storageState({ indexedDB: true });
const restored = await browser.newContext({
  baseURL,
  storageState: browserState,
  extraHTTPHeaders: {},
});
try {
  const restoredPage = await restored.newPage();
  await restoredPage.goto('/state/');
  // Assert the intended restored value and an independently fresh negative control.
} finally {
  await restored.close();
}
```

Read the exact [storageState contract](https://playwright.dev/docs/api/class-browsercontext#browser-context-storage-state)
before deciding what the snapshot proves. In 1.64.1, `setStorageState` can also
replace supported state in an existing context. It is a mutation, not an
additional isolation boundary. For these exercises, creating a new context
makes ownership easier to inspect; replacing storage does not reset existing
application memory or clone server records.

Session storage needs a separate, deliberate restoration mechanism. Capture
only the harmless draft the scenario needs. Install one exact-origin-guarded
initialization script before the new page navigates:

```ts
const expectedOrigin = new URL(baseURL!).origin;
const draft = 'Boundary note for this test';
await restored.addInitScript(({ origin, value }) => {
  if (location.origin === origin && sessionStorage.getItem('forge-state-draft') === null) {
    sessionStorage.setItem('forge-state-draft', value);
  }
}, { origin: expectedOrigin, value: draft });
const restoredPage = await restored.newPage();
await restoredPage.goto('/state/');
await expect(restoredPage.getByTestId('draft-value')).toHaveText(draft);
```

This is a setup fragment: `restored` is the owned fresh context from your fixture
or test. Restricting to an exact origin includes the port; matching only a
hostname would seed every matching port. Keep related initialization in one
script if its statements depend on order. The
[addInitScript reference](https://playwright.dev/docs/api/class-browsercontext#browser-context-add-init-script)
describes when it runs; do not replace it with an evaluate call after the app
has already read its startup state. The missing-key guard matters because an
initialization script runs on later navigations too. Edit the draft through the
UI and reload: the edit must survive, rather than being overwritten by the
original seed. For this experiment, deliberately clearing the key allows a
later navigation to seed it again. That is a restoration policy you must name,
not a production logout implementation.

FS-06/07 decision exercise: restore the same snapshot twice. Change one
restored context's local preference and predict whether the other changes. Then
log out a copied cookie session on the server and predict whether the other
copy remains authorized. Explain why “copied” has different implications for
local data and a server-side identity reference.

## API clients: shared cookies are a specific relationship

`context.request` and `page.request` operate with the associated browser
context's cookie jar. The built-in standalone `request` fixture and a separately
created API request context have their own jars. A common URL does not join
those jars. The [APIRequestContext reference](https://playwright.dev/docs/api/class-apirequestcontext)
is the authority for this relationship.

The Forge Shop makes the distinction especially visible:

```text
request carries x-lab-session? -> server chooses that training session
otherwise lab_session cookie? -> server chooses that cookie's session
otherwise                    -> server starts a new training session
```

The ordinary shop fixture in `tests/support/fixtures.ts` intentionally gives
browser and API the same unique `x-lab-session`. That makes hybrid shop setup
convenient, but it would conceal a cookie-sharing experiment. The FS cookie
investigations use their dedicated state fixtures and explicit cookie-based
boundaries. Do not swap in the shop fixture and then claim you proved browser
cookie transfer.

FS-08 investigates the API/browser relationship. FS-09 adds the server fact:
a copied `lab_session` value still refers to the same in-memory server session.
Logout changes that record; it does not need to find and erase every copied
browser cookie. Server restart also loses this lab's in-memory sessions. A
snapshot is not a database backup, an independent user, or an eternal login.

An API-only login can supply cookie authentication efficiently. It does not run
page JavaScript to initialize your application's localStorage or IndexedDB.
Determine where the actual login result is stored before choosing an API-only
setup. Verify identity through the application, not merely by checking that a
snapshot contains some cookie.

## Pick authentication setup by what tests mutate

The [official authentication guide](https://playwright.dev/docs/auth) presents
shared-account, per-worker and multiple-role approaches. Use it as a decision
map. The academy's FS-10 chooses per-test ownership for a small local workload;
it is not a claim that this is always the fastest production design.

| Strategy | A reasonable workload | Main failure mode to investigate |
| --- | --- | --- |
| One setup project, read-only shared account | Independent read checks that do not mutate shared account state | A supposedly read-only flow changes settings, invalidates tokens or logs out |
| One leased account per parallel worker | Expensive login with tests whose mutations can be reset between uses | Replacement workers, shards or concurrent runs acquire the same lease |
| Independent identity/session per test | Mutating tests requiring strong ownership and cheap isolated setup | Setup/cleanup cost, orphaned test data, hidden shared backend resources |
| Explicit contexts for multiple roles in one test | A conversation or permission scenario involving two people | Accidentally sharing one role's credentials or using a second tab as a second identity |

A setup project can produce authentication state before its dependent test
projects. It gives setup a place in reports and traces. It does not serialize
all consumer tests or isolate their server-side mutations. Filtering a dependent
project can still run its prerequisite; `--no-deps` deliberately bypasses that
relationship and can expose a stale or absent state file. See
[project dependencies](https://playwright.dev/docs/test-global-setup-teardown#option-1-project-dependencies).

Design exercise: propose a setup project for read-only catalog account checks,
a worker account lease for editable preferences, and per-test sessions for
logout tests. Name the server record each owns and the cleanup owner. The local
FS examples intentionally avoid requiring a real account-management API; this
exercise is architecture work, not a hidden executable endpoint.

### Run the project-dependency reference

FS-10 demonstrates **per-test** authentication. The separate reference in
`state/project-auth/` demonstrates **project setup dependencies** for an otherwise
read-only member workload. It is a runnable comparison for written exercise
05-09-b, not an eleventh skipped FS assignment.

```bash
# Complete reference: four passing cases (setup, member, guest, cleanup).
npm run test:state:auth

# Machine-checked controlled failure: the inner run must fail for the right reason.
npm run test:state:auth:gate

# Inspect just the dependency graph without running it.
npm run test:state:auth -- --list
```

`playwright.state-auth.config.ts` declares this graph:

```text
auth-setup (prepare.setup.ts)
    -> auth-reader (member.spec.ts)
    -> auth-cleanup (cleanup.teardown.ts)

auth-guest (guest.spec.ts): independent, explicit empty storage and headers
```

The setup verifies the demo login, then saves a temporary snapshot. The member
checks the visible identity and authenticated `/api/orders` response. The guest
checks `401 AUTH_REQUIRED` and an empty cart. The cleanup project resets only the
owned server session, verifies guest state and an empty cart, and removes the
snapshot. These consumers intentionally avoid shared cart mutations; the pattern
is not suitable for competing checkout/logout scenarios without further ownership.

The launcher gives every invocation a unique directory under
`quality-results/state-auth/` and passes the same location to its workers. It
prints the report path. The snapshot is inside that run's `.auth/` directory;
it is never a committed fixture, download asset, or diagnostic attachment. The
launcher also deletes it on exit as a last-resort safeguard. The gate proof checks
that **project teardown** removed it before that safeguard runs.

The gate command injects `CONTROLLED_AUTH_SETUP_FAILURE` after state capture. It
requires the underlying runner to exit 1 for that exact assertion, the member to
remain unexecuted, the independent guest and cleanup to pass, and the snapshot to
be absent. The wrapper returns success only when all those observations match.
The inner report intentionally remains red. This is proof of dependency gating,
not a retry or a suppressed product failure.

To see the raw deliberate failure on macOS/Linux:

```bash
FORGE_AUTH_SETUP_FAIL=1 npm run test:state:auth
# Expected exit 1: setup fails, member does not run, guest and cleanup pass.
# Run again without the variable to restore an ordinary green reference.
npm run test:state:auth
```

In PowerShell, set `$env:FORGE_AUTH_SETUP_FAIL='1'`, run the command, then use
`Remove-Item Env:FORGE_AUTH_SETUP_FAIL` before the clean run. The ordinary gate
wrapper is cross-platform and needs no shell environment syntax.

For your own exercise, sketch the graph first, inspect the reference only after
an attempt, then build a separate config and modules with different names. Do not
overwrite the main config. Acceptance: discover only the intended projects,
identify the member in the UI and API, preserve an independent guest, prove setup
failure blocks only its dependents, and verify both server cleanup and file
removal. Avoid `--no-deps` for the normal experiment: it deliberately bypasses setup
and teardown, so a missing state file is expected rather than a mystery.

## Keep the state lifecycle explicit and private

The ten FS drills use synthetic accounts and in-memory snapshots. The optional
project-dependency reference deliberately uses a temporary file to demonstrate
cross-worker handoff, then verifies its removal. If a real
project needs state files, treat the files as credentials: some can authorize a
session without the user's password.

The lifecycle to document is:

```text
create authorized training identity
  -> verify successful login and intended role
  -> capture only required state
  -> give it a bounded consumer and lifetime
  -> validate it before reuse when expiry is possible
  -> invalidate/reset server state where owned
  -> close contexts and dispose standalone API clients
  -> remove temporary state files
```

The repository already ignores `playwright/.auth/` and `.auth/`. Verify a planned
file is ignored before writing a real snapshot. Do not attach raw snapshots to
reports, commit them, paste them into prompts, or distribute them in the academy
archive. Keep harmless fixture data distinct from captured credentials. If a
credential was committed, removing the file later does not revoke it: invalidate
the credential and follow the repository's exposure procedure.

Cleanup has two owners. Closing a context handles its client-side resources.
Resetting owned server data is an application action. Forge deliberately keeps
its cart under a session; a real application may share account data across several
independent sessions. Allocate an account or record namespace when a unique
session alone cannot isolate the mutation. If another test owns a
server session, a blanket reset or logout can destroy its evidence. Scope cleanup
to the resource your setup created.

## Debug from the first broken boundary

Use this sequence when a stateful test is surprising:

1. Identify the exact `test` import and any inherited `use` values. A helper name
   does not tell you which cookie jar or header the fixture selected.
2. Draw browser, context, page, API client, credential and server-record owners.
   Include every manually created object and who closes it.
3. Verify the setup response and observable identity before testing the main
   scenario. Do not diagnose a failed login as a broken cart.
4. Check exact origin, cookie rules, custom headers and state capture options.
   For this lab, compare `x-lab-session` with cookie-based identity deliberately.
5. Check timing: did the initialization script run before the app read storage,
   and did IndexedDB finish before the assertion?
6. Inspect fixture setup and reverse teardown events. Find shared globals,
   eagerly created resources, or a worker fixture depending on test state.
7. Compare a single run with parallel/repeated execution. Inspect attempt and
   worker metadata instead of merely increasing the timeout or retry count.
8. Reduce to the smallest local reproduction with one changed boundary and one
   independent negative control. Keep the oracle intact.

| Symptom | First hypothesis to test | Useful local experiment |
| --- | --- | --- |
| API login succeeds but the page is anonymous | Independent cookie jars | FS-08 with context-associated and standalone request clients |
| Fresh context unexpectedly appears logged in | Inherited state/header or copied credential | Explicit empty state and headers, then inspect safe identity |
| Theme restored but notebook note missing | IndexedDB capture was not requested | FS-06 default snapshot versus `indexedDB: true` |
| Session draft missing after restore | Ordinary storageState excludes sessionStorage | FS-07 exact-origin initialization before navigation |
| Logout in one context logs out another | Both refer to the same server session | FS-09 copied authentication and anonymous control |
| Works with one worker but fails in parallel | Shared account/data owner or global variable | FS-02 owner/resource evidence across repetitions |
| Cleanup did not run after partial setup | Resource existed before cleanup ownership began | FS-01 lifecycle ledger with a deliberate setup failure |
| Authentication expires during a long run | Snapshot validity was assumed | A fresh identity check followed by explicit reauthentication |

## A command kit for useful evidence

Run these from the project root. Focused greps reduce noise; they do not replace
the final complete worked-suite run.

```bash
# Discover tests without executing the browser.
npm run test:state -- --list

# Investigate one cookie boundary with the debugger.
npm run test:state -- --grep FS-08 --debug

# Record a trace even if the focused run passes.
npm run test:state -- --grep FS-09 --trace on --workers=1

# Compare isolated resource behavior across several workers and repetitions.
npm run test:state -- --workers=4 --repeat-each=3

# See the report; open the selected trace from its test entry.
npm run test:report

# Type-check a fixture change, then confirm all worked labs.
npm run typecheck
npm run test:state
```

A deliberate retry investigation can use
`npm run test:state -- --grep FS-02 --retries=1 --workers=1`. A passing first
attempt will not demonstrate replacement: introduce and then remove a controlled
local assertion failure when that is the behavior you intend to study.

## Decision exercises and review gates

These exercises require explanations and evidence rather than another starter
file. Keep answers in your lesson notes or portfolio review document.

1. **The shared-page shortcut.** A teammate moves one page into `beforeAll` to
   save login time. Describe which boundary disappears, which tests can
   contaminate each other, and two alternatives with explicit ownership. Do not
   assume test-scoped `page`/`context` can be used in a `beforeAll` hook.
2. **The supposedly fresh user.** Two new contexts both load the same snapshot.
   One logs out. Predict the other context's next API response and distinguish
   the client-side copy from the server's authority.
3. **The missing draft.** Theme and a notebook note restore, but a tab draft
   does not. Name the state stores, the missing mechanism, its origin guard,
   and the negative control you would add.
4. **The collision after retry.** An account name uses only `parallelIndex`.
   Two CI shards run together and a worker restarts. Propose a lease or unique
   ownership policy, then explain cleanup for an interrupted process.
5. **The automatic evidence trap.** A diagnostic fixture captures every cookie
   and sends it to an AI agent. Replace it with a small schema that still helps
   diagnose setup, scope and retry failures without including credentials.
6. **The misleading green.** Clearing all storage before every action fixes a
   failing test. Explain which product behavior this may erase. Create a
   smaller reproduction that checks the intended persistence instead.
7. **The documentation mismatch.** A method appears in the current API page but
   TypeScript rejects it. Record the installed version, source version, exact
   method signature, and whether the task needs an upgrade or another supported
   technique. Do not use `any` to turn uncertainty into a compile success.
8. **The final design defense.** For a three-role checkout suite, draw resource
   ownership, choose authentication scope, name uniqueness inputs, describe
   cleanup, and identify a failure each design choice would expose.

Your review is ready when another engineer can reproduce one boundary failure,
explain the fixture graph without guessing, run the ten drills independently,
and identify the limit of each observation. Passing examples are reference
evidence; they do not substitute for implementing and explaining your starters.

## Continue in the primary references

Documentation checked on 20 October 2026, alongside the locally installed
Playwright 1.64.1 types. These are navigation targets, not copied course text:

- [Fixture guide](https://playwright.dev/docs/test-fixtures) and [built-in fixtures](https://playwright.dev/docs/api/class-fixtures)
- [Browser isolation](https://playwright.dev/docs/browser-contexts) and [Browser API](https://playwright.dev/docs/api/class-browser)
- [BrowserContext API](https://playwright.dev/docs/api/class-browsercontext) and [APIRequestContext API](https://playwright.dev/docs/api/class-apirequestcontext)
- [Authentication guide](https://playwright.dev/docs/auth) and [TestOptions reference](https://playwright.dev/docs/api/class-testoptions)
- [Configuration and inheritance](https://playwright.dev/docs/test-use-options) and [test.use / test.extend](https://playwright.dev/docs/api/class-test)
- [Parallelism](https://playwright.dev/docs/test-parallel), [worker metadata](https://playwright.dev/docs/api/class-workerinfo), and [retries](https://playwright.dev/docs/test-retries)
- [Project dependencies](https://playwright.dev/docs/test-global-setup-teardown) and [test metadata and attachments](https://playwright.dev/docs/api/class-testinfo)
- [Browser sessionStorage semantics](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage) and [localStorage semantics](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
