# Start from zero — a complete beginner's guide

You can start without programming, Git or automation experience. This guide
is the slow entrance: six lessons, eight small code drills and a repeatable
way to get unstuck. The original curriculum and advanced labs remain available.
The `00-` lesson IDs are a preparatory route inside the foundation stage; they
do not renumber the original eight stages or replace any existing lesson.

## What you need, and what can wait

Use a computer on a supported Playwright operating system, an internet
connection for the initial downloads, a browser, a text/code editor and Node.js.
This project recommends **Node 24** and requires **22.13 or newer**. No paid
course, AI subscription, API key, Docker installation, database server or
GitHub account is needed to use a downloaded copy. A private GitHub clone does
require access to that repository. Your editor can be VS Code or another editor
that saves plain-text files; do not edit code in a word processor.

The hosted academy works for reading. To run its exercises, download the full
project from Getting started or Start from zero and extract the ZIP first.
Do not try to edit files while they are still inside the archive viewer.

You do not need to learn fixtures, CI, page objects or AI agents in your first
session. Start with one readable test. Return to those tracks when the exit
gate below feels comfortable.

An automated **test** is a repeatable setup, action and check. For your first
one, the setup is the local shop, the action opens its page, and the check asks
whether its expected heading is visible. The runner reports what happened.

### From the download button to an open folder

If you already have an edited copy, reopen that copy. A fresh download does not
contain your earlier exercise edits; do not extract it over your working folder.

1. On **Start from zero**, select **Download the runnable project**. The file is
   `forge-academy.zip`. The separate `forge-manuals.zip` contains reading material
   only, so it cannot run the exercises.
2. Find the ZIP in your browser's downloads or your computer's Downloads folder.
   On Windows, right-click it and choose **Extract All**, then choose a destination.
   On macOS, double-click the ZIP in Finder. On Linux, use your archive manager's
   extract action and choose a destination. Follow the official
   [Windows extraction guide](https://support.microsoft.com/en-us/windows/experience/storage-filemanagement/zip-and-unzip-files)
   or [macOS extraction guide](https://support.apple.com/guide/mac-help/zip-and-unzip-files-and-folders-on-mac-mchlp2528/mac)
   if the archive is unfamiliar.
3. Open the resulting ordinary folder. Find **package.json, README.md and
   server.mjs together**, with a `beginner` folder beside them. That is the folder
   to open; its name can differ from an example in this guide.
4. If you need an editor, install the desktop version of **Visual Studio Code**
   using its [official setup guide](https://code.visualstudio.com/docs/getstarted/overview).
   Its browser version is not the local editor/terminal workflow described here.
5. In VS Code, use **File → Open Folder** and select the folder from step 3. In
   the Explorer file list, expand `beginner` and open `worked.spec.ts`. This shows
   the existing course files; you do not need to create a blank project.
   See the [editor tutorial](https://code.visualstudio.com/docs/editing/getting-started/editor-tutorial).
   If a trust prompt appears, confirm the folder is the academy copy you intended
   to open before allowing its code to run.
6. Use **Terminal → New Terminal** in VS Code. A panel with a command prompt
   opens. Click inside that panel before entering commands. A second terminal
   can be opened with the panel's **+** button. See
   [terminal basics](https://code.visualstudio.com/docs/terminal/basics).
7. Follow the Node installation and location checks below before running tests.
   Keep a short note of this folder's location so you can reopen the same copy
   next time. Editor extensions, AI chat and a Git account can wait.

## Four places you will use

| Place | What belongs there | Example |
| --- | --- | --- |
| Editor | Saved source code and notes | Open `beginner/practice.spec.ts` |
| Terminal | Commands run in a current folder | `npm run test:beginner -- --grep BG-05` |
| Browser address bar | A URL served by a running application | `http://127.0.0.1:4173/lab/` |
| Browser developer tools | Inspecting a page, console or HTTP request | Network tab, products request |

A **directory** is a folder. A **path** identifies a file or folder. The
**project root** contains `package.json`, `README.md` and `server.mjs` together.
A **spec** is a file of test cases, here ending in `.spec.ts`. A **command prompt**
is the marker where your terminal accepts the next command. Do not copy prompt
symbols such as `$`, `>` or `PS C:\...>` from examples into commands.

**Commands, examples and output are different.** Copy a Terminal command into
the terminal, then press Enter. Code examples belong in the editor only where
the lesson tells you to edit a starter; some show only part of a test. Output
such as `1 passed` is what you read after a run, not another command to enter.
The portal's Copy button copies text; it does not run a test or save a source
file. Keep the page open for reading while using the editor and terminal locally.

## 1. Install and find the project

Download Node 24 using the [official Node installation page](https://nodejs.org/en/download).
Choose instructions for your OS. Use your approved installation method on a
managed computer; do not bypass its policy if installation is restricted.
Close and reopen the terminal after installation so it can find Node.

Open the extracted project folder in your editor. If it has a built-in terminal,
open a new terminal there. Otherwise use the OS instructions below. Replace
example paths with your actual extracted folder; keep quotes around paths with
spaces. Run each command separately and read its output before continuing.

### macOS Terminal or Linux shell

```sh
cd "/absolute/path/to/your/extracted/forge-academy"
pwd
ls
```

`cd` changes directory; `pwd` prints the current directory; `ls` lists its
contents. On macOS, Terminal is in Applications → Utilities. On Linux, open
your desktop's terminal application. Install Node using the official
instructions for that platform if it is not already available.

### Windows PowerShell

```powershell
Set-Location "C:\Users\YourName\Downloads\forge-academy"
Get-Location
Get-ChildItem
```

Open PowerShell from the Start menu or your editor. The folder must contain
`package.json`, not just another folder with the project inside. If PowerShell
blocks `npm.ps1`, try the installed Windows command shim `npm.cmd` (and
`npx.cmd` for npx) or use Command Prompt. You do not need to disable execution
policy to learn Playwright. For a corporate restriction, keep the error and
ask your administrator which supported route to use.

### Check tools and location on any of those systems

```sh
node --version
npm --version
node -p "process.cwd()"
```

The first two commands print versions. The last prints the terminal's working
folder. If Node is missing, fix installation before attempting npm commands.
If the version is below 22.13, select/install a supported version. The included
`.nvmrc` is for people already using a Node version manager; you do not need to
learn one to get started.

For example, a supported Node installation may print a version beginning with
`v24.`; the remaining digits and npm version can vary. Record the actual output.
If your initial setup log says **not installed yet**, that is a useful observation,
not a failed assignment. Complete installation, reopen the terminal and check
again. When `ls` or `Get-ChildItem` shows only another folder, open that folder
and check again until the three root files are together.

## 2. Install the project's dependencies and browser

From the project root:

```sh
npm ci
npx playwright install chromium
```

`npm ci` installs the packages locked in `package-lock.json`; it is not a test
run. It recreates dependency installation, not your authored source. `npx`
invokes the installed project tool here. The second command downloads the
Chromium build needed by Playwright. Installing packages and installing the
browser are different steps. Do not run a new-project generator inside this
existing academy, and do not install a different global Playwright to hide an
installation error.

On a supported Linux system that reports missing system browser dependencies,
follow [Playwright installation guidance](https://playwright.dev/docs/intro),
including `npx playwright install --with-deps chromium` when appropriate. That
may require system installation permissions. Windows and macOS setup should
use their supported platform instructions. These written OS instructions are
not a claim that this project was manually installed on every OS.

## 3. Get one known example to pass

```sh
npm run test:beginner -- --grep BG-05
```

Expected: **one passed test**, from `beginner/worked.spec.ts`, in the project
named `beginner`. Playwright starts its own service on port 4175, runs the check,
and stops that service. No manually started server is needed for this command.
The default browser is headless: a browser runs without displaying a window.

Command translation:

| Part | Meaning |
| --- | --- |
| `npm run` | Run a named script from package.json |
| `test:beginner` | Select the supplied beginner solutions project |
| `--` | Pass the remaining arguments through npm to Playwright |
| `--grep BG-05` | Select tests whose title matches BG-05 |

Open `beginner/worked.spec.ts` and find BG-05. Compare every line with lesson
00-04. The import uses this project's prepared support module, which supplies
Playwright's tools and fresh test session state. You do not need to implement
that fixture yet.

Optional: add `--headed` to the same command to see the browser. Run
`npm run test:report` after a test to inspect its HTML report. The report server
may keep that terminal occupied; use Control+C to stop it. Reports describe the
latest run, so record the command and time when you compare results.

## 4. Explore the application by hand

In terminal A:

```sh
npm run local
```

Leave it running. Open `http://127.0.0.1:4173` for your learning portal and
`http://127.0.0.1:4173/lab/` for the practice shop. A long-running command that
prints a listening URL and does not return a prompt is behaving normally.
Use terminal B for test commands, after checking it also points at the root.

The personal server uses **4173**. The main tests use **4175**. Do not make
tests attach to the personal server. `file://.../index.html` is not a running
server. The hosted site and static preview display teaching content; the full
shop/API runs through `npm run local`.

Try a manual case: search for `head`, expect Studio Headphones, then search for
`quantum toaster`, expect No products found. Write the expected result before
clicking. For checkout later, the local demo login is
`demo@forge.test` / `Playwright123!`; do not use real personal details.

Stop terminal A with Control+C. Starting `npm run local` again keeps committed
study progress in SQLite, but the shop's temporary cart/order state resets.
Wait for the portal's save indicator before closing it.

### Follow one request in the browser

For lesson 00-03, start the local server again if you stopped it, then open
**http://127.0.0.1:4173/lab/** in a browser with developer tools. This is the shop,
not the hosted lesson page. The following is observation, with no code to paste:

1. Open developer tools. In Edge, right-click the page and choose **Inspect**,
   then select **Network**. In Firefox, open **Network** from Web Developer
   Tools, or use Control+Shift+E (Command+Option+E on macOS).
   Official walkthroughs: [Edge Network](https://learn.microsoft.com/en-us/microsoft-edge/devtools/network/)
   and [Firefox Network Monitor](https://firefox-source-docs.mozilla.org/devtools-user/network_monitor/index.html).
2. Leave Network open. In the **shop's Search products box**, clear any earlier
   text and enter `head`. The Network filter box and the shop search box have
   different jobs; only the shop search asks for new products.
3. In Network's filter box, enter `products`. Select the request whose URL
   includes `/api/products` and `search=head`. There may be several rows from
   typing; inspect the matching completed request, not merely the top row.
4. In **Headers**, read its request URL, method **GET** and status **200**. In
   **Response**, read the JSON: `total` is `1`, and the first product's `name`
   is `Studio Headphones`. Expand collapsed objects/arrays if needed. See
   [Firefox request details](https://firefox-source-docs.mozilla.org/devtools-user/network_monitor/request_details/index.html).
5. Compare that with the one Studio Headphones card visible in the shop. Record
   the search text, URL, status, response name and displayed name in your lesson
   notes. These are observations of the same search, not guesses from the lesson.

If there are no rows, keep the tools open and repeat the search. Clear the
Network filter if it hides everything. If only a portal document appears, check
the `/lab/` address. A browser with different menus can use its own Network
tool; no browser extension or paid tool is needed for this observation.

## 5. Make your first change safely

1. Open `beginner/practice.spec.ts`. Find BG-05.
2. Change **only that case** from `test.skip` to `test`.
3. Keep its navigation. Replace the failing sentinel with an awaited assertion
   that the exact heading Good tools. Great work. is visible.
4. Save the file (Command+S on macOS; Control+S on Windows/Linux).
5. Run `npm run test:beginner:practice -- --grep BG-05`.
6. Read whether it passed, failed, was skipped or selected no tests. Only an
   executed assertion provides evidence.
7. Temporarily change your expected heading to This heading does not exist.
   Rerun and confirm the intended assertion fails. Restore the real heading,
   save, rerun and explain the difference.

Keep supplied solutions intact for comparison. Editing a file in the editor
without saving it does not change the version the runner reads. Removing a
skip while leaving the sentinel makes the case intentionally fail until you
implement its criteria. This prevents an unfinished body from appearing green.

### Find the exact edit and keep the surrounding test

In the editor's file list, expand `beginner`, open **practice.spec.ts**, and
click in the code. Use **Find** (Command+F on macOS; Control+F on Windows/Linux),
enter `BG-05`, then press Escape after locating its test. The file tab must say
`practice.spec.ts`, not `worked.spec.ts`. Find searches text; it does not change
anything. The editor's [basic editing guide](https://code.visualstudio.com/docs/editing/codebasics)
covers Find and saving.

A **TODO** comment names the work still to do. A **sentinel** here is an
intentionally impossible assertion: `expect(false, '...').toBe(true)`. It makes
an enabled but unfinished test fail clearly. `false` cannot equal `true`; the
message between quotes tells you which assignment is unfinished.

Make this change to the **start of BG-05's existing test line**:

```text
Before: test.skip('BG-05 · Open the shop and check its heading', async ({ page }) => {
After:  test('BG-05 · Open the shop and check its heading', async ({ page }) => {
```

The words `Before:` and `After:` explain the edit; do not type them into the file.
Keep the first import at the top, the existing `await page.goto('/lab/');` line,
and this test's closing `});`. Add your heading assertion **inside** this test,
after navigation and before that closing line. Delete only BG-05's sentinel
assertion when replacing it with the real check. Leave the other seven tests
and their skips alone. Do not add a second BG-05 test or a second import.

Try to write the assertion from lesson 00-04. If you need a comparison, the
matching BG-05 in `worked.spec.ts` shows the complete test. Compare that one
test without replacing the whole practice file. Save with the editor's **File
→ Save** command or the save shortcut, then run the **practice** command. A
successful `test:beginner` command still runs the supplied example, even when
you have edited `practice.spec.ts`.

Keep a small record of the deliberate failure and its repair:

| Run of your BG-05 starter | Expected evidence | Meaning |
| --- | --- | --- |
| Still has `.skip` | `1 skipped` | Its body has not executed |
| Skip removed, sentinel left | Failure with the BG-05 unfinished message | The runner reached unfinished work |
| Real heading assertion | `1 passed` | This heading check executed successfully |
| Temporarily wrong heading | `1 failed`, locator assertion points at your changed expectation | Your check can reject the deliberately wrong claim |
| Original heading restored | `1 passed` | You returned the case to its intended behavior |

Exact formatting and durations vary. Read the filename, selected project and
first relevant error as well as the count. When another error appears, use the
failure table below; do not report it as the planned wrong-heading result. You
can save this record in **Your field notes**; that saves notes, not the edited
test file. Returning the test to green is part of the experiment.

## Your six-lesson route

| Lesson | Focus | Small practical step |
| --- | --- | --- |
| 00-01 | Terminal, folder, editor, server and runner | Run one known BG-05 example |
| 00-02 | Values, objects, arrays, functions and decisions | BG-01, BG-02, BG-03 |
| 00-03 | HTML, URLs, requests, responses and JSON | Observe a local search in Network |
| 00-04 | Test anatomy, promises, await and locators | BG-04, BG-05, BG-06 |
| 00-05 | A first API read and a rejected input | BG-07, BG-08 |
| 00-06 | Diagnosis, saving, Git and asking for help | Demonstrate the exit gate |

The portal **Start from zero** route opens these lessons and uses the same
notes, quizzes and completion system as the main curriculum. Existing progress
is retained. Because six lessons were added, an existing learner's percentage
can be lower while their completed lesson IDs remain unchanged.

Each lesson has two written challenges. Some direct you to the BG exercises,
so the twelve challenges and eight runnable drills are connected views of the
same learning work, not twenty unrelated assignments. **Reveal the worked
solution** in a challenge explains the expected approach in words. **Where to
compare your solution** in the practice map gives a local code-file path.
Neither button runs your test or automatically marks it complete.

## Eight micro-exercises: criteria and comparisons

Every BG starter is in `beginner/practice.spec.ts`; its worked solution is in
`beginner/worked.spec.ts`. Run one with
`npm run test:beginner:practice -- --grep BG-01`, changing the ID as needed.
Run the matching reference with `npm run test:beginner -- --grep BG-01`.

| ID | Definition of done | A useful challenge to the check |
| --- | --- | --- |
| BG-01 | Number vs string is checked; 12900 × 2 equals independently expected 25800 | Change quantity to 3 and keep the expectation; the total assertion must fail |
| BG-02 | Read object price, first array item and both complete ordered names | Change the second name; an exact array assertion must fail |
| BG-03 | Integer rule accepts 1/99 and rejects 0/100/1.5 | Permit zero; its explicit false expectation must fail |
| BG-04 | Await doubled values from [1,2] and observe [2,4] in order | Multiply by 3; the expected sequence must fail |
| BG-05 | Navigate and await the exact visible heading | Temporarily use a wrong expected heading; restore it afterward |
| BG-06 | Empty query result has zero cards; a later search shows the exact product and hides the empty state | Use a wrong expected product name after recovery |
| BG-07 | Status 200; total/length 1; exact expected ID/name for head | Expect p2; a successful HTTP response must not hide wrong business data |
| BG-08 | Fresh empty cart; zero rejected as 400/INVALID_QUANTITY; full cart unchanged | Expect 200 for zero; the status assertion must fail |

Perform challenges in your starter after a successful control. Change one
thing, run the focused case, confirm the intended failing assertion, then
restore. A missing module or unavailable browser is not a successful challenge.
The four code-only drills do not need a page; their use of the same test runner
keeps the learning loop familiar. BG-03 is a language exercise about a stated
rule; later API tests establish what the application actually does.

## A failure is information

| What you see | Check first | Small next step |
| --- | --- | --- |
| `node` or `npm` not found | Is Node installed and this a reopened terminal? | Verify Node installation and version |
| Missing `package.json` / ENOENT | Current folder | Navigate to the extracted project root |
| Package download/proxy/certificate error | First network error and approved network setup | Preserve the error; use the approved connection, not random reinstall commands |
| Browser executable missing | Browser binary install | Run `npx playwright install chromium` |
| `EADDRINUSE` or port already used | Which command and port? | Choose an unused port; do not kill an unknown service |
| `No tests found` | Exact script, path and grep ID | Run `npm run test:beginner -- --list` and copy a real ID |
| `1 skipped` | Does your selected starter still say test.skip? | Implement it, remove its one skip and rerun |
| Sentinel failure | Is the TODO implemented? | Replace the sentinel with all required assertions |
| Syntax error | Filename/line and paired quotes/brackets | Correct the first syntax error and save |
| TypeScript error | Actual type versus required type | Run `npm run typecheck`; understand the mismatch |
| Locator timeout | Expected role/name and actual page state | Inspect the first relevant action and assertion |
| Expected/received mismatch | Rule, setup, actual value | Decide what is wrong before changing the expectation |

For a test-port conflict, use an unused port just for that test command:

```sh
# macOS/Linux shell; choose an unused port
PORT=14828 npm run test:beginner -- --grep BG-05
```

```powershell
# Windows PowerShell; choose an unused port
$env:PORT = '14828'
npm run test:beginner -- --grep BG-05
Remove-Item Env:PORT
```

If that terminal already had a custom PORT value, restore it instead of removing
it. For a personal server conflict, choose a **different** unused port and open
its printed URL. Never use the personal server's selected port for the tests.
For more diagnosis, see [Troubleshooting](TROUBLESHOOTING.md).

## Save your work and learn a little Git

Editor Save preserves a file locally. A Git commit records source history.
A push sends commits to a remote to which you have access. A source ZIP has no
Git history; `not a git repository` is normal there and does not prevent running
the academy. Save the files and keep a backup; Git can be learned afterward.

In an existing Git clone, first inspect:

```sh
git status
git diff -- beginner/practice.spec.ts
```

Review the diff so you know which lines changed. When you deliberately want to
save that finished practice in Git history, stage only that file and commit:

```sh
git add beginner/practice.spec.ts
git commit -m "Practice my first beginner test"
```

Git may ask you to configure your author name/email. Follow its identity setup
or the [official Git introduction](https://git-scm.com/book/en/v2/Getting-Started-First-Time-Git-Setup).
Do not paste access tokens into source. Download-only learners can continue
without this step; do not run destructive reset/clean commands to resolve a
Git message. Sharing/pushing comes later and requires your own repository access.

Portal progress is separate: notes and checkmarks do not save edited test files.
The full local portal stores progress outside the checkout; a hosted/static
portal stores it in that browser origin. Use [Local data](LOCAL-DATA.md) for
backup/export/import and [Account handoff](ACCOUNT-HANDOFF.md) before changing
accounts or computers.

### Returning tomorrow

1. Reopen the **same extracted project folder** in your editor. Open the starter
   you edited and confirm your saved change is there. Do not begin by downloading
   another ZIP or generating another project.
2. Open a terminal and check its working folder with `node -p "process.cwd()"`.
   It should identify that same folder containing `package.json`.
3. If you only want to run an exercise, run its focused test command. The runner
   starts its own test service. You do not normally repeat `npm ci` or the browser
   installation every session; a new machine, changed dependencies or a missing
   browser may need setup again.
4. If you want the local portal or manual shop, start `npm run local`, then open
   the address it prints. Use a second terminal for tests. Reopening the browser
   URL alone does not start a server after a restart.
5. Return to the same portal address and browser profile for your study record.
   Hosted and local addresses have separate records until you explicitly
   export/import. Use **My progress** or **Continue learning** to resume, and
   confirm the save indicator before stopping again.

Before ending a session, save code in the editor, restore any deliberately wrong
expectation, and write the next exercise ID plus its run command in your notes.
Wait for notes to save, then stop your manual server with Control+C. A checkmark
in the portal is a self-assessment; it is not evidence that files were saved.

## Two or three weeks is a reasonable start

Use 25–45 minute sessions. Stop after one useful result; setup may take a whole
first session. The six lesson estimates total 5 hours 25 minutes, before extra
installation, independent practice and debugging. Extend this freely.

- Sessions 1–2: tools, one reference pass and manual shop exploration.
- Sessions 3–5: values, arrays and a function; complete BG-01–03.
- Sessions 6–8: inspect the web, explain await and complete BG-04–06.
- Sessions 9–10: API responses, rejected input and BG-07–08.
- Session 11 onward: diagnosis experiment, save your work, explain the exit gate.

If programming syntax is still the obstacle, repeat the small drills and use
[MDN's JavaScript learning material](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting).
You do not need to finish an entire external course before returning here.

## Exit gate and a useful help request

Move to lesson **01-01** when you can find the project, run one selected UI and
one API starter, explain their meaningful lines, recognize a skipped test,
read one deliberate assertion failure, restore it, and confirm your work was
saved. Explain one limitation: checking a heading does not verify checkout;
checking quantity zero does not cover all invalid values.

A help request can be this short:

```text
OS and Node version:
Exact command and test ID:
What I expected:
First relevant error, filename and line:
What I changed and what happened afterward:
Please explain the first failure and give one hint before a full solution.
```

Remove private data before sharing. If an AI assistant supplies code, explain
it back and run it. Keep the acceptance criteria. A passing supplied solution
is an example, not evidence that your own unfinished starter is complete.

Sources checked October 21, 2026: [Playwright installation](https://playwright.dev/docs/intro),
[writing tests](https://playwright.dev/docs/writing-tests),
[assertions](https://playwright.dev/docs/test-assertions),
[API testing](https://playwright.dev/docs/api-testing),
[npm ci](https://docs.npmjs.com/cli/v11/commands/npm-ci/) and the linked language/Git guides.
Commands and fixture expectations were also checked against this repository.
