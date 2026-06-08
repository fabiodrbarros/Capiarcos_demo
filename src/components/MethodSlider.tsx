'use client';

import { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Rich } from '@/lib/i18n';

const EASE = [0.16, 1, 0.3, 1] as const;

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};
const drawLine: Variants = {
  hidden: { scaleY: 0 },
  show: { scaleY: 1, transition: { duration: 0.9, ease: EASE } },
};

type Card = { name: string; text: string };

export function MethodSlider({ eyebrow, title, cards }: { eyebrow: string; title: string; cards: Card[] }) {
  const [i, setI] = useState(0);
  const total = cards.length;
  const go = (d: number) => setI((p) => (p + d + total) % total);
  const c = cards[i];

  return (
    <motion.div
      className="method-inner"
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '0px 0px -15% 0px' }}
    >
      {/* LEFT — content */}
      <motion.div className="method-content" variants={fadeUp}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            <span className="method-num">{String(i + 1).padStart(2, '0')} <i>/ {String(total).padStart(2, '0')}</i></span>
            <p className="method-text">{c.text}</p>
            <span className="method-name">{c.name}</span>
          </motion.div>
        </AnimatePresence>

        <div className="method-nav slider-nav">
          <button onClick={() => go(-1)} aria-label="Anterior"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7" /></svg></button>
          <button onClick={() => go(1)} aria-label="Seguinte"><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg></button>
        </div>
      </motion.div>

      {/* RIGHT — title */}
      <div className="method-right">
        <motion.div className="method-divider" variants={drawLine} style={{ originY: 0 }} />
        <div className="method-left">
          <motion.span className="method-eyebrow" variants={fadeUp}>{eyebrow}</motion.span>
          <motion.div variants={fadeUp}>
            <Rich as="h2" className="method-title" html={title} />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
