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
    { id: 'fiqh', icon: 'scales', label: 'Fiqh & Rulings', grid: true, tabs: [
      { id: 'fiqh', icon: 'scales', label: 'Jurisprudence', desc: 'Core rulings on worship, transactions, and daily life', poolKey: 'FIQH_POOL' },
      { id: 'worship-rulings', icon: 'droplets', label: 'Worship Rulings', desc: 'Purification, prayer, fasting, and Hajj specifics', poolKeys: ['PURIFICATION','SALAHRULES','SAWMRULES','HAJJRULES','HAJJ_POOL'] },
      { id: 'wealth-oaths', icon: 'wallet', label: 'Wealth & Oaths', desc: 'Zakat, trade, inheritance, and vows', poolKeys: ['ZAKATRULES','TRADE','INHERITANCE','OATHS'] } ] },
    { id: 'faith_life', icon: 'heart', label: 'Faith & Life', grid: true, tabs: [
      { id: 'virtues', icon: 'sparkles', label: 'Virtues', desc: 'Sincerity, patience, trust, and hope in Allah', poolKeys: ['IKHLAS_POOL','TAWAKKUL_POOL','PATIENCE_POOL','HOPE','FEAR','LOVEOFALLAH','CONTENTMENT'] },
      { id: 'vices-return', icon: 'alert-triangle', label: 'Vices & Repentance', desc: 'Heart diseases, sins, and turning back to Allah', poolKeys: ['HEART_POOL','SINS_POOL','REPENTANCE_POOL'] },
      { id: 'character-path', icon: 'handshake', label: 'Character & Path', desc: 'Manners, sufism, and spiritual purification', poolKeys: ['MANNERS_POOL','ZUHD_POOL','SUFISM','TAZKIYAH','INSPIRATIONS_POOL','REFLECTION'] },
      { id: 'family-life', icon: 'family', label: 'Family Life', desc: 'Marriage, parenting, and household bonds', poolKeys: ['FAMILY_POOL','MARRIAGE_POOL','PARENTING_POOL'] },
      { id: 'community', icon: 'users', label: 'Community', desc: 'Brotherhood, sisterhood, and social ties', poolKeys: ['NEIGHBORS_POOL','COMMUNITY_POOL','BROTHERHOOD','SISTERHOOD','UMMAH_POOL','ANTIRACISM'] },
      { id: 'service', icon: 'hand-heart', label: 'Service & Care', desc: 'Orphans, elderly, poverty, and volunteering', poolKeys: ['ORPHANS2','ELDERLY','DISABLED','POVERTY','VOLUNTEERING','DAWAH_POOL'] },
      { id: 'work-justice', icon: 'briefcase', label: 'Work & Justice', desc: 'Career ethics, fairness, and accountability', poolKeys: ['WORK_POOL','PUNISHMENTS_POOL'] },
      { id: 'wellness', icon: 'heartbeat', label: 'Wellness', desc: 'Health, medicine, and mental well-being', poolKeys: ['HEALTH_POOL','TIBB_POOL','MENTALHEALTH'] },
      { id: 'earth-living', icon: 'tree', label: 'Earth & Living', desc: 'Food, nature, travel, and green living', poolKeys: ['FOOD_POOL','ENVIRONMENT_POOL','GREEN','TRAVEL_POOL'] },
      { id: 'youth-tech', icon: 'zap', label: 'Youth & Tech', desc: 'Education, social media, and digital life', poolKeys: ['YOUTH_POOL','TECH_POOL','TECHNOLOGY','SOCIALMEDIA','EDUCATION'] },
      { id: 'ethics-finance', icon: 'scales', label: 'Ethics & Finance', desc: 'Modern finance, bioethics, and politics', poolKeys: ['ETHICS','BIOETHICS','MODFINANCE','POLITICS'] } ] },
    { id: 'history', icon: 'scroll', label: 'History & Seerah', grid: true, tabs: [
      { id: 'seerah', icon: 'scroll', label: 'Biography', desc: 'The life and mission of Prophet Muhammad' },
      { id: 'stories', icon: 'book-open', label: 'Stories', desc: 'Inspiring narratives from Islamic tradition', poolKey: 'STORIES' },
      { id: 'battles', icon: 'sword', label: 'Battles', desc: 'Key military campaigns and their lessons' },
      { id: 'science', icon: 'monitor', label: 'Science', desc: 'Scientific discoveries in Islamic civilisation' },
      { id: 'modernhist', icon: 'trending-up', label: 'Modern Hist.', desc: 'Recent Islamic history and movements' },
      { id: 'ancientprophets', icon: 'scroll', label: 'Ancient', desc: 'Stories of earlier prophets and nations' } ] },
    { id: 'hereafter', icon: 'moon', label: 'Hereafter', grid: true, tabs: [
      { id: 'akhirah', icon: 'moon', label: 'Hereafter', desc: 'The unseen world and life after death' },
      { id: 'jannah', icon: 'sparkles', label: 'Paradise', desc: 'Descriptions of Jannah and its blessings' },
      { id: 'jahannam', icon: 'flame', label: 'Hellfire', desc: 'Warnings about Jahannam and its horrors' },
      { id: 'grave', icon: 'coffin', label: 'The Grave', desc: 'Life in the barzakh between death and resurrection' },
      { id: 'signs', icon: 'clock', label: 'Signs of Qiyamah', desc: 'Major and minor signs before the Day of Judgment' },
      { id: 'dreams', icon: 'moon', label: 'Islamic Dreams', desc: 'Prophetic dream interpretation and vision' } ] }
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
    { id: 'dynasties', icon: 'landmark', label: 'Dynasties', grid: true, tabs: [
      { id: 'umayyads', icon: 'crescent', label: 'Umayyads' },
      { id: 'abbasids', icon: 'book-open', label: 'Abbasids' },
      { id: 'andalus', icon: 'palette', label: 'Andalus' },
      { id: 'ottomans', icon: 'crown', label: 'Ottomans' },
      { id: 'mamluks', icon: 'shield', label: 'Mamluks' },
      { id: 'seljuks', icon: 'moon', label: 'Seljuks' },
      { id: 'fatimids', icon: 'star', label: 'Fatimids' },
      { id: 'ayyubids', icon: 'sword', label: 'Ayyubids' } ] },
    { id: 'cities', icon: 'building', label: 'Cities & Lands', grid: true, tabs: [
      { id: 'holy-cities', icon: 'kaaba', label: 'Holy Cities' },
      { id: 'capitals', icon: 'building', label: 'Capitals' },
      { id: 'east', icon: 'globe', label: 'Lands of the East' } ] },
    { id: 'arts', icon: 'palette', label: 'Arts & Crafts', grid: true, tabs: [
      { id: 'pattern', icon: 'pen-tool', label: 'Pattern & Illumination' },
      { id: 'sacred-space', icon: 'mosque', label: 'Sacred Space' },
      { id: 'living-crafts', icon: 'palette', label: 'Crafts & Nasheeds' },
      { id: 'word', icon: 'book-open', label: 'Literature' } ] },
    { id: 'arabic_lang', icon: 'pencil', label: 'Arabic Language', grid: true, tabs: [
      { id: 'arabic', icon: 'pencil', label: 'Arabic' },
      { id: 'structure', icon: 'pencil', label: 'Structure' },
      { id: 'sound-script', icon: 'megaphone', label: 'Sound & Script' },
      { id: 'words-poetry', icon: 'book-open', label: 'Words & Poetry' } ] }
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
