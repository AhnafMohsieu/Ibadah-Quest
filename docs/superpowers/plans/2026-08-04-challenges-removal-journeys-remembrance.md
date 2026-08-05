# Challenges Removal + Journey & Remembrance Enhancements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the Challenges tab and enhance both Journey and Remembrance tabs with visual improvements, analytics, integration, and new features.

**Architecture:** Incremental approach — Challenges removal first (isolated), then Journey enhancements (4 phases), then Remembrance enhancements (4 phases). Each phase produces working, testable software.

**Tech Stack:** Vanilla JavaScript, CSS, HTML, localStorage for persistence

---

## Phase 1: Challenges Removal

### Task 1.1: Remove Challenges Tab from Navigation

**Files:**
- Modify: `data/tab-groups.js:8`
- Modify: `index.html:92`

**Interfaces:**
- Consumes: None
- Produces: Challenges tab removed from UI

- [ ] **Step 1: Remove challenges entry from tab-groups.js**

Open `data/tab-groups.js` and delete line 8:
```javascript
{ id: 'challenges', icon: '⚔️', label: 'Challenges' },
```

- [ ] **Step 2: Remove challenges panel from index.html**

Open `index.html` and delete line 92:
```html
<div class="tab-panel" id="panel-challenges"><div id="challengeArea"></div></div>
```

- [ ] **Step 3: Test navigation works**

Open the app in a browser. Verify:
- Daily tab loads without errors
- No "Challenges" tab appears in navigation
- No console errors

- [ ] **Step 4: Commit**

```bash
git add data/tab-groups.js index.html
git commit -m "remove: challenges tab from navigation"
```

### Task 1.2: Remove Challenges Rendering Code

**Files:**
- Modify: `render/render.js:10-23` (remove challengeArea references)
- Modify: `render/render.js:1140-1252` (remove renderChallenges, completeChallenge, data arrays)

**Interfaces:**
- Consumes: None
- Produces: Challenges rendering code removed

- [ ] **Step 1: Remove challengeArea from renderDynamic**

Open `render/render.js` and remove these lines from the `renderDynamic` function (around lines 10-23):
```javascript
const challengeArea = document.getElementById('challengeArea');
// ...
const challengeScroll = challengeArea ? challengeArea.scrollTop : 0;
// ...
safe(renderChallenges, 'Challenges');
// ...
if (challengeArea) challengeArea.scrollTop = challengeScroll;
```

- [ ] **Step 2: Remove renderChallenges function**

Delete the entire `renderChallenges` function (lines ~1140-1229) which includes:
- `chDaily` array
- `chWeekly` array
- `chMonthly` array
- `chYearly` array
- `chLifetime` array
- `renderChallengeGroup` helper function
- The main rendering logic

- [ ] **Step 3: Remove completeChallenge function**

Delete the `completeChallenge` function (lines ~1230-1252).

- [ ] **Step 4: Remove window export**

Find and delete this line (around line 1588):
```javascript
window.completeChallenge = completeChallenge;
```

- [ ] **Step 5: Test no console errors**

Open the app. Verify:
- No "renderChallenges is not defined" errors
- No "completeChallenge is not defined" errors
- Daily tab still renders correctly

- [ ] **Step 6: Commit**

```bash
git add render/render.js
git commit -m "remove: challenges rendering code"
```

### Task 1.3: Remove Challenges State and Search

**Files:**
- Modify: `state/state.js:24`
- Modify: `data/pools/helpers.js:27`
- Modify: `core/actions.js:2140`

**Interfaces:**
- Consumes: None
- Produces: Challenges state and search removed

- [ ] **Step 1: Remove challenges from freshState**

Open `state/state.js` and remove `challenges:[]` from the `freshState()` function (line 24). The line should change from:
```javascript
challenges:[], muhWeek:'', journeys:{}, gratitudeLog:{}, fastingDays:{}, memorized:0, memorizationList:[],
```
to:
```javascript
muhWeek:'', journeys:{}, gratitudeLog:{}, fastingDays:{}, memorized:0, memorizationList:[],
```

- [ ] **Step 2: Remove challenges from search index**

Open `data/pools/helpers.js` and delete line 27:
```javascript
{cat:"Ibadah",title:"Challenges",desc:"Daily challenges",action:"switchCategory",args:["ibadah","challenges"]},
```

- [ ] **Step 3: Remove completeChallenge from App export**

Open `core/actions.js` and find line 2140. Remove `completeChallenge: window.completeChallenge,` from the App export object.

- [ ] **Step 4: Test search works**

Open the app. Type "challenges" in the search bar. Verify:
- No search results for "challenges"
- Other search results still work

- [ ] **Step 5: Commit**

```bash
git add state/state.js data/pools/helpers.js core/actions.js
git commit -m "remove: challenges state and search entry"
```

---

## Phase 2: Journey Visual Improvements

### Task 2.1: Create Journey Progress Ring Component

**Files:**
- Modify: `styles/main.css` (add journey ring styles)
- Modify: `features/journeys.js` (add ring rendering)

**Interfaces:**
- Consumes: None
- Produces: `renderProgressRing(completed, target, color)` function

- [ ] **Step 1: Add CSS for progress ring**

Open `styles/main.css` and add at the end:
```css
/* Journey Progress Ring */
.journey-ring-container {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto 16px;
}
.journey-ring-bg {
  fill: none;
  stroke: rgba(255,255,255,0.1);
  stroke-width: 8;
}
.journey-ring-progress {
  fill: none;
  stroke-width: 8;
  stroke-linecap: round;
  transform: rotate(-90deg);
  transform-origin: center;
  transition: stroke-dashoffset 0.5s ease;
}
.journey-ring-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--gold);
}
```

- [ ] **Step 2: Add progress ring rendering function**

Open `features/journeys.js` and add before the `journeyCard` function:
```javascript
function renderProgressRing(completed, target, color) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(completed / target, 1);
  const offset = circumference * (1 - progress);
  const pct = Math.round(progress * 100);
  
  return `
    <div class="journey-ring-container">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle class="journey-ring-bg" cx="60" cy="60" r="${radius}"/>
        <circle class="journey-ring-progress" cx="60" cy="60" r="${radius}" 
          stroke="${color}" stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"/>
      </svg>
      <div class="journey-ring-text">${pct}%</div>
    </div>
  `;
}
```

- [ ] **Step 3: Export the function**

Add to the window exports at the end of `features/journeys.js`:
```javascript
window.renderProgressRing = renderProgressRing;
```

- [ ] **Step 4: Test ring renders**

Temporarily add a test call in the browser console:
```javascript
document.getElementById('journeyArea').innerHTML = renderProgressRing(25, 40, '#D4AF37');
```
Verify a ring appears showing 62%.

- [ ] **Step 5: Commit**

```bash
git add styles/main.css features/journeys.js
git commit -m "feat: add journey progress ring component"
```

### Task 2.2: Add Streak Tracking to Journeys

**Files:**
- Modify: `state/state.js` (add streak properties)
- Modify: `features/journeys.js` (add streak logic)

**Interfaces:**
- Consumes: `S.journeys` (existing)
- Produces: `S.journeyStats.currentStreaks`, `S.journeyStats.bestStreaks`

- [ ] **Step 1: Add journeyStats to freshState**

Open `state/state.js` and add to the `freshState()` return object (after `journeys:{}`):
```javascript
journeyStats: {
  completed: [],
  currentStreaks: {},
  bestStreaks: {},
  totalCompleted: 0,
  unlockedTiers: ['7day']
},
```

- [ ] **Step 2: Add streak calculation function**

Open `features/journeys.js` and add after the `renderProgressRing` function:
```javascript
function calculateStreak(log, journey, startDate) {
  let streak = 0;
  let currentDate = startDate;
  const todayStr = today();
  
  while (currentDate <= todayStr) {
    const dayLog = log[currentDate];
    if (dayLog && dayLog[journey.kind] && dayLog[journey.kind][journey.key]) {
      streak++;
    } else if (currentDate < todayStr) {
      break; // Streak broken on a past day
    }
    // Move to previous day
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 1);
    currentDate = d.getFullYear() + '-' + (d.getMonth()+1).toString().padStart(2,'0') + '-' + d.getDate().toString().padStart(2,'0');
  }
  
  return streak;
}
```

- [ ] **Step 3: Update journeyCard to show streak**

In `features/journeys.js`, modify the `journeyCard` function to display streak information after the summary div.

- [ ] **Step 4: Test streak calculation**

In the browser console, test:
```javascript
const streak = calculateStreak(S.log, JOURNEYS[0], S.journeys[JOURNEYS[0].id]);
console.log('Streak:', streak);
```

- [ ] **Step 5: Commit**

```bash
git add state/state.js features/journeys.js
git commit -m "feat: add journey streak tracking"
```

### Task 2.3: Add Milestone Celebrations

**Files:**
- Modify: `features/journeys.js` (add milestone detection)
- Modify: `render/render.js` (add toast for milestones)

**Interfaces:**
- Consumes: `S.log`, `S.journeys`, `JOURNEYS`
- Produces: Milestone toast notifications

- [ ] **Step 1: Add milestone detection**

In `features/journeys.js`, add a function to check milestones:
```javascript
function checkJourneyMilestone(journey, completed) {
  const milestones = [10, 20, 30, 40];
  for (const m of milestones) {
    if (completed === m) {
      toast('🎯', `Journey Milestone: ${m} days complete!`);
      return true;
    }
  }
  if (completed >= journey.target) {
    toast('🎉', 'Journey Complete! Alhamdulillah!', false, 3000);
    return true;
  }
  return false;
}
```

- [ ] **Step 2: Export the function**

Add to window exports:
```javascript
window.checkJourneyMilestone = checkJourneyMilestone;
```

- [ ] **Step 3: Test milestone detection**

In browser console:
```javascript
checkJourneyMilestone(JOURNEYS[0], 10); // Should show toast
checkJourneyMilestone(JOURNEYS[0], 40); // Should show completion toast
```

- [ ] **Step 4: Commit**

```bash
git add features/journeys.js
git commit -m "feat: add journey milestone celebrations"
```

---

## Phase 3: Journey Analytics

### Task 3.1: Add Journey Statistics Tracking

**Files:**
- Modify: `state/state.js` (extend journeyStats)
- Modify: `features/journeys.js` (add stats functions)

**Interfaces:**
- Consumes: `S.journeyStats`, `S.log`
- Produces: Journey analytics functions

- [ ] **Step 1: Extend journeyStats structure**

Update `freshState()` in `state/state.js`:
```javascript
journeyStats: {
  completed: [],
  currentStreaks: {},
  bestStreaks: {},
  totalCompleted: 0,
  unlockedTiers: ['7day'],
  history: [], // Array of {id, startDate, endDate, completedDays, target}
},
```

- [ ] **Step 2: Add analytics functions**

In `features/journeys.js`, add:
```javascript
function getJourneyAnalytics() {
  const stats = S.journeyStats || {};
  return {
    totalCompleted: stats.totalCompleted || 0,
    activeJourneys: Object.keys(S.journeys || {}).length,
    bestStreak: Math.max(...Object.values(stats.bestStreaks || {}), 0),
    history: stats.history || []
  };
}

function recordJourneyCompletion(id, startDate, endDate, completedDays, target) {
  if (!S.journeyStats) S.journeyStats = { completed: [], currentStreaks: {}, bestStreaks: {}, totalCompleted: 0, unlockedTiers: ['7day'], history: [] };
  S.journeyStats.completed.push(id);
  S.journeyStats.totalCompleted++;
  S.journeyStats.history.push({ id, startDate, endDate, completedDays, target });
  saveState();
}
```

- [ ] **Step 3: Export functions**

Add to window exports:
```javascript
window.getJourneyAnalytics = getJourneyAnalytics;
window.recordJourneyCompletion = recordJourneyCompletion;
```

- [ ] **Step 4: Test analytics**

In browser console:
```javascript
const analytics = getJourneyAnalytics();
console.log(analytics);
```

- [ ] **Step 5: Commit**

```bash
git add state/state.js features/journeys.js
git commit -m "feat: add journey statistics tracking"
```

### Task 3.2: Create Journey Dashboard UI

**Files:**
- Modify: `features/journeys.js` (add dashboard rendering)
- Modify: `styles/main.css` (add dashboard styles)

**Interfaces:**
- Consumes: `getJourneyAnalytics()`
- Produces: Journey dashboard UI

- [ ] **Step 1: Add dashboard CSS**

Add to `styles/main.css`:
```css
.journey-dashboard {
  background: var(--card);
  border-radius: var(--radius);
  padding: 16px;
  margin-bottom: 20px;
  border: 1px solid var(--border);
}
.journey-stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
.journey-stat-item {
  text-align: center;
  padding: 12px;
  background: var(--card2);
  border-radius: 12px;
}
.journey-stat-num {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--gold);
}
.journey-stat-label {
  font-size: 0.75rem;
  color: var(--text2);
  margin-top: 4px;
}
```

- [ ] **Step 2: Add dashboard rendering function**

In `features/journeys.js`, add:
```javascript
function renderJourneyDashboard() {
  const analytics = getJourneyAnalytics();
  return `
    <div class="journey-dashboard">
      <div class="section-title">📊 Journey Statistics</div>
      <div class="journey-stats-grid">
        <div class="journey-stat-item">
          <div class="journey-stat-num">${analytics.totalCompleted}</div>
          <div class="journey-stat-label">Completed</div>
        </div>
        <div class="journey-stat-item">
          <div class="journey-stat-num">${analytics.activeJourneys}</div>
          <div class="journey-stat-label">Active</div>
        </div>
        <div class="journey-stat-item">
          <div class="journey-stat-num">${analytics.bestStreak}</div>
          <div class="journey-stat-label">Best Streak</div>
        </div>
        <div class="journey-stat-item">
          <div class="journey-stat-num">${analytics.history.length}</div>
          <div class="journey-stat-label">Total Attempts</div>
        </div>
      </div>
    </div>
  `;
}
```

- [ ] **Step 3: Update renderJourneys to include dashboard**

Modify the `renderJourneys` function to prepend the dashboard:
```javascript
function renderJourneys() {
  try {
    const el = document.getElementById('journeyArea');
    if (!el) return;
    const t = today();
    const defs = (typeof JOURNEYS !== 'undefined') ? JOURNEYS : [];
    el.innerHTML = renderJourneyDashboard() +
      '<div class="section-title">🌱 40-Day Habit Journeys</div>' +
      '<div class="journey-intro">Choose one journey and go at your own pace...</div>' +
      defs.map(j => journeyCard(j, t)).join('');
  } catch (e) { console.warn('Render Journeys failed:', e.message); }
}
```

- [ ] **Step 4: Test dashboard renders**

Open the app, navigate to Journeys tab. Verify dashboard shows with stats.

- [ ] **Step 5: Commit**

```bash
git add features/journeys.js styles/main.css
git commit -m "feat: add journey dashboard UI"
```

---

## Phase 4: Journey Integration

### Task 4.1: Auto-Track Journey Progress from Daily Log

**Files:**
- Modify: `features/journeys.js` (add auto-tracking)

**Interfaces:**
- Consumes: `S.log`, `S.journeys`, `JOURNEYS`
- Produces: Automatic journey progress updates

- [ ] **Step 1: Add auto-tracking function**

In `features/journeys.js`, add:
```javascript
function autoTrackJourneyProgress() {
  const t = today();
  const defs = (typeof JOURNEYS !== 'undefined') ? JOURNEYS : [];
  
  defs.forEach(j => {
    if (!S.journeys[j.id]) return;
    
    const startDate = S.journeys[j.id];
    const dayLog = S.log[t];
    if (!dayLog) return;
    
    // Check if today's action was completed
    const completed = dayLog[j.kind] && dayLog[j.kind][j.key];
    if (!completed) return;
    
    // Update streak
    if (!S.journeyStats) S.journeyStats = {};
    if (!S.journeyStats.currentStreaks) S.journeyStats.currentStreaks = {};
    
    const currentStreak = S.journeyStats.currentStreaks[j.id] || 0;
    S.journeyStats.currentStreaks[j.id] = currentStreak + 1;
    
    // Update best streak
    if (!S.journeyStats.bestStreaks) S.journeyStats.bestStreaks = {};
    if (S.journeyStats.currentStreaks[j.id] > (S.journeyStats.bestStreaks[j.id] || 0)) {
      S.journeyStats.bestStreaks[j.id] = S.journeyStats.currentStreaks[j.id];
    }
    
    // Check milestones
    checkJourneyMilestone(j, S.journeyStats.currentStreaks[j.id]);
    
    saveState();
  });
}
```

- [ ] **Step 2: Hook into renderAll**

In `render/render.js`, add `autoTrackJourneyProgress` call to the `renderDynamic` function (after rendering journeys):
```javascript
safe(() => window.autoTrackJourneyProgress && window.autoTrackJourneyProgress(), 'AutoTrackJourneys');
```

- [ ] **Step 3: Test auto-tracking**

In browser console:
```javascript
autoTrackJourneyProgress();
console.log(S.journeyStats);
```

- [ ] **Step 4: Commit**

```bash
git add features/journeys.js render/render.js
git commit -m "feat: auto-track journey progress from daily log"
```

### Task 4.2: Add Cross-Journey Insights

**Files:**
- Modify: `features/journeys.js` (add insights display)

**Interfaces:**
- Consumes: `S.journeys`, `JOURNEYS`, `S.journeyStats`
- Produces: Journey insight cards

- [ ] **Step 1: Add insights rendering function**

In `features/journeys.js`, add:
```javascript
function renderJourneyInsights() {
  const activeJourneys = Object.keys(S.journeys || {});
  if (activeJourneys.length === 0) return '';
  
  const insights = activeJourneys.map(id => {
    const journey = JOURNEYS.find(j => j.id === id);
    if (!journey) return null;
    
    const startDate = S.journeys[id];
    const completed = journeyProgress(S.log, journey, startDate, today());
    const remaining = journey.target - completed;
    const pace = completed > 0 ? Math.round((completed / (Math.max(1, daysBetween(startDate, today())))) * 100) : 0;
    
    return `
      <div class="journey-insight-card">
        <div class="journey-insight-icon">${journey.icon}</div>
        <div class="journey-insight-info">
          <div class="journey-insight-name">${journey.name}</div>
          <div class="journey-insight-progress">${remaining > 0 ? `${remaining} days remaining` : 'Complete!'}</div>
          <div class="journey-insight-pace">${pace}% daily pace</div>
        </div>
      </div>
    `;
  }).filter(Boolean);
  
  if (insights.length === 0) return '';
  
  return `
    <div class="journey-insights">
      <div class="section-title">📈 Active Journey Progress</div>
      ${insights.join('')}
    </div>
  `;
}
```

- [ ] **Step 2: Update renderJourneys to include insights**

Modify `renderJourneys` to include insights after the dashboard.

- [ ] **Step 3: Test insights render**

Navigate to Journeys tab. Verify insight cards appear for active journeys.

- [ ] **Step 4: Commit**

```bash
git add features/journeys.js
git commit -m "feat: add cross-journey insights display"
```

---

## Phase 5: New Journey Features

### Task 5.1: Add Different Duration Support

**Files:**
- Modify: `data/journeys.js` (add duration tiers)
- Modify: `features/journeys.js` (add duration filtering)

**Interfaces:**
- Consumes: `S.journeyStats.unlockedTiers`
- Produces: Multi-duration journey support

- [ ] **Step 1: Update JOURNEYS data structure**

Open `data/journeys.js` and add duration tiers:
```javascript
const JOURNEYS = [
  // 7-day starters
  { id: 'fajr7', name: '7 Days of Fajr', icon: '🕌', desc: 'Pray Fajr on time for 7 days', kind: 'p', key: 'Fajr', target: 7, tier: '7day', category: 'salah' },
  { id: 'quran7', name: '7 Days of Quran', icon: '📖', desc: 'Read Quran daily for 7 days', kind: 'd', key: 'quran', target: 7, tier: '7day', category: 'quran' },
  
  // 21-day habit forming
  { id: 'fajr21', name: '21 Days of Fajr', icon: '🕌', desc: 'Pray Fajr on time for 21 days', kind: 'p', key: 'Fajr', target: 21, tier: '21day', category: 'salah' },
  
  // 40-day traditional (existing)
  { id: 'fajr40', name: '40 Days of Fajr', icon: '🕌', desc: 'Pray Fajr on time for 40 days', kind: 'p', key: 'Fajr', target: 40, tier: '40day', category: 'salah' },
  
  // 90-day deep
  { id: 'fajr90', name: '90 Days of Fajr', icon: '🕌', desc: 'Pray Fajr on time for 90 days', kind: 'p', key: 'Fajr', target: 90, tier: '90day', category: 'salah' },
  
  // Add more categories...
  { id: 'charity30', name: '30 Days of Charity', icon: '🤲', desc: 'Give charity daily for 30 days', kind: 'd', key: 'charity', target: 30, tier: '30day', category: 'charity' },
];
```

- [ ] **Step 2: Add tier filtering**

In `features/journeys.js`, add function to filter by unlocked tiers:
```javascript
function getAvailableJourneys() {
  const unlockedTiers = S.journeyStats?.unlockedTiers || ['7day'];
  return JOURNEYS.filter(j => unlockedTiers.includes(j.tier));
}
```

- [ ] **Step 3: Update renderJourneys to use filtering**

Replace `JOURNEYS` reference in `renderJourneys` with `getAvailableJourneys()`.

- [ ] **Step 4: Test filtering**

In browser console:
```javascript
console.log(getAvailableJourneys()); // Should show only 7-day journeys initially
```

- [ ] **Step 5: Commit**

```bash
git add data/journeys.js features/journeys.js
git commit -m "feat: add different journey duration support"
```

### Task 5.2: Add Progressive Unlocking

**Files:**
- Modify: `features/journeys.js` (add unlocking logic)

**Interfaces:**
- Consumes: `S.journeyStats.completed`, `S.journeyStats.unlockedTiers`
- Produces: Tier unlocking on completion milestones

- [ ] **Step 1: Add unlocking logic**

In `features/journeys.js`, add:
```javascript
function checkTierUnlocking() {
  if (!S.journeyStats) return;
  const completed = S.journeyStats.completed || [];
  const unlocked = S.journeyStats.unlockedTiers || ['7day'];
  
  // Count completions per tier
  const counts = { '7day': 0, '21day': 0, '40day': 0, '90day': 0 };
  completed.forEach(id => {
    const journey = JOURNEYS.find(j => j.id === id);
    if (journey && counts.hasOwnProperty(journey.tier)) {
      counts[journey.tier]++;
    }
  });
  
  // Unlock next tier when 3 completed
  const unlockOrder = ['7day', '21day', '40day', '90day', '365day'];
  for (let i = 0; i < unlockOrder.length - 1; i++) {
    const currentTier = unlockOrder[i];
    const nextTier = unlockOrder[i + 1];
    if (counts[currentTier] >= 3 && !unlocked.includes(nextTier)) {
      unlocked.push(nextTier);
      toast('🔓', `New journeys unlocked: ${nextTier}!`);
    }
  }
  
  S.journeyStats.unlockedTiers = unlocked;
  saveState();
}
```

- [ ] **Step 2: Hook into recordJourneyCompletion**

Call `checkTierUnlocking()` inside `recordJourneyCompletion()`.

- [ ] **Step 3: Test unlocking**

In browser console (after adding some completions):
```javascript
recordJourneyCompletion('fajr7', '2026-08-01', '2026-08-07', 7, 7);
checkTierUnlocking();
console.log(S.journeyStats.unlockedTiers); // Should include '21day'
```

- [ ] **Step 4: Commit**

```bash
git add features/journeys.js
git commit -m "feat: add progressive journey unlocking"
```

---

## Phase 6: Remembrance Tracking

### Task 6.1: Add Dhikr Session Logging

**Files:**
- Modify: `state/state.js` (add dhikrSessions)
- Modify: `core/actions.js` (add session tracking to tapDhikr)

**Interfaces:**
- Consumes: `S.dhikrCounters`
- Produces: `S.dhikrSessions` array

- [ ] **Step 1: Add dhikrSessions to freshState**

Open `state/state.js` and add to `freshState()`:
```javascript
dhikrSessions: [],
dhikrStats: {
  total: {},
  daily: {},
  streak: 0,
  bestStreak: 0,
  lastSessionDate: null,
  badges: [],
  achievements: []
},
```

- [ ] **Step 2: Modify tapDhikr to log sessions**

Open `core/actions.js` and modify the `tapDhikr` function:
```javascript
function tapDhikr() {
  if (!S.dhikrCounters) S.dhikrCounters = {};
  const idx = S.dhikrCounters._active || 0;
  S.dhikrCounters[idx] = (S.dhikrCounters[idx] || 0) + 1;
  const d = DHIKR_COUNTER_DATA[idx % DHIKR_COUNTER_DATA.length];
  
  // Log session
  const t = today();
  if (!S.dhikrSessions) S.dhikrSessions = [];
  S.dhikrSessions.push({
    date: t,
    dhikrId: idx,
    count: S.dhikrCounters[idx],
    timestamp: Date.now()
  });
  
  // Update stats
  if (!S.dhikrStats) S.dhikrStats = { total: {}, daily: {}, streak: 0, bestStreak: 0, lastSessionDate: null, badges: [], achievements: [] };
  S.dhikrStats.total[idx] = (S.dhikrStats.total[idx] || 0) + 1;
  if (!S.dhikrStats.daily[t]) S.dhikrStats.daily[t] = {};
  S.dhikrStats.daily[t][idx] = (S.dhikrStats.daily[t][idx] || 0) + 1;
  
  if (S.dhikrCounters[idx] === d.target) { toast('✨', 'Target reached! SubhanAllah!', false, 2000); }
  saveState(); renderDhikrCounter();
}
```

- [ ] **Step 3: Test session logging**

In browser console:
```javascript
tapDhikr();
console.log(S.dhikrSessions); // Should show logged session
console.log(S.dhikrStats); // Should show updated stats
```

- [ ] **Step 4: Commit**

```bash
git add state/state.js core/actions.js
git commit -m "feat: add dhikr session logging"
```

### Task 6.2: Add Dhikr Analytics Dashboard

**Files:**
- Modify: `render/render.js` (add analytics rendering)
- Modify: `styles/main.css` (add analytics styles)

**Interfaces:**
- Consumes: `S.dhikrStats`, `S.dhikrSessions`
- Produces: Dhikr analytics UI

- [ ] **Step 1: Add analytics CSS**

Add to `styles/main.css`:
```css
.dhikr-analytics {
  background: var(--card);
  border-radius: var(--radius);
  padding: 16px;
  margin-bottom: 20px;
  border: 1px solid var(--border);
}
.dhikr-stats-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}
.dhikr-stat-item {
  text-align: center;
  flex: 1;
}
.dhikr-stat-num {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--gold);
}
.dhikr-stat-label {
  font-size: 0.7rem;
  color: var(--text2);
}
```

- [ ] **Step 2: Add analytics rendering function**

In `render/render.js`, add:
```javascript
function renderDhikrAnalytics() {
  const stats = S.dhikrStats || { total: {}, daily: {}, streak: 0 };
  const totalDhikr = Object.values(stats.total).reduce((a, b) => a + b, 0);
  const todaySessions = stats.daily[today()] || {};
  const todayCount = Object.values(todaySessions).reduce((a, b) => a + b, 0);
  
  return `
    <div class="dhikr-analytics">
      <div class="section-title">📊 Dhikr Statistics</div>
      <div class="dhikr-stats-row">
        <div class="dhikr-stat-item">
          <div class="dhikr-stat-num">${totalDhikr}</div>
          <div class="dhikr-stat-label">Total Dhikr</div>
        </div>
        <div class="dhikr-stat-item">
          <div class="dhikr-stat-num">${todayCount}</div>
          <div class="dhikr-stat-label">Today</div>
        </div>
        <div class="dhikr-stat-item">
          <div class="dhikr-stat-num">${stats.streak}</div>
          <div class="dhikr-stat-label">Streak</div>
        </div>
      </div>
    </div>
  `;
}
```

- [ ] **Step 3: Update renderDhikrCounter to include analytics**

Modify `renderDhikrCounter` to prepend analytics.

- [ ] **Step 4: Test analytics render**

Navigate to Remembrance tab. Verify analytics dashboard shows.

- [ ] **Step 5: Commit**

```bash
git add render/render.js styles/main.css
git commit -m "feat: add dhikr analytics dashboard"
```

---

## Phase 7: Remembrance Feedback

### Task 7.1: Add Haptic Feedback

**Files:**
- Modify: `core/actions.js` (add vibration to tapDhikr)

**Interfaces:**
- Consumes: `S.dhikrSettings.haptic`
- Produces: Vibration on tap

- [ ] **Step 1: Add haptic to tapDhikr**

Modify `tapDhikr` in `core/actions.js`:
```javascript
function tapDhikr() {
  // ... existing code ...
  
  // Haptic feedback
  if (S.dhikrSettings?.haptic && navigator.vibrate) {
    navigator.vibrate(10); // 10ms vibration
  }
  
  // ... rest of function ...
}
```

- [ ] **Step 2: Add celebration vibration**

When target reached:
```javascript
if (S.dhikrCounters[idx] === d.target) {
  toast('✨', 'Target reached! SubhanAllah!', false, 2000);
  if (S.dhikrSettings?.haptic && navigator.vibrate) {
    navigator.vibrate([50, 50, 50]); // Triple pulse for celebration
  }
}
```

- [ ] **Step 3: Test on mobile device**

Open on mobile, tap dhikr button. Verify vibration works.

- [ ] **Step 4: Commit**

```bash
git add core/actions.js
git commit -m "feat: add haptic feedback to dhikr counter"
```

### Task 7.2: Add Visual Animations

**Files:**
- Modify: `styles/main.css` (add animation styles)
- Modify: `render/render.js` (add animation classes)

**Interfaces:**
- Consumes: None
- Produces: Pulse and ripple animations

- [ ] **Step 1: Add animation CSS**

Add to `styles/main.css`:
```css
/* Dhikr Animations */
@keyframes dhikrPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}
.dhikr-tap-btn:active {
  animation: dhikrPulse 0.2s ease;
}
@keyframes dhikrRipple {
  0% { box-shadow: 0 0 0 0 rgba(212,175,55,0.4); }
  100% { box-shadow: 0 0 0 20px rgba(212,175,55,0); }
}
.dhikr-tap-btn.tap {
  animation: dhikrRipple 0.4s ease-out;
}
@keyframes confetti {
  0% { transform: translateY(0) rotate(0deg); opacity: 1; }
  100% { transform: translateY(-100px) rotate(720deg); opacity: 0; }
}
.dhikr-confetti {
  position: absolute;
  width: 10px;
  height: 10px;
  background: var(--gold);
  border-radius: 50%;
  animation: confetti 1s ease-out forwards;
}
```

- [ ] **Step 2: Add tap animation trigger**

In `renderDhikrCounter`, add click handler to add 'tap' class temporarily:
```javascript
onclick="this.classList.add('tap'); setTimeout(() => this.classList.remove('tap'), 400); App.tapDhikr();"
```

- [ ] **Step 3: Test animations**

Click dhikr button. Verify pulse and ripple animations work.

- [ ] **Step 4: Commit**

```bash
git add styles/main.css render/render.js
git commit -m "feat: add visual animations to dhikr counter"
```

---

## Phase 8: Remembrance Customization

### Task 8.1: Add Custom Dhikr Entries

**Files:**
- Modify: `state/state.js` (add dhikrCustom)
- Modify: `render/render.js` (add custom dhikr UI)
- Modify: `core/actions.js` (add CRUD functions)

**Interfaces:**
- Consumes: `S.dhikrCustom`
- Produces: Custom dhikr management

- [ ] **Step 1: Add dhikrCustom to freshState**

Add to `freshState()`:
```javascript
dhikrCustom: [],
dhikrFavorites: [],
```

- [ ] **Step 2: Add CRUD functions**

In `core/actions.js`, add:
```javascript
function addCustomDhikr(arabic, roman, english, target) {
  if (!S.dhikrCustom) S.dhikrCustom = [];
  S.dhikrCustom.push({
    id: 'custom_' + Date.now(),
    arabic,
    transliteration: roman,
    english,
    target: target || 33,
    color: '#D4AF37'
  });
  saveState();
  renderDhikrCounter();
}

function removeCustomDhikr(id) {
  if (!S.dhikrCustom) return;
  S.dhikrCustom = S.dhikrCustom.filter(d => d.id !== id);
  saveState();
  renderDhikrCounter();
}

function toggleDhikrFavorite(id) {
  if (!S.dhikrFavorites) S.dhikrFavorites = [];
  const idx = S.dhikrFavorites.indexOf(id);
  if (idx === -1) {
    S.dhikrFavorites.push(id);
  } else {
    S.dhikrFavorites.splice(idx, 1);
  }
  saveState();
}
```

- [ ] **Step 3: Export functions**

Add to App export:
```javascript
addCustomDhikr, removeCustomDhikr, toggleDhikrFavorite,
```

- [ ] **Step 4: Test CRUD operations**

In browser console:
```javascript
addCustomDhikr('بِسْمِ ٱللَّهِ', 'Bismillah', 'In the name of Allah', 3);
console.log(S.dhikrCustom);
removeCustomDhikr(S.dhikrCustom[0].id);
```

- [ ] **Step 5: Commit**

```bash
git add state/state.js core/actions.js
git commit -m "feat: add custom dhikr CRUD operations"
```

---

## Phase 9: Remembrance Gamification

### Task 9.1: Add Dhikr Streak Tracking

**Files:**
- Modify: `core/actions.js` (add streak logic)

**Interfaces:**
- Consumes: `S.dhikrStats`, `S.log`
- Produces: Daily dhikr streak

- [ ] **Step 1: Add streak calculation**

In `core/actions.js`, add:
```javascript
function updateDhikrStreak() {
  const t = today();
  if (!S.dhikrStats) S.dhikrStats = { total: {}, daily: {}, streak: 0, bestStreak: 0, lastSessionDate: null, badges: [], achievements: [] };
  
  const todaySessions = S.dhikrStats.daily[t] || {};
  const hasDhikrToday = Object.keys(todaySessions).length > 0;
  
  if (hasDhikrToday) {
    if (S.dhikrStats.lastSessionDate === t) return; // Already counted today
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.getFullYear() + '-' + (yesterday.getMonth()+1).toString().padStart(2,'0') + '-' + yesterday.getDate().toString().padStart(2,'0');
    
    if (S.dhikrStats.lastSessionDate === yesterdayStr) {
      // Continuing streak
      S.dhikrStats.streak++;
    } else {
      // Streak broken or first time
      S.dhikrStats.streak = 1;
    }
    
    S.dhikrStats.lastSessionDate = t;
    
    // Update best streak
    if (S.dhikrStats.streak > S.dhikrStats.bestStreak) {
      S.dhikrStats.bestStreak = S.dhikrStats.streak;
    }
    
    saveState();
  }
}
```

- [ ] **Step 2: Call updateDhikrStreak in tapDhikr**

Add `updateDhikrStreak();` call at the end of `tapDhikr`.

- [ ] **Step 3: Test streak tracking**

In browser console:
```javascript
updateDhikrStreak();
console.log(S.dhikrStats.streak);
```

- [ ] **Step 4: Commit**

```bash
git add core/actions.js
git commit -m "feat: add dhikr streak tracking"
```

### Task 9.2: Add Badges and Achievements

**Files:**
- Modify: `core/actions.js` (add badge checking)
- Modify: `data/achievements.js` (add dhikr badges)

**Interfaces:**
- Consumes: `S.dhikrStats`
- Produces: Badge/achievement unlocking

- [ ] **Step 1: Add dhikr badges to achievements data**

Open `data/achievements.js` and add:
```javascript
const DHIKR_BADGES = [
  { id: 'dhikr_first', name: 'First Step', icon: '🌱', desc: 'Complete first dhikr session', check: (s) => (s.dhikrStats?.streak || 0) >= 1 },
  { id: 'dhikr_week', name: 'Week Warrior', icon: '🔥', desc: '7-day dhikr streak', check: (s) => (s.dhikrStats?.streak || 0) >= 7 },
  { id: 'dhikr_month', name: 'Month Master', icon: '⭐', desc: '30-day dhikr streak', check: (s) => (s.dhikrStats?.streak || 0) >= 30 },
  { id: 'dhikr_100', name: 'Dhikr Novice', icon: '📿', desc: '100 total dhikr', check: (s) => Object.values(s.dhikrStats?.total || {}).reduce((a,b) => a+b, 0) >= 100 },
  { id: 'dhikr_1000', name: 'Dhikr Adept', icon: '🕌', desc: '1,000 total dhikr', check: (s) => Object.values(s.dhikrStats?.total || {}).reduce((a,b) => a+b, 0) >= 1000 },
];
```

- [ ] **Step 2: Add badge checking function**

In `core/actions.js`, add:
```javascript
function checkDhikrBadges() {
  if (!S.dhikrStats) return;
  const badges = S.dhikrStats.badges || [];
  
  DHIKR_BADGES.forEach(badge => {
    if (!badges.includes(badge.id) && badge.check(S)) {
      badges.push(badge.id);
      toast('🏆', `Badge unlocked: ${badge.name}!`);
      S.xp += 25; // Badge XP reward
      saveState();
    }
  });
  
  S.dhikrStats.badges = badges;
}
```

- [ ] **Step 3: Call checkDhikrBadges in tapDhikr**

Add `checkDhikrBadges();` call after `updateDhikrStreak()`.

- [ ] **Step 4: Test badge unlocking**

In browser console:
```javascript
// Simulate enough dhikr for first badge
S.dhikrStats.streak = 1;
checkDhikrBadges();
console.log(S.dhikrStats.badges); // Should include 'dhikr_first'
```

- [ ] **Step 5: Commit**

```bash
git add core/actions.js data/achievements.js
git commit -m "feat: add dhikr badges and achievements"
```

---

## Summary

| Phase | Tasks | Commits | Features |
|-------|-------|---------|----------|
| 1 | 3 | 3 | Challenges removal |
| 2 | 3 | 3 | Journey visual improvements |
| 3 | 2 | 2 | Journey analytics |
| 4 | 2 | 2 | Journey integration |
| 5 | 2 | 2 | New journey features |
| 6 | 2 | 2 | Remembrance tracking |
| 7 | 2 | 2 | Remembrance feedback |
| 8 | 1 | 1 | Remembrance customization |
| 9 | 2 | 2 | Remembrance gamification |
| **Total** | **19** | **19** | **Complete overhaul** |

---

*End of Implementation Plan*
