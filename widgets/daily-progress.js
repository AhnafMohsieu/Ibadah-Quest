(function() {
  function renderDailyProgressWidget() {
    var t = today();
    var log = S.log[t] || {};
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
      xp: S.xp,
      level: S.lv,
      streak: S.cs
    };
  }

  window.renderDailyProgressWidget = renderDailyProgressWidget;
})();
