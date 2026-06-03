'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function AdminLogin() {
  const router = useRouter();
  const [user, setUser] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch('/api/me')
      .then((r) => r.json())
      .then(({ authed }) => { if (authed) router.replace('/capi-gest-admin'); })
      .catch(() => {});
  }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user, password: pw }),
      });
      if (res.ok) router.replace('/capi-gest-admin');
      else setErr('Utilizador ou password incorrectos.');
    } catch {
      setErr('Não foi possível contactar o servidor.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="login-bg">
      <form className="login-card" onSubmit={onSubmit} autoComplete="off">
        <Image className="login-logo" src="/assets/img/logo.png" alt="Capiarcos" width={180} height={44} />
        <h1 className="login-h">Plataforma de gestão</h1>
        <p className="login-sub">Catálogo de imagens · Capiarcos</p>

        <label className="login-lbl" htmlFor="user">Utilizador</label>
        <input id="user" type="text" autoComplete="username" required autoFocus value={user} onChange={(e) => setUser(e.target.value)} />

        <label className="login-lbl" htmlFor="pw">Password</label>
        <input id="pw" type="password" autoComplete="current-password" required value={pw} onChange={(e) => setPw(e.target.value)} />

        <button type="submit" className="login-btn" disabled={busy}>{busy ? 'A entrar…' : 'Entrar'}</button>
        {err && <p className="login-err" aria-live="polite">{err}</p>}

        <Link href="/" className="login-back">← Voltar ao site</Link>
      </form>
    </main>
  );
}
