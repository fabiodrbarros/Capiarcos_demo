import test from 'node:test';
import assert from 'node:assert/strict';
import {renderLanguage,localized,validateTranslations} from './localization.mjs';
import {translateFields,splitText} from './translation-service.mjs';
import {readFileSync} from 'node:fs';

test('home menu keeps all languages, the company link and the updated slogan',()=>{
 const home=readFileSync(new URL('../frontend/dist/index.html',import.meta.url),'utf8');
 for(const [lang,first,second] of [['pt','Onde a madeira ganha forma,','o espaço ganha identidade.'],['fr','Là où le bois prend forme,','l’espace prend une identité.'],['en','Where wood takes shape,','space gains identity.']]){
  for(const source of [home,home.replace('<a href="/">Home</a>','<a href="/">Home</a><a href="/empresa/">Empresa</a>')]){
   const html=renderLanguage(source,lang,new URL('http://local/?lang='+lang));
   const menu=html.match(/<dialog id="menu"[\s\S]*?<\/dialog>/)[0];
   assert.equal((menu.match(/href="\/empresa\/\?lang=/g)||[]).length,1);
   for(const code of ['pt','fr','en'])assert.ok(menu.includes(`hreflang="${code}"`));
   assert.ok(menu.includes(first));assert.ok(menu.includes(second));
   assert.ok(html.includes(`<h1 id="title-inicio">${first} <span>${second}</span></h1>`));
  }
 }
});
test('language links preserve filters; translations remain escaped and source-aware',()=>{
 const html=renderLanguage('<html lang="pt"><span class="menu-language">PT</span><a href="/contactos/">Contactos</a><script>const s="a < b";</script>', 'fr',new URL('http://local/catalogo/?categoria=cozinhas&lang=fr'));
 assert.match(html,/lang="fr"/);assert.match(html,/categoria=cozinhas&amp;lang=en/);assert.match(html,/href="\/contactos\/\?lang=fr">Contact/);assert.match(html,/const s="a < b"/);
 const row={title:'Mesa',translations:{en:{source:{title:'Mesa'},title:'Table'}}};assert.equal(localized(row,'title','en'),'Table');row.title='Mesa nova';assert.equal(localized(row,'title','en'),'Mesa nova');
 assert.throws(()=>validateTranslations({fr:{title:5,source:{title:'Mesa'}}},{title:240}));
});
test('free translation splits UTF-8 safely, caches and preserves original sources',async()=>{
 assert.ok(splitText('á'.repeat(600)).every(chunk=>Buffer.byteLength(chunk)<=480));let calls=0;
 const fetcher=async url=>{calls++;assert.equal(url.hostname,'api.mymemory.translated.net');return {ok:true,status:200,json:async()=>({responseStatus:200,responseData:{translatedText:'Table &amp; wood'}})};};
 const result=await translateFields({title:'Mesa de teste unitário'},fetcher);assert.equal(result.fr.title,'Table & wood');assert.equal(result.en.source.title,'Mesa de teste unitário');await translateFields({title:'Mesa de teste unitário'},fetcher);assert.equal(calls,2);
 await assert.rejects(translateFields({title:'Limite de teste'},async()=>({ok:false,status:429,json:async()=>({quotaFinished:true})})),/limite gratuito/);
 await assert.rejects(translateFields({title:'Erro de teste'},async()=>{throw Error('offline');}),/não respondeu/);
});
