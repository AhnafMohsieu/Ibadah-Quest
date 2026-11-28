// core/content.js — Content pool refresh and on-demand lazy loading
(function() {
  const _loadedScripts = new Set();
  const _loadingScripts = {};

  function loadScript(srcUrl) {
    if (_loadedScripts.has(srcUrl)) return Promise.resolve();
    if (_loadingScripts[srcUrl]) return _loadingScripts[srcUrl];
    if (typeof document !== 'undefined' && document.querySelectorAll) {
      const existing = Array.from(document.querySelectorAll('script[src]')).some(
        (el) => (el.getAttribute('src') || '').split('?')[0] === srcUrl
      );
      if (existing) {
        _loadedScripts.add(srcUrl);
        return Promise.resolve();
      }
    }
    _loadingScripts[srcUrl] = new Promise((resolve, reject) => {
      if (typeof document === 'undefined' || !document.head) {
        _loadedScripts.add(srcUrl);
        delete _loadingScripts[srcUrl];
        resolve();
        return;
      }
      const s = document.createElement('script');
      s.src = srcUrl + '?v=3';
      s.onload = () => {
        _loadedScripts.add(srcUrl);
        delete _loadingScripts[srcUrl];
        if (typeof window !== 'undefined' && typeof window.exposePoolGlobals === 'function') {
          window.exposePoolGlobals();
        }
        if (typeof window !== 'undefined' && typeof window.registerNewPoolRenderers === 'function') {
          window.registerNewPoolRenderers();
        }
        resolve();
      };
      s.onerror = () => {
        delete _loadingScripts[srcUrl];
        console.warn('Failed to load ' + srcUrl);
        reject(new Error(srcUrl));
      };
      document.head.appendChild(s);
    });
    return _loadingScripts[srcUrl];
  }

  // Lazy pool file map per tab ID (loaded on demand instead of upfront on index.html boot)
  const TAB_POOL_SCRIPTS = {
    wudu: ['data/pools/wudu.js'],
    jumuah: ['data/pools/jumuah.js'],
    tafsir: ['data/pools/tafsir.js'],
    aqeedah: ['data/pools/aqeedah.js'],
    fiqh: ['data/pools/fiqh.js'],
    'worship-rulings': ['data/pools/hajj.js', 'data/pools/new-pools.js'],
    'wealth-oaths': ['data/pools/new-pools.js'],
    virtues: ['data/pools/ikhlas.js', 'data/pools/tawakkul.js', 'data/pools/patience.js', 'data/pools/new-pools.js'],
    'vices-return': ['data/pools/heart.js', 'data/pools/sins.js', 'data/pools/repentance.js'],
    'character-path': ['data/pools/manners.js', 'data/pools/zuhd.js', 'data/pools/inspirations.js', 'data/pools/knowledge.js', 'data/pools/new-pools.js'],
    'family-life': ['data/pools/family.js', 'data/pools/marriage.js', 'data/pools/parenting.js'],
    community: ['data/pools/neighbors.js', 'data/pools/community.js', 'data/pools/ummah.js', 'data/pools/new-pools.js'],
    service: ['data/pools/new-pools.js'],
    wellness: ['data/pools/tibb.js', 'data/pools/new-pools.js'],
    seerah: ['data/pools/seerah.js'],
    stories: ['data/pools/stories.js'],
    akhirah: ['data/pools/akhirah.js'],
    jannah: ['data/pools/jannah.js'],
    jahannam: ['data/pools/jahannam.js'],
    grave: ['data/pools/grave.js'],
    signs: ['data/pools/signs.js'],
    allah_names: ['data/pools/names.js'],
    prophets: ['data/pools/prophets.js'],
    sahaba: ['data/pools/sahaba.js'],
    women: ['data/pools/women.js'],
    scholars_names: ['data/pools/scholars.js']
  };

  function ensurePoolsForTab(tabId) {
    const list = TAB_POOL_SCRIPTS[tabId];
    if (!list || !list.length) return Promise.resolve(false);
    return Promise.all(list.map(loadScript)).then(() => {
      if (typeof window !== 'undefined' && typeof window.exposePoolGlobals === 'function') {
        window.exposePoolGlobals();
      }
      if (typeof refreshContent === 'function' && typeof S !== 'undefined' && S) {
        try { refreshContent(); } catch (e) {}
      }
      return true;
    });
  }

  let _allSearchPoolsPromise = null;
  function ensureAllSearchPoolsLoaded() {
    if (_allSearchPoolsPromise) return _allSearchPoolsPromise;
    const unique = Array.from(new Set(Object.values(TAB_POOL_SCRIPTS).flat()));
    _allSearchPoolsPromise = Promise.all(unique.map((u) => loadScript(u).catch(() => null))).then(() => {
      if (typeof window !== 'undefined' && typeof window.exposePoolGlobals === 'function') {
        window.exposePoolGlobals();
      }
    });
    return _allSearchPoolsPromise;
  }

  function ensureQuranLoaded() {
    var reqs = [loadScript('data/pools/quran-verses.js')];
    try {
      if (typeof S !== 'undefined' && S) {
        if (S.quranScript === 'indopak') reqs.push(loadScript('data/pools/quran-indopak.js'));
        if (S.quranTranslation === 'bn' || S.quranTranslation === 'both' || S.lang === 'bn') {
          reqs.push(loadScript('data/pools/quran-bn.js'));
        }
      }
    } catch (e) {}
    return Promise.all(reqs);
  }
  function ensureQuranBanglaLoaded() {
    return loadScript('data/pools/quran-bn.js');
  }
  function ensureQuranIndoPakLoaded() {
    return loadScript('data/pools/quran-indopak.js');
  }
  function ensureHadithLoaded() {
    return Promise.all([
      loadScript('data/pools/hadiths.js'),
      loadScript('data/hadith-collections.js')
    ]).then(() => {
      if (typeof window !== 'undefined' && typeof window.exposePoolGlobals === 'function') {
        window.exposePoolGlobals();
      }
    });
  }
  function _getNewPools() {
    try { if (typeof NEW_POOLS !== 'undefined' && NEW_POOLS) return NEW_POOLS; } catch (e) {}
    try { if (typeof window !== 'undefined' && window.NEW_POOLS) return window.NEW_POOLS; } catch (e) {}
    return null;
  }
  function refreshContent() {
    const t = today();
    const isNewDay = (S.contentDate !== t);
    const rng = (len) => fastRng(len);
    const pools = [
      ['duaIdx', (typeof DUA_POOL !== 'undefined' ? DUA_POOL : null)],
      ['quranIdx', (typeof QURAN_POOL !== 'undefined' ? QURAN_POOL : null)],
      ['sunnahIdx', (typeof SUNNAH_POOL !== 'undefined' ? SUNNAH_POOL : null)],
      ['dhikrIdx', (typeof DHIKR_POOL !== 'undefined' ? DHIKR_POOL : null)],
      ['storiesIdx', (typeof STORIES !== 'undefined' ? STORIES : null)],
      ['hadithIdx', (typeof HADITHS !== 'undefined' ? HADITHS : null)],
      ['namesIdx', (typeof NAMES !== 'undefined' ? NAMES : null)],
      ['sinsIdx', (typeof SINS_POOL !== 'undefined' ? SINS_POOL : null)],
      ['repentanceIdx', (typeof REPENTANCE_POOL !== 'undefined' ? REPENTANCE_POOL : null)],
      ['sahabaIdx', (typeof SAHABA_POOL !== 'undefined' ? SAHABA_POOL : null)],
      ['seerahIdx', (typeof SEERAH_POOL !== 'undefined' ? SEERAH_POOL : null)],
      ['tafsirIdx', (typeof TAFSIR_POOL !== 'undefined' ? TAFSIR_POOL : null)],
      ['mannersIdx', (typeof MANNERS_POOL !== 'undefined' ? MANNERS_POOL : null)],
      ['inspireIdx', (typeof INSPIRATIONS_POOL !== 'undefined' ? INSPIRATIONS_POOL : null)],
      ['aqeedahIdx', (typeof AQEEDAH_POOL !== 'undefined' ? AQEEDAH_POOL : null)],
      ['familyIdx', (typeof FAMILY_POOL !== 'undefined' ? FAMILY_POOL : null)],
      ['healthIdx', (typeof HEALTH_POOL !== 'undefined' ? HEALTH_POOL : null)],
      ['financeIdx', (typeof FINANCE_POOL !== 'undefined' ? FINANCE_POOL : null)],
      ['ummahIdx', (typeof UMMAH_POOL !== 'undefined' ? UMMAH_POOL : null)],
      ['hajjIdx', (typeof HAJJ_POOL !== 'undefined' ? HAJJ_POOL : null)],
      ['akhirahIdx', (typeof AKHIRAH_POOL !== 'undefined' ? AKHIRAH_POOL : null)],
      ['prophetsIdx', (typeof PROPHETS_POOL !== 'undefined' ? PROPHETS_POOL : null)],
      ['womenIdx', (typeof WOMEN_POOL !== 'undefined' ? WOMEN_POOL : null)],
      ['knowledgeIdx', (typeof KNOWLEDGE_POOL !== 'undefined' ? KNOWLEDGE_POOL : null)],
      ['heartIdx', (typeof HEART_POOL !== 'undefined' ? HEART_POOL : null)],
      ['jumuahIdx', (typeof JUMUAH_POOL !== 'undefined' ? JUMUAH_POOL : null)],
      ['marriageIdx', (typeof MARRIAGE_POOL !== 'undefined' ? MARRIAGE_POOL : null)],
      ['wuduIdx', (typeof WUDU_POOL !== 'undefined' ? WUDU_POOL : null)],
      ['scholarsIdx', (typeof SCHOLARS_POOL !== 'undefined' ? SCHOLARS_POOL : null)],
      ['patienceIdx', (typeof PATIENCE_POOL !== 'undefined' ? PATIENCE_POOL : null)],
      ['communityIdx', (typeof COMMUNITY_POOL !== 'undefined' ? COMMUNITY_POOL : null)],
      ['fiqhIdx', (typeof FIQH_POOL !== 'undefined' ? FIQH_POOL : null)],
      ['tawakkulIdx', (typeof TAWAKKUL_POOL !== 'undefined' ? TAWAKKUL_POOL : null)],
      ['ikhlasIdx', (typeof IKHLAS_POOL !== 'undefined' ? IKHLAS_POOL : null)],
      ['zuhdIdx', (typeof ZUHD_POOL !== 'undefined' ? ZUHD_POOL : null)],
      ['jannahIdx', (typeof JANNAH_POOL !== 'undefined' ? JANNAH_POOL : null)],
      ['jahannamIdx', (typeof JAHANNAM_POOL !== 'undefined' ? JAHANNAM_POOL : null)],
      ['graveIdx', (typeof GRAVE_POOL !== 'undefined' ? GRAVE_POOL : null)],
      ['signsIdx', (typeof SIGNS_POOL !== 'undefined' ? SIGNS_POOL : null)],
      ['parentingIdx', (typeof PARENTING_POOL !== 'undefined' ? PARENTING_POOL : null)],
      ['tibbIdx', (typeof TIBB_POOL !== 'undefined' ? TIBB_POOL : null)],
      ['neighborsIdx', (typeof NEIGHBORS_POOL !== 'undefined' ? NEIGHBORS_POOL : null)]
    ].concat((function() { var np = _getNewPools(); return np ? Object.keys(np).map(k => [k + 'Idx', np[k]]) : []; })());
    for (const [key, pool] of pools) {
      if (pool && pool.length && (isNewDay || !S[key] || !S[key].length)) {
        S[key] = rng(pool.length);
      }
    }
    S.contentDate = t;
  }
  function manualRefreshContent() {
    const rng = (len) => fastRng(len);
    const cur = (typeof S !== 'undefined' && S) ? S : null;
    if (!cur) return;
    const keys = [
      'duaIdx', 'quranIdx', 'sunnahIdx', 'dhikrIdx', 'storiesIdx', 'hadithIdx', 'namesIdx',
      'sinsIdx', 'repentanceIdx', 'sahabaIdx', 'seerahIdx', 'tafsirIdx', 'mannersIdx',
      'inspireIdx', 'aqeedahIdx', 'familyIdx', 'healthIdx', 'financeIdx', 'ummahIdx', 'hajjIdx',
      'akhirahIdx', 'prophetsIdx', 'womenIdx', 'knowledgeIdx', 'heartIdx', 'jumuahIdx',
      'marriageIdx', 'wuduIdx', 'scholarsIdx', 'patienceIdx', 'communityIdx', 'fiqhIdx',
      'tawakkulIdx', 'ikhlasIdx', 'zuhdIdx', 'jannahIdx', 'jahannamIdx', 'graveIdx', 'signsIdx',
      'parentingIdx', 'tibbIdx', 'neighborsIdx'
    ];
    const pools = [
      (typeof DUA_POOL !== 'undefined' ? DUA_POOL : null),
      (typeof QURAN_POOL !== 'undefined' ? QURAN_POOL : null),
      (typeof SUNNAH_POOL !== 'undefined' ? SUNNAH_POOL : null),
      (typeof DHIKR_POOL !== 'undefined' ? DHIKR_POOL : null),
      (typeof STORIES !== 'undefined' ? STORIES : null),
      (typeof HADITHS !== 'undefined' ? HADITHS : null),
      (typeof NAMES !== 'undefined' ? NAMES : null),
      (typeof SINS_POOL !== 'undefined' ? SINS_POOL : null),
      (typeof REPENTANCE_POOL !== 'undefined' ? REPENTANCE_POOL : null),
      (typeof SAHABA_POOL !== 'undefined' ? SAHABA_POOL : null),
      (typeof SEERAH_POOL !== 'undefined' ? SEERAH_POOL : null),
      (typeof TAFSIR_POOL !== 'undefined' ? TAFSIR_POOL : null),
      (typeof MANNERS_POOL !== 'undefined' ? MANNERS_POOL : null),
      (typeof INSPIRATIONS_POOL !== 'undefined' ? INSPIRATIONS_POOL : null),
      (typeof AQEEDAH_POOL !== 'undefined' ? AQEEDAH_POOL : null),
      (typeof FAMILY_POOL !== 'undefined' ? FAMILY_POOL : null),
      (typeof HEALTH_POOL !== 'undefined' ? HEALTH_POOL : null),
      (typeof FINANCE_POOL !== 'undefined' ? FINANCE_POOL : null),
      (typeof UMMAH_POOL !== 'undefined' ? UMMAH_POOL : null),
      (typeof HAJJ_POOL !== 'undefined' ? HAJJ_POOL : null),
      (typeof AKHIRAH_POOL !== 'undefined' ? AKHIRAH_POOL : null),
      (typeof PROPHETS_POOL !== 'undefined' ? PROPHETS_POOL : null),
      (typeof WOMEN_POOL !== 'undefined' ? WOMEN_POOL : null),
      (typeof KNOWLEDGE_POOL !== 'undefined' ? KNOWLEDGE_POOL : null),
      (typeof HEART_POOL !== 'undefined' ? HEART_POOL : null),
      (typeof JUMUAH_POOL !== 'undefined' ? JUMUAH_POOL : null),
      (typeof MARRIAGE_POOL !== 'undefined' ? MARRIAGE_POOL : null),
      (typeof WUDU_POOL !== 'undefined' ? WUDU_POOL : null),
      (typeof SCHOLARS_POOL !== 'undefined' ? SCHOLARS_POOL : null),
      (typeof PATIENCE_POOL !== 'undefined' ? PATIENCE_POOL : null),
      (typeof COMMUNITY_POOL !== 'undefined' ? COMMUNITY_POOL : null),
      (typeof FIQH_POOL !== 'undefined' ? FIQH_POOL : null),
      (typeof TAWAKKUL_POOL !== 'undefined' ? TAWAKKUL_POOL : null),
      (typeof IKHLAS_POOL !== 'undefined' ? IKHLAS_POOL : null),
      (typeof ZUHD_POOL !== 'undefined' ? ZUHD_POOL : null),
      (typeof JANNAH_POOL !== 'undefined' ? JANNAH_POOL : null),
      (typeof JAHANNAM_POOL !== 'undefined' ? JAHANNAM_POOL : null),
      (typeof GRAVE_POOL !== 'undefined' ? GRAVE_POOL : null),
      (typeof SIGNS_POOL !== 'undefined' ? SIGNS_POOL : null),
      (typeof PARENTING_POOL !== 'undefined' ? PARENTING_POOL : null),
      (typeof TIBB_POOL !== 'undefined' ? TIBB_POOL : null),
      (typeof NEIGHBORS_POOL !== 'undefined' ? NEIGHBORS_POOL : null)
    ];
    keys.forEach((k, i) => { if (pools[i] && pools[i].length) cur[k] = rng(pools[i].length); });
    var np = _getNewPools();
    if (np) Object.keys(np).forEach((k) => { cur[k + 'Idx'] = rng((np[k] && np[k].length) || 5); });
    saveState(); renderAll(); toast(iqIcon('refresh-cw'), 'Content refreshed!', false, 1500);
  }

  window.ensureQuranLoaded = ensureQuranLoaded;
  window.ensureQuranBanglaLoaded = ensureQuranBanglaLoaded;
  window.ensureQuranIndoPakLoaded = ensureQuranIndoPakLoaded;
  window.ensureHadithLoaded = ensureHadithLoaded;
  window.ensurePoolsForTab = ensurePoolsForTab;
  window.ensureAllSearchPoolsLoaded = ensureAllSearchPoolsLoaded;
  window.refreshContent = refreshContent;
  window.manualRefreshContent = manualRefreshContent;
})();
