import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { test as base, expect, type APIRequestContext } from '@playwright/test';
import type { Artifact, JobIdentity } from './observer';

export type Evidence = {
  jobs: Array<JobIdentity & { state: string }>;
  writes: Array<{ id: string; requestId: string; method: string; path: string }>;
  reads: Array<{ jobId: string; state: string }>;
  artifactReads: number;
  artifacts: Artifact[];
};
export type JobLab = {
  request: APIRequestContext; sessionId: string;
  evidence(): Promise<Evidence>;
  submit(): Promise<JobIdentity>;
  state(job: JobIdentity, state: 'running' | 'succeeded' | 'failed'): Promise<void>;
  mode(mode: 'normal' | 'wrong-status-id' | 'wrong-artifact-id' | 'hold-status'): Promise<void>;
  completeAfterReads(job: JobIdentity): Promise<void>;
};
export const test = base.extend<{ lab: JobLab }>({
  lab: async ({ playwright, baseURL }, use, info) => {
    const bootstrap = await playwright.request.newContext({ baseURL, timeout: 2_000 });
    const created = await bootstrap.post('/control/sessions');
    expect(created.status()).toBe(201);
    const { id: sessionId } = await created.json();
    await bootstrap.dispose();
    const request = await playwright.request.newContext({
      baseURL, extraHTTPHeaders: { 'x-jobs-session': sessionId }, timeout: 2_000,
    });
    const lab: JobLab = {
      request, sessionId,
      evidence: async () => {
        const response = await request.get('/control/evidence');
        expect(response.status()).toBe(200);
        return await response.json() as Evidence;
      },
      submit: async () => {
        const requestId = randomUUID();
        const accepted = await request.post('/jobs', { data: { requestId, customerId: 'customer-42', format: 'summary' } });
        expect(accepted.status(), '202 means accepted, not completed').toBe(202);
        const job = await accepted.json();
        expect(job).toEqual({ id: expect.any(String), requestId, customerId: 'customer-42', state: 'queued' });
        return { id: job.id, requestId, customerId: job.customerId };
      },
      state: async (job, state) => {
        const response = await request.post(`/control/jobs/${job.id}`, { data: { state } });
        expect(response.status(), 'Test-owned transition must succeed').toBe(200);
      },
      mode: async mode => {
        const response = await request.post('/control/mode', { data: { mode } });
        expect(response.status()).toBe(200);
      },
      completeAfterReads: async job => {
        for (const [observed, next] of [['queued', 'running'], ['running', 'succeeded']] as const) {
          const barrier = await request.post('/control/wait-for-read', {
            data: { jobId: job.id, state: observed }, timeout: 6_000,
          });
          expect(barrier.status(), `Test-owned barrier must observe ${observed}`).toBe(200);
          await lab.state(job, next);
        }
      },
    };
    try {
      await use(lab);
    } finally {
      try {
        const evidencePath = info.outputPath('job-evidence.json');
        await mkdir(dirname(evidencePath), { recursive: true });
        await writeFile(evidencePath, JSON.stringify(await lab.evidence(), null, 2));
        await info.attach('job-evidence', { path: evidencePath, contentType: 'application/json' });
      } finally {
        // Teardown has its own request budget; a spent observation deadline does not prevent cleanup.
        const removed = await request.delete('/control/session', { timeout: 2_000 });
        expect(removed.status(), 'Cleanup must remove jobs and release pending handlers').toBe(204);
        const missing = await request.get('/control/evidence', { timeout: 2_000 });
        expect(missing.status()).toBe(404);
        await request.dispose();
      }
    }
  },
});
export { expect } from '@playwright/test';
