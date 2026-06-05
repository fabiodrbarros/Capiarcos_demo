'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useLang, Rich } from '@/lib/i18n';
import { Reveal, EASE } from '@/components/Reveal';
import { CountUp } from '@/components/CountUp';

const Check = () => (
  <svg className="check-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" opacity="0.35" />
    <path d="M8 12.5l2.5 2.5 5.5-6" />
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
              <blockquote className="about-quote"><Rich html={t.home.h1.replace(/\n/g, ' ')} /></blockquote>
            </Reveal>
            <Reveal x={24} y={0}>
              <figure className="about-visual about-visual--logo">
                <Image src="/assets/img/logo.png" alt="Capiarcos" width={460} height={153} style={{ width: '100%', height: 'auto' }} />
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

      {/* DIFERENCIAIS — image + checklist */}
      <section className="diff-section">
        <div className="wrap">
          <div className="about-intro diff-intro">
            <Reveal x={-24} y={0} className="diff-visual-col">
              <figure className="diff-visual">
                <Image src="/assets/img/wood.png" alt="Capiarcos — trabalho em madeira" width={941} height={1672} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </figure>
            </Reveal>
            <Reveal x={24} y={0} className="about-text">
              <span className="ed-index">(01)</span>
              <h2 className="h2">{t.empresa.diff_h2}</h2>
              <div className="checklist" style={{ marginTop: '1.6rem' }}>
                {t.empresa.diff.slice(0, 5).map((d, i) => (
                  <motion.div
                    key={d.t}
                    className="check-item"
                    initial={{ opacity: 0, x: 16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '0px 0px -40px 0px' }}
                    transition={{ duration: 0.45, ease: EASE, delay: i * 0.06 }}
                  >
                    <Check />
                    <div>
                      <div className="check-t">{d.t}</div>
                      <div className="check-d">{d.d}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ÁREAS DE FABRICAÇÃO */}
      <section className="svc-section">
        <div className="wrap">
          <Reveal className="ed-head">
            <span className="ed-index">(02)</span>
            <h2 className="h2 fab-heading">{t.empresa.svc_sub}</h2>
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
                <span className="fab-num">{String(i + 1).padStart(2, '0')}</span>
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
          <div className="intl-grid">
            <Reveal x={-24} y={0}>
              <span className="ed-index">(03)</span>
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

      {/* CTA */}
      <section className="cta-strip">
        <div className="wrap">
          <div className="cta-strip-text">
            <h3 className="cta-strip-t">{t.home.cta_t}</h3>
            <p className="cta-strip-s">{t.home.cta_s}</p>
          </div>
          <Link href="/contactos" className="btn btn-primary">{t.home.cta_btn}</Link>
        </div>
      </section>
    </main>
  );
}
