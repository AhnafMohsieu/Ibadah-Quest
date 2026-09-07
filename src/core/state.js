// src/core/state.js — ESM single truth. Field set is verbatim parity with
// legacy state/state.js freshState(); backfill/migration rules match legacy
// normalizeState() so both tracks read and write the same localStorage shape.
export const STATE_SCHEMA_VERSION = 2;
export const PREFIX = 'iq9_user_';

// Local-date key (YYYY-MM-DD), mirroring legacy today(). Never use
// toISOString() (UTC) for log keys — it splits the day near midnight.
export function getTodayKey(d) {
  const d2 = d || new Date();
  return d2.getFullYear() + '-' + String(d2.getMonth() + 1).padStart(2, '0') + '-' + String(d2.getDate()).padStart(2, '0');
}

export function freshState(todayKey) {
  const t = todayKey;
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

export function migrateState(p, fromVersion) {
  const version = fromVersion || Number(p.schemaVersion) || 1;
  if (version < 2 && p.log && typeof p.log === 'object') {
    for (const dk of Object.keys(p.log)) {
      const entry = p.log[dk];
      if (entry && entry.p && entry.p.Fajr && !entry.p.fajr) entry.p.fajr = entry.p.Fajr;
      if (entry && entry.p && entry.p.Fajr) delete entry.p.Fajr;
    }
  }
  p.schemaVersion = STATE_SCHEMA_VERSION;
  return p;
}

export function normalizeState(value) {
  const d = freshState('1970-01-01');
  const p = value && typeof value === 'object' ? value : d;
  const sourceVersion = Number(p.schemaVersion) || 1;
  for (const k of Object.keys(d)) { if (!(k in p)) p[k] = d[k]; }
  if (p.growthSettings && Array.isArray(p.growthSettings.visible)) {
    for (const f of d.growthSettings.visible) {
      if (!p.growthSettings.visible.includes(f)) p.growthSettings.visible.push(f);
    }
  }
  if (p.lastActiveDate && typeof p.lastActiveDate === 'string') {
    if (!p.lad || p.lastActiveDate > p.lad) p.lad = p.lastActiveDate;
    delete p.lastActiveDate;
  }
  if (typeof p.log !== 'object' || p.log === null || typeof p.td !== 'object' || p.td === null) {
    return migrateState(p, sourceVersion);
  }
  for (const dk of Object.keys(p.log)) {
    const e = p.log[dk];
    if (!e || typeof e !== 'object') p.log[dk] = { p: {}, d: {}, v: {} };
    else { if (!e.p) e.p = {}; if (!e.d) e.d = {}; if (!e.v) e.v = {}; }
  }
  return migrateState(p, sourceVersion);
}
