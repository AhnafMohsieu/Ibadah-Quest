# Juz View with Full-Range Rendering and Play Juz Audio

Date: 2026-08-03

## Problem

The Juz grid (render.js `openQuranJuz`, line ~581) is broken: clicking a juz card computes the juz's ayah range but then opens only the **starting surah** (`quranCurrentSurah = startSurah.n`). `endAyah` and `endSurah` are computed but unused (dead code). The user can never read a juz's full content, and there is no continuous juz audio.

## Goal

- Tapping a Juz card opens a full-range scroll of every verse in that juz, across surah boundaries.
- Header shows juz number/name and the surah span.
- "Play Juz" button plays all verses of the juz continuously through the existing audio player (pause/resume/stop, per-verse buttons, scroll-follow).
- Lazy loading (quran-verses.js on demand) must keep working — same guard pattern as the surah view.

## Design

### 1. State and routing (render.js)

- New module state: `quranCurrentJuz` (null | number). Existing: `quranCurrentSurah` (null | number).
- `renderQuran()` routing order: if `quranCurrentJuz !== null` → `renderQuranJuz()`; else if `quranCurrentSurah !== null` → `renderQuranSurah(el, quranCurrentSurah)`; else grid (unchanged).
- `openQuranJuz(juzNum)`: sets `quranCurrentJuz = juzNum`, clears `quranCurrentSurah`, calls `renderQuran()`. Replaces the current broken body.
- `quranBack()`: clears both `quranCurrentJuz` and `quranCurrentSurah`, calls `renderQuran()` (back goes to the grid, matching current surah behavior).
- `openQuranSurah(num)`: unchanged, but must also clear `quranCurrentJuz` (so surah clicks from the grid behave as before).

### 2. Range computation (pure function)

```js
function juzRange(juzNum) {
  // Returns { startGlobal, endGlobal, startSurah, endSurah } or null
  const j = QURAN_JUZ.find(x => x.n === juzNum);
  if (!j) return null;
  const nextJuz = QURAN_JUZ.find(x => x.n === juzNum + 1);
  const endGlobal = nextJuz ? nextJuz.start - 1 : 6236;
  return { startGlobal: j.start, endGlobal, startSurah: findSurahByAyah(j.start), endSurah: findSurahByAyah(endGlobal) };
}
```

`findSurahByAyah` already exists (render.js:593) and returns the surah whose cumulative range contains the global ayah. Surah boundary clipping: within `renderQuranJuz`, iterate surahs `startSurah.n .. endSurah.n`; for each, the local ayah range is `[max(1, startGlobal - cumBefore + 1), min(ay, endGlobal - cumBefore)]` where `cumBefore` is the total ayahs of all previous surahs (computed via the same cumulative walk as `findSurahByAyah`).

### 3. `renderQuranJuz()` (render.js)

- Lazy guard at top, identical to `renderQuranSurah`: if `typeof QURAN_POOL === 'undefined'` → `el.innerHTML = loading note` → `window.App.ensureQuranLoaded().then(() => renderQuranJuz())` → catch → error note. (Note: signature is `renderQuranJuz()` — it reads `quranCurrentJuz` from closure; the recursive call needs no args. For consistency with the existing pattern, `renderQuranJuz()` reads state internally.)
- Header: `← Back to Juzes` button (`App.quranBack()`), `<h2>` "Juz {n}" + Arabic/English name + surah span line ("Surah Al-Fatiha → Surah Al-Baqarah", using `QURAN_SURAHS[].en`), and a `#juzPlayBtn` play button (`App.playJuz({n})`).
- Verse rendering: for each surah in the span, emit the bismillah divider (except when the range starts at surah 1's first verse, matching `renderQuranSurah`'s rule), then all local verses in the clipped ayah range, using the exact `.verse-card` markup from `renderQuranSurah` (verse-num, verse-arabic, roman, english, `verse-play-btn` with `data-surah`/`data-verse` + `App.playQuranVerse(surah, verse)`).
- If a surah in the range has zero local verses in `QURAN_POOL`, show the existing "No local verses available" fallback note (same style as render.js:560), then continue with the next surah.
- Scroll: the playing verse scrolls into view automatically via existing `_scrollToVerse` (render.js:452).

### 4. Audio engine generalization (render.js)

- Rename `quranSurahMode` (bool) → `quranPlayMode` ('none' | 'surah' | 'juz'). All reads/writes updated (playQuranVerse, playSurah, _playSurahVerse, stopSurah, updateSurahButton, updateAudioButtons callers).
- `_playSurahVerse` → `_playQueueItem()`: body unchanged; `onended` advances `quranSurahIdx` (variable kept as-is) and re-invokes; stops at end.
- `stopSurah` → sets `quranPlayMode = 'none'` (resets queue, idx, playing verse/surah). Keep the exported name `stopSurah` (App export + callers) to avoid ripple.
- `playSurah(surahNum)`: sets `quranPlayMode = 'surah'` instead of `quranSurahMode = true`; pause/resume checks switch from `quranSurahMode` to `quranPlayMode === 'surah'`. Queue building unchanged. Lazy guard unchanged.
- `updateSurahButton()`: gate on `quranPlayMode === 'surah'` (button only exists in surah view anyway).
- New `playJuz(juzNum)`: same structure as `playSurah`:
  - Lazy guard: if `typeof QURAN_POOL === 'undefined'` → `window.App.ensureQuranLoaded().then(() => playJuz(juzNum)).catch(() => {})` and return.
  - Toggle semantics: if already playing this juz and paused → resume; if already playing this juz → pause; else build queue.
  - Queue: `const r = juzRange(juzNum); if (!r) return;` walk surahs `r.startSurah.n .. r.endSurah.n`, push `{surah, verse}` for every verse in the clipped local range present in `QURAN_POOL` (source match `(\d+):(\d+)`, same as playSurah).
  - Sets `quranPlayMode = 'juz'`, `quranSurahQueue = queue`, `quranSurahIdx = 0`, `_playQueueItem()`, `updateJuzButton()`.
- New `updateJuzButton()`: mirrors `updateSurahButton` for `#juzPlayBtn` ("⏸ Pause Juz" / "▶ Resume Juz" / "▶ Play Juz", `.playing` class toggle).
- `playQuranVerse`: cancel-branch sets `quranPlayMode = 'none'` instead of `quranSurahMode = false`.

### 5. App exports (core/actions.js window.App or render.js window exports)

- `App.playJuz` (added alongside `playSurah` in the existing export block, render.js:1446 area exposes `window.playSurah` etc. — follow the same pattern for `playJuz` and `renderQuranJuz` if needed; `openQuranJuz` is already exported on App).

## Non-goals

- No juz audio in the background while browsing other tabs.
- No offline audio caching.
- No changes to surah view behavior.
- No changes to the juz grid itself (cards stay identical).

## Testing

- Pure-function stub test: `juzRange(1)` → {startGlobal:1, endGlobal:141, startSurah:1, endSurah:2}; `juzRange(2)` → {startGlobal:142, endGlobal:252} (mid-surah boundary); `juzRange(30)` → {startGlobal:5673, endGlobal:6236} (78:1 → 114:6, verified against QURAN_SURAHS cumulative counts, total 6236); clipping test: juz 2 first surah local range starts at ayah 142.
- Queue-build stub test: `playJuz(2)` builds queue starting `{surah:2, verse:142}`; mode 'juz'; second call pauses; third resumes.
- Regression: existing 4 stub suites + nav regression re-run.
- Manual smoke: Juz 1 → all verses to 2:141; Play Juz streams; per-verse play cancels juz mode; back button returns to grid.
