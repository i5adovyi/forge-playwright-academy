import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/persistence',
  fullyParallel: true,
  workers: process.env.CI ? 2 : 3,
  retries: 0,
  timeout: 35_000,
  expect: { timeout: 7_000 },
  outputDir: 'quality-results/persistence/test-results',
  reporter: [['list']],
  use: { ...devices['Desktop Chrome'], trace: 'retain-on-failure', screenshot: 'only-on-failure' },
});
