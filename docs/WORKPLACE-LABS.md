# Workplace engineering workbook

Four lessons turn interview answers into work you can reproduce: **06-08 incident
diagnosis, 06-09 CI coverage gates, 05-11 page-object refactoring, and 05-12 data
builders**. Open **Workplace practice** (`#/workplace`) in the portal. The nine
assignments are IN-01–03, CG-01–02, RF-01–02, and DB-01–02.

These are controlled local simulations with synthetic data. They generate real
Playwright results. They are not accounts of production incidents. Complete the
UI, API, fixture, and report introductions first: 02-02/05, 03-01/03, 04-03/05,
05-01/02/03, and 06-01/02.

## Your first five sessions

| Session | Work | Evidence to keep |
| --- | --- | --- |
| 1 · 75 min | Diagnose three incidents before opening the repairs | Two hypotheses per incident, one discriminating experiment, fresh trace and causal observation |
| 2 · 80 min | Implement required-inventory and outcome gates | Baseline acceptance and precise rejection reasons for bad evidence |
| 3 · 75 min | Refactor duplicated consumers | Small diff, independently asserted outcomes, matching before/after fault detection |
| 4 · 75 min | Build fresh data and register field cases | Ownership proof, 36 rejected cases, 12 accepted controls, complete state assertions |
| 5 · 45–60 min extra | Explain the work without the solution open | A review packet and a five-minute oral defense for each workshop |

The first four estimates are included in the curriculum’s guided duration.
Independent debugging and the final defense are additional. Pause after each
session to implement the starter; reading the worked solution is not completion.

## Start locally

From the folder containing `package.json`, use Node 22+:

```sh
npm ci
npx playwright install chromium
npm run validate
npm run typecheck
```

The runners start their own local servers. Main projects use `PORT` or 4173.
Incidents default to 14828, gates to 14830, and refactor/builder proofs to 14832.
Run the last two proof commands sequentially. If a dedicated runner reports an
occupied port, select an unused port using `PORT=14835 npm run ...`; do not stop
an unrelated process. Each proof uses its own fresh results directory.

## 1. Incident diagnosis: IN-01–03

```sh
npm run test:incidents:broken
# Expected exit 1: inspect the fresh evidence before reading the worked file.
npm run test:incidents
npm run test:incidents:proof
```

Read the tickets in
[the incident brief](../workplace/incidents/README.md). The broken pack supplies
a rejected stock setup hidden by a cart timeout, two contexts that share a server
identity, and a premature snapshot while a catalog response is held. It does
not simulate every possible CI failure.

Write two plausible explanations for each symptom. Find the earliest observation
that separates them. Change one causal variable, preserve the requirement, and
explain the corrected outcome. “The trace shows a timeout” is not a root cause.

Implement `workplace/incidents/practice.spec.ts`, replace its unfinished sentinel,
then enable one assignment:

```sh
npm run test:incidents:practice -- --enable-starters --grep IN-01
# After repair, challenge that same learner check:
npm run test:incidents:practice -- --enable-starters --grep IN-01 --with-defects
```

The second command deliberately supplies a defect and should fail at the named
business oracle. Without `--enable-starters`, the practice tests are skipped.
Simply enabling an untouched starter fails explicitly. The reference proof checks
original failures, worked repairs, controlled response defects, and untouched
starter sentinels. Its untouched-starter check must be adapted after you complete
those starters; do not mistake that later failure for a product regression.

Evidence lives below `quality-results/incidents/`. Each run prints its exact path.
Open the generated HTML report or a reported trace path with
`npx playwright show-trace <actual-trace-path>`.

## 2. CI execution coverage: CG-01–02

```sh
npm run test:gates
npm run test:gates:unit
npm run test:gates:proof
```

The [gate brief](../workplace/gates/README.md) explains the independent
`required-suite.json`, real report shape, and policy. Three required API cases
span two teaching projects. One optional skipped case is legitimate. The proof
creates ten actual runs and checks the expected acceptance or rejection.

| Assignment | Implement | Grade your own implementation |
| --- | --- | --- |
| CG-01 | `workplace/gates/starter-inventory.mjs` | `npm run test:gates:practice -- --stage inventory --prove-gate` |
| CG-02 | `workplace/gates/starter-outcomes.mjs` | `npm run test:gates:practice -- --stage outcomes --prove-gate` |

CG-01 covers the baseline, omitted project, omitted case, and duplicate identity.
CG-02 adds required skips, expected-failed misuse, unexpected failure, a failed
attempt followed by a pass, a runner error, and an unlisted failing test.
Both unfinished modules reject evidence with `STARTER_UNFINISHED`. They are
executable JavaScript assignments, not skipped Playwright specs.

Do not derive the required inventory from the filtered report you are validating.
Do not accept a raw passing-test count. Preserve the runner’s exit status
independently of the validator’s policy. A successful proof wrapper means it
observed the intended bad outcomes; it does not make those underlying runs pass.

This gate covers its own teaching suite. It is not source-code coverage, a judge
of assertion quality, a complete academy inventory, a quarantine manager, or a
shard-merging service. The unit tests cover malformed evidence; the real proof
scenarios establish integration with the installed runner. Evidence lives under
`quality-results/workplace-gates/`.

## 3. Page-object refactoring: RF-01–02

```sh
npm run test:refactoring
npm run test:refactoring:practice -- --grep RF-01
npm run test:refactoring:proof
```

The [refactoring brief](../workplace/refactoring/README.md) supplies three
duplicated baseline cases and three worked cases. Two independent consumers
protect headphones and a lamp; a third retains locators across real rerenders.
Complete `shop.starter.ts` and `practice.spec.ts`. RF-01 becomes two named
consumer tests. Remove `.skip` and replace sentinels only as you implement them.

Keep the model test-scoped and the expected product, quantity, price, and complete
persisted cart visible in the specs. Explain why the model owns interactions
while Playwright owns the page lifecycle. Review the deliberately poor BasePage
proposal in the brief before inventing an inheritance hierarchy.

The proof first requires all six reference/baseline cases to pass, then adds $1
to the UI cart total and requires all six to fail the same price oracle.
It verifies exact identities, not only counts. The reference proof does not grade
your edited starter automatically; the README explains how to apply the same
fault hook and identity checks to your consumers. Evidence lives under
`quality-results/refactoring-proof/`.

## 4. Data builders and validation: DB-01–02

```sh
npm run test:builders
npm run test:builders:practice -- --grep DB-01
npm run test:builders:proof
```

The [builder brief](../workplace/builders/README.md) explains
`builders.starter.ts` and `practice.spec.ts`. The reference contains 50 cases:
two DB-01 ownership/consumer checks, 36 DB-02 rejections, and 12 accepted controls.
The two assignment IDs therefore do not mean two executed test cases.

| Required field | Maximum trimmed JavaScript string length |
| --- | --- |
| name | 120 |
| address | 120 |
| city | 120 |
| postalCode | 20 |

For each field, reject omitted, empty, whitespace-only, number, boolean, null,
object, array, and maximum+1 values. Accept one character, the exact maximum,
and a padded maximum that becomes valid after trimming. Preserve valid earlier
preconditions so each rejection reaches address validation.

Every negative case begins with login, two headphones, one keyboard, and SAVE10.
Assert `422 INVALID_ADDRESS`, the entire unchanged discounted cart, and empty
order history. Accepted controls verify normalized shipping, independent known
money, the persisted order, and the complete emptied cart.

The builder must own nested shipping, item objects, and the items array. Mutating
a result must not change another result, caller-owned overrides, or future
defaults. Valid typed builders and malformed payload tables have different jobs.

The proof checks the exact 50-case inventory and catches a shared-default defect
and all four removed upper limits using an isolated temporary server copy.
It never edits the normal server. Follow the brief to adapt proof configuration
to your own completed starter. Evidence lives under `quality-results/builders-proof/`.

## Submit a reviewable packet

For each workshop, include:

1. **Claim:** the specific behavior or policy you protect.
2. **Reproduction:** commit, runtime, exact command, and evidence directory.
3. **Diagnosis/design:** the observation that justified your decision.
4. **Patch:** the smallest change that preserves the original requirement.
5. **Challenge:** the intentional fault, targeted failed assertion or rejection,
   and the restored normal run.
6. **Limit:** one conclusion that the evidence does not support.

Score each item 0 (missing), 1 (present but incomplete), or 2 (reproducible and
defensible). Aim for at least 10/12, with no zero for reproduction, preserved
requirement, or fault evidence. This is a self-review rubric, not certification.
Have a peer ask why an apparently easier fix would be unsafe.

## What CI checks

`npm run test:all` includes the refactoring baseline/worked examples, builder
matrix, their skipped starters, and portal checks. Incidents and gates run in
separate configurations because their teaching scenarios deliberately fail.
The GitHub workflow invokes all four proof runners plus gate unit tests and
retains their evidence. Ordinary visual comparisons remain separate.

The [interview and workplace roadmap](INTERVIEW-AND-WORKPLACE.md) records further
real-world gaps. Existing assertions, clean runs, and fault experiments reduce
uncertainty; none can prove the absence of every future race or environment issue.

Primary reading:
[trace viewer](https://playwright.dev/docs/trace-viewer),
[reporters](https://playwright.dev/docs/test-reporters),
[retries](https://playwright.dev/docs/test-retries),
[page objects](https://playwright.dev/docs/pom),
and [parameterization](https://playwright.dev/docs/test-parameterize).

## Continue with real-world systems

The next implemented batch adds 06-10, 04-07, and 04-08 with WB-01–03, LR-01–03,
and AJ-01–03. Follow [the systems workbook](REAL-WORLD-SYSTEMS.md) for wrong-build
detection, committed writes with lost replies, and asynchronous jobs. The four
lessons and nine assignments described above remain the first workplace batch.
