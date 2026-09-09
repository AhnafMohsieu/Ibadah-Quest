(function() {
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
    var d = new Date();
    var g = d.getDate() + ' ' + ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()] + ' ' + d.getFullYear();
    var h = '';
    try {
      if (window.gregorianToHijri && window.HIJRI_MONTHS) {
        var hd = window.gregorianToHijri(d.getFullYear(), d.getMonth() + 1, d.getDate());
        if (hd) h = hd.day + ' ' + window.HIJRI_MONTHS[hd.month - 1] + ' ' + hd.year;
      }
    } catch (e) {}
    el.textContent = h ? (g + ' · ' + h) : g;
  }
  window.renderDateLine = renderDateLine;
  function switchCategory(catId, btn) {
    try { renderDateLine(); } catch (e) {}
    document.querySelectorAll('.t1-btn').forEach(function(el) {
      el.classList.remove('active');
      el.setAttribute('aria-selected', 'false');
    });
    document.querySelectorAll('.bnav-btn').forEach(function(el) {
      el.classList.remove('active');
      el.setAttribute('aria-selected', 'false');
    });
    if (btn) {
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
    }
    var bnavMatch = (function(cid){ try { return document.querySelector('.bnav-btn[data-cat="' + _escAttr(cid) + '"]'); } catch(e){ var els=document.querySelectorAll('.bnav-btn'); for(var i=0;i<els.length;i++) if(els[i].getAttribute('data-cat')===cid) return els[i]; return null; } })(catId);
    if (bnavMatch) {
      bnavMatch.classList.add('active');
      bnavMatch.setAttribute('aria-selected', 'true');
    }
    var t1Match = (function(cid){ try { return document.querySelector('.t1-btn[data-cat="' + _escAttr(cid) + '"]'); } catch(e){ var els=document.querySelectorAll('.t1-btn'); for(var i=0;i<els.length;i++) if(els[i].getAttribute('data-cat')===cid) return els[i]; return null; } })(catId);
    if (t1Match) {
      t1Match.classList.add('active');
      t1Match.setAttribute('aria-selected', 'true');
    }
    if (window.S) { window.S.lastCat = catId; window.saveState(); }
    var group = window.TAB_GROUPS[catId] || [];
    var container = document.getElementById('tier2Tabs');
    var tier3Wrap = document.getElementById('tier3Wrap');
    var isCategorized = group.length > 0 && Array.isArray(group[0].tabs);
    if (isCategorized) {
      _activeCategoryId = null;
      container.classList.add('cat-chips');
      container.innerHTML = group.map(function(c, i) {
        return `<button class="cat-chip ${i === 0 ? 'active' : ''}" onclick="window.selectCategory('${c.id}', this)"><span>${window.iqIcon(c.icon || c.id)}</span> ${t(c.label)}</button>`;
      }).join('');
      if (tier3Wrap) tier3Wrap.style.display = '';
      var firstCat = group[0];
      _activeCategoryId = firstCat.id;
      renderCategoryTabs(firstCat);
    } else {
      container.classList.remove('cat-chips');
      container.innerHTML = group.map(function(p, i) {
        return `<button data-tab="${p.id}" class="t2-btn ${i === 0 ? 'active' : ''}" onclick="window.activateTab('${p.id}', this)"><span>${window.iqIcon(p.icon || p.id)}</span> ${t(p.label)}</button>`;
      }).join('');
      if (tier3Wrap) tier3Wrap.style.display = 'none';
      if (group.length > 0) activateTab(group[0].id, container.firstElementChild);
    }
  }

  function selectCategory(catId, btn) {
    document.querySelectorAll('.cat-chip').forEach(function(el) { el.classList.remove('active'); });
    if (btn) btn.classList.add('active');
    _activeCategoryId = catId;
    var group = Object.values(window.TAB_GROUPS).find(function(g) {
      return Array.isArray(g[0] && g[0].tabs) && g.some(function(c) { return c.id === catId; });
    }) || [];
    var cat = group.find(function(c) { return c.id === catId; });
    if (cat) renderCategoryTabs(cat);
  }

  function renderCategoryTabs(cat) {
    var grid = document.getElementById('tier3Tabs');
    if (!grid) return;
    grid.dataset.cat = cat.id;
    grid.innerHTML = cat.tabs.map(function(p, i) {
      return `<button data-tab="${p.id}" class="t2-btn ${i === 0 ? 'active' : ''}" onclick="window.activateTab('${p.id}', this)"><span>${window.iqIcon(p.icon || p.id)}</span> ${t(p.label)}</button>`;
    }).join('');
    if (cat.tabs.length > 0) activateTab(cat.tabs[0].id, grid.firstElementChild);
  }

  function getSectionPanels(sectionName) {
    var sections = (typeof window !== 'undefined' && window.PANEL_SECTIONS) || {};
    return sections[sectionName] || null;
  }

  function activateTab(tabId, btn) {
    document.querySelectorAll('.t2-btn').forEach(function(b) { b.classList.remove('active'); });
    if (btn) btn.classList.add('active');
    if (window.S) { window.S.lastSub = tabId; window.saveState(); }
    if (!window._hashNavigating) {
      var catEl = document.querySelector('.t1-btn.active');
      var catId = catEl ? catEl.getAttribute('data-cat') : null;
      if (catId) _pushTabState(catId, tabId);
    }
    var sectionName = null;
    var sections = (typeof window !== 'undefined' && window.PANEL_SECTIONS) || {};
    var target = 'panel-' + tabId;
    for (var sec in sections) {
      if (sections[sec].indexOf(target) > -1) { sectionName = sec; break; }
    }
    var sectionPanels = sectionName ? getSectionPanels(sectionName) : null;
    // Single section-aware clear (was: section clear + unconditional global
    // clear, doubling DOM thrash and causing tab-switch flicker).
    if (sectionPanels) {
      sectionPanels.forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.classList.remove('active');
      });
    } else {
      document.querySelectorAll('.tab-panel').forEach(function(p) { p.classList.remove('active'); });
    }
    var panel = document.getElementById('panel-' + tabId);
    if (panel) panel.classList.add('active');
    var _lazyRender = {
      today:'renderToday', quests:'renderQ', journeys:'renderJourneys',
      profile:'renderProfile', trophies:'renderAch', progress:'renderProg',
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

  function initTierTabKeyboardNav() {
    var tier1Tabs = document.querySelector('.tier1-tabs');
    if (!tier1Tabs) return;
    tier1Tabs.addEventListener('keydown', function(e) {
      var tabs = Array.from(tier1Tabs.querySelectorAll('.t1-btn'));
      var currentIndex = tabs.findIndex(function(t) { return t.classList.contains('active'); });
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

  function initTier2TabKeyboardNav() {
    var tier2Tabs = document.getElementById('tier2Tabs');
    if (!tier2Tabs) return;
    tier2Tabs.addEventListener('keydown', function(e) {
      var tabs = Array.from(tier2Tabs.querySelectorAll('.t2-btn, .cat-chip'));
      if (tabs.length === 0) return;
      var currentIndex = tabs.findIndex(function(t) { return t.classList.contains('active'); });
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

  function initBnavKeyboardNav() {
    var bnav = document.getElementById('bnav');
    if (!bnav) return;
    bnav.addEventListener('keydown', function(e) {
      var tabs = Array.from(bnav.querySelectorAll('.bnav-btn'));
      if (tabs.length === 0) return;
      var currentIndex = tabs.findIndex(function(t) { return t.classList.contains('active'); });
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
    var buttons = document.querySelectorAll('.t1-btn');
    buttons.forEach(function(btn) {
      var span = btn.querySelector('.iq-inline');
      if (!span || span.childElementCount > 0) return;
      var cat = btn.getAttribute('data-cat');
      if (!cat) return;
      var icon = window.iqIcon(cat);
      if (icon) span.innerHTML = icon;
    });
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
  window.renderCategoryTabs = renderCategoryTabs;
  window.getSectionPanels = getSectionPanels;
  window.activateTab = activateTab;
  window.switchTab = switchTab;
  window.renderTab = renderTab;
  window.initTierTabKeyboardNav = initTierTabKeyboardNav;
  window.initTier2TabKeyboardNav = initTier2TabKeyboardNav;
  window.initBnavKeyboardNav = initBnavKeyboardNav;
  window.populateTier1Icons = populateTier1Icons;

  document.addEventListener('DOMContentLoaded', function() {
    try { populateTier1Icons(); } catch(e) { console.error('bnav icons refill failed:', e); }
  });
})();