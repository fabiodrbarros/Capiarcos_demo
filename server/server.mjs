import http from 'node:http';
import {readFile,stat,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomUUID} from 'node:crypto';
import sharp from 'sharp';
import {dataDir,initStore,snapshot,mutate,publicCatalog} from './store.mjs';
import {credentials,allowLogin,login,session,logout,cookie} from './auth.mjs';

const root=fileURLToPath(new URL('../frontend/dist/',import.meta.url));
const adminRoot=fileURLToPath(new URL('../admin/',import.meta.url));
const production=process.env.NODE_ENV==='production';
const host=process.env.HOST||(production?'0.0.0.0':'127.0.0.1');
const port=Number(process.env.PORT||4173);
const origin=process.env.PUBLIC_ORIGIN||`http://${host}:${port}`;
if(production&&new URL(origin).protocol!=='https:')throw Error('PUBLIC_ORIGIN deve usar HTTPS em produção.');
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.json':'application/json','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2'};
const fail=(status,message)=>{throw Object.assign(Error(message),{status});};
const text=(value,max=120)=>{if(typeof value!=='string'||!value.trim()||value.trim().length>max)fail(400,`Preencha os campos obrigatórios (máximo ${max} caracteres).`);return value.trim();};
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function json(res,status,value){res.writeHead(status,{'Content-Type':mime['.json']});res.end(JSON.stringify(value));}
async function body(req,limit=16*1024){
 if(!req.headers['content-type']?.startsWith('application/json'))fail(415,'Pedido deve usar JSON.');
 if(Number(req.headers['content-length'])>limit)fail(413,'Ficheiro demasiado grande.');
 const chunks=[];let size=0;
 for await(const chunk of req){size+=chunk.length;if(size>limit)fail(413,'Ficheiro demasiado grande.');chunks.push(chunk);}
 try{const value=JSON.parse(Buffer.concat(chunks).toString('utf8'));if(!value||typeof value!=='object'||Array.isArray(value))fail(400,'Pedido inválido.');return value;}catch{fail(400,'Pedido inválido.');}
}
function checkOrigin(req){if(req.headers.origin!==origin)fail(403,'Origem do pedido não autorizada.');}
async function serve(res,file,method,status=200){
 const type=mime[path.extname(file)];if(!type)fail(404,'Não encontrado.');
 try{if(!(await stat(file)).isFile())fail(404,'Não encontrado.');const bytes=await readFile(file);res.writeHead(status,{'Content-Type':type,'Content-Length':bytes.length});res.end(method==='HEAD'?undefined:bytes);}catch(e){if(e.code==='ENOENT'||e.code==='ENOTDIR')fail(404,'Não encontrado.');throw e;}
}
async function saveImage(imageData){
    if(typeof imageData!=='string'||!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(imageData))fail(400,'Escolha uma imagem JPEG, PNG ou WebP.');
    const bytes=Buffer.from(imageData.split(',')[1],'base64');if(bytes.length>10*1024*1024)fail(413,'Cada imagem pode ter até 10 MB.');
     let encoded;
     try{const image=sharp(bytes,{limitInputPixels:40000000,failOn:'warning'});const meta=await image.metadata();if(!['jpeg','png','webp'].includes(meta.format)||(meta.pages||1)>1)fail(400,'Formato de imagem não suportado.');encoded=await image.rotate().resize({width:2400,height:2400,fit:'inside',withoutEnlargement:true}).webp({quality:88}).toBuffer({resolveWithObject:true});}catch{fail(400,'Imagem inválida, animada ou superior a 40 megapíxeis.');}
     const id=randomUUID(),url=`/media/${id}.webp`;
     await writeFile(path.join(dataDir,'originals',id),bytes,{flag:'wx',mode:0o600});
     await writeFile(path.join(dataDir,'images',id+'.webp'),encoded.data,{flag:'wx',mode:0o600});

 return {url,width:encoded.info.width,height:encoded.info.height};
}
function catalogueMarkup(template){
 const data=publicCatalog();
 const counts=new Map(data.categories.map(c=>[c.id,data.items.filter(i=>i.category===c.id).length]));
 const filters=[{id:'all',name:'Todos'},...data.categories].map(c=>`<button type="button" data-category="${escape(c.id)}" aria-pressed="${c.id==='all'}" aria-controls="catalogue-grid"><span>${escape(c.name)}</span><span class="category-count">${c.id==='all'?data.items.length:counts.get(c.id)}</span></button>`).join('');
 const cards=data.items.map(i=>{const category=data.categories.find(c=>c.id===i.category)?.name||'';return `<article class="catalogue-item" data-category="${escape(i.category)}"><a class="catalogue-image-link" href="${escape(i.url)}" data-gallery-image aria-label="Ampliar ${escape(i.title)}" data-title="${escape(i.title)}" data-label="${escape(category)}"><span class="catalogue-frame"><span class="catalogue-mat"><span class="catalogue-image"><img src="${escape(i.url)}" alt="${escape(i.alt)}" width="${i.width}" height="${i.height}" loading="lazy"></span></span></span><span class="catalogue-caption"><span><span class="catalogue-category">${escape(category)}</span><span class="catalogue-name">${escape(i.title)}</span></span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14"/></svg></span></a></article>`;}).join('');
 return template.replace(/(<nav class="catalogue-filters"[^>]*>)[\s\S]*?<\/nav>/,(_,start)=>`${start}${filters}</nav>`).replace(/(<div class="catalogue-grid" id="catalogue-grid">)[\s\S]*?(<\/div><p class="catalogue-empty")/,(_,start,end)=>`${start}${cards}${end}`).replace('class="catalogue-empty" hidden',`class="catalogue-empty"${data.items.length?' hidden':''}`);
}
await initStore();
const server=http.createServer(async(req,res)=>{
 res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');res.setHeader('Cache-Control','no-store');res.setHeader('X-Frame-Options','SAMEORIGIN');
 try{
  const url=new URL(req.url,'http://localhost'),p=decodeURIComponent(url.pathname),method=req.method;
  if(p.startsWith('/api/')){
   if(p==='/api/catalogue'&&method==='GET')return json(res,200,publicCatalog());
   if(p==='/api/session'&&method==='GET'){const s=await session(req);return json(res,200,{configured:!!await credentials(),authenticated:!!s,...(s?{csrf:s.csrf,user:s.user}:{})});}
   if(p==='/api/login'&&method==='POST'){
    checkOrigin(req);
    if(!allowLogin(req.socket.remoteAddress))fail(429,'Demasiadas tentativas. Aguarde 15 minutos.');
    if(!await credentials())fail(503,'O administrador ainda não foi configurado no servidor.');
    const b=await body(req);if(typeof b.password!=='string'||!b.password.length||b.password.length>256)fail(400,'Palavra-passe inválida.');
    const s=await login(text(b.user,64),b.password);
    if(!s)fail(401,'Utilizador ou palavra-passe incorretos.');
    res.setHeader('Set-Cookie',cookie(s.token));return json(res,200,{csrf:s.csrf,user:s.user});
   }
   const s=await session(req);if(!s)fail(401,'Inicie sessão para continuar.');
   if(method!=='GET'){checkOrigin(req);if(req.headers['x-csrf-token']!==s.csrf)fail(403,'Pedido não autorizado. Recarregue a página.');}
   if(p==='/api/logout'&&method==='POST'){logout(req);res.setHeader('Set-Cookie',cookie('',true));return json(res,200,{ok:true});}
   if(p==='/api/admin/catalogue'&&method==='GET')return json(res,200,snapshot());
   if(p==='/api/admin/upload'&&method==='POST'){
    const b=await body(req,15*1024*1024);text(b.title);text(b.alt,300);
    const result=await mutate(b.revision,async data=>{
     if(!data.categories.some(c=>c.id===b.category))fail(400,'Selecione uma categoria.');
     if(data.items.length>=3000)fail(400,'Limite de imagens atingido.');
     const {url,width,height}=await saveImage(b.image);
     const id=randomUUID();
     data.items.push({id,category:b.category,title:text(b.title),alt:text(b.alt,300),url,width,height,order:data.items.length,published:false,deleted:false});
    });return json(res,201,result);
   }
   if(p==='/api/admin/categories'&&method==='POST'){
    const b=await body(req);return json(res,201,await mutate(b.revision,data=>{const name=text(b.name,60);if(data.categories.length>=100)fail(400,'Limite de categorias atingido.');if(data.categories.some(c=>c.name.toLocaleLowerCase('pt')===name.toLocaleLowerCase('pt')))fail(409,'Já existe uma categoria com esse nome.');const base=name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'categoria';const id=data.categories.some(c=>c.id===base)?base+'-'+randomUUID().slice(0,8):base;data.categories.push({id,name,order:data.categories.length});}));
   }
   const category=/^\/api\/admin\/categories\/([\w-]+)$/.exec(p);
   if(category&&['PATCH','DELETE'].includes(method)){
    const b=await body(req);return json(res,200,await mutate(b.revision,data=>{const c=data.categories.find(c=>c.id===category[1]);if(!c)fail(404,'Categoria inexistente.');if(method==='DELETE'){if(data.items.some(i=>i.category===c.id&&!i.deleted))fail(409,'Mova ou retire as imagens desta categoria primeiro.');data.categories=data.categories.filter(x=>x!==c);}else{const name=text(b.name,60);if(data.categories.some(x=>x.id!==c.id&&x.name.toLowerCase()===name.toLowerCase()))fail(409,'Nome de categoria repetido.');c.name=name;}}));
   }
   const item=/^\/api\/admin\/items\/([\w-]+)$/.exec(p);
   if(item&&method==='PATCH'){
    const b=await body(req,15*1024*1024);return json(res,200,await mutate(b.revision,async data=>{const i=data.items.find(x=>x.id===item[1]);if(!i)fail(404,'Imagem inexistente.');if(!data.categories.some(c=>c.id===b.category))fail(400,'Selecione uma categoria.');if(typeof b.published!=='boolean'||typeof b.deleted!=='boolean')fail(400,'Estado inválido.');const changes={title:text(b.title),alt:text(b.alt,300),category:b.category,published:b.published,deleted:b.deleted};if(b.image!==undefined)Object.assign(changes,await saveImage(b.image));Object.assign(i,changes);}));
   }
   fail(404,'Operação inexistente.');
  }
  if(!['GET','HEAD'].includes(method))fail(405,'Método não permitido.');
  if(p==='/404.html')return await serve(res,path.join(root,'404.html'),method,404);
  if(p==='/healthz')return json(res,200,{ok:true});
  if(p==='/catalogo.html'||p==='/contactos.html'||p==='/admin'||p==='/ca-guest-admin'||p==='/ca-guest-admin/'){res.writeHead(302,{Location:p.includes('admin')?'/admin/':p.replace('.html','/')});return res.end();}
  if(p==='/catalogo'||p==='/contactos'){res.writeHead(301,{Location:p+'/'});return res.end();}
  if(p==='/catalogo/'||p==='/catalogo/index.html'){
   const html=catalogueMarkup(await readFile(path.join(root,'catalogo/index.html'),'utf8'));res.writeHead(200,{'Content-Type':mime['.html']});return res.end(method==='HEAD'?undefined:html);
  }
  if(p.startsWith('/media/')){
   const item=snapshot().items.find(i=>i.url===p);
   if(!item||(!item.published||item.deleted)&&!await session(req))fail(404,'Imagem inexistente.');
   return await serve(res,path.join(dataDir,'images',path.basename(p)),method);
  }
  if(p.startsWith('/admin/')){
   res.setHeader('X-Robots-Tag','noindex, nofollow');
   res.setHeader('Content-Security-Policy',"default-src 'self'; img-src 'self' blob:; style-src 'self'; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
   const name=p.slice(7)||'index.html';if(!['index.html','admin.css','admin.js'].includes(name))fail(404,'Não encontrado.');return await serve(res,path.join(adminRoot,name),method);
  }
  const normalized=path.resolve(root,'.'+p);
  if(normalized!==path.resolve(root)&&!normalized.startsWith(path.resolve(root)+path.sep))fail(404,'Não encontrado.');
  return await serve(res,p.endsWith('/')?path.join(normalized,'index.html'):normalized,method);
  }catch(e){
  if(e.status===404&&!res.headersSent&&['GET','HEAD'].includes(req.method)&&req.headers.accept?.includes('text/html')&&!/^\/(api|media|assets)\//.test(req.url)){
   try{return await serve(res,path.join(root,'404.html'),req.method,404);}catch{}
  }
  if(!res.headersSent)json(res,e.status||500,{error:e.status?e.message:'Não foi possível concluir. Tente novamente.'});else res.end();if(!e.status)console.error(e);}
});
server.requestTimeout=30000;server.headersTimeout=10000;
server.listen(port,host,()=>console.log(`Capiarcos: http://${host}:${port} — painel /admin/`));
for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>server.close(()=>process.exit(0)));
