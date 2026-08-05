# Emerald & Gold Islamic Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-skin Ibadah Quest with a modern Emerald & Gold Islamic identity (Tailwind CSS + Font Awesome via CDN) and replace shell/action emoji icons with Font Awesome glyphs.

**Architecture:** A no-build vanilla JS SPA. All HTML is rendered from JS template strings, so the redesign is driven by (1) a CDN-released Tailwind + Font Awesome layer, (2) re-skinned `:root` CSS design tokens in `styles/main.css` that every shared component class picks up automatically, and (3) a Font Awesome icon swap in the shell render paths (nav, tabs, prayer/deed cards, spiritual growth cards). Content *pool bodies* keep emoji (already font-backed).

**Tech Stack:** Tailwind CSS (Play CDN), Font Awesome 6 Free (CDN), vanilla JS, existing `node:test` suite.

## Global Constraints

- App must remain a **single-page, no-build, offline-capable** app; do not add npm, a bundler, or runtime toolchain.
- Faithfulness to spec `docs/superpowers/specs/2026-08-06-islamic-redesign-design.md`: emerald+gold palette, geometric accents, Cormorant Garamond display headings, Amiri retained for Arabic.
- Icons: shell/nav/tabs/cards + spiritual growth cards use **Font Awesome**; content-pool bodies keep existing emoji.
- Existing `node tests/*.test.js` must keep passing (do not change tested markers like `gardenArea`, `tab-groups` structure, PWA meta).
- One commit per task (never bundle unrelated changes).
- No build step: use CDN links only. Tailwind Play CDN is dev-only; core styling must work from `styles/main.css` fallback.

---
---

### Task 1: Add Tailwind + Font Awesome CDN and update head

**Files:**
- Modify: `index.html:9-15` (head)
- Test: `tests/html.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces: `<link>`/`<script>` CDN deps that later tasks rely on.

- [ ] **Step 1: Write the failing test**

Add to `tests/html.test.js`:

```javascript
test('index.html loads Font Awesome and Tailwind CDN', () => {
  assert.ok(html.includes('cdnjs.cloudflare.com/ajax/libs/font-awesome'));
  assert.ok(html.includes('tailwindcss'));
});

test('index.html theme-color uses emerald ink', () => {
  assert.ok(html.includes('content="#0b1513"'));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/html.test.js`
Expected: FAIL (no Font Awesome/Tailwind, old theme color).

- [ ] **Step 3: Implement**

In `index.html` `<head>`, after the fonts `<link>` (line 9), add:

```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
<script src="https://cdn.tailwindcss.com"></script>
```

Update the theme-color meta (line 12) to the new ink emerald `#0b1513`. Add `Cormorant Garamond` to the Google Fonts `family=` list.

- [ ] **Step 4: Run tests + browser smoke**

Run: `node --test tests/*.test.js` — all pass.
Smoke: header/shell renders, Font Awesome/Tailwind loads (network tab shows 200).

- [ ] **Step 5: Commit**

```bash
git add index.html tests/html.test.js
git commit -m "feat: add Font Awesome + Tailwind CDN and emerald theme color"
```

---
---

### Task 2: Re-skin Root CSS Design Tokens (Emerald & Gold)

**Files:**
- Modify: `styles/main.css:5-29` (`:root`)
- Test: `tests/html.test.js` (content assert on css file)

**Interfaces:**
- Consumes: Task 1 CDN (not strictly required by CSS, but by app).
- Produces: updated `--` design tokens that Tasks 3-4 style against.

- [ ] **Step 1: Write failing test**

In `tests/html.test.js` add:

```js
const css = require('fs').readFileSync(path.join(root, 'styles', 'main.css'), 'utf8');

test('main.css uses emerald/gold tokens', () => {
  assert.ok(css.includes('--emerald'));
  assert.ok(css.includes('--gold'));
  assert.ok(css.includes('--bg: #0b1513'));
});
```

- [ ] **Step 2: Run to verify fail**

Run: `node --test tests/html.test.js`
Expected: FAIL (`--emerald` missing, old `--bg`).

- [ ] **Step 3: Implement**

Replace the `:root { ... }` block (lines 5-29) design tokens with:

```css
:root {
  --bg: #0b1513;
  --bg-accent: #0f1f1b;
  --card: #11251f;
  --card2: #16312a;
  --emerald: #10b981;
  --emerald-deep: #059669;
  --gold: #D4AF37;
  --gold-light: #FCE694;
  --gold-dark: #A8872A;
  --teal: #14b8a6;
  --text: #F5F1E1;
  --text2: #9db8ab;
  --green: #10b981;
  --orange: #f59e0b;
  --red: #ef4444;
  --purple: #8b5cf6;
  --border: rgba(212, 175, 55, 0.16);
  --shadow: 0 12px 32px -12px rgba(0, 0, 0, 0.55);
  --radius: 20px;
  --radius-sm: 14px;
  --font: 'Sora', system-ui, -apple-system, 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', 'Twemoji Mozilla', 'EmojiOne Color', 'Android Emoji', sans-serif;
  --font-display: 'Cormorant Garamond', 'Cinzel', 'Playfair Display', serif;
  --font-arabic: 'Noto Naskh Arabic', 'Amiri', serif;
  --font-heading: 'Cormorant Garamond', 'Cinzel', serif;
  --font-emoji: 'Noto Color Emoji', 'Noto Emoji', 'Apple Color Emoji', 'Segoe UI Emoji', 'Twemoji Mozilla', 'EmojiOne Color', 'Android Emoji';
  --pattern-star: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'><g fill='none' stroke='%23D4AF37' stroke-opacity='0.06'><rect x='20' y='0' width='20' height='20'/><rect x='0' y='20' width='20' height='20'/></g><path d='M20 8l3 3-3 3-3-3z' fill='%2310b981' opacity='0.12'/></svg>");
}
```

- [ ] **Step 4: Confirm no stale token references**

Keep the `--card: #11251f;` token (it was in the original block and is referenced by many card rules). Run `grep -rn "var(--bg)-variant\|var(--ink)"` to confirm these never-referenced tokens are absent; if any component referenced a removed token, revert to preserving that token name.

- [ ] **Step 5: Run tests**

Run: `node --test tests/*.test.js` — all pass.

- [ ] **Step 6: Commit**

```bash
git add styles/main.css tests/html.test.js
git commit -m "feat: re-skin root tokens to emerald and gold palette"
```

---
---

### Task 3: Shell Surfaces — Header, Level/XP, Streak, Navigation

**Files:**
- Modify: `styles/main.css` (`.header`, `.level-row`, `.xp`, `.streak-bar`, `.tier-nav-container`, `.t1/t2-btn`, `.section-title`)
- Test: `tests/html.test.js`

**Interfaces:**
- Consumes: Task 2 tokens.
- Produces: refined shell surfaces (no public API).

- [ ] **Step 1: Write failing test**

```js
test('shell surfaces use emerald/gold and arch corners', () => {
  assert.ok(css.includes('--pattern-star'));
  assert.ok(css.includes('border-radius: 14px 14px 6px 6px') || css.includes('border-radius: var(--radius) var(--radius) 6px 6px'));
  assert.ok(css.includes('.t1-btn.active'));
});
```

- [ ] **Step 2: Run to verify fail**

Expected: FAIL (`--pattern-star`/arch not referenced in shell rules).

- [ ] **Step 3: Implement styling**

Update section-by-section in `styles/main.css`:

- `.header` → background: transparent; add `.header-deco` arabesque divider using `background-image: var(--pattern-star)` and gold gradient hairline.
- `.level-badge` → add `border: 1px solid var(--border)`; `.lv-num` gold; add a subtle `.pattern` utility applied to level & streak cards.
- `.xp-outer` → emerald glow border (`border-color: rgba(16,185,129,0.35)`); keep gold gradient in `.xp-inner`.
- `.streak-bar` → emerald hover border; `.streak-fire` gold glow stays.
- `.tier-nav-container` → gold-tinted border; `.t1-btn`, `.t2-btn` gold active border + emerald accent.
- `.section-title` → keep gold text, gold `::after` hairline.

Add reusable helpers near top:

```css
.pattern-surface { background-image: var(--pattern-star); }
.arch { border-radius: var(--radius) var(--radius) 8px 8px; }
```

- [ ] **Step 4: Run tests**

Run: `node --test tests/*.test.js` — pass.

- [ ] **Step 5: Commit**

```bash
git add styles/main.css tests/html.test.js
git commit -m "style: refine header, xp, streak, and nav surfaces with emerald/gold"
```

---
---

### Task 4: Card Grids, Buttons, Inputs, and Content Cards

**Files:**
- Modify: `styles/main.css` (`.card-grid`, `.vol-card`, `.deed-card`, `.content-card`, `.shop-card`, `.prayer-card`, `.finance`, `.dhikr`, `.spiritual-card`, buttons, inputs)
- Verify: `tests/html.test.js`

**Interfaces:**
- Consumes: Tokens, pattern-star.

- [ ] **Step 1: Write failing test**

```js
test('cards apply pattern overlay and emerald/gold active states', () => {
  assert.ok(css.includes('.card-item:hover') || css.includes('.card-item'));
  assert.ok(css.includes('background: var(--card)') || css.includes('.content-card'));
  assert.ok(css.includes('background-image: var(--pattern-star)'));
});
```

- [ ] **Step 2: Run to verify fail**

Run: `node --test tests/html.test.js` — expected fail if pattern not applied.

- [ ] **Step 3: Implement**

Apply `background-image: var(--pattern-star)` to `.card, .card-item, .vol-card, .deed-card, .content-card, .shop-card, .spiritual-card` with a light overlay; gold-outline primary buttons (`.shop-card`, `.prayer-xp`); emerald secondary (`.search`, inputs). Ensure `.done` states use emerald.

- [ ] **Step 4: Run tests**

`node --test tests/*.test.js` — pass.

- [ ] **Step 5: Commit**

```bash
git add styles/main.css tests/html.test.js
git commit -m "feat: apply emerald/gold surfaces to cards, buttons, and inputs"
```

---
---

### Task 5: Font Awesome Icon Swap — Navigation, Tabs, Prayers, & Spiritual Cards

**Files:**
- Modify: `core/actions.js` (nav icon rendering ~2116-2157), `render/render.js` (pray/deed cards), `.spiritual-growth/*.js` spiritual cards' decor icon, `data/tab-groups.js` icons
- Test: `tests/html.test.js` (content)

**Interfaces:**
- Consumes: FA CDN.
- Produces: FA `<i>` inline icons.

Approach: add a tiny glyph map introduced in `data/tab-groups.js` (used when rendering). Keep SVG art; replace the leading deco emoji (e.g., `FEATURE_ICONS` for spiritual cards) with `<i class="fa-solid fa-...">`).

- [ ] **Step 1: Write failing test**

```js
const tabsFa = fs.readFileSync(path.join(root, 'data', 'tab-groups.js'), 'utf8');
test('tab-groups icons render Font Awesome i-tags', () => {
  assert.ok(tabsFa.includes('fa-solid') || tabsFa.includes('fa fa-'));
});
```

Add a test that the spiritual growth icon map uses FA glyphs:

```js
const sp = fs.readFileSync(path.join(root, 'features', 'spiritual-growth', 'data.js'), 'utf8');
test('spiritual growth icon map uses FA glyph', () => {
  assert.ok(sp.includes('fa-solid'));
});
```

- [ ] **Step 2: Run to verify fail**

Run: `node --test` — expected FAIL for FA references.

- [ ] **Step 3: Implement the swap** (edit these):

1. In `data/tab-groups.js` (nav): replace `icon` emoji with `<i>` FA classes (e.g., `icon: '<i class="fa-solid fa-book-open"></i>'`), keeping `label`.
2. In `data/spiritual-growth/data.js` `FEATURE_ICONS`: map each feature to an FA glyph string.
3. In `features/spiritual-growth/*.js` cards (`stage-name` uses `FEATURE_ICONS.<id>`), the FA glyph renders automatically.
4. In `render/render.js` prayer/deed/voluntary cards: swap leading emoji icons for FA `<i>`.

- [ ] **Step 4: Run tests**

Run: `node --test tests/*.test.js` — pass; confirm no regressions in `garden.test`.

- [ ] **Step 5: Commit**

```bash
git add data/tab-groups.js features/spiritual-growth/data.js features/spiritual-growth/*.js render/render.js tests/html.test.js
git commit -m "feat: replace shell-icons with Font Awesome glyphs"
```

---
---

### Task 6: Final Sweep & Verification

**Files:**
- All touched; run tests.

**Interfaces:**
- Consumes: all prior tasks.

- [ ] **Step 1: Write regression test**

Add to `tests/html.test.js`:

```js
test('redesign keeps core markers and PWA meta intact', () => {
  assert.ok(html.includes('rel="manifest"'));
  assert.ok(html.includes('gardenArea'));
  assert.ok(tabs.includes("id: 'journeys'"));
});
```

- [ ] **Step 2: Run full suite**

`node --test tests/*.test.js` — all pass. Run `node --check` on modified JS files.

- [ ] **Step 3: Browser smoke**

Verify: header, level/xp, streak, nav, a Knowledge near page, spiritual growth card on Daily load, finance tab, and no `?` glyph rendering.

- [ ] **Step 4: Commit**

```bash
git add tests/html.test.js
git commit -m "test: verify redesign preserves PWA markers and navigable essentials"
```

---
---

### Task 7: Update Service Worker caches for new assets

**Files:**
- Modify: `sw.js` (cache name), `index.html` (version vars)
- Verify: `tests/sw.test.js`

**Interfaces:**
- Consumes: nothing.

- [ ] **Step 1: Run to see current**

Run: `node --test tests/sw.test.js` — currently passes.

- [ ] **Step 2: If needed, bump `CACHE_NAME`**

In `sw.js` change `CACHE_NAME = 'iq-cache-v2'` → `'iq-cache-v3'`. Update the `?v=` cache-bust params in `index.html` for `styles/main.css` and any other cached assets that changed. The `index.html` document itself is already covered by the CORE path.

- [ ] **Step 3: Verify sw tests pass**

Run: `node --test tests/*.test.js`.

- [ ] **Step 4: Commit**

```bash
git add sw.js tests/sw.test.js index.html
git commit -m "chore: bump service worker cache name for redesign release"
```