'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useLang } from '@/lib/i18n';
import { EASE } from '@/components/Reveal';

export default function NotFound() {
  const { t } = useLang();
  return (
    <main className="nf-main">
      <motion.div className="nf-inner" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE }}>
        <div className="nf-code">404</div>
        <span className="nf-tag">{t.nf404.tag}</span>
        <h1 className="nf-title">{t.nf404.title}</h1>
        <p className="nf-sub">{t.nf404.sub}</p>
        <div className="nf-actions">
          <Link href="/" className="btn btn-primary">{t.nf404.cta_home}</Link>
          <Link href="/catalogo" className="btn btn-ghost">{t.nf404.cta_cat}</Link>
        </div>
      </motion.div>
    </main>
  );
}
