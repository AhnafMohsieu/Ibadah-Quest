# Mobile Comfort Polish (SP1) Implementation Plan

> **Executor note:** This plan is self-sufficient. Work the tasks in order; each task ends with a runnable check. Spec for context: `docs/superpowers/specs/2026-10-16-mobile-comfort-polish-design.md`.

**Goal:** Ship four audit-driven mobile comfort fixes — (F1) FAB clearance gutter for nav chips and the Progress calendar header, (F2) equal prayer cards, (F3) modest chrome trim, (F4) 44px info-button hit area + keyboard/AT access — pinned by tests first, accepted by a before/after browser audit.

**Architecture:** Pure classic-track edits. CSS lands in `styles/main.css`; tiny attribute insertions in 5 renderer templates across `core/static.js` + `core/render-prayers.js`; two behavior lines in `features/fab.js` + `core/actions.js`; a11y attributes in `index.html`; version/revision bumps (`main.css`, 4 script refs, `sw.js ?v`, `MANIFEST_REV`). The acceptance gate is the external Python-Playwright harness in the temp dir (not a repo file): same 390×844 sweep as the baseline.

**Tech Stack:** Vanilla JS (classic IIFE files on `window.*`), CSS, `node:test`. Python + Playwright only for the external QA harness.

## Global Constraints

- **Do not commit** — repo rule ("Do not commit unless explicitly asked").
- Test command is exactly `node --test` from the repo root; it must end green.
- Syntax-check every touched JS file: `node --check <file>` (all touched files are classic), plus `node core/check-syntax.js` for the `src/**` track.
- Legacy `?v=` discipline: bump the ref in `index.html` for every touched script; `tests/html.test.js` pins `main.css` and `sw.js` versions — update those pins in the same change.
- `sw.js` header comment: bump `MANIFEST_REV` whenever any precached URL changes → 8 → 9.
- Renderer attribute values use only static app data (`item.name`, `nm`, `v.name`, `d.name`) — same trust level as the adjacent template text; no user input involved.
- Do not touch `opencode.json` or `Images/` (pre-existing user work).
- `.card-info-btn` must stay a `div` (converting to `<button>` trips the 44px button floor and inflates the visible dot).

---

### Task 1: Regression pins first — tests must go RED

**Files:**
- Modify: `tests/html.test.js` (version pins at lines 75, 98, 159; append new tests at end)

- [x] **Step 1: Update the three version pins** (exact replacements):

  - Line 75 area: `sw.js?v=55` → `sw.js?v=56`
  - Lines 98 and 159 area (same assertion text in two tests): `styles/main.css?v=42` → `styles/main.css?v=43`

- [x] **Step 2: Append the new pins at the end of the file.** Reuse the file's existing `assert` (and `html` / `css` variables) — read the tops of the file first; `fs`/`path` are required inline here to stay independent of the file's header:

```js
test('SP1: FAB gutters, equal prayer cards, info hit area, FAB a11y', () => {
  const gutter = '#tier2Tabs,#tier3Tabs{flex-wrap:wrap;overflow-x:visible;padding-right:64px;}';
  assert.strictEqual(css.split(gutter).length, 3, 'tier rows must reserve the FAB gutter in both phone blocks');
  const calGutter = '.cal-header .cal-nav:last-child{padding-right:64px}';
  assert.strictEqual(css.split(calGutter).length, 3, 'calendar header must reserve the FAB gutter in both phone blocks');
  const thirds = '#prayerArea .card-grid > .card-item{flex:0 0 calc((100% - 16px)/3);}';
  assert.strictEqual(css.split(thirds).length, 3, 'prayer cards must be equal thirds in both phone blocks');
  assert.ok(css.includes(".card-grid .card-item .card-info-btn::after { content:''; position:absolute; top:-17px; right:-3px; bottom:-3px; left:-17px; }"),
    'info button needs a 44px hit area');
  assert.ok(html.includes('aria-label="Quick actions"'), 'FAB main button needs an accessible name');
  assert.ok(html.includes('aria-expanded="false"'), 'FAB main button must expose its expanded state');
  const fs2 = require('fs');
  const path2 = require('path');
  const fabSrc = fs2.readFileSync(path2.join(__dirname, '..', 'features', 'fab.js'), 'utf8');
  assert.ok(fabSrc.includes("setAttribute('aria-expanded'"), 'toggleFAB must sync aria-expanded');
});

test('SP1: info buttons are labelled and keyboard-operable', () => {
  const fs2 = require('fs');
  const path2 = require('path');
  const root2 = path2.join(__dirname, '..');
  const rp = fs2.readFileSync(path2.join(root2, 'core', 'render-prayers.js'), 'utf8');
  const rs = fs2.readFileSync(path2.join(root2, 'core', 'static.js'), 'utf8');
  const ac = fs2.readFileSync(path2.join(root2, 'core', 'actions.js'), 'utf8');
  const labelled = (rp + rs).split('role="button" tabindex="0" aria-label="Details: ').length;
  assert.strictEqual(labelled, 6, 'all five info-button templates must be labelled');
  assert.ok(ac.includes("'.card-item, .vol-card, .shop-card, .card-info-btn'"),
    'keydown handler must cover info buttons');
});
```

- [x] **Step 3: Run `node --test`** → **expected RED** in `tests/html.test.js` only: the two version-pin assertions and the two new tests fail. Every other test file stays green.

---

### Task 2: CSS pass — `styles/main.css` (7 edits)

**Files:**
- Modify: `styles/main.css`

- [x] **Step 1: F3 — chrome trims (2 edits, unique strings):**

  a) Line 306–312 block (include full block as context):
  ```
  .tier-nav-container {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: var(--radius);
    padding: 8px 8px 0;
    margin-bottom: 12px;
  }
  ```
  → change the last two lines to `padding: 6px 6px 0;` / `margin-bottom: 8px;`.

  b) Line 2717:
  `#dateLine{display:none;text-align:center;font-size:0.8rem;color:var(--text2);padding:6px 0 2px;}`
  → `#dateLine{display:none;text-align:center;font-size:0.8rem;color:var(--text2);padding:2px 0 0;}`

- [x] **Step 2: F1 — FAB gutter on tier rows (one `replaceAll` edit, identical string at lines 2727 + 2763):**

  `#tier2Tabs,#tier3Tabs{flex-wrap:wrap;overflow-x:visible;}`
  → `#tier2Tabs,#tier3Tabs{flex-wrap:wrap;overflow-x:visible;padding-right:64px;}`

- [x] **Step 3: F1b — FAB gutter on the calendar header (2 inserts, one per phone block):**

  a) Coarse block (`@media (pointer:coarse)`), after its `#dateLine{display:block;}` line:
  ```
    .tier1-tabs{display:none;}
    #dateLine{display:block;}
  }
  ```
  → append `.cal-header .cal-nav:last-child{padding-right:64px}` as the second-to-last line (before the closing `}`).

  b) `@media (max-width: 600px)` block, right after `.cal-nav button{min-width:44px;min-height:44px}`:
  append `.cal-header .cal-nav:last-child{padding-right:64px}` on the next line.

- [x] **Step 4: F2 — equal prayer cards (one `replaceAll` edit, identical string at lines 2729 + 2766):**

  `#prayerArea .card-grid > .card-item{flex:1 1 28%;}`
  → `#prayerArea .card-grid > .card-item{flex:0 0 calc((100% - 16px)/3);}`

  (Do **not** touch `.tier1-tabs .t1-btn{flex:1 1 28%;…}` at line 2762 — different selector.)

- [x] **Step 5: F4 — info-button hit area (1 insert after line 607):**

  The base block ends at `.card-grid .card-item .card-info-btn:hover { opacity: 1; }` — append directly after it:
  ```css
  .card-grid .card-item .card-info-btn::after { content:''; position:absolute; top:-17px; right:-3px; bottom:-3px; left:-17px; }
  .card-grid .card-item .card-info-btn:focus-visible { outline:2px solid var(--accent); outline-offset:1px; border-radius:6px; }
  ```

---

### Task 3: Renderer templates — labels on all 5 info-button emitters

**Files:**
- Modify: `core/static.js` (lines 639 + 686 — both identical)
- Modify: `core/render-prayers.js` (lines 12, 41, 108)

- [x] **Step 1: `core/static.js` — one `replaceAll` edit (2 occurrences):**

  old:
  ```js
  h += '<div class="card-info-btn" onclick="event.stopPropagation();App.detail(\'' + item.id + '\')">' + iqIcon('info') + '</div>';
  ```
  new:
  ```js
  h += '<div class="card-info-btn" role="button" tabindex="0" aria-label="Details: ' + item.name + '" onclick="event.stopPropagation();App.detail(\'' + item.id + '\')">' + iqIcon('info') + '</div>';
  ```

- [x] **Step 2: `core/render-prayers.js` line 12** (prayer cards — `nm` is the day-aware name):

  old fragment: `<div class="card-info-btn" onclick="event.stopPropagation();App.detail('${p.id}')">ℹ</div>`
  new fragment: `<div class="card-info-btn" role="button" tabindex="0" aria-label="Details: ${nm}" onclick="event.stopPropagation();App.detail('${p.id}')">ℹ</div>`

- [x] **Step 3: `core/render-prayers.js` line 41** (voluntary prayers):

  old fragment: `<div class="card-info-btn" onclick="event.stopPropagation();App.detail('${v.id}')">${iqIcon('info')}</div>`
  new fragment: `<div class="card-info-btn" role="button" tabindex="0" aria-label="Details: ${v.name}" onclick="event.stopPropagation();App.detail('${v.id}')">${iqIcon('info')}</div>`

- [x] **Step 4: `core/render-prayers.js` line 108** (good deeds — note `App.tip`, not `App.detail`):

  old fragment: `<div class="card-info-btn" onclick="event.stopPropagation();App.tip('${d.id}')">${iqIcon('info')}</div>`
  new fragment: `<div class="card-info-btn" role="button" tabindex="0" aria-label="Details: ${d.name}" onclick="event.stopPropagation();App.tip('${d.id}')">${iqIcon('info')}</div>`

  Attribute order is deliberate (`role="button" tabindex="0" aria-label="Details: `) — the new test counts exactly this substring ×5.

- [x] **Step 5: Syntax check:** `node --check core/static.js` and `node --check core/render-prayers.js` → both silent (pass).

---

### Task 4: Behavior + a11y markup

**Files:**
- Modify: `features/fab.js` (`toggle()`)
- Modify: `core/actions.js` (global keydown, line ~688)
- Modify: `index.html` (`#fabMain`)

- [x] **Step 1: `features/fab.js`** — insert after the null guard inside `toggle()`:

  old:
  ```js
      if (!actions || !main) return;
      if (_open) {
  ```
  new:
  ```js
      if (!actions || !main) return;
      main.setAttribute('aria-expanded', _open ? 'true' : 'false');
      if (_open) {
  ```
  (Placement after the guard and after `_open` flips → the new state is already computed.)

- [x] **Step 2: `core/actions.js`** — extend the global Enter/Space handler selector:

  old: `e.target.matches('.card-item, .vol-card, .shop-card')`
  new: `e.target.matches('.card-item, .vol-card, .shop-card, .card-info-btn')`

- [x] **Step 3: `index.html` line 581** — FAB a11y attributes:

  old:
  ```html
  <button class="fab-main" id="fabMain" onclick="window.toggleFAB()">
  ```
  new:
  ```html
  <button class="fab-main" id="fabMain" onclick="window.toggleFAB()" aria-label="Quick actions" aria-expanded="false">
  ```

- [x] **Step 4: Syntax checks:** `node --check features/fab.js` + `node --check core/actions.js` → pass.

---

### Task 5: Version/revision bumps → GREEN

**Files:**
- Modify: `index.html` (6 refs), `sw.js` (1 constant)

- [x] **Step 1: `index.html` — exact replacements:**

  | Line | old | new |
  |---|---|---|
  | 27 | `styles/main.css?v=42` | `styles/main.css?v=43` |
  | 423 | `core/render-prayers.js?v=4` | `core/render-prayers.js?v=5` |
  | 424 | `core/static.js?v=7` | `core/static.js?v=8` |
  | 494 | `features/fab.js?v=1` | `features/fab.js?v=2` |
  | 525 | `core/actions.js?v=23` | `core/actions.js?v=24` |
  | 549 | `sw.js?v=55` | `sw.js?v=56` |

- [x] **Step 2: `sw.js` line 7:** `const MANIFEST_REV = 8;` → `const MANIFEST_REV = 9;`

- [x] **Step 3: Run `node --test`** → **all green** (the Task 1 red pins now pass; nothing else regressed).

- [x] **Step 4: Script syntax sweep:** `node core/check-syntax.js` → pass; `node --check` on every touched classic file (`styles` n/a) → pass.

---

### Task 6: Browser acceptance — before/after audit gate

**Precondition:** dev server running: `node "C:\Users\Mahin\AppData\Local\Temp\opencode\iq-static-server.js" 8123 "C:\Users\Mahin\Desktop\IQ"` (background). If it's dead, restart it first.

- [x] **Step 1: Run the harness with the `after` label:**

  `python "C:\Users\Mahin\AppData\Local\Temp\opencode\iq-mobile-audit.py" after`
  (writes `C:\Users\Mahin\AppData\Local\Temp\opencode\iq-qa\iq-audit-after.json` + PNGs)

- [x] **Step 2: Check the gate against `iq-audit-baseline.json`:**

  | Check | Baseline | Gate (after) |
  |---|---|---|
  | `tabs_checked` / `tab_errors` | 79 / `{}` | 79 / `{}` |
  | `fab_overlap_total` / `fab_overlap_tabs` | 55 / 55 tabs | **0 / `{}`** |
  | info-btn probe misses (per card × 5) | 21/25 | **0/25 × 5** |
  | prayer card widths | 116/116/116/176/176 | **all 5 equal** |
  | `overflow_tabs` | `{}` | `{}` |
  | `small_target_tabs` | `global-search` only | same only (no new signatures) |
  | chrome: tier-nav-container | top 535 / h ≈ 270 / content y ≈ 817 | ≈10–12px better (content y ≤ 808) |

- [x] **Step 3: Eyeball screenshots** — `iq-audit-after-home.png`, `iq-audit-after-fabzone.png` vs the baseline PNGs: chips visibly ending before the FAB column; 5 equal prayer cards; FAB visually clear of content.

- [x] **Step 4: Spot-check reported values** in the JSON (one knowledge tab's chip rows end ≤ x≈306; prayer card flex widths equal; info probe `miss: 0`).

---

### Task 7: Wrap-up

- [x] **Step 1:** Stop the background static server shell (id `sh_1439fd050001LUk12ENuaw6imW`; restart if the session is stale).
- [x] **Step 2:** Update the temp tracking file `C:\Users\Mahin\AppData\Local\Temp\opencode\brainstorm-mobile-ux-todos.md` (mark 5a–5f done, note results).
- [x] **Step 3:** Report to the user: before/after table, screenshots summary, files touched, `node --test` result. Do not commit (repo rule).

---

## Self-review notes (filled at write time)

- All old-strings verified against the live files this session (CSS lines 306–312, 606–607, 2717, 2727–2729, 2763–2766, 2777; static.js 639/686; render-prayers 12/41/108; actions.js 687–693; fab.js toggle; index.html 27/423/424/494/525/549/581; sw.js 7).
- Pin strings in tests are exact substrings of the planned edits; split-counts (2 occurrences → length 3) chosen deliberately so a single accidental duplicate fails the suite.
- Existing pins that must keep passing: `tests/html.test.js:471` (prefix match of the tier wrap rule), `:477` (touch floor), `:485` (`.cal-nav button` floor), `:641/:649-650` (dateLine cascade order).
- No test pins exist on the four script `?v=` values — only `main.css`/`sw.js` are pinned.
