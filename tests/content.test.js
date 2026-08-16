'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const { loadFile } = require('./helpers/load.js');

function setup(overrides) {
  const sandbox = loadFile(path.join(__dirname, '..', 'core', 'content.js'), Object.assign({
    S: { contentDate: null, duaIdx: null, quranIdx: null },
    today: () => '2026-08-11',
    fastRng: (len) => [0, 1].filter(i => i < len), // deterministic array
    saveState: () => {},
    renderAll: () => {},
    toast: () => {},
    iqIcon: () => '',
    DUA_POOL: ['dua1', 'dua2', 'dua3'],
    QURAN_POOL: ['q1', 'q2'],
    SUNNAH_POOL: [], DHIKR_POOL: [], STORIES: [], HADITHS: [], NAMES: [],
    SINS_POOL: [], PUNISHMENTS_POOL: [], REPENTANCE_POOL: [], SAHABA_POOL: [],
    SEERAH_POOL: [], TAFSIR_POOL: [], MANNERS_POOL: [], INSPIRATIONS_POOL: [],
    AQEEDAH_POOL: [], FAMILY_POOL: [], HEALTH_POOL: [], FINANCE_POOL: [],
    UMMAH_POOL: [], HAJJ_POOL: [], AKHIRAH_POOL: [], PROPHETS_POOL: [],
    WOMEN_POOL: [], KNOWLEDGE_POOL: [], HEART_POOL: [], JUMUAH_POOL: [],
    MARRIAGE_POOL: [], SCIENCE_POOL: [], WUDU_POOL: [], SCHOLARS_POOL: [],
    PATIENCE_POOL: [], WORK_POOL: [], COMMUNITY_POOL: [], ENVIRONMENT_POOL: [],
    TRAVEL_POOL: [], FIQH_POOL: [], ARABIC_POOL: [], TAWAKKUL_POOL: [],
    IKHLAS_POOL: [], ZUHD_POOL: [], DAWAH_POOL: [], CIVILISATION_POOL: [],
    BATTLES_POOL: [], JANNAH_POOL: [], JAHANNAM_POOL: [], GRAVE_POOL: [],
    SIGNS_POOL: [], DREAMS_POOL: [], PARENTING_POOL: [], FOOD_POOL: [],
    TIBB_POOL: [], YOUTH_POOL: [], TECH_POOL: [], NEIGHBORS_POOL: [],
    NEW_POOLS: {}
  }, overrides || {}));
  return sandbox;
}

test('refreshContent: generates indices for new day', () => {
  const s = setup();
  s.S.contentDate = null;
  s.window.refreshContent();
  assert.strictEqual(s.S.contentDate, '2026-08-11');
  assert.deepStrictEqual(s.S.duaIdx, [0, 1]);
  assert.deepStrictEqual(s.S.quranIdx, [0, 1]);
});

test('refreshContent: does not regenerate same day', () => {
  const s = setup();
  s.S.contentDate = '2026-08-11';
  s.S.duaIdx = [2, 3];
  s.window.refreshContent();
  assert.deepStrictEqual(s.S.duaIdx, [2, 3]);
});

test('refreshContent: regenerates if index missing', () => {
  const s = setup();
  s.S.contentDate = '2026-08-11';
  s.S.duaIdx = null;
  s.window.refreshContent();
  assert.deepStrictEqual(s.S.duaIdx, [0, 1]);
});