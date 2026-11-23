(function() {
  function renderDailyProgressWidget() {
    var state = (typeof S !== 'undefined' && S) || (typeof window !== 'undefined' && window.S) || {};
    var getToday = (typeof today === 'function') ? today : function() { return new Date().toISOString().slice(0, 10); };
    var t = getToday();
    var log = (state.log && state.log[t]) || {};
    var prayers = log.p || {};
    var prayedCount = 0;
    var totalPrayers = 5;
    var prayerNames = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
    var prayerStatus = {};

    for (var i = 0; i < prayerNames.length; i++) {
      var name = prayerNames[i];
      prayerStatus[name] = !!prayers[name];
      if (prayerStatus[name]) prayedCount++;
    }

    return {
      prayers: prayerStatus,
      prayedCount: prayedCount,
      totalPrayers: totalPrayers,
      xp: state.xp,
      level: state.lv,
      streak: state.cs
    };
  }

  window.renderDailyProgressWidget = renderDailyProgressWidget;
})();
