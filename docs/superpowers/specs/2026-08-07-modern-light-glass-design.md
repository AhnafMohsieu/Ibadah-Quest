# Modern Light + Glassmorphism Theme for Ibadah Quest

Date: 2026-08-07

## Goal

Replace the current emerald/gold "ornamental" dark theme with a modern light
theme featuring glassmorphism (frosted-glass surfaces) and a coral/rose accent
palette. Preserve the current emerald/gold design as a static backup file so it
can be referenced or restored later.

## Constraints

- The app's HTML markup and JS must keep working with only a CSS theme swap plus
  a targeted sweep of hardcoded accent colors in JS.
- Existing CSS variable **names** (`--gold`, `--emerald`, `--green`, etc.) are
  kept and simply re-mapped to the new palette. This keeps all `var(--gold)`
  inline references functional with no JS logic changes.
- Branding (app name "Ibadah Quest", crescent, emoji) is unchanged — restyled only.

## Palette

Warm light base with pastel glow blobs behind content so glass has color to blur.

| Token | Old | New |
|---|---|---|
| `--bg` | `#0b1513` (dark) | `#faf7f5` warm off-white |
| `--card` / `--card2` | dark greens | translucent white `rgba(255,255,255,0.62)` glass |
| `--text` | `#F5F1E1` | `#1f2937` deep slate |
| `--text2` | `#9db8ab` | `#6b7280` muted gray |
| `--gold` (brand accent) | `#D4AF37` | rose `#f43f5e` |
| `--gold-light` | `#FCE694` | soft rose `#fb7185` |
| `--gold-dark` | `#A8872A` | deep rose `#e11d48` |
| `--emerald` | `#10b981` | coral `#f472b6` |
| `--green` (success) | `#10b981` | `#16a34a` |
| `--orange` | `#f59e0b` | `#d97706` |
| `--red` | `#ef4444` | `#dc2626` |
| `--border` | gold-tinted `rgba(212,175,55,0.16)` | `rgba(31,41,55,0.08)` |
| `--shadow` | heavy `0 12px 32px -12px rgba(0,0,0,0.55)` | soft `0 8px 32px rgba(180,90,120,0.12)` |

Success/completion states that were emerald now use `--green` (`#16a34a`).

## Typography

- Body: Sora (already loaded), sans-serif throughout.
- Remove ornamental serif display fonts (Cinzel, Cormorant Garamond, Playfair)
  for headings — headings use Sora, heavier weight.
- Keep Noto Naskh Arabic / Amiri for Arabic text (Quran, dhikr, names).
- `--font-heading` re-mapped to Sora.

## Glassmorphism

- Glass surfaces: `background: rgba(255,255,255,0.62); backdrop-filter:
  blur(16px) saturate(160%); border: 1px solid rgba(255,255,255,0.7);`
  Applied to: level badge, streak bar, tier nav container, card items,
  shared cards (vol/deed/content/quest/shop/prayer), search wrap + results,
  stat cards, toast/modal boxes, level-up popup, rewards cards, ach cards.
- Background: fixed pastel glow blobs (rose/orange/lilac) at low opacity behind
  the app content, replacing the gold radial gradient and star pattern. Glass
  cards blur these blobs for the frosted effect.
- Remove `--pattern-star`, fireflies, heavy gold glows, dark inset shadows.
- Keep radii (`--radius: 20px`, `--radius-sm: 14px`) or slightly reduce to
  `16px`/`12px` for a tighter modern feel.
- Preserve accessibility: dark text on glass; accent used sparingly.

## Components to restyle in CSS

XP bar, streak bar, level badge, tier1/tier2/tier3 tabs, card grid, prayer
cards, deed grid, content cards, prayer-times grid, quests, trophy cabinet,
shop/rewards, stats, calendar, forms/profile, daily bonus/tips, toast,
confetti (unchanged behavior), level-up popup, cat details, dhikr counter,
verify button, profile button, Quran browser, global search, intro overlay,
muhasabah, journeys, dhikr analytics, health, finance, mood, spiritual growth,
growth settings.

## JS hardcoded accent sweep

Update hardcoded gold/emerald values in JS to the rose/coral palette so
features match the theme:

- `analytics/charts.js` — chart title colors `#D4AF37`
- `core/actions.js` — name-card inline styles, `#D4AF37` trail color
- `features/spiritual-growth/armor.js`, `keys.js`, `lantern.js`, `mosque.js`,
  `mountain.js` — SVG accent colors `#D4AF37`, `rgba(212,175,55,…)`
- `data/pools/dhikr.js` — dhikr item color tags
- `render/render.js` — inline numBadge + calendar legend dot colors

Strategy: prefer re-mapping through `var(--gold)` when the inline style already
uses it; for literal hex/rgba, replace with the new palette values.

## Backup

Copy `styles/main.css` (current emerald/gold theme) to
`system/themes/emerald-gold/main.css` verbatim as the preserved backup. Do not
delete the original until the copy is verified. Restoring later = point the
`<link>` in `index.html` back at the backup file.

## Out of scope

- No runtime theme toggle (backup is file-based only).
- No new features, content, or behavior changes.
- No changes to `index.html` structure beyond the stylesheet link version bump
  and the intro overlay inline accent colors to match the new palette.
