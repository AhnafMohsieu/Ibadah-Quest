(function() {
  function safeText(value) {
    return window.escapeHTML(value);
  }
  const _hPrompts = (typeof HEALTH_PROMPTS !== 'undefined' && Array.isArray(HEALTH_PROMPTS)) ? HEALTH_PROMPTS : [];
  const WATER_TARGET = (_hPrompts.find(p => p.id === 'water') || { target: 8 }).target;
  const SLEEP_TARGET = (_hPrompts.find(p => p.id === 'sleep') || { target: 8 }).target;

  function getTodayHealth() {
    const t = today();
    if (!S.healthLog) S.healthLog = {};
    if (!S.healthLog[t]) S.healthLog[t] = { water: 0, sleep: 0, exercise: [], meals: {} };
    const h = S.healthLog[t];
    h.water = Math.max(0, Math.min(WATER_TARGET + 2, Number(h.water) || 0));
    h.sleep = Math.max(0, Math.min(12, Number(h.sleep) || 0));
    if (!Array.isArray(h.exercise)) h.exercise = [];
    if (!h.meals || typeof h.meals !== 'object') h.meals = {};
    return h;
  }

  function logWater(glasses) {
    const h = getTodayHealth();
    const value = Number(glasses);
    if (!Number.isFinite(value)) return;
    h.water = Math.max(0, Math.min(WATER_TARGET + 2, value));
    grantMilestoneXp();
    saveState();
    renderHealthLog();
  }

  function logSleep(hours) {
    const h = getTodayHealth();
    h.sleep = Math.max(0, Math.min(12, parseFloat(hours) || 0));
    grantMilestoneXp();
    saveState();
    renderHealthLog();
  }

  function logExercise(type, duration) {
    if (!EXERCISE_TYPES.some(item => item.id === type)) return;
    const minutes = Math.max(1, Math.min(1440, parseInt(duration, 10) || 0));
    if (!minutes) return;
    const h = getTodayHealth();
    h.exercise.push({ type, duration: minutes, date: today() });
    grantMilestoneXp();
    saveState();
    renderHealthLog();
  }

  function toggleMeal(meal) {
    if (!['breakfast', 'lunch', 'dinner'].includes(meal)) return;
    const h = getTodayHealth();
    h.meals[meal] = !h.meals[meal];
    grantMilestoneXp();
    saveState();
    renderHealthLog();
  }

  function getHealthScore() {
    const h = getTodayHealth();
    let score = 0;
    score += Math.min(25, (h.water / WATER_TARGET) * 25);
    score += Math.min(25, (h.sleep >= SLEEP_TARGET ? 25 : (h.sleep / SLEEP_TARGET) * 25));
    score += Math.min(25, h.exercise.length > 0 ? 25 : 0);
    const mealsDone = Object.values(h.meals).filter(v => v).length;
    score += Math.min(25, (mealsDone / 3) * 25);
    return Math.round(score);
  }

  function grantMilestoneXp() {
    const h = getTodayHealth();
    const t = today();
    if (!S.healthXpClaimed) S.healthXpClaimed = {};
    if (!S.healthXpClaimed[t]) S.healthXpClaimed[t] = [];
    const claimed = S.healthXpClaimed[t];
    let xp = 0;
    const grant = (key, reached) => {
      if (reached && !claimed.includes(key)) {
        claimed.push(key);
        xp += 25;
      }
    };
    grant('water', h.water >= WATER_TARGET);
    grant('sleep', h.sleep >= SLEEP_TARGET);
    grant('exercise', h.exercise.length > 0);
    grant('meals', Object.values(h.meals).filter(v => v).length >= 3);
    if (xp > 0) {
      applyXpDelta(xp);
      if (typeof window !== 'undefined' && window.renderLv) window.renderLv();
      if (typeof window !== 'undefined' && window.renderTopBar) window.renderTopBar();
    }
  }

  function renderHealthLog() {
    const el = document.getElementById('healthlogArea');
    if (!el) return;
    const h = getTodayHealth();
    const score = getHealthScore();
    const _t = (s) => (typeof window !== 'undefined' && typeof window.t === 'function') ? window.t(s) : s;
    const _n = (v) => (typeof window !== 'undefined' && typeof window.iqFormatNum === 'function') ? window.iqFormatNum(v) : String(v);

    let html = `<div class="section-title">${iqIcon('heart')} ${safeText(_t('Health & Wellness'))}</div>`;

    // Health Score
    html += `<div class="health-score-card">
      <div class="health-score-num iq-tabular">${_n(score)}</div>
      <div class="health-score-label">${safeText(_t('Health Score'))}</div>
      <div class="health-score-bar"><div class="health-score-fill" style="width:${score}%"></div></div>
    </div>`;

    // Water Tracker
    html += `<div class="health-card">
      <div class="health-card-header">${iqIcon('droplets')} ${safeText(_t('Water'))} (<span class="iq-tabular">${_n(h.water)}/${_n(WATER_TARGET)}</span> ${safeText(_t('glasses'))})</div>
      <div class="water-grid">
        ${Array.from({length: WATER_TARGET}, (_, i) =>
          `<button type="button" class="water-glass ${i < h.water ? 'filled' : ''}" aria-label="Log ${i + 1} glasses of water" aria-pressed="${i < h.water}" onclick="App.logWater(${i + 1})">${iqIcon('droplets')}</button>`
        ).join('')}
      </div>
    </div>`;

    // Sleep Tracker
    html += `<div class="health-card">
      <div class="health-card-header">${iqIcon('cloud-sun')} ${safeText(_t('Sleep'))} (<span class="iq-tabular">${_n(h.sleep)}h</span>)</div>
      <label class="sr-only" for="sleepInput">${safeText(_t('Hours slept'))}</label>
      <input type="number" class="profile-input" id="sleepInput" placeholder="${safeText(_t('Hours slept'))}" min="0" max="12" step="0.5" value="${h.sleep}">
      <button type="button" class="iq-pill-btn" onclick="App.logSleep(document.getElementById('sleepInput').value)" style="width:100%;">${safeText(_t('Log Sleep'))}</button>
    </div>`;

    // Exercise Tracker
    html += `<div class="health-card">
      <div class="health-card-header">${iqIcon('target')} ${safeText(_t('Exercise'))}</div>
      <label class="sr-only" for="exerciseType">${safeText(_t('Exercise type'))}</label>
      <select class="profile-input" id="exerciseType">
        ${EXERCISE_TYPES.map(e => `<option value="${e.id}">${safeText(_t(e.label))}</option>`).join('')}
      </select>
      <label class="sr-only" for="exerciseDuration">${safeText(_t('Duration (minutes)'))}</label>
      <input type="number" class="profile-input" id="exerciseDuration" placeholder="${safeText(_t('Duration (minutes)'))}" min="1">
      <button type="button" class="iq-pill-btn" onclick="App.logExercise(document.getElementById('exerciseType').value, document.getElementById('exerciseDuration').value)" style="width:100%;">${safeText(_t('Log Exercise'))}</button>
      ${h.exercise.length > 0 ? `<div class="exercise-log">${h.exercise.map(e => {
        const type = EXERCISE_TYPES.find(t => t.id === e.type);
        return `<div class="exercise-item">${iqIcon(type?.icon || 'target')} ${safeText(_t(type?.label || e.type))} - <span class="iq-tabular">${_n(e.duration)}${safeText(_t('min'))}</span></div>`;
      }).join('')}</div>` : ''}
    </div>`;

    // Meals Tracker
    html += `<div class="health-card">
      <div class="health-card-header">${iqIcon('utensils')} ${safeText(_t('Meals'))}</div>
      <div class="meal-grid">
        <button type="button" class="meal-item ${h.meals.breakfast ? 'eaten' : ''}" aria-pressed="${!!h.meals.breakfast}" onclick="App.toggleMeal('breakfast')">${iqIcon('sunrise')} ${safeText(_t('Breakfast'))}</button>
        <button type="button" class="meal-item ${h.meals.lunch ? 'eaten' : ''}" aria-pressed="${!!h.meals.lunch}" onclick="App.toggleMeal('lunch')">${iqIcon('sun')} ${safeText(_t('Lunch'))}</button>
        <button type="button" class="meal-item ${h.meals.dinner ? 'eaten' : ''}" aria-pressed="${!!h.meals.dinner}" onclick="App.toggleMeal('dinner')">${iqIcon('sunset')} ${safeText(_t('Dinner'))}</button>
      </div>
    </div>`;

    el.innerHTML = html;
  }

  window.renderHealthLog = renderHealthLog;
  window.logWater = logWater;
  window.logSleep = logSleep;
  window.logExercise = logExercise;
  window.toggleMeal = toggleMeal;
})();
