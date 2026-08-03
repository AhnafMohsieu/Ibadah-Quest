# Spiritual Growth Features — Spiritual Garden, Weekly Muhasabah, 40-Day Journeys

Date: 2026-08-03
Status: Approved design

## Goal

Ibadah Quest makes a philosophical shift: **no leaderboards, no competition, no comparison to others**. The strict focus is personal habit building, earning Thawab, and sincere self-improvement (Ikhlas), without anxiety. This spec adds three personal-growth features that reinforce that shift:

1. **Spiritual Garden** — a visual "Tree of Deeds" that grows with the user, never withers.
2. **Weekly Muhasabah** — a private Friday self-reflection modal summarizing the week.
3. **40-Day Habit Journeys** — opt-in 40-day grids that track persistence, never reset on missed days.

Competition removal: the unused `panel-leaderboard` HTML block is deleted. The personal Challenges and Trophies tabs stay untouched (they are personal goal lists, not competitive).

## Architecture

New `features/` directory (mirrors the existing `analytics/` split pattern). Each feature is a self-contained IIFE exposing functions on `window`, following the existing render.js/actions.js IIFE convention. All three features are loaded from `index.html` after `render.js` and before `core/actions.js`.

| File | Responsibility | Exports |
|------|---------------|---------|
| `data/journeys.js` | Journey definitions | `JOURNEYS` (global const) |
| `features/garden.js` | SVG tree renderer | `window.renderGarden` |
| `features/muhasabah.js` | Reflection modal + weekly trigger + Today-panel entry | `window.renderMuhasabahEntry`, `window.maybeShowMuhasabah`, `window.openMuhasabah` |
| `features/journeys.js` | Journeys tab: cards, opt-in, 40-day grid | `window.renderJourneys`, `window.joinJourney` |

### Wiring

- `index.html`:
  - Remove the `panel-leaderboard` block (currently dead code with "Coming Soon").
  - In `panel-today`, add `<div id="gardenArea"></div>` at the very top (above `dailyWidgetArea`), and a reflection entry button container `<div id="muhasabahEntry"></div>` just below it.
  - Add `<div class="tab-panel" id="panel-journeys"><div id="journeyArea"></div></div>`.
  - Add script tags for `data/journeys.js` and the three `features/*.js` files between the analytics scripts and `core/actions.js`.
- `data/tab-groups.js`: add `{ id: 'journeys', icon: '🌱', label: 'Journeys' }` to the `ibadah` group right after `challenges`.
- `render/render.js`: add `renderGarden`, `renderMuhasabahEntry`, and `renderJourneys` to the `safe(...)` chain in `renderDynamic()` (after `renderToday`). They are defined in the features modules and exported on `window`; render.js just calls them defensively.
- `core/actions.js`: in `initApp()` (after `renderAll()`), call `window.maybeShowMuhasabah?.()`. Add `joinJourney: window.joinJourney` to `window.App`.

## State changes (`state/state.js`)

`freshState()` gains two fields, which migrate into existing saves automatically via the default-fill loop in `loadState()`:

- `muhWeek: ''` — the `ws()` week-id of the last reviewed week (dismiss marker for the Muhasabah modal).
- `journeys: {}` — opt-in map: `{ [journeyId]: startDateString }`.

No per-journey progress is stored. Journey progress is **derived** from the existing `S.log` (auto-link principle): a journey day counts when the mapped log key is present on a date on or after the journey start date.

## Feature 1 — Spiritual Garden

### Placement

Top of the Today panel (`#gardenArea`), above the daily widgets. Always visible on the app's main screen as quiet visual motivation.

### Growth model

Five stages. A stage is unlocked when the user's **total XP (`S.xp`) AND the streak gate (`max(S.cs, S.bs)`)** both meet the stage thresholds. Because both inputs are monotonic (best streak never decreases), the garden only ever grows or stays stable.

| Stage | Name | XP ≥ | Streak ≥ |
|-------|------|------|----------|
| 1 | Seed 🌱 | 0 | 0 |
| 2 | Sprout 🌿 | 150 | 3 |
| 3 | Sapling 🌳 | 500 | 7 |
| 4 | Mature Tree 🌲 | 1500 | 14 |
| 5 | Blooming Tree 🌸 | 4000 | 30 |

**Never-wither guarantee:** streak is the only regression-prone input. The stage gate uses `max(S.cs, S.bs)` (best streak, which is monotonic — already maintained by `recalc()` in actions.js). Since the garden is fully derived from monotonic inputs, the stage never regresses by construction.

### Rendering

- Hand-built inline SVG (no library): each stage has its own tree `path` geometry (seed sprout → thin sapling trunk with leaves → tall trunk with branches → canopy → canopy with flower circles at branch tips).
- Inside a stage, a CSS `transform: scale(...)` animation from 1.00 → 1.12 interpolates XP progress within the stage's XP range (e.g. stage 2 covers XP 150–499), giving a continuous "growing" feel between milestones.
- Blooming stage renders flowers (`<circle>` + petal paths) whose count grows with streak above 30 (e.g. 1 flower per 5 streak points beyond 30, capped at 7).
- Card UI below the SVG: stage name, and a gentle progress line toward the next stage: "Sprout — 320/350 XP to Sapling" plus streak progress (e.g. "4/7 day streak for the next stage"). No numbers are compared to anyone; all text is self-referential.
- Gentle reinforcing caption (rotating from a small list): e.g. "Every deed grows a garden on your scale," "May Allah accept it."

### Data flow

Garden is fully derived from `S.xp`, `S.cs`, `S.bs`. No new state. `renderGarden()` reads these and re-renders on every `renderDynamic()` pass (already triggered after every toggle via `renderAll()`).

## Feature 2 — Weekly Muhasabah

### Trigger

- Runs in `maybeShowMuhasabah()`, called once during `initApp()`.
- Shows the modal only when `isFri()` is true **and** `S.muhWeek !== ws()` (i.e. this week's Friday hasn't been reviewed yet).
- Dismissing (close button or a "JazakAllah khair" button) sets `S.muhWeek = ws()`. If the app is not opened on Friday, no modal appears until the next Friday. No catch-up, no nagging.

### Summary content (read from `S.log`)

Week window: the current week, Monday through Friday of the current week (the modal only appears on Friday, so Mon–Fri is the completed portion; `ws()`/`we()` helpers already exist in state.js).

Computed metrics:
- `prayers`: total prayers logged Mon–Fri (`sum of Object.values(log[day].p).filter(v => v).length`).
- `daysPrayed`: number of Mon–Fri days with ≥ 1 prayer logged.
- `streak`: `S.cs` (current streak).
- `deeds`: total extra deeds logged Mon–Fri (`sum of Object.values(log[day].d).filter(v => v).length`).

Hero line, e.g.: **"Alhamdulillah, you prayed 27 prayers this week and kept a 6-day streak."** All copy is gentle, gratitude-first, and private.

### Suggestion logic

Curated suggestion pool (deed ids from `data/deeds.js`): `['charity', 'fasting', 'istighfar', 'sadaqah_jariyah', 'dua_others']`.

For each, count logs in the trailing 14 days (today minus 14, inclusive) via `countDeedP(S, id, start, end)` (exists in state.js). Pick the deed with the lowest count (ties → first in pool order). If that count is 0, suggest with a gentle line: *"Perhaps next week, try dedicating a moment to 🤲 charity."* If all deeds were logged at least once in 14 days, show a celebration line instead (e.g. *"Your garden is thriving — keep nourishing it."*).

### UI

- A lightweight modal overlay (fixed, centered card, dark translucent backdrop) consistent with the app's gold/dark theme (`var(--gold)`, `var(--card2)`).
- Contents: title "Weekly Muhasabah · Friday Reflection", the hero line, a small list of the week's numbers (prayers, days prayed, streak, deeds), the gentle suggestion, and a dismiss button.
- The Today panel shows a quiet entry (`#muhasabahEntry`) — "📝 Weekly Reflection" — that calls `window.openMuhasabah()` to reopen the modal anytime (read-only view; opening manually does not change `S.muhWeek`).

## Feature 3 — 40-Day Habit Journeys

### Placement

New tab `🌱 Journeys` in the `ibadah` (Daily) group, between Challenges and Morning. Panel `panel-journeys` → `#journeyArea`.

### Journey definitions (`data/journeys.js`)

Each journey maps to an existing log key so days auto-count (no double-entry, no manual check-in):

| id | Name | Icon | Log source |
|----|------|------|------------|
| `fajr40` | 40 Days of Fajr | 🕌 | `log[date].p.Fajr` truthy |
| `istighfar40` | 40 Days of Istighfar | 🤍 | `log[date].d.istighfar` truthy |
| `quran40` | 40 Days of Qur'an | 📖 | `log[date].d.quran` truthy |
| `salawat40` | 40 Days of Salawat | 💚 | `log[date].d.salawat` truthy |

Definition shape: `{ id, name, icon, desc, kind: 'p' | 'd', key: 'Fajr' | 'istighfar' | ..., target: 40 }`. (Prayer keys are uppercase ids in `p`; deed keys are lowercase ids in `d` — mirror the existing `toggleP`/`toggleD` conventions.)

### Opt-in flow

- Journeys tab lists all journeys as cards. Cards show name, icon, description, and current state:
  - **Not started**: "Begin 40-Day Journey" button → `joinJourney(id)` sets `S.journeys[id] = today()` and re-renders.
  - **In progress**: 40-cell grid + progress summary.
  - **Complete**: grid all filled + "Alhamdulillah, journey complete" state.
- Journey starts the day the user opts in; days before opt-in are not credited retroactively.

### Grid tracker

- 40 cells in an 8×5 grid. Each cell = one completed day.
- `completed = number of dates D in [startDate, today] where the mapped log key is truthy in S.log[D]`.
- The first `completed` cells are filled (in chronological order of completion). Missed days do not reset anything and do not shift cells — the next successful day simply fills the next cell. The grid can only fill forward, so it cannot "reset to zero."
- Filled cells: gold/leaf style with a check; empty cells: faint outline. Completed today's cell shows a subtle pulse animation.
- Summary line above the grid: "Day 12 of 40 — at your own pace, no rush." (explicitly anti-anxiety copy).
- Optional: show a small "🤲" on the current cell.

### Data flow

State: `S.journeys[id] = startDate` only. Progress derived from `S.log` on each render. `renderJourneys()` runs in the dynamic render chain, so the grid updates whenever any prayer/deed is toggled.

## Error handling & robustness

- All feature renders are wrapped in the same `try/catch` pattern used by `renderDynamic()`'s `safe()` helper (each feature module's `window.render*` catches its own errors and `console.warn`s).
- `maybeShowMuhasabah` is a no-op (guarded) if the modal element is missing.
- `loadState()` default-fill migrates `muhWeek`/`journeys` for existing users automatically; `journeys` entries referencing journey ids not in `JOURNEYS` are ignored at render.
- No new dependencies (no Chart.js usage; SVG is inline; no external libs).

## Testing & verification

No automated test framework exists in this project (pure vanilla HTML/CSS/JS). Verification plan:

1. Load `index.html` in a browser with a fresh profile; confirm no console errors.
2. **Garden**: seed several days of prayers into `localStorage` (via `S.log`/toggles), verify stage progression Seed → Sprout at XP≥150 and streak≥3, internal scale animation, no regression when a day is skipped (stage stays).
3. **Muhasabah**: on a Friday, verify modal auto-opens once, dismiss sets `muhWeek`, summary numbers match `S.log` hand-counts, suggestion matches lowest-count deed; verify non-Friday opens show no modal; verify Today entry reopens modal.
4. **Journeys**: opt into Fajr journey, toggle Fajr 5 times with gaps, verify cells 1–5 fill in order with no reset; verify `S.journeys` persists across reload; verify complete state at 40.
5. Verify `panel-leaderboard` is gone from the DOM and no broken references (it was never wired to a tab).

## Out of scope

- No leaderboards, social features, sharing, or comparisons (explicitly removed philosophy).
- No changes to Challenges, Trophies, XP, levels, or streak logic.
- No new data collection beyond the two state fields above.
- No backend; everything stays in `localStorage`.
