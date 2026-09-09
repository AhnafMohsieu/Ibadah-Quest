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
    { id: 'quran_sunnah', icon: 'book-open', label: "Qur'an & Sunnah", tabs: [
      { id: 'quran', icon: 'book-open', label: 'Quran' },
      { id: 'tafsir', icon: 'scroll', label: 'Interpretation' },
      { id: 'hadith', icon: 'bookmarks', label: 'Hadith' },
      { id: 'sunnahs', icon: 'star', label: 'Prophetic Ways' } ] },
    { id: 'fiqh', icon: 'scales', label: 'Fiqh & Rulings', tabs: [
      { id: 'fiqh', icon: 'scales', label: 'Jurisprudence' },
      { id: 'worship-rulings', icon: 'droplets', label: 'Worship Rulings' },
      { id: 'wealth-oaths', icon: 'wallet', label: 'Wealth & Oaths' } ] },
    { id: 'arabic', icon: 'pencil', label: 'Arabic', tabs: [
      { id: 'arabic', icon: 'pencil', label: 'Arabic' } ] },
    { id: 'heart', icon: 'heart', label: 'Heart & Soul', tabs: [
      { id: 'virtues', icon: 'sparkles', label: 'Virtues' },
      { id: 'vices-return', icon: 'alert-triangle', label: 'Vices & Repentance' },
      { id: 'character-path', icon: 'handshake', label: 'Character & Path' } ] },
    { id: 'society', icon: 'users', label: 'Dealings & Society', tabs: [
      { id: 'family-life', icon: 'family', label: 'Family Life' },
      { id: 'community', icon: 'users', label: 'Community' },
      { id: 'service', icon: 'hand-heart', label: 'Service & Care' },
      { id: 'work-justice', icon: 'briefcase', label: 'Work & Justice' } ] },
    { id: 'life', icon: 'leaf', label: 'Life & Modern', tabs: [
      { id: 'wellness', icon: 'heartbeat', label: 'Wellness' },
      { id: 'earth-living', icon: 'tree', label: 'Earth & Living' },
      { id: 'youth-tech', icon: 'zap', label: 'Youth & Tech' },
      { id: 'ethics-finance', icon: 'scales', label: 'Ethics & Finance' } ] },
    { id: 'history', icon: 'scroll', label: 'History & Seerah', tabs: [
      { id: 'seerah', icon: 'scroll', label: 'Biography' },
      { id: 'stories', icon: 'book-open', label: 'Stories' },
      { id: 'battles', icon: 'sword', label: 'Battles' },
      { id: 'science', icon: 'monitor', label: 'Science' },
      { id: 'modernhist', icon: 'trending-up', label: 'Modern Hist.' },
      { id: 'ancientprophets', icon: 'scroll', label: 'Ancient' } ] },
    { id: 'hereafter', icon: 'moon', label: 'Hereafter', tabs: [
      { id: 'akhirah', icon: 'moon', label: 'Hereafter' },
      { id: 'jannah', icon: 'sparkles', label: 'Paradise' },
      { id: 'jahannam', icon: 'flame', label: 'Hellfire' },
      { id: 'grave', icon: 'coffin', label: 'The Grave' },
      { id: 'signs', icon: 'clock', label: 'Signs of Qiyamah' },
      { id: 'dreams', icon: 'moon', label: 'Islamic Dreams' } ] }
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
    { id: 'dynasties', icon: 'landmark', label: 'Dynasties', tabs: [
      { id: 'umayyads', icon: 'crescent', label: 'Umayyads' },
      { id: 'abbasids', icon: 'book-open', label: 'Abbasids' },
      { id: 'andalus', icon: 'palette', label: 'Andalus' },
      { id: 'ottomans', icon: 'crown', label: 'Ottomans' },
      { id: 'mamluks', icon: 'shield', label: 'Mamluks' },
      { id: 'seljuks', icon: 'moon', label: 'Seljuks' },
      { id: 'fatimids', icon: 'star', label: 'Fatimids' },
      { id: 'ayyubids', icon: 'sword', label: 'Ayyubids' } ] },
    { id: 'cities', icon: 'building', label: 'Cities & Lands', tabs: [
      { id: 'holy-cities', icon: 'kaaba', label: 'Holy Cities' },
      { id: 'capitals', icon: 'building', label: 'Capitals' },
      { id: 'east', icon: 'globe', label: 'Lands of the East' } ] },
    { id: 'arts', icon: 'palette', label: 'Arts & Crafts', tabs: [
      { id: 'pattern', icon: 'pen-tool', label: 'Pattern & Illumination' },
      { id: 'sacred-space', icon: 'mosque', label: 'Sacred Space' },
      { id: 'living-crafts', icon: 'palette', label: 'Crafts & Nasheeds' },
      { id: 'word', icon: 'book-open', label: 'Literature' } ] },
    { id: 'arabic_lang', icon: 'pencil', label: 'Arabic Language', tabs: [
      { id: 'structure', icon: 'pencil', label: 'Structure' },
      { id: 'sound-script', icon: 'megaphone', label: 'Sound & Script' },
      { id: 'words-poetry', icon: 'book-open', label: 'Words & Poetry' } ] },
    { id: 'philosophy', icon: 'brain', label: 'Philosophy & Thought', tabs: [
      { id: 'being', icon: 'globe', label: 'Being' },
      { id: 'knowing', icon: 'brain', label: 'Reason & Knowing' },
      { id: 'will-evil', icon: 'shield', label: 'Will & Evil' } ] }
  ],
  names_main: [
    { id: 'names', icon: 'sparkles', label: 'Names', tabs: [
      { id: 'allah_names', icon: 'sparkles', label: "Allah's Names" },
      { id: 'prophets', icon: 'crescent', label: 'Prophets' },
      { id: 'sahaba', icon: 'users', label: 'Companions' },
      { id: 'women', icon: 'family', label: 'Great Women' },
      { id: 'scholars_names', icon: 'book', label: 'Scholars' } ] }
  ]
};

window.TAB_GROUPS = TAB_GROUPS;
