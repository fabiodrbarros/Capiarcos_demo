'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function CursorFollower() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 350, damping: 28, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 350, damping: 28, mass: 0.5 });
  const [active, setActive] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || window.matchMedia('(hover: none)').matches) return;
    setEnabled(true);
    const move = (e: MouseEvent) => { x.set(e.clientX); y.set(e.clientY); };
    const over = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      setActive(!!el.closest('a, button, .fab-item, .slide-card, .ed-row, [role="button"]'));
    };
    window.addEventListener('mousemove', move, { passive: true });
    window.addEventListener('mouseover', over, { passive: true });
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseover', over);
    };
  }, [x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      className="cursor-ring"
      aria-hidden
      style={{ x: sx, y: sy }}
      animate={{ scale: active ? 2.3 : 1, opacity: active ? 1 : 0.55 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
    />
  );
}
