# Academy review · October 20, 2026

A second review examined the lessons, runnable exercises, portal, shop/API, configuration, downloads, and CI together. Three independent reviews covered curriculum correctness, practice-system behavior, and learning-portal usability. The fixes below are implemented, with regression tests where the behavior can be executed.

## Highest-value findings and fixes

| Finding | Why it mattered | What changed |
|---|---|---|
| Empty-catalog example could pass before the response arrived | An initially empty DOM did not prove the mocked response was handled | Lesson waits for visible empty-state feedback before asserting zero cards |
| Login and cookie examples raced asynchronous initialization | Passing setup could target the wrong session or observe unfinished login | Explicit session/bootstrap waits; cookie and header fixtures distinguished; inherited headers cleared for independent contexts |
| Quantity schema limit confused with stock limit | A learner could expect quantity 99 to succeed for a product with stock 12 | Boundary exercises now separate schema rejection from insufficient stock |
| Several commands, seed paths, and outage examples mismatched the project | Correct-looking lesson work could fail for unrelated setup reasons | Real spec paths, discoverable seed location, configurable port, correct response envelope and recovery steps |
| No direct mapping between lesson challenges and runnable drills | Learners had to guess where to write code and which command to run | Shared mapping connects lessons to all 24 EX drills and six SK drills, with starter, solution, and command |
| Browser features were explained but lacked focused executable practice | Clock, storageState, files, frames, popups, and dialogs needed a controlled target | Six starter/solution pairs and a dedicated local browser-skills bench |
| Delayed cart responses could replace more recent intent | Fast edits could show or persist surprising state | Session operations and UI updates serialized; delayed-response regression added |
| Cart refresh could replace an input during typing | Opening the cart and editing immediately could lose input | Fresh state is rendered before editable cart controls appear |
| Request limit counted characters rather than bytes; network chunks decoded separately | Unicode could bypass the size contract or be corrupted | Byte-counted buffering and a single UTF-8 decode, with fragmented Unicode/boundary tests |
| Focus was lost after cart updates and dialog transitions | Keyboard users could lose their place; WebKit exposed implicit browser assumptions | Explicit focus preservation/return, plus engine-independent focus assertions |
| Linux WebKit displayed the receipt instead of downloading it | The download header alone did not produce the promised action on every engine/platform | Explicit download intent on the link; test verifies file contents and that the shop remains open |
| Skip link and malformed fragments could blank the portal | Navigation and reload were fragile | SPA-safe skip behavior, malformed-route fallback, and regressions |
| Slow manual failures could overwrite a later route | A completed navigation could be replaced by an unrelated error | Rendering checks a route version on both success and failure |
| Continue learning ignored the last open unfinished lesson | Returning learners lost their current position | Resume uses the saved last lesson when appropriate |
| Five manuals overflowed a phone-width viewport | Long code fragments and tables made reading require whole-page horizontal scrolling | Constrained the reading column and allowed long inline text to wrap; all 14 manuals checked at phone and desktop widths |
| Hidden mobile navigation remained focusable | Keyboard and assistive-technology users could reach offscreen links | Hidden navigation/background are inert at the appropriate times, with managed focus |
| Progress imports accepted nonexistent checks and invalid quiz choices | Corrupt records could produce misleading progress | Imported keys and answers are validated against actual content |
| EX-16 checked too little state after rejected requests | A rejection response could hide an unwanted mutation | Each rejection compares the complete seeded cart before/after |
| Changing an expected value was described too strongly | That demonstrates assertion execution, not necessarily product defect detection | AI guide distinguishes assertion smoke checks from controlled defects with an unchanged oracle |

## Verification improvements

- Content validation now checks lesson relationships, resource URLs, quiz bounds, all 30 starter/solution mappings, npm script names, and local Markdown references.
- The optional browser matrix has a separate configuration. Normal commands stay fast; the larger matrix is explicit.
- GitHub Actions supports an optional manually requested three-engine matrix on Linux.
- Browser authentication snapshots are ignored by Git. The cookie drill keeps its synthetic state in memory.
- Source downloads include the browser-skills harness, starter/solution files, and matrix configuration.
- See [Verification](VERIFICATION.md) for commands actually executed and scope limitations.

## Useful next extensions — intentionally not claimed as implemented

These are advanced branches after the core capstone, rather than prerequisites for starting the academy.

1. **Automated accessibility investigation.** Add an axe-based scan to selected states, investigate each finding, and keep manual keyboard/screen-reader checks. Acceptance: demonstrate one controlled violation is detected; explain what automated scanning cannot establish.
2. **Visual baseline maintenance.** The curriculum already covers the concepts. Build a committed, platform-specific baseline workflow with deliberate review of updates. Acceptance: an unintended layout change fails, an intentional change is reviewed, and font/OS noise is controlled without masking the relevant region.
3. **Richer API protocols.** The current lab teaches REST/HTTP. Add a separate GraphQL or WebSocket fixture only when your work requires it. Acceptance: cover schema/event ordering, errors, state ownership, and a documented cleanup strategy.
4. **A second product domain.** Extend the capstone to bookings, roles, or subscriptions rather than repeating the same shop. Acceptance: model different state transitions and justify which risks belong at each layer.
5. **Real-device and performance evidence.** Browser engines and viewport emulation do not establish device behavior, throughput, or production latency. Define a separate environment and workload before making those claims.

The first practical improvement for a learner is to complete one mapped exercise, produce a deliberate failure, and explain its oracle. More content is useful only when it leads to better evidence.
