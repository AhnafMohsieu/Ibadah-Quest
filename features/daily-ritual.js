(function() {
  function showDailyRitual() {
    const t = today();
    if (S.lastDailyRitual === t) return;

    const l = S.log[t] || {};
    const prayers = Object.values(l.p || {}).filter(v => v).length;
    const questsDone = (S.dq || []).filter(q => q.done).length;

    const quotes = [
      'Hold yourselves accountable before you are held accountable.',
      'The best of deeds are those done consistently.',
      'Take advantage of five before five.'
    ];
    const quote = quotes[Math.floor(Math.random() * quotes.length)];

    const ov = document.getElementById('toastOverlay');
    if (!ov) return;

    ov.innerHTML = `<div class="daily-ritual">
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
    </div>`;

    ov.style.display = 'flex';
    ov.classList.add('show');
    ov.style.pointerEvents = 'auto';

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

    const ov = document.getElementById('toastOverlay');
    if (ov) {
      ov.classList.remove('show');
      setTimeout(() => { ov.style.display = 'none'; ov.innerHTML = ''; }, 300);
      ov.style.pointerEvents = 'none';
    }

    toast(iqIcon('check-circle'), 'Daily reflection saved!');
  }

  window.showDailyRitual = showDailyRitual;
  window.saveDailyRitual = saveDailyRitual;
})();
