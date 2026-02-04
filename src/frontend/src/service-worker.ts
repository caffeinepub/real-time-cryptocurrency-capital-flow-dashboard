/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

const CACHE_NAME = 'crypto-flow-v2';
const RUNTIME_CACHE = 'crypto-flow-runtime-v2';
const DATA_CACHE = 'crypto-flow-data-v2';

// Assets to cache on install - comprehensive list for offline support
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/generated/pwa-icon.dim_512x512.png',
  '/assets/generated/pwa-maskable-icon.dim_512x512.png',
  '/assets/generated/dashboard-header.dim_1200x200.png',
  '/assets/generated/crypto-flow-bg.dim_1920x1080.png',
  '/assets/generated/crypto-icons-neon-transparent.dim_400x400.png',
  '/assets/generated/data-flow-pattern.dim_800x600.png',
  '/assets/generated/live-status-indicator-transparent.dim_64x24.png',
  '/assets/generated/recovery-panel-bg.dim_1200x800.png',
  '/assets/generated/recovery-status-icons-transparent.dim_300x100.png',
  '/assets/generated/asset-card-template.dim_400x200.png',
  '/assets/generated/flow-intensity-legend.dim_300x100.png',
  '/assets/generated/performance-dashboard-bg.dim_1200x800.png',
  '/assets/generated/performance-ranking-card.dim_400x150.png',
  '/assets/generated/prediction-chart-template.dim_800x400.png',
  '/assets/generated/model-performance-icons-transparent.dim_300x100.png',
  '/assets/generated/accuracy-meter-transparent.dim_200x200.png',
  '/assets/generated/install-prompt-banner.dim_800x120.png',
];

// Install event - cache essential assets
self.addEventListener('install', (event: ExtendableEvent) => {
  console.log('[Service Worker] Installing v2...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Precaching assets');
      return cache.addAll(PRECACHE_ASSETS).catch((error) => {
        console.error('[Service Worker] Precache failed:', error);
        // Continue even if some assets fail to cache
        return Promise.resolve();
      });
    }).then(() => {
      console.log('[Service Worker] Skip waiting');
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event: ExtendableEvent) => {
  console.log('[Service Worker] Activating v2...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE && cacheName !== DATA_CACHE) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[Service Worker] Claiming clients');
      return self.clients.claim();
    })
  );
});

// Helper function to determine cache strategy
function getCacheStrategy(url: URL): 'cache-first' | 'network-first' | 'network-only' {
  const pathname = url.pathname;
  
  // Network-only for WebSocket connections
  if (url.protocol === 'wss:' || url.protocol === 'ws:') {
    return 'network-only';
  }
  
  // Network-first for Binance API calls (with fallback to cache)
  if (url.hostname.includes('binance.com') || url.hostname.includes('binance.us')) {
    return 'network-first';
  }
  
  // Network-first for backend API calls (with fallback to cache)
  if (pathname.includes('canister') || pathname.includes('?canisterId=')) {
    return 'network-first';
  }
  
  // Cache-first for static assets
  if (
    pathname.startsWith('/assets/') ||
    pathname.endsWith('.js') ||
    pathname.endsWith('.css') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.woff') ||
    pathname.endsWith('.woff2')
  ) {
    return 'cache-first';
  }
  
  // Cache-first for HTML pages (for offline support)
  if (pathname === '/' || pathname.endsWith('.html')) {
    return 'cache-first';
  }
  
  // Default to network-first
  return 'network-first';
}

// Fetch event - intelligent caching strategy
self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests except Binance
  if (url.origin !== self.location.origin && !url.hostname.includes('binance.com')) {
    return;
  }

  const strategy = getCacheStrategy(url);

  if (strategy === 'network-only') {
    // No caching for WebSocket connections
    return;
  }

  if (strategy === 'cache-first') {
    // Cache-first strategy for static assets and pages
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Return cached version immediately
          return cachedResponse;
        }

        // Fetch from network and cache
        return fetch(request).then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }

          // Clone the response before caching
          const responseToCache = response.clone();
          
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseToCache);
          });

          return response;
        }).catch(() => {
          // Return a fallback for navigation requests
          if (request.mode === 'navigate') {
            return caches.match('/index.html').then((response) => {
              return response || new Response('Offline - App não disponível', {
                status: 503,
                statusText: 'Service Unavailable',
                headers: { 'Content-Type': 'text/html; charset=utf-8' }
              });
            });
          }
          return new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable',
          });
        });
      })
    );
    return;
  }

  if (strategy === 'network-first') {
    // Network-first strategy for API calls and dynamic data
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }

          // Clone the response before caching
          const responseToCache = response.clone();
          
          // Use DATA_CACHE for API responses
          const cacheName = url.hostname.includes('binance.com') || url.pathname.includes('canister') 
            ? DATA_CACHE 
            : RUNTIME_CACHE;
          
          caches.open(cacheName).then((cache) => {
            cache.put(request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // Return cached version if network fails
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              console.log('[Service Worker] Serving cached data for:', url.pathname);
              return cachedResponse;
            }
            
            // Return appropriate error response
            if (request.mode === 'navigate') {
              return caches.match('/index.html').then((response) => {
                return response || new Response('Offline - App não disponível', {
                  status: 503,
                  statusText: 'Service Unavailable',
                  headers: { 'Content-Type': 'text/html; charset=utf-8' }
                });
              });
            }
            
            return new Response(JSON.stringify({ 
              error: 'Offline', 
              message: 'Dados não disponíveis offline' 
            }), {
              status: 503,
              statusText: 'Service Unavailable',
              headers: { 'Content-Type': 'application/json' }
            });
          });
        })
    );
    return;
  }
});

// Handle messages from clients
self.addEventListener('message', (event: ExtendableMessageEvent) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    // Allow clients to request caching of specific URLs
    const urls = event.data.urls || [];
    event.waitUntil(
      caches.open(DATA_CACHE).then((cache) => {
        return cache.addAll(urls).catch((error) => {
          console.error('[Service Worker] Failed to cache URLs:', error);
        });
      })
    );
  }
});

// Export empty object to make this a module
export {};
