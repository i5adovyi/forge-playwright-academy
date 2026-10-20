import type { APIRequestContext } from '@playwright/test';
import type { Artifact, JobIdentity, ObservationOptions } from './observer';

// AJ-01: read-only observation and exact identity checks; no POST in the poll.
// AJ-02: surface terminal failure with its specific service error immediately.
// AJ-03: monotonic deadline, per-request bound, read ceiling, artifact correlation.
// Implement here without importing/re-exporting observeJob from the solution.
// Reuse/export JobObservationError's public error contract if useful.
export async function observeJob(
  _request: APIRequestContext, _expected: JobIdentity, _options: ObservationOptions,
): Promise<Artifact> {
  throw new Error('AJ_STARTER_NOT_IMPLEMENTED: implement read-only bounded observation.');
}
