// src/pages/library/entry.js — Library page with categorized reference shelves
import '../../core/error-tap.js';
import { renderShell } from '../../shell/layout.js';
import { renderCategoryNav } from '../../shell/tabs.js';

document.getElementById('shell').innerHTML = renderShell('library');
const main = document.getElementById('page');
main.innerHTML = '<div class="cat-chips" id="libraryChips"></div>'
  + '<div class="tier2-tabs" id="libraryTabs"></div>'
  + '<div id="libraryPanels"></div>';
const chipEl = document.getElementById('libraryChips');
const tabEl = document.getElementById('libraryTabs');
const panelsEl = document.getElementById('libraryPanels');

const LIBRARY_GROUPS = [
  { id: 'dynasties', label: 'Dynasties', tabs: [
    { id: 'umayyads', label: 'Umayyads' }, { id: 'abbasids', label: 'Abbasids' },
    { id: 'andalus', label: 'Andalus' }, { id: 'ottomans', label: 'Ottomans' },
    { id: 'mamluks', label: 'Mamluks' }, { id: 'seljuks', label: 'Seljuks' },
    { id: 'fatimids', label: 'Fatimids' }, { id: 'ayyubids', label: 'Ayyubids' },
  ]},
  { id: 'cities', label: 'Cities & Lands', tabs: [
    { id: 'holy-cities', label: 'Holy Cities' },
    { id: 'capitals', label: 'Capitals' },
    { id: 'east', label: 'Lands of the East' },
  ]},
  { id: 'arts', label: 'Arts & Crafts', tabs: [
    { id: 'pattern', label: 'Pattern & Illumination' },
    { id: 'sacred-space', label: 'Sacred Space' },
    { id: 'living-crafts', label: 'Crafts & Nasheeds' },
    { id: 'word', label: 'Literature' },
  ]},
  { id: 'arabic_lang', label: 'Arabic Language', tabs: [
    { id: 'structure', label: 'Structure' },
    { id: 'sound-script', label: 'Sound & Script' },
    { id: 'words-poetry', label: 'Words & Poetry' },
  ]},
  { id: 'philosophy', label: 'Philosophy & Thought', tabs: [
    { id: 'being', label: 'Being' },
    { id: 'knowing', label: 'Reason & Knowing' },
    { id: 'will-evil', label: 'Will & Evil' },
  ]},
];

const TAB_SCRIPTS = {
  umayyads: ['render/static.js'], abbasids: ['render/static.js'],
  andalus: ['render/static.js'], ottomans: ['render/static.js'],
  mamluks: ['render/static.js'], seljuks: ['render/static.js'],
  fatimids: ['render/static.js'], ayyubids: ['render/static.js'],
  'holy-cities': ['render/static.js'], capitals: ['render/static.js'],
  east: ['render/static.js'],
  pattern: ['render/static.js'], 'sacred-space': ['render/static.js'],
  'living-crafts': ['render/static.js'], word: ['render/static.js'],
  structure: ['render/static.js'], 'sound-script': ['render/static.js'],
  'words-poetry': ['render/static.js'],
  being: ['render/static.js'], knowing: ['render/static.js'],
  'will-evil': ['render/static.js'],
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
    umayyads: 'renderUmayyads', abbasids: 'renderAbbasids',
    andalus: 'renderAndalus', ottomans: 'renderOttomans',
    mamluks: 'renderMamluks', seljuks: 'renderSeljuks',
    fatimids: 'renderFatimids', ayyubids: 'renderAyyubids',
    'holy-cities': 'renderHolycities', capitals: 'renderCapitals',
    east: 'renderEast',
    pattern: 'renderPattern', 'sacred-space': 'renderSacredspace',
    'living-crafts': 'renderLivingcrafts', word: 'renderWord',
    structure: 'renderStructure', 'sound-script': 'renderSoundscript',
    'words-poetry': 'renderWordspoetry',
    being: 'renderBeing', knowing: 'renderKnowing',
    'will-evil': 'renderWillevil',
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

const nav = renderCategoryNav(chipEl, tabEl, LIBRARY_GROUPS, { onTabActivate });
nav.activateFirst();
