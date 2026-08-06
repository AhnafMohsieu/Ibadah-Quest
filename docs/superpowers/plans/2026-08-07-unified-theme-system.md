# Unified Theme System — 5 Light Families + App Shell Redesign

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove 5 dark-theme variants, keep 5 light families, replace every hardcoded rose accent in the codebase with CSS custom properties, redesign the app shell with a bottom nav bar + gamified hero dashboard + Islamic geometric patterns, add animations and micro-interactions.

**Architecture:** Same vanilla JS + CSS custom properties + Chart.js + Tailwind CDN. No framework, no build step. The shell moves from a single scrolling column to a tabbed single-page layout where `renderTab(name)` dispatches to existing render functions per tab. All hardcoded rose hexes become `var(--gold)` / `var(--gold-light)` / `var(--gold-dark)` / `var(--emerald)` — each of the 5 light families remaps these, so picking a new theme recolors the entire app instantly. CSS transitions on `background`, `color`, `border-color` provide a 300ms crossfade on theme switch.

**Tech Stack:** Vanilla JS (IIFE modules), CSS custom properties, Chart.js (CDN), Tailwind CSS (CDN), Font Awesome (CDN), Node.js test runner (native)

## Global Constraints

- Published as a new branch from current `theme-modern-light-glass` HEAD.
- One commit per task (CLAUDE.md rule: never bundle multiple changes into a single commit).
- **TDD:** Write test first, verify it fails, then implement, verify it passes, commit.
- Run `node --test` from repo root. PowerShell only (`node --test`).
- No type of internal API besides `getComputedStyle(document.documentElement).getPropertyValue(name)`.
- Chrome Pill buggy on coal core? No, that was a different project.
- All colors through CSS custom properties — `var(--gold)`, `var(--gold-light)`, `var(--gold-dark)`, `var(--emerald)`, `var(--emerald-deep)`.
- No dark-themed `data-theme` blocks in the final CSS. Only the 5 light blocks remain.
- The intro overlay's hardcoded inline `style` attributes must be replaced with CSS classes that use `var(--gold)`.
- Index.html theme-color meta and pre-paint no-flash script stay in place and continue to work with saved theme name.
- `localStorage` key: `iqTheme` (string, one of the 5 light theme keys). Kept as before.
- Theme picker renders 5 chips in Profile settings.
- `render/render.js` page scroll preservation (for each tab) is optional; but tab content should replace innerHTML of `#tabContent` not the whole `#app`.
- All lustre modifications must be committed with correct commit message prefix: `feat:`, `style:`, `fix:`, `test:`, `docs:`.

---

### Task 1: Remove 5 dark-theme variants, keep 5 light families

**Files:**
- Modify: `styles/main.css` (remove `dark`, `serene-dark`, `royal-dark`, `sand-dark`, `midnight-dark` blocks)
- Modify: `data/theme-meta.js` (reduce to 5 entries)
- Modify: `tests/html.test.js` (update theme tests)

**Interfaces:**
- Consumes: current main.css structure (lines 32-59 dark, 69-117 dark variants), theme-meta.js (10 entries), html.test.js (5-family test expects dark)
- Produces: 5 theme-meta entries, CSS with only `:root` + `serene` + `royal` + `sand` + `midnight` blocks, updated test assertions

- [ ] **Step 1: Write updated tests**

In `tests/html.test.js`:

Delete tests that assert dark existence:
```js
// Remove these:
// test('dark theme: CSS maps the dark palette under the html[data-theme=dark] selector', () => {...});
// test('dark theme: index.html applies saved theme before first paint (no-flash)', () => {...});
```

Replace the `theme: five families have both light and dark blocks in main.css` test with one that asserts 5 light blocks only:
```js
test('theme: five light-family palette blocks exist in main.css', () => {
  for (const key of ['serene','royal','sand','midnight']) {
    assert.ok(css.includes(`html[data-theme="${key}"]`), `missing palette block for ${key}`);
  }
  assert.ok(css.includes('--bg: #faf7f5'));   // light (default) :root block present
  assert.ok(!css.includes('html[data-theme="dark"]'), 'dark palette block must be removed');
  assert.ok(!css.includes('html[data-theme="serene-dark"]'), 'serene-dark palette block must be removed');
});
```

Replace the no-flash test with one that still validates existence of applying a saved theme:
```js
test('theme: index.html pre-paint script sets data-theme from localStorage', () => {
  assert.ok(html.includes("localStorage.getItem('iqTheme')"));
  assert.ok(html.includes("setAttribute('data-theme'"));
  assert.ok(html.includes('styles/main.css?v=5'));
});
```

- [ ] **Step 2: Network test to verify it fails**

Run: `node --test`
Expected: FAIL — dark blocks removed but test still expects them.

- [ ] **Step 3: Remove dark CSS blocks from styles/main.css**

Delete the entire `html[data-theme="dark"]` block (lines ~32-59) including its `body` override and `.app::before/::after` opacity tweak. This extends from line 32 (`html[data-theme="dark"] {`) through line 59 (`html[data-theme="dark"] .app::after { opacity: 0.35; }`) — about 28 lines.

Delete the 5 `*-dark` blocks (serene-dark, royal-dark, sand-dark, midnight-dark). These are at approximately lines 69-75, 83-89, 97-103, 111-117.

The light family blocks (`serene`, `royal`, `sand`, `midnight`) **remain untouched**.

- [ ] **Step 4: Reduce theme-meta.js to 5 entries**

```js
window.Themes = [
  { key:'light', label:'Light', swatch:{ bg:'#faf7f5', accent:'#f43f5e' } },
  { key:'serene', label:'Serene', swatch:{ bg:'#f3f7f2', accent:'#4c7a4a' } },
  { key:'royal', label:'Royal', swatch:{ bg:'#f7f4ff', accent:'#7c5cf0' } },
  { key:'sand', label:'Sand', swatch:{ bg:'#fbf6ec', accent:'#c98a2e' } },
  { key:'midnight', label:'Midnight', swatch:{ bg:'#f4f7fb', accent:'#3fa7c8' } }
];
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `node --test`
Expected: ALL green (5 assertions updated).

- [ ] **Step 6: Commit**

```bash
git add tests/html.test.js data/theme-meta.js styles/main.css
git commit -m "style: remove 5 dark-theme variants, keep 5 light families"
```

---

### Task 2: Add app shell HTML + bottom nav CSS

**Files:**
- Modify: `index.html` — replace app header + body structure with top-bar + tab-content + bottom-nav
- Modify: `styles/main.css` — remove old `.header` / `.tab-strip` styles, add `.top-bar`, `.bottom-nav`, `.nav-tab`, `.tab-content` styles, `.geometric-bg` base class
- Modify: `tests/html.test.js` — add nav structure test

**Interfaces:**
- Consumes: existing `tabs` const array in render.js (the tab group descriptor), all render functions (renderPrayers, renderQ, renderAch, renderProfile, renderStats, etc.)
- Produces: `#topBar` element with level/XP/streak/date slots, `#tabContent` container, `.bottom-nav` with 5 `.nav-tab` buttons, `.geometric-bg` CSS class with theme-family patterns

- [ ] **Step 1: Write the test for the new shell**

Add to `tests/html.test.js`:
```js
test('app shell has bottom nav bar with five tabs', () => {
  assert.ok(html.includes('class="bottom-nav"'), 'bottom nav missing');
  assert.ok(html.includes('data-tab="home"'), 'home tab missing');
  assert.ok(html.includes('data-tab="quests"'), 'quests tab missing');
  assert.ok(html.includes('data-tab="stats"'), 'stats tab missing');
  assert.ok(html.includes('data-tab="growth"'), 'growth tab missing');
  assert.ok(html.includes('data-tab="profile"'), 'profile tab missing');
  assert.ok(html.includes('id="tabContent"'), 'tab content container missing');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test`
Expected: FAIL — shell elements missing.

- [ ] **Step 3: Rewrite index.html body structure**

Replace `<div class="app">` through the existing header content **before `<div id="profileArea">` block**. The new structure:

The current `index.html` has a `<div class="app">` containing a `<div class="header">` (with crescent, title, arabic subtitle). Replace that `<div class="app">` opening section with:

```html
<div class="app">
  <header class="top-bar" id="topBar">
    <div class="geometric-bg"></div>
    <div class="tb-left">
      <span class="tb-level" id="tbLevel">Lv 1</span>
      <span class="tb-title" id="tbTitle">Muslim</span>
    </div>
    <div class="tb-right">
      <span class="tb-stat" id="tbXP">⚡ 0 XP</span>
      <span class="tb-stat" id="tbStreak">🔥 0</span>
    </div>
  </header>

  <main class="tab-content" id="tabContent"></main>

  <nav class="bottom-nav">
    <button class="nav-tab active" data-tab="home" aria-label="Home">🕌<span class="nav-label">Home</span></button>
    <button class="nav-tab" data-tab="quests" aria-label="Quests">⚔️<span class="nav-label">Quests</span></button>
    <button class="nav-tab" data-tab="stats" aria-label="Stats">📊<span class="nav-label">Stats</span></button>
    <button class="nav-tab" data-tab="growth" aria-label="Growth">🌱<span class="nav-label">Growth</span></button>
    <button class="nav-tab" data-tab="profile" aria-label="Profile">⚙️<span class="nav-label">Profile</span></button>
  </nav>
</div>
```

Keep all existing UI areas (`#profileArea`, `#statsArea`, `#questArea`, etc.) inside `<div class="app">` but place them inside `#tabContent` by not placing them statically — instead they are generated via JavaScript.

Actually: The existing HTML is a single-page rendering model where the JavaScript renders to these to designated areas. Keep the areas! But wrap them inside `#tabContent`.

Simpler approach: All existing app sections (`<div class="vol-area" id="volArea">`, `<div id="profileArea">`, `<div id="statsArea">`, `<div id="questArea">`, etc.) move inside `#tabContent`. They must stay for the render functions:

```html
  <main class="tab-content" id="tabContent">
    <div id="profileArea"></div>
    <div id="statsArea"></div>
    <div id="questArea"></div>
    <div id="shopArea"></div>
    <div id="achArea"></div>
    <div class="vol-area" id="volArea" style="display:none;"></div>
    <div id="muhasabahArea"></div>
    <div id="timerArea"></div>
    <!-- any other area divs listed -->
  </main>
```

Let `renderTab()` show/hide the relevant areas for current tab. That's simpler than restructuring all render functions.

- [ ] **Step 4: Add nav CSS to styles/main.css**

Replace the old `.header` and related styles with these new rules in `styles/main.css`:

```css
/* ── Top Bar ── */
.top-bar {
  position: sticky; top: 0; z-index: 100;
  display: flex; justify-content: space-between; align-items: center;
  padding: 8px 16px;
  background: var(--bg);
  border-bottom: 1px solid var(--border);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
.top-bar .geometric-bg {
  position: absolute; inset: 0; z-index: 0;
  opacity: 0.08; pointer-events: none;
}
.tb-left { display: flex; align-items: baseline; gap: 8px; z-index: 1; }
.tb-level { font-weight: 800; font-size: 1.1rem; color: var(--gold); }
.tb-title { font-size: 0.75rem; color: var(--text2); letter-spacing: 0.5px; }
.tb-right { display: flex; gap: 14px; z-index: 1; }
.tb-stat { font-size: 0.75rem; color: var(--text2); font-weight: 600; }

/* ── Tab Content ── */
.tab-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 12px 100px 12px;
  transition: opacity 150ms ease, transform 150ms ease;
}
.tab-content.fading { opacity: 0; transform: translateY(6px); }

/* ── Bottom Nav ── */
.bottom-nav {
  position: fixed; bottom: 0; left: 0; right: 0; z-index: 100;
  display: flex; justify-content: space-around; align-items: center;
  padding: 6px 4px env(safe-area-inset-bottom,8px) 4px;
  background: var(--card);
  border-top: 1px solid var(--border);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
.nav-tab {
  display: flex; flex-direction: column; align-items: center; gap: 2px;
  border: none; background: none;
  color: var(--text2);
  font-size: 1.25rem; cursor: pointer;
  padding: 4px 8px;
  border-radius: 10px;
  transition: color 200ms ease, transform 100ms ease, background 200ms ease;
}
.nav-tab .nav-label {
  font-size: 0.55rem; font-weight: 600; letter-spacing: 0.3px;
}
.nav-tab.active {
  color: var(--gold);
  background: var(--gold-light) linear-gradient(000deg, var(--bg), transparent);
}
.nav-tab:active { transform: scale(1.08); }
```

- [ ] **Step 5: Run tests to verify**

Run: `node --test`
Expected: Nav structure test passes. All tests green.

- [ ] **Step 6: Commit**

```
git add index.html styles/main.css tests/html.test.js
git commit -m "feat: bottom nav bar + top bar app shell"
```

---

### Task 3: Implement tab controller + renderTab dispatcher

**Files:**
- Modify: `core/actions.js` — add `switchTab(name)`, `renderTab(name)`, `updateTopBar()`, expose `App.switchTab`
- Modify: `render/render.js` — replace `renderAll()` with tab-aware dispatch, keep `renderProfile` picker (5 chips), add `renderTopBar()`
- Create/Modify: `render/render.js` — `renderHomeHero` section helper
- Modify: `tests/html.test.js` — add tab switching test

**Interfaces:**
- Consumes: `.bottom-nav .nav-tab` elements (from Task 2), all existing render functions (renderPrayers, renderQ, renderAch, renderStats, renderProfile, renderShop, renderGarden, renderMountain, etc.), `S` state object (for XP/level/streak)
- Produces: `App.switchTab(name)` on window (used by nav button onclick), `renderTab(tabName)` that shows/hides areas and calls relevant render functions, `updateTopBar()` that sets level/XP/streak/date hero data

- [ ] **Step 1: Write the tab switching test**

```js
test('tab controller: nav buttons dispatch switchTab', () => {
  assert.ok(actions.includes('switchTab'), 'switchTab function missing');
  assert.ok(actions.includes("App.switchTab"), 'App.switchTab export missing');
  assert.ok(actions.includes("getAttribute('data-tab')"), 'nav tab handler missing');
  assert.ok(actions.includes('renderTab'), 'renderTab dispatch missing');
  assert.ok(render.includes('renderTop'), 'renderTop function missing');
});
```

- [ ] **Step 2: Run tests to verify it fails**

Run: `node --test`
Expected: FAIL — tab controller not yet implemented.

- [ ] **Step 3: Implement tab controller in actions.js**

Add the relevant functions to the `App` object and export:

```js
function switchTab(name) {
  const navBtns = document.querySelectorAll('.nav-tab');
  navBtns.forEach(b => b.classList.toggle('active', b.getAttribute('data-tab') === name));
  const content = document.getElementById('tabContent');
  if (content) { content.classList.add('fading'); setTimeout(() => content.classList.remove('fading'), 60); }
  window.renderTab(name);
}

function renderTab(name) {
  const map = {
    home: ['profileArea'],
    quests: ['questArea','achArea'],
    stats: ['statsArea'],
    growth: ['achArea'],
    profile: ['profileArea']
  };
  const allIds = ['profileArea','statsArea','questArea','achArea','shopArea','volArea','debtArea','timerArea','muhasabahArea'];
  allIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = (map[name] || []).includes(id) ? '' : 'none';
  });
  if (name === 'home') {
    window.renderPrayers(); window.renderVol(); window.renderDeeds(); window.renderBonus(); window.renderTip();
    window.renderTopBar();
  } else if (name === 'quests') {
    window.renderQ(); window.renderAch();
  } else if (name === 'stats') {
    if (window.Dashboard && typeof window.Dashboard.renderInsights === 'function') window.Dashboard.renderInsights();
  } else if (name === 'growth') {
    if (window.renderGarden) window.renderGarden();
    if (window.renderSpiritualGrowthTab) window.renderSpiritualGrowthTab();
    if (window.renderBoat) window.renderBoat();
  } else if (name === 'profile') {
    window.renderProfile();
  }
  updateTopBar();
}

function updateTopBar() {
  const lv = document.getElementById('tbLevel');
  const title = document.getElementById('tbTitle');
  const xp = document.getElementById('tbXP');
  const str = document.getElementById('tbStreak');
  if (lv) lv.textContent = `Lv ${S.lv}`;
  if (title) title.textContent = lvTitle(S.lv);
  if (xp) xp.textContent = `⚡ ${(S.xp||0).toLocaleString()} XP`;
  if (str) str.textContent = `🔥 ${S.cs||0}`;
}
```

Expose via `window.App.switchTab = switchTab;` in the exports.

Wire `nav-tab` click handlers: call `App.switchTab(name)` from `onclick` attribute on each nav button.

- [ ] **Step 4: Add renderTopBar to render.js**

```js
function renderTopBar() {
  const lv = document.getElementById('tbLevel');
  const title = document.getElementById('tbTitle');
  const xp = document.getElementById('tbXP');
  const streak = document.getElementById('tbStreak');
  if (lv) lv.textContent = `Lv ${S.lv}`;
  if (title) title.textContent = lvTitle(S.lv);
  if (xp) xp.textContent = `⚡ ${(S.xp||0).toLocaleString()} XP`;
  if (streak) streak.textContent = `🔥 ${S.cs||0}`;
}
window.renderTopBar = renderTopBar;
```

- [ ] **Step 5: Update setTheme to call renderTab**

In `core/actions.js`, replace `window.renderAll()` in `setTheme` with:
```js
updateTopBar();
const navBtns = document.querySelectorAll('.nav-tab');
const active = [...navBtns].find(b => b.classList.contains('active'));
const tab = active ? active.getAttribute('data-tab') : 'home';
window.renderTab(tab);
```

Also update the initial load: after `applyTheme(), renderAll()` replace with `applyTheme(); renderTab('home'); renderTopBar();`

- [ ] **Step 6: Run tests**

Run: `node --test`
Expected: ALL green.

- [ ] **Step 7: Commit**

```
git add core/actions.js render/render.js index.html tests/html.test.js
git commit -m "feat: bottom nav tab controller with top bar hero"
```

---

### Task 4: Theme-aware intro overlay + service worker banner

**Files:**
- Modify: `index.html` — replace intro overlay inline styles with CSS classes, add SW classes
- Modify: `styles/main.css` — add `.intro-bismillah`, `.intro-btn`, `.sw-update-badge` class rules
- Modify: `tests/html.test.js` — update test assertions

**Interfaces:**
- Consumes: existing hardcoded `#introBismillah` and `#introBtn` elements, existing inline SW banner script (~line 406)
- Produces: CSS classes for intro elements using `var(--gold)`, SW banner using `var(--gold)`

- [ ] **Step 1: Write the test for theme-aware intro**

```js
test('intro overlay uses CSS vars for theme accent', () => {
  assert.ok(css.includes('.intro-bismillah'), 'intro-bismillah class missing');
  assert.ok(css.includes('.intro-btn'), 'intro-btn class missing');
  assert.ok(css.includes('var(--gold)'), 'intro must reference a theme CSS var');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test`
Expected: FAIL — `.intro-bismillah` not in CSS.

- [ ] **Step 3: Add intro CSS classes in styles/main.css**

```css
/* ── Intro Overlay Theme-Aware ── */
.intro-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: #030712; z-index: 99999;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  overflow: hidden;
}
.intro-bismillah {
  font-family: var(--font-arabic);
  font-size: 3.5rem;
  color: var(--gold);
  text-shadow: 0 0 30px rgba(var(--gold),0.6), 0 0 60px rgba(var(--gold),0.3);
  letter-spacing: 2px;
  text-align: center; line-height: 1.8;
  animation: bismillahGlow 3s ease-in-out infinite, introFadeUp 1.4s ease-out forwards;
  opacity: 0; position: relative; z-index: 1;
}
.intro-subtitle {
  font-family: var(--font);
  font-size: 1.2rem;
  color: #F8FAFC;
  letter-spacing: 4px; text-transform: uppercase;
  margin-top: 20px;
  opacity: 0; position: relative; z-index: 1;
  animation: introFadeUp 1s ease-out 0.6s forwards;
}
.intro-btn {
  margin-top: 50px;
  padding: 15px 40px;
  font-size: 1.1rem; font-family: var(--font);
  font-weight: 700;
  background: linear-gradient(135deg, var(--gold), var(--emerald));
  color: #fff;
  border: none; border-radius: 30px;
  cursor: pointer;
  box-shadow: 0 10px 30px var(--shadow);
  letter-spacing: 1px;
  transition: all 0.3s;
  opacity: 0; position: relative; z-index: 1;
  animation: introFadeUp 1s ease-out 1.2s forwards, btnPulse 2.5s ease-in-out 2.2s infinite;
}
.sw-banner {
  background: var(--bg);
  border: 1px solid var(--gold-light);
  color: var(--text);
}
.sw-banner-btn {
  background: var(--gold);
  color: #ffffff;
}
```

Note: CSS hex-to-rgb can't be done natively for text-shadow. Solution: use relative color syntax `rgb(from var(--gold) r g b)` but that's modern and not widely supported. Instead, keep the text-shadow fallback to a light-accent value: `text-shadow: 0 0 30px var(--gold), 0 0 60px var(--gold-light);`. This works fine.

- [ ] **Step 4: Update index.html intro overlay**

Replace the inline-styled Bismillah div and button with classes:

```html
<div id="introOverlay" class="intro-overlay">
    <canvas id="introCanvas" style="position:absolute;top:0;left:0;width:100%;height:100%;z-index:0;"></canvas>
    <div id="introBismillah" class="intro-bismillah">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</div>
    <div id="introSub" class="intro-subtitle">In the Name of Allah, the Most Merciful</div>
    <button id="introBtn" class="intro-btn" onclick="window.startJourney()">Begin Journey</button>
</div>
```

- [ ] **Step 5: Update SW banner styles**

Update the inline style for the SW banner:
```js
b.className = 'sw-banner';
b.innerHTML = '<span style="flex:1;">🔄 New version available</span><button id="swUpdateBtn" class="sw-banner-btn">Refresh</button>';
```

Then add the CSS classes in main.css (line ~406-407 area):

```css
.sw-banner {
  position: fixed; left: 12px; right: 12px; bottom: 12px; z-index: 9999;
  display: flex; align-items: center; gap: 10px;
  padding: 12px 16px; border-radius: 14px;
  font-family: system-ui,sans-serif; font-size: 0.9rem;
  box-shadow: var(--shadow);
}
.sw-banner-btn {
  border: 0; padding: 8px 14px; border-radius: 10px;
  font-weight: 700; cursor: pointer;
}
```

- [ ] **Step 6: Run tests**

Run: `node --test`
Expected: All new assertions pass, total 54+.

- [ ] **Step 7: Commit**

```
git add index.html styles/main.css tests/html.test.js
git commit -m "style: intro overlay and SW banner use theme accent vars"
```

---

### Task 5: Theme-aware spiritual growth SVGs, dhikr chip colors, and actions.js accent

**Files:**
- Modify: `features/spiritual-growth/mosque.js` — hex → `var(--gold)`/`var(--emerald)`
- Modify: `features/spiritual-growth/mountain.js` — same
- Modify: `features/spiritual-growth/armor.js` — same
- Modify: `features/spiritual-growth/boat.js` — same
- Modify: `features/spiritual-growth/lantern.js` — hex constants → `var(--gold)`/`var(--gold-light)`
- Modify: `features/spiritual-growth/keys.js` — hex constants → `var(--gold)`/`var(--gold-light)`
- Modify: `features/garden.js` — flower SVG fills → CSS vars
- Modify: `data/pools/dhikr.js` — color field → `var(--gold)`
- Modify: `core/actions.js` — hardcoded rose color on line ~213 → `var(--gold)`
- Modify: `styles/main.css` — update `.ach-card.tier-legendary` border/glow → `var(--gold)`/`var(--gold-light)`
- Modify: `tests/html.test.js` — add such test asserting `var(--gold)` is present in at least the main CSS

**Interfaces:**
- Consumes: `--gold`, `--gold-light`, `--gold-dark`, `--emerald` CSS custom properties (defined in each theme block)
- Produces: every hardcoded rose hex replaced with a CSS var reference, test asserting theme var exists in CSS

- [ ] **Step 1: Write the theme-var persistence test**

```js
test('theme-accent is defined as a CSS var and used in component styles', () => {
  assert.ok(css.includes('--gold:'), '--gold CSS var not defined');
  assert.ok(css.includes('var(--gold)'), 'theme var not used anywhere in CSS');
});
```

- [ ] **Step 2: Run test to verify it passes**

This test should pass already, but gated for safety. Make sure to assert that CSS contains `--gold` (which was already in use).

- [ ] **Step 3: Replace hexes in all spiritual growth SVGs**

For each file, find the hex constants or literals and replace with CSS var syntax:

**mosque.js** (approximate line numbers):
```js
// was: fill="#f43f5e"... all become:
fill="var(--gold)"
stroke="var(--gold)"
fill="var(--emerald)" for opacity
fill="var(--emerald)" for background rects
```

**mountain.js**:
```js
// was: stroke="#f43f5e" fill="#f43f5e" fill="#fb7185" -> var(--gold), var(--gold-light), var(--emerald)
stroke="var(--gold)"
fill="var(--gold)"
fill="var(--gold-light)"
```

**armor.js**:
```js
// was: fill="#f43f5e" -> var(--gold)
// Replace all `fill="#f43f5e"` with `fill="var(--gold)"`
```

**boat.js**:
```js
// was: fill="#fb7185" -> var(--gold-light)
circles .fill → `var(--gold-light)`
```

**lantern.js / keys.js**:
```js
// was: const gold = '#f43f5e' etc.
const gold = 'var(--gold)';
const warm = 'var(--gold-light)';
const lightGold = 'var(--gold-light)';
```

**garden.js** (flower fills):
```js
// was: fill="#E89BB0" fill="#fb7185"
// These are rose pink. Use gold light and emerald there.
fill="var(--gold-light)"
fill="var(--gold)" // accent center
```

**dhikr.js**:
```js
// The color field in pool definition
{ arabic:"اللَّهُ أَكْبَرُ", ..., color:"var(--gold)" }
```

**actions.js**:
```js
// line ~213: the toast/achievement color override
// was: color: '#f43f5e'
color: 'var(--gold)'
```

**styles/main.css** line ~201 (rename block):
```css
/* .ach-card.tier-legendary { border-color: var(--gold); box-shadow: 0 0 12px rgba(var(--gold)/* fall at var(--shadow) ); } */
.ach-card.tier-legendary.unlocked {
  border-color: var(--gold);
  background: var(--bg-accent);
  box-shadow: var(--shadow);
}
```

- [ ] **Step 4: Run tests**

Run: `node --test`
Expected: ALL green (test verifying var(--gold) presence in CSS passes).

- [ ] **Step 5: Commit**

```
git add features/spiritual-growth/*.js features/garden.js data/pools/dhikr.js core/actions.js styles/main.css tests/html.test.js
git commit -m "refactor: all hardcoded rose accents replaced by theme CSS vars"
```

---

### Task 6: Geometric patterns, animations, shadow tuning

**Files:**
- Modify: `styles/main.css` — add geometric pattern base64 SVGs per theme block, add global transition rule, add card hover/bouncy active styles, improve typography spacing
- Modify: `tests/html.test.js` — add animation/pattern presence test

**Interfaces:**
- Consumes: base64-encoded SVG patterns (inline) using `var(--gold)` or `var(--emerald)` as fill color
- Produces: `.geometric-bg` base class and per-family `data-theme` rule overrides, polished UI feel

- [ ] **Step 1: Write the test for geometric patterns and animation diff**

```js
test('theme families have geometric pattern and animation transictions in CSS', () => {
  assert.ok(css.includes('transition: background 300ms'), 'crossfade transition missing');
  assert.ok(css.includes('transition: transform 200ms'), 'card hover transition missing');
  assert.ok(css.includes('.geometric-bg'), 'geometric pattern container missing');
  assert.ok(css.includes('html[data-theme="serene"] ') && css.includes('pattern'), 'geometric pattm for serene missing');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test`
Expected: FAIL — no geometric patterns yet.

- [ ] **Step 3: Add CSS transitions evolve**

Add to `styles/main.css` after the `:root` block:

```css
/* ── Global Theme Transitions & Polish ── */
*, *::before, *::after {
  transition: background 300ms cubic-bezier(0.4, 0, 0.2, 1), color 300ms cubic-bezier(0.4, 0, 0.2, 1), border-color 300ms cubic-bezier(0.4, 0, 0.2, 1);
}
.prayer-card, .deed-card, .quest-card, .shop-card, .ach-card {
  transition: transform 200ms ease, box-shadow 200ms ease;
}
.prayer-card:active, .deed-card:active, .quest-card:active, .nav-tab:active {
  transform: scale(0.97);
}
.prayer-card:hover, .deed-card:hover, .quest-card:hover {
  transform: scale(1.02);
  box-shadow: 0 12px 28px rgba(0,0,0,0.15);
}
```

- [ ] **Step 4: Add typography polish**

```css
:root {
  /* ...existing tokens... */
  line-height: 1.6;
  --radius: 18px;
  --radius-sm: 14px;
}
.section-title {
  letter-spacing: 0.5px;
  border-bottom: 2px solid var(--gold);
  padding-bottom: 4px;
  margin-bottom: 12px;
}
```

- [ ] **Step 5: Add geometric pattern backgrounds per family**

Each theme gets a base64-encoded SVG pattern used as CSS `background-image`.

```css
/* Rose (default) — light floral motif */
html[data-theme="light"] .geometric-bg,
html:not([data-theme]) .geometric-bg {
  background-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><circle cx='40' cy='40' r='3' fill='%23f43f5e' opacity='0.06'/><circle cx='40' cy='40' r='18' fill='none' stroke='%23f43f5e' stroke-width='0.3' opacity='0.04'/></svg>");
  background-size: 80px 80px;
}

/* Serene — leaf/green */
html[data-theme="serene"] .geo-bg {
  background-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 60'><rect x='28' y='28' width='4' height='4' fill='%234c7a4a' opacity='0.06'/></svg>");
  background-size: 60px 60px;
}

/* Royal — diamond */
html[data-theme="royal"] .geo-bg {
  background-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 60'><polygon points='30,15 45,30 30,45 15,30' fill='none' stroke='%237c5cf0' stroke-width='0.5' opacity='0.06'/></svg>");
  background-size: 60px 60px;
}

/* Sand — geometric/net */
html[data-theme="sand"] .geo-bg {
  background-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><line x1='0' y1='0' x2='40' y2='40' stroke='%23c98a2e' stroke-width='0.3' opacity='0.05'/><line x1='40' y1='0' x2='0' y2='40' stroke='%23c98a2e' stroke-width='0.3' opacity='0.05'/></svg>");
  background-size: 40px 40px;
}

/* Midnight — celestial/stars */
html[data-theme="midnight"] .geo-bg {
  background-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'><circle cx='20' cy='20' r='1.5' fill='%233fa7c8' opacity='0.08'/><circle cx='60' cy='40' r='0.8' fill='%233fa7c8' opacity='0.06'/><circle cx='25' cy='65' r='1.2' fill='%233fa7c8' opacity='0.07'/><circle cx='55' cy='15' r='0.6' fill='%233fa7c8' opacity='0.05'/></svg>");
  background-size: 80px 88px;
}
```

- [ ] **Step 6: Run tests**

Run: `node --test`
Expected: ALL green.

- [ ] **Step 7: Commit**

```
git add styles/main.css tests/html.test.js
git commit -m "style: geometric patterns, crossfade animations, card hover/press, typography polish"
```

---

### Task 7: Final verification + test count

**Files:**
- Modify: `tests/html.test.js` — count
- Checkpoint: verify all tests pass

**Interfaces:**
- Consumes: all previously committed deliverables
- Produces: green full suite, commit message documenting final state

- [ ] **Step 1: Run full test suite**

Run: `node --test`
Expected: ALL tests green (>= 55+ tests).

- [ ] **Step 2: Grep for remaining hardcoded rose hexes**

Run: `Select-String -Include "*.js,*.css,*.html" -Pattern "#f43f5e|#fb7185|#f472b6|#e11d48"`

Expected: **no hits** in active code (only in historic spec/plan docs). If any found, fix and repeat step 1.

- [ ] **Step 3: Grep for removed dark theme references**

Run: `Select-String -Include "*.js,*.css,*.html" -Pattern "serene-dark|royal-dark|sand-dark|midnight-dark"`

Expected: **no hits** in active code.

- [ ] **Step 4: Commit**

```bash
git add tests/html.test.js
git commit -m "test: final verification pass, all dark free, all rose-var-aware"
```

Edge-case: if nothing changed in tests.html.test.js, skip or sign a verifying commit with `--allow-empty -m "verification: clean grep, 55+ tests pass, warehouse left"`.

---

## Execution Strategy

1. Create fresh git branch from `theme-modern-light-glass`.
2. Execute tasks sequentially 1 → 2 → 3 → 4 → 5 → 6 → 7.
3. After each task, verify `node --test` passes, then commit.
4. Branch is ready for merge when all 7 tasks complete + final grep confirms zero dark/rose hex in live code. User ran browser smoke test to confirm 5-chip picker, bottom nav switching, theme transition crossfade, and geometric pattern visible per family. Then merge into `theme-modern-light-glass`.