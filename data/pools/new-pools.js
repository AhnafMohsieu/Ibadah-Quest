// data/pools/new-pools.js — Curated Islamic knowledge & rulings pools (lazy-loaded)
const NEW_POOLS = {
  "purification": [
    {
      "title": "Conditions of Wudu",
      "desc": "Wudu requires intention (niyyah), washing the face, arms up to elbows, wiping the head, and washing the feet up to ankles. It removes minor spiritual impurities.",
      "source": "Fiqh of Taharah"
    },
    {
      "title": "Ghusl (Major Ablution)",
      "desc": "Ghusl is required after major impurity. Its pillars are the intention and ensuring water reaches every part of the body, including the roots of the hair.",
      "source": "Fiqh Manuals"
    },
    {
      "title": "Tayammum (Dry Ablution)",
      "desc": "When water is unavailable or harmful to use, one can strike clean earth/dust with their hands, wipe their face, and wipe their hands.",
      "source": "Fiqh of Taharah"
    },
    {
      "title": "Types of Water",
      "desc": "Water is classified as Mutlaq (pure and purifying), Musta'mal (used, pure but not purifying), and Mutanajjis (impure due to contact with filth).",
      "source": "Classical Fiqh"
    },
    {
      "title": "Ghusl (Ritual Bath)",
      "desc": "Required after major ritual impurity (Janabah). It involves intending purification, washing the entire body, and ensuring water reaches the roots of the hair.",
      "source": "Sunan Abu Dawud"
    }
  ],
  "salahrules": [
    {
      "title": "The Pillars (Arkan) of Salah",
      "desc": "If a pillar like the opening Takbir, standing, reciting Al-Fatiha, or bowing (Ruku) is missed, the rak'ah or prayer is invalid and must be repeated.",
      "source": "Fiqh of Salah"
    },
    {
      "title": "Sujud al-Sahw",
      "desc": "The prostration of forgetfulness is performed when one adds, omits, or is doubtful about certain obligatory acts (wajib) in the prayer.",
      "source": "Hadith & Fiqh"
    },
    {
      "title": "Istikhara Prayer",
      "desc": "A special prayer performed when seeking divine guidance for an important decision, asking Allah to choose what is best.",
      "source": "Hadith & Fiqh"
    },
    {
      "title": "Jama'ah (Congregation)",
      "desc": "Praying in congregation is highly emphasized, offering 27 times the reward of praying alone, fostering community equality.",
      "source": "Sahih Bukhari"
    },
    {
      "title": "Qada (Make-up Prayers)",
      "desc": "If a prayer is missed due to sleep or genuine forgetfulness, it must be made up (Qada) immediately upon remembering or waking.",
      "source": "Sahih Muslim"
    }
  ],
  "zakatrules": [
    {
      "title": "The Nisab",
      "desc": "Zakat is obligatory on wealth that reaches the Nisab (minimum threshold, equivalent to 85g of gold or 595g of silver) and is held for one lunar year (Hawl).",
      "source": "Fiqh of Zakat"
    },
    {
      "title": "The 8 Categories",
      "desc": "Zakat can only be given to 8 specific categories mentioned in Surah At-Tawbah (9:60), including the poor, the needy, those in debt, and travelers.",
      "source": "Quran 9:60"
    },
    {
      "title": "Nisab Threshold",
      "desc": "Zakat is calculated at 2.5% of wealth that has been held for one full lunar year (Hawl) above the Nisab threshold of 85g gold or 595g silver.",
      "source": "Fiqh of Zakat"
    },
    {
      "title": "Who Must Pay Zakat",
      "desc": "Zakat is obligatory on every sane, adult Muslim who possesses wealth above the Nisab threshold for one lunar year. It is one of the Five Pillars of Islam.",
      "source": "Quran 9:60"
    },
    {
      "title": "Zakat al-Fitr",
      "desc": "A specific, small obligatory charity given before the Eid al-Fitr prayer, usually in the form of staple food, purifying the fasting person.",
      "source": "Sunan Ibn Majah"
    }
  ],
  "sawmrules": [
    {
      "title": "Nullifiers of Fasting",
      "desc": "Fasting is invalidated by intentional eating, drinking, or marital relations from dawn to sunset. Forgetfully eating does not break the fast.",
      "source": "Fiqh of Sawm"
    },
    {
      "title": "Fidyah and Kaffarah",
      "desc": "Those chronically ill pay Fidyah (feeding a poor person per missed day). Deliberately breaking a fast without excuse requires Kaffarah (fasting 60 consecutive days).",
      "source": "Islamic Jurisprudence"
    },
    {
      "title": "Exemptions from Fasting",
      "desc": "Travelers, the sick, pregnant/nursing women, and the elderly are exempt from fasting. They must make it up later or pay Fidyah (feeding a poor person).",
      "source": "Quran 2:184"
    },
    {
      "title": "Nullifiers of the Fast",
      "desc": "Eating, drinking, or intimate relations intentionally between dawn and sunset break the fast. Unintentional eating out of forgetfulness does not.",
      "source": "Fiqh of Fasting"
    },
    {
      "title": "Taraweeh Prayer",
      "desc": "Taraweeh is a special voluntary prayer performed only during Ramadan after Isha. The Prophet (ﷺ) prayed 11 rakat at night, and Umar (RA) later established the practice of 20 rakat in congregation.",
      "source": "Sahih al-Bukhari 226"
    }
  ],
  "hajjrules": [
    {
      "title": "Meeqat and Ihram",
      "desc": "Pilgrims must enter the state of Ihram before crossing specific geographical boundaries (Meeqat). Men wear two unstitched white cloths, symbolizing equality.",
      "source": "Fiqh of Hajj"
    },
    {
      "title": "The Pillars of Hajj",
      "desc": "Hajj consists of four pillars: Ihram, standing at Arafat (the most critical), Tawaf al-Ifadah, and Sa'i between Safa and Marwah.",
      "source": "Fiqh Manuals"
    },
    {
      "title": "Ihram Restrictions",
      "desc": "While in the state of Ihram, pilgrims cannot cut hair/nails, wear perfume, hunt, or engage in marital relations until the rites are complete.",
      "source": "Fiqh of Hajj"
    },
    {
      "title": "Tawaf al-Ifadah",
      "desc": "The core, obligatory circumambulation of the Kaaba performed on the 10th of Dhul Hijjah after coming from Mina. Hajj is invalid without it.",
      "source": "Hajj Rituals"
    },
    {
      "title": "Sa'i between Safa and Marwa",
      "desc": "Walking seven times between the hills of Safa and Marwa honors the desperate search for water by Hajar, the wife of Prophet Ibrahim.",
      "source": "Historical Fiqh"
    }
  ],
  "trade": [
    {
      "title": "Prohibition of Riba",
      "desc": "Riba (usury/interest) is strictly prohibited in Islam. Money cannot generate money without risk; wealth must be generated through legitimate trade and asset-backed transactions.",
      "source": "Fiqh al-Mu'amalat"
    },
    {
      "title": "Gharar (Uncertainty)",
      "desc": "Contracts involving excessive uncertainty (Gharar) or deception are forbidden. Both the buyer and seller must have clear knowledge of the item, price, and terms.",
      "source": "Islamic Finance"
    },
    {
      "title": "Islamic Banking Principles",
      "desc": "Modern Islamic banking offers Sharia-compliant alternatives to conventional finance, including Murabaha (cost-plus financing), Ijara (leasing), and Musharakah (partnerships).",
      "source": "Islamic Finance"
    },
    {
      "title": "Fair Trade in Islam",
      "desc": "Islam emphasizes honesty, transparency, and fairness in all transactions. Cheating, fraud, and exploitation are strictly forbidden in commercial dealings.",
      "source": "Commercial Fiqh"
    },
    {
      "title": "Khiyar (Right of Option)",
      "desc": "Both the buyer and seller have the right to cancel the transaction before they physically separate from the place of the deal.",
      "source": "Sahih Muslim"
    }
  ],
  "inheritance": [
    {
      "title": "Divinely Ordained Shares",
      "desc": "Unlike general charity, Islamic inheritance laws (Mirath) dictate precise fractional shares for heirs (parents, spouses, children) to ensure fair wealth distribution.",
      "source": "Quran 4:11-12"
    },
    {
      "title": "The Wasiyyah (Will)",
      "desc": "A Muslim is permitted to bequeath up to one-third of their estate to non-heirs or charities; the remaining two-thirds must go to the rightful heirs.",
      "source": "Fiqh of Inheritance"
    },
    {
      "title": "Obligatory Shares (Fara'id)",
      "desc": "The Quran outlines fixed fractional shares (e.g., 1/2, 1/4, 1/8) for specific relatives, ensuring wealth is distributed, not hoarded by a single heir.",
      "source": "Quran 4:11-12"
    },
    {
      "title": "The 1/3 Will Limit",
      "desc": "A Muslim can only dictate a will (Wasiyyah) for up to 1/3 of their estate. The remaining 2/3 must be distributed according to the fixed Quranic shares.",
      "source": "Sahih Bukhari"
    },
    {
      "title": "No Inheritance for the Killer",
      "desc": "A fundamental rule: A person who murders their relative is entirely disinherited from that relative's estate to prevent foul play.",
      "source": "Sunan At-Tirmidhi"
    }
  ],
  "oaths": [
    {
      "title": "Types of Oaths",
      "desc": "Oaths (Yameen) must only be sworn by Allah. A legally binding oath must be intentional. Swearing by anything other than Allah is considered minor shirk.",
      "source": "Hadith & Fiqh"
    },
    {
      "title": "Expiation (Kaffarah) for Broken Oaths",
      "desc": "Breaking a deliberate oath requires feeding 10 poor people, clothing them, or freeing a slave. If unable, one must fast for three days.",
      "source": "Quran 5:89"
    },
    {
      "title": "Swearing by Allah Alone",
      "desc": "It is strictly forbidden to swear an oath by anything other than Allah (e.g., swearing by one's mother or by the Prophet is impermissible).",
      "source": "Sahih Bukhari"
    },
    {
      "title": "Kaffarah for Broken Oaths",
      "desc": "Breaking a deliberate oath requires expiation: feeding/clothing ten poor people, or freeing a slave. If unable, one must fast for three days.",
      "source": "Quran 5:89"
    },
    {
      "title": "Conditional Oaths",
      "desc": "An oath conditioned on something that is not in one's control (e.g., 'If Allah wills, I will do X') is not considered a binding oath in Islamic law.",
      "source": "Fiqh of Oaths"
    }
  ],
  "sufism": [
    {
      "title": "Tasawwuf (Sufism)",
      "desc": "Classical Tasawwuf focuses on purifying the heart (Tazkiyah) and developing Ihsan (excellence in faith), recognizing that the soul must be cured of diseases like pride and envy.",
      "source": "Islamic Spirituality"
    },
    {
      "title": "The Tariqah",
      "desc": "A Tariqah is a path of spiritual discipline under the guidance of a learned shaykh, aiming to eliminate the ego and achieve continuous remembrance (Dhikr) of Allah.",
      "source": "Spiritual Sciences"
    },
    {
      "title": "Maqamat (Spiritual Stations)",
      "desc": "The Sufi path involves progressing through spiritual stations like Repentance, Patience, Gratitude, and ultimately, absolute Reliance on God.",
      "source": "Risala Qushayriyya"
    },
    {
      "title": "Dhikr Circles",
      "desc": "Sufi orders (Tariqas) often gather for communal Dhikr, rhythmically repeating the names of Allah to purify the heart and achieve spiritual presence.",
      "source": "Tassawuf"
    },
    {
      "title": "Fana (Annihilation)",
      "desc": "The spiritual state where the ego is entirely subdued, and the seeker is wholly absorbed in the awareness and love of the Divine.",
      "source": "Sufi Philosophy"
    }
  ],
  "tazkiyah": [
    {
      "title": "Purification of the Soul",
      "desc": "Tazkiyat al-Nafs involves identifying one's spiritual flaws—such as arrogance, greed, and ostentation (Riya)—and actively struggling against them to attain a sound heart (Qalb Saleem).",
      "source": "Quran 91:9"
    },
    {
      "title": "Al-Muhasabah",
      "desc": "Taking oneself to account daily (Muhasabah) is a core practice. Umar ibn al-Khattab said: 'Hold yourselves accountable before you are held accountable.'",
      "source": "Spiritual Principles"
    },
    {
      "title": "Mujahadat al-Nafs",
      "desc": "The inner struggle against the lower ego (Nafs). It involves disciplining desires through fasting, night prayer, and controlling the tongue.",
      "source": "Spiritual Discipline"
    },
    {
      "title": "Muhasabah (Self-Accountability)",
      "desc": "The practice of reviewing one's actions at the end of each day, repenting for sins, and resolving to improve tomorrow.",
      "source": "Ihya Ulum al-Din"
    },
    {
      "title": "Diseases of the Heart",
      "desc": "Tazkiyah focuses on curing spiritual diseases like Kibr (arrogance), Hasad (envy), and Riya (showing off) which destroy good deeds.",
      "source": "Purification of the Heart"
    }
  ],
  "fear": [
    {
      "title": "Khawf (Fear of Allah)",
      "desc": "True fear of Allah (Khawf) is not a paralyzing terror, but a reverential awe that actively prevents a person from committing sins and displeasing their Creator.",
      "source": "Islamic Theology"
    },
    {
      "title": "Tears of Reverence",
      "desc": "The Prophet peace be upon him said that a person who weeps out of the fear of Allah will not enter the Hellfire, just as milk does not return to the udder.",
      "source": "Sunan al-Tirmidhi"
    },
    {
      "title": "Khawf and Raja",
      "desc": "A believer must balance Khawf (Fear of God's justice) and Raja (Hope in God's mercy), like two wings of a bird required for straight flight.",
      "source": "Ibn al-Qayyim"
    },
    {
      "title": "Fear of a Bad Ending",
      "desc": "Spiritual masters constantly feared Su' al-Khatimah (a bad ending), praying that their final moments would be upon faith and righteousness.",
      "source": "Spiritual Reflections"
    },
    {
      "title": "Constructive Fear",
      "desc": "True fear of Allah doesn't cause despair; it actively prevents a person from committing sins and motivates them to rush towards good deeds.",
      "source": "Tafsir Ibn Kathir"
    }
  ],
  "hope": [
    {
      "title": "Raja' (Hope)",
      "desc": "Hope in Allah's mercy must be balanced with fear. A believer flies to Allah with two wings: the wing of fear (Khawf) and the wing of hope (Raja').",
      "source": "Ibn al-Qayyim"
    },
    {
      "title": "The Vastness of Mercy",
      "desc": "Allah says in a Hadith Qudsi: 'O son of Adam, so long as you call upon Me and ask of Me, I shall forgive you for what you have done, and I shall not mind.'",
      "source": "Sunan al-Tirmidhi"
    },
    {
      "title": "Husn al-Dhann",
      "desc": "Having a beautiful, positive opinion of Allah. The Hadith Qudsi states: 'I am as My servant expects Me to be.'",
      "source": "Sahih Bukhari"
    },
    {
      "title": "Divine Forgiveness",
      "desc": "Allah divided mercy into 100 parts, keeping 99 for the Day of Judgment and sending down just 1 part to Earth for all creation to share.",
      "source": "Sahih Muslim"
    },
    {
      "title": "Never Despair",
      "desc": "The Quran commands believers never to despair of God's mercy, for He forgives all sins for those who sincerely turn back to Him.",
      "source": "Quran 39:53"
    }
  ],
  "loveofallah": [
    {
      "title": "Mahabbah",
      "desc": "The pinnacle of spirituality is the Love of Allah. Everything else loved in this world should be loved for His sake. It is the fuel that makes worship a joy rather than a burden.",
      "source": "Spiritual Treatises"
    },
    {
      "title": "The Sweetness of Faith",
      "desc": "The Prophet peace be upon him said that whoever possesses three qualities will taste the sweetness of faith: that Allah and His Messenger are more beloved to him than anything else...",
      "source": "Sahih al-Bukhari"
    },
    {
      "title": "Love of the Prophet ﷺ",
      "desc": "The highest spiritual station goes beyond obeying out of duty; it is obeying out of intense love and longing for the Divine Messenger.",
      "source": "Madarij al-Salikin"
    },
    {
      "title": "Following the Prophet ﷺ",
      "desc": "The Quran links the love of God directly to following the Sunnah: 'Say: If you love Allah, follow me, and Allah will love you.'",
      "source": "Quran 3:31"
    },
    {
      "title": "Testing True Love",
      "desc": "True love is tested in adversity. A sincere lover of Allah accepts His decrees gracefully, recognizing the hidden wisdom in hardship.",
      "source": "Sufi Wisdom"
    }
  ],
  "contentment": [
    {
      "title": "Rida (Contentment)",
      "desc": "Rida is being pleased with the decree of Allah, even when it involves hardship. It is the paradise of this world.",
      "source": "Spiritual Teachings"
    },
    {
      "title": "True Wealth",
      "desc": "The Prophet peace be upon him said: 'Wealth is not in having many possessions, but true wealth is the wealth of the soul (contentment).'",
      "source": "Sahih al-Bukhari"
    },
    {
      "title": "Rida bil Qada",
      "desc": "Contentment with Divine Decree. It is the ability to find peace even when life goes contrary to your desires, trusting God's perfect plan.",
      "source": "Spiritual Resilience"
    },
    {
      "title": "Gratitude for Blessings",
      "desc": "The Prophet ﷺ stated, 'True wealth is not in having many possessions, but true wealth is the contentment of the soul.'",
      "source": "Sahih Bukhari"
    },
    {
      "title": "Looking at the Less Fortunate",
      "desc": "To foster contentment, the Sunnah advises looking at those who have less wealth and health than you, rather than those who have more.",
      "source": "Sahih Muslim"
    }
  ],
  "reflection": [
    {
      "title": "Tafakkur",
      "desc": "Deep reflection upon the creation of the heavens and the earth, and upon one's own self, is considered one of the highest forms of worship in Islam.",
      "source": "Quran 3:191"
    },
    {
      "title": "Silence and Thought",
      "desc": "Hasan al-Basri said: 'An hour's reflection is better than a year's voluntary worship,' as it softens the heart and strengthens conviction.",
      "source": "Sayings of the Tabi'un"
    },
    {
      "title": "The Book of Nature",
      "desc": "Deep reflection upon the creation of the heavens and earth. An hour of genuine contemplation is considered better than a night of heedless worship.",
      "source": "Islamic Spirituality"
    },
    {
      "title": "The Signs (Ayat)",
      "desc": "The Quran frequently commands humans to reflect on nature (rain, mountains, the human body) as clear signs of a Wise, Powerful Creator.",
      "source": "Quranic Wisdom"
    },
    {
      "title": "Reflecting on Mortality",
      "desc": "Muraqabah (meditation) often involves remembering death to break the heart's attachment to the fleeting illusions of the material world.",
      "source": "Ihya Ulum al-Din"
    }
  ],
  "mentalhealth": [
    {
      "title": "Seeking Therapy",
      "desc": "The Prophet peace be upon him said, 'Allah has not sent down a disease except that He has also sent down a cure.' Seeking medical and psychological therapy is highly encouraged in Islam.",
      "source": "Sahih al-Bukhari"
    },
    {
      "title": "Faith and Anxiety",
      "desc": "While faith and Dhikr bring peace to the heart, clinical depression is a medical condition. Equating mental illness merely with 'low Iman' is un-Islamic and harmful.",
      "source": "Islamic Psychology"
    },
    {
      "title": "Ruqyah and Medicine",
      "desc": "Islam encourages seeking medical treatment for psychiatric issues while also utilizing Ruqyah (Quranic recitation) for spiritual healing—the two are complementary.",
      "source": "Prophetic Medicine"
    },
    {
      "title": "Grief is Normal",
      "desc": "When his son Ibrahim died, the Prophet ﷺ wept. He stated the eyes shed tears and the heart grieves, showing that sorrow does not negate faith.",
      "source": "Sahih Bukhari"
    },
    {
      "title": "Al-Balkhi's Psychology",
      "desc": "The 9th-century polymath Abu Zayd al-Balkhi was a pioneer in psychotherapy, differentiating between neuroses and psychoses, and linking mental to physical health.",
      "source": "History of Psychology"
    }
  ],
  "brotherhood": [
    {
      "title": "The Bonds of Faith",
      "desc": "The Quran declares, 'The believers are but brothers.' (49:10). The Prophet likened the Ummah to a single body: if one part hurts, the whole body feels the fever.",
      "source": "Sahih Muslim"
    },
    {
      "title": "Rights of a Muslim",
      "desc": "A Muslim has six basic rights over another: returning salam, accepting invitations, giving sincere advice, replying to sneezes, visiting them when sick, and attending their funeral.",
      "source": "Sahih Muslim"
    }
  ],
  "sisterhood": [
    {
      "title": "Women Supporting Women",
      "desc": "Sisterhood in Islam offers a vital spiritual and social support network. The female companions (Sahabiyat) studied, worked, and supported each other fiercely.",
      "source": "Historical Accounts"
    },
    {
      "title": "Equal in Reward",
      "desc": "The Quran emphasizes that believing men and believing women are allies of one another, enjoining good and forbidding evil, and receiving equal spiritual reward.",
      "source": "Quran 9:71"
    }
  ],
  "orphans2": [
    {
      "title": "The Ultimate Guarantee",
      "desc": "The Prophet raised his index and middle fingers together and said: 'I and the sponsor of an orphan will be in Paradise like this.'",
      "source": "Sahih al-Bukhari"
    },
    {
      "title": "Protecting their Wealth",
      "desc": "The Quran gives terrifying warnings against those who unjustly consume the property of orphans, describing it as swallowing fire into their bellies.",
      "source": "Quran 4:10"
    }
  ],
  "elderly": [
    {
      "title": "Reverence for Age",
      "desc": "The Prophet said: 'He is not one of us who does not show mercy to our young ones and respect our elders.' Gray hair in Islam is considered a light of honor.",
      "source": "Sunan al-Tirmidhi"
    },
    {
      "title": "Caring for Parents",
      "desc": "As parents reach old age, the Quran commands children not to say even 'Uff' (a word of slight irritation) to them, but to speak with utmost nobility.",
      "source": "Quran 17:23"
    }
  ],
  "disabled": [
    {
      "title": "The Blind Companion",
      "desc": "Allah revealed verses (Surah Abasa) mildly reprimanding the Prophet for turning away from a blind man (Ibn Umm Maktum), establishing the dignity and inclusion of the disabled.",
      "source": "Quran 80:1-10"
    },
    {
      "title": "Spiritual Perfection",
      "desc": "Physical limitations do not limit spiritual rank. Many great scholars of Islam, including Hadith narrators and jurists, were blind or had physical disabilities.",
      "source": "Biographical History"
    }
  ],
  "antiracism": [
    {
      "title": "The Final Sermon",
      "desc": "In his farewell sermon, the Prophet declared: 'An Arab has no superiority over a non-Arab, nor a white person over a black person, except by piety and good action.'",
      "source": "Musnad Ahmad"
    },
    {
      "title": "Bilal ibn Rabah",
      "desc": "A formerly enslaved Black African, Bilal was chosen by the Prophet to be the first Mu'adhdhin (caller to prayer), elevating him above the elite nobles of Quraysh.",
      "source": "Seerah"
    }
  ],
  "poverty": [
    {
      "title": "Systemic Solutions",
      "desc": "Islam tackles poverty not just through charity, but systematically via Zakat (wealth tax), prohibiting Riba (usury), and anti-hoarding laws to ensure wealth circulates.",
      "source": "Islamic Economics"
    },
    {
      "title": "Dignity of the Poor",
      "desc": "The poor have a 'right' in the wealth of the rich, not just a favor. Giving charity is fulfilling an obligation, and the recipient must be treated with dignity, without reminders of the favor.",
      "source": "Quran 2:264"
    }
  ],
  "volunteering": [
    {
      "title": "Khidmah (Service)",
      "desc": "Serving people is a direct path to Allah. The Prophet said: 'The most beloved of people to Allah are those who are most beneficial to people.'",
      "source": "Al-Mu'jam Al-Awsat"
    },
    {
      "title": "Removing Harm",
      "desc": "Even the smallest act of volunteering counts. Moving a branch or a harmful object from the road is considered a branch of faith.",
      "source": "Sahih Muslim"
    }
  ]
};
if (typeof window !== 'undefined') window.NEW_POOLS = NEW_POOLS;
