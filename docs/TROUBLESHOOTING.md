# Troubleshooting: observe first, then change one thing

Record the exact command, full first error, runtime versions, and whether the issue is reproducible. Avoid deleting lockfiles, reinstalling unrelated packages, or increasing every timeout before you understand the failure.

## The portal or lab does not open

Check that the local server is running and read its startup output. The default URL is `http://127.0.0.1:4173`; the shop is `/lab/`. A browser error saying the connection was refused usually means nothing is listening at that address. A 404 means a server answered but did not serve the requested path. These are different failures.

```sh
curl -i http://127.0.0.1:4173/api/health
```

If port 4173 is already occupied, identify the process before stopping it. Do not kill an unrelated service. You can run the server with another `PORT` only if you also align the test base URL and web-server configuration. A static preview can show portal pages while the live API still requires the Node server.

## A Playwright browser executable is missing

Install the browser used by your configured project:

```sh
npx playwright install chromium
```

For Linux CI, the project workflow may use `npx playwright install --with-deps chromium`. Package installation and browser installation are separate. If downloads are blocked, report that browser tests were not executed; a successful type check does not substitute for them.

## “No tests found”

Run `npx playwright test --list`. Check the configured test directory, filename pattern, project selection, and `-g` title filter. A deliberately separate exercise folder may require an exercise-specific command or configuration. Use the README scripts before changing discovery rules.

## The test times out while finding an element

Read the locator and inspect the actual page. Check the URL, login state, request errors, and visible UI before assuming the selector is wrong. Open a trace or run in UI mode. If the element is inside a dialog, scope the locator to that dialog. If the control has a different accessible name, use the actual observed name.

For the demo login, the page and dialog can both contain “Sign in.” Scope the button to the login dialog. This is a better explanation than choosing an arbitrary first match.

## A strict-mode violation reports multiple matches

The locator does not uniquely express your intent. Scope by role, dialog, product card, or an explicit label. Add `exact: true` when appropriate. Use `first()` only when the first result is the intended behavior, and explain that assumption.

## A test passes alone but fails in the suite

Investigate shared state before tuning timeouts. Check hard-coded `x-lab-session` values, shared browser contexts, global resets, mutable worker fixtures, and case ordering. Run two suspected cases together with retries disabled. Give them separate sessions and compare outcomes.

The lab’s server session is selected by the header or cookie. A fresh page using the same header still selects the same backend state. Each independent case should own its data.

## API setup works but the browser cart is empty

The API client and browser may be using different sessions. Decide whether you want isolation or shared identity. For a cross-layer test, transfer the session cookie or use a fixture that explicitly configures the same `x-lab-session`. Avoid accidentally sharing state between unrelated cases while solving this problem.

## Cart quantities or totals look surprising

`POST /api/cart` sets the quantity for that product; it does not increment it. Money is integer cents. Two `p1` Studio Headphones produce a `25800` subtotal. `SAVE10` gives a `2580` discount and `23220` total for that cart. Inspect the payload before suspecting a rendering bug.

The stock limit can reject a quantity even if it is inside the API’s general 1–99 quantity range. For `p1`, stock is 12. A quantity of 13 is a stock failure; 0 is a quantity validation failure. See [the contract](lab-api.md).

## Order creation returns an error

Check the order of preconditions: authentication, valid shipping fields, and a nonempty cart. The demo requires `name`, `address`, `city`, and `postalCode`. A test intended to verify an empty cart should provide valid credentials and shipping details so it reaches that rule. Otherwise you may only be testing the earlier validation.

## Tests pass only on retry

Keep the first failure visible. Compare initial-run and retry traces. A retry is a fresh execution that may see a different environment or state. Record these as flaky outcomes and investigate; do not count them as equivalent evidence to a clean first pass.

## TypeScript runs but the type check fails

Playwright transforms TypeScript for execution; that is not a complete project type check. Run `npx tsc --noEmit`. Inspect the first diagnostic and the relevant `tsconfig.json`. Do not silence the entire file with `@ts-nocheck` to claim completion.

## Visual comparisons differ between machines

Compare operating system, browser build, fonts, viewport, scale, animations, and application data. Review the actual image difference before updating snapshots. Generate baselines in the intended stable environment and keep intentional changes reviewable. A wider threshold can conceal a real regression.

## AI-generated tests contain nonexistent selectors or API fields

Compare with the actual DOM and `docs/lab-api.md`. Ask the agent to list what it observed and what it assumed. Regenerate only the affected case with concrete evidence. Do not change the app to fit an invented expectation unless the task is explicitly to implement that new requirement.

## `init-agents` is unavailable

Check `npx playwright --version` and `npx playwright init-agents --help`. The command depends on the installed version. Read current [official guidance](https://playwright.dev/docs/test-agents) before choosing an upgrade. The manual plan → implement → review workflow remains available without generated agent definitions.

## The lab lost its data

The demo stores state in memory. A server restart clears it; inactive sessions expire. This is intentional for local training. Tests should arrange their own data rather than depending on yesterday’s browser session. Portal study progress is a separate browser-local record.

## A useful help request

```text
Expected behavior:
Actual first failure:
Exact command:
Node / Playwright / browser / OS:
Test and relevant fixture:
Session strategy:
Trace or report path:
Experiments already tried and their outcomes:
```

Include the smallest reproduction you can. Replace real secrets and customer data before sharing evidence from a non-demo system.
