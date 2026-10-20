import { test as base, expect } from '@playwright/test';
import type { APIRequestContext, TestInfo } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import type { ExpectedRelease, Helpers, ProbeKind } from './contracts';

const frontendOrigin = `http://127.0.0.1:${process.env.FORGE_PREFLIGHT_FRONT_PORT || 14840}`;
const backendOrigin = `http://127.0.0.1:${process.env.FORGE_PREFLIGHT_BACK_PORT || 14841}`;
export const expected: ExpectedRelease = {
  ...JSON.parse(readFileSync(new URL('./expected-release.json', import.meta.url), 'utf8')),
  frontendOrigin, backendOrigin,
};
interface Lab {
  create(scenario: string): Promise<{ id: string; url: string; dependencyURL: string }>;
  ledger(id: string): Promise<{ writes: unknown[]; attempts: number; probes: number }>;
}
const test = base.extend<{ lab: Lab }>({
  lab: async ({ request }, use) => {
    const ids: string[] = [];
    await use({
      create: async scenario => {
        const id = randomUUID();
        const response = await request.post(`${frontendOrigin}/__control/sessions`, { data: { id, scenario } });
        expect(response.status(), 'FIXTURE_SETUP: fresh isolated session').toBe(201);
        ids.push(id);
        return { id, url: `${frontendOrigin}/?session=${id}`, dependencyURL: `${backendOrigin}/dependency?session=${id}` };
      },
      ledger: async id => {
        const response = await request.get(`${frontendOrigin}/__control/ledger?session=${id}`);
        expect(response.status(), 'FIXTURE_LEDGER: read observation').toBe(200);
        return await response.json();
      },
    });
    for (const id of ids) {
      const response = await request.delete(`${frontendOrigin}/__control/session?session=${id}`);
      expect(response.status(), 'FIXTURE_TEARDOWN: remove owned session').toBe(200);
    }
  },
});
async function attach(info: TestInfo, name: string, value: unknown) {
  const path = info.outputPath(`${name}.json`);
  await writeFile(path, JSON.stringify(value, null, 2));
  await info.attach(name, { path, contentType: 'application/json' });
}
async function healthy(request: APIRequestContext) {
  for (const origin of [frontendOrigin, backendOrigin]) {
    const response = await request.get(`${origin}/health`);
    expect(response.status(), 'FIXTURE_HEALTH: the wrong-build case must still be healthy').toBe(200);
    expect(await response.json()).toMatchObject({ healthy: true });
  }
}

// Reuse the same behavioral contracts against a learner helper and the reference.
// Expectations below are not derived from the implementation's returned data.
export function registerCases(helpers: Helpers, unfinished = false) {
  test.skip(unfinished, 'Enable learner helpers explicitly with --enable-starters.');
  const identityCases = [
    { name: 'correct release', scenario: 'correct', reasons: [] },
    { name: 'stale frontend', scenario: 'stale-frontend', reasons: ['FRONTEND_BUILD_MISMATCH'] },
    { name: 'stale backend', scenario: 'stale-backend', reasons: ['BACKEND_BUILD_MISMATCH'] },
    { name: 'misleading badge and wrong API origin', scenario: 'wrong-destination', reasons: ['BACKEND_ORIGIN_MISMATCH'] },
    { name: 'wrong tenant', scenario: 'wrong-tenant', reasons: ['BACKEND_TENANT_MISMATCH'] },
    { name: 'wrong environment', scenario: 'wrong-environment', reasons: ['BACKEND_ENVIRONMENT_MISMATCH'] },
    { name: 'wrong application', scenario: 'wrong-application', reasons: ['BACKEND_APPLICATION_MISMATCH'] },
    { name: 'malformed frontend identity', scenario: 'malformed-frontend', reasons: ['FRONTEND_IDENTITY_FORMAT'] },
    { name: 'malformed backend identity', scenario: 'malformed-backend', reasons: ['BACKEND_IDENTITY_FORMAT'] },
    { name: 'wrong frontend origin', scenario: 'wrong-frontend-origin', reasons: ['FRONTEND_ORIGIN_MISMATCH'] },
    { name: 'wrong frontend tenant', scenario: 'wrong-frontend-tenant', reasons: ['FRONTEND_TENANT_MISMATCH'] },
    { name: 'wrong frontend environment', scenario: 'wrong-frontend-environment', reasons: ['FRONTEND_ENVIRONMENT_MISMATCH'] },
    { name: 'wrong frontend application', scenario: 'wrong-frontend-application', reasons: ['FRONTEND_APPLICATION_MISMATCH'] },
  ];
  for (const scenario of identityCases) {
    test(`WB-01 ${scenario.name}`, async ({ page, request, lab }, info) => {
      await healthy(request);
      const target = await lab.create(scenario.scenario);
      const decision = await helpers.verifyTarget(page, target.url, expected);
      await attach(info, 'identity-evidence', { expected, decision });
      expect({ allowed: decision.allowed, reasons: decision.reasons }, 'WB-01_IDENTITY: reviewed release must match every identity field and origin')
        .toEqual({ allowed: scenario.reasons.length === 0, reasons: scenario.reasons });
      expect(decision.evidence.backendStatus, 'WB-01_EVIDENCE: actual identity response status').toBe(200);
      expect(new URL(decision.evidence.backendURL).origin, 'WB-01_EVIDENCE: observed browser destination')
        .toBe(scenario.scenario === 'wrong-destination' ? frontendOrigin : backendOrigin);
      expect(new URL(decision.evidence.frontendURL).origin, 'WB-01_EVIDENCE: observed final frontend origin')
        .toBe(scenario.scenario === 'wrong-frontend-origin' ? backendOrigin : frontendOrigin);
      expect(await lab.ledger(target.id), 'WB-01_NO_WRITES: identity checks are read-only')
        .toEqual({ attempts: 0, writes: [], probes: 0 });
    });
  }
  const dependencyCases: Array<{
    name: string; scenario: string; kind: ProbeKind; status: number | null; code: string | null;
  }> = [
    { name: 'ready dependency', scenario: 'correct', kind: 'ready', status: 200, code: null },
    { name: 'explicit dependency outage', scenario: 'dependency-down', kind: 'dependency-unavailable', status: 503, code: 'DEPENDENCY_UNAVAILABLE' },
    { name: 'unexpected product response', scenario: 'product-error', kind: 'unexpected-response', status: 500, code: 'PRICE_CALCULATION_FAILED' },
    { name: 'malformed success body', scenario: 'malformed-ready', kind: 'unexpected-response', status: 200, code: null },
    { name: 'connection reset', scenario: 'transport-reset', kind: 'transport-error', status: null, code: null },
  ];
  for (const scenario of dependencyCases) {
    test(`WB-02 ${scenario.name}`, async ({ request, lab }, info) => {
      const target = await lab.create(scenario.scenario);
      const result = await helpers.checkDependency(request, target.dependencyURL);
      await attach(info, 'dependency-evidence', result);
      expect(result.kind, 'WB-02_CLASSIFICATION: preserve the observed failure category').toBe(scenario.kind);
      expect({ url: result.url, status: result.status, code: result.code }, 'WB-02_EVIDENCE: preserve status, code and exact target')
        .toEqual({ url: target.dependencyURL, status: scenario.status, code: scenario.code });
      expect(result.requestId, 'WB-02_EVIDENCE: keep correlation when an HTTP response exists')
        .toBe(scenario.status === null ? null : `probe-${target.id}-1`);
      expect(await lab.ledger(target.id), 'WB-02_NO_RETRY: one read probe and no business writes')
        .toEqual({ attempts: 0, writes: [], probes: 1 });
    });
  }
  for (const scenario of [
    { name: 'wrong build makes zero writes', scenario: 'stale-backend', allowed: false, reasons: ['BACKEND_BUILD_MISMATCH'] },
    { name: 'wrong origin makes zero writes', scenario: 'wrong-destination', allowed: false, reasons: ['BACKEND_ORIGIN_MISMATCH'] },
    { name: 'correct target makes exactly one write', scenario: 'correct', allowed: true, reasons: [] },
  ]) {
    test(`WB-03 ${scenario.name}`, async ({ page, lab }, info) => {
      const target = await lab.create(scenario.scenario);
      const result = await helpers.runGuardedOrder(page, target.url, expected);
      const ledger = await lab.ledger(target.id);
      await attach(info, 'guard-and-write-ledger', { result, ledger });
      const order = { id: 'TRAINING-1', item: 'release-check', quantity: 1 };
      expect(ledger, 'WB-03_WRITE_GATE: denial must prevent the first write; a valid target must perform one')
        .toEqual({ attempts: scenario.allowed ? 1 : 0, writes: scenario.allowed ? [order] : [], probes: 0 });
      expect({ allowed: result.decision.allowed, reasons: result.decision.reasons }, 'WB-03_DECISION: denial must explain the actual mismatch')
        .toEqual({ allowed: scenario.allowed, reasons: scenario.reasons });
      expect(result.order, 'WB-03_ORDER: report only a write actually allowed by the guard')
        .toEqual(scenario.allowed ? order : null);
    });
  }
}
