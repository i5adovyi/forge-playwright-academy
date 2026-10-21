# The working vocabulary

| Term | Meaning in this project | Example or caution |
|---|---|---|
| Actionability | Conditions Playwright checks before an action | A click target must be usable; this does not prove the business result |
| Accessible name | The name assistive technology uses for a control | “Email” on a labeled textbox |
| API | A programmatic interface to application behavior | `POST /api/cart` |
| APIRequestContext | Playwright HTTP client context with its own settings and state | A client carrying one lab session header |
| Arrange–Act–Assert | A structure for preconditions, behavior, and verification | Seed cart, submit quantity, verify rejection |
| Assertion | An executable claim about expected behavior | Cart total equals independently expected cents |
| Async/await | JavaScript syntax for working with promises | Await a click before checking its outcome |
| Authentication | Establishing who a caller is | Signing in with the local demo account |
| Authorization | Deciding what an authenticated or anonymous caller may do | Reject anonymous order access |
| Auto-waiting | Waiting for actionability or a retryable assertion condition | A button becomes enabled before click |
| Baseline | A reviewed expected snapshot | A screenshot generated in a controlled environment |
| Boundary value | A value at or around a rule’s edge | Stock 12: compare quantities 12 and 13 |
| Browser context | An isolated browser session with cookies and storage | Two contexts can represent two shoppers |
| CI | Continuous integration: automated checks for changes | Running the suite on a pull request |
| Contract | Agreed inputs, outputs, and behavior | Invalid quantity returns a documented error and no mutation |
| Cross-layer test | A test crossing API and UI boundaries | Create cart through API, verify it in browser |
| Data-driven test | The same behavior checked across explicit input rows | Zero, fractional, string, and valid quantities |
| Deterministic | Given controlled inputs and state, the outcome is predictable | Unique session and known catalog seed |
| End-to-end test | A check across a complete supported workflow | Browser checkout using the real local server |
| Equivalence partition | Inputs expected to follow the same behavior class | Negative quantities share a rejection rule |
| Fixture | A dependency with a defined setup/use/teardown lifecycle | An API client owning a unique session |
| Flaky test | A test with inconsistent outcomes without a relevant intended change | Shared cart data causes intermittent failures |
| Headed/headless | Browser execution with/without a visible window | Headless still runs a browser |
| Healer | An agent role that investigates failing tests and proposes repair | A skipped case still needs review |
| Idempotency | Repetition has the same intended effect as one operation | Setting a cart quantity differs from incrementing it |
| Integration test | A test of collaborating components | UI request and server cart state agree |
| Isolation | Tests do not unintentionally affect one another | Separate session identities for separate cases |
| Locator | A description of how to find an element when used | `getByRole('button', { name: 'Place order' })` |
| Mock | A controlled replacement for a dependency | A simulated cart API error |
| Mutation | A change to application state or deliberately changed code/data for a test experiment | Rejecting quantity should not mutate cart |
| Oracle | The rule used to judge correctness | Known unit price multiplied by quantity |
| Page object | An abstraction around page interactions | Helpful when it preserves intent instead of hiding assertions |
| Planner | An agent role that explores and creates a test plan | Risk, inputs, expected results, proposed layer |
| Project | Playwright configuration grouping for a test environment | Chromium desktop or WebKit mobile settings |
| Regression | Previously supported behavior no longer works | Checkout stops clearing the cart |
| Retry | Running a failed case again | Diagnostic evidence, not a root-cause explanation |
| Schema | Runtime structure and constraints for data | Product ID string and integer cent amount |
| Seed | Known initial data or setup for a test | The local six-product catalog |
| Session | Application state associated with an identity | `lab_session` cookie or `x-lab-session` header |
| Shard | A portion of a suite assigned to one machine/job | Parallel CI jobs with merged reports |
| Smoke suite | A deliberately small set of high-value checks | Catalog, login, and one checkout journey |
| Soft assertion | An assertion that records failure while allowing further checks | Useful for diagnostics, still fails the test |
| Strict locator | Single-element action requiring an unambiguous target | Multiple “Sign in” matches need scope |
| Test double | General term for a substituted collaborator | Stubbed response used for a UI error state |
| Test ID | An explicit application-to-test identifier | A stable contract when semantic identity is insufficient |
| Trace | Recorded execution evidence with actions and snapshots | Investigate the first unexpected event |
| Worker | A separate execution process used by the runner | Mutable shared state can collide across workers |

These short explanations are study aids. Use the linked official documentation in the portal for exact API semantics.

## Before the testing vocabulary

| Term | Plain-language meaning | Example |
| --- | --- | --- |
| Terminal / shell | A place to type commands / the program interpreting them | npm run test:beginner |
| Working directory | The folder a command currently runs in | Folder containing package.json |
| Source file / save | Code on disk / writing editor changes to that file | beginner/practice.spec.ts |
| Node.js / npm | JavaScript runtime / project package and script tool | node --version; npm ci |
| Variable / value | A name / the data it refers to | const quantity = 2 |
| String / number / boolean | Text / numeric data / true or false | '2', 2, true |
| Object / array | Named fields / an ordered collection | product.name; names[0] |
| Function / argument / return | Reusable instructions / an input / the result | lineTotal(12900, 2) |
| Promise | A value representing eventual completion or failure | Await a request before using its response |
| HTML / CSS / DOM | Document structure / styling / browser document tree | A labeled button in a page |
| JSON | A text representation of data | A response with a products array |
| URL / port / path | Resource address / service number / resource location | http://127.0.0.1:4173/lab/ |
| Request / response | A message to a service / its answer | GET products, receive status and body |
| Spec / runner | File of tests / program executing selected tests | worked.spec.ts; Playwright Test |
| Skipped | Not executed | A starter still using test.skip |
| TODO / sentinel | A comment describing unfinished work / a deliberately failing check guarding it | Replace the selected assignment's sentinel with meaningful assertions |
| Callback | A function passed to another function to run when needed | The function after the title in test('name', async () => { ... }) |
| Actual / expected | What was observed / the independently chosen requirement | A received product name compared with Studio Headphones |
| Snippet | Part of a file shown to explain an idea | Insert an API example inside its supplied test body, not at the end of the file |
| Project root / extracted folder | The course folder after unpacking the ZIP | package.json, README.md and server.mjs are together |
| Browser origin | The protocol, host and port identifying a website's storage boundary | Hosted progress and http://127.0.0.1:4173 progress are separate |
| Git commit / push | Record a source snapshot / copy commits to a remote | Independent of portal study progress |

Use [Start from zero](BEGINNER-START.md) to practice these terms one at a time.
