# Multi-Tafsir Selector + Qudsi Collection + Exact-Portion Dhikr Audio — Design

Date: 2026-08-25
Status: Approved
Branch: `tafsir-qudsi-dhikr-audio`

## Goal

1. (B, primary) Per-verse tafsir on demand in the Quran reader with a two-way edition selector: Tafsir Ibn Kathir (Abridged, English) and Tafsir al-Jalalayn (Arabic).
2. (A) Add Forty Hadith Qudsi as the sixth remote hadith collection.
3. (C) Tighten dhikr audio mapping to exact-portion matches only; all other slots fall back to device TTS.

Non-goals: replacing the daily-content tafsir pool; Musnad Ahmad; new recitation audio sources; changes to Quran verse audio.

## Verified data sources (2026-08-25)

- **Ibn Kathir EN**: `GET https://api.quran.com/api/v4/tafsirs/169/by_ayah/{s}:{v}` → `{tafsir:{text:"<h2>…</h2><p>…</p>", resource_name,…}}`. HTML payload per ayah. Free, no key.
- **Jalalayn AR**: `https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1/editions/ara-jalaladdinalmah.json` → `{quran:[{chapter:N,verse:N,text:"…"}]}`, exactly 6236 entries in revelation order (index = global ayah − 1), ~2.4 MB UTF-8.
- **Qudsi**: editions `eng-qudsi` / `ara-qudsi` exist on the fawazahmed0 hadith-api CDN (confirmed in the editions index during the prior project).

## Item B — Multi-tafsir selector

### Data flow

New deferred feature module `features/tafsir-library.js`:

```
window.TafsirLibrary = {
  EDITIONS: [ {id:'ibnkathir', name:'Ibn Kathir', lang:'en', dir:'ltr'},
              {id:'jalalayn',  name:'Tafsir al-Jalalayn', lang:'ar', dir:'rtl'} ],
  getTafsir(editionId, surah, ayah) -> Promise<{text, lang, dir} | null>,
  sanitizeRichText(html) -> string        // pure, exported for tests
}
```

- **ibnkathir**: cache-first via `ContentCache.get('taf-ibnkathir-{s}:{v}')`; miss → API GET → store `.tafsir.text`.
- **jalalayn**: cache-first via `ContentCache.get('taf-jalalayn-ar')`; miss → fetch whole edition once → store; lookup `arr[(globalAyahOf(s,v))-1]` reusing the existing `globalAyahOf()` semantics (revelation-order cumulative ayah counts from QURAN_SURAHS); concurrent calls share one in-flight promise (same pattern as `HadithLibrary`).
- Network failures reject; UI toasts and keeps the panel retryable.
- `sanitizeRichText`: removes `<script>`/`<style>` blocks, `on\w+="…"`/`'…'` handler attributes, `javascript:` hrefs/src; returns the rest unchanged. Pure function.

### UI

- Verse cards in BOTH `renderQuranSurah` and `renderQuranJuz` gain a small toggle button (`iqIcon('book-open')`, label "Tafsir") next to the play button. Tap toggles an inline panel below that card: spinner while fetching, then sanitized rich text. Only one panel open at a time is NOT enforced (independent cards fine); state kept in a module-level map `openTafsir = {'s:v': true}` cleared when leaving the surah/juz view so re-entry starts collapsed.
- Panel text container: `sanitizeRichText` output via innerHTML (remote dataset = trusted-pool convention, sanitizer as defense-in-depth).
- Segmented control above the verse list (both views): two buttons bound to `S.tafsirEdition`; switching re-renders and refetches any open panels.
- Arabic rendering: `dir="rtl"`, `'Amiri',serif`, accent color — mirrors existing Arabic styling.

### State

- `freshState()` gains `tafsirEdition:'ibnkathir'`. No schemaVersion bump (no shape transform).

## Item A — Qudsi collection

- Append `{ id: 'qudsi', name: 'Forty Hadith Qudsi', desc: 'Forty narrations in which the Prophet ﷺ transmits meanings from Allah directly' }` to `REMOTE_COLLECTIONS` (after malik). Icon via `colIconFor` ('scroll'). Update the wiring test's id-list regex expectation from 5 to 6 ids. All fetch/cache/normalize/TTS machinery reused unchanged.

## Item C — Exact-portion dhikr audio

Regenerate `data/dhikr-audio-map.js` from the same hisnmuslim item JSONs (re-fetch procedure identical to prior plan) under a strict rule:

- Normalize both sides: strip diacritics `U+064B–U+065F` and `U+0670`, strip tatweel `U+0640`, collapse whitespace.
- Keep a URL **only if normalized card text === normalized recording text** (exact equality).
- Everything else → `null` (TTS fallback). The prior loose substitutions (e.g., full tasbih-fatimi for bare "سبحان الله وبحمده") are dropped by design.

### Play/stop toggles on individual dhikr cards

The existing music-icon speaker buttons on Morning/Evening/Situational cards become true Quran-style play/stop toggles with visible playing state:

- **Source tracking in `core/audio.js`** (backward-compatible extension): `playRecording(url, onended)` gains an optional options form `playRecording(url, { id, onended })` and `playTTS`/`toggleTTS` accept an optional trailing `{ id }`; module records `_currentId` when playback starts and clears it on natural end/stop. New exports: `currentId() -> string|null` and `setOnChange(fn)` — a single callback fired whenever the active source changes (start / stop / natural end), so renderers update button states without polling.
- **Button states**: idle → music icon; that card's audio active → stop icon (`iqIcon('x')`) + accent highlight color. Tapping while active stops it; tapping another card switches sources (existing single-source discipline handles superseding).
- **IDs**: `dhikr-morning-{idx}`, `dhikr-evening-{idx}`, `dhikr-situational-{cat}-{idx}`; Play-all uses id `dhikr-playall-{kind}`.
- **State refresh**: static.js registers one `AppAudio.setOnChange` handler that updates only the affected buttons' icon/class via a light DOM pass (no full `renderAll`, which would reset scroll). Handlers also call the refresh after initiating playback (start is synchronous state).

## Wiring & cache discipline

- index.html: add `<script src="features/tafsir-library.js?v=1" defer></script>` near hadith-library; bump touched assets: `core/audio.js?v=2→3`, `features/hadith-library.js?v=1→2`, `render/dynamic.js?v=5→6`, `render/static.js?v=3→4`, `state/state.js?v=5→6`, `data/dhikr-audio-map.js?v=1→2`, SW registration `sw.js?v=21→22`.
- sw.js: `CACHE_NAME 'iq-cache-v21' → 'iq-cache-v22'`.
- tests/html.test.js: update pins; add assertions for the new tag + ordering (tafsir-library after quran-meta-bearing scripts not required — it reads QURAN_SURAHS only at call time via globals).

## Error handling

- Ibn Kathir fetch failure → toast "Couldn't load tafsir — check connection"; panel shows retry hint; cached verses work offline.
- Jalalayn first-download failure → same toast; second tap retries; after download it is fully offline.
- Missing entry (shouldn't happen for valid ayah) → "No tafsir available for this verse".

## Testing

- Unit tests: `sanitizeRichText` fixtures (script/style/on-handler/javascript: removal; benign HTML passthrough); jalalayn index lookup math vs fixture slice; qudsi id-list wiring test update; audio source-tracking (`currentId` lifecycle: set on start, cleared on stop/end; `setOnChange` fires) via the existing Node eval harness.
- Wiring pins: play/stop toggle markup present in static.js (data-id attributes, stop-state class), `currentId()`/`setOnChange` exported from audio.js.
- Full suite green; `node --check` every touched file; version-pin updates in html.test.js.
- Browser smoke via iq-qa: selector switches editions, both texts render (RTL check for Jalalayn), offline reopen works, dhikr speakers flip to stop-state while playing and back after end, previously-loose slots now TTS-fallback, zero console errors.
