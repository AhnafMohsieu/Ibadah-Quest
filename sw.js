// ═══════════════════════════════════════════════════════
// SERVICE WORKER — Network-first for HTML, stale-while-revalidate for assets
// Cache versioning: bump CACHE_NAME to force a full purge.
// ═══════════════════════════════════════════════════════
(function() {
  const CACHE_NAME = 'iq-cache-v13';

  function cacheKey(urlString) {
    const url = new URL(urlString, self.location.href);
    return url.pathname + url.search;
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

  if (typeof self === 'undefined' || typeof self.addEventListener !== 'function') return;

  self.swHelpers = { cacheKey, shouldCache, isSameOrigin, isCoreCache };

  self.addEventListener('install', (event) => {
    self.skipWaiting();
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

    const isNavigation = req.mode === 'navigate';
    const isJS = req.url.endsWith('.js') || req.url.includes('.js?');
    const isCSS = req.url.endsWith('.css') || req.url.includes('.css?');

    event.respondWith((async () => {
      const key = cacheKey(req.url);
      const cache = await caches.open(CACHE_NAME);

      // HTML / navigation: NETWORK FIRST
      if (isNavigation) {
        try {
          const fresh = await fetch(req);
          if (fresh && fresh.ok) {
            cache.put(key, fresh.clone()).catch(() => {});
          }
          return fresh;
        } catch (e) {
          const cached = await cache.match(key);
          if (cached) return cached;
          return Response.error();
        }
      }

      // JS/CSS: NETWORK FIRST (prevents stale code)
      if (isJS || isCSS) {
        try {
          const fresh = await fetch(req);
          if (fresh && fresh.ok) {
            cache.put(key, fresh.clone()).catch(() => {});
          }
          return fresh;
        } catch (e) {
          const cached = await cache.match(key);
          if (cached) return cached;
          return Response.error();
        }
      }

      // Other assets: stale-while-revalidate
      const cached = await cache.match(key);
      if (cached) {
        fetch(req).then(fresh => {
          if (fresh && fresh.ok) cache.put(key, fresh.clone()).catch(() => {});
        }).catch(() => {});
        return cached;
      }

      let fresh;
      try { fresh = await fetch(req); } catch (e) { fresh = undefined; }
      try { if (fresh && fresh.ok) cache.put(key, fresh.clone()); } catch (e) {}
      if (fresh) return fresh;

      return Response.error();
    })());
  });

  self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
  });
})();
