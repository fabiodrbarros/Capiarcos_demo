import {mkdir,readFile,writeFile,rename,copyFile} from 'node:fs/promises';
import path from 'node:path';
import {randomUUID} from 'node:crypto';

export const dataDir=path.resolve(process.env.DATA_DIR||'data');
const file=path.join(dataDir,'catalog.json');
const seed={version:1,revision:0,categories:[{id:'cozinhas',name:'Cozinhas',order:0}],items:[{id:'cozinha-teste',category:'cozinhas',title:'Cozinha Teste',alt:'Cozinha com armários de linhas simples em tom bege',url:'/assets/catalogue/cozinha-teste.webp',width:650,height:390,order:0,published:true,deleted:false}]};
let current;
let queue=Promise.resolve();
export async function initStore(){
 await mkdir(path.join(dataDir,'images'),{recursive:true});
 await mkdir(path.join(dataDir,'originals'),{recursive:true,mode:0o700});
 await mkdir(path.join(dataDir,'backups'),{recursive:true,mode:0o700});
 try{current=JSON.parse(await readFile(file,'utf8'));}
 catch(e){if(e.code!=='ENOENT')throw e;current=structuredClone(seed);await writeFile(file,JSON.stringify(current,null,2),{flag:'wx',mode:0o600});}
 if(current.version!==1||!Array.isArray(current.categories)||!Array.isArray(current.items))throw Error('Formato do catálogo inválido. Recuperar uma cópia de segurança.');
}
export const snapshot=()=>structuredClone(current);
export function mutate(revision,fn){
 const job=queue.then(async()=>{
  if(revision!==current.revision)throw Object.assign(Error('O catálogo foi alterado noutra janela. Recarregue antes de guardar.'),{status:409});
  const next=structuredClone(current);
  await fn(next);
  next.revision++;
  const temp=file+'.'+randomUUID()+'.tmp';
  await writeFile(temp,JSON.stringify(next,null,2),{mode:0o600});
  await copyFile(file,path.join(dataDir,'backups',`catalog-${Date.now()}-${current.revision}.json`));
  await rename(temp,file);
  current=next;
  return snapshot();
 });
 queue=job.catch(()=>{});
 return job;
}
export function publicCatalog(){
 const data=snapshot();
 const items=data.items.filter(i=>i.published&&!i.deleted).reverse();
 return {categories:data.categories.filter(c=>items.some(i=>i.category===c.id)).sort((a,b)=>a.order-b.order),items};
}
