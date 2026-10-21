# Beginner micro-exercises

Read [the complete beginner guide](../docs/BEGINNER-START.md), then follow the
portal's Start from zero route (lessons 00-01–00-06). All original tracks remain.

- `worked.spec.ts` contains eight runnable examples, BG-01–BG-08.
- `practice.spec.ts` contains their unfinished, intentionally skipped starters.
- Run one example: `npm run test:beginner -- --grep BG-05`.
- Run your own selected starter: `npm run test:beginner:practice -- --grep BG-05`.
- Implement every TODO, remove only that case's `.skip`, and replace its sentinel.

The workbook lists exact criteria, hints and controlled expectation changes.
Start with values, arrays, functions and await; then practice a heading check,
empty-search recovery, a catalog response and rejected quantity with no mutation.

The common config owns an isolated service on 4175 with browser-only study
storage. The support fixture assigns a fresh shop session per test. No learner
SQLite data is used. Cases must run independently, not in a required sequence.

A correct negative-input test passes when the expected rejection is verified.
A deliberately wrong expectation should fail at the intended assertion, then
be restored. An unrelated setup failure does not count as detecting a defect.
