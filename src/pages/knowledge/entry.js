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
    { id: 'quran', label: 'Quran' }, { id: 'hadith', label: 'Hadith' },
    { id: 'tafsir', label: 'Interpretation' }, { id: 'seerah', label: 'Biography' },
  ]},
  { id: 'fiqh', label: 'Fiqh & Rulings', tabs: [
    { id: 'fiqh', label: 'Jurisprudence' }, { id: 'purification', label: 'Purification' },
    { id: 'salahrules', label: 'Salah' }, { id: 'zakatrules', label: 'Zakat' },
    { id: 'sawmrules', label: 'Sawm' }, { id: 'hajjrules', label: 'Hajj' },
    { id: 'trade', label: 'Trade' }, { id: 'inheritance', label: 'Inheritance' },
    { id: 'oaths', label: 'Oaths' },
  ]},
  { id: 'heart', label: 'Heart & Soul', tabs: [
    { id: 'aqeedah', label: 'Aqeedah' }, { id: 'heart', label: 'Heart Diseases' },
    { id: 'ikhlas', label: 'Sincerity' }, { id: 'tawakkul', label: 'Reliance' },
    { id: 'manners', label: 'Manners' }, { id: 'patience', label: 'Patience' },
    { id: 'sins', label: 'Major Sins' }, { id: 'repentance', label: 'Repentance' },
    { id: 'zuhd', label: 'Asceticism' }, { id: 'inspirations', label: 'Inspirations' },
    { id: 'stories', label: 'Stories' }, { id: 'sufism', label: 'Sufism' },
    { id: 'tazkiyah', label: 'Tazkiyah' }, { id: 'fear', label: 'Fear of Allah' },
    { id: 'hope', label: 'Hope' }, { id: 'loveofallah', label: 'Love of Allah' },
    { id: 'contentment', label: 'Contentment' }, { id: 'reflection', label: 'Reflection' },
    { id: 'dreams', label: 'Dreams' },
  ]},
  { id: 'society', label: 'Dealings & Society', tabs: [
    { id: 'family', label: 'Family' }, { id: 'marriage', label: 'Marriage' },
    { id: 'parenting', label: 'Parenting' }, { id: 'work', label: 'Career' },
    { id: 'neighbors', label: 'Neighbors' }, { id: 'community', label: 'Community' },
    { id: 'ummah', label: 'Global Nation' }, { id: 'dawah', label: 'Invitation' },
    { id: 'punishments', label: 'Justice' }, { id: 'brotherhood', label: 'Brotherhood' },
    { id: 'sisterhood', label: 'Sisterhood' }, { id: 'orphans2', label: 'Orphans' },
    { id: 'elderly', label: 'Elderly' }, { id: 'disabled', label: 'Disabled' },
    { id: 'antiracism', label: 'Anti-Racism' }, { id: 'poverty', label: 'Poverty' },
    { id: 'volunteering', label: 'Volunteering' },
  ]},
  { id: 'life', label: 'Life & Modern', tabs: [
    { id: 'health', label: 'Health' }, { id: 'tibb', label: 'Prophetic Medicine' },
    { id: 'food', label: 'Halal Food' }, { id: 'environment', label: 'Environment' },
    { id: 'travel', label: 'Travel' }, { id: 'youth', label: 'Youth' },
    { id: 'tech', label: 'Tech & Islam' }, { id: 'technology', label: 'Technology' },
    { id: 'socialmedia', label: 'Social Media' }, { id: 'ethics', label: 'Ethics' },
    { id: 'bioethics', label: 'Bioethics' }, { id: 'modfinance', label: 'Mod. Finance' },
    { id: 'politics', label: 'Politics' }, { id: 'green', label: 'Green Islam' },
    { id: 'mentalhealth', label: 'Mental Health' }, { id: 'education', label: 'Education' },
    { id: 'science', label: 'Science' },
  ]},
  { id: 'hereafter', label: 'Hereafter', tabs: [
    { id: 'akhirah', label: 'Hereafter' }, { id: 'jannah', label: 'Paradise' },
    { id: 'jahannam', label: 'Hellfire' }, { id: 'grave', label: 'The Grave' },
    { id: 'signs', label: 'Signs of Qiyamah' },
  ]},
];

// Most knowledge tabs use poolRender from render/static.js via specific renderer functions.
// quran and hadith use render/dynamic.js.
const TAB_SCRIPTS = {
  quran: ['render/dynamic.js', 'data/pools/quran-verses.js'],
  hadith: ['render/dynamic.js', 'data/pools/hadiths.js'],
  tafsir: ['render/static.js'],
  seerah: ['render/static.js'],
  fiqh: ['render/static.js'], purification: ['render/static.js'],
  salahrules: ['render/static.js'], zakatrules: ['render/static.js'],
  sawmrules: ['render/static.js'], hajjrules: ['render/static.js'],
  trade: ['render/static.js'], inheritance: ['render/static.js'], oaths: ['render/static.js'],
  aqeedah: ['render/static.js'], heart: ['render/static.js'],
  ikhlas: ['render/static.js'], tawakkul: ['render/static.js'],
  manners: ['render/static.js'], patience: ['render/static.js'],
  sins: ['render/static.js'], repentance: ['render/static.js'],
  zuhd: ['render/static.js'], inspirations: ['render/static.js'],
  stories: ['render/static.js'], sufism: ['render/static.js'],
  tazkiyah: ['render/static.js'], fear: ['render/static.js'],
  hope: ['render/static.js'], loveofallah: ['render/static.js'],
  contentment: ['render/static.js'], reflection: ['render/static.js'],
  dreams: ['render/static.js'],
  family: ['render/static.js'], marriage: ['render/static.js'],
  parenting: ['render/static.js'], work: ['render/static.js'],
  neighbors: ['render/static.js'], community: ['render/static.js'],
  ummah: ['render/static.js'], dawah: ['render/static.js'],
  punishments: ['render/static.js'], brotherhood: ['render/static.js'],
  sisterhood: ['render/static.js'], orphans2: ['render/static.js'],
  elderly: ['render/static.js'], disabled: ['render/static.js'],
  antiracism: ['render/static.js'], poverty: ['render/static.js'],
  volunteering: ['render/static.js'],
  health: ['render/static.js'], tibb: ['render/static.js'],
  food: ['render/static.js'], environment: ['render/static.js'],
  travel: ['render/static.js'], youth: ['render/static.js'],
  tech: ['render/static.js'], technology: ['render/static.js'],
  socialmedia: ['render/static.js'], ethics: ['render/static.js'],
  bioethics: ['render/static.js'], modfinance: ['render/static.js'],
  politics: ['render/static.js'], green: ['render/static.js'],
  mentalhealth: ['render/static.js'], education: ['render/static.js'],
  science: ['render/static.js'],
  akhirah: ['render/static.js'], jannah: ['render/static.js'],
  jahannam: ['render/static.js'], grave: ['render/static.js'],
  signs: ['render/static.js'],
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
    quran: 'renderQuran', hadith: 'renderHadith',
    tafsir: 'renderTafsir', seerah: 'renderSeerah',
    fiqh: 'renderFiqh', purification: 'renderPurification',
    salahrules: 'renderSalahrules', zakatrules: 'renderZakatrules',
    sawmrules: 'renderSawmrules', hajjrules: 'renderHajjrules',
    trade: 'renderTrade', inheritance: 'renderInheritance', oaths: 'renderOaths',
    aqeedah: 'renderAqeedah', heart: 'renderHeart',
    ikhlas: 'renderIkhlas', tawakkul: 'renderTawakkul',
    manners: 'renderManners', patience: 'renderPatience',
    sins: 'renderSins', repentance: 'renderRepentance',
    zuhd: 'renderZuhd', inspirations: 'renderInspirations',
    stories: 'renderStories', sufism: 'renderSufism',
    tazkiyah: 'renderTazkiyah', fear: 'renderFear',
    hope: 'renderHope', loveofallah: 'renderLoveofallah',
    contentment: 'renderContentment', reflection: 'renderReflection',
    dreams: 'renderDreams',
    family: 'renderFamily', marriage: 'renderMarriage',
    parenting: 'renderParenting', work: 'renderWork',
    neighbors: 'renderNeighbors', community: 'renderCommunity',
    ummah: 'renderUmmah', dawah: 'renderDawah',
    punishments: 'renderPunishments', brotherhood: 'renderBrotherhood',
    sisterhood: 'renderSisterhood', orphans2: 'renderOrphans2',
    elderly: 'renderElderly', disabled: 'renderDisabled',
    antiracism: 'renderAntiracism', poverty: 'renderPoverty',
    volunteering: 'renderVolunteering',
    health: 'renderHealth', tibb: 'renderTibb',
    food: 'renderFood', environment: 'renderEnvironment',
    travel: 'renderTravel', youth: 'renderYouth',
    tech: 'renderTech', technology: 'renderTechnology',
    socialmedia: 'renderSocialmedia', ethics: 'renderEthics',
    bioethics: 'renderBioethics', modfinance: 'renderModfinance',
    politics: 'renderPolitics', green: 'renderGreen',
    mentalhealth: 'renderMentalhealth', education: 'renderEducation',
    science: 'renderScience',
    akhirah: 'renderAkhirah', jannah: 'renderJannah',
    jahannam: 'renderJahannam', grave: 'renderGrave',
    signs: 'renderSigns',
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
