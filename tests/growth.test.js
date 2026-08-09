'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const { loadSpiritual } = require('./helpers/loadSpiritual');

const feature = (name) => path.join(__dirname, '..', 'features', 'spiritual-growth', name + '.js');

test('renderArmor renders a stage-gated SVG scene', () => {
  const { sandbox, el } = loadSpiritual(feature('armor'));
  sandbox.window.renderArmor();
  assert.ok(el.innerHTML.includes('<svg'), 'armor SVG missing');
  assert.ok(el.innerHTML.includes('Stage 3/7'), 'stage badge missing');
  assert.ok(el.innerHTML.includes('spiritual-card'), 'card wrapper missing');
});