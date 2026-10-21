import { cp, lstat, mkdir, readFile } from 'node:fs/promises';
import { realpathSync } from 'node:fs';
import path from 'node:path';

// Shared by download packaging and the new-account copy. Only source belongs
// here: credentials, personal records and generated test output are not assets.
export const sourceEntries = [
  'portal', 'lab', 'beginner', 'skills', 'quality', 'state', 'api-workshop', 'ui-workshop',
  'workplace', 'local-data', 'tests', 'exercises', 'solutions', 'scripts', 'docs',
  'package.json', 'package-lock.json', 'playwright.config.ts',
  'playwright.matrix.config.ts', 'playwright.visual.config.ts',
  'playwright.state-auth.config.ts', 'playwright.hosting.config.ts',
  'playwright.persistence.config.ts', 'tsconfig.json', 'server.mjs', 'README.md',
  'AGENTS.md', 'CLAUDE.md', '.github', '.gitignore', '.nvmrc', 'LICENSE',
];
const excludedDirectories = new Set([
  '.git', '.openai', '.codex', 'node_modules', 'dist', '.auth', '.forge-data',
  '.forge-playwright-academy', 'progress-backups', 'learning-data', 'backups',
  'test-results', 'playwright-report', 'quality-results', '.blob-report',
]);
export function isExcludedSource(relativePath) {
  const normalized = relativePath.split(path.sep).join('/');
  const parts = normalized.split('/');
  const name = parts.at(-1);
  return parts.some(part => excludedDirectories.has(part)) ||
    /^portal\/(downloads|docs)(\/|$)/.test(normalized) ||
    name === '.DS_Store' || name === '.env' || name.startsWith('.env.') ||
    /\.(sqlite3?|db)(-(wal|shm|journal))?$/i.test(name) ||
    /\.(log|bundle)$/i.test(name) ||
    /^(forge-learning-progress|forge-progress|learning-progress|progress-backup).*\.json$/i.test(name);
}
export function isConfiguredDataPath(absolutePath, sourceRoot) {
  if (!process.env.FORGE_DATA_DIR) return false;
  const canonical = value => {
    try { return realpathSync(value); }
    catch (error) { if (error.code === 'ENOENT') return value; throw error; }
  };
  const dataPath = canonical(path.resolve(sourceRoot, process.env.FORGE_DATA_DIR));
  const candidate = canonical(absolutePath);
  return candidate === dataPath || candidate.startsWith(`${dataPath}${path.sep}`);
}
export function isLearnerDataJSON(fileName, contents) {
  if (!fileName.toLowerCase().endsWith('.json')) return false;
  try {
    const value = JSON.parse(contents);
    const record = value?.progress || value;
    return !!record && Array.isArray(record.completed) &&
      record.notes && typeof record.notes === 'object' &&
      record.checks && typeof record.checks === 'object';
  } catch { return false; }
}
export async function sourceFileAllowed(sourceRoot, absolutePath) {
  const relative = path.relative(sourceRoot, absolutePath);
  if (relative && (isExcludedSource(relative) || isConfiguredDataPath(absolutePath, sourceRoot))) return false;
  const info = await lstat(absolutePath);
  if (info.isSymbolicLink()) throw new Error(`Source contains a symlink; remove it from the portable source: ${relative}`);
  if (info.isFile() && absolutePath.toLowerCase().endsWith('.json') &&
      isLearnerDataJSON(absolutePath, await readFile(absolutePath, 'utf8'))) return false;
  return true;
}
export async function copySourceEntries(sourceRoot, destination) {
  await mkdir(destination, { recursive: true });
  const copied = [];
  for (const entry of sourceEntries) {
    const source = path.join(sourceRoot, entry);
    try { await lstat(source); }
    catch (error) { if (error.code === 'ENOENT') continue; throw error; }
    if (!await sourceFileAllowed(sourceRoot, source)) continue;
    await cp(source, path.join(destination, entry), {
      recursive: true, errorOnExist: true, force: false,
      filter: candidate => sourceFileAllowed(sourceRoot, candidate),
    });
    copied.push(entry);
  }
  return copied;
}
