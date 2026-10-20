# Lost-response recovery: a write can succeed even when the client sees failure

Lesson **04-07** contains three assignments: **LR-01**, **LR-02**, and **LR-03**. These assignments produce **ten independently registered worked tests**. A rejected Playwright request is evidence that the client did not receive a usable response. It does not establish that the server rolled back.

This lab starts its own loopback service on port **14842**. It creates synthetic orders only. Each test supplies a fresh `x-lab-session`, so parallel tests own independent orders, idempotency ledgers, and journal files. The academy shop is a separate application.

## Run and inspect

```sh
npm run test:recovery
npm run test:recovery:practice
npm run test:recovery:practice -- --enable-starters --grep LR-01
npm run test:recovery:proof
```

The default practice command lists **three intentionally skipped assignments**. Enabling an unfinished assignment must fail with `LR-0x_STARTER_NOT_IMPLEMENTED`. A green skipped run is not a completed assignment. Edit [helper.starter.ts](helper.starter.ts) and [practice.spec.ts](practice.spec.ts), keeping independent business assertions in the specs. Do not import the worked recovery functions to complete a starter.

Worked reference: [helper.ts](helper.ts), [worked.spec.ts](worked.spec.ts). The proof is deliberately strict about the unchanged shipped starter inventory; after implementing your own starters, run your practice cases directly and use the controlled challenges below. Restore the original starter files before rerunning the shipped full proof.

Each invocation writes a new `quality-results/recovery/run-*` directory with source hashes, console output, Playwright JSON, traces, and journals. Open a trace with `npx playwright show-trace <absolute-trace-path>`. The `persisted-journal` attachment is read back from disk after the test; it is available even when an assertion fails.

## Protocol you can test

All non-health endpoints require `x-lab-session`. Business endpoints also require `x-customer: alice` or `bob`. These are synthetic identity selectors, **not an authentication or authorization implementation**.

| Operation | Contract |
| --- | --- |
| `POST /orders` | Requires `Idempotency-Key` (1–100 ASCII letters, digits, or hyphens), JSON `{ "sku": "headphones", "quantity": 1 }`. Quantity is an integer 1–3; extra/missing fields are rejected. A new order returns 201, `Idempotency-Replayed: false`, exact order body. Unit price is 12900 minor currency units. |
| Equivalent replay | Same customer + same key + equivalent normalized payload returns **200**, `Idempotency-Replayed: true`, and the original order body. JSON property order is immaterial. |
| Conflicting replay | Same customer + same key + changed quantity returns **409** `{ "error": { "code": "IDEMPOTENCY_CONFLICT" } }`. Existing orders and the stored original result remain unchanged. |
| Independent intent | Another key for the same customer creates another order. The same key for another customer also creates another order. Scope is `(lab session, customer, key)`. |
| `GET /attempts/:key` | Customer-scoped lookup: `{state:"committed",order}`, `{state:"pending"}`, or `{state:"absent"}`. `pending` means visibility is unresolved. In this synthetic protocol, `absent` is authoritative for an unused key within this running service. |
| `GET /orders` | Returns `{orders:[...]}` for the selected customer. |
| Invalid order / missing key | 422 `INVALID_ORDER` / 400 `IDEMPOTENCY_KEY_REQUIRED`. HTTP rejection is a distinct outcome from transport loss. |
| `POST /__control` | Test-only injection: `{dropNextCommit:true,visibility:"immediate"|"pending"|"pending-once"}`. Optional `dropReplies:2` loses both the commit response and its replay response; otherwise the shorthand loses just the next commit response. |
| `GET /__evidence` | Test-only oracle: actual write/lookup counts, complete orders, activated fault name, and the append-only journal read back from disk. Never use this endpoint as an ordinary customer API. |

For the controlled loss, the server validates the request, creates the order, records the ledger, flushes a `committed` journal event, flushes `reply-lost-after-commit`, and **then flushes an incomplete response body and destroys the socket**. The client cannot receive a complete usable result. A bare close before any response bytes can cause a browser to retransmit transparently, so truncation makes the intended client-visible failure deterministic. `page.route().abort()` before a server write would demonstrate a different failure.

The test API calls use **`maxRetries: 0`**, so the helper’s two explicit POST attempts are observable. Playwright test retries are also disabled. The browser makes one fetch per explicit button click and keeps the original intent key for the retry.

## LR-01 · Recover the intent, not just the request

Implement `recoverOrder` with at most **two** transport attempts. Allocate the key once, outside the retry loop. Reuse it with an unchanged payload. HTTP 409/422 must surface as a rejection; do not turn all exceptions and all HTTP statuses into another write.

Deliver four separately registered tests:

1. After-commit loss → a second POST with the **same key** returns `REC-001`, Alice, headphones, quantity 1, total 12900. Assert two write attempts, one persisted order, one commit, one replay, and commit before response loss.
2. Browser purchase → visible uncertain outcome → “Retry same purchase” → exact confirmation. Assert the original Buy button is disabled, the retry button disappears after success, both attempted writes share one nonempty key, and there is only one order.
3. API exhaustion: configure `control(request, 'immediate', true, 2)`. The commit reply and the replay reply both disappear. The helper throws `RECOVERY_UNCERTAIN` after exactly two same-key attempts, with one commit and one complete original order. It must not send a third POST or return success.
4. Browser exhaustion: lose the same two replies. After the explicit retry the page says the outcome is still unknown, hides Retry, and leaves Buy disabled. Prove exactly two attempts and the one expected persisted order. An unavailable confirmation does not permit a fresh purchase.

Weak oracle: “The retry returned 200.” Stronger oracle: “The customer owns exactly the one intended order, at the independently expected price, and both attempts belong to that intent.”

Challenge:

```sh
npm run test:recovery -- --defect=dedupe-off --grep "LR-01 API"
npm run test:recovery -- --defect=regenerate-key --grep "LR-01 API"
```

Both commands intentionally exit nonzero at `LR01_SINGLE_EFFECT`. The first disables the server ledger check; the second is an explicit broken-client counterexample in the worked spec. `regenerate-key` does **not** automatically mutate learner code: implement and temporarily try that bad policy in your own helper to test your oracle. Server faults such as `dedupe-off` apply equally to enabled practice tests.

## LR-02 · Prove the complete idempotency contract

Register **three** tests: equivalent replay, conflicting payload, and scope controls. Assert exact statuses and error codes; preserve the entire original order after conflict. Also send conflicting input through your recovery helper and prove its HTTP rejection causes only one write attempt, not a transport retry. Test customer scoping and distinct valid keys so a server that deduplicates everything does not pass.

```sh
npm run test:recovery -- --defect=conflict-accepted --grep "LR-02 conflict"
```

This deliberately broken service returns the original order for a changed quantity. An order-count-only test would stay green. The independent conflict oracle must fail at `LR02_CONFLICT_STATUS`.

Interview discussion: Where does the key live across application restarts? How is the request fingerprint normalized? Does the key expire before a mobile client retries? Are concurrent identical requests serialized? Does a replay return the original status or a documented replay status? What does a conflict mean to the user?

## LR-03 · Reconcile an uncertain outcome without more writes

Implement a **GET-only** helper with a budget of three reads. Stop immediately on `committed` or authoritative `absent`; return `{state:"uncertain",lookups:3}` if all reads remain pending. `uncertain` is a result that requires follow-up, not a manufactured success or permission to start another intent.

Register **three** tests:

1. The response is lost after a real commit and lookup remains pending. Exactly three reads, one POST, one stored order; return uncertain.
2. Visibility is pending for the first read and committed on the second. Return the exact original order after two reads and no second write.
3. An unused key returns authoritative absent on the first read, with zero writes and zero orders.

```sh
npm run test:recovery -- --defect=false-absence --grep "LR-03 uncertain"
npm run test:recovery -- --defect=unbounded-lookups --grep "LR-03 uncertain"
```

These intentionally fail `LR03_BOUNDED_UNCERTAIN`. The second is a controlled client counterexample requesting a fourth lookup; it tests the numerical budget without hanging CI. The demo advances visibility by observed reads, so these tests need no hard sleep. In a production client, use an elapsed-time deadline, bounded attempts, documented pacing/backoff, cancellation, and a policy for HTTP errors and `Retry-After`.

## Guarantees and deliberate limits

The ledger lives **only for the current service process**. It has no expiration during that process, but a restart loses the lookup/replay state. The on-disk journal is diagnostic evidence; the server does not replay it on startup. This lab does not establish crash-safe atomic persistence, multi-process locking, exactly-once delivery, or an all-purpose guarantee that adding a header makes a write safe.

The browser retains its key only while this page stays open. Reload/tab-close recovery and secure durable storage of an intent key are useful extensions, not supplied behavior. Real systems need retention limits, durable key ownership, atomic effect+ledger commit, concurrent duplicate controls, an authoritative reconciliation path, and a support workflow for unresolved outcomes. A failed status lookup or a stale eventually consistent `404` must not be casually treated as proof that no write occurred.

The two-POST recovery policy is valid only because this particular service documents idempotent replay. Do not copy it onto a payment, email, or reservation endpoint that lacks the same contract. The bounded reconciliation lesson is useful precisely when success cannot yet be established.

## Completion rubric

Produce ten independent, discoverable tests from the three starter assignments; exact business outcomes; actual commit-before-loss evidence; exhausted two-attempt controls in API and browser; no hidden Playwright retries; no polling writes; replay/conflict/scope controls; and defect runs that fail the intended assertion. Explain an unresolved purchase to a user without advising a fresh purchase that might duplicate it.
