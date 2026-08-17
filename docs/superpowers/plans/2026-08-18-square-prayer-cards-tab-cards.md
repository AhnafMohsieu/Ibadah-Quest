# Square Prayer Cards + Square Tab Cards Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Prayer Times cards true squares at every viewport and restyle the mobile tab buttons (tier2, tier3, cat-chips) as matching square cards, tightening the Daily sub-tabs row.

**Architecture:** Pure CSS change in `styles/main.css` (mobile-only ≤600px grid overrides + the `.prayer-times-grid` block). Auto-fit CSS grid columns + `aspect-ratio: 1` on cards/buttons produce squares at every viewport without JS. Desktop rules untouched. Cache-bust `styles/main.css` version query.

**Tech Stack:** Vanilla CSS (grid + aspect-ratio), Node `node --test` for the existing test suite, headless Chrome CDP for layout verification.

## Global Constraints

- Desktop layout MUST stay byte-identical. Only the ≤600px media-query overrides and the `.prayer-times-grid` block may change.
- `.tier1-tabs` mobile rule (5-across, icon-over-label) is NOT changed.
- `tests/html.test.js` first-600px-query constraint: `.t1-btn` AND `width: auto;` must appear within the first 400 chars of the FIRST `@media (max-width: 600px)` block in `main.css`.
- Full suite must stay green: `node --test tests/*.test.js` → 317 pass / 0 fail (count may rise if new assertions/tests are added).
- Version query `styles/main.css?v=15` in `index.html:26` and the pinned assertion `tests/html.test.js:126` must bump together to `?v=16`.
- CRLF note: the repo is checked out on Windows (CRLF). When slicing CSS source by character count in tests, use ≥400-char windows to avoid truncating at token edges (previous phase lessons).

---

### Task 1: Square the Prayer Times cards (auto-fit grid + aspect-ratio)

**Files:**
- Modify: `styles/main.css:615-631` (`.prayer-times-grid` + `.pt-card`)
- Modify: `styles/main.css:1970` and `styles/main.css:1974` (remove fixed-column `.pt-card` overrides)
- Test: `tests/html.test.js` (modify)

**Interfaces:**
- Consumes: nothing at runtime — CSS-only. Existing `.pt-card` markup from `render/prayers.js` `renderPrayerTimes()` (unchanged).
- Produces: `.prayer-times-grid` renders as auto-fit grid; `.pt-card` squares via `aspect-ratio: 1`. Task 3's headless check confirms ratio ≈1.0 at 390/768/desktop.

- [ ] **Step 1: Write the failing test assertions**

In `tests/html.test.js`, inside the `mobile tab strips use even grids` test (lines 412-429), append after the existing assertions:

```js
  const ptGridIdx = css.indexOf('.prayer-times-grid');
  assert.ok(ptGridIdx > -1, '.prayer-times-grid must exist');
  const ptGridBlock = css.slice(ptGridIdx, ptGridIdx + 400);
  assert.ok(ptGridBlock.includes('repeat(auto-fit, minmax(140px, 1fr))'),
    'prayer grid must use auto-fit minmax(140px, 1fr)');
  const ptCardIdx = css.indexOf('.prayer-times-grid .pt-card {');
  assert.ok(ptCardIdx > -1 && css.slice(ptCardIdx, ptCardIdx + 400).includes('aspect-ratio: 1'),
    '.pt-card must set aspect-ratio: 1 (square cards)');
```

(Check the `.prayer-times-grid .pt-card {` selector exists verbatim in the CSS before finalizing; if the selector text differs slightly, match what's actually in `main.css` — line 616 is `.prayer-times-grid .pt-card {`.)

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/html.test.js`
Expected: FAIL — `prayer grid must use auto-fit minmax(140px, 1fr)` (grid still uses `flex-wrap`).

- [ ] **Step 3: Change the prayer grid to auto-fit squares**

In `styles/main.css:615`, change:

```css
.prayer-times-grid { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 8px; }
```
to:
```css
.prayer-times-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin-bottom: 8px; }
```

In the `.prayer-times-grid .pt-card` block (line 616), add `aspect-ratio: 1;` (e.g. next to `border-radius: 14px;`). If the measured content (icon 1.8rem + name + time + sub) clips inside a ~140px square, reduce `padding: 18px 10px` → `12px 10px` and/or `gap: 8px` → `6px` inside `.pt-card`. Keep all other card styles.

- [ ] **Step 4: Remove the fixed-column `.pt-card` overrides**

In `styles/main.css:1970` (≤600px query) remove the line:
```css
  .prayer-times-grid .pt-card { width: calc((100% - 24px) / 3); flex-basis: calc((100% - 24px) / 3); }
```
In `styles/main.css:1974` (≤400px query) remove the line:
```css
  .prayer-times-grid .pt-card { width: calc((100% - 12px) / 2); flex-basis: calc((100% - 12px) / 2); }
```
(Do NOT touch the `.card-grid .card-item` lines on 1969/1973 — those are a different component.)

- [ ] **Step 5: Run tests to verify they pass**

Run: `node --test tests/html.test.js`
Expected: PASS (grid test with new assertions green).
Run full suite: `node --test tests/*.test.js`
Expected: 317 pass / 0 fail (new assertions are inside an existing test, so count is unchanged).

- [ ] **Step 6: Commit**

```bash
git add styles/main.css tests/html.test.js
git commit -m "style: square prayer times cards (auto-fit grid + aspect-ratio)"
```

---

### Task 2: Square mobile tab cards (tier2, tier3, cat-chips) via auto-fit

**Files:**
- Modify: `styles/main.css:502-507` (mobile tier2/tier3 grid override block)
- Test: `tests/html.test.js:412-429` (modify the grid test assertions)

**Interfaces:**
- Consumes: Task 1's CSS pattern (`repeat(auto-fit, minmax(...))` + `aspect-ratio: 1`).
- Produces: mobile tab buttons (tier2 `t2-btn`, tier3 `t3-btn`/`t2-btn`, cat-chips) become square cards. Task 3's headless check confirms 12 Daily tabs render 4×3 equal-height squares with no horizontal scroll.

- [ ] **Step 1: Write the failing test update**

In `tests/html.test.js`, update the grid test's tier2/tier3 assertions (lines 421-428). Replace:

```js
  const tier23Sel = '.tier2-tabs, .tier2-tabs.cat-chips, .tier3-tabs';
  const selIdx = css.indexOf(tier23Sel);
  assert.ok(selIdx > -1, 'tier2/tier3 combined grid selector must exist');
  const t2mIdx = css.lastIndexOf('@media (max-width: 600px)', selIdx);
  assert.ok(t2mIdx > -1, 'tier2/tier3 grid override must live in a mobile media query');
  const t2Block = css.slice(t2mIdx, selIdx + 140);
  assert.ok(t2Block.includes(tier23Sel) && t2Block.includes('repeat(4, 1fr)'),
    'mobile tier2/tier3 must be 4-column grids');
```
with:
```js
  const tier23Sel = '.tier2-tabs, .tier2-tabs.cat-chips, .tier3-tabs';
  const selIdx = css.indexOf(tier23Sel);
  assert.ok(selIdx > -1, 'tier2/tier3 combined grid selector must exist');
  const t2mIdx = css.lastIndexOf('@media (max-width: 600px)', selIdx);
  assert.ok(t2mIdx > -1, 'tier2/tier3 grid override must live in a mobile media query');
  const t2Block = css.slice(t2mIdx, selIdx + 200);
  assert.ok(t2Block.includes(tier23Sel) && t2Block.includes('repeat(auto-fit, minmax(70px, 1fr))'),
    'mobile tier2/tier3 must use auto-fit minmax(70px, 1fr) square cards');
  assert.ok(css.slice(selIdx, selIdx + 300).includes('aspect-ratio: 1'),
    'mobile tier2/tier3 tab buttons must set aspect-ratio: 1');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/html.test.js`
Expected: FAIL — `mobile tier2/tier3 must use auto-fit minmax(70px, 1fr)` (still `repeat(4, 1fr)`).

- [ ] **Step 3: Update the mobile tier2/tier3 grid override**

In `styles/main.css:502-507`, change the ≤600px block:

```css
/* mobile tier2/tier3 grid overrides — placed AFTER the desktop .tier2-tabs/.tier3-tabs rules so they win the cascade at <=600px */
@media (max-width: 600px) {
  .tier2-tabs, .tier2-tabs.cat-chips, .tier3-tabs { display: grid; grid-template-columns: repeat(auto-fit, minmax(70px, 1fr)); gap: 6px; align-items: stretch; }
  .tier2-tabs .t2-btn, .tier2-tabs.cat-chips .cat-chip, .tier3-tabs .t3-btn, .tier3-tabs .t2-btn { width: 100%; min-width: 0; aspect-ratio: 1; justify-content: center; white-space: normal; padding: 6px 4px; font-size: 0.58rem; }
  .tier2-tabs.cat-chips .cat-chip { border-radius: 12px; }
}
```

Changes vs current: `repeat(4, 1fr)` → `repeat(auto-fit, minmax(70px, 1fr))`, `gap: 8px` → `6px`, and `aspect-ratio: 1` added to the button selector. Verify at 390px: `#tier2Tabs` container is ~302px wide, so auto-fit yields 4 cols ≈72px squares → 12 tabs = 4×3, all rows equal height. If labels ("Prayer Times", "Remembrance") clip inside a 72px square, reduce `font-size` to `0.55rem` and/or `padding` to `4px 2px` until they fit (headless check in Task 3 validates).

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test tests/html.test.js`
Expected: PASS. Full suite: `node --test tests/*.test.js` → 317 pass / 0 fail.

- [ ] **Step 5: Commit**

```bash
git add styles/main.css tests/html.test.js
git commit -m "style: square mobile tab cards (tier2/tier3/cat-chips auto-fit)"
```

---

### Task 3: Verify layout end-to-end in headless Chrome

**Files:**
- Test: run CDP harnesses only (no code changes unless a regression is found)

**Interfaces:**
- Consumes: Tasks 1-2 CSS.

- [ ] **Step 1: Run full test suite**

Run: `node --test tests/*.test.js`
Expected: 317 pass / 0 fail.

- [ ] **Step 2: Prayer cards square at 390×844, 768×1024, desktop**

Run: `node C:\Users\Mahin\AppData\Local\Temp\opencode\cdp_prayers.js` (or recreate it: headless Chrome CDP on 9222, static server on 8910 serving the working tree, `Emulation.setDeviceMetricsOverride` per viewport, click the `timer` `.t2-btn`, measure `.prayer-times-grid .pt-card` rects).
Expected at every viewport: each card width/height ratio ≈ 1.00 (±0.05), equal widths within a row, no `overflowX`. Clear the service worker cache first (`navigator.serviceWorker.getRegistrations().then(r=>r.forEach(x=>x.unregister()))` + `caches.keys().then(ks=>Promise.all(ks.map(k=>caches.delete(k))))`) or use a fresh profile, else stale `iq-cache-v16` CSS serves old styles.

- [ ] **Step 3: Daily sub-tabs row compact + square at 390×844**

Run: `node C:\Users\Mahin\AppData\Local\Temp\opencode\cdp_daily.js` (or recreate: same CDP setup, measure `#tier2Tabs .t2-btn` rects at 390).
Expected: 12 buttons, 4 cols × 3 rows, each ≈72px square (ratio ≈1.0), all rows equal height (no 65px/55px mismatch), row spacing such that the whole tier2 block is ~30% shorter than before (old ≈210px), no `overflowX`.

- [ ] **Step 4: Tier3 + cat-chips square, no console errors**

At 390×844, click Knowledge → a sub-category (e.g. Heart & Soul): tier3 buttons render as square cards, no horizontal scroll, 0 console error calls. Click back to a categorized group and verify `.cat-chip` buttons are square cards.

- [ ] **Step 5: Desktop regression check**

At 1366×900: tier1 5-across unchanged, tier2/tier3 desktop flex-wrap layouts unchanged, `.prayer-times-grid` shows squares (auto-fit ≥5 cols), no console errors.

- [ ] **Step 6: Fix any regressions and re-verify**

If any check fails (e.g. label clipping in a 70px/140px square, a row overflow), fix the relevant rule in `styles/main.css` (same blocks from Tasks 1-2), re-run Steps 1-5 until green, and note the fix.

- [ ] **Step 7: Commit any fixes**

```bash
git add styles/main.css tests/html.test.js
git commit -m "chore: square prayer/tab cards verification fixes"
```
(If no fixes were needed, skip and note "no fixes needed".)

---

### Task 4: Cache-bust the CSS version query

**Files:**
- Modify: `index.html:26`
- Modify: `tests/html.test.js:126`
- Test: `tests/sw.test.js` (no change — verify only)

**Interfaces:**
- Consumes: Tasks 1-3 (`main.css` changed).
- Produces: field users receive the new CSS (service worker is cache-first, keyed on pathname+query).

- [ ] **Step 1: Bump the version query**

In `index.html:26`, change `styles/main.css?v=15` → `styles/main.css?v=16`.

- [ ] **Step 2: Update the pinned test assertion**

In `tests/html.test.js:126`, change `styles/main.css?v=14` assertion — NOTE: it currently reads `styles/main.css?v=15` (bumped in the previous release). Update it to `styles/main.css?v=16`.

- [ ] **Step 3: Run the full suite**

Run: `node --test tests/*.test.js`
Expected: 317 pass / 0 fail.

- [ ] **Step 4: Verify in headless Chrome**

Confirm the served page references `styles/main.css?v=16` (e.g. CDP evaluate `document.querySelector('link[rel="preload"][as="style"]').href` or fetch the HTML and grep for the query). Clear SW cache / fresh profile, then confirm prayer cards + tab cards still square (spot-check one viewport).

- [ ] **Step 5: Commit**

```bash
git add index.html tests/html.test.js
git commit -m "chore: cache-bust main.css v16 (square card styles)"
```

---

## Self-Review

**Spec coverage:**
- Prayer cards square at every viewport (auto-fit minmax(140px,1fr) + aspect-ratio) → Task 1.
- Remove fixed-column `.pt-card` overrides → Task 1 Step 4.
- Daily sub-tabs square cards, 4×3 equal-height at 390px, ~30% shorter → Task 2 (+ Task 3 verification).
- Tier3 + cat-chips same square-card family → Task 2 (selector covers `.tier3-tabs .t3-btn`, `.tier3-tabs .t2-btn`, `.cat-chip`).
- Desktop unchanged → only ≤600px overrides + `.prayer-times-grid` block touched; tier1 mobile 5-across untouched.
- Tests: grid test updated + prayer-square assertions → Tasks 1-2.
- Headless verification → Task 3.
- Cache-bust `main.css` v15→v16 → Task 4.

**Notes:**
- `tests/html.test.js:126` already reads `styles/main.css?v=15` (bumped in the previous release) — Task 4 updates it to `v=16`, not `v=14`.
- The `mobile tab strips use even grids` test name still says "4-per-row" — Task 2 rewrites the tier2/tier3 assertions; consider renaming the test to `mobile tab strips use even grid cards` for accuracy (optional, include if clean).
- `repeat(4, 1fr)` still appears elsewhere in `main.css` (ach-grid, profile-stats, combo-grid) — that's fine; the tier2/tier3 assertions now anchor on the combined selector within the mobile media query, so no false positives.