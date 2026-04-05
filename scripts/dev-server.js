#!/usr/bin/env bun

import { watch } from 'fs';
import { join, extname } from 'path';
import { readFileSync, statSync, existsSync } from 'fs';

const PORT = 3000;
const ROOT = join(import.meta.dir, '..');

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
  '.asc': 'text/plain',
};

const RELOAD_SCRIPT = `<script>new EventSource("/__reload").onmessage=()=>location.reload()</script>`;

let reloadClients = [];

function resolve(pathname) {
  if (pathname.match(/^\/photos\/[^./]+\/?$/)) {
    return join(ROOT, 'photos', 'index.html');
  }

  let filePath = join(ROOT, pathname);

  try {
    if (statSync(filePath).isDirectory()) {
      filePath = join(filePath, 'index.html');
    }
  } catch {}

  return filePath;
}

const server = Bun.serve({
  port: PORT,
  fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === '/__reload') {
      return new Response(new ReadableStream({
        start(controller) {
          const client = { controller };
          reloadClients.push(client);
          req.signal.addEventListener('abort', () => {
            reloadClients = reloadClients.filter(c => c !== client);
          });
        }
      }), {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        }
      });
    }

    const filePath = resolve(url.pathname);
    const ext = extname(filePath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    try {
      let content = readFileSync(filePath);

      if (ext === '.html') {
        content = content.toString().replace('</body>', RELOAD_SCRIPT + '</body>');
        return new Response(content, { headers: { 'Content-Type': contentType } });
      }

      return new Response(content, { headers: { 'Content-Type': contentType } });
    } catch {
      try {
        const notFound = readFileSync(join(ROOT, '404.html')).toString();
        return new Response(
          notFound.replace('</body>', RELOAD_SCRIPT + '</body>'),
          { status: 404, headers: { 'Content-Type': 'text/html' } }
        );
      } catch {
        return new Response('Not Found', { status: 404 });
      }
    }
  }
});

function notifyReload() {
  for (const client of reloadClients) {
    try {
      client.controller.enqueue(new TextEncoder().encode('data: reload\n\n'));
    } catch {}
  }
}

let debounce;
const WATCH_DIRS = [ROOT, join(ROOT, 'photos'), join(ROOT, 'fonts'), join(ROOT, 'images')];
for (const dir of WATCH_DIRS) {
  if (existsSync(dir)) {
    watch(dir, () => {
      clearTimeout(debounce);
      debounce = setTimeout(notifyReload, 100);
    });
  }
}

console.log(`Dev server running at http://localhost:${PORT}`);
