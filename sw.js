// ═══════════════════════════════════════════════════════
// SERVICE WORKER — Offline-first, stale-while-revalidate
// Cache versioning: bump CACHE_NAME to force a full purge.
// ═══════════════════════════════════════════════════════
(function() {
  const CACHE_NAME = 'iq-cache-v3';
  const CORE = ['/', 'index.html', 'styles/main.css'];

  // Pure helpers — exposed for tests and kept side-effect free.
  function cacheKey(urlString) {
    return new URL(urlString, self.location.href).pathname;
  }
  function shouldCache(request) {
    if (!request || request.method !== 'GET') return false;
    const p = new URL(request.url, self.location.href).protocol;
    return p === 'http:' || p === 'https:';
  }
  function isSameOrigin(urlString) {
    return new URL(urlString, self.location.href).origin === self.location.origin;
  }
  function isCoreCache(name) {
    return typeof name === 'string' && name.indexOf('iq-cache-') === 0;
  }

  async function revalidate(request) {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(cacheKey(request.url));
    try {
      const fresh = await fetch(request);
      if (fresh && fresh.ok) cache.put(cacheKey(request.url), fresh.clone());
      return fresh;
    } catch (e) {
      return cached;
    }
  }

  if (typeof self === 'undefined' || typeof self.addEventListener !== 'function') return;

  self.swHelpers = { cacheKey, shouldCache, isSameOrigin, isCoreCache };

  self.addEventListener('install', (event) => {
    event.waitUntil((async () => {
      const cache = await caches.open(CACHE_NAME);
      await Promise.all(CORE.map((p) => cache.add(p)));
    })());
  });

  self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
      const keys = await caches.keys();
      await Promise.all(keys
        .filter((k) => isCoreCache(k) && k !== CACHE_NAME)
        .map((k) => caches.delete(k)));
      await self.clients.claim();
    })());
  });

  self.addEventListener('fetch', (event) => {
    const req = event.request;
    if (!shouldCache(req) || !isSameOrigin(req.url)) return;
    event.respondWith((async () => {
      const key = cacheKey(req.url);
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(key);
      if (cached) {
        revalidate(req).catch(() => {});
        return cached;
      }
      let fresh;
      try { fresh = await fetch(req); } catch (e) { fresh = undefined; }
      try { if (fresh && fresh.ok) cache.put(key, fresh.clone()); } catch (e) {}
      if (fresh) return fresh;
      if (req.mode === 'navigate') {
        const shell = await caches.match('/');
        if (shell) return shell;
      }
      return Response.error();
    })());
  });

  self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
  });
})();