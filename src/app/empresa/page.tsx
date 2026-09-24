'use client';

import { useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLang } from '@/lib/i18n';
import { ServiceIcon } from '@/components/ServiceIcons';
import { GlobeLink } from '@/components/GlobeLink';
import { AboutStory, STORY_LANDING, STORY_HAND_OVER, type Chapter } from '@/components/AboutStory';
import { FadeStack, fadeStackCrossings, fadeStackIn } from '@/components/FadeStack';
import { atProgress, useScrollJump, type Segment } from '@/lib/scrollJump';

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

  /* Every hand-over on this page is one move, so each is jumped rather
     than scrolled through (see lib/scrollJump): the first gesture takes
     the mark from the middle of the screen to the first chapter, with the
     route already well round the circle; once the circle has been read,
     the next one carries the story out and the first card in; and from
     there each crossing between two cards goes the whole way at once,
     instead of stopping half-way with two half-cards on screen. What is
     left over is the reading — the chapters and the cards themselves —
     and that scrolls as usual. */
  const storyRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const segments = useCallback((): Segment[] => {
    const story = storyRef.current;
    const cards = cardsRef.current;
    if (!story) return [];
    const top = story.getBoundingClientRect().top + window.scrollY;
    const end = top + Math.max(0, story.offsetHeight - window.innerHeight);
    const n = cards?.querySelectorAll('.fs-card').length ?? 0;
    /* below the breakpoint the cards leave their stage and simply stack,
       so the story hands over to where they start and there are no
       crossings to jump */
    const stacked = window.innerWidth < 860 || !n;
    return [
      [top, atProgress(story, STORY_LANDING)],
      [atProgress(story, STORY_HAND_OVER), stacked ? end : atProgress(cards, fadeStackIn(n))],
      ...(stacked
        ? []
        : fadeStackCrossings(n).map(
            ([a, b]): Segment => [atProgress(cards, a), atProgress(cards, b)],
          )),
    ];
  }, []);
  useScrollJump(segments, 1800);

  return (
    <main className="about-page">
      {/* THE MARK → RINGS → ONE LINE PER CHAPTER */}
      <div ref={storyRef}>
        <AboutStory chapters={chapters} scrollLabel={t.home.scroll} />
      </div>

      {/* THE THREE CARDS — one stage, cross-fading with the scroll */}
      <div ref={cardsRef}>
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
      </div>

    </main>
  );
}
