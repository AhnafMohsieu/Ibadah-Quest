# Analytics Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a visual analytics dashboard with 6 Chart.js charts to the existing "Analytics" tab under Profile.

**Architecture:** 3 new files in `analytics/` directory. `analytics.js` computes chart data from state `S`. `charts.js` wraps Chart.js rendering. `dashboard.js` orchestrates HTML generation and date range filtering. Integrates into existing tab system by upgrading `renderStats()`.

**Tech Stack:** Chart.js v4 (CDN), chartjs-chart-matrix v2 (CDN for heatmap)

## Global Constraints

- Personal use only, no backend, no Python
- All data from existing localStorage state `S`
- Chart.js loaded via `<script>` CDN tag
- Islamic green color palette: primary `#16a34a`, secondary `#22c55e`, light `#86efac`, accent `#f59e0b`
- Dark theme compatible (background `#0f172a`)
- No modifications to `state/state.js` or `core/actions.js`

---

## File Structure

| File | Responsibility |
|------|---------------|
| `analytics/analytics.js` | Pure computation functions. Reads `S`, returns datasets. No DOM. |
| `analytics/charts.js` | Chart.js wrapper. Creates chart instances, handles destroy/recreate. |
| `analytics/dashboard.js` | Builds HTML, wires up date filter, calls analytics + charts. Exports `renderInsights()`. |
| `index.html` | Add CDN scripts + new `<script>` tags |
| `render/render.js` | Update `renderStats()` to call `App.renderInsights()` |

---

### Task 1: Add CDN scripts and file references to index.html

**Files:**
- Modify: `index.html`

**Interfaces:**
- Consumes: none
- Produces: Chart.js and chartjs-chart-matrix available globally; analytics files loaded

- [ ] **Step 1: Add Chart.js CDN before closing `</body>`**

```html
<script src="https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/chartjs-chart-matrix@2/dist/chartjs-chart-matrix.min.js"></script>
```

- [ ] **Step 2: Add analytics script tags after Chart.js**

```html
<script src="analytics/analytics.js"></script>
<script src="analytics/charts.js"></script>
<script src="analytics/dashboard.js"></script>
```

- [ ] **Step 3: Verify load order**

Open `index.html` in browser. Open console. Type `window.Analytics`, `window.Charts`, `window.Dashboard`. All three should be defined.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: add Chart.js CDN and analytics script references"
```

---

### Task 2: Create analytics/analytics.js — computation functions

**Files:**
- Create: `analytics/analytics.js`

**Interfaces:**
- Consumes: global `S` (state object), `DEEDS` (from data/deeds.js), `PRAYERS` (from data/prayers.js)
- Produces: `window.Analytics` with 6 functions

- [ ] **Step 1: Create the file with IIFE wrapper and all computation functions**

```js
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
      const key = d.toISOString().slice(0, 10);
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
      progress: nextXP > curLevelXP ? Math.round((curXP - curLevelXP) / (nextXP - curLevelXP) * 100) : 100
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
```

- [ ] **Step 2: Verify in browser console**

Open browser, open console. Type:
```js
Analytics.getPrayerStats(30)
Analytics.getDeedStats(30)
Analytics.getHeatmapData(90)
```
Each should return a valid object with data.

- [ ] **Step 3: Commit**

```bash
git add analytics/analytics.js
git commit -m "feat: add analytics computation functions"
```

---

### Task 3: Create analytics/charts.js — Chart.js wrappers

**Files:**
- Create: `analytics/charts.js`

**Interfaces:**
- Consumes: global `Chart` (from CDN), `ChartMatrix` (from CDN)
- Produces: `window.Charts` with chart creation functions

- [ ] **Step 1: Create the file with all chart wrapper functions**

```js
(function() {
  'use strict';

  const COLORS = {
    primary: '#16a34a',
    secondary: '#22c55e',
    light: '#86efac',
    accent: '#f59e0b',
    red: '#ef4444',
    bg: 'rgba(22,163,74,0.15)',
    grid: 'rgba(255,255,255,0.08)',
    text: '#94a3b8',
    white: '#e2e8f0'
  };

  const instances = {};

  function destroy(id) {
    if (instances[id]) { instances[id].destroy(); delete instances[id]; }
  }

  function baseOptions(title) {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: { display: !!title, text: title, color: COLORS.white, font: { size: 14, weight: '600' } }
      },
      scales: {
        x: { ticks: { color: COLORS.text, font: { size: 10 } }, grid: { color: COLORS.grid } },
        y: { ticks: { color: COLORS.text, font: { size: 10 } }, grid: { color: COLORS.grid } }
      }
    };
  }

  function createLine(canvasId, labels, datasets, title) {
    destroy(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    instances[canvasId] = new Chart(ctx, {
      type: 'line',
      data: { labels, datasets: datasets.map(ds => ({ ...ds, borderWidth: 2, pointRadius: 2, tension: 0.3, fill: ds.fill !== false })) },
      options: baseOptions(title)
    });
    return instances[canvasId];
  }

  function createBar(canvasId, labels, data, color, title) {
    destroy(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    instances[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: { labels, datasets: [{ data, backgroundColor: color || COLORS.primary, borderRadius: 4 }] },
      options: baseOptions(title)
    });
    return instances[canvasId];
  }

  function createHorizontalBar(canvasId, labels, data, color, title) {
    destroy(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    const opts = baseOptions(title);
    const tmp = opts.scales.x;
    opts.scales.x = opts.scales.y;
    opts.scales.y = tmp;
    instances[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: { labels, datasets: [{ data, backgroundColor: color || COLORS.primary, borderRadius: 4 }] },
      options: opts
    });
    return instances[canvasId];
  }

  function createDoughnut(canvasId, labels, data, colors, title) {
    destroy(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    instances[canvasId] = new Chart(ctx, {
      type: 'doughnut',
      data: { labels, datasets: [{ data, backgroundColor: colors, borderWidth: 0 }] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'right', labels: { color: COLORS.text, font: { size: 11 }, padding: 8 } },
          title: { display: !!title, text: title, color: COLORS.white, font: { size: 14, weight: '600' } }
        }
      }
    });
    return instances[canvasId];
  }

  function createHeatmap(canvasId, data, title) {
    destroy(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    const maxVal = 5;
    instances[canvasId] = new Chart(ctx, {
      type: 'matrix',
      data: {
        datasets: [{
          label: 'Prayers',
          data: data.map(d => ({ x: d.date, y: d.date.slice(0, 3) === 'Sun' ? 0 : d.date.slice(0, 3) === 'Mon' ? 1 : d.date.slice(0, 3) === 'Tue' ? 2 : d.date.slice(0, 3) === 'Wed' ? 3 : d.date.slice(0, 3) === 'Thu' ? 4 : d.date.slice(0, 3) === 'Fri' ? 5 : 6, v: d.value })),
          backgroundColor(ctx) {
            const v = ctx.dataset.data[ctx.dataIndex];
            if (!v || !v.v) return 'rgba(255,255,255,0.03)';
            const alpha = 0.2 + (v.v / maxVal) * 0.8;
            return `rgba(22,163,74,${alpha})`;
          },
          width: ({ chart }) => (chart.chartArea || {}).width / 14 - 2,
          height: ({ chart }) => (chart.chartArea || {}).height / 7 - 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: { display: !!title, text: title, color: COLORS.white, font: { size: 14, weight: '600' } },
          tooltip: {
            callbacks: {
              title: (items) => items[0]?.raw?.x || '',
              label: (item) => `${item.raw.v} prayers`
            }
          }
        },
        scales: {
          x: { type: 'category', labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], ticks: { color: COLORS.text }, grid: { display: false } },
          y: { type: 'category', display: false }
        }
      }
    });
    return instances[canvasId];
  }

  function destroyAll() {
    Object.keys(instances).forEach(destroy);
  }

  window.Charts = {
    createLine,
    createBar,
    createHorizontalBar,
    createDoughnut,
    createHeatmap,
    destroyAll,
    COLORS
  };
})();
```

- [ ] **Step 2: Verify in browser console**

Open browser console, type `Charts.COLORS`. Should return the color object. Check no errors on load.

- [ ] **Step 3: Commit**

```bash
git add analytics/charts.js
git commit -m "feat: add Chart.js wrapper functions"
```

---

### Task 4: Create analytics/dashboard.js — orchestrator

**Files:**
- Create: `analytics/dashboard.js`

**Interfaces:**
- Consumes: `window.Analytics`, `window.Charts`, global `S`
- Produces: `window.Dashboard` with `renderInsights()` function

- [ ] **Step 1: Create the file with dashboard HTML builder and chart rendering**

```js
(function() {
  'use strict';

  let currentRange = 30;
  let rendered = false;

  const CAT_COLORS = ['#16a34a', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4'];

  function summaryCards() {
    const prayers = Analytics.getPrayerStats();
    const streak = Analytics.getStreakStats();
    const xp = Analytics.getXPStats();
    const totalDeeds = Object.values(S.td || {}).reduce((a, b) => a + b, 0);
    return `
      <div class="insights-cards">
        <div class="insight-card">
          <div class="insight-card-num">${prayers.total}</div>
          <div class="insight-card-label">Total Prayers</div>
          <div class="insight-card-sub">${prayers.rate}% completion</div>
        </div>
        <div class="insight-card">
          <div class="insight-card-num">${streak.current}</div>
          <div class="insight-card-label">Current Streak</div>
          <div class="insight-card-sub">Best: ${streak.best}</div>
        </div>
        <div class="insight-card">
          <div class="insight-card-num">${S.pd || 0}</div>
          <div class="insight-card-label">Perfect Days</div>
          <div class="insight-card-sub">${prayers.possible ? Math.round((S.pd || 0) / (prayers.possible / 5) * 100) : 0}% rate</div>
        </div>
        <div class="insight-card">
          <div class="insight-card-num">Lv ${xp.level}</div>
          <div class="insight-card-label">${xp.title}</div>
          <div class="insight-card-sub">${xp.progress}% to next</div>
        </div>
      </div>`;
  }

  function dateFilter() {
    const ranges = [{ v: 7, l: '7D' }, { v: 30, l: '30D' }, { v: 90, l: '90D' }, { v: 0, l: 'All' }];
    return `<div class="insights-filter">
      ${ranges.map(r => `<button class="filter-btn ${r.v === currentRange ? 'active' : ''}" onclick="Dashboard.setRange(${r.v})">${r.l}</button>`).join('')}
    </div>`;
  }

  function chartHTML(id, title, height) {
    return `<div class="insight-chart-wrap"><canvas id="${id}" style="width:100%;height:${height || 200}px;"></canvas></div>`;
  }

  function renderCharts() {
    Charts.destroyAll();

    // 1. Prayer Heatmap
    const heatData = Analytics.getHeatmapData(currentRange || 90);
    Charts.createHeatmap('chart-heatmap', heatData, 'Prayer Heatmap');

    // 2. Prayer Consistency Line
    const prayer = Analytics.getPrayerStats(currentRange);
    if (prayer.daily.length > 0) {
      const labels = prayer.daily.map(d => d.date.slice(5));
      Charts.createLine('chart-prayer-line', labels, [
        { label: 'All Prayers', data: prayer.daily.map(d => Math.round(d.count / 5 * 100)), borderColor: Charts.COLORS.primary, backgroundColor: Charts.COLORS.bg },
        { label: 'Fajr', data: prayer.daily.map(d => d.fajr * 100), borderColor: Charts.COLORS.accent, backgroundColor: 'rgba(245,158,11,0.1)', borderDash: [4, 4] }
      ], 'Prayer Consistency (%)');
    }

    // 3. Deed Distribution Doughnut
    const deeds = Analytics.getDeedStats(currentRange);
    if (deeds.byCategory.length > 0) {
      Charts.createDoughnut('chart-deeds', deeds.byCategory.map(c => c.category), deeds.byCategory.map(c => c.count), CAT_COLORS.slice(0, deeds.byCategory.length), 'Deed Distribution');
    }

    // 4. Streak Timeline
    const streak = Analytics.getStreakTimeline(currentRange);
    if (streak.length > 0) {
      Charts.createBar('chart-streak', streak.map(s => s.month), streak.map(s => s.perfectDays), Charts.COLORS.primary, 'Perfect Days by Month');
    }

    // 5. XP Progression
    const xp = Analytics.getXPStats(currentRange);
    if (xp.daily.length > 0) {
      Charts.createLine('chart-xp', xp.daily.map(d => d.date.slice(5)), [
        { label: 'Cumulative XP', data: xp.daily.map(d => d.cumulative), borderColor: Charts.COLORS.accent, backgroundColor: 'rgba(245,158,11,0.1)' }
      ], 'XP Progression');
    }

    // 6. Content Engagement
    const content = Analytics.getContentStats();
    if (content.length > 0) {
      Charts.createHorizontalBar('chart-content', content.map(c => c.name), content.map(c => c.consumed), Charts.COLORS.secondary, 'Content Consumed');
    }

    rendered = true;
  }

  function renderInsights() {
    const el = document.getElementById('statsArea');
    if (!el) return;

    if (!S || !S.log || Object.keys(S.log).length === 0) {
      el.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text2);">Start tracking to see insights</div>';
      return;
    }

    el.innerHTML = `
      <div class="insights-dashboard">
        ${summaryCards()}
        ${dateFilter()}
        <div class="insights-charts">
          ${chartHTML('chart-heatmap', 'Prayer Heatmap', 180)}
          ${chartHTML('chart-prayer-line', 'Prayer Consistency', 220)}
          <div class="chart-row">
            <div class="chart-half">${chartHTML('chart-deeds', 'Deed Distribution', 250)}</div>
            <div class="chart-half">${chartHTML('chart-streak', 'Streak Timeline', 250)}</div>
          </div>
          ${chartHTML('chart-xp', 'XP Progression', 220)}
          ${chartHTML('chart-content', 'Content Engagement', 220)}
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
```

- [ ] **Step 2: Verify in browser console**

Open browser, call `Dashboard.renderInsights()`. Should render the full dashboard in the stats area.

- [ ] **Step 3: Commit**

```bash
git add analytics/dashboard.js
git commit -m "feat: add analytics dashboard orchestrator"
```

---

### Task 5: Add CSS styles for the dashboard

**Files:**
- Modify: `index.html` (add `<style>` block in `<head>`)

**Interfaces:**
- Consumes: none
- Produces: `.insights-dashboard`, `.insights-cards`, `.insight-card`, `.insights-filter`, `.insights-charts`, `.chart-row`, `.chart-half`, `.insight-chart-wrap` styles

- [ ] **Step 1: Add the CSS to index.html `<head>`**

```html
<style>
  .insights-dashboard { padding: 10px 0; }
  .insights-cards { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 16px; }
  .insight-card { background: rgba(15,23,42,0.6); border: 1px solid rgba(22,163,74,0.2); border-radius: 12px; padding: 16px; text-align: center; }
  .insight-card-num { font-size: 1.8rem; font-weight: 700; color: var(--gold); }
  .insight-card-label { font-size: 0.85rem; color: var(--text2); margin-top: 4px; }
  .insight-card-sub { font-size: 0.75rem; color: rgba(148,163,184,0.6); margin-top: 2px; }
  .insights-filter { display: flex; gap: 8px; justify-content: center; margin-bottom: 16px; }
  .filter-btn { background: rgba(15,23,42,0.6); border: 1px solid rgba(22,163,74,0.3); color: var(--text2); padding: 6px 16px; border-radius: 20px; cursor: pointer; font-size: 0.8rem; transition: all 0.2s; }
  .filter-btn.active, .filter-btn:hover { background: rgba(22,163,74,0.2); color: #fff; border-color: var(--gold); }
  .insights-charts { display: flex; flex-direction: column; gap: 16px; }
  .insight-chart-wrap { background: rgba(15,23,42,0.4); border: 1px solid rgba(22,163,74,0.15); border-radius: 12px; padding: 16px; }
  .chart-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .chart-half { background: rgba(15,23,42,0.4); border: 1px solid rgba(22,163,74,0.15); border-radius: 12px; padding: 16px; }
  .chart-half canvas { width: 100% !important; height: 250px !important; }
  @media (max-width: 600px) { .chart-row { grid-template-columns: 1fr; } .insights-cards { grid-template-columns: repeat(2, 1fr); } }
</style>
```

- [ ] **Step 2: Verify in browser**

Open the app, navigate to Profile > Analytics tab. The dashboard should render with styled cards, filter buttons, and chart containers.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add analytics dashboard CSS styles"
```

---

### Task 6: Wire up renderStats() to use the new dashboard

**Files:**
- Modify: `render/render.js:1218-1236`

**Interfaces:**
- Consumes: `window.Dashboard.renderInsights()`
- Produces: `renderStats()` now calls dashboard

- [ ] **Step 1: Replace the renderStats function body**

Replace the existing `renderStats()` function (lines 1218-1236) with:

```js
function renderStats() {
  if (window.Dashboard && typeof Dashboard.renderInsights === 'function') {
    Dashboard.renderInsights();
  } else {
    const el = document.getElementById('statsArea');
    if (!el) return;
    el.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text2);">Loading analytics...</div>';
  }
}
```

- [ ] **Step 2: Verify in browser**

Open the app, navigate to Profile > Analytics. The full dashboard should appear with charts, not the old stat cards.

- [ ] **Step 3: Commit**

```bash
git add render/render.js
git commit -m "feat: upgrade renderStats to use analytics dashboard"
```

---

### Task 7: End-to-end verification

**Files:**
- Test all files together

**Interfaces:**
- Consumes: all tasks above
- Produces: working dashboard

- [ ] **Step 1: Full chain parse test**

Run: `node -e "const fs=require('fs');const vm=require('vm');const files=['analytics/analytics.js','analytics/charts.js','analytics/dashboard.js'];let c='';files.forEach(f=>{try{c+=fs.readFileSync(f,'utf8')}catch(e){console.log('MISSING:',f)}});try{vm.compileFunction(c);console.log('Parse: OK')}catch(e){console.log('Parse FAILED:',e.message)}"`

- [ ] **Step 2: Browser test**

1. Open `index.html` in browser
2. Navigate to Profile tab
3. Click Analytics sub-tab
4. Verify: 4 summary cards render with real data
5. Verify: Date filter buttons work (7D, 30D, 90D, All)
6. Verify: All 6 charts render with data
7. Verify: No console errors
8. Verify: Charts update when switching date range

- [ ] **Step 3: Edge case — empty state**

1. Open browser DevTools > Application > Local Storage
2. Delete the `iq9_user_*` key
3. Refresh page, create new user
4. Navigate to Analytics
5. Should show "Start tracking to see insights" message

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete analytics dashboard with Chart.js visualizations"
```
