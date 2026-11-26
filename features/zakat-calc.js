/* features/zakat-calc.js — Offline Zakat helper with currency support & Gold/Silver Nisab choice */
(function() {
  var CURRENCIES = {
    BDT: { symbol: '\u09F3', label: 'BDT (\u09F3)', defaultGold: 13500, defaultSilver: 190 },
    USD: { symbol: '$', label: 'USD ($)', defaultGold: 85, defaultSilver: 1.05 },
    GBP: { symbol: '\u00A3', label: 'GBP (\u00A3)', defaultGold: 67, defaultSilver: 0.82 },
    EUR: { symbol: '\u20AC', label: 'EUR (\u20AC)', defaultGold: 78, defaultSilver: 0.96 },
    SAR: { symbol: 'SAR ', label: 'SAR', defaultGold: 320, defaultSilver: 3.9 }
  };

  function _esc(v) {
    return (typeof window !== 'undefined' && typeof window.escapeHTML === 'function')
      ? window.escapeHTML(String(v == null ? '' : v))
      : String(v == null ? '' : v);
  }

  function _numFmt(v) {
    return (typeof window !== 'undefined' && typeof window.iqFormatNum === 'function')
      ? window.iqFormatNum(v)
      : String(v);
  }

  function _readSaved() {
    try {
      var raw = localStorage.getItem('iq_zakat_inputs');
      return raw ? JSON.parse(raw) : {};
    } catch (e) { return {}; }
  }

  function renderZakatCalc() {
    var el = document.getElementById('zakatcalcArea');
    if (!el) return;
    var saved = _readSaved();
    var curCode = CURRENCIES[saved.zkCurrency] ? saved.zkCurrency : ((typeof S !== 'undefined' && S && S.lang === 'bn') ? 'BDT' : 'USD');
    var curInfo = CURRENCIES[curCode];
    var standard = saved.zkStandard === 'gold' ? 'gold' : 'silver'; // Silver (612.36g / 595g classical Hanafi) vs Gold (87.48g / 85g)

    var curOpts = Object.keys(CURRENCIES).map(function(code) {
      return '<option value="' + code + '"' + (code === curCode ? ' selected' : '') + '>' + _esc(CURRENCIES[code].label) + '</option>';
    }).join('');

    el.innerHTML = '<div class="section-title">' + iqIcon('wallet') + ' Zakat Calculator</div>' +
      '<div class="card-item" style="flex-direction:column;align-items:stretch;gap:12px;padding:16px;">' +
        '<p style="color:var(--text2);font-size:0.85rem;margin:0;line-height:1.5;">Zakat is <strong>2.5%</strong> on net zakatable wealth held above the <em>nisab</em> threshold for one lunar year (Hawl). Choose your local currency and enter current local bullion prices from a trusted jeweler or central bank.</p>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">' +
          '<label style="font-size:0.8rem;color:var(--text2);">Currency<select id="zkCurrency" class="profile-input" style="margin-top:4px;width:100%;" onchange="window.onZakatCurrencyChange(this.value)">' + curOpts + '</select></label>' +
          '<label style="font-size:0.8rem;color:var(--text2);">Nisab Standard<select id="zkStandard" class="profile-input" style="margin-top:4px;width:100%;"><option value="silver"' + (standard === 'silver' ? ' selected' : '') + '>Silver (612.36g \u2014 Hanafi / Most Helpful to Poor)</option><option value="gold"' + (standard === 'gold' ? ' selected' : '') + '>Gold (87.48g \u2014 Majority Alternate)</option></select></label>' +
          '<label style="font-size:0.8rem;color:var(--text2);">Gold Owned (grams)<input type="number" id="zkGold" class="profile-input" style="margin-top:4px;width:100%;" placeholder="0" min="0" step="any"></label>' +
          '<label style="font-size:0.8rem;color:var(--text2);">Silver Owned (grams)<input type="number" id="zkSilver" class="profile-input" style="margin-top:4px;width:100%;" placeholder="0" min="0" step="any"></label>' +
          '<label style="font-size:0.8rem;color:var(--text2);">Cash &amp; Savings (<span class="zk-cur-sym">' + _esc(curInfo.symbol) + '</span>)<input type="number" id="zkCash" class="profile-input" style="margin-top:4px;width:100%;" placeholder="0" min="0" step="any"></label>' +
          '<label style="font-size:0.8rem;color:var(--text2);">Investments &amp; Shares (<span class="zk-cur-sym">' + _esc(curInfo.symbol) + '</span>)<input type="number" id="zkInvest" class="profile-input" style="margin-top:4px;width:100%;" placeholder="0" min="0" step="any"></label>' +
          '<label style="font-size:0.8rem;color:var(--text2);">Business Inventory (<span class="zk-cur-sym">' + _esc(curInfo.symbol) + '</span>)<input type="number" id="zkBusiness" class="profile-input" style="margin-top:4px;width:100%;" placeholder="0" min="0" step="any"></label>' +
          '<label style="font-size:0.8rem;color:var(--text2);">Receivables Owed to You (<span class="zk-cur-sym">' + _esc(curInfo.symbol) + '</span>)<input type="number" id="zkDebts" class="profile-input" style="margin-top:4px;width:100%;" placeholder="0" min="0" step="any"></label>' +
          '<label style="font-size:0.8rem;color:var(--text2);">Short-Term Liabilities Due (<span class="zk-cur-sym">' + _esc(curInfo.symbol) + '</span>)<input type="number" id="zkLiabilities" class="profile-input" style="margin-top:4px;width:100%;" placeholder="0" min="0" step="any"></label>' +
          '<label style="font-size:0.8rem;color:var(--text2);">Gold Price (<span class="zk-cur-sym">' + _esc(curInfo.symbol) + '</span>/g)<input type="number" id="zkGoldPrice" class="profile-input" style="margin-top:4px;width:100%;" min="0" step="any" value="' + _esc(curInfo.defaultGold) + '"></label>' +
          '<label style="font-size:0.8rem;color:var(--text2);">Silver Price (<span class="zk-cur-sym">' + _esc(curInfo.symbol) + '</span>/g)<input type="number" id="zkSilverPrice" class="profile-input" style="margin-top:4px;width:100%;" min="0" step="any" value="' + _esc(curInfo.defaultSilver) + '"></label>' +
        '</div>' +
        '<p style="font-size:0.75rem;color:var(--text3);margin:0;">Note: Pre-filled metal rates are editable estimates only; verify today\'s local gold/silver rate and consult a scholar for complex assets (retirement accounts, jewelry differing by madhab).</p>' +
        '<button onclick="window.calcZakat()" class="onboarding-btn" style="width:100%;margin-top:4px;min-height:48px;">Calculate Zakat</button>' +
        '<div id="zkResult" style="text-align:center;"></div>' +
      '</div>';

    ['zkGold','zkSilver','zkCash','zkInvest','zkBusiness','zkDebts','zkLiabilities','zkGoldPrice','zkSilverPrice'].forEach(function(k) {
      var inp = document.getElementById(k);
      if (inp && saved[k] !== undefined && saved[k] !== '') inp.value = saved[k];
    });
  }

  function onZakatCurrencyChange(code) {
    var c = CURRENCIES[code] || CURRENCIES.USD;
    document.querySelectorAll('.zk-cur-sym').forEach(function(s) { s.textContent = c.symbol; });
    var g = document.getElementById('zkGoldPrice');
    var sv = document.getElementById('zkSilverPrice');
    if (g) g.value = c.defaultGold;
    if (sv) sv.value = c.defaultSilver;
  }

  function calcZakat() {
    var curCode = (document.getElementById('zkCurrency') || {}).value || 'USD';
    var cur = CURRENCIES[curCode] || CURRENCIES.USD;
    var standard = (document.getElementById('zkStandard') || {}).value === 'gold' ? 'gold' : 'silver';
    var gold = parseFloat((document.getElementById('zkGold') || {}).value) || 0;
    var silver = parseFloat((document.getElementById('zkSilver') || {}).value) || 0;
    var cash = parseFloat((document.getElementById('zkCash') || {}).value) || 0;
    var invest = parseFloat((document.getElementById('zkInvest') || {}).value) || 0;
    var business = parseFloat((document.getElementById('zkBusiness') || {}).value) || 0;
    var debts = parseFloat((document.getElementById('zkDebts') || {}).value) || 0;
    var liabilities = parseFloat((document.getElementById('zkLiabilities') || {}).value) || 0;
    var goldPrice = parseFloat((document.getElementById('zkGoldPrice') || {}).value) || cur.defaultGold;
    var silverPrice = parseFloat((document.getElementById('zkSilverPrice') || {}).value) || cur.defaultSilver;

    var totalAssets = (gold * goldPrice) + (silver * silverPrice) + cash + invest + business + debts;
    var netWealth = Math.max(0, totalAssets - liabilities);
    var nisabGold = 87.48 * goldPrice;
    var nisabSilver = 612.36 * silverPrice;
    var nisab = standard === 'gold' ? nisabGold : nisabSilver;
    var zakatDue = netWealth >= nisab ? netWealth * 0.025 : 0;

    var inputs = { zkCurrency: curCode, zkStandard: standard };
    ['zkGold','zkSilver','zkCash','zkInvest','zkBusiness','zkDebts','zkLiabilities','zkGoldPrice','zkSilverPrice'].forEach(function(k) {
      var inp = document.getElementById(k);
      if (inp) inputs[k] = inp.value;
    });
    try { localStorage.setItem('iq_zakat_inputs', JSON.stringify(inputs)); } catch (e) {}

    var result = document.getElementById('zkResult');
    if (!result) return;
    var sym = _esc(cur.symbol);
    result.innerHTML = '<div style="margin-top:12px;padding:14px;border-radius:var(--radius);background:var(--bg-accent);border:1px solid var(--border);">' +
      '<div style="font-size:0.82rem;color:var(--text2);margin-bottom:4px;">Total Assets: ' + sym + _numFmt(totalAssets.toFixed(2)) + '</div>' +
      '<div style="font-size:0.82rem;color:var(--text2);margin-bottom:4px;">Net Zakatable Wealth: ' + sym + _numFmt(netWealth.toFixed(2)) + '</div>' +
      '<div style="font-size:0.82rem;color:var(--text2);margin-bottom:8px;">Active Nisab (' + (standard === 'gold' ? 'Gold 87.48g' : 'Silver 612.36g') + '): ' + sym + _numFmt(nisab.toFixed(2)) + '</div>' +
      (zakatDue > 0
        ? '<div style="font-size:1.2rem;font-weight:700;color:var(--accent);margin-top:6px;">Estimated Zakat (2.5%): ' + sym + _numFmt(zakatDue.toFixed(2)) + '</div>'
        : '<div style="font-size:0.88rem;color:var(--text2);margin-top:6px;">Net wealth is below the selected nisab threshold — Zakat is not obligatory.</div>') +
      '</div>';
  }

  window.renderZakatCalc = renderZakatCalc;
  window.calcZakat = calcZakat;
  window.onZakatCurrencyChange = onZakatCurrencyChange;
})();
