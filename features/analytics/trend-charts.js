(function() {
  'use strict';

  function getPrayerTrend(days) {
    const stats = Analytics.getPrayerStats(days);
    const labels = stats.daily.map(d => d.date.slice(5));
    const values = stats.daily.map(d => Math.round(d.count / 5 * 100));
    return { labels, values };
  }

  function getXPTrend(days) {
    const stats = Analytics.getXPStats(days);
    const labels = stats.daily.map(d => d.date.slice(5));
    const values = stats.daily.map(d => d.cumulative);
    return { labels, values };
  }

  function renderTrendCharts() {
    const container = document.getElementById('trendCharts');
    if (!container) return;

    const trend = getPrayerTrend(30);
    if (trend.labels.length > 0 && document.getElementById('prayerTrendCanvas')) {
      Charts.createLine('prayerTrendCanvas', trend.labels, [
        { label: 'Prayer Consistency %', data: trend.values, borderColor: Charts.COLORS.primary, backgroundColor: Charts.COLORS.bg }
      ], 'Prayer Consistency Trend');
    }

    const xp = getXPTrend(30);
    if (xp.labels.length > 0 && document.getElementById('xpTrendCanvas')) {
      Charts.createBar('xpTrendCanvas', xp.labels, xp.values, Charts.COLORS.accent, 'XP Accumulation Trend');
    }
  }

  window.renderTrendCharts = renderTrendCharts;
  window.getPrayerTrend = getPrayerTrend;
  window.getXPTrend = getXPTrend;
})();
