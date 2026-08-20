// data/extra-deeds.js
// Extra good deeds organized by spiritual benefit

const EXTRA_GOOD_DEEDS = {
  charity: {
    label: 'Charity & Generosity',
    icon: 'hand-heart',
    deeds: [
      { id: 'extra_charity_0', name: 'Give charity, even a small amount', virtue: 'Charity does not decrease wealth.', source: 'Sahih Muslim 2588' },
      { id: 'extra_charity_1', name: 'Give secret charity', virtue: 'Secret charity extinguishes the anger of Allah.', source: 'Tirmidhi 664' },
      { id: 'extra_charity_2', name: 'Set up ongoing charity (Sadaqah Jariyah)', virtue: 'When a person dies, their deeds end except for ongoing charity.', source: 'Sahih Muslim 1631' },
      { id: 'extra_charity_3', name: 'Feed a fasting person', virtue: 'He who feeds a fasting person will have a reward like the fasting person.', source: 'Tirmidhi 807' },
      { id: 'extra_charity_4', name: 'Provide water to others', virtue: 'The best charity is giving water.', source: 'Ahmad (hasan)' },
      { id: 'extra_charity_5', name: 'Give a gift to increase love', virtue: 'Give gifts to one another, for gifts remove ill feelings from the heart.', source: 'Adab al-Mufrad 594' }
    ]
  },
  kindness: {
    label: 'Kindness & Manners',
    icon: 'heart',
    deeds: [
      { id: 'extra_kindness_0', name: 'Smile at someone (Sunnah)', virtue: 'Your smile is charity.', source: 'Tirmidhi 1956' },
      { id: 'extra_kindness_1', name: 'Forgive someone who wronged you', virtue: 'The best of people are those who are most forgiving.', source: 'Ahmad' },
      { id: 'extra_kindness_2', name: 'Visit the sick', virtue: 'When you visit a sick person, you walk in the harvest of Paradise.', source: 'Sahih Muslim 2568' },
      { id: 'extra_kindness_3', name: 'Console someone who is grieving', virtue: 'Allah comforts those who comfort others.', source: 'Ahmad (hasan)' },
      { id: 'extra_kindness_4', name: 'Remove harm from the road', virtue: 'Removing harm from the road is charity.', source: 'Sahih Muslim 2618' },
      { id: 'extra_kindness_5', name: 'Be kind to your parents', virtue: 'And your Lord has decreed that you worship none but Him, and that you be dutiful to your parents.', source: 'Isra 17:23' }
    ]
  },
  knowledge: {
    label: 'Knowledge & Learning',
    icon: 'book-open',
    deeds: [
      { id: 'extra_knowledge_0', name: 'Read one page of Quran', virtue: 'The one who reads a letter gets a reward, and each reward is multiplied by ten.', source: 'Tirmidhi 2910' },
      { id: 'extra_knowledge_1', name: 'Learn a hadith of the Prophet', virtue: 'Whoever learns a hadith will be rewarded.', source: 'Sahih al-Bukhari 109' },
      { id: 'extra_knowledge_2', name: 'Teach someone beneficial knowledge', virtue: 'The best among you are those who learn the Quran and teach it.', source: 'Sahih al-Bukhari 5027' },
      { id: 'extra_knowledge_3', name: 'Make dua for increase in knowledge', virtue: 'My Lord, increase me in knowledge.', source: 'Taha 20:114' },
      { id: 'extra_knowledge_4', name: 'Read Surah Al-Kahf on Friday', virtue: 'Whoever reads Surah Al-Kahf on Friday, a light will shine for him between two Fridays.', source: 'Sahih Muslim 804' },
      { id: 'extra_knowledge_5', name: 'Reflect on an ayah of Quran', virtue: 'The best worship is contemplation.', source: 'Adab al-Mufrad' }
    ]
  },
  worship: {
    label: 'Worship & Remembrance',
    icon: 'mosque',
    deeds: [
      { id: 'extra_worship_0', name: 'Pray two rakat after wudu', virtue: 'Whoever performs wudu well then prays two rakat, Jannah is guaranteed.', source: 'Sahih Muslim 234' },
      { id: 'extra_worship_1', name: 'Say SubhanAllah 33x after prayer', virtue: 'Whoever glorifies Allah after every prayer 33 times, Praises Allah 33 times, and Magnifies Allah 34 times, his sins will be forgiven.', source: 'Sahih Muslim 596' },
      { id: 'extra_worship_2', name: 'Pray Duha prayer', virtue: 'In the morning, charity is due from every joint of your body. Two rakat of Duha suffice for that.', source: 'Sahih Muslim 720' },
      { id: 'extra_worship_3', name: 'Say Ayatul Kursi after every fard prayer', virtue: 'Whoever recites Ayatul Kursi after every obligatory prayer, nothing prevents him from entering Paradise except death.', source: "Sunan an-Nasa'i 9928" },
      { id: 'extra_worship_4', name: 'Make istighfar 100 times a day', virtue: 'By Allah, I seek forgiveness from Allah and repent to Him more than seventy times each day.', source: 'Sahih al-Bukhari 6307' },
      { id: 'extra_worship_5', name: 'Say La ilaha illAllah wahdahu la sharika lah 100x', virtue: 'Whoever says La ilaha illAllah wahdahu la sharika lah 100 times, it will be as if he freed ten slaves.', source: 'Sahih al-Bukhari 6403' }
    ]
  },
  health: {
    label: 'Health & Body',
    icon: 'heartbeat',
    deeds: [
      { id: 'extra_health_0', name: 'Walk to the masjid', virtue: 'Whoever walks to the mosque, for every step Allah builds a house in Paradise.', source: 'Sahih al-Bukhari 632' },
      { id: 'extra_health_1', name: 'Fast one day', virtue: 'Whoever fasts one day for the sake of Allah, Allah will distance his face from the Hellfire.', source: 'Sahih al-Bukhari 1904' },
      { id: 'extra_health_2', name: 'Fast Mondays and Thursdays', virtue: 'The Prophet used to fast Mondays and Thursdays.', source: 'Tirmidhi 747' },
      { id: 'extra_health_3', name: 'Take a bath on Friday', virtue: 'Taking a bath on Friday is obligatory for every adult.', source: 'Sahih al-Bukhari 879' },
      { id: 'extra_health_4', name: 'Use the miswak', virtue: 'Were it not that I would make it difficult for my Ummah, I would have commanded them to use the miswak for every prayer.', source: 'Sahih al-Bukhari 887' }
    ]
  },
  community: {
    label: 'Community & Service',
    icon: 'users',
    deeds: [
      { id: 'extra_community_0', name: 'Spread the salam', virtue: 'Spread the salam among yourselves, for it purifies the heart.', source: 'Sahih Muslim 38' },
      { id: 'extra_community_1', name: 'Help your brother in need', virtue: 'Allah helps the servant as long as the servant helps his brother.', source: 'Sahih Muslim 2699' },
      { id: 'extra_community_2', name: 'Reconcile between two people', virtue: 'Shall I not inform you of something more excellent than the status of fasting, prayer, and charity? Reconciling between people.', source: 'Abu Dawud 4919' },
      { id: 'extra_community_3', name: 'Command good and forbid evil', virtue: 'Whoever among you sees an evil, let him change it with his hand.', source: 'Sahih Muslim 49' },
      { id: 'extra_community_4', name: 'Defend the oppressed', virtue: 'Help your brother whether he is an oppressor or oppressed.', source: 'Sahih al-Bukhari 2444' },
      { id: 'extra_community_5', name: 'Be generous to your neighbor', virtue: 'Jibreel kept recommending me to treat my neighbor well until I thought he would make him my heir.', source: 'Sahih al-Bukhari 6014' }
    ]
  }
};
