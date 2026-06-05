import { NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import path from 'node:path';
import { isAuthed } from '@/lib/auth';
import { CATALOG_DIR, CATEGORY_SLUGS, removeTitle } from '@/lib/catalog';

export async function DELETE(req: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'auth-required' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('categoria') || '';
  const file = searchParams.get('file') || '';

  if (!CATEGORY_SLUGS.has(slug)) {
    return NextResponse.json({ error: 'invalid-category' }, { status: 400 });
  }
  if (!/^[\w.\-]+$/.test(file) || file.includes('..')) {
    return NextResponse.json({ error: 'invalid-filename' }, { status: 400 });
  }

  const fp = path.resolve(CATALOG_DIR, slug, file);
  if (!fp.startsWith(path.resolve(CATALOG_DIR))) {
    return NextResponse.json({ error: 'path-traversal' }, { status: 400 });
  }

  try {
    await fs.unlink(fp);
    await removeTitle(slug, file);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'not-found' }, { status: 404 });
  }
}
