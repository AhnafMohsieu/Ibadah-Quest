// tests/mpa-smoke.test.js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

test('today page entry imports shell and no heavy pools', () => {
  const entry = fs.readFileSync(path.join(__dirname, '..', 'src/pages/today/entry.js'), 'utf8');
  assert.match(entry, /renderShell/);
  assert.doesNotMatch(entry, /quran-verses/);
  assert.doesNotMatch(entry, /hadiths\.js/);
  const html = fs.readFileSync(path.join(__dirname, '..', 'src/pages/today/today.html'), 'utf8');
  assert.match(html, /type="module"/);
});
