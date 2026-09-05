# Prayer Grid + Intro Subtitle Alignment — Design

## Goal
Fix two phone-visible alignment defects with two CSS rules, no behavior change:
(1) Daily Prayers grid rows uneven because emoji icons render at different
heights; (2) intro subtitle left-aligned while the Bismillah above it is
centered. Approach A (fixed icon box) approved.

## Findings (evidence)
- `.card-grid .card-item .card-icon` (main.css:467) is a centered flex row with
  `font-size:1.6rem; line-height:1` and NO fixed height. Prayer icons are emoji
  (fajr 🌅, dhuhr ☀️, asr 🌤️, maghrib 🌇, isha 🌙) with different intrinsic
  heights, so grid row 1 and row 2 size differently. Reproduced in user
  screenshot (row 1 taller than row 2).
- `.intro-subtitle` (main.css:~1680) sets font, color, spacing, uppercase but NO
  `text-align`; parent `.intro-content` centers items but text inside the block
  defaults left. Reproduced in user screenshot ("MERCIFUL" starts at left edge
  under centered first line). Bismillah has explicit `text-align:center`.

## Design

### Section 1 — Intro subtitle (approved)
- Add `text-align: center;` inside the existing `.intro-subtitle` rule.
- Nothing else changes (font, spacing, animation untouched).

### Section 2 — Even prayer rows (approved)
- `.card-grid .card-item .card-icon` gains fixed `height: 44px` (flex centering
  already present). Every card's icon slot becomes identical; rows line up at
  every viewport width. Icons, markup, and behavior untouched.
- Out of scope (explicitly rejected): timetable-list relayout, SVG icon redraw.

### Section 3 — Verification + ship (approved)
- Tests: two source-pattern assertions in `tests/html.test.js` (repo style) —
  subtitle block contains `text-align:center`; card-icon rule contains a fixed
  height. TDD: fail first, then green.
- Visual check: headless 390px renders of intro + Today panel before/after.
- Ship: `node --test` green (CSS-only, no `node --check` targets), bump
  `main.css?v=28→v29`, `sw.js?v=38→v39`, `CACHE_NAME` to `iq-cache-v39`,
  update pinned versions, commit + push.

## Non-goals
- No timetable relayout. No icon asset changes. No JS changes. No desktop redesign.
