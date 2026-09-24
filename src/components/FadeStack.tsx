'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent, type MotionValue } from 'framer-motion';
import { piecewise } from '@/lib/linkedOpacity';

/* ── Fade stack ────────────────────────────────────────────────────────
   Cards that share one stage and cross-fade into each other as you
   scroll: the one leaving fades and drifts up while the next one rises
   into its place. Nothing is ever covered up.

   Below the breakpoint the stage is switched off in CSS and the cards
   simply stack down the page.                                          */

/** Where the first card is fully in, as this section's own progress: the
    stretch before it is a hand-over, jumped rather than scrubbed. */
export function fadeStackIn(n: number) {
  return (1 / n) * 0.3;
}

/** How wide card `i`'s fade is, either side of its boundary. */
function halfOf(i: number, n: number) {
  return (1 / n) * (i === 0 ? 0.3 : 0.16);
}

/** Every crossing between two cards, as [from, to] in this section's own
    progress: from the moment the card leaving starts to go to the moment
    it is gone and the next one is in. A crossing is one move, so it is
    jumped rather than scrubbed — half of it is two half-cards. */
export function fadeStackCrossings(n: number): [number, number][] {
  const out: [number, number][] = [];
  for (let i = 0; i < n - 1; i++) {
    const half = halfOf(i, n);
    const end = (i + 1) / n;
    out.push([end - half, end + half]);
  }
  return out;
}

function Card({
  i,
  n,
  p,
  active,
  children,
}: {
  i: number;
  n: number;
  p: MotionValue<number>;
  active: number;
  children: ReactNode;
}) {
  const w = 1 / n;
  const start = i * w;
  const end = start + w;
  /* half a fade either side of the boundary, so the card leaving and the
     card arriving cross at the same moment instead of leaving a gap */
  /* the first card opens wider, so it crosses with the section above */
  const half = halfOf(i, n);
  const last = i === n - 1;

  const ref = useRef<HTMLDivElement>(null);
  const apply = useCallback((v: number) => {
    const stops = [start - half, start + half, end - half, end + half];
    const outs = [0, 1, 1, last ? 1 : 0];
    if (ref.current) ref.current.style.opacity = String(piecewise(v, stops, outs));
  }, [start, end, half, last]);
  useMotionValueEvent(p, 'change', apply);
  useEffect(() => { apply(p.get()); }, [apply, p]);

  const y = useTransform(
    p,
    [start - half, start + half, end - half, end + half],
    [54, 0, 0, last ? 0 : -44],
  );

  return (
    <motion.div
      ref={ref}
      className={`fs-card${i === active ? ' is-on' : ''}`}
      style={{ y }}
      aria-hidden={i !== active}
    >
      {children}
    </motion.div>
  );
}

export function FadeStack({ items }: { items: ReactNode[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const n = items.length;

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const i = Math.min(n - 1, Math.max(0, Math.floor(v * n + 0.15)));
    if (i !== active) setActive(i);
  });

  /* one card still needs a stretch of scroll to arrive in */
  const height = n === 1 ? 170 : n * 100;

  return (
    <div className="fs" ref={ref} style={{ height: `${height}vh` }}>
      <div className="fs-sticky">
        {items.map((it, i) => (
          <Card key={i} i={i} n={n} p={scrollYProgress} active={active}>
            {it}
          </Card>
        ))}
      </div>
    </div>
  );
}
