import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, readdir, realpath, rm, writeFile, copyFile, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const sourceRoot = fileURLToPath(new URL('../../', import.meta.url));
const personalMarker = 'PRIVATE-LEARNER-DATA-7f9d1be8';
const learnerExport = JSON.stringify({
  completed: ['01-01'], notes: { '01-01': personalMarker },
  checks: {}, quizzes: {}, lastLesson: '01-01',
});
const essentialFiles = [
  'portal/index.html', 'portal/app.js', 'portal/content/curriculum.js',
  'portal/progress-store.js', 'portal/site-links.js',
  'local-data/store.mjs', 'local-data/http.mjs', 'local-data/cli.mjs',
  'scripts/build.mjs', 'scripts/source-manifest.mjs', 'scripts/new-account-copy.mjs',
  'docs/ACCOUNT-HANDOFF.md', 'docs/LOCAL-DATA.md',
  'server.mjs', 'package.json', 'package-lock.json', 'AGENTS.md', '.nvmrc',
  '.github/workflows/playwright.yml', 'playwright.persistence.config.ts',
  'exercises/example.spec.ts', 'solutions/example.spec.ts',
];

async function fixture(t) {
  const base = await realpath(await mkdtemp(join(tmpdir(), 'forge-artifact-test-')));
  t.after(() => rm(base, { recursive: true, force: true }));
  const root = join(base, 'source');
  await mkdir(root);
  async function put(path, contents) {
    await mkdir(dirname(join(root, path)), { recursive: true });
    await writeFile(join(root, path), contents);
  }
  for (const path of essentialFiles) {
    await put(path, path.endsWith('.json') ? '{"name":"public-source"}\n' : `Public source: ${path}\n`);
  }
  await put('portal/runtime.js', "export const runtimeMode = 'local';\n");
  // Execute the real build implementation. The small input fixture keeps this
  // test independent of other tests writing temporary files in the checkout.
  for (const script of ['build.mjs', 'source-manifest.mjs']) {
    await copyFile(join(sourceRoot, 'scripts', script), join(root, 'scripts', script));
  }
  return { base, root, put };
}

async function inspectTree(root) {
  const names = [];
  async function visit(directory, prefix = '') {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
      const absolute = join(directory, entry.name);
      assert.equal(entry.isSymbolicLink(), false, `Unexpected symlink ${relative}`);
      if (entry.isDirectory()) await visit(absolute, relative);
      else {
        names.push(relative);
        if (!relative.endsWith('.zip')) {
          const data = await readFile(absolute);
          assert.equal(data.includes(Buffer.from(personalMarker)), false, `Personal data leaked into ${relative}`);
        }
      }
    }
  }
  await visit(root);
  return names;
}

for (const { configuredDirectory, useAlias } of [
  { configuredDirectory: 'portal/my-study-cache', useAlias: false },
  { configuredDirectory: 'docs/my-study-cache', useAlias: false },
  { configuredDirectory: 'docs/my-study-cache', useAlias: true },
]) {
  test(`real build keeps source but excludes learner data from all artifacts (${configuredDirectory}${useAlias ? ' via symlink alias' : ''})`, async (t) => {
    const f = await fixture(t);
    const secretFiles = [
      'portal/private-record.json', 'portal/private-record.JSON',
      'docs/unexpected-name.json', 'docs/UPPERCASE.JSON',
      'portal/progress.sqlite', 'portal/progress.sqlite-wal',
      'docs/learner.sqlite-shm', 'local-data/personal.db',
      'local-data/personal.db-journal', 'docs/forge-learning-progress.json',
      'portal/.env', 'docs/.env.local', 'state/.auth/session.json',
      'portal/backups/unusual-name.txt', 'docs/progress-backups/record.txt',
      '.openai/hosting.json', '.git/config',
      `${configuredDirectory}/ordinary-looking.txt`,
    ];
    for (const path of secretFiles) {
      const contents = /(?:private-record|unexpected-name|UPPERCASE)/.test(path)
        ? learnerExport : personalMarker;
      await f.put(path, contents);
    }
    let configuredPath = join(f.root, configuredDirectory);
    if (useAlias) {
      const alias = join(f.base, 'selected-data-directory');
      await symlink(configuredPath, alias, 'dir');
      configuredPath = alias;
    }
    execFileSync(process.execPath, ['scripts/build.mjs'], {
      cwd: f.root,
      env: { ...process.env, FORGE_DATA_DIR: configuredPath },
      encoding: 'utf8',
      timeout: 30000,
    });

    const sourceArchive = join(f.root, 'dist/downloads/forge-academy.zip');
    const manualArchive = join(f.root, 'dist/downloads/forge-manuals.zip');
    const extractedSource = join(f.base, 'extracted-source');
    const extractedManuals = join(f.base, 'extracted-manuals');
    execFileSync('unzip', ['-q', sourceArchive, '-d', extractedSource]);
    execFileSync('unzip', ['-q', manualArchive, '-d', extractedManuals]);
    const sourceNames = await inspectTree(extractedSource);
    const manualNames = await inspectTree(extractedManuals);
    const staticNames = await inspectTree(join(f.root, 'dist'));
    const localManualNames = await inspectTree(join(f.root, 'portal/docs'));

    for (const path of essentialFiles) assert.ok(sourceNames.includes(path), `Missing runnable source ${path}`);
    assert.ok(manualNames.includes('docs/ACCOUNT-HANDOFF.md'));
    assert.ok(manualNames.includes('docs/LOCAL-DATA.md'));
    assert.ok(staticNames.includes('index.html'));
    assert.ok(staticNames.includes('content/curriculum.js'));
    assert.ok(staticNames.includes('progress-store.js'));
    assert.ok(staticNames.includes('docs/ACCOUNT-HANDOFF.md'));
    assert.ok(localManualNames.includes('ACCOUNT-HANDOFF.md'));
    assert.equal(
      await readFile(join(f.root, 'dist/runtime.js'), 'utf8'),
      "export const runtimeMode = 'static';\n",
    );
    assert.equal(sourceNames.some(path => path.startsWith('portal/downloads/')), false);
    assert.equal(sourceNames.some(path => path.startsWith('portal/docs/')), false);
    assert.equal(sourceNames.some(path => path.startsWith('.openai/')), false);
    assert.equal(sourceNames.some(path => path.startsWith('.git/')), false);

    // Source build must not erase the learner's files to achieve clean output.
    assert.equal(await readFile(join(f.root, 'portal/private-record.JSON'), 'utf8'), learnerExport);
    assert.equal(await readFile(join(f.root, configuredDirectory, 'ordinary-looking.txt'), 'utf8'), personalMarker);
  });
}
