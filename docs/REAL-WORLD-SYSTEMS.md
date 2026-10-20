# Real-world systems workbook

Open **Real-world systems** (`#/real-world`) in the portal. This second workplace
batch adds three lessons and nine assignments:

| Lesson | Assignments | Question the evidence must answer |
| --- | --- | --- |
| 06-10 · Intended build | WB-01–03 | Did the browser reach the expected frontend and backend, before any business write? |
| 04-07 · Lost-response recovery | LR-01–03 | What persisted before the reply was lost, and does recovery preserve the original intent? |
| 04-08 · Async jobs | AJ-01–03 | Was one job submitted, did that same job succeed, and is its artifact correct? |

Complete request ownership (04-06), context/session isolation, controlled network
experiments, and the [first workplace batch](WORKPLACE-LABS.md) first. Each new
service has an explicit local protocol. The original [Forge Shop API](lab-api.md)
continues to perform synchronous writes and does not gain an idempotency protocol.

## Learn in three sessions

Allow **80 minutes** for preflight, **100 minutes** for recovery, and **100 minutes**
for jobs. These **4 hours 40 minutes** are included in the academy’s current guided
estimate. Add independent implementation and review time. Begin each session with
a prediction and finish with a command another person can reproduce.

From the project root, use Node 22+ and the lockfile:

```sh
npm ci
npx playwright install chromium
npm run test:preflight
npm run test:recovery
npm run test:jobs
```

These commands own separate local servers and print fresh evidence directories.
Do not point their mutation or test-control endpoints at an external application.

| Folder | Default local ports | Evidence parent |
| --- | --- | --- |
| `workplace/preflight/` | 14840 frontend, 14841 backend | `quality-results/preflight/` |
| `workplace/recovery/` | 14842 | `quality-results/recovery/` |
| `workplace/jobs/` | 14844 | `quality-results/jobs/` |

Each folder’s README documents port overrides, endpoint behavior, status/error
codes, and exact starter/proof modes. The hosted portal provides the source
download; these services run from your local checkout.

## WB: a healthy target can be the wrong target

Start with `workplace/preflight/README.md` and `expected-release.json`.
Expected release identity comes from reviewed configuration, not from the response
being tested. Capture both the frontend metadata and the actual backend request
made by the browser. A reassuring badge cannot substitute for that observation.

WB-01 verifies identity. WB-02 classifies the evidence from dependency
unavailability, unexpected server responses, malformed successful bodies, and
transport failure. WB-03 uses the required identity checks to gate a real action.
It must preserve an **empty write ledger for denied targets**, while the valid
control completes one correct business operation.

```sh
npm run test:preflight:practice -- --enable-starters --grep WB-01
npm run test:preflight:proof
# After implementing all helpers, run the same acceptance suite against them:
npm run test:preflight:practice -- --prove
```

Edit the typed starter helpers and read the practice spec. Keep the reviewed
expectation and independent acceptance assertions intact. A guard that allows
everything and a guard that blocks everything must both be detectable.

**Review questions:** Where did the expected revision come from? Which actual
request established backend identity? Was the ledger inspected before reset?
What does an unexpected 500 establish, and what remains unknown? Could the fleet
change after the check? This lab verifies application-reported identity, not
signed build provenance or a universal reverse-proxy topology rule.

## LR: the write committed, but the usable reply disappeared

The recovery fixture writes an order and journals its commit before flushing a
truncated reply and closing the connection. The journal and client failure are
both required evidence. A browser may transparently retransmit after a bare
connection close; the fixture uses a truncated response to make this particular
lost-reply experiment reproducible. Observe actual write attempts rather than
assuming one click always means one HTTP attempt.

The protocol scopes a key to a synthetic customer inside the test’s lab session:

- Same key and equivalent input returns the original order.
- Same key and conflicting input returns the documented conflict without mutation.
- A new key represents another legitimate operation.
- The same key under another customer belongs to a different scope.

LR-01 preserves the original key across bounded recovery and includes a browser
consumer. A second lost reply exhausts the two-write bound: preserve the same
key, one complete persisted effect, and an honest uncertain result without a
third POST. LR-02 exercises replay, conflict, and scope. LR-03 performs **GET-only**
reconciliation with a finite read budget and per-request timeout. Pending,
committed, and authoritative absence are distinct states in this teaching protocol.

```sh
npm run test:recovery:practice -- --enable-starters --grep LR-01
npm run test:recovery:proof
# Deliberately reject a faulty service with the reference assertion:
npm run test:recovery -- --defect=dedupe-off --grep "LR-01 API"
```

The last command should fail at the single-effect oracle. A server fault can also
challenge enabled learner tests. Some named client counterexamples in the proof
are implemented in the reference spec: they do not silently rewrite your learner
helper. Follow `workplace/recovery/README.md` when adapting them.

**Review questions:** Did the failed request roll back, or is that unproven?
Which key survived recovery? Were there two transport attempts but one effect?
Does a pending lookup justify another purchase? What happens after process restart
or page reload?

The service ledger lasts only for this process. Its journal is diagnostic, not a
recovery log that is replayed after restart. Browser intent is kept in page memory.
The lab does not prove durable atomic effect/ledger writes, concurrent duplicate
serialization across processes, or universal exactly-once delivery.

## AJ: acceptance is not completion

The jobs fixture accepts a submission with 202 and an identity. Test-owned controls
advance queued/running/succeeded/failed states; GET status remains read-only.
The observer must correlate the request, customer, job, and artifact throughout.

AJ-01 submits once and checks successful content through API and browser consumers.
AJ-02 returns a specific terminal-failure diagnosis. AJ-03 handles stalled work,
read exhaustion, request timeout, and misleading identity/result evidence. The
browser preserves an unknown outcome and its job ID when observation stops.
It offers read-only Resume observation and blocks another submission, preventing
a misleading “Failed” label from encouraging duplicate work.

```sh
npm run test:jobs:practice -- --enable-starters --grep AJ-01
npm run test:jobs:proof
```

The typed observer has a monotonic overall deadline, a per-request cap, and a
maximum status-read count. Recompute remaining time before a read; never pass
`timeout: 0` to mean “no time remains,” because that disables the request timeout.
Leave the enclosing test enough time for evidence and cleanup.

| Observation | Required conclusion |
| --- | --- |
| 202 plus a job identity | Work was accepted; the final outcome is not established |
| Terminal `failed` | Stop with the job’s safe failure reason |
| `succeeded`, correct identity, wrong artifact content | The business result is incorrect |
| Stalled job until observation deadline | The observer stopped; server cancellation is not established |
| Read budget exhausted | The permitted read count was used; no new job should be created |
| One request times out before the overall deadline | A request budget failed; preserve that distinction |

The proof challenges wrong content, job creation inside polling, and ignored
terminal failure. Its wrapper checks exact identities and intended errors.
A generic outer test timeout is not acceptable evidence of bounded observation.
See `workplace/jobs/README.md` for the exact learner-verification options.

## Starters, solutions, and proof are different evidence

All nine assignment IDs map to `practice.spec.ts` and `worked.spec.ts` in their
respective folders. Typed starter helpers hold the implementation TODOs.
Default practice leaves unfinished assignments skipped. Use `--enable-starters`
after implementation; an enabled untouched starter fails an explicit sentinel.
Do not satisfy an exercise by switching its import to the reference helper.

```sh
npm run test:preflight:proof
npm run test:recovery:proof
npm run test:jobs:proof
```

A successful proof command means it observed the intended controlled failures
and passing controls. It does not mean every child test was green. Some proofs
also verify the **shipped untouched** starter inventory; those checks must be
adapted after you complete starters. Keep your implementation and run its
documented acceptance/fault modes instead of restoring an unfinished exercise
and calling that completion.

These configurations are separate from `test:all` because they own dedicated
services and deliberately failing proof scenarios. CI runs all three proof
commands and retains their artifacts. Report paths and generated traces are
fresh local/CI evidence; they are not fabricated recordings bundled with the course.

## Submit a reviewable handover

Use the same six-part rubric as the first workplace workbook: claim, reproduction,
diagnosis/design, patch, controlled challenge, and limitation. For this batch add:

1. An expected-versus-observed identity table and zero-write denial evidence.
2. A commit/lost-reply/replay timeline with customer, key, and actual effect count.
3. A job state timeline with read/write counts, named budget, and artifact oracle.

Have a reviewer change one premise: wrong backend, conflicting key reuse, or a
successful status with incorrect content. Defend the resulting decision without
weakening the original business claim. Preserve uncertainty when the evidence
does not establish a final outcome.

Primary references:
[Playwright web-server readiness](https://playwright.dev/docs/test-webserver),
[request options](https://playwright.dev/docs/api/class-apirequestcontext),
[polling assertions](https://playwright.dev/docs/test-assertions#expectpoll),
[HTTP idempotency](https://www.rfc-editor.org/rfc/rfc9110.html#section-9.2.2),
and [202 Accepted](https://www.rfc-editor.org/rfc/rfc9110.html#section-15.3.3).
