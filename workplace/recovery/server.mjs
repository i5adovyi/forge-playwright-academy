import { createServer } from 'node:http';
import { mkdirSync, appendFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const port = Number(process.env.RECOVERY_PORT || 14842);
const evidenceDirectory = process.env.FORGE_RECOVERY_DATA_DIR;
if (!evidenceDirectory) throw new Error('FORGE_RECOVERY_DATA_DIR must identify this run’s journal directory.');
mkdirSync(evidenceDirectory, { recursive: true });
const fault = process.env.FORGE_RECOVERY_FAULT || 'none';
const sessions = new Map();
const json = (response, status, value, headers = {}) => {
  response.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...headers });
  response.end(JSON.stringify(value));
};
const error = (response, status, code) => json(response, status, { error: { code } });
const readBody = async request => {
  let body = '';
  for await (const part of request) {
    body += part;
    if (body.length > 16384) throw new Error('BODY_TOO_LARGE');
  }
  return JSON.parse(body || '{}');
};
function sessionFor(id) {
  if (!sessions.has(id)) {
    const file = join(evidenceDirectory, `${id}.jsonl`);
    sessions.set(id, { file, orders: [], ledger: new Map(), events: [], writes: 0, lookups: 0,
      dropReplies: 0, visibility: 'immediate', pendingReads: 0 });
  }
  return sessions.get(id);
}
function record(session, event) {
  const entry = { sequence: session.events.length + 1, ...event };
  // The commit record is flushed to the file before the transport is closed.
  // This is diagnostic persistence; startup deliberately does not rebuild the ledger.
  appendFileSync(session.file, `${JSON.stringify(entry)}\n`, { flush: true });
  session.events.push(entry);
}
function payloadOf(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)
    || Object.keys(body).sort().join(',') !== 'quantity,sku'
    || body.sku !== 'headphones' || !Number.isInteger(body.quantity)
    || body.quantity < 1 || body.quantity > 3) return null;
  return { sku: body.sku, quantity: body.quantity };
}
function loseReply(session, request, response, customer, key, order, replay = false) {
  session.dropReplies -= 1;
  record(session, { type: replay ? 'reply-lost-on-replay' : 'reply-lost-after-commit',
    customer, key, orderId: order.id });
  // Flush an incomplete response before closing. A bare socket close on a
  // reused connection can trigger a transparent browser retransmission.
  response.writeHead(replay ? 200 : 201, { 'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(JSON.stringify(order)) });
  response.write('{"id":', () => request.socket.destroy());
}
const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://127.0.0.1:${port}`);
    if (url.pathname === '/health') return json(response, 200, { service: 'recovery-lab', ready: true });
    if (url.pathname === '/') {
      response.writeHead(200, { 'Content-Type': 'text/html', 'Cache-Control': 'no-store' });
      response.end(readFileSync(new URL('./shop.html', import.meta.url)));
      return;
    }
    const sessionId = request.headers['x-lab-session'];
    if (typeof sessionId !== 'string' || !/^[a-zA-Z0-9-]{1,100}$/.test(sessionId)) {
      return error(response, 400, 'INVALID_LAB_SESSION');
    }
    const session = sessionFor(sessionId);
    if (url.pathname === '/__control' && request.method === 'POST') {
      const body = await readBody(request);
      if (!['immediate', 'pending', 'pending-once'].includes(body.visibility || 'immediate')) {
        return error(response, 400, 'INVALID_CONTROL');
      }
      const dropReplies = body.dropReplies ?? (body.dropNextCommit === true ? 1 : 0);
      if (!Number.isInteger(dropReplies) || dropReplies < 0 || dropReplies > 2) return error(response, 400, 'INVALID_CONTROL');
      session.dropReplies = dropReplies;
      session.visibility = body.visibility || 'immediate';
      session.pendingReads = 0;
      record(session, { type: 'control', fault, dropReplies: session.dropReplies, visibility: session.visibility });
      return json(response, 200, { ready: true });
    }
    if (url.pathname === '/__evidence') {
      // Re-read disk: the proof does not trust only an in-memory "committed" flag.
      const journal = session.events.length
        ? readFileSync(session.file, 'utf8').trim().split('\n').map(line => JSON.parse(line)) : [];
      return json(response, 200, { fault, writes: session.writes, lookups: session.lookups, orders: session.orders, journal });
    }
    const customer = request.headers['x-customer'];
    if (!['alice', 'bob'].includes(customer)) return error(response, 401, 'DEMO_CUSTOMER_REQUIRED');
    if (url.pathname === '/orders' && request.method === 'GET') {
      return json(response, 200, { orders: session.orders.filter(order => order.customer === customer) });
    }
    if (url.pathname.startsWith('/attempts/') && request.method === 'GET') {
      const key = decodeURIComponent(url.pathname.slice('/attempts/'.length));
      const entry = session.ledger.get(`${customer}:${key}`);
      session.lookups += 1;
      session.pendingReads += 1;
      const hidden = entry && (session.visibility === 'pending'
        || (session.visibility === 'pending-once' && session.pendingReads === 1));
      const state = hidden ? (fault === 'false-absence' ? 'absent' : 'pending') : entry ? 'committed' : 'absent';
      record(session, { type: 'lookup', customer, key, state });
      return json(response, 200, state === 'committed' ? { state, order: entry.order } : { state });
    }
    if (url.pathname === '/orders' && request.method === 'POST') {
      const key = request.headers['idempotency-key'];
      if (typeof key !== 'string' || !/^[a-zA-Z0-9-]{1,100}$/.test(key)) {
        return error(response, 400, 'IDEMPOTENCY_KEY_REQUIRED');
      }
      const payload = payloadOf(await readBody(request));
      if (!payload) return error(response, 422, 'INVALID_ORDER');
      session.writes += 1;
      record(session, { type: 'write-attempt', customer, key, payload });
      const fingerprint = JSON.stringify(payload);
      const ledgerKey = `${customer}:${key}`;
      const existing = session.ledger.get(ledgerKey);
      if (existing && fault !== 'dedupe-off') {
        if (existing.fingerprint !== fingerprint && fault !== 'conflict-accepted') {
          record(session, { type: 'conflict', customer, key, orderId: existing.order.id });
          return error(response, 409, 'IDEMPOTENCY_CONFLICT');
        }
        record(session, { type: 'replay', customer, key, orderId: existing.order.id });
        if (session.dropReplies > 0) {
          loseReply(session, request, response, customer, key, existing.order, true);
          return;
        }
        return json(response, 200, existing.order, { 'Idempotency-Replayed': 'true' });
      }
      const order = { id: `REC-${String(session.orders.length + 1).padStart(3, '0')}`,
        customer, ...payload, total: 12900 * payload.quantity };
      session.orders.push(order);
      session.ledger.set(ledgerKey, { fingerprint, order });
      record(session, { type: 'committed', customer, key, order });
      if (session.dropReplies > 0) {
        loseReply(session, request, response, customer, key, order);
        return;
      }
      return json(response, 201, order, { 'Idempotency-Replayed': 'false' });
    }
    return error(response, 404, 'NOT_FOUND');
  } catch {
    if (!response.destroyed) error(response, 400, 'INVALID_JSON');
  }
});
server.listen(port, '127.0.0.1', () => console.log(`Recovery lab: http://127.0.0.1:${port}`));
