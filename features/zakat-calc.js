(function() {
  function renderZakatCalc() {
    var el = document.getElementById('zakatcalcArea');
    if (!el) return;
    el.innerHTML = '<div class="section-title">' + iqIcon('wallet') + ' Zakat Calculator</div>' +
      '<div class="card-item" style="flex-direction:column;align-items:stretch;gap:12px;padding:16px;">' +
        '<p style="color:var(--text2);font-size:0.8rem;margin:0;">Zakat is 2.5% of wealth held above the <em>nisab</em> threshold for one lunar year.</p>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
          '<label style="font-size:0.75rem;color:var(--text2);">Gold (grams)<input type="number" id="zkGold" class="profile-input" style="margin-top:4px;width:100%;" placeholder="0" min="0"></label>' +
          '<label style="font-size:0.75rem;color:var(--text2);">Silver (grams)<input type="number" id="zkSilver" class="profile-input" style="margin-top:4px;width:100%;" placeholder="0" min="0"></label>' +
          '<label style="font-size:0.75rem;color:var(--text2);">Cash & Savings<input type="number" id="zkCash" class="profile-input" style="margin-top:4px;width:100%;" placeholder="0" min="0"></label>' +
          '<label style="font-size:0.75rem;color:var(--text2);">Investments<input type="number" id="zkInvest" class="profile-input" style="margin-top:4px;width:100%;" placeholder="0" min="0"></label>' +
          '<label style="font-size:0.75rem;color:var(--text2);">Business Stock<input type="number" id="zkBusiness" class="profile-input" style="margin-top:4px;width:100%;" placeholder="0" min="0"></label>' +
          '<label style="font-size:0.75rem;color:var(--text2);">Debts Owed to You<input type="number" id="zkDebts" class="profile-input" style="margin-top:4px;width:100%;" placeholder="0" min="0"></label>' +
          '<label style="font-size:0.75rem;color:var(--text2);">Personal Debts<input type="number" id="zkLiabilities" class="profile-input" style="margin-top:4px;width:100%;" placeholder="0" min="0"></label>' +
        '</div>' +
        '<button onclick="window.calcZakat()" class="onboarding-btn" style="width:100%;margin-top:4px;">Calculate Zakat</button>' +
        '<div id="zkResult" style="text-align:center;"></div>' +
      '</div>';
    var saved = JSON.parse(localStorage.getItem('iq_zakat_inputs') || '{}');
    ['zkGold','zkSilver','zkCash','zkInvest','zkBusiness','zkDebts','zkLiabilities'].forEach(function(k) {
      var inp = document.getElementById(k);
      if (inp && saved[k] !== undefined) inp.value = saved[k];
    });
  }

  function calcZakat() {
    var gold = parseFloat(document.getElementById('zkGold').value) || 0;
    var silver = parseFloat(document.getElementById('zkSilver').value) || 0;
    var cash = parseFloat(document.getElementById('zkCash').value) || 0;
    var invest = parseFloat(document.getElementById('zkInvest').value) || 0;
    var business = parseFloat(document.getElementById('zkBusiness').value) || 0;
    var debts = parseFloat(document.getElementById('zkDebts').value) || 0;
    var liabilities = parseFloat(document.getElementById('zkLiabilities').value) || 0;
    var goldPrice = 65;
    var silverPrice = 0.8;
    var totalAssets = (gold * goldPrice) + (silver * silverPrice) + cash + invest + business + debts;
    var netWealth = totalAssets - liabilities;
    var nisabGold = 87.48 * goldPrice;
    var nisabSilver = 612.36 * silverPrice;
    var nisab = Math.max(nisabGold, nisabSilver);
    var zakatDue = netWealth >= nisab ? netWealth * 0.025 : 0;
    var inputs = {};
    ['zkGold','zkSilver','zkCash','zkInvest','zkBusiness','zkDebts','zkLiabilities'].forEach(function(k) {
      inputs[k] = document.getElementById(k).value;
    });
    localStorage.setItem('iq_zakat_inputs', JSON.stringify(inputs));
    var result = document.getElementById('zkResult');
    result.innerHTML = '<div style="margin-top:12px;padding:12px;border-radius:var(--radius);background:var(--bg-accent);border:1px solid var(--border);">' +
      '<div style="font-size:0.72rem;color:var(--text2);margin-bottom:4px;">Total Assets: $' + totalAssets.toFixed(2) + '</div>' +
      '<div style="font-size:0.72rem;color:var(--text2);margin-bottom:4px;">Net Wealth: $' + netWealth.toFixed(2) + '</div>' +
      '<div style="font-size:0.72rem;color:var(--text2);margin-bottom:8px;">Nisab: $' + nisab.toFixed(2) + '</div>' +
      (zakatDue > 0
        ? '<div style="font-size:1.1rem;font-weight:700;color:var(--accent);">Your Zakat: $' + zakatDue.toFixed(2) + '</div>'
        : '<div style="font-size:0.85rem;color:var(--text3);">Your wealth is below the nisab threshold. No zakat is due.</div>') +
      '</div>';
  }

  window.renderZakatCalc = renderZakatCalc;
  window.calcZakat = calcZakat;
})();
