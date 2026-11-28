const TAB_GROUPS = {

  // ── HOME / DAILY CORE ──
  ibadah: [
    {
      id: 'core', icon: 'home', label: 'Core',
      tabs: [
        { id: 'today', icon: 'home', label: 'Today' },
        { id: 'timer', icon: 'clock', label: 'Prayer & Qibla' },
        { id: 'quests', icon: 'scroll', label: 'Quests' },
        { id: 'journeys', icon: 'map', label: 'Journeys' }
      ]
    }
  ],

  // ── WORSHIP & DAILY HABITS (Quran, Adhkar, Devotions, Giving & Wellness) ──
  worship: [
    {
      id: 'quran_adhkar', icon: 'beads', label: "Qur'an & Adhkar",
      tabs: [
        { id: 'quran', icon: 'book-open', label: 'Quran' },
        { id: 'memorization', icon: 'brain', label: 'Hifz & SRS' },
        { id: 'morning', icon: 'sunrise', label: 'Morning' },
        { id: 'evening', icon: 'sunset', label: 'Evening' },
        { id: 'dhikr', icon: 'beads', label: 'Tasbih & Dhikr' },
        { id: 'situational', icon: 'heart', label: 'Situational' },
        { id: 'duas', icon: 'hand-heart', label: 'Daily Duas' }
      ]
    },
    {
      id: 'devotions', icon: 'mosque', label: 'Devotions & Habits',
      tabs: [
        { id: 'fasting', icon: 'crescent', label: 'Fasting' },
        { id: 'charity', icon: 'hand-heart', label: 'Giving & Zakat' },
        { id: 'healthlog', icon: 'heartbeat', label: 'Health & Gratitude' },
        { id: 'wudu', icon: 'droplets', label: 'Ablution' },
        { id: 'jumuah', icon: 'mosque', label: "Jumu'ah" },
        { id: 'salah', icon: 'mosque', label: 'Prayer Guide' },
        { id: 'volprayers', icon: 'moon', label: 'Vol. Prayers' },
        { id: 'extradeeds', icon: 'star', label: 'Extra Deeds' }
      ]
    }
  ],

  // ── KNOWLEDGE (Core Islamic Sciences, Character, Seerah & Sacred Names) ──
  knowledge: [
    { id: 'quran_sunnah', icon: 'book-open', label: "Qur'an & Sunnah", tabs: [
      { id: 'tafsir', icon: 'scroll', label: 'Interpretation' },
      { id: 'hadith', icon: 'bookmarks', label: 'Hadith' },
      { id: 'sunnahs', icon: 'star', label: 'Prophetic Ways' } ] },
    { id: 'fiqh', icon: 'scales', label: 'Fiqh & Creed', grid: true, tabs: [
      { id: 'fiqh', icon: 'scales', label: 'Jurisprudence', desc: 'Core rulings on worship, transactions, and daily life', poolKey: 'FIQH_POOL' },
      { id: 'worship-rulings', icon: 'droplets', label: 'Worship Rulings', desc: 'Purification, prayer, fasting, and Hajj specifics', poolKeys: ['PURIFICATION','SALAHRULES','SAWMRULES','HAJJRULES','HAJJ_POOL'] },
      { id: 'wealth-oaths', icon: 'wallet', label: 'Wealth & Oaths', desc: 'Zakat, trade, inheritance, and vows', poolKeys: ['ZAKATRULES','TRADE','INHERITANCE','OATHS'] },
      { id: 'aqeedah', icon: 'mosque', label: 'Creed', desc: 'Foundations of Islamic belief (Aqeedah)' } ] },
    { id: 'faith_life', icon: 'heart', label: 'Heart & Community', grid: true, tabs: [
      { id: 'virtues', icon: 'sparkles', label: 'Virtues', desc: 'Sincerity, patience, trust, and hope in Allah', poolKeys: ['IKHLAS_POOL','TAWAKKUL_POOL','PATIENCE_POOL','HOPE','FEAR','LOVEOFALLAH','CONTENTMENT'] },
      { id: 'vices-return', icon: 'alert-triangle', label: 'Vices & Repentance', desc: 'Heart diseases, sins, and turning back to Allah', poolKeys: ['HEART_POOL','SINS_POOL','REPENTANCE_POOL'] },
      { id: 'character-path', icon: 'handshake', label: 'Character & Path', desc: 'Manners, zuhd, and spiritual purification', poolKeys: ['MANNERS_POOL','ZUHD_POOL','SUFISM','TAZKIYAH','INSPIRATIONS_POOL','REFLECTION'] },
      { id: 'family-life', icon: 'family', label: 'Family Life', desc: 'Marriage, parenting, and household bonds', poolKeys: ['FAMILY_POOL','MARRIAGE_POOL','PARENTING_POOL'] },
      { id: 'community', icon: 'users', label: 'Community', desc: 'Brotherhood, sisterhood, and social ties', poolKeys: ['NEIGHBORS_POOL','COMMUNITY_POOL','BROTHERHOOD','SISTERHOOD','UMMAH_POOL','ANTIRACISM'] },
      { id: 'service', icon: 'hand-heart', label: 'Service & Care', desc: 'Orphans, elderly, poverty, and volunteering', poolKeys: ['ORPHANS2','ELDERLY','DISABLED','POVERTY','VOLUNTEERING'] },
      { id: 'wellness', icon: 'heartbeat', label: 'Wellness', desc: 'Prophetic medicine, body and mental well-being', poolKeys: ['HEALTH_POOL','TIBB_POOL','MENTALHEALTH'] } ] },
    { id: 'history', icon: 'scroll', label: 'Seerah & Hereafter', grid: true, tabs: [
      { id: 'seerah', icon: 'scroll', label: 'Biography', desc: 'The life and mission of Prophet Muhammad' },
      { id: 'stories', icon: 'book-open', label: 'Stories', desc: 'Inspiring narratives from Islamic tradition', poolKey: 'STORIES' },
      { id: 'akhirah', icon: 'moon', label: 'Hereafter', desc: 'The unseen world and life after death' },
      { id: 'jannah', icon: 'sparkles', label: 'Paradise', desc: 'Descriptions of Jannah and its blessings' },
      { id: 'jahannam', icon: 'flame', label: 'Hellfire', desc: 'Warnings about Jahannam and accountability' },
      { id: 'grave', icon: 'coffin', label: 'The Grave', desc: 'Life in the barzakh between death and resurrection' },
      { id: 'signs', icon: 'clock', label: 'Signs of Qiyamah', desc: 'Major and minor signs before the Day of Judgment' } ] },
    { id: 'names', icon: 'sparkles', label: 'Names & Figures', grid: true, tabs: [
      { id: 'allah_names', icon: 'sparkles', label: "Allah's Names", desc: '99 Beautiful Names (Asma-ul-Husna)' },
      { id: 'prophets', icon: 'crescent', label: 'Prophets', desc: 'Messengers and prophets of Islam' },
      { id: 'sahaba', icon: 'users', label: 'Companions', desc: 'Stories of the Noble Sahabah' },
      { id: 'women', icon: 'family', label: 'Great Women', desc: 'Exemplary Muslim women in history' },
      { id: 'scholars_names', icon: 'book', label: 'Scholars', desc: 'Imams and classical scholars' } ] }
  ],

  // ── PROFILE ──
  profile_main: [
    { id: 'profile', icon: 'user', label: 'Profile' },
    { id: 'trophies', icon: 'trophy', label: 'Trophies' },
    { id: 'progress', icon: 'bar-chart-3', label: 'Progress' },
    { id: 'stats', icon: 'trending-up', label: 'Analytics' }
  ]
};

if (typeof window !== 'undefined') window.TAB_GROUPS = TAB_GROUPS;
