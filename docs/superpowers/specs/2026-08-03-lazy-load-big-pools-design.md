# Lazy-Load Big Content Pools

Date: 2026-08-03

## Problem

Ibadah Quest loads ~6.4MB of JavaScript eagerly on every page open:

| File | Size | Data | Consumers |
|------|------|------|-----------|
| `data/pools/quran-verses.js` | 3.1MB | `QURAN_POOL` (Quran verses) | Surah content view, surah audio playback |
| `data/pools/hadiths.js` | 2.4MB | `HADITHS` | Global search index only (no UI renderer) |
| `data/hadith-collections.js` | 385KB | `HADITH_COLLECTIONS_DATA` | Hadith tab collections/books view |

This blocks first paint and wastes bandwidth: the default Daily tab needs none of them.

## Goal

- Initial load drops from ~6.4MB to ~220KB of JS.
- Big pools download on demand, once, then cached by the browser.
- No behavior regression: every existing UI path still works.

## Design

### 1. Script tag removal (index.html)

Remove these three `<script>` tags:
- `data/pools/quran-verses.js?v=3`
- `data/pools/hadiths.js?v=3`
- `data/hadith-collections.js?v=1`

Keep `data/pools/quran-meta.js` eager (8KB — surah list, juz map, audio URL helper).

### 2. Loader helper (core/actions.js)

```js
const _loadedScripts = new Set();
function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (_loadedScripts.has(src)) return resolve();
    const s = document.createElement('script');
    s.src = src + '?v=3';
    s.onload = () => { _loadedScripts.add(src); resolve(); };
    s.onerror = () => { console.warn('Failed to load ' + src); reject(new Error(src)); };
    document.head.appendChild(s);
  });
}
function ensureQuranLoaded() { return loadScript('data/pools/quran-verses.js'); }
function ensureHadithLoaded() {
  return Promise.all([
    loadScript('data/pools/hadiths.js'),
    loadScript('data/hadith-collections.js')
  ]);
}
```

Exposed on the `App` object as `ensureQuranLoaded` and `ensureHadithLoaded`.

### 3. Trigger points

- **Surah open** — `renderQuranSurah` (render.js:534): if `typeof QURAN_POOL === 'undefined'`, set `el.innerHTML` to a loading note, call `App.ensureQuranLoaded().then(() => renderQuranSurah(el, surahNum))`, and return. Same guard in `playSurah` (render.js:398): if unloaded, trigger the same load then start playback.
- **Hadith tab activation** — `activateTab` (actions.js:2046): if `tabId === 'hadith'` and `typeof HADITH_COLLECTIONS_DATA === 'undefined'`, load, then call `renderHadith()`.

### 4. Guards for unloaded pools

- `refreshContent` (actions.js:62-64) and `manualRefreshContent` (actions.js:88): wrap pool references as `(pool || [])` so missing pools yield index 0 instead of crashing.
- Already guarded (no change): `renderStatic` try/catch, `_buildFullIndex` (helpers.js), analytics counts.

### 5. Failure handling

If a script fails to load (offline), the area shows a short message ("Couldn't load verses — check connection and retry"). The tab shell remains usable.

## Non-goals

- No bundling/minification (no build tooling in repo).
- No preload-after-paint strategy — tabs drive all loading.
- `HADITHS` remains search-only; no new UI consumer is added.

## Testing

- `node --check` on modified JS files.
- Extend the navigation runtime test stub (Temp) to verify:
  - `ensureQuranLoaded` dedupes repeated calls.
  - `refreshContent` runs with pools undefined.
  - `renderQuranSurah` shows loading note then re-renders after load.
- Manual: open app → Daily loads instantly → open Quran (surah list instant) → click surah (verses appear) → re-open (no second fetch).
