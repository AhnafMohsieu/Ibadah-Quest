(function() {
  function renderDhikrCounterWidget() {
    var state = (typeof S !== 'undefined' && S) || (typeof window !== 'undefined' && window.S) || {};
    var getToday = (typeof today === 'function') ? today : function() { return new Date().toISOString().slice(0, 10); };
    var t = getToday();
    var sessions = state.dhikrSessions || [];
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
