# Multi-Theme Changer Implementation Plan (10 themes)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the single-toggable Dark theme with a 10-theme picker (5 color families × light/dark) that the user selects from swatch cards in Profile settings; the choice persists across reloads.

**Architecture:** A theme is one `data-theme` value on `<html>` selecting one CSS custom-property block that re-maps the SAME variable names (already proven by `:root` Light and the existing `html[data-theme="dark"]` Rose-Dark block). Five families × light+dark = 10 blocks re-map `--bg/--card/--text/--gold/…`. A `window.Themes` array drives a swatch-card row in Profile; `App.setTheme(name)` sets the attribute, saves `localStorage.iqTheme`, and re-renders. An inline `index.html` script applies the saved theme before first paint.

**Tech Stack:** Vanilla JS + CSS custom properties, Chart.js, node:test. No framework. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-08-07-multitheme-changer-design.md`

## Global Constraints

- Theme set by `document.documentElement.setAttribute('data-theme', key)`. `light` (default) = no attribute. 10 keys total.
- The 10 keys: `light`, `dark`, `serene`, `serene-dark`, `royal`, `royal-dark`, `sand`, `sand-dark`, `midnight`, `midnight-dark`.
- Persistence: localStorage key **`iqTheme`** storing the theme name (`'light'`, `'dark'`, `'serene'`, …). Default `light`. Global (not per-user). No OS `prefers-color-scheme` auto-follow.
- Every theme block re-maps the SAME variable names. Structural radii/fonts unchanged.
- Base accents (family | light `--bg` | dark `--bg` | light `--gold` | dark `--gold`):
  - rose: `#faf7f5` | `#0d1216` | `#f43f5e` | `#fb7185` (already built)
  - serene: `#f3f7f2` | `#152018` | `#4c7a4a` | `#7fbf7e`
  - royal: `#f7f4ff` | `#1c1830` | `#7c5cf0` | `#a78bfa`
  - sand: `#fbf6ec` | `#201a10` | `#c98a2e` | `#eec572`
  - midnight: `#f4f7fb` | `#0b1b2e` | `#3fa7c8` | `#7dd3fc`
- Light-family glass `rgba(255,255,255,0.62)`; dark-family glass `rgba(22,30,38,0.7)`.
- UI: replace single Dark Mode switch with a `🎨 Theme` horizontal scrollable swatch-card row from `window.Themes`. Active card shows selected ring. Cards are real buttons.
- `App.setTheme(name)` replaces the old `toggleTheme`. `window.renderAll()` re-renders after a theme change.
- Testing: `node --test` from repo root; tests read file text via `html`/`css`/`render` constants in `tests/html.test.js`.
- One commit per task.

---

### Task 1: Reconcile theme tests to the 10-theme picker

**Files:**
- Modify: `tests/html.test.js`

**Interfaces:**
- Consumes: `html`, `css`, `render` constants (top of `tests/html.test.js`).
- Produces: tests asserting 8 new theme blocks in css and picker wiring in render.

- [ ] **Step 1: Replace the obsolete `toggleTheme`/`Dark Mode` test and add theme tests**

Locate the test `'dark theme: profile renders a themed Mode switch'` (asserts `render.includes('Dark Mode')` and `render.includes('App.toggleTheme()')`). Delete that test. Replace the CSS test `'dark theme: CSS maps the dark palette under the html[data-theme=dark] selector'` (which asserts `css.includes('--bg: #0d1216')`) — keep it but it stays valid. Then append these two tests at the end of the file:

```js
test('theme: five families have both light and dark blocks in main.css', () => {
  for (const key of ['serene','serene-dark','royal','royal-dark','sand','sand-dark','midnight','midnight-dark']) {
    assert.ok(css.includes(`html[data-theme="${key}"]`), `missing palette block for ${key}`);
  }
  assert.ok(css.includes('html[data-theme="dark"]'));
  assert.ok(css.includes('--bg: #faf7f5'));   // light (default) block present
});

test('theme: picker references metadata and setTheme wiring', () => {
  assert.ok(render.includes('Theme'));
  assert.ok(render.includes('window.Themes'));
  assert.ok(render.includes('App.setTheme('));
});
```

- [ ] **Step 2: Run tests to confirm the new assertions fail**

Run: `node --test tests/html.test.js`
Expected: the palette-block test FAILS (serene/royal/sand/midnight blocks absent) and the picker test FAILS (no `window.Themes`, no `App.setTheme` in render yet). Existing dark tests still pass.

- [ ] **Step 3: Commit**

```bash
git add tests/html.test.js
git commit -m "test: assert 10-theme palette blocks and picker wiring"
```

---

### Task 2: Add the 8 missing theme palette blocks + picker styles in `styles/main.css`

**Files:**
- Modify: `styles/main.css` (append after the existing `html[data-theme="dark"] .app::before` rule ~line 60)

**Interfaces:**
- Consumes: the existing `:root` (Light) and `html[data-theme="dark"]` blocks; keeps variable names identical.
- Produces: 8 new `html[data-theme="…"]` blocks + `.theme-picker`/`.theme-chip`/`.theme-swatch` styles. Task 5's render code targets these classes.

- [ ] **Step 1: Append the 8 theme palette blocks**

Right after line 60, add (each block re-maps the same var names; keep every variable):

```css
html[data-theme="serene"] {
  --bg: #f3f7f2; --bg-accent: #e9f0e6; --card: rgba(255,255,255,0.62); --card2: rgba(255,255,255,0.66);
  --text: #22332b; --text2: #5f7267; --gold: #4c7a4a; --gold-light: #6f9a6b; --gold-dark: #3a5c38;
  --emerald: #4c7a4a; --emerald-deep: #3a5c38; --teal: #4c7a4a;
  --green: #16a34a; --orange: #d97706; --red: #dc2626; --purple: #7c8a4a;
  --border: rgba(31,41,55,0.08); --shadow: 0 8px 32px rgba(0,0,0,0.12);
  --glass: rgba(255,255,255,0.62); --glass-blur: 16px;
}
html[data-theme="serene-dark"] {
  --bg: #152018; --bg-accent: #101a12; --card: rgba(22,30,38,0.7); --card2: rgba(26,35,44,0.72);
  --text: #e6efe9; --text2: #9fb3a7; --gold: #7fbf7e; --gold-light: #a7d3a6; --gold-dark: #4c7a4a;
  --emerald: #7fbf7e; --emerald-deep: #4c7a4a; --teal: #7fbf7e;
  --green: #4ade80; --orange: #fbbf24; --red: #f87171; --purple: #b9c48a;
  --border: rgba(255,255,255,0.1); --shadow: 0 8px 32px rgba(0,0,0,0.45); --glass: rgba(22,30,38,0.7); --glass-blur: 16px;
}
html[data-theme="royal"] {
  --bg: #f7f4ff; --bg-accent: #ece6f7; --card: rgba(255,255,255,0.62); --card2: rgba(255,255,255,0.66);
  --text: #241f3d; --text2: #635d86; --gold: #7c5cf0; --gold-light: #a78bfa; --gold-dark: #5b3fd8;
  --emerald: #7c5cf0; --emerald-deep: #5b3fd8; --teal: #7c5cf0;
  --green: #16a34a; --orange: #d97706; --red: #dc2626; --purple: #7c5cf0;
  --border: rgba(31,41,55,0.08); --shadow: 0 8px 32px rgba(0,0,0,0.12); --glass: rgba(255,255,255,0.62); --glass-blur: 16px;
}
html[data-theme="royal-dark"] {
  --bg: #1c1830; --bg-accent: #151227; --card: rgba(22,30,38,0.7); --card2: rgba(26,35,44,0.72);
  --text: #ece8ff; --text2: #a89fd6; --gold: #a78bfa; --gold-light: #c9bbff; --gold-dark: #7c5cf0;
  --emerald: #a78bfa; --emerald-deep: #7c5cf0; --teal: #a78bfa;
  --green: #4ade80; --orange: #fbbf24; --red: #f87171; --purple: #a78bfa;
  --border: rgba(255,255,255,0.1); --shadow: 0 8px 32px rgba(0,0,0,0.45); --glass: rgba(22,30,38,0.7); --glass-blur: 16px;
}
html[data-theme="sand"] {
  --bg: #fbf6ec; --bg-accent: #f1ead9; --card: rgba(255,255,255,0.62); --card2: rgba(255,255,255,0.66);
  --text: #3f321d; --text2: #8a7a5b; --gold: #c98a2e; --gold-light: #e0b05a; --gold-dark: #a5701f;
  --emerald: #c98a2e; --emerald-deep: #a5701f; --teal: #c98a2e;
  --green: #16a34a; --orange: #b06a18; --red: #c0392b; --purple: #9b6a8a;
  --border: rgba(31,41,55,0.08); --shadow: 0 8px 32px rgba(0,0,0,0.12); --glass: rgba(255,255,255,0.62); --glass-blur: 16px;
}
html[data-theme="sand-dark"] {
  --bg: #201a10; --bg-accent: #181309; --card: rgba(22,30,38,0.7); --card2: rgba(26,35,44,0.72);
  --text: #f6efdd; --text2: #b7aa85; --gold: #eec572; --gold-light: #ffdf9e; --gold-dark: #c98a2e;
  --emerald: #eec572; --emerald-deep: #c98a2e; --teal: #eec572;
  --green: #4ade80; --orange: #f8c86a; --red: #ff8a6a; --purple: #cb9bcb;
  --border: rgba(255,255,255,0.1); --shadow: 0 8px 32px rgba(0,0,0,0.45); --glass: rgba(22,30,38,0.7); --glass-blur: 16px;
}
html[data-theme="midnight"] {
  --bg: #f4f7fb; --bg-accent: #e8eef6; --card: rgba(255,255,255,0.62); --card2: rgba(255,255,255,0.66);
  --text: #17233a; --text2: #5f6c84; --gold: #3fa7c8; --gold-light: #5cc0dd; --gold-dark: #2f7f96;
  --emerald: #3fa7c8; --emerald-deep: #2f7f96; --teal: #3fa7c8;
  --green: #16a34a; --orange: #d97706; --red: #dc2626; --purple: #6a78b8;
  --border: rgba(31,41,55,0.08); --shadow: 0 8px 32px rgba(0,0,0,0.12); --glass: rgba(255,255,255,0.62); --glass-blur: 16px;
}
html[data-theme="midnight-dark"] {
  --bg: #0b1b2e; --bg-accent: #071220; --card: rgba(22,30,38,0.7); --card2: rgba(26,35,44,0.72);
  --text: #e6f1fb; --text2: #93adc6; --gold: #7dd3fc; --gold-light: #aee6ff; --gold-dark: #3fa7c8;
  --emerald: #7dd3fc; --emerald-deep: #3fa7c8; --teal: #7dd3fc;
  --green: #4ade80; --orange: #6eb3e0; --red: #f87171; --purple: #9ab0e0;
  --border: rgba(255,255,255,0.1); --shadow: 0 8px 32px rgba(0,0,0,0.45); --glass: rgba(22,30,38,0.7); --glass-blur: 16px;
}
```

The `rose`/`dark` blocks already exist and need no change. The `:root` (Light) block stays as-is (the test asserts its `--bg: #faf7f5`).

- [ ] **Step 2: Add picker styles**

Append (after the existing `.profile-setting-row` styles or in a new component section):

```css
.theme-picker { display:flex; gap:10px; overflow-x:auto; padding:4px 2px 8px; }
.theme-chip {
  flex:0 0 72px; border-radius:12px; padding:8px 6px 6px; cursor:pointer;
  background:var(--card); border:2px solid transparent; text-align:center;
}
.theme-chip .theme-swatch { display:block; width:100%; height:46px; border-radius:8px; margin-bottom:5px; }
.theme-chip .name { font-size:0.66rem; color:var(--text2); font-weight:600; line-height:1.1; }
.theme-chip.active { border-color:var(--gold); }
.theme-chip.active .name { color:var(--gold-dark); }
.theme-chip:focus-visible { outline:3px solid var(--gold-light); outline-offset:2px; }
```

- [ ] **Step 3: Run tests**

Run: `node --test tests/html.test.js`
Expected: `theme: all families …` test PASSes (all 8 + dark blocks now present); the picker test still FAILs (needs `window.Themes`/`App.setTheme` in render — later tasks).

- [ ] **Step 4: Commit**

```bash
git add styles/main.css
git commit -m "style: add 8 theme palette blocks and picker styles"
```

---

### Task 3: Create `data/theme-meta.js` defining `window.Themes`

**Files:**
- Create: `data/theme-meta.js`

**Interfaces:**
- Consumes: the 10 theme keys.
- Produces: `window.Themes` array used by the render.js picker (Task 5). Each entry: `{ key, label, swatch: { bg, surface, accent } }`.

- [ ] **Step 1: Write the metadata file**

Create `data/theme-meta.js`:

```js
window.Themes = [
  { key:'light', label:'Light', swatch:{ bg:'#faf7f5', surface:'rgba(255,255,255,0.62)', accent:'#f43f5e' } },
  { key:'dark', label:'Rose', swatch:{ bg:'#0d1216', surface:'rgba(22,30,38,0.7)', accent:'#fb7185' } },
  { key:'serene', label:'Serene', swatch:{ bg:'#f3f7f2', surface:'rgba(255,255,255,0.62)', accent:'#4c7a4a' } },
  { key:'serene-dark', label:'Serene Dark', swatch:{ bg:'#152018', surface:'rgba(22,30,38,0.7)', accent:'#7fbf7e' } },
  { key:'royal', label:'Royal', swatch:{ bg:'#f7f4ff', surface:'rgba(255,255,255,0.62)', accent:'#7c5cf0' } },
  { key:'royal-dark', label:'Royal Dark', swatch:{ bg:'#1c1830', surface:'rgba(22,30,38,0.7)', accent:'#a78bfa' } },
  { key:'sand', label:'Sand', swatch:{ bg:'#fbf6ec', surface:'rgba(255,255,255,0.62)', accent:'#c98a2e' } },
  { key:'sand-dark', label:'Sand Dark', swatch:{ bg:'#201a10', surface:'rgba(22,30,38,0.7)', accent:'#eec572' } },
  { key:'midnight', label:'Midnight', swatch:{ bg:'#f4f7fb', surface:'rgba(255,255,255,0.62)', accent:'#3fa7c8' } },
  { key:'midnight-dark', label:'Midnight Dark', swatch:{ bg:'#0b1b2e', surface:'rgba(22,30,38,0.7)', accent:'#7dd3fc' } }
];
```

- [ ] **Step 2: Run tests**

Run: `node --test`
Expected: unchanged (no test reads this file yet). The picker test still fails awaiting Task 5.

- [ ] **Step 3: Commit**

```bash
git add data/theme-meta.js
git commit -m "feat: define 10-theme metadata for the picker"
```

---

### Task 4: Add pre-paint theme application + `setTheme` in `core/actions.js` and the `index.html` inline script

**Files:**
- Modify: `index.html`, `core/actions.js`

**Interfaces:**
- Consumes: `data-theme` attr, localStorage `iqTheme`, `App` object.
- Produces: `App.setTheme(name)` used by Task 5's chips; `applyTheme()` runs inline at load.

- [ ] **Step 1: In `index.html`, bump stylesheet `?v` and add the pre-paint inline script**

Line 12 `styles/main.css?v=2` → `?v=4` (note: a prior single-toggle task changed `v`-values; current is `?v=2`). Update the inline `<script>` currently in the head to read the saved theme before first paint:

```html
<link rel="stylesheet" href="styles/main.css?v=4">
<script>
  (function () {
    try { var t = localStorage.getItem('iqTheme'); if (t && t !== 'light') document.documentElement.setAttribute('data-theme', t); } catch (e) {}
  })();
</script>
```

- [ ] **Step 2: Add `applyTheme()`, `setTheme()`, and expose `setTheme` on `App`**

In `core/actions.js` (IIFE, near other `const` helpers), add:

```js
const THEME_KEY = 'iqTheme';
function applyTheme() {
  try { const t = localStorage.getItem(THEME_KEY) || 'light'; if (t === 'light') document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme', t); } catch (e) {}
}
function setTheme(name) {
  try { localStorage.setItem(THEME_KEY, name || 'light'); } catch (e) {}
  if (!name || name === 'light') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme', name);
  window.renderAll();
}
```

In `init()`, before `initApp()`, call `applyTheme();`. In the `window.App` literal, replace `toggleTheme` with `setTheme,`.

- [ ] **Step 3: Run tests**

Run: `node --test tests/html.test.js`
Expected: all pass except the picker test (still lacks `window.Themes`/render). 

- [ ] **Step 4: Commit**

```bash
git add index.html core/actions.js
git commit -m "feat: theme pre-paint application and setTheme wiring"
```

---

### Task 5: Render the theme swatch-row in the Profile settings

**Files:**
- Modify: `render/render.js` (renderProfile Settings block ~lines 1459-1466), `tests/html.test.js`

**Interfaces:**
- Consumes: `window.Themes` (Task 3), `App.setTheme` (Task 4), `.theme-picker`/`.theme-chip` (Task 2).
- Produces: the `🎨 Theme` picker row; active chip gets `active` class; runs on Theme clicks. Fixes the pending picker test.

- [ ] **Step 1: Update the pending `theme:` test to its real assertion**

In `tests/html.test.js`, ensure the picker test asserts the concrete markup:

```js
test('theme: picker renders the swatch chips from Themes', () => {
  assert.ok(render.includes('Theme'));
  assert.ok(render.includes('window.Themes'));
  assert.ok(render.includes('App.setTheme('));
  assert.ok(render.includes('theme-chip'));
});
```

- [ ] **Step 2: Render the picker row inside `renderProfile()`**

In `renderProfile()`, inside `<div class="profile-settings">` (before the switch-user row, line ~1461), remove the old `Dark` switch row (currently added above the username input) and add:

```js
const curTheme = document.documentElement.getAttribute('data-theme') || 'light';
const themeChips = (window.Themes || []).map(m => `
  <button class="theme-chip${m.key === curTheme ? ' active' : ''}" data-key="${m.key}" role="switch" aria-checked="${m.key === curTheme}" onclick="App.setTheme('${m.key}')">
    <span class="theme-swatch" style="background:linear-gradient(135deg,${m.swatch.bg},${m.swatch.accent});"></span>
    <span class="name">${m.label}</span>
  </button>`).join('');
h += '<div style="margin-bottom:10px;font-weight:700;color:var(--gold-dark);">🎨 Theme</div>';
h += `<div class="theme-picker">${themeChips}</div>`;
```

- [ ] **Step 3: Run the full suite**

Run: `node --test`
Expected: ALL PASS.

- [ ] **Step 4: Commit**

```bash
git add render/render.js tests/html.test.js
git commit -m "feat: theme swatch picker in profile settings"
```

---

### Task 6: Wire `data/theme-meta.js` into `index.html` and clean up the old toggle

**Files:**
- Modify: `index.html`, `core/actions.js`

**Interfaces:**
- Consumes: all prior tasks.
- Produces: `window.Themes` loaded before `render.js`; `toggleTheme` fully removed.

- [ ] **Step 1: Load the metadata script before the app scripts**

In `index.html`, add `<script src="data/theme-meta.js"></script>` in the `<head>` (after the style link / before `core/actions.js`).

- [ ] **Step 2: Remove any remaining `toggleTheme` references**

Run: `Select-String -Recurse "toggleTheme" *.js`
If any remain besides the removed `App` entry, remove them (they are dead).

- [ ] **Step 3: Run the full suite**

Run: `node --test`
Expected: ALL PASS.

- [ ] **Step 4: Commit**

```bash
git add index.html core/actions.js
git commit -m "chore: load theme metadata and remove old toggle wiring"
```

---

### Task 7: Final verification and manual smoke check

**Files:**
- Modify: none required; run + reconcile.

**Interfaces:**
- Consumes: all prior tasks.

- [ ] **Step 1: Run the complete test suite**

Run: `node --test`
Expected: ALL green.

- [ ] **Step 2: Grep for leftover `toggleTheme`/`Dark Mode`**

Run: `Select-String -Recurse "toggleTheme|Dark Mode|profile-setting-row" *.js`
Expected: no `toggleTheme`; if `Dark Mode` or `profile-setting-row` remain only as dead UI strings, note them.

- [ ] **Step 3: Manual smoke check (user does browser part)**

Open `index.html` in a browser. Confirm: default Light; Profile → 🎨 Theme shows 10 chips; tapping each instantly switches palette; reload persists; charts/labels readable per theme; swatch rows scroll on narrow screens; active chip ring. Ask the user to do the browser smoke test and confirm before marking complete.

- [ ] **Step 4: Commit any fixes**

```bash
git add -A
git commit -m "style: finish multi-theme picker verification fixes"
```

---