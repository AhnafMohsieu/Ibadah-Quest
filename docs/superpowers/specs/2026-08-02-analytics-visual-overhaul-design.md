# Analytics Tab Visual Overhaul

**Date:** 2026-08-02
**Goal:** Align the Analytics tab visually with the app's gold theme, making it feel native and polished.

---

## Summary Cards

- Replace hardcoded `rgba(15,23,42,0.6)` background with `var(--card)` / `var(--card2)`
- Replace green `rgba(22,163,74,0.2)` borders with `var(--border)` (6% white)
- Add icons per card: 🕌 Total Prayers, 🔥 Current Streak, ⭐ Perfect Days, 📊 Level
- Add hover lift effect: `translateY(-2px)`, border transitions to gold
- Add mini progress bars under numbers (prayer completion %, XP progress %)
- Use `font-variant-numeric: tabular-nums` for number alignment

## Chart Wrappers

- Replace green `rgba(22,163,74,0.15)` borders with `var(--border)`
- Use `var(--card2)` background instead of hardcoded `rgba(15,23,42,0.4)`
- Add `box-shadow: var(--shadow)` and hover transition
- 14px border radius (`var(--radius-sm)`)

## Filter Buttons

- Active state: gold background `rgba(212,175,55,0.15)` + gold border `var(--gold)`
- Hover: same gold tint
- Remove all green tints

## Heatmap Colors

Replace purple/pink scale with green gradient:
- 0: `#1a1f2e` (empty)
- 1: `#14532d` (dark green)
- 2: `#166534` (forest green)
- 3: `#16a34a` (green-600)
- 4: `#22c55e` (green-500)
- 5: `#4ade80` (green-400, brightest)

## Animations

- Staggered fade-in for summary cards (100ms delay between each)
- Charts fade in after rendering (0.3s ease)
- Smooth transitions on all hover states (0.2-0.3s)

## Typography

- Chart titles: gold color `var(--gold)`, `var(--font-heading)` (Cinzel)
- Card numbers: `font-variant-numeric: tabular-nums`
- Axis labels: match `--text2` consistently

---

## Files to Modify

| File | Changes |
|------|---------|
| `styles/main.css` | Update `.insight-card`, `.insight-chart-wrap`, `.filter-btn`, add animations |
| `analytics/dashboard.js` | Update card HTML to include icons and progress bars |
| `analytics/charts.js` | Update heatmap colors, chart title styling |

## Out of Scope

- No new charts or data
- No layout changes (2-column cards, chart row structure stays)
- No new dependencies
