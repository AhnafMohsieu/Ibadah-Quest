# Tafsir Browser Move + Prayer Centering Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move per-ayah tafsir lookup from the Quran reader into a dedicated browser in the Interpretation tab (surah picker + ayah input + editions), remove the reader-side machinery, and center the Daily Prayers last row — verified by tests.

**Architecture:** New small deferred module `features/tafsir-browser.js` (health/finance pattern) reusing `TafsirLibrary.getTafsir` (timeout/cache/sanitize) and the exact loading/offline/retry strings; `renderTafsir` mounts it below the untouched curated pool; Quran reader loses only tafsir UI (verses/audio untouched); prayer grid gets a scoped flex-centering override on phones. Controller finale: Playwright verify + commit + push.

**Tech Stack:** Vanilla JS PWA, plain CSS, Node built-in test runner (`node --test`), Playwright MCP (controller only).

## Global Constraints

- Do NOT commit (controller commits + pushes in the finale with user's standing approval).
- Do NOT stage or modify: core/content.js, core/storage.js, opencode.json. core/actions.js: remove ONLY the two tafsir facade entries (one line); core/state.js: add ONLY the one state field (normalizeState backfills automatically — verify by test).
- Dead CSS (`verse-tafsir-btn`, `tafsir-panel`, old retry/hint rules) stays deliberately (zero risk, avoids churn); note it, don't clean it.
- Cache coherence at the end (Task 3): `render/dynamic.js?v=10 → ?v=11`, `render/static.js?v=6 → ?v=7`, `state/state.js?v=7 → ?v=8`, NEW `features/tafsir-browser.js?v=1`, `styles/main.css` bump, `sw.js` bump, `CACHE_NAME` bump, all pins in tests/html.test.js + tests/sw.test.js. (If grep shows different current values, use current+1 consistently.)
- `node --test` must show 0 failures throughout; record totals in every report.
- Windows PowerShell 5.1: no `&&`, no `tail`; test command is exactly `node --test` from repo root.

---

## File Structure

- Create: `features/tafsir-browser.js` — picker UI + lookup flow, exports on window (Task 1).
- Modify: `state/state.js:38` — add `tafsirLookup` field (Task 1).
- Modify: `index.html` — script tag after tafsir-library tag (Task 1).
- Modify: `render/static.js:114` — `renderTafsir` mounts browser container (Task 1).
- Modify: `render/dynamic.js` — strip reader tafsir UI + machinery (Task 2).
- Modify: `core/actions.js:725` — drop two facade entries (Task 2).
- Modify: `styles/main.css` — prayer flex-center override in phone (600px) + coarse blocks (Task 2).
- Modify/create tests: new `tests/tafsir-browser.test.js`; rewrite `tests/hadith-library.test.js:36-49`; rewrite `tests/html.test.js:716-727` (Tasks 1-2).
- Modify: versions + pins (Task 3).
- No other files.

---

### Task 1: Interpretation tafsir browser (new module + state + wiring + tests)

**Files:**
- Create: `features/tafsir-browser.js`
- Modify: `state/state.js:38`, `index.html` (after tafsir-library tag), `render/static.js` (renderTafsir)
- Test: create `tests/tafsir-browser.test.js`

**Interfaces:**
- Consumes: `window.TafsirLibrary.getTafsir` (12s timeout, ContentCache, sanitize), `window.HIJRI_MONTHS` NOT needed, `QURAN_SURAHS` (`{n,en,ar,ay}`), `S.tafsirEdition` + `saveState()`, existing classes `quran-loading`, `quran-retry-btn`, `tab-bar-quran`.
- Produces: `window.renderTafsirBrowser`, `window.setBrowserSurah`, `window.setBrowserAyah`, `window.setBrowserEdition`, `window.retryBrowserTafsir`; `#tafsirBrowser` container; `S.tafsirLookup={surah,ayah}`.

- [ ] **Step 1: Write the failing tests**

Create `tests/tafsir-browser.test.js` (mirror `tests/tafsir-library.test.js` sandbox style — `new Function` with explicit params, no DOM library):

```js
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const SRC = fs.readFileSync(path.join(__dirname, '..', 'features', 'tafsir-browser.js'), 'utf8');

function loadBrowser() {
  const window = {};
  const els = {};
  const fakeEl = () => ({ innerHTML: '' });
  const document = { getElementById: (id) => (els[id] || (els[id] = fakeEl()))) };
  const S = { tafsirLookup: { surah: 1, ayah: 1 }, tafsirEdition: 'ibnkathir' };
  let saved = 0;
  const saveState = () => { saved++; };
  const QURAN_SURAHS = [{ n: 1, en: 'Al-Fatihah', ar: 'x', ay: 7, type: 'Meccan' }, { n: 2, en: 'Al-Baqarah', ar: 'y', ay: 286, type: 'Medinan' }];
  const calls = [];
  const TafsirLibrary = {
    EDITIONS: [{ id: 'ibnkathir', name: 'Ibn Kathir', lang: 'en', dir: 'ltr' }, { id: 'jalalayn', name: 'Jalalayn', lang: 'ar', dir: 'rtl' }],
    getTafsir: (ed, s, a) => { calls.push([ed, s, a]); return Promise.resolve({ text: 'T', dir: 'ltr' }); },
    sanitizeRichText: (s) => s
  };
  new Function('window', 'document', 'S', 'saveState', 'QURAN_SURAHS', 'TafsirLibrary', SRC)(window, document, S, saveState, QURAN_SURAHS, TafsirLibrary);
  return { window, document, els, S, getSaved: () => saved, calls, QURAN_SURAHS };
}

test('browser pins: exports, picker, clamp, retry, offline note', () => {
  assert.match(SRC, /window\.renderTafsirBrowser = /);
  assert.match(SRC, /window\.setBrowserSurah = /);
  assert.match(SRC, /window\.setBrowserAyah = /);
  assert.match(SRC, /window\.setBrowserEdition = /);
  assert.match(SRC, /window\.retryBrowserTafsir = /);
  assert.match(SRC, /needs connection once/);
  assert.match(SRC, /App\.retryBrowserTafsir|retryBrowserTafsir\(/);
});

test('surah change clamps ayah and persists lookup', () => {
  const { window, S, getSaved } = loadBrowser();
  window.setBrowserSurah(999);
  assert.deepEqual(S.tafsirLookup, { surah: 2, ayah: 1 });
  assert.ok(getSaved() > 0, 'lookup persists');
});

test('ayah clamps to surah bounds', () => {
  const { window, S } = loadBrowser();
  window.setBrowserSurah(1);
  window.setBrowserAyah(999);
  assert.deepEqual(S.tafsirLookup, { surah: 1, ayah: 7 });
  window.setBrowserAyah(0);
  assert.deepEqual(S.tafsirLookup, { surah: 1, ayah: 1 });
});

test('render writes picker with 114-capable select and edition buttons', () => {
  const { window, els } = loadBrowser();
  window.renderTafsirBrowser();
  const html = els['tafsirBrowser'].innerHTML;
  assert.ok(html.includes('<select'), 'surah picker missing');
  assert.ok(html.includes('Al-Baqarah'), 'surah options missing');
  assert.ok(html.includes('tafsirBrowserResult'), 'result panel missing');
  assert.ok(html.includes('ibnkathir') && html.includes('jalalayn'), 'edition buttons missing');
});
```

Also append to `tests/html.test.js` (after the tafsir test that Task 2 will rewrite — order-independent, separate test):

```js
test('interpretation tab mounts the tafsir browser', () => {
  assert.ok(html.includes('<script src="features/tafsir-browser.js?v=1" defer></script>'),
    'browser script tag missing');
  const st = fs.readFileSync(path.join(root, 'state', 'state.js'), 'utf8');
  assert.ok(st.includes('tafsirLookup:{surah:1,ayah:1}'),
    'freshState must carry the lookup');
});
```

(`fs`, `path`, `root`, `html` already exist in html.test.js — verify names before writing; if different, use the real ones.)

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/tafsir-browser.test.js`
Expected: FAIL with "Cannot find module" (file doesn't exist). Then create an EMPTY `features/tafsir-browser.js` (`(function() {})();`) and re-run the html.test.js mount test if already added — simpler: write code first per steps below; the RED state is proven by the missing-file failure. Record it.

- [ ] **Step 3: Write minimal implementation**

Create `features/tafsir-browser.js` (exact full content):

```js
(function() {
  function lookup() {
    var t = (typeof S !== 'undefined' && S && S.tafsirLookup) || {};
    return { surah: t.surah || 1, ayah: t.ayah || 1 };
  }
  function surahCount() {
    return (typeof QURAN_SURAHS !== 'undefined' && QURAN_SURAHS.length) || 114;
  }
  function ayahCount(n) {
    if (typeof QURAN_SURAHS !== 'undefined' && QURAN_SURAHS[n - 1]) return QURAN_SURAHS[n - 1].ay;
    return 286;
  }
  function saveLookup(surah, ayah) {
    try {
      if (typeof S === 'undefined' || !S) return;
      S.tafsirLookup = { surah: surah, ayah: ayah };
      if (typeof saveState === 'function') saveState();
    } catch (e) {}
  }
  function setBrowserSurah(n) {
    n = Math.max(1, Math.min(surahCount(), parseInt(n, 10) || 1));
    saveLookup(n, 1);
    renderTafsirBrowser();
  }
  function setBrowserAyah(v) {
    var cur = lookup();
    var max = ayahCount(cur.surah);
    var a = Math.max(1, Math.min(max, parseInt(v, 10) || 1));
    saveLookup(cur.surah, a);
    loadBrowserResult();
  }
  function setBrowserEdition(id) {
    try {
      if (typeof S === 'undefined' || !S) return;
      S.tafsirEdition = id;
      if (typeof saveState === 'function') saveState();
    } catch (e) {}
    renderTafsirBrowser();
  }
  function loadBrowserResult() {
    var box = (typeof document !== 'undefined') ? document.getElementById('tafsirBrowserResult') : null;
    if (!box) return;
    if (typeof TafsirLibrary === 'undefined') {
      box.innerHTML = '<div class="quran-loading">Tafsir library is still loading…</div>';
      return;
    }
    var cur = lookup();
    var ed = (typeof S !== 'undefined' && S && S.tafsirEdition) || 'ibnkathir';
    box.innerHTML = '<div class="quran-loading">Loading tafsir…</div>';
    TafsirLibrary.getTafsir(ed, cur.surah, cur.ayah).then(function(t) {
      var el = (typeof document !== 'undefined') ? document.getElementById('tafsirBrowserResult') : null;
      if (!el) return;
      var cur2 = lookup();
      if (cur2.surah !== cur.surah || cur2.ayah !== cur.ayah) return;
      var style = t.dir === 'rtl'
        ? 'dir="rtl" style="font-family:\'Amiri\',serif;font-size:1.05rem;line-height:2;color:var(--text);"'
        : 'style="font-size:0.92rem;line-height:1.8;color:var(--text);"';
      el.innerHTML = '<div ' + style + '>' + TafsirLibrary.sanitizeRichText(t.text) + '</div>';
    }).catch(function() {
      var el = (typeof document !== 'undefined') ? document.getElementById('tafsirBrowserResult') : null;
      if (!el) return;
      var offline = (typeof navigator !== 'undefined' && navigator && navigator.onLine === false);
      el.innerHTML = '<div class="quran-loading">' + (offline ? 'You are offline — tafsir needs connection once, then it is saved for offline use.' : 'Couldn&#39;t load tafsir — check connection.') + ' <button class="quran-retry-btn" onclick="window.retryBrowserTafsir()">Retry</button></div>';
    });
  }
  function retryBrowserTafsir() { loadBrowserResult(); }
  function renderTafsirBrowser() {
    var host = (typeof document !== 'undefined') ? document.getElementById('tafsirBrowser') : null;
    if (!host) return;
    if (typeof QURAN_SURAHS === 'undefined' || typeof TafsirLibrary === 'undefined') {
      host.innerHTML = '<div class="quran-loading">Tafsir library is still loading…</div>';
      return;
    }
    var cur = lookup();
    var ed = (typeof S !== 'undefined' && S && S.tafsirEdition) || 'ibnkathir';
    var opts = '';
    for (var i = 0; i < QURAN_SURAHS.length; i++) {
      var s = QURAN_SURAHS[i];
      opts += '<option value="' + s.n + '"' + (s.n === cur.surah ? ' selected' : '') + '>' + s.n + '. ' + s.en + '</option>';
    }
    var eds = '';
    TafsirLibrary.EDITIONS.forEach(function(e) {
      eds += '<button class="' + (ed === e.id ? 'active' : '') + '" onclick="window.setBrowserEdition(\'' + e.id + '\')">' + e.name + '</button>';
    });
    host.innerHTML = '<div class="tab-bar-quran" style="margin-bottom:10px;">'
      + '<select id="tafsirSurah" aria-label="Surah" onchange="window.setBrowserSurah(this.value)">' + opts + '</select>'
      + '<input id="tafsirAyah" type="number" min="1" max="' + ayahCount(cur.surah) + '" value="' + cur.ayah + '" aria-label="Ayah" onchange="window.setBrowserAyah(this.value)">'
      + eds + '</div><div id="tafsirBrowserResult"></div>';
    loadBrowserResult();
  }
  window.renderTafsirBrowser = renderTafsirBrowser;
  window.setBrowserSurah = setBrowserSurah;
  window.setBrowserAyah = setBrowserAyah;
  window.setBrowserEdition = setBrowserEdition;
  window.retryBrowserTafsir = retryBrowserTafsir;
})();
```

Then wire it up:
1. `state/state.js` line 38: `quranAudioReciter:7, hadithTTSLang:'ar', tafsirEdition:'ibnkathir',` → `quranAudioReciter:7, hadithTTSLang:'ar', tafsirEdition:'ibnkathir', tafsirLookup:{surah:1,ayah:1},` (exact string; if absent/different, STOP and report NEEDS_CONTEXT).
2. `index.html`: after `<script src="features/tafsir-library.js?v=3" defer></script>` insert `<script src="features/tafsir-browser.js?v=1" defer></script>` (exact anchor; if absent, STOP).
3. `render/static.js` renderTafsir (exact current: `function renderTafsir() { poolRender('tafsirArea', iqIcon('book-open') + ' Quranic Tafsir',TAFSIR_POOL,'tafsirIdx'); }`) → append mount:
```js
  function renderTafsir() { poolRender('tafsirArea', iqIcon('book-open') + ' Quranic Tafsir',TAFSIR_POOL,'tafsirIdx'); var host = document.getElementById('tafsirArea'); if (!host) return; host.innerHTML += '<div id="tafsirBrowser"></div>'; if (typeof window.renderTafsirBrowser === 'function') window.renderTafsirBrowser(); }
```
(If actual text differs, STOP and report NEEDS_CONTEXT.)

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test tests/tafsir-browser.test.js tests/html.test.js` then `node --check features/tafsir-browser.js`. Expected: PASS + clean.

- [ ] **Step 5: Run full suite**

Run: `node --test`. Record the totals (expect 0 failures).

---

### Task 2: Remove reader-side tafsir + center prayers (JS + CSS + tests)

**Files:**
- Modify: `render/dynamic.js` (deletions + facade-adjacent exports), `core/actions.js:725` (facade), `styles/main.css` (prayer flex override ×2 blocks)
- Test: rewrite `tests/hadith-library.test.js:36-49`, rewrite `tests/html.test.js:716-727`

**Interfaces:**
- Consumes: Task 1 (browser owns tafsir now; `setTafsirEdition` stays as the single edition writer).
- Produces: reader without tafsir; centered prayer rows. Task 3 ships.

- [ ] **Step 1: Rewrite the failing tests first**

(a) In `tests/hadith-library.test.js`, replace the whole test `'quran reader wires tafsir selector and panels'` (lines 36-49, exact current text per plan context) with:
```js
test('quran reader carries no tafsir UI (lives in interpretation browser)', () => {
  const dyn = fs.readFileSync(path.join(__dirname, '..', 'render', 'dynamic.js'), 'utf8');
  assert.ok(!dyn.includes('verse-tafsir-btn'), 'verse tafsir buttons must be gone');
  assert.ok(!dyn.includes('tafsir-panel'), 'inline tafsir panels must be gone');
  assert.ok(!dyn.includes('fillOpenTafsirs'), 'panel filler must be gone');
  assert.ok(!dyn.includes('tafsir-hint'), 'edition hint must be gone');
  assert.ok(!dyn.includes('openTafsir'), 'open-panel state must be gone');
  assert.ok(dyn.includes('function setTafsirEdition'), 'edition writer stays for the browser');
  const st = fs.readFileSync(path.join(__dirname, '..', 'state', 'state.js'), 'utf8');
  assert.match(st, /tafsirEdition:'ibnkathir'/);
  assert.match(st, /tafsirLookup:\{surah:1,ayah:1\}/);
  const act = fs.readFileSync(path.join(__dirname, '..', 'core', 'actions.js'), 'utf8');
  assert.ok(!act.includes("toggleTafsir: appAction"), 'facade must drop toggleTafsir');
  assert.ok(!act.includes("retryTafsir: appAction"), 'facade must drop retryTafsir');
  assert.ok(act.includes("setTafsirEdition: appAction('setTafsirEdition')"), 'facade keeps setTafsirEdition');
});
```
(Verify `fs`/`path`/`assert` names in that file match — read its top first; the current test uses them, so they exist.)

(b) In `tests/html.test.js`, replace the whole test `'quran tafsir panels explain, retry, and hint offline'` (lines 716-727) with:
```js
test('prayer last row centers under the grid', () => {
  const i600 = css.lastIndexOf('@media (max-width: 600px)');
  assert.ok(i600 > -1, 'phone block missing');
  const phoneBlock = css.slice(i600, i600 + 2500);
  assert.ok(phoneBlock.includes('#prayerArea .card-grid{display:flex;flex-wrap:wrap;justify-content:center'),
    'prayer grid must center rows on phones');
  const i = css.indexOf('@media (pointer:coarse)');
  assert.ok(i > -1, 'coarse block missing');
  assert.ok(css.slice(i, i + 1500).includes('#prayerArea .card-grid'),
    'prayer grid must center rows on touch devices');
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/hadith-library.test.js tests/html.test.js`
Expected: FAIL on the rewritten tests (reader still has tafsir UI; prayer override absent).

- [ ] **Step 3: Quran reader deletions in `render/dynamic.js`** (verify each oldString with grep first; STOP + NEEDS_CONTEXT on any mismatch)

1. Delete the surah-view edition block + hint (exact, lines ~850-855):
```
    html += '<div class="tab-bar-quran" style="margin-bottom:10px;">';
    if (typeof TafsirLibrary !== 'undefined') TafsirLibrary.EDITIONS.forEach(ed => {
      html += `<button class="${(S.tafsirEdition || 'ibnkathir') === ed.id ? 'active' : ''}" onclick="App.setTafsirEdition('${ed.id}')">${ed.name}</button>`;
    });
    html += '</div>';
    html += '<div class="tafsir-hint">Select an edition above, then tap the book icon on any verse to load its tafsir.</div>';
```
→ delete (this exact 5-line block occurs TWICE — surah + juz views — delete BOTH; grep must show 0 remaining `tafsir-hint`).
2. Surah verse card: delete line `          <button class="verse-tafsir-btn" aria-label="Tafsir" title="Tafsir" onclick="App.toggleTafsir(${surahNum},${vNum})">${iqIcon('book-open')}</button>` and line `        ${openTafsir[surahNum + ':' + vNum] ? `<div class="tafsir-panel" id="tafsir-panel-${surahNum}-${vNum}"></div>` : ''}`.
3. Juz verse card: delete line `          <button class="verse-tafsir-btn" aria-label="Tafsir" title="Tafsir" onclick="App.toggleTafsir(${surah},${ayah})">${iqIcon('book-open')}</button>` and line `        ${openTafsir[surah + ':' + ayah] ? `<div class="tafsir-panel" id="tafsir-panel-${surah}-${ayah}"></div>` : ''}`.
4. Delete `    fillOpenTafsirs();` (2 occurrences: after surah `el.innerHTML = html;` and in juz view — grep to confirm exactly 2, replaceAll).
5. Delete the whole span from `  function loadTafsirInto(p, sN, aN) {` (line ~938) through the end of `toggleTafsir` (line ~974 `}` before `  function setTafsirEdition(id) {`) — i.e. remove loadTafsirInto + fillOpenTafsirs + retryTafsir + toggleTafsir entirely, keeping `  function setTafsirEdition(id) {` and everything after. (Read the span first to capture it exactly.)
6. Delete `  let openTafsir = {};` (line ~564); in `openQuranSurah`/`quranBack`/`openQuranJuz` remove the `openTafsir = {}; ` fragment from each line (keep the rest of each line byte-identical).
7. Delete export lines `  window.fillOpenTafsirs = fillOpenTafsirs;`, `  window.toggleTafsir = toggleTafsir;`, `  window.retryTafsir = retryTafsir;` (keep `window.setTafsirEdition`).
8. `core/actions.js` line 725: replace `toggleTafsir: appAction('toggleTafsir'), retryTafsir: appAction('retryTafsir'), setTafsirEdition: appAction('setTafsirEdition'),` with `setTafsirEdition: appAction('setTafsirEdition'),` (exact full-line text verified 2026-09-06; re-verify before editing).

- [ ] **Step 4: Prayer centering CSS**

In the `@media (max-width: 600px)` block, after the line `#tier2Tabs,#tier3Tabs{flex-wrap:wrap;overflow-x:visible;}` add:
```css
  #prayerArea .card-grid{display:flex;flex-wrap:wrap;justify-content:center;}
  #prayerArea .card-grid > .card-item{flex:1 1 28%;}
```
In the `@media (pointer:coarse)` block, after its identical `#tier2Tabs,#tier3Tabs{...}` line, add the same two lines. (The two anchor lines are textually identical across blocks — disambiguate by including the FOLLOWING line in each oldString: 600px block is followed by `#tier2Tabs{justify-content:center;}` then `.tab-panel{padding-bottom:12px;}`; coarse block is followed by `#tier2Tabs{justify-content:center;}` then `button:not(...)`. Use 3-line context for uniqueness; if ambiguous, STOP.)

- [ ] **Step 5: Run tests + checks**

Run: `node --test tests/hadith-library.test.js tests/html.test.js` (expect PASS), `node --check render/dynamic.js`, `node --check core/actions.js` (clean), then full `node --test` (expect 0 failures; record totals).

---

### Task 3: Cache bumps + full suite (no commit)

**Files:**
- Modify: `index.html`, `sw.js`, `tests/html.test.js`, `tests/sw.test.js`.

**Interfaces:**
- Consumes: Tasks 1-2.
- Produces: coherent versions; controller finale (Playwright: 2:255 lookup both editions, no book buttons, centered prayers + commit + push) follows.

- [ ] **Step 1: Confirm current versions**

```powershell
Select-String -Path index.html -SimpleMatch -Pattern 'render/dynamic.js?v=', 'render/static.js?v=', 'state/state.js?v=', 'tafsir-library.js?v=', 'sw.js?v='
Select-String -Path sw.js -Pattern 'CACHE_NAME' | Select-Object -First 1
```
Expected: dynamic v10, static v6, state v7, tafsir-library v3, sw v44, cache v44. New file gets `?v=1`. If different, use current+1 consistently. Also grep html.test.js/sw.test.js pins for each touched file and update accordingly.

- [ ] **Step 2: Bump versions**

- `index.html`: dynamic v10→v11, static v6→v7, state v7→v8, sw v44→v45; insert `<script src="features/tafsir-browser.js?v=1" defer></script>` immediately after the tafsir-library script tag.
- `sw.js`: cache v44→v45.
- `tests/html.test.js`: update version pins to match; extend/keep the tafsir-library tag pin with the new browser tag pin.
- `tests/sw.test.js`: cache pin v44→v45.

- [ ] **Step 3: Verify no stale pins** (same grep pattern as Step 1 across index.html, sw.js, both test files; expect only new values).

- [ ] **Step 4: Full suite + syntax checks**

Run: `node --check` on every touched JS file, then `node --test`. Expected: 0 failures. Report counts; do NOT commit (controller finale).
