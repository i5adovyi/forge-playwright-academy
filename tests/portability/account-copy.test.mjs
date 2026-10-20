import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, realpath, rm, symlink, writeFile, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { createAccountCopy } from '../../scripts/new-account-copy.mjs';

async function fixture(t) {
  const base = await realpath(await mkdtemp(join(tmpdir(), 'forge-account-copy-')));
  t.after(() => rm(base, { recursive: true, force: true }));
  const source = join(base, 'source');
  await mkdir(source);
  async function put(path, contents = 'source fixture\n') {
    await mkdir(dirname(join(source, path)), { recursive: true });
    await writeFile(join(source, path), contents);
  }
  for (const path of [
    'package.json', 'package-lock.json', 'server.mjs', 'portal/app.js',
    'portal/site-links.js', 'scripts/build.mjs', 'docs/ACCOUNT-HANDOFF.md',
    '.github/workflows/playwright.yml', '.gitignore', 'AGENTS.md',
    'tests/portability/example.test.mjs', 'local-data/store.mjs',
    'exercises/example.spec.ts', 'solutions/example.spec.ts',
  ]) await put(path);
  await put('portal/site-links.js', "export const hostedSiteURL = 'https://old.example.test';\n");
  await put('.openai/hosting.json', '{"project_id":"old-private-site","static":{"directory":"dist"}}');
  return { base, source, target: join(base, 'new-account'), put };
}

async function absent(path) {
  await assert.rejects(access(path), { code: 'ENOENT' });
}

test('portable copy includes working sources and fresh identity without modifying the original', async (t) => {
  const f = await fixture(t);
  const original = await readFile(join(f.source, '.openai/hosting.json'), 'utf8');
  const result = await createAccountCopy({ sourceRoot: f.source, destination: f.target });
  assert.equal(result.destination, f.target);
  assert.ok(result.copiedSourceFiles >= 14);
  assert.equal(result.hostingProjectId, null);
  for (const path of [
    'server.mjs', '.github/workflows/playwright.yml', '.gitignore', 'AGENTS.md',
    'local-data/store.mjs', 'exercises/example.spec.ts', 'solutions/example.spec.ts',
    'tests/portability/example.test.mjs', 'docs/ACCOUNT-HANDOFF.md',
  ]) await access(join(f.target, path));
  assert.deepEqual(JSON.parse(await readFile(join(f.target, '.openai/hosting.json'), 'utf8')), {
    static: { directory: 'dist' },
  });
  const links = await readFile(join(f.target, 'portal/site-links.js'), 'utf8');
  assert.match(links, /hostedSiteURL = ''/);
  assert.doesNotMatch(links, /old\.example\.test/);
  assert.match(links, /github\.com\/i5adovyi\/forge-playwright-academy/);
  assert.equal(await readFile(join(f.source, '.openai/hosting.json'), 'utf8'), original);
});

test('copy excludes runtime data, credentials, generated downloads, and Git metadata at nested paths', async (t) => {
  const f = await fixture(t);
  const omitted = [
    '.git/config', '.openai/deploy-token', '.env', 'node_modules/secret.js',
    'portal/downloads/forge-academy.zip', 'portal/docs/generated.md',
    'dist/app.js', 'quality-results/trace.zip', 'test-results/result.json',
    'playwright-report/index.html', 'portal/.env.local', 'local-data/progress.sqlite',
    'local-data/progress.sqlite-wal', 'local-data/progress.sqlite-shm',
    'state/.auth/session.json', 'workplace/recovery/node_modules/secret.js',
    'docs/forge-progress-backup.json',
  ];
  for (const path of omitted) await f.put(path, 'private user data\n');
  await createAccountCopy({ sourceRoot: f.source, destination: f.target });
  for (const path of omitted) await absent(join(f.target, path));
});

test('an existing destination is never overwritten, even if empty', async (t) => {
  const f = await fixture(t);
  await mkdir(f.target);
  await writeFile(join(f.target, 'keep.txt'), 'keep me');
  await assert.rejects(createAccountCopy({ sourceRoot: f.source, destination: f.target }), /already exists/);
  assert.equal(await readFile(join(f.target, 'keep.txt'), 'utf8'), 'keep me');
  await absent(join(f.target, 'server.mjs'));
});

test('rejects relative and source-contained destinations before writing', async (t) => {
  const f = await fixture(t);
  await assert.rejects(createAccountCopy({ sourceRoot: f.source, destination: 'relative-copy' }), /absolute path/);
  await assert.rejects(
    createAccountCopy({ sourceRoot: f.source, destination: join(f.source, 'new-copy') }),
    /outside the original/,
  );
  await absent(join(f.source, 'new-copy'));
});

test('rejects missing parents and destination symlinks without touching their targets', async (t) => {
  const f = await fixture(t);
  await assert.rejects(
    createAccountCopy({ sourceRoot: f.source, destination: join(f.base, 'missing', 'copy') }),
    /existing real directory/,
  );
  await symlink(f.source, f.target, 'dir');
  await assert.rejects(createAccountCopy({ sourceRoot: f.source, destination: f.target }), /already exists/);
  await access(join(f.source, 'server.mjs'));
});

test('rejects source symlinks before making a destination', async (t) => {
  const f = await fixture(t);
  const secret = join(f.base, 'private.txt');
  await writeFile(secret, 'must not escape');
  await symlink(secret, join(f.source, 'docs', 'linked.txt'));
  await assert.rejects(createAccountCopy({ sourceRoot: f.source, destination: f.target }), /symlink/i);
  await absent(f.target);
});

test('rejects a symlink parent that could disguise a destination inside the source', async (t) => {
  const f = await fixture(t);
  const alias = join(f.base, 'source-alias');
  await symlink(f.source, alias, 'dir');
  await assert.rejects(
    createAccountCopy({ sourceRoot: f.source, destination: join(alias, 'copy') }),
    /real directory|symlink aliases/,
  );
  await absent(join(f.source, 'copy'));
});

test('incomplete source fails without leaving a partially usable project', async (t) => {
  const f = await fixture(t);
  await rm(join(f.source, 'package-lock.json'));
  await assert.rejects(createAccountCopy({ sourceRoot: f.source, destination: f.target }), /missing package-lock/);
  await absent(f.target);
});

test('omits learner exports even under an unrelated JSON filename', async (t) => {
  const f = await fixture(t);
  const data = JSON.stringify({ progress: { completed: ['01-01'], notes: { '01-01': 'private' }, checks: {} } });
  await f.put('docs/my-record.json', data);
  await f.put('docs/my-record.JSON', data);
  await createAccountCopy({ sourceRoot: f.source, destination: f.target });
  await absent(join(f.target, 'docs/my-record.json'));
  await absent(join(f.target, 'docs/my-record.JSON'));
});

test('omits a configured data directory even when placed inside a source directory', async (t) => {
  const f = await fixture(t);
  const previous = process.env.FORGE_DATA_DIR;
  process.env.FORGE_DATA_DIR = 'docs/my-local-state';
  t.after(() => {
    if (previous === undefined) delete process.env.FORGE_DATA_DIR;
    else process.env.FORGE_DATA_DIR = previous;
  });
  await f.put('docs/my-local-state/unusual-data.txt', 'personal learner state');
  await createAccountCopy({ sourceRoot: f.source, destination: f.target });
  await absent(join(f.target, 'docs/my-local-state'));
  await access(join(f.target, 'docs/ACCOUNT-HANDOFF.md'));
});

test('does not report an unusable copy when the data directory overlaps required source', async (t) => {
  const f = await fixture(t);
  const previous = process.env.FORGE_DATA_DIR;
  process.env.FORGE_DATA_DIR = '.';
  t.after(() => {
    if (previous === undefined) delete process.env.FORGE_DATA_DIR;
    else process.env.FORGE_DATA_DIR = previous;
  });
  await assert.rejects(
    createAccountCopy({ sourceRoot: f.source, destination: f.target }),
    /Required source was excluded/,
  );
  await absent(f.target);
});
