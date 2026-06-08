'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useLang, type Lang } from '@/lib/i18n';

const LINKS = [
  { href: '/', key: 'home' },
  { href: '/empresa', key: 'empresa' },
  { href: '/catalogo', key: 'catalogo' },
  { href: '/contactos', key: 'contactos' },
] as const;

export default function Footer() {
  const { t, lang, setLang } = useLang();
  const pathname = usePathname() || '/';
  const langs: Lang[] = ['pt', 'en', 'fr'];

  if (pathname.startsWith('/ca-guest-admin')) return null;

  return (
    <footer>
      <div className="wrap">
        <div className="ft-top">
          <div className="ft-brand">
            <Image src="/assets/img/logo.png" alt="Capiarcos" width={866} height={288} style={{ height: 'auto' }} />
            <p className="ft-brand-desc">Cozinhas, roupeiros, escadas, pavimentos e mobiliário interior. Fabricados por nós, do esboço à montagem.</p>
          </div>

          <div>
            <div className="ft-col-t">{t.ft.links}</div>
            <ul className="ft-links">
              {LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href}>{t.nav[l.key]}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="ft-col-t">{t.ft.contacto}</div>
            <div className="ft-ci">
              <span className="ft-ci-l">{t.contactos.addr}</span>
              <span className="ft-ci-v">
                Zona Industrial de Mogueiras – Tabaço<br />4970-685 Arcos de Valdevez
              </span>
            </div>
            <div className="ft-ci">
              <span className="ft-ci-l">Tlf</span>
              <span className="ft-ci-v">258 522 978 <span className="callcost">{t.ft.landline_call}</span></span>
            </div>
            <div className="ft-ci">
              <span className="ft-ci-l">Tlm</span>
              <span className="ft-ci-v">
                935 229 788 <span className="callcost">{t.ft.mobile_call}</span><br />
                935 229 789 <span className="callcost">{t.ft.mobile_call}</span>
              </span>
            </div>
            <div className="ft-ci">
              <span className="ft-ci-l">{t.contactos.email}</span>
              <span className="ft-ci-v">patriciacapiarcos@sapo.pt</span>
            </div>
          </div>
        </div>

        <div className="ft-bot">
          <div className="ft-bot-left">
            <span className="ft-copy">{t.ft.copy}</span>
          </div>
          <div className="ft-bot-center">
            <a
              href="https://www.livroreclamacoes.pt/"
              target="_blank"
              rel="noopener noreferrer"
              className="ft-bot-link"
            >
              {t.ft.complaints_book}
            </a>
          </div>
          <div className="ft-bot-right">
            <div className="ft-lang">
              {langs.map((l) => (
                <button key={l} className={lang === l ? 'on' : ''} onClick={() => setLang(l)}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
