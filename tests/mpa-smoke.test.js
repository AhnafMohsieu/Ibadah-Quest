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

test('knowledge/library bridges resolve every tab (scripts + renderer)', () => {
  for (const [page, group] of [['knowledge', 'KNOWLEDGE_GROUPS'], ['library', 'LIBRARY_GROUPS']]) {
    const entry = fs.readFileSync(path.join(__dirname, '..', `src/pages/${page}/entry.js`), 'utf8');
    const gm = entry.match(new RegExp('const ' + group + '\\s*=\\s*(\\[[\\s\\S]*?\\n\\]);'));
    assert.ok(gm, group + ' must exist in ' + page + '/entry.js');
    // tab ids live inside `tabs: [...]` — every tab id must have bridge entries.
    const tabIds = [...gm[1].matchAll(/tabs:\s*\[([\s\S]*?)\]/g)]
      .flatMap((m) => [...m[1].matchAll(/id:\s*'([^']+)'/g)].map((t) => t[1]));
    assert.ok(tabIds.length > 0, page + ' must declare tab ids');
    for (const id of tabIds) {
      assert.ok(entry.includes(`${id}: 'render`) || entry.includes(`'${id}': 'render`),
        `${page}: RENDERERS missing tab ${id}`);
      assert.ok(entry.includes(`${id}: ['render`) || entry.includes(`'${id}': ['render`),
        `${page}: TAB_SCRIPTS missing tab ${id}`);
    }
  }
});
