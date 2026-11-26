/* features/hadith-library.js — On-demand Hadith loader & HTML-safe normalizer.
 * Eliminates the legacy DOMContentLoaded auto-fetch of 38MB+ JSON payloads; collections load only on user demand.
 */
(function() {
  const CDN = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/';

  const REMOTE_COLLECTIONS = [
    { id:'abudawud', name: 'Sunan Abi Dawud', desc: 'Compiled by Abu Dawud al-Sijistani (d. 889 CE) · On-demand download (fawazahmed0/hadith-api, Unlicense)' },
    { id:'tirmidhi', name: 'Jami at-Tirmidhi', desc: 'Compiled by Imam at-Tirmidhi (d. 892 CE) · On-demand download' },
    { id:'nasai', name: "Sunan an-Nasa'i", desc: "Compiled by Imam an-Nasa'i (d. 915 CE) · On-demand download" },
    { id:'ibnmajah', name: 'Sunan Ibn Majah', desc: 'Compiled by Ibn Majah (d. 887 CE) · On-demand download' },
    { id:'malik', name: 'Muwatta Imam Malik', desc: 'Earliest compiled fiqh & hadith collection by Malik ibn Anas (d. 795 CE)' },
    { id:'qudsi', name: 'Forty Hadith Qudsi', desc: 'Forty narrations transmitting sacred meanings conveyed by the Prophet \uFDFA' }
  ];

  const BUNDLED_IDS = ['bukhari', 'muslim', 'nawawi'];
  const _pending = {};

  function sanitizePlainText(val) {
    if (val == null) return '';
    return String(val)
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function sanitizeNormalizedCollection(col) {
    if (!col || typeof col !== 'object') return col;
    (col.books || []).forEach(function(bk) {
      (bk.hadiths || []).forEach(function(h) {
        if (!h) return;
        if (h.t != null) h.t = sanitizePlainText(h.t);
        if (h.a != null) h.a = sanitizePlainText(h.a);
      });
    });
    return col;
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

  function ensureHadithCollection(id) {
    if (BUNDLED_IDS.indexOf(id) !== -1) {
      const bundled = (typeof HADITH_COLLECTIONS_DATA !== 'undefined') ? HADITH_COLLECTIONS_DATA.find(c => c.id === id) : null;
      return Promise.resolve(bundled || null);
    }
    const meta = REMOTE_COLLECTIONS.find(c => c.id === id);
    if (!meta) return Promise.resolve(null);
    if (_pending[id]) return _pending[id];
    const p = _pending[id] = ContentCache.get('col-' + id).then(cached => {
      if (cached) return sanitizeNormalizedCollection(cached);
      return Promise.all([
        fetchJSON(CDN + 'eng-' + id + '.min.json'),
        fetchJSON(CDN + 'ara-' + id + '.min.json').catch(() => null)
      ]).then(results => {
        const col = sanitizeNormalizedCollection(HadithNormalize.normalizeRemoteEdition(results[0], results[1], meta));
        return ContentCache.put('col-' + id, col).then(() => col);
      });
    });
    p.then(() => { delete _pending[id]; }, () => { delete _pending[id]; });
    return p;
  }

  function ensureBundledArabic(id) {
    const col = (typeof HADITH_COLLECTIONS_DATA !== 'undefined') ? HADITH_COLLECTIONS_DATA.find(c => c.id === id) : null;
    if (!col) return Promise.resolve(null);
    if (col._arabicBackfilled) return Promise.resolve(col);
    return fetchJSON(CDN + 'ara-' + id + '.min.json').then(ara => {
      const map = {};
      ((ara && ara.hadiths) || []).forEach(h => {
        if (!h) return;
        const ref = h.reference || {};
        if (ref.book != null && ref.hadith != null) map[ref.book + ':' + ref.hadith] = h.text;
        if (h.arabicnumber != null) map['a' + h.arabicnumber] = h.text;
      });
      (col.books || []).forEach(bk => {
        (bk.hadiths || []).forEach(h => {
          var raw = map[h.b + ':' + h.h] != null ? map[h.b + ':' + h.h] : (map['a' + h.n] != null ? map['a' + h.n] : null);
          h.a = raw != null ? sanitizePlainText(raw) : null;
        });
      });
      col._arabicBackfilled = true;
      return col;
    }).catch(() => col);
  }

  function preloadRemoteCollections() {
    // Explicit user-invoked preload only (never fired automatically on boot)
    return Promise.all(REMOTE_COLLECTIONS.map(function(c) { return ensureHadithCollection(c.id).catch(() => null); }));
  }

  window.HadithLibrary = { REMOTE_COLLECTIONS, ensureHadithCollection, ensureBundledArabic, preloadRemoteCollections, sanitizePlainText };
})();
