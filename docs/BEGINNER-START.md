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
