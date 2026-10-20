# CI coverage gates: did the required suite actually run?

A teammate changes CI to `--project=gate-smoke`. Every selected test passes.
The release still lacks checkout evidence. Your job is to reject that run for
the missing requirement, without rejecting the academy's unfinished practice
exercises.

This is **required-suite coverage**, not statement/branch coverage and not proof
that the product is bug-free. The manifest is a reviewed contract. The gate
cannot know whether a test with the right ID makes a useful assertion.

## Start here

From the repository root, after `npm ci`:

```sh
node workplace/gates/run.mjs
node workplace/gates/run.mjs --prove-gate
node --test workplace/gates/gate.test.mjs
```

The suite uses Playwright's real API request fixture against the local Forge
server, so no browser installation is needed. It starts and stops its own server
on port **14830**. Use `PORT=14835` if another process owns that port; do not point
this command at a shared production service. Each test has an isolated synthetic
session, and each scenario gets a fresh report directory.

The first command runs three required cases and one deliberately skipped,
untagged optional exercise. The second runs ten real Playwright executions,
including controlled faults, and checks both their runner exit codes and the
gate's rejection reasons. The proof command succeeds only when the valid run
passes and every invalid run is rejected for its intended cause.

Reports, runner logs, gate decisions and `summary.json` are retained under
`quality-results/workplace-gates/run-*/`. These generated artifacts are ignored
by Git. `gate.test.mjs` adds synthetic malformed-report tests; those unit fixtures
are explicitly separate from the real-run proof.

## CG-01: build an independent required inventory

**Starter:** [starter-inventory.mjs](starter-inventory.mjs)  
**Reference:** `validateInventory` in [worked-gate.mjs](worked-gate.mjs)  
**Contract:** [required-suite.json](required-suite.json)

Implement the exported `validateCoverage(manifest, report)` function. Return
`{ ok: boolean, errors: Array<{ code: string, message: string }> }`; `ok` is true
only when `errors` is empty. The starter returns `STARTER_UNFINISHED`, so it
cannot accidentally appear complete.

```sh
node workplace/gates/run.mjs --practice --stage inventory
node workplace/gates/run.mjs --practice --stage inventory --prove-gate
```

The second command grades four scenarios: baseline, omitted project, omitted
case, and duplicate ID. Preserve the independent manifest and the scenario
runner. Editing those to agree with your incomplete output defeats the task.

Acceptance criteria:

1. Traverse nested `suites`, then each `spec.tests`. One specification can run
   in multiple projects. A title alone is not an identity.
2. Match a reviewed pair such as `gate-checkout::checkout`. The stable ID is the
   source tag `@gate:checkout`; the project comes from `test.projectName`.
   The installed Playwright JSON reporter serializes this tag as
   `"gate:checkout"` without `@`. Inspect the real report and normalize that
   optional prefix before matching.
3. Emit `PROJECT_MISSING` when a required project has no reported cases.
   A project merely appearing in configuration does not prove execution.
4. Emit `REQUIRED_MISSING` for a missing required pair. Unrelated passing tests
   cannot compensate for it.
5. Emit `DUPLICATE_IDENTITY` if two reported tests claim the same pair. Also
   reject unknown IDs (`UNKNOWN_IDENTITY`) and multiple IDs on one test
   (`MULTIPLE_IDENTITIES`).
6. Fail closed on malformed input (`MANIFEST_FORMAT`, `REPORT_FORMAT`) and
   incomplete reports whose summary contradicts their entries
   (`REPORT_INTEGRITY`).

The inventory stage establishes which tests were reported. It deliberately
makes no assertion that those tests passed. CG-02 adds that policy.

**Interview defense:** Explain why neither “three tests passed” nor generating
the expected list from the current report can detect an accidentally narrowed
grep. Show the manifest change that a legitimate new release requirement needs.

## CG-02: enforce actual outcomes

**Starter:** [starter-outcomes.mjs](starter-outcomes.mjs)  
**Reference:** `validateOutcomes` and `validateCoverage` in
[worked-gate.mjs](worked-gate.mjs)

This starter reuses the completed inventory function so you can concentrate on
outcome semantics. If you want to combine your own CG-01 implementation, import
that function instead after proving it.

```sh
node workplace/gates/run.mjs --practice --stage outcomes
node workplace/gates/run.mjs --practice --stage outcomes --prove-gate
```

Acceptance criteria:

1. Each required case has `expectedStatus: "passed"`, aggregate
   `status: "expected"`, and exactly one actual result with `status: "passed"`,
   `retry: 0`, and no errors. An empty results list proves nothing.
2. Required skips emit `REQUIRED_SKIPPED`. Optional skipped exercises without a
   required identity remain allowed.
3. `test.fail()` must not waive a release requirement. Emit
   `EXPECTED_FAILURE`, even when Playwright considers the failure expected.
4. Emit `FLAKY_RESULT` for a failure followed by a retry pass. Keep the first
   attempt as evidence. More retries do not repair the cause.
5. Emit `UNEXPECTED_RESULT` for any unexpected selected test, including tests
   outside the required manifest. Do not ignore failures just because they are
   not critical IDs.
6. Inspect actual attempts as well as aggregate labels. Timeout, interruption,
   empty attempts, concealed prior errors and a retry mislabeled clean must
   produce `ATTEMPT_NOT_CLEAN`.
7. Inspect top-level `report.errors`. A teardown failure can occur after all
   individual tests pass; emit `RUN_ERROR`.

The reference has no quarantine bypass. A real organization might approve one
with an owner, issue, expiry and alternative evidence. That is a separate,
reviewed policy change, not a silent `test.skip()` or `test.fail()` annotation.

**Interview defense:** “A test passed on retry and the command exited zero.
Why does this gate still reject it? What is the smallest causal experiment you
would run before changing the retry setting?”

## Read the evidence

| Scenario | Playwright exit | Required gate evidence |
| --- | --- | --- |
| Baseline, including optional skipped exercise | 0 | Accepted |
| Only smoke project selected | 0 | `PROJECT_MISSING`, `REQUIRED_MISSING` |
| Required stock case excluded by grep | 0 | `REQUIRED_MISSING` |
| Two tests claim catalog ID | 0 | `DUPLICATE_IDENTITY` |
| Required checkout skipped | 0 | `REQUIRED_SKIPPED` |
| Checkout failure marked expected | 0 | `EXPECTED_FAILURE` |
| Checkout fails consistently | 1 | `UNEXPECTED_RESULT`, `ATTEMPT_NOT_CLEAN` |
| Checkout fails once and passes on retry | 0 | `FLAKY_RESULT`, `ATTEMPT_NOT_CLEAN` |
| Teardown throws after tests pass | 1 | `RUN_ERROR` |
| Additional unlisted test fails | 1 | `UNEXPECTED_RESULT` |

Several rejected cases have a green Playwright exit. Others already fail the
runner, which remains an independent release signal. In production CI, keep
both the runner's exit status and the gate's status; use an always-running
diagnostic/report step without allowing its success to overwrite a failed test
step. `--prove-gate` intentionally expects particular red executions because it
tests the gate itself. Do not copy that exception into the release pipeline.

To inspect a saved report directly:

```sh
node workplace/gates/worked-gate.mjs \
  workplace/gates/required-suite.json \
  quality-results/workplace-gates/run-REPLACE/baseline/results.json
```

Use the actual directory printed by your run. A missing file or invalid JSON
exits nonzero. The runner creates a fresh directory per invocation and refuses a
missing current report, preventing reuse of an old successful report.

## Reviewer guidance and limits

- Check the smallest counterexample: remove one required case while retaining
  unrelated passing tests. A passing-test count must not rescue the run.
- Review the manifest separately from implementation. IDs are promises, not
  test-quality guarantees. Keep business assertions meaningful.
- Read both `expectedStatus` and each actual `results` entry. Playwright's
  aggregate `"expected"` can include an intentionally expected failure.
- Use the complete JSON reporter document. Failure-only reports, a single
  shard, repeated-run reports and silently merged partial reports do not satisfy
  this workshop's contract. A production sharded pipeline needs reviewed merge
  and completeness rules before applying this gate.
- This implementation pins the repository's Playwright reporter shape and
  deliberately requires one clean first attempt. Review the parser and its
  real-run proof when upgrading Playwright.
- The intentionally broken scenarios test the release policy, not genuine
  product defects. The assertions inside the baseline cases still exercise the
  real local catalog, stock rule and purchase contract.

Official references: [JSON reporter](https://playwright.dev/docs/test-reporters#json-reporter),
[retries](https://playwright.dev/docs/test-retries),
[projects](https://playwright.dev/docs/test-projects), and
[annotations](https://playwright.dev/docs/test-annotations).
