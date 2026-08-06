'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const tabs = fs.readFileSync(path.join(root, 'data', 'tab-groups.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'styles', 'main.css'), 'utf8');
const render = fs.readFileSync(path.join(root, 'render', 'render.js'), 'utf8');
const spiritual = fs.readFileSync(path.join(root, 'features', 'spiritual-growth', 'data.js'), 'utf8');

test('index.html has the three feature containers', () => {
  assert.ok(html.includes('id="gardenArea"'));
  assert.ok(html.includes('id="muhasabahEntry"'));
  assert.ok(html.includes('id="muhasabahModal"'));
  assert.ok(html.includes('id="panel-journeys"'));
  assert.ok(html.includes('id="journeyArea"'));
});

test('index.html loads the feature scripts in order', () => {
  const i1 = html.indexOf('data/journeys.js');
  const i2 = html.indexOf('features/garden.js');
  const i3 = html.indexOf('features/muhasabah.js');
  const i4 = html.indexOf('features/journeys.js');
  assert.ok(i1 > -1 && i2 > -1 && i3 > -1 && i4 > -1);
  assert.ok(i1 < i2 && i2 < i3 && i3 < i4);
  assert.ok(i4 < html.indexOf('core/actions.js'));
});

test('leaderboard panel is removed', () => {
  assert.ok(!html.includes('panel-leaderboard'));
});

test('Journeys tab is wired into the ibadah group', () => {
  assert.ok(tabs.includes("id: 'journeys'"));
});

test('index.html declares the PWA manifest and theme color', () => {
  assert.ok(html.includes('<link rel="manifest" href="manifest.json">'));
  assert.ok(html.includes('<meta name="theme-color" content="#faf7f5">'));
  assert.ok(html.includes('rel="apple-touch-icon"'));
});

test('index.html loads Font Awesome and Tailwind CDN', () => {
  assert.ok(html.includes('cdnjs.cloudflare.com/ajax/libs/font-awesome'));
  assert.ok(html.includes('tailwindcss'));
});

test('index.html theme-color uses light base', () => {
  assert.ok(html.includes('content="#faf7f5"'));
});

test('main.css uses modern light tokens', () => {
  assert.ok(css.includes('--emerald'));
  assert.ok(css.includes('--gold'));
  assert.ok(css.includes('--bg: #faf7f5'));
});

test('index.html registers the service worker and update banner', () => {
  assert.ok(html.includes("navigator.serviceWorker.register('sw.js')"));
  assert.ok(html.includes("'SKIP_WAITING'"));
  assert.ok(html.includes('swUpdateBanner'));
});

test('shell surfaces use glass and arch corners', () => {
  assert.ok(css.includes('backdrop-filter'));
  assert.ok(css.includes('border-radius: 14px 14px 6px 6px') || css.includes('border-radius: var(--radius) var(--radius) 6px 6px'));
  assert.ok(css.includes('.t1-btn.active'));
});

test('tab-groups icons render Font Awesome i-tags', () => {
  assert.ok(tabs.includes('fa-solid') || tabs.includes('fa fa-'));
});

test('spiritual growth icon map uses FA glyphs', () => {
  assert.ok(spiritual.includes('fa-solid'));
});

test('render shell cards use Font Awesome glyphs', () => {
  assert.ok(render.includes('fa-solid'));
});

test('cards apply glass surfaces with rose active states', () => {
  assert.ok(css.includes('.card-item:hover') || css.includes('.card-item'));
  assert.ok(css.includes('background: var(--card)') || css.includes('.content-card'));
  const cardClasses = ['.card-item', '.vol-card', '.deed-card', '.content-card', '.shop-card', '.prayer-card', '.spiritual-card'];
  assert.ok(cardClasses.some((sel) => {
    const idx = css.indexOf(sel);
    return idx > -1 && css.slice(idx, idx + 400).includes('backdrop-filter');
  }));
});

test('redesign keeps core markers and PWA meta intact', () => {
  assert.ok(html.includes('rel="manifest"'));
  assert.ok(html.includes('gardenArea'));
  assert.ok(tabs.includes("id: 'journeys'"));
});

test('modern light glass theme: uses the new bg and glass accents', () => {
  assert.ok(css.includes('--bg: #faf7f5'));
  assert.ok(css.includes('rgba(255,255,255,0.62)'));
  assert.ok(css.includes('--gold: #f43f5e'));
  assert.ok(css.includes('backdrop-filter'));
});

test('modern light theme: old emerald/gold dark backgrounds are removed', () => {
  assert.ok(!css.includes('--bg: #0b1513'));
  assert.ok(!css.includes('--emerald: #10b981'));
  assert.ok(!css.includes('--gold: #D4AF37'));
});

test('dark theme: CSS maps the dark palette under the html[data-theme=dark] selector', () => {
  assert.ok(css.includes('html[data-theme="dark"]'));
  assert.ok(css.includes('--bg: #0d1216'));
  assert.ok(css.includes('backdrop-filter'));
});

test('dark theme: index.html applies saved theme before first paint (no-flash)', () => {
  assert.ok(html.includes("localStorage.getItem('iqTheme')"));
  assert.ok(html.includes("setAttribute('data-theme'"));
  assert.ok(html.includes('styles/main.css?v=3'));
});

test('theme: five families have both light and dark blocks in main.css', () => {
  for (const key of ['serene','serene-dark','royal','royal-dark','sand','sand-dark','midnight','midnight-dark']) {
    assert.ok(css.includes(`html[data-theme="${key}"]`), `missing palette block for ${key}`);
  }
  assert.ok(css.includes('html[data-theme="dark"]'));
  assert.ok(css.includes('--bg: #faf7f5'));   // light (default) block present
});

test('theme: picker references metadata and setTheme wiring', () => {
  assert.ok(render.includes('Theme'));
  assert.ok(render.includes('window.Themes'));
  assert.ok(render.includes('App.setTheme('));
});
