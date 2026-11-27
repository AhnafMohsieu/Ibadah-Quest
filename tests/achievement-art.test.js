'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');

function loadAppScripts(files, globals) {
  const sandbox = Object.assign({
    window: {},
    console,
    Math,
    Object,
    Array,
    String,
    Number,
    Boolean,
    localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} }
  }, globals || {});
  sandbox.window = sandbox;
  for (const f of files) {
    const code = fs.readFileSync(path.join(root, f), 'utf8');
    vm.runInNewContext(code, sandbox, { filename: f });
  }
  return sandbox;
}

function listSvgs(relDir) {
  const out = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const abs = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(abs);
      else if (entry.name.endsWith('.svg')) out.push(abs);
    }
  }
  walk(path.join(root, relDir));
  return out.sort();
}

test('achievement art registry maps every achievement ID in ACHS', () => {
  const sb = loadAppScripts(['data/achievements.js', 'data/achievement-art.js']);
  const achs = vm.runInNewContext(
    fs.readFileSync(path.join(root, 'data/achievements.js'), 'utf8') + '\nACHS;',
    {}
  );
  assert.strictEqual(achs.length, 304, 'ACHS should preserve all 304 achievements');
  const map = sb.IQ_ACHIEVEMENT_ART;
  const missing = Array.from(achs.filter(a => !map[a.id]).map(a => a.id));
  assert.deepStrictEqual(missing, [], 'every ACHS id must be mapped in IQ_ACHIEVEMENT_ART: ' + missing.join(','));
  assert.strictEqual(Object.keys(map).length, achs.length, 'registry should have no orphan mappings');
});

test('every mapped badge and functional icon SVG exists on disk', () => {
  const sb = loadAppScripts(['data/achievement-art.js']);
  const uniqueBadgePaths = new Set(Object.values(sb.IQ_ACHIEVEMENT_ART).map(x => x.src));
  assert.ok(uniqueBadgePaths.size >= 30, 'expected reusable family of distinct badge SVGs');
  for (const rel of uniqueBadgePaths) {
    assert.ok(fs.existsSync(path.join(root, rel)), 'missing badge SVG: ' + rel);
  }
  for (const [key, rel] of Object.entries(sb.IQ_ACHIEVEMENT_ICONS)) {
    assert.ok(fs.existsSync(path.join(root, rel)), 'missing functional icon SVG for ' + key + ': ' + rel);
  }
});

test('all badge and functional icon SVGs contain zero text, tspan, or font directives', () => {
  const badgeSvgs = listSvgs('assets/badges');
  const iconSvgs = listSvgs('assets/achievement-icons');
  assert.strictEqual(badgeSvgs.length, 37, 'expected 37 unique badge SVGs');
  assert.strictEqual(iconSvgs.length, 18, 'expected 18 functional icon SVGs');

  for (const abs of badgeSvgs) {
    const svg = fs.readFileSync(abs, 'utf8');
    assert.ok(svg.includes('viewBox="0 0 512 512"'), 'badge must use 512x512 canvas: ' + abs);
    assert.ok(!/<text\b/i.test(svg) && !/<tspan\b/i.test(svg) && !/font-family/i.test(svg),
      'badge SVG must not contain text/typography: ' + abs);
  }
  for (const abs of iconSvgs) {
    const svg = fs.readFileSync(abs, 'utf8');
    assert.ok(svg.includes('viewBox="0 0 128 128"'), 'functional icon must use 128x128 canvas: ' + abs);
    assert.ok(!/<text\b/i.test(svg) && !/<tspan\b/i.test(svg) && !/font-family/i.test(svg),
      'functional icon SVG must not contain text/typography: ' + abs);
  }
});

test('missing achievement id and icon key fall back to valid existing assets', () => {
  const sb = loadAppScripts(['data/achievement-art.js']);
  const fbArt = sb.getAchievementArt('non_existent_ach_id');
  assert.ok(fbArt && fbArt.src && fs.existsSync(path.join(root, fbArt.src)));
  const fbIcon = sb.getAchievementIconSrc('non_existent_icon_key');
  assert.ok(fbIcon && fs.existsSync(path.join(root, fbIcon)));
});

test('system icon assets and all 109 sticker-badge PNG icons exist and are valid', () => {
  const iconsDir = path.join(root, 'assets', 'icons');
  for (const sys of ['app-icon-192.png', 'app-icon-512.png', 'favicon.png', 'icon.svg', 'icon-v2.svg']) {
    const p = path.join(iconsDir, sys);
    assert.ok(fs.existsSync(p), 'missing system asset: ' + sys);
    assert.ok(fs.statSync(p).size > 200, 'system asset unexpectedly empty: ' + sys);
  }
  for (const sysSvg of ['icon.svg', 'icon-v2.svg']) {
    const s = fs.readFileSync(path.join(iconsDir, sysSvg), 'utf8');
    assert.ok(!/<text\b|<tspan\b|font-family/i.test(s), sysSvg + ' must not contain text');
  }
  const pngs = fs.readdirSync(iconsDir).filter(f => f.startsWith('emoji_u') && f.endsWith('.png'));
  assert.strictEqual(pngs.length, 110, 'expected all 110 app icon PNGs');
  for (const f of pngs) {
    assert.ok(fs.statSync(path.join(iconsDir, f)).size > 500, 'icon PNG invalid/empty: ' + f);
  }
});

test('all 8 rarity tiers are defined in IQ_RARITY_META and styled in CSS', () => {
  const sb = loadAppScripts(['data/achievement-art.js']);
  const css = fs.readFileSync(path.join(root, 'styles', 'main.css'), 'utf8');
  const tiers = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'legendary', 'mythic', 'jannah'];
  for (const t of tiers) {
    assert.ok(sb.IQ_RARITY_META[t], 'missing rarity meta for ' + t);
    assert.ok(css.includes(`.iq-badge.tier-${t}`), 'missing badge CSS treatment for ' + t);
  }
});

test('renderAchievementBadge supports unlocked, locked, revealing, and optional progress states', () => {
  const sb = loadAppScripts(['data/achievement-art.js']);
  const unlockedHtml = sb.renderAchievementBadge({ id: 'a1', tier: 'gold' }, { unlocked: true, size: 'lg', animate: true });
  assert.ok(unlockedHtml.includes('is-unlocked'));
  assert.ok(unlockedHtml.includes('is-revealing'));
  assert.ok(unlockedHtml.includes('tier-gold'));
  assert.ok(unlockedHtml.includes('assets/badges/prayer/first-step.svg'));
  assert.ok(!unlockedHtml.includes('iq-badge-lock'));

  const lockedHtml = sb.renderAchievementBadge({ id: 'a1', tier: 'gold' }, { unlocked: false, size: 'md' });
  assert.ok(lockedHtml.includes('is-locked'));
  assert.ok(lockedHtml.includes('iq-badge-lock'));
  assert.ok(lockedHtml.includes('assets/badges/prayer/first-step.svg'));
  assert.ok(!lockedHtml.includes('iq-badge-prog'));

  const progHtml = sb.renderAchievementBadge({ id: 'a1', tier: 'gold' }, { unlocked: false, progress: { current: 3, target: 5 } });
  assert.ok(progHtml.includes('iq-badge-prog'));
  assert.ok(progHtml.includes('width:60%'));
});

test('Trophy Cabinet renderAch integrates badge artwork, preserves counts, and renders locked/unlocked cards', () => {
  const achArea = { innerHTML: '' };
  const fakeDoc = {
    getElementById: (id) => (id === 'achArea' ? achArea : null),
    createElement: () => ({ style: {}, setAttribute: () => {}, appendChild: () => {}, remove: () => {} })
  };
  const ACHS = vm.runInNewContext(
    fs.readFileSync(path.join(root, 'data/achievements.js'), 'utf8') + '\nACHS;',
    {}
  );
  const S = { ua: { a1: '2026-11-27', p1: '2026-11-27' }, xp: 0, tp: 1, cs: 1, lv: 1, td: {}, vc: {} };
  const sb = loadAppScripts(['data/achievement-art.js', 'core/dynamic.js'], {
    ACHS,
    S,
    document: fakeDoc,
    iqIcon: () => '',
    escapeHTML: (v) => String(v),
    markDirty: () => {},
    clearDirty: () => {},
    saveState: () => {},
    SHOP: [],
    PRAYERS: [],
    VOLUNTARY: [],
    DEEDS: [],
    QUESTS: []
  });

  sb.renderAch();
  assert.ok(achArea.innerHTML.includes('2 / 304 Unlocked'), 'unlock count must stay exact');
  assert.ok(achArea.innerHTML.includes('assets/badges/prayer/first-step.svg'), 'a1 badge must render');
  assert.ok(achArea.innerHTML.includes('assets/badges/prayer/eternal-servant.svg'), 'p1 badge must render');
  assert.ok(achArea.innerHTML.includes('assets/achievement-icons/achievements.svg'), 'functional icon in header');
  assert.ok(achArea.innerHTML.includes('assets/achievement-icons/lock.svg'), 'locked cards include lock overlay');
});

test('Achievement Showcase renders featured badge artwork and empty state cleanly', () => {
  const showcaseEl = { innerHTML: '' };
  const ACHS = [
    { id: 'a1', name: 'First Step', desc: 'Complete 1 prayer', tier: 'bronze' },
    { id: 'a2', name: 'Perfect Day', desc: 'All 5 prayers in a day', tier: 'gold' }
  ];
  const S = { ua: { a1: true, a2: true }, achievementShowcase: { featured: ['a1'] } };
  const sb = loadAppScripts(['data/achievement-art.js', 'features/achievement-showcase.js'], {
    ACHS, S, saveState: () => {}, toast: () => {}, iqIcon: () => '',
    document: { getElementById: (id) => (id === 'achievementShowcase' ? showcaseEl : null) }
  });

  sb.renderAchievementShowcase();
  assert.ok(showcaseEl.innerHTML.includes('assets/badges/prayer/first-step.svg'));
  assert.ok(showcaseEl.innerHTML.includes('First Step'));

  S.achievementShowcase.featured = [];
  sb.renderAchievementShowcase();
  assert.ok(showcaseEl.innerHTML.includes('showcase-empty'));
  assert.ok(showcaseEl.innerHTML.includes('assets/achievement-icons/achievements.svg'));
});

test('checkA unlock toast receives collectible badge artwork and preserves S.ua', () => {
  const toasts = [];
  const ACHS = [
    { id: 'a1', name: 'First Step', desc: 'Complete 1 prayer', tier: 'bronze', c: s => s.tp >= 1 }
  ];
  const S = { ua: {}, tp: 1 };
  const sb = loadAppScripts(['data/achievement-art.js', 'core/achievements.js'], {
    ACHS, S, today: () => '2026-11-27', saveState: () => {},
    toast: (icon, msg, conf, ms) => toasts.push({ icon, msg, conf, ms }),
    renderDynamic: () => {}, markDirty: () => {}, iqIcon: () => '',
    setTimeout: (fn) => fn()
  });

  sb.checkA();
  assert.strictEqual(S.ua.a1, '2026-11-27');
  assert.strictEqual(toasts.length, 1);
  assert.ok(toasts[0].icon.includes('iq-badge'));
  assert.ok(toasts[0].icon.includes('is-revealing'));
  assert.ok(toasts[0].icon.includes('assets/badges/prayer/first-step.svg'));
  assert.ok(toasts[0].msg.includes('First Step'));
  assert.ok(toasts[0].conf === true);
});

test('offline precache manifest includes achievement-art.js and all badge + functional icon SVGs', () => {
  const manifestSrc = fs.readFileSync(path.join(root, 'core', 'precache-manifest.js'), 'utf8');
  const sb = {};
  vm.createContext(sb);
  sb.self = sb;
  vm.runInContext(manifestSrc + '\nthis.LIST = self.__PRECACHE;', sb);
  assert.ok(sb.LIST.includes('data/achievements.js'));
  assert.ok(sb.LIST.includes('data/achievement-art.js'));
  for (const abs of [...listSvgs('assets/badges'), ...listSvgs('assets/achievement-icons')]) {
    const rel = path.relative(root, abs).replace(/\\/g, '/');
    assert.ok(sb.LIST.includes(rel), 'precache manifest missing ' + rel);
  }
});
