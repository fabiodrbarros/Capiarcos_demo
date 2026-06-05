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

const panelV: Variants = {
  hidden: {
    clipPath: 'inset(0% 0% 0% 100%)',
    transition: { duration: 0.45, ease: EASE, when: 'afterChildren' },
  },
  visible: {
    clipPath: 'inset(0% 0% 0% 0%)',
    transition: {
      duration: 0.5,
      ease: EASE,
      when: 'beforeChildren',
      delayChildren: 0.12,
      staggerChildren: 0.07,
      staggerDirection: -1, // rightmost item reveals first
    },
  },
};

const itemV: Variants = {
  hidden: { opacity: 0, x: 26 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.45, ease: EASE } },
};

export default function Nav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname() || '/';
  const { t, lang, setLang } = useLang();

  const hidden = pathname.startsWith('/capi-gest-admin');

  useEffect(() => {
    // Menu does NOT lock scroll — the site stays interactive while it is open.
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const langs: Lang[] = ['pt', 'en', 'fr'];

  if (hidden) return null;

  return (
    <>
      <button
        className="nav-toggle"
        aria-label="Menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <motion.span
          className="roll-ico"
          aria-hidden
          animate={{ rotate: open ? 180 : 0 }}
          whileHover={{ rotate: open ? 180 : 35 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <Image src="/assets/img/icon.png" alt="" width={42} height={42} priority />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.header
            className="nav-panel"
            variants={panelV}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
              <div className="nav-inner">
                <nav className="nav-links">
                  {LINKS.map((l) => {
                    const active = pathname === l.href;
                    return (
                      <motion.div key={l.href} variants={itemV}>
                        <Link
                          href={l.href}
                          className={`nav-link${active ? ' active' : ''}`}
                          onClick={() => setOpen(false)}
                        >
                          {t.nav[l.key]}
                        </Link>
                      </motion.div>
                    );
                  })}
                </nav>

                <div className="nav-right">
                  <motion.div variants={itemV} className="nav-lang">
                    {langs.map((l) => (
                      <button
                        key={l}
                        className={lang === l ? 'on' : ''}
                        onClick={() => setLang(l)}
                      >
                        {l.toUpperCase()}
                      </button>
                    ))}
                  </motion.div>
                  <motion.div variants={itemV}>
                    <Link href="/contactos" className="btn btn-gold nav-cta" onClick={() => setOpen(false)}>
                      {t.nav.quote}
                    </Link>
                  </motion.div>
                </div>
              </div>
          </motion.header>
        )}
      </AnimatePresence>
    </>
  );
}
