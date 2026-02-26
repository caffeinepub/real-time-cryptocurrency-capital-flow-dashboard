// @ts-nocheck
// Service Worker — TypeScript type checking is suppressed here because the
// global `self` type conflicts between lib.dom.d.ts and lib.webworker.d.ts.
// The runtime environment is always a ServiceWorkerGlobalScope.

const CACHE_VERSION = 'v4';
const STATIC_CACHE = `cryptoflow-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `cryptoflow-dynamic-${CACHE_VERSION}`;

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/generated/app-icon-192.dim_192x192.png',
  '/assets/generated/app-icon-512.dim_512x512.png',
  '/assets/generated/app-icon-maskable-512.dim_512x512.png',
];

// Install: precache critical assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== STATIC_CACHE && k !== DYNAMIC_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Handle SKIP_WAITING message from activateUpdate()
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Fetch: cache-first for static, network-first for API
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Network-first for Binance and ICP
  if (
    url.hostname.includes('binance.com') ||
    url.hostname.includes('icp') ||
    url.hostname.includes('ic0.app') ||
    url.hostname.includes('raw.ic0.app')
  ) {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches
          .match(event.request)
          .then((r) => r || new Response('', { status: 503 }))
      )
    );
    return;
  }

  // Cache-first for static assets
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches
            .open(DYNAMIC_CACHE)
            .then((cache) => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
