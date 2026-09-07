// tests/mpa-complete.test.js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

test('all 5 pages exist with module entries and shell nav', () => {
  for (const p of ['today', 'ibadah', 'knowledge', 'library', 'profile']) {
    const html = fs.readFileSync(path.join(__dirname, '..', `src/pages/${p}/${p}.html`), 'utf8');
    assert.match(html, /type="module"/);
    const entry = fs.readFileSync(path.join(__dirname, '..', `src/pages/${p}/entry.js`), 'utf8');
    assert.match(entry, new RegExp("renderShell\\(['\"]" + p + "['\"]\\)"));
    assert.match(entry, /import ['"]\.\.\/\.\.\/core\/error-tap\.js['"]/);
  }
  const sw = fs.readFileSync(path.join(__dirname, '..', 'sw.js'), 'utf8');
  assert.match(sw, /precache-manifest|PRECACHE/);
});
