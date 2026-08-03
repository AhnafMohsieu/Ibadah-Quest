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
  function journeyCard(j, t) {
    const start = S.journeys ? S.journeys[j.id] : undefined;
    const head = `<div class="journey-head"><span class="journey-icon">${j.icon}</span>
      <div><div class="journey-name">${j.name}</div><div class="journey-desc">${j.desc}</div></div></div>`;
    if (!start) {
      return `<div class="journey-card">${head}
        <button class="journey-start" onclick="App.joinJourney('${j.id}')">Begin 40-Day Journey</button></div>`;
    }
    const completed = journeyProgress(S.log, j, start, t);
    const done = completed >= j.target;
    const summary = done
      ? 'Alhamdulillah, journey complete 🎉'
      : `Day ${completed} of ${j.target} — at your own pace, no rush.`;
    return `<div class="journey-card">${head}
      <div class="journey-summary">${summary}</div>${gridHTML(completed, j.target)}</div>`;
  }
  function renderJourneys() {
    try {
      const el = document.getElementById('journeyArea');
      if (!el) return;
      const t = today();
      const defs = (typeof JOURNEYS !== 'undefined') ? JOURNEYS : [];
      el.innerHTML = '<div class="section-title">🌱 40-Day Habit Journeys</div>' +
        '<div class="journey-intro">Choose one journey and go at your own pace. A missed day is not a reset — every day you return, your grid keeps growing.</div>' +
        defs.map(j => journeyCard(j, t)).join('');
    } catch (e) { console.warn('Render Journeys failed:', e.message); }
  }
  function joinJourney(id) {
    try {
      if (S.journeys[id]) return;
      S.journeys[id] = today();
      saveState();
      renderJourneys();
    } catch (e) { console.warn('Join journey failed:', e.message); }
  }
  window.journeyProgress = journeyProgress;
  window.journeyStart = journeyStart;
  window.gridHTML = gridHTML;
  window.renderJourneys = renderJourneys;
  window.joinJourney = joinJourney;
})();
