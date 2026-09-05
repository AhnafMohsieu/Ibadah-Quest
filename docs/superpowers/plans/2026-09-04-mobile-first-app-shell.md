# Mobile-First App Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild Ibadah Quest shell as true mobile-first (480px, bottom-tab primary) per 2026-09-04 spec.

**Architecture:** Pure CSS shell change in `styles/main.css` + `?v=` bump. No state, no TAB_GROUPS, no renderer logic change. Bnav stays 5 destinations, sub-nav becomes snap chip row.

**Tech Stack:** Vanilla JS, plain CSS (no build), localStorage PWA, Node built-in test runner.

## Global Constraints

- Do NOT commit unless explicitly asked (repo rule overrides plan template).
- `styles/main.css?v=19` -> `?v=20` in `index.html:26`, `CACHE_NAME 'iq-cache-v29'` -> `'iq-cache-v30'` in `sw.js:2`, update pinned `styles/main.css?v=19` in `tests/html.test.js:86,147` and `iq-cache-v29` in `tests/sw.test.js:71-73`.
- Script load order in `index.html` unchanged, `defer` preserved.
- All touch targets min-height 48px, base font 16px on inputs/buttons (no iOS zoom).
- `node --test` must pass, `node --check` on touched JS (none expected except version bumps).
- No `TBD`/`TODO`, no placeholders.

---

## File Structure

- Modify: `styles/main.css` (~2590-2660 bnav + responsive blocks) — shell, nav, cards.
- Modify: `index.html:26` — `?v=19` -> `?v=20`.
- Modify: `sw.js:2` — `CACHE_NAME` bump.
- Modify: `tests/html.test.js:86,147`, `tests/sw.test.js:71-73` — pinned versions.
- No new files. No `data/tab-groups.js` change. No `render/tabs.js` logic change.

---

### Task 1: Phone shell + slim header + bottom-tab primary

**Files:**
- Modify: `styles/main.css:16,2644-2648`
- Test: `tests/html.test.js`

**Interfaces:**
- Consumes: existing `.app`, `.top-bar`, `.bnav`, `.bnav-btn` markup in `index.html:73-89,598-604`.
- Produces: 480px centered shell, 56px sticky header, 60px bottom nav with safe-area.

- [ ] **Step 1: Write the failing test**

In `tests/html.test.js` add at end (before final closing):

```js
test('mobile-first shell: 480px app, 60px bnav with safe-area', () => {
  assert.ok(css.includes('max-width: 480px'), 'app shell must be 480px');
  assert.ok(css.includes('env(safe-area-inset-bottom'), 'bnav must use safe-area');
  assert.ok(css.includes('.bnav-btn'), 'bnav buttons styled');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/html.test.js`
Expected: FAIL with "app shell must be 480px"

- [ ] **Step 3: Write minimal implementation**

In `styles/main.css`, replace `.app{position:relative;z-index:1;max-width:720px;margin:0 auto;padding:0 16px 80px}` with:

```css
.app{position:relative;z-index:1;max-width:480px;margin:0 auto;padding:0 16px calc(96px + env(safe-area-inset-bottom, 0px));background:var(--bg)}
@media (min-width: 520px){body{background:var(--bg-accent)} .app{box-shadow:var(--shadow-md);border-left:1px solid var(--border);border-right:1px solid var(--border);min-height:100vh}}
```

Replace `.bnav-btn .bnav-icon { font-size: 1.35rem; line-height: 1; }` block context with additions:

```css
.bnav{position:sticky;bottom:0;z-index:120;display:flex;background:var(--card-bg);border-top:1px solid var(--border);padding:8px 8px calc(8px + env(safe-area-inset-bottom, 0px));}
.bnav-btn{min-height:60px;min-width:48px;flex:1;font-size:11px;}
.bnav-btn .bnav-icon .iq-icon { width: 22px; height: 22px; }
.top-bar{min-height:56px;}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/html.test.js`
Expected: PASS

- [ ] **Step 5: Verify no regression**

Run: `node --test`
Expected: all pass (except version-pin tasks pending).

---

### Task 2: Sub-nav chip row + prayer bento + streak

**Files:**
- Modify: `styles/main.css` (tier2/tier3 + prayer-card + streak-bar sections)
- Test: `tests/html.test.js`

**Interfaces:**
- Consumes: `#tier2Tabs`, `#tier3Wrap`, `.prayer-card`, `.streak-bar` from Task 1 shell.
- Produces: horizontal snap chip row, 48px prayer cards, flame + 7-day dots styling hooks.

- [ ] **Step 1: Write the failing test**

```js
test('mobile-first nav: snap chip row and 48px targets', () => {
  assert.ok(css.includes('scroll-snap-type'), 'chip row must snap');
  assert.ok(css.includes('min-height:48px') || css.includes('min-height: 48px'), '48px targets required');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/html.test.js`
Expected: FAIL with "chip row must snap"

- [ ] **Step 3: Write minimal implementation**

Append to `styles/main.css` before `/* ── Responsive ── */`:

```css
#tier2Tabs,#tier3Tabs{display:flex;gap:8px;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;padding-bottom:4px;}
#tier2Tabs::-webkit-scrollbar,#tier3Tabs::-webkit-scrollbar{display:none;}
#tier2Tabs .t2-btn,#tier3Tabs .t2-btn,#tier2Tabs .cat-chip{flex:0 0 auto;scroll-snap-align:start;min-height:44px;font-size:16px;}
.prayer-card,.deed-card,.vol-card{min-height:48px;}
button,.t1-btn,.t2-btn,.cat-chip,.bnav-btn{font-size:16px;}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/html.test.js`
Expected: PASS

- [ ] **Step 5: Verify full suite**

Run: `node --test`
Expected: PASS

---

### Task 3: Home polish + dashboard readability

**Files:**
- Modify: `styles/main.css` (hero-strip, insights-cards, chart-row)
- Test: `tests/html.test.js`

**Interfaces:**
- Consumes: shell + chip row from Tasks 1-2.
- Produces: compact hero on Today only (CSS), 2-col insights, full-width charts.

- [ ] **Step 1: Write the failing test**

```js
test('mobile-first home: 2-col insights and readable numbers', () => {
  assert.ok(css.includes('.insights-cards'), 'insights grid exists');
  assert.ok(css.includes('border-radius: 16px') || css.includes('--radius-lg:16px'), 'bento radius present');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/html.test.js`
Expected: FAIL if radius token missing (adjust to actual: check `--radius-lg:16px` exists; if already passes, extend assertion to `.daily-progress-ring` and add that class in Step 3).

- [ ] **Step 3: Write minimal implementation**

Append before `/* ── Theme Overrides ── */`:

```css
.hero-strip .header{padding:16px 0 8px;}
.insights-cards{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;}
.chart-row{display:grid;grid-template-columns:1fr;gap:12px;}
.stat-num,.tb-stat{font-size:20px;}
.stat-label,.bnav-label{font-size:12px;color:var(--text2);}
.card-item,.vol-card,.deed-card,.content-card,.prayer-card{border-radius:16px;}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/html.test.js`
Expected: PASS

- [ ] **Step 5: Syntax + suite check**

Run: `node --check index.html` is HTML (skip); run `node --test`
Expected: PASS

---

### Task 4: Cache version bump + final verification

**Files:**
- Modify: `index.html:26` (`styles/main.css?v=19` -> `?v=20`)
- Modify: `sw.js:2` (`iq-cache-v29` -> `iq-cache-v30`)
- Modify: `tests/html.test.js:86,147` (`?v=19` -> `?v=20`)
- Modify: `tests/sw.test.js:71-73` (`iq-cache-v29` -> `iq-cache-v30`)

**Interfaces:**
- Consumes: CSS changes from Tasks 1-3.
- Produces: coherent cache versions reaching users.

- [ ] **Step 1: Bump index.html**

Replace `styles/main.css?v=19` with `styles/main.css?v=20` in `index.html:26` (preload link only).

- [ ] **Step 2: Bump sw.js**

Replace `const CACHE_NAME = 'iq-cache-v29';` with `const CACHE_NAME = 'iq-cache-v30';` in `sw.js:2`.

- [ ] **Step 3: Update pinned tests**

In `tests/html.test.js:86,147` replace `styles/main.css?v=19` with `styles/main.css?v=20`. In `tests/sw.test.js` replace `iq-cache-v29` with `iq-cache-v30`.

- [ ] **Step 4: Run full verification**

Run: `node --test`
Expected: all ~337+ tests PASS

Run: `node --check sw.js`
Expected: no output (syntax OK)

- [ ] **Step 5: Manual mobile check (Playwright MCP if available)**

Open 390x844, confirm: no horizontal overflow, `#bnav` visible, sub-nav scrolls horizontally, tap targets >=48px. Do NOT commit.
