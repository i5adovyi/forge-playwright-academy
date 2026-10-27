# Forge Playwright Academy — shared agent instructions

## Purpose and teaching standard

Forge is a practical Playwright + TypeScript academy: a polished learning portal,
original lessons and manuals, local applications/APIs, unfinished exercises,
worked solutions, and evidence-based assessments. It started as a personal
learning project and is designed to remain reusable and maintainable.

The learner wants interview readiness and the difficult situations encountered
at work: diagnosis, timing races, ownership of state, misleading green runs,
failed writes, recovery, incomplete CI evidence, and maintaining an inherited
suite. Preserve the foundations and a clear progression while adding that depth.

Connect each runnable topic to a lesson, a brief, a starter, a solution, a run
command, and observable acceptance criteria. Written investigation/design
exercises need a reference approach and rubric. A passing reference solution
does not grade the learner's unfinished starter. Completion is self-reported.
Explain the limits of the fixture and the evidence; avoid unsupported claims
about production reliability, accreditation, or course value.

`AGENTS.md` is the shared maintenance guide. `CLAUDE.md` directs Claude to this
file so separate assistants do not accumulate conflicting project instructions.
The current user request defines the work to do.

## Begin every new session

1. Read `README.md`; inspect the current directory, `git status`, branch and
   recent commits. Preserve existing learner edits and unrelated changes.
   An account-copy folder may deliberately have no Git metadata.
2. Read the relevant workbook in `docs/` and the actual fixture, starter,
   solution and configuration. Read `docs/VERIFICATION.md` for executed evidence.
3. Use `docs/REVIEW.md` and `docs/INTERVIEW-AND-WORKPLACE.md` as background.
   They contain both delivered work and proposals; inspect source before
   calling a proposal implemented. Do not turn the whole roadmap into a task.
   Read `docs/PROJECT-CLOSEOUT.md` for the initial build's history and handover.
   Keep historical evidence dated; do not rewrite it as a claim about new work.
4. For account changes, read `docs/ACCOUNT-HANDOFF.md`. For progress or storage
   changes, also read `docs/LOCAL-DATA.md` and `local-data/README.md`.
5. Check available tools and the authenticated account before external actions.
   A previous chat's tools, logins, temporary paths or test results may be stale.

Do not recreate the academy from scratch. Continue the existing architecture
unless the task requires changing it. Ask only for missing decisions that affect
the result; do authorized implementation and verification without unnecessary
confirmation. Use subagents for independent reviews when requested.

## Architecture and source ownership

| Area | Files and responsibility |
| --- | --- |
| Portal | Plain HTML/CSS and browser ES modules in `portal/`; hash routes in `portal/app.js` |
| Appearance | `portal/theme.js` applies System/Light/Dark before paint; `portal/theme.css` holds screen-only overrides. Browser-local preference is separate from progress and exports. |
| Curriculum | `portal/content/curriculum.js` imports workplace and real-world lesson modules |
| Exercise mapping | `portal/content/practice.js` maps stable drill IDs to lessons, files and commands |
| Library | `portal/content/library.js` holds resource links and original articles |
| Manuals | Edit `docs/`; register new portal manuals in the `manuals` list in `portal/app.js` |
| Beginner entry | `portal/content/beginner-lessons.js`, `beginner/`, `docs/BEGINNER-START.md`; additive 00-01–00-06 runway before the original path |
| Main training app/API | `server.mjs`, `lab/`, `tests/`, `exercises/`, `solutions/` |
| Specialist labs | `skills/`, `state/`, `api-workshop/`, `ui-workshop/`, `quality/` |
| Workplace/systems labs | `workplace/`; each subfolder's README explains its runner and faults |
| Personal progress | `portal/progress-store.js`, `local-data/`, `tests/persistence/` |
| Build and portability | `scripts/build.mjs`, `scripts/source-manifest.mjs`, `scripts/new-account-copy.mjs`, `tests/portability/` |

Keep the simple local-first structure and established portal design. Tests and
helpers use TypeScript; the server, portal and build tools use JavaScript ES
modules. Dependency versions come from `package.json` and its lockfile.

`dist/`, `portal/docs/`, and `portal/downloads/` are generated. Edit their source,
then run `npm run build`. The source manifest controls files included in both
downloads and account copies; include new runtime/configuration/context files
there when necessary.

## Runtime and learner data

- Use Node.js **22.13+**; `.nvmrc` recommends Node 24. Install with `npm ci`,
  then `npx playwright install chromium` when browsers are needed.
- `npm run local` (also `dev`/`start`) runs the full workshop on loopback port
  **4173**. `npm run preview` serves built static output on **4174**.
- The full local portal stores one learner record in
  `~/.forge-playwright-academy/progress.sqlite`, outside the checkout.
  `FORGE_DATA_DIR` selects a separate directory. Local clones using the same
  directory share that record, independently of OpenAI/GitHub logins.
- Static/OpenAI-hosted portals use browser storage. They cannot access local
  SQLite. Export/import transfers records; there is no automatic cloud sync.
- Shop and workplace fixture state is temporary training data. Browser
  `storageState` and authentication fixtures are separate from learner progress.

Preserve notes, completion, acceptance checks, quizzes and last-lesson state.
Never run tests against the learner's real database, reset it during debugging,
or silently repair it by deleting files. Tests must use temporary data
directories or the existing browser-only configurations.

Database writes require both database identity and revision. Keep truthful save
states, recoverable drafts, explicit conflict decisions and strict import
validation. A request failure does not prove that a write was never committed.
Back up with the CLI or portal; never copy only part of a live SQLite/WAL set.
Do not commit or publish databases, learner exports, auth snapshots, credentials,
`.env` files or test reports. Generated course ZIPs are intentional portal
downloads: rebuild them from the filtered source manifest, inspect their
contents, and keep the generated files out of Git.

## Curriculum and exercise changes

- Preserve existing lesson/exercise IDs and acceptance-key meaning. Saved
  progress depends on them; structural changes may require a migration.
- Read the actual API/fixture contract before changing explanations or
  expectations. Verify new/version-sensitive Playwright guidance against
  official documentation and the installed version.
- Keep lessons, practice mappings, starters, solutions, workbooks, npm commands
  and test discovery consistent. Update current inventory assertions when
  deliberately adding lessons/drills; retain historical verification records
  as historical evidence.
- Preserve unfinished starters, intentional skips, enable flags and sentinel
  failures. Do not auto-complete a learner's assignment unless requested.
- Test observable outcomes, rejection without unintended mutation, isolation,
  persistence and recovery where relevant. Keep expected results independent
  of the implementation/helper being tested.
- Controlled faults must fail at the intended oracle. A missing module,
  unrelated timeout, malformed report or missing browser is not successful
  defect detection. Do not weaken assertions or expand tolerances to get green.
- Visual baselines are reviewed assets. Normal comparisons never update them.
  Automated accessibility scans are only part of accessibility evidence.
- Label future exercises as proposed until their runnable parts exist and are
  verified. Link external books/courses/videos legally; do not bundle paid works.

## Verification proportional to the change

| Change | Relevant checks |
| --- | --- |
| Curriculum or mappings | `npm run validate`, `npm run typecheck`, affected lesson/drill tests |
| Portal behavior | `npm run test:portal`; check affected desktop/mobile routes |
| Shop/API/framework | Relevant projects; `npm run test:all` for shared behavior |
| SQLite or progress UI | `npm run test:data`, `npm run test:persistence` |
| Packaging/account copies | `npm run test:portability`, build, inspect required source in the ZIP/copy |
| Static delivery | `npm run build`, `npm run test:hosting` |
| Visual/accessibility | Their separate scripts and applicable human review |
| Workplace/systems behavior | The affected folder's reference runner and controlled proof |

Main Playwright tests own a browser-only server on **4175**; visual tests use
**4176**. They refuse to reuse a personal workshop server. Use an unused `PORT`
if overriding it. The persistence suite owns disposable databases.

`npm run test:all` does not include every standalone runner: visual, hosting,
persistence and workplace/system proofs have separate commands in `package.json`.
Intentionally skipped starters do not count as completed exercises. A successful
proof runner may contain expected failed child runs; inspect its final verdict
and exact expected failures.

Documentation-only changes need link/content review and applicable build checks,
not a newly invented test suite. Run additional checks when a dependency,
failure or unresolved concern justifies them. Record exact outcomes and limits;
do not describe a configured or queued CI check as passed.

## Accounts, source control and publishing

The private GitHub repository is the shared code history. GitHub authentication,
OpenAI login, site viewing/publishing, and local data are separate boundaries.
A Git push does not publish Sites or synchronize progress.

Read `.openai/hosting.json` before publishing. Its `project_id`, when present,
identifies this deployment. Use the available Sites workflow to open its source
before editing for publication; retain the ID and current private/shared audience.
Do not hardcode a remembered project ID or assume a viewer can publish.

To prepare a different account, use
`npm run account:copy -- --destination /absolute/new-directory`. Preserve the
original checkout. The new copy has no old site ID, Git history or credentials.
Create its private site while signed into the intended account; if the Sites
workflow requires an empty deployment workspace, use the copy as a retained
template. Persist the returned ID and URL there, then update that same site on
future runs. Report the actual workspace and deployment result. If Sites is
unavailable, preserve the usable local project and explain the limitation.

For authorized delivery, review the diff, run the relevant checks, commit/push
the intended source and publish when requested or required by the active Sites
workflow. Preserve user instructions such as local-only work. Check the actual
CI/deployment outcome and report pending or failed checks honestly.

Before finishing, keep these context files and the README aligned with lasting
architecture/workflow changes. Put detailed test evidence in
`docs/VERIFICATION.md` and feature review notes in `docs/REVIEW.md`; do not store
tokens, private learner content or transient session logs in agent instructions.
