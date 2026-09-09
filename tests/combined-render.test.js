'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const fs = require('fs');
const { loadFile } = require('./helpers/load.js');

const PAIRS = [['virtues','renderVirtues'],['vices-return','renderVicesreturn'],
['character-path','renderCharacterpath'],['worship-rulings','renderWorshiprulings'],
['wealth-oaths','renderWealthoaths'],['family-life','renderFamilylife'],
['community','renderCommunity'],['service','renderService'],
['work-justice','renderWorkjustice'],['wellness','renderWellness'],
['earth-living','renderEarthliving'],['youth-tech','renderYouthtech'],
['ethics-finance','renderEthicsfinance'],['holy-cities','renderHolycities'],
['capitals','renderCapitals'],['east','renderEast'],['pattern','renderPattern'],
['sacred-space','renderSacredspace'],['living-crafts','renderLivingcrafts'],
['word','renderWord'],['structure','renderStructure'],
['sound-script','renderSoundscript'],['words-poetry','renderWordspoetry'],
['being','renderBeing'],['knowing','renderKnowing'],['will-evil','renderWillevil']];

test('every combined renderer is exported on window', () => {
  const sb = loadFile(path.join(__dirname, '..', 'render', 'static.js'), {});
  for (const [, r] of PAIRS) assert.equal(typeof sb.window[r], 'function', r);
});

test('every combined id has a _lazyRender mapping', () => {
  const src = fs.readFileSync(path.join(__dirname, '..', 'render', 'tabs.js'), 'utf8');
  const norm = src.replace(/["']/g, '');
  for (const [id, r] of PAIRS) assert.ok(norm.includes(id + ':' + r), 'missing ' + id);
});
