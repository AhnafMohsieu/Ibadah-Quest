# Multi-Theme Changer Design (10 Themes) for Ibadah Quest

Date: 2026-08-07

## Goal

Replace the single Dark Mode toggle with a theme picker offering **10 themes**
= 5 color families × {light, dark} version each. The user picks a theme in the
Profile settings via a swatch-card row; the choice is remembered. Default is
the current Light (rose) theme.

## The model

A "theme" is exactly one `data-theme` value on the `<html>` element that selects
one CSS custom-property block. All component markup and `var(--…)` references
keep working because every theme block re-maps the SAME variable names — the
architecture already proven by Light (`:root`) and Dark (the in-progress
`html[data-theme="dark"]` block).

A "family" is a pair of light/dark themes built from the same base accent color
at differing lightness. 5 families × 2 = 10 themes.

### Required data-theme keys (10)

| key | family | mode | identity |
|---|---|---|---|
| `light` | rose | light | Rose light (DEFAULT, current theme) |
| `dark` | rose | dark | Rose dark |
| `serene` | serene | light | sage green light |
| `serene-dark` | serene | dark | sage green dark |
| `royal` | royal | light | indigo/gold light |
| `royal-dark` | royal | dark | indigo dark |
| `sand` | sand | light | amber light |
| `sand-dark` | sand | dark | amber dark |
| `midnight` | midnight | light | navy light |
| `midnight-dark` | midnight | dark | navy dark |

`light` maps to the existing `:root` variable values (no override block needed).
`dark` maps to the existing `html[data-theme="dark"]` block. The other 8 need
new blocks.

## Palette per family (light → dark)

Each family maps the SAME variable names (`--bg`, `--card`, `--text`,
`--text2`, `--gold`, `--gold-light`, `--gold-dark`, `--emerald`, `--green`,
`--orange`, `--red`, `--purple`, `--border`, `--shadow`, `--glass`,
`--glass-blur`). Structural radii/fonts stay identical across all themes.

| family | `--bg` light | `--bg` dark | `--gold` light | `--gold` dark | mood |
|---|---|---|---|---|---|
| rose | `#faf7f5` | `#0d1216` | `#f43f5e` | `#fb7185` | current theme |
| serene | `#f3f7f2` | `#152018` | `#4c7a4a` | `#7fbf7e` | sage |
| royal | `#f7f4ff` | `#1c1830` | `#7c5cf0` | `#a78bfa` | indigo |
| sand | `#fbf6ec` | `#201a10` | `#c98a2e` | `#eec572` | amber |
| midnight | `#f4f7fb` | `#0b1b2e` | `#3fa7c8` | `#7dd3fc` | navy |

Glass card token: light family glass `rgba(255,255,255,0.62)`; dark family
glass `rgba(22,30,38,0.7)`. Success (`--green`), warning (`--orange`), danger
(`--red`) use lighter pastels in dark families for contrast, deeper shades in
light families.

## Architecture

- `styles/main.css` — the `:root` (light) block plus 9 override blocks
  (`html[data-theme="dark|serene|serene-dark|royal|royal-dark|sand|sand-dark
  |midnight|midnight-dark"]`), plus a `.theme-picker` card-row stylesheet.
  Each override block is a self-contained variable map — no per-component CSS
  per theme.
- `data/theme-meta.js` — a `window.THEME_META` array; each entry holds
  `key`, `family`, `mode`, `label`, and a 3-color swatch preview
  (`bg`, `surface`, `accent`) for the picker cards. Keeps the picker UI in
  sync with the CSS blocks.
- `index.html` — an inline pre-paint `<script>` reads localStorage `iqTheme`
  and sets `data-theme` (unless `light`/absent) before first paint; bump the
  stylesheet `?v=` cache version.
- `render/render.js` — in `renderProfile()`, replace the single Dark Mode
  switch with a `🎨 Theme` swatch-card row (10 cards). Active theme gets a
  check ring.
- `core/actions.js` — replace `toggleTheme` with `setTheme(name)`: set
  `data-theme`, save `localStorage['iqTheme']`, call `window.renderAll()`.
  Keep `applyTheme()` inline-load for persistence.

## UI (Profile settings)

- A `🎨 Theme` section (title + horizontal scrollable row of swatch cards),
  placed in the Settings block of the Profile.
- Each card: a rounded square showing `bg`, `card/surface`, `accent` stacked
  color swatches, plus the theme `label` beneath. Tapping calls
  `App.applyTheme(key)`.
- Active theme card has a colored selected ring/badge.
- Stores global (not per-user) localStorage key `iqTheme`. Replaces the
  single Dark Mode switch row.

## JS spots to adapt

- `analytics/charts.js` — chart series accent and title colored via a theme
  var (e.g. `--gold`), grids via `--text2`/`--border` — so charts follow the
  active theme. (Currently some are hard-coded `#f43f5e`; see Task.)
- `index.html` — update banner & intro overlay inline colors should follow a
  var where feasible (at minimum not break under any theme).
- No per-theme JS logic — only the CSS var remap + `setTheme`.

## Accessibility

- Every family keeps WCAG-AA contrast: dark text on light surface, light text
  on dark surface.
- Accent used sparingly (`--gold` for XP/numbers); muted warnings use
  readable pastels on dark themes.
- Theme cards are real `<button>`s, keyboard-focusable with focus ring.

## Out of scope

- No auto-follow of OS `prefers-color-scheme`; no per-user theme; no
  behavior/content changes.
- Not changing the existing Light theme's default look.
- No new features beyond the theme.

## Testing

- `tests/html.test.js` — assert `styles/main.css` contains all 9 `data-theme`
  asset blocks + the `.theme-picker`/`theme-card` class; assert
  `index.html` inline script reads `iqTheme` and sets `data-theme`; assert
  `render.js` renders a Theme section with `setTheme` and the swatch keys.