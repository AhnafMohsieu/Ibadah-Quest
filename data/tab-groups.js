const TAB_GROUPS = {

  // -- DAILY (flat � core habit loop, always visible) --
  ibadah: [
    { id: 'today', label: 'Today' },
    { id: 'timer', label: 'Prayer Times' },
    { id: 'quests', label: 'Quests' },
    { id: 'journeys', label: 'Journeys' },
    { id: 'morning', label: 'Morning' },
    { id: 'evening', label: 'Evening' },
    { id: 'dhikr', label: 'Remembrance' },
    { id: 'wudu', label: 'Ablution' },
    { id: 'salah', label: 'Prayer Guide' },
    { id: 'fasting', label: 'Fasting' },
    { id: 'healthlog', label: 'Health' },
    { id: 'finance', label: 'Finance' },
    { id: 'mood', label: 'Mood' }
  ],

  // -- KNOWLEDGE (categorized � religious learning) --
  knowledge: [
    {
      id: 'quran_sunnah', label: "Qur'an & Sunnah",
      tabs: [
        { id: 'quran', label: 'Quran' },
        { id: 'tafsir', label: 'Interpretation' },
        { id: 'hadith', label: 'Hadith' },
        { id: 'sunnahs', label: 'Prophetic Ways' },
        { id: 'memorization', label: 'Memorization' }
      ]
    },
    {
      id: 'fiqh', label: 'Fiqh & Rulings',
      tabs: [
        { id: 'fiqh', label: 'Jurisprudence' },
        { id: 'purification', label: 'Purification' },
        { id: 'salahrules', label: 'Salah' },
        { id: 'zakatrules', label: 'Zakat' },
        { id: 'sawmrules', label: 'Sawm' },
        { id: 'hajjrules', label: 'Hajj' },
        { id: 'trade', label: 'Trade' },
        { id: 'inheritance', label: 'Inheritance' },
        { id: 'oaths', label: 'Oaths' }
      ]
    },
    {
      id: 'creed', label: 'Aqeedah & Creed',
      tabs: [
        { id: 'aqeedah', label: 'Aqeedah' },
        { id: 'arabic', label: 'Arabic' }
      ]
    },
    {
      id: 'heart', label: 'Heart & Soul',
      tabs: [
        { id: 'heart', label: 'Heart Diseases' },
        { id: 'ikhlas', label: 'Sincerity' },
        { id: 'tawakkul', label: 'Reliance' },
        { id: 'manners', label: 'Manners' },
        { id: 'patience', label: 'Patience & Gratitude' },
        { id: 'gratitude', label: 'Gratitude' },
        { id: 'sins', label: 'Major Sins' },
        { id: 'repentance', label: 'Repentance' },
        { id: 'zuhd', label: 'Asceticism' },
        { id: 'inspirations', label: 'Inspirations' },
        { id: 'sufism', label: 'Sufism' },
        { id: 'tazkiyah', label: 'Tazkiyah' },
        { id: 'fear', label: 'Fear of Allah' },
        { id: 'hope', label: 'Hope' },
        { id: 'loveofallah', label: 'Love of Allah' },
        { id: 'contentment', label: 'Contentment' },
        { id: 'reflection', label: 'Reflection' }
      ]
    },
    {
      id: 'society', label: 'Dealings & Society',
      tabs: [
        { id: 'family', label: 'Family' },
        { id: 'marriage', label: 'Marriage' },
        { id: 'parenting', label: 'Parenting' },
        { id: 'charity', label: 'Charity' },
        { id: 'work', label: 'Career' },
        { id: 'neighbors', label: 'Neighbors' },
        { id: 'community', label: 'Community' },
        { id: 'ummah', label: 'Global Nation' },
        { id: 'dawah', label: 'Invitation' },
        { id: 'punishments', label: 'Justice' },
        { id: 'brotherhood', label: 'Brotherhood' },
        { id: 'sisterhood', label: 'Sisterhood' },
        { id: 'orphans2', label: 'Orphans' },
        { id: 'elderly', label: 'Elderly' },
        { id: 'disabled', label: 'Disabled' },
        { id: 'antiracism', label: 'Anti-Racism' },
        { id: 'poverty', label: 'Poverty' },
        { id: 'volunteering', label: 'Volunteering' }
      ]
    },
    {
      id: 'life', label: 'Life & Modern',
      tabs: [
        { id: 'health', label: 'Health' },
        { id: 'tibb', label: 'Prophetic Medicine' },
        { id: 'food', label: 'Halal Food' },
        { id: 'environment', label: 'Environment' },
        { id: 'travel', label: 'Travel' },
        { id: 'youth', label: 'Youth' },
        { id: 'tech', label: 'Tech & Islam' },
        { id: 'technology', label: 'Technology' },
        { id: 'socialmedia', label: 'Social Media' },
        { id: 'ethics', label: 'Ethics' },
        { id: 'bioethics', label: 'Bioethics' },
        { id: 'modfinance', label: 'Mod. Finance' },
        { id: 'politics', label: 'Politics' },
        { id: 'green', label: 'Green Islam' },
        { id: 'mentalhealth', label: 'Mental Health' },
        { id: 'education', label: 'Education' }
      ]
    },
    {
      id: 'history', label: 'History & Seerah',
      tabs: [
        { id: 'seerah', label: 'Biography' },
        { id: 'sahaba', label: 'Companions' },
        { id: 'prophets', label: 'Prophets' },
        { id: 'women', label: 'Great Women' },
        { id: 'stories', label: 'Stories' },
        { id: 'battles', label: 'Battles' },
        { id: 'science', label: 'Science' }
      ]
    },
    {
      id: 'hereafter', label: 'Hereafter',
      tabs: [
        { id: 'akhirah', label: 'Hereafter' },
        { id: 'jannah', label: 'Paradise' },
        { id: 'jahannam', label: 'Hellfire' },
        { id: 'grave', label: 'The Grave' },
        { id: 'signs', label: 'Signs of Qiyamah' },
        { id: 'hajj', label: 'Pilgrimage' },
        { id: 'dreams', label: 'Islamic Dreams' },
        { id: 'ramadan', label: 'Ramadan' },
        { id: 'laylat', label: 'Laylat al-Qadr' }
      ]
    }
  ],

  names_main: [
    { id: 'allah_names', label: "Allah's Names" },
    { id: 'scholars_names', label: 'Great Scholars' }
  ],

  // -- LIBRARY (categorized -- reference shelves) --
  library: [
    {
      id: 'dynasties', label: 'Dynasties',
      tabs: [
        { id: 'umayyads', label: 'Umayyads' }, { id: 'abbasids', label: 'Abbasids' }, { id: 'andalus', label: 'Andalus' }, { id: 'ottomans', label: 'Ottomans' },
        { id: 'mamluks', label: 'Mamluks' }, { id: 'seljuks', label: 'Seljuks' }, { id: 'fatimids', label: 'Fatimids' }, { id: 'ayyubids', label: 'Ayyubids' },
        { id: 'modernhist', label: 'Modern Hist.' }, { id: 'ancientprophets', label: 'Ancient' }
      ]
    },
    {
      id: 'cities', label: 'Cities & Lands',
      tabs: [
        { id: 'mecca', label: 'Mecca' }, { id: 'medina', label: 'Medina' }, { id: 'jerusalem', label: 'Jerusalem' }, { id: 'damascus', label: 'Damascus' },
        { id: 'baghdad', label: 'Baghdad' }, { id: 'cairo', label: 'Cairo' }, { id: 'cordoba', label: 'Cordoba' }, { id: 'istanbul', label: 'Istanbul' },
        { id: 'bukhara', label: 'Bukhara' }, { id: 'samarkand', label: 'Samarkand' }
      ]
    },
    {
      id: 'arts', label: 'Arts & Crafts',
      tabs: [
        { id: 'calligraphy', label: 'Calligraphy' }, { id: 'architecture', label: 'Architecture' }, { id: 'geometry', label: 'Geometry' }, { id: 'poetryart', label: 'Poetry' },
        { id: 'literature', label: 'Literature' }, { id: 'nasheeds', label: 'Nasheeds' }, { id: 'illumination', label: 'Illumination' }, { id: 'textiles', label: 'Textiles' },
        { id: 'ceramics', label: 'Ceramics' }, { id: 'woodwork', label: 'Woodwork' }
      ]
    },
    {
      id: 'arabic_lang', label: 'Arabic Language',
      tabs: [
        { id: 'arabicgrammar', label: 'Grammar' }, { id: 'vocab', label: 'Vocab' }, { id: 'rhetoric', label: 'Rhetoric' }, { id: 'morphology', label: 'Morphology' },
        { id: 'pronunciation', label: 'Tajweed' }, { id: 'poetry', label: 'Poetry' }, { id: 'proverbs', label: 'Proverbs' }, { id: 'etymology', label: 'Etymology' },
        { id: 'dialects', label: 'Dialects' }, { id: 'scripts', label: 'Scripts' }
      ]
    },
    {
      id: 'philosophy', label: 'Philosophy & Thought',
      tabs: [
        { id: 'epistemology', label: 'Epistemology' }, { id: 'ontology', label: 'Ontology' }, { id: 'logic', label: 'Logic' }, { id: 'kalam', label: 'Kalam' },
        { id: 'reason', label: 'Reason' }, { id: 'freewill', label: 'Free Will' }, { id: 'problemofevil', label: 'Prob of Evil' },
        { id: 'prophethood', label: 'Prophethood' }, { id: 'existence', label: 'Existence' }
      ]
    }
  ]
};

window.TAB_GROUPS = TAB_GROUPS;
