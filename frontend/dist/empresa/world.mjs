// Independent overlays: never edit the original logo element or image.
export function createWorld(body,reduced){
 const scene=body.querySelector('.world-chapter'),map=scene.querySelector('.world-map');
 const title=scene.querySelector('h2'),land=scene.querySelector('.world-land');
 const route=scene.querySelector('.world-route'),line=scene.querySelector('.travel-line');
 const labels=[...route.querySelectorAll('text,circle')];
 const logo=body.querySelector('.company-logo img'),room=body.querySelector('.company-scene');
 const threads=[...body.querySelectorAll('.world-threads>path')];
 let animations=[],visible=false,revision=0;
 const image=new Image();image.src='/empresa/globo-original.png';
 const ready=image.decode().catch(()=>{});
 function animate(el,frames,options){const a=el.animate(frames,{fill:'both',...options});animations.push(a);return a;}
 function cancel(){revision++;animations.forEach(a=>a.cancel());animations=[];}
 function finish(){animations.forEach(a=>{try{a.finish();}catch{}});}
 function settle(show){cancel();visible=show;body.classList.toggle('world-visible',show);scene.setAttribute('aria-hidden',String(!show));scene.inert=!show;}
 async function show(motion=true){
  if(visible)return;settle(true);
  if(!motion||reduced.matches)return;
  const version=revision;
  const lr=logo.getBoundingClientRect(),mr=map.getBoundingClientRect(),sr=room.getBoundingClientRect();
  const sx=lr.left+lr.width*.09-sr.left,sy=lr.top+lr.height*.27-sr.top;
  const ex=mr.left+mr.width*.64-sr.left,ey=mr.top+mr.height*.78-sr.top;
  threads.forEach((path,i)=>{
   const offset=(i-2.5)*7;
   path.setAttribute('d',`M${sx} ${sy} C${sx-30} ${sy-110-offset},${ex+110} ${ey+130+offset},${ex+offset} ${ey}`);
   const length=path.getTotalLength();path.style.strokeDasharray=length;
   animate(path,[{strokeDashoffset:length,opacity:0},{strokeDashoffset:length,opacity:1,offset:.05},{strokeDashoffset:0,opacity:.9,offset:.65},{strokeDashoffset:-length,opacity:0}],{duration:2300,delay:200+i*55,easing:'cubic-bezier(.4,0,.2,1)'});
  });
  animate(land,[{clipPath:'inset(100% 0 0 0)',opacity:0,transform:'translate(18px,28px) scale(.93)'},{clipPath:'inset(0% 0 0 0)',opacity:1,transform:'translate(0,0) scale(1)'}],{duration:1900,delay:600,easing:'cubic-bezier(.22,1,.36,1)'});
  animate(title,[{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:700,delay:2200});
  // Threads finish at 2775 ms; the route starts only after they have gone.
  animate(route,[{opacity:0},{opacity:1}],{duration:200,delay:2850});
  animate(line,[{strokeDasharray:'100',strokeDashoffset:100},{strokeDasharray:'100',strokeDashoffset:0}],{duration:800,delay:2950,easing:'ease-in-out'});
  labels.forEach(el=>animate(el,[{opacity:0},{opacity:1}],{duration:350,delay:3100}));
  await Promise.allSettled(animations.map(a=>a.finished));
  if(version===revision)settle(true);
 }
 async function hide(motion=true){
  if(!visible)return;cancel();const version=revision;
  if(motion&&!reduced.matches){animate(scene,[{opacity:1},{opacity:0}],{duration:400,easing:'ease-in'});await Promise.allSettled(animations.map(a=>a.finished));}
  if(version===revision)settle(false);
 }
 return {ready,show,hide,settle,finish,cancel};
}
