'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const tabGroupsSrc = fs.readFileSync(path.join(root, 'data', 'tab-groups.js'), 'utf8');
const tabsSrc = fs.readFileSync(path.join(root, 'core', 'tabs.js'), 'utf8');

function createTabSandbox() {
  const dom = {
    attributes: {},
    activePanel: null,
    panels: {},
    buttons: []
  };

  const makeMockEl = (tag, dataTab, dataCat) => ({
    tagName: tag.toUpperCase(),
    dataset: {},
    classList: {
      _classes: new Set(),
      add: function(c) { this._classes.add(c); },
      remove: function(c) { this._classes.delete(c); },
      toggle: function(c, v) { if (v) this._classes.add(c); else this._classes.delete(c); },
      contains: function(c) { return this._classes.has(c); }
    },
    getAttribute: (attr) => {
      if (attr === 'data-tab') return dataTab || null;
      if (attr === 'data-cat') return dataCat || null;
      return null;
    },
    setAttribute: () => {},
    removeAttribute: () => {},
    style: {},
    innerHTML: '',
    textContent: ''
  });

  const sandbox = {
    window: {},
    console,
    iqIcon: () => '★',
    t: (k) => k,
    S: { lastCat: 'ibadah', lastSub: 'today' },
    saveState: () => {},
    document: {
      body: {
        setAttribute: (k, v) => { dom.attributes[k] = v; },
        getAttribute: (k) => dom.attributes[k]
      },
      getElementById: (id) => {
        if (!dom.panels[id]) dom.panels[id] = makeMockEl('div', id.replace('panel-', ''));
        return dom.panels[id];
      },
      querySelector: (sel) => {
        if (sel === '.bnav-btn.active') return makeMockEl('button', null, dom.attributes['data-active-segment'] || 'ibadah');
        return makeMockEl('div');
      },
      querySelectorAll: (sel) => {
        if (sel.includes('.tab-panel')) return Object.values(dom.panels);
        return [];
      },
      addEventListener: () => {},
      removeEventListener: () => {}
    },
    history: { pushState: () => {} }
  };
  sandbox.window = sandbox;

  vm.runInNewContext(tabGroupsSrc, sandbox);
  sandbox.window.TAB_GROUPS = sandbox.TAB_GROUPS;
  vm.runInNewContext(tabsSrc, sandbox);

  return { sandbox, dom };
}

test('cross-category tab routing: switching to quran routes to worship segment', () => {
  const { sandbox, dom } = createTabSandbox();
  sandbox.window.activateTab('quran');
  assert.strictEqual(sandbox.S.lastCat, 'worship');
  assert.strictEqual(dom.attributes['data-active-segment'], 'worship');
  assert.strictEqual(dom.attributes['data-active-tab'], 'quran');
});

test('cross-category tab routing: switching to hadith or allah_names routes to knowledge segment', () => {
  const { sandbox, dom } = createTabSandbox();
  sandbox.window.activateTab('hadith');
  assert.strictEqual(sandbox.S.lastCat, 'knowledge');
  assert.strictEqual(dom.attributes['data-active-segment'], 'knowledge');
  sandbox.window.activateTab('allah_names');
  assert.strictEqual(sandbox.S.lastCat, 'knowledge');
  assert.strictEqual(dom.attributes['data-active-segment'], 'knowledge');
  assert.strictEqual(dom.attributes['data-active-tab'], 'allah_names');
});

test('legacy tab aliases redirect gracefully to consolidated tabs', () => {
  const { sandbox, dom } = createTabSandbox();
  sandbox.window.activateTab('zakatcalc');
  assert.strictEqual(sandbox.S.lastSub, 'charity');
  assert.strictEqual(sandbox.S.lastCat, 'worship');
  sandbox.window.activateTab('gratitude');
  assert.strictEqual(sandbox.S.lastSub, 'healthlog');
  assert.strictEqual(dom.attributes['data-active-segment'], 'worship');
  sandbox.window.activateTab('rewards');
  assert.strictEqual(sandbox.S.lastSub, 'profile');
  assert.strictEqual(sandbox.S.lastCat, 'profile_main');
});

test('cross-category tab routing: switching to profile tab auto-updates segment to profile_main', () => {
  const { sandbox, dom } = createTabSandbox();
  sandbox.window.activateTab('trophies');
  assert.strictEqual(sandbox.S.lastCat, 'profile_main');
  assert.strictEqual(dom.attributes['data-active-segment'], 'profile_main');
  assert.strictEqual(dom.attributes['data-active-tab'], 'trophies');
});

test('cross-category tab routing: switching back to today auto-updates segment to ibadah', () => {
  const { sandbox, dom } = createTabSandbox();
  sandbox.window.activateTab('hadith');
  assert.strictEqual(sandbox.S.lastCat, 'knowledge');
  sandbox.window.activateTab('today');
  assert.strictEqual(sandbox.S.lastCat, 'ibadah');
  assert.strictEqual(dom.attributes['data-active-segment'], 'ibadah');
  assert.strictEqual(dom.attributes['data-active-tab'], 'today');
});
