'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLang } from '@/lib/i18n';
import { ServiceIcon } from '@/components/ServiceIcons';
import { GlobeLink } from '@/components/GlobeLink';
import { AboutStory, type Chapter } from '@/components/AboutStory';
import { FadeStack } from '@/components/FadeStack';

export default function Empresa() {
  const { t, lang } = useLang();
  const mc = t.home.method_cards;
  const keys = t.empresa.ring_keys;
  const diff = t.empresa.diff;

  /* a proof reads "Title — detail", or just the detail when the chapter
     already carries that title */
  const proof = (i: number, chapterTitle: string) =>
    diff[i].t === chapterTitle ? diff[i].d : `${diff[i].t} — ${diff[i].d}`;

  /* four rings, four chapters: the origin, the factory, the made-to-measure
     work (raw materials included) and the people. The export story is a
     card of its own, below. */
  const chapters: Chapter[] = [
    { k: keys[0], t: t.empresa.ring_first_t, d: t.empresa.story[0], proofs: [proof(5, t.empresa.ring_first_t), proof(6, t.empresa.ring_first_t)] },
    { k: keys[1], t: mc[0].name, d: t.empresa.story[1], proofs: [proof(0, mc[0].name), proof(7, mc[0].name)] },
    { k: keys[2], t: mc[3].name, d: t.empresa.story[2], proofs: [proof(4, mc[3].name), proof(3, mc[3].name)] },
    { k: keys[4], t: mc[1].name, d: t.empresa.story[3], proofs: [proof(1, mc[1].name), proof(2, mc[1].name)] },
  ];

  return (
    <main className="about-page">
      {/* THE MARK → RINGS → ONE LINE PER CHAPTER */}
      <AboutStory chapters={chapters} scrollLabel={t.home.scroll} />

      {/* THE THREE CARDS — one stage, cross-fading with the scroll */}
      <FadeStack
        items={[
          <div className="mk-card" key="areas">
            <figure className="mk-visual">
              <Image src="/assets/img/wood.png" alt="Capiarcos — trabalho em madeira" width={941} height={1672} />
            </figure>
            <div className="mk-body">
              <span className="ed-index">{t.empresa.svc_tag}</span>
              <h2 className="h2 mk-h">{t.home.areas_h2}</h2>
              <div className="fab-grid mk-grid">
                {t.empresa.svc.map((sv, i) => (
                  <div key={sv.t} className="fab-item">
                    <span className="fab-ico"><ServiceIcon i={i} /></span>
                    <span className="fab-name">{sv.t}</span>
                  </div>
                ))}
              </div>
              <Link href="/catalogo" className="btn btn-primary mk-cta">{t.empresa.svc_cta} →</Link>
            </div>
          </div>,

          <div className="mk-card mk-card--intl" key="intl">
            <div className="mk-body">
              <span className="ed-index">{t.empresa.intl_tag}</span>
              <h2 className="h2 mk-h">{t.empresa.ring_last_t}</h2>
            </div>
            <div className="mk-globe">
              <GlobeLink from="Portugal" to={lang === 'pt' ? 'França' : 'France'} />
            </div>
          </div>,

          <div className="mk-card mk-card--cta" key="cta">
            <div className="mk-body">
              <h2 className="h2 mk-h">{t.home.cta_t}</h2>
              <p className="mk-p">{t.home.cta_s}</p>
            </div>
            <Link href="/contactos" className="btn btn-primary mk-cta">{t.home.cta_btn}</Link>
          </div>,
        ]}
      />

    </main>
  );
}
