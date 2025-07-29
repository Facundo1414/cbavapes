const CACHE_NAME = 'image-cache';
const IMAGE_CACHE_URLS = [ /\.(png|jpg|jpeg|webp|gif|svg)$/i ];

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.destination === 'image' || IMAGE_CACHE_URLS.some(r => r.test(request.url))) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
          //console.log('[SW] Usando imagen desde cache:', request.url);
          return cachedResponse;
        }

        return fetch(request).then((response) => {
          if (response.ok) {
            cache.put(request, response.clone());
          }
          return response;
        }).catch((err) => {
          console.error('[SW] Error al obtener imagen:', err);
          return new Response('', { status: 503 });
        });
      })
    );
  }
});

