import {translate} from '../frontend/dist/languages.mjs';
import {escapeHtml} from './localization.mjs';

// Server-rendered metadata is available to share crawlers without JavaScript.
export function socialMetadata(html,lang,url,origin){
 const title=html.match(/<title>([\s\S]*?)<\/title>/i)?.[1];
 if(!title)return html;
 const description=escapeHtml(translate('Fabricação e montagem de carpintaria desde 1998',lang));
 const image=escapeHtml(new URL('/assets/optimized/logo-original.png',origin).href);
 const target=new URL(url.pathname,origin);target.searchParams.set('lang',lang);
 const tags=`<meta property="og:type" content="website"><meta property="og:site_name" content="CAPIARCOS"><meta property="og:title" content="${title}"><meta property="og:description" content="${description}"><meta property="og:url" content="${escapeHtml(target.href)}"><meta property="og:locale" content="${{pt:'pt_PT',fr:'fr_FR',en:'en_GB'}[lang]}"><meta property="og:image" content="${image}"><meta property="og:image:type" content="image/png"><meta property="og:image:width" content="866"><meta property="og:image:height" content="288"><meta property="og:image:alt" content="CAPIARCOS"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${title}"><meta name="twitter:description" content="${description}"><meta name="twitter:image" content="${image}"><meta name="twitter:image:alt" content="CAPIARCOS">`;
 return html.replace('</head>',tags+'</head>');
}
