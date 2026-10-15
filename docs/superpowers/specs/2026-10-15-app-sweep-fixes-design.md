# App Sweep Fixes — CSP, Tab Drill/Back, MPA Script Paths

**Date:** 2026-10-15
**Status:** Approved for implementation (sweep findings verified in-browser before this doc)
**Scope:** 3 fix groups (F1 CSP, F2 tabs.js drill/back, F3 MPA post-reorg paths) + cache/manifest discipline + regression-test updates. No new features, no refactors.

---

## 1. Problem (verified against current code + live browser)

### F1 — CSP blocks every remote content endpoint (HIGH)

`index.html` line 6: `connect-src 'self'` and no `media-src` (falls back to `default-src 'self'`). Verified console on fresh load: **27 CSP errors**, first being
`Connecting to 'https://api.aladhan.com/v1/timings/…' violates the following Content Security Policy directive: "connect-src 'self'"`.

Blocked legitimate runtime endpoints:
| Endpoint | Consumer | Directive needed |
|---|---|---|
| `https://api.aladhan.com/v1/timings/…` | `core/render-prayers.js:174` (fetch) | connect-src |
| `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/…` | `features/hadith-library.js:2` (fetch) | connect-src |
| `https://api.quran.com/api/v4/tafsirs/` | `features/tafsir-library.js:2` (fetch) | connect-src |
| `https://verses.quran.com/…mp3` | `core/dynamic.js:604` → `core/audio.js playRecording` (`new Audio(url)`) | media-src |

`<a href>` links to quran.com / sunnah.com / islamqa.info are navigations — not restricted by these directives, no change needed.

### F2 — tabs.js drill/back bugs (verified via browser DOM reads on the running app)

1. **After Back the grid loses `surah-grid`** (already captured in `qa-grid-after-back.png` vs `qa-grid-correct.png`): `drillUp()` (core/tabs.js:168) looks the group up with `.t1-btn.active[data-cat]` — that is the *tier-1* id (`knowledge`), never a group id (`fiqh`, `history`, …) — so the lookup fails for every categorized non-library category and the grid is never rebuilt with its `surah-grid` class. `_activeCategoryId` (set by `switchCategory`/`selectCategory`) is written but never read — the intended hook.
2. **Chip click while drilled-in leaves tier-3 hidden**: verified `#tier3Wrap` computed `display:none` after clicking a category chip while drilled into a tab; `renderCategoryTabs` fills the grid but it is invisible. `selectCategory()` shows `#tier3Wrap` only in its `library` branch.
3. **Class leak `surah-grid` on `#tier2Tabs`**: verified `"tier2-tabs surah-grid"` after Library → Profile. `switchCategory()` adds/removes `cat-chips` but never removes `surah-grid`. Currently masked for `display` by `#tier2Tabs{display:flex}` (ID rule beats `.surah-grid`), but the leak overrides `gap` (6px→8px) and `padding-top` (4px→8px) — a latent CSS hazard.

Drill path itself (drill into card → panel + Back button) is correct; only Back-restore and chip-while-drilled are broken. Library path is correct (it does not use the broken lookup).

### F3 — MPA track 404s from pre-reorg paths (commit 4b0d672 moved folders)

- The 5 bridge HTMLs (`ibadah`, `knowledge`, `library`, `names`, `profile`) load `<script src="/state/state.js">` (line 44) — `state/` no longer exists; state lives at `core/state.js`. With the 404, `window.loadState` never exists and `core/mpa-bridge.js` degrades to `S = {}`.
- Every `entry.js` `TAB_SCRIPTS`/`CORE_SCRIPTS` URL is a bare relative pre-reorg path (`render/static.js`, `render/dynamic.js`, `analytics/*`, `widgets/dhikr-counter.js`, `state/*`, plus `core/*`, `data/*`, `features/*` without leading `/`). Relative to the page URL (`/src/pages/<page>/`) every injected script 404s. Verified: 404 console errors on all 5 pages (`today` is clean — pure ESM).
- `src/pages/names/names.html` is absent from `core/precache-manifest.js` (all 5 other pages listed).

---

## 2. Goal & success criteria

1. Fresh `index.html` load: **zero CSP-violation console errors**; aladhan/hadith/tafsir fetches proceed past CSP (result may be network-dependent); verse audio URL not CSP-blocked.
2. Drill into a card → Back → grid renders as `surah-grid` cards (matches `qa-grid-correct.png`); chip click while drilled-in → `#tier3Wrap` visible; after Library → Profile, `#tier2Tabs` className has no `surah-grid`.
3. MPA pages `ibadah/knowledge/library/names/profile`: **zero 404 console errors**; first tab's renderer produces visible content; `today` untouched.
4. `node --test` green (547 baseline + new pins), `node core/check-syntax.js` clean, `node --check` clean on touched classic files.
5. Cache discipline honored: `core/tabs.js?v=10→11`; `MANIFEST_REV 6→7`; `sw.js?v=53→54` + `tests/html.test.js` pin.

## 3. Design (exact changes)

### F1 — `index.html` line 6 (single meta edit)

```
connect-src 'self' https://api.aladhan.com https://cdn.jsdelivr.net https://api.quran.com;
media-src 'self' https://verses.quran.com;
```
(keep `worker-src 'self'`, all other directives unchanged; `script-src` already allows `https://cdn.jsdelivr.net`.)

### F2 — `core/tabs.js`

- `selectCategory()`: hoist `tier3Wrap` lookup; for **non-library** categorized cats set `tier3Wrap.style.display = ''` (library branch unchanged).
- `drillUp()`: drop the dead `.t1-btn.active` lookup; resolve `cat = TAB_GROUPS[currentCat].find(c => c.id === _activeCategoryId)`; when `cat && cat.grid` call `renderCategoryTabs(cat)` (single source of truth for card markup + `surah-grid` class). Library early-return and panel-clear stay.
- `switchCategory()`: normalize container classes — non-library categorized branch adds `classList.remove('surah-grid')` before adding `cat-chips`; flat branch also removes `surah-grid`.
- Bump `core/tabs.js?v=10` → `?v=11` in `index.html` line 426.

### F3 — MPA paths (root-absolute, matching the HTMLs' existing `/core/storage.js` convention)

- 5 × `src/pages/<p>/entry.js`: rewrite every `TAB_SCRIPTS`/`CORE_SCRIPTS` URL with a leading `/` and post-reorg folder (`/core/static.js`, `/core/dynamic.js`, `/core/prayers.js`, `/core/quests.js`, `/core/achievements.js`, `/core/shop.js`, `/core/xp.js`, `/core/random.js`, `/core/dhikr.js`, `/core/content.js`, `/features/garden.js`, `/features/muhasabah.js`, `/features/journeys.js`, `/features/health.js`, `/features/finance.js`, `/features/zakat-calc.js`, `/features/achievement-showcase.js`, `/features/spiritual-growth/{lantern,boat,keys,mosque}.js`, `/features/widgets/dhikr-counter.js`, `/features/analytics/{dashboard,charts,trend-charts,weekly-compare,smart-insights}.js`, `/data/journeys.js`, `/data/pools/{quran-verses,hadiths}.js`). No renderer/URL *set* changes — only paths.
- 5 × `src/pages/<p>/<p>.html` line 44: `/state/state.js` → `/core/state.js`.
- Comment truth-up: `core/mpa-bridge.js` header + `src/pages/knowledge/entry.js` TAB_SCRIPTS comment.

### Manifest / cache

- `core/precache-manifest.js`: append `'src/pages/names/names.html'`.
- `sw.js`: `MANIFEST_REV = 6` → `7`.
- `index.html` line 549: `sw.js?v=53` → `?v=54`.

### Regression test updates (intentional pin changes)

- `tests/mpa-smoke.test.js`: TAB_SCRIPTS assertion becomes `` `${id}: ['/` || `'${id}': ['/` `` (pins root-absolute injection); add per-page negative pin `/['"](?:core|data|features|render|analytics|widgets|state)\//`; new test: the 5 bridge HTMLs load `/core/state.js` and no `/state/` script.
- `tests/sw-manifest.test.js`: add `src/pages/names/names.html` to the `must` list.
- `tests/html.test.js`: `sw.js?v=54` pin; new CSP pin test asserting `connect-src` includes the 3 hosts and `media-src` includes verses.quran.com.

## 4. Constraints

- Do not touch `opencode.json`, `Images/`, `data/hadith-collections.js`; no commits.
- No behavior change beyond the 3 fix groups; keep the `window.*` API surface.
- Legacy `?v=` discipline for changed classic assets; MANIFEST_REV for precached URLs.
- `node --test` is the only test command; must end green.
- QA artifacts (`qa-grid-after-back.png`, `qa-grid-correct.png`, `qa-phone-top.png`) deleted; background static server stopped at the end.

## 5. Risks

| Risk | Mitigation |
|---|---|
| CSP edit too broad / typo breaks parse | Single-line meta edit + new pin test parsing the CSP; browser console check after |
| `renderCategoryTabs(cat)` in `drillUp` changes behavior for non-grid cats | Guarded by `cat.grid` (identical previous guard); non-grid groups never render drill cards |
| MPA script URL typos | `node core/check-syntax.js`; browser check per page that renderers ran (panel non-empty) and zero 404s |
| Test pin updates hide a regression | Pins strengthened (root-absolute requirement), not relaxed; negative pin added |
| `sw.js?v` / `MANIFEST_REV` miss leaves users stale | Both bumped; manifest test extended to names.html |

## 6. Manual QA owed after merge

- Phone-width (390×844) spot-check of drill Back + chip-while-drilled (this run covers it headlessly via Playwright).
- Remote fetch *success* depends on the test machine's network; CSP-block removal is the verifiable part.

---

## 7. Addendum — F4: mobile bottom nav never visible (user-reported during verification)

**Problem (verified live at 390×844; user confirmed "in mobilephone there is no bottom navbar"):**
- `#bnav` is a body-level sibling placed *after* the scrolling shell `.app` (`height:100dvh; overflow-y:auto`) and styled `position:sticky;bottom:0` (`styles/main.css:2713`). Sticky cannot lift it from below the fold: at rest its rect top = 844 (= viewport height) — **invisible**; it appears only after a phantom 76.8px *window* scroll (body height 921 = .app 844 + nav 77), which normal content scrolling (inside `.app`) never triggers → the primary mobile nav is effectively unreachable.
- When revealed (max window scroll), the FAB (`bottom:16px`) overlaps the Profile button; the ≤767px FAB offset designed for a visible bar (`.fab-container{bottom:calc(104px + …)}`, line 2720) is overridden by the later safe-area `@supports` rule (line 3314).
- Intent: 2026-08-17 plan specified `position:fixed … z-index:150` + FAB adjustment; 2026-09-04 spec calls the nav "primary" and its own verification line requires "`#bnav` visible" at 390×844.

**Fix (CSS only):**
- Line 2713: `.bnav` → `position:fixed; left:0; right:0; bottom:0` (z-index 120 unchanged; FAB stays above at 200 and is moved clear).
- New block *after* the safe-area `@supports` (so its `bottom` value wins the cascade):
  `@media (max-width:767px) and (orientation:portrait), (pointer:coarse) and (orientation:portrait)`
  - `.app { padding-bottom: calc(84px + env(safe-area-inset-bottom, 0px)); }` — ≈ nav height + ~7px; global `box-sizing:border-box` keeps `height:100dvh` intact and the padding acts as scroll-end clearance.
  - `.fab-container { bottom: calc(104px + env(safe-area-inset-bottom, 0px)); }` — nav height + 27px gap (same value the ≤767 block already intended).
- Media condition mirrors the nav's own visibility rules (hidden in landscape line 3133, hidden ≥768px fine-pointer line 2718, shown on coarse line 2726).
- Side effect: the phantom window scroll disappears (body = viewport height).

**Cache discipline:** `styles/main.css?v=41→42` (index.html:27 + `tests/html.test.js:98,159`), `sw.js?v=54→55` (index.html:549 + pin), `MANIFEST_REV 7→8` (main.css is a precached URL).

**Verification:** 390×844 — nav visible/pinned at rest, window maxScroll 0, FAB clear of bar, scroll-end content clears the bar, bnav tap switches category + syncs active; 1280×800 — nav hidden, no layout change; 844×390 landscape — nav hidden, FAB 16px. Regression pins added to the bottom-nav test.
