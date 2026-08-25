(function() {
  // ═══════════════════════════════════════════════════════
  function toast(icon, msg, conf=false, ms=2600) {
    window._modalTriggerEl = document.activeElement;
    const ov=document.getElementById('toastOverlay'); ov.innerHTML=`<div class="toast-box"><span style="font-size:2.5rem">${icon}</span><h3>${msg}</h3></div>`;
    ov.style.display='flex'; ov.classList.add('show'); playSound(conf ? 'chime' : 'pop');
    ov.style.pointerEvents='auto';
    if(conf) for(let i=0;i<30;i++){ const el=document.createElement('span'); el.className='confetti'; el.setAttribute('aria-hidden','true'); el.textContent=[iqEmoji('sparkles'),iqEmoji('star'),iqEmoji('sparkles'),iqEmoji('zap')][i%4]; el.style.left=Math.random()*100+'%'; el.style.top='-20px'; el.style.setProperty('--fall-dur',(2+Math.random()*3)+'s'); el.style.setProperty('--rot',(Math.random()*720-360)+'deg'); document.body.appendChild(el); setTimeout(()=>el.remove(),3000); }
    if(ov._t) clearTimeout(ov._t);
    if(ms>0) ov._t=setTimeout(()=>{ ov.classList.remove('show'); setTimeout(()=>{ ov.style.display='none'; ov.innerHTML=''; },300); ov.style.pointerEvents='none'; },ms);
    ov.onclick=()=>{ ov.classList.remove('show'); setTimeout(()=>{ ov.style.display='none'; ov.innerHTML=''; },300); ov.style.pointerEvents='none'; if(ov._t) clearTimeout(ov._t); };
  }
  window.toast = toast;


  function switchUser() { const inp=document.getElementById('usernameInput'); if(!inp?.value.trim()) return; saveState(); currentUser=inp.value.trim(); localStorage.setItem(USER_KEY,currentUser); S=window.loadState(); initApp(); }
  function logout() {
    saveState();
    currentUser = 'default';
    try { localStorage.setItem(USER_KEY, currentUser); } catch (e) {}
    S = window.loadState();
    initApp();
  }
  function resetAll() {
    if (!confirm(iqEmoji('alert-triangle') + ' Reset all data? This cannot be undone.')) return;
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith(PREFIX) || k === USER_KEY)) keys.push(k);
    }
    keys.forEach(k => localStorage.removeItem(k));
    if (window.Storage && window.Storage.destroy) {
      window.Storage.destroy(currentUser).catch(function() {});
    }
    S = freshState();
    saveState();
    renderAll();
  }
  function _downloadBackup(data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'ibadah-quest-backup-' + today() + '.json';
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }

  function exportDataLS() {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith(PREFIX) || k === USER_KEY)) {
        try { data[k] = JSON.parse(localStorage.getItem(k)); } catch(e) { data[k] = localStorage.getItem(k); }
      }
    }
    data._exported = new Date().toISOString();
    data._version = '1.0';
    _downloadBackup(data);
    toast(iqIcon('download'), 'Data exported successfully!', false, 2000);
  }

  function exportData() {
    if (window.Storage && window.Storage.exportAll) {
      window.Storage.exportAll().then(function(data) {
        data._exported = new Date().toISOString();
        data._version = '2.0';
        _downloadBackup(data);
        toast(iqIcon('download'), 'Data exported successfully!', false, 2000);
      }).catch(function() {
        exportDataLS();
      });
    } else {
      exportDataLS();
    }
  }

  function importDataLS(data) {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith(PREFIX) || k === USER_KEY)) keys.push(k);
    }
    keys.forEach(k => localStorage.removeItem(k));
    Object.keys(data).forEach(k => {
      if (k === '_exported' || k === '_version') return;
      try { localStorage.setItem(k, typeof data[k] === 'string' ? data[k] : JSON.stringify(data[k])); } catch(e) {}
    });
    S = window.loadState();
    initApp();
    toast(iqIcon('upload'), 'Data imported successfully!', false, 2000);
  }

  function importData() {
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = '.json';
    inp.onchange = function(e) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(ev) {
        try {
          const data = JSON.parse(ev.target.result);
          if (!data || typeof data !== 'object') throw new Error('Invalid file');
          delete data._exported;
          delete data._version;
          if (window.Storage && window.Storage.importAll) {
            window.Storage.importAll(data).then(function() {
              S = window.loadState();
              initApp();
              toast(iqIcon('upload'), 'Data imported successfully!', false, 2000);
            }).catch(function() {
              importDataLS(data);
            });
          } else {
            importDataLS(data);
          }
        } catch(e) {
          toast(iqIcon('alert-triangle'), 'Invalid backup file.', false, 2000);
        }
      };
      reader.readAsText(file);
    };
    inp.click();
  }
  window.exportData = exportData;
  window.importData = importData;
  function toggleBookmark(id) {
    if (!S.bookmarks) S.bookmarks = [];
    const idx = S.bookmarks.indexOf(id);
    if (idx === -1) { S.bookmarks.push(id); toast(iqIcon('bookmark'), 'Bookmarked!', false, 1500); }
    else { S.bookmarks.splice(idx, 1); toast(iqIcon('bookmark'), 'Bookmark removed', false, 1500); }
    saveState();
  }
  function isBookmarked(id) { return S.bookmarks && S.bookmarks.indexOf(id) !== -1; }
  window.toggleBookmark = toggleBookmark;
  window.isBookmarked = isBookmarked;
  function claimBonus() { const t=today(); if(S.lbd===t) return; const oldLv=S.lv; const b=S.cs>=7?75:30; S.xp+=b; S.lbd=t; S.lv=lvFrom(S.xp); checkLevelUp(oldLv); saveState(); markDirty('today'); markDirty('topbar'); markDirty('lv'); markDirty('progress'); renderDynamic(); toast(iqIcon('gift'),'Daily Bonus: +'+b+' XP!'); }
  window.claimBonus = claimBonus;
  function selectAvatar(emoji) {
    S.avatar = emoji;
    saveState();
    renderProfile();
  }
  function selectTitle(id) { if(!S.ownedTitles||!S.ownedTitles.includes(id))return; S.activeTitle=id; saveState(); renderProfile(); }
  window.selectTitle = selectTitle;
  function selectFrame(id) { if(!S.ownedFrames||!S.ownedFrames.includes(id))return; S.activeFrame=id; saveState(); renderProfile(); }
  window.selectFrame = selectFrame;

  const NEW_POOL_TITLES = {
  zakatrules:    iqIcon('wallet') + ' Zakat — Purifying Your Wealth',
  salahrules:    iqIcon('mosque') + ' Salah — The Pillar of Prayer',
  sawmrules:     iqIcon('moon') + ' Sawm — The Fast of Ramadan',
  hajjrules:     iqIcon('mosque') + ' Hajj — The Sacred Pilgrimage',
  purification:  iqIcon('droplets') + ' Purification (Taharah)',
  trade:         iqIcon('handshake') + ' Islamic Trade & Commerce',
  marriagelaws:  iqIcon('heart') + ' Marriage Laws in Islam',
  inheritance:   iqIcon('scroll') + ' Laws of Inheritance (Mirath)',
  halaldiet:     iqIcon('utensils') + ' Halal Diet & Forbidden Foods',
  oaths:         iqIcon('hand-heart') + ' Oaths & Vows in Islam',
  umayyads:      iqIcon('castle') + ' The Umayyad Caliphate',
  abbasids:      iqIcon('scroll') + ' The Abbasid Golden Age',
  andalus:       iqIcon('castle') + ' Islamic Spain (Al-Andalus)',
  ottomans:      iqIcon('mosque') + ' The Ottoman Empire',
  mamluks:       iqIcon('target') + ' The Mamluk Sultanate',
  seljuks:       iqIcon('target') + ' The Seljuk Empire',
  fatimids:      iqIcon('moon') + ' The Fatimid Caliphate',
  ayyubids:      iqIcon('shield') + ' The Ayyubid Dynasty',
  modernhist:    iqIcon('globe') + ' Modern Islamic History',
  ancientprophets:iqIcon('clock') + ' Ancient Prophets & Nations',
  sufism:        iqIcon('heart') + ' Sufism & Spiritual Paths',
  tazkiyah:      iqIcon('sparkles') + ' Tazkiyah — Soul Purification',
  asceticism:    iqIcon('leaf') + ' Asceticism (Zuhd)',
  fear:          iqIcon('alert-triangle') + ' Fear of Allah (Khawf)',
  hope:          iqIcon('heart') + ' Hope in Allah (Raja)',
  loveofallah:   iqIcon('heart') + ' Love of Allah',
  contentment:   iqIcon('heart') + ' Contentment (Qana\'ah)',
  reflection:    iqIcon('pencil') + ' Reflection & Contemplation',
  technology:    iqIcon('zap') + ' Technology & Islam',
  socialmedia:   iqIcon('globe') + ' Social Media & Islam',
  ethics:        iqIcon('handshake') + ' Islamic Ethics',
  bioethics:     iqIcon('dna') + ' Islamic Bioethics',
  modfinance:    iqIcon('credit-card') + ' Modern Islamic Finance',
  politics:      iqIcon('castle') + ' Islam & Politics',
  green:         iqIcon('sprout') + ' Green Islam & Ecology',
  mentalhealth:  iqIcon('brain') + ' Mental Health in Islam',
  youth:         iqIcon('user') + ' Youth & Islamic Identity',
  education:     iqIcon('book-open') + ' Islamic Education',
  mecca:         iqIcon('mosque') + ' Mecca — The Holy City',
  medina:        iqIcon('mosque') + ' Medina — City of the Prophet',
  jerusalem:     iqIcon('mosque') + ' Jerusalem — Al-Quds',
  damascus:      iqIcon('castle') + ' Damascus — Ancient Capital',
  baghdad:       iqIcon('scroll') + ' Baghdad — House of Wisdom',
  cairo:         iqIcon('castle') + ' Cairo — Gateway of Egypt',
  cordoba:       iqIcon('castle') + ' Cordoba — Light of the West',
  istanbul:      iqIcon('mosque') + ' Istanbul — City of Empires',
  bukhara:       iqIcon('mosque') + ' Bukhara — City of Knowledge',
  samarkand:     iqIcon('globe') + ' Samarkand — Silk Road Jewel',
  calligraphy:   iqIcon('pen-tool') + ' Islamic Calligraphy',
  architecture:  iqIcon('castle') + ' Islamic Architecture',
  geometry:      iqIcon('sparkles') + ' Islamic Geometric Art',
  poetryart:     iqIcon('scroll') + ' Islamic Poetry',
  literature:    iqIcon('book-open') + ' Islamic Literature',
  nasheeds:      iqIcon('sparkles') + ' Nasheeds & Spiritual Music',
  illumination:  iqIcon('sparkles') + ' Manuscript Illumination',
  textiles:      iqIcon('sparkles') + ' Islamic Textiles',
  ceramics:      iqIcon('sparkles') + ' Islamic Ceramics',
  woodwork:      iqIcon('sparkles') + ' Islamic Woodwork',
  abuhanifa:     iqIcon('brain') + ' Imam Abu Hanifa',
  malik:         iqIcon('brain') + ' Imam Malik ibn Anas',
  shafii:        iqIcon('brain') + ' Imam Al-Shafi\'i',
  ahmad:         iqIcon('brain') + ' Imam Ahmad ibn Hanbal',
  alghazali:     iqIcon('brain') + ' Al-Ghazali — Proof of Islam',
  ibntaymiyyah:  iqIcon('brain') + ' Ibn Taymiyyah',
  ibnkhaldun:    iqIcon('brain') + ' Ibn Khaldun — Father of Sociology',
  ibnrushd:      iqIcon('brain') + ' Ibn Rushd (Averroes)',
  ibnsina:       iqIcon('brain') + ' Ibn Sina (Avicenna)',
  alkhwarizmi:   iqIcon('brain') + ' Al-Khwarizmi — Father of Algebra',
  arabicgrammar: iqIcon('book-open') + ' Arabic Grammar (Nahw)',
  vocab:         iqIcon('book-open') + ' Arabic Vocabulary',
  rhetoric:      iqIcon('message-circle') + ' Arabic Rhetoric (Balagha)',
  morphology:    iqIcon('sparkles') + ' Arabic Morphology (Sarf)',
  pronunciation: iqIcon('sparkles') + ' Tajweed & Pronunciation',
  poetry:        iqIcon('scroll') + ' Arabic Poetry',
  proverbs:      iqIcon('zap') + ' Arabic Proverbs',
  etymology:     iqIcon('search') + ' Arabic Etymology',
  dialects:      iqIcon('globe') + ' Arabic Dialects',
  scripts:       iqIcon('pencil') + ' Arabic Scripts',
  brotherhood:   iqIcon('handshake') + ' Brotherhood in Islam',
  sisterhood:    iqIcon('flower') + ' Sisterhood in Islam',
  orphans2:      iqIcon('heart') + ' Care for Orphans',
  elderly:       iqIcon('user') + ' Respecting the Elderly',
  disabled:      iqIcon('heart') + ' Inclusion & Disability',
  antiracism:    iqIcon('globe') + ' Anti-Racism in Islam',
  poverty:       iqIcon('heart') + ' Poverty & Social Justice',
  volunteering:  iqIcon('heart') + ' Volunteering in Islam',
  epistemology:  iqIcon('brain') + ' Islamic Epistemology',
  ontology:      iqIcon('brain') + ' Islamic Ontology',
  logic:         iqIcon('sparkles') + ' Logic in Islamic Thought',
  kalam:         iqIcon('message-circle') + ' Ilm al-Kalam (Theology)',
  reason:        iqIcon('zap') + ' Reason & Revelation',
  freewill:      iqIcon('handshake') + ' Free Will & Qadar',
  problemofevil: iqIcon('moon') + ' The Problem of Evil',
  prophethood:   iqIcon('scroll') + ' Nubuwwah (Prophethood)',
  existence:     iqIcon('sparkles') + ' Existence & Tawhid'
};
  window.NEW_POOLS = NEW_POOLS;
Object.keys(NEW_POOLS).forEach(k => {
  window['render' + k] = function() {
    const title = NEW_POOL_TITLES[k] || (iqIcon('sparkles') + ' ' + k.charAt(0).toUpperCase() + k.slice(1));
    poolRender(k + 'Area', title, NEW_POOLS[k], k + 'Idx');
  }
});

  // Modal keyboard handlers (Escape to close, focus trap)
  window._modalTriggerEl = null;
  function trapFocus(modal, e) {
    var focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (!focusable.length) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
  function initModalKeyboardHandlers() {
    // Muhasabah modal
    var muhasabahModal = document.getElementById('muhasabahModal');
    if (muhasabahModal) {
      muhasabahModal.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
          if (typeof window.dismissMuhasabah === 'function') window.dismissMuhasabah();
        } else if (e.key === 'Tab') {
          trapFocus(muhasabahModal, e);
        }
      });
    }
    
    // Toast overlay
    var toastOverlay = document.getElementById('toastOverlay');
    if (toastOverlay) {
      toastOverlay.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
          closeToastOverlay();
        } else if (e.key === 'Tab') {
          trapFocus(toastOverlay, e);
        }
      });
    }
  }
  function closeToastOverlay() {
    var toastOverlay = document.getElementById('toastOverlay');
    if (!toastOverlay) return;
    toastOverlay.classList.remove('show');
    toastOverlay.style.display = 'none';
    toastOverlay.innerHTML = '';
    toastOverlay.style.pointerEvents = 'none';
    if (window._modalTriggerEl && window._modalTriggerEl.focus) {
      window._modalTriggerEl.focus();
      window._modalTriggerEl = null;
    }
  }

  // Theme toggle keyboard support
  function initThemeToggleKeyboard() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;
    
    themeToggle.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        window.toggleTheme();
      }
    });
  }

  function _parseHashAndNavigate() {
    const hash = location.hash;
    if (hash && hash.startsWith('#/')) {
      const parts = hash.slice(2).split('/');
      if (parts.length === 2) {
        const [cat, tab] = parts;
        const btn = document.querySelector('.t1-btn[data-cat="' + cat + '"]');
        if (btn) {
          window._hashNavigating = true;
          window.switchCategory(cat, btn);
          const { catObj, tabBtn } = window._findTabBtn(cat, tab);
          if (catObj) {
            const chipBtn = document.querySelector('.cat-chip[onclick*="' + catObj.id + '"]');
            if (chipBtn) window.selectCategory(catObj.id, chipBtn);
          }
          if (tabBtn) {
            window.activateTab(tab, tabBtn);
          } else {
            window.activateTab(tab, null);
          }
          window._hashNavigating = false;
          return true;
        }
      }
    }
    return false;
  }

  function _initHashRouting() {
    window.addEventListener('popstate', function(e) {
      if (e.state && e.state.cat && e.state.tab) {
        window._hashNavigating = true;
        const btn = document.querySelector('.t1-btn[data-cat="' + e.state.cat + '"]');
        if (btn) window.switchCategory(e.state.cat, btn);
        const { catObj, tabBtn } = window._findTabBtn(e.state.cat, e.state.tab);
        if (catObj) {
          const chipBtn = document.querySelector('.cat-chip[onclick*="' + catObj.id + '"]');
          if (chipBtn) window.selectCategory(catObj.id, chipBtn);
        }
        if (tabBtn) {
          window.activateTab(e.state.tab, tabBtn);
        } else {
          window.activateTab(e.state.tab, null);
        }
        window._hashNavigating = false;
      }
    });
  }

  function initApp() {
  const overlay = document.getElementById('introOverlay');
  const introSeen = S ? !!S.introSeen : true;
  if (overlay) {
    if (!introSeen) {
      overlay.style.display = 'flex';
      overlay.style.opacity = '1';
      overlay.style.pointerEvents = 'auto';
      overlay.classList.add('visible');
    } else {
      overlay.classList.remove('visible');
      overlay.style.display = 'none';
      overlay.style.opacity = '0';
      overlay.style.pointerEvents = 'none';
    }
  }
  try { window.applyTheme(); } catch(e) { console.error('applyTheme in initApp failed:', e); }

    const t = today();
    if (S.lad !== t) { S.lad=t; if(S.ab&&S.ab.exp<t) S.ab=null; if (typeof window.recalc === 'function') window.recalc(); saveState(); }
    if (S.log && Object.keys(S.log).length > 400) compactLogs();
    if (typeof window.genDQ === 'function') window.genDQ();
    if (typeof window.genWQ === 'function') window.genWQ();
    if (typeof window.genMQ === 'function') window.genMQ();
    if (typeof window.genYQ === 'function') window.genYQ();
    if (typeof window.genLQ === 'function') window.genLQ();
    if (typeof window.refreshContent === 'function') window.refreshContent();
    if (typeof window.recalc === 'function') window.recalc();
    if (typeof window.checkQ === 'function') window.checkQ();
    S.lv=lvFrom(S.xp); saveState(); initCalView(); renderAll();
    if (window.renderDailyContent) window.renderDailyContent();
    const modalQueue = [];
    if (window.showWeeklySummary) modalQueue.push(window.showWeeklySummary);
    if (window.showDailySummary) modalQueue.push(window.showDailySummary);
    if (window.showDailyRitual) modalQueue.push(window.showDailyRitual);
    function runModalQueue() {
      if (modalQueue.length === 0) return;
      const fn = modalQueue.shift();
      try { fn(); } catch(e) { console.error('modal queue step failed:', e); }
      const overlay = document.getElementById('toastOverlay');
      if (overlay) {
        const checkClosed = setInterval(() => {
          if (overlay.style.display === 'none' || overlay.style.opacity === '0' ||
              (!overlay.classList.contains('show') && !overlay.classList.contains('visible'))) {
            clearInterval(checkClosed);
            setTimeout(runModalQueue, 300);
          }
        }, 200);
        setTimeout(() => { clearInterval(checkClosed); runModalQueue(); }, 10000);
      } else {
        runModalQueue();
      }
    }
    runModalQueue();
    if (window.checkConsistency) window.checkConsistency();
    if (window.checkWeeklyConsistency) window.checkWeeklyConsistency();
    try {
      if (!_parseHashAndNavigate()) {
        const savedCat = S ? S.lastCat : null;
        const savedSub = S ? S.lastSub : null;
        let activeBtn = savedCat ? document.querySelector('.t1-btn[data-cat="' + savedCat + '"]') : null;
        if (!activeBtn) activeBtn = document.querySelector('.t1-btn.active');
        const activeCat = activeBtn ? activeBtn.getAttribute('data-cat') : 'ibadah';
        window.switchCategory(activeCat, activeBtn);
        if (savedSub) {
          const subBtn = document.querySelector('[data-tab="' + savedSub + '"]');
          if (subBtn) subBtn.click();
        }
      }
    } catch(e) { console.warn('Initial nav render failed:', e); }
  }

  function finishInit() {
    try { window.applyTheme(); } catch(e) { console.error('Step 2 applyTheme failed:', e); }
    try { initApp(); } catch(e) { console.error('Step 3 initApp failed:', e); }
    try { if (window.initSearch) window.initSearch(); } catch(e) { console.error('Step 3b initSearch failed:', e); }
    try { if (window.initFAB) window.initFAB(); } catch(e) { console.error('Step 3c initFAB failed:', e); }
    try { if (window.initPullRefresh) window.initPullRefresh(); } catch(e) { console.error('Step 3d initPullRefresh failed:', e); }
    try {
      if (window.requestNotificationPermission) window.requestNotificationPermission();
      if (S.notificationsEnabled && window.scheduleNotifications) window.scheduleNotifications();
    } catch(e) { console.error('Step 3e notifications init failed:', e); }
    try {
      document.addEventListener('click', (e) => {
        const sr = document.getElementById('globalSearchResults');
        if (sr && !e.target.closest('.global-search-wrap')) sr.classList.remove('show');
      });
    } catch(e) { console.error('Step 6 clickOutside failed:', e); }
    try { if (window.initTierTabKeyboardNav) window.initTierTabKeyboardNav(); } catch(e) { console.error('Step 7 tier tab keyboard nav failed:', e); }
    try { if (window.initTier2TabKeyboardNav) window.initTier2TabKeyboardNav(); } catch(e) { console.error('Step 8 tier2 tab keyboard nav failed:', e); }
    try { if (window.initBnavKeyboardNav) window.initBnavKeyboardNav(); } catch(e) { console.error('Step 8c bnav keyboard nav failed:', e); }
    try { if (window.populateTier1Icons) window.populateTier1Icons(); } catch(e) { console.error('Step 8b tier1 icons failed:', e); }
    try { initModalKeyboardHandlers(); } catch(e) { console.error('Step 9 modal keyboard handlers failed:', e); }
    try { initThemeToggleKeyboard(); } catch(e) { console.error('Step 10 theme toggle keyboard failed:', e); }
    try { _initHashRouting(); } catch(e) { console.error('Step 10b hash routing init failed:', e); }
    // Deferred feature scripts (health, goals, spiritual-growth, etc.) execute after
    // init()/renderAll() has already run, so re-render once they have loaded to populate
    // their panels (DOMContentLoaded fires after all defer scripts execute).
    try {
      document.addEventListener('DOMContentLoaded', function() {
        try { if (window.renderAll) window.renderAll(); } catch(e) { console.error('Post-defer re-render failed:', e); }
        try { if (window.autoTrackJourneyProgress) window.autoTrackJourneyProgress(); } catch(e) { console.error('Post-defer journey tracking failed:', e); }
      });
    } catch(e) { console.error('Step 10c post-defer re-render hook failed:', e); }
    try {
      document.addEventListener('keydown', (e) => {
        if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.card-item, .vol-card, .shop-card')) {
          e.preventDefault();
          e.target.click();
        }
      });
    } catch(e) { console.error('Step 11 card keyboard nav failed:', e); }
    function appAction(name) {
      return function() {
        var fn = window[name];
        return typeof fn === 'function' ? fn.apply(window, arguments) : undefined;
      };
    }
    window.App = {
      toggleP: window.toggleP, toggleV: window.toggleV, toggleD: window.toggleD, buy: window.buy,
      detail: (id) => toast(iqIcon('alert-triangle'), DETAILS[id]||'Voluntary Prayer', false, 4000),
      tip: (id) => toast(iqIcon('zap'), TIPS[id]||'A beautiful deed!', false, 4000),
      toggleQuest: window.toggleQuest, addGratitude: window.addGratitude, toggleFasting: window.toggleFasting, setCharityGoals: window.setCharityGoals,
      grantDailyXp: window.grantDailyXp, grantCappedDailyXp: window.grantCappedDailyXp,
      logWater: appAction('logWater'),
      logSleep: appAction('logSleep'),
      logExercise: appAction('logExercise'),
      toggleMeal: appAction('toggleMeal'),
      addMemorization: window.addMemorization, toggleMorning: window.toggleMorning, toggleEvening: window.toggleEvening,
      toggleTafsir: typeof window.toggleTafsir === 'function' ? window.toggleTafsir : () => {}, setTafsirEdition: typeof window.setTafsirEdition === 'function' ? window.setTafsirEdition : () => {}, switchUser, logout, resetAll, exportData, importData, toggleBookmark, isBookmarked, toggleVolCat: typeof window.toggleVolCat === 'function' ? window.toggleVolCat : () => {}, toggleDeedCat: typeof window.toggleDeedCat === 'function' ? window.toggleDeedCat : () => {},
      openMuhasabah: appAction('openMuhasabah'),
      dismissMuhasabah: appAction('dismissMuhasabah'),
      joinJourney: appAction('joinJourney'),
      manualRefresh: window.manualRefreshContent, ensureQuranLoaded: window.ensureQuranLoaded, ensureHadithLoaded: window.ensureHadithLoaded,
      claimBonus: window.claimBonus,
      setQuranView: window.setQuranView, quranSearchFilter: window.quranSearchFilter, openQuranSurah: window.openQuranSurah, quranBack: window.quranBack, openQuranJuz: window.openQuranJuz,
      openHadithCollection: window.openHadithCollection, openHadithBook: window.openHadithBook, hadithBack: window.hadithBack,
      playQuranVerse: window.playQuranVerse, playSurah: window.playSurah, stopSurah: window.stopSurah, setQuranReciter: window.setQuranReciter, playJuz: window.playJuz, updateJuzButton: window.updateJuzButton,
      calPrevMonth: window.calPrevMonth, calNextMonth: window.calNextMonth, calGoToday: window.calGoToday, selectAvatar, selectTitle, selectFrame,
      setTheme: window.setTheme, toggleTheme: window.toggleTheme,
      toggleNotifications: appAction('toggleNotifications'),
      switchCategory: typeof window.switchCategory === 'function' ? window.switchCategory : () => {},
      activateTab: typeof window.activateTab === 'function' ? window.activateTab : () => {},
      tapDhikr: typeof window.tapDhikr === 'function' ? window.tapDhikr : () => {},
      resetDhikr: typeof window.resetDhikr === 'function' ? window.resetDhikr : () => {},
      nextDhikr: typeof window.nextDhikr === 'function' ? window.nextDhikr : () => {},
      openSituational: typeof window.openSituational === 'function' ? window.openSituational : () => {},
      situationalBack: typeof window.situationalBack === 'function' ? window.situationalBack : () => {},
      tapSituationalDhikr: typeof window.tapSituationalDhikr === 'function' ? window.tapSituationalDhikr : () => {},
      toggleSitFav: typeof window.toggleSitFav === 'function' ? window.toggleSitFav : () => {},
      openExtraDeeds: typeof window.openExtraDeeds === 'function' ? window.openExtraDeeds : () => {},
      extraDeedsBack: typeof window.extraDeedsBack === 'function' ? window.extraDeedsBack : () => {},
      openVolPrayers: typeof window.openVolPrayers === 'function' ? window.openVolPrayers : () => {},
      volPrayersBack: typeof window.volPrayersBack === 'function' ? window.volPrayersBack : () => {},
      toggleAvatarPicker: () => toast(iqIcon('user'), 'Avatar picker coming soon!', false, 2000)
    };
    window.closeToastOverlay = closeToastOverlay;
    console.log('Ibadah Quest initialized. window.App is set.');
  }

  function init() {
    try { if (typeof window.resolveCurrentUser === 'function') window.resolveCurrentUser(); } catch(e) { console.error('Step 0 resolve user failed:', e); }
    try { S = window.loadState(); } catch(e) { console.error('Step 1 loadState failed:', e); }
    finishInit();
  }

  async function initAsync() {
    try { if (typeof window.resolveCurrentUser === 'function') window.resolveCurrentUser(); } catch(e) { console.error('Step 0 resolve user failed:', e); }
    try {
      S = typeof window.loadStateAsync === 'function' ? await window.loadStateAsync() : window.loadState();
    } catch(e) {
      console.error('Step 1 async loadState failed:', e);
      try { S = window.loadState(); } catch(fallbackError) { console.error('Step 1 fallback loadState failed:', fallbackError); }
    }
    finishInit();
  }

  function startJourney() {
    var overlay = document.getElementById('introOverlay');
    if (overlay) {
      overlay.style.transition = 'opacity 0.8s ease-in-out';
      overlay.style.opacity = '0';
      setTimeout(function(){
        overlay.classList.remove('visible');
        overlay.style.display = 'none';
        overlay.style.transition = '';
        S.introSeen = true; saveState();
        if (typeof window.isOnboardingComplete === 'function' && !window.isOnboardingComplete()) {
          setTimeout(function() { window.startOnboarding(); }, 400);
        }
      }, 800);
    }
  }
  window.startJourney = startJourney;

  function setupOfflineDetection() {
    try {
      if (typeof navigator === 'undefined' || typeof window === 'undefined') return;
      const banner = document.getElementById('offlineBanner');
      if (!banner) return;
      if (typeof window.addEventListener !== 'function') return;
      function update() {
        banner.style.display = navigator.onLine ? 'none' : 'flex';
      }
      window.addEventListener('online', update);
      window.addEventListener('offline', update);
      update();
    } catch(e) {}
  }
  setupOfflineDetection();

  if (window.storageReady) {
    Promise.resolve(window.storageReady).then(initAsync).catch(function(e) {
      console.error('Ibadah Quest async init error:', e);
      console.error('Stack:', e.stack);
    });
  } else {
    try {
      init();
    } catch(e) {
      console.error('Ibadah Quest init error:', e);
      console.error('Stack:', e.stack);
    }
  }
})();
