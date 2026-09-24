'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useLang, Rich } from '@/lib/i18n';
import { EASE } from '@/components/Reveal';
import { ProcessLine } from '@/components/ProcessLine';
import { FadeStack } from '@/components/FadeStack';
import { useLinkedOpacity } from '@/lib/linkedOpacity';
import { useScrollJump } from '@/lib/scrollJump';

export default function Home() {
  const { t } = useLang();

  /* The hero hands over to the next section in one continuous move: the
     words fade, the mark leaves its place and glides to the centre of the
     screen, shrinks and collapses into a single line — and that line opens
     into the panel the process section is made of.

     The moving parts live in a layer pinned to the viewport, so the mark
     stays where the eye left it while the hero scrolls away underneath. */
  const heroRef = useRef<HTMLElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const procRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: p } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  /* the badge belongs to the process section: it leaves with it */
  const { scrollYProgress: proc } = useScroll({ target: procRef, offset: ['start start', 'end end'] });

  /* where the mark rests, how far that is from the centre, and from the
     corner it parks in afterwards */
  const CENTRE_S = 0.4;
  const CORNER_S = 0.24;
  const [mark, setMark] = useState({ left: 0, top: 0, w: 0, dx: 0, dy: 0, cx: 0, cy: 0, vh: 0 });
  useEffect(() => {
    const measure = () => {
      const el = slotRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const top = r.top + window.scrollY;
      const midX = r.left + r.width / 2;
      const midY = top + r.height / 2;
      const pad = window.innerWidth < 860 ? 20 : 44;
      setMark({
        left: r.left,
        top,
        w: r.width,
        dx: window.innerWidth / 2 - midX,
        dy: window.innerHeight / 2 - midY,
        cx: window.innerWidth - pad - (r.width * CORNER_S) / 2 - midX,
        cy: window.innerHeight - pad - (r.height * CORNER_S) / 2 - midY,
        vh: window.innerHeight,
      });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  /* The whole hand-over fits in one swipe (~390px of a 860px screen), and
     the next section is already rising underneath it:
       1. words and cue out         [0.00 → 0.05]   (0 → 40px)
       2. mark to the centre        [0.05 → 0.17]   (40 → 150px)
       3. it collapses into a line  [0.17 → 0.26]   (150 → 220px)
       4. the line opens the panel,
          the mark goes to the
          corner on the way         [0.26 → 0.35]   (220 → 300px)
       5. the card arrives          (in ProcessLine)
       6. panel and line hand over  [0.41 → 0.45]   (350 → 390px) */
  const textRef = useLinkedOpacity<HTMLDivElement>(p, [0.01, 0.05], [1, 0]);
  const cueRef = useLinkedOpacity<HTMLDivElement>(p, [0, 0.02, 0.05], [1, 1, 0]);
  const badgeRef = useLinkedOpacity<HTMLDivElement>(proc, [0.9, 0.99], [1, 0]);
  const lineRef = useLinkedOpacity<HTMLDivElement>(p, [0.16, 0.2, 0.41, 0.45], [0, 1, 1, 0]);
  const layerRef = useLinkedOpacity<HTMLDivElement>(p, [0.41, 0.45], [1, 0]);

  const markX = useTransform(p, [0.05, 0.17, 0.26, 0.35], [0, mark.dx, mark.dx, mark.cx]);
  const markY = useTransform(p, [0.05, 0.17, 0.26, 0.35], [0, mark.dy, mark.dy, mark.cy]);
  const markScale = useTransform(p, [0.05, 0.17, 0.26, 0.35], [1, CENTRE_S, CENTRE_S, CORNER_S]);
  const lineScale = useTransform(p, [0.17, 0.26], [0, 1]);
  const open = useTransform(p, [0.26, 0.35], [50, 0]);
  const clip = useTransform(open, (v) => `inset(${v}% 0% ${v}% 0%)`);

  /* There is nothing to read on the way down, so the hand-over is not
     something you crawl through: the first wheel notch or swipe takes over
     and drives the scroll from the hero to the pinned process card in one
     3.6s move. The steps above are scroll-linked, so they all play out
     inside it — and nothing in between can be stopped on. */
  const jumpTarget = useCallback(() => {
    const el = procRef.current;
    if (!el) return 0;
    return el.getBoundingClientRect().top + window.scrollY;
  }, []);
  useScrollJump(jumpTarget, 3600);

  return (
    <main>
      {/* the handover: mark → centre → line → panel. It comes before the
          hero so it is pinned to the viewport from the very first screen. */}
      {/* the mark has a layer of its own: it outlives the panel, ending up
          as a small badge in the corner */}
      <div className="tx tx--badge" ref={badgeRef} aria-hidden>
        <motion.div
          className="tx-mark"
          style={{ left: mark.left, top: mark.top, width: mark.w, x: markX, y: markY, scale: markScale }}
        >
          {/* the entrance lives on the inner element: framer owns the opacity
              of whatever it animates */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: EASE, delay: 0.12 }}
          >
            <Image src="/assets/img/logo.png" alt="Capiarcos" width={866} height={288} priority />
          </motion.div>
        </motion.div>
      </div>

      <div className="tx" ref={layerRef} aria-hidden>
        {/* the panel opens first, the line stays on top of it: it is the same
            line the next section starts from */}
        <motion.div className="tx-panel" style={{ clipPath: clip }} />
        <motion.div ref={lineRef} className="tx-line" style={{ scaleX: lineScale }} />
      </div>

      {/* HERO — the words on the left, the mark on the right */}
      <section className="hero" ref={heroRef}>
        <div className="hero-stage">
          <div className="hero-inner" ref={textRef}>
            <div className="hero-left">
              <motion.div
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease: EASE, delay: 0.25 }}
              >
                <Rich as="h1" className="hero-h1" html={t.home.h1} />
              </motion.div>

              <motion.div
                className="hero-btns"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: EASE, delay: 0.45 }}
              >
                <Link href="/contactos" className="btn btn-primary">{t.home.cta_quote}</Link>
                <Link href="/empresa" className="btn btn-ghost">{t.home.cta_more}</Link>
              </motion.div>
            </div>

            {/* the mark is drawn in the pinned layer below; this only holds
                its place in the layout */}
            <div className="hero-right">
              <div className="hero-mark-wrap" ref={slotRef} />
            </div>
          </div>
        </div>

        <div className="hero-scroll" ref={cueRef}>
          <span className="hero-scroll-lbl">{t.home.scroll}</span>
          <span className="hero-scroll-line">
            <motion.span className="hero-scroll-dot" animate={{ y: [-12, 50] }} transition={{ duration: 1.7, repeat: Infinity, ease: 'easeInOut' }} />
          </span>
        </div>
      </section>

      {/* PROCESSO — one line, drawn from the log to the house */}
      <div ref={procRef}>
        <ProcessLine eyebrow={t.home.process_tag} steps={t.home.process_steps} />
      </div>

      {/* CTA — the same card as the one that closes the About page */}
      <FadeStack
        items={[
          <div className="mk-card mk-card--cta" key="cta">
            <div className="mk-body">
              <h2 className="h2 mk-h">{t.home.cta_t}</h2>
              <p className="mk-p">{t.home.cta_s}</p>
            </div>
            <Link href="/contactos" className="btn btn-primary mk-cta">{t.home.cta_btn}</Link>
          </div>,
        ]}
      />
    </main>
  );
}
