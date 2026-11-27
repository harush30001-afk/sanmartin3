/* San Martin 3 - offline support: app shell + Firebase SDK cached for use without network */
const V='sm3-sw-14',SHELL=['./','logo-full.jpg?v=274','logo-in-180.png?v=274','app-180.png?v=274','app-180.png','manifest.webmanifest'];/* 876 (שיפור 27.11): אותן כתובות כמו בדף — הלוגו נמצא גם בלי קליטה; app-512 (119KB) רק להתקנה, לא בכל פתיחה */
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(V).then(c=>Promise.all(SHELL.map(u=>c.add(u).catch(()=>{})))))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V&&k!==SKY).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
/* 907: מטמון הקליפים של השמיים — שם משלו (בלי לבטל את מטמון האפליקציה), LRU של 2 */
const SKY='sm3-sky-1',SKYN=2,SKYL='./__sky_lru';
async function skyTouch(c,key){let L=[];try{const m=await c.match(SKYL);if(m)L=await m.json()}catch(x){}
 if(L[0]===key)return;L=[key,...L.filter(k=>k!==key)];const drop=L.slice(SKYN);L=L.slice(0,SKYN);
 await Promise.all(drop.map(k=>c.delete(k)));await c.put(SKYL,new Response(JSON.stringify(L),{headers:{'Content-Type':'application/json'}}))}
async function skyClip(r,u){const key=u.origin+u.pathname;let c,res;
 try{c=await caches.open(SKY);res=await c.match(key)}catch(x){return fetch(r)}
 if(!res){let n;try{n=await fetch(key,{credentials:'same-origin'})}catch(x){return fetch(r)}
  if(!n||n.status!==200)return n;try{await c.put(key,n.clone())}catch(x){}res=n}
 try{await skyTouch(c,key)}catch(x){}
 const rg=r.headers.get('range');if(!rg)return res;
 const buf=await res.arrayBuffer(),m=/bytes=(\d*)-(\d*)/.exec(rg),len=buf.byteLength;let st=0,en=len-1;
 if(m){if(m[1]===''&&m[2]!==''){st=Math.max(0,len-+m[2])}else{st=+m[1]||0;if(m[2]!=='')en=Math.min(+m[2],len-1)}}
 if(st>=len)return new Response(null,{status:416,headers:{'Content-Range':'bytes */'+len}});
 return new Response(buf.slice(st,en+1),{status:206,headers:{'Content-Type':'video/mp4','Content-Range':'bytes '+st+'-'+en+'/'+len,'Content-Length':String(en-st+1),'Accept-Ranges':'bytes'}})}
const net=(req,ms)=>new Promise((res,rej)=>{const t=setTimeout(()=>rej(new Error('slow')),ms);fetch(req).then(r=>{clearTimeout(t);res(r)},e=>{clearTimeout(t);rej(e)})});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
/* 696 (יהב 17.11: "שיפתח מהר, בלי לחכות"): האפליקציה נפתחת מהזיכרון של הטלפון מיד, והגרסה החדשה יורדת ברקע לפתיחה הבאה.
   דף עם ?r= / ?v= (לחיצה על "יש גרסה חדשה"), d.html ו-m.html — תמיד מהרשת. */
if(r.mode==='navigate'&&!/\/(index\.html)?$/.test(u.pathname)){/* 889: דף שאינו האפליקציה (next/voices/d/m/apt…) — מהרשת, ולא נשמר במקום האפליקציה */e.respondWith(fetch(r).catch(()=>caches.match(r,{ignoreSearch:true}).then(x=>x||Response.error())));return}
if(r.mode==='navigate'){const fresh=/[?&](r|v|d|h|p|w|s)=/.test(u.search)||/\/[dm]\.html$/.test(u.pathname)||/\/test\.html$/.test(u.pathname);
 e.respondWith((async()=>{const c=await caches.open(V);const upd=()=>net(new Request(r.url,{cache:'no-cache',credentials:'same-origin'}),30000).then(n=>{if(n&&n.ok&&!/\/[dm]\.html$/.test(u.pathname)&&!/\/test\.html$/.test(u.pathname)&&r.destination!=='iframe'&&!/\/(apt|pk)\.html$/.test(u.pathname))c.put('./',n.clone());return n});
  if(!fresh){const h=(await c.match('./',{ignoreSearch:true}))||(await c.match('index.html',{ignoreSearch:true}));if(h){e.waitUntil(upd().catch(()=>{}));return h}}
  try{return await net(new Request(r.url,{cache:'no-store',credentials:'same-origin'}),8000).then(n=>{if(n&&n.ok&&!/\/[dm]\.html$/.test(u.pathname)&&!/\/test\.html$/.test(u.pathname)&&r.destination!=='iframe'&&!/\/(apt|pk)\.html$/.test(u.pathname))c.put('./',n.clone());return n})}catch(x){return (await c.match('./',{ignoreSearch:true}))||(await c.match('index.html',{ignoreSearch:true}))||Response.error()}})());return}
/* 907 (שמיים מסרטונים): sky/*.mp4 — מהמטמון קודם, במטמון נפרד שמחזיק רק את 2 הקליפים האחרונים (טלפון שומר רק את הקליפ הנוכחי); תומך בבקשות Range של וידאו */
if(u.origin===location.origin&&/\/sky\/[\w.-]+\.mp4$/.test(u.pathname)){e.respondWith(skyClip(r,u));return}
const sdk=(u.hostname==='www.gstatic.com'&&u.pathname.includes('/firebasejs/'))||u.hostname==='cdn.jsdelivr.net'||u.hostname==='cdnjs.cloudflare.com'||u.hostname==='tessdata.projectnaptha.com';
if(u.origin===location.origin&&(u.pathname.endsWith('/')||u.pathname.endsWith('.html'))){e.respondWith((async()=>{const c=await caches.open(V);try{const n=await net(new Request(r.url,{cache:'no-store',credentials:'same-origin'}),8000);if(n&&n.ok&&!/\/[dm]\.html$/.test(u.pathname))c.put('./',n.clone());return n}catch(x){return (await c.match('./',{ignoreSearch:true}))||Response.error()}})());return}
if(sdk||u.origin===location.origin){e.respondWith((async()=>{const c=await caches.open(V),h=await c.match(r,{ignoreSearch:u.origin===location.origin&&!u.search});const f=fetch(r).then(n=>{if(n&&(n.ok||n.type==='opaque'))c.put(r,n.clone());return n}).catch(()=>null);return h||(await f)||Response.error()})())}});
