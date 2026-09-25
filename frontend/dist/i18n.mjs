import {translate,language} from './languages.mjs';
export const lang=language(new URL(location.href).searchParams.get('lang')||document.documentElement.lang);
export const t=source=>translate(source,lang);
export const pageStatus=(count,page,total)=>({pt:`${count} imagens no catálogo. Página ${page} de ${total}.`,fr:`${count} images dans le catalogue. Page ${page} sur ${total}.`,en:`${count} images in the catalogue. Page ${page} of ${total}.`}[lang]);
export const stageStatus=(index,total,label)=>({pt:`${index} de ${total} — ${label}`,fr:`${index} sur ${total} — ${label}`,en:`${index} of ${total} — ${label}`}[lang]);
