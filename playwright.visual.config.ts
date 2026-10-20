import { defineConfig } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const port = process.env.PORT || '4176';
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: path.join(root, 'quality/visual'),
  outputDir: path.join(root, 'quality-results/visual'),
  // Starter and solution compare the SAME oracle; file/project names are omitted intentionally.
  snapshotPathTemplate: path.join(root, 'quality/visual/baselines/{platform}/{arg}{ext}'),
  updateSnapshots: 'none',
  forbidOnly: !!process.env.CI,
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,
  retries: 0,
  timeout: 20_000,
  expect: {
    timeout: 5_000,
    toHaveScreenshot: { animations: 'disabled', caret: 'hide', scale: 'css', maxDiffPixels: 0, threshold: 0 },
  },
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: path.join(root, 'quality-results/visual-report') }],
    ['junit', { outputFile: path.join(root, 'quality-results/visual-junit.xml') }],
  ],
  use: {
    baseURL,
    browserName: 'chromium',
    viewport: { width: 1100, height: 800 },
    deviceScaleFactor: 1,
    locale: 'en-US',
    timezoneId: 'UTC',
    colorScheme: 'light',
    reducedMotion: 'reduce',
    serviceWorkers: 'block',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [
    { name: 'visual', testMatch: 'worked.spec.ts' },
    { name: 'visual-practice', testMatch: 'practice.spec.ts' },
  ],
  webServer: {
    command: 'node server.mjs',
    cwd: root,
    url: `${baseURL}/api/forge-health`,
    // Never attach to the learner's SQLite-backed workshop.
    env: { PORT: port, FORGE_PROGRESS_MODE: 'browser' },
    reuseExistingServer: false,
    timeout: 15_000,
  },
});
