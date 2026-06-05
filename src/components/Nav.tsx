'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  visible: { opacity: 1, transition: { duration: 0.5, ease: EASE, when: 'beforeChildren', delayChildren: 0.18, staggerChildren: 0.08 } },
};
const itemV: Variants = {
  hidden: { opacity: 0, y: 34 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } },
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
        className={`nav-toggle${scrolled || open ? ' solid' : ''}${open ? ' is-open' : ''}`}
        aria-label="Menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <motion.span
          className="roll-ico"
          aria-hidden
          animate={{ rotate: open ? 135 : 0 }}
          whileHover={{ rotate: open ? 135 : 30 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <Image src="/assets/img/icon.png" alt="" width={42} height={42} priority />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div className="menu-overlay" variants={overlayV} initial="hidden" animate="visible" exit="hidden">
            <div className="menu-overlay-inner">
              <motion.span className="menu-kicker" variants={itemV}>Capiarcos — Arcos de Valdevez</motion.span>

              <nav className="menu-big">
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
              </nav>

              <motion.div className="menu-foot" variants={itemV}>
                <div className="menu-lang">
                  {langs.map((l) => (
                    <button key={l} className={lang === l ? 'on' : ''} onClick={() => setLang(l)}>{l.toUpperCase()}</button>
                  ))}
                </div>
                <div className="menu-contact">
                  <a href="tel:+351258522978">258 522 978</a>
                  <a href="mailto:patriciacapiarcos@sapo.pt">patriciacapiarcos@sapo.pt</a>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
