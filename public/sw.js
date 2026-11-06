/**
 * Service Worker — Vương Quốc Cầu Vồng PWA
 * Cung cấp khả năng hoạt động Offline, bộ đệm tài nguyên tốc độ cao và cập nhật an toàn.
 */

// rainbow-kingdom-cache-v1 (legacy support)
const LEGACY_CACHE = 'rainbow-kingdom-cache-v1';
const CACHE_NAME = 'rainbow-kingdom-cache-v3.5.7';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/game.html',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[ServiceWorker] Lỗi precache tài nguyên ban đầu:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[ServiceWorker] Xóa cache phiên bản cũ:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Bỏ qua các request không phải GET
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Chiến lược cho HTML, JS, CSS (Network-first, fallback to cache) để luôn nhận cập nhật mới
  if (
    request.headers.get('accept')?.includes('text/html') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname === '/' ||
    url.pathname.endsWith('/index.html') || url.pathname.endsWith('/game.html')
  ) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const cloned = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned));
          }
          return response;
        })
        .catch(() => caches.match(request).then((res) => res || (request.headers.get('accept')?.includes('text/html') ? caches.match('/game.html') : null)))
    );
    return;
  }

  // Chiến lược cho tài nguyên tĩnh (Cache-first, fallback to network)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const cloned = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned));
        return networkResponse;
      });
    })
  );
});
