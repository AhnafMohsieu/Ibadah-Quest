// core/content.js — Content pool refresh and lazy loading
(function() {
  const _loadedScripts = new Set();
  function loadScript(srcUrl) {
    return new Promise((resolve, reject) => {
      if (_loadedScripts.has(srcUrl)) { resolve(); return; }
      const s = document.createElement('script');
      s.src = srcUrl + '?v=3';
      s.onload = () => { _loadedScripts.add(srcUrl); resolve(); };
      s.onerror = () => { console.warn('Failed to load ' + srcUrl); reject(new Error(srcUrl)); };
      document.head.appendChild(s);
    });
  }
  function ensureQuranLoaded() { return loadScript('data/pools/quran-verses.js').then(() => { if (window.invalidateSearchIndex) window.invalidateSearchIndex(); }); }
  function ensureHadithLoaded() {
    return Promise.all([
      loadScript('data/pools/hadiths.js'),
      loadScript('data/hadith-collections.js')
    ]).then(() => { if (window.invalidateSearchIndex) window.invalidateSearchIndex(); });
  }
  function refreshContent() {
    const t = today(); const isNewDay = (S.contentDate !== t); const rng = (len) => fastRng(len);
    const pools = [
      ['duaIdx',DUA_POOL],['quranIdx', (typeof QURAN_POOL !== 'undefined') ? QURAN_POOL : null],['sunnahIdx',SUNNAH_POOL],['dhikrIdx',DHIKR_POOL],
      ['storiesIdx',STORIES],['hadithIdx', (typeof HADITHS !== 'undefined') ? HADITHS : null],['namesIdx',NAMES],['sinsIdx',SINS_POOL],
      ['punishmentsIdx',PUNISHMENTS_POOL],['repentanceIdx',REPENTANCE_POOL],['sahabaIdx',SAHABA_POOL],
      ['seerahIdx',SEERAH_POOL],['tafsirIdx',TAFSIR_POOL],['mannersIdx',MANNERS_POOL],
      ['inspireIdx',INSPIRATIONS_POOL],['aqeedahIdx',AQEEDAH_POOL],['familyIdx',FAMILY_POOL],
      ['healthIdx',HEALTH_POOL],['financeIdx',FINANCE_POOL],['ummahIdx',UMMAH_POOL],
      ['hajjIdx',HAJJ_POOL],['akhirahIdx',AKHIRAH_POOL],['prophetsIdx',PROPHETS_POOL],
      ['womenIdx',WOMEN_POOL],['knowledgeIdx',KNOWLEDGE_POOL],['heartIdx',HEART_POOL],
      ['jumuahIdx',JUMUAH_POOL],['marriageIdx',MARRIAGE_POOL],['scienceIdx',SCIENCE_POOL],
      ['wuduIdx',WUDU_POOL],['scholarsIdx',SCHOLARS_POOL],['patienceIdx',PATIENCE_POOL],
      ['workIdx',WORK_POOL],['communityIdx',COMMUNITY_POOL],['environmentIdx',ENVIRONMENT_POOL],
      ['travelIdx',TRAVEL_POOL],['fiqhIdx',FIQH_POOL],['arabicIdx',ARABIC_POOL],
      ['tawakkulIdx',TAWAKKUL_POOL],['ikhlasIdx',IKHLAS_POOL],['zuhdIdx',ZUHD_POOL],
      ['dawahIdx',DAWAH_POOL],['civilisationIdx',CIVILISATION_POOL],['battlesIdx',BATTLES_POOL],
      ['jannahIdx',JANNAH_POOL],['jahannamIdx',JAHANNAM_POOL],['graveIdx',GRAVE_POOL],
      ['signsIdx',SIGNS_POOL],['dreamsIdx',DREAMS_POOL],['parentingIdx',PARENTING_POOL],
      ['foodIdx',FOOD_POOL],['tibbIdx',TIBB_POOL],['youthIdx',YOUTH_POOL],['techIdx',TECH_POOL],
      ['neighborsIdx',NEIGHBORS_POOL]
    ].concat(Object.keys(NEW_POOLS).map(k => [k + "Idx", NEW_POOLS[k]]));
    for (const [key,pool] of pools) { if (isNewDay || !S[key]?.length) S[key] = rng((pool||[]).length); }
    S.contentDate = t;
  }
  function manualRefreshContent() {
    const rng = (len) => fastRng(len);
    const keys = ['duaIdx','quranIdx','sunnahIdx','dhikrIdx','storiesIdx','hadithIdx','namesIdx','sinsIdx','punishmentsIdx','repentanceIdx','sahabaIdx','seerahIdx','tafsirIdx','mannersIdx','inspireIdx','aqeedahIdx','familyIdx','healthIdx','financeIdx','ummahIdx','hajjIdx','akhirahIdx','prophetsIdx','womenIdx','knowledgeIdx','heartIdx','jumuahIdx','marriageIdx','scienceIdx','wuduIdx','scholarsIdx','patienceIdx','workIdx','communityIdx','environmentIdx','travelIdx','fiqhIdx','arabicIdx','tawakkulIdx','ikhlasIdx','zuhdIdx','dawahIdx','civilisationIdx','battlesIdx','jannahIdx','jahannamIdx','graveIdx','signsIdx','dreamsIdx','parentingIdx','foodIdx','tibbIdx','youthIdx','techIdx','neighborsIdx'].concat(Object.keys(NEW_POOLS).map(k => k + "Idx"));
    const allPools = [DUA_POOL,(typeof QURAN_POOL !== 'undefined') ? QURAN_POOL : null,SUNNAH_POOL,DHIKR_POOL,STORIES,(typeof HADITHS !== 'undefined') ? HADITHS : null,NAMES,SINS_POOL,PUNISHMENTS_POOL,REPENTANCE_POOL,SAHABA_POOL,SEERAH_POOL,TAFSIR_POOL,MANNERS_POOL,INSPIRATIONS_POOL,AQEEDAH_POOL,FAMILY_POOL,HEALTH_POOL,FINANCE_POOL,UMMAH_POOL,HAJJ_POOL,AKHIRAH_POOL,PROPHETS_POOL,WOMEN_POOL,KNOWLEDGE_POOL,HEART_POOL,JUMUAH_POOL,MARRIAGE_POOL,SCIENCE_POOL,WUDU_POOL,SCHOLARS_POOL,PATIENCE_POOL,WORK_POOL,COMMUNITY_POOL,ENVIRONMENT_POOL,TRAVEL_POOL,FIQH_POOL,ARABIC_POOL,TAWAKKUL_POOL,IKHLAS_POOL,ZUHD_POOL,DAWAH_POOL,CIVILISATION_POOL,BATTLES_POOL,JANNAH_POOL,JAHANNAM_POOL,GRAVE_POOL,SIGNS_POOL,DREAMS_POOL,PARENTING_POOL,FOOD_POOL,TIBB_POOL,YOUTH_POOL,TECH_POOL,NEIGHBORS_POOL].concat(Object.keys(NEW_POOLS).map(k => NEW_POOLS[k]));
    keys.forEach((k,i) => { S[k] = rng(allPools[i]?.length||5); });
    saveState(); renderAll(); toast(iqIcon('refresh-cw'),'Content refreshed!',false,1500);
  }

  window.ensureQuranLoaded = ensureQuranLoaded;
  window.ensureHadithLoaded = ensureHadithLoaded;
  window.refreshContent = refreshContent;
  window.manualRefreshContent = manualRefreshContent;
})();
