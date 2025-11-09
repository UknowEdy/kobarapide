const CACHE_NAME = 'kobarapide-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/App.tsx',
  '/index.tsx'
];

// Installation du service worker
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installation...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('📦 Mise en cache des assets');
      return cache.addAll(ASSETS_TO_CACHE).catch(err => {
        console.warn('⚠️ Certains assets n\'ont pas pu être cachés:', err);
        // Continuer même si certains assets ne peuvent pas être cachés
      });
    })
  );
  self.skipWaiting();
});

// Activation du service worker
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker activation');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Suppression ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Stratégie de cache: Network First, fallback to Cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore les requêtes non-GET
  if (request.method !== 'GET') {
    return;
  }

  // Les API calls: Network First
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (!response || response.status !== 200) {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // Si offline, retourner le cache
          return caches.match(request).then((response) => {
            return response || new Response(
              JSON.stringify({ error: 'Offline - cached response unavailable' }),
              { status: 503, statusText: 'Service Unavailable' }
            );
          });
        })
    );
    return;
  }

  // Les assets: Cache First, fallback to Network
  event.respondWith(
    caches.match(request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(request).then((response) => {
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });
        return response;
      });
    })
  );
});

// Gestion des messages depuis le client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
