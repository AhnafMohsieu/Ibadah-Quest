'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const { loadSpiritual } = require('./helpers/loadSpiritual');

const feature = (name) => path.join(__dirname, '..', 'features', 'spiritual-growth', name + '.js');

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

test('renderBoat renders a real SVG scene', () => {
  const { sandbox, el } = loadSpiritual(feature('boat'));
  sandbox.window.renderBoat();
  assert.ok(el.innerHTML.includes('<svg'), 'boat SVG missing');
  assert.ok(el.innerHTML.includes('Stage 3/7'), 'stage badge missing');
});

test('renderKeys renders a real SVG scene with per-stage key count', () => {
  const { sandbox, el } = loadSpiritual(feature('keys'));
  sandbox.window.renderKeys();
  assert.ok(el.innerHTML.includes('<svg'), 'keys SVG missing');
  assert.ok(el.innerHTML.includes('spiritual-svg'), 'keys must use spiritual-svg class');
});

test('renderRamadan renders a real SVG scene', () => {
  const { sandbox, el } = loadSpiritual(feature('ramadan'));
  sandbox.window.renderRamadan();
  assert.ok(el.innerHTML.includes('<svg'), 'ramadan SVG missing');
  assert.ok(el.innerHTML.includes('Stage 3/7'), 'stage badge missing');
});

test('renderLaylat renders a real SVG scene', () => {
  const { sandbox, el } = loadSpiritual(feature('laylat'));
  sandbox.window.renderLaylat();
  assert.ok(el.innerHTML.includes('<svg'), 'laylat SVG missing');
  assert.ok(el.innerHTML.includes('Stage 3/7'), 'stage badge missing');
});