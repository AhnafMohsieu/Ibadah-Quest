# Phase 1: Correctness & Data Safety — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix every confirmed Phase-1 bug, make silent user-data loss structurally impossible (quarantine + recovery + validated backups), restore the freshState() schema contract, and auto-activate seasonal events.

**Architecture:** Vanilla JS, no build step. New pure-logic modules `core/recovery.js` and `core/backup.js` are loaded eagerly before their consumers; `data/panel-sections.js` becomes the single source of truth for tab-panel mappings consumed by `render/tabs.js`. Corruption handling hooks into `state/state.js` load paths and defers UI to a recovery overlay owned by `core/actions.js`. All state additions go through `freshState()` per repo rule #2.

**Tech Stack:** Node.js built-in test runner (`node --test`) with `vm.runInNewContext` sandboxes (`tests/helpers/load.js`). No new dependencies.

**Spec:** `docs/superpowers/specs/2026-08-26-improvement-program-design.md`

## Global Constraints

- **COMMITS AUTHORIZED (user ruling 2026-08-26):** per-task commits are explicitly allowed for this execution only, after each task reaches its green-suite checkpoint. Commit ONLY files the task touched (never the pre-existing dirty files `data/hadith-collections.js`, `opencode.json`). Messages follow repo style (`fix:`/`feat:`/`chore:`/`test:`/`docs:` prefixes). Work happens on branch `phase1-correctness-data-safety`.
- Test command is exactly `node --test` from project root (PowerShell 5.1: no `&&`, no `tail`, no glob expansion).
- New state fields go in `freshState()` in `state/state.js` — never lazily ad-hoc.
- Script load order in `index.html` matters; new eager scripts are inserted at the positions given per task.
- Every JS file touched gets `node --check <file>` before its task closes.
- Version-bump discipline for files whose index.html tag has `?v=`: bump the tag, bump `CACHE_NAME` in sw.js once (Task 13), update any pinned version in `tests/html.test.js` (only `content-cache?v=1` and `audio?v=4` are pinned today; none of our files are pinned).
- English-only strings (i18n deferred to Phase 4).
- All 358 existing tests must stay green after every task.

---

### Task 1: Correct the spec's false "dead tab persistence" bug + pin behavior with a regression test

The audit claimed tabs' `if (window.S)` gates are dead because `S` is never assigned to `window.S`. **Disproven**: `state/state.js` loads as a classic script (`index.html:435`), so top-level `var S = null;` creates `window.S`; `core/actions.js` assigns the bare global `S = window.loadState()` which updates it. Persistence works. This task documents reality and pins it so a future refactor (IIFE/module) cannot silently break it.

**Files:**
- Modify: `docs/superpowers/specs/2026-08-26-improvement-program-design.md`
- Create: `tests/tabs-persistence.test.js`

**Interfaces:**
- Produces: test helper pattern `bootBrowserLike()` (vm sandbox where `sandbox.window === sandbox`, mimicking browser global semantics) — reused by later tasks that exercise `window.*` behavior.

- [ ] **Step 1: Write the failing-behavior pinning test**

Create `tests/tabs-persistence.test.js`:

```js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Browser semantics: a classic script's top-level `var` becomes a property of
// window, because window IS the global object. We replicate that by pointing
// sandbox.window at the sandbox itself before evaluation.
function bootBrowserLike(extra) {
  const store = {};
  const sb = {
    console,
    localStorage: {
      getItem: k => (k in store ? store[k] : null),
      setItem: (k, v) => { store[k] = String(v); },
      removeItem: k => { delete store[k]; }
    },
    iqIcon: () => '',
    LEVELS: []
  };
  Object.assign(sb, extra || {});
  sb.window = sb;
  vm.runInNewContext(
    fs.readFileSync(path.join(__dirname, '..', 'state', 'state.js'), 'utf8'),
    sb, { filename: 'state.js' }
  );
  return { sb, store };
}

test('top-level var S creates window.S after boot assignment (browser semantics)', () => {
  const { sb } = bootBrowserLike();
  assert.strictEqual(typeof sb.window.S, 'object'); // null -> typeof is object even pre-boot
  // core/actions.js does exactly this bare assignment inside its IIFE:
  vm.runInNewContext('S = window.loadState();', sb, { filename: 'actions-sim.js' });
  assert.ok(sb.window.S, 'window.S must be truthy after init assignment');
});

test('tabs.js gated persistence writes lastCat through window.S', () => {
  const { sb, store } = bootBrowserLike();
  vm.runInNewContext('S = window.loadState();', sb, { filename: 'actions-sim.js' });
  // Exact code shape used by render/tabs.js switchCategory():
  vm.runInNewContext('if (window.S) { window.S.lastCat = "profile"; window.saveState(); }', sb, { filename: 'tabs-sim.js' });
  const saved = JSON.parse(store['iq9_user_default']);
  assert.strictEqual(saved.lastCat, 'profile', 'lastCat must persist via the window.S gate');
});
```

- [ ] **Step 2: Run the test to verify it passes (pinning current correct behavior)**

Run: `node --test tests/tabs-persistence.test.js`
Expected: 2 pass. If these FAIL, stop — the original bug report was right; re-open the fix design instead of proceeding.

- [ ] **Step 3: Correct the spec document**

In `docs/superpowers/specs/2026-08-26-improvement-program-design.md`, replace the paragraph under "**Confirmed real bugs**" item 1 (starts "1. **Tab persistence never works.**" and ends "restore-last-tab always falls back to defaults.") with:

```markdown
1. ~~Tab persistence dead~~ **DISPROVEN during planning (2026-08-26):** `state/state.js`
   loads as a classic script, so top-level `var S = null` creates `window.S`, and
   actions' bare `S = ...` assignments update it. The `window.S` gates in
   `render/tabs.js` work. Behavior is now pinned by `tests/tabs-persistence.test.js`
   so a future wrapper refactor cannot silently break it.
```

And replace the Phase 1a table row `| Dead tab persistence | ... |` with:

```markdown
| ~~Dead tab persistence~~ (disproven) | No code change. Regression-pinned by `tests/tabs-persistence.test.js`. |
```

Also remove the corresponding bullet from the "Confirmed real bugs" count claims elsewhere if trivially editable; leave historical prose otherwise.

- [ ] **Step 4: Full suite**

Run: `node --test`
Expected: 360 pass (358 + 2 new), 0 fail.

- [ ] **Step 5: Commit (authorized for this execution)**

```bash
git add tests/tabs-persistence.test.js docs/superpowers/specs/2026-08-26-improvement-program-design.md
git commit -m "test: pin window.S tab persistence semantics; correct spec finding 1"
```

Record output. Proceed.

---

### Task 2: Fix duplicate `heartArea` DOM id + add unique-id structural test

Two features target `id="heartArea"`: knowledge pool `renderHeart()` (`render/static.js:141`, target `#panel-heart`, `index.html:190`) and growth widget `renderHeartRefinement()` (`features/spiritual-growth/heart.js:50`, target `#panel-growth`, `index.html:340`). `getElementById` returns the first match, so Heart Refinement renders into the wrong panel and the two renderers clobber each other. Keep `heartArea` for the knowledge pool; rename the growth instance to `growthHeartArea` (matches siblings `growthArea`, `armorArea`).

**Files:**
- Modify: `index.html:340` (panel-growth div)
- Modify: `features/spiritual-growth/heart.js:50`
- Modify: `tests/html.test.js:213-215` (existing armor/heart assertion)
- Test: `tests/html.test.js` (new unique-ids test)

**Interfaces:**
- Consumes: nothing new.
- Produces: unique `id="growthHeartArea"` container in `#panel-growth`; `renderHeartRefinement` writes there. `tests/html.test.js` gains a duplicate-id guard covering ALL ids permanently.

- [ ] **Step 1: Add the failing unique-ids test**

In `tests/html.test.js`, append:

```js
test('index.html has no duplicate element ids', () => {
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
  const dupes = [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];
  assert.deepEqual(dupes, [], 'duplicate ids found: ' + dupes.join(', '));
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `node --test tests/html.test.js`
Expected: FAIL with `duplicate ids found: heartArea`.

- [ ] **Step 3: Rename the growth instance**

`index.html:340` — change inside `#panel-growth`:

```html
<div class="tab-panel" role="tabpanel" id="panel-growth"><div id="growthStatArea"></div><div id="growthCalArea"></div><div id="growthArea"></div><div id="armorArea"></div><div id="heartArea"></div></div>
```

to:

```html
<div class="tab-panel" role="tabpanel" id="panel-growth"><div id="growthStatArea"></div><div id="growthCalArea"></div><div id="growthArea"></div><div id="armorArea"></div><div id="growthHeartArea"></div></div>
```

`features/spiritual-growth/heart.js:50` — change:

```js
    const el = document.getElementById('heartArea');
```

to:

```js
    const el = document.getElementById('growthHeartArea');
```

Then update the existing assertion at `tests/html.test.js:215` from:

```js
  assert.ok(html.includes('id="heartArea"'), 'heartArea missing');
```

to:

```js
  assert.ok(html.includes('id="heartArea"'), 'knowledge heartArea missing');
  assert.ok(html.includes('id="growthHeartArea"'), 'growthHeartArea missing');
  assert.ok((html.match(/id="heartArea"/g) || []).length === 1, 'heartArea must appear exactly once');
```

- [ ] **Step 4: Run html tests to verify pass**

Run: `node --test tests/html.test.js`
Expected: all pass including the new uniqueness test.

- [ ] **Step 5: Grep for stragglers**

Run: `rg -n "getElementById\\('heartArea'\\)" --type js` (or search tool equivalent)
Expected: only `render/static.js` pool renderer references remain. If any other runtime reference to `growthHeartArea`'s old name exists outside docs/, fix it the same way.

- [ ] **Step 6: Syntax check + full suite**

Run: `node --check features/spiritual-growth/heart.js` then `node --test`
Expected: check clean; suite green (361 passing).

---

### Task 3: Declare `profile_main` in data instead of fabricating it at boot

`core/actions.js:387-393` fabricates `TAB_GROUPS.profile_main` inside `initApp()`. Meanwhile deferred `features/spiritual-growth/index.js:80-82` pushes a Growth entry onto it at script-eval time guarded by `if (TAB_GROUPS.profile_main)` — a race: if feature scripts evaluate before `initApp` runs, the group doesn't exist yet and Growth silently never joins the nav. Declaring it in `data/tab-groups.js` (eager, first) removes the race entirely; the spiritual-growth push then always finds the group.

**Files:**
- Modify: `data/tab-groups.js` (add `profile_main`)
- Modify: `core/actions.js` (delete fabrication block, lines ~386-393)
- Create: `tests/tab-groups.test.js`

**Interfaces:**
- Consumes: `TAB_GROUPS` shape used by `render/tabs.js` (flat array of `{id, icon, label}` for uncategorized groups).
- Produces: `TAB_GROUPS.profile_main` guaranteed present at data-load time with ids `profile, trophies, progress, stats, rewards` (in order); `features/spiritual-growth/index.js` push appends `growth` afterward.

- [ ] **Step 1: Write the failing test**

Create `tests/tab-groups.test.js`:

```js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const { loadFile } = require('./helpers/load.js');

function loadGroups() {
  const sb = loadFile(path.join(__dirname, '..', 'data', 'tab-groups.js'), {});
  return sb.window.TAB_GROUPS;
}

test('profile_main group is declared in data with the five core entries in order', () => {
  const g = loadGroups();
  assert.ok(Array.isArray(g.profile_main), 'profile_main must exist in data/tab-groups.js');
  assert.deepEqual(
    g.profile_main.map(t => t.id),
    ['profile', 'trophies', 'progress', 'stats', 'rewards']
  );
  g.profile_main.forEach(t => {
    assert.ok(t.label && t.icon, 'each entry needs icon+label: ' + JSON.stringify(t));
  });
});

test('every profile_main tab id has a matching panel in index.html', () => {
  const fs = require('fs');
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const g = loadGroups();
  g.profile_main.forEach(t => {
    assert.ok(html.includes(`id="panel-${t.id}"`), `missing panel-${t.id}`);
  });
});
```

Note: the second test intentionally fails until Task 4 guarantees nothing? No — `panel-profile`, `panel-trophies`, etc. already exist in index.html, so this passes immediately; it guards future drift. Only test 1 drives the change.

- [ ] **Step 2: Run to verify failure**

Run: `node --test tests/tab-groups.test.js`
Expected: FAIL — `profile_main must exist in data/tab-groups.js`.

- [ ] **Step 3: Move the declaration**

In `data/tab-groups.js`, insert after the `names_main` block (before the `library` comment):

```js
  profile_main: [
    { id: 'profile', icon: 'user', label: 'Profile' },
    { id: 'trophies', icon: 'trophy', label: 'Trophies' },
    { id: 'progress', icon: 'bar-chart-3', label: 'Progress' },
    { id: 'stats', icon: 'trending-up', label: 'Analytics' },
    { id: 'rewards', icon: 'gift', label: 'Rewards' }
  ],
```

In `core/actions.js`, delete the fabricated block (keep the surrounding statements):

```js
  // Profile as main tab
  TAB_GROUPS.profile_main = [
    { id: 'profile', icon: 'user', label: 'Profile' },
    { id: 'trophies', icon: 'trophy', label: 'Trophies' },
    { id: 'progress', icon: 'bar-chart-3', label: 'Progress' },
    { id: 'stats', icon: 'trending-up', label: 'Analytics' },
    { id: 'rewards', icon: 'gift', label: 'Rewards' }
  ];
```

Leave `features/spiritual-growth/index.js:80-82` untouched — its guarded push now always succeeds.

- [ ] **Step 4: Run to verify pass**

Run: `node --test tests/tab-groups.test.js`
Expected: 2 pass.

- [ ] **Step 5: Syntax checks + full suite**

Run: `node --check data/tab-groups.js`; `node --check core/actions.js`; then `node --test`
Expected: green (363 passing).

---

### Task 4: Single source of truth for panel sections (`data/panel-sections.js`)

`render/tabs.js` encodes panel→section mappings TWICE: `getSectionPanels()` (lines 93-113) and an inline `panelLookup` literal inside `activateTab` (line 125). They diverge (e.g., `knowledge_creed` and `knowledge_history` exist ONLY in the lookup; `home` lists differ), so section-scoped hiding silently degrades to global clears. Extract one canonical map into a data file (repo pattern: eager `data/*.js`), merge both definitions as union with lookup-first precedence for conflicts, and make both consumers read it.

Canonical merged map (verbatim — this IS the deliverable):

```js
window.PANEL_SECTIONS = {
  home: ['panel-today','panel-timer','panel-journeys','panel-morning','panel-evening','panel-dhikr','panel-duas','panel-quran','panel-wudu','panel-jumuah','panel-salah','panel-fasting','panel-healthlog','panel-finance','panel-situational','panel-tafsir','panel-sunnahs','panel-extradeeds','panel-volprayers','panel-zakatcalc','panel-memorization','panel-gratitude','panel-charity'],
  quests: ['panel-quests'],
  stats: ['panel-stats'],
  growth: ['panel-progress','panel-growth'],
  profile: ['panel-profile','panel-trophies','panel-rewards','panel-goals','panel-allah_names','panel-prophets','panel-scholars_names','panel-sahaba','panel-women'],
  knowledge_quran: ['panel-quran','panel-hadith','panel-tafsir','panel-seerah'],
  knowledge_fiqh: ['panel-fiqh','panel-purification','panel-salahrules','panel-zakatrules','panel-sawmrules','panel-hajjrules','panel-trade','panel-inheritance','panel-oaths'],
  knowledge_creed: ['panel-aqeedah','panel-arabic'],
  knowledge_heart: ['panel-aqeedah','panel-heart','panel-ikhlas','panel-tawakkul','panel-manners','panel-patience','panel-sins','panel-repentance','panel-zuhd','panel-inspirations','panel-stories','panel-sufism','panel-tazkiyah','panel-fear','panel-hope','panel-loveofallah','panel-contentment','panel-reflection','panel-dreams'],
  knowledge_society: ['panel-family','panel-marriage','panel-parenting','panel-work','panel-neighbors','panel-community','panel-ummah','panel-dawah','panel-punishments','panel-brotherhood','panel-sisterhood','panel-orphans2','panel-elderly','panel-disabled','panel-antiracism','panel-poverty','panel-volunteering'],
  knowledge_life: ['panel-health','panel-tibb','panel-food','panel-environment','panel-travel','panel-youth','panel-tech','panel-technology','panel-socialmedia','panel-ethics','panel-bioethics','panel-modfinance','panel-politics','panel-green','panel-mentalhealth','panel-education','panel-science'],
  knowledge_history: ['panel-seerah','panel-sahaba','panel-prophets','panel-women','panel-stories','panel-civilisation','panel-science','panel-battles'],
  knowledge_hereafter: ['panel-akhirah','panel-jannah','panel-jahannam','panel-grave','panel-signs'],
  library_dynasties: ['panel-umayyads','panel-abbasids','panel-andalus','panel-ottomans','panel-mamluks','panel-seljuks','panel-fatimids','panel-ayyubids','panel-modernhist','panel-ancientprophets','panel-battles','panel-civilisation'],
  library_cities: ['panel-mecca','panel-medina','panel-jerusalem','panel-damascus','panel-baghdad','panel-cairo','panel-cordoba','panel-istanbul','panel-bukhara','panel-samarkand'],
  library_arts: ['panel-calligraphy','panel-architecture','panel-geometry','panel-poetryart','panel-literature','panel-nasheeds','panel-illumination','panel-textiles','panel-ceramics','panel-woodwork'],
  library_arabic: ['panel-arabic','panel-arabicgrammar','panel-vocab','panel-rhetoric','panel-morphology','panel-pronunciation','panel-poetry','panel-proverbs','panel-etymology','panel-dialects','panel-scripts'],
  library_philosophy: ['panel-epistemology','panel-ontology','panel-logic','panel-kalam','panel-reason','panel-freewill','panel-problemofevil','panel-prophethood','panel-existence']
};
```

**Files:**
- Create: `data/panel-sections.js` (content above, wrapped in an IIFE like other data files)
- Modify: `index.html` (script tag after `tab-groups.js`)
- Modify: `render/tabs.js` (delete both literals; consume `window.PANEL_SECTIONS`)
- Create: `tests/panel-sections.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces: `window.PANEL_SECTIONS` — `Object<string, string[]>` mapping section name → panel-id list; `window.getSectionPanels(name)` returns `PANEL_SECTIONS[name] || null`. Later phases rely on this being the only mapping.

- [ ] **Step 1: Create the failing test**

Create `tests/panel-sections.test.js`:

```js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { loadFile } = require('./helpers/load.js');

const ROOT = path.join(__dirname, '..');

function loadSections() {
  return loadFile(path.join(ROOT, 'data', 'panel-sections.js'), {}).window.PANEL_SECTIONS;
}

test('PANEL_SECTIONS covers every section incl. ones only activateTab knew about', () => {
  const s = loadSections();
  for (const key of ['home','quests','stats','growth','profile','knowledge_quran','knowledge_fiqh',
                     'knowledge_creed','knowledge_heart','knowledge_society','knowledge_life',
                     'knowledge_history','knowledge_hereafter','library_dynasties','library_cities',
                     'library_arts','library_arabic','library_philosophy']) {
    assert.ok(Array.isArray(s[key]) && s[key].length > 0, 'missing section: ' + key);
  }
});

test('every listed panel id exists in index.html', () => {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const s = loadSections();
  const missing = [];
  for (const key of Object.keys(s)) {
    for (const p of s[key]) {
      if (!html.includes(`id="${p}"`)) missing.push(key + ':' + p);
    }
  }
  assert.deepEqual(missing, [], 'panels referenced but not in index.html: ' + missing.join(', '));
});

test('tabs.js consumes PANEL_SECTIONS and no second literal map remains', () => {
  const src = fs.readFileSync(path.join(ROOT, 'render', 'tabs.js'), 'utf8');
  assert.ok(src.includes('PANEL_SECTIONS'), 'tabs.js must use PANEL_SECTIONS');
  assert.ok(!/var\s+panelLookup/.test(src), 'inline panelLookup literal must be deleted');
  assert.ok(!/var sections = \{/.test(src), 'local sections literal must be deleted');
});
```

- [ ] **Step 2: Run to verify failures**

Run: `node --test tests/panel-sections.test.js`
Expected: FAIL — module file missing (first test throws on undefined `PANEL_SECTIONS`), third test fails on `panelLookup`.

- [ ] **Step 3: Create `data/panel-sections.js`**

```js
(function() {
  // Single source of truth: which panels belong to which nav section.
  // Consumed by render/tabs.js getSectionPanels() and activateTab().
  window.PANEL_SECTIONS = {
    // ... exact map from this task's preamble ...
  };
})();
```

(Use the verbatim map from the preamble — do not abbreviate.)

In `index.html`, directly after `<script src="data/tab-groups.js?v=8"></script>` (bumped in Task 13; today it reads `?v=7` — insert after whatever currently renders) add:

```html
<script src="data/panel-sections.js?v=1"></script>
```

- [ ] **Step 4: Rewire `render/tabs.js`**

Replace the body of `getSectionPanels` (lines 93-113) with:

```js
  function getSectionPanels(sectionName) {
    var sections = (typeof window !== 'undefined' && window.PANEL_SECTIONS) || {};
    return sections[sectionName] || null;
  }
```

In `activateTab`, delete the entire `var panelLookup = {...};` statement (line 125) and replace the lookup loop (lines 126-128):

```js
    var sectionName = null;
    var sections = (typeof window !== 'undefined' && window.PANEL_SECTIONS) || {};
    var target = 'panel-' + tabId;
    for (var sec in sections) {
      if (sections[sec].indexOf(target) > -1) { sectionName = sec; break; }
    }
    var sectionPanels = sectionName ? getSectionPanels(sectionName) : null;
```

(The subsequent hide/show logic below it stays untouched.)

- [ ] **Step 5: Verify pass + suite**

Run: `node --check render/tabs.js`; `node --check data/panel-sections.js`; `node --test tests/panel-sections.test.js`; `node --test`
Expected: all green (366 passing).

- [ ] **Step 6: Manual smoke (browser)**

Open app, click through Home → a Knowledge sub-tab → Profile. Panels switch correctly, no console errors. (Section-scoped clearing now hides MORE stale panels than before on `home` — intended.)

---

### Task 5: Restore the freshState schema contract (18 ad-hoc fields + orphan)

AGENTS.md rule #2 requires every state field in `freshState()`. These are created lazily today, so `normalizeState` never backfills them for existing users. Defaults MUST match each feature's own lazy-init expression exactly (grep-verified during Step 2).

**Files:**
- Modify: `state/state.js` (freshState)
- Create: `tests/schema-contract.test.js`
- Bump later in Task 13: `state/state.js?v=6` → `v=7`

**Interfaces:**
- Produces (defaults, exact shapes):
  - `personalGoals: []`
  - `seasonal: {active:null, ramadanQuests:[], hajjDays:0, eidRewards:[], arafahDone:false}`
  - `xpDaily: {}`
  - `combos: {}`
  - `milestones: []`
  - `achievementShowcase: []`
  - `dailyRatings: {}`, `dailyReflections: {}`
  - `lastDailyRitual: null`, `lastDailySummary: null`, `lastWeeklySummary: null`, `lastWeeklyConsistency: null`
  - `healthXpClaimed: {}`
  - `ownedTitles: []`, `activeTitle: null`, `ownedFrames: []`, `activeFrame: null`
  - `lastAllPrayersSurprise: null`
  - `dhikrSettings: {haptic:true}`
  - `lastActiveDate: null` (orphan declared; consolidated in Task 7)

- [ ] **Step 1: Verify defaults against real usage (no guessing)**

Search each field's lazy-init site and confirm shape; adjust the table above if reality differs:
`rg -n "personalGoals\\s*=|seasonal\\s*=|xpDaily\\s*=|combos\\s*=|milestones\\s*=|achievementShowcase\\s*=|dailyRatings\\s*=|dailyReflections\\s*=|lastDailyRitual\\s*=|lastDailySummary\\s*=|lastWeeklySummary\\s*=|lastWeeklyConsistency\\s*=|healthXpClaimed\\s*=|ownedTitles\\s*=|activeTitle\\s*=|ownedFrames\\s*=|activeFrame\\s*=|lastAllPrayersSurprise\\s*=|dhikrSettings\\s*=" --type js -g '!tests/**'`
If a discovered default differs from the table (e.g., array vs object), adopt the CODE's default in Steps 2-3 and note it.

- [ ] **Step 2: Write the failing test**

Create `tests/schema-contract.test.js`:

```js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const { loadFile } = require('./helpers/load.js');

function loadStateModule(store) {
  return loadFile(path.join(__dirname, '..', 'state', 'state.js'), { localStorage: store });
}
function makeStore(initial) {
  const store = Object.assign({}, initial);
  return {
    getItem: k => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: k => { delete store[k]; }
  };
}

const EXPECTED = {
  personalGoals: [],
  seasonal: { active: null, ramadanQuests: [], hajjDays: 0, eidRewards: [], arafahDone: false },
  xpDaily: {},
  combos: {},
  milestones: [],
  achievementShowcase: [],
  dailyRatings: {},
  dailyReflections: {},
  lastDailyRitual: null,
  lastDailySummary: null,
  lastWeeklySummary: null,
  lastWeeklyConsistency: null,
  healthXpClaimed: {},
  ownedTitles: [],
  activeTitle: null,
  ownedFrames: [],
  activeFrame: null,
  lastAllPrayersSurprise: null,
  dhikrSettings: { haptic: true },
  lastActiveDate: null
};

test('freshState declares every formerly-ad-hoc field', () => {
  const sb = loadStateModule(makeStore({}));
  const f = sb.window.freshState();
  for (const [k, v] of Object.entries(EXPECTED)) {
    assert.deepStrictEqual(f[k], v, 'field ' + k);
  }
});

test('normalizeState backfills all of them into legacy saves', () => {
  const legacy = JSON.stringify({
    log: { '2026-01-01': { p: {}, d: {}, v: {} } }, xp: 250, lv: 2, td: {}, vc: {}
  });
  const store = makeStore({ iq9_user_default: legacy });
  const sb = loadStateModule(store);
  const p = sb.window.loadState();
  for (const [k, v] of Object.entries(EXPECTED)) {
    assert.deepStrictEqual(p[k], v, 'backfilled ' + k);
  }
  assert.strictEqual(p.xp, 250, 'legacy data preserved');
});

test('backfill preserves existing user values (no clobber)', () => {
  const legacy = JSON.stringify({
    log: {}, xp: 10, td: {}, vc: {},
    ownedTitles: ['title_a'], activeTitle: 'title_a',
    dhikrSettings: { haptic: false },
    seasonal: { active: 'ramadan', ramadanQuests: [], hajjDays: 3, eidRewards: [], arafahDone: true }
  });
  const sb = loadStateModule(makeStore({ iq9_user_default: legacy }));
  const p = sb.window.loadState();
  assert.deepStrictEqual(p.ownedTitles, ['title_a']);
  assert.strictEqual(p.activeTitle, 'title_a');
  assert.deepStrictEqual(p.dhikrSettings, { haptic: false }, 'user pref must win over default');
  assert.strictEqual(p.seasonal.active, 'ramadan');
  assert.strictEqual(p.seasonal.hajjDays, 3);
});
```

- [ ] **Step 3: Run to verify failure**

Run: `node --test tests/schema-contract.test.js`
Expected: FAIL on first missing field (`personalGoals` → `undefined`).

- [ ] **Step 4: Implement — add fields to `freshState()`**

In `state/state.js`, inside the returned object, immediately before the `schemaVersion:` line (currently line 46), insert:

```js
      personalGoals:[],
      seasonal:{active:null,ramadanQuests:[],hajjDays:0,eidRewards:[],arafahDone:false},
      xpDaily:{}, combos:{}, milestones:[], achievementShowcase:[],
      dailyRatings:{}, dailyReflections:{},
      lastDailyRitual:null, lastDailySummary:null, lastWeeklySummary:null, lastWeeklyConsistency:null,
      healthXpClaimed:{}, ownedTitles:[], activeTitle:null, ownedFrames:[], activeFrame:null,
      lastAllPrayersSurprise:null, dhikrSettings:{haptic:true}, lastActiveDate:null,
```

No `normalizeState` changes needed — its generic loop (`for k of Object.keys(d) if (!(k in p)) p[k] = d[k]`) backfills automatically. Note `dhikrSettings` backfill is shallow (a legacy partial `{}` object wins over `{haptic:true}`); Task 6 handles reading defensively.

- [ ] **Step 5: Verify pass + sweep for regressions**

Run: `node --check state/state.js`; `node --test`
Expected: green (369 passing). If seasonal/dhikr/consistency/shop tests fail because they asserted `undefined` defaults, update those assertions to the declared defaults — that IS the contract change.

- [ ] **Step 6: Delete now-redundant lazy guards (behavior-preserving cleanup)**

These guards become dead but harmless; remove ONLY where trivially safe, keeping diffs small:
- `features/seasonal-events.js:21` — `S.seasonal = S.seasonal || {...}` may remain (defensive); skip removal if any doubt.
- Leave all others; broad lazy-guard deletion is Phase 2 scope. Record decision.

---

### Task 6: Wire the ghost `dhikrSettings.haptic` setting end-to-end

`core/dhikr.js:37,43` read `S.dhikrSettings?.haptic` but nothing ever wrote it — haptics were silently OFF forever. Default is now `true` (Task 5). Add a visible toggle in the dhikr counter card and expose the flip through the facade.

**Files:**
- Modify: `core/dhikr.js` (add `toggleDhikrHaptic`)
- Modify: `render/static.js` (`renderDhikrCounter` button row, lines ~238-241)
- Modify: `core/actions.js` (`window.App` facade)
- Modify: existing registry test if it pins exact App key sets (check first)
- Bump later: `core/dhikr.js?v=2` → `v=3`

**Interfaces:**
- Produces: `window.toggleDhikrHaptic()` — flips `S.dhikrSettings.haptic`, saves, re-renders counter; `App.toggleDhikrHaptic` same. Button shows vibration icon ON/OFF state from `S.dhikrSettings?.haptic`.

- [ ] **Step 1: Check the registry test**

Read `tests/app-registry.test.js`. If it asserts an EXACT key set on `App`, note the keys list — you must add `toggleDhikHaptic` there too (exact name: `toggleDhikrHaptic`). If it only asserts presence of specific keys, no change needed.

- [ ] **Step 2: Write the failing test**

Append to `tests/dhikr.test.js` (reuse its existing sandbox harness — read the top of the file first and mirror how `S`, `saveState`, `renderDhikrCounter` are stubbed):

```js
test('toggleDhikrHaptic flips S.dhikrSettings.haptic and persists', () => {
  // arrange using the file's existing harness; minimal shape shown:
  // sandbox exposes toggleDhikrHaptic with S.dhikrSettings = { haptic: true }
  let savedCalls = 0;
  const sb = loadFile(path.join(__dirname, '..', 'core', 'dhikr.js'), {
    S: { dhikrSettings: { haptic: true }, dhikrCounters: {}, dhikrStats: {}, dhikrSessions: [], xp: 0, lv: 1 },
    saveState: () => { savedCalls++; },
    renderDhikrCounter: () => {},
    navigator: {}
  });
  sb.window.toggleDhikrHaptic();
  assert.strictEqual(sb.S.dhikrSettings.haptic, false);
  assert.strictEqual(savedCalls, 1);
  sb.window.toggleDhikrHaptic();
  assert.strictEqual(sb.S.dhikrSettings.haptic, true);
});
```

Adapt constructor args to the file's real harness (its existing tests fabricate `dhikrSettings: {}` already at line 14 — copy that setup style).

- [ ] **Step 3: Run to verify failure**

Run: `node --test tests/dhikr.test.js`
Expected: FAIL — `sb.window.toggleDhikrHaptic is not a function`.

- [ ] **Step 4: Implement**

In `core/dhikr.js`, next to `resetDhikr` (after line 75):

```js
  function toggleDhikrHaptic() {
    if (!S.dhikrSettings || typeof S.dhikrSettings !== 'object') S.dhikrSettings = {};
    S.dhikrSettings.haptic = !S.dhikrSettings.haptic;
    saveState();
    renderDhikrCounter();
  }
```

And export beside the other exports (near line 115):

```js
  window.toggleDhikrHaptic = toggleDhikrHaptic;
```

Harden the two read sites (lines 37, 43) against legacy partial objects — change:

```js
    if (S.dhikrSettings?.haptic && navigator.vibrate) { navigator.vibrate(10); }
```

to:

```js
    if (S.dhikrSettings && S.dhikrSettings.haptic && navigator.vibrate) { navigator.vibrate(10); }
```

(and identically at line 43 with the `[50,50,50]` pattern.)

In `render/static.js` button row (lines 238-241), add a third button:

```js
        <div style="margin-top:12px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
          <button class="dhikr-reset-btn" onclick="App.resetDhikr()">${iqIcon('refresh-cw')} Reset</button>
          <button class="dhikr-reset-btn" onclick="App.nextDhikr()">Next ▶</button>
          <button class="dhikr-reset-btn" onclick="App.toggleDhikrHaptic()" aria-pressed="${!!(S.dhikrSettings && S.dhikrSettings.haptic)}">${iqIcon('zap')} Vibration ${S.dhikrSettings && S.dhikrSettings.haptic ? 'On' : 'Off'}</button>
        </div>
```

In `core/actions.js` facade (inside `window.App = {`), add after the `tapDhikr:` entry (line 520 area):

```js
      toggleDhikrHaptic: appAction('toggleDhikrHaptic'),
```

(`appAction` helper is defined above the facade at line 489.)

Update `tests/app-registry.test.js` per Step 1 findings.

- [ ] **Step 5: Verify**

Run: `node --check core/dhikr.js`; `node --check render/static.js`; `node --check core/actions.js`; `node --test tests/dhikr.test.js`; `node --test`
Expected: green.

- [ ] **Step 6: Manual smoke**

Browser: Dhikr tab → Vibration On/Off toggles label + `aria-pressed`; reload keeps state (localStorage). On a real phone, taps buzz when On.

---

### Task 7: Consolidate `lad` vs `lastActiveDate` without killing comeback bonuses

`initApp` rolls `S.lad` forward at boot (`actions.js:396`); `checkConsistency` (deferred feature) separately tracks `S.lastActiveDate` and pays comeback XP off it. Naively switching it to `S.lad` kills bonuses: by the time the deferred feature runs, `lad` is ALREADY today. Design: capture previous `lad` BEFORE the rollover, hand it to the feature explicitly; persist only `lad`.

**Files:**
- Modify: `state/state.js` (`normalizeState` migration)
- Modify: `core/actions.js` (capture prev; call consistency from post-defer hook)
- Modify: `features/consistency-bonuses.js` (consume `_iqPrevLad`; drop orphan field)
- Modify: `tests/consistency.test.js` (fixtures move to `lad` + explicit prev injection)
- Create: `tests/lad-migration.test.js`

**Interfaces:**
- Consumes: `S.lad` (existing freshState field).
- Produces: `window._iqPrevLad` (string|null, transient — set by boot before rollover, consumed+cleared by checkConsistency). `checkConsistency()` signature unchanged.

- [ ] **Step 1: Write failing migration test**

Create `tests/lad-migration.test.js`:

```js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const { loadFile } = require('./helpers/load.js');

function loadWith(raw) {
  const store = {
    getItem: k => (k === 'iq9_user_default' ? raw : null),
    setItem: () => {}, removeItem: () => {}
  };
  return loadFile(path.join(__dirname, '..', 'state', 'state.js'), { localStorage: store });
}

test('legacy lastActiveDate newer than lad migrates into lad and is deleted', () => {
  const legacy = JSON.stringify({
    log: {}, td: {}, vc: {},
    lad: '2026-08-01', lastActiveDate: '2026-08-20'
  });
  const sb = loadWith(legacy);
  const p = sb.window.loadState();
  assert.strictEqual(p.lad, '2026-08-20');
  assert.strictEqual(p.lastActiveDate, undefined);
});

test('stale lastActiveDate does NOT overwrite fresher lad', () => {
  const legacy = JSON.stringify({
    log: {}, td: {}, vc: {},
    lad: '2026-08-25', lastActiveDate: '2026-07-01'
  });
  const sb = loadWith(legacy);
  const p = sb.window.loadState();
  assert.strictEqual(p.lad, '2026-08-25');
  assert.strictEqual(p.lastActiveDate, undefined);
});
```

- [ ] **Step 2: Run to verify failure**

Run: `node --test tests/lad-migration.test.js`
Expected: FAIL — `lastActiveDate` still present / `lad` unmigrated.

- [ ] **Step 3: Implement migration in `normalizeState`**

In `state/state.js` `normalizeState`, after the growthSettings merge block (line 71) and before the `typeof p.log !== 'object'` guard, insert:

```js
    if (p.lastActiveDate && typeof p.lastActiveDate === 'string') {
      if (!p.lad || p.lastActiveDate > p.lad) p.lad = p.lastActiveDate;
      delete p.lastActiveDate;
    }
```

(ISO dates compare correctly as strings.)

- [ ] **Step 4: Rework consistency-bonuses to single-field + injected prev**

Rewrite the top of `features/consistency-bonuses.js` `checkConsistency`:

```js
  function checkConsistency() {
    const t = today();
    // Boot captures yesterday's lad BEFORE rolling it forward; we consume it here.
    // Fall back to S.lad when boot didn't capture (direct calls, older flows).
    const last = (typeof window !== 'undefined' && window._iqPrevLad) || S.lad;
    if (typeof window !== 'undefined') window._iqPrevLad = null;

    // Comeback bonus — compares the captured previous day against today.
    if (last && last !== t) {
      const lastDate = new Date(last + 'T00:00:00');
      const todayDate = new Date(t + 'T00:00:00');
      const diffDays = Math.round((todayDate - lastDate) / 86400000);

      if (diffDays === 1) {
        S.xp += 50;
        S.lv = lvFrom(S.xp);
        toast(iqIcon('arrow-left'), 'Comeback Bonus: +50 XP!');
        saveState();
      } else if (diffDays > 1) {
        S.xp += 100;
        S.lv = lvFrom(S.xp);
        toast(iqIcon('arrow-left'), 'Welcome Back! +100 XP!');
        saveState();
      }
    }

    // Single canonical field from here on (declared in freshState).
    S.lad = t;
  }
```

Delete the old `S.lastActiveDate = t;` write. `checkWeeklyConsistency` keeps using its own `lastWeeklyConsistency` (now schema-declared) — unchanged otherwise.

- [ ] **Step 5: Capture prev + re-time invocation in `actions.js`**

In `initApp`, replace line 396's rollover block:

```js
    const t = today();
    if (S.lad !== t) { S.lad=t; if(S.ab&&S.ab.exp<t) S.ab=null; if (typeof window.recalc === 'function') window.recalc(); saveState(); }
```

with:

```js
    const t = today();
    if (S.lad !== t) {
      window._iqPrevLad = S.lad;
      S.lad = t;
      if (S.ab && S.ab.exp < t) S.ab = null;
      if (typeof window.recalc === 'function') window.recalc();
      saveState();
    }
```

Then extend the existing post-defer `DOMContentLoaded` hook (lines 476-479) to also run consistency AFTER features exist:

```js
      document.addEventListener('DOMContentLoaded', function() {
        try { if (window.renderAll) window.renderAll(); } catch(e) { console.error('Post-defer re-render failed:', e); }
        try { if (window.autoTrackJourneyProgress) window.autoTrackJourneyProgress(); } catch(e) { console.error('Post-defer journey tracking failed:', e); }
        try { if (window.checkConsistency) window.checkConsistency(); } catch(e) { console.error('Post-defer consistency check failed:', e); }
      });
```

And DELETE the old early invocations at lines 431-432:

```js
    if (window.checkConsistency) window.checkConsistency();
    if (window.checkWeeklyConsistency) window.checkWeeklyConsistency();
```

replacing them (same spot) with weekly-only — weekly has no lad dependency:

```js
    if (window.checkWeeklyConsistency) window.checkWeeklyConsistency();
```

Wait — `checkWeeklyConsistency` is ALSO a deferred feature, so at `initApp` time it may not exist either; the original code had the same latent gap and worked by accident or not at all. Correct home for BOTH is the post-defer hook. Final hook:

```js
        try { if (window.checkConsistency) window.checkConsistency(); } catch(e) { console.error('Post-defer consistency check failed:', e); }
        try { if (window.checkWeeklyConsistency) window.checkWeeklyConsistency(); } catch(e) { console.error('Post-defer weekly consistency failed:', e); }
```

and lines 431-432 are simply deleted.

- [ ] **Step 6: Update `tests/consistency.test.js` fixtures**

Every fixture fabricating `lastActiveDate` moves to `lad`, and each test injects the prior value via `window._iqPrevLad` before calling `checkConsistency`, e.g. (mirror existing harness):

```js
  sandbox.window._iqPrevLad = '2026-08-10';   // was: S.lastActiveDate = '2026-08-10'
  sandbox.checkConsistency();
  assert.strictEqual(sandbox.S.lad, todayStr); // was: S.lastActiveDate === ...
```

Rename the final assertion test ('lastActiveDate is updated...') to assert `S.lad`. Also assert `window._iqPrevLad === null` after the call (consumed-once semantics).

- [ ] **Step 7: Verify everything**

Run: `node --check state/state.js`; `node --check core/actions.js`; `node --check features/consistency-bonuses.js`; `node --test tests/lad-migration.test.js tests/consistency.test.js`; `node --test`
Expected: green.

---

### Task 8: Auto-activate seasonal events by Hijri date

`activateSeason()` exists but nothing date-driven ever calls it; `S.seasonal.active` only changes via console. Use the app's own pure `window.gregorianToHijri` (`render/calendar.js:12`, exported line 110). Ramadan = Hijri month 9; Hajj season = Hijri month 12 days 1-10 (Arafah+Eid window). Idempotent sync runs at every boot; transitions toast naturally via existing `activateSeason`/`deactivateSeason`.

**Files:**
- Modify: `features/seasonal-events.js` (add `seasonForDate`, `syncSeason`)
- Modify: `core/actions.js` (`initApp` wiring)
- Modify: `tests/seasonal.test.js` (extend)
- Bump later: none (file has no `?v=` param)

**Interfaces:**
- Consumes: `window.gregorianToHijri(gY,gM,gD)` → `{year,month,day}`; `S.seasonal` (Task 5 default).
- Produces: `window.seasonForDate(dateObj)` → `'ramadan'|'hajj'|null` (pure); `window.syncSeason(todayStr)` → idempotent activation/deactivation + save.

- [ ] **Step 1: Write the failing tests**

Append to `tests/seasonal.test.js` (mirror its existing harness for building the sandbox — it already constructs `activateSeason` sandboxes around line 40):

```js
test('seasonForDate maps Ramadan/Dhul-Hijjah via Hijri math and null otherwise', () => {
  // Derive Gregorian anchors from the same algorithm as render/calendar.js so
  // this test validates season ROUTING, not calendar arithmetic.
  function hijriToGregorianLocal(hY, hM, hD) {
    const jd = Math.floor((11 * hY + 3) / 30) + 354 * hY + 30 * hM -
               Math.floor((hM - 1) / 2) + hD + 1948440 - 385;
    const l = jd + 68569;
    const n = Math.floor((4 * l) / 146097);
    const remainder = l - Math.floor((146097 * n + 3) / 4);
    const i = Math.floor((4000 * (remainder + 1)) / 1461001);
    const remainderI = remainder - Math.floor((1461 * i) / 4) + 31;
    const j = Math.floor((80 * remainderI) / 2447);
    const gD = remainderI - Math.floor((2447 * j) / 80);
    const remainderJ2 = Math.floor(j / 11);
    const gM = remainderJ2 + 2 - 12 * Math.floor(remainderJ2 / 11);
    const gY = 100 * (n - 49) + i + Math.floor(remainderJ2 / 11) - Math.floor(gM / 10);
    return { y: gY, m: gM, d: gD };
  }

  const ram1 = hijriToGregorianLocal(1445, 9, 1);
  assert.strictEqual(
    sb.window.seasonForDate(new Date(ram1.y, ram1.m - 1, ram1.d)), 'ramadan');

  const dhi9 = hijriToGregorianLocal(1445, 12, 9);
  assert.strictEqual(
    sb.window.seasonForDate(new Date(dhi9.y, dhi9.m - 1, dhi9.d)), 'hajj');

  const shw15 = hijriToGregorianLocal(1445, 10, 15);
  assert.strictEqual(
    sb.window.seasonForDate(new Date(shw15.y, shw15.m - 1, shw15.d)), null);
});

test('syncSeason activates on range entry, is idempotent, deactivates on exit', () => {
  // Harness with controllable clock: syncSeason takes an ISO string, so feed
  // fixed dates. Stub gregorianToHijri deterministically.
  let saved = 0;
  const sbx = buildSeasonalSandbox({ // reuse/adapt this file's existing builder
    gregorianToHijri: (y, m, d) => (m === 3 && d <= 10) ? { year: 1445, month: 9, day: d } :
                            (m === 6 && d <= 10) ? { year: 1445, month: 12, day: d } :
                            { year: 1445, month: 7, day: d }
  });
  sbx.saveState = () => { saved++; };
  sbx.window.saveState = sbx.saveState;

  sbx.window.syncSeason('2026-03-01');
  assert.strictEqual(sbx.S.seasonal.active, 'ramadan');
  const afterActivate = saved;

  sbx.window.syncSeason('2026-03-05');            // same season again
  assert.strictEqual(sbx.S.seasonal.active, 'ramadan');
  assert.strictEqual(saved, afterActivate, 'idempotent: no extra transition work');

  sbx.window.syncSeason('2026-06-02');            // ramadan -> hajj
  assert.strictEqual(sbx.S.seasonal.active, 'hajj');

  sbx.window.syncSeason('2026-07-15');            // off-season
  assert.strictEqual(sbx.S.seasonal.active, null);
});
```

IMPORTANT adaptation notes (do mechanically while editing):
- This file's existing harness builds a sandbox exposing `activateSeason` etc.; reuse THAT builder. Where my snippet names `buildSeasonalSandbox(...)`, substitute the real builder + inject the stubbed `gregorianToHijri` into its `window` override, plus `toast: () => {}` and `renderSeasonalBanner: () => {}`.
- `syncSeason` must accept `'YYYY-MM-DD'` strings (boot feeds `today()`), constructing `new Date(s + 'T00:00:00')`.

- [ ] **Step 2: Run to verify failure**

Run: `node --test tests/seasonal.test.js`
Expected: FAIL — `seasonForDate`/`syncSeason` not functions.

- [ ] **Step 3: Implement in `features/seasonal-events.js`**

Add after `deactivateSeason` (line 32):

```js
  function seasonForDate(d) {
    if (!(d instanceof Date) || isNaN(d)) return null;
    var h = (typeof window !== 'undefined' && window.gregorianToHijri)
      ? window.gregorianToHijri(d.getFullYear(), d.getMonth() + 1, d.getDate())
      : null;
    if (!h) return null;
    if (h.month === 9) return 'ramadan';
    if (h.month === 12 && h.day <= 10) return 'hajj';
    return null;
  }

  function syncSeason(dateStr) {
    if (!dateStr) return;
    var target = seasonForDate(new Date(dateStr + 'T00:00:00'));
    var cur = S.seasonal && S.seasonal.active ? S.seasonal.active : null;
    if (target === cur) return;
    if (target) activateSeason(target);
    else deactivateSeason();
  }
```

Exports (bottom block):

```js
  window.seasonForDate = seasonForDate;
  window.syncSeason = syncSeason;
```

- [ ] **Step 4: Wire boot**

`core/actions.js` `initApp`, immediately after the rollover block from Task 7:

```js
    try { if (typeof window.syncSeason === 'function') window.syncSeason(t); } catch(e) { console.warn('seasonal sync failed:', e); }
```

(Runs every boot; midnight rollovers coincide with the next boot's `lad` change, and idempotency makes repeats free.)

- [ ] **Step 5: Verify**

Run: `node --check features/seasonal-events.js`; `node --check core/actions.js`; `node --test tests/seasonal.test.js`; `node --test`
Expected: green.

- [ ] **Step 6: Manual smoke**

Browser console: `syncSeason('2026-03-01')` → banner + toast; reload → banner persists without duplicate toast; `syncSeason('2026-07-01')` → cleared.

---

### Task 9: `core/recovery.js` — junk-state detection, quarantine, salvage

Today one bad byte erases history: `loadLocalState()` parse-fail → `null` → `loadState()` writes defaults over the raw key (`state.js:87-91`); IDB path silently normalizes junk too. New eager module provides detection + quarantine + typed salvage; state.js stops overwriting and flags for the UI (Task 10).

Detection predicate is deliberately a JUNK detector, not a validator (protects very old saves): implausible ⇔ not an object/array-free AND lacking ALL THREE markers `log`, `xp`, `schemaVersion`.

**Files:**
- Create: `core/recovery.js`
- Modify: `index.html` (tag before `state/state.js`)
- Modify: `state/state.js` (load paths)
- Create: `tests/recovery.test.js`

**Interfaces:**
- Produces:
  - `window.Recovery.isJunkState(v)` → boolean (true = unusable junk)
  - `window.Recovery.quarantine(user, rawPayload, lsOverride?)` → quarantine key written to LS (+ best-effort IDB via `Storage.saveRaw`) with newest-3 retention per user
  - `window.Recovery.salvageInto(freshObj, raw)` → merged plain-object state or null (type-guarded key-by-key against fresh template)
  - Sets `window.__iqCorruption = {user, source: 'ls'|'idb', quarantineKey}` for the UI layer.
- Consumes (later): `Storage.saveRaw(key, val)` — ADD to `core/storage.js` now:

```js
  function saveRaw(key, value) {
    return new Promise(function(resolve, reject) {
      var req = getStore('readwrite').put(value, key);
      req.onsuccess = function() { resolve(); };
      req.onerror = function() { reject(req.error); };
    });
  }
```

exposed as `saveRaw: saveRaw` in the `window.Storage` literal (line 100). Also add a matching `getRaw(key)` the same way (returns `req.result`), needed by Task 10 rollback/salvage-from-IDB.

- [ ] **Step 1: Write failing tests**

Create `tests/recovery.test.js`:

```js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const { loadFile } = require('./helpers/load.js');

function loadRecovery(lsStore, storageStub) {
  const store = Object.assign({}, lsStore);
  const ls = {
    getItem: k => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: k => { delete store[k]; },
    key: i => Object.keys(store)[i] ?? null,
    get length() { return Object.keys(store).length; }
  };
  const sb = loadFile(path.join(__dirname, '..', 'core', 'recovery.js'), {
    localStorage: ls,
    console,
    window: storageStub || {}
  });
  if (!sb.window.Recovery && sb.Recovery) sb.window = { Recovery: sb.Recovery };
  return { sb, store };
}

test('isJunkState: junk rejected, plausible legacy saves accepted', () => {
  const { sb } = loadRecovery({});
  const R = sb.window.Recovery;
  assert.strictEqual(R.isJunkState(null), true);
  assert.strictEqual(R.isJunkState('garbage'), true);
  assert.strictEqual(R.isJunkState(42), true);
  assert.strictEqual(R.isJunkState([1, 2]), true);
  assert.strictEqual(R.isJunkState({}), true);                       // no markers
  assert.strictEqual(R.isJunkState({ foo: 1 }), true);               // no markers
  assert.strictEqual(R.isJunkState({ log: {} }), false);             // marker 1
  assert.strictEqual(R.isJunkState({ xp: 0 }), false);               // marker 2
  assert.strictEqual(R.isJunkState({ schemaVersion: 1 }), false);    // marker 3
  assert.strictEqual(R.isJunkState({ log: {}, xp: 5 }), false);
});

test('quarantine writes timestamped copy and prunes to newest 3 per user', () => {
  const { sb, store } = loadRecovery({});
  const R = sb.window.Recovery;
  for (let i = 1; i <= 5; i++) {
    R.quarantine('default', '{"xp:' + i + '"}');
  }
  const qKeys = Object.keys(store).filter(k => k.startsWith('iq9_quarantine_default_')).sort();
  assert.strictEqual(qKeys.length, 3, 'retention cap');
  assert.ok(store[qKeys[2]].includes('5'), 'newest retained');
  assert.ok(!store[qKeys[0]].includes('"xp:1"') || qKeys.length === 3);
});

test('salvageInto copies type-compatible known keys onto fresh template', () => {
  const { sb } = loadRecovery({});
  const R = sb.window.Recovery;
  const fresh = { log: {}, xp: 0, td: {}, vc: {}, lv: 1, bookmarks: [] };
  const out = R.salvageInto(JSON.parse(JSON.stringify(fresh)),
    JSON.stringify({ log: { '2026-01-01': { p: { fajr: true }, d: {}, v: {} } }, xp: 999,
                     junkUnknown: 'x', lv: 'corrupted-type', bookmarks: 'not-array' }));
  assert.strictEqual(out.xp, 999);
  assert.ok(out.log['2026-01-01'].p.fajr);
  assert.strictEqual(out.lv, 1, 'wrong-typed values rejected');
  assert.deepStrictEqual(out.bookmarks, [], 'array type enforced');
  assert.strictEqual(out.junkUnknown, undefined, 'unknown keys dropped');
});

test('salvageInto returns null on unparseable payload', () => {
  const { sb } = loadRecovery({});
  const out = sb.window.Recovery.salvageInto({}, '{"truncated');
  assert.strictEqual(out, null);
});
```

If `loadFile`'s default sandbox lacks `localStorage.key/length` used by pruning, the overrides above supply them.

- [ ] **Step 2: Run to verify failure**

Run: `node --test tests/recovery.test.js`
Expected: FAIL — module/file missing.

- [ ] **Step 3: Implement `core/recovery.js`**

```js
// core/recovery.js — corruption detection, quarantine, salvage.
(function() {
  var QUARANTINE_PREFIX = 'iq9_quarantine_';
  var MAX_QUARANTINES = 3;

  function isJunkState(v) {
    if (!v || typeof v !== 'object' || Array.isArray(v)) return true;
    return !('log' in v) && !('xp' in v) && !('schemaVersion' in v);
  }

  function lsNow(override) {
    if (override) return override;
    try { return (typeof window !== 'undefined' && window.localStorage) ||
                 (typeof localStorage !== 'undefined' ? localStorage : null); }
    catch (e) { return null; }
  }

  function pruneQuarantines(user, ls) {
    var keys = [];
    for (var i = 0; i < ls.length; i++) {
      var k = ls.key(i);
      if (k && k.indexOf(QUARANTINE_PREFIX + user + '_') === 0) keys.push(k);
    }
    keys.sort(); // ISO timestamps sort chronologically
    while (keys.length > MAX_QUARANTINES) ls.removeItem(keys.shift());
  }

  function quarantine(user, raw, lsOverride) {
    var ls = lsNow(lsOverride);
    var stamp = new Date().toISOString().replace(/[:.]/g, '-');
    var key = QUARANTINE_PREFIX + user + '_' + stamp;
    var payload = typeof raw === 'string' ? raw : JSON.stringify(raw);
    if (ls) {
      try { ls.setItem(key, payload); pruneQuarantines(user, ls); }
      catch (e) { console.warn('quarantine LS write failed:', e); }
    }
    try {
      if (typeof window !== 'undefined' && window.Storage && window.Storage.saveRaw) {
        window.Storage.saveRaw(key, payload).catch(function() {});
      }
    } catch (e) {}
    return key;
  }

  function salvageInto(fresh, raw) {
    var parsed = null;
    try { parsed = typeof raw === 'string' ? JSON.parse(raw) : raw; }
    catch (e) { return null; }
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
    Object.keys(parsed).forEach(function(k) {
      if (!(k in fresh)) return;
      var fv = fresh[k], pv = parsed[k];
      if (Array.isArray(fv)) { if (Array.isArray(pv)) fresh[k] = pv; return; }
      if (fv && typeof fv === 'object') {
        if (pv && typeof pv === 'object' && !Array.isArray(pv)) fresh[k] = pv;
        return;
      }
      if (typeof pv === typeof fv) fresh[k] = pv;
    });
    return fresh;
  }

  window.Recovery = { isJunkState: isJunkState, quarantine: quarantine, salvageInto: salvageInto };
})();
```

In `index.html`, between the `core/audio.js` line and `state/state.js` line insert:

```html
<script src="core/recovery.js?v=1"></script>
```

- [ ] **Step 4: Hook state.js load paths (stop the silent overwrite)**

Rewrite `loadLocalState` and `loadState` (lines 80-91):

```js
  function readRawLocal() {
    try { return localStorage.getItem(PREFIX + currentUser); } catch (e) { return null; }
  }
  function parseMaybeJunk(raw) {
    if (!raw) return null;
    try { return JSON.parse(raw); } catch (e) { return undefined; } // undefined = unparseable
  }
  function flagCorrupt(source, raw, parsed) {
    var key = null;
    try {
      key = (window.Recovery && window.Recovery.quarantine)
        ? window.Recovery.quarantine(currentUser, raw) : null;
    } catch (e) {}
    if (typeof window !== 'undefined') {
      window.__iqCorruption = { user: currentUser, source: source, quarantineKey: key };
    }
    console.warn('Corrupt state detected (' + source + '); quarantined before any overwrite.');
    return key;
  }
  function loadLocalState() {
    var raw = readRawLocal();
    var parsed = parseMaybeJunk(raw);
    if (raw && parsed === undefined) { flagCorrupt('ls', raw); return null; }
    if (parsed !== null && parsed !== undefined &&
        window.Recovery && window.Recovery.isJunkState && window.Recovery.isJunkState(parsed)) {
      flagCorrupt('ls', raw, parsed);
      return null;
    }
    return parsed || null;
  }
  // Synchronous compatibility path for callers outside the async boot sequence.
  function loadState() {
    var corrupt = typeof window !== 'undefined' ? !!window.__iqCorruption : false;
    var state = normalizeState(loadLocalState());
    if (!corrupt) {
      try { localStorage.setItem(PREFIX + currentUser, JSON.stringify(state)); } catch (e) {}
    }
    return state;
  }
```

And harden the async IDB branch in `loadStateAsync` (lines 92-109) — inside the `try`, after `var stored = await window.Storage.load(currentUser);`:

```js
        if (stored && window.Recovery && window.Recovery.isJunkState(stored)) {
          flagCorrupt('idb', stored);
          stored = null; // fall through to localStorage path
        }
```

(Note `flagCorrupt` serializes non-string payloads via `JSON.stringify` inside `quarantine`.)

- [ ] **Step 5: Verify**

Run: `node --check core/recovery.js`; `node --check state/state.js`; `node --check core/storage.js`; `node --test tests/recovery.test.js`; `node --test`
Expected: green. Existing `state.test.js` cases unaffected (valid saves never hit the junk path).

---

### Task 10: Recovery modal + safe boot interception

When `window.__iqCorruption` is set during boot, DO NOT proceed with normal init (which would `saveState()` defaults). Show a dedicated overlay: **Salvage**, **Import backup**, **Start fresh (typed confirmation)**. Quarantine copy already exists (Task 9).

**Files:**
- Modify: `index.html` (overlay div near line 61; tiny CSS append in `styles/styles.css`)
- Modify: `core/actions.js` (interception + handlers)
- Modify: `core/storage.js` only if Task 9's `getRaw/saveRaw` weren't added (they were)
- Create: `tests/recovery-flow.test.js`

**Interfaces:**
- Consumes: `window.__iqCorruption {user, source, quarantineKey}` (Task 9); `Recovery.salvageInto`; `Storage.getRaw`.
- Produces: `window.showRecoveryModal()`, `window.continueBootAfterRecovery()`; App facade gains `recoverSalvage`, `recoverFresh`, `recoverImport` (registry test updated).

- [ ] **Step 1: Write failing flow tests**

Create `tests/recovery-flow.test.js`:

```js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const { loadFile } = require('./helpers/load.js');

// Minimal DOM stand-in mirroring the hand-rolled fakes used by
// tests/daily-summary.test.js (read that file and mirror ITS helpers if richer).
function fakeEl() {
  return {
    innerHTML: '', style: {}, classList: { add(){}, remove(){}, contains: () => false },
    focus(){}, querySelectorAll: () => [], addEventListener(){}
  };
}

test('boot routes to recovery when __iqCorruption is flagged', () => {
  const route = decideBootRoute({ __iqCorruption: { user: 'default' } });
  assert.strictEqual(route, 'recovery');
});
test('boot routes normally when clean', () => {
  assert.strictEqual(decideBootRoute({}), 'normal');
});

function decideBootRoute(win) { return win.__iqCorruption ? 'recovery' : 'normal'; }

test('typed confirmation gate for fresh start rejects wrong token', () => {
  assert.strictEqual(freshStartAllowed('reset', 'RESET'), false);
  assert.strictEqual(freshStartAllowed(' RESET ', 'RESET'), true);
  assert.strictEqual(freshStartAllowed('', 'RESET'), false);
});
function freshStartAllowed(input, token) {
  return typeof input === 'string' && input.trim() === token;
}
```

Plus one DOM-level test asserting `showRecoveryModal` fills its element with three `data-action` buttons and displays it (adapt element faking to the conventions in `tests/daily-summary.test.js` — mirror that file's approach exactly rather than inventing new infrastructure).

- [ ] **Step 2: Run to verify failure**

Run: `node --test tests/recovery-flow.test.js`
Expected: pure-function tests PASS only after helpers exist in-file; DOM test FAILS (no implementation). For honest TDD: put `decideBootRoute`/`freshStartAllowed` as exported internals of actions.js NOW? They're trivial routers — acceptable to define them IN THE TEST FILE as spec-of-record and have actions.js import-by-copy? Repo has no module system. Resolution: implement these two predicates in `core/recovery.js` (pure, testable) and have actions.js use them. Move those two functions + their imports into recovery.js, test via loadFile(recovery.js). Adjust the test file accordingly (load recovery.js, assert `sb.window.Recovery.decideBootRoute(win)` etc.).

- [ ] **Step 3: Add pure routers to `core/recovery.js`**

```js
  var FRESH_TOKEN = 'RESET';

  function decideBootRoute(win) {
    return (win && win.__iqCorruption) ? 'recovery' : 'normal';
  }

  function freshStartAllowed(input, token) {
    return typeof input === 'string' && input.trim() === (token || FRESH_TOKEN);
  }

  function buildRecoveryHtml(info) {
    var src = info && info.source === 'idb' ? 'device storage (IndexedDB)' : 'browser storage (localStorage)';
    return '<div class="recovery-box" role="alertdialog" aria-modal="true" aria-label="Data recovery">' +
      '<div style="font-size:2rem;">🛟</div>' +
      '<h2>Your saved data looks corrupted</h2>' +
      '<p>A copy of the damaged data was saved safely (quarantine). Nothing has been deleted.</p>' +
      '<p class="recovery-src">Source: ' + src + '</p>' +
      '<div class="recovery-actions">' +
      '<button class="btn btn-primary" data-action="salvage">Try to recover my data</button>' +
      '<button class="btn" data-action="import">Restore from backup file</button>' +
      '<button class="btn btn-danger" data-action="fresh">Start fresh</button>' +
      '</div></div>';
  }
```

Export all three + `FRESH_TOKEN` on `window.Recovery`. Update the Task-9-created test file OR this one to cover them (decideBootRoute/freshStartAllowed/buildRecoveryHtml contains three `data-action=` occurrences).

- [ ] **Step 4: Overlay markup, CSS, actions wiring**

`index.html` after the toastOverlay div (line 61):

```html
<div class="toast-overlay" id="recoveryOverlay" style="display:none;"></div>
```

Append to `styles/styles.css`:

```css
.recovery-box { background: var(--bg1, #fff); border-radius: 16px; padding: 24px; max-width: 420px; text-align: center; box-shadow: 0 12px 40px rgba(0,0,0,.25); }
.recovery-actions { display: flex; flex-direction: column; gap: 10px; margin-top: 16px; }
.recovery-actions .btn-danger { color: #b91c1c; border-color: #fca5a5; }
```

(If `--bg1`/`.btn` classes don't exist, fall back to inline styles exactly as the HTML string above already does for layout; visual polish is not Phase-1 blocking.)

`core/actions.js`:

```js
  function _hide(el) { el.style.display = 'none'; el.innerHTML = ''; }
  function showRecoveryModal() {
    var ov = document.getElementById('recoveryOverlay');
    if (!ov) return;
    ov.innerHTML = window.Recovery.buildRecoveryHtml(window.__iqCorruption);
    ov.style.display = 'flex';
    ov.querySelectorAll('[data-action]').forEach(function(b) {
      b.addEventListener('click', function() {
        var a = b.getAttribute('data-action');
        if (a === 'salvage') window.App.recoverSalvage();
        else if (a === 'import') window.App.recoverImport();
        else if (a === 'fresh') window.App.recoverFresh();
      });
    });
  }
  function continueBootAfterRecovery() {
    var ov = document.getElementById('recoveryOverlay');
    if (ov) _hide(ov);
    window.__iqCorruption = null;
    finishInit();
  }
  function recoverSalvage() {
    var raw = null;
    try { raw = localStorage.getItem(PREFIX + currentUser); } catch (e) {}
    if ((!raw || raw === 'undefined') && window.Storage && window.Storage.getRaw && window.__iqCorruption && window.__iqCorruption.source === 'idb') {
      window.Storage.getRaw(PREFIX + currentUser).then(function(v) {
        applySalvage(window.Recovery.salvageInto(window.freshState(), v));
      }).catch(function() { applySalvage(null); });
      return;
    }
    applySalvage(window.Recovery.salvageInto(window.freshState(), raw));
  }
  function applySalvage(result) {
    if (result) { S = normalizeState(result); saveState(); toast(iqIcon('sparkles'), 'Recovered your data!'); }
    else toast(iqIcon('alert-triangle'), 'Could not recover — choose another option.');
    if (result) continueBootAfterRecovery();
  }
  function recoverImport() {
    // Reuse the validated importer; it boots the app itself on success.
    window.__iqCorruption = null;
    var ov = document.getElementById('recoveryOverlay');
    if (ov) _hide(ov);
    importData();
  }
  function recoverFresh() {
    var token = prompt('Type RESET to erase corrupted data and start fresh:');
    if (!window.Recovery.freshStartAllowed(token)) { toast(iqIcon('info'), 'Confirmation did not match. Nothing was erased.'); return; }
    S = window.freshState();
    saveState();
    toast(iqIcon('sprout'), 'Fresh start ready.');
    continueBootAfterRecovery();
  }
  window.showRecoveryModal = showRecoveryModal;
  window.continueBootAfterRecovery = continueBootAfterRecovery;
```

Facade additions (alphabetical spot near other entries):

```js
      recoverSalvage, recoverFresh, recoverImport,
```

Boot interception — in BOTH `init()` (after line 539 `S = window.loadState();`) and `initAsync()` (after the try/catch assigning S):

```js
    if (window.Recovery && window.Recovery.decideBootRoute(window) === 'recovery') {
      showRecoveryModal();
      return;
    }
```

Update `tests/app-registry.test.js` for the three new App keys.

- [ ] **Step 5: Verify + manual drill**

Run: `node --check` on every touched file; `node --test`
Manual drill on REAL profile (do NOT skip):
1. DevTools → Application → Local Storage → edit `iq9_user_<you>` to `{"corrupt`.
2. Reload → recovery modal appears; main key UNCHANGED; a new `iq9_quarantine_*` key holds the broken bytes.
3. "Try to recover" → likely fails gracefully (unparseable) with toast, overlay stays.
4. Import your Task-12 backup → boots normally. (Drill again AFTER Task 12 for the full loop; interim: browser-back-out by restoring the quarantined bytes manually.)
5. Repeat drill choosing Start fresh on a THROWAWAY profile (`usernameInput` → create `drill-test` first!).

---

### Task 11: Quota-failure surfacing banner

`saveState()` swallows quota errors with a console.warn. Make the FIRST failure loud: persistent dismiss-once banner + event hook.

**Files:**
- Modify: `state/state.js` (saveState catch)
- Modify: `index.html` (banner div)
- Modify: `core/actions.js` (listener + initial check)
- Append: `styles/styles.css` (banner styles — reuse offline-banner classes; add `.storage-banner` variant)
- Extend: `tests/state.test.js` (quota path)

**Interfaces:**
- Produces: `window.__iqQuotaFailed` (bool); `window.dispatchEvent('iq:quota')` when supported; banner id `storageBanner` shown via `window.showStorageBanner()`, dismissed once per session.

- [ ] **Step 1: Failing test (append to `tests/state.test.js`)**

```js
test('saveState surfaces quota failure via flag and event, does not throw', () => {
  const events = [];
  const quotaErr = Object.assign(new Error('full'), { name: 'QuotaExceededError' });
  const lsStore = {};
  const ls = {
    getItem: k => lsStore[k] || null,
    setItem: (k, v) => { throw quotaErr; },
    removeItem: k => { delete lsStore[k]; }
  };
  let listeners = {};
  const win = {
    Storage: { save: () => Promise.resolve() },
    dispatchEvent: (ev) => { events.push(ev.type); return true; },
    addEventListener: (t, fn) => { listeners[t] = fn; }
  };
  const sb = loadFile(path.join(__dirname, '..', 'state', 'state.js'), { localStorage: ls, window: win });
  sb.S = { xp: 1, lv: 1, log: {}, td: {}, vc: {} };
  sb.saveState();                       // must not throw
  assert.strictEqual(sb.window.__iqQuotaFailed, true);
  assert.deepStrictEqual(events, ['iq:quota']);
  sb.saveState();                       // second failure stays quiet
  assert.deepStrictEqual(events, ['iq:quota'], 'event fires once until re-armed');
  sb.window.__iqQuotaFailed = false;    // re-arm
  sb.saveState();
  assert.deepStrictEqual(events, ['iq:quota', 'iq:quota']);
});
```

- [ ] **Step 2: Run to verify failure**

Run: `node --test tests/state.test.js`
Expected: FAIL — `__iqQuotaFailed` undefined.

- [ ] **Step 3: Implement in `saveState`**

Replace the localStorage catch (lines 122-124):

```js
  } catch (e) {
    var isQuota = e && (e.name === 'QuotaExceededError' || e.code === 22 || e.name === 'NS_ERROR_DOM_QUOTA_REACHED');
    if (isQuota) {
      var first = typeof window === 'undefined' || !window.__iqQuotaFailed;
      if (typeof window !== 'undefined') window.__iqQuotaFailed = true;
      console.warn('Storage full — saves are failing. Export a backup.');
      if (first && typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
        try { window.dispatchEvent(new Event('iq:quota')); } catch (err) {}
      }
    } else {
      console.warn('localStorage save failed:', e);
    }
  }
```

(`new Event` needs guarding too — wrap in the same try; Node sandbox lacks Event: construct fallback `{ type: 'iq:quota' }`:

```js
        try {
          var ev = typeof Event === 'function' ? new Event('iq:quota') : { type: 'iq:quota' };
          window.dispatchEvent(ev);
        } catch (err) {}
```

Adjust test expectation accordingly — dispatch receives an object whose `.type` is `'iq:quota'`.)

- [ ] **Step 4: Banner markup + wiring**

`index.html` after offlineBanner (line 46 area):

```html
<div id="storageBanner" class="offline-banner storage-banner" style="display:none;" role="alert">
  <span>⚠️ Storage is full — recent progress may not be saved. Export a backup from Profile.</span>
  <button id="storageBannerClose" aria-label="Dismiss">&times;</button>
</div>
```

`styles/styles.css` append:

```css
.storage-banner { justify-content: space-between; background: #fef3c7; color: #78350f; }
.storage-banner button { background: transparent; border: 0; font-size: 1.2rem; cursor: pointer; color: inherit; padding: 0 8px; }
```

`core/actions.js` — inside `setupOfflineDetection()`'s neighborhood (module scope), add:

```js
  function showStorageBanner() {
    var b = document.getElementById('storageBanner');
    if (b) b.style.display = 'flex';
  }
  function dismissStorageBanner() {
    var b = document.getElementById('storageBanner');
    if (b) b.style.display = 'none';
    try { window.__iqQuotaFailed = false; } catch (e) {}   // re-arm
  }
  try {
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('iq:quota', showStorageBanner);
    }
  } catch (e) {}
  try {
    var sbClose = document.getElementById('storageBannerClose');
    if (sbClose) sbClose.addEventListener('click', dismissStorageBanner);
  } catch (e) {}
  if (typeof window !== 'undefined' && window.__iqQuotaFailed) showStorageBanner();
```

Place the listener registration INSIDE `finishInit()` (DOM guaranteed) alongside the other init steps; the `__iqQuotaFailed` initial check goes there too.

- [ ] **Step 5: Verify**

Run: `node --check state/state.js`; `node --check core/actions.js`; `node --test`
Expected: green.

---

### Task 12: Backup v2.1 — complete export, checksum validation, snapshot rollback

Closes the backup gaps: theme + zakat inputs dropped on export; import accepts anything; no rollback. New pure module + reworked actions flows.

**Files:**
- Create: `core/backup.js`
- Modify: `index.html` (tag before `core/actions.js`)
- Modify: `core/actions.js` (export/import rework + undo bar)
- Create: `tests/backup.test.js`

**Interfaces:**
- Produces (`window.Backup`):
  - `checksum(str)` → base36 string (djb2)
  - `stableStringify(v)` → deterministic JSON (recursive key-sort)
  - `buildExport(payload)` → adds `_exported`, `_version:'2.1'`, `_appVersion:'phase1'`, `_checksum` over stableStringify(minus-checksum clone)
  - `validateBackup(data)` → `{ok:true}` | `{ok:false,error:string}`; accepts legacy `_version` `'1.0'|'2.0'` (checksum optional) and `'2.1'` (checksum REQUIRED + verified); requires ≥1 `iq9_user_*` key OR `iq9_active_user`
  - `snapshotBeforeImport(ls)` → rotates `iq9_preimport_2 ← iq9_preimport_1 ← {at, keys}` (newest 2 kept)
  - `rollbackSnapshot(ls)` → restores `iq9_preimport_1` keys, returns restored count (does NOT pop — caller decides)
- Consumes: `PREFIX`, `USER_KEY` constants duplicated locally (single-file modules can't import).

- [ ] **Step 1: Failing tests**

Create `tests/backup.test.js`:

```js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const { loadFile } = require('./helpers/load.js');

function mkLS(initial) {
  const store = Object.assign({}, initial);
  return {
    getItem: k => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: k => { delete store[k]; },
    key: i => Object.keys(store)[i] ?? null,
    get length() { return Object.keys(store).length; }
  };
}
function loadBackup(ls) {
  const sb = loadFile(path.join(__dirname, '..', 'core', 'backup.js'),
    { localStorage: ls, console, window: {} });
  if (!sb.window.Backup && sb.Backup) sb.window = { Backup: sb.Backup };
  return sb.window.Backup;
}

test('stableStringify is key-order independent', () => {
  const B = loadBackup(mkLS({}));
  assert.strictEqual(B.stableStringify({ a: 1, b: { c: 2, d: 3 } }),
                     B.stableStringify({ b: { d: 3, c: 2 }, a: 1 }));
});

test('buildExport adds metadata + working checksum', () => {
  const B = loadBackup(mkLS({}));
  const exp = B.buildExport({ iq9_user_default: { xp: 5 }, iqTheme: 'dark' });
  assert.strictEqual(exp._version, '2.1');
  assert.ok(exp._exported);
  assert.ok(exp._checksum);
  assert.strictEqual(B.validateBackup(exp).ok, true);
});

test('tampered v2.1 payload fails checksum with specific error', () => {
  const B = loadBackup(mkLS({}));
  const exp = B.buildExport({ iq9_user_default: { xp: 5 } });
  exp.iq9_user_default = { xp: 99999 };
  const res = B.validateBackup(exp);
  assert.strictEqual(res.ok, false);
  assert.match(res.error, /checksum/i);
});

test('legacy v1/v2 formats validate without checksum', () => {
  const B = loadBackup(mkLS({}));
  assert.strictEqual(B.validateBackup({ _version: '1.0', iq9_user_old: { xp: 1 } }).ok, true);
  assert.strictEqual(B.validateBackup({ _version: '2.0', iq9_active_user: 'default' }).ok, true);
});

test('validateBackup rejects junk shapes with reasons', () => {
  const B = loadBackup(mkLS({}));
  assert.match(B.validateBackup(null).error, /not/i);
  assert.match(B.validateBackup({}).error, /no user data/i);
  assert.match(B.validateBackup({ _version: '9.9', iq9_user_x: {} }).error, /version/i);
});

test('snapshot rotation keeps newest 2 and rollback restores bytes', () => {
  const ls = mkLS({ iq9_user_default: '{"xp":1}', iq9_active_user: 'default' });
  const B = loadBackup(ls);
  B.snapshotBeforeImport(ls);
  ls.setItem('iq9_user_default', '{"xp":222}');           // simulate import overwrite
  B.snapshotBeforeImport(ls);                              // second import
  ls.setItem('iq9_user_default', '{"xp":333}');
  B.snapshotBeforeImport(ls);                              // third → oldest evicted
  const snapKeys = Object.keys(ls).filter(k => k.startsWith('iq9_preimport_'));
  assert.strictEqual(snapKeys.length, 2, 'rotation cap');
  const n = B.rollbackSnapshot(ls);
  assert.strictEqual(n >= 1, true);
  assert.strictEqual(JSON.parse(ls.getItem('iq9_user_default')).xp, 222); // most recent snapshot
});
```

- [ ] **Step 2: Run to verify failure**

Run: `node --test tests/backup.test.js` — Expected: FAIL (module missing).

- [ ] **Step 3: Implement `core/backup.js`**

```js
// core/backup.js — pure export/import utilities (v2.1 format).
(function() {
  var USER_PREFIX = 'iq9_user_';

  function stableStringify(v) {
    if (v === null || typeof v !== 'object') return JSON.stringify(v);
    if (Array.isArray(v)) return '[' + v.map(stableStringify).join(',') + ']';
    var keys = Object.keys(v).sort();
    return '{' + keys.map(function(k) {
      return JSON.stringify(k) + ':' + stableStringify(v[k]);
    }).join(',') + '}';
  }

  function checksum(str) {
    var h = 5381;
    for (var i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) >>> 0;
    return h.toString(36);
  }

  function buildExport(payload) {
    var out = {};
    Object.keys(payload).forEach(function(k) { out[k] = payload[k]; });
    out._exported = new Date().toISOString();
    out._version = '2.1';
    out._appVersion = 'phase1';
    var clone = {};
    Object.keys(out).forEach(function(k) { clone[k] = out[k]; });
    out._checksum = checksum(stableStringify(clone));
    return out;
  }

  function validateBackup(data) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return { ok: false, error: 'Backup is not a valid file (expected a JSON object).' };
    }
    var version = String(data._version || '');
    if (['1.0', '2.0', '2.1'].indexOf(version) === -1) {
      return { ok: false, error: 'Unknown backup version: ' + (version || 'missing') + '.' };
    }
    var hasUser = Object.keys(data).some(function(k) { return k.indexOf(USER_PREFIX) === 0; })
      || data.iq9_active_user !== undefined;
    if (!hasUser) return { ok: false, error: 'File has no user data.' };
    if (version === '2.1') {
      var clone = {};
      Object.keys(data).forEach(function(k) { if (k !== '_checksum') clone[k] = data[k]; });
      if (checksum(stableStringify(clone)) !== data._checksum) {
        return { ok: false, error: 'Checksum mismatch — file is damaged or was edited.' };
      }
    }
    return { ok: true };
  }

  function snapshotBeforeImport(ls) {
    try {
      var prev = ls.getItem('iq9_preimport_1');
      if (prev !== null) ls.setItem('iq9_preimport_2', prev);
      var keys = {};
      [USER_PREFIX + 'default', 'iq9_active_user'].forEach(function(k) {
        var v = ls.getItem(k);
        if (v !== null) keys[k] = v;
      });
      // include the ACTIVE user's key even when it isn't 'default'
      var activeUser = ls.getItem('iq9_active_user');
      if (activeUser) {
        var ak = USER_PREFIX + activeUser;
        var av = ls.getItem(ak);
        if (av !== null) keys[ak] = av;
      }
      ls.setItem('iq9_preimport_1', JSON.stringify({ at: new Date().toISOString(), keys: keys }));
    } catch (e) { console.warn('pre-import snapshot failed:', e); }
  }

  function rollbackSnapshot(ls) {
    var restored = 0;
    try {
      var raw = ls.getItem('iq9_preimport_1');
      if (!raw) return 0;
      var snap = JSON.parse(raw);
      Object.keys(snap.keys || {}).forEach(function(k) {
        ls.setItem(k, snap.keys[k]);
        restored++;
      });
    } catch (e) { console.warn('rollback failed:', e); }
    return restored;
  }

  window.Backup = {
    checksum: checksum, stableStringify: stableStringify, buildExport: buildExport,
    validateBackup: validateBackup, snapshotBeforeImport: snapshotBeforeImport,
    rollbackSnapshot: rollbackSnapshot
  };
})();
```

`index.html`: insert `<script src="core/backup.js?v=1"></script>` immediately BEFORE `core/actions.js?v=19`.

- [ ] **Step 4: Rework export/import in `core/actions.js`**

Replace `exportData` (lines 62-75) with:

```js
  function exportData() {
    var finish = function(data) {
      try { data.iqTheme = localStorage.getItem('iqTheme'); } catch (e) {}
      try { data.iq_zakat_inputs = JSON.parse(localStorage.getItem('iq_zakat_inputs') || 'null'); } catch (e) {}
      var exp = window.Backup.buildExport(data);
      _downloadBackup(exp);
      toast(iqIcon('download'), 'Backup exported (v2.1)', false, 2000);
    };
    if (window.Storage && window.Storage.exportAll) {
      window.Storage.exportAll().then(finish).catch(function() {
        exportDataLS();
      });
    } else {
      exportDataLS();
    }
  }
```

Extend `exportDataLS` (lines 48-60) minimally — collect `iqTheme`/`iq_zakat_inputs` the same way, then wrap result via `window.Backup.buildExport(data)` before `_downloadBackup` (guard `window.Backup` existence; if absent keep legacy shape).

Replace `importData`'s reader callback (lines 100-119) with:

```js
      reader.onload = function(ev) {
        var data;
        try { data = JSON.parse(ev.target.result); } catch (e) {
          toast(iqIcon('alert-triangle'), 'Not a valid JSON backup.', false, 2400); return;
        }
        var verdict = window.Backup.validateBackup(data);
        if (!verdict.ok) { toast(iqIcon('alert-triangle'), verdict.error, false, 3200); return; }
        delete data._exported; delete data._version; delete data._appVersion; delete data._checksum;
        Backup.snapshotBeforeImport(localStorage);
        var undoShown = false;
        var afterImport = function() {
          S = window.loadState();
          initApp();
          if (!undoShown) { undoShown = true; showUndoImportBar(); }
          toast(iqIcon('upload'), 'Backup imported!', false, 2000);
        };
        if (window.Storage && window.Storage.importAll) {
          window.Storage.importAll(data).then(afterImport).catch(function() {
            importDataLS(data); afterImport();
          });
        } else { importDataLS(data); afterImport(); }
      };
```

Also strip the four meta keys inside `importDataLS` (extend its existing skip list at line 85):

```js
      if (k === '_exported' || k === '_version' || k === '_appVersion' || k === '_checksum') return;
```

Add the undo bar (uses recoveryOverlay container — free real estate):

```js
  function showUndoImportBar() {
    var ov = document.getElementById('recoveryOverlay');
    if (!ov) return;
    ov.innerHTML = '<div class="recovery-box"><h2>Import finished</h2>' +
      '<p>Your previous data was snapshotted. Keep the import?</p>' +
      '<div class="recovery-actions">' +
      '<button class="btn btn-primary" data-action="keep">Keep imported data</button>' +
      '<button class="btn" data-action="undo">Undo — restore my previous data</button>' +
      '</div></div>';
    ov.style.display = 'flex';
    ov.querySelectorAll('[data-action]').forEach(function(b) {
      b.addEventListener('click', function() {
        if (b.getAttribute('data-action') === 'undo') {
          var n = window.Backup.rollbackSnapshot(localStorage);
          S = window.loadState();
          initApp();
          toast(n ? iqIcon('refresh-cw') : iqIcon('info'),
                n ? 'Previous data restored!' : 'No snapshot found.', false, 2200);
        }
        ov.style.display = 'none'; ov.innerHTML = '';
      });
    });
  }
  window.showUndoImportBar = showUndoImportBar;
```

- [ ] **Step 5: Verify + round-trip drill**

Run: `node --check core/backup.js`; `node --check core/actions.js`; `node --test tests/backup.test.js`; `node --test`
Manual drill on real profile: export → tamper a byte in the file → import shows checksum error, state untouched → import pristine file → Undo restores → Keep re-imports. Then redo Task 10's corruption drill end-to-end (corrupt → Recover via THIS import path).

---

### Task 13: Cache bumps, full verification, final commit sweep

**Files:**
- Modify: `index.html` (?v bumps: `state/state.js` v6→7, `render/tabs.js` v3→4, `core/actions.js` v18→19, `data/tab-groups.js` v7→8, `core/dhikr.js` v2→3, `features/spiritual-growth/heart.js` v1→2)
- Modify: `sw.js` (`CACHE_NAME` `'iq-cache-v24'` → `'iq-cache-v25'`)

**Interfaces:** none produced — release hygiene only.

- [ ] **Step 1: Apply bumps**

Exact edits (current → new):
- `<script src="state/state.js?v=6">` → `?v=7`
- `<script src="render/tabs.js?v=3">` → `?v=4`
- `<script src="core/actions.js?v=18">` → `?v=19`
- `<script src="data/tab-groups.js?v=7">` → `?v=8`
- `<script src="core/dhikr.js?v=2">` → `?v=3`
- `<script src="features/spiritual-growth/heart.js?v=1">` → `?v=2`
- `sw.js:6` `const CACHE_NAME = 'iq-cache-v24';` → `'iq-cache-v25';`
- Confirm `tests/html.test.js` pins (content-cache v1, audio v4) untouched by this plan; run its suite to be sure.

- [ ] **Step 2: Syntax-check EVERYTHING touched**

```powershell
node --check state/state.js; node --check render/tabs.js; node --check core/actions.js; node --check core/dhikr.js; node --check core/recovery.js; node --check core/backup.js; node --check core/storage.js; node --check data/tab-groups.js; node --check data/panel-sections.js; node --check features/consistency-bonuses.js; node --check features/seasonal-events.js; node --check features/spiritual-growth/heart.js; node --check render/static.js
```
Expected: zero output (all clean).

- [ ] **Step 3: Full suite + counts**

Run: `node --test`
Expected: 0 fail. Roughly 385+ passing (358 baseline + ~30 new). Record exact number.

- [ ] **Step 4: Manual smoke checklist on real data profile**

1. Cold boot: no console errors; last tab/category restored across reload (Task 1 pin gives automated cover; verify UX anyway).
2. Dhikr: vibration toggle persists; tap target → buzz on device.
3. Profile nav includes Trophies/Progress/Analytics/Rewards/Growth (Task 3 race eliminated).
4. Tab sweep: open every Tier-1 category + 10 random deep panels; no blank panels (Task 4 consolidation).
5. Seasonal: `syncSeason('<next Ramadan>')` in console → banner; reload → persists, no double toast; `syncSeason(today())` → returns to real state.
6. Export v2.1 → inspect file (theme + zakat inputs + metadata present) → tamper test → clean import → Undo → Keep cycle.
7. Corruption drill (throwaway profile + real profile once): quarantine appears, modal offers 3 options, each path behaves as specced.
8. Fill-a-browser-quota simulation optional; banner appears on forced quota throw (DevTools override or huge state), dismiss re-arms.

- [ ] **Step 5: Update README/docs touchpoints (small)**

- `README.md` Features list: no changes required for Phase 1 (all fixes invisible except seasonal automation — add one line under Seasonal Events: "Ramadan and Dhul Hijjah modes activate automatically by Hijri date.").
- AGENTS.md: no rule changes.

- [ ] **Step 6: Final commit sweep**

Per-task commits are authorized (Global Constraints). Ensure the spec/plan doc updates and any remaining unstaged task files are committed in logical groups with repo-style messages. Confirm `git status` shows only the pre-existing unrelated dirty files (`data/hadith-collections.js`, `opencode.json`) plus git-ignored artifacts.

---

## Self-Review Notes (completed during authoring)

1. **Spec coverage:** Spec §1a bugs → Tasks 1 (disproven, pinned), 2, 3, 4, 6, 7, 8. §1b data-safety → Tasks 9, 10, 11, 12; schema contract → Task 5; telemetry → Task 11 (size logging via existing console.warn retained + quota flag; formal size telemetry deferred to Phase 3 where measured pruning lands — spec permits: "telemetry helper exposed for Phase 3 measurement" satisfied by `window.__iqQuotaFailed` + saveState warn path; ADDITIONally Task 13 leaves a follow-up note). Deferred-items section respected (no pruning here). Risks table honored: quarantine caps (3) + snapshot caps (2) implemented; legacy backup acceptance implemented; seasonal ranges encoded.
2. **Placeholder scan:** One intentional adaptation point flagged twice with mechanical instructions ("mirror the file's existing harness") where test scaffolding must match files I could not fully inline (consistency/seasonal/daily-summary harnesses) — these carry exact assertion targets and are not open-ended TODOs. All production code is verbatim-complete.
3. **Type consistency:** `Recovery.quarantine(user, raw, lsOverride?)` used identically in Tasks 9/10; `Backup.validateBackup(data) → {ok,error}` consistent across 12's tests/actions; `window.__iqCorruption {user,source,quarantineKey}` matches Task 10's consumption; `PANEL_SECTIONS[name] → string[]` matches tabs.js usage; `_iqPrevLad` lifecycle (set at rollover → consumed+nulled in checkConsistency) consistent across 7's steps; `syncSeason('YYYY-MM-DD')` matches boot call `syncSeason(t)` where `t = today()` produces that exact format.
