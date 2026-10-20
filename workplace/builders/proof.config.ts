import { defineConfig } from '@playwright/test';
import path from 'node:path';
import normalConfig from '../../playwright.config';

const root = path.resolve(import.meta.dirname, '../..');
const { projects: _projects, webServer: _webServer, ...shared } = normalConfig;
const directory = process.env.FORGE_DB_PROOF_DIR || path.join(root, 'quality-results/builders-proof');
const server = process.env.FORGE_DB_PROOF_SERVER || path.join(root, 'server.mjs');
const port = process.env.PORT || '14832';
const baseURL = `http://127.0.0.1:${port}`;
// Quote the path as shell data because webServer.command is a shell command.
const quoted = `'${server.replaceAll("'", "'\\''")}'`;
export default defineConfig(shared, {
  testDir: root,
  retries: 0,
  outputDir: path.join(directory, 'artifacts'),
  reporter: [['list'], ['json', { outputFile: path.join(directory, 'results.json') }]],
  use: { baseURL },
  projects: [{ name: 'builders-proof', testMatch: /workplace\/builders\/worked\.spec\.ts/ }],
  // Every proof owns its server. Never accidentally reuse a normal live server.
  webServer: { command: `node ${quoted}`, url: `${baseURL}/api/forge-health`, reuseExistingServer: false, timeout: 15_000 },
});
