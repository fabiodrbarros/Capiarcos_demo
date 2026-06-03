import 'server-only';
import fs from 'node:fs/promises';
import fssync from 'node:fs';
import path from 'node:path';

export type Category = { slug: string; label: string; label_en: string; label_fr: string };

export const CATEGORIES: Category[] = [
  { slug: 'cozinhas',       label: 'Cozinhas',       label_en: 'Kitchens',     label_fr: 'Cuisines' },
  { slug: 'roupeiros',      label: 'Roupeiros',      label_en: 'Wardrobes',    label_fr: 'Dressings' },
  { slug: 'salas',          label: 'Salas',          label_en: 'Living rooms', label_fr: 'Salons' },
  { slug: 'quartos',        label: 'Quartos',        label_en: 'Bedrooms',     label_fr: 'Chambres' },
  { slug: 'casas-de-banho', label: 'Casas de Banho', label_en: 'Bathrooms',    label_fr: 'Salles de bain' },
  { slug: 'pavimentos',     label: 'Pavimentos',     label_en: 'Flooring',     label_fr: 'Parquets' },
  { slug: 'portas',         label: 'Portas',         label_en: 'Doors',        label_fr: 'Portes' },
  { slug: 'escadas',        label: 'Escadas',        label_en: 'Stairs',       label_fr: 'Escaliers' },
];

export const CATEGORY_SLUGS = new Set(CATEGORIES.map((c) => c.slug));

export const CATALOG_DIR = path.join(process.cwd(), 'public', 'assets', 'img', 'catalogo');

/** Ensure all category folders exist (called from API routes). */
export function ensureDirs() {
  for (const c of CATEGORIES) {
    fssync.mkdirSync(path.join(CATALOG_DIR, c.slug), { recursive: true });
  }
}

export type ManifestItem = { file: string; url: string; mtime: number };
export type Manifest = { categories: Category[]; items: Record<string, ManifestItem[]> };

const IMG_RE = /\.(jpe?g|png|webp|gif|avif)$/i;

export async function readManifest(): Promise<Manifest> {
  const items: Record<string, ManifestItem[]> = {};
  for (const c of CATEGORIES) {
    const dir = path.join(CATALOG_DIR, c.slug);
    try {
      const names = (await fs.readdir(dir)).filter((f) => IMG_RE.test(f));
      const stats = await Promise.all(
        names.map(async (f) => {
          const st = await fs.stat(path.join(dir, f));
          return {
            file: f,
            url: `/assets/img/catalogo/${c.slug}/${encodeURIComponent(f)}`,
            mtime: st.mtimeMs,
          };
        }),
      );
      stats.sort((a, b) => b.mtime - a.mtime);
      items[c.slug] = stats;
    } catch {
      items[c.slug] = [];
    }
  }
  return { categories: CATEGORIES, items };
}
