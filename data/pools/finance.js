const FINANCE_POOL = [
  { title:"Zakat: The Third Pillar", desc:"Zakat is obligatory on wealth above the Nisab threshold (85g gold or 595g silver). Rate is 2.5% annually. It purifies wealth and blesses it." },
  { title:"Sadaqah Jariyah (Ongoing Charity)", desc:"Charity that continues to benefit others after death: knowledge taught, mosque built, well dug, tree planted. The Prophet ﷺ said even a smile is sadaqah." },
  { title:"Spending in Allah's Cause", desc:"'The example of those who spend their wealth in the way of Allah is like a seed which grows seven ears.' (2:261)" },
  { title:"Avoiding Riba (Interest)", desc:"'Allah has permitted trade and has forbidden interest.' (2:275) Riba is a major sin — wealth earned through it will not barakah." },
  { title:"Trustworthiness in Business", desc:"The Prophet ﷺ was truthful and trustworthy. cheating in weights, measures, or hiding defects is haram." },
  { title:"Halal Earning", desc:"'Seek permissible (halal) sustenance and do not seek the impermissible.' wealth must come from lawful means to be blessed." },
  { title:"Generosity and Giving", desc:"'The upper hand is better than the lower hand.' The Prophet ﷺ was the most generous of people, especially in Ramadan." },
  { title:"Contentment (Qana'ah)", desc:"'Richness is not having many possessions, but richness is contentment of the soul.' (Bukhari) True wealth is internal." },
  { title:"Charity Does Not Decrease Wealth", desc:"'Charity does not decrease wealth.' (Muslim) Giving does not make you poorer — Allah increases and blesses what remains." },
  { title:"The Best Charity", desc:"The Prophet ﷺ said the best charity is feeding people. Giving food to the hungry is among the highest forms of sadaqah." }
];

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
