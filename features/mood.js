(function() {
  function getTodayMood() {
    const t = today();
    if (!S.moodLog) S.moodLog = {};
    if (!S.moodLog[t]) S.moodLog[t] = { mood: null, reflections: {}, gratitude: [] };
    return S.moodLog[t];
  }

  function logMood(moodId) {
    const m = getTodayMood();
    m.mood = moodId;
    const emoji = MOOD_EMOJIS.find(e => e.id === moodId);
    if (emoji) { S.xp += emoji.xp; S.lv = lvFrom(S.xp); }
    saveState();
    renderMoodTab();
  }

  function logReflection(type, text) {
    const m = getTodayMood();
    m.reflections[type] = text;
    S.xp += 3;
    S.lv = lvFrom(S.xp);
    saveState();
    renderMoodTab();
  }

  function logGratitude(text) {
    const m = getTodayMood();
    if (!m.gratitude) m.gratitude = [];
    m.gratitude.push({ text, time: today() });
    S.xp += 5;
    S.lv = lvFrom(S.xp);
    saveState();
    renderMoodTab();
  }

  function removeGratitude(idx) {
    const m = getTodayMood();
    if (m.gratitude && m.gratitude[idx]) {
      m.gratitude.splice(idx, 1);
      saveState();
      renderMoodTab();
    }
  }

  function getMoodStreak() {
    let streak = 0;
    const d = new Date();
    while (true) {
      const t = today(d);
      if (S.moodLog && S.moodLog[t] && S.moodLog[t].mood) {
        streak++;
        d.setDate(d.getDate() - 1);
      } else break;
    }
    return streak;
  }

  function renderMoodTab() {
    const el = document.getElementById('moodArea');
    if (!el) return;
    const m = getTodayMood();
    const streak = getMoodStreak();

    let h = `<div class="section-title">${iqIcon('cloud-sun')} Mood & Reflection</div>`;

    h += '<div class="mood-streak">';
    h += `<div class="mood-streak-num">${streak}</div>`;
    h += '<div class="mood-streak-label">Day Streak</div>';
    h += '</div>';

    h += '<div class="mood-select">';
    h += '<div class="mood-select-label">How are you feeling?</div>';
    h += '<div class="mood-options">';
    MOOD_EMOJIS.forEach(e => {
      const active = m.mood === e.id ? ' active' : '';
      h += `<div class="mood-btn${active}" onclick="moodTracker.logMood('${e.id}')">${iqIcon(e.icon || e.id)}<div class="mood-btn-label">${e.label}</div></div>`;
    });
    h += '</div></div>';

    h += `<div class="section-title" style="margin-top:16px">${iqIcon('pencil')} Reflections</div>`;
    h += '<div class="reflection-grid">';
    REFLECTION_PROMPTS.forEach(r => {
      const val = m.reflections[r.id] || '';
      h += `<div class="reflection-card">
        <div class="reflection-header">${iqIcon(r.icon || r.label)} ${r.label}</div>
        <div class="reflection-desc">${r.desc}</div>
        <textarea class="reflection-input" placeholder="Write here..." onchange="moodTracker.logReflection('${r.id}',this.value)">${val}</textarea>
      </div>`;
    });
    h += '</div>';

    h += `<div class="section-title" style="margin-top:16px">${iqIcon('hand-heart')} Gratitude Journal</div>`;
    h += '<div class="gratitude-list">';
    if (m.gratitude && m.gratitude.length > 0) {
      m.gratitude.forEach((g, i) => {
        h += `<div class="gratitude-item"><span>${g.text}</span><span class="gratitude-remove" onclick="moodTracker.removeGratitude(${i})">×</span></div>`;
      });
    } else {
      h += '<div class="gratitude-empty">No entries yet. Add one below!</div>';
    }
    h += '</div>';
    h += '<div class="gratitude-add">';
    h += '<textarea id="gratitudeInput" class="gratitude-textarea" placeholder="I am grateful for..."></textarea>';
    h += '<button class="gratitude-btn" onclick="moodTracker.addGratitude()">Add</button>';
    h += '</div>';

    el.innerHTML = h;
  }

  window.moodTracker = { logMood, logReflection, logGratitude, removeGratitude, renderMoodTab };
  window.renderMoodTab = renderMoodTab;
})();
