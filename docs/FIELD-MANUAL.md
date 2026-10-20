# The automation engineer’s field manual

This is an original practical reference for the academy. Examples use Playwright Test and TypeScript. Commands assume you are in the repository root and dependencies are installed. Use the repository configuration for project names and test locations.

## 1. A test has a claim

Name the behavior, arrange known starting state, perform an action, and verify a meaningful result. “Loads page” is usually less useful than “rejects checkout when the cart is empty.” Keep the expected rule independent from the code being tested. A page total equal to an API total checks consistency; both can still be wrong.

Before implementation, write:

```text
Risk: an invalid quantity changes the cart.
Precondition: isolated session with a known cart.
Action: submit quantity zero.
Expected: documented validation error and cart unchanged.
Evidence: status, error field, before/after cart.
```

For quantity inputs, consider normal values, documented boundaries, out-of-range values, wrong types, and missing values. Distinguish required behavior from a speculative preference.

## 2. The command kit

```sh
# Inventory and focused feedback
npx playwright test --list
npx playwright test path/to/your.spec.ts
npx playwright test -g "part of a test title"
npx playwright test --ui
npx playwright test --headed
npx playwright test --debug

# Investigation and repetition
npx playwright test -g "test title" --trace on --retries=0
npx playwright test -g "test title" --repeat-each=10 --workers=1 --retries=0
npx playwright test --workers=4 --retries=0
npx playwright show-report

# Separate type checking from test execution
npx tsc --noEmit
```

Use an existing test path instead of the placeholder. Multiple workers are an isolation experiment, not an automatic speed improvement. Ten passing repetitions do not establish that the probability of failure is zero.

## 3. Understand the asynchronous contract

Most browser actions return a promise. Without `await`, the test can proceed before the action completes and failures can become detached from the line that caused them. A locator describes how to find an element; it is not a frozen DOM element.

```ts
const loginDialog = page.getByRole('dialog', { name: 'Your workspace awaits.' });
const submit = loginDialog.getByRole('button', { name: 'Sign in', exact: true });
await submit.click();
await expect(loginDialog).not.toBeVisible();
```

The code above is a fragment after opening the login dialog and filling valid credentials, not a complete test. Inspect the app and use its actual labels. Never invent selectors from a screenshot-free guess or an agent’s memory.

## 4. Locator decision guide

| Situation | Good starting point | Review question |
|---|---|---|
| A named button or link | `getByRole` with accessible name | Does this identify the user’s intended control? |
| A labeled form field | `getByLabel` | Is the label correctly associated with the input? |
| Read-only visible text | `getByText` | Could the same text appear elsewhere? |
| Repeated product cards | Scope/filter, then find the control | Is the product identity explicit? |
| No stable user-facing identity | A documented test ID | Is this a deliberate testability contract? |

Avoid long DOM paths and positional guesses. `first()` is reasonable only when the first item is the behavior under test. It is not a general repair for ambiguity. A CSS class may be appropriate for a deliberately stable contract, but visual styling classes usually change for reasons unrelated to behavior.

## 5. Assertions and synchronization

```ts
await expect(page.getByRole('alert')).toContainText('incorrect');
await expect(page.getByRole('button', { name: 'Continue to checkout' })).toBeEnabled();
await expect(page.getByRole('article')).toHaveCount(6);
```

These are separate illustrative assertions for failed login, an open cart, and an unfiltered catalog. Arrange the corresponding state before using each one. Locator assertions retry. `expect(await locator.isVisible()).toBe(true)` reads a boolean once and loses that retry behavior. Fixed sleeps are guesses about timing. Prefer the event or state that matters.

If observing a network response, create the waiter before triggering the request:

```ts
const responsePromise = page.waitForResponse(response =>
  response.url().endsWith('/api/cart') &&
  response.request().method() === 'POST'
);
await page.getByRole('button', { name: 'Add Studio Headphones to cart' }).click();
const response = await responsePromise;
expect(response.status()).toBe(200); // Use the contract's actual expected status.
```

Do not leave placeholder snippets in a finished test. Add a user-visible assertion after a successful request; transport success alone does not prove the UI updated.

## 6. API test anatomy

```ts
import { test, expect } from '@playwright/test';

test('the catalog endpoint returns JSON', async ({ request }) => {
  const response = await request.get('/api/products');
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('application/json');
  const body = await response.json();
  expect(body.total).toBe(6);
  expect(body.products).toHaveLength(6);
  expect(body.products).toEqual(expect.arrayContaining([
    expect.objectContaining({ id: 'p1', name: 'Studio Headphones', price: 12900 }),
  ]));
});
```

A complete API suite checks more than this introductory test. Verify business fields, not just `ok()`. For mutations, follow with a read. For rejected mutations, prove no unwanted state change occurred. For authorization, test both authorized and unauthorized behavior using deliberately separate contexts.

A TypeScript cast (`as Product[]`) does not validate incoming JSON. Choose explicit assertions or a runtime schema when validating contracts. Do not validate a response by copying the same function the server uses to produce it.

## 7. Data and isolation

Forge Shop uses a `lab_session` cookie or `x-lab-session` header to separate practice state. Allocate a unique session for each independent test. Reset only the session you own using the documented API. A global reset shared by parallel tests is a source of race conditions.

```ts
import { randomUUID } from 'node:crypto';
const sessionId = randomUUID();
const api = await playwright.request.newContext({
  baseURL: 'http://127.0.0.1:4173',
  extraHTTPHeaders: { 'x-lab-session': sessionId },
});
try {
  // Arrange and verify data within this session.
} finally {
  await api.dispose();
}
```

When crossing into the browser, deliberately carry the same session identity using the documented fixture or cookie. When testing isolation, deliberately use different identities. These are different experiments.

## 8. Mocking with a clear claim

A route mock is useful when you want a deterministic error, empty state, or unusual response. Register it before navigation or the triggering action. Keep payloads consistent with the API contract.

A UI test with a mocked successful order proves that the UI handles that response. It does not prove that the backend creates an order. Maintain a small real integration journey alongside focused mocked UI cases. Put the mock’s boundary in the test name or plan.

## 9. Diagnose before repairing

Capture the failing command and trace. Identify the first unexpected event. Classify the problem as product behavior, test logic, data, environment, or infrastructure; it can span more than one category. Run one experiment that separates competing explanations.

Do not repair by increasing every timeout, adding `force: true`, ignoring errors, or removing assertions. Each may be legitimate in a specific situation, but each requires an explicit reason. A retry can help collect evidence; it does not explain the original failure.

## 10. Review before merging

- Can another engineer explain the business rule from the test title and assertions?
- Is starting state owned by this test and independent of execution order?
- Does the case fail when the relevant outcome is intentionally wrong?
- Are locators meaningful and synchronization tied to a condition?
- Are API shape, business behavior, and state effects checked at the right layer?
- Are mocks named and their coverage limits clear?
- Does cleanup preserve useful failure evidence?
- Are failures diagnosable in a headless CI run?
- Are skipped tests and known gaps visible?

## 11. A complete cross-layer exercise

Save this as `exercises/my-first-hybrid.spec.ts`. The shared fixture supplies a unique session header to both the API client and browser for this test. The test arranges data through HTTP, checks the calculated amount, and verifies the same data in the browser.

```ts
import { test, expect } from '../tests/support/fixtures';

test('API-created cart is visible to its shopper', async ({ request, page }) => {
  const response = await request.post('/api/cart', {
    data: { productId: 'p1', quantity: 2 },
  });
  expect(response.status()).toBe(200);
  const cart = await response.json();
  expect(cart.items).toHaveLength(1);
  expect(cart.items[0]).toMatchObject({
    productId: 'p1', quantity: 2, price: 12900, lineTotal: 25800,
  });
  expect(cart.total).toBe(25800);

  await page.goto('/lab/');
  await page.getByRole('button', { name: 'Cart (2)', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Your cart', exact: true });
  await expect(dialog.getByLabel('Quantity for Studio Headphones')).toHaveValue('2');
  await expect(dialog.getByTestId('cart-total')).toHaveText('$258.00');
});
```

Run only this case:

```sh
npm run test:exercises -- --grep "API-created cart is visible"
```

Now change only the final expected total to `$257.00`. Confirm that the visible-outcome assertion fails, inspect the report, and restore `$258.00`. Explain why this deliberate wrong expectation tests the assertion but is not the same as proving the suite detects every possible calculation defect.

For a second challenge, use a different session in the browser. Predict the cart badge before running. The original assertion should fail because the second shopper has an empty cart. Restore shared identity when you are done: this exercise is testing visibility within one session, not separation between sessions.

## Sources and continued reading

Checked 20 October 2026: [Locators](https://playwright.dev/docs/locators), [Assertions](https://playwright.dev/docs/test-assertions), [API testing](https://playwright.dev/docs/api-testing), [Fixtures](https://playwright.dev/docs/test-fixtures), [Network](https://playwright.dev/docs/network), [TypeScript](https://playwright.dev/docs/test-typescript). The examples and review exercises here are original, not copied course content.
