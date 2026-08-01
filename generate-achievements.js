// Achievement Generator for Ibadah Quest
// Generates 999 achievements with Islamic-themed names

const achievements = [];

// Helper to add achievement
function add(id, name, desc, icon, tier, checkFn) {
  achievements.push({ id: `a${id}`, name, desc, icon, tier, c: checkFn });
}

// Tier thresholds
const TIERS = {
  bronze: { min: 1, max: 300 },
  silver: { min: 301, max: 550 },
  gold: { min: 551, max: 750 },
  platinum: { min: 751, max: 870 },
  diamond: { min: 871, max: 950 },
  legendary: { min: 951, max: 999 }
};

function getTier(id) {
  for (const [tier, range] of Object.entries(TIERS)) {
    if (id >= range.min && id <= range.max) return tier;
  }
  return 'bronze';
}

// Islamic names pool
const ISLAMIC_NAMES = [
  'Abdullah', 'Abdul Rahman', 'Abdul Malik', 'Abdul Aziz', 'Abdul Jabbar',
  'Abdul Qadir', 'Abdul Wahhab', 'Abdul Sami', 'Abdul Baseer', 'Abdul Hakim',
  'Abdul Adheem', 'Abdul Bari', 'Abdul Fattah', 'Abdul Ghaffar', 'Abdul Hadi',
  'Abdul Haq', 'Abdul Alim', 'Abdul lateef', 'Abdul Muhsin', 'Abdul Mumin',
  'Abdul Nasser', 'Abdul Quddus', 'Abdul Raheem', 'Abdul Rashid', 'Abdul Salaam',
  'Abdul Wadud', 'Abdul Wakeel', 'Abdul Zahir', 'Ahsan', 'Akhir',
  'Alim', 'Ameen', 'Ameer', 'Anwar', 'Aqil',
  'Arham', 'Asad', 'Asghar', 'Ashraf', 'Asim',
  'Ata', 'Atif', 'Awais', 'Ayaan', 'Ayman',
  'Ayub', 'Aziz', 'Badr', 'Bahaa', 'Bakr',
  'Baraa', 'Barir', 'Basheer', 'Bilal', 'Bilqis',
  'Bushra', 'Danya', 'Darwish', 'Daud', 'Dhiya',
  'Dilshad', 'Duha', 'Ehsan', 'Eiman', 'Eisa',
  'Elias', 'Emad', 'Esa', 'Farah', 'Fareed',
  'Farhan', 'Faris', 'Faisal', 'Fakhir', 'Fakhr',
  'Fawaz', 'Fida', 'Firdous', 'Fouad', 'Fuad',
  'Ghani', 'Habib', 'Hadi', 'Hafeez', 'Hakeem',
  'Haleem', 'Hamid', 'Hamza', 'Hani', 'Hanif',
  'Haris', 'Haroon', 'Hasan', 'Hassan', 'Hatim',
  'Hidayah', 'Hisham', 'Huda', 'Husn', 'Hussein',
  'Ibrahim', 'Idris', 'Ihsan', 'Ikram', 'Ilyas',
  'Imad', 'Imran', 'Inam', 'Irfan', 'Isa',
  'Ismail', 'Issa', 'Izz', 'Jabbar', 'Jalal',
  'Jamal', 'Jasim', 'Jawad', 'Jazib', 'Jibreel',
  'Jihad', 'Junaid', 'Kamal', 'Kareem', 'Karim',
  'Khalid', 'Khalil', 'Lateef', 'Luqman', 'Majid',
  'Mansoor', 'Masood', 'Mazen', 'Mikaail', 'Mikail',
  'Muazzam', 'Mubarak', 'Mudassir', 'Mujeeb', 'Mukhtar',
  'Munir', 'Murad', 'Musab', 'Mushtaq', 'Muslim',
  'Mustafa', 'Muttalib', 'Muzaffar', 'Nabil', 'Nadir',
  'Naeem', 'Nasir', 'Nasser', 'Nazeer', 'Nazim',
  'Nida', 'Nidhal', 'Nizar', 'Noor', 'Nuh',
  'Naseem', 'Nasrullah', 'Obaid', 'Omar', 'Osama',
  'Othman', 'Qadir', 'Qasim', 'Qudamah', 'Qusay',
  'Raashid', 'Rabbo', 'Radwan', 'Rafiq', 'Raghib',
  'Rahim', 'Raid', 'Raja', 'Rajab', 'Rakan',
  'Rashid', 'Rauf', 'Rida', 'Rizwan', 'Ruben',
  'Ruhullah', 'Saad', 'Sabir', 'Saeed', 'Safwan',
  'Sahib', 'Sahil', 'Said', 'Salah', 'Salim',
  'Salman', 'Sameer', 'Sami', 'Samuel', 'Sarmad',
  'Sattar', 'Saif', 'Seif', 'Shad', 'Shadi',
  'Shafi', 'Shahid', 'Shahin', 'Shakir', 'Shamim',
  'Sharif', 'Shoaib', 'Shuaib', 'Shукr', 'Siddiq',
  'Sohail', 'Sufyan', 'Suleiman', 'Tahir', 'Talhah',
  'Talib', 'Tamim', 'Tariq', 'Tayyib', 'Toufik',
  'Tuncay', 'Turki', 'Ubaid', 'Umar', 'Usama',
  'Usman', 'Wahid', 'Waleed', 'Wali', 'Waqar',
  'Yahya', 'Yasar', 'Yasser', 'Yusuf', 'Yusef',
  'Zaid', 'Zain', 'Zakaria', 'Zakir', 'Zakariya',
  'Zayed', 'Zayd', 'Zia', 'Zubair', 'Zulfiqar'
];

// Achievement name patterns
const PRAYER_NAMES = [
  'Prayer Warrior', 'Salah Seeker', 'Mosque Regular', 'Fajr Champion',
  'Dhuhr Devotee', 'Asr Avid', 'Maghrib Master', 'Isha Guardian',
  'Prayer Pioneer', 'Salah Soldier', 'Worshipper', 'Devoted One',
  'Prayer Pillar', 'Salah Star', 'Mosque Goer', 'Prayer Partner',
  'Fajr Fighter', 'Dhuhr Defender', 'Asr Archer', 'Maghrib Moon',
  'Isha Illuminator', 'Prayer Pro', 'Salah Specialist', 'Worship Warrior'
];

const STREAK_NAMES = [
  'Consistent', 'Unbreakable', 'Steadfast', 'Enduring',
  'Persistent', 'Resolute', 'Determined', 'Committed',
  'Faithful', 'Loyal', 'Dedicated', 'Devoted'
];

const DEED_NAMES = [
  'Good Deeder', 'Deed Doer', 'Kind Soul', 'Generous Heart',
  'Charity Champion', 'Helping Hand', 'Benevolent', 'Compassionate',
  'Caring', 'Sharing', 'Giving', 'Noble'
];

const LEVEL_NAMES = [
  'Level Up', 'Rising Star', 'Climbing Higher', 'Ascending',
  'Reaching New Heights', 'Soaring', 'Elevated', 'Exalted',
  'Magnified', 'Glorified', 'Praised', 'Honored'
];

const QUEST_NAMES = [
  'Quest Complete', 'Mission Accomplished', 'Task Master', 'Goal Getter',
  'Objective Owner', 'Target Tracker', 'Quest Champion', 'Mission Master'
];

const CONTENT_NAMES = [
  'Knowledge Seeker', 'Learning Enthusiast', 'Student of Knowledge',
  'Seeker of Truth', 'Wisdom Hunter', 'Truth Finder', 'Knowledge Hunter'
];

const SPECIAL_NAMES = [
  'Fasting Champion', 'Ramadan Ready', 'Charity giver', 'Memorizer',
  'Gratitude Keeper', 'Night Prayer', 'Voluntary Worship', 'Extra Mile'
];

// Generate 999 achievements
let id = 1;

// === PRAYER ACHIEVEMENTS (300) ===
// Total prayers milestones
const prayerMilestones = [1,2,3,5,10,15,20,25,30,40,50,60,75,100,125,150,175,200,250,300,350,400,450,500,600,700,800,900,1000,1250,1500,1750,2000,2500,3000,3500,4000,4500,5000,6000,7000,8000,9000,10000,12500,15000,17500,20000,25000,30000,35000,40000,45000,50000];
prayerMilestones.forEach((count, i) => {
  const tier = count <= 50 ? 'bronze' : count <= 200 ? 'silver' : count <= 1000 ? 'gold' : count <= 5000 ? 'platinum' : count <= 20000 ? 'diamond' : 'legendary';
  const name = count === 1 ? 'First Prayer' : count <= 10 ? `${PRAYER_NAMES[i % PRAYER_NAMES.length]} ${count}` : `${PRAYER_NAMES[i % PRAYER_NAMES.length]} ${count.toLocaleString()}`;
  add(id++, name, `Complete ${count.toLocaleString()} prayers`, '🕌', tier, `s => s.tp>=${count}`);
});

// Perfect days milestones
const perfectDayMilestones = [1,2,3,5,7,10,14,21,30,45,60,75,90,100,120,150,180,200,250,300,365,400,500,600,700,800,900,1000];
perfectDayMilestones.forEach((count, i) => {
  const tier = count <= 7 ? 'bronze' : count <= 30 ? 'silver' : count <= 100 ? 'gold' : count <= 365 ? 'platinum' : count <= 700 ? 'diamond' : 'legendary';
  add(id++, `Perfect ${count}`, `All 5 prayers in ${count} day${count>1?'s':''}`, '✅', tier, `s => s.pd>=${count}`);
});

// Fajr-specific (harder, so lower thresholds)
const fajrMilestones = [1,5,10,15,20,25,30,40,50,60,75,100,125,150,175,200,250,300,400,500,600,700,800,900,1000];
fajrMilestones.forEach((count, i) => {
  const tier = count <= 10 ? 'bronze' : count <= 30 ? 'silver' : count <= 100 ? 'gold' : count <= 300 ? 'platinum' : count <= 700 ? 'diamond' : 'legendary';
  add(id++, `Fajr Guardian ${count}`, `Pray Fajr ${count} times`, '🌅', tier, `s => (s.td.fajr_prayer||0)>=${count}`);
});

// Jummah milestones
const jummahMilestones = [1,2,4,8,12,16,20,25,30,40,50,60,75,100,125,150,175,200,250,300];
jummahMilestones.forEach((count, i) => {
  const tier = count <= 4 ? 'bronze' : count <= 12 ? 'silver' : count <= 30 ? 'gold' : count <= 100 ? 'platinum' : count <= 200 ? 'diamond' : 'legendary';
  add(id++, `Jummah ${count}`, `Pray ${count} Jummah${count>1?'s':''}`, '🕌', tier, `s => (s.tj||0)>=${count}`);
});

// Voluntary prayers
const voluntaryTypes = ['tahajjud', 'duha', 'witr', 'rawatib', 'istikharah'];
voluntaryTypes.forEach(type => {
  const milestones = [1,3,5,10,15,20,25,30,40,50,60,75,100,125,150,175,200,250,300,400,500];
  milestones.forEach((count, i) => {
    const tier = count <= 5 ? 'bronze' : count <= 15 ? 'silver' : count <= 50 ? 'gold' : count <= 150 ? 'platinum' : count <= 300 ? 'diamond' : 'legendary';
    const name = type.charAt(0).toUpperCase() + type.slice(1);
    add(id++, `${name} ${count}`, `Pray ${name} ${count} times`, '🌠', tier, `s => (s.vc.${type}||0)>=${count}`);
  });
});

// === STREAK ACHIEVEMENTS (100) ===
const streakMilestones = [3,5,7,10,14,21,30,40,45,50,60,70,75,80,90,100,120,125,150,175,180,200,225,250,275,300,325,350,365,400,450,500,550,600,650,700,750,800,850,900,950,1000];
streakMilestones.forEach((count, i) => {
  const tier = count <= 14 ? 'bronze' : count <= 30 ? 'silver' : count <= 90 ? 'gold' : count <= 200 ? 'platinum' : count <= 500 ? 'diamond' : 'legendary';
  const name = count <= 30 ? `${STREAK_NAMES[i % STREAK_NAMES.length]} ${count}` : `${STREAK_NAMES[i % STREAK_NAMES.length]} ${count}`;
  add(id++, `${name}-Day Streak`, `${count}-day prayer streak`, '🔥', tier, `s => s.bs>=${count}`);
});

// === DEED ACHIEVEMENTS (200) ===
// Deed categories with Islamic names
const deedCategories = [
  { id: 'quran', name: 'Quran', icon: '📖', names: ['Quran Reader', 'Quran Lover', 'Quran Student', 'Quran Seeker', 'Quran Devotee'] },
  { id: 'dhikr', name: 'Dhikr', icon: '📿', names: ['Dhikr Master', 'Dhikr Lover', 'Dhikr Seeker', 'Dhikr Devotee', 'Dhikr Champion'] },
  { id: 'charity', name: 'Charity', icon: '🤲', names: ['Charity Giver', 'Generous Soul', 'Kind Heart', 'Benevolent', 'Noble Giver'] },
  { id: 'fasting', name: 'Fasting', icon: '🌙', names: ['Fasting Warrior', 'Fasting Champion', 'Fasting Master', 'Fasting Devotee', 'Fasting Hero'] },
  { id: 'dua', name: 'Dua', icon: '🤲', names: ['Dua Maker', 'Dua Lover', 'Dua Seeker', 'Dua Devotee', 'Dua Champion'] },
  { id: 'salawat', name: 'Salawat', icon: '🕌', names: ['Salawat Sender', 'Salawat Lover', 'Salawat Seeker', 'Salawat Devotee', 'Salawat Champion'] },
  { id: 'istighfar', name: 'Istighfar', icon: '🤲', names: ['Istighfar Seeker', 'Istighfar Lover', 'Istighfar Devotee', 'Istighfar Champion', 'Istighfar Master'] },
  { id: 'sadaqah', name: 'Sadaqah', icon: '💰', names: ['Sadaqah Giver', 'Sadaqah Lover', 'Sadaqah Seeker', 'Sadaqah Devotee', 'Sadaqah Champion'] },
  { id: 'knowledge', name: 'Knowledge', icon: '📚', names: ['Knowledge Seeker', 'Knowledge Lover', 'Knowledge Hunter', 'Knowledge Devotee', 'Knowledge Master'] },
  { id: 'kindness', name: 'Kindness', icon: '💝', names: ['Kind Soul', 'Kind Heart', 'Kind Spirit', 'Kind Being', 'Kind Master'] },
  { id: 'patience', name: 'Patience', icon: '🕊️', names: ['Patient Soul', 'Patient Heart', 'Patient Spirit', 'Patient Being', 'Patient Master'] },
  { id: 'gratitude', name: 'Gratitude', icon: '🙌', names: ['Grateful Soul', 'Grateful Heart', 'Grateful Spirit', 'Grateful Being', 'Grateful Master'] },
  { id: 'truthfulness', name: 'Truthfulness', icon: '💎', names: ['Truthful Soul', 'Truthful Heart', 'Truthful Spirit', 'Truthful Being', 'Truthful Master'] },
  { id: 'forgiveness', name: 'Forgiveness', icon: '🕊️', names: ['Forgiving Soul', 'Forgiving Heart', 'Forgiving Spirit', 'Forgiving Being', 'Forgiving Master'] },
  { id: 'mercy', name: 'Mercy', icon: '💙', names: ['Merciful Soul', 'Merciful Heart', 'Merciful Spirit', 'Merciful Being', 'Merciful Master'] },
  { id: 'justice', name: 'Justice', icon: '⚖️', names: ['Just Soul', 'Just Heart', 'Just Spirit', 'Just Being', 'Just Master'] },
  { id: 'honesty', name: 'Honesty', icon: '💎', names: ['Honest Soul', 'Honest Heart', 'Honest Spirit', 'Honest Being', 'Honest Master'] },
  { id: 'humility', name: 'Humility', icon: '🕊️', names: ['Humble Soul', 'Humble Heart', 'Humble Spirit', 'Humble Being', 'Humble Master'] },
  { id: 'generosity', name: 'Generosity', icon: '💝', names: ['Generous Soul', 'Generous Heart', 'Generous Spirit', 'Generous Being', 'Generous Master'] },
  { id: 'courage', name: 'Courage', icon: '🦁', names: ['Courageous Soul', 'Courageous Heart', 'Courageous Spirit', 'Courageous Being', 'Courageous Master'] }
];

// Each deed category gets 10 milestones
deedCategories.forEach(cat => {
  const milestones = [5,10,15,20,25,30,40,50,75,100];
  milestones.forEach((count, i) => {
    const tier = count <= 10 ? 'bronze' : count <= 25 ? 'silver' : count <= 50 ? 'gold' : count <= 75 ? 'platinum' : count <= 90 ? 'diamond' : 'legendary';
    const nameIdx = Math.floor(i / 2) % cat.names.length;
    add(id++, `${cat.names[nameIdx]} ${count}`, `Perform ${cat.name} ${count} times`, cat.icon, tier, `s => (s.td.${cat.id}||0)>=${count}`);
  });
});

// Total deed milestones
const totalDeedMilestones = [10,25,50,75,100,150,200,250,300,400,500,600,700,800,900,1000,1250,1500,1750,2000,2500,3000,3500,4000,4500,5000,6000,7000,8000,9000,10000];
totalDeedMilestones.forEach((count, i) => {
  const tier = count <= 50 ? 'bronze' : count <= 200 ? 'silver' : count <= 500 ? 'gold' : count <= 1500 ? 'platinum' : count <= 5000 ? 'diamond' : 'legendary';
  add(id++, `Deed Master ${count}`, `Complete ${count} total deeds`, '🌟', tier, `s => Object.values(s.td).reduce((a,b)=>a+b,0)>=${count}`);
});

// Unique deed milestones
const uniqueDeedMilestones = [5,10,15,20,25,30,35,40,45,50,55,60,65,70,75,80,85,90,95,100,110,120,130,140,150,160,170,180,184];
uniqueDeedMilestones.forEach((count, i) => {
  const tier = count <= 15 ? 'bronze' : count <= 30 ? 'silver' : count <= 60 ? 'gold' : count <= 100 ? 'platinum' : count <= 150 ? 'diamond' : 'legendary';
  add(id++, `Deed Diversifier ${count}`, `Perform ${count} different deeds`, '🎨', tier, `s => Object.keys(s.td).filter(k=>s.td[k]>0).length>=${count}`);
});

// === QUEST ACHIEVEMENTS (100) ===
// Daily quests
const dailyQuestMilestones = [1,2,3,5,7,10,15,20,25,30,40,50,60,75,100,125,150,175,200,250,300,350,400,450,500];
dailyQuestMilestones.forEach((count, i) => {
  const tier = count <= 5 ? 'bronze' : count <= 15 ? 'silver' : count <= 50 ? 'gold' : count <= 150 ? 'platinum' : count <= 300 ? 'diamond' : 'legendary';
  add(id++, `Daily Quest ${count}`, `Complete ${count} daily quests`, '🎯', tier, `s => (s.tq||0)>=${count}`);
});

// Weekly quests
const weeklyQuestMilestones = [1,2,3,4,5,6,7,8,10,12,15,18,20,25,30,35,40,45,50,60,70,80,90,100];
weeklyQuestMilestones.forEach((count, i) => {
  const tier = count <= 3 ? 'bronze' : count <= 8 ? 'silver' : count <= 20 ? 'gold' : count <= 50 ? 'platinum' : count <= 80 ? 'diamond' : 'legendary';
  add(id++, `Weekly Quest ${count}`, `Complete ${count} weekly quests`, '📋', tier, `s => (s.tq||0)>=${count*5}`);
});

// Monthly quests
const monthlyQuestMilestones = [1,2,3,4,5,6,7,8,10,12,15,18,20,24,30,36,42,48,54,60];
monthlyQuestMilestones.forEach((count, i) => {
  const tier = count <= 3 ? 'bronze' : count <= 8 ? 'silver' : count <= 15 ? 'gold' : count <= 30 ? 'platinum' : count <= 48 ? 'diamond' : 'legendary';
  add(id++, `Monthly Quest ${count}`, `Complete ${count} monthly quests`, '📅', tier, `s => (s.tq||0)>=${count*20}`);
});

// === LEVEL ACHIEVEMENTS (100) ===
const levelMilestones = [1,2,3,5,7,10,15,20,25,30,35,40,45,50,60,70,80,90,100,110,120,130,140,150,160,170,180,190,200,225,250,275,300,325,350,375,400,425,450,475,500,525,550,575,600,625,650,675,700,725,750,775,800,825,850,875,900,925,950,975,999];
levelMilestones.forEach((count, i) => {
  const tier = count <= 10 ? 'bronze' : count <= 30 ? 'silver' : count <= 100 ? 'gold' : count <= 300 ? 'platinum' : count <= 700 ? 'diamond' : 'legendary';
  const name = LEVEL_NAMES[i % LEVEL_NAMES.length];
  add(id++, `${name} ${count}`, `Reach level ${count}`, '⭐', tier, `s => s.lv>=${count}`);
});

// === CONTENT ACHIEVEMENTS (100) ===
// Content pool consumption
const contentPools = [
  { key: 'duaIdx', name: 'Duas', icon: '🤲' },
  { key: 'quranIdx', name: 'Quran Verses', icon: '📖' },
  { key: 'sunnahIdx', name: 'Sunnah', icon: '🕌' },
  { key: 'dhikrIdx', name: 'Dhikr', icon: '📿' },
  { key: 'storiesIdx', name: 'Stories', icon: '📚' },
  { key: 'hadithIdx', name: 'Hadiths', icon: '📜' },
  { key: 'namesIdx', name: 'Names of Allah', icon: '✨' },
  { key: 'seerahIdx', name: 'Seerah', icon: '📜' },
  { key: 'tafsirIdx', name: 'Tafsir', icon: '📖' },
  { key: 'knowledgeIdx', name: 'Knowledge', icon: '📚' }
];

contentPools.forEach(pool => {
  const milestones = [5,10,15,20,25,30,40,50,60,75,100];
  milestones.forEach((count, i) => {
    const tier = count <= 10 ? 'bronze' : count <= 25 ? 'silver' : count <= 50 ? 'gold' : count <= 75 ? 'platinum' : count <= 90 ? 'diamond' : 'legendary';
    add(id++, `${pool.name} ${count}`, `Read ${count} ${pool.name.toLowerCase()}`, pool.icon, tier, `s => (s.${pool.key}||[]).length>=${count}`);
  });
});

// Total content consumption
const totalContentMilestones = [10,25,50,75,100,150,200,250,300,400,500,600,700,800,900,1000,1250,1500,1750,2000,2500,3000,3500,4000,4500,5000];
totalContentMilestones.forEach((count, i) => {
  const tier = count <= 50 ? 'bronze' : count <= 200 ? 'silver' : count <= 500 ? 'gold' : count <= 1500 ? 'platinum' : count <= 3000 ? 'diamond' : 'legendary';
  add(id++, `Content Explorer ${count}`, `Consume ${count} content items`, '📚', tier, `s => {let t=0;['duaIdx','quranIdx','sunnahIdx','dhikrIdx','storiesIdx','hadithIdx','namesIdx','seerahIdx','tafsirIdx','knowledgeIdx'].forEach(k=>{t+=(s[k]||[]).length});return t>=${count}}`);
});

// === SPECIAL ACHIEVEMENTS (199) ===
// Fasting milestones
const fastingMilestones = [1,2,3,5,7,10,14,21,30,40,50,60,75,100,125,150,175,200,250,300,350,400,450,500];
fastingMilestones.forEach((count, i) => {
  const tier = count <= 5 ? 'bronze' : count <= 14 ? 'silver' : count <= 50 ? 'gold' : count <= 150 ? 'platinum' : count <= 300 ? 'diamond' : 'legendary';
  add(id++, `Faster ${count}`, `Fast ${count} days`, '🌙', tier, `s => (s.td.fasting||0)>=${count}`);
});

// Charity milestones
const charityMilestones = [1,2,3,5,7,10,14,21,30,40,50,60,75,100,125,150,175,200,250,300,350,400,450,500];
charityMilestones.forEach((count, i) => {
  const tier = count <= 5 ? 'bronze' : count <= 14 ? 'silver' : count <= 50 ? 'gold' : count <= 150 ? 'platinum' : count <= 300 ? 'diamond' : 'legendary';
  add(id++, `Charity ${count}`, `Give charity ${count} times`, '🤲', tier, `s => (s.td.charity||0)>=${count}`);
});

// Memorization milestones
const memorizationMilestones = [1,2,3,5,7,10,15,20,25,30,40,50,60,75,100,125,150];
memorizationMilestones.forEach((count, i) => {
  const tier = count <= 3 ? 'bronze' : count <= 10 ? 'silver' : count <= 30 ? 'gold' : count <= 75 ? 'platinum' : count <= 125 ? 'diamond' : 'legendary';
  add(id++, `Memorizer ${count}`, `Memorize ${count} surahs`, '🧠', tier, `s => (s.memorized||0)>=${count}`);
});

// Gratitude milestones
const gratitudeMilestones = [1,2,3,5,7,10,14,21,30,40,50,60,75,100,125,150,175,200,250,300,350,400,450,500];
gratitudeMilestones.forEach((count, i) => {
  const tier = count <= 5 ? 'bronze' : count <= 14 ? 'silver' : count <= 50 ? 'gold' : count <= 150 ? 'platinum' : count <= 300 ? 'diamond' : 'legendary';
  add(id++, `Grateful ${count}`, `Write ${count} gratitude entries`, '🙌', tier, `s => Object.values(s.gratitudeLog||{}).flat().length>=${count}`);
});

// XP milestones
const xpMilestones = [100,250,500,750,1000,1500,2000,2500,3000,4000,5000,6000,7000,8000,9000,10000,12500,15000,17500,20000,25000,30000,35000,40000,45000,50000,60000,70000,80000,90000,100000];
xpMilestones.forEach((count, i) => {
  const tier = count <= 500 ? 'bronze' : count <= 2000 ? 'silver' : count <= 10000 ? 'gold' : count <= 30000 ? 'platinum' : count <= 70000 ? 'diamond' : 'legendary';
  add(id++, `XP ${count.toLocaleString()}`, `Earn ${count.toLocaleString()} XP`, '⭐', tier, `s => s.xp>=${count}`);
});

// Fill remaining to reach 999
while (achievements.length < 999) {
  const tier = getTier(achievements.length + 1);
  const namePool = tier === 'bronze' ? PRAYER_NAMES : tier === 'silver' ? STREAK_NAMES : tier === 'gold' ? DEED_NAMES : tier === 'platinum' ? LEVEL_NAMES : tier === 'diamond' ? QUEST_NAMES : CONTENT_NAMES;
  const name = namePool[achievements.length % namePool.length];
  const count = 100 + achievements.length * 10;
  add(id++, `${name} ${achievements.length + 1}`, `Achieve milestone ${achievements.length + 1}`, '⭐', tier, `s => s.tp>=${count}`);
}

// Output as JavaScript
console.log(`const ACHS = [`);
achievements.forEach((a, i) => {
  const comma = i < achievements.length - 1 ? ',' : '';
  console.log(`  { id:'${a.id}', name:'${a.name.replace(/'/g, "\\'")}', desc:'${a.desc.replace(/'/g, "\\'")}', icon:'${a.icon}', tier:'${a.tier}', c: ${a.c} }${comma}`);
});
console.log(`];`);
