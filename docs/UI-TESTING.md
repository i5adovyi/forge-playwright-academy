# UI testing: actions, transitions, and trustworthy evidence

Use this workbook beside **UI testing track** in the portal. The target is the
local Forge Shop at `/lab/`. You will test what the customer can do, what they
see after an action, and whether the resulting state is correct. The
[shop contract](lab-api.md) supplies independent data and business expectations.

The hosted portal contains the lessons and downloads. Browser exercises run
against the Node server in the extracted project. The test runner starts that
server when needed; a static hosted page cannot supply its live API.

## Follow the eleven-lesson route

Complete the foundation lessons on TypeScript, promises, and test design first.
Use this order when studying UI as a focused track:

| Lesson | Evidence you should be able to produce | Practice |
| --- | --- | --- |
| 02-01 · First meaningful browser test | A known product and usable purchase control | EX-01 |
| 02-02 · Locators that survive change | Correct scope and controls that still resolve after a render | EX-02, EX-05, EX-06 |
| 02-03 · Forms, validation, and authentication | Native validation, server rejection, and successful correction | UI-01 |
| 02-04 · Search, filters, and collections | Exact membership, complete order, and empty-state recovery | EX-02–04 |
| 02-05 · Customer journey with real evidence | Cart, visible confirmation, and the same persisted order | EX-06–07, EX-17, UI-02 |
| 03-01 · Auto-waiting and race conditions | A completed operation and its rendered result | EX-07, EX-23 |
| 03-02 · Controlled network failures | Intentional error/empty responses and working recovery | EX-18–19 |
| 03-03 · Browser isolation and sessions | Owned state, retained cart data, and deliberate reset | EX-24 |
| 03-04 · Events, downloads, and time | The right event plus useful file contents | EX-20; continue with the SK drills |
| 03-05 · Visual and accessibility judgment | A bounded keyboard interaction and usable narrow layout | EX-08, EX-21; continue with AX and VS |
| 03-11 · Prove transitions: failed saves and stale results | Preserved state after failure; a late response cannot overwrite newer intent | UI-03–04 |

The track has 20 executable assignments. It links to the broader browser,
accessibility, visual, and fixtures workshops where their evidence is needed.
It does not make every topic part of one large checkout test.

## Run one assignment at a time

From the repository root:

```bash
npm ci
npm run browsers
npm run test:ui
npm run test:ui:workshop
npm run test:ui:practice -- --list
npm run test:report
```

If 4173 is occupied, choose an unused port. For example, on macOS/Linux use
`PORT=14827 npm run test:ui:workshop`; in PowerShell set
`$env:PORT=14827` before the command. Use the same port if you start a manual
server with `npm run dev`.

| Assignments | Starter file | Worked solution |
| --- | --- | --- |
| EX-01–08 | `exercises/01-foundations.spec.ts` | `solutions/01-foundations.spec.ts` |
| EX-17–24 | `exercises/03-advanced.spec.ts` | `solutions/03-advanced.spec.ts` |
| UI-01–04 | `ui-workshop/practice.spec.ts` | `ui-workshop/worked.spec.ts` |

1. Read the starter and write down the expected observations before coding.
2. Implement its TODOs, replace the failing sentinel, and remove `.skip` from
   that assignment only.
3. Run its ID. Inspect the first unexpected observation before changing code.
4. Compare the worked solution after your attempt.
5. Introduce one relevant defect, demonstrate the expected failure, restore the
   application, and rerun the unchanged assertion.

```bash
npm run test:exercises -- --grep "EX-06"
npm run test:solutions -- --grep "EX-06"
npm run test:ui:practice -- --grep "UI-01"
npm run test:ui:workshop -- --grep "UI-01"
```

A skipped starter is unfinished learner work. A green worked solution is a
reference result, not proof that you completed its assignment. Keep a learning
log with the command, observation, defect detected, and remaining limit.

## Make the result harder to fake

| Weak observation | More useful evidence |
| --- | --- |
| Navigation completed | The intended product and purchase control are visible and usable |
| One search match exists | The exact collection contains only the expected products |
| First and last sorted items are right | The complete sequence matches independent expected names |
| The cart total looks right once | Chosen quantities, independent arithmetic, and persisted state agree |
| An error appeared | The expected failure occurred and the previous useful state survived |
| A recovery control exists | A customer can follow it and complete the original task |
| A second click left the same text | The second operation completed, then its result was checked |
| The latest result appeared before an old response arrived | It remains correct after the old response is processed |

For this fixed catalog, Desk in ascending price order is **Focus Lamp, Monitor
Arm, Mechanical Keyboard**. Headphones cost 12900 cents and the keyboard costs
8900 cents. Two headphones plus one keyboard give a subtotal of 34700 cents;
SAVE10 gives a discount of 3470 and a total of 31230. Calculate from these chosen
inputs rather than copying the application's total into the expected value.

Use role and label locators to describe intent. Scope repeated controls inside
their product article or named dialog. A locator resolves against the current
DOM when used; keeping a locator variable is appropriate across cart renders.
Keeping an `ElementHandle` to the old quantity input creates a different,
usually unwanted dependency. See the official
[locator guide](https://playwright.dev/docs/locators).

EX-06 reuses its quantity locator through changes and a page reload: check
quantity two, reopen after reloading, change to three and back to two, then
remove the item and verify it remains absent after another reload. Each quantity
needs its independently calculated total. Reading an input once with `inputValue()`
or checking `isVisible()` once does not provide the same retry behavior as
[locator assertions](https://playwright.dev/docs/test-assertions). Prefer
`toHaveValue`, `toHaveText`, and `toHaveCount` for eventual UI outcomes.

## Synchronize on the operation you actually triggered

An actionable button is ready for the attempted interaction. Its asynchronous
business operation may still be running after `click()` returns. The
[actionability guide](https://playwright.dev/docs/actionability) describes those
pre-action checks; they do not replace post-action evidence.

A changed total can identify completion of a quantity change. The second
SAVE10 application leaves the correct total unchanged, so checking that total
alone can pass before the second request finishes. Register a response waiter
before the action, match the endpoint and method, inspect the response, then
check the UI. If multiple similar requests can overlap, correlate the request
payload or another operation-specific identifier as well.

This fragment belongs inside a test after opening a populated cart and filling
its Promo code field with SAVE10:

```ts
const responsePromise = page.waitForResponse(response => {
  const request = response.request();
  return new URL(response.url()).pathname === '/api/cart/promo'
    && request.method() === 'POST'
    && request.postDataJSON()?.code === 'SAVE10';
});
await cart.getByRole('button', { name: 'Apply promo' }).click();
const response = await responsePromise;
expect(response.status()).toBe(200);
expect((await response.json()).total).toBe(31230);
// The second application leaves the old total unchanged. Reopen for a fresh
// server read; Forge opens the dialog only after rendering that cart response.
await cart.getByRole('button', { name: 'Close cart' }).click();
await page.getByRole('button', { name: 'Cart (3)', exact: true }).click();
await expect(cart).toBeVisible();
await expect(cart.getByTestId('cart-total')).toHaveText('$312.30');
```

This fragment assumes two headphones and one keyboard, hence Cart (3).
Reading the response body proves that body arrived, not that every application
callback finished. EX-07 follows the response with this refreshed-cart check.
When the expected UI is
already present before a delayed event, you also need evidence that the event
has reached the part of the application you are challenging, as in UI-04.
The official [network](https://playwright.dev/docs/network) and
[events](https://playwright.dev/docs/events) guides show listener-before-action
patterns. A fixed sleep or generic `networkidle` wait does not identify the
particular transaction.

## UI-01: distinguish native validation, rejection, and correction

Open the login dialog. Start with an empty required email while supplying a
password. Submit through the real button. Observe the email's
`validity.valueMissing`, the form's invalid event, and the absence of a submitted
login operation during that completed attempt. Do not hardcode a browser's
localized validation bubble.

Then fill `demo@forge.test` with a deliberately incorrect password. Arm the
login-response waiter before submitting. Assert HTTP 401, visible feedback about
incorrect credentials, preserved email, an available submit button, and
`user: null` from `/api/session`. Correct the password to `Playwright123!`,
submit again, and prove the dialog closes, Sign out appears, and the session
identity is the expected demo user.

The native check is a bounded observation of this form submission, not proof
that no request can ever occur. Record the browser validation event and keep
the wrong-password request as a positive control for the request observer.
Read [HTML constraint validation](https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Constraint_validation)
to distinguish required/type validation from a server's authentication policy.

Acceptance: all three states are visible in the test, rejection does not create
an authenticated session, and correction succeeds without reopening or
reloading the dialog. A test that ends after displaying “incorrect” has not
tested recovery.

Controlled challenge: temporarily remove `required` from the login email in
`lab/index.html`. The required-field evidence must fail. Restore it before
trying another defect; increasing the timeout cannot repair missing validation.

## UI-02: complete the guest's recovery journey

Begin as a guest, add Studio Headphones through the UI, and apply SAVE10. Check
the independently calculated $116.10 total. Attempt checkout and verify the
instruction to sign in while the cart and discount remain intact. Follow that
instruction through the visible UI: close the cart, open Sign in, authenticate,
then reopen the cart. Verify the same items, quantities, and independently
calculated total before continuing.

Complete the shipping form with the synthetic data in the shared fixture.
Observe the order POST, assert its 201 status and expected order contents, and
match its ID to the visible confirmation and receipt link. Read order history
to prove there is exactly one corresponding order; inspect the cleared cart.
API reads are supporting evidence for the purchase the UI performed.

Acceptance: denying a guest is only the first step. No reset or reseed between
denial and success may hide lost cart data. Preserve the distinction between
authentication and the customer's cart. The shop's `request` and `page` fixtures
select the same server session through `x-lab-session`; this is deliberate
fixture configuration, not a claim that separate API clients share cookies.
See [fixtures and state](FIXTURES-AND-STATE.md) for the cookie-only experiments.

Controlled challenge: temporarily make successful `POST /api/login` clear the
session cart or its promo where it should preserve them. The
post-login cart assertions must reject the defect before checkout. Restore the
implementation and verify the same test succeeds.

## UI-03: preserve a failed save, then retry once

Arrange a signed-in shopper and known cart, open checkout, and fill all shipping
fields. Intercept exactly the next order POST with a contract-shaped HTTP 503
response. Do not forward that intercepted POST to the real server.

After the failure, verify the checkout remains open, the message explains the
failure, all entered shipping values remain, Place order is enabled again,
the cart is unchanged, and order history is empty. A visible error alone
cannot reveal a form that erased the address or a hidden purchase.

The worked example's `{ times: 1 }` route expires after that interception.
Submit again through the UI. This time the real server must return 201. Match
the returned order to the confirmation,
known items, money, and shipping; require exactly one persisted order and an
empty cart.

Acceptance: the failed attempt preserves useful work; the successful retry
uses that retained work; the test distinguishes two attempts from one purchase.
Limit the route to the intended method/path. This route belongs to the test's
page and is removed when its context closes; explicitly release any held
handlers in your own variants. A permanently mocked success cannot demonstrate
persisted recovery.

This experiment deliberately prevents the first POST from reaching the server.
It does not establish that retrying a timed-out purchase is safe. A transport
failure can leave an uncertain server outcome; Forge has no idempotency-key
contract. Continue with [API testing](API-TESTING.md) for that distinction.

Controlled challenge: in the local checkout error branch, reset the form
before showing the error. The retained-field assertions must fail. Restore the
branch; do not repair the test by refilling every field before retrying.

## UI-04: newer intent wins over an older response

The catalog can issue overlapping reads as filters change. Hold a real Desk
response behind a controlled gate, then choose Video and allow that response
through. Assert the complete Video result: **4K Webcam**, not merely one card.
Release the older Desk response afterward. Establish that the old result was
delivered and processed before asserting that Video remains selected, the
result still contains only 4K Webcam, and the current request is no longer busy.

The gate creates a known order of events without guessing how many milliseconds
a machine needs. Start the observer before the request and release the gate
in cleanup even if an assertion fails. Inspect the worked example's completion
probe: it wraps the catalog response's `json()` and schedules a browser message
after parsing. The message task runs after the application's awaiting promise
continuations; this shop renders synchronously in those continuations. A
fulfilled route or completed response alone is not that marker. This is a
test-only observation tied to the current implementation, not a portable
application-readiness API. Revisit it if catalog rendering becomes scheduled
or asynchronous.

Acceptance: you must prove the older response actually arrives after the newer
result, and inspect the UI after that arrival. Merely seeing Video while Desk
is still held leaves the bug untested. Use the actual catalog payloads so this
experiment controls ordering without inventing a different business catalog.
The official [route API](https://playwright.dev/docs/api/class-route#route-fetch)
explains how a real response can be fetched before fulfillment.

Controlled challenge: temporarily remove the stale-version return from
`loadProducts()` in `lab/app.js`. The old Desk response must now violate the
unchanged Video assertion. Restore the guard and rerun. A detector that remains
green under this change needs a stronger completion boundary.

## Keep the evidence boundaries visible

| Check | Useful claim | Continue with |
| --- | --- | --- |
| Semantic UI interaction | A named control produces the expected user-visible result | This track |
| API setup/readback | Known state exists or the browser's action persisted correctly | [API testing](API-TESTING.md) |
| Mocked HTTP 503 | The UI handles that deliberately supplied response | EX-18, UI-03 |
| Delayed real response | This ordering of responses does not corrupt the displayed result | UI-04 |
| Keyboard activation and focus return | A bounded dialog interaction works from the stated starting focus | EX-08 |
| Full keyboard/axe exercise | The specified path and rendered states meet those checks | [Accessibility labs](ACCESSIBILITY-LABS.md) |
| Screenshot comparison | The rendered state matches a reviewed baseline | [Visual baselines](VISUAL-BASELINES.md) |
| Downloads, frames, popups, dialogs, and timers | The selected browser event or capability behaves as claimed | [Browser skills](BROWSER-SKILLS.md) |
| Separate contexts and restored storage | Client/server ownership and isolation are deliberate | [Fixtures and state](FIXTURES-AND-STATE.md) |

`locator.focus()` establishes a starting focus; it does not prove a keyboard
user can reach that control. `locator.press()` targets and focuses its locator.
Use `page.keyboard` after verified focus when the actual keyboard sequence is
the subject of the test. EX-08 makes a bounded activation/return-focus claim;
AX-03 supplies the richer Tab, Shift+Tab, save, and cancel exercise.

## Diagnose a failure before repairing it

```bash
npm run test:ui:workshop -- --grep "UI-04" --trace on --retries=0
npm run test:report
npm run test:ui:workshop -- --grep "UI-04" --repeat-each=5 --workers=1 --retries=0
```

Use the [trace viewer](https://playwright.dev/docs/trace-viewer) to locate the
first wrong state. Inspect the locator, actionability log, before/after DOM,
request payload, response, and assertion. Ask which boundary failed:

- Multiple matches: refine product/dialog scope instead of adding `first()`.
- Action times out: inspect visibility, overlays, disabled state, and readiness.
- Response wait times out: check registration order and method/path/payload.
- Correct total passes too soon: identify completion of this operation.
- Error appears but recovery fails: compare preserved values and button state.
- Mocked test passes while checkout breaks: inspect the real integration path.
- Intermittent stale catalog: hold/release responses deterministically and
  confirm the observer waits for the late result's application processing.

Five passing repetitions are evidence for those executions, not a proof of
zero flakiness. Do not turn a product defect into a green test by deleting the
assertion, forcing the click, or accepting the wrong state.

For AI review, provide one starter, its implementation, and a trace or failure
message. Ask: “Name the user outcome, the operation-completion evidence, and the
independent oracle. Find an assertion that could pass before the action
finishes. Propose one controlled defect this test must catch without weakening
the acceptance criteria.” Verify the suggestion against the real application.

