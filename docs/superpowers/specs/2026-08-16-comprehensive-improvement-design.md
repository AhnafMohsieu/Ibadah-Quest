# Ibadah Quest — Comprehensive Improvement Plan

**Date:** 2026-08-16
**Approach:** Architecture-First (5 phases)
**Status:** Design approved, ready for implementation planning

---

## Summary

Improve the Ibadah Quest codebase across 5 phases: split monolithic modules into focused files, add functional test coverage, fix accessibility gaps, optimize performance, and add URL-based navigation. Each phase builds on the previous — architecture first enables everything else.

---

## Phase 1: Architecture Split

### Goal
Break `core/actions.js` (2,601 lines) and `render/render.js` (1,661 lines) into focused, testable modules without changing any behavior.

### `core/actions.js` → 8 new files + gutted actions.js

| New File | Lines (est.) | Functions |
|----------|-------------|-----------|
| `core/xp.js` | ~120 | `grantDailyXp`, `grantCappedDailyXp`, `checkLevelUp`, `levelUpToast`, `playSound` |
| `core/prayers.js` | ~80 | `toggleP`, `toggleV`, `toggleD`, `recalc` |
| `core/quests.js` | ~100 | `genDQ`, `genWQ`, `genMQ`, `genYQ`, `genLQ`, `checkQ`, `toggleQuest`, `trackQuestXP` |
| `core/achievements.js` | ~30 | `checkA` |
| `core/themes.js` | ~50 | `applyTheme`, `setTheme`, `toggleTheme`, `isValidTheme`, `updateMeta` |
| `core/shop.js` | ~80 | `buy` (mystery-box/purchase logic) |
| `core/dhikr.js` | ~100 | `tapDhikr`, `resetDhikr`, `nextDhikr`, `addCustomDhikr`, `removeCustomDhikr`, `toggleDhikrFavorite`, `checkDhikrBadges`, `updateDhikrStreak` |
| `core/content.js` | ~60 | `refreshContent`, `manualRefreshContent`, `loadScript`, `ensureQuranLoaded`, `ensureHadithLoaded` |

**`data/pools/new-pools.js`** — Extract inline `NEW_POOLS` object (~300 lines) from actions.js.

**`core/actions.js` shrinks to ~100 lines** — glue only: `toast`, `switchUser`, `resetAll`, `claimBonus`, `initApp`, `window.App` exports.

### `render/render.js` → 5 new files

| New File | Lines (est.) | Functions |
|----------|-------------|-----------|
| `render/dynamic.js` | ~80 | `renderDynamic`, `renderToday`, `renderLv`, `renderStr`, `renderTopBar` |
| `render/static.js` | ~100 | `renderStatic`, `renderQuran`, `renderSunnahs`, `renderDhikr`, etc. |
| `render/calendar.js` | ~100 | `gregorianToHijri`, `hijriToGregorian`, calendar rendering |
| `render/prayers.js` | ~150 | `renderPrayers`, `renderVol`, `renderDeeds`, `renderPrayerTimes` |
| `render/tabs.js` | ~80 | `renderTab`, `switchCategory`, tab navigation logic |

### Load Order

```
data/pools/new-pools.js  (new)
state/state.js           (unchanged)
core/xp.js               (new)
core/themes.js           (new)
core/prayers.js          (new)
core/quests.js           (new)
core/achievements.js     (new)
core/shop.js             (new)
core/dhikr.js            (new)
core/content.js          (new)
render/calendar.js       (new)
render/prayers.js        (new)
render/static.js         (new)
render/dynamic.js        (new)
render/tabs.js           (new)
core/actions.js          (gutted — glue only)
```

### Constraints
- Each module is an IIFE exposing to `window` (matching existing pattern)
- No ES modules or bundler — keep `<script>` tag approach
- All existing `window.*` APIs remain identical
- `S` global state and `saveState()` remain in `state/state.js`

---

## Phase 2: Test Coverage

### Goal
Add functional tests for every new module, covering core logic paths currently untested.

### Tests to Add

| Test File | Tests | Coverage |
|-----------|-------|----------|
| `tests/xp.test.js` | 8-10 | `grantDailyXp` (once-per-day, level-up), `grantCappedDailyXp` (cap), `lvFrom`, `xpFor` |
| `tests/prayers.test.js` | 8-10 | `toggleP` (pray/unpray, XP, Friday bonus, streak), `toggleV`, `toggleD` |
| `tests/quests.test.js` | 10-12 | `genDQ`/`genWQ`/`genMQ` (count, dedup), `checkQ` (completion, XP), `toggleQuest` |
| `tests/achievements.test.js` | 6-8 | `checkA` (unlocks, no double-unlock, toast) |
| `tests/themes.test.js` | 6-8 | `setTheme` (valid/invalid, localStorage), `toggleTheme` (cycle), `applyTheme` |
| `tests/shop.test.js` (expand) | 8-10 | `buy` (enough/not enough XP, mystery box, boost/freeze/reroll) |
| `tests/dhikr.test.js` | 8-10 | `tapDhikr` (count, target reset, XP), `addCustomDhikr`, `removeCustomDhikr` |
| `tests/content.test.js` | 6-8 | `refreshContent` (new day, index gen), `manualRefreshContent` |
| `tests/integration.test.js` | 3-4 | Init → pray → XP → level-up (smoke test) |

### Approach
- Use `tests/helpers/load.js` to load state + module under test
- Mock `S` with `freshState()`, exercise functions, assert state changes
- Mock `renderDynamic`/`renderAll`/`toast`/`playSound` as no-ops
- Each test file targets one module

---

## Phase 3: Accessibility

### Goal
WCAG 2.1 AA compliance — keyboard navigable, screen reader friendly, properly labeled.

### Changes

**Icons & Images**
- Add `role="img"` and `aria-label` to all `iqIcon()` calls
- Add `aria-hidden="true"` on decorative icons

**Keyboard Navigation**
- Make `.card-item`, `.vol-card`, `.shop-card` focusable (`tabindex="0"`) and activatable with Enter/Space
- Make FAB container keyboard-navigable with arrow keys
- Add `Escape` to close modals, toasts, FAB menu
- Add `:focus-visible` styles (ring outline) on all interactive elements

**ARIA & Semantics**
- Add `aria-label` to search input
- Add `aria-live="polite"` updates for quest completions, achievements, level-ups, streaks
- Fix tab panels: `role="tabpanel"` + `aria-labelledby`
- Add `role="tablist"` / `role="tab"` / `role="tabpanel"` to tier2/tier3 sub-tabs

**Color & Contrast**
- Increase `--text2` contrast to meet 4.5:1 ratio
- Ensure toast/notification text meets contrast requirements

**Content Selection**
- Remove `user-select: none` from `body` — allow text selection
- Keep `user-select: none` only on buttons/interactive elements

**Motion**
- Verify `prefers-reduced-motion` respected for all animations

---

## Phase 4: Performance

### Goal
Faster initial load, less runtime overhead, smoother interactions.

### Changes

**Remove Tailwind CDN**
- Audit used utility classes (likely very few)
- Replace with hand-written CSS rules
- Delete `<script src="https://cdn.tailwindcss.com">`

**Script Loading**
- Add `defer` to all non-critical scripts
- Keep data files and core synchronous, defer everything after `core/actions.js`

**DOM Updates**
- Batch reads before writes in `renderDynamic()`
- Add "dirty flags" for `renderAll()` — only re-render changed panels
- Avoid `renderAll()` on prayer toggle — `renderDynamic()` handles it

**Content Loading**
- Lazy-load content pools only when tab is first opened

**localStorage**
- Add `compactLogs()` to prune old daily logs beyond 1 year

---

## Phase 5: Navigation / URL Routing

### Goal
Browser back/forward, deep linking, shareable URLs.

### URL Pattern

```
/#/ibadah/today          → Daily > Today
/#/ibadah/quests         → Daily > Quests
/#/knowledge/hadith      → Knowledge > Hadith
/#/library/seerah        → Library > Seerah
/#/names/allah_names     → Names > Allah's Names
/#/profile/stats         → Profile > Stats
```

### Implementation
- On tab switch: `history.pushState({ cat, tab }, '', '#/' + cat + '/' + tab)`
- On `popstate`: read URL hash, activate matching tab
- On page load: parse `location.hash`, activate matching tab
- Existing `App.switchCategory()` / `App.activateTab()` API unchanged

### Fallback
- Unknown hash → fall back to `/#/ibadah/today`
- Empty hash (fresh visit) → default tab

---

## Execution Order

1. **Phase 1** — Architecture split (creates testable modules)
2. **Phase 2** — Tests (validates split code, safety net for phases 3-5)
3. **Phase 3** — Accessibility (readability fixes, ARIA, keyboard)
4. **Phase 4** — Performance (remove Tailwind CDN, optimize DOM)
5. **Phase 5** — Navigation (URL routing, back/forward)

Each phase is independently shippable. If stopped after any phase, the codebase is in a better state than before.
