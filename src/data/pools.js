// src/data/pools.js
// Legacy pools are bare-const classic scripts (no ESM exports, no window.* publish):
// a browser dynamic import() would parse them as modules and yield an empty
// namespace. So load them the way legacy core/content.js does — inject a classic
// <script> tag once per pool (same-origin, SW-cacheable, offline-safe) — and read
// the pools back as bare globals guarded by typeof, exactly like legacy consumers.
// Each pool URL uses the literal `new URL(..., import.meta.url)` form so Vite emits
// it as a hashed dist asset in the build while resolving relative to this module in dev.
const POOL_URLS = {
  'quran-verses': new URL('../../data/pools/quran-verses.js', import.meta.url).href,
  'hadiths': new URL('../../data/pools/hadiths.js', import.meta.url).href
};
const PENDING = {};
const LOADED = new Set();

function readPool(name) {
  if (name === 'quran-verses') return typeof QURAN_POOL !== 'undefined' ? QURAN_POOL : null;
  if (name === 'hadiths') return typeof HADITHS !== 'undefined' ? HADITHS : null;
  return null;
}

export function poolURL(name) {
  if (!POOL_URLS[name]) throw new Error('unknown pool: ' + name);
  return POOL_URLS[name];
}

export function loadPool(name) {
  if (!POOL_URLS[name]) return Promise.reject(new Error('unknown pool: ' + name));
  if (typeof document === 'undefined') return Promise.reject(new Error('pools require a browser DOM: ' + name));
  const url = POOL_URLS[name];
  if (LOADED.has(url)) return Promise.resolve(readPool(name));
  if (!PENDING[url]) {
    PENDING[url] = new Promise((resolve, reject) => {
      const el = document.createElement('script');
      el.src = url;
      el.onload = () => {
        LOADED.add(url);
        delete PENDING[url];
        const data = readPool(name);
        if (data === null) reject(new Error('pool loaded but global missing: ' + name));
        else resolve(data);
      };
      el.onerror = () => {
        delete PENDING[url];
        reject(new Error('pool failed to load: ' + name));
      };
      document.head.appendChild(el);
    });
  }
  return PENDING[url];
}
