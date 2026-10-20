import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { Worker } from 'node:worker_threads';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { DatabaseSync } from 'node:sqlite';
import { openProgressStore, emptyProgress, validateProgress, decodeExport } from './store.mjs';
import { lessons } from '../portal/content/curriculum.js';

const run = promisify(execFile);
const cli = new URL('./cli.mjs', import.meta.url);
const progress = note => ({
  completed: ['01-01'],
  checks: { '01-01/01-01-a/0': true, '01-01/01-01-a/1': false },
  notes: { '01-01': note }, quizzes: { '01-01': 2 }, lastLesson: '01-01',
});
async function directory(t) {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'forge-progress-store-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  return dir;
}

test('a saved learner record and database identity survive a real connection restart', async t => {
  const dataDirectory = await directory(t);
  const store = openProgressStore({ dataDirectory });
  const initial = store.read();
  assert.equal(initial.revision, 0);
  assert.equal(initial.updatedAt, null);
  assert.deepEqual(initial.progress, emptyProgress());
  const written = store.write({ databaseId: store.databaseId, baseRevision: 0, progress: progress('Investigate before retrying — ✓') });
  assert.equal(written.revision, 1);
  assert.ok(Number.isFinite(Date.parse(written.updatedAt)));
  store.close();
  const restarted = openProgressStore({ dataDirectory });
  t.after(() => restarted.close());
  assert.deepEqual(restarted.read(), written);
  assert.equal(restarted.databaseId, initial.databaseId);
});

test('two simultaneous connections cannot overwrite the same revision', async t => {
  const dataDirectory = await directory(t);
  const initial = openProgressStore({ dataDirectory });
  const databaseId = initial.databaseId;
  initial.close();
  const barrier = new SharedArrayBuffer(4);
  const ready = new Int32Array(barrier);
  const source = `
    import { workerData, parentPort } from 'node:worker_threads';
    import { openProgressStore } from ${JSON.stringify(new URL('./store.mjs', import.meta.url).href)};
    const store = openProgressStore({ dataDirectory: workerData.dataDirectory });
    const ready = new Int32Array(workerData.barrier);
    parentPort.postMessage({ ready: true });
    Atomics.wait(ready, 0, 0);
    const result = store.write({databaseId: store.databaseId, baseRevision: 0, progress: workerData.progress});
    store.close();
    parentPort.postMessage({ result });
  `;
  const launch = value => {
    const worker = new Worker(new URL(`data:text/javascript,${encodeURIComponent(source)}`), { workerData: { dataDirectory, barrier, progress: progress(value) } });
    let notifyReady;
    const isReady = new Promise(resolve => { notifyReady = resolve; });
    const result = new Promise((resolve, reject) => {
      worker.on('error', reject);
      worker.on('message', message => message.ready ? notifyReady() : resolve(message.result));
      worker.on('exit', code => { if (code) reject(new Error(`Worker exited ${code}`)); });
    });
    t.after(() => worker.terminate());
    return { isReady, result };
  };
  const first = launch('first writer');
  const second = launch('second writer');
  await Promise.all([first.isReady, second.isReady]);
  Atomics.store(ready, 0, 1);
  Atomics.notify(ready, 0);
  const results = await Promise.all([first.result, second.result]);
  assert.equal(results.filter(result => result.conflict).length, 1);
  assert.equal(results.filter(result => !result.conflict).length, 1);
  assert.ok(results.every(result => result.revision === 1 && result.databaseId === databaseId));
  assert.deepEqual(results[0].progress, results[1].progress);
  const final = openProgressStore({ dataDirectory });
  t.after(() => final.close());
  assert.deepEqual(final.read().progress, results[0].progress);
});

test('invalid records never change the saved snapshot or revision', async t => {
  const dataDirectory = await directory(t);
  const store = openProgressStore({ dataDirectory });
  t.after(() => store.close());
  const saved = store.write({ databaseId: store.databaseId, baseRevision: 0, progress: progress('must survive rejection') });
  const invalid = [
    { ...progress('x'), unknown: true },
    { ...progress('x'), completed: ['99-99'] },
    { ...progress('x'), completed: ['01-01', '01-01'] },
    { ...progress('x'), checks: { '01-01/01-01-a/99': true } },
    { ...progress('x'), checks: { '01-01/01-01-a/0': 'true' } },
    { ...progress('x'), notes: { '01-01': 'x'.repeat(50001) } },
    { ...progress('x'), notes: { '99-99': 'x' } },
    { ...progress('x'), quizzes: { '01-01': 99 } },
    { ...progress('x'), lastLesson: '99-99' },
    { ...progress('x'), notes: JSON.parse('{"__proto__":"pollution"}') },
    { ...progress('x'), quizzes: [] },
  ];
  for (const value of invalid) {
    assert.throws(() => store.write({ databaseId: store.databaseId, baseRevision: 1, progress: value }), { code: 'INVALID_PROGRESS' });
    assert.deepEqual(store.read(), saved);
  }
  assert.throws(() => store.write({ databaseId: store.databaseId, baseRevision: 1, progress: progress('x'), extra: 1 }), { code: 'INVALID_PROGRESS' });
  assert.throws(() => store.write({ databaseId: store.databaseId, baseRevision: -1, progress: progress('x') }), { code: 'INVALID_PROGRESS' });
  assert.deepEqual(store.read(), saved);
});

test('exports are portable, import is explicit, and existing backups are never overwritten', async t => {
  const source = await directory(t);
  const destination = await directory(t);
  const sourceStore = openProgressStore({ dataDirectory: source });
  sourceStore.write({ databaseId: sourceStore.databaseId, baseRevision: 0, progress: progress('Portable private field notes') });
  const sourceId = sourceStore.databaseId;
  sourceStore.close();
  const backup = path.join(source, 'backup.json');
  const runCLI = (dataDirectory, args) => run(process.execPath, [cli.pathname, ...args], { env: { ...process.env, FORGE_DATA_DIR: dataDirectory } });
  await runCLI(source, ['export', backup]);
  const original = await readFile(backup, 'utf8');
  assert.deepEqual(decodeExport(JSON.parse(original)), progress('Portable private field notes'));
  await assert.rejects(runCLI(source, ['export', backup]), error => /already exists/.test(error.stderr));
  assert.equal(await readFile(backup, 'utf8'), original);
  await runCLI(destination, ['import', backup, '--expected-revision', '0']);
  const imported = openProgressStore({ dataDirectory: destination });
  const restored = imported.read();
  imported.close();
  assert.deepEqual(restored.progress, progress('Portable private field notes'));
  assert.notEqual(restored.databaseId, sourceId);
  await assert.rejects(runCLI(destination, ['import', backup, '--expected-revision', '0']), error => /current revision is 1/.test(error.stderr));
  const status = JSON.parse((await runCLI(destination, ['status'])).stdout);
  assert.equal(status.revision, 1);
  assert.ok(!JSON.stringify(status).includes('Portable private field notes'));
});

test('future schema versions and malformed database files fail without being reset', async t => {
  const future = await directory(t);
  const db = new DatabaseSync(path.join(future, 'progress.sqlite'));
  db.exec("PRAGMA user_version = 99; CREATE TABLE recovery_evidence(value TEXT); INSERT INTO recovery_evidence VALUES ('keep me');");
  db.close();
  const originalBytes = await readFile(path.join(future, 'progress.sqlite'));
  assert.throws(() => openProgressStore({ dataDirectory: future }), /Unsupported progress database version 99/);
  assert.deepEqual(await readFile(path.join(future, 'progress.sqlite')), originalBytes, 'Reject future schema before changing journal mode or database bytes.');
  const verify = new DatabaseSync(path.join(future, 'progress.sqlite'));
  assert.equal(verify.prepare('SELECT value FROM recovery_evidence').get().value, 'keep me');
  verify.close();
  const broken = await directory(t);
  const brokenPath = path.join(broken, 'progress.sqlite');
  await writeFile(brokenPath, 'not a database');
  assert.throws(() => openProgressStore({ dataDirectory: broken }));
  assert.equal(await readFile(brokenPath, 'utf8'), 'not a database');
});

test('strict import rejects unknown metadata and invalid quiz answers instead of silently dropping data', () => {
  assert.throws(() => decodeExport({ ...progress('x'), surprise: true }), { code: 'INVALID_PROGRESS' });
  assert.throws(() => decodeExport({ ...progress('x'), format: 'other-app' }), { code: 'INVALID_PROGRESS' });
  assert.throws(() => validateProgress({ ...progress('x'), quizzes: { '01-01': -1 } }), { code: 'INVALID_PROGRESS' });
});

test('the aggregate limit counts UTF-8 bytes as well as individual note characters', () => {
  const notes = Object.fromEntries(lessons.slice(0, 21).map(lesson => [lesson.id, '😀'.repeat(25000)]));
  assert.ok(Object.values(notes).every(note => note.length === 50000));
  assert.throws(() => validateProgress({ ...emptyProgress(), notes }), { code: 'INVALID_PROGRESS' });
  delete notes[lessons[20].id];
  assert.deepEqual(validateProgress({ ...emptyProgress(), notes }).notes, notes);
});

test('a different database at the same revision rejects the old database identity before mutation', async t => {
  const firstDirectory = await directory(t);
  const secondDirectory = await directory(t);
  const first = openProgressStore({ dataDirectory: firstDirectory });
  const second = openProgressStore({ dataDirectory: secondDirectory });
  t.after(() => { first.close(); second.close(); });
  const oldRecord = first.write({ databaseId: first.databaseId, baseRevision: 0, progress: progress('old database') });
  const newRecord = second.write({ databaseId: second.databaseId, baseRevision: 0, progress: progress('new database must survive') });
  assert.equal(oldRecord.revision, newRecord.revision);
  assert.notEqual(oldRecord.databaseId, newRecord.databaseId);
  const rejected = second.write({ databaseId: oldRecord.databaseId, baseRevision: oldRecord.revision, progress: progress('stale browser edit') });
  assert.equal(rejected.conflict, true);
  assert.deepEqual(second.read(), newRecord);
});
