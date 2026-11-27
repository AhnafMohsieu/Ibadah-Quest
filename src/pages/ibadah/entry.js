// src/pages/ibadah/entry.js — Ibadah page with category-chip + tier-3 tab navigation
import '../../core/error-tap.js';
import { renderShell } from '../../shell/layout.js';
import { renderCategoryNav } from '../../shell/tabs.js';

// Legacy globals (S, currentUser, PREFIX, saveState, etc.) are set by
// mpa-bridge.js loaded via <script> in ibadah.html before this module.

// --- 1. Render shell ---
document.getElementById('shell').innerHTML = renderShell('ibadah');
const main = document.getElementById('page');

// --- 2. Create tab navigation + panels container ---
main.innerHTML = '<div class="cat-chips" id="ibadahChips"></div>'
  + '<div class="tier2-tabs" id="ibadahTabs"></div>'
  + '<div id="ibadahPanels"></div>';
const chipEl = document.getElementById('ibadahChips');
const tabEl = document.getElementById('ibadahTabs');
const panelsEl = document.getElementById('ibadahPanels');

// --- 3. TAB_GROUPS for ibadah (matches data/tab-groups.js) ---
const IBADAH_GROUPS = [
  { id: 'core', label: 'Core', tabs: [
    { id: 'today', label: 'Today' },
    { id: 'timer', label: 'Prayer Times' },
    { id: 'quests', label: 'Quests' },
    { id: 'journeys', label: 'Journeys' },
  ]},
  { id: 'adhkar', label: 'Adhkar', tabs: [
    { id: 'morning', label: 'Morning' },
    { id: 'evening', label: 'Evening' },
    { id: 'dhikr', label: 'Remembrance' },
    { id: 'situational', label: 'Situational' },
  ]},
  { id: 'worship', label: 'Guide', tabs: [
    { id: 'wudu', label: 'Ablution' },
    { id: 'salah', label: 'Prayer Guide' },
    { id: 'sunnahs', label: 'Prophetic Ways' },
    { id: 'extradeeds', label: 'Extra Deeds' },
    { id: 'volprayers', label: 'Vol. Prayers' },
  ]},
  { id: 'tracking', label: 'Self-Tracking', tabs: [
    { id: 'fasting', label: 'Fasting' },
    { id: 'healthlog', label: 'Health' },
    { id: 'finance', label: 'Finance' },
    { id: 'memorization', label: 'Memorization' },
    { id: 'gratitude', label: 'Gratitude' },
    { id: 'charity', label: 'Charity' },
    { id: 'zakatcalc', label: 'Zakat' },
  ]},
];

// --- 4. Panel HTML per tab (DOM elements the renderers target) ---
const PANEL_HTML = {
  today: '<div id="wellArea"></div><div id="muhasabahEntry"></div><div id="prayerArea"></div><div id="gardenArea"></div><div class="section-title">Voluntary Prayers</div><div id="volArea"></div><div class="section-title">Extra Good Deeds</div><div id="deedArea"></div>',
  timer: '<div class="section-title">Next Prayer Countdown</div><div id="timerArea" style="text-align:center;font-size:clamp(2rem,12vw,3rem);font-weight:bold;color:var(--accent);margin:30px 0;"></div><div id="prayerNamesArea" style="text-align:center;color:var(--text2);"></div><div class="section-title">Prayer Times</div><div id="prayerTimesArea"></div>',
  quests: '<div id="questArea"></div>',
  journeys: '<div id="journeyArea"></div><div id="boatArea"></div>',
  morning: '<div id="morningArea"></div>',
  evening: '<div id="eveningArea"></div><div id="laylatArea"></div>',
  dhikr: '<div id="dhikrCounterArea"></div><div id="dhikrArea"></div><div id="lanternArea"></div>',
  situational: '<div id="situationalArea"></div>',
  wudu: '<div id="wuduArea"></div>',
  salah: '<div id="salahArea"></div>',
  sunnahs: '<div id="sunnahsArea"></div>',
  extradeeds: '<div id="extradeedsArea"></div>',
  volprayers: '<div id="volprayersArea"></div>',
  fasting: '<div id="fastingArea"></div><div id="ramadanArea"></div>',
  healthlog: '<div id="healthlogArea"></div>',
  finance: '<div id="financeArea"></div>',
  memorization: '<div id="memorizationArea"></div>',
  gratitude: '<div id="gratitudeArea"></div>',
  charity: '<div id="charityArea"></div>',
  zakatcalc: '<div id="zakatcalcArea"></div>',
};

// --- 5. Script URLs to lazy-load per tab (classic IIFEs that register window.* renderers) ---
const TAB_SCRIPTS = {
  today: ['/core/static.js', '/core/dynamic.js', '/features/garden.js', '/features/muhasabah.js'],
  timer: ['/core/prayers.js'],
  quests: ['/core/dynamic.js', '/core/quests.js', '/core/achievements.js'],
  journeys: ['/data/journeys.js', '/features/journeys.js', '/features/spiritual-growth/boat.js'],
  morning: ['/core/static.js'],
  evening: ['/core/static.js', '/features/spiritual-growth/laylat.js'],
  dhikr: ['/core/static.js', '/features/widgets/dhikr-counter.js', '/features/spiritual-growth/lantern.js'],
  situational: ['/core/static.js'],
  wudu: ['/core/static.js'],
  salah: ['/core/static.js'],
  sunnahs: ['/core/static.js'],
  extradeeds: ['/core/static.js'],
  volprayers: ['/core/static.js'],
  fasting: ['/core/static.js', '/features/spiritual-growth/ramadan.js'],
  healthlog: ['/features/health.js'],
  finance: ['/features/finance.js'],
  memorization: ['/core/static.js'],
  gratitude: ['/core/static.js'],
  charity: ['/core/static.js'],
  zakatcalc: ['/features/zakat-calc.js'],
};

const CORE_SCRIPTS = ['/core/xp.js', '/core/random.js', '/core/dhikr.js', '/core/content.js'];

const _loaded = new Set();
function loadScripts(urls) {
  const pending = urls.filter((u) => !_loaded.has(u));
  if (pending.length === 0) return Promise.resolve();
  return Promise.all(pending.map((url) => new Promise((resolve) => {
    _loaded.add(url);
    const s = document.createElement('script');
    s.src = url;
    s.onload = resolve;
    s.onerror = resolve;
    document.body.appendChild(s);
  })));
}

// --- 6. Tab activation ---
let activePanel = null;

function fireRenderers(tabId) {
  const S = window.S;
  switch (tabId) {
    case 'today':
      try { window.renderPrayers && window.renderPrayers(); } catch {}
      try { window.renderVol && window.renderVol(); } catch {}
      try { window.renderDeeds && window.renderDeeds(); } catch {}
      try { window.renderBonus && window.renderBonus(); } catch {}
      try { window.renderTopBar && window.renderTopBar(); } catch {}
      break;
    case 'timer':
      try { window.renderPrayerTimes && window.renderPrayerTimes(); } catch {}
      break;
    case 'quests':
      try { window.renderQ && window.renderQ(); } catch {}
      try { window.renderAch && window.renderAch(); } catch {}
      break;
    case 'journeys':
      try { window.renderJourneys && window.renderJourneys(); } catch {}
      try { window.renderBoat && window.renderBoat(); } catch {}
      break;
    case 'dhikr':
      try { window.renderDhikr && window.renderDhikr(); } catch {}
      try { window.renderLantern && window.renderLantern(); } catch {}
      break;
    case 'evening':
      try { window.renderEvening && window.renderEvening(); } catch {}
      try { window.renderLaylat && window.renderLaylat(); } catch {}
      break;
    case 'fasting':
      try { window.renderFasting && window.renderFasting(); } catch {}
      try { window.renderRamadan && window.renderRamadan(); } catch {}
      break;
    default: {
      const fnName = {
        morning: 'renderMorning', evening: 'renderEvening',
        dhikr: 'renderDhikr', situational: 'renderSituationalDhikr',
        wudu: 'renderWudu', salah: 'renderSalah', sunnahs: 'renderSunnahs',
        extradeeds: 'renderExtraDeeds', volprayers: 'renderVolPrayers',
        fasting: 'renderFasting', healthlog: 'renderHealthLog',
        finance: 'renderFinance', memorization: 'renderMemorization',
        gratitude: 'renderGratitude', charity: 'renderCharity',
        zakatcalc: 'renderZakatCalc',
      }[tabId];
      if (fnName && window[fnName]) { try { window[fnName](); } catch {} }
    }
  }
}

function onTabActivate(tabId) {
  if (activePanel) activePanel.style.display = 'none';

  let panel = document.getElementById('panel-' + tabId);
  if (!panel) {
    panel = document.createElement('div');
    panel.id = 'panel-' + tabId;
    panel.className = 'tab-panel';
    panel.innerHTML = PANEL_HTML[tabId] || '<div id="' + tabId + 'Area"></div>';
    panelsEl.appendChild(panel);
  }
  panel.style.display = 'block';
  activePanel = panel;

  const urls = [...CORE_SCRIPTS, ...(TAB_SCRIPTS[tabId] || [])];
  loadScripts(urls).then(() => fireRenderers(tabId));
}

// --- 7. Initialize navigation ---
const nav = renderCategoryNav(chipEl, tabEl, IBADAH_GROUPS, { onTabActivate });
nav.activateFirst();
