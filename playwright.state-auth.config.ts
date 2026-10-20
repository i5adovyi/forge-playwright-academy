import { defineConfig } from '@playwright/test';
import { join } from 'node:path';
import base from './playwright.config';
import { authFile, runDirectory } from './state/project-auth/paths';

// This workshop is selected explicitly; never merge in the main suite's projects.
const { projects: _projects, ...shared } = base;
export default defineConfig(shared, {
  testDir: './state/project-auth',
  outputDir: join(runDirectory, 'test-results'),
  retries: 0,
  workers: 2,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: join(runDirectory, 'report') }],
    ['json', { outputFile: join(runDirectory, 'results.json') }],
  ],
  use: {
    ...shared.use,
    storageState: { cookies: [], origins: [] },
    extraHTTPHeaders: {},
    // This exercise writes synthetic credentials, not trace attachments.
    trace: 'off',
    video: 'off',
  },
  projects: [
    { name: 'auth-setup', testMatch: /prepare\.setup\.ts/, teardown: 'auth-cleanup' },
    { name: 'auth-reader', testMatch: /member\.spec\.ts/, dependencies: ['auth-setup'], use: { storageState: authFile } },
    { name: 'auth-guest', testMatch: /guest\.spec\.ts/ },
    { name: 'auth-cleanup', testMatch: /cleanup\.teardown\.ts/ },
  ],
});
