// Minimal static preview server for dist/ (mimics GitHub Pages: dir → index.html, unknown → 404.html with status 404)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const DIST = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../dist');
const PORT = Number(process.env.PORT || 4173);
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' };
http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let file = path.join(DIST, p);
  if (!file.startsWith(DIST)) { res.writeHead(400).end(); return; }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
    if (!p.endsWith('/')) { res.writeHead(301, { Location: p + '/' }).end(); return; }
    file = path.join(file, 'index.html');
  }
  if (!fs.existsSync(file)) { res.writeHead(404, { 'Content-Type': TYPES['.html'] }); fs.createReadStream(path.join(DIST, '404.html')).pipe(res); return; }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
}).listen(PORT, () => console.log(`Preview: http://localhost:${PORT}/`));
