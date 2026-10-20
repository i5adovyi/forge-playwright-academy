import { defineConfig, devices } from '@playwright/test';

const port = process.env.PORT || '4175';
const baseURL = `http://127.0.0.1:${port}`;
export default defineConfig({
  testDir: '.',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : 4,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  reporter: [['list'], ['html', { open: 'never' }], ['junit', { outputFile: 'test-results/junit.xml' }]],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    ...devices['Desktop Chrome'],
  },
  projects: [
    { name: 'ui', testMatch: /tests\/ui\/.*\.spec\.ts/ },
    { name: 'ui-workshop', testMatch: /ui-workshop\/worked\.spec\.ts/ },
    { name: 'ui-practice', testMatch: /ui-workshop\/practice\.spec\.ts/ },
    { name: 'api', testMatch: /tests\/api\/.*\.spec\.ts/ },
    { name: 'api-workshop', testMatch: /api-workshop\/worked\.spec\.ts/ },
    { name: 'api-practice', testMatch: /api-workshop\/practice\.spec\.ts/ },
    { name: 'solutions', testMatch: /solutions\/.*\.spec\.ts/ },
    { name: 'exercises', testMatch: /exercises\/.*\.spec\.ts/ },
    { name: 'skills', testMatch: /skills\/worked\.spec\.ts/ },
    { name: 'skills-practice', testMatch: /skills\/practice\.spec\.ts/ },
    { name: 'accessibility', testMatch: /quality\/accessibility\/worked\.spec\.ts/ },
    { name: 'accessibility-practice', testMatch: /quality\/accessibility\/practice\.spec\.ts/ },
    { name: 'state', testMatch: /state\/worked\.spec\.ts/ },
    { name: 'state-practice', testMatch: /state\/practice\.spec\.ts/ },
    { name: 'workplace-refactoring', testMatch: /workplace\/refactoring\/(baseline|worked)\.spec\.ts/ },
    { name: 'workplace-refactoring-practice', testMatch: /workplace\/refactoring\/practice\.spec\.ts/ },
    { name: 'workplace-builders', testMatch: /workplace\/builders\/worked\.spec\.ts/ },
    { name: 'workplace-builders-practice', testMatch: /workplace\/builders\/practice\.spec\.ts/ },
    { name: 'portal', testMatch: /tests\/portal\/.*\.spec\.ts/ },
  ],
  webServer: {
    command: 'node server.mjs',
    url: `${baseURL}/api/forge-health`,
    // Never attach to the learner's SQLite-backed workshop.
    env: { PORT: port, FORGE_PROGRESS_MODE: 'browser' },
    reuseExistingServer: false,
    timeout: 15_000,
  },
});
