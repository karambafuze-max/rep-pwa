self.addEventListener('install',function(){self.skipWaiting()});
self.addEventListener('activate',function(event){event.waitUntil((async function(){try{var keys=await caches.keys();await Promise.all(keys.map(function(k){return caches.delete(k)}));var reg=await self.registration;await reg.unregister()}catch(e){}var clientsList=await self.clients.matchAll({type:'window'});clientsList.forEach(function(c){c.navigate(c.url)})})())});
self.addEventListener('fetch',function(){});
