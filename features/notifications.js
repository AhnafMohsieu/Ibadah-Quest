(function() {
  let notificationTimer = null;
  
  function requestNotificationPermission() {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }
  
  function toggleNotifications() {
    S.notificationsEnabled = !S.notificationsEnabled;
    saveState();
    
    if (S.notificationsEnabled) {
      scheduleNotifications();
      toast(iqIcon('bell'), 'Notifications enabled!');
    } else {
      if (notificationTimer) clearInterval(notificationTimer);
      toast(iqIcon('bell-off'), 'Notifications disabled');
    }
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
          sendNotification('Streak at Risk!', 'You haven\'t logged any prayers today. Don\'t break your streak!');
        }
      }
      
      // Daily bonus reminder at 8 AM
      if (hour === 8 && minute === 0) {
        const t = today();
        if (S.lbd !== t) {
          sendNotification('Daily Bonus', 'Claim your daily bonus XP!');
        }
      }
    }, 60000); // Check every minute
  }
  
  function sendNotification(title, body) {
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;
    
    new Notification(title, {
      body,
      icon: '🕌',
      badge: '🕌'
    });
  }
  
  window.requestNotificationPermission = requestNotificationPermission;
  window.toggleNotifications = toggleNotifications;
  window.scheduleNotifications = scheduleNotifications;
})();