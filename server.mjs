import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 4173);
const products = [
  { id: 'p1', name: 'Studio Headphones', category: 'Audio', price: 12900, stock: 12, icon: 'headphones', description: 'Find your flow. Hear every detail.', tag: 'Bestseller' },
  { id: 'p2', name: 'Mechanical Keyboard', category: 'Desk', price: 8900, stock: 8, icon: 'keyboard', description: 'A little more joy in every keystroke.', tag: 'Staff pick' },
  { id: 'p3', name: '4K Webcam', category: 'Video', price: 14900, stock: 6, icon: 'camera', description: 'Show up with clarity. Every time.', tag: 'New arrival' },
  { id: 'p4', name: 'Focus Lamp', category: 'Desk', price: 5900, stock: 15, icon: 'lamp', description: 'Better light for your best ideas.', tag: '' },
  { id: 'p5', name: 'Pocket Speaker', category: 'Audio', price: 4900, stock: 0, icon: 'speaker', description: 'Big sound. Small footprint.', tag: 'Sold out' },
  { id: 'p6', name: 'Monitor Arm', category: 'Desk', price: 7900, stock: 10, icon: 'monitor', description: 'Make room for a different perspective.', tag: '' },
];
const sessions = new Map();
const sessionTTL = 12 * 60 * 60 * 1000;
const newState = () => ({ cart: {}, promoCode: null, user: null, orders: [], nextOrder: 1 });
function getSession(req, res) {
  const cookie = req.headers.cookie?.split(';').map(s => s.trim()).find(s => s.startsWith('lab_session='))?.slice(12);
  const supplied = req.headers['x-lab-session'] || cookie;
  const id = typeof supplied === 'string' && /^[a-zA-Z0-9_-]{1,100}$/.test(supplied) ? supplied : randomUUID();
  if (!sessions.has(id)) sessions.set(id, { ...newState(), touched: Date.now() });
  const state = sessions.get(id);
  state.touched = Date.now();
  res.setHeader('Set-Cookie', `lab_session=${id}; Path=/; HttpOnly; SameSite=Lax`);
  return { id, state };
}
setInterval(() => {
  for (const [id, s] of sessions) if (Date.now() - s.touched > sessionTTL) sessions.delete(id);
}, 60_000).unref();
function cartFor(state) {
  const items = Object.entries(state.cart).map(([productId, quantity]) => {
    const p = products.find(p => p.id === productId);
    return { productId, name: p.name, price: p.price, quantity, lineTotal: p.price * quantity };
  });
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const discount = state.promoCode === 'SAVE10' ? Math.round(subtotal * .1) : 0;
  return { items, subtotal, discount, total: subtotal - discount, promoCode: state.promoCode };
}
function json(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(payload));
}
function fail(res, status, code, message) { json(res, status, { error: { code, message } }); }
async function body(req) {
  const chunks = [];
  let bytes = 0;
  for await (const chunk of req) {
    bytes += chunk.length;
    // Drain oversized requests without keeping their contents. Breaking the
    // iterator destroys the socket before the client can receive the 413.
    if (bytes <= 16_384) chunks.push(chunk);
  }
  if (bytes > 16_384) throw Object.assign(new Error('Request body is too large.'), { status: 413 });
  // Decode once: a UTF-8 character may span multiple network chunks.
  const input = Buffer.concat(chunks).toString('utf8');
  try {
    const value = JSON.parse(input || '{}');
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error();
    return value;
  } catch { throw Object.assign(new Error('Send a valid JSON object.'), { status: 400 }); }
}
function textField(value, max = 120) { return typeof value === 'string' && value.trim().length > 0 && value.trim().length <= max; }
async function api(req, res, url) {
  const { state } = getSession(req, res);
  const route = url.pathname;
  const method = req.method;
  if (['/api/health', '/api/forge-health'].includes(route) && method === 'GET') return json(res, 200, { status: 'ok', service: 'forge-lab' });
  if (route === '/api/products' && method === 'GET') {
    const delay = Math.min(1000, Math.max(0, Number(url.searchParams.get('delay')) || 0));
    if (delay) await new Promise(resolve => setTimeout(resolve, delay));
    const search = (url.searchParams.get('search') || '').toLowerCase();
    const category = url.searchParams.get('category');
    const sort = url.searchParams.get('sort') || 'featured';
    if (!['featured', 'price-asc', 'price-desc', 'name'].includes(sort)) return fail(res, 400, 'INVALID_SORT', 'Choose a supported sort order.');
    let list = products.filter(p => p.name.toLowerCase().includes(search) && (!category || category === 'All' || p.category === category));
    if (sort === 'price-asc') list.sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);
    if (sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
    return json(res, 200, { products: list, total: list.length });
  }
  if (route === '/api/session' && method === 'GET') return json(res, 200, { user: state.user });
  if (route === '/api/login' && method === 'POST') {
    const data = await body(req);
    if (data.email !== 'demo@forge.test' || data.password !== 'Playwright123!') return fail(res, 401, 'INVALID_CREDENTIALS', 'Email or password is incorrect.');
    state.user = { email: data.email, name: 'Alex Tester' };
    return json(res, 200, { user: state.user });
  }
  if (route === '/api/logout' && method === 'POST') { state.user = null; return json(res, 200, { user: null }); }
  if (route === '/api/reset' && method === 'POST') {
    Object.assign(state, newState());
    return json(res, 200, { reset: true });
  }
  if (route === '/api/cart' && method === 'GET') return json(res, 200, cartFor(state));
  if (route === '/api/cart' && method === 'POST') {
    const data = await body(req);
    const product = products.find(p => p.id === data.productId);
    if (!product) return fail(res, 404, 'PRODUCT_NOT_FOUND', 'Product does not exist.');
    if (!Number.isInteger(data.quantity) || data.quantity < 1 || data.quantity > 99) return fail(res, 400, 'INVALID_QUANTITY', 'Quantity must be an integer from 1 to 99.');
    if (data.quantity > product.stock) return fail(res, 409, 'INSUFFICIENT_STOCK', `Only ${product.stock} available for ${product.name}.`);
    state.cart[product.id] = data.quantity;
    return json(res, 200, cartFor(state));
  }
  if (route === '/api/cart/promo' && method === 'POST') {
    const data = await body(req);
    if (typeof data.code !== 'string' || data.code.trim().toUpperCase() !== 'SAVE10') return fail(res, 422, 'INVALID_PROMO', 'That promo code is not valid. Try SAVE10.');
    state.promoCode = 'SAVE10';
    return json(res, 200, cartFor(state));
  }
  if (route.startsWith('/api/cart/') && method === 'DELETE') {
    const id = route.slice('/api/cart/'.length);
    if (!Object.hasOwn(state.cart, id)) return fail(res, 404, 'CART_ITEM_NOT_FOUND', 'This item is not in your cart.');
    delete state.cart[id];
    return json(res, 200, cartFor(state));
  }
  if (route === '/api/orders' && ['GET', 'POST'].includes(method)) {
    if (!state.user) return fail(res, 401, 'AUTH_REQUIRED', 'Sign in before accessing orders.');
    if (method === 'GET') return json(res, 200, { orders: state.orders });
    const data = await body(req);
    if (!['name', 'address', 'city', 'postalCode'].every(key => textField(data[key], key === 'postalCode' ? 20 : 120))) return fail(res, 422, 'INVALID_ADDRESS', 'Enter a name, street address, city, and postal code.');
    const cart = cartFor(state);
    if (!cart.items.length) return fail(res, 409, 'EMPTY_CART', 'Add an item before placing an order.');
    const order = {
      id: `ORD-${String(state.nextOrder++).padStart(4, '0')}`,
      ...cart,
      customer: state.user.email,
      shipping: Object.fromEntries(['name', 'address', 'city', 'postalCode'].map(key => [key, data[key].trim()])),
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };
    state.orders.push(order);
    state.cart = {};
    state.promoCode = null;
    return json(res, 201, { order });
  }
  if (/^\/api\/orders\/ORD-\d+\/receipt$/.test(route) && method === 'GET') {
    if (!state.user) return fail(res, 401, 'AUTH_REQUIRED', 'Sign in to download receipts.');
    const order = state.orders.find(o => o.id === route.split('/')[3]);
    if (!order) return fail(res, 404, 'ORDER_NOT_FOUND', 'Order does not exist in this session.');
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8', 'Content-Disposition': `attachment; filename="${order.id}.txt"` });
    return res.end(`FORGE SHOP — DEMO RECEIPT\n${order.id}\n${order.items.map(i => `${i.name} x ${i.quantity}`).join('\n')}\nTotal: $${(order.total / 100).toFixed(2)}\nNo payment was collected.\n`);
  }
  fail(res, 404, 'NOT_FOUND', 'Endpoint not found.');
}
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.md': 'text/plain', '.pdf': 'application/pdf', '.zip': 'application/zip' };
const server = http.createServer(async (req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  try {
    const url = new URL(req.url, `http://127.0.0.1:${port}`);
    if (url.pathname.startsWith('/api/')) return await api(req, res, url);
    if (!['GET', 'HEAD'].includes(req.method)) return fail(res, 405, 'METHOD_NOT_ALLOWED', 'Use GET for static files.');
    const pathname = decodeURIComponent(url.pathname);
    let base = 'portal';
    let relative = pathname.slice(1);
    for (const mount of ['lab', 'docs', 'curriculum', 'exercises', 'solutions', 'skills', 'quality', 'state']) {
      if (pathname === `/${mount}` || pathname.startsWith(`/${mount}/`)) { base = mount; relative = pathname.slice(mount.length + 2); break; }
    }
    const basePath = path.resolve(root, base);
    const target = path.resolve(basePath, relative.endsWith('/') ? `${relative}index.html` : relative || 'index.html');
    if (!target.startsWith(`${basePath}${path.sep}`)) return fail(res, 403, 'FORBIDDEN', 'Path not allowed.');
    const data = await readFile(target);
    res.writeHead(200, { 'Content-Type': `${types[path.extname(target)] || 'text/plain'}; charset=utf-8`, 'Cache-Control': 'no-cache' });
    res.end(req.method === 'HEAD' ? undefined : data);
  } catch (error) {
    if (res.headersSent) return res.end();
    if (error.code === 'ENOENT' || error.code === 'EISDIR') return fail(res, 404, 'NOT_FOUND', 'File not found.');
    fail(res, error.status || 500, error.status ? 'INVALID_BODY' : 'INTERNAL_ERROR', error.status ? error.message : 'Unexpected server error.');
  }
});
server.listen(port, '127.0.0.1', () => console.log(`Forge Academy: http://127.0.0.1:${port}\nPractice lab: http://127.0.0.1:${port}/lab/`));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => process.exit(0)));
