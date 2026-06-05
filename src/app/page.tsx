'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useLang, Rich } from '@/lib/i18n';
import { Reveal, EASE } from '@/components/Reveal';
import type { ReactNode } from 'react';

/* Furniture icons (ported from the original site) */
const ICONS: ReactNode[] = [
  <svg key="k" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="6" width="36" height="13" rx="1" /><line x1="24" y1="6" x2="24" y2="19" />
    <circle cx="22" cy="12.5" r=".9" fill="currentColor" /><circle cx="26" cy="12.5" r=".9" fill="currentColor" />
    <rect x="4" y="21" width="40" height="3" rx="1" /><rect x="6" y="26" width="36" height="16" rx="1" />
    <line x1="6" y1="31" x2="42" y2="31" /><circle cx="16" cy="28.5" r=".7" fill="currentColor" />
    <circle cx="24" cy="28.5" r=".7" fill="currentColor" /><circle cx="32" cy="28.5" r=".7" fill="currentColor" />
    <line x1="24" y1="31" x2="24" y2="42" /><circle cx="22" cy="37" r=".9" fill="currentColor" />
    <circle cx="26" cy="37" r=".9" fill="currentColor" /><line x1="8" y1="42" x2="8" y2="44" /><line x1="40" y1="42" x2="40" y2="44" />
  </svg>,
  <svg key="w" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="4" width="30" height="40" rx="1.5" /><line x1="7" y1="6" x2="41" y2="6" /><line x1="24" y1="6" x2="24" y2="36" />
    <line x1="22" y1="18" x2="22" y2="24" /><line x1="26" y1="18" x2="26" y2="24" /><line x1="9" y1="36" x2="39" y2="36" />
    <line x1="20" y1="40" x2="28" y2="40" /><line x1="11" y1="44" x2="11" y2="46" /><line x1="37" y1="44" x2="37" y2="46" />
  </svg>,
  <svg key="b" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 22 V12 a3 3 0 0 1 3 -3 h26 a3 3 0 0 1 3 3 v10" /><rect x="11" y="16" width="11" height="6" rx="2" />
    <rect x="26" y="16" width="11" height="6" rx="2" /><rect x="4" y="22" width="40" height="10" rx="2" />
    <line x1="4" y1="28" x2="44" y2="28" /><line x1="7" y1="32" x2="7" y2="40" /><line x1="41" y1="32" x2="41" y2="40" />
  </svg>,
  <svg key="bath" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <rect x="15" y="4" width="18" height="13" rx="1.5" /><path d="M22 20 v2 h4 v-2" /><line x1="24" y1="20" x2="24" y2="17" />
    <rect x="5" y="22" width="38" height="6" rx="1" /><ellipse cx="24" cy="25" rx="7" ry="2" /><rect x="7" y="28" width="34" height="14" rx="1" />
    <line x1="24" y1="28" x2="24" y2="42" /><line x1="22" y1="33" x2="22" y2="37" /><line x1="26" y1="33" x2="26" y2="37" />
    <line x1="9" y1="42" x2="9" y2="45" /><line x1="39" y1="42" x2="39" y2="45" />
  </svg>,
  <svg key="d" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 6 v32 M36 6 v32 M10 4 h28" /><rect x="14" y="6" width="20" height="32" /><rect x="17" y="9" width="14" height="9" rx="1" />
    <rect x="17" y="22" width="14" height="11" rx="1" /><circle cx="30" cy="25" r="1.2" fill="currentColor" />
    <line x1="4" y1="40" x2="44" y2="40" /><line x1="4" y1="44" x2="44" y2="44" /><line x1="13" y1="40" x2="13" y2="44" />
    <line x1="24" y1="40" x2="24" y2="44" /><line x1="35" y1="40" x2="35" y2="44" />
  </svg>,
  <svg key="l" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <rect x="7" y="5" width="34" height="38" rx="1" /><line x1="7" y1="19" x2="41" y2="19" /><line x1="7" y1="31" x2="41" y2="31" />
    <rect x="11" y="8" width="3.2" height="11" /><rect x="15" y="10" width="3.2" height="9" /><rect x="19" y="9" width="3.2" height="10" />
    <rect x="23" y="11" width="3.2" height="8" /><path d="M31 19 v-3 q0 -2 2 -2 q2 0 2 2 v3" />
    <rect x="11" y="22" width="2.8" height="9" /><rect x="14.4" y="21" width="2.8" height="10" /><rect x="17.8" y="23" width="2.8" height="8" />
    <rect x="21.2" y="21" width="2.8" height="10" /><rect x="24.6" y="22" width="2.8" height="9" /><rect x="28" y="20" width="2.8" height="11" />
    <rect x="31.4" y="23" width="2.8" height="8" /><rect x="11" y="35" width="3.2" height="8" /><rect x="15" y="34" width="3.2" height="9" />
    <rect x="23" y="40" width="13" height="3" /><rect x="24" y="37" width="11" height="3" />
    <line x1="9" y1="43" x2="9" y2="46" /><line x1="39" y1="43" x2="39" y2="46" />
  </svg>,
];

export default function Home() {
  const { t } = useLang();

  return (
    <main>
      {/* HERO — technical / architectural */}
      <section className="hero">
        <span className="hero-plus" style={{ top: '13%', left: '9%' }}>+</span>
        <span className="hero-plus" style={{ top: '24%', left: '47%' }}>+</span>
        <span className="hero-plus" style={{ top: '64%', left: '31%' }}>+</span>
        <span className="hero-plus" style={{ top: '22%', right: '9%' }}>+</span>

        <div className="hero-coords">
          <span>41°50′N · 8°25′W</span>
          <span>{t.home.coords_place}</span>
        </div>

        <div className="hero-inner">
          <div className="hero-left">
            <motion.div className="hero-eyebrow" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE, delay: 0.15 }}>
              <span />
              <em>{t.home.eyebrow}</em>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: EASE, delay: 0.28 }}>
              <Rich as="h1" className="hero-h1" html={t.home.h1} />
            </motion.div>
            <motion.div className="hero-btns" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE, delay: 0.5 }}>
              <Link href="/contactos" className="btn btn-primary">{t.home.cta_quote} →</Link>
              <Link href="/empresa" className="btn btn-ghost">{t.home.cta_more}</Link>
            </motion.div>
          </div>

          <div className="hero-right">
            <motion.div className="hero-rings" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.1, ease: EASE, delay: 0.3 }}>
              <span className="ring ring-1" />
              <span className="ring ring-2" />
              <span className="ring ring-3" />
              <span className="ring ring-4" />
              <Image className="hero-mark" src="/assets/img/logo.png" alt="Capiarcos" width={360} height={150} style={{ height: 'auto' }} priority />
            </motion.div>
          </div>
        </div>

        <motion.div className="hero-tags" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE, delay: 0.7 }}>
          {t.home.pillars.map((p, i) => (
            <span key={p} className="hero-tag"><i className={`hdot${i === 1 ? ' dark' : ''}`} />{p}</span>
          ))}
        </motion.div>

        <div className="hero-scroll"><span className="hero-scroll-line" />{t.home.scroll}</div>
      </section>

      {/* COMMITMENT */}
      <section className="commitment">
        <div className="wrap">
          <Reveal><span className="tag commit-tag">{t.home.commit_tag}</span></Reveal>
          <Reveal delay={0.08}><h2 className="commit-title">{t.home.commit_t}</h2></Reveal>
          <Reveal delay={0.16}><p className="commit-sub">{t.home.commit_s}</p></Reveal>
        </div>
      </section>

      {/* AREAS */}
      <section className="areas">
        <div className="wrap">
          <Reveal className="areas-head">
            <span className="tag">{t.home.areas_tag}</span>
            <h2 className="h2">{t.home.areas_h2}</h2>
            <p className="lead" style={{ marginTop: '.6rem', maxWidth: '50ch' }}>{t.home.areas_sub}</p>
          </Reveal>
          <div className="areas-grid">
            {t.home.areas.map((a, i) => (
              <motion.div
                key={a.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '0px 0px -40px 0px' }}
                transition={{ duration: 0.6, ease: EASE, delay: (i % 3) * 0.08 }}
              >
                <Link href="/empresa" className="area-card" style={{ height: '100%' }}>
                  <div className="area-ico-box">{ICONS[i]}</div>
                  <div className="area-body">
                    <h3 className="area-name">{a.name}</h3>
                    <p className="area-desc">{a.desc}</p>
                    <span className="area-arr">{t.home.areas_cta} →</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* INTERNACIONAL */}
      <section className="intl-section">
        <div className="wrap">
          <div className="intl-grid intl-grid-rev">
            <Reveal x={-24} y={0}>
              <span className="tag">{t.home.intl_tag}</span>
              <Rich as="h2" className="h2" html={t.home.intl_h} />
            </Reveal>
            <Reveal x={24} y={0} className="intl-flags">
              <div className="flag-box"><div className="flag-ring">🇵🇹</div><span className="flag-lbl">Portugal</span></div>
              <div className="intl-sep">
                <div className="intl-sep-line" />
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth={1.4}><path d="M1 7h11M8 3l4 4-4 4" /></svg>
                <div className="intl-sep-line" />
              </div>
              <div className="flag-box"><div className="flag-ring">🇫🇷</div><span className="flag-lbl">France</span></div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* CTA STRIP */}
      <section className="cta-strip">
        <div className="wrap">
          <div className="cta-strip-text">
            <h3 className="cta-strip-t">{t.home.cta_t}</h3>
            <p className="cta-strip-s">{t.home.cta_s}</p>
          </div>
          <Link href="/contactos" className="btn btn-gold">{t.home.cta_btn}</Link>
        </div>
      </section>
    </main>
  );
}
