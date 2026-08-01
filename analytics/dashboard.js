(function() {
  'use strict';

  let currentRange = 30;

  const CAT_COLORS = ['#16a34a', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4'];

  function summaryCards() {
    const prayers = Analytics.getPrayerStats();
    const streak = Analytics.getStreakStats();
    const xp = Analytics.getXPStats();
    return `
      <div class="insights-cards">
        <div class="insight-card">
          <div class="insight-card-icon">🕌</div>
          <div class="insight-card-num">${prayers.total}</div>
          <div class="insight-card-label">Total Prayers</div>
          <div class="insight-card-sub">${prayers.rate}% completion</div>
          <div class="insight-progress"><div class="insight-progress-bar" style="width:${prayers.rate}%"></div></div>
        </div>
        <div class="insight-card">
          <div class="insight-card-icon">🔥</div>
          <div class="insight-card-num">${streak.current}</div>
          <div class="insight-card-label">Current Streak</div>
          <div class="insight-card-sub">Best: ${streak.best}</div>
        </div>
        <div class="insight-card">
          <div class="insight-card-icon">⭐</div>
          <div class="insight-card-num">${S.pd || 0}</div>
          <div class="insight-card-label">Perfect Days</div>
          <div class="insight-card-sub">${prayers.possible ? Math.round((S.pd || 0) / (prayers.possible / 5) * 100) : 0}% rate</div>
        </div>
        <div class="insight-card">
          <div class="insight-card-icon">📊</div>
          <div class="insight-card-num">Lv ${xp.level}</div>
          <div class="insight-card-label">${xp.title}</div>
          <div class="insight-card-sub">${xp.progress}% to next</div>
          <div class="insight-progress"><div class="insight-progress-bar" style="width:${xp.progress}%"></div></div>
        </div>
      </div>`;
  }

  function dateFilter() {
    const ranges = [{ v: 7, l: '7D' }, { v: 30, l: '30D' }, { v: 90, l: '90D' }, { v: 0, l: 'All' }];
    return `<div class="insights-filter">
      ${ranges.map(r => `<button class="filter-btn ${r.v === currentRange ? 'active' : ''}" onclick="Dashboard.setRange(${r.v})">${r.l}</button>`).join('')}
    </div>`;
  }

  function chartHTML(id, title, height, noData) {
    if (noData) {
      return `<div class="insight-chart-wrap"><div style="height:${height || 200}px;display:flex;align-items:center;justify-content:center;color:var(--text2);font-size:0.85rem;">No data for this period</div></div>`;
    }
    return `<div class="insight-chart-wrap"><canvas id="${id}" style="width:100%;height:${height || 200}px;"></canvas></div>`;
  }

  function renderCharts() {
    Charts.destroyAll();

    // 1. Prayer Heatmap
    const heatDays = currentRange || 365;
    const heatData = Analytics.getHeatmapData(heatDays);
    if (document.getElementById('chart-heatmap')) {
      Charts.createHeatmap('chart-heatmap', heatData, 'Activity History');
    }

    // 2. Prayer Consistency Line
    const prayer = Analytics.getPrayerStats(currentRange);
    if (prayer.daily.length > 0 && document.getElementById('chart-prayer-line')) {
      const labels = prayer.daily.map(d => d.date.slice(5));
      Charts.createLine('chart-prayer-line', labels, [
        { label: 'All Prayers', data: prayer.daily.map(d => Math.round(d.count / 5 * 100)), borderColor: Charts.COLORS.primary, backgroundColor: Charts.COLORS.bg },
        { label: 'Fajr', data: prayer.daily.map(d => d.fajr * 100), borderColor: Charts.COLORS.accent, backgroundColor: 'rgba(245,158,11,0.1)', borderDash: [4, 4] }
      ], 'Prayer Consistency (%)');
    }

    // 3. Deed Distribution Doughnut
    const deeds = Analytics.getDeedStats(currentRange);
    if (deeds.byCategory.length > 0 && document.getElementById('chart-deeds')) {
      Charts.createDoughnut('chart-deeds', deeds.byCategory.map(c => c.category), deeds.byCategory.map(c => c.count), CAT_COLORS.slice(0, deeds.byCategory.length), 'Deed Distribution');
    }

    // 4. Streak Timeline
    const streak = Analytics.getStreakTimeline(currentRange);
    if (streak.length > 0 && document.getElementById('chart-streak')) {
      Charts.createBar('chart-streak', streak.map(s => s.month), streak.map(s => s.perfectDays), Charts.COLORS.primary, 'Perfect Days by Month');
    }

    // 5. XP Progression
    const xp = Analytics.getXPStats(currentRange);
    if (xp.daily.length > 0 && document.getElementById('chart-xp')) {
      Charts.createLine('chart-xp', xp.daily.map(d => d.date.slice(5)), [
        { label: 'Cumulative XP', data: xp.daily.map(d => d.cumulative), borderColor: Charts.COLORS.accent, backgroundColor: 'rgba(245,158,11,0.1)' }
      ], 'XP Progression');
    }

    // 6. Content Engagement
    const content = Analytics.getContentStats();
    if (content.length > 0 && document.getElementById('chart-content')) {
      Charts.createHorizontalBar('chart-content', content.map(c => c.name), content.map(c => c.consumed), Charts.COLORS.secondary, 'Content Consumed');
    }

  }

  function renderInsights() {
    const el = document.getElementById('statsArea');
    if (!el) return;

    if (!S || !S.log || Object.keys(S.log).length === 0) {
      el.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text2);">Start tracking to see insights</div>';
      return;
    }

    const prayer = Analytics.getPrayerStats(currentRange);
    const deeds = Analytics.getDeedStats(currentRange);
    const streak = Analytics.getStreakTimeline(currentRange);
    const xp = Analytics.getXPStats(currentRange);
    const content = Analytics.getContentStats();

    el.innerHTML = `
      <div class="insights-dashboard">
        ${summaryCards()}
        ${dateFilter()}
        <div class="insights-charts">
          ${chartHTML('chart-heatmap', 'Activity History', 140, false)}
          ${chartHTML('chart-prayer-line', 'Prayer Consistency', 220, prayer.daily.length === 0)}
          <div class="chart-row">
            <div class="chart-half">${chartHTML('chart-deeds', 'Deed Distribution', 250, deeds.byCategory.length === 0)}</div>
            <div class="chart-half">${chartHTML('chart-streak', 'Streak Timeline', 250, streak.length === 0)}</div>
          </div>
          ${chartHTML('chart-xp', 'XP Progression', 220, xp.daily.length === 0)}
          ${chartHTML('chart-content', 'Content Engagement', 220, content.length === 0)}
        </div>
      </div>`;

    setTimeout(renderCharts, 50);
  }

  function setRange(days) {
    currentRange = days;
    renderInsights();
  }

  window.Dashboard = { renderInsights, setRange };
})();
