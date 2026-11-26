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

  function _zt(v) {
    return (typeof window !== 'undefined' && typeof window.t === 'function') ? window.t(v) : v;
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

    el.innerHTML = '<div class="section-title">' + iqIcon('wallet') + ' ' + _esc(_zt('Zakat Calculator')) + '</div>' +
      '<div class="iq-setting-row" style="display:flex;flex-direction:column;align-items:stretch;gap:12px;padding:16px;text-align:start;">' +
        '<p style="color:var(--text2);font-size:0.85rem;margin:0;line-height:1.5;">' + _esc(_zt('Zakat is 2.5% on net zakatable wealth held above the nisab threshold for one lunar year (Hawl). Choose your local currency and enter current local bullion prices from a trusted jeweler or central bank.')) + '</p>' +
        '<div class="iq-zakat-grid">' +
          '<label style="font-size:0.82rem;color:var(--text2);">' + _esc(_zt('Currency')) + '<select id="zkCurrency" class="profile-input" style="margin-top:4px;margin-bottom:0;width:100%;" onchange="window.onZakatCurrencyChange(this.value)">' + curOpts + '</select></label>' +
          '<label style="font-size:0.82rem;color:var(--text2);">' + _esc(_zt('Nisab Standard')) + '<select id="zkStandard" class="profile-input" style="margin-top:4px;margin-bottom:0;width:100%;"><option value="silver"' + (standard === 'silver' ? ' selected' : '') + '>' + _esc(_zt('Silver (612.36g — Hanafi / Most Helpful to Poor)')) + '</option><option value="gold"' + (standard === 'gold' ? ' selected' : '') + '>' + _esc(_zt('Gold (87.48g — Majority Alternate)')) + '</option></select></label>' +
          '<label style="font-size:0.82rem;color:var(--text2);">' + _esc(_zt('Gold Owned (grams)')) + '<input type="number" id="zkGold" class="profile-input" style="margin-top:4px;margin-bottom:0;width:100%;" placeholder="0" min="0" step="any"></label>' +
          '<label style="font-size:0.82rem;color:var(--text2);">' + _esc(_zt('Silver Owned (grams)')) + '<input type="number" id="zkSilver" class="profile-input" style="margin-top:4px;margin-bottom:0;width:100%;" placeholder="0" min="0" step="any"></label>' +
          '<label style="font-size:0.82rem;color:var(--text2);">' + _esc(_zt('Cash & Savings')) + ' (<span class="zk-cur-sym">' + _esc(curInfo.symbol) + '</span>)<input type="number" id="zkCash" class="profile-input" style="margin-top:4px;margin-bottom:0;width:100%;" placeholder="0" min="0" step="any"></label>' +
          '<label style="font-size:0.82rem;color:var(--text2);">' + _esc(_zt('Investments & Shares')) + ' (<span class="zk-cur-sym">' + _esc(curInfo.symbol) + '</span>)<input type="number" id="zkInvest" class="profile-input" style="margin-top:4px;margin-bottom:0;width:100%;" placeholder="0" min="0" step="any"></label>' +
          '<label style="font-size:0.82rem;color:var(--text2);">' + _esc(_zt('Business Inventory')) + ' (<span class="zk-cur-sym">' + _esc(curInfo.symbol) + '</span>)<input type="number" id="zkBusiness" class="profile-input" style="margin-top:4px;margin-bottom:0;width:100%;" placeholder="0" min="0" step="any"></label>' +
          '<label style="font-size:0.82rem;color:var(--text2);">' + _esc(_zt('Receivables Owed to You')) + ' (<span class="zk-cur-sym">' + _esc(curInfo.symbol) + '</span>)<input type="number" id="zkDebts" class="profile-input" style="margin-top:4px;margin-bottom:0;width:100%;" placeholder="0" min="0" step="any"></label>' +
          '<label style="font-size:0.82rem;color:var(--text2);">' + _esc(_zt('Short-Term Liabilities Due')) + ' (<span class="zk-cur-sym">' + _esc(curInfo.symbol) + '</span>)<input type="number" id="zkLiabilities" class="profile-input" style="margin-top:4px;margin-bottom:0;width:100%;" placeholder="0" min="0" step="any"></label>' +
          '<label style="font-size:0.82rem;color:var(--text2);">' + _esc(_zt('Gold Price')) + ' (<span class="zk-cur-sym">' + _esc(curInfo.symbol) + '</span>/g)<input type="number" id="zkGoldPrice" class="profile-input" style="margin-top:4px;margin-bottom:0;width:100%;" min="0" step="any" value="' + _esc(curInfo.defaultGold) + '"></label>' +
          '<label style="font-size:0.82rem;color:var(--text2);">' + _esc(_zt('Silver Price')) + ' (<span class="zk-cur-sym">' + _esc(curInfo.symbol) + '</span>/g)<input type="number" id="zkSilverPrice" class="profile-input" style="margin-top:4px;margin-bottom:0;width:100%;" min="0" step="any" value="' + _esc(curInfo.defaultSilver) + '"></label>' +
        '</div>' +
        '<p style="font-size:0.78rem;color:var(--text2);margin:0;">' + _esc(_zt("Note: Pre-filled metal rates are editable estimates only; verify today's local gold/silver rate and consult a scholar for complex assets (retirement accounts, jewelry differing by madhab).")) + '</p>' +
        '<button type="button" onclick="window.calcZakat()" class="iq-pill-btn" style="width:100%;margin-top:4px;min-height:48px;">' + _esc(_zt('Calculate Zakat')) + '</button>' +
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
      '<div style="font-size:0.82rem;color:var(--text2);margin-bottom:4px;">' + _esc(_zt('Total Assets')) + ': <bdi dir="ltr" class="iq-tabular">' + sym + _numFmt(totalAssets.toFixed(2)) + '</bdi></div>' +
      '<div style="font-size:0.82rem;color:var(--text2);margin-bottom:4px;">' + _esc(_zt('Net Zakatable Wealth')) + ': <bdi dir="ltr" class="iq-tabular">' + sym + _numFmt(netWealth.toFixed(2)) + '</bdi></div>' +
      '<div style="font-size:0.82rem;color:var(--text2);margin-bottom:8px;">' + _esc(_zt('Active Nisab')) + ' (' + _esc(_zt(standard === 'gold' ? 'Gold 87.48g' : 'Silver 612.36g')) + '): <bdi dir="ltr" class="iq-tabular">' + sym + _numFmt(nisab.toFixed(2)) + '</bdi></div>' +
      (zakatDue > 0
        ? '<div style="font-size:1.2rem;font-weight:700;color:var(--accent-dark);margin-top:6px;">' + _esc(_zt('Estimated Zakat (2.5%)')) + ': <bdi dir="ltr" class="iq-tabular">' + sym + _numFmt(zakatDue.toFixed(2)) + '</bdi></div>'
        : '<div style="font-size:0.88rem;color:var(--text2);margin-top:6px;">' + _esc(_zt('Net wealth is below the selected nisab threshold — Zakat is not obligatory.')) + '</div>') +
      '</div>';
  }

  window.renderZakatCalc = renderZakatCalc;
  window.calcZakat = calcZakat;
  window.onZakatCurrencyChange = onZakatCurrencyChange;
})();
