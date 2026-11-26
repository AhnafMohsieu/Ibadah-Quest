/* data/i18n.js — Full localization, RTL switching, numerals, Islamic glossary & 6-form Arabic pluralization.
 * Supported languages ONLY: 'en' (English), 'bn' (Bangla), 'ar' (Arabic).
 */
(function() {
  var LANG_KEY = 'iq_lang';
  var NUM_KEY = 'iq_numerals';
  var TERM_KEY = 'iq_bn_term_mode';

  var GLOSSARY_NAMAZ = {
    'Daily Prayers': 'দৈনিক নামাজ',
    'Prayer Times': 'নামাজের সময়',
    'Prayer': 'নামাজ',
    'Prayers': 'নামাজ',
    'Prayer Guide': 'নামাজ গাইড',
    'Salah': 'নামাজ',
    'Fasting': 'রোজা',
    'Sawm': 'রোজা',
    'Suhoor': 'সেহরি',
    'Iftar': 'ইফতার',
    'Dhikr': 'যিকর',
    'Remembrance': 'যিকর',
    'Qada': 'ক্বাযা'
  };

  var GLOSSARY_SALAT = {
    'Daily Prayers': 'দৈনিক সালাত',
    'Prayer Times': 'সালাতের সময়সূচি',
    'Prayer': 'সালাত',
    'Prayers': 'সালাত',
    'Prayer Guide': 'সালাত নির্দেশিকা',
    'Salah': 'সালাত',
    'Fasting': 'সিয়াম',
    'Sawm': 'সিয়াম',
    'Suhoor': 'সাহরি',
    'Iftar': 'ইফতার',
    'Dhikr': 'জিকির',
    'Remembrance': 'জিকির',
    'Qada': 'কাজা'
  };

  var DICT = {
    // Primary 5 destinations & core sections
    'Daily': { ar: 'اليومية', bn: 'দৈনিক' },
    'All Sections': { ar: 'كل الأقسام', bn: 'সকল বিভাগ' },
    'Level': { ar: 'المستوى', bn: 'স্তর' },
    'Lv': { ar: 'م', bn: 'স্তর' },
    'Best': { ar: 'الأفضل', bn: 'সেরা' },
    'Day Streak': { ar: 'أيام متتالية', bn: 'দিনের ধারাবাহিকতা' },
    'Start your journey!': { ar: 'ابدأ رحلتك المباركة', bn: 'আপনার যাত্রা শুরু করুন!' },
    'Overall': { ar: 'الإجمالي', bn: 'মোট' },
    'today': { ar: 'اليوم', bn: 'আজ' },
    'Next Prayer:': { ar: 'الصلاة القادمة:', bn: 'পরবর্তী নামাজ:' },
    'New Seeker': { ar: 'طالب جديد', bn: 'নতুন অন্বেষী' },
    'Core': { ar: 'الأساسيات', bn: 'মূল বিভাগ' },
    'Adhkar': { ar: 'الأذكار', bn: 'যিকির ও দোয়া' },
    'Guide': { ar: 'الدليل', bn: 'নির্দেশিকা' },
    'Self-Tracking': { ar: 'المتابعة الذاتية', bn: 'আত্ম-অনুসরণ' },
    'Faith & Life': { ar: 'الإيمان والحياة', bn: 'ঈমান ও জীবন' },
    'Today': { ar: 'اليوم', bn: 'আজ' },
    'Quests': { ar: 'المهام', bn: 'কুয়েস্ট' },
    'Quran': { ar: 'القرآن الكريم', bn: 'কুরআন' },
    'Progress': { ar: 'التقدّم', bn: 'অগ্রগতি' },
    'More': { ar: 'المزيد', bn: 'আরও' },
    'Knowledge': { ar: 'العلم', bn: 'জ্ঞান' },
    'Names': { ar: 'الأسماء', bn: 'নাম' },
    'Library': { ar: 'المكتبة', bn: 'লাইব্রেরি' },
    'Profile': { ar: 'الملف الشخصي', bn: 'প্রোফাইল' },

    // Prayer times & Worship
    'Daily Prayers': { ar: 'الصلوات اليومية', bn: 'দৈনিক নামাজ' },
    'Prayer Times': { ar: 'أوقات الصلاة', bn: 'নামাজের সময়' },
    'Prayer': { ar: 'الصلاة', bn: 'নামাজ' },
    'Prayers': { ar: 'الصلوات', bn: 'নামাজ' },
    'Qibla': { ar: 'القبلة', bn: 'কিবলা' },
    'Qibla Direction': { ar: 'اتجاه القبلة', bn: 'কিবলার দিক' },
    'Fajr': { ar: 'الفجر', bn: 'ফজর' },
    'Sunrise': { ar: 'الشروق', bn: 'সূর্যোদয়' },
    'Dhuhr': { ar: 'الظهر', bn: 'যোহর' },
    'Jummah': { ar: 'الجمعة', bn: 'জুমা' },
    'Asr': { ar: 'العصر', bn: 'আসর' },
    'Maghrib': { ar: 'المغرب', bn: 'মাগরিব' },
    'Isha': { ar: 'العشاء', bn: 'ইশা' },
    'Next Prayer': { ar: 'الصلاة القادمة', bn: 'পরবর্তী নামাজ' },
    'Next': { ar: 'التالي', bn: 'পরবর্তী' },
    'UP NEXT': { ar: 'التالية', bn: 'আসন্ন' },
    'Qada': { ar: 'قضاء', bn: 'ক্বাযা' },
    'Grace Mode': { ar: 'وضع الراحة', bn: 'বিশ্রাম মোড' },
    'Rest Mode Active': { ar: 'وضع الراحة مفعّل', bn: 'বিশ্রাম মোড চালু' },
    'Streak Protected': { ar: 'المداومة محفوظة بلطف', bn: 'ধারাবাহিকতা সুরক্ষিত' },

    // Navigation & Subtabs
    'Journeys': { ar: 'الرحلات', bn: 'যাত্রাপথ' },
    'Morning': { ar: 'أذكار الصباح', bn: 'সকাল' },
    'Evening': { ar: 'أذكار المساء', bn: 'সন্ধ্যা' },
    'Remembrance': { ar: 'الأذكار', bn: 'যিকর' },
    'Ablution': { ar: 'الوضوء', bn: 'অজু' },
    'Prayer Guide': { ar: 'دليل الصلاة', bn: 'নামাজ গাইড' },
    'Fasting': { ar: 'الصيام', bn: 'রোজা' },
    'Health': { ar: 'الصحة والعافية', bn: 'স্বাস্থ্য' },
    "Qur'an & Sunnah": { ar: 'القرآن والسنة', bn: 'কুরআন ও সুন্নাহ' },
    'Fiqh & Rulings': { ar: 'الفقه والأحكام', bn: 'ফিকহ ও বিধান' },
    'Arabic': { ar: 'العربية', bn: 'আরবি' },
    'Heart & Soul': { ar: 'تزكية النفس', bn: 'হৃদয় ও আত্মা' },
    'Dealings & Society': { ar: 'المعاملات والمجتمع', bn: 'লেনদেন ও সমাজ' },
    'Life & Modern': { ar: 'الحياة والمعاصرة', bn: 'জীবন ও আধুনিকতা' },
    'History & Seerah': { ar: 'السيرة والتاريخ', bn: 'সীরাত ও ইতিহাস' },
    'Hereafter': { ar: 'الآخرة', bn: 'আখিরাত' },
    'Interpretation': { ar: 'التفسير', bn: 'তাফসির' },
    'Hadith': { ar: 'الحديث الشريف', bn: 'হাদিস' },
    'Prophetic Ways': { ar: 'السنن النبوية', bn: 'সুন্নাহ' },
    'Memorization': { ar: 'الحفظ والمراجعة', bn: 'হিফজ ও পুনরাবৃত্তি' },
    'Jurisprudence': { ar: 'الفقه', bn: 'ফিকহ' },
    'Purification': { ar: 'الطهارة', bn: 'পবিত্রতা' },
    'Salah': { ar: 'الصلاة', bn: 'নামাজ' },
    'Zakat': { ar: 'الزكاة', bn: 'যাকাত' },
    'Sawm': { ar: 'الصيام', bn: 'রোজা' },
    'Hajj': { ar: 'الحج والعمرة', bn: 'হজ্জ ও ওমরাহ' },
    'Worship Rulings': { ar: 'أحكام العبادات', bn: 'ইবাদতের বিধান' },
    'Wealth & Oaths': { ar: 'الأموال والأيمان', bn: 'সম্পদ ও শপথ' },
    'Virtues': { ar: 'الفضائل', bn: 'সদগুণ' },
    'Vices & Repentance': { ar: 'التوبة والتزكية', bn: 'তওবা ও আত্মশুদ্ধি' },
    'Character & Path': { ar: 'الأخلاق والسلوك', bn: 'চরিত্র ও পথ' },
    'Family Life': { ar: 'الأسرة والبر', bn: 'পারিবারিক জীবন' },
    'Community': { ar: 'المجتمع والإخاء', bn: 'সমাজ ও ভ্রাতৃত্ব' },
    'Service & Care': { ar: 'الخدمة والرحمة', bn: 'সেবা ও যত্ন' },
    'Work & Justice': { ar: 'العمل والعدل', bn: 'কর্ম ও ন্যায়বিচার' },
    'Wellness': { ar: 'العافية', bn: 'সুস্থতা' },
    'Earth & Living': { ar: 'الأرض والبيئة', bn: 'পৃথিবী ও জীবিকা' },
    'Youth & Tech': { ar: 'الشباب والتقنية', bn: 'যুব ও প্রযুক্তি' },
    'Ethics & Finance': { ar: 'الأخلاق والمال الحلال', bn: 'নৈতিকতা ও হালাল অর্থ' },
    'Dynasties': { ar: 'الدول الإسلامية', bn: 'ইসলামি ইতিহাস' },
    'Cities & Lands': { ar: 'المدن والبلدان', bn: 'নগর ও অঞ্চল' },
    'Arts & Crafts': { ar: 'الفنون الإسلامية', bn: 'শিল্প ও স্থাপত্য' },
    'Arabic Language': { ar: 'اللغة العربية', bn: 'আরবি ভাষা' },
    'Holy Cities': { ar: 'المدن المقدسة', bn: 'পবিত্র নগরী' },
    'Capitals': { ar: 'العواصم التاريخية', bn: 'ঐতিহাসিক রাজধানী' },
    'Lands of the East': { ar: 'بلاد المشرق', bn: 'প্রাচ্যের জনপদ' },
    'Pattern & Illumination': { ar: 'الزخرفة والخط', bn: 'ক্যালিগ্রাফি ও নকশা' },
    'Sacred Space': { ar: 'العمارة المقدسة', bn: 'পবিত্র স্থাপত্য' },
    'Crafts & Nasheeds': { ar: 'الحرف والأناشيد', bn: 'হস্তশিল্প ও নাশিদ' },
    'Structure': { ar: 'بنية اللغة', bn: 'ভাষার গঠন' },
    'Sound & Script': { ar: 'الأصوات والخطوط', bn: 'ধ্বনি ও লিপি' },
    'Words & Poetry': { ar: 'المفردات والأدب', bn: 'শব্দভাণ্ডার ও সাহিত্য' },
    '99 Names of Allah': { ar: 'أسماء الله الحسنى', bn: 'আল্লাহর ৯৯ নাম' },
    '25 Prophets': { ar: 'الأنبياء والرسل', bn: 'নবী ও রাসূলগণ' },
    'Scholars': { ar: 'العلماء', bn: 'আলেমগণ' },
    'Trophies': { ar: 'الأوسمة', bn: 'সম্মাননা' },
    'Analytics': { ar: 'الإحصائيات', bn: 'বিশ্লেষণ' },
    'Rewards': { ar: 'المظاهر والألقاب', bn: 'থিম ও ফ্রেম' },
    'Settings': { ar: 'الإعدادات', bn: 'সেটিংস' },
    'Logout': { ar: 'قفل الملف', bn: 'লগআউট' },
    'Switch user': { ar: 'تبديل الملف', bn: 'প্রোফাইল বদলান' },

    // Greeting & Home UI
    'Good Morning': { ar: 'صباح النور', bn: 'শুভ সকাল' },
    'Good Afternoon': { ar: 'مساء الخير', bn: 'শুভ অপরাহ্ণ' },
    'Good Evening': { ar: 'مساء النور', bn: 'শুভ সন্ধ্যা' },
    'Blessed Night': { ar: 'ليلة مباركة', bn: 'বরকতময় রাত' },
    'Peaceful Night': { ar: 'ليلة هادئة', bn: 'প্রশান্ত রাত' },
    "Today's Focus": { ar: 'تركيز اليوم', bn: 'আজকের মনোযোগ' },
    'Continue Reading': { ar: 'متابعة القراءة', bn: 'পড়া চালিয়ে যান' },
    'Resume': { ar: 'متابعة', bn: 'চালিয়ে যান' },
    'Details': { ar: 'التفاصيل', bn: 'বিস্তারিত' },
    'Daily Reminder': { ar: 'تذكرة اليوم', bn: 'আজকের স্মরণ' },
    'Daily challenges': { ar: 'عبادات اليوم', bn: 'আজকের আমল' },
    'Dhikr': { ar: 'الذكر', bn: 'যিকর' },
    'Next:': { ar: 'التالية:', bn: 'পরবর্তী:' },
    'Tap to claim your Daily Bonus!': { ar: 'اضغط لاستلام مكافأة اليوم', bn: 'আজকের দৈনিক বোনাস নিতে ট্যাপ করুন!' },
    'Search anything...': { ar: 'ابحث في كل شيء...', bn: 'যেকোনো বিষয় খুঁজুন...' },
    'Show All': { ar: 'عرض الكل', bn: 'সব দেখুন' },
    'Start': { ar: 'ابدأ', bn: 'শুরু করুন' },
    'Pause': { ar: 'إيقاف مؤقت', bn: 'বিরতি' },
    'Reset': { ar: 'إعادة ضبط', bn: 'রিসেট' },
    'Offline Mode — All Worship Data Stored Locally': { ar: 'وضع عدم الاتصال — بياناتك محفوظة محليًا', bn: 'অফলাইন মোড — আপনার সব আমল ডিভাইসে সংরক্ষিত' },

    // Onboarding & Permissions
    'Welcome to Ibadah Quest': { ar: 'مرحبًا بك في عبادة كويست', bn: 'ইবাদাহ কোয়েস্টে স্বাগতম' },
    'Choose Your Language': { ar: 'اختر لغتك', bn: 'আপনার ভাষা বেছে নিন' },
    'Set Your Location & Prayer Method': { ar: 'الموقع وطريقة الحساب', bn: 'অবস্থান ও নামাজের হিসাব পদ্ধতি' },
    'Gentle Reminders': { ar: 'تذكيرات لطيفة', bn: 'স্নেহময় রিমাইন্ডার' },
    'Your First Worship Moment': { ar: 'لحظة عبادة أولى', bn: 'আপনার প্রথম আমল' },
    'Skip': { ar: 'تخطي', bn: 'এড়িয়ে যান' },
    'Back': { ar: 'رجوع', bn: 'পিছনে' },
    'Continue': { ar: 'متابعة', bn: 'এগিয়ে যান' },
    'Begin': { ar: 'ابدأ الآن', bn: 'শুরু করুন' },

    // Settings, Themes, Numerals, Backup & Safety
    'Language': { ar: 'اللغة', bn: 'ভাষা' },
    'Theme': { ar: 'المظهر', bn: 'থিম' },
    'Light': { ar: 'فاتح', bn: 'লাইট' },
    'Dark': { ar: 'داكن', bn: 'ডার্ক' },
    'OLED Night': { ar: 'ليلي عميق (OLED)', bn: 'ওএলইডি নাইট' },
    'System': { ar: 'النظام', bn: 'সিস্টেম' },
    'Numerals': { ar: 'الأرقام', bn: 'সংখ্যার ধরন' },
    'Auto': { ar: 'تلقائي', bn: 'স্বয়ংক্রিয়' },
    'Seasonal Accent': { ar: 'لمسة المواسم الإسلامية', bn: 'মৌসুমি আবহ (রমজান/ঈদ)' },
    'Sound Effects': { ar: 'المؤثرات الصوتية', bn: 'শব্দ (অপশনাল)' },
    'Export Backup': { ar: 'تصدير نسخة احتياطية', bn: 'ব্যাকআপ সংরক্ষণ (JSON)' },
    'Export CSV': { ar: 'تصدير جدول CSV', bn: 'সিএসভি ডাউনলোড' },
    'Import Backup': { ar: 'استيراد نسخة احتياطية', bn: 'ব্যাকআপ পুনরুদ্ধার' },
    'Reset All Data': { ar: 'حذف جميع البيانات', bn: 'সব ডেটা মুছে ফেলুন' },
    'Notifications': { ar: 'الإشعارات', bn: 'নোটিফিকেশন' },
    'Send Test Notification': { ar: 'إرسال إشعار تجريبي', bn: 'পরীক্ষামূলক নোটিফিকেশন পাঠান' },
    'Component Gallery': { ar: 'معرض نظام التصميم', bn: 'ডিজাইন গ্যালারি' },
    'Report Content Error': { ar: 'الإبلاغ عن خطأ في المحتوى', bn: 'তথ্যগত ভুল জানান' },
    'Licenses & Credits': { ar: 'التراخيص والمصادر', bn: 'লাইসেন্স ও কৃতজ্ঞতা' }
  };

  function detectDefaultLang() {
    try {
      var saved = localStorage.getItem(LANG_KEY);
      if (saved && ['en', 'ar', 'bn'].indexOf(saved) !== -1) return saved;
      var navLang = (typeof navigator !== 'undefined' && (navigator.language || navigator.userLanguage || '')) || '';
      var lc = String(navLang).toLowerCase();
      if (lc.indexOf('bn') === 0) return 'bn';
      if (lc.indexOf('ar') === 0) return 'ar';
    } catch (e) {}
    return 'en';
  }

  var I18N = {
    dict: DICT,
    lang: 'en',
    numerals: 'auto',
    bnTermMode: 'namaz',
    load: function() {
      this.lang = detectDefaultLang();
      try {
        var n = localStorage.getItem(NUM_KEY);
        if (n && ['auto', 'western', 'bangla', 'arabic'].indexOf(n) !== -1) this.numerals = n;
        var tm = localStorage.getItem(TERM_KEY);
        if (tm === 'salat' || tm === 'namaz') this.bnTermMode = tm;
      } catch (e) {}
      applyDomLanguage(this.lang);
      return this.lang;
    },
    t: function(str) {
      if (!str) return str;
      var termMode = (typeof S !== 'undefined' && S && S.bnTermMode) || this.bnTermMode;
      if (this.lang === 'bn') {
        if (termMode === 'salat' && GLOSSARY_SALAT[str]) return GLOSSARY_SALAT[str];
        if (termMode === 'namaz' && GLOSSARY_NAMAZ[str]) return GLOSSARY_NAMAZ[str];
      }
      var entry = this.dict[str];
      if (!entry || !entry[this.lang]) return str;
      return entry[this.lang];
    }
  };

  function applyDomLanguage(lang) {
    if (typeof document === 'undefined' || !document.documentElement) return;
    var rtl = lang === 'ar';
    try {
      document.documentElement.lang = lang;
      document.documentElement.dir = rtl ? 'rtl' : 'ltr';
      if (typeof document.documentElement.setAttribute === 'function') {
        document.documentElement.setAttribute('lang', lang);
        document.documentElement.setAttribute('dir', rtl ? 'rtl' : 'ltr');
      }
      if (document.body) {
        document.body.setAttribute('data-lang', lang);
        document.body.setAttribute('dir', rtl ? 'rtl' : 'ltr');
      }
    } catch (e) {}
  }

  function resolveNumeralMode() {
    var mode = I18N.numerals || 'auto';
    if (typeof S !== 'undefined' && S && S.numerals) mode = S.numerals;
    if (mode === 'auto') {
      if (I18N.lang === 'bn') return 'bangla';
      if (I18N.lang === 'ar') return 'arabic';
      return 'western';
    }
    return mode;
  }

  function iqFormatNum(val) {
    var s = String(val == null ? '' : val);
    var mode = resolveNumeralMode();
    if (mode === 'bangla') {
      return s.replace(/[0-9]/g, function(d) { return '\u09E6\u09E7\u09E8\u09E9\u09EA\u09EB\u09EC\u09ED\u09EE\u09EF'[Number(d)]; });
    }
    if (mode === 'arabic') {
      return s.replace(/[0-9]/g, function(d) { return '\u0660\u0661\u0662\u0663\u0664\u0665\u0666\u0667\u0668\u0669'[Number(d)]; });
    }
    return s;
  }

  // Arabic 6-plural category resolver + Bangla/English support
  function iqPluralCategory(n, lang) {
    var l = lang || I18N.lang || 'en';
    var num = Math.abs(Number(n) || 0);
    if (l === 'ar') {
      if (num === 0) return 'zero';
      if (num === 1) return 'one';
      if (num === 2) return 'two';
      var mod100 = num % 100;
      if (mod100 >= 3 && mod100 <= 10) return 'few';
      if (mod100 >= 11 && mod100 <= 99) return 'many';
      return 'other';
    }
    return num === 1 ? 'one' : 'other';
  }

  function iqPlural(n, formsByLang) {
    var l = I18N.lang || 'en';
    var map = (formsByLang && formsByLang[l]) || (formsByLang && formsByLang.en) || {};
    var cat = iqPluralCategory(n, l);
    var tmpl = map[cat] || map.other || map.one || String(n);
    return tmpl.replace('{n}', iqFormatNum(n));
  }

  function t(str) { return I18N.t(str); }

  function iqSetLang(lang) {
    if (['en', 'ar', 'bn'].indexOf(lang) === -1) lang = 'en';
    I18N.lang = lang;
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
    if (typeof S !== 'undefined' && S) { S.lang = lang; if (typeof saveState === 'function') saveState(); }
    applyDomLanguage(lang);
    document.querySelectorAll('.bnav-btn').forEach(function(b) {
      var labelEl = b.querySelector('.bnav-label');
      if (labelEl) labelEl.textContent = t(b.getAttribute('data-i18n') || '');
    });
    document.querySelectorAll('[data-i18n-text]').forEach(function(el) {
      el.textContent = t(el.getAttribute('data-i18n-text') || '');
    });
    document.querySelectorAll('.global-search').forEach(function(inp) {
      inp.setAttribute('placeholder', t('Search anything...'));
      inp.setAttribute('aria-label', t('Search anything...'));
    });
    var activeBtn = document.querySelector('.bnav-btn.active');
    var activeCat = (activeBtn && activeBtn.getAttribute('data-cat')) || (typeof S !== 'undefined' && S && S.lastCat) || 'ibadah';
    if (typeof window !== 'undefined') {
      if (window.syncIqDrawer) window.syncIqDrawer();
      if (window.renderDateLine) window.renderDateLine();
      if (window.renderTopBar) window.renderTopBar();
      if (window.renderLv) window.renderLv();
      if (window.renderStr) window.renderStr();
      if (window.renderIqFeed) window.renderIqFeed();
      if (window.renderPrayers) window.renderPrayers();
      if (window.renderPrayerTimes) window.renderPrayerTimes();
      if (window.renderDailyContent) window.renderDailyContent();
      if (window.App && typeof window.App.switchCategory === 'function' && activeBtn) {
        window.App.switchCategory(activeCat, activeBtn);
      }
      if (window.renderProfile) window.renderProfile();
    }
  }

  function iqSetNumerals(mode) {
    if (['auto', 'western', 'bangla', 'arabic'].indexOf(mode) === -1) mode = 'auto';
    I18N.numerals = mode;
    try { localStorage.setItem(NUM_KEY, mode); } catch (e) {}
    if (typeof S !== 'undefined' && S) { S.numerals = mode; if (typeof saveState === 'function') saveState(); }
    if (typeof window !== 'undefined') {
      if (window.renderAll) window.renderAll();
      if (window.renderIqFeed) window.renderIqFeed();
    }
  }

  function iqSetBnTermMode(mode) {
    I18N.bnTermMode = mode === 'salat' ? 'salat' : 'namaz';
    try { localStorage.setItem(TERM_KEY, I18N.bnTermMode); } catch (e) {}
    if (typeof S !== 'undefined' && S) { S.bnTermMode = I18N.bnTermMode; if (typeof saveState === 'function') saveState(); }
    iqSetLang(I18N.lang);
  }

  function iqSyncLangDir() {
    var l = (typeof S !== 'undefined' && S && S.lang) ? S.lang : I18N.lang;
    if (['en', 'ar', 'bn'].indexOf(l) !== -1) I18N.lang = l;
    applyDomLanguage(I18N.lang);
  }

  I18N.load();

  window.t = t;
  window.iqSetLang = iqSetLang;
  window.setLanguage = iqSetLang;
  window.iqSyncLangDir = iqSyncLangDir;
  window.iqSetNumerals = iqSetNumerals;
  window.iqSetBnTermMode = iqSetBnTermMode;
  window.iqFormatNum = iqFormatNum;
  window.iqPluralCategory = iqPluralCategory;
  window.iqPlural = iqPlural;
  window.I18N = I18N;
})();
