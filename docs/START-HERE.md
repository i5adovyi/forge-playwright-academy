# Welcome to Playwright Forge

Build evidence that you can design, write, diagnose, and maintain automated tests. The academy combines a 40-lesson path, a local practice shop, UI and API exercises, original articles, and a research library. Work through the code yourself; completion marks are a study aid, not proof of competence.

## Your first session · 45–60 minutes

1. Read the repository README and install its dependencies. Use the committed lockfile with `npm ci` after initial setup. Install Chromium with `npx playwright install chromium`.
2. Start the portal with the command in the README. Open `http://127.0.0.1:4173` and explore the curriculum.
3. Open the practice shop at `http://127.0.0.1:4173/lab/`. Sign in using `demo@forge.test` and `Playwright123!`. This account is local training data.
4. Add an item, change its quantity, and complete a checkout. Describe three ways this journey could fail before writing code.
5. Run the supplied example suite using the README command. Open its report. Read one test and explain every `await` and assertion aloud.
6. Begin lesson **01-01**. Put your own experiments in the designated exercise area. Keep supplied reference tests available for comparison.

If setup fails, use [Troubleshooting](TROUBLESHOOTING.md). Do not spend the whole first evening reinstalling random packages.

## How to finish a lesson

Use a cycle of **predict → implement → run → break deliberately → explain → improve**.

- Predict the result before execution. State the business rule you are checking.
- Write the smallest clear test that checks it.
- Run it on its own and read the result.
- Temporarily change one expected result to an incorrect value. Confirm failure at the intended assertion, then restore it.
- Explain what the test proves and what it does not prove.
- Compare with the lesson guidance only after a serious attempt.

Keep a short learning log: lesson, command, actual outcome, one mistake, one correction, one unresolved question. A screenshot of a green badge without the command and assertions is weak evidence.

## The path

| Stage | Lessons | Outcome |
|---|---|---|
| Build your foundation | 01-01–01-05 | Understand browser/HTTP basics, TypeScript, async code, and test design |
| Your first UI suite | 02-01–02-05 | Automate meaningful flows with locators and assertions |
| Make it resilient | 03-01–03-05 | Synchronize on outcomes and diagnose UI failures |
| Go below the UI | 04-01–04-05 | Verify APIs, invalid inputs, state, and cross-layer behavior |
| Engineer your framework | 05-01–05-05 | Own data, fixtures, configuration, and parallel isolation |
| Ship reliable signals | 06-01–06-05 | Produce trustworthy CI results and useful artifacts |
| Work with AI agents | 07-01–07-05 | Review plans, generated tests, and repair proposals |
| Prove your craft | 08-01–08-05 | Deliver and defend a complete capstone |

## Choose your starting point

New to programming? Spend extra time in Stage 1 and the TypeScript/MDN resources. Experienced manual tester? Keep the test-design work and spend more time on async code. Already writing Playwright? Attempt the stage gates in [Assessment](ASSESSMENT.md), then fill the gaps. Skip content only when you can demonstrate its outcome.

## What is included and what is optional

The local lessons, original manuals, lab, and tests are intended to remain usable without an AI subscription. AI exercises can be completed with a coding agent you already have, or manually by playing the planner/reviewer roles yourself. External courses may require an account; paid books are optional. The library links to legitimate publisher pages and does not bundle commercial books.

A local server is required for the live practice API. A static copy of the portal can display lessons but cannot replace the local API server. Browser installation requires a download the first time. Do not count a browser that was never installed or run as tested.

## Your desk reference

- [Field Manual](FIELD-MANUAL.md): commands, patterns, UI/API judgment, review checklists.
- [Study Plans](STUDY-PLANS.md): 4-, 8-, and 12-week paths.
- [AI Agents](AI-AGENTS.md): planner/generator/healer workflow and prompt pack.
- [Capstone](CAPSTONE.md): requirements, acceptance criteria, and presentation.
- [Assessment](ASSESSMENT.md): stage gates and scoring.
- [Glossary](GLOSSARY.md): the vocabulary used throughout the project.
- [Local API contract](lab-api.md): exact payloads and status codes.

## Continue into fixtures and browser state

Choose **PW Docs track** in the sidebar for an eight-lesson route through the official docs. Open [the fixtures and state workbook](FIXTURES-AND-STATE.md), run `npm run test:state`, and explore `http://127.0.0.1:4173/state/` after starting the server. Use your chosen port if different. The FS-01–FS-10 starters live in `state/practice.spec.ts`; remove one skip and implement its acceptance criteria before comparing `state/worked.spec.ts`.
