import { defineConfig, devices } from '@playwright/test';

const port = process.env.PORT || '4173';
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
    { name: 'api', testMatch: /tests\/api\/.*\.spec\.ts/ },
    { name: 'solutions', testMatch: /solutions\/.*\.spec\.ts/ },
    { name: 'exercises', testMatch: /exercises\/.*\.spec\.ts/ },
    { name: 'skills', testMatch: /skills\/worked\.spec\.ts/ },
    { name: 'skills-practice', testMatch: /skills\/practice\.spec\.ts/ },
    { name: 'accessibility', testMatch: /quality\/accessibility\/worked\.spec\.ts/ },
    { name: 'accessibility-practice', testMatch: /quality\/accessibility\/practice\.spec\.ts/ },
    { name: 'portal', testMatch: /tests\/portal\/.*\.spec\.ts/ },
  ],
  webServer: {
    command: 'node server.mjs',
    url: `${baseURL}/api/forge-health`,
    reuseExistingServer: !process.env.CI,
    timeout: 15_000,
  },
});
