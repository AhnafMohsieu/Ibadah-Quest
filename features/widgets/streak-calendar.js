(function() {
  function renderStreakCalendarWidget() {
    var state = (typeof S !== 'undefined' && S) || (typeof window !== 'undefined' && window.S) || {};
    var getToday = (typeof today === 'function') ? today : function(d) { return (d || new Date()).toISOString().slice(0, 10); };
    var t = getToday();
    var now = new Date(t + 'T00:00:00');
    var month = now.getMonth();
    var year = now.getFullYear();
    var monthName = now.toLocaleString('default', { month: 'long' });

    var daysInMonth = new Date(year, month + 1, 0).getDate();
    var streakDays = [];

    for (var d = 1; d <= daysInMonth; d++) {
      var dateStr = getToday(new Date(year, month, d));
      var log = state.log && state.log[dateStr];
      var prayed = !!(log && Object.values(log.p || {}).filter(function(v) { return v; }).length >= 5);
      streakDays.push({ day: d, date: dateStr, completed: prayed });
    }

    return {
      month: monthName,
      year: year,
      streakDays: streakDays,
      currentStreak: state.cs || 0,
      bestStreak: state.bs || 0
    };
  }

  window.renderStreakCalendarWidget = renderStreakCalendarWidget;
})();
