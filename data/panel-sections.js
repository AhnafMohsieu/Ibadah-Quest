(function() {
  // Single source of truth: which panels belong to which nav section.
  window.PANEL_SECTIONS = {
    home: ['panel-today', 'panel-timer', 'panel-quests', 'panel-journeys'],
    worship: [
      'panel-quran', 'panel-memorization', 'panel-morning', 'panel-evening',
      'panel-dhikr', 'panel-situational', 'panel-duas',
      'panel-fasting', 'panel-charity', 'panel-healthlog',
      'panel-wudu', 'panel-jumuah', 'panel-salah', 'panel-volprayers', 'panel-extradeeds'
    ],
    quests: ['panel-quests'],
    stats: ['panel-stats'],
    growth: ['panel-progress'],
    profile: ['panel-profile', 'panel-gallery', 'panel-trophies', 'panel-goals'],
    knowledge_quran: ['panel-tafsir', 'panel-hadith', 'panel-sunnahs'],
    knowledge_fiqh: ['panel-fiqh', 'panel-worship-rulings', 'panel-wealth-oaths', 'panel-aqeedah'],
    knowledge_heart: [
      'panel-virtues', 'panel-vices-return', 'panel-character-path',
      'panel-family-life', 'panel-community', 'panel-service', 'panel-wellness'
    ],
    knowledge_history: [
      'panel-seerah', 'panel-stories',
      'panel-akhirah', 'panel-jannah', 'panel-jahannam', 'panel-grave', 'panel-signs'
    ],
    names: ['panel-allah_names', 'panel-prophets', 'panel-sahaba', 'panel-women', 'panel-scholars_names']
  };
})();
