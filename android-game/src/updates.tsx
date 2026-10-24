import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';

// Comprueba si hay una versión publicada más nueva (version.json, sin caché) al abrir la
// app, al volver a ella y cada 30 minutos. Nada más abrir se aplica sola; si aparece
// mientras se juega, se ofrece con un aviso para no recargar en mitad de una decisión.

const CHECK_EVERY = 30 * 60 * 1000;
const RELOADED_FOR = 'updated-to';

export function registerServiceWorker() {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    void navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`)
      .then(() => navigator.serviceWorker.ready)
      .then(async () => {
        // La primera visita se cargó antes de que existiera el service worker: guarda ya
        // el código y el arte usados para que la app abra también sin conexión.
        const urls = performance
          .getEntriesByType('resource')
          .map((entry) => entry.name)
          .filter(
            (url) =>
              url.startsWith(location.origin) &&
              !url.includes('/api/') &&
              !url.includes('version.json'),
          );
        const cache = await caches.open('barrio-en-venta-v2');
        await Promise.all(urls.map((url) => cache.add(url).catch(() => {})));
      })
      .catch(() => {});
  });
}

async function latestBuild() {
  const response = await fetch(`${import.meta.env.BASE_URL}version.json?t=${Date.now()}`, {
    cache: 'no-store',
  });
  if (!response.ok) return null;
  return ((await response.json()) as { build?: string }).build ?? null;
}

async function applyUpdate(build: string) {
  sessionStorage.setItem(RELOADED_FOR, build);
  const registration = await navigator.serviceWorker?.getRegistration();
  await registration?.update().catch(() => {});
  location.reload();
}

export function UpdateBanner() {
  const [available, setAvailable] = useState<string | null>(null);
  useEffect(() => {
    if (!import.meta.env.PROD) return;
    const opened = Date.now();
    let dead = false;
    const check = async () => {
      if (document.hidden) return;
      try {
        const build = await latestBuild();
        if (dead || !build || build === __BUILD_ID__) return;
        // Recién abierta: actualizar sin preguntar (una sola vez por versión).
        if (Date.now() - opened < 8000 && sessionStorage.getItem(RELOADED_FOR) !== build)
          return void applyUpdate(build);
        setAvailable(build);
      } catch {
        /* Sin conexión: se reintentará más tarde. */
      }
    };
    void check();
    const timer = setInterval(check, CHECK_EVERY);
    document.addEventListener('visibilitychange', check);
    return () => {
      dead = true;
      clearInterval(timer);
      document.removeEventListener('visibilitychange', check);
    };
  }, []);
  if (!available) return null;
  return (
    <div className="update-banner" role="status">
      <RefreshCw size={16} />
      <span>Hay una versión nueva del juego.</span>
      <button className="primary" onClick={() => void applyUpdate(available)}>
        Actualizar
      </button>
    </div>
  );
}
