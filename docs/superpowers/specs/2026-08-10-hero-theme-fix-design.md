# Hero Restore + Theme Deepening + Top-Bar Fix

Date: 2026-08-10
Status: Approved
Scope: Fix the buggy top-bar, restore the classic hero header (floating moon, "Ibadah Quest" title, XP bar, streak box) styled to the current clay theme, deepen all five light themes for better contrast, and add a signature "Emara" (Jade & Gold) Islamic theme.

## Context

The claymorphism redesign removed the classic hero header. The old markup, CSS, and render functions for `.header` (moon + title + tagline), `.level-row` (`#lvNum`, `#lvTitle`, `#xpBar`, `#xpLabel`), and `.streak-bar` (`#strDays`, `#strMsg`, `#bestStr`) were all deleted. A slim sticky top-bar (`#tbLevel`, `#tbTitle`, `#tbXP`, `#tbStreak`) is the only status chrome.

User reports two concrete problems:

1. **Buggy top-bar** (screenshot: "Lv 1 Muslim 0 XP 0"). Two bugs confirmed:
   - `renderTab('home')` calls the orphan `window.renderTip()` (core/actions.js:2285); `renderTip` was deleted in the redesign and does not exist, so this throws and aborts the rest of the function — `window.renderTopBar()` never runs, leaving stale default text ("Muslim", "0 XP 0").
   - Two competing writers fill the same pills with different formats: `renderTopBar` (render/render.js:1378, icon-based: `iqIcon('zap')`/`iqIcon('flame')`) vs `updateTopBar` (core/actions.js:2306, plain text: `3 day` / `X XP` with no icons). XP/streak flicker between formats depending on which path runs.
2. **Too-light backgrounds / weak Islamic identity.** Light themes use very light pastel backgrounds (`#ece8f1`, `#e4efe2`, `#e6e0f2`, `#f0ead8`, `#dfe9f4`), so clay shadows have low contrast; the palettes read as generic pastel material rather than an Islamic app.

Supporting data is intact and required again: `LEVELS` (data/levels.js), `STREAK_MSGS` (data/streak-msgs.js), and `xpFor`/`lvFrom`/`lvTitle` (state/state.js), plus state `S.lv`, `S.xp`, `S.cs`, `S.bs`.

## Decisions

- **Top-bar becomes icon-based, single writer.** Keep `renderTopBar` (render.js) as the ONLY writer for `#tbLevel`/`#tbTitle`/`#tbXP`/`#tbStreak`. Replace the body of `updateTopBar` (actions.js) with a delegate to `window.renderTopBar?.()`. Delete the orphan `window.renderTip()` call so `renderTab('home')` no longer throws.
- **Restore the hero header** below the sticky top-bar (scrolls away; top-bar remains sticky). Keep both.
- Icons: use `iqIcon(...)` SVG system for the moon/flame/zap/star decorations (matches the redesign; avoids emoji corruption).
- Keep tagline "Submission. Grow. Earn. Ascend." as the decorative divider.
- Include the streak message (`#strMsg`) from `STREAK_MSGS` under the streak count.
- **Deepen the five light themes** ~1–2 tonal steps (same hues, higher contrast for clay shadows), including the base `:root` default.
- **Add a sixth light theme "Emara" (Jade & Gold)**: deep emerald background, gold accents, mosque-inspired.

## Layout

```
top-bar (sticky, existing)         <- keep, now icon-based via renderTopBar
header (hero card)                 <- restored: floating moon + "Ibadah Quest" + tagline
level-row                          <- restored: [ Lv badge | XP progress bar ]
streak-bar                         <- restored: streak flame + "N Day Streak" + message + BEST box
tab-content (existing panels)      <- below
```

## Changes by file

### 1. core/actions.js
- Remove `window.renderTip();` from `renderTab('home')` (async error).
- Replace `updateTopBar` body with a single delegate: `if (window.renderTopBar) window.renderTopBar();`.
- (Optional) keep `updateTopBar` name for call sites (`setTheme`, `renderTab`, etc.) but make it delegate, so no other code changes.

### 2. index.html
After the sticky `</header>` (currently line 55), insert the hero block:
- `.header` with `.header-crescent` (moon icon), `<h1>Ibadah Quest</h1>`, `.header-deco` tagline span.
- `.level-row` containing `.level-badge` (`.lv-num #lvNum`, `.lv-title #lvTitle`), `.xp-wrap #xpWrap` (`.xp-outer > .xp-inner #xpBar` width 0%, `.xp-label #xpLabel`).
- `.streak-bar` with `.streak-fire` (flame icon), `.streak-info` (`#strDays`, `#strMsg`), `.streak-best` (`#bestStr`, `.best-label`).

Old IDs preserved verbatim.

### 3. styles/main.css
- **Base `:root` + five light themes:** deepen `--bg`, `--bg-accent`, `--card-bg` one to two tonal steps while preserving each hue. Keep text/contrast readable.
- **`html[data-theme="emara"]`:** deep emerald palette. `--bg` deep jade `#123027`, `--bg-accent` `#1a3b2f`, `--card-bg` `#1d4033`, shadows `rgba(0,0,0,0.55)` dark / `rgba(46,90,70,0.25)` light, text warm near-white `#f2f4ec`, `--text2` `#a9c1ae`, `--gold` `#d4af37`, `--gold-light` `#e6c76a`, `--gold-dark` `#b08d24`, `--emerald`/`--teal` `#d4af37`-family, `--border` `rgba(255,255,255,0.09)`, `--accent-rgb: 212,175,55`, `--shadow-rgb: 0,0,0`. Mirror the dark theme's radial gold glow on `body`, `.app::before`, and `.geometric-bg`.
- **Restored hero styles** (themed, no old gold hexes):
  - `.header`, `.header::before` glow, `.header-crescent` + `@keyframes moonFloat`, `.header h1`, `.header-deco`, `.header-deco span`.
  - `.level-row`, `.level-badge`, `.lv-num`, `.lv-title`.
  - `.xp-wrap`, `.xp-outer`, `.xp-inner` (gold gradient + glow), `.xp-label`.
  - `.streak-bar`, `.streak-fire`, `.streak-info h3/p`, `.streak-best`, `.best-num`, `.best-label`.
  - Dark-mode overrides for restored elements in the existing `html[data-theme="dark"]` block.
- Emara-specific overrides where needed (e.g., top-bar, search, inputs) so the dark-ish theme behaves like the dark theme on form fields.

### 4. render/render.js
- Replace the stub `renderLv()` with: set `#lvNum`, `#lvTitle`, `#xpBar` width `%`, `#xpLabel` as `prog / need XP` using `xpFor(lv)`.
- Replace the stub `renderStr()` with: set `#strDays` (`S.cs + ' Day Streak'`), `#bestStr` (`S.bs`), `#strMsg` from `STREAK_MSGS` (first entry whose `m <= S.cs`, else "Legendary!").
- Verified already invoked via `renderDynamic()`'s `safe()` list (render.js:20) so they refresh on every toggle path.
- Keep `renderTopBar` as the single icon-based top-bar writer (no change to its body).

### 5. data/theme-meta.js
- Deepen the light swatch `bg` values to match the deeper CSS (swatches only affect the picker preview).
- Add `{ key:'emara', label:'Emara', swatch:{ bg:'#123027', accent:'#d4af37' } }`.

### 6. tests/html.test.js
- Assert `actions` no longer contains `renderTip();` call and `updateTopBar` delegates to `renderTopBar`.
- Assert `html` contains the hero IDs: `#lvNum`, `#lvTitle`, `#xpBar`, `#xpLabel`, `#strDays`, `#strMsg`, `#bestStr`, `.header-crescent`.
- Assert `render` contains real `renderLv`/`renderStr` bodies (e.g. `getElementById('xpBar')`, `STREAK_MSGS`).
- Assert `css` contains `html[data-theme="emara"]`.
- Update any existing test that pins the old light `--bg` values.

## Verification

- `node --test` full suite green (excluding pre-existing `garden.test.js` harness bug).
- Syntax check both JS bundles.
- Manual: each of the 7 themes (Light/Dark/Serene/Royal/Sand/Midnight/Emara) — hero moon floats, XP bar fills and advances on toggling a prayer, streak box updates `#strDays`/`#strMsg`/`#bestStr`, top-bar shows icon-based XP/streak with no flicker, the "Lv 1 Muslim 0 XP 0" defect is gone.

## Out of scope

- Dark-mode white chart boxes / hardcoded pink chips / ghost avatar picker / dead CSS classes (unchanged legacy debt).