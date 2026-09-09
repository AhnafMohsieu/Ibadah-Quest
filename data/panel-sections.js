(function() {
  // Single source of truth: which panels belong to which nav section.
  // Consumed by render/tabs.js getSectionPanels() and activateTab().
  window.PANEL_SECTIONS = {
    home: ['panel-today','panel-timer','panel-journeys','panel-morning','panel-evening','panel-dhikr','panel-duas','panel-quran','panel-wudu','panel-jumuah','panel-salah','panel-fasting','panel-healthlog','panel-finance','panel-situational','panel-tafsir','panel-sunnahs','panel-extradeeds','panel-volprayers','panel-zakatcalc','panel-memorization','panel-gratitude','panel-charity'],
    quests: ['panel-quests'],
    stats: ['panel-stats'],
    growth: ['panel-progress','panel-growth'],
    profile: ['panel-profile','panel-trophies','panel-rewards','panel-goals','panel-allah_names','panel-prophets','panel-scholars_names','panel-sahaba','panel-women'],
    knowledge_quran: ['panel-quran','panel-hadith','panel-tafsir','panel-seerah'],
    knowledge_fiqh: ['panel-fiqh','panel-worship-rulings','panel-wealth-oaths'],
    knowledge_creed: ['panel-aqeedah','panel-arabic'],
    knowledge_heart: ['panel-virtues','panel-vices-return','panel-character-path'],
    knowledge_society: ['panel-family-life','panel-community','panel-service','panel-work-justice'],
    knowledge_life: ['panel-wellness','panel-earth-living','panel-youth-tech','panel-ethics-finance'],
    knowledge_history: ['panel-seerah','panel-stories','panel-civilisation','panel-science','panel-battles','panel-modernhist','panel-ancientprophets'],
    knowledge_hereafter: ['panel-akhirah','panel-jannah','panel-jahannam','panel-grave','panel-signs','panel-dreams'],
    library_dynasties: ['panel-umayyads','panel-abbasids','panel-andalus','panel-ottomans','panel-mamluks','panel-seljuks','panel-fatimids','panel-ayyubids','panel-battles','panel-civilisation'],
    library_cities: ['panel-holy-cities','panel-capitals','panel-east'],
    library_arts: ['panel-pattern','panel-sacred-space','panel-living-crafts','panel-word'],
    library_arabic: ['panel-structure','panel-sound-script','panel-words-poetry'],
    library_philosophy: ['panel-being','panel-knowing','panel-will-evil'],
    names: ['panel-allah_names','panel-prophets','panel-sahaba','panel-women','panel-scholars_names']
  };
})();
