# Guide + Self-Tracking Visual Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Normalize Guide and Self-Tracking renderers to one shared card/header/stat language with zero behavior change, verified by source-pattern tests.

**Architecture:** Small markup edits inside render functions (render/static.js, features/finance.js) plus two one-line CSS rhythm alignments (styles/main.css); regression tests assert shared snippets in tests/html.test.js; cache bumps last. Controller finale: headless 390px visual check + commit + push.

**Tech Stack:** Vanilla JS PWA, plain CSS, Node built-in test runner (`node --test`), Playwright MCP (controller only).

## Global Constraints

- Do NOT commit (controller commits + pushes in the finale with user's standing approval from the approved spec).
- Do NOT stage or modify: core/actions.js, core/content.js, core/storage.js, opencode.json.
- Do NOT touch data pools, poolRender, renderSahaba, or any logging/XP/calculation logic. Copy the shared badge pattern; do not refactor shared functions.
- Cache coherence at the end (Task 3): `render/static.js?v=5 → ?v=6`, `features/finance.js?v=6 → ?v=7`, `sw.js?v=38 → ?v=39` registration, `CACHE_NAME 'iq-cache-v38' → 'iq-cache-v39'`. (features/health.js is NOT touched — no bump. If grep shows different current values, use current+1 consistently.)
- `node --test` must stay green (501/501 at plan time).
- Windows PowerShell 5.1: no `&&`, no `tail`; test command is exactly `node --test` from repo root.

---

## File Structure

- Modify: `render/static.js` — salah rows → shared numbered-row structure; extradeeds/volprayers title color; gratitude header → content-card; memorization header margin drop (Tasks 1-2).
- Modify: `features/finance.js` — drop 3 inline header margins (Task 2).
- Modify: `styles/main.css` — health-card padding 14→16px; fin-balance-amount accent-dark (Task 2).
- Modify: `tests/html.test.js` — regression tests (Tasks 1-2).
- Modify: `index.html`, `sw.js`, `tests/sw.test.js` — version bumps (Task 3).
- No new files.

---

### Task 1: Guide detail unification (render/static.js + test)

**Files:**
- Modify: `render/static.js` (renderSalah map callback ~line 185-188; extradeeds title ~line 527; volprayers title ~line 574)
- Test: `tests/html.test.js`

**Interfaces:**
- Consumes: the Sahaba numbered-row structure at render/static.js ~line 252 (read it first — see below).
- Produces: salah rows byte-matching the shared row pattern; both detail titles on `--accent-light`. Task 2 builds on nothing from this task.

- [ ] **Step 1: Read and confirm the canonical row**

Read `render/static.js` lines 250-255. Confirm the Sahaba row contains exactly:
`<div class="content-card"><div style="display:flex;align-items:flex-start;gap:10px;"><span style="display:inline-block;background:var(--accent-bg);color:var(--accent-light);border:1px solid var(--accent-border);border-radius:12px;padding:0 8px;font-size:0.75rem;font-weight:800;height:22px;line-height:20px;white-space:nowrap;font-family:var(--font);">`
If the file's actual row differs from that string, STOP and report NEEDS_CONTEXT with the actual text (do not improvise a variant).

- [ ] **Step 2: Write the failing test**

Append to `tests/html.test.js`:

```js
test('guide detail rows share one card language', () => {
  function fnBody(src, name) { const i = src.indexOf('function ' + name); assert.ok(i > -1, name + ' must exist'); let j = src.indexOf('\n  function ', i + 10); if (j === -1) j = src.length; return src.slice(i, j); }
  const salah = fnBody(renderStatic, 'renderSalah');
  assert.ok(salah.includes('<div class="content-card"><div style="display:flex;align-items:flex-start;gap:10px;">'), 'salah rows must use the shared numbered-row structure');
  assert.ok(!salah.includes('flex-direction:row;align-items:flex-start'), 'salah must not keep its bespoke row style');
  const ed = fnBody(renderStatic, 'renderExtraDeeds');
  const vp = fnBody(renderStatic, 'renderVolPrayers');
  assert.ok(ed.includes('font-weight:700;color:var(--accent-light);'), 'extradeeds titles use shared gold');
  assert.ok(vp.includes('font-weight:700;color:var(--accent-light);'), 'volprayers titles use shared gold');
  assert.ok(!ed.includes('font-weight:700;color:var(--accent);'), 'no darker gold titles remain in extradeeds');
  assert.ok(!vp.includes('font-weight:700;color:var(--accent);'), 'no darker gold titles remain in volprayers');
});
```

(`renderStatic` is already loaded at the top of html.test.js; `fs`/`path`/`root` exist — follow the health-XP test precedent if you need file reads.)

- [ ] **Step 3: Run test to verify it fails**

Run: `node --test tests/html.test.js`
Expected: FAIL with `'salah rows must use the shared numbered-row structure'`.

- [ ] **Step 4: Write minimal implementation**

In `render/static.js`, replace the salah map callback (exact current text):
```js
    ].map((s, i) => {
      const numBadge = `<span style="display:inline-block; background:var(--accent-bg); color:var(--accent-light); border:1px solid var(--accent-border); border-radius:12px; padding:0 8px; font-size:0.75rem; margin-right:8px; font-weight:800; height:22px; line-height:20px; white-space:nowrap; font-family:var(--font);">#${i + 1}</span>`;
      return `<div class="content-card" style="flex-direction:row;align-items:flex-start;"><div style="margin-top:2px;">${numBadge}</div><div style="flex:1;"><div style="font-weight:700;color:var(--accent-light);margin-bottom:6px;">${s.name}</div><div class="content-english">${s.desc}</div></div></div>`;
    }).join('');
```
with:
```js
    ].map((s, i) => {
      return `<div class="content-card"><div style="display:flex;align-items:flex-start;gap:10px;"><span style="display:inline-block;background:var(--accent-bg);color:var(--accent-light);border:1px solid var(--accent-border);border-radius:12px;padding:0 8px;font-size:0.75rem;font-weight:800;height:22px;line-height:20px;white-space:nowrap;font-family:var(--font);">#${i + 1}</span><div style="flex:1;"><div style="font-weight:700;color:var(--accent-light);margin-bottom:6px;">${s.name}</div><div class="content-english">${s.desc}</div></div></div></div>`;
    }).join('');
```
(If the file's actual text differs by even one character, STOP and report NEEDS_CONTEXT.)

Then replace BOTH occurrences (renderExtraDeeds line ~527 and renderVolPrayers line ~574 — use replaceAll) of:
`<div class="prayer-name" style="font-size:1rem;font-weight:700;color:var(--accent);">`
with:
`<div class="prayer-name" style="font-size:1rem;font-weight:700;color:var(--accent-light);">`
(First grep to confirm exactly 2 occurrences; the rakat/source/desc lines keep their roles.)

- [ ] **Step 5: Run tests to verify they pass**

Run: `node --test tests/html.test.js` (expect PASS), `node --check render/static.js` (expect clean), then full `node --test` (expect 502/502).

---

### Task 2: Self-Tracking normalization (static.js + finance.js + main.css + test)

**Files:**
- Modify: `render/static.js` (gratitude header ~line 259, memorization header ~line 292)
- Modify: `features/finance.js` (3 sub-headers ~lines 165, 177, 190)
- Modify: `styles/main.css` (health-card padding, fin-balance-amount color)
- Test: `tests/html.test.js`

**Interfaces:**
- Consumes: nothing from Task 1.
- Produces: shared header/card/stat language. Task 3 ships everything.

- [ ] **Step 1: Write the failing test**

Append to `tests/html.test.js`:

```js
test('tracking rows share one card and header language', () => {
  function fnBody2(src, name) { const i = src.indexOf('function ' + name); assert.ok(i > -1, name + ' must exist'); let j = src.indexOf('\n  function ', i + 10); if (j === -1) j = src.length; return src.slice(i, j); }
  const grat = fnBody2(renderStatic, 'renderGratitude');
  assert.ok(!grat.includes('var(--card2)'), 'gratitude must not use undefined --card2');
  assert.ok(grat.includes("Today's entries"), 'gratitude count header kept');
  const mem = fnBody2(renderStatic, 'renderMemorization');
  assert.ok(!mem.includes('margin-top:20px'), 'memorization header uses shared spacing');
  const finance = fs.readFileSync(path.join(root, 'features', 'finance.js'), 'utf8');
  assert.ok(!finance.includes('margin-top:16px'), 'finance headers use shared spacing');
  assert.ok(!finance.includes('margin-top:20px'), 'finance wisdom header uses shared spacing');
  assert.ok(css.includes('.fin-balance-amount { font-size: 1.8rem; font-weight: 800; color: var(--accent-dark);'),
    'finance balance joins the shared stat rhythm');
});
```

(`css` is already loaded at the top of html.test.js — verify the variable name before writing; if different, use the real one.)

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/html.test.js`
Expected: FAIL with `'gratitude must not use undefined --card2'`.

- [ ] **Step 3: Write minimal implementation**

In `render/static.js`:
1. Replace (exact, in renderGratitude):
```js
    h += `<div style="background:var(--card2);border-radius:var(--radius);padding:16px;margin-bottom:16px;border:1px solid var(--border);">Today's entries (${entries.length}):</div>`;
```
with:
```js
    h += `<div class="content-card"><div class="content-english">Today's entries (${entries.length}):</div></div>`;
```
2. First grep `margin-top:20px` in render/static.js — expect exactly 1 hit (memorization header). Then replace `<div class="section-title" style="margin-top:20px;">` with `<div class="section-title">`. If more than 1 hit, STOP and report NEEDS_CONTEXT.

In `features/finance.js`: replaceAll `<div class="section-title" style="margin-top:16px">` → `<div class="section-title">` (exactly 3 hits: Log Income, Charity, Expenses — verified 2026-09-06), plus replace `<div class="section-title" style="margin-top:20px">${iqIcon('book-open')} Islamic Finance Wisdom</div>` → `<div class="section-title">${iqIcon('book-open')} Islamic Finance Wisdom</div>` (1 hit).

In `styles/main.css`:
1. Old:
```
.health-card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: var(--radius);
  padding: 14px;
  margin-bottom: 10px;
}
```
New: identical block with `padding: 16px;`.
2. Old: `.fin-balance-amount { font-size: 1.8rem; font-weight: 800; margin-bottom: 10px; }`
   New: `.fin-balance-amount { font-size: 1.8rem; font-weight: 800; color: var(--accent-dark); margin-bottom: 10px; }`
   (The later `.pos`/`.neg` rules keep overriding for signed values — verify they still exist after your edit.)

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test tests/html.test.js` (expect PASS), `node --check render/static.js`, `node --check features/finance.js` (expect clean).

- [ ] **Step 5: Run full suite**

Run: `node --test`
Expected: 503/503 pass (502 + 1 new).

---

### Task 3: Cache bumps + full suite (no commit)

**Files:**
- Modify: `index.html`, `sw.js`, `tests/sw.test.js` (no test-pin changes needed in html.test.js — verified 2026-09-06: it pins only main.css + sw.js).

**Interfaces:**
- Consumes: Tasks 1-2.
- Produces: coherent versions; controller finale (visual check + commit + push) follows.

- [ ] **Step 1: Confirm current versions**

```powershell
Select-String -Path index.html -SimpleMatch -Pattern 'render/static.js?v=', 'features/finance.js?v=', 'sw.js?v='
Select-String -Path sw.js -Pattern 'CACHE_NAME' | Select-Object -First 1
```
Expected: `static.js?v=5`, `finance.js?v=6`, `sw.js?v=38`, `iq-cache-v38`. If different, use current+1 consistently below.

- [ ] **Step 2: Bump versions**

- `index.html`: `render/static.js?v=5` → `?v=6`; `features/finance.js?v=6` → `?v=7`; `sw.js?v=38` → `?v=39`
- `sw.js`: `'iq-cache-v38'` → `'iq-cache-v39'`
- `tests/sw.test.js`: every `iq-cache-v38` → `iq-cache-v39`

- [ ] **Step 3: Verify no stale pins**

```powershell
Select-String -Path index.html,sw.js,tests/html.test.js,tests/sw.test.js -SimpleMatch -Pattern 'static.js?v=5','finance.js?v=6','sw.js?v=38','iq-cache-v38'
```
Expected: no output (other files' own versions are untouched and fine).

- [ ] **Step 4: Full suite + syntax checks**

Run: `node --check render/static.js`, `node --check features/finance.js`, `node --check sw.js`, then `node --test`. Expected: 503/503 pass. Report counts; do NOT commit (controller finale).
