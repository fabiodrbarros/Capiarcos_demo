'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLang } from '@/lib/i18n';
import { Reveal } from '@/components/Reveal';

const PinIcon = () => (
  <svg className="c-ico" viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth={1.3} strokeLinecap="round"><path d="M18 3C12 3,7 8,7 14c0 8,11 19,11 19s11-11,11-19c0-6-5-11-11-11z" /><circle cx="18" cy="14" r="4" /></svg>
);
const PhoneIcon = () => (
  <svg className="c-ico" viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth={1.3} strokeLinecap="round"><path d="M8 4C7 4,4 5,4 9c0 11,12 23,23 23c4 0,5-3,5-4v-4c0-1-1-2-2-2l-4-1c-1 0-2 0-3 1l-2 3C18 23,13 18,11 15l3-2c1-1,1-2,1-3L14 6C14 5,13 4,12 4Z" /></svg>
);
const MobileIcon = () => (
  <svg className="c-ico" viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth={1.3} strokeLinecap="round"><rect x="9" y="3" width="18" height="30" rx="3" /><circle cx="18" cy="28" r="1.5" fill="currentColor" /></svg>
);
const FaxIcon = () => (
  <svg className="c-ico" viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth={1.3} strokeLinecap="round"><rect x="6" y="6" width="24" height="24" rx="2" /><line x1="6" y1="14" x2="30" y2="14" /><line x1="10" y1="20" x2="22" y2="20" /><line x1="10" y1="24" x2="22" y2="24" /></svg>
);
const MailIcon = () => (
  <svg className="c-ico" viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth={1.3} strokeLinecap="round"><rect x="3" y="8" width="30" height="20" rx="3" /><polyline points="3,8 18,20 33,8" /></svg>
);

export default function Contactos() {
  const { t } = useLang();
  const [sent, setSent] = useState(false);

  return (
    <main>
      <header className="page-header page-header--compact">
        <div className="wrap">
          <div className="page-crumbs"><Link href="/">Home</Link> / <span>{t.contactos.crumb}</span></div>
        </div>
      </header>

      <section style={{ background: 'var(--white)', paddingTop: '3rem' }}>
        <div className="wrap">
          <div className="contact-grid">
            <Reveal x={-24} y={0}>
              <div className="c-detail">
                <PinIcon />
                <div>
                  <div className="c-lbl">{t.contactos.addr}</div>
                  <div className="c-val">Zona Industrial de Mogueiras – Tabaço<br />4970-685 Arcos de Valdevez<br />Viana do Castelo, Portugal</div>
                </div>
              </div>

              <div className="c-detail">
                <PhoneIcon />
                <div>
                  <div className="c-lbl">{t.contactos.phone}</div>
                  <div className="c-val"><a href="tel:+351258522978">258 522 978</a> <span>{t.ft.landline_call}</span></div>
                </div>
              </div>

              <div className="c-detail">
                <MobileIcon />
                <div>
                  <div className="c-lbl">{t.contactos.mobile}</div>
                  <div className="c-val">
                    <a href="tel:+351935229788">935 229 788</a> <span>{t.ft.mobile_call}</span><br />
                    <a href="tel:+351935229789">935 229 789</a> <span>{t.ft.mobile_call}</span>
                  </div>
                </div>
              </div>

              <div className="c-detail">
                <FaxIcon />
                <div>
                  <div className="c-lbl">{t.contactos.fax}</div>
                  <div className="c-val">258 522 978</div>
                </div>
              </div>

              <div className="c-detail">
                <MailIcon />
                <div>
                  <div className="c-lbl">{t.contactos.email}</div>
                  <div className="c-val"><a href="mailto:patriciacapiarcos@sapo.pt">patriciacapiarcos@sapo.pt</a></div>
                </div>
              </div>

              <div className="c-actions">
                <a href="tel:+351258522978" className="btn-a"><PhoneIcon /><span>{t.contactos.call}</span></a>
                <a href="mailto:patriciacapiarcos@sapo.pt" className="btn-a"><MailIcon /><span>{t.contactos.send_email}</span></a>
                <a href="https://www.google.com/maps?cid=1880678143440046317&hl=pt" target="_blank" rel="noopener noreferrer" className="btn-a"><PinIcon /><span>{t.contactos.maps}</span></a>
              </div>
            </Reveal>

            <Reveal x={24} y={0}>
              <div className="cf-form">
                {!sent ? (
                  <>
                    <h3 className="h3" style={{ marginBottom: '.4rem' }}>{t.contactos.form_t}</h3>
                    <p style={{ fontSize: '.88rem', color: 'var(--muted)', marginBottom: '1.6rem', fontWeight: 300 }}>{t.contactos.form_s}</p>
                    <form onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
                      <div className="fg">
                        <div className="fgr"><label className="flbl">{t.contactos.fn}</label><input className="fi" type="text" required placeholder={t.contactos.fn_ph} /></div>
                        <div className="fgr"><label className="flbl">{t.contactos.fe}</label><input className="fi" type="email" required placeholder={t.contactos.fe_ph} /></div>
                        <div className="fgr"><label className="flbl">{t.contactos.fp}</label><input className="fi" type="tel" placeholder={t.contactos.fp_ph} /></div>
                        <div className="fgr"><label className="flbl">{t.contactos.fs}</label><input className="fi" type="text" required placeholder={t.contactos.fs_ph} /></div>
                        <div className="fgr full"><label className="flbl">{t.contactos.fm}</label><textarea className="fi" rows={5} required placeholder={t.contactos.fm_ph} /></div>
                      </div>
                      <button type="submit" className="btn-sub">{t.contactos.send}</button>
                    </form>
                  </>
                ) : (
                  <div className="form-ok show">
                    <div className="form-ok-icon">✓</div>
                    <div className="form-ok-t">{t.contactos.ok_t}</div>
                    <div className="form-ok-s">{t.contactos.ok_s}</div>
                  </div>
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="map-section" style={{ background: 'var(--white)' }}>
        <div className="wrap">
          <Reveal className="map-wrap">
            <iframe
              src="https://maps.google.com/maps?cid=1880678143440046317&hl=pt&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              title="Mapa Capiarcos"
            />
          </Reveal>
        </div>
      </section>
    </main>
  );
}
