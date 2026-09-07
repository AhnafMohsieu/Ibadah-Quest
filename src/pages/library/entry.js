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
  { id: 'dynasties', label: 'Dynasties & Battles', tabs: [
    { id: 'umayyads', label: 'Umayyads' }, { id: 'abbasids', label: 'Abbasids' },
    { id: 'andalus', label: 'Andalus' }, { id: 'ottomans', label: 'Ottomans' },
    { id: 'mamluks', label: 'Mamluks' }, { id: 'seljuks', label: 'Seljuks' },
    { id: 'fatimids', label: 'Fatimids' }, { id: 'ayyubids', label: 'Ayyubids' },
    { id: 'modernhist', label: 'Modern Hist.' }, { id: 'ancientprophets', label: 'Ancient' },
    { id: 'battles', label: 'Battles' }, { id: 'civilisation', label: 'Civilisation' },
  ]},
  { id: 'cities', label: 'Cities & Lands', tabs: [
    { id: 'mecca', label: 'Mecca' }, { id: 'medina', label: 'Medina' },
    { id: 'jerusalem', label: 'Jerusalem' }, { id: 'damascus', label: 'Damascus' },
    { id: 'baghdad', label: 'Baghdad' }, { id: 'cairo', label: 'Cairo' },
    { id: 'cordoba', label: 'Cordoba' }, { id: 'istanbul', label: 'Istanbul' },
    { id: 'bukhara', label: 'Bukhara' }, { id: 'samarkand', label: 'Samarkand' },
  ]},
  { id: 'arts', label: 'Arts & Crafts', tabs: [
    { id: 'calligraphy', label: 'Calligraphy' }, { id: 'architecture', label: 'Architecture' },
    { id: 'geometry', label: 'Geometry' }, { id: 'poetryart', label: 'Poetry' },
    { id: 'literature', label: 'Literature' }, { id: 'nasheeds', label: 'Nasheeds' },
    { id: 'illumination', label: 'Illumination' }, { id: 'textiles', label: 'Textiles' },
    { id: 'ceramics', label: 'Ceramics' }, { id: 'woodwork', label: 'Woodwork' },
  ]},
  { id: 'arabic_lang', label: 'Arabic Language', tabs: [
    { id: 'arabic', label: 'Alphabet' }, { id: 'arabicgrammar', label: 'Grammar' },
    { id: 'vocab', label: 'Vocab' }, { id: 'rhetoric', label: 'Rhetoric' },
    { id: 'morphology', label: 'Morphology' }, { id: 'pronunciation', label: 'Tajweed' },
    { id: 'poetry', label: 'Poetry' }, { id: 'proverbs', label: 'Proverbs' },
    { id: 'etymology', label: 'Etymology' }, { id: 'dialects', label: 'Dialects' },
    { id: 'scripts', label: 'Scripts' },
  ]},
  { id: 'philosophy', label: 'Philosophy & Thought', tabs: [
    { id: 'epistemology', label: 'Epistemology' }, { id: 'ontology', label: 'Ontology' },
    { id: 'logic', label: 'Logic' }, { id: 'kalam', label: 'Kalam' },
    { id: 'reason', label: 'Reason' }, { id: 'freewill', label: 'Free Will' },
    { id: 'problemofevil', label: 'Prob of Evil' },
    { id: 'prophethood', label: 'Prophethood' }, { id: 'existence', label: 'Existence' },
  ]},
];

const TAB_SCRIPTS = {
  umayyads: ['render/static.js'], abbasids: ['render/static.js'],
  andalus: ['render/static.js'], ottomans: ['render/static.js'],
  mamluks: ['render/static.js'], seljuks: ['render/static.js'],
  fatimids: ['render/static.js'], ayyubids: ['render/static.js'],
  modernhist: ['render/static.js'], ancientprophets: ['render/static.js'],
  battles: ['render/static.js'], civilisation: ['render/static.js'],
  mecca: ['render/static.js'], medina: ['render/static.js'],
  jerusalem: ['render/static.js'], damascus: ['render/static.js'],
  baghdad: ['render/static.js'], cairo: ['render/static.js'],
  cordoba: ['render/static.js'], istanbul: ['render/static.js'],
  bukhara: ['render/static.js'], samarkand: ['render/static.js'],
  calligraphy: ['render/static.js'], architecture: ['render/static.js'],
  geometry: ['render/static.js'], poetryart: ['render/static.js'],
  literature: ['render/static.js'], nasheeds: ['render/static.js'],
  illumination: ['render/static.js'], textiles: ['render/static.js'],
  ceramics: ['render/static.js'], woodwork: ['render/static.js'],
  arabic: ['render/static.js'], arabicgrammar: ['render/static.js'],
  vocab: ['render/static.js'], rhetoric: ['render/static.js'],
  morphology: ['render/static.js'], pronunciation: ['render/static.js'],
  poetry: ['render/static.js'], proverbs: ['render/static.js'],
  etymology: ['render/static.js'], dialects: ['render/static.js'],
  scripts: ['render/static.js'],
  epistemology: ['render/static.js'], ontology: ['render/static.js'],
  logic: ['render/static.js'], kalam: ['render/static.js'],
  reason: ['render/static.js'], freewill: ['render/static.js'],
  problemofevil: ['render/static.js'], prophethood: ['render/static.js'],
  existence: ['render/static.js'],
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
    modernhist: 'renderModernhist', ancientprophets: 'renderAncientprophets',
    battles: 'renderBattles', civilisation: 'renderCivilisation',
    mecca: 'renderMecca', medina: 'renderMedina',
    jerusalem: 'renderJerusalem', damascus: 'renderDamascus',
    baghdad: 'renderBaghdad', cairo: 'renderCairo',
    cordoba: 'renderCordoba', istanbul: 'renderIstanbul',
    bukhara: 'renderBukhara', samarkand: 'renderSamarkand',
    calligraphy: 'renderCalligraphy', architecture: 'renderArchitecture',
    geometry: 'renderGeometry', poetryart: 'renderPoetryart',
    literature: 'renderLiterature', nasheeds: 'renderNasheeds',
    illumination: 'renderIllumination', textiles: 'renderTextiles',
    ceramics: 'renderCeramics', woodwork: 'renderWoodwork',
    arabic: 'renderArabic', arabicgrammar: 'renderArabicgrammar',
    vocab: 'renderVocab', rhetoric: 'renderRhetoric',
    morphology: 'renderMorphology', pronunciation: 'renderPronunciation',
    poetry: 'renderPoetry', proverbs: 'renderProverbs',
    etymology: 'renderEtymology', dialects: 'renderDialects',
    scripts: 'renderScripts',
    epistemology: 'renderEpistemology', ontology: 'renderOntology',
    logic: 'renderLogic', kalam: 'renderKalam',
    reason: 'renderReason', freewill: 'renderFreewill',
    problemofevil: 'renderProblemofevil', prophethood: 'renderProphethood',
    existence: 'renderExistence',
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
