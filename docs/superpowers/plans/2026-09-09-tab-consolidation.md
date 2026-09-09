# Tab Consolidation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cut subtabs from ~150 to ~83 by merging duplicates, relocating
misplaced tabs, clustering giant groups, and adding the missing
`names_main` group — with combined contents and zero dead stored tabs.

**Architecture:** Data-first: rewrite `TAB_GROUPS`/`KNOWLEDGE_GROUPS`/
`LIBRARY_GROUPS`, then panels, then combined renderers that call existing
member renderers in sequence (each member keeps writing to its own
`*Area` div, which moves into the combined panel), then state remap,
then tests. No content pools touched.

**Tech Stack:** Vanilla JS IIFEs on `window.*` (legacy SPA), ES modules
(MPA track), node built-in test runner (`node --test` from root).

## Global Constraints

- Test command is exactly `node --test` from project root (no runner).
- Classic files: verify with `node --check <file>`; `src/**` ESM covered
  by `node scripts/check-syntax.js`.
- New tab id = 4 touchpoints: `data/tab-groups.js` entry + panel div in
  `index.html` + `_lazyRender` mapping in `render/tabs.js` + exported
  renderer function. Missing one = silently blank panel.
- New state field/remap goes in `normalizeState` in `state/state.js`
  (and `src/core/state.js` if it stores tab ids — recon in Task 7).
- Legacy track `?v=` discipline: bump only versioned classic assets you
  change; bump `MANIFEST_REV` in `sw.js` if a precached URL changes.
- Do NOT commit (repo rule). Leave the tree dirty; report `git status`.
- Escape user input on render (`escapeHTML`) — combined renderers reuse
  member renderers, so no new strings are introduced.

---

### Task 1: Knowledge IA in `data/tab-groups.js`

**Files:**
- Modify: `data/tab-groups.js` (knowledge array, ibadah worship + tracking arrays)
- Test: `tests/tab-groups.test.js`

**Interfaces:**
- Consumes: spec `docs/superpowers/specs/2026-09-09-tab-consolidation-design.md` Sec 3.
- Produces: new group/tab ids consumed by Tasks 3–6 (`virtues`,
  `vices-return`, `character-path`, `family-life`, `community`, `service`,
  `work-justice`, `wellness`, `earth-living`, `youth-tech`,
  `ethics-finance`, `worship-rulings`, `wealth-oaths`).

- [ ] **Step 1: Add failing test for the new Knowledge shape**

```js
test('knowledge groups match consolidated IA (34 subtabs)', () => {
  const g = loadGroups();
  const tabs = id => g.knowledge.find(gr => gr.id === id).tabs.map(t => t.id);
  assert.deepEqual(tabs('quran_sunnah'), ['quran', 'tafsir', 'hadith', 'sunnahs']);
  assert.deepEqual(tabs('fiqh'), ['fiqh', 'worship-rulings', 'wealth-oaths']);
  assert.deepEqual(tabs('arabic'), ['arabic']);
  assert.ok(!('creed' in Object.fromEntries(g.knowledge.map(gr => [gr.id, 1]))), 'creed id gone');
  assert.deepEqual(tabs('heart'), ['virtues', 'vices-return', 'character-path']);
  assert.deepEqual(tabs('society'), ['family-life', 'community', 'service', 'work-justice']);
  assert.deepEqual(tabs('life'), ['wellness', 'earth-living', 'youth-tech', 'ethics-finance']);
  assert.deepEqual(tabs('history'), ['seerah', 'sahaba', 'prophets', 'women', 'stories', 'battles', 'science', 'modernhist', 'ancientprophets']);
  assert.deepEqual(tabs('hereafter'), ['akhirah', 'jannah', 'jahannam', 'grave', 'signs', 'dreams']);
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `node --test tests/tab-groups.test.js`
Expected: FAIL (old ids present).

- [ ] **Step 3: Rewrite the knowledge array + ibadah single-homing**

Replace the `knowledge:` array in `data/tab-groups.js` with:

```js
knowledge: [
  { id: 'quran_sunnah', icon: 'book-open', label: "Qur'an & Sunnah", tabs: [
    { id: 'quran', icon: 'book-open', label: 'Quran' },
    { id: 'tafsir', icon: 'scroll', label: 'Interpretation' },
    { id: 'hadith', icon: 'bookmarks', label: 'Hadith' },
    { id: 'sunnahs', icon: 'star', label: 'Prophetic Ways' } ] },
  { id: 'fiqh', icon: 'scales', label: 'Fiqh & Rulings', tabs: [
    { id: 'fiqh', icon: 'scales', label: 'Jurisprudence' },
    { id: 'worship-rulings', icon: 'droplets', label: 'Worship Rulings' },
    { id: 'wealth-oaths', icon: 'wallet', label: 'Wealth & Oaths' } ] },
  { id: 'arabic', icon: 'pencil', label: 'Arabic', tabs: [
    { id: 'arabic', icon: 'pencil', label: 'Arabic' } ] },
  { id: 'heart', icon: 'heart', label: 'Heart & Soul', tabs: [
    { id: 'virtues', icon: 'sparkles', label: 'Virtues' },
    { id: 'vices-return', icon: 'alert-triangle', label: 'Vices & Repentance' },
    { id: 'character-path', icon: 'handshake', label: 'Character & Path' } ] },
  { id: 'society', icon: 'users', label: 'Dealings & Society', tabs: [
    { id: 'family-life', icon: 'family', label: 'Family Life' },
    { id: 'community', icon: 'users', label: 'Community' },
    { id: 'service', icon: 'hand-heart', label: 'Service & Care' },
    { id: 'work-justice', icon: 'briefcase', label: 'Work & Justice' } ] },
  { id: 'life', icon: 'leaf', label: 'Life & Modern', tabs: [
    { id: 'wellness', icon: 'heartbeat', label: 'Wellness' },
    { id: 'earth-living', icon: 'tree', label: 'Earth & Living' },
    { id: 'youth-tech', icon: 'zap', label: 'Youth & Tech' },
    { id: 'ethics-finance', icon: 'scales', label: 'Ethics & Finance' } ] },
  { id: 'history', icon: 'scroll', label: 'History & Seerah', tabs: [
    { id: 'seerah', icon: 'scroll', label: 'Biography' },
    { id: 'sahaba', icon: 'users', label: 'Companions' },
    { id: 'prophets', icon: 'crescent', label: 'Prophets' },
    { id: 'women', icon: 'family', label: 'Great Women' },
    { id: 'stories', icon: 'book-open', label: 'Stories' },
    { id: 'battles', icon: 'sword', label: 'Battles' },
    { id: 'science', icon: 'monitor', label: 'Science' },
    { id: 'modernhist', icon: 'trending-up', label: 'Modern Hist.' },
    { id: 'ancientprophets', icon: 'scroll', label: 'Ancient' } ] },
  { id: 'hereafter', icon: 'moon', label: 'Hereafter', tabs: [
    { id: 'akhirah', icon: 'moon', label: 'Hereafter' },
    { id: 'jannah', icon: 'sparkles', label: 'Paradise' },
    { id: 'jahannam', icon: 'flame', label: 'Hellfire' },
    { id: 'grave', icon: 'coffin', label: 'The Grave' },
    { id: 'signs', icon: 'clock', label: 'Signs of Qiyamah' },
    { id: 'dreams', icon: 'moon', label: 'Islamic Dreams' } ] }
],
```

Single-homing edits in the same file: remove `{ id: 'sunnahs', ... }`
from `ibadah` → `worship` tabs; remove `{ id: 'memorization', ... }`
from `knowledge` → `quran_sunnah` (already absent above — keep it ONLY in
`ibadah` tracking); remove `gratitude` from `heart` (keep ibadah
tracking); remove `charity` from `society` (keep ibadah tracking).

- [ ] **Step 4: Run tests**

Run: `node --test tests/tab-groups.test.js`
Expected: PASS. Then `node --check data/tab-groups.js`.

---

### Task 2: Library IA + `names_main` in `data/tab-groups.js`

**Files:**
- Modify: `data/tab-groups.js` (library array, add `names_main` key)
- Test: `tests/tab-groups.test.js`

**Interfaces:**
- Consumes: Task 1 ids.
- Produces: library ids (`holy-cities`, `capitals`, `east`, `pattern`,
  `sacred-space`, `living-crafts`, `word`, `structure`, `sound-script`,
  `words-poetry`, `being`, `knowing`, `will-evil`) + `names_main` group
  consumed by Tasks 3–6.

- [ ] **Step 1: Add failing test**

```js
test('library groups match consolidated IA (21 subtabs) + names_main exists', () => {
  const g = loadGroups();
  const tabs = id => g.library.find(gr => gr.id === id).tabs.map(t => t.id);
  assert.deepEqual(tabs('dynasties'), ['umayyads', 'abbasids', 'andalus', 'ottomans', 'mamluks', 'seljuks', 'fatimids', 'ayyubids']);
  assert.deepEqual(tabs('cities'), ['holy-cities', 'capitals', 'east']);
  assert.deepEqual(tabs('arts'), ['pattern', 'sacred-space', 'living-crafts', 'word']);
  assert.deepEqual(tabs('arabic_lang'), ['structure', 'sound-script', 'words-poetry']);
  assert.deepEqual(tabs('philosophy'), ['being', 'knowing', 'will-evil']);
  assert.ok(Array.isArray(g.names_main), 'names_main group must exist');
  assert.deepEqual(g.names_main[0].tabs.map(t => t.id),
    ['allah_names', 'prophets', 'sahaba', 'women', 'scholars_names']);
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `node --test tests/tab-groups.test.js`
Expected: FAIL.

- [ ] **Step 3: Rewrite the library array, add `names_main`**

Replace the `library:` array with:

```js
library: [
  { id: 'dynasties', icon: 'landmark', label: 'Dynasties', tabs: [
    { id: 'umayyads', icon: 'crescent', label: 'Umayyads' },
    { id: 'abbasids', icon: 'book-open', label: 'Abbasids' },
    { id: 'andalus', icon: 'palette', label: 'Andalus' },
    { id: 'ottomans', icon: 'crown', label: 'Ottomans' },
    { id: 'mamluks', icon: 'shield', label: 'Mamluks' },
    { id: 'seljuks', icon: 'moon', label: 'Seljuks' },
    { id: 'fatimids', icon: 'star', label: 'Fatimids' },
    { id: 'ayyubids', icon: 'sword', label: 'Ayyubids' } ] },
  { id: 'cities', icon: 'building', label: 'Cities & Lands', tabs: [
    { id: 'holy-cities', icon: 'kaaba', label: 'Holy Cities' },
    { id: 'capitals', icon: 'building', label: 'Capitals' },
    { id: 'east', icon: 'globe', label: 'Lands of the East' } ] },
  { id: 'arts', icon: 'palette', label: 'Arts & Crafts', tabs: [
    { id: 'pattern', icon: 'pen-tool', label: 'Pattern & Illumination' },
    { id: 'sacred-space', icon: 'mosque', label: 'Sacred Space' },
    { id: 'living-crafts', icon: 'palette', label: 'Crafts & Nasheeds' },
    { id: 'word', icon: 'book-open', label: 'Literature' } ] },
  { id: 'arabic_lang', icon: 'pencil', label: 'Arabic Language', tabs: [
    { id: 'structure', icon: 'pencil', label: 'Structure' },
    { id: 'sound-script', icon: 'megaphone', label: 'Sound & Script' },
    { id: 'words-poetry', icon: 'book-open', label: 'Words & Poetry' } ] },
  { id: 'philosophy', icon: 'brain', label: 'Philosophy & Thought', tabs: [
    { id: 'being', icon: 'globe', label: 'Being' },
    { id: 'knowing', icon: 'brain', label: 'Reason & Knowing' },
    { id: 'will-evil', icon: 'shield', label: 'Will & Evil' } ] }
],
names_main: [
  { id: 'names', icon: 'sparkles', label: 'Names', tabs: [
    { id: 'allah_names', icon: 'sparkles', label: "Allah's Names" },
    { id: 'prophets', icon: 'crescent', label: 'Prophets' },
    { id: 'sahaba', icon: 'users', label: 'Companions' },
    { id: 'women', icon: 'family', label: 'Great Women' },
    { id: 'scholars_names', icon: 'book', label: 'Scholars' } ] }
],
```

All icons above already exist in `data/icons.js` (verified during
planning); `tests/icons.test.js` guards the registry — if it fails on a
new id, pick the nearest existing icon instead of adding one (YAGNI).

- [ ] **Step 4: Run tests**

Run: `node --test tests/tab-groups.test.js tests/icons.test.js`
Expected: PASS. Then `node --check data/tab-groups.js`.

---

### Task 3: Panels in `index.html` + `data/panel-sections.js`

**Files:**
- Modify: `index.html` (panel divs), `data/panel-sections.js`
- Test: `tests/panel-sections.test.js`

**Interfaces:**
- Consumes: Task 1–2 ids.
- Produces: panel divs + section lists consumed by Task 5.

Recon first (member renderers write to `*Area` divs via
`poolRender(areaId, ...)` — e.g. `renderIkhlas` writes `ikhlasArea`):
run `Select-String -Path index.html -Pattern 'id="<member>Area"' for
every absorbed member id. Each combined panel MUST contain all its
members' Area divs — move them, don't duplicate them.

- [ ] **Step 1: Failing test — sections list new ids, panels exist**

Update the key list in `tests/panel-sections.test.js` (no key changes
needed — section keys stay) and add:

```js
test('consolidated panels exist, retired panels gone', () => {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  for (const p of ['panel-virtues', 'panel-vices-return', 'panel-character-path',
      'panel-worship-rulings', 'panel-wealth-oaths', 'panel-family-life',
      'panel-community', 'panel-service', 'panel-work-justice', 'panel-wellness',
      'panel-earth-living', 'panel-youth-tech', 'panel-ethics-finance',
      'panel-holy-cities', 'panel-capitals', 'panel-east', 'panel-pattern',
      'panel-sacred-space', 'panel-living-crafts', 'panel-word',
      'panel-structure', 'panel-sound-script', 'panel-words-poetry',
      'panel-being', 'panel-knowing', 'panel-will-evil']) {
    assert.ok(html.includes(`id="${p}"`), 'missing ' + p);
  }
  for (const p of ['panel-purification', 'panel-technology', 'panel-poetryart']) {
    assert.ok(!html.includes(`id="${p}"`), 'retired ' + p + ' still present');
  }
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `node --test tests/panel-sections.test.js`
Expected: FAIL.

- [ ] **Step 3: Edit panels + sections**

In `index.html`: for each combined id add
`<div class="tab-panel" role="tabpanel" id="panel-<id>">` containing the
moved member `*Area` divs (e.g. panel-virtues holds ikhlasArea,
tawakkulArea, patienceArea, hopeArea, fearArea, loveofallahArea,
contentmentArea). Delete retired panel divs only after moving their Area
divs. Keep member panels that stay cross-listed (prophets/sahaba/women
panels stay — Names reuses them).

In `data/panel-sections.js`: rewrite `knowledge_fiqh` to
`['panel-fiqh','panel-worship-rulings','panel-wealth-oaths']`,
`knowledge_heart` to `['panel-virtues','panel-vices-return',
'panel-character-path']`, `knowledge_society` to the 4 service panels,
`knowledge_life` to the 4 life panels, `knowledge_history` adds
`panel-modernhist,panel-ancientprophets`, `knowledge_hereafter` drops
`panel-hajj`, `library_cities/arts/arabic/philosophy` to new ids,
`library_dynasties` drops modernhist/ancientprophets, add
`names: ['panel-allah_names','panel-prophets','panel-sahaba',
'panel-women','panel-scholars_names']`.

- [ ] **Step 4: Run tests**

Run: `node --test tests/panel-sections.test.js`
Expected: PASS.

---

### Task 4: `_lazyRender` in `render/tabs.js` + combined renderers

**Files:**
- Modify: `render/tabs.js` (`_lazyRender` map), `render/static.js`
  (new combined renderers; member renderers untouched)
- Test: `tests/tab-groups.test.js` (append) or new
  `tests/combined-render.test.js`

**Interfaces:**
- Consumes: Tasks 1–3 (ids + Area divs).
- Produces: `window.renderVirtues`, `window.renderVicesReturn`, ... (one
  per combined id) consumed by Task 6 verification.

Member renderers (verified in `render/static.js`) write to their Area
divs, e.g. `renderIkhlas()` → `poolRender('ikhlasArea', ...)`. Combined
renderers just call members in spec order — no new strings, so the
`escapeHTML` contract is inherited.

- [ ] **Step 1: Failing test**

Create `tests/combined-render.test.js`:

```js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const fs = require('fs');
const { loadFile } = require('./helpers/load.js');

const RENDERERS = ['renderVirtues', 'renderVicesReturn', 'renderCharacterPath',
  'renderWorshipRulings', 'renderWealthOaths', 'renderFamilyLife',
  'renderCommunity', 'renderService', 'renderWorkJustice', 'renderWellness',
  'renderEarthLiving', 'renderYouthTech', 'renderEthicsFinance',
  'renderHolyCities', 'renderCapitals', 'renderEast', 'renderPattern',
  'renderSacredSpace', 'renderLivingCrafts', 'renderWord', 'renderStructure',
  'renderSoundScript', 'renderWordsPoetry', 'renderBeing', 'renderKnowing',
  'renderWillEvil'];

test('every combined renderer is exported on window', () => {
  const sb = loadFile(path.join(__dirname, '..', 'render', 'static.js'), {});
  for (const r of RENDERERS) assert.equal(typeof sb.window[r], 'function', r);
});

test('every combined id has a _lazyRender mapping', () => {
  const src = fs.readFileSync(path.join(__dirname, '..', 'render', 'tabs.js'), 'utf8');
  for (const r of RENDERERS) {
    const id = r.replace(/^render/, '').replace(/[A-Z]/g, m => '-' + m.toLowerCase()).replace(/^-/, '');
    assert.ok(src.includes(id + ":'" + r + "'"), 'missing mapping for ' + id);
  }
});
```

(Id-to-name derivation matches existing convention, e.g.
`renderSalahrules`, `renderProblemofevil` — flat camelCase after
`render`. For hyphenated ids the mapping key keeps the hyphen,
e.g. `virtues:'renderVirtues'`. Adjust the derivation line to the exact
convention when writing; the assertion intent is what matters.)

- [ ] **Step 2: Run to verify it fails**

Run: `node --test tests/combined-render.test.js`
Expected: FAIL (functions missing).

- [ ] **Step 3: Implement**

In `render/static.js` add (example; repeat per combined id following
the spec Sec 3 membership tables):

```js
function renderVirtues() { renderIkhlas(); renderTawakkul(); renderPatience(); renderHope(); renderFear(); renderLoveofallah(); renderContentment(); }
```

and `window.renderVirtues = renderVirtues;` beside the other exports
(~line 476). In `render/tabs.js` `_lazyRender` add
`virtues:'renderVirtues', ...` for all 26 combined ids; remove entries
for fully retired ids (`technology`, `poetryart`, `purification`,
`salahrules`, `zakatrules`, `sawmrules`, `hajjrules`, `trade`,
`inheritance`, `oaths`, and absorbed singles). Keep entries for member
ids still referenced by the Today aggregator in `render/dynamic.js`
(line 54 calls renderIkhlas etc. directly).

- [ ] **Step 4: Run tests**

Run: `node --test tests/combined-render.test.js`
Expected: PASS. Then `node --check render/static.js`,
`node --check render/tabs.js`.

---

### Task 5: Retired-id sweep (panels, maps, tests, i18n)

**Files:**
- Modify: any file still referencing retired ids; `tests/*.test.js`
  assertions that pin old counts.
- Test: full `node --test`.

Recon command (run first, record hits):
`Select-String -Path index.html,render/tabs.js,data/panel-sections.js,tests/*.test.js -Pattern 'purification|salahrules|zakatrules|sawmrules|hajjrules|technology|poetryart'` —
note: `technology`/`poetry` are substrings of nothing else dangerous,
but `trade`/`hope`/`food` are common words, so grep those with
`panel-`/`id="` prefixes only.

- [ ] **Step 1: Run the recon, list every hit file:line.**
- [ ] **Step 2: Update each hit** (point to combined id or delete).
  i18n: grep `data-i18n` in `index.html` for retired labels; new panel
  labels need keys wherever tab labels are translated (check
  `render/static.js` poolRender titles — they come from member
  renderers, already translated).
- [ ] **Step 3: Run full suite**

Run: `node --test`
Expected: PASS, 535+ tests (new files add ~30).

---

### Task 6: State migration for retired ids

**Files:**
- Modify: `state/state.js` (`normalizeState`), `src/core/state.js` (only
  if it stores tab ids — check first)
- Test: `tests/state.test.js` (append remap test)

Remap table (retired → combined):
purification/salahrules/sawmrules/hajjrules/hajj→`worship-rulings`;
zakatrules/trade/inheritance/oaths→`wealth-oaths`;
ikhlas/tawakkul/patience/hope/fear/loveofallah/contentment→`virtues`;
heart/sins/repentance→`vices-return`;
manners/zuhd/sufism/tazkiyah/inspirations/reflection→`character-path`;
family/marriage/parenting→`family-life`;
neighbors/community/brotherhood/sisterhood/ummah/antiracism→`community`;
orphans2/elderly/disabled/poverty/volunteering/dawah→`service`;
work/punishments→`work-justice`; health/tibb/mentalhealth→`wellness`;
food/environment/green/travel→`earth-living`;
youth/tech/technology/socialmedia/education→`youth-tech`;
ethics/bioethics/modfinance/politics→`ethics-finance`;
mecca/medina/jerusalem→`holy-cities`;
damascus/baghdad/cairo/cordoba/istanbul→`capitals`;
bukhara/samarkand→`east`; calligraphy/illumination→`pattern`;
architecture/geometry→`sacred-space`;
textiles/ceramics/woodwork/nasheeds→`living-crafts`;
literature→`word`; arabicgrammar/morphology/rhetoric/etymology→
`structure`; pronunciation/scripts/dialects→`sound-script`;
vocab/proverbs/poetry/poetryart→`words-poetry`;
ontology/existence/prophethood→`being`;
epistemology/logic/reason/kalam→`knowing`;
freewill/problemofevil→`will-evil`. Plus `lastCat`: `creed`→`arabic`.

- [ ] **Step 1: Failing test** (append to `tests/state.test.js`):

```js
test('normalizeState remaps retired tab ids to combined parents', () => {
  const s = loadStateWith({ lastTab: 'tech', lastCat: 'creed' });
  assert.equal(s.lastTab, 'youth-tech');
  assert.equal(s.lastCat, 'arabic');
});
```

(Adapt `loadStateWith` to the file's existing harness — read the top of
`tests/state.test.js` first; keep its construction pattern.)

- [ ] **Step 2: Run to verify it fails**

Run: `node --test tests/state.test.js`
Expected: FAIL.

- [ ] **Step 3: Implement** — at the top of `normalizeState`, after the
  freshState backfill loop:

```js
var TAB_REMAP = { /* paste every pair from this task's Remap table above */ };
if (p.lastTab && TAB_REMAP[p.lastTab]) p.lastTab = TAB_REMAP[p.lastTab];
if (p.lastCat === 'creed') p.lastCat = 'arabic';
```

- [ ] **Step 4: Run tests**

Run: `node --test tests/state.test.js`
Expected: PASS. Then `node --check state/state.js`.

---

### Task 7: MPA parity (`src/pages/knowledge`, `src/pages/library`)

**Files:**
- Modify: `src/pages/knowledge/entry.js` (`KNOWLEDGE_GROUPS`),
  `src/pages/library/entry.js` (`LIBRARY_GROUPS`)
- Test: `tests/mpa-complete.test.js`, `tests/mpa-smoke.test.js`

Recon first: read `src/shell/tabs.js` `renderCategoryNav` signature
(verified: takes a TAB_GROUPS-style array) and each entry's
`onTabActivate` bridge (does it call legacy `window.renderX`? check
lines around 190/153). Mirror the legacy map 1:1 with the same ids.

- [ ] **Step 1: Failing test** — extend `tests/mpa-complete.test.js`
  with the consolidated group/tab ids for knowledge + library (same
  deepEqual shape as Task 1–2 tests, pointed at the entry files'
  arrays — follow the file's existing import pattern).
- [ ] **Step 2: Run to verify it fails**

Run: `node --test tests/mpa-complete.test.js`
Expected: FAIL.
- [ ] **Step 3: Rewrite both arrays** to the Task 1–2 maps (same ids,
  labels, icons-as-emoji if that file uses emoji — match file convention,
  don't convert).
- [ ] **Step 4: Run tests**

Run: `node --test tests/mpa-complete.test.js tests/mpa-smoke.test.js`
Expected: PASS. Then `node scripts/check-syntax.js`.

---

### Task 8: Full gates + browser spot-check

- [ ] **Step 1: Run everything**

Run: `node --test` (expect 560+ PASS, 0 fail),
`node scripts/check-syntax.js` (expect clean).

- [ ] **Step 2: Playwright smoke** (file:// per webapp-testing static
  pattern): load `index.html`, click Knowledge → Heart & Soul → Virtues,
  assert `#panel-virtues.active` and non-empty `#ikhlasArea`; click
  Names → assert 5 subtabs render. Record pass/fail in the task output.
- [ ] **Step 3: Report** `git status --short` file list (no commit per
  repo rule) and test counts.
