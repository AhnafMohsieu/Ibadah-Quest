const TAB_GROUPS = {

  // ── DAILY (categorized — core habit loop, always visible) ──
  ibadah: [
    {
      id: 'core', icon: 'home', label: 'Core',
      tabs: [
        { id: 'today', icon: 'home', label: 'Today' },
        { id: 'timer', icon: 'clock', label: 'Prayer Times' },
        { id: 'quests', icon: 'scroll', label: 'Quests' },
        { id: 'journeys', icon: 'map', label: 'Journeys' }
      ]
    },
    {
      id: 'adhkar', icon: 'beads', label: 'Adhkar',
      tabs: [
        { id: 'morning', icon: 'sunrise', label: 'Morning' },
        { id: 'evening', icon: 'sunset', label: 'Evening' },
        { id: 'dhikr', icon: 'beads', label: 'Remembrance' },
        { id: 'situational', icon: 'heart', label: 'Situational' }
      ]
    },
    {
      id: 'worship', icon: 'mosque', label: 'Guide',
      tabs: [
        { id: 'wudu', icon: 'droplets', label: 'Ablution' },
        { id: 'salah', icon: 'mosque', label: 'Prayer Guide' },
        { id: 'sunnahs', icon: 'sun', label: 'Prophetic Ways' },
        { id: 'extradeeds', icon: 'star', label: 'Extra Deeds' },
        { id: 'volprayers', icon: 'moon', label: 'Vol. Prayers' }
      ]
    },
    {
      id: 'tracking', icon: 'bar-chart-3', label: 'Self-Tracking',
      tabs: [
        { id: 'fasting', icon: 'crescent', label: 'Fasting' },
        { id: 'healthlog', icon: 'heartbeat', label: 'Health' },
        { id: 'finance', icon: 'wallet', label: 'Finance' },
        { id: 'memorization', icon: 'brain', label: 'Memorization' },
        { id: 'gratitude', icon: 'sun', label: 'Gratitude' },
        { id: 'charity', icon: 'hand-heart', label: 'Charity' },
        { id: 'zakatcalc', icon: 'coin', label: 'Zakat' }
      ]
    }
  ],

  // ── KNOWLEDGE (categorized — religious learning) ──
  knowledge: [
    {
      id: 'quran_sunnah', icon: 'book-open', label: "Qur'an & Sunnah",
      tabs: [
        { id: 'quran',       icon: 'book-open', label: 'Quran' },
        { id: 'tafsir',      icon: 'scroll', label: 'Interpretation' },
        { id: 'hadith',      icon: 'bookmarks', label: 'Hadith' },
        { id: 'sunnahs',     icon: 'star', label: 'Prophetic Ways' },
        { id: 'memorization', icon: 'brain', label: 'Memorization' }
      ]
    },
    {
      id: 'fiqh', icon: 'scales', label: 'Fiqh & Rulings',
      tabs: [
        { id: 'fiqh',        icon: 'scales', label: 'Jurisprudence' },
        { id: 'purification', icon: 'droplets', label: 'Purification' },
        { id: 'salahrules',  icon: 'mosque', label: 'Salah' },
        { id: 'zakatrules',  icon: 'wallet', label: 'Zakat' },
        { id: 'sawmrules',   icon: 'crescent', label: 'Sawm' },
        { id: 'hajjrules',   icon: 'kaaba', label: 'Hajj' },
        { id: 'trade',       icon: 'handshake', label: 'Trade' },
        { id: 'inheritance', icon: 'scroll', label: 'Inheritance' },
        { id: 'oaths',       icon: 'handshake', label: 'Oaths' }
      ]
    },
    {
      id: 'creed', icon: 'pencil', label: 'Arabic',
      tabs: [
        { id: 'arabic',      icon: 'pencil', label: 'Arabic' }
      ]
    },
    {
      id: 'heart', icon: 'heart', label: 'Heart & Soul',
      tabs: [
        { id: 'heart',       icon: 'heart', label: 'Heart Diseases' },
        { id: 'ikhlas',      icon: 'sparkles', label: 'Sincerity' },
        { id: 'tawakkul',    icon: 'shield', label: 'Reliance' },
        { id: 'manners',     icon: 'handshake', label: 'Manners' },
        { id: 'patience',    icon: 'hourglass', label: 'Patience & Gratitude' },
        { id: 'gratitude',   icon: 'sun', label: 'Gratitude' },
        { id: 'sins',        icon: 'alert-triangle', label: 'Major Sins' },
        { id: 'repentance',  icon: 'hand-heart', label: 'Repentance' },
        { id: 'zuhd',        icon: 'leaf', label: 'Asceticism' },
        { id: 'inspirations', icon: 'sparkles', label: 'Inspirations' },
        { id: 'sufism',      icon: 'crescent', label: 'Sufism' },
        { id: 'tazkiyah',    icon: 'sprout', label: 'Tazkiyah' },
        { id: 'fear',        icon: 'cloud-sun', label: 'Fear of Allah' },
        { id: 'hope',        icon: 'sun', label: 'Hope' },
        { id: 'loveofallah', icon: 'heart', label: 'Love of Allah' },
        { id: 'contentment', icon: 'smile', label: 'Contentment' },
        { id: 'reflection',  icon: 'pencil', label: 'Reflection' }
      ]
    },
    {
      id: 'society', icon: 'users', label: 'Dealings & Society',
      tabs: [
        { id: 'family',      icon: 'family', label: 'Family' },
        { id: 'marriage',    icon: 'gem', label: 'Marriage' },
        { id: 'parenting',   icon: 'baby', label: 'Parenting' },
        { id: 'charity',     icon: 'hand-heart', label: 'Charity' },
        { id: 'work',        icon: 'briefcase', label: 'Career' },
        { id: 'neighbors',   icon: 'home', label: 'Neighbors' },
        { id: 'community',   icon: 'users', label: 'Community' },
        { id: 'ummah',       icon: 'globe', label: 'Global Nation' },
        { id: 'dawah',       icon: 'megaphone', label: 'Invitation' },
        { id: 'punishments', icon: 'scales', label: 'Justice' },
        { id: 'brotherhood', icon: 'handshake', label: 'Brotherhood' },
        { id: 'sisterhood',  icon: 'users', label: 'Sisterhood' },
        { id: 'orphans2',    icon: 'baby', label: 'Orphans' },
        { id: 'elderly',     icon: 'family', label: 'Elderly' },
        { id: 'disabled',    icon: 'user', label: 'Disabled' },
        { id: 'antiracism',  icon: 'heart', label: 'Anti-Racism' },
        { id: 'poverty',     icon: 'hand-heart', label: 'Poverty' },
        { id: 'volunteering', icon: 'hand-heart', label: 'Volunteering' }
      ]
    },
    {
      id: 'life', icon: 'leaf', label: 'Life & Modern',
      tabs: [
        { id: 'health',      icon: 'heartbeat', label: 'Health' },
        { id: 'tibb',        icon: 'leaf', label: 'Prophetic Medicine' },
        { id: 'food',        icon: 'utensils', label: 'Halal Food' },
        { id: 'environment', icon: 'tree', label: 'Environment' },
        { id: 'travel',      icon: 'plane', label: 'Travel' },
        { id: 'youth',       icon: 'zap', label: 'Youth' },
        { id: 'tech',        icon: 'monitor', label: 'Tech & Islam' },
        { id: 'technology',  icon: 'monitor', label: 'Technology' },
        { id: 'socialmedia', icon: 'globe', label: 'Social Media' },
        { id: 'ethics',      icon: 'handshake', label: 'Ethics' },
        { id: 'bioethics',   icon: 'dna', label: 'Bioethics' },
        { id: 'modfinance',  icon: 'dollar-sign', label: 'Mod. Finance' },
        { id: 'politics',    icon: 'landmark', label: 'Politics' },
        { id: 'green',       icon: 'sprout', label: 'Green Islam' },
        { id: 'mentalhealth', icon: 'brain', label: 'Mental Health' },
        { id: 'education',   icon: 'school', label: 'Education' }
      ]
    },
    {
      id: 'history', icon: 'scroll', label: 'History & Seerah',
      tabs: [
        { id: 'seerah',       icon: 'scroll', label: 'Biography' },
        { id: 'sahaba',       icon: 'users', label: 'Companions' },
        { id: 'prophets',     icon: 'crescent', label: 'Prophets' },
        { id: 'women',        icon: 'family', label: 'Great Women' },
        { id: 'stories',      icon: 'book-open', label: 'Stories' },
        { id: 'battles',      icon: 'sword', label: 'Battles' },
        { id: 'science',      icon: 'monitor', label: 'Science' }
      ]
    },
    {
      id: 'hereafter', icon: 'moon', label: 'Hereafter',
      tabs: [
        { id: 'akhirah',  icon: 'moon', label: 'Hereafter' },
        { id: 'jannah',   icon: 'sparkles', label: 'Paradise' },
        { id: 'jahannam', icon: 'flame', label: 'Hellfire' },
        { id: 'grave',    icon: 'coffin', label: 'The Grave' },
        { id: 'signs',    icon: 'clock', label: 'Signs of Qiyamah' },
        { id: 'hajj',     icon: 'kaaba', label: 'Pilgrimage' },
        { id: 'dreams',   icon: 'moon', label: 'Islamic Dreams' }
      ]
    }
  ],

  // ── PROFILE ──
  profile_main: [
    { id: 'profile', icon: 'user', label: 'Profile' },
    { id: 'trophies', icon: 'trophy', label: 'Trophies' },
    { id: 'progress', icon: 'bar-chart-3', label: 'Progress' },
    { id: 'stats', icon: 'trending-up', label: 'Analytics' },
    { id: 'rewards', icon: 'gift', label: 'Rewards' }
  ],

  // ── LIBRARY (categorized — reference shelves) ──
  library: [
    {
      id: 'dynasties', icon: 'landmark', label: 'Dynasties',
      tabs: [
        { id: 'umayyads', icon: 'crescent', label: 'Umayyads' }, { id: 'abbasids', icon: 'book-open', label: 'Abbasids' }, { id: 'andalus', icon: 'palette', label: 'Andalus' }, { id: 'ottomans', icon: 'crown', label: 'Ottomans' },
        { id: 'mamluks', icon: 'shield', label: 'Mamluks' }, { id: 'seljuks', icon: 'moon', label: 'Seljuks' }, { id: 'fatimids', icon: 'star', label: 'Fatimids' }, { id: 'ayyubids', icon: 'sword', label: 'Ayyubids' },
        { id: 'modernhist', icon: 'trending-up', label: 'Modern Hist.' }, { id: 'ancientprophets', icon: 'scroll', label: 'Ancient' }
      ]
    },
    {
      id: 'cities', icon: 'building', label: 'Cities & Lands',
      tabs: [
        { id: 'mecca', icon: 'kaaba', label: 'Mecca' }, { id: 'medina', icon: 'mosque', label: 'Medina' }, { id: 'jerusalem', icon: 'mosque', label: 'Jerusalem' }, { id: 'damascus', icon: 'mosque', label: 'Damascus' },
        { id: 'baghdad', icon: 'mosque', label: 'Baghdad' }, { id: 'cairo', icon: 'mosque', label: 'Cairo' }, { id: 'cordoba', icon: 'palette', label: 'Cordoba' }, { id: 'istanbul', icon: 'crown', label: 'Istanbul' },
        { id: 'bukhara', icon: 'book', label: 'Bukhara' }, { id: 'samarkand', icon: 'building', label: 'Samarkand' }
      ]
    },
    {
      id: 'arts', icon: 'palette', label: 'Arts & Crafts',
      tabs: [
        { id: 'calligraphy', icon: 'pen-tool', label: 'Calligraphy' }, { id: 'architecture', icon: 'mosque', label: 'Architecture' }, { id: 'geometry', icon: 'target', label: 'Geometry' }, { id: 'poetryart', icon: 'pen-tool', label: 'Poetry' },
        { id: 'literature', icon: 'book-open', label: 'Literature' }, { id: 'nasheeds', icon: 'headphones', label: 'Nasheeds' }, { id: 'illumination', icon: 'sparkles', label: 'Illumination' }, { id: 'textiles', icon: 'palette', label: 'Textiles' },
        { id: 'ceramics', icon: 'palette', label: 'Ceramics' }, { id: 'woodwork', icon: 'leaf', label: 'Woodwork' }
      ]
    },
    {
      id: 'arabic_lang', icon: 'pencil', label: 'Arabic Language',
      tabs: [
        { id: 'arabicgrammar', icon: 'pencil', label: 'Grammar' }, { id: 'vocab', icon: 'book-open', label: 'Vocab' }, { id: 'rhetoric', icon: 'pen-tool', label: 'Rhetoric' }, { id: 'morphology', icon: 'pencil', label: 'Morphology' },
        { id: 'pronunciation', icon: 'megaphone', label: 'Tajweed' }, { id: 'poetry', icon: 'pen-tool', label: 'Poetry' }, { id: 'proverbs', icon: 'lightbulb', label: 'Proverbs' }, { id: 'etymology', icon: 'book-open', label: 'Etymology' },
        { id: 'dialects', icon: 'globe', label: 'Dialects' }, { id: 'scripts', icon: 'pencil', label: 'Scripts' }
      ]
    },
    {
      id: 'philosophy', icon: 'brain', label: 'Philosophy & Thought',
      tabs: [
        { id: 'epistemology', icon: 'brain', label: 'Epistemology' }, { id: 'ontology', icon: 'globe', label: 'Ontology' }, { id: 'logic', icon: 'brain', label: 'Logic' }, { id: 'kalam', icon: 'book', label: 'Kalam' },
        { id: 'reason', icon: 'lightbulb', label: 'Reason' }, { id: 'freewill', icon: 'shield', label: 'Free Will' }, { id: 'problemofevil', icon: 'alert-triangle', label: 'Prob of Evil' },
        { id: 'prophethood', icon: 'scroll', label: 'Prophethood' }, { id: 'existence', icon: 'eye', label: 'Existence' }
      ]
    }
  ]
};

window.TAB_GROUPS = TAB_GROUPS;
