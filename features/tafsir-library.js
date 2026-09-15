(function() {
  const QURAN_API_BASE = 'https://api.quran.com/api/v4/tafsirs/';
  const EDITIONS = [
    { id: 'ibnkathir', name: 'Ibn Kathir', lang: 'en', dir: 'ltr', apiId: 169 }
  ];

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

  function getTafsir(editionId, surah, ayah) {
    const key = surah + ':' + ayah;
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
