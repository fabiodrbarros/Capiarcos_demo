import {readFile,writeFile,mkdir,rename} from 'node:fs/promises';
import {randomBytes,scrypt as scryptCallback,timingSafeEqual} from 'node:crypto';
import {promisify} from 'node:util';
import path from 'node:path';
import {dataDir} from './store.mjs';
const scrypt=promisify(scryptCallback);
const ttl=8*60*60*1000;
const sessions=new Map(),attempts=new Map();
export async function credentials(){try{return JSON.parse(await readFile(path.join(dataDir,'admin.json'),'utf8'));}catch(e){if(e.code==='ENOENT')return null;throw e;}}
export async function setCredentials(user,password){
 if(!/^[a-zA-Z0-9._-]{3,64}$/.test(user))throw Error('Utilizador: 3 a 64 letras, números, ponto, hífen ou underscore.');
 if(password.length<12||password.length>256)throw Error('A palavra-passe deve ter entre 12 e 256 caracteres.');
 const salt=randomBytes(32).toString('hex'),hash=(await scrypt(password,salt,64)).toString('hex');
 await mkdir(dataDir,{recursive:true,mode:0o700});
 const temp=path.join(dataDir,'admin-'+randomBytes(8).toString('hex')+'.tmp');
 await writeFile(temp,JSON.stringify({user,salt,hash}),{mode:0o600});
 await rename(temp,path.join(dataDir,'admin.json'));
}
export function allowLogin(ip){
 const now=Date.now();
 for(const [key,entry] of attempts)if(entry.until<now)attempts.delete(key);
 const key=String(ip),entry=attempts.get(key)||{count:0,until:now+15*60*1000};
 entry.count++;attempts.set(key,entry);
 return entry.count<=10;
}
export async function login(user,password){
 const record=await credentials();
 if(!record)return null;
 const hash=await scrypt(password,record.salt,64);
 if(!timingSafeEqual(hash,Buffer.from(record.hash,'hex'))||user!==record.user)return null;
 const token=randomBytes(32).toString('hex'),csrf=randomBytes(32).toString('hex');
 for(const [key,s] of sessions)if(s.expires<Date.now())sessions.delete(key);
 if(sessions.size>=100)sessions.delete(sessions.keys().next().value);
 sessions.set(token,{csrf,expires:Date.now()+ttl,user,credentialHash:record.hash});
 return {token,csrf,user};
}
export const tokenFrom=req=>/\bcap_session=([a-f0-9]{64})(?:;|$)/.exec(req.headers.cookie||'')?.[1];
export async function session(req){
 const token=tokenFrom(req),s=sessions.get(token);
 if(!s)return null;
 if(s.expires<Date.now()||(await credentials())?.hash!==s.credentialHash){sessions.delete(token);return null;}
 return s;
}
export function logout(req){sessions.delete(tokenFrom(req));}
export function cookie(token,clear=false){return `cap_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${clear?0:ttl/1000}${process.env.NODE_ENV==='production'?'; Secure':''}`;}
