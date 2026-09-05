# 2026-09-06 Adaptive Shell + Intro + Nav Unity Design

## Goal
One coherent pass: (1) touch-first adaptive shell via `pointer:coarse` (fixes phone
desktop-mode + keeps real desktops), (2) kill the duplicated top tabs on mobile in
favor of a Hijri/Gregorian date line, (3) repeat-proof intro + mobile polish,
(4) unified nav metrics + even grids + FAB clearance, (5) boot watchdog with
force-refresh recovery. Approach A approved; all 4 design sections approved.

## Evidence
- Desktop-mode reproduced at 980px: bnav hidden, desktop spacing, app squeezed.
- Intro persistence verified working in normal browsers (shows once → saves →
  stays hidden) → repeat-intro on user devices = storage wiped between opens
  (private mode / in-app browsers / cleared data); code can only harden, not cure.
- 6 user screenshots audited: orphan grid rows (4+2, 2+2+1, 3+1), FAB covering
  Quests/Achievements/#1 badge, tier1 duplicating bnav (~120px waste), Library
  tier2 mixed banner/grid rhythm, tier metrics differ per tier (padding, fonts,
  icons, radius).
- `window.gregorianToHijri` exists (seasonal-events.js) for the date line.

## Design

### Section 1: Adaptive shell + date line (approved)
- New `@media (pointer:coarse)` block, placed AFTER the 768px bnav-hide rule:
  `nav.bnav{display:flex}` (0,1,1 beats the 0,1,0 hide, no `!important`),
  `.app{padding-bottom:calc(96px + env(safe-area-inset-bottom,0px))}`,
  tier2/tier3 wrap mirrors, 44px target mirrors, compact spacing mirrors.
  Real desktops (fine pointer) match nothing → unchanged.
- Mobile (<768px): `.tier1-tabs{display:none}`; new `#dateLine` div inside
  `.tier-nav-container` rendering `{Gregorian} · {Hijri}` via existing
  `today()` + `window.gregorianToHijri` helpers, refreshed on boot + day change.
  Desktop keeps tier1.
- Tests: coarse block present with bnav rule AFTER the hide rule (source order);
  date line element exists; tier1 hidden below 768px.

### Section 2: Intro hardening + polish (approved)
- `startJourney()`: set `S.introSeen=true`, write plain mirror
  `localStorage.setItem('iq_intro_seen','1')`, and `saveState()` IMMEDIATELY on
  tap (before the 800ms fade), not after.
- `initApp()`: treat intro as seen if `S.introSeen` OR mirror flag present.
- CSS: `height:100dvh`, `.intro-content{max-width:22rem;padding:20px 24px}`,
  subtitle `letter-spacing:1.5px`, `padding-top:env(safe-area-inset-top,0px)`,
  `.intro-btn{min-height:48px}`.
- Tests: startJourney sets flags synchronously (source assertion); initApp checks
  mirror flag (source assertion); intro CSS rules present.

### Section 3: Nav unity + grids + FAB (approved)
- Unified metrics (all widths): `min-height:48px` everywhere; horizontal padding
  `12px 10px`; icon boxes `22px`; label scale t1 0.95rem / t2+t3 0.8rem /
  chips 0.78rem; radius `12px` rects / `20px` pills. Only shape + gold-active
  distinguish tiers.
- Even grids: `#tier2Tabs{justify-content:center}` (flex rows center their orphans;
  full rows fill via flex-grow so only partial rows move) in the 600px block and
  the coarse block; tier3 4-col grid orphan rules in base CSS —
  `.tier3-tabs > :last-child:nth-child(4n+1){grid-column:1 / -1}` (lone item spans
  full width), `.tier3-tabs > :nth-last-child(2):nth-child(4n+1){grid-column:2 / 3}`
  + `.tier3-tabs > :last-child:nth-child(4n+2){grid-column:3 / 4}` (leftover pair
  centers). Covers every group including Library's 5 chips (4 + full-width last).
- FAB: `bottom:calc(104px + env(safe-area-inset-bottom,0px))`; panels get
  `padding-bottom` guard so last rows clear it.
- Tests: metric strings present; orphan-centering selectors present; FAB offset
  value asserted.

### Section 4: Recovery + verify + ship (approved)
- Boot watchdog: inline script records `window.__iqBootT0=Date.now()`; `initApp`
  sets `window.__iqBooted=true` at end; a 8s timer (in actions.js) shows
  `recoveryOverlay` with Reload (`location.reload()`) + Fresh start
  (unregister SW, delete caches, reload) if not booted. Disarms silently on success.
- Verify: Playwright 390/414/768 + coarse-rule CSSOM check; `node --test`;
  `node --check` on touched JS.
- Ship: `main.css?v=25`, `sw.js?v=35`, `iq-cache-v35` + pins; commit + push.

## Non-goals
- No separate desktop multi-column layout. No JS renderer rewrites. No change to
  storage providers. GitHub CI failure: separate deferred issue.
