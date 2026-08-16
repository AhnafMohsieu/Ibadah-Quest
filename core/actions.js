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


  function switchUser() { const inp=document.getElementById('usernameInput'); if(!inp?.value.trim()) return; saveState(); currentUser=inp.value.trim(); localStorage.setItem(USER_KEY,currentUser); S=loadState(); initApp(); }
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
  function claimBonus() { const t=today(); if(S.lbd===t) return; const oldLv=S.lv; const b=S.cs>=7?75:30; S.xp+=b; S.lbd=t; S.lv=lvFrom(S.xp); checkLevelUp(oldLv); saveState(); renderDynamic(); toast(iqIcon('gift'),'Daily Bonus: +'+b+' XP!'); }
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

  let _activeCategoryId = null;

  function switchCategory(catId, btn) {
    document.querySelectorAll('.t1-btn').forEach(el => {
      el.classList.remove('active');
      el.setAttribute('aria-selected', 'false');
    });
    if (btn) {
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
    }
    if (S) { S.lastCat = catId; saveState(); }
    const group = TAB_GROUPS[catId] || [];
    const container = document.getElementById('tier2Tabs');
    const tier3Wrap = document.getElementById('tier3Wrap');
    const isCategorized = group.length > 0 && Array.isArray(group[0].tabs);
    if (isCategorized) {
      _activeCategoryId = null;
      container.classList.add('cat-chips');
      container.innerHTML = group.map((c, i) => `<button class="cat-chip ${i===0?'active':''}" onclick="App.selectCategory('${c.id}', this)"><span>${iqIcon(c.icon || c.id)}</span> ${c.label}</button>`).join('');
      if (tier3Wrap) tier3Wrap.style.display = '';
      const firstCat = group[0];
      _activeCategoryId = firstCat.id;
      renderCategoryTabs(firstCat);
    } else {
      container.classList.remove('cat-chips');
      container.innerHTML = group.map((p, i) => `<button data-tab="${p.id}" class="t2-btn ${i===0?'active':''}" onclick="App.activateTab('${p.id}', this)"><span>${iqIcon(p.icon || p.id)}</span> ${p.label}</button>`).join('');
      if (tier3Wrap) tier3Wrap.style.display = 'none';
      if (group.length > 0) activateTab(group[0].id, container.firstElementChild);
    }
  }
  function selectCategory(catId, btn) {
    document.querySelectorAll('.cat-chip').forEach(el => el.classList.remove('active'));
    if (btn) btn.classList.add('active');
    _activeCategoryId = catId;
    const group = Object.values(TAB_GROUPS).find(g => Array.isArray(g[0]?.tabs) && g.some(c => c.id === catId)) || [];
    const cat = group.find(c => c.id === catId);
    if (cat) renderCategoryTabs(cat);
  }
  function renderCategoryTabs(cat) {
    const grid = document.getElementById('tier3Tabs');
    if (!grid) return;
    grid.innerHTML = cat.tabs.map((p, i) => `<button data-tab="${p.id}" class="t2-btn ${i===0?'active':''}" onclick="App.activateTab('${p.id}', this)"><span>${iqIcon(p.icon || p.id)}</span> ${p.label}</button>`).join('');
    if (cat.tabs.length > 0) activateTab(cat.tabs[0].id, grid.firstElementChild);
  }
  function getSectionPanels(sectionName) {
    const sections = {
      home: ['panel-today','panel-timer','panel-journeys','panel-morning','panel-evening','panel-dhikr','panel-duas','panel-quran','panel-wudu','panel-jumuah','panel-salah','panel-fasting','panel-healthlog','panel-finance','panel-mood'],
      quests: ['panel-quests'],
      stats: ['panel-stats'],
      growth: ['panel-progress', 'panel-growth'],
      profile: ['panel-profile','panel-trophies','panel-rewards','panel-allah_names','panel-prophet_names','panel-scholars_names']
    };
    return sections[sectionName] || null;
  }
  function activateTab(tabId, btn) {
    document.querySelectorAll('.t2-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    if (S) { S.lastSub = tabId; saveState(); }
    let sectionName = null;
    for (const [sec, panels] of Object.entries({home:['panel-today','panel-timer','panel-journeys','panel-morning','panel-evening','panel-dhikr','panel-duas','panel-quran','panel-wudu','panel-jumuah','panel-salah','panel-fasting','panel-healthlog','panel-finance','panel-mood'],quests:['panel-quests'],stats:['panel-stats'],growth:['panel-progress','panel-growth'],profile:['panel-profile','panel-trophies','panel-rewards','panel-allah_names','panel-prophet_names','panel-scholars_names']})) {
      if (panels.includes('panel-' + tabId)) { sectionName = sec; break; }
    }
    const sectionPanels = sectionName ? getSectionPanels(sectionName) : null;
    if (sectionPanels) {
      sectionPanels.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('active');
      });
    } else {
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    }
    const panel = document.getElementById('panel-' + tabId);
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    if (panel) panel.classList.add('active');
    const _lazyRender = {
      quran:'renderQuran', hadith:'renderHadith', sunnahs:'renderSunnahs', dhikr:'renderDhikr',
      stories:'renderStories', names:'renderNames', inspirations:'renderInspirations', gratitude:'renderGratitude',
      allah_names:'renderNames', scholars_names:'renderScholars',
      fasting:'renderFasting', charity:'renderCharity', memorization:'renderMemorization',
      morning:'renderMorning', evening:'renderEvening', sins:'renderSins', punishments:'renderPunishments',
      repentance:'renderRepentance', sahaba:'renderSahaba', seerah:'renderSeerah', tafsir:'renderTafsir',
      manners:'renderManners', family:'renderFamily', health:'renderHealth', finance:'renderFinance',
      ummah:'renderUmmah', hajj:'renderHajj', akhirah:'renderAkhirah', prophets:'renderProphets',
      women:'renderWomen', heart:'renderHeart', marriage:'renderMarriage', science:'renderScience',
      wudu:'renderWudu', scholars:'renderScholars', patience:'renderPatience', work:'renderWork',
      community:'renderCommunity', environment:'renderEnvironment', travel:'renderTravel',
      fiqh:'renderFiqh', arabic:'renderArabic', tawakkul:'renderTawakkul', ikhlas:'renderIkhlas',
      zuhd:'renderZuhd', dawah:'renderDawah', battles:'renderBattles', jannah:'renderJannah',
      jahannam:'renderJahannam', grave:'renderGrave', signs:'renderSigns', dreams:'renderDreams',
      parenting:'renderParenting', food:'renderFood', tibb:'renderTibb', youth:'renderYouth',
      tech:'renderTech', neighbors:'renderNeighbors', salah:'renderSalah', finance:'renderFinanceTab',
      aqeedah:'renderAqeedah', knowledge:'renderKnowledge', civilisation:'renderCivilisation', jumuah:'renderJumuah',
      purification:'renderPurification', salahrules:'renderSalahrules', zakatrules:'renderZakatrules',
      sawmrules:'renderSawmrules', hajjrules:'renderHajjrules', trade:'renderTrade',
      inheritance:'renderInheritance', oaths:'renderOaths', sufism:'renderSufism', tazkiyah:'renderTazkiyah',
      fear:'renderFear', hope:'renderHope', loveofallah:'renderLoveofallah', contentment:'renderContentment',
      reflection:'renderReflection', brotherhood:'renderBrotherhood', sisterhood:'renderSisterhood',
      orphans2:'renderOrphans2', elderly:'renderElderly', disabled:'renderDisabled',
      antiracism:'renderAntiracism', poverty:'renderPoverty', volunteering:'renderVolunteering',
      technology:'renderTechnology', socialmedia:'renderSocialmedia', ethics:'renderEthics',
      bioethics:'renderBioethics', modfinance:'renderModfinance', politics:'renderPolitics',
      green:'renderGreen', mentalhealth:'renderMentalhealth', education:'renderEducation',
      umayyads:'renderUmayyads', abbasids:'renderAbbasids', andalus:'renderAndalus',
      ottomans:'renderOttomans', mamluks:'renderMamluks', seljuks:'renderSeljuks',
      fatimids:'renderFatimids', ayyubids:'renderAyyubids', modernhist:'renderModernhist',
      ancientprophets:'renderAncientprophets', mecca:'renderMecca', medina:'renderMedina',
      jerusalem:'renderJerusalem', damascus:'renderDamascus', baghdad:'renderBaghdad',
      cairo:'renderCairo', cordoba:'renderCordoba', istanbul:'renderIstanbul',
      bukhara:'renderBukhara', samarkand:'renderSamarkand', calligraphy:'renderCalligraphy',
      architecture:'renderArchitecture', geometry:'renderGeometry', poetryart:'renderPoetryart',
      literature:'renderLiterature', nasheeds:'renderNasheeds', illumination:'renderIllumination',
      textiles:'renderTextiles', ceramics:'renderCeramics', woodwork:'renderWoodwork',
      arabicgrammar:'renderArabicgrammar', vocab:'renderVocab', rhetoric:'renderRhetoric',
      morphology:'renderMorphology', pronunciation:'renderPronunciation', poetry:'renderPoetry',
      proverbs:'renderProverbs', etymology:'renderEtymology', dialects:'renderDialects',
      scripts:'renderScripts', epistemology:'renderEpistemology', ontology:'renderOntology',
      logic:'renderLogic', kalam:'renderKalam', reason:'renderReason', freewill:'renderFreewill',
      problemofevil:'renderProblemofevil', prophethood:'renderProphethood', existence:'renderExistence',
      keys:'renderKeys', mosque:'renderMosque', ramadan:'renderRamadan', laylat:'renderLaylat',
      timer:'renderPrayerTimes', stats:'renderStats'
    };
    if (_lazyRender[tabId] && window[_lazyRender[tabId]]) {
      try { window[_lazyRender[tabId]](); } catch(e) { console.warn('Lazy render ' + tabId + ' failed:', e.message); }
    }
    if (tabId === 'hadith' && typeof HADITH_COLLECTIONS_DATA === 'undefined') {
      ensureHadithLoaded().then(() => { if (window.renderHadith) window.renderHadith(); }).catch(() => {});
    }
  }

  function switchTab(name) {
    if (S) S.lastTab = name;
    if (S) saveState();
    const content = document.getElementById('mainContent');
    if (content) { content.classList.add('fading'); setTimeout(() => content.classList.remove('fading'), 60); }
    renderTab(name);
  }

  function renderTab(name) {
    const panelMap = {
      home: 'panel-today',
      quests: 'panel-quests',
      stats: 'panel-stats',
      growth: 'panel-growth',
      profile: 'panel-profile'
    };
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    const panelId = panelMap[name] || 'panel-today';
    const panel = document.getElementById(panelId);
    if (panel) panel.classList.add('active');
    if (name === 'home') {
      window.renderPrayers(); window.renderVol(); window.renderDeeds(); window.renderBonus();
      window.renderTopBar();
    } else if (name === 'quests') {
      window.renderQ(); window.renderAch();
    } else if (name === 'stats') {
      if (window.Dashboard && typeof window.Dashboard.renderInsights === 'function') window.Dashboard.renderInsights();
    } else if (name === 'growth') {
      if (window.renderProg) window.renderProg();
      if (window.renderGarden) window.renderGarden();
      if (window.renderSpiritualGrowthTab) window.renderSpiritualGrowthTab();
      if (window.renderBoat) window.renderBoat();
      if (window.renderArmor) window.renderArmor();
      if (window.renderHeartRefinement) window.renderHeartRefinement();
    } else if (name === 'profile') {
      window.renderProfile();
      if (window.renderKeys) window.renderKeys();
      if (window.renderMosque) window.renderMosque();
    }
    updateTopBar();
  }

  function updateTopBar() {
    if (window.renderTopBar) window.renderTopBar();
  }

  // Keyboard navigation for tier tabs
  function initTierTabKeyboardNav() {
    const tier1Tabs = document.querySelector('.tier1-tabs');
    if (!tier1Tabs) return;
    
    tier1Tabs.addEventListener('keydown', function(e) {
      const tabs = Array.from(tier1Tabs.querySelectorAll('.t1-btn'));
      const currentIndex = tabs.findIndex(t => t.classList.contains('active'));
      
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIndex = (currentIndex + 1) % tabs.length;
        tabs[nextIndex].focus();
        tabs[nextIndex].click();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        tabs[prevIndex].focus();
        tabs[prevIndex].click();
      } else if (e.key === 'Home') {
        e.preventDefault();
        tabs[0].focus();
        tabs[0].click();
      } else if (e.key === 'End') {
        e.preventDefault();
        tabs[tabs.length - 1].focus();
        tabs[tabs.length - 1].click();
      }
    });
  }

  // Keyboard navigation for tier2 tabs
  function initTier2TabKeyboardNav() {
    const tier2Tabs = document.getElementById('tier2Tabs');
    if (!tier2Tabs) return;
    
    tier2Tabs.addEventListener('keydown', function(e) {
      const tabs = Array.from(tier2Tabs.querySelectorAll('.t2-btn, .cat-chip'));
      if (tabs.length === 0) return;
      const currentIndex = tabs.findIndex(t => t.classList.contains('active'));
      
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIndex = (currentIndex + 1) % tabs.length;
        tabs[nextIndex].focus();
        tabs[nextIndex].click();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        tabs[prevIndex].focus();
        tabs[prevIndex].click();
      } else if (e.key === 'Home') {
        e.preventDefault();
        tabs[0].focus();
        tabs[0].click();
      } else if (e.key === 'End') {
        e.preventDefault();
        tabs[tabs.length - 1].focus();
        tabs[tabs.length - 1].click();
      }
    });
  }

  function populateTier1Icons() {
    const buttons = document.querySelectorAll('.t1-btn');
    buttons.forEach(function(btn) {
      const span = btn.querySelector('.iq-inline');
      if (!span || span.childElementCount > 0) return;
      const cat = btn.getAttribute('data-cat');
      if (!cat) return;
      const icon = iqIcon(cat);
      if (icon) span.innerHTML = icon;
    });
  }

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
        toggleTheme();
      }
    });
  }

  function initApp() {
  const overlay = document.getElementById('introOverlay');
  // Always show intro on every page load
  if (overlay) {
    overlay.classList.add('visible');
    overlay.style.opacity = '1';
  }
  applyTheme();
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
    genDQ(); genWQ(); genMQ(); genYQ(); genLQ(); window.refreshContent(); window.recalc(); checkQ(); S.lv=lvFrom(S.xp); saveState(); initCalView(); renderAll();
    if (window.renderDailyContent) renderDailyContent();
    if (window.showWeeklySummary) showWeeklySummary();
    if (window.showDailySummary) showDailySummary();
    if (window.showDailyRitual) showDailyRitual();
    if (window.checkConsistency) checkConsistency();
    if (window.checkWeeklyConsistency) checkWeeklyConsistency();
    try {
      const savedCat = S ? S.lastCat : null;
      const savedSub = S ? S.lastSub : null;
      let activeBtn = savedCat ? document.querySelector('.t1-btn[data-cat="' + savedCat + '"]') : null;
      if (!activeBtn) activeBtn = document.querySelector('.t1-btn.active');
      const activeCat = activeBtn ? activeBtn.getAttribute('data-cat') : 'ibadah';
      switchCategory(activeCat, activeBtn);
      if (savedSub) {
        const subBtn = document.querySelector('[data-tab="' + savedSub + '"]');
        if (subBtn) subBtn.click();
      }
    } catch(e) { console.warn('Initial nav render failed:', e); }
  }

  function init() {
    try { resolveCurrentUser(); } catch(e) { console.error('Step 0 resolve user failed:', e); }
    try { S = loadState(); } catch(e) { console.error('Step 1 loadState failed:', e); }
    if (typeof isOnboardingComplete === 'function' && !isOnboardingComplete()) {
      startOnboarding();
    }
    try { applyTheme(); } catch(e) { console.error('Step 2 applyTheme failed:', e); }
    try { initApp(); } catch(e) { console.error('Step 3 initApp failed:', e); }
    try { if (window.initSearch) initSearch(); } catch(e) { console.error('Step 3b initSearch failed:', e); }
    try { if (window.initFAB) initFAB(); } catch(e) { console.error('Step 3c initFAB failed:', e); }
    try { if (window.initPullRefresh) initPullRefresh(); } catch(e) { console.error('Step 3d initPullRefresh failed:', e); }
    try {
      if (window.requestNotificationPermission) requestNotificationPermission();
      if (S.notificationsEnabled && window.scheduleNotifications) scheduleNotifications();
    } catch(e) { console.error('Step 3e notifications init failed:', e); }
    try {
      document.addEventListener('click', (e) => {
        const sr = document.getElementById('globalSearchResults');
        if (sr && !e.target.closest('.global-search-wrap')) sr.classList.remove('show');
      });
    } catch(e) { console.error('Step 6 clickOutside failed:', e); }
    try { initTierTabKeyboardNav(); } catch(e) { console.error('Step 7 tier tab keyboard nav failed:', e); }
    try { initTier2TabKeyboardNav(); } catch(e) { console.error('Step 8 tier2 tab keyboard nav failed:', e); }
    try { populateTier1Icons(); } catch(e) { console.error('Step 8b tier1 icons failed:', e); }
    try { initModalKeyboardHandlers(); } catch(e) { console.error('Step 9 modal keyboard handlers failed:', e); }
    try { initThemeToggleKeyboard(); } catch(e) { console.error('Step 10 theme toggle keyboard failed:', e); }
    try {
      document.addEventListener('keydown', (e) => {
        if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.card-item, .vol-card, .shop-card')) {
          e.preventDefault();
          e.target.click();
        }
      });
    } catch(e) { console.error('Step 11 card keyboard nav failed:', e); }
    window.App = {
      toggleP: window.toggleP, toggleV: window.toggleV, toggleD: window.toggleD, buy,
      detail: (id) => toast(iqIcon('alert-triangle'), DETAILS[id]||'Voluntary Prayer', false, 4000),
      tip: (id) => toast(iqIcon('zap'), TIPS[id]||'A beautiful deed!', false, 4000),
      toggleQuest, addGratitude, toggleFasting, setCharityGoals,
      grantDailyXp, grantCappedDailyXp,
      logWater: typeof window.logWater === 'function' ? window.logWater : () => {},
      logSleep: typeof window.logSleep === 'function' ? window.logSleep : () => {},
      logExercise: typeof window.logExercise === 'function' ? window.logExercise : () => {},
      toggleMeal: typeof window.toggleMeal === 'function' ? window.toggleMeal : () => {},
      addMemorization, toggleMorning, toggleEvening, switchUser, logout, resetAll,
      openMuhasabah: typeof window.openMuhasabah === 'function' ? window.openMuhasabah : () => {},
      dismissMuhasabah: typeof window.dismissMuhasabah === 'function' ? window.dismissMuhasabah : () => {},
      joinJourney: typeof window.joinJourney === 'function' ? window.joinJourney : () => {},
      manualRefresh: window.manualRefreshContent, ensureQuranLoaded: window.ensureQuranLoaded, ensureHadithLoaded: window.ensureHadithLoaded, switchCategory, selectCategory, activateTab,
      claimBonus,
      setQuranView, quranSearchFilter, openQuranSurah, quranBack, openQuranJuz,
      openHadithCollection, openHadithBook, hadithBack,
      playQuranVerse, playSurah, stopSurah, setQuranReciter, playJuz, updateJuzButton,
      calPrevMonth, calNextMonth, calGoToday, selectAvatar, selectTitle, selectFrame,
      setTheme, toggleTheme,
      toggleNotifications: typeof window.toggleNotifications === 'function' ? window.toggleNotifications : () => {},
      switchTab
    };
    window.closeToastOverlay = closeToastOverlay;
    App.switchTab = switchTab;
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
