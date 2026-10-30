/* Retire legacy offline caches, including old HTML and weather. */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => /^(static-|runtime-)/.test(key)).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
/* Deliberately no fetch interception: network failures cannot become a cached homepage. */
