# Spiritual Growth Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Spiritual Garden (SVG growth tree), Weekly Muhasabah (Friday reflection modal), and 40-Day Habit Journeys (persistence grid) to Ibadah Quest, reinforcing the no-competition philosophical shift.

**Architecture:** Four new files — `data/journeys.js` (journey definitions) and three IIFE feature modules under `features/` (`garden.js`, `muhasabah.js`, `journeys.js`) — each exposing pure logic + `window.*` render hooks following the existing render.js/actions.js IIFE pattern. Pure logic functions take explicit arguments so they are unit-testable in Node (built-in `node:test` runner, no dependencies). Wiring is a small set of edits to index.html, tab-groups.js, render.js, actions.js, and state.js.

**Tech Stack:** Vanilla JS/HTML/CSS, `localStorage` (existing `S` state), inline SVG, Node 24 built-in test runner (`node --test` + `node:vm`) for tests only.

## Global Constraints

- Vanilla JS/HTML/CSS only in the app. **No new runtime dependencies.** Node test runner / `node:vm` are dev-only and ship no files into the app.
- No leaderboards, competition, or comparison-to-others copy anywhere in the new features. All copy is gratitude-first and anti-anxiety ("at your own pace, no rush").
- New state is limited to `muhWeek` and `journeys` in `freshState()` (state/state.js). Journey progress is **derived** from `S.log` — never stored.
- All test commands: `node --test tests/*.test.js` (run from project root `C:\Users\Mahin\Desktop\IQ`; the directory form `node --test tests/` fails with MODULE_NOT_FOUND on Windows/Node v24 — node's built-in glob expansion handles `*.test.js`).
- One commit per task (project rule: never bundle multiple changes into one commit).
- Existing files are large; only apply the exact edits listed. Do not reformat or refactor anything else.

---

### Task 1: Skeleton — state fields, DOM containers, wiring

Adds the two state fields, the four DOM containers, the Journeys tab entry, the render-chain hooks, and the App method stubs that later tasks fill in. Also creates the Node test harness.

**Files:**
- Create: `tests/helpers/load.js`
- Create: `tests/state.test.js`
- Create: `tests/html.test.js`
- Modify: `state/state.js:24` (freshState)
- Modify: `index.html:22,68,85,161-164,356`
- Modify: `data/tab-groups.js:8`
- Modify: `render/render.js:18`
- Modify: `core/actions.js:2114,2134-2148`

**Interfaces:**
- Consumes: nothing (scaffolding only).
- Produces:
  - `S.muhWeek` (string, `''` default), `S.journeys` (object map, `{}` default) — both auto-migrated by `loadState()`.
  - DOM containers: `#gardenArea`, `#muhasabahEntry` (in `panel-today`), `#muhasabahModal` (body-level), `#journeyArea` (in new `panel-journeys`).
  - `window.App.openMuhasabah`, `window.App.dismissMuhasabah`, `window.App.joinJourney` — call `window.*` counterparts if they exist, else no-op (defensive; tasks 3–4 define the real ones).
  - render.js dynamic chain invokes `window.renderGarden`, `window.renderMuhasabahEntry`, `window.renderJourneys` if present (no-ops until tasks 2–4).
  - `initApp()` calls `window.maybeShowMuhasabah?.()` after `renderAll()` (no-op until task 3).

- [ ] **Step 1: Create the test harness**

Create `tests/helpers/load.js`:

```js
'use strict';
const fs = require('fs');
const vm = require('vm');

function loadFile(filePath, overrides) {
  const code = fs.readFileSync(filePath, 'utf8');
  const sandbox = {
    window: {},
    console,
    localStorage: {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {}
    }
  };
  Object.assign(sandbox, overrides || {});
  vm.runInNewContext(code, sandbox, { filename: filePath });
  return sandbox;
}

module.exports = { loadFile };
```

- [ ] **Step 2: Write the failing state test**

Create `tests/state.test.js`:

```js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const { loadFile } = require('./helpers/load.js');

function makeStore(initial) {
  const store = Object.assign({}, initial);
  return {
    localStorage: {
      getItem: k => (k in store ? store[k] : null),
      setItem: (k, v) => { store[k] = v; },
      removeItem: k => { delete store[k]; }
    }
  };
}

test('freshState includes muhWeek and journeys', () => {
  const { localStorage } = makeStore({});
  const sb = loadFile(path.join(__dirname, '..', 'state', 'state.js'), { localStorage });
  const p = sb.loadState();
  assert.strictEqual(p.muhWeek, '');
  assert.deepStrictEqual(p.journeys, {});
});

test('loadState migrates muhWeek and journeys into existing saves', () => {
  const old = JSON.stringify({ log: { '2026-08-03': { p: { Fajr: true }, d: {}, v: {} } }, xp: 500 });
  const { localStorage } = makeStore({ iq9_user_default: old });
  const sb = loadFile(path.join(__dirname, '..', 'state', 'state.js'), { localStorage });
  const p = sb.loadState();
  assert.strictEqual(p.muhWeek, '');
  assert.deepStrictEqual(p.journeys, {});
  assert.strictEqual(p.xp, 500);
});
```

- [ ] **Step 3: Write the failing HTML/tab test**

Create `tests/html.test.js`:

```js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const tabs = fs.readFileSync(path.join(root, 'data', 'tab-groups.js'), 'utf8');

test('index.html has the three feature containers', () => {
  assert.ok(html.includes('id="gardenArea"'));
  assert.ok(html.includes('id="muhasabahEntry"'));
  assert.ok(html.includes('id="muhasabahModal"'));
  assert.ok(html.includes('id="panel-journeys"'));
  assert.ok(html.includes('id="journeyArea"'));
});

test('index.html loads the feature scripts in order', () => {
  const i1 = html.indexOf('data/journeys.js');
  const i2 = html.indexOf('features/garden.js');
  const i3 = html.indexOf('features/muhasabah.js');
  const i4 = html.indexOf('features/journeys.js');
  assert.ok(i1 > -1 && i2 > -1 && i3 > -1 && i4 > -1);
  assert.ok(i1 < i2 && i2 < i3 && i3 < i4);
  assert.ok(i4 < html.indexOf('core/actions.js'));
});

test('leaderboard panel is removed', () => {
  assert.ok(!html.includes('panel-leaderboard'));
});

test('Journeys tab is wired into the ibadah group', () => {
  assert.ok(tabs.includes("id: 'journeys'"));
});
```

- [ ] **Step 4: Run tests to verify they fail**

Run: `node --test tests/*.test.js`
Expected: FAIL — `state.test.js` (freshState has no `muhWeek`), `html.test.js` (missing containers/scripts, leaderboard still present).

- [ ] **Step 5: Add state fields**

Modify `state/state.js:24`. Old:

```js
      challenges:[], gratitudeLog:{}, fastingDays:{}, memorized:0, memorizationList:[],
```

New:

```js
      challenges:[], muhWeek:'', journeys:{}, gratitudeLog:{}, fastingDays:{}, memorized:0, memorizationList:[],
```

- [ ] **Step 6: Add DOM containers to index.html**

Modify `index.html` (4 edits):

1. After line 22 (`<div class="toast-overlay" id="toastOverlay" style="display:none;"></div>`) insert:

```html
<div id="muhasabahModal"></div>
```

2. In `panel-today` (line 68), old:

```html
  <div class="tab-panel active" id="panel-today">
    <div id="dailyWidgetArea"></div>
```

New:

```html
  <div class="tab-panel active" id="panel-today">
    <div id="gardenArea"></div>
    <div id="muhasabahEntry"></div>
    <div id="dailyWidgetArea"></div>
```

3. After `panel-challenges` (line 85), old:

```html
  <div class="tab-panel" id="panel-challenges"><div id="challengeArea"></div></div>
```

New:

```html
  <div class="tab-panel" id="panel-challenges"><div id="challengeArea"></div></div>
  <div class="tab-panel" id="panel-journeys"><div id="journeyArea"></div></div>
```

4. Delete the entire `panel-leaderboard` block (lines 161-164):

```html
  <div class="tab-panel" id="panel-leaderboard">
    <div class="section-title">🏅 Global Leaderboard</div>
    <div id="leaderboardArea" style="background:var(--card2);border-radius:12px;padding:20px;text-align:center;color:var(--text2);font-size:0.9rem;"><p>Coming Soon...</p></div>
  </div>
```

5. Immediately before `<script src="core/actions.js?v=3"></script>` (line 356) insert:

```html
<!-- Spiritual Growth Features -->
<script src="data/journeys.js?v=1"></script>
<script src="features/garden.js?v=1"></script>
<script src="features/muhasabah.js?v=1"></script>
<script src="features/journeys.js?v=1"></script>
```

- [ ] **Step 7: Add the Journeys tab**

Modify `data/tab-groups.js:8`. Old:

```js
    { id: 'challenges', icon: '⚔️', label: 'Challenges' },
```

New:

```js
    { id: 'challenges', icon: '⚔️', label: 'Challenges' },
    { id: 'journeys', icon: '🌱', label: 'Journeys' },
```

- [ ] **Step 8: Add render-chain hooks**

Modify `render/render.js:18`. Old:

```js
    safe(renderLv, 'Lv'); safe(renderStr, 'Str'); safe(renderToday, 'Today'); safe(renderQ, 'Q'); safe(renderChallenges, 'Challenges'); safe(renderAch, 'Ach'); safe(renderProg, 'Prog'); safe(renderShop, 'Shop'); safe(renderProfile, 'Profile'); safe(renderTimer, 'Timer'); safe(renderStats, 'Stats');
```

New (append three guarded calls at the end of the same line):

```js
    safe(renderLv, 'Lv'); safe(renderStr, 'Str'); safe(renderToday, 'Today'); safe(renderQ, 'Q'); safe(renderChallenges, 'Challenges'); safe(renderAch, 'Ach'); safe(renderProg, 'Prog'); safe(renderShop, 'Shop'); safe(renderProfile, 'Profile'); safe(renderTimer, 'Timer'); safe(renderStats, 'Stats'); safe(() => window.renderGarden && window.renderGarden(), 'Garden'); safe(() => window.renderMuhasabahEntry && window.renderMuhasabahEntry(), 'MuhEntry'); safe(() => window.renderJourneys && window.renderJourneys(), 'Journeys');
```

- [ ] **Step 9: Wire actions.js**

Modify `core/actions.js` (2 edits):

1. In `initApp()` (line 2114). Old:

```js
    S.lv=lvFrom(S.xp); saveState(); initCalView(); renderAll();
```

New:

```js
    S.lv=lvFrom(S.xp); saveState(); initCalView(); renderAll();
    try { if (window.maybeShowMuhasabah) window.maybeShowMuhasabah(); } catch(e) { console.warn('Muhasabah trigger failed:', e.message); }
```

2. In the `window.App` object (line 2140). Old:

```js
      addMemorization, toggleMorning, toggleEvening, switchUser, logout, resetAll,
```

New:

```js
      addMemorization, toggleMorning, toggleEvening, switchUser, logout, resetAll,
      openMuhasabah: typeof window.openMuhasabah === 'function' ? window.openMuhasabah : () => {},
      dismissMuhasabah: typeof window.dismissMuhasabah === 'function' ? window.dismissMuhasabah : () => {},
      joinJourney: typeof window.joinJourney === 'function' ? window.joinJourney : () => {},
```

- [ ] **Step 10: Run tests to verify they pass**

Run: `node --test tests/*.test.js`
Expected: PASS — all 6 tests (2 state + 4 html).

- [ ] **Step 11: Commit**

```bash
git add tests/helpers/load.js tests/state.test.js tests/html.test.js state/state.js index.html data/tab-groups.js render/render.js core/actions.js
git commit -m "feat: wire spiritual growth skeleton (state fields, containers, hooks)"
```

---

### Task 2: Spiritual Garden — SVG Tree of Deeds

Implements the garden module: 5 growth stages gated by XP + streak, an inline SVG tree per stage, an internal scale animation, and a card rendered into `#gardenArea` at the top of the Today panel.

**Files:**
- Create: `features/garden.js`
- Modify: `styles/main.css` (append garden styles)
- Test: `tests/garden.test.js`

**Interfaces:**
- Consumes: `#gardenArea` (task 1), globals `S.xp`, `S.cs`, `S.bs` (state.js), `document`.
- Produces:
  - `window.gardenStage(xp, streak)` → `{ stage, name, icon, next, xpMin, xpNext, strMin, strNext, xpPct }` where `stage` ∈ 1..5, `next` is the next stage name or `null`, `xpPct` ∈ [0,1].
  - `window.flowerCount(streak)` → number of flowers (1..7).
  - `window.renderGarden()` → renders the garden card into `#gardenArea` (no-op if element missing; catches all errors).

- [ ] **Step 1: Write the failing test**

Create `tests/garden.test.js`:

```js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const { loadFile } = require('./helpers/load.js');

const w = loadFile(path.join(__dirname, '..', 'features', 'garden.js')).window;

test('garden starts at Seed', () => {
  assert.strictEqual(w.gardenStage(0, 0).stage, 1);
  assert.strictEqual(w.gardenStage(0, 0).name, 'Seed');
});

test('stage requires BOTH xp and streak', () => {
  assert.strictEqual(w.gardenStage(149, 3).stage, 1);
  assert.strictEqual(w.gardenStage(150, 2).stage, 1);
  assert.strictEqual(w.gardenStage(150, 3).stage, 2);
});

test('highest unlocked stage wins', () => {
  assert.strictEqual(w.gardenStage(4000, 30).stage, 5);
  assert.strictEqual(w.gardenStage(4000, 15).stage, 4);
  assert.strictEqual(w.gardenStage(2000, 14).stage, 4);
});

test('xpPct progresses inside the stage XP range', () => {
  assert.strictEqual(w.gardenStage(325, 3).xpPct, 0.5); // (325-150)/(500-150)
});

test('flowers grow with streak beyond 30, capped at 7', () => {
  assert.strictEqual(w.flowerCount(30), 1);
  assert.strictEqual(w.flowerCount(45), 4);
  assert.strictEqual(w.flowerCount(80), 7);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/garden.test.js`
Expected: FAIL — `window.gardenStage is not a function`.

- [ ] **Step 3: Implement the garden module**

Create `features/garden.js`:

```js
// ═══════════════════════════════════════════════════════
// SPIRITUAL GARDEN — Tree of Deeds
// Grows with total XP + best streak. Never withers.
// ═══════════════════════════════════════════════════════
(function() {
  const STAGES = [
    { name: 'Seed',        icon: '🌱', xp: 0,    str: 0,  xpNext: 150,  strNext: 3,  next: 'Sprout' },
    { name: 'Sprout',      icon: '🌿', xp: 150,  str: 3,  xpNext: 500,  strNext: 7,  next: 'Sapling' },
    { name: 'Sapling',     icon: '🌳', xp: 500,  str: 7,  xpNext: 1500, strNext: 14, next: 'Mature Tree' },
    { name: 'Mature Tree', icon: '🌲', xp: 1500, str: 14, xpNext: 4000, strNext: 30, next: 'Blooming Tree' },
    { name: 'Blooming Tree', icon: '🌸', xp: 4000, str: 30, xpNext: null, strNext: null, next: null }
  ];
  const CAPTIONS = [
    'Every seed of a deed counts, no matter how small.',
    'May Allah accept the little you do.',
    'Keep watering your deeds with sincerity.',
    'A quiet habit grows into something beautiful.',
    'Your tree is taking root — persist.',
    'A strong tree withstands the wind — keep going.',
    'Steady, gentle progress is what Allah loves.',
    'Blooming in humility — all praise belongs to Allah.'
  ];
  function gardenStage(xp, streak) {
    let idx = 0;
    for (let i = 0; i < STAGES.length; i++) {
      if (xp >= STAGES[i].xp && streak >= STAGES[i].str) idx = i;
    }
    const s = STAGES[idx];
    const xpPct = s.xpNext ? Math.min(1, Math.max(0, (xp - s.xp) / (s.xpNext - s.xp))) : 1;
    return { stage: idx + 1, name: s.name, icon: s.icon, next: s.next, xpMin: s.xp, xpNext: s.xpNext, strMin: s.str, strNext: s.strNext, xpPct: Math.round(xpPct * 1000) / 1000 };
  }
  function flowerCount(streak) { return Math.max(1, Math.min(7, Math.floor((streak - 30) / 5) + 1)); }
  function caption() {
    const d = new Date();
    return CAPTIONS[Math.floor(d.getTime() / 86400000) % CAPTIONS.length];
  }
  function treeSVG(stage, flowers) {
    const FLOWER_POS = [[68,118],[132,112],[92,96],[120,86],[78,78],[142,66],[56,60]];
    let flowersSVG = '';
    if (stage === 5) {
      for (let i = 0; i < Math.min(flowers, FLOWER_POS.length); i++) {
        const f = FLOWER_POS[i];
        flowersSVG += `<g transform="translate(${f[0]},${f[1]})"><circle r="7" fill="#E89BB0"/><circle r="3" fill="#FCE694"/></g>`;
      }
    }
    if (stage === 1) return `<svg class="garden-svg" viewBox="0 0 200 220"><ellipse cx="100" cy="204" rx="60" ry="8" fill="#163024"/><path d="M100 200 Q100 168 100 152" stroke="#2E7D4F" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M100 162 Q78 150 72 160 Q86 170 100 162" fill="#3E9B63"/><path d="M100 156 Q122 144 128 154 Q114 164 100 156" fill="#3E9B63"/></svg>`;
    if (stage === 2) return `<svg class="garden-svg" viewBox="0 0 200 220"><ellipse cx="100" cy="204" rx="60" ry="8" fill="#163024"/><path d="M100 200 Q100 150 100 120" stroke="#2E7D4F" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M100 140 Q72 124 66 136 Q82 148 100 140" fill="#3E9B63"/><path d="M100 130 Q128 114 134 126 Q118 138 100 130" fill="#3E9B63"/><path d="M100 120 Q78 104 72 116 Q86 128 100 120" fill="#4CAF7A"/><path d="M100 112 Q122 96 128 108 Q114 120 100 112" fill="#4CAF7A"/></svg>`;
    if (stage === 3) return `<svg class="garden-svg" viewBox="0 0 200 220"><ellipse cx="100" cy="204" rx="60" ry="8" fill="#163024"/><path d="M100 204 L96 110 L104 110 Z" fill="#6B4A2B"/><path d="M100 140 L70 118" stroke="#6B4A2B" stroke-width="6" stroke-linecap="round"/><path d="M100 128 L132 104" stroke="#6B4A2B" stroke-width="6" stroke-linecap="round"/><circle cx="66" cy="108" r="16" fill="#3E7C4F"/><circle cx="136" cy="94" r="15" fill="#3E7C4F"/><circle cx="100" cy="92" r="18" fill="#4CAF7A"/><circle cx="100" cy="100" r="17" fill="#3E9B63"/></svg>`;
    if (stage === 4) return `<svg class="garden-svg" viewBox="0 0 200 220"><ellipse cx="100" cy="206" rx="70" ry="9" fill="#163024"/><path d="M96 206 L88 120 L112 120 L104 206 Z" fill="#5C3D21"/><path d="M100 160 L58 128" stroke="#5C3D21" stroke-width="9" stroke-linecap="round"/><path d="M100 146 L146 112" stroke="#5C3D21" stroke-width="9" stroke-linecap="round"/><path d="M100 132 L74 88" stroke="#5C3D21" stroke-width="8" stroke-linecap="round"/><path d="M100 132 L128 84" stroke="#5C3D21" stroke-width="8" stroke-linecap="round"/><circle cx="58" cy="122" r="20" fill="#2E6B3F"/><circle cx="148" cy="106" r="18" fill="#2E6B3F"/><circle cx="72" cy="82" r="20" fill="#3E7C4F"/><circle cx="130" cy="78" r="20" fill="#3E7C4F"/><circle cx="100" cy="92" r="26" fill="#3E9B63"/><circle cx="100" cy="82" r="24" fill="#4CAF7A"/></svg>`;
    return `<svg class="garden-svg" viewBox="0 0 200 220"><ellipse cx="100" cy="206" rx="70" ry="9" fill="#163024"/><path d="M96 206 L88 120 L112 120 L104 206 Z" fill="#5C3D21"/><path d="M100 160 L58 128" stroke="#5C3D21" stroke-width="9" stroke-linecap="round"/><path d="M100 146 L146 112" stroke="#5C3D21" stroke-width="9" stroke-linecap="round"/><path d="M100 132 L74 88" stroke="#5C3D21" stroke-width="8" stroke-linecap="round"/><path d="M100 132 L128 84" stroke="#5C3D21" stroke-width="8" stroke-linecap="round"/><circle cx="58" cy="122" r="20" fill="#2E6B3F"/><circle cx="148" cy="106" r="18" fill="#2E6B3F"/><circle cx="72" cy="82" r="20" fill="#3E7C4F"/><circle cx="130" cy="78" r="20" fill="#3E7C4F"/><circle cx="100" cy="92" r="26" fill="#3E9B63"/><circle cx="100" cy="82" r="24" fill="#4CAF7A"/>${flowersSVG}</svg>`;
  }
  function renderGarden() {
    try {
      const el = document.getElementById('gardenArea');
      if (!el) return;
      const streak = Math.max(S.cs || 0, S.bs || 0);
      const g = gardenStage(S.xp || 0, streak);
      const flowers = g.stage === 5 ? flowerCount(streak) : 0;
      const scale = (1 + 0.12 * g.xpPct).toFixed(3);
      const progress = g.next
        ? `${S.xp}/${g.xpNext} XP to ${g.next}`
        : 'Your tree is in full bloom — keep nourishing it.';
      el.innerHTML = `<div class="garden-card">
        <div class="garden-tree" style="transform:scale(${scale})">${treeSVG(g.stage, flowers)}</div>
        <div class="garden-info">
          <div class="garden-stage-name">${g.icon} ${g.name}</div>
          <div class="garden-progress">${progress}</div>
          ${g.next ? `<div class="garden-progress-sub">Streak ${streak}/${g.strNext} for ${g.next}</div>` : ''}
          <div class="garden-caption">${caption()}</div>
        </div>
      </div>`;
    } catch (e) { console.warn('Render Garden failed:', e.message); }
  }
  window.gardenStage = gardenStage;
  window.flowerCount = flowerCount;
  window.renderGarden = renderGarden;
})();
```

- [ ] **Step 4: Add garden styles**

Append to `styles/main.css`:

```css
/* ── Spiritual Garden ── */
.garden-card { display:flex; gap:18px; align-items:center; background:linear-gradient(180deg, rgba(62,124,79,0.12), rgba(11,17,20,0.2)); border:1px solid rgba(62,124,79,0.35); border-radius:var(--radius); padding:18px 20px; margin-bottom:20px; }
.garden-svg { width:120px; height:132px; display:block; }
.garden-tree { transition: transform 1.2s ease; transform-origin: bottom center; flex-shrink:0; }
.garden-info { flex:1; }
.garden-stage-name { font-family:var(--font-heading); font-size:1.15rem; font-weight:700; color:var(--gold-light); letter-spacing:0.5px; margin-bottom:6px; }
.garden-progress { font-size:0.82rem; color:var(--text2); }
.garden-progress-sub { font-size:0.75rem; color:var(--text2); opacity:0.8; margin-top:3px; }
.garden-caption { font-size:0.75rem; color:var(--gold); opacity:0.85; margin-top:8px; font-style:italic; }
```

- [ ] **Step 5: Run test to verify it passes**

Run: `node --test tests/garden.test.js`
Expected: PASS — all 5 tests.

- [ ] **Step 6: Commit**

```bash
git add features/garden.js styles/main.css tests/garden.test.js
git commit -m "feat: add spiritual garden tree UI"
```

---

### Task 3: Weekly Muhasabah — Friday reflection modal

Implements the Muhasabah module: pure metrics/suggestion logic, the modal UI, the Friday auto-trigger, the dismiss marker, and the Today-panel entry button.

**Files:**
- Create: `features/muhasabah.js`
- Modify: `styles/main.css` (append muhasabah styles)
- Test: `tests/muhasabah.test.js`

**Interfaces:**
- Consumes: `#muhasabahModal`, `#muhasabahEntry` (task 1), globals `S.log`, `S.cs`, `S.muhWeek`, `ws()`, `today()`, `isFri()`, `saveState()` (state.js), `DEEDS` (data/deeds.js), `App.dismissMuhasabah` (wired in task 1, calls `window.dismissMuhasabah`).
- Produces:
  - `window.muhasabahMetrics(log, startDate, endDate)` → `{ prayers, daysPrayed, deeds }`.
  - `window.computeDeedCounts(log, pool, endDate, windowDays)` → `[{ id, count }, ...]`.
  - `window.pickSuggestion(counts)` → lowest-count `{ id, count }` if its count is 0, else `null`.
  - `window.muhasabahHTML(metrics, suggestionInfo, streak)` → modal HTML string; `suggestionInfo` is `{ icon, label }` or `null`.
  - `window.openMuhasabah()` — builds and shows the modal.
  - `window.dismissMuhasabah()` — sets `S.muhWeek = ws()`, saves, clears the modal.
  - `window.maybeShowMuhasabah()` — opens the modal iff `isFri()` and `S.muhWeek !== ws()`.
  - `window.renderMuhasabahEntry()` — renders the Today-panel entry button.

- [ ] **Step 1: Write the failing test**

Create `tests/muhasabah.test.js`:

```js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const { loadFile } = require('./helpers/load.js');

const w = loadFile(path.join(__dirname, '..', 'features', 'muhasabah.js')).window;

const log = {
  '2026-08-03': { p: { Fajr: true, Dhuhr: true }, d: { istighfar: true } },
  '2026-08-04': { p: { Fajr: true }, d: {} },
  '2026-08-05': { p: {}, d: { charity: true } }
};

test('muhasabahMetrics counts prayers, days prayed, and deeds in the week window', () => {
  const m = w.muhasabahMetrics(log, '2026-08-03', '2026-08-05');
  assert.strictEqual(m.prayers, 3);
  assert.strictEqual(m.daysPrayed, 2);
  assert.strictEqual(m.deeds, 2);
});

test('computeDeedCounts counts each pool deed in the trailing window', () => {
  const counts = w.computeDeedCounts(log, ['charity', 'fasting', 'istighfar'], '2026-08-05', 14);
  assert.deepStrictEqual(counts, [
    { id: 'charity', count: 1 },
    { id: 'fasting', count: 0 },
    { id: 'istighfar', count: 1 }
  ]);
});

test('pickSuggestion returns the lowest-count deed when it is 0 (ties resolve to pool order)', () => {
  const counts = w.computeDeedCounts(log, ['charity', 'fasting', 'istighfar'], '2026-08-05', 14);
  assert.deepStrictEqual(w.pickSuggestion(counts), { id: 'fasting', count: 0 });
});

test('pickSuggestion returns null when every pool deed was logged', () => {
  const full = {
    '2026-08-03': { p: {}, d: { charity: true, fasting: true, istighfar: true } }
  };
  const counts = w.computeDeedCounts(full, ['charity', 'fasting', 'istighfar'], '2026-08-05', 14);
  assert.strictEqual(w.pickSuggestion(counts), null);
});

test('muhasabahHTML renders the hero line, list, and celebration fallback', () => {
  const html = w.muhasabahHTML({ prayers: 3, daysPrayed: 2, deeds: 2 }, null, 6);
  assert.ok(html.includes('Alhamdulillah, you prayed <b>3</b> prayers this week and kept a <b>6</b>-day streak.'));
  assert.ok(html.includes('Your garden is thriving — keep nourishing it.'));
});

test('muhasabahHTML renders the gentle suggestion when one is given', () => {
  const html = w.muhasabahHTML({ prayers: 3, daysPrayed: 2, deeds: 2 }, { icon: '🤲', label: 'Charity' }, 6);
  assert.ok(html.includes('Perhaps next week, try dedicating a moment to 🤲 Charity.'));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/muhasabah.test.js`
Expected: FAIL — `window.muhasabahMetrics is not a function`.

- [ ] **Step 3: Implement the muhasabah module**

Create `features/muhasabah.js`:

```js
// ═══════════════════════════════════════════════════════
// WEEKLY MUHASABAH — private Friday self-reflection
// ═══════════════════════════════════════════════════════
(function() {
  const SUGGEST_POOL = ['charity', 'fasting', 'istighfar', 'sadaqah_jariyah', 'dua_others'];
  function fmt(d) {
    const m = d.getMonth() + 1, day = d.getDate();
    return d.getFullYear() + '-' + (m < 10 ? '0' + m : m) + '-' + (day < 10 ? '0' + day : day);
  }
  function muhasabahMetrics(log, startDate, endDate) {
    let prayers = 0, daysPrayed = 0, deeds = 0;
    for (const dk in log) {
      if (dk < startDate || dk > endDate) continue;
      const e = log[dk] || {};
      const pn = Object.values(e.p || {}).filter(v => v).length;
      prayers += pn;
      if (pn > 0) daysPrayed++;
      deeds += Object.values(e.d || {}).filter(v => v).length;
    }
    return { prayers, daysPrayed, deeds };
  }
  function computeDeedCounts(log, pool, endDate, windowDays) {
    const start = new Date(endDate + 'T00:00:00');
    start.setDate(start.getDate() - (windowDays - 1));
    const startDate = fmt(start);
    return pool.map(id => {
      let count = 0;
      for (const dk in log) {
        if (dk >= startDate && dk <= endDate && log[dk] && log[dk].d && log[dk].d[id]) count++;
      }
      return { id, count };
    });
  }
  function pickSuggestion(counts) {
    let best = null, bestCount = Infinity;
    for (const c of counts) {
      if (c.count < bestCount) { best = c; bestCount = c.count; }
    }
    return best && best.count === 0 ? best : null;
  }
  function muhasabahHTML(metrics, suggestionInfo, streak) {
    const hero = `Alhamdulillah, you prayed <b>${metrics.prayers}</b> prayers this week and kept a <b>${streak}</b>-day streak.`;
    const sug = suggestionInfo
      ? `Perhaps next week, try dedicating a moment to ${suggestionInfo.icon} ${suggestionInfo.label}.`
      : 'Your garden is thriving — keep nourishing it.';
    return `<div class="muh-overlay" id="muhOverlay">
      <div class="muh-card">
        <div class="muh-title">🪞 Weekly Muhasabah · Friday Reflection</div>
        <div class="muh-hero">${hero}</div>
        <div class="muh-list">
          <div class="muh-row"><span>🕌 Prayers logged</span><b>${metrics.prayers}</b></div>
          <div class="muh-row"><span>📅 Days prayed</span><b>${metrics.daysPrayed}</b></div>
          <div class="muh-row"><span>🔥 Streak</span><b>${streak} days</b></div>
          <div class="muh-row"><span>🌟 Extra deeds</span><b>${metrics.deeds}</b></div>
        </div>
        <div class="muh-suggestion">${sug}</div>
        <button class="muh-dismiss" onclick="App.dismissMuhasabah()">JazakAllah khair 🤲</button>
      </div>
    </div>`;
  }
  function openMuhasabah() {
    try {
      const wrap = document.getElementById('muhasabahModal');
      if (!wrap) return;
      const metrics = muhasabahMetrics(S.log, ws(), today());
      const counts = computeDeedCounts(S.log, SUGGEST_POOL, today(), 14);
      const pick = pickSuggestion(counts);
      let info = null;
      if (pick && typeof DEEDS !== 'undefined') {
        const de = DEEDS.find(x => x.id === pick.id);
        if (de) info = { icon: de.icon, label: de.name };
      }
      wrap.innerHTML = muhasabahHTML(metrics, info, S.cs || 0);
    } catch (e) { console.warn('Open Muhasabah failed:', e.message); }
  }
  function dismissMuhasabah() {
    try {
      S.muhWeek = ws();
      saveState();
      const wrap = document.getElementById('muhasabahModal');
      if (wrap) wrap.innerHTML = '';
    } catch (e) { console.warn('Dismiss Muhasabah failed:', e.message); }
  }
  function maybeShowMuhasabah() {
    try {
      if (isFri() && S.muhWeek !== ws()) openMuhasabah();
    } catch (e) { console.warn('Muhasabah trigger failed:', e.message); }
  }
  function renderMuhasabahEntry() {
    try {
      const el = document.getElementById('muhasabahEntry');
      if (!el) return;
      el.innerHTML = '<button class="muh-entry" onclick="App.openMuhasabah()">📝 Weekly Reflection</button>';
    } catch (e) { console.warn('Render Muhasabah entry failed:', e.message); }
  }
  window.muhasabahMetrics = muhasabahMetrics;
  window.computeDeedCounts = computeDeedCounts;
  window.pickSuggestion = pickSuggestion;
  window.muhasabahHTML = muhasabahHTML;
  window.openMuhasabah = openMuhasabah;
  window.dismissMuhasabah = dismissMuhasabah;
  window.maybeShowMuhasabah = maybeShowMuhasabah;
  window.renderMuhasabahEntry = renderMuhasabahEntry;
})();
```

- [ ] **Step 4: Add muhasabah styles**

Append to `styles/main.css`:

```css
/* ── Muhasabah ── */
.muh-entry { width:100%; background:rgba(212,175,55,0.08); border:1px solid rgba(212,175,55,0.25); color:var(--gold-light); padding:12px; border-radius:var(--radius-sm); font-weight:700; font-size:0.85rem; letter-spacing:0.5px; cursor:pointer; margin-bottom:20px; transition:all .2s; }
.muh-entry:hover { background:rgba(212,175,55,0.15); }
.muh-overlay { position:fixed; inset:0; background:rgba(3,7,18,0.88); display:flex; align-items:center; justify-content:center; z-index:100000; padding:20px; }
.muh-card { background:var(--card2); border:1px solid var(--gold); border-radius:var(--radius); padding:28px 24px; max-width:430px; width:100%; box-shadow:0 20px 60px rgba(0,0,0,0.5); }
.muh-title { font-family:var(--font-heading); font-size:1.05rem; font-weight:700; color:var(--gold); text-align:center; letter-spacing:1px; margin-bottom:16px; }
.muh-hero { font-size:0.95rem; color:var(--text2); line-height:1.6; text-align:center; margin-bottom:16px; }
.muh-hero b { color:var(--gold-light); }
.muh-list { display:flex; flex-direction:column; gap:8px; margin-bottom:16px; }
.muh-row { display:flex; justify-content:space-between; font-size:0.85rem; color:var(--text2); background:rgba(0,0,0,0.2); padding:10px 14px; border-radius:10px; }
.muh-row b { color:var(--gold-light); }
.muh-suggestion { font-size:0.85rem; color:var(--gold); background:rgba(212,175,55,0.08); border:1px dashed rgba(212,175,55,0.3); padding:12px 14px; border-radius:10px; line-height:1.55; margin-bottom:18px; }
.muh-dismiss { width:100%; background:linear-gradient(135deg,#D4AF37,#A16207); color:#000; border:none; padding:13px; border-radius:30px; font-weight:800; font-size:0.95rem; cursor:pointer; letter-spacing:0.5px; }
```

- [ ] **Step 5: Run test to verify it passes**

Run: `node --test tests/muhasabah.test.js`
Expected: PASS — all 6 tests.

- [ ] **Step 6: Commit**

```bash
git add features/muhasabah.js styles/main.css tests/muhasabah.test.js
git commit -m "feat: add weekly muhasabah reflection modal"
```

---

### Task 4: 40-Day Habit Journeys — persistence grid

Implements the journeys module and journey definitions: opt-in cards, the 8×5 grid that fills forward without ever resetting, and auto-linking to existing prayer/deed logs.

**Files:**
- Create: `data/journeys.js`
- Create: `features/journeys.js`
- Modify: `styles/main.css` (append journeys styles)
- Test: `tests/journeys.test.js`

**Interfaces:**
- Consumes: `#journeyArea`, `panel-journeys` (task 1), globals `JOURNEYS` (this task), `S.log`, `S.journeys`, `today()`, `saveState()` (state.js), `App.joinJourney` (wired in task 1, calls `window.joinJourney`).
- Produces:
  - Global `JOURNEYS` — array of `{ id, name, icon, desc, kind, key, target }` where `kind` is `'p'` (prayer map) or `'d'` (deed map) and `key` is the log key inside that map.
  - `window.journeyProgress(log, journey, startDate, endDate)` → number of days (between start and end, inclusive) where `log[date][journey.kind][journey.key]` is truthy.
  - `window.journeyStart(state, id, dateStr)` → copy of `state` with `journeys[id] = dateStr` set **only if not already set** (never overwrites).
  - `window.gridHTML(completed, target)` → grid HTML with the first `completed` cells marked `filled`.
  - `window.renderJourneys()` — renders all journey cards into `#journeyArea`.
  - `window.joinJourney(id)` — sets `S.journeys[id] = today()` (if not started), saves, re-renders.

- [ ] **Step 1: Write the failing test**

Create `tests/journeys.test.js`:

```js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const { loadFile } = require('./helpers/load.js');

const w = loadFile(path.join(__dirname, '..', 'features', 'journeys.js')).window;

const fajrJourney = { id: 'fajr40', name: '40 Days of Fajr', icon: '🕌', desc: '', kind: 'p', key: 'Fajr', target: 40 };
const istighfarJourney = { id: 'istighfar40', name: '40 Days of Istighfar', icon: '🤍', desc: '', kind: 'd', key: 'istighfar', target: 40 };

const log = {
  '2026-08-03': { p: { Fajr: true }, d: { istighfar: true } },
  '2026-08-04': { p: {}, d: {} },
  '2026-08-05': { p: { Fajr: true }, d: { istighfar: true } },
  '2026-08-06': { p: { Fajr: true }, d: {} },
  '2026-08-07': { p: { Dhuhr: true }, d: { istighfar: true } }
};

test('journeyProgress counts only days where the mapped log key is present', () => {
  assert.strictEqual(w.journeyProgress(log, fajrJourney, '2026-08-03', '2026-08-07'), 3);
  assert.strictEqual(w.journeyProgress(log, istighfarJourney, '2026-08-03', '2026-08-07'), 3);
});

test('journeyProgress ignores days before the start date', () => {
  assert.strictEqual(w.journeyProgress(log, fajrJourney, '2026-08-05', '2026-08-07'), 2);
});

test('gridHTML has 40 cells and fills only the first N', () => {
  const html = w.gridHTML(3, 40);
  assert.strictEqual((html.match(/journey-cell/g) || []).length, 40);
  assert.strictEqual((html.match(/journey-cell filled/g) || []).length, 3);
});

test('journeyStart sets the start date once and never overwrites', () => {
  const s1 = w.journeyStart({ journeys: {} }, 'fajr40', '2026-08-03');
  assert.strictEqual(s1.journeys.fajr40, '2026-08-03');
  const s2 = w.journeyStart(s1, 'fajr40', '2026-09-01');
  assert.strictEqual(s2.journeys.fajr40, '2026-08-03');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/journeys.test.js`
Expected: FAIL — `window.journeyProgress is not a function`.

- [ ] **Step 3: Create the journey definitions**

Create `data/journeys.js`:

```js
// 40-Day Habit Journeys — each journey maps to an existing log key
// kind: 'p' reads log[date].p[key]; kind: 'd' reads log[date].d[key]
const JOURNEYS = [
  { id: 'fajr40', name: '40 Days of Fajr', icon: '🕌', desc: 'Pray Fajr on time for 40 days', kind: 'p', key: 'Fajr', target: 40 },
  { id: 'istighfar40', name: '40 Days of Istighfar', icon: '🤍', desc: 'Make istighfar every day for 40 days', kind: 'd', key: 'istighfar', target: 40 },
  { id: 'quran40', name: "40 Days of Qur'an", icon: '📖', desc: "Read from the Qur'an every day for 40 days", kind: 'd', key: 'quran', target: 40 },
  { id: 'salawat40', name: '40 Days of Salawat', icon: '💚', desc: 'Send salawat on the Prophet ﷺ every day for 40 days', kind: 'd', key: 'salawat', target: 40 }
];
```

- [ ] **Step 4: Implement the journeys module**

Create `features/journeys.js`:

```js
// ═══════════════════════════════════════════════════════
// 40-DAY HABIT JOURNEYS — persistence, never reset
// ═══════════════════════════════════════════════════════
(function() {
  function journeyProgress(log, journey, startDate, endDate) {
    let completed = 0;
    for (const dk in log) {
      if (dk < startDate || dk > endDate) continue;
      if (log[dk] && log[dk][journey.kind] && log[dk][journey.kind][journey.key]) completed++;
    }
    return completed;
  }
  function journeyStart(state, id, dateStr) {
    const next = Object.assign({}, state, { journeys: Object.assign({}, state.journeys) });
    if (!next.journeys[id]) next.journeys[id] = dateStr;
    return next;
  }
  function gridHTML(completed, target) {
    let h = '<div class="journey-grid">';
    for (let i = 0; i < target; i++) {
      h += `<div class="journey-cell${i < completed ? ' filled' : ''}">${i < completed ? '✓' : ''}</div>`;
    }
    return h + '</div>';
  }
  function journeyCard(j, t) {
    const start = S.journeys ? S.journeys[j.id] : undefined;
    const head = `<div class="journey-head"><span class="journey-icon">${j.icon}</span>
      <div><div class="journey-name">${j.name}</div><div class="journey-desc">${j.desc}</div></div></div>`;
    if (!start) {
      return `<div class="journey-card">${head}
        <button class="journey-start" onclick="App.joinJourney('${j.id}')">Begin 40-Day Journey</button></div>`;
    }
    const completed = journeyProgress(S.log, j, start, t);
    const done = completed >= j.target;
    const summary = done
      ? 'Alhamdulillah, journey complete 🎉'
      : `Day ${completed} of ${j.target} — at your own pace, no rush.`;
    return `<div class="journey-card">${head}
      <div class="journey-summary">${summary}</div>${gridHTML(completed, j.target)}</div>`;
  }
  function renderJourneys() {
    try {
      const el = document.getElementById('journeyArea');
      if (!el) return;
      const t = today();
      const defs = (typeof JOURNEYS !== 'undefined') ? JOURNEYS : [];
      el.innerHTML = '<div class="section-title">🌱 40-Day Habit Journeys</div>' +
        '<div class="journey-intro">Choose one journey and go at your own pace. A missed day is not a reset — every day you return, your grid keeps growing.</div>' +
        defs.map(j => journeyCard(j, t)).join('');
    } catch (e) { console.warn('Render Journeys failed:', e.message); }
  }
  function joinJourney(id) {
    try {
      if (S.journeys[id]) return;
      S.journeys[id] = today();
      saveState();
      renderJourneys();
    } catch (e) { console.warn('Join journey failed:', e.message); }
  }
  window.journeyProgress = journeyProgress;
  window.journeyStart = journeyStart;
  window.gridHTML = gridHTML;
  window.renderJourneys = renderJourneys;
  window.joinJourney = joinJourney;
})();
```

- [ ] **Step 5: Add journeys styles**

Append to `styles/main.css`:

```css
/* ── Journeys ── */
.journey-intro { font-size:0.82rem; color:var(--text2); line-height:1.6; margin-bottom:16px; }
.journey-card { background:var(--card2); border:1px solid var(--border); border-radius:var(--radius); padding:18px; margin-bottom:16px; }
.journey-head { display:flex; align-items:center; gap:12px; margin-bottom:12px; }
.journey-icon { font-size:1.6rem; }
.journey-name { font-weight:700; color:var(--gold-light); font-size:1rem; }
.journey-desc { font-size:0.78rem; color:var(--text2); margin-top:2px; }
.journey-start { background:rgba(212,175,55,0.1); border:1px solid rgba(212,175,55,0.35); color:var(--gold-light); padding:10px 18px; border-radius:20px; font-weight:700; font-size:0.82rem; cursor:pointer; letter-spacing:0.4px; transition:all .2s; }
.journey-start:hover { background:rgba(212,175,55,0.2); }
.journey-summary { font-size:0.82rem; color:var(--gold); font-weight:600; margin-bottom:12px; letter-spacing:0.3px; }
.journey-grid { display:grid; grid-template-columns:repeat(8, 1fr); gap:6px; }
.journey-cell { aspect-ratio:1; border-radius:8px; border:1px solid var(--border); background:rgba(0,0,0,0.2); display:flex; align-items:center; justify-content:center; font-size:0.75rem; color:var(--gold); }
.journey-cell.filled { background:rgba(212,175,55,0.16); border-color:rgba(212,175,55,0.45); }
```

- [ ] **Step 6: Run test to verify it passes**

Run: `node --test tests/journeys.test.js`
Expected: PASS — all 4 tests.

- [ ] **Step 7: Run the full suite**

Run: `node --test tests/*.test.js`
Expected: PASS — all 21 tests (2 state + 4 html + 5 garden + 6 muhasabah + 4 journeys).

- [ ] **Step 8: Commit**

```bash
git add data/journeys.js features/journeys.js styles/main.css tests/journeys.test.js
git commit -m "feat: add 40-day habit journeys"
```

---

## Acceptance checklist (manual browser verification)

Run after Task 4. Load `index.html` in a browser (Ctrl+F5 to bypass cache; `?v=1` cache-busters are on the new script tags).

1. **No console errors** on load; the app initializes as before.
2. **Garden** (`panel-today` top): card shows Seed at fresh state; toggling deeds raises `S.xp` → stage advances (Sprout at XP≥150 **and** streak≥3). Skip a day (no prayers logged): stage stays put (never regresses). Scale animation is subtle; caption rotates.
3. **Muhasabah**: non-Friday → no auto-modal; the "📝 Weekly Reflection" entry opens the modal manually. On a Friday with `S.muhWeek` empty → modal auto-opens once; dismiss sets `S.muhWeek` (verify in `localStorage` `iq9_user_default`) and it does not reopen on reload that day. Numbers match a hand-count of `S.log` for Mon–Fri. Suggestion names a zero-count deed from the pool (or the celebration line when all pool deeds were logged in 14 days).
4. **Journeys**: Journeys tab visible in the Daily strip between Challenges and Morning. "Begin 40-Day Journey" on `40 Days of Fajr` sets `S.journeys.fajr40`; toggling Fajr for 5 days with gaps fills exactly 5 consecutive cells (no reset, no shift); reload persists. Completing 40 shows the complete state.
5. **Leaderboard**: `panel-leaderboard` no longer exists in the DOM.
