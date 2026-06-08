import 'server-only';
import fs from 'node:fs/promises';
import fssync from 'node:fs';
import path from 'node:path';

export type Category = { slug: string; label: string; label_en: string; label_fr: string };

/** Seed categories used the first time (when categories.json doesn't exist yet). */
export const DEFAULT_CATEGORIES: Category[] = [
  { slug: 'cozinhas',       label: 'Cozinhas',       label_en: 'Kitchens',     label_fr: 'Cuisines' },
  { slug: 'roupeiros',      label: 'Roupeiros',      label_en: 'Wardrobes',    label_fr: 'Dressings' },
  { slug: 'salas',          label: 'Salas',          label_en: 'Living rooms', label_fr: 'Salons' },
  { slug: 'quartos',        label: 'Quartos',        label_en: 'Bedrooms',     label_fr: 'Chambres' },
  { slug: 'casas-de-banho', label: 'Casas de Banho', label_en: 'Bathrooms',    label_fr: 'Salles de bain' },
  { slug: 'pavimentos',     label: 'Pavimentos',     label_en: 'Flooring',     label_fr: 'Parquets' },
  { slug: 'portas',         label: 'Portas',         label_en: 'Doors',        label_fr: 'Portes' },
  { slug: 'escadas',        label: 'Escadas',        label_en: 'Stairs',       label_fr: 'Escaliers' },
];

export const CATALOG_DIR = path.join(process.cwd(), 'public', 'assets', 'img', 'catalogo');
const CATEGORIES_FILE = path.join(CATALOG_DIR, 'categories.json');
const TITLES_FILE = path.join(CATALOG_DIR, 'titles.json');
const IMG_RE = /\.(jpe?g|png|webp|gif|avif)$/i;

function mkdirp(p: string) {
  fssync.mkdirSync(p, { recursive: true });
}

/* ---------------------------------------------------------------- categories */

export async function readCategories(): Promise<Category[]> {
  try {
    const raw = JSON.parse(await fs.readFile(CATEGORIES_FILE, 'utf8'));
    if (Array.isArray(raw) && raw.length) {
      return raw
        .filter((c) => c && typeof c.slug === 'string')
        .map((c) => ({
          slug: c.slug,
          label: c.label || c.slug,
          label_en: c.label_en || c.label || c.slug,
          label_fr: c.label_fr || c.label || c.slug,
        }));
    }
  } catch {
    /* missing/corrupt → seed below */
  }
  await writeCategories(DEFAULT_CATEGORIES);
  return DEFAULT_CATEGORIES;
}

export async function writeCategories(cats: Category[]): Promise<void> {
  mkdirp(CATALOG_DIR);
  await fs.writeFile(CATEGORIES_FILE, JSON.stringify(cats, null, 2), 'utf8');
}

export async function categorySlugSet(): Promise<Set<string>> {
  return new Set((await readCategories()).map((c) => c.slug));
}

export async function isValidSlug(slug: string): Promise<boolean> {
  return (await categorySlugSet()).has(slug);
}

/** Ensure every category folder exists. */
export async function ensureDirs(): Promise<void> {
  const cats = await readCategories();
  mkdirp(CATALOG_DIR);
  for (const c of cats) mkdirp(path.join(CATALOG_DIR, c.slug));
}

export function slugify(s: string): string {
  return (
    s
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'categoria'
  );
}

export async function uniqueSlug(base: string): Promise<string> {
  const existing = await categorySlugSet();
  const root = slugify(base);
  if (!existing.has(root)) return root;
  let n = 2;
  while (existing.has(`${root}-${n}`)) n++;
  return `${root}-${n}`;
}

/** Remove a category, its image folder and any titles attached to it. */
export async function deleteCategory(slug: string): Promise<void> {
  const cats = await readCategories();
  await writeCategories(cats.filter((c) => c.slug !== slug));
  try {
    await fs.rm(path.join(CATALOG_DIR, slug), { recursive: true, force: true });
  } catch {
    /* ignore */
  }
  const titles = await readTitles();
  let changed = false;
  for (const key of Object.keys(titles)) {
    if (key.startsWith(`${slug}/`)) {
      delete titles[key];
      changed = true;
    }
  }
  if (changed) await writeTitles(titles);
}

/* -------------------------------------------------------------------- titles */

export type ManifestItem = { file: string; url: string; mtime: number; title: string };
export type Manifest = { categories: Category[]; items: Record<string, ManifestItem[]> };

/** title store: { "slug/filename.jpg": "Title" } */
export async function readTitles(): Promise<Record<string, string>> {
  try {
    return JSON.parse(await fs.readFile(TITLES_FILE, 'utf8'));
  } catch {
    return {};
  }
}

export async function writeTitles(map: Record<string, string>): Promise<void> {
  mkdirp(CATALOG_DIR);
  await fs.writeFile(TITLES_FILE, JSON.stringify(map, null, 2), 'utf8');
}

export async function setTitle(slug: string, file: string, title: string): Promise<void> {
  const map = await readTitles();
  map[`${slug}/${file}`] = title;
  await writeTitles(map);
}

export async function removeTitle(slug: string, file: string): Promise<void> {
  const map = await readTitles();
  delete map[`${slug}/${file}`];
  await writeTitles(map);
}

/* ------------------------------------------------------------------ manifest */

export async function readManifest(): Promise<Manifest> {
  const [categories, titles] = await Promise.all([readCategories(), readTitles()]);
  const items: Record<string, ManifestItem[]> = {};
  for (const c of categories) {
    const dir = path.join(CATALOG_DIR, c.slug);
    try {
      const names = (await fs.readdir(dir)).filter((f) => IMG_RE.test(f));
      const stats = await Promise.all(
        names.map(async (f) => {
          const st = await fs.stat(path.join(dir, f));
          return {
            file: f,
            url: `/api/image?categoria=${c.slug}&file=${encodeURIComponent(f)}`,
            mtime: st.mtimeMs,
            title: titles[`${c.slug}/${f}`] || '',
          };
        }),
      );
      stats.sort((a, b) => b.mtime - a.mtime);
      items[c.slug] = stats;
    } catch {
      items[c.slug] = [];
    }
  }
  return { categories, items };
}
