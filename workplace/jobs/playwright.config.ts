import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const output = process.env.JOBS_RESULTS_DIR || path.join(root, 'quality-results/jobs/direct');
const port = process.env.JOBS_PORT || '14844';
const baseURL = `http://127.0.0.1:${port}`;
export default defineConfig({
  testDir: '.', fullyParallel: true, forbidOnly: true, retries: 0, workers: 3,
  timeout: 12_000, expect: { timeout: 3_000 },
  outputDir: path.join(output, 'artifacts'),
  reporter: [['list'], ['json', { outputFile: path.join(output, 'results.json') }],
    ['html', { open: 'never', outputFolder: path.join(output, 'report') }]],
  use: { baseURL, ...devices['Desktop Chrome'], trace: 'on', screenshot: 'only-on-failure' },
  projects: [
    { name: 'jobs-worked', testMatch: 'worked.spec.ts' },
    { name: 'jobs-practice', testMatch: 'practice.spec.ts' },
  ],
  webServer: {
    command: 'node workplace/jobs/server.mjs', cwd: root, url: `${baseURL}/health`,
    reuseExistingServer: false, timeout: 12_000,
    env: { JOBS_PORT: port, JOBS_FAULT: process.env.JOBS_FAULT || '' },
  },
});
