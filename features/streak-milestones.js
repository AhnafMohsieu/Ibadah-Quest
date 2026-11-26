(function() {
  const MILESTONES = [
    { days:7, xp:200, badge:'🔥', label:'7-Day Warrior' },
    { days:14, xp:400, badge:'⭐', label:'2-Week Champion' },
    { days:30, xp:1000, badge:'🏆', label:'Monthly Master' },
    { days:60, xp:2000, badge:'💎', label:'Diamond Devotee' },
    { days:100, xp:5000, badge:'👑', label:'Century King' },
    { days:200, xp:10000, badge:'🌙', label:'Lunar Legend' },
    { days:365, xp:25000, badge:'☪️', label:'Annual Elite' }
  ];

  function _smT(s) { return (typeof window !== 'undefined' && typeof window.t === 'function') ? window.t(s) : s; }
  function _smN(v) { return (typeof window !== 'undefined' && typeof window.iqFormatNum === 'function') ? window.iqFormatNum(v) : String(v); }

  function checkMilestones() {
    if (!S.milestones) S.milestones = [];
    const streak = Math.max(S.cs || 0, S.bs || 0);
    let newMilestone = false;
    for (const m of MILESTONES) {
      if (streak >= m.days && !S.milestones.includes(m.days)) {
        S.milestones.push(m.days);
        applyXpDelta(m.xp, { skipLevelToast: true });
        toast(m.badge, `${_smT('Milestone Unlocked')}: ${_smT(m.label)}<br><bdi dir="ltr">+${_smN(m.xp)} XP!</bdi>`, true, 4000);
        newMilestone = true;
      }
    }
    if (newMilestone) saveState();
  }

  function showWeeklySummary(onDone) {
    const today = new Date();
    const dayOfWeek = today.getDay();
    if (dayOfWeek !== 0) {
      if (typeof onDone === 'function') onDone();
      return;
    }
    const t = getTodayKey();
    if (S.lastWeeklySummary === t) {
      if (typeof onDone === 'function') onDone();
      return;
    }
    S.lastWeeklySummary = t;
    saveState();

    const prayers = S.tp || 0;
    const perfectDays = S.pd || 0;
    const streak = S.cs || 0;
    const xpEarned = S.questXP ? (S.questXP.weekly || 0) : 0;
    const quotes = [
      'The best of deeds are those done consistently, even if small.',
      'Indeed, Allah does not allow to be lost the reward of those who do good.',
      'Take advantage of five before five: your youth, health, wealth, free time, and life.',
      'The world is a prison for the believer and a paradise for the disbeliever.'
    ];
    const quote = quotes[Math.floor(Math.random() * quotes.length)];

    window._iqModalDone = typeof onDone === 'function' ? onDone : null;

    const ov = openToastModal(`<div class="weekly-summary" role="dialog" aria-modal="true">
      <div class="ws-title">${typeof iqIcon === 'function' ? iqIcon('bar-chart-3') : '📊'} ${_smT('Weekly Summary')}</div>
      <div class="ws-grid">
        <div class="ws-stat"><div class="ws-val iq-tabular">${_smN(prayers)}</div><div class="ws-label">${_smT('Prayers')}</div></div>
        <div class="ws-stat"><div class="ws-val iq-tabular">${_smN(perfectDays)}</div><div class="ws-label">${_smT('Perfect Days')}</div></div>
        <div class="ws-stat"><div class="ws-val iq-tabular">${_smN(streak)}</div><div class="ws-label">${_smT('Streak')}</div></div>
        <div class="ws-stat"><div class="ws-val iq-tabular">${_smN(xpEarned)}</div><div class="ws-label">${_smT('XP Earned')}</div></div>
      </div>
      <div class="ws-quote">"${quote}"</div>
      <button type="button" class="ws-close" style="min-height:44px;" onclick="closeToastOverlay()">${_smT('Jazak Allahu Khairan')}</button>
    </div>`);
    if (!ov) {
      window._iqModalDone = null;
      if (typeof onDone === 'function') onDone();
    }
  }

  window.checkMilestones = checkMilestones;
  window.showWeeklySummary = showWeeklySummary;
})();
