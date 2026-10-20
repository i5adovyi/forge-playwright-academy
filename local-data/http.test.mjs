import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, access, symlink, writeFile, readFile } from 'node:fs/promises';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';
import { emptyProgress, MAX_BODY_BYTES } from './store.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const header = { 'X-Forge-Local': '1' };
const sample = { ...emptyProgress(), completed: ['04-07'], notes: { '04-07': 'The first response was lost; keep the key.' }, lastLesson: '04-07' };
async function temporary(t) {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'forge-progress-http-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  return directory;
}
async function start(t, dataDirectory, mode = 'sqlite') {
  const child = spawn(process.execPath, ['server.mjs'], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, PORT: '0', FORGE_DATA_DIR: dataDirectory, FORGE_PROGRESS_MODE: mode } });
  let stderr = '';
  child.stderr.on('data', chunk => { stderr += chunk; });
  const url = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Server did not start: ${stderr}`)), 10000);
    child.once('exit', code => { clearTimeout(timer); reject(new Error(`Server exited ${code}: ${stderr}`)); });
    child.stdout.on('data', chunk => {
      const match = chunk.toString().match(/Forge Academy: (http:\/\/127\.0\.0\.1:\d+)/);
      if (match) { clearTimeout(timer); resolve(match[1]); }
    });
  });
  let stopped = false;
  async function stop() {
    if (stopped) return;
    stopped = true;
    const exited = once(child, 'exit');
    child.kill('SIGTERM');
    await exited;
  }
  t.after(stop);
  return { url, stop, endpoint: `${url}/api/learning/progress` };
}
const put = (endpoint, payload, extra = {}) => fetch(endpoint, { method: 'PUT', headers: { ...header, 'Content-Type': 'application/json', ...extra }, body: JSON.stringify(payload) });
const foreignHostRequest = (endpoint, payload) => new Promise((resolve, reject) => {
  // fetch controls Host itself, so use node:http to exercise a rebinding-shaped request.
  const req = http.request(endpoint, { method: 'PUT', headers: { ...header, 'Content-Type': 'application/json', Host: `evil.example:${new URL(endpoint).port}` } }, res => {
    res.resume();
    res.on('end', () => resolve({ status: res.statusCode, headers: { get: key => res.headers[key] ?? null } }));
  });
  req.on('error', reject);
  req.end(JSON.stringify(payload));
});

test('HTTP saves survive process restart; stale revisions return current evidence without overwriting it', async t => {
  const dataDirectory = await temporary(t);
  const first = await start(t, dataDirectory);
  const initial = await (await fetch(first.endpoint, { headers: header })).json();
  assert.equal(initial.mode, 'sqlite');
  const response = await put(first.endpoint, { databaseId: initial.databaseId, baseRevision: 0, progress: sample });
  assert.equal(response.status, 200);
  const saved = await response.json();
  await first.stop();
  const restarted = await start(t, dataDirectory);
  assert.deepEqual(await (await fetch(restarted.endpoint, { headers: header })).json(), saved);
  const conflict = await put(restarted.endpoint, { databaseId: initial.databaseId, baseRevision: 0, progress: emptyProgress() });
  assert.equal(conflict.status, 409);
  const collision = await conflict.json();
  assert.equal(collision.error.code, 'PROGRESS_CONFLICT');
  assert.equal(collision.databaseId, initial.databaseId);
  assert.deepEqual(collision.progress, sample);
  assert.equal(collision.revision, 1);
  assert.equal(conflict.headers.get('access-control-allow-origin'), null);
  // The separate training shop still has ephemeral, session-scoped state.
  const cart = await fetch(`${restarted.url}/api/cart`, { headers: { 'X-Lab-Session': 'persistence-test' } });
  assert.deepEqual((await cart.json()).items, []);
});

test('cross-origin, rebinding, header-free, invalid-body and oversized requests do not change progress', async t => {
  const dataDirectory = await temporary(t);
  const server = await start(t, dataDirectory);
  const deniedRead = await fetch(server.endpoint);
  assert.equal(deniedRead.status, 403);
  await assert.rejects(access(path.join(dataDirectory, 'progress.sqlite')));
  const malformed = await put(server.endpoint, { databaseId: '00000000-0000-0000-0000-000000000000', baseRevision: 0, progress: { ...sample, extra: 'bad' } });
  assert.equal(malformed.status, 400);
  await assert.rejects(access(path.join(dataDirectory, 'progress.sqlite')));
  const { databaseId } = await (await fetch(server.endpoint, { headers: header })).json();
  const saved = await (await put(server.endpoint, { databaseId, baseRevision: 0, progress: sample })).json();
  const attempts = [
    { request: () => put(server.endpoint, { databaseId, baseRevision: 1, progress: emptyProgress() }, { Origin: 'https://evil.example' }), status: 403 },
    { request: () => foreignHostRequest(server.endpoint, { databaseId, baseRevision: 1, progress: emptyProgress() }), status: 403 },
    { request: () => put(server.endpoint, { databaseId, baseRevision: 1, progress: emptyProgress() }, { Origin: 'null' }), status: 403 },
    { request: () => put(server.endpoint, { databaseId, baseRevision: 1, progress: emptyProgress() }, { 'Content-Type': 'text/plain' }), status: 415 },
    { request: () => put(server.endpoint, { databaseId, baseRevision: 1, progress: { ...sample, quizzes: { '04-07': 99 } } }), status: 400 },
    { request: () => fetch(server.endpoint, { method: 'PUT', headers: { ...header, 'Content-Type': 'application/json' }, body: '{bad json' }), status: 400 },
    { request: () => fetch(server.endpoint, { method: 'PUT', headers: { ...header, 'Content-Type': 'application/json' }, body: 'x'.repeat(MAX_BODY_BYTES + 1) }), status: 413 },
  ];
  for (const attempt of attempts) {
    const response = await attempt.request();
    assert.equal(response.status, attempt.status);
    assert.equal(response.headers.get('access-control-allow-origin'), null);
    assert.deepEqual(await (await fetch(server.endpoint, { headers: header })).json(), saved);
  }
  const sameOrigin = await fetch(server.endpoint, { headers: { ...header, Origin: server.url } });
  assert.equal(sameOrigin.status, 200);
  const preflight = await fetch(server.endpoint, { method: 'OPTIONS', headers: { Origin: 'https://evil.example', 'Access-Control-Request-Method': 'PUT', 'Access-Control-Request-Headers': 'x-forge-local' } });
  assert.equal(preflight.status, 403);
  assert.equal(preflight.headers.get('access-control-allow-origin'), null);
});

test('browser mode never creates a database and refuses writes', async t => {
  const parent = await temporary(t);
  const dataDirectory = path.join(parent, 'must-not-be-created');
  const server = await start(t, dataDirectory, 'browser');
  const response = await fetch(server.endpoint, { headers: header });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { mode: 'browser' });
  assert.equal((await put(server.endpoint, { baseRevision: 0, progress: sample })).status, 405);
  await assert.rejects(access(dataDirectory));
});

test('static routes cannot serve the database even through a public-directory symlink', async t => {
  const dataDirectory = await temporary(t);
  const server = await start(t, dataDirectory);
  const { databaseId } = await (await fetch(server.endpoint, { headers: header })).json();
  await put(server.endpoint, { databaseId, baseRevision: 0, progress: sample });
  const name = `private-data-test-${process.pid}`;
  const publicLink = path.join(root, 'portal', name);
  await symlink(dataDirectory, publicLink, 'dir');
  t.after(() => rm(publicLink, { force: true }));
  assert.equal((await fetch(`${server.url}/${name}/progress.sqlite`)).status, 403);
  assert.equal((await fetch(`${server.url}/.git/config`)).status, 404);
  assert.equal((await fetch(`${server.url}/local-data/store.mjs`)).status, 404);
});

test('an unusable data directory reports unavailable storage without erasing the obstruction', async t => {
  const parent = await temporary(t);
  const dataDirectory = path.join(parent, 'existing-file');
  await writeFile(dataDirectory, 'Preserve this file');
  const server = await start(t, dataDirectory);
  const response = await fetch(server.endpoint, { headers: header });
  assert.equal(response.status, 503);
  const failure = await response.json();
  assert.equal(failure.error.code, 'LOCAL_STORAGE_UNAVAILABLE');
  assert.ok(!JSON.stringify(failure).includes(dataDirectory));
  assert.equal(await readFile(dataDirectory, 'utf8'), 'Preserve this file');
});
