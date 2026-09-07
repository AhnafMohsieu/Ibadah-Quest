(function() {
  // Manifest-driven precache (precache-manifest.js is emitted by `vite build`).
  const CACHE_NAME = 'iq-cache-manifest';
  const CDN_CACHE = 'iq-cdn-v1';
  importScripts('./precache-manifest.js');
  self.addEventListener('install', (event) => {
    event.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(self.__PRECACHE)).then(() => self.skipWaiting()));
  });

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

  self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
      const keys = await caches.keys();
      await Promise.all(keys
        .filter((k) => (isCoreCache(k) && k !== CACHE_NAME) || k === CDN_CACHE)
        .map((k) => caches.delete(k)));
      await self.clients.claim();
    })());
  });

  self.addEventListener('fetch', (event) => {
    const req = event.request;
    if (!shouldCache(req)) return;

    const isNavigation = req.mode === 'navigate';
    const isJS = req.url.endsWith('.js') || req.url.includes('.js?');
    const isCSS = req.url.endsWith('.css') || req.url.includes('.css?');
    const isImage = /\.(png|jpg|jpeg|gif|svg|webp|ico)($|\?)/.test(req.url);
    const isData = req.url.includes('/data/') || req.url.includes('cdn.jsdelivr.net');

    event.respondWith((async () => {
      const key = cacheKey(req.url);
      const cache = await caches.open(CACHE_NAME);

      // CDN assets: separate cache, stale-while-revalidate
      if (!isSameOrigin(req.url)) {
        const cdnCache = await caches.open(CDN_CACHE);
        const cached = await cdnCache.match(req.url);
        if (cached) {
          fetch(req).then(fresh => {
            if (fresh && fresh.ok) cdnCache.put(req.url, fresh.clone()).catch(() => {});
          }).catch(() => {});
          return cached;
        }
        try {
          const fresh = await fetch(req);
          if (fresh && fresh.ok) cdnCache.put(req.url, fresh.clone()).catch(() => {});
          return fresh;
        } catch (e) {
          return new Response('', { status: 503, statusText: 'Offline' });
        }
      }

      // HTML / navigation: NETWORK FIRST with offline fallback
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
          const fallback = await cache.match('offline.html');
          return fallback || new Response('Offline', { status: 503 });
        }
      }

      // Static assets: CACHE FIRST (JS, CSS, images, data)
      if (isJS || isCSS || isImage || isData) {
        const cached = await cache.match(key);
        if (cached) {
          fetch(req).then(fresh => {
            if (fresh && fresh.ok) cache.put(key, fresh.clone()).catch(() => {});
          }).catch(() => {});
          return cached;
        }
        try {
          const fresh = await fetch(req);
          if (fresh && fresh.ok) cache.put(key, fresh.clone()).catch(() => {});
          return fresh;
        } catch (e) {
          return new Response('', { status: 503, statusText: 'Offline' });
        }
      }

      // Other: stale-while-revalidate
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
      return new Response('', { status: 503, statusText: 'Offline' });
    })());
  });

  self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
  });
})();
