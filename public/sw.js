/**
 * Service Worker — Vương Quốc Cầu Vồng PWA
 * Cung cấp khả năng hoạt động Offline, bộ đệm tài nguyên tốc độ cao và tự động bảo vệ chống nhiễm cache HTML.
 */

// rainbow-kingdom-cache-v1 (legacy support)
const LEGACY_CACHE = 'rainbow-kingdom-cache-v1';
const CACHE_NAME = 'rainbow-kingdom-cache-v3.7.2';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/game.html',
  '/manifest.json'
];

function isValidResponseForUrl(url, response) {
  if (!response || response.status !== 200) return false;
  if (response.type !== 'basic' && response.type !== 'cors') return false;
  const contentType = (response.headers.get('content-type') || '').toLowerCase();
  const pathname = url.pathname.toLowerCase();

  // Chặn tuyệt đối lỗi SPA rewrite trả về text/html cho file ảnh, JS, CSS
  if (
    pathname.endsWith('.png') ||
    pathname.endsWith('.webp') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.jpeg') ||
    pathname.endsWith('.gif') ||
    pathname.endsWith('.svg')
  ) {
    return contentType.startsWith('image/');
  }
  if (pathname.endsWith('.js') || pathname.endsWith('.mjs')) {
    return contentType.includes('javascript') || contentType.includes('ecmascript');
  }
  if (pathname.endsWith('.css')) {
    return contentType.includes('text/css');
  }
  if (pathname.endsWith('.json')) {
    return contentType.includes('json');
  }
  return true;
}

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

  // Bỏ qua các request không phải GET hoặc không phải http/https
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  // Chiến lược cho HTML, JS, CSS (Network-first, fallback to cache) để luôn nhận cập nhật mới
  if (
    request.headers.get('accept')?.includes('text/html') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname === '/' ||
    url.pathname.endsWith('/index.html') ||
    url.pathname.endsWith('/game.html')
  ) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (isValidResponseForUrl(url, response)) {
            try {
              const cloned = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned)).catch(() => {});
            } catch {}
          }
          return response;
        })
        .catch(() =>
          caches.match(request).then((res) => {
            if (res && isValidResponseForUrl(url, res)) return res;
            return request.headers.get('accept')?.includes('text/html') ? caches.match('/index.html') : Response.error();
          })
        )
    );
    return;
  }

  // Chiến lược cho tài nguyên tĩnh (Kiểm tra tính hợp lệ của cache trước khi dùng, tránh mọi cache bị nhiễm text/html)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse && isValidResponseForUrl(url, cachedResponse)) {
        return cachedResponse;
      }
      return fetch(request)
        .then((networkResponse) => {
          if (isValidResponseForUrl(url, networkResponse)) {
            try {
              const cloned = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned)).catch(() => {});
            } catch {}
          }
          return networkResponse;
        })
        .catch(() => Response.error());
    })
  );
});
