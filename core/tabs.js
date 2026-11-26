(function() {
  var t = function(k) { return (typeof window !== "undefined" && typeof window.t === "function") ? window.t(k) : k; };
  var _activeCategoryId = null;

  function _escAttr(s){ return String(s).replace(/\\/g,'\\\\').replace(/"/g,'\\"'); }
  function _findByTabId(tabId){
    var esc = _escAttr(tabId);
    // Use escaped selector; fallback to manual scan if selector throws
    try { return document.querySelector('[data-tab="' + esc + '"]'); }
    catch(e){ var els=document.querySelectorAll('[data-tab]'); for(var i=0;i<els.length;i++) if(els[i].getAttribute('data-tab')===tabId) return els[i]; return null; }
  }

  function _pushTabState(catId, tabId) {
    if (tabId) {
      var hash = '#/' + encodeURIComponent(catId) + '/' + encodeURIComponent(tabId);
      history.pushState({ cat: catId, tab: tabId }, '', hash);
    }
  }

  function _findTabBtn(catId, tabId) {
    var group = window.TAB_GROUPS[catId] || [];
    var isCategorized = group.length > 0 && Array.isArray(group[0].tabs);
    if (isCategorized) {
      for (var i = 0; i < group.length; i++) {
        var found = group[i].tabs.find(function(t) { return t.id === tabId; });
        if (found) {
          return { catObj: group[i], tabBtn: _findByTabId(tabId) };
        }
      }
    }
    return { catObj: null, tabBtn: _findByTabId(tabId) };
  }

  function renderDateLine() {
    var el = document.getElementById('dateLine');
    if (!el) return;
    var fmtNum = function(n) { return (typeof window !== 'undefined' && typeof window.iqFormatNum === 'function') ? window.iqFormatNum(n) : String(n); };
    var d = new Date();
    var gMonth = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()];
    var g = fmtNum(d.getDate()) + ' ' + gMonth + ' ' + fmtNum(d.getFullYear());
    var h = '';
    try {
      var hd = window.getAdjustedHijri ? window.getAdjustedHijri(d) : (window.gregorianToHijri ? window.gregorianToHijri(d.getFullYear(), d.getMonth() + 1, d.getDate()) : null);
      if (hd && window.formatHijriLabel) {
        h = window.formatHijriLabel(hd);
      } else if (hd && window.HIJRI_MONTHS) {
        h = fmtNum(hd.day) + ' ' + window.HIJRI_MONTHS[(hd.month - 1) % 12] + ' ' + fmtNum(hd.year);
      }
    } catch (e) {}
    el.textContent = (h && h.trim()) ? (g + ' · ' + h) : g;
  }
  window.renderDateLine = renderDateLine;
    function _updateSegmentHeader(catId, subGroupLabel, tabId) {
    try {
      document.body.setAttribute('data-active-segment', catId);
      var activeTab = tabId || (window.S && window.S.lastSub) || 'today';
      document.body.setAttribute('data-active-tab', activeTab);
      var sph = document.getElementById('segmentPageHeader');
      var sphIcon = document.getElementById('sphIcon');
      var sphTitle = document.getElementById('sphTitle');
      var sphDesc = document.getElementById('sphDesc');
      var backBtn = document.getElementById('iqHeaderBackBtn');
      var menuBtn = document.getElementById('iqMenuBtn');
      if (backBtn && menuBtn) {
        var isHome = (catId === 'ibadah' && activeTab === 'today');
        backBtn.style.display = isHome ? 'none' : 'inline-flex';
        menuBtn.style.display = 'inline-flex';
      }
      if (sph && sphIcon && sphTitle && sphDesc) {
        if (catId === 'ibadah' && activeTab === 'today') {
          sph.style.display = 'none';
        } else {
          sph.style.display = 'flex';
          var tFn = typeof window.t === 'function' ? window.t : function(s){ return s; };
          var subLabelTx = subGroupLabel ? tFn(subGroupLabel) : '';
          var headerMap = {
            ibadah: {
              icon: window.iqIcon('sun') || '🌅',
              title: subLabelTx ? (tFn('Daily') + ' › ' + subLabelTx) : tFn('Daily Ibadah & Adhkar'),
              desc: tFn('Habit tracking, morning & evening remembrance, and prophetic devotions')
            },
            knowledge: {
              icon: window.iqIcon('book-open') || '📖',
              title: subLabelTx ? (tFn('Knowledge') + ' › ' + subLabelTx) : tFn('Islamic Knowledge'),
              desc: tFn("Qur'an, Hadith, Fiqh rulings, character & prophetic wisdom")
            },
            names_main: {
              icon: window.iqIcon('star') || '🌟',
              title: tFn('99 Names & Blessed Figures'),
              desc: tFn('Asma-ul-Husna, Prophets, Sahabah, and righteous classical scholars')
            },
            library: {
              icon: window.iqIcon('landmark') || '📚',
              title: subLabelTx ? (tFn('Library') + ' › ' + subLabelTx) : tFn('Islamic Library'),
              desc: tFn('Dynasties, sacred cities, Islamic architecture, arts & Arabic language')
            },
            profile_main: {
              icon: window.iqIcon('user') || '👤',
              title: tFn('Account & Progress'),
              desc: tFn('Spiritual streaks, achievements, trophies & personal progress')
            }
          };
          var cfg = headerMap[catId] || headerMap.ibadah;
          sphIcon.innerHTML = cfg.icon;
          sphTitle.textContent = cfg.title;
          sphDesc.textContent = cfg.desc;
        }
      }
    } catch(e) {}
  }
  window._updateSegmentHeader = _updateSegmentHeader;

  function _firstTabForCategory(catId) {
    var group = (typeof window !== 'undefined' && window.TAB_GROUPS && window.TAB_GROUPS[catId]) || [];
    if (!group.length) return 'today';
    if (Array.isArray(group[0].tabs) && group[0].tabs.length) return group[0].tabs[0].id;
    return group[0].id || 'today';
  }

  function _syncNavButtons(catId, clickedBtn, selector) {
    document.querySelectorAll(selector || '.bnav-btn').forEach(function(el) {
      var isMatch = el.getAttribute('data-cat') === catId || (!!clickedBtn && el === clickedBtn);
      el.classList.toggle('active', isMatch);
      el.setAttribute('aria-selected', isMatch ? 'true' : 'false');
    });
  }

  function switchCategory(catId, btn) {
    try { renderDateLine(); } catch (e) {}
    document.querySelectorAll('.tab-panel').forEach(function(p) { p.classList.remove('active'); });
    _syncNavButtons(catId, btn, '.bnav-btn');
    if (window.S) { window.S.lastCat = catId; window.saveState(); }
    var group = window.TAB_GROUPS[catId] || [];
    var hasMultipleGroups = group.length > 1 && Array.isArray(group[0].tabs);
    _activeCategoryId = (hasMultipleGroups || (group.length === 1 && Array.isArray(group[0].tabs))) ? group[0].id : null;
    var firstTab = _firstTabForCategory(catId);
    activateTab(firstTab);
    if (typeof window.syncIqDrawer === 'function') window.syncIqDrawer();
    var sc = document.querySelector('.app'); if (sc) sc.scrollTop = 0;
  }

  function selectCategory(catId) {
    _activeCategoryId = catId;
    var currentCat = (window.S && window.S.lastCat) || 'ibadah';
    var currentGroup = window.TAB_GROUPS[currentCat] || [];
    var cat = currentGroup.find(function(c) { return c.id === catId; });
    if (cat && Array.isArray(cat.tabs) && cat.tabs.length > 0) {
      activateTab(cat.tabs[0].id);
      _updateSegmentHeader(currentCat, cat.label, cat.tabs[0].id);
    } else {
      _updateSegmentHeader(currentCat, cat ? cat.label : null);
    }
    if (typeof window.syncIqDrawer === 'function') window.syncIqDrawer();
    var sc = document.querySelector('.app'); if (sc) sc.scrollTop = 0;
  }

  function drillDown(tabId, btn) {
    activateTab(tabId, btn);
  }

  function drillUp() {
    var currentCat = (window.S && window.S.lastCat) || 'ibadah';
    if (typeof window.openIqDrawer === 'function') {
      window.openIqDrawer(currentCat);
    }
  }

  function getSectionPanels(sectionName) {
    var sections = (typeof window !== 'undefined' && window.PANEL_SECTIONS) || {};
    return sections[sectionName] || null;
  }

  function findCategoryForTab(tabId) {
    if (tabId === 'gallery') return 'profile_main';
    if (typeof window === 'undefined' || !window.TAB_GROUPS) return null;
    var cats = Object.keys(window.TAB_GROUPS);
    for (var i = 0; i < cats.length; i++) {
      var cat = cats[i];
      var groups = window.TAB_GROUPS[cat];
      if (!Array.isArray(groups)) continue;
      for (var j = 0; j < groups.length; j++) {
        var item = groups[j];
        if (item.id === tabId) return cat;
        if (Array.isArray(item.tabs)) {
          for (var k = 0; k < item.tabs.length; k++) {
            if (item.tabs[k].id === tabId) return cat;
          }
        }
      }
    }
    return null;
  }

  function activateTab(tabId, btn) {
    document.querySelectorAll('.iq-drawer-tab').forEach(function(b) {
      var match = b.getAttribute('data-tab') === tabId;
      b.classList.toggle('active', match);
      b.setAttribute('aria-selected', match ? 'true' : 'false');
      if (match) b.setAttribute('aria-current', 'page');
      else b.removeAttribute('aria-current');
    });
    if (btn && btn.classList) {
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
    }
    if (window.S) { window.S.lastSub = tabId; window.saveState(); }
    document.body.setAttribute('data-active-tab', tabId);
    var currentCat = (window.S && window.S.lastCat) || 'ibadah';
    var ownerCat = findCategoryForTab(tabId);
    if (ownerCat && ownerCat !== currentCat) {
      currentCat = ownerCat;
      if (window.S) { window.S.lastCat = currentCat; window.saveState(); }
    }
    _syncNavButtons(currentCat);
    var catGroups = window.TAB_GROUPS[currentCat] || [];
    var activeGrp = null;
    if (Array.isArray(catGroups)) {
      for (var gi = 0; gi < catGroups.length; gi++) {
        if (catGroups[gi].tabs && catGroups[gi].tabs.some(function(tb) { return tb.id === tabId; })) {
          activeGrp = catGroups[gi];
          break;
        }
      }
    }
    _updateSegmentHeader(currentCat, activeGrp ? activeGrp.label : null, tabId);
    if (typeof window.syncIqDrawer === 'function') window.syncIqDrawer();
    if (!window._hashNavigating) {
      if (currentCat) _pushTabState(currentCat, tabId);
    }
    var sectionName = null;
    var sections = (typeof window !== 'undefined' && window.PANEL_SECTIONS) || {};
    var target = 'panel-' + tabId;
    for (var sec in sections) {
      if (sections[sec].indexOf(target) > -1) { sectionName = sec; break; }
    }
    // Global panel clear: always hide every panel first.
    // Previous section-aware clear broke cross-section tabs (e.g. panel-quran
    // belongs to both 'home' and 'knowledge_quran' — switching sections left
    // stale panels visible).
    document.querySelectorAll('.tab-panel').forEach(function(p) { p.classList.remove('active'); });
    var panel = document.getElementById('panel-' + tabId);
    if (panel) panel.classList.add('active');
    var _lazyRender = {
      today:'renderToday', quests:'renderQ', journeys:'renderJourneys',
      profile:'renderProfile', trophies:'renderAch', progress:'renderProg', gallery:'renderComponentGallery',
      rewards:'renderShop', duas:'renderDuas', growth:'renderSpiritualGrowthTab',
      quran:'renderQuran', hadith:'renderHadith', sunnahs:'renderSunnahs', dhikr:'renderDhikr',
      stories:'renderStories', inspirations:'renderInspirations', gratitude:'renderGratitude',
      allah_names:'renderNames', scholars_names:'renderScholars',
      fasting:'renderFasting', charity:'renderCharity', memorization:'renderMemorization', healthlog:'renderHealthLog',
      morning:'renderMorning', evening:'renderEvening', sins:'renderSins', punishments:'renderPunishments',
      repentance:'renderRepentance', sahaba:'renderSahaba', seerah:'renderSeerah', tafsir:'renderTafsir',
      manners:'renderManners', family:'renderFamily', health:'renderHealth', finance:'renderFinance',
      // NOTE: finance pool + finance tracker both render below (single key;
      // a duplicate `finance:` key here previously shadowed renderFinance).
      ummah:'renderUmmah', hajj:'renderHajj', akhirah:'renderAkhirah', prophets:'renderProphets',
      women:'renderWomen', heart:'renderHeart', marriage:'renderMarriage', science:'renderScience',
      wudu:'renderWudu', patience:'renderPatience', work:'renderWork',
      community:'renderCommunity', environment:'renderEnvironment', travel:'renderTravel',
      fiqh:'renderFiqh', arabic:'renderArabic', tawakkul:'renderTawakkul', ikhlas:'renderIkhlas',
      zuhd:'renderZuhd', dawah:'renderDawah', battles:'renderBattles', jannah:'renderJannah',
      jahannam:'renderJahannam', grave:'renderGrave', signs:'renderSigns', dreams:'renderDreams',
      parenting:'renderParenting', food:'renderFood', tibb:'renderTibb', youth:'renderYouth',
      tech:'renderTech', neighbors:'renderNeighbors', salah:'renderSalah',
      aqeedah:'renderAqeedah', civilisation:'renderCivilisation', jumuah:'renderJumuah',
      umayyads:'renderUmayyads', abbasids:'renderAbbasids', andalus:'renderAndalus',
      ottomans:'renderOttomans', mamluks:'renderMamluks', seljuks:'renderSeljuks',
      fatimids:'renderFatimids', ayyubids:'renderAyyubids', modernhist:'renderModernhist',
      ancientprophets:'renderAncientprophets',
      keys:'renderKeys', mosque:'renderMosque', ramadan:'renderRamadan', laylat:'renderLaylat',
      situational:'renderSituationalDhikr', extradeeds:'renderExtraDeeds', volprayers:'renderVolPrayers',
      timer:'renderPrayerTimes', stats:'renderStats', goals:'renderPersonalGoals', zakatcalc:'renderZakatCalc',
      virtues:'renderVirtues', 'vices-return':'renderVicesreturn', 'character-path':'renderCharacterpath',
      'worship-rulings':'renderWorshiprulings', 'wealth-oaths':'renderWealthoaths', 'family-life':'renderFamilylife',
      service:'renderService', 'work-justice':'renderWorkjustice', wellness:'renderWellness',
      'earth-living':'renderEarthliving', 'youth-tech':'renderYouthtech', 'ethics-finance':'renderEthicsfinance',
      'holy-cities':'renderHolycities', capitals:'renderCapitals', east:'renderEast', pattern:'renderPattern',
      'sacred-space':'renderSacredspace', 'living-crafts':'renderLivingcrafts', word:'renderWord',
      structure:'renderStructure', 'sound-script':'renderSoundscript', 'words-poetry':'renderWordspoetry',
      being:'renderBeing', knowing:'renderKnowing', 'will-evil':'renderWillevil'
    };
    // Release the prayer-countdown interval when leaving the Timer tab so it
    // does not keep ticking in the background (Phase 3 leak fix).
    if (tabId !== 'timer' && typeof window.stopPrayerTimer === 'function') {
      window.stopPrayerTimer();
    }
    if (_lazyRender[tabId] && window[_lazyRender[tabId]]) {
      try { window[_lazyRender[tabId]](); } catch(e) { console.warn('Lazy render ' + tabId + ' failed:', e.message); }
    }
    // Finance tab owns two renderers: the static pool (renderFinance) via
    // _lazyRender above plus the interactive tracker (renderFinanceTab).
    if (tabId === 'finance' && typeof window.renderFinanceTab === 'function') {
      try { window.renderFinanceTab(); } catch(e) { console.warn('Lazy render financeTab failed:', e.message); }
    }
    // Journeys panel owns two areas: journeyArea (renderJourneys, deferred)
    // plus boatArea (renderBoat, deferred). Both guards tolerate the
    // not-yet-loaded case; the post-defer hook covers first paint.
    if (tabId === 'journeys' && typeof window.renderBoat === 'function') {
      try { window.renderBoat(); } catch(e) { console.warn('Lazy render boat failed:', e.message); }
    }
    if (tabId === 'hadith' && typeof HADITH_COLLECTIONS_DATA === 'undefined') {
      if (typeof window.ensureHadithLoaded === 'function') {
        window.ensureHadithLoaded().then(function() { if (window.renderHadith) window.renderHadith(); }).catch(function() {});
      }
    }
  }

  function switchTab(name) {
    if (window.S) window.S.lastTab = name;
    if (window.S) window.saveState();
    var content = document.getElementById('mainContent');
    if (content) { content.classList.add('fading'); setTimeout(function() { content.classList.remove('fading'); }, 60); }
    renderTab(name);
  }

  function renderTab(name) {
    var panelMap = {
      home: 'panel-today',
      quests: 'panel-quests',
      stats: 'panel-stats',
      growth: 'panel-growth',
      profile: 'panel-profile'
    };
    document.querySelectorAll('.tab-panel').forEach(function(p) { p.classList.remove('active'); });
    var panelId = panelMap[name] || 'panel-today';
    var panel = document.getElementById(panelId);
    if (panel) panel.classList.add('active');
    if (name === 'home') {
      if (window.renderPrayers) window.renderPrayers();
      if (window.renderVol) window.renderVol();
      if (window.renderDeeds) window.renderDeeds();
      if (window.renderBonus) window.renderBonus();
      if (window.renderTopBar) window.renderTopBar();
    } else if (name === 'quests') {
      if (window.renderQ) window.renderQ();
      if (window.renderAch) window.renderAch();
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
      if (window.renderProfile) window.renderProfile();
      if (window.renderKeys) window.renderKeys();
      if (window.renderMosque) window.renderMosque();
    }
    if (window.updateTopBar) window.updateTopBar();
  }

  function updateTopBar() {
    if (window.renderTopBar) window.renderTopBar();
  }

  function initBnavKeyboardNav() {
    var bnav = document.getElementById('bnav');
    if (!bnav) return;
    bnav.addEventListener('keydown', function(e) {
      var tabs = Array.from(bnav.querySelectorAll('.bnav-btn'));
      if (tabs.length === 0) return;
      var currentIndex = tabs.findIndex(function(tb) { return tb.classList.contains('active'); });
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        var nextIndex = (currentIndex + 1) % tabs.length;
        tabs[nextIndex].focus();
        tabs[nextIndex].click();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        var prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
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
    document.querySelectorAll('.bnav-btn').forEach(function(btn) {
      var span = btn.querySelector('.bnav-icon');
      if (!span || span.childElementCount > 0) return;
      var cat = btn.getAttribute('data-cat');
      if (!cat) return;
      var icon = window.iqIcon(cat);
      if (icon) span.innerHTML = icon;
    });
  }

  window._pushTabState = _pushTabState;
  window._findTabBtn = _findTabBtn;
  window.switchCategory = switchCategory;
  window.selectCategory = selectCategory;
  window.getSectionPanels = getSectionPanels;
  window.activateTab = activateTab;
  window.drillDown = drillDown;
  window.drillUp = drillUp;
  window.switchTab = switchTab;
  window.renderTab = renderTab;
  window.initBnavKeyboardNav = initBnavKeyboardNav;
  window.populateTier1Icons = populateTier1Icons;

  document.addEventListener('DOMContentLoaded', function() {
    try { populateTier1Icons(); } catch(e) { console.error('bnav icons refill failed:', e); }
  });
})();