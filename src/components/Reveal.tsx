'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

export const EASE = [0.16, 1, 0.3, 1] as const;

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
  x?: number;
  y?: number;
  once?: boolean;
};

/** Scroll-reveal wrapper — fades/slides children in when they enter the viewport. */
export function Reveal({ children, className, delay = 0, x = 0, y = 24, once = true }: Props) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, margin: '0px 0px -40px 0px' }}
      transition={{ duration: 0.7, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}
