# Remove Mood Feature + Even-Grid Tab Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Delete the Mood feature entirely (tab, tracker, panel, achievements, data, styles) and restyle the mobile tab strips as equal-width grids (tier1 = 5 across, tier2/tier3 = 4 per row) so they look tidy instead of scattered.

**Architecture:** Pure deletion + CSS-only layout change in the vanilla JS/HTML/CSS offline PWA. No new files, no new dependencies, no build step. The Mood removal touches data files, index.html, render/tabs.js, render/dynamic.js, state/state.js, data/achievements.js, data/icons.js, and deletes `features/mood.js` + `data/pools/mood.js`. The tab restyle changes `styles/main.css` tab-strip rules and rewrites one existing test to assert the grid instead of the old wrap.

**Tech Stack:** Vanilla JS (ES5-style IIFEs), HTML, CSS, Node 24 `node --test` for tests, CDP harness (headless Chrome) for browser verification.

## Global Constraints

- All existing tests must keep passing: `node --test tests/*.test.js`. Currently 315 pass / 0 fail.
- `tests/html.test.js:366-372` keys off the FIRST `@media (max-width: 600px)` block in `main.css` and asserts `.t1-btn` AND `width: auto;` appear within the first 400 chars of that block. Task 4 MUST keep `.t1-btn` and `width: auto;` inside the first 400 chars and MUST keep that query as the file's first 600px query.
- Required CSS markers MUST stay in `styles/main.css`: `--bg: #ddd3ea`, `--gold: #f43f5e`, `--shadow-light`, `backdrop-filter`, `.header-crescent`, `@keyframes moonFloat`, `@keyframes xpWave`, `.xp-inner`, `.streak-bar`, `.best-num`, `.t1-btn.active`, `.prayer-times-grid`, `.pt-card`, all 6 theme blocks, `.garden-tree svg`, `border-radius: var(--radius) var(--radius) 6px 6px`, `transition: background 300ms`, `transition: transform 200ms`, `align-items: stretch`.
- FORBIDDEN markers (tests assert absence): `html[data-theme="dark"]`, `html[data-theme="night"]`, `html[data-theme="serene-dark"]`, `--bg: #0b1513`, `--emerald: #10b981`, `--gold: #D4AF37`, `tailwindcss`, `panel-leaderboard`.
- `.mood-btn` and `.mood-streak` must NOT appear anywhere in `styles/main.css` after Task 1.
- `panel-mood`, `moodArea`, `moodLog`, `renderMoodTab`, `moodTracker`, `pools/mood.js`, `features/mood.js`, `'mood':'rainbow'`, `['mood', 'cloud-sun']`, achievements `a225`-`a234` and `a285` must NOT appear anywhere in the app source after Task 1. (`cloud-lightning` icon key stays — used by istisqa and spiritual-growth.)
- Desktop (>600px) layout unchanged: tier1 stays 5-col grid; tier2/tier3 keep their current desktop rules.
- Work on a feature branch (currently `feat/bugfix-phase1`). Commit per task.
- No bundler. No new dependencies. `window.*` API surface only removals (moodTracker, renderMoodTab), no new additions.

---

### Task 1: Remove Mood feature entirely

**Files:**
- Modify: `data/tab-groups.js:17` (remove mood tab)
- Modify: `index.html:166` (remove panel-mood), `index.html:385` (remove pools/mood.js script), `index.html:485` (remove features/mood.js script)
- Modify: `render/dynamic.js:78` (remove renderMoodTab call)
- Modify: `render/tabs.js:95` and `render/tabs.js:114` (remove 'panel-mood' from home arrays)
- Modify: `state/state.js:37` (remove `moodLog:{}`)
- Modify: `data/achievements.js` (remove 11 mood achievements)
- Modify: `data/icons.js:92`, `data/icons.js:174-176`, `data/icons.js:240` (remove mood mappings)
- Modify: `styles/main.css:1662-1671` (remove .mood-* rules)
- Modify: `tests/quests.test.js:52` (remove `moodLog:{}` fixture entry)
- Delete: `features/mood.js`, `data/pools/mood.js`
- Test: `tests/html.test.js` (append)

**Interfaces:**
- Consumes: existing files listed above (verified at the given line numbers).
- Produces: a codebase with zero references to the Mood feature. Later tasks do not depend on this except that the app must still load with no console errors and the Daily tier2 group must have exactly 12 tabs.

- [ ] **Step 1: Write the failing test**

Append to `tests/html.test.js`:

```js
test('Mood feature is fully removed', () => {
  const achievements = fs.readFileSync(path.join(root, 'data', 'achievements.js'), 'utf8');
  const stateSrc = fs.readFileSync(path.join(root, 'state', 'state.js'), 'utf8');
  const iconsSrc = fs.readFileSync(path.join(root, 'data', 'icons.js'), 'utf8');
  assert.ok(!tabs.includes("label: 'Mood'"), 'tab-groups must not list a Mood tab');
  assert.ok(!html.includes('panel-mood'), 'index.html must not have panel-mood');
  assert.ok(!html.includes('moodArea'), 'index.html must not have moodArea');
  assert.ok(!html.includes('pools/mood.js'), 'index.html must not load pools/mood.js');
  assert.ok(!html.includes('features/mood.js'), 'index.html must not load features/mood.js');
  assert.ok(!renderTabs.includes('panel-mood'), 'tabs.js must not reference panel-mood');
  assert.ok(!renderDynamic.includes('renderMoodTab'), 'dynamic.js must not call renderMoodTab');
  assert.ok(!stateSrc.includes('moodLog'), 'state.js must not have moodLog');
  assert.ok(!achievements.includes('Mood Tracker') && !achievements.includes('Reflection') && !achievements.includes('Gratitude Journal') && !achievements.includes('FirstReflection'),
    'achievements must not have mood/reflection/gratitude-journal entries');
  assert.ok(!iconsSrc.includes("'mood':'rainbow'") && !iconsSrc.includes("'great':'sun'") && !iconsSrc.includes("['mood', 'cloud-sun']"),
    'icons.js must not have mood mappings');
  assert.ok(!css.includes('.mood-btn') && !css.includes('.mood-streak'), 'main.css must not have mood styles');
  assert.ok(!fs.existsSync(path.join(root, 'features', 'mood.js')), 'features/mood.js must be deleted');
  assert.ok(!fs.existsSync(path.join(root, 'data', 'pools', 'mood.js')), 'data/pools/mood.js must be deleted');
});
```

Note: `test`/`assert`/`fs`/`path`/`root`/`html`/`tabs`/`css`/`renderTabs`/`renderDynamic` are already defined at the top of `tests/html.test.js` — do not redeclare them. Also: the achievements check uses `'Reflection'` which could match `a286` "Gratitude 3"? No — a286 is named "Gratitude 3", not "Gratitude Journal", so `'Gratitude Journal'` won't match it. Good.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/html.test.js`
Expected: FAIL — every assertion currently passes except the deletion checks (files still exist) and several absence checks.

- [ ] **Step 3: Remove the mood tab from the Daily group**

In `data/tab-groups.js`, remove line 17 (`{ id: 'mood', label: 'Mood' }`). The `ibadah` group must now end with the `finance` tab at line 16.

- [ ] **Step 4: Remove mood from index.html**

In `index.html`:
- Remove line 166: `<div class="tab-panel" role="tabpanel" id="panel-mood"><div id="moodArea"></div></div>`
- Remove line 385: `<script src="data/pools/mood.js?v=2"></script>`
- Remove line 485: `<script src="features/mood.js?v=3" defer></script>`

- [ ] **Step 5: Remove renderMoodTab call**

In `render/dynamic.js:78`, remove the token `safe(() => window.renderMoodTab && window.renderMoodTab(), 'MoodTab'); ` (the whole call including trailing space) from the big `safe(...)` chain.

- [ ] **Step 6: Remove panel-mood from tabs.js**

In `render/tabs.js`, remove `,'panel-mood'` from the end of the home array on line 95 and from the `panelLookup` home array on line 114. Both arrays currently end with `'panel-finance','panel-mood'` — change to end with `'panel-finance'`.

- [ ] **Step 7: Remove moodLog from default state**

In `state/state.js:37`, change `healthLog:{}, financeLog:{}, moodLog:{},` to `healthLog:{}, financeLog:{},`.

- [ ] **Step 8: Remove the 11 mood achievements**

In `data/achievements.js`, remove these lines:
- Line 22: `a225` Mood Tracker 1
- Line 23: `a226` Mood Tracker 7
- Line 24: `a230` Reflection Starter
- Line 25: `a233` Gratitude Journal 10
- Line 38: `a285` FirstReflection
- Line 59: `a227` Mood Tracker 30
- Line 60: `a231` Reflection Writer
- Line 61: `a234` Gratitude Journal 50
- Line 112: `a228` Mood Tracker 100
- Line 113: `a232` Reflection Master
- Line 231: `a229` Mood Tracker 365

Do NOT remove `a286` (Gratitude 3) — it uses `s.gratitudeLog`, a different feature.

- [ ] **Step 9: Remove mood icon mappings**

In `data/icons.js`:
- Line 92: remove `'finance':'wallet', 'mood':'rainbow',` → becomes `'finance':'wallet',`
- Lines 174-176: remove the whole `/* Mood (data/pools/mood.js) */` comment and the `'great':'sun', ...` / `'low':'moon', ...` lines.
- Line 240: remove `['mood', 'cloud-sun'], ` from the array.

- [ ] **Step 10: Remove mood CSS rules**

In `styles/main.css`, remove lines 1662-1671 (`.mood-streak` through `.mood-btn-label`, 10 rules total).

- [ ] **Step 11: Clean the test fixture**

In `tests/quests.test.js:52`, change `healthLog: {}, financeLog: {}, moodLog: {},` to `healthLog: {}, financeLog: {},`.

- [ ] **Step 12: Delete the mood files**

```bash
git rm features/mood.js data/pools/mood.js
```

- [ ] **Step 13: Run test to verify it passes**

Run: `node --test tests/html.test.js`
Expected: PASS. Then full suite: `node --test tests/*.test.js` — expect 316 pass.

- [ ] **Step 14: Commit**

```bash
git add -A
git commit -m "feat: remove Mood feature entirely"
```

---

### Task 2: Fix bnav icon fill timing (populateTier1Icons runs before #bnav exists)

**Files:**
- Modify: `render/tabs.js` (add DOMContentLoaded re-invocation)
- Test: `tests/app-registry.test.js` (append)

**Interfaces:**
- Consumes: `populateTier1Icons()` (already fills `.bnav-icon` spans, idempotent — skips spans with `childElementCount > 0`).
- Produces: bnav icons reliably filled after full DOM parse. Task 5's headless check confirms 5/5 bnav icons non-empty.

**Bug (verified via CDP at 390×844):** `populateTier1Icons()` is called from `core/actions.js:330` inside `init()`, which executes synchronously when `core/actions.js` runs at `index.html:523` — BEFORE the `#bnav` markup at `index.html:567` is parsed. So the `document.querySelectorAll('.bnav-btn')` query inside `populateTier1Icons` returns an empty NodeList at init time and bnav icons stay empty. Tier1 icons are unaffected (filled by the inline script at index.html:347 which runs after the tier1 markup at index.html:122). The FAB had the same class of bug, fixed in commit 8493c1b by calling `populateFABIcons()` at module load (fab.js is a defer script).

- [ ] **Step 1: Write the failing test**

Append to `tests/app-registry.test.js`:

```js
test('populateTier1Icons is re-invoked after DOM ready for bnav', () => {
  const tabsSrc = require('fs').readFileSync(require('path').join(__dirname, '..', 'render', 'tabs.js'), 'utf8');
  assert.ok(tabsSrc.includes('DOMContentLoaded'), 'tabs.js must re-run populateTier1Icons on DOMContentLoaded');
  const dclIdx = tabsSrc.indexOf('DOMContentLoaded');
  const dclBlock = tabsSrc.slice(dclIdx, dclIdx + 200);
  assert.ok(dclBlock.includes('populateTier1Icons'), 'DOMContentLoaded handler must call populateTier1Icons');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/app-registry.test.js`
Expected: FAIL — no `DOMContentLoaded` in `render/tabs.js`.

- [ ] **Step 3: Add the DOMContentLoaded re-invocation**

In `render/tabs.js`, inside the IIFE (before the `})();` closing at line 348), add:

```js
  document.addEventListener('DOMContentLoaded', function() {
    try { populateTier1Icons(); } catch(e) { console.error('bnav icons refill failed:', e); }
  });
```

`populateTier1Icons` is idempotent (skips filled spans), so re-running it after the full DOM parses fills the bnav icons without double-filling tier1. This is safe even though `render/tabs.js` itself is a synchronous script — the listener fires after all markup is parsed, when `#bnav` exists.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/app-registry.test.js`
Expected: PASS. Then full suite: `node --test tests/*.test.js` — expect 317 pass.

- [ ] **Step 5: Verify in headless Chrome**

Run: `node C:\Users\Mahin\AppData\Local\Temp\opencode\cdp_iconcheck.js`
Expected: `bnav icons: ok,ok,ok,ok,ok` (and `fab action icons: ok,ok,ok,ok`).

- [ ] **Step 6: Commit**

```bash
git add render/tabs.js tests/app-registry.test.js
git commit -m "fix: refill bnav icons on DOMContentLoaded (init() ran before #bnav existed)"
```

---

### Task 3: Rewrite the mobile tab-strip test for the grid layout

**Files:**
- Test: `tests/html.test.js` (modify)

**Interfaces:**
- Consumes: nothing at runtime — test-only task. Establishes the assertions Task 4's CSS must satisfy.

- [ ] **Step 1: Rewrite the test**

In `tests/html.test.js`, replace the test at lines 412-420 (`test('mobile tab strips wrap instead of scrolling', ...)`) with:

```js
test('mobile tab strips use even grids (tier1 5-across, tier2/tier3 4-per-row)', () => {
  const mqIdx = css.indexOf('@media (max-width: 600px)');
  assert.ok(mqIdx > -1, 'mobile media query must exist');
  const mobileBlock = css.slice(mqIdx, mqIdx + 600);
  assert.ok(mobileBlock.includes('.t1-btn') && mobileBlock.includes('width: auto;'),
    'mobile .t1-btn must set width: auto (fixes flex-basis:auto resolving to width:100%)');
  assert.ok(mobileBlock.includes('repeat(5, 1fr)'), 'mobile tier1 must be a 5-column grid');
  assert.ok(!mobileBlock.includes('flex-wrap: wrap'), 'mobile tier1 must not flex-wrap');
  assert.ok(!mobileBlock.includes('overflow-x: auto'), 'mobile tab strips must not overflow-x: auto');
  assert.ok(css.includes('.tier2-tabs.cat-chips') && css.includes('repeat(4, 1fr)'),
    'tier2 cat-chips must be a 4-column grid');
  assert.ok(css.includes('grid-template-columns: repeat(4, 1fr)'), 'tier2/tier3 must use 4 columns');
});
```

Note: the CRLF caution from prior tasks — `slice(mqIdx, mqIdx + 600)` on a CRLF file is fine here because `repeat(5, 1fr)` must appear early in the query. If your edit drifts line numbers, match on the `test('mobile tab strips` text instead.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/html.test.js`
Expected: FAIL — current mobile block has `flex-wrap: wrap` and no `repeat(5, 1fr)`.

- [ ] **Step 3: Commit**

```bash
git add tests/html.test.js
git commit -m "test: assert mobile tab strips use even grids instead of wrap"
```

---

### Task 4: Restyle tab strips as even grids (mobile)

**Files:**
- Modify: `styles/main.css:408-415` (tier1 + mobile override)
- Modify: `styles/main.css:479-493` (tier2/tier3 scroll + tabs rules)
- Test: `tests/html.test.js` (already rewritten in Task 3 — no further changes needed)

**Interfaces:**
- Consumes: Task 3's test (must pass), existing `.t1-btn`/`.t2-btn`/`.t3-btn`/`.cat-chip` markup.
- Produces: mobile tab layout where tier1 is 5 equal columns in one row (icon stacked above label), tier2/tier3 are 4 equal columns per row, no horizontal scrolling, no ragged centered rows. Desktop unchanged. Task 5's headless check verifies the real layout.

- [ ] **Step 1: Run the Task 3 test to confirm the target state**

Run: `node --test tests/html.test.js`
Expected: FAIL on the grid assertions (`.t1-btn`/`width:auto` block passes, `repeat(5, 1fr)` missing). This is the red phase.

- [ ] **Step 2: Replace the mobile media query with tier1 + tier2/tier3 grid rules**

In `styles/main.css`, replace line 415:

```css
@media (max-width: 600px) { .tier1-tabs { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; padding-bottom: 4px; } .tier1-tabs .t1-btn { flex: 0 0 auto; min-width: 92px; width: auto; } }
```

with:

```css
@media (max-width: 600px) {
  .tier1-tabs { display: grid; grid-template-columns: repeat(5, 1fr); gap: 4px; padding-bottom: 4px; }
  .tier1-tabs .t1-btn { width: auto; min-width: 0; flex-direction: column; gap: 4px; padding: 10px 2px; font-size: 0.8rem; }
  .tier2-tabs, .tier2-tabs.cat-chips, .tier3-tabs { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
  .tier2-tabs .t2-btn, .tier2-tabs.cat-chips .cat-chip, .tier3-tabs .t3-btn { width: 100%; min-width: 0; justify-content: center; }
}
```

This keeps `.t1-btn` and `width: auto;` inside the first 400 chars of the first 600px query (constraint preserved), removes `flex-wrap`, and makes tier1 a 5-column grid with stacked icon+label and tier2/tier3 4-column grids. Line 415 must remain the file's first 600px query.

- [ ] **Step 3: Leave desktop rules untouched**

The global `.tier2-tabs` (line 480), `.tier2-tabs.cat-chips` (line 486), `.tier3-tabs` (line 493), `.t2-btn` (line 481), `.cat-chip` (line 487), and `.t3-btn` (line 494) rules are NOT modified in this task. They keep their current desktop layout (flex-wrap, centered) — desktop is unchanged per the spec. The mobile media query from Step 2 overrides them at ≤600px. Lines 479 (`.tier2-scroll`) and 492 (`.tier3-scroll`) keep `overflow-x: hidden;`.

- [ ] **Step 5: Run tests to verify they pass**

Run: `node --test tests/html.test.js`
Expected: PASS (new grid test + `tests/html.test.js:366-372` still passes). Then full suite: `node --test tests/*.test.js` — expect 316 pass.

- [ ] **Step 6: Headless Chrome mobile check**

Run: `node C:\Users\Mahin\AppData\Local\Temp\opencode\cdp_tabslayout.js` then `node C:\Users\Mahin\AppData\Local\Temp\opencode\cdp_tier2layout.js` (server on 8910 still running; harnesses auto-launch headless Chrome at 390×844).
Expected:
- cdp_tabslayout: `t1Count: 5`, `rows` = a SINGLE row of 5 buttons (no `[2,2,1]`), `overflowX: false`.
- cdp_tier2layout: `t2Count: 12`, labels contain NO `Mood`, `rows` = exactly 3 rows of 4 equal-width buttons, `overflowX: false`.
If tier1 buttons overflow their cells at 0.8rem (labels like "Knowledge" clipped), reduce the mobile font-size in Step 2's rule to `0.75rem` and re-run until clean.

- [ ] **Step 7: Commit**

```bash
git add styles/main.css
git commit -m "style: even-grid tab strips on mobile (tier1 5-across, tier2/tier3 4-per-row)"
```

---

### Task 5: Verify removal + grid end-to-end (verification-only)

**Files:**
- Test: run full suite + CDP harnesses (no code changes unless a regression is found)

**Interfaces:**
- Consumes: Tasks 1-3.

- [ ] **Step 1: Run full test suite**

Run: `node --test tests/*.test.js`
Expected: 316 pass, 0 fail.

- [ ] **Step 2: Grid layout verification at 390×844**

Run: `node C:\Users\Mahin\AppData\Local\Temp\opencode\cdp_tabslayout.js` and `node C:\Users\Mahin\AppData\Local\Temp\opencode\cdp_tier2layout.js`
Expected:
- tier1: single row, 5 buttons, all equal width, no `overflowX`.
- tier2 (Daily): 12 tabs, no Mood, 3 rows of 4, equal widths, no `overflowX`.
- Also click into a categorized group (Knowledge) and a sub-category (e.g. Heart & Soul) to confirm tier3 tabs render as a 4-col grid with no horizontal scroll and no console errors.

- [ ] **Step 3: Interaction smoke test (mobile + desktop)**

Run: `node C:\Users\Mahin\AppData\Local\Temp\opencode\cdp_clicks.js mobile` then `node C:\Users\Mahin\AppData\Local\Temp\opencode\cdp_clicks.js desktop`
Expected: both `RESULT: PASS`, `EMPTY/BROKEN TABS: NONE`, 0 exceptions, 0 console error calls.

- [ ] **Step 4: Full diagnostic + icons check**

Run: `node C:\Users\Mahin\AppData\Local\Temp\opencode\cdp_full.js` and `node C:\Users\Mahin\AppData\Local\Temp\opencode\cdp_iconinspect.js`
Expected: cdp_full shows `overflowing els: NONE`, `fab action icons: ok,ok,ok,ok`, `broken imgs: NONE`, no EXC/WARNING from app code. cdp_iconinspect shows all five bnav rows with non-empty innerHTML (Tasks from the earlier bugfix phase still intact).

- [ ] **Step 5: Fix any regressions and re-verify**

If any check fails, fix the offending file, re-run Steps 1-4 until green. If the grid causes a real layout regression (e.g., labels clipped, a panel overflows), fix it in the same CSS rules from Task 4 and note it in the report.

- [ ] **Step 6: Commit any fixes**

```bash
git add -A
git commit -m "chore: remove-mood + grid-tabs verification fixes"
```

(If no fixes were needed, skip this commit and note "no fixes needed" in the report.)

---

## Self-Review

**Spec coverage:**
- Remove Mood feature entirely (tab, panel, scripts, files, dynamic call, panel references, state, achievements, icons, CSS, test fixture) → Task 1.
- Fix bnav icon fill timing (init ran before #bnav existed) → Task 2.
- Rewrite the wrap test to assert grids → Task 3.
- Tier1 5-across single row, icon stacked above label → Task 4 Step 2.
- Tier2/tier3 4 per row, equal width, no horizontal scroll, partial last rows left-aligned → Task 4 Steps 3-4.
- Desktop unchanged → Task 4 preserves non-media rules (tier1 desktop rule at 408-414 untouched; only the mobile override at 415 changed).
- Tests + headless verification → every task + Task 5.

**Notes:**
- The `tests/html.test.js:366-372` first-600px-query assertion (`.t1-btn` + `width: auto;` in first 400 chars) is preserved in Task 4 Step 2's replacement.
- `cloud-lightning` icon key is NOT removed (used by `istisqa` in icons.js and spiritual-growth Storm) — Task 1 only removes the mood block's lines 174-176.
- `a286` (Gratitude 3) uses `gratitudeLog`, not `moodLog` — kept.
- `tests/quests.test.js:52` fixture cleanup is included so the codebase has zero mood references.
- The CDP harness `cdp_tabslayout.js` and `cdp_tier2layout.js` were created during design exploration in the temp harness dir — they exist at `C:\Users\Mahin\AppData\Local\Temp\opencode\`. If the temp dir was cleaned, recreate `cdp_tabslayout.js` to report `t1Count`, tier1 `rows`, and `overflowX` at 390×844, and `cdp_tier2layout.js` to report `t2Count`, tier2 `rows`, and `overflowX`.