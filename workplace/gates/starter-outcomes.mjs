import { validateInventory } from './worked-gate.mjs';

/**
 * CG-02 · A green process is insufficient evidence.
 * Keep the completed inventory check and implement the outcome policy here.
 * Check run-level errors, actual attempts, expected-failure annotations, skips,
 * failures and retry passes. A legitimate untagged skipped starter is allowed.
 * Do not remove the required-suite manifest or change tests to fit the gate.
 */
export function validateCoverage(manifest, report) {
  const inventory = validateInventory(manifest, report);
  if (!inventory.ok) return inventory;
  return { ok: false, errors: [{ code: 'STARTER_UNFINISHED', message: 'CG-02: implement the outcome policy before claiming success.' }] };
}
