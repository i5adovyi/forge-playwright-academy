import { defineConfig } from '@playwright/test';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const port = process.env.PORT || '14830';
const output = process.env.FORGE_GATE_OUTPUT || resolve(root, 'quality-results/workplace-gates/manual');
export default defineConfig({
  testDir: './suite',
  fullyParallel: true,
  forbidOnly: true,
  workers: 2,
  // One retry makes the controlled "fails once, then passes" outcome observable.
  retries: 1,
  timeout: 10_000,
  reporter: [['list'], ['json', { outputFile: resolve(output, 'results.json') }]],
  outputDir: resolve(output, 'artifacts'),
  globalTeardown: './teardown.ts',
  use: { baseURL: `http://127.0.0.1:${port}`, trace: 'retain-on-failure' },
  projects: [
    { name: 'gate-smoke', testMatch: 'smoke.spec.ts' },
    { name: 'gate-checkout', testMatch: 'checkout.spec.ts' },
  ],
  webServer: {
    command: 'node server.mjs',
    cwd: root,
    env: { PORT: port },
    url: `http://127.0.0.1:${port}/api/forge-health`,
    reuseExistingServer: false,
    timeout: 15_000,
  },
});
