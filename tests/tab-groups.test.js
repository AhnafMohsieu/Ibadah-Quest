'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const { loadFile } = require('./helpers/load.js');

function loadGroups() {
  const sb = loadFile(path.join(__dirname, '..', 'data', 'tab-groups.js'), {});
  return sb.window.TAB_GROUPS;
}

test('profile_main group is declared in data with the five core entries in order', () => {
  const g = loadGroups();
  assert.ok(Array.isArray(g.profile_main), 'profile_main must exist in data/tab-groups.js');
  assert.deepEqual(
    g.profile_main.map(t => t.id),
    ['profile', 'trophies', 'progress', 'stats', 'rewards']
  );
  g.profile_main.forEach(t => {
    assert.ok(t.label && t.icon, 'each entry needs icon+label: ' + JSON.stringify(t));
  });
});

test('every profile_main tab id has a matching panel in index.html', () => {
  const fs = require('fs');
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const g = loadGroups();
  g.profile_main.forEach(t => {
    assert.ok(html.includes(`id="panel-${t.id}"`), `missing panel-${t.id}`);
  });
});
