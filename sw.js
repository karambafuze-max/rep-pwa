// REP v10 intentionally runs without an offline service worker cache.
// Exercise data is cached in IndexedDB after successful loading.
self.addEventListener('install',function(){self.skipWaiting()});
self.addEventListener('activate',function(e){e.waitUntil(self.clients.claim())});
