# Adaptive Shell + Intro + Nav Unity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Touch-first adaptive shell, repeat-proof intro, unified nav metrics with even grids, and a boot watchdog with force-refresh recovery — verified by tests + Playwright.

**Architecture:** One `@media (pointer:coarse)` CSS block + base-CSS unifications + small JS additions (date line in render/tabs.js, intro flag hardening in core/actions.js, self-contained watchdog inline in index.html). No renderer rewrites. Controller finale: Playwright verify + commit + push.

**Tech Stack:** Vanilla JS PWA, plain CSS, Node built-in test runner (`node --test`), Playwright MCP (controller only).

## Global Constraints

- Do NOT commit (controller commits + pushes in the finale with user's standing approval from the approved spec).
- Do NOT stage core/actions.js, core/content.js, core/storage.js, opencode.json — but Task 2 DOES edit core/actions.js (intro flags; user-dirty file). Edits must be minimal exact-string replacements; after editing, run `git diff core/actions.js` and confirm the only hunks are yours + the pre-existing user hunks (no reverts). Never `git add` those four files yourself except in the finale commit... correction: NEVER stage them at all; the controller stages everything in the finale.
- Cache coherence at the end (Task 5): `render/tabs.js?v=6 → ?v=7`, `core/actions.js?v=21 → ?v=22`, `styles/main.css?v=24 → ?v=25`, `sw.js?v=34 → ?v=35` registration, `CACHE_NAME 'iq-cache-v34' → 'iq-cache-v35'`, pins in tests/html.test.js + tests/sw.test.js. (If grep shows different current values, use current+1 consistently.)
- New coarse block goes AFTER the `@media (max-width: 767px)` block (line ~2635-2638) so `nav.bnav` beats the 768px hide. Never insert anything before the FIRST 600px query.
- `node --test` must stay green (495/495 at plan time).
- Windows PowerShell 5.1: no `&&`, no `tail`; test command is exactly `node --test` from repo root.

---

## File Structure

- Modify: `styles/main.css` — coarse block; tier1-hide + date-line rules (<767 + coarse); intro CSS; unified nav metrics; grid orphan rules; FAB offset; `#tier2Tabs{justify-content:center}` in 600px block.
- Modify: `index.html` — `#dateLine` div, watchdog inline script, recovery overlay buttons are injected by the watchdog itself (no static markup change needed).
- Modify: `render/tabs.js` — `renderDateLine` + call in `switchCategory`.
- Modify: `core/actions.js` — introSeen mirror write in `startJourney`, mirror check in `initApp` (minimal edits only).
- Modify: `tests/html.test.js` — regression tests per task.
- Modify: `sw.js:2`, `tests/sw.test.js` — version bumps (Task 5).
- No new files.

---

### Task 1: Adaptive shell + date line (CSS + HTML + JS + test)

**Files:**
- Modify: `styles/main.css` (coarse block after the 767 block; tier1-hide + dateline rules)
- Modify: `index.html` (dateLine div after the tier1-tabs div, before tier2-scroll)
- Modify: `render/tabs.js` (renderDateLine + call)
- Test: `tests/html.test.js`

**Interfaces:**
- Consumes: `window.gregorianToHijri` + `window.HIJRI_MONTHS` (render/calendar.js, non-defer, loads before tabs.js; always typeof-guard), `today()` global, `switchCategory(catId, btn)`.
- Produces: `window.renderDateLine()` (idempotent, safe to call any time); `#dateLine` element.

- [ ] **Step 1: Write the failing tests**

Append to `tests/html.test.js`:

```js
test('touch devices get mobile shell at any width', () => {
  const css = arguments; // placeholder never runs
});
```

No — write the REAL tests (no placeholders):

```js
test('coarse pointers force the mobile shell', () => {
  const i = css.indexOf('@media (pointer:coarse)');
  assert.ok(i > -1, 'coarse block missing');
  const hideIdx = css.indexOf('@media (min-width: 768px)');
  assert.ok(hideIdx > -1 && hideIdx < i, 'coarse block must come after the bnav hide rule');
  const b = css.slice(i, i + 1200);
  assert.ok(b.includes('nav.bnav{display:flex'), 'coarse must force bnav visible');
  assert.ok(b.includes('.tier1-tabs{display:none'), 'coarse must hide tier1');
  assert.ok(b.includes('#dateLine{display:block'), 'coarse must show date line');
  assert.ok(b.includes('#tier2Tabs{justify-content:center;}'),
    'coarse must center orphan chips');
});

test('tier1 hides on mobile in favor of the date line', () => {
  assert.ok(html.includes('id="dateLine"'), 'dateLine div missing from index.html');
  assert.ok(renderTabs.includes('window.renderDateLine'), 'renderDateLine must be exported');
  assert.ok(renderTabs.includes('renderDateLine()'), 'switchCategory must refresh the date line');
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/html.test.js`
Expected: FAIL with `'coarse block missing'`.

- [ ] **Step 3: Write minimal implementation**

(a) In `styles/main.css`, immediately AFTER the `@media (max-width: 767px) { ... }` block (the one with `.fab-container` 84px + `.app` 96px padding), insert:

```css
/* ── Touch-first devices: mobile shell at any viewport ── */
@media (pointer:coarse) {
  nav.bnav{display:flex;}
  .app{padding-bottom:calc(96px + env(safe-area-inset-bottom,0px));}
  #tier2Tabs,#tier3Tabs{flex-wrap:wrap;overflow-x:visible;}
  #tier2Tabs .t2-btn,#tier3Tabs .t2-btn,#tier2Tabs .cat-chip{flex:1 1 auto;min-width:0;white-space:normal;}
  #tier2Tabs{justify-content:center;}
  button:not(.carousel-dot):not(.t3-btn):not(.bnav-btn){min-height:44px;min-width:44px}
  input[type="text"],input[type="number"],input[type="search"],select,textarea,.profile-input,.amount-custom-input,.quran-search{font-size:16px;min-height:44px}
  .tier1-tabs{display:none;}
  #dateLine{display:block;}
}
```

(b) Base rule (applies everywhere): `#dateLine{display:none;text-align:center;font-size:0.8rem;color:var(--text2);padding:6px 0 2px;}` — place immediately BEFORE the coarse block. And in the `@media (max-width: 767px)` block, append two lines: `.tier1-tabs{display:none;}` and `#dateLine{display:block;}` (same block that already holds the fab/app rules).

(c) In `index.html`, immediately after the closing `</div>` of the `tier1-tabs` div (the line with the profile_main button) and before `<div class="tier2-scroll">`, insert:
`<div id="dateLine" class="date-line" aria-live="off"></div>`
(Note: NO inline display style — CSS controls visibility.)

(d) In `render/tabs.js`, immediately before `  function switchCategory(catId, btn) {`, insert:

```js
  function renderDateLine() {
    var el = document.getElementById('dateLine');
    if (!el) return;
    var d = new Date();
    var g = d.getDate() + ' ' + ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()] + ' ' + d.getFullYear();
    var h = '';
    try {
      if (window.gregorianToHijri && window.HIJRI_MONTHS) {
        var hd = window.gregorianToHijri(d.getFullYear(), d.getMonth() + 1, d.getDate());
        if (hd) h = hd.day + ' ' + window.HIJRI_MONTHS[hd.month - 1] + ' ' + hd.year;
      }
    } catch (e) {}
    el.textContent = h ? (g + ' \u00b7 ' + h) : g;
  }
  window.renderDateLine = renderDateLine;
```

And as the first line INSIDE `switchCategory(catId, btn) {`, insert:
`    try { renderDateLine(); } catch (e) {}`

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test tests/html.test.js`
Expected: PASS.

- [ ] **Step 5: Run full suite + syntax check**

Run: `node --test` (expect 497/497: 495 + 2 new) and `node --check render/tabs.js`.

---

### Task 2: Intro hardening + mobile polish (JS + CSS + test)

**Files:**
- Modify: `core/actions.js` (startJourney + initApp intro block ONLY — verify with `git diff core/actions.js` that no other hunks changed)
- Modify: `styles/main.css` (intro rules)
- Test: `tests/html.test.js`

**Interfaces:**
- Consumes: `S.introSeen`, `saveState()`, `localStorage`.
- Produces: synchronous `iq_intro_seen` mirror flag; initApp honors either flag.

- [ ] **Step 1: Write the failing test**

Append to `tests/html.test.js`:

```js
test('intro dismissal persists synchronously with a mirror flag', () => {
  assert.ok(actions.includes("localStorage.setItem('iq_intro_seen', '1')"),
    'startJourney must write the mirror flag');
  assert.ok(actions.includes("localStorage.getItem('iq_intro_seen')"),
    'initApp must check the mirror flag');
  assert.ok(css.includes('height:100dvh') || css.includes('height: 100dvh'),
    'intro overlay must use dynamic viewport height');
  assert.ok(css.includes('.intro-btn{min-height:48px') || css.includes('.intro-btn {min-height:48px') ||
    css.includes('min-height:48px'),
    'intro button must meet 48px target');
});
```

Note: the `actions` variable is already loaded at the top of html.test.js (`core/actions.js` source). Verify by grepping the test file for `const actions` before writing — if the variable has a different name, use the real one.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/html.test.js`
Expected: FAIL with `'startJourney must write the mirror flag'`.

- [ ] **Step 3: Write minimal implementation**

In `core/actions.js`, replace the whole `startJourney` function (exact current text):
```js
  function startJourney() {
    var overlay = document.getElementById('introOverlay');
    if (overlay) {
```
with:
```js
  function startJourney() {
    try { S.introSeen = true; } catch (e) {}
    try { localStorage.setItem('iq_intro_seen', '1'); } catch (e) {}
    try { saveState(); } catch (e) {}
    var overlay = document.getElementById('introOverlay');
    if (overlay) {
```
And inside the existing `setTimeout(function(){ ... }, 800);` callback, the line `S.introSeen = true; saveState();` stays (harmless duplicate) — do NOT remove it.

In `core/actions.js` initApp, replace:
```js
  const overlay = document.getElementById('introOverlay');
  const introSeen = S ? !!S.introSeen : true;
```
with:
```js
  const overlay = document.getElementById('introOverlay');
  var mirrorSeen = false;
  try { mirrorSeen = localStorage.getItem('iq_intro_seen') === '1'; } catch (e) {}
  const introSeen = (S ? !!S.introSeen : true) || mirrorSeen;
```

In `styles/main.css`, apply:
1. Old:
```
.intro-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
```
New:
```
.intro-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  height: 100dvh;
```
2. Old: `.intro-content { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; padding: 20px; }`
   New: `.intro-content { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; padding: calc(20px + env(safe-area-inset-top, 0px)) 24px 20px; max-width: 22rem; width: 100%; }`
3. Old (inside `.intro-subtitle`): `  letter-spacing: 3px;` → New: `  letter-spacing: 1.5px;` (target via the full `.intro-subtitle {` block context to keep it unique).
4. Old (inside `.intro-btn`): `  margin-top: 36px;` → New: `  margin-top: 28px; min-height: 48px;` (same uniqueness rule).

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test tests/html.test.js`, then `node --check core/actions.js`.
Expected: PASS + clean check.

- [ ] **Step 5: Full suite + diff audit**

Run: `node --test` (expect 498/498). Then `git diff core/actions.js` and confirm the ONLY hunks are the two intro edits. Report the diff stat in your report.

---

### Task 3: Nav unity + even grids + FAB clearance (CSS + test)

**Files:**
- Modify: `styles/main.css` (base rules + orphan selectors + FAB offset + `#tier2Tabs{justify-content:center}` in the 600px block)
- Test: `tests/html.test.js`

**Interfaces:**
- Consumes: current base values (verified 2026-09-06): t1 padding `12px 6px`, no min-height; t2/t3 padding `10px 6px`, min-height 44px, t2 font `clamp(0.72rem,1.8vw,0.78rem)`, t3 font `clamp(0.65rem,1.7vw,0.7rem)`; cat-chip padding `8px 10px`, icon 1rem; t1 icon 24px, t2 span 1.25rem, t2 icons 1.3rem, t3 span 1.15rem; radius `var(--radius-sm)` on t1/t2/t3; FAB 767-block `bottom:calc(84px...)`.
- Produces: unified metrics; orphan rules; FAB at 104px.

- [ ] **Step 1: Write the failing test**

Append to `tests/html.test.js`:

```js
test('nav tiers share one sizing language', () => {
  assert.ok(css.includes('.t2-btn,.t3-btn,.cat-chip{white-space:normal}'),
    'nav buttons must allow label wrapping');
  assert.ok(css.includes('.tier3-tabs > :last-child:nth-child(4n+1){grid-column:1 / -1}'),
    'lone grid orphan must span full width');
  assert.ok(css.includes('bottom:calc(104px + env(safe-area-inset-bottom,0px))'),
    'FAB must clear the bottom nav');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/html.test.js`
Expected: FAIL with `'nav buttons must allow label wrapping'`.

- [ ] **Step 3: Write minimal implementation**

In `styles/main.css`:
1. `.t1-btn` block: `padding: 12px 6px;` → `padding: 12px 10px; min-height: 48px;` (edit within the `.t1-btn {` block only).
2. `.t1-btn .iq-icon { width: 24px; height: 24px; }` → `.t1-btn .iq-icon { width: 22px; height: 22px; }`.
3. `.t2-btn` block: `padding: 10px 6px;` → `padding: 12px 10px; min-height: 44px;` → `padding: 12px 10px; min-height: 48px;`; `font-size: clamp(0.72rem, 1.8vw, 0.78rem);` → `font-size: 0.8rem;` (both inside `.t2-btn {` only).
4. `.t3-btn` block: same padding/min-height treatment; `font-size: clamp(0.65rem, 1.7vw, 0.7rem);` → `font-size: 0.8rem;` (inside `.t3-btn {` only).
5. `.cat-chip` block: `padding: 8px 10px;` → `padding: 12px 10px;` and add `min-height: 48px;` (inside `.cat-chip {` only).
6. Replacements (each unique — verify): `.t1-btn` stays; `.t2-btn span { font-size: 1.25rem;` → `font-size: 22px;`; `.t3-btn span { font-size: 1.15rem;` → `font-size: 22px;`; `.t2-btn .iq-icon { width: 1.3rem; height: 1.3rem; }` → `width: 22px; height: 22px;` (and the `span .iq-icon` twin on the next line, same change); `.cat-chip .iq-icon { width: 1rem; height: 1rem;` → `width: 22px; height: 22px;` (keep the `vertical-align`).
7. Radius: in `.t1-btn {`, `.t2-btn {`, `.t3-btn {` blocks only, `border-radius: var(--radius-sm);` → `border-radius: 12px;` (three separate edits, one per block).
8. After the `.tier3-tabs { display: grid; ... }` base rule, append:
```css
.tier2-btn,.t3-btn,.cat-chip{white-space:normal;}
.tier3-tabs > :last-child:nth-child(4n+1){grid-column:1 / -1;}
.tier3-tabs > :nth-last-child(2):nth-child(4n+1){grid-column:2 / 3;}
.tier3-tabs > :last-child:nth-child(4n+2){grid-column:3 / 4;}
```
9. In the `@media (max-width: 600px)` block, after `#tier2Tabs,#tier3Tabs{flex-wrap:wrap;overflow-x:visible;}`, add on its own line: `  #tier2Tabs{justify-content:center;}` (full rows fill via flex-grow so only partial rows move).
10. In the `@media (max-width: 767px)` block: `bottom: calc(84px + env(safe-area-inset-bottom, 0px));` → `bottom: calc(104px + env(safe-area-inset-bottom, 0px));`. In the same 600px block as #9, append: `  .tab-panel{padding-bottom:12px;}`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test tests/html.test.js`
Expected: PASS.

- [ ] **Step 5: Full suite**

Run: `node --test`
Expected: 499/499 pass (498 + 1 new).

---

### Task 4: Boot watchdog (HTML inline + test)

**Files:**
- Modify: `index.html` (one inline script after the theme pre-paint script + watchdog markup injected by the script itself; no static markup change)
- Test: `tests/html.test.js`

**Interfaces:**
- Consumes: `#recoveryOverlay` div (exists), `.toast-overlay.show` pattern, `window.App` (set at end of finishInit).
- Produces: `window.__iqBootT0`, `window.__iqReload`, `window.__iqFreshStart`.

- [ ] **Step 1: Write the failing test**

Append to `tests/html.test.js`:

```js
test('boot watchdog offers force-refresh when stuck', () => {
  assert.ok(html.includes('window.__iqBootT0'),
    'boot timestamp marker missing');
  assert.ok(html.includes('window.__iqReload'),
    'reload handler missing');
  assert.ok(html.includes('window.__iqFreshStart'),
    'fresh-start handler missing');
  assert.ok(html.includes('caches.delete') || html.includes('caches.keys'),
    'fresh start must purge service-worker caches');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/html.test.js`
Expected: FAIL with `'boot timestamp marker missing'`.

- [ ] **Step 3: Write minimal implementation**

In `index.html`, immediately AFTER the theme pre-paint `<script>` block (the one with `localStorage.getItem('iqTheme')`), insert:

```html
  <script>
    window.__iqBootT0 = Date.now();
    window.__iqReload = function() { location.reload(); };
    window.__iqFreshStart = function() {
      try {
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistrations().then(function(rs) {
            rs.forEach(function(r) { try { r.unregister(); } catch (e) {} });
          });
        }
        if (window.caches) {
          caches.keys().then(function(ks) {
            ks.forEach(function(k) { try { caches.delete(k); } catch (e) {} });
          });
        }
      } catch (e) {}
      setTimeout(function() { location.reload(); }, 600);
    };
    setTimeout(function() {
      if (window.App) return;
      var ov = document.getElementById('recoveryOverlay');
      if (!ov) { location.reload(); return; }
      ov.innerHTML = '<div class="toast-box"><h3>App seems stuck</h3><div class="toast-msg">Your data is safe. Reload to recover.</div><div style="display:flex;gap:8px;justify-content:center;margin-top:12px;"><button class="onboarding-btn" onclick="window.__iqReload()">Reload</button><button class="onboarding-btn" onclick="window.__iqFreshStart()">Clear cache &amp; reload</button></div></div>';
      ov.classList.add('show');
      ov.style.display = 'flex';
    }, 8000);
  </script>
```

Note: `.toast-msg` has no dedicated CSS rule — it inherits body text styling inside `.toast-box` (text-align:center). Acceptable; do not invent new classes.

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test tests/html.test.js`, then `node --check` is N/A for HTML — instead verify no `</script>` breakage: `node -e "const s=require('fs').readFileSync('index.html','utf8');console.log('scripts:',(s.match(/<script/g)||[]).length,'closes:',(s.match(/<\/script>/g)||[]).length)"` — counts must be equal.

- [ ] **Step 5: Full suite**

Run: `node --test`
Expected: 500/500 pass (499 + 1 new).

---

### Task 5: Cache bumps + full suite (no commit)

**Files:**
- Modify: `index.html`, `render/tabs.js` version only if its `?v=` changed (it did NOT change content? — it DID: renderDateLine added → bump `render/tabs.js?v=6` → `?v=7`), `core/actions.js?v=21` → `?v=22`, `styles/main.css?v=24` → `?v=25`, `sw.js?v=34` → `?v=35`, `CACHE_NAME`, pins.

**Interfaces:**
- Consumes: Tasks 1-4.
- Produces: coherent versions; controller finale (audit + commit + push) follows.

- [ ] **Step 1: Confirm current versions**

```powershell
Select-String -Path index.html -Pattern '\?v=' -SimpleMatch | ForEach-Object { $_.Line.Trim() } | Select-String -Pattern 'main.css|tabs.js|actions.js|sw.js\?v'
Select-String -Path sw.js -Pattern 'CACHE_NAME' | Select-Object -First 1
```
Expected: main.css?v=24, tabs.js?v=6, actions.js?v=21, sw.js?v=34, iq-cache-v34. If different, use current+1 consistently.

- [ ] **Step 2: Bump versions**

- `index.html`: `styles/main.css?v=24`→`?v=25`; `render/tabs.js?v=6`→`?v=7`; `core/actions.js?v=21`→`?v=22`; `sw.js?v=34`→`?v=35`
- `sw.js`: `'iq-cache-v34'`→`'iq-cache-v35'`
- `tests/html.test.js`: `styles/main.css?v=24`→`?v=25` (all occurrences); `sw.js?v=34` pin→`?v=35`. (No test pins tabs.js/actions.js versions — verified 2026-09-06 via grep; if grep finds any, update those too.)
- `tests/sw.test.js`: `iq-cache-v34`→`iq-cache-v35` (all occurrences)

- [ ] **Step 3: Verify no stale pins**

```powershell
Select-String -Path index.html,sw.js,tests/html.test.js,tests/sw.test.js -Pattern '?v=24','sw.js?v=34','iq-cache-v34' -SimpleMatch
```
Expected: no output (other files' own versions like `data/tab-groups.js?v=8` are untouched and fine).

- [ ] **Step 4: Full suite + syntax checks**

Run: `node --check render/tabs.js`, `node --check core/actions.js`, `node --check sw.js`, then `node --test`. Expected: 500/500 pass. Report counts; do NOT commit (controller finale).
