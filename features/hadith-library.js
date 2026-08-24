(function() {
  const CDN = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/';

  const REMOTE_COLLECTIONS = [
    { id:'abudawud', name: 'Sunan Abi Dawud', desc: 'One of the Kutub al-Sittah, compiled by Abu Dawud al-Sijistani (d. 889 CE)' },
    { id:'tirmidhi', name: 'Jami at-Tirmidhi', desc: 'One of the Kutub al-Sittah, compiled by at-Tirmidhi (d. 892 CE)' },
    { id:'nasai', name: "Sunan an-Nasa'i", desc: 'One of the Kutub al-Sittah, compiled by an-Nasa\u2019i (d. 915 CE)' },
    { id:'ibnmajah', name: 'Sunan Ibn Majah', desc: 'One of the Kutub al-Sittah, compiled by Ibn Majah (d. 887 CE)' },
    { id:'malik', name: 'Muwatta Imam Malik', desc: 'The earliest written collection of hadith, by Malik ibn Anas (d. 795 CE)' },
    { id:'qudsi', name: 'Forty Hadith Qudsi', desc: 'Forty narrations in which the Prophet \uFDFA transmits meanings from Allah directly' }
  ];

  const BUNDLED_IDS = ['bukhari', 'muslim'];
  const _pending = {};

  function fetchJSON(url) {
    return fetch(url).then(r => {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    });
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
      if (cached) return cached;
      return Promise.all([
        fetchJSON(CDN + 'eng-' + id + '.min.json'),
        fetchJSON(CDN + 'ara-' + id + '.min.json').catch(() => null)
      ]).then(results => {
        const col = HadithNormalize.normalizeRemoteEdition(results[0], results[1], meta);
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
          h.a = map[h.b + ':' + h.h] != null ? map[h.b + ':' + h.h].replace(/<br\s*\/?>/gi, ' ').trim() : (map['a' + h.n] != null ? map['a' + h.n].replace(/<br\s*\/?>/gi, ' ').trim() : null);
        });
      });
      col._arabicBackfilled = true;
      return col;
    }).catch(() => col);
  }

  window.HadithLibrary = { REMOTE_COLLECTIONS, ensureHadithCollection, ensureBundledArabic };
})();
