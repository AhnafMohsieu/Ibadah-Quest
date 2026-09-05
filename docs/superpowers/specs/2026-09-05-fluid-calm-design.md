# 2026-09-05 Fluid Sizing + Calm Rendering Design

## Goal
Make every size in the app adapt to the display (320px small phones through tablets/
desktop): compact small-phone layout, fluid display type, zero overlap, zero flicker.
Approach A approved. Extends (does not replace) the 09-04 shell and 09-05 sweep work.

## Audit Baseline (evidence, Playwright 2026-09-05)
- 390/414/640/768/1280: zero horizontal scrollers (tier1 base-wrap fix verified).
- 320px: `t1-btn` + `bnav-btn` inner content spills. 360px: `t1-btn` spills.
- 287 `font-size` declarations in main.css, only 15 use `clamp()`.
- Flicker sources: `.tab-panel.active{animation:fadeIn .2s}` replays on EVERY tab
  activation; `body.loading{opacity:0}` boot flash; infinite `xpShimmer` (2s) and
  `skeleton-shimmer` (1.5s); ~15 `transition:all` rules on layout containers
  (animating width/flex = resize jumpiness). One-shots (`purchaseFlash`, progress
  width) are fine. `prefers-reduced-motion` query exists and will be extended.

## Design

### Section 1: Small-phone compact (@media max-width:360px, new block)
- `.tier1-tabs .t1-btn{flex-direction:column;gap:2px}` + icon 18px + label 0.72rem
  (5-across fits ~58px cells, no squeeze spill).
- `.bnav-btn .bnav-icon .iq-icon{width:18px;height:18px}` + `.bnav-label{font-size:0.62rem}`;
  keep 60px height (target preserved, visuals shrink).
- Hero tighten: `.header h1` floor drops via Section 3 clamp; `.streak-bar{padding:10px 12px}`;
  `.level-row{gap:8px}`.
- Readability floor: nothing below 0.62rem. No changes above 360px.

### Section 2: Flicker pass (base CSS edits)
- Tab switch: `.tab-panel.active{display:block}` with NO animation (remove fadeIn replay).
  Keep `@keyframes fadeIn` definition (harmless) or remove — removal is cleaner; tests
  must assert `.tab-panel.active` has no `animation:` property.
- Shimmers finite: `xpShimmer` → `animation:xpShimmer 2s ease-in-out 3`, skeleton →
  `skeleton-shimmer 1.5s ease-in-out 3`; extend `prefers-reduced-motion` block to force
  `animation:none` on both + `.tab-panel.active`.
- `transition:all` → `transition:background-color,color,border-color,transform,opacity`
  on layout containers (tier1/tier2/tier3 buttons, chips, cards, nav). Behavior on
  hover/active identical (those only animate color/border); layout jumps stop animating.
- Boot: `body` opacity transition 200ms → 120ms (keep `body.loading` gate).

### Section 3: Fluid display type (exact conversions; current size = clamp max)
- `index.html:161` inline timer `font-size:3rem` → `clamp(2rem,12vw,3rem)`.
- `main.css:877` `.stat-num` 2rem → `clamp(1.4rem,7vw,2rem)`.
- `main.css:892` `.prog-stats .stat-num` 1.5rem → `clamp(1.1rem,5vw,1.5rem)`.
- `main.css:1084` `.profile-stats .stat-num` 1.1rem → `clamp(0.95rem,4vw,1.1rem)`.
- Sweep rule `.stat-num,.tb-stat{font-size:20px}` → `clamp(1rem,5vw,1.25rem)`.
- `main.css:1755` `.insight-card-num` 1.6rem → `clamp(1.15rem,6vw,1.6rem)`.
- `main.css:251` `.best-num` 1.3rem → `clamp(1rem,5vw,1.3rem)`.
- `main.css:1944` `.journey-stat-num` 1.3rem → `clamp(1rem,5vw,1.3rem)`.
- `main.css:1972` `.dhikr-stat-num` 1.15rem → `clamp(0.95rem,4.5vw,1.15rem)`.
- Already fluid, untouched: `.header h1` (clamp), `.section-title` (clamp), `.t1-btn`/`.t2-btn` (clamp).
- Hero tightening for 360px comes from Section 1 padding/gap rules only.
- Body copy untouched (readability).

### Section 4: Verification + ship
- Regression tests in tests/html.test.js: (a) 360px block exists with column t1 rule;
  (b) `.tab-panel.active` block contains no `animation:`; (c) shimmer rules contain
  an iteration count (no `infinite` on xpShimmer/skeleton); (d) no `transition: all`
  / `transition:all` remains in main.css.
- Re-audit 320/360/390/414 (+640/768 spot): zero scrollers, zero spills.
- `node --test` green (493+ tests), `node --check` n/a (CSS-only).
- Cache bumps: `main.css?v=24`, `sw.js?v=34` registration, `CACHE_NAME iq-cache-v34`,
  pins in tests/html.test.js + tests/sw.test.js. Commit + push to main.

## Non-goals
- No JS/renderer changes. No desktop redesign. No full 287-declaration type scale
  (Approach C rejected). FAB behavior unchanged. Offline banners unchanged.
- GitHub CI failure: separate issue, still deferred by user.
