# 2026-09-04 Mobile-First App Shell Design

## Goal
Redesign Ibadah Quest as a true mobile-first app inspired by Dribbble Popular/Mobile trends
and Pablooo benchmarks (Strava progress rings, GenK streak flame + weekly tracker,
Count Tracker color-coded tap cards, CapWords daily progress + greeting, Comet/Deezer
bottom-nav feedback).

## Decision
Approach A — True mobile-first shell (approved). Pure CSS + small HTML wiring.
No state schema change. No new tab wiring.

## Section 1: App Shell & Layout (approved)
- `.app` max-width 720px -> 480px, centered on desktop with soft backdrop (`--bg-accent`).
- Sticky slim `top-bar` 56px: level badge left, XP + streak dots right.
- Hero title moves inside Today panel only, not global.
- Bottom nav (`#bnav`, 5 existing destinations) becomes primary: 56-64px tall,
  48px touch target, icon 22px + label 11px, active pill (`accent-bg` + gold dot),
  `padding-bottom: env(safe-area-inset-bottom)`, sticky bottom.
- Desktop `tier1-tabs` hidden on mobile (mobile-first flip).
- `.tab-panel` min-height 60vh, 16px side padding, no horizontal overflow.

## Section 2: Navigation & Touch Targets (approved)
- Keep 5 bottom tabs: Daily / Knowledge / Names / Library / Profile.
- `tier2Tabs` + `tier3Wrap` become single horizontal snap-scroll chip row
  (`overflow-x:auto`, `scrollbar-width:none`), 44px chips. Fixes 12-tab wrap mess.
- Prayer cards = bento cards, color-coded left border, 48px tap area with check animation.
- Streak bar = flame + 7-day dots (GenK pattern).
- All buttons `min-height:48px`, `font-size:16px` (prevents iOS zoom), 12px gaps.

## Section 3: Home Polish + Dashboard (approved)
- Today panel: greeting + circular daily progress ring + 5 prayer bento cards stacked.
- Dashboard: weekly bars 2x taller on mobile, insights `grid 2-col`,
  trend chart full-width with scroll fallback. Numbers 20px+, labels 12px gray.
- Keep Sora + Noto Naskh, gold `#c9a84c`, radius 16px, `shadow-sm` only.

## Contracts
- No `freshState()` change. Same `TAB_GROUPS`, `switchCategory`/`activateTab`.
- If any asset with `?v=` touched: bump `?v=`, bump `CACHE_NAME` in `sw.js`,
  update pinned version in `tests/html.test.js`.
- Script load order in `index.html` unchanged (`defer` preserved).

## Verification
- `node --test` (all pass), `node --check` on touched JS.
- 390x844 headless check: no horizontal overflow, `#bnav` visible,
  sub-nav scrolls horizontally, touch targets >=48px.

## Phasing
- Phase 1 (this spec): shell + nav + prayer cards + home/dashboard polish.
- Future: per-tab bento polish, charts deep-dive (separate specs).
