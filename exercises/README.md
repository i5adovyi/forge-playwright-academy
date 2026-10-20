# Your executable practice track

These 24 exercises complement the lesson challenges in the academy. Every starter is deliberately `test.skip`: a skipped test is an unfinished assignment, never evidence of product quality.

1. Read the acceptance criteria in a starter.
2. Remove `.skip` from **one** test and implement it.
3. Run `npm run test:exercises -- --grep "EX-01"` (replace the ID).
4. Diagnose any failure from observed UI, API responses, trace and source.
5. Make the smallest justified change. Run the test again.
6. Compare with the corresponding numbered file in `solutions/` only after a real attempt.
7. Explain one alternative implementation and one tradeoff in your own words.

| Track | Exercises | Starter | Worked examples |
|---|---|---|---|
| UI foundations | EX-01–08 | `01-foundations.spec.ts` | `solutions/01-foundations.spec.ts` |
| API and state | EX-09–16 | `02-api.spec.ts` | `solutions/02-api.spec.ts` |
| Advanced and hybrid | EX-17–24 | `03-advanced.spec.ts` | `solutions/03-advanced.spec.ts` |

Run the reference suite with `npm test`; run all worked examples with `npm run test:solutions`. Your work belongs in `exercises/`, so it cannot silently replace the reference tests.

## Evidence rubric — 10 points per exercise

- **2**: the test proves every acceptance criterion.
- **2**: assertions check user-visible or persisted outcomes.
- **2**: selectors and synchronization are stable.
- **2**: test data is isolated and teardown is complete where needed.
- **2**: you can explain the failure modes and why the test belongs at this layer.

The fixture in `tests/support/fixtures.ts` creates a unique `x-lab-session` for every test, shared by browser and API. Do not replace it with a shared global session. It also exports `credentials`, `shipping`, and setup helpers. You may use helpers after you have implemented the underlying requests yourself once.
