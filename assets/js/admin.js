/* ═══════════════════════════════════════════════════════
   CAPIARCOS · ADMIN  client
═══════════════════════════════════════════════════════ */

const $ = (q, el = document) => el.querySelector(q);
const state = { current: null, manifest: null };

/* ── API ───────────────────────────────────────────── */
const API = {
  me:       () => fetch('/api/me').then(r => r.json()),
  login:    (password) => fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  }),
  logout:   () => fetch('/api/logout', { method: 'POST' }),
  manifest: () => fetch('/api/manifest', { cache: 'no-store' }).then(r => r.json()),
  delete:   (categoria, file) =>
    fetch(`/api/image?categoria=${encodeURIComponent(categoria)}&file=${encodeURIComponent(file)}`, { method: 'DELETE' }),
  upload:   (categoria, files, onProgress) => new Promise((resolve, reject) => {
    const fd = new FormData();
    for (const f of files) fd.append('files', f);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `/api/upload?categoria=${encodeURIComponent(categoria)}`);
    xhr.upload.onprogress = e => { if (e.lengthComputable && onProgress) onProgress(e.loaded / e.total); };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try { resolve(JSON.parse(xhr.responseText)); } catch { resolve({ ok: true }); }
      } else reject(new Error(`upload-failed-${xhr.status}`));
    };
    xhr.onerror = () => reject(new Error('network'));
    xhr.send(fd);
  }),
};

/* ── Boot ──────────────────────────────────────────── */
init();
async function init() {
  try {
    const { authed } = await API.me();
    authed ? showApp() : showLogin();
  } catch {
    showLogin();
  }
}

/* ── Login ─────────────────────────────────────────── */
$('#login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const err = $('#login-err'); err.textContent = '';
  const r = await API.login($('#pw').value);
  if (r.ok) {
    showApp();
  } else {
    err.textContent = 'Password incorrecta.';
    $('#pw').focus();
    $('#pw').select();
  }
});

$('#logout').addEventListener('click', async () => {
  await API.logout();
  location.reload();
});

function showLogin() {
  $('#login').hidden = false;
  $('#app').hidden = true;
}
async function showApp() {
  $('#login').hidden = true;
  $('#app').hidden = false;
  await loadManifest(true);
}

/* ── Manifest + render ─────────────────────────────── */
async function loadManifest(autoSelectFirst = false) {
  state.manifest = await API.manifest();
  if (!state.current || !state.manifest.categories.find(c => c.slug === state.current)) {
    state.current = autoSelectFirst ? state.manifest.categories[0].slug : state.current;
  }
  renderSidebar();
  renderPane();
}

function renderSidebar() {
  const list = $('#side-list');
  list.innerHTML = '';
  let total = 0;
  for (const c of state.manifest.categories) {
    const n = (state.manifest.items[c.slug] || []).length;
    total += n;
    const btn = document.createElement('button');
    btn.className = 'cat-btn' + (state.current === c.slug ? ' on' : '');
    btn.innerHTML = `<span>${escapeHtml(c.label)}</span><span class="num">${n}</span>`;
    btn.addEventListener('click', () => {
      state.current = c.slug;
      renderSidebar();
      renderPane();
    });
    list.appendChild(btn);
  }
  $('#total-count').textContent = String(total);
}

function renderPane() {
  const cat = state.manifest.categories.find(c => c.slug === state.current);
  const items = state.manifest.items[state.current] || [];
  $('#pane-title').textContent = cat.label;
  $('#pane-count').textContent = items.length === 1 ? '1 imagem' : `${items.length} imagens`;
  renderGrid(items);
}

function renderGrid(items) {
  const g = $('#grid');
  g.innerHTML = '';
  if (!items.length) {
    g.innerHTML = `<div class="empty">Sem imagens nesta categoria. Arrasta algumas para começar.</div>`;
    return;
  }
  for (const it of items) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.innerHTML = `
      <img src="${it.url}" alt="${escapeHtml(it.file)}" loading="lazy">
      <button class="del" title="Apagar" aria-label="Apagar ${escapeHtml(it.file)}">×</button>
      <div class="cell-name">${escapeHtml(it.file)}</div>
    `;
    cell.querySelector('.del').addEventListener('click', async (e) => {
      e.stopPropagation();
      if (!confirm(`Apagar "${it.file}" definitivamente?`)) return;
      const r = await API.delete(state.current, it.file);
      if (r.ok) {
        await loadManifest();
        toast('Imagem apagada.', 'ok');
      } else {
        toast('Não foi possível apagar.', 'err');
      }
    });
    cell.addEventListener('click', (e) => {
      if (e.target.closest('.del')) return;
      window.open(it.url, '_blank');
    });
    g.appendChild(cell);
  }
}

/* ── Dropzone ──────────────────────────────────────── */
const dz = $('#dz');
const fi = $('#files');

dz.addEventListener('click', (e) => {
  if (e.target.closest('.dz-prog')) return;
  fi.click();
});
fi.addEventListener('change', () => {
  upload([...fi.files]);
  fi.value = '';
});
['dragenter', 'dragover'].forEach(ev =>
  dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.add('over'); })
);
['dragleave', 'drop'].forEach(ev =>
  dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.remove('over'); })
);
dz.addEventListener('drop', (e) => {
  const files = [...(e.dataTransfer?.files || [])].filter(f => /^image\//.test(f.type));
  if (files.length) upload(files);
});

/* Global drag-and-drop catch — drop anywhere = upload to current category */
window.addEventListener('dragover', (e) => { e.preventDefault(); });
window.addEventListener('drop',     (e) => {
  e.preventDefault();
  if (e.target.closest('.dz')) return; // dz handler already fires
  const files = [...(e.dataTransfer?.files || [])].filter(f => /^image\//.test(f.type));
  if (files.length) upload(files);
});

async function upload(files) {
  if (!files.length || !state.current) return;
  const prog = $('#dz-prog');
  const fill = $('#dz-fill');
  const lbl  = $('#dz-lbl');
  prog.hidden = false;
  fill.style.width = '0%';
  lbl.textContent = `A carregar ${files.length} imagem${files.length === 1 ? '' : 's'}…`;

  try {
    await API.upload(state.current, files, (p) => {
      fill.style.width = (p * 100).toFixed(1) + '%';
    });
    toast(`${files.length} imagem${files.length === 1 ? '' : 's'} carregada${files.length === 1 ? '' : 's'}.`, 'ok');
    await loadManifest();
  } catch (err) {
    console.error(err);
    toast('Erro no upload. Verifica o tamanho/formato.', 'err');
  } finally {
    setTimeout(() => { prog.hidden = true; }, 400);
  }
}

/* ── Toast ─────────────────────────────────────────── */
let toastTimer;
function toast(msg, type = '') {
  const t = $('#toast');
  t.textContent = msg;
  t.className = 'toast' + (type ? ' ' + type : '');
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.hidden = true; }, 2600);
}

/* ── Utils ─────────────────────────────────────────── */
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, ch => (
    { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[ch]
  ));
}
