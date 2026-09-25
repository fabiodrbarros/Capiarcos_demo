import test from 'node:test';
import assert from 'node:assert/strict';
import {renderLanguage,localized,validateTranslations} from './localization.mjs';
import {translateFields,splitText} from './translation-service.mjs';
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
