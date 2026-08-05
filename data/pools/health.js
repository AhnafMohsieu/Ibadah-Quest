const HEALTH_POOL = [
  { title:"Your Body Is a Trust (Amanah)", desc:"Allah will ask you about your body — how you used it. Maintain it with proper food, rest, and exercise." },
  { title:"Eating in Moderation", desc:"The Prophet ﷺ said: 'Fill one-third with food, one-third with water, and leave one-third for breathing.'" },
  { title:"Seeking Medical Treatment", desc:"'Allah has not sent down a disease except that He has also sent down its cure.' Seeking cure is recommended." },
  { title:"Fasting for Health", desc:"Fasting rests the digestive system, detoxifies the body, and trains discipline over lower desires." },
  { title:"Spiritual and Mental Well-being", desc:"Tawakkul (reliance on Allah) is the cure for anxiety. 'In the remembrance of Allah do hearts find rest.' (13:28)" },
  { title:"Honey as Cure", desc:"The Quran states honey contains healing for people. The Prophet ﷺ prescribed it for stomach ailments." },
  { title:"Black Seed (Habbat al-Sawda)", desc:"'In the black seed there is a cure for every disease, except death.' — Prophet ﷺ (Bukhari)" },
  { title:"Prophetic Sleep Habits", desc:"The Prophet ﷺ slept early after Isha, woke in the last third of the night for Tahajjud, and took a short afternoon nap (Qaylulah)." },
  { title:"Cupping (Hijama)", desc:"The Prophet ﷺ recommended Hijama for various ailments. He said: 'The best of what you treat yourselves with is cupping.'" },
  { title:"Walking to the Mosque", desc:"Every step to the mosque is a charity, erases a sin, raises a rank — and promotes cardiovascular health." },
  { title:"Oral Hygiene (Siwak)", desc:"The Siwak purifies the mouth, pleases the Lord, and was the Prophet's ﷺ most frequent sunnah." },
  { title:"Avoiding Harmful Substances", desc:"Intoxicants, smoking, and harmful foods are forbidden to protect the mind, body, and wealth." }
];

const HEALTH_PROMPTS = [
  { id:'water', label:'Water Intake', icon:'💧', unit:'glasses', target:8 },
  { id:'sleep', label:'Sleep Hours', icon:'😴', unit:'hours', target:8 },
  { id:'steps', label:'Steps/Walking', icon:'🚶', unit:'steps', target:10000 },
  { id:'exercise', label:'Exercise', icon:'🏃', unit:'minutes', target:30 },
  { id:'fasting', label:'Voluntary Fasting', icon:'🌙', unit:'days', target:1 }
];

const EXERCISE_TYPES = [
  { id:'walking', label:'Walking', icon:'🚶', xp:5 },
  { id:'running', label:'Running', icon:'🏃', xp:8 },
  { id:'swimming', label:'Swimming', icon:'🏊', xp:8 },
  { id:'cycling', label:'Cycling', icon:'🚴', xp:7 },
  { id:'yoga', label:'Stretching/Yoga', icon:'🧘', xp:5 },
  { id:'strength', label:'Strength Training', icon:'💪', xp:8 },
  { id:'sports', label:'Sports', icon:'⚽', xp:7 }
];