# Analytics Visual Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align the Analytics tab visually with the app's gold theme — cards, charts, filters, heatmap, animations, and typography.

**Architecture:** Update CSS variables and classes in `styles/main.css`, update card HTML in `analytics/dashboard.js`, update heatmap colors and chart title styling in `analytics/charts.js`. No new files or dependencies.

**Tech Stack:** Vanilla CSS, vanilla JS, Chart.js v4

## Global Constraints

- One commit per task
- Follow existing code conventions (no new comments, no new dependencies)
- Use CSS variables from `:root` (`--card`, `--border`, `--gold`, etc.)
- No layout changes — only visual styling

---

## File Map

| File | Responsibility |
|------|----------------|
| `styles/main.css` | All CSS changes — card styles, chart wrappers, filter buttons, animations |
| `analytics/dashboard.js` | Card HTML — add icons, progress bars |
| `analytics/charts.js` | Heatmap color scale, chart title font/color |

---

### Task 1: Update Summary Card CSS

**Files:**
- Modify: `styles/main.css:372-387` (`.insight-card`, `.insight-card-num`, etc.)

**What changes:**
- `.insight-card`: use `var(--card)` bg, `var(--border)` border, add `transition`, hover lift
- `.insight-card-num`: add `font-variant-numeric: tabular-nums`
- Add `.insight-card-icon` style
- Add `.insight-progress` mini bar style

- [ ] **Step 1: Update `.insight-card` CSS**

Replace in `styles/main.css`:

```css
.insight-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 16px;
  text-align: center;
  transition: transform 0.2s, border-color 0.2s;
}
.insight-card:hover {
  transform: translateY(-2px);
  border-color: rgba(212,175,55,0.3);
}
.insight-card-num {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--gold);
  font-variant-numeric: tabular-nums;
}
.insight-card-label {
  font-size: 0.85rem;
  color: var(--text2);
  margin-top: 4px;
}
.insight-card-sub {
  font-size: 0.75rem;
  color: rgba(148,163,184,0.6);
  margin-top: 2px;
}
.insight-card-icon {
  font-size: 1.4rem;
  margin-bottom: 6px;
}
.insight-progress {
  height: 4px;
  background: rgba(255,255,255,0.06);
  border-radius: 4px;
  margin-top: 8px;
  overflow: hidden;
}
.insight-progress-bar {
  height: 100%;
  background: var(--gold);
  border-radius: 4px;
  transition: width 0.4s ease;
}
```

- [ ] **Step 2: Verify in browser**

Open Analytics tab. Cards should have subtle borders, hover lift, gold progress bars.

- [ ] **Step 3: Commit**

```bash
git add styles/main.css
git commit -m "style: update summary cards to match gold theme"
```

---

### Task 2: Update Card HTML with Icons and Progress Bars

**Files:**
- Modify: `analytics/dashboard.js:8-35` (`summaryCards` function)

**What changes:**
- Add icon div above each number
- Add mini progress bar under prayer rate and XP progress

- [ ] **Step 1: Update `summaryCards()` in dashboard.js**

Replace the function:

```js
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
```

- [ ] **Step 2: Verify in browser**

Cards should now show icons (🕌🔥⭐📊) and gold progress bars under Prayers and Level.

- [ ] **Step 3: Commit**

```bash
git add analytics/dashboard.js
git commit -m "feat: add icons and progress bars to analytics summary cards"
```

---

### Task 3: Update Chart Wrapper CSS

**Files:**
- Modify: `styles/main.css:383-386` (`.insight-chart-wrap`, `.chart-half`)

**What changes:**
- Use `var(--card2)` background, `var(--border)` border
- Add `var(--shadow)` box-shadow
- Add hover transition

- [ ] **Step 1: Update chart wrapper CSS**

Replace in `styles/main.css`:

```css
.insight-chart-wrap {
  background: var(--card2);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 16px;
  overflow-x: auto;
  box-shadow: var(--shadow);
  transition: border-color 0.2s;
}
.insight-chart-wrap:hover {
  border-color: rgba(212,175,55,0.2);
}
.insight-chart-wrap canvas {
  display: block;
  margin: 0 auto;
  background: #0d1117;
  border-radius: 8px;
}
.chart-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.chart-half {
  background: var(--card2);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 16px;
  box-shadow: var(--shadow);
  transition: border-color 0.2s;
}
.chart-half:hover {
  border-color: rgba(212,175,55,0.2);
}
.chart-half canvas {
  width: 100% !important;
  height: 250px !important;
}
```

- [ ] **Step 2: Verify in browser**

Chart wrappers should have subtle shadows, matching borders, and gold hover glow.

- [ ] **Step 3: Commit**

```bash
git add styles/main.css
git commit -m "style: update chart wrappers to match gold theme"
```

---

### Task 4: Update Filter Buttons CSS

**Files:**
- Modify: `styles/main.css:379-381` (`.filter-btn`)

**What changes:**
- Active state: gold bg + gold border
- Hover: gold tint
- Remove green tints

- [ ] **Step 1: Update filter button CSS**

Replace in `styles/main.css`:

```css
.insights-filter {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-bottom: 16px;
}
.filter-btn {
  background: rgba(15,23,42,0.6);
  border: 1px solid var(--border);
  color: var(--text2);
  padding: 6px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s;
}
.filter-btn.active,
.filter-btn:hover {
  background: rgba(212,175,55,0.15);
  color: #fff;
  border-color: var(--gold);
}
```

- [ ] **Step 2: Verify in browser**

Click filter buttons — active state should be gold, not green.

- [ ] **Step 3: Commit**

```bash
git add styles/main.css
git commit -m "style: update filter buttons to gold active state"
```

---

### Task 5: Update Heatmap Color Scale

**Files:**
- Modify: `analytics/charts.js:145-152` (`getColor` in `createHeatmap`)

**What changes:**
- Replace purple/pink gradient with green gradient

- [ ] **Step 1: Update `getColor` in charts.js**

Replace:

```js
const getColor = (val) => {
  if (val === 0) return '#1a1f2e';
  if (val === 1) return '#14532d';
  if (val === 2) return '#166534';
  if (val === 3) return '#16a34a';
  if (val === 4) return '#22c55e';
  return '#4ade80';
};
```

- [ ] **Step 2: Verify in browser**

Heatmap should show green gradient instead of purple/pink.

- [ ] **Step 3: Commit**

```bash
git add analytics/charts.js
git commit -m "style: update heatmap to green gradient scale"
```

---

### Task 6: Update Chart Title Typography

**Files:**
- Modify: `analytics/charts.js:22-35` (`baseOptions`)

**What changes:**
- Chart titles: gold color, Cinzel font
- Ensure axis labels match `--text2`

- [ ] **Step 1: Update `baseOptions` in charts.js**

Replace:

```js
function baseOptions(title) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: !!title,
        text: title,
        color: '#D4AF37',
        font: { family: "'Cinzel', serif", size: 14, weight: '600' }
      }
    },
    scales: {
      x: { ticks: { color: '#94A3B8', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.08)' } },
      y: { ticks: { color: '#94A3B8', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.08)' } }
    }
  };
}
```

- [ ] **Step 2: Also update doughnut title in `createDoughnut`**

In `createDoughnut` (around line 89), update the title config:

```js
title: {
  display: !!title,
  text: title,
  color: '#D4AF37',
  font: { family: "'Cinzel', serif", size: 14, weight: '600' }
}
```

- [ ] **Step 3: Verify in browser**

Chart titles should be gold and use Cinzel font.

- [ ] **Step 4: Commit**

```bash
git add analytics/charts.js
git commit -m "style: update chart titles to gold Cinzel typography"
```

---

### Task 7: Add Entrance Animations

**Files:**
- Modify: `styles/main.css` (add new keyframes and animation classes)

**What changes:**
- Add `@keyframes fadeInUp` animation
- Apply staggered animation to cards and charts

- [ ] **Step 1: Add animation CSS to main.css**

Add before the `/* ── Fireflies ── */` section:

```css
/* ── Analytics Animations ── */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
.insights-cards .insight-card {
  animation: fadeInUp 0.4s ease both;
}
.insights-cards .insight-card:nth-child(1) { animation-delay: 0ms; }
.insights-cards .insight-card:nth-child(2) { animation-delay: 80ms; }
.insights-cards .insight-card:nth-child(3) { animation-delay: 160ms; }
.insights-cards .insight-card:nth-child(4) { animation-delay: 240ms; }
.insights-charts .insight-chart-wrap,
.insights-charts .chart-half {
  animation: fadeInUp 0.4s ease both;
  animation-delay: 300ms;
}
```

- [ ] **Step 2: Verify in browser**

Switch to Analytics tab — cards should fade in staggered, charts should fade in after.

- [ ] **Step 3: Commit**

```bash
git add styles/main.css
git commit -m "style: add staggered fade-in animations to analytics dashboard"
```

---

## Verification

After all tasks, verify the full dashboard:
1. Summary cards: gold theme, icons, progress bars, hover lift
2. Chart wrappers: shadows, gold hover border
3. Filter buttons: gold active state
4. Heatmap: green gradient
5. Chart titles: gold Cinzel font
6. Animations: staggered fade-in on tab switch
7. All charts render correctly (no JS errors)
