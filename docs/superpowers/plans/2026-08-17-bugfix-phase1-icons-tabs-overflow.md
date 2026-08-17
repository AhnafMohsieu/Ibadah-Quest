# Bug-Fix Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the four confirmed mobile defects — empty bottom-nav icons, empty FAB icons, horizontally-scrolling/overflowing tab strips (user wants wrap-into-rows), and viewport overflow — verified by tests and headless Chrome.

**Architecture:** Vanilla JS/HTML/CSS offline PWA, no build step. Fixes are surgical: extend `populateTier1Icons()` in `render/tabs.js` to also fill `.bnav-icon`, add `populateFABIcons()` to `features/fab.js`, and change the tier1/tier2/tier3 tab strips from `flex-wrap: nowrap; overflow-x: auto` to `flex-wrap: wrap` inside the mobile media query in `styles/main.css`. No new files, no renames, no restructure.

**Tech Stack:** Vanilla JS (ES5-style IIFEs), HTML, CSS custom properties, Node 24 `node --test` for tests, CDP harness (headless Chrome) for browser verification.

## Global Constraints

- All 312 existing tests must keep passing: `node --test tests/*.test.js`.
- Required CSS markers MUST stay in `styles/main.css`: `--bg: #ddd3ea`, `--gold: #f43f5e`, `--shadow-light`, `backdrop-filter`, `.header-crescent`, `@keyframes moonFloat`, `@keyframes xpWave`, `.xp-inner`, `.streak-bar`, `.best-num`, `.t1-btn.active`, `.prayer-times-grid`, `.pt-card`, all 6 theme blocks (`html[data-theme="serene"]`/`royal`/`sand`/`midnight`/`cream`/`emara`), `.garden-tree svg`, `border-radius: var(--radius) var(--radius) 6px 6px`, `transition: background 300ms`, `transition: transform 200ms`, `align-items: stretch`.
- FORBIDDEN markers (tests assert absence): `html[data-theme="dark"]`, `html[data-theme="night"]`, `html[data-theme="serene-dark"]`, `--bg: #0b1513`, `--emerald: #10b981`, `--gold: #D4AF37`, `tailwindcss`, `panel-leaderboard`.
- `tests/html.test.js:366-372` keys off the FIRST `@media (max-width: 600px)` block in `main.css` and asserts it contains `.t1-btn` AND `width: auto;` within the first 400 chars. The Task 3 CSS replacement MUST keep `.t1-btn` and `width: auto;` inside the first 600px media query, and MUST keep that query as the file's first 600px query (do not insert a new 600px query before it).
- No bundler. No new dependencies. `window.*` API surface unchanged (only additions).
- Work on a feature branch created from `main` (`git checkout -b feat/bugfix-phase1`), commit per task.

---

### Task 1: Fill bottom-nav icons via populateTier1Icons

**Files:**
- Modify: `render/tabs.js:323-333` (`populateTier1Icons`)
- Modify: `index.html:345-355` (inline icon-fill script)
- Test: `tests/app-registry.test.js` (append)

**Interfaces:**
- Consumes: existing `populateTier1Icons()` (called from `core/actions.js:329` in `init()`), the `#bnav .bnav-btn` markup at `index.html:571-577`, `window.iqIcon`.
- Produces: `.bnav-icon` spans filled with `<img class="iq-icon" ...>`; the exported `window.populateTier1Icons` now also fills bottom-nav buttons. Later tasks do not depend on this.

- [ ] **Step 1: Write the failing test**

Append to `tests/app-registry.test.js`:

```js
test('populateTier1Icons fills bnav icons too', () => {
  const tabsSrc = require('fs').readFileSync(require('path').join(__dirname, '..', 'render', 'tabs.js'), 'utf8');
  const fnIdx = tabsSrc.indexOf('function populateTier1Icons');
  assert.ok(fnIdx > -1, 'populateTier1Icons must exist');
  const body = tabsSrc.slice(fnIdx, fnIdx + 500);
  assert.ok(body.includes('.bnav-btn'), 'populateTier1Icons must fill .bnav-btn');
  assert.ok(body.includes('.bnav-icon'), 'populateTier1Icons must target .bnav-icon');
});
```

Note: `test`/`assert` and `fs`/`path` are already defined at the top of `tests/app-registry.test.js` — do not redeclare them.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/app-registry.test.js`
Expected: FAIL — `populateTier1Icons` body does not mention `.bnav-btn`.

- [ ] **Step 3: Extend populateTier1Icons**

In `render/tabs.js`, replace the whole `populateTier1Icons` function (lines 323-333) with:

```js
  function populateTier1Icons() {
    var buttons = document.querySelectorAll('.t1-btn');
    buttons.forEach(function(btn) {
      var span = btn.querySelector('.iq-inline');
      if (!span || span.childElementCount > 0) return;
      var cat = btn.getAttribute('data-cat');
      if (!cat) return;
      var icon = window.iqIcon(cat);
      if (icon) span.innerHTML = icon;
    });
    document.querySelectorAll('.bnav-btn').forEach(function(btn) {
      var span = btn.querySelector('.bnav-icon');
      if (!span || span.childElementCount > 0) return;
      var cat = btn.getAttribute('data-cat');
      if (!cat) return;
      var icon = window.iqIcon(cat);
      if (icon) span.innerHTML = icon;
    });
  }
```

- [ ] **Step 4: Remove the dead bnav fill from the inline script**

In `index.html`, replace lines 345-355 (the inline icon-fill script) with:

```html
<script>
  if (typeof iqIcon !== 'function') { function iqIcon(){return '';} function iqEmoji(){return '';} }
  document.querySelectorAll('.tier1-tabs .t1-btn').forEach(function (b) {
    var s = b.querySelector('.iq-inline');
    if (s) s.innerHTML = iqIcon(b.getAttribute('data-cat'));
  });
</script>
```

(The `#bnav` element does not exist when this inline script runs — bnav icons are now filled by `populateTier1Icons` in `init()`, after the full DOM is parsed.)

- [ ] **Step 5: Run test to verify it passes**

Run: `node --test tests/app-registry.test.js`
Expected: PASS. Then full suite: `node --test tests/*.test.js` — expect 313 pass.

- [ ] **Step 6: Commit**

```bash
git add render/tabs.js index.html tests/app-registry.test.js
git commit -m "fix: fill bottom-nav icons via populateTier1Icons (bnav markup postdates inline fill)"
```

---

### Task 2: Populate FAB action icons

**Files:**
- Modify: `features/fab.js` (add `populateFABIcons`, export it, call from `initFAB`)
- Test: `tests/app-registry.test.js` (append)

**Interfaces:**
- Consumes: the `.fab-action` markup at `index.html:568-572` (buttons with `title` attrs `Log Prayer`/`Dhikr`/`Charity`/`Quests`), `window.iqIcon`.
- Produces: `window.populateFABIcons` (fills `.fab-action-icon` spans); called by `initFAB()`. Task 5's headless check verifies the spans are non-empty.

- [ ] **Step 1: Write the failing test**

Append to `tests/app-registry.test.js`:

```js
test('populateFABIcons exists and is exported', () => {
  const fabSrc = require('fs').readFileSync(require('path').join(__dirname, '..', 'features', 'fab.js'), 'utf8');
  assert.ok(fabSrc.includes('function populateFABIcons'), 'populateFABIcons must exist');
  assert.ok(fabSrc.includes('window.populateFABIcons'), 'populateFABIcons must be exported');
  assert.ok(fabSrc.includes('populateFABIcons()'), 'initFAB must call populateFABIcons');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/app-registry.test.js`
Expected: FAIL — no `populateFABIcons` in `features/fab.js`.

- [ ] **Step 3: Add populateFABIcons to features/fab.js**

In `features/fab.js`, add this function after `close()` (line 27) and before `init()` (line 29):

```js
  function populateFABIcons() {
    var map = { 'Log Prayer': 'prayer', 'Dhikr': 'dhikr', 'Charity': 'charity', 'Quests': 'quests' };
    document.querySelectorAll('.fab-action').forEach(function (a) {
      var icon = a.querySelector('.fab-action-icon');
      if (!icon || icon.childElementCount > 0) return;
      var key = map[a.getAttribute('title')];
      if (key && window.iqIcon) icon.innerHTML = window.iqIcon(key);
    });
  }
```

In `init()`, add the call as the first line inside the `if (fab) return;` guard check — specifically after the `if (!fab) return;` line (line 32), so the icons fill as soon as the FAB exists:

```js
    populateFABIcons();
```

In the exports block (lines 71-73), add:

```js
  window.populateFABIcons = populateFABIcons;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/app-registry.test.js`
Expected: PASS. Then full suite: `node --test tests/*.test.js` — expect 314 pass.

- [ ] **Step 5: Commit**

```bash
git add features/fab.js tests/app-registry.test.js
git commit -m "fix: populate FAB action icons"
```

---

### Task 3: Wrap tab strips into rows on mobile (no horizontal scroll)

**Files:**
- Modify: `styles/main.css:415` (mobile tier1 rule)
- Modify: `styles/main.css:479-493` (tier2/tier3 scroll + tabs rules)
- Test: `tests/html.test.js` (append)

**Interfaces:**
- Consumes: existing `.tier1-tabs`, `.tier2-tabs`, `.tier3-tabs`, `.t2-btn`, `.cat-chip`, `.t3-btn` markup rendered by `render/tabs.js`.
- Produces: `flex-wrap: wrap` behavior on all tab strips within the `@media (max-width: 600px)` / `@media (max-width: 767px)` ranges so all buttons are visible without horizontal scrolling. Task 5's headless check verifies zero horizontal overflow and `#bnav` visible.

- [ ] **Step 1: Write the failing test**

Append to `tests/html.test.js`:

```js
test('mobile tab strips wrap instead of scrolling', () => {
  const mqIdx = css.indexOf('@media (max-width: 600px)');
  assert.ok(mqIdx > -1, 'mobile media query must exist');
  const mobileBlock = css.slice(mqIdx, mqIdx + 400);
  assert.ok(mobileBlock.includes('flex-wrap: wrap'), 'mobile tier1 must flex-wrap: wrap');
  assert.ok(!mobileBlock.includes('overflow-x: auto'), 'mobile tier1 must not overflow-x: auto');
  assert.ok(css.includes('.tier2-tabs.cat-chips') && css.includes('flex-wrap: wrap'),
    'tier2 cat-chips must flex-wrap: wrap somewhere');
});
```

Note: `css`/`html`/`test`/`assert` are already defined at the top of `tests/html.test.js`. This test MUST NOT break the existing `tests/html.test.js:366-372` test (it reads the same first 400 chars of the first 600px query and asserts `.t1-btn` + `width: auto;` are present) — your replacement must keep those inside the window.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/html.test.js`
Expected: FAIL — first 400 chars of the 600px block have `overflow-x: auto` and no `flex-wrap: wrap`.

- [ ] **Step 3: Replace the mobile tier1 rule**

In `styles/main.css`, replace line 415 with:

```css
@media (max-width: 600px) { .tier1-tabs { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; padding-bottom: 4px; } .tier1-tabs .t1-btn { flex: 0 0 auto; min-width: 92px; width: auto; } }
```

This keeps `.t1-btn` and `width: auto;` within the first 400 chars (the `tests/html.test.js:366-372` assertion stays satisfied) and removes `overflow-x: auto`/`overflow-y: hidden`/`scrollbar-width`.

- [ ] **Step 4: Wrap tier2/tier3 strips**

In `styles/main.css`, make these replacements:

Line 479 — `.tier2-scroll`:
```css
.tier2-scroll { width: 100%; overflow-x: hidden; }
```

Line 480 — `.tier2-tabs`:
```css
.tier2-tabs { display: flex; flex-wrap: wrap; justify-content: center; align-items: stretch; gap: 8px; margin-top: 12px; padding: 4px 2px; }
```

Line 486 — `.tier2-tabs.cat-chips`:
```css
.tier2-tabs.cat-chips { display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 8px; margin-top: 16px; border-bottom: 1px solid var(--border); padding: 4px 2px 12px; }
```

Line 492 — `.tier3-scroll`:
```css
.tier3-scroll { width: 100%; overflow-x: hidden; }
```

Line 493 — `.tier3-tabs`:
```css
.tier3-tabs { display: flex; flex-wrap: wrap; justify-content: center; align-items: stretch; gap: 8px; margin-top: 10px; padding: 4px 2px; }
```

Keep `.t2-btn`, `.cat-chip`, `.t3-btn` rules unchanged (they already use `flex: 0 0 auto` + `white-space: nowrap`, which is fine inside a wrapping flex row).

- [ ] **Step 5: Run tests to verify they pass**

Run: `node --test tests/html.test.js`
Expected: PASS (new test + `tests/html.test.js:366-372` still passes). Then full suite: `node --test tests/*.test.js` — expect 315 pass.

- [ ] **Step 6: Headless Chrome mobile check**

Run: `node C:\Users\Mahin\AppData\Local\Temp\opencode\cdp_dev.js` (server on 8910 still running; harness auto-launches headless Chrome at 390×844).
Expected: RESULT: PASS (bnav 5 buttons, t1 widths 92-160px, tier nav above fold, zero errors). Note the fold-ratio check uses `navBottom < innerH` — wrapping tier1 into more rows pushes it lower; if it drops below the fold the task is still acceptable as long as `navBottom < innerH` (PASS). If the harness reports FAIL only because tier-nav bottom ≥ innerHeight, that's expected from wrapping — report it, do NOT "fix" it by reverting the wrap.

- [ ] **Step 7: Commit**

```bash
git add styles/main.css tests/html.test.js
git commit -m "fix: wrap tab strips into rows on mobile (no horizontal scroll)"
```

---

### Task 4: Verify overflow eliminated and icons present (verification-only)

**Files:**
- Test: run CDP harnesses (no code changes unless a regression is found)

**Interfaces:**
- Consumes: Tasks 1-3.

- [ ] **Step 1: Run full test suite**

Run: `node --test tests/*.test.js`
Expected: 315 pass, 0 fail.

- [ ] **Step 2: Overflow + icon verification at 390×844**

Run: `node C:\Users\Mahin\AppData\Local\Temp\opencode\cdp_full.js`
Expected:
- `=== CONSOLE (unique) ===` shows only the init log + the meta deprecation warning (no EXC/WARNING from app code).
- `=== LAYOUT ===` shows `overflowing els: NONE` (zero elements with `getBoundingClientRect().right > clientWidth + 2`).
- `=== FAB check ===` shows `fab action icons: ok,ok,ok,ok`.
- `broken imgs: NONE`.

Note: `cdp_full.js` is in the temp harness dir; if it was cleaned, recreate it from the summary of its behavior (clicks every category/tab while capturing console, checks overflow by iterating `body *`, opens the FAB via `document.getElementById('fabMain').click()` and reports `.fab-action-icon` innerHTML length).

- [ ] **Step 3: Verify bnav icons present**

Run: `node C:\Users\Mahin\AppData\Local\Temp\opencode\cdp_iconinspect.js`
Expected: `=== BNAV ===` shows all five rows with `innerHTML=[<img class="iq-icon" ...` (non-empty).

- [ ] **Step 4: Interaction smoke test (mobile + desktop)**

Run: `node C:\Users\Mahin\AppData\Local\Temp\opencode\cdp_clicks.js mobile` then `node C:\Users\Mahin\AppData\Local\Temp\opencode\cdp_clicks.js desktop`
Expected: both `RESULT: PASS`, `EMPTY/BROKEN TABS: NONE`, 0 exceptions, 0 console error calls.

- [ ] **Step 5: Fix any regressions and re-verify**

If any check fails, fix the offending file, re-run Steps 1-4 until green. If the wrap causes a real layout regression (e.g., tier3 tabs disappear, a panel overflows), fix it in the same files from Task 3 and note it in the report.

- [ ] **Step 6: Commit any fixes**

```bash
git add -A
git commit -m "chore: bugfix phase 1 verification fixes"
```

(If no fixes were needed, skip this commit and note "no fixes needed" in the report.)

---

## Self-Review

**Spec coverage:**
- Fix bnav icons → Task 1.
- Add FAB icon population → Task 2.
- Wrap tabs into rows, no horizontal scroll → Task 3.
- Eliminate horizontal viewport overflow → Task 3 CSS + Task 4 verification.
- Tests + headless verification → every task + Task 4.

**Notes:**
- The `tests/html.test.js:366-372` first-600px-query assertion is protected in Task 3 by keeping `.t1-btn` and `width: auto;` in the replacement (and the file already has the tier1 query first, before the `.hero-strip` queries added in the redesign — verified).
- The deferred cleanup workstream (script consolidation, dead code, architecture) is intentionally NOT in this plan.