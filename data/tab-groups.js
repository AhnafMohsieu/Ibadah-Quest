const TAB_GROUPS = {

  // ── DAILY (flat — core habit loop, always visible) ──
  ibadah: [
    { id: 'today',      icon: '<i class="fa-solid fa-mosque"></i>', label: 'Today' },
    { id: 'timer',      icon: '<i class="fa-solid fa-stopwatch"></i>', label: 'Prayer Times' },
    { id: 'quests',     icon: '<i class="fa-solid fa-bullseye"></i>', label: 'Quests' },
    { id: 'journeys', icon: '<i class="fa-solid fa-seedling"></i>', label: 'Journeys' },
    { id: 'morning',    icon: '<i class="fa-solid fa-sun"></i>', label: 'Morning' },
    { id: 'evening',    icon: '<i class="fa-solid fa-moon"></i>', label: 'Evening' },
    { id: 'dhikr',      icon: '<i class="fa-solid fa-hands-praying"></i>', label: 'Remembrance' },
    { id: 'wudu',       icon: '<i class="fa-solid fa-droplet"></i>', label: 'Ablution' },
    { id: 'salah',      icon: '<i class="fa-solid fa-person-praying"></i>', label: 'Prayer Guide' },
    { id: 'fasting',    icon: '<i class="fa-solid fa-moon"></i>', label: 'Fasting' },
    { id: 'healthlog', icon: '<i class="fa-solid fa-heart-pulse"></i>', label: 'Health' },
    { id: 'finance',   icon: '<i class="fa-solid fa-coins"></i>', label: 'Finance' },
    { id: 'mood',      icon: '<i class="fa-solid fa-face-smile"></i>', label: 'Mood' }
  ],

  // ── KNOWLEDGE (categorized — religious learning) ──
  knowledge: [
    {
      id: 'quran_sunnah', icon: '<i class="fa-solid fa-book-open"></i>', label: "Qur'an & Sunnah",
      tabs: [
        { id: 'quran',       icon: '<i class="fa-solid fa-book-quran"></i>', label: 'Quran' },
        { id: 'tafsir',      icon: '<i class="fa-solid fa-book-open"></i>', label: 'Interpretation' },
        { id: 'hadith',      icon: '<i class="fa-solid fa-comment-dots"></i>', label: 'Hadith' },
        { id: 'sunnahs',     icon: '<i class="fa-solid fa-sun"></i>', label: 'Prophetic Ways' },
        { id: 'memorization', icon: '<i class="fa-solid fa-clipboard-check"></i>', label: 'Memorization' }
      ]
    },
    {
      id: 'fiqh', icon: '<i class="fa-solid fa-scale-balanced"></i>', label: 'Fiqh & Rulings',
      tabs: [
        { id: 'fiqh',        icon: '<i class="fa-solid fa-scale-balanced"></i>', label: 'Jurisprudence' },
        { id: 'purification', icon: '<i class="fa-solid fa-droplet"></i>', label: 'Purification' },
        { id: 'salahrules',  icon: '<i class="fa-solid fa-mosque"></i>', label: 'Salah' },
        { id: 'zakatrules',  icon: '<i class="fa-solid fa-coins"></i>', label: 'Zakat' },
        { id: 'sawmrules',   icon: '<i class="fa-solid fa-moon"></i>', label: 'Sawm' },
        { id: 'hajjrules',   icon: '<i class="fa-solid fa-mosque"></i>', label: 'Hajj' },
        { id: 'trade',       icon: '<i class="fa-solid fa-handshake"></i>', label: 'Trade' },
        { id: 'inheritance', icon: '<i class="fa-solid fa-scroll"></i>', label: 'Inheritance' },
        { id: 'oaths',       icon: '<i class="fa-solid fa-hand"></i>', label: 'Oaths' }
      ]
    },
    {
      id: 'creed', icon: '<i class="fa-solid fa-shield-halved"></i>', label: 'Creed & Arabic',
      tabs: [
        { id: 'aqeedah',     icon: '<i class="fa-solid fa-shield-halved"></i>', label: 'Creed' },
        { id: 'arabic',      icon: '<i class="fa-solid fa-font"></i>', label: 'Arabic' },
        { id: 'knowledge',   icon: '<i class="fa-solid fa-brain"></i>', label: 'Seeking Knowledge' }
      ]
    },
    {
      id: 'heart', icon: '<i class="fa-solid fa-heart"></i>', label: 'Heart & Soul',
      tabs: [
        { id: 'heart',       icon: '<i class="fa-solid fa-heart"></i>', label: 'Heart Diseases' },
        { id: 'ikhlas',      icon: '<i class="fa-solid fa-star"></i>', label: 'Sincerity' },
        { id: 'tawakkul',    icon: '<i class="fa-solid fa-leaf"></i>', label: 'Reliance' },
        { id: 'manners',     icon: '<i class="fa-solid fa-handshake"></i>', label: 'Manners' },
        { id: 'patience',    icon: '<i class="fa-solid fa-mountain"></i>', label: 'Patience & Gratitude' },
        { id: 'gratitude',   icon: '<i class="fa-solid fa-hands-holding"></i>', label: 'Gratitude' },
        { id: 'sins',        icon: '<i class="fa-solid fa-ban"></i>', label: 'Major Sins' },
        { id: 'repentance',  icon: '<i class="fa-solid fa-droplet"></i>', label: 'Repentance' },
        { id: 'zuhd',        icon: '<i class="fa-solid fa-wheat-awn"></i>', label: 'Asceticism' },
        { id: 'inspirations', icon: '<i class="fa-solid fa-comment"></i>', label: 'Inspirations' },
        { id: 'sufism',      icon: '<i class="fa-solid fa-heart"></i>', label: 'Sufism' },
        { id: 'tazkiyah',    icon: '<i class="fa-solid fa-star"></i>', label: 'Tazkiyah' },
        { id: 'fear',        icon: '<i class="fa-solid fa-triangle-exclamation"></i>', label: 'Fear of Allah' },
        { id: 'hope',        icon: '<i class="fa-solid fa-dove"></i>', label: 'Hope' },
        { id: 'loveofallah', icon: '<i class="fa-solid fa-heart"></i>', label: 'Love of Allah' },
        { id: 'contentment', icon: '<i class="fa-solid fa-face-smile"></i>', label: 'Contentment' },
        { id: 'reflection',  icon: '<i class="fa-solid fa-eye"></i>', label: 'Reflection' }
      ]
    },
    {
      id: 'society', icon: '<i class="fa-solid fa-globe"></i>', label: 'Dealings & Society',
      tabs: [
        { id: 'family',      icon: '<i class="fa-solid fa-people-roof"></i>', label: 'Family' },
        { id: 'marriage',    icon: '<i class="fa-solid fa-ring"></i>', label: 'Marriage' },
        { id: 'parenting',   icon: '<i class="fa-solid fa-baby"></i>', label: 'Parenting' },
        { id: 'charity',     icon: '<i class="fa-solid fa-hand-holding-heart"></i>', label: 'Charity' },
        { id: 'work',        icon: '<i class="fa-solid fa-briefcase"></i>', label: 'Career' },
        { id: 'neighbors',   icon: '<i class="fa-solid fa-house"></i>', label: 'Neighbors' },
        { id: 'community',   icon: '<i class="fa-solid fa-people-roof"></i>', label: 'Community' },
        { id: 'ummah',       icon: '<i class="fa-solid fa-globe"></i>', label: 'Global Nation' },
        { id: 'dawah',       icon: '<i class="fa-solid fa-bullhorn"></i>', label: 'Invitation' },
        { id: 'punishments', icon: '<i class="fa-solid fa-scale-balanced"></i>', label: 'Justice' },
        { id: 'brotherhood', icon: '<i class="fa-solid fa-handshake"></i>', label: 'Brotherhood' },
        { id: 'sisterhood',  icon: '<i class="fa-solid fa-venus"></i>', label: 'Sisterhood' },
        { id: 'orphans2',    icon: '<i class="fa-solid fa-face-smile"></i>', label: 'Orphans' },
        { id: 'elderly',     icon: '<i class="fa-solid fa-person-cane"></i>', label: 'Elderly' },
        { id: 'disabled',    icon: '<i class="fa-solid fa-wheelchair"></i>', label: 'Disabled' },
        { id: 'antiracism',  icon: '<i class="fa-solid fa-people-group"></i>', label: 'Anti-Racism' },
        { id: 'poverty',     icon: '<i class="fa-solid fa-bread-slice"></i>', label: 'Poverty' },
        { id: 'volunteering', icon: '<i class="fa-solid fa-hand"></i>', label: 'Volunteering' }
      ]
    },
    {
      id: 'life', icon: '<i class="fa-solid fa-seedling"></i>', label: 'Life & Modern',
      tabs: [
        { id: 'health',      icon: '<i class="fa-solid fa-apple-whole"></i>', label: 'Health' },
        { id: 'tibb',        icon: '<i class="fa-solid fa-leaf"></i>', label: 'Prophetic Medicine' },
        { id: 'food',        icon: '<i class="fa-solid fa-utensils"></i>', label: 'Halal Food' },
        { id: 'environment', icon: '<i class="fa-solid fa-leaf"></i>', label: 'Environment' },
        { id: 'travel',      icon: '<i class="fa-solid fa-plane"></i>', label: 'Travel' },
        { id: 'youth',       icon: '<i class="fa-solid fa-graduation-cap"></i>', label: 'Youth' },
        { id: 'tech',        icon: '<i class="fa-solid fa-mobile-screen"></i>', label: 'Tech & Islam' },
        { id: 'technology',  icon: '<i class="fa-solid fa-mobile-screen"></i>', label: 'Technology' },
        { id: 'socialmedia', icon: '<i class="fa-solid fa-hashtag"></i>', label: 'Social Media' },
        { id: 'ethics',      icon: '<i class="fa-solid fa-handshake"></i>', label: 'Ethics' },
        { id: 'bioethics',   icon: '<i class="fa-solid fa-dna"></i>', label: 'Bioethics' },
        { id: 'modfinance',  icon: '<i class="fa-solid fa-credit-card"></i>', label: 'Mod. Finance' },
        { id: 'politics',    icon: '<i class="fa-solid fa-landmark"></i>', label: 'Politics' },
        { id: 'green',       icon: '<i class="fa-solid fa-leaf"></i>', label: 'Green Islam' },
        { id: 'mentalhealth', icon: '<i class="fa-solid fa-brain"></i>', label: 'Mental Health' },
        { id: 'education',   icon: '<i class="fa-solid fa-book-open"></i>', label: 'Education' }
      ]
    },
    {
      id: 'history', icon: '<i class="fa-solid fa-scroll"></i>', label: 'History & Seerah',
      tabs: [
        { id: 'seerah',       icon: '<i class="fa-solid fa-horse"></i>', label: 'Biography' },
        { id: 'sahaba',       icon: '<i class="fa-solid fa-star"></i>', label: 'Companions' },
        { id: 'prophets',     icon: '<i class="fa-solid fa-scroll"></i>', label: 'Prophets' },
        { id: 'women',        icon: '<i class="fa-solid fa-person-dress"></i>', label: 'Great Women' },
        { id: 'stories',      icon: '<i class="fa-solid fa-book-open"></i>', label: 'Stories' },
        { id: 'battles',      icon: '<i class="fa-solid fa-shield-halved"></i>', label: 'Battles' },
        { id: 'civilisation', icon: '<i class="fa-solid fa-landmark"></i>', label: 'Civilization' },
        { id: 'science',      icon: '<i class="fa-solid fa-star"></i>', label: 'Science' }
      ]
    },
    {
      id: 'hereafter', icon: '<i class="fa-solid fa-star"></i>', label: 'Hereafter',
      tabs: [
        { id: 'akhirah',  icon: '<i class="fa-solid fa-star"></i>', label: 'Hereafter' },
        { id: 'jannah',   icon: '<i class="fa-solid fa-pagelines"></i>', label: 'Paradise' },
        { id: 'jahannam', icon: '<i class="fa-solid fa-fire"></i>', label: 'Hellfire' },
        { id: 'grave',    icon: '<i class="fa-solid fa-archway"></i>', label: 'The Grave' },
        { id: 'signs',    icon: '<i class="fa-solid fa-clock"></i>', label: 'Signs of Qiyamah' },
        { id: 'hajj',     icon: '<i class="fa-solid fa-mosque"></i>', label: 'Pilgrimage' },
        { id: 'dreams',   icon: '<i class="fa-solid fa-moon"></i>', label: 'Islamic Dreams' }
      ]
    }
  ],

  // ── LIBRARY (categorized — reference shelves) ──
  library: [
    {
      id: 'dynasties', icon: '<i class="fa-solid fa-landmark"></i>', label: 'Dynasties',
      tabs: [
        { id: 'umayyads', icon: '<i class="fa-solid fa-landmark"></i>', label: 'Umayyads' }, { id: 'abbasids', icon: '<i class="fa-solid fa-scroll"></i>', label: 'Abbasids' }, { id: 'andalus', icon: '<i class="fa-solid fa-landmark"></i>', label: 'Andalus' }, { id: 'ottomans', icon: '<i class="fa-solid fa-mosque"></i>', label: 'Ottomans' },
        { id: 'mamluks', icon: '<i class="fa-solid fa-shield-halved"></i>', label: 'Mamluks' }, { id: 'seljuks', icon: '<i class="fa-solid fa-horse"></i>', label: 'Seljuks' }, { id: 'fatimids', icon: '<i class="fa-solid fa-moon"></i>', label: 'Fatimids' }, { id: 'ayyubids', icon: '<i class="fa-solid fa-shield-halved"></i>', label: 'Ayyubids' },
        { id: 'modernhist', icon: '<i class="fa-solid fa-globe"></i>', label: 'Modern Hist.' }, { id: 'ancientprophets', icon: '<i class="fa-solid fa-hourglass"></i>', label: 'Ancient' }
      ]
    },
    {
      id: 'cities', icon: '<i class="fa-solid fa-map"></i>', label: 'Cities & Lands',
      tabs: [
        { id: 'mecca', icon: '<i class="fa-solid fa-mosque"></i>', label: 'Mecca' }, { id: 'medina', icon: '<i class="fa-solid fa-mosque"></i>', label: 'Medina' }, { id: 'jerusalem', icon: '<i class="fa-solid fa-mosque"></i>', label: 'Jerusalem' }, { id: 'damascus', icon: '<i class="fa-solid fa-landmark"></i>', label: 'Damascus' },
        { id: 'baghdad', icon: '<i class="fa-solid fa-scroll"></i>', label: 'Baghdad' }, { id: 'cairo', icon: '<i class="fa-solid fa-landmark"></i>', label: 'Cairo' }, { id: 'cordoba', icon: '<i class="fa-solid fa-landmark"></i>', label: 'Cordoba' }, { id: 'istanbul', icon: '<i class="fa-solid fa-mosque"></i>', label: 'Istanbul' },
        { id: 'bukhara', icon: '<i class="fa-solid fa-mosque"></i>', label: 'Bukhara' }, { id: 'samarkand', icon: '<i class="fa-solid fa-map"></i>', label: 'Samarkand' }
      ]
    },
    {
      id: 'arts', icon: '<i class="fa-solid fa-palette"></i>', label: 'Arts & Crafts',
      tabs: [
        { id: 'calligraphy', icon: '<i class="fa-solid fa-pen-nib"></i>', label: 'Calligraphy' }, { id: 'architecture', icon: '<i class="fa-solid fa-landmark"></i>', label: 'Architecture' }, { id: 'geometry', icon: '<i class="fa-solid fa-shapes"></i>', label: 'Geometry' }, { id: 'poetryart', icon: '<i class="fa-solid fa-feather"></i>', label: 'Poetry' },
        { id: 'literature', icon: '<i class="fa-solid fa-book-open"></i>', label: 'Literature' }, { id: 'nasheeds', icon: '<i class="fa-solid fa-music"></i>', label: 'Nasheeds' }, { id: 'illumination', icon: '<i class="fa-solid fa-star"></i>', label: 'Illumination' }, { id: 'textiles', icon: '<i class="fa-solid fa-shirt"></i>', label: 'Textiles' },
        { id: 'ceramics', icon: '<i class="fa-solid fa-jar"></i>', label: 'Ceramics' }, { id: 'woodwork', icon: '<i class="fa-solid fa-tree"></i>', label: 'Woodwork' }
      ]
    },
    {
      id: 'arabic_lang', icon: '<i class="fa-solid fa-font"></i>', label: 'Arabic Language',
      tabs: [
        { id: 'arabicgrammar', icon: '<i class="fa-solid fa-book-open"></i>', label: 'Grammar' }, { id: 'vocab', icon: '<i class="fa-solid fa-font"></i>', label: 'Vocab' }, { id: 'rhetoric', icon: '<i class="fa-solid fa-comment"></i>', label: 'Rhetoric' }, { id: 'morphology', icon: '<i class="fa-solid fa-puzzle-piece"></i>', label: 'Morphology' },
        { id: 'pronunciation', icon: '<i class="fa-solid fa-microphone"></i>', label: 'Tajweed' }, { id: 'poetry', icon: '<i class="fa-solid fa-feather"></i>', label: 'Poetry' }, { id: 'proverbs', icon: '<i class="fa-solid fa-lightbulb"></i>', label: 'Proverbs' }, { id: 'etymology', icon: '<i class="fa-solid fa-magnifying-glass"></i>', label: 'Etymology' },
        { id: 'dialects', icon: '<i class="fa-solid fa-globe"></i>', label: 'Dialects' }, { id: 'scripts', icon: '<i class="fa-solid fa-pen"></i>', label: 'Scripts' }
      ]
    },
    {
      id: 'philosophy', icon: '<i class="fa-solid fa-brain"></i>', label: 'Philosophy & Thought',
      tabs: [
        { id: 'epistemology', icon: '<i class="fa-solid fa-brain"></i>', label: 'Epistemology' }, { id: 'ontology', icon: '<i class="fa-solid fa-atom"></i>', label: 'Ontology' }, { id: 'logic', icon: '<i class="fa-solid fa-puzzle-piece"></i>', label: 'Logic' }, { id: 'kalam', icon: '<i class="fa-solid fa-comment"></i>', label: 'Kalam' },
        { id: 'reason', icon: '<i class="fa-solid fa-lightbulb"></i>', label: 'Reason' }, { id: 'freewill', icon: '<i class="fa-solid fa-scale-balanced"></i>', label: 'Free Will' }, { id: 'problemofevil', icon: '<i class="fa-solid fa-cloud"></i>', label: 'Prob of Evil' },
        { id: 'prophethood', icon: '<i class="fa-solid fa-scroll"></i>', label: 'Prophethood' }, { id: 'existence', icon: '<i class="fa-solid fa-star"></i>', label: 'Existence' }
      ]
    }
  ]
};
