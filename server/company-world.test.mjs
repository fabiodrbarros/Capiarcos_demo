import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import sharp from 'sharp';

// Run the actual navigation and animation modules with a deterministic browser clock.
function harness(reduced=false){
 let now=0,next=0;const timers=new Map(),recorded=[];
 const later=(fn,ms)=>{const id=++next;timers.set(id,{fn,at:now+ms});return id;};
 const clear=id=>timers.delete(id);
 class Element{
  constructor(name){this.name=name;this.style={};this.dataset={};this.attributes={};this.children=new Map();this.inert=false;this.open=false;this.scrollTop=0;this.clientHeight=600;this.scrollHeight=600;this.offsetHeight=900;this.textContent=name;this.events={};const classes=new Set();this.classList={contains:c=>classes.has(c),add:c=>classes.add(c),remove:c=>classes.delete(c),toggle:(c,on)=>on?classes.add(c):classes.delete(c)};}
  querySelector(s){if(!this.children.has(s))this.children.set(s,new Element(s));return this.children.get(s);}
  querySelectorAll(s){return this.children.get(s)||[];}
  setAttribute(k,v){this.attributes[k]=v;}
  getAttribute(k){return this.attributes[k];}
  addEventListener(k,fn){(this.events[k]??=[]).push(fn);}
  closest(s){return s==='.topic-copy'&&this.name==='.topic-copy'?this:null;}
  getBoundingClientRect(){return {left:100,top:100,width:300,height:100};}
  getTotalLength(){return 400;}
  scrollBy({top}){this.scrollTop=Math.min(this.scrollHeight-this.clientHeight,Math.max(0,this.scrollTop+top));}
  animate(frames,options){
   let resolve;const finished=new Promise(r=>resolve=r),id=later(()=>resolve(),options.duration+(options.delay||0));
   const animation={finished,finish(){clear(id);resolve();},cancel(){clear(id);resolve();}};
   recorded.push({element:this.name,frames,options});return animation;
  }
 }
 const body=new Element('body');body.classList.add('company-page');
 const topics=Array.from({length:4},(_,i)=>new Element('topic'+i));
 body.children.set('.company-topic',topics);
 const world=body.querySelector('.world-chapter'),route=world.querySelector('.world-route');
 route.children.set('text,circle',Array.from({length:6},()=>new Element('label')));
 body.children.set('.world-threads>path',Array.from({length:6},()=>new Element('thread')));
 const reducedMedia={matches:reduced,addEventListener(){}};
 const screen={matches:true,addEventListener(){}};
 const listeners={};
 const context={document:{body,querySelector:s=>body.querySelector(s),querySelectorAll:s=>body.querySelectorAll(s)},matchMedia:s=>s==='screen'?screen:reducedMedia,Image:class{decode(){return Promise.resolve();}},AbortController,setTimeout:later,clearTimeout:clear,performance:{now:()=>now},scrollY:0,innerHeight:900,t:s=>s,stageStatus:(n,total,title)=>`${n}/${total} ${title}`};
 context.scrollTo=({top})=>{context.scrollY=top;};
 context.window={addEventListener:(k,fn)=>(listeners[k]??=[]).push(fn)};
 vm.createContext(context);
 const worldCode=readFileSync(new URL('../frontend/dist/empresa/world.mjs',import.meta.url),'utf8').replace('export function','function');
 const navigation=readFileSync(new URL('../frontend/dist/empresa/empresa.mjs',import.meta.url),'utf8').replace(/^import .*;\r?\n/gm,'');
 vm.runInContext(worldCode+'\n'+navigation,context);
 const flush=async()=>{for(let i=0;i<20;i++)await Promise.resolve();};
 async function advance(ms){const end=now+ms;await flush();while(true){const entry=[...timers].filter(([,v])=>v.at<=end).sort((a,b)=>a[1].at-b[1].at)[0];if(!entry)break;now=entry[1].at;timers.delete(entry[0]);entry[1].fn();await flush();}now=end;await flush();}
 const emit=(kind,e)=>{for(const fn of listeners[kind]||[])fn(e);};
 const key=k=>emit('keydown',{key:k,target:body,preventDefault(){}});
 const swipe=()=>{emit('touchstart',{touches:[{clientX:100,clientY:300}]});emit('touchend',{changedTouches:[{clientX:100,clientY:150}]});};
 return {body,context,topics,recorded,key,swipe,advance,stage:()=>Number(body.dataset.companyStage),world};
}

test('Empresa starts at zero, keeps four topics, locks the reveal and returns from globe/footer',async()=>{
 const h=harness();assert.equal(h.stage(),0);
 for(let n=1;n<=4;n++){h.key('ArrowDown');await h.advance(1800);assert.equal(h.stage(),n);}
 assert.equal(h.body.querySelector('.brand-footer').inert,true);
 h.swipe();await h.advance(50);assert.equal(h.stage(),5);
 h.key('ArrowDown');h.swipe();await h.advance(2700);assert.equal(h.stage(),5);
 assert.equal(h.body.querySelector('#conteudo').getAttribute('aria-busy'),'true');
 const threads=h.recorded.filter(r=>r.element==='thread');
 const route=h.recorded.find(r=>r.element==='.world-route');
 assert.ok(route.options.delay>=Math.max(...threads.map(r=>r.options.delay+r.options.duration)));
 await h.advance(1000);assert.equal(h.body.querySelector('#conteudo').getAttribute('aria-busy'),'false');
 h.key('ArrowUp');await h.advance(2200);assert.equal(h.stage(),4);
 assert.equal(h.world.getAttribute('aria-hidden'),'true');assert.equal(h.topics[3].inert,false);
 h.key('ArrowDown');await h.advance(3750);h.key('ArrowDown');await h.advance(1800);
 assert.equal(h.stage(),6);assert.equal(h.body.querySelector('.brand-footer').inert,false);assert.equal(h.context.scrollY,900);
 h.context.scrollY=0;h.key('ArrowUp');await h.advance(1800);assert.equal(h.stage(),5);
 assert.equal(h.body.querySelector('.brand-footer').inert,true);assert.equal(h.world.getAttribute('aria-hidden'),'false');
});

test('reduced motion shows the final globe immediately and permits reverse, touch and footer navigation',async()=>{
 const h=harness(true);
 for(let n=1;n<=5;n++){h.swipe();await h.advance(0);assert.equal(h.stage(),n);}
 assert.equal(h.recorded.length,0);assert.equal(h.world.getAttribute('aria-hidden'),'false');
 h.key('ArrowUp');await h.advance(0);assert.equal(h.stage(),4);assert.equal(h.world.getAttribute('aria-hidden'),'true');
 h.key('End');await h.advance(0);assert.equal(h.stage(),6);assert.equal(h.context.scrollY,900);
 h.key('Home');await h.advance(0);assert.equal(h.stage(),0);assert.equal(h.context.scrollY,0);
 assert.equal(h.recorded.length,0);
});

test('globe retains square geometry and transparent oceans',async()=>{
 const globe=sharp(fileURLToPath(new URL('../frontend/dist/empresa/globo-original.png',import.meta.url)));
 const metadata=await globe.metadata();assert.equal(metadata.width,1254);assert.equal(metadata.height,1254);assert.equal(metadata.hasAlpha,true);
 const {data,info}=await globe.raw().toBuffer({resolveWithObject:true});
 const alpha=(x,y)=>data[(y*info.width+x)*info.channels+3];
 assert.equal(alpha(0,0),0);assert.equal(alpha(630,440),0);
 assert.ok(alpha(830,730)>240);
});
