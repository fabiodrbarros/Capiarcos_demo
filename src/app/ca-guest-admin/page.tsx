'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

type Category = { slug: string; label: string; label_en: string; label_fr: string };
type Item = { file: string; url: string; mtime: number; title?: string };
type Manifest = { categories: Category[]; items: Record<string, Item[]> };
type CatModal = { mode: 'new' } | { mode: 'edit'; slug: string } | null;

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
  const [catModal, setCatModal] = useState<CatModal>(null);
  const [catPt, setCatPt] = useState('');
  const [catEn, setCatEn] = useState('');
  const [catFr, setCatFr] = useState('');
  const [catBusy, setCatBusy] = useState(false);
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

  const openNewCat = useCallback(() => {
    setCatPt(''); setCatEn(''); setCatFr('');
    setCatModal({ mode: 'new' });
  }, []);

  const openEditCat = useCallback((c: Category) => {
    setCatPt(c.label); setCatEn(c.label_en); setCatFr(c.label_fr);
    setCatModal({ mode: 'edit', slug: c.slug });
  }, []);

  const submitCat = useCallback(async () => {
    if (!catPt.trim() || !catModal) return;
    setCatBusy(true);
    try {
      const isEdit = catModal.mode === 'edit';
      const r = await fetch('/api/categories', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(isEdit ? { slug: catModal.slug } : {}),
          label: catPt.trim(),
          label_en: catEn.trim(),
          label_fr: catFr.trim(),
        }),
      });
      if (r.status === 401) { router.replace('/ca-guest-admin/login'); return; }
      if (!r.ok) { showToast('Não foi possível guardar a categoria.', 'err'); return; }
      const data = await r.json();
      setCatModal(null);
      await loadManifest();
      if (!isEdit && data?.category?.slug) setCurrent(data.category.slug);
      showToast(isEdit ? 'Categoria atualizada.' : 'Categoria criada.', 'ok');
    } catch {
      showToast('Erro de rede.', 'err');
    } finally {
      setCatBusy(false);
    }
  }, [catPt, catEn, catFr, catModal, loadManifest, router, showToast]);

  const deleteCat = useCallback(async (c: Category) => {
    const n = manifest.items[c.slug]?.length || 0;
    const warn = n > 0
      ? `Apagar a categoria "${c.label}" e as suas ${n} imagem${n === 1 ? '' : 's'} definitivamente?`
      : `Apagar a categoria "${c.label}"?`;
    if (!confirm(warn)) return;
    const r = await fetch(`/api/categories?slug=${encodeURIComponent(c.slug)}`, { method: 'DELETE' });
    if (r.status === 401) { router.replace('/ca-guest-admin/login'); return; }
    if (!r.ok) { showToast('Não foi possível apagar.', 'err'); return; }
    setCurrent((cur) => (cur === c.slug ? '' : cur));
    await loadManifest(true);
    showToast('Categoria apagada.', 'ok');
  }, [manifest, loadManifest, router, showToast]);

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
          <div className="side-head">
            <span>Categorias</span>
            <button className="side-add" onClick={openNewCat} title="Nova categoria" aria-label="Nova categoria">+</button>
          </div>
          <div className="side-list">
            {manifest.categories.map((c) => {
              const n = manifest.items[c.slug]?.length || 0;
              return (
                <div key={c.slug} className={`cat-item${current === c.slug ? ' on' : ''}`}>
                  <button className="cat-btn" onClick={() => setCurrent(c.slug)}>
                    <span>{c.label}</span><span className="num">{n}</span>
                  </button>
                  <div className="cat-item-acts">
                    <button className="cat-act" title="Editar" aria-label={`Editar ${c.label}`} onClick={() => openEditCat(c)}>
                      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round"><path d="M11.5 2.5l2 2L6 12l-2.5.5L4 10z" /></svg>
                    </button>
                    <button className="cat-act cat-act-del" title="Apagar" aria-label={`Apagar ${c.label}`} onClick={() => deleteCat(c)}>
                      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round"><path d="M3 4h10M6 4V2.5h4V4M5 4l.5 9h5L11 4" /></svg>
                    </button>
                  </div>
                </div>
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
                <div key={it.file} className="cell">
                  <div className="cell-thumb" onClick={(e) => { if (!(e.target as HTMLElement).closest('.del')) window.open(it.url, '_blank'); }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={it.url} alt={it.title || it.file} loading="lazy" />
                    <button className="del" title="Apagar" aria-label={`Apagar ${it.file}`} onClick={(e) => { e.stopPropagation(); remove(it.file); }}>×</button>
                  </div>
                  <div className="cell-cap">
                    {it.title
                      ? <span className="cell-title">{it.title}</span>
                      : <span className="cell-untitled">Sem título</span>}
                    <span className="cell-file">{it.file}</span>
                  </div>
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

      {catModal && (
        <div className="admin-modal-bg" onClick={() => !catBusy && setCatModal(null)}>
          <div className="admin-modal admin-modal--cat" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-head">
              <div>
                <span className="admin-modal-tag">{catModal.mode === 'edit' ? 'Editar categoria' : 'Nova categoria'}</span>
                <h3 className="admin-modal-title">{catModal.mode === 'edit' ? catPt || '—' : 'Adicionar categoria'}</h3>
              </div>
              <button className="admin-modal-close" aria-label="Fechar" onClick={() => setCatModal(null)}>×</button>
            </div>

            <div className="dz-title">
              <label htmlFor="cat-pt">Nome (Português)</label>
              <input
                id="cat-pt"
                type="text"
                placeholder="Ex.: Móveis de escritório"
                value={catPt}
                autoFocus
                onChange={(e) => setCatPt(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') submitCat(); }}
              />
            </div>

            <p className="cat-hint">
              {catModal.mode === 'edit'
                ? 'Podes ajustar as traduções abaixo. Se deixares vazias, é usado o nome em português.'
                : 'As traduções (EN/FR) são geradas automaticamente. Podes preenchê-las à mão para forçar um valor.'}
            </p>

            <div className="cat-tr-grid">
              <div className="dz-title">
                <label htmlFor="cat-en">Inglês <span className="opt">(opcional)</span></label>
                <input id="cat-en" type="text" placeholder="auto" value={catEn} onChange={(e) => setCatEn(e.target.value)} />
              </div>
              <div className="dz-title">
                <label htmlFor="cat-fr">Francês <span className="opt">(opcional)</span></label>
                <input id="cat-fr" type="text" placeholder="auto" value={catFr} onChange={(e) => setCatFr(e.target.value)} />
              </div>
            </div>

            <div className="admin-modal-actions">
              <button className="btn-cancel" onClick={() => setCatModal(null)}>Cancelar</button>
              <button className="dz-submit" disabled={!catPt.trim() || catBusy} onClick={submitCat}>
                {catBusy ? 'A guardar…' : catModal.mode === 'edit' ? 'Guardar' : 'Criar categoria'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={`toast ${toast.type}`} style={{ display: 'block' }}>{toast.msg}</div>}
    </div>
  );
}
