# True MPA + ES Modules + Light Build — Design Spec

Date: 2026-09-07
Status: approved (all 4 sections signed off)
Source: brainstorming — monolithic vanilla SPA → modular multi-page app

## 1. Problem

Single `index.html` SPA loads ~150 `<script>` tags as global `window.*` IIFEs (212 app JS files).
Heavy data pools (`data/pools/quran-verses.js` 3.1 MB, `data/pools/hadiths.js` 2.4 MB, `data/hadith-collections.js` 385 KB)
load on every visit, including Today prayers. Tab wiring has a 4-touchpoint contract
(`data/tab-groups.js` + panel div in `index.html` + mapping in `render/tabs.js` `_lazyRender` +
exported renderer) — missing one produces a silently blank panel. Script load order in
`index.html` is load-bearing. Asset versioning is manual (`?v=` + `CACHE_NAME` in `sw.js` +
pinned version in `tests/html.test.js`).

## 2. Decision

Option B: light-build ES-module MPA, source stays vanilla JS, no framework.
Vite is build-only (dev + hashed production assets + SW precache manifest).

Rejected:
- A (native ESM, no bundler): keeps duplicated shell HTML, manual `?v=` bumping, no code-splitting of 5 MB pools.
- C (hybrid strangler as end-state): leaves two architectures permanently; accepted only as migration tactic.

## 3. Architecture — 5 pages

```
src/
  pages/
    today.html      # Core group: Today, Prayer Times, Quests, Journeys
    ibadah.html     # Adhkar (Morning/Evening/Remembrance/Situational) + Guide + Self-Tracking
    knowledge.html  # Quran & Sunnah + Fiqh + Heart & Soul + Dealings & Society + Life & Modern + Hereafter
    library.html    # Dynasties & Battles + Cities & Lands + Arts & Crafts + Arabic + Philosophy + Names
    profile.html    # Profile + Trophies + Progress + Analytics + Rewards
  shell/layout.js   # single header / streak-bar / nav / modal / toast template
  core/             # storage, state, xp, backup, recovery, error-tap, content, audio, ...
  features/         # per-domain modules, explicit exports
  render/           # per-domain renderers, explicit exports
  data/             # pools, lazy-loaded via dynamic import()
```

- Each page has its own `entry.js`: statically imports shell + core + its renderers,
  dynamically `import()`s heavy pools (quran-verses / hadiths only on knowledge page).
- Real navigations (`<a href="/knowledge.html">`); per-page bundles are small + SW-cached so
  navigation stays fast and offline-capable.
- Missing import fails loudly at build — replaces the silent 4-touchpoint blank-panel bug.

## 4. Module boundaries

- `src/shell/layout.js` renders header/streak-bar/nav from one template; active link via
  `data-page` attribute. No copy-pasted shell HTML per page.
- `src/core/` is the single source of truth: `storage.js`, `state.js`
  (`freshState` + `normalizeState` backfill for new fields), `xp.js`
  (`applyXpDelta` / `spendXp` only), `backup.js`, `recovery.js`, `error-tap.js`,
  `content.js`, `audio.js`. All ES exports, zero `window.*` globals.
- `src/features/*` and `src/render/*` export explicit `renderX()` / action functions;
  a page entry calls only its own. IIFE → ESM conversion is mechanical
  (export the former `window.X`).
- `escapeHTML` remains mandatory at every render boundary; never trust strings from state.
- Script load order ceases to matter; module graph replaces `<script>` ordering.

## 5. Data flow + offline + errors

- All pages import the same `core/state.js` over shared-origin `localStorage`
  (`iq9_user_` prefix). Load via `normalizeState()` on page init, mutate only via
  `applyXpDelta`, persist on change. Cross-page consistency is free: each navigation
  reloads state. No backend.
- Offline-first PWA preserved: Vite emits hashed assets; SW precaches per-page shell +
  core + visited pools (cache-first shell, stale-while-revalidate pools). Replaces manual
  `?v=` / `CACHE_NAME` / `html.test.js` pinning with a build-generated manifest.
  `manifest.json` `start_url` points at `/today.html`; widgets stay.
- Errors: `error-tap.js` is the first module import on every page
  (`onerror` + `unhandledrejection`, 25-entry buffer, one toast per session).
  `recovery.js` corruption quarantine + repair stays in core.

## 6. Testing + migration + success

- Tests stay `node --test` but import from `src/` instead of `window.*` globals.
- New gates: no-globals lint (fail on `window.X =` assignment) + per-page smoke test
  (each entry boots with empty state). `node scripts/check-syntax.js` is replaced/augmented
  by `vite build` failing loudly.
- Migration (strangler): (1) `core/` + `state/` to ESM first, (2) `today.html` page first,
  (3) ibadah / knowledge / library / profile one by one. Old `index.html` kept until cutover.
- `tests/html.test.js` updated to assert module imports, not `?v=` pins.
- `AGENTS.md` updated: new commands, no 4-touchpoint rule, no load-order rule.
- Success criteria: Today loads without quran/hadith pools; all tests pass
  (currently ~468); PWA installs and works offline; zero `window.*` writes.

## 7. Out of scope (YAGNI)

No framework, no router library, no backend/sync, no per-tab HTML files
(100+ pages rejected), no design-system rewrite, no widget expansion.

## Spec self-review

- Placeholders: none — pages, modules, gates, and migration order are explicit.
- Consistency: 5-page grouping matches approved Section 1; shell/boundaries match
  Section 2; storage/SW/errors match Section 3; tests/migration match Section 4.
- Scope: single implementation plan (MPA skeleton + core ESM + today page proves it,
  remaining pages follow the same pattern).
- Ambiguity: page→tab mapping is enumerated above; `?v=`/`CACHE_NAME` replacement is
  build-generated manifest, not manual bumps.
