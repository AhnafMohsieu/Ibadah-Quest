(function() {
  function showDailySummary() {
    const t = today();
    if (S.lastDailySummary === t) return;

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

    const ov = document.getElementById('toastOverlay');
    if (!ov) return;

    ov.innerHTML = `<div class="daily-summary">
      <div class="ds-title">${iqIcon('calendar')} Daily Summary</div>
      <div class="ds-grid">
        <div class="ds-stat"><div class="ds-val">${prayers}/5</div><div class="ds-label">Prayers</div></div>
        <div class="ds-stat"><div class="ds-val">${S.xp}</div><div class="ds-label">Total XP</div></div>
        <div class="ds-stat"><div class="ds-val">${questsDone}/4</div><div class="ds-label">Quests</div></div>
        <div class="ds-stat"><div class="ds-val">${streak}</div><div class="ds-label">Streak</div></div>
      </div>
      <div class="ds-quote">"${quote}"</div>
      <button class="ds-close" onclick="document.getElementById('toastOverlay').classList.remove('show');document.getElementById('toastOverlay').style.display='none';">Alhamdulillah</button>
    </div>`;

    ov.style.display = 'flex';
    ov.classList.add('show');
    ov.style.pointerEvents = 'auto';

    S.lastDailySummary = t;
    saveState();
  }

  window.showDailySummary = showDailySummary;
})();
