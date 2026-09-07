// src/data/pools.js
export function loadPool(name) {
  if (name === 'quran-verses') return import('../../data/pools/quran-verses.js');
  if (name === 'hadiths') return import('../../data/pools/hadiths.js');
  return Promise.reject(new Error('unknown pool: ' + name));
}
