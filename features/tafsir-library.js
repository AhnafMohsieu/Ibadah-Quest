(function() {
  const QURAN_API = 'https://api.quran.com/api/v4/tafsirs/169/by_ayah/';
  const JALALAYN_URL = 'https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1/editions/ara-jalaladdinalmah.json';
  const EDITIONS = [
    { id: 'ibnkathir', name: 'Ibn Kathir', lang: 'en', dir: 'ltr' },
    { id: 'jalalayn', name: 'Tafsir al-Jalalayn', lang: 'ar', dir: 'rtl' }
  ];
  let _jalalaynData = null;
  let _jalalaynPromise = null;

  function sanitizeRichText(html) {
    return String(html || '')
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/\son[a-z]+\s*=\s*"[^"]*"/gi, '')
      .replace(/\son[a-z]+\s*=\s*'[^']*'/gi, '')
      .replace(/javascript:/gi, '');
  }

  function fetchJSON(url) {
    return fetch(url).then(r => {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    });
  }

  function _jalalaynIndex(surah, ayah) {
    if (typeof QURAN_SURAHS === 'undefined' || !Array.isArray(QURAN_SURAHS)) return null;
    let cum = 0;
    for (let i = 0; i < surah - 1; i++) cum += QURAN_SURAHS[i].ay;
    return cum + ayah - 1;
  }

  function loadJalalayn() {
    if (_jalalaynData) return Promise.resolve(_jalalaynData);
    if (_jalalaynPromise) return _jalalaynPromise;
    const p = _jalalaynPromise = ContentCache.get('taf-jalalayn-ar').then(cached => {
      if (cached) { _jalalaynData = cached; return _jalalaynData; }
      return fetchJSON(JALALAYN_URL).then(j => {
        const arr = j && j.quran;
        if (!Array.isArray(arr)) throw new Error('Bad edition');
        _jalalaynData = arr;
        return ContentCache.put('taf-jalalayn-ar', arr).then(() => arr);
      });
    });
    p.then(() => { _jalalaynPromise = null; }, () => { _jalalaynPromise = null; });
    return p;
  }

  function getTafsir(editionId, surah, ayah) {
    const key = surah + ':' + ayah;
    if (editionId === 'ibnkathir') {
      return ContentCache.get('taf-ibnkathir-' + key).then(cached => {
        if (cached) return { text: cached, lang: 'en', dir: 'ltr' };
        return fetchJSON(QURAN_API + key).then(j => {
          const text = j && j.tafsir && j.tafsir.text;
          if (!text) throw new Error('No tafsir');
          return ContentCache.put('taf-ibnkathir-' + key, text).then(() => ({ text: text, lang: 'en', dir: 'ltr' }));
        });
      });
    }
    if (editionId === 'jalalayn') {
      return loadJalalayn().then(arr => {
        const idx = _jalalaynIndex(surah, ayah);
        const item = (idx != null && idx >= 0) ? arr[idx] : null;
        if (!item || !item.text) throw new Error('No tafsir');
        return { text: item.text, lang: 'ar', dir: 'rtl' };
      });
    }
    return Promise.reject(new Error('Unknown edition'));
  }

  window.TafsirLibrary = { EDITIONS: EDITIONS, getTafsir: getTafsir, sanitizeRichText: sanitizeRichText };
})();
