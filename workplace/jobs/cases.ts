import { test, expect, type JobLab } from './fixtures';
import type { Artifact, JobIdentity, JobObservationError, ObservationOptions } from './observer';
import type { APIRequestContext } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

type Observer = (request: APIRequestContext, job: JobIdentity, options: ObservationOptions) => Promise<Artifact>;
async function observeError(operation: () => Promise<Artifact>): Promise<JobObservationError> {
  try {
    await operation();
  } catch (error) {
    // Preserve the explicit unfinished-starter failure instead of relabelling it as a successful negative case.
    if (error instanceof Error && error.message.startsWith('AJ_STARTER_NOT_IMPLEMENTED')) throw error;
    return error as JobObservationError;
  }
  throw new Error('JOB_EXPECTED_REJECTION: observation unexpectedly succeeded.');
}
async function noExtraWrites(lab: JobLab, job: JobIdentity, artifactReads: number) {
  const evidence = await lab.evidence();
  expect(evidence.writes, 'JOB_SINGLE_WRITE_ORACLE: observation must not create extra jobs').toEqual([
    { method: 'POST', path: '/jobs', id: job.id, requestId: job.requestId },
  ]);
  expect(evidence.jobs, 'One submitted operation creates one job').toHaveLength(1);
  expect(evidence.reads.every(read => read.jobId === job.id)).toBe(true);
  expect(evidence.artifactReads).toBe(artifactReads);
  return evidence;
}

export function registerJobCases(observe: Observer, practice = false) {
  test.beforeEach(() => {
    test.skip(practice && process.env.JOBS_ENABLE_STARTERS !== '1',
      'Implement observer.starter.ts, then run --practice --enable-starters.');
  });
  test('AJ-01 API correlates one submission with the completed report', async ({ lab }) => {
    const job = await lab.submit();
    const work = lab.completeAfterReads(job);
    // Settle both promises even if one fails; no background task outlives this test.
    const [observed, progressed] = await Promise.allSettled([
      observe(lab.request, job, { budgetMs: 4_000 }), work,
    ]);
    if (observed.status === 'rejected') throw observed.reason;
    if (progressed.status === 'rejected') throw progressed.reason;
    expect(observed.value, 'JOB_ARTIFACT_ORACLE: exact business result, not merely succeeded').toEqual({
      jobId: job.id, requestId: job.requestId, customerId: 'customer-42', format: 'summary',
      summary: { orderCount: 3, totalCents: 28_900 },
    });
    const evidence = await noExtraWrites(lab, job, 1);
    expect(evidence.reads.map(read => read.state)).toEqual(expect.arrayContaining(['queued', 'running', 'succeeded']));
  });

  test('AJ-01 browser shows the correlated report and exact business values', async ({ lab, page }) => {
    // Starter still has to prove API observation before accepting a browser-only green result.
    if (practice) {
      const prerequisite = await lab.submit();
      await lab.state(prerequisite, 'running');
      await lab.state(prerequisite, 'succeeded');
      await observe(lab.request, prerequisite, { budgetMs: 2_000 });
    }
    await page.context().setExtraHTTPHeaders({ 'x-jobs-session': lab.sessionId });
    await page.goto('/');
    const accepted = page.waitForResponse(response => response.url().endsWith('/jobs') && response.request().method() === 'POST');
    await page.getByRole('button', { name: 'Generate report' }).click();
    const submitted = await accepted;
    expect(submitted.status()).toBe(202);
    const job = await submitted.json() as JobIdentity;
    await expect(page.getByRole('button', { name: 'Generate report' })).toBeDisabled();
    await expect(page.getByRole('region', { name: 'Completed report' })).toBeHidden();
    await lab.completeAfterReads(job);
    const report = page.getByRole('region', { name: 'Completed report' });
    await expect(report).toBeVisible();
    await expect(report.locator('#job')).toHaveText(job.id);
    await expect(report.locator('#customer')).toHaveText('customer-42');
    await expect(report.locator('#orders')).toHaveText('3');
    await expect(report.locator('#total'), 'JOB_BROWSER_ARTIFACT_ORACLE').toHaveText('$289.00');
    await expect(page.getByRole('alert')).toBeEmpty();
    const evidence = await lab.evidence();
    expect(evidence.writes.filter(write => write.requestId === job.requestId), 'JOB_BROWSER_SINGLE_WRITE_ORACLE').toHaveLength(1);
    expect(evidence.reads.filter(read => read.jobId === job.id).map(read => read.state)).toEqual(expect.arrayContaining(['queued', 'running', 'succeeded']));
    expect(evidence.artifactReads).toBe(practice ? 2 : 1);
  });

  test('AJ-02 terminal failure reports its cause before the deadline', async ({ lab }) => {
    const job = await lab.submit();
    await lab.state(job, 'failed');
    const started = performance.now();
    const error = await observeError(() => observe(lab.request, job, { budgetMs: 2_000, maxReads: 300 }));
    const errorPath = test.info().outputPath('observation-error.json');
    await mkdir(dirname(errorPath), { recursive: true });
    await writeFile(errorPath, JSON.stringify({ code: error.code, evidence: error.evidence }, null, 2));
    await test.info().attach('observation-error', { path: errorPath, contentType: 'application/json' });
    expect(error.code, 'JOB_TERMINAL_CODE_ORACLE: fail on the terminal cause, not a generic timeout').toBe('JOB_FAILED');
    expect(error.evidence).toEqual({ jobId: job.id, reads: 1, lastState: 'failed', causeCode: 'SOURCE_UNAVAILABLE' });
    expect(performance.now() - started, 'Terminal failure must leave budget for diagnosis and cleanup').toBeLessThan(1_200);
    const evidence = await noExtraWrites(lab, job, 0);
    expect(evidence.reads).toEqual([{ jobId: job.id, state: 'failed' }]);
  });

  test('AJ-03 stalled job exhausts the observation deadline without resubmission', async ({ lab }) => {
    const job = await lab.submit();
    const started = performance.now();
    const error = await observeError(() => observe(lab.request, job, {
      budgetMs: 240, requestTimeoutMs: 200, maxReads: 1_000,
    }));
    expect(error.code, 'JOB_DEADLINE_ORACLE').toBe('OBSERVATION_DEADLINE');
    expect(error.evidence.lastState).toBe('queued');
    expect(performance.now() - started, 'Generous test envelope around the short observer budget').toBeLessThan(1_200);
    const evidence = await noExtraWrites(lab, job, 0);
    expect(evidence.reads.length).toBeGreaterThan(0);
    expect(evidence.jobs[0].state).toBe('queued');
  });

  test('AJ-03 status identity mismatch is rejected before artifact access', async ({ lab }) => {
    const job = await lab.submit();
    await lab.mode('wrong-status-id');
    const error = await observeError(() => observe(lab.request, job, { budgetMs: 2_000 }));
    expect(error.code, 'JOB_STATUS_IDENTITY_ORACLE').toBe('IDENTITY_MISMATCH');
    expect(error.evidence.reads).toBe(1);
    await noExtraWrites(lab, job, 0);
  });

  test('AJ-03 successful status with another jobs artifact is rejected', async ({ lab }) => {
    const job = await lab.submit();
    await lab.state(job, 'running');
    await lab.state(job, 'succeeded');
    await lab.mode('wrong-artifact-id');
    const error = await observeError(() => observe(lab.request, job, { budgetMs: 2_000 }));
    expect(error.code, 'JOB_ARTIFACT_IDENTITY_ORACLE').toBe('IDENTITY_MISMATCH');
    expect(error.evidence).toEqual({ jobId: job.id, reads: 1, lastState: 'succeeded' });
    await noExtraWrites(lab, job, 1);
  });

  test('AJ-03 status read ceiling is independent of the time budget', async ({ lab }) => {
    const job = await lab.submit();
    const error = await observeError(() => observe(lab.request, job, {
      budgetMs: 2_000, maxReads: 3, intervalMs: 0,
    }));
    expect(error.code, 'JOB_READ_LIMIT_ORACLE').toBe('READ_LIMIT');
    expect(error.evidence).toEqual({ jobId: job.id, reads: 3, lastState: 'queued' });
    expect((await noExtraWrites(lab, job, 0)).reads).toHaveLength(3);
  });

  test('AJ-03 held response respects its request limit and allows cleanup', async ({ lab }) => {
    const job = await lab.submit();
    await lab.mode('hold-status');
    const started = performance.now();
    const error = await observeError(() => observe(lab.request, job, {
      budgetMs: 2_000, requestTimeoutMs: 200, maxReads: 3,
    }));
    expect(error.code, 'JOB_REQUEST_TIMEOUT_ORACLE').toBe('REQUEST_TIMEOUT');
    expect(error.evidence.reads).toBe(1);
    expect(performance.now() - started).toBeLessThan(1_200);
    expect((await noExtraWrites(lab, job, 0)).reads).toHaveLength(1);
  });

  test('AJ-03 remaining deadline caps a longer request timeout', async ({ lab }) => {
    const job = await lab.submit();
    await lab.mode('hold-status');
    const started = performance.now();
    const error = await observeError(() => observe(lab.request, job, {
      budgetMs: 240, requestTimeoutMs: 2_000, maxReads: 3,
    }));
    expect(error.code, 'JOB_REMAINING_BUDGET_ORACLE').toBe('OBSERVATION_DEADLINE');
    expect(error.evidence.reads).toBe(1);
    expect(performance.now() - started, 'A two-second request cap cannot overrun a 240ms observation budget').toBeLessThan(1_200);
    expect((await noExtraWrites(lab, job, 0)).reads).toHaveLength(1);
  });

  test('AJ-03 browser preserves unknown outcome and resumes the same job without writing', async ({ lab, page }) => {
    if (practice) {
      const prerequisite = await lab.submit();
      await lab.state(prerequisite, 'running');
      await lab.state(prerequisite, 'succeeded');
      await observe(lab.request, prerequisite, { budgetMs: 2_000 });
    }
    await page.context().setExtraHTTPHeaders({ 'x-jobs-session': lab.sessionId });
    await page.goto('/');
    const accepted = page.waitForResponse(response => response.url().endsWith('/jobs') && response.request().method() === 'POST');
    await page.getByRole('button', { name: 'Generate report', exact: true }).click();
    const job = await (await accepted).json() as JobIdentity;
    await expect(page.locator('#active-job code')).toHaveText(job.id);
    await expect(page.getByRole('status')).toHaveText('Observation stopped', { timeout: 6_000 });
    await expect(page.getByRole('alert')).toContainText(`job ${job.id} is still unknown`);
    await expect(page.getByRole('button', { name: 'Generate report', exact: true })).toBeDisabled();
    await expect(page.getByRole('region', { name: 'Completed report' })).toBeHidden();
    const before = await lab.evidence();
    expect(before.jobs.find(value => value.id === job.id)?.state).toBe('queued');
    expect(before.writes.filter(value => value.requestId === job.requestId)).toHaveLength(1);
    const progress = lab.completeAfterReads(job);
    await page.getByRole('button', { name: 'Resume observation' }).click();
    await progress;
    const report = page.getByRole('region', { name: 'Completed report' });
    await expect(report).toBeVisible();
    await expect(report.locator('#job')).toHaveText(job.id);
    await expect(report.locator('#total')).toHaveText('$289.00');
    await expect(page.getByRole('alert')).toBeEmpty();
    const after = await lab.evidence();
    expect(after.writes, 'JOB_RESUME_WRITE_ORACLE: resume must never submit another operation').toEqual(before.writes);
    expect(after.jobs).toHaveLength(practice ? 2 : 1);
  });
}
