# Prove the skill, then mark the lesson complete

This assessment is an original academy rubric. It is not an accredited certification. Judge observable work: a plan, code, command, result, and explanation. Reading the answer is preparation; independently reproducing and defending it is the assessment.

## Entry check

Before Stage 1, attempt these without help. Missing knowledge identifies where to study; it is not a reason to stop.

1. Explain what happens between entering a URL and seeing a page.
2. Read a small JSON response and identify its types.
3. Explain the difference between a promise and its resolved value.
4. Describe a negative test for login.
5. Name an assertion that would expose an incorrect cart quantity.

## Stage gates

| Stage | Demonstration | Pass evidence |
|---|---|---|
| 1 · Foundation | Run one test, explain every `await`, define a boundary table | Correct explanation and reproducible command |
| 2 · First UI | Implement a catalog-to-cart flow with meaningful locators | Pass plus intentional wrong-outcome failure |
| 3 · Resilience | Diagnose an ambiguous locator or synchronization failure | Trace evidence and a repair preserving the requirement |
| 4 · API | Verify accepted input, rejected input, and resulting state | Exact contract assertions and unchanged state after rejection |
| 5 · Architecture | Give independent tests their own mutable state | Parallel/repeated run with a clear ownership explanation |
| 6 · Delivery | Make a failing run produce useful artifacts | Failing exit outcome and accessible report/trace |
| 7 · AI | Review a generated test and reject a weak repair | Reviewed plan, diff, actual execution evidence |
| 8 · Capstone | Present and defend the complete portfolio | Rubric score and fresh-start reproduction |

A case that passes only on retry is useful investigation evidence but does not establish a clean reliability gate. A skipped case does not pass a gate.

## Capstone rubric · 100 points

| Dimension | Points | Full-credit evidence |
|---|---:|---|
| Risk-based test design | 15 | Prioritized risks; clear oracles; justified UI/API choices; explicit gaps |
| UI behavior | 15 | Reliable semantic locators; visible outcomes; login/cart/checkout flow |
| API behavior | 20 | Exact status and shape; independent business expectations; negative cases and side effects |
| State and architecture | 15 | Test-owned sessions; clear fixtures; parallel independence; modest helpers |
| Failure investigation | 10 | First unexpected observation; trace; discriminating experiment; justified repair |
| Delivery and reproducibility | 10 | Documented setup; separate type check; CI configuration; honest run evidence |
| Nonfunctional thinking | 5 | Useful keyboard/mobile or accessibility coverage with stated limits |
| Documentation and defense | 10 | Fresh-start instructions; decisions; actual results; concise demonstration |

For each dimension, award approximately 0% for absent work, 50% for partial implementation with important gaps, 75% for mostly correct work with minor omissions, and 100% for complete evidence. The thresholds are learning guidance, not precise measurements of professional ability.

- **90–100:** Strong capstone. Defend the tradeoffs and add one stretch brief.
- **80–89:** Ready to move to a larger practice project; close the documented gaps.
- **65–79:** Rework the two weakest dimensions and reassess.
- **Below 65:** Return to the relevant stage gates and rebuild a smaller coherent suite.

## Release blockers regardless of points

- Required behavior is skipped, hidden behind an unconditional pass, or asserted so weakly it cannot detect the named defect.
- A test is made green by removing its decisive business expectation without an accepted requirement change.
- Run results are claimed without actually executing the command, or uninstalled browsers are claimed as tested.
- Real credentials or private customer data are committed into the exercise artifacts.
- Setup depends on undocumented personal state that a reviewer cannot reproduce.

Fix the blocker and rerun the relevant evidence before reassessment.

## Practical oral exam

Answer in your own words, using your suite as evidence.

1. Why is a UI total equal to an API total insufficient to prove the amount is correct?
2. Why can two browser contexts still collide in this lab?
3. What does a mocked order response prove, and what does it exclude?
4. When should you use a test-scoped fixture instead of a worker-scoped fixture?
5. How would you distinguish a bad locator from a backend error causing the control to be absent?
6. What evidence would justify a timeout change?
7. How does `POST /api/cart` differ from an increment operation?
8. What would make your test for empty-cart checkout accidentally test address validation instead?
9. How do you know an AI-generated test can fail for the right reason?
10. Which two risks remain after your entire suite is green?

## Answer guide · consult after attempting

1. Both layers may share the same wrong computation. Use an independent expected amount.
2. They may deliberately carry the same server-side session identity.
3. It proves response handling in the UI, not real order persistence or server validation.
4. When tests mutate the resource and should not share its lifetime or state.
5. Inspect the earliest unexpected event, actual DOM, and response in a trace.
6. A measured, supported behavior requirement and evidence the previous budget was unrealistic; not a desire to hide unexplained delays.
7. The endpoint sets the requested quantity for a product.
8. Missing or invalid shipping data may trigger an earlier rule. Arrange valid preceding preconditions.
9. Review its oracle and demonstrate a controlled wrong outcome failing at the intended assertion.
10. Examples include production identity, real payments, load behavior, untested browsers, unsupported locales, or failure modes outside the demo scope.

## Peer-review scorecard

```text
Reviewer / date / commit:
Commands actually run:
Browser projects actually run:
Score by dimension:
Release blockers:
Most valuable test and why:
Most misleading test and why:
One architecture tradeoff:
Required changes:
Reassessment evidence:
```

Self-review is valid for solo practice. A fresh pair of eyes is especially valuable for setup instructions and assumptions you no longer notice.

## Practice for interviews and workplace decisions

Use the [interview and workplace roadmap](INTERVIEW-AND-WORKPLACE.md) for 18 additional interview probes, a 90-minute session using existing assignments, and prioritized proposals for incident, review, and engineering exercises. Proposed labs are explicitly marked and do not count as implemented assessment coverage.
