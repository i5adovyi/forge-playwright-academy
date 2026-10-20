import type { APIRequestContext } from '@playwright/test';

export type JobIdentity = { id: string; requestId: string; customerId: string };
export type Artifact = {
  jobId: string; requestId: string; customerId: string; format: 'summary';
  summary: { orderCount: number; totalCents: number };
};
export type ObservationOptions = { budgetMs: number; requestTimeoutMs?: number; intervalMs?: number; maxReads?: number };
export type JobErrorCode = 'JOB_FAILED' | 'OBSERVATION_DEADLINE' | 'READ_LIMIT'
  | 'REQUEST_TIMEOUT' | 'REQUEST_FAILED' | 'HTTP_ERROR' | 'INVALID_RESPONSE' | 'IDENTITY_MISMATCH';
export class JobObservationError extends Error {
  constructor(readonly code: JobErrorCode, message: string, readonly evidence: {
    jobId: string; reads: number; lastState?: string; causeCode?: string;
  }) {
    super(`${code}: ${message}`);
    this.name = 'JobObservationError';
  }
}
const record = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

// AJ-01 / AJ-02 / AJ-03. Observation is read-only: submit once outside this helper.
export async function observeJob(request: APIRequestContext, expected: JobIdentity, options: ObservationOptions): Promise<Artifact> {
  const { budgetMs, requestTimeoutMs = 600, intervalMs = 15, maxReads = 100 } = options;
  if (![budgetMs, requestTimeoutMs, intervalMs, maxReads].every(Number.isFinite)
    || budgetMs <= 0 || requestTimeoutMs <= 0 || intervalMs < 0 || !Number.isInteger(maxReads) || maxReads < 1) {
    throw new RangeError('Use positive bounded observation settings and an integer maxReads.');
  }
  const deadline = performance.now() + budgetMs; // monotonic: wall-clock changes do not extend the budget
  let reads = 0;
  let lastState: string | undefined;
  const fail = (code: JobErrorCode, message: string, causeCode?: string): never => {
    throw new JobObservationError(code, message, { jobId: expected.id, reads, lastState, ...(causeCode ? { causeCode } : {}) });
  };
  async function read(path: string): Promise<unknown> {
    const remaining = deadline - performance.now();
    if (remaining < 1) return fail('OBSERVATION_DEADLINE', 'No observation budget remains.');
    // Never pass timeout:0: Playwright interprets that as no timeout.
    const timeout = Math.max(1, Math.min(requestTimeoutMs, Math.floor(remaining)));
    let response;
    try {
      response = await request.get(path, { timeout, maxRetries: 0, failOnStatusCode: false });
    } catch (error) {
      if (error instanceof Error && /Timeout \d+ms exceeded/.test(error.message)) {
        if (deadline - performance.now() < 2) return fail('OBSERVATION_DEADLINE', 'A request consumed the remaining observation budget.');
        return fail('REQUEST_TIMEOUT', `A read exceeded its ${timeout}ms request limit.`);
      }
      return fail('REQUEST_FAILED', error instanceof Error ? error.message : String(error));
    }
    try {
      if (performance.now() >= deadline) return fail('OBSERVATION_DEADLINE', 'Response arrived after the observation deadline.');
      if (response.status() !== 200) return fail('HTTP_ERROR', `Read returned ${response.status()}.`);
      try {
        return await response.json();
      } catch {
        return fail('INVALID_RESPONSE', 'Response body is not valid JSON.');
      }
    } finally {
      await response.dispose();
    }
  }
  for (;;) {
    if (performance.now() >= deadline) return fail('OBSERVATION_DEADLINE', 'Job did not finish within the observation budget.');
    if (reads >= maxReads) return fail('READ_LIMIT', `Job used all ${maxReads} permitted status reads.`);
    // Controlled counterexample, enabled only by run.mjs --proof. It demonstrates
    // why a retrying helper must not put a job-creation write inside its loop.
    if (process.env.JOBS_FAULT === 'post-inside-poll') {
      await request.post('/jobs', {
        data: { requestId: expected.requestId, customerId: expected.customerId, format: 'summary' },
        timeout: Math.max(1, Math.min(requestTimeoutMs, Math.floor(deadline - performance.now()))),
        maxRetries: 0,
      });
    }
    reads++;
    const job = await read(`/jobs/${encodeURIComponent(expected.id)}`);
    if (!record(job) || typeof job.state !== 'string') return fail('INVALID_RESPONSE', 'Missing job state.');
    if (job.id !== expected.id || job.requestId !== expected.requestId || job.customerId !== expected.customerId) {
      return fail('IDENTITY_MISMATCH', 'Status belongs to a different job, request, or customer.');
    }
    lastState = job.state;
    if (job.state === 'failed' && process.env.JOBS_FAULT !== 'ignore-terminal-failure') {
      if (!record(job.error) || typeof job.error.code !== 'string') return fail('INVALID_RESPONSE', 'Failed job has no error code.');
      return fail('JOB_FAILED', 'Job reached a terminal failure.', job.error.code);
    }
    if (job.state === 'succeeded') {
      const path = `/jobs/${expected.id}/artifact`;
      if (job.artifactPath !== path) return fail('IDENTITY_MISMATCH', 'Artifact path does not belong to this job.');
      const artifact = await read(path);
      if (!record(artifact) || artifact.jobId !== expected.id || artifact.requestId !== expected.requestId
        || artifact.customerId !== expected.customerId) return fail('IDENTITY_MISMATCH', 'Artifact belongs to another job, request, or customer.');
      if (artifact.format !== 'summary' || !record(artifact.summary)
        || !Number.isInteger(artifact.summary.orderCount) || !Number.isInteger(artifact.summary.totalCents)) {
        return fail('INVALID_RESPONSE', 'Artifact has an invalid summary shape.');
      }
      return artifact as Artifact;
    }
    if (!['queued', 'running', ...(process.env.JOBS_FAULT === 'ignore-terminal-failure' ? ['failed'] : [])].includes(job.state)) {
      return fail('INVALID_RESPONSE', `Unknown state ${job.state}.`);
    }
    await delay(Math.min(intervalMs, Math.max(0, deadline - performance.now())));
  }
}
