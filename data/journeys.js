// Multi-duration Habit Journeys — each journey maps to an existing log key
// kind: 'p' reads log[date].p[key]; kind: 'd' reads log[date].d[key]
// tier: '7day', '21day', '40day', '90day', '30day' (charity)
const JOURNEYS = [
  // 7-day starters
  { id: 'fajr7', name: '7 Days of Fajr', desc: 'Pray Fajr on time for 7 days', kind: 'p', key: 'fajr', target: 7, tier: '7day', category: 'salah' },
  { id: 'quran7', name: '7 Days of Quran', desc: 'Read Quran daily for 7 days', kind: 'd', key: 'quran', target: 7, tier: '7day', category: 'quran' },
  
  // 21-day habit forming
  { id: 'fajr21', name: '21 Days of Fajr', desc: 'Pray Fajr on time for 21 days', kind: 'p', key: 'fajr', target: 21, tier: '21day', category: 'salah' },
  
  // 40-day traditional (existing)
  { id: 'fajr40', name: '40 Days of Fajr', desc: 'Pray Fajr on time for 40 days', kind: 'p', key: 'fajr', target: 40, tier: '40day', category: 'salah' },
  { id: 'istighfar40', name: '40 Days of Istighfar', desc: 'Make istighfar every day for 40 days', kind: 'd', key: 'istighfar', target: 40, tier: '40day', category: 'salah' },
  { id: 'quran40', name: "40 Days of Qur'an", desc: "Read from the Qur'an every day for 40 days", kind: 'd', key: 'quran', target: 40, tier: '40day', category: 'quran' },
  { id: 'salawat40', name: '40 Days of Salawat', desc: 'Send salawat on the Prophet ﷺ every day for 40 days', kind: 'd', key: 'salawat', target: 40, tier: '40day', category: 'salah' },
  
  // 90-day deep
  { id: 'fajr90', name: '90 Days of Fajr', desc: 'Pray Fajr on time for 90 days', kind: 'p', key: 'fajr', target: 90, tier: '90day', category: 'salah' },
  
  // Charity
  { id: 'charity30', name: '30 Days of Charity', desc: 'Give charity daily for 30 days', kind: 'd', key: 'charity', target: 30, tier: '30day', category: 'charity' },
];
