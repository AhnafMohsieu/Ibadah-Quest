(function() {
  const QURAN_API_BASE = 'https://api.quran.com/api/v4/tafsirs/';
  const JALALAYN_URL = 'https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1/editions/ara-jalaladdinalmah.json';
  const EDITIONS = [
    { id: 'ibnkathir', name: 'Ibn Kathir', lang: 'en', dir: 'ltr', apiId: 169 },
    { id: 'jalalayn', name: 'Tafsir al-Jalalayn', lang: 'ar', dir: 'rtl', apiId: 10 },
    { id: 'saadi', name: 'Saadi (English)', lang: 'en', dir: 'ltr', apiId: 19 },
    { id: 'maududi', name: 'Maududi (English)', lang: 'en', dir: 'ltr', apiId: 156 },
    { id: 'asad', name: 'Muhammad Asad', lang: 'en', dir: 'ltr', apiId: 20 }
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
    var ctl = null, timer = null;
    try {
      if (typeof AbortController !== 'undefined') {
        ctl = new AbortController();
        timer = setTimeout(function() { try { ctl.abort(); } catch (e) {} }, 12000);
      }
    } catch (e) {}
    var req = ctl ? fetch(url, { signal: ctl.signal }) : fetch(url);
    function done() { if (timer) { try { clearTimeout(timer); } catch (e) {} } }
    return req.then(function(r) {
      done();
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }, function(err) { done(); throw err; });
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
    if (editionId === 'jalalayn') {
      return loadJalalayn().then(arr => {
        const idx = _jalalaynIndex(surah, ayah);
        const item = (idx != null && idx >= 0) ? arr[idx] : null;
        if (!item || !item.text) throw new Error('No tafsir');
        return { text: item.text, lang: 'ar', dir: 'rtl' };
      });
    }
    const ed = EDITIONS.find(e => e.id === editionId && e.apiId);
    if (!ed) return Promise.reject(new Error('Unknown edition'));
    const url = QURAN_API_BASE + ed.apiId + '/by_ayah/' + key;
    return ContentCache.get('taf-' + editionId + '-' + key).then(cached => {
      if (cached) return { text: cached, lang: ed.lang, dir: ed.dir };
      return fetchJSON(url).then(j => {
        const text = j && j.tafsir && j.tafsir.text;
        if (!text) throw new Error('No tafsir');
        return ContentCache.put('taf-' + editionId + '-' + key, text).then(() => ({ text: text, lang: ed.lang, dir: ed.dir }));
      });
    });
  }

  window.TafsirLibrary = { EDITIONS: EDITIONS, getTafsir: getTafsir, sanitizeRichText: sanitizeRichText };
})();
