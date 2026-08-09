# Spiritual Growth Visuals, Icon Fixes & Alignment

Date: 2026-08-10
Status: Draft (pending user review)
Scope: Restore the spiritual growth feature set to a complete, wired, visually-grown state; fix the missing-icon wiring system-wide; and run a full app-wide alignment audit — while keeping the already-approved hero header restore on track.

## Context

The Spiritual Growth feature is half-built. Evidence gathered:

- Every SVG scene function returns `''` (empty): `lanternSVG`, `boatSVG`, `keysSVG`, `mosqueSVG`, `ramadanSVG`, `laylatSVG` in `features/spiritual-growth/*.js`, and `treeSVG` in `features/garden.js`. The `.spiritual-svg-wrap` / `.garden-tree` boxes render empty, so nothing visually "grows".
- `features/spiritual-growth/armor.js` and `features/spiritual-growth/heart.js` are **deleted from disk** (uncommitted), but `armor` is still in `FEATURE_STAGES` + `FEATURE_LABELS` (data.js) and `heart` is still in `FEATURE_LABELS` + `FEATURE_ICONS`. The Growth tab renders a broken "Spiritual Armor" card with no area/renderer, and "Heart Refinement" appears nowhere.
- Four renderers are **orphaned**: `renderKeys`, `renderMosque`, `renderRamadan`, `renderLaylat` are defined but never invoked. `renderGarden`, `renderLantern`, `renderBoat` are called in `renderDynamic()` (render/render.js:20) and `renderTab('growth')` (core/actions.js:2289-2293). Keys/Mosque areas exist in `#panel-profile` (index.html:170); Ramadan/Laylat areas exist in their own panels (index.html:279-280); those two panels have no activation tab today (pre-existing navigation gap — their area divs are always in the DOM so `renderDynamic()` populates them, but no UI opens the panels; UI wiring is out of scope). There are no `#armorArea`/`#heartArea` divs.
- `FEATURE_ICONS` (data.js:108) is all empty strings. `renderSpiritualGrowthTab()` (index.js:82-84) inserts `progress.icon` (a bare key like `sprout`) directly into `.growth-tab-icon` / `.growth-tab-stage-emoji` instead of `iqIcon()`. `renderGrowthSettings()` (index.js:47-56) does the same raw-key insertion into `.growth-setting-icon`. All 109 icon PNGs and map entries exist (tests/icons.test.js passes), so this is a wiring bug, not missing assets.
- Naming collision: `renderHeart` already means the knowledge-pool "Diseases of the Heart" renderer (render/render.js:805, 1436).
- Alignment: only the top-bar, tier1-tabs, card grid, and prayer-times grid were aligned in the earlier fix. Every other panel (quest/shop rows, tier2/3 tabs, charts, profile, modals, spiritual/growth cards) is unverified.

## Decisions

- **Visual approach:** hand-crafted SVG scene per feature that visibly changes across all 7 stages, driven by `progress.stage` (1-7) plus `progress.progress` (0→1) for a smooth mid-stage transition where practical. This fills the existing empty `*SVG()` stubs.
- **Restore both Spiritual Armor and Heart Refinement** as full 7-stage features (recreate `armor.js` + `heart.js`, add `heart` to `FEATURE_STAGES`, add `#armorArea`/`#heartArea` divs + script tags, wire renderers).
- **Spiritual heart renderer** is named `window.renderHeartRefinement` to avoid clobbering the knowledge-pool `window.renderHeart`.
- **Icons:** populate `FEATURE_ICONS` with `iqIcon()` output; change all growth tab/settings raw-key insertions to `iqIcon()` calls. `.growth-tab-stage-emoji` keeps `progress.icon` but wrapped in `iqIcon()`.
- **Wiring:** all 9 renderers callable from `renderDynamic()` plus the per-panel render paths that own their areas. Keys/Mosque areas live in `#panel-profile` (index.html:170) → wired via `_lazyRender` (core/actions.js:2209-2253) and `renderTab('profile')`. Ramadan/Laylat are their own panels → `_lazyRender`. Garden/Lantern/Boat/GrowthTab already in `renderDynamic()`/`renderTab('growth')`. Armor/HeartRefinement areas land in `#panel-growth` → `renderTab('growth')`. Use existing `safe(() => window.renderX && window.renderX(), 'X')` pattern; no new unsafe calls.
- **Alignment:** full app-wide audit, one checklist per container group; fix gutters/heights/wrapping with the same `flex: 1 1` + `min-width: 0` pattern already proven on the card/PT grids. Spiritual + growth cards get equal-height, equal-gap grid treatment so all features align.
- **Hero header restore** (existing approved spec) proceeds unchanged alongside.

## Layout / Component Model

Each spiritual feature uses the existing card contract (unchanged markup):

```
<feature>Area:
  .spiritual-card (.garden-card for garden)
    .spiritual-svg-wrap  <- filled with the stage SVG (class .spiritual-svg)
    .spiritual-info
      .spiritual-stage-name  <- {iqIcon(FEATURE_ICONS[f])} {label} (Stage n/7)
      .spiritual-progress    <- {xp}/{need} XP ... driven by getProgress()
      .spiritual-progress-bar > .spiritual-progress-fill (width %)
      .spiritual-caption     <- per-day caption (existing)
```

SVG files use inline SVG markup returned as strings (no external assets). All scene colors use theme vars: `var(--gold)`, `var(--gold-light)`, `var(--gold-dark)`, `var(--green)`, `var(--text2)`, `var(--card-bg)`; gradients via `stop-color` using the same vars so dark mode stays consistent.

## Changes by File

### 1. features/spiritual-growth/data.js
- Populate `FEATURE_ICONS` with `iqIcon(key)` per feature: garden→sprout, lantern→lantern, keys→key, mosque→mosque, boat→anchor, heart→heart, armor→shield, ramadan→moon, laylat→star.
- Add `heart: [...]` array to `FEATURE_STAGES` (7 stages, progressive xp thresholds).
- Keep `FEATURE_STAGES.armor` and `FEATURE_LABELS.armor`/`heart` as-is (already present).

### 2. features/spiritual-growth/index.js
- `renderGrowthSettings()` (line ~47): `const icon = SpiritualGrowth.FEATURE_ICONS[f] || iqIcon(progress.icon || f)`. The `.growth-setting-toggle` already uses `iqIcon('eye')` — fine.
- `renderSpiritualGrowthTab()` (line ~82-84): `const icon = SpiritualGrowth.FEATURE_ICONS[f] || ''` (keep — now non-empty after data.js fix); `const stageEmoji = iqIcon(progress.icon || f)`.
- No changes to toggle/settings logic.

### 3. Sealed SVG scenes (7 existing + 2 restored)
Each gets a real 7-stage animated scene. Stage → visual mapping:

- **garden.js `treeSVG(stage, flowers)`:** 1 soil mound → 2 sprout → 3 sapling → 4 young tree → 5 mature tree → 6 blooming (flowers from `flowerCount(streak)`) → 7 paradise garden (glow + crescent). Reuse existing `flowerCount`/scale logic.
- **lantern.js `lanternSVG(stage, progress)`:** 1 unlit lantern → 2 wick lit → 3 small flame → 4 steady flame + glow → 5 radiant halo → 6 brilliant sunburst → 7 divine light (all gold). Flame size/opacity lerp with `progress`.
- **mosque.js `mosqueSVG(stage)`:** 1 foundation → 2 walls → 3 roof → 4 dome → 5 minaret → 6 interior arches + tile work → 7 complete mosque glowing. STAGE_CAPTIONS already drive caption(stage).
- **boat.js `boatSVG(stage, progress)`:** 1 dock → 2 setting sail (unfurl) → 3 open sea (sun) → 4 storm (cloud-lightning, dark waves) → 5 calm waters (sunrise) → 6 paradise island ahead → 7 jannah (gold horizon + crescent).
- **keys.js `keysSVG(stage, progress)`:** use existing `drawKey()` helper + `KEY_COUNTS [1,2,3,5,7,9,10]`; keys count by stage, material progresses stone/grey → clay → copper → iron → silver → gold → light (glow), slight arc arrangement.
- **ramadan.js `ramadanSVG(stage)`:** 1 sliver crescent → 2 thin waxing → 3 half → 4 gibbous → 5 full moon → 6 full moon + lantern/star accents → 7 Eid glow (gold).
- **laylat.js `laylatSVG(stage)`:** use `STAR_COUNTS [1,3,5,8,12,20,35]`; night sky with that many stars + brighter crescent + aurora glow as stage rises.
- **armor.js (restored) `armorSVG(stage)`:** 1 belt → 2 boots → 3 helmet → 4 shirt → 5 shield → 6 sword → 7 full glowing set. Mirror keys.js pattern (drawing helpers + STAGE shapes).
- **heart.js (restored) `heartSVG(stage)`:** 1 rough grey heart → 2 warming → 3 light entering → 4 radiant → 5 jewel → 6 pulsing glow → 7 pure divine heart (gold + light rays).

Keep the existing per-feature render pattern (innerHTML template with `spiritual-card`, includes `.spiritual-svg` class on the returned SVG wrapper) so CSS hooks are consistent.

### 4. index.html
- Add `<div id="armorArea"></div>` to `#panel-growth` (index.html:278).
- Add `<div id="heartArea"></div>` to `#panel-growth`.
- Add `<script src="features/spiritual-growth/armor.js?v=1"></script>` and `heart.js?v=1` in the Spiritual Growth block (after index.js, before/with lantern.js).

### 5. render/render.js
- Add to the `renderDynamic()` safe-list (line ~20): `safe(() => window.renderKeys && window.renderKeys(), 'Keys')`, `safe(() => window.renderMosque && window.renderMosque(), 'Mosque')`, `safe(() => window.renderRamadan && window.renderRamadan(), 'Ramadan')`, `safe(() => window.renderLaylat && window.renderLaylat(), 'Laylat')`, `safe(() => window.renderHeartRefinement && window.renderHeartRefinement(), 'HeartRefinement')`, `safe(() => window.renderArmor && window.renderArmor(), 'Armor')`.

### 6. core/actions.js
- Add to `_lazyRender` map (~line 2209-2253): `keys:'renderKeys'`, `mosque:'renderMosque'`, `ramadan:'renderRamadan'`, `laylat:'renderLaylat'` (mosque/keys fire when the profile group panel is visited; ramadan/laylat fire on their own panels).
- `renderTab('profile')` (line ~2295): call `window.renderKeys()` / `window.renderMosque()` alongside `renderProfile()` so the profile panel's keys/mosque cards populate immediately.
- `renderTab('growth')` (line ~2289): add `window.renderArmor()` / `window.renderHeartRefinement()` alongside existing Garden/Boat/GrowthTab.
- Site-wide alignment issues in this file: none expected; do not touch top-bar writers here (handled by the header spec).

### 7. styles/main.css — alignment pass
- Verify & equalize `.spiritual-card` grid: ensure `.spiritual-svg-wrap` fixed size (already 120x132 desktop / 100x110 mobile), `.spiritual-info` min-width so long titles don't overflow.
- `.growth-tab-grid` (line 1786): confirm `repeat(auto-fill, minmax(220px,1fr))` gives equal-height cards — add `align-items: stretch` and fix card internal layout so all 9 cards align.
- Run the full panel audit (see Verification) and apply `flex: 1 1 + min-width: 0` / grid fixes per container found broken.

## Out of Scope (unchanged, noted)

- Dark-mode white chart boxes, pink chips, ghost avatar picker, dead CSS classes — all stay for a future cleanup (per header spec's out-of-scope list).

## Verification

- **Automated:** full test suite stays green — `node --test tests/html.test.js tests/sw.test.js tests/manifest.test.js tests/journeys.test.js tests/muhasabah.test.js tests/icons.test.js` (currently 47 pass). Consider an HTML assertion that the growth panel contains `#armorArea`/`#heartArea` and that growth renderers are referenced (assert only markup, not runtime).
- **Manual (browser, light + dark):** Growth tab shows all 9 features with a visible SVG scene that changes with stage; toggle XP/deeds and confirm scene + bar advance; settings list shows real icons not raw keys; profile panel keys/mosque cards appear; Ramadan/Laylat/Armor/Heart panels render; no console errors (especially the old `renderTip` missing-function error).
- **Alignment checklist:** scan every panel from top to bottom (tabs bars 1/2/3, bonus/well/prayer/deed rows, quest/shop, charts, profile, growth, modals, toasts); confirm equal gutters/heights, no text overflow, and consistent panel widths on ≤600px and ≤400px.