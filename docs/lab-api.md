# Forge Shop — local practice contract

Start with `npm run dev`. Portal: `http://127.0.0.1:4173/`; shop: `http://127.0.0.1:4173/lab/`. The server binds to loopback only. `PORT=4174 npm run dev` changes the port; the Playwright config honors the same environment variable.

If you see `EADDRINUSE`, another application already owns that port. Leave it running and choose an unused port, for example `PORT=14827 npm run dev` and `PORT=14827 npm test`. The test runner probes `/api/forge-health` so it cannot accidentally reuse a different application's generic health endpoint.

This is an original educational application. No real payments, shipping, user registration, or persistent database exists. State lives in memory and disappears on server restart. Product stock is a per-order validation ceiling, not a globally decremented inventory system. Authentication is intentionally simplified and is **not a production security reference**. Do not use personal information.

## Session isolation

The first API response sets an HttpOnly `lab_session` cookie. A browser keeps its cart across reloads within that session. A new browser context starts an independent session only when it does not restore a copied session cookie or send a shared/inherited session header. For an anonymous control, explicitly use `storageState: { cookies: [], origins: [] }` and `extraHTTPHeaders: {}`. Alternatively send `x-lab-session: <unique-name>` on every request. The header takes precedence over the cookie and accepts 1–100 ASCII letters, digits, `_`, and `-`. This is a testing convenience, not a secure identity token.

All mutations, orders, and reset operations affect only that session. Idle sessions expire after roughly 12 hours. The supplied test fixture generates a fresh UUID for each test, including retries, and shares it between the request fixture and page context. Do not reset a single global session from parallel tests. Separate sessions can use the same demo email without sharing orders; this is session ownership, not a model of roles or account-level authorization. Disposing a request context frees its client resources; it does not call logout or reset on the server.

For the API learning route, negative controls, and AP-01–04 starters and solutions, use the [API testing workbook](API-TESTING.md).

## Catalog

`GET /api/products?search=&category=All&sort=featured`

Response `200`: `{ "products": [Product], "total": 6 }`.

`Product` has `id`, `name`, `category`, integer `price` in USD cents, integer `stock`, `icon`, `description`, and `tag`. Search matches a case-insensitive name substring. Category is exact: `All`, `Audio`, `Desk`, or `Video`; an unknown category yields an empty list. Sort is `featured`, `price-asc`, `price-desc`, or `name`. An unsupported sort returns `400 INVALID_SORT`. Optional `delay=0…1000` adds a bounded delay in milliseconds for synchronization practice.

| ID | Name | Category | Price (cents) | Stock |
|---|---|---|---:|---:|
| p1 | Studio Headphones | Audio | 12900 | 12 |
| p2 | Mechanical Keyboard | Desk | 8900 | 8 |
| p3 | 4K Webcam | Video | 14900 | 6 |
| p4 | Focus Lamp | Desk | 5900 | 15 |
| p5 | Pocket Speaker | Audio | 4900 | 0 |
| p6 | Monitor Arm | Desk | 7900 | 10 |

## Authentication

- `GET /api/session` → `200 { "user": null }` or `{ "user": { "email": "demo@forge.test", "name": "Alex Tester" } }`.
- `POST /api/login` with `{ "email": "demo@forge.test", "password": "Playwright123!" }` → `200 { "user": {...} }`.
- Wrong credentials → `401 INVALID_CREDENTIALS`. Demo credentials are case-sensitive.
- `POST /api/logout` → `200 { "user": null }`; cart remains.

## Cart

- `GET /api/cart` → `200 Cart`.
- `POST /api/cart` with `{ "productId": "p1", "quantity": 2 }` → `200 Cart`. This **sets** the line quantity; it does not increment it.
- `DELETE /api/cart/p1` → `200 Cart`. Deleting an absent line returns `404 CART_ITEM_NOT_FOUND`.
- `POST /api/cart/promo` with `{ "code": "SAVE10" }` → `200 Cart`. Whitespace is trimmed, case ignored; repeated application never compounds.

```json
{
  "items": [
    { "productId": "p1", "name": "Studio Headphones", "price": 12900, "quantity": 2, "lineTotal": 25800 }
  ],
  "subtotal": 25800,
  "discount": 2580,
  "total": 23220,
  "promoCode": "SAVE10"
}
```

All amounts are integer USD cents. Discount is `Math.round(subtotal * 0.1)` for SAVE10, otherwise zero. Cart changes recalculate it.

Quantity must be a JSON number, integer 1–99 (`400 INVALID_QUANTITY`). A quantity exceeding stock returns `409 INSUFFICIENT_STOCK`; unknown product returns `404 PRODUCT_NOT_FOUND`; unknown promo returns `422 INVALID_PROMO`. Invalid operations preserve cart state.

## Orders and receipts

Both order endpoints require sign-in; otherwise `401 AUTH_REQUIRED`.

`POST /api/orders`:

```json
{ "name": "Alex Tester", "address": "1 Test Lane", "city": "London", "postalCode": "SW1A 1AA" }
```

Each field must be a nonblank string, at most 120 characters (20 for postalCode); invalid address returns `422 INVALID_ADDRESS`. Empty cart returns `409 EMPTY_CART`.

Response `201`:

```json
{
  "order": {
    "id": "ORD-0001",
    "items": [{ "productId": "p1", "name": "Studio Headphones", "price": 12900, "quantity": 1, "lineTotal": 12900 }],
    "subtotal": 12900,
    "discount": 0,
    "total": 12900,
    "promoCode": null,
    "customer": "demo@forge.test",
    "shipping": { "name": "Alex Tester", "address": "1 Test Lane", "city": "London", "postalCode": "SW1A 1AA" },
    "status": "confirmed",
    "createdAt": "<ISO timestamp>"
  }
}
```

IDs increment within a session. Creating an order snapshots the cart and empties it, including the promo code. `GET /api/orders` returns `200 { "orders": [...] }`. `GET /api/orders/ORD-0001/receipt` downloads a plain-text attachment named `ORD-0001.txt`; absent order returns `404 ORDER_NOT_FOUND`. A session cannot see another session's order even if both have an ORD-0001.

## Reset, health and errors

- `POST /api/reset` → `200 { "reset": true }`; clears the current session's cart, promo, authentication, history and order counter.
- `GET /api/health` → `200 { "status": "ok", "service": "forge-lab" }`.
- `GET /api/forge-health` is an equivalent app-specific health endpoint used by Playwright.
- Error envelope: `{ "error": { "code": "STABLE_MACHINE_CODE", "message": "Human-readable explanation." } }`.
- Malformed JSON, non-object JSON → `400 INVALID_BODY`; request bodies above 16 KiB of UTF-8 bytes → `413 INVALID_BODY`.
- Unknown endpoints → `404 NOT_FOUND`. Unsupported API methods currently follow this same 404 contract.

The byte limit is **16,384 bytes**, not JavaScript string length. Exactly that many bytes are accepted by the parser when they form a JSON object; field validation still applies afterward. The lab parses JSON objects for supported mutations and has no form or multipart endpoint. To send intentionally malformed JSON with Playwright, pass the raw string as `data` and explicitly set `Content-Type: application/json`. Passing an object as `data` serializes valid JSON instead.

Successful cart and order mutations are visible to the next same-session read. This lab does not model eventual consistency. Polling or retrying a write is not needed to observe a successful mutation.

## UI locator contract

Prefer accessible roles and labels. Product cards are `article` with the accessible product name; buttons are named `Add Studio Headphones to cart` and so on. Search is `getByRole('searchbox', { name: 'Search products' })`; selects are labelled `Category` and `Sort by`.

The header button is `Cart (0)`, changing with total quantity. Cart dialog is `Your cart`; quantity input label is `Quantity for Studio Headphones`. Promo field is `Promo code`, submit button `Apply promo`. The cart exposes `cart-subtotal`, `cart-discount`, and `cart-total` test IDs because these amounts lack uniquely identifying user labels.

Sign-in dialog is `Your workspace awaits.` with `Email`, `Password`, `Sign in`. Scope its submit locator to the dialog because the header also has `Sign in`. Checkout button is `Continue to checkout →`; checkout dialog is `The details.` with `Full name`, `Street address`, `City`, `Postal code`, and `Place order`. Confirmation dialog is `You're all set.` with `Download receipt ↓`.

## Scope of the reference suite

The suite demonstrates Chromium UI behavior, API contracts, validation, error recovery, session isolation, downloads, mobile viewport and keyboard focus. It is not a full accessibility audit, load test, penetration test, or cross-browser certification. Install the other browsers and add projects when you reach those lessons.

## Browser update ordering

The shop serializes session reads and mutations with their UI updates. Rapid quantity changes therefore preserve user intent even when an earlier response is delayed. This is application behavior, not a replacement for Playwright assertions. Test visible and persisted state after the queue settles.

The separate `/skills/` harness provides timer, upload, frame, popup, and native-dialog exercises. See [Browser Skills](BROWSER-SKILLS.md); those fixtures are not shop API features.
