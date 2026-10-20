# API testing: contracts, clients, and evidence

Use this workbook to turn an endpoint list into experiments that detect wrong
data, partial mutations, leaked sessions, and misleading client behavior. The
first six lessons use the local Forge Shop. Its [API contract](lab-api.md) defines the
expected application behavior; Playwright's documentation defines the client.
This is original practice material, not a replacement for either reference.

## An eight-lesson learning route

Complete the basic TypeScript and asynchronous-code lessons first. Each row
below ends with observable evidence, rather than a list of methods to memorize.

| Lesson | Question to answer | Executable practice |
| --- | --- | --- |
| 04-01 · HTTP as a testable contract | Can a successful response still contain the wrong data? | EX-09, EX-16; then AP-01 |
| 04-02 · Query parameters, sorting, and invariants | Does filtering exclude unrelated products and preserve meaningful ordering? | EX-10 |
| 04-03 · Mutations, invalid input, and unchanged state | Did a rejection preserve the state that existed before it? | EX-11, EX-12, EX-16; then AP-02 |
| 04-04 · Authentication and session boundaries | Who is signed in, and whose data does a request address? | EX-13, EX-15; then AP-03 |
| 04-05 · Hybrid testing and order invariants | Which business facts must survive cart changes and a second purchase? | EX-14, EX-17; then AP-04 |
| 04-06 · Request controls, response ownership, and safe retries | Did the server reject a request, did the client fail, or was a resource already disposed? | AP-01 |
| 04-07 · Recover a lost reply without duplicating the write | What committed when the client received no usable reply? | LR-01–03 |
| 04-08 · Observe asynchronous jobs without creating more work | Did the correct job finish, fail, or remain uncertain? | AJ-01–03 |

Lessons 04-07/08 use **separate local services** in `workplace/recovery/` and
`workplace/jobs/`. Their explicit contracts, enable flags, and proof limits are
in the [systems workbook](REAL-WORLD-SYSTEMS.md). These do not add idempotency or
asynchronous jobs to the original shop. The API track maps 18 assignment IDs:
EX-09–16, AP-01–04, LR-01–03, and AJ-01–03. Run `npm run test:recovery` and
`npm run test:jobs` for the new reference suites. Their starters use
`--enable-starters`, rather than editing the registered skip condition.

Begin with [Playwright's API testing guide](https://playwright.dev/docs/api-testing).
Use the [APIRequestContext reference](https://playwright.dev/docs/api/class-apirequestcontext)
for request options, and the [APIResponse reference](https://playwright.dev/docs/api/class-apiresponse)
for reading and releasing responses. Check `npx playwright --version` when
comparing online documentation with the installed project.

## Run a small, focused experiment

The hosted portal contains the lessons and download. Real requests run against
the local server in the extracted project. The test runner starts it when needed.
Use an unused `PORT` if another application already occupies 4173; set the same
value for both your manual server and test command.

```bash
npm ci
npm run test:api
npm run test:solutions -- --grep "EX-09"
npm run test:api:workshop
npm run test:api:practice -- --list
npm run test:report
```

The four new starters are in `api-workshop/practice.spec.ts`; corresponding
solutions are in `api-workshop/worked.spec.ts`. Existing EX-09–16 remain in
`exercises/02-api.spec.ts` and `solutions/02-api.spec.ts`. EX-17 lives in their
`03-advanced.spec.ts` counterparts and needs the installed Chromium browser.
The API-only exercises do not need a browser page.

1. Read one starter and predict the expected observations.
2. Implement its TODOs, replace its failing sentinel with real assertions, and remove `.skip`.
3. Run that ID; inspect the first unexpected observation.
4. Compare the worked example only after making your own attempt.
5. Explain a defect your assertions reject, then perform one controlled challenge.

```bash
npm run test:exercises -- --grep "EX-12"
npm run test:api:practice -- --grep "AP-01"
npm run test:api:workshop -- --grep "AP-01"
```

A skipped starter is unfinished work. A passing worked example demonstrates
the supplied solution, not that you have completed the assignment.

## Separate shape from meaning

Read a response in four layers: exact expected status, usable media type,
runtime structure, and independent business values. A parsed object is not
automatically a valid product. A TypeScript cast or a typed callback parameter
cannot validate incoming JSON.

This fragment belongs inside a test using the repository's `request` fixture:

```ts
const response = await request.get('/api/products');
expect(response.status()).toBe(200);
expect(response.headers()['content-type']).toContain('application/json');
const body = await response.json();
expect(Array.isArray(body.products)).toBe(true);
expect(body.products).toHaveLength(6);
expect(body.total).toBe(6);
expect(body.products).toContainEqual(expect.objectContaining({
  id: 'p2', name: 'Mechanical Keyboard', category: 'Desk', price: 8900,
}));
for (const product of body.products) {
  expect(Number.isInteger(product.price), `price for ${product.id}`).toBe(true);
  expect(product.price).toBeGreaterThan(0);
}
```

The exact six-product count is appropriate for this fixed teaching catalog.
For a changing production catalog, choose a supported invariant and controlled
test data instead. A nonempty check prevents a sort comparison from passing
because both lists are empty. Sort a copy of the observed array; sorting the
original before comparison can make an assertion compare a value with itself.

An independent money oracle starts with chosen quantities and known unit prices.
For two p2 items: `8900 * 2 = 17800`, SAVE10 gives `1780`, and the total is `16020`
cents. Do not derive the expected total from the response's total. All current
catalog prices are whole-dollar amounts, so these examples do not exercise a
half-cent rounding boundary. The contract still specifies `Math.round`.

## Rejections must preserve something worth protecting

An empty cart is a weak control for a bug that erases an existing cart. Seed a
known cart, apply a valid promo where relevant, and check the setup responses.
Capture the complete cart before the rejected operation. Check the exact status,
stable `error.code`, a nonempty human message, and the cart immediately afterward.
Do not insert a reseed or reset that could hide damage.

| Controlled request | Expected observation |
| --- | --- |
| p1 quantity `0`, `-1`, `1.5`, `"2"`, or `100` | `400 INVALID_QUANTITY`; seeded cart unchanged |
| p1 quantity `13`, or p5 quantity `1` | `409 INSUFFICIENT_STOCK`; seeded cart unchanged |
| An unknown product with an otherwise valid quantity | `404 PRODUCT_NOT_FOUND`; seeded cart unchanged |
| Unknown promo on an already discounted cart | `422 INVALID_PROMO`; existing promo and totals preserved |
| Filled guest cart with valid shipping | `401 AUTH_REQUIRED`; cart preserved; no order after signing in to inspect history |
| Signed-in customer, filled cart, invalid city | `422 INVALID_ADDRESS`; cart and history preserved |

Give each parameterized case its own test and session. Distinct errors deserve
distinct names. A request with several invalid fields may reach a different
validation branch than the one you intended to test.

## HTTP responses and client failures are different observations

A returned 400 is an HTTP response whose body can explain an application
rejection. A request timeout or connection failure rejects the request promise;
there is no returned `APIResponse` to interrogate. A timeout also does not prove
that the server rolled back a mutation.

`failOnStatusCode: false` preserves error responses for contract assertions.
With `true`, statuses outside 2xx/3xx reject the promise. AP-01 uses a read-only
guest order-history request to compare policies without ambiguous side effects.
`response.ok()` and `expect(response).toBeOK()` concern HTTP success, not body
correctness; neither issues another request. See [response assertions](https://playwright.dev/docs/api/class-apiresponseassertions).

| Mechanism | What it controls | What it does not establish |
| --- | --- | --- |
| Request `timeout` | The budget for that request; set a finite value deliberately | Whether a timed-out mutation committed |
| Request `maxRetries` | Supported network retry behavior; currently `ECONNRESET` | Automatic retries for HTTP 400, 429, or 500 |
| Playwright test retries | Re-execution of a failed test attempt | The safety of repeating a purchase |
| `expect.poll` | Repeated execution of your observation callback | That a mutation belongs inside that callback |

For a service that explicitly promises asynchronous completion, a design might
allow a 1-second GET request budget, a 5-second observation budget, and a 15-second
test budget. The actual request work consumes time too; budget setup and cleanup
separately and inspect the runner's behavior. These example budgets are not a
performance requirement for Forge.

Forge commits its cart and order changes before responding. Assert the immediate
postcondition here. Lesson 04-06's polling exercise is a design review: move the
POST out of the callback, submit once, then consider bounded read-only observations
only where the real service contract requires them. Forge has no idempotency-key
contract. Repeating a timed-out order request cannot be declared safe by adding
an arbitrary header or enabling retries.

## AP-01: response policy and resource lifetime

Read the starter before opening the solution. Create an owned standalone request
context with `timeout: 5000` and `failOnStatusCode: true`. As a guest, request
`GET /api/orders` with a per-request `failOnStatusCode: false` override. Inspect
`401 AUTH_REQUIRED`, JSON media type, and a nonblank error message. Repeat without
the override: it must reject for HTTP 401, not an unrelated JavaScript error.

Sign in, read `/api/session`, dispose that response, and show that its body is
no longer available. Another successful session request proves the context
still works. Save its storage state in memory, dispose the context with an
explicit reason, and prove a further request rejects with that reason. A new
observer using the saved state must remain signed in: client disposal is not
logout. Protect both client lifetimes with `finally`; do not print the snapshot.

Acceptance: distinguish a released response body from a released client, retain
the successful live-client control, and identify the observed error in each
negative case. Do not make a generic catch block count every exception as success.

Challenge: temporarily remove the session response's `dispose()` call. The
assertion requiring `response.body()` to reject must fail. Alternatively dispose
the whole context there: the next live-client request must fail. Restore the
boundary and rerun. These are client-lifecycle faults, not server rejections.

## AP-02: raw JSON, byte boundaries, and atomic rejection

Playwright serializes an object passed as `data` to JSON. Raw strings and buffers
let you send malformed input; specify `Content-Type: application/json` for this
experiment. Forge parses JSON bodies but does not enforce a separate media-type
allowlist, so this exercise must not invent a `415` response.

Seed p2 quantity two with SAVE10, total 16020. Preserve the full discounted cart
across malformed JSON and non-object JSON such as `null` or `[]`. Expect
`400 INVALID_BODY`. Construct a valid p2 quantity-two request of exactly
16,384 UTF-8 bytes by adding a padding property. It must succeed and preserve
the same cart. Compare that cart again after testing each oversized body.

Use `Buffer.byteLength(text, 'utf8')`, not JavaScript string length. A body with
many `界` characters can be below the limit in characters while exceeding it in
bytes. Both a one-byte overflow and the multibyte overflow must produce
`413 INVALID_BODY` without changing the previously accepted cart. Finally set
p2 quantity one and verify a valid write still works: discount 890, total 8010.

Acceptance: assert the constructed sizes, successful exact-boundary setup,
specific error codes, and unchanged full cart after each rejected request.
The response contains an error envelope; the malformed request is not itself
the response parser's input.

Challenge: in a disposable copy of `server.mjs`, replace `bytes += chunk.length`
with `bytes += chunk.toString('utf8').length`. Keep the test unchanged. The
multibyte case must fail its 413 assertion. A setup crash is not evidence that
this oracle works. A separate mutation that clears the cart or promo on rejection
must fail the unchanged-cart comparison.

## AP-03: text receipts and session-local ownership

Customer A buys one p1 for $129.00. Derive the receipt path from its returned
order ID. Assert status, text media type, attachment filename, and receipt content
using `.text()`. A successful receipt is not JSON. Its total and purchased item
must match independent expectations from the input data.

Use another independent context. Before sign-in its receipt request must return
`401 AUTH_REQUIRED`. After sign-in, before making its own purchase, the same ID
must return `404 ORDER_NOT_FOUND`. Now create that customer's order: both fresh
sessions may legitimately contain `ORD-0001`. Customer B buys one p4 for $59.00.
Each receipt must describe its own purchase and omit the other product and total.
After A logs out, A receives 401 while B remains signed in with its own receipt.

Acceptance: the owner succeeds, guest and missing-order controls fail for their
specific reasons, overlapping IDs do not leak the other purchase, and every
manually created client is disposed even if the test fails.

Challenge: temporarily replace the second customer's receipt path/client pair
with the first customer's client. The second purchase's item or total assertion
must fail. Keep the expected purchases unchanged and restore the client afterward.

## AP-04: an order survives the next purchase

Buy two p2 items with SAVE10: subtotal 17800, discount 1780, total 16020.
Assert its items, quantities, subtotal, discount, total, shipping, and persisted
identity against the chosen inputs.
Check the emptied cart, including cleared promo state. Save the first order's
business snapshot before building a different cart and placing a second order.

Buy one p4 for 5900 with shipping city Warsaw. Read history again: it must contain
`ORD-0001` and `ORD-0002` with the saved identities and snapshots. The first order
must stay unchanged; the second must contain its own items and shipping without
inheriting the promo. Validate both ISO timestamps and the empty final cart.
The first receipt must still show Mechanical Keyboard x 2 and $160.20. Another
checkout while empty must return `409 EMPTY_CART` and leave both orders intact.

Acceptance: an initial POST-to-GET comparison is only the starting control.
Evidence must include the later mutation and second purchase, independently
computed values, both persisted orders, and empty final cart/promo.

Challenge: in a disposable server copy, insert this line immediately before
`state.orders.push(order)`: `for (const previous of state.orders) previous.items = cart.items;`.
This deliberately overwrites the first order's items during the second purchase.
The history comparison must reject it. Retain the failure, remove that exact
temporary line, and rerun without editing assertions.

## Own clients, sessions, and evidence separately

The repository fixture shares one unique `x-lab-session` header between its
browser and request clients. That is explicit server-state selection, not proof
that the request fixture shares the browser's cookie jar. `page.request` is the
browser-associated client; a standalone client owns separate cookie storage.
Use FS-08 and the [fixtures and state workbook](FIXTURES-AND-STATE.md) for that
comparison. Clear inherited headers and copied authentication for a guest control.
The AP specs deliberately use the base runner with empty headers and storage
state, so their independent customers exercise cookie sessions instead.

A session header is a local testing convenience, not secure identity or a
production authorization design. Clients that send the same chosen header can
address the same lab state. Browser isolation does not change that server rule.

Disposing a response releases its retained body. Disposing an owned request
context releases its resources. Neither deletes server carts or orders. An owned
`POST /api/reset` changes this lab's server state, including authentication and
history; do it before disposal if cleanup requires it. Never reset another test's
session. Let Playwright release its built-in test fixture; own manual clients in
`try/finally`.

For each completed exercise, retain the command, test ID, relevant request
method/path, expected versus actual status or client error, and before/after
business values. Avoid logging cookies, authorization headers, or storage-state
bodies. Record the controlled fault, exact rejected oracle, and restored passing
run. Restore only your temporary edit; do not discard unrelated working changes.

The four AP drills cover concrete local client and contract boundaries. Form
uploads, redirects, OAuth, load testing, asynchronous jobs, and idempotency keys
need a different application contract before they become executable claims.
