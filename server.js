/* ═══════════════════════════════════════════════════════════════
   CAPIARCOS — Site + Admin Server (zero dependencies)
   Uses only Node built-ins so it runs anywhere with `node server.js`,
   no `npm install` needed.

   Endpoints:
     · GET    /api/manifest             (public)
     · POST   /api/login                ({ password } → cookie)
     · POST   /api/logout
     · GET    /api/me
     · POST   /api/upload?categoria=X   (multipart/form-data, files[])
     · DELETE /api/image?categoria=X&file=Y
   Plus static serving of the rest of the site.
═══════════════════════════════════════════════════════════════ */

import http   from 'node:http';
import fs     from 'node:fs';
import fsp    from 'node:fs/promises';
import path   from 'node:path';
import crypto from 'node:crypto';
import { Buffer } from 'node:buffer';
import { fileURLToPath } from 'node:url';

const __dirname   = path.dirname(fileURLToPath(import.meta.url));
const ROOT        = __dirname;
const CATALOG_DIR = path.join(ROOT, 'assets', 'img', 'catalogo');
const PORT        = Number(process.env.PORT) || 3000;
const ADMIN_PW    = process.env.ADMIN_PASSWORD || 'capiarcos-admin';
const COOKIE      = 'cap_admin';
const SESSION_TTL = 1000 * 60 * 60 * 24 * 7;          // 7 days
const MAX_UPLOAD  = 100 * 1024 * 1024;                // 100 MB per request
const MAX_FILE    = 25  * 1024 * 1024;                // 25 MB per file

const CATEGORIES = [
  { slug: 'cozinhas',       label: 'Cozinhas',       label_en: 'Kitchens',     label_fr: 'Cuisines'       },
  { slug: 'roupeiros',      label: 'Roupeiros',      label_en: 'Wardrobes',    label_fr: 'Dressings'      },
  { slug: 'salas',          label: 'Salas',          label_en: 'Living rooms', label_fr: 'Salons'         },
  { slug: 'quartos',        label: 'Quartos',        label_en: 'Bedrooms',     label_fr: 'Chambres'       },
  { slug: 'casas-de-banho', label: 'Casas de Banho', label_en: 'Bathrooms',    label_fr: 'Salles de bain' },
  { slug: 'pavimentos',     label: 'Pavimentos',     label_en: 'Flooring',     label_fr: 'Parquets'       },
  { slug: 'portas',         label: 'Portas',         label_en: 'Doors',        label_fr: 'Portes'         },
  { slug: 'escadas',        label: 'Escadas',        label_en: 'Stairs',       label_fr: 'Escaliers'      },
];
const CATEGORY_SLUGS = new Set(CATEGORIES.map(c => c.slug));

for (const c of CATEGORIES) fs.mkdirSync(path.join(CATALOG_DIR, c.slug), { recursive: true });

/* ── Session store (in-memory) ─────────────────────────────── */
const sessions = new Map();   // token → expiresAt (ms)
const newSession = () => {
  const t = crypto.randomBytes(32).toString('hex');
  sessions.set(t, Date.now() + SESSION_TTL);
  return t;
};
const isAuthed = (t) => {
  if (!t) return false;
  const exp = sessions.get(t);
  if (!exp) return false;
  if (exp < Date.now()) { sessions.delete(t); return false; }
  return true;
};
setInterval(() => {
  const now = Date.now();
  for (const [t, exp] of sessions) if (exp < now) sessions.delete(t);
}, 60 * 60 * 1000).unref();

/* ── HTTP helpers ──────────────────────────────────────────── */
function send(res, status, body, headers = {}) {
  res.writeHead(status, { 'Cache-Control': 'no-store', ...headers });
  res.end(body);
}
function sendJson(res, status, obj, headers = {}) {
  send(res, status, JSON.stringify(obj), { 'Content-Type': 'application/json; charset=utf-8', ...headers });
}
function parseCookies(req) {
  const raw = req.headers.cookie || '';
  return Object.fromEntries(
    raw.split(';').map(s => s.trim().split('=')).filter(p => p[0])
  );
}
function setCookie(res, name, value, maxAgeSec) {
  const parts = [`${name}=${value}`, 'HttpOnly', 'SameSite=Lax', 'Path=/'];
  if (maxAgeSec != null) parts.push(`Max-Age=${maxAgeSec}`);
  res.setHeader('Set-Cookie', parts.join('; '));
}
function readJsonBody(req, max = 1 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let len = 0;
    req.on('data', (c) => {
      len += c.length;
      if (len > max) { reject(new Error('body-too-large')); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8') || '{}';
      try { resolve(JSON.parse(raw)); } catch { reject(new Error('bad-json')); }
    });
    req.on('error', reject);
  });
}
function readBuffer(req, max) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let len = 0;
    req.on('data', (c) => {
      len += c.length;
      if (len > max) { reject(new Error('body-too-large')); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

/* ── Multipart/form-data parser ───────────────────────────────
   Supports plain fields + file fields. Returns
     { fields: { name: 'value' }, files: [{ field, filename, mime, data }] }
   Boundary parsing follows RFC 7578.
─────────────────────────────────────────────────────────────── */
function parseMultipart(body, boundary) {
  const delimiter = Buffer.from('--' + boundary);
  const fields = {};
  const files  = [];
  let cursor = 0;
  while (true) {
    const start = body.indexOf(delimiter, cursor);
    if (start < 0) break;
    const partStart = start + delimiter.length;
    // End marker: "--" right after delimiter = last boundary
    if (body[partStart] === 0x2d && body[partStart + 1] === 0x2d) break;
    // Skip CRLF after boundary
    let headerStart = partStart;
    if (body[headerStart] === 0x0d && body[headerStart + 1] === 0x0a) headerStart += 2;
    const headerEnd = body.indexOf(Buffer.from('\r\n\r\n'), headerStart);
    if (headerEnd < 0) break;
    const headersRaw = body.slice(headerStart, headerEnd).toString('utf8');
    const dataStart  = headerEnd + 4;
    const nextDelim  = body.indexOf(delimiter, dataStart);
    if (nextDelim < 0) break;
    // Data ends 2 bytes (\r\n) before the next delimiter
    const dataEnd = nextDelim - 2;
    const data = body.slice(dataStart, dataEnd);

    const cd     = /content-disposition:\s*([^\r\n]+)/i.exec(headersRaw)?.[1] || '';
    const ct     = /content-type:\s*([^\r\n]+)/i.exec(headersRaw)?.[1];
    const name   = /name="([^"]+)"/i.exec(cd)?.[1];
    const fname  = /filename="([^"]*)"/i.exec(cd)?.[1];
    if (name) {
      if (fname != null) {
        files.push({ field: name, filename: fname, mime: ct || 'application/octet-stream', data });
      } else {
        fields[name] = data.toString('utf8');
      }
    }
    cursor = nextDelim;
  }
  return { fields, files };
}

function safeFilename(orig) {
  const base = (orig || 'imagem.jpg').split(/[/\\]/).pop();
  const safe = base.replace(/[^\w.\-]+/g, '_').slice(-80);
  const ext  = path.extname(safe) || '.jpg';
  const stem = path.basename(safe, ext).slice(0, 40) || 'imagem';
  const stamp = Date.now().toString(36) + '-' + crypto.randomBytes(3).toString('hex');
  return `${stem}-${stamp}${ext}`;
}

/* ── Static serving ──────────────────────────────────────── */
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif':  'image/gif',
  '.avif': 'image/avif',
  '.ico':  'image/x-icon',
  '.txt':  'text/plain; charset=utf-8',
  '.map':  'application/json',
};
// Cache the 404 page in memory so we don't read it from disk on every miss.
let _nfHtml = null;
async function notFoundHtml() {
  if (_nfHtml) return _nfHtml;
  try { _nfHtml = await fsp.readFile(path.join(ROOT, '404.html')); }
  catch { _nfHtml = Buffer.from('<!doctype html><h1>404 — Não encontrado</h1>'); }
  return _nfHtml;
}
async function send404(res, urlPath) {
  // For page-like requests (no extension or .html), serve the full 404 page.
  // For asset misses, keep the response tiny to avoid wasted bytes.
  const ext = path.extname(urlPath);
  if (!ext || ext === '.html') {
    const html = await notFoundHtml();
    res.writeHead(404, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    });
    res.end(html);
  } else {
    send(res, 404, 'Not Found');
  }
}

async function serveStatic(req, res, urlPath) {
  // Decode path, strip query (already done by caller)
  let rel;
  try { rel = decodeURIComponent(urlPath); } catch { return send(res, 400, 'bad path'); }
  // Disallow .. traversal
  if (rel.includes('\0')) return send(res, 400, 'bad path');

  // Clean-URL policy: redirect /foo.html → /foo (keep /index.html → /).
  // Skip everything under /assets/ (real files like .jpg, .css, etc).
  if (!rel.startsWith('/assets/')) {
    if (rel.endsWith('/index.html')) {
      res.writeHead(301, { Location: rel.slice(0, -'index.html'.length) });
      return res.end();
    }
    if (rel.endsWith('.html')) {
      res.writeHead(301, { Location: rel.slice(0, -'.html'.length) });
      return res.end();
    }
  }

  rel = rel.replace(/^\/+/, '');
  // Default index for "/" or "/admin/"
  if (rel === '' || rel.endsWith('/')) rel = path.join(rel, 'index.html');
  const abs = path.resolve(ROOT, rel);
  if (!abs.startsWith(ROOT)) return send(res, 400, 'path traversal');
  try {
    const st = await fsp.stat(abs);
    if (st.isDirectory()) {
      return serveStatic(req, res, urlPath.replace(/\/?$/, '/') + 'index.html');
    }
    const ext = path.extname(abs).toLowerCase();
    const type = MIME[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': type,
      'Content-Length': st.size,
      'Cache-Control': abs.includes(path.join('assets', 'img', 'catalogo'))
        ? 'public, max-age=300'
        : 'public, max-age=60',
    });
    fs.createReadStream(abs).pipe(res);
  } catch {
    // Try with .html extension for clean URLs like /catalogo
    if (!path.extname(abs)) {
      try {
        const st = await fsp.stat(abs + '.html');
        if (st.isFile()) {
          res.writeHead(200, { 'Content-Type': MIME['.html'] });
          fs.createReadStream(abs + '.html').pipe(res);
          return;
        }
      } catch {}
    }
    return send404(res, urlPath);
  }
}

/* ── Route handlers ──────────────────────────────────────── */
async function handleLogin(req, res) {
  let body;
  try { body = await readJsonBody(req); }
  catch { return sendJson(res, 400, { error: 'bad-json' }); }
  const pw = typeof body.password === 'string' ? body.password : '';
  const a = Buffer.from(pw);
  const b = Buffer.from(ADMIN_PW);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return sendJson(res, 401, { error: 'invalid' });
  }
  const t = newSession();
  setCookie(res, COOKIE, t, SESSION_TTL / 1000);
  sendJson(res, 200, { ok: true });
}
function handleLogout(req, res) {
  const t = parseCookies(req)[COOKIE];
  if (t) sessions.delete(t);
  setCookie(res, COOKIE, '', 0);
  sendJson(res, 200, { ok: true });
}
function handleMe(req, res) {
  sendJson(res, 200, { authed: isAuthed(parseCookies(req)[COOKIE]) });
}
async function handleManifest(_req, res) {
  const items = {};
  for (const c of CATEGORIES) {
    const dir = path.join(CATALOG_DIR, c.slug);
    try {
      const names = (await fsp.readdir(dir)).filter(f => /\.(jpe?g|png|webp|gif|avif)$/i.test(f));
      const stats = await Promise.all(names.map(async (f) => {
        const st = await fsp.stat(path.join(dir, f));
        return {
          file: f,
          url:  `/assets/img/catalogo/${c.slug}/${encodeURIComponent(f)}`,
          mtime: st.mtimeMs,
        };
      }));
      stats.sort((a, b) => b.mtime - a.mtime);   // newest first
      items[c.slug] = stats;
    } catch { items[c.slug] = []; }
  }
  sendJson(res, 200, { categories: CATEGORIES, items });
}
async function handleUpload(req, res, url) {
  if (!isAuthed(parseCookies(req)[COOKIE])) return sendJson(res, 401, { error: 'auth-required' });
  const slug = url.searchParams.get('categoria');
  if (!CATEGORY_SLUGS.has(slug)) return sendJson(res, 400, { error: 'invalid-category' });
  const ctype = req.headers['content-type'] || '';
  const m = /boundary=(?:"([^"]+)"|([^;]+))/i.exec(ctype);
  if (!m) return sendJson(res, 400, { error: 'no-boundary' });
  const boundary = (m[1] || m[2]).trim();
  let body;
  try { body = await readBuffer(req, MAX_UPLOAD); }
  catch { return sendJson(res, 413, { error: 'too-large' }); }
  let parsed;
  try { parsed = parseMultipart(body, boundary); }
  catch { return sendJson(res, 400, { error: 'bad-multipart' }); }
  const saved = [];
  for (const f of parsed.files) {
    if (!/^image\//i.test(f.mime)) continue;
    if (f.data.length === 0 || f.data.length > MAX_FILE) continue;
    const name = safeFilename(f.filename);
    const dest = path.join(CATALOG_DIR, slug, name);
    if (!path.resolve(dest).startsWith(path.resolve(CATALOG_DIR))) continue;
    await fsp.writeFile(dest, f.data);
    saved.push({
      file: name,
      url:  `/assets/img/catalogo/${slug}/${encodeURIComponent(name)}`,
      size: f.data.length,
    });
  }
  sendJson(res, 200, { ok: true, files: saved });
}
async function handleDelete(req, res, url) {
  if (!isAuthed(parseCookies(req)[COOKIE])) return sendJson(res, 401, { error: 'auth-required' });
  const slug = url.searchParams.get('categoria');
  const file = url.searchParams.get('file') || '';
  if (!CATEGORY_SLUGS.has(slug)) return sendJson(res, 400, { error: 'invalid-category' });
  if (!/^[\w.\-]+$/.test(file) || file.includes('..')) {
    return sendJson(res, 400, { error: 'invalid-filename' });
  }
  const fp = path.resolve(CATALOG_DIR, slug, file);
  if (!fp.startsWith(path.resolve(CATALOG_DIR))) return sendJson(res, 400, { error: 'path-traversal' });
  try { await fsp.unlink(fp); sendJson(res, 200, { ok: true }); }
  catch { sendJson(res, 404, { error: 'not-found' }); }
}

/* ── Server ──────────────────────────────────────────────── */
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const p = url.pathname;
    const m = req.method;

    // API routes
    if (p === '/api/login'    && m === 'POST') return handleLogin(req, res);
    if (p === '/api/logout'   && m === 'POST') return handleLogout(req, res);
    if (p === '/api/me'       && m === 'GET')  return handleMe(req, res);
    if (p === '/api/manifest' && m === 'GET')  return handleManifest(req, res);
    if (p === '/api/upload'   && m === 'POST') return handleUpload(req, res, url);
    if (p === '/api/image'    && m === 'DELETE') return handleDelete(req, res, url);
    if (p.startsWith('/api/')) return sendJson(res, 404, { error: 'not-found' });

    // Static
    if (m === 'GET' || m === 'HEAD') return serveStatic(req, res, p);

    send(res, 405, 'Method Not Allowed');
  } catch (e) {
    console.error(e);
    if (!res.headersSent) send(res, 500, 'Internal error');
  }
});

server.listen(PORT, () => {
  console.log(`
  ✓ Capiarcos site running

    Site público →  http://localhost:${PORT}/
    Admin        →  http://localhost:${PORT}/admin/
    Password     →  ${ADMIN_PW === 'capiarcos-admin' ? '(default) capiarcos-admin' : '••••• (custom)'}
  `);
});
