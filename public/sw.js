const CACHE_VERSION = 'v1';
const CACHE_NAME = `vku-field-survey-shell-${CACHE_VERSION}`;

// Core App Shell resources to pre-cache
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  /* INJECT_ASSETS_HERE */
];

// ==========================================
// 1. LIFECYCLE: INSTALL
// ==========================================
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install Event firing');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching App Shell');
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// ==========================================
// 2. LIFECYCLE: ACTIVATE
// ==========================================
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activate Event firing');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName.startsWith('vku-field-survey-shell-') && cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// ==========================================
// 3. CACHING STRATEGIES
// ==========================================

// Strategy 1: Cache First (Fall back to network)
const cacheFirst = async (request) => {
  const cache = await caches.open(CACHE_NAME);
  let cachedResponse = await cache.match(request);
  if (!cachedResponse) {
    cachedResponse = await cache.match(request, { ignoreSearch: true });
  }
  if (cachedResponse) {
    return cachedResponse; // HIT -> return cached response immediately
  }
  try {
    const networkResponse = await fetch(request); // MISS -> fetch network
    // Only cache successful GET responses
    if (networkResponse.ok && request.method === 'GET' && !request.url.includes('chrome-extension')) {
      cache.put(request, networkResponse.clone()); // -> cache
    }
    return networkResponse; // -> return response
  } catch (error) {
    console.warn('[Service Worker] Cache First failed:', error);
    throw error;
  }
};

const networkOnly = async (request) => {
  return fetch(request);
};

// ==========================================
// 4. LIFECYCLE: FETCH
// ==========================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Bypass Vite HMR, WebSockets, and development-only resources
  if (
    request.headers.get('upgrade') === 'websocket' || 
    url.searchParams.has('token') ||
    url.pathname.startsWith('/@vite/') || 
    url.pathname.startsWith('/@fs/') || 
    url.pathname.startsWith('/@id/') ||
    url.pathname.includes('node_modules')
  ) {
    return;
  }

  // POST /api/surveys MUST NOT be cached
  if (request.method !== 'GET' || url.pathname.startsWith('/api/')) {
    event.respondWith(networkOnly(request));
    return;
  }

  // SPA Navigation Fallback for Offline Boot
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html').then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request);
      })
    );
    return;
  }

  // Cache-First for App Shell resources
  event.respondWith(cacheFirst(request));
});

// ==========================================
// 5. BACKGROUND SYNC
// ==========================================
self.addEventListener('sync', (event) => {
  if (event.tag === 'survey-sync') {
    console.log('[Service Worker] Background Sync triggered: survey-sync');
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'TRIGGER_SYNC' });
        });
      })
    );
  }
});
