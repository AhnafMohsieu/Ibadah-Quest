(function() {
  function renderDhikrCounterWidget() {
    var t = today();
    var sessions = S.dhikrSessions || [];
    var lastSession = null;
    var todayTotal = 0;

    if (sessions.length > 0) {
      lastSession = sessions[sessions.length - 1];
    }

    for (var i = 0; i < sessions.length; i++) {
      if (sessions[i].date === t) {
        todayTotal += sessions[i].count || 0;
      }
    }

    return {
      lastSession: lastSession,
      todayTotal: todayTotal
    };
  }

  window.renderDhikrCounterWidget = renderDhikrCounterWidget;
})();
