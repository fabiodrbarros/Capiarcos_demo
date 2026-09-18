'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useMotionValueEvent, type MotionValue } from 'framer-motion';

/* Scroll-linked opacity, written straight to the node.

   framer hands a scroll-linked `opacity` in `style` over to a WAAPI
   animation, and inside a sticky block that hand-off drifts out of sync
   (a faded-out layer stays visible over the one below it). Transforms are
   unaffected, so they stay on `style` and only the fades come through
   here. */

export function piecewise(v: number, stops: number[], outs: number[]) {
  if (v <= stops[0]) return outs[0];
  const last = stops.length - 1;
  if (v >= stops[last]) return outs[last];
  for (let i = 1; i <= last; i++) {
    if (v <= stops[i]) {
      const t = (v - stops[i - 1]) / (stops[i] - stops[i - 1]);
      return outs[i - 1] + t * (outs[i] - outs[i - 1]);
    }
  }
  return outs[last];
}

export function useLinkedOpacity<T extends SVGElement | HTMLElement>(
  p: MotionValue<number>,
  stops: number[],
  outs: number[],
) {
  const ref = useRef<T>(null);
  const apply = useCallback(
    (v: number) => {
      if (ref.current) ref.current.style.opacity = String(piecewise(v, stops, outs));
    },
    [stops, outs],
  );
  useMotionValueEvent(p, 'change', apply);
  useEffect(() => { apply(p.get()); }, [apply, p]);
  return ref;
}
