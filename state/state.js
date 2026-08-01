  // ═══════════════════════════════════════════════════════
  // STATE MANAGEMENT
  // ═══════════════════════════════════════════════════════
  let currentUser = 'default';
  const USER_KEY = 'iq9_active_user', PREFIX = 'iq9_user_';
  function freshState() {
    const t = today();
    return {
      log:{[t]:{p:{},d:{},v:{}}}, tp:0, td:{}, vc:{}, tj:0, pd:0, cs:0, bs:0, lad:t,
      xp:0, lv:1, ua:{}, ur:{}, sd:false, ab:null, tq:0, dq:[], qd:t, sfu:false,
      lbd:null, tdismiss:false, wq:[], mq:[], yq:[], lq:[], wqd:'', mqd:'', yqd:'', lqd:'',
      contentDate:t, duaIdx:[], quranIdx:[], sunnahIdx:[], dhikrIdx:[],
      storiesIdx:[], hadithIdx:[], namesIdx:[], sinsIdx:[], punishmentsIdx:[],
      repentanceIdx:[], seerahIdx:[], tafsirIdx:[], mannersIdx:[],
      aqeedahIdx:[], familyIdx:[], healthIdx:[], financeIdx:[], ummahIdx:[], hajjIdx:[],
      akhirahIdx:[], prophetsIdx:[], womenIdx:[], knowledgeIdx:[], heartIdx:[],
      jumuahIdx:[], marriageIdx:[], scienceIdx:[], wuduIdx:[], scholarsIdx:[],
      patienceIdx:[], workIdx:[], communityIdx:[], environmentIdx:[], travelIdx:[],
      fiqhIdx:[], arabicIdx:[], tawakkulIdx:[], ikhlasIdx:[], zuhdIdx:[],
      dawahIdx:[], civilisationIdx:[], battlesIdx:[], jannahIdx:[], jahannamIdx:[],
      graveIdx:[], signsIdx:[], dreamsIdx:[], parentingIdx:[], foodIdx:[], tibbIdx:[],
      youthIdx:[], techIdx:[], neighborsIdx:[],
      inspireIdx:[], dhikrCounters:{},
      challenges:[], gratitudeLog:{}, fastingDays:{}, memorized:0, memorizationList:[],
      morningDone:{}, eveningDone:{}, charity:{daily:0,monthly:0,given:0,monthStart:''},
      quranAudioReciter:7
    };
  }
  let S = null;
  function loadState() {
    const key = PREFIX + currentUser;
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const p = JSON.parse(raw);
        const d = freshState();
        for (const k of Object.keys(d)) if (!(k in p)) p[k] = d[k];
        if (typeof p.log !== 'object' || typeof p.td !== 'object') return p;
        for (const dk in p.log) {
          const e = p.log[dk];
          if (!e || typeof e !== 'object') p.log[dk] = {p:{},d:{},v:{}};
          else { if (!e.p) e.p = {}; if (!e.d) e.d = {}; if (!e.v) e.v = {}; }
        }
        return p;
      }
    } catch(e) {}
    return freshState();
  }
  function saveState() { try { localStorage.setItem(PREFIX + currentUser, JSON.stringify(S)); } catch(e) {} }
  function today(d = new Date()) { return d.getFullYear() + '-' + (d.getMonth()+1).toString().padStart(2,'0') + '-' + d.getDate().toString().padStart(2,'0'); }
  function tlog() { const t = today(); if (!S.log[t]) S.log[t] = {p:{},d:{},v:{}}; return S.log[t]; }
  function isFri() { return new Date().getDay() === 5; }
  function xpFor(lv) { if (lv <= 1) return 0; return Math.floor(450 * (Math.pow(1.30, lv-1) - 1)); }
  function lvFrom(xp) { let lv = 1; while (xp >= xpFor(lv+1)) lv++; return lv; }
  function lvTitle(lv) { for (const lt of LEVELS) if (lv <= lt.m) return lt.t; return 'Legend'; }
  function ws(d = new Date()) { const day = d.getDay(); const diff = d.getDate() - day + (day===0?-6:1); const m = new Date(d); m.setDate(diff); return today(m); }
  function we(d = new Date()) { const s = new Date(d); s.setDate(s.getDate() + (7-s.getDay())%7); return today(s); }
  function ms() { return today(new Date(new Date().getFullYear(), new Date().getMonth(), 1)); }
  function me() { return today(new Date(new Date().getFullYear(), new Date().getMonth()+1, 0)); }
  function ys() { return today(new Date(new Date().getFullYear(), 0, 1)); }
  function ye() { return today(new Date(new Date().getFullYear(), 11, 31)); }
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
