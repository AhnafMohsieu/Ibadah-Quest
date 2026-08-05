const DHIKR_POOL = [
  { arabic:"سُبْحَانَ اللَّهِ (33x)", roman:"SubhanAllah", english:"Glory be to Allah", source:"Sahih Muslim 597" },
  { arabic:"الْحَمْدُ لِلَّهِ (33x)", roman:"Alhamdulillah", english:"All praise is for Allah", source:"Sahih Muslim 597" },
  { arabic:"اللَّهُ أَكْبَرُ (34x)", roman:"Allahu Akbar", english:"Allah is the Greatest", source:"Sahih Muslim 597" },
  { arabic:"لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ", roman:"La ilaha illallah wahdahu la sharika lahu, lahul-mulku wa lahul-hamdu wa Huwa 'ala kulli shay'in Qadir", english:"There is no god but Allah, alone, without partner. To Him belongs dominion and to Him belongs praise and He is over all things competent.", source:"Sahih al-Bukhari 3293" },
  { arabic:"سُبْحَانَ اللَّهِ وَبِحَمْدِهِ سُبْحَانَ اللَّهِ الْعَظِيمِ", roman:"SubhanAllahi wa bihamdihi, SubhanAllahil-Adheem", english:"Glory be to Allah and His praise, glory be to Allah the Magnificent", source:"Sahih al-Bukhari 6406" },
  { arabic:"أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ", roman:"Astaghfirullahal-Adheem alladhi la ilaha illa Huwal-Hayyul-Qayyum wa atubu ilayh", english:"I seek forgiveness from Allah the Magnificent, there is no god but He, the Ever-Living, the Sustainer, and I repent to Him.", source:"Sahih al-Bukhari 6307" },
  { arabic:"لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ", roman:"La hawla wa la quwwata illa billah", english:"There is no power and no strength except with Allah (Hawqala)", source:"Sahih al-Bukhari 6384" },
  { arabic:"اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ", roman:"Allahumma salli wa sallim 'ala nabiyyina Muhammad", english:"O Allah, send blessings and peace upon our Prophet Muhammad ﷺ", source:"Sahih al-Bukhari 3370" },
  { arabic:"حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ", roman:"HasbunAllahu wa ni'mal-Wakil", english:"Sufficient for us is Allah and [He is] the best Disposer of affairs", source:"Al-Imran 3:173" },
  { arabic:"سُبْحَانَ اللَّهِ وَبِحَمْدِهِ (100x)", roman:"SubhanAllahi wa bihamdihi", english:"Glory be to Allah and His praise — 100 times erases sins like the foam of the sea", source:"Sahih al-Bukhari 6405" }
];

const DHIKR_COUNTER_DATA = [
  { arabic:"سُبْحَانَ اللَّهِ", transliteration:"SubhanAllah", english:"Glory be to Allah", target:33, color:"#10b981" },
  { arabic:"الْحَمْدُ لِلَّهِ", transliteration:"Alhamdulillah", english:"All praise is for Allah", target:33, color:"#f59e0b" },
  { arabic:"اللَّهُ أَكْبَرُ", transliteration:"Allahu Akbar", english:"Allah is the Greatest", target:34, color:"#D4AF37" },
  { arabic:"أَسْتَغْفِرُ اللَّه", transliteration:"Astaghfirullah", english:"I seek forgiveness from Allah", target:100, color:"#8b5cf6" },
  { arabic:"لَا إِلَهَ إِلَّا اللَّه", transliteration:"La ilaha illallah", english:"There is no god but Allah", target:100, color:"#06b6d4" },
  { arabic:"اللَّهُمَّ صَلِّ عَلَى مُحَمَّد", transliteration:"Allahumma salli ala Muhammad", english:"O Allah, send blessings upon Muhammad", target:100, color:"#ec4899" },
  { arabic:"سُبْحَانَ اللَّهِ وَبِحَمْدِهِ", transliteration:"SubhanAllahi wa bihamdihi", english:"Glory and praise be to Allah", target:100, color:"#22c55e" },
  { arabic:"لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّه", transliteration:"La hawla wa la quwwata illa billah", english:"No power except with Allah", target:33, color:"#f97316" }
];

const DHIKR_BADGES = [
  { id: 'first_dhikr', name: 'First Dhikr', check: (S) => Object.keys(S.dhikrStats?.daily || {}).length > 0 },
  { id: 'first_target', name: 'Target Reached', check: (S) => Object.values(S.dhikrStats?.total || {}).some(c => c >= 33) },
  { id: 'streak_3', name: '3-Day Streak', check: (S) => (S.dhikrStats?.streak || 0) >= 3 },
  { id: 'streak_7', name: '7-Day Streak', check: (S) => (S.dhikrStats?.streak || 0) >= 7 },
  { id: 'streak_30', name: '30-Day Streak', check: (S) => (S.dhikrStats?.streak || 0) >= 30 },
  { id: 'total_100', name: '100 Total Dhikrs', check: (S) => Object.values(S.dhikrStats?.total || {}).reduce((a, b) => a + b, 0) >= 100 },
  { id: 'total_1000', name: '1000 Total Dhikrs', check: (S) => Object.values(S.dhikrStats?.total || {}).reduce((a, b) => a + b, 0) >= 1000 }
];