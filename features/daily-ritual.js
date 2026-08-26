(function() {
  function showDailyRitual(onDone) {
    const t = today();
    if (S.lastDailyRitual === t) {
      if (typeof onDone === 'function') onDone();
      return;
    }

    const l = S.log[t] || {};
    const prayers = Object.values(l.p || {}).filter(v => v).length;
    const questsDone = (S.dq || []).filter(q => q.done).length;

    const quotes = [
      'Hold yourselves accountable before you are held accountable.',
      'The best of deeds are those done consistently.',
      'Take advantage of five before five.'
    ];
    const quote = quotes[Math.floor(Math.random() * quotes.length)];

    window._iqModalDone = typeof onDone === 'function' ? onDone : null;

    const ov = openToastModal(`<div class="daily-ritual">
      <div class="dr-title">${iqIcon('moon')} Daily Reflection</div>
      <div class="dr-stats">
        <span>${prayers}/5 prayers</span>
        <span>${S.xp} XP</span>
        <span>${questsDone} quests</span>
      </div>
      <div class="dr-rating">
        <div class="dr-label">Rate your day</div>
        <div class="dr-stars">
          ${[1,2,3,4,5].map(n => `<button class="dr-star" onclick="window._drRating=${n}">★</button>`).join('')}
        </div>
      </div>
      <div class="dr-reflection">
        <div class="dr-label">What went well today?</div>
        <textarea id="drReflection" class="dr-textarea" placeholder="Reflect on your day..."></textarea>
      </div>
      <div class="dr-quote">"${quote}"</div>
      <button class="dr-close" onclick="saveDailyRitual(window._drRating||0, document.getElementById('drReflection').value)">Save & Close</button>
    </div>`);
    if (!ov) {
      window._iqModalDone = null;
      if (typeof onDone === 'function') onDone();
      return;
    }

    window._drRating = 0;
  }

  function saveDailyRitual(rating, reflection) {
    const t = today();
    if (!S.dailyRatings) S.dailyRatings = {};
    if (!S.dailyReflections) S.dailyReflections = {};

    S.dailyRatings[t] = rating;
    S.dailyReflections[t] = reflection;
    S.lastDailyRitual = t;

    saveState();

    closeToastOverlay();

    toast(iqIcon('check-circle'), 'Daily reflection saved!');
  }

  window.showDailyRitual = showDailyRitual;
  window.saveDailyRitual = saveDailyRitual;
})();
