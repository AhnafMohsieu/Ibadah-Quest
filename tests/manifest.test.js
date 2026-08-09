'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const fs = require('node:fs');

const ROOT = path.join(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'manifest.json'), 'utf8'));

test('manifest declares the app identity', () => {
  assert.strictEqual(manifest.name, 'Ibadah Quest');
  assert.strictEqual(manifest.short_name, 'IbadahQuest');
  assert.strictEqual(manifest.lang, 'en');
  assert.strictEqual(manifest.display, 'standalone');
  assert.strictEqual(manifest.start_url, './');
  assert.strictEqual(manifest.scope, './');
});

test('manifest uses the light base theme colors', () => {
  assert.strictEqual(manifest.theme_color, '#e8e0f0');
  assert.strictEqual(manifest.background_color, '#e8e0f0');
});

test('manifest declares no icons yet (will be re-added later)', () => {
  assert.strictEqual(manifest.icons, undefined);
});
