'use strict';

// Serve the existing repository for local checks, never a second copy of the site.
const http = require('http');
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8' };
const port = Number(process.env.PORT || 4173);
http.createServer((req, res) => {
  let name;
  try { name = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch (_) { res.writeHead(400).end('Bad request'); return; }
  const parts = name.split('/');
  if (parts.some(p => p.startsWith('.')) || name.includes('\\')) { res.writeHead(404).end('Not found'); return; }
  let target = path.resolve(root, '.' + name);
  if (!target.startsWith(root + path.sep) && target !== root) { res.writeHead(404).end('Not found'); return; }
  fs.stat(target, (err, stat) => {
    if (err) { res.writeHead(404).end('Not found'); return; }
    if (stat.isDirectory()) {
      if (!name.endsWith('/')) { res.writeHead(301, { Location: name + '/' }).end(); return; }
      target = path.join(target, 'index.html');
    }
    fs.readFile(target, (error, bytes) => {
      if (error) { res.writeHead(404).end('Not found'); return; }
      res.writeHead(200, { 'Content-Type': types[path.extname(target)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      res.end(req.method === 'HEAD' ? undefined : bytes);
    });
  });
}).listen(port, '127.0.0.1', () => console.log('Local EryyynIT: http://127.0.0.1:' + port));
