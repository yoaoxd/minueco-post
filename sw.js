// The Minuecus Post - Service Worker
const CACHE_NAME = 'minuecus-post-v1';
const CACHE_URLS = [
    '/',
    '/index.html',
    '/times.html',
    '/styles.css',
    '/news.json',
    '/news-times.json',
    '/favicon.svg'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('📰 Minuecus Post: Caching resources');
                return cache.addAll(CACHE_URLS);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('📰 Removing old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;
    
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    // Return cached version
                    return response;
                }
                // Fetch from network
                return fetch(event.request).then((networkResponse) => {
                    // Cache new resources (except API calls)
                    if (networkResponse.ok && !event.request.url.includes('api')) {
                        const responseClone = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseClone);
                        });
                    }
                    return networkResponse;
                });
            })
            .catch(() => {
                // Offline fallback
                if (event.request.destination === 'document') {
                    return caches.match('/index.html');
                }
            })
    );
});

// Push notification event
self.addEventListener('push', (event) => {
    let data = {
        title: '🚨 ALERTA PRESIDENCIAL',
        body: 'Nueva noticia de última hora en The Minuecus Post',
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        tag: 'minuecus-alert',
        data: { url: '/' }
    };

    if (event.data) {
        try {
            const payload = event.data.json();
            data = { ...data, ...payload };
        } catch (e) {
            data.body = event.data.text();
        }
    }

    const options = {
        body: data.body,
        icon: data.icon || '/favicon.svg',
        badge: data.badge || '/favicon.svg',
        tag: data.tag || 'minuecus-alert',
        vibrate: [200, 100, 200, 100, 200],
        data: data.data || { url: '/' },
        actions: [
            { action: 'open', title: '📰 Leer ahora' },
            { action: 'dismiss', title: '❌ Cerrar' }
        ],
        requireInteraction: true
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'dismiss') {
        return;
    }

    const urlToOpen = event.notification.data?.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Focus existing window if available
                for (const client of clientList) {
                    if (client.url.includes('minueco-post') && 'focus' in client) {
                        client.navigate(urlToOpen);
                        return client.focus();
                    }
                }
                // Open new window
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-news') {
        event.waitUntil(
            fetch('/news.json')
                .then(response => response.json())
                .then(data => {
                    console.log('📰 News synced in background');
                })
        );
    }
});

console.log('📰 The Minuecus Post Service Worker loaded - ¡Venceremos!');
