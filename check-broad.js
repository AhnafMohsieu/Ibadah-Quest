const fs = require('fs');
const vm = require('vm');

const sandbox = {
  window: {},
  console: console,
  document: {
    _elements: {},
    getElementById(id) {
      if (!this._elements[id]) {
        this._elements[id] = {
          id, innerHTML: '', style: {},
          appendChild() {},
          querySelector() { return null; },
          querySelectorAll() { return []; },
          addEventListener() {},
          scrollTop: 0,
          classList: { add() {}, remove() {}, toggle() {} },
          dataset: {}
        };
      }
      return this._elements[id];
    },
    createElement() { return { style: {}, appendChild() {}, classList: { add() {} } }; },
    querySelectorAll() { return []; },
    querySelector() { return null; },
    body: { appendChild() {} }
  },
  localStorage: { getItem() { return null; }, setItem() {} },
  setTimeout,
  TAB_GROUPS: { profile_main: [{ id: 'profile', icon: '👤', label: 'Profile' }] },
  today() { return '2026-08-05'; },
  save() {},
  S: {
    xp: 5000, cs: 10, bs: 15, tq: 5, td: {}, vc: {},
    tp: 50, pd: 10, lv: 10, ua: {}, ur: {}, sd: false,
    growthSettings: { visible: ['garden', 'lantern', 'keys', 'daynight', 'mosque', 'boat', 'mountain', 'heart', 'armor', 'constellation', 'well', 'desert', 'ramadan', 'laylat'] }
  }
};

// Make SpiritualGrowth available globally in the sandbox
sandbox.SpiritualGrowth = {};

vm.createContext(sandbox);

// Load data.js
vm.runInContext(fs.readFileSync('features/spiritual-growth/data.js', 'utf8'), sandbox, { filename: 'data.js' });

// Sync window.SpiritualGrowth back to sandbox
sandbox.SpiritualGrowth = sandbox.window.SpiritualGrowth;

// Load index.js (uses sandbox.SpiritualGrowth)
vm.runInContext(fs.readFileSync('features/spiritual-growth/index.js', 'utf8'), sandbox, { filename: 'index.js' });

// Sync again
sandbox.SpiritualGrowth = sandbox.window.SpiritualGrowth;

// Load all feature files
['lantern.js', 'keys.js', 'daynight.js', 'mosque.js', 'boat.js', 'mountain.js', 'heart.js', 'armor.js', 'constellation.js', 'well.js', 'desert.js', 'ramadan.js', 'laylat.js'].forEach(f => {
  vm.runInContext(fs.readFileSync('features/spiritual-growth/' + f, 'utf8'), sandbox, { filename: f });
});

console.log('=== Growth Settings Panel Output ===');
sandbox.window.SpiritualGrowth.renderSettings();
const html = sandbox.document.getElementById('growthSettingsArea').innerHTML;

// Extract feature name + icon pairs
const itemMatches = [...html.matchAll(/SpiritualGrowth\.toggle\('(\w+)'\)\s*>\s*<div class="growth-setting-icon">([^<]+)<\/div>\s*<div class="growth-setting-info">\s*<div class="growth-setting-name">([^<]+)/g)];
console.log('Items found:', itemMatches.length);
itemMatches.forEach(m => {
  const id = m[1];
  const icon = m[2].trim();
  const label = m[3].trim();
  const code = icon.charCodeAt(0).toString(16);
  console.log('  ' + id.padEnd(15) + ' icon="' + icon + '" (U+' + code + ') label="' + label + '"');
});

// Check tab navigation
console.log('\n=== Tab Navigation Icons ===');
const tabContent = fs.readFileSync('data/tab-groups.js', 'utf8');
const tabLines = tabContent.split('\n').filter(l => l.includes('id:') && l.includes('icon:'));
console.log('Total tab definitions:', tabLines.length);
// Check each tab for missing icons
tabLines.forEach(l => {
  if (!/icon:\s*'./.test(l)) {
    console.log('  MISSING ICON: ' + l.trim());
  }
});
console.log('All tabs have icons if no MISSING lines above.');