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
const renderDynamic = fs.readFileSync(path.join(root, 'render', 'dynamic.js'), 'utf8');
const renderStatic = fs.readFileSync(path.join(root, 'render', 'static.js'), 'utf8');
const renderPrayers = fs.readFileSync(path.join(root, 'render', 'prayers.js'), 'utf8');
const renderCalendar = fs.readFileSync(path.join(root, 'render', 'calendar.js'), 'utf8');
const renderAll = render + renderDynamic + renderStatic + renderPrayers + renderCalendar;
const spiritual = fs.readFileSync(path.join(root, 'features', 'spiritual-growth', 'data.js'), 'utf8');
const spiritualGrowth = fs.readFileSync(path.join(root, 'features', 'spiritual-growth', 'index.js'), 'utf8');
const actions = fs.readFileSync(path.join(root, 'core', 'actions.js'), 'utf8');
const dhikr = fs.readFileSync(path.join(root, 'core', 'dhikr.js'), 'utf8');
const themes = fs.readFileSync(path.join(root, 'core', 'themes.js'), 'utf8');
const meta = fs.readFileSync(path.join(root, 'data', 'theme-meta.js'), 'utf8');

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
  assert.ok(html.includes('<meta name="theme-color" content="#ddd3ea">'));
});

test('index.html does NOT load Tailwind CDN', () => {
  assert.ok(!html.includes('tailwindcss'));
});

test('index.html theme-color uses light base', () => {
  assert.ok(html.includes('content="#ddd3ea"'));
});

test('main.css uses modern light tokens', () => {
  assert.ok(css.includes('--emerald'));
  assert.ok(css.includes('--gold'));
  assert.ok(css.includes('--bg: #ddd3ea'));
});

test('index.html registers the service worker and update banner', () => {
  assert.ok(html.includes("navigator.serviceWorker.register('sw.js?v=15')"));
  assert.ok(html.includes("'SKIP_WAITING'"));
  assert.ok(html.includes('swUpdateBanner'));
});

test('shell surfaces use glass and arch corners', () => {
  assert.ok(css.includes('backdrop-filter'));
  assert.ok(css.includes('border-radius: 14px 14px 6px 6px') || css.includes('border-radius: var(--radius) var(--radius) 6px 6px'));
  assert.ok(css.includes('.t1-btn.active'));
});



test('cards apply claymorphism surfaces with rose accents', () => {
  assert.ok(css.includes('.card-item:hover') || css.includes('.card-item'));
  assert.ok(css.includes('background: var(--card-bg)') || css.includes('.content-card'));
  const cardClasses = ['.card-item', '.vol-card', '.deed-card', '.content-card', '.shop-card', '.prayer-card', '.spiritual-card'];
  assert.ok(cardClasses.some((sel) => {
    const idx = css.indexOf(sel);
    return idx > -1 && css.slice(idx, idx + 400).includes('var(--shadow-dark)');
  }));
});

test('redesign keeps core markers and PWA meta intact', () => {
  assert.ok(html.includes('rel="manifest"'));
  assert.ok(html.includes('gardenArea'));
  assert.ok(tabs.includes("id: 'journeys'"));
});

test('modern light clay theme: uses the new bg and clay accents', () => {
  assert.ok(css.includes('--bg: #ddd3ea'));
  assert.ok(css.includes('--shadow-light'));
  assert.ok(css.includes('--gold: #f43f5e'));
  assert.ok(css.includes('backdrop-filter'));
});

test('modern light theme: old emerald/gold dark backgrounds are removed', () => {
  assert.ok(!css.includes('--bg: #0b1513'));
  assert.ok(!css.includes('--emerald: #10b981'));
  assert.ok(!css.includes('--gold: #D4AF37'));
});

test('theme: light-family palette blocks exist in main.css', () => {
  for (const key of ['serene','royal','sand','midnight','cream']) {
    assert.ok(css.includes(`html[data-theme="${key}"]`), `missing palette block for ${key}`);
  }
  assert.ok(css.includes('--bg: #ddd3ea'));   // light (default) :root block present
  assert.ok(!css.includes('html[data-theme="dark"]'), 'dark palette block must be removed');
  assert.ok(!css.includes('html[data-theme="night"]'), 'night palette block must be removed');
  assert.ok(!css.includes('html[data-theme="serene-dark"]'), 'serene-dark palette block must be removed');
});

test('theme: index.html pre-paint script sets data-theme from localStorage', () => {
  assert.ok(html.includes("localStorage.getItem('iqTheme')"));
  assert.ok(html.includes("setAttribute('data-theme'"));
  assert.ok(html.includes('styles/main.css?v=14'));
});

test('theme: picker references metadata and setTheme wiring', () => {
  assert.ok(renderAll.includes('Theme'));
  assert.ok(renderAll.includes('window.Themes'));
  assert.ok(renderAll.includes('App.setTheme('));
  assert.ok(renderAll.includes('theme-chip'));
});

test('theme: removed themes fall back to light via isValidTheme guard', () => {
  assert.ok(themes.includes('function isValidTheme'), 'isValidTheme helper missing');
  assert.ok(themes.includes('window.Themes || []'), 'isValidTheme must consult window.Themes');
  assert.ok(themes.includes('const safe = isValidTheme(t) ? t : \'light\''), 'applyTheme must fall back to light');
  assert.ok(themes.includes('isValidTheme(name) ? name : \'light\''), 'setTheme must fall back to light');
});

test('app shell has tab content container', () => {
  assert.ok(html.includes('id="mainContent"'), 'tab content container missing');
});

test('tab controller: switchTab dispatches renderTab', () => {
  assert.ok(actions.includes('switchTab'), 'switchTab function missing');
  assert.ok(actions.includes("App.switchTab"), 'App.switchTab export missing');
  assert.ok(actions.includes('renderTab'), 'renderTab dispatch missing');
  assert.ok(renderAll.includes('renderTop'), 'renderTop function missing');
});

test('intro overlay uses CSS vars for theme accent', () => {
  assert.ok(css.includes('.intro-bismillah'), 'intro-bismillah class missing');
  assert.ok(css.includes('.intro-btn'), 'intro-btn class missing');
  assert.ok(css.includes('var(--gold)'), 'intro must reference a theme CSS var');
});

test('theme-accent is defined as a CSS var and used in component styles', () => {
  assert.ok(css.includes('--gold:'), '--gold CSS var not defined');
  assert.ok(css.includes('var(--gold)'), 'theme var not used anywhere in CSS');
});

test('theme families have geometric pattern and animation transitions in CSS', () => {
  assert.ok(css.includes('transition: background 300ms'), 'crossfade transition missing');
  assert.ok(css.includes('transition: transform 200ms'), 'card hover transition missing');
  assert.ok(css.includes('.geometric-bg'), 'geometric pattern container missing');
  assert.ok(css.includes('html[data-theme="serene"]') && css.includes('pattern'), 'geometric pattern for serene missing');
});

test('FEATURE_ICONS are populated with iqIcon output for all 9 features', () => {
  for (const f of ['garden','lantern','keys','mosque','boat','heart','armor','ramadan','laylat']) {
    assert.ok(spiritual.includes(`iqIcon('`), 'data.js must call iqIcon() for FEATURE_ICONS');
    assert.ok(spiritual.includes(`${f}: iqIcon(`), `missing populated icon for ${f}`);
  }
});

test('FEATURE_STAGES includes heart with 7 stages', () => {
  assert.ok(spiritual.includes('heart: ['));
  const heartBlock = spiritual.slice(spiritual.indexOf('heart: ['), spiritual.indexOf('ramadan: ['));
  const names = (heartBlock.match(/name: '([^']+)'/g) || []);
  assert.strictEqual(names.length, 7);
});

test('growth tab + settings render icons through iqIcon, no mojibake separator', () => {
  assert.ok(spiritualGrowth.indexOf('iqIcon(progress.icon') > -1,
    'growth tab stage emoji must be wrapped in iqIcon()');
  assert.ok(!spiritualGrowth.includes(' ? Stage'),
    'growth tab stage label must not contain mojibake " ? "');
  assert.ok(spiritualGrowth.indexOf('iqIcon(progress.icon || f)') > -1,
    'growth settings icon fallback must be wrapped in iqIcon()');
});

test('index.html declares armor/heart growth areas and loads their scripts', () => {
  assert.ok(html.includes('id="armorArea"'), 'armorArea missing');
  assert.ok(html.includes('id="heartArea"'), 'heartArea missing');
  assert.ok(html.includes('features/spiritual-growth/armor.js'), 'armor script missing');
  assert.ok(html.includes('features/spiritual-growth/heart.js'), 'heart script missing');
});

test('growth renderers are wired into renderDynamic and tab render paths', () => {
  for (const name of ['renderKeys','renderMosque','renderRamadan','renderLaylat','renderHeartRefinement','renderArmor']) {
    assert.ok(renderAll.includes(`window.${name}`), `renderDynamic must reference ${name}`);
  }
  for (const key of ["keys:'renderKeys'","mosque:'renderMosque'","ramadan:'renderRamadan'","laylat:'renderLaylat'"]) {
    assert.ok(actions.includes(key), `_lazyRender must map ${key}`);
  }
  assert.ok(actions.indexOf('renderHeartRefinement') > -1, 'renderTab must call renderHeartRefinement');
  assert.ok(actions.indexOf('renderArmor') > -1, 'renderTab must call renderArmor');
});

test('spiritual and garden cards get aligned grid sizing', () => {
  assert.ok(css.includes('.garden-tree svg'), 'garden SVG needs explicit sizing');
  assert.ok(css.includes('min-width: 0') || css.includes('min-width:0'), 'spiritual-info needs min-width guard');
  assert.ok(css.includes('align-items: stretch') && css.includes('.growth-tab-grid'), 'growth grid needs stretch alignment');
});

test('99 Names tab renders premium golden centered name cards', () => {
  const fnIdx = renderAll.indexOf('function renderNames');
  assert.ok(fnIdx > -1, 'renderNames must exist');
  const body = renderAll.slice(fnIdx, fnIdx + 1200);
  assert.ok(body.includes('name-card'), 'names must use scoped name-card class');
  assert.ok(body.includes('"content-arabic name-an"'), 'arabic must get centered golden styling');
  assert.ok(body.includes('name-roman'), 'transliterated name must be rendered');
  assert.ok(body.includes('content-card name-card'), 'card must combine content-card and name-card');
});

test('99 Names name-card styles exist', () => {
  assert.ok(css.includes('.name-card'), 'name-card style missing');
  assert.ok(css.includes('.name-an'), 'arabic name style missing');
  assert.ok(css.includes('.name-roman'), 'transliterated name style missing');
  const anIdx = css.indexOf('.name-card .name-an');
  assert.ok(anIdx > -1, 'arabic golden style missing');
  assert.ok(css.slice(anIdx, anIdx + 300).includes('var(--gold)'), 'arabic must use gold token');
  assert.ok(css.slice(anIdx, anIdx + 300).includes('text-align: center'), 'arabic must be centered');
});

test('dhikr reset button renders icon without leaked concatenation text', () => {
  const fnIdx = renderAll.indexOf('function renderDhikrCounter');
  assert.ok(fnIdx > -1, 'renderDhikrCounter must exist');
  const body = renderAll.slice(fnIdx, fnIdx + 2000);
assert.ok(body.includes("App.resetDhikr()"), 'reset button must call resetDhikr');
  assert.ok(body.includes('${iqIcon("refresh-cw")} Reset') || body.includes("${iqIcon('refresh-cw')} Reset"), 'reset icon must be interpolated via template literal');
  assert.ok(body.includes('refresh-cw'), 'refresh icon referenced');
});

test('dhikr tap grants per-tap XP, completion bonus, and auto-resets counter', () => {
  const fnIdx = dhikr.indexOf('function tapDhikr');
  assert.ok(fnIdx > -1, 'tapDhikr must exist in core/dhikr.js');
  const body = dhikr.slice(fnIdx, fnIdx + 1600);
  assert.ok(body.includes('S.xp += 1;') || body.includes('S.xp+=1;'), 'per-tap dhikr XP +1 missing');
  assert.ok(body.includes('S.xp += 20') || body.includes('S.xp+=20'), 'dhikr completion bonus +20 missing');
  assert.ok(body.includes('S.dhikrCounters[idx] = 0'), 'counter must auto-reset on completion');
  assert.ok(body.includes('checkLevelUp'), 'level up must be evaluated after xp');
  assert.ok(body.includes('S.lv = lvFrom(S.xp)'), 'level recomputed after xp');
});

test('fasting toggle grants 50 XP on day checked and revokes on uncheck', () => {
  const fnIdx = renderAll.indexOf('function toggleFasting');
  assert.ok(fnIdx > -1, 'toggleFasting must exist');
  const body = renderAll.slice(fnIdx, fnIdx + 700);
  assert.ok(body.includes('S.xp += 50') || body.includes('S.xp+=50'), 'fasting day must grant 50 XP');
  assert.ok(body.includes('S.xp = Math.max(0'), 'unchecking must revoke XP without going negative');
  assert.ok(body.includes('levelUpToast'), 'level up must be evaluated after fasting XP');
  assert.ok(body.includes('S.lv = lvFrom(S.xp)'), 'level recomputed after fasting XP');
});

test('health logging grants 25 XP once per day per reached milestone', () => {
  const health = fs.readFileSync(path.join(root, 'features', 'health.js'), 'utf8');
  assert.ok(health.includes('xp += 25') || health.includes('xp+=25'), 'milestone must grant 25 XP');
  assert.ok(health.includes('S.healthXpClaimed') || health.includes('_xp'), 'claimed milestones must be tracked to avoid repeat grants');
  assert.ok(health.includes('saveState'), 'state saved after XP grant');
  assert.ok(health.includes('levelUpToast'), 'level up evaluated after health XP');
});

test('prayer timer tab renders its countdown and times grid', () => {
  assert.ok(html.includes('id="panel-timer"'), 'timer panel present');
  assert.ok(html.includes('id="timerArea"'), 'countdown area present');
  assert.ok(html.includes('id="prayerNamesArea"'), 'prayer names area present');
  assert.ok(html.includes('id="prayerTimesArea"'), 'prayer times grid area present');
  assert.ok(renderAll.includes("prayertimes: renderPrayerTimes"),
    'renderPrayerTimes must be wired into PANEL_RENDERERS');
  assert.ok(actions.includes("timer:'renderPrayerTimes'"),
    '_lazyRender must map timer tab to renderPrayerTimes');
  assert.ok(css.includes('.prayer-times-grid') && css.includes('.pt-card'),
    'prayer times grid styles present');
});

test('top-bar: orphan renderTip call is removed from renderTab', () => {
  assert.ok(!actions.includes('window.renderTip()'), 'orphan renderTip() must not be called');
  assert.ok(!actions.includes('renderTip();'), 'renderTip reference must be gone');
  assert.ok(actions.includes('window.renderTopBar();'), 'renderTopBar still called from renderTab');
});

test('top-bar: updateTopBar delegates to renderTopBar (single writer)', () => {
  const fnIdx = actions.indexOf('function updateTopBar');
  assert.ok(fnIdx > -1, 'updateTopBar must exist');
  const body = actions.slice(fnIdx, fnIdx + 220);
  assert.ok(body.includes('window.renderTopBar'), 'updateTopBar must call renderTopBar');
  assert.ok(!body.includes("getElementById('tbXP')"), 'updateTopBar must not write pills directly');
  assert.ok(!body.includes("getElementById('tbStreak')"), 'updateTopBar must not write streak directly');
});

test('hero header markup is restored with all ids', () => {
  for (const id of ['headerCrescent','lvNum','lvTitle','xpBar','xpLabel','strDays','strMsg','bestStr','streakFire']) {
    assert.ok(html.includes(`id="${id}"`), `missing hero id ${id}`);
  }
  assert.ok(html.includes('Ibadah Quest'), 'hero title must be present');
  assert.ok(html.includes('Submission. Grow. Earn. Ascend.'), 'hero tagline must be present');
});

test('hero renderers are real and wired into renderDynamic', () => {
  assert.ok(renderAll.includes("getElementById('xpBar')"), 'renderLv must update xpBar');
  assert.ok(renderAll.includes("getElementById('lvTitle')"), 'renderLv must update lvTitle');
  assert.ok(renderAll.includes('STREAK_MSGS'), 'renderStr must use STREAK_MSGS');
  assert.ok(renderAll.includes("getElementById('bestStr')"), 'renderStr must update bestStr');
  assert.ok(renderAll.includes("getElementById('headerCrescent')"), 'renderLv must fill the moon');
  assert.ok(renderAll.includes("getElementById('streakFire')"), 'renderStr must fill the flame');
  assert.ok(renderAll.includes("lv: renderLv"), 'renderLv wired into PANEL_RENDERERS');
  assert.ok(renderAll.includes("str: renderStr"), 'renderStr wired into PANEL_RENDERERS');
  assert.ok(renderAll.includes("topbar: renderTopBar"), 'renderTopBar wired into PANEL_RENDERERS');
});

test('hero+topbar refresh on theme change and home tab', () => {
  assert.ok(actions.includes('renderDynamic();'), 'setTheme must call renderDynamic');
  const homeCall = actions.slice(actions.indexOf("name === 'home'"));
  assert.ok(homeCall.includes('window.renderTopBar();'), 'renderTab(home) calls renderTopBar');
});

test('theme: Emara jade-and-gold palette block exists', () => {
  assert.ok(css.includes('html[data-theme="emara"]'), 'emara palette block missing');
  assert.ok(css.includes('--bg: #123027'), 'emara background is deep jade');
  assert.ok(css.includes('--gold: #d4af37'), 'emara accent is gold');
  assert.ok(css.includes('--accent-rgb: 212,175,55'), 'emara accent rgb set');
});

test('theme: picker lists the Emara theme', () => {
  assert.ok(meta.includes("key:'emara'"), 'theme-meta lists emara');
  assert.ok(meta.includes("label:'Emara'"), 'theme-meta labels emara');
  assert.ok(meta.includes("bg:'#123027'"), 'emara swatch uses deep jade');
});

test('theme: theme toggle cycle drops dark and night', () => {
  assert.ok(themes.includes("'midnight', 'cream', 'emara'") || themes.includes("'emara']"), 'toggleTheme cycle includes cream/emara');
  assert.ok(!themes.includes("'dark'"), 'toggleTheme must not include dark');
  assert.ok(!themes.includes("'night'"), 'toggleTheme must not include night');
});

test('theme: Cream warm-gold palette block exists', () => {
  assert.ok(css.includes('html[data-theme="cream"]'), 'cream palette block missing');
  assert.ok(css.includes('--bg: #f7f0e1'), 'cream background is warm cream');
  assert.ok(css.includes('--gold: #b8860b'), 'cream accent is gold');
  assert.ok(css.includes('--accent-rgb: 184,134,11'), 'cream accent rgb set');
});

test('theme: picker metadata excludes dark and night', () => {
  assert.ok(meta.includes("key:'cream'"), 'theme-meta lists cream');
  assert.ok(meta.includes("label:'Cream'"), 'theme-meta labels cream');
  assert.ok(!meta.includes("key:'dark'"), 'theme-meta must not list dark');
  assert.ok(!meta.includes("key:'night'"), 'theme-meta must not list night');
});

test('hero header styles exist with clay tokens', () => {
  assert.ok(css.includes('.header-crescent'), 'crescent style missing');
  assert.ok(css.includes('@keyframes moonFloat'), 'moon float animation missing');
  assert.ok(css.includes('@keyframes xpWave'), 'xp wave animation missing');
  assert.ok(css.includes('.xp-inner'), 'xp bar style missing');
  assert.ok(css.includes('.streak-bar'), 'streak bar style missing');
  assert.ok(css.includes('.best-num'), 'best number style missing');
  assert.ok(!css.includes('html[data-theme="dark"] .streak-bar'), 'dark streak override must be removed');
  assert.ok(css.includes('html[data-theme="emara"] .streak-bar') || css.includes('html[data-theme="emara"]') , 'emara hero override present');
});
