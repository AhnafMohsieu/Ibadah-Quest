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
  function freshState() {
    const t = today();
    return {
      log:{[t]:{p:{},d:{},v:{}}}, tp:0, td:{}, vc:{}, tj:0, pd:0, cs:0, bs:0, lad:t,
      xp:0, lv:1, ua:{}, ur:{}, sd:false, ab:null, tq:0, dq:[], qd:t, sfu:false,
      lbd:null, tdismiss:false, wq:[], mq:[], yq:[], lq:[], wqd:'', mqd:'', yqd:'', lqd:'',
      contentDate:t, duaIdx:[], quranIdx:[], sunnahIdx:[], dhikrIdx:[], dhikrCustom:[], dhikrFavorites:[],
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
      quranAudioReciter:7,
      avatar:'', joinDate:null,
      healthLog:{}, financeLog:{},
      growthSettings:{visible:['garden','lantern','keys','mosque','boat','heart','armor','ramadan','laylat']},
      theme:'light', lastTab:'home', lastCat:null, lastSub:null, introSeen:false,
      notificationsEnabled:false, bookmarks:[]
    };
  }
  var S = null;
function loadState() {
  var key = PREFIX + currentUser;
  var d = freshState();
  // Try IndexedDB first
  if (window.Storage && window.Storage.load) {
    var idbState = null;
    try {
      // At this point init() was already called, IDB is ready
      window.Storage.load(currentUser).then(function(s) { idbState = s; }).catch(function() {});
    } catch(e) {}
    if (idbState) {
      for (var k of Object.keys(d)) if (!(k in idbState)) idbState[k] = d[k];
      if (typeof idbState.log !== 'object' || typeof idbState.td !== 'object') return idbState;
      for (var dk in idbState.log) {
        var e = idbState.log[dk];
        if (!e || typeof e !== 'object') idbState.log[dk] = {p:{},d:{},v:{}};
        else { if (!e.p) e.p = {}; if (!e.d) e.d = {}; if (!e.v) e.v = {}; }
      }
      return idbState;
    }
  }
  // Fallback: localStorage (legacy / IDB unavailable)
  try {
    var raw = localStorage.getItem(key);
    if (raw) {
      var p = JSON.parse(raw);
      for (var k of Object.keys(d)) if (!(k in p)) p[k] = d[k];
      if (typeof p.log !== 'object' || typeof p.td !== 'object') return p;
      for (var dk in p.log) {
        var e = p.log[dk];
        if (!e || typeof e !== 'object') p.log[dk] = {p:{},d:{},v:{}};
        else { if (!e.p) e.p = {}; if (!e.d) e.d = {}; if (!e.v) e.v = {}; }
      }
      return p;
    }
  } catch(e) {}
  return d;
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
    if (e.name === 'QuotaExceededError' || e.code === 22) console.warn('localStorage quota exceeded');
  }
}
function today(d) { const d2 = d || new Date(); return d2.getFullYear() + '-' + (d2.getMonth()+1).toString().padStart(2,'0') + '-' + d2.getDate().toString().padStart(2,'0'); }
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
  const limit = Math.min(len, 5);
  while (res.length < limit) { let r = Math.floor(Math.random()*len); if (res.indexOf(r)===-1) res.push(r); }
  return res;
}
function compactLogs() {
    const cutoff = today(new Date(Date.now() - 365 * 86400000));
    let perfectDays = 0;
    for (const dk of Object.keys(S.log)) {
      if (dk < cutoff) {
        const entry = S.log[dk];
        const prayed = Object.values(entry.p || {}).filter(v => v).length;
        if (prayed >= 5) perfectDays++;
        delete S.log[dk];
      }
    }
    S.pd = (S.pd || 0) + perfectDays;
    saveState();
  }
  window.freshState = freshState;
  window.loadState = loadState;
  window.saveState = saveState;
  window.resolveCurrentUser = resolveCurrentUser;
