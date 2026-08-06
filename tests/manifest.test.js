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
  assert.strictEqual(manifest.theme_color, '#faf7f5');
  assert.strictEqual(manifest.background_color, '#faf7f5');
});

test('manifest lists three icons and the files exist', () => {
  assert.strictEqual(manifest.icons.length, 3);
  const anyIcons = manifest.icons.filter(i => i.purpose === 'any');
  const maskable = manifest.icons.filter(i => i.purpose === 'maskable');
  assert.strictEqual(anyIcons.length, 2);
  assert.strictEqual(maskable.length, 1);
  assert.ok(anyIcons.some(i => i.sizes === '192x192'));
  assert.ok(anyIcons.some(i => i.sizes === '512x512'));
  assert.strictEqual(maskable[0].sizes, '512x512');
  for (const icon of manifest.icons) {
    assert.strictEqual(icon.type, 'image/png');
    assert.ok(fs.existsSync(path.join(ROOT, icon.src)), icon.src + ' missing');
  }
});
