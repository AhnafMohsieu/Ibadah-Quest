# Analytics Dashboard Design

**Date:** 2026-08-01
**Status:** Approved
**Scope:** Personal-use analytics dashboard for Ibadah Quest

## Overview

Add a visual analytics dashboard as a new "Insights" tab in the Ibadah Quest app. All computation runs in the browser using Chart.js. No backend, no Python, no new data structures — reads entirely from existing localStorage state (`S`).

## Architecture

### New Files

| File | Purpose |
|------|---------|
| `analytics/analytics.js` | Computation functions. Reads `S`, returns chart-ready datasets. |
| `analytics/charts.js` | Chart.js wrapper functions. Creates bar, line, doughnut, matrix (heatmap) charts. |
| `analytics/dashboard.js` | Orchestrator. Builds Insights tab HTML, calls computation, renders charts. Handles date range filtering. |

### Modified Files

| File | Change |
|------|--------|
| `index.html` | Add CDN links for Chart.js + chartjs-chart-matrix plugin. Add 3 `<script>` tags for analytics files. Add Insights tab button and `#insights-content` div. |

### Unchanged Files

- `render/render.js` — no modifications. Dashboard rendering is self-contained in `dashboard.js`.
- `state/state.js` — no modifications.
- `core/actions.js` — no modifications.

### Data Flow

```
localStorage → S (state) → analytics.js (compute) → charts.js (render Chart.js instances)
```

### CDN Dependencies

- `chart.js` v4 — core charting library
- `chartjs-chart-matrix` v2 — heatmap/matrix plugin for Chart.js

Both loaded via `<script>` tags from CDN (jsdelivr/unpkg). Version-pinned.

## Dashboard Layout

### Summary Cards (top row, 4 cards)

| Card | Source | Display |
|------|--------|---------|
| Total Prayers | `S.tp` | Count + % of possible (days × 5) |
| Current Streak | `S.cs` / `S.bs` | Current / Best |
| Perfect Days | `S.pd` | Count + rate % |
| Level & XP | `S.lv`, `S.xp` | Title + XP with progress bar to next level |

### Chart Sections (6 charts)

#### 1. Prayer Heatmap
- **Type:** Calendar-style grid (chartjs-chart-matrix)
- **Data:** Last 90 days, color-coded by prayer count (0–5)
- **Color:** Green gradient (0 = empty, 5 = darkest)
- **Source:** `S.log[date].p` for each date

#### 2. Prayer Consistency
- **Type:** Line chart
- **Data:** 7-day rolling average of prayer completion rate
- **X-axis:** Dates, **Y-axis:** % prayers completed
- **Lines:** One for all prayers, one for Fajr specifically
- **Source:** `S.log[date].p` iterated over date range

#### 3. Deed Distribution
- **Type:** Doughnut chart
- **Data:** Deeds grouped by category
- **Categories:** Worship, Character, Charity, Knowledge, Family, Sunnah
- **Source:** `S.log[date].d` cross-referenced with `DEEDS[].cat`

#### 4. Streak Timeline
- **Type:** Bar chart
- **Data:** Monthly streak lengths
- **Source:** Derived from `S.log` by computing streaks per month

#### 5. XP Progression
- **Type:** Line chart
- **Data:** Cumulative XP over time
- **Markers:** Level-up milestones
- **Source:** Derived from `S.log` by computing daily XP earned

#### 6. Content Engagement
- **Type:** Horizontal bar chart
- **Data:** Top 10 most-consumed content pools
- **Source:** All `*Idx` arrays in `S` vs total pool sizes

### Date Range Filter

Toggle buttons at top of dashboard: **7 days | 30 days | 90 days | All time**

Filters all charts to show only the selected range. Default: 30 days.

## Computation Details (`analytics.js`)

### `getPrayerStats(state, startDate, endDate)`
Returns: `{ total, possible, rate, fajrRate, dailyBreakdown: [{date, count, fajr}] }`

### `getDeedStats(state, startDate, endDate)`
Returns: `{ byCategory: [{category, count, pct}], topDeeds: [{id, name, count}] }`

### `getStreakStats(state, startDate, endDate)`
Returns: `{ current, best, monthlyStreaks: [{month, length}] }`

### `getXPStats(state, startDate, endDate)`
Returns: `{ total, daily: [{date, xp}], level, title, nextLevelXP, progress }`

### `getContentStats(state)`
Returns: `{ pools: [{name, consumed, total, pct}].slice(0,10) }`

### `getHeatmapData(state, days)`
Returns: `{ date, value }[]` for last N days (value = prayer count 0–5)

## Chart Configuration (`charts.js`)

Each function takes a canvas element ID and data, returns a Chart.js instance.

- `createHeatmap(canvasId, data)` — matrix chart
- `createLineChart(canvasId, labels, datasets)` — line chart
- `createDoughnut(canvasId, labels, data, colors)` — doughnut
- `createBarChart(canvasId, labels, data, color)` — bar
- `createHorizontalBar(canvasId, labels, data, color)` — horizontal bar

All charts use the Islamic green color palette:
- Primary: `#16a34a` (green-600)
- Secondary: `#22c55e` (green-500)
- Light: `#86efac` (green-300)
- Accent: `#f59e0b` (amber for highlights)
- Background: `#0f172a` (dark slate, matching app theme)

## UI Integration (`dashboard.js`)

### Tab Button
Added to existing tab bar in `index.html`:
```html
<button class="tab-btn" onclick="switchTab('insights')" data-tab="insights">
  <span class="tab-icon">📊</span> Insights
</button>
```

### Tab Content
```html
<div id="tab-insights" class="tab-content" style="display:none">
  <div id="insights-content"></div>
</div>
```

### Initialization
`dashboard.js` exports `renderInsights()` to `window`. Called when Insights tab is activated. Checks if charts are already rendered (avoids re-creating on tab switch).

## Error Handling

- If `S` is null/empty (fresh state), show "Start tracking to see insights" message
- If date range has no data, show "No data for this period"
- Chart.js errors caught and displayed as user-friendly messages

## Testing

1. Open `index.html` in browser
2. Log some prayers and deeds across multiple days
3. Click Insights tab
4. Verify all 6 charts render with correct data
5. Test date range filter toggles
6. Test with empty state (fresh localStorage)
7. Verify no errors in browser console
