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
      prayers += Object.values(p).filter(v => v === true).length;
      
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
    
    const _wt = (s) => (typeof window !== 'undefined' && typeof window.t === 'function') ? window.t(s) : s;
    const _wn = (v) => (typeof window !== 'undefined' && typeof window.iqFormatNum === 'function') ? window.iqFormatNum(v) : String(v);
    container.innerHTML = `
      <div class="section-title">${typeof iqIcon === 'function' ? iqIcon('bar-chart-3') : ''} ${_wt('Weekly Comparison')}</div>
      <div class="compare-grid">
        <div class="compare-card">
          <div class="compare-label">${_wt('XP Earned')}</div>
          <div class="compare-value iq-tabular">${_wn(currentWeek.xp)}</div>
          <div class="compare-change ${getChangeClass(xpChange)}">
            ${getChangeIcon(xpChange)} <span class="iq-tabular">${_wn(Math.abs(xpChange))}%</span> ${_wt('vs last week')}
          </div>
        </div>
        <div class="compare-card">
          <div class="compare-label">${_wt('Prayers Logged')}</div>
          <div class="compare-value iq-tabular">${_wn(currentWeek.prayers)}</div>
          <div class="compare-change ${getChangeClass(prayersChange)}">
            ${getChangeIcon(prayersChange)} <span class="iq-tabular">${_wn(Math.abs(prayersChange))}%</span> ${_wt('vs last week')}
          </div>
        </div>
        <div class="compare-card">
          <div class="compare-label">${_wt('Quests Done')}</div>
          <div class="compare-value iq-tabular">${_wn(currentWeek.quests)}</div>
          <div class="compare-change ${getChangeClass(questsChange)}">
            ${getChangeIcon(questsChange)} <span class="iq-tabular">${_wn(Math.abs(questsChange))}%</span> ${_wt('vs last week')}
          </div>
        </div>
        <div class="compare-card">
          <div class="compare-label">${_wt('Period')}</div>
          <div class="compare-value iq-tabular" style="font-size:0.96rem;"><bdi dir="ltr">${currentWeek.weekStart.slice(5)}</bdi> <span class="iq-mirror-icon">&rarr;</span> <bdi dir="ltr">${currentWeek.weekEnd.slice(5)}</bdi></div>
          <div class="compare-change">${_wt('This week')}</div>
        </div>
      </div>
    `;
  }

  window.getWeekStats = getWeekStats;
  window.renderWeeklyCompare = renderWeeklyCompare;
})();
