const CACHE_VERSION = 'v1';
const CACHE_NAME = `vku-field-survey-cache-${CACHE_VERSION}`;

// Core App Shell resources to pre-cache
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  // In a production Vite app, these would be the hashed assets. 
  // We include the basics for offline fallback.
];

// ==========================================
// 1. LIFECYCLE: INSTALL
// ==========================================
// The install event fires when the Service Worker is first downloaded and registered.
// This is the ideal time to pre-cache essential resources (App Shell) so the app 
// can boot immediately next time or function completely offline.
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install Event firing');
  
  // Extend the install phase until pre-caching is complete
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching App Shell');
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => {
      // Force the waiting service worker to become the active service worker
      return self.skipWaiting();
    })
  );
});


// ==========================================
// 2. LIFECYCLE: ACTIVATE
// ==========================================
// The activate event fires after installation, when this SW takes control of the pages.
// This is the perfect place to clean up old, deprecated caches from previous versions.
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activate Event firing');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // If the cache name starts with our prefix but doesn't match current version, delete it
          if (cacheName.startsWith('vku-field-survey-cache-') && cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Take control of all clients immediately without requiring a reload
      return self.clients.claim();
    })
  );
});


// ==========================================
// 3. CACHING STRATEGIES
// ==========================================

// Strategy 1: Cache First (Fall back to network)
// Best for static assets (images, CSS, JS) that rarely change.
const cacheFirst = async (request) => {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  try {
    const networkResponse = await fetch(request);
    // Only cache successful responses (e.g. GET requests, status 200)
    if (networkResponse.ok && request.method === 'GET' && !request.url.includes('chrome-extension')) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.warn('[Service Worker] Cache First failed:', error);
    throw error;
  }
};

// Strategy 2: Network First (Fall back to cache)
// Best for critical dynamic data or API calls where freshness is important, 
// but we want offline capabilities as a fallback.
const networkFirst = async (request) => {
  const cache = await caches.open(CACHE_NAME);
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok && request.method === 'GET' && !request.url.includes('chrome-extension')) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.warn('[Service Worker] Network failed, returning cached data');
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
};

// Strategy 3: Stale-While-Revalidate
// Best for feed-like data (e.g., avatars, user posts) where speed is prioritized.
// Immediately returns cached version, then updates the cache in the background for next time.
const staleWhileRevalidate = async (request) => {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok && request.method === 'GET' && !request.url.includes('chrome-extension')) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(err => console.warn('[Service Worker] Background fetch failed', err));

  // Return cached response immediately if exists, otherwise wait for network
  return cachedResponse || fetchPromise;
};

// Strategy 4: Cache Only
// Best for explicitly pre-cached assets that should never hit the network.
const cacheOnly = async (request) => {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) return cachedResponse;
  return new Response("Asset not found in cache", { status: 404 });
};

// Strategy 5: Network Only
// Best for non-GET requests (POST, PUT, DELETE) or highly sensitive transactional endpoints.
const networkOnly = async (request) => {
  return fetch(request);
};


// ==========================================
// 4. LIFECYCLE: FETCH
// ==========================================
// The fetch event intercepts all outgoing HTTP requests from the application.
// Here we route different requests to different caching strategies.
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Network Only for non-GET requests (e.g., POST form submissions to an API)
  if (request.method !== 'GET') {
    event.respondWith(networkOnly(request));
    return;
  }

  // 2. Network First for API calls (Assuming we had an /api endpoint)
  // Ensures fresh data if online, falls back to cache if offline
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // 3. Stale-While-Revalidate for images or external avatars
  // if (url.pathname.match(/\.(png|jpg|jpeg|gif)$/)) {
  //   event.respondWith(staleWhileRevalidate(request));
  //   return;
  // }

  // 4. Cache First for static App Shell assets (CSS, JS, Fonts)
  // Dev mode (Vite) often serves dynamic modules, so in dev we just try cache-first
  // In production, Vite bundles these into /assets/
  event.respondWith(cacheFirst(request));
});

// ==========================================
// 5. BACKGROUND SYNC
// ==========================================
// This event fires when the browser regains connectivity, even if the app tab is closed!
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-surveys') {
    console.log('[Service Worker] Background Sync triggered: sync-surveys');
    // To maintain a single API abstraction (src/services/api.ts), we notify the client
    // to perform the sync. This ensures we don't duplicate complex fetch/retry logic.
    event.waitUntil(
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({ type: 'TRIGGER_SYNC' });
        });
      })
    );
  }
});

