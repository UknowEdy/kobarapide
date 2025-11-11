// Service Worker désactivé - tout du réseau
self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', event => {
  // Pas de cache - tout du réseau
  event.respondWith(fetch(event.request));
});
