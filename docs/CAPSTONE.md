# Capstone: Forge Shop release confidence

You are the automation engineer for a small commerce team. A release changes catalog discovery, cart behavior, and checkout. Build a test portfolio that gives the team useful evidence about those changes and clearly states what it does not cover.

**Suggested effort:** 12–20 focused hours after the preceding stages. This is an estimate for study planning, not a completion guarantee.

## Product brief

The local shop has a catalog, filters, cart quantities, a demo login, a discount code, shipping details, order confirmation, and a receipt. The server stores isolated practice state using the `lab_session` cookie or `x-lab-session` header. Read [the API contract](lab-api.md) before specifying cases.

All money is represented in integer cents at the API. For a known example, two Studio Headphones cost `25800` cents before discount; `SAVE10` produces a `2580` cent discount and `23220` cent total. These are independently calculated expectations based on the seeded catalog. The lab does not process money or implement a production authentication system.

## Required deliverables

Create a `portfolio/` directory for your own submission with:

```text
portfolio/
  test-plan.md        # Risks, cases, chosen layers, omissions
  decisions.md        # Three architectural decisions and their tradeoffs
  investigation.md   # One failure explained using evidence
  evidence.md        # Exact commands, environments, outcomes, artifact paths
  presentation.md    # A ten-minute technical demonstration outline
```

Put executable tests in the repository’s designated learner test area. Keep those tests under version control with their fixtures. Reports and trace archives are generated artifacts; retain representative evidence locally or in your CI provider according to your project policy.

## Acceptance criteria

### UI behavior

- A shopper can find Studio Headphones through catalog search and add the intended product.
- Cart feedback reflects the selected quantity and independently expected amount.
- Invalid credentials produce a visible rejection; valid demo credentials allow checkout.
- A valid order shows a confirmation tied to the created order.
- At least one keyboard-focused interaction and one narrow mobile viewport scenario have explicit assertions.

### API behavior

- Catalog response shape and stable seeded product fields are checked.
- Quantity cases cover accepted input, zero, a fraction, and stock overflow. Assert exact contract outcomes.
- A rejected mutation leaves cart contents unchanged.
- An unauthorized order request is rejected.
- A valid order contains the requested line items and correct independently calculated totals; the cart is then empty.
- Two isolated sessions cannot see or alter one another’s cart or orders.

### Integration and controlled simulation

- One test creates or arranges state through the API and verifies it through the browser using the same session.
- One UI test simulates a failed API response and verifies a useful visible outcome.
- The test plan explicitly states that the simulated failure test does not validate backend rejection behavior.

### Engineering and evidence

- Independent tests run without relying on another test’s execution order.
- The suite is executable using documented commands from a fresh dependency install.
- A separate type check is documented and run.
- A CI workflow is provided. If a hosted run was not available, label local evidence honestly.
- At least one deliberate assertion failure and its restored passing run are preserved in evidence notes.
- A trace-based investigation identifies the first unexpected event and explains the repair or unresolved defect.
- AI-generated contributions, if used, include a reviewed plan and an audit of changed assertions.

## Suggested milestones

| Milestone | Output | Exit condition |
|---|---|---|
| 1 · Define | Risk table and case list | Every case has an oracle and proposed layer |
| 2 · Prove core flow | One UI journey and core API cases | Real server used; totals independently checked |
| 3 · Harden | Negative cases, fixtures, isolated sessions | Repeated and parallel runs do not collide |
| 4 · Diagnose | Controlled failure and trace report | A reviewer can reproduce the issue |
| 5 · Deliver | CI, readme, evidence, demonstration | Fresh-start instructions work |

## Risk table template

| ID | Risk | Impact 1–3 | Likelihood 1–3 | Layer | Test title | Remaining uncertainty |
|---|---|---:|---:|---|---|---|
| R1 | Invalid quantity changes cart | 3 | 2 | API | Rejected quantity preserves cart | Race conditions beyond local single-process lab |
| R2 | UI adds the wrong product | 3 | 2 | UI | Search result adds intended product | Other locales |
| R3 | State leaks between shoppers | 3 | 2 | API + integration | Independent sessions retain separate carts | Production identity and storage architecture |

Adapt scores based on a stated rationale. They are prioritization labels, not measured probabilities.

## Stretch briefs

Choose two after the required criteria pass:

1. Add a reviewed visual baseline in a controlled browser/OS environment. Show an intentional diff and explain acceptance.
2. Add an accessibility scan and manual keyboard checks. Explain what automation cannot detect.
3. Add a second browser project, install that browser, and record actual results.
4. Benchmark worker counts and justify your CI configuration with observed timings.
5. Add property-oriented API cases with reproducible data seeds and a clear invariant.
6. Create an agent-generated plan, reject at least one weak suggestion, and demonstrate the reviewed final tests.

## The ten-minute defense

Spend two minutes on product risks and scope, three on a passing journey and its assertions, three on a failing case and trace, and two on tradeoffs and next steps. Be ready to explain the difference between a test that passed, a test that passed on retry, and a skipped test.

## Release standard

Use [Assessment](ASSESSMENT.md) to score the work out of 100. Aim for at least 80 with no release blockers. The rubric is an internal learning tool, not a recognized certification or a guarantee of employment. Strong submissions explain limitations with the same clarity as successes.
