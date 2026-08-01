const TAB_GROUPS = {

  history: [
    { id: 'umayyads', icon: '🏛️', label: 'Umayyads' }, { id: 'abbasids', icon: '📜', label: 'Abbasids' }, { id: 'andalus', icon: '🏰', label: 'Andalus' }, { id: 'ottomans', icon: '🕌', label: 'Ottomans' },
    { id: 'mamluks', icon: '⚔️', label: 'Mamluks' }, { id: 'seljuks', icon: '🏇', label: 'Seljuks' }, { id: 'fatimids', icon: '🌙', label: 'Fatimids' }, { id: 'ayyubids', icon: '🛡️', label: 'Ayyubids' },
    { id: 'modernhist', icon: '🌍', label: 'Modern Hist.' }, { id: 'ancientprophets', icon: '⏳', label: 'Ancient' }
  ],
  fiqh: [
    { id: 'purification', icon: '💧', label: 'Purification' }, { id: 'salahrules', icon: '🕌', label: 'Salah' }, { id: 'zakatrules', icon: '🪙', label: 'Zakat' }, { id: 'sawmrules', icon: '🌙', label: 'Sawm' },
    { id: 'hajjrules', icon: '🕋', label: 'Hajj' }, { id: 'trade', icon: '⚖️', label: 'Trade' }, { id: 'marriagelaws', icon: '💍', label: 'Marriage' }, { id: 'inheritance', icon: '📜', label: 'Inheritance' },
    { id: 'halaldiet', icon: '🍽️', label: 'Halal Diet' }, { id: 'oaths', icon: '✋', label: 'Oaths' }
  ],
  spirit: [
    { id: 'sufism', icon: '🤍', label: 'Sufism' }, { id: 'tazkiyah', icon: '✨', label: 'Tazkiyah' }, { id: 'fear', icon: '😨', label: 'Fear of Allah' },
    { id: 'hope', icon: '🕊️', label: 'Hope' }, { id: 'loveofallah', icon: '❤️', label: 'Love of Allah' }, { id: 'sincerity', icon: '💎', label: 'Sincerity' },
    { id: 'contentment', icon: '😌', label: 'Contentment' }, { id: 'reflection', icon: '🪞', label: 'Reflection' }
  ],
  modern: [
    { id: 'technology', icon: '📱', label: 'Technology' }, { id: 'socialmedia', icon: '🌐', label: 'Social Media' }, { id: 'ethics', icon: '🤝', label: 'Ethics' }, { id: 'bioethics', icon: '🧬', label: 'Bioethics' },
    { id: 'modfinance', icon: '💳', label: 'Mod. Finance' }, { id: 'politics', icon: '🏛️', label: 'Politics' }, { id: 'green', icon: '🌱', label: 'Green Islam' }, { id: 'mentalhealth', icon: '🧠', label: 'Mental Health' },
    { id: 'education', icon: '📚', label: 'Education' }
  ],
  geo: [
    { id: 'mecca', icon: '🕋', label: 'Mecca' }, { id: 'medina', icon: '🕌', label: 'Medina' }, { id: 'jerusalem', icon: '🕌', label: 'Jerusalem' }, { id: 'damascus', icon: '🏛️', label: 'Damascus' },
    { id: 'baghdad', icon: '📜', label: 'Baghdad' }, { id: 'cairo', icon: '🏛️', label: 'Cairo' }, { id: 'cordoba', icon: '🏰', label: 'Cordoba' }, { id: 'istanbul', icon: '🕌', label: 'Istanbul' },
    { id: 'bukhara', icon: '🕌', label: 'Bukhara' }, { id: 'samarkand', icon: '🗺️', label: 'Samarkand' }
  ],
  arts: [
    { id: 'calligraphy', icon: '🖋️', label: 'Calligraphy' }, { id: 'architecture', icon: '🏛️', label: 'Architecture' }, { id: 'geometry', icon: '💠', label: 'Geometry' }, { id: 'poetryart', icon: '📜', label: 'Poetry' },
    { id: 'literature', icon: '📚', label: 'Literature' }, { id: 'nasheeds', icon: '🎵', label: 'Nasheeds' }, { id: 'illumination', icon: '✨', label: 'Illumination' }, { id: 'textiles', icon: '🧵', label: 'Textiles' },
    { id: 'ceramics', icon: '🏺', label: 'Ceramics' }, { id: 'woodwork', icon: '🪵', label: 'Woodwork' }
  ],
  scholars2: [
    { id: 'abuhanifa', icon: '🧠', label: 'Abu Hanifa' }, { id: 'malik', icon: '🧠', label: 'Malik' }, { id: 'shafii', icon: '🧠', label: 'Shafi\'i' }, { id: 'ahmad', icon: '🧠', label: 'Ahmad' },
    { id: 'alghazali', icon: '🧠', label: 'Al-Ghazali' }, { id: 'ibntaymiyyah', icon: '🧠', label: 'Ibn Taymiyyah' }, { id: 'ibnkhaldun', icon: '🧠', label: 'Ibn Khaldun' }, { id: 'ibnrushd', icon: '🧠', label: 'Ibn Rushd' },
    { id: 'ibnsina', icon: '🧠', label: 'Ibn Sina' }, { id: 'alkhwarizmi', icon: '🧠', label: 'Al-Khwarizmi' }
  ],
  lang: [
    { id: 'arabicgrammar', icon: '📖', label: 'Grammar' }, { id: 'vocab', icon: '🔤', label: 'Vocab' }, { id: 'rhetoric', icon: '🗣️', label: 'Rhetoric' }, { id: 'morphology', icon: '🧩', label: 'Morphology' },
    { id: 'pronunciation', icon: '🎙️', label: 'Tajweed' }, { id: 'poetry', icon: '📜', label: 'Poetry' }, { id: 'proverbs', icon: '💡', label: 'Proverbs' }, { id: 'etymology', icon: '🔍', label: 'Etymology' },
    { id: 'dialects', icon: '🌍', label: 'Dialects' }, { id: 'scripts', icon: '✍️', label: 'Scripts' }
  ],
  society: [
    { id: 'brotherhood', icon: '🤝', label: 'Brotherhood' }, { id: 'sisterhood', icon: '🌸', label: 'Sisterhood' }, { id: 'neighbors2', icon: '🏡', label: 'Neighbors' }, { id: 'orphans2', icon: '🧸', label: 'Orphans' },
    { id: 'elderly', icon: '🧓', label: 'Elderly' }, { id: 'disabled', icon: '♿', label: 'Disabled' }, { id: 'antiracism', icon: '🌍', label: 'Anti-Racism' }, { id: 'poverty', icon: '🍞', label: 'Poverty' },
    { id: 'charityproj', icon: '🪙', label: 'Charity' }, { id: 'volunteering', icon: '✋', label: 'Volunteering' }
  ],
  philosophy: [
    { id: 'epistemology', icon: '🧠', label: 'Epistemology' }, { id: 'ontology', icon: '🌌', label: 'Ontology' }, { id: 'ethicsphil', icon: '⚖️', label: 'Ethics' }, { id: 'logic', icon: '🧩', label: 'Logic' },
    { id: 'kalam', icon: '🗣️', label: 'Kalam' }, { id: 'reason', icon: '💡', label: 'Reason' }, { id: 'freewill', icon: '⚖️', label: 'Free Will' }, { id: 'problemofevil', icon: '🌑', label: 'Prob of Evil' },
    { id: 'prophethood', icon: '📜', label: 'Prophethood' }, { id: 'existence', icon: '✨', label: 'Existence' }
  ],
  ibadah: [
    { id: 'today',      icon: '🕌', label: 'Today' },
    { id: 'timer',      icon: '⏳', label: 'Prayer Times' },
    { id: 'quests',     icon: '🎯', label: 'Quests' },
    { id: 'challenges', icon: '⚔️', label: 'Challenges' },
    { id: 'morning',    icon: '🌞', label: 'Morning' },
    { id: 'evening',    icon: '🌆', label: 'Evening' },
    { id: 'dhikr',      icon: '📿', label: 'Remembrance' },
    { id: 'duas',       icon: '🤲', label: 'Supplications' },
    { id: 'wudu',       icon: '💧', label: 'Ablution' },
    { id: 'salah',      icon: '🛐', label: 'Prayer Guide' },
    { id: 'jumuah',     icon: '🕌', label: 'Friday Prayer' },
    { id: 'fasting',    icon: '🌙', label: 'Fasting' }
  ],
  ilm: [
    { id: 'quran',      icon: '📖', label: 'Quran' },
    { id: 'tafsir',     icon: '📜', label: 'Interpretation' },
    { id: 'hadith',     icon: '💭', label: 'Hadith' },
    { id: 'sunnahs',    icon: '☀️', label: 'Prophetic Ways' },
    { id: 'aqeedah',    icon: '🛡️', label: 'Creed' },
    { id: 'fiqh',       icon: '⚖️', label: 'Jurisprudence' },
    { id: 'arabic',     icon: '🔤', label: 'Arabic' },
    { id: 'names',      icon: '💯', label: '99 Names' },
    { id: 'scholars',   icon: '🖋️', label: 'Scholars' },
    { id: 'knowledge',  icon: '🧠', label: 'Seeking Knowledge' },
    { id: 'memorization', icon: '📗', label: 'Memorization' }
  ],
  qalb: [
    { id: 'heart',       icon: '🤍', label: 'Heart Diseases' },
    { id: 'ikhlas',      icon: '✨', label: 'Sincerity' },
    { id: 'tawakkul',    icon: '🌿', label: 'Reliance' },
    { id: 'manners',     icon: '🤝', label: 'Manners' },
    { id: 'patience',    icon: '🏔️', label: 'Patience & Gratitude' },
    { id: 'gratitude',   icon: '🙌', label: 'Gratitude' },
    { id: 'sins',        icon: '🚫', label: 'Major Sins' },
    { id: 'repentance',  icon: '💧', label: 'Repentance' },
    { id: 'zuhd',        icon: '🌾', label: 'Asceticism' },
    { id: 'inspirations',icon: '💬', label: 'Inspirations' }
  ],
  muamalat: [
    { id: 'family',      icon: '👨‍👩‍👧‍👦', label: 'Family' },
    { id: 'marriage',    icon: '💍', label: 'Marriage' },
    { id: 'parenting',   icon: '👶', label: 'Parenting' },
    { id: 'charity',     icon: '🤲', label: 'Charity' },
    { id: 'finance',     icon: '💰', label: 'Finance' },
    { id: 'work',        icon: '💼', label: 'Career' },
    { id: 'neighbors',   icon: '🏡', label: 'Neighbors' },
    { id: 'community',   icon: '🏘️', label: 'Community' },
    { id: 'ummah',       icon: '🌍', label: 'Global Nation' },
    { id: 'dawah',       icon: '📢', label: 'Invitation' },
    { id: 'punishments', icon: '⚖️', label: 'Justice' }
  ],
  tarikh: [
    { id: 'seerah',       icon: '🐪', label: 'Biography' },
    { id: 'sahaba',       icon: '⭐', label: 'Companions' },
    { id: 'prophets',     icon: '📜', label: 'Prophets' },
    { id: 'women',        icon: '🧕', label: 'Great Women' },
    { id: 'stories',      icon: '📚', label: 'Stories' },
    { id: 'battles',      icon: '🗡️', label: 'Battles' },
    { id: 'civilisation', icon: '🏛️', label: 'Civilization' },
    { id: 'science',      icon: '🔭', label: 'Science' }
  ],
  akhira: [
    { id: 'akhirah',  icon: '🌌', label: 'Hereafter' },
    { id: 'jannah',   icon: '🌴', label: 'Paradise' },
    { id: 'jahannam', icon: '🔥', label: 'Hellfire' },
    { id: 'grave',    icon: '🪦', label: 'The Grave' },
    { id: 'signs',    icon: '🔮', label: 'Signs of Qiyamah' },
    { id: 'hajj',     icon: '🕋', label: 'Pilgrimage' },
    { id: 'dreams',   icon: '🌙', label: 'Islamic Dreams' }
  ],
  hayat: [
    { id: 'health',      icon: '🍎', label: 'Health' },
    { id: 'tibb',        icon: '🌿', label: 'Prophetic Medicine' },
    { id: 'food',        icon: '🍽️', label: 'Halal Food' },
    { id: 'environment', icon: '🌱', label: 'Environment' },
    { id: 'travel',      icon: '✈️', label: 'Travel' },
    { id: 'youth',       icon: '🎓', label: 'Youth' },
    { id: 'tech',        icon: '📱', label: 'Tech & Islam' }
  ]
};
