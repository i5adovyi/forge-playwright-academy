import http from 'node:http';

// The target implementation deliberately does not import expected-release.json.
// A deployment expectation must not be manufactured from the observed target.
const deployed = {
  application: 'forge-release-lab', environment: 'training', tenant: 'academy',
  frontendBuild: 'web-2026-10-20.1', backendBuild: 'api-2026-10-20.3',
};
const frontPort = Number(process.env.FORGE_PREFLIGHT_FRONT_PORT || 14840);
const backPort = Number(process.env.FORGE_PREFLIGHT_BACK_PORT || 14841);
const frontend = `http://127.0.0.1:${frontPort}`;
const backend = `http://127.0.0.1:${backPort}`;
const sessions = new Map();
const scenarios = new Set([
  'correct', 'stale-frontend', 'stale-backend', 'wrong-destination', 'wrong-tenant',
  'wrong-environment', 'wrong-application', 'malformed-frontend', 'malformed-backend',
  'wrong-frontend-origin', 'wrong-frontend-tenant', 'wrong-frontend-environment', 'wrong-frontend-application',
  'dependency-down', 'product-error', 'malformed-ready', 'transport-reset',
]);
const json = (response, status, value) => {
  response.writeHead(status, {
    'content-type': 'application/json', 'cache-control': 'no-store',
    'access-control-allow-origin': frontend,
  });
  response.end(JSON.stringify(value));
};
async function body(request) {
  let text = '';
  for await (const chunk of request) {
    text += chunk;
    if (text.length > 4096) throw new Error('body too large');
  }
  return JSON.parse(text || '{}');
}
function identity(session, component) {
  if (session.scenario === `malformed-${component}`) return null;
  const result = {
    application: deployed.application, environment: deployed.environment, tenant: deployed.tenant,
    build: component === 'frontend' ? deployed.frontendBuild : deployed.backendBuild,
  };
  if (session.scenario === 'stale-frontend' && component === 'frontend') result.build = 'web-previous';
  if (session.scenario === 'stale-backend' && component === 'backend') result.build = 'api-previous';
  if (session.scenario === 'wrong-tenant' && component === 'backend') result.tenant = 'other-team';
  if (session.scenario === 'wrong-environment' && component === 'backend') result.environment = 'staging';
  if (session.scenario === 'wrong-application' && component === 'backend') result.application = 'another-application';
  if (session.scenario === 'wrong-frontend-tenant' && component === 'frontend') result.tenant = 'other-team';
  if (session.scenario === 'wrong-frontend-environment' && component === 'frontend') result.environment = 'staging';
  if (session.scenario === 'wrong-frontend-application' && component === 'frontend') result.application = 'another-application';
  return result;
}
async function handle(request, response, surface) {
  const url = new URL(request.url, surface === 'frontend' ? frontend : backend);
  if (url.pathname === '/health') return json(response, 200, { healthy: true, surface });
  if (surface === 'frontend' && url.pathname === '/__control/sessions' && request.method === 'POST') {
    const input = await body(request);
    if (typeof input.id !== 'string' || !/^[a-f0-9-]{36}$/.test(input.id) || !scenarios.has(input.scenario)) {
      return json(response, 400, { error: 'INVALID_SCENARIO' });
    }
    if (sessions.has(input.id)) return json(response, 409, { error: 'DUPLICATE_SESSION' });
    sessions.set(input.id, { scenario: input.scenario, writes: [], attempts: 0, probes: 0 });
    return json(response, 201, { id: input.id });
  }
  const session = sessions.get(url.searchParams.get('session'));
  if (!session) return json(response, 404, { error: 'UNKNOWN_SESSION' });
  if (surface === 'frontend' && url.pathname === '/__control/ledger') {
    return json(response, 200, { writes: session.writes, attempts: session.attempts, probes: session.probes });
  }
  if (surface === 'frontend' && url.pathname === '/__control/session' && request.method === 'DELETE') {
    sessions.delete(url.searchParams.get('session'));
    return json(response, 200, { deleted: true });
  }
  if (surface === 'frontend' && url.pathname === '/' && session.scenario === 'wrong-frontend-origin') {
    response.writeHead(302, { location: `${backend}/${url.search}`, 'cache-control': 'no-store' });
    return response.end();
  }
  if (url.pathname === '/' && (surface === 'frontend' || session.scenario === 'wrong-frontend-origin')) {
    const destination = session.scenario === 'wrong-destination' ? frontend : backend;
    const prefix = destination === frontend ? '/backend' : '';
    const id = url.searchParams.get('session');
    const frontIdentity = JSON.stringify(identity(session, 'frontend'));
    // Metadata represents the served frontend release. The visible badge is
    // intentionally constant: looking at it cannot verify the browser's API.
    response.writeHead(200, { 'content-type': 'text/html', 'cache-control': 'no-store' });
    return response.end(`<!doctype html><html lang="en"><meta charset="utf-8">
<meta name="forge-build" content='${frontIdentity}'><title>Release verification lab</title>
<style>body{font:18px system-ui;max-width:720px;margin:48px auto;padding:24px}button{font:inherit;padding:12px}output{display:block;margin:20px 0}</style>
<h1>Release verification lab</h1><p>Build badge: <strong>${deployed.frontendBuild}</strong></p>
<p>The backend request destination is evidence; the badge is only a clue.</p>
<output aria-label="Connection">Connecting</output><button disabled>Place training order</button>
<output aria-label="Order status">No order</output>
<script>
const base = ${JSON.stringify(destination + prefix)};
const query = ${JSON.stringify(`?session=${id}`)};
fetch(base + '/identity' + query).then(async response => {
  await response.json();
  document.querySelector('[aria-label="Connection"]').textContent = 'Connected';
  document.querySelector('button').disabled = false;
});
document.querySelector('button').addEventListener('click', async () => {
  const response = await fetch(base + '/orders' + query, { method:'POST' });
  const order = await response.json();
  document.querySelector('[aria-label="Order status"]').textContent = order.id;
});
</script></html>`);
  }
  if (url.pathname === '/identity' || (surface === 'frontend' && url.pathname === '/backend/identity')) {
    return json(response, 200, identity(session, 'backend'));
  }
  if (surface === 'backend' && url.pathname === '/dependency') {
    session.probes++;
    const requestId = `probe-${url.searchParams.get('session')}-${session.probes}`;
    if (session.scenario === 'dependency-down') {
      return json(response, 503, { code: 'DEPENDENCY_UNAVAILABLE', dependency: 'inventory', requestId });
    }
    if (session.scenario === 'product-error') {
      return json(response, 500, { code: 'PRICE_CALCULATION_FAILED', requestId });
    }
    if (session.scenario === 'malformed-ready') return json(response, 200, { ready: 'yes', requestId });
    if (session.scenario === 'transport-reset') return request.socket.destroy();
    return json(response, 200, { ready: true, requestId });
  }
  if ((url.pathname === '/orders' || url.pathname === '/backend/orders') && request.method === 'POST') {
    session.attempts++;
    const order = { id: `TRAINING-${session.writes.length + 1}`, item: 'release-check', quantity: 1 };
    session.writes.push(order);
    return json(response, 201, order);
  }
  return json(response, 404, { error: 'NOT_FOUND' });
}
const servers = [http.createServer((request, response) => {
  handle(request, response, 'frontend').catch(() => json(response, 500, { error: 'FIXTURE_ERROR' }));
}), http.createServer((request, response) => {
  handle(request, response, 'backend').catch(() => json(response, 500, { error: 'FIXTURE_ERROR' }));
})];
await Promise.all(servers.map((server, index) => new Promise((resolve, reject) => {
  server.once('error', reject);
  server.listen(index === 0 ? frontPort : backPort, '127.0.0.1', resolve);
})));
console.log(`Preflight fixture: frontend ${frontend}; backend ${backend}`);
const stop = () => Promise.all(servers.map(server => new Promise(resolve => {
  server.close(resolve);
  server.closeAllConnections();
}))).then(() => process.exit(0));
process.on('SIGTERM', stop);
process.on('SIGINT', stop);
