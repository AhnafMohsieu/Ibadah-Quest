# Design Spec: Daily Tabs, XP Rebalancing, Trophy & Analytics Fixes

**Date:** 2026-08-05  
**Status:** Approved  
**Approach:** Fixes first (trophy, analytics), then features (XP, new tabs)

---

## Overview

This design covers four changes:
1. **Trophy Cabinet Fix** — layout repair, tier colors, sorting
2. **Analytics Fix** — date format, data accuracy, missing metrics
3. **XP Rebalancing** — increase rewards for weekly/monthly/yearly/lifetime quests
4. **New Daily Subtabs** — Health & Wellness, Finance & Charity, Mood & Reflection

---

## Part 1: Trophy Cabinet Fix

### Goal
Fix the broken display shelf layout and add visual hierarchy with tier colors.

### Issues Identified
1. Display shelf text ("DISPLAY SHELF") overlaps with trophy cards
2. Vertical shelf layout pushes content incorrectly
3. All trophies look identical (no tier color distinction)
4. Stars are too small to see
5. Not sorted by unlock date (shows first 8 unlocked, not most recent)

### Fixes

#### Layout Fix
- Change display shelf from vertical sidebar to horizontal row above the grid
- Proper spacing between shelf and grid
- Remove overlapping text

#### Visual Improvements
- Add tier colors:
  - Bronze: `#CD7F32`
  - Silver: `#C0C0C0`
  - Gold: `#FFD700`
  - Platinum: `#E5E4E2`
  - Diamond: `#B9F2FF`
  - Legendary: gradient `#FFD700` → `#9B59B6`
- Sort display shelf by unlock date (most recent first)
- Larger tier stars with matching color
- Subtle glow effect on unlocked trophies

### Files to Modify
- `styles/main.css` — Fix shelf layout, add tier colors
- `render/render.js` — Sort by unlock date, update star rendering

---

## Part 2: Analytics Fix

### Goal
Fix data accuracy issues and add missing metrics.

### Issues Identified
1. Date format mismatch: `getHeatmapData` uses ISO format, log keys use `today()` format
2. Quest completion XP not tracked in XP stats
3. Voluntary prayer XP not tracked
4. Missing "Total XP Earned" metric
5. Missing quest completion breakdown

### Fixes

#### Date Format Fix
- `getHeatmapData` uses `toISOString().slice(0, 10)` → `2026-08-05`
- Log keys use `today()` → `2026-8-5` (no padding)
- Fix: Use `today()` function consistently in all analytics

#### Data Accuracy Fixes
- Add quest XP to `getXPStats` calculation
- Track voluntary prayer XP in daily XP calculation
- Fix cumulative XP to include all sources

#### Missing Metrics
- Add "Total XP Earned" stat (quests + prayers + deeds)
- Add "Quests Completed" breakdown by type (daily/weekly/monthly/yearly/lifetime)
- Add "Content Explored" percentage

### Files to Modify
- `analytics/analytics.js` — Fix date format, add quest XP tracking
- `analytics/dashboard.js` — Add new metrics cards

---

## Part 3: XP Rebalancing

### Goal
Increase XP rewards for long-term quests to reflect their difficulty.

### Current vs New Values

| Quest Type | Current Range | New Range | Multiplier |
|------------|---------------|-----------|------------|
| Daily | 20-50 XP | 20-70 XP | 1.4x |
| Weekly | 100-200 XP | 250-400 XP | 2x |
| Monthly | 300-600 XP | 1000-1500 XP | 2.5x |
| Yearly | 1500-3500 XP | 6000-15000 XP | 4x |
| Lifetime | 100-50000 XP | 2000-100000 XP | 2-4x |

### Detailed Changes

#### Daily Quests (DQUESTS)
```javascript
// Current → New (20-70 XP range)
{ id:'dq1', xp: 40 → 55 },  // Complete Fajr & Isha
{ id:'dq2', xp: 35 → 50 },  // Do 3 extra deeds
{ id:'dq3', xp: 25 → 35 },  // Read Quran today
{ id:'dq4', xp: 30 → 45 },  // Give Charity
{ id:'dq5', xp: 35 → 50 },  // Pray any voluntary prayer
{ id:'dq6', xp: 50 → 70 },  // Pray all 5 daily prayers
{ id:'dq7', xp: 40 → 55 },  // Pray Dhuhr & Asr
{ id:'dq8', xp: 45 → 65 },  // Morning & Evening Adhkar
{ id:'dq9', xp: 35 → 50 },  // Dhikr and Istighfar
{ id:'dq10', xp: 50 → 70 }, // Pray Tahajjud
{ id:'dq11', xp: 40 → 55 }, // Pray Duha/Ishraq prayer
{ id:'dq12', xp: 20 → 25 }, // Smile (Sunnah)
{ id:'dq13', xp: 30 → 40 }, // Help parents/family
{ id:'dq14', xp: 40 → 55 }, // Avoid useless talk
{ id:'dq15', xp: 35 → 50 }, // Make specific dua for others
```

#### Weekly Quests (WQUESTS)
```javascript
// Current → New
{ id:'w1', xp: 200 → 400 },  // Perfect prayers 5 days
{ id:'w2', xp: 150 → 300 },  // Tahajjud 3x
{ id:'w3', xp: 100 → 250 },  // Charity 2x
{ id:'w4', xp: 150 → 300 },  // Read Quran 5 days
{ id:'w5', xp: 120 → 250 },  // Pray Witr 5 times
{ id:'w6', xp: 180 → 350 },  // Fasting 1 day
{ id:'w7', xp: 100 → 250 },  // Read Surah Kahf
{ id:'w8', xp: 150 → 300 },  // Maintain 7-day streak
```

#### Monthly Quests (MQUESTS)
```javascript
// Current → New
{ id:'m1', xp: 500 → 1200 },  // 20 perfect days
{ id:'m2', xp: 400 → 1000 },  // 100 prayers
{ id:'m3', xp: 300 → 800 },   // Fast 3 days
{ id:'m4', xp: 400 → 1000 },  // Read Quran 15 times
{ id:'m5', xp: 350 → 900 },   // Give 5% charity
{ id:'m6', xp: 600 → 1500 },  // Tahajjud 10 times
{ id:'m7', xp: 450 → 1100 },  // Memorize 1 surah
{ id:'m8', xp: 500 → 1200 },  // Read all Friday Kahfs
```

#### Yearly Quests (YQUESTS)
```javascript
// Current → New
{ id:'y1', xp: 2000 → 8000 },   // 300 perfect days
{ id:'y2', xp: 1500 → 6000 },   // 1500 prayers
{ id:'y3', xp: 1500 → 6000 },   // Fast 30 days
{ id:'y4', xp: 2500 → 10000 },  // Read Quran 300 times
{ id:'y5', xp: 3000 → 12000 },  // Memorize 5 surahs
{ id:'y6', xp: 3500 → 15000 },  // Tahajjud 100 times
{ id:'y7', xp: 2000 → 8000 },   // Consistent charity
```

#### Lifetime Quests (LQUESTS)
```javascript
// Current → New
{ id:'l1', xp: 100 → 2000 },    // Complete 50 prayers
{ id:'l2', xp: 150 → 3000 },    // Read Quran 30 times
{ id:'l3', xp: 300 → 5000 },    // 100 voluntary prayers
{ id:'l4', xp: 200 → 4000 },    // Memorize 10 surahs
{ id:'l5', xp: 1000 → 15000 },  // Complete 500 prayers
{ id:'l6', xp: 800 → 12000 },   // Read Quran 100 times
{ id:'l7', xp: 1200 → 18000 },  // Do 500 extra deeds
{ id:'l8', xp: 1500 → 20000 },  // 30-day streak
{ id:'l9', xp: 1000 → 15000 },  // Memorize 30 surahs
{ id:'l10', xp: 5000 → 40000 }, // Complete 5000 prayers
{ id:'l11', xp: 10000 → 60000 },// 365-day streak
{ id:'l12', xp: 6000 → 45000 }, // Read Quran 1000 times
{ id:'l13', xp: 15000 → 80000 },// Do 10000 extra deeds
{ id:'l14', xp: 50000 → 100000 }// Memorize entire Quran
```

### Files to Modify
- `data/quests.js` — Update XP values

---

## Part 4: New Daily Subtabs

### Goal
Add three new tracking features to the Daily tab: Health & Wellness, Finance & Charity, Mood & Reflection.

### 4.1 Health & Wellness Tracker

#### Features
- Log water intake (glasses per day, target 8)
- Log sleep hours (bedtime, wake time)
- Log exercise (type, duration)
- Log meals (breakfast, lunch, dinner, snacks)
- Daily health score based on targets met

#### Data Structure
```javascript
healthLog: {
  '2026-08-05': {
    water: 6,
    sleep: 7.5,
    exercise: [{ type: 'walk', duration: 30 }],
    meals: { breakfast: true, lunch: true, dinner: true }
  }
}
```

#### UI Components
- Water tracker (8 glasses, tap to fill)
- Sleep logger (bedtime/wake time inputs)
- Exercise logger (type dropdown, duration input)
- Meal checkboxes (breakfast, lunch, dinner)
- Health score card (0-100 based on targets)

### 4.2 Finance & Charity Tracker

#### Features
- Log daily income (halal source tracking)
- Log expenses (category: food, transport, charity, etc.)
- Track charity given (daily, monthly targets)
- Zakat calculator (2.5% of qualifying wealth)
- Sadaqah jariyah tracker

#### Data Structure
```javascript
financeLog: {
  '2026-08-05': {
    income: [{ source: 'salary', amount: 5000 }],
    expenses: [{ category: 'food', amount: 50, desc: 'groceries' }],
    charity: { daily: 50, monthly: 500 }
  }
}
```

#### UI Components
- Income logger (source, amount)
- Expense logger (category, amount, description)
- Charity tracker (daily/monthly targets, progress)
- Zakat calculator (input wealth, calculate 2.5%)
- Daily summary card (income - expenses = savings)

### 4.3 Mood & Reflection

#### Features
- Daily mood selector (1-5 scale with emojis)
- Gratitude journal (existing feature, integrate here)
- Daily reflection prompts (Islamic-based)
- Dua list for the day
- End-of-day reflection

#### Data Structure
```javascript
moodLog: {
  '2026-08-05': {
    mood: 4,
    gratitude: ['health', 'family', 'food'],
    reflection: 'Today I was patient when...',
    duas: ['For my parents', 'For ummah']
  }
}
```

#### UI Components
- Mood selector (1-5 emojis: 😞😐😊😄🤩)
- Gratitude input (add/list entries)
- Reflection textarea
- Dua list (add/list)
- Mood history chart (line chart over time)

### Files to Create
- `data/pools/health.js` — Health data and prompts
- `data/pools/finance.js` — Finance categories and Zakat rules
- `data/pools/mood.js` — Mood prompts and reflection questions
- `features/health.js` — Health tracking logic
- `features/finance.js` — Finance tracking logic
- `features/mood.js` — Mood tracking logic

### Files to Modify
- `data/tab-groups.js` — Add 3 new tabs to ibadah section
- `index.html` — Add 3 new tab panels
- `render/render.js` — Add render functions for new tabs
- `state/state.js` — Add new state properties
- `styles/main.css` — Add styles for new components

---

## Implementation Order

1. **Phase 1: Trophy Cabinet Fix** (1 commit)
   - Fix layout CSS
   - Add tier colors
   - Sort by unlock date

2. **Phase 2: Analytics Fix** (1 commit)
   - Fix date format
   - Add quest XP tracking
   - Add missing metrics

3. **Phase 3: XP Rebalancing** (1 commit)
   - Update weekly quest XP
   - Update monthly quest XP
   - Update yearly quest XP
   - Update lifetime quest XP

4. **Phase 4: Health & Wellness Tab** (1-2 commits)
   - Create data pool
   - Create feature logic
   - Add tab to navigation
   - Add UI components

5. **Phase 5: Finance & Charity Tab** (1-2 commits)
   - Create data pool
   - Create feature logic
   - Add tab to navigation
   - Add UI components

6. **Phase 6: Mood & Reflection Tab** (1-2 commits)
   - Create data pool
   - Create feature logic
   - Add tab to navigation
   - Add UI components

---

## Success Metrics

### Trophy Cabinet
- ✅ Display shelf doesn't overlap with cards
- ✅ Each tier has distinct color
- ✅ Shelf shows most recent 8 unlocked trophies
- ✅ Stars are visible and colored

### Analytics
- ✅ Heatmap shows correct dates
- ✅ XP stats include quest XP
- ✅ All metrics display correct numbers

### XP Rebalancing
- ✅ Weekly quests give 2x XP
- ✅ Monthly quests give 2.5x XP
- ✅ Yearly quests give 4x XP
- ✅ Lifetime quests give 2-4x XP

### New Tabs
- ✅ Health tab tracks water, sleep, exercise, meals
- ✅ Finance tab tracks income, expenses, charity
- ✅ Mood tab tracks mood, gratitude, reflection
- ✅ All tabs integrate with daily log

---

*End of Design Spec*
