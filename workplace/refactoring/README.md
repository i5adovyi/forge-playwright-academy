# Refactor an inherited suite without losing evidence

Lesson **05-11** · assignments **RF-01 / RF-02** · about 75 minutes.

You inherit three passing UI cases. Two duplicate a product-to-cart workflow;
the third retains locators across a catalog refresh and a cart rerender. Your
reviewer wants easier maintenance while keeping the same business protection.
Start with `baseline.spec.ts`, then complete `shop.starter.ts` and
`practice.spec.ts`. Read `shop.ts`, `fixtures.ts`, and `worked.spec.ts` after
your first attempt.

## Run the brief

From the repository root:

```bash
npm run test:refactoring
npm run test:refactoring:practice -- --grep RF-01
npm run test:refactoring:proof
```

The first command runs **three baseline and three worked cases**. The starter
command intentionally skips unfinished assignments. Remove `.skip` from only
the assignment you are implementing; both an unfinished method and a final
sentinel prevent an empty exercise from passing. Replace the RF-01 placeholder
with two independently named consumer tests. Keep the starter import.

The proof uses a dedicated server on port 14832 by default; set `PORT` to an
unused port when necessary. It first requires all six cases to pass. It then
adds $1 to cart totals delivered to the browser and requires all six to fail
the named `RF_CART_TOTAL_ORACLE`. A navigation error, missing test, or unrelated
failure does not count as successful fault detection. Reports and traces are
under `quality-results/refactoring-proof/`.

## RF-01: extract responsibilities, preserve consumers

Implement a small `ShopPage`, `ProductCard`, and `CartPanel`, or explain why an
equally small function-based design fits better. The supplied TypeScript
signatures give you the return types, not the implementation.

Preserve these independent consumer expectations:

| Consumer | UI quantity and total | Persisted state |
| --- | --- | --- |
| Studio Headphones | `1`, `$129.00` | one p1 line, price/line total 12900, subtotal/total 12900, discount 0, no promo |
| Focus Lamp | `1`, `$59.00` | one p4 line, price/line total 5900, subtotal/total 5900, discount 0, no promo |

Both consumers must observe a successful cart write, prove the visible state,
and inspect the complete persisted cart. Replacing a total assertion with
`toBeVisible()` loses the pricing rule. Reading the expected total from the
same response that renders the UI loses an independent oracle.

| Responsibility | Place in the reference | Reason |
| --- | --- | --- |
| Browser/context lifetime and session identity | Playwright and the existing test fixture | Fresh mutable state per test, including retries |
| A page object for this test's page | Test-scoped `shop` fixture | Uses the runner-owned page and its cleanup |
| Roles, labels, component scoping, user actions | Page/component objects | One place to maintain a repeated interaction |
| Valid input construction | A separate data builder | No UI or network dependency |
| Product choices, expected money, business assertions | Each spec/consumer | Reviewers can see which rule is protected |

The reference returns a response from mutating actions. It registers the
response observer before the click and leaves the status assertion in the test.
Its `goto()` and `openCart()` methods contain limited readiness assertions.
That is a deliberate convention, not a rule that page objects can never assert
anything. They do not compute prices or swallow failures.

**Review this proposed alternative:** a `BasePage` owns a shared static browser,
an `assertCart()` method calculates expected totals from the returned cart, and
every helper catches errors to “keep the test going.” Explain the lifecycle,
oracle, and diagnostic problems separately. An inheritance hierarchy does not
earn extra credit; choose the abstraction that removes real duplication.

## RF-02: preserve locator and fixture behavior

Keep one `ProductCard` instance while choosing Desk (the headphones disappear)
and then All (they reappear). Use that same instance to add headphones. Open
the cart, keep a quantity locator, change quantity to three, and assert both
that locator's value and the exact `$387.00` total. Finally inspect the full
server cart with p1 quantity 3, line total/subtotal/total 38700, discount 0,
and no promo.

A locator is a query that resolves when used. It can survive the replacement
of its underlying DOM node. An `ElementHandle` points to a particular node and
is the wrong abstraction for this exercise. A page object that stores locators
still belongs to a particular Playwright `Page`; it must not be shared across
tests or reused after that page's context closes.

The fixture wraps the built-in page. It does not create another browser and
needs no manual `page.close()` call; Playwright owns that teardown on success
and failure. If you later add server-side data allocation in a fixture, put its
cleanup after `await use(...)` with `try/finally` as appropriate. Closing a
browser is not deletion of server data.

## Acceptance and interview defense

Run each consumer alone, the whole set with one worker, and in parallel:

```bash
npm run test:refactoring -- --grep 'RF-01 solution · Studio Headphones'
npm run test:refactoring -- --grep 'RF-01 solution · Focus Lamp'
npm run test:refactoring -- --workers=1
npm run test:refactoring -- --workers=4
npm run test:refactoring:proof
```

The same known defect must fail before and after refactoring. The supplied
proof tests the shipped reference and baseline. To prove **your** implementation,
point a copy of the proof configuration at your completed consumers, install
the same `installPriceFault(page)` hook, preserve the named price oracle,
and update the exact expected test identities/count to match your cases.
Do not claim the reference proof validates an untouched starter.

Submit a small diff and a short defense answering:

1. Which duplication justified each abstraction?
2. Why is the fixture test-scoped, and who owns cleanup after an assertion fails?
3. Which expected values remain independent of the application?
4. Which controlled defect fails both versions at the same business assertion?
5. What would you keep as a plain function instead of another class?

Review for readable consumers, accurate failure locations, unchanged session
ownership, and preserved business oracles. Line-count reduction alone is not
acceptance evidence.

Primary references:
[Page object models](https://playwright.dev/docs/pom),
[fixtures](https://playwright.dev/docs/test-fixtures),
[locators](https://playwright.dev/docs/locators),
[web-first assertions](https://playwright.dev/docs/test-assertions).
