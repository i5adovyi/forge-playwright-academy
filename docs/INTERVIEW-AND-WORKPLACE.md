# Interview and workplace readiness roadmap

**The first workplace batch is implemented:** four lessons and nine assignments
cover incident diagnosis, CI execution gates, page-object refactoring, and data
builders. Open **Workplace practice** in the portal and use the
[workplace workbook](WORKPLACE-LABS.md). The academy now has **61 lessons and
74 executable assignment IDs**. The next systems batch adds wrong-build detection, lost-response recovery, and
async jobs in [three implemented lessons](REAL-WORLD-SYSTEMS.md). Further proposals below are explicitly marked;
they are not included in those totals.

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

## First batch delivered, with remaining simulations

The delivered assignments include briefs, starters, reference solutions, reviewer
notes, and reproducible faults. Future assignments should meet the same bar. Preserve the original
business expectation while diagnosing and repairing it.

### 1. Diagnose misleading failures — implemented

Lesson **06-08**, **IN-01–03**, `workplace/incidents/` supply fresh traces and
causal evidence for rejected stock setup hidden by a UI timeout, two contexts
sharing server identity, and a premature snapshot during a held response.
`npm run test:incidents:broken` intentionally fails; implement the repairs before
reading `worked.spec.ts`. The proof challenges the repaired business assertions.

**Interview probe:** “What is the earliest unexpected event, and what experiment
rules out a competing explanation?” Submit two hypotheses, a small repair, and
normal/fault evidence. These deterministic cases do not reproduce every kind of
CI-only or environment failure; see the next-wave review below.

### 2. Make required execution visible — implemented

Lesson **06-09**, **CG-01/02**, `workplace/gates/` compare a real report with an
independent required ID/project inventory. The first starter covers discovery;
the second adds outcomes. Ten real scenarios cover omissions, duplicates, skips,
expected-failed misuse, failure, flaky execution, and errors. Optional skipped
starters remain legitimate. Unit tests cover malformed evidence.

**Interview probe:** “CI is green after a grep change. How do you prove the
required suite ran?” Explain why a zero runner exit and a raw count are each
insufficient. This teaching manifest covers its own isolated suite; distributed
artifact provenance, quarantine governance, and full production inventory remain
future work. See the [workbook](WORKPLACE-LABS.md).

### 3. Refactor an inherited suite — implemented

Lesson **05-11**, **RF-01/02**, `workplace/refactoring/` include duplicated
baseline cases, typed starter models, fixtures, and worked consumers. Preserve
independent expected product, quantity, price, and persisted cart in each spec.
The second assignment reuses locators across real catalog/cart rerenders.

**Interview probe:** “How do you prove your refactor preserved protection?”
The controlled +$1 UI-total fault must fail all three baseline and all three
worked cases at the same price oracle. The README explains how to apply that
proof to your own completed consumers. The poor BasePage proposal is a review
prompt; it is not a separate runnable anti-pattern fixture.

### 4. Review a convincing but unsafe pull request — proposed

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

### 5. Defend a release decision under time pressure — proposed

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

### 6. Test navigation and hydration readiness — proposed

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

### 7. Build independent validation data — implemented

Lesson **05-12**, **DB-01/02**, `workplace/builders/` provide typed builders and
50 worked cases: nested data ownership, one positive checkout consumer, 36 field
rejections, and 12 accepted controls. Each rejection checks `422 INVALID_ADDRESS`,
the entire preserved discounted cart, and empty order history. Limits apply to
trimmed UTF-16 string length, with padded-boundary controls.

**Interview probe:** “Why does a case pass alone and fail after another one?”
Prove that defaults and caller-owned overrides cannot be contaminated by another
result. The exact-inventory proof catches shared defaults and four removed
length limits. See the [builder brief](../workplace/builders/README.md).

## Add next: targeted integration and delivery labs

The rows marked implemented now have separate local fixtures. Other rows remain
proposals. None should be described as features of the original Forge Shop.

| Proposed lab | Interview or work problem | Evidence required to finish |
| --- | --- | --- |
| Asynchronous jobs and safe polling — implemented in AJ-01–03 | A POST returns 202; the job may succeed, fail, or never finish | Submit once; retain the job ID; use bounded read-only observations; detect terminal failure and deadline expiry; prove the final independent result. Do not repeat writes inside a retrying assertion. |
| Pagination and collection completeness | Page one looks right but an export loses or duplicates rows | Assert the full expected identity set, uniqueness, ordering, filter retention and termination; detect a missing/duplicated page. Ask what consistency the API promises during concurrent changes. |
| Browser versus API CORS behavior | Direct API requests work while the frontend cannot read the response | Use two local origins; observe the browser request/preflight where applicable; demonstrate correct origin and credential policy; keep authentication and authorization distinct from CORS. |
| Locale, timezone and dates | An appointment appears on the wrong calendar day | Specify instant versus calendar-date semantics; fix time; vary locale and timezone independently; check known display and persisted values at a day boundary, with a documented DST stretch case. |
| Mock payload drift | A mock still passes although the real response contract changed | Validate `unknown` data from both reviewed fixtures and the real endpoint; report field paths; detect wrong types/missing IDs; retain separate semantic membership and money checks. This is not a complete contract-testing platform. |
| Wrong environment preflight — implemented in WB-01–03 | A healthy server is the wrong app or build | Compare a service/build identity with an independent expected target before running UI checks; fail clearly against another healthy local server; avoid exposing secrets in environment evidence. |
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
| How would you prove a green pipeline omitted a critical check? | Compare intended and executed identities/projects/outcomes; a passing count alone is inadequate | 06-09, CG-01/02 |
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

## Real-world gap review: what to build after this batch

The first batch improves diagnosis, execution policy, maintenance, and data
ownership. The remaining weakness is **integration under uncertain outcomes and
partial evidence**. More happy-path cart tests would not close it. The proposals
below are based on three independent reviews of the actual lessons, source, and
exercises; they are engineering priorities, not survey claims about employers or
commercial courses. **Priorities 1–3 are implemented in the systems batch; the remaining proposed labs are not implemented.**

### Priority 1: prove the right system was tested — implemented

Lesson **06-10**, **WB-01–03**, and `workplace/preflight/` compare frontend/backend
application, build, tenant, environment, and actual browser destination with an
independent manifest. Healthy impostors are rejected before business writes.
Diagnostic probes distinguish documented dependency unavailability, product
errors, malformed responses, and transport failure. A valid target also has to
complete a real action. Application-reported identity is not cryptographic
attestation, and a preflight is a point-in-time check.

### Priority 2: a successful write loses its reply — implemented

Lesson **04-07**, **LR-01–03**, and `workplace/recovery/` persist an order before
truncating its reply. A scoped idempotency contract defines replay, conflict,
and legitimate new operations. The API and browser retain operation identity;
read-only reconciliation distinguishes committed, authoritative absence, and
uncertain outcomes. The disk journal supplies causal evidence; it does not
restore the process-local deduplication ledger after restart. Browser intent
is page-local. The [systems workbook](REAL-WORLD-SYSTEMS.md) states the bounds.

### Priority 3: an accepted background job fails or never finishes — implemented

Lesson **04-08**, **AJ-01–03**, and `workplace/jobs/` provide controlled
queued/running/succeeded/failed states and a separate result. Submit once,
correlate reads, honor a monotonic observation deadline and read ceiling,
distinguish terminal failure, and verify the produced artifact independently.
A timed-out observer does not establish cancellation or failure of server work.
Reference proofs challenge duplicate creation, ignored failure, and wrong results.

### Priority 4: authentication disappears halfway through work

Current drills cover initial guest/member state and cookie ownership. Add an
explicitly revocable session and a product policy for draft retention and
reauthentication. Do not wait for an actual multi-hour token lifetime or assume
browser clock controls the backend clock.

**Deliverable:** prove initial authentication, revoke it after form entry, observe
401 and no mutation, retain the required draft, and perform explicit recovery.
**Fault proof:** removing authorization must expose a persisted forbidden write;
losing the draft must fail a field assertion; repeated login/resubmit must fail
a request-count bound. **Prerequisites:** FS-08–10, UI-01/02, 05-09.
Scope: 90–120 minutes. Refresh-token rotation and RBAC require separate contracts.

### Priority 5: mocks stay green while the provider changes

03-02 explains mock limits, but there is no shared runtime contract that is
executed against both fixture data and real responses. Add a reviewed contract
for `unknown` JSON with explicit required/optional/additive-field policy.

**Deliverable:** fixture validation, a direct API check, a mocked UI consumer,
and a compatibility decision for a supplied provider change. **Fault proof:** a
string price or missing ID fails at the correct field path; a permitted additive
field passes; a correctly shaped but wrong known price passes the schema and
fails an independent business assertion. **Prerequisites:** 01-03, 03-02, EX-09.
Scope: 75–105 minutes. Types and schemas do not establish business correctness.

### Priority 6: distributed CI evidence lies by omission

CG validates one complete run. A plausible merged report may omit a shard or
include yesterday’s artifact. Add an independent expected shard manifest and
artifact envelopes with run/attempt, commit, project, and shard identity.

**Deliverable:** a collector that rejects missing, duplicate, stale, or mixed-run
inputs before merging and checks merged required identities afterward.
**Fault proof:** each corrupted collection must fail for its own reason while a
complete set passes. Local hashes establish byte consistency, not trusted build
provenance or signed attestation. **Prerequisites:** CG-01/02 and 06-03.
Scope: 90–120 minutes.

### Priority 7: a killed worker leaves data behind

Normal fixture teardown does not guarantee cleanup after process termination.
Use a dedicated child process and a resource service that survives that child.
Terminate only the owned child after an allocation acknowledgement.

**Deliverable:** an ownership ledger and idempotent recovery/lease-expiry policy.
**Fault proof:** demonstrate the orphan, recover it, and preserve a second active
run’s sentinel record. Disable recovery to reveal the leak; remove ownership
filtering to reveal overbroad deletion. **Prerequisites:** FS-01/02, 05-07, DB-01.
Scope: 90–120 minutes. `finally` is not a crash-recovery protocol.

### Priority 8: two editors intentionally share a record

IN-02 repairs accidental identity sharing; UI-04 rejects stale GET rendering.
Neither exercises intentional concurrent writes. Add a versioned draft fixture
with a defined `If-Match`/412 contract and an explicit conflict-recovery policy.

**Deliverable:** two contexts read version 1, A saves, B's stale save is rejected,
A's persisted value survives, B's draft remains available, and an explicit UI
resolution saves with the current version. **Fault proof:** disabling the version
guard exposes a lost update; clearing the rejected draft exposes lost user work.
Giving the editors different records would evade the requirement.
**Prerequisites:** FS-08/09, IN-02, UI-03/04, RF-02. Scope: 90–120 minutes.

### Priority 9: an export silently loses a later page

The current catalog is unpaginated. Add an explicit cursor contract, a reviewed
identity dataset, duplicate display names, and an empty intermediate page that
still has a continuation cursor. Define snapshot versus changing-collection
semantics before testing concurrent inserts.

**Deliverable:** traverse to the documented terminal cursor, preserve filters,
bound repeated cursors, and compare exact exported membership and order.
**Fault proof:** replace a row with a duplicate while preserving count, omit a
page, repeat a cursor, or drop a filter after page one. Each must fail its own
membership, termination, or filtering oracle. Silently deduplicating is not a
repair. **Prerequisites:** 04-02, EX-20, DB-01, CG-01. Scope: 90–120 minutes.

### Further bounded extensions

After those, add a synthetic secret-canary exercise for shareable traces/logs and
archives: produce intentionally sensitive-looking fake data, identify what leaves
the workspace, package only approved evidence, and prove the canary cannot leak
into the shared bundle. Use no real credentials. Add locale/time-zone/DST and
money-formatting checks, permission-denied feature controls, controlled navigation
hydration, pagination, and release decision constraints when their product
contracts and dedicated targets are ready. These remain proposals, not coverage.

## Improve the way you practise now

The existing labs can support harder work without pretending new service behavior
exists. Use this progression on one completed workplace assignment:

1. **Cold attempt:** read only the ticket and record two hypotheses before opening
   the solution. Keep the first failed command and what it actually demonstrated.
2. **Restricted repair:** change only the starter/model/gate; keep the business
   expectation and reviewed required inventory intact.
3. **Change request:** add a second named consumer, a permitted optional case,
   or another documented shipping boundary without weakening existing coverage.
4. **Adversarial review:** explain why increasing timeouts, hiding a retry, sharing
   setup state, or deriving expected money from actual output would be misleading.
5. **Handover:** another person should reproduce your result from the command,
   commit, evidence path, and a five-sentence explanation. Include one remaining
   uncertainty and a conditional release recommendation.

Track **read → attempted → implemented → fault-proven → explained** in your field
notes. The portal completion checkbox stays a self-assessment; it does not verify
those stages automatically. Select two next-wave labs according to your work:
preflight + mock drift for integration work, shard completeness + evidence handling
for delivery work, ambiguous writes + jobs for backend-heavy systems. Do not add
all proposed hours to every study week.

## Primary references for the proposed additions

Checked during this review on 20 October 2026:

- [Timeout budgets](https://playwright.dev/docs/test-timeouts) and [request-failed events](https://playwright.dev/docs/api/class-page#page-event-requestfailed).
- [Annotations](https://playwright.dev/docs/test-annotations), [retries](https://playwright.dev/docs/test-retries), and [fail-on-flaky policy](https://playwright.dev/docs/api/class-testconfig#test-config-fail-on-flaky-tests).
- [Page object models](https://playwright.dev/docs/pom) and [parameterized tests](https://playwright.dev/docs/test-parameterize).
- [Navigation and hydration](https://playwright.dev/docs/navigations), [polling assertions](https://playwright.dev/docs/test-assertions#expectpoll), and [API testing](https://playwright.dev/docs/api-testing).
- [GitHub's pagination contract](https://docs.github.com/en/rest/using-the-rest-api/using-pagination-in-the-rest-api), as one specific pagination model.
- [MDN CORS guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS), [emulation](https://playwright.dev/docs/emulation), and [clock](https://playwright.dev/docs/clock).
- [Web-server readiness](https://playwright.dev/docs/test-webserver), [popup routing limit](https://playwright.dev/docs/api/class-page#page-route), and [sharding/report merging](https://playwright.dev/docs/test-sharding).
