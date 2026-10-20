import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../..');
const directory = process.env.FORGE_RECOVERY_RUN_DIR || path.join(root, 'quality-results/recovery/direct');
const port = process.env.RECOVERY_PORT || '14842';
const baseURL = `http://127.0.0.1:${port}`;
export default defineConfig({
  testDir: '.', fullyParallel: true, forbidOnly: true, retries: 0, workers: 3,
  timeout: 15_000, expect: { timeout: 3_000 },
  outputDir: path.join(directory, 'artifacts'),
  reporter: [['list'], ['json', { outputFile: path.join(directory, 'results.json') }]],
  use: { baseURL, ...devices['Desktop Chrome'], trace: 'on', screenshot: 'only-on-failure' },
  projects: [
    { name: 'recovery-solutions', testMatch: 'worked.spec.ts' },
    { name: 'recovery-practice', testMatch: 'practice.spec.ts' },
  ],
  webServer: {
    command: 'node workplace/recovery/server.mjs', cwd: root, url: `${baseURL}/health`,
    env: { RECOVERY_PORT: port, FORGE_RECOVERY_DATA_DIR: path.join(directory, 'journal') },
    reuseExistingServer: false, timeout: 15_000,
  },
});
