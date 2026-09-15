  // ═══════════════════════════════════════════════════════
  // STATE MANAGEMENT
  // ═══════════════════════════════════════════════════════
  let currentUser = 'default';
let _hasLoggedIn = false;
let _currentUserSource = 'default';

function resolveCurrentUser() {
  const stored = (() => { try { return localStorage.getItem(USER_KEY); } catch(e) { return null; } })();
  currentUser = stored || 'default';
  _currentUserSource = stored ? 'saved' : 'default';
}
  const USER_KEY = 'iq9_active_user', PREFIX = 'iq9_user_';
  const STATE_SCHEMA_VERSION = 2;
  function freshState() {
    const t = today();
    return {
      log:{[t]:{p:{},d:{},v:{}}}, tp:0, td:{}, vc:{}, tj:0, pd:0, pdArchived:0, cs:0, bs:0, lad:t,
      xp:0, lv:1, ua:{}, ur:{}, sd:false, ab:null, tq:0, dq:[], qd:t, sfu:false,
      lbd:null, tdismiss:false, wq:[], mq:[], yq:[], lq:[], wqd:'', mqd:'', yqd:'', lqd:'',
      contentDate:t, duaIdx:[], quranIdx:[], sunnahIdx:[], dhikrIdx:[], dhikrCustom:[], dhikrFavorites:[],
      sitFavs:[], situationalXp:{},
      storiesIdx:[], hadithIdx:[], namesIdx:[], sinsIdx:[], punishmentsIdx:[],
      repentanceIdx:[], seerahIdx:[], tafsirIdx:[], mannersIdx:[],
      aqeedahIdx:[], familyIdx:[], healthIdx:[], financeIdx:[], ummahIdx:[], hajjIdx:[],
      sahabaIdx:[],
      questXP:{daily:0,weekly:0,monthly:0,yearly:0,lifetime:0},
      akhirahIdx:[], prophetsIdx:[], womenIdx:[], knowledgeIdx:[], heartIdx:[],
      jumuahIdx:[], marriageIdx:[], scienceIdx:[], wuduIdx:[], scholarsIdx:[],
      patienceIdx:[], workIdx:[], communityIdx:[], environmentIdx:[], travelIdx:[],
      fiqhIdx:[], arabicIdx:[], tawakkulIdx:[], ikhlasIdx:[], zuhdIdx:[],
      dawahIdx:[], civilisationIdx:[], battlesIdx:[], jannahIdx:[], jahannamIdx:[],
      graveIdx:[], signsIdx:[], dreamsIdx:[], parentingIdx:[], foodIdx:[], tibbIdx:[],
      youthIdx:[], techIdx:[], neighborsIdx:[],
      inspireIdx:[], dhikrCounters:{}, dhikrSessions:[], dhikrStats:{total:{},daily:{},streak:0,bestStreak:0,lastSessionDate:null,badges:[],achievements:[]},
      muhWeek:'', journeys:{}, journeyStats:{completed:[],currentStreaks:{},bestStreaks:{},totalCompleted:0,unlockedTiers:['7day'],history:[]}, gratitudeLog:{}, fastingDays:{}, memorized:0, memorizationList:[],
      morningDone:{}, eveningDone:{}, charity:{daily:0,monthly:0,given:0,monthStart:''},
      quranAudioReciter:7, hadithTTSLang:'ar', tafsirEdition:'ibnkathir', tafsirLookup:{surah:1,ayah:1},
      avatar:'', joinDate:null,
      healthLog:{}, financeLog:{},
      growthSettings:{visible:['garden','lantern','keys','mosque','boat','heart','armor','ramadan','laylat']},
      theme:'light', lastTab:'home', lastCat:null, lastSub:null, introSeen:false,
      onboarding:{complete:false,step:0},
      notificationsEnabled:false, notificationLog:{},
      prayerSettings:{lat:23.8103,lng:90.4125,label:'Dhaka',method:1},
      personalGoals:[],
      seasonal:{active:null,ramadanQuests:[],hajjDays:0,eidRewards:[],arafahDone:false},
      xpDaily:{}, combos:{}, milestones:[], achievementShowcase:{featured:[],unlockedAt:{}},
      dailyRatings:{}, dailyReflections:{},
      lastDailyRitual:null, lastDailySummary:null, lastWeeklySummary:null, lastWeeklyConsistency:null,
      healthXpClaimed:{}, ownedTitles:[], activeTitle:null, ownedFrames:[], activeFrame:null,
      lastAllPrayersSurprise:null, dhikrSettings:{haptic:true},
      schemaVersion:STATE_SCHEMA_VERSION, bookmarks:[]
    };
  }
  var S = null;
  function migrateState(p, fromVersion) {
    var version = fromVersion || Number(p.schemaVersion) || 1;
    if (version < 2 && p.log && typeof p.log === 'object') {
      for (var dk in p.log) {
        var entry = p.log[dk];
        if (entry && entry.p && entry.p.Fajr && !entry.p.fajr) entry.p.fajr = entry.p.Fajr;
        if (entry && entry.p && entry.p.Fajr) delete entry.p.Fajr;
      }
    }
    p.schemaVersion = STATE_SCHEMA_VERSION;
    return p;
  }
  function normalizeState(value) {
    var d = freshState();
    var p = value && typeof value === 'object' ? value : d;
    var sourceVersion = Number(p.schemaVersion) || 1;
    for (var k of Object.keys(d)) if (!(k in p)) p[k] = d[k];
    // Tab consolidation: remap retired tab ids to their combined parents.
    // Every key verified against data/tab-groups.js — no key here is a live
    // tab id. Deliberately excluded: 'community' (now a live combined tab
    // itself — a stored lastTab of 'community' already means the combined
    // tab), plus 'prophets'/'sahaba'/'women' (still live in Names)
    // and 'science'/'dreams'/'modernhist'/'ancientprophets' (still live),
    // which were never retired and so never appear below.
    // NOTE: 'heart' below is the retired Heart tab; the live 'heart' entry
    // in tab-groups.js is a middle category id, never stored in lastTab
    // (lastTab holds leaf tab ids only), so the remap is safe.
    var TAB_REMAP = {
      purification:'worship-rulings', salahrules:'worship-rulings', sawmrules:'worship-rulings', hajjrules:'worship-rulings', hajj:'worship-rulings',
      zakatrules:'wealth-oaths', trade:'wealth-oaths', inheritance:'wealth-oaths', oaths:'wealth-oaths',
      ikhlas:'virtues', tawakkul:'virtues', patience:'virtues', hope:'virtues', fear:'virtues', loveofallah:'virtues', contentment:'virtues',
      heart:'vices-return', sins:'vices-return', repentance:'vices-return',
      manners:'character-path', zuhd:'character-path', sufism:'character-path', tazkiyah:'character-path', inspirations:'character-path', reflection:'character-path',
      family:'family-life', marriage:'family-life', parenting:'family-life',
      neighbors:'community', brotherhood:'community', sisterhood:'community', ummah:'community', antiracism:'community',
      orphans2:'service', elderly:'service', disabled:'service', poverty:'service', volunteering:'service', dawah:'service',
      work:'work-justice', punishments:'work-justice',
      health:'wellness', tibb:'wellness', mentalhealth:'wellness',
      food:'earth-living', environment:'earth-living', green:'earth-living', travel:'earth-living',
      youth:'youth-tech', tech:'youth-tech', technology:'youth-tech', socialmedia:'youth-tech', education:'youth-tech',
      ethics:'ethics-finance', bioethics:'ethics-finance', modfinance:'ethics-finance', politics:'ethics-finance',
      mecca:'holy-cities', medina:'holy-cities', jerusalem:'holy-cities',
      damascus:'capitals', baghdad:'capitals', cairo:'capitals', cordoba:'capitals', istanbul:'capitals',
      bukhara:'east', samarkand:'east',
      calligraphy:'pattern', illumination:'pattern',
      architecture:'sacred-space', geometry:'sacred-space',
      textiles:'living-crafts', ceramics:'living-crafts', woodwork:'living-crafts', nasheeds:'living-crafts',
      literature:'word',
      arabicgrammar:'structure', morphology:'structure', rhetoric:'structure', etymology:'structure',
      pronunciation:'sound-script', scripts:'sound-script', dialects:'sound-script',
      vocab:'words-poetry', proverbs:'words-poetry', poetry:'words-poetry', poetryart:'words-poetry',
      ontology:'being', existence:'being', prophethood:'being',
      epistemology:'knowing', logic:'knowing', reason:'knowing', kalam:'knowing',
      freewill:'will-evil', problemofevil:'will-evil'
    };
    if (p.lastTab && TAB_REMAP[p.lastTab]) p.lastTab = TAB_REMAP[p.lastTab];
    if (p.lastCat === 'creed') p.lastCat = 'arabic';
    if (p.growthSettings && Array.isArray(p.growthSettings.visible)) {
      for (var f of d.growthSettings.visible) {
        if (!p.growthSettings.visible.includes(f)) p.growthSettings.visible.push(f);
      }
    }
    if (p.lastActiveDate && typeof p.lastActiveDate === 'string') {
      if (!p.lad || p.lastActiveDate > p.lad) p.lad = p.lastActiveDate;
      delete p.lastActiveDate;
    }
    if (typeof p.log !== 'object' || typeof p.td !== 'object') return migrateState(p, sourceVersion);
    for (var dk in p.log) {
      var e = p.log[dk];
      if (!e || typeof e !== 'object') p.log[dk] = {p:{},d:{},v:{}};
      else { if (!e.p) e.p = {}; if (!e.d) e.d = {}; if (!e.v) e.v = {}; }
    }
    return migrateState(p, sourceVersion);
  }
  function readRawLocal() {
    try { return localStorage.getItem(PREFIX + currentUser); } catch (e) { return null; }
  }
  function parseMaybeJunk(raw) {
    if (!raw) return null;
    try { return JSON.parse(raw); } catch (e) { return undefined; } // undefined = unparseable
  }
  function flagCorrupt(source, raw, parsed) {
    var key = null;
    try {
      key = (window.Recovery && window.Recovery.quarantine)
        ? window.Recovery.quarantine(currentUser, raw) : null;
    } catch (e) {}
    if (typeof window !== 'undefined') {
      window.__iqCorruption = { user: currentUser, source: source, quarantineKey: key };
    }
    console.warn('Corrupt state detected (' + source + '); quarantined before any overwrite.');
    return key;
  }
  function loadLocalState() {
    var raw = readRawLocal();
    var parsed = parseMaybeJunk(raw);
    if (raw && parsed === undefined) { flagCorrupt('ls', raw); return null; }
    // raw that parses to JSON null (literal string "null") must not escape as a
    // clean boot: treat it like junk so it gets quarantined and flagged.
    if (raw && parsed === null) { flagCorrupt('ls', raw, parsed); return null; }
    if (parsed !== null && parsed !== undefined &&
        window.Recovery && window.Recovery.isJunkState && window.Recovery.isJunkState(parsed)) {
      flagCorrupt('ls', raw, parsed);
      return null;
    }
    return parsed || null;
  }
  // Synchronous compatibility path for callers outside the async boot sequence.
  function loadState() {
    // Run detection FIRST: reading the flag before loadLocalState() would miss
    // a corruption flagged by this very call and overwrite the damaged key.
    var state = normalizeState(loadLocalState());
    var corrupt = typeof window !== 'undefined' ? !!window.__iqCorruption : false;
    if (!corrupt) {
      try { localStorage.setItem(PREFIX + currentUser, JSON.stringify(state)); } catch (e) {}
    }
    return state;
  }
  async function loadStateAsync() {
    var local = loadLocalState();
    if (window.Storage && window.Storage.load) {
      try {
        var stored = await window.Storage.load(currentUser);
        if (stored && window.Recovery && window.Recovery.isJunkState(stored)) {
          flagCorrupt('idb', stored);
          stored = null; // fall through to localStorage path
        }
        if (stored) {
          var storedVersion = Number(stored.schemaVersion) || 1;
          var normalized = normalizeState(stored);
          if (storedVersion < normalized.schemaVersion) await window.Storage.save(currentUser, normalized);
          return normalized;
        }
        if (local) await window.Storage.save(currentUser, normalizeState(local));
      } catch(e) {
        console.warn('IndexedDB load failed; using localStorage:', e);
      }
    }
    return normalizeState(local);
  }
function saveState() {
  try {
    // Save to IndexedDB (primary)
    if (window.Storage && window.Storage.save) {
      window.Storage.save(currentUser, S).catch(function(e) {
        console.warn('IDB save failed:', e);
      });
    }
  } catch(e) {}
  try {
    // Also save to localStorage (fallback / backward compat)
    localStorage.setItem(PREFIX + currentUser, JSON.stringify(S));
  } catch (e) {
    var isQuota = e && (e.name === 'QuotaExceededError' || e.code === 22 || e.name === 'NS_ERROR_DOM_QUOTA_REACHED');
    if (isQuota) {
      var first = typeof window === 'undefined' || !window.__iqQuotaFailed;
      if (typeof window !== 'undefined') window.__iqQuotaFailed = true;
      console.warn('Storage full — saves are failing. Export a backup.');
      if (first && typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
        try {
          var ev = typeof Event === 'function' ? new Event('iq:quota') : { type: 'iq:quota' };
          window.dispatchEvent(ev);
        } catch (err) {}
      }
    } else {
      console.warn('localStorage save failed:', e);
    }
  }
}
function today(d) { const d2 = d || new Date(); return d2.getFullYear() + '-' + (d2.getMonth()+1).toString().padStart(2,'0') + '-' + d2.getDate().toString().padStart(2,'0'); }
function getTodayKey() { return today(); }
function getYesterdayKey() { var d = new Date(); d.setDate(d.getDate() - 1); return today(d); }
function yesterdayKey() { return getYesterdayKey(); }
function getWeekAgoKey() { var d = new Date(); d.setDate(d.getDate() - 7); return today(d); }
function tlog() { const t = today(); if (!S.log[t]) S.log[t] = {p:{},d:{},v:{}}; return S.log[t]; }
function isFri() { return new Date().getDay() === 5; }
function xpFor(lv) { if (lv <= 1) return 0; return Math.floor(100 * Math.pow(lv, 1.5)); }
function lvFrom(xp) { let lv = 1; while (xp >= xpFor(lv+1)) lv++; return lv; }
function lvTitle(lv) { for (const lt of LEVELS) if (lv <= lt.m) return lt.t; return 'Legend'; }
function ws(d) { const dd = d || new Date(); const day = dd.getDay(); const diff = dd.getDate() - day + (day===0?-6:1); const m = new Date(dd); m.setDate(diff); return today(m); }
function we(d) { const dd = d || new Date(); const s = new Date(dd); s.setDate(s.getDate() + (7-s.getDay())%7); return today(s); }
function ms() { const d = new Date(); return today(new Date(d.getFullYear(), d.getMonth(), 1)); }
function me() { const d = new Date(); return today(new Date(d.getFullYear(), d.getMonth()+1, 0)); }
function ys() { const d = new Date(); return today(new Date(d.getFullYear(), 0, 1)); }
function ye() { const d = new Date(); return today(new Date(d.getFullYear(), 11, 31)); }
function cpd(s, st, en) { let c = 0; for (const dk in s.log) if (dk >= st && dk <= en && Object.values(s.log[dk].p||{}).filter(v=>v).length >= 5) c++; return c; }
function cpr(s, st, en) { let c = 0; for (const dk in s.log) if (dk >= st && dk <= en) c += Object.values(s.log[dk].p||{}).filter(v=>v).length; return c; }
function cvl(s, sid, st, en) { let c = 0; for (const dk in s.log) if (dk >= st && dk <= en) { const v = s.log[dk].v || {}; c += sid ? (v[sid]?1:0) : Object.values(v).filter(v=>v).length; } return c; }
function countDeedP(s, deed, st, en) { let c = 0; for (const dk in s.log) if (dk >= st && dk <= en) c += s.log[dk].d?.[deed]?1:0; return c; }
function fastRng(len) {
  const res = [];
  if (!Number.isInteger(len) || len <= 0) return res;
  const limit = Math.min(len, 5);
  while (res.length < limit) { let r = Math.floor(Math.random()*len); if (res.indexOf(r)===-1) res.push(r); }
  return res;
}
function compactLogs() {
    const cutoff = today(new Date(Date.now() - 365 * 86400000));
    let perfectDays = 0;
    for (const dk of Object.keys(S.log)) {
      if (dk < cutoff) {
        const entry = S.log[dk] || {};
        const prayed = Object.values(entry.p || {}).filter(v => v).length;
        if (prayed >= 5) perfectDays++;
        delete S.log[dk];
      }
    }
    S.pdArchived = (S.pdArchived || 0) + perfectDays;
    S.pd = (S.pdArchived || 0) + Object.keys(S.log).filter(function(d) { return Object.values((S.log[d] && S.log[d].p) || {}).filter(function(v) { return v; }).length >= 5; }).length;
    saveState();
  }
  window.freshState = freshState;
  window.loadState = loadState;
  window.loadStateAsync = loadStateAsync;
  window.saveState = saveState;
  window.resolveCurrentUser = resolveCurrentUser;
  window.getTodayKey = getTodayKey;
  window.getYesterdayKey = getYesterdayKey;
  window.yesterdayKey = yesterdayKey;
  window.getWeekAgoKey = getWeekAgoKey;
