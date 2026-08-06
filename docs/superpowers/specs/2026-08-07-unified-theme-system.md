# Unified Theme System — 5 Light Families + Full App Shell Redesign

Date: 2026-08-07

## Goal

Remove the 5 dark-theme variants from the existing 10-theme picker, keep 5 light
families, make every hardcoded rose accent in the codebase follow the active theme,
redesign the app shell with a bottom nav bar, gamified hero dashboard, and Islamic
aesthetic, then add animations and micro-interactions for a polished feel.

## Part 1: 5 Light-Themes Only

### Keep These

| key | family | palette base |
|-----|--------|-------------|
| `light` | rose | `#faf7f5` (default) |
| `serene` | serene | `#f3f7f2` |
| `royal` | royal | `#f7f4ff` |
| `sand` | sand | `#fbf6ec` |
| `midnight` | midnight | `#f4f7fb` |

### Remove These

| key | family |
|-----|--------|
| `dark` | rose dark |
| `serene-dark` | serene dark |
| `royal-dark` | royal dark |
| `sand-dark` | sand dark |
| `midnight-dark` | midnight dark |

### Theme Data Update

`data/theme-meta.js` retains only 5 entries (no `surface` field; unused):

```js
window.Themes = [
  { key:'light', label:'Light', swatch:{ bg:'#faf7f5', accent:'#f43f5e' } },
  { key:'serene', label:'Serene', swatch:{ bg:'#f3f7f2', accent:'#4c7a4a' } },
  { key:'royal', label:'Royal', swatch:{ bg:'#f7f4ff', accent:'#7c5cf0' } },
  { key:'sand', label:'Sand', swatch:{ bg:'#fbf6ec', accent:'#c98a2e' } },
  { key:'midnight', label:'Midnight', swatch:{ bg:'#f4f7fb', accent:'#3fa7c8' } }
];
```

### CSS: Remove Dark Blocks

In `styles/main.css`, delete:

1. The `dark` block (lines ~32-59): `html[data-theme="dark"] { ... }`,
   its body override, and its `.app::before/::after` opacity tweak.
2. `serene-dark`, `royal-dark`, `sand-dark`, `midnight-dark` blocks (lines ~69-117).

All light family blocks (`serene`, `royal`, `sand`, `midnight`) remain.

### Theme Mechanism (kept as-is)

- `data-theme` attr on `<html>` selects override blocks.
- `localStorage` key `iqTheme` stores the chosen theme name.
- `core/actions.js`: `setTheme(name)` updates attr + storage + calls `renderAll()`.
- Inline `<head>` no-flash script reads storage and sets `data-theme` before first paint.
- `index.html` `<script src="data/theme-meta.js">` loads before render.

---

## Part 2: Every Hardcoded Accent Follows the Active Theme

Replace all occurrences of `#f43f5e`, `#fb7185`, `#f472b6`, `#e11d48` in JS/HTML/SVG
with `var(--gold)`, `var(--gold-light)`, `var(--gold-dark)`, `var(--emerald)`, or
`var(--emerald-deep)` as appropriate. The affected files:

### styles/main.css

- Line ~201: header gradient → `var(--gold-light)` / `var(--gold)`
- Line ~396: `.ach-card.tier-legendary.unlocked` border + glow → `var(--gold)` / `var(--gold-light)`

### index.html

- Intro Bismillah (line ~30): hardcoded color + text-shadow → read via inline JS that
  interrogates `getComputedStyle(document.documentElement).getPropertyValue('--gold')`
- Intro Begin Journey button (line ~32): gradient + shadow → same JS
- Service Worker update banner (lines ~406-407): border, button bg → CSS vars in
  inline style attribute or a small injected `<style>` block that uses `var(--gold)`.

Approach for intro elements: write a small inline script after theme-meta.js that
reads the current theme accent, computes a gradient, and injects the intro overlay's
inline CSS. Alternatively, add an inline `<style>` that overrides the intro with
`var(--gold)` references; but inline `style` attributes can't use CSS vars directly.
Instead, assign a CSS class and define the rule in main.css or a `<style>` block.

Better: define intro accent classes in main.css,
e.g. `.intro-btn { background: linear-gradient(135deg, var(--gold), var(--emerald)); }`,
and have the pre-paint script swap the button class. Same for Bismillah glow.

### Spiritual Growth SVGs

All these files render inline SVG via `.innerHTML` strings. Replace hex literals
with `var(--gold)` etc.:

- `features/spiritual-growth/mosque.js`: fills + strokes
- `features/spiritual-growth/mountain.js`: path stroke, circle fills, line strokes
- `features/spiritual-growth/armor.js`: rect/ellipse fills
- `features/spiritual-growth/boat.js`: circle fill
- `features/spiritual-growth/lantern.js`: gold/warm constants
- `features/spiritual-growth/keys.js`: gold/lightGold constants
- `features/garden.js`: flower SVG fills

These render after DOM is ready, so `var(--gold)` string substitution in the SVG
attribute works when the browser paints the inline SVG.

### Dhikr Color Tags

`data/pools/dhikr.js` line 17: `color:"#f43f5e"` → `"var(--gold)"`. The render
code applies this as a CSS `color` property which resolves custom properties.

### Core Actions

`core/actions.js` line ~213: `color: '#f43f5e'` → `color: 'var(--gold)'`

### Charts (already done from prior fix)

`analytics/charts.js` already reads `var(--gold)` family via `getComputedStyle`.

### Service Worker Banner

`index.html` lines 406-407: replace `background:#faf7f5`, `border:1px solid #fb7185`,
`#f43f5e` button background with CSS vars or classes that reference theme variables.

---

## Part 3: Bottom Nav + Hero Dashboard Shell

### Structure

The current `<div class="app">` wraps single-column scrollable content. It is
replaced with a new shell:

```
<div class="app">
  <!-- Slim top status bar -->
  <header class="top-bar">
    <div class="tb-level">Lv 7 · Mu'min</div>
    <div class="tb-stats">
      <span class="tb-xp">⚡ 2,450 XP</span>
      <span class="tb-streak">🔥 12</span>
    </div>
  </header>

  <!-- Tab content container -->
  <main class="tab-content" id="tabContent">
    <!-- each tab renders here -->
  </main>

  <!-- Bottom nav bar -->
  <nav class="bottom-nav">
    <button class="nav-tab active" data-tab="home">🕌</button>
    <button class="nav-tab" data-tab="quests">⚔️</button>
    <button class="nav-tab" data-tab="stats">📊</button>
    <button class="nav-tab" data-tab="growth">🌱</button>
    <button class="nav-tab" data-tab="profile">⚙️</button>
  </nav>
</div>
```

### Tab Views

| Tab | Content rendered |
|-----|-----------------|
| Home | Prayers checklist (renderPrayers), bonus/tip, deeds — plus a hero block with level ring + streak + date + pattern |
| Quests | Daily/weekly/monthly quests + achievements (renderQ, renderAch) |
| Stats | Analytics dashboard (renderInsights) |
| Growth | Spiritual growth SVGs (renderGarden, renderMountain etc.) |
| Profile | Settings + theme picker + logout (renderProfile) |

The `renderAll()` dispatcher no longer renders every section into a single scroll
view. Instead it delegates to `renderTab(activeTab)` which renders only the active
tab's content.

### Hero Section (home tab only)

- Large circular level ring (like a progress donut) with the level number in center
- Level title text below
- Next to it: streak flame with counter
- Hijri + Gregorian date line
- A faint themed geometric SVG pattern fills `top-bar` background area: CSS
  `background-image` with an inline `<use>` SVG or hardcoded base64 pattern that
  references the theme accent via SVG's internal fill.

### Islamic Geometric Pattern

Each family gets a pattern variant implemented as a CSS background property in the
`data-theme` block:

- Rose: floral/circular petal motif (faint rose-pink)
- Serene: leaf/hexagonal lattice (mint-tinted)
- Royal: diamond/star interlace (purple-gray)
- Sand: geometric tile net (golden-beige)
- Midnight: stellar/celestial dots (soft-blue)

The pattern is placed inside a repeated `data:` URI SVG with `var(--gold)`-based
fill, applied as `html[data-theme="…"] .geometric-bg`.

---

## Part 4: Animations & Micro-Interactions

### Theme Crossfade

- All elements using CSS custom properties get a default `transition: background 300ms ease, color 300ms ease, border-color 300ms ease` inherited from body.
- This makes a visible fade when attributes change (host applies `setAttribute('data-theme', …)`).

### Hover/Press

- Cards: `transition: transform 200ms, box-shadow 200ms`, hover: `transform: scale(1.02)`, box-shadow elevated.
- Buttons (prayer checks, deed toggles): `transition: transform 100ms`, `:active{ transform: scale(0.97) }`.
- Nav tab `:active`: icon scale 1.1 bounce.

### Tab Switch

- Tab content container gets `opacity:0; transform: translateY(4px);` on mutation,
  with a `150ms` transition back to `opacity:1; translate: 0`. Implement as a class
  toggled by the tab controller before render call.

### Toast Animations

- Existing toast already animates in fine.
- Level-up toast: add a glow ring animation around the toast box.

### Typography & Spacing

- `:root`: `line-height: 1.6`.
- Section titles: `letter-spacing: 0.5px`, bottom border 2px with `var(--gold)` accent.
- Card padding: 16px uniform (up from ~14).

---

## Part 5: Shadows per Theme Family

Shadow variable already exists (`--shadow`) in each block. Update each light family
to have a color-relevant shadow:

- rose: `0 8px 32px rgba(180,90,120,0.12)` (unchanged)
- ser: `0 8px 32px rgba(40,80,50,0.1)`) (green-moss cast)
- royal: `0 8px 32px` rgba(90,70,180,0.1)`
- sand: `0 8px 32px rgba(160,110,40,0.1)`
- midnight: `0 8px 32px rgba(50,90,140,0.1)`

---

## Part 6: Tests

Update `tests/html.test.js`:

- Remove `dark theme: CSS maps the dark palette under the html[data-theme=dark] selector`
- Remove the dark no-flash test
- Update `theme: five families have both light and dark blocks` to check  5 light blocks only
- Keep `picker references metadata and setTheme wiring` but with updated theme chip assertion
- Keep modern-glass theme tests
- Add h test for bottom-nav structure + activation class toggling
- Keep 53 total tests or more

---

## Implementation Notes

- All changes go on a **new branch** created from current `theme-modern-light-glass`
- One commit per logical unit (removing dark blocks, background theme matching per file, shell rewrite, animations, test updates)
- **No build step** — vanilla JS + CSS + HTML, single HTML in- style
- All `var(--…)` CSS uses the existing variable mapping — each theme block re-maps the same names