# App Improvement Program — Design Spec

## Problem

A full-codebase audit (2026-08-26) found the app feature-rich and well-tested (358 tests passing) but carrying confirmed bugs, data-safety gaps, systemic duplication, performance debt, and dormant features:

**Confirmed real bugs**
1. ~~Tab persistence dead~~ **DISPROVEN during planning (2026-08-26):** `state/state.js`
   loads as a classic script, so top-level `var S = null` creates `window.S`, and
   actions' bare `S = ...` assignments update it. The `window.S` gates in
   `render/tabs.js` work. Behavior is now pinned by `tests/tabs-persistence.test.js`
   so a future wrapper refactor cannot silently break it.
2. **Duplicate DOM id `heartArea`** (`index.html:190` panel-heart and `index.html:340` panel-growth). `getElementById` returns the first match, so the Heart Refinement growth widget renders into the wrong panel.
3. **Seasonal events can never activate.** `activateSeason()` exists in `features/seasonal-events.js` but no date logic invokes it, and `S.seasonal` is not in `freshState()` — seasons only start if someone calls it from the console.
4. **Ghost setting `dhikrSettings.haptic`.** Read in `core/dhikr.js:37,43`, written nowhere; not in `freshState()`. Only tests fabricate it.
5. **Split "last active" fields.** `lad` (in `freshState()`, used by boot logic) vs `lastActiveDate` (orphan, used by `features/consistency-bonuses.js`). Comeback bonuses run off the orphan field.

**Data-safety gaps**
- Corrupt save = silent total loss: `loadLocalState()` returns null on parse failure and `loadState()` immediately overwrites the raw value with fresh defaults (`state/state.js:80–91`). One bad byte erases months of history.
- Quota errors on save are `console.warn`'d only (`state.js:122–124`); the user never learns saves are failing.
- Backup export drops `iqTheme` and `iq_zakat_inputs`; import accepts arbitrary JSON with no schema validation and no pre-import snapshot.
- At least 18 state fields are created ad-hoc outside `freshState()` (violating AGENTS.md rule #2): `personalGoals`, `seasonal`, `xpDaily`, `combos`, `milestones`, `achievementShowcase`, `dailyRatings`, `dailyReflections`, `lastDailyRitual`, `lastDailySummary`, `lastWeeklySummary`, `lastWeeklyConsistency`, `healthXpClaimed`, `ownedTitles`, `activeTitle`, `ownedFrames`, `activeFrame`, `lastAllPrayersSurprise` — none get backfilled for existing users.
- Unbounded state growth: `dhikrSessions` appends one object per tap forever; `xpDaily` accumulates one key per XP-granting action per day forever; nothing prunes either (quota exhaustion is itself a data-loss vector).
- Divergent duplicate panel maps: `getSectionPanels()` (`render/tabs.js:93–113`) vs inline `panelLookup` in `activateTab` (`tabs.js:125`) encode overlapping-but-different mappings (e.g., `knowledge_quran`: 4 panels vs 2). High drift risk.
- `TAB_GROUPS.profile_main` doesn't exist in data — fabricated at runtime (`core/actions.js:387–393`), mutated later by `features/spiritual-growth/index.js:80–82`; works only via defer-ordering accident.

**Systemic weaknesses**
- Duplication: `escapeHTML` re-implemented ~6×; mystery-box weighted roll duplicated verbatim in `core/shop.js` + `features/surprise-rewards.js`; three near-identical summary modals; grant-XP→level-check→save→double-render sequence copy-pasted in ≥10 places; date-key formatting re-implemented in 4+ features instead of reusing `today(d)`.
- Performance: `renderStatic()` fires ~110 renderers on every boot including hidden panels; morning/evening checkbox taps call full `renderAll()`; Quran search rebuilds its whole list per keystroke (no debounce); `preloadRemoteCollections()` downloads six CDN files on every page load; prayer-timer interval leaks after navigation.
- PWA: service worker install does nothing (no precache list); offline navigation failure returns bare `Response.error()` (no fallback page); cross-origin CDN assets (fonts, Chart.js) uncached so analytics fail offline.
- Boot double-render: `finishInit()` re-runs `renderAll()` on DOMContentLoaded purely to paper over load-order fragility (`core/actions.js:472–480`).
- Modal queue polls the DOM on a 200 ms interval (`actions.js:412–430`).
- Silent no-op stubs in the `window.App` facade make breakage invisible (`actions.js:506–530`).
- Untested areas: `analytics/analytics.js` + `dashboard.js`, boot orchestration, export/import round-trip, `compactLogs()`, corruption/quota paths, Hijri calendar math.
- Dormant/half-built: avatar picker stub ("coming soon"), widgets declared in manifest without end-to-end verification, no deep links to individual content items, no i18n (hundreds of hardcoded English strings, no RTL layout), un-toggle actions silently deduct XP with no undo, reset-all uses native `confirm()`.

## Goal

Run a phased improvement program that (1) fixes every confirmed bug, (2) makes user-data loss structurally impossible, (3) pays down architecture/duplication debt, (4) improves boot/render/offline performance, and (5) ships new user-facing capabilities — while the app holds **real daily worship data that must never be lost or corrupted**.

## Program Structure

Four sequential phases, safety-first ordering. This document is the **program-level design**: Phase 1 is specified here in implementable detail; Phases 2–4 each get their own detailed spec → plan cycle just-in-time, informed by what earlier phases changed.

| Phase | Focus | Spec |
|---|---|---|
| 1 | Correctness & Data Safety | Detailed below |
| 2 | Code Health & Architecture | Own spec when Phase 1 lands |
| 3 | Performance & PWA Quality | Own spec when Phase 2 lands |
| 4 | New Features | Own spec when Phase 3 lands |

## Guiding Doctrine (all phases)

1. **Never destroy user data.** Every risky operation snapshots first. Corrupt ≠ deleted. Migrations are non-destructive.
2. **Every bugfix ships with a regression test** covering the path that let the bug through.
3. **`node --test` green between phases and between meaningful steps.**
4. **Respect repo contracts:** new state fields go in `freshState()` (AGENTS.md #2), script load order preserved, cache bumps follow `?v=` / `CACHE_NAME` / test-pin discipline.
5. **Behavior may change where current behavior is clearly broken or half-finished** (user-approved).

---

## Phase 1 — Correctness & Data Safety (implementable now)

### 1a. Bug fixes

| Bug | Fix design |
|---|---|
| ~~Dead tab persistence~~ (disproven) | No code change. Regression-pinned by `tests/tabs-persistence.test.js`. |
| Duplicate `heartArea` id | Rename the growth-panel instance to a unique id and update references. Add an index.html structural test asserting all `id=` attributes are unique (catches this class permanently). |
| Seasonal activation dead | Add `seasonal` to `freshState()`; wire date-driven activation into boot (`initApp`) plus a midnight/date-rollover check alongside existing daily-rollover handling. Seasons auto-activate by date range; manual console override stays available. Tests: date-range activation, no double-activation, rollover. |
| Ghost haptic setting | Implement it properly: `dhikrSettings` added to `freshState()` with `haptic: true`; settings UI toggle; `navigator.vibrate` fired on dhikr target completion when enabled. |
| `lad` split | Consolidate on the `freshState()` field; `normalizeState` migrates any `lastActiveDate` value into `lad` and deletes the orphan key. Consistency-bonuses reads `lad`. |
| Runtime-fabricated tab group | Move `profile_main` definition into `data/tab-groups.js` verbatim; delete fabrication code; spiritual-growth mutation keeps working against the data-declared group. Test asserts the group exists in data. |
| Divergent panel maps | Single source of truth: `getSectionPanels()` becomes the only mapping; `activateTab` consumes it. Structural test asserts both code paths resolve identical panel sets for every section. |

### 1b. Data-safety core

**Corruption quarantine & recovery.** On JSON.parse failure (localStorage or IDB load path):
1. Copy the corrupt raw payload to `iq9_quarantine_<ISO timestamp>` keys in BOTH localStorage and IDB before anything else.
2. Surface a Recovery modal (reuses existing modal infrastructure): shows what happened, offers three actions — (a) attempt salvage parse of quarantine payload (extract recoverable sub-objects into a fresh state), (b) import backup file, (c) start fresh (explicitly labeled destructive, requires typed confirmation per Phase-4 convention early-adopted here).
3. Fresh-default state is created ONLY after the user chooses (a)/(b)/(c) — never automatically.

Tests: corrupt-string load quarantines and does not overwrite; recovery modal actions each produce expected state; salvage of partially-corrupt JSON recovers intact top-level fields.

**Save hardening.** `saveState()` distinguishes quota errors: first failure shows a persistent dismiss-once banner ("Storage full — export a backup") and logs state size telemetry to console; subsequent failures stay silent until dismissed banner re-arms. IndexedDB remains authoritative; localStorage write becomes best-effort (failure logged, not fatal). Telemetry helper exposed for Phase 3 storage-diet measurement.

**Backup v2.1.** Export format gains: `iqTheme`, `iq_zakat_inputs`, `exportedAt` ISO stamp, `appVersion`, `schemaVersion`, `checksum` (simple hash over serialized payload). Import: validate required keys and checksum before writing anything; snapshot current state to an auto-backup key first (one-click rollback offered post-import); reject invalid payloads with a specific error message, writing nothing.

Tests: full round-trip incl. previously-dropped keys; tampered payload rejected; failed import leaves state untouched; rollback restores snapshot.

**Schema contract restoration.** All 18 ad-hoc fields move into `freshState()` with sensible defaults; `normalizeState` backfills them for existing users (existing backfill pattern). `seasonal` and `dhikrSettings` covered above; the remaining 16 are mechanical. Test: `normalizeState(freshState-minus-fields)` produces complete state; no feature lazily creates a missing top-level field afterward (grep-guard test optional).

### 1c. Explicitly deferred from Phase 1

- Unbounded-growth pruning/aggregation → Phase 3 (measure with P1 telemetry first). Quota *telemetry* lands here because quota exhaustion is a live loss vector.
- i18n of recovery/banner strings → English-only in P1; strings routed through future `t()` seam where trivial.

### 1d. Success criteria

- ~+30 tests: regression test per bug, corruption/quarantine drill, backup round-trip incl. v2.1 keys, import validation/rejection, backfill completeness, seasonal activation, tab persistence.
- Full suite green; syntax-check clean on touched files.
- Manual drill on real data profile: simulate corruption → quarantine → salvage recovers history intact.
- Cache-version discipline applied if index.html/sw assets change.

---

## Phase 2 — Code Health & Architecture (roadmap)

Goal: make change cheap and safe; zero behavior change.

- **Dedupe:** canonical `escapeHTML` exported from `render/static.js`, private copies deleted (personal-goals, search, health, render/prayers, renderProfile inline); central XP-grant pipeline (grant → dedupe-key check → level check → save → dirty-mark) replacing ≥10 copy-pasted sequences; shared modal builder for daily-summary/daily-ritual/weekly-summary/milestone family; shared weighted-roll util for shop/surprise-rewards; date-key helpers reuse `today(d)`.
- **Load-order hardening:** eliminate boot double-render (deferred features register before single render pass, or render once after deferred scripts execute).
- **Fail loud:** dev-flag mode turns `window.App` no-op stubs into console errors; registry completeness test extended.
- **Modal queue:** promise/callback-based instead of 200 ms DOM polling.
- **Test gaps closed:** boot orchestration smoke test; analytics stats functions; `compactLogs()` pruning behavior; export/import (covered in P1, kept green).

Success criteria: duplication greps return single definitions; double-render gone; suite green with no behavioral diffs (manual spot-check).

## Phase 3 — Performance & PWA Quality (roadmap)

Goal: faster boot, bounded storage, trustworthy offline.

- **Boot cost:** lazy-render hidden panels on first activation (~110-renderer storm → visible panels only); targeted re-renders replace `renderAll()` on checkbox toggles; debounce Quran search (match global search's 200 ms).
- **Storage diet (measured):** using P1 size telemetry — aggregate `dhikrSessions` tap entries into per-day totals beyond N days (keep aggregates + recent detail); compact `xpDaily` into daily summaries after M days. Migration preserves all derived stats; raw-detail archive included in exports.
- **Service worker:** precache core shell asset list at install; dedicated offline fallback page for failed navigations; runtime caching (stale-while-revalidate) for cross-origin fonts and Chart.js; replace every-load 6-collection preload with fetch-on-first-open of Hadith library tab.
- **Cleanup:** prayer-timer interval released on tab change.

Success criteria: measured boot render-count/time reduction; state size plateau demonstrated; airplane-mode smoke pass (app shell + core tracking work offline, graceful analytics degradation).

## Phase 4 — New Features (roadmap)

Each item is sized and sequenced during Phase 4's own spec cycle, informed by which groundwork Phases 2–3 actually laid.

- **i18n / Arabic RTL UI:** string table + `t()` helper (seam prepared in Phase 2's renderer cleanup); RTL layout via document direction switch + logical CSS properties audit across styles.css; Arabic translation of chrome/UI strings (scriptural content stays bilingual as-is). Largest single item; likely split into sub-specs.
- **Deep links & widgets:** hash routes to individual content items (`#/quran/<surah>/<ayah>`, hadith, dhikr cards) with share/copy support; widget data providers verified end-to-end against manifest templates.
- **Notifications upgrade:** proper permission-request flow tied to user intent; prayer-time alerts from cached Aladhan times; reliable streak-at-risk scheduling; notification settings UI.
- **Polish picks (my call):** undo toast for XP-deducting un-toggles; typed confirmation for reset-all; finish or remove avatar-picker stub; non-color cues for calendar day states (a11y); canvas chart text alternatives.

## Verification Doctrine (all phases)

- Full `node --test` suite green before any phase closes.
- `node --check` on every touched JS file.
- Asset changes: bump `?v=`, bump `CACHE_NAME`, update pinned version in `tests/html.test.js`.
- Before closing a phase touching data: manual drill on the real profile (export → mutate → import rollback; corruption drill; offline drill as applicable).
- No commits unless explicitly requested (repo rule).

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Refactor touches save path while data is real | Phase 1 makes safety net (quarantine/snapshot/validation) exist BEFORE any refactor phase begins — this is why sequencing is safety-first |
| Quarantine/snapshot keys grow unbounded | Cap retained quarantines (keep newest 3); auto-backups keep newest 2 |
| Seasonal auto-activation surprises user mid-year | Activation respects existing seasonal event ranges; no-op outside ranges; toggle exists in growth visibility settings |
| Panel-map consolidation breaks a section | Structural equality test over every section catches divergence at test time |
| Backup format change strands old backups | Importer accepts legacy v2.0 format (missing new keys = fill defaults), never rejects old exports |

## Not In Scope

- Cloud sync / multi-device replication
- Framework migration or build step introduction
- State decomposition into multiple IDB stores (kept as single blob per user, per 2026-08-22 decision)
- Rewriting content pools or adding new scriptural content collections
- Browser/E2E automation layer (candidate for a future program)
