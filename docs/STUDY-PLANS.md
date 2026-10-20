# A study plan you can sustain

Choose a cadence that leaves time to debug. Reading a lesson is the start; reproducing its result and explaining a failure are the work. The estimates below include exercises and capstone practice. If you are new to programming, allow additional time for Stage 1.

## The eight-week path · about 10–12 hours per week

| Week | Stage | Practical output | Gate |
|---|---|---|---|
| 1 | Build your foundation | Learning log, first run, boundary table | Explain async/await and a test oracle |
| 2 | Your first UI suite | Locators, form flow, cart assertions | A meaningful UI test fails when expected output is wrong |
| 3 | Make it resilient | Response synchronization and trace dossier | Diagnose one failure without adding a sleep |
| 4 | Go below the UI | Catalog, invalid input, state checks | Rejected mutation leaves state unchanged |
| 5 | Engineer your framework | Isolated fixtures and reusable helpers | Independent cases survive parallel execution |
| 6 | Ship reliable signals | CI configuration and artifact workflow | A deliberate failure remains visible with evidence |
| 7 | Work with AI agents | Reviewed plan, generated cases, audit | Identify and reject a weakened assertion |
| 8 | Prove your craft | Capstone and technical demonstration | Score at least 80/100 without blockers |

Suggested week: two 60-minute lessons, one 90-minute lab, one 90-minute debugging/review session, and a longer build session. Adjust the total to your available energy. If a gate fails, use the next session to repair the gap instead of pretending the calendar establishes mastery.

## The twelve-week path · about 7–9 hours per week

| Weeks | Focus |
|---|---|
| 1–2 | Stage 1 and TypeScript/JavaScript foundations |
| 3 | Stage 2: first UI suite |
| 4–5 | Stage 3: resilient UI and traces |
| 6 | Stage 4: API testing |
| 7–8 | Stage 5: fixtures, ownership, and architecture |
| 9 | Stage 6: CI and useful reports |
| 10 | Stage 7: AI-assisted workflow and review |
| 11–12 | Stage 8: capstone, fresh-start run, defense |

Use the extra weeks for retrieval practice: rebuild an earlier test without looking at its solution. Explain the reasoning aloud, then compare the result. This reveals gaps that passive rereading can hide.

## The four-week sprint · about 12–18 hours per week

This track assumes familiarity with programming, Git, and HTTP.

- **Week 1:** Stages 1–2. Complete the foundation gates early, then build core UI coverage.
- **Week 2:** Stages 3–4. Spend equal time on failure diagnosis and direct API testing.
- **Week 3:** Stages 5–6. Prove isolation, configure CI, and preserve failed-run artifacts.
- **Week 4:** Stages 7–8. Audit agent contributions and deliver the capstone.

Do not compress the final review out of the sprint. A polished portal screenshot cannot substitute for a reproducible suite.

## Your 75-minute practice session

| Time | Action |
|---|---|
| 0–10 min | Recall yesterday’s idea without notes; choose today’s behavior |
| 10–25 min | Read the lesson and inspect the app/API |
| 25–50 min | Implement and run the exercise |
| 50–65 min | Challenge an assertion, inspect a failure, restore it |
| 65–75 min | Write evidence and one question for the next session |

Keep the scope small enough to reach a feedback loop. If a failure consumes the session, a clear investigation note is still a useful deliverable.

## Learning log template

```text
Date / lesson:
Behavior and risk:
My prediction:
Command and environment:
Actual outcome:
Failure evidence:
Correction and why it works:
What this test does not prove:
Next experiment:
```

## Weekly review

Select one test written this week. Remove comments temporarily and ask whether the code still explains its purpose. Run it alone and with neighboring cases. Explain one tradeoff. Revisit one old exercise without copying. Update your evidence notes and choose the next week’s most important gap.

Progress in the portal is a local study tracker. Back it up using the available export control if you want to move between browsers. Do not assume a browser’s local storage is a permanent cloud account.

## Resource discipline

Pick one primary course and the official docs. Watching five introductions rarely helps as much as implementing one complete scenario. Use books for deeper test-design thinking, videos for demonstrations, and the official docs for current API details. Paid resources are optional and the academy has no affiliate or certification relationship with the linked providers.

## Place the browser skills in your schedule

During Stage 3, attempt SK-01 and SK-03–06 from [Browser Skills](BROWSER-SKILLS.md). Complete SK-02 when comparing cookie and header session isolation in Stages 3–5. Budget an additional two to four hours for these six drills if the browser APIs are new to you. During Stage 6, run the optional browser matrix and explain any engine-specific result.


## Accessibility and visual workshop extension

Complete lessons 03-06 and 03-07 after the first resilience lessons, and lessons 06-06 and 06-07 after learning CI evidence. The four guided lesson estimates add 4 hours 30 minutes. Budget extra time for implementing eight starters and reviewing failures. Attempt AX-01–04 before reading their worked solutions, then VS-01–04. Keep the axe report, a keyboard observation, an expected/actual/diff image set, and a written baseline approval reason in your portfolio. See [Accessibility labs](ACCESSIBILITY-LABS.md) and [Visual baselines](VISUAL-BASELINES.md).

## A focused Playwright Docs path

The complete 54-lesson program now contains **55 hours 10 minutes of guided work**. Add independent debugging, the supplemental drills, and capstone time; adjust the schedules above to your pace. The new track contributes 9 hours 50 minutes of guided lessons, so give it two additional weeks if your previous schedule was already full.

| Session block | Lessons | Evidence to keep |
|---|---|---|
| Context ownership | 03-08, 03-09 | Tab-versus-context comparison and a storage matrix you can justify |
| State transfer | 03-10 | Default and IndexedDB snapshots; missing sessionStorage explained |
| Fixture lifetimes | 05-06, 05-07 | Dependency trace, reverse teardown, and fresh mutable resources |
| Options and authentication | 05-08, 05-09 | Typed override, correct API cookie ownership, independent guest control |
| Docs-guided review | 05-10 | A diagnosis citing the contract, a minimal repair, and rerun evidence |

Use [Fixtures & browser state](FIXTURES-AND-STATE.md) alongside the portal's **PW Docs track**. Run one FS drill at a time. Compare a result with your prediction before reading the worked solution; marking a lesson complete is not a substitute for explaining the ownership boundary.

## Strengthen your API evidence

The six API lessons total **6 hours of guided work**. Keep the first five in
Stage 04, add the 75-minute request-controls lesson 04-06, and schedule separate
practice time for AP-01–04. Open the API track in the portal and use the
[API testing workbook](API-TESTING.md) to choose one focused experiment per
session. Existing EX-09–16 now require stronger evidence; revisit completed
assignments if they only checked status or an empty cart. Finish with EX-17's
API/UI/persistence chain before continuing to the framework stage.


For the UI specialization, use the eleven-lesson route and twenty mapped drills
in [UI testing workbook](UI-TESTING.md). Lesson 03-11 adds 75 guided minutes;
budget extra implementation time for UI-01–04. Keep failed-save and stale-response
experiments for a session after you understand locators, assertions, and routes.
