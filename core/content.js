// core/content.js — Content pool refresh and lazy loading
(function() {
  const _loadedScripts = new Set();
  const _loadingScripts = {};
  function loadScript(srcUrl) {
    if (_loadedScripts.has(srcUrl)) return Promise.resolve();
    if (_loadingScripts[srcUrl]) return _loadingScripts[srcUrl];
    _loadingScripts[srcUrl] = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = srcUrl + '?v=3';
      s.onload = () => { _loadedScripts.add(srcUrl); delete _loadingScripts[srcUrl]; resolve(); };
      s.onerror = () => { delete _loadingScripts[srcUrl]; console.warn('Failed to load ' + srcUrl); reject(new Error(srcUrl)); };
      document.head.appendChild(s);
    });
    return _loadingScripts[srcUrl];
  }
  function ensureQuranLoaded() { return loadScript('data/pools/quran-verses.js').then(() => { if (window.invalidateSearchIndex) window.invalidateSearchIndex(); }); }
  function ensureHadithLoaded() {
    return Promise.all([
      loadScript('data/pools/hadiths.js'),
      loadScript('data/hadith-collections.js')
    ]).then(() => { if (window.invalidateSearchIndex) window.invalidateSearchIndex(); });
  }
  function _getNewPools() {
    try { if (typeof NEW_POOLS !== 'undefined' && NEW_POOLS) return NEW_POOLS; } catch(e){}
    try { if (typeof window !== 'undefined' && window.NEW_POOLS) return window.NEW_POOLS; } catch(e){}
    return null;
  }
  function refreshContent() {
    const t = today(); const isNewDay = (S.contentDate !== t); const rng = (len) => fastRng(len);
    const pools = [
      ['duaIdx', (typeof DUA_POOL !== 'undefined' ? DUA_POOL : null)],['quranIdx', (typeof QURAN_POOL !== 'undefined' ? QURAN_POOL : null)],['sunnahIdx', (typeof SUNNAH_POOL !== 'undefined' ? SUNNAH_POOL : null)],['dhikrIdx', (typeof DHIKR_POOL !== 'undefined' ? DHIKR_POOL : null)],
      ['storiesIdx', (typeof STORIES !== 'undefined' ? STORIES : null)],['hadithIdx', (typeof HADITHS !== 'undefined' ? HADITHS : null)],['namesIdx', (typeof NAMES !== 'undefined' ? NAMES : null)],['sinsIdx', (typeof SINS_POOL !== 'undefined' ? SINS_POOL : null)],
      ['punishmentsIdx', (typeof PUNISHMENTS_POOL !== 'undefined' ? PUNISHMENTS_POOL : null)],['repentanceIdx', (typeof REPENTANCE_POOL !== 'undefined' ? REPENTANCE_POOL : null)],['sahabaIdx', (typeof SAHABA_POOL !== 'undefined' ? SAHABA_POOL : null)],
      ['seerahIdx', (typeof SEERAH_POOL !== 'undefined' ? SEERAH_POOL : null)],['tafsirIdx', (typeof TAFSIR_POOL !== 'undefined' ? TAFSIR_POOL : null)],['mannersIdx', (typeof MANNERS_POOL !== 'undefined' ? MANNERS_POOL : null)],
      ['inspireIdx', (typeof INSPIRATIONS_POOL !== 'undefined' ? INSPIRATIONS_POOL : null)],['aqeedahIdx', (typeof AQEEDAH_POOL !== 'undefined' ? AQEEDAH_POOL : null)],['familyIdx', (typeof FAMILY_POOL !== 'undefined' ? FAMILY_POOL : null)],
      ['healthIdx', (typeof HEALTH_POOL !== 'undefined' ? HEALTH_POOL : null)],['financeIdx', (typeof FINANCE_POOL !== 'undefined' ? FINANCE_POOL : null)],['ummahIdx', (typeof UMMAH_POOL !== 'undefined' ? UMMAH_POOL : null)],
      ['hajjIdx', (typeof HAJJ_POOL !== 'undefined' ? HAJJ_POOL : null)],['akhirahIdx', (typeof AKHIRAH_POOL !== 'undefined' ? AKHIRAH_POOL : null)],['prophetsIdx', (typeof PROPHETS_POOL !== 'undefined' ? PROPHETS_POOL : null)],
      ['womenIdx', (typeof WOMEN_POOL !== 'undefined' ? WOMEN_POOL : null)],['knowledgeIdx', (typeof KNOWLEDGE_POOL !== 'undefined' ? KNOWLEDGE_POOL : null)],['heartIdx', (typeof HEART_POOL !== 'undefined' ? HEART_POOL : null)],
      ['jumuahIdx', (typeof JUMUAH_POOL !== 'undefined' ? JUMUAH_POOL : null)],['marriageIdx', (typeof MARRIAGE_POOL !== 'undefined' ? MARRIAGE_POOL : null)],['scienceIdx', (typeof SCIENCE_POOL !== 'undefined' ? SCIENCE_POOL : null)],
      ['wuduIdx', (typeof WUDU_POOL !== 'undefined' ? WUDU_POOL : null)],['scholarsIdx', (typeof SCHOLARS_POOL !== 'undefined' ? SCHOLARS_POOL : null)],['patienceIdx', (typeof PATIENCE_POOL !== 'undefined' ? PATIENCE_POOL : null)],
      ['workIdx', (typeof WORK_POOL !== 'undefined' ? WORK_POOL : null)],['communityIdx', (typeof COMMUNITY_POOL !== 'undefined' ? COMMUNITY_POOL : null)],['environmentIdx', (typeof ENVIRONMENT_POOL !== 'undefined' ? ENVIRONMENT_POOL : null)],
      ['travelIdx', (typeof TRAVEL_POOL !== 'undefined' ? TRAVEL_POOL : null)],['fiqhIdx', (typeof FIQH_POOL !== 'undefined' ? FIQH_POOL : null)],['arabicIdx', (typeof ARABIC_POOL !== 'undefined' ? ARABIC_POOL : null)],
      ['tawakkulIdx', (typeof TAWAKKUL_POOL !== 'undefined' ? TAWAKKUL_POOL : null)],['ikhlasIdx', (typeof IKHLAS_POOL !== 'undefined' ? IKHLAS_POOL : null)],['zuhdIdx', (typeof ZUHD_POOL !== 'undefined' ? ZUHD_POOL : null)],
      ['dawahIdx', (typeof DAWAH_POOL !== 'undefined' ? DAWAH_POOL : null)],['civilisationIdx', (typeof CIVILISATION_POOL !== 'undefined' ? CIVILISATION_POOL : null)],['battlesIdx', (typeof BATTLES_POOL !== 'undefined' ? BATTLES_POOL : null)],
      ['jannahIdx', (typeof JANNAH_POOL !== 'undefined' ? JANNAH_POOL : null)],['jahannamIdx', (typeof JAHANNAM_POOL !== 'undefined' ? JAHANNAM_POOL : null)],['graveIdx', (typeof GRAVE_POOL !== 'undefined' ? GRAVE_POOL : null)],
      ['signsIdx', (typeof SIGNS_POOL !== 'undefined' ? SIGNS_POOL : null)],['dreamsIdx', (typeof DREAMS_POOL !== 'undefined' ? DREAMS_POOL : null)],['parentingIdx', (typeof PARENTING_POOL !== 'undefined' ? PARENTING_POOL : null)],
      ['foodIdx', (typeof FOOD_POOL !== 'undefined' ? FOOD_POOL : null)],['tibbIdx', (typeof TIBB_POOL !== 'undefined' ? TIBB_POOL : null)],['youthIdx', (typeof YOUTH_POOL !== 'undefined' ? YOUTH_POOL : null)],['techIdx', (typeof TECH_POOL !== 'undefined' ? TECH_POOL : null)],
      ['neighborsIdx', (typeof NEIGHBORS_POOL !== 'undefined' ? NEIGHBORS_POOL : null)]
    ].concat((function(){ var np=_getNewPools(); return np ? Object.keys(np).map(k => [k + "Idx", np[k]]) : []; })());
    for (const [key,pool] of pools) { if (isNewDay || !S[key]?.length) S[key] = rng((pool||[]).length); }
    S.contentDate = t;
  }
  function manualRefreshContent() {
    const rng = (len) => fastRng(len);
    var _np = _getNewPools();
    const keys = ['duaIdx','quranIdx','sunnahIdx','dhikrIdx','storiesIdx','hadithIdx','namesIdx','sinsIdx','punishmentsIdx','repentanceIdx','sahabaIdx','seerahIdx','tafsirIdx','mannersIdx','inspireIdx','aqeedahIdx','familyIdx','healthIdx','financeIdx','ummahIdx','hajjIdx','akhirahIdx','prophetsIdx','womenIdx','knowledgeIdx','heartIdx','jumuahIdx','marriageIdx','scienceIdx','wuduIdx','scholarsIdx','patienceIdx','workIdx','communityIdx','environmentIdx','travelIdx','fiqhIdx','arabicIdx','tawakkulIdx','ikhlasIdx','zuhdIdx','dawahIdx','civilisationIdx','battlesIdx','jannahIdx','jahannamIdx','graveIdx','signsIdx','dreamsIdx','parentingIdx','foodIdx','tibbIdx','youthIdx','techIdx','neighborsIdx'].concat(_np ? Object.keys(_np).map(k => k + "Idx") : []);
    const allPools = [(typeof DUA_POOL !== 'undefined' ? DUA_POOL : null),(typeof QURAN_POOL !== 'undefined' ? QURAN_POOL : null),(typeof SUNNAH_POOL !== 'undefined' ? SUNNAH_POOL : null),(typeof DHIKR_POOL !== 'undefined' ? DHIKR_POOL : null),(typeof STORIES !== 'undefined' ? STORIES : null),(typeof HADITHS !== 'undefined' ? HADITHS : null),(typeof NAMES !== 'undefined' ? NAMES : null),(typeof SINS_POOL !== 'undefined' ? SINS_POOL : null),(typeof PUNISHMENTS_POOL !== 'undefined' ? PUNISHMENTS_POOL : null),(typeof REPENTANCE_POOL !== 'undefined' ? REPENTANCE_POOL : null),(typeof SAHABA_POOL !== 'undefined' ? SAHABA_POOL : null),(typeof SEERAH_POOL !== 'undefined' ? SEERAH_POOL : null),(typeof TAFSIR_POOL !== 'undefined' ? TAFSIR_POOL : null),(typeof MANNERS_POOL !== 'undefined' ? MANNERS_POOL : null),(typeof INSPIRATIONS_POOL !== 'undefined' ? INSPIRATIONS_POOL : null),(typeof AQEEDAH_POOL !== 'undefined' ? AQEEDAH_POOL : null),(typeof FAMILY_POOL !== 'undefined' ? FAMILY_POOL : null),(typeof HEALTH_POOL !== 'undefined' ? HEALTH_POOL : null),(typeof FINANCE_POOL !== 'undefined' ? FINANCE_POOL : null),(typeof UMMAH_POOL !== 'undefined' ? UMMAH_POOL : null),(typeof HAJJ_POOL !== 'undefined' ? HAJJ_POOL : null),(typeof AKHIRAH_POOL !== 'undefined' ? AKHIRAH_POOL : null),(typeof PROPHETS_POOL !== 'undefined' ? PROPHETS_POOL : null),(typeof WOMEN_POOL !== 'undefined' ? WOMEN_POOL : null),(typeof KNOWLEDGE_POOL !== 'undefined' ? KNOWLEDGE_POOL : null),(typeof HEART_POOL !== 'undefined' ? HEART_POOL : null),(typeof JUMUAH_POOL !== 'undefined' ? JUMUAH_POOL : null),(typeof MARRIAGE_POOL !== 'undefined' ? MARRIAGE_POOL : null),(typeof SCIENCE_POOL !== 'undefined' ? SCIENCE_POOL : null),(typeof WUDU_POOL !== 'undefined' ? WUDU_POOL : null),(typeof SCHOLARS_POOL !== 'undefined' ? SCHOLARS_POOL : null),(typeof PATIENCE_POOL !== 'undefined' ? PATIENCE_POOL : null),(typeof WORK_POOL !== 'undefined' ? WORK_POOL : null),(typeof COMMUNITY_POOL !== 'undefined' ? COMMUNITY_POOL : null),(typeof ENVIRONMENT_POOL !== 'undefined' ? ENVIRONMENT_POOL : null),(typeof TRAVEL_POOL !== 'undefined' ? TRAVEL_POOL : null),(typeof FIQH_POOL !== 'undefined' ? FIQH_POOL : null),(typeof ARABIC_POOL !== 'undefined' ? ARABIC_POOL : null),(typeof TAWAKKUL_POOL !== 'undefined' ? TAWAKKUL_POOL : null),(typeof IKHLAS_POOL !== 'undefined' ? IKHLAS_POOL : null),(typeof ZUHD_POOL !== 'undefined' ? ZUHD_POOL : null),(typeof DAWAH_POOL !== 'undefined' ? DAWAH_POOL : null),(typeof CIVILISATION_POOL !== 'undefined' ? CIVILISATION_POOL : null),(typeof BATTLES_POOL !== 'undefined' ? BATTLES_POOL : null),(typeof JANNAH_POOL !== 'undefined' ? JANNAH_POOL : null),(typeof JAHANNAM_POOL !== 'undefined' ? JAHANNAM_POOL : null),(typeof GRAVE_POOL !== 'undefined' ? GRAVE_POOL : null),(typeof SIGNS_POOL !== 'undefined' ? SIGNS_POOL : null),(typeof DREAMS_POOL !== 'undefined' ? DREAMS_POOL : null),(typeof PARENTING_POOL !== 'undefined' ? PARENTING_POOL : null),(typeof FOOD_POOL !== 'undefined' ? FOOD_POOL : null),(typeof TIBB_POOL !== 'undefined' ? TIBB_POOL : null),(typeof YOUTH_POOL !== 'undefined' ? YOUTH_POOL : null),(typeof TECH_POOL !== 'undefined' ? TECH_POOL : null),(typeof NEIGHBORS_POOL !== 'undefined' ? NEIGHBORS_POOL : null)].concat(_np ? Object.keys(_np).map(k => _np[k]) : []);
    keys.forEach((k,i) => { S[k] = rng(allPools[i]?.length||5); });
    saveState(); renderAll(); toast(iqIcon('refresh-cw'),'Content refreshed!',false,1500);
  }

  window.ensureQuranLoaded = ensureQuranLoaded;
  window.ensureHadithLoaded = ensureHadithLoaded;
  window.refreshContent = refreshContent;
  window.manualRefreshContent = manualRefreshContent;
})();
