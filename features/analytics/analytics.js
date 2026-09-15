(function() {
  'use strict';

  function getDateRange(days) {
    if (!days) return null;
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    return { start, end };
  }

  function inRange(dateStr, range) {
    if (!range) return true;
    const d = new Date(dateStr);
    return d >= range.start && d <= range.end;
  }

  function getLogDates(range) {
    return Object.keys(S.log || {}).filter(d => inRange(d, range)).sort();
  }

  function getPrayerStats(days) {
    const range = getDateRange(days);
    const dates = getLogDates(range);
    let total = 0, possible = dates.length * 5, fajrCount = 0;
    const daily = dates.map(d => {
      const p = S.log[d].p || {};
      const count = Object.values(p).filter(v => v).length;
      const fajr = p.fajr ? 1 : 0;
      total += count;
      fajrCount += fajr;
      return { date: d, count, fajr };
    });
    return {
      total,
      possible,
      rate: possible ? Math.round(total / possible * 100) : 0,
      fajrRate: dates.length ? Math.round(fajrCount / dates.length * 100) : 0,
      daily
    };
  }

  function getHeatmapData(days) {
    const range = getDateRange(days || 90);
    const dates = getLogDates(range);
    const map = {};
    dates.forEach(d => {
      const p = S.log[d].p || {};
      map[d] = Object.values(p).filter(v => v).length;
    });
    const result = [];
    const d = new Date(range ? range.start : new Date());
    const end = range ? range.end : new Date();
    while (d <= end) {
      const key = today(d);
      result.push({ date: key, value: map[key] || 0 });
      d.setDate(d.getDate() + 1);
    }
    return result;
  }

  function getDeedStats(days) {
    const range = getDateRange(days);
    const dates = getLogDates(range);
    const counts = {};
    dates.forEach(d => {
      const deeds = S.log[d].d || {};
      Object.keys(deeds).forEach(id => {
        if (deeds[id]) counts[id] = (counts[id] || 0) + 1;
      });
    });
    const cats = {};
    let total = 0;
    Object.keys(counts).forEach(id => {
      const deed = DEEDS.find(d => d.id === id);
      const cat = deed ? deed.cat : 'other';
      cats[cat] = (cats[cat] || 0) + counts[id];
      total += counts[id];
    });
    const byCategory = Object.keys(cats).map(cat => ({
      category: cat,
      count: cats[cat],
      pct: total ? Math.round(cats[cat] / total * 100) : 0
    })).sort((a, b) => b.count - a.count);
    const topDeeds = Object.keys(counts).map(id => {
      const deed = DEEDS.find(d => d.id === id);
      return { id, name: deed ? deed.name : id, count: counts[id] };
    }).sort((a, b) => b.count - a.count).slice(0, 10);
    return { byCategory, topDeeds, total };
  }

  function getStreakStats() {
    return { current: S.cs || 0, best: S.bs || 0 };
  }

  function getStreakTimeline(days) {
    const range = getDateRange(days);
    const dates = getLogDates(range);
    const monthly = {};
    dates.forEach(d => {
      const month = d.slice(0, 7);
      if (!monthly[month]) monthly[month] = { days: 0, perfect: 0 };
      monthly[month].days++;
      const p = S.log[d].p || {};
      if (Object.values(p).filter(v => v).length >= 5) monthly[month].perfect++;
    });
    return Object.keys(monthly).sort().map(m => ({
      month: m,
      perfectDays: monthly[m].perfect,
      totalDays: monthly[m].days
    }));
  }

  function getXPStats(days) {
    const range = getDateRange(days);
    const dates = getLogDates(range);
    let cumXP = 0;
    const daily = dates.map(d => {
      const p = S.log[d].p || {};
      const dDeeds = S.log[d].d || {};
      let dayXP = 0;
      PRAYERS.forEach(pr => { if (p[pr.id]) dayXP += pr.xp; });
      Object.keys(dDeeds).forEach(id => {
        if (dDeeds[id]) {
          const deed = DEEDS.find(dd => dd.id === id);
          if (deed) dayXP += deed.xp;
        }
      });
      cumXP += dayXP;
      return { date: d, xp: dayXP, cumulative: cumXP };
    });
    const lv = S.lv || 1;
    const curXP = S.xp || 0;
    const nextXP = Math.floor(100 * Math.pow(lv + 1, 1.5));
    const curLevelXP = Math.floor(100 * Math.pow(lv, 1.5));
    return {
      daily,
      level: lv,
      title: typeof lvTitle === 'function' ? lvTitle(lv) : 'Level ' + lv,
      currentXP: curXP,
      nextLevelXP: nextXP,
      currentLevelXP: curLevelXP,
      progress: nextXP > curLevelXP ? Math.round((curXP - curLevelXP) / (nextXP - curLevelXP) * 100) : 100,
      questXP: S.questXP || {daily:0,weekly:0,monthly:0,yearly:0,lifetime:0}
    };
  }

  function getContentStats() {
    const pools = [
      { key: 'duaIdx', name: 'Duas', total: typeof DUA_POOL !== 'undefined' ? DUA_POOL.length : 0 },
      { key: 'quranIdx', name: 'Quran Verses', total: typeof QURAN_POOL !== 'undefined' ? QURAN_POOL.length : 0 },
      { key: 'sunnahIdx', name: 'Sunnah', total: typeof SUNNAH_POOL !== 'undefined' ? SUNNAH_POOL.length : 0 },
      { key: 'dhikrIdx', name: 'Dhikr', total: typeof DHIKR_POOL !== 'undefined' ? DHIKR_POOL.length : 0 },
      { key: 'storiesIdx', name: 'Stories', total: typeof STORIES !== 'undefined' ? STORIES.length : 0 },
      { key: 'hadithIdx', name: 'Hadiths', total: typeof HADITHS !== 'undefined' ? HADITHS.length : 0 },
      { key: 'namesIdx', name: 'Names of Allah', total: typeof NAMES !== 'undefined' ? NAMES.length : 0 },
      { key: 'sinsIdx', name: 'Sins', total: typeof SINS_POOL !== 'undefined' ? SINS_POOL.length : 0 },
      { key: 'seerahIdx', name: 'Seerah', total: typeof SEERAH_POOL !== 'undefined' ? SEERAH_POOL.length : 0 },
      { key: 'tafsirIdx', name: 'Tafsir', total: typeof TAFSIR_POOL !== 'undefined' ? TAFSIR_POOL.length : 0 },
      { key: 'mannersIdx', name: 'Manners', total: typeof MANNERS_POOL !== 'undefined' ? MANNERS_POOL.length : 0 },
      { key: 'prophetsIdx', name: 'Prophets', total: typeof PROPHETS_POOL !== 'undefined' ? PROPHETS_POOL.length : 0 },
      { key: 'scholarsIdx', name: 'Scholars', total: typeof SCHOLARS_POOL !== 'undefined' ? SCHOLARS_POOL.length : 0 },
      { key: 'knowledgeIdx', name: 'Knowledge', total: typeof KNOWLEDGE_POOL !== 'undefined' ? KNOWLEDGE_POOL.length : 0 },
      { key: 'jannahIdx', name: 'Jannah', total: typeof JANNAH_POOL !== 'undefined' ? JANNAH_POOL.length : 0 },
    ];
    return pools
      .map(p => ({ name: p.name, consumed: (S[p.key] || []).length, total: p.total }))
      .filter(p => p.total > 0)
      .sort((a, b) => b.consumed - a.consumed)
      .slice(0, 10);
  }

  window.Analytics = {
    getPrayerStats,
    getHeatmapData,
    getDeedStats,
    getStreakStats,
    getStreakTimeline,
    getXPStats,
    getContentStats,
    getDateRange,
    getLogDates
  };
})();
