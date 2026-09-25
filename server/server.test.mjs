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
  for(const [lang,title,heading] of [['pt','A empresa — Capiarcos','A ORIGEM'],['fr','L’entreprise — Capiarcos','LES ORIGINES'],['en','The company — Capiarcos','OUR ORIGINS']]){
   const response=await call('/empresa/?lang='+lang),html=await response.text();
   assert.equal(response.status,200);assert.equal(response.headers.get('content-language'),lang);
   assert.ok(html.includes(title));assert.ok(html.includes(heading));
   assert.equal((html.match(/<dialog id="menu"/g)||[]).length,1);
   assert.equal((html.match(/<footer class="brand-footer"/g)||[]).length,1);
   assert.equal((html.match(/class="company-topic"/g)||[]).length,4);
   assert.ok(html.includes('/catalogo/?lang='+lang));assert.ok(html.includes('/empresa/?lang='+lang));
   assert.doesNotMatch(html,/company-shared-|Qualidade além-fronteiras|Conhecer a Capiarcos|company-controls/);
  }
  const companyRedirect=await fetch(origin+'/empresa?lang=en',{redirect:'manual'});assert.equal(companyRedirect.headers.get('location'),'/empresa/?lang=en');
  const head404=await call('/pagina-inexistente','HEAD',undefined,{Accept:'text/html'});assert.equal(head404.status,404);assert.equal(await head404.text(),'');
  assert.equal((await call('/404.html')).status,404);
  const missingAsset=await call('/assets/inexistente.png');assert.equal(missingAsset.status,404);assert.match(missingAsset.headers.get('content-type'),/application\/json/);
  assert.equal((await call('/api/admin/catalogue')).status,401);assert.equal((await call('/api/admin/translate','POST',{title:'Mesa',alt:'Madeira'})).status,401);
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
  const direct=await call('/api/admin/upload','POST',{revision:data.revision,category,title:'Publicação direta',alt:'Imagem de teste',published:true,image:'data:image/png;base64,'+png.toString('base64')});assert.equal(direct.status,201);data=await direct.json();const newest=data.items.at(-1);
  assert.equal(newest.published,true);assert.equal((await (await call('/api/catalogue')).json()).items[0].id,newest.id);assert.equal((await call(newest.url,'GET',undefined,{Cookie:''})).status,200);
  const translated={en:{source:{title:newest.title,alt:newest.alt},title:'Custom table <safe>',alt:'Oak table'}};
  data=await (await call('/api/admin/items/'+newest.id,'PATCH',{...newest,revision:data.revision,translations:translated})).json();
  const english=await call('/catalogo/?lang=en');assert.equal(english.headers.get('content-language'),'en');assert.match(await english.text(),/Custom table &lt;safe&gt;/);
  const french=await call('/?lang=fr');assert.match(await french.text(),/Là où le bois prend forme/);
  assert.match(await (await call('/404.html?lang=en')).text(),/Page not found/);
  assert.equal((await call('/api/admin/translate','POST',{title:'Mesa',alt:'Madeira'},{'X-CSRF-Token':'wrong'})).status,403);
  assert.equal((await call('/api/admin/items/'+newest.id,'DELETE',{revision:data.revision},{'X-CSRF-Token':'wrong'})).status,403);
  assert.equal((await call('/api/admin/items/'+newest.id,'DELETE',{revision:0})).status,409);
  data=await (await call('/api/admin/items/'+newest.id,'DELETE',{revision:data.revision})).json();
  assert.equal(data.items.some(i=>i.id===newest.id),false);
  assert.equal((await call(newest.url)).status,404);
  assert.equal((await call('/api/admin/items/'+newest.id,'DELETE',{revision:data.revision})).status,404);
  await stop();await start();cookie='';assert.equal((await call('/api/admin/catalogue')).status,401);
  const again=await call('/api/login','POST',{user:'test-admin',password});cookie=again.headers.get('set-cookie').split(';')[0];csrf=(await again.json()).csrf;
  const restored=await (await call('/api/admin/catalogue')).json();assert.equal(restored.items.find(i=>i.id===item.id).deleted,true);assert.equal(restored.revision,data.revision);assert.equal(restored.items.some(i=>i.id===newest.id),false);
  await call('/api/logout','POST',{});assert.equal((await call('/api/admin/catalogue')).status,401);
 }finally{await stop();await rm(dir,{recursive:true,force:true});}
});
