# Tafsir Browser in Interpretation Tab + Prayer Centering — Design

## Goal
Move per-ayah tafsir lookup out of the Quran reader into a dedicated browser
in the Interpretation tab (surah picker + ayah input + edition buttons +
result panel, curated pool kept below), and center the Daily Prayers 3+2 grid
so the last row sits centered. Approach A approved (single tafsir code path).

## Findings (evidence)
- Quran reader tafsir = per-verse book buttons + inline panels + edition bar +
  hint, all fetching by ayah via `TafsirLibrary.getTafsir` (12s timeout,
  ContentCache, retry, offline note — built previously).
- Interpretation tab today = curated `TAFSIR_POOL` cards only
  (`renderTafsir` → `poolRender`, static.js:114).
- `QURAN_SURAHS` (114 entries: n/en/ar/ay/type) already loaded; usable for a
  surah picker with ayah-count clamping.
- Prayer cards live in `#prayerArea .card-grid` (5-col base → 3-col phone);
  5 items leave a left-aligned 2-item last row.

## Design

### Section 1 — Interpretation tafsir browser (approved)
- Curated `TAFSIR_POOL` cards stay on top, untouched.
- New lookup block below: surah `<select>` (114 surahs), ayah number `<input>`
  (clamped 1..surah.ay), Ibn Kathir / Jalalayn edition buttons, result panel.
- Result flow reuses the proven logic verbatim: loading state →
  `TafsirLibrary.getTafsir` → sanitized text; offline note + Retry on failure.
- Last lookup persists as `S.tafsirLookup = {surah, ayah}` in `freshState()`
  (normalizeState backfills existing users); edition reuses existing
  `S.tafsirEdition`. Reopening the tab restores all three.
- New module `features/tafsir-browser.js` (deferred, health/finance pattern);
  `renderTafsir()` renders pool + mounts the browser container.

### Section 2 — Removal from Quran tab (approved)
- Out: `.verse-tafsir-btn` buttons, `.tafsir-panel` divs, edition tab-bar +
  hint, `openTafsir` state, `fillOpenTafsirs`/`loadTafsirInto`/`retryTafsir`
  + `window.*` exports + App facade entries. Verses + audio untouched.

### Section 3 — Prayer centering (approved)
- Phone + coarse blocks only: `#prayerArea .card-grid{display:flex;flex-wrap:wrap;
  justify-content:center}` with cards `flex:1 1 28%` → 3 over centered 2.
  Desktop keeps its 5-across grid.

### Section 4 — Verification + ship (approved)
- Tests (source-pattern, TDD): browser renders picker/input/editions/result;
  Quran reader has no tafsir buttons/panels/hint; prayer grid centers last row.
- Browser check: look up 2:255 in both editions; confirm no book buttons on
  verses; 390px prayer rows centered.
- Ship: suite green, `node --check` touched JS, bumps (`render/dynamic.js`,
  `features/tafsir-browser.js?v=1` new, `sw.js`, `CACHE_NAME`, pins),
  commit + push.

## Non-goals
- No new tafsir editions or data pools. No audio changes. No desktop relayout.
