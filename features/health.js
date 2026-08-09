(function() {
  const WATER_TARGET = HEALTH_PROMPTS.find(p => p.id === 'water').target;
  const SLEEP_TARGET = HEALTH_PROMPTS.find(p => p.id === 'sleep').target;

  function getTodayHealth() {
    const t = today();
    if (!S.healthLog) S.healthLog = {};
    if (!S.healthLog[t]) S.healthLog[t] = { water: 0, sleep: 0, exercise: [], meals: {} };
    return S.healthLog[t];
  }

  function logWater(glasses) {
    const h = getTodayHealth();
    h.water = Math.max(0, Math.min(WATER_TARGET + 2, glasses));
    saveState();
    renderHealthLog();
  }

  function logSleep(hours) {
    const h = getTodayHealth();
    h.sleep = Math.max(0, Math.min(12, parseFloat(hours) || 0));
    saveState();
    renderHealthLog();
  }

  function logExercise(type, duration) {
    const h = getTodayHealth();
    h.exercise.push({ type, duration: parseInt(duration) || 0, date: today() });
    saveState();
    renderHealthLog();
  }

  function toggleMeal(meal) {
    const h = getTodayHealth();
    h.meals[meal] = !h.meals[meal];
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
          `<div class="water-glass ${i < h.water ? 'filled' : ''}" onclick="App.logWater(${i + 1})">${iqIcon('droplets')}</div>`
        ).join('')}
      </div>
    </div>`;

    // Sleep Tracker
    html += `<div class="health-card">
      <div class="health-card-header">${iqIcon('cloud-sun')} Sleep (${h.sleep}h)</div>
      <input type="number" class="profile-input" id="sleepInput" placeholder="Hours slept" min="0" max="12" step="0.5" value="${h.sleep}">
      <button class="shop-card" onclick="App.logSleep(document.getElementById('sleepInput').value)" style="justify-content:center;width:100%;">Log Sleep</button>
    </div>`;

    // Exercise Tracker
    html += `<div class="health-card">
      <div class="health-card-header">${iqIcon('target')} Exercise</div>
      <select class="profile-input" id="exerciseType">
        ${EXERCISE_TYPES.map(e => `<option value="${e.id}">${iqIcon(e.icon)} ${e.label}</option>`).join('')}
      </select>
      <input type="number" class="profile-input" id="exerciseDuration" placeholder="Duration (minutes)" min="1">
      <button class="shop-card" onclick="App.logExercise(document.getElementById('exerciseType').value, document.getElementById('exerciseDuration').value)" style="justify-content:center;width:100%;">Log Exercise</button>
      ${h.exercise.length > 0 ? `<div class="exercise-log">${h.exercise.map(e => {
        const type = EXERCISE_TYPES.find(t => t.id === e.type);
        return `<div class="exercise-item">${iqIcon(type?.icon || 'target')} ${type?.label || e.type} - ${e.duration}min</div>`;
      }).join('')}</div>` : ''}
    </div>`;

    // Meals Tracker
    html += `<div class="health-card">
      <div class="health-card-header">${iqIcon('utensils')} Meals</div>
      <div class="meal-grid">
        <div class="meal-item ${h.meals.breakfast ? 'eaten' : ''}" onclick="App.toggleMeal('breakfast')">${iqIcon('sunrise')} Breakfast</div>
        <div class="meal-item ${h.meals.lunch ? 'eaten' : ''}" onclick="App.toggleMeal('lunch')">${iqIcon('sun')} Lunch</div>
        <div class="meal-item ${h.meals.dinner ? 'eaten' : ''}" onclick="App.toggleMeal('dinner')">${iqIcon('sunset')} Dinner</div>
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