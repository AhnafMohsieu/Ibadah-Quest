'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const fs = require('fs');
const vm = require('vm');

const iconsPath = path.join(__dirname, '..', 'data', 'icons.js');
const iconsSrc = fs.readFileSync(iconsPath, 'utf8');

const sandbox = { window: {} };
vm.runInNewContext(iconsSrc, sandbox, { filename: 'data/icons.js' });
for (const key of Object.keys(sandbox.window)) sandbox[key] = sandbox.window[key];

const rootAssets = path.join(__dirname, '..', 'assets', 'icons');

test('every ID in IQ_IDS maps to a defined code', () => {
  for (const [id, key] of Object.entries(sandbox.IQ_IDS)) {
    assert.ok(sandbox.IQ_CODES[key], `ID "${id}" references unknown key "${key}"`);
  }
});

test('every emoji key has a codepoint and PNG file', () => {
  for (const key of Object.keys(sandbox.IQ_EMOJI)) {
    assert.ok(sandbox.IQ_CODES[key], `emoji key "${key}" is missing its codepoint`);
    const fname = 'emoji_u' + sandbox.IQ_CODES[key].toLowerCase() + '.png';
    assert.ok(fs.existsSync(path.join(rootAssets, fname)), `missing asset ${fname}`);
  }
});

test('iqIcon(key) returns a path to an existing PNG, empty for unknown', () => {
  assert.ok(sandbox.iqIcon('fajr').includes('assets/icons/emoji_u1f305.png'));
  assert.strictEqual(sandbox.iqIcon('definitely_not_a_key'), '');
});

test('iqSrc resolves ids through grammar maps', () => {
  const resolved = sandbox.iqSrc('quran');
  assert.ok(/<\/?.+>/.test(resolved) === false); // iqSrc returns a path, not a tag
  assert.ok(resolved.endsWith('.png'));
});