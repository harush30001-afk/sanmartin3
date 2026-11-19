/* San Martin 3 - offline support: app shell + Firebase SDK cached for use without network */
const V='sm3-sw-13',SHELL=['./','logo-full.jpg','logo-in-180.png','app-180.png','app-512.png','manifest.webmanifest'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(V).then(c=>Promise.all(SHELL.map(u=>c.add(u).catch(()=>{})))))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
const net=(req,ms)=>new Promise((res,rej)=>{const t=setTimeout(()=>rej(new Error('slow')),ms);fetch(req).then(r=>{clearTimeout(t);res(r)},e=>{clearTimeout(t);rej(e)})});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
/* 696 (יהב 17.11: "שיפתח מהר, בלי לחכות"): האפליקציה נפתחת מהזיכרון של הטלפון מיד, והגרסה החדשה יורדת ברקע לפתיחה הבאה.
   דף עם ?r= / ?v= (לחיצה על "יש גרסה חדשה"), d.html ו-m.html — תמיד מהרשת. */
if(r.mode==='navigate'){const fresh=/[?&](r|v|d|h|p|w|s)=/.test(u.search)||/\/[dm]\.html$/.test(u.pathname)||/\/test\.html$/.test(u.pathname);
 e.respondWith((async()=>{const c=await caches.open(V);const upd=()=>net(new Request(r.url,{cache:'no-store',credentials:'same-origin'}),30000).then(n=>{if(n&&n.ok&&!/\/[dm]\.html$/.test(u.pathname)&&!/\/test\.html$/.test(u.pathname)&&r.destination!=='iframe'&&!/\/(apt|pk)\.html$/.test(u.pathname))c.put('./',n.clone());return n});
  if(!fresh){const h=(await c.match('./',{ignoreSearch:true}))||(await c.match('index.html',{ignoreSearch:true}));if(h){e.waitUntil(upd().catch(()=>{}));return h}}
  try{return await net(new Request(r.url,{cache:'no-store',credentials:'same-origin'}),8000).then(n=>{if(n&&n.ok&&!/\/[dm]\.html$/.test(u.pathname)&&!/\/test\.html$/.test(u.pathname)&&r.destination!=='iframe'&&!/\/(apt|pk)\.html$/.test(u.pathname))c.put('./',n.clone());return n})}catch(x){return (await c.match('./',{ignoreSearch:true}))||(await c.match('index.html',{ignoreSearch:true}))||Response.error()}})());return}
const sdk=(u.hostname==='www.gstatic.com'&&u.pathname.includes('/firebasejs/'))||u.hostname==='cdn.jsdelivr.net'||u.hostname==='cdnjs.cloudflare.com'||u.hostname==='tessdata.projectnaptha.com';
if(u.origin===location.origin&&(u.pathname.endsWith('/')||u.pathname.endsWith('.html'))){e.respondWith((async()=>{const c=await caches.open(V);try{const n=await net(new Request(r.url,{cache:'no-store',credentials:'same-origin'}),8000);if(n&&n.ok&&!/\/[dm]\.html$/.test(u.pathname))c.put('./',n.clone());return n}catch(x){return (await c.match('./',{ignoreSearch:true}))||Response.error()}})());return}
if(sdk||u.origin===location.origin){e.respondWith((async()=>{const c=await caches.open(V),h=await c.match(r,{ignoreSearch:u.origin===location.origin&&!u.search});const f=fetch(r).then(n=>{if(n&&(n.ok||n.type==='opaque'))c.put(r,n.clone());return n}).catch(()=>null);return h||(await f)||Response.error()})())}});
