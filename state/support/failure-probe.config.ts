import { defineConfig } from '@playwright/test';

// Launched only by the worked examples. Deliberate failures must never be
// mixed into the academy's normal pass/skip ledger.
export default defineConfig({
  testDir: '.',
  testMatch: 'failure-probe.spec.ts',
  reporter: 'json',
  workers: 1,
  retries: 0,
  timeout: 20_000,
  outputDir: process.env.FORGE_STATE_PROBE_OUTPUT,
  use: { baseURL: process.env.FORGE_STATE_PROBE_BASE_URL, headless: true },
});
