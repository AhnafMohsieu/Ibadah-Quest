(function() {
  function renderStreakCalendarWidget() {
    var t = today();
    var now = new Date(t + 'T00:00:00');
    var month = now.getMonth();
    var year = now.getFullYear();
    var monthName = now.toLocaleString('default', { month: 'long' });

    var daysInMonth = new Date(year, month + 1, 0).getDate();
    var streakDays = [];

    for (var d = 1; d <= daysInMonth; d++) {
      var dateStr = today(new Date(year, month, d));
      var log = S.log[dateStr];
      var prayed = !!(log && Object.values(log.p || {}).filter(function(v) { return v; }).length >= 5);
      streakDays.push({ day: d, date: dateStr, completed: prayed });
    }

    return {
      month: monthName,
      year: year,
      streakDays: streakDays,
      currentStreak: S.cs || 0,
      bestStreak: S.bs || 0
    };
  }

  window.renderStreakCalendarWidget = renderStreakCalendarWidget;
})();
