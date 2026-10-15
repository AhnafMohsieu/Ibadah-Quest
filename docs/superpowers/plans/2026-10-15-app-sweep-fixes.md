# Plan — App Sweep Fixes (CSP · Tab Drill/Back · MPA Paths · Mobile Bottom Nav)

**Spec:** `docs/superpowers/specs/2026-10-15-app-sweep-fixes-design.md`
**Test command:** `node --test` from repo root (baseline 547 pass; final: 549 with the 2 new tests).
**Global constraints:** no commits; do not touch `opencode.json` / `Images/` / `data/hadith-collections.js`; escape-nothing here (no user input); every task ends with the suite green.

---

## Task 1 — F1: CSP allows the app's remote endpoints

Files: `index.html` (line 6 meta only).

- [x] 1.1 In the CSP `content=`, replace `connect-src 'self';` with `connect-src 'self' https://api.aladhan.com https://cdn.jsdelivr.net https://api.quran.com;`, and insert `media-src 'self' https://verses.quran.com;` before `worker-src 'self'`.
- [x] 1.2 Verify: `node --test tests/html.test.js` green (CSP pin added in Task 6, run again then).

## Task 2 — F2: `core/tabs.js` drill/back + class normalization + cache bump

Files: `core/tabs.js`, `index.html` (line 426).

- [x] 2.1 `selectCategory()`: hoist `var tier3Wrap = document.getElementById('tier3Wrap');` above the `currentCat === 'library'` branch; in the non-library case set `if (tier3Wrap) tier3Wrap.style.display = '';` (comment: re-show the tier-3 grid after a drill-down).
- [x] 2.2 `drillUp()`: delete `var catEl = document.querySelector('.t1-btn.active');` and its `catId` lookup; resolve `var cat = groups.find(function(c) { return c.id === _activeCategoryId; });`; when `cat && cat.grid` call `renderCategoryTabs(cat)` instead of the inline innerHTML rebuild (drop the duplicated markup block).
- [x] 2.3 `switchCategory()`: non-library categorized branch → `container.classList.remove('surah-grid')` before `container.classList.add('cat-chips')`; flat `else` branch → also `container.classList.remove('surah-grid')`.
- [x] 2.4 `index.html`: `core/tabs.js?v=10` → `core/tabs.js?v=11`.
- [x] 2.5 Verify: `node --check core/tabs.js`; `node --test` green.

## Task 3 — F3a: root-absolute injected script URLs in the 5 MPA entries

Files: `src/pages/{ibadah,knowledge,library,names,profile}/entry.js`.

- [x] 3.1 `ibadah/entry.js`: prefix every `TAB_SCRIPTS`/`CORE_SCRIPTS` URL with `/` and move `widgets/dhikr-counter.js` → `/features/widgets/dhikr-counter.js` (renderer sets unchanged).
- [x] 3.2 `knowledge/entry.js`: same rewrite; update the two comment lines to `core/static.js` / `core/dynamic.js`.
- [x] 3.3 `library/entry.js`: same rewrite.
- [x] 3.4 `names/entry.js`: same rewrite.
- [x] 3.5 `profile/entry.js`: same rewrite; `analytics/*` → `/features/analytics/*`.
- [x] 3.6 Verify: `node core/check-syntax.js` clean.

## Task 4 — F3b: bridge HTML state path

Files: 5 × `src/pages/<p>/<p>.html` (line 44).

- [x] 4.1 `/state/state.js` → `/core/state.js` in ibadah, knowledge, library, names, profile HTMLs.
- [x] 4.2 `core/mpa-bridge.js`: update the 3 stale `state/state.js` / `render/*.js` comment references to `core/state.js` / `core/static.js` / `core/dynamic.js` (comments only).
- [x] 4.3 Verify: `node --check core/mpa-bridge.js`.

## Task 5 — Manifest + SW cache discipline

Files: `core/precache-manifest.js`, `sw.js`, `index.html` (line 549).

- [x] 5.1 Append `'src/pages/names/names.html'` to `self.__PRECACHE` (after `profile.html`).
- [x] 5.2 `sw.js`: `MANIFEST_REV = 6` → `7`.
- [x] 5.3 `index.html`: `sw.js?v=53` → `sw.js?v=54`.
- [x] 5.4 Verify: `node --test tests/sw.test.js tests/sw-manifest.test.js` green (must-list updated in Task 6).

## Task 6 — Regression pins (intentional test updates)

Files: `tests/mpa-smoke.test.js`, `tests/sw-manifest.test.js`, `tests/html.test.js`.

- [x] 6.1 `mpa-smoke.test.js`: TAB_SCRIPTS assertion → `` entry.includes(`${id}: ['/`) || entry.includes(`'${id}': ['/`) `` with message "script URLs must be root-absolute"; add `assert.doesNotMatch(entry, /['"](?:core|data|features|render|analytics|widgets|state)\//, …)` per page.
- [x] 6.2 `mpa-smoke.test.js`: new test — 5 bridge HTMLs contain `<script src="/core/state.js"></script>` and no `src="/state/`.
- [x] 6.3 `sw-manifest.test.js`: add `'src/pages/names/names.html'` to the `must` array.
- [x] 6.4 `html.test.js`: `sw.js?v=53` → `sw.js?v=54` pin; new CSP pin test (connect-src hosts + media-src verses.quran.com).
- [x] 6.5 Verify: `node --test` green, expect 549 tests.

## Task 7 — End-to-end verification (browser) + cleanup

- [x] 7.1 Legacy app (static server :8377): fresh load → 0 CSP errors; drill knowledge→fiqh card→Back → grid `surah-grid` restored (screenshot compare vs `qa-grid-correct.png`); chip-while-drilled → `#tier3Wrap` visible; Library→Profile → `#tier2Tabs` has no `surah-grid`.
- [x] 7.2 MPA: load all 5 pages → 0 404 console errors; first tab's panel has child content.
- [x] 7.3 Delete `qa-grid-after-back.png`, `qa-grid-correct.png`, `qa-phone-top.png`; stop the background static server.
- [x] 7.4 Final: `node --test` + `node core/check-syntax.js` green; update plan checkboxes; report evidence.

---

## Task 8 — F4: make the mobile bottom nav actually visible (user-reported)

- [x] 8.1 `styles/main.css:2713`: `.bnav` → `position:fixed;left:0;right:0;bottom:0;` (rest unchanged).
- [x] 8.2 `styles/main.css`: after the safe-area `@supports` block add the portrait clearance block — `.app{padding-bottom:calc(84px + env(safe-area-inset-bottom, 0px));}` and `.fab-container{bottom:calc(104px + env(safe-area-inset-bottom, 0px));}` under `@media (max-width:767px) and (orientation:portrait), (pointer:coarse) and (orientation:portrait)`.
- [x] 8.3 Cache discipline: `index.html` `styles/main.css?v=41→42` + `sw.js?v=54→55`; `sw.js` `MANIFEST_REV 7→8`; pins `tests/html.test.js:98,159` (v42) and `:75` (v55).
- [x] 8.4 `tests/html.test.js` bottom-nav test: add pins for `.bnav{position:fixed` and the 84px clearance rule.
- [x] 8.5 Verify: `node --test` green; browser 390×844 (visible, pinned, no phantom window scroll, FAB clear, category switch works + active sync), 1280×800 (nav hidden), 844×390 (nav hidden).
