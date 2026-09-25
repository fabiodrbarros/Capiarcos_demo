const filters = [...document.querySelectorAll('[data-category][aria-pressed]')];
const items = [...document.querySelectorAll('.catalogue-item')];
const status = document.querySelector('#catalogue-status');
const empty = document.querySelector('.catalogue-empty');
const dialog = document.querySelector('#gallery-dialog');
const fullImage = dialog.querySelector('.gallery-full-image');
const closeButton = dialog.querySelector('.gallery-close');
let opener;

// One row per page preserves the original room and keeps frames off its floor.
let page=0,selectedCategory='all';
const pager=document.createElement('nav');
pager.className='catalogue-pagination';pager.setAttribute('aria-label','Páginas do catálogo');
const previous=document.createElement('button'),next=document.createElement('button'),pageLabel=document.createElement('span');
previous.type=next.type='button';previous.textContent='Anterior';next.textContent='Seguinte';
pager.append(previous,pageLabel,next);document.querySelector('#catalogue-grid').after(pager);
function renderPage(){
 const matching=items.filter(item=>selectedCategory==='all'||item.dataset.category===selectedCategory);
 const size=innerWidth<=600?2:innerWidth<=1050?3:4;
 const pages=Math.max(1,Math.ceil(matching.length/size));page=Math.min(page,pages-1);
 items.forEach(item=>item.hidden=true);
 matching.slice(page*size,(page+1)*size).forEach(item=>item.hidden=false);
 previous.disabled=page===0;next.disabled=page===pages-1;pager.hidden=pages===1;
 pageLabel.textContent=`${page+1} / ${pages}`;
 empty.hidden=matching.length>0;
 status.textContent=`${matching.length} imagens no catálogo. Página ${page+1} de ${pages}.`;
}
previous.onclick=()=>{page--;renderPage();};next.onclick=()=>{page++;renderPage();};
window.addEventListener('resize',renderPage);

function filterCategory(category, updateHistory = false) {
  const selected = filters.some(button => button.dataset.category === category) ? category : 'all';
  filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.category === selected)));
  selectedCategory=selected;page=0;renderPage();
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
