# Modern Light + Glassmorphism Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the emerald/gold dark theme with a modern light theme using glassmorphism and a coral/rose accent palette, sweeping all hardcoded accent colors in JS.

**Architecture:** The single stylesheet `styles/main.css` owns the theme via CSS custom properties, so restructuring is mostly a `:root` palette re-map plus component restyling. The app markup and `var(--gold)` references keep working because variable names are preserved. The coral/rose accent is swept into JS SVG features, charts, and inline styles so nothing clashes.

**Tech Stack:** Vanilla JS + CSS custom properties, Chart.js, node:test. No framework. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-08-07-modern-light-glass-design.md`

## Global Constraints

- Keep all CSS variable **names** unchanged; re-map only their values.
- Palette: bg `#faf7f5`, card glass `rgba(255,255,255,0.62)`, text `#1f2937`, text2 `#6b7280`, accent(rose) `#f43f5e`, gold-light `#fb7185`, gold-dark `#e11d48`, emerald→coral `#f472b6`, green(success) `#16a34a`, orange `#d97706`, red `#dc2626`, border `rgba(31,41,55,0.08)`, shadow `0 8px 32px rgba(180,90,120,0.12)`.
- Glass surface recipe: `background:rgba(255,255,255,0.62); backdrop-filter:blur(16px) saturate(160%); border:1px solid rgba(255,255,255,0.7);`
- Fonts: Sora for all headings/body (drop Cinzel/Cormorant/Playfair from headings); keep Noto Naskh Arabic/Amiri for Arabic.
- Accent hex to use in JS: `#f43f5e` (rose), soft `#fb7185`, coral `#f472b6`. Rose rgb = `244,63,94`. Emerald old rgb `16,185,129` → `#16a34a` (green).
- No backup file of the old theme (decided: not needed).
- App branding, structure, and behavior unchanged.
- One commit per task.

---

### Task 1: Restore a working test baseline for the stylesheet

**Files:**
- Modify: `tests/html.test.js`

**Interfaces:**
- Consumes: publishes `html`, `css`, `render` string constants already defined at the top of `tests/html.test.js`.
- Produces: two new assertions that read `css` (the `styles/main.css` content).

- [ ] **Step 1: Add tests asserting the modern palette is present and the old palette's signature backgrounds are gone**

Append after the last test in `tests/html.test.js`:

```js
test('modern light glass theme: uses the new bg and glass accents', () => {
  assert.ok(css.includes('--bg: #faf7f5'));
  assert.ok(css.includes('rgba(255,255,255,0.62)'));
  assert.ok(css.includes('--gold: #f43f5e'));
  assert.ok(css.includes('backdrop-filter'));
});

test('modern light theme: old emerald/gold dark backgrounds are removed', () => {
  assert.ok(!css.includes('--bg: #0b1513'));
  assert.ok(!css.includes('--emerald: #10b981'));
  assert.ok(!css.includes('--gold: #D4AF37'));
});
```

- [ ] **Step 2: Run tests to confirm the new assertions fail**

Run: `node --test tests/html.test.js`
Expected: the two new tests FAIL (old palette still present); the pre-existing tests pass.

- [ ] **Step 3: Commit**

```bash
git add tests/html.test.js
git commit -m "test: assert modern light glass theme palette"
```

---

### Task 2: Rewrite `styles/main.css` with the modern light glass theme

**Files:**
- Modify: `styles/main.css` (entire file, 1074 lines)

**Interfaces:**
- Consumes: all existing CSS class names in the markup (`styles/main.css` line 5-1074 define them).
- Produces: re-mapped `:root` tokens and glassified components that the rest of the app uses via `var(--gold)`, `var(--emerald)`, `var(--text)`, etc.

- [ ] **Step 1: Replace the `:root` palette block (lines 5-32)**

Rewrite the custom properties to the Global Constraints palette. Keep every variable **name**. Replace:

```css
--bg: #faf7f5;
--bg-accent: #f3f0ee;
--card: rgba(255,255,255,0.62);
--card2: rgba(255,255,255,0.66);
--emerald: #f472b6;
--emerald-deep: #e11d48;
--gold: #f43f5e;
--gold-light: #fb7185;
--gold-dark: #e11d48;
--teal: #f472b6;
--text: #1f2937;
--text2: #6b7280;
--green: #16a34a;
--orange: #d97706;
--red: #dc2626;
--purple: #a855f7;
--border: rgba(31,41,55,0.08);
--shadow: 0 8px 32px rgba(180,90,120,0.12);
--radius: 16px;
--radius-sm: 12px;
--font: 'Sora', system-ui, -apple-system, 'Noto Color Emoji', 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Emoji', 'Twemoji Mozilla', sans-serif;
--font-heading: 'Sora', system-ui, sans-serif;
--font-arabic: 'Noto Naskh Arabic', 'Amiri', serif;
--glass: rgba(255,255,255,0.62);
--glass-blur: 16px;
```

Delete `--pattern-star` (no longer used). Delete `--font-display`/`--font-emoji` if unused (grep first; keep `--font-emoji` if referenced).

- [ ] **Step 2: Remove ornamental surface helpers and gold radial body bg**

Replace `.pattern-surface { … }` and `.arch { … }` — set `.pattern-surface` to a no-op (background: transparent). In `body`, replace the gold radial gradient with a light neutral base:

```css
body {
  background: var(--bg);
  background-image: radial-gradient(circle at 50% 0%, rgba(244,114,182,0.12) 0%, transparent 55%);
}
```

- [ ] **Step 3: Add full-screen pastel glow blobs behind the app**

Append around the `.app` rule so glass cards have color to blur:

```css
.app { position: relative; z-index: 1; max-width: 880px; margin: 0 auto; padding: 0 24px 80px; }
.app::before, .app::after {
  content: ''; position: fixed; z-index: -1; border-radius: 50%; filter: blur(90px);
  pointer-events: none;
}
.app::before { width: 420px; height: 420px; top: -80px; right: -60px; background: rgba(244,114,182,0.35); }
.app::after { width: 460px; height: 460px; bottom: -120px; left: -100px; background: rgba(251,146,60,0.25); }
```

- [ ] **Step 4: Glassify every hardcoded dark/gold component**

Go through every component block and convert to the glass recipe. For each of these selectors, set `background: var(--glass); border: 1px solid rgba(255,255,255,0.7); backdrop-filter: blur(var(--glass-blur)) saturate(160%);` and use light-appropriate text/soft shadows:

- `.level-badge` (was `var(--card)` + gold border) → glass
- `.xp-outer` (was dark inset track) → light track `rgba(31,41,55,0.08)`, keep border
- `.xp-inner` → replace gold-wave gradient with rose gradient `linear-gradient(90deg,#fb7185,#f43f5e,#f472b6)`, light glow `rgba(244,63,94,0.5)`, remove `xpWave` animation (keep the keyframe or delete it — keep the width transition)
- `.streak-bar`, `.tier-nav-container`, `.tier1-tabs`, `.t2-btn`, `.cat-chip`, `.t3-btn` → glass; active states → rose tint `rgba(244,63,94,0.1)` + rose border `rgba(244,63,94,0.4)`, text `var(--gold-dark)`
- `.card-grid .card-item`, `.vol-card`, `.deed-card`, `.content-card`, `.quest-row`, `.shop-card`, `.prayer-card` → glass; hover border → `rgba(31,41,55,0.18)` with soft rose shadow
- `.card-xp`, `.prayer-xp`, `.quest-reward`, `.shop-cost`, `.best-num` → `color:var(--gold-dark)` with rose tint bg
- `.done` / complete states → use `--green` rgba `rgba(22,163,74,0.12)` border `rgba(22,163,74,0.4)`
- `.prog-stats .stat-card`, `.stat-card`, `.ach-card`, `.reward-card`, `.pt-card` → glass
- `.prayer-times-grid .pt-card.next-prayer` → rose highlight `rgba(244,63,94,0.08)` + `rgba(244,63,94,0.4)` border
- `.cal-day .now` → rose border `rgba(244,63,94,0.5)`; `.cal-day.bad`/`.ok`/`.good` colors already map via `--red/--orange/--green`
- `.profile-input`, `.global-search`, `.quran-search` → light bg `#fff`, dark text, rose focus border
- `.toast-box`, `.levelup-box`, `.dhikr-counter-card`, `.muh-card`, `.daily-bonus`, `.tip-box`, `.reward-xp-banner`, `.garden-card`, `.journey-card`, `.dhikr-analytics`, `.health-card`, `.finance-card`, `.mood-btn`, `.reflection-card`, `.gratitude-item` → glass card recipe; adjust inner text from gold text to `--text`
- `.gratitude-btn`, `.muh-dismiss` (dark-gradient gold buttons) → light rose solid `background:var(--gold); color:#fff;`
- `.danger-zone`, `.danger-btn` → keep `--red` tints
- `.cat-details[open] summary` lighten
- `.firefly` (gold `#FDE047`) → disable by setting `display:none` OR recolour to soft pink `rgba(244,114,182,0.5)` and reduce anim; recommend `display:none` to keep it calm
- `.ach-card.unlocked` gold glows → rose equivalents; tier colours stay (silver/bronze/platinum/diamond/legendary/mythic/jannah)

Keep confetti, toast/level-up animations, and all layout (grid columns, flex) identical — only colors/surfaces change.

- [ ] **Step 5: Sweep remaining gold-text color references to dark text**

Audit the file for remaining `color: var(--gold)` where it was *foreground text on a dark card* and swap those usages to `color: var(--text)` / headings to keep contrast on light glass. Leave `--gold`/`--gold-dark` where used as *accent* (XP, badges, numbers).

- [ ] **Step 6: Run tests**

Run: `node --test tests/html.test.js`
Expected: both new palette tests PASS; all pre-existing tests still PASS.

- [ ] **Step 7: Commit**

```bash
git add styles/main.css
git commit -m "style: modern light glassmorphism theme with rose accent"
```

---

### Task 3: Update index.html theme meta, fonts, intro overlay, and stylesheet version

**Files:**
- Modify: `index.html`, `manifest.json`

**Interfaces:**
- Consumes: the new types defined in `styles/main.css` (— the theme meta color and font tags must match).
- Produces: `theme-color` meta, Google-fonts `<link>`, intro overlay inline colors, stylesheet `?v=` bump.

- [ ] **Step 1: Update `meta theme-color` and remove now-unused serif fonts from the Google Fonts link**

Replace the tag `content="#0b1513"` with `content="#faf7f5"` (line 13).

In the fonts `<link>` (line 9), drop `Cinzel`, `Playfair+Display`, and `Cormorant+Garamond` from the `family=` params, keeping `Sora`, `Amiri`, `Noto+Color+Emoji`, `Noto+Emoji`, `Noto+Naskh+Arabic`. Bump the `v=` on the stylesheet link (line 11) from `v=1` to `v=2`.

- [ ] **Step 2: Restyle the intro overlay inline accent colors to rose**

In the intro overlay (lines 21-26), replace every gold value:
- line 23 bismillah color `#D4AF37` → `#f43f5e`; text-shadow adds `rgba(244,63,94,…)` instead of `rgba(212,175,55,…)`
- line 25 button gradient `linear-gradient(...#D4AF37,#A16207)` → `linear-gradient(135deg,#f43f5e,#f472b6)`, color `#fff` instead of `#000`, box-shadow rose `rgba(244,63,94,0.4)`

Also update `btnPulse`/`bismillahGlow`/`introFadeUp` animations inside `main.css` (Task 2) if any reference gold — they already moved.

- [ ] **Step 3: Update the PWA manifest theme colors to the light base**

In `manifest.json` lines 10-11, replace `background_color` and `theme_color` from `#0b1114` to `#faf7f5`.

- [ ] **Step 4: Run a sanity check**

Run: `node --test tests/html.test.js`
Expected: ALL tests pass (they read index.html and main.css).

- [ ] **Step 5: Commit**

```bash
git add index.html manifest.json
git commit -m "style: light theme meta, fonts, and intro overlay rose accents"
```

---

### Task 4: Sweep JS accent colors to rose (charts, actions, render)

**Files:**
- Modify: `analytics/charts.js:28,89`, `core/actions.js:199,2187-2189`, `render/render.js:286,845,1254,1257`

**Interfaces:**
- Consumes: `--gold` CSS vars (unchanged) plus the defined palette hexes.
- Produces: matches new palette so charts/cards/list number badges use rose.

- [ ] **Step 1: Re-colour the charts title**

In `analytics/charts.js` lines 28 and 89, replace `color: '#D4AF37'` → `color: '#f43f5e'`. Replace `font: { family: "'Cinzel', serif" … }` → `font: { family: "'Sora', sans-serif" … }`. Also update the `COLORS` object (lines 4-14): `primary: '#16a34a'`, `secondary: '#fb7185'`, `light: '#fda4af'`, `accent: '#f43f5e'`, `red: '#dc2626'`, `bg: 'rgba(251,113,133,0.15)'`, `text: '#6b7280'`, `white: '#334155'`.

- [ ] **Step 2: Re-colour custom dhikr fallback color and the allah/scholar name cards**

In `core/actions.js:199` set `color: '#f43f5e'`.
In lines 2187-2189: change card bg `rgba(15,23,42,0.6)` → `rgba(255,255,255,0.62)`, border `rgba(212,175,55,0.2)` → `rgba(244,63,94,0.2)`, number color `rgba(212,175,55,0.8)` → `rgba(244,63,94,0.8)`, text-shadow `rgba(212,175,55,0.3)` → `rgba(244,63,94,0.3)`, and `color:#fff` (line 2190) → `color:var(--text)` so it reads on light bg.

- [ ] **Step 3: Re-colour render num badges and calendar legend**

In `render/render.js:286` and `:845`, replace `rgba(212,175,55,0.15)` → `rgba(244,63,94,0.12)`, `rgba(212,175,55,0.4)` → `rgba(244,63,94,0.4)`; `color:var(--gold-light)` stays (re-mapped).
In `:1254`, `rgba(16,185,129,0.5)` → `rgba(22,163,74,0.5)` (success green).
In `:1257`, `rgba(212,175,55,0.5)` → `rgba(244,63,94,0.5)`.

- [ ] **Step 4: Verify no old gold rgb remains in these files**

Run:
`Select-String -Path analytics/charts.js,core/actions.js,render/render.js -Pattern "212,175,55|#D4AF37|rgba\(16,185,129"` → must list no matches.

- [ ] **Step 5: Run tests**

Run: `node --test tests/html.test.js`
Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add analytics/charts.js core/actions.js render/render.js
git commit -m "style: re-colour charts, names, badges to rose accent"
```

---

### Task 5: Sweep spiritual-growth SVG accent colors to rose

**Files:**
- Modify: `features/spiritual-growth/lantern.js`, `keys.js`, `mosque.js`, `mountain.js`, `armor.js`, `boat.js`, `features/garden.js`

**Interfaces:**
- Consumes: palette hexes to re-map gold→rose but keep each feature visually coherent.
- Produces: SVG art that matches the rose/coral theme.

- [ ] **Step 1: Re-map per-file crystal gold constants**

`lantern.js`: line 12 `const gold = '#D4AF37'` → `'#f43f5e'`; line 13 `const warm = '#FFE97D'` → `'#fb7185'`; lines 18-20, 28, 36, 44, 52, 61, 71, 85 `rgba(212,175,55,…)` → `rgba(244,63,94,…)` (replace all).

`keys.js`: line 10 `const gold = '#D4AF37'` → `'#f43f5e'`; line 12 `const lightGold = '#FFE97D'` → `'#fb7185'`; line 103 `rgba(212,175,55,0.12)` → `rgba(244,63,94,0.12)`. Keep `silver = '#C0C0C0'`.

`mosque.js`: line 13,16,20,29 `fill/stroke="#D4AF37"` → `#f43f5e`; line 26 `fill="#FFE97D"` → `#fb7185`.

`mountain.js`: lines 15-18 `stroke/fill="#D4AF37"` → `#f43f5e`.

`armor.js`: lines 13,21,22,25,29 `fill="#D4AF37"` → `#f43f5e`.

`boat.js`: line 30 `fill="#FFE97D"` → `#fb7185`.

`garden.js`: line 34 `fill="#FCE694"` → `#fb7185` (keep the pink petal `#E89BB0`).

- [ ] **Step 2: Confirm no gold hex remains in the feature files**

Run: `Select-String "D4AF37|FFE97D|212,175,55|FCE694" features/spiritual-growth/*.js,features/garden.js`
Expected: NO matches.

- [ ] **Step 3: Run the full suite**

Run: `node --test` (all tests)
Expected: all pass.

- [ ] **Step 4: Commit**

```bash
git add features/spiritual-growth/lantern.js features/spiritual-growth/keys.js features/spiritual-growth/mosque.js features/spiritual-growth/mountain.js features/spiritual-growth/armor.js features/spiritual-growth/boat.js features/garden.js
git commit -m "style: re-colour spiritual-growth SVG art to rose accent"
```

---

### Task 6: Fix the dhikr color tags

**Files:**
- Modify: `data/pools/dhikr.js:15,17`

**Interfaces:**
- Consumes: `color` strings used by the dhikr counter.
- Produces: matches new accent.

- [ ] **Step 1: Update dhikr colour tags**

Line 15 `color:"#10b981"` → `"#16a34a"`. Line 17 `color:"#D4AF37"` → `"#f43f5e"`.

- [ ] **Step 2: Verify no old hex**

Run: `Select-String "D4AF37|10b981" data/pools/dhikr.js` → no matches.

- [ ] **Step 3: Run tests**

Run: `node --test`
Expected: all pass.

- [ ] **Step 4: Commit**

```bash
git add data/pools/dhikr.js
git commit -m "style: rose accent for dhikr colour tags"
```

---

### Task 7: Final sweep for leftover gold/emerald and verification

**Files:**
- Modify: none required; run + reconcile.

**Interfaces:**
- Consumes: all prior tasks.
- Produces: repo free of mismatched accent colors.

- [ ] **Step 1: Grep the whole repo for leftover old-palette values**

Run: `Select-String -Recurse "D4AF37|rgba\(212,175,55|#10b981|FFE97D|FCE694|#0b1513|Cormorant Garamond|Playfair Display|Cinzel" *.js`
Also check `index.html` and `manifest.json` (theme-color).
Expected: any remaining hits are intentional (e.g., a genuinely unrelated color). If found, fix them or document why kept.

- [ ] **Step 2: Run the complete test suite**

Run: `node --test`
Expected: all tests green.

- [ ] **Step 3: Manual smoke check**

Open `index.html` in a browser. Confirm: light bg, frosted glass cards, rose accents, intro overlay rose button, no gold, readable text, charts/accent match, garden/lantern/mosque SVGs rose. (Notify the user to do the smoke-test and confirm before marking complete.)

- [ ] **Step 4: Commit any resulting fixes**

```bash
git add -A
git commit -m "style: finish rose theme sweep for light glass theme"
```