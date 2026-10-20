# Project closeout — Forge Playwright Academy

Recorded on October 20, 2026. This is the historical handover for the academy's
initial build and review phase. It describes delivered work, evidence and
operational boundaries; it is not a promise to implement every roadmap idea.

## Closure decision

The implemented learning project is ready for use and ongoing maintenance.
This build phase can be closed once its final source checkpoint, CI, hosted
deployment and offline archive have been verified. The closing checkpoint is
the Git tag `academy-closeout-2026-10-20`; its commit and delivery results are
recorded in the local archive's `DELIVERY-RECEIPT.json`.

No learner exercise needs to be completed to close development. Skipped
starters, TODOs in assignments and controlled failures are intentional teaching
material. Completion marks are the learner's own assessment.

Creating a site owned by the next OpenAI account remains an operational step
after signing into that account. The prepared source and instructions are
delivered; viewer access to the existing site does not transfer ownership.
This does not prevent local study or closing the current build phase.

## Why this project exists

Forge started as a personal Playwright and TypeScript academy intended to
survive a subscription or account change. It grew into a reusable study portal
with original lessons, real local UI/API practice, unfinished starters, worked
solutions and a portfolio capstone.

The guiding idea is to teach the difficult parts of automation as well as its
syntax: choosing meaningful assertions, isolating state, explaining a failure,
detecting the wrong environment, recovering from uncertain writes, observing
asynchronous work, and recognizing incomplete CI evidence. AI assistance is
part of the workflow, with review and executable verification.

## Delivered inventory

| Component | At closeout |
| --- | --- |
| Learning sequence | 8 stages, 61 original lessons |
| Written practice | 122 challenges with criteria, hints and reference approaches |
| Knowledge checks | 61 quizzes |
| Runnable assignments | 74 stable assignment IDs, with starters and solutions |
| Reference shelf | 39 external resources and 8 original articles |
| Portal manuals | 26, including this historical record |
| Learner tools | Notes, acceptance checklists, completion, quizzes, import/export and resume |
| Local services | Forge Shop, its HTTP API, specialist fixtures and workplace services |
| Quality evidence | Reference suites, controlled fault proofs, reviewed visual baselines and CI |
| Portability | Full local project, static portal, source/manual downloads and account-neutral copy |
| Personal storage | Local SQLite, recoverable browser drafts, backups and explicit conflict handling |

The 74 assignment IDs comprise 24 shop drills, 6 browser-skills drills,
4 accessibility labs, 4 visual exercises, 10 fixtures/state drills, 4 advanced
API drills, 4 UI transition drills, 9 workplace assignments and 9 real-world
systems assignments. IDs, written challenges and executed test cases are
different counts.

## Build history

1. **Foundation:** created the staged curriculum, portal, local shop/API,
   runnable exercises, solutions, articles, legal resource links and capstone.
2. **Initial review:** improved lesson clarity, navigation, state handling and
   browser-feature practice; made receipt downloads explicit across browsers.
3. **Quality workshops:** added accessibility diagnosis, keyboard/error
   recovery and visual-baseline exercises. Reviewed platform-specific images
   and configured CI to compare without silently updating them.
4. **Deeper track reviews:** expanded fixtures, contexts, storage and
   authentication; strengthened API ownership, boundaries and mutation
   evidence; improved UI journey, recovery and stale-response experiments.
5. **Workplace batch:** added incident diagnosis, CI coverage gates,
   page-object refactoring and data builders, each with deliberate faults and
   acceptance evidence.
6. **Real-world systems batch:** added wrong-build detection, idempotent
   recovery after lost replies and bounded asynchronous-job observation.
7. **Portability and data:** separated static hosting from the full local
   workshop, introduced SQLite progress, account-neutral copies, filtered
   downloadable source and an account handoff guide.
8. **Session continuity and closeout:** aligned README, AGENTS and CLAUDE,
   recorded verification and this history, and preserved the source checkpoint.

Useful source milestones are `21dfd97` (initial review), `087b163` (download
behavior), `6a8adb9` (accessibility/visual workshops), `1680203` (Linux
references), `56affee` (workplace batch), `122f926` (systems/hosting),
`c0802cb` (local persistence/handoff), `9f0ed9b` (proof-runner integration fix),
and `bf22eb0` (session documentation). The final closeout tag identifies the
closing source. Some historical commits have generic Site workflow subjects;
inspect their changes rather than treating the subject as a complete summary.

## Evidence and its limits

[The verification record](VERIFICATION.md) contains the detailed executed
checks and earlier platform limitations. At the persistence/handoff release:

- Main suite: **186 passed; 56 intentionally skipped starters**.
- SQLite/backend: **13 passed**.
- Packaging/account portability: **14 passed**, including real builds and
  archive inspection for private-data exclusions.
- Persistence UI: **14 passed** in a fresh account copy with disposable data.
- Static hosting: **2 passed**; macOS visual comparisons: **4 passed**.
- All then-current 25 manuals rendered at desktop and mobile widths.
- Workplace/system proofs exercised successful controls and specifically
  expected failures; unrelated setup errors were rejected as invalid evidence.

The complete Linux pipeline passed at
[`9f0ed9b`](https://github.com/i5adovyi/forge-playwright-academy/actions/runs/39477581645).
The [workflow history](https://github.com/i5adovyi/forge-playwright-academy/actions)
and closing delivery receipt identify the final commit's own result. A queued
or running workflow is not a pass. CI reports expire according to their
retention settings; the source, proof runners and this written evidence remain.

The optional three-engine shop matrix was verified earlier in the project.
That is not evidence that every later specialist track was run on all engines.
Visual comparisons are platform-specific. Accessibility scans do not prove
conformance. Controlled training services do not establish production security,
distributed exactly-once behavior or load capacity.

## Postmortem: findings and prevention

No production outage or learner-data loss was observed during this work.
The following defects were discovered through review or verification and fixed.

| Finding | Resolution | Lesson for future work |
| --- | --- | --- |
| Duplicate tabs could inherit a draft identifier | Give each document its own draft key and retain prior drafts for recovery | Browser storage lifetime and document lifetime differ |
| A stale tab could target a replacement database at the same revision | Require database identity and revision together | A revision number alone does not identify a dataset |
| A delayed reload could replace newly typed notes | Check the edit version before applying the response; serialize resolution | Confirmation does not freeze subsequent user input |
| A lost response could hide a committed save | Reconcile the persisted result before retrying | Transport failure is not proof of rollback |
| Explicit import could discard unknown progress fields | Reject incompatible imports without changing the existing record | Validation must preserve meaning, not merely parse JSON |
| Opening a future schema could modify journal settings first | Inspect schema compatibility before mutations | Rejection should preserve unsupported files byte-for-byte |
| A configured data directory reached through an alias could enter downloads | Compare canonical paths and inspect actual built archives | Packaging is a data boundary, not just a file-copy task |
| A copied mutation server could not resolve a newly added local-data import | Preserve dependency paths and static root in the controlled copy | A proof must fail for its intended defect; setup failures must not count |
| Session knowledge depended on a long chat | Put purpose, architecture, commands and boundaries in repository documentation | A new session must be able to continue from source alone |

The proof-runner integration defect was caught by
[the failing pipeline](https://github.com/i5adovyi/forge-playwright-academy/actions/runs/39476802734).
The subsequent complete pipeline passed. Assertions were retained. During
closeout, a remaining lab-page instruction was corrected from Node 22 to the
required Node 22.13 minimum.

## Where the project is stored

These local paths describe the original machine at closeout, not portable
configuration. A new machine can use different paths.

| Store | Location and responsibility |
| --- | --- |
| Working source | `/Users/igor_sadovyi/Projects/is-qa-playwright` |
| Private source/history | [GitHub repository](https://github.com/i5adovyi/forge-playwright-academy) |
| Hosted portal | [Existing OpenAI Site](https://forge-playwright-academy.igor-sadovyi87.chatgpt.site/) |
| Prepared account copy | `/Users/igor_sadovyi/Projects/forge-academy-new-account-2026-10-20` |
| Closing offline archive | `/Users/igor_sadovyi/Projects/forge-academy-archive-2026-10-20` |
| Personal local record | `~/.forge-playwright-academy/progress.sqlite`, unless `FORGE_DATA_DIR` selects another directory |

The offline archive is intended to contain the filtered source ZIP, manual ZIP,
a Git bundle for the closing branch/tag, this record, a delivery receipt and
SHA-256 checksums. It is a source/history backup on the same machine, not an
off-device backup or a learner-progress backup. The receipt confirms its actual
contents and delivery status.

Dependencies, `dist/`, generated portal docs/downloads and test reports are
deliberately not committed. Rebuild them with the documented commands.
Credentials, browser authentication state, learner exports and databases must
remain outside source and downloads. Existing local study data is preserved;
closeout does not inspect or export personal notes.

## Continue, restore or hand over

1. Open the working folder, clone the private repository, or unpack the source
   ZIP. For Git history offline, clone the archived Git bundle.
2. Read [README](../README.md), [AGENTS](../AGENTS.md) and the relevant workbook.
   [CLAUDE](../CLAUDE.md) points to the same shared context.
3. Use Node 22.13+ and run `npm ci`, `npx playwright install chromium`, then
   `npm run local`. Local study does not require an OpenAI subscription.
4. Preserve or restore progress using [Local data](LOCAL-DATA.md). Hosted
   browser progress requires an explicit export/import; a Git clone does not
   contain it.
5. For another publishing account, follow [Account handoff](ACCOUNT-HANDOFF.md).
   Keep the original deployment identity. Publish from the neutral copy in the
   intended signed-in account and retain its new site ID there.
6. Treat [the workplace roadmap](INTERVIEW-AND-WORKPLACE.md) and
   [the academy review](REVIEW.md) as proposals where labeled. New additions
   belong to a new task with their own acceptance criteria.

The local project is a Node service used in a browser, not a packaged desktop
application. Source access, OpenAI login, publishing authority and learner data
are independent. External courses and books retain their authors' terms.
Commercial pricing, accredited certification, automatic cloud synchronization
and every future roadmap exercise are outside this closeout.
