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
    knowledge_fiqh: ['panel-fiqh','panel-purification','panel-salahrules','panel-zakatrules','panel-sawmrules','panel-hajjrules','panel-trade','panel-inheritance','panel-oaths'],
    knowledge_creed: ['panel-aqeedah','panel-arabic'],
    knowledge_heart: ['panel-aqeedah','panel-heart','panel-ikhlas','panel-tawakkul','panel-manners','panel-patience','panel-sins','panel-repentance','panel-zuhd','panel-inspirations','panel-stories','panel-sufism','panel-tazkiyah','panel-fear','panel-hope','panel-loveofallah','panel-contentment','panel-reflection','panel-dreams'],
    knowledge_society: ['panel-family','panel-marriage','panel-parenting','panel-work','panel-neighbors','panel-community','panel-ummah','panel-dawah','panel-punishments','panel-brotherhood','panel-sisterhood','panel-orphans2','panel-elderly','panel-disabled','panel-antiracism','panel-poverty','panel-volunteering'],
    knowledge_life: ['panel-health','panel-tibb','panel-food','panel-environment','panel-travel','panel-youth','panel-tech','panel-technology','panel-socialmedia','panel-ethics','panel-bioethics','panel-modfinance','panel-politics','panel-green','panel-mentalhealth','panel-education','panel-science'],
    knowledge_history: ['panel-seerah','panel-sahaba','panel-prophets','panel-women','panel-stories','panel-civilisation','panel-science','panel-battles'],
    knowledge_hereafter: ['panel-akhirah','panel-jannah','panel-jahannam','panel-grave','panel-signs'],
    library_dynasties: ['panel-umayyads','panel-abbasids','panel-andalus','panel-ottomans','panel-mamluks','panel-seljuks','panel-fatimids','panel-ayyubids','panel-modernhist','panel-ancientprophets','panel-battles','panel-civilisation'],
    library_cities: ['panel-mecca','panel-medina','panel-jerusalem','panel-damascus','panel-baghdad','panel-cairo','panel-cordoba','panel-istanbul','panel-bukhara','panel-samarkand'],
    library_arts: ['panel-calligraphy','panel-architecture','panel-geometry','panel-poetryart','panel-literature','panel-nasheeds','panel-illumination','panel-textiles','panel-ceramics','panel-woodwork'],
    library_arabic: ['panel-arabic','panel-arabicgrammar','panel-vocab','panel-rhetoric','panel-morphology','panel-pronunciation','panel-poetry','panel-proverbs','panel-etymology','panel-dialects','panel-scripts'],
    library_philosophy: ['panel-epistemology','panel-ontology','panel-logic','panel-kalam','panel-reason','panel-freewill','panel-problemofevil','panel-prophethood','panel-existence']
  };
})();
