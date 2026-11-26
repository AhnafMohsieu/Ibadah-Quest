(function() {
  function safeText(value) {
    return window.escapeHTML(value);
  }
  function addPersonalGoal(type, target, deadline) {
    if (!S.personalGoals) S.personalGoals = [];
    const safeType = typeof type === 'string' && type.trim() ? type.trim().slice(0, 50) : 'Custom';
    const safeTarget = Math.max(1, Math.min(365, Math.floor(Number(target) || 10)));
    const safeDeadline = /^\d{4}-\d{2}-\d{2}$/.test(String(deadline)) && !Number.isNaN(new Date(String(deadline) + 'T00:00:00').getTime())
      ? String(deadline)
      : today(new Date(Date.now() + 30 * 86400000));
    const goal = {
      id: 'g' + Date.now(),
      type: safeType,
      target: safeTarget,
      current: 0,
      deadline: safeDeadline,
      xpReward: Math.min(safeTarget * 10, 500),
      completed: false
    };
    S.personalGoals.push(goal);
    saveState();
    renderPersonalGoals();
  }
  
  function updateGoalProgress(goalId) {
    if (!Array.isArray(S.personalGoals)) return;
    const goal = S.personalGoals.find(g => g && g.id === goalId);
    if (!goal || goal.completed) return;

    const target = Math.max(1, Math.min(365, Math.floor(Number(goal.target) || 1)));
    const current = Math.max(0, Math.floor(Number(goal.current) || 0));
    const reward = Math.max(0, Math.min(500, Math.floor(Number(goal.xpReward) || 0)));
    goal.target = target;
    goal.current = Math.min(target, current + 1);

    if (goal.current >= goal.target) {
      goal.completed = true;
      const healedBase = Math.max(0, Number(S.xp) || 0);
      applyXpDelta(healedBase - Number(S.xp) + reward, { skipLevelToast: true });
      toast(iqIcon('target'), `Goal Complete! +${reward} XP!`, true);
    }
    
    saveState();
    renderPersonalGoals();
  }
  
  function deletePersonalGoal(goalId) {
    S.personalGoals = S.personalGoals.filter(g => g.id !== goalId);
    saveState();
    renderPersonalGoals();
  }
  
  function _pgT(s) { return (typeof window !== 'undefined' && typeof window.t === 'function') ? window.t(s) : s; }
  function _pgN(v) { return (typeof window !== 'undefined' && typeof window.iqFormatNum === 'function') ? window.iqFormatNum(v) : String(v); }

  function renderPersonalGoals() {
    const el = document.getElementById('goalsArea');
    if (!el) return;
    
    const goals = S.personalGoals || [];
    let h = `<div class="section-title">${iqIcon('target')} ${safeText(_pgT('My Goals'))}</div>`;
    
    if (goals.length === 0) {
      h += `<div class="empty-state">${safeText(_pgT('No goals yet. Create one to start tracking!'))}</div>`;
    } else {
      for (const g of goals) {
        if (!g || typeof g !== 'object') continue;
        const current = Math.max(0, Math.floor(Number(g.current) || 0));
        const target = Math.max(1, Math.floor(Number(g.target) || 1));
        const progress = Math.min(100, Math.round((current / target) * 100));
        const daysLeft = Math.max(0, Math.ceil((new Date(g.deadline) - new Date()) / 86400000));
        h += `<div class="goal-card ${g.completed ? 'completed' : ''}">
          <div class="goal-header">
          <span class="goal-type">${safeText(_pgT(g.type))}</span>
            <span class="goal-deadline iq-tabular">${_pgN(daysLeft)} ${safeText(_pgT('days left'))}</span>
          </div>
          <div class="goal-progress">
            <div class="goal-bar" style="width:${progress}%"></div>
          </div>
          <div class="goal-stats iq-tabular">${_pgN(current)}/${_pgN(target)}</div>
          ${!g.completed ? `<button type="button" class="iq-pill-btn goal-btn" style="min-height:44px;min-width:44px;padding:6px 14px;" data-goal-id="${safeText(g.id)}"><bdi dir="ltr">+1</bdi></button>` : `<span class="goal-done">&#10003; ${safeText(_pgT('Complete'))}</span>`}
        </div>`;
      }
    }
    
    h += `<button type="button" class="iq-pill-btn add-goal-btn" style="width:100%;" onclick="showAddGoalModal()">+ ${safeText(_pgT('Add Goal'))}</button>`;
    el.innerHTML = h;
    el.querySelectorAll('.goal-btn[data-goal-id]').forEach(btn => {
      btn.addEventListener('click', () => updateGoalProgress(btn.dataset.goalId));
    });
  }
  
  function showAddGoalModal() {
    const html = `<div class="toast-box iq-modal-card" role="dialog" aria-modal="true" style="max-width:420px;width:92%;text-align:start;">
      <h3 style="margin-bottom:10px;">${iqIcon('target')} ${safeText(_pgT('Add Goal'))}</h3>
      <div class="form-group" style="margin-bottom:10px;">
        <label for="goalType" style="display:block;font-size:0.82rem;color:var(--text2);margin-bottom:4px;">${safeText(_pgT('Type'))}</label>
        <select id="goalType" class="profile-input" style="margin-bottom:0;">
          <option value="Quran Reading">${safeText(_pgT('Quran Reading'))}</option>
          <option value="Dhikr">${safeText(_pgT('Dhikr'))}</option>
          <option value="Charity">${safeText(_pgT('Charity'))}</option>
          <option value="Fasting">${safeText(_pgT('Fasting'))}</option>
          <option value="Prayer">${safeText(_pgT('Prayer'))}</option>
          <option value="Custom">${safeText(_pgT('Custom'))}</option>
        </select>
      </div>
      <div class="form-group" style="margin-bottom:10px;">
        <label for="goalTarget" style="display:block;font-size:0.82rem;color:var(--text2);margin-bottom:4px;">${safeText(_pgT('Target (times)'))}</label>
        <input type="number" id="goalTarget" class="profile-input" style="margin-bottom:0;" min="1" max="365" value="10" />
      </div>
      <div class="form-group" style="margin-bottom:14px;">
        <label for="goalDeadline" style="display:block;font-size:0.82rem;color:var(--text2);margin-bottom:4px;">${safeText(_pgT('Deadline'))}</label>
        <input type="date" id="goalDeadline" class="profile-input" style="margin-bottom:0;" value="${today(new Date(Date.now()+30*86400000))}" />
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap;">
        <button type="button" class="iq-btn-secondary" style="flex:1;" onclick="window.closeToastOverlay && window.closeToastOverlay();">${safeText(_pgT('Cancel'))}</button>
        <button type="button" class="iq-pill-btn" style="flex:1;" onclick="addPersonalGoal(document.getElementById('goalType').value, parseInt(document.getElementById('goalTarget').value)||10, document.getElementById('goalDeadline').value);window.closeToastOverlay && window.closeToastOverlay();">${safeText(_pgT('Add Goal'))}</button>
      </div>
    </div>`;
    if (typeof window.openToastModal === 'function') {
      window.openToastModal(html);
    } else {
      const ov = document.getElementById('toastOverlay');
      if (!ov) return;
      ov.innerHTML = html;
      ov.style.display = 'flex';
      ov.classList.add('show');
      ov.style.pointerEvents = 'auto';
    }
  }

  window.addPersonalGoal = addPersonalGoal;
  window.updateGoalProgress = updateGoalProgress;
  window.deletePersonalGoal = deletePersonalGoal;
  window.renderPersonalGoals = renderPersonalGoals;
  window.showAddGoalModal = showAddGoalModal;
})();
