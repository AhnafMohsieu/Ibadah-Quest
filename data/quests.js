const DQUESTS = [
  { id:'dq1', d:'Complete Fajr & Isha',          c: (s,l) => l.p?.fajr && l.p?.isha, xp:55 },
  { id:'dq2', d:'Do 3 extra deeds',               c: (s,l) => Object.values(l.d||{}).filter(v=>v).length>=3, xp:50 },
  { id:'dq3', d:'Read Quran today',               c: (s,l) => l.d?.quran, xp:35 },
  { id:'dq4', d:'Give Charity',                   c: (s,l) => l.d?.charity, xp:45 },
  { id:'dq5', d:'Pray any voluntary prayer',      c: (s,l) => Object.values(l.v||{}).some(v=>v), xp:50 },
  { id:'dq6', d:'Pray all 5 daily prayers',       c: (s,l) => Object.values(l.p||{}).filter(v=>v).length>=5, xp:70 },
  { id:'dq7', d:'Pray Dhuhr & Asr',               c: (s,l) => l.p?.dhuhr && l.p?.asr, xp:55 },
  { id:'dq8', d:'Morning & Evening Adhkar',       c: (s,l) => l.d?.morning && l.d?.evening, xp:65 },
  { id:'dq9', d:'Dhikr and Istighfar',            c: (s,l) => l.d?.dhikr && l.d?.istighfar, xp:50 },
  { id:'dq10',d:'Pray Tahajjud',                  c: (s,l) => l.v?.tahajjud, xp:70 },
  { id:'dq11',d:'Pray Duha/Ishraq prayer',         c: (s,l) => l.v?.duha || l.v?.ishraq, xp:55 },
  { id:'dq12',d:'Smile (Sunnah)',                 c: (s,l) => l.d?.smile, xp:25 },
  { id:'dq13',d:'Help parents/family',            c: (s,l) => l.d?.family, xp:40 },
  { id:'dq14',d:'Avoid useless talk',             c: (s,l) => l.d?.silence, xp:55 },
  { id:'dq15',d:'Make specific dua for others',   c: (s,l) => l.d?.dua, xp:50 }
];

const WQUESTS = [
  { id:'w1', d:'Perfect prayers 5 days',   c: s => cpd(s,ws(),we())>=5, xp:200 },
  { id:'w2', d:'Tahajjud 3x this week',    c: s => cvl(s,'tahajjud',ws(),we())>=3, xp:150 },
  { id:'w3', d:'Give charity 2x this week',c: s => countDeedP(s,'charity',ws(),we())>=2, xp:100 },
  { id:'w4', d:'Read Quran 5 days',        c: s => countDeedP(s,'quran',ws(),we())>=5, xp:150 },
  { id:'w5', d:'Pray Witr 5 times',        c: s => cvl(s,'witr',ws(),we())>=5, xp:120 },
  { id:'w6', d:'Fasting 1 day (Mon/Thu)',  c: s => Object.keys(s.fastingDays||{}).filter(dk=>dk>=ws()&&dk<=we()&&s.fastingDays[dk]).length>=1, xp:180 },
  { id:'w7', d:'Read Surah Kahf (Friday)', c: s => cvl(s,'kahf',ws(),we())>=1, xp:100 },
  { id:'w8', d:'Maintain 7-day streak',    c: s => s.cs >= 7, xp:150 }
];

const MQUESTS = [
  { id:'m1', d:'20 perfect days this month',  c: s => cpd(s,ms(),me())>=20, xp:500 },
  { id:'m2', d:'100 prayers this month',      c: s => cpr(s,ms(),me())>=100, xp:400 },
  { id:'m3', d:'Fast 3 days this month',      c: s => Object.keys(s.fastingDays||{}).filter(dk=>dk>=ms()&&dk<=me()&&s.fastingDays[dk]).length>=3, xp:300 },
  { id:'m4', d:'Read Quran 15 times',         c: s => countDeedP(s,'quran',ms(),me())>=15, xp:400 },
  { id:'m5', d:'Give 5% monthly charity',     c: s => (s.charity.given >= (s.charity.monthly * 0.05)), xp:350 },
  { id:'m6', d:'Pray Tahajjud 10 times',      c: s => cvl(s,'tahajjud',ms(),me())>=10, xp:600 },
  { id:'m7', d:'Memorize 1 new surah/ayah',   c: s => (s.memorized||0)>=1, xp:450 },
  { id:'m8', d:'Read all Friday Kahfs',       c: s => cvl(s,'kahf',ms(),me())>=4, xp:500 }
];

const YQUESTS = [
  { id:'y1', d:'300 perfect days this year',  c: s => cpd(s,ys(),ye())>=300, xp:2000 },
  { id:'y2', d:'1500 prayers this year',      c: s => cpr(s,ys(),ye())>=1500, xp:1500 },
  { id:'y3', d:'Fast 30 days this year',      c: s => Object.keys(s.fastingDays||{}).filter(dk=>dk>=ys()&&dk<=ye()&&s.fastingDays[dk]).length>=30, xp:1500 },
  { id:'y4', d:'Read Quran 300 times',        c: s => countDeedP(s,'quran',ys(),ye())>=300, xp:2500 },
  { id:'y5', d:'Memorize 5 new surahs',       c: s => (s.memorized||0)>=5, xp:3000 },
  { id:'y6', d:'Pray Tahajjud 100 times',     c: s => cvl(s,'tahajjud',ys(),ye())>=100, xp:3500 },
  { id:'y7', d:'Give consistent yearly charity',c: s => s.charity.given > 0, xp:2000 }
];

const LQUESTS = [
  { id:'l1', d:'Complete 50 prayers',          c: s => s.tp>=50, xp:100 },
  { id:'l2', d:'Read Quran 30 times',           c: s => (s.td.quran||0)>=30, xp:150 },
  { id:'l3', d:'100 voluntary prayers',         c: s => Object.values(s.vc).reduce((a,b)=>a+b,0)>=100, xp:300 },
  { id:'l4', d:'Memorize 10 surahs',            c: s => (s.memorized||0)>=10, xp:200 },
  { id:'l5', d:'Complete 500 prayers',          c: s => s.tp>=500, xp:1000 },
  { id:'l6', d:'Read Quran 100 times',          c: s => (s.td.quran||0)>=100, xp:800 },
  { id:'l7', d:'Do 500 extra deeds',            c: s => Object.values(s.td).reduce((a,b)=>a+b,0)>=500, xp:1200 },
  { id:'l8', d:'Achieve a 30-day streak',       c: s => s.bs>=30, xp:1500 },
  { id:'l9', d:'Memorize 30 surahs',            c: s => (s.memorized||0)>=30, xp:1000 },
  { id:'l10',d:'Complete 5,000 prayers',        c: s => s.tp>=5000, xp:5000 },
  { id:'l11',d:'Achieve a 365-day streak',      c: s => s.bs>=365, xp:10000 },
  { id:'l12',d:'Read Quran 1,000 times',        c: s => (s.td.quran||0)>=1000, xp:6000 },
  { id:'l13',d:'Do 10,000 extra deeds',         c: s => Object.values(s.td).reduce((a,b)=>a+b,0)>=10000, xp:15000 },
  { id:'l14',d:'Memorize the entire Quran',     c: s => (s.memorized||0)>=114, xp:50000 }
];