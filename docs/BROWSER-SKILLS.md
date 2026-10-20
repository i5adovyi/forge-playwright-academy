# Browser skills: six executable experiments

The course explains several browser features that the shop does not naturally need. This small, separate harness makes those skills runnable. Its timer, file preview, embedded form, sample receipt, and confirmation dialog are training fixtures, not new commerce requirements. The authentication exercise uses the real local shop API.

## Open the bench

```bash
npm run dev
# Open http://127.0.0.1:4173/skills/
```

If another application owns that port, use `PORT=14827 npm run dev` on macOS/Linux and open the corresponding URL. Use the same PORT value for tests. PowerShell: `$env:PORT=14827; npm run dev`.

Start with the guide and starter file. Reveal the solution only after an attempt:

```bash
# The six worked examples should pass without edits.
npm run test:skills

# Remove test.skip from just SK-01 in skills/practice.spec.ts,
# replace its failing placeholder, then run it:
npm run test:skills:practice -- --grep SK-01
```

Every starter has a failing placeholder. Removing `.skip` alone must fail. A skipped assignment is not passing evidence. These six SK drills supplement the 24 EX drills and the 116 lesson challenges; they do not replace them.

## SK-01 · Timer boundary

Related lesson: 03-04. The reservation becomes active when clicked and expires after 30,000 milliseconds.

1. Install Playwright's clock before loading the harness, then pause it at a known instant.
2. Start the reservation.
3. Advance 29,999 milliseconds and assert it remains active.
4. Advance one millisecond and assert it is expired.
5. Change the expected expiry outcome deliberately, observe the relevant failure, then restore it.

Acceptance: both sides of the boundary are tested; no real-time sleep is used. Testing only the expired state misses premature expiry. The page clock controls browser time, not the Node server's clock. `runFor` advances timers consistently; a fixed Date value alone does not advance a timeout.

## SK-02 · Reuse cookie authentication

Related lessons: 03-03, 04-04, 05-01. Use the base `test` from `@playwright/test` for this drill. The shop fixture deliberately injects `x-lab-session`, which takes precedence over cookies and would obscure the behavior being taught.

1. Create an isolated API request context with the configured baseURL.
2. Sign in with the synthetic demo credentials and assert the response succeeded.
3. Obtain `storageState()` in memory. Create a new browser context from that state.
4. Open the shop and verify its signed-in UI and session API.
5. Compare with a genuinely fresh context: it must remain anonymous.
6. Log out using the original API context. The copied-cookie context must then observe the invalidated server session.
7. Close every created browser/request context in `finally` blocks.

Acceptance: authenticated and anonymous controls are both verified, and shared-session invalidation is demonstrated. Storage state carries client-side cookies/storage; it does not clone the server's cart, session, or database. Restarting this server invalidates the old in-memory state. Keep real saved authentication files out of Git. This exercise requires no state file on disk.

## SK-03 · Upload and inspect a file

Related lesson: 03-04. The harness accepts a `.txt` filename and displays its text. Its extension check is an intentionally simple UI rule, not a production upload security design.

1. Construct an in-memory text file with distinctive contents.
2. Use `setInputFiles` on the labelled file input.
3. Assert the accepted filename and actual displayed contents.
4. Select a `.csv` file and assert rejection.
5. Assert the previous preview was cleared rather than remaining misleadingly visible.

Acceptance: check the content, not merely the input value. Do not open an operating-system file picker. No server upload exists here; do not claim backend upload coverage. Stretch: clear the selection and test a Unicode filename/content pair.

## SK-04 · Scope an iframe locator

Related lessons: 02-02 and 03-04. Both the parent and embedded page have a field labelled Name.

1. Resolve the Shipping contact iframe with `frameLocator`.
2. Fill its Name field and submit its form.
3. Assert the confirmation inside that frame.
4. Assert the parent Name field still equals `Parent page`.

Acceptance: the test demonstrates the correct browsing context and a negative control. An unscoped parent-page locator should not be presented as if it reaches through an iframe. Stretch: contrast a frame with an open shadow root and explain the locator boundary difference.

## SK-05 · Capture a popup

Related lesson: 03-04. The sample receipt is a static local page, not a persisted order.

1. Subscribe to the `popup` event before clicking Open sample receipt.
2. Await the resulting Page.
3. Assert its URL, heading, and order reference `SK-42`.
4. Close the popup and prove the original page still works.

Acceptance: do not assume the new page is the first/last entry in a global page list. The event is registered before the trigger, and assertions wait for observable content. Keep the real checkout/receipt download exercise for evidence about order persistence.

## SK-06 · Accept and dismiss a dialog

Related lesson: 03-04. The Delete draft button opens a native confirmation.

1. Register a one-time handler that dismisses the confirmation.
2. Click Delete draft; assert the draft is preserved.
3. Register a new one-time handler that accepts it.
4. Click again; assert the draft is deleted.
5. Capture both messages and verify they ask about the intended operation.

Acceptance: handle the dialog before making assertions that could throw and leave it unresolved. A DOM `getByRole('dialog')` locator is appropriate for the shop's HTML dialogs, not for this browser-native confirmation. Explain that distinction.

## Optional real browser matrix

The default suite uses Chromium. The supplied matrix configuration runs the shop UI tests separately on three engines:

```bash
npm run browsers:all
npm run test:matrix
# A narrow investigation:
npm run test:matrix -- --project=ui-firefox --grep "catalog"
```

`playwright.matrix.config.ts` defines `ui-chromium`, `ui-firefox`, and `ui-webkit`. Browser engines must be installed before execution. Keep this larger run separate from the fast default feedback loop. In GitHub Actions, manually run the Playwright Academy workflow with the browser_matrix checkbox enabled to execute the same three-engine matrix on Linux. A mobile viewport is not a real mobile-device test; WebKit execution is not a claim of every Safari/device combination.

## Evidence to keep

For each completed drill, record the command, browser, intended failure, observed result, cleanup behavior, and one limitation. Use the existing ten-point exercise rubric. Explain the test without looking at its solution before marking related lesson work complete.

## Primary references

- [Clock](https://playwright.dev/docs/clock)
- [Authentication and storage state](https://playwright.dev/docs/auth)
- [File uploads](https://playwright.dev/docs/input#upload-files)
- [Frames](https://playwright.dev/docs/frames)
- [Pages and popups](https://playwright.dev/docs/pages)
- [Native dialogs](https://playwright.dev/docs/dialogs)
- [Browser projects](https://playwright.dev/docs/test-projects)

## Local Firefox startup troubleshooting

On this macOS review environment, Firefox exited before opening a page with `Could not find profile folder`, even with a fresh temporary directory. Treat that as a browser-startup failure, not an application result. A related [upstream Playwright report](https://github.com/microsoft/playwright/issues/42768) documents this symptom under macOS app-data protection; that report does not establish the precise cause on every machine. Use the optional Linux CI matrix to separate host setup from product behavior. Do not remove assertions or silently skip Firefox to claim a passing matrix.
