'use client';

import { useEffect, useRef } from 'react';

/* ── Some stretches are jumped, not scrolled ───────────────────────────
   A hand-over between two sections has nothing to read in it: it is one
   move, and letting it be scrubbed by hand shows every half-finished
   state on the way. So each of those stretches is declared as a segment
   [from, to], and inside one the page takes the scroll over: a single
   wheel notch or swipe drives it from one end to the other in one go,
   ignoring further input until it lands.

   Everything the segments do not cover — the stretches where there is
   something to read — scrolls as usual, and crossing into a segment from
   there simply means the next gesture jumps.                            */

const DURATION = 1800;
/** how close to an end counts as being at it */
const EDGE = 8;

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export type Segment = [from: number, to: number];

export function useScrollJump(getSegments: () => Segment[], duration = DURATION) {
  const busy = useRef(false);
  const touchY = useRef(0);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const run = (to: number) => {
      const from = window.scrollY;
      if (Math.abs(to - from) < 4) return;
      /* every step is placed by hand: 'instant' keeps the page's own
         scroll-behavior: smooth from smoothing each one of them and
         turning the move into a chase */
      const put = (y: number) => window.scrollTo({ top: y, behavior: 'instant' });
      if (reduced) {
        put(to);
        return;
      }
      busy.current = true;
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        put(Math.round(from + (to - from) * easeInOutCubic(t)));
        if (t < 1) requestAnimationFrame(step);
        else busy.current = false;
      };
      requestAnimationFrame(step);
    };

    /** Where this gesture should land, or null to leave it alone. */
    const decide = (dy: number): number | null => {
      const y = window.scrollY;
      for (const [a, b] of getSegments()) {
        if (b - a < 24) continue;
        if (dy > 0 && y >= a - EDGE && y < b - EDGE) return b;
        if (dy < 0 && y > a + EDGE && y <= b + EDGE) return a;
      }
      return null;
    };

    const onWheel = (e: WheelEvent) => {
      if (busy.current) {
        e.preventDefault();
        return;
      }
      const to = decide(e.deltaY);
      if (to === null) return;
      e.preventDefault();
      run(to);
    };

    const onTouchStart = (e: TouchEvent) => {
      touchY.current = e.touches[0]?.clientY ?? 0;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (busy.current) {
        e.preventDefault();
        return;
      }
      const y = e.touches[0]?.clientY ?? 0;
      const dy = touchY.current - y; /* finger up = scrolling down */
      if (Math.abs(dy) < 6) return;
      const to = decide(dy);
      if (to === null) return;
      e.preventDefault();
      run(to);
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
    };
  }, [getSegments, duration]);
}

/** Where a section's own scroll progress `v` sits on the page. */
export function atProgress(el: HTMLElement | null, v: number) {
  if (!el) return 0;
  const top = el.getBoundingClientRect().top + window.scrollY;
  return Math.round(top + v * Math.max(0, el.offsetHeight - window.innerHeight));
}
