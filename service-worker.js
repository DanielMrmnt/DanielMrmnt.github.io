// Enregistrer le service worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js')
            .then((registration) => {
                console.log('Service Worker enregistré avec succès:', registration);
            })
            .catch((error) => {
                console.log('Enregistrement du Service Worker échoué:', error);
            });
    });

}

// Cacher les ressources et permettre de fonctionner hors ligne
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open('pokemons-cache-v1').then((cache) => {
            return cache.addAll([
                '/',
                'public/index.html',
                'public/listePokemons.html',
                'icons/icon-192x192.png',
                'icons/icon-512x512.png',
                'icons/client.png',
                'https://unpkg.com/leaflet/dist/leaflet.css',
                'https://unpkg.com/leaflet/dist/leaflet.js',
                'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css'
            ]);
        })
    );
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker activé');
    // Suppression des caches obsolètes
    const cacheWhitelist = ['mon-cache-v1'];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});


self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            // Si la réponse est dans le cache, la retourner
            if (cachedResponse) {
                return cachedResponse;
            }
            // Sinon, effectuer la requête réseau
            return fetch(event.request).then((networkResponse) => {
                return caches.open('mon-cache-v1').then((cache) => {
                    // Ajouter la réponse au cache pour les futures requêtes
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
            });
        })
    );
});
