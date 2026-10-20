import { defineConfig, devices } from '@playwright/test';

const port = process.env.FORGE_PREVIEW_PORT || '14831';
export default defineConfig({
  testDir: './tests/hosting',
  retries: 0,
  workers: 1,
  outputDir: 'quality-results/hosting/test-results',
  reporter: [['list']],
  use: { baseURL: `http://127.0.0.1:${port}`, ...devices['Desktop Chrome'], trace: 'retain-on-failure' },
  webServer: {
    command: 'node scripts/preview.mjs',
    env: { PORT: port },
    url: `http://127.0.0.1:${port}/`,
    reuseExistingServer: false,
  },
});
