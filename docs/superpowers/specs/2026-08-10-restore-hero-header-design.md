# Restore Classic Hero Header

Date: 2026-08-10
Status: Approved
Scope: Restore the pre-redesign hero header (floating moon, "Ibadah Quest" title, XP progress bar, streak box) styled to the current clay theme, plus bundle the header-related bugs surfaced by the visual scan.

## Context

The claymorphism redesign removed the classic hero header. The old markup, CSS, and render functions for `.header` (moon + title + tagline), `.level-row` (`#lvNum`, `#lvTitle`, `#xpBar`, `#xpLabel`), and `.streak-bar` (`#strDays`, `#strMsg`, `#bestStr`) were all deleted. The slim sticky top-bar (`#tbLevel`, `#tbTitle`, `#tbXP`, `#tbStreak`) is the only remaining status chrome. Supporting data is intact: `LEVELS` (data/levels.js), `STREAK_MSGS` (data/streak-msgs.js), and `xpFor`/`lvFrom`/`lvTitle` (state/state.js:71-73), plus `S.lv`, `S.xp`, `S.cs`, `S.bs`.

## Decisions

- Keep **both** the sticky top-bar and the restored hero header. The top-bar remains sticky and scrolls with the user; the hero block lives above the tab content and scrolls away. The top-bar pills are retained (they provide persistent status while scrolled), so no removal of top-bar XP/streak.
- Keep the header tagline **"Submission. Grow. Earn. Ascend."** as the decorative divider line.
- Icons: use the app's existing `iq-icon` SVG icon system where the old markup used raw emoji (moon, flame, zap); this matches the redesign's icon approach and avoids the emoji corruption issue the project already fought.
- The moon is a floating decorative element back in the header (reintroducing `.header-crescent` and its `moonFloat` / `crescentGlow` animations).

## Layout

```
top-bar (sticky, existing)         <- keep as-is
header (hero card)                 <- restored: floating moon + "Ibadah Quest" + tagline
level-row                          <- restored: [ Lv badge | XP progress bar ]
streak-bar                         <- restored: streak flame + "N Day Streak" + message + BEST box
tab-content (existing panels)      <- below
```

## Changes by file

### 1. index.html
After `</header>` (currently line 55), insert the hero block:
- `.header` with `.header-crescent` (moon), `h1` "Ibadah Quest", and `.header-deco` tagline (reusing `iq-icon` for the crescent/star decorations).
- `.level-row` containing `.level-badge` (`.lv-num #lvNum`, `.lv-title #lvTitle`), `.xp-wrap #xpWrap` (`.xp-outer > .xp-inner #xpBar` width 0%, `.xp-label #xpLabel`).
- `.streak-bar` with `.streak-fire` (flame icon), `.streak-info` (`#strDays`, `#strMsg`), `.streak-best` (`#bestStr`, `.best-label`).

Old IDs preserved verbatim so restore is mechanical.

### 2. styles/main.css
Restore themed versions of:
- `.header`, `.header::before` glow, `.header-crescent`, `.header h1`, `.header-deco`, `.header-deco span` + `@keyframes moonFloat`, `@keyframes crescentGlow`.
- `.level-row`, `.level-badge`, `.lv-num`, `.lv-title`.
- `.xp-wrap`, `.xp-outer`, `.xp-inner` (gold→green gradient + glow), `.xp-label`.
- `.streak-bar`, `.streak-fire`, `.streak-info h3/p`, `.streak-best`, `.best-num`, `.best-label`.
- Dark-mode overrides for the restored elements in the existing `html[data-theme="dark"]` block.

All colors via theme vars (`var(--gold)`, `var(--card-bg)`, `rgba(var(--accent-rgb),…)`); no hardcoded old gold/amber hexes.

### 3. render/render.js
- Replace the stub `renderLv()` (line ~141) with the old implementation: set `#lvNum`, `#lvTitle`, `#xpBar` width `%`, `#xpLabel` as `prog / need XP` using `xpFor(lv)`.
- Replace the stub `renderStr()` (line ~142): set `#strDays` (`S.cs + ' Day Streak'`), `#bestStr` (`S.bs`), `#strMsg` from `STREAK_MSGS`.
- Both are already invoked via `renderDynamic()`'s `safe()` list (render.js:20) — verify they refresh on every toggle path.

### 4. core/actions.js
- Remove orphan `window.renderTip()` call at line 2283 (function no longer exists; throws and aborts the `renderTab('home')` top-bar refresh).
- Reconcile the two top-bar writers: keep `renderTopBar` (render.js, icon-based) as the single writer used by `renderDynamic`/render events, and make `updateTopBar` (actions.js:2300-2309) either removed or delegating to `renderTopBar` so XP/streak no longer flicker between formats (`🔥 3` vs `3 day`).

### 5. Dead-code cleanup (included, low risk)
- Remove the no-op `renderLv`/`renderStr` export-only stubs once replaced (they become real functions again).
- Do **not** delete `data/streak-msgs.js` — it is required again by the restored streak box.

## Out of scope (noted for future)

- Dark-mode white chart boxes (`.insight-chart-wrap canvas` background `#ffffff`, main.css:1326).
- Hardcoded pink chips `rgba(244,63,94,…)` in render.js:285/850.
- Ghost avatar picker (`toggleAvatarPicker` toggles a nonexistent `#avatarPicker`).
- Large list of dead CSS classes from the redesign.

## Verification

- `node --test tests/html.test.js` and the full test suite must stay green.
- Manual: load the app in a browser (light + dark themes), confirm moon floats, XP bar fills and advances when toggling a prayer, streak box updates text/BEST from state, and the sticky top-bar still shows consistent XP/streak values (no format flicker).