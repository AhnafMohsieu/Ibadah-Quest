// src/pages/knowledge/entry.js — Knowledge page with categorized tabs
import '../../core/error-tap.js';
import { renderShell } from '../../shell/layout.js';
import { renderCategoryNav } from '../../shell/tabs.js';

document.getElementById('shell').innerHTML = renderShell('knowledge');
const main = document.getElementById('page');
main.innerHTML = '<div class="cat-chips" id="knowledgeChips"></div>'
  + '<div class="tier2-tabs" id="knowledgeTabs"></div>'
  + '<div id="knowledgePanels"></div>';
const chipEl = document.getElementById('knowledgeChips');
const tabEl = document.getElementById('knowledgeTabs');
const panelsEl = document.getElementById('knowledgePanels');

const KNOWLEDGE_GROUPS = [
  { id: 'quran_sunnah', label: "Qur'an & Sunnah", tabs: [
    { id: 'quran', label: 'Quran' }, { id: 'tafsir', label: 'Interpretation' },
    { id: 'hadith', label: 'Hadith' }, { id: 'sunnahs', label: 'Prophetic Ways' },
  ]},
  { id: 'fiqh', label: 'Fiqh & Rulings', tabs: [
    { id: 'fiqh', label: 'Jurisprudence' },
    { id: 'worship-rulings', label: 'Worship Rulings' },
    { id: 'wealth-oaths', label: 'Wealth & Oaths' },
  ]},
  { id: 'arabic', label: 'Arabic', tabs: [
    { id: 'arabic', label: 'Arabic' },
  ]},
  { id: 'heart', label: 'Heart & Soul', tabs: [
    { id: 'virtues', label: 'Virtues' },
    { id: 'vices-return', label: 'Vices & Repentance' },
    { id: 'character-path', label: 'Character & Path' },
  ]},
  { id: 'society', label: 'Dealings & Society', tabs: [
    { id: 'family-life', label: 'Family Life' }, { id: 'community', label: 'Community' },
    { id: 'service', label: 'Service & Care' }, { id: 'work-justice', label: 'Work & Justice' },
  ]},
  { id: 'life', label: 'Life & Modern', tabs: [
    { id: 'wellness', label: 'Wellness' }, { id: 'earth-living', label: 'Earth & Living' },
    { id: 'youth-tech', label: 'Youth & Tech' }, { id: 'ethics-finance', label: 'Ethics & Finance' },
  ]},
  { id: 'history', label: 'History & Seerah', tabs: [
    { id: 'seerah', label: 'Biography' },
    { id: 'stories', label: 'Stories' }, { id: 'battles', label: 'Battles' },
    { id: 'science', label: 'Science' }, { id: 'modernhist', label: 'Modern Hist.' },
    { id: 'ancientprophets', label: 'Ancient' },
  ]},
  { id: 'hereafter', label: 'Hereafter', tabs: [
    { id: 'akhirah', label: 'Hereafter' }, { id: 'jannah', label: 'Paradise' },
    { id: 'jahannam', label: 'Hellfire' }, { id: 'grave', label: 'The Grave' },
    { id: 'signs', label: 'Signs of Qiyamah' }, { id: 'dreams', label: 'Islamic Dreams' },
  ]},
];

// Most knowledge tabs use poolRender from render/static.js via specific renderer functions.
// quran and hadith use render/dynamic.js.
const TAB_SCRIPTS = {
  quran: ['render/dynamic.js', 'data/pools/quran-verses.js'],
  hadith: ['render/dynamic.js', 'data/pools/hadiths.js'],
  tafsir: ['render/static.js'], sunnahs: ['render/static.js'],
  fiqh: ['render/static.js'],
  'worship-rulings': ['render/static.js'], 'wealth-oaths': ['render/static.js'],
  arabic: ['render/static.js'],
  virtues: ['render/static.js'],
  'vices-return': ['render/static.js'], 'character-path': ['render/static.js'],
  'family-life': ['render/static.js'], community: ['render/static.js'],
  service: ['render/static.js'], 'work-justice': ['render/static.js'],
  wellness: ['render/static.js'], 'earth-living': ['render/static.js'],
  'youth-tech': ['render/static.js'], 'ethics-finance': ['render/static.js'],
  seerah: ['render/static.js'],
  stories: ['render/static.js'], battles: ['render/static.js'],
  science: ['render/static.js'], modernhist: ['render/static.js'],
  ancientprophets: ['render/static.js'],
  akhirah: ['render/static.js'], jannah: ['render/static.js'],
  jahannam: ['render/static.js'], grave: ['render/static.js'],
  signs: ['render/static.js'], dreams: ['render/static.js'],
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
    quran: 'renderQuran', tafsir: 'renderTafsir',
    hadith: 'renderHadith', sunnahs: 'renderSunnahs',
    fiqh: 'renderFiqh',
    'worship-rulings': 'renderWorshiprulings', 'wealth-oaths': 'renderWealthoaths',
    arabic: 'renderArabic',
    virtues: 'renderVirtues',
    'vices-return': 'renderVicesreturn', 'character-path': 'renderCharacterpath',
    'family-life': 'renderFamilylife', community: 'renderCommunity',
    service: 'renderService', 'work-justice': 'renderWorkjustice',
    wellness: 'renderWellness', 'earth-living': 'renderEarthliving',
    'youth-tech': 'renderYouthtech', 'ethics-finance': 'renderEthicsfinance',
    seerah: 'renderSeerah',
    stories: 'renderStories', battles: 'renderBattles',
    science: 'renderScience', modernhist: 'renderModernhist',
    ancientprophets: 'renderAncientprophets',
    akhirah: 'renderAkhirah', jannah: 'renderJannah',
    jahannam: 'renderJahannam', grave: 'renderGrave',
    signs: 'renderSigns', dreams: 'renderDreams',
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

const nav = renderCategoryNav(chipEl, tabEl, KNOWLEDGE_GROUPS, { onTabActivate });
nav.activateFirst();
