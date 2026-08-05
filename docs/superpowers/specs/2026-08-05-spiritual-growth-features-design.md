# Spiritual Growth Features — Design Spec

## Overview

Add13 new gamified spiritual features to Ibadah Quest, complementing the existing Spiritual Garden. All features share XP + streak progress, use SVG illustrations matching the garden's aesthetic, and are toggleable via Profile settings.

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Implementation approach | Hybrid directory | Scalable, modular, organized |
| Progress source | Shared XP + streak | Unified experience, simpler |
| Visual style | Match garden (SVG) | Consistent design language |
| Toggle system | Profile settings page | User control, clean UI |
| Default visibility | All visible | Show full experience upfront |
| Progress display | Progress bar + stage name | Clear, motivating |
| Stages per feature | 7 | Gradual progression |

## Feature Placement

### Daily Tab (Today section)
- **Nur Lantern** — beside the garden
- **Journey Boat** — progress bar at top of Journeys sub-tab
- **Water Well** — daily tracker widget

### Knowledge Tab (Heart & Soul)
- **Heart Refinement** — in Heart Diseases sub-tab
- **Spiritual Armor** — in Patience sub-tab

### Profile Tab
- **Mosque Builder** — standalone card
- **Mount Nur Climber** — standalone card
- **Star Constellation** — background decoration
- **Paradise Keys** — near trophy cabinet
- **Desert Garden** — alternative garden visualization

### Global (Background)
- **Day/Night Cycle** — ambient background based on time

### Seasonal (Auto-show)
- **Ramadan Tracker** — shows during Ramadan
- **Laylat al-Qadr Meter** — shows last 10 nights of Ramadan

## Feature Specifications

### 1. Garden (Expanded)
**Current:** 5 stages → **New:** 7 stages
1. Seed → 2. Sprout → 3. Sapling → 4. Young Tree → 5. Mature Tree → 6. Blooming Tree → 7. Paradise Garden

### 2. Nur Lantern
**Visual:** Glowing lantern SVG
**Stages:**
1. Dim → 2. Flickering → 3. Steady → 4. Glowing → 5. Radiant → 6. Brilliant → 7. Divine Light

### 3. Mosque Builder
**Visual:** Mosque construction SVG
**Stages:**
1. Foundation → 2. Walls → 3. Roof → 4. Dome → 5. Minaret → 6. Interior → 7. Complete

### 4. Journey Boat
**Visual:** Boat on ocean SVG
**Stages:**
1. Dock → 2. Setting Sail → 3. Open Sea → 4. Storm → 5. Calm Waters → 6. Paradise Island → 7. Jannah

### 5. Mount Nur Climber
**Visual:** Mountain climbing SVG
**Stages:**
1. Base → 2. Foothill → 3. Trail → 4. Cliff → 5. Summit → 6. Cave → 7. Divine Light

### 6. Heart Refinement
**Visual:** Heart transformation SVG
**Stages:**
1. Stone → 2. Clay → 3. Copper → 4. Iron → 5. Silver → 6. Gold → 7. Light

### 7. Spiritual Armor
**Visual:** Armor pieces SVG
**Stages:**
1. Belt → 2. Boots → 3. Helmet → 4. Shirt → 5. Shield → 6. Sword → 7. Full Set

### 8. Star Constellation
**Visual:** Night sky SVG
**Stages:**
1. 1 Star → 2. 3 Stars → 3. 5 Stars → 4. 7 Stars → 5. 10 Stars → 6. Full Constellation → 7. Galaxy

### 9. Paradise Keys
**Visual:** Key ring SVG
**Stages:**
1. 1 Key → 2. 2 Keys → 3. 3 Keys → 4. 5 Keys → 5. 7 Keys → 6. 9 Keys → 7. 10 Keys (All Gates)

### 10. Water Well
**Visual:** Well filling SVG
**Stages:**
1. Empty → 2. 15% → 3. 30% → 4. 50% → 5. 70% → 6. 85% → 7. Full

### 11. Desert Garden
**Visual:** Desert to oasis SVG
**Stages:**
1. Sand → 2. Pebbles → 3. Cactus → 4. Bush → 5. Trees → 6. Flowers → 7. Oasis

### 12. Day/Night Cycle
**Visual:** Sky gradient CSS
**Stages:**
1. Dawn → 2. Morning → 3. Midday → 4. Afternoon → 5. Sunset → 6. Night → 7. Dawn

### 13. Ramadan Tracker
**Visual:** Crescent moon SVG
**Stages:**
1. Day 1 → 2. Day 7 → 3. Day 14 → 4. Day 21 → 5. Day 25 → 6. Day 27 → 7. Day 30

### 14. Laylat al-Qadr Meter
**Visual:** Night sky with stars SVG
**Stages:**
1. Night 1 → 2. Night 3 → 3. Night 5 → 4. Night 7 → 5. Night 9 → 6. Night 27 → 7. Night 29

## Technical Architecture

### File Structure
```
features/
  spiritual-growth/
    index.js          — Main controller, toggle system
    data.js           — Shared progress calculation
    garden.js         — Expanded garden (7 stages)
    lantern.js        — Nur Lantern
    mosque.js         — Mosque Builder
    boat.js           — Journey Boat
    mountain.js       — Mount Nur Climber
    heart.js          — Heart Refinement
    armor.js          — Spiritual Armor
    constellation.js  — Star Constellation
    keys.js           — Paradise Keys
    well.js           — Water Well
    desert.js         — Desert Garden
    daynight.js       — Day/Night Cycle
    ramadan.js        — Ramadan Tracker
    laylat.js         — Laylat al-Qadr Meter
```

### State Management
Add to `state/state.js`:
```javascript
spiritualGrowth: {
  garden: { stage: 1, xp: 0, streak: 0 },
  lantern: { stage: 1 },
  mosque: { stage: 1 },
  boat: { stage: 1 },
  mountain: { stage: 1 },
  heart: { stage: 1 },
  armor: { stage: 1 },
  constellation: { stage: 1 },
  keys: { stage: 1 },
  well: { stage: 1 },
  desert: { stage: 1 },
  daynight: { stage: 1 },
  ramadan: { stage: 1 },
  laylat: { stage: 1 }
}
```

### Toggle System
Add to Profile tab:
```javascript
TAB_GROUPS.profile_main = [
  { id: 'profile', icon: '👤', label: 'Profile' },
  { id: 'trophies', icon: '🏆', label: 'Trophies' },
  { id: 'progress', icon: '📊', label: 'Progress' },
  { id: 'stats', icon: '📈', label: 'Analytics' },
  { id: 'rewards', icon: '🎁', label: 'Rewards' },
  { id: 'growth-settings', icon: '⚙️', label: 'Growth' }  // NEW
];
```

### Progress Calculation
All features share the same progress source:
```javascript
function getFeatureProgress(featureName) {
  const xp = S.xp || 0;
  const streak = Math.max(S.cs || 0, S.bs || 0);
  const combined = xp + (streak * 10); // Streak bonus
  
  // Each feature has its own stage thresholds
  const stages = FEATURE_STAGES[featureName];
  let currentStage = 1;
  for (let i = 0; i < stages.length; i++) {
    if (combined >= stages[i].xp) currentStage = i + 1;
  }
  
  return {
    stage: currentStage,
    xp: xp,
    streak: streak,
    combined: combined,
    xpForNext: stages[currentStage]?.xp || null
  };
}
```

## CSS Classes

```css
/* Spiritual Growth Cards */
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

.spiritual-svg {
  width: 120px;
  height: 132px;
  display: block;
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
  margin-bottom: 6px;
}

.spiritual-progress {
  font-size: 0.82rem;
  color: var(--text2);
}

.spiritual-progress-bar {
  height: 6px;
  background: rgba(255,255,255,0.1);
  border-radius: 3px;
  margin-top: 8px;
  overflow: hidden;
}

.spiritual-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--gold), var(--gold-light));
  border-radius: 3px;
  transition: width 0.5s ease;
}
```

## Implementation Order

1. **Phase 1:** Core infrastructure (data.js, index.js, toggle system)
2. **Phase 2:** Expand garden to 7 stages
3. **Phase 3:** Implement 3 default features (Lantern, Keys, Day/Night)
4. **Phase 4:** Implement remaining10 features
5. **Phase 5:** CSS styling and animations
6. **Phase 6:** Testing and polish

## Success Criteria

- [ ] All14 features (garden +13 new) render correctly
- [ ] Progress bars update in real-time
- [ ] Toggle system works in Profile settings
- [ ] SVG illustrations match garden aesthetic
- [ ] No performance degradation
- [ ] Mobile responsive
- [ ] Seasonal features auto-show during Ramadan
