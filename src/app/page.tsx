'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useLang, Rich } from '@/lib/i18n';
import { Reveal, EASE } from '@/components/Reveal';


export default function Home() {
  const { t } = useLang();

  return (
    <main>
      {/* HERO */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-left">
            <motion.div className="hero-eyebrow" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE, delay: 0.15 }}>
              <span />
              <em>{t.home.eyebrow}</em>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: EASE, delay: 0.28 }}>
              <Rich as="h1" className="hero-h1" html={t.home.h1} />
            </motion.div>
            <motion.p className="hero-sub" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE, delay: 0.45 }}>
              {t.home.sub}
            </motion.p>
            <motion.div className="hero-btns" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE, delay: 0.6 }}>
              <Link href="/contactos" className="btn btn-primary">{t.home.cta_quote}</Link>
              <Link href="/empresa" className="btn btn-ghost">{t.home.cta_more}</Link>
            </motion.div>
          </div>

          <div className="hero-right">
            <motion.div className="hero-mark-wrap" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, ease: EASE, delay: 0.3 }}>
              <Image className="hero-logo" src="/assets/img/logo.png" alt="Capiarcos" width={460} height={192} style={{ height: 'auto' }} priority />
            </motion.div>
          </div>
        </div>
      </section>

      {/* COMMITMENT */}
      <section className="commitment">
        <div className="wrap">
          <Reveal><span className="ed-index">(01)</span></Reveal>
          <Reveal delay={0.06}><span className="tag commit-tag">{t.home.commit_tag}</span></Reveal>
          <Reveal delay={0.12}><h2 className="commit-title">{t.home.commit_t}</h2></Reveal>
          <Reveal delay={0.18}><p className="commit-sub">{t.home.commit_s}</p></Reveal>
        </div>
      </section>

      {/* AREAS — editorial numbered list */}
      <section className="areas">
        <div className="wrap">
          <Reveal className="ed-head">
            <span className="ed-index">(02)</span>
            <h2 className="h2">{t.home.areas_h2}</h2>
            <p className="lead" style={{ marginTop: '.7rem', maxWidth: '46ch' }}>{t.home.areas_sub}</p>
          </Reveal>
          <div className="ed-list">
            {t.home.areas.map((a, i) => (
              <motion.div
                key={a.name}
                className="ed-row"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '0px 0px -40px 0px' }}
                transition={{ duration: 0.55, ease: EASE, delay: (i % 3) * 0.06 }}
              >
                <Link href="/empresa">
                  <span className="ed-num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="ed-name">{a.name}</span>
                  <span className="ed-desc">{a.desc}</span>
                  <span className="ed-arr">→</span>
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
