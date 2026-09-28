import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {renderLanguage,language} from '../../server/localization.mjs';
const root=fileURLToPath(new URL('../dist/',import.meta.url));
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2','.glb':'model/gltf-binary','.mp4':'video/mp4'};
const port=Number(process.env.PORT||4173),host=process.env.HOST||'127.0.0.1';
http.createServer(async(req,res)=>{
 try{
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
  const url=new URL(req.url,'http://localhost');
  const pathname=decodeURIComponent(url.pathname);
  let file=path.resolve(root,'.'+pathname);
  if(file!==path.resolve(root)&&!file.startsWith(path.resolve(root)+path.sep)){res.writeHead(403);res.end();return;}
  if((await stat(file)).isDirectory())file=path.join(file,'index.html');
  let bytes=await readFile(file);
  if(file.endsWith('.html')){
   let html=bytes.toString('utf8');
   if(html.includes('<!-- company-shared-header -->')){
    const shared=await readFile(path.join(root,'index.html'),'utf8');
    const header=shared.match(/<header class="site-header">[\s\S]*?<\/header>/)[0];
    const menu=shared.match(/<dialog id="menu"[\s\S]*?<\/dialog>/)[0];
    const footer=shared.match(/<footer class="brand-footer"[\s\S]*?<\/footer>/)[0];
    html=html.replace('<!-- company-shared-header -->',()=>header+menu).replace('<!-- company-shared-footer -->',()=>footer);
   }
   const lang=language(url.searchParams.get('lang'));
   bytes=Buffer.from(renderLanguage(html,lang,url));
   res.setHeader('Content-Language',lang);
  }
  res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache','Content-Length':bytes.length});res.end(req.method==='HEAD'?undefined:bytes);
 }catch{res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('Página não encontrada');}
}).listen(port,host,()=>console.log(`Capiarcos: http://${host}:${port}`));
