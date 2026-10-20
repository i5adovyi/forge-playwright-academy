import { defineConfig, devices } from '@playwright/test';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const output = process.env.FORGE_PREFLIGHT_OUTPUT || resolve(root, 'quality-results/preflight/direct');
const frontPort = process.env.FORGE_PREFLIGHT_FRONT_PORT || '14840';
const backPort = process.env.FORGE_PREFLIGHT_BACK_PORT || '14841';
export default defineConfig({
  testDir: '.', fullyParallel: true, forbidOnly: true,
  workers: 2, retries: 0, timeout: 12_000, expect: { timeout: 2_000 },
  outputDir: resolve(output, 'artifacts'),
  reporter: [
    ['list'], ['json', { outputFile: resolve(output, 'results.json') }],
    ['html', { open: 'never', outputFolder: resolve(output, 'report') }],
  ],
  use: { ...devices['Desktop Chrome'], trace: 'on', screenshot: 'only-on-failure' },
  projects: [
    { name: 'preflight-worked', testMatch: 'worked.spec.ts' },
    { name: 'preflight-practice', testMatch: 'practice.spec.ts' },
  ],
  webServer: {
    command: 'node workplace/preflight/server.mjs', cwd: root,
    env: { FORGE_PREFLIGHT_FRONT_PORT: frontPort, FORGE_PREFLIGHT_BACK_PORT: backPort },
    url: `http://127.0.0.1:${frontPort}/health`,
    reuseExistingServer: false, timeout: 15_000,
  },
});
