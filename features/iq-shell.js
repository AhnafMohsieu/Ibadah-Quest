// features/iq-shell.js — Option 3 Restructured Feed, Drawers & Slide-Over Sheets
(function() {
  var _stopwatchSec = 0;
  var _stopwatchTimer = null;
  var _stopwatchRunning = false;
  var _activeFocusId = 'dhikr';
  var _drawerCat = null;
  var _drawerQuery = '';
  var _drawerDirty = true;
  var _lastDrawerSig = '';

  var DRAWER_CATS = [
    { id: 'ibadah', label: 'Daily', icon: 'ibadah' },
    { id: 'knowledge', label: 'Knowledge', icon: 'knowledge' },
    { id: 'names_main', label: 'Names', icon: 'names_main' },
    { id: 'library', label: 'Library', icon: 'library' },
    { id: 'profile_main', label: 'Profile', icon: 'profile_main' }
  ];

  function tLabel(k) {
    return (typeof window !== 'undefined' && typeof window.t === 'function') ? window.t(k) : k;
  }

  function todayStr() {
    if (typeof today === 'function') return today();
    if (typeof window !== 'undefined' && typeof window.today === 'function') return window.today();
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function esc(val) {
    var s = String(val == null ? '' : val);
    return (typeof window !== 'undefined' && typeof window.escapeHTML === 'function')
      ? window.escapeHTML(s)
      : s;
  }

  function icon(key) {
    return (typeof iqIcon === 'function') ? iqIcon(key) : '';
  }

  function computeDailyChallenges(state, dateKey) {
    var s = state || (typeof S !== 'undefined' ? S : {}) || {};
    var dk = dateKey || todayStr();
    var goals = (s.dailyChallengeGoals && typeof s.dailyChallengeGoals === 'object')
      ? s.dailyChallengeGoals
      : { dhikr: 500, quranMinutes: 20, prayers: 5 };
    var dayLog = (s.log && s.log[dk]) || { p: {}, v: {}, d: {} };
    var prayersDone = Object.values(dayLog.p || {}).filter(Boolean).length;
    var prayersTotal = (typeof PRAYERS !== 'undefined' && Array.isArray(PRAYERS) && PRAYERS.length) ? PRAYERS.length : (Number(goals.prayers) || 5);
    var prayersPct = Math.min(100, Math.round((prayersDone / Math.max(1, prayersTotal)) * 100));

    var dhikrDay = (s.dhikrStats && s.dhikrStats.daily && s.dhikrStats.daily[dk]) || {};
    var dhikrToday = Object.values(dhikrDay).reduce(function(acc, n) { return acc + (Number(n) || 0); }, 0);
    var dhikrGoal = Number(goals.dhikr) || 500;
    var dhikrPct = Math.min(100, Math.round((dhikrToday / Math.max(1, dhikrGoal)) * 100));

    var quranGoal = Number(goals.quranMinutes) || 20;
    var quranTracked = Array.isArray(s.quranIdx) ? s.quranIdx.length : 0;
    var quranToday = Math.min(quranGoal, quranTracked);
    var quranPct = Math.min(100, Math.round((quranToday / Math.max(1, quranGoal)) * 100));

    var volDone = Object.values(dayLog.v || {}).filter(Boolean).length;
    var volTotal = (typeof VOLUNTARY !== 'undefined' && Array.isArray(VOLUNTARY) && VOLUNTARY.length) ? VOLUNTARY.length : 20;

    var deedsDone = Object.values(dayLog.d || {}).filter(Boolean).length;
    var deedsTotal = (typeof DEEDS !== 'undefined' && Array.isArray(DEEDS) && DEEDS.length) ? DEEDS.length : 50;

    var questsArr = Array.isArray(s.dq) ? s.dq : [];
    var questsDone = questsArr.filter(function(q) { return q && q.done; }).length;
    var questsTotal = questsArr.length;
    var questsPct = questsTotal ? Math.min(100, Math.round((questsDone / questsTotal) * 100)) : 0;

    var checkIns = Array.isArray(s.masjidCheckIns) ? s.masjidCheckIns : [];
    var masjidTotal = checkIns.length;
    var masjidToday = checkIns.filter(function(m) { return m && m.date === dk; }).length;

    var overallPct = Math.round((prayersPct + dhikrPct + quranPct) / 3);

    return {
      prayersDone: prayersDone,
      prayersTotal: prayersTotal,
      prayersPct: prayersPct,
      dhikrToday: dhikrToday,
      dhikrGoal: dhikrGoal,
      dhikrPct: dhikrPct,
      quranTracked: quranTracked,
      quranToday: quranToday,
      quranGoal: quranGoal,
      quranPct: quranPct,
      volDone: volDone,
      volTotal: volTotal,
      deedsDone: deedsDone,
      deedsTotal: deedsTotal,
      questsDone: questsDone,
      questsTotal: questsTotal,
      questsPct: questsPct,
      masjidTotal: masjidTotal,
      masjidToday: masjidToday,
      overallPct: overallPct
    };
  }

  function renderIqFeed() {
    if (typeof document === 'undefined') return;
    var summary = computeDailyChallenges();

    var heroEl = document.getElementById('iqHeroChallenge');
    if (heroEl) {
      heroEl.innerHTML =
        '<div class="iq-hero-ch-top">' +
          '<span class="iq-hero-ch-title">Daily challenges</span>' +
          '<button type="button" class="iq-hero-ch-link" onclick="window.openChallengeDetail(\'dhikr\')">Details &rsaquo;</button>' +
        '</div>' +
        '<div class="iq-hero-ch-card" role="button" tabindex="0" onclick="window.openChallengeDetail(\'dhikr\')">' +
          '<div class="iq-hero-ch-row">' +
            '<strong>Dhikr Counter</strong>' +
            '<span>' + summary.dhikrToday + ' / ' + summary.dhikrGoal + '</span>' +
          '</div>' +
          '<div class="iq-dual-bar">' +
            '<div class="iq-dual-teal" style="width:' + summary.dhikrPct + '%"></div>' +
            '<div class="iq-dual-gold" style="width:' + Math.min(100 - summary.dhikrPct, Math.round(summary.prayersPct * 0.35)) + '%"></div>' +
          '</div>' +
          '<div class="iq-hero-ch-meta">' +
            '<span>' + summary.dhikrPct + '% Progress</span>' +
            '<span>Prayers ' + summary.prayersDone + '/' + summary.prayersTotal + '</span>' +
          '</div>' +
        '</div>';
    }

    var feedEl = document.getElementById('iqFeedArea');
    if (feedEl) {
      var cards = [
        {
          id: 'dhikr',
          tone: 'teal',
          icon: 'beads',
          title: 'Dhikr Counter',
          sub: summary.dhikrToday + ' of ' + summary.dhikrGoal + ' daily tasbih',
          pct: summary.dhikrPct,
          onclick: "window.openChallengeDetail('dhikr')"
        },
        {
          id: 'quran',
          tone: 'gold',
          icon: 'book-open',
          title: 'Quran Reading Goal',
          sub: summary.quranToday + ' / ' + summary.quranGoal + ' ayah milestones',
          pct: summary.quranPct,
          onclick: "App.activateTab('quran')"
        },
        {
          id: 'masjid',
          tone: 'mint',
          icon: 'mosque',
          title: 'Masjid Check-ins',
          sub: summary.masjidToday > 0 ? (summary.masjidToday + ' visit(s) today · ' + summary.masjidTotal + ' total') : (summary.masjidTotal + ' total masjid visit(s)'),
          pct: null,
          onclick: "window.openMasjidCheckins('map')"
        },
        {
          id: 'quests',
          tone: 'cyan',
          icon: 'scroll',
          title: 'Daily Quests',
          sub: summary.questsDone + ' / ' + summary.questsTotal + ' quests complete',
          pct: summary.questsPct,
          onclick: "App.activateTab('quests')"
        },
        {
          id: 'vol',
          tone: 'teal',
          icon: 'moon',
          title: 'Voluntary Prayers',
          sub: summary.volDone + ' / ' + summary.volTotal + ' logged today',
          pct: null,
          onclick: "window.openChallengeDetail('vol')"
        },
        {
          id: 'deeds',
          tone: 'gold',
          icon: 'sparkles',
          title: 'Extra Good Deeds',
          sub: summary.deedsDone + ' / ' + summary.deedsTotal + ' completed today',
          pct: null,
          onclick: "window.openChallengeDetail('deeds')"
        }
      ];

      feedEl.innerHTML =
        '<div class="iq-feed-head">' +
          '<span>Daily challenges</span>' +
          '<button type="button" class="iq-text-btn" onclick="window.openChallengeDetail(\'dhikr\')">Show All</button>' +
        '</div>' +
        '<div class="iq-feed-list">' +
        cards.map(function(c) {
          var right = c.pct !== null
            ? '<div class="iq-ch-progress-col"><div class="iq-mini-bar"><span style="width:' + c.pct + '%"></span></div><span class="iq-pct-label">' + c.pct + '%</span></div>'
            : '<span class="iq-chevron">&rsaquo;</span>';
          return '<div class="iq-challenge-card" role="button" tabindex="0" onclick="' + c.onclick + '">' +
            '<div class="iq-ch-icon ' + c.tone + '">' + icon(c.icon) + '</div>' +
            '<div class="iq-ch-body">' +
              '<div class="iq-ch-title">' + esc(c.title) + '</div>' +
              '<div class="iq-ch-sub">' + esc(c.sub) + '</div>' +
            '</div>' +
            right +
          '</div>';
        }).join('') +
        '</div>';
    }
  }

  function formatStopwatch(sec) {
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return m + ':' + String(s).padStart(2, '0');
  }

  function toggleChallengeStopwatch() {
    if (_stopwatchRunning) {
      _stopwatchRunning = false;
      if (_stopwatchTimer) { clearInterval(_stopwatchTimer); _stopwatchTimer = null; }
    } else {
      _stopwatchRunning = true;
      _stopwatchTimer = setInterval(function() {
        _stopwatchSec++;
        var tEl = document.getElementById('iqChallengeStopwatch');
        if (tEl) tEl.textContent = formatStopwatch(_stopwatchSec);
      }, 1000);
    }
    var btn = document.getElementById('iqStopwatchBtn');
    if (btn) btn.textContent = _stopwatchRunning ? 'Pause' : 'Start';
  }

  function quickChallengeAction(type) {
    if (type === 'dhikr1' && typeof window.tapDhikr === 'function') {
      window.tapDhikr();
    } else if (type === 'dhikr33' && typeof window.tapDhikr === 'function') {
      for (var i = 0; i < 33; i++) window.tapDhikr();
    } else if (type === 'quran' && typeof window.activateTab === 'function') {
      closeChallengeDetail();
      window.activateTab('quran');
      return;
    } else if (type === 'quests' && typeof window.activateTab === 'function') {
      closeChallengeDetail();
      window.activateTab('quests');
      return;
    } else if (type === 'masjid' && typeof window.openMasjidCheckins === 'function') {
      window.openMasjidCheckins('map');
      return;
    } else if (type === 'vol' || type === 'deeds') {
      closeChallengeDetail();
      var details = document.getElementById('iqAllActsDetails');
      if (details) {
        details.open = true;
        if (typeof details.scrollIntoView === 'function') details.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }
    renderIqFeed();
    renderChallengeDetailBody(_activeFocusId);
  }

  function renderChallengeDetailBody(focusId) {
    if (typeof document === 'undefined') return;
    var bodyEl = document.getElementById('iqChallengeBody');
    if (!bodyEl) return;
    var summary = computeDailyChallenges();

    var metricNum = summary.dhikrToday;
    var metricPct = summary.dhikrPct;
    var metricLabel = 'Dhikr Progress';
    if (focusId === 'prayers') {
      metricNum = summary.prayersDone + '/' + summary.prayersTotal;
      metricPct = summary.prayersPct;
      metricLabel = 'Prayers Today';
    } else if (focusId === 'vol') {
      metricNum = summary.volDone;
      metricPct = Math.min(100, Math.round((summary.volDone / Math.max(1, summary.volTotal)) * 100));
      metricLabel = 'Voluntary Acts';
    } else if (focusId === 'deeds') {
      metricNum = summary.deedsDone;
      metricPct = Math.min(100, Math.round((summary.deedsDone / Math.max(1, summary.deedsTotal)) * 100));
      metricLabel = 'Good Deeds';
    }

    var radius = 45;
    var circ = 2 * Math.PI * radius;
    var offset = circ - (metricPct / 100) * circ;

    var rows = [
      { title: 'Dhikr Tap (+1)', sub: summary.dhikrToday + ' / ' + summary.dhikrGoal + ' completed', btn: 'Progress', act: 'dhikr1', icon: 'beads' },
      { title: 'Tasbih Cycle (+33)', sub: 'Complete a full 33-count dhikr set', btn: 'Start', act: 'dhikr33', icon: 'sparkles' },
      { title: 'Quran Reading', sub: summary.quranToday + ' / ' + summary.quranGoal + ' daily milestones', btn: 'Open', act: 'quran', icon: 'book-open' },
      { title: 'Masjid Check-ins', sub: summary.masjidTotal + ' visit(s) logged', btn: 'Map', act: 'masjid', icon: 'mosque' },
      { title: 'Voluntary & Deeds', sub: (summary.volDone + summary.deedsDone) + ' completed today', btn: 'Show All', act: 'vol', icon: 'heart' }
    ];

    bodyEl.innerHTML =
      '<div class="iq-ring-hero-card">' +
        '<div class="iq-ring-wrap">' +
          '<svg class="iq-progress-ring" viewBox="0 0 110 110" width="110" height="110" aria-hidden="true">' +
            '<circle class="iq-ring-track" cx="55" cy="55" r="' + radius + '"/>' +
            '<circle class="iq-ring-fill" cx="55" cy="55" r="' + radius + '" stroke-dasharray="' + circ.toFixed(2) + '" stroke-dashoffset="' + offset.toFixed(2) + '"/>' +
          '</svg>' +
          '<div class="iq-ring-center"><strong>' + esc(metricNum) + '</strong><span>' + esc(metricLabel) + '</span></div>' +
        '</div>' +
        '<div class="iq-timer-box">' +
          '<div class="iq-timer-val" id="iqChallengeStopwatch">' + formatStopwatch(_stopwatchSec) + '</div>' +
          '<div class="iq-timer-sub">Focus Session</div>' +
          '<button type="button" id="iqStopwatchBtn" class="iq-pill-btn" onclick="window.toggleChallengeStopwatch()">' + (_stopwatchRunning ? 'Pause' : 'Start') + '</button>' +
        '</div>' +
      '</div>' +
      '<div class="iq-feed-head"><span>Daily challenges</span><span>' + summary.overallPct + '% overall</span></div>' +
      '<div class="iq-feed-list">' +
      rows.map(function(r) {
        return '<div class="iq-challenge-card">' +
          '<div class="iq-ch-icon teal">' + icon(r.icon) + '</div>' +
          '<div class="iq-ch-body"><div class="iq-ch-title">' + esc(r.title) + '</div><div class="iq-ch-sub">' + esc(r.sub) + '</div></div>' +
          '<button type="button" class="iq-pill-btn" onclick="window.quickChallengeAction(\'' + r.act + '\')">' + esc(r.btn) + '</button>' +
        '</div>';
      }).join('') +
      '</div>';
  }

  function openChallengeDetail(focusId) {
    closeActiveSheet();
    _activeFocusId = focusId || 'dhikr';
    renderChallengeDetailBody(_activeFocusId);
    if (typeof document === 'undefined') return;
    var sheet = document.getElementById('iqChallengeSheet');
    if (sheet) {
      sheet.classList.add('open');
      sheet.setAttribute('aria-hidden', 'false');
    }
    if (document.body) document.body.classList.add('iq-sheet-open');
  }

  function closeChallengeDetail() {
    if (_stopwatchTimer) { clearInterval(_stopwatchTimer); _stopwatchTimer = null; _stopwatchRunning = false; }
    if (typeof document === 'undefined') return;
    var sheet = document.getElementById('iqChallengeSheet');
    if (sheet) {
      sheet.classList.remove('open');
      sheet.setAttribute('aria-hidden', 'true');
    }
    if (document.body) document.body.classList.remove('iq-sheet-open');
  }

  function drawerPoolCount(tab) {
    try {
      var count = 0;
      if (tab.poolKeys) {
        tab.poolKeys.forEach(function(k) {
          var p = (typeof window !== 'undefined' && window[k]) || (typeof NEW_POOLS !== 'undefined' && NEW_POOLS[k]);
          if (p && p.length) count += p.length;
        });
        return count;
      }
      var key = tab.poolKey || (tab.id ? tab.id.toUpperCase() + '_POOL' : '');
      var pool = (key && typeof window !== 'undefined') ? window[key] : null;
      if (!pool && typeof NEW_POOLS !== 'undefined') pool = NEW_POOLS[tab.id];
      if (pool && pool.length) count = pool.length;
      return count;
    } catch (e) {
      return 0;
    }
  }

  function renderDrawerTabTile(tab, activeTab, badgeCatLabel) {
    var isAct = tab.id === activeTab;
    var count = drawerPoolCount(tab);
    var subText = badgeCatLabel
      ? badgeCatLabel + (count ? ' · ' + count + ' entries' : '')
      : (tab.desc || (count ? count + ' entries' : ''));
    return '<button type="button" data-tab="' + esc(tab.id) + '" class="iq-drawer-tab' + (isAct ? ' active' : '') + '" onclick="window.drawerNavigate && window.drawerNavigate(\'' + esc(tab.id) + '\')">' +
      '<span class="iq-drawer-tab-icon">' + icon(tab.icon || tab.id) + '</span>' +
      '<span class="iq-drawer-tab-meta">' +
        '<span class="iq-drawer-tab-label">' + esc(tLabel(tab.label)) + '</span>' +
        (subText ? '<span class="iq-drawer-tab-desc">' + esc(subText) + '</span>' : '') +
      '</span>' +
    '</button>';
  }

  function renderIqDrawerTabs(catOverride, queryOverride) {
    if (typeof document === 'undefined') return;
    var groupsRoot = (typeof TAB_GROUPS !== 'undefined' ? TAB_GROUPS : (typeof window !== 'undefined' ? window.TAB_GROUPS : null)) || {};
    var catBar = document.getElementById('iqDrawerCatBar');
    var tabsBox = document.getElementById('iqDrawerTabs');
    var searchInp = document.getElementById('iqDrawerSearch');
    var clearBtn = document.getElementById('iqDrawerSearchClear');
    if (!catBar && !tabsBox) return;

    var s = (typeof S !== 'undefined' && S) ? S : {};
    var activeCat = catOverride || _drawerCat || s.lastCat || 'ibadah';
    if (!groupsRoot[activeCat]) activeCat = 'ibadah';
    _drawerCat = activeCat;
    var activeTab = s.lastSub || 'today';
    var qRaw = (queryOverride !== undefined) ? String(queryOverride == null ? '' : queryOverride) : _drawerQuery;
    _drawerQuery = qRaw;
    var q = qRaw.trim().toLowerCase();

    if (searchInp && searchInp.value !== qRaw) searchInp.value = qRaw;
    if (clearBtn) clearBtn.style.display = q ? 'inline-flex' : 'none';

    var sig = activeCat + '|' + activeTab + '|' + q;
    if (!_drawerDirty && sig === _lastDrawerSig) return;
    _drawerDirty = false;
    _lastDrawerSig = sig;

    if (catBar) {
      catBar.innerHTML = DRAWER_CATS.map(function(c) {
        var grp = groupsRoot[c.id] || [];
        var tabCount = 0;
        for (var i = 0; i < grp.length; i++) {
          tabCount += Array.isArray(grp[i].tabs) ? grp[i].tabs.length : 1;
        }
        var isActive = c.id === activeCat && !q;
        return '<button type="button" class="iq-drawer-cat' + (isActive ? ' active' : '') + '" data-cat="' + esc(c.id) + '" role="tab" aria-selected="' + (isActive ? 'true' : 'false') + '" onclick="window.selectDrawerCategory && window.selectDrawerCategory(\'' + esc(c.id) + '\')">' +
          '<span class="iq-drawer-cat-ico">' + icon(c.icon) + '</span>' +
          '<span>' + esc(tLabel(c.label)) + '</span>' +
          '<span class="iq-drawer-cat-num">' + tabCount + '</span>' +
        '</button>';
      }).join('');
    }

    if (!tabsBox) return;
    if (q) {
      var matches = [];
      for (var ci = 0; ci < DRAWER_CATS.length; ci++) {
        var catMeta = DRAWER_CATS[ci];
        var catEntries = groupsRoot[catMeta.id] || [];
        for (var gi = 0; gi < catEntries.length; gi++) {
          var entry = catEntries[gi];
          if (Array.isArray(entry.tabs)) {
            for (var ti = 0; ti < entry.tabs.length; ti++) {
              var tb = entry.tabs[ti];
              var hay = (tLabel(tb.label) + ' ' + tb.id + ' ' + (tb.desc || '') + ' ' + tLabel(entry.label) + ' ' + tLabel(catMeta.label)).toLowerCase();
              if (hay.indexOf(q) > -1) {
                matches.push(renderDrawerTabTile(tb, activeTab, tLabel(catMeta.label) + ' › ' + tLabel(entry.label)));
              }
            }
          } else {
            var flatHay = (tLabel(entry.label) + ' ' + entry.id + ' ' + tLabel(catMeta.label)).toLowerCase();
            if (flatHay.indexOf(q) > -1) {
              matches.push(renderDrawerTabTile(entry, activeTab, tLabel(catMeta.label)));
            }
          }
        }
      }
      tabsBox.innerHTML = matches.length
        ? '<div class="iq-drawer-search-count">' + matches.length + ' match(es) for &ldquo;' + esc(qRaw.trim()) + '&rdquo;</div><div class="iq-drawer-grid">' + matches.join('') + '</div>'
        : '<div class="iq-empty-card">No section matches &ldquo;' + esc(qRaw.trim()) + '&rdquo;. Try another keyword.</div>';
      return;
    }

    var group = groupsRoot[activeCat] || [];
    if (!group.length) {
      tabsBox.innerHTML = '<div class="iq-empty-card">No sections configured.</div>';
      return;
    }

    var isCategorized = Array.isArray(group[0].tabs);
    if (!isCategorized) {
      tabsBox.innerHTML = '<div class="iq-drawer-grid">' + group.map(function(tb) {
        return renderDrawerTabTile(tb, activeTab, '');
      }).join('') + '</div>';
      return;
    }

    tabsBox.innerHTML = group.map(function(grp, idx) {
      var containsActive = grp.tabs.some(function(tb) { return tb.id === activeTab; });
      var openAttr = (containsActive || group.length <= 2 || idx === 0) ? ' open' : '';
      return '<details class="iq-drawer-group"' + openAttr + '>' +
        '<summary class="iq-drawer-group-head">' +
          '<span class="iq-drawer-group-title">' + icon(grp.icon || grp.id) + ' ' + esc(tLabel(grp.label)) + '</span>' +
          '<span class="iq-drawer-group-count">' + grp.tabs.length + '</span>' +
        '</summary>' +
        '<div class="iq-drawer-grid">' +
          grp.tabs.map(function(tb) { return renderDrawerTabTile(tb, activeTab, ''); }).join('') +
        '</div>' +
      '</details>';
    }).join('');
  }

  function markIqDrawerDirty() {
    _drawerDirty = true;
  }

  function syncIqDrawer() {
    _drawerDirty = true;
    var s = (typeof S !== 'undefined' && S) ? S : {};
    if (s.lastCat) _drawerCat = s.lastCat;
    if (typeof document === 'undefined') return;
    var d = document.getElementById('iqDrawer');
    if (d && d.classList.contains('open')) {
      renderIqDrawerTabs(_drawerCat, _drawerQuery);
    }
  }

  function selectDrawerCategory(catId) {
    _drawerCat = catId;
    _drawerQuery = '';
    _drawerDirty = true;
    renderIqDrawerTabs(catId, '');
    if (typeof document !== 'undefined') {
      var tabsBox = document.getElementById('iqDrawerTabs');
      if (tabsBox) tabsBox.scrollTop = 0;
    }
  }

  function filterDrawerTabs(query) {
    _drawerQuery = String(query == null ? '' : query);
    _drawerDirty = true;
    renderIqDrawerTabs(_drawerCat, _drawerQuery);
  }

  function openIqDrawer(focusCatId) {
    closeNotifDrawer();
    if (focusCatId) _drawerCat = focusCatId;
    else if (!_drawerCat && typeof S !== 'undefined' && S && S.lastCat) _drawerCat = S.lastCat;
    _drawerDirty = true;
    renderIqDrawerTabs(_drawerCat, _drawerQuery);
    if (typeof document === 'undefined') return;
    var d = document.getElementById('iqDrawer');
    var bd = document.getElementById('iqDrawerBackdrop');
    if (d) { d.classList.add('open'); d.setAttribute('aria-hidden', 'false'); }
    if (bd) bd.classList.add('show');
    if (document.body) document.body.classList.add('iq-drawer-open');
  }

  function closeIqDrawer() {
    if (typeof document === 'undefined') return;
    var d = document.getElementById('iqDrawer');
    var nr = document.getElementById('iqNotifDrawer');
    var bd = document.getElementById('iqDrawerBackdrop');
    if (d) { d.classList.remove('open'); d.setAttribute('aria-hidden', 'true'); }
    if (!nr || !nr.classList.contains('open')) {
      if (bd) bd.classList.remove('show');
      if (document.body) document.body.classList.remove('iq-drawer-open');
    }
  }

  function renderNotifDrawerBody() {
    if (typeof document === 'undefined') return;
    var el = document.getElementById('iqNotifBody');
    if (!el) return;
    var s = (typeof S !== 'undefined' && S) ? S : {};
    var summary = computeDailyChallenges(s);
    var bonusClaimed = s.lbd === todayStr();
    var enabled = !!s.notificationsEnabled;
    el.innerHTML =
      '<div class="iq-notif-card">' +
        '<div class="iq-ch-title">Daily Bonus XP</div>' +
        '<div class="iq-ch-sub">' + (bonusClaimed ? 'Already claimed today — Alhamdulillah!' : 'Your daily streak bonus is ready to claim.') + '</div>' +
        (!bonusClaimed ? '<button type="button" class="iq-pill-btn" style="margin-top:8px;" onclick="App.claimBonus();window.renderNotifDrawerBody();">Claim Bonus</button>' : '') +
      '</div>' +
      '<div class="iq-notif-card">' +
        '<div class="iq-ch-title">Daily Worship Status</div>' +
        '<div class="iq-ch-sub">Prayers: ' + summary.prayersDone + '/' + summary.prayersTotal + ' · Dhikr: ' + summary.dhikrToday + '/' + summary.dhikrGoal + '</div>' +
      '</div>' +
      '<div class="iq-notif-card">' +
        '<div class="iq-ch-title">Browser Reminders</div>' +
        '<div class="iq-ch-sub">' + (enabled ? 'Prayer & streak reminders active.' : 'Enable push reminders for prayer streaks.') + '</div>' +
        '<button type="button" class="iq-pill-btn" style="margin-top:8px;" onclick="App.toggleNotifications();setTimeout(window.renderNotifDrawerBody,200);">' + (enabled ? 'Disable' : 'Enable') + '</button>' +
      '</div>';
  }

  function openNotifDrawer() {
    closeIqDrawer();
    renderNotifDrawerBody();
    if (typeof document === 'undefined') return;
    var d = document.getElementById('iqNotifDrawer');
    var bd = document.getElementById('iqDrawerBackdrop');
    if (d) { d.classList.add('open'); d.setAttribute('aria-hidden', 'false'); }
    if (bd) bd.classList.add('show');
    if (document.body) document.body.classList.add('iq-drawer-open');
  }

  function closeNotifDrawer() {
    if (typeof document === 'undefined') return;
    var d = document.getElementById('iqNotifDrawer');
    var dr = document.getElementById('iqDrawer');
    var bd = document.getElementById('iqDrawerBackdrop');
    if (d) { d.classList.remove('open'); d.setAttribute('aria-hidden', 'true'); }
    if (!dr || !dr.classList.contains('open')) {
      if (bd) bd.classList.remove('show');
      if (document.body) document.body.classList.remove('iq-drawer-open');
    }
  }

  function closeActiveSheet() {
    closeChallengeDetail();
    if (typeof window.closeMasjidCheckins === 'function') window.closeMasjidCheckins();
    closeIqDrawer();
    closeNotifDrawer();
  }

  function drawerNavigate(target) {
    closeIqDrawer();
    var groupsRoot = (typeof TAB_GROUPS !== 'undefined' ? TAB_GROUPS : (typeof window !== 'undefined' ? window.TAB_GROUPS : null)) || {};
    if (target === 'masjid' && typeof window.openMasjidCheckins === 'function') {
      window.openMasjidCheckins('map');
    } else if (target === 'challenge') {
      openChallengeDetail('dhikr');
    } else if (target === 'names' && typeof window.switchCategory === 'function') {
      window.switchCategory('names_main');
    } else if (groupsRoot[target] && typeof window.switchCategory === 'function') {
      window.switchCategory(target);
    } else if (typeof window.activateTab === 'function') {
      window.activateTab(target);
    }
  }

  function initIqShell() {
    if (initIqShell._done) return;
    initIqShell._done = true;
    renderIqFeed();
    if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeActiveSheet();
      });
    }
  }

  window.computeDailyChallenges = computeDailyChallenges;
  window.renderIqFeed = renderIqFeed;
  window.openChallengeDetail = openChallengeDetail;
  window.closeChallengeDetail = closeChallengeDetail;
  window.toggleChallengeStopwatch = toggleChallengeStopwatch;
  window.quickChallengeAction = quickChallengeAction;
  window.openIqDrawer = openIqDrawer;
  window.closeIqDrawer = closeIqDrawer;
  window.renderIqDrawerTabs = renderIqDrawerTabs;
  window.selectDrawerCategory = selectDrawerCategory;
  window.filterDrawerTabs = filterDrawerTabs;
  window.markIqDrawerDirty = markIqDrawerDirty;
  window.syncIqDrawer = syncIqDrawer;
  window.openNotifDrawer = openNotifDrawer;
  window.closeNotifDrawer = closeNotifDrawer;
  window.renderNotifDrawerBody = renderNotifDrawerBody;
  window.closeActiveSheet = closeActiveSheet;
  window.drawerNavigate = drawerNavigate;
  window.initIqShell = initIqShell;

  initIqShell();
})();
