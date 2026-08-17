# Remove Mood Feature + Even-Grid Tab Layout — Design

**Date:** 2026-08-17
**Status:** Approved (user: "ok")

## Problem

1. **Mood tab breaks the Daily row:** The Daily (`ibadah`) group has 13 tabs; the `mood` tab at `data/tab-groups.js:17` is the 13th, causing the tier2 strip to wrap unevenly (`[3,3,2,3,2]`).
2. **Tab strips look scattered:** On mobile (≤600px), tier1 wraps to `[2,2,1]` (a lone "Profile" button in the last row) and tier2/tier3 wrap into ragged rows of varying widths. The user wants tabs to look tidy and visually appealing — equal-width cells in an even grid, no horizontal scrolling.
3. **Mood feature is unused/unwanted:** The user wants the Mood feature removed entirely, not just hidden.

## Decisions (user-confirmed)

- **Mood:** Remove the feature entirely (tab, tracker code, panel, achievements, data, styles).
- **Tab layout:** Even equal-width grid cells; **4 per row** on mobile for tier2/tier3.
- **Tier1 (5 category buttons):** Keep **5 across in one row** (equal-width grid like desktop) — do NOT force 4 columns, which would strand Profile alone on row 2.

## Part A — Remove Mood Feature Entirely

Delete every trace of the Mood feature. Existing users' saved `moodLog` state in localStorage becomes harmless dead data (nothing reads it anymore).

| File | Change |
|---|---|
| `data/tab-groups.js:17` | Remove `{ id: 'mood', label: 'Mood' }` from the `ibadah` group (13 → 12 tabs) |
| `index.html:166` | Remove `<div class="tab-panel" role="tabpanel" id="panel-mood"><div id="moodArea"></div></div>` |
| `index.html:385` | Remove `<script src="data/pools/mood.js?v=2"></script>` |
| `index.html:485` | Remove `<script src="features/mood.js?v=3" defer></script>` |
| `features/mood.js` | Delete file |
| `data/pools/mood.js` | Delete file |
| `render/dynamic.js:78` | Remove the `safe(() => window.renderMoodTab && window.renderMoodTab(), 'MoodTab');` call |
| `render/tabs.js:95` | Remove `'panel-mood'` from `getSectionPanels()` home array |
| `render/tabs.js:114` | Remove `'panel-mood'` from the inline `panelLookup` home array |
| `state/state.js:37` | Remove `moodLog:{}` from the default state object |
| `data/achievements.js` | Remove mood-related achievements: `a225` (Mood Tracker 1), `a226` (Mood Tracker 7), `a227` (Mood Tracker 30), `a228` (Mood Tracker 100), `a229` (Mood Tracker 365), `a230` (Reflection Starter), `a231` (Reflection Writer), `a232` (Reflection Master), `a233` (Gratitude Journal 10), `a234` (Gratitude Journal 50), `a285` (FirstReflection) |
| `data/icons.js:92` | Remove `'mood':'rainbow',` |
| `data/icons.js:174-176` | Remove the `/* Mood (data/pools/mood.js) */` block (great/good/okay/low/stressed mappings) |
| `data/icons.js:240` | Remove `['mood', 'cloud-sun'],` |
| `styles/main.css:1662-1671` | Remove `.mood-streak`, `.mood-streak-num`, `.mood-streak-label`, `.mood-select`, `.mood-select-label`, `.mood-options`, `.mood-btn`, `.mood-btn:hover`, `.mood-btn.active`, `.mood-btn-label` |

Notes:
- `a286` "Gratitude 3" uses `s.gratitudeLog` (the separate top-level gratitude feature) — it is NOT mood-related and stays.
- `gratitudeLog:{}` at `state/state.js:33` is a different feature — stays.
- `tests/quests.test.js:52` has a `moodLog:{}` fixture entry — it is a test-local fixture object, harmless to leave, but should be removed for cleanliness (one line).
- No service worker / manifest references mood.

## Part B — Even-Grid Tab Layout (mobile ≤600px)

Replace the current mobile `flex-wrap` behavior (from the bugfix-phase1 Task 3 commit) with equal-width grid cells. The ragged centering is what makes tabs look scattered; an equal-width grid gives uniform, aligned rows.

### Tier1 — 5 across, one row
- Keep 5 equal-width columns (grid `repeat(5, 1fr)`) at all widths — same structure as the existing desktop rule.
- On mobile, buttons are narrow; the `.t1-btn` currently lays out icon + label in a horizontal row (`display:flex; align-items:center; gap:6px`). For narrow cells, stack the icon above the label (column direction) so "Knowledge" etc. remain readable in a 5-column grid at 390px.
- Remove the mobile `flex-wrap` override so tier1 never wraps to `[2,2,1]`.

### Tier2 / Tier3 — 4 per row
- `#tier2Tabs` (flat groups like Daily): grid `repeat(4, 1fr)`. Daily's 12 tabs → 3 clean rows of 4.
- `#tier2Tabs.cat-chips` (categorized groups like Knowledge/Library): grid `repeat(4, 1fr)`. Knowledge 7 chips → `[4,3]`, Library 5 → `[4,1]`.
- `#tier3Tabs` (sub-tabs): grid `repeat(4, 1fr)`. Heart & Soul 17 → `[4,4,4,4,1]`.
- Buttons keep their existing `flex: column; align-items: center` internal layout (icon over label) — only the container changes from wrap to grid.
- Partial last rows are left-aligned and uniform-width — tidy, not scattered.
- Remove `overflow-x: auto` from `.tier2-scroll` / `.tier3-scroll` on mobile (no horizontal scrolling needed when everything wraps into a grid). The scroll wrappers themselves become `overflow-x: hidden`.

### Desktop (>600px)
- Unchanged: tier1 is already a 5-col grid; tier2/tier3 keep their current desktop layout (no regression).

### Files
- `styles/main.css:408-415` (tier1 rules + mobile override), `479-493` (tier2/tier3 scroll + tabs rules).

## Tests

- `tests/html.test.js:412-420` "mobile tab strips wrap instead of scrolling" — REWRITE to assert the new grid:
  - first 600px media query still contains `.t1-btn` and `width: auto;` (preserve the existing 366-372 constraint).
  - mobile tier1 must NOT `flex-wrap: wrap`; must use a 5-column grid (`repeat(5, 1fr)` or `grid-template-columns: repeat(5, 1fr)`).
  - `.tier2-tabs.cat-chips` and `.tier2-tabs` must use 4-column grid (`repeat(4, 1fr)`).
  - `.tier2-scroll` / `.tier3-scroll` must not use `overflow-x: auto`.
- `tests/html.test.js:366-372` "mobile tier1 media query overrides t1-btn width to auto" — MUST keep passing (`.t1-btn` + `width: auto;` within first 400 chars of first 600px query).
- Append a test asserting Mood is fully gone:
  - `data/tab-groups.js` has no `'mood'` tab in `ibadah`.
  - `index.html` has no `panel-mood`, no `moodArea`, no `pools/mood.js`, no `features/mood.js`.
  - `state/state.js` has no `moodLog`.
  - `data/achievements.js` has no `Mood`/`Reflection`/`Gratitude Journal`/`FirstReflection` achievements (no `a225`..`a234`, no `a285`).
  - `features/mood.js` and `data/pools/mood.js` files deleted.
  - `styles/main.css` has no `.mood-btn` / `.mood-streak`.
- Full suite stays green (currently 315 passing).

## Out of Scope

- The deferred cleanup workstream (script consolidation, dead code, architecture) — NOT part of this change.
- The bugfix-phase1 icons/FAB fixes (Tasks 1-2, committed) — untouched.

## Verification

- `node --test tests/*.test.js` → all pass.
- Headless Chrome at 390×844 (via CDP harness):
  - Daily tier2 = 12 tabs in exactly 3 rows of 4, all equal width, no horizontal scroll.
  - Tier1 = 5 buttons in one row, no wrap, no lone-button row.
  - No console errors; bnav icons + FAB icons still present (Tasks 1-2 intact).
  - No `Mood` tab or panel anywhere.
