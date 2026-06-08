'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

type Category = { slug: string; label: string };
type Item = { file: string; url: string; mtime: number; title?: string };
type Manifest = { categories: Category[]; items: Record<string, Item[]> };

export default function AdminDashboard() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [manifest, setManifest] = useState<Manifest>({ categories: [], items: {} });
  const [current, setCurrent] = useState<string>('');
  const [progress, setProgress] = useState<number | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string, type = '') => {
    setToast({ msg, type });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  const loadManifest = useCallback(async (autoSelect = false) => {
    const m: Manifest = await fetch('/api/manifest', { cache: 'no-store' }).then((r) => r.json());
    setManifest(m);
    setCurrent((cur) => {
      if (cur && m.categories.find((c) => c.slug === cur)) return cur;
      return autoSelect && m.categories[0] ? m.categories[0].slug : cur;
    });
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { authed } = await fetch('/api/me').then((r) => r.json());
        if (!authed) { router.replace('/ca-guest-admin/login'); return; }
        await loadManifest(true);
        setReady(true);
      } catch {
        router.replace('/ca-guest-admin/login');
      }
    })();
  }, [router, loadManifest]);

  const upload = useCallback((files: File[]) => {
    if (!files.length || !current) return;
    const fd = new FormData();
    for (const f of files) fd.append('files', f);
    fd.append('titulo', titleInput.trim());
    setProgress(0);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `/api/upload?categoria=${encodeURIComponent(current)}`);
    xhr.upload.onprogress = (e) => { if (e.lengthComputable) setProgress(e.loaded / e.total); };
    xhr.onload = async () => {
      setProgress(null);
      if (xhr.status >= 200 && xhr.status < 300) {
        showToast(`${files.length} imagem${files.length === 1 ? '' : 's'} carregada${files.length === 1 ? '' : 's'}.`, 'ok');
        setTitleInput('');
        setPendingFiles([]);
        setModalOpen(false);
        await loadManifest();
      } else if (xhr.status === 401) {
        router.replace('/ca-guest-admin/login');
      } else {
        showToast('Erro no upload. Verifica o tamanho/formato.', 'err');
      }
    };
    xhr.onerror = () => { setProgress(null); showToast('Erro de rede no upload.', 'err'); };
    xhr.send(fd);
  }, [current, loadManifest, router, showToast, titleInput]);

  const remove = useCallback(async (file: string) => {
    if (!confirm(`Apagar "${file}" definitivamente?`)) return;
    const r = await fetch(`/api/image?categoria=${encodeURIComponent(current)}&file=${encodeURIComponent(file)}`, { method: 'DELETE' });
    if (r.ok) { await loadManifest(); showToast('Imagem apagada.', 'ok'); }
    else if (r.status === 401) router.replace('/ca-guest-admin/login');
    else showToast('Não foi possível apagar.', 'err');
  }, [current, loadManifest, router, showToast]);

  if (!ready) return <div style={{ minHeight: '100vh' }} />;

  const cat = manifest.categories.find((c) => c.slug === current);
  const items = manifest.items[current] || [];
  const total = manifest.categories.reduce((n, c) => n + (manifest.items[c.slug]?.length || 0), 0);

  return (
    <div className="app">
      <header className="bar">
        <a href="/ca-guest-admin" className="bar-brand">
          <Image src="/assets/img/logo.png" alt="" width={120} height={30} />
          <div><strong>Capiarcos</strong><span>Admin · Catálogo</span></div>
        </a>
        <div className="bar-actions">
          <a href="/catalogo" target="_blank" rel="noopener noreferrer" className="bar-link">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round"><path d="M10 2h4v4M14 2 8 8M7 3H3v10h10V9" /></svg>
            Ver site
          </a>
          <button className="bar-link" onClick={async () => { await fetch('/api/logout', { method: 'POST' }); router.replace('/ca-guest-admin/login'); }}>Sair</button>
        </div>
      </header>

      <main className="layout">
        <nav className="side">
          <div className="side-head">Categorias</div>
          <div className="side-list">
            {manifest.categories.map((c) => {
              const n = manifest.items[c.slug]?.length || 0;
              return (
                <button key={c.slug} className={`cat-btn${current === c.slug ? ' on' : ''}`} onClick={() => setCurrent(c.slug)}>
                  <span>{c.label}</span><span className="num">{n}</span>
                </button>
              );
            })}
          </div>
          <div className="side-foot"><small>Total: <strong>{total}</strong> imagens</small></div>
        </nav>

        <section className="pane">
          <div className="pane-head">
            <div>
              <div className="pane-tag">Categoria selecionada</div>
              <h2 className="pane-title">{cat?.label || '—'}</h2>
            </div>
            <div className="pane-head-r">
              <span className="pane-count">{items.length === 1 ? '1 imagem' : `${items.length} imagens`}</span>
              <button className="pane-add" onClick={() => setModalOpen(true)}>+ Adicionar imagens</button>
            </div>
          </div>

          <div className="grid">
            {items.length === 0 ? (
              <div className="empty">Sem imagens nesta categoria. Arrasta algumas para começar.</div>
            ) : (
              items.map((it) => (
                <div key={it.file} className="cell" onClick={(e) => { if (!(e.target as HTMLElement).closest('.del')) window.open(it.url, '_blank'); }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={it.url} alt={it.file} loading="lazy" />
                  <button className="del" title="Apagar" aria-label={`Apagar ${it.file}`} onClick={(e) => { e.stopPropagation(); remove(it.file); }}>×</button>
                  <div className="cell-name">{it.title ? <span className="cell-title">{it.title}</span> : it.file}</div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      {modalOpen && (
        <div className="admin-modal-bg" onClick={() => progress === null && setModalOpen(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-head">
              <div>
                <span className="admin-modal-tag">Adicionar ao catálogo</span>
                <h3 className="admin-modal-title">{cat?.label}</h3>
              </div>
              <button className="admin-modal-close" aria-label="Fechar" onClick={() => setModalOpen(false)}>×</button>
            </div>

            <div className="dz-title">
              <label htmlFor="img-title">Título da imagem</label>
              <input
                id="img-title"
                type="text"
                placeholder="Ex.: Cozinha lacada a branco"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
              />
            </div>

            <div
              className={`dz${dragOver ? ' over' : ''}`}
              onClick={(e) => { if (!(e.target as HTMLElement).closest('.dz-clear')) fileInput.current?.click(); }}
              onDragEnter={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const files = [...(e.dataTransfer?.files || [])].filter((f) => /^image\//.test(f.type));
                if (files.length) setPendingFiles((prev) => [...prev, ...files]);
              }}
            >
              <input
                ref={fileInput}
                type="file"
                hidden
                multiple
                accept="image/*"
                onChange={(e) => { const fs = [...(e.target.files || [])].filter((f) => /^image\//.test(f.type)); if (fs.length) setPendingFiles((prev) => [...prev, ...fs]); e.target.value = ''; }}
              />
              {pendingFiles.length === 0 ? (
                <div className="dz-cta">
                  <svg className="dz-ico" viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth={1.3} strokeLinecap="round"><path d="M18 4v22M9 13l9-9 9 9M4 30h28" /></svg>
                  <div>
                    <strong>Arrasta imagens para aqui</strong>
                    <span>ou <em>clica</em> para escolher do computador</span>
                  </div>
                </div>
              ) : (
                <ul className="dz-files">
                  {pendingFiles.map((f, idx) => (
                    <li key={`${f.name}-${idx}`}>
                      <span>{f.name}</span>
                      <button className="dz-clear" aria-label="Remover" onClick={(e) => { e.stopPropagation(); setPendingFiles((prev) => prev.filter((_, k) => k !== idx)); }}>×</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="admin-modal-actions">
              <button className="btn-cancel" onClick={() => { setModalOpen(false); }}>Cancelar</button>
              <button
                className="dz-submit"
                disabled={!pendingFiles.length || progress !== null}
                onClick={() => upload(pendingFiles)}
              >
                {progress !== null
                  ? `A carregar… ${(progress * 100).toFixed(0)}%`
                  : `Adicionar${pendingFiles.length ? ` ${pendingFiles.length}` : ''}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={`toast ${toast.type}`} style={{ display: 'block' }}>{toast.msg}</div>}
    </div>
  );
}
