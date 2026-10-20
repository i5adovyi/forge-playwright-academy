import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';

// Deliberately local, synthetic teaching service. Controls are not a production API.
const sessions = new Map();
const port = Number(process.env.JOBS_PORT || '14844');
const send = (response, status, value) => {
  if (response.destroyed || response.writableEnded) return;
  response.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
  response.end(value === undefined ? '' : JSON.stringify(value));
};
const body = async request => {
  let text = '';
  for await (const chunk of request) {
    text += chunk;
    if (text.length > 16_384) throw new Error('Body exceeds lab limit');
  }
  return text ? JSON.parse(text) : {};
};
const publicJob = job => ({
  id: job.id, requestId: job.requestId, customerId: job.customerId,
  state: job.state,
  ...(job.state === 'succeeded' ? { artifactPath: `/jobs/${job.id}/artifact` } : {}),
  ...(job.state === 'failed' ? { error: { code: 'SOURCE_UNAVAILABLE', message: 'Orders source is unavailable' } } : {}),
});
function releaseWaiters(session) {
  for (const waiter of [...session.waiters]) {
    if (session.reads.some(read => read.jobId === waiter.jobId && read.state === waiter.state)) {
      session.waiters.delete(waiter);
      clearTimeout(waiter.timer);
      send(waiter.response, 200, { observed: waiter.state });
    }
  }
}
function dispose(session) {
  for (const pending of session.pending) send(pending, 410, { error: 'SESSION_DISPOSED' });
  for (const waiter of session.waiters) {
    clearTimeout(waiter.timer);
    send(waiter.response, 410, { error: 'SESSION_DISPOSED' });
  }
  session.pending.clear();
  session.waiters.clear();
}

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, 'http://localhost');
    const path = url.pathname;
    if (request.method === 'GET' && path === '/health') return send(response, 200, { service: 'forge-async-jobs-v1' });
    if (request.method === 'GET' && path === '/') {
      response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return response.end(await readFile(new URL('./index.html', import.meta.url)));
    }
    if (request.method === 'GET' && path === '/app.js') {
      response.writeHead(200, { 'Content-Type': 'text/javascript; charset=utf-8' });
      return response.end(await readFile(new URL('./app.js', import.meta.url)));
    }
    if (request.method === 'POST' && path === '/control/sessions') {
      const id = randomUUID();
      sessions.set(id, { jobs: new Map(), reads: [], writes: [], artifacts: [], artifactReads: 0, waiters: new Set(), pending: new Set(), mode: 'normal' });
      return send(response, 201, { id });
    }
    const sessionId = request.headers['x-jobs-session'];
    const session = sessions.get(sessionId);
    if (!session) return send(response, 404, { error: 'SESSION_NOT_FOUND' });
    if (request.method === 'DELETE' && path === '/control/session') {
      dispose(session);
      sessions.delete(sessionId);
      return send(response, 204);
    }
    if (request.method === 'GET' && path === '/control/evidence') {
      return send(response, 200, {
        jobs: [...session.jobs.values()].map(publicJob), writes: session.writes,
        reads: session.reads, artifactReads: session.artifactReads, artifacts: session.artifacts,
      });
    }
    if (request.method === 'POST' && path === '/control/mode') {
      const input = await body(request);
      if (!['normal', 'wrong-status-id', 'wrong-artifact-id', 'hold-status'].includes(input.mode)) {
        return send(response, 422, { error: 'UNKNOWN_MODE' });
      }
      session.mode = input.mode;
      return send(response, 200, { mode: session.mode });
    }
    if (request.method === 'POST' && path === '/jobs') {
      const input = await body(request);
      if (typeof input.requestId !== 'string' || input.customerId !== 'customer-42' || input.format !== 'summary') {
        return send(response, 422, { error: 'INVALID_JOB_INPUT' });
      }
      // This endpoint intentionally has no idempotency contract. Observation must not resubmit it.
      const job = { id: randomUUID(), requestId: input.requestId, customerId: input.customerId, state: 'queued' };
      session.jobs.set(job.id, job);
      session.writes.push({ method: 'POST', path: '/jobs', id: job.id, requestId: job.requestId });
      return send(response, 202, publicJob(job));
    }
    if (request.method === 'POST' && path === '/control/wait-for-read') {
      const input = await body(request);
      if (!session.jobs.has(input.jobId) || !['queued', 'running', 'succeeded', 'failed'].includes(input.state)) {
        return send(response, 422, { error: 'INVALID_BARRIER' });
      }
      const waiter = { response, jobId: input.jobId, state: input.state };
      waiter.timer = setTimeout(() => {
        session.waiters.delete(waiter);
        send(response, 408, { error: 'TEST_BARRIER_EXPIRED', state: waiter.state });
      }, 5_000);
      session.waiters.add(waiter);
      response.on('close', () => { session.waiters.delete(waiter); clearTimeout(waiter.timer); });
      releaseWaiters(session);
      return;
    }
    const transition = path.match(/^\/control\/jobs\/([^/]+)$/);
    if (request.method === 'POST' && transition) {
      const job = session.jobs.get(transition[1]);
      if (!job) return send(response, 404, { error: 'JOB_NOT_FOUND' });
      const input = await body(request);
      const allowed = { queued: ['running', 'failed'], running: ['succeeded', 'failed'], succeeded: [], failed: [] };
      if (!allowed[job.state].includes(input.state)) return send(response, 409, { error: 'INVALID_TRANSITION' });
      job.state = input.state;
      return send(response, 200, publicJob(job));
    }
    const match = path.match(/^\/jobs\/([^/]+)(\/artifact)?$/);
    if (request.method === 'GET' && match) {
      const job = session.jobs.get(match[1]);
      if (!job) return send(response, 404, { error: 'JOB_NOT_FOUND' });
      if (match[2]) {
        session.artifactReads++;
        if (job.state !== 'succeeded') return send(response, 409, { error: 'ARTIFACT_NOT_READY' });
        const artifact = {
          jobId: session.mode === 'wrong-artifact-id' ? 'other-job' : job.id,
          requestId: job.requestId, customerId: job.customerId, format: 'summary',
          summary: { orderCount: 3, totalCents: process.env.JOBS_FAULT === 'wrong-artifact' ? 1 : 28_900 },
        };
        session.artifacts.push(artifact);
        return send(response, 200, artifact);
      }
      session.reads.push({ jobId: job.id, state: job.state });
      releaseWaiters(session);
      if (session.mode === 'hold-status') {
        session.pending.add(response);
        response.on('close', () => session.pending.delete(response));
        return;
      }
      const value = publicJob(job);
      if (session.mode === 'wrong-status-id') value.id = 'other-job';
      return send(response, 200, value);
    }
    send(response, 404, { error: 'NOT_FOUND' });
  } catch (error) {
    send(response, 400, { error: 'INVALID_REQUEST', message: error.message });
  }
});
server.listen(port, '127.0.0.1', () => console.log(`Jobs lab listening on http://127.0.0.1:${port}`));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => {
  for (const session of sessions.values()) dispose(session);
  server.close(() => process.exit(0));
  server.closeAllConnections();
});
