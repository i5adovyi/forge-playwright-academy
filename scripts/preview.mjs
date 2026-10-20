import http from 'node:http';
import { readFile, access } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../dist');
const port = Number(process.env.PORT || 4174);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be an integer between 1 and 65535.');
try { await access(path.join(root, 'index.html')); }
catch { throw new Error('Build the portal first: npm run build'); }
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.md': 'text/plain', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.zip': 'application/zip' };
const server = http.createServer(async (req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'no-cache');
  if (!['GET', 'HEAD'].includes(req.method)) {
    res.writeHead(405, { Allow: 'GET, HEAD' });
    return res.end();
  }
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = path.resolve(root, `.${pathname.endsWith('/') ? `${pathname}index.html` : pathname}`);
    if (!file.startsWith(`${root}${path.sep}`)) {
      res.writeHead(403); return res.end();
    }
    const data = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
    res.end(req.method === 'HEAD' ? undefined : data);
  } catch (error) {
    res.writeHead(error instanceof URIError ? 400 : ['ENOENT', 'EISDIR'].includes(error.code) ? 404 : 500);
    res.end('Static portal file unavailable.');
  }
});
server.on('error', error => { console.error(`Cannot start static preview: ${error.message}`); process.exitCode = 1; });
server.listen(port, '127.0.0.1', () => console.log(`Static portal preview: http://127.0.0.1:${port}\nFor the live shop and API, run npm run local instead.`));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => process.exit(0)));
