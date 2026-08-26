'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const fs = require('fs');
const vm = require('vm');

function loadSandbox(files, globals) {
  const sandbox = Object.assign({
    window: {},
    console,
    localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} }
  }, globals || {});
  for (const key of Object.keys(sandbox)) {
    if (key !== 'window' && typeof sandbox[key] !== 'undefined') {
      sandbox.window[key] = sandbox[key];
    }
  }
  for (const f of files) {
    const code = fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
    vm.runInNewContext(code, sandbox, { filename: f });
    if (sandbox.window) {
      for (const key of Object.keys(sandbox.window)) {
        sandbox[key] = sandbox.window[key];
      }
    }
  }
  return sandbox;
}

const sandbox = loadSandbox(['core/helpers.js']);
const escapeHTML = sandbox.escapeHTML;

test('escapeHTML escapes ampersand', () => {
  assert.strictEqual(escapeHTML('a&b'), 'a&amp;b');
});

test('escapeHTML escapes less-than', () => {
  assert.strictEqual(escapeHTML('a<b'), 'a&lt;b');
});

test('escapeHTML escapes greater-than', () => {
  assert.strictEqual(escapeHTML('a>b'), 'a&gt;b');
});

test('escapeHTML escapes double quote', () => {
  assert.strictEqual(escapeHTML('a"b'), 'a&quot;b');
});

test('escapeHTML escapes single quote', () => {
  assert.strictEqual(escapeHTML("a'b"), 'a&#39;b');
});

test('escapeHTML returns empty string for null/undefined', () => {
  assert.strictEqual(escapeHTML(null), '');
  assert.strictEqual(escapeHTML(undefined), '');
});

test('escapeHTML converts non-strings', () => {
  assert.strictEqual(escapeHTML(42), '42');
  assert.strictEqual(escapeHTML(0), '0');
});

test('escapeHTML handles mixed special characters', () => {
  assert.strictEqual(escapeHTML('<script>alert("xss")</script>'), '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
});

test('escapeHTML is exported on window', () => {
  assert.strictEqual(typeof sandbox.window.escapeHTML, 'function');
});
