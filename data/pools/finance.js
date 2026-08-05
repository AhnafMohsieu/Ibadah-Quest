const FINANCE_PROMPTS = [
  { id:'sadaqah', label:'Sadaqah', icon:'💝', desc:'Voluntary charity' },
  { id:'zakat', label:'Zakat', icon:'🕌', desc:'Obligatory 2.5% wealth' },
  { id:'zakat_fitr', label:'Zakat al-Fitr', icon:'🌙', desc:'Pre-Eid charity' },
  { id:'waqf', label:'Waqf', icon:'🏗️', desc:'Endowment' },
  { id:'sponsoring', label:'Sponsoring Orphan', icon:'👶', desc:'Monthly support' },
  { id:'qurban', label:'Qurban/Udhiyah', icon:'🐑', desc:'Sacrifice' },
  { id:'education', label:'Islamic Education', icon:'📚', desc:'Support learning' },
  { id:'medical', label:'Medical Aid', icon:'🏥', desc:'Healthcare support' },
  { id:'emergency', label:'Emergency Relief', icon:'🆘', desc:'Disaster relief' },
  { id:'mosque', label:'Mosque Building', icon:'🕌', desc:'Masjid support' }
];

const EXPENSE_CATEGORIES = [
  { id:'food', label:'Food & Groceries', icon:'🍽️' },
  { id:'rent', label:'Rent/Housing', icon:'🏠' },
  { id:'utilities', label:'Utilities', icon:'💡' },
  { id:'transport', label:'Transportation', icon:'🚗' },
  { id:'education', label:'Education', icon:'📖' },
  { id:'health', label:'Healthcare', icon:'🏥' },
  { id:'clothing', label:'Clothing', icon:'👔' },
  { id:'family', label:'Family', icon:'👨‍👩‍👧‍👦' },
  { id:'other', label:'Other', icon:'📦' }
];

const INCOME_SOURCES = [
  { id:'salary', label:'Salary', icon:'💰' },
  { id:'business', label:'Business', icon:'🏪' },
  { id:'freelance', label:'Freelance', icon:'💻' },
  { id:'investment', label:'Investment', icon:'📈' },
  { id:'gift', label:'Gift/Hadiah', icon:'🎁' },
  { id:'other', label:'Other', icon:'📦' }
];

const ZAKAT_RATE = 0.025;
const ZAKAT_NISAB_GOLD = 85;
const ZAKAT_NISAB_SILVER = 595;
