# MPA Modular Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the single-file SPA (150 global `<script>` tags) to a 5-page ES-module MPA with light Vite build, keeping offline-first PWA and all data.

**Architecture:** Vite MPA build-only (source stays vanilla JS). `src/pages/*.html` share `src/shell/` + `src/core/` via static imports; heavy pools load via dynamic `import()` only on their page. Old `index.html` kept working until final cutover (strangler).

**Tech Stack:** Vanilla JS ES modules, Vite 5 (build only, no framework), Workbox-free vanilla SW with build-generated precache manifest, Node built-in test runner (`node --test`).

## Global Constraints

- Windows PowerShell 5.1: no `&&` between commands, no `tail`, no shell glob expansion. Chain with `; if ($?) { ... }`.
- Test command is exactly `node --test` from project root. All tests must pass before finishing any task.
- Syntax-check every JS file touched with `node --check <file>` (classic) or module-aware check after ESM migration.
- Do NOT commit unless explicitly asked (repo rule overrides the usual commit-per-task habit — verify, do not commit).
- Offline-first, no backend. All user data stays in `localStorage` under `iq9_user_` prefix + `iq9_active_user`.
- New state fields go in `freshState()` in `state/state.js`; `normalizeState()` backfills for existing users.
- Escape user input on render (`escapeHTML`) — never trust strings from state.
- Zero new `window.*` globals; ESM exports only. Existing `window.*` assignments are removed task by task.
- If an asset versioning scheme changes, keep PWA cache discipline: hashed build assets + SW precache manifest (replaces manual `?v=` / `CACHE_NAME` bumps).

---

## File Structure

New files (all under `src/`, vanilla ESM — one responsibility each):

- `vite.config.js` — MPA entries: `today`, `ibadah`, `knowledge`, `library`, `profile`. Outputs hashed assets + `precache-manifest.js`.
- `src/pages/today/today.html` + `src/pages/today/entry.js` — Today + Prayer Times + Quests + Journeys. Imports shell + core + `render/prayers.js`, `render/calendar.js` only.
- `src/pages/ibadah/ibadah.html` + `src/pages/ibadah/entry.js` — Adhkar + Guide + Self-Tracking.
- `src/pages/knowledge/knowledge.html` + `src/pages/knowledge/entry.js` — Quran/Sunnah/Fiqh/Heart/Society/Life/Hereafter. Dynamic-imports `data/pools/quran-verses.js`, `hadiths.js`.
- `src/pages/library/library.html` + `src/pages/library/entry.js` — Dynasties/Cities/Arts/Arabic/Philosophy/Names.
- `src/pages/profile/profile.html` + `src/pages/profile/entry.js` — Profile/Trophies/Progress/Analytics/Rewards.
- `src/shell/layout.js` — `renderShell(pageId)` returns header/streak/nav/modal HTML; `markActiveNav(pageId)` sets active link. Single template, no per-page duplication.
- `src/core/state.js` — `export { freshState, normalizeState, migrateState, getTodayKey }`, no `window.S` writes.
- `src/core/xp.js` — `export { applyXpDelta, spendXp }` pure over passed state (takes `S` as arg, no global read).
- `src/core/storage.js` — `export { loadState, saveState }` over `iq9_user_` localStorage (+ existing IndexedDB mirror kept as-is).
- `src/core/guards.js` — `export { assertNoGlobals }` test helper (fails on `window.*` assignment).

Modified:

- `scripts/check-syntax.js` — also parse `src/**/*.js` as ES modules (try `vm.SourceTextModule`, fall back to classic for legacy files).
- `tests/*.test.js` — migrate from `vm.runInNewContext` + `window.*` to `import` assertions; add `tests/mpa-smoke.test.js`, `tests/no-globals.test.js`, `tests/lazy-pools.test.js`.
- `sw.js` — precache generated manifest instead of hand-maintained `PRECACHE_LIST` + manual `CACHE_NAME` bumps.
- `manifest.json` — `start_url` stays on the legacy app (cutover deferred to follow-up epic).
- `AGENTS.md` — new commands + dropped 4-touchpoint/load-order rules (final task only).

---

### Task 1: Build skeleton + gates (proves MPA shape, old app untouched)

**Files:**
- Create: `vite.config.js`
- Create: `src/package.json` (`{ "type": "module" }` so `src/**/*.js` parse as ESM while legacy root stays CommonJS for existing `require` tests)
- Create: `src/pages/today/today.html`
- Create: `src/pages/today/entry.js`
- Create: `src/shell/layout.js`
- Create: `tests/mpa-smoke.test.js`
- Create: `tests/no-globals.test.js`
- Modify: `scripts/check-syntax.js`

**Interfaces:**
- Consumes: nothing (greenfield skeleton).
- Produces: `renderShell(pageId)` signature consumed by Tasks 3–5: `renderShell(pageId: string) => string` (defined in Task 3, stubbed here as inline HTML so this task is self-contained).

- [ ] **Step 1: Write failing smoke test for the skeleton page**

```js
// tests/mpa-smoke.test.js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

test('today page entry imports shell and no heavy pools', () => {
  const entry = fs.readFileSync(path.join(__dirname, '..', 'src/pages/today/entry.js'), 'utf8');
  assert.match(entry, /renderShell/);
  assert.doesNotMatch(entry, /quran-verses/);
  assert.doesNotMatch(entry, /hadiths\.js/);
  const html = fs.readFileSync(path.join(__dirname, '..', 'src/pages/today/today.html'), 'utf8');
  assert.match(html, /type="module"/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/mpa-smoke.test.js`
Expected: FAIL with missing file `src/pages/today/entry.js`

- [ ] **Step 3: Write minimal vite config + skeleton page**

```js
// vite.config.js
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = dirname(fileURLToPath(import.meta.url)); // ESM has no __dirname
export default {
  root: '.',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        today: resolve(__dirname, 'src/pages/today/today.html'),
        ibadah: resolve(__dirname, 'src/pages/ibadah/ibadah.html'),
        knowledge: resolve(__dirname, 'src/pages/knowledge/knowledge.html'),
        library: resolve(__dirname, 'src/pages/library/library.html'),
        profile: resolve(__dirname, 'src/pages/profile/profile.html')
      }
    }
  }
};
```

```js
// src/package.json
{ "type": "module" }
```

```html
<!-- src/pages/today/today.html -->
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Today — Ibadah Quest</title></head>
<body data-page="today">
<div id="shell"></div>
<script type="module" src="./entry.js"></script>
</body>
</html>
```

```js
// src/pages/today/entry.js
import { renderShell } from '../../shell/layout.js';
document.getElementById('shell').innerHTML = renderShell('today');
```

- [ ] **Step 4: Write failing no-globals test, then stub shell so it passes**

```js
// tests/no-globals.test.js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

function walk(dir, out) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, e.name);
    if (e.isDirectory()) { walk(abs, out); } else if (e.name.endsWith('.js')) out.push(abs);
  }
  return out;
}

test('src/ contains zero window.* writes', () => {
  const files = walk(path.join(__dirname, '..', 'src'), []);
  const offenders = files.filter((f) => /window\.[A-Za-z_$][\w$]*\s*=/.test(fs.readFileSync(f, 'utf8')));
  assert.deepEqual(offenders, []);
});
```

```js
// src/shell/layout.js
export function renderShell(pageId) {
  const pages = [['today', 'Today'], ['ibadah', 'Ibadah'], ['knowledge', 'Knowledge'], ['library', 'Library'], ['profile', 'Profile']];
  const nav = pages.map(([id, label]) => `<a href="../${id}/${id}.html" data-page="${id}"${id === pageId ? ' aria-current="page"' : ''}>${label}</a>`).join('');
  return `<header><h1>Ibadah Quest</h1><nav>${nav}</nav></header><main id="page"></main><div id="toastOverlay"></div>`;
}
export function markActiveNav(pageId) {
  document.querySelectorAll('[data-page]').forEach((a) => {
    if (a.getAttribute('data-page') === pageId) a.setAttribute('aria-current', 'page');
  });
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `node --test tests/mpa-smoke.test.js tests/no-globals.test.js`
Expected: PASS (2 files, old `index.html` app untouched)

- [ ] **Step 6: Make check-syntax module-aware and verify**

```js
// scripts/check-syntax.js — add after the classic vm.Script attempt:
try {
  new vm.Script(code, { filename: rel });
} catch (err) {
  if (rel.startsWith('src/') && /Unexpected token 'export'|Cannot use import statement/.test(err.message)) {
    try {
      // NOTE: vm.SourceTextModule needs --experimental-vm-modules on older Node.
      // If `vm.SourceTextModule` is undefined, fall back to warn-and-skip (vite build is the real gate).
      if (typeof vm.SourceTextModule !== 'function') { failures.push(rel + ': ESM parse skipped (no SourceTextModule)'); continue; }
      new vm.SourceTextModule(code, { identifier: rel });
    } catch (err2) {
      failures.push(rel + ': ' + err2.message);
    }
  } else {
    failures.push(rel + ': ' + err.message);
  }
}
```

Run: `node scripts/check-syntax.js`
Expected: `OK — all N JS files parse cleanly.`

---

### Task 2: Core ESM — state + xp + storage (single truth, no globals)

**Files:**
- Create: `src/core/state.js`
- Create: `src/core/xp.js`
- Create: `src/core/storage.js`
- Create: `src/core/error-tap.js` (verbatim port of `core/error-tap.js`: `onerror` + `unhandledrejection`, 25-entry buffer, one toast per session — must be the FIRST import in every page entry)
- Create: `tests/core-esm.test.js`

**Interfaces:**
- Consumes: schema rules from legacy `state/state.js` (`freshState` fields, `STATE_SCHEMA_VERSION = 2`, backfill loop).
- Produces (consumed by Tasks 3–5 page entries):
  - `freshState(todayKey: string) => object`
  - `normalizeState(value: unknown) => object`
  - `applyXpDelta(S: object, delta: number, opts?: { skipLevelToast?: boolean }) => { oldLv: number, newLv: number, leveledUp: boolean }`
  - `spendXp(S: object, amount: number, opts?: object) => same`
  - `loadState(user?: string) => object`, `saveState(user: string | undefined, S: object) => void`
  - `lvFrom(xp: number) => number` (copied verbatim from `data/levels.js` thresholds)

- [ ] **Step 1: Write failing core test**

```js
// tests/core-esm.test.js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert');

test('freshState backfills + xp pipeline is pure', async () => {
  const { freshState, normalizeState } = await import('../src/core/state.js');
  const { applyXpDelta, spendXp } = await import('../src/core/xp.js');
  const d = freshState('2026-09-07');
  assert.equal(d.schemaVersion, 2);
  assert.equal(d.xp, 0);
  const normalized = normalizeState({ xp: 5 });
  assert.equal(normalized.lv, 1);
  assert.ok('schemaVersion' in normalized);
  const S = freshState('2026-09-07');
  const r = applyXpDelta(S, 10, { skipLevelToast: true });
  assert.equal(S.xp, 10);
  assert.equal(r.leveledUp, false); // xpFor(2) = 282, so +10 stays level 1
  spendXp(S, 4, { skipLevelToast: true });
  assert.equal(S.xp, 6);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/core-esm.test.js`
Expected: FAIL with missing module `src/core/state.js`

- [ ] **Step 3: Write minimal state module (ports legacy logic, ESM exports)**

```js
// src/core/state.js
export const STATE_SCHEMA_VERSION = 2;
export const PREFIX = 'iq9_user_';

export function freshState(todayKey) {
  return {
    log: { [todayKey]: { p: {}, d: {}, v: {} } },
    xp: 0, lv: 1,
    xpDaily: {}, combos: {}, milestones: [],
    personalGoals: [],
    seasonal: { active: null, ramadanQuests: [], hajjDays: 0, eidRewards: [], arafahDone: false },
    schemaVersion: STATE_SCHEMA_VERSION, bookmarks: []
  };
}

export function migrateState(p, fromVersion) {
  const version = fromVersion || Number(p.schemaVersion) || 1;
  if (version < 2 && p.log && typeof p.log === 'object') {
    for (const dk of Object.keys(p.log)) {
      const entry = p.log[dk];
      if (entry && entry.p && entry.p.Fajr && !entry.p.fajr) entry.p.fajr = entry.p.Fajr;
      if (entry && entry.p && entry.p.Fajr) delete entry.p.Fajr;
    }
  }
  p.schemaVersion = STATE_SCHEMA_VERSION;
  return p;
}

export function normalizeState(value) {
  const d = freshState('1970-01-01');
  const p = value && typeof value === 'object' ? value : d;
  const sourceVersion = Number(p.schemaVersion) || 1;
  for (const k of Object.keys(d)) { if (!(k in p)) p[k] = d[k]; }
  return migrateState(p, sourceVersion);
}
```

- [ ] **Step 4: Write minimal xp + storage modules**

```js
// src/core/xp.js
// Verbatim port of xpFor/lvFrom from state/state.js (same formula, same boundaries).
export function xpFor(lv) { if (lv <= 1) return 0; return Math.floor(100 * Math.pow(lv, 1.5)); }
export function lvFrom(xp) { let lv = 1; while (xp >= xpFor(lv + 1)) lv++; return lv; }

export function applyXpDelta(S, delta, opts) {
  const oldLv = S.lv;
  S.xp += delta;
  S.lv = lvFrom(S.xp);
  void opts;
  return { oldLv, newLv: S.lv, leveledUp: S.lv > oldLv };
}

export function spendXp(S, amount, opts) {
  const clamped = Math.max(0, S.xp - amount);
  const delta = clamped - S.xp;
  return applyXpDelta(S, delta, opts);
}
```

```js
// src/core/storage.js
import { normalizeState } from './state.js';
export const PREFIX = 'iq9_user_';
export const ACTIVE_KEY = 'iq9_active_user';

export function loadState(user) {
  const u = user || (() => { try { return localStorage.getItem(ACTIVE_KEY); } catch { return null; } })() || 'default';
  try {
    const raw = localStorage.getItem(PREFIX + u);
    return normalizeState(raw ? JSON.parse(raw) : null);
  } catch {
    return normalizeState(null);
  }
}

export function saveState(user, S) {
  const u = user || (() => { try { return localStorage.getItem(ACTIVE_KEY); } catch { return null; } })() || 'default';
  try { localStorage.setItem(PREFIX + u, JSON.stringify(S)); } catch { /* quota — recovery handles */ }
}
```

```js
// src/core/error-tap.js
// Verbatim port of core/error-tap.js as ESM. Side-effect-only module:
// onerror + unhandledrejection, 25-entry buffer, one toast per session.
const _buf = [];
export function getErrorBuffer() { return _buf; }
export function installErrorTap() {
  if (installErrorTap._done) return;
  installErrorTap._done = true;
  window.addEventListener('error', (e) => {
    _buf.push({ t: Date.now(), msg: String(e.message || e.error) });
    if (_buf.length > 25) _buf.shift();
  });
  window.addEventListener('unhandledrejection', (e) => {
    _buf.push({ t: Date.now(), msg: String((e.reason && e.reason.message) || e.reason) });
    if (_buf.length > 25) _buf.shift();
  });
}
```

- [ ] **Step 5: Run tests to verify they pass (Task 2)**

Run: `node --test tests/core-esm.test.js tests/mpa-smoke.test.js tests/no-globals.test.js`
Expected: PASS. Then: `node scripts/check-syntax.js` → OK.

---

### Task 3: Today page — first real page (proves the pattern)

**Files:**
- Modify: `src/pages/today/entry.js`
- Modify: `src/pages/today/today.html`
- Create: `src/render/prayers.js` (minimal port)
- Test: `tests/today-page.test.js`

**Interfaces:**
- Consumes: `renderShell` (Task 1), `loadState/saveState` + `applyXpDelta` (Task 2), `escapeHTML` rule.
- Produces: `renderToday(S: object) => string` consumed by entry; pattern copied by Tasks 4–5.

- [ ] **Step 1: Write failing today render test**

```js
// tests/today-page.test.js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert');

test('today renders prayers escaped, toggles persist xp', async () => {
  const { renderToday, togglePrayer } = await import('../src/render/prayers.js');
  const { freshState } = await import('../src/core/state.js');
  const S = freshState('2026-09-07');
  const html = renderToday(S, '2026-09-07');
  assert.match(html, /Fajr/);
  const evil = freshState('2026-09-07');
  evil.log['2026-09-07'].p.note = '<script>alert(1)</script>';
  assert.doesNotMatch(renderToday(evil, '2026-09-07'), /<script>alert/);
  const r = togglePrayer(S, '2026-09-07', 'fajr');
  assert.equal(r.done, true);
  assert.ok(S.xp > 0);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/today-page.test.js`
Expected: FAIL with missing module `src/render/prayers.js`

- [ ] **Step 3: Write minimal prayers renderer (escaped, explicit)**

```js
// src/render/prayers.js
import { applyXpDelta } from '../core/xp.js';

export function escapeHTML(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

const PRAYERS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

export function renderToday(S, dayKey) {
  const day = (S.log && S.log[dayKey]) || { p: {} };
  const items = PRAYERS.map((id) => {
    const done = Boolean(day.p && day.p[id]);
    const label = id.charAt(0).toUpperCase() + id.slice(1);
    return `<button data-prayer="${id}" aria-pressed="${done}">${escapeHTML(label)}${done ? ' ✓' : ''}</button>`;
  }).join('');
  const note = day.p && day.p.note ? `<p>${escapeHTML(day.p.note)}</p>` : '';
  return `<section><h2>Today</h2><div>${items}</div>${note}<p>XP: ${S.xp} · Level ${S.lv}</p></section>`;
}

export function togglePrayer(S, dayKey, id) {
  if (!S.log[dayKey]) S.log[dayKey] = { p: {}, d: {}, v: {} };
  const day = S.log[dayKey];
  const done = !day.p[id];
  if (done) { day.p[id] = true; applyXpDelta(S, 10, { skipLevelToast: true }); }
  else { delete day.p[id]; applyXpDelta(S, -10, { skipLevelToast: true }); }
  return { done };
}
```

- [ ] **Step 4: Wire entry and verify**

```js
// src/pages/today/entry.js
import '../../core/error-tap.js'; // FIRST import on every page — installs the error tap
import { renderShell } from '../../shell/layout.js';
import { loadState, saveState } from '../../core/storage.js';
import { renderToday, togglePrayer } from '../../render/prayers.js';

const S = loadState();
const dayKey = new Date().toISOString().slice(0, 10);
document.getElementById('shell').innerHTML = renderShell('today');
const main = document.getElementById('page');
function draw() { main.innerHTML = renderToday(S, dayKey); }
main.addEventListener('click', (e) => {
  const b = e.target.closest('[data-prayer]');
  if (!b) return;
  togglePrayer(S, dayKey, b.getAttribute('data-prayer'));
  saveState(undefined, S);
  draw();
});
draw();
```

Run: `node --test tests/today-page.test.js tests/core-esm.test.js tests/mpa-smoke.test.js tests/no-globals.test.js`
Expected: PASS. Then: `node scripts/check-syntax.js` → OK.

---

### Task 4: Ibadah + Knowledge pages (lazy heavy pools — the perf win)

**Files:**
- Create: `src/pages/ibadah/ibadah.html`, `src/pages/ibadah/entry.js`
- Create: `src/pages/knowledge/knowledge.html`, `src/pages/knowledge/entry.js`
- Create: `src/data/pools.js` (lazy loader)
- Test: `tests/lazy-pools.test.js`

**Interfaces:**
- Consumes: `renderShell`, `loadState`, Task 3 patterns.
- Produces: `loadPool(name: 'quran-verses' | 'hadiths') => Promise<object>` consumed by Task 5 if needed.

- [ ] **Step 1: Write failing lazy-pool test**

```js
// tests/lazy-pools.test.js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

test('today never bundles heavy pools; knowledge lazy-loads them', () => {
  const today = fs.readFileSync(path.join(__dirname, '..', 'src/pages/today/entry.js'), 'utf8');
  assert.doesNotMatch(today, /quran-verses|hadiths/);
  const knowledge = fs.readFileSync(path.join(__dirname, '..', 'src/pages/knowledge/entry.js'), 'utf8');
  assert.match(knowledge, /import\(['"]\.\.\/\.\.\/data\/pools\.js['"]\)|loadPool\(['"]quran-verses['"]\)/);
});

test('pool loader resolves known pools only', async () => {
  const { loadPool } = await import('../src/data/pools.js');
  await assert.rejects(() => loadPool('nope'), /unknown pool/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/lazy-pools.test.js`
Expected: FAIL with missing modules

- [ ] **Step 3: Write pool loader + knowledge entry**

```js
// src/data/pools.js
export function loadPool(name) {
  if (name === 'quran-verses') return import('../../data/pools/quran-verses.js');
  if (name === 'hadiths') return import('../../data/pools/hadiths.js');
  return Promise.reject(new Error('unknown pool: ' + name));
}
```

```js
// src/pages/knowledge/entry.js
import '../../core/error-tap.js'; // FIRST import on every page
import { renderShell } from '../../shell/layout.js';
import { loadState } from '../../core/storage.js';
import { loadPool } from '../../data/pools.js';

const S = loadState();
document.getElementById('shell').innerHTML = renderShell('knowledge');
const main = document.getElementById('page');
main.innerHTML = '<p>Loading library…</p>';
const mod = await loadPool('quran-verses');
main.innerHTML = `<p>Verses loaded: ${Object.keys(mod).length} exports.</p>`;
void S;
```

```js
// src/pages/ibadah/entry.js
import '../../core/error-tap.js'; // FIRST import on every page
import { renderShell } from '../../shell/layout.js';
import { loadState, saveState } from '../../core/storage.js';

const S = loadState();
document.getElementById('shell').innerHTML = renderShell('ibadah');
document.getElementById('page').innerHTML = `<section><h2>Ibadah</h2><p>XP: ${S.xp}</p></section>`;
void saveState;
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test tests/lazy-pools.test.js tests/today-page.test.js tests/core-esm.test.js`
Expected: PASS. Then: `node scripts/check-syntax.js` → OK.

---

### Task 5: Library + Profile + SW manifest (finish all 5 pages)

**Files:**
- Create: `src/pages/library/library.html`, `src/pages/library/entry.js`
- Create: `src/pages/profile/profile.html`, `src/pages/profile/entry.js`
- Modify: `sw.js` (manifest-driven precache)
- Modify: `tests/sw.test.js` (stub `importScripts` + `self.__PRECACHE` in the vm sandbox; replace the 3 stale content assertions pinning `PRECACHE_LIST`/`iq-cache-v51` with manifest-driven equivalents)
- Test: `tests/mpa-complete.test.js`

**Interfaces:**
- Consumes: `renderShell`, `loadState`, `loadPool` (Tasks 1–4).
- Produces: `PRECACHE` list consumed by SW install handler.

- [ ] **Step 1: Write failing completeness test**

```js
// tests/mpa-complete.test.js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

test('all 5 pages exist with module entries and shell nav', () => {
  for (const p of ['today', 'ibadah', 'knowledge', 'library', 'profile']) {
    const html = fs.readFileSync(path.join(__dirname, '..', `src/pages/${p}/${p}.html`), 'utf8');
    assert.match(html, /type="module"/);
    const entry = fs.readFileSync(path.join(__dirname, '..', `src/pages/${p}/entry.js`), 'utf8');
    assert.match(entry, new RegExp("renderShell\\(['\"]" + p + "['\"]\\)"));
    assert.match(entry, /import ['"]\.\.\/\.\.\/core\/error-tap\.js['"]/);
  }
  const sw = fs.readFileSync(path.join(__dirname, '..', 'sw.js'), 'utf8');
  assert.match(sw, /precache-manifest|PRECACHE/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/mpa-complete.test.js`
Expected: FAIL with missing `src/pages/library/library.html`

- [ ] **Step 3: Write library + profile entries (same pattern, no new abstractions)**

```js
// src/pages/library/entry.js
import '../../core/error-tap.js'; // FIRST import on every page
import { renderShell } from '../../shell/layout.js';
import { loadState } from '../../core/storage.js';
const S = loadState();
document.getElementById('shell').innerHTML = renderShell('library');
document.getElementById('page').innerHTML = `<section><h2>Library</h2><p>Bookmarks: ${S.bookmarks.length}</p></section>`;
```

```js
// src/pages/profile/entry.js
import '../../core/error-tap.js'; // FIRST import on every page
import { renderShell } from '../../shell/layout.js';
import { loadState } from '../../core/storage.js';
const S = loadState();
document.getElementById('shell').innerHTML = renderShell('profile');
document.getElementById('page').innerHTML = `<section><h2>Profile</h2><p>XP: ${S.xp} · Level ${S.lv}</p></section>`;
```

- [ ] **Step 4b: Port recovery + backup to core (verbatim ESM)**

Copy `core/recovery.js` → `src/core/recovery.js` and `core/backup.js` → `src/core/backup.js`,
converting only the trailing `window.X =` assignments to `export` statements (logic untouched).
Wire backup/restore UI into the profile entry:

```js
// append to src/pages/profile/entry.js
import { exportData, importData } from '../../core/backup.js';
void exportData; void importData;
```

Run: `node --test tests/recovery-flow.test.js tests/backup.test.js`
Expected: PASS (legacy tests keep passing against legacy files; ESM ports verified by import check below)

Run: `node -e "import('./src/core/recovery.js').then(()=>console.log('recovery ESM OK')); if ($?) { node -e \"import('./src/core/backup.js').then(()=>console.log('backup ESM OK'))\" }"`
Expected: both OK

- [ ] **Step 5: Switch SW to manifest-driven precache**

```js
// sw.js — replace hand-maintained PRECACHE_LIST + manual CACHE_NAME bumps with:
const CACHE_NAME = 'iq-cache-manifest';
importScripts('./precache-manifest.js');
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(self.__PRECACHE)).then(() => self.skipWaiting()));
});
```

(`precache-manifest.js` is emitted by `vite build`; legacy `PRECACHE_LIST` entries for `index.html` + 150 scripts are deleted in this step.)

- [ ] **Step 6: Run tests to verify they pass (Task 5)**

Run: `node --test`
Expected: PASS (full suite green, legacy + new tests together)

---

### Task 6: Coexistence + docs (RESCOPED by human decision 2026-09-07 — no cutover)

Only the Today page is fully functional; other new pages are shells. Replacing
index.html with a redirect stub would ship stubs over the working app, so the
cutover is DEFERRED to a follow-up epic. This task: interim precache manifest,
append-only html.test.js additions, dual-track AGENTS.md. Legacy index.html and
manifest start_url stay intact.

**Files:**
- Create: `precache-manifest.js` (interim static; Vite build emits it later)
- Create: `tests/sw-manifest.test.js`
- Modify: `tests/html.test.js` (APPEND ONLY — legacy assertions stay green)
- Modify: `AGENTS.md` (dual-track contracts)
- Explicitly NOT touched: `index.html`, `manifest.json`, legacy app files

> SUPERSEDED BELOW — the original cutover steps are retained for record only.
> The governing Task 6 is the task-6-brief.md (coexistence), approved by human decision.

**Files (original, superseded):**
- Modify: `manifest.json` (`start_url` → `./src/pages/today/today.html`)
- Modify: `AGENTS.md` (new commands, drop 4-touchpoint + load-order rules)
- Modify: legacy `index.html` → static redirect to `src/pages/today/today.html` (kept one release, then deleted)
- Test: existing `tests/html.test.js` updated to assert module entries, not `?v=` pins

**Interfaces:**
- Consumes: all Tasks 1–5 outputs. Produces: shippable MPA.

- [ ] **Step 1: Update html.test.js pins to module assertions**

```js
// tests/html.test.js — replace ?v= pin checks with:
test('pages reference module entries, not versioned globals', () => {
  const fs = require('node:fs');
  const html = fs.readFileSync('src/pages/today/today.html', 'utf8');
  require('node:assert').match(html, /type="module"/);
});
```

- [ ] **Step 2: Run full suite to verify green**

Run: `node --test`
Expected: PASS

- [ ] **Step 3: Syntax-gate everything touched**

Run: `node scripts/check-syntax.js`
Expected: OK

- [ ] **Step 4: Update AGENTS.md contracts**

Replace the 4-touchpoint rule and load-order rule with: `New page = entry in vite.config.js + src/pages/<name>/<name>.html + entry.js importing renderShell + smoke test. No window.* globals. Run node --test and node scripts/check-syntax.js. Build with npx vite build for hashed assets.`
