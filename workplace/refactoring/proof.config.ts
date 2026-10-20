import { defineConfig } from '@playwright/test';
import path from 'node:path';
import normalConfig from '../../playwright.config';

const root = path.resolve(import.meta.dirname, '../..');
const { projects: _projects, webServer: _webServer, ...shared } = normalConfig;
const directory = process.env.FORGE_RF_PROOF_DIR || path.join(root, 'quality-results/refactoring-proof');
const port = process.env.PORT || '14832';
const baseURL = `http://127.0.0.1:${port}`;
export default defineConfig(shared, {
  testDir: root,
  retries: 0,
  expect: { timeout: 1_000 },
  outputDir: path.join(directory, 'artifacts'),
  reporter: [['list'], ['json', { outputFile: path.join(directory, 'results.json') }]],
  use: { baseURL },
  projects: [{ name: 'refactoring-proof', testMatch: /workplace\/refactoring\/(?:baseline|worked)\.spec\.ts/ }],
  webServer: { command: 'node server.mjs', cwd: root, url: `${baseURL}/api/forge-health`, reuseExistingServer: false, timeout: 15_000 },
});
