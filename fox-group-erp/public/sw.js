const CACHE_NAME = 'fox-erp-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/fonts/librebarcode39text.woff2',
];

// Install event - cache static assets
self.addEventListener('install', function (event) {
    console.log('[ServiceWorker] Install');
    event.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            console.log('[ServiceWorker] Caching static assets');
            return cache.addAll(STATIC_ASSETS);
        })
    );
    // Force the waiting service worker to become active
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', function (event) {
    console.log('[ServiceWorker] Activate');
    event.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames
                    .filter(function (name) { return name !== CACHE_NAME; })
                    .map(function (name) {
                        console.log('[ServiceWorker] Deleting old cache:', name);
                        return caches.delete(name);
                    })
            );
        })
    );
    // Claim all clients
    self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', function (event) {
    var request = event.request;
    var url = new URL(request.url);

    // Skip API requests - they should go to network (with offline handling in app)
    if (url.pathname.startsWith('/api')) {
        return;
    }

    // For navigation requests, try network first, then cache
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then(function (response) {
                    // Clone the response to store in cache
                    var responseClone = response.clone();
                    caches.open(CACHE_NAME).then(function (cache) {
                        cache.put(request, responseClone);
                    });
                    return response;
                })
                .catch(function () {
                    // If network fails, try cache
                    return caches.match(request).then(function (response) {
                        return response || caches.match('/index.html');
                    });
                })
        );
        return;
    }

    // For other requests (assets), try cache first, then network
    event.respondWith(
        caches.match(request).then(function (cachedResponse) {
            if (cachedResponse) {
                // Return cached response and update cache in background
                fetch(request).then(function (networkResponse) {
                    caches.open(CACHE_NAME).then(function (cache) {
                        cache.put(request, networkResponse);
                    });
                }).catch(function () { }); // Ignore network errors for background updates

                return cachedResponse;
            }

            // Not in cache, fetch from network
            return fetch(request).then(function (networkResponse) {
                // Cache the new response
                var responseClone = networkResponse.clone();
                caches.open(CACHE_NAME).then(function (cache) {
                    cache.put(request, responseClone);
                });
                return networkResponse;
            }).catch(function () {
                // Network failed, return offline fallback for HTML
                if (request.headers.get('Accept') && request.headers.get('Accept').includes('text/html')) {
                    return caches.match('/index.html');
                }
                return new Response('Offline', { status: 503 });
            });
        })
    );
});

// Listen for messages from the main app
self.addEventListener('message', function (event) {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
