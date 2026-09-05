# Prayer Grid + Intro Subtitle Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Center the intro subtitle and equalize Daily Prayers card rows with two CSS rules, verified by tests.

**Architecture:** Two one-line CSS additions in `styles/main.css` (a missing `text-align` and a fixed icon-box height), each pinned by a source-pattern regression test in `tests/html.test.js`; cache bumps last. No JS, markup, or behavior changes. Controller finale: headless 390px visual check + commit + push.

**Tech Stack:** Vanilla JS PWA, plain CSS, Node built-in test runner (`node --test`), Playwright MCP (controller only).

## Global Constraints

- Do NOT commit (controller commits + pushes in the finale with user's standing approval from the approved spec).
- Do NOT stage or modify: core/actions.js, core/content.js, core/storage.js, opencode.json.
- Cache coherence at the end: `styles/main.css?v=28 → ?v=29`, `sw.js?v=38 → ?v=39` registration, `CACHE_NAME 'iq-cache-v38' → 'iq-cache-v39'`, pins in tests/html.test.js + tests/sw.test.js. (If grep shows different current values, use current+1 consistently.)
- `node --test` must stay green (503/503 at plan time, per Task 1 implementer ground truth).
- Windows PowerShell 5.1: no `&&`, no `tail`; test command is exactly `node --test` from repo root.

---

## File Structure

- Modify: `styles/main.css` — one line in `.intro-subtitle`, one property in `.card-grid .card-item .card-icon` (Tasks 1-2).
- Modify: `tests/html.test.js` — two regression tests (Tasks 1-2).
- Modify: `index.html`, `sw.js`, `tests/sw.test.js` — version bumps (Task 3).
- No new files.

---

### Task 1: Center intro subtitle (CSS + test)

**Files:**
- Modify: `styles/main.css` (`.intro-subtitle` rule ~line 1682)
- Test: `tests/html.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces: centered intro subtitle. Task 2 is independent.

- [ ] **Step 1: Write the failing test**

Append to `tests/html.test.js`:

```js
test('intro subtitle is centered like the bismillah', () => {
  const i = css.indexOf('\n.intro-subtitle {');
  assert.ok(i > -1, 'intro-subtitle rule missing');
  const body = css.slice(i, i + 400);
  assert.ok(body.includes('text-align:center') || body.includes('text-align: center'),
    'intro subtitle must be centered');
});
```

(The newline anchor skips the earlier `.intro-overlay.visible .intro-subtitle` animation rule.)

(`css` is already loaded at the top of tests/html.test.js — verify the variable name before writing; if different, use the real one.)

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/html.test.js`
Expected: FAIL with `'intro subtitle must be centered'`.

- [ ] **Step 3: Write minimal implementation**

In `styles/main.css`, inside the `.intro-subtitle {` rule (exact current text):
```
.intro-subtitle {
  font-family: var(--font);
  font-size: clamp(0.8rem, 2vw, 1rem);
  color: var(--text3);
  letter-spacing: 1.5px;
  text-transform: uppercase;
  margin-top: 12px;
  opacity: 0;
  position: relative;
  z-index: 1;
}
```
add one line `  text-align: center;` after the `text-transform: uppercase;` line. (If the file's actual text differs, STOP and report NEEDS_CONTEXT.)

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/html.test.js`
Expected: PASS.

- [ ] **Step 5: Run full suite**

Run: `node --test`
Expected: 504/504 pass (503 + 1 new).

---

### Task 2: Fixed prayer icon box (CSS + test)

**Files:**
- Modify: `styles/main.css` (`.card-grid .card-item .card-icon` rule ~line 467)
- Test: `tests/html.test.js`

**Interfaces:**
- Consumes: nothing from Task 1.
- Produces: equal-height prayer rows. Task 3 ships both.

- [ ] **Step 1: Write the failing test**

Append to `tests/html.test.js`:

```js
test('prayer card icons sit in fixed boxes so rows align', () => {
  const i = css.indexOf('.card-grid .card-item .card-icon {');
  assert.ok(i > -1, 'card-icon rule missing');
  const body = css.slice(i, i + 250);
  assert.ok(body.includes('height:44px') || body.includes('height: 44px'),
    'card icon box must have a fixed height');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/html.test.js`
Expected: FAIL with `'card icon box must have a fixed height'`.

- [ ] **Step 3: Write minimal implementation**

In `styles/main.css`, replace (exact current text):
`.card-grid .card-item .card-icon { font-size: 1.6rem; line-height: 1; display: flex; align-items: center; justify-content: center; }`
with:
`.card-grid .card-item .card-icon { font-size: 1.6rem; line-height: 1; display: flex; align-items: center; justify-content: center; height: 44px; }`
(If the file's actual text differs, STOP and report NEEDS_CONTEXT. Do NOT touch the `.card-icon svg` 40px rule on the next line.)

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/html.test.js`
Expected: PASS.

- [ ] **Step 5: Run full suite**

Run: `node --test`
Expected: 505/505 pass (504 + 1 new).

---

### Task 3: Cache bumps + full suite (no commit)

**Files:**
- Modify: `index.html`, `sw.js`, `tests/html.test.js`, `tests/sw.test.js`.

**Interfaces:**
- Consumes: Tasks 1-2.
- Produces: coherent versions; controller finale (visual check + commit + push) follows.

- [ ] **Step 1: Confirm current versions**

```powershell
Select-String -Path index.html -SimpleMatch -Pattern 'main.css?v=', 'sw.js?v='
Select-String -Path sw.js -Pattern 'CACHE_NAME' | Select-Object -First 1
```
Expected: `main.css?v=28`, `sw.js?v=38`, `iq-cache-v38`. If different, use current+1 consistently below.

- [ ] **Step 2: Bump versions**

- `index.html`: `styles/main.css?v=28` → `?v=29`; `sw.js?v=38` → `?v=39`
- `sw.js`: `'iq-cache-v38'` → `'iq-cache-v39'`
- `tests/html.test.js`: every `styles/main.css?v=28` → `?v=29`; `sw.js?v=38` pin → `?v=39`
- `tests/sw.test.js`: every `iq-cache-v38` → `iq-cache-v39`

- [ ] **Step 3: Verify no stale pins**

```powershell
Select-String -Path index.html,sw.js,tests/html.test.js,tests/sw.test.js -SimpleMatch -Pattern '?v=28','sw.js?v=38','iq-cache-v38'
```
Expected: no output (other files' own versions are untouched and fine).

- [ ] **Step 4: Full suite**

Run: `node --test`
Expected: 505/505 pass. Report counts; do NOT commit (controller finale).
