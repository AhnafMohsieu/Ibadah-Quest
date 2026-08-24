# Hadith Library Expansion + Hadith & Dhikr Audio — Design

Date: 2026-08-24
Status: Approved (pending implementation plan)

## Goal

1. Expand the hadith browser from 2 collections (bundled Bukhari, Muslim) to the Kutub al-Sittah plus Muwatta Malik, sourced live and cached locally.
2. Add audio playback: real human recitations for dhikr (Morning, Evening, Situational), Arabic text-to-speech for hadith.

Non-goals: Musnad Ahmad (no reliable free dataset yet); changes to Quran audio; bundling new full datasets.

## Background

- Current hadith UI: `renderHadith()` in `render/dynamic.js` drills Collections → Books → Hadiths from global `HADITH_COLLECTIONS_DATA` (`data/hadith-collections.js`, bundled Bukhari + Muslim only).
- Quran audio streams per-ayah MP3s from verses.quran.com (12 reciters) in `render/dynamic.js`; untouched by this design.
- Dhikr content is text-only: `data/morning-evening.js` (MORNING_DHIKR / EVENING_DHIKR), `data/relatable-dhikr.js` (situational), `data/pools/dhikr.js` (daily pool).
- Storage: `core/storage.js` owns IDB database `ibadah-quest` (state only).

## Data Sources (verified working 2026-08-24)

### Hadith JSON — fawazahmed0/hadith-api via jsDelivr

- Index: `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions.json`
- Edition files: `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/{edition}.min.json`
- Editions used: `eng-{id}` and `ara-{id}` for `abudawud`, `tirmidhi`, `nasai`, `ibnmajah`, `malik`. Bonus availability noted for `nawawi`, `qudsi` (future).
- No API key. Entries carry `{number, arabicnumber, text, grades[], reference{book, hadith}, ...}`; metadata carries collection name + section names.
- **Musnad Ahmad is absent** from this dataset.

### Dhikr audio — hisnmuslim.com

- Category index `https://www.hisnmuslim.com/api/ar/husn_ar.json` lists ~133 Hisn al-Muslim categories, each with a full-section MP3 (`AUDIO_URL`) and per-item JSON (`TEXT`) whose items carry individual `AUDIO_URL`s.
- Audio URL pattern: `http://www.hisnmuslim.com/audio/ar/ar_7esn_AlMoslem_by_Doors_NNN.mp3`.
- Relevant category IDs: Morning/Evening=27, Sleep=28, Worry/grief=34, Distress=35, and situational categories as needed.

## Architecture

### New modules

| File | Load order | Purpose |
|---|---|---|
| `core/content-cache.js` | before render modules | Standalone IDB cache DB `iq-content-cache` v1, store `editions`, key = edition name (e.g. `eng-abudawud`), value = parsed JSON + fetch timestamp. API: `ContentCache.get(key)`, `ContentCache.put(key, json)`. Failures resolve `null` (cache is best-effort). |
| `core/audio.js` | before render modules | Shared audio manager. `App.playTTS(text, lang)` → speechSynthesis with Arabic voice pick (`getVoices().filter(v => /^ar/i.test(v.lang))`), cancel-on-new, stop handle; handles async `voiceschanged`. `App.playRecording(url)` → single shared `<audio>` element; starting any source (recording or TTS or Quran queue) stops the others. |
| `features/hadith-library.js` | deferred feature | Fetch + join + normalize remote editions into `HADITH_COLLECTIONS_DATA` shape; expose `App.ensureHadithCollection(id)` returning normalized collection from cache-then-network; handles loading/error states per collection. |
| `data/dhikr-audio-map.js` | data section (early) | Static mapping: dhikr item identity → hisnmuslim audio URL. Baked at build time from their per-category item JSONs (fetched once during implementation). Items without a confident match get no `audio` field → TTS fallback. |

### Normalization contract

Remote editions are converted into the existing shape so `renderHadith()` needs minimal edits:

```
{id, name, desc, icon?, remote:true,
 books:[{id, name, hadiths:[{n, t(english), a(arabic), b(bookNo), h(hadithNo)}]}]}
```

- Books derive from the edition's book/section structure (reference.book grouping; exact field verified against a sample file during implementation).
- English↔Arabic joined on hadith number within matching book. Mismatched entries keep English only (`a` absent) and hide the speaker button.
- Bundled Bukhari/Muslim stay as-is; when the user plays audio on one of them, `App.ensureHadithCollection(id)` lazily fetches just the matching `ara-*` edition once and caches it, then backfills `a` fields. All collections converge on Arabic + English + audio.
- Normalization is a pure exported function (`normalizeRemoteEdition(engJson, araJson)`) for unit testing.

### UI changes

- Collections grid (`renderHadith` level 1): cards for the 5 new remote collections with a download/cloud badge; tap → spinner state while downloading → normal drill-down. Offline + not cached → toast "Check connection", card stays retryable.
- Hadith card: adds Arabic line (RTL, reuses Quran arabic styling classes) above the English text, plus a speaker button (TTS). Verify link unchanged.
- Dhikr cards (Morning, Evening, Situational): speaker button playing the mapped recording if present, else TTS of the item's Arabic text. Section-level "Play all" button queues items sequentially through the same single-source audio manager.

### State & wiring

- `freshState()` in `state/state.js` gains `hadithTTSLang: 'ar'` (normalizeState backfills automatically). Downloaded collections are content-cache data, never stored in `S` — exports stay small.
- Script order in index.html: `core/content-cache.js`, `core/audio.js`, `data/dhikr-audio-map.js` after existing data/core scripts, before render modules; `features/hadith-library.js` with `defer`.
- Service worker: bump `CACHE_NAME`. CDN and audio URLs are never precached and always network-streamed; local asset `?v=` bumps follow the standard discipline including the `tests/html.test.js` pinned version.
- Icons: reuse existing `icons.js` keys for play/volume/book badges; add aliases in `IQ_IDS` if needed.

### Error handling

- Network failure on fetch → toast "Couldn't download collection — check connection"; card remains tappable; cached copy used offline whenever present.
- Number mismatch joining ara/eng → English-only card, no speaker.
- No Arabic TTS voice installed → toast offering English narration instead (sets nothing permanently unless user confirms; preference saved to `S.hadithTTSLang`).
- Cache quota/write errors silently ignored (content is re-fetchable).
- Mixed content: hisnmuslim audio links are `http://`. Implementation must first verify `https://www.hisnmuslim.com/audio/...` serves over TLS; if not, affected items fall back to TTS (browser blocks mixed media on HTTPS pages).

## Testing

- Unit tests (Node): `normalizeRemoteEdition` against committed fixture JSON snippets (join logic, book grouping, mismatch fallback).
- Wiring tests: html.test.js pins updated (new script tags, sw version bump); assertions that renderer exports exist.
- Full suite `node --test` green; `node --check` every touched file.
- Manual smoke via QA agent: open each new collection offline-cached and uncached, play TTS, play recordings, verify no console errors, confirm export/import still excludes cache DB.

## Risks

| Risk | Mitigation |
|---|---|
| jsDelivr CDN outage/unavailability | Cache-first reads; bundled Bukhari/Muslim unaffected |
| ara/eng numbering mismatches | Per-entry fallback to English-only |
| No Arabic TTS voice on device | English narration fallback toast |
| hisnmuslim http-only audio | Verify TLS first; TTS fallback otherwise |
| Exact book/section field names in dataset | Confirm with sample fetch before writing normalizer (fixture tests pin behavior) |
