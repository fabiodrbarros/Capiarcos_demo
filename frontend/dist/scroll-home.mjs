import { drawMaterialTiles, drawingsReady } from './material-tiles.mjs';
import { loadImage } from './image-assets.mjs';
import { TRANSITION_MS, transitionValue } from './chapter-timing.mjs';
import { cabinetLayout, cabinetPaths, materialSources, drawCabinet } from './material-story.mjs';
const clamp=v=>Math.max(0,Math.min(1,v));
const ease=(a,b,v)=>{const t=clamp((v-a)/(b-a));return t*t*(3-2*t);};
const mix=(a,b,t)=>a+(b-a)*t;
const body=document.body;
const main=document.querySelector('.fh-main');
main.setAttribute('aria-busy','false');
const panels=[...document.querySelectorAll('.fh-panel')];
const ids=panels.map(p=>p.id);
const controls=document.querySelector('.fh-controls');
const steps=[...controls.querySelectorAll('[data-go]')];
const prev=controls.querySelector('[data-prev]'),next=controls.querySelector('[data-next]');
const status=document.querySelector('#fh-status');
const hero=document.querySelector('.story-hero-logo'),signature=document.querySelector('.story-signature');
const frame=document.querySelector('.fh-scene-frame');
const cabinetAsset=loadImage('/assets/optimized/room-portugal-cabinet.webp','/assets/room-portugal-cabinet.png');
const furniture={finished:cabinetAsset.image};
const canvas=document.querySelector('.story-lines'),ctx=canvas.getContext('2d');
const categories=[...document.querySelectorAll('.fh-category-link')];
const slots=categories.map(a=>a.querySelector('.solution-object'));
// Only the target boxes are needed for the PNG animation; do not parse hidden SVG paths.
const morphs=slots.map(slot=>({svg:slot.querySelector('svg')}));
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let target=0,progress=0,raf=0,width=0,height=0,shapes=null,active=-1,stopped=false;
let transition=null;
let assetsReady=false,pendingChapter=null;
const assetNotice=document.createElement('p');
assetNotice.className='asset-notice';assetNotice.setAttribute('role','status');
document.querySelector('.home-scene').append(assetNotice);
Promise.all([drawingsReady,Promise.allSettled([cabinetAsset.ready])]).then(groups=>{
 assetsReady=true;
 const failed=groups.flat().some(result=>result.status==='rejected');
 assetNotice.textContent=failed?'Algumas imagens não carregaram. Recarregue a página ou consulte o catálogo pelo menu.':'';
 if(pendingChapter){const [index,focus]=pendingChapter;pendingChapter=null;go(index,focus);}
 schedule();
});
const footer=document.querySelector('.brand-footer');
const scene=document.querySelector('.home-scene');
footer.tabIndex=-1;
footer.inert=true;
const sizeFooter=()=>body.style.setProperty('--home-footer-height',`${footer.getBoundingClientRect().height}px`);
new ResizeObserver(sizeFooter).observe(footer);
sizeFooter();
let footerOpen=false,footerBusyUntil=0;
function go(index,focus=false){
 if(transition||performance.now()<footerBusyUntil)return;
 if(!assetsReady){pendingChapter=[index,focus];assetNotice.textContent='A carregar as imagens…';return;}
 if(index>4||footerOpen){
  const show=index>4;
  if(show===footerOpen)return;
  sizeFooter();footerOpen=show;body.classList.toggle('footer-open',show);footer.inert=!show;
  // The translated header/skip link must not receive invisible keyboard focus.
  scene.inert=show;
  document.querySelector('.fh-main').inert=show;
  footerBusyUntil=performance.now()+(reduced.matches?0:TRANSITION_MS);
  signature.inert=show;
  if(show){footer.scrollTop=0;target=5;status.textContent='Rodapé — Navegação e contactos';if(focus)footer.focus({preventScroll:true});}
  else{target=4;active=-1;setTimeout(()=>{if(index<4)go(index,focus);else{schedule();if(focus&&!document.querySelector('dialog[open]'))panels[4].focus({preventScroll:true});}},reduced.matches?0:TRANSITION_MS);}
  return;
 }
 index=Math.max(0,Math.min(4,index));
 if(index===target)return;
 target=index;
 transition=reduced.matches?null:{from:progress,to:index,start:performance.now()};
 main.setAttribute('aria-busy',String(!!transition));
 if(reduced.matches)progress=index;
 history.replaceState(null,'',`#${ids[index]}`);
  if(focus){const heading=panels[index].querySelector('h1,h2');heading.tabIndex=-1;setTimeout(()=>{if(!document.querySelector('dialog[open]')&&target===index)heading.focus({preventScroll:true});},reduced.matches?0:TRANSITION_MS);}
 schedule();
}
function schedule(){if(!raf&&!stopped)raf=requestAnimationFrame(tick);}
function renderLines(p,logoBox,room){
  const box=cabinetLayout(room,innerWidth,innerHeight);
  if(!ctx)return;
  // Supersample resting artwork, without making every animation frame as expensive.
  const d=transition?Math.min(devicePixelRatio||1,2):Math.min(Math.max(devicePixelRatio||1,2),3);
  if(width!==innerWidth||height!==innerHeight||canvas.width!==Math.round(innerWidth*d)||canvas.height!==Math.round(innerHeight*d)){
    width=innerWidth;height=innerHeight;
    canvas.width=Math.round(width*d);canvas.height=Math.round(height*d);
    ctx.setTransform(d,0,0,d,0,0);
    ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  }
  ctx.clearRect(0,0,width,height);
  drawCabinet(ctx,furniture,box,p);
  if(p>=3){const origin=scene.getBoundingClientRect(),panel=panels[4].getBoundingClientRect();drawMaterialTiles(ctx,morphs,p,materialSources(box),furniture.finished,{left:panel.left-origin.left,top:panel.top-origin.top,width:panel.width,height:panel.height},origin);return;}
  if(reduced.matches)return;
  if(!shapes||p<.12||p>1.02)return;
  const unfold=ease(.2,.9,p),alpha=ease(.12,.29,p)*(1-ease(.77,1.02,p));
  const paths=cabinetPaths(box);
  shapes.parts.forEach((part,k)=>{
    const path=paths[k%paths.length],lengths=path.slice(1).map((pt,i)=>Math.hypot(pt[0]-path[i][0],pt[1]-path[i][1]));
    const perimeter=lengths.reduce((a,b)=>a+b,0);
    ctx.beginPath();
    part.points.forEach(([sx,sy],j)=>{
      let distance=j/Math.max(1,part.points.length-1)*perimeter,edge=0;
      while(edge<lengths.length-1&&distance>lengths[edge]){distance-=lengths[edge];edge++;}
      const t=distance/lengths[edge],xx=mix(path[edge][0],path[edge+1][0],t),yy=mix(path[edge][1],path[edge+1][1],t);
      const startX=logoBox.x+sx/866*logoBox.w,startY=logoBox.y+sy/288*logoBox.h;
      const endX=xx,endY=yy;
      const px=mix(startX,endX,unfold),py=mix(startY,endY,unfold);
      j?ctx.lineTo(px,py):ctx.moveTo(px,py);
    });
    ctx.closePath();ctx.globalAlpha=alpha;ctx.lineWidth=mix(1.4,.9,unfold);ctx.strokeStyle=unfold>.55?'#665a4a':part.color==='gold'?'#caa23d':'#682725';ctx.stroke();
  });ctx.globalAlpha=1;
}
function tick(now=performance.now()){
  raf=0;if(stopped||document.hidden)return;
  if(transition){const state=transitionValue(transition.from,transition.to,now-transition.start);progress=state.value;if(state.done){transition=null;main.setAttribute('aria-busy','false');}}
  const p=reduced.matches?Math.round(progress):progress;
  const logoW=Math.min(480,Math.max(240,innerWidth*.34)),logoH=logoW*288/866;
  const origin={x:(innerWidth-logoW)/2,y:innerHeight*.5-logoH/2,w:logoW,h:logoH};
  const dockW=innerWidth<=700?96:144,dockH=dockW*288/866,dock=ease(.06,.72,p);
  hero.style.width=`${logoW}px`;hero.style.transform=`translate(${origin.x}px,${origin.y}px)`;hero.style.opacity=1-ease(.2,.49,p);
  signature.style.width=`${logoW}px`;signature.style.transform=`translate(${mix(origin.x,innerWidth-dockW-24,dock)}px,${mix(origin.y,innerHeight-dockH-20,dock)}px) scale(${mix(1,dockW/logoW,dock)})`;
  signature.style.pointerEvents=dock>.95?'auto':'none';signature.tabIndex=dock>.95?0:-1;
  document.querySelector('.story-scroll-cue').style.opacity=1-ease(.02,.25,p);
  const opacity=[1-ease(.12,.45,p),ease(.62,.96,p)*(1-ease(1.25,1.55,p)),ease(1.62,1.96,p)*(1-ease(2.22,2.55,p)),ease(2.6,2.94,p)*(1-ease(3.2,3.55,p)),p>=3?1:0];
  panels.forEach((panel,i)=>{
    panel.hidden=opacity[i]<.001;panel.inert=i===4?p<3.995:opacity[i]<.8;
    panel.style.opacity=opacity[i];panel.style.pointerEvents=panel.inert?'none':'auto';
    if(i<4)panel.querySelector('.fh-copy').style.transform=reduced.matches?'none':`translateY(${(1-opacity[i])*12}px)`;
  });
  const solutionTitle=document.querySelector('.fh-service-heading');solutionTitle.style.opacity=ease(3.66,3.96,p);
  document.querySelector('.fh-services>.fh-action').style.opacity=ease(3.85,4,p);
  const bounds=frame.getBoundingClientRect(),originBounds=scene.getBoundingClientRect();
  const room={left:bounds.left-originBounds.left,top:bounds.top-originBounds.top,width:bounds.width,height:bounds.height};
  categories.forEach((a,i)=>{
    // Supplied PNGs are painted on the canvas; retain SVGs only for no-JS fallback.
    const svg=slots[i].querySelector('svg');
    svg.style.opacity=0;svg.style.transform='none';
    a.querySelector('.solution-label').style.opacity=ease(3.86+i*.003,4,p);
  });
  renderLines(p,origin,room);
  const index=Math.max(0,Math.min(4,Math.round(p)));
  if(index!==active){active=index;body.dataset.scene=ids[index];steps.forEach((b,i)=>{if(i===index)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});status.textContent=`${index+1} de 5 — ${steps[index].textContent.trim()}`;controls.querySelector('.fh-counter').textContent=`0${index+1} / 05`;}
  prev.disabled=!!transition||p<.02;next.disabled=!!transition||p>3.98;
  if(transition)schedule();
}
body.classList.add('story-ready');controls.hidden=false;
panels.forEach(p=>p.hidden=false);
panels[4].tabIndex=-1;
// Each gesture triggers a complete timed chapter transition.
document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>go(ids.indexOf(b.dataset.go),!controls.contains(b))));
prev.addEventListener('click',()=>go(active-1));next.addEventListener('click',()=>go(active+1));
signature.addEventListener('click',event=>{event.preventDefault();go(0);});
addEventListener('resize',schedule);
panels[4].addEventListener('scroll',schedule,{passive:true});
addEventListener('popstate',()=>go(Math.max(0,ids.indexOf(location.hash.slice(1)))));
document.addEventListener('visibilitychange',schedule);
reduced.addEventListener('change',()=>{if(reduced.matches&&transition){progress=transition.to;transition=null;main.setAttribute('aria-busy','false');}schedule();});
document.addEventListener('keydown',event=>{
 if(event.altKey||event.ctrlKey||event.metaKey||document.querySelector('dialog[open]')||event.target.closest('input,textarea,select,button,[contenteditable="true"]'))return;
 if(!['ArrowRight','ArrowLeft','ArrowDown','ArrowUp','PageDown','PageUp',' '].includes(event.key))return;
 event.preventDefault();
 if(event.repeat||transition)return;
 const dir=['ArrowLeft','ArrowUp','PageUp'].includes(event.key)||(event.key===' '&&event.shiftKey)?-1:1;
 const surface=footerOpen?footer:panels[4];
 if(canScrollSolutions(surface,dir)){
  surface.scrollBy({top:dir*(event.key.startsWith('Arrow')?80:surface.clientHeight*.8),behavior:'instant'});
  return;
 }
 go(target+dir,true);
});
fetch('/assets/logo-shapes.json').then(r=>{if(!r.ok)throw Error('Logo');return r.json();}).then(data=>{shapes=data;schedule();}).catch(()=>{});
const initial=Math.max(0,ids.indexOf(location.hash.slice(1)));
// Deep links must respect the same decoded-image gate as wheel/touch navigation.
target=progress=0;
if(initial>0){pendingChapter=[initial,false];assetNotice.textContent='A carregar as imagens…';}
scrollTo({top:0,behavior:'instant'});
schedule();
addEventListener('pagehide',event=>{if(!event.persisted){stopped=true;cancelAnimationFrame(raf);}});
addEventListener('pageshow',()=>{stopped=false;schedule();});

function canScrollSolutions(element,dir){
 if(footerOpen)return dir>0||footer.scrollTop>2;
 const panel=panels[4];
 return !transition&&target===4&&panel.contains(element)&&
 (dir>0?panel.scrollTop+panel.clientHeight<panel.scrollHeight-2:panel.scrollTop>2);
}
let wheelSum=0,lastWheel=0,wheelArmed=true,touchStart=null;
addEventListener('wheel',event=>{
 if(document.querySelector('dialog[open]')||event.ctrlKey||Math.abs(event.deltaX)>Math.abs(event.deltaY))return;
 if(canScrollSolutions(event.target,Math.sign(event.deltaY)))return;
 event.preventDefault();const now=performance.now(),gap=now-lastWheel;lastWheel=now;
 if(gap>180){wheelSum=0;wheelArmed=true;}
 if(transition){wheelSum=0;wheelArmed=false;return;}
 if(!wheelArmed)return;
 wheelSum+=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?innerHeight:1);
 if(Math.abs(wheelSum)>=35){go(target+Math.sign(wheelSum));wheelSum=0;wheelArmed=false;}
},{passive:false});
addEventListener('touchstart',event=>{const t=event.touches[0];touchStart=event.touches.length===1?{x:t.clientX,y:t.clientY,element:event.target}:null;},{passive:true});
addEventListener('touchcancel',()=>{touchStart=null;},{passive:true});
addEventListener('touchmove',event=>{
 if(!touchStart||document.querySelector('dialog[open]'))return;
 const dy=touchStart.y-event.touches[0].clientY;
 if(canScrollSolutions(touchStart.element,Math.sign(dy)))touchStart.scrolled=true;else event.preventDefault();
},{passive:false});
addEventListener('touchend',event=>{
 if(!touchStart||document.querySelector('dialog[open]'))return;
 const t=event.changedTouches[0],dy=touchStart.y-t.clientY,dx=touchStart.x-t.clientX;
 if(!touchStart.scrolled&&Math.abs(dy)>45&&Math.abs(dy)>Math.abs(dx)&&!canScrollSolutions(touchStart.element,Math.sign(dy)))go(target+Math.sign(dy));
 touchStart=null;
},{passive:true});
