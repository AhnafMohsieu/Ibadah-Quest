// src/pages/names/entry.js — Names page (Allah's names, prophets, companions, women, scholars)
import '../../core/error-tap.js';
import { renderShell } from '../../shell/layout.js';
import { renderCategoryNav } from '../../shell/tabs.js';

document.getElementById('shell').innerHTML = renderShell('names');
const main = document.getElementById('page');
main.innerHTML = '<div class="cat-chips" id="namesChips"></div>'
  + '<div class="tier2-tabs" id="namesTabs"></div>'
  + '<div id="namesPanels"></div>';
const chipEl = document.getElementById('namesChips');
const tabEl = document.getElementById('namesTabs');
const panelsEl = document.getElementById('namesPanels');

const NAMES_GROUPS = [
  { id: 'names', label: 'Names', tabs: [
    { id: 'allah_names', label: "Allah's Names" },
    { id: 'prophets', label: 'Prophets' },
    { id: 'sahaba', label: 'Companions' },
    { id: 'women', label: 'Great Women' },
    { id: 'scholars_names', label: 'Scholars' },
  ]},
];

const TAB_SCRIPTS = {
  allah_names: ['render/static.js'],
  prophets: ['render/static.js'], sahaba: ['render/static.js'],
  women: ['render/static.js'], scholars_names: ['render/static.js'],
};

const CORE_SCRIPTS = ['core/xp.js', 'core/random.js', 'core/dhikr.js', 'core/content.js'];

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
  const RENDERERS = {
    allah_names: 'renderNames',
    prophets: 'renderProphets', sahaba: 'renderSahaba',
    women: 'renderWomen', scholars_names: 'renderScholars',
  };
  const fnName = RENDERERS[tabId];
  if (fnName && window[fnName]) { try { window[fnName](); } catch {} }
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

const nav = renderCategoryNav(chipEl, tabEl, NAMES_GROUPS, { onTabActivate });
nav.activateFirst();
