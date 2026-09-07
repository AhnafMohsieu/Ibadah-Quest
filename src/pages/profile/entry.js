// src/pages/profile/entry.js — Profile page with flat tabs
import '../../core/error-tap.js';
import { renderShell } from '../../shell/layout.js';
import { renderFlatTabs } from '../../shell/tabs.js';

document.getElementById('shell').innerHTML = renderShell('profile');
const main = document.getElementById('page');
main.innerHTML = '<div class="tier2-tabs" id="profileTabs"></div><div id="profilePanels"></div>';
const tabEl = document.getElementById('profileTabs');
const panelsEl = document.getElementById('profilePanels');

const PROFILE_TABS = [
  { id: 'profile', label: 'Profile' },
  { id: 'trophies', label: 'Trophies' },
  { id: 'progress', label: 'Progress' },
  { id: 'stats', label: 'Analytics' },
  { id: 'rewards', label: 'Rewards' },
];

const TAB_SCRIPTS = {
  profile: ['render/dynamic.js', 'core/achievements.js', 'features/spiritual-growth/keys.js', 'features/spiritual-growth/mosque.js'],
  trophies: ['render/dynamic.js', 'core/achievements.js', 'features/achievement-showcase.js'],
  progress: ['render/dynamic.js'],
  stats: ['analytics/dashboard.js', 'analytics/charts.js', 'analytics/trend-charts.js', 'analytics/weekly-compare.js', 'analytics/smart-insights.js'],
  rewards: ['core/shop.js', 'core/xp.js'],
};

const CORE_SCRIPTS = ['core/xp.js', 'core/random.js'];

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

let activePanel = null;

function fireRenderers(tabId) {
  switch (tabId) {
    case 'profile':
      try { window.renderProfile && window.renderProfile(); } catch {}
      try { window.renderKeys && window.renderKeys(); } catch {}
      try { window.renderMosque && window.renderMosque(); } catch {}
      break;
    case 'trophies':
      try { window.renderAch && window.renderAch(); } catch {}
      break;
    case 'progress':
      try { window.renderProg && window.renderProg(); } catch {}
      break;
    case 'stats':
      try { window.Dashboard && window.Dashboard.renderInsights && window.Dashboard.renderInsights(); } catch {}
      break;
    case 'rewards':
      try { window.renderShop && window.renderShop(); } catch {}
      break;
  }
}

function onTabActivate(tabId) {
  if (activePanel) activePanel.style.display = 'none';
  let panel = document.getElementById('panel-' + tabId);
  if (!panel) {
    panel = document.createElement('div');
    panel.id = 'panel-' + tabId;
    panel.className = 'tab-panel';
    panel.innerHTML = '<div id="' + tabId + 'Area"></div>';
    panelsEl.appendChild(panel);
  }
  panel.style.display = 'block';
  activePanel = panel;
  const urls = [...CORE_SCRIPTS, ...(TAB_SCRIPTS[tabId] || [])];
  loadScripts(urls).then(() => fireRenderers(tabId));
}

renderFlatTabs(tabEl, PROFILE_TABS, { onTabActivate });
