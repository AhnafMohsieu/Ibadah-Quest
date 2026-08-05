# Spiritual Growth Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add13 new gamified spiritual features to Ibadah Quest, complementing the existing Spiritual Garden with 7-stage progression system.

**Architecture:** Hybrid directory structure with shared progress calculation, SVG illustrations matching garden aesthetic, and toggle system in Profile settings.

**Tech Stack:** Vanilla JavaScript, SVG illustrations, CSS gradients, localStorage for persistence.

## Global Constraints

- All features share XP + streak progress source
- 7 stages per feature with XP thresholds
- SVG illustrations matching garden's gold/green Islamic aesthetic
- Toggleable via Profile settings (all visible by default)
- Mobile responsive design
- No external dependencies (pure vanilla JS)

---

## Phase 1: Core Infrastructure

### Task 1: Create Directory Structure

**Files:**
- Create: `features/spiritual-growth/` directory
- Create: `features/spiritual-growth/data.js`
- Create: `features/spiritual-growth/index.js`

**Interfaces:**
- Consumes: `S.xp`, `S.cs`, `S.bs` from state
- Produces: `window.SpiritualGrowth` namespace

- [ ] **Step 1: Create directory**

```bash
mkdir -p features/spiritual-growth
```

- [ ] **Step 2: Create data.js with progress calculation**

```javascript
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
  daynight: [
    { name: 'Dawn', icon: '🌅', xp: 0 },
    { name: 'Morning', icon: '☀️', xp: 750 },
    { name: 'Midday', icon: '🌞', xp: 2400 },
    { name: 'Afternoon', icon: '🌤️', xp: 6500 },
    { name: 'Sunset', icon: '🌇', xp: 17000 },
    { name: 'Night', icon: '🌙', xp: 42000 },
    { name: 'Dawn', icon: '🌅', xp: 105000 }
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

window.SpiritualGrowth = window.SpiritualGrowth || {};
window.SpiritualGrowth.getProgress = getFeatureProgress;
window.SpiritualGrowth.STAGES = FEATURE_STAGES;
```

- [ ] **Step 3: Create index.js with main controller**

```javascript
// features/spiritual-growth/index.js
// Main controller for spiritual growth features

(function() {
  const DEFAULT_VISIBLE = ['garden', 'lantern', 'keys', 'daynight'];
  
  function getSettings() {
    return S.growthSettings || { visible: [...DEFAULT_VISIBLE] };
  }
  
  function saveSettings(settings) {
    S.growthSettings = settings;
    save();
  }
  
  function isVisible(featureName) {
    const settings = getSettings();
    return settings.visible.includes(featureName);
  }
  
  function toggleFeature(featureName) {
    const settings = getSettings();
    const idx = settings.visible.indexOf(featureName);
    if (idx >= 0) {
      settings.visible.splice(idx, 1);
    } else {
      settings.visible.push(featureName);
    }
    saveSettings(settings);
    renderGrowthSettings();
  }
  
  function renderGrowthSettings() {
    const el = document.getElementById('growthSettingsArea');
    if (!el) return;
    
    const settings = getSettings();
    const features = Object.keys(FEATURE_STAGES);
    
    let h = '<div class="section-title">🌱 Spiritual Growth Features</div>';
    h += '<div class="growth-settings">';
    
    features.forEach(f => {
      const visible = settings.visible.includes(f);
      const stages = FEATURE_STAGES[f];
      const progress = SpiritualGrowth.getProgress(f);
      
      h += `<div class="growth-setting-item ${visible ? 'active' : ''}" onclick="SpiritualGrowth.toggle('${f}')">
        <div class="growth-setting-icon">${progress.icon}</div>
        <div class="growth-setting-info">
          <div class="growth-setting-name">${f.charAt(0).toUpperCase() + f.slice(1)}</div>
          <div class="growth-setting-stage">${progress.name} (${progress.stage}/${progress.totalStages})</div>
        </div>
        <div class="growth-setting-toggle">${visible ? '👁️' : '🙈'}</div>
      </div>`;
    });
    
    h += '</div>';
    el.innerHTML = h;
  }
  
  // Add to Profile tab
  if (TAB_GROUPS.profile_main) {
    TAB_GROUPS.profile_main.push({ id: 'growth-settings', icon: '⚙️', label: 'Growth' });
  }
  
  window.SpiritualGrowth = window.SpiritualGrowth || {};
  window.SpiritualGrowth.toggle = toggleFeature;
  window.SpiritualGrowth.isVisible = isVisible;
  window.SpiritualGrowth.renderSettings = renderGrowthSettings;
  window.SpiritualGrowth.DEFAULT_VISIBLE = DEFAULT_VISIBLE;
})();
```

- [ ] **Step 4: Commit infrastructure**

```bash
git add features/spiritual-growth/
git commit -m "feat: add spiritual growth infrastructure with shared progress calculation"
```

---

### Task 2: Expand Garden to 7 Stages

**Files:**
- Modify: `features/garden.js`
- Test: `tests/garden.test.js`

**Interfaces:**
- Consumes: `SpiritualGrowth.getProgress('garden')`
- Produces: Updated `renderGarden()` function

- [ ] **Step 1: Update garden.js to use new 7-stage system**

```javascript
// features/garden.js
// Spiritual Garden — Tree of Deeds (Expanded to 7 stages)

(function() {
  const CAPTIONS = [
    'Every seed of a deed counts, no matter how small.',
    'May Allah accept the little you do.',
    'Keep watering your deeds with sincerity.',
    'A quiet habit grows into something beautiful.',
    'Your tree is taking root — persist.',
    'A strong tree withstands the wind — keep going.',
    'Steady, gentle progress is what Allah loves.',
    'Blooming in humility — all praise belongs to Allah.',
    'Your garden is a reflection of your heart.',
    'Each branch represents a habit you\'ve built.',
    'The roots run deep — your foundation is strong.',
    'In the shade of your deeds, others find rest.',
    'A garden of Paradise awaits the patient.'
  ];

  function flowerCount(streak) {
    if (streak < 30) return 0;
    return Math.min(12, Math.floor((streak - 30) / 5) + 1);
  }

  function caption() {
    const d = new Date();
    return CAPTIONS[Math.floor(d.getTime() / 86400000) % CAPTIONS.length];
  }

  function treeSVG(stage, flowers) {
    const FLOWER_POS = [
      [68,118],[132,112],[92,96],[120,86],[78,78],[142,66],[56,60],
      [100,70],[80,60],[120,55],[65,50],[135,45]
    ];
    let flowersSVG = '';
    if (stage === 7) {
      for (let i = 0; i < Math.min(flowers, FLOWER_POS.length); i++) {
        const f = FLOWER_POS[i];
        flowersSVG += `<g transform="translate(${f[0]},${f[1]})"><circle r="7" fill="#E89BB0"/><circle r="3" fill="#FCE694"/></g>`;
      }
    }
    
    // Stage 1: Seed
    if (stage === 1) return `<svg class="garden-svg" viewBox="0 0 200 220">
      <ellipse cx="100" cy="204" rx="60" ry="8" fill="#163024"/>
      <path d="M100 200 Q100 168 100 152" stroke="#2E7D4F" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M100 162 Q78 150 72 160 Q86 170 100 162" fill="#3E9B63"/>
      <path d="M100 156 Q122 144 128 154 Q114 164 100 156" fill="#3E9B63"/>
    </svg>`;
    
    // Stage 2: Sprout
    if (stage === 2) return `<svg class="garden-svg" viewBox="0 0 200 220">
      <ellipse cx="100" cy="204" rx="60" ry="8" fill="#163024"/>
      <path d="M100 200 Q100 150 100 120" stroke="#2E7D4F" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M100 140 Q72 124 66 136 Q82 148 100 140" fill="#3E9B63"/>
      <path d="M100 130 Q128 114 134 126 Q118 138 100 130" fill="#3E9B63"/>
      <path d="M100 120 Q78 104 72 116 Q86 128 100 120" fill="#4CAF7A"/>
      <path d="M100 112 Q122 96 128 108 Q114 120 100 112" fill="#4CAF7A"/>
    </svg>`;
    
    // Stage 3: Sapling
    if (stage === 3) return `<svg class="garden-svg" viewBox="0 0 200 220">
      <ellipse cx="100" cy="204" rx="60" ry="8" fill="#163024"/>
      <path d="M100 204 L96 110 L104 110 Z" fill="#6B4A2B"/>
      <path d="M100 140 L70 118" stroke="#6B4A2B" stroke-width="6" stroke-linecap="round"/>
      <path d="M100 128 L132 104" stroke="#6B4A2B" stroke-width="6" stroke-linecap="round"/>
      <circle cx="66" cy="108" r="16" fill="#3E7C4F"/>
      <circle cx="136" cy="94" r="15" fill="#3E7C4F"/>
      <circle cx="100" cy="92" r="18" fill="#4CAF7A"/>
      <circle cx="100" cy="100" r="17" fill="#3E9B63"/>
    </svg>`;
    
    // Stage 4: Young Tree
    if (stage === 4) return `<svg class="garden-svg" viewBox="0 0 200 220">
      <ellipse cx="100" cy="206" rx="70" ry="9" fill="#163024"/>
      <path d="M96 206 L88 120 L112 120 L104 206 Z" fill="#5C3D21"/>
      <path d="M100 160 L58 128" stroke="#5C3D21" stroke-width="9" stroke-linecap="round"/>
      <path d="M100 146 L146 112" stroke="#5C3D21" stroke-width="9" stroke-linecap="round"/>
      <path d="M100 132 L74 88" stroke="#5C3D21" stroke-width="8" stroke-linecap="round"/>
      <path d="M100 132 L128 84" stroke="#5C3D21" stroke-width="8" stroke-linecap="round"/>
      <circle cx="58" cy="122" r="20" fill="#2E6B3F"/>
      <circle cx="148" cy="106" r="18" fill="#2E6B3F"/>
      <circle cx="72" cy="82" r="20" fill="#3E7C4F"/>
      <circle cx="130" cy="78" r="20" fill="#3E7C4F"/>
      <circle cx="100" cy="92" r="26" fill="#3E9B63"/>
      <circle cx="100" cy="82" r="24" fill="#4CAF7A"/>
    </svg>`;
    
    // Stage 5: Mature Tree
    if (stage === 5) return `<svg class="garden-svg" viewBox="0 0 200 220">
      <ellipse cx="100" cy="208" rx="75" ry="10" fill="#163024"/>
      <path d="M94 208 L82 100 L118 100 L106 208 Z" fill="#5C3D21"/>
      <path d="M100 170 L40 130" stroke="#5C3D21" stroke-width="12" stroke-linecap="round"/>
      <path d="M100 150 L160 110" stroke="#5C3D21" stroke-width="12" stroke-linecap="round"/>
      <path d="M100 135 L55 75" stroke="#5C3D21" stroke-width="10" stroke-linecap="round"/>
      <path d="M100 135 L145 70" stroke="#5C3D21" stroke-width="10" stroke-linecap="round"/>
      <circle cx="40" cy="125" r="28" fill="#2E6B3F"/>
      <circle cx="160" cy="105" r="26" fill="#2E6B3F"/>
      <circle cx="55" cy="70" r="28" fill="#3E7C4F"/>
      <circle cx="145" cy="65" r="28" fill="#3E7C4F"/>
      <circle cx="100" cy="85" r="35" fill="#3E9B63"/>
      <circle cx="100" cy="75" r="32" fill="#4CAF7A"/>
    </svg>`;
    
    // Stage 6: Blooming Tree
    if (stage === 6) return `<svg class="garden-svg" viewBox="0 0 200 220">
      <ellipse cx="100" cy="208" rx="80" ry="11" fill="#163024"/>
      <path d="M92 208 L78 90 L122 90 L108 208 Z" fill="#5C3D21"/>
      <path d="M100 175 L30 125" stroke="#5C3D21" stroke-width="14" stroke-linecap="round"/>
      <path d="M100 155 L170 105" stroke="#5C3D21" stroke-width="14" stroke-linecap="round"/>
      <path d="M100 140 L45 60" stroke="#5C3D21" stroke-width="12" stroke-linecap="round"/>
      <path d="M100 140 L155 55" stroke="#5C3D21" stroke-width="12" stroke-linecap="round"/>
      <circle cx="30" cy="120" r="35" fill="#2E6B3F"/>
      <circle cx="170" cy="100" r="33" fill="#2E6B3F"/>
      <circle cx="45" cy="55" r="35" fill="#3E7C4F"/>
      <circle cx="155" cy="50" r="35" fill="#3E7C4F"/>
      <circle cx="100" cy="80" r="42" fill="#3E9B63"/>
      <circle cx="100" cy="70" r="38" fill="#4CAF7A"/>
      ${flowersSVG}
    </svg>`;
    
    // Stage 7: Paradise Garden (max)
    return `<svg class="garden-svg" viewBox="0 0 200 220">
      <ellipse cx="100" cy="210" rx="85" ry="12" fill="#163024"/>
      <path d="M90 210 L75 85 L125 85 L110 210 Z" fill="#5C3D21"/>
      <path d="M100 180 L20 120" stroke="#5C3D21" stroke-width="16" stroke-linecap="round"/>
      <path d="M100 160 L180 100" stroke="#5C3D21" stroke-width="16" stroke-linecap="round"/>
      <path d="M100 145 L35 45" stroke="#5C3D21" stroke-width="14" stroke-linecap="round"/>
      <path d="M100 145 L165 40" stroke="#5C3D21" stroke-width="14" stroke-linecap="round"/>
      <circle cx="20" cy="115" r="42" fill="#2E6B3F"/>
      <circle cx="180" cy="95" r="40" fill="#2E6B3F"/>
      <circle cx="35" cy="40" r="42" fill="#3E7C4F"/>
      <circle cx="165" cy="35" r="42" fill="#3E7C4F"/>
      <circle cx="100" cy="75" r="50" fill="#3E9B63"/>
      <circle cx="100" cy="65" r="45" fill="#4CAF7A"/>
      ${flowersSVG}
    </svg>`;
  }

  let lastTree = null;
  function renderGarden() {
    try {
      const el = document.getElementById('gardenArea');
      if (!el) return;
      
      const progress = SpiritualGrowth.getProgress('garden');
      const flowers = progress.stage === 7 ? flowerCount(progress.streak) : 0;
      const scale = (1 + 0.12 * progress.progress).toFixed(3);
      const progressText = progress.xpForNext
        ? `${progress.xp}/${progress.xpForNext} XP to ${progress.name}`
        : 'Your garden is in full bloom — keep nourishing it.';
      const key = progress.stage + ':' + flowers;
      
      if (lastTree !== key) {
        el.innerHTML = `<div class="garden-card">
          <div class="garden-tree" style="transform:scale(${scale})">${treeSVG(progress.stage, flowers)}</div>
          <div class="garden-info">
            <div class="garden-stage-name">${progress.icon} ${progress.name}</div>
            <div class="garden-progress">${progressText}</div>
            <div class="garden-progress-bar">
              <div class="garden-progress-fill" style="width:${Math.round(progress.progress * 100)}%"></div>
            </div>
            ${progress.xpForNext ? `<div class="garden-progress-sub">Stage ${progress.stage}/${progress.totalStages}</div>` : ''}
            <div class="garden-caption">${caption()}</div>
          </div>
        </div>`;
        lastTree = key;
      }
      
      const tree = el.querySelector('.garden-tree');
      if (!tree) return;
      tree.style.transform = 'scale(' + scale + ')';
      el.querySelector('.garden-progress').textContent = progressText;
      el.querySelector('.garden-progress-fill').style.width = Math.round(progress.progress * 100) + '%';
      el.querySelector('.garden-caption').textContent = caption();
    } catch (e) { console.warn('Render Garden failed:', e.message); }
  }

  window.renderGarden = renderGarden;
})();
```

- [ ] **Step 2: Update garden test for 7 stages**

```javascript
// tests/garden.test.js
const path = require('path');
const fs = require('fs');
const vm = require('vm');

test('garden starts at Seed (stage 1)', () => {
  const code = fs.readFileSync(path.join(__dirname, '..', 'features', 'garden.js'), 'utf8');
  const sandbox = { window: {} };
  sandbox.window.SpiritualGrowth = {
    getProgress: (name) => ({
      stage: 1, totalStages: 7, name: 'Seed', icon: '🌱',
      xp: 0, streak: 0, combined: 0, xpForNext: 150, progress: 0
    })
  };
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox);
  assert.strictEqual(typeof sandbox.window.renderGarden, 'function');
});

test('garden expands to 7 stages', () => {
  const code = fs.readFileSync(path.join(__dirname, '..', 'features', 'garden.js'), 'utf8');
  const sandbox = { window: {} };
  sandbox.window.SpiritualGrowth = {
    getProgress: (name) => ({
      stage: 7, totalStages: 7, name: 'Paradise Garden', icon: '🌴',
      xp: 25000, streak: 100, combined: 26000, xpForNext: null, progress: 1
    })
  };
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox);
  assert.strictEqual(typeof sandbox.window.renderGarden, 'function');
});
```

- [ ] **Step 3: Run tests**

```bash
node --experimental-vm-modules node_modules/.bin/jest tests/garden.test.js
```

- [ ] **Step 4: Commit expanded garden**

```bash
git add features/garden.js tests/garden.test.js
git commit -m "feat: expand garden from 5 to 7 stages"
```

---

## Phase 2: Implement Features (Batch 1 - Default Visible)

### Task 3: Implement Nur Lantern

**Files:**
- Create: `features/spiritual-growth/lantern.js`

**Interfaces:**
- Consumes: `SpiritualGrowth.getProgress('lantern')`, `SpiritualGrowth.isVisible('lantern')`
- Produces: `window.renderLantern()` function

- [ ] **Step 1: Create lantern.js**

```javascript
// features/spiritual-growth/lantern.js
// Nur Lantern — Glows brighter with each deed

(function() {
  function lanternSVG(stage, progress) {
    const glowIntensity = progress * 0.8;
    const glowColor = `rgba(212, 175, 55, ${glowIntensity})`;
    
    // Base lantern shape
    let svg = `<svg class="spiritual-svg" viewBox="0 0 120 160">
      <defs>
        <radialGradient id="lanternGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" style="stop-color:${glowColor}"/>
          <stop offset="100%" style="stop-color:rgba(212, 175, 55, 0)"/>
        </radialGradient>
      </defs>
      <circle cx="60" cy="80" r="50" fill="url(#lanternGlow)"/>
      <rect x="45" y="30" width="30" height="10" rx="2" fill="#8B4513"/>
      <rect x="50" y="20" width="20" height="15" rx="3" fill="#D4AF37"/>
      <path d="M40 40 L40 120 Q40 140 60 140 Q80 140 80 120 L80 40 Z" fill="#D4AF37" opacity="0.3"/>
      <path d="M45 45 L45 115 Q45 135 60 135 Q75 135 75 115 L75 45 Z" fill="#FFE97D" opacity="${0.3 + glowIntensity * 0.5}"/>
      <circle cx="60" cy="80" r="15" fill="#FFF" opacity="${glowIntensity * 0.6}"/>
    </svg>`;
    
    return svg;
  }

  function renderLantern() {
    const el = document.getElementById('lanternArea');
    if (!el || !SpiritualGrowth.isVisible('lantern')) {
      if (el) el.innerHTML = '';
      return;
    }
    
    const progress = SpiritualGrowth.getProgress('lantern');
    const progressText = progress.xpForNext
      ? `${progress.xp}/${progress.xpForNext} XP to ${progress.name}`
      : 'Your lantern shines with divine light.';
    
    el.innerHTML = `<div class="spiritual-card">
      <div class="spiritual-svg-wrap">${lanternSVG(progress.stage, progress.progress)}</div>
      <div class="spiritual-info">
        <div class="spiritual-stage-name">${progress.icon} Nur Lantern</div>
        <div class="spiritual-stage-level">${progress.name} (${progress.stage}/${progress.totalStages})</div>
        <div class="spiritual-progress">${progressText}</div>
        <div class="spiritual-progress-bar">
          <div class="spiritual-progress-fill" style="width:${Math.round(progress.progress * 100)}%"></div>
        </div>
      </div>
    </div>`;
  }

  window.renderLantern = renderLantern;
})();
```

- [ ] **Step 2: Commit lantern**

```bash
git add features/spiritual-growth/lantern.js
git commit -m "feat: add Nur Lantern spiritual growth feature"
```

---

### Task 4: Implement Paradise Keys

**Files:**
- Create: `features/spiritual-growth/keys.js`

**Interfaces:**
- Consumes: `SpiritualGrowth.getProgress('keys')`, `SpiritualGrowth.isVisible('keys')`
- Produces: `window.renderKeys()` function

- [ ] **Step 1: Create keys.js**

```javascript
// features/spiritual-growth/keys.js
// Paradise Keys — Collect keys to open gates of Jannah

(function() {
  function keysSVG(stage, progress) {
    const keyCount = Math.min(stage, 7);
    let keys = '';
    
    for (let i = 0; i < keyCount; i++) {
      const x = 30 + (i * 12);
      const y = 60 + (i % 2 === 0 ? 0 : 10);
      const rotation = -15 + (i * 5);
      keys += `<g transform="translate(${x}, ${y}) rotate(${rotation})">
        <circle r="8" fill="none" stroke="#D4AF37" stroke-width="2"/>
        <rect x="-2" y="8" width="4" height="20" fill="#D4AF37"/>
        <rect x="-2" y="22" width="8" height="3" fill="#D4AF37"/>
        <rect x="-2" y="16" width="6" height="3" fill="#D4AF37"/>
      </g>`;
    }
    
    return `<svg class="spiritual-svg" viewBox="0 0 120 160">
      <circle cx="60" cy="40" r="25" fill="none" stroke="#D4AF37" stroke-width="3"/>
      ${keys}
    </svg>`;
  }

  function renderKeys() {
    const el = document.getElementById('keysArea');
    if (!el || !SpiritualGrowth.isVisible('keys')) {
      if (el) el.innerHTML = '';
      return;
    }
    
    const progress = SpiritualGrowth.getProgress('keys');
    const progressText = progress.xpForNext
      ? `${progress.xp}/${progress.xpForNext} XP to ${progress.name}`
      : 'You hold the keys to all gates of Jannah.';
    
    el.innerHTML = `<div class="spiritual-card">
      <div class="spiritual-svg-wrap">${keysSVG(progress.stage, progress.progress)}</div>
      <div class="spiritual-info">
        <div class="spiritual-stage-name">${progress.icon} Paradise Keys</div>
        <div class="spiritual-stage-level">${progress.name} (${progress.stage}/${progress.totalStages})</div>
        <div class="spiritual-progress">${progressText}</div>
        <div class="spiritual-progress-bar">
          <div class="spiritual-progress-fill" style="width:${Math.round(progress.progress * 100)}%"></div>
        </div>
      </div>
    </div>`;
  }

  window.renderKeys = renderKeys;
})();
```

- [ ] **Step 2: Commit keys**

```bash
git add features/spiritual-growth/keys.js
git commit -m "feat: add Paradise Keys spiritual growth feature"
```

---

### Task 5: Implement Day/Night Cycle

**Files:**
- Create: `features/spiritual-growth/daynight.js`

**Interfaces:**
- Consumes: `SpiritualGrowth.getProgress('daynight')`, `SpiritualGrowth.isVisible('daynight')`
- Produces: `window.renderDayNight()` function

- [ ] **Step 1: Create daynight.js**

```javascript
// features/spiritual-growth/daynight.js
// Day/Night Cycle — Ambient background based on deeds

(function() {
  const SKY_COLORS = {
    1: ['#FFB347', '#FF6B6B'], // Dawn
    2: ['#87CEEB', '#FFD700'], // Morning
    3: ['#4A90E2', '#FFD700'], // Midday
    4: ['#FFA07A', '#FFD700'], // Afternoon
    5: ['#FF6B6B', '#4A90E2'], // Sunset
    6: ['#191970', '#4A90E2'], // Night
    7: ['#FFB347', '#FF6B6B']  // Dawn (cycle complete)
  };

  function skyGradient(stage) {
    const colors = SKY_COLORS[stage] || SKY_COLORS[1];
    return `linear-gradient(180deg, ${colors[0]} 0%, ${colors[1]} 100%)`;
  }

  function daynightSVG(stage, progress) {
    const gradient = skyGradient(stage);
    
    let celestial = '';
    if (stage <= 2 || stage === 7) {
      // Sun for morning/dawn
      celestial = `<circle cx="60" cy="40" r="20" fill="#FFD700" opacity="0.9"/>`;
    } else if (stage === 3 || stage === 4) {
      // Sun higher for midday/afternoon
      celestial = `<circle cx="60" cy="30" r="25" fill="#FFD700" opacity="0.9"/>`;
    } else if (stage === 5) {
      // Setting sun
      celestial = `<circle cx="60" cy="60" r="20" fill="#FF6B6B" opacity="0.8"/>`;
    } else if (stage === 6) {
      // Moon and stars for night
      celestial = `<circle cx="60" cy="35" r="15" fill="#F5F5DC" opacity="0.9"/>
        <circle cx="30" cy="25" r="2" fill="#FFF" opacity="0.7"/>
        <circle cx="85" cy="30" r="2" fill="#FFF" opacity="0.7"/>
        <circle cx="45" cy="15" r="1.5" fill="#FFF" opacity="0.6"/>
        <circle cx="75" cy="20" r="1.5" fill="#FFF" opacity="0.6"/>`;
    }
    
    return `<svg class="spiritual-svg" viewBox="0 0 120 160">
      <rect width="120" height="160" fill="${gradient}" rx="10"/>
      ${celestial}
      <rect y="120" width="120" height="40" fill="#2E5D3A" rx="5"/>
    </svg>`;
  }

  function renderDayNight() {
    const el = document.getElementById('daynightArea');
    if (!el || !SpiritualGrowth.isVisible('daynight')) {
      if (el) el.innerHTML = '';
      return;
    }
    
    const progress = SpiritualGrowth.getProgress('daynight');
    const progressText = progress.xpForNext
      ? `${progress.xp}/${progress.xpForNext} XP to ${progress.name}`
      : 'Your cycle is complete — eternal light.';
    
    el.innerHTML = `<div class="spiritual-card">
      <div class="spiritual-svg-wrap">${daynightSVG(progress.stage, progress.progress)}</div>
      <div class="spiritual-info">
        <div class="spiritual-stage-name">${progress.icon} Day/Night Cycle</div>
        <div class="spiritual-stage-level">${progress.name} (${progress.stage}/${progress.totalStages})</div>
        <div class="spiritual-progress">${progressText}</div>
        <div class="spiritual-progress-bar">
          <div class="spiritual-progress-fill" style="width:${Math.round(progress.progress * 100)}%"></div>
        </div>
      </div>
    </div>`;
  }

  window.renderDayNight = renderDayNight;
})();
```

- [ ] **Step 2: Commit daynight**

```bash
git add features/spiritual-growth/daynight.js
git commit -m "feat: add Day/Night Cycle spiritual growth feature"
```

---

## Phase 3: Implement Features (Batch 2)

### Task 6: Implement Mosque Builder

**Files:**
- Create: `features/spiritual-growth/mosque.js`

**Interfaces:**
- Consumes: `SpiritualGrowth.getProgress('mosque')`, `SpiritualGrowth.isVisible('mosque')`
- Produces: `window.renderMosque()` function

- [ ] **Step 1: Create mosque.js**

```javascript
// features/spiritual-growth/mosque.js
// Mosque Builder — Construct a mosque piece by piece

(function() {
  function mosqueSVG(stage, progress) {
    let parts = '';
    
    // Foundation (always visible)
    parts += `<rect x="20" y="120" width="80" height="15" fill="#8B4513"/>`;
    
    if (stage >= 2) { // Walls
      parts += `<rect x="25" y="70" width="70" height="50" fill="#D4AF37" opacity="0.8"/>`;
    }
    
    if (stage >= 3) { // Roof
      parts += `<polygon points="20,70 60,40 100,70" fill="#8B4513"/>`;
    }
    
    if (stage >= 4) { // Dome
      parts += `<ellipse cx="60" cy="45" rx="25" ry="20" fill="#D4AF37"/>`;
      parts += `<circle cx="60" cy="25" r="5" fill="#FFD700"/>`;
    }
    
    if (stage >= 5) { // Minaret
      parts += `<rect x="100" y="50" width="10" height="70" fill="#D4AF37"/>`;
      parts += `<ellipse cx="105" cy="45" rx="8" ry="10" fill="#FFD700"/>`;
      parts += `<circle cx="105" cy="35" r="3" fill="#FFD700"/>`;
    }
    
    if (stage >= 6) { // Interior
      parts += `<rect x="45" y="90" width="30" height="30" fill="#0b1114" opacity="0.5"/>`;
      parts += `<rect x="50" y="95" width="20" height="25" fill="#FFE97D" opacity="0.3"/>`;
    }
    
    // Complete (stage 7) - add glow
    if (stage === 7) {
      parts += `<circle cx="60" cy="70" r="50" fill="none" stroke="#D4AF37" stroke-width="2" opacity="0.5"/>`;
    }
    
    return `<svg class="spiritual-svg" viewBox="0 0 120 160">
      <rect width="120" height="160" fill="#0b1114" rx="10"/>
      ${parts}
    </svg>`;
  }

  function renderMosque() {
    const el = document.getElementById('mosqueArea');
    if (!el || !SpiritualGrowth.isVisible('mosque')) {
      if (el) el.innerHTML = '';
      return;
    }
    
    const progress = SpiritualGrowth.getProgress('mosque');
    const progressText = progress.xpForNext
      ? `${progress.xp}/${progress.xpForNext} XP to ${progress.name}`
      : 'Your mosque is complete — a house of Allah.';
    
    el.innerHTML = `<div class="spiritual-card">
      <div class="spiritual-svg-wrap">${mosqueSVG(progress.stage, progress.progress)}</div>
      <div class="spiritual-info">
        <div class="spiritual-stage-name">${progress.icon} Mosque Builder</div>
        <div class="spiritual-stage-level">${progress.name} (${progress.stage}/${progress.totalStages})</div>
        <div class="spiritual-progress">${progressText}</div>
        <div class="spiritual-progress-bar">
          <div class="spiritual-progress-fill" style="width:${Math.round(progress.progress * 100)}%"></div>
        </div>
      </div>
    </div>`;
  }

  window.renderMosque = renderMosque;
})();
```

- [ ] **Step 2: Commit mosque**

```bash
git add features/spiritual-growth/mosque.js
git commit -m "feat: add Mosque Builder spiritual growth feature"
```

---

### Task 7: Implement Journey Boat

**Files:**
- Create: `features/spiritual-growth/boat.js`

**Interfaces:**
- Consumes: `SpiritualGrowth.getProgress('boat')`, `SpiritualGrowth.isVisible('boat')`
- Produces: `window.renderBoat()` function

- [ ] **Step 1: Create boat.js**

```javascript
// features/spiritual-growth/boat.js
// Journey Boat — Sail across the ocean to Jannah

(function() {
  function boatSVG(stage, progress) {
    const waterLevel = 100;
    const boatX = 20 + (progress * 80); // Boat moves across
    
    let water = `<rect y="${waterLevel}" width="120" height="60" fill="#1E90FF" opacity="0.6" rx="5"/>`;
    
    // Waves
    for (let i = 0; i < 3; i++) {
      const waveY = waterLevel + 10 + (i * 15);
      water += `<path d="M0 ${waveY} Q30 ${waveY-10} 60 ${waveY} Q90 ${waveY+10} 120 ${waveY}" fill="none" stroke="#4A90E2" stroke-width="2" opacity="0.5"/>`;
    }
    
    // Boat
    let boat = `<g transform="translate(${boatX}, ${waterLevel - 20})">
      <path d="M-15 0 L15 0 L10 15 L-10 15 Z" fill="#8B4513"/>
      <line x1="0" y1="0" x2="0" y2="-30" stroke="#8B4513" stroke-width="2"/>
      <polygon points="0,-30 20,-20 0,-10" fill="#FFF" opacity="0.8"/>
    </g>`;
    
    // Island at the end (stage 6+)
    if (stage >= 6) {
      boat += `<ellipse cx="110" cy="${waterLevel}" rx="15" ry="8" fill="#2E5D3A"/>
        <circle cx="110" cy="${waterLevel - 15}" r="10" fill="#3E7C4F"/>`;
    }
    
    // Paradise (stage 7)
    if (stage === 7) {
      boat += `<circle cx="110" cy="${waterLevel - 25}" r="15" fill="#FFD700" opacity="0.5"/>`;
    }
    
    return `<svg class="spiritual-svg" viewBox="0 0 120 160">
      <rect width="120" height="160" fill="#87CEEB" rx="10"/>
      ${water}
      ${boat}
    </svg>`;
  }

  function renderBoat() {
    const el = document.getElementById('boatArea');
    if (!el || !SpiritualGrowth.isVisible('boat')) {
      if (el) el.innerHTML = '';
      return;
    }
    
    const progress = SpiritualGrowth.getProgress('boat');
    const progressText = progress.xpForNext
      ? `${progress.xp}/${progress.xpForNext} XP to ${progress.name}`
      : 'You have reached Jannah — the eternal abode.';
    
    el.innerHTML = `<div class="spiritual-card">
      <div class="spiritual-svg-wrap">${boatSVG(progress.stage, progress.progress)}</div>
      <div class="spiritual-info">
        <div class="spiritual-stage-name">${progress.icon} Journey Boat</div>
        <div class="spiritual-stage-level">${progress.name} (${progress.stage}/${progress.totalStages})</div>
        <div class="spiritual-progress">${progressText}</div>
        <div class="spiritual-progress-bar">
          <div class="spiritual-progress-fill" style="width:${Math.round(progress.progress * 100)}%"></div>
        </div>
      </div>
    </div>`;
  }

  window.renderBoat = renderBoat;
})();
```

- [ ] **Step 2: Commit boat**

```bash
git add features/spiritual-growth/boat.js
git commit -m "feat: add Journey Boat spiritual growth feature"
```

---

### Task 8: Implement Mount Nur Climber

**Files:**
- Create: `features/spiritual-growth/mountain.js`

**Interfaces:**
- Consumes: `SpiritualGrowth.getProgress('mountain')`, `SpiritualGrowth.isVisible('mountain')`
- Produces: `window.renderMountain()` function

- [ ] **Step 1: Create mountain.js**

```javascript
// features/spiritual-growth/mountain.js
// Mount Nur Climber — Climb the mountain of knowledge

(function() {
  function mountainSVG(stage, progress) {
    const climberY = 140 - (progress * 100); // Climber moves up
    
    // Mountain
    let mountain = `<polygon points="60,20 10,140 110,140" fill="#8B4513"/>
      <polygon points="60,20 40,60 80,60" fill="#FFF" opacity="0.3"/>`;
    
    // Path
    mountain += `<path d="M60 140 Q50 120 55 100 Q60 80 50 60 Q45 40 60 20" fill="none" stroke="#D4AF37" stroke-width="2" stroke-dasharray="5,5"/>`;
    
    // Climber
    mountain += `<circle cx="55" cy="${climberY}" r="5" fill="#D4AF37"/>
      <line x1="55" y1="${climberY + 5}" x2="55" y2="${climberY + 15}" stroke="#D4AF37" stroke-width="2"/>
      <line x1="50" y1="${climberY + 10}" x2="60" y2="${climberY + 10}" stroke="#D4AF37" stroke-width="2"/>`;
    
    // Cave at summit (stage 6)
    if (stage >= 6) {
      mountain += `<ellipse cx="60" cy="30" rx="10" ry="8" fill="#0b1114"/>`;
    }
    
    // Divine light at peak (stage 7)
    if (stage === 7) {
      mountain += `<circle cx="60" cy="20" r="15" fill="#FFD700" opacity="0.5"/>`;
      mountain += `<circle cx="60" cy="20" r="8" fill="#FFF" opacity="0.7"/>`;
    }
    
    return `<svg class="spiritual-svg" viewBox="0 0 120 160">
      <rect width="120" height="160" fill="#1a1a2e" rx="10"/>
      ${mountain}
    </svg>`;
  }

  function renderMountain() {
    const el = document.getElementById('mountainArea');
    if (!el || !SpiritualGrowth.isVisible('mountain')) {
      if (el) el.innerHTML = '';
      return;
    }
    
    const progress = SpiritualGrowth.getProgress('mountain');
    const progressText = progress.xpForNext
      ? `${progress.xp}/${progress.xpForNext} XP to ${progress.name}`
      : 'You have reached the summit — divine light awaits.';
    
    el.innerHTML = `<div class="spiritual-card">
      <div class="spiritual-svg-wrap">${mountainSVG(progress.stage, progress.progress)}</div>
      <div class="spiritual-info">
        <div class="spiritual-stage-name">${progress.icon} Mount Nur Climber</div>
        <div class="spiritual-stage-level">${progress.name} (${progress.stage}/${progress.totalStages})</div>
        <div class="spiritual-progress">${progressText}</div>
        <div class="spiritual-progress-bar">
          <div class="spiritual-progress-fill" style="width:${Math.round(progress.progress * 100)}%"></div>
        </div>
      </div>
    </div>`;
  }

  window.renderMountain = renderMountain;
})();
```

- [ ] **Step 2: Commit mountain**

```bash
git add features/spiritual-growth/mountain.js
git commit -m "feat: add Mount Nur Climber spiritual growth feature"
```

---

## Phase 4: Implement Features (Batch 3)

### Task 9: Implement Heart Refinement

**Files:**
- Create: `features/spiritual-growth/heart.js`

**Interfaces:**
- Consumes: `SpiritualGrowth.getProgress('heart')`, `SpiritualGrowth.isVisible('heart')`
- Produces: `window.renderHeart()` function

- [ ] **Step 1: Create heart.js**

```javascript
// features/spiritual-growth/heart.js
// Heart Refinement — Transform your heart from stone to light

(function() {
  const HEART_COLORS = {
    1: '#696969', // Stone
    2: '#CD853F', // Clay
    3: '#B87333', // Copper
    4: '#4A4A4A', // Iron
    5: '#C0C0C0', // Silver
    6: '#FFD700', // Gold
    7: '#FFF'     // Light
  };

  function heartSVG(stage, progress) {
    const color = HEART_COLORS[stage];
    const glow = stage === 7 ? `filter="url(#heartGlow)"` : '';
    
    let svg = `<svg class="spiritual-svg" viewBox="0 0 120 160">
      <defs>
        <filter id="heartGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <path d="M60 140 L20 80 Q0 60 20 40 Q40 20 60 50 Q80 20 100 40 Q120 60 100 80 Z" 
            fill="${color}" ${glow} opacity="0.9"/>`;
    
    if (stage === 7) {
      svg += `<circle cx="60" cy="80" r="20" fill="#FFF" opacity="0.5"/>`;
    }
    
    svg += `</svg>`;
    return svg;
  }

  function renderHeart() {
    const el = document.getElementById('heartArea');
    if (!el || !SpiritualGrowth.isVisible('heart')) {
      if (el) el.innerHTML = '';
      return;
    }
    
    const progress = SpiritualGrowth.getProgress('heart');
    const progressText = progress.xpForNext
      ? `${progress.xp}/${progress.xpForNext} XP to ${progress.name}`
      : 'Your heart is pure light — a reflection of faith.';
    
    el.innerHTML = `<div class="spiritual-card">
      <div class="spiritual-svg-wrap">${heartSVG(progress.stage, progress.progress)}</div>
      <div class="spiritual-info">
        <div class="spiritual-stage-name">${progress.icon} Heart Refinement</div>
        <div class="spiritual-stage-level">${progress.name} (${progress.stage}/${progress.totalStages})</div>
        <div class="spiritual-progress">${progressText}</div>
        <div class="spiritual-progress-bar">
          <div class="spiritual-progress-fill" style="width:${Math.round(progress.progress * 100)}%"></div>
        </div>
      </div>
    </div>`;
  }

  window.renderHeart = renderHeart;
})();
```

- [ ] **Step 2: Commit heart**

```bash
git add features/spiritual-growth/heart.js
git commit -m "feat: add Heart Refinement spiritual growth feature"
```

---

### Task 10: Implement Spiritual Armor

**Files:**
- Create: `features/spiritual-growth/armor.js`

**Interfaces:**
- Consumes: `SpiritualGrowth.getProgress('armor')`, `SpiritualGrowth.isVisible('armor')`
- Produces: `window.renderArmor()` function

- [ ] **Step 1: Create armor.js**

```javascript
// features/spiritual-growth/armor.js
// Spiritual Armor — Collect pieces of protection

(function() {
  function armorSVG(stage, progress) {
    let parts = '';
    
    // Belt (stage 1+)
    if (stage >= 1) {
      parts += `<rect x="35" y="90" width="50" height="10" fill="#D4AF37" rx="2"/>`;
      parts += `<circle cx="60" cy="95" r="5" fill="#FFD700"/>`;
    }
    
    // Boots (stage 2+)
    if (stage >= 2) {
      parts += `<rect x="35" y="120" width="15" height="20" fill="#8B4513" rx="3"/>`;
      parts += `<rect x="70" y="120" width="15" height="20" fill="#8B4513" rx="3"/>`;
    }
    
    // Helmet (stage 3+)
    if (stage >= 3) {
      parts += `<ellipse cx="60" cy="30" rx="20" ry="15" fill="#D4AF37"/>`;
      parts += `<rect x="55" y="40" width="10" height="5" fill="#D4AF37"/>`;
    }
    
    // Shirt (stage 4+)
    if (stage >= 4) {
      parts += `<rect x="40" y="50" width="40" height="40" fill="#D4AF37" opacity="0.7" rx="5"/>`;
    }
    
    // Shield (stage 5+)
    if (stage >= 5) {
      parts += `<ellipse cx="25" cy="70" rx="15" ry="20" fill="#FFD700"/>`;
      parts += `<ellipse cx="25" cy="70" rx="10" ry="15" fill="#D4AF37"/>`;
    }
    
    // Sword (stage 6+)
    if (stage >= 6) {
      parts += `<rect x="95" y="40" width="5" height="60" fill="#C0C0C0" rx="2"/>`;
      parts += `<rect x="90" y="45" width="15" height="5" fill="#8B4513"/>`;
    }
    
    // Full set glow (stage 7)
    if (stage === 7) {
      parts += `<circle cx="60" cy="80" r="50" fill="none" stroke="#FFD700" stroke-width="3" opacity="0.5"/>`;
    }
    
    return `<svg class="spiritual-svg" viewBox="0 0 120 160">
      <rect width="120" height="160" fill="#0b1114" rx="10"/>
      ${parts}
    </svg>`;
  }

  function renderArmor() {
    const el = document.getElementById('armorArea');
    if (!el || !SpiritualGrowth.isVisible('armor')) {
      if (el) el.innerHTML = '';
      return;
    }
    
    const progress = SpiritualGrowth.getProgress('armor');
    const progressText = progress.xpForNext
      ? `${progress.xp}/${progress.xpForNext} XP to ${progress.name}`
      : 'Your armor is complete — full protection.';
    
    el.innerHTML = `<div class="spiritual-card">
      <div class="spiritual-svg-wrap">${armorSVG(progress.stage, progress.progress)}</div>
      <div class="spiritual-info">
        <div class="spiritual-stage-name">${progress.icon} Spiritual Armor</div>
        <div class="spiritual-stage-level">${progress.name} (${progress.stage}/${progress.totalStages})</div>
        <div class="spiritual-progress">${progressText}</div>
        <div class="spiritual-progress-bar">
          <div class="spiritual-progress-fill" style="width:${Math.round(progress.progress * 100)}%"></div>
        </div>
      </div>
    </div>`;
  }

  window.renderArmor = renderArmor;
})();
```

- [ ] **Step 2: Commit armor**

```bash
git add features/spiritual-growth/armor.js
git commit -m "feat: add Spiritual Armor spiritual growth feature"
```

---

### Task 11: Implement Star Constellation

**Files:**
- Create: `features/spiritual-growth/constellation.js`

**Interfaces:**
- Consumes: `SpiritualGrowth.getProgress('constellation')`, `SpiritualGrowth.isVisible('constellation')`
- Produces: `window.renderConstellation()` function

- [ ] **Step 1: Create constellation.js**

```javascript
// features/spiritual-growth/constellation.js
// Star Constellation — Light up the night sky

(function() {
  function constellationSVG(stage, progress) {
    const starCount = [1, 3, 5, 7, 10, 15, 25][stage - 1];
    let stars = '';
    
    // Generate stars
    for (let i = 0; i < starCount; i++) {
      const x = 10 + Math.random() * 100;
      const y = 10 + Math.random() * 100;
      const size = 1 + Math.random() * 2;
      stars += `<circle cx="${x}" cy="${y}" r="${size}" fill="#FFF" opacity="${0.5 + Math.random() * 0.5}"/>`;
    }
    
    // Galaxy effect (stage 7)
    if (stage === 7) {
      stars += `<circle cx="60" cy="60" r="30" fill="none" stroke="#FFD700" stroke-width="1" opacity="0.3"/>`;
      stars += `<circle cx="60" cy="60" r="20" fill="#FFD700" opacity="0.1"/>`;
    }
    
    return `<svg class="spiritual-svg" viewBox="0 0 120 160">
      <rect width="120" height="160" fill="#0a0a1a" rx="10"/>
      ${stars}
    </svg>`;
  }

  function renderConstellation() {
    const el = document.getElementById('constellationArea');
    if (!el || !SpiritualGrowth.isVisible('constellation')) {
      if (el) el.innerHTML = '';
      return;
    }
    
    const progress = SpiritualGrowth.getProgress('constellation');
    const progressText = progress.xpForNext
      ? `${progress.xp}/${progress.xpForNext} XP to ${progress.name}`
      : 'Your constellation shines across the galaxy.';
    
    el.innerHTML = `<div class="spiritual-card">
      <div class="spiritual-svg-wrap">${constellationSVG(progress.stage, progress.progress)}</div>
      <div class="spiritual-info">
        <div class="spiritual-stage-name">${progress.icon} Star Constellation</div>
        <div class="spiritual-stage-level">${progress.name} (${progress.stage}/${progress.totalStages})</div>
        <div class="spiritual-progress">${progressText}</div>
        <div class="spiritual-progress-bar">
          <div class="spiritual-progress-fill" style="width:${Math.round(progress.progress * 100)}%"></div>
        </div>
      </div>
    </div>`;
  }

  window.renderConstellation = renderConstellation;
})();
```

- [ ] **Step 2: Commit constellation**

```bash
git add features/spiritual-growth/constellation.js
git commit -m "feat: add Star Constellation spiritual growth feature"
```

---

## Phase 5: Implement Features (Batch 4)

### Task 12: Implement Water Well

**Files:**
- Create: `features/spiritual-growth/well.js`

**Interfaces:**
- Consumes: `SpiritualGrowth.getProgress('well')`, `SpiritualGrowth.isVisible('well')`
- Produces: `window.renderWell()` function

- [ ] **Step 1: Create well.js**

```javascript
// features/spiritual-growth/well.js
// Water Well — Fill the well with your deeds

(function() {
  function wellSVG(stage, progress) {
    const waterHeight = progress * 60; // Max 60px water
    
    let well = `<svg class="spiritual-svg" viewBox="0 0 120 160">
      <rect width="120" height="160" fill="#0b1114" rx="10"/>
      
      <!-- Well structure -->
      <rect x="30" y="40" width="60" height="80" fill="#8B4513" rx="5"/>
      <rect x="35" y="45" width="50" height="70" fill="#0b1114"/>
      
      <!-- Water -->
      <rect x="35" y="${115 - waterHeight}" width="50" height="${waterHeight}" fill="#1E90FF" opacity="0.7"/>
      
      <!-- Roof -->
      <rect x="25" y="30" width="70" height="10" fill="#8B4513"/>
      <rect x="55" y="20" width="10" height="15" fill="#8B4513"/>
      
      <!-- Bucket -->
      <rect x="50" y="25" width="20" height="15" fill="#D4AF37" rx="2"/>
      <line x1="60" y1="25" x2="60" y2="15" stroke="#8B4513" stroke-width="2"/>
    </svg>`;
    
    return well;
  }

  function renderWell() {
    const el = document.getElementById('wellArea');
    if (!el || !SpiritualGrowth.isVisible('well')) {
      if (el) el.innerHTML = '';
      return;
    }
    
    const progress = SpiritualGrowth.getProgress('well');
    const progressText = progress.xpForNext
      ? `${progress.xp}/${progress.xpForNext} XP to ${progress.name}`
      : 'Your well is full — water of life flows.';
    
    el.innerHTML = `<div class="spiritual-card">
      <div class="spiritual-svg-wrap">${wellSVG(progress.stage, progress.progress)}</div>
      <div class="spiritual-info">
        <div class="spiritual-stage-name">${progress.icon} Water Well</div>
        <div class="spiritual-stage-level">${progress.name} (${progress.stage}/${progress.totalStages})</div>
        <div class="spiritual-progress">${progressText}</div>
        <div class="spiritual-progress-bar">
          <div class="spiritual-progress-fill" style="width:${Math.round(progress.progress * 100)}%"></div>
        </div>
      </div>
    </div>`;
  }

  window.renderWell = renderWell;
})();
```

- [ ] **Step 2: Commit well**

```bash
git add features/spiritual-growth/well.js
git commit -m "feat: add Water Well spiritual growth feature"
```

---

### Task 13: Implement Desert Garden

**Files:**
- Create: `features/spiritual-growth/desert.js`

**Interfaces:**
- Consumes: `SpiritualGrowth.getProgress('desert')`, `SpiritualGrowth.isVisible('desert')`
- Produces: `window.renderDesert()` function

- [ ] **Step 1: Create desert.js**

```javascript
// features/spiritual-growth/desert.js
// Desert Garden — Transform desert into oasis

(function() {
  function desertSVG(stage, progress) {
    let elements = '';
    
    // Sand (always)
    elements += `<rect y="120" width="120" height="40" fill="#F4A460" rx="5"/>`;
    
    // Pebbles (stage 2+)
    if (stage >= 2) {
      elements += `<circle cx="30" cy="130" r="3" fill="#8B4513"/>`;
      elements += `<circle cx="90" cy="135" r="4" fill="#8B4513"/>`;
      elements += `<circle cx="60" cy="140" r="2" fill="#8B4513"/>`;
    }
    
    // Cactus (stage 3+)
    if (stage >= 3) {
      elements += `<rect x="25" y="100" width="10" height="25" fill="#228B22" rx="3"/>`;
      elements += `<rect x="20" y="105" width="5" height="10" fill="#228B22" rx="2"/>`;
    }
    
    // Bush (stage 4+)
    if (stage >= 4) {
      elements += `<circle cx="80" cy="115" r="12" fill="#2E8B57"/>`;
      elements += `<circle cx="75" cy="110" r="8" fill="#3CB371"/>`;
    }
    
    // Trees (stage 5+)
    if (stage >= 5) {
      elements += `<rect x="50" y="80" width="8" height="35" fill="#8B4513"/>`;
      elements += `<circle cx="54" cy="75" r="15" fill="#228B22"/>`;
    }
    
    // Flowers (stage 6+)
    if (stage >= 6) {
      elements += `<circle cx="40" cy="115" r="4" fill="#FF69B4"/>`;
      elements += `<circle cx="70" cy="118" r="3" fill="#FFB6C1"/>`;
      elements += `<circle cx="95" cy="112" r="4" fill="#FF1493"/>`;
    }
    
    // Oasis (stage 7)
    if (stage === 7) {
      elements += `<ellipse cx="60" cy="125" rx="30" ry="10" fill="#1E90FF" opacity="0.6"/>`;
      elements += `<circle cx="60" cy="110" r="20" fill="#228B22" opacity="0.5"/>`;
    }
    
    return `<svg class="spiritual-svg" viewBox="0 0 120 160">
      <rect width="120" height="160" fill="#FFD700" opacity="0.2" rx="10"/>
      ${elements}
    </svg>`;
  }

  function renderDesert() {
    const el = document.getElementById('desertArea');
    if (!el || !SpiritualGrowth.isVisible('desert')) {
      if (el) el.innerHTML = '';
      return;
    }
    
    const progress = SpiritualGrowth.getProgress('desert');
    const progressText = progress.xpForNext
      ? `${progress.xp}/${progress.xpForNext} XP to ${progress.name}`
      : 'Your desert is now a paradise oasis.';
    
    el.innerHTML = `<div class="spiritual-card">
      <div class="spiritual-svg-wrap">${desertSVG(progress.stage, progress.progress)}</div>
      <div class="spiritual-info">
        <div class="spiritual-stage-name">${progress.icon} Desert Garden</div>
        <div class="spiritual-stage-level">${progress.name} (${progress.stage}/${progress.totalStages})</div>
        <div class="spiritual-progress">${progressText}</div>
        <div class="spiritual-progress-bar">
          <div class="spiritual-progress-fill" style="width:${Math.round(progress.progress * 100)}%"></div>
        </div>
      </div>
    </div>`;
  }

  window.renderDesert = renderDesert;
})();
```

- [ ] **Step 2: Commit desert**

```bash
git add features/spiritual-growth/desert.js
git commit -m "feat: add Desert Garden spiritual growth feature"
```

---

### Task 14: Implement Ramadan Tracker

**Files:**
- Create: `features/spiritual-growth/ramadan.js`

**Interfaces:**
- Consumes: `SpiritualGrowth.getProgress('ramadan')`, `SpiritualGrowth.isVisible('ramadan')`
- Produces: `window.renderRamadan()` function

- [ ] **Step 1: Create ramadan.js**

```javascript
// features/spiritual-growth/ramadan.js
// Ramadan Tracker — Track your Ramadan journey

(function() {
  function ramadanSVG(stage, progress) {
    const moonPhase = stage; // 1-7 crescent phases
    
    let moon = `<svg class="spiritual-svg" viewBox="0 0 120 160">
      <rect width="120" height="160" fill="#0a0a1a" rx="10"/>
      
      <!-- Stars -->
      <circle cx="20" cy="30" r="1" fill="#FFF" opacity="0.7"/>
      <circle cx="100" cy="25" r="1.5" fill="#FFF" opacity="0.6"/>
      <circle cx="40" cy="15" r="1" fill="#FFF" opacity="0.8"/>
      <circle cx="80" cy="20" r="1" fill="#FFF" opacity="0.5"/>
      
      <!-- Moon -->
      <circle cx="60" cy="60" r="30" fill="#F5F5DC"/>
      <circle cx="60" cy="60" r="28" fill="#0a0a1a" 
              clip-path="inset(0 ${100 - moonPhase * 14}% 0 0)"/>
      
      <!-- Moon glow -->
      <circle cx="60" cy="60" r="35" fill="none" stroke="#FFD700" stroke-width="1" opacity="0.3"/>
    </svg>`;
    
    return moon;
  }

  function renderRamadan() {
    const el = document.getElementById('ramadanArea');
    if (!el || !SpiritualGrowth.isVisible('ramadan')) {
      if (el) el.innerHTML = '';
      return;
    }
    
    const progress = SpiritualGrowth.getProgress('ramadan');
    const progressText = progress.xpForNext
      ? `${progress.xp}/${progress.xpForNext} XP to ${progress.name}`
      : 'Ramadan Mubarak — the blessed month is complete.';
    
    el.innerHTML = `<div class="spiritual-card">
      <div class="spiritual-svg-wrap">${ramadanSVG(progress.stage, progress.progress)}</div>
      <div class="spiritual-info">
        <div class="spiritual-stage-name">${progress.icon} Ramadan Tracker</div>
        <div class="spiritual-stage-level">${progress.name} (${progress.stage}/${progress.totalStages})</div>
        <div class="spiritual-progress">${progressText}</div>
        <div class="spiritual-progress-bar">
          <div class="spiritual-progress-fill" style="width:${Math.round(progress.progress * 100)}%"></div>
        </div>
      </div>
    </div>`;
  }

  window.renderRamadan = renderRamadan;
})();
```

- [ ] **Step 2: Commit ramadan**

```bash
git add features/spiritual-growth/ramadan.js
git commit -m "feat: add Ramadan Tracker spiritual growth feature"
```

---

### Task 15: Implement Laylat al-Qadr Meter

**Files:**
- Create: `features/spiritual-growth/laylat.js`

**Interfaces:**
- Consumes: `SpiritualGrowth.getProgress('laylat')`, `SpiritualGrowth.isVisible('laylat')`
- Produces: `window.renderLaylat()` function

- [ ] **Step 1: Create laylat.js**

```javascript
// features/spiritual-growth/laylat.js
// Laylat al-Qadr Meter — Track the Night of Power

(function() {
  function laylatSVG(stage, progress) {
    const starCount = [1, 3, 5, 7, 10, 15, 25][stage - 1];
    let stars = '';
    
    for (let i = 0; i < starCount; i++) {
      const x = 10 + Math.random() * 100;
      const y = 10 + Math.random() * 100;
      stars += `<circle cx="${x}" cy="${y}" r="${1 + Math.random() * 2}" fill="#FFD700" opacity="${0.5 + Math.random() * 0.5}"/>`;
    }
    
    // Special glow for stage 7 (Night 29)
    if (stage === 7) {
      stars += `<circle cx="60" cy="60" r="40" fill="#FFD700" opacity="0.1"/>`;
      stars += `<circle cx="60" cy="60" r="20" fill="#FFD700" opacity="0.2"/>`;
    }
    
    return `<svg class="spiritual-svg" viewBox="0 0 120 160">
      <rect width="120" height="160" fill="#0a0a2a" rx="10"/>
      ${stars}
      <text x="60" y="150" text-anchor="middle" fill="#FFD700" font-size="12" font-family="serif">لَيْلَةُ الْقَدْرِ</text>
    </svg>`;
  }

  function renderLaylat() {
    const el = document.getElementById('laylatArea');
    if (!el || !SpiritualGrowth.isVisible('laylat')) {
      if (el) el.innerHTML = '';
      return;
    }
    
    const progress = SpiritualGrowth.getProgress('laylat');
    const progressText = progress.xpForNext
      ? `${progress.xp}/${progress.xpForNext} XP to ${progress.name}`
      : 'Laylat al-Qadr — better than a thousand months.';
    
    el.innerHTML = `<div class="spiritual-card">
      <div class="spiritual-svg-wrap">${laylatSVG(progress.stage, progress.progress)}</div>
      <div class="spiritual-info">
        <div class="spiritual-stage-name">${progress.icon} Laylat al-Qadr Meter</div>
        <div class="spiritual-stage-level">${progress.name} (${progress.stage}/${progress.totalStages})</div>
        <div class="spiritual-progress">${progressText}</div>
        <div class="spiritual-progress-bar">
          <div class="spiritual-progress-fill" style="width:${Math.round(progress.progress * 100)}%"></div>
        </div>
      </div>
    </div>`;
  }

  window.renderLaylat = renderLaylat;
})();
```

- [ ] **Step 2: Commit laylat**

```bash
git add features/spiritual-growth/laylat.js
git commit -m "feat: add Laylat al-Qadr Meter spiritual growth feature"
```

---

## Phase 6: CSS Styling

### Task 16: Add Spiritual Growth CSS

**Files:**
- Modify: `styles/main.css`

**Interfaces:**
- Consumes: None
- Produces: CSS classes for spiritual growth cards

- [ ] **Step 1: Add CSS to main.css**

```css
/* Spiritual Growth Features */
.spiritual-card {
  display: flex;
  gap: 18px;
  align-items: center;
  background: linear-gradient(180deg, rgba(62,124,79,0.12), rgba(11,17,20,0.2));
  border: 1px solid rgba(62,124,79,0.35);
  border-radius: var(--radius);
  padding: 18px 20px;
  margin-bottom: 20px;
}

.spiritual-svg-wrap {
  width: 120px;
  height: 132px;
  flex-shrink: 0;
}

.spiritual-svg {
  width: 100%;
  height: 100%;
}

.spiritual-info {
  flex: 1;
}

.spiritual-stage-name {
  font-family: var(--font-heading);
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--gold-light);
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.spiritual-stage-level {
  font-size: 0.82rem;
  color: var(--text2);
  margin-bottom: 8px;
}

.spiritual-progress {
  font-size: 0.82rem;
  color: var(--text2);
  margin-bottom: 8px;
}

.spiritual-progress-bar {
  height: 6px;
  background: rgba(255,255,255,0.1);
  border-radius: 3px;
  overflow: hidden;
}

.spiritual-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--gold), var(--gold-light));
  border-radius: 3px;
  transition: width 0.5s ease;
}

/* Growth Settings */
.growth-settings {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.growth-setting-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--card2);
  border: 1px solid var(--border);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.growth-setting-item:hover {
  border-color: rgba(212,175,55,0.3);
}

.growth-setting-item.active {
  border-color: rgba(212,175,55,0.5);
  background: rgba(212,175,55,0.05);
}

.growth-setting-icon {
  font-size: 1.5rem;
}

.growth-setting-info {
  flex: 1;
}

.growth-setting-name {
  font-weight: 600;
  color: var(--text);
  font-size: 0.9rem;
}

.growth-setting-stage {
  font-size: 0.75rem;
  color: var(--text2);
}

.growth-setting-toggle {
  font-size: 1.2rem;
}

/* Responsive */
@media (max-width: 600px) {
  .spiritual-card {
    flex-direction: column;
    text-align: center;
  }
  
  .spiritual-svg-wrap {
    width: 100px;
    height: 110px;
  }
}
```

- [ ] **Step 2: Commit CSS**

```bash
git add styles/main.css
git commit -m "feat: add CSS for spiritual growth features"
```

---

## Phase 7: Integration

### Task 17: Add to index.html

**Files:**
- Modify: `index.html`

**Interfaces:**
- Consumes: All feature files
- Produces: HTML structure for features

- [ ] **Step 1: Add script tags to index.html**

```html
<!-- Spiritual Growth Features -->
<script src="data/journeys.js?v=1"></script>
<script src="features/garden.js?v=2"></script>
<script src="features/muhasabah.js?v=1"></script>
<script src="features/journeys.js?v=1"></script>
<script src="features/health.js?v=1"></script>
<script src="features/finance.js?v=1"></script>
<script src="features/mood.js?v=1"></script>
<script src="features/spiritual-growth/data.js?v=1"></script>
<script src="features/spiritual-growth/index.js?v=1"></script>
<script src="features/spiritual-growth/lantern.js?v=1"></script>
<script src="features/spiritual-growth/keys.js?v=1"></script>
<script src="features/spiritual-growth/daynight.js?v=1"></script>
<script src="features/spiritual-growth/mosque.js?v=1"></script>
<script src="features/spiritual-growth/boat.js?v=1"></script>
<script src="features/spiritual-growth/mountain.js?v=1"></script>
<script src="features/spiritual-growth/heart.js?v=1"></script>
<script src="features/spiritual-growth/armor.js?v=1"></script>
<script src="features/spiritual-growth/constellation.js?v=1"></script>
<script src="features/spiritual-growth/well.js?v=1"></script>
<script src="features/spiritual-growth/desert.js?v=1"></script>
<script src="features/spiritual-growth/ramadan.js?v=1"></script>
<script src="features/spiritual-growth/laylat.js?v=1"></script>
```

- [ ] **Step 2: Add div containers for features**

```html
<!-- In panel-today -->
<div id="gardenArea"></div>
<div id="lanternArea"></div>
<div id="wellArea"></div>

<!-- In panel-profile -->
<div id="mosqueArea"></div>
<div id="mountainArea"></div>
<div id="constellationArea"></div>
<div id="keysArea"></div>
<div id="desertArea"></div>
<div id="daynightArea"></div>

<!-- In panel-journeys -->
<div id="boatArea"></div>

<!-- In panel-heart -->
<div id="heartArea"></div>
<div id="armorArea"></div>

<!-- Seasonal (auto-show) -->
<div id="ramadanArea"></div>
<div id="laylatArea"></div>

<!-- Growth Settings -->
<div id="growthSettingsArea"></div>
```

- [ ] **Step 3: Commit index.html**

```bash
git add index.html
git commit -m "feat: add HTML containers for spiritual growth features"
```

---

### Task 18: Add to render.js

**Files:**
- Modify: `render/render.js`

**Interfaces:**
- Consumes: All render functions
- Produces: Updated renderStatic function

- [ ] **Step 1: Update renderStatic in render.js**

```javascript
// In renderStatic function, add safe() calls:
safe(() => window.renderGarden && window.renderGarden(), 'Garden');
safe(() => window.renderLantern && window.renderLantern(), 'Lantern');
safe(() => window.renderWell && window.renderWell(), 'Well');
safe(() => window.renderMosque && window.renderMosque(), 'Mosque');
safe(() => window.renderMountain && window.renderMountain(), 'Mountain');
safe(() => window.renderConstellation && window.renderConstellation(), 'Constellation');
safe(() => window.renderKeys && window.renderKeys(), 'Keys');
safe(() => window.renderDesert && window.renderDesert(), 'Desert');
safe(() => window.renderDayNight && window.renderDayNight(), 'DayNight');
safe(() => window.renderBoat && window.renderBoat(), 'Boat');
safe(() => window.renderHeart && window.renderHeart(), 'Heart');
safe(() => window.renderArmor && window.renderArmor(), 'Armor');
safe(() => window.renderRamadan && window.renderRamadan(), 'Ramadan');
safe(() => window.renderLaylat && window.renderLaylat(), 'Laylat');
safe(() => window.SpiritualGrowth && window.SpiritualGrowth.renderSettings && window.SpiritualGrowth.renderSettings(), 'GrowthSettings');
```

- [ ] **Step 2: Commit render.js**

```bash
git add render/render.js
git commit -m "feat: integrate spiritual growth features into render system"
```

---

### Task 19: Add to state.js

**Files:**
- Modify: `state/state.js`

**Interfaces:**
- Consumes: None
- Produces: Updated freshState function

- [ ] **Step 1: Add growthSettings to freshState**

```javascript
// In freshState function, add:
growthSettings: { visible: ['garden', 'lantern', 'keys', 'daynight'] }
```

- [ ] **Step 2: Commit state.js**

```bash
git add state/state.js
git commit -m "feat: add growthSettings to state"
```

---

## Phase 8: Testing

### Task 20: Test All Features

**Files:**
- Test: `tests/spiritual-growth.test.js`

**Interfaces:**
- Consumes: All feature files
- Produces: Test results

- [ ] **Step 1: Create comprehensive test file**

```javascript
// tests/spiritual-growth.test.js
const path = require('path');
const fs = require('fs');
const vm = require('vm');

test('all feature files exist', () => {
  const features = [
    'data.js', 'index.js', 'lantern.js', 'keys.js', 'daynight.js',
    'mosque.js', 'boat.js', 'mountain.js', 'heart.js', 'armor.js',
    'constellation.js', 'well.js', 'desert.js', 'ramadan.js', 'laylat.js'
  ];
  
  features.forEach(f => {
    const exists = fs.existsSync(path.join(__dirname, '..', 'features', 'spiritual-growth', f));
    expect(exists).toBe(true);
  });
});

test('all render functions are defined', () => {
  const sandbox = { window: {} };
  sandbox.window.S = { xp: 1000, cs: 10, bs: 15 };
  sandbox.window.SpiritualGrowth = { getProgress: () => ({ stage: 1, totalStages: 7, name: 'Test', icon: '⭐', xp: 0, streak: 0, combined: 0, xpForNext: 100, progress: 0 }), isVisible: () => true };
  vm.createContext(sandbox);
  
  const files = ['lantern.js', 'keys.js', 'daynight.js', 'mosque.js', 'boat.js', 'mountain.js', 'heart.js', 'armor.js', 'constellation.js', 'well.js', 'desert.js', 'ramadan.js', 'laylat.js'];
  
  files.forEach(f => {
    const code = fs.readFileSync(path.join(__dirname, '..', 'features', 'spiritual-growth', f), 'utf8');
    vm.runInContext(code, sandbox);
  });
  
  expect(typeof sandbox.window.renderLantern).toBe('function');
  expect(typeof sandbox.window.renderKeys).toBe('function');
  expect(typeof sandbox.window.renderDayNight).toBe('function');
  expect(typeof sandbox.window.renderMosque).toBe('function');
  expect(typeof sandbox.window.renderBoat).toBe('function');
  expect(typeof sandbox.window.renderMountain).toBe('function');
  expect(typeof sandbox.window.renderHeart).toBe('function');
  expect(typeof sandbox.window.renderArmor).toBe('function');
  expect(typeof sandbox.window.renderConstellation).toBe('function');
  expect(typeof sandbox.window.renderWell).toBe('function');
  expect(typeof sandbox.window.renderDesert).toBe('function');
  expect(typeof sandbox.window.renderRamadan).toBe('function');
  expect(typeof sandbox.window.renderLaylat).toBe('function');
});
```

- [ ] **Step 2: Run tests**

```bash
node --experimental-vm-modules node_modules/.bin/jest tests/spiritual-growth.test.js
```

- [ ] **Step 3: Commit tests**

```bash
git add tests/spiritual-growth.test.js
git commit -m "test: add comprehensive tests for spiritual growth features"
```

---

## Final Commit

### Task 21: Final Integration Commit

- [ ] **Step 1: Run all tests**

```bash
node --experimental-vm-modules node_modules/.bin/jest
```

- [ ] **Step 2: Final commit**

```bash
git add -A
git commit -m "feat: complete spiritual growth features system (14 features with 7 stages each)"
```

---

## Summary

**Total Files Created:** 16 (15 feature files + 1 test file)
**Total Files Modified:** 4 (index.html, render.js, state.js, styles/main.css)
**Total Commits:** 21
**Estimated Time:** 4-6 hours

All features share XP + streak progress, use SVG illustrations matching the garden aesthetic, and are toggleable via Profile settings.
