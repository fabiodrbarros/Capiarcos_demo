import readline from 'node:readline/promises';
import {setCredentials,credentials} from './auth.mjs';
if(!process.stdin.isTTY){console.error('Executar num terminal interativo. Não passar passwords como argumentos.');process.exit(1);}
const rl=readline.createInterface({input:process.stdin,output:process.stdout});
const existing=await credentials();
if(existing&&await rl.question('Substituir o administrador e invalidar sessões? Escreva SIM: ')!=='SIM'){rl.close();process.exit(0);}
const user=(await rl.question('Utilizador: ')).trim();
rl.close();
async function hidden(prompt){
 process.stdout.write(prompt);
 return new Promise((resolve,reject)=>{
  let value='';process.stdin.setRawMode(true);process.stdin.resume();
  function finish(){process.stdin.off('data',read);process.stdin.setRawMode(false);process.stdin.pause();process.stdout.write('\n');}
  function read(chunk){for(const c of chunk.toString()){if(c==='\u0003'){finish();reject(Error('Cancelado'));return;}if(c==='\r'||c==='\n'){finish();resolve(value);return;}if(c==='\u007f'||c==='\b')value=value.slice(0,-1);else if(c>=' ')value+=c;}}
  process.stdin.on('data',read);
 });
}
try{const password=await hidden('Palavra-passe (mínimo 12 caracteres, não é mostrada): ');if(password!==await hidden('Confirmar palavra-passe: '))throw Error('As palavras-passe não coincidem.');await setCredentials(user,password);console.log('Administrador guardado. Pode entrar em /admin/.');}catch(e){console.error(e.message);process.exitCode=1;}
