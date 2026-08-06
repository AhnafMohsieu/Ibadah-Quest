# Dark Mode Toggle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an opt-in dark mode to Ibadah Quest, toggled from a switch in the Profile settings, defaulting to light and remembering the user's choice.

**Architecture:** The app's theme is a block of CSS custom properties on `:root`. Dark mode adds a second variable block scoped to `html[data-theme="dark"]`, re-mapping the same variable names. A tiny inline script in `index.html` applies the saved theme before first paint (no flash). A switch in the Profile settings calls a new `App.toggleTheme()` which flips the attribute, persists to `localStorage`, and re-renders. Charts read grid/label colors from CSS vars so they re-theme automatically on re-render.

**Tech Stack:** Vanilla JS + CSS custom properties, Chart.js, node:test. No framework. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-08-07-dark-mode-toggle-design.md`

## Global Constraints

- Keep all CSS variable **names** unchanged; add a second block only under `html[data-theme="dark"]`.
- Dark palette: bg `#0d1216`, bg-accent `#11181e`, card `rgba(22,30,38,0.7)`, card2 `rgba(26,35,44,0.72)`, text `#f1f5f9`, text2 `#94a3b8`, gold(accent) `#fb7185`, gold-light `#fda4af`, gold-dark `#f43f5e`, green `#4ade80`, orange `#fbbf24`, red `#f87171`, purple `#c084fc`, border `rgba(255,255,255,0.1)`, shadow `0 8px 32px rgba(0,0,0,0.45)`. Rose/accent rgb `244,63,94`.
- Glass is preserved as dark frosted: `background: rgba(22,30,38,0.7); backdrop-filter: blur(16px) saturate(160%); border: 1px solid rgba(255,255,255,0.1);`.
- Preference is global (not per-user), stored under localStorage key `iqTheme`, values `'light'` | `'dark'`, default `'light'`.
- Set the theme via `document.documentElement.setAttribute('data-theme', mode)`. Light default means no attribute.
- No auto-follow of OS `prefers-color-scheme`. No per-user theme. No behavior/content changes.
- App branding, structure, and behavior unchanged. One commit per task.

---

### Task 1: Write failing tests for the dark theme tokens and toggle wiring

**Files:**
- Modify: `tests/html.test.js`

**Interfaces:**
- Consumes: `html` and `css` constants already defined at the top of `tests/html.test.js` (read `index.html` and `styles/main.css`).
- Produces: six new assertions that fail until later tasks land.

- [ ] **Step 1: Append dark-theme tests to `tests/html.test.js`**

Append after the last test (line 112):

```js
test('dark theme: CSS maps the dark palette under the html[data-theme=dark] selector', () => {
  assert.ok(css.includes('html[data-theme="dark"]'));
  assert.ok(css.includes('--bg: #0d1216'));
  assert.ok(css.includes('backdrop-filter'));
});

test('dark theme: index.html applies saved theme before first paint (no-flash)', () => {
  assert.ok(html.includes("localStorage.getItem('iqTheme')"));
  assert.ok(html.includes("setAttribute('data-theme'"));
  assert.ok(html.includes('styles/main.css?v=3'));
});

test('dark theme: profile renders a themed Mode switch', () => {
  assert.ok(render.includes('Dark Mode'));
  assert.ok(render.includes('App.toggleTheme()'));
});
```

- [ ] **Step 2: Run tests to confirm the new assertions fail**

Run: `node --test tests/html.test.js`
Expected: the three new tests FAIL; all pre-existing tests still PASS.

- [ ] **Step 3: Commit**

```bash
git add tests/html.test.js
git commit -m "test: assert dark theme tokens and toggle wiring"
```

---

### Task 2 — Add the dark palette block and theme-aware surface styles in `styles/main.css`

**Files:**
- Modify: `styles/main.css`

**Interfaces:**
- Consumes: the existing `:root` block (lines 5-30) — all variable names stay.
- Produces: the `html[data-theme="dark"]` override block plus a `.theme-switch` visual for the Profile row. Task 4's render code and Task 5's charts read these via CSS vars.

- [ ] **Step 1: Append the dark override block after the light `:root` block**

After the `:root { … }` closing brace (line 30), add:

```css
html[data-theme="dark"] {
  --bg: #0d1216;
  --bg-accent: #11181e;
  --card: rgba(22,30,38,0.7);
  --card2: rgba(26,35,44,0.72);
  --emerald: #f472b6;
  --emerald-deep: #f43f5e;
  --gold: #fb7185;
  --gold-light: #fda4af;
  --gold-dark: #f43f5e;
  --teal: #f472b6;
  --text: #f1f5f9;
  --text2: #94a3b8;
  --green: #4ade80;
  --orange: #fbbf24;
  --red: #f87171;
  --purple: #c084fc;
  --border: rgba(255,255,255,0.1);
  --shadow: 0 8px 32px rgba(0,0,0,0.45);
  --glass: rgba(22,30,38,0.7);
  --glass-blur: 16px;
}
html[data-theme="dark"] body {
  background-color: var(--bg);
  background-image: radial-gradient(circle at 50% 0%, rgba(244,114,182,0.06) 0%, transparent 55%);
}
html[data-theme="dark"] .app::before,
html[data-theme="dark"] .app::after { opacity: 0.35; }
```

- [ ] **Step 2: Add the Profile theme-switch visual styles**

Append (in a theme/components section, near other controls):

```css
.profile-setting-row {
  display: flex; align-items: center; justify-content: space-between;
  gap: 10px; padding: 10px 4px; margin-bottom: 10px;
}
.profile-setting-row .theme-switch {
  appearance: none; -webkit-appearance: none;
  width: 48px; height: 27px; border-radius: 14px; border: none; cursor: pointer;
  background: rgba(31,41,55,0.2); position: relative; transition: background 0.25s;
  outline: none; flex-shrink: 0;
}
.profile-setting-row .theme-switch:focus-visible { box-shadow: 0 0 0 3px rgba(244,63,94,0.4); }
.profile-setting-row .theme-switch::after {
  content: ''; position: absolute; top: 3px; left: 3px; width: 21px; height: 21px;
  border-radius: 50%; background: #fff; transition: transform 0.25s;
}
.profile-setting-row .theme-switch.on { background: var(--gold); }
.profile-setting-row .theme-switch.on::after { transform: translateX(21px); }
```

- [ ] **Step 3: Run tests**

Run: `node --test tests/html.test.js`
Expected: the new "CSS variables" test PASSES; the two other new tests still FAIL (not yet wired).

- [ ] **Step 4: Commit**

```bash
git add styles/main.css
git commit -m "style: add dark palette override and theme switch styles"
```

---

### Task 3 — Theme application and toggle logic in `index.html`

**Files:**
- Modify: `core/actions.js`, `index.html`

**Interfaces:**
- Consumes: `data-theme` attribute and localStorage key `iqTheme`.
- Produces: `applyTheme()`, `applyDarkPref()`, `toggleTheme()`, and `window.App.toggleTheme` used by Task 4's switch markup.

- [ ] **Step 1: Add a no-flash theme application inline script in `index.html`**

In `<head>`, right after the stylesheet link (line 12), bump the cache version and insert the inline script:

```html
<link rel="stylesheet" href="styles/main.css?v=3">
<script>
  (function () {
    try { if (localStorage.getItem('iqTheme') === 'dark') document.documentElement.setAttribute('data-theme', 'dark'); } catch (e) {}
  })();
</script>
```

- [ ] **Step 2: Add theme helpers and expose the toggle on `App`**

In `core/actions.js`, inside the IIFE (top scope, near `state.js` usage), add:

```js
const THEME_KEY = 'iqTheme';
function currentDark() { return document.documentElement.getAttribute('data-theme') === 'dark'; }
function applyTheme() {
  try { if (localStorage.getItem(THEME_KEY) === 'dark') document.documentElement.setAttribute('data-theme', 'dark'); } catch (e) {}
}
function toggleTheme() {
  const next = currentDark() ? 'light' : 'dark';
  try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
  if (next === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
  else document.documentElement.removeAttribute('data-theme');
  window.renderAll(); /* re-render all tabs + charts with the new theme */
}
```

Add `toggleTheme` to the `window.App` object literal (in `init()`, near line 2219-2240):

```js
toggleTheme,
```

Call `applyTheme()` inside `init()` before `initApp()` (so it persists across reload without relying only on the inline script).

- [ ] **Step 3: Run tests**

Run: `node --test tests/html.test.js`
Expected: the new `?: applies saved theme the "no-flash" test now PASSes (theme color/`v=3`/inline script present); the `Profile renders` test still relies on Task 4 and now PASSes too only after render change — see Task 4.

- [ ] **Step 4: Commit**

```bash
git add index.html core/actions.js
git commit -m "feat: persistence and toggle for dark theme"
```

---

### Task 4 — Add the Dark/Mode switch to the Profile settings row

**Files:**
- Modify: `render/render.js` (the `renderProfile` Settings block, lines 1459-1464)

**Interfaces:**
- Consumes: `App.toggleTheme()` from Task 3 and the `.theme` switch CSS from Task 2.
- Produces: the switch row in Profile; clicking it toggles theme and re-renders.

- [ ] **Step 1: Insert the dark-mode switch row above the existing switch-user row**

In `renderProfile()`, inside the `<div class="profile-settings">` block, add before the switch-user row (line 1462):

```js
const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
h += `<div class="profile-setting-row"><span style="font-weight:600;">🌙 Dark Mode</span><button class="theme-switch${isDark ? ' on' : ''}" role="switch" aria-checked="${isDark}" onclick="App.toggleTheme()"></button></div>`;
```

- [ ] **Step 2: Run the full suite**

Run: `node --test`
Expected: all tests PASS, including the three new ones.

- [ ] **Step 3: Commit**

```bash
git add render/render.js
git commit -m "feat: dark mode toggle in profile settings"
```

---

### Task 5 — Make charts grid/label colors theme-aware

**Files:**
- Modify: `analytics/charts.js`

**Interfaces:**
- Consumes: the CSS vars `--text2`, `--gly` (`--text`), `--border` that are re-mapped by themes.
- Produces: a `cssVar(name)` helper and replacement of hardcoded grid/text/title colors so charts read correctly on both light and dark.

- [ ] **Step 1: Add a CSS-var helper and use it for grid + label colors**

In `charts.js`, add near the top:

```js
function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}
```

- [ ] **Step 2: Replace the hard-coded grid/text colors in `baseOptions`**

In `baseOptions` (lines 31-32), replace `COLORS.grid` and `COLORS.text` with CSS-var reads:

```js
scales: {
  x: { ticks: { color: cssVar('--text2'), font: { size: 10 } }, grid: { color: cssVar('--border') } },
  y: { ticks: { color: cssVar('--text2'), font: { size: 10 } }, grid: { color: cssVar('--border') } }
}
```

Keep `COLORS.text`/`COLORS.grid` for the `COLORS` export and the heatmap legend (it can stay light/dark via a cssVar as well — simplest: keep `COLORS.text` but change it to `cssVar('--text2')`).

Change the `COLORS` object (lines 4-14) to:

```js
const COLORS = {
  primary: '#16a34a',
  secondary: '#fb7185',
  light: '#fda4af',
  accent: '#f43f5e',
  red: '#dc2626',
  bg: 'rgba(251,113,133,0.15)',
  grid: cssVar('--border'),
  text: cssVar('--text2'),
  white: '#334155'
};
```

- [ ] **Step 3: Run the full suite**

Run: `node --test`
Expected: all PASS.

- [ ] **Step 4: Commit**

```bash
git add analytics/charts.js
git commit -m "style: theme-aware chart grid and label colors"
```

---

### Task 6 — Final verification and manual smoke check

**Files:**
- Modify: none required; run the suite and review.

**Interfaces:**
- Consumes: all prior tasks.
- Produces: a fully dark-themable app.

- [ ] **Step 1: Run the complete test suite**

Run: `node --test`
Expected: ALL green.

- [ ] **Step 2: Manual smoke check**

Open `index.html` (serve via a local static server if needed for the SW). Confirm:
- Default loads in light theme.
- Profile > Settings shows the Dark Mode switch; toggling flips the app to deep -dark with dark frosted glass and light text immediately.
- Reload keeps dark mode (persisted).
- Toggling back to light works; reload keeps light.
- Charts/analytics labels are readable on dark (grid + axis colors adapt).
- Intro overlay and SW update banner still render correctly on both themes.
- No gold/emerald clash, contrast OK.

(Notify the user to do the final browser smoke-test and confirm before marking complete.)

- [ ] **Step 3: Commit any fixes found**

```bash
git add -A
git commit -m "style: finish dark mode toggle verification fixes"
```