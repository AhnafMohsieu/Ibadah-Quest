# Fluid Sizing + Calm Rendering Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Small-phone compact layout, zero flicker animations, and fluid display type across all widths — CSS-only, verified by tests + multi-width audit.

**Architecture:** Three additive CSS change sets in `styles/main.css` (new 360px block, base-rule edits, clamp conversions) plus source-content regression tests; cache bumps last. No JS changes. Controller runs the Playwright audit + commit + push as finale (subagents lack MCP; repo rule forbids subagent commits).

**Tech Stack:** Vanilla JS PWA, plain CSS, Node built-in test runner (`node --test`), Playwright MCP (controller only).

## Global Constraints

- Do NOT commit (controller commits + pushes in the finale with user's standing approval).
- Do NOT stage or modify: core/actions.js, core/content.js, core/storage.js, opencode.json (user's uncommitted files).
- Cache coherence at the end (Task 4): `styles/main.css?v=23 → ?v=24`, `sw.js?v=33 → ?v=34` registration, `CACHE_NAME 'iq-cache-v33' → 'iq-cache-v34'`, pins in tests/html.test.js + tests/sw.test.js. (If grep shows different current values, use current+1 consistently everywhere.)
- New 360px media block goes AFTER the last `@media (max-width: 600px)` block, BEFORE `/* ── Theme Overrides ── */`. Never insert anything before the FIRST 600px query (tests read it for tier2 assertions).
- `node --test` must stay green (492/492 at plan time).
- Windows PowerShell 5.1: no `&&`, no `tail`; test command is exactly `node --test` from repo root.

---

## File Structure

- Modify: `styles/main.css` — new 360px block (Task 1); base-rule edits: fadeIn removal, shimmer caps, 4× transition narrowing, body timing, reduced-motion extension (Task 2); 9 clamp conversions (Task 3).
- Modify: `index.html:161` — timer inline font-size → clamp (Task 3).
- Modify: `tests/html.test.js` — regression tests per task.
- Modify: `sw.js:2`, `tests/sw.test.js` — version bumps (Task 4).
- No new files.

---

### Task 1: Small-phone compact block (CSS + test)

**Files:**
- Modify: `styles/main.css` (new block before `/* ── Theme Overrides ── */`)
- Test: `tests/html.test.js` (append at end)

**Interfaces:**
- Consumes: existing selectors `.tier1-tabs .t1-btn`, `.t1-btn .iq-inline .iq-icon`, `.bnav-btn .bnav-icon .iq-icon`, `.bnav-label`, `.streak-bar`, `.level-row` (all verified present).
- Produces: `@media (max-width: 360px)` block other tasks leave alone; test name `'small phones get compact stacked nav'`.

- [ ] **Step 1: Write the failing test**

Append to `tests/html.test.js`:

```js
test('small phones get compact stacked nav', () => {
  const i = css.indexOf('@media (max-width: 360px)');
  assert.ok(i > -1, '360px block missing');
  const b = css.slice(i, i + 900);
  assert.ok(b.includes('.tier1-tabs .t1-btn{flex-direction:column;gap:2px;padding:8px 4px;}'),
    'tier1 must stack icon-above-label on small phones');
  assert.ok(b.includes('.bnav-label{font-size:0.62rem;}'),
    'bnav labels must shrink on small phones');
  assert.ok(b.includes('.streak-bar{padding:10px 12px;}'),
    'hero must tighten on small phones');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/html.test.js`
Expected: FAIL with `'360px block missing'`.

- [ ] **Step 3: Write minimal implementation**

In `styles/main.css`, immediately before the `/* ── Theme Overrides ── */` line, insert:

```css
/* ── Small phones: compact stacked nav ── */
@media (max-width: 360px) {
  .tier1-tabs .t1-btn{flex-direction:column;gap:2px;padding:8px 4px;}
  .tier1-tabs .t1-btn .iq-inline .iq-icon{width:18px;height:18px;}
  .tier1-tabs .t1-btn{font-size:0.72rem;}
  .bnav-btn .bnav-icon .iq-icon{width:18px;height:18px;}
  .bnav-label{font-size:0.62rem;}
  .streak-bar{padding:10px 12px;}
  .level-row{gap:8px;}
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/html.test.js`
Expected: PASS.

- [ ] **Step 5: Run full suite**

Run: `node --test`
Expected: 493/493 pass (492 + 1 new).

---

### Task 2: Flicker pass (CSS + test)

**Files:**
- Modify: `styles/main.css` (base rules only — exact strings below)
- Test: `tests/html.test.js` (append at end)

**Interfaces:**
- Consumes: `.tab-panel.active` (line ~402), `@keyframes fadeIn` (~403), `.skeleton` animation (~409), `.xp-inner::after` animation (~219), `body` transition (~93), reduced-motion block (~2610), `.t1-btn`/`.t2-btn`/`.cat-chip`/`.t3-btn` transition lines.
- Produces: no `animation:` on `.tab-panel.active`; finite shimmers; narrowed transitions. Task 3 builds on nothing from this task.

- [ ] **Step 1: Write the failing test**

Append to `tests/html.test.js`:

```js
test('calm rendering: no fade replay, finite shimmers, no layout transitions', () => {
  const i = css.indexOf('.tab-panel.active {');
  assert.ok(i > -1, 'tab-panel.active rule missing');
  assert.ok(!css.slice(i, i + 120).includes('animation'),
    'tab switch must not replay a fade animation');
  assert.ok(css.includes('xpShimmer 2s ease-in-out 3'),
    'xp shimmer must be finite');
  assert.ok(css.includes('skeleton-shimmer 1.5s ease-in-out 3'),
    'skeleton shimmer must be finite');
  assert.ok(css.includes('.skeleton, .xp-inner::after { animation: none !important; }') ||
    css.includes('.skeleton,.xp-inner::after{animation:none !important}'),
    'reduced-motion must kill shimmers');
  assert.ok(css.includes('transition: background 120ms ease, color 120ms ease;'),
    'body transition must be 120ms');
  for (const sel of ['.t1-btn {', '.t2-btn {', '.cat-chip {', '.t3-btn {']) {
    const j = css.indexOf(sel);
    assert.ok(j > -1, sel + ' rule missing');
    const body = css.slice(j, j + 800);
    assert.ok(!body.includes('transition: all') && !body.includes('transition:all'),
      sel + ' must not use transition:all');
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/html.test.js`
Expected: FAIL with `'tab switch must not replay a fade animation'`.

- [ ] **Step 3: Write minimal implementation**

Apply these exact replacements in `styles/main.css` (each oldString is unique — verify with grep before editing; if a replacement target is absent, STOP and report NEEDS_CONTEXT instead of improvising):

1. Old: `.tab-panel.active { display: block; animation: fadeIn 0.2s ease; }`
   New: `.tab-panel.active { display: block; }`
2. Delete the entire line: `@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`
3. Old: `animation: xpShimmer 2s ease-in-out infinite;`
   New: `animation: xpShimmer 2s ease-in-out 3;`
4. Old: `animation: skeleton-shimmer 1.5s ease-in-out infinite;`
   New: `animation: skeleton-shimmer 1.5s ease-in-out 3;`
5. Old: `transition: background 200ms ease, color 200ms ease;`
   New: `transition: background 120ms ease, color 120ms ease;`
6. Old: `  *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }`
   New: `  *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }
  .skeleton, .xp-inner::after { animation: none !important; }`
7. In each of the four rule blocks `.t1-btn {`, `.t2-btn {`, `.cat-chip {`, `.t3-btn {`, replace ONLY the line `  transition: all var(--transition);` with `  transition: background-color var(--transition), color var(--transition), border-color var(--transition);` (use surrounding block context to target each occurrence uniquely).

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/html.test.js`
Expected: PASS.

- [ ] **Step 5: Run full suite**

Run: `node --test`
Expected: 494/494 pass (493 + 1 new).

---

### Task 3: Fluid display type (CSS + HTML + test)

**Files:**
- Modify: `styles/main.css` (9 exact replacements), `index.html:161` (inline timer style)
- Test: `tests/html.test.js` (append at end)

**Interfaces:**
- Consumes: current sizes as clamp maxes (verified 2026-09-05): `.stat-num` 2rem (:877), `.prog-stats .stat-num` 1.5rem (:892), `.profile-stats .stat-num` 1.1rem (:1084), sweep rule `.stat-num,.tb-stat{font-size:20px}` (:~2664), `.insight-card-num` 1.6rem (:1755), `.best-num` 1.3rem (:251), `.journey-stat-num` 1.3rem (:1944), `.dhikr-stat-num` 1.15rem (:1972), timer inline `font-size:3rem` (index.html:161).
- Produces: clamp() conversions; test name `'display type scales fluidly'`.

- [ ] **Step 1: Write the failing test**

Append to `tests/html.test.js`:

```js
test('display type scales fluidly', () => {
  for (const s of ['.stat-num{font-size:clamp(1.4rem,7vw,2rem)}',
    '.insight-card-num{font-size:clamp(1.15rem,6vw,1.6rem)}',
    '.best-num{font-size:clamp(1rem,5vw,1.3rem)}',
    '.stat-num,.tb-stat{font-size:clamp(1rem,5vw,1.25rem)}']) {
    assert.ok(css.includes(s), 'missing fluid rule ' + s);
  }
  assert.ok(html.includes('font-size:clamp(2rem,12vw,3rem)'),
    'timer countdown must be fluid');
});
```

Note: the test matches minified single-line forms — write the CSS rules EXACTLY as single lines below.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/html.test.js`
Expected: FAIL with `'missing fluid rule .stat-num{font-size:clamp(1.4rem,7vw,2rem)}'`.

- [ ] **Step 3: Write minimal implementation**

In `styles/main.css`, append these single-line rules at the END of the last `@media (max-width: 600px)` block is WRONG for these — they must apply at ALL widths, so append them as plain base rules immediately BEFORE the `/* ── Small phones: compact stacked nav ── */` comment from Task 1:

```css
/* ── Fluid display type ── */
.stat-num{font-size:clamp(1.4rem,7vw,2rem)}
.prog-stats .stat-num{font-size:clamp(1.1rem,5vw,1.5rem)}
.profile-stats .stat-num{font-size:clamp(0.95rem,4vw,1.1rem)}
.stat-num,.tb-stat{font-size:clamp(1rem,5vw,1.25rem)}
.insight-card-num{font-size:clamp(1.15rem,6vw,1.6rem)}
.best-num{font-size:clamp(1rem,5vw,1.3rem)}
.journey-stat-num{font-size:clamp(1rem,5vw,1.3rem)}
.dhikr-stat-num{font-size:clamp(0.95rem,4.5vw,1.15rem)}
```

Why appended overrides instead of editing base rules: equal specificity, later source order wins; base rules stay as fallback for ancient browsers without clamp(). Do NOT edit the original sized rules.

In `index.html:161`, replace `font-size:3rem` with `font-size:clamp(2rem,12vw,3rem)` (only occurrence in that line's style attribute).

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/html.test.js`
Expected: PASS.

- [ ] **Step 5: Run full suite**

Run: `node --test`
Expected: 495/495 pass (494 + 1 new).

---

### Task 4: Cache bumps + full suite (no commit)

**Files:**
- Modify: `index.html:26`, `index.html:581`, `sw.js:2`, `tests/html.test.js` pins, `tests/sw.test.js` pins.

**Interfaces:**
- Consumes: CSS + tests from Tasks 1-3.
- Produces: coherent versions; controller finale (audit + commit + push) follows.

- [ ] **Step 1: Confirm current versions**

```powershell
Select-String -Path index.html -Pattern 'main.css\?v=', 'sw.js\?v=' -SimpleMatch
Select-String -Path sw.js -Pattern 'CACHE_NAME' | Select-Object -First 1
```
Expected: `main.css?v=23`, `sw.js?v=33`, `iq-cache-v33`. If different, use current+1 consistently in the steps below.

- [ ] **Step 2: Bump versions**

- `index.html`: `styles/main.css?v=23` → `?v=24`; `sw.js?v=33` → `?v=34`
- `sw.js`: `'iq-cache-v33'` → `'iq-cache-v34'`
- `tests/html.test.js`: every `styles/main.css?v=23` → `?v=24`; `sw.js?v=33` pin → `?v=34`
- `tests/sw.test.js`: every `iq-cache-v33` → `iq-cache-v34`

- [ ] **Step 3: Verify no stale pins**

```powershell
Select-String -Path index.html,sw.js,tests/html.test.js,tests/sw.test.js -Pattern '?v=23','sw.js?v=33','iq-cache-v33' -SimpleMatch
```
Expected: no output (the lone `core/actions.js?v=21` style hits for OTHER untouched files are fine — only the three bumped version strings must be absent).

- [ ] **Step 4: Full suite**

Run: `node --test`
Expected: 495/495 pass. Report the count; do NOT commit (controller finale).
