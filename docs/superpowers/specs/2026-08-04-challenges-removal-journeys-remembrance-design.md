# Design Spec: Challenges Removal + Journey & Remembrance Enhancements

**Date:** 2026-08-04  
**Status:** Approved  
**Approach:** Incremental (Challenges removal, then Journey enhancements, then Remembrance enhancements)

---

## Overview

This design covers three major changes:
1. **Complete removal** of the Challenges tab and all related code
2. **Journey tab enhancements** — visual improvements, analytics, integration, and new features
3. **Remembrance tab enhancements** — tracking, feedback, customization, and gamification

---

## Part 1: Challenges Tab Removal

### Goal
Permanently remove the Challenges tab and all associated code, state, and UI elements.

### Files to Modify

| File | Change |
|------|--------|
| `data/tab-groups.js` | Remove line 8: `{ id: 'challenges', icon: '⚔️', label: 'Challenges' }` |
| `index.html` | Remove line 92: `<div class="tab-panel" id="panel-challenges">...</div>` |
| `render/render.js` | Remove `renderChallenges()` (lines ~1140-1229), `completeChallenge()` (lines ~1230-1252), all challenge data arrays (`chDaily`, `chWeekly`, `chMonthly`, `chYearly`, `chLifetime`), and the `renderDynamic` call to `renderChallenges` |
| `state/state.js` | Remove `challenges:[]` from `freshState()` (line 24) |
| `data/pools/helpers.js` | Remove line 27: Challenges search entry |
| `core/actions.js` | Remove `completeChallenge` from App export (line 2140) |

### State Cleanup
- Users may have `chd`, `chw`, `chm`, `chy`, `chl` properties in localStorage
- These become orphaned but harmless — no migration needed
- They will be ignored by the app and eventually cleared if user resets data

### Risk Assessment
- **Risk:** Minimal
- **Reason:** Challenge code is self-contained with no dependencies from other features
- **Testing:** Verify tab navigation works after removal, no console errors

---

## Part 2: Journey Tab Enhancements

### Goal
Transform the Journey tab from a basic 40-day tracker into a comprehensive habit formation system with visual improvements, analytics, integration, and new features.

### Phase 1: Visual Improvements

#### Progress Visualization
- Replace flat grid with animated circular progress ring
- Color-coded cells: green (completed), gold (today), gray (missed/pending)
- Animated fill effect when progress updates

#### Streak Tracking
- Track consecutive days within each journey
- Display current streak and best streak per journey
- Streak breaks shown with visual feedback

#### Milestone Celebrations
- Toast notifications at 10, 20, 30, 40 days
- Special animations for journey completion
- Shareable milestone cards

#### UI Enhancements
- Gradient backgrounds based on progress percentage
- "Continue" button replaces "Begin" for in-progress journeys
- Estimated completion date based on current pace
- Responsive grid for mobile optimization

### Phase 2: Analytics & Stats

#### Journey Dashboard
- Total journeys completed
- Current active journeys
- Average completion time
- Best streak across all journeys

#### Progress Charts
- Weekly/monthly progress visualization
- Journey completion timeline
- Streak history graph

#### Journey History
- Log of all completed journeys
- Start date, end date, total days taken
- Missed days count
- Final streak length

### Phase 3: Integration with Daily Log

#### Automatic Progress Tracking
- Journeys auto-detect completion from daily log entries
- No manual "mark as done" — praying Fajr auto-increments Fajr journey
- Real-time progress updates as daily log changes

#### Cross-Journey Insights
- Show which journeys are affected by each daily action
- Daily summary showing all active journey progress
- "Praying Fajr contributes to: Fajr Journey (32/40)"

#### Smart Notifications
- Remind users when close to completing a journey
- Alert when streak is about to break
- Celebration when journey milestone reached

### Phase 4: New Journey Features

#### Different Durations
| Duration | Purpose | Unlock Requirement |
|----------|---------|-------------------|
| 7-day | Starter journeys | None (available immediately) |
| 21-day | Habit formation | Complete 3 seven-day journeys |
| 40-day | Traditional | Complete 3 twenty-one-day journeys |
| 90-day | Deep transformation | Complete 3 forty-day journeys |
| 365-day | Annual journeys | Complete 3 ninety-day journeys |

#### More Habit Categories
- **Salah:** Fajr on time, all 5 prayers, Sunnah prayers, Tahajjud
- **Quran:** Daily reading, memorization, tafsir study, recitation
- **Charity:** Daily sadaqah, monthly zakat, volunteering hours
- **Knowledge:** Hadith study, Arabic learning, seerah reading
- **Character:** Patience, gratitude, honesty, kindness, humility
- **Health:** Fasting, exercise, halal diet, sleep schedule

#### Progressive Unlocking
- Complete 3 seven-day journeys → unlock 21-day journeys
- Complete 3 twenty-one-day journeys → unlock 40-day journeys
- Complete 3 forty-day journeys → unlock 90-day journeys
- Complete 3 ninety-day journeys → unlock 365-day journeys
- Special "Mastery" journeys requiring completion of all categories
- Unlocks persist even if data is reset (stored separately from journey state)

#### Social Features
- Share journey progress via copy-to-clipboard summary (text/image)
- Create journey groups (family, friends, community)
- Group challenges (everyone works toward same goal)
- Leaderboards for friendly competition (local only, no server required)
- Accountability partners (pair up for mutual reminders)

### Data Structure Changes

#### State Properties to Add
```javascript
journeyStats: {
  completed: [],           // Array of completed journey IDs
  currentStreaks: {},      // { journeyId: streakCount }
  bestStreaks: {},         // { journeyId: bestStreak }
  totalCompleted: 0,       // Total journeys completed
  unlockedTiers: ['7day'], // Available duration tiers
  groups: [],              // Social groups
  partners: []             // Accountability partners
}
```

#### New Journey Definitions
```javascript
const JOURNEYS = [
  // Existing 40-day journeys
  { id: 'fajr40', name: '40 Days of Fajr', duration: 40, ... },
  
  // New 7-day starter journeys
  { id: 'fajr7', name: '7 Days of Fajr', duration: 7, tier: '7day', ... },
  
  // New 21-day journeys
  { id: 'fajr21', name: '21 Days of Fajr', duration: 21, tier: '21day', ... },
  
  // New categories
  { id: 'charity30', name: '30 Days of Charity', duration: 30, category: 'charity', ... },
  { id: 'quran90', name: '90 Days of Quran', duration: 90, tier: '90day', ... },
];
```

---

## Part 3: Remembrance Tab Enhancements

### Goal
Transform the Remembrance tab from a simple dhikr counter into a comprehensive dhikr tracking and engagement system.

### Phase 1: Session Tracking & Analytics

#### Session Logging
- Log each dhikr session with:
  - Timestamp (start/end)
  - Dhikr type
  - Count performed
  - Duration (optional)
- Store in `S.dhikrSessions` array

#### Analytics Dashboard
- Daily/weekly/monthly session summary
- Total lifetime dhikr count per type
- Average sessions per day
- Most frequent dhikr type
- Time spent in dhikr

#### Visual Charts
- Weekly dhikr frequency chart
- Monthly progress heatmap
- Dhikr type distribution pie chart

### Phase 2: Haptic/Audio Feedback

#### Haptic Feedback
- Vibration on each tap (mobile devices)
- Different vibration patterns for milestones
- Celebration pattern for target reached

#### Audio Feedback
- Optional subtle click sound effect
- Different sounds for:
  - Regular tap
  - Target reached
  - Milestone achieved
- Volume control in settings

#### Visual Feedback
- Pulse animation on counter button
- Ripple effect on tap
- Celebration animation for target completion
- Confetti for major milestones

### Phase 3: Custom Targets & Dhikr

#### Custom Targets
- Editable target counts (not just presets)
- Save custom targets per dhikr
- Default to Sunnah targets (33x, 99x, 100x)

#### Custom Dhikr Entries
- Add custom dhikr with:
  - Arabic text
  - Transliteration
  - English translation
  - Custom target count
- Edit/delete custom dhikr entries
- Save/load custom dhikr presets
- Share custom dhikr via copy-to-clipboard

#### Favorites System
- Mark dhikr as favorites for quick access
- Favorite dhikr appear at top of list
- Quick-switch between favorite dhikr

### Phase 4: Gamification

#### Daily Streaks
- Track consecutive days with dhikr sessions
- Streak milestones: 7, 30, 90, 180, 365 days
- Visual streak counter with fire animation

#### Milestone Badges
| Badge | Requirement |
|-------|-------------|
| 🌱 First Step | Complete first dhikr session |
| 🔥 Week Warrior | 7-day dhikr streak |
| ⭐ Month Master | 30-day dhikr streak |
| 💎 Quarter Champion | 90-day dhikr streak |
| 👑 Year Legend | 365-day dhikr streak |
| 📿 Dhikr Novice | 100 total dhikr |
| 🕌 Dhikr Adept | 1,000 total dhikr |
| ✨ Dhikr Expert | 5,000 total dhikr |
| 🏆 Dhikr Master | 10,000 total dhikr |

#### XP Rewards
- +5 XP per dhikr session
- +25 XP for completing target
- +50 XP for daily streak milestones
- +100 XP for major milestones

#### Achievements
- "Consistent Worshipper" — dhikr for 7 consecutive days
- "Seeker of Light" — complete 1,000 total dhikr
- "Heart Purifier" — use all preset dhikr types
- "Custom Devotion" — create 5 custom dhikr entries

### Data Structure Changes

#### State Properties to Add
```javascript
dhikrSessions: [],           // Array of session logs
dhikrStats: {
  total: {},                 // { dhikrId: totalCount }
  daily: {},                 // { date: { dhikrId: count } }
  streak: 0,                 // Current dhikr streak
  bestStreak: 0,             // Best dhikr streak
  lastSessionDate: null,     // Last date with dhikr session
  badges: [],                // Array of earned badge IDs
  achievements: []           // Array of earned achievement IDs
},
dhikrCustom: [],             // Custom dhikr entries
dhikrFavorites: [],          // Favorite dhikr IDs
dhikrSettings: {
  haptic: true,              // Vibration enabled
  audio: false,              // Sound effects enabled
  volume: 0.5                // Audio volume
}
```

---

## Implementation Order

1. **Phase 1: Challenges Removal** (1 commit)
   - Remove all challenge-related code
   - Test navigation and verify no errors

2. **Phase 2: Journey Visual Improvements** (1-2 commits)
   - Add circular progress rings
   - Add streak tracking
   - Add milestone celebrations
   - Enhance UI styling

3. **Phase 3: Journey Analytics** (1 commit)
   - Add journey dashboard
   - Add progress charts
   - Add journey history

4. **Phase 4: Journey Integration** (1 commit)
   - Connect journeys to daily log
   - Add cross-journey insights
   - Add smart notifications

5. **Phase 5: Journey New Features** (2-3 commits)
   - Add different durations
   - Add new categories
   - Add progressive unlocking
   - Add social features

6. **Phase 6: Remembrance Tracking** (1 commit)
   - Add session logging
   - Add analytics dashboard
   - Add visual charts

7. **Phase 7: Remembrance Feedback** (1 commit)
   - Add haptic feedback
   - Add audio feedback
   - Add visual animations

8. **Phase 8: Remembrance Customization** (1 commit)
   - Add custom targets
   - Add custom dhikr entries
   - Add favorites system

9. **Phase 9: Remembrance Gamification** (1 commit)
   - Add daily streaks
   - Add milestone badges
   - Add XP rewards
   - Add achievements

---

## Testing Strategy

### Challenges Removal
- Verify tab navigation works
- Verify no console errors
- Verify search still works
- Verify state loads correctly

### Journey Enhancements
- Test progress tracking with mock data
- Test streak calculations
- Test milestone celebrations
- Test analytics accuracy
- Test social features (sharing, groups)
- Test progressive unlocking logic

### Remembrance Enhancements
- Test session logging
- Test haptic feedback on mobile
- Test audio feedback
- Test custom dhikr CRUD
- Test streak tracking
- Test badge/achievement unlocking

---

## Success Metrics

### Challenges Removal
- ✅ Zero console errors after removal
- ✅ All tabs function correctly
- ✅ Search works without Challenges entry

### Journey Enhancements
- ✅ Users can track multiple journey durations
- ✅ Progress auto-updates from daily log
- ✅ Streaks calculate correctly
- ✅ Milestones trigger celebrations
- ✅ Analytics show accurate data
- ✅ Social features enable sharing

### Remembrance Enhancements
- ✅ Sessions log accurately
- ✅ Haptic feedback works on mobile
- ✅ Custom dhikr can be created/edited
- ✅ Streaks track consecutive days
- ✅ Badges unlock at correct thresholds
- ✅ XP awards correctly

---

## Appendix: File Changes Summary

| File | Action | Lines Affected |
|------|--------|----------------|
| `data/tab-groups.js` | Remove challenges entry | Line 8 |
| `index.html` | Remove challenges panel | Line 92 |
| `render/render.js` | Remove challenges code | Lines 1140-1252 |
| `state/state.js` | Remove challenges state | Line 24 |
| `data/pools/helpers.js` | Remove challenges search | Line 27 |
| `core/actions.js` | Remove completeChallenge | Line 2140 |
| `data/journeys.js` | Expand journey definitions | Full rewrite |
| `features/journeys.js` | Add new journey features | Major expansion |
| `data/pools/dhikr.js` | Add custom dhikr support | Expansion |
| `render/render.js` | Add journey/remembrance features | Major additions |
| `core/actions.js` | Add new action handlers | Expansion |
| `state/state.js` | Add new state properties | Expansion |
| `styles/main.css` | Add new styles | Expansion |

---

*End of Design Spec*
