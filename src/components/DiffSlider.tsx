'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';

const EASE = [0.16, 1, 0.3, 1] as const;

type Props = {
  items: { t: string; d: string }[];
  eyebrow?: string;
  title?: string;
};

export function DiffSlider({ items, eyebrow, title }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const go = (dir: number) => {
    const el = ref.current;
    if (!el) return;
    const card = el.querySelector('.slide-card') as HTMLElement | null;
    const amt = card ? card.offsetWidth + 20 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * amt, behavior: 'smooth' });
  };

  return (
    <div className="slider">
      {(eyebrow || title) && (
        <div className="wrap slider-head">
          <div className="slider-head-text">
            {eyebrow && <span className="slider-eyebrow">{eyebrow}</span>}
            {title && <h2 className="h2" style={{ margin: 0 }}>{title}</h2>}
          </div>
          <div className="slider-nav">
            <button onClick={() => go(-1)} aria-label="Anterior">
              <svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7" /></svg>
            </button>
            <button onClick={() => go(1)} aria-label="Seguinte">
              <svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      )}

      <div className="slider-track" ref={ref}>
        {items.map((d, i) => (
          <motion.article
            className="slide-card"
            key={d.t}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '0px 0px -40px 0px' }}
            transition={{ duration: 0.5, ease: EASE, delay: Math.min(i, 4) * 0.06 }}
          >
            <span className="slide-num">{String(i + 1).padStart(2, '0')} <i>/ {String(items.length).padStart(2, '0')}</i></span>
            <div className="slide-body">
              <h3 className="slide-t">{d.t}</h3>
              <p className="slide-d">{d.d}</p>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}
