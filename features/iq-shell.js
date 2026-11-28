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
    { id: 'ibadah', label: 'Home', icon: 'home' },
    { id: 'worship', label: 'Worship', icon: 'beads' },
    { id: 'knowledge', label: 'Knowledge', icon: 'book-open' },
    { id: 'profile_main', label: 'Profile', icon: 'user' }
  ];

  function tLabel(k) {
    return (typeof window !== 'undefined' && typeof window.t === 'function') ? window.t(k) : k;
  }
  function fmtNum(v) {
    return (typeof window !== 'undefined' && typeof window.iqFormatNum === 'function') ? window.iqFormatNum(v) : String(v);
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

  function renderFocusRingSvg(summary, sizePx) {
    var s = summary || computeDailyChallenges();
    var size = sizePx || 88;
    var pct = Math.min(100, Math.max(0, Number(s.overallPct) || 0));
    var r = 41;
    var c = 2 * Math.PI * r;
    var off = c - (pct / 100) * c;
    return '<div class="iq-focus-ring" style="width:' + size + 'px;height:' + size + 'px">' +
      '<svg viewBox="0 0 100 100" width="' + size + '" height="' + size + '" aria-hidden="true">' +
        '<circle class="iq-fr-track" cx="50" cy="50" r="' + r + '"/>' +
        '<circle class="iq-fr-fill" cx="50" cy="50" r="' + r + '" stroke-dasharray="' + c.toFixed(2) + '" stroke-dashoffset="' + off.toFixed(2) + '"/>' +
      '</svg>' +
      '<div class="iq-fr-center">' +
        '<span class="iq-fr-pct iq-tabular">' + fmtNum(pct) + '%</span>' +
        '<span class="iq-fr-lbl">' + esc(tLabel('today')) + '</span>' +
      '</div>' +
    '</div>';
  }

  function renderIqFeed() {
    if (typeof document === 'undefined') return;
    var summary = computeDailyChallenges();
    var nextP = _cachedNextPrayerSummary();
    var greet = getTimeGreeting();
    var rhythm = computeWeeklyRhythm();
    var sObj = (typeof S !== 'undefined' && S) ? S : {};
    var worshipCues = (typeof window !== 'undefined' && typeof window.getWorshipDayCues === 'function')
      ? window.getWorshipDayCues(new Date())
      : null;

    var railSumEl = document.getElementById('iqRailQuickSummary');
    if (railSumEl) {
      railSumEl.innerHTML =
        '<div class="iq-rail-stat"><span class="iq-rail-stat-lbl">' + esc(tLabel('Level')) + '</span><strong class="iq-tabular">' + fmtNum(sObj.lv || 1) + '</strong></div>' +
        '<div class="iq-rail-stat"><span class="iq-rail-stat-lbl">' + esc(tLabel('Streak')) + '</span><strong class="iq-tabular">' + fmtNum(sObj.cs || 0) + esc(tLabel('d')) + '</strong></div>';
    }

    var heroEl = document.getElementById('iqHeroChallenge');
    if (heroEl) {
      var cueBadgeHtml = (worshipCues && worshipCues.fastCue)
        ? '<button type="button" class="iq-cue-pill" onclick="App.activateTab(\'fasting\')">' + icon('moon') + ' <span>' + esc(worshipCues.fastCue) + '</span></button>'
        : (worshipCues && worshipCues.isFriday
          ? '<button type="button" class="iq-cue-pill" onclick="App.activateTab(\'jumuah\')">' + icon('mosque') + ' <span>' + esc(tLabel("Jumu'ah Mubarak")) + '</span></button>'
          : '');
      var hijriChipHtml = (worshipCues && worshipCues.hijriText)
        ? '<span class="iq-hero-hijri iq-tabular">' + esc(worshipCues.hijriText) + '</span>'
        : '';
      var nextPrayerHtml = nextP
        ? '<div class="iq-hero-next-bar iq-hero-sanctuary-prayer">' +
            '<span class="iq-hero-next-lbl">' +
              icon('clock') +
              '<span>' + esc(tLabel('Next Prayer:')) + ' <strong>' + esc(tLabel(nextP.name)) + '</strong> &middot; <bdi dir="ltr">' + esc(nextP.timeLabel) + '</bdi></span>' +
            '</span>' +
            '<span class="iq-hero-next-eta iq-tabular">' + esc(nextP.shortRemaining) + '</span>' +
          '</div>'
        : '<div class="iq-hero-next-bar iq-hero-sanctuary-prayer">' +
            '<span class="iq-hero-next-lbl">' + esc(tLabel('Overall')) + '</span>' +
            '<span class="iq-hero-next-eta iq-tabular">' + fmtNum(summary.overallPct) + '% ' + esc(tLabel('today')) + '</span>' +
          '</div>';
      var checkSvg = '<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>';
      var rhythmHtml = '<div class="iq-rhythm-strip" aria-label="7-day prayer consistency">' +
        rhythm.map(function(day) {
          var cls = 'iq-rhythm-day' + (day.complete ? ' complete' : (day.partial ? ' partial' : '')) + (day.isToday ? ' today' : '');
          var marker = day.complete ? checkSvg : (day.partial ? '<span class="iq-rhythm-count iq-tabular">' + fmtNum(day.count) + '</span>' : '');
          return '<div class="' + cls + '" title="' + esc(day.dk) + ': ' + day.count + '/5 prayers" aria-label="' + esc(day.dk) + ': ' + day.count + ' of 5 prayers">' +
            '<span class="iq-rhythm-dot" aria-hidden="true">' + marker + '</span>' +
            '<span class="iq-rhythm-lbl">' + esc(day.label) + '</span>' +
          '</div>';
        }).join('') +
      '</div>';
      var focusLbl = tLabel("Today's Focus");
      var safeFocusLbl = String(focusLbl).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      var detailsLbl = tLabel('Details');
      heroEl.innerHTML =
        '<div class="iq-hero-ch-card iq-hero-upgraded iq-sanctuary-card">' +
          '<div class="iq-hero-ch-top">' +
            '<div>' +
              '<span class="iq-hero-ch-title">' + esc(tLabel(greet)) + ' &middot; ' + safeFocusLbl + '</span>' +
              (hijriChipHtml || cueBadgeHtml ? '<div class="iq-hero-cues-row">' + hijriChipHtml + cueBadgeHtml + '</div>' : '') +
            '</div>' +
            '<button type="button" class="iq-hero-ch-link" onclick="window.openChallengeDetail(\'dhikr\')"><span>' + esc(detailsLbl) + '</span><svg class="iq-mirror-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg></button>' +
          '</div>' +
          nextPrayerHtml +
          '<div class="iq-hero-focus-body" role="button" tabindex="0" onclick="window.openChallengeDetail(\'dhikr\')" aria-label="' + esc(focusLbl) + ' ' + esc(detailsLbl) + '">' +
            '<div class="iq-hero-ring-grid">' +
              renderFocusRingSvg(summary, 86) +
              '<div class="iq-hero-pillars">' +
                '<div class="iq-pillar-row"><span class="iq-pillar-dot prayers"></span><span class="iq-pillar-lbl">' + esc(tLabel('Prayers')) + '</span><strong class="iq-tabular">' + fmtNum(summary.prayersDone) + '/' + fmtNum(summary.prayersTotal) + '</strong></div>' +
                '<div class="iq-pillar-row"><span class="iq-pillar-dot dhikr"></span><span class="iq-pillar-lbl">' + esc(tLabel('Dhikr')) + '</span><strong class="iq-tabular">' + fmtNum(summary.dhikrToday) + '/' + fmtNum(summary.dhikrGoal) + '</strong></div>' +
                '<div class="iq-pillar-row"><span class="iq-pillar-dot quran"></span><span class="iq-pillar-lbl">' + esc(tLabel('Quran')) + '</span><strong class="iq-tabular">' + fmtNum(summary.quranToday) + '/' + fmtNum(summary.quranGoal) + 'm</strong></div>' +
              '</div>' +
            '</div>' +
            rhythmHtml +
          '</div>' +
        '</div>';
    }

    var quranLast = sObj.quranLastRead && sObj.quranLastRead.surah ? sObj.quranLastRead : null;
    var quranSub = quranLast
      ? fmtNum(summary.quranToday) + '/' + fmtNum(summary.quranGoal) + 'm · ' + tLabel('Continue') + ' ' + fmtNum(quranLast.surah) + ':' + fmtNum(quranLast.ayah || 1)
      : fmtNum(summary.quranToday) + ' / ' + fmtNum(summary.quranGoal) + ' ' + tLabel('min read today');

    var feedEl = document.getElementById('iqFeedArea');
    if (feedEl) {
      var cards = [
        {
          id: 'dhikr',
          tone: 'teal',
          icon: 'beads',
          title: tLabel('Dhikr Counter'),
          sub: fmtNum(summary.dhikrToday) + ' / ' + fmtNum(summary.dhikrGoal) + ' ' + tLabel('today'),
          pct: summary.dhikrPct,
          onclick: "App.activateTab('dhikr')"
        },
        {
          id: 'quran',
          tone: 'gold',
          icon: 'book-open',
          title: tLabel('Quran Reading Goal'),
          sub: quranSub,
          pct: summary.quranPct,
          onclick: quranLast ? ("App.activateTab('quran');App.openQuranSurah(" + quranLast.surah + ")") : "App.activateTab('quran')"
        },
        {
          id: 'masjid',
          tone: 'mint',
          icon: 'mosque',
          title: tLabel('Masjid Check-ins'),
          sub: summary.masjidToday > 0 ? (fmtNum(summary.masjidToday) + ' ' + tLabel('today') + ' · ' + fmtNum(summary.masjidTotal) + ' ' + tLabel('total')) : (fmtNum(summary.masjidTotal) + ' ' + tLabel('total masjid visits')),
          pct: null,
          onclick: "window.openMasjidCheckins('map')"
        },
        {
          id: 'quests',
          tone: 'cyan',
          icon: 'scroll',
          title: tLabel('Daily Quests'),
          sub: fmtNum(summary.questsDone) + ' / ' + fmtNum(summary.questsTotal) + ' ' + tLabel('completed'),
          pct: summary.questsPct,
          onclick: "App.activateTab('quests')"
        },
        {
          id: 'vol',
          tone: 'teal',
          icon: 'moon',
          title: tLabel('Voluntary Prayers'),
          sub: fmtNum(summary.volDone) + ' / ' + fmtNum(summary.volTotal) + ' ' + tLabel('today'),
          pct: null,
          onclick: "App.activateTab('volprayers')"
        },
        {
          id: 'deeds',
          tone: 'gold',
          icon: 'sparkles',
          title: tLabel('Extra Good Deeds'),
          sub: fmtNum(summary.deedsDone) + ' / ' + fmtNum(summary.deedsTotal) + ' ' + tLabel('completed'),
          pct: null,
          onclick: "App.activateTab('extradeeds')"
        }
      ];

      feedEl.innerHTML =
        '<div class="iq-feed-head">' +
          '<span>' + esc(tLabel('Daily challenges')) + '</span>' +
          '<button type="button" class="iq-text-btn" onclick="window.openChallengeDetail(\'dhikr\')">' + esc(tLabel('Show All')) + '</button>' +
        '</div>' +
        '<div class="iq-feed-list">' +
        cards.map(function(c) {
          var right = c.pct !== null
            ? '<div class="iq-ch-progress-col"><div class="iq-mini-bar"><span style="width:' + c.pct + '%"></span></div><span class="iq-pct-label iq-tabular">' + fmtNum(c.pct) + '%</span></div>'
            : '<span class="iq-chevron iq-mirror-icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></span>';
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
    } else if (type === 'charity' && typeof window.activateTab === 'function') {
      closeChallengeDetail();
      window.activateTab('charity');
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

    var focusTitle = tLabel('Daily Concentric Telemetry');
    if (focusId === 'prayers') focusTitle = tLabel('Prayers') + ': ' + fmtNum(summary.prayersDone) + '/' + fmtNum(summary.prayersTotal);
    else if (focusId === 'vol') focusTitle = tLabel('Voluntary') + ': ' + fmtNum(summary.volDone) + ' ' + tLabel('logged');
    else if (focusId === 'deeds') focusTitle = tLabel('Deeds') + ': ' + fmtNum(summary.deedsDone) + ' ' + tLabel('completed');
    else focusTitle = tLabel('Dhikr') + ': ' + fmtNum(summary.dhikrToday) + '/' + fmtNum(summary.dhikrGoal);

    var timerBannerHtml = nextP
      ? '<div class="iq-notif-card" style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px;">' +
          '<div><div class="iq-ch-title">' + esc(tLabel('Next Prayer:')) + ' ' + esc(tLabel(nextP.name)) + '</div><div class="iq-ch-sub iq-tabular"><bdi dir="ltr">' + esc(nextP.timeLabel) + '</bdi> &middot; ' + esc(nextP.shortRemaining) + '</div></div>' +
          '<button type="button" class="iq-pill-btn" onclick="window.quickChallengeAction(\'timer\')">' + esc(tLabel('Times')) + '</button>' +
        '</div>'
      : '';

    var prayerRowHtml = '<div class="iq-sheet-prayer-row">' +
      prayerDefs.map(function(pr) {
        var nm = pr.name || (pr.id ? pr.id.charAt(0).toUpperCase() + pr.id.slice(1) : 'Prayer');
        var raw = pMap[pr.id];
        var done = !!raw;
        var isQada = raw === 'qada';
        return '<button type="button" class="iq-sheet-prayer-btn' + (done ? ' done' : '') + (isQada ? ' qada' : '') + '" onclick="window.quickToggleSheetPrayer(\'' + esc(pr.id) + '\')">' +
          (done ? (isQada ? '&#8634; ' : '&#10003; ') : '') + esc(tLabel(nm)) +
        '</button>';
      }).join('') +
      '</div>';

    var rows = [
      { title: tLabel('Dhikr Tap') + ' (+1)', sub: fmtNum(summary.dhikrToday) + ' / ' + fmtNum(summary.dhikrGoal) + ' ' + tLabel('completed'), btn: tLabel('Progress'), act: 'dhikr1', icon: 'beads' },
      { title: tLabel('Tasbih Cycle') + ' (+33)', sub: tLabel('Complete a full 33-count dhikr set'), btn: tLabel('Start'), act: 'dhikr33', icon: 'sparkles' },
      { title: tLabel('Quran Session') + ' (+5m)', sub: fmtNum(summary.quranToday) + ' / ' + fmtNum(summary.quranGoal) + ' ' + tLabel('min logged today'), btn: '+5m ' + tLabel('Read'), act: 'quran5', icon: 'book-open' },
      { title: tLabel('Quran Reader'), sub: tLabel('Read by Surah or Juz with audio'), btn: tLabel('Open'), act: 'quran', icon: 'book-open' },
      { title: tLabel('Daily Quests'), sub: fmtNum(summary.questsDone) + ' / ' + fmtNum(summary.questsTotal) + ' ' + tLabel('completed'), btn: tLabel('Open'), act: 'quests', icon: 'scroll' },
      { title: tLabel('Sadaqah & Charity'), sub: tLabel('Log a charity or sadaqah act'), btn: tLabel('Log'), act: 'charity', icon: 'heart' },
      { title: tLabel('Masjid Check-ins'), sub: fmtNum(summary.masjidTotal) + ' ' + tLabel('visits logged'), btn: tLabel('Map'), act: 'masjid', icon: 'mosque' },
      { title: tLabel('Voluntary & Deeds'), sub: fmtNum(summary.volDone + summary.deedsDone) + ' ' + tLabel('completed today'), btn: tLabel('Show All'), act: 'vol', icon: 'sun' }
    ];

    var goalsEditorHtml = '<div class="iq-goal-editor">' +
      '<div class="iq-ch-title">' + esc(tLabel('Daily Goal Targets')) + '</div>' +
      '<div class="iq-goal-editor-grid">' +
        '<div class="iq-goal-field"><label for="iqGoalDhikrInput">' + esc(tLabel('Daily Dhikr Target')) + '</label><input id="iqGoalDhikrInput" type="number" min="33" max="5000" value="' + esc(summary.dhikrGoal) + '"></div>' +
        '<div class="iq-goal-field"><label for="iqGoalQuranInput">' + esc(tLabel('Daily Quran (min)')) + '</label><input id="iqGoalQuranInput" type="number" min="5" max="180" value="' + esc(summary.quranGoal) + '"></div>' +
      '</div>' +
      '<button type="button" class="iq-gold-btn" onclick="window.saveGoalTargetsForm()">' + esc(tLabel('Save Daily Targets')) + '</button>' +
    '</div>';

    bodyEl.innerHTML =
      timerBannerHtml +
      '<div class="iq-ring-hero-card">' +
        '<div class="iq-ring-wrap">' +
          renderFocusRingSvg(summary, 108) +
          '<div class="iq-ring-legend">' +
            '<span class="iq-ch-sub" style="font-weight:700;color:var(--text);">' + esc(focusTitle) + '</span>' +
            '<span class="iq-ch-sub iq-tabular">' + esc(tLabel('Prayers')) + ' ' + fmtNum(summary.prayersPct) + '% &middot; ' + esc(tLabel('Dhikr')) + ' ' + fmtNum(summary.dhikrPct) + '% &middot; ' + esc(tLabel('Quran')) + ' ' + fmtNum(summary.quranPct) + '%</span>' +
          '</div>' +
        '</div>' +
        '<div class="iq-timer-box">' +
          '<div class="iq-timer-val iq-tabular" id="iqChallengeStopwatch"><bdi dir="ltr">' + formatStopwatch(_stopwatchSec) + '</bdi></div>' +
          '<div class="iq-timer-sub">' + esc(tLabel('Focus Session')) + '</div>' +
          '<button type="button" id="iqStopwatchBtn" class="iq-pill-btn" onclick="window.toggleChallengeStopwatch()">' + esc(tLabel(_stopwatchRunning ? 'Pause' : 'Start')) + '</button>' +
        '</div>' +
      '</div>' +
      prayerRowHtml +
      '<div class="iq-feed-head"><span>' + esc(tLabel('Daily challenges')) + '</span><span class="iq-tabular">' + fmtNum(summary.overallPct) + '% ' + esc(tLabel('overall')) + '</span></div>' +
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
      ? badgeCatLabel + (count ? ' · ' + fmtNum(count) + ' entries' : '')
      : (tab.desc || (count ? fmtNum(count) + ' entries' : ''));
    return '<button type="button" data-tab="' + esc(tab.id) + '" class="iq-drawer-tab' + (isAct ? ' active' : '') + '"' + (isAct ? ' aria-current="page"' : '') + ' onclick="window.drawerNavigate && window.drawerNavigate(\'' + esc(tab.id) + '\')">' +
      '<span class="iq-drawer-tab-icon" aria-hidden="true">' + icon(tab.icon || tab.id) + '</span>' +
      '<span class="iq-drawer-tab-meta">' +
        '<span class="iq-drawer-tab-label">' + esc(tLabel(tab.label)) + '</span>' +
        (subText ? '<span class="iq-drawer-tab-desc">' + esc(subText) + '</span>' : '') +
      '</span>' +
      '<span class="iq-drawer-tab-arrow iq-mirror-icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></span>' +
    '</button>';
  }

  function _bindDrawerAccordionToggle(tabsBox) {
    if (!tabsBox || tabsBox._iqToggleBound || typeof tabsBox.addEventListener !== 'function') return;
    tabsBox._iqToggleBound = true;
    tabsBox.addEventListener('toggle', function(ev) {
      var det = ev && ev.target;
      if (!det || !det.classList || !det.classList.contains('iq-drawer-group')) return;
      var sum = det.querySelector && det.querySelector('.iq-drawer-group-head');
      if (sum && typeof sum.setAttribute === 'function') {
        sum.setAttribute('aria-expanded', det.open ? 'true' : 'false');
      }
    }, true);
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

    _bindDrawerAccordionToggle(tabsBox);
    tabsBox.innerHTML = group.map(function(grp, idx) {
      var containsActive = grp.tabs.some(function(tb) { return tb.id === activeTab; });
      var isOpen = (containsActive || group.length <= 2 || idx === 0);
      var openAttr = isOpen ? ' open' : '';
      var panelId = 'iqDrawerGrp_' + esc(activeCat) + '_' + esc(grp.id || idx);
      return '<details class="iq-drawer-group"' + openAttr + '>' +
        '<summary class="iq-drawer-group-head" aria-expanded="' + (isOpen ? 'true' : 'false') + '" aria-controls="' + panelId + '">' +
          '<span class="iq-drawer-group-ico" aria-hidden="true">' + icon(grp.icon || grp.id) + '</span>' +
          '<span class="iq-drawer-group-title">' + esc(tLabel(grp.label)) + '</span>' +
          '<span class="iq-drawer-group-count iq-tabular">' + fmtNum(grp.tabs.length) + '</span>' +
          '<span class="iq-drawer-group-chevron" aria-hidden="true"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg></span>' +
        '</summary>' +
        '<div id="' + panelId + '" class="iq-drawer-grid">' +
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
        '<div class="iq-ch-title">' + esc(tLabel('Daily Worship Status')) + '</div>' +
        '<div class="iq-ch-sub iq-tabular">' + esc(tLabel('Prayers')) + ': ' + fmtNum(summary.prayersDone) + '/' + fmtNum(summary.prayersTotal) + ' &middot; ' + esc(tLabel('Dhikr')) + ': ' + fmtNum(summary.dhikrToday) + '/' + fmtNum(summary.dhikrGoal) + '</div>' +
      '</div>' +
      '<div class="iq-notif-card">' +
        '<div class="iq-ch-title">' + esc(tLabel('Browser Reminders')) + '</div>' +
        '<div class="iq-ch-sub">' + esc(tLabel(enabled ? 'Prayer & streak reminders active.' : 'Enable push reminders for prayer streaks.')) + '</div>' +
        '<button type="button" class="iq-pill-btn" style="margin-top:8px;" onclick="App.toggleNotifications();setTimeout(window.renderNotifDrawerBody,200);">' + esc(tLabel(enabled ? 'Disable' : 'Enable')) + '</button>' +
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
  window.renderFocusRingSvg = renderFocusRingSvg;
  window.renderConcentricRingsSvg = renderFocusRingSvg;
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
