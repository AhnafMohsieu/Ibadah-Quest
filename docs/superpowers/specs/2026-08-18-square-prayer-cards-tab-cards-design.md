# Design: Square Prayer Cards + Square Daily Sub-Tabs (Mobile Tab Cards)

**Date:** 2026-08-18
**Status:** Approved by user

## Problem

Two related layout issues on the tab/prayer surfaces:

1. **Prayer Times cards are tall and narrow, not square.** `.prayer-times-grid` uses `flex-wrap` with fixed fractional widths. Card height is driven by content (~145px), while width shrinks as columns increase, producing cards with width/height ratios of 0.73 (tablet) and 0.86 (desktop) — visually "vertically tall" as the user described. Only the 390px phone (2-col, ratio 1.06) is nearly square.

2. **Daily sub-tabs row is too tall and uneven.** The Daily section's 12 tabs render as a 4-col grid whose buttons have uneven heights (row 1 ≈65px, rows 2-3 ≈55px) because labels like "Prayer Times"/"Remembrance" wrap differently. The user wants the row tighter and the buttons to match the square Prayer Times card style ("like the Prayers Time").

## Goal

Make the Prayer Times cards true squares at every viewport, and restyle the mobile tab buttons (tier2, tier3, cat-chips) as square cards that match — one coherent card family. Desktop layout unchanged.

## Measured baseline (headless Chrome)

| Surface | Viewport | Card/button size | Ratio |
|---|---|---|---|
| Prayer Times cards | 390×844 | 153×145 | 1.06 |
| Prayer Times cards | 768×1024 | 106×145 | 0.73 |
| Prayer Times cards | 1366×900 | 125×145 | 0.86 |
| Daily sub-tabs row | 390×844 | 12 tabs, 4 cols × 3 rows, buttons 69×65 / 69×55 | uneven |

## Design

### 1. Prayer Times cards → true squares

File: `styles/main.css` (`.prayer-times-grid` block, ~line 615-631).

- Change `.prayer-times-grid` from `display: flex; flex-wrap: wrap` to `display: grid`.
- Add `grid-template-columns: repeat(auto-fit, minmax(140px, 1fr))`.
- Add `aspect-ratio: 1` to `.prayer-times-grid .pt-card`.
- Result (computed from measured widths):
  - 390px (container ~318px): 2 cols ≈153px squares.
  - 768px (container ~696px): 4 cols ≈165px squares.
  - 1366px (container ~808px): 5 cols ≈150px squares.
- Remove the fixed-column overrides for `.pt-card` in the ≤600px query (`main.css:1970`) and ≤400px query (`main.css:1974`). Auto-fit handles all breakpoints.
- Keep card internals (icon, name, time, sub) unchanged; verify content fits inside the smallest square (~140px) — if `pt-sub`/`pt-name` clip at the min column width, reduce `pt-card` padding (18px → 12px) or font sizes marginally.

### 2. Daily sub-tabs row (tier2) → square cards

File: `styles/main.css` (mobile tier2/tier3 grid override block, ~line 503-507).

- In the ≤600px query, change the tier2 grid to `grid-template-columns: repeat(auto-fit, minmax(70px, 1fr))` (replaces `repeat(4, 1fr)`).
- Buttons keep `width: 100%; min-width: 0`, add `aspect-ratio: 1` so they are strict squares (≈72px at 390px, 4 cols × 3 rows for 12 tabs).
- Equalize height across rows (all 3 rows same height), tighten `gap` (8px → 6px) and keep `padding: 6px 4px; font-size: 0.58rem` (or tune slightly so "Prayer Times"/"Remembrance" wrap cleanly inside a square).
- Result: ~30% less vertical space than current, even rows, square buttons.

### 3. Tier3 tabs + cat-chips → same square-card family

- `.tier3-tabs` in the ≤600px query: `repeat(auto-fit, minmax(70px, 1fr))` + button `aspect-ratio: 1`.
- `.tier2-tabs.cat-chips` in the ≤600px query: `repeat(auto-fit, minmax(70px, 1fr))`, chips become square cards (`aspect-ratio: 1`, keep `border-radius: 12px`).
- This keeps every tab level visually consistent on mobile.

### 4. Desktop unchanged

- Only the ≤600px media-query grid overrides change. Desktop `.tier1-tabs` (5-across), `.tier2-tabs`, `.tier3-tabs`, `.cat-chip`, `.prayer-times-grid` rules are untouched.
- `.tier1-tabs` mobile rule (5-across, icon-over-label) is NOT changed — the main nav stays as approved.

## Testing

- `tests/html.test.js` grid test (`mobile tab strips use even grids`) updated:
  - tier1 assertions unchanged (5-across).
  - tier2/tier3 assertions updated from `repeat(4, 1fr)` to `repeat(auto-fit, minmax(70px, 1fr))`.
  - Add assertion that `.prayer-times-grid` uses `repeat(auto-fit, minmax(140px, 1fr))` and `.pt-card` sets `aspect-ratio: 1`.
  - Preserve the first-600px-query constraint: `.t1-btn` + `width: auto;` in the first 400 chars.
- Full suite: `node --test tests/*.test.js` must stay green (317 tests, plus any new assertions).
- Headless verification at 390×844 / 768×1024 / desktop via CDP: prayer cards square (ratio ≈1.0), Daily sub-tabs 4×3 equal-height squares, tier3/chips square, no horizontal scroll, no console errors.

## Cache-busting

- Bump `styles/main.css?v=14` → `?v=15` already applied in the previous release (Task 6). Because this change edits `main.css` again, bump to `?v=16` in `index.html` and update `tests/html.test.js:126` pinned assertion to `styles/main.css?v=16`.

## Out of scope

- Main tier1 nav (5-across) — unchanged.
- Desktop layouts — unchanged.
- Any non-tab layout, content, or data changes.