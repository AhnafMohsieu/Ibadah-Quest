# Ibadah Quest — Modern Islamic App-Shell Redesign

**Date:** 2026-08-17
**Approach:** Mobile-first app-shell redesign (bottom nav + compact header + refined clay visual system)
**Status:** Design approved, ready for implementation planning

---

## Summary

Redesign the Ibadah Quest shell so it feels like a polished, modern Islamic mobile app rather than a desktop web page squeezed onto a phone. Fix the broken top navigation (`.t1-btn` renders 294px wide on mobile), collapse the 448px hero stack into a compact status strip so tabs appear above the fold, add a thumb-reachable bottom nav on mobile, and refine the claymorphism visual system — all while keeping the existing 306 tests passing and preserving the required HTML/CSS markers.

---

## Problem Analysis (verified via headless Chrome)

| Problem | Evidence |
|---------|----------|
| Top-nav buttons broken on mobile | Each `.t1-btn` (Daily/Knowledge/Names/Library/Profile) is **294px wide** on a 390px viewport. Root cause: base rule `.t1-btn { width: 100% }` (main.css:417) wins over the `@media (max-width:600px)` `flex: 0 0 auto` override because `flex-basis: auto` resolves to `width:100%`. |
| Tabs pushed below the fold | On a 390×844 phone: hero header (229px) + level row (118px) + streak bar (101px) push `.tier-nav-container` to **top:720px** (85% down). Users see a large decorative banner before any navigation. |
| Chrome consumes the screen | 448px of hero/level/streak before the tab area; today-panel content starts at ~888px — below the fold on first load. |
| Everything else works | 60+ panels render, tab switching works, hadith lazy-loads, 306/306 tests pass. This is purely a layout/visual problem. |

---

## Design

### 1. App Shell & Header (mobile-first)

**Slim sticky top bar (~48px)**
- Left: crescent brand mark + "Ibadah Quest" wordmark.
- Right: XP amount, streak flame, and the theme toggle.
- Keeps `backdrop-filter`, `.geometric-bg` pattern, sticky behavior.

**Compact hero → status strip (~90px)**
- Replace the three stacked sections (`.header`, `.level-row`, `.streak-bar`) with **one compact card** combining:
  - Level number + title (`lvNum`, `lvTitle`)
  - XP progress bar with animated wave (`xpBar`, `xpLabel`) + `moonFloat`/`xpWave` keyframes preserved
  - Streak days + best (`strDays`, `strMsg`, `bestStr`, `streakFire`)
- All existing ids (`headerCrescent`, `lvNum`, `lvTitle`, `xpBar`, `xpLabel`, `strDays`, `strMsg`, `bestStr`, `streakFire`) remain present in the markup so the hero renderers and tests keep working.

**Content area**
- `.tab-content` gets bottom padding to clear the mobile bottom nav (~80px).

### 2. Navigation

**Mobile bottom nav (≤768px, fixed)**
- 5 main categories (Daily, Knowledge, Names, Library, Profile) as large icon+label buttons.
- 44px+ touch targets, `aria-current`/`aria-selected` states, focus-visible rings.
- New container element rendered/updated by the existing `switchCategory`/`activateTab` logic — implemented as a second small nav element (bottom bar) with matching active-state updates. The existing `.t1-btn` top row remains in the DOM (hidden on mobile) so `switchCategory`/`.t1-btn[data-cat]` lookups and tests are unaffected.

**Desktop/tablet top nav (≥768px)**
- Existing `.tier1-tabs` row shown; fix the width bug so buttons size correctly (grid `repeat(5, 1fr)` on wide screens, `flex` with proper basis on mobile-hidden states).

**Sub-tabs**
- Keep horizontal pill scroll; add scroll-snap and hidden scrollbar polish.
- Categorized groups (Knowledge/Library) keep `cat-chips` + tier-3 pill rows.

### 3. Visual Language (Modern Islamic)

Keep the clay token system and all 6 palette blocks (`--bg: #ddd3ea`, `--gold: #f43f5e`, serene/royal/sand/midnight/cream/emara) — required by tests. Refinements:
- Consistent 4px spacing scale and radius tokens.
- Crisp `:focus-visible` rings on all interactive elements.
- `prefers-reduced-motion` guard for animations.
- Sora + Noto Naskh Arabic + Amiri fonts preserved; geometric pattern kept on the top bar.

### 4. Responsive

- Mobile-first media queries (currently desktop-leaning).
- Breakpoint ~768px: bottom nav hidden, top nav shown, centered 880px column.
- Today panel grids (prayers, deeds, voluntary) adapt to 2 columns on wider screens.

---

## Constraints

- **All 306 tests must keep passing.** Required markers preserved: hero ids, `@keyframes moonFloat`/`xpWave`, `.t1-btn.active`, `.streak-bar`, `.best-num`, `.xp-inner`, `.header-crescent`, palette blocks, `html[data-theme="emara"] .streak-bar`, `.prayer-times-grid`/`.pt-card`, `id="mainContent"`, service worker, theme-color `#ddd3ea`, no Tailwind, no `html[data-theme="dark"]`.
- Where the redesign intentionally conflicts with a test's *styling assertion*, update the test to match the new layout — never delete a test to hide a regression.
- Keep the `<script>` tag architecture; no bundler.
- `window.*` API surface unchanged.

---

## Testing

- Re-run `node --test tests/*.test.js` after each milestone (expect 306 pass, possibly with intentional test edits for new layout).
- Headless Chrome layout verification at 390×844 (mobile) and ≥768px (desktop): check fold ratio, t1 button widths, bottom-nav visibility, and that all tabs still activate panels.
- Verify no horizontal overflow and zero console errors.

---

## Execution Order

1. **Milestone A** — Fix t1 nav width bug + compact hero into status strip (fold fix).
2. **Milestone B** — Add mobile bottom nav + desktop top-nav show/hide.
3. **Milestone C** — Visual polish (spacing, focus rings, reduced motion, grid responsiveness).
4. **Milestone D** — Full verification: tests + headless Chrome at both viewports.

Each milestone is independently shippable and keeps the app usable.
