# Typed input builders and independent validation cases

Lesson **05-12** · assignments **DB-01 / DB-02** · about 75 minutes.

Your team's validation suite passes alone but changes behavior after another
case modifies its defaults. Refactor its input construction, then prove every
shipping field's rejection and accepted boundary independently. Start with
`builders.starter.ts` and `practice.spec.ts`; compare with `builders.ts` and
`worked.spec.ts` after attempting the brief.

## Commands and evidence

From the repository root:

```bash
npm run test:builders
npm run test:builders -- --list
npm run test:builders:practice -- --grep DB-01
npm run test:builders:proof
```

The worked suite registers **50 cases**: two DB-01 cases and 48 DB-02 cases.
Both starter assignments are skipped until you implement them. Removing
`.skip` alone fails because builder methods throw and the final sentinel still
requires a real implementation. Do not switch the import to the solution.

The proof runs three complete 50-case suites against an isolated local server:
all controls pass; a shared nested default fails the ownership oracle; removing
the server's length limit makes the four over-limit cases fail their exact
status oracle. The script compares every discovered title with an independent
required inventory, verifies those specific outcomes, and rejects missing,
duplicated, or unrelated cases/failures. It writes a temporary server copy under
`quality-results/builders-proof/`; it never changes `server.mjs`.

The default proof port is 14832. Use `PORT=14833 npm run test:builders:proof`
if that port is busy. The proof refuses to reuse a running server, so a result
cannot silently come from the wrong implementation.

## DB-01: build input with clear ownership

Implement:

```ts
buildShipping(overrides?: Partial<ShippingInput>): ShippingInput
buildCheckoutData(overrides?: CheckoutOverrides): CheckoutData
```

Use valid deterministic defaults: Alex Tester, 1 Test Lane, London, SW1A 1AA;
one p1 item with quantity 1; no promo. Each call must own its shipping object,
item array, and every item in that array. Caller-supplied overrides must retain
their own ownership too.

`{ ...defaults }` copies only the top level. If `defaults.items[0]` is shared,
changing one case's quantity changes another's input. The deliberately broken
`shared-default.counterexample.ts` demonstrates this exact bug. Test behavior:
mutate one result and prove the next result and caller overrides are unchanged.
Checking only `first !== second` does not protect nested state.

The second worked consumer places a real order with p1 ×2, p2 ×1, SAVE10, and
Warsaw/00-001 shipping. Its independent expected values are subtotal 34700,
discount 3470, and total 31230, in integer cents. The builder creates input;
it does not calculate the expected discount or validate application output.
Fixtures own sessions and cleanup; API setup helpers own network operations;
the test owns business assertions.

## DB-02: one field, one rule, one independent case

The API accepts a JSON object with four required fields. All must be strings
whose **trimmed** length is at least one. Name, address, and city have a maximum
of 120; postalCode has a maximum of 20. The server uses JavaScript string
`.length` after `.trim()` (UTF-16 code units); these ASCII boundary examples do
not establish a grapheme-counting or postal-format rule. The API has no real
postal-code format validator. Browser `required`/`maxlength` constraints are a
separate layer; test this API contract directly.

For each of the four fields, register these named cases:

| Rejected input | Why it matters |
| --- | --- |
| Omitted property | Required field is absent |
| Empty string | Present is not sufficient |
| Whitespace only | Trimming leaves no content |
| Number, boolean, null, object, array | Wrong JSON value type, five separate cases |
| Maximum + 1 | Upper limit is enforced |
| **Accepted** one character | Lower valid boundary |
| **Accepted** exact maximum | Avoid an off-by-one rejection |
| **Accepted** padded maximum | The limit applies after trimming, and saved data is normalized |

This is **36 rejected + 12 accepted = 48** separately discoverable tests.
Do not put all requests inside one test that stops at its first assertion:
separate registration gives each case a fresh session and its own diagnostic
result. Parameters select input; tests still own observable assertions.

For each rejected case, first authenticate, seed p1 ×2 and p2 ×1, and apply
SAVE10. Prove that entire initial cart equals the known discounted snapshot.
Keep the other three shipping fields valid and change only the field under
test. Use a `Record<string, unknown>` for this intentionally malformed boundary
payload; keep the valid builder type strict.

Require exactly **422 / INVALID_ADDRESS**, the complete unchanged cart, and
empty order history. An unauthenticated request would stop at 401 before
shipping validation. An empty cart would make accepted controls fail at 409.
A “some 4xx” assertion cannot tell you which rule was exercised.

Each accepted control must return 201, exact normalized shipping, the known
discounted cart amounts/lines in ORD-0001, a history containing exactly that
order, and a completely cleared cart/promo. These positive controls prevent
an implementation that rejects every address from looking correct.

## Review and interview defense

Use `--list` to check discovery, then run one case alone and the suite serially
and in parallel:

```bash
npm run test:builders -- --grep 'postalCode rejects over maximum'
npm run test:builders -- --workers=1
npm run test:builders -- --workers=4
npm run test:builders:proof
```

Explain why a fresh top-level object can still be unsafe, why random defaults
make a boundary failure harder to understand, and how you know a rejection
reached the intended validation layer. Point to the positive control and the
unchanged-state evidence for one rejected case.

The supplied proof validates the reference suite. To assess your own completed
starter, use a copied proof configuration selecting your cases and check its
specific expected identities/outcomes. The builder substitution must target
your builder consumer, not the unchanged reference test.

Primary references:
[Parameterized tests](https://playwright.dev/docs/test-parameterize),
[API testing](https://playwright.dev/docs/api-testing),
[test isolation](https://playwright.dev/docs/browser-contexts),
[the local API contract](../../docs/lab-api.md).
