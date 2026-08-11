(function() {
  const MILESTONES = [3, 7, 14, 30];

  function daysBetween(d1, d2) {
    var a = new Date(d1 + 'T00:00:00');
    var b = new Date(d2 + 'T00:00:00');
    return Math.round((b - a) / 86400000);
  }

  function getComboMultiplier(count) {
    if (count >= 30) return 5;
    if (count >= 14) return 3;
    if (count >= 7) return 2;
    if (count >= 3) return 1.5;
    return 1;
  }

  function checkCombo(type, completed) {
    if (!S.combos) S.combos = {};
    if (!S.combos[type]) S.combos[type] = { count: 0, lastDate: null, best: 0 };

    var combo = S.combos[type];
    var t = today();
    var prevCount = combo.count;

    if (completed) {
      if (combo.lastDate) {
        var diff = daysBetween(combo.lastDate, t);
        if (diff === 0) {
          // same day — already tracked, do not increment again
        } else if (diff === 1) {
          combo.count++;
        } else {
          combo.count = 1;
        }
      } else {
        combo.count = 1;
      }
      combo.lastDate = t;
      if (combo.count > (combo.best || 0)) combo.best = combo.count;
    } else {
      if (combo.lastDate) {
        var diff = daysBetween(combo.lastDate, t);
        if (diff > 1) {
          combo.count = 0;
        }
      }
    }

    saveState();

    if (completed && combo.count > prevCount) {
      var mult = getComboMultiplier(combo.count);
      var multLabel = mult > 1 ? ' (' + mult + 'x XP!)' : '';
      if (MILESTONES.indexOf(combo.count) !== -1) {
        toast(iqIcon('flame'), type.charAt(0).toUpperCase() + type.slice(1) + ' Combo: ' + combo.count + ' Days!' + multLabel, true);
      }
    }
  }

  function renderCombos() {
    var el = document.getElementById('comboDisplay');
    if (!el) return;
    var combos = S.combos || {};
    var types = Object.keys(combos);
    if (!types.length) { el.innerHTML = ''; return; }

    var html = '<div class="combo-grid">';
    for (var i = 0; i < types.length; i++) {
      var type = types[i];
      var c = combos[type];
      if (!c.count) continue;
      var mult = getComboMultiplier(c.count);
      var isHot = c.count >= 7;
      html += '<div class="combo-card' + (isHot ? ' hot' : '') + '">';
      html += '<div class="combo-fire">' + (isHot ? iqIcon('flame') : iqIcon('zap')) + '</div>';
      html += '<div class="combo-count">' + c.count + '</div>';
      html += '<div class="combo-type">' + type + '</div>';
      html += '<div class="combo-mult">' + mult + 'x XP</div>';
      if (c.best) html += '<div class="combo-best">Best: ' + c.best + '</div>';
      html += '</div>';
    }
    html += '</div>';
    el.innerHTML = html;
  }

  window.getComboMultiplier = getComboMultiplier;
  window.checkCombo = checkCombo;
  window.renderCombos = renderCombos;
})();
