// features/spiritual-growth/data.js
// Shared progress calculation for all spiritual growth features

const FEATURE_STAGES = {
  garden: [
    { name: 'Seed', icon: 'sprout', xp: 0 },
    { name: 'Sprout', icon: 'leaf', xp: 150 },
    { name: 'Sapling', icon: 'tree', xp: 500 },
    { name: 'Young Tree', icon: 'tree', xp: 1500 },
    { name: 'Mature Tree', icon: 'tree', xp: 4000 },
    { name: 'Blooming Tree', icon: 'flower', xp: 10000 },
    { name: 'Paradise Garden', icon: 'tree', xp: 25000 }
  ],
  lantern: [
    { name: 'Dim', icon: 'zap', xp: 0 },
    { name: 'Flickering', icon: 'zap', xp: 200 },
    { name: 'Steady', icon: 'zap', xp: 600 },
    { name: 'Glowing', icon: 'zap', xp: 1800 },
    { name: 'Radiant', icon: 'sparkles', xp: 5000 },
    { name: 'Brilliant', icon: 'sparkles', xp: 12000 },
    { name: 'Divine Light', icon: 'sparkles', xp: 30000 }
  ],
  mosque: [
    { name: 'Foundation', icon: 'mosque', xp: 0 },
    { name: 'Walls', icon: 'castle', xp: 250 },
    { name: 'Roof', icon: 'castle', xp: 750 },
    { name: 'Dome', icon: 'mosque', xp: 2000 },
    { name: 'Minaret', icon: 'castle', xp: 5500 },
    { name: 'Interior', icon: 'sparkles', xp: 14000 },
    { name: 'Complete', icon: 'mosque', xp: 35000 }
  ],
  boat: [
    { name: 'Dock', icon: 'anchor', xp: 0 },
    { name: 'Setting Sail', icon: 'anchor', xp: 300 },
    { name: 'Open Sea', icon: 'waves', xp: 900 },
    { name: 'Storm', icon: 'cloud-lightning', xp: 2500 },
    { name: 'Calm Waters', icon: 'sunrise', xp: 7000 },
    { name: 'Paradise Island', icon: 'waves', xp: 18000 },
    { name: 'Jannah', icon: 'tree', xp: 45000 }
  ],
  keys: [
    { name: 'Stone', icon: 'circle', xp: 0 },
    { name: 'Clay', icon: 'circle', xp: 400 },
    { name: 'Copper', icon: 'circle', xp: 1200 },
    { name: 'Iron', icon: 'circle', xp: 3200 },
    { name: 'Silver', icon: 'star', xp: 9000 },
    { name: 'Gold', icon: 'star', xp: 22000 },
    { name: 'Light', icon: 'sparkles', xp: 55000 }
  ],
  armor: [
    { name: 'Belt', icon: 'shield', xp: 0 },
    { name: 'Boots', icon: 'shield', xp: 450 },
    { name: 'Helmet', icon: 'shield', xp: 1400 },
    { name: 'Shirt', icon: 'shield', xp: 3800 },
    { name: 'Shield', icon: 'shield', xp: 10000 },
    { name: 'Sword', icon: 'target', xp: 25000 },
    { name: 'Full Set', icon: 'shield', xp: 60000 }
  ],
  heart: [
    { name: 'Stone Heart', icon: 'heart', xp: 0 },
    { name: 'Softening', icon: 'heart', xp: 500 },
    { name: 'Awakening', icon: 'heart', xp: 1600 },
    { name: 'Warming', icon: 'heart', xp: 4200 },
    { name: 'Radiant', icon: 'heartbeat', xp: 11000 },
    { name: 'Golden', icon: 'heartbeat', xp: 28000 },
    { name: 'Pure Light', icon: 'sparkles', xp: 70000 }
  ],
  ramadan: [
    { name: 'Day 1', icon: 'moon', xp: 0 },
    { name: 'Day 7', icon: 'moon', xp: 800 },
    { name: 'Day 14', icon: 'moon', xp: 2600 },
    { name: 'Day 21', icon: 'moon', xp: 7000 },
    { name: 'Day 25', icon: 'moon', xp: 18000 },
    { name: 'Day 27', icon: 'moon', xp: 45000 },
    { name: 'Day 30', icon: 'moon', xp: 110000 }
  ],
  laylat: [
    { name: 'Night 1', icon: 'sparkles', xp: 0 },
    { name: 'Night 3', icon: 'sparkles', xp: 900 },
    { name: 'Night 5', icon: 'sparkles', xp: 2800 },
    { name: 'Night 7', icon: 'star', xp: 7500 },
    { name: 'Night 9', icon: 'star', xp: 20000 },
    { name: 'Night 27', icon: 'star', xp: 50000 },
    { name: 'Night 29', icon: 'star', xp: 125000 }
  ]
};

function getFeatureProgress(featureName) {
  const xp = S.xp || 0;
  const streak = Math.max(S.cs || 0, S.bs || 0);
  const combined = xp + (streak * 10);
  
  const stages = FEATURE_STAGES[featureName];
  if (!stages) return null;
  
  let currentStage = 0;
  for (let i = 0; i < stages.length; i++) {
    if (combined >= stages[i].xp) currentStage = i;
  }
  
  const stage = stages[currentStage];
  const nextStage = stages[currentStage + 1];
  
  return {
    stage: currentStage + 1,
    totalStages: stages.length,
    name: stage.name,
    icon: stage.icon,
    xp: xp,
    streak: streak,
    combined: combined,
    xpForNext: nextStage ? nextStage.xp : null,
    progress: nextStage ? Math.min(1, (combined - stage.xp) / (nextStage.xp - stage.xp)) : 1
  };
}

const FEATURE_ICONS = {
  garden: iqIcon('sprout'),
  lantern: iqIcon('lantern'),
  keys: iqIcon('key'),
  mosque: iqIcon('mosque'),
  boat: iqIcon('anchor'),
  heart: iqIcon('heart'),
  armor: iqIcon('shield'),
  ramadan: iqIcon('moon'),
  laylat: iqIcon('star')
};

const FEATURE_LABELS = {
  garden: 'Garden',
  lantern: 'Nur Lantern',
  keys: 'Paradise Keys',
  mosque: 'Mosque Builder',
  boat: 'Journey Boat',
  heart: 'Heart Refinement',
  armor: 'Spiritual Armor',
  ramadan: 'Ramadan Tracker',
  laylat: 'Laylat al-Qadr Meter'
};

window.SpiritualGrowth = window.SpiritualGrowth || {};
window.SpiritualGrowth.getProgress = getFeatureProgress;
window.SpiritualGrowth.STAGES = FEATURE_STAGES;
window.SpiritualGrowth.FEATURE_ICONS = FEATURE_ICONS;
window.SpiritualGrowth.FEATURE_LABELS = FEATURE_LABELS;