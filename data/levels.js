/* Dignified, sincere milestone titles — avoids ranking faith, divine attributes as human levels,
 * derogatory words, or placeholder copies. Beyond 100, lvTitle() scales serenely with tiers.
 */
const LEVELS = [
  { m:1,   t:'New Seeker' },        { m:2,   t:'First Step' },        { m:3,   t:'Waking Heart' },
  { m:4,   t:'Gentle Start' },      { m:5,   t:'Whispered Dua' },     { m:6,   t:'Quiet Hope' },
  { m:7,   t:'Sincere Intention' }, { m:8,   t:'Open Hands' },        { m:9,   t:'Attentive Ear' },
  { m:10,  t:'Calm Spirit' },       { m:11,  t:'Softened Heart' },    { m:12,  t:'Dawn Responder' },
  { m:13,  t:'Humble Step' },       { m:14,  t:'Patient Learner' },   { m:15,  t:'Stillness in Prayer' },
  { m:16,  t:'Grateful Breath' },   { m:17,  t:'Mindful Speech' },    { m:18,  t:'Kind Neighbor' },
  { m:19,  t:'Reflective Mind' },   { m:20,  t:'Steady Pace' },       { m:21,  t:'Firm Footing' },
  { m:22,  t:'Rooted Seed' },       { m:23,  t:'Sprouting Branch' },  { m:24,  t:'Shading Tree' },
  { m:25,  t:'Generous Hand' },     { m:26,  t:'Seeker of Light' },   { m:27,  t:'Student of Guidance' },
  { m:28,  t:'Friend of Silence' }, { m:29,  t:'Patient Soul' },      { m:30,  t:'Grounded Habit' },
  { m:32,  t:'Fajr Companion' },    { m:34,  t:'Duha Worshipper' },   { m:36,  t:'Calm Evening' },
  { m:38,  t:'Night Sanctuary' },   { m:40,  t:'Trustful Heart' },    { m:42,  t:'Devoted Reader' },
  { m:44,  t:'Gentle Character' },  { m:46,  t:'Clear Consciousness' },{ m:48,  t:'Giving Spirit' },
  { m:50,  t:'Peaceful Sanctuary' },{ m:54,  t:'Quran Companion' },   { m:58,  t:'Steadfast Devotion' },
  { m:62,  t:'Merciful Conduct' },  { m:66,  t:'Humility & Restraint' },{ m:70, t:'Tahajjud Seeker' },
  { m:75,  t:'Balanced Life' },     { m:80,  t:'Honest Steward' },    { m:85,  t:'Quiet Perseverance' },
  { m:90,  t:'Deep Gratitude' },    { m:95,  t:'Guardian of Prayer' },{ m:100, t:'Steadfast Companion' }
];
