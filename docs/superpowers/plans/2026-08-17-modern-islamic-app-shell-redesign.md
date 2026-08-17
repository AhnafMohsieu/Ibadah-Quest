# Ibadah Quest — Modern Islamic App-Shell Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Ibadah Quest shell — fix the broken mobile top nav, compact the 448px hero into a ~90px status strip, add a thumb-reachable bottom nav on mobile, and refine the clay visual system — without breaking any of the 306 existing tests.

**Architecture:** Pure CSS + light DOM/JS changes in a vanilla `<script>` tag app (no bundler). The hero renderers (`renderLv`, `renderStr`, `renderTopBar` in `render/dynamic.js`) keep their exact DOM ids so no JS rendering logic changes. Navigation logic in `render/tabs.js` is extended to sync a new bottom nav; everything else is CSS media queries.

**Tech Stack:** Vanilla JS, HTML, CSS (single `styles/main.css`, no framework, no Tailwind).

## Global Constraints

- All 306 existing tests must keep passing (`node --test tests/*.test.js`).
- Required HTML ids MUST stay in `index.html`: `headerCrescent`, `lvNum`, `lvTitle`, `xpBar`, `xpLabel`, `strDays`, `strMsg`, `bestStr`, `streakFire`, `decoLeft`, `decoRight`, `tbLevel`, `tbTitle`, `tbXP`, `tbStreak`, `mainContent`, `tier2Tabs`, `tier3Wrap`, `gardenArea`, `muhasabahEntry`, `muhasabahModal`, `panel-journeys`, `journeyArea`, `armorArea`, `heartArea`, `panel-timer`, `timerArea`, `prayerNamesArea`, `prayerTimesArea`.
- Required text in `index.html`: `Ibadah Quest`, `Submission. Grow. Earn. Ascend.`.
- Required CSS markers MUST stay in `styles/main.css`: `--bg: #ddd3ea`, `--gold: #f43f5e`, `--shadow-light`, `backdrop-filter`, `.header-crescent`, `@keyframes moonFloat`, `@keyframes xpWave`, `.xp-inner`, `.streak-bar`, `.best-num`, `.t1-btn.active`, `.prayer-times-grid`, `.pt-card`, `html[data-theme="serene"]`/`royal`/`sand`/`midnight`/`cream`/`emara` blocks, `.garden-tree svg`, `border-radius: var(--radius) var(--radius) 6px 6px`, `transition: background 300ms`, `transition: transform 200ms`, `align-items: stretch`.
- FORBIDDEN markers (tests assert absence): `html[data-theme="dark"]`, `html[data-theme="night"]`, `html[data-theme="serene-dark"]`, `--bg: #0b1513`, `--emerald: #10b981`, `--gold: #D4AF37`, `tailwindcss`, `panel-leaderboard`.
- Must keep in `index.html`: `localStorage.getItem('iqTheme')`, `setAttribute('data-theme'`, `styles/main.css?v=14`, `rel="manifest"`, theme-color `#ddd3ea`, `navigator.serviceWorker.register('sw.js?v=15')`, `'SKIP_WAITING'`, `swUpdateBanner`.
- Must keep in `render/tabs.js` exports: `_pushTabState`, `_findTabBtn`, `switchCategory`, `selectCategory`, `renderCategoryTabs`, `getSectionPanels`, `activateTab`, `switchTab`, `renderTab`, `initTierTabKeyboardNav`, `initTier2TabKeyboardNav`, `populateTier1Icons`.
- `window.*` API surface unchanged. No ES modules/bundler. Keep `<script>` tags.

---

### Task 1: Fix t1-btn mobile width bug

**Files:**
- Modify: `styles/main.css:415` (the `@media (max-width: 600px)` tier1 rule)
- Test: `tests/html.test.js` (append new test)

**Interfaces:**
- Consumes: existing `.tier1-tabs`, `.t1-btn` markup in `index.html:120-126`.
- Produces: correct mobile t1 button widths (`flex-basis: auto` resolves to `width: auto` instead of the desktop `width: 100%`). No other task depends on this CSS value.

**Problem:** Base rule `.t1-btn { width: 100% }` (main.css:417) persists inside the mobile flex context, so `flex: 0 0 auto` resolves `flex-basis: auto` to `width: 100%` → each t1 button renders ~294px wide on a 390px screen.

- [ ] **Step 1: Write the failing test**

Append to `tests/html.test.js`:

```js
test('mobile tier1 media query overrides t1-btn width to auto', () => {
  const mqIdx = css.indexOf('@media (max-width: 600px)');
  assert.ok(mqIdx > -1, 'mobile media query must exist');
  const mobileBlock = css.slice(mqIdx, mqIdx + 400);
  assert.ok(mobileBlock.includes('.t1-btn') && mobileBlock.includes('width: auto;'),
    'mobile .t1-btn must set width: auto to fix flex-basis:auto resolving to width:100%');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/html.test.js`
Expected: FAIL — the mobile block has `min-width: 92px` but no `width: auto;`.

- [ ] **Step 3: Fix the CSS**

Replace line 415 in `styles/main.css` with:

```css
@media (max-width: 600px) { .tier1-tabs { display: flex; flex-wrap: nowrap; overflow-x: auto; overflow-y: hidden; scrollbar-width: none; -webkit-overflow-scrolling: touch; gap: 8px; padding-bottom: 4px; } .tier1-tabs .t1-btn { flex: 0 0 auto; min-width: 92px; width: auto; } }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/html.test.js`
Expected: PASS (including the new test and all pre-existing html tests).

- [ ] **Step 5: Commit**

```bash
git add styles/main.css tests/html.test.js
git commit -m "fix: t1-btn overflows on mobile (flex-basis auto resolved to width 100%)"
```

---

### Task 2: Compact hero into a status strip

**Files:**
- Modify: `index.html:76-98` (hero header, level-row, streak-bar)
- Modify: `styles/main.css` (`.header`, `.level-row`, `.streak-bar` rules at lines 349-378, plus new `.hero-strip` rules)
- Test: `tests/html.test.js` (append new test)

**Interfaces:**
- Consumes: hero ids written by `renderLv`/`renderStr` (`render/dynamic.js:93-123`): `headerCrescent`, `decoLeft`, `decoRight`, `lvNum`, `lvTitle`, `xpBar`, `xpLabel`, `streakFire`, `strDays`, `bestStr`, `strMsg`. These must remain present and gettable.
- Produces: a single `.hero-strip` wrapper; all hero ids and the `.level-row`/`.streak-bar`/`.header` class names preserved so the existing hero CSS and tests still match.

**Design:** Wrap the three existing hero blocks in `<div class="hero-strip">` and add compact styles so the combined height drops from ~448px to ~90-120px on mobile. Do NOT delete any id or the tagline text.

- [ ] **Step 1: Write the failing test**

Append to `tests/html.test.js`:

```js
test('hero is wrapped in compact hero-strip and keeps all ids', () => {
  const stripIdx = html.indexOf('class="hero-strip"');
  assert.ok(stripIdx > -1, 'hero-strip wrapper missing');
  const stripHtml = html.slice(stripIdx, stripIdx + 1600);
  for (const id of ['headerCrescent','lvNum','lvTitle','xpBar','xpLabel','strDays','strMsg','bestStr','streakFire']) {
    assert.ok(stripHtml.includes(`id="${id}"`), `hero-strip must contain ${id}`);
  }
  assert.ok(css.includes('.hero-strip'), 'hero-strip styles missing');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/html.test.js`
Expected: FAIL — no `class="hero-strip"` in html.

- [ ] **Step 3: Wrap the hero markup**

In `index.html`, wrap lines 76-98. Change this:

```html
  <!-- ═══════════════ HERO HEADER ═══════════════ -->
  <div class="header">
    ...
  </div>

  <div class="level-row">
    ...
  </div>

  <div class="streak-bar">
    ...
  </div>
```

to:

```html
  <!-- ═══════════════ HERO HEADER ═══════════════ -->
  <div class="hero-strip">
  <div class="header">
    <div class="header-crescent" id="headerCrescent" aria-hidden="true"></div>
    <h1>Ibadah Quest</h1>
    <div class="header-deco" aria-hidden="true"><span id="decoLeft"></span>Submission. Grow. Earn. Ascend.<span id="decoRight"></span></div>
  </div>

  <div class="level-row">
    <div class="level-badge">
      <span class="lv-num" id="lvNum" aria-live="polite">1</span>
      <span class="lv-title" id="lvTitle">Seeker</span>
    </div>
    <div class="xp-wrap" id="xpWrap">
      <div class="xp-outer"><div class="xp-inner" id="xpBar" style="width:0%"></div></div>
      <div class="xp-label" id="xpLabel" aria-live="polite">0 / 100 XP</div>
    </div>
  </div>

  <div class="streak-bar">
    <span class="streak-fire" id="streakFire"></span>
    <div class="streak-info"><h3 id="strDays" aria-live="polite">0 Day Streak</h3><p id="strMsg">Start your journey!</p></div>
    <div class="streak-best"><div class="best-num" id="bestStr">0</div><div class="best-label">BEST</div></div>
  </div>
  </div><!-- /hero-strip -->
```

Preserve the exact original inner content of `.header`, `.level-row`, `.streak-bar` (the plan shows the current inner markup — copy it verbatim from the file; do not rename any id).

- [ ] **Step 4: Add compact `.hero-strip` CSS**

Insert after the `.streak-bar` rule (around main.css:378):

```css
/* ── Compact Hero Strip ── */
.hero-strip { margin-bottom: 18px; }
@media (max-width: 600px) {
  .hero-strip .header { padding: 12px 0 6px; }
  .hero-strip .header-crescent { width: 40px; height: 40px; margin-bottom: 4px; }
  .hero-strip .header-crescent .iq-icon { width: 34px; height: 34px; }
  .hero-strip .header h1 { font-size: 1.35rem; letter-spacing: 2px; margin: 2px 0; }
  .hero-strip .header-deco { margin-top: 6px; font-size: 0.6rem; letter-spacing: 3px; }
  .hero-strip .level-row { margin: 8px auto 6px; gap: 12px; }
  .hero-strip .level-badge { padding: 8px 16px; }
  .hero-strip .lv-num { font-size: 1.3rem; }
  .hero-strip .xp-wrap { min-width: 160px; }
  .hero-strip .xp-label { margin-top: 4px; font-size: 0.68rem; }
  .hero-strip .streak-bar { padding: 10px 16px; margin-bottom: 12px; gap: 12px; }
  .hero-strip .streak-fire .iq-icon { width: 28px; height: 28px; }
  .hero-strip .streak-info h3 { font-size: 0.95rem; }
  .hero-strip .streak-best { padding: 4px 12px; }
  .hero-strip .best-num { font-size: 1.15rem; }
}
@media (min-width: 601px) and (max-width: 768px) {
  .hero-strip .header { padding: 22px 0 8px; }
  .hero-strip .level-row { margin: 12px auto 14px; }
  .hero-strip .streak-bar { margin-bottom: 16px; }
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `node --test tests/html.test.js`
Expected: PASS. Then run the whole suite: `node --test tests/*.test.js` — expect 307 pass (306 + 1 new).

- [ ] **Step 6: Commit**

```bash
git add index.html styles/main.css tests/html.test.js
git commit -m "feat: compact hero into status strip so tabs appear above the fold"
```

---

### Task 3: Mobile bottom nav with synced active state

**Files:**
- Modify: `index.html` (add `<nav class="bnav" id="bnav">` before the FAB at line 564)
- Modify: `render/tabs.js:25-57` (`switchCategory` — sync `.bnav-btn` active state)
- Modify: `styles/main.css` (new `.bnav` styles + FAB/app padding adjustments)
- Test: `tests/html.test.js`, `tests/app-registry.test.js` (append)

**Interfaces:**
- Consumes: `switchCategory(catId, btn)` from Task 3's own edit (signature unchanged: `(catId, btn)`); `window.TAB_GROUPS` keys `ibadah`, `knowledge`, `names_main`, `library`, `profile_main`; `App.switchCategory('cat', this)` inline handler pattern used by existing t1 buttons.
- Produces: `#bnav` element with five `.bnav-btn` buttons (one per category, `data-cat` attr, `onclick="App.switchCategory('<cat>', this)"`); `switchCategory` now also toggles `.bnav-btn.active`. Later tasks rely on `#bnav` existing and on `switchCategory` marking the correct `.bnav-btn` active.

- [ ] **Step 1: Write the failing tests**

Append to `tests/html.test.js`:

```js
test('bottom nav exists with five category buttons', () => {
  assert.ok(html.includes('id="bnav"'), 'bottom nav missing');
  const cats = ['ibadah','knowledge','names_main','library','profile_main'];
  for (const c of cats) {
    assert.ok(html.includes(`data-cat="${c}"`), `bottom nav missing ${c}`);
  }
  assert.ok(html.includes('class="bnav-btn'), 'bnav-btn class missing');
  assert.ok(css.includes('.bnav'), 'bnav styles missing');
  assert.ok(css.includes('.bnav-btn'), 'bnav-btn styles missing');
});
```

Append to `tests/app-registry.test.js`:

```js
test('switchCategory syncs bottom nav active state', () => {
  const tabsSrc = require('fs').readFileSync(require('path').join(__dirname, '..', 'render', 'tabs.js'), 'utf8');
  const fnIdx = tabsSrc.indexOf('function switchCategory');
  const body = tabsSrc.slice(fnIdx, fnIdx + 1400);
  assert.ok(body.includes('.bnav-btn'), 'switchCategory must sync .bnav-btn');
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/html.test.js tests/app-registry.test.js`
Expected: FAIL — no `#bnav`, no `.bnav-btn` handling.

- [ ] **Step 3: Add the bottom nav markup**

In `index.html`, insert immediately before the FAB div (line 564):

```html
<!-- Mobile bottom navigation -->
<nav class="bnav" id="bnav" aria-label="Main navigation">
  <button class="bnav-btn" data-cat="ibadah" onclick="App.switchCategory('ibadah', this)" role="tab" aria-selected="true"><span class="bnav-icon"></span><span class="bnav-label">Daily</span></button>
  <button class="bnav-btn" data-cat="knowledge" onclick="App.switchCategory('knowledge', this)" role="tab" aria-selected="false"><span class="bnav-icon"></span><span class="bnav-label">Knowledge</span></button>
  <button class="bnav-btn" data-cat="names_main" onclick="App.switchCategory('names_main', this)" role="tab" aria-selected="false"><span class="bnav-icon"></span><span class="bnav-label">Names</span></button>
  <button class="bnav-btn" data-cat="library" onclick="App.switchCategory('library', this)" role="tab" aria-selected="false"><span class="bnav-icon"></span><span class="bnav-label">Library</span></button>
  <button class="bnav-btn" data-cat="profile_main" onclick="App.switchCategory('profile_main', this)" role="tab" aria-selected="false"><span class="bnav-icon"></span><span class="bnav-label">Profile</span></button>
</nav>
```

Then extend the existing inline icon-fill script at `index.html:343-349` to also fill bottom-nav icons. Replace that script block with:

```html
<script>
  if (typeof iqIcon !== 'function') { function iqIcon(){return '';} function iqEmoji(){return '';} }
  document.querySelectorAll('.tier1-tabs .t1-btn').forEach(function (b) {
    var s = b.querySelector('.iq-inline');
    if (s) s.innerHTML = iqIcon(b.getAttribute('data-cat'));
  });
  document.querySelectorAll('.bnav-btn').forEach(function (b) {
    var s = b.querySelector('.bnav-icon');
    if (s) s.innerHTML = iqIcon(b.getAttribute('data-cat'));
  });
</script>
```

- [ ] **Step 4: Sync active state in switchCategory**

In `render/tabs.js`, inside `switchCategory(catId, btn)` (currently lines 25-33, before the `if (window.S)` line), add bottom-nav syncing. Replace the start of the function with:

```js
  function switchCategory(catId, btn) {
    document.querySelectorAll('.t1-btn').forEach(function(el) {
      el.classList.remove('active');
      el.setAttribute('aria-selected', 'false');
    });
    document.querySelectorAll('.bnav-btn').forEach(function(el) {
      el.classList.remove('active');
      el.setAttribute('aria-selected', 'false');
    });
    if (btn) {
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
    }
    var bnavMatch = document.querySelector('.bnav-btn[data-cat="' + catId + '"]');
    if (bnavMatch) {
      bnavMatch.classList.add('active');
      bnavMatch.setAttribute('aria-selected', 'true');
    }
    if (window.S) { window.S.lastCat = catId; window.saveState(); }
```

Note: the t1 buttons also need `.t1-btn.active` restored on desktop when switching via bottom nav — add the same `var t1Match = document.querySelector('.t1-btn[data-cat="' + catId + '"]'); if (t1Match) t1Match.classList.add('active');` logic. (The existing init path in `core/actions.js:294-297` already re-selects the matching `.t1-btn`, so this is for direct bottom-nav clicks.)

- [ ] **Step 5: Add bottom-nav CSS + adjust FAB and app padding**

Append to `styles/main.css`:

```css
/* ── Mobile Bottom Navigation ── */
.bnav {
  display: flex;
  position: fixed;
  bottom: 0; left: 0; right: 0;
  z-index: 150;
  background: var(--card-bg);
  border-top: 1px solid var(--border);
  box-shadow: 0 -6px 20px rgba(0,0,0,0.12);
  padding: 6px 8px calc(6px + env(safe-area-inset-bottom, 0px));
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
.bnav-btn {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  min-height: 52px;
  background: transparent;
  border: none;
  color: var(--text2);
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.3px;
  cursor: pointer;
  border-radius: 12px;
  transition: color 0.2s ease, background 0.2s ease, transform 0.1s ease;
}
.bnav-btn .bnav-icon { font-size: 1.3rem; line-height: 1; }
.bnav-btn:active { transform: scale(0.94); }
.bnav-btn.active { color: var(--gold-dark); background: rgba(var(--accent-rgb),0.10); }
.bnav-btn:focus-visible { outline: 2px solid var(--gold); outline-offset: -2px; }
@media (min-width: 768px) {
  .bnav { display: none; }
}
@media (max-width: 767px) {
  .fab-container { bottom: calc(84px + env(safe-area-inset-bottom, 0px)); }
  .app { padding-bottom: calc(96px + env(safe-area-inset-bottom, 0px)); }
  .tab-content { padding-bottom: calc(84px + env(safe-area-inset-bottom, 0px)); }
}
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `node --test tests/html.test.js tests/app-registry.test.js`
Expected: PASS. Then full suite: `node --test tests/*.test.js` — expect 309 pass.

- [ ] **Step 7: Headless Chrome smoke check (mobile)**

Run the server (`node C:\Users\Mahin\AppData\Local\Temp\opencode\server.js`), then run `node C:\Users\Mahin\AppData\Local\Temp\opencode\cdp_dev.js`.
Expected: `#bnav` present, `bnav-btn` count = 5, `.t1-btn` widths ≈ 92-100px (not 294px), tier nav above fold, no console errors.

- [ ] **Step 8: Commit**

```bash
git add index.html render/tabs.js styles/main.css tests/html.test.js tests/app-registry.test.js
git commit -m "feat: add mobile bottom navigation synced with category switching"
```

---

### Task 4: Keyboard nav for bottom nav + visual polish

**Files:**
- Modify: `render/tabs.js` (add `initBnavKeyboardNav`, export it)
- Modify: `core/actions.js:327` (call `window.initBnavKeyboardNav()` in `init()`)
- Modify: `styles/main.css` (focus-visible + reduced-motion polish, desktop/tablet 2-col grids)
- Test: `tests/html.test.js`, `tests/app-registry.test.js` (append)

**Interfaces:**
- Consumes: `#bnav` and `.bnav-btn` from Task 3; `init()` in `core/actions.js` (Step 7/8 area around line 327-328).
- Produces: `window.initBnavKeyboardNav` (arrow/Home/End keyboard nav mirroring `initTierTabKeyboardNav`); CSS polish rules. Nothing later depends on these beyond the shell being usable.

- [ ] **Step 1: Write the failing tests**

Append to `tests/app-registry.test.js`:

```js
test('initBnavKeyboardNav is defined and wired', () => {
  const tabsSrc = require('fs').readFileSync(require('path').join(__dirname, '..', 'render', 'tabs.js'), 'utf8');
  assert.ok(tabsSrc.includes('function initBnavKeyboardNav'), 'initBnavKeyboardNav must exist');
  assert.ok(tabsSrc.includes('window.initBnavKeyboardNav = initBnavKeyboardNav'), 'initBnavKeyboardNav must be exported');
  const actionsSrc = require('fs').readFileSync(require('path').join(__dirname, '..', 'core', 'actions.js'), 'utf8');
  assert.ok(actionsSrc.includes('window.initBnavKeyboardNav'), 'init() must call initBnavKeyboardNav');
});
```

Append to `tests/html.test.js`:

```js
test('focus-visible and reduced-motion polish present', () => {
  assert.ok(css.includes(':focus-visible'), 'focus-visible rings missing');
  assert.ok(css.includes('prefers-reduced-motion'), 'reduced-motion guard missing');
  assert.ok(css.includes('.deed-card { flex: 1 1 calc(50% - 8px)') || css.includes('grid-template-columns: repeat(2, 1fr)'), 'desktop 2-col grid missing');
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/app-registry.test.js tests/html.test.js`
Expected: FAIL.

- [ ] **Step 3: Add initBnavKeyboardNav to render/tabs.js**

Insert after `initTier2TabKeyboardNav` (before the `window._pushTabState` exports at line 292):

```js
  function initBnavKeyboardNav() {
    var bnav = document.getElementById('bnav');
    if (!bnav) return;
    bnav.addEventListener('keydown', function(e) {
      var tabs = Array.from(bnav.querySelectorAll('.bnav-btn'));
      if (tabs.length === 0) return;
      var currentIndex = tabs.findIndex(function(t) { return t.classList.contains('active'); });
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        var nextIndex = (currentIndex + 1) % tabs.length;
        tabs[nextIndex].focus();
        tabs[nextIndex].click();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        var prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        tabs[prevIndex].focus();
        tabs[prevIndex].click();
      } else if (e.key === 'Home') {
        e.preventDefault();
        tabs[0].focus();
        tabs[0].click();
      } else if (e.key === 'End') {
        e.preventDefault();
        tabs[tabs.length - 1].focus();
        tabs[tabs.length - 1].click();
      }
    });
  }
```

Add to the exports block:

```js
  window.initBnavKeyboardNav = initBnavKeyboardNav;
```

- [ ] **Step 4: Wire into init()**

In `core/actions.js`, near line 327-328 (after `initTierTabKeyboardNav` / `initTier2TabKeyboardNav` calls), add:

```js
    try { window.initBnavKeyboardNav(); } catch(e) { console.error('Step 8c bnav keyboard nav failed:', e); }
```

- [ ] **Step 5: Add visual polish CSS**

Append to `styles/main.css`:

```css
/* ── Visual Polish: focus rings, reduced motion, responsive grids ── */
a:focus-visible, button:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible, [tabindex]:focus-visible {
  outline: 2px solid var(--gold);
  outline-offset: 2px;
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }
}
@media (min-width: 768px) {
  .hero-strip .header { padding: 26px 0 10px; }
  .hero-strip .level-row { margin: 14px auto 18px; }
  .hero-strip .streak-bar { margin-bottom: 18px; }
  #deedArea { flex-direction: row !important; flex-wrap: wrap; }
  #deedArea .deed-card { flex: 1 1 calc(50% - 8px); }
  #prayerArea { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
}
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `node --test tests/html.test.js tests/app-registry.test.js`
Expected: PASS. Then full suite: `node --test tests/*.test.js` — expect 311 pass.

- [ ] **Step 7: Headless Chrome desktop check**

Run `node C:\Users\Mahin\AppData\Local\Temp\opencode\cdp_clicks.js` (desktop) and confirm all categories switch, all panels have content, no errors.

- [ ] **Step 8: Commit**

```bash
git add render/tabs.js core/actions.js styles/main.css tests/app-registry.test.js tests/html.test.js
git commit -m "feat: bottom nav keyboard support, focus-visible rings, reduced-motion, desktop grids"
```

---

### Task 5: Final verification pass

**Files:**
- Test: run full suite + headless Chrome at both viewports
- Modify: only fix regressions found (no planned changes)

**Interfaces:**
- Consumes: everything from Tasks 1-4.

- [ ] **Step 1: Run full test suite**

Run: `node --test tests/*.test.js`
Expected: 311 pass, 0 fail.

- [ ] **Step 2: Mobile layout verification (390×844)**

Run server then `node C:\Users\Mahin\AppData\Local\Temp\opencode\cdp_dev.js`.
Check: fold ratio < 75%, `.t1-btn` width ≈ 92-100px, `#bnav` visible with 5 buttons, `#deedArea`/`#prayerArea` single column, no horizontal overflow, zero console errors.

- [ ] **Step 3: Desktop layout verification (≥768px)**

Run `node C:\Users\Mahin\AppData\Local\Temp\opencode\cdp_viewports.js` with a `min-width:768px` emulation (or `--window-size=1280,900`).
Check: `#bnav` hidden, `.tier1-tabs` grid visible and buttons correct width, `#prayerArea`/`#deedArea` 2-column, no console errors.

- [ ] **Step 4: Interaction smoke test**

Run `node C:\Users\Mahin\AppData\Local\Temp\opencode\cdp_clicks.js`.
Check: every category and every tab activates its own panel; `EMPTY/BROKEN TABS: NONE`; `ERRORS: NONE`.

- [ ] **Step 5: Fix any regressions and re-verify**

If any check fails, fix the offending file, re-run Steps 1-4 until green.

- [ ] **Step 6: Commit any fixes**

```bash
git add -A
git commit -m "chore: final verification fixes for app-shell redesign"
```

---

## Self-Review

**Spec coverage:**
- Fix broken t1 nav → Task 1.
- Compact hero above fold → Task 2.
- Mobile bottom nav → Task 3.
- Desktop top nav + show/hide → Task 3 CSS (`@media (min-width: 768px) .bnav { display:none }`) + Task 4 grids.
- Visual polish (focus rings, reduced motion) → Task 4.
- Desktop/tablet 2-col → Task 4.
- All 306 tests pass → every task runs the suite; Task 5 is a final gate.

**Placeholder scan:** No TBD/TODO; every step has concrete code.

**Type consistency:** `switchCategory(catId, btn)` signature unchanged; `initBnavKeyboardNav` defined/exported/wired consistently; `.bnav-btn` class name used consistently across markup, CSS, and JS.