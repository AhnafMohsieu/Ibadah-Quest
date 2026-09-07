// tests/no-globals.test.js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

function walk(dir, out) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, e.name);
    if (e.isDirectory()) { walk(abs, out); } else if (e.name.endsWith('.js')) out.push(abs);
  }
  return out;
}

test('src/ contains zero window.* writes', () => {
  const files = walk(path.join(__dirname, '..', 'src'), []);
  const offenders = files.filter((f) => /window\.[A-Za-z_$][\w$]*\s*=/.test(fs.readFileSync(f, 'utf8')));
  assert.deepEqual(offenders, []);
});
