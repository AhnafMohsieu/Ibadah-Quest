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

test('renderHeartRefinement renders a stage-gated SVG scene without clobbering renderHeart', () => {
  const { sandbox, el } = loadSpiritual(feature('heart'));
  assert.strictEqual(typeof sandbox.window.renderHeartRefinement, 'function', 'renderHeartRefinement not exported');
  assert.strictEqual(sandbox.window.renderHeart, undefined, 'must not clobber knowledge-pool renderHeart');
  sandbox.window.renderHeartRefinement();
  assert.ok(el.innerHTML.includes('<svg'), 'heart SVG missing');
  assert.ok(el.innerHTML.includes('Stage 3/7'), 'stage badge missing');
});

test('garden treeSVG renders a real scene', () => {
  const { sandbox, el } = loadSpiritual(path.join(__dirname, '..', 'features', 'garden.js'));
  sandbox.window.renderGarden();
  assert.ok(el.innerHTML.includes('class="garden-svg"'), 'garden SVG must carry garden-svg class');
  assert.ok(el.innerHTML.includes('Stage 3/7'), 'stage badge missing');
});

test('renderLantern renders a real SVG scene', () => {
  const { sandbox, el } = loadSpiritual(feature('lantern'));
  sandbox.window.renderLantern();
  assert.ok(el.innerHTML.includes('<svg'), 'lantern SVG missing');
  assert.ok(el.innerHTML.includes('spiritual-svg'), 'lantern must use spiritual-svg class');
});

test('renderMosque renders a real SVG scene', () => {
  const { sandbox, el } = loadSpiritual(feature('mosque'));
  sandbox.window.renderMosque();
  assert.ok(el.innerHTML.includes('<svg'), 'mosque SVG missing');
  assert.ok(el.innerHTML.includes('Stage 3/7'), 'stage badge missing');
});