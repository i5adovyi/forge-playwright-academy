import path from 'node:path';
import { realpathSync } from 'node:fs';
import { MAX_BODY_BYTES, openProgressStore, resolveDataDirectory, validateWrite } from './store.mjs';

function json(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(payload));
}
const fail = (res, status, code, message) => json(res, status, { error: { code, message } });
const canonical = file => { try { return realpathSync(file); } catch { return path.resolve(file); } };

async function readBody(req) {
  let bytes = 0;
  const chunks = [];
  for await (const chunk of req) {
    bytes += chunk.length;
    if (bytes <= MAX_BODY_BYTES) chunks.push(chunk);
  }
  if (bytes > MAX_BODY_BYTES) throw Object.assign(new Error('Progress request exceeds 2 MiB.'), { status: 413, code: 'PROGRESS_TOO_LARGE' });
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw Object.assign(new Error('Send a valid JSON object.'), { status: 400, code: 'INVALID_PROGRESS' }); }
}

export function createProgressHandler({ getPort, env = process.env } = {}) {
  if (typeof getPort !== 'function') throw new Error('The progress endpoint needs the actual listening port.');
  const mode = env.FORGE_PROGRESS_MODE || 'sqlite';
  if (!['sqlite', 'browser'].includes(mode)) throw new Error('FORGE_PROGRESS_MODE must be sqlite or browser.');
  const dataDirectory = resolveDataDirectory(env);
  let store;
  return {
    dataDirectory,
    isPrivatePath(file) {
      const target = canonical(file);
      const directory = canonical(dataDirectory);
      return target === directory || target.startsWith(`${directory}${path.sep}`) ||
        /^progress\.sqlite(?:-(?:wal|shm|journal))?$/.test(path.basename(target));
    },
    close() { store?.close(); },
    async handle(req, res, url) {
      if (url.pathname !== '/api/learning/progress') return false;
      // A custom header plus no CORS response prevents cross-origin browser reads/writes.
      // Exact loopback Host validation also rejects DNS rebinding against the local listener.
      const host = req.headers.host;
      const port = getPort();
      const acceptedHosts = new Set([`127.0.0.1:${port}`, `localhost:${port}`, `[::1]:${port}`]);
      if (port === 80) for (const host of ['127.0.0.1', 'localhost', '[::1]']) acceptedHosts.add(host);
      if (typeof host !== 'string' || !acceptedHosts.has(host.toLowerCase()) ||
          (req.headers.origin !== undefined && req.headers.origin !== `http://${host}`)) {
        fail(res, 403, 'LOCAL_ACCESS_REQUIRED', 'Use this server through its matching localhost origin.');
        return true;
      }
      if (req.headers['x-forge-local'] !== '1') {
        fail(res, 403, 'LOCAL_HEADER_REQUIRED', 'Local progress requests require X-Forge-Local: 1.');
        return true;
      }
      if (!['GET', 'PUT'].includes(req.method)) {
        res.setHeader('Allow', 'GET, PUT');
        fail(res, 405, 'METHOD_NOT_ALLOWED', 'Use GET or PUT for local progress.');
        return true;
      }
      if (mode === 'browser') {
        if (req.method === 'GET') json(res, 200, { mode: 'browser' });
        else fail(res, 405, 'LOCAL_PROGRESS_DISABLED', 'This server is configured for browser-only progress.');
        return true;
      }
      if (req.method === 'PUT' && !/^application\/json(?:\s*;\s*charset\s*=\s*utf-8)?\s*$/i.test(req.headers['content-type'] || '')) {
        fail(res, 415, 'JSON_REQUIRED', 'Send Content-Type: application/json.');
        return true;
      }
      try {
        // Parse and validate before opening the file on a first write.
        const input = req.method === 'PUT' ? await readBody(req) : null;
        if (input) {
          validateWrite(input);
        } else if (req.method === 'PUT') {
          fail(res, 400, 'INVALID_PROGRESS', 'Send a valid progress update.');
          return true;
        }
        store ||= openProgressStore({ dataDirectory });
        if (req.method === 'GET') json(res, 200, store.read());
        else {
          const result = store.write(input);
          if (result.conflict) {
            const { conflict, ...current } = result;
            json(res, 409, { error: { code: 'PROGRESS_CONFLICT', message: 'The local record changed. Review both versions before retrying.' }, ...current });
          } else json(res, 200, result);
        }
      } catch (error) {
        // Never expose SQLite details, filesystem errors, or note contents in an error response.
        fail(res, error.status || 503, error.status ? error.code : 'LOCAL_STORAGE_UNAVAILABLE',
          error.status ? error.message : 'The local database is unavailable. Your unsaved work has not been confirmed as saved.');
      }
      return true;
    },
  };
}
