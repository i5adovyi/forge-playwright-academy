import { constants } from 'node:fs';
import { lstat, mkdir, open, readdir, realpath, rm, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { sourceEntries, sourceFileAllowed, isLearnerDataJSON } from './source-manifest.mjs';

const defaultSourceRoot = resolve(import.meta.dirname, '..');
const defaultRepositoryURL = 'https://github.com/i5adovyi/forge-playwright-academy';

function isWithin(parent, candidate) {
  const path = relative(parent, candidate);
  return path === '' || (!path.startsWith(`..${sep}`) && path !== '..' && !isAbsolute(path));
}

async function statIfPresent(path) {
  try {
    return await lstat(path);
  } catch (error) {
    if (error.code === 'ENOENT') return undefined;
    throw error;
  }
}

async function collectFiles(sourceRoot) {
  const files = [];
  async function visit(relativePath) {
    const portablePath = relativePath.split(sep).join('/');
    const absolutePath = join(sourceRoot, relativePath);
    if (!await sourceFileAllowed(sourceRoot, absolutePath)) return;
    const stat = await lstat(absolutePath);
    if (stat.isSymbolicLink()) {
      throw new Error(`Refusing source symlink: ${portablePath}. Copy real source files instead.`);
    }
    if (stat.isDirectory()) {
      for (const name of (await readdir(absolutePath)).sort()) {
        await visit(join(relativePath, name));
      }
    } else if (stat.isFile()) {
      files.push({ relativePath, mode: stat.mode });
    } else {
      throw new Error(`Unsupported source file: ${portablePath}. Only regular files are copied.`);
    }
  }
  for (const entry of sourceEntries) {
    if (await statIfPresent(join(sourceRoot, entry))) await visit(entry);
  }
  return files;
}

/**
 * Prepare portable source without copying an account's hosting identity or data.
 * This does not authenticate, publish, clone Git history, or mutate the source.
 */
export async function createAccountCopy({ destination, sourceRoot = defaultSourceRoot } = {}) {
  if (typeof destination !== 'string' || !isAbsolute(destination)) {
    throw new Error('Use --destination with an absolute path to a new directory.');
  }
  const source = await realpath(sourceRoot);
  const target = resolve(destination);
  if (isWithin(source, target)) {
    throw new Error('The destination must be outside the original project directory.');
  }
  if (await statIfPresent(target)) {
    throw new Error('The destination already exists. Choose a new directory; nothing was overwritten.');
  }
  const parent = dirname(target);
  const parentStat = await statIfPresent(parent);
  if (!parentStat?.isDirectory() || parentStat.isSymbolicLink()) {
    throw new Error('The destination parent must be an existing real directory, not a symlink.');
  }
  const realParent = await realpath(parent);
  if (realParent !== parent || isWithin(source, realParent)) {
    throw new Error('Use the real absolute parent path outside the source; symlink aliases are not accepted.');
  }
  for (const required of ['package.json', 'package-lock.json', 'server.mjs', 'portal', 'scripts', 'docs']) {
    if (!(await statIfPresent(join(source, required)))) {
      throw new Error(`The source is incomplete: missing ${required}.`);
    }
  }
  // Scan before creating the target so bad source paths leave no partial copy.
  const files = await collectFiles(source);
  const included = new Set(files.map(file => file.relativePath.split(sep).join('/')));
  for (const required of [
    'package.json', 'package-lock.json', 'server.mjs', 'portal/app.js',
    'scripts/build.mjs', 'docs/ACCOUNT-HANDOFF.md',
  ]) {
    if (!included.has(required)) {
      throw new Error(`Required source was excluded: ${required}. Keep FORGE_DATA_DIR outside required source folders.`);
    }
  }
  // mkdir without recursive is the no-overwrite guard, including concurrent runs.
  await mkdir(target, { mode: 0o700 });
  try {
    for (const { relativePath, mode } of files) {
      const from = join(source, relativePath);
      const to = join(target, relativePath);
      await mkdir(dirname(to), { recursive: true });
      // O_NOFOLLOW also catches a file replaced by a symlink after the scan.
      const handle = await open(from, constants.O_RDONLY | constants.O_NOFOLLOW);
      try {
        if (!(await handle.stat()).isFile()) throw new Error(`Source changed: ${relativePath}`);
        const contents = await handle.readFile();
        if (isLearnerDataJSON(relativePath, contents.toString('utf8'))) {
          throw new Error(`Learner data appeared after source validation: ${relativePath}`);
        }
        await writeFile(to, contents, { flag: 'wx', mode: mode & 0o777 });
      } finally {
        await handle.close();
      }
    }
    await mkdir(join(target, '.openai'), { mode: 0o700 });
    await writeFile(
      join(target, '.openai', 'hosting.json'),
      `${JSON.stringify({ static: { directory: 'dist' } }, null, 2)}\n`,
      { flag: 'wx' },
    );
    await writeFile(
      join(target, 'portal', 'site-links.js'),
      "// Set hostedSiteURL only after creating a site in the intended account.\n"
        + "export const hostedSiteURL = '';\n"
        + `export const repositoryURL = ${JSON.stringify(defaultRepositoryURL)};\n`,
    );
  } catch (error) {
    // Only this invocation's newly created target can be removed here.
    await rm(target, { recursive: true, force: true });
    throw error;
  }
  return { destination: target, copiedSourceFiles: files.length, hostingProjectId: null };
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 1 && ['--help', '-h'].includes(args[0])) {
    console.log('Usage: node scripts/new-account-copy.mjs --destination /absolute/new-directory');
    console.log('Creates portable source without Git metadata, old site identity, credentials, or learner data.');
    return;
  }
  if (args.length !== 2 || args[0] !== '--destination') {
    throw new Error('Usage: node scripts/new-account-copy.mjs --destination /absolute/new-directory');
  }
  const result = await createAccountCopy({ destination: args[1] });
  console.log(`Created ${result.destination} (${result.copiedSourceFiles} source files).`);
  console.log('Open that folder in Codex under the new account and read docs/ACCOUNT-HANDOFF.md.');
  console.log('No site was created. The original project and learner data were not changed.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  await main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
