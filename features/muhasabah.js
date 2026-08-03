// ═══════════════════════════════════════════════════════
// WEEKLY MUHASABAH — private Friday self-reflection
// ═══════════════════════════════════════════════════════
(function() {
  const SUGGEST_POOL = ['charity', 'fasting', 'istighfar', 'sadaqah_jariyah', 'dua_others'];
  function fmt(d) {
    const m = d.getMonth() + 1, day = d.getDate();
    return d.getFullYear() + '-' + (m < 10 ? '0' + m : m) + '-' + (day < 10 ? '0' + day : day);
  }
  function muhasabahMetrics(log, startDate, endDate) {
    let prayers = 0, daysPrayed = 0, deeds = 0;
    for (const dk in log) {
      if (dk < startDate || dk > endDate) continue;
      const e = log[dk] || {};
      const pn = Object.values(e.p || {}).filter(v => v).length;
      prayers += pn;
      if (pn > 0) daysPrayed++;
      deeds += Object.values(e.d || {}).filter(v => v).length;
    }
    return { prayers, daysPrayed, deeds };
  }
  function computeDeedCounts(log, pool, endDate, windowDays) {
    const start = new Date(endDate + 'T00:00:00');
    start.setDate(start.getDate() - (windowDays - 1));
    const startDate = fmt(start);
    return pool.map(id => {
      let count = 0;
      for (const dk in log) {
        if (dk >= startDate && dk <= endDate && log[dk] && log[dk].d && log[dk].d[id]) count++;
      }
      return { id, count };
    });
  }
  function pickSuggestion(counts) {
    let best = null, bestCount = Infinity;
    for (const c of counts) {
      if (c.count < bestCount) { best = c; bestCount = c.count; }
    }
    return best && best.count === 0 ? best : null;
  }
  function muhasabahHTML(metrics, suggestionInfo, streak) {
    const hero = `Alhamdulillah, you prayed <b>${metrics.prayers}</b> prayers this week and kept a <b>${streak}</b>-day streak.`;
    const sug = suggestionInfo
      ? `Perhaps next week, try dedicating a moment to ${suggestionInfo.icon} ${suggestionInfo.label}.`
      : 'Your garden is thriving — keep nourishing it.';
    return `<div class="muh-overlay" id="muhOverlay">
      <div class="muh-card">
        <div class="muh-title">🪞 Weekly Muhasabah · Friday Reflection</div>
        <div class="muh-hero">${hero}</div>
        <div class="muh-list">
          <div class="muh-row"><span>🕌 Prayers logged</span><b>${metrics.prayers}</b></div>
          <div class="muh-row"><span>📅 Days prayed</span><b>${metrics.daysPrayed}</b></div>
          <div class="muh-row"><span>🔥 Streak</span><b>${streak} days</b></div>
          <div class="muh-row"><span>🌟 Extra deeds</span><b>${metrics.deeds}</b></div>
        </div>
        <div class="muh-suggestion">${sug}</div>
        <button class="muh-dismiss" onclick="App.dismissMuhasabah()">JazakAllah khair 🤲</button>
      </div>
    </div>`;
  }
  function openMuhasabah() {
    try {
      const wrap = document.getElementById('muhasabahModal');
      if (!wrap) return;
      const metrics = muhasabahMetrics(S.log, ws(), today());
      const counts = computeDeedCounts(S.log, SUGGEST_POOL, today(), 14);
      const pick = pickSuggestion(counts);
      let info = null;
      if (pick && typeof DEEDS !== 'undefined') {
        const de = DEEDS.find(x => x.id === pick.id);
        if (de) info = { icon: de.icon, label: de.name };
      }
      wrap.innerHTML = muhasabahHTML(metrics, info, S.cs || 0);
    } catch (e) { console.warn('Open Muhasabah failed:', e.message); }
  }
  function dismissMuhasabah() {
    try {
      S.muhWeek = ws();
      saveState();
      const wrap = document.getElementById('muhasabahModal');
      if (wrap) wrap.innerHTML = '';
    } catch (e) { console.warn('Dismiss Muhasabah failed:', e.message); }
  }
  function maybeShowMuhasabah() {
    try {
      if (isFri() && S.muhWeek !== ws()) openMuhasabah();
    } catch (e) { console.warn('Muhasabah trigger failed:', e.message); }
  }
  function renderMuhasabahEntry() {
    try {
      const el = document.getElementById('muhasabahEntry');
      if (!el) return;
      el.innerHTML = '<button class="muh-entry" onclick="App.openMuhasabah()">📝 Weekly Reflection</button>';
    } catch (e) { console.warn('Render Muhasabah entry failed:', e.message); }
  }
  window.muhasabahMetrics = muhasabahMetrics;
  window.computeDeedCounts = computeDeedCounts;
  window.pickSuggestion = pickSuggestion;
  window.muhasabahHTML = muhasabahHTML;
  window.openMuhasabah = openMuhasabah;
  window.dismissMuhasabah = dismissMuhasabah;
  window.maybeShowMuhasabah = maybeShowMuhasabah;
  window.renderMuhasabahEntry = renderMuhasabahEntry;
})();
