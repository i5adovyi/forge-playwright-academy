import { defineConfig, devices } from '@playwright/test';
import academy from './playwright.config';

// Opt-in browser matrix: normal npm test stays fast and Chromium-only.
// Install engines with npm run browsers:all, then run npm run test:matrix.
const { projects: _defaultProjects, ...shared } = academy;
export default defineConfig(shared, {
  projects: [
    { name:'ui-chromium', testMatch:/tests\/ui\/.*\.spec\.ts/, use:{ ...devices['Desktop Chrome'], browserName:'chromium' } },
    { name:'ui-firefox', testMatch:/tests\/ui\/.*\.spec\.ts/, use:{ ...devices['Desktop Firefox'], browserName:'firefox' } },
    { name:'ui-webkit', testMatch:/tests\/ui\/.*\.spec\.ts/, use:{ ...devices['Desktop Safari'], browserName:'webkit' } },
  ],
});
