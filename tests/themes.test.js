'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const { loadFile } = require('./helpers/load.js');

function createDocument() {
  let dataTheme = null;
  const doc = {
    documentElement: {
      setAttribute: (name, value) => { if (name === 'data-theme') dataTheme = value; },
      removeAttribute: (name) => { if (name === 'data-theme') dataTheme = null; },
      getAttribute: (name) => { if (name === 'data-theme') return dataTheme; return null; },
      style: {}
    },
    querySelector: (sel) => {
      if (sel === 'meta[name="theme-color"]') {
        return { setAttribute: () => {} };
      }
      if (sel === '.tab-panel.active') {
        return { id: 'panel-home' };
      }
      return null;
    },
    querySelectorAll: () => []
  };
  return doc;
}

function setup(overrides) {
  const doc = createDocument();
  const sandbox = loadFile(path.join(__dirname, '..', 'core', 'themes.js'), Object.assign({
    window: { Themes: [{ key: 'light' }, { key: 'serene' }, { key: 'royal' }] },
    S: { theme: 'light' },
    localStorage: {
      store: {},
      getItem: function(key) { return this.store[key] || null; },
      setItem: function(key, value) { this.store[key] = value; },
      removeItem: function(key) { delete this.store[key]; }
    },
    saveState: () => {},
    updateTopBar: () => {},
    renderTab: () => {},
    document: doc,
    getComputedStyle: () => ({ getPropertyValue: () => '' })
  }, overrides || {}));
  return sandbox;
}

test('setTheme: valid theme sets it', () => {
  const s = setup();
  s.window.setTheme('serene');
  assert.strictEqual(s.S.theme, 'serene');
  assert.strictEqual(s.localStorage.getItem('iqTheme'), 'serene');
});

test('setTheme: invalid theme falls back to light', () => {
  const s = setup();
  s.window.setTheme('invalid');
  assert.strictEqual(s.S.theme, 'light');
  assert.strictEqual(s.localStorage.getItem('iqTheme'), 'light');
});

test('toggleTheme: cycles through themes', () => {
  const s = setup();
  s.localStorage.setItem('iqTheme', 'light');
  s.window.toggleTheme();
  assert.strictEqual(s.localStorage.getItem('iqTheme'), 'serene');
  s.window.toggleTheme();
  assert.strictEqual(s.localStorage.getItem('iqTheme'), 'royal');
  s.window.toggleTheme();
  assert.strictEqual(s.localStorage.getItem('iqTheme'), 'light'); // cycles back
});

test('applyTheme: applies correct data-theme attribute', () => {
  const s = setup();
  s.S.theme = 'serene';
  s.window.applyTheme();
  assert.strictEqual(s.document.documentElement.getAttribute('data-theme'), 'serene');
});

test('applyTheme: light theme removes data-theme attribute', () => {
  const s = setup();
  s.S.theme = 'light';
  s.window.applyTheme();
  assert.strictEqual(s.document.documentElement.getAttribute('data-theme'), null);
});