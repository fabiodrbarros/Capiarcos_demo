import {translate,language,languages} from '../frontend/dist/languages.mjs';
export {language};
export const escapeHtml=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const decode=value=>value.replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>');
export function localized(record,field,lang){
 const saved=record.translations?.[lang];
 // Old translations are not silently reused after the Portuguese source changes.
 return lang!=='pt'&&saved?.source?.[field]===record[field]&&saved[field]?saved[field]:translate(record[field],lang);
}
export function validateTranslations(value,fields){
 if(value===undefined)return undefined;
 if(!value||typeof value!=='object'||Array.isArray(value))throw Object.assign(Error('Traduções inválidas.'),{status:400});
 const result={};
 for(const lang of ['fr','en']){
  const row=value[lang];if(row===undefined)continue;
  if(!row||typeof row!=='object'||Array.isArray(row)||!row.source||typeof row.source!=='object')throw Object.assign(Error('Traduções inválidas.'),{status:400});
  result[lang]={source:{}};
  for(const [field,max] of Object.entries(fields)){
   if(typeof row[field]!=='string'||row[field].length>max||typeof row.source[field]!=='string'||row.source[field].length>max)throw Object.assign(Error('Texto traduzido inválido ou demasiado longo.'),{status:400});
   result[lang][field]=row[field].trim();result[lang].source[field]=row.source[field];
  }
 }
 return result;
}
export function renderLanguage(html,lang,url){
 html=html.replace(/(<dialog id="menu"[\s\S]*?<nav[^>]*><a href="\/">Home<\/a>)/, '$1<a href="/empresa/">Empresa</a>');
 const t=s=>escapeHtml(translate(decode(s),lang));
 let raw=false;
 html=html.split(/(<[^>]+>)/g).map(token=>{
  if(token.startsWith('<')){
   if(/^<(script|style)\b/i.test(token))raw=true;
   if(/^<\/(script|style)>/i.test(token))raw=false;
   return token.replace(/\b(aria-label|placeholder|title|alt|content)="([^"]*)"/g,(_,attr,value)=>`${attr}="${t(value)}"`);
  }
  if(raw)return token;
  return token.replace(/^(\s*)([\s\S]*?)(\s*)$/,(_,a,b,c)=>a+t(b)+c);
 }).join('');
 html=html.replace(/<html lang="pt"/,`<html lang="${lang}"`);
 const links=languages.map(code=>{const target=new URL(url);target.searchParams.set('lang',code);return `<a href="${escapeHtml(target.pathname+target.search)}" hreflang="${code}" lang="${code}" aria-label="${{pt:'Português',fr:'Français',en:'English'}[code]}"${code===lang?' aria-current="true"':''}>${code.toUpperCase()}</a>`;}).join('');
 html=html.replace(/<span class="menu-language"[^>]*>PT<\/span>/g,`<div class="menu-languages" role="group" aria-label="${{pt:'Idioma',fr:'Langue',en:'Language'}[lang]}">${links}</div>`);
 html=html.replace(/(<span class="footer-language")[^>]*>PT<\/span>/g,`$1>${lang.toUpperCase()}</span>`);
 // Keep the selected language across page navigation and map embeds.
 return html.replace(/\b(href|src)="(\/(?!\/)[^"]*)"/g,(all,attr,value)=>{
  const target=new URL(decode(value),'http://local');
  if(!['/','/index.html','/catalogo/','/catalogo/index.html','/contactos/','/contactos/index.html','/404.html','/map.html','/empresa/','/empresa/index.html'].includes(target.pathname))return all;
  if(!target.searchParams.has('lang'))target.searchParams.set('lang',lang);
  return `${attr}="${escapeHtml(target.pathname+target.search+target.hash)}"`;
 });
}
