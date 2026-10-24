// Service worker de Barrio en Venta: la app funciona sin conexión y cada apertura
// pide la página nueva a la red, así que las actualizaciones llegan solas.
const CACHE = 'barrio-en-venta-v2';
const SHELL = ['./', 'manifest.webmanifest', 'icon-192.png', 'icon.svg', 'art/city-atlas-v2.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== location.origin || url.pathname.includes('/api/'))
    return;
  // version.json nunca se guarda: es lo que usa la app para saber si hay versión nueva.
  if (url.pathname.endsWith('version.json')) return;
  const network = () =>
    fetch(request).then((response) => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(request, copy));
      }
      return response;
    });
  // Página: primero la red (versión nueva), si no hay conexión la guardada.
  if (request.mode === 'navigate') {
    event.respondWith(
      network().catch(() =>
        caches
          .match('./', { ignoreVary: true })
          .then((r) => r || caches.match(request, { ignoreVary: true })),
      ),
    );
    return;
  }
  // Recursos con huella en el nombre (assets/) o arte: primero la caché.
  event.respondWith(
    caches.match(request, { ignoreVary: true }).then((cached) => cached || network()),
  );
});
