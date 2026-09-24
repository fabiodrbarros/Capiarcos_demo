'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform, useMotionValueEvent, AnimatePresence, type MotionValue } from 'framer-motion';
import { EASE } from '@/components/Reveal';
import { useLinkedOpacity } from '@/lib/linkedOpacity';

/* ── The story ─────────────────────────────────────────────────────────
   The page opens on the mark alone. Scrolling blooms one growth ring out
   of it; that ring tightens into a station on a single winding path, the
   path draws itself onwards, and the next ring only shows up once the
   route gets there. Four rings, four chapters, one continuous route that
   is fully drawn by the end.                                           */

export type Chapter = { k: string; t: string; d: string; proofs: string[] };

type Geo = {
  viewBox: string;
  c: number;   /* centre (the viewBox is square) */
  R: number;   /* radius of the route */
  r: number;   /* radius of a ring at a station */
  lbl: number; /* how far outside the route the label sits */
};

const WIDE: Geo = { viewBox: '0 0 600 600', c: 300, R: 232, r: 40, lbl: 30 };
const NARROW: Geo = { viewBox: '0 0 400 400', c: 200, R: 150, r: 28, lbl: 22 };

/* the route is the logo's ring, drawn as four quarters clockwise from the
   top — one quarter per chapter, closing the circle at the end */
function route({ c, R }: Geo) {
  return [
    `M${c} ${c - R}`,
    `A ${R} ${R} 0 0 1 ${c + R} ${c}`,
    `A ${R} ${R} 0 0 1 ${c} ${c + R}`,
    `A ${R} ${R} 0 0 1 ${c - R} ${c}`,
    `A ${R} ${R} 0 0 1 ${c} ${c - R}`,
  ].join(' ');
}

/* stations at 12, 3, 6 and 9 o'clock */
function station(geo: Geo, i: number) {
  const a = (-90 + i * 90) * (Math.PI / 180);
  return { x: geo.c + geo.R * Math.cos(a), y: geo.c + geo.R * Math.sin(a), a };
}

function labelPos(geo: Geo, i: number) {
  const s = station(geo, i);
  const d = geo.R + geo.lbl;
  const x = geo.c + d * Math.cos(s.a);
  const y = geo.c + d * Math.sin(s.a);
  const anchor: 'start' | 'end' | 'middle' = i === 1 ? 'start' : i === 3 ? 'end' : 'middle';
  return { x, y: i === 0 ? y - 4 : i === 2 ? y + 14 : y + 5, anchor };
}

/** A ring that blooms at its station and tightens into a mark on the route. */
function Station({
  i,
  geo,
  label,
  p,
  arr,
  span,
  last,
}: {
  i: number;
  geo: Geo;
  label: string;
  p: MotionValue<number>;
  arr: number;  /* when the line reaches this station */
  span: number; /* how long one quarter of the circle takes */
  last: boolean;
}) {
  const s = station(geo, i);
  const lb = labelPos(geo, i);

  /* blooms just before the line arrives, then tightens into a dot */
  const scale = useTransform(
    p,
    [arr - span * 0.34, arr - span * 0.04, arr + span * 0.36],
    [0, 1, 0.18],
  );
  const ringRef = useLinkedOpacity<SVGCircleElement>(
    p,
    [arr - span * 0.34, arr - span * 0.22, arr + span * 0.36],
    [0, 1, 1],
  );
  const lblRef = useLinkedOpacity<SVGTextElement>(
    p,
    [arr - span * 0.04, arr + span * 0.2, arr + span * (last ? 1.6 : 1), arr + span * (last ? 1.9 : 1.3)],
    [0, 1, 1, last ? 1 : 0.42],
  );

  return (
    <>
      <motion.circle
        ref={ringRef}
        cx={s.x}
        cy={s.y}
        r={geo.r}
        className="tl-ring"
        style={{ scale, transformOrigin: `${s.x}px ${s.y}px` }}
        vectorEffect="non-scaling-stroke"
      />
      <text ref={lblRef} x={lb.x} y={lb.y} textAnchor={lb.anchor} className="tl-station">
        {label}
      </text>
    </>
  );
}

export function AboutStory({ chapters, scrollLabel }: { chapters: Chapter[]; scrollLabel: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(-1);
  const [geo, setGeo] = useState<Geo>(WIDE);
  const n = chapters.length;

  /* one screen for the mark, then one per chapter. The circle has to be
     closed — and read for a moment — before the stage hands over to the
     cards, so the drawing ends well before the fade starts. */
  /* One step at a time, each waiting for the one before it:
       1. the cue goes                    [0.00 → 0.04]
       2. the mark parks in the corner    [0.06 → 0.17]
       3. the faint guide appears         [0.18 → 0.22]
       4. the circle draws, chapter by
          chapter, ring by ring           [0.26 → 0.72]
       5. it is read, complete            [0.72 → 0.93]
       6. the stage hands over            [0.93 → 1.00] */
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const DRAW_START = 0.26;
  const DRAW_END = 0.72;   /* the circle closes here, with room to spare */
  const FADE_START = 0.93; /* and is read for a good while before the fade */
  const span = (DRAW_END - DRAW_START) / n;
  /* station i sits at quarter i of the circle */
  const arr = (i: number) => DRAW_START + i * span;

  /* the mark rises into the top-left corner and stays there as the page's
     own badge; the offset is measured so it lands on the same margin at
     any viewport */
  const [corner, setCorner] = useState({ dx: -420, dy: -340 });
  const markScale = 0.34;
  const markX = useTransform(scrollYProgress, [0.06, 0.17], [0, corner.dx]);
  const markY = useTransform(scrollYProgress, [0.06, 0.17], [0, corner.dy]);
  const markS = useTransform(scrollYProgress, [0.06, 0.17], [1, markScale]);
  const markBox = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const measure = () => {
      const narrow = window.innerWidth < 860;
      setGeo(narrow ? NARROW : WIDE);
      const el = markBox.current;
      if (!el) return;
      const w = el.offsetWidth * 0.34;
      const h = el.offsetHeight * 0.34;
      const pad = narrow ? 18 : 30;
      setCorner({
        dx: pad + w / 2 - window.innerWidth / 2,
        dy: pad + h / 2 - window.innerHeight / 2,
      });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  /* the route draws itself across the four chapters and closes the circle */
  const draw = useTransform(scrollYProgress, [DRAW_START, DRAW_END], [0, 1]);
  /* the faint guide only shows up once the mark starts moving, so the
     first screen really is the logo and nothing else */
  const guideRef = useLinkedOpacity<SVGPathElement>(scrollYProgress, [0.18, 0.22], [0, 1]);
  /* and the whole stage fades only after the circle is closed */
  const stageRef = useLinkedOpacity<HTMLDivElement>(scrollYProgress, [FADE_START, 1], [1, 0]);
  /* the cue that tells you the mark is waiting for a scroll */
  const cueRef = useLinkedOpacity<HTMLDivElement>(scrollYProgress, [0, 0.02, 0.04], [1, 1, 0]);

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    /* the chapter speaks once its ring has been reached */
    let i = -1;
    for (let k = 0; k < n; k++) if (v >= arr(k) + span * 0.12) i = k;
    if (i !== active) setActive(i);
  });

  const chapter = active >= 0 ? chapters[active] : null;

  return (
    <div className="tl" ref={ref} style={{ height: `${(n + 1) * 100}vh` }}>
      <div className="tl-sticky">
       <div className="tl-stage" ref={stageRef}>
        {/* the mark: alone at first, then parked in the corner */}
        <motion.div ref={markBox} className="tl-mark" style={{ x: markX, y: markY, scale: markS }}>
          <Image src="/assets/img/logo.png" alt="Capiarcos" width={866} height={288} priority />
        </motion.div>

        {/* the cue on the first screen */}
        <div className="tl-cue" ref={cueRef}>
          <span className="hero-scroll-lbl">{scrollLabel}</span>
          <span className="hero-scroll-line">
            <motion.span
              className="hero-scroll-dot"
              animate={{ y: [-12, 50] }}
              transition={{ duration: 1.7, repeat: Infinity, ease: 'easeInOut' }}
            />
          </span>
        </div>

        {/* the route */}
        <svg className="tl-svg" viewBox={geo.viewBox} fill="none" aria-hidden>
          <path ref={guideRef} d={route(geo)} className="tl-route-bg" vectorEffect="non-scaling-stroke" />
          <motion.path
            d={route(geo)}
            className="tl-route"
            style={{ pathLength: draw }}
            vectorEffect="non-scaling-stroke"
          />
          {chapters.map((c, i) => (
            <Station
              key={c.t}
              i={i}
              geo={geo}
              label={c.k}
              p={scrollYProgress}
              arr={arr(i)}
              span={span}
              last={i === n - 1}
            />
          ))}
        </svg>

        {/* one chapter at a time */}
        <div className="tl-topic">
          <AnimatePresence mode="wait">
            {chapter && (
              <motion.div
                key={chapter.t}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                transition={{ duration: 0.5, ease: EASE }}
              >
                <h2 className="tl-t">{chapter.t}</h2>
                <p className="tl-d">{chapter.d}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
       </div>
      </div>
    </div>
  );
}
