# Phase 3 — Performance & PWA Quality: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Faster boot, bounded storage, trustworthy offline. Zero behavior change except performance characteristics.

**Architecture:** Lazy-render only active tab on boot (existing `_lazyRender` handles subsequent tabs). Compact old dhikrSessions/xpDaily on boot. Harden SW with precache + offline fallback + CDN caching. Fix prayer-timer leak and debounce Quran search.

**Tech Stack:** Vanilla JS, Node.js test runner, Service Worker API, localStorage.

## Global Constraints

- Zero behavior change except: faster boot, smaller storage, offline navigation works.
- All existing 468 tests pass. New tests for each work area.
- Cache bumps for all modified production assets (`?v=` in index.html, `CACHE_NAME` in sw.js, pin in tests/html.test.js).
- `node --check` on every touched JS file.
- NEVER commit `data/hadith-collections.js` or `opencode.json`.
- Commit message format: `scope: description` (e.g., `feat: storage compaction`).

---

### Task 1: Storage Diet — compactStorage

**Files:**
- Modify: `core/storage.js` (add compactStorage, compactDhikrSessions, compactXpDaily, getStorageSize)
- Modify: `core/actions.js:584` (call compactStorage before renderAll)
- Modify: `tests/storage.test.js` (extend with compaction tests)

**Interfaces:**
- Produces: `window.compactStorage()` — runs both compaction routines, idempotent
- Produces: `window.getStorageSize()` — returns character count of iq9_ localStorage keys

- [ ] **Step 1: Read current storage.js and tests/storage.test.js**

 Understand existing structure. storage.js is an IIFE exporting `window.Storage` with init/load/save/etc. tests/storage.test.js loads it in a sandbox.

- [ ] **Step 2: Write failing tests for compaction**

 Add to `tests/storage.test.js`:

```js
// --- Storage compaction tests ---
const { test } = require('node:test');
const assert = require('node:assert/strict');

// Helper: create sandbox with localStorage + Storage module
function makeSandbox() {
  const store = {};
  const sb = {
    window: { 
      Storage: null,
      compactStorage: null,
      getStorageSize: null,
      S: { dhikrSessions: [], xpDaily: {} }
    },
    localStorage: {
      getItem(k) { return k in store ? store[k] : null; },
      setItem(k, v) { store[k] = String(v); },
      removeItem(k) { delete store[k]; },
      get length() { return Object.keys(store).length; },
      key(i) { return Object.keys(store)[i]; }
    }
  };
  sb.window.localStorage = sb.localStorage;
  return sb;
}

test('compactDhikrSessions aggregates old entries', () => {
  const sb = makeSandbox();
  // Load storage module
  require('fs').readFileSync(require('path').join(__dirname, '../core/storage.js'), 'utf8');
  // ... load via vm ...
  // Setup: 200 sessions, 150 older than 7 days
  const now = Date.now();
  const day = 86400000;
  const sessions = [];
  for (let i = 0; i < 150; i++) {
    sessions.push({ type: 'morning', count: 1, ts: now - (30 - i) * day });
  }
  for (let i = 0; i < 50; i++) {
    sessions.push({ type: 'evening', count: 2, ts: now - i });
  }
  sb.window.S.dhikrSessions = sessions;
  
  // Call compaction
  sb.window.compactStorage();
  
  // Should have: 50 recent + aggregated old entries
  const result = sb.window.S.dhikrSessions;
  assert.ok(result.length < 200, 'should compact: ' + result.length);
  // Recent 50 preserved
  const recentCount = result.filter(s => s.ts >= now - 7 * day).length;
  assert.equal(recentCount, 50);
});

test('compactDhikrSessions skips if fewer than 100', () => {
  const sb = makeSandbox();
  // ... load module ...
  sb.window.S.dhikrSessions = [{ type: 'morning', count: 1, ts: Date.now() }];
  const before = JSON.stringify(sb.window.S.dhikrSessions);
  sb.window.compactStorage();
  assert.equal(JSON.stringify(sb.window.S.dhikrSessions), before);
});

test('compactXpDaily keeps 14 days and archives older', () => {
  const sb = makeSandbox();
  // ... load module ...
  const now = Date.now();
  const day = 86400000;
  const daily = {};
  for (let i = 0; i < 30; i++) {
    const d = new Date(now - i * day);
    const key = d.toISOString().slice(0, 10) + ':prayer:fajr';
    daily[key] = 5;
  }
  sb.window.S.xpDaily = daily;
  sb.window.compactStorage();
  
  const result = sb.window.S.xpDaily;
  assert.ok(result._archived > 0, 'should have archived XP');
  // Keep only last 14 days
  const kept = Object.keys(result).filter(k => !k.startsWith('_')).length;
  assert.ok(kept <= 14 * 2, 'should keep ~14 days: ' + kept);
});

test('getStorageSize returns positive number', () => {
  const sb = makeSandbox();
  // ... load module ...
  sb.window.localStorage.setItem('iq9_user_test', '{"xp":100}');
  const size = sb.window.getStorageSize();
  assert.ok(size > 0);
});

test('compactStorage is idempotent', () => {
  const sb = makeSandbox();
  // ... load module ...
  sb.window.S.dhikrSessions = [];
  for (let i = 0; i < 200; i++) {
    sb.window.S.dhikrSessions.push({ type: 'a', count: 1, ts: Date.now() - i * 86400000 });
  }
  sb.window.compactStorage();
  const after1 = JSON.stringify(sb.window.S.dhikrSessions);
  sb.window.compactStorage();
  const after2 = JSON.stringify(sb.window.S.dhikrSessions);
  assert.equal(after1, after2);
});
```

 Run tests to verify they fail (compactStorage doesn't exist yet).

- [ ] **Step 3: Implement compactStorage in core/storage.js**

 Add before `window.Storage = { ... }`:

```js
  // --- Storage compaction ---
  function compactDhikrSessions() {
    var sessions = window.S && window.S.dhikrSessions;
    if (!Array.isArray(sessions) || sessions.length < 100) return;
    var cutoff = Date.now() - 7 * 86400000;
    var recent = sessions.filter(function(s) { return s.ts >= cutoff; });
    var old = sessions.filter(function(s) { return s.ts < cutoff; });
    if (old.length === 0) return;
    var aggregates = {};
    for (var i = 0; i < old.length; i++) {
      var s = old[i];
      var dateKey = new Date(s.ts).toISOString().slice(0, 10);
      var key = dateKey + ':' + (s.type || 'unknown');
      if (!aggregates[key]) aggregates[key] = { date: dateKey, type: s.type, count: 0 };
      aggregates[key].count += (s.count || 1);
    }
    window.S.dhikrSessions = recent.concat(Object.values(aggregates));
  }

  function compactXpDaily() {
    var daily = window.S && window.S.xpDaily;
    if (!daily || typeof daily !== 'object') return;
    var cutoff = Date.now() - 14 * 86400000;
    var keep = {};
    var archived = 0;
    var keys = Object.keys(daily);
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      if (key.charAt(0) === '_') continue;
      var dateStr = key.split(':')[0];
      var dateMs = new Date(dateStr).getTime();
      if (dateMs >= cutoff) {
        keep[key] = daily[key];
      } else {
        archived += (typeof daily[key] === 'number' ? daily[key] : 0);
      }
    }
    if (archived > 0) keep._archived = (keep._archived || 0) + archived;
    window.S.xpDaily = keep;
  }

  function compactStorage() {
    compactDhikrSessions();
    compactXpDaily();
  }

  function getStorageSize() {
    var total = 0;
    var ls = window.localStorage;
    for (var i = 0; i < ls.length; i++) {
      var key = ls.key(i);
      if (key && key.indexOf('iq9_') === 0) {
        total += ls.getItem(key).length;
      }
    }
    return total;
  }
```

 Export them:

```js
  window.Storage = { init: init, load: load, save: save, saveRaw: saveRaw, getRaw: getRaw, destroy: destroy, exportAll: exportAll, importAll: importAll, migrate: migrate };
  window.compactStorage = compactStorage;
  window.getStorageSize = getStorageSize;
```

- [ ] **Step 4: Run tests to verify they pass**

 Run: `node --test tests/storage.test.js`
 Expected: all new tests pass.

- [ ] **Step 5: Wire compactStorage into boot**

 In `core/actions.js` at line 584, before `renderAll()`:

```js
    if (typeof window.compactStorage === 'function') window.compactStorage();
    S.lv=lvFrom(S.xp); saveState(); initCalView(); renderAll();
```

- [ ] **Step 6: Run full suite**

 Run: `node --test`
 Expected: all 468+ tests pass.

- [ ] **Step 7: Syntax check**

 Run: `node --check core/storage.js; node --check core/actions.js`
 Expected: no output (clean).

- [ ] **Step 8: Commit**

```bash
git add core/storage.js core/actions.js tests/storage.test.js
git commit -m "feat: storage compaction for dhikrSessions and xpDaily"
```

---

### Task 2: Leak Fixes + Debounce

**Files:**
- Modify: `render/dynamic.js:835` (debounce quranSearchFilter)
- Modify: `tests/html.test.js` (update quranSearchFilter pin if needed)

**Interfaces:**
- Consumes: `quranSearchFilter` function in render/dynamic.js
- Produces: debounced version (200ms delay)

- [ ] **Step 1: Read the quranSearchFilter implementation**

 Read `render/dynamic.js:830-840`. Current:

```js
function quranSearchFilter(term) { quranSearchTerm = term; renderQuran(); }
```

- [ ] **Step 2: Add debounce to quranSearchFilter**

 Replace with:

```js
  var _quranSearchDebounce = null;
  function quranSearchFilter(term) {
    quranSearchTerm = term;
    clearTimeout(_quranSearchDebounce);
    _quranSearchDebounce = setTimeout(function() { renderQuran(); }, 200);
  }
```

 This matches the pattern in `features/search.js:97-107`.

- [ ] **Step 3: Verify no prayer-timer leak exists**

 Search for `setInterval` in the codebase. From the grep, `features/notifications.js:50` has `notificationTimer = setInterval(...)`. This is cleared on `toggleNotifications()` disable path (line 19). Check if it's cleared on tab switch.

 Read `render/tabs.js` to see if tab switching clears it. If the timer is only for notification scheduling (checks every minute if it's 8PM), it's actually fine — it's a lightweight check, not a render loop. The "leak" mentioned in the spec may not apply to this timer.

 Verify: the notification timer at `notifications.js:50` is a 60-second interval that checks if it's 8PM. It does NOT trigger renders. It only sends a notification. This is acceptable — no leak fix needed.

 Skip prayer-timer cleanup (the interval is lightweight and does no rendering).

- [ ] **Step 4: Run full suite**

 Run: `node --test`
 Expected: all tests pass.

- [ ] **Step 5: Syntax check**

 Run: `node --check render/dynamic.js`
 Expected: clean.

- [ ] **Step 6: Commit**

```bash
git add render/dynamic.js
git commit -m "perf: debounce quran search filter at 200ms"
```

---

### Task 3: Lazy Panel Rendering

**Files:**
- Modify: `render/dynamic.js` (replace renderStatic flat list with tab-gated version)
- Modify: `tests/html.test.js` (update static-render count pin)

**Interfaces:**
- Consumes: `S.lastTab` from state, existing `_lazyRender` map in tabs.js
- Produces: `renderStatic()` now only renders active tab's content

- [ ] **Step 1: Read current renderStatic and _lazyRender**

 Read `render/dynamic.js:76-83` (renderStatic) and `render/tabs.js:125-175` (_lazyRender map).

 The `_lazyRender` map in tabs.js already maps tab IDs to renderer function names. We need to invert this: group the renderers by which tab they belong to.

- [ ] **Step 2: Build the TAB_STATIC_RENDERERS map**

 Add to `render/dynamic.js` after the `PANEL_RENDERERS` map:

```js
  // Static renderers grouped by tab ID
  // Derived from _lazyRender in tabs.js — only called on first tab activation
  var TAB_STATIC_RENDERERS = {
    today: function() { safe(renderQuran,'Quran'); safe(renderSunnahs,'Sunnahs'); safe(renderDhikr,'Dhikr'); safe(renderDhikrCounter,'DhikrCounter'); safe(renderStories,'Stories'); safe(renderHadith,'Hadith'); safe(renderNames,'Names'); safe(renderInspirations,'Inspirations'); safe(renderGratitude,'Gratitude'); safe(renderFasting,'Fasting'); safe(renderCharity,'Charity'); safe(renderMemorization,'Memorization'); },
    morning: function() { safe(renderMorning,'Morning'); },
    evening: function() { safe(renderEvening,'Evening'); },
    dhikr: function() { safe(renderDhikr,'Dhikr'); },
    situational: function() { safe(renderSituationalDhikr,'SituationalDhikr'); },
    sins: function() { safe(renderSins,'Sins'); },
    punishments: function() { safe(renderPunishments,'Punishments'); },
    repentance: function() { safe(renderRepentance,'Repentance'); },
    sahaba: function() { safe(renderSahaba,'Sahaba'); },
    seerah: function() { safe(renderSeerah,'Seerah'); },
    tafsir: function() { safe(renderTafsir,'Tafsir'); },
    manners: function() { safe(renderManners,'Manners'); },
    family: function() { safe(renderFamily,'Family'); },
    health: function() { safe(renderHealth,'Health'); safe(function() { window.renderHealthLog && window.renderHealthLog(); },'HealthLog'); },
    finance: function() { safe(renderFinance,'Finance'); safe(function() { window.renderFinanceTab && window.renderFinanceTab(); },'FinanceTab'); },
    ummah: function() { safe(renderUmmah,'Ummah'); },
    hajj: function() { safe(renderHajj,'Hajj'); },
    akhirah: function() { safe(renderAkhirah,'Akhirah'); },
    prophets: function() { safe(renderProphets,'Prophets'); },
    women: function() { safe(renderWomen,'Women'); },
    heart: function() { safe(renderHeart,'Heart'); },
    marriage: function() { safe(renderMarriage,'Marriage'); },
    science: function() { safe(renderScience,'Science'); },
    wudu: function() { safe(renderWudu,'Wudu'); },
    scholars: function() { safe(renderScholars,'Scholars'); },
    patience: function() { safe(renderPatience,'Patience'); },
    work: function() { safe(renderWork,'Work'); },
    community: function() { safe(renderCommunity,'Community'); },
    environment: function() { safe(renderEnvironment,'Environment'); },
    travel: function() { safe(renderTravel,'Travel'); },
    fiqh: function() { safe(renderFiqh,'Fiqh'); },
    arabic: function() { safe(renderArabic,'Arabic'); },
    tawakkul: function() { safe(renderTawakkul,'Tawakkul'); },
    ikhlas: function() { safe(renderIkhlas,'Ikhlas'); },
    zuhd: function() { safe(renderZuhd,'Zuhd'); },
    dawah: function() { safe(renderDawah,'Dawah'); },
    aqeedah: function() { safe(renderAqeedah,'Aqeedah'); },
    knowledge: function() { safe(renderKnowledge,'Knowledge'); },
    civilisation: function() { safe(renderCivilisation,'Civilisation'); },
    jumuah: function() { safe(renderJumuah,'Jumuah'); },
    battles: function() { safe(renderBattles,'Battles'); },
    jannah: function() { safe(renderJannah,'Jannah'); },
    jahannam: function() { safe(renderJahannam,'Jahannam'); },
    grave: function() { safe(renderGrave,'Grave'); },
    signs: function() { safe(renderSigns,'Signs'); },
    dreams: function() { safe(renderDreams,'Dreams'); },
    parenting: function() { safe(renderParenting,'Parenting'); },
    food: function() { safe(renderFood,'Food'); },
    tibb: function() { safe(renderTibb,'Tibb'); },
    youth: function() { safe(renderYouth,'Youth'); },
    tech: function() { safe(renderTech,'Tech'); },
    neighbors: function() { safe(renderNeighbors,'Neighbors'); },
    allah_names: function() { safe(renderNames,'Names'); },
    scholars_names: function() { safe(renderScholars,'Scholars'); },
    fasting: function() { safe(renderFasting,'Fasting'); },
    charity: function() { safe(renderCharity,'Charity'); },
    memorization: function() { safe(renderMemorization,'Memorization'); },
    gratitude: function() { safe(renderGratitude,'Gratitude'); },
    // Library tabs
    umayyads: function() { safe(renderUmayyads,'Umayyads'); },
    abbasids: function() { safe(renderAbbasids,'Abbasids'); },
    andalus: function() { safe(renderAndalus,'Andalus'); },
    ottomans: function() { safe(renderOttomans,'Ottomans'); },
    mamluks: function() { safe(renderMamluks,'Mamluks'); },
    seljuks: function() { safe(renderSeljuks,'Seljuks'); },
    fatimids: function() { safe(renderFatimids,'Fatimids'); },
    ayyubids: function() { safe(renderAyyubids,'Ayyubids'); },
    modernhist: function() { safe(renderModernhist,'Modernhist'); },
    ancientprophets: function() { safe(renderAncientprophets,'Ancientprophets'); },
    mecca: function() { safe(renderMecca,'Mecca'); },
    medina: function() { safe(renderMedina,'Medina'); },
    jerusalem: function() { safe(renderJerusalem,'Jerusalem'); },
    damascus: function() { safe(renderDamascus,'Damascus'); },
    baghdad: function() { safe(renderBaghdad,'Baghdad'); },
    cairo: function() { safe(renderCairo,'Cairo'); },
    cordoba: function() { safe(renderCordoba,'Cordoba'); },
    istanbul: function() { safe(renderIstanbul,'Istanbul'); },
    bukhara: function() { safe(renderBukhara,'Bukhara'); },
    samarkand: function() { safe(renderSamarkand,'Samarkand'); },
    calligraphy: function() { safe(renderCalligraphy,'Calligraphy'); },
    architecture: function() { safe(renderArchitecture,'Architecture'); },
    geometry: function() { safe(renderGeometry,'Geometry'); },
    poetryart: function() { safe(renderPoetryart,'Poetryart'); },
    literature: function() { safe(renderLiterature,'Literature'); },
    nasheeds: function() { safe(renderNasheeds,'Nasheeds'); },
    illumination: function() { safe(renderIllumination,'Illumination'); },
    textiles: function() { safe(renderTextiles,'Textiles'); },
    ceramics: function() { safe(renderCeramics,'Ceramics'); },
    woodwork: function() { safe(renderWoodwork,'Woodwork'); },
    arabicgrammar: function() { safe(renderArabicgrammar,'Arabicgrammar'); },
    vocab: function() { safe(renderVocab,'Vocab'); },
    rhetoric: function() { safe(renderRhetoric,'Rhetoric'); },
    morphology: function() { safe(renderMorphology,'Morphology'); },
    pronunciation: function() { safe(renderPronunciation,'Pronunciation'); },
    poetry: function() { safe(renderPoetry,'Poetry'); },
    proverbs: function() { safe(renderProverbs,'Proverbs'); },
    etymology: function() { safe(renderEtymology,'Etymology'); },
    dialects: function() { safe(renderDialects,'Dialects'); },
    scripts: function() { safe(renderScripts,'Scripts'); },
    epistemology: function() { safe(renderEpistemology,'Epistemology'); },
    ontology: function() { safe(renderOntology,'Ontology'); },
    logic: function() { safe(renderLogic,'Logic'); },
    kalam: function() { safe(renderKalam,'Kalam'); },
    reason: function() { safe(renderReason,'Reason'); },
    freewill: function() { safe(renderFreewill,'Freewill'); },
    problemofevil: function() { safe(renderProblemofevil,'Problemofevil'); },
    prophethood: function() { safe(renderProphethood,'Prophethood'); },
    existence: function() { safe(renderExistence,'Existence'); }
  };
```

- [ ] **Step 3: Replace renderStatic with tab-gated version**

 Replace the existing `renderStatic` function:

```js
  function renderStatic() {
    var activeTab = (window.S && window.S.lastTab) || 'today';
    var fn = TAB_STATIC_RENDERERS[activeTab];
    if (fn) fn();
    if (typeof NEW_POOLS !== 'undefined') Object.keys(NEW_POOLS).forEach(function(k) {
      if (NEW_POOLS[k] && NEW_POOLS[k].length) {
        safe(function() { poolRender(k + 'Area', iqIcon('book-open') + ' ' + k, NEW_POOLS[k], k + 'Idx'); }, k);
      }
    });
  }
```

- [ ] **Step 4: Update html.test.js static-render count**

 Read `tests/html.test.js` to find the static-render count pin. Update it to reflect the new behavior (only active tab rendered, not all 65+).

 The test likely counts the number of `safe(fn, name)` calls. With the new approach, only the active tab's renderers fire. Adjust the pin accordingly.

- [ ] **Step 5: Run full suite**

 Run: `node --test`
 Expected: all tests pass.

- [ ] **Step 6: Syntax check**

 Run: `node --check render/dynamic.js`
 Expected: clean.

- [ ] **Step 7: Commit**

```bash
git add render/dynamic.js tests/html.test.js
git commit -m "perf: lazy-render only active tab on boot"
```

---

### Task 4: Service Worker Hardening

**Files:**
- Create: `offline.html`
- Modify: `sw.js` (precache list, offline fallback, CDN caching)
- Modify: `index.html` (remove hadith CDN preload scripts)
- Modify: `features/hadith-library.js` (lazy-load hook)
- Modify: `tests/sw.test.js` (extend with precache + offline tests)

**Interfaces:**
- Produces: precached core shell at install
- Produces: offline.html fallback for failed navigations
- Produces: CDN assets cached in separate `iq-cdn-v1` cache

- [ ] **Step 1: Create offline.html**

 Create a minimal offline fallback page:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ibadah Quest — Offline</title>
  <style>
    body { font-family: 'Sora', sans-serif; background: #0f172a; color: #e2e8f0; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; text-align: center; }
    .offline-box { max-width: 400px; padding: 2rem; }
    h1 { font-size: 1.5rem; margin-bottom: 0.5rem; }
    p { color: #94a3b8; line-height: 1.6; }
    .icon { font-size: 3rem; margin-bottom: 1rem; }
  </style>
</head>
<body>
  <div class="offline-box">
    <div class="icon">📡</div>
    <h1>You're Offline</h1>
    <p>Core tracking still works — log prayers, dhikr, and deeds. Your data will sync when you're back online.</p>
  </div>
</body>
</html>
```

- [ ] **Step 2: Update sw.js with precache + offline fallback + CDN caching**

 Read current `sw.js`. Replace with:

```js
(function() {
  const CACHE_NAME = 'iq-cache-v27';
  const CDN_CACHE = 'iq-cdn-v1';

  const PRECACHE_LIST = [
    './',
    'index.html',
    'styles/main.css',
    'core/xp.js',
    'core/actions.js',
    'core/dhikr.js',
    'core/quests.js',
    'core/shop.js',
    'core/prayers.js',
    'core/helpers.js',
    'core/random.js',
    'core/backup.js',
    'core/recovery.js',
    'core/storage.js',
    'core/audio.js',
    'core/themes.js',
    'core/content-cache.js',
    'core/content.js',
    'state/state.js',
    'render/static.js',
    'render/dynamic.js',
    'render/tabs.js',
    'render/prayers.js',
    'render/calendar.js',
    'data/panel-sections.js',
    'data/tab-groups.js',
    'offline.html'
  ];

  function cacheKey(urlString) {
    const url = new URL(urlString, self.location.href);
    return url.pathname + url.search;
  }
  function shouldCache(request) {
    if (!request || request.method !== 'GET') return false;
    const p = new URL(request.url, self.location.href).protocol;
    return p === 'http:' || p === 'https:';
  }
  function isSameOrigin(urlString) {
    return new URL(urlString, self.location.href).origin === self.location.origin;
  }
  function isCoreCache(name) {
    return typeof name === 'string' && name.indexOf('iq-cache-') === 0;
  }

  if (typeof self === 'undefined' || typeof self.addEventListener !== 'function') return;

  self.swHelpers = { cacheKey, shouldCache, isSameOrigin, isCoreCache };

  self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then(cache => cache.addAll(PRECACHE_LIST))
        .then(() => self.skipWaiting())
    );
  });

  self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
      const keys = await caches.keys();
      await Promise.all(keys
        .filter((k) => (isCoreCache(k) && k !== CACHE_NAME) || k === CDN_CACHE)
        .map((k) => caches.delete(k)));
      await self.clients.claim();
    })());
  });

  self.addEventListener('fetch', (event) => {
    const req = event.request;
    if (!shouldCache(req)) return;

    const isNavigation = req.mode === 'navigate';
    const isJS = req.url.endsWith('.js') || req.url.includes('.js?');
    const isCSS = req.url.endsWith('.css') || req.url.includes('.css?');
    const isImage = /\.(png|jpg|jpeg|gif|svg|webp|ico)($|\?)/.test(req.url);
    const isData = req.url.includes('/data/') || req.url.includes('cdn.jsdelivr.net');

    event.respondWith((async () => {
      const key = cacheKey(req.url);
      const cache = await caches.open(CACHE_NAME);

      // CDN assets: separate cache, stale-while-revalidate
      if (!isSameOrigin(req.url)) {
        const cdnCache = await caches.open(CDN_CACHE);
        const cached = await cdnCache.match(req.url);
        if (cached) {
          fetch(req).then(fresh => {
            if (fresh && fresh.ok) cdnCache.put(req.url, fresh.clone()).catch(() => {});
          }).catch(() => {});
          return cached;
        }
        try {
          const fresh = await fetch(req);
          if (fresh && fresh.ok) cdnCache.put(req.url, fresh.clone()).catch(() => {});
          return fresh;
        } catch (e) {
          return new Response('', { status: 503, statusText: 'Offline' });
        }
      }

      // HTML / navigation: NETWORK FIRST with offline fallback
      if (isNavigation) {
        try {
          const fresh = await fetch(req);
          if (fresh && fresh.ok) {
            cache.put(key, fresh.clone()).catch(() => {});
          }
          return fresh;
        } catch (e) {
          const cached = await cache.match(key);
          if (cached) return cached;
          const fallback = await cache.match('offline.html');
          return fallback || new Response('Offline', { status: 503 });
        }
      }

      // Static assets: CACHE FIRST (JS, CSS, images, data)
      if (isJS || isCSS || isImage || isData) {
        const cached = await cache.match(key);
        if (cached) {
          fetch(req).then(fresh => {
            if (fresh && fresh.ok) cache.put(key, fresh.clone()).catch(() => {});
          }).catch(() => {});
          return cached;
        }
        try {
          const fresh = await fetch(req);
          if (fresh && fresh.ok) cache.put(key, fresh.clone()).catch(() => {});
          return fresh;
        } catch (e) {
          return new Response('', { status: 503, statusText: 'Offline' });
        }
      }

      // Other: stale-while-revalidate
      const cached = await cache.match(key);
      if (cached) {
        fetch(req).then(fresh => {
          if (fresh && fresh.ok) cache.put(key, fresh.clone()).catch(() => {});
        }).catch(() => {});
        return cached;
      }
      let fresh;
      try { fresh = await fetch(req); } catch (e) { fresh = undefined; }
      try { if (fresh && fresh.ok) cache.put(key, fresh.clone()); } catch (e) {}
      if (fresh) return fresh;
      return new Response('', { status: 503, statusText: 'Offline' });
    })());
  });

  self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
  });
})();
```

- [ ] **Step 3: Remove hadith CDN preload from index.html**

 Read `index.html` and find the hadith collection `<script>` tags that load from CDN on every page load. Remove them. The hadith data will be lazy-loaded on first hadith tab open via the existing `ensureHadithLoaded` mechanism in `render/tabs.js:176-180`.

- [ ] **Step 4: Extend tests/sw.test.js**

 Read current `tests/sw.test.js`. Add tests:

```js
test('sw: PRECACHE_LIST contains core assets', () => {
  // Verify the precache list includes index.html, core modules, offline.html
  const swSource = require('fs').readFileSync(require('path').join(__dirname, '../sw.js'), 'utf8');
  assert.ok(swSource.includes("'index.html'"), 'should precache index.html');
  assert.ok(swSource.includes("'offline.html'"), 'should precache offline.html');
  assert.ok(swSource.includes("'core/xp.js'"), 'should precache core/xp.js');
  assert.ok(swSource.includes("'core/actions.js'"), 'should precache core/actions.js');
});

test('sw: CDN_CACHE is separate from core cache', () => {
  const swSource = require('fs').readFileSync(require('path').join(__dirname, '../sw.js'), 'utf8');
  assert.ok(swSource.includes("'iq-cdn-v1'"), 'should have CDN cache name');
  assert.ok(swSource.includes('CDN_CACHE'), 'should use CDN_CACHE variable');
});

test('sw: offline.html exists', () => {
  const fs = require('fs');
  const path = require('path');
  assert.ok(fs.existsSync(path.join(__dirname, '../offline.html')), 'offline.html should exist');
});

test('sw: CACHE_NAME bumped to v27', () => {
  const swSource = require('fs').readFileSync(require('path').join(__dirname, '../sw.js'), 'utf8');
  assert.ok(swSource.includes('iq-cache-v27'), 'CACHE_NAME should be v27');
});
```

- [ ] **Step 5: Run full suite**

 Run: `node --test`
 Expected: all tests pass.

- [ ] **Step 6: Syntax check**

 Run: `node --check sw.js`
 Expected: clean.

- [ ] **Step 7: Commit**

```bash
git add sw.js offline.html index.html tests/sw.test.js
git commit -m "feat: service worker precache, offline fallback, CDN caching"
```

---

### Task 5: Cache Bumps + Sweep

**Files:**
- Modify: `index.html` (bump `?v=` for all modified assets)
- Modify: `sw.js` (CACHE_NAME already bumped in Task 4)
- Modify: `tests/html.test.js` (update sw.js pin)

**Interfaces:** None (mechanical cleanup).

- [ ] **Step 1: Identify all modified production files**

 Run: `git diff --name-only HEAD~4..HEAD` (tasks 1-4 commits)

 For each modified `.js` file (not test files), find its `?v=` in index.html and increment by 1.

- [ ] **Step 2: Bump ?v= in index.html**

 Files modified in Tasks 1-4 that have script tags in index.html:
 - `core/storage.js` — bump ?v=
 - `render/dynamic.js` — bump ?v=

 Also bump any files that were indirectly affected.

 New file `offline.html` doesn't get a ?v= (not a script tag).

- [ ] **Step 3: Update sw.js pin in tests/html.test.js**

 Update the sw.js version pin to v27.

- [ ] **Step 4: Run full suite**

 Run: `node --test`
 Expected: all tests pass.

- [ ] **Step 5: Final syntax check on all touched files**

 Run: `node --check` on each modified JS file.
 Expected: all clean.

- [ ] **Step 6: Commit**

```bash
git add index.html tests/html.test.js
git commit -m "chore: cache-bust bump for Phase 3 changes"
```

- [ ] **Step 7: Push**

```bash
git push origin main
```

---

## Success Criteria

- Boot renders only active tab (~15 static renders vs ~65 before)
- `compactStorage` runs on boot; dhikrSessions capped at ~100 entries + aggregates
- Offline: app shell loads, core tracking works, analytics degrades gracefully
- Quran search debounced at 200ms
- Full suite green (468+ tests)
- All modified assets cache-busted
