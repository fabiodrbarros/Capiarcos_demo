'use client';

import { useEffect, useRef } from 'react';

/* ── The first scroll is a jump ────────────────────────────────────────
   Between the hero and the section under it there is nothing to read, so
   the page does not let you crawl through the hand-over: the first wheel
   notch or swipe takes over and drives the scroll itself, from one to the
   other, in one move. Everything on the way is scroll-linked, so the whole
   choreography plays out at that pace — and the other way round too, if
   you scroll back up while still inside the hand-over.

   Nothing else on the page is touched: past the target, scrolling is
   ordinary again. */

const DURATION = 1800;

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function useScrollJump(getTarget: () => number, duration = DURATION) {
  const busy = useRef(false);
  const touchY = useRef(0);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const run = (to: number) => {
      const from = window.scrollY;
      if (Math.abs(to - from) < 4) return;
      if (reduced) {
        window.scrollTo(0, to);
        return;
      }
      busy.current = true;
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        window.scrollTo(0, Math.round(from + (to - from) * easeInOutCubic(t)));
        if (t < 1) requestAnimationFrame(step);
        else busy.current = false;
      };
      requestAnimationFrame(step);
    };

    /** Which way this gesture should go, or null to leave it alone. */
    const decide = (dy: number): number | null => {
      const target = getTarget();
      if (target <= 0) return null;
      const y = window.scrollY;
      if (dy > 0 && y < target - 8) return target;
      if (dy < 0 && y > 8 && y <= target + 8) return 0;
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
  }, [getTarget, duration]);
}
