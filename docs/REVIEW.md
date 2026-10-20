# Academy review · October 20, 2026

A second review examined the lessons, runnable exercises, portal, shop/API, configuration, downloads, and CI together. Three independent reviews covered curriculum correctness, practice-system behavior, and learning-portal usability. The fixes below are implemented, with regression tests where the behavior can be executed.

## Highest-value findings and fixes

| Finding | Why it mattered | What changed |
|---|---|---|
| Empty-catalog example could pass before the response arrived | An initially empty DOM did not prove the mocked response was handled | Lesson waits for visible empty-state feedback before asserting zero cards |
| Login and cookie examples raced asynchronous initialization | Passing setup could target the wrong session or observe unfinished login | Explicit session/bootstrap waits; cookie and header fixtures distinguished; inherited headers cleared for independent contexts |
| Quantity schema limit confused with stock limit | A learner could expect quantity 99 to succeed for a product with stock 12 | Boundary exercises now separate schema rejection from insufficient stock |
| Several commands, seed paths, and outage examples mismatched the project | Correct-looking lesson work could fail for unrelated setup reasons | Real spec paths, discoverable seed location, configurable port, correct response envelope and recovery steps |
| No direct mapping between lesson challenges and runnable drills | Learners had to guess where to write code and which command to run | Shared mapping connects lessons to all 24 EX drills and six SK drills, with starter, solution, and command |
| Browser features were explained but lacked focused executable practice | Clock, storageState, files, frames, popups, and dialogs needed a controlled target | Six starter/solution pairs and a dedicated local browser-skills bench |
| Delayed cart responses could replace more recent intent | Fast edits could show or persist surprising state | Session operations and UI updates serialized; delayed-response regression added |
| Cart refresh could replace an input during typing | Opening the cart and editing immediately could lose input | Fresh state is rendered before editable cart controls appear |
| Request limit counted characters rather than bytes; network chunks decoded separately | Unicode could bypass the size contract or be corrupted | Byte-counted buffering and a single UTF-8 decode, with fragmented Unicode/boundary tests |
| Focus was lost after cart updates and dialog transitions | Keyboard users could lose their place; WebKit exposed implicit browser assumptions | Explicit focus preservation/return, plus engine-independent focus assertions |
| Linux WebKit displayed the receipt instead of downloading it | The download header alone did not produce the promised action on every engine/platform | Explicit download intent on the link; test verifies file contents and that the shop remains open |
| Skip link and malformed fragments could blank the portal | Navigation and reload were fragile | SPA-safe skip behavior, malformed-route fallback, and regressions |
| Slow manual failures could overwrite a later route | A completed navigation could be replaced by an unrelated error | Rendering checks a route version on both success and failure |
| Continue learning ignored the last open unfinished lesson | Returning learners lost their current position | Resume uses the saved last lesson when appropriate |
| Five manuals overflowed a phone-width viewport | Long code fragments and tables made reading require whole-page horizontal scrolling | Constrained the reading column and allowed long inline text to wrap; all 14 manuals checked at phone and desktop widths |
| Hidden mobile navigation remained focusable | Keyboard and assistive-technology users could reach offscreen links | Hidden navigation/background are inert at the appropriate times, with managed focus |
| Progress imports accepted nonexistent checks and invalid quiz choices | Corrupt records could produce misleading progress | Imported keys and answers are validated against actual content |
| EX-16 checked too little state after rejected requests | A rejection response could hide an unwanted mutation | Each rejection compares the complete seeded cart before/after |
| Changing an expected value was described too strongly | That demonstrates assertion execution, not necessarily product defect detection | AI guide distinguishes assertion smoke checks from controlled defects with an unchanged oracle |

## Verification improvements

- Content validation now checks lesson relationships, resource URLs, quiz bounds, all 30 starter/solution mappings, npm script names, and local Markdown references.
- The optional browser matrix has a separate configuration. Normal commands stay fast; the larger matrix is explicit.
- GitHub Actions supports an optional manually requested three-engine matrix on Linux.
- Browser authentication snapshots are ignored by Git. The cookie drill keeps its synthetic state in memory.
- Source downloads include the browser-skills harness, starter/solution files, and matrix configuration.
- See [Verification](VERIFICATION.md) for commands actually executed and scope limitations.

## Accessibility and visual extensions now implemented

The first two recommendations have become complete workshops: **four new lessons, eight written challenges, and eight executable starter/solution pairs**. That extension brought the academy to 44 lessons, 88 written challenges, and 38 executable starters. The later Docs extension below adds to those totals.

- [Accessibility labs](ACCESSIBILITY-LABS.md): scoped axe evidence, a controlled naming defect and repair, keyboard dialog behavior, and form-error/contrast investigation.
- [Visual baseline workshop](VISUAL-BASELINES.md): deterministic desktop/mobile images, narrow volatile-content masking, controlled-regression evidence, and deliberate review of platform-specific baseline updates.

Normal visual comparison refuses missing references and does not overwrite them. Linux candidate generation is a separate manual workflow; approved images must be reviewed and committed before the comparison job can validate them. Automated accessibility checks remain partial evidence, and visual comparisons remain specific to the tested rendering environment.

## Useful next extensions — intentionally not claimed as implemented

These are advanced branches after the core capstone, rather than prerequisites for starting the academy.

1. **Richer API protocols.** The current lab teaches REST/HTTP. Add a separate GraphQL or WebSocket fixture only when your work requires it. Acceptance: cover schema/event ordering, errors, state ownership, and a documented cleanup strategy.
2. **A second product domain.** Extend the capstone to bookings, roles, or subscriptions rather than repeating the same shop. Acceptance: model different state transitions and justify which risks belong at each layer.
3. **Real-device and performance evidence.** Browser engines and viewport emulation do not establish device behavior, throughput, or production latency. Define a separate environment and workload before making those claims.

The first practical improvement for a learner is to complete one mapped exercise, produce a deliberate failure, and explain its oracle. More content is useful only when it leads to better evidence.

## Playwright Docs extension

The fixtures/context/state gap now has a focused eight-lesson path and ten FS starter/solution pairs. The complete academy has **52 lessons, 104 written challenges, 52 quizzes, and 48 executable starters**. Existing lesson IDs, notes, and progress remain valid.

- A dedicated **PW Docs track** page connects the official references, shared lesson progress, and the [fixtures and state workbook](FIXTURES-AND-STATE.md).
- Lessons cover dependency graphs, lazy and automatic fixtures, reverse teardown, test/worker scope, typed options, context ownership, storage snapshots, and authentication strategy.
- The `/state/` workbench makes localStorage, sessionStorage, IndexedDB, and guest/member state observable. Cookie values are not displayed.
- FS experiments distinguish browser isolation from server-side state ownership, include independent guest controls, and keep authentication snapshots in memory.

## Second review of the fixtures and state track

Three focused reviews checked teaching accuracy, executable evidence, and the
learner's route through the portal. The eight lessons were revised without
changing their IDs, progress records, or the ten-starter inventory.

| Gap found | Improvement |
| --- | --- |
| Fixture assignments assumed imports and declarations that starters lacked | Typed learner scaffolds now supply module-level registration and explicit TODO boundaries |
| Cleanup examples mainly proved successful execution | FS-01 tests real setup/body failures; FS-10 observes cleanup after a real consumer failure; extra errors invalidate the proof |
| Worker reuse and automatic teardown were described more strongly than asserted | Worker identity is checked against `beforeAll`, resources are tracked, attempt metadata is attached, and the complete automatic-fixture ledger is asserted |
| Storage explanations missed opener copying and reload hazards | Tests separate independent tabs from popup copies and verify that restored drafts survive edits and reload |
| A clean control could hide a broad logout/reset mistake | Populated, independently authenticated controls must remain signed in with their cart intact |
| “Fresh context” could imply server reset or ignore inherited authentication | Lessons distinguish explicit empty client state, server session identity, and account-level data; the workbook adds a reset-versus-isolation matrix |
| Authentication setup exercise stopped at a configuration fragment | A runnable setup/member/guest/cleanup reference includes a controlled failure gate and verified transient-file removal |
| Focused navigation left the track after lesson 03-10 | Each of the eight lessons now has track navigation; the first starter is FS-04 with an adjacent implementation warning |

Five deliberate regressions were introduced in an isolated scratch copy and
rejected by the strengthened cases: test-scoping a worker fixture, omitting
automatic teardown, replacing reset with an unrelated HTTP 200 response,
omitting lease teardown, and overwriting an edited draft on reload. Extracted
lesson examples were also compiled and executed. The
[verification record](VERIFICATION.md) distinguishes these checks from unfinished learner work.
- Download bundles and the default test suite include the new track. The study plans account for its additional guided time.

This expansion concentrates on the requested documentation areas. It does not claim to replace every Playwright guide or establish production authentication security. See [Verification](VERIFICATION.md) for executed checks.

## API track review

Three focused reviews examined teaching accuracy, executable API evidence, and
the learner's route. Five existing lessons were revised, and 04-06 adds request
controls and response ownership. The academy now has **53 lessons, 106 written
challenges, 53 quizzes, and 52 executable starters**. Existing lesson IDs and
progress records remain valid.

| Gap found | Improvement |
| --- | --- |
| Rejected writes were often checked against an empty cart | Seeded discounted carts must remain fully unchanged after invalid quantities, bodies, products, and promotions |
| Authentication examples emphasized status over state | Exact error codes, guest/member identity, retained carts, and independent session controls are asserted |
| Catalog loops could accept an empty collection or wrong membership | Runtime array checks, exact IDs, known products, independent sorting values, and total consistency are explicit |
| “Immutable orders” were compared only immediately after creation | Later cart changes and a second different purchase must leave the first complete order and receipt unchanged |
| The hybrid lesson stopped after setup | A real UI checkout now connects its visible total and order ID with the POST response, stored order, and completely cleared cart |
| Request serialization, policy and lifetime were missing | AP-01/02 and lesson 04-06 distinguish raw JSON, UTF-8 byte boundaries, HTTP errors, failed requests, response disposal, and client disposal |
| Receipt ownership existed mainly in reference tests | AP-03 provides a starter and solution for text headers/body, guest and missing-order errors, overlapping IDs, and independent authenticated controls |
| API practice was scattered across the academy | A focused API portal route joins six lessons, twelve API drills, the hybrid exercise, and a new workbook |

AP-01–04 are complete starter/solution pairs in `api-workshop/`; they complement
the eight strengthened EX-09–16 starters. The workbook includes independent
expected values, controlled faults, cleanup boundaries, and evidence criteria.
Polling is taught as a bounded read-only design for services that require it;
Forge's synchronous mutation contract does not need retries to become correct.
The [verification record](VERIFICATION.md) records the executed checks.

## UI testing track review · 20 October 2026

The UI review focused on whether a passing exercise proves its stated rule.
At the UI review checkpoint, the academy contained **54 lessons, 108 written challenges, 54 quizzes, and
56 executable starters**. The focused UI route contains eleven lessons and
20 mapped assignments, with shared completion and notes.

| Gap found | Improvement |
| --- | --- |
| Repeated SAVE10 could pass against the first submission's unchanged total | Match each response, inspect independent arithmetic, then reopen the cart for a fresh ordered read |
| Search recovery and sort checks relied on counts or only endpoints | Check full collection membership/order, absence of stale cards, and all reset filter values |
| A “keyboard-only” drill began with programmatic focus | Rename its claim to activation and focus return; link full keyboard reachability to AX-03 |
| Rerender resilience was explained without exercising it | Reuse the same quantity locator across changes, a reload, and subsequent cart renders |
| Guest checkout “recovery” ended after displaying an error | UI-02 follows the visible sign-in instructions and completes a real purchase with persisted evidence |
| Native validation and server rejection were conflated | UI-01 separates a required-field event, a real 401, and successful correction, with an observer positive control |
| Failed checkout lacked a complete retry assignment | UI-03 retains shipping and cart after one simulated 503, then proves a real retry creates one order |
| Correct latest results could be asserted before the old response was processed | UI-04 delays real catalog data, waits for a documented browser consumption marker, then checks the final exact collection |
| UI learners lacked one runnable path through scattered material | Add the UI track, UI workbook, four skipped starters and worked solutions, source downloads, and specialist links |
| Setup guide still listed the initial 40-lesson inventory | Refresh lesson ranges, current counts, guided estimates, and track entry points |

Lesson 03-11 teaches controlled transitions and their evidence boundaries.
Existing lesson IDs remain stable. UI-03 tests browser recovery from an injected
response, not a real backend outage; UI-04 uses real responses and a test-only
completion probe tied to this application's synchronous catalog rendering.
The [UI workbook](UI-TESTING.md) explains both limitations and fault experiments.
See [verification](VERIFICATION.md) for checks actually executed.

## Interview and workplace audit follow-up

Three additional reviews found that incident diagnosis, required-suite/result
gates, live refactoring, independent data builders, realistic code reviews and
constrained release decisions would add more value than repeating definitions.
The [interview and workplace roadmap](INTERVIEW-AND-WORKPLACE.md) records the
coverage map, ranked proposals, acceptance evidence, advanced integration gaps,
18 interview probes and a mock session using current material. Proposed labs
remain explicitly unimplemented and do not inflate lesson or starter totals.


## Workplace batch and real-world learning audit

At the first workplace release the inventory was **58 lessons, 116 written challenges, 58 quizzes, and
65 executable assignment IDs**. Nine new assignments cover three diagnostic
incidents, two coverage-gate stages, two page-object tasks, and two builder tasks.
The [workplace workbook](WORKPLACE-LABS.md) distinguishes assignment IDs from
registered cases, learner starters from reference proofs, and intentional faults
from unrelated failures. The portal exposes this route at `#/workplace`.

Three independent follow-up reviews identified the highest-value remaining gaps:
wrong-target preflight, committed writes with lost replies, asynchronous jobs,
mid-workflow authentication loss, mock/provider drift, distributed evidence
completeness, interrupted-worker cleanup, complete pagination, and intentional
concurrent edits. The [updated roadmap](INTERVIEW-AND-WORKPLACE.md) specifies
proposed fixture contracts, deliverables, discriminating faults, prerequisites,
and learning-plan changes. These proposals are not added to executable totals.

Peer review also corrected the new lessons' address-validation order, trimmed
UTF-16 length semantics, cart-versus-purchase scope, and controlled response
release ordering. Proof runners validate exact case identities and named failure
reasons; a missing browser, malformed report, or unrelated timeout cannot count
as successful product-defect detection. See [verification](VERIFICATION.md) for
actual execution evidence.

## Real-world systems batch

The current inventory is **61 lessons, 122 written challenges, 61 quizzes, and
74 executable assignment IDs**. Three lessons and nine assignments add independent
release preflight, idempotent recovery after a committed write loses its reply,
and bounded observation of asynchronous jobs. Each has starters, typed helpers,
worked solutions, standalone services, and deliberate defect proofs. Open
**Real-world systems** in the portal or [its workbook](REAL-WORLD-SYSTEMS.md).

Cross-review checks the weak boundaries: both frontend and backend identity,
exhausted recovery attempts, and honest UI uncertainty after an observation
deadline. Proofs establish the supplied fixture contracts, not durable exactly-once
processing or production build attestation. [Run anywhere](RUN-ANYWHERE.md) records
local use, OpenAI hosting, GitHub, and progress portability.


## Account independence and durable local learning

The local workshop now saves completion, checks, quizzes, notes and last lesson
in SQLite outside the source checkout. The hosted portal retains browser storage;
[Local data](LOCAL-DATA.md) explains transfer, backups, save acknowledgement and
recovery. A failed request or second tab cannot silently overwrite a newer record.
Database identity is checked as well as revision when committing.

[Account handoff](ACCOUNT-HANDOFF.md) and `AGENTS.md` describe opening the project
in Codex under a different OpenAI login. `npm run account:copy` prepares a separate
source folder without the original deployment identity or learner data. Creating
the newly owned private site must happen while signed into that account. GitHub
access and local learning remain independent of Sites ownership.

The build and handoff share source exclusions, including configured database
paths and recognized progress exports. Tests seed private markers and inspect
actual static files and both ZIPs. Normal Playwright runs own a browser-only
server; persistence tests use disposable directories. See [Verification](VERIFICATION.md)
for executed evidence and limits. There is no automatic cross-device sync or
multi-user database service in this release.
