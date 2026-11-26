/* features/notifications.js — Calm, bounded, timezone-aware notifications + Capacitor/SW scheduling */
(function() {
  let notificationTimer = null;

  function _getSettings() {
    var base = { quietStart: '22:30', quietEnd: '04:30', prayers: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true }, offsets: { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 }, dailyCap: 6 };
    if (typeof S !== 'undefined' && S && S.notificationSettings) {
      return Object.assign({}, base, S.notificationSettings, {
        prayers: Object.assign({}, base.prayers, S.notificationSettings.prayers || {}),
        offsets: Object.assign({}, base.offsets, S.notificationSettings.offsets || {})
      });
    }
    return base;
  }

  function _inQuietHours(dateObj, cfg) {
    var curMin = dateObj.getHours() * 60 + dateObj.getMinutes();
    var pS = String(cfg.quietStart || '22:30').split(':').map(Number);
    var pE = String(cfg.quietEnd || '04:30').split(':').map(Number);
    var startMin = (pS[0] || 22) * 60 + (pS[1] || 30);
    var endMin = (pE[0] || 4) * 60 + (pE[1] || 30);
    if (startMin > endMin) return curMin >= startMin || curMin < endMin;
    return curMin >= startMin && curMin < endMin;
  }

  function requestNotificationPermission() {
    return typeof Notification !== 'undefined' && Notification.permission === 'granted';
  }

  function askNotificationPermission() {
    if (typeof window !== 'undefined' && window.NativeBridge && typeof window.NativeBridge.requestNotificationPermissions === 'function') {
      return window.NativeBridge.requestNotificationPermissions();
    }
    if (typeof Notification === 'undefined') return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission !== 'default' || typeof Notification.requestPermission !== 'function') return false;
    return Notification.requestPermission().then(permission => permission === 'granted');
  }

  function toggleNotifications() {
    if (S.notificationsEnabled) {
      S.notificationsEnabled = false;
      saveState();
      if (notificationTimer) { clearInterval(notificationTimer); notificationTimer = null; }
      toast(iqIcon('bell-off'), 'Notifications paused');
      if (typeof window.renderProfile === 'function') window.renderProfile();
      return;
    }
    const permission = askNotificationPermission();
    if (permission && typeof permission.then === 'function') {
      permission.then(enableNotifications).catch(() => enableNotifications(false));
    } else if (permission) {
      enableNotifications(true);
    } else {
      toast(iqIcon('bell-off'), 'Please enable notification permission in device settings.');
    }
  }

  function enableNotifications(granted) {
    if (!granted) {
      toast(iqIcon('bell-off'), 'Permission declined \u2014 reminders remain off.');
      return;
    }
    S.notificationsEnabled = true;
    saveState();
    scheduleNotifications();
    toast(iqIcon('bell'), 'Calm prayer reminders active');
    if (typeof window.renderProfile === 'function') window.renderProfile();
  }

  function buildUpcomingSchedule(daysAhead) {
    var days = Math.max(1, Math.min(10, Number(daysAhead) || 7));
    var cfg = _getSettings();
    var list = [];
    if (typeof window === 'undefined' || typeof window.computeOfflinePrayerTimes !== 'function' || typeof window.getPrayerSettings !== 'function') {
      return list;
    }
    var ps = window.getPrayerSettings();
    var now = new Date();
    var idSeq = 100;
    for (var d = 0; d < days; d++) {
      var targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + d, 12, 0, 0);
      var times = window.computeOfflinePrayerTimes(ps, targetDate);
      if (!times) continue;
      ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].forEach(function(name) {
        var key = name.toLowerCase();
        if (!cfg.prayers[key]) return;
        var slot = times[name];
        if (!slot) return;
        var off = Number(cfg.offsets[key]) || 0;
        var fireAt = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), slot.h, slot.m + off, 0);
        if (fireAt.getTime() <= now.getTime()) return;
        list.push({
          id: idSeq++,
          prayer: key,
          title: 'Ibadah Quest \u2014 ' + name,
          body: name + ' time has entered. Step in calmly when ready.',
          at: fireAt
        });
      });
    }
    return list.slice(0, 60); // Respect iOS 64-pending local notification limit
  }

  function syncNativeSchedule() {
    if (typeof window === 'undefined' || !window.NativeBridge || typeof window.NativeBridge.scheduleNativeBatch !== 'function') return;
    if (typeof S === 'undefined' || !S || !S.notificationsEnabled) return;
    var items = buildUpcomingSchedule(7);
    if (items.length) window.NativeBridge.scheduleNativeBatch(items);
  }

  function scheduleNotifications() {
    if (!S.notificationsEnabled) return;
    if (notificationTimer) clearInterval(notificationTimer);
    syncNativeSchedule();

    notificationTimer = setInterval(() => {
      if (!S.notificationsEnabled) return;
      if (S.prayerSettings && S.prayerSettings.paused) return; // Respect Rest Mode quietly
      const now = new Date();
      const cfg = _getSettings();
      const t = typeof today === 'function' ? today() : now.toISOString().slice(0, 10);
      const sentToday = Object.keys(S.notificationLog || {}).filter(k => k.endsWith('|' + t)).length;
      if (sentToday >= (cfg.dailyCap || 6)) return;

      // Check upcoming/current prayer window triggers offline
      const times = (typeof window !== 'undefined' && typeof window.getPrayerTimesFromCache === 'function')
        ? window.getPrayerTimesFromCache() : null;
      if (times) {
        ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].forEach(name => {
          const pk = name.toLowerCase();
          if (!cfg.prayers[pk]) return;
          const slot = times[name];
          if (!slot) return;
          const off = Number(cfg.offsets[pk]) || 0;
          const slotMin = slot.h * 60 + slot.m + off;
          const nowMin = now.getHours() * 60 + now.getMinutes();
          if (nowMin >= slotMin && nowMin <= slotMin + 2) {
            if (pk !== 'fajr' && _inQuietHours(now, cfg)) return;
            notifyOnce('prayer_' + pk + '|' + t, 'Time for ' + name, 'May this prayer bring calm and light to your day.');
          }
        });
      }

      // Gentle evening reflection nudge (max once per day, non-guilt copy)
      if (now.getHours() === 20 && now.getMinutes() < 5 && !_inQuietHours(now, cfg)) {
        const l = (S.log && S.log[t]) || {};
        const prayers = Object.values(l.p || {}).filter(v => v).length;
        if (prayers === 0) {
          notifyOnce('gentle_evening|' + t, 'Evening Moment', 'Take a calm breath \u2014 log any prayer or a short dhikr whenever ready.');
        }
      }
    }, 60000);
  }

  function sendNotification(title, body) {
    if (typeof Notification === 'undefined') return false;
    if (Notification.permission !== 'granted') return false;
    new Notification(title, {
      body: body,
      icon: 'assets/icons/app-icon-192.png',
      badge: 'assets/icons/app-icon-192.png'
    });
    return true;
  }

  function notifyOnce(key, title, body) {
    if (!S.notificationLog) S.notificationLog = {};
    if (S.notificationLog[key]) return;
    let sent = false;
    try { sent = sendNotification(title, body); } catch(e) {}
    if (sent) {
      S.notificationLog[key] = Date.now();
      saveState();
    }
  }

  function sendTestNotification() {
    if (typeof window !== 'undefined' && window.NativeBridge && typeof window.NativeBridge.sendTestNotification === 'function') {
      return window.NativeBridge.sendTestNotification('Ibadah Quest Reminder', 'Assalamu Alaikum — your calm reminder alerts are working.');
    }
    try {
      var ok = sendNotification('Ibadah Quest Reminder', 'Assalamu Alaikum — your calm reminder alerts are working.');
      if (typeof toast === 'function') toast(iqIcon(ok ? 'bell' : 'bell-off'), ok ? 'Test notification sent!' : 'Allow notifications first to test.');
      return Promise.resolve({ sent: ok });
    } catch (e) {
      return Promise.resolve({ sent: false });
    }
  }

  function _isQuietHour(hhmm) {
    var parts = String(hhmm || '12:00').split(':').map(Number);
    var d = new Date(2026, 0, 1, parts[0] || 0, parts[1] || 0, 0);
    return _inQuietHours(d, _getSettings());
  }

  function updateNotificationSettings(prayerId, enabled) {
    if (typeof S === 'undefined' || !S) return;
    if (!S.notificationSettings) S.notificationSettings = _getSettings();
    if (!S.notificationSettings.prayers) S.notificationSettings.prayers = {};
    S.notificationSettings.prayers[prayerId] = !!enabled;
    if (typeof saveState === 'function') saveState();
    syncNativeSchedule();
    if (typeof window !== 'undefined' && window.renderProfile) window.renderProfile();
  }

  window._inQuietHours = _inQuietHours;
  window._isQuietHour = _isQuietHour;
  window.updateNotificationSettings = updateNotificationSettings;
  window.requestNotificationPermission = requestNotificationPermission;
  window.toggleNotifications = toggleNotifications;
  window.scheduleNotifications = scheduleNotifications;
  window.syncNativeSchedule = syncNativeSchedule;
  window.buildUpcomingSchedule = buildUpcomingSchedule;
  window.sendTestNotification = sendTestNotification;
})();
