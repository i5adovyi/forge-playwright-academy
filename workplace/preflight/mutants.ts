import type { Helpers } from './contracts';
import * as reference from './helpers';

// Deliberately weak implementations. They test the acceptance suite's ability
// to reject plausible shortcuts, not defects hidden in the normal reference.
export function mutatedHelpers(mode: string): Helpers {
  if (!mode) return reference;
  if (mode === 'trust-health') return {
    ...reference,
    verifyTarget: async (page, url) => ({
      allowed: true, reasons: [], evidence: await reference.observeTarget(page, url),
    }),
  };
  if (mode === 'collapse-errors') return {
    ...reference,
    checkDependency: async (request, url) => {
      const result = await reference.checkDependency(request, url);
      return result.kind === 'ready' ? result : { ...result, kind: 'dependency-unavailable' };
    },
  };
  if (mode === 'write-first') return {
    ...reference,
    runGuardedOrder: async (page, url, expected) => {
      // Checking and cleaning up later cannot undo the fact that a write ran.
      await reference.observeTarget(page, url);
      const order = await reference.placeOrder(page);
      return { decision: await reference.verifyTarget(page, url, expected), order };
    },
  };
  throw new Error(`Unknown preflight mutation: ${mode}`);
}
