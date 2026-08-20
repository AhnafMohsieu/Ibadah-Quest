// data/relatable-dhikr.js
// Situational dhikr organized by emotional/spiritual need

const SITUATIONAL_DHIKR = {
  patience: {
    label: 'Patience',
    icon: 'clock',
    dhikr: [
      { arabic: 'إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ', roman: 'Inna lillahi wa inna ilayhi raji\'un.', english: 'Indeed we belong to Allah, and indeed to Him we will return.', source: 'Baqarah 2:156' },
      { arabic: 'اللَّهُمَّ أَجِرْنِي مِنْ الْعَذَابِ', roman: 'Allahumma ajirni min al-\'adhab.', english: 'O Allah, protect me from the punishment.', source: 'Sahih Muslim' },
      { arabic: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ', roman: 'Hasbunallahu wa ni\'mal wakeel.', english: 'Allah is sufficient for us, and the best Disposer of affairs.', source: 'Aal-e-Imran 3:173' },
      { arabic: 'لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا', roman: 'La yukallifullahu nafsan illa wus\'aha.', english: 'Allah does not burden a soul beyond that it can bear.', source: 'Baqarah 2:286' },
      { arabic: 'وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ', roman: 'Wa man yatawakkal \'alallahi fa huwa hasbuhu.', english: 'And whoever relies upon Allah, then He is sufficient for him.', source: 'Talaq 65:3' }
    ]
  },
  gratitude: {
    label: 'Gratitude',
    icon: 'sparkles',
    dhikr: [
      { arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', roman: 'Alhamdulillahi rabbil \'alameen.', english: 'All praise is due to Allah, Lord of the worlds.', source: 'Fatiha 1:2' },
      { arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ', roman: 'Allahumma salli \'ala Muhammad.', english: 'O Allah, send blessings upon Muhammad.', source: 'Sahih Muslim' },
      { arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', roman: 'Subhanallahi wa bihamdihi.', english: 'Glory be to Allah and praise Him.', source: 'Sahih Muslim 2694' },
      { arabic: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ', roman: 'La ilaha illallahu wahdahu la sharika lahu.', english: 'None has the right to be worshipped but Allah alone, Who has no partner.', source: 'Sahih Bukhari 6403' }
    ]
  },
  forgiveness: {
    label: 'Forgiveness',
    icon: 'heart',
    dhikr: [
      { arabic: 'أَسْتَغْفِرُ اللَّهَ', roman: 'Astaghfirullah.', english: 'I seek forgiveness from Allah.', source: 'Sahih Bukhari' },
      { arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لا إِلَهَ إِلا أَنْتَ', roman: 'Allahumma anta Rabbi la ilaha illa anta.', english: 'O Allah, You are my Lord, none has the right to be worshipped but You.', source: 'Sahih Bukhari 6306' },
      { arabic: 'رَبَّنَا ظَلَمْنَا أَنْفُسَنَا', roman: 'Rabbana zalamna anfusana.', english: 'Our Lord, we have wronged ourselves.', source: 'Aal-e-Imran 3:135' },
      { arabic: 'رَبِّ اغْفِرْ لِي وَتُبْ عَلَيَّ', roman: 'Rabbi-ghfir li wa tub \'alayya.', english: 'My Lord, forgive me and accept my repentance.', source: 'Baqarah 2:286' }
    ]
  },
  protection: {
    label: 'Protection',
    icon: 'shield',
    dhikr: [
      { arabic: 'آيَتُ الْكُرْسِيِّ', roman: 'Ayat al-Kursi (2:255)', english: 'Allah! There is no deity except Him, the Ever-Living, the Sustainer of existence.', source: 'Baqarah 2:255' },
      { arabic: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ', roman: 'Qul a\'udhu bi rabbil-falaq.', english: 'Say, "I seek refuge in the Lord of daybreak."', source: 'Falaq 113:1' },
      { arabic: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ', roman: 'Qul a\'udhu bi rabbinnas.', english: 'Say, "I seek refuge in the Lord of mankind."', source: 'Nas 114:1' },
      { arabic: 'بِسْمِ اللَّهِ الَّذِي لا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ', roman: 'Bismillahil-ladhi la yadurru ma\'as-mihi shai\'un.', english: 'In the name of Allah with Whose name nothing can cause harm.', source: 'Abu Dawud 5088' },
      { arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ الْهَمِّ وَالْحَزَنِ', roman: 'Allahumma inni a\'udhu bika minal-hammi wal-hazan.', english: 'O Allah, I seek refuge in You from anxiety and sorrow.', source: 'Sahih Bukhari 6313' }
    ]
  },
  guidance: {
    label: 'Guidance',
    icon: 'map',
    dhikr: [
      { arabic: 'رَبِّ زِدْنِي عِلْمًا', roman: 'Rabbi zidni \'ilman.', english: 'My Lord, increase me in knowledge.', source: 'Taha 20:114' },
      { arabic: 'اللَّهُمَّ شَرَّحْ لِي صَدْرِي', roman: 'Allahumma sharrah li sadri.', english: 'O Allah, expand for me my chest.', source: 'Taha 20:25' },
      { arabic: 'رَبَّنَا لَا تُزِغْ قُلُوبَنَا', roman: 'Rabbana la tuzigh qulubana.', english: 'Our Lord, let not our hearts deviate.', source: 'Aal-e-Imran 3:8' },
      { arabic: 'رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي', roman: 'Rabbi ishrah li sadri wa yassir li amri.', english: 'My Lord, expand my chest and ease my task.', source: 'Taha 20:25-26' }
    ]
  },
  love: {
    label: 'Love',
    icon: 'heart',
    dhikr: [
      { arabic: 'اللَّهُمَّ حَبِّبْ إِلَيْنَا الْإِيمَانَ', roman: 'Allahumma habbib ilaynal-iman.', english: 'O Allah, make faith beloved to us.', source: 'Sahih Muslim' },
      { arabic: 'رَبِّ إِنِّي لِمَا أَنزَلْتَ إِلَيَّ مِنْ خَيْرٍ فَقِيرٌ', roman: 'Rabbi inni lima anzalta ilayya min khayrin faqeer.', english: 'My Lord, indeed I am, for whatever good You would send down to me, in need.', source: 'Qasas 28:24' },
      { arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ حُبَّكَ', roman: 'Allahumma inni as\'aluka hubbak.', english: 'O Allah, I ask You for Your love.', source: 'Sunan al-Nasa\'i' },
      { arabic: 'وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا', roman: 'Wa min ayatihi an khalaq lakum min anfusikum azwajan.', english: 'And of His signs is that He created for you from yourselves mates.', source: 'Rum 30:21' }
    ]
  },
  fear: {
    label: 'Fear & Anxiety',
    icon: 'alert-triangle',
    dhikr: [
      { arabic: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ', roman: 'Hasbunallahu wa ni\'mal wakeel.', english: 'Allah is sufficient for us, and the best Disposer of affairs.', source: 'Aal-e-Imran 3:173' },
      { arabic: 'لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ', roman: 'La ilaha illa anta subhanaka.', english: 'None has the right to be worshipped but You, Glory be to You.', source: 'Abu Dawud 5090' },
      { arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ الْكُفْرِ', roman: 'Allahumma inni a\'udhu bika minal-kufri.', english: 'O Allah, I seek refuge in You from disbelief.', source: 'Sahih Bukhari' },
      { arabic: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ', roman: 'Ala bi dhikrillahi tatma\'innul-qulub.', english: 'Verily, in the remembrance of Allah do hearts find rest.', source: 'Ra\'d 13:28' }
    ]
  },
  hope: {
    label: 'Hope',
    icon: 'sunrise',
    dhikr: [
      { arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً', roman: 'Rabbana atina fid-dunya hasanatan.', english: 'Our Lord, give us good in this world.', source: 'Baqarah 2:201' },
      { arabic: 'لَا تَحْزَنْ إِنَّ اللَّهَ مَعَنَا', roman: 'La tahzan innallaha ma\'ana.', english: 'Do not grieve; indeed Allah is with us.', source: 'Tawbah 9:40' },
      { arabic: 'وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَى', roman: 'Wa lasawfa yu\'tika rabbuka fatarda.', english: 'And your Lord is going to give you, and you will be satisfied.', source: 'Duha 93:5' },
      { arabic: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا', roman: 'Inna ma\'al-usri yusra.', english: 'Indeed, with hardship comes ease.', source: 'Inshirah 94:6' }
    ]
  },
  sleep: {
    label: 'Sleep & Rest',
    icon: 'moon',
    dhikr: [
      { arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا', roman: 'Bismika Allahumma amutu wa ahya.', english: 'In Your name, O Allah, I die and I live.', source: 'Sahih Bukhari 6324' },
      { arabic: 'اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ', roman: 'Allahumma qini \'adhabaka yawma tab\'athu \'ibadak.', english: 'O Allah, protect me from Your punishment on the Day You resurrect Your servants.', source: 'Abu Dawud 5088' },
      { arabic: 'سُبْحَانَ اللَّهِ', roman: 'SubhanAllah (33x)', english: 'Glory be to Allah.', source: 'Sahih Bukhari 6314' },
      { arabic: 'الْحَمْدُ لِلَّهِ', roman: 'Alhamdulillah (33x)', english: 'All praise is for Allah.', source: 'Sahih Bukhari 6314' }
    ]
  },
  travel: {
    label: 'Travel',
    icon: 'map',
    dhikr: [
      { arabic: 'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا', roman: 'Subhanalladhi sakhkhara lana hadha.', english: 'Glory be to Him who has subjected this to us.', source: 'Zukhruf 43:13' },
      { arabic: 'اللَّهُ أَكْبَرُ', roman: 'Allahu Akbar (4x)', english: 'Allah is the Greatest.', source: 'Sahih Muslim 1342' },
      { arabic: 'اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَذَا', roman: 'Allahumma inni as\'aluka fi safarina hadha.', english: 'O Allah, we ask You on this journey of ours.', source: 'Sahih Bukhari 1088' }
    ]
  }
};
