# Multi-Tafsir + Qudsi + Dhikr Play/Stop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Per-verse tafsir (Ibn Kathir EN on demand + Jalalayn AR whole-edition cache) with an edition selector in the Quran reader; Forty Hadith Qudsi as sixth remote collection; exact-portion dhikr audio with Quran-style play/stop toggles on individual dhikr cards.

**Architecture:** Reuse the established remote+IDB-cache pattern (`ContentCache`, in-flight dedup, normalize-on-fetch). One new deferred feature (`features/tafsir-library.js`), one extension to `core/audio.js` (source tracking for play/stop state), regeneration of the dhikr audio map under strict matching, and UI integration in `render/dynamic.js` (tafsir) and `render/static.js` (toggles).

**Tech Stack:** Vanilla JS IIFEs → `window.*`, IndexedDB via ContentCache, fetch, Node built-in test runner.

**Spec:** `docs/superpowers/specs/2026-08-25-tafsir-qudsi-dhikr-design.md`

## Global Constraints

- Vanilla JS, no build step; IIFE modules export to `window.*`; script order data → pools → core/storage → core/content-cache → core/audio → state → render → deferred features → core/actions LAST.
- New state fields MUST go in `freshState()` (state/state.js); normalizeState backfills.
- Cache discipline: every changed asset referenced with `?v=` gets bumped together with `CACHE_NAME` (sw.js) and the pinned assertions in tests/html.test.js. Current versions at plan time: main.css v17, actions v17, static v3, dynamic v5, state v5, audio v2, hadith-library v1, dhikr-audio-map v1, sw reg v21, CACHE_NAME iq-cache-v21.
- Escape user-entered strings; remote dataset text is trusted-pool but tafsir HTML passes through `sanitizeRichText` before innerHTML.
- sw.js only intercepts same-origin requests — never add API/CDN/audio URLs to it.
- Tests: `node --test` from root (352 passing at plan time). PowerShell 5.1: no `&&`, quote globs.
- Existing pinned test regexes that must keep matching after edits:
  - tests/audio.test.js: `/stopTTS\(\);\s*\n?\s*if \(typeof window\.stopSurah === 'function'\) window\.stopSurah\(\);/` (inside playRecording)
  - tests/hadith-library.test.js id-list regex `/id:'([a-z]+)', name:/g` (literals formatted without space after `id:`)
  - tests/hadith-library.test.js: `/ContentCache\.get\('col-' \+ id\)/`, `/_pending\[id\]/`, `/window\.HadithLibrary = \{/`
  - tests/html.test.js ordering assertions (content-cache before state/state.js; audio before render/static.js)
- Committing approved on branch `tafsir-qudsi-dhikr-audio`; one commit per task, conventional-commit style.

## File Structure

| File | Status | Responsibility |
|---|---|---|
| `features/hadith-library.js` | Modify | Append qudsi meta (Task 1). |
| `core/audio.js` | Modify | Source tracking: `_currentId`, `currentId()`, `setOnChange(fn)`, options-object params (Task 2). |
| `data/dhikr-audio-map.js` | Regenerate | Strict exact-match URLs only (Task 3). |
| `render/static.js` | Modify | Play/stop toggle buttons + refresh handler (Task 3). |
| `features/tafsir-library.js` | Create | Editions, per-ayah + whole-edition loading, sanitizer (Task 4). |
| `tests/tafsir-library.test.js` | Create | Sanitizer + index-math fixtures (Task 4). |
| `state/state.js` | Modify | `tafsirEdition:'ibnkathir'` (Task 5). |
| `render/dynamic.js` | Modify | Selector, verse-card Tafsir toggle + panels (Task 5). |
| `core/actions.js` | Modify | App delegations: `toggleTafsir`, `setTafsirEdition`, `dhikrToggle` (Task 5/6 whichever lands first — final wiring task reconciles). |
| `styles/main.css` | Modify | `.verse-tafsir-btn`, `.tafsir-panel`, `.dhikr-play-btn.active` styles (Task 6). |
| `index.html`, `sw.js`, `tests/html.test.js` | Modify | Tags + version bumps to coherent set (Task 6). |

---

### Task 1: Qudsi collection

**Files:**
- Modify: `features/hadith-library.js` (REMOTE_COLLECTIONS array)
- Test: `tests/hadith-library.test.js`

**Interfaces:**
- Produces: `REMOTE_COLLECTIONS` length 6, ending `{ id: 'qudsi', name: 'Forty Hadith Qudsi', desc: 'Forty narrations in which the Prophet ﷺ transmits meanings from Allah directly' }`.

- [ ] **Step 1: Update the failing assertion**

In `tests/hadith-library.test.js`, change:

```js
test('library: exactly the five remote collections, Musnad Ahmad absent', () => {
  const ids = [...src.matchAll(/id:'([a-z]+)', name:/g)].map(m => m[1]);
  assert.deepEqual(ids, ['abudawud', 'tirmidhi', 'nasai', 'ibnmajah', 'malik']);
```

to:

```js
test('library: exactly the six remote collections, Musnad Ahmad absent', () => {
  const ids = [...src.matchAll(/id:'([a-z]+)', name:/g)].map(m => m[1]);
  assert.deepEqual(ids, ['abudawud', 'tirmidhi', 'nasai', 'ibnmajah', 'malik', 'qudsi']);
```

(keep the musnad assertion lines unchanged)

- [ ] **Step 2: Run test — expect FAIL** (`node --test tests/hadith-library.test.js`)

- [ ] **Step 3: Append qudsi entry**

In `features/hadith-library.js` REMOTE_COLLECTIONS, after the malik line add (same formatting, no space after `id:`):

```js
    { id: 'qudsi', name: 'Forty Hadith Qudsi', desc: 'Forty narrations in which the Prophet \uFDFA transmits meanings from Allah directly' }
```

(add comma after the malik object; `\uFDFA` is the ﷺ ligature, keeping the file pure ASCII like Task 3's fixture convention)

- [ ] **Step 4: Run test — PASS; commit** `feat: add Forty Hadith Qudsi remote collection`

---

### Task 2: Audio source tracking

**Files:**
- Modify: `core/audio.js`
- Test: `tests/audio.test.js` (append)

**Interfaces:**
- Produces (additions only, existing surface unchanged): `AppAudio.currentId() -> string|null`, `AppAudio.setOnChange(fn)`; `playRecording(url, optsOrOnended?)` where opts is `{id?, onended?}` or a bare function (legacy); `playTTS(text, lang, opts?)` / `toggleTTS(text, lang, opts?)` with optional `{id}`.

- [ ] **Step 1: Append failing tests**

```js
test('audio: source tracking lifecycle', () => {
  const AppAudio = evalModule();
  assert.equal(typeof AppAudio.currentId, 'function');
  assert.equal(typeof AppAudio.setOnChange, 'function');
  assert.equal(AppAudio.currentId(), null);
});

test('audio: playRecording accepts options object with id (signature shape)', () => {
  const src2 = fs.readFileSync(path.join(__dirname, '..', 'core', 'audio.js'), 'utf8');
  assert.match(src2, /function playRecording\(url, opts\)/);
  assert.match(src2, /function currentId\(\)/);
  assert.match(src2, /function setOnChange\(fn\)/);
  assert.match(src2, /_fireChange\(\);/, 'state changes fire the change callback');
});
```

Note: `evalModule` must be defined before these tests OR hoisted — it already exists as a function declaration in the file; appending tests after it is fine.

- [ ] **Step 2: FAIL check** (`node --test tests/audio.test.js`)

- [ ] **Step 3: Implement**

In `core/audio.js`:

1. Add module vars next to `seqActive`: `let _currentId = null; let _onChangeFn = null;`
2. Add helpers (anywhere above exports):

```js
  function _fireChange() { if (_onChangeFn) { try { _onChangeFn(); } catch (e) {} } }

  function _applyOpts(opts) {
    if (typeof opts === 'function') return { onended: opts };
    return opts || {};
  }

  function currentId() { return _currentId; }
  function setOnChange(fn) { _onChangeFn = typeof fn === 'function' ? fn : null; }
```

3. Rework `playRecording(url, opts)` (KEEP the two pinned lines exactly):

```js
  function playRecording(url, opts) {
    opts = _applyOpts(opts);
    stopTTS();
    if (typeof window.stopSurah === 'function') window.stopSurah();
    stopRecording();
    recAudio = new Audio(url);
    recAudio.onended = function() {
      _currentId = null;
      if (opts.onended) opts.onended();
      _fireChange();
    };
    _currentId = opts.id || null;
    recAudio.play().catch(() => {});
    _fireChange();
    return recAudio;
  }
```

4. `speak(text, lang, onend)` gains a 4th param `id`: inside success path after `window.speechSynthesis.speak(u);` add `_currentId = id || null; _fireChange();` and extend the utterance end: replace `if (onend) u.onend = onend;` with:

```js
    u.onend = function() {
      if (_currentId === (id || null)) _currentId = null;
      if (onend) onend();
      _fireChange();
    };
```

(If `u.onerror` fires, also clear id: `u.onerror = function() { if (_currentId === (id || null)) _currentId = null; _fireChange(); };`)

5. Thread ids through: `playTTS(text, lang, opts)` / `toggleTTS(text, lang, opts)` pass `(opts && opts.id)` as speak's 4th arg; sequence items may carry `id` — in `_seqNext`, pass `it.id` through both branches (`playRecording(it.url, { id: it.id, onended: advance })`, `speak(it.tts, it.lang || 'ar', advance, it.id)`).
6. `stopAllAudio()` adds `_currentId = null;` before `_fireChange();` (add fire at its end).
7. Export line becomes:

```js
  window.AppAudio = { pickArabicVoice, playTTS, toggleTTS, stopTTS, playRecording, playSequence, stopAllAudio, isBusy, isSpeaking, currentId, setOnChange };
```

- [ ] **Step 4: PASS full audio tests + suite spot-check; commit** `feat: audio source tracking for play/stop state`

---

### Task 3: Strict dhikr map + play/stop toggles

**Files:**
- Regenerate: `data/dhikr-audio-map.js`
- Modify: `render/static.js` (dhikr handlers + button markup)
- Test: `tests/hadith-library.test.js` (replace the dhikr wiring test block)

**Interfaces:**
- Consumes: `AppAudio.currentId/setOnChange` (Task 2), hisnmuslim item JSONs (re-fetched).
- Produces: `DHIKR_AUDIO_MAP` same shape, strict-filtered; `window.dhikrToggle(kind, catKey, idx)` replacing `dhikrSpeak` semantics (keep `dhikrSpeak` name to limit churn — decision: KEEP exported names `dhikrSpeak`/`dhikrPlayAll`, change behavior to toggle + tracked ids).

- [ ] **Step 1: Update pinned test** — in the dhikr wiring test, replace the three `App\.dhikrSpeak` regexes' expectations to ALSO require data-id attributes and stop-state support:

```js
test('dhikr: speakers wired in static renderers with stopPropagation', () => {
  const st = fs.readFileSync(path.join(__dirname, '..', 'render', 'static.js'), 'utf8');
  assert.match(st, /App\.dhikrSpeak\('morning'/);
  assert.match(st, /App\.dhikrSpeak\('evening'/);
  assert.match(st, /App\.dhikrSpeak\('situational'/);
  assert.match(st, /App\.dhikrPlayAll\('morning'\)/);
  assert.match(st, /event\.stopPropagation\(\);App\.dhikrSpeak/);
  assert.match(st, /data-dhikr-id=/, 'buttons carry source ids');
  assert.match(st, /AppAudio\.setOnChange\(/, 'registers refresh handler');
  assert.match(st, /function refreshDhikrButtons\(\)/);
});
```

Run: FAIL expected.

- [ ] **Step 2: Regenerate the map strictly**

Re-fetch item JSONs exactly as before into `$env:TEMP\opencode\hisn\` (IDs 27,28,34,35,39,40,41,44,63,64,65,69,70,82,95,96,97,124,30,1), then regenerate with the STRICT rule — same generator structure as the prior plan's Task 6 but the match predicate becomes exact equality after normalization:

```js
function norm(s) { return String(s || '').replace(/[\u064B-\u065F\u0670\u0640]/g, '').replace(/\s+/g, ' ').trim(); }
function findExact(arabicText, poolItems) {
  const target = norm(arabicText);
  return poolItems.find(it => norm(it.AUDIO) === target);
}
```

No substring/prefix fallbacks. Every slot is either an exact-match URL (http:→https:) or `null`. Sanity-check 3 surviving URLs with HEAD (expect 200). Record before/after slot counts in the report (expect fewer matches than the previous 27/49).

- [ ] **Step 3: Wire toggles in render/static.js**

Replace the dhikr handler section (added by the prior branch) with:

```js
  function _dhikrSrcId(kind, catKey, idx) {
    return kind === 'situational' ? 'dhikr-situational-' + catKey + '-' + idx : 'dhikr-' + kind + '-' + idx;
  }

  function dhikrSpeak(kind, catKey, idx) {
    const id = _dhikrSrcId(kind, catKey, idx);
    if (AppAudio.currentId() === id) { AppAudio.stopAllAudio(); return; }
    const item = kind === 'morning' ? MORNING_DHIKR[idx] : kind === 'evening' ? EVENING_DHIKR[idx] : (SITUATIONAL_DHIKR[catKey] ? SITUATIONAL_DHIKR[catKey].dhikr[idx] : null);
    if (!item) return;
    const url = _dhikrAudioUrl(kind, catKey, idx);
    if (url) { AppAudio.playRecording(url, { id: id }); return; }
    const ok = AppAudio.toggleTTS(item.arabic, 'ar', { id: id });
    if (!ok) toast(iqIcon('music'), 'No Arabic voice installed on this device', false, 2200);
  }

  function dhikrPlayAll(kind, catKey) {
    const items = _dhikrSeqItems(kind, catKey).map(it => Object.assign({ id: 'dhikr-playall-' + kind }, it));
    AppAudio.playSequence(items);
  }

  function refreshDhikrButtons() {
    document.querySelectorAll('[data-dhikr-id]').forEach(b => {
      const active = AppAudio.currentId() === b.getAttribute('data-dhikr-id');
      b.innerHTML = active ? iqIcon('x') : iqIcon('music');
      b.classList.toggle('playing', active);
    });
  }
  AppAudio.setOnChange(refreshDhikrButtons);
  window.dhikrSpeak = dhikrSpeak;
  window.dhikrPlayAll = dhikrPlayAll;
```

Button markup in all three card loops becomes (example morning; situational passes `'${_situationalView}'` and `${entry.idx}`):

```js
<button type="button" class="sit-fav-btn dhikr-play-btn${AppAudio.currentId()===_dhikrSrcId('morning','',idx)?' playing':''}" aria-label="${AppAudio.currentId()===_dhikrSrcId('morning','',idx)?'Stop':'Listen'}" data-dhikr-id="dhikr-morning-${idx}" style="background:none;border:none;cursor:pointer;padding:6px;font-size:1rem;line-height:1;color:var(--accent);" onclick="event.stopPropagation();App.dhikrSpeak('morning','',${idx})">${AppAudio.currentId()===_dhikrSrcId('morning','',idx)?iqIcon('x'):iqIcon('music')}</button>
```

(`_dhikrSeqItems` keeps building `{url}` / `{tts,lang}` items; ids are attached in `dhikrPlayAll`. Also call `refreshDhikrButtons()` at the end of `renderMorning`, `renderEvening`, and the situational detail renderer so freshly-rendered DOM reflects active state.)

- [ ] **Step 4: node --check static.js + map; targeted then full suite; commit** `feat: strict exact-portion dhikr recordings with play/stop toggles`

---

### Task 4: `features/tafsir-library.js`

**Files:**
- Create: `features/tafsir-library.js`
- Test: `tests/tafsir-library.test.js`

**Interfaces:**
- Consumes: `window.ContentCache`, global `QURAN_SURAHS` (array of `{n,en,ar,ay,type}`, loaded eagerly).
- Produces: `window.TafsirLibrary = { EDITIONS, getTafsir(editionId, surah, ayah) -> Promise<{text,lang,dir}>, sanitizeRichText(html) -> string }`.

- [ ] **Step 1: Failing tests**

```js
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const SRC = fs.readFileSync(path.join(__dirname, '..', 'features', 'tafsir-library.js'), 'utf8');

function loadModule(quranSurahs) {
  const window = {};
  new Function('window', 'QURAN_SURAHS', SRC)(window, quranSurahs || []);
  return window.TafsirLibrary;
}

test('sanitizeRichText strips scripts, styles, handlers, javascript: urls', () => {
  const T = loadModule([]);
  assert.equal(T.sanitizeRichText('<p onclick="evil()">ok</p><script>alert(1)<\/script>'), '<p>ok</p>');
  assert.equal(T.sanitizeRichText('<style>.x{}</style><b>keep</b>'), '<b>keep</b>');
  assert.equal(T.sanitizeRichText('<a href="javascript:alert(1)">x</a>'), '<a href="">x</a>');
  assert.equal(T.sanitizeRichText("<p onmouseover='bad()'>y</p>"), '<p>y</p>');
  assert.equal(T.sanitizeRichText(null), '');
});

test('global ayah index math matches revelation-order cumulative counts', () => {
  const FAKE = [{ n:1, ay:7 },{ n:2, ay:286 },{ n:3, ay:200 }];
  const T = loadModule(FAKE);
  // internal: expose via getTafsir jalalayn path is async; instead pin through source contract:
  assert.match(SRC, /cum \+= QURAN_SURAHS\[i\]\.ay/);
  assert.match(SRC, /cum \+ ayah - 1/);
});

test('editions list exposes both editions with correct lang/dir', () => {
  const T = loadModule([]);
  assert.deepEqual(T.EDITIONS.map(e => e.id), ['ibnkathir', 'jalalayn']);
  assert.equal(T.EDITIONS[0].lang, 'en');
  assert.equal(T.EDITIONS[1].dir, 'rtl');
});

test('wiring pins: CDN endpoints and cache keys', () => {
  assert.ok(SRC.includes('https://api.quran.com/api/v4/tafsirs/169/by_ayah/'));
  assert.ok(SRC.includes('ara-jalaladdinalmah.json'));
  assert.match(SRC, /ContentCache\.get\('taf-jalalayn-ar'\)/);
  assert.match(SRC, /ContentCache\.get\('taf-ibnkathir-' \+/);
  assert.match(SRC, /_jalalaynPromise/, 'in-flight dedup present');
  assert.match(SRC, /window\.TafsirLibrary = \{/);
});
```

(The index-math test pins via source contract because the lookup lives inside an async path; the formula lines are normative.)

- [ ] **Step 2: FAIL check**

- [ ] **Step 3: Implement** — write the module per the spec §Data flow with EXACTLY these constants and shapes (full code provided here is normative):

```js
(function() {
  const QURAN_API = 'https://api.quran.com/api/v4/tafsirs/169/by_ayah/';
  const JALALAYN_URL = 'https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1/editions/ara-jalaladdinalmah.json';
  const EDITIONS = [
    { id: 'ibnkathir', name: 'Ibn Kathir', lang: 'en', dir: 'ltr' },
    { id: 'jalalayn', name: 'Tafsir al-Jalalayn', lang: 'ar', dir: 'rtl' }
  ];
  let _jalalaynData = null;
  let _jalalaynPromise = null;

  function sanitizeRichText(html) {
    return String(html || '')
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/\son[a-z]+\s*=\s*"[^"]*"/gi, '')
      .replace(/\son[a-z]+\s*=\s*'[^']*'/gi, '')
      .replace(/javascript:/gi, '');
  }

  function fetchJSON(url) {
    return fetch(url).then(r => {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    });
  }

  function _jalalaynIndex(surah, ayah) {
    if (!Array.isArray(QURAN_SURAHS)) return null;
    let cum = 0;
    for (let i = 0; i < surah - 1; i++) cum += QURAN_SURAHS[i].ay;
    return cum + ayah - 1;
  }

  function loadJalalayn() {
    if (_jalalaynData) return Promise.resolve(_jalalaynData);
    if (_jalalaynPromise) return _jalalaynPromise;
    const p = _jalalaynPromise = ContentCache.get('taf-jalalayn-ar').then(cached => {
      if (cached) { _jalalaynData = cached; return _jalalaynData; }
      return fetchJSON(JALALAYN_URL).then(j => {
        const arr = j && j.quran;
        if (!Array.isArray(arr)) throw new Error('Bad edition');
        _jalalaynData = arr;
        return ContentCache.put('taf-jalalayn-ar', arr).then(() => arr);
      });
    });
    p.then(() => { _jalalaynPromise = null; }, () => { _jalalaynPromise = null; });
    return p;
  }

  function getTafsir(editionId, surah, ayah) {
    const key = surah + ':' + ayah;
    if (editionId === 'ibnkathir') {
      return ContentCache.get('taf-ibnkathir-' + key).then(cached => {
        if (cached) return { text: cached, lang: 'en', dir: 'ltr' };
        return fetchJSON(QURAN_API + key).then(j => {
          const text = j && j.tafsir && j.tafsir.text;
          if (!text) throw new Error('No tafsir');
          return ContentCache.put('taf-ibnkathir-' + key, text).then(() => ({ text: text, lang: 'en', dir: 'ltr' }));
        });
      });
    }
    if (editionId === 'jalalayn') {
      return loadJalalayn().then(arr => {
        const idx = _jalalaynIndex(surah, ayah);
        const item = (idx != null && idx >= 0) ? arr[idx] : null;
        if (!item || !item.text) throw new Error('No tafsir');
        return { text: item.text, lang: 'ar', dir: 'rtl' };
      });
    }
    return Promise.reject(new Error('Unknown edition'));
  }

  window.TafsirLibrary = { EDITIONS: EDITIONS, getTafsir: getTafsir, sanitizeRichText: sanitizeRichText };
})();
```

NOTE for implementer: the module references bare `QURAN_SURAHS` and `ContentCache` globals — resolved at call time, safe under defer load order (both exist before user interaction). The test harness passes QURAN_SURAHS as a parameter so the eval works in Node.

- [ ] **Step 4: PASS; commit** `feat: tafsir library with ibnkathir per-ayah and jalalayn edition caching`

---

### Task 5: State field + Quran reader integration

**Files:**
- Modify: `state/state.js` (one field)
- Modify: `render/dynamic.js` (selector, toggle buttons, panels)
- Modify: `core/actions.js` (App delegation)
- Test: `tests/hadith-library.test.js` (append renderer pins)

**Interfaces:**
- Consumes: `window.TafsirLibrary` (Task 4).
- Produces: `S.tafsirEdition`; `App.setTafsirEdition(id)`; `App.toggleTafsir(surah, ayah)`; panels auto-fill post-render.

- [ ] **Step 1: Failing pins** — append to tests/hadith-library.test.js:

```js
test('quran reader wires tafsir selector and panels', () => {
  const dyn = fs.readFileSync(path.join(__dirname, '..', 'render', 'dynamic.js'), 'utf8');
  assert.match(dyn, /App\.toggleTafsir\(/);
  assert.match(dyn, /App\.setTafsirEdition\(/);
  assert.match(dyn, /TafsirLibrary\.getTafsir\(/);
  assert.match(dyn, /TafsirLibrary\.sanitizeRichText\(/);
  assert.match(dyn, /class="tab-bar-quran"[^>]*>\s*'?\+?\s*['"`]?[\s\S]{0,80}EDITIONS/ === null ? /EDITIONS\.forEach/ : /EDITIONS\.forEach/);
  assert.match(dyn, /openTafsir = \{\}/);
  const st = fs.readFileSync(path.join(__dirname, '..', 'state', 'state.js'), 'utf8');
  assert.match(st, /tafsirEdition:'ibnkathir'/);
  const act = fs.readFileSync(path.join(__dirname, '..', 'core', 'actions.js'), 'utf8');
  assert.match(act, /toggleTafsir/);
  assert.match(act, /setTafsirEdition/);
});
```

(Simplify that odd EDITIONS assertion to just `assert.match(dyn, /EDITIONS\.forEach/);` when writing the file.)

- [ ] **Step 2: Implement**

1. `state/state.js` — extend the line you (previous branch) made: `quranAudioReciter:7, hadithTTSLang:'ar',` → append ` tafsirEdition:'ibnkathir',`.
2. `render/dynamic.js`:
   - Module vars near other quran vars: `let openTafsir = {};`
   - Clear it in `quranBack()`, `openQuranSurah()`, `openQuranJuz()`: add `openTafsir = {};` first line of each.
   - In `renderQuranSurah` AND `renderQuranJuz`, immediately before the verses loop insert the selector:

```js
    html += '<div class="tab-bar-quran" style="margin-bottom:10px;">';
    (typeof TafsirLibrary !== 'undefined' ? TafsirLibrary.EDITIONS : []).forEach(ed => {
      html += `<button class="${(S.tafsirEdition || 'ibnkathir') === ed.id ? 'active' : ''}" onclick="App.setTafsirEdition('${ed.id}')">${ed.name}</button>`;
    });
    html += '</div>';
```

   - Verse cards (both loops): after the play button add the toggle and panel container. Surah loop key: `surahNum + ':' + vNum`; Juz loop key: `surah + ':' + ayah`:

```js
          <button class="verse-tafsir-btn" aria-label="Tafsir" title="Tafsir" onclick="App.toggleTafsir(${surahNum},${vNum})">${iqIcon('book-open')}</button>
        </div>
        ${openTafsir[surahNum + ':' + vNum] ? `<div class="tafsir-panel" id="tafsir-panel-${surahNum}-${vNum}"></div>` : ''}
```

   - At the very end of BOTH render functions (before their closing brace; for juz after updateJuzButton()) call `fillOpenTafsirs();`
   - New functions near renderQuran:

```js
  function fillOpenTafsirs() {
    document.querySelectorAll('.tafsir-panel').forEach(p => {
      const parts = p.id.replace('tafsir-panel-', '').split('-');
      const sN = parseInt(parts[0]), aN = parseInt(parts[1]);
      p.innerHTML = '<div class="quran-loading">Loading tafsir…</div>';
      TafsirLibrary.getTafsir(S.tafsirEdition || 'ibnkathir', sN, aN).then(t => {
        if (!openTafsir[sN + ':' + aN]) return;
        const style = t.dir === 'rtl'
          ? 'dir="rtl" style="font-family:\'Amiri\',serif;font-size:1.05rem;line-height:2;color:var(--text);"'
          : 'style="font-size:0.92rem;line-height:1.8;color:var(--text);"';
        p.innerHTML = '<div ' + style + '>' + TafsirLibrary.sanitizeRichText(t.text) + '</div>';
      }).catch(() => {
        p.innerHTML = '<div class="quran-loading">Couldn&#39;t load tafsir — check connection.</div>';
      });
    });
  }
  function toggleTafsir(surahNum, ayahNum) {
    const k = surahNum + ':' + ayahNum;
    if (openTafsir[k]) delete openTafsir[k]; else openTafsir[k] = true;
    renderQuran();
  }
  function setTafsirEdition(id) {
    S.tafsirEdition = id;
    saveState();
    renderQuran();
  }
```

   - WINDOW EXPORTS: `window.fillOpenTafsirs = fillOpenTafsirs; window.toggleTafsir = toggleTafsir; window.setTafsirEdition = setTafsirEdition;`
3. `core/actions.js` — in the App literal where `dhikrSpeak:` was delegated (prior branch), add adjacent lines following the SAME guarded pattern used there:

```js
    toggleTafsir: function(s, a) { if (typeof window.toggleTafsir === 'function') window.toggleTafsir(s, a); },
    setTafsirEdition: function(id) { if (typeof window.setTafsirEdition === 'function') window.setTafsirEdition(id); },
```

(Mirror the exact style of the neighboring `dhikrSpeak:` delegation.)

- [ ] **Step 3: node --check ×3; targeted + full suite; commit** `feat: multi-tafsir selector with per-verse panels in Quran reader`

---

### Task 6: Styles + wiring + cache bumps

**Files:**
- Modify: `styles/main.css`, `index.html`, `sw.js`, `tests/html.test.js`, plus any missed `?v=` from Tasks 1–5.

**Interfaces:** produces the coherent served-version set.

- [ ] **Step 1: Styles** — append to styles/main.css:

```css
/* Tafsir */
.verse-tafsir-btn{background:none;border:none;cursor:pointer;padding:6px 8px;font-size:.85rem;color:var(--text2);}
.verse-tafsir-btn:hover{color:var(--accent);}
.tafsir-panel{margin-top:10px;padding:12px;background:rgba(201,168,76,.07);border-radius:10px;border:1px solid rgba(201,168,76,.18);}
/* Dhikr play/stop */
.dhikr-play-btn.playing{color:var(--accent-light)!important;animation:pulseGlow 1.6s ease-in-out infinite;}
@keyframes pulseGlow{0%,100%{opacity:1}50%{opacity:.55}}
```

- [ ] **Step 2: Version coherence sweep** — bump EVERY asset changed in Tasks 1–6 (final targets): `styles/main.css?v=17→18`, `core/audio.js?v=2→3`, `core/actions.js?v=17→18`, `render/static.js?v=3→4`, `render/dynamic.js?v=5→6`, `state/state.js?v=5→6`, `data/dhikr-audio-map.js?v=1→2`, `features/hadith-library.js?v=1→2`, SW registration `sw.js?v=21→22`; add `<script src="features/tafsir-library.js?v=1" defer></script>` adjacent to hadith-library tag; `sw.js` CACHE_NAME → `'iq-cache-v22'`.

- [ ] **Step 3: html.test.js** — update pinned registration to v22; css pin if asserted; add:

```js
assert.ok(html.includes('<script src="features/tafsir-library.js?v=1" defer></script>'));
assert.ok(html.includes('styles/main.css?v=18'));
assert.ok(html.indexOf('features/tafsir-library.js') > html.indexOf('render/static.js'), 'deferred features load after renderers');
```

- [ ] **Step 4: Full suite green; commit** `chore: tafsir/dhikr wiring, styles, cache bump to v22`

---

### Task 7: Browser smoke (controller-run, iq-qa agent)

Verify: selector switches editions (Ibn Kathir EN loads per verse; Jalalayn AR downloads ~2.4MB once then instant + RTL rendering); panels open/close per verse; offline cached tafsir reopens; dhikr buttons flip music↔X with highlight while playing, revert on end; previously-loose slots now show no-voice toast (TTS fallback); zero console errors; suite stays green. Fix findings via one fix dispatch + scoped re-review, then controller runs final whole-branch review (most capable model) per subagent-driven-development.

---

## Self-Review

- **Spec coverage:** qudsi (T1) ✓; audio source-tracking (T2) ✓; strict map + toggles incl. Play-all id + refresh-on-change (T3) ✓; tafsir library w/ sanitizer + dedup (T4) ✓; state + reader UI + App delegations (T5) ✓; styles/wiring/bumps (T6) ✓; smoke (T7) ✓.
- **Placeholders:** none — all code, URLs, keys, versions concrete.
- **Type consistency:** `AppAudio.playRecording(url,{id})` / `toggleTTS(text,lang,{id})` / `currentId()` / `setOnChange` consistent T2↔T3; `TafsirLibrary.{EDITIONS,getTafsir,sanitizeRichText}` consistent T4↔T5; cache-key literals `taf-ibnkathir-{s}:{v}` / `taf-jalalayn-ar` consistent spec↔plan↔tests; version numbers form one coherent final set.
