import {t,stageStatus} from '../i18n.mjs';
const body=document.body;
if(body.classList.contains('company-page')){
 const topics=[...document.querySelectorAll('.company-topic')],footer=document.querySelector('.brand-footer'),menu=document.querySelector('#menu'),circle=document.querySelector('.company-circle'),status=document.querySelector('.company-status');
 const enabled=matchMedia('(min-height:740px) and (min-width:360px)'),reduce=matchMedia('(prefers-reduced-motion:reduce)');
 let current=0,locked=false,timer,wheel=0,lastWheel=0,touchY=null,controller;
 function setScene(n){
  current=Math.max(0,Math.min(4,n));const step=Math.min(current,4),animated=enabled.matches;
  body.classList.toggle('has-topic',current>0);body.classList.toggle('company-footer',animated&&current===4);
  circle.setAttribute('aria-hidden',String(!animated||current===0));
  circle.querySelector('.circle-fill').style.strokeDashoffset=String(100-step*25);
  circle.setAttribute('aria-valuemax','100');circle.setAttribute('aria-valuenow',String(step*25));
  circle.setAttribute('aria-valuetext',step?stageStatus(step,4,topics[step-1].querySelector('h2').textContent):t('Início'));
  circle.querySelector('strong').textContent=String(Math.max(1,step)).padStart(2,'0');
  topics.forEach((el,i)=>{const active=i===step-1;el.classList.toggle('is-active',active);el.inert=animated&&!active;el.setAttribute('aria-hidden',String(el.inert));});
  footer.inert=animated&&current!==4;
  status.textContent=animated&&current>0&&current<5?stageStatus(current,4,topics[current-1].querySelector('h2').textContent):'';
 }
 function go(n){if(locked||n<0||n>4||n===current)return;locked=true;setScene(n);clearTimeout(timer);timer=setTimeout(()=>locked=false,reduce.matches?0:1800);}
 function mode(){clearTimeout(timer);locked=false;body.classList.remove('company-initialized');body.classList.toggle('company-ready',enabled.matches);setScene(current);void body.offsetHeight;body.classList.add('company-initialized');}
 function wheelMove(e){
  if(!enabled.matches||menu.open||e.ctrlKey)return;
  if(current===4&&!locked&&(e.deltaY>0||window.scrollY>0))return;
  e.preventDefault();const now=performance.now();if(locked){lastWheel=now;return;}
  if(now-lastWheel>180)wheel=0;lastWheel=now;wheel+=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?innerHeight:1);
  if(Math.abs(wheel)>55){go(current+(wheel>0?1:-1));wheel=0;}
 }
 function keyMove(e){
  if(!enabled.matches||menu.open||e.target.closest('a,button,input,textarea,select'))return;
  let n;if(['ArrowDown','PageDown',' '].includes(e.key))n=current+1;if(['ArrowUp','PageUp'].includes(e.key))n=current-1;if(e.key==='Home')n=0;if(e.key==='End')n=4;
  if(n===undefined)return;
  if(current===4&&!locked&&(n>4||window.scrollY>0))return;
  e.preventDefault();go(n);
 }
 function stop(){controller?.abort();clearTimeout(timer);touchY=null;locked=false;}
 function start(){
  stop();controller=new AbortController();const signal=controller.signal;
  enabled.addEventListener('change',mode,{signal});
  window.addEventListener('wheel',wheelMove,{passive:false,signal});window.addEventListener('keydown',keyMove,{signal});
  window.addEventListener('touchstart',e=>{touchY=e.touches.length===1?e.touches[0].clientY:null;},{passive:true,signal});
  window.addEventListener('touchmove',e=>{if(enabled.matches&&!menu.open&&e.touches.length===1&&(current!==4||locked||window.scrollY===0&&e.touches[0].clientY>touchY))e.preventDefault();},{passive:false,signal});
  window.addEventListener('touchend',e=>{if(touchY===null||!enabled.matches||menu.open)return;const delta=touchY-e.changedTouches[0].clientY;touchY=null;if(current===4&&(delta>0||window.scrollY>0))return;if(Math.abs(delta)>55)go(current+(delta>0?1:-1));},{passive:true,signal});
  document.querySelector('.skip').addEventListener('click',()=>{if(enabled.matches&&current===0)go(1);},{signal});
  mode();void body.offsetHeight;body.classList.add('company-initialized');
 }
 window.addEventListener('pagehide',stop);window.addEventListener('pageshow',e=>{if(e.persisted)start();});start();
}
