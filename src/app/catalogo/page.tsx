'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { useLang } from '@/lib/i18n';
import { EASE } from '@/components/Reveal';

type Category = { slug: string; label: string; label_en: string; label_fr: string };
type Item = { file: string; url: string; mtime: number; title?: string };
type Manifest = { categories: Category[]; items: Record<string, Item[]> };

export default function Catalogo() {
  const { t, lang } = useLang();
  const [data, setData] = useState<Manifest>({ categories: [], items: {} });
  const [filter, setFilter] = useState('all');
  const [loaded, setLoaded] = useState(false);
  const [active, setActive] = useState<{ item: Item; label: string } | null>(null);

  useEffect(() => {
    fetch('/api/manifest', { cache: 'no-store' })
      .then((r) => r.json())
      .then((m: Manifest) => setData(m))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    document.body.style.overflow = active ? 'hidden' : '';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setActive(null); };
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [active]);

  const labelOf = (c: Category) => (lang === 'en' ? c.label_en : lang === 'fr' ? c.label_fr : c.label);

  const flat = useMemo(() => {
    const out: { item: Item; slug: string; label: string }[] = [];
    for (const c of data.categories) {
      for (const it of data.items[c.slug] || []) out.push({ item: it, slug: c.slug, label: labelOf(c) });
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, lang]);

  const activeCats = data.categories.filter((c) => (data.items[c.slug] || []).length);
  const shown = flat.filter((f) => filter === 'all' || f.slug === filter);

  return (
    <main>
      <header className="page-header page-header--compact">
        <div className="wrap">
          <div className="page-crumbs"><Link href="/">Home</Link> / <span>{t.catalogo.crumb}</span></div>
        </div>
      </header>

      <section style={{ background: 'var(--white)', paddingTop: '2rem' }}>
        <div className="wrap">
          <div className="cat-layout">
            {activeCats.length > 0 && (
              <aside className="cat-filters">
                <button className={`cat-filter${filter === 'all' ? ' on' : ''}`} onClick={() => setFilter('all')}>
                  <span className="cat-filter-name">{t.catalogo.filter_all}</span>
                  <span className="cat-filter-n">{flat.length}</span>
                </button>
                {activeCats.map((c) => (
                  <button key={c.slug} className={`cat-filter${filter === c.slug ? ' on' : ''}`} onClick={() => setFilter(c.slug)}>
                    <span className="cat-filter-name">{labelOf(c)}</span>
                    <span className="cat-filter-n">{(data.items[c.slug] || []).length}</span>
                  </button>
                ))}
              </aside>
            )}

            <div className="gal-grid">
              <AnimatePresence mode="popLayout">
                {shown.map(({ item, label, slug }, i) => (
                  <motion.div
                    key={`${slug}/${item.file}`}
                    className="gi"
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.4, ease: EASE, delay: (i % 6) * 0.04 }}
                    onClick={() => setActive({ item, label })}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="img" src={item.url} alt={item.title || label} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    <div className="gi-ov">
                      <span className="gi-cat">{label}</span>
                      {item.title && <span className="gi-title">{item.title}</span>}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {loaded && flat.length === 0 && (
            <p className="gal-empty" style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--muted)', fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: '1.15rem' }}>
              {t.catalogo.empty}
            </p>
          )}
        </div>
      </section>

      <AnimatePresence>
        {active && (
          <motion.div
            className="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            onClick={() => setActive(null)}
          >
            <button className="lightbox-close" onClick={() => setActive(null)} aria-label="Fechar">✕</button>
            <motion.figure
              className="lightbox-inner"
              initial={{ opacity: 0, scale: 0.9, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 14 }}
              transition={{ duration: 0.45, ease: EASE }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={active.item.url} alt={active.item.title || active.label} />
              <figcaption className="lightbox-cap">
                <span className="lightbox-cat">{active.label}</span>
                {active.item.title && <span className="lightbox-title">{active.item.title}</span>}
              </figcaption>
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
