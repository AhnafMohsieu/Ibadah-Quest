# Profile Tab Redesign — Design Spec

**Date:** 2026-08-02
**Scope:** Visual overhaul + identity customization for the Profile tab and its sub-tabs

---

## Overview

Redesign the Profile tab (5 sub-tabs: Profile, Trophies, Progress, Analytics, Rewards) with a consistent gold theme, improved typography, hover effects, and new identity customization features. Analytics sub-tab is already overhauled and will not be touched.

**Approach:** Incremental visual polish with selective feature additions (avatar picker, identity customization).

---

## Sub-tab 1: Profile (`panel-profile`)

### Identity Card
- Larger card with gold border and subtle shadow
- **Avatar:** Clickable emoji picker — grid of 20-30 preset Islamic-themed emojis (🕋, 🕌, 📿, ⭐, 🕊️, 📖, etc.). Default: 👳. Stored in `S.avatar` (emoji string).
- **Display name:** Editable via input field or inline edit. Stored in `currentUser`.
- **Level title:** Gold badge styling with `lvTitle(S.lv)` output
- **Join date:** "Member since [Month Year]" — derived from first save date or stored in `S.joinDate`

### Personal Stats Row
- 4 compact cards below identity: Total XP · Prayers · Streak · Achievements count
- Gold-themed with icons, matching analytics card style

### Settings Section
- Switch user input + save button (existing, gold-themed)
- Logout button (existing, gold-themed)

### Danger Zone
- Unchanged (red theme preserved)

### Data Changes
- Add `S.avatar` (string, emoji) to state.js `freshState()`
- Add `S.joinDate` (string, ISO date) to state.js `freshState()`

---

## Sub-tab 2: Trophies (`panel-trophies`)

### Header
- "🏆 Trophy Cabinet" with progress counter "X/Y Unlocked"
- Gold underline separator

### Grid Layout
- 2-column on mobile, 3-column on desktop
- Each card:
  - Larger icon with glow effect for unlocked trophies
  - Gold border for unlocked, dimmed for locked
  - Tier badge (⭐, ⭐⭐, ⭐⭐⭐) in top-right corner
  - Hover: subtle lift (translateY(-2px)) + gold border pulse
- Empty state message when few trophies unlocked

### CSS Changes
- New `.ach-card` styles for gold borders, glow, hover effects
- New `.ach-tier` badge positioning
- New `.ach-progress` counter styling

---

## Sub-tab 3: Progress (`panel-progress`)

### Stat Cards
- Gold-themed with better typography
- Icon + value + label layout
- Subtle shadow and border treatment matching analytics cards

### Calendar
- Same dual-date system (Gregorian + Hijri)
- Gold today indicator (ring or highlight)
- Smoother color transitions for day cells
- Improved legend styling

### Layout
- Keep 2-column grid for stat cards
- Calendar section below with gold section title

### CSS Changes
- Update `.stat-card` styles for gold theme
- Improve calendar cell styles

---

## Sub-tab 4: Rewards (`panel-rewards`)

### XP Balance Banner
- Top banner: "💰 X XP Available" with gold styling
- Shows current `S.xp` value

### Card Grid
- 2-column layout
- Each card:
  - Gold border, hover lift effect
  - Icon + name + description
  - Price badge or "Owned ✓" badge
  - Disabled state (dimmed) for insufficient XP
- Purchase animation: brief gold flash on success

### CSS Changes
- New `.reward-card` styles for gold borders, hover, disabled state
- New `.reward-xp-banner` for balance display
- New `.reward-owned` badge styling

---

## Files to Modify

| File | Changes |
|------|---------|
| `render/render.js` | Update `renderProfile()`, `renderAch()`, `renderProg()`, `renderShop()` |
| `styles/main.css` | Add new CSS for avatar picker, trophy cards, reward cards, gold theme |
| `state/state.js` | Add `S.avatar` and `S.joinDate` to `freshState()` |
| `core/actions.js` | Add avatar picker handler, join date initialization |

---

## Implementation Order

1. **Profile sub-tab** — Identity card, avatar picker, stats row, settings polish
2. **Trophies sub-tab** — Gold grid, tier badges, hover effects, progress counter
3. **Progress sub-tab** — Stat card polish, calendar visual improvements
4. **Rewards sub-tab** — XP banner, card grid, hover effects, purchase animation

One commit per sub-tab. Each commit is a standalone visual improvement.
