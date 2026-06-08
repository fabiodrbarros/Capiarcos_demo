import { NextResponse } from 'next/server';
import { isAuthed } from '@/lib/auth';
import {
  readCategories,
  writeCategories,
  ensureDirs,
  uniqueSlug,
  deleteCategory,
  isValidSlug,
  type Category,
} from '@/lib/catalog';
import { translateLabels } from '@/lib/translate';

export const dynamic = 'force-dynamic';

/** Public: list categories. */
export async function GET() {
  return NextResponse.json({ categories: await readCategories() });
}

/** Create a category (auto-translates EN/FR from the PT name). */
export async function POST(req: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'auth-required' }, { status: 401 });
  }

  let body: { label?: string; label_en?: string; label_fr?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'bad-body' }, { status: 400 });
  }

  const pt = (body.label || '').trim();
  if (!pt) return NextResponse.json({ error: 'missing-name' }, { status: 400 });

  const labels = await translateLabels(pt, body.label_en, body.label_fr);
  const slug = await uniqueSlug(pt);
  const cat: Category = { slug, ...labels };

  const cats = await readCategories();
  cats.push(cat);
  await writeCategories(cats);
  await ensureDirs();

  return NextResponse.json({ ok: true, category: cat });
}

/** Edit a category's labels (slug stays fixed to keep image paths stable). */
export async function PATCH(req: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'auth-required' }, { status: 401 });
  }

  let body: { slug?: string; label?: string; label_en?: string; label_fr?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'bad-body' }, { status: 400 });
  }

  const slug = (body.slug || '').trim();
  const pt = (body.label || '').trim();
  if (!slug || !pt) return NextResponse.json({ error: 'missing-fields' }, { status: 400 });
  if (!(await isValidSlug(slug))) {
    return NextResponse.json({ error: 'not-found' }, { status: 404 });
  }

  const cats = await readCategories();
  const next = cats.map((c) =>
    c.slug === slug
      ? {
          slug,
          label: pt,
          label_en: (body.label_en || '').trim() || c.label_en || pt,
          label_fr: (body.label_fr || '').trim() || c.label_fr || pt,
        }
      : c,
  );
  await writeCategories(next);

  return NextResponse.json({ ok: true, category: next.find((c) => c.slug === slug) });
}

/** Delete a category (removes its folder, images and titles). */
export async function DELETE(req: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'auth-required' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug') || '';
  if (!(await isValidSlug(slug))) {
    return NextResponse.json({ error: 'not-found' }, { status: 404 });
  }

  await deleteCategory(slug);
  return NextResponse.json({ ok: true });
}
