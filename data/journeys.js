// 40-Day Habit Journeys — each journey maps to an existing log key
// kind: 'p' reads log[date].p[key]; kind: 'd' reads log[date].d[key]
const JOURNEYS = [
  { id: 'fajr40', name: '40 Days of Fajr', icon: '🕌', desc: 'Pray Fajr on time for 40 days', kind: 'p', key: 'Fajr', target: 40 },
  { id: 'istighfar40', name: '40 Days of Istighfar', icon: '🤍', desc: 'Make istighfar every day for 40 days', kind: 'd', key: 'istighfar', target: 40 },
  { id: 'quran40', name: "40 Days of Qur'an", icon: '📖', desc: "Read from the Qur'an every day for 40 days", kind: 'd', key: 'quran', target: 40 },
  { id: 'salawat40', name: '40 Days of Salawat', icon: '💚', desc: 'Send salawat on the Prophet ﷺ every day for 40 days', kind: 'd', key: 'salawat', target: 40 }
];
