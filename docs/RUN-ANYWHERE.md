# Run anywhere: OpenAI Sites, localhost, and GitHub

The academy has one source project and two runtime modes. Your learning content
does not require an AI subscription when run locally.

| Location | What works | How to open |
| --- | --- | --- |
| OpenAI Sites | Lessons, quizzes, articles, manuals, progress, complete source downloads | [Open the hosted academy](https://forge-playwright-academy.igor-sadovyi87.chatgpt.site/) |
| Localhost, full workshop | The same portal plus live shop, HTTP API, storage, UI, accessibility and visual fixtures | `npm run local`, then http://127.0.0.1:4173 |
| Localhost, static preview | The exact `dist/` portal prepared for hosting, with downloads | `npm run build`, then `npm run preview`, then http://127.0.0.1:4174 |
| Private GitHub | Versioned source, starters, solutions, manuals and CI evidence | [Open the private repository](https://github.com/i5adovyi/forge-playwright-academy) |

The hosted and preview portals display the local setup/download path for live
labs. They do not pretend to execute backend exercises. The dedicated workplace
runners start their own isolated services; use their commands in the workbooks.

## Start locally from GitHub

Install Node.js **22+** and Git. Authenticate to the GitHub account that has
access to the private repository, then run:

```sh
git clone https://github.com/i5adovyi/forge-playwright-academy.git
cd forge-playwright-academy
npm ci
npx playwright install chromium
npm run local
```

Open `http://127.0.0.1:4173`. Keep that terminal running; Ctrl+C stops it.
`npm run dev` and `npm start` are equivalent full-workshop commands.
Opening `index.html` directly with a `file:` URL will not run the module-based
portal or its API.

If you downloaded the source ZIP from the portal instead, extract it, open a
terminal inside the extracted project folder, and begin with `npm ci`.
The ZIP includes source but not Git history or GitHub authentication.

To choose another port on macOS/Linux:

```sh
PORT=4180 npm run local
```

In PowerShell use `$env:PORT=4180` before `npm run local`. Use the same `PORT`
when running the main test suite against a manually started server. A separate
terminal with no `PORT` setting uses the default. Workplace services have their
own settings documented in their respective READMEs.

## Run the tests and build

In a second terminal at the project root:

```sh
npm run validate
npm run typecheck
npm test
npm run test:preflight
npm run test:recovery
npm run test:jobs
npm run build
```

On Linux, install browser system dependencies with
`npx playwright install --with-deps chromium`.
The build uses the standard `zip` command to package source and manuals;
on Windows use WSL or install `zip`. The local workshop itself does not need it.

The build creates:

- `dist/`: the static portal to publish.
- `portal/downloads/forge-academy.zip`: runnable source with starters and solutions.
- `portal/downloads/forge-manuals.zip`: the original manuals.

After building, `npm run test:hosting` checks the static distribution, its
download, and the absence of live API routes.

Run `npm run preview` to inspect `dist/` at `http://127.0.0.1:4174`. This is
a loopback preview, not a public hosting server. The preview cannot run the
shop API. `npm run local` can. Build again after editing content to refresh
the static preview and downloads.

## Update the existing OpenAI site

This checkout's `.openai/hosting.json` identifies the existing site and `dist/`
as its static directory. In an OpenAI session with Sites publishing access,
open this project and request an update of the existing academy from this
checkout. The Sites workflow saves the source version and deploys its built
archive. A GitHub push alone does **not** deploy OpenAI Sites.

Preserve the existing private/shared audience when updating. Source control,
site viewing, and site publishing use separate permissions. Viewer access from
another OpenAI account does not grant ownership or publishing rights.
The source ZIP deliberately omits the existing hosting identity, so importing
it elsewhere should create a site owned by that account rather than silently
replacing this one. You can also host `dist/` on a static host you control.

## Push your work to private GitHub

From a clone, review and test your changes, then commit only the intended files:

```sh
git status
git diff
# Add the files you intentionally changed, for example:
git add exercises/02-api.spec.ts
git commit -m "Complete API boundary exercise"
git push origin main
```

The example file is a learner exercise; select your actual changed paths.
Use a branch if you want a reviewed change before updating `main`. Do not add
auth snapshots, tokens, `.env` files, reports or generated bundles. The repository
ignores these outputs; GitHub credentials should stay in your credential manager.
After pushing, inspect the workflow for that exact commit. A submitted workflow
is not a passed workflow.

## Keep your progress when changing accounts or hosts

Before switching, open **My progress → Export progress** and keep the JSON file.
Open the new portal origin and choose **Import progress**. Import replaces the
current local record after confirmation.

`localhost`, `127.0.0.1`, different ports, and the OpenAI domain have different
browser storage. GitHub stores code, not your notes or completion history.
The source ZIP and Git clone also do not contain those browser records.
Use GitHub access or the downloaded source to keep studying independently of
the OpenAI account. Keep the progress JSON alongside your own backup.
