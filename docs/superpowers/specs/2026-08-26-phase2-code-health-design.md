# Phase 2: Code Health & Architecture — Design Spec

Parent program: `docs/superpowers/specs/2026-08-26-improvement-program-design.md` (Phase 2 of 4).
Baseline: branch `phase1-correctness-data-safety` @ `29addf5` (PR #1 open). Suite: 415 passing.
Goal: make the codebase cheap and safe to change. Zero behavior change except one timezone bug fix (§6).

## Problem (verified against current code 2026-08-26)

1. **XP-grant logic duplicated ~20×.** `core/xp.js` has central `grantDailyXp(amount,key)` / `grantCappedDailyXp(amount,key,cap)` used by only 8 call sites; ~20 other sites raw-mutate `S.xp += …; S.lv = lvFrom(S.xp); checkLevelUp(…); saveState(); render…`. Six of them share a byte-identical tail (`saveState(); markDirty×4/5; renderDynamic()`): toggleP/V/D, toggleQuest, buy, claimBonus. One site (`core/dhikr.js:69`) adds XP without recomputing level, relying on its caller.
2. **Silent facade stubs.** `window.App` contains 17 `() => {}` no-op entries (toggleTafsir, setTafsirEdition, toggleVolCat, toggleDeedCat, switchCategory, activateTab, tapDhikr, resetDhikr, nextDhikr, openSituational, situationalBack, tapSituationalDhikr, toggleSitFav, openExtraDeeds, extraDeedsBack, openVolPrayers, volPrayersBack). Breakage is invisible: calling them does nothing. The existing `appAction(name)` deferred lookup (9 usages) is silent too.
3. **Modal show-trio duplicated 5×.** `ov.innerHTML=…; ov.style.display='flex'; ov.classList.add('show'); ov.style.pointerEvents='auto'` repeated verbatim in features/daily-summary.js, features/daily-ritual.js (which also has its own divergent hide), features/streak-milestones.js (showWeeklySummary), core/actions.js (showRecoveryModal, showUndoImportBar).
4. **Boot modal queue polls the DOM** every 200 ms with a 10 s force-advance (actions.js runModalQueue), feeding exactly those three boot modals.
5. **Weighted-roll algorithm duplicated verbatim**: core/shop.js mystery box vs features/surprise-rewards.js (only weight tables differ).
6. **Date-key formatting re-implemented 6×**, including one real bug: features/streak-milestones.js:32 uses `new Date().toISOString().slice(0,10)` — **UTC-based**, so milestone days flip at 19:00/20:00 local time for UTC+6 users instead of midnight.
7. **escapeHTML near-duplicates:** four guarded-fallback copies delegating when available (features/health.js, personal-goals.js, search.js as `safeText`; render/prayers.js:137) + two raw inline `.replace(/[&<>"']/g…)` sites (render/dynamic.js:292,302).
8. **Test gaps:** analytics/analytics.js + dashboard.js have zero test references; compactLogs() untested; Hijri math never tested via the real render/calendar.js module (seasonal test uses a hand-copied algorithm).

## Goal

Single definitions for each duplicated behavior, all XP mutations routed through one pipeline, invisible breakage made loud, DOM polling removed — with the full test suite as the behavioral safety net.

## Design

### 1. XP pipeline (core/xp.js)

Two new primitives; everything composes them:

```js
function applyXpDelta(delta) {
  var oldLv = S.lv;
  S.xp += delta;
  S.lv = lvFrom(S.xp);
  if (typeof checkLevelUp === 'function') checkLevelUp(oldLv);
  return { oldLv: oldLv, newLv: S.lv, leveledUp: S.lv > oldLv };
}

function saveAndRenderDirty() {
  saveState();
  markDirty('today'); markDirty('topbar'); markDirty('lv'); markDirty('progress');
  renderDynamic();
}
```

- No save/render inside `applyXpDelta` — callers keep their own render semantics.
- `grantDailyXp` / `grantCappedDailyXp` stay API-identical, rebuilt internally on `applyXpDelta`.
- Migration table (all sites → target pattern):
  - toggleP/V/D, toggleQuest, buy, claimBonus → `applyXpDelta(±n)` + `saveAndRenderDirty()` (buy keeps its extra markDirty('rewards')).
  - dhikr tapDhikr (+1/+20/badge+25) → accumulate deltas, one `applyXpDelta(total)` (fixes the :69 latent smell by construction), then its own renders.
  - tapSituationalDhikr, toggleFasting, toggleMorning/Evening, surprise-rewards, streak-milestones, personal-goals, finance ×2, consistency ×3 → `applyXpDelta` + existing custom save/render calls unchanged.
  - health grantMilestoneXp → `applyXpDelta`, callers keep saving.
  - actions.js:582 recompute-only line stays as-is (not a mutation site).

### 2. Fail-loud facade (core/actions.js)

- All 17 silent `() => {}` stubs become `appAction('<name>')` deferred lookups.
- `appAction` gains call-time diagnostics:

```js
function appAction(name) {
  return function() {
    var fn = window[name];
    if (typeof fn !== 'function') { console.warn('[App] ' + name + ' called but feature not loaded'); return undefined; }
    return fn.apply(window, arguments);
  };
}
```

- `toggleAvatarPicker` placeholder toast stays (Phase 4 decides finish-vs-remove).

### 3. Shared modal opener (core/actions.js)

```js
function openToastModal(html) {
  var ov = document.getElementById('toastOverlay');
  if (!ov) return null;
  window._modalTriggerEl = document.activeElement;
  ov.innerHTML = html;
  ov.style.display = 'flex';
  ov.classList.add('show');
  ov.style.pointerEvents = 'auto';
  return ov;
}
```

Migrate five sites: daily-summary, daily-ritual, weekly-summary (streak-milestones), showRecoveryModal, showUndoImportBar. daily-ritual's private hide implementation is replaced by the shared `closeToastOverlay()` path like its siblings.

### 4. Modal queue without polling (core/actions.js)

- Each boot modal (`showWeeklySummary`, `showDailySummary`, `showDailyRitual`) accepts an optional `onDone` callback invoked when its overlay closes.
- `closeToastOverlay()` invokes `window._iqModalDone` (set by the queue before each show) once, then clears it.
- Queue becomes sequential callbacks; 10 s force-advance timer retained as safety net; 200 ms interval deleted.

### 5. Weighted roll (new core/random.js)

```js
function weightedPick(pool) {
  var total = 0;
  for (var i = 0; i < pool.length; i++) total += pool[i].weight;
  var roll = Math.random() * total;
  for (var j = 0; j < pool.length; j++) { roll -= pool[j].weight; if (roll <= 0) return pool[j]; }
  return pool[pool.length - 1];
}
window.weightedPick = weightedPick;
```

core/shop.js and features/surprise-rewards.js keep their own weight tables and reward handling; the selection loop comes from here. Script tag inserted before core/shop.js in index.html.

### 6. Date keys (bug fix included)

- Canonical stays `today(d)` in state/state.js (exported already). Add exported `yesterdayKey()`:
  `function yesterdayKey(){ var d=new Date(); d.setDate(d.getDate()-1); return today(d); }`
- Migrate onto canonical: journeys.js walk-back loop, muhasabah.js fmt(), finance.js builder, widgets/streak-calendar.js builder, core/dhikr.js yesterdayStr.
- **Bug fix:** streak-milestones.js:32 switches from `toISOString().slice(0,10)` (UTC) to `today()` (local). Regression test pins a UTC+6 scenario: at 02:00 local on the 15th, the key must be the 15th (toISOString would say the 14th).
- render/prayers.js DD-MM-YYYY display string untouched (presentation, not a key).

### 7. escapeHTML consolidation

- Four guarded fallbacks (health/personal-goals/search safeText, render/prayers.js:137) → direct `escapeHTML(...)` calls (canonical is on window before any defer script runs).
- Two raw inline regexes (dynamic.js:292 avatar, :302 profile name) → `escapeHTML(...)`.
- Test harnesses that load these files standalone inject `escapeHTML` into the sandbox (update affected tests' loadFile overrides).

### 8. Test-gap closures

- tests/analytics-core.test.js: stats functions from analytics/analytics.js (pure computations) — feed fixtures, assert outputs.
- tests/dashboard.test.js: dashboard.js pure helpers.
- tests/compact-logs.test.js: compactLogs pruning (>400-day trigger, perfect-day archival, recent retention).
- tests/hijri.test.js: round-trip gregorianToHijri ∘ hijriToGregorian ≈ identity across sample years using the REAL render/calendar.js module; seasonal.test.js's hand-copied inverse may optionally switch to importing this module.
- tests/streak-milestones timezone regression (§6).

## Constraints

- Zero behavior change except §6 timezone correctness (and console.warn additions from §2, which fire only when something is genuinely broken).
- Full suite green after every task; new tests bring expected total ≥ 440.
- Cache-bump discipline for touched assets (?v= increments + CACHE_NAME + pinned-test updates).
- Commits authorized per-task (same ruling as Phase 1 execution); never stage data/hadith-collections.js or opencode.json.
- Branch: `phase2-code-health` stacked on phase1-correctness-data-safety HEAD (PR #1 not yet merged).

## Risks

| Risk | Mitigation |
|---|---|
| XP migration touches ~12 files | Pure-mechanical per-site diffs; suite + per-site render assertions unchanged; migration table above reviewed task-by-task |
| Facade stubs → appAction changes timing | appAction defers lookup to call time (strictly safer than build-time capture); registry completeness test extended to assert no `() => {}` remains |
| Modal queue rework alters boot UX | Manual smoke: three modals still appear sequentially once per day; 10 s safety net retained |
| escapeHTML direct calls break standalone test loads | Harness injection listed explicitly in §7 |

## Not In Scope (deferred)

- Boot double-render elimination → Phase 3 (now load-bearing for consistency checks + seasonal sync; Phase 3's lazy-panel redesign supersedes it)
- render/dynamic.js & actions.js file splitting; main.css organization
- Avatar picker finish-or-remove (Phase 4)
- i18n seam extraction (Phase 4 prerequisite, lands inside Phase 4's own spec)
