# Mobile-Friendly Sweep Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make all 154 tabs mobile-friendly per the 2026-09-05 spec — 44px touch-target floor, iOS-zoom-proof inputs, and 3 overflow fixes, all in one phone media query.

**Architecture:** Single additive CSS block in `styles/main.css` (phone `@media (max-width: 600px)`), plus test assertions and cache bumps. No JS changes. The 154-tab audit script is the acceptance gate.

**Tech Stack:** Vanilla JS PWA, plain CSS, Node built-in test runner (`node --test`), Playwright MCP for audit verification.

## Global Constraints

- Do NOT commit unless the plan's final task says so AND the user has approved (repo rule; final commit+push is Task 4 with user's standing approval from spec Section 3).
- Every changed asset referenced with `?v=` in index.html: bump `?v=`, bump `CACHE_NAME` in sw.js, update pinned versions in `tests/html.test.js` and `tests/sw.test.js`. Targets this plan: `styles/main.css?v=21 → ?v=22`, `sw.js?v=31 → ?v=32` registration, `CACHE_NAME 'iq-cache-v31' → 'iq-cache-v32'`.
- Phone media query is `@media (max-width: 600px)`. The FIRST such query in main.css must remain the tier2 grid query (tests read `css.indexOf('@media (max-width: 600px)')` + 400 chars for `.tier2-tabs`); put new rules in the LAST phone block (the one starting `/* ── Phone: wrap nav rows, zero horizontal scroll ── */`, ~line 2664) or a new block appended after it.
- Existing regression test `'phone nav rows wrap with zero horizontal scroll'` (tests/html.test.js) reads `css.lastIndexOf('@media (max-width: 600px)')` — new rules must live in that last block or after it.
- `node --test` must stay green (489/489 at plan time).
- Windows PowerShell 5.1: no `&&`, no `tail`; test command is exactly `node --test`.
- sr-only elements are screen-reader helpers — never "fix" them.

---

## File Structure

- Modify: `styles/main.css` — append touch-target + input + overflow rules inside the existing phone block (`/* ── Phone: wrap nav rows, zero horizontal scroll ── */`, ends before `/* ── Theme Overrides ── */`).
- Modify: `tests/html.test.js` — extend the phone-nav regression test with new assertions.
- Modify: `index.html` — `?v=` bumps only (line 26 main.css, line 581 sw registration).
- Modify: `sw.js` — `CACHE_NAME` bump (line 2).
- Modify: `tests/sw.test.js` — pin bump.
- No new files.

---

### Task 1: Touch-target floor + component bumps (CSS)

**Files:**
- Modify: `styles/main.css` (inside the last phone media block, before its closing `}` — the block containing `.tier1-tabs{flex-wrap:wrap...}`)
- Test: `tests/html.test.js`

**Interfaces:**
- Consumes: existing selectors `.quest-check` (line 729), `.verify-btn` (1485), `.cal-nav button` (931), `.cal-day` (903), `.filter-btn` (1757), `.growth-tab-toggle` (2264), `.dhikr-reset-btn` (1260), `.theme-picker` (1086).
- Produces: phone-only rules later tasks assert by string match: `min-height:44px` floor line, `.verify-btn{min-height:44px`, `.quest-check{width:40px;height:40px`, `.cal-nav button{min-width:44px;min-height:44px`, `.filter-btn{min-height:40px`, `.growth-tab-toggle{min-height:36px`.

- [ ] **Step 1: Write the failing test**

In `tests/html.test.js`, replace the test `'phone nav rows wrap with zero horizontal scroll'` with:

```js
test('phone nav rows wrap with zero horizontal scroll', () => {
  const phoneBlock = css.slice(css.lastIndexOf('@media (max-width: 600px)'));
  assert.ok(phoneBlock.includes('.tier1-tabs{flex-wrap:wrap'), 'tier1 must wrap on phones');
  assert.ok(phoneBlock.includes('#tier2Tabs,#tier3Tabs{flex-wrap:wrap;overflow-x:visible'),
    'tier2/tier3 must wrap instead of snap-scrolling on phones');
  assert.ok(phoneBlock.includes('overflow-x:clip'),
    'phone layout must clip horizontal overflow');
});

test('phone sweep: 44px touch floor and component target bumps', () => {
  const phoneBlock = css.slice(css.lastIndexOf('@media (max-width: 600px)'));
  assert.ok(phoneBlock.includes('button:not(.carousel-dot):not(.t3-btn){min-height:44px;min-width:44px'),
    'global 44px interactive floor missing');
  assert.ok(phoneBlock.includes('.verify-btn{min-height:44px;padding:10px 16px}'),
    'verify buttons must reach 44px');
  assert.ok(phoneBlock.includes('.quest-check{width:40px;height:40px}'),
    'fasting checkbox must reach 40px');
  assert.ok(phoneBlock.includes('.cal-nav button{min-width:44px;min-height:44px}'),
    'calendar nav buttons must reach 44px');
  assert.ok(phoneBlock.includes('.filter-btn{min-height:40px}'),
    'stats range chips must reach 40px');
  assert.ok(phoneBlock.includes('.growth-tab-toggle{min-height:36px}'),
    'growth toggles must reach 36px');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/html.test.js`
Expected: FAIL — `'global 44px interactive floor missing'` (new test) while the wrap test still passes.

- [ ] **Step 3: Write minimal implementation**

In `styles/main.css`, inside the last phone media block (the one containing `.tier1-tabs{flex-wrap:wrap`), add these lines just before the block's closing `}` (after the `.tab-content,.tier-nav-container{overflow-x:clip;}` line):

```css
  button:not(.carousel-dot):not(.t3-btn){min-height:44px;min-width:44px}
  .verify-btn{min-height:44px;padding:10px 16px}
  .quest-check{width:40px;height:40px}
  .cal-nav button{min-width:44px;min-height:44px}
  .filter-btn{min-height:40px}
  .growth-tab-toggle{min-height:36px;padding:4px 10px}
  input[type="text"],input[type="number"],input[type="search"],select,textarea{font-size:16px;min-height:44px}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/html.test.js`
Expected: PASS (all tests in file).

- [ ] **Step 5: Run full suite**

Run: `node --test`
Expected: 489/489 pass.

---

### Task 2: Overflow fixes — calendar, theme picker, finance labels (CSS)

**Files:**
- Modify: `styles/main.css` (same phone block, after Task 1's lines)
- Test: `tests/html.test.js`

**Interfaces:**
- Consumes: `.cal-grid` (line 899: `grid-template-columns: repeat(7, 1fr)`), `.theme-picker` (line 1086: `overflow-x: auto`), finance label class used by `features/finance.js` rendering.
- Produces: strings the test matches: `.cal-grid{grid-template-columns:repeat(7,minmax(0,1fr))`, `.theme-picker{flex-wrap:wrap;overflow-x:visible`, `.finance-item-label{white-space:normal;overflow-wrap:break-word}`.

- [ ] **Step 1: Write the failing test**

Append to `tests/html.test.js` (after the Task 1 test):

```js
test('phone sweep: calendar, theme picker, and finance labels stop overflowing', () => {
  const phoneBlock = css.slice(css.lastIndexOf('@media (max-width: 600px)'));
  assert.ok(phoneBlock.includes('.cal-grid{grid-template-columns:repeat(7,minmax(0,1fr))'),
    'calendar grid must squeeze to viewport');
  assert.ok(phoneBlock.includes('.cal-day{min-height:36px;font-size:0.72rem}'),
    'calendar day cells must fit');
  assert.ok(phoneBlock.includes('.theme-picker{flex-wrap:wrap;overflow-x:visible}'),
    'theme picker must wrap, not scroll');
  assert.ok(phoneBlock.includes('.finance-item-label{white-space:normal;overflow-wrap:break-word}'),
    'finance labels must wrap');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/html.test.js`
Expected: FAIL — `'calendar grid must squeeze to viewport'`.

- [ ] **Step 3: Write minimal implementation**

Add to the same phone block, after Task 1's rules:

```css
  .cal-grid{grid-template-columns:repeat(7,minmax(0,1fr))}
  .cal-day{min-height:36px;font-size:0.72rem}
  .theme-picker{flex-wrap:wrap;overflow-x:visible}
  .finance-item-label{white-space:normal;overflow-wrap:break-word}
```

Note: if `features/finance.js` uses a different label class, grep it first (`grep 'class=' features/finance.js`) and use the actual class name in both CSS and the test — the audit flagged `finance-item-label` so verify before writing; if the real class differs, update BOTH the CSS rule and the test assertion string identically.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/html.test.js`
Expected: PASS.

- [ ] **Step 5: Run full suite**

Run: `node --test`
Expected: 489/489 pass.

---

### Task 3: 154-tab audit re-verification (Playwright)

**Files:**
- Modify: none (verification only; requires `python -m http.server 8126` running from repo root)

**Interfaces:**
- Consumes: the CSS from Tasks 1-2.
- Produces: audit JSON with `badCount` — acceptance 0 after filtering sr-only.

- [ ] **Step 1: Serve + audit**

```powershell
Start-Process -FilePath python -ArgumentList @('-m','http.server','8126') -WorkingDirectory 'C:\Users\Mahin\Desktop\IQ' -WindowStyle Hidden
```

Then via Playwright MCP `run_code_unsafe` (viewport 390×844, `http://localhost:8126/index.html`, wait for `window.TAB_GROUPS`): run the same audit from the spec — for each of the 154 unique tab ids, `window.activateTab(id, null)`, then scan the active panel for (a) elements with `scrollWidth > clientWidth + 2` EXCLUDING `sr-only` class elements, (b) visible buttons/inputs/selects/links under 40×40 (excluding `.carousel-dot`, `.t3-btn`, checkbox `.quest-check` now 40px).

- [ ] **Step 2: Evaluate result**

Acceptance: 0 horizontal-overflow findings; 0 controls under 40px. If findings remain, they are NEW information — do not CSS-guess: report the exact selectors to the controller before touching anything.

- [ ] **Step 3: Stop the server**

```powershell
Get-CimInstance Win32_Process -Filter 'Name=''python.exe''' | Where-Object { $_.CommandLine -match 'http.server 8126' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }
```

---

### Task 4: Cache bumps, full suite, commit, push

**Files:**
- Modify: `index.html:26` (`styles/main.css?v=21` → `?v=22`), `index.html:581` (`sw.js?v=31` → `?v=32`)
- Modify: `sw.js:2` (`'iq-cache-v31'` → `'iq-cache-v32'`)
- Modify: `tests/html.test.js` (pin `styles/main.css?v=21` → `?v=22` at both occurrences; `sw.js?v=31` → `?v=32`)
- Modify: `tests/sw.test.js` (`iq-cache-v31` → `iq-cache-v32`, both occurrences)

**Interfaces:**
- Consumes: CSS + tests from Tasks 1-2, audit pass from Task 3.
- Produces: coherent cache versions reaching users via GitHub Pages.

- [ ] **Step 1: Bump versions**

Exact replacements:
- `index.html`: `styles/main.css?v=21` → `styles/main.css?v=22`; `navigator.serviceWorker.register('sw.js?v=31')` → `'sw.js?v=32'`
- `sw.js`: `const CACHE_NAME = 'iq-cache-v31';` → `'iq-cache-v32'`
- `tests/html.test.js`: every `styles/main.css?v=21` → `?v=22`; `sw.js?v=31` pin → `sw.js?v=32`
- `tests/sw.test.js`: every `iq-cache-v31` → `iq-cache-v32`

- [ ] **Step 2: Verify no stale pins**

```powershell
Select-String -Path index.html,sw.js,tests/html.test.js,tests/sw.test.js -Pattern 'v=21','v=31','iq-cache-v31' -SimpleMatch
```
Expected: no output (nothing stale).

- [ ] **Step 3: Full suite**

Run: `node --test`
Expected: 489/489 pass.

- [ ] **Step 4: Commit and push** (user pre-approved in spec Section 3)

```powershell
git add styles/main.css index.html sw.js tests/html.test.js tests/sw.test.js
git commit -m 'fix: mobile-friendly sweep - 44px touch floor, iOS-proof inputs, overflow fixes' -m 'Phone media query: 44px button floor (verify/quiz ~60 tabs, dhikr, calendar nav), 40px fasting checkbox, 16px input font (no iOS zoom), calendar grid minmax(0,1fr), theme picker wraps, finance labels wrap. Verified by 154-tab 390px audit: 0 findings. Cache: main.css v22, iq-cache-v32.'
git push origin main
```
