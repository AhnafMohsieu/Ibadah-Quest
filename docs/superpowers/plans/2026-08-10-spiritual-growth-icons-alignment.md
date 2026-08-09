# Spiritual Growth Visuals, Icon Fixes & Alignment — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore the spiritual growth feature set to a complete, wired, visually-grown state (9 features with hand-crafted 7-stage SVG scenes), fix the missing-icon wiring, and run a full alignment audit.

**Architecture:** Fill the existing empty `*SVG()` stub functions in `features/garden.js` and `features/spiritual-growth/*.js` with stage-gated inline SVG scenes, restore the deleted `armor.js`/`heart.js` features, wire the four orphaned renderers (`renderKeys`, `renderMosque`, `renderRamadan`, `renderLaylat`), populate `FEATURE_ICONS` with `iqIcon()` output, and equalize card layouts in CSS.

**Tech Stack:** Vanilla JS (IIFE modules on `window`), inline SVG strings, CSS custom properties, `node:test` (static content assertions + `vm` sandbox loader).

## Global Constraints

- All scene colors must use theme vars (`var(--gold)`, `var(--gold-light)`, `var(--gold-dark)`, `var(--green)`, `var(--text2)`, `var(--card-bg)`) — no hardcoded old gold/amber hexes except where the design calls for a material color (keys, armor metal).
- Every SVG scene returns inline SVG markup (a string), no external assets.
- All new/existing renderers are invoked through the existing `safe(() => window.renderX && window.renderX(), 'X')` pattern — no bare calls that can throw.
- The spiritual heart renderer is `window.renderHeartRefinement` — it must NOT clobber the knowledge-pool `window.renderHeart` (render/render.js:805).
- Use `var` + string concat in `mosque.js` (it already uses that style); arrow funcs + template literals elsewhere.
- Full test suite must stay green: `node --test tests/html.test.js tests/sw.test.js tests/manifest.test.js tests/journeys.test.js tests/muhasabah.test.js tests/icons.test.js` (baseline: 47 pass).
- Commit style: lowercase conventional commits (`feat:`, `fix:`, `test:`, `style:`).

---

### Task 1: Populate FEATURE_ICONS and add heart to FEATURE_STAGES

**Files:**
- Modify: `features/spiritual-growth/data.js:95-130`

**Interfaces:**
- Consumes: `iqIcon(key)` from `data/icons.js` (loaded at index.html:288, before data.js at :390 — safe at module-eval time).
- Produces: `SpiritualGrowth.FEATURE_ICONS.{garden,lantern,keys,mosque,boat,heart,armor,ramadan,laylat}` as `<img class="iq-icon" …>` strings; `SpiritualGrowth.STAGES.heart` with 7 stages.

- [ ] **Step 1: Add the failing test**

Append to `tests/html.test.js`:

```js
test('FEATURE_ICONS are populated with iqIcon output for all 9 features', () => {
  for (const f of ['garden','lantern','keys','mosque','boat','heart','armor','ramadan','laylat']) {
    assert.ok(spiritual.includes(`iqIcon('`), 'data.js must call iqIcon() for FEATURE_ICONS');
    assert.ok(spiritual.includes(`${f}: iqIcon(`), `missing populated icon for ${f}`);
  }
});

test('FEATURE_STAGES includes heart with 7 stages', () => {
  assert.ok(spiritual.includes('heart: ['));
  const heartBlock = spiritual.slice(spiritual.indexOf('heart: ['), spiritual.indexOf('ramadan: ['));
  const names = (heartBlock.match(/name: '([^']+)'/g) || []);
  assert.strictEqual(names.length, 7);
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `node --test tests/html.test.js`
Expected: FAIL — `FEATURE_ICONS` entries are empty strings; `heart: [` not found in data.js.

- [ ] **Step 3: Implement**

In `features/spiritual-growth/data.js`:

Replace the `FEATURE_ICONS` block (lines 108-113):

```js
const FEATURE_ICONS = {
  garden: iqIcon('sprout'),
  lantern: iqIcon('lantern'),
  keys: iqIcon('key'),
  mosque: iqIcon('mosque'),
  boat: iqIcon('anchor'),
  heart: iqIcon('heart'),
  armor: iqIcon('shield'),
  ramadan: iqIcon('moon'),
  laylat: iqIcon('star')
};
```

Add the `heart` stage array. Insert it right before `ramadan: [` (immediately after `armor: [`), so the test slice `heart:` -> `ramadan:` spans exactly the 7 heart stages:

```js
  heart: [
    { name: 'Stone Heart', icon: 'heart', xp: 0 },
    { name: 'Softening', icon: 'heart', xp: 500 },
    { name: 'Awakening', icon: 'heart', xp: 1600 },
    { name: 'Warming', icon: 'heart', xp: 4200 },
    { name: 'Radiant', icon: 'heartbeat', xp: 11000 },
    { name: 'Golden', icon: 'heartbeat', xp: 28000 },
    { name: 'Pure Light', icon: 'sparkles', xp: 70000 }
  ],
```

- [ ] **Step 4: Run to verify it passes**

Run: `node --test tests/html.test.js`
Expected: PASS (both new tests).

- [ ] **Step 5: Commit**

```bash
git add features/spiritual-growth/data.js tests/html.test.js
git commit -m "feat: populate spiritual FEATURE_ICONS and add heart stages"
```

---

### Task 2: Fix icon rendering + mojibake in spiritual-growth/index.js

**Files:**
- Modify: `features/spiritual-growth/index.js:47-56, 82-84, 95`

**Interfaces:**
- Consumes: `SpiritualGrowth.FEATURE_ICONS[f]` (now `<img>` strings from Task 1), `iqIcon(key)`, `progress.icon` (a bare key like `sprout`).
- Produces: `.growth-setting-icon` and `.growth-tab-icon`/`.growth-tab-stage-emoji` populated with `<img class="iq-icon">` output instead of raw key text; clean `Stage n/7` label.

- [ ] **Step 1: Add the failing test**

Append to `tests/html.test.js`:

```js
test('growth tab + settings render icons through iqIcon, no mojibake separator', () => {
  assert.ok(spiritualGrowth.indexOf('iqIcon(progress.icon') > -1,
    'growth tab stage emoji must be wrapped in iqIcon()');
  assert.ok(!spiritualGrowth.includes(' ? Stage'),
    'growth tab stage label must not contain mojibake " ? "');
  assert.ok(spiritualGrowth.indexOf('iqIcon(progress.icon || f)') > -1,
    'growth settings icon fallback must be wrapped in iqIcon()');
});
```

Add near the top of `tests/html.test.js`:

```js
const spiritualGrowth = fs.readFileSync(path.join(root, 'features', 'spiritual-growth', 'index.js'), 'utf8');
```

- [ ] **Step 2: Run to verify it fails**

Run: `node --test tests/html.test.js`
Expected: FAIL — index.js currently renders `progress.icon` raw and contains ` ? `.

- [ ] **Step 3: Implement**

In `features/spiritual-growth/index.js`:

`renderGrowthSettings()` — replace line 47:

```js
      const icon = SpiritualGrowth.FEATURE_ICONS[f] || iqIcon(progress.icon || f);
```

`renderSpiritualGrowthTab()` — replace lines 82-84:

```js
      const icon = SpiritualGrowth.FEATURE_ICONS[f] || '';
      const stageEmoji = iqIcon(progress.icon || f);
```

Mojibake stage label (line 96): verified already clean (`${progress.name} · Stage ${progress.stage}/${progress.totalStages}` at both HEAD and working tree — the earlier `?` was a terminal-display artifact, not a file defect). No edit needed; the test's `!spiritualGrowth.includes(' ? Stage')` guard simply seals against regressions.

- [ ] **Step 4: Run to verify it passes**

Run: `node --test tests/html.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add features/spiritual-growth/index.js tests/html.test.js
git commit -m "fix: render growth icons via iqIcon and fix mojibake label"
```

---

### Task 3: Create the vm test loader helper

**Files:**
- Create: `tests/helpers/loadSpiritual.js`

**Interfaces:**
- Produces: `loadSpiritual(filePath, overrides)` → `{ sandbox, el }` where `el.innerHTML` captures the rendered HTML. Used by Tasks 4-5 and 8-14.

- [ ] **Step 1: Write the helper**

Create `tests/helpers/loadSpiritual.js`:

```js
'use strict';
const fs = require('fs');
const vm = require('vm');

function loadSpiritual(filePath, overrides) {
  const code = fs.readFileSync(filePath, 'utf8');
  const el = { innerHTML: '', querySelector: () => null };
  const spiritualStub = {
    getProgress: () => ({ stage: 3, totalStages: 7, name: 'Test', icon: 'star', xp: 100, xpForNext: 200, progress: 0.5 }),
    isVisible: () => true,
    FEATURE_ICONS: {
      garden: '', lantern: '', keys: '', mosque: '', boat: '',
      heart: '', armor: '', ramadan: '', laylat: ''
    }
  };
  const sandbox = {
    window: {},
    console,
    document: { getElementById: () => el },
    SpiritualGrowth: spiritualStub,
    S: { xp: 100, cs: 0, bs: 0 },
    iqIcon: (k) => `<img class="iq-icon" src="x" alt="${k}">`,
    TAB_GROUPS: { profile_main: [] },
    localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} }
  };
  Object.assign(sandbox, overrides || {});
  if (overrides && overrides.document === undefined) sandbox.document.getElementById = () => el;
  vm.runInNewContext(code, sandbox, { filename: filePath });
  return { sandbox, el };
}

module.exports = { loadSpiritual };
```

- [ ] **Step 2: Sanity-check the helper works**

Run: `node -e "const {loadSpiritual}=require('./tests/helpers/loadSpiritual.js'); const {el}=loadSpiritual('./features/spiritual-growth/lantern.js'); console.log(el.innerHTML.slice(0,60));"`
Expected: logs the empty render output (lantern.js still renders an empty SVG now, but no throw). If it throws, fix the sandbox.

- [ ] **Step 3: Commit**

```bash
git add tests/helpers/loadSpiritual.js
git commit -m "test: add vm loader helper for spiritual feature files"
```

---

### Task 4: Restore Spiritual Armor with 7-stage SVG scene

**Files:**
- Create: `features/spiritual-growth/armor.js`
- Test: `tests/growth.test.js` (new file)

**Interfaces:**
- Consumes: `SpiritualGrowth.getProgress('armor')`, `SpiritualGrowth.isVisible('armor')`, `SpiritualGrowth.FEATURE_ICONS.armor` (Task 1), `S.cs`/`S.bs`.
- Produces: `window.renderArmor` (renders into `#armorArea`).

- [ ] **Step 1: Write the failing test**

Create `tests/growth.test.js`:

```js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const { loadSpiritual } = require('./helpers/loadSpiritual');

const feature = (name) => path.join(__dirname, '..', 'features', 'spiritual-growth', name + '.js');

test('renderArmor renders a stage-gated SVG scene', () => {
  const { sandbox, el } = loadSpiritual(feature('armor'));
  sandbox.window.renderArmor();
  assert.ok(el.innerHTML.includes('<svg'), 'armor SVG missing');
  assert.ok(el.innerHTML.includes('Stage 3/7'), 'stage badge missing');
  assert.ok(el.innerHTML.includes('spiritual-card'), 'card wrapper missing');
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `node --test tests/growth.test.js`
Expected: FAIL — `armor.js` does not exist (module load throws).

- [ ] **Step 3: Implement**

Create `features/spiritual-growth/armor.js` (restored + themed, stage-gated parts 1-7):

```js
// features/spiritual-growth/armor.js
// Spiritual Armor — Collect pieces of protection

(function() {
  const CAPTIONS = [
    'Truth is the first piece of armor.',
    'Stand firm on the path.',
    'Guard your thoughts and intentions.',
    'Patience shields against trials.',
    'Faith deflects doubts.',
    'Knowledge is your sharpest weapon.',
    'You are fully armored with taqwa.'
  ];
  function caption() {
    const d = new Date();
    return CAPTIONS[Math.floor(d.getTime() / 86400000) % CAPTIONS.length];
  }

  function armorSVG(stage) {
    let parts = '';
    if (stage >= 1) {
      parts += `<rect x="35" y="95" width="50" height="10" fill="var(--gold)" rx="2"/>`;
      parts += `<circle cx="60" cy="100" r="5" fill="var(--gold-light)"/>`;
    }
    if (stage >= 2) {
      parts += `<rect x="32" y="122" width="16" height="20" fill="#8B4513" rx="3"/>`;
      parts += `<rect x="72" y="122" width="16" height="20" fill="#8B4513" rx="3"/>`;
    }
    if (stage >= 3) {
      parts += `<ellipse cx="60" cy="30" rx="18" ry="14" fill="var(--gold)"/>`;
      parts += `<rect x="56" y="40" width="8" height="6" fill="var(--gold)"/>`;
    }
    if (stage >= 4) {
      parts += `<rect x="42" y="52" width="36" height="38" fill="var(--gold)" opacity="0.7" rx="5"/>`;
    }
    if (stage >= 5) {
      parts += `<ellipse cx="24" cy="70" rx="14" ry="18" fill="var(--gold-light)"/>`;
      parts += `<ellipse cx="24" cy="70" rx="9" ry="14" fill="var(--gold)"/>`;
    }
    if (stage >= 6) {
      parts += `<rect x="93" y="42" width="4" height="55" fill="#C0C0C0" rx="2"/>`;
      parts += `<rect x="88" y="48" width="14" height="5" fill="#8B4513" rx="1"/>`;
    }
    if (stage === 7) {
      parts += `<circle cx="60" cy="80" r="48" fill="none" stroke="var(--gold)" stroke-width="2" opacity="0.35"/>`;
      parts += `<path d="M84 24 a9 9 0 1 0 2 11 a11 11 0 1 1 -2 -11 Z" fill="var(--gold)" opacity="0.9"/>`;
    }
    return `<svg class="spiritual-svg" viewBox="0 0 120 160">${parts}</svg>`;
  }

  function renderArmor() {
    const el = document.getElementById('armorArea');
    if (!el || !SpiritualGrowth.isVisible('armor')) {
      if (el) el.innerHTML = '';
      return;
    }
    const progress = SpiritualGrowth.getProgress('armor');
    const progressText = progress.xpForNext
      ? `${progress.xp}/${progress.xpForNext} XP to ${progress.name}`
      : 'Your armor is complete — full protection.';
    el.innerHTML = `<div class="spiritual-card">
      <div class="spiritual-svg-wrap">${armorSVG(progress.stage)}</div>
      <div class="spiritual-info">
        <div class="spiritual-stage-name">${SpiritualGrowth.FEATURE_ICONS.armor} Spiritual Armor <span class="spiritual-stage-num">Stage ${progress.stage}/7</span></div>
        <div class="spiritual-progress">${progressText}</div>
        <div class="spiritual-progress-bar">
          <div class="spiritual-progress-fill" style="width:${Math.round(progress.progress * 100)}%"></div>
        </div>
        <div class="spiritual-caption">${caption()}</div>
      </div>
    </div>`;
  }

  window.renderArmor = renderArmor;
})();
```

- [ ] **Step 4: Run to verify it passes**

Run: `node --test tests/growth.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add features/spiritual-growth/armor.js tests/growth.test.js
git commit -m "feat: restore spiritual armor with 7-stage SVG scene"
```

---

### Task 5: Restore Heart Refinement with 7-stage SVG scene

**Files:**
- Create: `features/spiritual-growth/heart.js`
- Test: `tests/growth.test.js`

**Interfaces:**
- Consumes: `SpiritualGrowth.getProgress('heart')` (now exists via Task 1), `SpiritualGrowth.isVisible('heart')`, `SpiritualGrowth.FEATURE_ICONS.heart`.
- Produces: `window.renderHeartRefinement` (renders into `#heartArea`). Must NOT be named `renderHeart`.

- [ ] **Step 1: Add the failing test**

Append to `tests/growth.test.js`:

```js
test('renderHeartRefinement renders a stage-gated SVG scene without clobbering renderHeart', () => {
  const { sandbox, el } = loadSpiritual(feature('heart'));
  assert.strictEqual(typeof sandbox.window.renderHeartRefinement, 'function', 'renderHeartRefinement not exported');
  assert.strictEqual(sandbox.window.renderHeart, undefined, 'must not clobber knowledge-pool renderHeart');
  sandbox.window.renderHeartRefinement();
  assert.ok(el.innerHTML.includes('<svg'), 'heart SVG missing');
  assert.ok(el.innerHTML.includes('Stage 3/7'), 'stage badge missing');
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `node --test tests/growth.test.js`
Expected: FAIL — `heart.js` does not exist.

- [ ] **Step 3: Implement**

Create `features/spiritual-growth/heart.js`:

```js
// features/spiritual-growth/heart.js
// Heart Refinement — Transform your heart from stone to light

(function() {
  const CAPTIONS = [
    'The heart begins its transformation.',
    'Sincerity softens the hardest stone.',
    'Each deed polishes the heart.',
    'The heart grows strong with iman.',
    'Purity reflects like silver.',
    'The heart shines like gold.',
    'Your heart is pure light.'
  ];
  function caption() {
    const d = new Date();
    return CAPTIONS[Math.floor(d.getTime() / 86400000) % CAPTIONS.length];
  }
  const HEART_COLORS = {
    1: '#696969', 2: '#CD853F', 3: '#B87333',
    4: '#4A4A4A', 5: '#C0C0C0', 6: '#FFD700', 7: '#FFF'
  };

  function heartSVG(stage) {
    const color = HEART_COLORS[stage];
    let svg = '';
    if (stage === 7) {
      svg += `<defs>
        <filter id="heartGlow7" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>`;
    }
    svg += `<path d="M60 135 L18 78 Q0 58 18 38 Q36 18 60 48 Q84 18 102 38 Q120 58 102 78 Z"
      fill="${color}" ${stage === 7 ? 'filter="url(#heartGlow7)"' : ''} opacity="0.9"/>`;
    if (stage >= 3) {
      svg += `<path d="M60 90 Q48 74 60 62 Q72 74 60 90 Z" fill="var(--card-bg)" opacity="0.55"/>`;
    }
    if (stage >= 5) {
      svg += `<circle cx="60" cy="78" r="${44 + stage}" fill="none" stroke="var(--gold)" stroke-width="2" opacity="${0.15 + stage * 0.05}"/>`;
    }
    if (stage === 7) {
      svg += `<circle cx="60" cy="80" r="18" fill="#FFF" opacity="0.4"/>`;
      svg += `<path d="M84 22 a9 9 0 1 0 2 11 a11 11 0 1 1 -2 -11 Z" fill="var(--gold)" opacity="0.9"/>`;
    }
    return `<svg class="spiritual-svg" viewBox="0 0 120 160">${svg}</svg>`;
  }

  function renderHeartRefinement() {
    const el = document.getElementById('heartArea');
    if (!el || !SpiritualGrowth.isVisible('heart')) {
      if (el) el.innerHTML = '';
      return;
    }
    const progress = SpiritualGrowth.getProgress('heart');
    const progressText = progress.xpForNext
      ? `${progress.xp}/${progress.xpForNext} XP to ${progress.name}`
      : 'Your heart is pure light — a reflection of faith.';
    el.innerHTML = `<div class="spiritual-card">
      <div class="spiritual-svg-wrap">${heartSVG(progress.stage)}</div>
      <div class="spiritual-info">
        <div class="spiritual-stage-name">${SpiritualGrowth.FEATURE_ICONS.heart} Heart Refinement <span class="spiritual-stage-num">Stage ${progress.stage}/7</span></div>
        <div class="spiritual-progress">${progressText}</div>
        <div class="spiritual-progress-bar">
          <div class="spiritual-progress-fill" style="width:${Math.round(progress.progress * 100)}%"></div>
        </div>
        <div class="spiritual-caption">${caption()}</div>
      </div>
    </div>`;
  }

  window.renderHeartRefinement = renderHeartRefinement;
})();
```

- [ ] **Step 4: Run to verify it passes**

Run: `node --test tests/growth.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add features/spiritual-growth/heart.js tests/growth.test.js
git commit -m "feat: restore heart refinement with 7-stage SVG scene"
```

---

### Task 6: Add armor/heart areas + script tags to index.html

**Files:**
- Modify: `index.html:278` (growth panel) and the spiritual-growth script block (~line 390).

**Interfaces:**
- Consumes: nothing new.
- Produces: `#armorArea` and `#heartArea` container divs in `#panel-growth`; `<script>` tags loading `armor.js` + `heart.js` after `index.js`.

- [ ] **Step 1: Add the failing test**

Append to `tests/html.test.js`:

```js
test('index.html declares armor/heart growth areas and loads their scripts', () => {
  assert.ok(html.includes('id="armorArea"'), 'armorArea missing');
  assert.ok(html.includes('id="heartArea"'), 'heartArea missing');
  assert.ok(html.includes('features/spiritual-growth/armor.js'), 'armor script missing');
  assert.ok(html.includes('features/spiritual-growth/heart.js'), 'heart script missing');
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `node --test tests/html.test.js`
Expected: FAIL — no armor/heart areas or scripts.

- [ ] **Step 3: Implement**

In `index.html` line 278, change:

```html
<div class="tab-panel" id="panel-growth"><div id="growthStatArea"></div><div id="growthCalArea"></div><div id="growthArea"></div></div>
```

to:

```html
<div class="tab-panel" id="panel-growth"><div id="growthStatArea"></div><div id="growthCalArea"></div><div id="growthArea"></div><div id="armorArea"></div><div id="heartArea"></div></div>
```

In the Spiritual Growth Features script block, after `<script src="features/spiritual-growth/index.js?v=2"></script>`, add:

```html
<script src="features/spiritual-growth/armor.js?v=1"></script>
<script src="features/spiritual-growth/heart.js?v=1"></script>
```

- [ ] **Step 4: Run to verify it passes**

Run: `node --test tests/html.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add index.html tests/html.test.js
git commit -m "feat: add armor and heart growth areas and scripts"
```

---

### Task 7: Wire all 9 renderers into renderDynamic, _lazyRender, and renderTab

**Files:**
- Modify: `render/render.js:20`, `core/actions.js:2209-2253` (`_lazyRender`), `core/actions.js:2289-2296` (`renderTab`).

**Interfaces:**
- Consumes: `window.renderKeys`, `window.renderMosque`, `window.renderRamadan`, `window.renderLaylat`, `window.renderHeartRefinement`, `window.renderArmor` (all defined after Tasks 4-5 + existing files).
- Produces: keys/mosque cards populate in `#panel-profile`; ramadan/laylat/armor/heart render when their panels open; all nine update on `renderDynamic`.

- [ ] **Step 1: Add the failing test**

Append to `tests/html.test.js`:

```js
test('growth renderers are wired into renderDynamic and tab render paths', () => {
  for (const name of ['renderKeys','renderMosque','renderRamadan','renderLaylat','renderHeartRefinement','renderArmor']) {
    assert.ok(render.includes(`window.${name}`), `renderDynamic must reference ${name}`);
  }
  for (const key of ["keys:'renderKeys'","mosque:'renderMosque'","ramadan:'renderRamadan'","laylat:'renderLaylat'"]) {
    assert.ok(actions.includes(key), `_lazyRender must map ${key}`);
  }
  assert.ok(actions.indexOf('renderHeartRefinement') > -1, 'renderTab must call renderHeartRefinement');
  assert.ok(actions.indexOf('renderArmor') > -1, 'renderTab must call renderArmor');
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `node --test tests/html.test.js`
Expected: FAIL — none of the six renderers are referenced.

- [ ] **Step 3: Implement**

In `render/render.js` line 20, after the existing `safe(() => window.renderBoat && window.renderBoat(), 'Boat')` entry, append:

```js
 safe(() => window.renderKeys && window.renderKeys(), 'Keys'); safe(() => window.renderMosque && window.renderMosque(), 'Mosque'); safe(() => window.renderRamadan && window.renderRamadan(), 'Ramadan'); safe(() => window.renderLaylat && window.renderLaylat(), 'Laylat'); safe(() => window.renderHeartRefinement && window.renderHeartRefinement(), 'HeartRefinement'); safe(() => window.renderArmor && window.renderArmor(), 'Armor');
```

In `core/actions.js`, `_lazyRender` map (lines 2209-2253), add before the closing `};`:

```js
      keys:'renderKeys', mosque:'renderMosque', ramadan:'renderRamadan', laylat:'renderLaylat'
```

(Note: `mosque`/`keys` fire when the profile group panel is visited. `panel-ramadan`/`panel-laylat` currently have no activation tab in `getSectionPanels`/`_lazyRender` callers, so those two entries are harmless future-proofing — their area divs are always present in the DOM, so `renderDynamic()` (Task 7, render.js) still populates them.)

In `core/actions.js`, `renderTab('growth')` (lines 2289-2293), add after the existing Boat line:

```js
      if (window.renderArmor) window.renderArmor();
      if (window.renderHeartRefinement) window.renderHeartRefinement();
```

In `core/actions.js`, `renderTab('profile')` (line 2295), change:

```js
      window.renderProfile();
```

to:

```js
      window.renderProfile();
      if (window.renderKeys) window.renderKeys();
      if (window.renderMosque) window.renderMosque();
```

- [ ] **Step 4: Run to verify it passes**

Run: `node --test tests/html.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add render/render.js core/actions.js tests/html.test.js
git commit -m "fix: wire all spiritual growth renderers into render paths"
```

---

### Task 8: Garden tree SVG scene (7 stages)

**Files:**
- Modify: `features/garden.js:28` (`treeSVG`)
- Test: `tests/growth.test.js`

**Interfaces:**
- Consumes: `stage` (1-7), `flowers` (from existing `flowerCount(streak)`).
- Produces: `treeSVG(stage, flowers)` returns a non-empty `<svg class="garden-svg">` string.

- [ ] **Step 1: Add the failing test**

Append to `tests/growth.test.js`:

```js
test('garden treeSVG renders a real scene', () => {
  const { sandbox, el } = loadSpiritual(path.join(__dirname, '..', 'features', 'garden.js'));
  sandbox.window.renderGarden();
  assert.ok(el.innerHTML.includes('class="garden-svg"'), 'garden SVG must carry garden-svg class');
  assert.ok(el.innerHTML.includes('Stage 3/7'), 'stage badge missing');
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `node --test tests/growth.test.js`
Expected: FAIL — `treeSVG` returns `''` (no `garden-svg` class anywhere). (Note: no `fs`/`gardenSrc` reads are needed for this task — the helper loads garden.js directly; do not add them.)

- [ ] **Step 3: Implement**

In `features/garden.js`, replace the `treeSVG` stub (line 28) with:

```js
  function treeSVG(stage, flowers) {
    let h = '';
    h += `<rect width="120" height="132" fill="var(--card-bg)" rx="10"/>`;
    h += `<ellipse cx="60" cy="124" rx="52" ry="9" fill="#6B5B3E" opacity="0.55"/>`;
    if (stage >= 1) {
      h += `<ellipse cx="60" cy="120" rx="20" ry="7" fill="#8B5A2B" opacity="0.9"/>`;
    }
    if (stage >= 2) {
      h += `<path d="M60 120 Q58 104 60 94" stroke="var(--green)" stroke-width="3" fill="none"/>`;
      h += `<path d="M60 96 Q50 88 44 93 Q53 97 60 96 Z" fill="var(--green)"/>`;
      h += `<path d="M60 104 Q70 96 76 101 Q67 105 60 104 Z" fill="var(--green)" opacity="0.85"/>`;
    }
    if (stage >= 3) {
      h += `<path d="M60 121 Q57 102 60 80" stroke="#8B5A2B" stroke-width="5" fill="none"/>`;
      h += `<ellipse cx="60" cy="74" rx="17" ry="13" fill="var(--green)"/>`;
    }
    if (stage >= 4) {
      h += `<path d="M60 122 Q56 100 60 72" stroke="#8B5A2B" stroke-width="8" fill="none"/>`;
      h += `<ellipse cx="60" cy="62" rx="26" ry="20" fill="var(--green)"/>`;
      h += `<ellipse cx="42" cy="74" rx="13" ry="11" fill="var(--green)" opacity="0.85"/>`;
    }
    if (stage >= 5) {
      h += `<path d="M60 123 Q55 96 60 66" stroke="#8B5A2B" stroke-width="11" fill="none"/>`;
      h += `<ellipse cx="60" cy="54" rx="36" ry="28" fill="var(--green)"/>`;
      h += `<ellipse cx="36" cy="66" rx="15" ry="12" fill="var(--green)" opacity="0.9"/>`;
      h += `<ellipse cx="84" cy="64" rx="15" ry="12" fill="var(--green)" opacity="0.9"/>`;
    }
    if (stage >= 6) {
      h += `<path d="M60 124 Q54 94 60 58" stroke="#8B5A2B" stroke-width="13" fill="none"/>`;
      h += `<ellipse cx="60" cy="46" rx="42" ry="34" fill="var(--green)"/>`;
      for (let i = 0; i < flowers; i++) {
        const a = (i / Math.max(1, flowers)) * Math.PI * 2;
        const x = 60 + Math.cos(a) * 30;
        const y = 46 + Math.sin(a) * 24;
        h += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.4" fill="var(--gold)"/>`;
      }
    }
    if (stage === 7) {
      h += `<circle cx="60" cy="56" r="54" fill="none" stroke="var(--gold)" stroke-width="2" opacity="0.4"/>`;
      h += `<circle cx="60" cy="46" r="44" fill="var(--gold)" opacity="0.12"/>`;
      h += `<path d="M88 18 a9 9 0 1 0 2 11 a11 11 0 1 1 -2 -11 Z" fill="var(--gold)" opacity="0.9"/>`;
    }
    return `<svg class="garden-svg" viewBox="0 0 120 132">${h}</svg>`;
  }
```

- [ ] **Step 4: Run to verify it passes**

Run: `node --test tests/growth.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add features/garden.js tests/growth.test.js
git commit -m "feat: add 7-stage garden tree SVG scene"
```

---

### Task 9: Nur Lantern SVG scene (7 stages)

**Files:**
- Modify: `features/spiritual-growth/lantern.js:11` (`lanternSVG`)
- Test: `tests/growth.test.js`

**Interfaces:**
- Consumes: `stage`, `progress` (0-1).
- Produces: `lanternSVG(stage, progress)` returns a non-empty `<svg class="spiritual-svg">` string.

- [ ] **Step 1: Add the failing test**

Append to `tests/growth.test.js`:

```js
test('renderLantern renders a real SVG scene', () => {
  const { sandbox, el } = loadSpiritual(feature('lantern'));
  sandbox.window.renderLantern();
  assert.ok(el.innerHTML.includes('<svg'), 'lantern SVG missing');
  assert.ok(el.innerHTML.includes('spiritual-svg'), 'lantern must use spiritual-svg class');
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `node --test tests/growth.test.js`
Expected: FAIL — `lanternSVG` returns `''` (no `<svg`).

- [ ] **Step 3: Implement**

In `features/spiritual-growth/lantern.js`, replace the stub (line 11) with:

```js
  function lanternSVG(stage, progress) {
    const p = Math.max(0, Math.min(1, progress || 0));
    const flame = Math.min(1, (stage - 1) / 6 + p * 0.15);
    const glowO = (0.15 + flame * 0.55).toFixed(2);
    const flameH = 8 + flame * 20;
    let h = `<rect width="120" height="132" fill="var(--card-bg)" rx="10"/>`;
    h += `<circle cx="60" cy="78" r="${(26 + flame * 24).toFixed(1)}" fill="var(--gold)" opacity="${glowO}"/>`;
    if (stage >= 5) {
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const r1 = 52 + flame * 8;
        const r2 = 66 + flame * 10;
        h += `<line x1="${(60 + Math.cos(a) * r1).toFixed(1)}" y1="${(78 + Math.sin(a) * r1).toFixed(1)}" x2="${(60 + Math.cos(a) * r2).toFixed(1)}" y2="${(78 + Math.sin(a) * r2).toFixed(1)}" stroke="var(--gold)" stroke-width="2" opacity="${(0.3 + (stage - 5) * 0.15).toFixed(2)}"/>`;
      }
    }
    h += `<rect x="42" y="54" width="36" height="48" rx="8" fill="var(--card-bg)" stroke="var(--gold)" stroke-width="2.5"/>`;
    h += `<rect x="46" y="58" width="28" height="40" rx="6" fill="var(--gold)" opacity="${(0.1 + flame * 0.5).toFixed(2)}"/>`;
    h += `<line x1="60" y1="58" x2="60" y2="98" stroke="var(--gold)" stroke-width="1.5"/>`;
    h += `<rect x="44" y="48" width="32" height="7" rx="3" fill="var(--gold)"/>`;
    h += `<path d="M46 48 Q60 32 74 48" fill="none" stroke="var(--gold)" stroke-width="3"/>`;
    if (stage >= 2) {
      const yTop = 100 - flameH;
      h += `<path d="M60 ${yTop.toFixed(1)} C48 ${(yTop + 10).toFixed(1)} 50 ${(yTop + 20).toFixed(1)} 60 ${(yTop + 22).toFixed(1)} C70 ${(yTop + 20).toFixed(1)} 72 ${(yTop + 10).toFixed(1)} 60 ${yTop.toFixed(1)} Z" fill="var(--gold)"/>`;
    }
    if (stage === 7) {
      h += `<path d="M86 20 a9 9 0 1 0 2 11 a11 11 0 1 1 -2 -11 Z" fill="var(--gold)" opacity="0.9"/>`;
    }
    return `<svg class="spiritual-svg" viewBox="0 0 120 132">${h}</svg>`;
  }
```

- [ ] **Step 4: Run to verify it passes**

Run: `node --test tests/growth.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add features/spiritual-growth/lantern.js tests/growth.test.js
git commit -m "feat: add 7-stage nur lantern SVG scene"
```

---

### Task 10: Mosque Builder SVG scene (7 stages)

**Files:**
- Modify: `features/spiritual-growth/mosque.js:22` (`mosqueSVG`)
- Test: `tests/growth.test.js`

**Interfaces:**
- Consumes: `stage`.
- Produces: `mosqueSVG(stage)` returns a non-empty `<svg class="spiritual-svg">` string. (mosque.js uses `var` + string concat style — match it.)

- [ ] **Step 1: Add the failing test**

Append to `tests/growth.test.js`:

```js
test('renderMosque renders a real SVG scene', () => {
  const { sandbox, el } = loadSpiritual(feature('mosque'));
  sandbox.window.renderMosque();
  assert.ok(el.innerHTML.includes('<svg'), 'mosque SVG missing');
  assert.ok(el.innerHTML.includes('Stage 3/7'), 'stage badge missing');
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `node --test tests/growth.test.js`
Expected: FAIL — `mosqueSVG` returns `''`.

- [ ] **Step 3: Implement**

In `features/spiritual-growth/mosque.js`, replace the stub (line 22) with:

```js
  function mosqueSVG(stage) {
    var h = '<rect width="120" height="132" fill="var(--card-bg)" rx="10"/>';
    h += '<line x1="10" y1="118" x2="110" y2="118" stroke="var(--text2)" stroke-width="2" opacity="0.35"/>';
    if (stage >= 1) h += '<rect x="30" y="106" width="60" height="9" fill="var(--gold)" opacity="0.8"/>';
    if (stage >= 2) h += '<rect x="34" y="64" width="52" height="42" fill="var(--card-bg)" stroke="var(--gold)" stroke-width="2"/>';
    if (stage >= 3) h += '<path d="M28 64 L60 38 L92 64 Z" fill="var(--gold)" opacity="0.85"/>';
    if (stage >= 4) h += '<path d="M46 38 Q60 8 74 38 Z" fill="var(--gold)"/>';
    if (stage >= 5) h += '<rect x="92" y="58" width="8" height="48" fill="var(--gold)" opacity="0.9"/>' +
      '<circle cx="96" cy="56" r="4" fill="var(--gold)"/>';
    if (stage >= 6) h += '<path d="M46 86 h9 q0 -10 -9 -10 z M74 86 h-9 q0 -10 9 -10 z" fill="var(--gold)" opacity="0.9"/>';
    if (stage === 7) {
      h += '<circle cx="60" cy="70" r="54" fill="none" stroke="var(--gold)" stroke-width="2" opacity="0.35"/>';
      h += '<path d="M86 18 a9 9 0 1 0 2 11 a11 11 0 1 1 -2 -11 Z" fill="var(--gold)" opacity="0.9"/>';
    }
    return '<svg class="spiritual-svg" viewBox="0 0 120 132">' + h + '</svg>';
  }
```

- [ ] **Step 4: Run to verify it passes**

Run: `node --test tests/growth.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add features/spiritual-growth/mosque.js tests/growth.test.js
git commit -m "feat: add 7-stage mosque builder SVG scene"
```

---

### Task 11: Journey Boat SVG scene (7 stages)

**Files:**
- Modify: `features/spiritual-growth/boat.js:12` (`boatSVG`)
- Test: `tests/growth.test.js`

**Interfaces:**
- Consumes: `stage`, `progress`.
- Produces: `boatSVG(stage, progress)` returns a non-empty `<svg class="spiritual-svg">` string.

- [ ] **Step 1: Add the failing test**

Append to `tests/growth.test.js`:

```js
test('renderBoat renders a real SVG scene', () => {
  const { sandbox, el } = loadSpiritual(feature('boat'));
  sandbox.window.renderBoat();
  assert.ok(el.innerHTML.includes('<svg'), 'boat SVG missing');
  assert.ok(el.innerHTML.includes('Stage 3/7'), 'stage badge missing');
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `node --test tests/growth.test.js`
Expected: FAIL — `boatSVG` returns `''`.

- [ ] **Step 3: Implement**

In `features/spiritual-growth/boat.js`, replace the stub (line 12) with:

```js
  function boatSVG(stage, progress) {
    const p = Math.max(0, Math.min(1, progress || 0));
    let sky = 'var(--card-bg)';
    if (stage >= 3) sky = '#5B9BD5';
    if (stage === 4) sky = '#2E4053';
    if (stage >= 5) sky = '#F4C27A';
    let h = `<rect width="120" height="132" fill="${sky}" opacity="0.85" rx="10"/>`;
    if (stage === 3) h += `<circle cx="92" cy="34" r="13" fill="var(--gold)"/>`;
    if (stage >= 5) h += `<circle cx="92" cy="44" r="15" fill="var(--gold)"/>`;
    if (stage === 4) {
      h += `<path d="M20 34 Q35 20 52 32 Q62 20 76 30 Q90 22 100 34 L100 44 L20 44 Z" fill="#39464F"/>`;
      h += `<polyline points="50 54 58 68 54 68 62 82" fill="none" stroke="var(--gold)" stroke-width="2.5"/>`;
    }
    if (stage >= 7) h += `<path d="M84 18 a9 9 0 1 0 2 11 a11 11 0 1 1 -2 -11 Z" fill="var(--gold)"/>`;
    if (stage >= 6) {
      h += `<path d="M12 108 Q24 90 36 108 Z" fill="var(--green)"/>`;
      h += `<path d="M14 108 Q24 98 34 108" fill="none" stroke="var(--green)" stroke-width="2"/>`;
    }
    h += `<path d="M0 118 Q15 110 30 118 T60 118 T90 118 T120 118 V132 H0 Z" fill="${stage === 4 ? '#1B2A35' : '#3A6EA5'}"/>`;
    h += `<path d="M44 100 Q60 112 78 100 L76 108 Q60 118 46 108 Z" fill="#8B5A2B"/>`;
    const sailP = stage >= 3 ? 1 : stage === 2 ? (0.4 + p * 0.6) : 0;
    if (sailP > 0) {
      h += `<line x1="60" y1="50" x2="60" y2="100" stroke="var(--text2)" stroke-width="2"/>`;
      h += `<path d="M60 ${(104 - 34 * sailP).toFixed(1)} L60 ${(100).toFixed(1)} L${(60 + 22 * sailP).toFixed(1)} ${(104 - 24 * sailP).toFixed(1)} Z" fill="var(--gold)" opacity="0.9"/>`;
    }
    return `<svg class="spiritual-svg" viewBox="0 0 120 132">${h}</svg>`;
  }
```

- [ ] **Step 4: Run to verify it passes**

Run: `node --test tests/growth.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add features/spiritual-growth/boat.js tests/growth.test.js
git commit -m "feat: add 7-stage journey boat SVG scene"
```

---

### Task 12: Paradise Keys SVG scene (7 stages)

**Files:**
- Modify: `features/spiritual-growth/keys.js:36-60` (`drawKey`) and `keys.js:62` (`keysSVG`)
- Test: `tests/growth.test.js`

**Interfaces:**
- Consumes: existing `drawKey(x, y, angle, scale)` helper + `KEY_COUNTS [1,2,3,5,7,9,10]`.
- Produces: extended `drawKey(..., color)` that accepts an optional stroke color (defaults to `var(--gold)`); `keysSVG(stage, progress)` returns a non-empty `<svg class="spiritual-svg">` string with `count` keys arranged in an arc.

- [ ] **Step 1: Add the failing test**

Append to `tests/growth.test.js`:

```js
test('renderKeys renders a real SVG scene with per-stage key count', () => {
  const { sandbox, el } = loadSpiritual(feature('keys'));
  sandbox.window.renderKeys();
  assert.ok(el.innerHTML.includes('<svg'), 'keys SVG missing');
  assert.ok(el.innerHTML.includes('spiritual-svg'), 'keys must use spiritual-svg class');
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `node --test tests/growth.test.js`
Expected: FAIL — `keysSVG` returns `''`.

- [ ] **Step 3: Implement**

In `features/spiritual-growth/keys.js`:

Change the `drawKey` signature (line 36) and its stroke usages to use the color parameter:

```js
  function drawKey(x, y, angle, scale, stroke) {
```

Replace `stroke="${gold}"` with `stroke="${stroke}"` in the **three** stroke-drawing lines (bow circle line 44, shaft line 50, bit polyline line 56). Keep line 45 (the inner dot) as `fill="${gold}"`. Leave the existing `gold`/`silver`/`lightGold` consts untouched (they are pre-existing; `gold` is still used as the default call convention is preserved by callers passing the 5th arg).

Replace the `keysSVG` stub (line 62) with:

```js
  function keysSVG(stage, progress) {
    const count = KEY_COUNTS[Math.min(stage, 7) - 1];
    const cols = {
      1: '#9CA3AF', 2: '#CD853F', 3: '#B87333',
      4: '#6B7280', 5: '#C0C0C0', 6: '#FFD700', 7: '#FFF3B0'
    };
    const col = cols[stage];
    let h = `<rect width="120" height="132" fill="var(--card-bg)" rx="10"/>`;
    const spread = Math.max(0, count - 1);
    for (let i = 0; i < count; i++) {
      const t = spread === 0 ? 0.5 : i / spread;
      const x = 30 + t * 60;
      const y = 72 - Math.sin(t * Math.PI) * 20;
      const angle = -30 + t * 60;
      h += drawKey(x, y, angle, 1, col);
    }
    if (stage === 7) {
      h += `<circle cx="60" cy="70" r="50" fill="none" stroke="var(--gold)" stroke-width="2" opacity="0.4"/>`;
      h += `<path d="M84 18 a9 9 0 1 0 2 11 a11 11 0 1 1 -2 -11 Z" fill="var(--gold)" opacity="0.9"/>`;
    }
    return `<svg class="spiritual-svg" viewBox="0 0 120 132">${h}</svg>`;
  }
```

- [ ] **Step 4: Run to verify it passes**

Run: `node --test tests/growth.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add features/spiritual-growth/keys.js tests/growth.test.js
git commit -m "feat: add 7-stage paradise keys SVG scene"
```

---

### Task 13: Ramadan Tracker SVG scene (7 stages)

**Files:**
- Modify: `features/spiritual-growth/ramadan.js:12` (`ramadanSVG`)
- Test: `tests/growth.test.js`

**Interfaces:**
- Consumes: `stage`.
- Produces: `ramadanSVG(stage)` returns a non-empty `<svg class="spiritual-svg">` string (crescent → full moon phases).

- [ ] **Step 1: Add the failing test**

Append to `tests/growth.test.js`:

```js
test('renderRamadan renders a real SVG scene', () => {
  const { sandbox, el } = loadSpiritual(feature('ramadan'));
  sandbox.window.renderRamadan();
  assert.ok(el.innerHTML.includes('<svg'), 'ramadan SVG missing');
  assert.ok(el.innerHTML.includes('Stage 3/7'), 'stage badge missing');
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `node --test tests/growth.test.js`
Expected: FAIL — `ramadanSVG` returns `''`.

- [ ] **Step 3: Implement**

In `features/spiritual-growth/ramadan.js`, replace the stub (line 12) with:

```js
  function ramadanSVG(stage) {
    const r = 26 + (stage - 1) * 2;
    let h = `<rect width="120" height="132" fill="var(--card-bg)" rx="10"/>`;
    h += `<circle cx="60" cy="62" r="${r}" fill="var(--gold)" opacity="0.9"/>`;
    if (stage <= 4) {
      const off = stage === 1 ? 18 : stage === 2 ? 12 : stage === 3 ? 7 : 3;
      h += `<circle cx="${60 + off}" cy="62" r="${r - 2}" fill="var(--card-bg)"/>`;
    }
    if (stage >= 6) {
      h += `<circle cx="30" cy="100" r="4" fill="var(--gold)" opacity="0.8"/>`;
      h += `<circle cx="90" cy="94" r="3" fill="var(--gold)" opacity="0.8"/>`;
      h += `<rect x="26" y="104" width="8" height="8" fill="var(--gold)" opacity="0.7"/>`;
    }
    if (stage === 7) {
      h += `<circle cx="60" cy="62" r="${r + 12}" fill="none" stroke="var(--gold)" stroke-width="2" opacity="0.4"/>`;
      h += `<path d="M86 18 a9 9 0 1 0 2 11 a11 11 0 1 1 -2 -11 Z" fill="var(--gold)"/>`;
    }
    return `<svg class="spiritual-svg" viewBox="0 0 120 132">${h}</svg>`;
  }
```

- [ ] **Step 4: Run to verify it passes**

Run: `node --test tests/growth.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add features/spiritual-growth/ramadan.js tests/growth.test.js
git commit -m "feat: add 7-stage ramadan tracker SVG scene"
```

---

### Task 14: Laylat al-Qadr SVG scene (7 stages)

**Files:**
- Modify: `features/spiritual-growth/laylat.js:15` (`laylatSVG`)
- Test: `tests/growth.test.js`

**Interfaces:**
- Consumes: `stage`, existing `STAR_COUNTS [1,3,5,8,12,20,35]`.
- Produces: `laylatSVG(stage)` returns a non-empty `<svg class="spiritual-svg">` string (deterministic star layout so renders are stable).

- [ ] **Step 1: Add the failing test**

Append to `tests/growth.test.js`:

```js
test('renderLaylat renders a real SVG scene', () => {
  const { sandbox, el } = loadSpiritual(feature('laylat'));
  sandbox.window.renderLaylat();
  assert.ok(el.innerHTML.includes('<svg'), 'laylat SVG missing');
  assert.ok(el.innerHTML.includes('Stage 3/7'), 'stage badge missing');
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `node --test tests/growth.test.js`
Expected: FAIL — `laylatSVG` returns `''`.

- [ ] **Step 3: Implement**

In `features/spiritual-growth/laylat.js`, replace the stub (line 15) with:

```js
  function laylatSVG(stage) {
    const count = STAR_COUNTS[Math.min(stage, 7) - 1];
    let h = `<rect width="120" height="132" fill="#0B1114" rx="10"/>`;
    h += `<ellipse cx="60" cy="40" rx="${(30 + stage * 5)}" ry="${(12 + stage * 2)}" fill="var(--gold)" opacity="${(0.05 + stage * 0.04).toFixed(2)}"/>`;
    let seed = 7;
    function rnd() {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    }
    for (let i = 0; i < count; i++) {
      const x = 10 + rnd() * 100;
      const y = 16 + rnd() * 100;
      h += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${stage >= 6 ? 2.4 : 1.6}" fill="var(--gold)" opacity="${(0.5 + rnd() * 0.5).toFixed(2)}"/>`;
    }
    const cr = 10 + stage * 1.4;
    h += `<path d="M80 ${(58 - cr).toFixed(1)} a${cr.toFixed(1)} ${cr.toFixed(1)} 0 1 0 0 ${(cr * 2).toFixed(1)} a${(cr - 3).toFixed(1)} ${(cr - 3).toFixed(1)} 0 1 1 0 ${(-(cr * 2)).toFixed(1)} Z" fill="var(--gold)"/>`;
    return `<svg class="spiritual-svg" viewBox="0 0 120 132">${h}</svg>`;
  }
```

- [ ] **Step 4: Run to verify it passes**

Run: `node --test tests/growth.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add features/spiritual-growth/laylat.js tests/growth.test.js
git commit -m "feat: add 7-stage laylat al-qadr SVG scene"
```

---

### Task 15: Alignment pass for spiritual + growth cards and full-panel audit

**Files:**
- Modify: `styles/main.css` (`.spiritual-card`, `.garden-card`, `.growth-tab-grid`, `.garden-tree`)

**Interfaces:**
- Consumes: the 9 rendered cards (all now produce `.spiritual-card` / `.garden-card` markup with `.spiritual-svg` / `.garden-svg`).
- Produces: equal-height cards, aligned SVG wraps, consistent gutters.

- [ ] **Step 1: Add the failing test**

Append to `tests/html.test.js`:

```js
test('spiritual and garden cards get aligned grid sizing', () => {
  assert.ok(css.includes('.garden-tree svg'), 'garden SVG needs explicit sizing');
  assert.ok(css.includes('min-width: 0') || css.includes('min-width:0'), 'spiritual-info needs min-width guard');
  assert.ok(css.includes('align-items: stretch') && css.includes('.growth-tab-grid'), 'growth grid needs stretch alignment');
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `node --test tests/html.test.js`
Expected: FAIL — `.garden-tree svg` sizing and stretch alignment missing.

- [ ] **Step 3: Implement**

In `styles/main.css`:

1. Near `.garden-tree` (line 1382), add explicit SVG sizing so the tree box is stable:

```css
.garden-tree svg { width: 120px; height: 132px; display: block; }
```

2. Near `.spiritual-info` (line 1727), add a min-width guard so long titles don't overflow:

```css
.spiritual-info { min-width: 0; }
```

3. On `.growth-tab-grid` (line 1786), add stretch alignment so all 9 cards match height:

```css
.growth-tab-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 14px; align-items: stretch; }
```

4. Audit pass — for each panel container group below, open the app in the browser (light + dark, then resize to ≤600px and ≤400px), and fix any gutter/height/overflow inconsistency with `flex: 1 1` + `min-width: 0` (grids) or `align-items: stretch` (flex rows). Fix each container in-place; if a container is already aligned, change nothing. Container groups to audit:
   - tier1 tabs (`.tier1-tabs`, `.t1-btn`), tier2/3 tab bars (`.t2-btn`, `.t3-btn`)
   - bonus/well/prayer/deed rows (`.card-grid .card-item`, `.vol-card`, `.deed-card`)
   - quest + achievements rows, shop cards, journey cards
   - stats/progress/chart panels (`.stat-card`, `.insight-chart-wrap`)
   - profile cards, growth tab + settings, modals, toasts, footer

- [ ] **Step 4: Run to verify it passes**

Run: `node --test tests/html.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add styles/main.css tests/html.test.js
git commit -m "style: align spiritual and growth cards and audit panels"
```

---

### Task 16: Full suite regression + final check

**Files:**
- Test: all `tests/*.test.js`

**Interfaces:**
- Consumes: everything from Tasks 1-15.

- [ ] **Step 1: Run the full test suite**

Run: `node --test tests/html.test.js tests/sw.test.js tests/manifest.test.js tests/journeys.test.js tests/muhasabah.test.js tests/icons.test.js tests/growth.test.js`
Expected: PASS — baseline 47 tests + new growth tests all green.

- [ ] **Step 2: Manual smoke check (browser)**

Open `index.html` in a browser. Verify:
- Growth tab (`panel-growth`) shows all 9 feature cards, each with a visible SVG scene and `Stage n/7` label; no raw key text like `sprout`; no `?` in labels.
- Toggling a prayer/quest advances XP → scenes change stage and progress bars move.
- Profile group shows keys + mosque cards populated.
- Ramadan and Laylat panels render their scenes.
- No console errors in the Growth/Profile/Ramadan/Laylat flows (the pre-existing `window.renderTip` ReferenceError in `renderTab('home')` is handled by the separate hero-header spec — note it here but do not fix it in this plan).
- Light and dark themes both look right (SVG colors via theme vars).

- [ ] **Step 3: Final commit (if any manual fixes made)**

```bash
git add -A
git commit -m "fix: final polish from manual smoke check"
```

---

## Self-Review

- **Spec coverage:** Task 1 (FEATURE_ICONS + heart stages) → spec §1 + §2; Task 2 (iqIcon wiring + mojibake) → spec §2; Tasks 4-5 (armor/heart restore) → spec §3; Task 6 (areas/scripts) → spec §4; Task 7 (renderer wiring) → spec §5 + §6; Tasks 8-14 (nine SVG scenes) → spec §3; Task 15 (alignment) → spec §7; Task 16 (verification) → spec Verification. All spec sections covered.
- **Placeholder scan:** every SVG scene has full concrete code; no "TBD"/"add appropriate X". Each task has explicit failing→passing test steps.
- **Type/naming consistency:** `renderHeartRefinement` is used in Task 5 (definition), Task 7 (wiring + test), and render.js/actions.js consistently. `window.renderArmor`, `renderKeys`, `renderMosque`, `renderRamadan`, `renderLaylat` consistent across Tasks 4/7. The `drawKey` signature extension (5th param `color`) is introduced in Task 12 and used only there. `.spiritual-svg` class consistent across all scenes; `.garden-svg` only in garden.
- **Load-order check:** `data/icons.js` (index.html:288) precedes `spiritual-growth/data.js` (:390), so Task 1's top-level `iqIcon()` calls are safe. Task 6 adds script tags after `index.js`, and Task 7's renderers are referenced defensively via `window.renderX && window.renderX()`, so load order cannot throw.
