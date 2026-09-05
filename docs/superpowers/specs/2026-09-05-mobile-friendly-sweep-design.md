# 2026-09-05 Mobile-Friendly Sweep Design

## Goal
Make all 154 tabs mobile-friendly per the 390x844 Playwright audit (2026-09-04): fix small
touch targets (~100 tabs via 8 shared components) and 3 horizontal-overflow spots.
Approach A approved: shared-component CSS pass, single phone media query, no JS changes.

## Audit Baseline (evidence)
Swept all 154 tabs at 390x844. Findings (tab:detail):
- Verify quiz buttons 68x27 (knowledge/library tabs, ~60 tabs)
- Fasting day toggle 20x20
- Stats range chips 7D/30D/90D/All ~46x26
- Growth "Visible" toggles 60x22
- Calendar nav buttons 36x36; cal-grid + #calArea horizontal scroll (Progress tab)
- Dhikr Reset/Next/Vibration ~64x30
- "Use my location" 107x29; "Begin 7-Day Journey" 154x32; "Weekly Reflection" 343x37
- Inputs (memorization/gratitude/charity/zakat/search/quran) 39px tall, font <16px (iOS zoom)
- theme-picker overflow-x:auto (Profile tab)
- finance-item-label clips (Finance tab)
- healthlog "sr-only" flagged = screen-reader helper, FALSE POSITIVE, excluded
- 52 tabs already clean. No page-level body bleed anywhere.

## Design

### Section 1: Touch targets (@media max-width:600px, appended in styles/main.css)
- Global interactive floor: `button,.t2-btn,.cat-chip,input,select,a[role="button"]{min-height:44px;min-width:44px}` (visible elements only; exceptions below)
- Exceptions: `.carousel-dot` (built-in 8px padding = effective 24px, accepted); `.t3-btn`/`.t2-btn` already 44px via earlier work.
- Verify quiz buttons: `min-height:44px;padding:10px 16px` (fixes ~60 tabs via one rule)
- Fasting day toggle: 40x40 cells, 4px gap (pragmatic: 44px cells overflow the 30+ day grid)
- Stats range chips: `min-height:40px` (compact row kept)
- Growth Visible toggles: `min-height:36px` plus padding (standard inline switch size)
- Dhikr Reset/Next/Vibration + Use-my-location + Begin-Journey + Weekly-Reflection buttons: covered by the global 44px floor
- Calendar prev/next buttons: `min-width:44px;min-height:44px`

### Section 2: Inputs + overflow spots (same media query)
- All text/number inputs: `font-size:16px` (kills iOS focus zoom)
- Calendar grid (Progress tab): `grid-template-columns:repeat(7,minmax(0,1fr))`, day cells `min-height:36px`, `font-size:0.72rem` — no sideways scroll at 390px
- Theme picker (Profile tab): `flex-wrap:wrap` (replaces overflow-x:auto)
- Finance item labels: `white-space:normal;overflow-wrap:break-word`

### Section 3: Verification + ship
- Regression test: extend 'phone nav rows wrap with zero horizontal scroll' in tests/html.test.js with new assertions (44px floor, theme wrap, input font-size 16px)
- Re-run the exact 154-tab audit script; acceptance = 0 findings (sr-only excluded via filter)
- Cache bumps: main.css?v=22, sw.js?v=32 registration, CACHE_NAME iq-cache-v32, pins in tests/html.test.js + tests/sw.test.js
- node --test all green (CSS-only change, no node --check targets)
- Commit + push to main

## Non-goals
- No component redesigns (Approach C rejected)
- No JS/renderer changes
- No desktop (>=768px) changes
- Does not address GitHub CI failure (separate issue, deferred by user)
