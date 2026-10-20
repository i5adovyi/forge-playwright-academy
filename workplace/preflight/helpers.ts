import type { APIRequestContext, Page } from '@playwright/test';
import type { ExpectedRelease, GuardedResult, ProbeResult, TargetDecision, TargetEvidence } from './contracts';

const record = (value: unknown): Record<string, unknown> | null =>
  value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null;

export async function observeTarget(page: Page, url: string): Promise<TargetEvidence> {
  const session = new URL(url).searchParams.get('session');
  // Register before navigation. Match the correlation token and endpoint, not
  // the expected origin: restricting this to the expected URL hides misrouting.
  const responsePromise = page.waitForResponse(response => {
    const actual = new URL(response.url());
    return ['/identity', '/backend/identity'].includes(actual.pathname)
      && actual.searchParams.get('session') === session
      && response.request().method() === 'GET';
  });
  await page.goto(url);
  const response = await responsePromise;
  const metadata = await page.locator('meta[name="forge-build"]').getAttribute('content');
  let frontend: unknown = null;
  let backend: unknown = null;
  try { frontend = JSON.parse(metadata || 'null'); } catch {}
  try { backend = await response.json(); } catch {}
  return {
    frontendURL: page.url(), frontend,
    backendURL: response.url(), backendStatus: response.status(), backend,
  };
}

// WB-01: the release manifest is an input, never copied from the target.
export async function verifyTarget(page: Page, url: string, expected: ExpectedRelease): Promise<TargetDecision> {
  const evidence = await observeTarget(page, url);
  const reasons: string[] = [];
  if (new URL(evidence.frontendURL).origin !== expected.frontendOrigin) reasons.push('FRONTEND_ORIGIN_MISMATCH');
  if (new URL(evidence.backendURL).origin !== expected.backendOrigin) reasons.push('BACKEND_ORIGIN_MISMATCH');
  if (evidence.backendStatus !== 200) reasons.push('BACKEND_IDENTITY_STATUS');
  for (const [component, identity, build] of [
    ['FRONTEND', evidence.frontend, expected.frontendBuild],
    ['BACKEND', evidence.backend, expected.backendBuild],
  ] as const) {
    const value = record(identity);
    if (!value) { reasons.push(`${component}_IDENTITY_FORMAT`); continue; }
    for (const [field, wanted] of [
      ['application', expected.application], ['environment', expected.environment],
      ['tenant', expected.tenant], ['build', build],
    ] as const) {
      if (value[field] !== wanted) reasons.push(`${component}_${field.toUpperCase()}_MISMATCH`);
    }
  }
  return { allowed: reasons.length === 0, reasons, evidence };
}

// WB-02: preserve the observed category; HTTP 500 alone cannot establish a
// dependency outage or a specific application's root cause.
export async function checkDependency(request: APIRequestContext, url: string): Promise<ProbeResult> {
  let response;
  try {
    response = await request.get(url, { timeout: 2_000, maxRetries: 0, maxRedirects: 0, failOnStatusCode: false });
  } catch {
    // Deliberately do not save raw request logs: they may contain credentials.
    return { kind: 'transport-error', url, status: null, code: null, requestId: null };
  }
  let value: Record<string, unknown> | null = null;
  try { value = record(await response.json()); } catch {}
  const result: ProbeResult = {
    kind: 'unexpected-response', url: response.url(), status: response.status(),
    code: typeof value?.code === 'string' ? value.code : null,
    requestId: typeof value?.requestId === 'string' ? value.requestId : null,
  };
  if (result.status === 200 && value?.ready === true && result.requestId) result.kind = 'ready';
  if (result.status === 503 && result.code === 'DEPENDENCY_UNAVAILABLE'
      && value?.dependency === 'inventory' && result.requestId) result.kind = 'dependency-unavailable';
  await response.dispose();
  return result;
}

export async function placeOrder(page: Page): Promise<NonNullable<GuardedResult['order']>> {
  const responsePromise = page.waitForResponse(response =>
    ['/orders', '/backend/orders'].includes(new URL(response.url()).pathname)
    && response.request().method() === 'POST');
  await page.getByRole('button', { name: 'Place training order' }).click();
  const response = await responsePromise;
  if (response.status() !== 201) throw new Error(`ORDER_STATUS: ${response.status()}`);
  return await response.json();
}

// WB-03: no business write is reachable until the identity decision allows it.
export async function runGuardedOrder(page: Page, url: string, expected: ExpectedRelease): Promise<GuardedResult> {
  const decision = await verifyTarget(page, url, expected);
  if (!decision.allowed) return { decision, order: null };
  return { decision, order: await placeOrder(page) };
}
