(function() {
  function _hasRealActivity(s) {
    if (!s || typeof s !== 'object') return false;
    if (Number(s.xp || 0) > 0 || Number(s.cs || 0) > 0 || Number(s.tp || 0) > 0) return true;
    var logs = s.log && typeof s.log === 'object' ? Object.values(s.log) : [];
    return logs.some(function(entry) {
      if (!entry || typeof entry !== 'object') return false;
      var p = Object.values(entry.p || {}).some(Boolean);
      var d = Object.values(entry.d || {}).some(Boolean);
      var v = Object.values(entry.v || {}).some(Boolean);
      return p || d || v || Number(entry.q || 0) > 0;
    });
  }

  function showDailySummary(onDone, force) {
    const t = today();
    if (S.lastDailySummary === t) {
      if (typeof onDone === 'function') onDone();
      return;
    }
    const hasActivity = _hasRealActivity(S);
    if (!force && !hasActivity) {
      if (typeof window !== 'undefined') window._iqModalDone = null;
      if (typeof onDone === 'function') onDone();
      return;
    }

    const l = (S.log && S.log[t]) || {};
    const prayers = Object.values(l.p || {}).filter(v => v).length;
    const questsDone = (S.dq || []).filter(q => q.done).length;
    const streak = S.cs || 0;

    const quotes = [
      'The most beloved deeds to Allah are those done consistently, even if small. \u2014 Sahih al-Bukhari 6464',
      'Indeed, with hardship comes ease. \u2014 Qur\'an 94:6',
      'Whoever takes a path seeking knowledge, Allah makes easy for them a path to Paradise. \u2014 Sahih Muslim 2699'
    ];
    const seed = new Date().getDate() % quotes.length;
    const quote = quotes[seed];

    window._iqModalDone = typeof onDone === 'function' ? onDone : null;

    const ov = openToastModal(`<div class="daily-summary">
      <div class="ds-title">${iqIcon('calendar')} Daily Reflection</div>
      <div class="ds-grid">
        <div class="ds-stat"><div class="ds-val iq-tabular">${prayers}/5</div><div class="ds-label">Prayers</div></div>
        <div class="ds-stat"><div class="ds-val iq-tabular">${S.xp}</div><div class="ds-label">Total XP</div></div>
        <div class="ds-stat"><div class="ds-val iq-tabular">${questsDone}/4</div><div class="ds-label">Quests</div></div>
        <div class="ds-stat"><div class="ds-val iq-tabular">${streak}</div><div class="ds-label">Consistency</div></div>
      </div>
      <div class="ds-quote">"${quote}"</div>
      <button class="ds-close" onclick="closeToastOverlay()">Alhamdulillah</button>
    </div>`);
    if (!ov) {
      window._iqModalDone = null;
      if (typeof onDone === 'function') onDone();
      return;
    }

    S.lastDailySummary = t;
    saveState();
  }

  window._hasRealActivity = _hasRealActivity;
  window.shouldShowDailySummary = function() { return _hasRealActivity(typeof S !== 'undefined' ? S : null); };
  window.showDailySummary = showDailySummary;
})();
