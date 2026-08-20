// data/vol-prayers.js
// Voluntary prayers organized by type and occasion

const VOL_PRAYERS = {
  night: {
    label: 'Night Prayers',
    icon: 'moon',
    prayers: [
      { id: 'vol_night_0', name: 'Tahajjud', desc: 'The night prayer, the most virtuous after obligatory prayers. Pray in the last third of the night when Allah descends to the lowest heaven.', rakat: '2 or more (in pairs)', source: 'Sahih al-Bukhari 1145' },
      { id: 'vol_night_1', name: 'Witr', desc: 'An odd-numbered prayer after Isha. The Prophet said: Allah is Witr (one), He loves the odd-numbered.', rakat: '1 or 3', source: 'Sahih al-Bukhari 998' },
      { id: 'vol_night_2', name: 'Qiyam al-Layl', desc: 'Voluntary night prayer. The best prayer after the obligatory is the night prayer.', rakat: '2+ (in pairs)', source: 'Sahih Muslim 1163' }
    ]
  },
  daily: {
    label: 'Daily Sunnah Prayers',
    icon: 'sun',
    prayers: [
      { id: 'vol_daily_0', name: 'Duha (Forenoon)', desc: 'Prayed after sunrise, before Dhuhr. Equivalent of giving charity for every joint of the body.', rakat: '2-8', source: 'Sahih Muslim 720' },
      { id: 'vol_daily_1', name: 'Ishraq (Sunrise)', desc: 'Prayed shortly after sunrise. A great reward similar to Hajj and Umrah.', rakat: '2', source: 'Tirmidhi 479' },
      { id: 'vol_daily_2', name: 'Awwabin (After Maghrib)', desc: 'Prayed after Maghrib before Isha. A reward like performing Umrah.', rakat: '2-6', source: 'Tirmidhi 445' },
      { id: 'vol_daily_3', name: '12 Sunnah Rakat of the Day', desc: 'Whoever prays 12 rakat throughout the day and night, Allah will build a house in Paradise.', rakat: '12 (4 before Dhuhr, 2 after, 2 after Maghrib, 2 after Isha, 2 Witr)', source: 'Sahih Muslim 728' }
    ]
  },
  occasional: {
    label: 'Occasional Prayers',
    icon: 'star',
    prayers: [
      { id: 'vol_occasional_0', name: 'Salatul Istikhara', desc: 'The prayer for seeking guidance. Pray when making an important decision, asking Allah to choose what is best.', rakat: '2', source: 'Sahih al-Bukhari 1162' },
      { id: 'vol_occasional_1', name: 'Salatul Tawbah (Repentance)', desc: 'The prayer of repentance. It is the escape from sin.', rakat: '2', source: 'Abu Dawud 1517' },
      { id: 'vol_occasional_2', name: 'Salatul Hajah (Need)', desc: 'The prayer of need. Pray when you have an important need of Allah.', rakat: '2', source: 'Tirmidhi 479' },
      { id: 'vol_occasional_3', name: 'Salatul Shukr (Gratitude)', desc: 'The prayer of gratitude. Pray when Allah blesses you with something, to thank Him.', rakat: '2', source: 'Ahmad' }
    ]
  },
  masjid: {
    label: 'Masjid Prayers',
    icon: 'mosque',
    prayers: [
      { id: 'vol_masjid_0', name: 'Tahiyatul Masjid', desc: 'Prayed upon entering the mosque before sitting down. Two rakat to honor the house of Allah.', rakat: '2', source: 'Sahih al-Bukhari 1164' },
      { id: 'vol_masjid_1', name: 'Tahiyatul Wudu', desc: 'Prayed immediately after performing wudu. The gates of Paradise are opened for the one who prays two rakat.', rakat: '2', source: 'Sahih al-Bukhari 157' },
      { id: 'vol_masjid_2', name: 'Istikhara in Masjid', desc: 'Best performed in the masjid for Istikhara, as the Prophet taught.', rakat: '2', source: 'Sahih al-Bukhari 1162' }
    ]
  },
  special: {
    label: 'Special Occasions',
    icon: 'sparkles',
    prayers: [
      { id: 'vol_special_0', name: 'Eid al-Fitr Prayer', desc: 'Obligatory on the day of Eid. Two rakat with extra takbirat. Includes khutbah.', rakat: '2', source: 'Sahih al-Bukhari 988' },
      { id: 'vol_special_1', name: 'Eid al-Adha Prayer', desc: 'Obligatory on the day of Adha. Prayed in the open ground (musalla).', rakat: '2', source: 'Sahih al-Bukhari 988' },
      { id: 'vol_special_2', name: 'Kusoof (Solar Eclipse)', desc: 'Prayed during solar eclipse. Lengthy recitation, long standing and bowing.', rakat: '2', source: 'Sahih al-Bukhari 1059' },
      { id: 'vol_special_3', name: 'Istisqa (Rain Prayer)', desc: 'Prayed for rain during drought. The Prophet came out with his cloak turned inside out.', rakat: '2', source: 'Sahih al-Bukhari 1014' },
      { id: 'vol_special_4', name: 'Janazah (Funeral)', desc: 'The funeral prayer. A collective obligation (Fard Kifayah). Pray for the deceased.', rakat: '4 (no ruku or sujood)', source: 'Sahih al-Bukhari 1316' }
    ]
  }
};
