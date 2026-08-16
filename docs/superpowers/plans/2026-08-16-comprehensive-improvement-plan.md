# Ibadah Quest Comprehensive Improvement — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split monolithic modules into focused files, add functional tests, fix accessibility, optimize performance, and add URL routing.

**Architecture:** Break `core/actions.js` (2,601 lines) into 8 domain modules and `render/render.js` (1,661 lines) into 5 rendering modules. Each module is an IIFE exposing to `window` (matching existing pattern). No ES modules or bundler. Tests use Node.js built-in test runner with existing `tests/helpers/load.js`.

**Tech Stack:** Vanilla JavaScript, localStorage, Node.js test runner, CSS custom properties

## Global Constraints

- No ES modules or bundler — keep `<script>` tag approach
- All existing `window.*` APIs remain identical after refactoring
- `S` global state and `saveState()` stay in `state/state.js`
- Each new module is an IIFE exposing functions to `window`
- Tests use `node --test tests/*.test.js` (existing test runner)
- Follow existing code style: no comments, compact formatting, `var`/`let`/`const` mix

---

## Phase 1: Architecture Split

### Task 1: Extract NEW_POOLS data to `data/pools/new-pools.js`

**Files:**
- Create: `data/pools/new-pools.js`
- Modify: `core/actions.js:308-1600` (remove NEW_POOLS definition)
- Modify: `index.html:365` (add script tag for new-pools.js)

**Interfaces:**
- Consumes: nothing
- Produces: `window.NEW_POOLS` object (same as current inline definition)

- [ ] **Step 1: Read the full NEW_POOLS object from actions.js**

Read `core/actions.js` from line 308 to find the end of the `NEW_POOLS` object. It contains keys: umayyads, abbasids, andalus, ottomans, mamluks, seljuks, fatimids, ayyubids, plus additional pools defined later in the file (purification, salahrules, zakatrules, etc.).

- [ ] **Step 2: Create `data/pools/new-pools.js`**

```javascript
// data/pools/new-pools.js — extracted from core/actions.js
const NEW_POOLS = {
  // ... copy the entire NEW_POOLS object from actions.js ...
};
```

Copy the exact object from `actions.js` line 308 through the closing `};` of NEW_POOLS.

- [ ] **Step 3: Remove NEW_POOLS from actions.js**

Delete the `const NEW_POOLS = { ... };` block from `core/actions.js`. The references to `NEW_POOLS` in `refreshContent()` and `manualRefreshContent()` will now resolve from the global scope via the script tag.

- [ ] **Step 4: Add script tag to index.html**

In `index.html`, add before the state script (line 424):
```html
<script src="data/pools/new-pools.js?v=1"></script>
```

Place it after the other content pool scripts (after line 421, before line 423).

- [ ] **Step 5: Run existing tests**

Run: `node --test tests/*.test.js`
Expected: All tests pass (NEW_POOLS is now a global from script tag, same as other pools)

- [ ] **Step 6: Commit**

```bash
git add data/pools/new-pools.js core/actions.js index.html
git commit -m "refactor: extract NEW_POOLS data to data/pools/new-pools.js"
```

---

### Task 2: Create `core/xp.js` — XP and level-up logic

**Files:**
- Create: `core/xp.js`
- Modify: `core/actions.js` (remove functions, keep imports)
- Modify: `index.html` (add script tag)

**Interfaces:**
- Consumes: `S` (global state), `saveState()`, `lvFrom()`, `today()` from state.js, `iqIcon()` from icons.js
- Produces: `window.grantDailyXp(amount, key)`, `window.grantCappedDailyXp(amount, key, cap)`, `window.checkLevelUp(oldLv)`, `window.levelUpToast(lv, title)`, `window.playSound(type)`

- [ ] **Step 1: Create `core/xp.js` with extracted functions**

```javascript
// core/xp.js — XP granting, level-up detection, sound effects
(function() {
  function checkLevelUp(oldLv) {
    if (S.lv > oldLv) {
      const t = lvTitle(S.lv);
      levelUpToast(S.lv, t);
    }
  }

  function grantDailyXp(amount, key) {
    if (!S.xpDaily) S.xpDaily = {};
    var dk = key + '|' + today();
    if (S.xpDaily[dk]) return false;
    S.xpDaily[dk] = true;
    var oldLv = S.lv;
    S.xp += amount;
    S.lv = lvFrom(S.xp);
    checkLevelUp(oldLv);
    playSound('pop');
    saveState();
    if (typeof renderLv === 'function') renderLv();
    if (typeof renderTopBar === 'function') renderTopBar();
    return true;
  }

  function grantCappedDailyXp(amount, key, cap) {
    if (!S.xpDaily) S.xpDaily = {};
    var ck = key + '|count|' + today();
    var count = S.xpDaily[ck] || 0;
    if (count >= cap) return false;
    S.xpDaily[ck] = count + 1;
    var oldLv = S.lv;
    S.xp += amount;
    S.lv = lvFrom(S.xp);
    checkLevelUp(oldLv);
    playSound('pop');
    saveState();
    if (typeof renderLv === 'function') renderLv();
    if (typeof renderTopBar === 'function') renderTopBar();
    return true;
  }

  function levelUpToast(lv, title) {
    _modalTriggerEl = document.activeElement;
    const ov = document.getElementById('toastOverlay');
    ov.innerHTML = `<div class="levelup-box"><div class="levelup-glow"></div><div class="levelup-icon">${iqIcon('zap')}</div><div class="levelup-label">LEVEL UP</div><div class="levelup-num">${lv}</div><div class="levelup-title">${title}</div></div>`;
    ov.style.display = 'flex';
    ov.classList.add('show');
    ov.style.pointerEvents = 'auto';
    playSound('chime');
    for (let i = 0; i < 50; i++) {
      const el = document.createElement('span');
      el.className = 'confetti';
      el.textContent = [iqEmoji('star'), iqEmoji('sparkles'), iqEmoji('moon'), iqEmoji('sparkles'), iqEmoji('star'), iqEmoji('crescent')][i % 6];
      el.style.left = Math.random() * 100 + '%';
      el.style.top = '-20px';
      el.style.setProperty('--fall-dur', (2 + Math.random() * 4) + 's');
      el.style.setProperty('--rot', (Math.random() * 720 - 360) + 'deg');
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 4000);
    }
    if (ov._t) clearTimeout(ov._t);
    ov._t = setTimeout(() => {
      ov.classList.remove('show');
      setTimeout(() => { ov.style.display = 'none'; ov.innerHTML = ''; }, 400);
      ov.style.pointerEvents = 'none';
    }, 4000);
    ov.onclick = () => {
      ov.classList.remove('show');
      setTimeout(() => { ov.style.display = 'none'; ov.innerHTML = ''; }, 400);
      ov.style.pointerEvents = 'none';
      if (ov._t) clearTimeout(ov._t);
    };
  }

  let _audioCtx = null;
  function playSound(type) {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!_audioCtx) _audioCtx = new AC();
      const ctx = _audioCtx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      if (type === 'pop') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.5, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.1);
      } else if (type === 'chime') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.8);
      }
    } catch (e) {}
  }

  window.grantDailyXp = grantDailyXp;
  window.grantCappedDailyXp = grantCappedDailyXp;
  window.checkLevelUp = checkLevelUp;
  window.levelUpToast = levelUpToast;
  window.playSound = playSound;
})();
```

- [ ] **Step 2: Remove these functions from actions.js**

Remove: `checkLevelUp` (line 38), `grantDailyXp` (lines 39-52), `grantCappedDailyXp` (lines 54-69), `levelUpToast` (lines 88-98), `playSound` (lines 109-112), and the `_audioCtx` variable (line 109).

- [ ] **Step 3: Add script tag to index.html**

Add before `core/actions.js`:
```html
<script src="core/xp.js?v=1"></script>
```

- [ ] **Step 4: Run tests**

Run: `node --test tests/*.test.js`
Expected: All tests pass

- [ ] **Step 5: Commit**

```bash
git add core/xp.js core/actions.js index.html
git commit -m "refactor: extract XP/level-up/sound logic to core/xp.js"
```

---

### Task 3: Create `core/themes.js` — Theme management

**Files:**
- Create: `core/themes.js`
- Modify: `core/actions.js` (remove functions)
- Modify: `index.html` (add script tag)

**Interfaces:**
- Consumes: `S`, `saveState()`, `renderTab()`, `updateTopBar()` from render.js
- Produces: `window.applyTheme()`, `window.setTheme(name)`, `window.toggleTheme()`

- [ ] **Step 1: Create `core/themes.js`**

```javascript
// core/themes.js — Theme switching and CSS variable application
(function() {
  const THEME_KEY = 'iqTheme';

  function isValidTheme(t) {
    try { return t && (window.Themes || []).some(m => m.key === t); } catch (e) { return t === 'light'; }
  }

  function updateMeta() {
    try {
      const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
      if (bg) document.querySelector('meta[name="theme-color"]').setAttribute('content', bg);
    } catch (e) {}
  }

  function applyTheme() {
    try {
      const t = (S && S.theme) || localStorage.getItem(THEME_KEY) || 'light';
      const safe = isValidTheme(t) ? t : 'light';
      if (safe === 'light') document.documentElement.removeAttribute('data-theme');
      else document.documentElement.setAttribute('data-theme', safe);
      updateMeta();
    } catch (e) {}
  }

  function setTheme(name) {
    const theme = isValidTheme(name) ? name : 'light';
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
    if (theme === 'light') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', theme);
    if (S) { S.theme = theme; saveState(); }
    updateMeta();
    updateTopBar();
    const activePanel = document.querySelector('.tab-panel.active');
    const tab = activePanel ? activePanel.id.replace('panel-', '') : 'home';
    renderTab(tab);
  }

  function toggleTheme() {
    const themes = ['light', 'serene', 'royal', 'sand', 'midnight', 'cream', 'emara'];
    const current = localStorage.getItem(THEME_KEY) || 'light';
    const idx = themes.indexOf(current);
    const next = themes[(idx + 1) % themes.length];
    setTheme(next);
  }

  window.applyTheme = applyTheme;
  window.setTheme = setTheme;
  window.toggleTheme = toggleTheme;
})();
```

- [ ] **Step 2: Remove theme functions from actions.js**

Remove: `THEME_KEY` (line 3), `isValidTheme` (lines 4-6), `updateMeta` (lines 7-9), `applyTheme` (lines 10-18), `setTheme` (lines 19-30), `toggleTheme` (lines 31-37).

- [ ] **Step 3: Add script tag to index.html**

Add before `core/xp.js`:
```html
<script src="core/themes.js?v=1"></script>
```

- [ ] **Step 4: Run tests**

Run: `node --test tests/*.test.js`
Expected: All tests pass

- [ ] **Step 5: Commit**

```bash
git add core/themes.js core/actions.js index.html
git commit -m "refactor: extract theme management to core/themes.js"
```

---

### Task 4: Create `core/prayers.js` — Prayer/deed toggling and streak recalculation

**Files:**
- Create: `core/prayers.js`
- Modify: `core/actions.js` (remove functions)
- Modify: `index.html` (add script tag)

**Interfaces:**
- Consumes: `S`, `tlog()`, `today()`, `saveState()`, `isFri()`, `lvFrom()`, `checkLevelUp()` (from xp.js), `checkQ()` (from quests.js), `checkA()` (from achievements.js), `renderDynamic()`, `PRAYERS`, `VOLUNTARY`, `DEEDS` data arrays
- Produces: `window.toggleP(id)`, `window.toggleV(id)`, `window.toggleD(id)`, `window.recalc()`

- [ ] **Step 1: Create `core/prayers.js`**

Extract lines 70-72 and 129 from actions.js. The `toggleP` function is on line 70, `toggleV` on line 71, `toggleD` on line 72, and `recalc` on line 129.

```javascript
// core/prayers.js — Prayer, voluntary prayer, and deed toggling
(function() {
  function toggleP(id) {
    const l = tlog();
    const w = !!l.p[id];
    const oldLv = S.lv;
    l.p[id] = !w;
    const pr = PRAYERS.find(x => x.id === id);
    if (!pr) return;
    let xp = pr.xp;
    if (isFri() && id === 'dhuhr' && pr.fri) xp = pr.fri.xp;
    if (S.ab && S.ab.exp >= today()) xp *= 2;
    if (!w) {
      S.tp++;
      S.xp += xp;
      if (isFri() && id === 'dhuhr') S.tj = (S.tj || 0) + 1;
      playSound('pop');
      if (typeof checkSurpriseReward === 'function') checkSurpriseReward('prayer');
    } else {
      S.tp = Math.max(0, S.tp - 1);
      S.xp = Math.max(0, S.xp - xp);
      if (isFri() && id === 'dhuhr') S.tj = Math.max(0, (S.tj || 0) - 1);
    }
    S.lv = lvFrom(S.xp);
    checkLevelUp(oldLv);
    recalc();
    checkQ();
    checkA();
    saveState();
    renderDynamic();
    if (typeof checkCombo === 'function') {
      const prayedFajr = !!l.p.fajr;
      const prayedAll = Object.values(l.p || {}).filter(v => v).length >= 5;
      if (prayedFajr) checkCombo('fajr', true);
      if (prayedAll) checkCombo('adhkar', true);
    }
  }

  function toggleV(id) {
    const l = tlog();
    if (!l.v) l.v = {};
    const w = !!l.v[id];
    const oldLv = S.lv;
    l.v[id] = !w;
    const vp = VOLUNTARY.find(x => x.id === id);
    if (!vp) return;
    let xp = vp.xp;
    if (S.ab && S.ab.exp >= today()) xp *= 2;
    if (!w) {
      S.vc[id] = (S.vc[id] || 0) + 1;
      S.xp += xp;
      playSound('pop');
    } else {
      S.vc[id] = Math.max(0, (S.vc[id] || 0) - 1);
      S.xp = Math.max(0, S.xp - xp);
    }
    S.lv = lvFrom(S.xp);
    checkLevelUp(oldLv);
    checkQ();
    checkA();
    saveState();
    renderDynamic();
  }

  function toggleD(id) {
    const l = tlog();
    const w = !!l.d[id];
    const oldLv = S.lv;
    l.d[id] = !w;
    const de = DEEDS.find(x => x.id === id);
    if (!de) return;
    let xp = de.xp;
    if (S.ab && S.ab.exp >= today()) xp *= 2;
    if (!w) {
      S.td[id] = (S.td[id] || 0) + 1;
      S.xp += xp;
      playSound('pop');
    } else {
      S.td[id] = Math.max(0, (S.td[id] || 0) - 1);
      S.xp = Math.max(0, S.xp - xp);
    }
    S.lv = lvFrom(S.xp);
    checkLevelUp(oldLv);
    recalc();
    checkQ();
    checkA();
    saveState();
    renderDynamic();
  }

  function recalc() {
    const all = Object.keys(S.log).filter(d => Object.values(S.log[d].p || {}).filter(v => v).length >= 5).sort();
    let best = 0, run = 0, prev = null;
    for (const d of all) {
      if (prev) {
        const p = new Date(prev + 'T00:00:00');
        const c = new Date(d + 'T00:00:00');
        const diffDays = Math.round((c - p) / 86400000);
        if (diffDays === 1) run++;
        else run = 1;
      } else {
        run = 1;
      }
      best = Math.max(best, run);
      prev = d;
    }
    S.bs = best;
    const tc = Object.values(tlog().p || {}).filter(v => v).length >= 5;
    if (tc) {
      let s = 1, ck = new Date();
      while (true) {
        ck.setDate(ck.getDate() - 1);
        const dk = today(ck);
        if (S.log[dk] && Object.values(S.log[dk].p || {}).filter(v => v).length >= 5) s++;
        else break;
      }
      S.cs = s;
      if (typeof checkSurpriseReward === 'function') checkSurpriseReward('allPrayers');
    } else {
      const yd = today(new Date(Date.now() - 86400000));
      S.cs = (S.log[yd] && Object.values(S.log[yd].p || {}).filter(v => v).length >= 5) ? 1 : 0;
    }
    S.pd = all.length;
    if (S.cs > S.bs) S.bs = S.cs;
    if (window.checkMilestones) checkMilestones();
  }

  window.toggleP = toggleP;
  window.toggleV = toggleV;
  window.toggleD = toggleD;
  window.recalc = recalc;
})();
```

- [ ] **Step 2: Remove these functions from actions.js**

Remove: `toggleP` (line 70), `toggleV` (line 71), `toggleD` (line 72), `recalc` (line 129).

- [ ] **Step 3: Add script tag to index.html**

Add after `core/xp.js`:
```html
<script src="core/prayers.js?v=1"></script>
```

- [ ] **Step 4: Run tests**

Run: `node --test tests/*.test.js`
Expected: All tests pass

- [ ] **Step 5: Commit**

```bash
git add core/prayers.js core/actions.js index.html
git commit -m "refactor: extract prayer/deed toggling to core/prayers.js"
```

---

### Task 5: Create `core/quests.js` — Quest generation and completion

**Files:**
- Create: `core/quests.js`
- Modify: `core/actions.js` (remove functions)
- Modify: `index.html` (add script tag)

**Interfaces:**
- Consumes: `S`, `tlog()`, `today()`, `ws()`, `ms()`, `ys()`, `saveState()`, `lvFrom()`, `checkLevelUp()`, `checkA()`, `renderDynamic()`, `renderQ()`, `DQUESTS`, `WQUESTS`, `MQUESTS`, `YQUESTS`, `LQUESTS` data arrays
- Produces: `window.genDQ()`, `window.genWQ()`, `window.genMQ()`, `window.genYQ()`, `window.genLQ()`, `window.checkQ()`, `window.toggleQuest(id, type, xp)`

- [ ] **Step 1: Create `core/quests.js`**

Extract lines 113-128 from actions.js.

- [ ] **Step 2: Remove functions from actions.js**

- [ ] **Step 3: Add script tag to index.html** (after core/prayers.js)

- [ ] **Step 4: Run tests** — `node --test tests/*.test.js`

- [ ] **Step 5: Commit**

```bash
git add core/quests.js core/actions.js index.html
git commit -m "refactor: extract quest logic to core/quests.js"
```

---

### Task 6: Create `core/achievements.js` — Achievement checking

**Files:**
- Create: `core/achievements.js`
- Modify: `core/actions.js` (remove checkA)
- Modify: `index.html` (add script tag)

**Interfaces:**
- Consumes: `S`, `ACHS`, `today()`, `saveState()`, `renderAll()`, `iqIcon()`, `toast()`
- Produces: `window.checkA()`

- [ ] **Step 1: Create `core/achievements.js`**

Extract lines 74-87 from actions.js.

- [ ] **Step 2: Remove checkA from actions.js**

- [ ] **Step 3: Add script tag to index.html** (after core/quests.js)

- [ ] **Step 4: Run tests** — `node --test tests/*.test.js`

- [ ] **Step 5: Commit**

```bash
git add core/achievements.js core/actions.js index.html
git commit -m "refactor: extract achievement checking to core/achievements.js"
```

---

### Task 7: Create `core/shop.js` — Shop purchase logic

**Files:**
- Create: `core/shop.js`
- Modify: `core/actions.js` (remove buy function)
- Modify: `index.html` (add script tag)

**Interfaces:**
- Consumes: `S`, `SHOP`, `today()`, `saveState()`, `lvFrom()`, `checkLevelUp()`, `checkA()`, `renderAll()`, `toast()`, `iqIcon()`, `genDQ()`, `getSeasonalMultiplier()`
- Produces: `window.buy(id)`

- [ ] **Step 1: Create `core/shop.js`**

Extract line 73 from actions.js (the `buy` function — it's a very long function on a single line).

- [ ] **Step 2: Remove buy from actions.js**

- [ ] **Step 3: Add script tag to index.html** (after core/achievements.js)

- [ ] **Step 4: Run tests** — `node --test tests/*.test.js`

- [ ] **Step 5: Commit**

```bash
git add core/shop.js core/actions.js index.html
git commit -m "refactor: extract shop purchase logic to core/shop.js"
```

---

### Task 8: Create `core/dhikr.js` — Dhikr counter logic

**Files:**
- Create: `core/dhikr.js`
- Modify: `core/actions.js` (remove functions)
- Modify: `index.html` (add script tag)

**Interfaces:**
- Consumes: `S`, `today()`, `saveState()`, `lvFrom()`, `checkLevelUp()`, `DHIKR_COUNTER_DATA`, `DHIKR_BADGES`, `toast()`, `iqIcon()`
- Produces: `window.tapDhikr()`, `window.resetDhikr()`, `window.nextDhikr()`, `window.addCustomDhikr(arabic, roman, english, target)`, `window.removeCustomDhikr(id)`, `window.toggleDhikrFavorite(id)`

- [ ] **Step 1: Create `core/dhikr.js`**

Extract lines 196-297 from actions.js (the dhikr functions).

- [ ] **Step 2: Remove dhikr functions from actions.js**

- [ ] **Step 3: Add script tag to index.html** (after core/shop.js)

- [ ] **Step 4: Run tests** — `node --test tests/*.test.js`

- [ ] **Step 5: Commit**

```bash
git add core/dhikr.js core/actions.js index.html
git commit -m "refactor: extract dhikr counter logic to core/dhikr.js"
```

---

### Task 9: Create `core/content.js` — Content pool refresh and lazy loading

**Files:**
- Create: `core/content.js`
- Modify: `core/actions.js` (remove functions)
- Modify: `index.html` (add script tag)

**Interfaces:**
- Consumes: `S`, `today()`, `saveState()`, `fastRng()`, `toast()`, `iqIcon()`, `renderAll()`, content pool globals (DUA_POOL, QURAN_POOL, etc.), `NEW_POOLS`
- Produces: `window.refreshContent()`, `window.manualRefreshContent()`, `window.ensureQuranLoaded()`, `window.ensureHadithLoaded()`

- [ ] **Step 1: Create `core/content.js`**

Extract lines 130-179 from actions.js (loadScript, ensureQuranLoaded, ensureHadithLoaded, refreshContent, manualRefreshContent).

- [ ] **Step 2: Remove content functions from actions.js**

- [ ] **Step 3: Add script tag to index.html** (after core/dhikr.js)

- [ ] **Step 4: Run tests** — `node --test tests/*.test.js`

- [ ] **Step 5: Commit**

```bash
git add core/content.js core/actions.js index.html
git commit -m "refactor: extract content pool refresh to core/content.js"
```

---

### Task 10: Gut `core/actions.js` to glue only

**Files:**
- Modify: `core/actions.js` (remove all extracted functions, keep glue)

**Interfaces:**
- Consumes: all new modules via `window.*`
- Produces: `window.App` object, `toast()`, `switchUser()`, `resetAll()`, `claimBonus()`, `initApp()`, `init()`

- [ ] **Step 1: Verify what remains in actions.js**

After tasks 1-9, actions.js should contain only:
- `toast()` function (lines 99-108) — shared utility
- `switchUser()` / `logout()` / `resetAll()` (lines 181-194)
- `claimBonus()` (line 195)
- `initTierTabKeyboardNav()` and related keyboard nav functions
- `initApp()` (lines 2505-2544)
- `init()` (lines 2546-2600)
- `window.App` export object (lines 2572-2595)
- Profile functions: `selectAvatar`, `selectTitle`, `selectFrame` (lines 298-306)
- Various modal keyboard handlers

- [ ] **Step 2: Remove any remaining extracted functions**

Double-check that functions moved to new modules are fully removed.

- [ ] **Step 3: Run tests** — `node --test tests/*.test.js`
Expected: All tests pass

- [ ] **Step 4: Commit**

```bash
git add core/actions.js
git commit -m "refactor: gut actions.js to glue code only"
```

---

### Task 11: Split `render/render.js` into focused modules

**Files:**
- Create: `render/calendar.js` (~100 lines: hijri calendar conversion)
- Create: `render/prayers.js` (~150 lines: renderPrayers, renderVol, renderDeeds, renderPrayerTimes)
- Create: `render/static.js` (~100 lines: renderStatic and all static content renderers)
- Create: `render/dynamic.js` (~80 lines: renderDynamic, renderToday, renderLv, renderStr, renderTopBar)
- Create: `render/tabs.js` (~80 lines: renderTab, switchCategory, tab navigation)
- Modify: `render/render.js` (keep as barrel — re-exports or becomes minimal)
- Modify: `index.html` (add script tags)

**Interfaces:**
- Consumes: `S`, state helpers, content pool globals
- Produces: Same `window.render*` functions as before

- [ ] **Step 1: Create `render/calendar.js`**

Extract the hijri calendar functions (lines 46-80 of render.js): `HIJRI_MONTHS`, `HIJRI_MONTHS_AR`, `WEEKDAYS_*`, `gregorianToHijri`, `hijriToGregorian`, and any calendar rendering functions.

- [ ] **Step 2: Create `render/prayers.js`**

Extract: `renderPrayers`, `renderVol`, `renderDeeds`, `renderPrayerTimes`, `renderTimer` from render.js.

- [ ] **Step 3: Create `render/static.js`**

Extract: `renderStatic` and all the individual static render functions it calls (renderQuran, renderSunnahs, renderDhikr, renderStories, renderHadith, renderNames, etc.).

- [ ] **Step 4: Create `render/dynamic.js`**

Extract: `renderDynamic`, `renderToday`, `renderLv`, `renderStr`, `renderTopBar`, `renderAll`.

- [ ] **Step 5: Create `render/tabs.js`**

Extract: `renderTab`, `switchCategory`, `selectCategory`, `activateTab`, `switchTab`.

- [ ] **Step 6: Update `render/render.js` to be a minimal barrel**

`render.js` should either be empty or just load the other render modules. Since we're using `<script>` tags, it can be a near-empty file or removed.

- [ ] **Step 7: Add script tags to index.html**

Add before `core/actions.js`:
```html
<script src="render/calendar.js?v=1"></script>
<script src="render/prayers.js?v=1"></script>
<script src="render/static.js?v=1"></script>
<script src="render/dynamic.js?v=1"></script>
<script src="render/tabs.js?v=1"></script>
```

- [ ] **Step 8: Run tests** — `node --test tests/*.test.js`

- [ ] **Step 9: Commit**

```bash
git add render/ index.html
git commit -m "refactor: split render.js into calendar/prayers/static/dynamic/tabs modules"
```

---

## Phase 2: Test Coverage

### Task 12: Create `tests/xp.test.js`

**Files:**
- Create: `tests/xp.test.js`
- Modify: `tests/helpers/load.js` (add mock for `lvTitle`)

**Interfaces:**
- Consumes: `core/xp.js` via `loadFile()`
- Produces: Test results

- [ ] **Step 1: Update `tests/helpers/load.js` to support xp.js dependencies**

Add `lvTitle: () => 'Seeker'` and `iqEmoji: () => ''` to the default sandbox overrides.

- [ ] **Step 2: Write failing tests for grantDailyXp**

```javascript
'use strict';
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { loadFile } = require('./helpers/load');

function setupState(overrides) {
  const sandbox = loadFile('../state/state.js');
  const S = sandbox.window.freshState();
  Object.assign(S, overrides || {});
  sandbox.window.S = S;
  sandbox.window.saveState = () => {};
  return sandbox;
}

describe('grantDailyXp', () => {
  it('grants XP and returns true on first call', () => {
    const ctx = setupState({ xp: 0, lv: 1, xpDaily: {} });
    loadFile('../core/xp.js', ctx);
    const result = ctx.window.grantDailyXp(50, 'test');
    assert.equal(result, true);
    assert.equal(ctx.window.S.xp, 50);
  });

  it('returns false on duplicate key same day', () => {
    const ctx = setupState({ xp: 0, lv: 1, xpDaily: { 'test|2026-08-16': true } });
    loadFile('../core/xp.js', ctx);
    const result = ctx.window.grantDailyXp(50, 'test');
    assert.equal(result, false);
    assert.equal(ctx.window.S.xp, 0);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `node --test tests/xp.test.js`
Expected: FAIL (functions not yet defined in the test context)

- [ ] **Step 4: Run test to verify it passes after implementation**

Run: `node --test tests/xp.test.js`
Expected: PASS

- [ ] **Step 5: Add tests for grantCappedDailyXp, lvFrom, xpFor**

Add more test cases in the same file.

- [ ] **Step 6: Run full test suite**

Run: `node --test tests/*.test.js`
Expected: All tests pass

- [ ] **Step 7: Commit**

```bash
git add tests/xp.test.js tests/helpers/load.js
git commit -m "test: add XP/grantDailyXp/grantCappedDailyXp tests"
```

---

### Task 13: Create `tests/prayers.test.js`

**Files:**
- Create: `tests/prayers.test.js`

- [ ] **Step 1: Write tests for toggleP**

Test: pray Fajr → XP increases, toggle again → XP decreases, streak recalculates.

- [ ] **Step 2: Write tests for toggleV and toggleD**

- [ ] **Step 3: Run tests** — `node --test tests/prayers.test.js`

- [ ] **Step 4: Commit**

```bash
git add tests/prayers.test.js
git commit -m "test: add prayer/voluntary/deed toggle tests"
```

---

### Task 14: Create `tests/quests.test.js`

**Files:**
- Create: `tests/quests.test.js`

- [ ] **Step 1: Write tests for genDQ**

Test: generates 4 quests, doesn't regenerate same day, shuffles order.

- [ ] **Step 2: Write tests for checkQ**

Test: complete a quest condition → XP granted, quest marked done.

- [ ] **Step 3: Write tests for toggleQuest**

- [ ] **Step 4: Run tests** — `node --test tests/quests.test.js`

- [ ] **Step 5: Commit**

```bash
git add tests/quests.test.js
git commit -m "test: add quest generation and completion tests"
```

---

### Task 15: Create remaining test files

**Files:**
- Create: `tests/achievements.test.js`
- Create: `tests/themes.test.js`
- Create: `tests/dhikr.test.js`
- Create: `tests/content.test.js`
- Expand: `tests/shop.test.js`

- [ ] **Step 1: Write achievements.test.js** — checkA unlocks, no double-unlock

- [ ] **Step 2: Write themes.test.js** — setTheme/toggleTheme/applyTheme

- [ ] **Step 3: Write dhikr.test.js** — tapDhikr count, target reset, custom dhikr

- [ ] **Step 4: Write content.test.js** — refreshContent new day detection

- [ ] **Step 5: Expand shop.test.js** — buy with enough/not enough XP, mystery box

- [ ] **Step 6: Run full test suite** — `node --test tests/*.test.js`

- [ ] **Step 7: Commit**

```bash
git add tests/achievements.test.js tests/themes.test.js tests/dhikr.test.js tests/content.test.js tests/shop.test.js
git commit -m "test: add achievement, theme, dhikr, content, and expanded shop tests"
```

---

### Task 16: Create `tests/integration.test.js`

**Files:**
- Create: `tests/integration.test.js`

- [ ] **Step 1: Write smoke test: init → pray → XP → level**

```javascript
'use strict';
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { loadFile } = require('./helpers/load');

describe('Integration: full flow', () => {
  it('init → pray Fajr → check XP → check level', () => {
    const ctx = loadFile('../state/state.js');
    const S = ctx.window.freshState();
    ctx.window.S = S;
    ctx.window.saveState = () => {};
    loadFile('../core/xp.js', ctx);
    loadFile('../core/prayers.js', ctx);
    // Mock dependencies
    ctx.window.recalc = () => {};
    ctx.window.checkQ = () => {};
    ctx.window.checkA = () => {};
    ctx.window.renderDynamic = () => {};
    ctx.window.checkCombo = () => {};
    ctx.window.PRAYERS = [{ id: 'fajr', xp: 10 }];
    ctx.window.checkSurpriseReward = () => {};

    ctx.window.toggleP('fajr');
    assert.ok(S.xp > 0, 'XP should increase after praying');
    assert.ok(S.tp > 0, 'Total prayers should increase');
  });
});
```

- [ ] **Step 2: Run test** — `node --test tests/integration.test.js`

- [ ] **Step 3: Run full suite** — `node --test tests/*.test.js`

- [ ] **Step 4: Commit**

```bash
git add tests/integration.test.js
git commit -m "test: add integration smoke test for init → pray → XP flow"
```

---

## Phase 3: Accessibility

### Task 17: Add ARIA labels to icons and interactive elements

**Files:**
- Modify: `data/icons.js` (add `role="img"` and `aria-label` to iqIcon output)
- Modify: `styles/main.css` (add focus-visible styles)

- [ ] **Step 1: Update iqIcon to include ARIA attributes**

In `data/icons.js`, find the `iqIcon` function. Each icon is an `<img>` tag. Add `role="img"` and `aria-label` based on the icon name parameter.

- [ ] **Step 2: Add :focus-visible styles to main.css**

```css
:focus-visible {
  outline: 2px solid var(--gold);
  outline-offset: 2px;
  border-radius: 4px;
}
```

- [ ] **Step 3: Remove `user-select: none` from body**

In `styles/main.css` or `index.html` inline styles, remove `user-select: none` from the body rule. Keep it on `.t1-btn`, `.t2-btn`, `.fab-main` only.

- [ ] **Step 4: Run tests** — `node --test tests/*.test.js`

- [ ] **Step 5: Commit**

```bash
git add data/icons.js styles/main.css index.html
git commit -m "a11y: add ARIA labels to icons, focus-visible styles, allow text selection"
```

---

### Task 18: Add keyboard navigation to cards and FAB

**Files:**
- Modify: `styles/main.css` (add tabindex styles)
- Modify: `render/render.js` or relevant render files (add tabindex + keydown handlers)
- Modify: `features/fab.js` (add keyboard support)

- [ ] **Step 1: Add tabindex="0" to card elements in render functions**

In render functions that output `.card-item`, `.vol-card`, `.shop-card` elements, add `tabindex="0"` and `role="button"`.

- [ ] **Step 2: Add keydown handlers for Enter/Space activation**

Add event delegation in `core/actions.js` init():
```javascript
document.addEventListener('keydown', (e) => {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.card-item, .vol-card, .shop-card')) {
    e.preventDefault();
    e.target.click();
  }
});
```

- [ ] **Step 3: Add FAB keyboard navigation**

In `features/fab.js`, add arrow key navigation between FAB actions and Escape to close.

- [ ] **Step 4: Add Escape to close modals/toasts**

Already partially implemented in `initModalKeyboardHandlers()`. Verify Escape works for all overlays.

- [ ] **Step 5: Run tests** — `node --test tests/*.test.js`

- [ ] **Step 6: Commit**

```bash
git add styles/main.css features/fab.js core/actions.js
git commit -m "a11y: add keyboard navigation to cards, FAB, and modals"
```

---

### Task 19: Add ARIA roles to tab system

**Files:**
- Modify: `index.html` (add ARIA attributes to tier2/tier3 tab containers)
- Modify: `render/tabs.js` or relevant render code (add role attributes dynamically)

- [ ] **Step 1: Add role="tabpanel" to tab panels**

In `index.html`, each `<div class="tab-panel">` should have `role="tabpanel"` and `aria-labelledby` pointing to its tab button.

- [ ] **Step 2: Add aria-live="polite" for dynamic updates**

Add `aria-live="polite"` to the streak display, level display, and XP display areas so screen readers announce changes.

- [ ] **Step 3: Add aria-label to search input**

In `index.html` line 117, add `aria-label="Search anything"` to the search input.

- [ ] **Step 4: Run tests** — `node --test tests/*.test.js`

- [ ] **Step 5: Commit**

```bash
git add index.html render/tabs.js
git commit -m "a11y: add ARIA roles to tabs, aria-live for dynamic content, search label"
```

---

### Task 20: Fix color contrast

**Files:**
- Modify: `styles/main.css` or `index.html` inline styles

- [ ] **Step 1: Check current --text2 contrast**

Current: `--text2:#6b6880` on `--card-bg:#e3dced`. Calculate contrast ratio.

- [ ] **Step 2: Adjust --text2 to meet 4.5:1**

Darken `--text2` to approximately `#5a5670` or similar to pass WCAG AA.

- [ ] **Step 3: Verify toast text contrast**

- [ ] **Step 4: Run tests** — `node --test tests/*.test.js`

- [ ] **Step 5: Commit**

```bash
git add styles/main.css index.html
git commit -m "a11y: fix color contrast for --text2 to meet WCAG AA"
```

---

## Phase 4: Performance

### Task 21: Remove Tailwind CDN

**Files:**
- Modify: `index.html` (remove Tailwind script)
- Modify: `styles/main.css` (add any missing utility classes)

- [ ] **Step 1: Audit which Tailwind classes are used**

Search all HTML/JS for Tailwind class names (flex, grid, p-4, m-2, text-center, etc.). List them.

- [ ] **Step 2: Add equivalent CSS rules to main.css**

For each used Tailwind class, add a minimal CSS rule in `styles/main.css`.

- [ ] **Step 3: Remove Tailwind CDN script from index.html**

Delete line 10: `<script src="https://cdn.tailwindcss.com"></script>`

- [ ] **Step 4: Visual check — open app in browser, verify no layout breakage**

- [ ] **Step 5: Run tests** — `node --test tests/*.test.js`

- [ ] **Step 6: Commit**

```bash
git add index.html styles/main.css
git commit -m "perf: remove Tailwind CDN, replace with hand-written CSS"
```

---

### Task 22: Defer non-critical scripts

**Files:**
- Modify: `index.html` (add defer to script tags)

- [ ] **Step 1: Identify scripts that can be deferred**

Keep synchronous: data/*.js, state/state.js, core/xp.js, core/themes.js, core/prayers.js, core/quests.js, core/achievements.js, core/shop.js, core/dhikr.js, core/content.js, render/*.js, core/actions.js.

Can defer: features/*.js, widgets/*.js, analytics/*.js.

- [ ] **Step 2: Add defer attribute to identified scripts**

- [ ] **Step 3: Run tests** — `node --test tests/*.test.js`

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "perf: defer non-critical feature and widget scripts"
```

---

### Task 23: Optimize DOM updates with dirty flags

**Files:**
- Modify: `render/dynamic.js` (add dirty flag tracking)

- [ ] **Step 1: Add dirty flags for panel rendering**

Track which panels need re-rendering. Only call render functions for dirty panels.

- [ ] **Step 2: Update state mutation functions to set dirty flags**

In `core/prayers.js`, `core/quests.js`, etc., set dirty flags instead of calling renderAll().

- [ ] **Step 3: Run tests** — `node --test tests/*.test.js`

- [ ] **Step 4: Commit**

```bash
git add render/dynamic.js core/prayers.js core/quests.js
git commit -m "perf: add dirty flags for targeted panel re-rendering"
```

---

### Task 24: Add localStorage compaction

**Files:**
- Modify: `state/state.js` (add compactLogs function)

- [ ] **Step 1: Add compactLogs function to state.js**

```javascript
function compactLogs() {
  const cutoff = today(new Date(Date.now() - 365 * 86400000));
  let count = 0;
  for (const dk of Object.keys(S.log)) {
    if (dk < cutoff) {
      // Keep summary stats only
      const entry = S.log[dk];
      const prayed = Object.values(entry.p || {}).filter(v => v).length;
      if (prayed >= 5) count++;
      delete S.log[dk];
    }
  }
  S.pd = (S.pd || 0) + count;
  saveState();
}
```

- [ ] **Step 2: Call compactLogs in initApp() if log is large**

- [ ] **Step 3: Run tests** — `node --test tests/*.test.js`

- [ ] **Step 4: Commit**

```bash
git add state/state.js
git commit -m "perf: add localStorage log compaction for logs older than 1 year"
```

---

## Phase 5: Navigation / URL Routing

### Task 25: Add URL-based tab routing

**Files:**
- Modify: `render/tabs.js` (add history.pushState on tab switch)
- Modify: `core/actions.js` (parse hash on init)

- [ ] **Step 1: Add pushState to switchCategory/activateTab**

In `render/tabs.js`, when a tab is activated, push the URL:
```javascript
const hash = '#/' + cat + '/' + tab;
history.pushState({ cat, tab }, '', hash);
```

- [ ] **Step 2: Add popstate listener**

```javascript
window.addEventListener('popstate', (e) => {
  if (e.state && e.state.cat && e.state.tab) {
    switchCategory(e.state.cat, document.querySelector('.t1-btn[data-cat="' + e.state.cat + '"]'));
    activateTab(e.state.tab);
  }
});
```

- [ ] **Step 3: Parse hash on page load**

In `initApp()`, parse `location.hash`:
```javascript
const hash = location.hash;
if (hash && hash.startsWith('#/')) {
  const parts = hash.slice(2).split('/');
  if (parts.length === 2) {
    const [cat, tab] = parts;
    const btn = document.querySelector('.t1-btn[data-cat="' + cat + '"]');
    if (btn) {
      switchCategory(cat, btn);
      activateTab(tab);
      return;
    }
  }
}
```

- [ ] **Step 4: Test back/forward buttons work**

- [ ] **Step 5: Test deep linking** — navigate to `/#/knowledge/hadith` directly

- [ ] **Step 6: Run tests** — `node --test tests/*.test.js`

- [ ] **Step 7: Commit**

```bash
git add render/tabs.js core/actions.js
git commit -m "feat: add URL-based tab routing with history pushState"
```

---

## Execution Order

1. Task 1 (extract NEW_POOLS) — independent, no risk
2. Task 2 (core/xp.js) — depends on Task 1
3. Task 3 (core/themes.js) — depends on Task 2
4. Task 4 (core/prayers.js) — depends on Task 2
5. Task 5 (core/quests.js) — depends on Task 2, 4
6. Task 6 (core/achievements.js) — depends on Task 2
7. Task 7 (core/shop.js) — depends on Task 2, 5, 6
8. Task 8 (core/dhikr.js) — depends on Task 2
9. Task 9 (core/content.js) — independent
10. Task 10 (gut actions.js) — depends on Tasks 1-9
11. Task 11 (split render.js) — independent of Tasks 1-10
12. Tasks 12-16 (tests) — depends on Tasks 1-11
13. Tasks 17-20 (accessibility) — depends on Tasks 1-11
14. Tasks 21-24 (performance) — independent of 12-20
15. Task 25 (routing) — depends on Task 11
