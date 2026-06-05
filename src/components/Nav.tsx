'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useLang, type Lang } from '@/lib/i18n';

const LINKS = [
  { href: '/', key: 'home' },
  { href: '/empresa', key: 'empresa' },
  { href: '/catalogo', key: 'catalogo' },
  { href: '/contactos', key: 'contactos' },
] as const;

const EASE = [0.16, 1, 0.3, 1] as const;

const overlayV: Variants = {
  hidden: { opacity: 0, transition: { duration: 0.35, ease: EASE, when: 'afterChildren', staggerChildren: 0.04, staggerDirection: -1 } },
  visible: { opacity: 1, transition: { duration: 0.45, ease: EASE, when: 'beforeChildren', delayChildren: 0.12, staggerChildren: 0.07 } },
};
const itemV: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname() || '/';
  const { t, lang, setLang } = useLang();

  const hidden = pathname.startsWith('/capi-gest-admin');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle('menu-open', open);
  }, [open]);

  const langs: Lang[] = ['pt', 'en', 'fr'];

  if (hidden) return null;

  return (
    <>
      <button
        className={`nav-toggle${scrolled && !open ? ' solid' : ''}${open ? ' is-open' : ''}`}
        aria-label="Menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="burger" aria-hidden>
          <span />
          <span />
          <span />
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div className="menu-overlay" variants={overlayV} initial="hidden" animate="visible" exit="hidden">
            <div className="menu-grid">
              {/* Column 1 — brand */}
              <motion.div className="menu-col menu-col--brand" variants={itemV}>
                <span className="menu-kicker">Capiarcos</span>
                <p className="menu-tagline">Carpintaria por medida desde 1998. Fábrica própria em Arcos de Valdevez.</p>
              </motion.div>

              {/* Column 2 — navigation */}
              <nav className="menu-col menu-col--nav">
                <div className="menu-big">
                  {LINKS.map((l, i) => {
                    const active = pathname === l.href;
                    return (
                      <motion.div key={l.href} className="menu-big-item" variants={itemV}>
                        <Link href={l.href} className={active ? 'active' : ''} onClick={() => setOpen(false)}>
                          <span className="menu-num">{String(i + 1).padStart(2, '0')}</span>
                          <span className="menu-label">{t.nav[l.key]}</span>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </nav>

              {/* Column 3 — contacts + language */}
              <motion.div className="menu-col menu-col--info" variants={itemV}>
                <div className="menu-info-block">
                  <span className="menu-info-h">{t.ft.contacto}</span>
                  <a href="tel:+351258522978">258 522 978</a>
                  <a href="tel:+351935229788">935 229 788</a>
                  <a href="mailto:patriciacapiarcos@sapo.pt">patriciacapiarcos@sapo.pt</a>
                  <p className="menu-addr">Zona Industrial de Mogueiras – Tabaço<br />4970-685 Arcos de Valdevez</p>
                </div>
                <div className="menu-lang">
                  {langs.map((l) => (
                    <button key={l} className={lang === l ? 'on' : ''} onClick={() => setLang(l)}>{l.toUpperCase()}</button>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
