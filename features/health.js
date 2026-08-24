(function() {
  function safeText(value) {
    return typeof window.escapeHTML === 'function' ? window.escapeHTML(value) : String(value == null ? '' : value).replace(/[&<>\"']/g, function(ch) { return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[ch]; });
  }
  const WATER_TARGET = HEALTH_PROMPTS.find(p => p.id === 'water').target;
  const SLEEP_TARGET = HEALTH_PROMPTS.find(p => p.id === 'sleep').target;

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
    const oldLv = S.lv;
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
      S.xp += xp;
      S.lv = lvFrom(S.xp);
      if (S.lv > oldLv && window.levelUpToast) window.levelUpToast(S.lv, lvTitle(S.lv));
      if (typeof window !== 'undefined' && window.renderLv) window.renderLv();
      if (typeof window !== 'undefined' && window.renderTopBar) window.renderTopBar();
    }
  }

  function renderHealthLog() {
    const el = document.getElementById('healthlogArea');
    if (!el) return;
    const h = getTodayHealth();
    const score = getHealthScore();

    let html = `<div class="section-title">${iqIcon('heart')} Health & Wellness</div>`;

    // Health Score
    html += `<div class="health-score-card">
      <div class="health-score-num">${score}</div>
      <div class="health-score-label">Health Score</div>
      <div class="health-score-bar"><div class="health-score-fill" style="width:${score}%"></div></div>
    </div>`;

    // Water Tracker
    html += `<div class="health-card">
      <div class="health-card-header">${iqIcon('droplets')} Water (${h.water}/${WATER_TARGET} glasses)</div>
      <div class="water-grid">
        ${Array.from({length: WATER_TARGET}, (_, i) =>
          `<button type="button" class="water-glass ${i < h.water ? 'filled' : ''}" aria-label="Log ${i + 1} glasses of water" aria-pressed="${i < h.water}" onclick="App.logWater(${i + 1})">${iqIcon('droplets')}</button>`
        ).join('')}
      </div>
    </div>`;

    // Sleep Tracker
    html += `<div class="health-card">
      <div class="health-card-header">${iqIcon('cloud-sun')} Sleep (${h.sleep}h)</div>
      <label class="sr-only" for="sleepInput">Hours slept</label>
      <input type="number" class="profile-input" id="sleepInput" placeholder="Hours slept" min="0" max="12" step="0.5" value="${h.sleep}">
      <button class="shop-card" onclick="App.logSleep(document.getElementById('sleepInput').value)" style="justify-content:center;width:100%;">Log Sleep</button>
    </div>`;

    // Exercise Tracker
    html += `<div class="health-card">
      <div class="health-card-header">${iqIcon('target')} Exercise</div>
      <label class="sr-only" for="exerciseType">Exercise type</label>
      <select class="profile-input" id="exerciseType">
        ${EXERCISE_TYPES.map(e => `<option value="${e.id}">${iqIcon(e.icon)} ${e.label}</option>`).join('')}
      </select>
      <label class="sr-only" for="exerciseDuration">Exercise duration in minutes</label>
      <input type="number" class="profile-input" id="exerciseDuration" placeholder="Duration (minutes)" min="1">
      <button class="shop-card" onclick="App.logExercise(document.getElementById('exerciseType').value, document.getElementById('exerciseDuration').value)" style="justify-content:center;width:100%;">Log Exercise</button>
      ${h.exercise.length > 0 ? `<div class="exercise-log">${h.exercise.map(e => {
        const type = EXERCISE_TYPES.find(t => t.id === e.type);
        return `<div class="exercise-item">${iqIcon(type?.icon || 'target')} ${safeText(type?.label || e.type)} - ${e.duration}min</div>`;
      }).join('')}</div>` : ''}
    </div>`;

    // Meals Tracker
    html += `<div class="health-card">
      <div class="health-card-header">${iqIcon('utensils')} Meals</div>
      <div class="meal-grid">
        <button type="button" class="meal-item ${h.meals.breakfast ? 'eaten' : ''}" aria-pressed="${!!h.meals.breakfast}" onclick="App.toggleMeal('breakfast')">${iqIcon('sunrise')} Breakfast</button>
        <button type="button" class="meal-item ${h.meals.lunch ? 'eaten' : ''}" aria-pressed="${!!h.meals.lunch}" onclick="App.toggleMeal('lunch')">${iqIcon('sun')} Lunch</button>
        <button type="button" class="meal-item ${h.meals.dinner ? 'eaten' : ''}" aria-pressed="${!!h.meals.dinner}" onclick="App.toggleMeal('dinner')">${iqIcon('sunset')} Dinner</button>
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
