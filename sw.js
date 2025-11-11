// Service Worker for Daily Checklist v2.0
// PWA Offline Support + Caching Strategy

const CACHE_NAME = 'daily-checklist-v2.0.0';
const RUNTIME_CACHE = 'daily-checklist-runtime';

// Files to cache for offline access
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/app.js',
    '/styles.css',
    '/README.md'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => self.skipWaiting())
            .catch((error) => {
                console.error('[Service Worker] Install failed:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((name) => {
                            // Delete old cache versions
                            return name !== CACHE_NAME && name !== RUNTIME_CACHE;
                        })
                        .map((name) => {
                            console.log('[Service Worker] Deleting old cache:', name);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip cross-origin requests
    if (url.origin !== location.origin) {
        return;
    }

    // Strategy: Cache First, falling back to Network
    event.respondWith(
        caches.match(request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    console.log('[Service Worker] Serving from cache:', request.url);
                    return cachedResponse;
                }

                // Clone request for fetch
                return fetch(request)
                    .then((response) => {
                        // Check if valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone response for cache
                        const responseToCache = response.clone();

                        caches.open(RUNTIME_CACHE)
                            .then((cache) => {
                                cache.put(request, responseToCache);
                            });

                        return response;
                    })
                    .catch((error) => {
                        console.error('[Service Worker] Fetch failed:', error);

                        // Return offline fallback if available
                        return caches.match('/index.html');
                    });
            })
    );
});

// Background sync for saving tasks (future feature)
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-tasks') {
        console.log('[Service Worker] Background sync triggered');
        event.waitUntil(syncTasks());
    }
});

async function syncTasks() {
    // This would sync local changes to a backend
    // Currently just a placeholder for future implementation
    console.log('[Service Worker] Syncing tasks...');
    return Promise.resolve();
}

// Push notification support (future feature)
self.addEventListener('push', (event) => {
    console.log('[Service Worker] Push notification received');

    const options = {
        body: event.data ? event.data.text() : 'You have new updates!',
        icon: '/icon-192.png',
        badge: '/icon-72.png',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'view',
                title: 'View',
                icon: '/icon-check.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/icon-close.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('Daily Checklist', options)
    );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    console.log('[Service Worker] Notification clicked:', event.action);

    event.notification.close();

    if (event.action === 'view') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Message handler for communication with app
self.addEventListener('message', (event) => {
    console.log('[Service Worker] Message received:', event.data);

    if (event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data.type === 'CACHE_URLS') {
        const urlsToCache = event.data.urls;
        event.waitUntil(
            caches.open(RUNTIME_CACHE)
                .then((cache) => cache.addAll(urlsToCache))
        );
    }
});

// Periodic background sync (Chrome 80+)
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'daily-sync') {
        console.log('[Service Worker] Periodic sync triggered');
        event.waitUntil(syncTasks());
    }
});

console.log('[Service Worker] Service Worker loaded successfully');
