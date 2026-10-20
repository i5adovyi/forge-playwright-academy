import type { APIRequestContext, Page } from '@playwright/test';
import type { ExpectedRelease, GuardedResult, ProbeResult, TargetDecision } from './contracts';

// WB-01: observe the actual browser request and compare independent release
// expectations. Return exact mismatch reasons plus safe diagnostic evidence.
export async function verifyTarget(_page: Page, _url: string, _expected: ExpectedRelease): Promise<TargetDecision> {
  throw new Error('WB-01_STARTER_NOT_IMPLEMENTED: implement independent identity checks');
}

// WB-02: preserve explicit unavailability, unexpected HTTP/schema responses,
// and transport failures as separate outcomes. No silent retries.
export async function checkDependency(_request: APIRequestContext, _url: string): Promise<ProbeResult> {
  throw new Error('WB-02_STARTER_NOT_IMPLEMENTED: implement precise dependency classification');
}

// WB-03: perform identity verification BEFORE the first business write.
// For an independent exercise, reuse verifyTarget from ./helpers; after WB-01
// passes, switch to your own function above. Do not alter the acceptance cases.
export async function runGuardedOrder(_page: Page, _url: string, _expected: ExpectedRelease): Promise<GuardedResult> {
  throw new Error('WB-03_STARTER_NOT_IMPLEMENTED: implement a fail-closed write guard');
}
