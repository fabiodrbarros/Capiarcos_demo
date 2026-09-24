'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent, AnimatePresence, type MotionValue } from 'framer-motion';
import { EASE } from '@/components/Reveal';
import { useLinkedOpacity } from '@/lib/linkedOpacity';

/* ── The process ───────────────────────────────────────────────────────
   Same language as the About page: a single line that draws itself, one
   stop at a time. It opens on a growth ring — the log seen from the end —
   and travels to a house: selection, drawing, cutting, assembly,
   installation. One stage speaks at a time, and stages cross in a fade. */

type Step = { t: string; d: string };
type P = { x: number; y: number };

type Geo = {
  viewBox: string;
  pts: P[];
  glyph: number;
  /* where each stop's drawing sits, relative to the line */
  off: P[];
};

/* The line starts at the very left edge, at mid height — the same height
   and width as the line the hero collapses into, so one continues the
   other when the panel opens. */
const WIDE: Geo = {
  /* the line begins and ends at the middle of the first and last drawings:
     the log is where it starts, the house is where it arrives */
  viewBox: '0 0 1000 320',
  pts: [{ x: 52, y: 160 }, { x: 280, y: 104 }, { x: 500, y: 190 }, { x: 720, y: 104 }, { x: 948, y: 160 }],
  glyph: 1.9,
  off: [{ x: 0, y: 0 }, { x: 0, y: -88 }, { x: 0, y: 92 }, { x: 0, y: -88 }, { x: 0, y: 0 }],
};

const NARROW: Geo = {
  viewBox: '0 0 360 560',
  pts: [{ x: 180, y: 48 }, { x: 96, y: 168 }, { x: 264, y: 290 }, { x: 96, y: 412 }, { x: 180, y: 516 }],
  glyph: 1.4,
  /* on the outside of each bend, so the line never runs through them */
  off: [{ x: 0, y: 0 }, { x: -48, y: 0 }, { x: 48, y: 0 }, { x: -48, y: 0 }, { x: 0, y: 0 }],
};

/** A smooth line through every stop (Catmull-Rom → cubic Bézier). */
function smoothPath(pts: P[], t = 0.4) {
  let d = `M${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1 = { x: p1.x + ((p2.x - p0.x) * t) / 2, y: p1.y + ((p2.y - p0.y) * t) / 2 };
    const c2 = { x: p2.x - ((p3.x - p1.x) * t) / 2, y: p2.y - ((p3.y - p1.y) * t) / 2 };
    d += ` C${c1.x} ${c1.y} ${c2.x} ${c2.y} ${p2.x} ${p2.y}`;
  }
  return d;
}

/* ── The five glyphs, each drawn inside a -32…32 box ──────────────────── */
const GLYPHS: { d: string; c?: string }[][] = [
  /* 01 the log, seen from the end */
  [{ d: 'M0 -26 A 26 26 0 1 1 0 26 A 26 26 0 1 1 0 -26' }, { d: 'M0 -16 A 16 16 0 1 1 0 16 A 16 16 0 1 1 0 -16', c: 'ln-soft' }, { d: 'M0 -7 A 7 7 0 1 1 0 7 A 7 7 0 1 1 0 -7' }],
  /* 02 the drawing */
  [{ d: 'M-26 -18 H26 V18 H-26 Z' }, { d: 'M-26 0 H26', c: 'ln-soft' }, { d: 'M-26 -26 H26', c: 'ln-gold' }, { d: 'M-26 -30 V-22 M26 -30 V-22', c: 'ln-gold' }],
  /* 03 the cut */
  [{ d: 'M-30 14 H30' }, { d: 'M0 -20 A 20 20 0 1 1 0 20 A 20 20 0 1 1 0 -20' }, { d: 'M0 -26 V-20 M0 20 V26 M-26 0 H-20 M20 0 H26', c: 'ln-gold' }],
  /* 04 the assembly */
  [{ d: 'M-20 -24 H20 V24 H-20 Z' }, { d: 'M0 -24 V24', c: 'ln-soft' }, { d: 'M-8 -4 V4 M8 -4 V4', c: 'ln-gold' }],
  /* 05 installed at home */
  [{ d: 'M-28 -2 L0 -24 L28 -2' }, { d: 'M-20 -7 V24 H20 V-7' }, { d: 'M-8 24 V6 H8 V24', c: 'ln-gold' }],
];

function Stop({
  i,
  geo,
  p,
  at,
  dwell,
}: {
  i: number;
  geo: Geo;
  p: MotionValue<number>;
  at: number;
  dwell: number;
}) {
  const s = geo.pts[i];
  const o = geo.off[i];
  const glyph = GLYPHS[i] ?? [];

  /* the glyph draws as the line reaches it, then settles back a little */
  const draw = useTransform(p, [at - dwell * 0.18, at + dwell * 0.5], [0, 1]);
  const scale = useTransform(p, [at - dwell * 0.18, at + dwell * 0.5], [0.72, 1]);
  const ref = useLinkedOpacity<SVGGElement>(
    p,
    [at - dwell * 0.2, at + dwell * 0.12, at + dwell, at + dwell * 1.25],
    [0, 1, 1, i === geo.pts.length - 1 ? 1 : 0.34],
  );

  return (
    <g ref={ref}>
      {/* the stop on the line — not at the two ends, where the drawing
          itself is the end of the line */}
      {o.x !== 0 || o.y !== 0 ? <circle cx={s.x} cy={s.y} r={5} className="pl-dot" /> : null}
      <g transform={`translate(${s.x + o.x} ${s.y + o.y}) scale(${geo.glyph})`}>
      {/* no non-scaling-stroke on these paths: inside a scaled group it
          makes the dash pattern of `pathLength` resolve in screen units and
          the drawing comes out in fragments, so the stroke width is set in
          user units instead */}
      <motion.g style={{ scale, transformOrigin: '0px 0px' }}>
        {glyph.map((g, k) => (
          <motion.path key={k} d={g.d} className={g.c ?? 'ln-gold'} style={{ pathLength: draw }} />
        ))}
        </motion.g>
      </g>
    </g>
  );
}

export function ProcessLine({ eyebrow, steps }: { eyebrow: string; steps: Step[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [geo, setGeo] = useState<Geo>(WIDE);
  const [active, setActive] = useState(0);
  const n = Math.min(steps.length, 5);

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  /* a second reading of the same section, for the stretch where it is
     still rising into the screen: that is when the card arrives */
  const { scrollYProgress: enter } = useScroll({ target: ref, offset: ['start end', 'start start'] });

  /* The section is already underway when it arrives: one scroll of the hero
     lands here with the wave formed, the first drawing complete and the
     first stage named. Hence the negative start — the schedule begins
     before the section pins. */
  const START = -0.1;
  const END = 0.72;
  const at = (i: number) => START + (i / (n - 1)) * (END - START);
  const dwell = (END - START) / (n - 1);

  useEffect(() => {
    const pick = () => setGeo(window.innerWidth < 860 ? NARROW : WIDE);
    pick();
    window.addEventListener('resize', pick);
    return () => window.removeEventListener('resize', pick);
  }, []);

  /* the first stretch is already drawn when the card arrives, so it reads
     as the continuation of the line the hero collapsed into */
  const draw = useTransform(scrollYProgress, [START, END], [0.12, 1]);
  /* and the straight line has already bent into its wave by the time the
     section takes the screen */
  const bend = useTransform(enter, [0.88, 0.96], [0, 1]);
  /* step 6 of the hand-over: the card only comes in once the panel above
     has finished opening, and it is in place before the panel goes */
  const wrapRef = useLinkedOpacity<HTMLDivElement>(enter, [0.9, 0.96], [0, 1]);
  const cardRef = useLinkedOpacity<HTMLDivElement>(scrollYProgress, [0.93, 1], [1, 0]);
  const cardY = useTransform(enter, [0.9, 0.98], [16, 0]);

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    let i = 0;
    for (let k = 0; k < n; k++) if (v >= at(k) - dwell * 0.2) i = k;
    if (i !== active) setActive(i);
  });

  const step = steps[active];
  /* the route arrives as a straight line — the very line the hero collapsed
     into — and bends into its wave over the first stretch of the scroll */
  const mid = geo.pts[0].y;
  const d = useTransform(bend, (k) =>
    smoothPath(geo.pts.map((q) => ({ x: q.x, y: mid + (q.y - mid) * k }))),
  );

  return (
    <div className="pl" ref={ref} style={{ height: `${(n + 1) * 100}vh` }}>
      <div className="pl-sticky">
       <motion.div className="pl-card-wrap" ref={wrapRef} style={{ y: cardY }}>
        <div className="pl-card" ref={cardRef}>
          <div className="pl-head">
            <span className="pl-eyebrow">{eyebrow}</span>
          </div>

          <svg className="pl-svg" viewBox={geo.viewBox} fill="none" aria-hidden>
            <motion.path d={d} className="pl-route-bg" vectorEffect="non-scaling-stroke" />
            <motion.path
              d={d}
              className="pl-route"
              style={{ pathLength: draw }}
              vectorEffect="non-scaling-stroke"
            />
            {geo.pts.map((_, i) => (
              <Stop key={i} i={i} geo={geo} p={scrollYProgress} at={at(i)} dwell={dwell} />
            ))}
          </svg>

          <div className="pl-topic">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.5, ease: EASE }}
              >
                <span className="pl-n">{String(active + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}</span>
                <h3 className="pl-t">{step.t}</h3>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
       </motion.div>
      </div>
    </div>
  );
}
