// Service Worker for caching and performance
const CACHE_NAME = 'critos-pro-v2';
const STATIC_CACHE = 'static-v2';
const DYNAMIC_CACHE = 'dynamic-v2';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/src/main.tsx',
  '/src/App.tsx',
  '/src/index.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - network first for development, cache for fonts
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip external requests (except fonts)
  const url = new URL(event.request.url);
  if (!url.origin.includes(self.location.origin) && !url.origin.includes('fonts.googleapis.com') && !url.origin.includes('fonts.gstatic.com')) {
    return;
  }

  // Use cache-first only for fonts and static assets
  const isFontRequest = url.origin.includes('fonts.googleapis.com') || url.origin.includes('fonts.gstatic.com');
  const isStaticAsset = event.request.url.includes('.css') || event.request.url.includes('.js') || event.request.url.includes('.woff');

  if (isFontRequest || isStaticAsset) {
    // Cache-first for fonts and static assets
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(event.request)
            .then(response => {
              if (response && response.status === 200) {
                const responseToCache = response.clone();
                caches.open(STATIC_CACHE)
                  .then(cache => cache.put(event.request, responseToCache));
              }
              return response;
            });
        })
    );
  } else {
    // Network-first for everything else (HTML, API calls, etc.)
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // If network succeeds, update cache and return response
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(DYNAMIC_CACHE)
              .then(cache => cache.put(event.request, responseToCache));
          }
          return response;
        })
        .catch(() => {
          // If network fails, try cache
          return caches.match(event.request)
            .then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // Fallback for offline scenarios
              if (event.request.destination === 'document') {
                return caches.match('/');
              }
            });
        })
    );
  }
});

// Background sync for better mobile performance
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  // Implement background sync logic if needed
  return Promise.resolve();
}