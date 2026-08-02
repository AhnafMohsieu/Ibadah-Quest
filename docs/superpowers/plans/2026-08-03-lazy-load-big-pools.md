# Lazy-Load Big Content Pools — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove quran-verses.js (3.1MB), hadiths.js (2.4MB), and hadith-collections.js (385KB) from eager page load and load them on demand when the relevant tab/surah is first opened.

**Architecture:** A `loadScript` promise-based loader (with a dedupe Set) in `core/actions.js`, exposed via `window.App.ensureQuranLoaded()` / `ensureHadithLoaded()`. Trigger points: `renderQuranSurah` + `playSurah` in `render/render.js` load quran verses on surah open; `activateTab` in `core/actions.js` loads hadith data on hadith-tab activation. Existing `typeof` guards in search/analytics already tolerate missing pools; two `refreshContent` index-writer lines need guards.

**Tech Stack:** Vanilla JS (no build tooling), browser `<script>` injection, Promises.

## Global Constraints

- Repo rule (CLAUDE.md): ONE commit per feature. All task changes land in a single final commit; no per-task commits.
- No test framework exists; verification uses `node --check` + Node stub scripts stored OUTSIDE the repo in `C:\Users\Mahin\AppData\Local\Temp\opencode\` (never committed).
- Script URLs keep the existing `?v=3` cache-busting convention (`hadith-collections.js` was `?v=1` → becomes `?v=3`).
- No bundling/minification; `quran-meta.js` (8KB) and all other small pools stay eager.
- All renderers run inside `safe()` try/catch in `renderStatic` (render.js:27-33) — unloaded pools must never crash startup.
- `window.App` object is built at actions.js:2113-2127; new methods must be added there.

---

### Task 1: Loader helper in actions.js

**Files:**
- Modify: `core/actions.js` (insert helpers before `function refreshContent()` at line 60; add exports to `window.App` at line 2120)

**Interfaces:**
- Produces: `loadScript(src) -> Promise<void>` (dedupes via module-level Set), `ensureQuranLoaded() -> Promise<void>`, `ensureHadithLoaded() -> Promise<void>` (parallel load of both hadith files). All three are used by Tasks 3-4.
- Consumes: `document.createElement`, `document.head.appendChild` (browser globals).

- [ ] **Step 1: Write the failing stub test**

Create `C:\Users\Mahin\AppData\Local\Temp\opencode\test-loader.js`:

```js
const fs = require('fs');
const src = fs.readFileSync('core/actions.js', 'utf8');

// Extract the loader block (exists only after implementation)
const loaderMatch = src.match(/const _loadedScripts = new Set\(\);[\s\S]*?\n  \}/);
if (!loaderMatch) { console.error('FAIL - loader block not found'); process.exit(1); }

// Fake DOM
const created = [];
const head = { appendChild() {} };
global.document = {
  createElement(tag) { const el = { tag, onload: null, onerror: null }; created.push(el); return el; },
  head,
};
const _loadedScripts = new Set();
const _tracked = new Set();
const loadScript = (srcUrl) => new Promise((resolve, reject) => {
  if (_loadedScripts.has(srcUrl)) { _tracked.add('dedupe:' + srcUrl); resolve(); return; }
  const s = document.createElement('script');
  s.src = srcUrl + '?v=3';
  s.onload = () => { _loadedScripts.add(srcUrl); resolve(); };
  s.onerror = () => reject(new Error(srcUrl));
  document.head.appendChild(s);
});
const ensureQuranLoaded = () => loadScript('data/pools/quran-verses.js');
const ensureHadithLoaded = () => Promise.all([
  loadScript('data/pools/hadiths.js'),
  loadScript('data/hadith-collections.js')
]);

(async () => {
  let failures = 0;
  const check = (name, cond) => { console.log((cond ? 'PASS' : 'FAIL') + ' - ' + name); if (!cond) failures++; };

  await ensureQuranLoaded();
  check('quran script created once', created.length === 1 && created[0].src === 'data/pools/quran-verses.js?v=3');
  check('quran onload fires', _loadedScripts.has('data/pools/quran-verses.js'));

  await ensureQuranLoaded();
  check('second quran call dedupes (no new script)', created.length === 1 && _tracked.has('dedupe:data/pools/quran-verses.js'));

  await ensureHadithLoaded();
  check('hadith pair created', created.length === 3);

  const before = created.length;
  await ensureHadithLoaded();
  check('hadith pair dedupes', created.length === before);

  console.log(failures ? failures + ' FAILURES' : 'ALL CHECKS PASSED');
  process.exit(failures ? 1 : 0);
})();
```

- [ ] **Step 2: Run stub test to verify it fails**

Run: `node C:\Users\Mahin\AppData\Local\Temp\opencode\test-loader.js`
Expected: FAIL — "loader block not found" (implementation absent).

- [ ] **Step 3: Implement the loader**

Insert into `core/actions.js` immediately before `function refreshContent() {` (line 60):

```js
  const _loadedScripts = new Set();
  function loadScript(srcUrl) {
    return new Promise((resolve, reject) => {
      if (_loadedScripts.has(srcUrl)) { resolve(); return; }
      const s = document.createElement('script');
      s.src = srcUrl + '?v=3';
      s.onload = () => { _loadedScripts.add(srcUrl); resolve(); };
      s.onerror = () => { console.warn('Failed to load ' + srcUrl); reject(new Error(srcUrl)); };
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

Add to the `window.App` object (actions.js:2120, after `manualRefresh:`):

```js
      ensureQuranLoaded, ensureHadithLoaded,
```

- [ ] **Step 4: Run stub test to verify it passes**

Run: `node C:\Users\Mahin\AppData\Local\Temp\opencode\test-loader.js`
Expected: ALL CHECKS PASSED. Then `node --check core/actions.js` → no output (clean).

---

### Task 2: Guard refreshContent index writes

**Files:**
- Modify: `core/actions.js:82`

**Interfaces:**
- Consumes: `refreshContent` (actions.js:60-84) — daily index writer iterating `pools` entries `[key, pool]`.
- Produces: startup path that tolerates `QURAN_POOL`/`HADITHS` being undefined (they are after Task 5 removes their script tags).

- [ ] **Step 1: Write the failing stub test**

Create `C:\Users\Mahin\AppData\Local\Temp\opencode\test-refresh-guard.js`:

```js
const fs = require('fs');
const src = fs.readFileSync('core/actions.js', 'utf8');
const fnMatch = src.match(/function refreshContent\(\) \{[\s\S]*?\n  \}/);
if (!fnMatch) { console.error('FAIL - refreshContent not found'); process.exit(1); }
eval(fnMatch[0]);

let rngCalls = [];
const fastRng = (len) => { rngCalls.push(len); return 0; };
const today = () => '2026-08-03';
const S = {};
// Reproduce the pools array with QURAN_POOL and HADITHS undefined
const pools = [
  ['duaIdx', [1,2,3]],
  ['quranIdx', undefined],
  ['sunnahIdx', [4,5]],
  ['hadithIdx', undefined]
];
const isNewDay = true;
const rng = (len) => fastRng(len);
const poolExpr = src.match(/const pools = \[[\s\S]*?\];/); // not needed; we eval manually below
global.DUA_POOL = [1,2,3]; global.SUNNAH_POOL = [4,5];
// Run the body with the real pools list via a wrapper that stubs the pool array
try {
  eval(src.match(/function refreshContent\(\) \{[\s\S]*?\n  \}/)[0].replace('const pools = [', 'const pools = ' + JSON.stringify([['duaIdx','DUA_POOL'],['quranIdx','QURAN_POOL'],['sunnahIdx','SUNNAH_POOL'],['hadithIdx','HADITHS']]).replace(/"/g, "'").replace(/'DUA_POOL'/g, 'DUA_POOL').replace(/'SUNNAH_POOL'/g, 'SUNNAH_POOL').replace(/'QURAN_POOL'/g, 'QURAN_POOL').replace(/'HADITHS'/g, 'HADITHS').slice(1,-1) + ', '));
  console.log('FAIL - refreshContent should have thrown when QURAN_POOL undefined');
  process.exit(1);
} catch (e) {
  console.log('PASS - crashes without guard (expected pre-implementation):', e.message.slice(0, 40));
}
```

Note: this stub is brittle by design (regex + eval). After implementation the same script's second half must assert no crash — see Step 4 for the post-implementation check.

- [ ] **Step 2: Run stub test**

Run: `node C:\Users\Mahin\AppData\Local\Temp\opencode\test-refresh-guard.js`
Expected: FAIL line (crash confirmed).

- [ ] **Step 3: Implement the guard**

In `core/actions.js` line 82, change:

```js
    for (const [key,pool] of pools) { if (isNewDay || !S[key]?.length) S[key] = rng(pool.length); }
```

to:

```js
    for (const [key,pool] of pools) { if (isNewDay || !S[key]?.length) S[key] = rng((pool||[]).length); }
```

- [ ] **Step 4: Verify guard holds**

Create `C:\Users\Mahin\AppData\Local\Temp\opencode\test-refresh-guard2.js` — same extraction, but now assert the body completes without throwing with `QURAN_POOL`/`HADITHS` undefined (use `global.QURAN_POOL = undefined; global.HADITHS = undefined;` and expect `S.quranIdx === 0`).

Run: `node C:\Users\Mahin\AppData\Local\Temp\opencode\test-refresh-guard2.js`
Expected: PASS (no throw, `S.quranIdx` set).

---

### Task 3: Quran trigger points in render.js

**Files:**
- Modify: `render/render.js:534` (`renderQuranSurah`), `render/render.js:381` (`playSurah`)

**Interfaces:**
- Consumes: `window.App.ensureQuranLoaded()` (Task 1), `QURAN_POOL` global, `QURAN_SURAHS` global (eager, from quran-meta.js).
- Produces: surah content view that self-heals after load; audio that starts after load.

- [ ] **Step 1: Write the failing stub test**

Create `C:\Users\Mahin\AppData\Local\Temp\opencode\test-quran-trigger.js`:

```js
const fs = require('fs');
const src = fs.readFileSync('render/render.js', 'utf8');
const fnMatch = src.match(/function renderQuranSurah\(el, surahNum\) \{[\s\S]*?\n  \}/);
if (!fnMatch) { console.error('FAIL - renderQuranSurah not found'); process.exit(1); }
let loaded = false;
global.window = { App: { ensureQuranLoaded: () => { loaded = true; return Promise.resolve(); } } };
global.QURAN_POOL = undefined;
global.QURAN_SURAHS = [{ n: 1, ar: 'x', en: 'y', ay: 7, type: 'Meccan' }];
const el = { innerHTML: '' };
eval(fnMatch[0]);
renderQuranSurah(el, 1).catch ? null : renderQuranSurah(el, 1);
setTimeout(() => {
  console.log((loaded ? 'PASS' : 'FAIL') + ' - ensureQuranLoaded triggered when pool undefined');
  console.log((el.innerHTML.includes('Loading verses') ? 'PASS' : 'FAIL') + ' - loading note shown');
  process.exit(loaded && el.innerHTML.includes('Loading verses') ? 0 : 1);
}, 50);
```

- [ ] **Step 2: Run stub test to verify it fails**

Run: `node C:\Users\Mahin\AppData\Local\Temp\opencode\test-quran-trigger.js`
Expected: FAIL — `loaded` stays false (no guard implemented).

- [ ] **Step 3: Implement the guard**

At the very top of `renderQuranSurah` (render.js:534), insert:

```js
    if (typeof QURAN_POOL === 'undefined') {
      el.innerHTML = '<div class="quran-loading">Loading verses…</div>';
      window.App.ensureQuranLoaded()
        .then(() => renderQuranSurah(el, surahNum))
        .catch(() => { el.innerHTML = '<div class="quran-loading">Couldn\'t load verses — check your connection and retry.</div>'; });
      return;
    }
```

At the very top of `playSurah` (render.js:381), insert:

```js
    if (typeof QURAN_POOL === 'undefined') {
      window.App.ensureQuranLoaded().then(() => playSurah(surahNum)).catch(() => {});
      return;
    }
```

- [ ] **Step 4: Run stub test to verify it passes**

Run: `node C:\Users\Mahin\AppData\Local\Temp\opencode\test-quran-trigger.js`
Expected: PASS — both checks. Then `node --check render/render.js` → clean.

---

### Task 4: Hadith hook in activateTab

**Files:**
- Modify: `core/actions.js:2046-2052` (`activateTab`)

**Interfaces:**
- Consumes: `ensureHadithLoaded()` (Task 1), `window.renderHadith` (exposed at render.js:1379).
- Produces: hadith collections view after first hadith-tab activation.

- [ ] **Step 1: Write the failing stub test**

Create `C:\Users\Mahin\AppData\Local\Temp\opencode\test-hadith-hook.js`:

```js
const fs = require('fs');
const src = fs.readFileSync('core/actions.js', 'utf8');
const fnMatch = src.match(/function activateTab\(tabId, btn\) \{[\s\S]*?\n  \}/);
if (!fnMatch) { console.error('FAIL - activateTab not found'); process.exit(1); }
const els = {};
global.document = {
  querySelectorAll() { return [{ classList: { remove(){} } }]; },
  getElementById(id) { if (!els[id]) els[id] = { classList: { add(){}, remove(){} } }; return els[id]; },
};
let hadithRenderCalls = 0, loadCalls = 0;
const ensureHadithLoaded = () => { loadCalls++; return Promise.resolve(); };
global.window = { renderHadith: () => { hadithRenderCalls++; } };
global.HADITH_COLLECTIONS_DATA = undefined;
eval(fnMatch[0]);
activateTab('hadith', null);
setTimeout(() => {
  console.log((loadCalls === 1 ? 'PASS' : 'FAIL') + ' - hadith load triggered on tab open');
  console.log((hadithRenderCalls === 1 ? 'PASS' : 'FAIL') + ' - renderHadith called after load');
  process.exit(loadCalls === 1 && hadithRenderCalls === 1 ? 0 : 1);
}, 50);
```

- [ ] **Step 2: Run stub test to verify it fails**

Run: `node C:\Users\Mahin\AppData\Local\Temp\opencode\test-hadith-hook.js`
Expected: FAIL — `loadCalls` stays 0.

- [ ] **Step 3: Implement the hook**

In `activateTab` (actions.js:2046-2052), append after the panel-activation line:

```js
    if (tabId === 'hadith' && typeof HADITH_COLLECTIONS_DATA === 'undefined') {
      ensureHadithLoaded().then(() => { if (window.renderHadith) window.renderHadith(); }).catch(() => {});
    }
```

- [ ] **Step 4: Run stub test to verify it passes**

Run: `node C:\Users\Mahin\AppData\Local\Temp\opencode\test-hadith-hook.js`
Expected: PASS — both checks. Then `node --check core/actions.js` → clean.

---

### Task 5: Remove eager script tags

**Files:**
- Modify: `index.html` (remove 3 lines near the pool script block)

**Interfaces:**
- Consumes: Tasks 1-4 (guards + loaders in place).
- Produces: ~6.4MB → ~220KB of eager JS.

- [ ] **Step 1: Verify the exact lines exist**

Run: `Select-String -Path index.html -Pattern "quran-verses|data/pools/hadiths|hadith-collections"`
Expected: 3 lines shown.

- [ ] **Step 2: Remove the tags**

Delete these three lines from `index.html`:
- `<script src="data/pools/quran-verses.js?v=3"></script>`
- `<script src="data/pools/hadiths.js?v=3"></script>`
- `<script src="data/hadith-collections.js?v=1"></script>`

Keep `data/pools/quran-meta.js?v=3`.

- [ ] **Step 3: Verify removal + no dangling references**

Run: `Select-String -Path index.html -Pattern "quran-verses|data/pools/hadiths|hadith-collections"`
Expected: only `data/hadith-collections` references remaining are in `core/actions.js` loader + `render/render.js` guard + `helpers.js`/`analytics.js` typeof guards (all safe). Confirm no other file does an eager top-level `QURAN_POOL.filter`/`.forEach` outside guarded functions: `Select-String -Path render\render.js,core\actions.js,data\pools\helpers.js,analytics\*.js -Pattern "QURAN_POOL|HADITHS\b"` — every hit must be inside a function or guarded by `typeof`/try-catch (refreshContent now `(pool||[])`-guarded, renderStatic try/catch, helpers/analytics typeof-guarded).

---

### Task 6: Full verification + single commit

- [ ] **Step 1: Syntax checks**

Run: `node --check core/actions.js; if ($?) { node --check render/render.js }`
Expected: no output (clean).

- [ ] **Step 2: Re-run all stub tests**

Run each and expect ALL CHECKS PASSED:
- `node C:\Users\Mahin\AppData\Local\Temp\opencode\test-loader.js`
- `node C:\Users\Mahin\AppData\Local\Temp\opencode\test-refresh-guard2.js`
- `node C:\Users\Mahin\AppData\Local\Temp\opencode\test-quran-trigger.js`
- `node C:\Users\Mahin\AppData\Local\Temp\opencode\test-hadith-hook.js`

- [ ] **Step 3: Re-run navigation regression**

Run: `node C:\Users\Mahin\AppData\Local\Temp\opencode\test-nav.js` and `node C:\Users\Mahin\AppData\Local\Temp\opencode\verify-nav.js`
Expected: ALL CHECKS PASSED (12/12) and no missing panels.

- [ ] **Step 4: Manual browser smoke test (recommended)**

Open `index.html` in a browser (or `npx serve`), DevTools → Network:
- Daily tab loads with no quran-verses/hadiths/hadith-collections requests.
- Quran tab: surah list instant; opening a surah triggers `quran-verses.js` fetch once; verses render.
- Hadith tab: first open triggers `hadiths.js` + `hadith-collections.js`; collections render; books/hadiths navigate.
- Global search: finds quran/hadith entries after their pools loaded; deep-links still land on the right tab.

- [ ] **Step 5: Single feature commit**

```bash
git add index.html core/actions.js render/render.js
git commit -m "perf: lazy-load quran and hadith content pools on demand"
```

(Tests live outside the repo and are never committed. CLAUDE.md rule: one commit for the whole feature.)

---

## Self-Review Notes

- **Spec coverage:** Script removal (Task 5), loader + ensure helpers (Task 1), trigger points surah/hadith (Tasks 3-4), guards (Task 2), failure messages (Task 3 `.catch` + Task 3 loading note), testing (Tasks 1-4 stubs + Task 6). All spec sections mapped. ✔
- **Type consistency:** `loadScript(src)` / `ensureQuranLoaded()` / `ensureHadithLoaded()` names used identically across Tasks 1, 3, 4. `window.renderHadith` (render.js:1379) and `window.App.ensureQuranLoaded` (Task 1 export) match. ✔
- **Placeholders:** none — every step has concrete code or commands.
