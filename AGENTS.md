# Forge Playwright Academy

This repository is the learning portal, local practice services, and runnable
Playwright curriculum. Read `README.md` and `docs/ACCOUNT-HANDOFF.md` when opening
it in a new account.

- Use Node.js 22.13 or newer and `npm ci`. Start the full local project with
  `npm run local`. The local progress database lives outside this checkout by
  default; `FORGE_DATA_DIR` selects a different data directory.
- Preserve learner progress. Tests must use a temporary `FORGE_DATA_DIR` or the
  project's isolated test configuration; never run persistence tests against the
  learner's default database. Do not commit databases, progress exports, browser
  auth state, credentials, generated downloads, or test reports.
- Run `npm run validate` and `npm run typecheck` for curriculum changes, relevant
  test commands for behavior changes, and `npm run build` for portal delivery.
  `npm run test:hosting` verifies the static delivery after building.
- `.openai/hosting.json` identifies a deployment account's site when it contains
  `project_id`. Do not repoint the original checkout to a different account.
  Prepare a separate copy with `npm run account:copy -- --destination
  /absolute/new-directory`. That copy has no old site identity or Git history.
- To publish from a fresh copy, use the available Sites workflow in the intended
  signed-in account. Use the sanitized copy as a retained template if that
  workflow requires an empty deployment workspace. Create a private site once,
  persist its returned project ID in its deployment workspace, and report that
  path and URL; update that same site on later runs. If the account cannot
  create a site, retain the working local project and report that limitation.
  Never treat viewer access to another account's site as publishing authority.
- GitHub source access, OpenAI login, Sites publishing, and local learner data
  are separate. A Git push does not publish Sites or synchronize progress.
