(function() {
  function _countPrayers(logEntry) {
    return Object.values((logEntry && logEntry.p) || {}).filter(function(v) { return !!v; }).length;
  }

  var QADA_TARGETS = { qul: 3, istighfar: 100, kursi: 10 };

  function _setPrayerState(id, targetMode) {
    const pr = PRAYERS.find(x => x.id === id);
    if (!pr) return;
    const l = tlog();
    if (!l.p) l.p = {};
    const prev = l.p[id];
    const wasDone = !!prev;
    const nextVal = targetMode === 'qada' ? (prev === 'qada' ? false : 'qada') : !wasDone;
    l.p[id] = nextVal;
    let fullXp = pr.xp;
    if (isFri() && id === 'dhuhr' && pr.fri) fullXp = pr.fri.xp;
    if (S.ab && S.ab.exp >= today()) fullXp *= 2;
    const qadaXp = Math.floor(fullXp / 4);

    if (!wasDone && nextVal === 'qada') {
      S.tp++;
      applyXpDelta(qadaXp);
      if (!l.qadaPenalty) l.qadaPenalty = {};
      l.qadaPenalty[id] = { fullXp: fullXp, grantedXp: qadaXp, qul: 0, istighfar: 0, kursi: 0, completed: false };
      if (isFri() && id === 'dhuhr') S.tj = (S.tj || 0) + 1;
      playSound('pop');
      if (typeof window.iqHaptic === 'function') window.iqHaptic(10);
    } else if (!wasDone && nextVal) {
      S.tp++;
      applyXpDelta(fullXp);
      if (l.qadaPenalty && l.qadaPenalty[id]) delete l.qadaPenalty[id];
      if (isFri() && id === 'dhuhr') S.tj = (S.tj || 0) + 1;
      playSound('pop');
      if (typeof window.iqHaptic === 'function') window.iqHaptic(10);
    } else if (prev === true && nextVal === 'qada') {
      const deduct = Math.max(0, fullXp - qadaXp);
      if (deduct > 0) spendXp(deduct);
      if (!l.qadaPenalty) l.qadaPenalty = {};
      l.qadaPenalty[id] = { fullXp: fullXp, grantedXp: qadaXp, qul: 0, istighfar: 0, kursi: 0, completed: false };
    } else if (wasDone && !nextVal) {
      S.tp = Math.max(0, S.tp - 1);
      const pen = (prev === 'qada' && l.qadaPenalty && l.qadaPenalty[id]) ? l.qadaPenalty[id] : null;
      spendXp(pen ? pen.grantedXp : fullXp);
      if (l.qadaPenalty && l.qadaPenalty[id]) delete l.qadaPenalty[id];
      if (isFri() && id === 'dhuhr') S.tj = Math.max(0, (S.tj || 0) - 1);
    }
    recalc(); checkQ(); checkA(); saveAndRenderDirty();
    if (nextVal) {
      if (!S.combos) S.combos = {};
      const dt = today();
      const bump = function(type) {
        const c = S.combos[type] || (S.combos[type] = { count: 0, lastDate: null, best: 0 });
        if (c.lastDate === dt) return;
        const diff = c.lastDate ? Math.round((new Date(dt + 'T00:00:00') - new Date(c.lastDate + 'T00:00:00')) / 86400000) : 0;
        c.count = diff === 1 ? c.count + 1 : 1;
        c.lastDate = dt;
        if (c.count > (c.best || 0)) c.best = c.count;
      };
      if (l.p.fajr) bump('fajr');
      if (_countPrayers(l) >= 5) bump('prayers');
    }
    if (typeof window.autoTrackJourneyProgress === 'function') window.autoTrackJourneyProgress();
  }

  function advanceQadaPenalty(id, field, delta) {
    const maxVal = QADA_TARGETS[field];
    if (!maxVal) return;
    const l = tlog();
    if (!l.p || l.p[id] !== 'qada') return;
    const pen = l.qadaPenalty && l.qadaPenalty[id];
    if (!pen || pen.completed) return;
    const step = Number(delta) || 1;
    pen[field] = Math.min(maxVal, Math.max(0, (Number(pen[field]) || 0) + step));
    if (pen.qul >= QADA_TARGETS.qul && pen.istighfar >= QADA_TARGETS.istighfar && pen.kursi >= QADA_TARGETS.kursi) {
      pen.completed = true;
      const remainingXp = Math.max(0, (Number(pen.fullXp) || 0) - (Number(pen.grantedXp) || 0));
      pen.grantedXp = pen.fullXp;
      if (remainingXp > 0) applyXpDelta(remainingXp);
      if (typeof toast === 'function') {
        const ico = typeof iqIcon === 'function' ? iqIcon('sparkles') : '✨';
        toast(ico, 'Qada atonement complete — full prayer XP unlocked!', false, 3500);
      }
    }
    recalc(); checkQ(); checkA(); saveAndRenderDirty();
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
  window.advanceQadaPenalty = advanceQadaPenalty;
  window.toggleV = toggleV;
  window.toggleD = toggleD;
  window.recalc = recalc;
})();
