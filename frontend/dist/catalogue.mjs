const filters = [...document.querySelectorAll('[data-category][aria-pressed]')];
const items = [...document.querySelectorAll('.catalogue-item')];
const status = document.querySelector('#catalogue-status');
const empty = document.querySelector('.catalogue-empty');
const dialog = document.querySelector('#gallery-dialog');
const fullImage = dialog.querySelector('.gallery-full-image');
const closeButton = dialog.querySelector('.gallery-close');
let opener;

// Two desktop rows preserve the original room and keep frames off its floor.
let page=0,selectedCategory='all';
const pager=document.createElement('nav');
pager.className='catalogue-pagination';pager.setAttribute('aria-label','Páginas do catálogo');
const previous=document.createElement('button'),next=document.createElement('button'),pageLabel=document.createElement('span');
previous.type=next.type='button';previous.textContent='‹';next.textContent='›';
previous.setAttribute('aria-label','Página anterior');next.setAttribute('aria-label','Página seguinte');
pager.append(previous,pageLabel,next);document.querySelector('#catalogue-grid').after(pager);
const grid=document.querySelector('#catalogue-grid');
let renderVersion=0;
async function renderPage(animate=false){
 const version=++renderVersion;
 grid.getAnimations().forEach(animation=>animation.cancel());
 const motion=animate&&!matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(motion){await grid.animate([{opacity:1},{opacity:0}],{duration:160,fill:'forwards',easing:'ease-out'}).finished.catch(()=>{});if(version!==renderVersion)return;}
 const matching=items.filter(item=>selectedCategory==='all'||item.dataset.category===selectedCategory);
 const size=innerWidth<=600?2:innerWidth<=1050?6:10;
 const pages=Math.max(1,Math.ceil(matching.length/size));page=Math.min(page,pages-1);
 items.forEach(item=>item.hidden=true);
 matching.slice(page*size,(page+1)*size).forEach(item=>item.hidden=false);
 previous.disabled=page===0;next.disabled=page===pages-1;pager.hidden=matching.length===0;
 pageLabel.textContent=`${page+1} / ${pages}`;
 empty.hidden=matching.length>0;
 status.textContent=`${matching.length} imagens no catálogo. Página ${page+1} de ${pages}.`;
 grid.getAnimations().forEach(animation=>animation.cancel());
 if(motion)grid.animate([{opacity:0,transform:'translateY(5px)'},{opacity:1,transform:'translateY(0)'}],{duration:300,easing:'ease-out'});
}
previous.onclick=()=>{page=Math.max(0,page-1);renderPage(true);};next.onclick=()=>{page++;renderPage(true);};
window.addEventListener('resize',()=>renderPage());

function filterCategory(category, updateHistory = false) {
  const selected = filters.some(button => button.dataset.category === category) ? category : 'all';
  filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.category === selected)));
  selectedCategory=selected;page=0;renderPage(updateHistory);
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
