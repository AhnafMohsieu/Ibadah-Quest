# Dark Mode Toggle for Ibadah Quest

Date: 2026-08-07

## Goal

Add a dark mode to Ibadah Quest, controlled by a manual toggle in the Profile
settings. Default is light (current theme); the user's choice is remembered.

## Constraints

- The app's HTML markup and most JS must keep working with only a CSS variable
  re-mapping for dark mode (same approach as the light-glass theme).
- Existing CSS variable **names** (`--bg`, `--card`, `--gold`, `--green`, etc.)
  are kept and simply re-mapped to dark values. All `var(--gold)` inline
  references stay functional with no logic changes.
- Glassmorphism is preserved — dark frosted glass instead of light frosted glass.
- Branding (app name, crescent, emoji) unchanged — restyled only.
- Preference is global (not per-user), so it applies across profiles and loads
  before the first render to avoid a flash of the wrong theme.
- Light remains the default; dark mode is opt-in via the toggle.

## Approach

Theme is driven by a block of CSS custom properties on `:root`. Dark mode adds a
second variable block scoped to `html[data-theme="dark"]`. Since all components
reference `var(--…)`, a single override block re-themes the whole app with no
markup changes.

Persistence uses a single localStorage key `iq9_theme` (`'light'` | `'dark'`),
kept separate from the per-user state `S` so it applies across profiles.

## Dark palette

Deep slate base with dark frosted glass so glass surfaces still read as "glass"
against the dark background.

| Token | Light | Dark |
|---|---|---|
| `--bg` | `#faf7f5` | `#0d1216` deep slate |
| `--bg-accent` | `#f3f0ee` | `#11181e` |
| `--card` | `rgba(255,255,255,0.62)` | `rgba(22,30,38,0.7)` dark frosted |
| `--card2` | `rgba(255,255,255,0.66)` | `rgba(26,35,44,0.72)` |
| `--text` | `#1f2937` | `#f1f5f9` |
| `--text2` | `#6b7280` | `#94a3b8` |
| `--gold` | `#f43f5e` | `#fb7185` soft rose |
| `--gold-light` | `#fb7185` | `#fda4af` |
| `--gold-dark` | `#e11d48` | `#f43f5e` |
| `--emerald` / `--teal` | `#f472b6` | `#f472b6` |
| `--green` | `#16a34a` | `#4ade80` |
| `--orange` | `#d97706` | `#fbbf24` |
| `--red` | `#dc2626` | `#f87171` |
| `--purple` | `#a855f7` | `#c084fc` |
| `--border` | `rgba(31,41,55,0.08)` | `rgba(255,255,255,0.1)` |
| `--shadow` | `0 8px 32px rgba(180,90,120,0.12)` | `0 8px 32px rgba(0,0,0,0.45)` |

Glows: body radial rose glow and the fixed pastel blob dials dim to low opacity
(e.g. `0.06`) so the dark glass surfaces have color to blur without glare.

## Toggle UI

Add a "🌙 Dark Mode" row with a modern switch inside the existing Profile
Settings block (`render/render.js` lines 1459-1464), placed between the switch
user row and the Logout button:

- A label and an iOS-style toggle switch.
- Switch state reflects the current theme.
- Clicking the switch calls `App.toggleTheme()`.

## JS color spots needing a dark variant

A small number of hardcoded rgba/hex backgrounds in JS won't auto-flip with the
CSS override. These must read the active theme and adapt:

- `analytics/charts.js` — chart canvas/bg colors (`#ffffff` → dark), axis and
  label colors (light text on dark), heatmap ramp.
- `core/actions.js` — name-card glass background `rgba(255,255,255,0.62)` and
  inline shadow (swap to dark glass values in dark mode).
- `index.html` intro overlay + SW update banner inline colors — support dark.
- Any other hardcoded `#fff`, `rgba(255,255,255,…)` in JS shells.

Prefer driving these off a small helper (e.g. read `html.dataset.theme`) or a
CSS variable where the inline style already uses one.

## Accessibility

- Preserve WCAG AA contrast for text on dark surfaces.
- Accent (rose) used sparingly; muted warnings (`--orange`, `--red`) upgraded to
  lighter pastels (`#fbbf24`, `#f87171`) for dark-bg legibility.
- The switch is a real `<button>`, keyboard-focusable, with a visible focus ring.

## Out of scope

- No auto-follow of the OS/browser `prefers-color-scheme`.
- No per-user theme storage; the preference is global.
- No new features, content, or behavior changes beyond the toggle.
- No changes to the light theme's existing default look.