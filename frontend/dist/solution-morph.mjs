// Morph the registered cabinet edges into the existing perspective SVG paths.
// One persistent segment owns both endpoints throughout the entire transition.
const clamp=v=>Math.max(0,Math.min(1,v));
const ease=(a,b,v)=>{const t=clamp((v-a)/(b-a));return t*t*t*(t*(t*6-15)+10);};
const mix=(a,b,t)=>a+(b-a)*t;
const outlines=[
  [600,391,577,174],[606,398,197,165],[812,398,154,165],
  [974,398,197,165],[607,565,564,7],[600,386,577,6],
  [811,476,156,6],[811,555,156,7],[825,455,65,6],
  [825,460,65,6],[926,442,28,22],[865,520,49,29]
];

export function parseSegments(path){
  return [...path.matchAll(/M\s*([\d.-]+)[ ,]+([\d.-]+)\s*L\s*([\d.-]+)[ ,]+([\d.-]+)/g)]
    .map(m=>m.slice(1).map(Number));
}

export function sourceSegments(rect,count){
  const [x,y,w,h]=rect;
  const edges=[[x,y,x+w,y],[x+w,y,x+w,y+h],[x+w,y+h,x,y+h],[x,y+h,x,y]];
  const lengths=[w,h,w,h],counts=lengths.map(l=>Math.max(1,Math.floor(count*l/(2*(w+h)))));
  while(counts.reduce((a,b)=>a+b,0)<count){
    const i=lengths.map((l,i)=>l/counts[i]).indexOf(Math.max(...lengths.map((l,i)=>l/counts[i])));counts[i]++;
  }
  while(counts.reduce((a,b)=>a+b,0)>count){const i=counts.indexOf(Math.max(...counts));counts[i]--;}
  return edges.flatMap(([ax,ay,bx,by],i)=>Array.from({length:counts[i]},(_,j)=>[
    mix(ax,bx,j/counts[i]),mix(ay,by,j/counts[i]),mix(ax,bx,(j+1)/counts[i]),mix(ay,by,(j+1)/counts[i])
  ]));
}

export function createSolutionMorphs(slots){
  return slots.map((slot,i)=>{
    const svg=slot.querySelector('svg');
    const target=[...svg.querySelectorAll('path')].flatMap(p=>parseSegments(p.getAttribute('d')));
    // Angular ordering keeps neighbouring strands together as the outline opens.
    target.sort((a,b)=>Math.atan2((a[1]+a[3])/2-50,(a[0]+a[2])/2-80)-Math.atan2((b[1]+b[3])/2-50,(b[0]+b[2])/2-80));
    return {svg,target,source:sourceSegments(outlines[i],target.length),color:getComputedStyle(svg).stroke};
  });
}

export function morphSegment(source,target,t){return source.map((v,i)=>mix(v,target[i],t));}

export function departureState(segment,p){
  const launch=3.14+clamp(segment)*.16;
  return {travel:ease(launch,launch+.6,p),ink:ease(launch+.025,launch+.13,p)};
}

export function drawSolutionMorphs(ctx,morphs,p,rects){
  if(p>=4)return;
  const h=clamp((p-3.985)/.015),handoff=h*h*(3-2*h);
  if(p<=3.12)return;
  ctx.lineCap='round';ctx.lineJoin='round';
  morphs.forEach(({svg,source,target,color},i)=>{
    const rect=svg.getBoundingClientRect();
    // Honour the SVG's xMidYMid meet mapping, including narrow mobile columns.
    const scale=Math.min(rect.width/160,rect.height/100);
    const left=rect.left+(rect.width-160*scale)/2,top=rect.top+(rect.height-100*scale)/2;
    ctx.strokeStyle=color;
    const movingSource=sourceSegments(rects[i%rects.length],target.length);
    movingSource.forEach((segment,j)=>{
      // Lines depart from separated physical pieces and material samples.
      // The assembled cabinet never reappears as a wireframe.
      const {travel:t,ink}=departureState(i/Math.max(1,morphs.length-1),p);
      if(ink===0)return;
      ctx.globalAlpha=ink*(1-handoff);ctx.lineWidth=mix(.9,1.15*scale,t);
      ctx.beginPath();
      const start=segment;
      const end=target[j].map((v,k)=>v*scale+(k%2?top:left));
      const [ax,ay,bx,by]=morphSegment(start,end,t);
      ctx.moveTo(ax,ay);ctx.lineTo(bx,by);ctx.stroke();
    });
  });
  ctx.globalAlpha=1;
}
