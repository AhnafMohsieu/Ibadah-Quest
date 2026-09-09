# Tab Consolidation Design (Approach A: merge + cluster)

Date: 2026-09-09. Status: approved by owner (chat). Next: implementation plan.

## 1. Problem

Knowledge (~80 subtabs) and Library (~49) overwhelm users: rows of 8/5
category chips open into groups of up to 18 parallel subtabs (Heart 17,
Society 18, Life 16). Separate bug: the top-level Names button
(`index.html` t1 + bnav, `data-cat="names_main"`) resolves against
`window.TAB_GROUPS`, which defines no `names_main` group — Names has no
category entry, no subtabs. Content exists (99 Names pool, `renderNames`).

## 2. Decisions (owner-confirmed)

- Scope: subtabs only; all 13 categories stay.
- Merges combine contents (stacked); nothing deleted.
- Names holds all name lists (99 Names, Prophets, Companions, Great Women,
  Scholars); person-lists stay cross-listed in History (shared panels).
- One tab id lives in exactly one group (end cross-listing duplicates).

## 3. Knowledge IA: 80 -> 34

- Qur'an & Sunnah (5->4): quran, tafsir, hadith, sunnahs. `memorization`
  single-homed to ibadah Self-Tracking.
- Fiqh & Rulings (9->3): `fiqh` kept; `worship-rulings` (purification,
  salah, sawm, hajj rules + incoming `hajj`); `wealth-oaths` (zakat, trade,
  inheritance, oaths).
- Arabic (1->1): keep `arabic`; fix group id `creed` -> `arabic`.
- Heart & Soul (17->3): `virtues` (ikhlas, tawakkul, patience, hope, fear,
  loveofallah, contentment); `vices-return` (heart, sins, repentance);
  `character-path` (manners, zuhd, sufism, tazkiyah, inspirations,
  reflection). `gratitude` single-homed to ibadah tracking.
- Dealings & Society (18->4): `family-life` (family, marriage, parenting);
  `community` (neighbors, community, brotherhood, sisterhood, ummah,
  antiracism); `service` (orphans2, elderly, disabled, poverty,
  volunteering, dawah); `work-justice` (work, punishments). `charity`
  single-homed to ibadah tracking.
- Life & Modern (16->4): merge `tech`+`technology`; `wellness` (health,
  tibb, mentalhealth); `earth-living` (food, environment, green, travel);
  `youth-tech` (youth, tech, socialmedia, education); `ethics-finance`
  (ethics, bioethics, modfinance, politics).
- History & Seerah (7->9): unchanged + incoming `modernhist`,
  `ancientprophets` from Dynasties.
- Hereafter (7->6): akhirah, jannah, jahannam, grave, signs, dreams
  (`hajj` moved to Fiqh).

Daily side-effects: ibadah worship drops `sunnahs` (lives in knowledge);
ibadah tracking drops `memorization` (lives in knowledge), gains nothing.

## 4. Library IA: 49 -> 21, plus Names (5)

- Dynasties (10->8): 8 true dynasties stay parallel; `modernhist`,
  `ancientprophets` move to History.
- Cities & Lands (10->3): `holy-cities` (mecca, medina, jerusalem);
  `capitals` (damascus, baghdad, cairo, cordoba, istanbul); `east`
  (bukhara, samarkand).
- Arts & Crafts (10->4): `poetryart` folds into arabic_lang `poetry`;
  `pattern` (calligraphy, illumination); `sacred-space` (architecture,
  geometry); `living-crafts` (textiles, ceramics, woodwork, nasheeds);
  `word` (literature).
- Arabic Language (10->3): `structure` (arabicgrammar, morphology,
  rhetoric, etymology); `sound-script` (pronunciation, scripts, dialects);
  `words-poetry` (vocab, proverbs, poetry).
- Philosophy & Thought (9->3): `being` (ontology, existence, prophethood);
  `knowing` (epistemology, logic, reason, kalam); `will-evil` (freewill,
  problemofevil).
- Names `names_main` (new, 5): allah_names, prophets, sahaba, women,
  scholars_names.

Totals: Knowledge 34 + Library 21 + Names 5 + Daily 18 + Profile 5 = ~83
vs ~150 today.

## 5. Build strategy

- Combined renderers call existing renderers in sequence into the new
  panel (e.g. `renderVirtues` -> renderIkhlas, renderTawakkul, ...). Plan
  phase confirms container targeting in `render/dynamic.js`.
- 4-touchpoint contract per new id (tab-groups entry, `index.html` panel
  div, `_lazyRender` mapping in `render/tabs.js`, exported renderer);
  retired ids removed from all four. `data/panel-sections.js` updated.
- State migration: `normalizeState` in `state/state.js` remaps retired ids
  (tech->youth-tech, hajj->worship-rulings, ...) so stored
  `lastTab`/`lastCat` never land dead. Same for `src/core/state.js` if the
  MPA track stores tab ids.
- MPA parity: plan checks `src/shell/tabs.js` (`renderCategoryNav`) data
  source and ports the same map to knowledge/library pages.
- Tests: update id/count assertions, add combined-renderer + `names_main`
  coverage. Gates: `node --test` 535 green, `node scripts/check-syntax.js`,
  `node --check` on touched classic files. Legacy `?v=` bump only if a
  versioned classic asset changes.

## 6. Risks

- Combined panels get long: members render stacked with section anchors;
  order follows the tables above.
- Cross-listed person tabs (prophets/sahaba/women in History + Names)
  share panels by design; `switchTab` resolves by tab id, both chips work.
- i18n keys: new ids need entries wherever tab labels are translated
  (plan inventories `data-i18n` usage).
