const CACHE_NAME = 'image-cache';
const IMAGE_CACHE_URLS = [
  /\.(png|jpg|jpeg|webp|gif|svg)$/i, // Extensiones comunes de imágenes
  /\/images\//i, // Directorio de imágenes
];
const MAX_CACHE_ENTRIES = 200; // Aumentado el límite de entradas en el caché
const NEXT_IMAGE_OPTIMIZATION_PATH = '/_next/image';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

function normalizeUrl(url) {
  try {
    const normalizedUrl = new URL(url);
    normalizedUrl.pathname = normalizedUrl.pathname.replace(/\/\/+/, '/');
    return normalizedUrl.toString();
  } catch (e) {
    console.error('[SW] Error al normalizar URL:', url, e);
    return url;
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (
    request.destination === 'image' ||
    IMAGE_CACHE_URLS.some((r) => r.test(request.url)) ||
    request.url.includes(NEXT_IMAGE_OPTIMIZATION_PATH) // Interceptar imágenes optimizadas de Next.js
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const normalizedUrl = normalizeUrl(request.url);
        const normalizedRequest = new Request(normalizedUrl, request);

        const cachedResponse = await cache.match(normalizedRequest);
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(normalizedRequest)
          .then((response) => {
            if (response.ok) {
              cache.put(normalizedRequest, response.clone());
              console.log('[SW] Imagen guardada en cache:', normalizedUrl);

              // Limpiar caché si excede el límite
              cache.keys().then((keys) => {
                if (keys.length > MAX_CACHE_ENTRIES) {
                  cache.delete(keys[0]).then(() => {
                    console.log('[SW] Entrada eliminada del caché:', keys[0].url);
                  });
                }
              });
            }
            return response;
          })
          .catch((err) => {
            console.error('[SW] Error al obtener imagen:', normalizedUrl, err);
            return fetch('/images/placeholder.png'); // Imagen de marcador de posición
          });
      })
    );
  }
});

