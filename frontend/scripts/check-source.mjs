import {readdirSync, readFileSync, statSync, existsSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
import {TRANSITION_MS, transitionValue} from '../dist/chapter-timing.mjs';

const root=fileURLToPath(new URL('../dist/',import.meta.url));
let scripts=0,references=0,pages=0;
function localReference(value,file){
  if(!value||/^(?:[a-z]+:|\/\/|#)/i.test(value)||value.includes('${'))return;
  const pathname=decodeURIComponent(value.split(/[?#]/)[0]);
  let target=pathname.startsWith('/')?path.join(root,pathname):path.resolve(path.dirname(file),pathname);
  assert.ok(existsSync(target),`${path.relative(root,file)}: referência inexistente ${value}`);
  if(statSync(target).isDirectory())target=path.join(target,'index.html');
  assert.ok(existsSync(target),`Página inexistente: ${value}`);
  references++;
}
function check(dir){
  for(const entry of readdirSync(dir,{withFileTypes:true})){
    const file=path.join(dir,entry.name);
    if(entry.isDirectory()){check(file);continue;}
    if(!/\.(mjs|js|html|css)$/.test(file))continue;
    const source=readFileSync(file,'utf8');
    if(/\.(mjs|js)$/.test(file)){
      const result=spawnSync(process.execPath,['--check',file],{stdio:'inherit'});
      assert.equal(result.status,0,`Sintaxe inválida: ${file}`);
      scripts++;
      for(const match of source.matchAll(/(?:from\s*|import\s*)['"]([^'"]+)['"]/g))localReference(match[1],file);
      for(const match of source.matchAll(/['"](\/assets\/[^'"\s]+)['"]/g))localReference(match[1],file);
    }
    if(file.endsWith('.html')){
      pages++;
      const ids=[...source.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
      assert.equal(ids.length,new Set(ids).size,`IDs duplicados: ${file}`);
      for(const match of source.matchAll(/\b(?:src|href)="([^"]+)"/g)){
        localReference(match[1],file);
        if(match[1].startsWith('#'))assert.ok(ids.includes(match[1].slice(1)),`Âncora inexistente: ${match[1]}`);
      }
    }
    if(file.endsWith('.css'))for(const match of source.matchAll(/url\(\s*['"]?([^'"\s)]+)['"]?\s*\)/g))localReference(match[1],file);
  }
}
check(root);
// Dynamic drawing URLs also need an explicit integrity check.
const drawings=readdirSync(path.join(root,'assets/solution-svg')).filter(name=>name.endsWith('.svg'));
assert.equal(drawings.length,12);
for(const name of drawings){
 const svg=readFileSync(path.join(root,'assets/solution-svg',name),'utf8');
 assert.match(svg,/<svg[^>]+viewBox=/);
 assert.doesNotMatch(svg,/<(?:script|foreignObject)\b/i);
}
assert.equal(TRANSITION_MS,1800);
for(const [from,to] of [[0,1],[3,4],[4,3],[4,0]]){
  assert.deepEqual(transitionValue(from,to,-1),{value:from,done:false});
  assert.equal(transitionValue(from,to,1799).done,false);
  assert.deepEqual(transitionValue(from,to,1800),{value:to,done:true});
  assert.deepEqual(transitionValue(from,to,5000),{value:to,done:true});
}
console.log(`${pages} páginas, ${scripts} módulos, ${references} referências locais e 12 desenhos SVG validados. Transições: 1800 ms, avanço/recuo e conclusão verificados.`);
console.log('dist/ contém os fontes e o site pronto a servir; nada foi apagado ou reconstruído.');
