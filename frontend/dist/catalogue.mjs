const filters = [...document.querySelectorAll('[data-category][aria-pressed]')];
const items = [...document.querySelectorAll('.catalogue-item')];
const status = document.querySelector('#catalogue-status');
const empty = document.querySelector('.catalogue-empty');
const dialog = document.querySelector('#gallery-dialog');
const fullImage = dialog.querySelector('.gallery-full-image');
const closeButton = dialog.querySelector('.gallery-close');
let opener;

// Keep the lowest frame above the floor in the original room photograph.
const roomSection=document.querySelector('.room-page-content');
const catalogueGrid=document.querySelector('.catalogue-grid');
function fitCatalogueWall(){
  const bottom=catalogueGrid.getBoundingClientRect().bottom-roomSection.getBoundingClientRect().top;
  roomSection.style.minHeight=Math.ceil(Math.max(innerHeight,(bottom+32)/.72))+'px';
}
new ResizeObserver(fitCatalogueWall).observe(catalogueGrid);
window.addEventListener('resize',fitCatalogueWall);
document.fonts.ready.then(fitCatalogueWall);

function filterCategory(category, updateHistory = false) {
  const selected = filters.some(button => button.dataset.category === category) ? category : 'all';
  filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.category === selected)));
  let count = 0;
  items.forEach(item => {
    item.hidden = selected !== 'all' && item.dataset.category !== selected;
    if (!item.hidden) count += 1;
  });
  empty.hidden = count > 0;
  status.textContent = `${count} ${count === 1 ? 'imagem' : 'imagens'} no catálogo.`;
  if (updateHistory) {
    const url = new URL(location.href);
    if (selected === 'all') url.searchParams.delete('categoria');
    else url.searchParams.set('categoria', selected);
    history.replaceState(null, '', url);
  }
}
filters.forEach(button => button.addEventListener('click', () => filterCategory(button.dataset.category, true)));
filterCategory(new URL(location.href).searchParams.get('categoria') || 'all');
window.addEventListener('popstate', () => filterCategory(new URL(location.href).searchParams.get('categoria') || 'all'));

document.querySelectorAll('[data-gallery-image]').forEach(link => {
  link.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || typeof dialog.showModal !== 'function') return;
    event.preventDefault();
    opener = link;
    fullImage.src = link.href;
    fullImage.alt = link.querySelector('img').alt;
    dialog.querySelector('.gallery-label').textContent = link.dataset.label;
    dialog.querySelector('.gallery-title').textContent = link.dataset.title;
    dialog.showModal();
    closeButton.focus();
  });
});
closeButton.addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
});
dialog.addEventListener('close', () => opener?.focus());
