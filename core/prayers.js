(function() {
  function _countPrayers(logEntry) {
    return Object.values((logEntry && logEntry.p) || {}).filter(function(v) { return !!v; }).length;
  }

  function _setPrayerState(id, targetMode) {
    const pr = PRAYERS.find(x => x.id === id);
    if (!pr) return;
    const l = tlog();
    if (!l.p) l.p = {};
    const prev = l.p[id];
    const wasDone = !!prev;
    const nextVal = targetMode === 'qada' ? (prev === 'qada' ? false : 'qada') : !wasDone;
    l.p[id] = nextVal;
    let xp = pr.xp;
    if (isFri() && id === 'dhuhr' && pr.fri) xp = pr.fri.xp;
    if (S.ab && S.ab.exp >= today()) xp *= 2;
    if (!wasDone && nextVal) {
      S.tp++;
      applyXpDelta(xp);
      if (isFri() && id === 'dhuhr') S.tj = (S.tj || 0) + 1;
      playSound('pop');
      if (typeof window.iqHaptic === 'function') window.iqHaptic(10);
      if (typeof checkSurpriseReward === 'function') checkSurpriseReward('prayer');
    } else if (wasDone && !nextVal) {
      S.tp = Math.max(0, S.tp - 1);
      spendXp(xp);
      if (isFri() && id === 'dhuhr') S.tj = Math.max(0, (S.tj || 0) - 1);
    }
    recalc(); checkQ(); checkA(); saveAndRenderDirty();
    if (typeof checkCombo === 'function') {
      const prayedFajr = !!l.p.fajr;
      const prayedAll = _countPrayers(l) >= 5;
      if (prayedFajr) checkCombo('fajr', true);
      if (prayedAll) checkCombo('adhkar', true);
      if (typeof window.renderCombos === 'function') window.renderCombos();
    }
    if (typeof window.autoTrackJourneyProgress === 'function') window.autoTrackJourneyProgress();
  }

  function toggleP(id) { _setPrayerState(id, true); }
  function togglePrayerQada(id) { _setPrayerState(id, 'qada'); }

  function toggleV(id) {
    const vp = VOLUNTARY.find(x => x.id === id);
    if (!vp) return;
    const l = tlog();
    if (!l.v) l.v = {};
    const w = !!l.v[id];
    l.v[id] = !w;
    let xp = vp.xp;
    if (S.ab && S.ab.exp >= today()) xp *= 2;
    if (!w) {
      S.vc[id] = (S.vc[id] || 0) + 1;
      applyXpDelta(xp);
      playSound('pop');
      if (typeof window.iqHaptic === 'function') window.iqHaptic(10);
    } else {
      S.vc[id] = Math.max(0, (S.vc[id] || 0) - 1);
      spendXp(xp);
    }
    checkQ(); checkA(); saveAndRenderDirty();
  }

  function toggleD(id) {
    const de = DEEDS.find(x => x.id === id);
    if (!de) return;
    const l = tlog();
    const w = !!l.d[id];
    l.d[id] = !w;
    let xp = de.xp;
    if (S.ab && S.ab.exp >= today()) xp *= 2;
    if (!w) {
      S.td[id] = (S.td[id] || 0) + 1;
      applyXpDelta(xp);
      playSound('pop');
      if (typeof window.iqHaptic === 'function') window.iqHaptic(10);
    } else {
      S.td[id] = Math.max(0, (S.td[id] || 0) - 1);
      spendXp(xp);
    }
    recalc(); checkQ(); checkA(); saveAndRenderDirty();
    if (typeof window.autoTrackJourneyProgress === 'function') window.autoTrackJourneyProgress();
  }

  function _countConsecutiveEndingOn(startDateObj) {
    let s = 0;
    const ck = new Date(startDateObj.getTime());
    for (let guard = 0; guard < 400; guard++) {
      const dk = today(ck);
      if (S.log[dk] && _countPrayers(S.log[dk]) >= 5) {
        s++;
        ck.setDate(ck.getDate() - 1);
      } else {
        break;
      }
    }
    return s;
  }

  function recalc() {
    const prevCs = Number(S.cs) || 0;
    const all = Object.keys(S.log).filter(d => _countPrayers(S.log[d]) >= 5).sort();
    let best = 0, run = 0, prev = null;
    for (const d of all) {
      if (prev) {
        const p = new Date(prev + 'T00:00:00');
        const c = new Date(d + 'T00:00:00');
        const diffDays = Math.round((c - p) / 86400000);
        if (diffDays === 1) run++;
        else run = 1;
      } else {
        run = 1;
      }
      best = Math.max(best, run);
      prev = d;
    }
    S.bs = Math.max(Number(S.bs) || 0, best);

    const todayPrayers = _countPrayers(tlog());
    const tc = todayPrayers >= 5;
    const isPaused = !!(typeof S === 'object' && S && S.prayerSettings && S.prayerSettings.paused);

    if (tc) {
      const fullStreak = _countConsecutiveEndingOn(new Date());
      S.cs = isPaused ? Math.max(prevCs, fullStreak) : fullStreak;
      if (typeof checkSurpriseReward === 'function') checkSurpriseReward('allPrayers');
    } else if (isPaused) {
      S.cs = prevCs;
    } else {
      // Preserve unbroken streak through yesterday while today's prayers are still in progress
      const yd = new Date(Date.now() - 86400000);
      const yRun = _countConsecutiveEndingOn(yd);
      S.cs = yRun;
    }

    S.pd = (S.pdArchived || 0) + all.length;
    if (S.cs > S.bs) S.bs = S.cs;
    if (window.checkMilestones) checkMilestones();
  }

  window.toggleP = toggleP;
  window.togglePrayerQada = togglePrayerQada;
  window.toggleV = toggleV;
  window.toggleD = toggleD;
  window.recalc = recalc;
})();
