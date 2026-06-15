const CACHE_NAME = 'painpoint-v1';
const ASSETS = [
  '/',
  '/manifest.json'
];

// Check if running in development mode (localhost or local IP)
const isDev = typeof self !== 'undefined' && (
  self.location.hostname === 'localhost' ||
  self.location.hostname === '127.0.0.1' ||
  self.location.hostname.startsWith('192.168.') ||
  self.location.hostname.startsWith('10.') ||
  self.location.hostname.startsWith('172.') ||
  self.location.hostname.startsWith('169.254.')
);

self.addEventListener('install', (event) => {
  if (isDev) {
    // Self-unregister in development to break out of any cache loops
    self.registration.unregister().then(() => {
      console.log('Service Worker self-unregistered in development mode.');
    });
    self.skipWaiting();
    return;
  }

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS).catch(err => {
        console.warn('Caching error during install:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  if (isDev) {
    self.clients.claim();
    return;
  }

  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Bypass Service Worker completely in development
  if (isDev) return;

  if (event.request.method !== 'GET') return;
  
  // Skip non-http/https requests (like chrome-extension://)
  try {
    const url = new URL(event.request.url);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
    
    // Skip dev server files and hot updates
    if (
      url.pathname.startsWith('/_next/') || 
      url.pathname.includes('webpack') ||
      url.pathname.includes('hmr')
    ) {
      return;
    }
  } catch (err) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      }).catch(() => {
        // Fallback for offline if fetching fails
        return caches.match('/');
      });
    })
  );
});
