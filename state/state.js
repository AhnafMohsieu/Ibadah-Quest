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
  const USER_KEY = 'iq9_active_user', PREFIX = 'iq9_user_', INTRO_SEEN_KEY = 'iq9_intro_seen';
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
      healthLog:{}, financeLog:{}, moodLog:{},
      growthSettings:{visible:['garden','lantern','keys','mosque','boat','heart','armor','ramadan','laylat']},
      theme:'light', lastTab:'home', lastCat:null, lastSub:null, introSeen:false,
      notificationsEnabled:false
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
      if (p.growthSettings && Array.isArray(p.growthSettings.visible)) {
        for (const f of d.growthSettings.visible) {
          if (!p.growthSettings.visible.includes(f)) p.growthSettings.visible.push(f);
        }
      }
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
