import {t,stageStatus} from '../i18n.mjs';
import {createWorld} from './world.mjs';
const body=document.body;
if(body.classList.contains('company-page')){
 const topics=[...document.querySelectorAll('.company-topic')],footer=document.querySelector('.brand-footer');
 const menu=document.querySelector('#menu'),circle=document.querySelector('.company-circle'),status=document.querySelector('.company-status');
 const main=document.querySelector('#conteudo'),scene=document.querySelector('.company-scene');
 const enabled=matchMedia('screen'),reduce=matchMedia('(prefers-reduced-motion:reduce)');
 const world=createWorld(body,reduce),WORLD=5,FOOTER=6;
 let current=0,locked=false,timer,release,epoch=0,wheel=0,lastWheel=0,touch=null,controller;
 const delay=ms=>new Promise(resolve=>{release=resolve;timer=setTimeout(()=>{release=null;resolve();},ms);});
 function finish(){clearTimeout(timer);release?.();release=null;world.finish();}
 function setScene(n){
  current=Math.max(0,Math.min(FOOTER,n));const step=Math.min(current,4),animated=enabled.matches;
  body.dataset.companyStage=String(current);
  body.classList.toggle('has-topic',current>0);body.classList.toggle('company-footer',animated&&current===FOOTER);
  circle.setAttribute('aria-hidden',String(!animated||current===0||current>=WORLD));
  circle.querySelector('.circle-fill').style.strokeDashoffset=String(100-step*25);
  circle.setAttribute('aria-valuemax','100');circle.setAttribute('aria-valuenow',String(step*25));
  circle.setAttribute('aria-valuetext',step?stageStatus(step,4,topics[step-1].querySelector('h2').textContent):t('Início'));
  circle.querySelector('strong').textContent=String(Math.max(1,step)).padStart(2,'0');
  topics.forEach((el,i)=>{const active=current<WORLD&&i===step-1;el.classList.toggle('is-active',active);el.inert=animated&&!active;el.setAttribute('aria-hidden',String(el.inert));});
  footer.inert=animated&&current!==FOOTER;
  status.textContent=current===WORLD?t('DE ARCOS DE VALDEVEZ PARA O MUNDO:')+' '+t('QUALIDADE ALÉM FRONTEIRAS!'):current===FOOTER?t('Rodapé'):animated&&current>0?stageStatus(current,4,topics[current-1].querySelector('h2').textContent):'';
 }
 async function go(n){
  if(locked||n<0||n>FOOTER||n===current)return;
  const version=++epoch,from=current;locked=true;wheel=0;main.setAttribute('aria-busy','true');
  try{
   if(n>=WORLD){await world.ready;if(version!==epoch)return;}
   if(from>=WORLD&&n<WORLD){await world.hide();if(version!==epoch)return;}
   if(n!==FOOTER&&scrollY>0)scrollTo({top:0,behavior:'instant'});
   setScene(n);
   if(n===WORLD&&from<WORLD)await world.show();
   else{
    world.settle(n>=WORLD);
    if(n===FOOTER)scrollTo({top:scene.offsetHeight,behavior:reduce.matches?'instant':'smooth'});
    if(!reduce.matches)await delay(1800);
   }
  }finally{if(version===epoch){locked=false;wheel=0;main.setAttribute('aria-busy','false');}}
 }
 function mode(){finish();body.classList.remove('company-initialized');body.classList.toggle('company-ready',enabled.matches);setScene(current);world.settle(!enabled.matches||current>=WORLD);void body.offsetHeight;body.classList.add('company-initialized');}
 function canRead(target,delta){const copy=target.closest('.topic-copy');return copy&&(delta>0?copy.scrollTop+copy.clientHeight<copy.scrollHeight-1:copy.scrollTop>1);}
 function wheelMove(e){
  if(!enabled.matches||menu.open||e.ctrlKey||Math.abs(e.deltaX)>Math.abs(e.deltaY))return;
  const now=performance.now(),idle=now-lastWheel>180;lastWheel=now;
  if(locked){e.preventDefault();wheel=0;return;}
  if(canRead(e.target,e.deltaY))return;
  if(current===FOOTER&&(e.deltaY>0||scrollY>1))return;
  e.preventDefault();if(idle)wheel=0;wheel+=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?innerHeight:1);
  if(Math.abs(wheel)>55)go(current+(wheel>0?1:-1));
 }
 function keyMove(e){
  if(!enabled.matches||menu.open||e.altKey||e.ctrlKey||e.metaKey||e.target.closest('a,button,input,textarea,select,[contenteditable]'))return;
  let n;if(['ArrowDown','PageDown',' '].includes(e.key))n=current+(e.shiftKey&&e.key===' '?-1:1);
  if(['ArrowUp','PageUp'].includes(e.key))n=current-1;if(e.key==='Home')n=0;if(e.key==='End')n=FOOTER;
  if(n===undefined)return;
  if(!locked&&current===FOOTER&&e.key!=='Home'&&(n>FOOTER||scrollY>1))return;
  const delta=n-current,copy=topics[current-1]?.querySelector('.topic-copy');
  e.preventDefault();if(locked||e.repeat)return;
  if(copy&&['ArrowDown','ArrowUp','PageDown','PageUp',' '].includes(e.key)&&canRead(copy,delta)){copy.scrollBy({top:Math.sign(delta)*(e.key.startsWith('Arrow')?60:copy.clientHeight*.8),behavior:'instant'});return;}
  go(n);
 }
 function stop(){epoch++;finish();world.cancel();controller?.abort();touch=null;locked=false;main.setAttribute('aria-busy','false');}
 function start(){
  stop();controller=new AbortController();const signal=controller.signal;
  enabled.addEventListener('change',mode,{signal});reduce.addEventListener('change',()=>{if(reduce.matches)finish();},{signal});
  window.addEventListener('resize',()=>{if(locked)finish();},{signal});
  window.addEventListener('wheel',wheelMove,{passive:false,signal});window.addEventListener('keydown',keyMove,{signal});
  window.addEventListener('touchstart',e=>{touch=e.touches.length===1?{x:e.touches[0].clientX,y:e.touches[0].clientY,scrolled:false}:null;},{passive:true,signal});
  window.addEventListener('touchmove',e=>{
   if(!touch||!enabled.matches||menu.open||e.touches.length!==1)return;
   const dy=touch.y-e.touches[0].clientY;
   if(!locked&&(canRead(e.target,dy)||(current===FOOTER&&(dy>0||scrollY>1)))){touch.scrolled=true;return;}
   e.preventDefault();
  },{passive:false,signal});
  window.addEventListener('touchend',e=>{
   const start=touch;touch=null;if(!start||!enabled.matches||menu.open||start.scrolled||locked)return;
   const dy=start.y-e.changedTouches[0].clientY,dx=start.x-e.changedTouches[0].clientX;
   if(Math.abs(dy)>55&&Math.abs(dy)>Math.abs(dx))go(current+(dy>0?1:-1));
  },{passive:true,signal});
  window.addEventListener('touchcancel',()=>{touch=null;},{signal});
  document.querySelector('.skip').addEventListener('click',()=>{if(enabled.matches&&current===0)go(1);},{signal});
  mode();
 }
 scrollTo({top:0,behavior:'instant'});
 window.addEventListener('pagehide',stop);window.addEventListener('pageshow',e=>{if(e.persisted)start();});start();
}
