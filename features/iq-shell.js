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
    var quranToday = Math.max(0, Number(dayLog.q) || 0);
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

  function logQuranMinutes(mins) {
    var m = Math.min(240, Math.max(1, Math.round(Number(mins) || 5)));
    var s = (typeof S !== 'undefined' && S) ? S : null;
    if (!s) return 0;
    var dk = todayStr();
    if (!s.log || typeof s.log !== 'object') s.log = {};
    if (!s.log[dk] || typeof s.log[dk] !== 'object') s.log[dk] = { p: {}, v: {}, d: {}, q: 0 };
    s.log[dk].q = (Number(s.log[dk].q) || 0) + m;
    if (typeof grantDailyXp === 'function') grantDailyXp(10, 'quran_read|' + dk);
    else if (typeof window !== 'undefined' && typeof window.grantDailyXp === 'function') window.grantDailyXp(10, 'quran_read|' + dk);
    if (typeof saveState === 'function') saveState();
    else if (typeof window !== 'undefined' && typeof window.saveState === 'function') window.saveState();
    if (typeof window !== 'undefined' && typeof window.iqHaptic === 'function') window.iqHaptic(10);
    if (typeof toast === 'function') toast(icon('book-open'), 'Logged +' + m + ' min Quran reading!');
    if (typeof renderTopBar === 'function') renderTopBar();
    if (typeof renderLv === 'function') renderLv();
    renderIqFeed();
    if (typeof document !== 'undefined') {
      var sh = document.getElementById('iqChallengeSheet');
      if (sh && sh.classList && sh.classList.contains('open')) renderChallengeDetailBody(_activeFocusId);
    }
    return s.log[dk].q;
  }

  function updateDailyChallengeGoals(opts) {
    var input = opts && typeof opts === 'object' ? opts : {};
    var s = (typeof S !== 'undefined' && S) ? S : null;
    var prev = (s && s.dailyChallengeGoals && typeof s.dailyChallengeGoals === 'object')
      ? s.dailyChallengeGoals
      : { dhikr: 500, quranMinutes: 20, prayers: 5 };
    var dhikrRaw = Number(input.dhikr);
    var quranRaw = Number(input.quranMinutes);
    var next = {
      dhikr: Number.isFinite(dhikrRaw) && dhikrRaw > 0 ? Math.min(5000, Math.max(33, Math.round(dhikrRaw))) : (Number(prev.dhikr) || 500),
      quranMinutes: Number.isFinite(quranRaw) && quranRaw > 0 ? Math.min(180, Math.max(5, Math.round(quranRaw))) : (Number(prev.quranMinutes) || 20),
      prayers: Number(prev.prayers) || 5
    };
    if (s) s.dailyChallengeGoals = next;
    if (typeof saveState === 'function') saveState();
    else if (typeof window !== 'undefined' && typeof window.saveState === 'function') window.saveState();
    renderIqFeed();
    if (typeof document !== 'undefined') {
      var sh = document.getElementById('iqChallengeSheet');
      if (sh && sh.classList && sh.classList.contains('open')) renderChallengeDetailBody(_activeFocusId);
    }
    return next;
  }

  function saveGoalTargetsForm() {
    if (typeof document === 'undefined') return;
    var dEl = document.getElementById('iqGoalDhikrInput');
    var qEl = document.getElementById('iqGoalQuranInput');
    updateDailyChallengeGoals({
      dhikr: dEl ? dEl.value : undefined,
      quranMinutes: qEl ? qEl.value : undefined
    });
    if (typeof toast === 'function') toast(icon('sparkles'), 'Daily targets updated!');
  }

  function quickToggleSheetPrayer(id) {
    if (typeof App !== 'undefined' && App && typeof App.toggleP === 'function') App.toggleP(id);
    else if (typeof window !== 'undefined' && typeof window.toggleP === 'function') window.toggleP(id);
    renderIqFeed();
    renderChallengeDetailBody(_activeFocusId);
  }

  function _cachedNextPrayerSummary() {
    try {
      if (typeof window === 'undefined' || typeof window.getPrayerTimesFromCache !== 'function' || typeof window.computeNextPrayer !== 'function') return null;
      var cached = window.getPrayerTimesFromCache();
      return cached ? window.computeNextPrayer(cached) : null;
    } catch (e) {
      return null;
    }
  }

  function getTimeGreeting(dateObj) {
    var d = (dateObj && typeof dateObj.getHours === 'function') ? dateObj : new Date();
    var h = d.getHours();
    if (h < 5) return 'Peaceful Night';
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    if (h < 21) return 'Good Evening';
    return 'Blessed Night';
  }

  function _formatLocalDateKey(dt) {
    var y = dt.getFullYear();
    var m = String(dt.getMonth() + 1).padStart(2, '0');
    var d = String(dt.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
  }

  function computeWeeklyRhythm(stateObj, anchorDateKey) {
    var s = stateObj || ((typeof S !== 'undefined' && S) ? S : {});
    var logMap = (s && s.log) || {};
    var anchorKey = anchorDateKey || todayStr();
    var parts = String(anchorKey).split('-');
    var base = parts.length === 3
      ? new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]), 12, 0, 0)
      : new Date();
    var dayInitials = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    var fardIds = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
    var out = [];
    for (var offset = 6; offset >= 0; offset--) {
      var dt = new Date(base.getTime());
      dt.setDate(dt.getDate() - offset);
      var dk = _formatLocalDateKey(dt);
      var p = (logMap[dk] && logMap[dk].p) || {};
      var count = fardIds.filter(function(id) { return !!p[id]; }).length;
      out.push({
        dk: dk,
        label: dayInitials[dt.getDay()],
        count: count,
        complete: count >= 5,
        partial: count > 0 && count < 5,
        isToday: offset === 0
      });
    }
    return out;
  }

  function renderConcentricRingsSvg(summary, sizePx) {
    var s = summary || computeDailyChallenges();
    var size = sizePx || 96;
    var rings = [
      { r: 44, pct: s.prayersPct || 0, cls: 'iq-ring-p', stroke: '#14b8a6' },
      { r: 33, pct: s.dhikrPct || 0, cls: 'iq-ring-d', stroke: '#38bdf8' },
      { r: 22, pct: s.quranPct || 0, cls: 'iq-ring-q', stroke: '#eab308' }
    ];
    var tracks = rings.map(function(rg) {
      var c = 2 * Math.PI * rg.r;
      var off = c - (Math.min(100, Math.max(0, rg.pct)) / 100) * c;
      return '<circle class="iq-cr-track" cx="55" cy="55" r="' + rg.r + '"/>' +
        '<circle class="iq-cr-fill ' + rg.cls + '" cx="55" cy="55" r="' + rg.r + '" stroke="' + rg.stroke + '" stroke-dasharray="' + c.toFixed(2) + '" stroke-dashoffset="' + off.toFixed(2) + '"/>';
    }).join('');
    return '<div class="iq-concentric-rings" style="width:' + size + 'px;height:' + size + 'px">' +
      '<svg viewBox="0 0 110 110" width="' + size + '" height="' + size + '" aria-hidden="true">' + tracks + '</svg>' +
      '<span class="iq-cr-center iq-tabular">' + (s.overallPct || 0) + '%</span>' +
    '</div>';
  }

  function renderIqFeed() {
    if (typeof document === 'undefined') return;
    var summary = computeDailyChallenges();
    var nextP = _cachedNextPrayerSummary();
    var greet = getTimeGreeting();
    var rhythm = computeWeeklyRhythm();

    var heroEl = document.getElementById('iqHeroChallenge');
    if (heroEl) {
      var focusMetaRight = nextP
        ? ('Next: ' + esc(nextP.name) + ' &middot; ' + esc(nextP.shortRemaining))
        : ('Overall ' + summary.overallPct + '% today');
      var rhythmHtml = '<div class="iq-rhythm-strip" aria-label="7-day prayer consistency">' +
        rhythm.map(function(day) {
          var cls = 'iq-rhythm-day' + (day.complete ? ' complete' : (day.partial ? ' partial' : '')) + (day.isToday ? ' today' : '');
          return '<div class="' + cls + '" title="' + esc(day.dk) + ': ' + day.count + '/5 prayers">' +
            '<span class="iq-rhythm-dot"></span>' +
            '<span class="iq-rhythm-lbl">' + esc(day.label) + '</span>' +
          '</div>';
        }).join('') +
      '</div>';
      heroEl.innerHTML =
        '<div class="iq-hero-ch-top">' +
          '<span class="iq-hero-ch-title">' + esc(greet) + ' &middot; Today\'s Focus</span>' +
          '<button type="button" class="iq-hero-ch-link" onclick="window.openChallengeDetail(\'dhikr\')">Details &rsaquo;</button>' +
        '</div>' +
        '<div class="iq-hero-ch-card iq-hero-upgraded" role="button" tabindex="0" onclick="window.openChallengeDetail(\'dhikr\')">' +
          '<div class="iq-hero-ring-grid">' +
            renderConcentricRingsSvg(summary, 94) +
            '<div class="iq-hero-pillars">' +
              '<div class="iq-pillar-row"><span class="iq-pillar-dot" style="background:#14b8a6"></span><span>Prayers</span><strong class="iq-tabular">' + summary.prayersDone + '/' + summary.prayersTotal + '</strong></div>' +
              '<div class="iq-pillar-row"><span class="iq-pillar-dot" style="background:#38bdf8"></span><span>Dhikr</span><strong class="iq-tabular">' + summary.dhikrToday + '/' + summary.dhikrGoal + '</strong></div>' +
              '<div class="iq-pillar-row"><span class="iq-pillar-dot" style="background:#eab308"></span><span>Quran</span><strong class="iq-tabular">' + summary.quranToday + '/' + summary.quranGoal + 'm</strong></div>' +
              '<div class="iq-hero-ch-meta"><span>' + focusMetaRight + '</span></div>' +
            '</div>' +
          '</div>' +
          rhythmHtml +
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
          sub: summary.quranToday + ' / ' + summary.quranGoal + ' min read today',
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
    } else if (type === 'quran5') {
      logQuranMinutes(5);
      return;
    } else if (type === 'quran' && typeof window.activateTab === 'function') {
      closeChallengeDetail();
      window.activateTab('quran');
      return;
    } else if (type === 'timer' && typeof window.activateTab === 'function') {
      closeChallengeDetail();
      window.activateTab('timer');
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
    var nextP = _cachedNextPrayerSummary();
    var sObj = (typeof S !== 'undefined' && S) ? S : {};
    var dayLog = (sObj.log && sObj.log[todayStr()]) || { p: {} };
    var pMap = dayLog.p || {};
    var prayerDefs = (typeof PRAYERS !== 'undefined' && Array.isArray(PRAYERS) && PRAYERS.length)
      ? PRAYERS
      : [{ id: 'fajr', name: 'Fajr' }, { id: 'dhuhr', name: 'Dhuhr' }, { id: 'asr', name: 'Asr' }, { id: 'maghrib', name: 'Maghrib' }, { id: 'isha', name: 'Isha' }];

    var focusTitle = 'Daily Concentric Telemetry';
    if (focusId === 'prayers') focusTitle = 'Prayers: ' + summary.prayersDone + '/' + summary.prayersTotal;
    else if (focusId === 'vol') focusTitle = 'Voluntary: ' + summary.volDone + ' logged';
    else if (focusId === 'deeds') focusTitle = 'Deeds: ' + summary.deedsDone + ' completed';
    else focusTitle = 'Dhikr: ' + summary.dhikrToday + '/' + summary.dhikrGoal;

    var timerBannerHtml = nextP
      ? '<div class="iq-notif-card" style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px;">' +
          '<div><div class="iq-ch-title">Next Prayer: ' + esc(nextP.name) + '</div><div class="iq-ch-sub iq-tabular">' + esc(nextP.timeLabel) + ' &middot; ' + esc(nextP.shortRemaining) + '</div></div>' +
          '<button type="button" class="iq-pill-btn" onclick="window.quickChallengeAction(\'timer\')">Times</button>' +
        '</div>'
      : '';

    var prayerRowHtml = '<div class="iq-sheet-prayer-row">' +
      prayerDefs.map(function(pr) {
        var nm = pr.name || (pr.id ? pr.id.charAt(0).toUpperCase() + pr.id.slice(1) : 'Prayer');
        var raw = pMap[pr.id];
        var done = !!raw;
        var isQada = raw === 'qada';
        return '<button type="button" class="iq-sheet-prayer-btn' + (done ? ' done' : '') + (isQada ? ' qada' : '') + '" onclick="window.quickToggleSheetPrayer(\'' + esc(pr.id) + '\')">' +
          (done ? (isQada ? '&#8634; ' : '&#10003; ') : '') + esc(nm) +
        '</button>';
      }).join('') +
      '</div>';

    var rows = [
      { title: 'Dhikr Tap (+1)', sub: summary.dhikrToday + ' / ' + summary.dhikrGoal + ' completed', btn: 'Progress', act: 'dhikr1', icon: 'beads' },
      { title: 'Tasbih Cycle (+33)', sub: 'Complete a full 33-count dhikr set', btn: 'Start', act: 'dhikr33', icon: 'sparkles' },
      { title: 'Quran Session (+5m)', sub: summary.quranToday + ' / ' + summary.quranGoal + ' min logged today', btn: '+5m Read', act: 'quran5', icon: 'book-open' },
      { title: 'Quran Reader', sub: 'Read by Surah or Juz with audio', btn: 'Open', act: 'quran', icon: 'book-open' },
      { title: 'Masjid Check-ins', sub: summary.masjidTotal + ' visit(s) logged', btn: 'Map', act: 'masjid', icon: 'mosque' },
      { title: 'Voluntary & Deeds', sub: (summary.volDone + summary.deedsDone) + ' completed today', btn: 'Show All', act: 'vol', icon: 'heart' }
    ];

    var goalsEditorHtml = '<div class="iq-goal-editor">' +
      '<div class="iq-ch-title">Daily Goal Targets</div>' +
      '<div class="iq-goal-editor-grid">' +
        '<div class="iq-goal-field"><label for="iqGoalDhikrInput">Daily Dhikr Target</label><input id="iqGoalDhikrInput" type="number" min="33" max="5000" value="' + esc(summary.dhikrGoal) + '"></div>' +
        '<div class="iq-goal-field"><label for="iqGoalQuranInput">Daily Quran (min)</label><input id="iqGoalQuranInput" type="number" min="5" max="180" value="' + esc(summary.quranGoal) + '"></div>' +
      '</div>' +
      '<button type="button" class="iq-gold-btn" onclick="window.saveGoalTargetsForm()">Save Daily Targets</button>' +
    '</div>';

    bodyEl.innerHTML =
      timerBannerHtml +
      '<div class="iq-ring-hero-card">' +
        '<div class="iq-ring-wrap">' +
          renderConcentricRingsSvg(summary, 110) +
          '<div class="iq-ring-legend">' +
            '<span class="iq-ch-sub" style="font-weight:700;color:var(--text);">' + esc(focusTitle) + '</span>' +
            '<span class="iq-ch-sub iq-tabular">Prayers ' + summary.prayersPct + '% &middot; Dhikr ' + summary.dhikrPct + '% &middot; Quran ' + summary.quranPct + '%</span>' +
          '</div>' +
        '</div>' +
        '<div class="iq-timer-box">' +
          '<div class="iq-timer-val" id="iqChallengeStopwatch">' + formatStopwatch(_stopwatchSec) + '</div>' +
          '<div class="iq-timer-sub">Focus Session</div>' +
          '<button type="button" id="iqStopwatchBtn" class="iq-pill-btn" onclick="window.toggleChallengeStopwatch()">' + (_stopwatchRunning ? 'Pause' : 'Start') + '</button>' +
        '</div>' +
      '</div>' +
      prayerRowHtml +
      '<div class="iq-feed-head"><span>Daily challenges</span><span>' + summary.overallPct + '% overall</span></div>' +
      '<div class="iq-feed-list">' +
      rows.map(function(r) {
        return '<div class="iq-challenge-card">' +
          '<div class="iq-ch-icon teal">' + icon(r.icon) + '</div>' +
          '<div class="iq-ch-body"><div class="iq-ch-title">' + esc(r.title) + '</div><div class="iq-ch-sub">' + esc(r.sub) + '</div></div>' +
          '<button type="button" class="iq-pill-btn" onclick="window.quickChallengeAction(\'' + r.act + '\')">' + esc(r.btn) + '</button>' +
        '</div>';
      }).join('') +
      '</div>' +
      goalsEditorHtml;
  }

  var _lastFocusedTrigger = null;
  var _isTransitioning = false;

  function _anyOverlayOpen() {
    if (typeof document === 'undefined') return false;
    var ids = ['iqDrawer', 'iqNotifDrawer', 'iqChallengeSheet', 'iqMasjidSheet'];
    for (var i = 0; i < ids.length; i++) {
      var el = document.getElementById(ids[i]);
      if (el && el.classList && el.classList.contains('open')) return true;
    }
    return false;
  }

  function _captureTriggerFocus() {
    if (typeof document === 'undefined') return;
    if (!_anyOverlayOpen() && document.activeElement && document.activeElement !== document.body) {
      _lastFocusedTrigger = document.activeElement;
    }
  }

  function _restoreTriggerFocus() {
    if (_isTransitioning || typeof document === 'undefined' || _anyOverlayOpen()) return;
    var trig = _lastFocusedTrigger;
    _lastFocusedTrigger = null;
    if (trig && typeof trig.focus === 'function' && trig.isConnected !== false) {
      try { trig.focus({ preventScroll: true }); } catch (e) { try { trig.focus(); } catch (_) {} }
    }
  }

  function _focusInside(el) {
    if (!el || typeof el.querySelector !== 'function') return;
    var target = el.querySelector('button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex="0"]');
    if (target && typeof target.focus === 'function') {
      try { target.focus({ preventScroll: true }); } catch (e) { try { target.focus(); } catch (_) {} }
    }
  }

  function _setOverlayState(el, open) {
    if (!el) return;
    if (el.classList) el.classList.toggle('open', !!open);
    if (typeof el.setAttribute === 'function') el.setAttribute('aria-hidden', open ? 'false' : 'true');
    el.inert = !open;
  }

  function openChallengeDetail(focusId) {
    _captureTriggerFocus();
    _isTransitioning = true;
    try { closeActiveSheet(); } finally { _isTransitioning = false; }
    _activeFocusId = focusId || 'dhikr';
    renderChallengeDetailBody(_activeFocusId);
    if (typeof document === 'undefined') return;
    var sheet = document.getElementById('iqChallengeSheet');
    if (sheet) {
      _setOverlayState(sheet, true);
      _focusInside(sheet);
    }
    if (document.body) document.body.classList.add('iq-sheet-open');
  }

  function closeChallengeDetail() {
    if (_stopwatchTimer) { clearInterval(_stopwatchTimer); _stopwatchTimer = null; _stopwatchRunning = false; }
    if (typeof document === 'undefined') return;
    var sheet = document.getElementById('iqChallengeSheet');
    _setOverlayState(sheet, false);
    if (document.body) document.body.classList.remove('iq-sheet-open');
    _restoreTriggerFocus();
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
    _captureTriggerFocus();
    _isTransitioning = true;
    try { closeNotifDrawer(); } finally { _isTransitioning = false; }
    if (focusCatId) _drawerCat = focusCatId;
    else if (!_drawerCat && typeof S !== 'undefined' && S && S.lastCat) _drawerCat = S.lastCat;
    _drawerDirty = true;
    renderIqDrawerTabs(_drawerCat, _drawerQuery);
    if (typeof document === 'undefined') return;
    var d = document.getElementById('iqDrawer');
    var bd = document.getElementById('iqDrawerBackdrop');
    if (d) {
      _setOverlayState(d, true);
      _focusInside(d);
    }
    if (bd) bd.classList.add('show');
    if (document.body) document.body.classList.add('iq-drawer-open');
  }

  function closeIqDrawer() {
    if (typeof document === 'undefined') return;
    var d = document.getElementById('iqDrawer');
    var nr = document.getElementById('iqNotifDrawer');
    var bd = document.getElementById('iqDrawerBackdrop');
    _setOverlayState(d, false);
    if (!nr || !nr.classList.contains('open')) {
      if (bd) bd.classList.remove('show');
      if (document.body) document.body.classList.remove('iq-drawer-open');
    }
    _restoreTriggerFocus();
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
    _captureTriggerFocus();
    _isTransitioning = true;
    try { closeIqDrawer(); } finally { _isTransitioning = false; }
    renderNotifDrawerBody();
    if (typeof document === 'undefined') return;
    var d = document.getElementById('iqNotifDrawer');
    var bd = document.getElementById('iqDrawerBackdrop');
    if (d) {
      _setOverlayState(d, true);
      _focusInside(d);
    }
    if (bd) bd.classList.add('show');
    if (document.body) document.body.classList.add('iq-drawer-open');
  }

  function closeNotifDrawer() {
    if (typeof document === 'undefined') return;
    var d = document.getElementById('iqNotifDrawer');
    var dr = document.getElementById('iqDrawer');
    var bd = document.getElementById('iqDrawerBackdrop');
    _setOverlayState(d, false);
    if (!dr || !dr.classList.contains('open')) {
      if (bd) bd.classList.remove('show');
      if (document.body) document.body.classList.remove('iq-drawer-open');
    }
    _restoreTriggerFocus();
  }

  function closeActiveSheet() {
    closeChallengeDetail();
    if (typeof window.closeMasjidCheckins === 'function') window.closeMasjidCheckins();
    closeIqDrawer();
    closeNotifDrawer();
  }

  function drawerNavigate(target) {
    _isTransitioning = (target === 'masjid' || target === 'challenge');
    try { closeIqDrawer(); } finally { if (!_isTransitioning) {} }
    var groupsRoot = (typeof TAB_GROUPS !== 'undefined' ? TAB_GROUPS : (typeof window !== 'undefined' ? window.TAB_GROUPS : null)) || {};
    if (target === 'masjid' && typeof window.openMasjidCheckins === 'function') {
      _isTransitioning = false;
      window.openMasjidCheckins('map');
    } else if (target === 'challenge') {
      _isTransitioning = false;
      openChallengeDetail('dhikr');
    } else {
      _isTransitioning = false;
      if (target === 'names' && typeof window.switchCategory === 'function') {
        window.switchCategory('names_main');
      } else if (groupsRoot[target] && typeof window.switchCategory === 'function') {
        window.switchCategory(target);
      } else if (typeof window.activateTab === 'function') {
        window.activateTab(target);
      }
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

  window.iqOverlayA11y = {
    captureTrigger: _captureTriggerFocus,
    restoreTrigger: _restoreTriggerFocus,
    focusInside: _focusInside,
    setOverlayState: _setOverlayState,
    setTransitioning: function(v) { _isTransitioning = !!v; }
  };

  window.getTimeGreeting = getTimeGreeting;
  window.computeWeeklyRhythm = computeWeeklyRhythm;
  window.renderConcentricRingsSvg = renderConcentricRingsSvg;
  window.computeDailyChallenges = computeDailyChallenges;
  window.logQuranMinutes = logQuranMinutes;
  window.updateDailyChallengeGoals = updateDailyChallengeGoals;
  window.saveGoalTargetsForm = saveGoalTargetsForm;
  window.quickToggleSheetPrayer = quickToggleSheetPrayer;
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
