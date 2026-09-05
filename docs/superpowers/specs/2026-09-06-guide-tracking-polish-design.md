# Guide + Self-Tracking Visual Polish — Design

## Goal
Unify the Guide tab (wudu, salah, sunnahs, extradeeds, volprayers) and the
Self-Tracking tab (fasting, healthlog, finance, memorization, gratitude,
charity, zakatcalc) to one visual language — shared cards, one title color
scale, one header rhythm, one stat rhythm. Behavior unchanged: no new
features, no logic changes, no data-pool edits. Approach A approved.

## Findings (evidence from source)
- Salah's 10 steps hardcode a numbered badge + inline flex styles per row; the
  Sahaba renderer already uses the same badge + `content-card` pattern.
- ExtraDeeds/VolPrayers detail rows use `vol-card` with title color
  `--accent` while pool-adjacent titles use `--accent-light`; info-button
  placement and source lines differ per renderer.
- wudu/sunnahs already render via standard `poolRender` cards — untouched.
- Finance repeats sub-headers with inline `margin-top:16px`; health/finance
  dashboards each built bespoke card systems (`health-card`, `fin-balance-card`)
  with matching but separately-defined borders, radii, padding, headers.
- Fasting/memorization/gratitude rows keep exact behavior; only row markup
  aligns to the shared quest-row/card pattern.

## Design

### Section 1 — Guide normalization (approved)
- Salah's 10 steps adopt the Sahaba numbered-badge + `content-card` structure
  (shared classes, single gold title color `--accent-light`).
- ExtraDeeds/VolPrayers detail rows: one card style, one title/desc/source
  color scale, one info-button placement; drill-down headers use plain
  `section-title` with no ad-hoc margins.
- Untouched: wudu/sunnahs pool lists, all drill-down navigation, all data pools.

### Section 2 — Self-Tracking normalization (approved)
- One header rhythm: every tracker opens with `section-title` + icon, no inline
  margin exceptions.
- One stat rhythm: health score, finance balance, charity/fasting counts render
  as number-over-label with shared stat classes (sizes, weights, muted labels).
- One card language: health/finance dashboards keep their layouts (score bar,
  weekly chart, grids) but share border, radius, padding, and header-row
  styling with `content-card`; fasting/memorization/gratitude rows align to the
  shared quest-row/card markup with zero behavior change.
- Untouched: all logging logic, XP grants, calculations, Zakat form fields.
- Note: the exact shared class for each stat row (e.g. reuse of `stat-num`-style
  classes vs new shared classes) is resolved in the implementation plan after
  reading each renderer's markup; the invariant is one size/weight/color per row.

### Section 3 — Verification + ship (approved)
- Tests: extend `tests/html.test.js` with source-pattern assertions in repo
  style (salah has no hardcoded badge inline styles; detail rows share one
  title color; trackers share stat classes). TDD: failing first, then green.
- Visual check: headless 390px renders of both categories before/after —
  same content and behavior, unified styling.
- Ship: `node --test` green, `node --check` on touched files, bump `?v=` on
  every touched asset, bump `CACHE_NAME`, update pinned versions, commit + push.

## Non-goals
- No new tracking, streaks, XP hooks, or entry management (a future
  interactivity pass; explicitly out of this polish-only scope).
- No data-pool content edits. No CSS architecture changes. No desktop redesign.
