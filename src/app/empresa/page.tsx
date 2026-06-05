'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useLang, Rich } from '@/lib/i18n';
import { Reveal, EASE } from '@/components/Reveal';
import { CountUp } from '@/components/CountUp';
import { DiffSlider } from '@/components/DiffSlider';

const Chevron = () => (
  <svg className="svc-row-ico" viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 6 L21 18 L9 30" /><path d="M20 6 L27 18 L20 30" opacity="0.45" />
  </svg>
);

export default function Empresa() {
  const { t } = useLang();
  const years = new Date().getFullYear() - 1998;

  return (
    <main className="about-page">
      {/* INTRO + ABOUT (merged) */}
      <section className="about-intro-sec">
        <div className="wrap">
          <div className="about-intro">
            <Reveal x={-24} y={0} className="about-text">
              <span className="ed-index">A Capiarcos</span>
              <Rich as="h1" className="about-statement" html={t.empresa.about_h2} />
              <p className="about-lead" style={{ marginTop: '1.4rem' }}>{t.empresa.about_p1}</p>
              <p className="about-lead" style={{ marginTop: '1rem' }}>{t.empresa.about_p2}</p>
              <blockquote className="about-quote"><Rich html={t.home.h1} /></blockquote>
            </Reveal>
            <Reveal x={24} y={0}>
              <figure className="about-visual">
                <Image src="/assets/img/empresa.png" alt="Capiarcos — Arcos de Valdevez" width={880} height={620} style={{ width: '100%', height: 'auto', borderRadius: 4 }} />
              </figure>
            </Reveal>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="stats-sec">
        <div className="wrap">
          <div className="stats-grid">
            <Reveal className="stat"><span className="stat-num">1998</span><span className="stat-lbl">{t.empresa.stats.founded}</span></Reveal>
            <Reveal delay={0.08} className="stat"><span className="stat-num"><CountUp to={years} suffix="+" /></span><span className="stat-lbl">{t.empresa.stats.years}</span></Reveal>
            <Reveal delay={0.16} className="stat"><span className="stat-num"><CountUp to={100} suffix="%" /></span><span className="stat-lbl">{t.empresa.stats.custom}</span></Reveal>
          </div>
        </div>
      </section>

      {/* DIFERENCIAIS — slider of cards */}
      <section className="diff-section">
        <div className="wrap">
          <Reveal className="ed-head">
            <span className="ed-index">(01)</span>
            <h2 className="h2">{t.empresa.diff_h2}</h2>
            <p className="lead" style={{ marginTop: '.6rem', maxWidth: '46ch' }}>{t.empresa.about_quote}</p>
          </Reveal>
        </div>
        <DiffSlider items={t.empresa.diff} />
      </section>

      {/* ÁREAS DE FABRICAÇÃO */}
      <section className="svc-section">
        <div className="wrap">
          <Reveal className="ed-head">
            <span className="ed-index">(02)</span>
            <h2 className="h2">{t.empresa.svc_h2}</h2>
            <p className="lead" style={{ marginTop: '.6rem', maxWidth: '46ch' }}>{t.empresa.svc_sub}</p>
          </Reveal>
          <div className="svc-list">
            {t.empresa.svc.map((s, i) => (
              <motion.div
                key={s.t}
                className="svc-row"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '0px 0px -40px 0px' }}
                transition={{ duration: 0.5, ease: EASE, delay: (i % 2) * 0.08 }}
              >
                <Chevron />
                <div className="svc-row-name">{s.t} <span className="svc-row-sub">{s.s}</span></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* INTERNACIONAL */}
      <section className="intl-section">
        <div className="wrap">
          <div className="intl-grid">
            <Reveal x={-24} y={0}>
              <span className="tag">{t.empresa.intl_tag}</span>
              <Rich as="h2" className="h2" html={t.empresa.intl_h2} />
              <p className="lead" style={{ marginTop: '1.2rem' }}>{t.empresa.intl_p}</p>
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

      {/* CTA */}
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
