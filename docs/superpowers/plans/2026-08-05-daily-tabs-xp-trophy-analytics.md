# Daily Tabs, XP Rebalancing, Trophy & Analytics Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix trophy cabinet and analytics issues, rebalance XP for long-term quests, and add three new Daily subtabs (Health, Finance, Mood).

**Architecture:** Fixes first (trophy layout, analytics accuracy), then XP value changes, then new features (3 independent tab modules).

**Tech Stack:** Vanilla JavaScript, CSS, HTML, localStorage for persistence

---

## Phase 1: Trophy Cabinet Fix

### Task 1.1: Fix Display Shelf Layout

**Files:**
- Modify: `styles/main.css` (add/modify `.ach-cabinet`, `.ach-cabinet-shelf` styles)
- Modify: `render/render.js` (update `renderAch` function)

**Interfaces:**
- Consumes: `S.ua` (user achievements), `ACHS` (achievements list)
- Produces: Fixed display shelf layout

- [ ] **Step 1: Add CSS for horizontal shelf**

Open `styles/main.css` and add/modify:
```css
/* Trophy Cabinet */
.ach-cabinet {
  background: var(--card);
  border-radius: var(--radius);
  padding: 16px;
  margin-bottom: 20px;
  border: 1px solid var(--border);
}
.ach-cabinet-title {
  font-size: 0.85rem;
  color: var(--text2);
  margin-bottom: 12px;
  text-align: center;
}
.ach-cabinet-shelf {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
}
.ach-cabinet-item {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: 1.5rem;
  background: var(--card2);
  border: 2px solid var(--border);
  transition: all 0.3s;
}
.ach-cabinet-item.has-trophy {
  border-color: var(--gold);
  box-shadow: 0 0 10px rgba(212,175,55,0.3);
}
.ach-cabinet-item.empty {
  opacity: 0.3;
  font-size: 1rem;
  color: var(--text2);
}
.ach-cabinet-label {
  font-size: 0.75rem;
  color: var(--text2);
  text-align: center;
  margin-top: 8px;
}
```

- [ ] **Step 2: Update renderAch to sort by unlock date**

In `render/render.js`, modify `renderAch` to sort unlocked achievements by a stored unlock timestamp. Since we don't have timestamps yet, we'll use the order they appear in `S.ua` (object key order preserves insertion order in modern JS).

Replace the shelf section:
```javascript
// Trophy cabinet display shelf
const shelfSize = 8;
const recentAchs = unlockedAchs.slice(-shelfSize).reverse(); // Most recent 8, reversed
h += '<div class="ach-cabinet">';
h += '<div class="ach-cabinet-title">✨ Display Shelf ✨</div>';
h += '<div class="ach-cabinet-shelf">';
for (let i = 0; i < shelfSize; i++) {
  if (i < recentAchs.length) {
    h += `<div class="ach-cabinet-item has-trophy" title="${recentAchs[i].name}">${recentAchs[i].icon}</div>`;
  } else {
    h += '<div class="ach-cabinet-item empty">—</div>';
  }
}
h += '</div>';
h += `<div class="ach-cabinet-label">Latest ${Math.min(cnt, shelfSize)} of ${cnt} trophies earned</div>`;
h += '</div>';
```

- [ ] **Step 3: Test layout renders correctly**

Open the app, navigate to Trophy Cabinet. Verify:
- Display shelf is horizontal, no overlapping text
- Trophies show in shelf (even if empty placeholders)

- [ ] **Step 4: Commit**

```bash
git add styles/main.css render/render.js
git commit -m "fix: trophy cabinet display shelf layout"
```

### Task 1.2: Add Tier Colors and Stars

**Files:**
- Modify: `styles/main.css` (add tier color styles)
- Modify: `render/render.js` (update tier star rendering)

**Interfaces:**
- Consumes: `ACHS` (tier property)
- Produces: Colored tier indicators

- [ ] **Step 1: Add tier color CSS**

Add to `styles/main.css`:
```css
/* Tier Colors */
.ach-card.tier-bronze { border-color: #CD7F32; }
.ach-card.tier-silver { border-color: #C0C0C0; }
.ach-card.tier-gold { border-color: #FFD700; }
.ach-card.tier-platinum { border-color: #E5E4E2; }
.ach-card.tier-diamond { border-color: #B9F2FF; }
.ach-card.tier-legendary { 
  border-image: linear-gradient(135deg, #FFD700, #9B59B6) 1;
}
.ach-card.unlocked.tier-bronze { box-shadow: 0 0 12px rgba(205,127,50,0.4); }
.ach-card.unlocked.tier-silver { box-shadow: 0 0 12px rgba(192,192,192,0.4); }
.ach-card.unlocked.tier-gold { box-shadow: 0 0 12px rgba(255,215,0,0.4); }
.ach-card.unlocked.tier-platinum { box-shadow: 0 0 12px rgba(229,228,226,0.4); }
.ach-card.unlocked.tier-diamond { box-shadow: 0 0 12px rgba(185,242,255,0.4); }
.ach-card.unlocked.tier-legendary { box-shadow: 0 0 15px rgba(255,215,0,0.5); }

/* Tier Stars */
.ach-tier {
  font-size: 0.7rem;
  margin-bottom: 4px;
}
.tier-bronze .ach-tier { color: #CD7F32; }
.tier-silver .ach-tier { color: #C0C0C0; }
.tier-gold .ach-tier { color: #FFD700; }
.tier-platinum .ach-tier { color: #E5E4E2; }
.tier-diamond .ach-tier { color: #B9F2FF; }
.tier-legendary .ach-tier { color: #FFD700; }
```

- [ ] **Step 2: Update renderAch to add tier class**

In `render/render.js`, modify the trophy grid section:
```javascript
h += '<div class="ach-grid">';
h += ACHS.map(a => {
  const u = !!S.ua[a.id];
  const tierClass = `tier-${a.tier}`;
  const tierStars = a.tier === 'legendary' ? '⭐⭐⭐' : 
                    a.tier === 'diamond' || a.tier === 'platinum' ? '⭐⭐' : '⭐';
  return `<div class="ach-card${u ? ' unlocked' : ' locked'} ${tierClass}">
    <div class="ach-tier">${tierStars}</div>
    <div class="ach-icon">${u ? a.icon : '🔒'}</div>
    <div class="ach-name">${a.name}</div>
    <div class="ach-desc">${a.desc}</div>
  </div>`;
}).join('');
h += '</div>';
```

- [ ] **Step 3: Test tier colors render**

Open Trophy Cabinet. Verify:
- Each tier has distinct border color
- Unlocked trophies have colored glow
- Stars are visible

- [ ] **Step 4: Commit**

```bash
git add styles/main.css render/render.js
git commit -m "feat: add tier colors and stars to trophy cabinet"
```

---

## Phase 2: Analytics Fix

### Task 2.1: Fix Date Format Mismatch

**Files:**
- Modify: `analytics/analytics.js` (fix `getHeatmapData`)

**Interfaces:**
- Consumes: `S.log` (log keys), `today()` function
- Produces: Correct heatmap data

- [ ] **Step 1: Fix getHeatmapData to use today() format**

Open `analytics/analytics.js` and modify `getHeatmapData`:
```javascript
function getHeatmapData(days) {
  const range = getDateRange(days || 90);
  const dates = getLogDates(range);
  const map = {};
  dates.forEach(d => {
    const p = S.log[d].p || {};
    map[d] = Object.values(p).filter(v => v).length;
  });
  const result = [];
  const d = new Date(range ? range.start : new Date());
  const end = range ? range.end : new Date();
  while (d <= end) {
    const key = today(d); // Use today() for consistent format
    result.push({ date: key, value: map[key] || 0 });
    d.setDate(d.getDate() + 1);
  }
  return result;
}
```

- [ ] **Step 2: Test heatmap renders with data**

Open app, navigate to Analytics. Check heatmap shows colored cells for days with activity.

- [ ] **Step 3: Commit**

```bash
git add analytics/analytics.js
git commit -m "fix: heatmap date format to match log keys"
```

### Task 2.2: Add Quest XP to Analytics

**Files:**
- Modify: `analytics/analytics.js` (update `getXPStats`)
- Modify: `state/state.js` (add quest XP tracking)

**Interfaces:**
- Consumes: `S.log`, `S.tq`, `DQUESTS`, `WQUESTS`, `MQUESTS`, `YQUESTS`, `LQUESTS`
- Produces: Accurate XP statistics

- [ ] **Step 1: Add quest XP tracking to state**

Open `state/state.js` and add to `freshState()`:
```javascript
questXP: { daily: 0, weekly: 0, monthly: 0, yearly: 0, lifetime: 0 },
```

- [ ] **Step 2: Update getXPStats to include quest XP**

In `analytics/analytics.js`, modify `getXPStats`:
```javascript
function getXPStats(days) {
  const range = getDateRange(days);
  const dates = getLogDates(range);
  let cumXP = 0;
  const daily = dates.map(d => {
    const p = S.log[d].p || {};
    const dDeeds = S.log[d].d || {};
    let dayXP = 0;
    PRAYERS.forEach(pr => { if (p[pr.id]) dayXP += pr.xp; });
    Object.keys(dDeeds).forEach(id => {
      if (dDeeds[id]) {
        const deed = DEEDS.find(dd => dd.id === id);
        if (deed) dayXP += deed.xp;
      }
    });
    cumXP += dayXP;
    return { date: d, xp: dayXP, cumulative: cumXP };
  });
  
  // Add quest XP (from stored totals)
  const questXP = (S.questXP?.daily || 0) + (S.questXP?.weekly || 0) + 
                  (S.questXP?.monthly || 0) + (S.questXP?.yearly || 0) + 
                  (S.questXP?.lifetime || 0);
  
  const lv = S.lv || 1;
  const curXP = S.xp || 0;
  const nextXP = Math.floor(100 * Math.pow(lv + 1, 1.5));
  const curLevelXP = Math.floor(100 * Math.pow(lv, 1.5));
  return {
    daily,
    level: lv,
    title: typeof lvTitle === 'function' ? lvTitle(lv) : 'Level ' + lv,
    currentXP: curXP,
    nextLevelXP: nextXP,
    currentLevelXP: curLevelXP,
    progress: nextXP > curLevelXP ? Math.round((curXP - curLevelXP) / (nextXP - curLevelXP) * 100) : 100,
    questXP,
    totalXP: curXP
  };
}
```

- [ ] **Step 3: Update quest completion to track XP**

In `render/render.js` or wherever quests are completed, add logic to accumulate quest XP:
```javascript
// When a quest is completed, add to questXP
function trackQuestXP(type, xp) {
  if (!S.questXP) S.questXP = { daily: 0, weekly: 0, monthly: 0, yearly: 0, lifetime: 0 };
  S.questXP[type] = (S.questXP[type] || 0) + xp;
  saveState();
}
```

- [ ] **Step 4: Test XP stats show quest XP**

Complete a quest, check Analytics tab shows correct total XP.

- [ ] **Step 5: Commit**

```bash
git add state/state.js analytics/analytics.js render/render.js
git commit -m "feat: add quest XP tracking to analytics"
```

### Task 2.3: Add Missing Analytics Metrics

**Files:**
- Modify: `analytics/dashboard.js` (add new metric cards)

**Interfaces:**
- Consumes: `Analytics.getXPStats()`, `S.questXP`
- Produces: Additional metric cards

- [ ] **Step 1: Add Total XP and Quest Breakdown cards**

In `analytics/dashboard.js`, modify `summaryCards`:
```javascript
function summaryCards() {
  const prayers = Analytics.getPrayerStats();
  const streak = Analytics.getStreakStats();
  const xp = Analytics.getXPStats();
  const questBreakdown = S.questXP || { daily: 0, weekly: 0, monthly: 0, yearly: 0, lifetime: 0 };
  return `
    <div class="insights-cards">
      <div class="insight-card">
        <div class="insight-card-icon">🕌</div>
        <div class="insight-card-num">${prayers.total}</div>
        <div class="insight-card-label">Total Prayers</div>
        <div class="insight-card-sub">${prayers.rate}% completion</div>
        <div class="insight-progress"><div class="insight-progress-bar" style="width:${prayers.rate}%"></div></div>
      </div>
      <div class="insight-card">
        <div class="insight-card-icon">🔥</div>
        <div class="insight-card-num">${streak.current}</div>
        <div class="insight-card-label">Current Streak</div>
        <div class="insight-card-sub">Best: ${streak.best}</div>
      </div>
      <div class="insight-card">
        <div class="insight-card-icon">⭐</div>
        <div class="insight-card-num">Lv ${xp.level}</div>
        <div class="insight-card-label">${xp.title}</div>
        <div class="insight-card-sub">${xp.progress}% to next</div>
        <div class="insight-progress"><div class="insight-progress-bar" style="width:${xp.progress}%"></div></div>
      </div>
      <div class="insight-card">
        <div class="insight-card-icon">🏆</div>
        <div class="insight-card-num">${questBreakdown.daily + questBreakdown.weekly + questBreakdown.monthly + questBreakdown.yearly + questBreakdown.lifetime}</div>
        <div class="insight-card-label">Quests XP</div>
        <div class="insight-card-sub">Daily: ${questBreakdown.daily}</div>
      </div>
    </div>`;
}
```

- [ ] **Step 2: Test new metrics display**

Open Analytics tab, verify new cards show correct data.

- [ ] **Step 3: Commit**

```bash
git add analytics/dashboard.js
git commit -m "feat: add quest XP breakdown to analytics dashboard"
```

---

## Phase 3: XP Rebalancing

### Task 3.1: Update Daily Quest XP

**Files:**
- Modify: `data/quests.js` (update DQUESTS XP values)

**Interfaces:**
- Consumes: None
- Produces: Updated daily quest XP

- [ ] **Step 1: Update DQUESTS XP values**

Open `data/quests.js` and update:
```javascript
const DQUESTS = [
  { id:'dq1', d:'Complete Fajr & Isha',          c: (s,l) => l.p?.fajr && l.p?.isha, xp:55 },
  { id:'dq2', d:'Do 3 extra deeds',               c: (s,l) => Object.values(l.d||{}).filter(v=>v).length>=3, xp:50 },
  { id:'dq3', d:'Read Quran today',               c: (s,l) => l.d?.quran, xp:35 },
  { id:'dq4', d:'Give Charity',                   c: (s,l) => l.d?.charity, xp:45 },
  { id:'dq5', d:'Pray any voluntary prayer',      c: (s,l) => Object.values(l.v||{}).some(v=>v), xp:50 },
  { id:'dq6', d:'Pray all 5 daily prayers',       c: (s,l) => Object.values(l.p||{}).filter(v=>v).length>=5, xp:70 },
  { id:'dq7', d:'Pray Dhuhr & Asr',               c: (s,l) => l.p?.dhuhr && l.p?.asr, xp:55 },
  { id:'dq8', d:'Morning & Evening Adhkar',       c: (s,l) => l.d?.morning && l.d?.evening, xp:65 },
  { id:'dq9', d:'Dhikr and Istighfar',            c: (s,l) => l.d?.dhikr && l.d?.istighfar, xp:50 },
  { id:'dq10',d:'Pray Tahajjud',                  c: (s,l) => l.v?.tahajjud, xp:70 },
  { id:'dq11',d:'Pray Duha/Ishraq prayer',         c: (s,l) => l.v?.duha || l.v?.ishraq, xp:55 },
  { id:'dq12',d:'Smile (Sunnah)',                 c: (s,l) => l.d?.smile, xp:25 },
  { id:'dq13',d:'Help parents/family',            c: (s,l) => l.d?.family, xp:40 },
  { id:'dq14',d:'Avoid useless talk',             c: (s,l) => l.d?.silence, xp:55 },
  { id:'dq15',d:'Make specific dua for others',   c: (s,l) => l.d?.dua, xp:50 }
];
```

- [ ] **Step 2: Test daily quests show new XP**

Open app, check Quests tab shows updated XP values.

- [ ] **Step 3: Commit**

```bash
git add data/quests.js
git commit -m "feat: rebalance daily quest XP to 20-70 range"
```

### Task 3.2: Update Weekly/Monthly/Yearly/Lifetime Quest XP

**Files:**
- Modify: `data/quests.js` (update WQUESTS, MQUESTS, YQUESTS, LQUESTS)

**Interfaces:**
- Consumes: None
- Produces: Updated quest XP values

- [ ] **Step 1: Update WQUESTS XP values**

```javascript
const WQUESTS = [
  { id:'w1', d:'Perfect prayers 5 days',   c: s => cpd(s,ws(),we())>=5, xp:400 },
  { id:'w2', d:'Tahajjud 3x this week',    c: s => cvl(s,'tahajjud',ws(),we())>=3, xp:300 },
  { id:'w3', d:'Give charity 2x this week',c: s => countDeedP(s,'charity',ws(),we())>=2, xp:250 },
  { id:'w4', d:'Read Quran 5 days',        c: s => countDeedP(s,'quran',ws(),we())>=5, xp:300 },
  { id:'w5', d:'Pray Witr 5 times',        c: s => cvl(s,'witr',ws(),we())>=5, xp:250 },
  { id:'w6', d:'Fasting 1 day (Mon/Thu)',  c: s => Object.keys(s.fastingDays||{}).filter(dk=>dk>=ws()&&dk<=we()&&s.fastingDays[dk]).length>=1, xp:350 },
  { id:'w7', d:'Read Surah Kahf (Friday)', c: s => cvl(s,'kahf',ws(),we())>=1, xp:250 },
  { id:'w8', d:'Maintain 7-day streak',    c: s => s.cs >= 7, xp:300 }
];
```

- [ ] **Step 2: Update MQUESTS XP values**

```javascript
const MQUESTS = [
  { id:'m1', d:'20 perfect days this month',  c: s => cpd(s,ms(),me())>=20, xp:1200 },
  { id:'m2', d:'100 prayers this month',      c: s => cpr(s,ms(),me())>=100, xp:1000 },
  { id:'m3', d:'Fast 3 days this month',      c: s => Object.keys(s.fastingDays||{}).filter(dk=>dk>=ms()&&dk<=me()&&s.fastingDays[dk]).length>=3, xp:800 },
  { id:'m4', d:'Read Quran 15 times',         c: s => countDeedP(s,'quran',ms(),me())>=15, xp:1000 },
  { id:'m5', d:'Give 5% monthly charity',     c: s => (s.charity.given >= (s.charity.monthly * 0.05)), xp:900 },
  { id:'m6', d:'Pray Tahajjud 10 times',      c: s => cvl(s,'tahajjud',ms(),me())>=10, xp:1500 },
  { id:'m7', d:'Memorize 1 new surah/ayah',   c: s => (s.memorized||0)>=1, xp:1100 },
  { id:'m8', d:'Read all Friday Kahfs',       c: s => cvl(s,'kahf',ms(),me())>=4, xp:1200 }
];
```

- [ ] **Step 3: Update YQUESTS XP values**

```javascript
const YQUESTS = [
  { id:'y1', d:'300 perfect days this year',  c: s => cpd(s,ys(),ye())>=300, xp:8000 },
  { id:'y2', d:'1500 prayers this year',      c: s => cpr(s,ys(),ye())>=1500, xp:6000 },
  { id:'y3', d:'Fast 30 days this year',      c: s => Object.keys(s.fastingDays||{}).filter(dk=>dk>=ys()&&dk<=ye()&&s.fastingDays[dk]).length>=30, xp:6000 },
  { id:'y4', d:'Read Quran 300 times',        c: s => countDeedP(s,'quran',ys(),ye())>=300, xp:10000 },
  { id:'y5', d:'Memorize 5 new surahs',       c: s => (s.memorized||0)>=5, xp:12000 },
  { id:'y6', d:'Pray Tahajjud 100 times',     c: s => cvl(s,'tahajjud',ys(),ye())>=100, xp:15000 },
  { id:'y7', d:'Give consistent yearly charity',c: s => s.charity.given > 0, xp:8000 }
];
```

- [ ] **Step 4: Update LQUESTS XP values**

```javascript
const LQUESTS = [
  { id:'l1', d:'Complete 50 prayers',          c: s => s.tp>=50, xp:2000 },
  { id:'l2', d:'Read Quran 30 times',           c: s => (s.td.quran||0)>=30, xp:3000 },
  { id:'l3', d:'100 voluntary prayers',         c: s => Object.values(s.vc).reduce((a,b)=>a+b,0)>=100, xp:5000 },
  { id:'l4', d:'Memorize 10 surahs',            c: s => (s.memorized||0)>=10, xp:4000 },
  { id:'l5', d:'Complete 500 prayers',          c: s => s.tp>=500, xp:15000 },
  { id:'l6', d:'Read Quran 100 times',          c: s => (s.td.quran||0)>=100, xp:12000 },
  { id:'l7', d:'Do 500 extra deeds',            c: s => Object.values(s.td).reduce((a,b)=>a+b,0)>=500, xp:18000 },
  { id:'l8', d:'Achieve a 30-day streak',       c: s => s.bs>=30, xp:20000 },
  { id:'l9', d:'Memorize 30 surahs',            c: s => (s.memorized||0)>=30, xp:15000 },
  { id:'l10',d:'Complete 5,000 prayers',        c: s => s.tp>=5000, xp:40000 },
  { id:'l11',d:'Achieve a 365-day streak',      c: s => s.bs>=365, xp:60000 },
  { id:'l12',d:'Read Quran 1,000 times',        c: s => (s.td.quran||0)>=1000, xp:45000 },
  { id:'l13',d:'Do 10,000 extra deeds',         c: s => Object.values(s.td).reduce((a,b)=>a+b,0)>=10000, xp:80000 },
  { id:'l14',d:'Memorize the entire Quran',     c: s => (s.memorized||0)>=114, xp:100000 }
];
```

- [ ] **Step 5: Test quest XP values**

Open app, check Quests tab shows all updated XP values.

- [ ] **Step 6: Commit**

```bash
git add data/quests.js
git commit -m "feat: rebalance weekly/monthly/yearly/lifetime quest XP"
```

---

## Phase 4: Health & Wellness Tab

### Task 4.1: Create Health Data Pool and State

**Files:**
- Create: `data/pools/health.js`
- Modify: `state/state.js` (add healthLog)

**Interfaces:**
- Consumes: None
- Produces: `HEALTH_PROMPTS`, `EXERCISE_TYPES`, `healthLog` state

- [ ] **Step 1: Create health data pool**

Create `data/pools/health.js`:
```javascript
const HEALTH_PROMPTS = [
  "How much water have you drunk today?",
  "Did you eat a healthy meal today?",
  "Did you get enough sleep last night?",
  "Did you exercise or move your body today?",
  "Did you take breaks from screen time?"
];

const EXERCISE_TYPES = [
  { id: 'walk', name: 'Walking', icon: '🚶', xpPerMin: 1 },
  { id: 'run', name: 'Running', icon: '🏃', xpPerMin: 2 },
  { id: 'gym', name: 'Gym/Weights', icon: '🏋️', xpPerMin: 2 },
  { id: 'yoga', name: 'Yoga/Stretching', icon: '🧘', xpPerMin: 1 },
  { id: 'sports', name: 'Sports', icon: '⚽', xpPerMin: 1.5 },
  { id: 'swim', name: 'Swimming', icon: '🏊', xpPerMin: 2 },
  { id: 'cycle', name: 'Cycling', icon: '🚴', xpPerMin: 1.5 }
];

const WATER_TARGET = 8;
const SLEEP_TARGET = 8;
```

- [ ] **Step 2: Add healthLog to state**

Open `state/state.js` and add to `freshState()`:
```javascript
healthLog: {},
```

- [ ] **Step 3: Test data loads**

Open browser console, verify `HEALTH_PROMPTS` and `EXERCISE_TYPES` are defined.

- [ ] **Step 4: Commit**

```bash
git add data/pools/health.js state/state.js
git commit -m "feat: add health data pool and state"
```

### Task 4.2: Create Health Tracking UI

**Files:**
- Create: `features/health.js`
- Modify: `data/tab-groups.js` (add health tab)
- Modify: `index.html` (add health panel)
- Modify: `render/render.js` (add renderHealth)
- Modify: `styles/main.css` (add health styles)

**Interfaces:**
- Consumes: `S.healthLog`, `HEALTH_PROMPTS`, `EXERCISE_TYPES`
- Produces: `renderHealth()`, `logWater()`, `logSleep()`, `logExercise()`

- [ ] **Step 1: Add health tab to navigation**

Open `data/tab-groups.js` and add to `ibadah` array after `fasting`:
```javascript
{ id: 'health', icon: '💪', label: 'Health' },
```

- [ ] **Step 2: Add health panel to HTML**

Open `index.html` and add after the fasting panel:
```html
<div class="tab-panel" id="panel-health"><div id="healthArea"></div></div>
```

- [ ] **Step 3: Create health feature module**

Create `features/health.js`:
```javascript
(function() {
  function getTodayHealth() {
    const t = today();
    if (!S.healthLog) S.healthLog = {};
    if (!S.healthLog[t]) S.healthLog[t] = { water: 0, sleep: 0, exercise: [], meals: {} };
    return S.healthLog[t];
  }
  
  function logWater(glasses) {
    const h = getTodayHealth();
    h.water = Math.max(0, Math.min(WATER_TARGET + 2, glasses));
    saveState();
    renderHealth();
  }
  
  function logSleep(hours) {
    const h = getTodayHealth();
    h.sleep = Math.max(0, Math.min(12, parseFloat(hours) || 0));
    saveState();
    renderHealth();
  }
  
  function logExercise(type, duration) {
    const h = getTodayHealth();
    h.exercise.push({ type, duration: parseInt(duration) || 0, date: today() });
    saveState();
    renderHealth();
  }
  
  function toggleMeal(meal) {
    const h = getTodayHealth();
    h.meals[meal] = !h.meals[meal];
    saveState();
    renderHealth();
  }
  
  function getHealthScore() {
    const h = getTodayHealth();
    let score = 0;
    score += Math.min(25, (h.water / WATER_TARGET) * 25);
    score += Math.min(25, (h.sleep >= SLEEP_TARGET ? 25 : (h.sleep / SLEEP_TARGET) * 25));
    score += Math.min(25, h.exercise.length > 0 ? 25 : 0);
    const mealsDone = Object.values(h.meals).filter(v => v).length;
    score += Math.min(25, (mealsDone / 3) * 25);
    return Math.round(score);
  }
  
  function renderHealth() {
    const el = document.getElementById('healthArea');
    if (!el) return;
    const h = getTodayHealth();
    const score = getHealthScore();
    
    let html = '<div class="section-title">💪 Health & Wellness</div>';
    
    // Health Score
    html += `<div class="health-score-card">
      <div class="health-score-num">${score}</div>
      <div class="health-score-label">Health Score</div>
      <div class="health-score-bar"><div class="health-score-fill" style="width:${score}%"></div></div>
    </div>`;
    
    // Water Tracker
    html += `<div class="health-card">
      <div class="health-card-header">💧 Water (${h.water}/${WATER_TARGET} glasses)</div>
      <div class="water-grid">
        ${Array.from({length: WATER_TARGET}, (_, i) => 
          `<div class="water-glass ${i < h.water ? 'filled' : ''}" onclick="App.logWater(${i + 1})">💧</div>`
        ).join('')}
      </div>
    </div>`;
    
    // Sleep Tracker
    html += `<div class="health-card">
      <div class="health-card-header">😴 Sleep (${h.sleep}h)</div>
      <input type="number" class="profile-input" id="sleepInput" placeholder="Hours slept" min="0" max="12" step="0.5" value="${h.sleep}">
      <button class="shop-card" onclick="App.logSleep(document.getElementById('sleepInput').value)" style="justify-content:center;width:100%;">Log Sleep</button>
    </div>`;
    
    // Exercise Tracker
    html += `<div class="health-card">
      <div class="health-card-header">🏃 Exercise</div>
      <select class="profile-input" id="exerciseType">
        ${EXERCISE_TYPES.map(e => `<option value="${e.id}">${e.icon} ${e.name}</option>`).join('')}
      </select>
      <input type="number" class="profile-input" id="exerciseDuration" placeholder="Duration (minutes)" min="1">
      <button class="shop-card" onclick="App.logExercise(document.getElementById('exerciseType').value, document.getElementById('exerciseDuration').value)" style="justify-content:center;width:100%;">Log Exercise</button>
      ${h.exercise.length > 0 ? `<div class="exercise-log">${h.exercise.map(e => {
        const type = EXERCISE_TYPES.find(t => t.id === e.type);
        return `<div class="exercise-item">${type?.icon || '🏃'} ${type?.name || e.type} - ${e.duration}min</div>`;
      }).join('')}</div>` : ''}
    </div>`;
    
    // Meals Tracker
    html += `<div class="health-card">
      <div class="health-card-header">🍽️ Meals</div>
      <div class="meal-grid">
        <div class="meal-item ${h.meals.breakfast ? 'eaten' : ''}" onclick="App.toggleMeal('breakfast')">🌅 Breakfast</div>
        <div class="meal-item ${h.meals.lunch ? 'eaten' : ''}" onclick="App.toggleMeal('lunch')">☀️ Lunch</div>
        <div class="meal-item ${h.meals.dinner ? 'eaten' : ''}" onclick="App.toggleMeal('dinner')">🌇 Dinner</div>
      </div>
    </div>`;
    
    el.innerHTML = html;
  }
  
  window.renderHealth = renderHealth;
  window.logWater = logWater;
  window.logSleep = logSleep;
  window.logExercise = logExercise;
  window.toggleMeal = toggleMeal;
})();
```

- [ ] **Step 4: Add renderHealth to renderStatic**

In `render/render.js`, add to `renderStatic`:
```javascript
safe(renderHealth,'Health');
```

- [ ] **Step 5: Add health styles**

Add to `styles/main.css`:
```css
/* Health Tab */
.health-score-card {
  text-align: center;
  padding: 20px;
  background: var(--card);
  border-radius: var(--radius);
  margin-bottom: 16px;
  border: 1px solid var(--border);
}
.health-score-num {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--gold);
}
.health-score-label {
  font-size: 0.85rem;
  color: var(--text2);
  margin-bottom: 8px;
}
.health-score-bar {
  height: 8px;
  background: rgba(255,255,255,0.1);
  border-radius: 4px;
  overflow: hidden;
}
.health-score-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--gold), var(--green));
  border-radius: 4px;
  transition: width 0.3s;
}
.health-card {
  background: var(--card);
  border-radius: var(--radius);
  padding: 16px;
  margin-bottom: 12px;
  border: 1px solid var(--border);
}
.health-card-header {
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--text1);
}
.water-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}
.water-glass {
  text-align: center;
  padding: 8px;
  border-radius: 8px;
  background: var(--card2);
  cursor: pointer;
  opacity: 0.4;
  transition: all 0.2s;
}
.water-glass.filled {
  opacity: 1;
  background: rgba(59,130,246,0.2);
}
.meal-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.meal-item {
  text-align: center;
  padding: 12px;
  border-radius: 8px;
  background: var(--card2);
  cursor: pointer;
  transition: all 0.2s;
}
.meal-item.eaten {
  background: rgba(34,197,94,0.2);
  border: 1px solid var(--green);
}
.exercise-log {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
}
.exercise-item {
  padding: 8px 0;
  font-size: 0.9rem;
  color: var(--text1);
}
```

- [ ] **Step 6: Test health tab renders**

Open app, navigate to Health tab. Verify:
- Health score shows
- Water tracker works
- Sleep logger works
- Exercise logger works
- Meals toggles work

- [ ] **Step 7: Commit**

```bash
git add features/health.js data/tab-groups.js index.html render/render.js styles/main.css
git commit -m "feat: add Health & Wellness tab"
```

---

## Phase 5: Finance & Charity Tab

### Task 5.1: Create Finance Data Pool and State

**Files:**
- Create: `data/pools/finance.js`
- Modify: `state/state.js` (add financeLog)

**Interfaces:**
- Consumes: None
- Produces: `INCOME_SOURCES`, `EXPENSE_CATEGORIES`, `financeLog` state

- [ ] **Step 1: Create finance data pool**

Create `data/pools/finance.js`:
```javascript
const INCOME_SOURCES = [
  { id: 'salary', name: 'Salary', icon: '💼' },
  { id: 'freelance', name: 'Freelance', icon: '💻' },
  { id: 'business', name: 'Business', icon: '🏪' },
  { id: 'gift', name: 'Gift', icon: '🎁' },
  { id: 'other', name: 'Other', icon: '💵' }
];

const EXPENSE_CATEGORIES = [
  { id: 'food', name: 'Food & Groceries', icon: '🍽️' },
  { id: 'transport', name: 'Transport', icon: '🚗' },
  { id: 'bills', name: 'Bills & Utilities', icon: '📄' },
  { id: 'charity', name: 'Charity', icon: '🤲' },
  { id: 'clothing', name: 'Clothing', icon: '👕' },
  { id: 'health', name: 'Health', icon: '🏥' },
  { id: 'education', name: 'Education', icon: '📚' },
  { id: 'other', name: 'Other', icon: '📦' }
];

const ZAKAT_RATE = 0.025; // 2.5%
```

- [ ] **Step 2: Add financeLog to state**

Open `state/state.js` and add to `freshState()`:
```javascript
financeLog: {},
```

- [ ] **Step 3: Test data loads**

Open browser console, verify `INCOME_SOURCES` and `EXPENSE_CATEGORIES` are defined.

- [ ] **Step 4: Commit**

```bash
git add data/pools/finance.js state/state.js
git commit -m "feat: add finance data pool and state"
```

### Task 5.2: Create Finance Tracking UI

**Files:**
- Create: `features/finance.js`
- Modify: `data/tab-groups.js` (add finance tab)
- Modify: `index.html` (add finance panel)
- Modify: `render/render.js` (add renderFinance)
- Modify: `styles/main.css` (add finance styles)

**Interfaces:**
- Consumes: `S.financeLog`, `INCOME_SOURCES`, `EXPENSE_CATEGORIES`
- Produces: `renderFinance()`, `logIncome()`, `logExpense()`, `calculateZakat()`

- [ ] **Step 1: Add finance tab to navigation**

Open `data/tab-groups.js` and add to `ibadah` array after `health`:
```javascript
{ id: 'finance', icon: '💰', label: 'Finance' },
```

- [ ] **Step 2: Add finance panel to HTML**

Open `index.html` and add after the health panel:
```html
<div class="tab-panel" id="panel-finance"><div id="financeArea"></div></div>
```

- [ ] **Step 3: Create finance feature module**

Create `features/finance.js` with income/expense logging, charity tracking, and Zakat calculator.

- [ ] **Step 4: Add renderFinance to renderStatic**

- [ ] **Step 5: Add finance styles**

- [ ] **Step 6: Test finance tab**

- [ ] **Step 7: Commit**

```bash
git add features/finance.js data/tab-groups.js index.html render/render.js styles/main.css
git commit -m "feat: add Finance & Charity tab"
```

---

## Phase 6: Mood & Reflection Tab

### Task 6.1: Create Mood Data Pool and State

**Files:**
- Create: `data/pools/mood.js`
- Modify: `state/state.js` (add moodLog)

**Interfaces:**
- Consumes: None
- Produces: `MOOD_EMOJIS`, `REFLECTION_PROMPTS`, `moodLog` state

- [ ] **Step 1: Create mood data pool**

Create `data/pools/mood.js`:
```javascript
const MOOD_EMOJIS = [
  { value: 1, emoji: '😞', label: 'Very Low', color: '#ef4444' },
  { value: 2, emoji: '😐', label: 'Low', color: '#f97316' },
  { value: 3, emoji: '😊', label: 'Good', color: '#eab308' },
  { value: 4, emoji: '😄', label: 'Great', color: '#22c55e' },
  { value: 5, emoji: '🤩', label: 'Excellent', color: '#3b82f6' }
];

const REFLECTION_PROMPTS = [
  "What am I grateful for today?",
  "How did I improve someone's life today?",
  "What challenge did I overcome today?",
  "What did I learn today?",
  "How did I remember Allah today?",
  "What good deed can I do tomorrow?",
  "How was my patience today?",
  "Did I fulfill my duties to family today?"
];
```

- [ ] **Step 2: Add moodLog to state**

Open `state/state.js` and add to `freshState()`:
```javascript
moodLog: {},
```

- [ ] **Step 3: Test data loads**

- [ ] **Step 4: Commit**

```bash
git add data/pools/mood.js state/state.js
git commit -m "feat: add mood data pool and state"
```

### Task 6.2: Create Mood Tracking UI

**Files:**
- Create: `features/mood.js`
- Modify: `data/tab-groups.js` (add mood tab)
- Modify: `index.html` (add mood panel)
- Modify: `render/render.js` (add renderMood)
- Modify: `styles/main.css` (add mood styles)

**Interfaces:**
- Consumes: `S.moodLog`, `MOOD_EMOJIS`, `REFLECTION_PROMPTS`
- Produces: `renderMood()`, `setMood()`, `addReflection()`, `addDua()`

- [ ] **Step 1: Add mood tab to navigation**

Open `data/tab-groups.js` and add to `ibadah` array after `finance`:
```javascript
{ id: 'mood', icon: '🧠', label: 'Mood' },
```

- [ ] **Step 2: Add mood panel to HTML**

Open `index.html` and add after the finance panel:
```html
<div class="tab-panel" id="panel-mood"><div id="moodArea"></div></div>
```

- [ ] **Step 3: Create mood feature module**

Create `features/mood.js` with mood selection, gratitude journal, reflection prompts, and dua list.

- [ ] **Step 4: Add renderMood to renderStatic**

- [ ] **Step 5: Add mood styles**

- [ ] **Step 6: Test mood tab**

- [ ] **Step 7: Commit**

```bash
git add features/mood.js data/tab-groups.js index.html render/render.js styles/main.css
git commit -m "feat: add Mood & Reflection tab"
```

---

## Summary

| Phase | Tasks | Commits | Features |
|-------|-------|---------|----------|
| 1 | 2 | 2 | Trophy cabinet fix |
| 2 | 3 | 3 | Analytics fix |
| 3 | 2 | 2 | XP rebalancing |
| 4 | 2 | 2 | Health tab |
| 5 | 2 | 2 | Finance tab |
| 6 | 2 | 2 | Mood tab |
| **Total** | **13** | **13** | **Complete overhaul** |

---

*End of Implementation Plan*
