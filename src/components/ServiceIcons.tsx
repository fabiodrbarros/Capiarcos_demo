import type { ReactNode } from 'react';

/**
 * Line icons for the 12 services, in the same order as t.empresa.svc:
 * 0 Cozinhas · 1 Roupeiros · 2 Salas · 3 Quartos · 4 Casas de Banho ·
 * 5 Pavimentos · 6 Tampos · 7 Portas · 8 Escadas · 9 Sapateiras ·
 * 10 Escritórios e Bibliotecas · 11 Consolas e Vitrais
 */
const P = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.4,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export const SERVICE_ICONS: ReactNode[] = [
  // 0 — Cozinhas (cooktop)
  <svg key="c" {...P}><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.6" /><circle cx="15.5" cy="8.5" r="1.6" /><circle cx="8.5" cy="15.5" r="1.6" /><circle cx="15.5" cy="15.5" r="1.6" /></svg>,
  // 1 — Roupeiros (wardrobe)
  <svg key="r" {...P}><rect x="4" y="3" width="16" height="18" rx="1" /><line x1="12" y1="3" x2="12" y2="21" /><line x1="10" y1="10" x2="10" y2="13" /><line x1="14" y1="10" x2="14" y2="13" /></svg>,
  // 2 — Salas (sofa)
  <svg key="s" {...P}><path d="M4 11V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3" /><rect x="2.5" y="11" width="19" height="6" rx="2" /><line x1="6" y1="17" x2="6" y2="20" /><line x1="18" y1="17" x2="18" y2="20" /></svg>,
  // 3 — Quartos (bed)
  <svg key="q" {...P}><path d="M2 17v-5h20v5" /><path d="M5 12V8h6v4" /><line x1="2" y1="17" x2="2" y2="20" /><line x1="22" y1="17" x2="22" y2="20" /></svg>,
  // 4 — Casas de Banho (bathtub)
  <svg key="b" {...P}><path d="M5 12V6.5a2 2 0 0 1 4 0" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M3 12v2a4 4 0 0 0 4 4h10a4 4 0 0 0 4-4v-2" /><line x1="7" y1="18" x2="7" y2="20.5" /><line x1="17" y1="18" x2="17" y2="20.5" /></svg>,
  // 5 — Pavimentos (flooring planks)
  <svg key="p" {...P}><rect x="3" y="4" width="18" height="16" rx="1" /><line x1="3" y1="9.3" x2="21" y2="9.3" /><line x1="3" y1="14.6" x2="21" y2="14.6" /><line x1="10" y1="4" x2="10" y2="9.3" /><line x1="15" y1="9.3" x2="15" y2="14.6" /><line x1="8" y1="14.6" x2="8" y2="20" /></svg>,
  // 6 — Tampos (worktop / table)
  <svg key="t" {...P}><rect x="3" y="8" width="18" height="3.5" rx="1" /><line x1="6" y1="11.5" x2="6" y2="18" /><line x1="18" y1="11.5" x2="18" y2="18" /></svg>,
  // 7 — Portas (door)
  <svg key="d" {...P}><rect x="5" y="3" width="14" height="18" rx="1" /><circle cx="15.5" cy="12" r="1" /></svg>,
  // 8 — Escadas (stairs)
  <svg key="e" {...P}><path d="M3 21v-4h4v-4h4v-4h4V5h4" /></svg>,
  // 9 — Sapateiras (shoe)
  <svg key="sh" {...P}><path d="M3 16v-5l4 1.4 3-3 1.2 3H17a4 4 0 0 1 4 4V17H3z" /><line x1="6" y1="13" x2="6.6" y2="14.6" /></svg>,
  // 10 — Escritórios e Bibliotecas (open book)
  <svg key="lib" {...P}><path d="M12 6c-1.6-1-4-1.6-6-1.6S2 5 2 5v13s2-.6 4-.6 4.4.6 6 1.6" /><path d="M12 6c1.6-1 4-1.6 6-1.6S22 5 22 5v13s-2-.6-4-.6-4.4.6-6 1.6V6z" /></svg>,
  // 11 — Consolas e Vitrais (window pane)
  <svg key="w" {...P}><rect x="4" y="3" width="16" height="18" rx="1" /><line x1="12" y1="3" x2="12" y2="21" /><line x1="4" y1="12" x2="20" y2="12" /></svg>,
];

export function ServiceIcon({ i }: { i: number }) {
  return <>{SERVICE_ICONS[i] ?? SERVICE_ICONS[0]}</>;
}
