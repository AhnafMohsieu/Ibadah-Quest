(function() {
  function checkConsistency() {
    const t = today();
    // Boot captures yesterday's lad BEFORE rolling it forward; we consume it here.
    // Fall back to S.lad when boot didn't capture (direct calls, older flows).
    const last = (typeof window !== 'undefined' && window._iqPrevLad) || S.lad;
    if (typeof window !== 'undefined') window._iqPrevLad = null;

    // Comeback bonus — compares the captured previous day against today.
    if (last && last !== t) {
      const lastDate = new Date(last + 'T00:00:00');
      const todayDate = new Date(t + 'T00:00:00');
      const diffDays = Math.round((todayDate - lastDate) / 86400000);

      if (diffDays === 1) {
        S.xp += 50;
        S.lv = lvFrom(S.xp);
        toast(iqIcon('arrow-left'), 'Comeback Bonus: +50 XP!');
        saveState();
      } else if (diffDays > 1) {
        S.xp += 100;
        S.lv = lvFrom(S.xp);
        toast(iqIcon('arrow-left'), 'Welcome Back! +100 XP!');
        saveState();
      }
    }

    // Single canonical field from here on (declared in freshState).
    S.lad = t;
  }

  function checkWeeklyConsistency() {
    const t = today();
    const dayOfWeek = new Date().getDay();

    // Only check on Sunday
    if (dayOfWeek !== 0) return;
    if (S.lastWeeklyConsistency === t) return;

    // Count days logged this week
    let daysLogged = 0;
    const now = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dk = today(d);
      if (S.log[dk] && Object.values(S.log[dk].p || {}).filter(v => v).length >= 5) {
        daysLogged++;
      }
    }

    let bonus = 0;
    if (daysLogged >= 7) bonus = 500;
    else if (daysLogged >= 6) bonus = 200;
    else if (daysLogged >= 5) bonus = 100;

    if (bonus > 0) {
      S.xp += bonus;
      S.lv = lvFrom(S.xp);
      const label = daysLogged >= 7 ? 'Perfect Week!' : `${daysLogged} Days Strong!`;
      toast(iqIcon('calendar'), `${label} +${bonus} XP!`);
      saveState();
    }

    S.lastWeeklyConsistency = t;
    saveState();
  }

  window.checkConsistency = checkConsistency;
  window.checkWeeklyConsistency = checkWeeklyConsistency;
})();
