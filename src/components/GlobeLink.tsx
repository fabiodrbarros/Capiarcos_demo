'use client';

import { motion } from 'framer-motion';
import { EASE } from '@/components/Reveal';

/* A globe with the one route the company actually runs: Arcos de Valdevez →
   France. The arc draws itself, a dot travels along it and France stays lit;
   the open meridians read as "and beyond", without claiming other markets. */

const PT = { x: 84, y: 164 };   /* origin  */
const FR = { x: 182, y: 92 };   /* destination */
const ARC = `M${PT.x} ${PT.y} Q ${(PT.x + FR.x) / 2 - 14} ${PT.y - 86} ${FR.x} ${FR.y}`;

export function GlobeLink({ from, to }: { from: string; to: string }) {
  return (
    <div className="globe">
      <svg className="globe-svg" viewBox="0 0 260 260" fill="none" strokeLinecap="round">
        {/* the sphere */}
        <motion.circle
          cx={130} cy={130} r={104}
          className="gl-edge"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true, margin: '0px 0px -15% 0px' }}
          transition={{ duration: 1.6, ease: EASE }}
        />
        <motion.g
          className="gl-grid"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: EASE, delay: 0.3 }}
        >
          {/* parallels */}
          {[-70, -38, 0, 38, 70].map((d) => (
            <ellipse key={d} cx={130} cy={130 + d} rx={Math.sqrt(Math.max(1, 104 * 104 - d * d))} ry={12} />
          ))}
          {/* meridians */}
          {[26, 56, 86].map((rx) => (
            <ellipse key={rx} cx={130} cy={130} rx={rx} ry={104} />
          ))}
          <line x1={130} y1={26} x2={130} y2={234} />
        </motion.g>

        {/* the route */}
        <motion.path
          d={ARC}
          className="gl-arc"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true, margin: '0px 0px -15% 0px' }}
          transition={{ duration: 1.5, ease: EASE, delay: 0.8 }}
        />
        {/* a dash travelling the route — works everywhere, unlike offset-path */}
        <motion.path
          d={ARC}
          className="gl-pulse"
          initial={{ strokeDashoffset: 300 }}
          whileInView={{ strokeDashoffset: [300, 0] }}
          viewport={{ once: false }}
          transition={{ duration: 2.4, ease: 'easeInOut', repeat: Infinity, repeatDelay: 0.8, delay: 1.6 }}
        />

        {/* origin — named on the globe */}
        <circle cx={PT.x} cy={PT.y} r={4} className="gl-dot" />
        <text x={PT.x - 6} y={PT.y + 20} className="gl-name" textAnchor="middle">{from}</text>

        {/* destination — the one that stays lit */}
        <motion.circle
          cx={FR.x} cy={FR.y} r={16}
          className="gl-halo"
          initial={{ scale: 0.4, opacity: 0 }}
          whileInView={{ scale: [1, 1.35, 1], opacity: [0.5, 0.12, 0.5] }}
          viewport={{ once: false }}
          transition={{ duration: 3.2, ease: 'easeInOut', repeat: Infinity, delay: 2 }}
          style={{ transformOrigin: `${FR.x}px ${FR.y}px` }}
        />
        <circle cx={FR.x} cy={FR.y} r={5.5} className="gl-dot-on" />
        <text x={FR.x + 10} y={FR.y - 14} className="gl-name gl-name--on" textAnchor="middle">{to}</text>
      </svg>

      <div className="globe-legend">
        <span className="gl-lbl"><span className="gl-flag">🇵🇹</span>{from}</span>
        <svg className="gl-arr" width="30" height="8" viewBox="0 0 30 8" fill="none" stroke="currentColor" strokeWidth={1.2}><path d="M0 4h26M22 1l4 3-4 3" /></svg>
        <span className="gl-lbl gl-lbl--on"><span className="gl-flag">🇫🇷</span>{to}</span>
      </div>
    </div>
  );
}
