'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const fs = require('fs');
const vm = require('vm');

function loadSandbox(files, globals) {
  const sandbox = Object.assign({
    window: {},
    console,
    localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} }
  }, globals || {});
  for (const key of Object.keys(sandbox)) {
    if (key !== 'window' && typeof sandbox[key] !== 'undefined') {
      sandbox.window[key] = sandbox[key];
    }
  }
  for (const f of files) {
    const code = fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
    vm.runInNewContext(code, sandbox, { filename: f });
    if (sandbox.window) {
      for (const key of Object.keys(sandbox.window)) {
        sandbox[key] = sandbox.window[key];
      }
    }
  }
  return sandbox;
}

const sandbox = loadSandbox(['features/search.js'], {
  window: {
    escapeHTML: (v) => String(v == null ? '' : v).replace(/[&<>\"']/g, function(ch) { return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[ch]; }),
    DUA_POOL: [
      { title: 'Morning Adhkar', english: 'Morning remembrance', desc: 'Daily morning duas', text: 'SubhanAllah' },
      { title: 'Evening Adhkar', english: 'Evening remembrance', desc: 'Daily evening duas', text: 'Alhamdulillah' }
    ],
    HADITHS: [
      { text: 'The best of you are those who learn the Quran', desc: 'Hadith about Quran', english: 'Quran virtue', source: 'Bukhari' },
      { text: 'Seek knowledge even unto China', desc: 'Seeking knowledge', english: 'Knowledge pursuit', source: 'Muslim' }
    ],
    NAMES: [
      { name: 'Ar-Rahman', english: 'The Most Merciful', desc: 'Allah is the most merciful' },
      { name: 'Al-Quddus', english: 'The Most Holy', desc: 'Allah is the most holy' }
    ],
    STORIES: [
      { title: 'Story of Yusuf', desc: 'Prophet Yusuf story', text: 'Yusuf was thrown into the well', english: 'Yusuf tale' },
      { title: 'Story of Musa', desc: 'Prophet Musa story', text: 'Musa was placed in the river', english: 'Musa tale' }
    ],
    DHIKR_POOL: [
      { text: 'La ilaha illallah', desc: 'Declaration of faith', english: 'Tawheed', roman: 'La ilaha illallah' },
      { text: 'SubhanAllah', desc: 'Glory be to Allah', english: 'Glorification', roman: 'SubhanAllah' }
    ],
    SINS_POOL: [
      { title: 'Backbiting', desc: 'Speaking ill of others', text: 'Ghibah is forbidden' },
      { title: 'Lying', desc: 'Speaking untruths', text: 'Kadhibh is prohibited' }
    ]
  }
});

const searchAll = sandbox.searchAll;

test('search: fuzzy match finds exact substring', () => {
  const results = searchAll('Subhan');
  assert.ok(results.length > 0, 'should find results for exact substring');
  assert.ok(results.some(r => r.text.includes('Subhan')), 'should contain text with Subhan');
});

test('search: fuzzy match handles partial characters in order', () => {
  const results = searchAll('sbn');
  assert.ok(results.length > 0, 'should find fuzzy matches');
  assert.ok(results.some(r => r.text.includes('Subhan')), 'should find Subhan via fuzzy match');
});

test('search: multi-word query matches', () => {
  const results = searchAll('Morning Adhkar');
  assert.ok(results.length > 0, 'should find results for multi-word query');
  assert.ok(results.some(r => r.text.includes('Morning')), 'should contain Morning');
});

test('search: returns results from multiple pools', () => {
  const results = searchAll('Subhan');
  const sections = new Set(results.map(r => r.section));
  assert.ok(sections.size >= 2, 'should return results from multiple pools');
});

test('search: hadith pool uses correct variable name HADITHS', () => {
  const results = searchAll('knowledge');
  const hadithResults = results.filter(r => r.section === 'Hadith');
  assert.ok(hadithResults.length > 0, 'should find hadith results using HADITHS variable');
  assert.ok(hadithResults.some(r => r.tab === 'hadith'), 'hadith results should have correct tab');
});

test('search: names pool uses correct variable name NAMES', () => {
  const results = searchAll('Rahman');
  const namesResults = results.filter(r => r.section === 'Names of Allah');
  assert.ok(namesResults.length > 0, 'should find names results using NAMES variable');
  assert.ok(namesResults.some(r => r.tab === 'allah_names'), 'names results should have correct tab');
});

test('search: stories pool uses correct variable name STORIES', () => {
  const results = searchAll('Yusuf');
  const storiesResults = results.filter(r => r.section === 'Stories');
  assert.ok(storiesResults.length > 0, 'should find stories results using STORIES variable');
  assert.ok(storiesResults.some(r => r.tab === 'stories'), 'stories results should have correct tab');
});

test('search: empty query returns empty', () => {
  const results = searchAll('');
  assert.strictEqual(results.length, 0, 'empty query should return empty array');
});

test('search: single char returns empty (min length 2)', () => {
  const results = searchAll('a');
  assert.strictEqual(results.length, 0, 'single char should return empty array');
});

test('search: no matches returns empty', () => {
  const results = searchAll('xyz123');
  assert.strictEqual(results.length, 0, 'no matches should return empty array');
});

test('search: results capped at 20', () => {
  const results = searchAll('s');
  assert.ok(results.length <= 20, 'results should be capped at 20');
});

test('search: search works with string items in pool', () => {
  sandbox.window.DUA_POOL.push('Simple dua text');
  const results = searchAll('Simple');
  assert.ok(results.length > 0, 'should find results with string items');
  assert.ok(results.some(r => r.text.includes('Simple')), 'should contain Simple text');
});

test('search renderer escapes user-entered recent terms', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'features', 'search.js'), 'utf8');
  assert.ok(source.includes('escapeSearchText(term)'), 'empty-result terms must be escaped');
  assert.ok(source.includes('data-recent-index'), 'recent searches must not be interpolated into inline JavaScript');
  assert.ok(source.includes('data-result-index'), 'search results must use data-bound buttons');
  assert.ok(!source.includes('onclick="App.activateTab'), 'search results must not use inline JavaScript');
});
