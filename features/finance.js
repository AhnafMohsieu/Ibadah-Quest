(function() {
  function getTodayFinance() {
    const t = today();
    if (!S.financeLog) S.financeLog = {};
    if (!S.financeLog[t]) S.financeLog[t] = { income: 0, expenses: {}, charity: {} };
    return S.financeLog[t];
  }

  function logIncome(amount) {
    const f = getTodayFinance();
    f.income = Math.max(0, amount);
    saveState();
    renderFinanceTab();
  }

  function logExpense(category, amount) {
    const f = getTodayFinance();
    f.expenses[category] = (f.expenses[category] || 0) + amount;
    saveState();
    renderFinanceTab();
  }

  function logCharity(type, amount) {
    const f = getTodayFinance();
    f.charity[type] = (f.charity[type] || 0) + amount;
    const xp = Math.floor(amount / 10);
    if (xp > 0) { S.xp += xp; S.lv = lvFrom(S.xp); }
    saveState();
    renderFinanceTab();
  }

  function removeCharity(type, amount) {
    const f = getTodayFinance();
    const xp = Math.floor(amount / 10);
    f.charity[type] = Math.max(0, (f.charity[type] || 0) - amount);
    if (xp > 0) { S.xp = Math.max(0, S.xp - xp); S.lv = lvFrom(S.xp); }
    saveState();
    renderFinanceTab();
  }

  function getTotalCharity() {
    let total = 0;
    for (const d in S.financeLog || {}) {
      for (const t in S.financeLog[d].charity || {}) {
        total += S.financeLog[d].charity[t];
      }
    }
    return total;
  }

  function renderFinanceTab() {
    const el = document.getElementById('financeArea');
    if (!el) return;
    const f = getTodayFinance();
    const charityTypes = FINANCE_PROMPTS.filter(p => p.id !== 'zakat_fitr');
    let h = '<div class="section-title">💰 Finance & Charity</div>';
    h += '<div class="finance-cards">';

    h += '<div class="finance-card">';
    h += '<div class="finance-card-header">Today\'s Summary</div>';
    h += `<div class="finance-stat">Income: <span class="finance-amount">${f.income || 0}</span></div>`;
    const totalExpense = Object.values(f.expenses || {}).reduce((a, b) => a + b, 0);
    h += `<div class="finance-stat">Expenses: <span class="finance-amount">${totalExpense}</span></div>`;
    const totalCharity = Object.values(f.charity || {}).reduce((a, b) => a + b, 0);
    h += `<div class="finance-stat">Charity: <span class="finance-amount">${totalCharity}</span></div>`;
    h += '</div>';

    h += '<div class="finance-card">';
    h += '<div class="finance-card-header">Total Charity</div>';
    h += `<div class="finance-stat">All time: <span class="finance-amount">${getTotalCharity()}</span></div>`;
    h += '</div>';
    h += '</div>';

    h += '<div class="section-title" style="margin-top:16px">💝 Quick Charity</div>';
    h += '<div class="finance-grid">';
    charityTypes.forEach(p => {
      const amt = f.charity[p.id] || 0;
      h += `<div class="finance-item" onclick="financeTracker.addCharity('${p.id}',10)">
        <div class="finance-item-icon">${p.icon}</div>
        <div class="finance-item-label">${p.label}</div>
        <div class="finance-item-amount">${amt > 0 ? amt : p.desc}</div>
      </div>`;
    });
    h += '</div>';

    h += '<div class="section-title" style="margin-top:16px">📊 Expense Categories</div>';
    h += '<div class="finance-grid">';
    EXPENSE_CATEGORIES.forEach(c => {
      const amt = f.expenses[c.id] || 0;
      h += `<div class="finance-item" onclick="financeTracker.addExpense('${c.id}',5)">
        <div class="finance-item-icon">${c.icon}</div>
        <div class="finance-item-label">${c.label}</div>
        <div class="finance-item-amount">${amt > 0 ? amt : 'Tap to log'}</div>
      </div>`;
    });
    h += '</div>';

    el.innerHTML = h;
  }

  window.financeTracker = { logIncome, logExpense, logCharity, removeCharity, addCharity: logCharity, addExpense: logExpense, renderFinanceTab };
  window.renderFinanceTab = renderFinanceTab;
})();
