# Phase 3 — Performance & PWA Quality: Design Spec

## Problem

Phase 2 cleaned up architecture and consolidated duplication. The app now has 468 tests and a clear module structure, but performance and PWA reliability remain weak:

1. **Boot cost:** `renderStatic()` fires ~65 renderers on every boot for ALL panels, including hidden ones. Only the active tab's content is visible. Wasted work scales with feature count.
2. **Offline failure:** Service worker install does nothing (no precache list). Navigation failures return bare `Response.error()`. CDN assets (fonts, Chart.js) are never cached, so analytics break offline.
3. **Unbounded storage:** `dhikrSessions` appends one object per tap forever; `xpDaily` accumulates one entry per XP-granting action per day forever. No pruning. Quota exhaustion = data loss.
4. **Leak + jank:** Prayer-timer `setInterval` leaks after tab change. Quran search rebuilds its entire DOM list per keystroke (no debounce).

## Goal

Faster boot, bounded storage, trustworthy offline. Zero behavior change except performance characteristics.

## Guiding Constraints

- Zero behavior change except: faster boot, smaller storage footprint, offline navigation works.
- All existing 468 tests pass. New tests for each work area.
- Cache bumps for all modified production assets.
- `node --check` on every touched file.

---

## §1 Lazy Panel Rendering

### Current State

`renderStatic()` in `render/dynamic.js:76` calls ~65 named render functions unconditionally on every `renderAll()` invocation. `renderAll()` is called at boot (`initApp` → `finishInit`) and on any `markDirty()` storm. Hidden panels (e.g., knowledge sub-tabs, growth widgets, finance) are rendered even though the user never scrolls to them.

`renderDynamic()` already has a dirty-panel system (`dirtyPanels` Set + `PANEL_RENDERERS` map). `renderStatic()` has no equivalent — it's a flat list of `safe(fn, name)` calls.

### Design

**Key insight:** `activateTab()` in `render/tabs.js:125-175` already has a `_lazyRender` map that renders per-tab content on first activation. The problem is that `renderStatic()` in `render/dynamic.js:76` ALSO fires ~65 renderers unconditionally on boot, duplicating and pre-rendering everything.

**Fix:** Replace `renderStatic()`'s flat call list with a gated version that only renders content for the initially-active tab. The existing `_lazyRender` mechanism handles all subsequent tab switches.

**Step 1: Build a tab→renderers map** from the existing `_lazyRender` in `render/tabs.js` and the `renderStatic()` call list. Each tab ID maps to the static render functions that belong to it.

**Step 2: Gate `renderStatic()` to render only the active tab:**

```js
function renderStatic() {
  // Only render content for the currently-active tab
  const activeTab = (window.S && S.lastTab) || 'today';
  const renderers = TAB_STATIC_RENDERERS[activeTab];
  if (!renderers) return;
  for (const [name, fn] of Object.entries(renderers)) {
    safe(fn, name);
  }
  // NEW_POOLS loop for knowledge sub-tabs
}
```

**Step 3: On tab switch**, the existing `_lazyRender` in `activateTab()` already calls the right renderer on first visit. No changes needed there — it's already lazy.

**Step 4: `renderAll()`** calls `renderStatic()` (which now only renders active tab) + `renderDynamic()` (which renders all dirty panels).

**Tab→static renderers mapping** (derived from `_lazyRender` in tabs.js and the `renderStatic()` call list):

| Tab group | Tabs | Static renderers |
|-----------|------|-----------------|
| ibadah/core | today | renderQuran, renderSunnahs, renderDhikr, renderDhikrCounter, renderStories, renderHadith, renderNames, renderInspirations, renderGratitude, renderFasting, renderCharity, renderMemorization |
| ibadah/adhkar | morning, evening, dhikr, situational | renderMorning, renderEvening, renderDhikr, renderSituationalDhikr |
| ibadah/worship | wudu, salah, sunnahs, extradeeds, volprayers | renderWudu, renderSalah, renderSunnahs, renderExtraDeeds, renderVolPrayers |
| ibadah/tracking | fasting, healthlog, finance, memorization, gratitude, charity, zakatcalc | renderFasting, renderHealthLog, renderFinanceTab, renderMemorization, renderGratitude, renderCharity, renderZakatCalc |
| knowledge/quran_sunnah | quran, hadith, tafsir, seerah | renderQuran, renderHadith, renderTafsir, renderSeerah |
| knowledge/heart | aqeedah, heart, ikhlas, tawakkul, manners, patience, sins, repentance, zuhd, inspirations, stories | renderAqeedah, renderHeart, renderIkhlas, renderTawakkul, renderManners, renderPatience, renderSins, renderRepentance, renderZuhd, renderInspirations, renderStories |
| knowledge/society | family, marriage, parenting, work, neighbors, community, ummah, dawah, punishments, brotherhood, sisterhood, orphans2, elderly, disabled, antiracism, poverty, volunteering | renderFamily, renderMarriage, renderParenting, renderWork, renderNeighbors, renderCommunity, renderUmmah, renderDawah, renderPunishments, renderBrotherhood, renderSisterhood, renderOrphans2, renderElderly, renderDisabled, renderAntiracism, renderPoverty, renderVolunteering |
| knowledge/life | health, tibb, food, environment, travel, youth, tech, science, etc. | renderHealth, renderTibb, renderFood, renderEnvironment, renderTravel, renderYouth, renderTech, renderScience + NEW_POOLS |
| knowledge/hereafter | akhirah, jannah, jahannam, grave, signs | renderAkhirah, renderJannah, renderJahannam, renderGrave, renderSigns |
| names_main | allah_names, prophets, scholars_names, sahaba, women | renderNames, renderProphets, renderScholars, renderSahaba, renderWomen |
| library/* | dynasties, cities, arts, arabic_lang, philosophy sub-tabs | all library pool renderers |

### Files Changed

- `render/dynamic.js` — split `renderStatic()`, add `renderStaticForTab()`, `STATIC_RENDERERS` map, `renderedStaticTabs` Set
- `render/tabs.js` — `activateTab()` calls `renderStaticForTab(newTab)`
- `tests/html.test.js` — update static-render pin (count changes from full-list to per-tab)

### Test Plan

- Existing `html.test.js` static-render pin updated to reflect new split structure
- New test: `renderStaticForTab('knowledge')` renders knowledge pools; subsequent call is no-op (idempotent)
- New test: `renderAll()` only renders active tab's static content
- Verify all 468 existing tests still pass (render functions unchanged, just called lazily)

---

## §2 Service Worker Hardening

### Current State

`sw.js` (114 lines):
- `install` event: `skipWaiting()` only — no precache list
- `activate` event: deletes old caches, claims clients
- `fetch` event: network-first for navigation (returns `Response.error()` on failure), cache-first for static assets, stale-while-revalidate for "other"
- CDN assets (fonts.googleapis.com, fonts.gstatic.com, cdn.jsdelivr.net) marked as `!isSameOrigin` → **skipped entirely** by the fetch handler

### Design

#### 2a. Precache core shell at install

Add a `PRECACHE_LIST` array of core assets to cache during `install`:

```js
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
  'sw.js',
  'offline.html'
];
```

In `install` event:

```js
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_LIST))
      .then(() => self.skipWaiting())
  );
});
```

#### 2b. Offline fallback page

Create `offline.html` — a minimal page that:
- Shows "You're offline" message
- Explains core tracking still works
- Has a simple styled layout matching the app's theme
- Is included in the precache list

Modify navigation fallback in `sw.js`:

```js
// Instead of: return Response.error();
const fallback = await cache.match('offline.html');
return fallback || Response.error();
```

#### 2c. Runtime caching for CDN assets

Add a separate CDN cache with stale-while-revalidate:

```js
const CDN_CACHE = 'iq-cdn-v1';

// In fetch handler, before the isSameOrigin return:
if (!isSameOrigin(req.url)) {
  const cached = await caches.open(CDN_CACHE).then(c => c.match(req.url));
  if (cached) {
    fetch(req).then(fresh => {
      if (fresh && fresh.ok) caches.open(CDN_CACHE).then(c => c.put(req.url, fresh.clone()));
    }).catch(() => {});
    return cached;
  }
  try {
    const fresh = await fetch(req);
    if (fresh && fresh.ok) caches.open(CDN_CACHE).then(c => c.put(req.url, fresh.clone()));
    return fresh;
  } catch (e) {
    return Response.error();
  }
}
```

#### 2d. Lazy-load hadith collections

Remove the 6-file CDN preload from `index.html`. Instead, fetch hadith data on first hadith tab open (in `features/hadith-library.js`):

```js
let loaded = false;
async function ensureHadithData() {
  if (loaded) return;
  loaded = true;
  // fetch and cache hadith collections on first open
}
```

### Files Changed

- `sw.js` — precache list, offline fallback, CDN caching
- `offline.html` — new file
- `index.html` — remove hadith CDN preload `<script>` tags
- `features/hadith-library.js` — lazy-load hook
- `tests/sw.test.js` — extend with precache + offline tests

### Test Plan

- `sw.test.js`: verify `PRECACHE_LIST` contains expected assets
- `sw.test.js`: verify offline fallback serves `offline.html` on navigation failure
- `sw.test.js`: verify CDN assets are cached in separate cache
- `sw.test.js`: verify `skipWaiting` still works
- All 468 existing tests pass

---

## §3 Storage Diet

### Current State

- `dhikrSessions`: array of `{type, count, ts}` objects, one per tap. After months of daily dhikr, this can grow to thousands of entries.
- `xpDaily`: object with keys like `2026-08-27:prayer:fajr:5`, `2026-08-27:dhikr:morning:3`, etc. One key per XP-granting action per day. Grows ~20-50 keys/day.
- No pruning ever runs. Both grow until localStorage quota (~5MB) is hit.

### Design

#### 3a. `compactStorage()` in `core/storage.js`

Runs once on boot after `normalizeState()`.

**dhikrSessions compaction:**

```js
function compactDhikrSessions() {
  const sessions = S.dhikrSessions;
  if (!Array.isArray(sessions) || sessions.length < 100) return; // skip if small
  
  const cutoff = Date.now() - 7 * 86400000; // 7 days ago
  const recent = sessions.filter(s => s.ts >= cutoff);
  const old = sessions.filter(s => s.ts < cutoff);
  
  if (old.length === 0) return; // nothing to compact
  
  // Aggregate old entries by date + type
  const aggregates = {};
  for (const s of old) {
    const dateKey = new Date(s.ts).toISOString().slice(0, 10);
    const key = dateKey + ':' + (s.type || 'unknown');
    if (!aggregates[key]) aggregates[key] = { date: dateKey, type: s.type, count: 0 };
    aggregates[key].count += s.count || 1;
  }
  
  // Replace: keep recent raw + aggregated old
  S.dhikrSessions = recent.concat(Object.values(aggregates));
}
```

**xpDaily compaction:**

```js
function compactXpDaily() {
  const daily = S.xpDaily;
  if (!daily || typeof daily !== 'object') return;
  
  const cutoff = Date.now() - 14 * 86400000;
  const keep = {};
  let archived = 0;
  
  for (const [key, val] of Object.entries(daily)) {
    if (key.startsWith('_')) continue; // skip meta keys
    const dateStr = key.split(':')[0];
    const dateMs = new Date(dateStr).getTime();
    if (dateMs >= cutoff) {
      keep[key] = val;
    } else {
      archived += (typeof val === 'number' ? val : 0);
    }
  }
  
  if (archived > 0) {
    keep._archived = (keep._archived || 0) + archived;
  }
  
  S.xpDaily = keep;
}
```

#### 3b. `getStorageSize()` telemetry

```js
function getStorageSize() {
  let total = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('iq9_')) {
      total += localStorage.getItem(key).length;
    }
  }
  return total; // characters (×2 bytes for UTF-16)
}
```

#### 3c. Boot integration

In `core/actions.js` `initApp()`, after `normalizeState()` and before `renderAll()`:

```js
compactStorage();
```

#### 3d. Export includes raw detail

Backup export (`core/backup.js`) continues to export `S.dhikrSessions` and `S.xpDaily` as-is (post-compaction). This is acceptable because:
- Aggregated data preserves all derived stats
- Raw detail older than 7/14 days is low-value for backup
- Future: could add "full export" option if needed

### Files Changed

- `core/storage.js` — `compactStorage()`, `compactDhikrSessions()`, `compactXpDaily()`, `getStorageSize()`
- `core/actions.js` — call `compactStorage()` in boot sequence
- `tests/storage.test.js` — extend with compaction tests

### Test Plan

- `compactDhikrSessions`: 200 sessions, 150 older than 7 days → compacted to 50 recent + aggregated summaries
- `compactDhikrSessions`: fewer than 100 sessions → no-op
- `compactXpDaily`: 30 days of entries → keeps 14 days + `_archived` sum
- `compactXpDaily`: already compact → no change
- `getStorageSize`: returns positive number after state load
- `compactStorage`: idempotent (running twice produces same result)
- All 468 existing tests pass

---

## §4 Leak Fixes + Debounce

### 4a. Prayer-timer interval cleanup

**Problem:** `core/actions.js` or `features/notifications.js` starts a `setInterval` for prayer timer. When user navigates to another tab, the interval continues firing, causing unnecessary renders and potential memory leaks.

**Solution:**
- Store timer interval ID in a module-level variable
- On `activateTab()`: if leaving the prayer/timer tab, `clearInterval()` and set ID to null
- On re-entry: restart the interval

**Files:** `core/actions.js` or `features/notifications.js` (timer lifecycle), `render/tabs.js` (tab switch cleanup)

### 4b. Quran search debounce

**Problem:** Quran search (likely in `features/search.js` or `render/static.js`) rebuilds the entire result list on every `input` event. With large result sets, this causes jank.

**Solution:**
- Wrap the search handler in a 200ms debounce (matching the pattern already used by global search in `features/search.js`):

```js
let searchTimeout;
input.addEventListener('input', () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => { /* existing handler */ }, 200);
});
```

**Files:** `features/search.js` or wherever Quran search handler is defined

### Test Plan

- Timer cleanup: start timer → switch tab → verify interval cleared → switch back → verify restarted
- Debounce: rapid input events → handler called only once after 200ms pause
- All 468 existing tests pass

---

## Task Sequencing

| Task | Area | Files | Risk |
|------|------|-------|------|
| 1 | Storage diet | `core/storage.js`, `core/actions.js`, `tests/storage.test.js` | Low (isolated, no UI) |
| 2 | Leak fixes + debounce | `core/actions.js` or `features/notifications.js`, `features/search.js` | Low (targeted) |
| 3 | Lazy panel rendering | `render/dynamic.js`, `render/tabs.js`, `tests/html.test.js` | Medium (render path) |
| 4 | Service worker hardening | `sw.js`, `offline.html`, `index.html`, `features/hadith-library.js`, `tests/sw.test.js` | Medium (offline behavior) |
| 5 | Cache bumps + sweep | `index.html`, `sw.js`, `tests/html.test.js` | Low (mechanical) |

Tasks 1-2 are independent and low-risk. Tasks 3-4 are independent but medium-risk. Task 5 depends on all prior tasks.

## Success Criteria

- Boot renders only active tab (measured: ~15 static renders vs ~65 before)
- `compactStorage` runs on boot; dhikrSessions capped at ~100 entries + aggregates
- Offline: app shell loads, core tracking works, analytics degrades gracefully
- No prayer-timer leak on tab switch
- Quran search debounced at 200ms
- Full suite green (468+ tests)
- All modified assets cache-busted

## Deferred

- Chart.js lazy loading (already deferred in index.html with `defer` attribute)
- IndexedDB migration (out of scope per program-level decision)
- Content pool pagination (future optimization if needed)
