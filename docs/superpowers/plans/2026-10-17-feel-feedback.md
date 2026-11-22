# Feel & Feedback (SP2) Implementation Plan

> **Executor note:** This plan is self-sufficient. Work the tasks in order; each task ends with a runnable check. Spec for context: `docs/superpowers/specs/2026-10-16-feel-feedback-design.md`. Repo rule: **do not commit** — task checkpoints are test runs, not git commits.

**Goal:** Ship five feel-and-feedback upgrades — resurrect the dormant FAB scroll-close + pull-refresh (defer-timing root cause), sticky auto-collapse tier nav, haptics on key actions, scroll reset on section switches, swipe between the 5 sections, plus press-motion polish — pinned by tests first, verified by a browser probe script + regression probes.

**Architecture:** Classic-track edits only. The app has exactly one scroller: `.app` (`styles/main.css:112-124`). `core/actions.js` runs its init synchronously at parse time — before `defer` feature scripts load — so `window.initFAB`/`window.initPullRefresh` calls in it are silent no-ops; feature modules must self-init at load behind an `init._done` guard. `window.iqHaptic` lives in `core/xp.js` beside `playSound`. New CSS goes to the end of `styles/main.css`. Two new defer feature modules: `features/nav-collapse.js`, `features/swipe-nav.js`.

**Tech Stack:** Vanilla JS classic IIFEs on `window.*`, CSS, `node:test` (vm sandboxes; shared loader `tests/helpers/load.js`). Python 3 + Playwright (`playwright` 1.62 + chromium) for the external probe script. Server: `python -m http.server 8123` from the repo root (SP1's temp server/harness were purged — this plan rebuilds what it needs).

## Progress (updated live)

- [x] T1 — pins first → RED confirmed (565 total: 548 pass, 17 intended failures)
- [x] T2 — haptics (xp.js + prayers/quests/static call sites)
- [x] T3 — FAB + pull-refresh resurrection
- [x] T4 — tabs scroll reset
- [x] T5 — sticky compact nav
- [x] T6 — swipe nav
- [x] T7 — motion polish
- [x] T8 — version bumps + full green (565/565)
- [x] T9 — probe harness run (26/26 probes + 4/4 regression, artifact written)
- [x] T10 — final gate + report (565/565 green, syntax clean, server stopped)

## Global Constraints

- **Do not commit** — repo rule ("Do not commit unless explicitly asked"). No task has a commit step.
- Test command is exactly `node --test` from the repo root; it must end green (baseline 551 + the new SP2 tests; record the exact total after Task 1's RED run and the final GREEN run).
- Syntax-check every touched classic JS file with `node --check <file>`; run `node core/check-syntax.js` once at the end for the `src/**` track.
- Legacy `?v=` discipline (Task 8 table): bump the ref in `index.html` for every touched script; `tests/html.test.js` pins `main.css` (v44) and `sw.js` (v57) — update those pins in Task 1 and the file refs in Task 8.
- `sw.js`: bump `MANIFEST_REV` 9 → 10 (index.html is precached; its bytes change). `core/precache-manifest.js` is an interim hand-written list that does not include `features/*` — no entry changes needed.
- Haptic call sites outside `xp.js` use exactly `if (typeof window.iqHaptic === 'function') window.iqHaptic(N);` (keeps existing vm-sandbox tests green). Inside `xp.js`, call the local `iqHaptic(...)` directly.
- New feature modules: classic IIFE, self-init at load with an `init._done` guard, export `window.init<Name>`.
- The media-guard string is used verbatim: `(max-width: 767px), (pointer: coarse)`.
- Do not touch: `opencode.json`, `Images/`, `core/dhikr.js`, `core/actions.js`, `core/dynamic.js`, `core/helpers.js`.
- Windows PowerShell 5.1: no `&&` chaining, no `tail`, no glob expansion; quote paths.
- Screenshot/probe artifacts go to `C:\Users\Mahin\AppData\Local\Temp\opencode\iq-qa\` (recreate the temp dir — it was purged).

---

### Task 1: Pins first — tests must go RED

**Files:**
- Modify: `tests/html.test.js` (3 version pins + append 4 tests)
- Create: `tests/haptics.test.js`
- Create: `tests/swipe-nav.test.js`

**Interfaces:**
- Consumes: existing `css`, `html`, `renderTabs`, `renderStatic` variables already loaded at the top of `tests/html.test.js`.
- Produces: the RED signal for every later task (each implementation task flips a subset green).

- [ ] **Step 1: Update the three version pins** (exact replacements in `tests/html.test.js`):

  - Line 75: `assert.ok(html.includes("navigator.serviceWorker.register('sw.js?v=56')"));` → `...register('sw.js?v=57')...`
  - Lines 98 and 159 (identical text in two tests): `assert.ok(html.includes('styles/main.css?v=43'));` → `assert.ok(html.includes('styles/main.css?v=44'));`

- [ ] **Step 2: Append the SP2 pins to the end of `tests/html.test.js`:**

```js
test('SP2: dormant features self-init and bind the real scroller', () => {
  const fabSrc = fs.readFileSync(path.join(root, 'features', 'fab.js'), 'utf8');
  const pullSrc = fs.readFileSync(path.join(root, 'features', 'pull-refresh.js'), 'utf8');
  assert.ok(fabSrc.includes('init._done'), 'FAB init must be idempotent');
  assert.ok(fabSrc.includes("document.querySelector('.app')"), 'FAB must bind the real scroller');
  assert.ok(fabSrc.includes('\n  init();'), 'FAB must self-init at module load');
  assert.ok(pullSrc.includes('init._done'), 'pull-refresh init must be idempotent');
  assert.ok(pullSrc.includes("document.querySelector('.app')"), 'pull-refresh must resolve the real scroller');
  assert.ok(!pullSrc.includes('window.scrollY'), 'pull-refresh must not gate on window.scrollY');
  assert.ok(pullSrc.includes('\n  init();'), 'pull-refresh must self-init at module load');
});

test('SP2: compact nav + swipe nav are wired', () => {
  assert.ok(html.includes('features/nav-collapse.js?v=1'), 'nav-collapse must be script-tagged');
  assert.ok(html.includes('features/swipe-nav.js?v=1'), 'swipe-nav must be script-tagged');
  assert.ok(html.indexOf('features/nav-collapse.js') > html.indexOf('features/fab.js'), 'nav-collapse must load after fab.js');
  assert.ok(css.includes('.tier-nav-container { position: sticky; top: var(--topbar-h); z-index: 90; }'), 'sticky nav rule required');
  assert.ok(css.includes('.nav-compact #tier2Tabs'), 'compact chip-row rule required');
  assert.ok(css.includes('(max-width: 767px), (pointer: coarse)'), 'compact nav must be media-guarded');
});

test('SP2: scroll reset on category and group switches', () => {
  const reset = "var sc = document.querySelector('.app'); if (sc) sc.scrollTop = 0;";
  assert.strictEqual(renderTabs.split(reset).length, 3, 'both switch functions must reset scroller scrollTop');
});

test('SP2: haptics helper + call sites', () => {
  const xpSrc = fs.readFileSync(path.join(root, 'core', 'xp.js'), 'utf8');
  const prayersSrc = fs.readFileSync(path.join(root, 'core', 'prayers.js'), 'utf8');
  const questsSrc = fs.readFileSync(path.join(root, 'core', 'quests.js'), 'utf8');
  assert.ok(xpSrc.includes('window.iqHaptic = iqHaptic'), 'iqHaptic must be exported from xp.js');
  assert.ok(xpSrc.includes('dhikrSettings'), 'iqHaptic must reuse the haptic setting');
  assert.ok(xpSrc.includes('iqHaptic([30, 50, 30])'), 'level-up must use the triple buzz');
  assert.ok(renderStatic.includes('window.iqHaptic(10)'), 'static toggles must fire haptics');
  assert.ok(prayersSrc.includes('window.iqHaptic(10)'), 'prayer toggles must fire haptics');
  assert.ok(questsSrc.includes('window.iqHaptic(10)'), 'quest toggle must fire haptics');
});
```

- [ ] **Step 3: Create `tests/haptics.test.js`:**

```js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const { loadFile } = require('./helpers/load.js');

const XP = path.join(__dirname, '..', 'core', 'xp.js');

function mk(haptic, withVibrate) {
  const calls = [];
  const overrides = {
    S: { xp: 0, lv: 1, dhikrSettings: { haptic } },
    saveState: () => {},
    markDirty: () => {},
    renderDynamic: () => {},
    today: () => '2026-10-17',
    setTimeout: () => 0,
    clearTimeout: () => {}
  };
  if (withVibrate !== false) overrides.navigator = { vibrate: (p) => { calls.push(p); return true; } };
  const sb = loadFile(XP, overrides);
  return { sb, calls };
}

test('SP2: iqHaptic exists on the feedback module', () => {
  const { sb } = mk(true);
  assert.strictEqual(typeof sb.window.iqHaptic, 'function');
});

test('SP2: iqHaptic vibrates with the given pattern when enabled', () => {
  const { sb, calls } = mk(true);
  sb.window.iqHaptic(10);
  assert.deepStrictEqual(calls, [10]);
});

test('SP2: iqHaptic defaults to 10 and passes arrays through', () => {
  const { sb, calls } = mk(true);
  sb.window.iqHaptic();
  sb.window.iqHaptic([30, 50, 30]);
  assert.deepStrictEqual(calls, [10, [30, 50, 30]]);
});

test('SP2: iqHaptic is silent when the setting is off', () => {
  const { sb, calls } = mk(false);
  sb.window.iqHaptic(10);
  assert.deepStrictEqual(calls, []);
});

test('SP2: iqHaptic never throws without navigator.vibrate or S', () => {
  const a = mk(true, false); // no navigator at all
  a.sb.window.iqHaptic(10);
  const b = loadFile(XP, { setTimeout: () => 0, clearTimeout: () => {} }); // no S
  assert.strictEqual(typeof b.window.iqHaptic, 'function');
  b.window.iqHaptic(10);
});
```

- [ ] **Step 4: Create `tests/swipe-nav.test.js`:**

```js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const fs = require('fs');
const vm = require('vm');

let code = '';
try {
  code = fs.readFileSync(path.join(__dirname, '..', 'features', 'swipe-nav.js'), 'utf8');
} catch (e) {}

const sandbox = {
  window: { matchMedia: () => ({ matches: false }) },
  console,
  localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} }
};
if (code) vm.runInNewContext(code, sandbox, { filename: 'features/swipe-nav.js' });
const dir = sandbox.window._swipeDir;
const idx = sandbox.window._swipeIndex;

test('SP2: swipe-nav module exports its gesture math', () => {
  assert.strictEqual(typeof dir, 'function', 'features/swipe-nav.js must define window._swipeDir');
  assert.strictEqual(typeof idx, 'function', 'features/swipe-nav.js must define window._swipeIndex');
});

test('SP2: _swipeDir ignores edge-origin gestures (iOS back zones)', () => {
  assert.strictEqual(dir(10, -120, 0, 390), 0);
  assert.strictEqual(dir(385, -120, 0, 390), 0);
});

test('SP2: _swipeDir requires the 60px floor and rejects vertical dominance', () => {
  assert.strictEqual(dir(200, -59, 0, 390), 0);
  assert.strictEqual(dir(200, -60, 0, 390), 1);
  assert.strictEqual(dir(200, -80, -80, 390), 0);
  assert.strictEqual(dir(200, -80, -20, 390), 1);
});

test('SP2: _swipeDir maps left/right to next/previous', () => {
  assert.strictEqual(dir(200, -100, 0, 390), 1);
  assert.strictEqual(dir(200, 100, 0, 390), -1);
});

test('SP2: _swipeIndex clamps at both ends', () => {
  assert.strictEqual(idx(0, -1, 5), -1);
  assert.strictEqual(idx(4, 1, 5), -1);
  assert.strictEqual(idx(2, 1, 5), 3);
  assert.strictEqual(idx(2, -1, 5), 1);
});
```

- [ ] **Step 5: Run `node --test`** → **expected RED**: the three version-pin assertions fail; the four new `html.test.js` tests fail; `tests/haptics.test.js` fails 4/5 (first test fails on missing `window.iqHaptic`); `tests/swipe-nav.test.js` fails the first two tests (exports missing; calling `undefined` throws inside the remaining tests — failures, not file errors). Everything else stays green. Record the total test count.

---

### Task 2: Haptics — helper + core call sites

**Files:**
- Modify: `core/xp.js` (helper + 3 call sites), `core/prayers.js` (3 sites), `core/quests.js` (1 site), `core/static.js` (3 sites)
- Test: `tests/haptics.test.js`, `tests/html.test.js` (SP2 haptics pin)

**Interfaces:**
- Produces: `window.iqHaptic(pattern)` — default 10ms; no-op when S missing / `S.dhikrSettings.haptic` falsy / `navigator.vibrate` missing; never throws. Later tasks (3) call it from `features/fab.js`.

- [ ] **Step 1: Define + export `iqHaptic` in `core/xp.js`.** Replace:

```js
  window.playSound = playSound;
```

with:

```js
  function iqHaptic(pattern) {
    try {
      if (typeof S === 'undefined' || !S || !S.dhikrSettings || !S.dhikrSettings.haptic) return;
      if (typeof navigator === 'undefined' || !navigator.vibrate) return;
      navigator.vibrate(pattern == null ? 10 : pattern);
    } catch (e) {}
  }
  window.iqHaptic = iqHaptic;
  window.playSound = playSound;
```

- [ ] **Step 2: Fire on daily XP grants** (`core/xp.js`). Both `grantDailyXp` and `grantCappedDailyXp` contain this exact pair — replace with `replaceAll`:

```js
    checkLevelUp(oldLv);
    playSound('pop');
```
→
```js
    checkLevelUp(oldLv);
    playSound('pop');
    iqHaptic(10);
```

- [ ] **Step 3: Fire on level-up** (`core/xp.js`, inside `levelUpToast`). Replace `    playSound('chime');` with:

```js
    playSound('chime');
    iqHaptic([30, 50, 30]);
```

- [ ] **Step 4: Prayer toggles** (`core/prayers.js`):
  - `toggleP` — replace `playSound('pop'); if(typeof checkSurpriseReward==='function') checkSurpriseReward('prayer');` with `playSound('pop'); if (typeof window.iqHaptic === 'function') window.iqHaptic(10); if(typeof checkSurpriseReward==='function') checkSurpriseReward('prayer');`
  - `toggleV` + `toggleD` — the pair `applyXpDelta(xp); playSound('pop'); }` occurs exactly twice; replace with `replaceAll` → `applyXpDelta(xp); playSound('pop'); if (typeof window.iqHaptic === 'function') window.iqHaptic(10); }`

- [ ] **Step 5: Quest toggle** (`core/quests.js`). Replace `if(q.done){ applyXpDelta(xpVal); S.tq++;` with `if(q.done){ applyXpDelta(xpVal); if (typeof window.iqHaptic === 'function') window.iqHaptic(10); S.tq++;`

- [ ] **Step 6: Adhkar toggles** (`core/static.js`):
  - `toggleFasting` — replace `applyXpDelta(50); window.playSound('pop'); }` with `applyXpDelta(50); window.playSound('pop'); if (typeof window.iqHaptic === 'function') window.iqHaptic(10); }`
  - `toggleMorning` + `toggleEvening` — the string `if(!w) { applyXpDelta(xp); window.playSound('pop'); }` occurs exactly twice; replaceAll → `if(!w) { applyXpDelta(xp); window.playSound('pop'); if (typeof window.iqHaptic === 'function') window.iqHaptic(10); }`

- [ ] **Step 7: Verify.** Run `node --test` → `tests/haptics.test.js` fully green; the SP2 haptics pin in `tests/html.test.js` green; remaining SP2 pins still RED. Then `node --check core/xp.js`, `node --check core/prayers.js`, `node --check core/quests.js`, `node --check core/static.js` → all clean.

---

### Task 3: Resurrection — FAB + pull-refresh self-init on the real scroller

**Files:**
- Modify: `features/fab.js` (init guard, scroller binding, open haptic, self-init), `features/pull-refresh.js` (init guard, scroller checks, self-init)
- Test: `tests/html.test.js` (SP2 self-init pin)

**Interfaces:**
- Consumes: `window.iqHaptic` from Task 2.
- Produces: live FAB scroll-close + keyboard handlers; live pull-refresh armed only at the true top. Both modules re-export their `window.init*` (idempotent).

- [ ] **Step 1: FAB open haptic** (`features/fab.js`, `toggle()`). Replace:

```js
    if (_open) {
      actions.style.display = 'flex';
```
→
```js
    if (_open) {
      if (typeof window.iqHaptic === 'function') window.iqHaptic(6);
      actions.style.display = 'flex';
```

- [ ] **Step 2: FAB init — idempotence + real scroller.** Replace:

```js
  function init() {
    let lastScroll = 0;
    const fab = document.getElementById('fab');
    if (!fab) return;
    populateFABIcons();
    window.addEventListener('scroll', () => {
      const cur = window.scrollY;
```
→
```js
  function init() {
    if (init._done) return;
    init._done = true;
    let lastScroll = 0;
    const fab = document.getElementById('fab');
    if (!fab) return;
    populateFABIcons();
    const scroller = document.querySelector('.app') || document.scrollingElement;
    scroller.addEventListener('scroll', () => {
      const cur = scroller.scrollTop;
```

- [ ] **Step 3: FAB self-init.** Replace the module tail:

```js
  // features/fab.js is a defer script: it loads after core/actions.js's
  // synchronous init() has already run, so window.initFAB is never invoked
  // from there. Populate the icon spans directly at module load (the DOM is
  // fully parsed by now). Idempotent: populateFABIcons skips filled spans.
  populateFABIcons();
})();
```
→
```js
  // features/fab.js is a defer script: core/actions.js's synchronous init()
  // has already run by the time this file executes, so window.initFAB is
  // never invoked from there (same for pull-refresh.js and the SP2 nav
  // modules). Self-init at module load instead; init() is idempotent via
  // init._done, and populateFABIcons skips already-filled spans.
  populateFABIcons();
  init();
})();
```

- [ ] **Step 4: pull-refresh init — idempotence + real scroller.** Replace:

```js
  function init() {
    if (!('ontouchstart' in window)) return;
    const content = document.getElementById('mainContent');
    const indicator = document.getElementById('pullRefreshIndicator');
    if (!content || !indicator) return;

    content.addEventListener('touchstart', function(e) {
      if (window.scrollY === 0) { _startY = e.touches[0].clientY; _pulling = true; }
```
→
```js
  function init() {
    if (init._done) return;
    init._done = true;
    if (!('ontouchstart' in window)) return;
    const content = document.getElementById('mainContent');
    const indicator = document.getElementById('pullRefreshIndicator');
    if (!content || !indicator) return;
    const scroller = document.querySelector('.app') || document.scrollingElement;

    content.addEventListener('touchstart', function(e) {
      if (scroller.scrollTop <= 0) { _startY = e.touches[0].clientY; _pulling = true; }
```

- [ ] **Step 5: pull-refresh move gate.** Replace `      if (diff > 0 && window.scrollY === 0) {` with `      if (diff > 0 && scroller.scrollTop <= 0) {`

- [ ] **Step 6: pull-refresh self-init.** Replace:

```js
  window.initPullRefresh = init;
})();
```
→
```js
  window.initPullRefresh = init;
  init();
})();
```

- [ ] **Step 7: Verify.** `node --test` → SP2 self-init pin green; all else unchanged. `node --check features/fab.js` + `node --check features/pull-refresh.js` → clean.

---

### Task 4: Scroll reset on category and group switches

**Files:**
- Modify: `core/tabs.js` (`switchCategory` end, `selectCategory` end)
- Test: `tests/html.test.js` (SP2 scroll-reset pin)

- [ ] **Step 1: `switchCategory` end.** Replace:

```js
      if (group.length > 0) activateTab(group[0].id, container.firstElementChild);
    }
  }
```
→
```js
      if (group.length > 0) activateTab(group[0].id, container.firstElementChild);
    }
    var sc = document.querySelector('.app'); if (sc) sc.scrollTop = 0;
  }
```

- [ ] **Step 2: `selectCategory` end.** Replace:

```js
      renderCategoryTabs(cat);
    }
  }

  function drillDown(tabId, btn) {
```
→
```js
      renderCategoryTabs(cat);
    }
    var sc = document.querySelector('.app'); if (sc) sc.scrollTop = 0;
  }

  function drillDown(tabId, btn) {
```

- [ ] **Step 3: Verify.** `node --test` → SP2 scroll-reset pin green; `tests/tabs-persistence.test.js` and `tests/app-registry.test.js` stay green (the `document.querySelector` guard handles sandboxes without `.app`). `node --check core/tabs.js` → clean.

---

### Task 5: Sticky compact nav

**Files:**
- Create: `features/nav-collapse.js`
- Modify: `styles/main.css` (append block at end of file), `index.html` (script tag after `features/pull-refresh.js` line 496)
- Test: `tests/html.test.js` (compact-nav pin)

**Interfaces:**
- Consumes: `.tier-nav-container`, `#topBar`, `#tier2Tabs`, `#tier3Wrap`, `#dateLine`, `.app` (all existing markup).
- Produces: `.nav-compact` class contract used by CSS + Task 9 probes; `window.initNavCollapse` (idempotent).

- [ ] **Step 1: Create `features/nav-collapse.js`:**

```js
// features/nav-collapse.js — Sticky compact nav (SP2 feel & feedback).
// Self-init: core/actions.js runs its init() synchronously at parse time,
// before defer scripts load, so feature modules self-initialize.
(function() {
  var MEDIA = '(max-width: 767px), (pointer: coarse)';

  function resolveScroller() {
    return document.querySelector('.app') || document.scrollingElement;
  }

  function init() {
    if (init._done) return;
    init._done = true;
    if (!window.matchMedia || !window.matchMedia(MEDIA).matches) return;
    var nav = document.querySelector('.tier-nav-container');
    var topBar = document.getElementById('topBar');
    var sc = resolveScroller();
    if (!nav || !topBar || !sc) return;

    function measure() {
      document.documentElement.style.setProperty('--topbar-h', topBar.offsetHeight + 'px');
    }
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('orientationchange', measure);

    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function() { ticking = false; update(); });
    }

    function update() {
      var navTop = nav.getBoundingClientRect().top;
      var barBottom = topBar.getBoundingClientRect().bottom;
      var compact = nav.classList.contains('nav-compact');
      if (!compact && navTop <= barBottom + 2) {
        nav.classList.add('nav-compact');
        var active = nav.querySelector('#tier2Tabs .active');
        if (active && active.scrollIntoView) {
          try { active.scrollIntoView({ block: 'nearest', inline: 'center' }); } catch (e) {}
        }
      } else if (compact && navTop >= barBottom + 10) {
        nav.classList.remove('nav-compact');
      }
    }

    sc.addEventListener('scroll', onScroll, { passive: true });

    // Compact-mode taps reset to the top of the switched section; the reset
    // unsticks the nav and update() expands it on the next scroll event.
    nav.addEventListener('click', function(e) {
      if (!nav.classList.contains('nav-compact')) return;
      if (!e.target.closest || !e.target.closest('button, .surah-card')) return;
      sc.scrollTop = 0;
    });

    update();
  }

  window.initNavCollapse = init;
  init();
})();
```

- [ ] **Step 2: Append the CSS block** to the **end** of `styles/main.css` (read the last 15 lines first; use the final block as the edit anchor — the file currently ends with the `input:focus, textarea:focus, select:focus { scroll-margin-bottom: 80px; }` block):

```css
/* ── SP2: sticky compact nav (phones / touch-first) ── */
:root { --topbar-h: 56px; }
@media (max-width: 767px), (pointer: coarse) {
  .tier-nav-container { position: sticky; top: var(--topbar-h); z-index: 90; }
  #dateLine { max-height: 32px; }
  #tier3Wrap { max-height: 260px; }
  #dateLine, #tier3Wrap { overflow: hidden; transition: max-height 0.18s ease, opacity 0.12s ease; }
  .nav-compact { padding: 6px; border-radius: 0 0 var(--radius) var(--radius); box-shadow: var(--shadow-md); }
  .nav-compact #dateLine,
  .nav-compact #tier3Wrap { max-height: 0; opacity: 0; margin-top: 0; margin-bottom: 0; padding-top: 0; padding-bottom: 0; }
  .nav-compact #tier2Tabs {
    display: flex; /* collapses the cat-chips grid into a single rail */
    flex-wrap: nowrap;
    overflow-x: auto;
    justify-content: flex-start;
    padding-right: 8px;
  }
  .nav-compact #tier2Tabs .cat-chip,
  .nav-compact #tier2Tabs .t2-btn { flex: 0 0 auto; white-space: nowrap; }
}
```

- [ ] **Step 3: Register the script.** In `index.html`, directly after `<script src="features/pull-refresh.js?v=1" defer></script>` (Task 8 adds the `?v=1` to that tag; if Task 8 hasn't run yet, the tag is `<script src="features/pull-refresh.js" defer></script>`), insert:

```html
<script src="features/nav-collapse.js?v=1" defer></script>
```

- [ ] **Step 4: Verify.** `node --test` → the compact-nav half of the wiring pin green (swipe-nav tag still missing is fine — that's Task 6). `node --check features/nav-collapse.js` → clean.

---

### Task 6: Swipe between the 5 sections

**Files:**
- Create: `features/swipe-nav.js`
- Modify: `index.html` (script tag after `features/nav-collapse.js`)
- Test: `tests/swipe-nav.test.js`, `tests/html.test.js` (wiring pin)

**Interfaces:**
- Consumes: `.bnav-btn[data-cat]` DOM order (single source of truth), `window.App.switchCategory(cat, btn)` (same path as a bottom-nav tap).
- Produces: `window._swipeDir(startX, dx, dy, viewportW)` → `-1 | 0 | 1`; `window._swipeIndex(current, dir, count)` → next index or `-1`; `window.initSwipeNav` (idempotent).

- [ ] **Step 1: Create `features/swipe-nav.js`:**

```js
// features/swipe-nav.js — Horizontal swipe between the 5 main sections (SP2).
// Self-init at module load; touch-only; dispatch mirrors a bottom-nav tap.
(function() {
  var MIN_DX = 60;
  var EDGE = 28;
  var RATIO = 1.5;
  var EXCLUDE = '#dailyCarousel, .tier-nav-container, .pull-refresh-indicator, input, textarea, select';

  // Pure gesture resolution: -1 = previous section, +1 = next, 0 = ignore.
  function _swipeDir(startX, dx, dy, viewportW) {
    if (startX < EDGE || startX > viewportW - EDGE) return 0;
    if (Math.abs(dx) < MIN_DX) return 0;
    if (Math.abs(dx) < RATIO * Math.abs(dy)) return 0;
    return dx < 0 ? 1 : -1;
  }

  function _swipeIndex(current, dir, count) {
    var idx = current + dir;
    if (idx < 0 || idx >= count) return -1;
    return idx;
  }

  function init() {
    if (init._done) return;
    init._done = true;
    if (!window.matchMedia || !window.matchMedia('(pointer: coarse)').matches) return;
    var content = document.getElementById('mainContent');
    if (!content) return;

    var startX = 0, startY = 0, track = false;

    content.addEventListener('touchstart', function(e) {
      if (e.touches.length !== 1) { track = false; return; }
      if (e.target.closest && e.target.closest(EXCLUDE)) { track = false; return; }
      track = true;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });

    content.addEventListener('touchend', function(e) {
      if (!track) return;
      track = false;
      if (e.changedTouches.length !== 1) return;
      var dx = e.changedTouches[0].clientX - startX;
      var dy = e.changedTouches[0].clientY - startY;
      var dir = _swipeDir(startX, dx, dy, window.innerWidth);
      if (!dir) return;
      var btns = document.querySelectorAll('.bnav-btn');
      var active = document.querySelector('.bnav-btn.active');
      if (!btns.length || !active) return;
      var current = Array.prototype.indexOf.call(btns, active);
      var next = _swipeIndex(current, dir, btns.length);
      if (next < 0) return;
      var target = btns[next];
      if (window.App && window.App.switchCategory) {
        window.App.switchCategory(target.getAttribute('data-cat'), target);
      }
    }, { passive: true });
  }

  window._swipeDir = _swipeDir;
  window._swipeIndex = _swipeIndex;
  window.initSwipeNav = init;
  init();
})();
```

- [ ] **Step 2: Register the script.** In `index.html`, directly after the new `features/nav-collapse.js?v=1` tag, insert:

```html
<script src="features/swipe-nav.js?v=1" defer></script>
```

- [ ] **Step 3: Verify.** `node --test` → `tests/swipe-nav.test.js` fully green; the wiring pin in `tests/html.test.js` fully green. `node --check features/swipe-nav.js` → clean.

---

### Task 7: Press & motion polish

**Files:**
- Modify: `styles/main.css` (transition list, new `:active` scales, FAB speed-dial cascade)
- Test: none new (CSS; exercised by probes)

- [ ] **Step 1: Extend the interaction-transition list** (`styles/main.css` ~:3299). Replace:

```css
.t1-btn, .t2-btn, .t3-btn, .cat-chip, .bnav-btn,
.surah-card, .card-item, .deed-card, .vol-card,
.theme-btn, .filter-btn, .quest-check, .cal-day {
  transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease, transform 0.1s ease;
}
```
→
```css
.t1-btn, .t2-btn, .t3-btn, .cat-chip, .bnav-btn,
.surah-card, .card-item, .deed-card, .vol-card,
.theme-btn, .filter-btn, .quest-check, .cal-day,
.goal-btn, .drill-back, .ds-close, .add-goal-btn, .dhikr-tap-btn, .fab-action {
  transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease, transform 0.1s ease;
}
```

- [ ] **Step 2: New press scales.** Replace:

```css
.t1-btn:active, .t2-btn:active, .t3-btn:active, .cat-chip:active, .bnav-btn:active {
  transform: scale(0.95);
}
```
→
```css
.t1-btn:active, .t2-btn:active, .t3-btn:active, .cat-chip:active, .bnav-btn:active {
  transform: scale(0.95);
}
.fab-main:active { transform: scale(0.94); }
.fab-actions.fab-show .fab-action:active { transform: translateY(0) scale(0.96); }
```
(`.fab-main` already carries `transition: all var(--transition)`; the `.fab-action` press scale must out-specify the shown-state transform from Step 3, hence the long selector.)

- [ ] **Step 3: FAB speed-dial cascade** (`styles/main.css` ~:1540). `.fab-actions` is `flex-direction: column-reverse`, so DOM child 1 (Prayer) renders closest to the main button — delays run 0 → 90ms outward. Replace:

```css
.fab-actions.fab-show { opacity: 1; transform: scale(1); }
```
→
```css
.fab-actions.fab-show { opacity: 1; transform: scale(1); }
/* SP2: staged speed-dial reveal (nearest item first, 30ms steps) */
.fab-actions .fab-action {
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 0.18s ease, transform 0.18s ease, border-color var(--transition), background-color var(--transition);
  transition-delay: 0ms;
}
.fab-actions.fab-show .fab-action { opacity: 1; transform: translateY(0); }
.fab-actions.fab-show .fab-action:nth-child(1) { transition-delay: 0ms; }
.fab-actions.fab-show .fab-action:nth-child(2) { transition-delay: 30ms; }
.fab-actions.fab-show .fab-action:nth-child(3) { transition-delay: 60ms; }
.fab-actions.fab-show .fab-action:nth-child(4) { transition-delay: 90ms; }
```

- [ ] **Step 4: Verify.** `node --test` unchanged-green (no tests target these rules); `node --check` not needed (CSS). Visual check happens in Task 9 probes/screenshots.

---

### Task 8: Cache discipline — version bumps + service worker

**Files:**
- Modify: `index.html` (tag versions), `sw.js` (`MANIFEST_REV`)

- [ ] **Step 1: `index.html` version bumps** (exact replacements):

| Current | → New |
|---|---|
| `<link rel="preload" href="styles/main.css?v=43"` | `styles/main.css?v=44` |
| `<script src="core/static.js?v=8">` | `core/static.js?v=9` |
| `<script src="core/xp.js?v=2">` | `core/xp.js?v=3` |
| `<script src="core/prayers.js?v=3">` | `core/prayers.js?v=4` |
| `<script src="core/quests.js?v=4">` | `core/quests.js?v=5` |
| `<script src="core/tabs.js?v=11">` | `core/tabs.js?v=12` |
| `<script src="features/fab.js?v=2" defer>` | `features/fab.js?v=3` |
| `<script src="features/pull-refresh.js" defer>` | `features/pull-refresh.js?v=1` |
| `navigator.serviceWorker.register('sw.js?v=56')` | `sw.js?v=57` |

- [ ] **Step 2: `sw.js` revision bump.** Replace `const MANIFEST_REV = 9;` with `const MANIFEST_REV = 10;`

- [ ] **Step 3: Verify.** `node --test` → the three version pins now GREEN; total suite fully green (record the total: baseline 551 + 14 new SP2 tests). Run `node --check sw.js` and `node core/check-syntax.js` (expect OK over all `src/**` files).

---

### Task 9: Browser probe harness (SP2 + regression)

**Files:**
- Create: `C:\Users\Mahin\AppData\Local\Temp\opencode\iq-feel-probe.py` (recreate the temp dir if missing)
- Run: static server on port 8123 from the repo root

**Interfaces:**
- Consumes: every Task 2–8 deliverable, live in the served app.
- Produces: `…\Temp\opencode\iq-qa\iq-audit-sp2.json` + screenshots in `…\iq-qa\sp2-shots\` — the acceptance evidence.

- [ ] **Step 1: Preconditions.** `python --version` + `python -c "import playwright; print(playwright.__version__)"` (expect 1.62.x; if `playwright` import fails, `pip install playwright` + `python -m playwright install chromium`). Start the server as a background process with workdir = repo root: `python -m http.server 8123`. Verify: `Invoke-WebRequest -UseBasicParsing http://localhost:8123/index.html` → 200.

- [ ] **Step 2: Write the probe script:**

```python
# SP2 feel & feedback probes + regression set.
# Run: python iq-feel-probe.py   (server must be on http://localhost:8123)
# Exit code 0 = all probes passed.
import asyncio, json, os, sys
from playwright.async_api import async_playwright

BASE = 'http://localhost:8123/index.html'
OUT_DIR = os.path.dirname(os.path.abspath(__file__))
QA = os.path.join(OUT_DIR, 'iq-qa')
SHOTS = os.path.join(QA, 'sp2-shots')
RESULT = os.path.join(QA, 'iq-audit-sp2.json')

INTRO_INIT = "try{localStorage.setItem('iq_intro_seen','1');}catch(e){}"
VIBRATE_INIT = ("Object.defineProperty(Navigator.prototype,'vibrate',"
                "{value:function(p){window.__vib=window.__vib||[];window.__vib.push(p);return true;},"
                "configurable:true});")

results = {'probes': {}, 'regression': {}, 'screenshots': []}
page_errors = []


def rec(bucket, name, ok, detail):
    results[bucket][name] = {'ok': bool(ok), 'detail': detail}
    print(('PASS ' if ok else 'FAIL ') + bucket + ':' + name + ' :: ' + str(detail)[:200])


async def boot(pw, **ctx_kw):
    browser = await pw.chromium.launch()
    ctx = await browser.new_context(viewport={'width': 390, 'height': 844},
                                    has_touch=True, is_mobile=True, **ctx_kw)
    await ctx.add_init_script(INTRO_INIT)
    await ctx.add_init_script(VIBRATE_INIT)
    page = await ctx.new_page()
    page.on('pageerror', lambda e: page_errors.append(str(e)))
    await page.goto(BASE, wait_until='load')
    await page.wait_for_selector('#prayerArea .card-item', timeout=15000)
    # Dismiss intro/onboarding if they still show (fresh-state bootstrap).
    try:
        await page.evaluate("""() => {
          const intro = document.getElementById('introOverlay');
          if (intro && getComputedStyle(intro).display !== 'none' && !intro.classList.contains('hidden')) {
            const b = document.getElementById('introBtn'); if (b) b.click();
          }
        }""")
        await page.wait_for_timeout(900)
        await page.evaluate("() => { try { if (window.completeOnboarding) window.completeOnboarding(); } catch(e){} }")
    except Exception:
        pass
    await page.wait_for_timeout(300)
    return browser, ctx, page


async def scroll_app(page, y):
    await page.evaluate("y => { (document.querySelector('.app')||document.scrollingElement).scrollTop = y; }", y)
    await page.wait_for_timeout(350)


async def drag(page, selector, dx, dy, start_x=None):
    await page.evaluate("""([sel, dx, dy, sx]) => {
      const el = document.querySelector(sel);
      if (!el) return 'no-el';
      const r = el.getBoundingClientRect();
      const x0 = sx == null ? 200 : sx;
      const y0 = r.top + 40;
      const mk = (x, y) => new Touch({ identifier: 1, target: el, clientX: x, clientY: y });
      el.dispatchEvent(new TouchEvent('touchstart', { touches: [mk(x0, y0)], changedTouches: [mk(x0, y0)], bubbles: true, cancelable: true }));
      el.dispatchEvent(new TouchEvent('touchmove', { touches: [mk(x0 + dx / 2, y0 + dy / 2)], changedTouches: [mk(x0 + dx / 2, y0 + dy / 2)], bubbles: true, cancelable: true }));
      el.dispatchEvent(new TouchEvent('touchend', { touches: [], changedTouches: [mk(x0 + dx, y0 + dy)], bubbles: true, cancelable: true }));
      return 'ok';
    }""", [selector, dx, dy, start_x])
    await page.wait_for_timeout(300)


async def shot(page, name):
    os.makedirs(SHOTS, exist_ok=True)
    path = os.path.join(SHOTS, name)
    await page.screenshot(path=path)
    results['screenshots'].append(name)


async def app_state(page):
    return await page.evaluate("""() => {
      const nav = document.querySelector('.tier-nav-container');
      const bar = document.getElementById('topBar');
      const sc = document.querySelector('.app') || document.scrollingElement;
      const fab = document.getElementById('fabMain');
      const actions = document.getElementById('fabActions');
      const tier2 = document.getElementById('tier2Tabs');
      const t3 = document.getElementById('tier3Wrap');
      const ind = document.getElementById('pullRefreshIndicator');
      return {
        scrollTop: sc.scrollTop,
        navTop: nav.getBoundingClientRect().top,
        navHeight: nav.getBoundingClientRect().height,
        barBottom: bar.getBoundingClientRect().bottom,
        compact: nav.classList.contains('nav-compact'),
        flexWrap: getComputedStyle(tier2).flexWrap,
        t3MaxH: getComputedStyle(t3).maxHeight,
        fabOpen: !!(fab && fab.classList.contains('fab-open')),
        fabShown: !!(actions && actions.classList.contains('fab-show')),
        fabDisplay: actions ? getComputedStyle(actions).display : '',
        indOpacity: ind ? ind.style.opacity : '',
        bnavActive: (document.querySelector('.bnav-btn.active') || {}).outerHTML ? document.querySelector('.bnav-btn.active').getAttribute('data-cat') : null,
        vib: window.__vib || []
      };
    }""")


async def main():
    os.makedirs(QA, exist_ok=True)
    async with async_playwright() as pw:
        browser, ctx, page = await boot(pw)

        # ── boot health ──
        st = await app_state(page)
        rec('probes', 'boot_no_errors', len(page_errors) == 0, page_errors[:3])
        rec('probes', 'boot_at_top', st['scrollTop'] == 0, st['scrollTop'])
        await shot(page, 'sp2-today-top.png')

        # ── FAB: scroll-close + Escape ──
        await page.click('#fabMain')
        st = await app_state(page)
        rec('probes', 'fab_opens', st['fabOpen'] and st['fabShown'], {'open': st['fabOpen'], 'shown': st['fabShown']})
        await scroll_app(page, 400)
        await page.wait_for_timeout(300)
        st = await app_state(page)
        rec('probes', 'fab_closes_on_scroll', (not st['fabOpen']) and (not st['fabShown']), {'open': st['fabOpen'], 'shown': st['fabShown']})
        await scroll_app(page, 0)
        await page.click('#fabMain')
        await page.keyboard.press('Escape')
        await page.wait_for_timeout(300)
        st = await app_state(page)
        rec('probes', 'fab_escape_closes', not st['fabOpen'], st['fabOpen'])

        # ── pull-refresh arming ──
        await scroll_app(page, 0)
        await drag(page, '#mainContent', 0, 150)
        st = await app_state(page)
        rec('probes', 'pull_arms_at_top', st['indOpacity'] != '' and float(st['indOpacity'] or 0) > 0, st['indOpacity'])
        await page.wait_for_timeout(1300)
        await scroll_app(page, 800)
        await drag(page, '#mainContent', 0, 150)
        st = await app_state(page)
        rec('probes', 'pull_ignores_mid_page', st['indOpacity'] == '' or float(st['indOpacity'] or 0) == 0, st['indOpacity'])

        # ── compact nav ──
        await scroll_app(page, 600)
        st = await app_state(page)
        rec('probes', 'compact_enters', st['compact'], st['compact'])
        rec('probes', 'compact_pinned', abs(st['navTop'] - st['barBottom']) <= 3, {'navTop': st['navTop'], 'barBottom': st['barBottom']})
        rec('probes', 'compact_chips_nowrap', st['flexWrap'] == 'nowrap', st['flexWrap'])
        rec('probes', 'compact_hides_tier3', st['t3MaxH'] == '0px', st['t3MaxH'])
        await shot(page, 'sp2-compact-600.png')
        for y in (250, 1200):
            await scroll_app(page, y)
            await shot(page, 'sp2-sweep-%d.png' % y)
        await scroll_app(page, 600)
        await page.click('#tier2Tabs .cat-chip, #tier2Tabs .t2-btn')
        await page.wait_for_timeout(500)
        st = await app_state(page)
        rec('probes', 'compact_chip_tap_resets_scroll', st['scrollTop'] == 0, st['scrollTop'])
        rec('probes', 'compact_chip_tap_expands', not st['compact'], st['compact'])
        await scroll_app(page, 600)
        await scroll_app(page, 0)
        st = await app_state(page)
        rec('probes', 'compact_exits_at_top', (not st['compact']) and st['navHeight'] > 150, {'compact': st['compact'], 'h': st['navHeight']})
        await shot(page, 'sp2-expanded-0.png')

        # ── swipe ──
        await drag(page, '#mainContent', -110, 0, 200)
        st = await app_state(page)
        rec('probes', 'swipe_left_next', st['bnavActive'] == 'knowledge', st['bnavActive'])
        await drag(page, '#mainContent', 110, 0, 200)
        st = await app_state(page)
        rec('probes', 'swipe_right_prev', st['bnavActive'] == 'ibadah', st['bnavActive'])
        await drag(page, '#mainContent', 110, 0, 200)
        st = await app_state(page)
        rec('probes', 'swipe_clamped_at_first', st['bnavActive'] == 'ibadah', st['bnavActive'])
        await drag(page, '#mainContent', -110, 0, 10)
        st = await app_state(page)
        rec('probes', 'swipe_edge_ignored', st['bnavActive'] == 'ibadah', st['bnavActive'])
        car = await page.evaluate("() => !!document.querySelector('#dailyCarousel')")
        if car:
            await drag(page, '#dailyCarousel', -110, 0, 200)
            st = await app_state(page)
            rec('probes', 'swipe_carousel_excluded', st['bnavActive'] == 'ibadah', st['bnavActive'])
        else:
            rec('probes', 'swipe_carousel_excluded', True, 'carousel not present — skipped')

        # ── scroll reset from bottom nav ──
        await scroll_app(page, 800)
        await page.click('.bnav-btn[data-cat="knowledge"]')
        await page.wait_for_timeout(400)
        st = await app_state(page)
        rec('probes', 'bnav_switch_resets_scroll', st['scrollTop'] == 0, st['scrollTop'])

        # ── haptics ──
        await page.click('.bnav-btn[data-cat="ibadah"]')
        await page.wait_for_timeout(400)
        await page.locator('#prayerArea .card-item').nth(0).click()
        await page.wait_for_timeout(250)
        try:
            await page.evaluate("() => { try { window.closeToastOverlay && window.closeToastOverlay(); } catch(e){} }")
        except Exception:
            pass
        st = await app_state(page)
        rec('probes', 'haptic_on_log', 10 in st['vib'], st['vib'])
        await page.evaluate("() => window.App.toggleDhikrHaptic()")
        before = len(st['vib'])
        await page.locator('#prayerArea .card-item').nth(1).click()
        await page.wait_for_timeout(250)
        st = await app_state(page)
        rec('probes', 'haptic_off_silent', len(st['vib']) == before, {'before': before, 'after': len(st['vib'])})

        # ── regression: FAB overlap + equal cards + zero errors ──
        await page.click('.bnav-btn[data-cat="ibadah"]')
        await page.wait_for_timeout(400)
        await scroll_app(page, 0)
        overlap = await page.evaluate("""() => {
          const fab = document.querySelector('.fab-container').getBoundingClientRect();
          const els = document.querySelectorAll('#tier2Tabs button, #tier3Tabs button, .cat-chip, .surah-card, .cal-header button');
          const hits = [];
          els.forEach(el => {
            const r = el.getBoundingClientRect();
            if (r.width && r.height && r.bottom > fab.top && r.top < fab.bottom && r.right > fab.left && r.left < fab.right) hits.push(el.textContent.trim().slice(0, 24));
          });
          return hits;
        }""")
        rec('regression', 'fab_overlap_at_top', len(overlap) == 0, overlap)
        widths = await page.evaluate("() => Array.from(document.querySelectorAll('#prayerArea .card-grid > .card-item')).map(el => Math.round(el.getBoundingClientRect().width))")
        rec('regression', 'prayer_cards_equal', len(widths) == 5 and (max(widths) - min(widths)) <= 1, widths)

        errs_before = len(page_errors)
        for cat in ['ibadah', 'knowledge', 'names_main', 'library', 'profile_main']:
            await page.click('.bnav-btn[data-cat="%s"]' % cat)
            await page.wait_for_timeout(500)
        rec('regression', 'tab_errors_none', len(page_errors) == errs_before, page_errors[errs_before:][:3])

        # ── reduced motion (fresh context) ──
        await ctx.close()
        await browser.close()
        browser2, ctx2, page2 = await boot(pw, reduced_motion='reduce')
        dur = await page2.evaluate("() => getComputedStyle(document.querySelector('.card-item')).transitionDuration")
        rec('regression', 'reduced_motion_clamped', dur in ('0.00001s', '0s'), dur)
        await browser2.close()

    fails = [k for b in results.values() if isinstance(b, dict) for k, v in b.items() if isinstance(v, dict) and not v.get('ok')]
    results['summary'] = {'fails': fails, 'page_errors': page_errors[:10]}
    with open(RESULT, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2)
    print('\nsummary: %d fail(s) -> %s' % (len(fails), RESULT))
    return 1 if fails else 0


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
```

- [ ] **Step 3: Run it:** `python "C:\Users\Mahin\AppData\Local\Temp\opencode\iq-feel-probe.py"` → every probe PASS (exit 0). If a probe fails, diagnose in this order: (1) sticky-under-`overflow-x:clip` (risk 1 — if `compact_pinned` fails, try removing `overflow-x: clip` from `.tier-nav-container` in the media block; if still broken, relocate `.tier-nav-container`'s clip handling and record the change in the spec); (2) timing (raise the waits, not the thresholds); (3) threshold tuning (document any constant change back in the spec §7 risk 3); (4) synth-touch mismatch (verify `page.on('pageerror')` empty and that `Touch` constructor runs — check `drag()` return values).

- [ ] **Step 4: Eyeball the screenshots** in `…\iq-qa\sp2-shots\` — compact bar pinned under the top bar with one chip row; expanded nav back at top; sweep shots show no jarring content jump.

---

### Task 10: Final gate + report

**Files:**
- Update: spec (only if Task 9 required threshold/fallback changes), this plan (tick boxes), tracker `C:\Users\Mahin\AppData\Local\Temp\opencode\sp2-tracker.md`

- [ ] **Step 1: Full suite** — `node --test` from the repo root → all green (expect 565: 551 + 14). Record the output summary line.
- [ ] **Step 2: Syntax gates** — `node --check` on all touched classic files (`core/xp.js`, `core/prayers.js`, `core/quests.js`, `core/static.js`, `core/tabs.js`, `features/fab.js`, `features/pull-refresh.js`, `features/nav-collapse.js`, `features/swipe-nav.js`, `sw.js`) + `node core/check-syntax.js`.
- [ ] **Step 3: Cleanup** — stop the background `python -m http.server` process; verify port 8123 is free.
- [ ] **Step 4: Report** — deliver: what shipped (per scope item), the probe JSON numbers + screenshot list, the version-bump table as executed, known trade-offs (haptic toggle now global; collapse thresholds tuned to X; anything changed from spec), and remaining SP3 scope. Tick every plan checkbox.

---

## Self-review notes (per writing-plans skill)

- **Spec coverage:** §4.1 → Task 3; §4.2 → Task 5; §4.3 → Task 4; §4.4 → Task 2; §4.5 → Task 6; §4.6 → Task 7; §6 → Tasks 1+8; §5 probes → Task 9; §7 risks → Task 9 steps + tuning rules. No gaps.
- **Placeholders:** none — every edit has exact old/new strings, both new files are complete, the probe script is complete.
- **Type consistency:** `init._done` guard name used in fab.js, pull-refresh.js, nav-collapse.js, swipe-nav.js; `window.iqHaptic`/`iqHaptic` names consistent across Task 2 sites and pins; `_swipeDir`/`_swipeIndex` names match between Task 6 file and Task 1 tests; `nav-compact` class name matches CSS (Task 5), probes (Task 9), spec.
- **Deviation check:** Task 10 will re-run `tests/app-registry.test.js` expectations implicitly (full suite) — `populateFABIcons()` call preserved in fab.js tail.
