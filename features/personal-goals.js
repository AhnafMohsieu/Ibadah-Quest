(function() {
  function addPersonalGoal(type, target, deadline) {
    if (!S.personalGoals) S.personalGoals = [];
    const goal = {
      id: 'g' + Date.now(),
      type,
      target,
      current: 0,
      deadline,
      xpReward: Math.min(target * 10, 500),
      completed: false
    };
    S.personalGoals.push(goal);
    saveState();
    renderPersonalGoals();
  }
  
  function updateGoalProgress(goalId) {
    const goal = S.personalGoals.find(g => g.id === goalId);
    if (!goal || goal.completed) return;
    
    goal.current++;
    
    if (goal.current >= goal.target) {
      goal.completed = true;
      S.xp += goal.xpReward;
      S.lv = lvFrom(S.xp);
      toast(iqIcon('target'), `Goal Complete! +${goal.xpReward} XP!`, true);
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
        const progress = Math.min(100, Math.round((g.current / g.target) * 100));
        const daysLeft = Math.max(0, Math.ceil((new Date(g.deadline) - new Date()) / 86400000));
        h += `<div class="goal-card ${g.completed ? 'completed' : ''}">
          <div class="goal-header">
            <span class="goal-type">${g.type}</span>
            <span class="goal-deadline">${daysLeft} days left</span>
          </div>
          <div class="goal-progress">
            <div class="goal-bar" style="width:${progress}%"></div>
          </div>
          <div class="goal-stats">${g.current}/${g.target}</div>
          ${!g.completed ? `<button class="goal-btn" onclick="updateGoalProgress('${g.id}')">+1</button>` : '<span class="goal-done">✓ Complete</span>'}
        </div>`;
      }
    }
    
    h += `<button class="add-goal-btn" onclick="showAddGoalModal()">+ Add Goal</button>`;
    el.innerHTML = h;
  }
  
  function showAddGoalModal() {
    const ov = document.getElementById('toastOverlay');
    if (!ov) return;
    ov.innerHTML = `<div class="modal-box">
      <h3>${iqIcon('target')} Add Goal</h3>
      <div class="form-group">
        <label>Type</label>
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
        <label>Target (times)</label>
        <input type="number" id="goalTarget" min="1" max="365" value="10" />
      </div>
      <div class="form-group">
        <label>Deadline</label>
        <input type="date" id="goalDeadline" value="${new Date(Date.now()+30*86400000).toISOString().split('T')[0]}" />
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
