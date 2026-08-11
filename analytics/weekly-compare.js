(function() {
  'use strict';

  function getWeekStats(weekOffset) {
    const now = new Date();
    const target = new Date(now);
    target.setDate(target.getDate() + (weekOffset * 7));
    
    const weekStart = ws(target);
    const weekEnd = we(target);
    
    let xp = 0;
    let prayers = 0;
    let quests = 0;
    
    const dates = Object.keys(S.log || {}).filter(d => d >= weekStart && d <= weekEnd).sort();
    
    dates.forEach(d => {
      const log = S.log[d];
      if (!log) return;
      
      const p = log.p || {};
      const dDeeds = log.d || {};
      
      // Count prayers
      prayers += Object.values(p).filter(v => v).length;
      
      // Calculate XP for this day
      let dayXP = 0;
      if (typeof PRAYERS !== 'undefined') {
        PRAYERS.forEach(pr => { if (p[pr.id]) dayXP += pr.xp; });
      }
      Object.keys(dDeeds).forEach(id => {
        if (dDeeds[id] && typeof DEEDS !== 'undefined') {
          const deed = DEEDS.find(dd => dd.id === id);
          if (deed) dayXP += deed.xp;
        }
      });
      xp += dayXP;
    });
    
    // Count quests completed during this week
    if (S.dq) quests += S.dq.filter(q => q.done).length;
    if (S.wq) quests += S.wq.filter(q => q.done).length;
    
    return { xp, prayers, quests, weekStart, weekEnd };
  }

  function calculateChange(current, previous) {
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }
    return Math.round(((current - previous) / previous) * 100);
  }

  function renderWeeklyCompare() {
    const container = document.getElementById('weeklyCompare');
    if (!container) return;
    
    const currentWeek = getWeekStats(0);
    const previousWeek = getWeekStats(-1);
    
    const xpChange = calculateChange(currentWeek.xp, previousWeek.xp);
    const prayersChange = calculateChange(currentWeek.prayers, previousWeek.prayers);
    const questsChange = calculateChange(currentWeek.quests, previousWeek.quests);
    
    function getChangeClass(change) {
      if (change > 0) return 'positive';
      if (change < 0) return 'negative';
      return '';
    }
    
    function getChangeIcon(change) {
      if (change > 0) return '↑';
      if (change < 0) return '↓';
      return '→';
    }
    
    container.innerHTML = `
      <div class="section-title">${typeof iqIcon === 'function' ? iqIcon('bar-chart-3') : ''} Weekly Comparison</div>
      <div class="compare-grid">
        <div class="compare-card">
          <div class="compare-label">XP Earned</div>
          <div class="compare-value">${currentWeek.xp}</div>
          <div class="compare-change ${getChangeClass(xpChange)}">
            ${getChangeIcon(xpChange)} ${Math.abs(xpChange)}% vs last week
          </div>
        </div>
        <div class="compare-card">
          <div class="compare-label">Prayers Logged</div>
          <div class="compare-value">${currentWeek.prayers}</div>
          <div class="compare-change ${getChangeClass(prayersChange)}">
            ${getChangeIcon(prayersChange)} ${Math.abs(prayersChange)}% vs last week
          </div>
        </div>
        <div class="compare-card">
          <div class="compare-label">Quests Done</div>
          <div class="compare-value">${currentWeek.quests}</div>
          <div class="compare-change ${getChangeClass(questsChange)}">
            ${getChangeIcon(questsChange)} ${Math.abs(questsChange)}% vs last week
          </div>
        </div>
        <div class="compare-card">
          <div class="compare-label">Period</div>
          <div class="compare-value" style="font-size:1rem;">${currentWeek.weekStart.slice(5)} → ${currentWeek.weekEnd.slice(5)}</div>
          <div class="compare-change">This week</div>
        </div>
      </div>
    `;
  }

  window.getWeekStats = getWeekStats;
  window.renderWeeklyCompare = renderWeeklyCompare;
})();
