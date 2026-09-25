// MyMemory's free GET API: no key, no contribution to the translation archive.
const fail=(status,message)=>{throw Object.assign(Error(message),{status});};
const cache=new Map();let inFlight=false;
export function splitText(text){
 const chunks=[];let part='';
 for(const token of text.match(/\S+\s*/gu)||[]){
  if(Buffer.byteLength(token)>480){if(part){chunks.push(part.trim());part='';}for(const char of token){if(Buffer.byteLength(part+char)>480){chunks.push(part);part='';}part+=char;}}
  else {if(Buffer.byteLength(part+token)>480){chunks.push(part.trim());part='';}part+=token;}
 }
 if(part.trim())chunks.push(part.trim());return chunks;
}
function decode(text){return text.replace(/&#(x[\da-f]+|\d+);/gi,(_,n)=>{const code=n[0].toLowerCase()==='x'?parseInt(n.slice(1),16):Number(n);return code<=0x10ffff?String.fromCodePoint(code):'';}).replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');}
export async function translateFields(fields,fetcher=fetch){
 if(inFlight)fail(429,'Já existe uma tradução em curso. Aguarde alguns segundos.');
 inFlight=true;
 try{
 const result={};
 for(const target of ['fr','en']){
  result[target]={source:{...fields}};
  for(const [field,value] of Object.entries(fields)){
   const key=JSON.stringify([value,target]);
   if(cache.has(key)){result[target][field]=cache.get(key);continue;}
   const translated=[];
   for(const chunk of splitText(value)){
    const url=new URL('https://api.mymemory.translated.net/get');url.searchParams.set('q',chunk);url.searchParams.set('langpair',`pt|${target}`);
    let response,data;
    try{response=await fetcher(url,{signal:AbortSignal.timeout(12000)});data=await response.json();}catch{fail(502,'O serviço de tradução não respondeu. Tente novamente.');}
    if(data.quotaFinished||response.status===429||Number(data.responseStatus)===429)fail(429,'O limite gratuito de tradução foi atingido. Tente novamente amanhã ou preencha os campos manualmente.');
    if(!response.ok||Number(data.responseStatus)!==200||typeof data.responseData?.translatedText!=='string'||!data.responseData.translatedText.trim())fail(502,'Não foi possível traduzir. Os seus textos foram mantidos.');
    translated.push(decode(data.responseData.translatedText));
   }
   result[target][field]=translated.join(' ');
   if(result[target][field].length>({title:240,alt:600,name:120}[field]||600))fail(502,'A tradução é demasiado longa. Preencha este campo manualmente.');
   if(cache.size>500)cache.delete(cache.keys().next().value);
   cache.set(key,result[target][field]);
  }
 }
 return result;
 }finally{inFlight=false;}
}
