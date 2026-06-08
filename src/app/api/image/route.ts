import { NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import path from 'node:path';
import { isAuthed } from '@/lib/auth';
import { CATALOG_DIR, isValidSlug, removeTitle } from '@/lib/catalog';

export const dynamic = 'force-dynamic';

const MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.avif': 'image/avif',
};

/** Serve a catalog image from disk (Next standalone doesn't serve runtime-written public files). */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('categoria') || '';
  const file = searchParams.get('file') || '';

  if (!(await isValidSlug(slug))) {
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
    const buf = await fs.readFile(fp);
    const type = MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        'Content-Type': type,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return new NextResponse('Not found', { status: 404 });
  }
}

export async function DELETE(req: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'auth-required' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('categoria') || '';
  const file = searchParams.get('file') || '';

  if (!(await isValidSlug(slug))) {
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
