# Interview and workplace readiness roadmap

This is a review of what to add next, plus an interview practice session you can
use now. **The proposed labs below are not implemented assignments.** They do
not increase the academy's 54 lessons or 56 executable starters. Existing lesson
and drill references point to working material already in the project.

Three independent reviews examined technical interview coverage, runnable
engineering practice, and the learner's ability to explain decisions at work.
Priorities reflect the skills these scenarios exercise; they are not a measured
ranking of questions across employers. Expectations vary by role and seniority.

## What is already strong

| Existing capability | Where to practice |
| --- | --- |
| Locators, meaningful assertions, forms, complete checkout and recovery | 02-01–05; EX-01–08; UI-01–03 |
| Controlled responses, event ordering, stale results and diagnostic evidence | 03-01–04, 03-11; EX-18–23; UI-04; SK drills |
| Fixture lifetimes, context boundaries, storage, authentication and cleanup | 03-08–10, 05-06–10; FS-01–10 and the authentication project exercise |
| API contracts, rejected mutations, independent arithmetic and ownership | 04-01–06; EX-09–16; AP-01–04 |
| Accessibility and reviewed visual comparisons | 03-06–07, 06-06–07; AX-01–04; VS-01–04 |
| Risk selection, trace diagnosis, CI, code review and release decisions | 01-01/05, 06-01–05, 07-03/04, 08-01–05 |
| Oral defense and portfolio scoring | [Assessment](ASSESSMENT.md), including its ten-question oral exam |

The biggest gap is practice with incomplete evidence and competing constraints:
a broken pipeline, an inherited test suite, an unsafe proposed repair, or a
release decision where a green run is insufficient. More definitions of fixtures
or more happy-path checkout tests would add less value than those assignments.

## Build first: practical engineering simulations

Each proposed assignment should ship with a brief, a starter, a reference
solution, reviewer notes, and a reproducible fault. Preserve the original
business expectation while diagnosing and repairing it.

### 1. Diagnose a CI-only failure

**Existing basis:** 03-01, 05-10, 06-01/02, traces and retry evidence.
**Missing practice:** a supplied incident pack where the learner must distinguish
product, test, environment, and data failures before choosing a repair.

Give the learner a failing command, a trace, a small log, and an unproven claim
such as “the runner is slow.” Provide variants for an ambiguous locator, an
unobserved state transition, and test-owned data accidentally shared in parallel.
Use synthetic data and generate artifacts from a known commit.

**Interview probe:** “It passes locally and passes on the second CI attempt.
What do you inspect first, and what experiment would distinguish your hypotheses?”

**Acceptance evidence:** identify the first unexpected event; reject at least
one competing explanation; submit a small patch and a run of the previously
failing scenario; show that the original business assertion still detects its
controlled defect. A larger timeout or more retries without evidence earns no
repair credit. Repeat runs supplement the causal experiment; they cannot prove
the absence of all future flakiness.

### 2. Make a green pipeline mean the required tests ran

**Existing basis:** 05-05, 06-02/03, project selection, CI and skipped starters.
**Missing practice:** an executable release gate for omitted projects, accidental
skips, unexpected expected-failure annotations, and flaky outcomes.

Create a small required-suite manifest for a separate teaching configuration.
Have one branch accidentally select only a smoke project; another skips a
required checkout case. Keep learner starters outside the required manifest:
this academy intentionally ships unfinished skipped exercises.

**Interview probe:** “CI is green after someone changed the grep expression.
How do you prove the critical suite still executed?”

**Acceptance evidence:** enumerate the intended cases; compare executed results
to that contract; fail on an omitted required case or unexpected result; distinguish
skipped, expected-failed, flaky and consistently passed outcomes. A deliberately
permitted quarantine needs an owner, reason, expiry and replacement evidence.
Do not gate on a raw passing-test count that unrelated cases can satisfy.

### 3. Refactor an inherited suite without weakening its tests

**Existing basis:** 05-01–03, UI-02, EX-17 and shared fixtures.
**Missing practice:** a complete page-object/data-builder refactor with actual
consumers and a behavior-preserving comparison.

Supply two duplicated workflows, one overgeneralized base class, and a helper
that hides a weak assertion. Ask the learner to introduce focused page objects
or functions, keep test data ownership in fixtures, and preserve clear independent
expected values in the tests. The solution should be modest; an inheritance tree
is not a success criterion.

**Interview probe:** “Which logic belongs in a fixture, a page object, a data
builder, or the test itself? Show the tradeoff in this diff.”

**Acceptance evidence:** both consumers remain readable; the same deliberate
pricing or validation defect fails before and after the refactor; each case runs
alone and in parallel; cleanup still happens after an assertion failure. Review
both code reduction and diagnostic clarity.

### 4. Review a convincing but unsafe pull request

**Existing basis:** 07-03/04 and the assessment's false-green release blockers.
**Missing practice:** a supplied diff with realistic review decisions and a
scored explanation for accepting or rejecting each change.

Include several changes: a legitimate product-name update, an unexplained
`force: true`, a screenshot update that accepts a defect, a broad error catch,
a removed monetary assertion, and a legitimate scoped locator repair. The
learner should distinguish them rather than rejecting every change reflexively.

**Interview probe:** “Which changes can merge? Which need evidence? Write the
smallest useful review comment and propose a repair.”

**Acceptance evidence:** tie each concern to the protected rule; retain a
controlled failure for the important oracle; request specific evidence; separate
blocking issues from preferences. Produce a final patch and concise review
summary. AI may suggest changes, but the learner must defend the evidence.

### 5. Defend a release decision under time pressure

**Existing basis:** 01-01/05, 06-04/05 and the capstone.
**Missing practice:** a finite-budget assignment with an ambiguous requirement,
a late change, partial coverage and a stakeholder audience.

Provide a 15-minute pipeline budget, a promotion-rule change, a known unsupported
browser, and one intermittently failing purchase test. Ask for a risk-based suite
selection, one clarification question, a release recommendation, and a concise
handover. Supply actual or explicitly simulated evidence with its provenance.

**Interview probe:** “You cannot run everything. What runs now, what runs later,
and what could still go wrong if every selected test passes?”

**Acceptance evidence:** explain UI/API/contract choices, protect the critical
rule, name untested risks, attach commands and results, and communicate a
conditional go/no-go decision without claiming certainty. The scoring should
reward defensible tradeoffs, not the number of test cases proposed.

### 6. Test navigation and hydration readiness

**Existing basis:** 03-01, 03-04, 02-03.
**Missing practice:** a dedicated page where the document and enabled control
appear before the application attaches its handlers, plus a redirect/deep-link
case with a defined destination contract.

**Interview probe:** “The click succeeded, but nothing happened. What does
Playwright's actionability guarantee, and what does the application still owe?”

**Acceptance evidence:** reproduce the timing deterministically; distinguish
URL, document load, actionability and application readiness; implement an
appropriate readiness contract or keep the control disabled until usable;
assert the expected URL and destination state. Do not replace the missing
contract with a fixed sleep, forced click or generic network-idle assumption.
See [Playwright navigation and hydration](https://playwright.dev/docs/navigations).

### 7. Build independent data-driven validation cases

**Existing basis:** 05-03, 04-03, API rejection and unchanged-state tests.
**Missing practice:** an executable typed shipping builder and separately
registered field/boundary cases, rather than only a written builder exercise.

Supply a builder that accidentally shares a mutable default object. Ask for
fresh input per case, one invalid field at a time, required/whitespace/type/length
boundaries, and accepted boundary controls. Use the actual shipping contract;
do not assume the UI and API impose identical constraints.

**Interview probe:** “Why might a parameterized test pass alone and fail after
another case? How do you prove each failure reaches the intended validation rule?”

**Acceptance evidence:** discover every intended case; keep all earlier
preconditions valid; assert the exact rejection, preserved discounted cart, and
empty history after each attempt. A missing case or reused mutated builder
must be detectable. See [parameterized tests](https://playwright.dev/docs/test-parameterize).

## Add next: targeted integration and delivery labs

These proposals need their own fixtures or isolated configurations. They should
not be described as features already present in Forge Shop.

| Proposed lab | Interview or work problem | Evidence required to finish |
| --- | --- | --- |
| Asynchronous jobs and safe polling | A POST returns 202; the job may succeed, fail, or never finish | Submit once; retain the job ID; use bounded read-only observations; detect terminal failure and deadline expiry; prove the final independent result. Do not repeat writes inside a retrying assertion. |
| Pagination and collection completeness | Page one looks right but an export loses or duplicates rows | Assert the full expected identity set, uniqueness, ordering, filter retention and termination; detect a missing/duplicated page. Ask what consistency the API promises during concurrent changes. |
| Browser versus API CORS behavior | Direct API requests work while the frontend cannot read the response | Use two local origins; observe the browser request/preflight where applicable; demonstrate correct origin and credential policy; keep authentication and authorization distinct from CORS. |
| Locale, timezone and dates | An appointment appears on the wrong calendar day | Specify instant versus calendar-date semantics; fix time; vary locale and timezone independently; check known display and persisted values at a day boundary, with a documented DST stretch case. |
| Mock payload drift | A mock still passes although the real response contract changed | Validate `unknown` data from both reviewed fixtures and the real endpoint; report field paths; detect wrong types/missing IDs; retain separate semantic membership and money checks. This is not a complete contract-testing platform. |
| Wrong environment preflight | A healthy server is the wrong app or build | Compare a service/build identity with an independent expected target before running UI checks; fail clearly against another healthy local server; avoid exposing secrets in environment evidence. |
| Popup routing scope | A parent-page route misses the popup's first request | Install context routing before opening the popup; verify synthetic content; remove the route and verify a second real popup; close owned pages. |
| Shards and complete merged reports | HTML is generated although one shard is missing | Verify the union of expected case identities and compatible run revisions; preserve a deliberate failure and its attachment; reject omitted or mixed reports. |
| Actual browser identity | Three project labels accidentally launch the same browser | Compare actual browser type with an independent project policy; verify required case membership per engine; report missing installations as unexecuted coverage. |

A later multi-role authorization lab would also be useful: authenticated users
with different permissions, owned records, forbidden operations and unchanged
state. It needs an explicit authorization model and at least two distinct users.
The current demo login and isolated sessions must not be presented as role-based
access-control coverage.

## Interview probes you can use now

Try answering first. Use the expected reasoning as a review guide, then point
to your own code or execution evidence. These extend the existing oral exam;
memorizing the wording is not the objective.

| Question or follow-up | What a strong answer must include | Existing practice |
| --- | --- | --- |
| Why can a repeated discount assertion pass too early? | The value already exists; identify the new operation, wait for its response and appropriate application completion, then verify independent arithmetic | EX-07, 03-01 |
| Does `response.finished()` prove the UI handled that response? | Network completion and application rendering are separate; describe the particular readiness boundary and its assumptions | UI-04, 03-11 |
| Why avoid solving an ambiguous locator with `.first()`? | It may hide a target-selection bug; scope by meaningful identity and demonstrate the intended product | 02-02, EX-05/06 |
| What is the difference between native validation and a server rejection? | The invalid native form can prevent submission; a real request and response are needed to test server policy; use a positive control for a request observer | UI-01 |
| What does the one-shot checkout 503 prove about retry safety? | It rejects before persistence; it does not establish safety after a committed write whose response is lost | UI-03, 04-06 |
| Two browser contexts share a cart. Is browser isolation broken? | Trace cookies, copied headers and server identity; separate browser storage from ownership of mutable server records | FS-05, FS-08/09 |
| Why can a worker-scoped authenticated account cause failures? | Worker lifetime and retries do not make shared mutable server state independent; allocate resources for the workload and own cleanup | FS-02, 05-07/09 |
| When is API setup appropriate for a UI test? | It can focus the tested flow; explicitly exclude skipped UI behavior from the claim; preserve a separate full journey when needed | EX-17 versus UI-02 |
| Does a 503 emit `requestfailed`? | An HTTP response with an error status is different from a transport failure; inspect the response status and body | 03-02, EX-18 |
| What belongs in a page object versus a fixture? | Interaction abstractions and lifecycle/resource ownership differ; explain where scenario expectations remain visible | 05-01/02 |
| What makes a negative test meaningful? | Valid earlier preconditions, the intended rejection, unchanged useful state, and a nearby accepted control | EX-12/16, AP-02 |
| What is wrong with retrying an entire checkout until it passes? | Repeated non-idempotent writes may create extra outcomes; distinguish observation retries from operation retries and ambiguous outcomes | 04-06, UI-03 |
| How would you prove a green pipeline omitted a critical check? | Compare intended and executed identities/projects/outcomes; a passing count alone is inadequate | 06-03 and proposed CI gate |
| How do workers differ from shards? | Concurrency within a runner versus division across invocations/machines; both need independent data and complete result collection | 06-04 |
| Is a clean axe scan proof of accessibility? | Automated checks cover only part of the requirement; include keyboard/manual review and declared scope | AX-01–04 |
| When should a screenshot baseline change? | A reviewed intended product change supported by the diff; preserve the original baseline during a defect-detection experiment | VS-04 |
| An AI repair removes a failing assertion. Would you accept it? | Determine whether the requirement changed; require evidence and a preserved oracle rather than optimizing for a green run | 07-03/04 |
| What would you tell a release manager after a retry pass? | State what actually ran, the flaky outcome, affected risk, unresolved evidence and a justified recommendation | 06-02/05 |

## A 90-minute mock session using existing material

| Time | Task | Deliverable |
| --- | --- | --- |
| 0–10 min | Answer three questions above without opening the guide | One example and one counterexample per answer |
| 10–40 min | Implement a previously unattempted UI-01 starter and run it | Test, exact command, actual result and explained oracle |
| 40–60 min | Investigate the controlled failed setup described in 06-01-b | Earliest wrong event, competing hypotheses and one discriminating experiment |
| 60–75 min | Review the false-green repair from 07-04-b and the AI playbook | A specific blocking comment and a defensible alternative |
| 75–90 min | Write the evidence/release brief from 06-05-a | Facts, remaining risks and recommendation in a short report |

Use `npm run test:ui:practice -- --grep UI-01` after implementing the starter
and removing its skip. If a partner prepares an incident, keep its reviewer key
hidden. A self-prepared fault is a guided exercise, not a blind diagnosis.

Score explanation **15**, implementation **35**, investigation **25**, review
**15**, and communication **10**. For each dimension: 0 means absent or incorrect;
partial credit requires correct reasoning; full credit requires applied evidence
and a defended tradeoff. An unfinished time-boxed task can receive reasoning
credit, but must not be reported as a passing implementation. Invented execution,
hidden required skips, or weakened business assertions remain blockers.

## Recommended next implementation order

1. Build the incident pack and required-suite gate first: they train judgment
   about failures and green results across every existing track.
2. Add the page-object refactor and shipping-builder exercises with starter,
   solution, two independent consumers, and controlled faults.
3. Package the PR review and constrained design/release briefs, then add three
   interview formats: explanation/code reading, debugging, and system design.
4. Add hydration/navigation and the advanced integration labs based on the roles
   being targeted. Each new target needs a stated contract before tests are written.

Estimated learner effort is roughly **45–90 minutes per incident or design
brief**, **30–60 minutes per review**, and **60–120 minutes per coding lab**.
These are planning estimates, not measured completion times. Implement one
small batch and use the learner's mistakes to decide the next batch.

## Primary references for the proposed additions

Checked during this review on 20 October 2026:

- [Timeout budgets](https://playwright.dev/docs/test-timeouts) and [request-failed events](https://playwright.dev/docs/api/class-page#page-event-requestfailed).
- [Annotations](https://playwright.dev/docs/test-annotations), [retries](https://playwright.dev/docs/test-retries), and [fail-on-flaky policy](https://playwright.dev/docs/api/class-testconfig#test-config-fail-on-flaky-tests).
- [Page object models](https://playwright.dev/docs/pom) and [parameterized tests](https://playwright.dev/docs/test-parameterize).
- [Navigation and hydration](https://playwright.dev/docs/navigations), [polling assertions](https://playwright.dev/docs/test-assertions#expectpoll), and [API testing](https://playwright.dev/docs/api-testing).
- [GitHub's pagination contract](https://docs.github.com/en/rest/using-the-rest-api/using-pagination-in-the-rest-api), as one specific pagination model.
- [MDN CORS guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS), [emulation](https://playwright.dev/docs/emulation), and [clock](https://playwright.dev/docs/clock).
- [Web-server readiness](https://playwright.dev/docs/test-webserver), [popup routing limit](https://playwright.dev/docs/api/class-page#page-route), and [sharding/report merging](https://playwright.dev/docs/test-sharding).
