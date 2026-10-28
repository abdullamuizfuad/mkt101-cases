/* MKT101 Arena service worker (scope: /mkt101-cases/): works offline, but always tries the network first so updates arrive.
   Bump CACHE when the list of files changes; old MKT101 caches are deleted on activate (other sites' caches are left alone). */
const CACHE='mkt101-arena-v7';
const CORE=['./','index.html','engine/engine.css','engine/concepts.js','engine/cloud.js','engine/install.js','engine/coverage.js','engine/presence.js','engine/core.js','engine/feat.js','engine/avatar.js','engine/names.js','engine/dash.js','engine/boot.js','course-config.js','course.js','course.css','cloud-config.js','bank.js','bank-x.js','bank-s.js','notes.js','cases-data.js','case-extend.js','args.js','acts.js',
  'roster.js','leaderboard.js','manifest.webmanifest','assets/favicon.svg','assets/icon-192.png','assets/icon-512.png','assets/apple-touch-icon.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('mkt101-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
  if(u.origin!==location.origin){ // Google Fonts: cache-first
    if(/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname))e.respondWith(caches.open(CACHE).then(c=>c.match(r).then(m=>m||fetch(r).then(res=>{c.put(r,res.clone());return res}))));
    return}
  e.respondWith(fetch(r,{cache:'no-cache'}).then(res=>{if(res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp))}return res})
    .catch(()=>caches.match(r,{ignoreSearch:true}).then(m=>m||(r.mode==='navigate'?caches.match('index.html'):undefined))))});
