# Keep your academy across accounts and computers

Keep the private GitHub repository as the source of truth for code. Use the
local workshop when you want progress stored in a database on your computer.
Create a separate OpenAI site from a clean copy when you want the new account
to own its own hosted portal.

These are four separate things:

| Item | Where it belongs | What a new OpenAI login changes |
| --- | --- | --- |
| Lessons, exercises, solutions, code history | Private GitHub repository and your local checkout | Nothing on disk; GitHub still requires its own authorized login |
| Local completion, exercise checks, quiz results, notes and last lesson | Local progress database | Nothing if you keep the same OS user and data directory |
| Progress on a static OpenAI site | That browser origin's storage; export a JSON backup | A different site URL has a separate record |
| Site ownership and publishing | The OpenAI account that created that site | Viewer access to the old site does not make the new account its owner |

The existing shared portal remains useful for viewing. A newly owned site is a
separate deployment with a new URL, created while signed in to the intended
account. This repository cannot create ownership for an account that is not
authenticated in the current session.

## 1. Open the same private repository in Codex

Keep your existing local folder if you are staying on the same computer. If you
need another clone, authenticate Git to the GitHub account that can read the
private repository, then run:

```sh
git clone https://github.com/i5adovyi/forge-playwright-academy.git
cd forge-playwright-academy
npm ci
npx playwright install chromium
```

Use Node.js **22.13 or newer**. On Linux, browser system dependencies can be
installed with `npx playwright install --with-deps chromium`.

Sign in to Codex with the new OpenAI account and open this local folder as a
project. Give the new chat this prompt:

> Read AGENTS.md, README.md, and docs/ACCOUNT-HANDOFF.md. This is my existing
> private Playwright academy. Inspect the checkout, install its pinned
> dependencies if needed, and run it locally. Preserve my learner database.
> Use an isolated temporary data directory for tests. Help me continue the
> lessons and maintain the source in my private GitHub repository.

Codex's official [quickstart](https://learn.chatgpt.com/docs/quickstart) and
[desktop app guide](https://learn.chatgpt.com/docs/app) describe signing in and
opening a local code folder. The app's available features depend on the signed-in
account and environment; a repository does not transfer subscriptions, chat
history, account credentials, or Sites permissions.

No OpenAI API key is required to run the academy, its local database, or the
Playwright labs. GitHub access remains independent of the OpenAI account.
Authenticate using your usual Git credential manager; do not paste tokens into
source files or a handoff document.

## 2. Work locally with persistent learner data

```sh
npm run local
```

Open `http://127.0.0.1:4173`. This is a desktop development project with a local
Node server and browser interface, rather than a packaged Electron application.
Edit lessons, implement exercises, run tests, and use Codex in the same folder.
Close the browser or stop the server when finished; restart that command for
your next session.

The default learner database is:

```text
~/.forge-playwright-academy/progress.sqlite
```

The `~` means your operating-system user's home directory. On Windows this is
inside your Windows user profile. It lives outside Git, source downloads, and
the build directory, so a clean checkout or new OpenAI login does not remove it.
All local checkouts using that same default directory share the same learner
record. For a different learner or an isolated project, select a different
directory before starting the server:

```sh
# macOS / Linux
FORGE_DATA_DIR=/absolute/path/to/my-academy-data npm run local
```

```powershell
# Windows PowerShell
$env:FORGE_DATA_DIR = "C:\Users\YourName\AcademyData"
npm run local
```

This database stores the learning record. The commerce and workplace fixtures
remain deliberately isolated, temporary training data; they are not your study
database. A local database is not cloud synchronization.

Use **My progress → Export progress** for a portable learner backup, and
**Import progress** to restore it to another installation or static site.
Review the displayed replacement confirmation before importing. Export first
when switching from an old hosted URL or browser-only record. Verify a saved
lesson and note in the destination after import before deleting an old copy.

For a filesystem backup of the SQLite database, first stop every academy server
using that data directory, then copy the entire data directory. Copying only a
live `progress.sqlite` file can miss pending SQLite WAL data. Keep learner
backups outside the repository; code backups do not contain your progress.

## 3. Prepare a separate copy for a newly owned OpenAI site

Run this from your normal checkout. Choose an absolute path whose parent exists
and whose final directory does **not** yet exist:

```sh
npm run account:copy -- --destination /absolute/path/to/forge-new-account
```

For example, on macOS:

```sh
npm run account:copy -- --destination "$HOME/Projects/forge-new-account"
```

In PowerShell:

```powershell
npm run account:copy -- --destination "$env:USERPROFILE\Projects\forge-new-account"
```

The utility refuses an existing destination, symlinks, or a destination inside
the original project. It copies the current source files, including uncommitted
lesson edits, using the same allowlist as the downloadable project. Review your
work before running it if you want a particular Git revision.

The new copy includes lessons, lab servers, starters, solutions, tests, manuals,
`AGENTS.md`, and deployment tooling. It excludes Git metadata, dependencies,
runtime databases, progress exports, secrets, reports, generated archives, and
the old `.openai` identity. The original checkout and data are unchanged.

The new `.openai/hosting.json` is deliberately:

```json
{
  "static": {
    "directory": "dist"
  }
}
```

There is no `project_id` until the new account creates its own site. The portal's
hosted-site link is also cleared, so the new copy does not present the old
account's portal as its own deployment. The repository link is retained because
it still points to the same source project.

Open the **new copy** in Codex while signed in to the intended account. Use this
prompt:

> Read AGENTS.md and docs/ACCOUNT-HANDOFF.md. This folder is an account-neutral
> copy of my academy. Install dependencies with npm ci, run validation and the
> relevant tests with an isolated data directory, build the static portal, and
> inspect it. Use the available Sites skill and native workflow to create a new
> private OpenAI site owned by the account currently signed in. Use this
> sanitized source as a retained template; if Sites requires an empty deployment
> workspace, create a separate one and follow its template-import workflow.
> Before creating, inspect the deployment's .openai/hosting.json: if it already
> contains a project_id, resolve and update that existing site instead of
> creating another. Otherwise create one, persist the returned project ID in
> that deployment workspace, set its portal/site-links.js to the returned URL,
> rebuild, and deploy. Do not change or publish the old account's site. Report
> the absolute deployment workspace, real URL, and confirmed deployment result.
> If this account cannot create Sites, keep the verified local project and
> explain the exact limitation.

Do not copy another account's session tokens or write credentials. Site
availability and publishing permissions must be checked in that new session.
The local project and static build remain usable if Sites creation is unavailable.

Once created, keep the reported deployment workspace and its hosting identity
for later updates. A GitHub push alone does not create or deploy the site. The new site's static runtime keeps
its own browser progress; import your exported JSON there if desired. It cannot
access the SQLite file on your computer.

## 4. Keep one code history and separate deployment identities

Continue coding and pushing changes from the normal private GitHub checkout.
The account-neutral copy intentionally has no `.git` directory or configured
push remote. Treat it as a deployment workspace.

To refresh it later, open the reported deployment workspace in the owning
account and ask Sites to open that existing site's source through its supported
workflow first. Then apply the latest reviewed source from a fresh account
copy while preserving that deployment's `.openai/hosting.json` and returned URL,
and ask Sites to update the same project. Do not reuse the original account's
ID or create a new site for each update. Alternatively, continue editing the deployment workspace and
deliberately bring code changes back into the normal Git checkout, excluding
deployment identity and learner data.

After changing code, review `git diff`, run the relevant checks, and commit only
the intended source files. Database files, auth snapshots, and progress exports
must stay out of GitHub even though the repository is private.

## Verify the handoff

1. In the new local session, complete a lesson and write a short note.
2. Wait until **My progress** confirms the save, then stop the local server.
3. Restart the server using the same data directory and open a fresh browser
   context. Confirm the lesson and note return.
4. Export that record and import it into a different local data directory or the
   new static site. Confirm the expected lesson and note there.
5. Confirm `git status` has no learner database, token, or exported progress.
6. If publishing, check the new site's URL and ownership in the new account;
   viewer access to the original URL is a different permission.

The save indicator says **Saved locally · SQLite** after a confirmed database
write. **Saving…**, **Unsaved draft**, or **Conflict · draft kept** are not saved
success states. For a conflict, export your draft before choosing whether to
reload the saved record or deliberately replace it. The **Your progress
storage** panel in **My progress** exposes those recovery controls.

See [Run anywhere](RUN-ANYWHERE.md) for build and test commands.
