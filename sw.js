const CACHE_NAME = 'birthday-pwa-v2';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './admin.html',
  './styles.min.css',
  './script.min.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);

  // Bypass service worker for video files completely to prevent caching large files
  // and to avoid Safari byte-range request issues
  if (requestUrl.pathname.endsWith('.mp4') || requestUrl.pathname.endsWith('.webm') || requestUrl.pathname.endsWith('.ogg')) {
    return; // Fall back to default browser behavior
  }

  // Stale-While-Revalidate strategy for other requests
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      const fetchPromise = fetch(event.request).then(networkResponse => {
        // Cache successful responses for future use
        if (networkResponse.ok && event.request.method === 'GET' && !requestUrl.pathname.startsWith('/.netlify/images')) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Network failed, return cached response if it exists
        return cachedResponse;
      });

      return cachedResponse || fetchPromise;
    })
  );
});
