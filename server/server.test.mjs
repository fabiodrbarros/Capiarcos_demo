import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {randomBytes} from 'node:crypto';
import sharp from 'sharp';

test('admin: authentication, drafts, publication, validation, conflicts and persistence',async()=>{
 const dir=await mkdtemp(path.join(tmpdir(),'capiarcos-test-'));
 process.env.DATA_DIR=dir;
 const {setCredentials}=await import('./auth.mjs');
 const password=randomBytes(24).toString('hex');await setCredentials('test-admin',password);
 const port=4186,origin=`http://127.0.0.1:${port}`;
 let child,cookie='',csrf='';
 async function start(){
  child=spawn(process.execPath,['server/server.mjs'],{env:{...process.env,DATA_DIR:dir,PORT:String(port),HOST:'127.0.0.1',PUBLIC_ORIGIN:origin,NODE_ENV:'test'},stdio:['ignore','pipe','pipe']});
  await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Server startup timeout')),10000);child.stdout.once('data',()=>{clearTimeout(timer);resolve();});child.once('exit',code=>{clearTimeout(timer);reject(Error(`Server exited ${code}`));});child.stderr.on('data',data=>process.stderr.write(data));});
 }
 async function stop(){if(child?.exitCode===null){await new Promise(resolve=>{child.once('exit',resolve);child.kill();});}}
 async function call(url,method='GET',body,headers={}){return fetch(origin+url,{method,headers:{Origin:origin,Cookie:cookie,'X-CSRF-Token':csrf,...(body?{'Content-Type':'application/json'}:{}),...headers},...(body?{body:JSON.stringify(body)}:{})});}
 try{
  await start();
  const missing=await call('/pagina-inexistente','GET',undefined,{Accept:'text/html'});assert.equal(missing.status,404);assert.match(missing.headers.get('content-type'),/text\/html/);assert.match(await missing.text(),/Página não encontrada/);
  const head404=await call('/pagina-inexistente','HEAD',undefined,{Accept:'text/html'});assert.equal(head404.status,404);assert.equal(await head404.text(),'');
  assert.equal((await call('/404.html')).status,404);
  const missingAsset=await call('/assets/inexistente.png');assert.equal(missingAsset.status,404);assert.match(missingAsset.headers.get('content-type'),/application\/json/);
  assert.equal((await call('/api/admin/catalogue')).status,401);
  assert.equal((await call('/data/admin.json')).status,404);
  assert.equal((await call('/api/login','POST',{user:'test-admin',password},{Origin:'https://other.example'})).status,403);
  const signed=await call('/api/login','POST',{user:'test-admin',password});assert.equal(signed.status,200);cookie=signed.headers.get('set-cookie').split(';')[0];assert.match(signed.headers.get('set-cookie'),/HttpOnly/);csrf=(await signed.json()).csrf;
  let data=await (await call('/api/admin/catalogue')).json();
  assert.equal((await call('/api/admin/categories','POST',{revision:data.revision,name:'Teste'},{'X-CSRF-Token':'wrong'})).status,403);
  data=await (await call('/api/admin/categories','POST',{revision:data.revision,name:'Teste'})).json();const category=data.categories.at(-1).id;
  assert.equal((await call('/api/admin/categories','POST',{revision:0,name:'Stale'})).status,409);
  assert.equal((await call('/api/admin/upload','POST',{revision:data.revision,category,title:'Bad',alt:'Bad',image:'data:image/png;base64,YWJj'})).status,400);
  const png=await sharp({create:{width:16,height:12,channels:3,background:'#682725'}}).png().toBuffer();
  const response=await call('/api/admin/upload','POST',{revision:data.revision,category,title:'<script> $& teste',alt:'Imagem de teste',image:'data:image/png;base64,'+png.toString('base64')});assert.equal(response.status,201);data=await response.json();let item=data.items.at(-1);
  assert.equal((await (await call('/api/catalogue')).json()).items.some(i=>i.id===item.id),false);
  assert.equal((await call(item.url,'GET',undefined,{Cookie:''})).status,404);
  data=await (await call('/api/admin/items/'+item.id,'PATCH',{...item,revision:data.revision,published:true})).json();
  assert.equal((await call(item.url,'GET',undefined,{Cookie:''})).status,200);
  assert.equal((await (await call('/api/catalogue')).json()).items[0].id,item.id);
  const oldUrl=item.url;
  const replacement=await sharp({create:{width:24,height:18,channels:3,background:'#ffffff'}}).png().toBuffer();
  const payload={title:item.title,alt:item.alt,category:item.category,published:true,deleted:false,revision:data.revision};
  assert.equal((await call('/api/admin/items/'+item.id,'PATCH',{...payload,image:'data:image/png;base64,YWJj'})).status,400);
  const replaced=await call('/api/admin/items/'+item.id,'PATCH',{...payload,image:'data:image/png;base64,'+replacement.toString('base64')});assert.equal(replaced.status,200);data=await replaced.json();
  const updated=data.items.find(i=>i.id===item.id);assert.notEqual(updated.url,oldUrl);assert.equal(updated.width,24);assert.equal(updated.height,18);assert.equal(data.items.length,2);item=updated;
  assert.equal((await call(item.url,'GET',undefined,{Cookie:''})).status,200);
  assert.equal((await call(oldUrl,'GET',undefined,{Cookie:''})).status,404);
  const html=await (await call('/catalogo/')).text();assert.ok(html.includes('&lt;script&gt; $&amp; teste'));assert.ok(!html.includes('<script> $& teste'));
  assert.equal((await call('/api/admin/categories/'+category,'DELETE',{revision:data.revision})).status,409);
  data=await (await call('/api/admin/items/'+item.id,'PATCH',{...item,revision:data.revision,published:false,deleted:true})).json();
  assert.equal((await (await call('/api/catalogue')).json()).items.some(i=>i.id===item.id),false);
  await stop();await start();cookie='';assert.equal((await call('/api/admin/catalogue')).status,401);
  const again=await call('/api/login','POST',{user:'test-admin',password});cookie=again.headers.get('set-cookie').split(';')[0];csrf=(await again.json()).csrf;
  const restored=await (await call('/api/admin/catalogue')).json();assert.equal(restored.items.at(-1).deleted,true);assert.equal(restored.revision,data.revision);
  await call('/api/logout','POST',{});assert.equal((await call('/api/admin/catalogue')).status,401);
 }finally{await stop();await rm(dir,{recursive:true,force:true});}
});
