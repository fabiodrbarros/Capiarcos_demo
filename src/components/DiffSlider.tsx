'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';

const EASE = [0.16, 1, 0.3, 1] as const;

export function DiffSlider({ items }: { items: { t: string; d: string }[] }) {
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
            <span className="slide-num">{String(i + 1).padStart(2, '0')}</span>
            <div>
              <h3 className="slide-t">{d.t}</h3>
              <p className="slide-d">{d.d}</p>
            </div>
          </motion.article>
        ))}
      </div>

      <div className="wrap">
        <div className="slider-nav">
          <button onClick={() => go(-1)} aria-label="Anterior">
            <svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7" /></svg>
          </button>
          <button onClick={() => go(1)} aria-label="Seguinte">
            <svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
