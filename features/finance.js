(function() {
  const AMOUNTS = [5, 10, 25, 50, 100];
  let _pendingAction = null;

  function getTodayFinance() {
    const t = today();
    if (!S.financeLog) S.financeLog = {};
    if (!S.financeLog[t]) S.financeLog[t] = { income: 0, expenses: {}, charity: {} };
    return S.financeLog[t];
  }

  function logIncome(source) {
    if (!INCOME_SOURCES.some(item => item.id === source)) return;
    _pendingAction = { type: 'income', source };
    showAmountPicker();
  }

  function logExpense(category) {
    if (!EXPENSE_CATEGORIES.some(item => item.id === category)) return;
    _pendingAction = { type: 'expense', category };
    showAmountPicker();
  }

  function logCharity(charityType) {
    if (!FINANCE_PROMPTS.some(item => item.id === charityType)) return;
    _pendingAction = { type: 'charity', charityType };
    showAmountPicker();
  }

  function pickAmount(amount) {
    if (!_pendingAction) return;
    amount = Number(amount);
    if (!Number.isFinite(amount) || amount <= 0 || amount > 1000000000) return;
    const f = getTodayFinance();
    const p = _pendingAction;
    if (p.type === 'income') {
      f.income = (f.income || 0) + amount;
    } else if (p.type === 'expense') {
      f.expenses[p.category] = (f.expenses[p.category] || 0) + amount;
    } else if (p.type === 'charity') {
      f.charity[p.charityType] = (f.charity[p.charityType] || 0) + amount;
      const xp = Math.floor(amount / 10);
      if (xp > 0) { applyXpDelta(xp, { skipLevelToast: true }); }
    }
    _pendingAction = null;
    saveState();
    hideAmountPicker();
    renderFinanceTab();
  }

  function removeEntry(type, key) {
    if (type === 'charity' && !FINANCE_PROMPTS.some(item => item.id === key)) return;
    if (type === 'expense' && !EXPENSE_CATEGORIES.some(item => item.id === key)) return;
    if (type !== 'charity' && type !== 'expense') return;
    const f = getTodayFinance();
    if (type === 'charity') {
      const amt = f.charity[key] || 0;
      const xp = Math.floor(amt / 10);
      f.charity[key] = 0;
      if (xp > 0) { spendXp(xp, { skipLevelToast: true }); }
    } else if (type === 'expense') {
      f.expenses[key] = 0;
    }
    saveState();
    renderFinanceTab();
  }

  function showAmountPicker() {
    const ov = document.getElementById('toastOverlay');
    if (!ov) return;
    let h = '<div class="amount-picker-box"><div class="amount-picker-title">Choose Amount</div><div class="amount-picker-grid">';
    AMOUNTS.forEach(a => { h += `<button class="amount-pick-btn" onclick="financeTracker.pickAmount(${a})">${a}</button>`; });
    h += '</div>';
    h += '<div class="amount-custom-row"><label class="sr-only" for="customAmountInput">Custom amount</label><input id="customAmountInput" class="amount-custom-input" type="number" inputmode="decimal" placeholder="Enter amount" min="1"><button class="amount-custom-btn" onclick="financeTracker.pickCustomAmount()">OK</button></div>';
    h += '<button class="amount-pick-cancel" onclick="financeTracker.cancelPick()">Cancel</button></div>';
    ov.innerHTML = h;
    ov.style.display = 'flex';
    ov.classList.add('show');
    ov.style.pointerEvents = 'auto';
    setTimeout(() => {
      const inp = document.getElementById('customAmountInput');
      if (inp) {
        inp.focus();
        inp.addEventListener('keydown', function(e) {
          if (e.key === 'Enter') {
            e.preventDefault();
            financeTracker.pickCustomAmount();
          } else if (e.key === 'Escape') {
            e.preventDefault();
            financeTracker.cancelPick();
          }
        });
      }
    }, 100);
  }

  function hideAmountPicker() {
    const ov = document.getElementById('toastOverlay');
    if (ov) { ov.classList.remove('show'); ov.style.display = 'none'; ov.innerHTML = ''; ov.style.pointerEvents = 'none'; }
  }

  function cancelPick() { _pendingAction = null; hideAmountPicker(); }

  function pickCustomAmount() {
    const inp = document.getElementById('customAmountInput');
    const val = inp ? parseFloat(inp.value) : 0;
    if (!val || val <= 0 || isNaN(val)) { if (inp) inp.focus(); return; }
    pickAmount(val);
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

  function getWeekData() {
    const data = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = today(d);
      const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
      const entry = (S.financeLog || {})[key] || { income:0, expenses:{}, charity:{} };
      const exp = Object.values(entry.expenses || {}).reduce((a,b)=>a+b, 0);
      const chr = Object.values(entry.charity || {}).reduce((a,b)=>a+b, 0);
      data.push({ day: dayNames[d.getDay()], income: entry.income || 0, expense: exp, charity: chr });
    }
    return data;
  }

  function renderFinanceTab() {
    const el = document.getElementById('financeArea');
    if (!el) return;
    const f = getTodayFinance();
    const totalExpense = Object.values(f.expenses || {}).reduce((a, b) => a + b, 0);
    const totalCharity = Object.values(f.charity || {}).reduce((a, b) => a + b, 0);
    const balance = (f.income || 0) - totalExpense - totalCharity;

    const _ft = (s) => (typeof window !== 'undefined' && typeof window.t === 'function') ? window.t(s) : s;
    const _fn = (v) => (typeof window !== 'undefined' && typeof window.iqFormatNum === 'function') ? window.iqFormatNum(v) : String(v);
    let h = `<div class="section-title">${iqIcon('wallet')} ${_ft('Finance & Charity')}</div>`;

    // Balance overview card
    h += '<div class="fin-balance-card">';
    h += `<div class="fin-balance-label">${_ft("Today's Balance")}</div>`;
    h += `<div class="fin-balance-amount iq-tabular ${balance >= 0 ? 'pos' : 'neg'}"><bdi dir="ltr">${balance >= 0 ? '+' : ''}${_fn(balance)}</bdi></div>`;
    h += '<div class="fin-balance-row">';
    h += `<div class="fin-balance-item"><span class="fin-dot income"></span>${_ft('Income')} <b class="iq-tabular">${_fn(f.income || 0)}</b></div>`;
    h += `<div class="fin-balance-item"><span class="fin-dot expense"></span>${_ft('Expenses')} <b class="iq-tabular">${_fn(totalExpense)}</b></div>`;
    h += `<div class="fin-balance-item"><span class="fin-dot charity"></span>${_ft('Charity')} <b class="iq-tabular">${_fn(totalCharity)}</b></div>`;
    h += '</div></div>';

    // Weekly chart
    const week = getWeekData();
    const maxVal = Math.max(1, ...week.map(d => Math.max(d.income, d.expense + d.charity)));
    h += '<div class="fin-week">';
    h += `<div class="fin-week-title">${_ft('This Week')}</div>`;
    h += '<div class="fin-week-chart">';
    week.forEach(d => {
      const incH = Math.round((d.income / maxVal) * 60);
      const expH = Math.round(((d.expense + d.charity) / maxVal) * 60);
      h += `<div class="fin-week-col">
        <div class="fin-week-bars">
          <div class="fin-bar income" style="height:${incH}px"></div>
          <div class="fin-bar expense" style="height:${expH}px"></div>
        </div>
        <div class="fin-week-day">${_ft(d.day)}</div>
      </div>`;
    });
    h += '</div>';
    h += `<div class="fin-week-legend"><span class="fin-dot income"></span>${_ft('Income')} <span class="fin-dot expense"></span>${_ft('Spent')}</div>`;
    h += '</div>';

    // Income section
    h += `<div class="section-title">${iqIcon('dollar-sign')} ${_ft('Log Income')}</div>`;
    h += '<div class="finance-grid">';
    INCOME_SOURCES.forEach(s => {
      h += `<div class="finance-item" role="button" tabindex="0" onclick="financeTracker.logIncome('${s.id}')">
        <div class="finance-item-icon">${iqIcon(s.icon)}</div>
        <div class="finance-item-label">${_ft(s.label)}</div>
      </div>`;
    });
    h += '</div>';

    // Charity section
    const charityTypes = FINANCE_PROMPTS.filter(p => p.id !== 'zakat_fitr');
    h += `<div class="section-title">${iqIcon('heart')} ${_ft('Charity')}</div>`;
    h += '<div class="finance-grid">';
    charityTypes.forEach(p => {
      const amt = f.charity[p.id] || 0;
      h += `<div class="finance-item${amt > 0 ? ' has-value' : ''}" role="button" tabindex="0" onclick="financeTracker.logCharity('${p.id}')">
        <div class="finance-item-icon">${iqIcon(p.icon)}</div>
        <div class="finance-item-label">${_ft(p.label)}</div>
        <div class="finance-item-amount iq-tabular">${amt > 0 ? _fn(amt) : _ft(p.desc)}</div>
      </div>`;
    });
    h += '</div>';

    // Expense section
    h += `<div class="section-title">${iqIcon('bar-chart-3')} ${_ft('Expenses')}</div>`;
    h += '<div class="finance-grid">';
    EXPENSE_CATEGORIES.forEach(c => {
      const amt = f.expenses[c.id] || 0;
      h += `<div class="finance-item${amt > 0 ? ' has-value' : ''}" role="button" tabindex="0" onclick="financeTracker.logExpense('${c.id}')">
        <div class="finance-item-icon">${iqIcon(c.icon)}</div>
        <div class="finance-item-label">${_ft(c.label)}</div>
        <div class="finance-item-amount iq-tabular">${amt > 0 ? _fn(amt) : _ft('Tap to log')}</div>
      </div>`;
    });
    h += '</div>';

    // Lifetime stats
    h += '<div class="fin-lifetime">';
    h += `<div class="fin-lt-item"><div class="fin-lt-val iq-tabular">${_fn(getTotalCharity())}</div><div class="fin-lt-label">${_ft('Total Charity')}</div></div>`;
    const totalIncome = Object.values(S.financeLog || {}).reduce((a, d) => a + (d.income || 0), 0);
    h += `<div class="fin-lt-item"><div class="fin-lt-val iq-tabular">${_fn(totalIncome)}</div><div class="fin-lt-label">${_ft('Total Income')}</div></div>`;
    h += '</div>';

    // Islamic finance knowledge
    if (typeof FINANCE_POOL !== 'undefined' && FINANCE_POOL.length) {
      h += `<div class="section-title">${iqIcon('book-open')} ${_ft('Islamic Finance Wisdom')}</div>`;
      const finIdx = S.financeIdx || [];
      let indices = finIdx.length ? finIdx : [];
      if (!indices.length) { indices = Array.from({length: Math.min(5, FINANCE_POOL.length)}, (_, i) => i); S.financeIdx = indices; }
      h += indices.slice(0, 5).map(i => {
        const o = FINANCE_POOL[i % FINANCE_POOL.length];
        return `<div class="content-card"><div class="iq-card-title">${o.title}</div><div class="content-english">${o.desc}</div></div>`;
      }).join('');
    }

    el.innerHTML = h;
  }

  window.financeTracker = { logIncome, logExpense, logCharity, removeEntry, pickAmount, pickCustomAmount, cancelPick, renderFinanceTab };
  window.renderFinanceTab = renderFinanceTab;
})();
