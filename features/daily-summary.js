(function() {
  function showDailySummary(onDone) {
    const t = today();
    if (S.lastDailySummary === t) {
      if (typeof onDone === 'function') onDone();
      return;
    }

    const l = S.log[t] || {};
    const prayers = Object.values(l.p || {}).filter(v => v).length;
    const questsDone = (S.dq || []).filter(q => q.done).length;
    const streak = S.cs || 0;

    const quotes = [
      'The best of deeds are those done consistently, even if small.',
      'Indeed, Allah does not allow to be lost the reward of those who do good.',
      'Take advantage of five before five: your youth, health, wealth, free time, and life.'
    ];
    const quote = quotes[Math.floor(Math.random() * quotes.length)];

    window._iqModalDone = typeof onDone === 'function' ? onDone : null;

    const ov = openToastModal(`<div class="daily-summary">
      <div class="ds-title">${iqIcon('calendar')} Daily Summary</div>
      <div class="ds-grid">
        <div class="ds-stat"><div class="ds-val">${prayers}/5</div><div class="ds-label">Prayers</div></div>
        <div class="ds-stat"><div class="ds-val">${S.xp}</div><div class="ds-label">Total XP</div></div>
        <div class="ds-stat"><div class="ds-val">${questsDone}/4</div><div class="ds-label">Quests</div></div>
        <div class="ds-stat"><div class="ds-val">${streak}</div><div class="ds-label">Streak</div></div>
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

  window.showDailySummary = showDailySummary;
})();
