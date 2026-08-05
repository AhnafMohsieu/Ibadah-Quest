# Design — Emerald & Gold Islamic Redesign (Shell + Icons)

- **Date:** 2026-08-06
- **Project:** Ibadah Quest
- **Status:** Approved

## 1. Goal

Re-skin the app's core shell with a cohesive Emerald & Gold Islamic identity and
replace emoji icons with the free Font Awesome icon library. Content pages inherit
the new look through the shared CSS token layer without a risky 100+ file rewrite.

## 2. Technical Approach

The app is a vanilla-JS, no-build SPA. All HTML is rendered in JS template strings
(`render/render.js`, `core/actions.js`, `features/*.js`). Icons are currently emoji.

Because of this, the redesign is layered:

1. **Add two CDN dependencies** in `index.html`:
   - Tailwind CSS utility framework (Play CDN).
   - Font Awesome 6 free (`cdnjs`/`jsdelivr` `all.min.css`).
2. **Re-skin design tokens** in `styles/main.css` (via `:root` CSS variables) so
   every existing component class absorbs the new palette automatically.
3. **Add Tailwind surfaces + geometric Islamic pattern overlays** (SVG data-URI)
   on cards, hero areas, section dividers, and navigation.
4. **Convert shared/shell emoji icons to Font Awesome** `<i>` tags across nav,
   category chips, prayer/deed cards, and the spiritual growth feature glyphs.

## 3. Color System (design tokens)

| Token | Value | Use |
|-------|-------|-----|
| `--bg`            | `#0b1513` | Page background (ink emerald) |
| `--bg-accent`     | `#0f1f1b` | Panel / section background |
| `--card`          | `#11231e` | Card surface |
| `--card2`         | `#16312a` | Raised card / hover surface |
| `--emerald`       | `#10b981` | Primary accent |
| `--emerald-deep`  | `#059669` | Pressed / gradient end |
| `--gold`          | `#D4AF37` | Header, titles, highlights |
| `--gold-dark`     | `#a8872a` | Gradient end / borders |
| `--text`          | `#F5F1E1` | Ivory primary text |
| `--text2`         | `#9db8ab` | Muted text |
| `--border`        | `rgba(212,175,55,0.14)` | Gold-tinted hairline borders |

Keep existing semantic colors (`--green`, `--red`, `--orange`, `--purple`,
`--teal`) as accents for states (done/error/warning) but harmonize their use
inside the new surfaces.

## 3. Typography

- **Arabic:** remain `Amiri` / `Noto Naskh Arabic` (unchanged).
- **Display headings:** add `Cormorant Garamond` (elegant, manuscript feel) in
  front of the `--font-heading` / `--font-display` stacks.
- **Body:** keep `Sora` (unchanged) for readability and numeric tabular values.

## 4. Scope — Shell + Icons

Redesign these shared UI regions:

1. **Header** — crescent/star mark, title, subtitle, arabesque gold divider.
2. **Level & XP bar** — emerald card with gold XP gradient.
3. **Streak bar** — emerald/gold surface.
4. **Tier 1/2/3 navigation** — refined pills with emerald active state + gold glow.
5. **Section titles** — gold text with gold hairline `::after` rule.
6. **Cards** (card-grid, vol/deed/content/quest/shop, prayer cards, finance,
   dhikr, spiritual growth) — Emerald+gold surfaces with subtle geometric
   SVG data-URI pattern overlay and arch-leaning rounded corners.
7. **Buttons / inputs** — gold-outlined primary, emerald secondary, cohesive
   focus rings.
8. **Font Awesome icon swap** for the shell:
   - Nav / category / tab icons (replaces emoji in the app's tab bar).
   - Prayer, deed, and voluntary cards.
   - Spiritual growth cards swap decorative emoji for FA glyphs alongside their
     custom SVG stage art (the SVG stage art itself is retained).
   - Content *text pools* (duas, hadith, tafsir, etc. body) keep their existing
     emoji, which the emoji font already renders correctly.

## 5. Out of Scope (this pass)

- Per-tab bespoke custom layouts (content-pool tabs keep current layout, just
  re-skinned).
- Converting every emoji inside content pool bodies to Font Awesome.
- Service worker / PWA changes (only `index.html` cache-bust versions may bump).

## 6. Error Handling & Fallbacks

- Font Awesome is CDN-loaded; if unavailable, `<i>` tags show nothing. Mitigate
  by keeping textual/spiritual FA glyphs inside elements that also carry a label,
  and rely on existing emoji font for any not-reshparked strings.
- Tailwind Play CDN is for styling only; app behavior is unchanged if it fails
  (design degrades to the static `styles/main.css` tokens).

## 7. Testing

- Run existing `node tests/*.test.js` to confirm no JS regressions.
- Smoke test in browser on load: header, nav, cards, a knowledge pool page, a
  spiritual growth card (e.g., Daily tab) render with new styling and no console
  errors from the icon/token changes.
- Confirm emoji font fallback still prevents `?` rendering on any remaining
  emoji strings.

## 8. Files Touched

- `index.html` — add Tailwind + Font Awesome CDN; bump version params as needed.
- `styles/main.css` — re-skin `:root` tokens; add Tailwind utility usage and
  geometric pattern classes; adjust component surfaces.
- Shared render files (`render/render.js`, `core/actions.js`, `features/*.js`)
  — swap shell/spiritual icons from emoji to Font Awesome `<i>` where scoped.

## 9. Acceptance Criteria

- App visibly reads as "Islamic" (emerald + gold, geometric accents, elegant
  Arabic/display type) on load.
- All shared navigation and action icons use Font Awesome.
- No JavaScript regressions; existing tests pass.
- Web app remains a single-page, offline-capable, no-build app.