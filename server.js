/* ═══════════════════════════════════════════════════════════════
   CAPIARCOS — Site + Admin Server
   Serves the static site and exposes:
     · GET    /api/manifest             (public — drives the catalog)
     · POST   /api/login                (password → session cookie)
     · POST   /api/logout
     · GET    /api/me
     · POST   /api/upload?categoria=X   (multipart, auth required)
     · DELETE /api/image?categoria=X&file=Y  (auth required)
═══════════════════════════════════════════════════════════════ */

import express from 'express';
import multer  from 'multer';
import fs      from 'node:fs';
import path    from 'node:path';
import crypto  from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT        = __dirname;
const CATALOG_DIR = path.join(ROOT, 'assets', 'img', 'catalogo');
const PORT        = process.env.PORT           || 3000;
const ADMIN_PW    = process.env.ADMIN_PASSWORD || 'capiarcos-admin';
const COOKIE      = 'cap_admin';
const SESSION_TTL = 1000 * 60 * 60 * 24 * 7;   // 7 days

// ── Categories (slug → label). Single source of truth for both
//    the admin sidebar and the public catalog filters. ─────────
const CATEGORIES = [
  { slug: 'cozinhas',       label: 'Cozinhas',       label_en: 'Kitchens',        label_fr: 'Cuisines'      },
  { slug: 'roupeiros',      label: 'Roupeiros',      label_en: 'Wardrobes',       label_fr: 'Dressings'     },
  { slug: 'salas',          label: 'Salas',          label_en: 'Living rooms',    label_fr: 'Salons'        },
  { slug: 'quartos',        label: 'Quartos',        label_en: 'Bedrooms',        label_fr: 'Chambres'      },
  { slug: 'casas-de-banho', label: 'Casas de Banho', label_en: 'Bathrooms',       label_fr: 'Salles de bain'},
  { slug: 'pavimentos',     label: 'Pavimentos',     label_en: 'Flooring',        label_fr: 'Parquets'      },
  { slug: 'portas',         label: 'Portas',         label_en: 'Doors',           label_fr: 'Portes'        },
  { slug: 'escadas',        label: 'Escadas',        label_en: 'Stairs',          label_fr: 'Escaliers'     },
];

// Ensure category folders exist
for (const c of CATEGORIES) {
  fs.mkdirSync(path.join(CATALOG_DIR, c.slug), { recursive: true });
}

// ── Session store (in-memory). Restart = re-login. Fine for a
//    single-admin workflow; swap for Redis/SQLite if needed. ──
const sessions = new Map();   // token → expiresAt
function newSession() {
  const tok = crypto.randomBytes(32).toString('hex');
  sessions.set(tok, Date.now() + SESSION_TTL);
  return tok;
}
function isAuthed(tok) {
  if (!tok) return false;
  const exp = sessions.get(tok);
  if (!exp) return false;
  if (exp < Date.now()) { sessions.delete(tok); return false; }
  return true;
}
// Periodic cleanup
setInterval(() => {
  const now = Date.now();
  for (const [t, exp] of sessions) if (exp < now) sessions.delete(t);
}, 60 * 60 * 1000).unref();

// ── App ──────────────────────────────────────────────────────
const app = express();
app.use(express.json());

// Cookie parser (tiny inline impl)
app.use((req, _res, next) => {
  const raw = req.headers.cookie || '';
  req.cookies = Object.fromEntries(
    raw.split(';').map(c => c.trim().split('=')).filter(p => p[0])
  );
  next();
});

function setCookie(res, name, value, maxAgeSec) {
  const parts = [
    `${name}=${value}`,
    'HttpOnly',
    'SameSite=Lax',
    'Path=/',
  ];
  if (maxAgeSec != null) parts.push(`Max-Age=${maxAgeSec}`);
  res.setHeader('Set-Cookie', parts.join('; '));
}

function requireAuth(req, res, next) {
  if (isAuthed(req.cookies[COOKIE])) return next();
  res.status(401).json({ error: 'auth-required' });
}

// ── Auth endpoints ───────────────────────────────────────────
app.post('/api/login', (req, res) => {
  const { password } = req.body || {};
  if (typeof password !== 'string' || password.length === 0) {
    return res.status(400).json({ error: 'password-required' });
  }
  // Constant-time compare
  const a = Buffer.from(password);
  const b = Buffer.from(ADMIN_PW);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return res.status(401).json({ error: 'invalid' });
  }
  const tok = newSession();
  setCookie(res, COOKIE, tok, SESSION_TTL / 1000);
  res.json({ ok: true });
});

app.post('/api/logout', (req, res) => {
  const t = req.cookies[COOKIE];
  if (t) sessions.delete(t);
  setCookie(res, COOKIE, '', 0);
  res.json({ ok: true });
});

app.get('/api/me', (req, res) => {
  res.json({ authed: isAuthed(req.cookies[COOKIE]) });
});

// ── Public manifest (catalog reads this) ─────────────────────
app.get('/api/manifest', (_req, res) => {
  res.set('Cache-Control', 'no-store');
  const items = {};
  for (const c of CATEGORIES) {
    const dir = path.join(CATALOG_DIR, c.slug);
    try {
      const files = fs.readdirSync(dir)
        .filter(f => /\.(jpe?g|png|webp|gif|avif)$/i.test(f))
        .map(f => {
          const st = fs.statSync(path.join(dir, f));
          return { file: f, url: `/assets/img/catalogo/${c.slug}/${encodeURIComponent(f)}`, mtime: st.mtimeMs };
        })
        // Newest first
        .sort((a, b) => b.mtime - a.mtime);
      items[c.slug] = files;
    } catch {
      items[c.slug] = [];
    }
  }
  res.json({ categories: CATEGORIES, items });
});

// ── Uploads ──────────────────────────────────────────────────
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, _file, cb) => {
      const slug = String(req.query.categoria || '');
      const ok = CATEGORIES.find(c => c.slug === slug);
      if (!ok) return cb(new Error('invalid-category'));
      cb(null, path.join(CATALOG_DIR, slug));
    },
    filename: (_req, file, cb) => {
      const stamp = Date.now().toString(36) + '-' + crypto.randomBytes(3).toString('hex');
      const safe  = (file.originalname || 'imagem.jpg').replace(/[^\w.\-]+/g, '_');
      const ext   = path.extname(safe) || '.jpg';
      const base  = path.basename(safe, ext).slice(0, 40) || 'imagem';
      cb(null, `${base}-${stamp}${ext}`);
    },
  }),
  fileFilter: (_req, file, cb) => {
    if (!/^image\//.test(file.mimetype)) return cb(new Error('only-images'));
    cb(null, true);
  },
  limits: { fileSize: 25 * 1024 * 1024, files: 30 }, // 25MB · max 30 per request
});

app.post('/api/upload', requireAuth, (req, res) => {
  upload.array('files', 30)(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message || 'upload-failed' });
    const slug = String(req.query.categoria || '');
    const files = (req.files || []).map(f => ({
      file: f.filename,
      url:  `/assets/img/catalogo/${slug}/${encodeURIComponent(f.filename)}`,
      size: f.size,
    }));
    res.json({ ok: true, files });
  });
});

// ── Delete ───────────────────────────────────────────────────
app.delete('/api/image', requireAuth, (req, res) => {
  const slug = String(req.query.categoria || '');
  const file = String(req.query.file || '');
  if (!CATEGORIES.find(c => c.slug === slug)) {
    return res.status(400).json({ error: 'invalid-category' });
  }
  if (!/^[\w.\-]+$/.test(file) || file.includes('..')) {
    return res.status(400).json({ error: 'invalid-filename' });
  }
  const fp = path.resolve(CATALOG_DIR, slug, file);
  if (!fp.startsWith(path.resolve(CATALOG_DIR))) {
    return res.status(400).json({ error: 'path-traversal' });
  }
  fs.unlink(fp, (err) => {
    if (err) return res.status(404).json({ error: 'not-found' });
    res.json({ ok: true });
  });
});

// ── Static ──────────────────────────────────────────────────
// /admin is the dashboard. Everything else is the public site.
app.use(express.static(ROOT, {
  extensions: ['html'],
  setHeaders(res, fp) {
    // Catalog images can be cached briefly; the manifest is no-store above.
    if (fp.includes(path.join('assets', 'img', 'catalogo'))) {
      res.set('Cache-Control', 'public, max-age=300');
    }
  },
}));

// ── Listen ──────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n  ✓ Capiarcos site running\n`);
  console.log(`    Public site →  http://localhost:${PORT}/`);
  console.log(`    Admin       →  http://localhost:${PORT}/admin/`);
  console.log(`    Password    →  ${ADMIN_PW === 'capiarcos-admin' ? '(default) capiarcos-admin' : '••••••• (custom via ADMIN_PASSWORD)'}\n`);
});
