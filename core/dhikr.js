// core/dhikr.js — Dhikr counter logic
(function() {
  function updateDhikrStreak() {
    const t = today();
    if (!S.dhikrStats) S.dhikrStats = { total: {}, daily: {}, streak: 0, bestStreak: 0, lastSessionDate: null, badges: [], achievements: [] };

    const todaySessions = S.dhikrStats.daily[t] || {};
    const hasDhikrToday = Object.keys(todaySessions).length > 0;

    if (hasDhikrToday) {
      if (S.dhikrStats.lastSessionDate === t) return;

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.getFullYear() + '-' + (yesterday.getMonth()+1).toString().padStart(2,'0') + '-' + yesterday.getDate().toString().padStart(2,'0');

      if (S.dhikrStats.lastSessionDate === yesterdayStr) {
        S.dhikrStats.streak++;
      } else {
        S.dhikrStats.streak = 1;
      }

      S.dhikrStats.lastSessionDate = t;

      if (S.dhikrStats.streak > S.dhikrStats.bestStreak) {
        S.dhikrStats.bestStreak = S.dhikrStats.streak;
      }

      saveState();
    }
  }
  function tapDhikr() {
    if (!S.dhikrCounters) S.dhikrCounters = {};
    const idx = S.dhikrCounters._active || 0;
    const oldLv = S.lv;
    S.dhikrCounters[idx] = (S.dhikrCounters[idx] || 0) + 1;
    if (S.dhikrSettings?.haptic && navigator.vibrate) { navigator.vibrate(10); }
    const d = DHIKR_COUNTER_DATA[idx % DHIKR_COUNTER_DATA.length];
    S.xp += 1;
    const cycleCount = S.dhikrCounters[idx];
    if (S.dhikrCounters[idx] >= d.target) {
      toast(iqIcon('sparkles'), 'Target reached! SubhanAllah!', false, 2000);
      if (S.dhikrSettings?.haptic && navigator.vibrate) { navigator.vibrate([50, 50, 50]); }
      S.xp += 20;
      S.dhikrCounters[idx] = 0;
    }
    if (!S.dhikrSessions) S.dhikrSessions = [];
    S.dhikrSessions.push({ date: today(), dhikrId: idx, count: cycleCount, timestamp: Date.now() });
    if (!S.dhikrStats) S.dhikrStats = { total: {}, daily: {}, streak: 0, bestStreak: 0, lastSessionDate: null, badges: [], achievements: [] };
    S.dhikrStats.total[idx] = (S.dhikrStats.total[idx] || 0) + 1;
    const t = today();
    if (!S.dhikrStats.daily[t]) S.dhikrStats.daily[t] = {};
    S.dhikrStats.daily[t][idx] = (S.dhikrStats.daily[t][idx] || 0) + 1;
    updateDhikrStreak();
    checkDhikrBadges();
    S.lv = lvFrom(S.xp);
    checkLevelUp(oldLv);
    saveState(); renderDhikrCounter();
    if (typeof window !== 'undefined' && window.renderLv) window.renderLv();
    if (typeof window !== 'undefined' && window.renderTopBar) window.renderTopBar();
  }
  function checkDhikrBadges() {
    if (!S.dhikrStats) return;
    const badges = S.dhikrStats.badges || [];
    DHIKR_BADGES.forEach(badge => {
      if (!badges.includes(badge.id) && badge.check(S)) {
        badges.push(badge.id);
        toast(iqIcon('trophy'), `Badge unlocked: ${badge.name}!`);
        S.xp += 25;
      }
    });
    S.dhikrStats.badges = badges;
  }
  function resetDhikr() { if (!S.dhikrCounters) S.dhikrCounters={}; const idx=S.dhikrCounters._active||0; S.dhikrCounters[idx]=0; saveState(); renderDhikrCounter(); }
  function nextDhikr() { if (!S.dhikrCounters) S.dhikrCounters={}; S.dhikrCounters._active=((S.dhikrCounters._active||0)+1)%DHIKR_COUNTER_DATA.length; saveState(); renderDhikrCounter(); }
  function addCustomDhikr(arabic, roman, english, target) {
    if (!S.dhikrCustom) S.dhikrCustom = [];
    S.dhikrCustom.push({
      id: 'custom_' + Date.now(),
      arabic,
      transliteration: roman,
      english,
      target: target || 33,
      color: 'var(--gold)'
    });
    saveState();
    renderDhikrCounter();
  }
  function removeCustomDhikr(id) {
    if (!S.dhikrCustom) return;
    S.dhikrCustom = S.dhikrCustom.filter(d => d.id !== id);
    saveState();
    renderDhikrCounter();
  }
  function toggleDhikrFavorite(id) {
    if (!S.dhikrFavorites) S.dhikrFavorites = [];
    const idx = S.dhikrFavorites.indexOf(id);
    if (idx === -1) {
      S.dhikrFavorites.push(id);
    } else {
      S.dhikrFavorites.splice(idx, 1);
    }
    saveState();
  }

  window.updateDhikrStreak = updateDhikrStreak;
  window.tapDhikr = tapDhikr;
  window.checkDhikrBadges = checkDhikrBadges;
  window.resetDhikr = resetDhikr;
  window.nextDhikr = nextDhikr;
  window.addCustomDhikr = addCustomDhikr;
  window.removeCustomDhikr = removeCustomDhikr;
  window.toggleDhikrFavorite = toggleDhikrFavorite;
})();
