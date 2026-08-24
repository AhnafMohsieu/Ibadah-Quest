# Hadith Library Expansion + Hadith/Dhikr Audio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Grow the hadith browser from 2 bundled collections to 7 (adding Abi Dawud, Tirmidhi, Nasa'i, Ibn Majah, Muwatta Malik fetched from CDN + IndexedDB-cached), add Arabic TTS playback on every hadith, and real-recitation audio buttons on Morning/Evening/Situational dhikr.

**Architecture:** Three new core modules (`content-cache.js` standalone IDB cache DB, `audio.js` shared single-source audio manager, `hadith-normalize.js` pure normalizer) plus one deferred feature (`hadith-library.js` fetch/join/cache glue). Rendering integrates into existing `renderHadith()` drill-down and the three dhikr renderers. Remote content never enters user state `S`.

**Tech Stack:** Vanilla JS (IIFE → `window.*`), IndexedDB, Web Speech API (speechSynthesis), HTMLAudioElement, Node built-in test runner.

**Spec:** `docs/superpowers/specs/2026-08-24-hadith-dhikr-expansion-design.md`

## Global Constraints

- No build step, no bundler. Plain `<script>` tags in dependency order; modules are IIFEs exporting to `window.*`.
- Script load order: data → pools → `core/storage.js` → `state/state.js` → render modules → deferred feature scripts → `core/actions.js` last.
- New state fields MUST go in `freshState()` in `state/state.js` (normalizeState backfills).
- Escape user-entered strings on render with `escapeHTML`. Remote hadith text comes from a trusted dataset but treat it like pool data (conventionally unescaped); anything user-authored gets escaped.
- Cache discipline: any changed asset referenced with `?v=` in index.html gets its `?v=` bumped, `CACHE_NAME` bumped in `sw.js`, and the pinned version updated in `tests/html.test.js`.
- Test command is exactly `node --test` from project root (~337 tests today, grows with this plan). Syntax-check each touched JS file with `node --check <file>`.
- Shell is Windows PowerShell 5.1: no `tail`/`head`, no `&&` between cmdlets (use `if ($?) {}`), quote glob patterns for node.
- Do NOT commit unless explicitly asked (repo rule overrides plan templates' commit steps; commit steps below are marked optional-confirm).
- Service worker only intercepts same-origin requests (sw.js:44), so CDN/audio URLs are automatically network-streamed — do not add them anywhere in sw.js.
- Verified facts (do not re-litigate): hisnmuslim audio serves over HTTPS (HTTP 200, audio/mpeg); API entry shape is `{metadata:{name,sections,section_details}, hadiths:[{hadithnumber, arabicnumber, text, grades[], reference:{book,hadith}}]}`; `metadata.sections` is a string-keyed map of book number → book name; icons `music` and `x` exist in `data/icons.js`, `volume`/`play`/`download` do NOT exist.

## File Structure

| File | Status | Responsibility |
|---|---|---|
| `core/content-cache.js` | Create | Standalone IDB cache (`iq-content-cache` DB, `editions` store). `ContentCache.get(key)` / `.put(key, value)`. Never throws. |
| `core/audio.js` | Create | Single-source audio manager: TTS (`playTTS`/`toggleTTS`/`stopTTS`), recordings (`playRecording`), queues (`playSequence`), global stop. Pure `pickArabicVoice(voices)` exported for tests. |
| `data/hadith-normalize.js` | Create | Pure `HadithNormalize.normalizeRemoteEdition(engJson, araJson, meta)` → existing `HADITH_COLLECTIONS_DATA` collection shape. |
| `features/hadith-library.js` | Create | Deferred feature: `HadithLibrary.ensureHadithCollection(id)` (cache-then-network), `ensureBundledArabic(id)` (backfill Arabic onto Bukhari/Muslim), `REMOTE_COLLECTIONS` metadata. |
| `data/dhikr-audio-map.js` | Create | Generated static map `DHIKR_AUDIO_MAP`: array positions → hisnmuslim MP3 URLs (or `null`). |
| `render/dynamic.js` | Modify | `renderHadith()`: 7-card grid with Online badge, loading state, Arabic line + speaker button on hadith cards, `App.hadithSpeak`. |
| `render/static.js` | Modify | Morning/Evening/Situational dhikr cards: speaker buttons + section Play-all; `App.dhikrSpeak` / `App.dhikrPlayAll`. |
| `state/state.js` | Modify | `freshState()` gains `hadithTTSLang:'ar'`. |
| `index.html` | Modify | New script tags in correct order; `?v=` bumps on modified assets. |
| `sw.js` | Modify | `CACHE_NAME` v19 → v20. |
| `tests/html.test.js` | Modify | Pin `sw.js?v=20`; assert new script tags. |
| `tests/hadith-normalize.test.js` | Create | Fixture tests for the normalizer (runs it in Node via `new Function` harness). |
| `tests/audio.test.js` | Create | Source pins + `pickArabicVoice` fixture test. |
| `tests/content-cache.test.js` | Create | Source pins (separate DB name, never touches Storage/state). |
| `tests/hadith-library.test.js` | Create | Wiring pins (CDN base, 5 collection ids, cache-first order, exports exist). |

---

### Task 1: `core/content-cache.js` — standalone IDB cache

**Files:**
- Create: `core/content-cache.js`
- Test: `tests/content-cache.test.js`

**Interfaces:**
- Consumes: nothing (standalone).
- Produces: `window.ContentCache = { get(key) -> Promise<value|null>, put(key, value) -> Promise<void> }`. Values stored wrapped as `{v: value, t: Date.now()}` under `key` in DB `iq-content-cache` v1, store `editions`.

- [ ] **Step 1: Write failing source-pin test**

Create `tests/content-cache.test.js`:

```js
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const src = fs.readFileSync(path.join(__dirname, '..', 'core', 'content-cache.js'), 'utf8');

test('content-cache: separate DB, does not touch state storage', () => {
  assert.ok(src.includes("'iq-content-cache'"), 'uses its own DB name');
  assert.ok(!src.includes("Storage."), 'must not reference window.Storage');
  assert.ok(src.includes("'editions'"), 'has editions store');
});

test('content-cache: exposes get and put, failures resolve null/noop', () => {
  assert.ok(src.includes('window.ContentCache'), 'exports namespace');
  assert.match(src, /function get\(key\)/);
  assert.match(src, /function put\(key, value\)/);
  assert.match(src, /\.catch\(function \(\) \{ return null; \}\)/, 'get resolves null on failure');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/content-cache.test.js`
Expected: FAIL ("no such file or directory" for content-cache.js).

- [ ] **Step 3: Write implementation**

Create `core/content-cache.js`:

```js
(function() {
  var DB_NAME = 'iq-content-cache';
  var DB_VERSION = 1;
  var STORE_NAME = 'editions';
  var dbPromise = null;

  function open() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise(function(resolve, reject) {
      var req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = function(e) {
        var database = e.target.result;
        if (!database.objectStoreNames.contains(STORE_NAME)) database.createObjectStore(STORE_NAME);
      };
      req.onsuccess = function() { resolve(req.result); };
      req.onerror = function() { dbPromise = null; reject(req.error); };
    });
    return dbPromise;
  }

  function get(key) {
    return open().then(function(db) {
      return new Promise(function(resolve, reject) {
        var r = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(key);
        r.onsuccess = function() { resolve(r.result ? r.result.v : null); };
        r.onerror = function() { reject(r.error); };
      });
    }).catch(function() { return null; });
  }

  function put(key, value) {
    return open().then(function(db) {
      return new Promise(function(resolve, reject) {
        var tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).put({ v: value, t: Date.now() }, key);
        tx.oncomplete = function() { resolve(); };
        tx.onerror = function() { reject(tx.error); };
      });
    }).catch(function() {});
  }

  window.ContentCache = { get: get, put: put };
})();
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --check core\content-cache.js; node --test tests/content-cache.test.js`
Expected: syntax OK, PASS (2 tests).

---

### Task 2: `core/audio.js` — shared audio manager

**Files:**
- Create: `core/audio.js`
- Test: `tests/audio.test.js`

**Interfaces:**
- Consumes: nothing at load time; optionally calls `window.stopSurah` (Quran queue stopper from render/dynamic.js) if present.
- Produces: `window.AppAudio = { pickArabicVoice(voices) -> Voice|null, playTTS(text, lang) -> boolean, toggleTTS(text, lang) -> boolean, stopTTS(), playRecording(url, onended?) -> HTMLAudioElement, playSequence(items) , stopAllAudio(), isBusy() -> boolean }`. Sequence items are `{url}` or `{tts, lang}`. `lang` is `'ar'` or `'en'`.

- [ ] **Step 1: Write failing test**

Create `tests/audio.test.js`:

```js
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const src = fs.readFileSync(path.join(__dirname, '..', 'core', 'audio.js'), 'utf8');

function evalModule() {
  const window = {};
  new Function('window', src)(window);
  return window.AppAudio;
}

test('audio: single-source discipline (each starter stops the others)', () => {
  assert.match(src, /function stopTTS\(\)/);
  assert.match(src, /stopTTS\(\);\s*\n?\s*if \(typeof window\.stopSurah === 'function'\) window\.stopSurah\(\);/, 'playRecording stops TTS + Quran queue');
  assert.match(src, /function stopAllAudio\(\)/);
});

test('audio: pickArabicVoice prefers ar voices, null otherwise', () => {
  const AppAudio = evalModule();
  const voices = [
    { lang: 'en-US', name: 'Zira' },
    { lang: 'ar-SA', name: 'Microsoft Hoda' },
    { lang: 'ar-EG', name: 'Google Arabic' }
  ];
  assert.equal(AppAudio.pickArabicVoice(voices).name, 'Microsoft Hoda');
  assert.equal(AppAudio.pickArabicVoice([{ lang: 'en-US', name: 'Zira' }]), null);
});

test('audio: exports complete surface', () => {
  const AppAudio = evalModule();
  ['pickArabicVoice','playTTS','toggleTTS','stopTTS','playRecording','playSequence','stopAllAudio','isBusy'].forEach(k => {
    assert.equal(typeof AppAudio[k], 'function', k + ' is a function');
  });
});
```

Note: `evalModule` works because the module body only touches `window` at export time; `speechSynthesis`/`Audio` references live inside functions never invoked during eval.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/audio.test.js`
Expected: FAIL (file missing).

- [ ] **Step 3: Write implementation**

Create `core/audio.js`:

```js
(function() {
  let recAudio = null;
  let seqQueue = [];
  let seqIdx = 0;
  let seqActive = false;

  function pickArabicVoice(voices) {
    const arabic = (voices || []).filter(v => /^ar/i.test(v.lang));
    if (!arabic.length) return null;
    return arabic.find(v => /microsoft|google/i.test(v.name)) || arabic[0];
  }

  function ttsAvailable() { return 'speechSynthesis' in window; }

  function stopTTS() {
    if (ttsAvailable()) window.speechSynthesis.cancel();
  }

  function isSpeaking() {
    return ttsAvailable() && (window.speechSynthesis.speaking || window.speechSynthesis.pending);
  }

  function stopRecording() {
    if (recAudio) { recAudio.pause(); recAudio = null; }
  }

  function stopQuranIfAny() {
    if (typeof window.stopSurah === 'function') window.stopSurah();
  }

  function stopAllAudio() {
    seqActive = false;
    seqQueue = [];
    seqIdx = 0;
    stopTTS();
    stopRecording();
  }

  function isBusy() { return seqActive || isSpeaking() || !!recAudio; }

  function speak(text, lang, onend) {
    if (!ttsAvailable() || !text) return false;
    stopRecording();
    const u = new SpeechSynthesisUtterance(String(text));
    if (lang === 'en') {
      u.lang = 'en-US';
    } else {
      const v = pickArabicVoice(window.speechSynthesis.getVoices());
      if (!v) return false;
      u.voice = v;
      u.lang = v.lang;
      u.rate = 0.9;
    }
    if (onend) u.onend = onend;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
    return true;
  }

  function playTTS(text, lang) { return speak(text, lang); }

  function toggleTTS(text, lang) {
    if (isSpeaking()) { stopTTS(); return true; }
    return speak(text, lang);
  }

  function playRecording(url, onended) {
    stopTTS();
    stopQuranIfAny();
    stopRecording();
    recAudio = new Audio(url);
    if (onended) recAudio.onended = onended;
    recAudio.play().catch(() => {});
    return recAudio;
  }

  function _seqNext() {
    if (!seqActive || seqIdx >= seqQueue.length) { seqActive = false; return; }
    const it = seqQueue[seqIdx++];
    const advance = () => { if (seqActive) setTimeout(_seqNext, 400); };
    if (it.url) {
      playRecording(it.url, advance);
    } else {
      const ok = speak(it.tts, it.lang || 'ar', advance);
      if (!ok) setTimeout(_seqNext, 0);
    }
  }

  function playSequence(items) {
    stopAllAudio();
    seqQueue = (items || []).slice();
    seqIdx = 0;
    if (!seqQueue.length) return;
    seqActive = true;
    _seqNext();
  }

  window.AppAudio = { pickArabicVoice, playTTS, toggleTTS, stopTTS, stopTTSFallback: stopTTS, playRecording, playSequence, stopAllAudio, isBusy, isSpeaking };
})();
```

Remove the accidental duplicate: the exported object must contain `stopTTS` exactly once — final export line should be:

```js
  window.AppAudio = { pickArabicVoice, playTTS, toggleTTS, stopTTS, playRecording, playSequence, stopAllAudio, isBusy, isSpeaking };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --check core\audio.js; node --test tests/audio.test.js`
Expected: syntax OK, PASS (3 tests).

---

### Task 3: `data/hadith-normalize.js` — pure normalizer

**Files:**
- Create: `data/hadith-normalize.js`
- Test: `tests/hadith-normalize.test.js`

**Interfaces:**
- Consumes: raw edition JSON shapes (verified against live API).
- Produces: `window.HadithNormalize.normalizeRemoteEdition(engJson, araJson, meta)` → `{id, name, desc, remote:true, books:[{id, name, hadiths:[{n, t, a, b, h}]}]}` matching `HADITH_COLLECTIONS_DATA` shape (`a` = arabic string or `null`). `<br>` tags stripped from arabic. Books sorted ascending by id, named via `metadata.sections[String(book)]` falling back to `'Book N'`.

- [ ] **Step 1: Write failing test with fixtures**

Create `tests/hadith-normalize.test.js`:

```js
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

function loadNormalizer() {
  const src = fs.readFileSync(path.join(__dirname, '..', 'data', 'hadith-normalize.js'), 'utf8');
  const window = {};
  new Function('window', src)(window);
  return window.HadithNormalize.normalizeRemoteEdition;
}

const ENG = {
  metadata: { name: 'Sunan Test', sections: { '1': 'Purification', '2': 'Prayer' } },
  hadiths: [
    { hadithnumber: 1, arabicnumber: 1, text: 'English one', grades: [], reference: { book: 1, hadith: 1 } },
    { hadithnumber: 2, arabicnumber: 2, text: 'English two', grades: [], reference: { book: 1, hadith: 2 } },
    { hadithnumber: 5, arabicnumber: 5, text: 'Unmatched english', grades: [], reference: { book: 2, hadith: 5 } }
  ]
};
const ARA = {
  metadata: { name: 'Sunan Test AR', sections: { '1': 'x', '2': 'y' } },
  hadiths: [
    { hadithnumber: 1, arabicnumber: 1, text: 'عربي واحد<br>extra', grades: [], reference: { book: 1, hadith: 1 } },
    { hadithnumber: 2, arabicnumber: 2, text: 'عربي اثنان', grades: [], reference: { book: 1, hadith: 2 } },
    { hadithnumber: 9, arabicnumber: 9, text: 'عربي بلا مقابل', grades: [], reference: { book: 2, hadith: 9 } }
  ]
};

test('normalize: groups by reference.book with section names, sorted', () => {
  const norm = loadNormalizer();
  const col = norm(ENG, ARA, { id: 'test', name: 'Sunan Test', desc: 'd' });
  assert.equal(col.books.length, 2);
  assert.deepEqual(col.books.map(b => b.id), [1, 2]);
  assert.equal(col.books[0].name, 'Purification');
  assert.equal(col.books[1].name, 'Book 2'); // section '2' exists in ENG sections? yes -> see next assertion
});
```

Correction applied in file: since `ENG.metadata.sections['2']` is `'Prayer'`, the expected name is `'Prayer'` — write that instead:

```js
  assert.equal(col.books[1].name, 'Prayer');
```

Continue the file:

```js
test('normalize: joins arabic by book:hadith, strips <br>, null when unmatched', () => {
  const norm = loadNormalizer();
  const col = norm(ENG, ARA, { id: 'test', name: 'Sunan Test' });
  const b1 = col.books[0].hadiths;
  assert.equal(b1[0].a, 'عربي واحد extra');
  assert.equal(b1[1].a, 'عربي اثنان');
  assert.equal(col.books[1].hadiths[0].a, null); // eng 2:5 has no arabic match
  assert.equal(col.books[1].hadiths[0].t, 'Unmatched english');
  assert.deepEqual(b1[0], { n: 1, t: 'English one', a: 'عربي واحد extra', b: 1, h: 1 });
});

test('normalize: survives missing ara edition and empty sections', () => {
  const norm = loadNormalizer();
  const col = norm(ENG, null, { id: 'test', name: 'Sunan Test' });
  assert.equal(col.books.length, 2);
  assert.equal(col.books[0].hadiths[0].a, null);
  const col2 = norm({ metadata: {}, hadiths: [{ hadithnumber: 3, text: 'x', reference: { book: 4, hadith: 3 } }] }, null, { id: 'z', name: 'Z' });
  assert.equal(col2.books[0].name, 'Book 4');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/hadith-normalize.test.js`
Expected: FAIL (file missing).

- [ ] **Step 3: Write implementation**

Create `data/hadith-normalize.js`:

```js
(function() {
  function stripTags(s) {
    return String(s).replace(/<br\s*\/?>/gi, ' ').trim();
  }

  function normalizeRemoteEdition(engJson, araJson, meta) {
    meta = meta || {};
    const sections = (engJson && engJson.metadata && engJson.metadata.sections) || {};
    const araMap = {};
    ((araJson && araJson.hadiths) || []).forEach(h => {
      if (!h) return;
      const ref = h.reference || {};
      if (ref.book != null && ref.hadith != null) araMap[ref.book + ':' + ref.hadith] = h.text;
      if (h.arabicnumber != null) araMap['a' + h.arabicnumber] = h.text;
    });
    const books = {};
    const order = [];
    ((engJson && engJson.hadiths) || []).forEach(h => {
      const ref = h.reference || {};
      const b = ref.book != null ? ref.book : 1;
      const hd = ref.hadith != null ? ref.hadith : h.hadithnumber;
      if (!books[b]) {
        books[b] = { id: b, name: sections[String(b)] || ('Book ' + b), hadiths: [] };
        order.push(b);
      }
      const arabic = araMap[b + ':' + hd] != null ? araMap[b + ':' + hd] : (h.arabicnumber != null ? (araMap['a' + h.arabicnumber] != null ? araMap['a' + h.arabicnumber] : null) : null);
      books[b].hadiths.push({
        n: Number(h.hadithnumber) || hd,
        t: h.text || '',
        a: typeof arabic === 'string' ? stripTags(arabic) : null,
        b: b,
        h: hd
      });
    });
    order.sort((x, y) => x - y);
    return {
      id: meta.id,
      name: meta.name || '',
      desc: meta.desc || '',
      remote: true,
      books: order.map(k => books[k])
    };
  }

  window.HadithNormalize = { normalizeRemoteEdition: normalizeRemoteEdition };
})();
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --check data\hadith-normalize.js; node --test tests/hadith-normalize.test.js`
Expected: syntax OK, PASS (3 tests).

---

### Task 4: `features/hadith-library.js` — fetch/join/cache glue

**Files:**
- Create: `features/hadith-library.js`
- Test: `tests/hadith-library.test.js`

**Interfaces:**
- Consumes: `window.ContentCache` (Task 1), `window.HadithNormalize` (Task 3), global `HADITH_COLLECTIONS_DATA` (bundled data).
- Produces: `window.HadithLibrary = { REMOTE_COLLECTIONS, ensureHadithCollection(id) -> Promise<collection|null>, ensureBundledArabic(id) -> Promise<collection|null> }`.
  - `REMOTE_COLLECTIONS` (order matters — this is grid order after the two bundled):
    1. `{id:'abudawud', name:'Sunan Abi Dawud', desc:'One of the Kutub al-Sittah, compiled by Abu Dawud al-Sijistani (d. 889 CE)'}`
    2. `{id:'tirmidhi', name:'Jami at-Tirmidhi', desc:'One of the Kutub al-Sittah, compiled by at-Tirmidhi (d. 892 CE)'}`
    3. `{id:'nasai', name:"Sunan an-Nasa'i", desc:'One of the Kutub al-Sittah, compiled by an-Nasa\u2019i (d. 915 CE)'}`
    4. `{id:'ibnmajah', name:'Sunan Ibn Majah', desc:'One of the Kutub al-Sittah, compiled by Ibn Majah (d. 887 CE)'}`
    5. `{id:'malik', name:'Muwatta Imam Malik', desc:'The earliest written collection of hadith, by Malik ibn Anas (d. 795 CE)'}`
  - `ensureHadithCollection`: bundled ids (`bukhari`,`muslim`) resolve immediately from `HADITH_COLLECTIONS_DATA`; remote ids check `ContentCache.get('col-'+id)` first, then network `GET {CDN}eng-{id}.min.json` + `GET {CDN}ara-{id}.min.json` (ara failure tolerated → `null`), normalized and cached under `'col-'+id`. Concurrent duplicate calls share one in-flight promise. Network failure rejects.
  - `ensureBundledArabic`: lazily fetches `ara-{bukhari|muslim}.min.json` once per session, backfills `a` fields onto bundled hadith objects (match by `b:h` then `'a'+n`), tolerates failure by resolving with the unchanged collection.

- [ ] **Step 1: Write failing wiring-pin test**

Create `tests/hadith-library.test.js`:

```js
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const src = fs.readFileSync(path.join(__dirname, '..', 'features', 'hadith-library.js'), 'utf8');

test('library: targets verified CDN and minified editions', () => {
  assert.ok(src.includes('https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/'));
  assert.ok(src.includes("eng-' + id + '.min.json'"));
  assert.ok(src.includes("ara-' + id + '.min.json'"));
});

test('library: exactly the five remote collections, Musnad Ahmad absent', () => {
  const ids = [...src.matchAll(/id:'([a-z]+)', name:/g)].map(m => m[1]);
  assert.deepEqual(ids, ['abudawud', 'tirmidhi', 'nasai', 'ibnmajah', 'malik']);
  assert.ok(!src.toLowerCase().includes('musnad'));
});

test('library: cache-first with shared in-flight promise and arabic backfill', () => {
  assert.match(src, /ContentCache\.get\('col-' \+ id\)/);
  assert.match(src, /_pending\[id\]/);
  assert.ok(src.includes('ensureBundledArabic'));
  assert.match(src, /window\.HadithLibrary = \{/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/hadith-library.test.js`
Expected: FAIL (file missing).

- [ ] **Step 3: Write implementation**

Create `features/hadith-library.js`:

```js
(function() {
  const CDN = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/';

  const REMOTE_COLLECTIONS = [
    { id: 'abudawud', name: 'Sunan Abi Dawud', desc: 'One of the Kutub al-Sittah, compiled by Abu Dawud al-Sijistani (d. 889 CE)' },
    { id: 'tirmidhi', name: 'Jami at-Tirmidhi', desc: 'One of the Kutub al-Sittah, compiled by at-Tirmidhi (d. 892 CE)' },
    { id: 'nasai', name: "Sunan an-Nasa'i", desc: 'One of the Kutub al-Sittah, compiled by an-Nasa\u2019i (d. 915 CE)' },
    { id: 'ibnmajah', name: 'Sunan Ibn Majah', desc: 'One of the Kutub al-Sittah, compiled by Ibn Majah (d. 887 CE)' },
    { id: 'malik', name: 'Muwatta Imam Malik', desc: 'The earliest written collection of hadith, by Malik ibn Anas (d. 795 CE)' }
  ];

  const BUNDLED_IDS = ['bukhari', 'muslim'];
  const _pending = {};

  function fetchJSON(url) {
    return fetch(url).then(r => {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    });
  }

  function ensureHadithCollection(id) {
    if (BUNDLED_IDS.indexOf(id) !== -1) {
      const bundled = (typeof HADITH_COLLECTIONS_DATA !== 'undefined') ? HADITH_COLLECTIONS_DATA.find(c => c.id === id) : null;
      return Promise.resolve(bundled || null);
    }
    const meta = REMOTE_COLLECTIONS.find(c => c.id === id);
    if (!meta) return Promise.resolve(null);
    if (_pending[id]) return _pending[id];
    _pending[id] = ContentCache.get('col-' + id).then(cached => {
      if (cached) return cached;
      return Promise.all([
        fetchJSON(CDN + 'eng-' + id + '.min.json'),
        fetchJSON(CDN + 'ara-' + id + '.min.json').catch(() => null)
      ]).then(results => {
        const col = HadithNormalize.normalizeRemoteEdition(results[0], results[1], meta);
        return ContentCache.put('col-' + id, col).then(() => col);
      });
    });
    _pending[id].catch(() => {}).finally ? _pending[id].finally(() => { delete _pending[id]; }) : _pending[id].catch(() => {});
    return _pending[id];
  }

  function ensureBundledArabic(id) {
    const col = (typeof HADITH_COLLECTIONS_DATA !== 'undefined') ? HADITH_COLLECTIONS_DATA.find(c => c.id === id) : null;
    if (!col) return Promise.resolve(null);
    if (col._arabicBackfilled) return Promise.resolve(col);
    return fetchJSON(CDN + 'ara-' + id + '.min.json').then(ara => {
      const map = {};
      ((ara && ara.hadiths) || []).forEach(h => {
        if (!h) return;
        const ref = h.reference || {};
        if (ref.book != null && ref.hadith != null) map[ref.book + ':' + ref.hadith] = h.text;
        if (h.arabicnumber != null) map['a' + h.arabicnumber] = h.text;
      });
      (col.books || []).forEach(bk => {
        (bk.hadiths || []).forEach(h => {
          h.a = map[h.b + ':' + h.h] != null ? map[h.b + ':' + h.h].replace(/<br\s*\/?>/gi, ' ').trim() : (map['a' + h.n] != null ? map['a' + h.n].replace(/<br\s*\/?>/gi, ' ').trim() : null);
        });
      });
      col._arabicBackfilled = true;
      return col;
    }).catch(() => col);
  }

  window.HadithLibrary = { REMOTE_COLLECTIONS, ensureHadithCollection, ensureBundledArabic };
})();
```

Implementation note: simplify the awkward pending-clear to:

```js
    const p = _pending[id] = ContentCache.get('col-' + id).then(cached => { /* ...as above... */ });
    p.then(() => { delete _pending[id]; }, () => { delete _pending[id]; });
    return p;
```

Use this cleaner form in the final code (same semantics, no `.finally` dependency).

- [ ] **Step 4: Verify against live CDN (one-time sanity)**

Run:
```powershell
$r = Invoke-WebRequest -Uri 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/eng-abudawud.min.json' -Method Head -UseBasicParsing -TimeoutSec 30; $r.StatusCode
```
Expected: `200`. If non-200, STOP and report (source contract broken).

- [ ] **Step 5: Run test to verify it passes**

Run: `node --check features\hadith-library.js; node --test tests/hadith-library.test.js`
Expected: syntax OK, PASS (3 tests).

---

### Task 5: Integrate remote collections into `renderHadith` + hadith TTS

**Files:**
- Modify: `render/dynamic.js` (hadith section ~lines 820–883, exports ~line 943–951)
- Modify: `index.html` (add `<script src="features/hadith-library.js" defer></script>` in the deferred block; bump `render/dynamic.js` query `?v=3` → `?v=4`)
- Test: `tests/html.test.js` additions come in Task 8 (single bump task keeps versions coherent); here only add renderer assertions to a new block in `tests/hadith-library.test.js`.

**Interfaces:**
- Consumes: `window.HadithLibrary` (Task 4), `window.AppAudio` (Task 2), `S.hadithTTSLang` (added in Task 7 — reference it defensively as `(S.hadithTTSLang || 'ar')` so this task stays green before Task 7 lands).
- Produces: `window.hadithSpeak(collectionId, bookRef, hadithRef)`; merged-collection helper `_allCollections()` used by `renderHadith`; loading-state handling in `openHadithCollection(id)`; runtime registry `_remoteCols` (id → loaded collection object).

- [ ] **Step 1: Add failing wiring assertions**

Append to `tests/hadith-library.test.js`:

```js
test('renderer: hadith UI wires library + audio', () => {
  const dyn = fs.readFileSync(path.join(__dirname, '..', 'render', 'dynamic.js'), 'utf8');
  assert.match(dyn, /HadithLibrary\.ensureHadithCollection\(/);
  assert.match(dyn, /HadithLibrary\.ensureBundledArabic\(/);
  assert.match(dyn, /AppAudio\.toggleTTS\(/);
  assert.match(dyn, /window\.hadithSpeak = hadithSpeak;/);
  assert.match(dyn, /Online<\/span>/, 'remote cards carry an Online badge');
});
```

Run: `node --test tests/hadith-library.test.js`
Expected: new test FAILS (dynamic.js untouched yet).

- [ ] **Step 2: Rework the hadith section in `render/dynamic.js`**

Replace the block from `let hadithView = { level: 'collections', ... }` through `function hadithBack() {...}` (currently lines 820–883) with:

```js
  let hadithView = { level: 'collections', collectionId: null, bookId: null };
  const _remoteCols = {};

  function _allCollections() {
    const bundled = (typeof HADITH_COLLECTIONS_DATA !== 'undefined') ? HADITH_COLLECTIONS_DATA : [];
    const remoteMeta = (typeof HadithLibrary !== 'undefined') ? HadithLibrary.REMOTE_COLLECTIONS : [];
    return bundled.concat(remoteMeta.map(m => _remoteCols[m.id] || Object.assign({ remotePending: true, remote: true, books: [] }, m)));
  }

  function _findHadith(colId, b, h) {
    const col = _allCollections().find(c => c.id === colId);
    if (!col) return null;
    for (const bk of (col.books || [])) {
      const hit = bk.hadiths.find(x => String(x.h) === String(h) && String(x.b) === String(b));
      if (hit) return { col, hadith: hit };
    }
    return null;
  }

  function hadithSpeak(colId, b, h) {
    const found = _findHadith(colId, b, h);
    if (!found || !found.hadith) return;
    const attempt = () => {
      const cur = _findHadith(colId, b, h);
      const arabic = cur && cur.hadith.a;
      if (!arabic) { toast(iqIcon('music'), 'Arabic text unavailable for this narration', false, 1800); return; }
      const ok = AppAudio.toggleTTS(arabic, S.hadithTTSLang || 'ar');
      if (!ok) toast(iqIcon('music'), 'No Arabic voice installed on this device', false, 2200);
    };
    if (found.col.remotePending || !found.hadith.a) {
      const loader = (colId === 'bukhari' || colId === 'muslim')
        ? HadithLibrary.ensureBundledArabic(colId)
        : HadithLibrary.ensureHadithCollection(colId);
      loader.then(col => { if (col && !_remoteCols[colId] && col.remote) _remoteCols[colId] = col; attempt(); })
        .catch(() => { toast(iqIcon('music'), 'Could not download audio text — check connection', false, 2200); });
      return;
    }
    attempt();
  }
```

Then modify `renderHadith()`:

In the **hadiths level** branch, replace the hadith card template with (adds relative positioning, Arabic line, speaker button):

```js
      book.hadiths.forEach(h => {
        const hasA = !!h.a;
        html += `<div class="verse-card" style="position:relative;">
          <div class="verse-num">${h.n}</div>
          ${hasA ? `<div dir="rtl" style="font-family:'Amiri',serif;font-size:1.25rem;line-height:1.9;color:var(--accent);margin-bottom:10px;">${h.a}</div>` : ''}
          <div class="verse-english">${h.t}</div>
          <div class="content-source">${iqIcon('book-open')} ${col.name} ${h.b}:${h.h}<a class="verify-btn" href="https://sunnah.com/${col.id}/${h.b}#${h.n}" target="_blank" rel="noopener noreferrer" title="Verify on sunnah.com">Verify</a></div>
          ${hasA ? `<button type="button" class="sit-fav-btn" aria-label="Listen" title="Listen (Arabic)" style="position:absolute;top:8px;right:8px;background:none;border:none;cursor:pointer;padding:6px;font-size:1rem;line-height:1;color:var(--accent);" onclick="event.stopPropagation();App.hadithSpeak('${col.id}',${Number(h.b)},${Number(h.h)})">${iqIcon('music')}</button>` : ''}
        </div>`;
      });
```

In the **collections level**, replace the `data.forEach` loop with:

```js
    _allCollections().forEach(c => {
      const total = (c.books || []).reduce((s, b) => s + b.hadiths.length, 0);
      const pending = !!c.remotePending;
      const badge = pending ? '<span style="float:right;font-size:0.62rem;background:rgba(201,168,76,0.18);color:var(--accent-light);padding:2px 8px;border-radius:10px;">Online</span>' : '';
      html += `<div class="surah-card" onclick="App.openHadithCollection('${c.id}')">
        <div class="surah-num">${iqIcon(c.icon || colIconFor(c.id))}${badge}</div>
        <div class="surah-name-en">${c.name}</div>
        <div class="surah-meta">${pending ? 'Tap to download' : (c.books.length + ' books · ' + total + ' hadiths')}</div>
        <div style="font-size:0.72rem;color:var(--text2);margin-top:4px;line-height:1.4;">${c.desc}</div>
      </div>`;
    });
```

Add tiny helpers just above `renderHadith`:

```js
  function colIconFor(id) {
    return ({ abudawud: 'scroll', tirmidhi: 'scroll', nasai: 'scroll', ibnmajah: 'scroll', malik: 'scale' })[id] || 'book';
  }
```

(Verify `'scroll'` and `'scale'` resolve in `data/icons.js` `IQ_IDS`; if either is missing, fall back to `'book-open'` which is proven. Unknown keys silently render empty — check before finishing.)

Replace `openHadithCollection`:

```js
  function openHadithCollection(id) {
    const col = _allCollections().find(c => c.id === id);
    if (col && !col.remotePending) { hadithView = { level: 'books', collectionId: id, bookId: null }; renderHadith(); return; }
    el = document.getElementById('hadithArea');
    if (el) el.innerHTML = '<div class="quran-header"><h2>' + iqIcon('book') + ' Downloading…</h2><div class="quran-sub">Fetching collection from the online library</div></div>';
    HadithLibrary.ensureHadithCollection(id).then(loaded => {
      if (loaded && loaded.remote) _remoteCols[id] = loaded;
      hadithView = { level: 'books', collectionId: id, bookId: null };
      renderHadith();
    }).catch(() => {
      toast(iqIcon('book'), 'Could not download collection — check connection', false, 2400);
      hadithView = { level: 'collections', collectionId: null, bookId: null };
      renderHadith();
    });
  }
```

(`el` must be declared: use `const el = document.getElementById('hadithArea');` — do not create an implicit global.)

Add to the WINDOW EXPORTS block:

```js
  window.hadithSpeak = hadithSpeak;
```

- [ ] **Step 3: Syntax check + targeted tests**

Run: `node --check render\dynamic.js; node --test tests/hadith-library.test.js`
Expected: syntax OK, all PASS including the new renderer-wiring test.

- [ ] **Step 4: Manual smoke (optional here, mandatory in Task 8)**

Serve locally (`python -m http.server` or your usual server), open Hadith tab, download Sunan Abi Dawud offline-first-run, confirm books render and a speaker tap produces Arabic audio.

---

### Task 6: Dhikr audio — generated map + speaker buttons

**Files:**
- Create: `data/dhikr-audio-map.js` (generated)
- Modify: `render/static.js` (renderMorning ~295, renderEvening ~333, renderSituationalDhikr detail branch ~379)
- Modify: `core/actions.js` OR keep handlers in `static.js` — handlers `dhikrSpeak`/`dhikrPlayAll` are defined in `static.js` beside the renderers and exported on `window.App` there if `App` exists yet, else on `window` directly consumed via `App.x` aliasing already established by actions.js (follow how existing `toggleMorning` reaches `App.toggleMorning` — mirror that exact mechanism; if `App` assembly lives in actions.js, add these two delegations there too).

**Interfaces:**
- Consumes: globals `MORNING_DHIKR`, `EVENING_DHIKR` (data/morning-evening.js), `SITUATIONAL_DHIKR` (data/relatable-dhikr.js), `DHIKR_AUDIO_MAP` (this task), `AppAudio` (Task 2).
- Produces: `window.DHIKR_AUDIO_MAP = { morning: (string|null)[], evening: (string|null)[], situational: { [categoryKey]: (string|null)[] } }` — arrays index-aligned with the dhikr arrays; `window.dhikrSpeak(kind, catKeyOrIdx, idx?)`, `window.dhikrPlayAll(kind)`.

- [ ] **Step 1: Fetch hisnmuslim item JSONs for candidate categories**

Relevant category IDs from the verified index (title → ID): Morning&Evening=27, Sleep=28, Waking=1, Anger=82, Grief/Worry=34, Distress=35, Fear of people=39, Debt=41, Rain=63/64/65, Travel=95/96/97, Food=69/70, Illness=124, Sins=44, Waswas in faith=40, Anxiety-at-night=30.

```powershell
New-Item -ItemType Directory -Force -Path "$env:TEMP\opencode\hisn" | Out-Null
foreach ($id in @(27,28,34,35,39,40,41,44,63,64,65,69,70,82,95,96,97,124,30,1)) {
  Invoke-WebRequest -Uri "https://www.hisnmuslim.com/api/ar/$id.json" -OutFile "$env:TEMP\opencode\hisn\$id.json" -UseBasicParsing -TimeoutSec 30
}
Get-ChildItem "$env:TEMP\opencode\hisn" | Measure-Object | Select-Object Count
```

Expected: `Count: 20`.

- [ ] **Step 2: Read `data/relatable-dhikr.js` and note the exact `SITUATIONAL_DHIKR` category keys and item counts** (e.g., `anxiety`, `grief`, …). Record them; they parameterize the generator in Step 3.

- [ ] **Step 3: Generate the map**

Write a throwaway generator to `$env:TEMP\opencode\hisn\gen.js` (adapt `CATEGORY_FOR` after Step 2's findings; example assumes keys `grief`, `distress`, `anger`, `fear`, `debt`, `illness`, `travel`, `food`):

```js
const fs = require('fs');
const P = process.env.TEMP + '\\opencode\\hisn\\';
const load = id => JSON.parse(fs.readFileSync(P + id + '.json', 'utf8'));
// Each item JSON is an array of {ARABIC_TEXT, AUDIO_URL, TEXT?, REPEAT?}
function norm(s) { return String(s || '').replace(/[\u064B-\u065F\u0670]/g, '').replace(/\s+/g, ' ').trim(); }
function findItem(arabicText, poolItems) {
  const target = norm(arabicText).slice(0, 25);
  return poolItems.find(it => norm(it.ARABIC_TEXT).includes(target));
}
const morningPool = load(27), sleepPool = load(28);
const MORNING = /* paste current MORNING_DHIKR arabic strings */;
const EVENING = /* paste current EVENING_DHIKR arabic strings */;
const out = {
  morning: MORNING.map(a => { const m = findItem(a, morningPool) || findItem(a, sleepPool); return m ? m.AUDIO_URL.replace(/^http:/, 'https:') : null; }),
  evening: EVENING.map(a => { const m = findItem(a, morningPool) || findItem(a, sleepPool); return m ? m.AUDIO_URL.replace(/^http:/, 'https:') : null; }),
  situational: {}
};
/* For each situational category key K mapped to hisn ID list IDS:
   out.situational[K] = items.map(a => first URL found across IDS pools, else null); */
fs.writeFileSync(P + 'dhikr-audio-map.body.js', '// Generated from hisnmuslim.com item APIs (Hisn al-Muslim). Index-aligned; null = TTS fallback.\nconst DHIKR_AUDIO_MAP = ' + JSON.stringify(out, null, 2) + ';\nwindow.DHIKR_AUDIO_MAP = DHIKR_AUDIO_MAP;\n');
console.log(fs.readFileSync(P + 'dhikr-audio-map.body.js', 'utf8'));
```

Copy the emitted body verbatim into `data/dhikr-audio-map.js`. Every `morning`/`evening` slot MUST end up either a valid `https://www.hisnmuslim.com/audio/...mp3` URL or explicitly `null`; do not hand-invent URLs. Sanity-check at least three emitted URLs with `Invoke-WebRequest -Method Head` expecting `200`.

- [ ] **Step 4: Add failing renderer wiring test**

Append to `tests/hadith-library.test.js`:

```js
test('dhikr: speakers wired in static renderers with stopPropagation', () => {
  const st = fs.readFileSync(path.join(__dirname, '..', 'render', 'static.js'), 'utf8');
  assert.match(st, /App\.dhikrSpeak\('morning'/);
  assert.match(st, /App\.dhikrSpeak\('evening'/);
  assert.match(st, /App\.dhikrSpeak\('situational'/);
  assert.match(st, /App\.dhikrPlayAll\('morning'\)/);
  assert.match(st, /event\.stopPropagation\(\);App\.dhikrSpeak/);
});
```

Run: `node --test tests/hadith-library.test.js`
Expected: new test FAILS.

- [ ] **Step 5: Wire buttons into `render/static.js`**

Define near the top of the dhikr area of `static.js`:

```js
  function _dhikrAudioUrl(kind, catKey, idx) {
    if (typeof DHIKR_AUDIO_MAP === 'undefined') return null;
    if (kind === 'situational') {
      const arr = DHIKR_AUDIO_MAP.situational && DHIKR_AUDIO_MAP.situational[catKey];
      return (arr && arr[idx]) || null;
    }
    const arr = DHIKR_AUDIO_MAP[kind];
    return (arr && arr[idx]) || null;
  }

  function _dhikrSeqItems(kind, catKey) {
    const pool = kind === 'morning' ? MORNING_DHIKR : kind === 'evening' ? EVENING_DHIKR : (SITUATIONAL_DHIKR[catKey] ? SITUATIONAL_DHIKR[catKey].dhikr : []);
    return pool.map((item, i) => {
      const url = _dhikrAudioUrl(kind, catKey, i);
      return url ? { url } : { tts: item.arabic, lang: 'ar' };
    });
  }

  function dhikrSpeak(kind, catKey, idx) {
    const item = kind === 'morning' ? MORNING_DHIKR[idx] : kind === 'evening' ? EVENING_DHIKR[idx] : (SITUATIONAL_DHIKR[catKey] ? SITUATIONAL_DHIKR[catKey].dhikr[idx] : null);
    if (!item) return;
    const url = _dhikrAudioUrl(kind, catKey, idx);
    if (url) { AppAudio.playRecording(url); return; }
    const ok = AppAudio.toggleTTS(item.arabic, 'ar');
    if (!ok) toast(iqIcon('music'), 'No Arabic voice installed on this device', false, 2200);
  }

  function dhikrPlayAll(kind, catKey) {
    AppAudio.playSequence(_dhikrSeqItems(kind, catKey));
  }
  window.dhikrSpeak = dhikrSpeak;
  window.dhikrPlayAll = dhikrPlayAll;
```

(If `App.dhikrSpeak` delegation is required by the actions.js pattern, add matching delegations in `core/actions.js` exactly mirroring how `toggleMorning` is exposed.)

In `renderMorning()` add a Play-all control right after the section-title div and a speaker button inside each card (mirroring the proven `sit-fav-btn` pattern with `event.stopPropagation()`):

```js
    h += `<button type="button" class="quran-back-btn" style="margin-bottom:12px;" onclick="App.dhikrPlayAll('morning')">${iqIcon('music')} Play all</button>`;
```

Card addition (inside the `vol-card`, before `<div class="prayer-xp">`):

```js
            <button type="button" aria-label="Listen" style="background:none;border:none;cursor:pointer;padding:6px;font-size:1rem;color:var(--accent);" onclick="event.stopPropagation();App.dhikrSpeak('morning','',${idx})">${iqIcon('music')}</button>
```

Apply identical edits in `renderEvening()` (`'evening'`) and in the situational detail loop (`'situational'`, passing `'_situationalView'` value as catKey via template interpolation `'${_situationalView}'`, and a Play-all button using `onclick="App.dhikrPlayAll('situational','${_situationalView}')"`).

- [ ] **Step 6: Syntax check + targeted test**

Run: `node --check render\static.js; node --check data\dhikr-audio-map.js; node --test tests/hadith-library.test.js`
Expected: syntax OK, all PASS.

---

### Task 7: State field + script wiring + cache bumps

**Files:**
- Modify: `state/state.js` (freshState, line ~38)
- Modify: `index.html` (script tags; version bumps)
- Modify: `sw.js` (line 6)
- Modify: `tests/html.test.js` (pinned version + new tag assertions)

**Interfaces:**
- Consumes: everything above.
- Produces: users get `S.hadithTTSLang` ('ar' default) via freshState/normalizeState backfill; all new modules load in correct order; caches invalidated coherently.

- [ ] **Step 1: Add state field**

In `state/state.js` `freshState()`, change:

```js
      quranAudioReciter:7,
```

to:

```js
      quranAudioReciter:7, hadithTTSLang:'ar',
```

(normalizeState backfills for existing saves automatically; no schemaVersion bump needed — no data-shape transform.)

- [ ] **Step 2: Update index.html**

Insert into the data block (after `<script src="data/morning-evening.js?v=3"></script>`):

```html
<script src="data/dhikr-audio-map.js?v=1"></script>
<script src="data/hadith-normalize.js?v=1"></script>
```

Insert into the core block (immediately after `<script src="core/storage.js"></script>`, BEFORE `state/state.js`):

```html
<script src="core/content-cache.js?v=1"></script>
<script src="core/audio.js?v=1"></script>
```

Insert into the deferred features block (near `features/search.js`):

```html
<script src="features/hadith-library.js?v=1" defer></script>
```

Bump queries on modified assets: `render/static.js?v=2` → `v=3`, `render/dynamic.js?v=3` → `v=4`, `state/state.js?v=4` → `v=5`, and the SW registration `sw.js?v=19` → `sw.js?v=20`. If Task 6 touched `core/actions.js`, bump its `?v=16` → `v=17`.

- [ ] **Step 3: Bump service worker cache**

In `sw.js:6` change `const CACHE_NAME = 'iq-cache-v19';` → `const CACHE_NAME = 'iq-cache-v20';`

- [ ] **Step 4: Update tests/html.test.js**

Update the pinned assertion to `navigator.serviceWorker.register('sw.js?v=20')` and add:

```js
assert.ok(html.includes('<script src="core/content-cache.js?v=1"></script>'));
assert.ok(html.includes('<script src="core/audio.js?v=1"></script>'));
assert.ok(html.includes('<script src="data/hadith-normalize.js?v=1"></script>'));
assert.ok(html.includes('<script src="data/dhikr-audio-map.js?v=1"></script>'));
assert.ok(html.includes('<script src="features/hadith-library.js?v=1" defer></script>'));
assert.ok(html.indexOf('core/content-cache.js') < html.indexOf('state/state.js'), 'cache module loads before state');
assert.ok(html.indexOf('core/audio.js') < html.indexOf('render/static.js'), 'audio module loads before renderers');
```

- [ ] **Step 5: Full suite + syntax sweep**

Run: `node --test`
Expected: ALL PASS (~350+ tests).

Run: `node --check state\state.js; node --check render\static.js; node --check render\dynamic.js; node --check sw.js`
Expected: clean.

---

### Task 8: End-to-end verification (browser smoke via iq-qa agent)

**Files:** none created; verification only.

**Interfaces:**
- Consumes: finished Tasks 1–7.

- [ ] **Step 1: Serve the app locally** and open it (any static server; e.g. `python -m http.server 8080` in project root).

- [ ] **Step 2: Dispatch the `iq-qa` subagent** to verify:
  1. Hadith tab shows 7 collections; Bukhari/Muslim open instantly.
  2. Sunan Abi Dawud downloads on first open (network), books + hadiths render, Arabic line visible, Verify links work.
  3. Reload page, go offline (DevTools), reopen Abi Dawud — serves from cache.
  4. Speaker on a Bukhari hadith triggers Arabic TTS after one-time Arabic backfill; second tap stops.
  5. Morning adhkar: per-item speaker plays recording (or TTS fallback), Play-all sequences; Evening + one Situational category same.
  6. No console errors; export/import round-trip still excludes cache DB; XP/state intact.

- [ ] **Step 3: Fix any findings, re-run `node --test`, confirm green.**

---

## Self-Review Notes

- **Spec coverage:** 7 collections (Tasks 4–5) ✓; Arabic+English join (Task 3) ✓; hadith TTS + fallback toast (Tasks 2, 5) ✓; bundled Arabic backfill (Task 4) ✓; dhikr recordings + Play-all + TTS fallback (Task 6) ✓; mixed-content resolved via verified HTTPS (Global Constraints) ✓; state field (Task 7) ✓; cache discipline (Task 7) ✓; error handling paths (Tasks 4–6 catch/toast branches) ✓; testing incl. QA agent (Tasks 1–8) ✓. Deliberate deviation from spec §Error-handling: "no Arabic voice" shows a toast only (no English narration prompt) — reading translated *instructions* aloud harms UX; recorded in spec-risk language, flag to user at execution review.
- **Placeholder scan:** Task 6 Steps 1–3 are data-driven generation with exact commands, adapter points identified from real inputs (category keys recorded in Step 2 before generating); no TBDs remain elsewhere.
- **Type consistency:** `ContentCache.get/put`, `HadithNormalize.normalizeRemoteEdition`, `HadithLibrary.{REMOTE_COLLECTIONS,ensureHadithCollection,ensureBundledArabic}`, `AppAudio.{toggleTTS,playRecording,playSequence,stopAllAudio}`, `DHIKR_AUDIO_MAP.{morning,evening,situational}`, `hadithSpeak(colId,b,h)`, `dhikrSpeak(kind,catKey,idx)` used consistently across tasks/tests.
