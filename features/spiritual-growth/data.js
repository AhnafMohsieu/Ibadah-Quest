// features/spiritual-growth/data.js
// Shared progress calculation for all spiritual growth features

const FEATURE_STAGES = {
  garden: [
    { name: 'Seed', icon: '🌱', xp: 0 },
    { name: 'Sprout', icon: '🌿', xp: 150 },
    { name: 'Sapling', icon: '🌳', xp: 500 },
    { name: 'Young Tree', icon: '🌲', xp: 1500 },
    { name: 'Mature Tree', icon: '🌳', xp: 4000 },
    { name: 'Blooming Tree', icon: '🌸', xp: 10000 },
    { name: 'Paradise Garden', icon: '🌴', xp: 25000 }
  ],
  lantern: [
    { name: 'Dim', icon: '🏮', xp: 0 },
    { name: 'Flickering', icon: '🏮', xp: 200 },
    { name: 'Steady', icon: '🏮', xp: 600 },
    { name: 'Glowing', icon: '🏮', xp: 1800 },
    { name: 'Radiant', icon: '🏮', xp: 5000 },
    { name: 'Brilliant', icon: '🏮', xp: 12000 },
    { name: 'Divine Light', icon: '✨', xp: 30000 }
  ],
  mosque: [
    { name: 'Foundation', icon: '🕌', xp: 0 },
    { name: 'Walls', icon: '🏗️', xp: 250 },
    { name: 'Roof', icon: '🏠', xp: 750 },
    { name: 'Dome', icon: '🕌', xp: 2000 },
    { name: 'Minaret', icon: '🗼', xp: 5500 },
    { name: 'Interior', icon: '✨', xp: 14000 },
    { name: 'Complete', icon: '🕌', xp: 35000 }
  ],
  boat: [
    { name: 'Dock', icon: '⛵', xp: 0 },
    { name: 'Setting Sail', icon: '⛵', xp: 300 },
    { name: 'Open Sea', icon: '🌊', xp: 900 },
    { name: 'Storm', icon: '⛈️', xp: 2500 },
    { name: 'Calm Waters', icon: '🌅', xp: 7000 },
    { name: 'Paradise Island', icon: '🏝️', xp: 18000 },
    { name: 'Jannah', icon: '🌴', xp: 45000 }
  ],
  mountain: [
    { name: 'Base', icon: '⛰️', xp: 0 },
    { name: 'Foothill', icon: '🏔️', xp: 350 },
    { name: 'Trail', icon: '🥾', xp: 1000 },
    { name: 'Cliff', icon: '🧗', xp: 2800 },
    { name: 'Summit', icon: '🏔️', xp: 8000 },
    { name: 'Cave', icon: '🕳️', xp: 20000 },
    { name: 'Divine Light', icon: '✨', xp: 50000 }
  ],
  heart: [
    { name: 'Stone', icon: '🪨', xp: 0 },
    { name: 'Clay', icon: '🧱', xp: 400 },
    { name: 'Copper', icon: '🔶', xp: 1200 },
    { name: 'Iron', icon: '⬛', xp: 3200 },
    { name: 'Silver', icon: '⚪', xp: 9000 },
    { name: 'Gold', icon: '🟡', xp: 22000 },
    { name: 'Light', icon: '✨', xp: 55000 }
  ],
  armor: [
    { name: 'Belt', icon: '🥋', xp: 0 },
    { name: 'Boots', icon: '👢', xp: 450 },
    { name: 'Helmet', icon: '⛑️', xp: 1400 },
    { name: 'Shirt', icon: '👕', xp: 3800 },
    { name: 'Shield', icon: '🛡️', xp: 10000 },
    { name: 'Sword', icon: '⚔️', xp: 25000 },
    { name: 'Full Set', icon: '🛡️', xp: 60000 }
  ],
  constellation: [
    { name: '1 Star', icon: '⭐', xp: 0 },
    { name: '3 Stars', icon: '⭐⭐⭐', xp: 500 },
    { name: '5 Stars', icon: '⭐⭐⭐⭐⭐', xp: 1600 },
    { name: '7 Stars', icon: '✨', xp: 4200 },
    { name: '10 Stars', icon: '🌟', xp: 11000 },
    { name: 'Full Constellation', icon: '🌌', xp: 28000 },
    { name: 'Galaxy', icon: '🌀', xp: 70000 }
  ],
  keys: [
    { name: '1 Key', icon: '🗝️', xp: 0 },
    { name: '2 Keys', icon: '🗝️🗝️', xp: 550 },
    { name: '3 Keys', icon: '🗝️🗝️🗝️', xp: 1800 },
    { name: '5 Keys', icon: '🔐', xp: 5000 },
    { name: '7 Keys', icon: '🔐', xp: 13000 },
    { name: '9 Keys', icon: '🔐', xp: 32000 },
    { name: '10 Keys', icon: '🚪', xp: 80000 }
  ],
  well: [
    { name: 'Empty', icon: '🪣', xp: 0 },
    { name: '15%', icon: '💧', xp: 600 },
    { name: '30%', icon: '💧💧', xp: 2000 },
    { name: '50%', icon: '💧💧💧', xp: 5500 },
    { name: '70%', icon: '🌊', xp: 15000 },
    { name: '85%', icon: '🌊', xp: 38000 },
    { name: 'Full', icon: '⛲', xp: 95000 }
  ],
  desert: [
    { name: 'Sand', icon: '🏜️', xp: 0 },
    { name: 'Pebbles', icon: '🪨', xp: 700 },
    { name: 'Cactus', icon: '🌵', xp: 2200 },
    { name: 'Bush', icon: '🌿', xp: 6000 },
    { name: 'Trees', icon: '🌳', xp: 16000 },
    { name: 'Flowers', icon: '🌸', xp: 40000 },
    { name: 'Oasis', icon: '🏝️', xp: 100000 }
  ],
  ramadan: [
    { name: 'Day 1', icon: '🌙', xp: 0 },
    { name: 'Day 7', icon: '🌙', xp: 800 },
    { name: 'Day 14', icon: '🌙', xp: 2600 },
    { name: 'Day 21', icon: '🌙', xp: 7000 },
    { name: 'Day 25', icon: '🌙', xp: 18000 },
    { name: 'Day 27', icon: '🌙', xp: 45000 },
    { name: 'Day 30', icon: '🌙', xp: 110000 }
  ],
  laylat: [
    { name: 'Night 1', icon: '✨', xp: 0 },
    { name: 'Night 3', icon: '✨✨', xp: 900 },
    { name: 'Night 5', icon: '✨✨✨', xp: 2800 },
    { name: 'Night 7', icon: '🌟', xp: 7500 },
    { name: 'Night 9', icon: '🌟🌟', xp: 20000 },
    { name: 'Night 27', icon: '🌟🌟🌟', xp: 50000 },
    { name: 'Night 29', icon: '🌌', xp: 125000 }
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
  garden: '<i class="fa-solid fa-seedling"></i>',
  lantern: '<i class="fa-solid fa-lightbulb"></i>',
  keys: '<i class="fa-solid fa-key"></i>',
  mosque: '<i class="fa-solid fa-mosque"></i>',
  boat: '<i class="fa-solid fa-sailboat"></i>',
  mountain: '<i class="fa-solid fa-mountain"></i>',
  heart: '<i class="fa-solid fa-heart"></i>',
  armor: '<i class="fa-solid fa-shield-halved"></i>',
  constellation: '<i class="fa-solid fa-star"></i>',
  well: '<i class="fa-solid fa-water"></i>',
  desert: '<i class="fa-solid fa-pagelines"></i>',
  ramadan: '<i class="fa-solid fa-moon"></i>',
  laylat: '<i class="fa-solid fa-star"></i>'
};

const FEATURE_LABELS = {
  garden: 'Garden',
  lantern: 'Nur Lantern',
  keys: 'Paradise Keys',
  mosque: 'Mosque Builder',
  boat: 'Journey Boat',
  mountain: 'Mount Nur Climber',
  heart: 'Heart Refinement',
  armor: 'Spiritual Armor',
  constellation: 'Star Constellation',
  well: 'Water Well',
  desert: 'Desert Garden',
  ramadan: 'Ramadan Tracker',
  laylat: 'Laylat al-Qadr Meter'
};

window.SpiritualGrowth = window.SpiritualGrowth || {};
window.SpiritualGrowth.getProgress = getFeatureProgress;
window.SpiritualGrowth.STAGES = FEATURE_STAGES;
window.SpiritualGrowth.FEATURE_ICONS = FEATURE_ICONS;
window.SpiritualGrowth.FEATURE_LABELS = FEATURE_LABELS;