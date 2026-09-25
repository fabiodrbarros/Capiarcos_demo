import {ease,mix} from './material-story.mjs';
import {loadImage} from './image-assets.mjs';
const crops=[[965,543,55,55],[1175,554,85,85]];
const assets=Array.from({length:12},(_,i)=>{
 const name=`solution-drawings/${String(i).padStart(2,'0')}.png`;
 return loadImage(`/assets/optimized/${name}`,`/assets/${name}`);
});
const drawings=assets.map(asset=>asset.image);
export const drawingsReady=Promise.allSettled(assets.map(asset=>asset.ready));
export function tilePose(source,destination,p,i){
 const t=ease(3+i*.009,3.78+i*.009,p);
 return source.map((v,k)=>mix(v,destination[k],t));
}
export function drawMaterialTiles(ctx,models,p,sources,img,panel,origin={left:0,top:0}){
 if(!img?.complete||!img.naturalWidth)return;
 ctx.save();
 if(p>=3.99){ctx.beginPath();ctx.rect(panel.left,panel.top,panel.width,panel.height);ctx.clip();}
 models.forEach(({svg},i)=>{
  const b=svg.parentElement.getBoundingClientRect();
  const [x,y,w,h]=tilePose(sources[i%2],[b.left-origin.left,b.top-origin.top,b.width,b.height],p,i);
  const framed=ease(3.3+i*.01,3.88+i*.005,p),art=ease(3.52+i*.01,3.96,p);
  ctx.save();ctx.globalAlpha=ease(3,3.04,p);
  ctx.shadowColor='rgba(54,29,16,.22)';ctx.shadowBlur=w*.08;ctx.shadowOffsetX=w*.04;ctx.shadowOffsetY=w*.055;
  ctx.drawImage(img,...crops[i%2],x,y,w,h);ctx.shadowColor='transparent';
  ctx.globalAlpha=framed;ctx.fillStyle='#682725';ctx.fillRect(x,y,w,h);
  const rim=Math.max(4,w*.035);ctx.fillStyle='#fff';ctx.fillRect(x+rim,y+rim,w-2*rim,h-2*rim);
  ctx.strokeStyle='#b976604d';ctx.lineWidth=1;ctx.strokeRect(x+.5,y+.5,w-1,h-1);
  const drawing=drawings[i];
  if(drawing.complete&&drawing.naturalWidth){
   const pad=rim+w*.015,areaW=w-2*pad,areaH=h-2*pad-Math.max(h*.17,18);
   const scale=Math.min(areaW/drawing.naturalWidth,areaH/drawing.naturalHeight);
   const dw=drawing.naturalWidth*scale,dh=drawing.naturalHeight*scale;
   ctx.globalAlpha=art;ctx.drawImage(drawing,x+(w-dw)/2,y+pad+(areaH-dh)/2,dw,dh);
  }
  ctx.restore();
 });ctx.restore();
}
