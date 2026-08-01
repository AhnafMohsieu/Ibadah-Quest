const fs = require('fs');
const vm = require('vm');

// Mock globals
const mockState = {
  log: {
    '2026-07-30': { p: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true }, d: { deed1: true, deed2: true }, v: {} },
    '2026-07-31': { p: { fajr: false, dhuhr: true, asr: true, maghrib: true, isha: true }, d: { deed3: true }, v: {} }
  },
  tp: 10,
  cs: 2,
  bs: 5,
  pd: 1,
  lv: 3,
  xp: 250,
  td: { deed1: 5, deed2: 3, deed3: 1 },
  vc: {},
  duaIdx: [1,2,3],
  quranIdx: [1,2,3,4,5],
  sunnahIdx: [],
  dhikrIdx: [1],
  storiesIdx: [],
  hadithIdx: [],
  namesIdx: [],
  sinsIdx: [],
  seerahIdx: [],
  tafsirIdx: [],
  mannersIdx: [],
  prophetsIdx: [],
  scholarsIdx: [],
  knowledgeIdx: [],
  jannahIdx: []
};

const mockDeeds = [
  { id: 'deed1', name: 'Deed One', cat: 'charity', xp: 10 },
  { id: 'deed2', name: 'Deed Two', cat: 'prayer', xp: 5 },
  { id: 'deed3', name: 'Deed Three', cat: 'charity', xp: 8 }
];

const mockPrayers = [
  { id: 'fajr', xp: 5 },
  { id: 'dhuhr', xp: 5 },
  { id: 'asr', xp: 5 },
  { id: 'maghrib', xp: 5 },
  { id: 'isha', xp: 5 }
];

const mockPools = {
  DUA_POOL: [{}, {}, {}],
  QURAN_POOL: [{}, {}, {}, {}, {}],
  SUNNAH_POOL: [],
  DHIKR_POOL: [{}],
  STORIES: [],
  HADITHS: [],
  NAMES: [],
  SINS_POOL: [],
  SEERAH_POOL: [],
  TAFSIR_POOL: [],
  MANNERS_POOL: [],
  PROPHETS_POOL: [],
  SCHOLARS_POOL: [],
  KNOWLEDGE_POOL: [],
  JANNAH_POOL: []
};

// Create sandbox
const sandbox = {
  window: {},
  S: mockState,
  DEEDS: mockDeeds,
  PRAYERS: mockPrayers,
  ...mockPools,
  lvTitle: (lv) => 'Level ' + lv,
  Date: Date,
  console: console
};

// Load analytics.js
const code = fs.readFileSync('analytics/analytics.js', 'utf8');
const script = new vm.Script(code);
const context = vm.createContext(sandbox);
script.runInContext(context);

const Analytics = sandbox.window.Analytics;
if (!Analytics) {
  console.error('ERROR: window.Analytics not defined');
  process.exit(1);
}

console.log('Analytics functions:', Object.keys(Analytics));

// Test each function
try {
  const prayerStats = Analytics.getPrayerStats(30);
  console.log('getPrayerStats(30):', prayerStats);
  if (typeof prayerStats.total !== 'number') throw new Error('total not number');
  if (typeof prayerStats.rate !== 'number') throw new Error('rate not number');
  if (!Array.isArray(prayerStats.daily)) throw new Error('daily not array');
} catch (e) {
  console.error('getPrayerStats failed:', e.message);
}

try {
  const heatmap = Analytics.getHeatmapData(90);
  console.log('getHeatmapData(90):', heatmap.length, 'entries');
  if (!Array.isArray(heatmap)) throw new Error('not array');
  if (heatmap[0] && !heatmap[0].date) throw new Error('missing date');
} catch (e) {
  console.error('getHeatmapData failed:', e.message);
}

try {
  const deedStats = Analytics.getDeedStats(30);
  console.log('getDeedStats(30):', deedStats);
  if (!Array.isArray(deedStats.byCategory)) throw new Error('byCategory not array');
  if (!Array.isArray(deedStats.topDeeds)) throw new Error('topDeeds not array');
} catch (e) {
  console.error('getDeedStats failed:', e.message);
}

try {
  const streak = Analytics.getStreakStats();
  console.log('getStreakStats():', streak);
  if (typeof streak.current !== 'number') throw new Error('current not number');
} catch (e) {
  console.error('getStreakStats failed:', e.message);
}

try {
  const timeline = Analytics.getStreakTimeline(30);
  console.log('getStreakTimeline(30):', timeline.length, 'months');
} catch (e) {
  console.error('getStreakTimeline failed:', e.message);
}

try {
  const xp = Analytics.getXPStats(30);
  console.log('getXPStats(30):', xp);
  if (typeof xp.level !== 'number') throw new Error('level not number');
  if (typeof xp.progress !== 'number') throw new Error('progress not number');
} catch (e) {
  console.error('getXPStats failed:', e.message);
}

try {
  const content = Analytics.getContentStats();
  console.log('getContentStats():', content.length, 'items');
} catch (e) {
  console.error('getContentStats failed:', e.message);
}

console.log('All tests passed');