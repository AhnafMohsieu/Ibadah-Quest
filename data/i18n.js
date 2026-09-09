// data/i18n.js
// UI-chrome translation layer. Languages: 'en' (default), 'ar' (romanized Arabic), 'bn' (Bengali).
// Content pools remain English; this translates navigation chrome and settings.

const LANG_KEY = 'iq_lang';

const I18N = {
  dict: {
    // t1 nav buttons
    'Daily': { ar: 'Yawmiyya', bn: 'দৈনিক' },
    'Knowledge': { ar: 'Ilm', bn: 'জ্ঞান' },
    'Names': { ar: 'Asmaa', bn: 'নাম' },
    'Library': { ar: 'Maktaba', bn: 'লাইব্রেরি' },
    'Profile': { ar: 'Malaf', bn: 'প্রোফাইল' },

    // ibadah tabs
    'Today': { ar: "al-Yawm", bn: 'আজ' },
    'Prayer Times': { ar: 'Awqat al-Salah', bn: 'নামাজের সময়' },
    'Quests': { ar: 'Mahammat', bn: 'কুয়েস্ট' },
    'Journeys': { ar: 'Rihlat', bn: 'ভ্রমণপথ' },
    'Morning': { ar: 'Sabah', bn: 'সকাল' },
    'Evening': { ar: "Masa'", bn: 'সন্ধ্যা' },
    'Remembrance': { ar: 'Dhikr', bn: 'যিকর' },
    'Ablution': { ar: 'Wudu', bn: 'অজু' },
    'Prayer Guide': { ar: 'Dalil al-Salah', bn: 'নামাজ গাইড' },
    'Fasting': { ar: 'Siyam', bn: 'রোজা' },
    'Health': { ar: 'Sihha', bn: 'স্বাস্থ্য' },
    'Mood': { ar: 'Mizaj', bn: 'মেজাজ' },

    // knowledge categories
    "Qur'an & Sunnah": { ar: "al-Qur'an wa al-Sunnah", bn: 'কুরআন ও সুন্নাহ' },
    'Fiqh & Rulings': { ar: 'al-Fiqh wa al-Ahkam', bn: 'ফিকহ ও বিধান' },
    'Arabic': { ar: "al-Arabiyya", bn: 'আরবি' },
    'Heart & Soul': { ar: 'al-Qalb wa al-Ruh', bn: 'হৃদয় ও আত্মা' },
    'Dealings & Society': { ar: 'al-Muamalat wa al-Mujtama', bn: 'লেনদেন ও সমাজ' },
    'Life & Modern': { ar: 'al-Hayat wa al-Hadatha', bn: 'জীবন ও আধুনিক' },
    'History & Seerah': { ar: 'al-Tarikh wa al-Seerah', bn: 'ইতিহাস ও সীরাত' },
    'Hereafter': { ar: 'al-Akhirah', bn: 'আখিরাত' },

    // quran & sunnah
    'Quran': { ar: 'al-Quran', bn: 'কুরআন' },
    'Interpretation': { ar: 'al-Tafsir', bn: 'তাফসির' },
    'Hadith': { ar: 'al-Hadith', bn: 'হাদিস' },
    'Prophetic Ways': { ar: 'al-Sunan', bn: 'সুন্নাহ' },
    'Memorization': { ar: 'al-Hifz', bn: 'হিফজ' },

    // fiqh
    'Jurisprudence': { ar: 'al-Fiqh', bn: 'ফিকহ' },
    'Purification': { ar: 'al-Tahara', bn: 'পবিত্রতা' },
    'Salah': { ar: 'al-Salah', bn: 'সালাত' },
    'Zakat': { ar: 'al-Zakat', bn: 'যাকাত' },
    'Sawm': { ar: 'al-Sawm', bn: 'সাওম' },
    'Hajj': { ar: 'al-Hajj', bn: 'হজ্জ' },
    'Trade': { ar: 'al-Tijara', bn: 'বাণিজ্য' },
    'Inheritance': { ar: 'al-Mirath', bn: 'উত্তরাধিকার' },
    'Oaths': { ar: 'al-Ayman', bn: 'শপথ' },
    'Worship Rulings': { ar: 'Ahkam al-Ibadat', bn: 'ইবাদতের বিধান' },
    'Wealth & Oaths': { ar: 'al-Amwal wa al-Ayman', bn: 'সম্পদ ও শপথ' },

    // heart
    'Heart Diseases': { ar: 'Amrad al-Qulub', bn: 'হৃদয়ের রোগ' },
    'Sincerity': { ar: 'al-Ikhlas', bn: 'ইখলাস' },
    'Reliance': { ar: 'al-Tawakkul', bn: 'তাওয়াক্কুল' },
    'Manners': { ar: 'al-Adab', bn: 'আদব' },
    'Patience & Gratitude': { ar: 'al-Sabr wa al-Shukr', bn: 'ধৈর্য ও কৃতজ্ঞতা' },
    'Gratitude': { ar: 'al-Shukr', bn: 'কৃতজ্ঞতা' },
    'Major Sins': { ar: 'al-Kabair', bn: 'কবিরা গুনাহ' },
    'Repentance': { ar: 'al-Tawba', bn: 'তাওবা' },
    'Asceticism': { ar: 'al-Zuhd', bn: 'যুহদ' },
    'Inspirations': { ar: 'al-Mawaiz', bn: 'উপদেশ' },
    'Sufism': { ar: 'al-Tasawwuf', bn: 'তাসাউফ' },
    'Tazkiyah': { ar: 'al-Tazkiyah', bn: 'তাজকিয়া' },
    'Fear of Allah': { ar: 'Khawf Allah', bn: 'আল্লাহর ভয়' },
    'Hope': { ar: 'al-Raja', bn: 'আশা' },
    'Love of Allah': { ar: 'Hubb Allah', bn: 'আল্লাহর ভালোবাসা' },
    'Contentment': { ar: 'al-Rida', bn: 'সন্তুষ্টি' },
    'Reflection': { ar: 'al-Tafakkur', bn: 'চিন্তা' },
    'Virtues': { ar: 'al-Fadail', bn: 'সদগুণ' },
    'Vices & Repentance': { ar: 'al-Radhail wa al-Tawba', bn: 'কুঅভ্যাস ও তওবা' },
    'Character & Path': { ar: 'al-Akhlaq wa al-Tariq', bn: 'চরিত্র ও পথ' },

    // society
    'Family': { ar: 'al-Usra', bn: 'পরিবার' },
    'Marriage': { ar: 'al-Zawaj', bn: 'বিবাহ' },
    'Parenting': { ar: 'Tarbiyat al-Awlad', bn: 'সন্তান লালন' },
    'Charity': { ar: 'al-Sadaqa', bn: 'সদকা' },
    'Career': { ar: 'al-Mihna', bn: 'কর্মজীবন' },
    'Neighbors': { ar: 'al-Jiran', bn: 'প্রতিবেশী' },
    'Community': { ar: 'al-Mujtama', bn: 'সমাজ' },
    'Global Nation': { ar: 'al-Ummah', bn: 'উম্মাহ' },
    'Invitation': { ar: 'al-Dawa', bn: 'দাওয়াত' },
    'Justice': { ar: 'al-Adl', bn: 'ন্যায়বিচার' },
    'Brotherhood': { ar: 'al-Ukhuwwa', bn: 'ভ্রাতৃত্ব' },
    'Sisterhood': { ar: 'al-Ukhuwwa al-Islamiyya', bn: 'ভগিনীত্ব' },
    'Orphans': { ar: 'al-Aytam', bn: 'এতিম' },
    'Elderly': { ar: 'Kibar al-Sinn', bn: 'বয়স্ক' },
    'Disabled': { ar: 'Dhu al-Ihtiyajat', bn: 'প্রতিবন্ধী' },
    'Anti-Racism': { ar: 'Mukafahat al-Unsuriyya', bn: 'বর্ণবাদ-বিরোধী' },
    'Poverty': { ar: 'al-Faqr', bn: 'দারিদ্র্য' },
    'Volunteering': { ar: 'al-Tatawwu', bn: 'স্বেচ্ছাসেবা' },
    'Family Life': { ar: 'al-Hayat al-Usariyya', bn: 'পারিবারিক জীবন' },
    'Service & Care': { ar: 'al-Khidma wa al-Riaya', bn: 'সেবা ও যত্ন' },
    'Work & Justice': { ar: 'al-Amal wa al-Adl', bn: 'কর্ম ও ন্যায়বিচার' },

    // life
    'Prophetic Medicine': { ar: 'al-Tibb al-Nabawi', bn: 'নববী চিকিৎসা' },
    'Halal Food': { ar: 'al-Taam al-Halal', bn: 'হালাল খাবার' },
    'Environment': { ar: 'al-Bia', bn: 'পরিবেশ' },
    'Travel': { ar: 'al-Safar', bn: 'ভ্রমণ' },
    'Youth': { ar: 'al-Shabab', bn: 'যুবসমাজ' },
    'Tech & Islam': { ar: 'al-Taqniya wa al-Islam', bn: 'প্রযুক্তি ও ইসলাম' },
    'Technology': { ar: 'al-Taqniya', bn: 'প্রযুক্তি' },
    'Social Media': { ar: 'Wasaail al-Tawasul', bn: 'সোশ্যাল মিডিয়া' },
    'Ethics': { ar: 'al-Akhlaq', bn: 'নৈতিকতা' },
    'Bioethics': { ar: 'Akhlaqiyyat al-Hayat', bn: 'জৈব নীতিশাস্ত্র' },
    'Mod. Finance': { ar: 'al-Tamwil al-Hadith', bn: 'আধুনিক অর্থায়ন' },
    'Politics': { ar: 'al-Siyasa', bn: 'রাজনীতি' },
    'Green Islam': { ar: 'al-Islam al-Akhdar', bn: 'সবুজ ইসলাম' },
    'Mental Health': { ar: 'al-Sihha al-Nafsiyya', bn: 'মানসিক স্বাস্থ্য' },
    'Education': { ar: 'al-Talim', bn: 'শিক্ষা' },
    'Wellness': { ar: 'al-Afiya', bn: 'সুস্থতা' },
    'Earth & Living': { ar: 'al-Ard wa al-Maisha', bn: 'পৃথিবী ও জীবিকা' },
    'Youth & Tech': { ar: 'al-Shabab wa al-Tiqniyya', bn: 'যুব ও প্রযুক্তি' },
    'Ethics & Finance': { ar: 'al-Akhlaq wa al-Mal', bn: 'নৈতিকতা ও অর্থ' },

    // history
    'Biography': { ar: 'al-Seerah', bn: 'সীরাত' },
    'Companions': { ar: 'al-Sahaba', bn: 'সাহাবা' },
    'Prophets': { ar: 'al-Anbiya', bn: 'নবীগণ' },
    'Great Women': { ar: 'al-Nisa al-Khayrat', bn: 'মহীয়সী নারী' },
    'Stories': { ar: 'al-Qisas', bn: 'গল্প' },
    'Battles': { ar: 'al-Ghazawat', bn: 'যুদ্ধ' },
    'Science': { ar: 'al-Ulum', bn: 'বিজ্ঞান' },

    // hereafter
    'Paradise': { ar: 'al-Jannah', bn: 'জান্নাত' },
    'Hellfire': { ar: 'Jahannam', bn: 'জাহান্নাম' },
    'The Grave': { ar: 'al-Qabr', bn: 'কবর' },
    'Signs of Qiyamah': { ar: 'Ashrat al-Saa', bn: 'কিয়ামতের নিদর্শন' },
    'Pilgrimage': { ar: 'al-Hajj', bn: 'হজ্জ' },
    'Islamic Dreams': { ar: 'al-Ruya al-Islamiyya', bn: 'ইসলামি স্বপ্ন' },

    // library categories
    'Dynasties': { ar: 'al-Duwal', bn: 'রাজবংশ' },
    'Cities & Lands': { ar: 'al-Mudun wa al-Buldan', bn: 'নগর ও দেশ' },
    'Arts & Crafts': { ar: 'al-Funun wa al-Hiraf', bn: 'শিল্প ও কারুশিল্প' },
    'Arabic Language': { ar: 'al-Lugha al-Arabiyya', bn: 'আরবি ভাষা' },
    'Philosophy & Thought': { ar: 'al-Falsafa wa al-Fikr', bn: 'দর্শন ও চিন্তা' },

    // dynasties
    'Umayyads': { ar: 'al-Umawiyyun', bn: 'উমাইয়া' },
    'Abbasids': { ar: 'al-Abbasiyyun', bn: 'আব্বাসীয়' },
    'Andalus': { ar: 'al-Andalus', bn: 'আন্দালুস' },
    'Ottomans': { ar: 'al-Uthmaniyyun', bn: 'উসমানীয়' },
    'Mamluks': { ar: 'al-Mamalik', bn: 'মামলুক' },
    'Seljuks': { ar: 'al-Salajiqa', bn: 'সেলজুক' },
    'Fatimids': { ar: 'al-Fatimiyyun', bn: 'ফাতিমীয়' },
    'Ayyubids': { ar: 'al-Ayyubiyyun', bn: 'আইয়ুবীয়' },
    'Modern Hist.': { ar: 'al-Tarikh al-Hadith', bn: 'আধুনিক ইতিহাস' },
    'Ancient': { ar: 'al-Qadim', bn: 'প্রাচীন' },

    // cities
    'Mecca': { ar: 'Makka', bn: 'মক্কা' },
    'Medina': { ar: 'al-Madina', bn: 'মদিনা' },
    'Jerusalem': { ar: 'al-Quds', bn: 'জেরুজালেম' },
    'Damascus': { ar: 'Dimashq', bn: 'দামেস্ক' },
    'Baghdad': { ar: 'Baghdad', bn: 'বাগদাদ' },
    'Cairo': { ar: 'al-Qahira', bn: 'কায়রো' },
    'Cordoba': { ar: 'Qurtuba', bn: 'কর্দোবা' },
    'Istanbul': { ar: 'Istanbul', bn: 'ইস্তাম্বুল' },
    'Bukhara': { ar: 'Bukhara', bn: 'বুখারা' },
    'Samarkand': { ar: 'Samarqand', bn: 'সমরকন্দ' },
    'Holy Cities': { ar: 'al-Mudun al-Muqaddasa', bn: 'পবিত্র শহর' },
    'Capitals': { ar: 'al-Awasim', bn: 'রাজধানী' },
    'Lands of the East': { ar: 'Bilad al-Mashriq', bn: 'প্রাচ্যের দেশ' },

    // arts
    'Calligraphy': { ar: 'al-Khatt', bn: 'চারুকলা' },
    'Architecture': { ar: 'al-Imara', bn: 'স্থাপত্য' },
    'Geometry': { ar: 'al-Handasa', bn: 'জ্যামিতি' },
    'Poetry': { ar: 'al-Shir', bn: 'কবিতা' },
    'Literature': { ar: 'al-Adab', bn: 'সাহিত্য' },
    'Nasheeds': { ar: 'al-Anashid', bn: 'নাশিদ' },
    'Illumination': { ar: 'al-Tadhhib', bn: 'আলোকচিত্র' },
    'Textiles': { ar: 'al-Mansujat', bn: 'বস্ত্র' },
    'Ceramics': { ar: 'al-Khazaf', bn: 'মৃৎশিল্প' },
    'Woodwork': { ar: 'al-Amal al-Khashabiyya', bn: 'কাঠশিল্প' },
    'Pattern & Illumination': { ar: 'al-Zakharfa wa al-Tadhhib', bn: 'নকশা ও অলংকরণ' },
    'Sacred Space': { ar: 'al-Makan al-Muqaddas', bn: 'পবিত্র স্থান' },
    'Crafts & Nasheeds': { ar: 'al-Hiraf wa al-Anashid', bn: 'হস্তশিল্প ও নাশিদ' },

    // arabic language
    'Grammar': { ar: 'al-Nahw', bn: 'ব্যাকরণ' },
    'Vocab': { ar: 'al-Mufradat', bn: 'শব্দভাণ্ডার' },
    'Rhetoric': { ar: 'al-Balagha', bn: 'অলংকারশাস্ত্র' },
    'Morphology': { ar: 'al-Sarf', bn: 'রূপতত্ত্ব' },
    'Tajweed': { ar: 'al-Tajwid', bn: 'তাজবীদ' },
    'Proverbs': { ar: 'al-Amthal', bn: 'প্রবাদ' },
    'Etymology': { ar: 'al-Ishtiqaq', bn: 'ব্যুৎপত্তি' },
    'Dialects': { ar: 'al-Lahajat', bn: 'উপভাষা' },
    'Scripts': { ar: 'al-Khutut', bn: 'লিপি' },
    'Structure': { ar: 'Binyat al-Lugha', bn: 'ভাষার গঠন' },
    'Sound & Script': { ar: 'al-Sawt wa al-Khatt', bn: 'ধ্বনি ও লিপি' },
    'Words & Poetry': { ar: 'al-Kalimat wa al-Shir', bn: 'শব্দ ও কবিতা' },

    // philosophy
    'Epistemology': { ar: 'Nazariyyat al-Maarifa', bn: 'জ্ঞানতত্ত্ব' },
    'Ontology': { ar: 'al-Wujudiyya', bn: 'অস্তিত্বতত্ত্ব' },
    'Logic': { ar: 'al-Mantiq', bn: 'যুক্তি' },
    'Kalam': { ar: 'Ilm al-Kalam', bn: 'কালাম' },
    'Reason': { ar: 'al-Aql', bn: 'বুদ্ধি' },
    'Free Will': { ar: 'al-Irada al-Hurra', bn: 'স্বাধীন ইচ্ছা' },
    'Prob of Evil': { ar: 'Mushkilat al-Sharr', bn: 'মন্দের সমস্যা' },
    'Prophethood': { ar: 'al-Nubuwwa', bn: 'নবুয়ত' },
    'Existence': { ar: 'al-Wujud', bn: 'অস্তিত্ব' },
    'Being': { ar: 'al-Wujud', bn: 'অস্তিত্ব' },
    'Reason & Knowing': { ar: 'al-Aql wa al-Marifa', bn: 'যুক্তি ও জ্ঞান' },
    'Will & Evil': { ar: 'al-Irada wa al-Sharr', bn: 'ইচ্ছা ও মন্দ' },

    // names_main subtabs
    '99 Names of Allah': { ar: 'Asma Allah al-Husna', bn: 'আল্লাহর ৯৯ নাম' },
    '25 Prophets': { ar: 'al-Anbiya al-Ishrun wa Khamsa', bn: '২৫ নবী' },
    'Scholars': { ar: 'al-Ulama', bn: 'আলেমগণ' },

    // profile_main subtabs
    'Trophies': { ar: 'al-Ku\'us', bn: 'ট্রফি' },
    'Progress': { ar: 'al-Taqaddum', bn: 'অগ্রগতি' },
    'Analytics': { ar: 'al-Tahlilat', bn: 'বিশ্লেষণ' },
    'Rewards': { ar: 'al-Mukafaat', bn: 'পুরস্কার' },

    // profile settings
    'Settings': { ar: 'al-Iidarat', bn: 'সেটিংস' },
    'Logout': { ar: 'Tasjil al-Khuruj', bn: 'লগআউট' },
    'Switch user': { ar: 'Taghyir al-Mustakhdim', bn: 'ব্যবহারকারী পরিবর্তন' }
  },
  lang: 'en',
  load() {
    try { this.lang = localStorage.getItem(LANG_KEY) || 'en'; } catch (e) { this.lang = 'en'; }
    if (!['en', 'ar', 'bn'].includes(this.lang)) this.lang = 'en';
    return this.lang;
  },
  t(str) {
    if (!str) return str;
    const entry = this.dict[str];
    if (!entry || !entry[this.lang]) return str;
    return entry[this.lang];
  }
};

I18N.load();

function t(str) { return I18N.t(str); }

function iqSetLang(lang) {
  if (!['en', 'ar', 'bn'].includes(lang)) lang = 'en';
  I18N.lang = lang;
  try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
  document.querySelectorAll('.t1-btn').forEach((b) => {
    const labelEl = b.querySelector('.t1-label');
    if (labelEl) labelEl.textContent = t(b.getAttribute('data-i18n') || '');
  });
  const activeCat = (document.querySelector('.t1-btn.active') || {}).getAttribute?.('data-cat') || 'ibadah';
  if (window.App && typeof window.App.switchCategory === 'function') {
    window.App.switchCategory(activeCat, document.querySelector('.t1-btn.active'));
  }
  if (window.App && typeof window.App.renderSubTabs === 'function') window.App.renderSubTabs();
  if (window.renderProfile) window.renderProfile();
}

window.t = t;
window.iqSetLang = iqSetLang;
window.I18N = I18N;
