// core/dhikr.js — Dhikr counter logic with sincere daily XP cap & batched persistence
(function() {
  var MAX_DAILY_TAP_XP = 100;
  var MAX_DAILY_CYCLE_BONUSES = 5;
  var _saveTimer = null;

  function _flushSave() {
    if (_saveTimer) { clearTimeout(_saveTimer); _saveTimer = null; }
    if (typeof saveState === 'function') saveState();
  }

  function _scheduleBatchedSave(immediate) {
    if (immediate || typeof document === 'undefined' || typeof setTimeout !== 'function') {
      _flushSave();
      return;
    }
    if (_saveTimer) clearTimeout(_saveTimer);
    _saveTimer = setTimeout(_flushSave, 350);
  }

  if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
    document.addEventListener('visibilitychange', function() {
      if (document.visibilityState === 'hidden' && _saveTimer) _flushSave();
    });
  }

  function updateDhikrStreak() {
    const t = today();
    if (!S.dhikrStats) S.dhikrStats = { total: {}, daily: {}, streak: 0, bestStreak: 0, lastSessionDate: null, badges: [], achievements: [] };

    const todaySessions = S.dhikrStats.daily[t] || {};
    const hasDhikrToday = Object.keys(todaySessions).length > 0;

    if (hasDhikrToday) {
      if (S.dhikrStats.lastSessionDate === t) return;
      const yesterdayStr = yesterdayKey();
      if (S.dhikrStats.lastSessionDate === yesterdayStr) S.dhikrStats.streak++;
      else S.dhikrStats.streak = 1;

      S.dhikrStats.lastSessionDate = t;
      if (S.dhikrStats.streak > S.dhikrStats.bestStreak) S.dhikrStats.bestStreak = S.dhikrStats.streak;
      _scheduleBatchedSave(false);
    }
  }

  function tapDhikr() {
    if (!S.dhikrCounters) S.dhikrCounters = {};
    const idx = S.dhikrCounters._active || 0;
    S.dhikrCounters[idx] = (S.dhikrCounters[idx] || 0) + 1;
    if (S.dhikrSettings && S.dhikrSettings.haptic && typeof navigator !== 'undefined' && navigator.vibrate) { navigator.vibrate(10); }
    const d = DHIKR_COUNTER_DATA[idx % DHIKR_COUNTER_DATA.length];
    const t = (typeof today === 'function') ? today() : '1970-01-01';
    const maxTapXp = (typeof MAX_DAILY_TAP_XP === 'number') ? MAX_DAILY_TAP_XP : 100;
    const maxCycleBonuses = (typeof MAX_DAILY_CYCLE_BONUSES === 'number') ? MAX_DAILY_CYCLE_BONUSES : 5;
    if (!S.dhikrTapXpDay || S.dhikrTapXpDay.date !== t) S.dhikrTapXpDay = { date: t, xp: 0, cycles: 0 };

    let gain = 1;
    let tapXp = 0;
    if (S.dhikrTapXpDay.xp < maxTapXp) {
      tapXp = gain;
      S.dhikrTapXpDay.xp += tapXp;
    }

    let cycleBonus = 0;
    const cycleCount = S.dhikrCounters[idx];
    const completedCycle = S.dhikrCounters[idx] >= d.target;
    if (completedCycle) {
      if (typeof toast === 'function') toast(typeof iqIcon === 'function' ? iqIcon('sparkles') : '✨', 'SubhanAllah — Set complete!', false, 1800);
      if (S.dhikrSettings && S.dhikrSettings.haptic && typeof navigator !== 'undefined' && navigator.vibrate) { navigator.vibrate([30, 40, 30]); }
      gain += 20;
      if (S.dhikrTapXpDay.cycles < maxCycleBonuses) {
        cycleBonus = 20;
        S.dhikrTapXpDay.cycles += 1;
      }
      S.dhikrCounters[idx] = 0;
    }

    if (!S.dhikrSessions) S.dhikrSessions = [];
    if (completedCycle || cycleCount === 1) {
      S.dhikrSessions.push({ date: t, dhikrId: idx, type: idx, count: cycleCount, timestamp: Date.now(), ts: Date.now() });
    }
    if (!S.dhikrStats) S.dhikrStats = { total: {}, daily: {}, streak: 0, bestStreak: 0, lastSessionDate: null, badges: [], achievements: [] };
    S.dhikrStats.total[idx] = (S.dhikrStats.total[idx] || 0) + 1;
    if (!S.dhikrStats.daily[t]) S.dhikrStats.daily[t] = {};
    S.dhikrStats.daily[t][idx] = (S.dhikrStats.daily[t][idx] || 0) + 1;
    if (typeof updateDhikrStreak === 'function') updateDhikrStreak();
    const badgeGained = checkDhikrBadges();
    const totalXp = tapXp + cycleBonus + (badgeGained ? 25 * badgeGained : 0);
    gain = totalXp;
    if (gain > 0 && typeof applyXpDelta === 'function') applyXpDelta(gain);
    if (typeof _scheduleBatchedSave === 'function') _scheduleBatchedSave(completedCycle);
    else if (typeof saveState === 'function') saveState();
    if (typeof renderDhikrCounter === 'function') renderDhikrCounter();
    if (typeof window !== 'undefined' && window.renderLv) window.renderLv();
    if (typeof window !== 'undefined' && window.renderTopBar) window.renderTopBar();
  }

  function checkDhikrBadges() {
    if (!S.dhikrStats) return 0;
    const badges = S.dhikrStats.badges || [];
    let gained = 0;
    DHIKR_BADGES.forEach(badge => {
      if (!badges.includes(badge.id) && badge.check(S)) {
        badges.push(badge.id);
        toast(iqIcon('trophy'), `Milestone reached: ${badge.name}`);
        gained++;
      }
    });
    S.dhikrStats.badges = badges;
    return gained;
  }

  function resetDhikr() {
    if (!S.dhikrCounters) S.dhikrCounters = {};
    const idx = S.dhikrCounters._active || 0;
    const cur = S.dhikrCounters[idx] || 0;
    if (cur === 0) return;
    if (cur >= 5 && typeof window !== 'undefined' && typeof window.iqConfirmDialog === 'function') {
      window.iqConfirmDialog('Reset current tasbih count (' + cur + ')?', function() {
        S.dhikrCounters[idx] = 0;
        _flushSave();
        renderDhikrCounter();
      });
      return;
    }
    S.dhikrCounters[idx] = 0;
    _flushSave();
    renderDhikrCounter();
  }

  function nextDhikr() { if (!S.dhikrCounters) S.dhikrCounters={}; S.dhikrCounters._active=((S.dhikrCounters._active||0)+1)%DHIKR_COUNTER_DATA.length; _flushSave(); renderDhikrCounter(); }
  function toggleDhikrHaptic() {
    if (!S.dhikrSettings || typeof S.dhikrSettings !== 'object') S.dhikrSettings = {};
    S.dhikrSettings.haptic = !S.dhikrSettings.haptic;
    _flushSave();
    renderDhikrCounter();
  }
  function addCustomDhikr(arabic, roman, english, target) {
    const clean = value => String(value == null ? '' : value).trim().slice(0, 500);
    arabic = clean(arabic); roman = clean(roman); english = clean(english);
    target = Math.max(1, Math.min(10000, Math.floor(Number(target) || 33)));
    if (!arabic || !english) return;
    if (!S.dhikrCustom) S.dhikrCustom = [];
    S.dhikrCustom.push({ id: 'custom_' + Date.now(), arabic, transliteration: roman, english, target, color: 'var(--accent)' });
    _flushSave(); renderDhikrCounter();
  }
  function removeCustomDhikr(id) {
    if (!S.dhikrCustom) return;
    S.dhikrCustom = S.dhikrCustom.filter(d => d.id !== id);
    _flushSave(); renderDhikrCounter();
  }
  function toggleDhikrFavorite(id) {
    if (!S.dhikrFavorites) S.dhikrFavorites = [];
    const idx = S.dhikrFavorites.indexOf(id);
    if (idx === -1) S.dhikrFavorites.push(id);
    else S.dhikrFavorites.splice(idx, 1);
    _flushSave();
  }

  function tapSituationalDhikr(category, index) {
    const cat = typeof SITUATIONAL_DHIKR !== 'undefined' && SITUATIONAL_DHIKR[category];
    index = Number(index);
    if (!cat || !Number.isInteger(index) || index < 0 || index >= cat.dhikr.length) return;
    if (!S.situationalXp) S.situationalXp = {};
    const key = category + '_' + index;
    const t = today();
    const dayKey = key + '|' + t;
    if (!S.situationalXp[dayKey]) S.situationalXp[dayKey] = 0;
    const count = S.situationalXp[dayKey];
    if (count >= 10) { toast(iqIcon('info'), 'Daily XP limit reached for this dua (10/day — continue reciting freely!)'); return; }
    S.situationalXp[dayKey] = count + 1;
    applyXpDelta(5);
    playSound('pop');
    _flushSave();
    if (typeof renderLv === 'function') renderLv();
    if (typeof renderTopBar === 'function') renderTopBar();
    if (typeof renderSituationalDhikr === 'function') renderSituationalDhikr();
  }

  function toggleSitFav(category, index) {
    const cat = typeof SITUATIONAL_DHIKR !== 'undefined' && SITUATIONAL_DHIKR[category];
    index = Number(index);
    if (!cat || !Number.isInteger(index) || index < 0 || index >= cat.dhikr.length) return;
    if (!S.sitFavs) S.sitFavs = [];
    const id = category + '_' + index;
    const idx = S.sitFavs.indexOf(id);
    if (idx === -1) { S.sitFavs.push(id); toast(iqIcon('star'), 'Saved to favorites'); }
    else { S.sitFavs.splice(idx, 1); toast(iqIcon('star'), 'Removed from favorites'); }
    _flushSave();
    if (typeof renderSituationalDhikr === 'function') renderSituationalDhikr();
  }

  window.updateDhikrStreak = updateDhikrStreak;
  window.tapDhikr = tapDhikr;
  window.checkDhikrBadges = checkDhikrBadges;
  window.resetDhikr = resetDhikr;
  window.nextDhikr = nextDhikr;
  window.toggleDhikrHaptic = toggleDhikrHaptic;
  window.addCustomDhikr = addCustomDhikr;
  window.removeCustomDhikr = removeCustomDhikr;
  window.tapSituationalDhikr = tapSituationalDhikr;
  window.toggleSitFav = toggleSitFav;
  window.toggleDhikrFavorite = toggleDhikrFavorite;
})();
