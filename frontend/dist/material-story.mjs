// All photographic states share one camera, room coordinates and window light.
export const clamp=v=>Math.max(0,Math.min(1,v));
export const mix=(a,b,t)=>a+(b-a)*t;
export const ease=(a,b,v)=>{const t=clamp((v-a)/(b-a));return t*t*(3-2*t);};
export function cabinetLayout(room,vw,vh){
 return {x:room.left+room.width*.404,y:room.top+room.height*.542,w:room.width*.372,h:room.height*.230,mobile:vw<=700,room};
}
// Traced in the finished photograph's native 1672 × 941 coordinates.
// Every outline uses the same mapping as the photograph, including its plinth.
const outlines=[
 [[675,519],[686,511],[1276,511],[1297,520],[675,519]],
 [[675,519],[1297,520],[1297,707],[675,707],[675,519]],
 [[681,526],[872,526],[872,700],[681,700],[681,526]],
 [[874,526],[1095,526],[1095,606],[874,606],[874,526]],
 [[874,609],[1095,609],[1095,700],[874,700],[874,609]],
 [[1097,526],[1290,526],[1290,700],[1097,700],[1097,526]],
 [[683,708],[1287,708],[1287,725],[683,725],[683,708]]
];
export function cabinetPaths(box){
 const r=box.room;
 return outlines.map(points=>points.map(([x,y])=>[r.left+x/1672*r.width,r.top+y/941*r.height]));
}
export function cabinetEdges(box){
 return cabinetPaths(box).map(points=>{
  const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);
  return [Math.min(...xs),Math.min(...ys),Math.max(...xs)-Math.min(...xs),Math.max(...ys)-Math.min(...ys)];
 });
}
export function sampleRects(box,p=3){
 const r=box.room,t=ease(2.16,2.94,p),size=r.width*.065;
 // The two finishes lift from a drawer and a red door; the cabinet stays intact.
 return [.589,.714].map((x,i)=>[
  r.left+r.width*x-size/2,
  mix(r.top+r.height*(i?.64:.60)-size/2,r.top+r.height*.350,t),
  size,size
 ]);
}
export function materialSources(box){return sampleRects(box,3);}
function ready(img){return img?.complete&&img.naturalWidth>0;}
function roomPhoto(ctx,img,r,mobile){
 if(!mobile){ctx.drawImage(img,r.left,r.top,r.width,r.height);return;}
 // Feather only the room's upper/lower boundary into the portrait backdrop.
 const alpha=ctx.globalAlpha,n=24,edge=.08;
 ctx.drawImage(img,0,img.naturalHeight*edge,img.naturalWidth,img.naturalHeight*(1-2*edge),r.left,r.top+r.height*edge,r.width,r.height*(1-2*edge));
 for(let i=0;i<n;i++){
  const y=edge*i/n,sh=edge/n;
  ctx.globalAlpha=alpha*(i+.5)/n;
  for(const sy of [y,1-y-sh])ctx.drawImage(img,0,sy*img.naturalHeight,img.naturalWidth,sh*img.naturalHeight,r.left,r.top+sy*r.height,r.width,sh*r.height+.1);
 }
 ctx.globalAlpha=alpha;
}
export function drawCabinet(ctx,images,box,p){
 if(p<.6||p>=3.72)return;
 const real=ease(1.32,1.95,p),ink=ease(.63,1,p)*(1-ease(1.32,1.95,p));
 ctx.save();
 if(ready(images.finished)&&real>0){
  // Keep the closed, grounded cabinet throughout the materials chapter.
  ctx.globalAlpha=real*(1-ease(3.16,3.65,p));
  roomPhoto(ctx,images.finished,box.room,box.mobile);
  const samples=sampleRects(box,p),appear=ease(2.16,2.38,p),leave=1-ease(3,3.035,p);
  const crops=[[965,543,55,55],[1175,554,85,85]];
  samples.forEach(([x,y,w,h],i)=>{
   ctx.save();ctx.globalAlpha=appear*leave;
   ctx.shadowColor='rgba(58,40,28,.18)';ctx.shadowBlur=w*.15;ctx.shadowOffsetX=w*.10;ctx.shadowOffsetY=w*.09;
   ctx.drawImage(images.finished,...crops[i],x,y,w,h);
   ctx.restore();
  });
 }
 if(ink>0){
  ctx.strokeStyle='#726655';ctx.lineWidth=.9;ctx.globalAlpha=ink;
  cabinetPaths(box).forEach(points=>{ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();});
 }
 ctx.restore();
}
