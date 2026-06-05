import type { Metadata } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '@/lib/i18n';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

const serif = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

const sans = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Capiarcos — Carpintaria por medida',
  description:
    'Capiarcos — Carpintaria com fábrica própria desde 1998. Cozinhas, roupeiros, pavimentos e mobiliário por medida em Arcos de Valdevez.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt" className={`${serif.variable} ${sans.variable}`}>
      <body>
        <LanguageProvider>
          <Nav />
          {children}
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
