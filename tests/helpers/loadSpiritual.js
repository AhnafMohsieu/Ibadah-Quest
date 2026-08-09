'use strict';
const fs = require('fs');
const vm = require('vm');

function loadSpiritual(filePath, overrides) {
  const code = fs.readFileSync(filePath, 'utf8');
  const el = { innerHTML: '', querySelector: () => null };
  const spiritualStub = {
    getProgress: () => ({ stage: 3, totalStages: 7, name: 'Test', icon: 'star', xp: 100, xpForNext: 200, progress: 0.5 }),
    isVisible: () => true,
    FEATURE_ICONS: {
      garden: '', lantern: '', keys: '', mosque: '', boat: '',
      heart: '', armor: '', ramadan: '', laylat: ''
    }
  };
  const sandbox = {
    window: {},
    console,
    document: { getElementById: () => el },
    SpiritualGrowth: spiritualStub,
    S: { xp: 100, cs: 0, bs: 0 },
    iqIcon: (k) => `<img class="iq-icon" src="x" alt="${k}">`,
    TAB_GROUPS: { profile_main: [] },
    localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} }
  };
  Object.assign(sandbox, overrides || {});
  if (overrides && overrides.document === undefined) sandbox.document.getElementById = () => el;
  vm.runInNewContext(code, sandbox, { filename: filePath });
  return { sandbox, el };
}

module.exports = { loadSpiritual };