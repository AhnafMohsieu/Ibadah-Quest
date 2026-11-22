# Feel & Feedback (SP2) — Design

**Date:** 2026-10-16
**Status:** Pending review
**Cycle:** SP2 of 3 (SP1 mobile comfort polish — shipped; SP3 install & reminders — later)
**Verification standard:** behavior probes + SP1 audit-harness regression re-run (SP1 discipline)

---

## 1. Why — findings from code (evidence)

| # | Finding | Evidence |
|---|---------|----------|
| F1 | **`.app` is the only scroller** (`height:100dvh; overflow-y:auto`). The window never scrolls. | `styles/main.css:112-124` (base), `:3134` |
| F2 | **`.top-bar` is sticky** at `top:0`, z-index 100. The tier nav is **not** sticky. | `styles/main.css:128-141`, `index.html:169` |
| F3 | **FAB scroll-close is doubly dead**: `init()` is never invoked (actions.js calls `window.initFAB` synchronously at parse, before defer scripts load — `features/fab.js:88-92` documents this), and the listener it would bind watches `window` scroll, not `.app`. | `core/actions.js:628`, `features/fab.js:40-49, 88-92` |
| F4 | **The FAB's keydown handlers (Escape/arrows/Tab) are dormant too** — they live in the same never-run `init()`. | `features/fab.js:51-80` |
| F5 | **Pull-refresh has never been bound** (`window.initPullRefresh` same defer-timing no-op), and its arm condition `window.scrollY === 0` is always true — it arms even mid-page. | `core/actions.js:629`, `features/pull-refresh.js:12-26` |
| F6 | **No scroll reset on category/group switch** anywhere — via bottom nav you land mid-panel of the new section. | `core/tabs.js` (no `scrollTop`), `:48-112` |
| F7 | **Haptics exist only in dhikr**, gated by `S.dhikrSettings.haptic` (default `true`, toggle "Vibration On/Off" in the dhikr panel). | `core/dhikr.js:36,42`, `core/state.js:51-52`, `core/static.js:284` |
| F8 | **Press feedback exists and is already smooth** (scale + transitions on cards/chips/bnav). Gaps: `.goal-btn`, `.drill-back`, `.ds-close`, `.add-goal-btn`, `.dhikr-tap-btn` have `:active` without transitions; `.fab-action`/`.fab-main` have no press scale. | `styles/main.css:3299-3312`, `:1529, 1686, 2499, 2518, 2533, 1372` |
| F9 | **Reduced-motion is already globally respected** (all animations/transitions clamped). New CSS needs no extra handling. | `styles/main.css:2686-2689` |
| F10 | **Swipe precedent exists** (carousel, 50px threshold). No section swipe. Bottom-nav order: `ibadah, knowledge, names_main, library, profile_main`. | `features/daily-content.js:67-79`, `index.html:566-571` |
| F11 | **Phone chips wrap + centered with a 64px FAB gutter**; base CSS already supports nowrap overflow scroll. | `styles/main.css:2727-2740, 2763-2791` vs `:350-352, 2742-2744` |
| F12 | **MPA track (src/**) does not load fab.js / pull-refresh.js** (pools grep: no matches). JS changes are legacy-only; `styles/main.css` is shared, so compact rules are scoped `.nav-compact` to avoid MPA impact. | session evidence |

**Root cause common to F3/F5:** `core/actions.js` runs `init()` synchronously during parse (`actions.js:746-756`, non-defer at `index.html:525`), while `features/*` are `defer` — every `window.initXxx()` call in `finishInit()` (`actions.js:624-644`) silently no-ops for feature scripts. Feature modules that need init must self-init at module load (the pattern `fab.js` already uses for `populateFABIcons`).

---

## 2. Scope

**In (user-approved 2026-10-16):**
1. FAB scroll-close + pull-refresh fixes (dormant-init resurrection + real scroller)
2. Sticky auto-collapse nav (the 285px chrome reclaim)
3. Haptics on key actions
4. Press & motion polish
5. Swipe between the 5 sections

**Out (explicitly):**
- Notifications/install prompt/reminder cadence → SP3
- `core/dynamic.js:211` `window.scrollTo(0, pageScroll)` no-op (same bug family, zero user-visible effect today — documented, untouched)
- `core/dhikr.js` haptics stay inline (identical gate/pattern; zero-risk)
- MPA pages (`src/**`) — they get shared-CSS benefits only
- Any new persisted state field (see D6)

---

## 3. Decisions

- **D1 — Scroller resolution:** each module resolves `document.querySelector('.app') || document.scrollingElement` lazily (no new shared file/load-order dependency). Used by fab.js, pull-refresh.js, nav-collapse.js.
- **D2 — Feature self-init:** fab.js, pull-refresh.js and both new modules call their `init()` at module load behind an idempotence flag (`if (init._done) return; init._done = true;`). Exports (`window.initFAB`, `window.initPullRefresh`) stay for contract compatibility; `actions.js` is untouched (its calls remain harmless no-ops). *(Rejected: extending `postDeferHook` in actions.js — keeps init far from module, needs actions.js touch + bump.)*
- **D3 — FAB behavior (unchanged semantics, now live):** close speed-dial when the scroller scrolls **down** past 100px; Escape/arrow/Tab handlers activate as designed. Verified by probes (they've never run in production).
- **D4 — Compact nav via sticky + class** *(rejected: `position:fixed` clone — layout jump; collapse-only without sticky — loses mid-page nav access):* `.tier-nav-container` becomes `position:sticky; top:var(--topbar-h, 56px); z-index:90` under a phone/coarse media guard; a rAF-throttled scroll handler toggles `.nav-compact` with hysteresis when the container engages the top bar. `--topbar-h` is JS-measured (safe-area + content height) on load/resize/orientationchange.
- **D5 — Scroll reset on switch:** `switchCategory` and `selectCategory` set scroller `scrollTop = 0` (instant, guarded for sandboxes). Makes every section/group change open from the top (fixes F6) and makes compact-nav chip taps coherent (reset → unstick → auto-expand).
- **D6 — Haptics reuse the existing gate** *(rejected: new `settings.haptics` field + new UI — schema churn for no gain; always-on — removes user control):* new `window.iqHaptic(pattern = 10)` in `core/xp.js` (beside `playSound` — the feedback module; `core/helpers.js` is **not script-tagged in index.html**, discovered during plan recon), reading the global `S` **at call time**, `try/catch`, requires `navigator.vibrate`. Gate stays `S.dhikrSettings.haptic` (default on; the "Vibration" toggle now governs all haptics — label kept). iOS Safari no-op.
- **D7 — Swipe reads its section list from the DOM** *(rejected: hardcoded id list — drift risk):* `document.querySelectorAll('.bnav-btn')` is the single source of truth; dispatch uses `App.switchCategory(cat, btn)` — byte-identical path to a bottom-nav tap (including D5 reset). Clamped at ends (no wrap).
- **D8 — Motion polish:** extend the existing transition block to the F8 gap selectors; add missing `:active` scales; stage the FAB speed-dial appear. No new reduced-motion code (F9).

---

## 4. Per-item design

### 4.1 FAB + pull-refresh resurrection (`features/fab.js`, `features/pull-refresh.js`)

**fab.js**
- `init()`: guard `init._done`; bind scroll listener to the resolved scroller (`D1`) instead of `window`; keep close-on-downward-scroll >100 semantics (`D3`).
- Call `init()` at module load (next to the existing `populateFABIcons()` call at the bottom); `populateFABIcons` call and its pin test (`tests/app-registry.test.js:137`) both stay.
- Optional small addition with the resurrected keyboard path: none needed — handlers exist.

**pull-refresh.js**
- `init()`: guard `init._done`; resolve scroller (`D1`); replace both `window.scrollY === 0` checks (`:13, :19`) with `scroller.scrollTop <= 0`.
- Call `init()` at module load. Keep the `'ontouchstart' in window` guard (touch-only feature) and the threshold/release logic unchanged.
- index.html: add a cache-bust to its script tag (currently none) → `?v=1`.

### 4.2 Sticky compact nav (`features/nav-collapse.js` (new), `styles/main.css`, `index.html`)

**Markup:** no changes — targets `.tier-nav-container`, `#tier2Tabs`, `#tier3Wrap`, `#dateLine`, `#topBar` as they exist (`index.html:112, 169-180`).

**CSS** (new block, scoped; media-guarded `@media (max-width: 767px), (pointer: coarse)` — mirrors existing shell patterns):
- `:root { --topbar-h: 56px }` fallback + `.tier-nav-container { position: sticky; top: var(--topbar-h); z-index: 90; }`
- Collapsed sub-rows (animatable, not `display:none`): `.nav-compact #dateLine, .nav-compact #tier3Wrap { max-height: 0; opacity: 0; overflow: hidden; margin/padding: 0; }` with `transition: max-height .18s ease, opacity .12s ease` (base rules get generous `max-height` + `overflow:hidden` only while transitioning via the compact class pair; details in plan).
- `.nav-compact #tier2Tabs { flex-wrap: nowrap; overflow-x: auto; justify-content: flex-start; padding-right: 8px; scroll-snap-type: x proximity; }` — reclaims the 64px FAB gutter (FAB lives bottom-right; a top-pinned bar needs no gutter) and turns the wrapped chip grid back into the designed one-row scroll rail (`main.css:351, 2742`).
- Compact chrome: square top corners, rounded bottom, `box-shadow` for separation while pinned.
- Reduced-motion: covered by F9.

**JS (`features/nav-collapse.js`, self-init, coarse/phone guard — no-op elsewhere):**
- Measure `#topBar.offsetHeight` → set `--topbar-h`; re-measure on `resize`/`orientationchange`.
- rAF-throttled scroll listener on scroller: **enter** compact when `navRect.top <= topBarRect.bottom + 2`; **leave** when `navRect.top >= topBarRect.bottom + 10` (hysteresis). Enter → add `.nav-compact` + `activeChip.scrollIntoView({ block: 'nearest', inline: 'center' })`.
- Delegated `click` on the container while compact → `scroller.scrollTop = 0` (covers `t2-btn` `activateTab` swaps that D5 doesn't reset; chip/category paths get the same value — idempotent).
- Initial state check on load (deep-link restore boots at top — fine).

**Choreography:** enter fires when sticky pins; the collapse itself is height-animated (max-height transition) so panel content below rises ~230px smoothly instead of jumping. Leave fires on unstick with hysteresis; expansion animates while scrolling back up. Thresholds (+2/+10) and timing are first-draft values — tuned live during probes (risk 7).

**Contingency (probe-verified):** sticky descendants under `overflow-x: clip` ancestors (`main.css:2775`) must be validated live; if a browser breaks stickiness, fallback = drop to collapse-free (keep nav non-sticky) and re-scope, or relocate the clip rule — decided at verification, recorded in the plan.

### 4.3 Scroll reset on switch (`core/tabs.js`)

- End of `switchCategory` and `selectCategory`: `var sc = document.querySelector('.app'); if (sc) sc.scrollTop = 0;` (guard keeps vm-sandbox tests green).
- Scope note: `activateTab` (tier-3) intentionally keeps position; compact-nav clicks handle that case (4.2 delegation).

### 4.4 Haptics (`core/xp.js` + call sites)

**Contract:** `window.iqHaptic(pattern = 10)` — no throw ever; no-op when S missing, `S.dhikrSettings.haptic` falsy, or `!navigator.vibrate`.

| Site | Event | Pattern |
|------|-------|---------|
| `core/prayers.js` `toggleP`/`toggleV`/`toggleD` (log path) | prayer/voluntary/deed logged | 10ms |
| `core/quests.js` `toggleQuest` (`q.done` path) | quest completed | 10ms |
| `core/static.js` `toggleFasting` (`:317`) and the two other `playSound('pop')` sites (`:369`, `:404` — confirm function names at build) | fasting / quran trackers | 10ms |
| `core/xp.js` `grantDailyXp`/`grantCappedDailyXp` | daily reward granted | 10ms |
| `core/xp.js` `levelUpToast` | level up | `[30,50,30]` |
| `features/fab.js` `toggle()` (open only) | speed-dial open | 6ms |

Placement rule: haptic sits next to the existing `playSound('pop')`/chime on the **positive** path only (un-logging stays silent). All calls guarded by `typeof window.iqHaptic === 'function'` for legacy test sandboxes.

### 4.5 Swipe between sections (`features/swipe-nav.js` (new))

- Touch-only (`(pointer: coarse)` guard), passive listeners on `#mainContent`: record `startX/startY` + start target on `touchstart` (single touch), resolve on `touchend`.
- **Ignore** when: start target closest-matches `#dailyCarousel, .tier-nav-container, .pull-refresh-indicator, input, textarea, select` → `return`; start within 28px of either screen edge (iOS back/forward gesture zones); `|dx| < 60`; `|dx| < 1.5·|dy|` (dominant-horizontal only).
- Map: index of `.bnav-btn.active` in DOM order → `idx ± 1` (clamped) → `window.App.switchCategory(cat, btn)`.
- Pure helper `window._swipeDir(startX, dx, dy, viewportW)` (edge/direction math) exposed for unit tests; DOM glue stays thin.
- No animation on switch (parity with bottom-nav tap; content swap + D5 reset).

### 4.6 Press & motion polish (`styles/main.css`)

- Extend selector list at `:3299-3304` with `.goal-btn, .drill-back, .ds-close, .add-goal-btn, .dhikr-tap-btn, .fab-action` (same transition tuple).
- Add `:active` scale: `.fab-action:active { transform: scale(0.96); }`, `.fab-main:active { transform: scale(0.94); }`.
- FAB speed-dial cascade: `.fab-actions.fab-show .fab-action` staged `transition-delay` (4 steps × 30ms, nearest-to-button first; verify visual order against `column-reverse` at build).

---

## 5. Testing strategy

**Pins (`tests/html.test.js` + new unit tests):**
- `features/nav-collapse.js` + `features/swipe-nav.js` script tags exist in index.html (`defer`, versioned).
- fab.js: self-init call present + scroller-resolved listener (no bare `window.addEventListener('scroll')` for the close path).
- pull-refresh.js: no `window.scrollY` arm checks; `scrollTop` present.
- tabs.js: `scrollTop` reset in both switch functions.
- xp.js: `window.iqHaptic` defined next to `playSound` with the `dhikrSettings.haptic` gate.
- prayers/quests/xp/static: `iqHaptic(` present at the listed sites.
- CSS: `.nav-compact` rules + media guard exist.
- New `tests/haptics.test.js` (vm sandbox): enabled → vibrates with pattern; disabled → silent; missing `navigator` / missing `S` → no throw.
- New swipe unit tests: `_swipeDir` edge guards + direction ratio cases.
- `tests/app-registry.test.js:137` must still pass (populateFABIcons pin).

**Behavior probes (Playwright, live app, temp harness):**
1. FAB open → scroll `.app` down → speed-dial closes (+ keyboard: Escape closes, arrows move focus).
2. Pull-refresh: scrolled deep → synthetic pull → indicator stays hidden; at true top → indicator appears.
3. Compact nav: scroll deep → nav pinned at top-bar bottom (±2px), `#tier3Wrap` collapsed, `#tier2Tabs` nowrap, active chip in view; scroll back → expanded at natural position; compact chip tap → scroll resets + nav expands.
4. Swipe: left/right on panel switches to next/prev section; inside carousel → no switch; edge-start → no switch; at first/last → clamped.
5. Category switch from deep scroll → lands at top of new section.
6. Haptics: `navigator.vibrate` instrumented via init script → log prayer → `[10]` captured; toggle dhikr "Vibration" off → silences.
7. Reduced-motion: emulated `prefers-reduced-motion` → transitions clamped (regression, no new code expected).

**Regression:** full SP1 audit harness re-run (`iq-mobile-audit.py`, label `sp2`) — `fab_overlap`, probe set, card geometry, `tab_errors`, overflow scan at parity (compact nav is inactive at scrollTop 0, so SP1 geometry must not move).

**Repo gates:** `node --test` all pass (551 + new), `node --check` on touched classic files, `node core/check-syntax.js` for src (unaffected).

---

## 6. Cache & version discipline

| File | Change | Action |
|------|--------|--------|
| `index.html` | script tag (pull-refresh `?v=1`), 2 new tags, bumps | bumps below |
| `styles/main.css` `?v=43` | compact + polish CSS | → 44 |
| `core/prayers.js` `?v=3` | haptics | → 4 |
| `core/quests.js` `?v=4` | haptics | → 5 |
| `core/xp.js` `?v=2` | iqHaptic helper + call sites | → 3 |
| `core/static.js` `?v=8` | haptics | → 9 |
| `core/tabs.js` `?v=11` | scroll reset | → 12 |
| `features/fab.js` `?v=2` | scroller + self-init + haptic | → 3 |
| `features/pull-refresh.js` (none) | scroller + self-init | → `?v=1` |
| `features/nav-collapse.js` (new) | — | tag `?v=1` |
| `features/swipe-nav.js` (new) | — | tag `?v=1` |
| `core/precache-manifest.js` | interim hand-written list; features aren't listed | no entry changes needed; `index.html` is precached → MANIFEST_REV bump covers refresh |
| `sw.js` | precache changed | `MANIFEST_REV 9 → 10`; index.html `sw.js?v` 56 → 57 |

Untouched (deliberate): `core/actions.js` (self-init pattern), `core/dhikr.js`, `core/dynamic.js`, `core/helpers.js` (not script-tagged in index.html).

**Note:** SP1's external harness + storage state were in a temp dir that has since been purged. SP2 writes a fresh probe script (same temp location) with its own bootstrap (`localStorage 'iq_intro_seen'` init), covering the SP2 probes plus the still-relevant SP1 regressions (FAB overlap, equal cards, zero page errors).

---

## 7. Risks & open items

1. **Sticky under `overflow-x: clip` ancestors** → live probe; documented fallback (4.2).
2. **Self-init double-binding** → idempotence flags + pin tests.
3. **Swipe false positives** (vertical scrolls misread as horizontal) → 1.5× ratio + 60px floor + edge guards + exclusions; tune constants after probe run if needed.
4. **FAB keyboard handlers become live for the first time** → probe Escape/arrows for regressions (they were designed, not tested).
5. **Vibration toggle is discovered inside dhikr but now governs global haptics** → accepted; label unchanged; noted here so it's a known trade-off, not a surprise.
6. **`scrollIntoView` in compact enter** must not scroll the page vertically → `block:'nearest'` + probe assertion that page scroll doesn't move.
7. **Collapse choreography** (content shift while scrolling into/out of compact) → height-animated collapse + live threshold tuning during probes; if still jumpy, fallback = trigger compact slightly before pin engages. Probe: no visible content jump over a scripted scroll sweep (screenshot at 3 offsets).

## 8. Verification (evidence standard)

- Pins written first → RED → implementation → GREEN (`node --test`).
- Probe JSON + screenshots saved next to SP1 artifacts (`iq-audit-sp2.json` + shots).
- Final report mirrors SP1: what changed, probe numbers, harness deltas, version table, known trade-offs.
