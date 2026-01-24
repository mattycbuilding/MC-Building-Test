const CACHE_NAME='mcb-cache-v3-nuked-1000000000_v20260126_v20260126b';
const CACHE="mcb-cache-mcb-build-20260124-1705";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.webmanifest",
  "./logo.png",
  "./icon-192.png",
  "./icon-512.png"

  'app_v20260126.js?v=20260126',];
self.addEventListener("install", (e)=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener("activate", (e)=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.map(k=>k!==CACHE ? caches.delete(k) : null)))
  );
  self.clients.claim();
});
self.addEventListener("fetch", (e)=>{
  const req = e.request;
  e.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(res=>{
      // cache same-origin GETs
      try{
        const url = new URL(req.url);
        if(req.method==="GET" && url.origin === location.origin){
          const clone = res.clone();
          caches.open(CACHE).then(c=>c.put(req, clone));
        }
      }catch(_){}
      return res;
    }).catch(()=> cached ))
  );
});
