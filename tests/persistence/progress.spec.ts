import { test as base, expect, type Page } from '@playwright/test';
import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { mkdtemp, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

type Academy = { url: string; dataDir: string; restart: (nextDataDir?: string) => Promise<void> };
const test = base.extend<{ academy: Academy }>({
  academy: async ({}, use) => {
    const dataDir = await mkdtemp(path.join(tmpdir(), 'forge-persistence-'));
    let child: ChildProcessWithoutNullStreams | undefined, url = '', port = '0', activeDataDir = dataDir;
    async function start() {
      child = spawn(process.execPath, ['server.mjs'], {
        cwd: process.cwd(), env: { ...process.env, PORT: port, FORGE_DATA_DIR: activeDataDir, FORGE_PROGRESS_MODE: 'sqlite' },
        stdio: 'pipe',
      });
      let output = '';
      const started = child;
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error(`Server start timed out: ${output}`)), 10_000);
        started.once('error', error => { clearTimeout(timeout); reject(error); });
        started.once('exit', code => { clearTimeout(timeout); reject(new Error(`Server exited ${code}: ${output}`)); });
        started.stderr.on('data', chunk => { output += String(chunk); });
        started.stdout.on('data', chunk => {
          output += String(chunk);
          const match = output.match(/Forge Academy: (http:\/\/127\.0\.0\.1:(\d+))/);
          if (match) { url = match[1]; port = match[2]; clearTimeout(timeout); resolve(); }
        });
      });
    }
    async function stop() {
      if (!child || child.exitCode !== null) return;
      const stopped = child;
      await new Promise<void>(resolve => {
        const timeout = setTimeout(() => stopped.kill('SIGKILL'), 5000);
        stopped.once('exit', () => { clearTimeout(timeout); resolve(); });
        stopped.kill('SIGTERM');
      });
    }
    await start();
    try { await use({ get url() { return url; }, dataDir, restart: async nextDataDir => { await stop(); activeDataDir = nextDataDir || activeDataDir; await start(); } }); }
    finally { await stop(); await rm(dataDir, { recursive: true, force: true }); }
  },
});
const blank = () => ({ completed: [], checks: {}, notes: {}, quizzes: {}, lastLesson: null });
async function saved(page: Page) { await expect(page.locator('#persistence-bar')).toContainText('Saved locally · SQLite'); }
async function record(page: Page, url: string) {
  const response = await page.request.get(`${url}/api/learning/progress`, { headers: { 'X-Forge-Local': '1' } });
  expect(response.ok()).toBe(true); return response.json();
}

test('SQLite preserves the complete learning record across server restart and a fresh browser', async ({ page, browser, academy }) => {
  await page.goto(`${academy.url}/#/lesson/01-01`);
  await page.getByLabel('Your field notes').fill('A reproducible failure is useful evidence.');
  await page.locator('.acceptance input').first().check();
  await page.getByRole('button', { name: /C\. The returned order ID/ }).click();
  await page.getByRole('button', { name: 'Mark lesson complete' }).click();
  await saved(page);
  const first = await record(page, academy.url);
  expect(first.progress.completed).toEqual(['01-01']);
  expect(Object.values(first.progress.checks)).toEqual([true]);
  expect(first.progress.quizzes['01-01']).toBe(2);
  expect((await stat(path.join(academy.dataDir, 'progress.sqlite'))).size).toBeGreaterThan(0);
  await page.close();
  await academy.restart();
  const fresh = await browser.newContext();
  try {
    const freshPage = await fresh.newPage();
    await freshPage.goto(`${academy.url}/#/lesson/01-01`);
    await expect(freshPage.getByLabel('Your field notes')).toHaveValue('A reproducible failure is useful evidence.');
    await expect(freshPage.locator('.acceptance input').first()).toBeChecked();
    await expect(freshPage.getByRole('button', { name: 'Completed · mark incomplete' })).toBeVisible();
    await expect(freshPage.getByRole('button', { name: /C\. The returned order ID/ })).toHaveAttribute('aria-pressed', 'true');
    expect((await record(freshPage, academy.url)).databaseId).toBe(first.databaseId);
  } finally { await fresh.close(); }
});

test('rapid edits during a slow save serialize writes and persist the newest draft', async ({ page, academy }) => {
  await page.goto(`${academy.url}/#/lesson/01-01`); await saved(page);
  let release!: () => void, observed!: () => void, active = 0, peak = 0, puts = 0;
  const held = new Promise<void>(resolve => { release = resolve; });
  const intercepted = new Promise<void>(resolve => { observed = resolve; });
  await page.route('**/api/learning/progress', async route => {
    if (route.request().method() !== 'PUT') return route.continue();
    active++; peak = Math.max(peak, active); puts++;
    if (puts === 1) { observed(); await held; }
    const response = await route.fetch(); active--;
    await route.fulfill({ response });
  });
  await page.getByLabel('Your field notes').fill('First draft');
  await intercepted;
  await page.getByLabel('Your field notes').fill('Second draft');
  await page.getByLabel('Your field notes').fill('Final draft with all the important details.');
  await page.locator('.acceptance input').first().check();
  release(); await saved(page);
  const result = await record(page, academy.url);
  expect(result.progress.notes['01-01']).toBe('Final draft with all the important details.');
  expect(Object.values(result.progress.checks)).toEqual([true]);
  expect(peak).toBe(1); expect(puts).toBe(2);
});

test('failed save retains an exportable draft through reload and retries safely', async ({ page, academy }) => {
  await page.goto(`${academy.url}/#/lesson/01-01`); await saved(page);
  let fail = true;
  await page.route('**/api/learning/progress', route => route.request().method() === 'PUT' && fail
    ? route.fulfill({ status: 503, contentType: 'application/json', body: '{"error":"unavailable"}' }) : route.continue());
  await page.getByLabel('Your field notes').fill('Keep this investigation even when saving fails.');
  await expect(page.locator('#persistence-bar')).toContainText('Unsaved draft');
  expect((await record(page, academy.url)).progress.notes).toEqual({});
  page.on('dialog', dialog => dialog.accept());
  await page.reload();
  await expect(page.getByLabel('Your field notes')).toHaveValue('Keep this investigation even when saving fails.');
  await expect(page.locator('#persistence-bar')).toContainText('Unsaved draft');
  await page.getByRole('link', { name: 'Storage & backups' }).click();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export my draft' }).click();
  const stream = await (await download).createReadStream(), chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
  expect(JSON.parse(Buffer.concat(chunks).toString()).notes['01-01']).toContain('investigation');
  fail = false;
  await page.locator('#progress-storage-panel').getByRole('button', { name: 'Retry save' }).click();
  await saved(page);
  expect((await record(page, academy.url)).progress.notes['01-01']).toContain('investigation');
});

test('a committed save with a lost acknowledgement is reconciled without another write', async ({ page, academy }) => {
  await page.goto(`${academy.url}/#/lesson/01-01`); await saved(page);
  let puts = 0;
  await page.route('**/api/learning/progress', async route => {
    if (route.request().method() !== 'PUT') return route.continue();
    puts++;
    await route.fetch(); await route.abort('failed');
  });
  await page.getByLabel('Your field notes').fill('The database committed this before the response disappeared.');
  await expect(page.locator('#persistence-bar')).toContainText('Unsaved draft');
  expect((await record(page, academy.url)).progress.notes['01-01']).toContain('database committed');
  await page.locator('#persistence-bar').getByRole('button', { name: 'Retry save' }).click();
  await saved(page);
  expect(puts).toBe(1);
});

test('a copied sessionStorage tab receives a separate draft and both survive reload', async ({ page, context, academy }) => {
  await page.goto(`${academy.url}/#/lesson/01-01`); await saved(page);
  await context.route('**/api/learning/progress', route => route.request().method() === 'PUT'
    ? route.fulfill({ status: 503, contentType: 'application/json', body: '{"error":"unavailable"}' }) : route.continue());
  await page.getByLabel('Your field notes').fill('The initial unconfirmed draft.');
  await expect(page.locator('#persistence-bar')).toContainText('Unsaved draft');
  const opened = page.waitForEvent('popup');
  await page.evaluate(() => window.open('/#/lesson/01-01', '_blank'));
  const duplicate = await opened;
  try {
    await expect(duplicate.getByLabel('Your field notes')).toHaveValue('The initial unconfirmed draft.');
    await page.getByLabel('Your field notes').fill('Keep the original tab notes.');
    await duplicate.getByLabel('Your field notes').fill('Keep the copied tab notes separately.');
    page.on('dialog', dialog => dialog.accept());
    duplicate.on('dialog', dialog => dialog.accept());
    await page.reload(); await duplicate.reload();
    await expect(page.getByLabel('Your field notes')).toHaveValue('Keep the original tab notes.');
    await expect(duplicate.getByLabel('Your field notes')).toHaveValue('Keep the copied tab notes separately.');
  } finally { await duplicate.close(); }
});

test('switching databases at the same revision rejects stale writes and preserves the old draft', async ({ page, academy }) => {
  await page.goto(`${academy.url}/#/lesson/01-01`); await saved(page);
  const old = await record(page, academy.url);
  await academy.restart(path.join(academy.dataDir, 'different-database'));
  const fresh = await record(page, academy.url);
  expect(fresh.databaseId).not.toBe(old.databaseId);
  const seeded = await page.request.put(`${academy.url}/api/learning/progress`, {
    headers: { 'X-Forge-Local': '1' },
    data: { databaseId: fresh.databaseId, baseRevision: fresh.revision, progress: { ...blank(), lastLesson: '01-01' } },
  });
  expect(seeded.ok()).toBe(true);
  expect((await seeded.json()).revision).toBe(old.revision);
  await page.getByLabel('Your field notes').fill('This draft belongs to the previous database.');
  await expect(page.locator('#persistence-bar')).toContainText('Unsaved draft');
  expect((await record(page, academy.url)).progress.notes).toEqual({});
  page.on('dialog', dialog => dialog.accept());
  await page.reload();
  await saved(page);
  await page.getByRole('link', { name: 'Storage & backups' }).click();
  await expect(page.getByText('A browser draft from a different local database is preserved.', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Recover browser draft' }).click();
  await expect(page.locator('#persistence-bar')).toContainText('Conflict · draft kept');
  await expect(page.locator('main')).toContainText('This draft belongs to the previous database.');
  expect((await record(page, academy.url)).progress.notes).toEqual({});
});

test('two browsers cannot silently overwrite each other; conflicts survive reload and need an explicit choice', async ({ page, browser, academy }) => {
  await page.goto(`${academy.url}/#/lesson/01-01`); await saved(page);
  const other = await browser.newContext(), second = await other.newPage();
  try {
    await second.goto(`${academy.url}/#/lesson/01-01`); await saved(second);
    await page.getByLabel('Your field notes').fill('First browser saved this.');
    await saved(page);
    await second.getByLabel('Your field notes').fill('Second browser has a different draft.');
    await expect(second.locator('#persistence-bar')).toContainText('Conflict · draft kept');
    expect((await record(page, academy.url)).progress.notes['01-01']).toBe('First browser saved this.');
    second.on('dialog', dialog => dialog.accept());
    await second.reload();
    await expect(second.locator('#persistence-bar')).toContainText('Conflict · draft kept');
    await expect(second.getByLabel('Your field notes')).toHaveValue('Second browser has a different draft.');
    await second.getByRole('link', { name: 'Storage & backups' }).click();
    const download = second.waitForEvent('download');
    await second.getByRole('button', { name: 'Export saved database record' }).click();
    const stream = await (await download).createReadStream(), chunks: Buffer[] = [];
    for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
    expect(JSON.parse(Buffer.concat(chunks).toString()).notes['01-01']).toBe('First browser saved this.');
    await second.getByRole('button', { name: 'Replace saved record with my draft' }).click();
    await saved(second);
    expect((await record(page, academy.url)).progress.notes['01-01']).toBe('Second browser has a different draft.');
    await page.getByLabel('Your field notes').fill('A later stale edit.');
    await expect(page.locator('#persistence-bar')).toContainText('Conflict · draft kept');
    await page.getByRole('link', { name: 'Storage & backups' }).click();
    page.on('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: 'Reload saved record' }).click();
    await saved(page);
    await page.goto(`${academy.url}/#/lesson/01-01`);
    await expect(page.getByLabel('Your field notes')).toHaveValue('Second browser has a different draft.');
  } finally { await other.close(); }
});

test('a legacy browser record migrates only into a new empty database', async ({ page, browser, academy }) => {
  const legacy = { ...blank(), notes: { '01-01': 'Previous browser learning record' }, completed: ['01-01'] };
  await page.addInitScript(value => localStorage.setItem('forge-academy-v1', JSON.stringify(value)), legacy);
  await page.goto(`${academy.url}/#/progress`); await saved(page);
  expect((await record(page, academy.url)).progress).toEqual(legacy);
  const other = await browser.newContext();
  try {
    await other.addInitScript(() => localStorage.setItem('forge-academy-v1', JSON.stringify({
      completed: [], notes: { '01-01': 'Another browser has older notes' }, checks: {}, quizzes: {}, lastLesson: null,
    })));
    const second = await other.newPage(); await second.goto(`${academy.url}/#/progress`); await saved(second);
    await expect(second.getByText('Your existing database was kept.', { exact: false })).toBeVisible();
    expect((await record(second, academy.url)).progress).toEqual(legacy);
    await second.getByRole('button', { name: 'Review previous browser record' }).click();
    await expect(second.locator('#persistence-bar')).toContainText('Conflict · draft kept');
    expect((await record(second, academy.url)).progress).toEqual(legacy);
  } finally { await other.close(); }
});

test('import and reset never announce database success when persistence fails', async ({ page, academy }) => {
  await page.goto(`${academy.url}/#/progress`); await saved(page);
  page.on('dialog', dialog => dialog.accept());
  await page.route('**/api/learning/progress', route => route.request().method() === 'PUT'
    ? route.fulfill({ status: 503, contentType: 'application/json', body: '{"error":"unavailable"}' }) : route.continue());
  await page.locator('#progress-file').setInputFiles({
    name: 'progress.json', mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify({ ...blank(), completed: ['01-01'], notes: { '01-01': 'Import me safely' } })),
  });
  await expect(page.locator('#toast')).toContainText('Imported as a draft');
  await expect(page.locator('#persistence-bar')).toContainText('Unsaved draft');
  expect((await record(page, academy.url)).progress).toEqual(blank());
  await page.getByRole('button', { name: 'Reset progress', exact: true }).click();
  await expect(page.locator('#toast')).toContainText('Reset is a draft only');
  await expect(page.locator('#persistence-bar')).toContainText('Unsaved draft');
});

test('an edit made after confirming reload is kept when the delayed read arrives', async ({ page, academy }) => {
  await page.goto(`${academy.url}/#/lesson/01-01`); await saved(page);
  let blockRead = false, release!: () => void, readStarted!: () => void;
  const held = new Promise<void>(resolve => { release = resolve; });
  const observed = new Promise<void>(resolve => { readStarted = resolve; });
  await page.route('**/api/learning/progress', async route => {
    if (route.request().method() === 'PUT') return route.fulfill({ status: 503, contentType: 'application/json', body: '{"error":"unavailable"}' });
    if (blockRead) { blockRead = false; readStarted(); await held; }
    return route.continue();
  });
  await page.getByLabel('Your field notes').fill('The old draft may be discarded.');
  await expect(page.locator('#persistence-bar')).toContainText('Unsaved draft');
  await page.getByRole('link', { name: 'Storage & backups' }).click();
  page.on('dialog', dialog => dialog.accept());
  blockRead = true;
  await page.getByRole('button', { name: 'Reload saved record' }).click();
  await observed;
  await page.evaluate(() => { location.hash = '#/lesson/01-01'; });
  await page.getByLabel('Your field notes').fill('This new edit happened after the discard confirmation.');
  release();
  await expect(page.locator('#toast')).toContainText('Your draft has been kept');
  await expect(page.getByLabel('Your field notes')).toHaveValue('This new edit happened after the discard confirmation.');
  expect((await record(page, academy.url)).progress.notes).toEqual({});
});

test('unavailable startup keeps edits disabled and retry loads the original database', async ({ page, academy }) => {
  let fail = true;
  await page.route('**/api/learning/progress', route => fail
    ? route.fulfill({ status: 503, contentType: 'application/json', body: '{"error":"unavailable"}' }) : route.continue());
  await page.goto(`${academy.url}/#/lesson/01-01`);
  await expect(page.getByRole('heading', { name: 'Your database needs attention.' })).toBeVisible();
  await expect(page.getByLabel('Your field notes')).toHaveCount(0);
  fail = false;
  await page.locator('main').getByRole('button', { name: 'Retry loading' }).click();
  await expect(page.getByLabel('Your field notes')).toBeVisible(); await saved(page);
});

test('static mode never calls the progress API and preserves its independent browser record', async ({ page, academy }) => {
  let calls = 0;
  page.on('request', request => { if (request.url().endsWith('/api/learning/progress')) calls++; });
  await page.route('**/runtime.js', route => route.fulfill({ contentType: 'application/javascript', body: "export const runtimeMode = 'static';" }));
  await page.goto(`${academy.url}/#/lesson/01-01`);
  await expect(page.locator('#persistence-bar')).toContainText('Saved in this browser');
  await page.getByLabel('Your field notes').fill('This belongs to the hosted browser record.');
  await page.reload();
  await expect(page.getByLabel('Your field notes')).toHaveValue('This belongs to the hosted browser record.');
  await page.goto(`${academy.url}/#/start`);
  await expect(page.getByRole('link', { name: 'OpenAI-hosted academy' })).toHaveAttribute('href', `${academy.url}/`);
  expect(calls).toBe(0);
  await expect(stat(path.join(academy.dataDir, 'progress.sqlite'))).rejects.toThrow();
});

test('storage details and long database paths remain usable on a narrow screen', async ({ page, academy }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${academy.url}/#/progress`); await saved(page);
  await expect(page.getByRole('heading', { name: 'Your progress storage' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('an incompatible import cannot partially replace the committed learner record', async ({ page, academy }) => {
  await page.goto(`${academy.url}/#/lesson/01-01`);
  await page.getByLabel('Your field notes').fill('Keep this saved research.');
  await saved(page);
  const before = await record(page, academy.url);
  await page.goto(`${academy.url}/#/progress`);
  page.on('dialog', dialog => dialog.accept());
  for (const invalid of [
    { ...blank(), notes: { 'future-lesson': 'Do not silently drop this.' } },
    { ...blank(), format: 'forge-academy-v99' },
    { ...blank(), checks: { 'missing/check/0': true } },
    { ...blank(), quizzes: { '01-01': 999 } },
  ]) {
    await page.locator('#progress-file').setInputFiles({
      name: 'incompatible.json', mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(invalid)),
    });
    await expect(page.getByRole('status')).toContainText('not a valid Forge progress export');
    expect(await record(page, academy.url)).toEqual(before);
  }
});

test('beginner progress is saved alongside original lesson records through a server restart', async ({ page, academy }) => {
  await page.goto(`${academy.url}/#/lesson/01-01`);
  await page.getByLabel('Your field notes').fill('Keep my original lesson notes.');
  await page.getByRole('button', { name: 'Mark lesson complete' }).click();
  await saved(page);
  await page.goto(`${academy.url}/#/lesson/00-05`);
  await page.getByLabel('Your field notes').fill('A correct negative test passes.');
  await page.getByRole('button', { name: 'Mark lesson complete' }).click();
  await page.locator('[data-quiz="0"]').click();
  await page.locator('[data-check]').first().check();
  await saved(page);
  const before = await record(page, academy.url);
  await academy.restart();
  await page.reload();
  await saved(page);
  expect(await record(page, academy.url)).toEqual(before);
  await expect(page.getByLabel('Your field notes')).toHaveValue('A correct negative test passes.');
  await expect(page.getByRole('button', { name: 'Completed · mark incomplete' })).toBeVisible();
  await page.goto(`${academy.url}/#/lesson/01-01`);
  await expect(page.getByLabel('Your field notes')).toHaveValue('Keep my original lesson notes.');
  await expect(page.getByRole('button', { name: 'Completed · mark incomplete' })).toBeVisible();
});
