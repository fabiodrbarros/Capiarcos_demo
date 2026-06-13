'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useLang, Rich } from '@/lib/i18n';
import { Reveal, EASE } from '@/components/Reveal';
import { MethodSlider } from '@/components/MethodSlider';
import { ServiceIcon } from '@/components/ServiceIcons';


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

        <motion.div className="hero-scroll" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, ease: EASE, delay: 1 }}>
          <span className="hero-scroll-lbl">{t.home.scroll}</span>
          <span className="hero-scroll-line">
            <motion.span className="hero-scroll-dot" animate={{ y: [-12, 50] }} transition={{ duration: 1.7, repeat: Infinity, ease: 'easeInOut' }} />
          </span>
        </motion.div>
      </section>

      {/* COMPROMISSO — método-style two-column slider */}
      <section className="method">
        <MethodSlider eyebrow={t.home.commit_tag} title={t.home.commit_t} cards={t.home.method_cards} />
      </section>

      {/* AREAS — editorial numbered list */}
      <section className="areas">
        <div className="wrap">
          <Reveal className="ed-head">

            <h2 className="h2">{t.home.areas_h2}</h2>
          </Reveal>
          <div className="fab-grid">
            {t.empresa.svc.map((s, i) => (
              <motion.div
                key={s.t}
                className="fab-item"
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '0px 0px -30px 0px' }}
                transition={{ duration: 0.4, ease: EASE, delay: (i % 3) * 0.05 }}
              >
                <span className="fab-ico"><ServiceIcon i={i} /></span>
                <span className="fab-name">{s.t}</span>
              </motion.div>
            ))}
          </div>
          <Reveal className="fab-cta">
            <Link href="/catalogo" className="btn btn-primary">{t.empresa.svc_cta} →</Link>
          </Reveal>
        </div>
      </section>

      {/* INTERNACIONAL */}
      <section className="intl-section">
        <div className="wrap">
          <div className="intl-grid intl-grid-rev">
            <Reveal x={-24} y={0}>
              <Rich as="h2" className="h2 intl-h" html={t.empresa.intl_h2} />
              <p className="intl-secondary">{t.empresa.intl_p}</p>
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

    </main>
  );
}
