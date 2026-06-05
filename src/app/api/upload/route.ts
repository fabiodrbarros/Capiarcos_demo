import { NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { isAuthed } from '@/lib/auth';
import { CATALOG_DIR, CATEGORY_SLUGS, ensureDirs, readTitles, writeTitles } from '@/lib/catalog';

const MAX_FILE = 25 * 1024 * 1024; // 25 MB

function safeFilename(orig: string): string {
  const base = (orig || 'imagem.jpg').split(/[/\\]/).pop() || 'imagem.jpg';
  const safe = base.replace(/[^\w.\-]+/g, '_').slice(-80);
  const ext = path.extname(safe) || '.jpg';
  const stem = path.basename(safe, ext).slice(0, 40) || 'imagem';
  const stamp = Date.now().toString(36) + '-' + crypto.randomBytes(3).toString('hex');
  return `${stem}-${stamp}${ext}`;
}

export async function POST(req: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'auth-required' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('categoria') || '';
  if (!CATEGORY_SLUGS.has(slug)) {
    return NextResponse.json({ error: 'invalid-category' }, { status: 400 });
  }

  ensureDirs();

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: 'bad-form' }, { status: 400 });
  }

  const title = (form.get('titulo') as string | null)?.trim() || '';
  const files = form.getAll('files').filter((f): f is File => f instanceof File);
  const saved: { file: string; url: string; size: number }[] = [];
  const titles = await readTitles();

  for (const f of files) {
    if (!/^image\//i.test(f.type)) continue;
    if (f.size === 0 || f.size > MAX_FILE) continue;
    const name = safeFilename(f.name);
    const dest = path.join(CATALOG_DIR, slug, name);
    if (!path.resolve(dest).startsWith(path.resolve(CATALOG_DIR))) continue;
    const buf = Buffer.from(await f.arrayBuffer());
    await fs.writeFile(dest, buf);
    if (title) titles[`${slug}/${name}`] = title;
    saved.push({ file: name, url: `/assets/img/catalogo/${slug}/${encodeURIComponent(name)}`, size: f.size });
  }

  if (title) await writeTitles(titles);

  return NextResponse.json({ ok: true, files: saved });
}
