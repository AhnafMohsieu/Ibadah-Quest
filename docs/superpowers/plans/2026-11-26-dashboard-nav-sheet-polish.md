# Sub-project 1: Dashboard Hierarchy, Desktop/Tablet Navigation & Sheet Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolve the home dashboard hierarchy, desktop/tablet category navigation, overlapping FAB, Masjid Check-ins desktop layout, closed-overlay `inert`/focus management, and empty-session Daily Summary boot ambush defects across desktop, tablet, and phone viewports.

**Architecture:** All edits target the Legacy SPA layer (`index.html`, `styles/main.css`, `core/tabs.js`, `features/iq-shell.js`, `features/masjid-checkins.js`, `features/daily-summary.js`, `sw.js`) with classic IIFE/global contracts preserved and verified via Node `node --test` unit/structural checks + live Playwright multi-viewport browser audits.

**Tech Stack:** Vanilla HTML/CSS/JS (classic scripts + IIFEs), Service Worker (`sw.js`), Node built-in test runner (`node --test`), Playwright Chromium (`sync_playwright`).

## Global Constraints

- Legacy script contracts preserved (`window.switchCategory`, `window.activateTab`, `window.renderIqFeed`, `window.openIqDrawer`, `window.openChallengeDetail`, `window.openMasjidCheckins`, `window.showDailySummary`, `#fab` registry contracts).
- Preserve base `#dateLine{display:none` rule prior to `@media (max-width: 767px)` and `#dateLine{display:block;}` inside `@media (pointer:coarse) and (max-width: 767px)`.
- Bump `?v=` pins on all touched assets (`styles/main.css?v=50`, `core/tabs.js?v=15`, `features/daily-summary.js?v=2`, `features/masjid-checkins.js?v=2`, `features/iq-shell.js?v=3`, `sw.js?v=63`) plus `MANIFEST_REV = 23` in `sw.js`.
- Windows PowerShell 5.1 command syntax (`;` chaining, no `&&`). Do not commit unless explicitly asked.

---

### Task 1: Empty-Profile Daily Summary Boot Restraint (`features/daily-summary.js`)

**Files:**
- Modify: `features/daily-summary.js:1-45`
- Test: `tests/daily-summary.test.js`

**Interfaces:**
- Produces: `window.showDailySummary(onDone, force)` skipping empty initial profiles (`xp === 0 && cs === 0 && Object.keys(S.log || {}).length === 0`) unless `force === true`.

- [ ] **Step 1: Write the failing tests in `tests/daily-summary.test.js`**

```js
test('showDailySummary skips auto-popup on zero-activity first-run profile while still calling onDone', () => {
  let opened = 0;
  let doneCalled = 0;
  const S = { log: {}, xp: 0, dq: [], cs: 0, lastDailySummary: null };
  const sandbox = loadFile(path.join(__dirname, '..', 'features', 'daily-summary.js'), {
    S,
    today: () => '2026-11-26',
    saveState: () => {},
    openToastModal: () => { opened++; return null; },
    document: { getElementById: () => null }
  });

  sandbox.window.showDailySummary(() => { doneCalled++; });
  assert.strictEqual(opened, 0, 'must not open summary modal for zero-activity profile');
  assert.strictEqual(doneCalled, 1, 'continuation callback still advances queue');
  assert.strictEqual(S.lastDailySummary, null, 'must not stamp lastDailySummary when skipped');
});

test('showDailySummary opens on zero-activity profile when force === true', () => {
  let opened = 0;
  const S = { log: {}, xp: 0, dq: [], cs: 0, lastDailySummary: null };
  const sandbox = loadFile(path.join(__dirname, '..', 'features', 'daily-summary.js'), {
    S,
    today: () => '2026-11-26',
    saveState: () => {},
    openToastModal: (html) => { opened++; return { innerHTML: html, style: {} }; },
    document: { getElementById: () => null }
  });

  sandbox.window.showDailySummary(null, true);
  assert.strictEqual(opened, 1, 'forced open still launches summary modal');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/daily-summary.test.js`
Expected: FAIL on `must not open summary modal for zero-activity profile`.

- [ ] **Step 3: Write minimal implementation in `features/daily-summary.js`**

Update `function showDailySummary(onDone, force)`:
```js
  function showDailySummary(onDone, force) {
    const t = today();
    if (S.lastDailySummary === t) {
      if (typeof onDone === 'function') onDone();
      return;
    }
    const hasActivity = Number(S.xp || 0) > 0
      || Number(S.cs || 0) > 0
      || Object.keys(S.log || {}).length > 0;
    if (!force && !hasActivity) {
      if (typeof onDone === 'function') onDone();
      return;
    }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --check features/daily-summary.js; node --test tests/daily-summary.test.js`
Expected: PASS (0 failures).

---

### Task 2: Hero Title Uniqueness, Focus Restoration & `inert` Overlay Handling (`features/iq-shell.js`, `features/masjid-checkins.js`, `index.html`)

**Files:**
- Modify: `features/iq-shell.js:104-129, 326-349, 518-624`
- Modify: `features/masjid-checkins.js:188-265`
- Modify: `index.html:627-674`
- Test: `tests/iq-shell.test.js`, `tests/masjid-checkins.test.js`

**Interfaces:**
- Produces: Hero renders `"Today's Focus"` (removing duplicate `"Daily challenges"`), `#iqDrawer`, `#iqNotifDrawer`, `#iqChallengeSheet`, and `#iqMasjidSheet` manage `aria-hidden` + `inert` + non-ping-pong focus capture/restoration cleanly, and Masjid sheet uses `"Masjid Check-ins"` / `"Check-in History"` title casing with `.iq-mc-workspace` wrapper for `map` and `calendar`.

- [ ] **Step 1: Write failing tests in `tests/iq-shell.test.js` and `tests/masjid-checkins.test.js`**

In `tests/iq-shell.test.js`:
```js
test('hero challenge uses "Today\'s Focus" and overlays manage inert + aria-hidden', () => {
  const { sb, els } = setupShell();
  sb.window.renderIqFeed();
  assert.ok(els.iqHeroChallenge.innerHTML.includes("Today's Focus"), 'hero summary must be titled Today\'s Focus');
  assert.ok(!els.iqHeroChallenge.innerHTML.includes('Daily challenges'), 'hero summary must not duplicate Daily challenges');

  sb.window.openChallengeDetail('dhikr');
  assert.strictEqual(els.iqChallengeSheet.inert, false, 'open sheet must clear inert');
  sb.window.closeChallengeDetail();
  assert.strictEqual(els.iqChallengeSheet.inert, true, 'closed sheet must set inert');

  sb.window.openIqDrawer();
  assert.strictEqual(els.iqDrawer.inert, false, 'open drawer must clear inert');
  sb.window.closeIqDrawer();
  assert.strictEqual(els.iqDrawer.inert, true, 'closed drawer must set inert');
});
```

In `tests/masjid-checkins.test.js`:
```js
test('renderMasjidSheet wraps view + form in workspace and uses Title Case headings', () => {
  const { sb, els } = setupMasjid();
  sb.window.renderMasjidSheet('map');
  assert.ok(els.iqMasjidBody.innerHTML.includes('class="iq-mc-workspace"'), 'map view must wrap visual + form in iq-mc-workspace');
  assert.ok(els.iqMasjidBody.innerHTML.includes('Check-in History'), 'history label must use Check-in History');
  assert.ok(!els.iqMasjidBody.innerHTML.includes('>masjid check-ins<'), 'lowercase masjid check-ins must be removed');

  sb.window.openMasjidCheckins('map');
  assert.strictEqual(els.iqMasjidSheet.inert, false, 'open masjid sheet clears inert');
  sb.window.closeMasjidCheckins();
  assert.strictEqual(els.iqMasjidSheet.inert, true, 'closed masjid sheet sets inert');
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/iq-shell.test.js tests/masjid-checkins.test.js`
Expected: FAIL on `"Today's Focus"`, `inert`, and `iq-mc-workspace`.

- [ ] **Step 3: Implement overlay `inert`/focus management, `"Today's Focus"`, and Masjid layout markup**

1. In `features/iq-shell.js`:
   - Add shared helpers `_lastFocusedTrigger` tracking (`_transitioningOverlay` flag so `closeActiveSheet()` inside `openChallengeDetail` / `openMasjidCheckins` / `openNotifDrawer` preserves `_lastFocusedTrigger` without intermediate restore), `_setOverlayOpen(el, open, cls)` setting `classList`, `aria-hidden`, and `el.inert = !open`, `_focusInside(el)` focusing the first focusable control (`button, input, select, [tabindex="0"]`), and `_restoreTriggerFocus()` returning focus if `!isAnyOverlayOpen()` and trigger is connected.
   - Change `heroEl.innerHTML` title from `'Daily challenges'` to `'Today\'s Focus'`.
2. In `features/masjid-checkins.js`:
   - Wrap `viewHtml + formHtml` inside `<div class="iq-mc-workspace">...</div>` when `viewHtml` is non-empty, keep `formHtml` standalone on `history`, and change label `'masjid check-ins'` to `'Check-in History'`.
   - Update `openMasjidCheckins` / `closeMasjidCheckins` to set `sheet.inert = false / true`, focus inside on open, and delegate trigger focus restoration cleanly (`window.restoreIqTriggerFocus && window.restoreIqTriggerFocus()` when closing directly without transitioning).
3. In `index.html`:
   - Add `inert` attribute to `#iqDrawer`, `#iqNotifDrawer`, `#iqChallengeSheet`, and `#iqMasjidSheet`.
   - Change `<h2 class="iq-sheet-title">masjid check-ins</h2>` to `<h2 class="iq-sheet-title">Masjid Check-ins</h2>`.

- [ ] **Step 4: Run syntax & unit tests to verify pass**

Run: `node --check features/iq-shell.js; node --check features/masjid-checkins.js; node --test tests/iq-shell.test.js tests/masjid-checkins.test.js`
Expected: PASS (0 failures).

---

### Task 3: Top-Bar Desktop Category Navigation, `#dateLine` Anchoring, Tablet Hero Grid & CSS Polish (`index.html`, `core/tabs.js`, `styles/main.css`, `sw.js`, `tests/html.test.js`)

**Files:**
- Modify: `index.html:160-225, 481, 554, 569, 570, 608`
- Modify: `core/tabs.js:114-214`
- Modify: `styles/main.css`
- Modify: `sw.js:7`
- Modify: `tests/html.test.js`

**Interfaces:**
- Produces: `#topCatNav` in `#topBar` synced on `switchCategory()` and `activateTab()`, `#dateLine` inside `.hero-strip` above `.global-search-wrap`, tablet (`768px`) 2-column `.hero-strip` grid parity, `.fab-container` hidden at `>= 768px`, `.iq-mc-workspace` 2-column grid at `>= 900px`, closed sheets/drawers `visibility: hidden`, and bumped `?v=` / `MANIFEST_REV = 23`.

- [ ] **Step 1: Update & add structural tests in `tests/html.test.js` (RED first)**

Add tests asserting:
- `html.includes('id="topCatNav"')` and all 5 `data-cat` buttons (`ibadah`, `knowledge`, `names_main`, `library`, `profile_main`) inside `#topBar`.
- `renderTabs.includes('.iq-top-cat-btn')` in both `switchCategory` and `activateTab`.
- `#dateLine` sits inside `.hero-strip` (`dateIdx > heroIdx && dateIdx < heroCloseIdx`).
- `html.includes('Masjid Check-ins')` and closed overlays have `inert`.
- `css` applies `visibility: hidden` when `.iq-sheet-overlay` / `.iq-drawer` is closed, `.hero-strip` 2-column grid starts at `@media (min-width: 768px)`, `.iq-mc-workspace` desktop split exists, and `@media (min-width: 768px)` hides `.fab-container`.
- Updated `?v=` pins (`styles/main.css?v=50`, `core/tabs.js?v=15`, `features/daily-summary.js?v=2`, `features/masjid-checkins.js?v=2`, `features/iq-shell.js?v=3`, `sw.js?v=63`).

- [ ] **Step 2: Run tests to verify RED**

Run: `node --test tests/html.test.js`
Expected: FAIL on missing `#topCatNav`, updated pins, etc.

- [ ] **Step 3: Apply HTML, Tabs JS, CSS, and SW changes**

1. `index.html`:
   - Add `#topCatNav.iq-top-catnav` inside `#topBar` between `.tb-left` and `.tb-right`.
   - Move `<div id="dateLine" class="date-line" aria-live="off"></div>` into `.hero-strip` right above `.global-search-wrap`.
   - Bump `styles/main.css?v=50`, `core/tabs.js?v=15`, `features/daily-summary.js?v=2`, `features/masjid-checkins.js?v=2`, `features/iq-shell.js?v=3`, `sw.js?v=63`.
2. `core/tabs.js`:
   - Extract helper `_syncNavButtons(catId)` updating both `.bnav-btn` and `.iq-top-cat-btn` `active` class + `aria-selected`, called in `switchCategory` and `activateTab`.
3. `styles/main.css`:
   - Style `.iq-top-catnav` (`display: none` default; at `@media (min-width: 768px)` centered inline pill strip; compact sizing at `768px–959px`; hide `.tb-title` below `980px`).
   - Add `visibility: hidden` to closed `.iq-drawer` and `.iq-sheet-overlay` (and `visibility: visible` on `.open`).
   - Move `@media (min-width: 820px)` `.hero-strip` grid rules cleanly into `@media (min-width: 768px)` so tablets (`768px+`) render `#iqHeroChallenge` + card-styled `.level-row` + `.streak-bar` seamlessly.
   - Add `.fab-container { display: none; }` inside `@media (min-width: 768px)`.
   - Remove `text-transform: lowercase` on `.iq-section-label`, add `.iq-mc-workspace` 2-column grid + `#iqMasjidSheet .iq-sheet-body { max-width: 68rem; }` + `.iq-masjid-map-svg { max-height: 290px; }` at `@media (min-width: 900px)`.
4. `sw.js`:
   - Bump `const MANIFEST_REV = 23;`.

- [ ] **Step 4: Run full syntax, test suite, graphify, and Playwright visual audit**

Run:
- `node --check core/tabs.js; node core/check-syntax.js; node --test tests/*.test.js`
- `graphify.exe update .`
- Live Playwright audit at `1280x800`, `768x1024`, `390x844` checking:
  - Zero console/page errors, zero horizontal overflow
  - No modal popup on fresh `xp: 0` session
  - `#topCatNav` category switch to `Knowledge` & back to `Home`
  - Single `"Daily challenges"` heading + `"Today's Focus"` hero card
  - Boxed `NEW SEEKER` card chrome on `768x1024`
  - Closed sheets truly hidden & `inert` (`modalsOpen: []`)
  - Side-by-side Masjid Check-ins workspace on desktop + proper `"Masjid Check-ins"` title
  - Visual screenshot inspection via `read_file`
