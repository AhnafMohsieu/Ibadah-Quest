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


  function switchUser() { const inp=document.getElementById('usernameInput'); if(!inp?.value.trim()) return; saveState(); currentUser=inp.value.trim(); localStorage.setItem(USER_KEY,currentUser); S=window.loadState(); initApp(); }
  function logout() { switchUser(); }
  function resetAll() {
    if (!confirm(iqEmoji('alert-triangle') + ' Reset all data? This cannot be undone.')) return;
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith(PREFIX) || k === USER_KEY)) keys.push(k);
    }
    keys.forEach(k => localStorage.removeItem(k));
    S = freshState();
    saveState();
    renderAll();
  }
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
  // Dismiss intro overlay immediately so it never blocks clicks
  if (overlay) {
    overlay.classList.remove('visible');
    overlay.style.opacity = '0';
    overlay.style.pointerEvents = 'none';
  }
  try { window.applyTheme(); } catch(e) { console.error('applyTheme in initApp failed:', e); }
  // Profile as main tab
  TAB_GROUPS.profile_main = [
    { id: 'profile', icon: 'user', label: 'Profile' },
    { id: 'trophies', icon: 'trophy', label: 'Trophies' },
    { id: 'goals', icon: 'target', label: 'Goals' },
    { id: 'progress', icon: 'bar-chart-3', label: 'Progress' },
    { id: 'stats', icon: 'trending-up', label: 'Analytics' },
    { id: 'rewards', icon: 'gift', label: 'Rewards' }
  ];

    const t = today();
    if (S.lad !== t) { S.lad=t; if(S.ab&&S.ab.exp<t) S.ab=null; window.recalc(); saveState(); }
    if (S.log && Object.keys(S.log).length > 400) compactLogs();
    genDQ(); genWQ(); genMQ(); genYQ(); genLQ(); window.refreshContent(); window.recalc(); checkQ(); S.lv=lvFrom(S.xp); saveState(); initCalView(); renderAll();
    if (window.renderDailyContent) window.renderDailyContent();
    if (window.showWeeklySummary) window.showWeeklySummary();
    if (window.showDailySummary) window.showDailySummary();
    if (window.showDailyRitual) window.showDailyRitual();
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

  function init() {
    try { resolveCurrentUser(); } catch(e) { console.error('Step 0 resolve user failed:', e); }
    try { S = window.loadState(); } catch(e) { console.error('Step 1 loadState failed:', e); }
    if (typeof window.isOnboardingComplete === 'function' && !window.isOnboardingComplete()) {
      window.startOnboarding();
    }
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
    try { window.initTierTabKeyboardNav(); } catch(e) { console.error('Step 7 tier tab keyboard nav failed:', e); }
    try { window.initTier2TabKeyboardNav(); } catch(e) { console.error('Step 8 tier2 tab keyboard nav failed:', e); }
    try { window.populateTier1Icons(); } catch(e) { console.error('Step 8b tier1 icons failed:', e); }
    try { initModalKeyboardHandlers(); } catch(e) { console.error('Step 9 modal keyboard handlers failed:', e); }
    try { initThemeToggleKeyboard(); } catch(e) { console.error('Step 10 theme toggle keyboard failed:', e); }
    try { _initHashRouting(); } catch(e) { console.error('Step 10b hash routing init failed:', e); }
    // Deferred feature scripts (health, mood, goals, spiritual-growth, etc.) execute after
    // init()/renderAll() has already run, so re-render once they have loaded to populate
    // their panels (DOMContentLoaded fires after all defer scripts execute).
    try {
      document.addEventListener('DOMContentLoaded', function() {
        try { if (window.renderAll) window.renderAll(); } catch(e) { console.error('Post-defer re-render failed:', e); }
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
    window.App = {
      toggleP: window.toggleP, toggleV: window.toggleV, toggleD: window.toggleD, buy: window.buy,
      detail: (id) => toast(iqIcon('alert-triangle'), DETAILS[id]||'Voluntary Prayer', false, 4000),
      tip: (id) => toast(iqIcon('zap'), TIPS[id]||'A beautiful deed!', false, 4000),
      toggleQuest: window.toggleQuest, addGratitude: window.addGratitude, toggleFasting: window.toggleFasting, setCharityGoals: window.setCharityGoals,
      grantDailyXp: window.grantDailyXp, grantCappedDailyXp: window.grantCappedDailyXp,
      logWater: typeof window.logWater === 'function' ? window.logWater : () => {},
      logSleep: typeof window.logSleep === 'function' ? window.logSleep : () => {},
      logExercise: typeof window.logExercise === 'function' ? window.logExercise : () => {},
      toggleMeal: typeof window.toggleMeal === 'function' ? window.toggleMeal : () => {},
      addMemorization: window.addMemorization, toggleMorning: window.toggleMorning, toggleEvening: window.toggleEvening, switchUser, logout, resetAll,
      openMuhasabah: typeof window.openMuhasabah === 'function' ? window.openMuhasabah : () => {},
      dismissMuhasabah: typeof window.dismissMuhasabah === 'function' ? window.dismissMuhasabah : () => {},
      joinJourney: typeof window.joinJourney === 'function' ? window.joinJourney : () => {},
      manualRefresh: window.manualRefreshContent, ensureQuranLoaded: window.ensureQuranLoaded, ensureHadithLoaded: window.ensureHadithLoaded,
      claimBonus: window.claimBonus,
      setQuranView: window.setQuranView, quranSearchFilter: window.quranSearchFilter, openQuranSurah: window.openQuranSurah, quranBack: window.quranBack, openQuranJuz: window.openQuranJuz,
      openHadithCollection: window.openHadithCollection, openHadithBook: window.openHadithBook, hadithBack: window.hadithBack,
      playQuranVerse: window.playQuranVerse, playSurah: window.playSurah, stopSurah: window.stopSurah, setQuranReciter: window.setQuranReciter, playJuz: window.playJuz, updateJuzButton: window.updateJuzButton,
      calPrevMonth: window.calPrevMonth, calNextMonth: window.calNextMonth, calGoToday: window.calGoToday, selectAvatar, selectTitle, selectFrame,
      setTheme: window.setTheme, toggleTheme: window.toggleTheme,
      toggleNotifications: typeof window.toggleNotifications === 'function' ? window.toggleNotifications : () => {},
      switchCategory: typeof window.switchCategory === 'function' ? window.switchCategory : () => {},
      activateTab: typeof window.activateTab === 'function' ? window.activateTab : () => {},
      tapDhikr: typeof window.tapDhikr === 'function' ? window.tapDhikr : () => {},
      resetDhikr: typeof window.resetDhikr === 'function' ? window.resetDhikr : () => {},
      nextDhikr: typeof window.nextDhikr === 'function' ? window.nextDhikr : () => {},
      toggleAvatarPicker: () => toast(iqIcon('user'), 'Avatar picker coming soon!', false, 2000)
    };
    window.closeToastOverlay = closeToastOverlay;
    console.log('Ibadah Quest initialized. window.App is set.');
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
      }, 800);
    }
  }
  window.startJourney = startJourney;

  try {
    init();
  } catch(e) {
    console.error('Ibadah Quest init error:', e);
    console.error('Stack:', e.stack);
  }
})();
