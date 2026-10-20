import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const resultDir = process.env.FORGE_INCIDENT_RUN_DIR || path.join(root, 'quality-results/incidents/direct');
const port = process.env.PORT || '14828';
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: '.',
  fullyParallel: true,
  forbidOnly: true,
  retries: 0, // One outcome per case makes the causal demonstration inspectable.
  workers: 3,
  timeout: 15_000,
  expect: { timeout: 2_000 },
  outputDir: path.join(resultDir, 'artifacts'),
  reporter: [
    ['list'],
    ['json', { outputFile: path.join(resultDir, 'results.json') }],
    ['html', { open: 'never', outputFolder: path.join(resultDir, 'report') }],
  ],
  use: { baseURL, trace: 'on', screenshot: 'only-on-failure', ...devices['Desktop Chrome'] },
  projects: [
    { name: 'incident-broken', testMatch: 'broken.spec.ts' },
    { name: 'incident-solutions', testMatch: 'worked.spec.ts' },
    { name: 'incident-practice', testMatch: 'practice.spec.ts' },
  ],
  webServer: {
    command: 'node server.mjs',
    cwd: root,
    env: { PORT: port },
    url: `${baseURL}/api/forge-health`,
    reuseExistingServer: false,
    timeout: 15_000,
  },
});
