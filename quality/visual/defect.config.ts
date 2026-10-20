import { defineConfig } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import visualConfig from '../../playwright.visual.config';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
// defineConfig merges named projects, so remove the normal projects before inheriting.
const { projects: _normalProjects, ...shared } = visualConfig;
export default defineConfig(shared, {
  outputDir: path.join(root, 'quality-results/visual-defect'),
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: path.join(root, 'quality-results/visual-defect-report') }],
  ],
  projects: [{ name: 'visual-defect', testMatch: 'defect.spec.ts' }],
});
