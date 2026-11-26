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
    'Licenses & Credits': { ar: 'التراخيص والمصادر', bn: 'লাইসেন্স ও কৃতজ্ঞতা' },

    // Phase 1-6 Refined Secondary Screens, Actions, Modals & Auth
    'Daily Ibadah & Adhkar': { ar: 'العبادات اليومية والأذكار', bn: 'দৈনিক ইবাদত ও যিকর' },
    'Habit tracking, morning & evening remembrance, and prophetic devotions': { ar: 'متابعة العبادات وأذكار الصباح والمساء والسنن النبوية', bn: 'নিয়মিত আমল, সকাল-সন্ধ্যার যিকর এবং সুন্নাহ অনুসরণ' },
    'Islamic Knowledge': { ar: 'المعرفة الإسلامية', bn: 'ইসলামি জ্ঞান' },
    "Qur'an, Hadith, Fiqh rulings, character & prophetic wisdom": { ar: 'القرآن والحديث والفقه والأخلاق والحكم النبوية', bn: 'কুরআন, হাদিস, ফিকহ ও নবীজির শিক্ষা' },
    '99 Names & Blessed Figures': { ar: 'أسماء الله الحسنى والشخصيات المباركة', bn: 'আল্লাহর ৯৯ নাম ও মহাপুরুষগণ' },
    'Asma-ul-Husna, Prophets, Sahabah, and righteous classical scholars': { ar: 'أسماء الله الحسنى والأنبياء والصحابة والعلماء', bn: 'আসমাউল হুসনা, নবী-রাসূল, সাহাবা ও ওলামায়ে কেরাম' },
    'Islamic Library': { ar: 'المكتبة الإسلامية', bn: 'ইসলামি লাইব্রيري' },
    'Dynasties, sacred cities, Islamic architecture, arts & Arabic language': { ar: 'التاريخ والمدن المقدسة والفنون واللغة العربية', bn: 'ইসলামি ইতিহাস, পবিত্র নগরী, শিল্পকলা ও আরবি ভাষা' },
    'Account & Progress': { ar: 'الحساب والتقدّم', bn: 'অ্যাকাউন্ট ও অগ্রগতি' },
    'Spiritual streaks, achievements, trophies & personal progress': { ar: 'المداومة والأوسمة والإنجازات والتقدّم الشخصي', bn: 'ধারাবাহিকতা, অর্জন, সম্মাননা ও ব্যক্তিগত অগ্রগতি' },
    'Daily Quests': { ar: 'المهام اليومية', bn: 'দৈনিক কুয়েস্ট' },
    'Weekly Quests': { ar: 'المهام الأسبوعية', bn: 'সাপ্তাহিক কুয়েস্ট' },
    'Monthly Quests': { ar: 'المهام الشهرية', bn: 'মাসিক কুয়েস্ট' },
    'Yearly Quests': { ar: 'المهام السنوية', bn: 'বার্ষিক কুয়েস্ট' },
    'Lifetime Quests': { ar: 'مهام العمر', bn: 'আজীবন কুয়েস্ট' },
    'Total quests completed': { ar: 'إجمالي المهام المكتملة', bn: 'মোট সম্পন্ন কুয়েস্ট' },
    'Dawn': { ar: 'الفجر', bn: 'ভোর' },
    'Noon': { ar: 'الظهر', bn: 'দুপুর' },
    "Jumu'ah / Noon": { ar: 'الجمعة / الظهر', bn: 'জুমা / দুপুর' },
    'Afternoon': { ar: 'العصر', bn: 'বিকাল' },
    'Sunset': { ar: 'المغرب', bn: 'সন্ধ্যা' },
    'Night': { ar: 'العشاء', bn: 'রাত' },
    'Until': { ar: 'حتى', bn: 'বাকি' },
    'City': { ar: 'المدينة', bn: 'শহর' },
    'Method': { ar: 'طريقة الحساب', bn: 'হিসাব পদ্ধতি' },
    'Asr Madhhab': { ar: 'مذهب العصر', bn: 'আসরের মাজহাব' },
    'High Latitude Rule': { ar: 'المناطق عالية العرض', bn: 'উচ্চ অক্ষাংশ নিয়ম' },
    'Use Device Location': { ar: 'استخدام موقع الجهاز', bn: 'ডিভাইসের অবস্থান ব্যবহার করুন' },
    'Fajr Angle': { ar: 'زاوية الفجر', bn: 'ফজরের কোণ' },
    'Isha Angle': { ar: 'زاوية العشاء', bn: 'ইশার কোণ' },
    'Hanafi (2x shadow)': { ar: 'حنفي (مثلا الظل)', bn: 'হানাফি (২ গুণ ছায়া)' },
    "Standard (Shafi'i/Maliki/Hanbali)": { ar: 'الجمهور (شافعي/مالكي/حنبلي)', bn: 'সাধারণ (শাফেয়ি/মালিকি/হাম্বলি)' },
    'Middle of Night': { ar: 'منتصف الليل', bn: 'মধ্যরাত' },
    'Seventh of Night': { ar: 'سُبع الليل', bn: 'রাতের সপ্তমাংশ' },
    'Twilight Angle': { ar: 'زاوية الشفق', bn: 'গোধূলি কোণ' },
    "Jama'at": { ar: 'الجماعة', bn: 'জামাত' },
    'Measured clockwise from True North (offline great-circle bearing).': { ar: 'مقاس باتجاه عقارب الساعة من الشمال الحقيقي (دون إنترنت).', bn: 'প্রকৃত উত্তর দিক থেকে ঘড়ির কাঁটার দিকে পরিমাপকৃত (অফলাইন)।' },
    'Enable Live Compass': { ar: 'تفعيل البوصلة الحية', bn: 'লাইভ কম্পাস চালু করুন' },
    'Dhikr Tap': { ar: 'تسبيحة (+١)', bn: 'যিকর (+১)' },
    'Tasbih Cycle': { ar: 'دورة تسبيح', bn: 'তাসবিহ চক্র' },
    'Complete a full 33-count dhikr set': { ar: 'أكمل ٣٣ تسبيحة كاملة', bn: '৩৩ বারের পূর্ণ তাসবিহ সম্পন্ন করুন' },
    'Quran Session': { ar: 'جلسة قرآن', bn: 'কুরআন তিলাওয়াত' },
    'min logged today': { ar: 'دقيقة مسجلة اليوم', bn: 'মিনিট আজ পঠিত' },
    'min read today': { ar: 'دقيقة قراءة اليوم', bn: 'মিনিট আজ পঠিত' },
    'Read': { ar: 'قراءة', bn: 'পড়ুন' },
    'Quran Reader': { ar: 'مصحف القرآن', bn: 'কুরআন পাঠক' },
    'Read by Surah or Juz with audio': { ar: 'اقرأ بالسورة أو الجزء مع التلاوة', bn: 'অডিওসহ সূরা বা পারা অনুযায়ী পড়ুন' },
    'Open': { ar: 'فتح', bn: 'খুলুন' },
    'Sadaqah & Charity': { ar: 'الصدقة والإحسان', bn: 'সদকা ও দান' },
    'Log a charity or sadaqah act': { ar: 'سجّل عمل صدقة أو إحسان', bn: 'একটি সদকা বা দানের কাজ লিখুন' },
    'Log': { ar: 'تسجيل', bn: 'লিখুন' },
    'Masjid Check-ins': { ar: 'زيارات المسجد', bn: 'মসজিদে উপস্থিতি' },
    'visits logged': { ar: 'زيارات مسجلة', bn: 'টি উপস্থিতি সংরক্ষিত' },
    'total masjid visits': { ar: 'إجمالي زيارات المسجد', bn: 'মোট মসজিদ পরিদর্শন' },
    'total': { ar: 'الإجمالي', bn: 'মোট' },
    'Map': { ar: 'الخريطة', bn: 'মানচিত্র' },
    'Voluntary Prayers': { ar: 'النوافل', bn: 'নফল নামাজ' },
    'Voluntary & Deeds': { ar: 'النوافل والأعمال', bn: 'নফল ও নেক আমল' },
    'Extra Good Deeds': { ar: 'أعمال الخير الإضافية', bn: 'অতিরিক্ত নেক আমল' },
    'completed today': { ar: 'مكتمل اليوم', bn: 'টি আজ সম্পন্ন' },
    'completed': { ar: 'مكتمل', bn: 'সম্পন্ন' },
    'Daily Goal Targets': { ar: 'الأهداف اليومية', bn: 'দৈনিক লক্ষ্য নির্ধারণ' },
    'Daily Dhikr Target': { ar: 'هدف الذكر اليومي', bn: 'দৈনিক যিকরের লক্ষ্য' },
    'Daily Quran (min)': { ar: 'هدف القرآن اليومي (دقيقة)', bn: 'দৈনিক কুরআন (মিনিট)' },
    'Save Daily Targets': { ar: 'حفظ الأهداف', bn: 'দৈনিক লক্ষ্য সংরক্ষণ' },
    'Daily Concentric Telemetry': { ar: 'متابعة التركيز اليومي', bn: 'দৈনিক লক্ষ্যমাত্রা' },
    'Voluntary': { ar: 'النوافل', bn: 'নফল' },
    'Deeds': { ar: 'الأعمال', bn: 'আমল' },
    'logged': { ar: 'مسجلة', bn: 'সংরক্ষিত' },
    'Focus Session': { ar: 'جلسة تركيز', bn: 'মনোযোগ সেশন' },
    'overall': { ar: 'إجمالاً', bn: 'সামগ্রিক' },
    'Times': { ar: 'الأوقات', bn: 'সময়' },
    'Daily Bonus XP': { ar: 'مكافأة اليوم', bn: 'দৈনিক বোনাস' },
    'Claim Bonus': { ar: 'استلام المكافأة', bn: 'বোনাস নিন' },
    'Already claimed today — Alhamdulillah!': { ar: 'تم استلام مكافأة اليوم — الحمد لله!', bn: 'আজকের বোনাস নেওয়া হয়েছে — আলহামদুলিল্লাহ!' },
    'Your daily streak bonus is ready to claim.': { ar: 'مكافأة المداومة اليومية جاهزة.', bn: 'আপনার দৈনিক বোনাস প্রস্তুত।' },
    'Daily Worship Status': { ar: 'حالة العبادات اليومية', bn: 'দৈনিক ইবাদতের অবস্থা' },
    'Browser Reminders': { ar: 'تذكيرات المتصفح', bn: 'ব্রাউজার রিমাইন্ডার' },
    'Prayer & streak reminders active.': { ar: 'تذكيرات الصلاة والمداومة مفعّلة.', bn: 'নামাজ ও ধারাবাহিকতার রিমাইন্ডার চালু আছে।' },
    'Enable push reminders for prayer streaks.': { ar: 'فعّل التذكيرات للمحافظة على صلواتك.', bn: 'নিয়মিত নামাজের জন্য রিমাইন্ডার চালু করুন।' },
    'Enable': { ar: 'تفعيل', bn: 'চালু করুন' },
    'Disable': { ar: 'تعطيل', bn: 'বন্ধ করুন' },
    'OK': { ar: 'حسناً', bn: 'ঠিক আছে' },
    'Cancel': { ar: 'إلغاء', bn: 'বাতিল' },
    'Confirm': { ar: 'تأكيد', bn: 'নিশ্চিত' },
    'Close': { ar: 'إغلاق', bn: 'বন্ধ' },
    'Save Note': { ar: 'حفظ الملاحظة', bn: 'নোট সংরক্ষণ' },
    'Dhikr Statistics': { ar: 'إحصائيات الذكر', bn: 'যিকরের পরিসংখ্যান' },
    'Total Dhikr': { ar: 'مجموع الأذكار', bn: 'মোট যিকর' },
    'Streak': { ar: 'المداومة', bn: 'ধারাবাহিকতা' },
    'Daily Tap XP': { ar: 'نقاط الذكر اليومية', bn: 'দৈনিক যিকর এক্সপি' },
    'Target': { ar: 'الهدف', bn: 'লক্ষ্য' },
    'Vibration': { ar: 'الاهتزاز', bn: 'ভাইব্রেশন' },
    'On': { ar: 'مفعّل', bn: 'চালু' },
    'Off': { ar: 'متوقف', bn: 'বন্ধ' },
    'Morning Adhkar (After Fajr)': { ar: 'أذكار الصباح (بعد الفجر)', bn: 'সকালের যিকর (ফজরের পর)' },
    'Evening Adhkar (After Asr)': { ar: 'أذكار المساء (بعد العصر)', bn: 'সন্ধ্যার যিকর (আসরের পর)' },
    'Back to Categories': { ar: 'العودة للأقسام', bn: 'বিভাগে ফিরে যান' },
    'Situational Dhikr': { ar: 'أذكار المناسبات والأحوال', bn: 'বিভিন্ন অবস্থার দোয়া ও যিকর' },
    'Daily Sunnahs': { ar: 'السنن اليومية', bn: 'দৈনিক সুন্নাহ' },
    'Islamic Jurisprudence (Fiqh)': { ar: 'الفقه الإسلامي', bn: 'ইসলামি ফিকহ' },
    'Salah Guide': { ar: 'دليل الصلاة', bn: 'নামাজ শিক্ষা' },
    'Stories of the Prophets': { ar: 'قصص الأنبياء', bn: 'নবীদের কাহিনী' },
    'Dhikr Collection': { ar: 'مجموعة الأذكار', bn: 'যিকর সংকলন' },
    'Inspirations': { ar: 'إلهامات', bn: 'অনুপ্রেরণা' },
    'The Companions (Sahabah)': { ar: 'الصحابة الكرام', bn: 'সাহাবায়ে কেরাম' },
    'Verify': { ar: 'توثيق', bn: 'যাচাই' },
    'Report': { ar: 'إبلاغ', bn: 'রিপোর্ট' },
    'Fasting Tracker': { ar: 'متابعة الصيام', bn: 'রোজা ট্র্যাকার' },
    'Fasted today?': { ar: 'هل صمت اليوم؟', bn: 'আজ রোজা রেখেছেন?' },
    'fasting days this month': { ar: 'أيام صيام هذا الشهر', bn: 'দিন রোজা এই মাসে' },
    'Daily Gratitude Journal': { ar: 'مفكرة الشكر اليومية', bn: 'দৈনিক কৃতজ্ঞতা ডায়েরি' },
    "Today's entries": { ar: 'تدوينات اليوم', bn: 'আজকের লেখা' },
    'I am grateful for...': { ar: 'أنا شاكر لله على...', bn: 'আমি কৃতজ্ঞ...' },
    'Add Entry': { ar: 'إضافة تدوينة', bn: 'যোগ করুন' },
    'Charity Tracker': { ar: 'متابعة الصدقات', bn: 'দান-সদকা ট্র্যাকার' },
    'Daily target': { ar: 'الهدف اليومي', bn: 'দৈনিক লক্ষ্য' },
    'Monthly target': { ar: 'الهدف الشهري', bn: 'মাসিক লক্ষ্য' },
    'Given this month': { ar: 'المدفوع هذا الشهر', bn: 'এই মাসে দানকৃত' },
    'Not set': { ar: 'غير محدد', bn: 'নির্ধারিত নয়' },
    'Save & Log': { ar: 'حفظ وتسجيل', bn: 'সংরক্ষণ ও লগ করুন' },
    'Hifz & Spaced Repetition': { ar: 'الحفظ والمراجعة المتباعدة', bn: 'হিফজ ও পর্যায়ক্রমিক পুনরাবৃত্তি' },
    'Surahs Memorized': { ar: 'سور محفوظة', bn: 'টি সূরা মুখস্থ' },
    'Due Today': { ar: 'للمراجعة اليوم', bn: 'আজকের পুনরাবৃত্তি' },
    'Add to Hifz Queue': { ar: 'إضافة لقائمة الحفظ', bn: 'হিফজ তালিকায় যোগ করুন' },
    'Review Queue': { ar: 'قائمة المراجعة', bn: 'পুনরাবৃত্তি তালিকা' },
    'Reviewed': { ar: 'تمت المراجعة', bn: 'পুনরাবৃত্তি সম্পন্ন' },
    'Health & Wellness': { ar: 'الصحة والعافية', bn: 'স্বাস্থ্য ও সুস্থতা' },
    'Health Score': { ar: 'مؤشر الصحة', bn: 'স্বাস্থ্য স্কোর' },
    'Water': { ar: 'الماء', bn: 'পানি' },
    'glasses': { ar: 'أكواب', bn: 'গ্লাস' },
    'Sleep': { ar: 'النوم', bn: 'ঘুম' },
    'Hours slept': { ar: 'ساعات النوم', bn: 'ঘুমের ঘণ্টা' },
    'Log Sleep': { ar: 'تسجيل النوم', bn: 'ঘুম লিখুন' },
    'Exercise': { ar: 'الرياضة', bn: 'ব্যায়াম' },
    'Log Exercise': { ar: 'تسجيل الرياضة', bn: 'ব্যায়াম লিখুন' },
    'Meals': { ar: 'الوجبات', bn: 'খাবার' },
    'Breakfast': { ar: 'الفطور', bn: 'সকালের নাশতা' },
    'Lunch': { ar: 'الغداء', bn: 'দুপুরের খাবার' },
    'Dinner': { ar: 'العشاء', bn: 'রাতের খাবার' },
    'Journey Statistics': { ar: 'إحصائيات الرحلات', bn: 'যাত্রার পরিসংখ্যান' },
    'Completed': { ar: 'مكتمل', bn: 'সম্পন্ন' },
    'Extra Deeds': { ar: 'الأعمال الإضافية', bn: 'অতিরিক্ত আমল' },
    'Active': { ar: 'نشط', bn: 'সক্রিয়' },
    'Best Streak': { ar: 'أفضل سلسلة', bn: 'সেরা ধারাবাহিকতা' },
    'Habit Journeys': { ar: 'رحلات العادات', bn: 'অভ্যাস গঠনের যাত্রা' },
    'Active Journey Progress': { ar: 'الرحلات الجارية', bn: 'চলমান যাত্রার অগ্রগতি' },
    'Spiritual Growth': { ar: 'النمو الروحي', bn: 'আধ্যাত্মিক উন্নতি' },
    'Spiritual Growth Features': { ar: 'مظاهر النمو الروحي', bn: 'আধ্যাত্মিক উন্নতির মাধ্যম' },
    'Visible': { ar: 'ظاهر', bn: 'দৃশ্যমান' },
    'Hidden': { ar: 'مخفي', bn: 'লুকানো' },
    'Stage': { ar: 'المرحلة', bn: 'ধাপ' },
    'The Noble Quran': { ar: 'القرآن الكريم', bn: 'পবিত্র আল-কুরআন' },
    'Surahs': { ar: 'السور', bn: 'সূরা সমূহ' },
    'Juz': { ar: 'الأجزاء', bn: 'পারা সমূহ' },
    'verses': { ar: 'آيات', bn: 'আয়াত' },
    'Search surah name...': { ar: 'ابحث عن اسم السورة...', bn: 'সূরার নাম খুঁজুন...' },
    'Back to Surahs': { ar: 'العودة للسور', bn: 'সূরা তালিকায় ফিরে যান' },
    'Back to Juzes': { ar: 'العودة للأجزاء', bn: 'পারা তালিকায় ফিরে যান' },
    'Play Surah': { ar: 'تشغيل السورة', bn: 'সূরা শুনুন' },
    'Play Juz': { ar: 'تشغيل الجزء', bn: 'পারা শুনুন' },
    'Khatam Planner': { ar: 'خطة الختمة', bn: 'খতম পরিকল্পনা' },
    'pages': { ar: 'صفحة', bn: 'পৃষ্ঠা' },
    'Page': { ar: 'صفحة', bn: 'পৃষ্ঠা' },
    'Pages': { ar: 'صفحات', bn: 'পৃষ্ঠা' },
    'days': { ar: 'أيام', bn: 'দিন' },
    'The Hadith Collections': { ar: 'موسوعة الحديث الشريف', bn: 'হাদিস সংকলন' },
    'Back to Collections': { ar: 'العودة للموسوعة', bn: 'সংকলনে ফিরে যান' },
    'Online': { ar: 'متصل', bn: 'অনলাইন' },
    'Zakat Calculator': { ar: 'حاسبة الزكاة', bn: 'যাকাত ক্যালকুলেটর' },
    'Currency': { ar: 'العملة', bn: 'মুদ্রা' },
    'Nisab Standard': { ar: 'معيار النصاب', bn: 'নিসাবের মানদণ্ড' },
    'Calculate Zakat': { ar: 'احسب الزكاة', bn: 'যাকাত হিসাব করুন' },
    'Estimated Zakat (2.5%)': { ar: 'الزكاة المستحقة (٢٫٥٪)', bn: 'আনুমানিক যাকাত (২.৫%)' },
    'Finance & Charity': { ar: 'المالية والصدقات', bn: 'আর্থিক ও দান হিসাব' },
    "Today's Balance": { ar: 'رصيد اليوم', bn: 'আজকের ব্যালেন্স' },
    'Income': { ar: 'الدخل', bn: 'আয়' },
    'Expenses': { ar: 'المصروفات', bn: 'ব্যয়' },
    'Charity': { ar: 'الصدقة', bn: 'দান' },
    'This Week': { ar: 'هذا الأسبوع', bn: 'এই সপ্তাহ' },
    'My Goals': { ar: 'أهدافي', bn: 'আমার লক্ষ্য' },
    'Add Goal': { ar: 'إضافة هدف', bn: 'লক্ষ্য যোগ করুন' },
    'Trophy Cabinet': { ar: 'خزانة الأوسمة', bn: 'সম্মাননা সংগ্রহ' },
    'Unlocked': { ar: 'مفتوح', bn: 'অর্জিত' },
    'Rewards Shop': { ar: 'متجر المظاهر والألقاب', bn: 'পুরস্কার ও থিম' },
    'XP Available': { ar: 'نقطة متاحة', bn: 'এক্সপি উপলব্ধ' },
    'Owned': { ar: 'مملوك', bn: 'অর্জিত' },
    'Total Prayers': { ar: 'مجموع الصلوات', bn: 'মোট নামাজ' },
    'Current Streak': { ar: 'السلسلة الحالية', bn: 'বর্তমান ধারাবাহিকতা' },
    'Perfect Days': { ar: 'أيام كاملة', bn: 'পরিপূর্ণ দিন' },
    'Weekly Comparison': { ar: 'المقارنة الأسبوعية', bn: 'সাপ্তাহিক তুলনা' },
    'All': { ar: 'الكل', bn: 'সব' },
    'Sun': { ar: 'الأحد', bn: 'রবি' },
    'Mon': { ar: 'الإثنين', bn: 'সোম' },
    'Tue': { ar: 'الثلاثاء', bn: 'মঙ্গল' },
    'Wed': { ar: 'الأربعاء', bn: 'বুধ' },
    'Thu': { ar: 'الخميس', bn: 'বৃহঃ' },
    'Fri': { ar: 'الجمعة', bn: 'শুক্র' },
    'Sat': { ar: 'السبت', bn: 'শনি' },
    '5 prayers': { ar: '٥ صلوات', bn: '৫ ওয়াক্ত' },
    'Some prayers': { ar: 'بعض الصلوات', bn: 'কিছু ওয়াক্ত' },
    'Missed': { ar: 'فائتة', bn: 'বাদ পড়েছে' },
    'Settings & Preferences': { ar: 'الإعدادات والتفضيلات', bn: 'সেটিংস ও পছন্দসমূহ' },
    'Language & Script': { ar: 'اللغة والخط', bn: 'ভাষা ও লিপি' },
    'Theme & Appearance': { ar: 'المظهر والألوان', bn: 'থিম ও চেহারা' },
    'Privacy Dashboard': { ar: 'لوحة الخصوصية', bn: 'গোপনীয়তা ড্যাশবোর্ড' },
    'Danger Zone': { ar: 'منطقة الخطر', bn: 'সতর্কতা অঞ্চল' },
    'Daily Reflection': { ar: 'محاسبة اليوم', bn: 'দৈনিক আত্মসমালোচনা' },
    'Weekly Reflection': { ar: 'المحاسبة الأسبوعية', bn: 'সাপ্তাহিক আত্মসমালোচনা' },
    'Weekly Summary': { ar: 'الملخص الأسبوعي', bn: 'সাপ্তাহিক সারসংক্ষেপ' },
    'Sign In / Unlock': { ar: 'تسجيل الدخول / فتح القفل', bn: 'সাইন ইন / আনলক' },
    'Unlock & Enter App': { ar: 'فتح القفل والدخول', bn: 'আনলক করে প্রবেশ করুন' },
    'Profiles & Accounts': { ar: 'الملفات والحسابات', bn: 'প্রোফাইল ও অ্যাকাউন্ট' },
    'Security & PIN': { ar: 'الأمان والرمز السري', bn: 'নিরাপত্তা ও পিন' },
    'Choose Your Avatar': { ar: 'اختر الرمز الشخصي', bn: 'আপনার আইকন বেছে নিন' },
    'Guest': { ar: 'زائر', bn: 'অতিথি' },
    'Member since': { ar: 'عضو منذ', bn: 'সদস্য' },
    'Total XP': { ar: 'مجموع النقاط', bn: 'মোট এক্সপি' },
    'Achievements': { ar: 'الإنجازات', bn: 'অর্জনসমূহ' },
    'Achievement Showcase': { ar: 'معرض الإنجازات', bn: 'সেরা অর্জন প্রদর্শনী' },
    'Bangla Glossary Terms': { ar: 'مصطلحات البنغالية', bn: 'বাংলা পরিভাষা' },
    'Numeral Digits': { ar: 'نوع الأرقام', bn: 'সংখ্যার ধরন' },
    'Seasonal Gold Accent Overlay': { ar: 'إضاءة المواسم الذهبية', bn: 'মৌসুমি সোনালি আবহ' },
    'Script & UI Text Scale': { ar: 'حجم الخط والواجهة', bn: 'লেখার ও লিপির আকার' },
    'UI Sound Chimes (Calm default: Off)': { ar: 'أصوات التفاعل (الافتراضي: صامت)', bn: 'সাউন্ড ইফেক্ট (ডিফল্ট: নীরব)' },
    'Sound On': { ar: 'الصوت مفعّل', bn: 'শব্দ চালু' },
    'Muted': { ar: 'صامت', bn: 'নীরব' },
    'Hijri Crescent Sighting Adjustment': { ar: 'تعديل رؤية الهلال الهجري', bn: 'হিজরি চাঁদ দেখা সমন্বয়' },
    'Prayer Reminders & Quiet Hours': { ar: 'تنبيهات الصلاة وساعات الهدوء', bn: 'নামাজের রিমাইন্ডার ও নীরব সময়' },
    'Enable Reminders': { ar: 'تفعيل التذكيرات', bn: 'রিমাইন্ডার চালু করুন' },
    'Disable Reminders': { ar: 'تعطيل التذكيرات', bn: 'রিমাইন্ডার বন্ধ করুন' },
    'Export JSON': { ar: 'تصدير JSON', bn: 'JSON সংরক্ষণ' },
    'Restore JSON': { ar: 'استعادة JSON', bn: 'JSON পুনরুদ্ধার' },
    'PIN Protected': { ar: 'محمي برمز PIN', bn: 'পিন সুরক্ষিত' },
    'Open Local Profile': { ar: 'ملف محلي مفتوح', bn: 'স্থানীয় প্রোফাইল' },
    'Switch Profile': { ar: 'تبديل الملف', bn: 'প্রোফাইল বদলান' },
    'Change PIN': { ar: 'تغيير الرمز', bn: 'পিন পরিবর্তন' },
    'Set PIN': { ar: 'تعيين رمز', bn: 'পিন সেট করুন' },
    'Lock Now': { ar: 'قفل الآن', bn: 'লক করুন' },
    'Switch / Lock Session': { ar: 'تبديل أو قفل الجلسة', bn: 'সেশন বদলান / লক করুন' },
    'Sources, Design System & Support': { ar: 'المصادر ونظام التصميم والدعم', bn: 'উৎস, ডিজাইন সিস্টেম ও সহায়তা' },
    "What's New": { ar: 'ما الجديد', bn: 'নতুন সংস্করণ' },
    'Privacy Policy': { ar: 'سياسة الخصوصية', bn: 'গোপনীয়তা নীতি' },
    'Reset Profile': { ar: 'إعادة ضبط الملف', bn: 'প্রোফাইল রিসেট করুন' },
    'Delete All Data': { ar: 'حذف جميع البيانات', bn: 'সব ডেটা মুছুন' },
    'Gold Owned (grams)': { ar: 'الذهب المملوك (جرام)', bn: 'মজুত স্বর্ণ (গ্রাম)' },
    'Silver Owned (grams)': { ar: 'الفضة المملوكة (جرام)', bn: 'মজুত রূপা (গ্রাম)' },
    'Cash & Savings': { ar: 'النقد والمدخرات', bn: 'নগদ ও সঞ্চয়' },
    'Investments & Shares': { ar: 'الاستثمارات والأسهم', bn: 'বিনিয়োগ ও শেয়ার' },
    'Business Inventory': { ar: 'عروض التجارة', bn: 'ব্যবসায়িক পণ্য' },
    'Receivables Owed to You': { ar: 'الديون المرجوة السداد', bn: 'পাওনা টাকা' },
    'Short-Term Liabilities Due': { ar: 'الالتزامات الحالة', bn: 'পরিশোধযোগ্য স্বল্পমেয়াদী ঋণ' },
    'Gold Price': { ar: 'سعر الذهب', bn: 'স্বর্ণের দাম' },
    'Silver Price': { ar: 'سعر الفضة', bn: 'রূপার দাম' },
    'Total Assets': { ar: 'مجموع الأصول', bn: 'মোট সম্পদ' },
    'Net Zakatable Wealth': { ar: 'صافي المال الخاضع للزكاة', bn: 'যাকাতযোগ্য নিট সম্পদ' },
    'Active Nisab': { ar: 'النصاب المعتمد', bn: 'প্রযোজ্য নিসাব' },
    'Makki': { ar: 'مكية', bn: 'মাক্কি' },
    'Madani': { ar: 'مدنية', bn: 'মাদানি' },
    'meccan': { ar: 'مكية', bn: 'মাক্কি' },
    'medinan': { ar: 'مدنية', bn: 'মাদানি' },
    'Meccan': { ar: 'مكية', bn: 'মাক্কি' },
    'Medinan': { ar: 'مدنية', bn: 'মাদানি' },
    'Makkan': { ar: 'مكية', bn: 'মাক্কি' },
    'Tap a surah to enter reading sanctuary': { ar: 'اختر سورة لبدء القراءة بتدبّر', bn: 'পড়ার জন্য যেকোনো সূরায় ট্যাপ করুন' },
    'pg/day': { ar: 'ص/يوم', bn: 'পৃ./দিন' },
    'd': { ar: 'ي', bn: 'দিন' },
    'D': { ar: 'ي', bn: 'দিন' },
    'Best': { ar: 'الأفضل', bn: 'সর্বোচ্চ' },
    'Lv': { ar: 'مستوى', bn: 'স্তর' },
    'Gentle Start': { ar: 'بداية هادئة', bn: 'শান্ত সূচনা' },
    'Seeker': { ar: 'طالب', bn: 'অন্বেষী' },
    'Traveler': { ar: 'مسافر', bn: 'পথিক' },
    'Devotee': { ar: 'عابد', bn: 'সাধক' },
    'Worshipper': { ar: 'قانت', bn: 'ইবাদতকারী' },
    'Steadfast': { ar: 'ثابت', bn: 'অবিচল' },
    'Radiant': { ar: 'منير', bn: 'উজ্জ্বল' },
    'Guide': { ar: 'مرشد', bn: 'দিশারি' },
    'Luminary': { ar: 'سراج', bn: 'আলোকবর্তিকা' },
    'Guardian': { ar: 'حافظ', bn: 'অভিভাবক' },
    'completion': { ar: 'إكمال', bn: 'সম্পন্ন' },
    'rate': { ar: 'المعدل', bn: 'হার' },
    'to next': { ar: 'للمستوى التالي', bn: 'পরবর্তী স্তর' },
    'Quest XP': { ar: 'نقاط المهام', bn: 'কোয়েস্ট এক্সপি' },
    'Activity History': { ar: 'سجل النشاط', bn: 'কার্যক্রমের ইতিহাস' },
    'Prayer Consistency (%)': { ar: 'الانتظام في الصلاة (%)', bn: 'নামাজের ধারাবাহিকতা (%)' },
    'Deed Distribution': { ar: 'توزيع الأعمال', bn: 'আমলের বিভাজন' },
    'Perfect Days by Month': { ar: 'الأيام الكاملة شهريًا', bn: 'মাসিক পরিপূর্ণ দিন' },
    'XP Progression': { ar: 'تقدم النقاط', bn: 'এক্সপি অগ্রগতি' },
    'Content Consumed': { ar: 'المحتوى المقروء', bn: 'পঠিত বিষয়বস্তু' },
    'Start tracking to see insights': { ar: 'ابدأ التسجيل لعرض الإحصاءات', bn: 'বিশ্লেষণ দেখতে আমল ট্র্যাক করা শুরু করুন' },
    'No data for this period': { ar: 'لا توجد بيانات لهذه الفترة', bn: 'এই সময়ের কোনো তথ্য নেই' },
    'prayers': { ar: 'صلوات', bn: 'ওয়াক্ত' },
    'All Prayers': { ar: 'جميع الصلوات', bn: 'সকল নামাজ' },
    'Cumulative XP': { ar: 'مجموع النقاط التراكمي', bn: 'ক্রমবর্ধমান এক্সপি' },
    'Duas': { ar: 'الأدعية', bn: 'দোয়া' },
    'Quran Verses': { ar: 'آيات القرآن', bn: 'কুরআনের আয়াত' },
    'Sunnah': { ar: 'السنن', bn: 'সুন্নাহ' },
    'Dhikr': { ar: 'الذكر', bn: 'জিকির' },
    'Stories': { ar: 'القصص', bn: 'গল্প' },
    'Hadiths': { ar: 'الأحاديث', bn: 'হাদিস' },
    'Names of Allah': { ar: 'أسماء الله الحسنى', bn: 'আল্লাহর নামসমূহ' },
    'Sins': { ar: 'المحذورات', bn: 'গুনাহ পরিহার' },
    'Seerah': { ar: 'السيرة', bn: 'সীরাত' },
    'Tafsir': { ar: 'التفسير', bn: 'তাফসির' },
    'Manners': { ar: 'الآداب', bn: 'আদব-কায়দা' },
    'Prophets': { ar: 'الأنبياء', bn: 'নবী-রাসূল' },
    'Scholars': { ar: 'العلماء', bn: 'আলেমগণ' },
    'Jannah': { ar: 'الجنة', bn: 'জান্নাত' },
    'worship': { ar: 'عبادة', bn: 'ইবাদত' },
    'character': { ar: 'أخلاق', bn: 'চরিত্র' },
    'charity': { ar: 'صدقة', bn: 'দান-সদকা' },
    'health': { ar: 'صحة', bn: 'স্বাস্থ্য' },
    'family': { ar: 'أسرة', bn: 'পরিবার' },
    'spiritual': { ar: 'روحاني', bn: 'আধ্যাত্মিক' },
    'other': { ar: 'أخرى', bn: 'অন্যান্য' },
    'Milestone Unlocked': { ar: 'تم فتح إنجاز مرحلي', bn: 'মাইলফলক অর্জিত' },
    '7-Day Warrior': { ar: 'مثابر ٧ أيام', bn: '৭ দিনের সংগ্রামী' },
    '2-Week Champion': { ar: 'بطل الأسبوعين', bn: '২ সপ্তাহের চ্যাম্পিয়ন' },
    'Monthly Master': { ar: 'متقن الشهر', bn: 'মাসিক দক্ষ' },
    'Diamond Devotee': { ar: 'عابد ماسي', bn: 'ডায়মন্ড সাধক' },
    'Century King': { ar: 'متوج المئة يوم', bn: 'শতবর্ষের রাজা' },
    'Lunar Legend': { ar: 'أسطورة ٢٠٠ يوم', bn: 'চন্দ্র কিংবদন্তি' },
    'Annual Elite': { ar: 'نخبة العام الكامل', bn: 'বার্ষিক সেরা' },
    'Assalamu Alaikum! Welcome to Ibadah Quest.': { ar: 'السلام عليكم! أهلاً بك في عبادة كويست.', bn: 'আসসালামু আলাইকুম! ইবাদাহ কোয়েস্টে স্বাগতম।' },
    'Zakat is 2.5% on net zakatable wealth held above the nisab threshold for one lunar year (Hawl). Choose your local currency and enter current local bullion prices from a trusted jeweler or central bank.': { ar: 'الزكاة ٢.٥٪ من صافي المال البالغ للنصاب بعد مرور حول هجري كامل. اختر عملتك المحلية وأدخل أسعار الذهب والفضة الحالية من مصدر موثوق.', bn: 'একটি হিজরি বছর (হাওল) পূর্ণ হলে নিসাব পরিমাণ নিট সম্পদের ওপর ২.৫% যাকাত ফরজ। আপনার মুদ্রা নির্বাচন করুন এবং নির্ভরযোগ্য বাজারদর অনুযায়ী বর্তমান স্বর্ণ ও রূপার মূল্য লিখুন।' },
    'Silver (612.36g — Hanafi / Most Helpful to Poor)': { ar: 'الفضة (٦١٢.٣٦ جم — الحنفي / الأنفع للفقراء)', bn: 'রূপা (৬১২.৩৬ গ্রাম — হানাফি / দরিদ্রদের জন্য অধিক সহায়ক)' },
    'Gold (87.48g — Majority Alternate)': { ar: 'الذهب (٨٧.٤٨ جم — البديل عند الجمهور)', bn: 'স্বর্ণ (৮৭.৪৮ গ্রাম — বিকল্প মানদণ্ড)' },
    "Note: Pre-filled metal rates are editable estimates only; verify today's local gold/silver rate and consult a scholar for complex assets (retirement accounts, jewelry differing by madhab).": { ar: 'ملاحظة: الأسعار الافتراضية للمعادن تقديرية ويمكن تعديلها؛ يرجى التحقق من السعر المحلي اليوم واستشارة أهل العلم للأصول المركبة.', bn: 'দ্রষ্টব্য: প্রদর্শিত ধাতুর দাম আনুমানিক ও পরিবর্তনযোগ্য; অনুগ্রহ করে আজকের স্থানীয় বাজারদর যাচাই করুন এবং জটিল সম্পদের ক্ষেত্রে আলেমের পরামর্শ নিন।' },
    'Silver 612.36g': { ar: 'الفضة ٦١٢.٣٦ جم', bn: 'রূপা ৬১২.৩৬ গ্রাম' },
    'Gold 87.48g': { ar: 'الذهب ٨٧.৪৮ جم', bn: 'স্বর্ণ ৮৭.৪৮ গ্রাম' },
    'Estimated Zakat (2.5%)': { ar: 'الزكاة المستحقة (٢.٥٪)', bn: 'আনুমানিক যাকাত (২.৫%)' },
    'Net wealth is below the selected nisab threshold — Zakat is not obligatory.': { ar: 'صافي المال دون النصاب المحدد — لا تجب فيه الزكاة.', bn: 'নিট সম্পদ নির্বাচিত নিসাবের নিচে — যাকাত ফরজ নয়।' },
    'Noor & Rhythm Design System Gallery': { ar: 'معرض نظام تصميم «نور وإيقاع»', bn: 'নূর ও রিদম ডিজাইন সিস্টেম গ্যালারি' },
    'Interactive Token & Script Preview': { ar: 'معاينة الألوان والخطوط التفاعلية', bn: 'ইন্টারেক্টিভ টোকেন ও লিপি প্রিভিউ' },
    'WCAG 2.2 AA Token Swatches': { ar: 'ألوان متوافقة مع معيار WCAG 2.2 AA', bn: 'WCAG 2.2 AA কালার সোয়াচ' },
    'Multi-Script Typography & Harakat / Conjunct Safety': { ar: 'الخطوط متعددة اللغات وسلامة التشكيل', bn: 'বহুভাষিক টাইপোগ্রাফি ও যুক্তাক্ষর সুরক্ষা' },
    'Buttons, Toggles & Interactive States': { ar: 'الأزرار والمفاتيح وحالات التفاعل', bn: 'বাটন, টগল ও ইন্টারেক্টিভ অবস্থা' },
    'System States: Loading, Empty, Offline & Error': { ar: 'حالات النظام: التحميل والفراغ والانقطاع والخطأ', bn: 'সিস্টেম অবস্থা: লোডিং, খালি, অফলাইন ও ত্রুটি' },
    'Light': { ar: 'فاتح', bn: 'লাইট' },
    'Dark': { ar: 'داكن', bn: 'ডার্ক' },
    'OLED Night': { ar: 'ليلي OLED', bn: 'OLED নাইট' },
    'System': { ar: 'النظام', bn: 'সিস্টেম' },
    'Canvas': { ar: 'الخلفية', bn: 'ক্যানভাস' },
    'Surface': { ar: 'البطاقة', bn: 'সারফেস' },
    'Emerald': { ar: 'الزمردي', bn: 'এমেরাল্ড' },
    'Gold': { ar: 'الذهبي', bn: 'গোল্ড' },
    'Complete': { ar: 'مكتمل', bn: 'সম্পন্ন' },
    'Primary Action': { ar: 'إجراء رئيسي', bn: 'প্রধান বাটন' },
    'Secondary Action': { ar: 'إجراء ثانوي', bn: 'সহায়ক বাটন' },
    'Disabled State': { ar: 'حالة معطلة', bn: 'নিষ্ক্রিয় অবস্থা' },
    'Dialog Demo': { ar: 'نموذج تأكيد', bn: 'ডায়ালগ ডেমো' },
    'Primary action pressed': { ar: 'تم تفعيل الإجراء الرئيسي', bn: 'প্রধান বাটন চাপানো হয়েছে' },
    'Secondary action pressed': { ar: 'تم تفعيل الإجراء الثانوي', bn: 'সহায়ক বাটন চাপানো হয়েছে' },
    'Confirm Action': { ar: 'تأكيد الإجراء', bn: 'কাজ নিশ্চিত করুন' },
    'Sample safe confirm dialog?': { ar: 'نموذج حوار تأكيد تجريبي؟', bn: 'নিরাপদ নিশ্চিতকরণ ডায়ালগ নমুনা?' },
    'Confirmed': { ar: 'تم التأكيد', bn: 'নিশ্চিত হয়েছে' },
    'Loading Skeleton': { ar: 'هيكل التحميل', bn: 'লোডিং স্কেলিটন' },
    'Empty State': { ar: 'حالة فارغة', bn: 'খালি অবস্থা' },
    'No saved bookmarks yet': { ar: 'لا توجد إشارات مرجعية محفوظة بعد', bn: 'এখনো কোনো বুকমার্ক সংরক্ষিত নেই' },
    'Tap the bookmark star on any Surah or Dua.': { ar: 'اضغط على نجمة الحفظ في أي سورة أو دعاء.', bn: 'যেকোনো সূরা বা দোয়ায় বুকমার্ক তারকায় ট্যাপ করুন।' },
    'Offline State': { ar: 'وضع عدم الاتصال', bn: 'অফলাইন অবস্থা' },
    'Using offline Adhan prayer times & local database cleanly.': { ar: 'استخدام أوقات الصلاة المحسوبة محليًا وقاعدة البيانات دون اتصال.', bn: 'ইন্টারনেট ছাড়াই স্থানীয় নামাজের সময় ও ডাটাবেস ব্যবহৃত হচ্ছে।' },
    'Error / Permission Denied': { ar: 'خطأ / تم رفض الإذن', bn: 'ত্রুটি / অনুমতি মেলেনি' },
    'Location permission declined — choose any city preset manually.': { ar: 'تم رفض إذن الموقع — اختر أي مدينة يدويًا من القائمة.', bn: 'লোকেশনের অনুমতি মেলেনি — তালিকা থেকে যেকোনো শহর বেছে নিন।' }
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

  function _syncStaticLabels() {
    if (typeof document === 'undefined') return;
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
  }

  function iqSetLang(lang) {
    if (['en', 'ar', 'bn'].indexOf(lang) === -1) lang = 'en';
    I18N.lang = lang;
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
    if (typeof S !== 'undefined' && S) { S.lang = lang; if (typeof saveState === 'function') saveState(); }
    applyDomLanguage(lang);
    _syncStaticLabels();
    var activeBtn = document.querySelector('.bnav-btn.active');
    var activeCat = (activeBtn && activeBtn.getAttribute('data-cat')) || (typeof S !== 'undefined' && S && S.lastCat) || 'ibadah';
    var prevTab = (typeof document !== 'undefined' && document.body && typeof document.body.getAttribute === 'function' && document.body.getAttribute('data-active-tab')) || (typeof S !== 'undefined' && S && S.lastTab) || 'today';
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
      if (prevTab && window.App && typeof window.App.activateTab === 'function') {
        window.App.activateTab(prevTab);
      } else if (window.renderProfile) {
        window.renderProfile();
      }
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
    _syncStaticLabels();
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
