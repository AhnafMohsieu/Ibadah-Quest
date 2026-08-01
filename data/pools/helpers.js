// ── Navigation-only index (instant, no pool scanning) ──
const SEARCH_INDEX = [
  {cat:"Quran",title:"Al-Fatihah",desc:"The Opening - 7 verses",action:"openQuranSurah",args:[1]},
  {cat:"Quran",title:"Al-Baqarah",desc:"The Cow - 286 verses",action:"openQuranSurah",args:[2]},
  {cat:"Quran",title:"Ali 'Imran",desc:"Family of Imran - 200 verses",action:"openQuranSurah",args:[3]},
  {cat:"Quran",title:"An-Nisa",desc:"The Women - 176 verses",action:"openQuranSurah",args:[4]},
  {cat:"Quran",title:"Al-Ma'idah",desc:"The Table Spread - 120 verses",action:"openQuranSurah",args:[5]},
  {cat:"Quran",title:"Al-An'am",desc:"The Cattle - 165 verses",action:"openQuranSurah",args:[6]},
  {cat:"Quran",title:"Al-A'raf",desc:"The Heights - 206 verses",action:"openQuranSurah",args:[7]},
  {cat:"Quran",title:"Al-Kahf",desc:"The Cave - 110 verses",action:"openQuranSurah",args:[18]},
  {cat:"Quran",title:"Maryam",desc:"Mary - 98 verses",action:"openQuranSurah",args:[19]},
  {cat:"Quran",title:"Yasin",desc:"Ya Sin - 83 verses",action:"openQuranSurah",args:[36]},
  {cat:"Quran",title:"Ar-Rahman",desc:"The Most Merciful - 78 verses",action:"openQuranSurah",args:[55]},
  {cat:"Quran",title:"Al-Mulk",desc:"The Sovereignty - 30 verses",action:"openQuranSurah",args:[67]},
  {cat:"Quran",title:"Al-Ikhlas",desc:"Sincerity - 4 verses",action:"openQuranSurah",args:[112]},
  {cat:"Quran",title:"Al-Falaq",desc:"The Daybreak - 5 verses",action:"openQuranSurah",args:[113]},
  {cat:"Quran",title:"An-Nas",desc:"Mankind - 6 verses",action:"openQuranSurah",args:[114]},
  {cat:"Ibadah",title:"Daily Prayers",desc:"The 5 daily prayers",action:"switchCategory",args:["ibadah","today"]},
  {cat:"Ibadah",title:"Morning Adhkar",desc:"Morning remembrance after Fajr",action:"switchCategory",args:["ibadah","morning"]},
  {cat:"Ibadah",title:"Evening Adhkar",desc:"Evening remembrance after Asr",action:"switchCategory",args:["ibadah","evening"]},
  {cat:"Ibadah",title:"Dhikr Counter",desc:"Digital tasbih counter",action:"switchCategory",args:["ibadah","dhikr"]},
  {cat:"Ibadah",title:"Daily Duas",desc:"Supplications from Sunnah",action:"switchCategory",args:["ibadah","duas"]},
  {cat:"Ibadah",title:"Wudu",desc:"Ritual purification",action:"switchCategory",args:["ibadah","wudu"]},
  {cat:"Ibadah",title:"Fasting",desc:"Sawm tracker",action:"switchCategory",args:["ibadah","fasting"]},
  {cat:"Ibadah",title:"Gratitude",desc:"Gratitude journal",action:"switchCategory",args:["ibadah","gratitude"]},
  {cat:"Ibadah",title:"Quests",desc:"Daily and weekly quests",action:"switchCategory",args:["ibadah","quests"]},
  {cat:"Ibadah",title:"Challenges",desc:"Daily challenges",action:"switchCategory",args:["ibadah","challenges"]},
  {cat:"Knowledge",title:"Hadith",desc:"Hadith collections",action:"switchCategory",args:["ilm","hadith"]},
  {cat:"Knowledge",title:"Sunnahs",desc:"Daily sunnahs",action:"switchCategory",args:["ilm","sunnahs"]},
  {cat:"Knowledge",title:"99 Names of Allah",desc:"Al-Asma ul-Husna",action:"switchCategory",args:["ilm","names"]},
  {cat:"Knowledge",title:"Tafsir",desc:"Quran interpretation",action:"switchCategory",args:["ilm","tafsir"]},
  {cat:"Knowledge",title:"Scholars",desc:"Great Islamic scholars",action:"switchCategory",args:["ilm","scholars"]},
  {cat:"Knowledge",title:"Arabic",desc:"Learn Arabic",action:"switchCategory",args:["ilm","arabic"]},
  {cat:"Knowledge",title:"Fiqh",desc:"Islamic jurisprudence",action:"switchCategory",args:["ilm","fiqh"]},
  {cat:"Heart",title:"Sins",desc:"Major sins to avoid",action:"switchCategory",args:["qalb","sins"]},
  {cat:"Heart",title:"Repentance",desc:"Seeking forgiveness",action:"switchCategory",args:["qalb","repentance"]},
  {cat:"Heart",title:"Patience",desc:"Sabr and Shukr",action:"switchCategory",args:["qalb","patience"]},
  {cat:"Heart",title:"Tawakkul",desc:"Trust in Allah",action:"switchCategory",args:["qalb","tawakkul"]},
  {cat:"Heart",title:"Manners",desc:"Islamic adab",action:"switchCategory",args:["qalb","manners"]},
  {cat:"Dealings",title:"Family",desc:"Family and kinship",action:"switchCategory",args:["muamalat","family"]},
  {cat:"Dealings",title:"Marriage",desc:"Islamic marriage",action:"switchCategory",args:["muamalat","marriage"]},
  {cat:"Dealings",title:"Charity",desc:"Zakat and Sadaqah",action:"switchCategory",args:["muamalat","charity"]},
  {cat:"Dealings",title:"Finance",desc:"Halal finance",action:"switchCategory",args:["muamalat","finance"]},
  {cat:"Life",title:"Health",desc:"Islamic wellness",action:"switchCategory",args:["hayat","health"]},
  {cat:"Life",title:"Food",desc:"Halal dietary laws",action:"switchCategory",args:["hayat","food"]},
  {cat:"Life",title:"Youth",desc:"Islam and youth",action:"switchCategory",args:["hayat","youth"]},
  {cat:"History",title:"Seerah",desc:"Prophet's biography",action:"switchCategory",args:["tarikh","seerah"]},
  {cat:"History",title:"Sahaba",desc:"The companions",action:"switchCategory",args:["tarikh","sahaba"]},
  {cat:"History",title:"Prophets",desc:"Stories of prophets",action:"switchCategory",args:["tarikh","prophets"]},
  {cat:"History",title:"Civilisation",desc:"Islamic golden age",action:"switchCategory",args:["tarikh","civilisation"]},
  {cat:"Hereafter",title:"Jannah",desc:"Paradise",action:"switchCategory",args:["akhira","jannah"]},
  {cat:"Hereafter",title:"Jahannam",desc:"Hellfire",action:"switchCategory",args:["akhira","jahannam"]},
  {cat:"Hereafter",title:"Signs of Qiyamah",desc:"End times",action:"switchCategory",args:["akhira","signs"]},
  {cat:"Hereafter",title:"Hajj",desc:"Pilgrimage",action:"switchCategory",args:["akhira","hajj"]},
  {cat:"Profile",title:"Profile",desc:"Your stats",action:"switchCategory",args:["profile_main","profile"]},
  {cat:"Profile",title:"Trophies",desc:"Achievements",action:"switchCategory",args:["profile_main","trophies"]},
  {cat:"Profile",title:"Rewards",desc:"Shop",action:"switchCategory",args:["profile_main","rewards"]},
];

const DAILY_ISLAMIC = [
  {title:"Prophetic Hadith",body:"The Prophet \uFDFC said: 'The best of you are those who are best to their wives.'",sub:"\u2014 Sunan al-Tirmidhi"},
  {title:"Daily Verse",body:"'And whoever relies upon Allah - then He is sufficient for him.'",sub:"\u2014 Quran 65:3"},
  {title:"Prophetic Advice",body:"The Prophet \uFDFC said: 'Do not be angry.' He repeated this three times.",sub:"\u2014 Sahih al-Bukhari"},
  {title:"Daily Reminder",body:"'Verily, with hardship comes ease.'",sub:"\u2014 Quran 94:6"},
  {title:"Prophetic Sunnah",body:"The Prophet \uFDFC never used to sleep on his stomach.",sub:"\u2014 Sahih Muslim"},
  {title:"Daily Verse",body:"'Indeed, Allah is with the patient.'",sub:"\u2014 Quran 2:153"},
  {title:"Prophetic Advice",body:"The Prophet \uFDFC said: 'Whoever believes in Allah and the Last Day, let him speak good or remain silent.'",sub:"\u2014 Sahih al-Bukhari"},
  {title:"Daily Reminder",body:"'And it is He who created the heavens and earth in truth.'",sub:"\u2014 Quran 6:73"},
  {title:"Prophetic Hadith",body:"The Prophet \uFDFC said: 'The Muslim is the one from whose tongue and hands the Muslims are safe.'",sub:"\u2014 Sahih al-Bukhari"},
  {title:"Daily Verse",body:"'So remember Me; I will remember you.'",sub:"\u2014 Quran 2:152"},
  {title:"Prophetic Sunnah",body:"The Prophet \uFDFC would start with the right side in everything.",sub:"\u2014 Sahih al-Bukhari"},
  {title:"Daily Reminder",body:"'And my success is not but through Allah.'",sub:"\u2014 Quran 11:88"},
  {title:"Prophetic Advice",body:"The Prophet \uFDFC said: 'He who does not thank people does not thank Allah.'",sub:"\u2014 Sunan Abu Dawud"},
  {title:"Daily Verse",body:"'And whoever does good deeds, male or female, while being a believer - those will enter Paradise.'",sub:"\u2014 Quran 4:124"},
  {title:"Prophetic Hadith",body:"The Prophet \uFDFC said: 'Cleanliness is half of faith.'",sub:"\u2014 Sahih Muslim"},
  {title:"Daily Reminder",body:"'Allah does not burden a soul beyond that it can bear.'",sub:"\u2014 Quran 2:286"},
  {title:"Prophetic Sunnah",body:"The Prophet \uFDFC used to pray 8 rak'ahs of voluntary prayer at night, plus Witr.",sub:"\u2014 Sahih Muslim"},
  {title:"Daily Verse",body:"'And put your trust in Allah, and sufficient is Allah as Disposer of affairs.'",sub:"\u2014 Quran 33:3"},
  {title:"Prophetic Advice",body:"The Prophet \uFDFC said: 'Whoever fasts Ramadan out of sincere faith, all past sins will be forgiven.'",sub:"\u2014 Sahih al-Bukhari"},
  {title:"Daily Reminder",body:"'So exalted is Allah, the True King!'",sub:"\u2014 Quran 23:116"},
  {title:"Prophetic Hadith",body:"The Prophet \uFDFC said: 'The strong person is not the one who can wrestle, but the one who controls himself when angry.'",sub:"\u2014 Sahih al-Bukhari"},
  {title:"Daily Verse",body:"'And Allah guides whom He wills to a straight path.'",sub:"\u2014 Quran 2:213"},
  {title:"Prophetic Sunnah",body:"The Prophet \uFDFC used to say 'Bismillah' before eating and 'Alhamdulillah' after.",sub:"\u2014 Abu Dawud"},
  {title:"Daily Reminder",body:"'Indeed, Allah will not change the condition of a people until they change what is in themselves.'",sub:"\u2014 Quran 13:11"},
  {title:"Prophetic Advice",body:"The Prophet \uFDFC said: 'Seek knowledge from the cradle to the grave.'",sub:"\u2014 Hadith"},
  {title:"Daily Verse",body:"'And We have certainly made the Quran easy to remember.'",sub:"\u2014 Quran 54:17"},
  {title:"Prophetic Hadith",body:"The Prophet \uFDFC said: 'Whoever takes a path seeking knowledge, Allah will make easy for him a path to Paradise.'",sub:"\u2014 Sahih Muslim"},
  {title:"Daily Reminder",body:"'Is he who is devoutly obedient during periods of the night, prostrating and standing?'",sub:"\u2014 Quran 39:9"},
  {title:"Prophetic Sunnah",body:"The Prophet \uFDFC never took revenge for himself, but only when Allah's limits were transgressed.",sub:"\u2014 Sahih al-Bukhari"},
  {title:"Daily Verse",body:"'And whoever puts their trust in Allah, He will be enough for them.'",sub:"\u2014 Quran 65:3"}
];

// ── Pool-to-tab mapping ──
const _poolTabMap = {
  DUA_POOL:{cat:'ibadah',tab:'duas'}, SUNNAH_POOL:{cat:'ilm',tab:'sunnahs'},
  DHIKR_POOL:{cat:'ibadah',tab:'dhikr'}, STORIES:{cat:'tarikh',tab:'stories'},
  HADITHS:{cat:'ilm',tab:'hadith'}, NAMES:{cat:'ilm',tab:'names'},
  SINS_POOL:{cat:'qalb',tab:'sins'}, PUNISHMENTS_POOL:{cat:'muamalat',tab:'punishments'},
  REPENTANCE_POOL:{cat:'qalb',tab:'repentance'}, SAHABA_POOL:{cat:'tarikh',tab:'sahaba'},
  SEERAH_POOL:{cat:'tarikh',tab:'seerah'}, TAFSIR_POOL:{cat:'ilm',tab:'tafsir'},
  MANNERS_POOL:{cat:'qalb',tab:'manners'}, AQEEDAH_POOL:{cat:'ilm',tab:'aqeedah'},
  FAMILY_POOL:{cat:'muamalat',tab:'family'}, HEALTH_POOL:{cat:'hayat',tab:'health'},
  FINANCE_POOL:{cat:'muamalat',tab:'finance'}, UMMAH_POOL:{cat:'muamalat',tab:'ummah'},
  HAJJ_POOL:{cat:'akhira',tab:'hajj'}, AKHIRAH_POOL:{cat:'akhira',tab:'akhirah'},
  PROPHETS_POOL:{cat:'tarikh',tab:'prophets'}, WOMEN_POOL:{cat:'tarikh',tab:'women'},
  KNOWLEDGE_POOL:{cat:'ilm',tab:'knowledge'}, HEART_POOL:{cat:'qalb',tab:'heart'},
  JUMUAH_POOL:{cat:'ibadah',tab:'jumuah'}, MARRIAGE_POOL:{cat:'muamalat',tab:'marriage'},
  SCIENCE_POOL:{cat:'tarikh',tab:'science'}, WUDU_POOL:{cat:'ibadah',tab:'wudu'},
  SCHOLARS_POOL:{cat:'ilm',tab:'scholars'}, PATIENCE_POOL:{cat:'qalb',tab:'patience'},
  WORK_POOL:{cat:'muamalat',tab:'work'}, COMMUNITY_POOL:{cat:'muamalat',tab:'community'},
  ENVIRONMENT_POOL:{cat:'hayat',tab:'environment'}, TRAVEL_POOL:{cat:'hayat',tab:'travel'},
  FIQH_POOL:{cat:'ilm',tab:'fiqh'}, ARABIC_POOL:{cat:'ilm',tab:'arabic'},
  TAWAKKUL_POOL:{cat:'qalb',tab:'tawakkul'}, IKHLAS_POOL:{cat:'qalb',tab:'ikhlas'},
  ZUHD_POOL:{cat:'qalb',tab:'zuhd'}, DAWAH_POOL:{cat:'muamalat',tab:'dawah'},
  CIVILISATION_POOL:{cat:'tarikh',tab:'civilisation'}, BATTLES_POOL:{cat:'tarikh',tab:'battles'},
  JANNAH_POOL:{cat:'akhira',tab:'jannah'}, JAHANNAM_POOL:{cat:'akhira',tab:'jahannam'},
  GRAVE_POOL:{cat:'akhira',tab:'grave'}, SIGNS_POOL:{cat:'akhira',tab:'signs'},
  DREAMS_POOL:{cat:'akhira',tab:'dreams'}, PARENTING_POOL:{cat:'hayat',tab:'parenting'},
  FOOD_POOL:{cat:'hayat',tab:'food'}, TIBB_POOL:{cat:'hayat',tab:'tibb'},
  YOUTH_POOL:{cat:'hayat',tab:'youth'}, TECH_POOL:{cat:'hayat',tab:'tech'},
  INSPIRATIONS_POOL:{cat:'qalb',tab:'inspirations'}
};

// ── Lazy full-content search index ──
let _fullIndex = null;
let _fullIndexBuilding = false;

function _buildFullIndex() {
  if (_fullIndex || _fullIndexBuilding) return;
  _fullIndexBuilding = true;
  _fullIndex = [];

  function addItems(pool, poolName, getText, getArabic) {
    const tab = _poolTabMap[poolName];
    if (!tab || !Array.isArray(pool)) return;
    for (let i = 0; i < pool.length; i++) {
      const item = pool[i];
      const text = getText(item);
      const arabic = getArabic ? getArabic(item) : '';
      if (text || arabic) {
        _fullIndex.push({
          title: text ? text.substring(0, 80) : '',
          desc: text || '',
          arabic: arabic,
          cat: tab.cat,
          pool: poolName,
          action: 'switchCategory',
          args: [tab.cat, tab.tab],
          itemIdx: i
        });
      }
    }
  }

  // Quran verses (massive — index selectively for performance)
  if (typeof QURAN_POOL !== 'undefined') {
    const tab = _poolTabMap.QURAN_POOL || {cat:'ibadah',tab:'quran'};
    // Only index every 5th verse to keep search fast
    for (let i = 0; i < QURAN_POOL.length; i += 5) {
      const v = QURAN_POOL[i];
      if (v) {
        _fullIndex.push({
          title: v.source || '',
          desc: v.english || '',
          arabic: v.arabic || '',
          roman: v.roman || '',
          cat: 'Quran',
          pool: 'QURAN_POOL',
          action: 'openQuranSurah',
          args: [parseInt((v.source||'').match(/(\d+):/)?.[1] || '1')],
          itemIdx: i
        });
      }
    }
  }

  // Hadiths (also massive — index selectively)
  if (typeof HADITHS !== 'undefined') {
    for (let i = 0; i < HADITHS.length; i += 3) {
      const h = HADITHS[i];
      if (h) {
        _fullIndex.push({
          title: h.source || '',
          desc: h.text || '',
          arabic: h.arabic || '',
          cat: 'Knowledge',
          pool: 'HADITHS',
          action: 'switchCategory',
          args: ['ilm', 'hadith'],
          itemIdx: i
        });
      }
    }
  }

  // All other pools
  const poolVars = [
    'DUA_POOL','SUNNAH_POOL','DHIKR_POOL','STORIES','NAMES',
    'SINS_POOL','PUNISHMENTS_POOL','REPENTANCE_POOL','SAHABA_POOL','SEERAH_POOL',
    'TAFSIR_POOL','MANNERS_POOL','AQEEDAH_POOL','FAMILY_POOL','HEALTH_POOL',
    'FINANCE_POOL','UMMAH_POOL','HAJJ_POOL','AKHIRAH_POOL','PROPHETS_POOL',
    'WOMEN_POOL','KNOWLEDGE_POOL','HEART_POOL','JUMUAH_POOL','MARRIAGE_POOL',
    'SCIENCE_POOL','WUDU_POOL','SCHOLARS_POOL','PATIENCE_POOL','WORK_POOL',
    'COMMUNITY_POOL','ENVIRONMENT_POOL','TRAVEL_POOL','FIQH_POOL','ARABIC_POOL',
    'TAWAKKUL_POOL','IKHLAS_POOL','ZUHD_POOL','DAWAH_POOL','CIVILISATION_POOL',
    'BATTLES_POOL','JANNAH_POOL','JAHANNAM_POOL','GRAVE_POOL','SIGNS_POOL',
    'DREAMS_POOL','PARENTING_POOL','FOOD_POOL','TIBB_POOL','YOUTH_POOL',
    'TECH_POOL','INSPIRATIONS_POOL'
  ];

  for (const vname of poolVars) {
    if (typeof window[vname] === 'undefined') continue;
    const pool = window[vname];
    addItems(pool, vname,
      (item) => item.title || item.name || item.text || item.english || item.desc || (typeof item === 'string' ? item : ''),
      (item) => item.arabic || ''
    );
  }

  // Add DAILY_ISLAMIC entries
  if (typeof DAILY_ISLAMIC !== 'undefined') {
    for (let i = 0; i < DAILY_ISLAMIC.length; i++) {
      const d = DAILY_ISLAMIC[i];
      _fullIndex.push({
        title: d.title,
        desc: d.body,
        cat: 'Daily',
        pool: 'DAILY_ISLAMIC',
        action: 'switchCategory',
        args: ['ibadah', 'today'],
        itemIdx: i
      });
    }
  }

  _fullIndexBuilding = false;
}

// ── Safe action lookup ──
const _searchActions = {
  openQuranSurah: function(args) { if (typeof openQuranSurah === 'function') openQuranSurah(args[0]); },
  switchCategory: function(args) { if (typeof switchCategory === 'function') switchCategory(args[0], null); },
};

// ── Main search function ──
function globalSearch(term) {
  const el = document.getElementById('globalSearchResults');
  if (!el) return;
  if (!term || term.length < 1) { el.classList.remove('show'); el.innerHTML = ''; return; }

  // Build full index lazily on first search
  if (!_fullIndex) _buildFullIndex();

  const t = term.toLowerCase();

  // 1. Search navigation index (instant)
  const navMatches = SEARCH_INDEX.filter(item => {
    const s = (item.title + ' ' + item.desc + ' ' + item.cat).toLowerCase();
    return s.includes(t);
  }).slice(0, 5).map(m => ({...m, _type: 'nav'}));

  // 2. Search full content index
  const contentMatches = _fullIndex ? _fullIndex.filter(item => {
    const title = (item.title || '').toLowerCase();
    const desc = (item.desc || '').toLowerCase();
    const arabic = item.arabic || '';
    if (title.includes(t) || desc.includes(t)) return true;
    if (/[\u0600-\u06FF]/.test(term) && arabic.includes(term)) return true;
    // Fuzzy: all words present
    const words = t.split(/\s+/).filter(w => w.length > 1);
    if (words.length > 1 && words.every(w => title.includes(w) || desc.includes(w))) return true;
    return false;
  }).slice(0, 20).map(m => ({...m, _type: 'content'})) : [];

  // Merge: nav first, then content (dedupe by title)
  const seen = new Set();
  const all = [];
  for (const m of [...navMatches, ...contentMatches]) {
    const key = (m.title || '').substring(0, 40);
    if (key && !seen.has(key)) { seen.add(key); all.push(m); }
  }

  if (all.length === 0) {
    el.innerHTML = '<div class="global-search-item"><div class="gs-desc">No results for "' + term.replace(/</g,'&lt;') + '"</div></div>';
    el.classList.add('show');
    return;
  }

  el.innerHTML = all.slice(0, 15).map((m, i) => {
    const poolLabel = m._type === 'nav' ? m.cat : (m.pool ? m.pool.replace(/_POOL$/,'').replace(/_/g,' ') : '');
    const descSnippet = m.desc ? m.desc.substring(0, 100) + (m.desc.length > 100 ? '...' : '') : '';
    return '<div class="global-search-item" data-idx="' + i + '">' +
      '<div class="gs-cat">' + (m.cat || '') + (poolLabel && poolLabel !== m.cat ? ' \u00B7 ' + poolLabel : '') + '</div>' +
      '<div class="gs-title">' + (m.title || '').substring(0, 60) + '</div>' +
      '<div class="gs-desc">' + descSnippet.replace(/</g,'&lt;') + '</div>' +
    '</div>';
  }).join('');
  el.classList.add('show');

  // Attach click handlers safely
  el.querySelectorAll('.global-search-item[data-idx]').forEach((item, i) => {
    item.addEventListener('click', function() {
      const m = all[i];
      if (m && m.action && _searchActions[m.action]) {
        try { _searchActions[m.action](m.args || []); } catch(e) { console.error('Search nav error:', e); }
      }
      el.classList.remove('show');
      const searchInput = document.querySelector('.global-search');
      if (searchInput) searchInput.value = '';
    });
  });
}

function executeSearch(action) {
  document.getElementById('globalSearchResults')?.classList.remove('show');
  const searchInput = document.querySelector('.global-search');
  if (searchInput) searchInput.value = '';
  if (action && _searchActions[action]) {
    try { _searchActions[action]([]); } catch(e) { console.error('Search action error:', e); }
  }
}

function getDailyIslamic() {
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
  return DAILY_ISLAMIC[dayOfYear % DAILY_ISLAMIC.length];
}

function renderDailyWidget() {
  const d = getDailyIslamic();
  if (!d) return '';
  return '<div class="daily-widget"><div class="daily-widget-title">\uD83D\uDCFF ' + d.title + '</div><div class="daily-widget-body">' + d.body + '</div><div class="daily-widget-sub">' + d.sub + '</div></div>';
}
