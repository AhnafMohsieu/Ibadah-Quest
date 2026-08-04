// ═══════════════════════════════════════════════════════
// 40-DAY HABIT JOURNEYS — persistence, never reset
// ═══════════════════════════════════════════════════════
(function() {
  function journeyProgress(log, journey, startDate, endDate) {
    let completed = 0;
    for (const dk in log) {
      if (dk < startDate || dk > endDate) continue;
      if (log[dk] && log[dk][journey.kind] && log[dk][journey.kind][journey.key]) completed++;
    }
    return completed;
  }
  function journeyStart(state, id, dateStr) {
    const next = Object.assign({}, state, { journeys: Object.assign({}, state.journeys) });
    if (!next.journeys[id]) next.journeys[id] = dateStr;
    return next;
  }
  function gridHTML(completed, target) {
    let h = '<div class="journey-grid">';
    for (let i = 0; i < target; i++) {
      h += `<div class="journey-cell${i < completed ? ' filled' : ''}">${i < completed ? '✓' : ''}</div>`;
    }
    return h + '</div>';
  }
  function renderProgressRing(completed, target, color) {
    const radius = 52;
    const circumference = 2 * Math.PI * radius;
    const progress = Math.min(completed / target, 1);
    const offset = circumference * (1 - progress);
    const pct = Math.round(progress * 100);

    return `
      <div class="journey-ring-container">
        <svg width="120" height="120" viewBox="0 0 120 120">
          <circle class="journey-ring-bg" cx="60" cy="60" r="${radius}"/>
          <circle class="journey-ring-progress" cx="60" cy="60" r="${radius}"
            stroke="${color}" stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"/>
        </svg>
        <div class="journey-ring-text">${pct}%</div>
      </div>
    `;
  }
  function calculateStreak(log, journey, startDate) {
    let streak = 0;
    let currentDate = today();
    
    while (currentDate >= startDate) {
      const dayLog = log[currentDate];
      if (dayLog && dayLog[journey.kind] && dayLog[journey.kind][journey.key]) {
        streak++;
      } else {
        break;
      }
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 1);
      currentDate = d.getFullYear() + '-' + (d.getMonth()+1).toString().padStart(2,'0') + '-' + d.getDate().toString().padStart(2,'0');
    }
    return streak;
  }
  function journeyCard(j, t) {
    const start = S.journeys ? S.journeys[j.id] : undefined;
    const head = `<div class="journey-head"><span class="journey-icon">${j.icon}</span>
      <div><div class="journey-name">${j.name}</div><div class="journey-desc">${j.desc}</div></div></div>`;
    if (!start) {
      return `<div class="journey-card">${head}
        <button class="journey-start" onclick="App.joinJourney('${j.id}')">Begin 40-Day Journey</button></div>`;
    }
    const completed = journeyProgress(S.log, j, start, t);
    checkJourneyMilestone(j, completed);
    const done = completed >= j.target;
    const summary = done
      ? 'Alhamdulillah, journey complete 🎉'
      : `Day ${completed} of ${j.target} — at your own pace, no rush.`;
    const streak = calculateStreak(S.log, j, start);
    const streakText = streak > 0 ? `<div class="journey-streak">🔥 ${streak} day streak</div>` : '';
    return `<div class="journey-card">${head}
      <div class="journey-summary">${summary}</div>${streakText}${gridHTML(completed, j.target)}</div>`;
  }
  function checkJourneyMilestone(journey, completed) {
    const milestones = [10, 20, 30, 40];
    for (const m of milestones) {
      if (completed === m) {
        toast('🎯', `Journey Milestone: ${m} days complete!`);
        return true;
      }
    }
    if (completed >= journey.target) {
      toast('🎉', 'Journey Complete! Alhamdulillah!', false, 3000);
      return true;
    }
    return false;
  }
  function renderJourneyDashboard() {
    const analytics = getJourneyAnalytics();
    return `
      <div class="journey-dashboard">
        <div class="section-title">📊 Journey Statistics</div>
        <div class="journey-stats-grid">
          <div class="journey-stat-item">
            <div class="journey-stat-num">${analytics.totalCompleted}</div>
            <div class="journey-stat-label">Completed</div>
          </div>
          <div class="journey-stat-item">
            <div class="journey-stat-num">${analytics.activeJourneys}</div>
            <div class="journey-stat-label">Active</div>
          </div>
          <div class="journey-stat-item">
            <div class="journey-stat-num">${analytics.bestStreak}</div>
            <div class="journey-stat-label">Best Streak</div>
          </div>
          <div class="journey-stat-item">
            <div class="journey-stat-num">${analytics.history.length}</div>
            <div class="journey-stat-label">Total Attempts</div>
          </div>
        </div>
      </div>
    `;
  }
  function renderJourneys() {
    try {
      const el = document.getElementById('journeyArea');
      if (!el) return;
      const t = today();
      const defs = (typeof JOURNEYS !== 'undefined') ? JOURNEYS : [];
      el.innerHTML = renderJourneyDashboard() +
        renderJourneyInsights() +
        '<div class="section-title">🌱 40-Day Habit Journeys</div>' +
        '<div class="journey-intro">Choose one journey and go at your own pace. A missed day is not a reset — every day you return, your grid keeps growing.</div>' +
        defs.map(j => journeyCard(j, t)).join('');
    } catch (e) { console.warn('Render Journeys failed:', e.message); }
  }
  function joinJourney(id) {
    try {
      if (S.journeys[id]) return;
      Object.assign(S, journeyStart(S, id, today()));
      saveState();
      renderJourneys();
    } catch (e) { console.warn('Join journey failed:', e.message); }
  }
  function renderJourneyInsights() {
    const activeJourneys = Object.keys(S.journeys || {});
    if (activeJourneys.length === 0) return '';
    
    const insights = activeJourneys.map(id => {
      const journey = JOURNEYS.find(j => j.id === id);
      if (!journey) return null;
      
      const startDate = S.journeys[id];
      const completed = journeyProgress(S.log, journey, startDate, today());
      const remaining = journey.target - completed;
      const daysSinceStart = Math.max(1, Math.ceil((Date.now() - new Date(startDate).getTime()) / 86400000));
      const pace = Math.round((completed / daysSinceStart) * 100);
      
      return `
        <div class="journey-insight-card">
          <div class="journey-insight-icon">${journey.icon}</div>
          <div class="journey-insight-info">
            <div class="journey-insight-name">${journey.name}</div>
            <div class="journey-insight-progress">${remaining > 0 ? `${remaining} days remaining` : 'Complete!'}</div>
            <div class="journey-insight-pace">${pace}% daily pace</div>
          </div>
        </div>
      `;
    }).filter(Boolean);
    
    if (insights.length === 0) return '';
    
    return `
      <div class="journey-insights">
        <div class="section-title">📈 Active Journey Progress</div>
        ${insights.join('')}
      </div>
    `;
  }
  function getJourneyAnalytics() {
    const stats = S.journeyStats || {};
    return {
      totalCompleted: stats.totalCompleted || 0,
      activeJourneys: Object.keys(S.journeys || {}).length,
      bestStreak: Math.max(...Object.values(stats.bestStreaks || {}), 0),
      history: stats.history || []
    };
  }
  function autoTrackJourneyProgress() {
    const t = today();
    const defs = (typeof JOURNEYS !== 'undefined') ? JOURNEYS : [];
    
    defs.forEach(j => {
      if (!S.journeys[j.id]) return;
      
      const dayLog = S.log[t];
      if (!dayLog) return;
      
      const completed = dayLog[j.kind] && dayLog[j.kind][j.key];
      if (!completed) return;
      
      if (!S.journeyStats) S.journeyStats = {};
      if (!S.journeyStats.lastTracked) S.journeyStats.lastTracked = {};
      if (S.journeyStats.lastTracked[j.id] === t) return;
      
      if (!S.journeyStats.currentStreaks) S.journeyStats.currentStreaks = {};
      
      const currentStreak = S.journeyStats.currentStreaks[j.id] || 0;
      S.journeyStats.currentStreaks[j.id] = currentStreak + 1;
      S.journeyStats.lastTracked[j.id] = t;
      
      if (!S.journeyStats.bestStreaks) S.journeyStats.bestStreaks = {};
      if (S.journeyStats.currentStreaks[j.id] > (S.journeyStats.bestStreaks[j.id] || 0)) {
        S.journeyStats.bestStreaks[j.id] = S.journeyStats.currentStreaks[j.id];
      }
      
      checkJourneyMilestone(j, S.journeyStats.currentStreaks[j.id]);
      
      saveState();
    });
  }
  function recordJourneyCompletion(id, startDate, endDate, completedDays, target) {
    if (!S.journeyStats) S.journeyStats = { completed: [], currentStreaks: {}, bestStreaks: {}, totalCompleted: 0, unlockedTiers: ['7day'], history: [] };
    S.journeyStats.completed.push(id);
    S.journeyStats.totalCompleted++;
    S.journeyStats.history.push({ id, startDate, endDate, completedDays, target });
    saveState();
  }
  window.journeyProgress = journeyProgress;
  window.journeyStart = journeyStart;
  window.gridHTML = gridHTML;
  window.renderProgressRing = renderProgressRing;
  window.renderJourneys = renderJourneys;
  window.joinJourney = joinJourney;
  window.checkJourneyMilestone = checkJourneyMilestone;
  window.getJourneyAnalytics = getJourneyAnalytics;
  window.recordJourneyCompletion = recordJourneyCompletion;
  window.autoTrackJourneyProgress = autoTrackJourneyProgress;
})();
