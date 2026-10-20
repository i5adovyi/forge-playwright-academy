import type { APIRequestContext, Page } from '@playwright/test';

export interface ExpectedRelease {
  application: string;
  environment: string;
  tenant: string;
  frontendBuild: string;
  backendBuild: string;
  frontendOrigin: string;
  backendOrigin: string;
}
export interface TargetEvidence {
  frontendURL: string;
  frontend: unknown;
  backendURL: string;
  backendStatus: number;
  backend: unknown;
}
export interface TargetDecision {
  allowed: boolean;
  reasons: string[];
  evidence: TargetEvidence;
}
export type ProbeKind = 'ready' | 'dependency-unavailable' | 'unexpected-response' | 'transport-error';
export interface ProbeResult {
  kind: ProbeKind;
  url: string;
  status: number | null;
  code: string | null;
  requestId: string | null;
}
export interface GuardedResult {
  decision: TargetDecision;
  order: { id: string; item: string; quantity: number } | null;
}
export interface Helpers {
  verifyTarget(page: Page, url: string, expected: ExpectedRelease): Promise<TargetDecision>;
  checkDependency(request: APIRequestContext, url: string): Promise<ProbeResult>;
  runGuardedOrder(page: Page, url: string, expected: ExpectedRelease): Promise<GuardedResult>;
}
