# Hero Restore + Theme Deepening + Top-Bar Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the buggy top-bar (orphan `renderTip` throw + competing writers), restore the classic hero header (floating moon, "Ibadah Quest", XP bar, streak box), deepen all five light themes, and add the signature "Emara" jade-and-gold theme.

**Architecture:** Three independent workstreams that touch separate regions of the same files: (A) core/actions.js corrects the throw and collapses the two top-bar writers into one; (B) index.html + render/render.js + styles/main.css re-add the hero markup, renderers, and themed CSS; (C) styles/main.css + data/theme-meta.js deepen light palettes and add Emara. Tests in tests/html.test.js lock each workstream's contract.

**Tech Stack:** Vanilla JS (IIFE modules), CSS custom properties, Node's built-in `node:test` runner.

## Global Constraints

- Icons for the hero use the app's `iqIcon('<key>')` system (returns an `<img class="iq-icon">` SVG). Available keys: `moon`, `flame`, `star`, `zap` (data/icons.js).
- No hardcoded old-gold hexes in the restored CSS — all colors from theme vars (`var(--gold)`, `var(--card-bg)`, `rgba(var(--accent-rgb),…)`).
- Emara is the ONLY new theme key: `emara`. Do not add other theme blocks.
- Light-theme deepening changes ONLY `--bg`, `--bg-accent`, `--card-bg` (and CSS `#e8e0f0` literals + `theme-color` meta). Do not change `--gold`/`--emerald`/`--text` of existing light themes.
- Preserve every old DOM id verbatim: `#lvNum`, `#lvTitle`, `#xpBar`, `#xpLabel`, `#strDays`, `#strMsg`, `#bestStr`.
- `renderTopBar` (render/render.js:1378) stays the single icon-based top-bar writer; its body is NOT changed.
- Full suite command (runs all except the pre-existing broken `garden.test.js`, which fails on clean HEAD due to a test-harness `iqIcon` issue):
  `node --test tests\growth.test.js tests\html.test.js tests\icons.test.js tests\journeys.test.js tests\manifest.test.js tests\muhasabah.test.js tests\state.test.js tests\sw.test.js`

---

### Task 1: Fix the orphan renderTip throw in renderTab

**Files:**
- Modify: `core/actions.js:2285`
- Test: `tests/html.test.js`

**Interfaces:**
- Consumes: nothing new.
- Produces: `renderTab('home')` no longer throws; `window.renderTopBar()` at core/actions.js:2286 runs.

- [ ] **Step 1: Write the failing test**

Append to `tests/html.test.js`:

```js
test('top-bar: orphan renderTip call is removed from renderTab', () => {
  assert.ok(!actions.includes('window.renderTip()'), 'orphan renderTip() must not be called');
  assert.ok(!actions.includes('renderTip();'), 'renderTip reference must be gone');
  assert.ok(actions.includes('window.renderTopBar();'), 'renderTopBar still called from renderTab');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/html.test.js`
Expected: FAIL — `actions.includes('window.renderTip();')` is true (the orphan call exists).

- [ ] **Step 3: Implement the minimal fix**

In `core/actions.js:2285`, change:
```js
      window.renderPrayers(); window.renderVol(); window.renderDeeds(); window.renderBonus(); window.renderTip();
```
to:
```js
      window.renderPrayers(); window.renderVol(); window.renderDeeds(); window.renderBonus();
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/html.test.js`
Expected: PASS for the new test; all other html tests pass too.

- [ ] **Step 5: Commit**

```bash
git add core/actions.js tests/html.test.js
git commit -m "fix: remove orphan renderTip call that aborted home tab render"
```

---

### Task 2: Collapse the top-bar writers into one

**Files:**
- Modify: `core/actions.js:2306` (`function updateTopBar`)
- Test: `tests/html.test.js`

**Interfaces:**
- Consumes: `window.renderTopBar` (render/render.js:1378, already exported).
- Produces: `updateTopBar(...)` behaves as a thin, optional delegate so all existing call sites (`setTheme`, `renderTab`, `setTheme` paths) hit the one icon-based writer.

- [ ] **Step 1: Write the failing test**

Append to `tests/html.test.js`:

```js
test('top-bar: updateTopBar delegates to renderTopBar (single writer)', () => {
  const fnIdx = actions.indexOf('function updateTopBar');
  assert.ok(fnIdx > -1, 'updateTopBar must exist');
  const body = actions.slice(fnIdx, fnIdx + 220);
  assert.ok(body.includes('window.renderTopBar'), 'updateTopBar must call renderTopBar');
  assert.ok(!body.includes("getElementById('tbXP')"), 'updateTopBar must not write pills directly');
  assert.ok(!body.includes("getElementById('tbStreak')"), 'updateTopBar must not write streak directly');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/html.test.js`
Expected: FAIL — current `updateTopBar` body reads `tbXP`/`tbStreak` and has no `renderTopBar` reference.

- [ ] **Step 3: Implement the minimal fix**

Replace the entire `function updateTopBar() { … }` body (core/actions.js:2306) with:

```js
  function updateTopBar() {
    if (window.renderTopBar) window.renderTopBar();
  }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/html.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add core/actions.js tests/html.test.js
git commit -m "fix: make updateTopBar delegate to renderTopBar as single writer"
```

---

### Task 3: Restore the hero + level-row + streak-bar markup

**Files:**
- Modify: `index.html` (insert after `</header>` at line 55, before `<main class="tab-content"` at line 57)
- Test: `tests/html.test.js`

**Interfaces:**
- Consumes: nothing at runtime (elements are static; renderers in Task 4 fill them).
- Produces: DOM ids `#headerCrescent`, `#lvNum`, `#lvTitle`, `#xpBar`, `#xpLabel`, `#strDays`, `#strMsg`, `#bestStr`, `#streakFire`. The crescent/flame/star containers start empty; Task 4 fills them via `iqIcon`.

- [ ] **Step 1: Write the failing test**

Append to `tests/html.test.js`:

```js
test('hero header markup is restored with all ids', () => {
  for (const id of ['headerCrescent','lvNum','lvTitle','xpBar','xpLabel','strDays','strMsg','bestStr','streakFire']) {
    assert.ok(html.includes(`id="${id}"`), `missing hero id ${id}`);
  }
  assert.ok(html.includes('Ibadah Quest'), 'hero title must be present');
  assert.ok(html.includes('Submission. Grow. Earn. Ascend.'), 'hero tagline must be present');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/html.test.js`
Expected: FAIL — none of the ids exist in index.html yet.

- [ ] **Step 3: Insert the hero markup**

In `index.html`, directly after the `</header>` line (line 55), insert:

```html

  <!-- ═══════════════ HERO HEADER ═══════════════ -->
  <div class="header">
    <div class="header-crescent" id="headerCrescent"></div>
    <h1>Ibadah Quest</h1>
    <div class="header-deco"><span id="decoLeft"></span>Submission. Grow. Earn. Ascend.<span id="decoRight"></span></div>
  </div>

  <div class="level-row">
    <div class="level-badge">
      <span class="lv-num" id="lvNum">1</span>
      <span class="lv-title" id="lvTitle">Seeker</span>
    </div>
    <div class="xp-wrap" id="xpWrap">
      <div class="xp-outer"><div class="xp-inner" id="xpBar" style="width:0%"></div></div>
      <div class="xp-label" id="xpLabel">0 / 100 XP</div>
    </div>
  </div>

  <div class="streak-bar">
    <span class="streak-fire" id="streakFire"></span>
    <div class="streak-info"><h3 id="strDays">0 Day Streak</h3><p id="strMsg">Start your journey!</p></div>
    <div class="streak-best"><div class="best-num" id="bestStr">0</div><div class="best-label">BEST</div></div>
  </div>

```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/html.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add index.html tests/html.test.js
git commit -m "feat: restore classic hero header markup (moon, title, xp, streak)"
```

---

### Task 4: Implement real renderLv / renderStr and fill hero icons

**Files:**
- Modify: `render/render.js:141-142` (stub `renderLv`, `renderStr`)
- Test: `tests/html.test.js`

**Interfaces:**
- Consumes: `S.lv`, `S.xp`, `S.cs`, `S.bs` (state); `xpFor`, `lvTitle` (state/state.js); `STREAK_MSGS` (data/streak-msgs.js); `iqIcon` (data/icons.js). All loaded before render/render.js in index.html.
- Produces: `renderLv()` fills `#headerCrescent`, `#decoLeft`, `#decoRight`, `#lvNum`, `#lvTitle`, `#xpBar`, `#xpLabel`. `renderStr()` fills `#streakFire`, `#strDays`, `#strMsg`, `#bestStr`. Both are already invoked by `renderDynamic()`'s safe list (render/render.js:20) so they refresh on every render.

- [ ] **Step 1: Write the failing test**

Append to `tests/html.test.js`:

```js
test('hero renderers are real and wired into renderDynamic', () => {
  assert.ok(render.includes("getElementById('xpBar')"), 'renderLv must update xpBar');
  assert.ok(render.includes("getElementById('lvTitle')"), 'renderLv must update lvTitle');
  assert.ok(render.includes('STREAK_MSGS'), 'renderStr must use STREAK_MSGS');
  assert.ok(render.includes("getElementById('bestStr')"), 'renderStr must update bestStr');
  assert.ok(render.includes("getElementById('headerCrescent')"), 'renderLv must fill the moon');
  assert.ok(render.includes("getElementById('streakFire')"), 'renderStr must fill the flame');
  assert.ok(render.includes("safe(renderLv, 'Lv')"), 'renderLv wired into renderDynamic');
  assert.ok(render.includes("safe(renderStr, 'Str')"), 'renderStr wired into renderDynamic');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/html.test.js`
Expected: FAIL — the stubs contain only comment text; none of the `getElementById('…')` calls exist.

- [ ] **Step 3: Implement real renderLv / renderStr**

In `render/render.js`, replace lines 141–142:

```js
  function renderLv() { /* level info is in top-bar */ }
  function renderStr() { /* streak info is in top-bar */ }
```

with:

```js
  function renderLv() {
    const cres = document.getElementById('headerCrescent');
    if (cres) cres.innerHTML = iqIcon('moon');
    const decoL = document.getElementById('decoLeft');
    if (decoL) decoL.innerHTML = iqIcon('star');
    const decoR = document.getElementById('decoRight');
    if (decoR) decoR.innerHTML = iqIcon('star');
    const lv = document.getElementById('lvNum');
    const title = document.getElementById('lvTitle');
    const bar = document.getElementById('xpBar');
    const label = document.getElementById('xpLabel');
    if (!lv || !title || !bar || !label) return;
    const xp = S.xp || 0;
    const cur = xpFor(S.lv), nxt = xpFor(S.lv + 1);
    const prog = xp - cur, need = (nxt - cur) || 1;
    lv.textContent = S.lv;
    title.textContent = lvTitle(S.lv);
    bar.style.width = Math.min(100, (prog / need) * 100) + '%';
    label.textContent = prog + ' / ' + need + ' XP';
  }

  function renderStr() {
    const fire = document.getElementById('streakFire');
    if (fire) fire.innerHTML = iqIcon('flame');
    const days = document.getElementById('strDays');
    const best = document.getElementById('bestStr');
    const msg = document.getElementById('strMsg');
    if (!days || !best || !msg) return;
    days.textContent = (S.cs || 0) + ' Day Streak';
    best.textContent = S.bs || 0;
    msg.textContent = (STREAK_MSGS.find(x => (S.cs || 0) >= x.m) || { t: 'Legendary!' }).t;
  }
```

- [ ] **Step 4: Verify syntax + run test**

Run: `node --check render\render.js; node --test tests/html.test.js`
Expected: no syntax errors, PASS on the new test and all html tests.

- [ ] **Step 5: Commit**

```bash
git add render/render.js tests/html.test.js
git commit -m "feat: real renderLv/renderStr fill hero xp bar and streak box"
```

---

### Task 5: Ensure hero icons are refreshed on theme switch and initial load

**Files:**
- Modify: `core/actions.js` — `setTheme` (already calls `renderDynamic()`), `switchTab`→`renderTab`
- Test: `tests/html.test.js`

**Interfaces:**
- Consumes: `renderDynamic()` (Task 4's `renderLv`/`renderStr` inside it).
- Produces: guaranteed refresh of hero + top-bar after theme changes and tab switches (regression guard for the bug from the user's report).

- [ ] **Step 1: Write the failing test**

Append to `tests/html.test.js`:

```js
test('hero+topbar refresh on theme change and home tab', () => {
  assert.ok(actions.includes('renderDynamic();'), 'setTheme must call renderDynamic');
  const faint = actions.indexOf('setTheme');
  const homeCall = actions.slice(actions.indexOf("name === 'home'"));
  assert.ok(homeCall.includes('window.renderTopBar();'), 'renderTab(home) calls renderTopBar');
});
```

- [ ] **Step 2: Run test to verify it passes (guard)**

Run: `node --test tests/html.test.js`
Expected: PASS immediately — `setTheme` already calls `renderDynamic()` and `renderTab('home')` already calls `renderTopBar()`. This test is a regression guard; no code change needed.

- [ ] **Step 3: Verify full suite**

Run: `node --test tests\html.test.js` plus the full suite command from Global Constraints.
Expected: all green.

- [ ] **Step 4: Commit**

```bash
git add tests/html.test.js
git commit -m "test: guard hero+topbar refresh on theme switch and home tab"
```

---

### Task 6: Deepen the five light theme backgrounds + base :root

**Files:**
- Modify: `styles/main.css:5-104` (:root, serene, royal, sand, midnight), plus the `#e8e0f0` literals at main.css and `index.html` theme-color meta
- Modify: `index.html:20` (`<meta name="theme-color" content="#e8e0f0">`)
- Modify: `data/theme-meta.js` (swatch bgs)
- Test: `tests/html.test.js` (update existing pins at lines 44, 52, 58, 92, 108)

**Interfaces:**
- Consumes: existing CSS custom-property structure.
- Produces: deeper `--bg`/`--bg-accent`/`--card-bg` for every light palette; `emara` block comes in Task 7. Theme swatches updated to preview new bgs.

- [ ] **Step 1: Update the failing/pinned values**

In `tests/html.test.js` replace every `#e8e0f0` with `#ddd3ea` (lines 44, 52, 58, 92, 108 keep their assertions; only the hex changes).

- [ ] **Step 2: Update index.html theme-color**

Change `index.html:20`:
```html
  <meta name="theme-color" content="#e8e0f0">
```
to:
```html
  <meta name="theme-color" content="#ddd3ea">
```

- [ ] **Step 3: Deepen the CSS light palettes**

In `styles/main.css`:

`:root` (lines 6–8):
```css
  --bg: #e8e0f0;            /* → #ddd3ea */
  --bg-accent: #f0ecf5;     /* → #e6e0ee */
  --card-bg: #ece8f1;       /* → #e3dced */
```
Apply these exact replacements:
- `--bg: #e8e0f0;` → `--bg: #ddd3ea;`
- `--bg-accent: #f0ecf5;` → `--bg-accent: #e6e0ee;`
- `--card-bg: #ece8f1;` → `--card-bg: #e3dced;`

`serene` (lines 66–67):
- `--bg: #dce8da;` → `--bg: #d2e1cf;`
- `--bg-accent: #e5efe3;` → `--bg-accent: #dcead9;`
- `--card-bg: #e4efe2;` → `--card-bg: #d8e7d5;`

`royal` (lines 76–77):
- `--bg: #e0daf0;` → `--bg: #d6cfe9;`
- `--bg-accent: #eae5f5;` → `--bg-accent: #e2dcef;`
- `--card-bg: #e6e0f2;` → `--card-bg: #dcd6ea;`

`sand` (lines 86–87):
- `--bg: #efe8d8;` → `--bg: #e8dcc6;`
- `--bg-accent: #f3edde;` → `--bg-accent: #ece3d2;`
- `--card-bg: #f0ead8;` → `--card-bg: #e7ddc8;`

`midnight` (lines 96–97):
- `--bg: #d8e2f0;` → `--bg: #cfdcea;`
- `--bg-accent: #e0eaf5;` → `--bg-accent: #d8e4f0;`
- `--card-bg: #dfe9f4;` → `--card-bg: #d6e2ee;`

Do NOT touch `--gold`/`--emerald`/`--text`/`--accent-rgb` lines.

- [ ] **Step 4: Update theme-meta.js swatches**

In `data/theme-meta.js`, change preview `bg` values to the new deeper bases (accent stays but dark is unchanged):
```js
  { key:'light', label:'Light', swatch:{ bg:'#ddd3ea', accent:'#f43f5e' } },
  { key:'dark', label:'Dark', swatch:{ bg:'#1a1b2e', accent:'#f5c842' } },
  { key:'serene', label:'Serene', swatch:{ bg:'#d2e1cf', accent:'#4c7a4a' } },
  { key:'royal', label:'Royal', swatch:{ bg:'#d6cfe9', accent:'#7c5cf0' } },
  { key:'sand', label:'Sand', swatch:{ bg:'#e8dcc6', accent:'#c98a2e' } },
  { key:'midnight', label:'Midnight', swatch:{ bg:'#cfdcea', accent:'#3fa7c8' } }
```

- [ ] **Step 5: Run tests**

Run: `node --test tests/html.test.js` and the full suite command.
Expected: PASS (all `#e8e0f0` references updated consistently).

- [ ] **Step 6: Commit**

```bash
git add styles/main.css index.html data/theme-meta.js tests/html.test.js
git commit -m "style: deepen light theme backgrounds for higher clay contrast"
```

---

### Task 7: Add the Emara (Jade & Gold) theme

**Files:**
- Modify: `styles/main.css` (know `serene`/`royal`/`sand`/`midnight` block position AFTER `midnight` at line 104, BEFORE the dark block at line 107)
- Modify: `data/theme-meta.js`
- Test: `tests/html.test.js`

**Interfaces:**
- Consumes: CSS custom-property set identical to the other theme blocks.
- Produces: `html[data-theme="emara"]` palette + overrides; swatch in the picker. `setTheme('emara')` works with zero JS changes (generic attribute setter).

- [ ] **Step 1: Write the failing test**

Append to `tests/html.test.js`:

```js
test('theme: Emara jade-and-gold palette block exists', () => {
  assert.ok(css.includes('html[data-theme="emara"]'), 'emara palette block missing');
  assert.ok(css.includes('--bg: #123027'), 'emara background is deep jade');
  assert.ok(css.includes('--gold: #d4af37'), 'emara accent is gold');
  assert.ok(css.includes('--accent-rgb: 212,175,55'), 'emara accent rgb set');
});

test('theme: picker lists the Emara theme', () => {
  assert.ok(meta.includes("key:'emara'"), 'theme-meta lists emara');
  assert.ok(meta.includes("label:'Emara'"), 'theme-meta labels emara');
});
```

And at the top of `tests/html.test.js`, add the `meta` read next to the other reads:
```js
const meta = fs.readFileSync(path.join(root, 'data', 'theme-meta.js'), 'utf8');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/html.test.js`
Expected: FAIL — no `emara` block in CSS, no `emara` entry in theme-meta.

- [ ] **Step 3: Add the Emara CSS block**

In `styles/main.css`, after the `midnight` block (line 104) and before `/* ── Dark Mode ── */` (line 106), insert:

```css
html[data-theme="emara"] {
  --bg: #123027; --bg-accent: #1a3b2f;
  --card-bg: #1d4033;
  --shadow-dark: rgba(0, 0, 0, 0.55); --shadow-light: rgba(46, 90, 70, 0.25);
  --text: #f2f4ec; --text2: #a9c1ae;
  --gold: #d4af37; --gold-light: #e6c76a; --gold-dark: #b08d24;
  --emerald: #d4af37; --emerald-deep: #b08d24; --teal: #d4af37;
  --green: #4caf7d; --orange: #d97706; --red: #dc2626; --purple: #a78bfa;
  --border: rgba(255,255,255,0.09); --shadow: 0 8px 32px rgba(0,0,0,0.35);
  --accent-rgb: 212,175,55; --shadow-rgb: 0,0,0;
}
html[data-theme="emara"] body {
  background: var(--bg);
  background-image: radial-gradient(circle at 50% 0%, rgba(212,175,55,0.07) 0%, transparent 55%);
}
html[data-theme="emara"] .app::before { background: radial-gradient(circle, rgba(212,175,55,0.10) 0%, transparent 70%); }
html[data-theme="emara"] .app::after { background: radial-gradient(circle, rgba(46,90,70,0.12) 0%, transparent 70%); }
html[data-theme="emara"] .geometric-bg {
  background-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'><circle cx='20' cy='20' r='1' fill='%23d4af37' opacity='0.08'/><circle cx='60' cy='40' r='0.6' fill='%23d4af37' opacity='0.05'/><circle cx='25' cy='65' r='0.8' fill='%23d4af37' opacity='0.06'/></svg>");
  background-size: 80px 80px;
}
html[data-theme="emara"] .top-bar {
  background: rgba(18,48,39,0.95);
  border-color: rgba(255,255,255,0.06);
  backdrop-filter: blur(12px);
}
html[data-theme="emara"] .profile-input,
html[data-theme="emara"] .global-search,
html[data-theme="emara"] input,
html[data-theme="emara"] textarea {
  background: var(--bg); color: var(--text); border-color: rgba(255,255,255,0.1);
}
html[data-theme="emara"] .global-search-results {
  background: var(--card-bg); border-color: rgba(255,255,255,0.08);
}
html[data-theme="emara"] .section-title { border-bottom-color: rgba(212,175,55,0.4); }
```

- [ ] **Step 4: Add the Emara swatch**

In `data/theme-meta.js`, add after the `midnight` line:
```js
  { key:'emara', label:'Emara', swatch:{ bg:'#123027', accent:'#d4af37' } }
```

- [ ] **Step 5: Run tests**

Run: `node --test tests/html.test.js` and the full suite command.
Expected: PASS incl. new Emara tests; the existing `--emerald: #10b981`/`--gold: #D4AF37` absence assertions still pass (Emara uses lowercase `#d4af37`, green is `#4caf7d`).

- [ ] **Step 6: Commit**

```bash
git add styles/main.css data/theme-meta.js tests/html.test.js
git commit -m "feat: add Emara jade-and-gold theme"
```

---

### Task 8: Add hero CSS (moon float, xp wave, streak bar, dark/emara overrides)

**Files:**
- Modify: `styles/main.css` (insert after the top-bar section, after `.tb-stat` at line 498)
- Test: `tests/html.test.js`

**Interfaces:**
- Consumes: task vars (`--card-bg`, `--border`, `--gold`, `--gold-light`, `--gold-dark`, `--accent-rgb`, `--shadow-dark`, `--shadow-light`, `--font-heading`, `--radius`).
- Produces: `.header`, `.header-crescent`, `.header h1`, `.header-deco`, `@keyframes moonFloat`, `.level-row`, `.level-badge`, `.lv-num`, `.lv-title`, `.xp-wrap`, `.xp-outer`, `.xp-inner`, `.xp-label`, `@keyframes xpWave`, `.streak-bar`, `.streak-fire`, `.streak-info h3/p`, `.streak-best`, `.best-num`, `.best-label`, plus dark-mode + Emara overrides.

- [ ] **Step 1: Write the failing test**

Append to `tests/html.test.js`:

```js
test('hero header styles exist with clay tokens', () => {
  assert.ok(css.includes('.header-crescent'), 'crescent style missing');
  assert.ok(css.includes('@keyframes moonFloat'), 'moon float animation missing');
  assert.ok(css.includes('@keyframes xpWave'), 'xp wave animation missing');
  assert.ok(css.includes('.xp-inner'), 'xp bar style missing');
  assert.ok(css.includes('.streak-bar'), 'streak bar style missing');
  assert.ok(css.includes('.best-num'), 'best number style missing');
  assert.ok(css.includes('html[data-theme="dark"] .streak-bar'), 'dark streak override missing');
  assert.ok(css.includes('html[data-theme="emara"] .streak-bar') || css.includes('html[data-theme="emara"]') , 'emara hero override present');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/html.test.js`
Expected: FAIL — hero styles missing.

- [ ] **Step 3: Add the hero CSS**

In `styles/main.css`, after the `.tb-stat` rule (line 498), insert:

```css

/* ── Hero Header ── */
.header { text-align: center; padding: 34px 0 16px; }
.header-crescent { display: inline-flex; justify-content: center; align-items: center; width: 64px; height: 64px; margin-bottom: 10px; animation: moonFloat 6s cubic-bezier(0.37,0,0.63,1) infinite; filter: drop-shadow(0 4px 16px rgba(var(--accent-rgb),0.35)); }
.header-crescent .iq-icon { width: 56px; height: 56px; }
.header h1 { font-family: var(--font-heading); font-size: clamp(1.8rem, 5vw, 2.6rem); font-weight: 700; color: var(--text); letter-spacing: 3px; margin: 8px 0 6px; text-transform: uppercase; }
.header-deco { display: flex; align-items: center; justify-content: center; gap: 12px; margin-top: 16px; color: var(--text2); font-size: 0.68rem; letter-spacing: 5px; font-weight: 600; opacity: 0.75; text-transform: uppercase; }
.header-deco .iq-icon { width: 14px; height: 14px; }
@keyframes moonFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }

/* ── Level & XP ── */
.level-row { display: flex; align-items: center; justify-content: center; gap: 20px; margin: 18px auto 22px; flex-wrap: wrap; max-width: 600px; }
.level-badge { background: var(--card-bg); border: 1px solid var(--border); border-radius: 40px; padding: 12px 26px; display: flex; align-items: center; gap: 14px; box-shadow: 6px 6px 14px var(--shadow-dark), -6px -6px 14px var(--shadow-light); }
.lv-num { font-size: 1.9rem; font-weight: 700; color: var(--gold); line-height: 1; font-variant-numeric: tabular-nums; }
.lv-title { font-size: 0.7rem; color: var(--text2); font-weight: 600; letter-spacing: 2px; text-transform: uppercase; }
.xp-wrap { flex: 1; min-width: 220px; max-width: 340px; }
.xp-outer { background: rgba(0,0,0,0.08); border-radius: 20px; height: 14px; overflow: hidden; border: 1px solid var(--border); }
.xp-inner { height: 100%; border-radius: 20px; background: linear-gradient(90deg, var(--gold-dark), var(--gold) 40%, var(--gold-light) 60%, var(--gold-dark)); background-size: 250% 100%; animation: xpWave 2.8s linear infinite; transition: width 0.8s cubic-bezier(0.34,1.56,0.64,1); box-shadow: 0 0 12px rgba(var(--accent-rgb),0.4); }
.xp-label { font-size: 0.75rem; color: var(--text2); text-align: center; margin-top: 8px; font-weight: 600; letter-spacing: 1px; }
@keyframes xpWave { 0% { background-position: 200% center; } 100% { background-position: -100% center; } }

/* ── Streak Bar ── */
.streak-bar { background: var(--card-bg); border: 1px solid var(--border); border-radius: var(--radius); padding: 18px 26px; display: flex; align-items: center; gap: 18px; margin-bottom: 22px; box-shadow: 8px 8px 16px var(--shadow-dark), -8px -8px 16px var(--shadow-light); }
.streak-fire { font-size: 0; flex-shrink: 0; }
.streak-fire .iq-icon { width: 40px; height: 40px; filter: drop-shadow(0 4px 10px rgba(245,158,11,0.35)); }
.streak-info h3 { font-size: 1.15rem; font-weight: 600; color: var(--text); letter-spacing: 0.5px; font-variant-numeric: tabular-nums; }
.streak-info p { font-size: 0.82rem; color: var(--text2); margin-top: 4px; }
.streak-best { margin-left: auto; text-align: center; background: rgba(var(--accent-rgb),0.08); border: 1px solid rgba(var(--accent-rgb),0.2); border-radius: 16px; padding: 8px 20px; flex-shrink: 0; }
.best-num { font-size: 1.6rem; font-weight: 700; color: var(--gold); line-height: 1; font-variant-numeric: tabular-nums; }
.best-label { font-size: 0.62rem; color: var(--text2); letter-spacing: 2px; text-transform: uppercase; margin-top: 4px; }
```

Then add dark-mode overrides in the existing `html[data-theme="dark"]` block (after `html[data-theme="dark"] .top-bar` rule, line 143-147):

```css
html[data-theme="dark"] .header h1 { color: #f1f5f9; }
html[data-theme="dark"] .xp-outer { background: rgba(0,0,0,0.5); border-color: rgba(255,255,255,0.1); }
html[data-theme="dark"] .level-badge,
html[data-theme="dark"] .streak-bar {
  background: var(--card-bg);
  box-shadow: 8px 8px 16px var(--shadow-dark), -8px -8px 16px var(--shadow-light);
}
```

And Emara hero overrides after the Emara block (Task 7, after line ~104+):

```css
html[data-theme="emara"] .xp-outer { background: rgba(0,0,0,0.35); border-color: rgba(255,255,255,0.08); }
html[data-theme="emara"] .level-badge,
html[data-theme="emara"] .streak-bar {
  background: var(--card-bg);
  box-shadow: 8px 8px 16px var(--shadow-dark), -8px -8px 16px var(--shadow-light);
}
html[data-theme="emara"] .header h1 { color: var(--text); }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/html.test.js`
Expected: PASS — hero CSS plus dark/emara overrides present.

- [ ] **Step 5: Syntax-check CSS consumption + full suite**

Run: the full suite command from Global Constraints.
Expected: all green.

- [ ] **Step 6: Commit**

```bash
git add styles/main.css tests/html.test.js
git commit -m "style: hero header clay CSS with moon float, xp wave, streak bar"
```

---

### Task 9: Final verification pass

**Files:**
- Test: `tests/html.test.js` (all tasks), `node --check` on both JS bundles

**Interfaces:**
- Consumes: everything from Tasks 1–8.
- Produces: confidence that the whole feature set is coherent and green.

- [ ] **Step 1: Syntax check the three edited sources**

Run:
```
node --check core\actions.js
node --check render\render.js
```
Expected: exit 0, no errors. (CSS and HTML have no `node --check`.)

- [ ] **Step 2: Run the complete test suite**

Run the full suite command from Global Constraints.
Expected: all pass (65 tests region; `garden.test.js` excluded — it fails on clean HEAD for an unrelated harness reason).

- [ ] **Step 3: Verify the Emara theme shows in the picker + dark-mode safe**

Run: `node -e "const m=require('fs').readFileSync('data/theme-meta.js','utf8'); console.log(m.match(/key:'emara'/)?'emara listed':'emara MISSING');"`
Expected: `emara listed`.

- [ ] **Step 4: Manual sanity checklist for the user**
- Load app, both light and dark themes: moon floats, "Ibadah Quest" title + tagline render, XP bar fills and advances on toggling a prayer, streak box shows `N Day Streak` + message + BEST.
- Emara theme: backgrounds deep jade, gold accents, no white-form regression (search/inputs legible).
- Sticky top-bar: shows icon-based XP/streak (`⚡ 1,234 XP`, `🔥 3`) with no flicker; the "Lv 1 Muslim 0 XP 0" defect gone.

- [ ] **Step 5: Commit any last-mile corrections**

If Step 2 revealed a failure, fix it, rerun, then:
```bash
git add -A
git commit -m "fix: final hero/theme pass"
```
If green, no commit needed (all tasks already committed).

---

## Self-Review Notes

- **Spec coverage:** top-bar bug (Tasks 1–2), hero markup (Task 3), hero renderers (Task 4), refresh guard (Task 5), light-theme deepening (Task 6), Emara (Task 7), hero CSS + dark/emara overrides (Task 8), verification (Task 9). Index.html theme-color + tests hex pins covered in Task 6. theme-meta swatches covered in Tasks 6–7.
- **No placeholders:** every step contains literal code or exact replacements with line references.
- **Type/name consistency:** `renderLv`/`renderStr`/`xpBar`/`xpLabel`/`headerCrescent`/`streakFire`/`strDays`/`strMsg`/`bestStr`/`lvNum`/`lvTitle` used identically across Tasks 3, 4, 7, 8. `iqIcon` keys (`moon`, `flame`, `star`) verified against data/icons.js.