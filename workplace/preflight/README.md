# Wrong build, healthy service: verify the target before writing

Lesson **06-10** · approximately **80 minutes** · assignments **WB-01–WB-03**

The deployment job says green. The health endpoint returns 200. Your smoke test
recognizes every button. The team later discovers that the run exercised
yesterday's frontend, a stale backend, or another tenant. This lab makes those
targets observable and tests a guard that prevents its first business write.

You need basic Playwright fixtures, response observation, and API assertions.
This is a separate local teaching service. It does not add release metadata or
order behavior to the original Forge Shop.

## Run it

From the repository root, after `npm ci` and `npx playwright install chromium`:

```sh
npm run test:preflight
npm run test:preflight:practice
npm run test:preflight:practice -- --enable-starters --grep WB-01
npm run test:preflight:proof
```

Equivalent direct commands are `node workplace/preflight/run.mjs`,
`node workplace/preflight/run.mjs --practice`, and
`node workplace/preflight/run.mjs --prove`.

The reference has **21 registered acceptance cases for 3 assignments**. The
practice project registers the same 21 cases and skips them until explicitly
enabled. Enabled unfinished helpers throw a named `STARTER_NOT_IMPLEMENTED`
error; skipped cases are not completion.

The runner owns two local servers on **14840** (frontend) and **14841** (API).
It refuses to reuse a server already occupying its frontend address. You can
choose unused local ports:

```sh
FORGE_PREFLIGHT_FRONT_PORT=14850 FORGE_PREFLIGHT_BACK_PORT=14851 npm run test:preflight
```

Every case creates a fresh UUID session and an empty ledger. Fixture setup and
cleanup endpoints are test controls; the ledger records attempted and accepted
**business** order writes. Cleanup removes only that case's session and happens
after its assertions. A control request is not being passed off as a business
write, and deleting test state afterward cannot hide a write already observed.

Fresh reports, traces, evidence JSON, source fingerprint, and console logs are
under `quality-results/preflight/run-*/`. The runner prints the actual path.
Open its `worked/report/index.html`, or use `npx playwright show-report` with
that report directory. Generated results are ignored by Git.

## The independent contract

[expected-release.json](expected-release.json) is the reviewed expectation:

| Field | Expected value |
| --- | --- |
| Application | `forge-release-lab` |
| Environment | `training` |
| Tenant | `academy` |
| Frontend build | `web-2026-10-20.1` |
| Backend build | `api-2026-10-20.3` |
| Browser frontend origin | Configured local frontend origin |
| Browser API origin | Configured local backend origin |

The service has its own deployment values and **does not import this manifest**.
Tests read the manifest before observing the target. In a real pipeline, obtain
the expectation from the reviewed release/deployment job, not from the service
being checked. Changing both expected and observed values until the test turns
green removes the check's ability to expose the wrong deployment.

The frontend supplies a `forge-build` metadata document. Its script then makes
a real browser request for backend identity. The visible build badge remains
the same in every scenario, deliberately making it insufficient evidence.
The alternate-destination scenario calls an API route on the frontend origin;
its identity body matches the expected API build. Checking only the response
body misses this misrouting.

Each identity contains application, environment, tenant, and build. Compare
every required field and both observed origins. Use exact URL origins rather
than a hostname substring; `localhost` and `127.0.0.1` are different origins.

## WB-01: prove which frontend and backend were exercised

**Starter:** `verifyTarget` in [helpers.starter.ts](helpers.starter.ts)  
**Reference:** `verifyTarget` in [helpers.ts](helpers.ts)  
**Acceptance cases:** [acceptance.ts](acceptance.ts)

Implement the typed helper and return `{ allowed, reasons, evidence }`.
Record the frontend metadata plus the URL, status, and body of the **actual
browser identity response**. Register observation before navigation and match
the session correlation token and endpoint. Do not filter observation to the
expected origin: the wrong-origin response is precisely the evidence you need.

Run only this assignment while developing:

```sh
npm run test:preflight:practice -- --enable-starters --grep WB-01
```

Thirteen independently registered controls require:

| Target scenario | Required decision |
| --- | --- |
| Correct release | Allow; no reasons |
| Stale frontend | `FRONTEND_BUILD_MISMATCH` |
| Stale backend | `BACKEND_BUILD_MISMATCH` |
| Misleading badge and wrong API origin | `BACKEND_ORIGIN_MISMATCH` |
| Another tenant | `BACKEND_TENANT_MISMATCH` |
| Another environment | `BACKEND_ENVIRONMENT_MISMATCH` |
| Another application | `BACKEND_APPLICATION_MISMATCH` |
| Malformed frontend identity | `FRONTEND_IDENTITY_FORMAT` |
| Malformed backend identity | `BACKEND_IDENTITY_FORMAT` |
| Frontend redirects to an unexpected origin | `FRONTEND_ORIGIN_MISMATCH` |
| Frontend reports another tenant | `FRONTEND_TENANT_MISMATCH` |
| Frontend reports another environment | `FRONTEND_ENVIRONMENT_MISMATCH` |
| Frontend reports another application | `FRONTEND_APPLICATION_MISMATCH` |

All these targets still return successful health checks. The acceptance suite
checks the actual destination recorded in evidence and confirms that identity
verification made zero business writes. A helper that denies everything fails
the valid-release control.

**Investigation deliverable:** write five lines containing the expected release,
observed frontend identity, observed API identity and URL, exact mismatch, and
whether a business action was reached. Explain why increasing the locator
timeout cannot repair this mismatch.

## WB-02: keep different failures diagnostically distinct

**Starter:** `checkDependency` in [helpers.starter.ts](helpers.starter.ts)  
**Reference:** `checkDependency` in [helpers.ts](helpers.ts)

This assignment is a separate dependency probe, not an implicit part of WB-03.
Implement one GET with no automatic request retries and a finite timeout.
Return the typed classification plus safe URL, status, code, and request ID.
HTTP errors remain responses to inspect; a connection reset has no usable HTTP
status or response request ID.

| Actual evidence | Required kind |
| --- | --- |
| 200, `ready: true`, request ID | `ready` |
| 503, documented `DEPENDENCY_UNAVAILABLE`, inventory dependency, request ID | `dependency-unavailable` |
| 500, `PRICE_CALCULATION_FAILED`, request ID | `unexpected-response` |
| 200, malformed `ready` value | `unexpected-response` |
| Server destroys the connection before replying | `transport-error` |

The unexpected 500's code is evidence; it does not establish which code,
database, or dependency caused the fault. The documented 503 has a narrower
meaning because this fixture defines it explicitly. A generic 503 in an
unrelated system would need that system's contract before this classification.

Every case verifies exactly **one probe** and zero business writes. This catches
an automatic retry that makes the observed request counts misleading. The
reference uses `maxRetries: 0`, `maxRedirects: 0`, a request timeout, and
`failOnStatusCode: false`. It validates the response body at runtime and
disposes the API response after reading it.

Do not attach an unrestricted error object or the whole environment to a report.
Request logs may include authorization headers. The fixture saves only synthetic
URLs and specific safe fields; its transport result records the category and
absence of a response rather than copying raw request logs.

**Investigation deliverable:** assign each of the five outcomes a next action.
For example, inspect the known dependency for the documented 503, preserve the
application request ID for the unexpected 500, and investigate transport for the
reset. Identify which conclusions remain unproven.

## WB-03: prevent the first wrong-target write

**Starter:** `runGuardedOrder` in [helpers.starter.ts](helpers.starter.ts)  
**Reference:** `runGuardedOrder` in [helpers.ts](helpers.ts)

Check the complete identity decision before clicking **Place training order**.
On denial, return the decision and `order: null`. On the accepted target,
perform one action, require 201, and return its actual order.

You may use the completed reference `verifyTarget` while focusing on this
assignment, then replace it with your own WB-01 helper. The exercise is the
sequencing and observable effect, not rewriting identical identity comparisons.

Three controls require:

1. A stale backend produces its build-mismatch diagnosis and **zero attempted
   and persisted order writes**.
2. A misrouted API produces its origin-mismatch diagnosis and the same empty
   ledger.
3. The correct target produces exactly one `TRAINING-1` order with item
   `release-check` and quantity `1`.

Read the independent ledger before cleanup. A correct error message after an
order already reached the server is a failed guard. A guard that always blocks
is also wrong, which is why the valid control matters.

**Investigation deliverable:** show the denied and accepted ledgers, and describe
where a real project would place this prerequisite: for example a deployment
validation job or a fixture that every mutating suite depends on. Explain how
a later deployment change could invalidate an earlier check.

## Grade your implementation, then challenge the suite

Once all three helpers are implemented:

```sh
node workplace/preflight/run.mjs --practice --prove
```

This enables the learner helpers and requires **all 21 cases** to pass without
skips, retries, expected-failure annotations, missing cases, or runner errors.
Filtered proofs are refused. The ordinary practice command accepts `--grep`
for development. Grading uses the same behavioral contracts as the reference;
it does not silently substitute the worked helper for yours.

The reference proof:

```sh
npm run test:preflight:proof
```

first requires the intact 21-case control, then replaces one helper at a time
with a deliberately weak implementation:

| Mutation | Expected exact failures |
| --- | --- |
| Trust a responsive target instead of comparing identity | Twelve `WB-01_IDENTITY` failures |
| Relabel every non-ready outcome as dependency unavailable | Three `WB-02_CLASSIFICATION` failures |
| Place the order before checking identity | Two `WB-03_WRITE_GATE` failures |

Each experiment still runs the complete inventory, so unaffected positive cases
must remain green. Missing cases, a broken server, an unrelated timeout, and a
different assertion failure invalidate the proof. Every checked outcome needs
a fresh trace and its diagnostic JSON attachment. The proof's expected red runs
test the test suite; do not copy their exit-code exception into a release gate.

The probe, identity comparison, and action guard are deliberately separate
helpers. An ungraded extension is to combine identity and required dependency
readiness into one gate, then add both dependency-denial and valid-write controls.
Do not claim that combined contract based on the current WB-03 cases.

## What this evidence does and does not establish

This is application-reported identity, not a signed software supply-chain
attestation. A lying endpoint could claim the expected build. The browser
response URL establishes the request's observed origin, not the invisible
upstream selected behind a reverse proxy. Real release checks may also need
signed metadata, cache/service-worker analysis, rollout consistency, and
deployment-platform evidence.

One successful preflight is a point-in-time observation. It cannot freeze a
load-balanced fleet or guarantee that every subsequent request reaches the same
revision. A production system needs a reviewed policy for rolling deployments,
compatible versions, allowed origins, tenancy, and where business writes are
permitted. This local lab has synthetic data and does not test those systems.

## Official reading

- [Observe responses with `page.waitForResponse`](https://playwright.dev/docs/api/class-page#page-wait-for-response):
  register the observation before triggering the browser action.
- [API request context](https://playwright.dev/docs/api/class-apirequestcontext):
  inspect response statuses and explicit retry/timeout controls.
- [Fixtures](https://playwright.dev/docs/test-fixtures):
  express owned setup and teardown around an isolated test.
- [Web-server configuration](https://playwright.dev/docs/test-webserver):
  server readiness helps start the suite; it does not identify the intended
  application release.
