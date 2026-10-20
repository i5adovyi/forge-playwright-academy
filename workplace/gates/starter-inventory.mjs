/**
 * CG-01 · Make required coverage explicit.
 * Implement validateCoverage(manifest, report), returning { ok, errors }.
 * Each error is { code, message }. Required codes are in README.md.
 *
 * TODO: validate input shape, recursively visit suites, match gate:<id> tags
 * (the JSON reporter strips the source tag's leading @) plus
 * projectName to the independent manifest, reject missing projects/cases,
 * duplicate and unknown identities. Never derive the manifest from this report.
 * This stage does not yet enforce outcomes; CG-02 adds that policy.
 */
export function validateCoverage(_manifest, _report) {
  return { ok: false, errors: [{ code: 'STARTER_UNFINISHED', message: 'CG-01: implement the inventory contract before claiming success.' }] };
}
