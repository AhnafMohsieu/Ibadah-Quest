(function() {
  'use strict';

  const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  function getDayXPMap() {
    const dayXP = [0, 0, 0, 0, 0, 0, 0];
    const dayCount = [0, 0, 0, 0, 0, 0, 0];
    const log = S.log || {};
    Object.keys(log).forEach(d => {
      const entry = log[d];
      if (!entry) return;
      const dt = new Date(d);
      const dow = dt.getDay();
      dayCount[dow]++;
      const p = entry.p || {};
      const deeds = entry.d || {};
      let xp = 0;
      if (typeof PRAYERS !== 'undefined') {
        PRAYERS.forEach(pr => { if (p[pr.id]) xp += pr.xp; });
      }
      Object.keys(deeds).forEach(id => {
        if (deeds[id] && typeof DEEDS !== 'undefined') {
          const deed = DEEDS.find(dd => dd.id === id);
          if (deed) xp += deed.xp;
        }
      });
      dayXP[dow] += xp;
    });
    const averages = dayXP.map((total, i) => dayCount[i] > 0 ? Math.round(total / dayCount[i]) : 0);
    return averages;
  }

  function detectPattern() {
    const averages = getDayXPMap();
    const validDays = averages.filter(a => a > 0);
    if (validDays.length < 2) return null;

    let bestIdx = 0;
    let worstIdx = 0;
    averages.forEach((a, i) => {
      if (a > averages[bestIdx]) bestIdx = i;
      if (a < averages[worstIdx] && a > 0) worstIdx = i;
    });

    const bestDay = WEEKDAYS[bestIdx];
    const diff = averages[bestIdx] - averages[worstIdx];
    if (diff < 5) return null;

    return {
      icon: 'trending-up',
      text: `Your best day is ${bestDay} with avg ${averages[bestIdx]} XP`,
      type: 'pattern'
    };
  }

  function detectSuggestion() {
    const log = S.log || {};
    const dates = Object.keys(log).sort();
    if (dates.length < 3) return null;

    let fajrMissed = 0;
    let totalDays = dates.length;
    dates.forEach(d => {
      const p = log[d].p || {};
      if (!p.fajr) fajrMissed++;
    });

    if (fajrMissed > totalDays * 0.3) {
      return {
        icon: 'sunrise',
        text: `Try completing Fajr consistently for +${Math.round(fajrMissed * 5 * 0.2)} more XP`,
        type: 'suggestion'
      };
    }

    let deedDays = 0;
    dates.forEach(d => {
      const deeds = log[d].d || {};
      if (Object.keys(deeds).length > 0) deedDays++;
    });

    if (deedDays < totalDays * 0.5) {
      return {
        icon: 'star',
        text: 'Add extra good deeds daily for +20% more XP',
        type: 'suggestion'
      };
    }

    return null;
  }

  function detectPrediction() {
    const log = S.log || {};
    const dates = Object.keys(log).sort();
    if (dates.length < 7) return null;

    const recentDates = dates.slice(-14);
    let recentXP = 0;
    recentDates.forEach(d => {
      const p = log[d].p || {};
      const deeds = log[d].d || {};
      if (typeof PRAYERS !== 'undefined') {
        PRAYERS.forEach(pr => { if (p[pr.id]) recentXP += pr.xp; });
      }
      Object.keys(deeds).forEach(id => {
        if (deeds[id] && typeof DEEDS !== 'undefined') {
          const deed = DEEDS.find(dd => dd.id === id);
          if (deed) recentXP += deed.xp;
        }
      });
    });

    const daysTracked = recentDates.length;
    const avgDailyXP = daysTracked > 0 ? recentXP / daysTracked : 0;
    if (avgDailyXP < 1) return null;

    const curXP = S.xp || 0;
    const nextLevelXP = typeof xpFor === 'function' ? xpFor((S.lv || 1) + 1) : 100;
    const xpNeeded = nextLevelXP - curXP;
    if (xpNeeded <= 0) return null;

    const daysToNext = Math.ceil(xpNeeded / avgDailyXP);
    if (daysToNext > 365) return null;

    return {
      icon: 'target',
      text: `At current pace, you'll reach Level ${(S.lv || 1) + 1} in ${daysToNext} day${daysToNext > 1 ? 's' : ''}`,
      type: 'prediction'
    };
  }

  function generateInsights() {
    const insights = [];

    const pattern = detectPattern();
    if (pattern) insights.push(pattern);

    const suggestion = detectSuggestion();
    if (suggestion) insights.push(suggestion);

    const prediction = detectPrediction();
    if (prediction) insights.push(prediction);

    const streak = S.cs || 0;
    const best = S.bs || 0;
    if (streak >= 7) {
      insights.push({
        icon: 'flame',
        text: `Amazing ${streak}-day streak! Keep it going!`,
        type: 'pattern'
      });
    } else if (best > 0 && streak === 0) {
      insights.push({
        icon: 'refresh-cw',
        text: `Your best streak was ${best} days — start a new one today!`,
        type: 'suggestion'
      });
    }

    return insights.slice(0, 5);
  }

  function renderSmartInsights() {
    const el = document.getElementById('smartInsights');
    if (!el) return;

    const insights = generateInsights();
    if (insights.length === 0) {
      el.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text2);">Track more activity to unlock insights</div>';
      return;
    }

    el.innerHTML = `
      <div class="section-title">${typeof iqIcon === 'function' ? iqIcon('lightbulb') : ''} Smart Insights</div>
      <div class="insights-list">
        ${insights.map(i => `
          <div class="insight-item insight-${i.type}">
            <span class="insight-icon">${typeof iqIcon === 'function' ? iqIcon(i.icon) : ''}</span>
            <span class="insight-text">${i.text}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  window.generateInsights = generateInsights;
  window.renderSmartInsights = renderSmartInsights;
})();
