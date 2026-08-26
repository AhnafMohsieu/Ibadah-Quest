(function() {
  function safeText(value) {
    return typeof window.escapeHTML === 'function' ? window.escapeHTML(value) : String(value == null ? '' : value).replace(/[&<>\"']/g, function(ch) { return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[ch]; });
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
  
  function renderPersonalGoals() {
    const el = document.getElementById('goalsArea');
    if (!el) return;
    
    const goals = S.personalGoals || [];
    let h = '<div class="section-title">My Goals</div>';
    
    if (goals.length === 0) {
      h += '<div class="empty-state">No goals yet. Create one to start tracking!</div>';
    } else {
      for (const g of goals) {
        if (!g || typeof g !== 'object') continue;
        const current = Math.max(0, Math.floor(Number(g.current) || 0));
        const target = Math.max(1, Math.floor(Number(g.target) || 1));
        const progress = Math.min(100, Math.round((current / target) * 100));
        const daysLeft = Math.max(0, Math.ceil((new Date(g.deadline) - new Date()) / 86400000));
        h += `<div class="goal-card ${g.completed ? 'completed' : ''}">
          <div class="goal-header">
          <span class="goal-type">${safeText(g.type)}</span>
            <span class="goal-deadline">${daysLeft} days left</span>
          </div>
          <div class="goal-progress">
            <div class="goal-bar" style="width:${progress}%"></div>
          </div>
          <div class="goal-stats">${current}/${target}</div>
          ${!g.completed ? `<button type="button" class="goal-btn" data-goal-id="${safeText(g.id)}">+1</button>` : '<span class="goal-done">✓ Complete</span>'}
        </div>`;
      }
    }
    
    h += `<button class="add-goal-btn" onclick="showAddGoalModal()">+ Add Goal</button>`;
    el.innerHTML = h;
    el.querySelectorAll('.goal-btn[data-goal-id]').forEach(btn => {
      btn.addEventListener('click', () => updateGoalProgress(btn.dataset.goalId));
    });
  }
  
  function showAddGoalModal() {
    const ov = document.getElementById('toastOverlay');
    if (!ov) return;
    ov.innerHTML = `<div class="modal-box">
      <h3>${iqIcon('target')} Add Goal</h3>
      <div class="form-group">
        <label for="goalType">Type</label>
        <select id="goalType">
          <option value="Quran Reading">Quran Reading</option>
          <option value="Dhikr">Dhikr</option>
          <option value="Charity">Charity</option>
          <option value="Fasting">Fasting</option>
          <option value="Prayer">Prayer</option>
          <option value="Custom">Custom</option>
        </select>
      </div>
      <div class="form-group">
        <label for="goalTarget">Target (times)</label>
        <input type="number" id="goalTarget" min="1" max="365" value="10" />
      </div>
      <div class="form-group">
        <label for="goalDeadline">Deadline</label>
        <input type="date" id="goalDeadline" value="${today(new Date(Date.now()+30*86400000))}" />
      </div>
      <button class="dr-close" onclick="addPersonalGoal(document.getElementById('goalType').value, parseInt(document.getElementById('goalTarget').value)||10, document.getElementById('goalDeadline').value);closeToastOverlay();">Add</button>
    </div>`;
    ov.style.display = 'flex';
    ov.classList.add('show');
    ov.style.pointerEvents = 'auto';
  }

  window.addPersonalGoal = addPersonalGoal;
  window.updateGoalProgress = updateGoalProgress;
  window.deletePersonalGoal = deletePersonalGoal;
  window.renderPersonalGoals = renderPersonalGoals;
  window.showAddGoalModal = showAddGoalModal;
})();
