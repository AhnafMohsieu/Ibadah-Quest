# Profile Tab Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Profile tab with gold theme, identity customization, and polished sub-tabs.

**Approach:** Incremental visual polish per sub-tab. Each task is a standalone commit. One commit per sub-tab.

**Tech Stack:** Vanilla JS, Chart.js (existing), no new dependencies.

## Global Constraints

- Gold theme: `--gold: #D4AF37`, `--gold-light: #F5E6A3`
- Card style: `background: var(--card2)`, `border: 1px solid var(--gold)`, `border-radius: var(--radius)`
- Hover: `translateY(-2px)`, gold border pulse
- One commit per sub-tab
- No new CDN dependencies

---

## Task 1: Profile Sub-tab — Identity Card + Avatar Picker

**Files:**
- Modify: `state/state.js:6-28` (add `S.avatar`, `S.joinDate` to `freshState()`)
- Modify: `render/render.js:1206-1220` (rewrite `renderProfile()`)
- Modify: `styles/main.css` (add avatar picker, identity card styles)
- Modify: `core/actions.js` (add `selectAvatar()` handler)

**Interfaces:**
- Consumes: `S.avatar`, `S.joinDate`, `S.lv`, `S.xp`, `S.tp`, `S.cs`, `S.ua`, `currentUser`, `lvTitle()`
- Produces: `selectAvatar(emoji)` function, new CSS classes `.profile-identity`, `.avatar-picker`, `.avatar-grid`, `.avatar-option`

- [ ] **Step 1: Add `S.avatar` and `S.joinDate` to freshState()**

In `state/state.js`, add `avatar:'👳'` and `joinDate:null` to the return object of `freshState()`.

```javascript
function freshState() {
  const t = today();
  return {
    log:{[t]:{p:{},d:{},v:{}}}, tp:0, td:{}, vc:{}, tj:0, pd:0, cs:0, bs:0, lad:t,
    xp:0, lv:1, ua:{}, ur:{}, sd:false, ab:null, tq:0, dq:[], qd:t, sfu:false,
    // ... existing fields ...
    quranAudioReciter:7,
    avatar:'👳', joinDate:null
  };
}
```

- [ ] **Step 2: Add `selectAvatar()` handler to core/actions.js**

Add near the other App functions (around line 93):

```javascript
function selectAvatar(emoji) {
  S.avatar = emoji;
  saveState();
  renderProfile();
}
```

And add to `window.App`:

```javascript
App.selectAvatar = selectAvatar;
```

- [ ] **Step 3: Rewrite renderProfile() in render/render.js**

Replace the entire `renderProfile()` function (lines 1206-1220) with:

```javascript
function renderProfile() {
  const achCnt = Object.keys(S.ua).length;
  const avatar = S.avatar || '👳';
  const joinDate = S.joinDate ? new Date(S.joinDate).toLocaleDateString('en', { month: 'long', year: 'numeric' }) : null;

  let h = '<div class="section-title">👤 Profile</div>';

  // Identity card
  h += `<div class="profile-identity">
    <div class="profile-avatar-wrap" onclick="App.toggleAvatarPicker()">
      <span class="profile-avatar">${avatar}</span>
      <span class="profile-avatar-edit">✏️</span>
    </div>
    <div class="profile-info">
      <h2 class="profile-name">${currentUser === 'default' ? 'Guest' : currentUser}</h2>
      <div class="profile-level">Level ${S.lv} · ${lvTitle(S.lv)}</div>
      ${joinDate ? `<div class="profile-join">Member since ${joinDate}</div>` : ''}
    </div>
  </div>`;

  // Avatar picker (hidden by default)
  const emojis = ['👳','🕋','🕌','📿','⭐','🕊️','📖','🌙','🕌','🤲','📕','🧎','🕌','📿','⭐','🕊️','📖','🌙','🤲','📕','🧎','🕌','📿','⭐'];
  h += `<div class="avatar-picker" id="avatarPicker" style="display:none;">
    <div class="avatar-grid">
      ${emojis.map(e => `<div class="avatar-option${e === avatar ? ' selected' : ''}" onclick="App.selectAvatar('${e}')">${e}</div>`).join('')}
    </div>
  </div>`;

  // Stats row (4 cards)
  h += '<div class="profile-stats">';
  h += `<div class="stat-card"><div class="stat-icon">⭐</div><div class="stat-num">${S.xp}</div><div class="stat-label">Total XP</div></div>`;
  h += `<div class="stat-card"><div class="stat-icon">🕌</div><div class="stat-num">${S.tp}</div><div class="stat-label">Prayers</div></div>`;
  h += `<div class="stat-card"><div class="stat-icon">🔥</div><div class="stat-num">${S.cs}</div><div class="stat-label">Streak</div></div>`;
  h += `<div class="stat-card"><div class="stat-icon">🏆</div><div class="stat-num">${achCnt}</div><div class="stat-label">Achievements</div></div>`;
  h += '</div>';

  // Settings
  h += '<div class="section-title">⚙️ Settings</div>';
  h += '<div class="profile-settings">';
  h += '<div style="display:flex;gap:8px;margin-bottom:10px;"><input class="profile-input" id="usernameInput" placeholder="Switch user" style="margin-bottom:0;"><button class="shop-card" onclick="App.switchUser()" style="padding:10px 14px;border-radius:var(--radius-sm);">💾</button></div>';
  h += '<button class="shop-card" style="width:100%;justify-content:center;margin-bottom:10px;" onclick="App.logout()">🔓 Logout</button>';
  h += '</div>';

  // Danger zone
  h += '<div class="danger-zone"><h3 style="color:var(--red)">⚠️ Danger Zone</h3><p style="font-size:0.8rem;color:var(--text2);margin-bottom:10px;">Reset permanently deletes all your progress.</p><button class="danger-btn" onclick="App.resetAll()">🔄 Reset All Data</button></div>';

  document.getElementById('profileArea').innerHTML = h;
}
```

- [ ] **Step 4: Add toggleAvatarPicker() to core/actions.js**

```javascript
function toggleAvatarPicker() {
  const picker = document.getElementById('avatarPicker');
  if (picker) picker.style.display = picker.style.display === 'none' ? 'block' : 'none';
}

App.toggleAvatarPicker = toggleAvatarPicker;
```

- [ ] **Step 5: Add CSS for profile identity and avatar picker to styles/main.css**

```css
/* Profile Identity Card */
.profile-identity {
  display: flex; align-items: center; gap: 16px; margin-bottom: 18px;
  background: var(--card2); padding: 20px; border-radius: var(--radius);
  border: 1px solid var(--gold); box-shadow: 0 4px 20px rgba(212,175,55,0.1);
  transition: border-color 0.3s, box-shadow 0.3s;
}
.profile-identity:hover { border-color: rgba(212,175,55,0.5); box-shadow: 0 4px 25px rgba(212,175,55,0.15); }

.profile-avatar-wrap {
  position: relative; cursor: pointer; transition: transform 0.2s;
}
.profile-avatar-wrap:hover { transform: scale(1.05); }
.profile-avatar { font-size: 3.5rem; display: block; }
.profile-avatar-edit {
  position: absolute; bottom: -2px; right: -2px; font-size: 0.9rem;
  background: var(--card); border-radius: 50%; padding: 2px 4px;
  border: 1px solid var(--gold);
}

.profile-info { flex: 1; }
.profile-name { margin: 0 0 4px; color: var(--gold-light); font-size: 1.3rem; }
.profile-level { font-size: 0.85rem; color: var(--text2); margin-bottom: 2px; }
.profile-join { font-size: 0.75rem; color: rgba(148,163,184,0.6); }

/* Avatar Picker */
.avatar-picker {
  margin-bottom: 18px; padding: 12px; background: var(--card2);
  border: 1px solid var(--border); border-radius: var(--radius);
}
.avatar-grid {
  display: grid; grid-template-columns: repeat(8, 1fr); gap: 6px;
}
.avatar-option {
  font-size: 1.5rem; text-align: center; padding: 8px; cursor: pointer;
  border-radius: 8px; border: 2px solid transparent; transition: all 0.2s;
}
.avatar-option:hover { background: rgba(212,175,55,0.1); border-color: rgba(212,175,55,0.3); }
.avatar-option.selected { border-color: var(--gold); background: rgba(212,175,55,0.15); }

/* Profile Stats Row */
.profile-stats {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 18px;
}
.profile-stats .stat-card { padding: 16px 12px; }
.profile-stats .stat-icon { font-size: 1.2rem; margin-bottom: 4px; }
.profile-stats .stat-num { font-weight: 700; color: var(--gold); font-size: 1.3rem; }
.profile-stats .stat-label { font-size: 0.7rem; color: var(--text2); margin-top: 2px; }

/* Profile Settings */
.profile-settings { margin-bottom: 16px; }
```

- [ ] **Step 6: Test in browser**

Open the app, go to Profile tab. Verify:
- Identity card shows avatar, name, level, join date
- Clicking avatar opens emoji picker grid
- Selecting an emoji updates the avatar and saves
- 4 stats cards show with icons
- Settings and Danger Zone render correctly

- [ ] **Step 7: Commit**

```bash
git add state/state.js render/render.js styles/main.css core/actions.js
git commit -m "feat(profile): redesign identity card with avatar picker and stats row"
```

---

## Task 2: Trophies Sub-tab — Gold Grid + Tier Badges

**Files:**
- Modify: `render/render.js:1149` (rewrite `renderAch()`)
- Modify: `styles/main.css` (add trophy card styles)

**Interfaces:**
- Consumes: `ACHS` array, `S.ua` (unlocked achievements map)
- Produces: Updated `.ach-card` styles, new `.ach-tier`, `.ach-progress` classes

- [ ] **Step 1: Rewrite renderAch() in render/render.js**

Replace the `renderAch()` function (line 1149) with:

```javascript
function renderAch() {
  const cnt = Object.keys(S.ua).length;
  const total = ACHS.length;
  const pct = total > 0 ? Math.round((cnt / total) * 100) : 0;

  let h = '<div class="ach-header">';
  h += `<div class="section-title">🏆 Trophy Cabinet</div>`;
  h += `<div class="ach-progress"><span class="ach-progress-bar" style="width:${pct}%"></span></div>`;
  h += `<div class="ach-progress-text">${cnt} / ${total} Unlocked</div>`;
  h += '</div>';

  h += '<div class="ach-grid">';
  h += ACHS.map(a => {
    const u = !!S.ua[a.id];
    const tierStars = a.tier === 'Legendary' ? '⭐⭐⭐' : a.tier === 'Epic' ? '⭐⭐' : '⭐';
    return `<div class="ach-card${u ? ' unlocked' : ' locked'}">
      <div class="ach-tier">${tierStars}</div>
      <div class="ach-icon">${u ? a.icon : '🔒'}</div>
      <div class="ach-name">${a.name}</div>
      <div class="ach-desc">${a.desc}</div>
    </div>`;
  }).join('');
  h += '</div>';

  if (cnt === 0) {
    h += '<div class="ach-empty">No trophies yet. Start completing deeds to earn your first!</div>';
  }

  document.getElementById('achArea').innerHTML = h;
}
```

- [ ] **Step 2: Add CSS for trophy grid and cards to styles/main.css**

```css
/* Trophy Cabinet */
.ach-header { margin-bottom: 16px; }
.ach-progress {
  height: 6px; background: rgba(255,255,255,0.08); border-radius: 3px;
  overflow: hidden; margin-bottom: 6px;
}
.ach-progress-bar {
  height: 100%; background: linear-gradient(90deg, var(--gold), var(--gold-light));
  border-radius: 3px; transition: width 0.5s ease;
}
.ach-progress-text {
  font-size: 0.8rem; color: var(--text2); text-align: center;
}

.ach-grid {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;
}
@media (min-width: 600px) { .ach-grid { grid-template-columns: repeat(3, 1fr); } }

.ach-card {
  position: relative; display: flex; flex-direction: column; align-items: center;
  text-align: center; padding: 20px 14px; gap: 8px; cursor: default;
  background: var(--card2); border: 1px solid var(--border); border-radius: var(--radius);
  transition: all 0.3s;
}
.ach-card.unlocked {
  border-color: rgba(212,175,55,0.4);
  background: rgba(212,175,55,0.05);
  box-shadow: 0 0 15px rgba(212,175,55,0.1);
}
.ach-card.unlocked:hover {
  transform: translateY(-2px); border-color: rgba(212,175,55,0.6);
  box-shadow: 0 0 20px rgba(212,175,55,0.2);
}
.ach-card.locked { opacity: 0.5; filter: grayscale(1); }

.ach-tier {
  position: absolute; top: 8px; right: 8px; font-size: 0.65rem;
  background: rgba(212,175,55,0.15); padding: 2px 6px; border-radius: 8px;
  color: var(--gold);
}
.ach-card .ach-icon { font-size: 2rem; }
.ach-name { font-weight: 600; font-size: 0.8rem; }
.ach-desc { font-size: 0.65rem; color: var(--text2); }

.ach-empty {
  text-align: center; padding: 40px 20px; color: var(--text2);
  font-size: 0.9rem; grid-column: 1 / -1;
}
```

- [ ] **Step 3: Test in browser**

Verify:
- Trophy header shows progress bar and counter
- Cards display in 2-column grid (3-column on wider screens)
- Unlocked trophies have gold border and glow
- Locked trophies are dimmed
- Tier badges show in top-right corner
- Hover lift effect works on unlocked cards
- Empty state message shows when no trophies

- [ ] **Step 4: Commit**

```bash
git add render/render.js styles/main.css
git commit -m "feat(profile): redesign trophies tab with gold grid and tier badges"
```

---

## Task 3: Progress Sub-tab — Polished Stat Cards + Calendar

**Files:**
- Modify: `render/render.js:1150-1204` (rewrite `renderProg()`)
- Modify: `styles/main.css` (update stat card and calendar styles)

**Interfaces:**
- Consumes: `S.tp`, `S.pd`, `S.bs`, `S.lv`, `S.tq`, `S.td`, `S.log`, `calViewYear`, `calViewMonth`, `calViewHijriY`, `calViewHijriM`
- Produces: Updated `.stat-card` styles, improved `.cal-day` styles

- [ ] **Step 1: Rewrite renderProg() stat cards section in render/render.js**

Replace the stat cards HTML generation (lines 1150-1151) with:

```javascript
function renderProg() {
  const stats = [
    { icon: '🕌', value: S.tp, label: 'Prayers' },
    { icon: '📅', value: S.pd, label: 'Perfect Days' },
    { icon: '🔥', value: S.bs, label: 'Best Streak' },
    { icon: '⭐', value: S.lv, label: 'Level' },
    { icon: '📋', value: S.tq || 0, label: 'Quests Done' },
    { icon: '✋', value: Object.values(S.td).reduce((a, b) => a + b, 0), label: 'Extra Deeds' }
  ];

  document.getElementById('statArea').innerHTML = `<div class="prog-stats">
    ${stats.map(s => `<div class="stat-card"><div class="stat-icon">${s.icon}</div><div class="stat-num">${s.value}</div><div class="stat-label">${s.label}</div></div>`).join('')}
  </div>`;
```

- [ ] **Step 2: Add CSS for progress stats grid to styles/main.css**

```css
/* Progress Stats */
.prog-stats {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 16px;
}
.prog-stats .stat-card {
  display: flex; flex-direction: column; align-items: center; padding: 18px 12px;
  background: var(--card2); border: 1px solid var(--border); border-radius: var(--radius);
  box-shadow: var(--shadow); transition: border-color 0.3s;
}
.prog-stats .stat-card:hover { border-color: rgba(212,175,55,0.3); }
.prog-stats .stat-icon { font-size: 1.3rem; margin-bottom: 6px; }
.prog-stats .stat-num { font-weight: 700; color: var(--gold); font-size: 1.4rem; }
.prog-stats .stat-label { font-size: 0.75rem; color: var(--text2); margin-top: 4px; }
```

- [ ] **Step 3: Update calendar styles in styles/main.css**

Add/improve these calendar styles:

```css
/* Calendar Improvements */
.cal-day.now {
  border: 2px solid var(--gold);
  box-shadow: 0 0 8px rgba(212,175,55,0.3);
}
.cal-day.good { background: rgba(16,185,129,0.2); }
.cal-day.ok { background: rgba(245,158,11,0.15); }
.cal-day.bad { background: rgba(239,68,68,0.15); }
.cal-day { transition: background 0.2s, border-color 0.2s; }

.cal-legend {
  display: flex; gap: 12px; justify-content: center; margin-top: 12px;
  flex-wrap: wrap;
}
.cal-legend-item {
  display: flex; align-items: center; gap: 4px; font-size: 0.7rem; color: var(--text2);
}
.cal-legend-dot { width: 8px; height: 8px; border-radius: 50%; }
```

- [ ] **Step 4: Test in browser**

Verify:
- Stat cards show in 2-column grid with icons
- Stat values are gold-colored and prominent
- Calendar cells have smoother color transitions
- Today cell has gold ring/highlight
- Legend displays correctly

- [ ] **Step 5: Commit**

```bash
git add render/render.js styles/main.css
git commit -m "feat(profile): polish progress tab with styled stat cards and calendar"
```

---

## Task 4: Rewards Sub-tab — XP Banner + Card Grid

**Files:**
- Modify: `render/render.js:1205` (rewrite `renderShop()`)
- Modify: `styles/main.css` (add reward card and XP banner styles)

**Interfaces:**
- Consumes: `SHOP` array, `S.ur` (unlocked rewards map), `S.xp`
- Produces: New `.reward-card`, `.reward-xp-banner`, `.reward-owned`, `.reward-disabled` classes

- [ ] **Step 1: Rewrite renderShop() in render/render.js**

Replace the `renderShop()` function (line 1205) with:

```javascript
function renderShop() {
  let h = '<div class="section-title">🎁 Rewards Shop</div>';

  // XP balance banner
  h += `<div class="reward-xp-banner">💰 <strong>${S.xp}</strong> XP Available</div>`;

  // Reward cards
  h += '<div class="reward-grid">';
  h += SHOP.map(r => {
    const owned = !!S.ur[r.id];
    const canAfford = S.xp >= r.cost;
    const cls = owned ? 'owned' : (canAfford ? '' : 'disabled');
    return `<div class="reward-card ${cls}" onclick="${owned ? '' : 'App.buy(\'' + r.id + '\')'}">
      <span class="reward-icon">${r.icon}</span>
      <div class="reward-info">
        <div class="reward-name">${r.name}</div>
        <div class="reward-desc">${r.desc || ''}</div>
      </div>
      <div class="reward-badge">${owned ? '✅ Owned' : '💎 ' + r.cost + ' XP'}</div>
    </div>`;
  }).join('');
  h += '</div>';

  document.getElementById('shopArea').innerHTML = h;
}
```

- [ ] **Step 2: Add CSS for reward cards and XP banner to styles/main.css**

```css
/* Rewards Shop */
.reward-xp-banner {
  text-align: center; padding: 14px; margin-bottom: 16px;
  background: linear-gradient(135deg, rgba(212,175,55,0.1), rgba(212,175,55,0.05));
  border: 1px solid rgba(212,175,55,0.3); border-radius: var(--radius);
  color: var(--gold); font-size: 1rem;
}
.reward-xp-banner strong { font-size: 1.2rem; }

.reward-grid {
  display: grid; grid-template-columns: 1fr; gap: 10px;
}
@media (min-width: 500px) { .reward-grid { grid-template-columns: repeat(2, 1fr); } }

.reward-card {
  display: flex; align-items: center; gap: 12px; padding: 14px;
  background: var(--card2); border: 1px solid var(--border); border-radius: var(--radius);
  cursor: pointer; transition: all 0.3s;
}
.reward-card:hover:not(.disabled):not(.owned) {
  transform: translateY(-2px); border-color: rgba(212,175,55,0.4);
  box-shadow: 0 4px 15px rgba(212,175,55,0.1);
}
.reward-card.owned {
  border-color: rgba(16,185,129,0.3); background: rgba(16,185,129,0.05);
  cursor: default;
}
.reward-card.disabled {
  opacity: 0.5; cursor: not-allowed;
}

.reward-icon { font-size: 1.8rem; }
.reward-info { flex: 1; }
.reward-name { font-weight: 600; font-size: 0.9rem; }
.reward-desc { font-size: 0.7rem; color: var(--text2); margin-top: 2px; }

.reward-badge {
  font-size: 0.75rem; padding: 4px 10px; border-radius: 12px;
  background: rgba(212,175,55,0.1); color: var(--gold); white-space: nowrap;
}
.reward-card.owned .reward-badge {
  background: rgba(16,185,129,0.15); color: #10b981;
}
```

- [ ] **Step 3: Add purchase animation to styles/main.css**

```css
/* Purchase flash animation */
@keyframes purchaseFlash {
  0% { box-shadow: 0 0 0 rgba(212,175,55,0); }
  50% { box-shadow: 0 0 20px rgba(212,175,55,0.4); }
  100% { box-shadow: 0 0 0 rgba(212,175,55,0); }
}
.reward-card.just-bought { animation: purchaseFlash 0.6s ease; }
```

- [ ] **Step 4: Add flash animation trigger in core/actions.js**

In the `buy()` function, after a successful purchase, add:

```javascript
// After successful purchase logic
setTimeout(() => {
  const cards = document.querySelectorAll('.reward-card');
  cards.forEach(c => { if (c.onclick?.toString().includes(id)) c.classList.add('just-bought'); });
}, 50);
```

- [ ] **Step 5: Test in browser**

Verify:
- XP banner shows current balance
- Reward cards display in grid layout
- Owned rewards have green border and "Owned" badge
- Unaffordable rewards are dimmed
- Hover lift works on affordable rewards
- Purchase triggers gold flash animation

- [ ] **Step 6: Commit**

```bash
git add render/render.js styles/main.css core/actions.js
git commit -m "feat(profile): redesign rewards tab with XP banner and card grid"
```

---

## Summary

| Task | Sub-tab | Commit Message |
|------|---------|----------------|
| 1 | Profile | `feat(profile): redesign identity card with avatar picker and stats row` |
| 2 | Trophies | `feat(profile): redesign trophies tab with gold grid and tier badges` |
| 3 | Progress | `feat(profile): polish progress tab with styled stat cards and calendar` |
| 4 | Rewards | `feat(profile): redesign rewards tab with XP banner and card grid` |
