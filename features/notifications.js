(function() {
  let notificationTimer = null;
  
  function requestNotificationPermission() {
    return 'Notification' in window && Notification.permission === 'granted';
  }

  function askNotificationPermission() {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission !== 'default' || typeof Notification.requestPermission !== 'function') return false;
    return Notification.requestPermission().then(permission => permission === 'granted');
  }
  
  function toggleNotifications() {
    if (S.notificationsEnabled) {
      S.notificationsEnabled = false;
      saveState();
      if (notificationTimer) clearInterval(notificationTimer);
      toast(iqIcon('bell-off'), 'Notifications disabled');
      return;
    }

    const permission = askNotificationPermission();
    if (permission && typeof permission.then === 'function') {
      permission.then(enableNotifications).catch(() => enableNotifications(false));
    } else if (permission) {
      enableNotifications(true);
    } else {
      toast(iqIcon('bell-off'), 'Allow notifications in your browser settings first.');
    }
  }

  function enableNotifications(granted) {
    if (!granted) {
      toast(iqIcon('bell-off'), 'Notifications were not enabled.');
      return;
    }
    S.notificationsEnabled = true;
    saveState();
    scheduleNotifications();
    toast(iqIcon('bell'), 'Notifications enabled!');
  }
  
  function scheduleNotifications() {
    if (!S.notificationsEnabled) return;
    
    if (notificationTimer) clearInterval(notificationTimer);
    
    notificationTimer = setInterval(() => {
      if (!S.notificationsEnabled) return;
      
      const now = new Date();
      const hour = now.getHours();
      const minute = now.getMinutes();
      
      // Streak warning at 8 PM if no prayers today
      if (hour === 20 && minute === 0) {
        const t = today();
        const l = S.log[t] || {};
        const prayers = Object.values(l.p || {}).filter(v => v).length;
        if (prayers === 0) {
          notifyOnce('risk|' + t, 'Streak at Risk!', 'You haven\'t logged any prayers today. Don\'t break your streak!');
        }
      }
      
      // Daily bonus reminder at 8 AM
      if (hour === 8 && minute === 0) {
        const t = today();
        if (S.lbd !== t) {
          notifyOnce('bonus|' + t, 'Daily Bonus', 'Claim your daily bonus XP!');
        }
      }
    }, 60000); // Check every minute
  }
  
  function sendNotification(title, body) {
    if (!('Notification' in window)) return false;
    if (Notification.permission !== 'granted') return false;
    
    new Notification(title, {
      body,
      icon: '🕌',
      badge: '🕌'
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
  
  window.requestNotificationPermission = requestNotificationPermission;
  window.toggleNotifications = toggleNotifications;
  window.scheduleNotifications = scheduleNotifications;
})();
