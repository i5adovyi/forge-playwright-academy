# Async jobs: accepted is not completed

Lesson **04-08** · assignments **AJ-01 / AJ-02 / AJ-03** · about 100 minutes.

The reporting screen says “queued” and a test turns green. Later, support finds
the report never finished, or it belongs to someone else's request. A rushed
repair retries the creation POST until something succeeds, producing several
jobs. This lab makes those failures observable.

The target is a separate, local Node service. It does not change the synchronous
Forge shop or pretend that its orders are asynchronous. There is no Redis,
external account, remote worker, or extra package to install.

## Start and inspect

From the repository root:

```bash
npm run test:jobs
npm run test:jobs -- --list
npm run test:jobs:practice
npm run test:jobs:practice -- --enable-starters --grep AJ-01
npm run test:jobs:proof
```

Default: **10 passing worked cases**, covering **3 assignment IDs**.
Practice: the same ten acceptance cases are skipped until explicitly enabled.
The unfinished `observer.starter.ts` throws `AJ_STARTER_NOT_IMPLEMENTED`.
Enabling it alone must fail. Implement the function in that file; do not point
the practice import at the worked implementation.

`worked.spec.ts` and `practice.spec.ts` register the shared acceptance cases in
`cases.ts`; therefore the JSON report's source locations point to `cases.ts`.
`observer.ts` contains the worked observer. `fixtures.ts` owns sessions, test
controls, evidence, and cleanup. `app.js` is a separate browser consumer, not a
test assertion helper.

The default isolated server port is **14844**. Set `JOBS_PORT=14845` if needed.
The configuration refuses to reuse a listening server. Results go into a fresh
`quality-results/jobs/run-*/` directory, including JSON/HTML reports, traces,
read/write evidence, a source hash, and the current Git commit when available.
No generated evidence is committed.

## The exact service contract

Each test gets a fresh `x-jobs-session` value. Job IDs are opaque UUIDs.
The only supported business operation generates a summary for `customer-42`:

```http
POST /jobs
Content-Type: application/json

{"requestId":"a-client-generated-UUID","customerId":"customer-42","format":"summary"}
```

It returns **202**, a new `id`, the unchanged `requestId` and `customerId`,
and `state: "queued"`. A 202 acknowledges acceptance; it does not establish
success. This endpoint deliberately has **no idempotency contract**: another
POST creates another job even if its requestId repeats. Request correlation is
not automatically deduplication. Study lesson 04-07 for that separate contract.

`GET /jobs/:id` is read-only. Valid transitions are:

```text
queued → running → succeeded
   ↘ failed    ↘ failed
```

`succeeded` contains `artifactPath: "/jobs/:id/artifact"`.
`failed` contains `error.code: "SOURCE_UNAVAILABLE"` and a safe message.
Both are terminal. `GET /jobs/:id/artifact` returns 409 before success, then:

```json
{
  "jobId": "the-submitted-job-id",
  "requestId": "the-original-client-request-id",
  "customerId": "customer-42",
  "format": "summary",
  "summary": { "orderCount": 3, "totalCents": 28900 }
}
```

Status IDs and artifact identity must match the submission. A matching ID still
does not establish correct business content: the test independently expects
**3 orders / 28,900 cents**, and the browser must display **$289.00**.

The fixture's `/control/*` endpoints exist only for this local exercise.
They create/dispose test sessions, advance allowed states, expose read/write
evidence, and hold a response or substitute an incorrect identity.
The `wait-for-read` barrier waits until a specific state was actually observed;
the coordinator then advances it through a separate explicit control request.
A status GET never advances state.

The state machine is deterministic: a job remains queued forever if the test
does not advance it. Small delays space observation requests; no arbitrary
sleep is responsible for completing the job. This exercises client observation,
not real queue scheduling, persistence, worker leases, or exactly-once execution.
All data disappears when this local process stops. Session disposal releases
pending barriers and held HTTP responses.

## AJ-01: submit once and prove the correct result

Complete this interface in `observer.starter.ts`:

```ts
observeJob(
  request: APIRequestContext,
  expected: { id: string; requestId: string; customerId: string },
  options: {
    budgetMs: number;
    requestTimeoutMs?: number;
    intervalMs?: number;
    maxReads?: number;
  },
): Promise<Artifact>
```

Submission belongs outside this helper. Follow the returned job ID; do not
choose the first finished job in a collection. On each read, validate the job,
request, and customer identities. On `succeeded`, validate the exact artifact
path and identity, then return a correctly shaped artifact to the caller.
Do not make business expectations depend on the response under test.

The API case records queued, running, and succeeded observations and requires
one creation write, one job, and one artifact retrieval. The browser case
requires a disabled Generate button while pending, a hidden result before
completion, the matching job/customer, exact report values, and no error.
It separately verifies one creation for the browser's request ID.

In practice mode the browser case first invokes your observer on a completed
job. This prevents the already implemented UI from making an empty learner
implementation appear complete. That prerequisite and the browser click are
two explicitly different intended operations; each must retain its own identity.

Deliver the passing AJ-01 checks and a short timeline showing which requests
are business writes, status reads, artifact reads, and test-only controls.
Explain why putting the POST inside `expect.poll` or `expect.toPass` changes the
workload rather than merely retrying an observation.

## AJ-02: fail on the terminal cause

When the service says `failed`, stop immediately with a structured error:

```ts
{
  code: 'JOB_FAILED',
  evidence: {
    jobId: expected.id,
    reads: 1,
    lastState: 'failed',
    causeCode: 'SOURCE_UNAVAILABLE'
  }
}
```

You can use the exported `JobObservationError` class from `observer.ts` as a
public error type without importing the worked `observeJob` function. The
checks use the error's contract, not `instanceof`, so an equivalent class works.

The case gives observation two seconds but requires the terminal diagnostic
in under 1.2 seconds, exactly one status read, no artifact request, and no second
creation. It does not accept “anything except queued” as success. The controlled
fault that ignores `failed` must produce a different error and fail the named
terminal-cause oracle.

Explain what is known after a terminal failure, which evidence should be
preserved, and why retrying submission needs a new product decision rather
than a hidden helper fallback.

## AJ-03: bound every layer and preserve uncertainty

The observer has four distinct limits:

| Limit | What it controls | Worked diagnostic |
| --- | --- | --- |
| Per-request cap | One HTTP read that never returns | `REQUEST_TIMEOUT` |
| Overall monotonic deadline | Total observation, waits, status and artifact reads | `OBSERVATION_DEADLINE` |
| Maximum status reads | Rapid responses that would overload the service | `READ_LIMIT` |
| Playwright test timeout | Entire test, including setup and assertions | A test-runner failure, not a valid job outcome |

Before every request, compute the remaining deadline with `performance.now()`.
Use the smaller of that value and the per-request cap. Never pass `timeout: 0`
to Playwright: zero disables its request timeout. Explicit `maxRetries: 0`
keeps the number of transport attempts inspectable. The count limit covers
status reads; successful completion permits one additional artifact read,
which still shares the same overall deadline.

The seven AJ-03 cases cover:

- A stalled queued job exhausts a 240 ms observation budget. A generous
  1.2-second assertion envelope avoids confusing the clock budget with
  sub-millisecond scheduler precision.
- A status body with another job's ID is rejected before artifact access.
- A succeeded status whose artifact belongs to another job is rejected.
- Three quick status reads exhaust a separate read ceiling before the deadline.
- A held response hits its 200 ms request cap while the two-second observation
  budget remains available. Cleanup still runs and removes the session.
- A held response has a two-second request cap but only 240 ms of overall
  observation budget. It must hit the earlier overall deadline; one blocked
  request cannot escape the observer's limit.
- The browser stops observing a still-queued job and honestly shows an unknown
  outcome, retains its ID, and disables submission. **Resume observation**
  reads the same job; after controlled completion it displays that job's report
  without any extra creation write.

Use specific `IDENTITY_MISMATCH`, `HTTP_ERROR`, `INVALID_RESPONSE`, and
`REQUEST_FAILED` diagnostics for their respective cases; do not convert every
exception into a retriable “not ready.”
The worked helper does not automatically retry transient transport failures,
429s, or 5xxs. A production retry policy would need its own documented bounds,
classification, backoff, and tests.

Keep job ID, last observed state, read count, and terminal cause in evidence.
The test leaves teardown outside the observer's budget and verifies session
deletion. A timed-out observer has not cancelled the server job. A request
timeout does not establish a failed business operation. Do not infer either.

## What the proof proves

`npm run test:jobs:proof` runs a fixed reference experiment:

1. All ten worked cases pass.
2. A completed artifact retains correct identity but changes its total to
   one cent. The API case must fail `JOB_ARTIFACT_ORACLE`.
3. The observer's controlled counterexample creates a job inside each poll.
   The API case must fail `JOB_SINGLE_WRITE_ORACLE`.
4. The counterexample ignores terminal `failed`. AJ-02 must fail
   `JOB_TERMINAL_CODE_ORACLE` with an attached `OBSERVATION_DEADLINE` diagnosis
   and repeated failed-state reads. An unrelated transport error cannot count.
5. All ten explicitly enabled unfinished starter cases must fail with the
   starter sentinel. Skipping work cannot qualify as completion.

The runner checks exact case identity and project, one unretried execution,
expected status, the specific error marker, and fresh trace/evidence attachments.
It rejects absent cases, top-level runner errors, unexpected skips, and unrelated
failures. Named cases are selected intentionally for each single-fault run.
Fault flags are reset for ordinary commands; the proof never edits source.

This is a proof of the **reference acceptance suite**. It does not automatically
certify a learner's new helper. For your submission, keep the same independent
acceptance cases, run them against your own implementation, and demonstrate the
three equivalent faults in a disposable copy. A reviewer should reject replacing
the starter import with the worked solution or weakening the creation/content
oracles. Finish with a clean normal run and attach the timeline and failure causes.

The expected unfinished-starter proof is intentionally part of the distributed
reference repository. After completing your local starter, that particular
reference check will no longer expect the correct state of your files. Keep
your completed work on your own branch and run its enabled acceptance suite.

The browser preserves accepted job identity in page memory. Observation errors
do not mean business failure or cancellation. Only a known terminal outcome
re-enables **Generate another report** as an explicit new intent. If submission
loses its response before a usable ID is known, the UI blocks another write and
reports uncertainty; this service has no operation lookup or idempotent replay.
Reloading discards the page's pending identity. Durable recovery across reloads,
tabs, or process restarts is outside this fixture's contract.

## Interview defense

Answer with your trace and evidence, not just definitions:

1. What does 202 establish, and what remains unknown?
2. Which IDs establish correlation? Why does repeating a requestId not imply
   idempotency in this service?
3. Can a correct completion flag coexist with a wrong artifact?
4. Which limit stopped a held request? Which one stopped an always-queued job?
5. Where does cleanup get its time after observation exhausts its budget?
6. What changes if jobs survive process restarts, artifacts expire, status reads
   are eventually consistent, or production applies `Retry-After`?

Further stretch work should add an explicit contract before code: bounded
transient-read retries, cancellation races, job ownership authorization,
artifact expiry/checksums, worker restart recovery, and cleanup after a killed
test process. These are not capabilities claimed by this teaching fixture.

Primary references:
[APIRequestContext](https://playwright.dev/docs/api/class-apirequestcontext),
[polling assertions](https://playwright.dev/docs/test-assertions#expectpoll),
[Playwright timeouts](https://playwright.dev/docs/test-timeouts),
[HTTP 202 Accepted](https://www.rfc-editor.org/rfc/rfc9110.html#section-15.3.3).
