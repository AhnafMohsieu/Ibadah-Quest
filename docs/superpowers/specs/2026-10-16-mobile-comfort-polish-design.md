# Mobile Comfort Polish (SP1) — FAB clearance, equal prayer cards, nav chrome, info-button hit area

**Date:** 2026-10-16
**Status:** Pending user review (all findings verified in-browser before this doc; baseline audit archived)
**Scope:** 4 audit-driven fix groups (F1 FAB↔tier-chip collision + FAB a11y, F2 equal prayer cards, F3 nav chrome trim, F4 info-button 44px hit area + a11y) + cache/manifest discipline + regression pins. CSS-first; small, additive markup edits only. No behavior redesigns — deferred ones are listed in §8.

---

## 1. Problem (verified: scripted sweep, 390×844, touch emulation, `pointer:coarse`)

Baseline audit (2026-10-16, `iq-audit-baseline.json`): Playwright (Python) at 390×844, iPhone-class context; per tab drives the **real click-flow** (tier-1 category → cat chip/shelf card → tab button), then measures at `scrollTop 0`.

### F1 — FAB sits on top of navigation chips (HIGH)

- `#fabMain` rect: 48×48 @ (322, 692)–(370, 740). Bottom nav top edge: 767.
- The `.tier-nav-container` (535–805) holds date line + tier-2 + tier-3 chip rows. Tier-3 row 1 sits at **696–748** — i.e. **directly under the FAB**.
- Measured on Today: FAB-overlaps **"Prayer Times" chip: 75% of the FAB's area**, chip loses 22% of its area; `elementFromPoint` at the overlap center returns the FAB (`topIsFab: true`).
- Full sweep (79/79 tabs, real click-flow, zero errors): **55 of 79 tabs collide — 54 nav chips + 1 calendar control** (chips vary by category: `Evening` 75%/22%, `Extra Deeds` 75%/27%, `Finance` 75%/35%, tier-2 `cat-chip "Hereafter"` 57%/15%, names’ chip row `Scholars` 8%/2%). All at rest (`scrollTop 0`).
- Progress tab (profile_main): the calendar header’s next-month `▶` — 44×44 at (330, 697), `.cal-nav` inside `.cal-header` — is **87% buried under the FAB**. Flat categories render a shorter nav container (no tier-3 row), so panel content reaches the FAB band at rest.
- The 24 clean tabs: `profile_main`’s other 5 flat tabs + library’s 19 shelf-grid tabs (their rows end above the FAB zone).
- `#fabMain` has **no accessible name**; the speed-dial state is not exposed.

### F2 — Prayer cards uneven

- `#prayerArea .card-grid > .card-item` uses `flex:1 1 28%` in the phone blocks: rows of 3 grow to 116px, rows of 2 stretch to **176px** (Fajr/Dhuhr/Asr 116, Maghrib/Isha 176). Same cards, different widths.

### F3 — Nav chrome before content

- Pre-content stack on Today: pull-hint 40 + bonus banner 53 + tier-nav card 271 (date 28 + tier-2 104 + tier-3 108 + paddings) + margins → **content starts at y≈817** on an 844-tall screen.

### F4 — Info buttons: 24×24 tap targets where a miss toggles a prayer

- `.card-grid .card-item .card-info-btn`: 24×24, `position:absolute; bottom:4px; right:4px; padding:0` (5 templates, ~145 instances on Today alone).
- Hit-probe (44×44 achievable box per card, 25 points): **21/25 points missed** on each of the 5 prayer cards; misses land on `.card-item`, `.card-xp`, `.card-sub` — i.e. **mis-taps toggle the prayer** instead of opening details (`stopPropagation` is present and correct on the button itself).
- The button is a bare `<div>` with `onclick`: no role, no keyboard reach, no label.

### Pre-existing, recorded, NOT fixed here

- `.global-search` input is 37px tall (no `type` attribute → misses the phone `input[type="text"]…{min-height:44px}` rule). Unchanged across the sweep; fixing it would grow persistent header chrome — parked (§8).
- F1’s fix is row-count- and category-agnostic: today’s 24 clean tabs stay clean by construction; new layouts stay clear (§3).

---

## 2. Goal & success criteria

1. **Zero FAB overlaps** across all 79 tabs at `scrollTop 0` — nav chips (tier-2/tier-3, any row count, chips or shelf grids) **and** the Progress calendar’s month-nav control all stay clear.
2. `#fabMain` has `aria-label="Quick actions"` and mirrors `aria-expanded` with the speed-dial state.
3. All 5 prayer cards render at **equal width** (currently 116/116/116/176/176).
4. Info buttons reach a **44×44 hit area** (probe: 0/25 misses per card) while the visible dot stays 24×24; buttons carry `role="button"`, `tabindex="0"`, `aria-label="Details: …"`; Enter/Space activates them (existing global keydown handler extended).
5. Chrome trim: content starts ≥8px earlier; tier-3 bottom rises ≥8px (measured, informational).
6. `node --test` green (79-tab sweep verification + baseline 547 + new pins); `node core/check-syntax.js` clean; `node --check` on every touched classic file.
7. Cache discipline honored: `styles/main.css?v=42→43`, `sw.js?v=55→56`, `MANIFEST_REV 8→9`, and `?v` bumps for each touched feature/core script.

---

## 3. Design (exact changes)

### F1 — Right gutter for tier nav rows + FAB a11y

**Why a gutter (not vertical compaction):** lifting the tier-3 row 1 above the FAB needs ≥60px of vertical savings; the available trims total ~10px, and further savings would have to shrink chips below the 44px phone touch floor (a deliberate 2026-09 decision) — or restructure both nav tiers. A horizontal gutter is **row-count-agnostic**: chips can never reach under the FAB even when a category renders three rows or shelf grids.

- `styles/main.css` — append `padding-right:64px;` to the tier wrap rule in **both** phone blocks (identical string in each):
  - line 2727 (`@media (pointer:coarse)`) and line 2763 (`@media (max-width: 600px)`):
    `#tier2Tabs,#tier3Tabs{flex-wrap:wrap;overflow-x:visible;padding-right:64px;}`
  - Geometry: chips wrap inside 341−64 = 277px → every row ends ≤ x≈302; FAB left edge is 322 → **≥20px clearance** at every row height. Library’s `.surah-grid` shelf stays 2 columns within 277px (`minmax(130px,1fr)`); the core/adhkar 45% pair still fits (2×125+8 = 258).
  - Same two blocks, for the Progress calendar header: `.cal-header .cal-nav:last-child{padding-right:64px}` (the header row’s controls end ≤ x≈310, ≥12px clear; scoped to phones only).
  - The existing pin (`tests/html.test.js:471`) matches the rule as a **prefix** and stays valid; new pins assert both gutters (each block).
- `index.html:581`: add `aria-label="Quick actions"` and `aria-expanded="false"` to `#fabMain`.
- `features/fab.js` `toggle()`: after the null check, `main.setAttribute('aria-expanded', _open ? 'true' : 'false');` (initial state comes from markup).

### F2 — Equal prayer cards

- Both phone blocks (lines 2729, 2766): `#prayerArea .card-grid > .card-item{flex:1 1 28%;}` → `{flex:0 0 calc((100% - 16px)/3);}`.
- `justify-content:center` (already present) centers the 2-card row at the same width. The 16px subtraction covers two nominal 8px gaps; the actual computed gap is 6px, so ≤4px slack is absorbed by centering — no overflow at 320–390px widths, and no other viewport is touched (rule is inside the phone blocks only).

### F3 — Nav chrome trim (modest, CSS-only now)

- `styles/main.css:2717`: `#dateLine{…padding:6px 0 2px;}` → `padding:2px 0 0;`.
- `styles/main.css:306`: `.tier-nav-container{…padding:8px 8px 0; margin-bottom:12px;}` → `padding:6px 6px 0; margin-bottom:8px;`.
- Expected: tier-3 bottom 804 → ~794; content start 817 → ~807. Deeper compaction (auto-collapse/sticky) deferred to SP2 (feel).

### F4 — Info buttons: 44px hit area + a11y (5 templates, 2 CSS rules, 1 selector)

- `styles/main.css` after line 607:
  - `.card-grid .card-item .card-info-btn::after { content:''; position:absolute; top:-17px; right:-3px; bottom:-3px; left:-17px; }`
    → 44×44 hit box extending left/up into the card, stopping 1px inside the card’s right/bottom edges (card has `position:relative`, no clipping; verified).
  - `.card-grid .card-item .card-info-btn:focus-visible { outline:2px solid var(--accent); outline-offset:1px; border-radius:6px; }`
- Markup — add `role="button" tabindex="0" aria-label="Details: <name>"` to the 5 emitters:
  - `core/static.js:639`, `core/static.js:686` (vol/deed cards; item name in scope)
  - `core/render-prayers.js:12` (`nm`), `:41` (`v.name`), and the third prayer-area emitter (checked at implementation).
- `core/actions.js:687`: extend the global Enter/Space handler selector `.card-item, .vol-card, .shop-card` → `…, .card-info-btn` (same `.click()` dispatch — matches the app’s existing keyboard pattern).
- Keep them as `<div>`s: converting to `<button>` would hit the phone `min-height:44px` button floor and inflate the visible dot; the role+tabindex+shared-handler route keeps the 24px visual with a full 44px target (and matches how `.card-item` is already built).

### Cache discipline

- `styles/main.css?v=42→43` (`index.html:27` + `tests/html.test.js:98,159`).
- `sw.js?v=55→56` (`index.html:549` + `tests/html.test.js:75`); `MANIFEST_REV 8→9` (`sw.js:7`).
- `?v` bump ×1 for each touched script ref in `index.html`: `core/render-prayers.js?v=4→5` (line 423), `core/static.js?v=7→8` (line 424), `features/fab.js?v=1→2` (line 494), `core/actions.js?v=23→24` (line 525). No test pins reference these four versions (checked); only `main.css`/`sw.js` versions are pinned.

### Regression tests (`tests/html.test.js`)

- Version pins: `main.css?v=43` (×2), `sw.js?v=56`.
- New test — gutter + cards + hit-area + FAB a11y:
  - both phone blocks contain `#tier2Tabs,#tier3Tabs{flex-wrap:wrap;overflow-x:visible;padding-right:64px;}` (split-count = 2 occurrences);
  - both blocks contain `.cal-header .cal-nav:last-child{padding-right:64px}` (split-count = 2);
  - phone block contains `#prayerArea .card-grid > .card-item{flex:0 0 calc((100% - 16px)/3);}`;
  - `css` contains `.card-grid .card-item .card-info-btn::after` and `top:-17px` … `left:-17px`;
  - `html` contains `aria-label="Quick actions"` and `aria-expanded="false"` on `#fabMain`;
  - `features/fab.js` source contains `setAttribute('aria-expanded'`.
- New test — info buttons labelled + keyboard path:
  - `renderPrayers`, `renderStatic` each include `aria-label="Details:` and `role="button"`;
  - `actions` source matches `.card-info-btn` inside the keydown selector line.

---

## 4. Constraints

- Do not touch `opencode.json`, `Images/`; no commits.
- CSS additive only; the four rule edits above + two new rules; no selector deletions.
- Keep the `window.*` API surface and existing DOM structure otherwise untouched.
- `styles/main.css` is shared with the MPA track: all changes are additive and phone-scoped; MPA pages inherit the same comfort fixes (intended).
- Legacy `?v=` discipline + `MANIFEST_REV`; `node --test` is the only test command; must end green.
- QA artifacts live in the temp folder, not the repo; dev server stopped at the end.

## 5. Risks

| Risk | Mitigation |
|---|---|
| Gutter narrows chip rows → a category wraps to an extra row | Worst case is cosmetic (+1 row, taller card); F1 clearance holds regardless of rows; verified visually per category in the after-audit |
| `calc((100% - 16px)/3)` vs actual 6px gap → 4px slack | Intended: centered rows absorb it; no overflow possible (sum < 100%) |
| `::after` hit box overlaps card content | Stays 1px inside card bounds toward the interior only (left/up); card has no clipping; probe test verifies 0 misses |
| Roving `tabindex` additions bloat tab order (145 on Today) | Accepted: each info button is a real action; matches card pattern; keyboard activation works via extended handler |
| Stale cache on user devices | main.css/sw.js `?v` + MANIFEST_REV bumped; pins updated |
| Audit harness itself drifted | Same script, same checks, `baseline` vs `after` JSONs diffed; all checker thresholds unchanged |

## 6. Manual QA owed after merge

- Re-run `iq-mobile-audit.py after` (same 390×844 harness): expect `fab_overlap_total: 0` across 79/79 tabs with zero `tab_errors`, `infoProbe` 0/25 misses ×5, equal card widths, no new small-target signatures, `overflow_tabs: {}`.
- Before/after screenshots of the FAB zone (`iq-audit-*-fabzone.png`) and home screen.
- Real-device spot-check of the speed-dial tap near “Prayer Times” and an info-dot tap (headless covers geometry, not finger physics).

---

## 7. Evidence summary (baseline vs expected after)

| Metric | Baseline (2026-10-16) | After (gate) |
|---|---|---|
| FAB overlap (tabs / total hits, ≥6% rule) | 55 hits on 55/79 tabs — 54 chips + Progress calendar `▶` (§1) | **0 / 0** |
| Info-button probe misses (5 cards × 25 pts) | 21/25 each | **0/25** |
| Prayer card widths | 116/116/116/176/176 | 5 equal (≈113) |
| Tier-3 bottom / content start | 804 / 817 | ≤794 / ≤807 |
| Overflow findings | 0 | 0 |
| Small targets (<40, excl. list) | `global-search` 37px (pre-existing ×79) | unchanged (no new) |
| `#fabMain` name / state | none | `Quick actions` + `aria-expanded` |

## 8. Out of scope (recorded follow-ups)

- **SP2 candidates:** FAB auto-close-on-scroll is dead code on the SPA (`features/fab.js` listens to `window.scroll`; the app scrolls `.app`) → rewire + feel pass; haptics (prayer/quest logging); swipe between the 5 main sections; FAB micro-interactions.
- **SP3 candidates:** A2HS (`beforeinstallprompt` + iOS Share-sheet hint); reminder cadence (no push server).
- **Backlog:** deep nav-chrome compaction (auto-collapse on scroll); `global-search` 37px input; FAB overlap window at 601–767px fine-pointer widths (audit scope is ≤600/coarse).

### Rejected alternatives (F1)

| Option | Why rejected |
|---|---|
| Vertical compaction to lift chips ≥60px | Available trims ≈10px; would force chips <44px (violates phone touch floor) or a nav redesign |
| FAB lower (bottom 104→88) | Still inside tier-3 row 1; collides with bnav at the other extreme |
| FAB to bottom-left | Mirrors the collision onto the left chip column |
| Dock FAB into bottom nav (Material) | Real redesign + muscle-memory change; at most an SP2 exploration |
| Shrink FAB 48→44 | Alone insufficient (row 1 still at 692+); no perceptible win |
| 4-up chip rows via font/padding cuts | Most sets still wrap to 2+ rows; hurts legibility for no clearance gain |
