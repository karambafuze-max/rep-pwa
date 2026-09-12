/* REP v4 intentionally removes the old offline cache to avoid stale Safari builds. */
self.addEventListener('install', function(){ self.skipWaiting(); });
self.addEventListener('activate', function(event){
  event.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){return k.indexOf('rep-pwa-')===0;}).map(function(k){return caches.delete(k);}));
  }).then(function(){return self.registration.unregister();}).then(function(){return self.clients.claim();}));
});
self.addEventListener('fetch', function(){});
