/* features/native-bridge.js — Unified PWA + Capacitor platform adapter
 * Uses native @capacitor/local-notifications when bundled inside Capacitor (iOS/Android),
 * and gracefully falls back to Service Worker / Web Notification + Geolocation APIs in PWA mode.
 */
(function() {
  'use strict';

  function isCapacitorNative() {
    try {
      return !!(window.Capacitor && typeof window.Capacitor.isNativePlatform === 'function' && window.Capacitor.isNativePlatform());
    } catch (e) {
      return false;
    }
  }

  function getLocalNotificationsPlugin() {
    try {
      if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LocalNotifications) {
        return window.Capacitor.Plugins.LocalNotifications;
      }
    } catch (e) {}
    return null;
  }

  async function requestNotificationPermissions() {
    var plugin = getLocalNotificationsPlugin();
    if (plugin && typeof plugin.checkPermissions === 'function') {
      try {
        var st = await plugin.checkPermissions();
        if (st.display !== 'granted' && typeof plugin.requestPermissions === 'function') {
          st = await plugin.requestPermissions();
        }
        return st.display === 'granted';
      } catch (e) {
        return false;
      }
    }
    if (typeof Notification === 'undefined') return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'default' && typeof Notification.requestPermission === 'function') {
      try {
        var res = await Notification.requestPermission();
        return res === 'granted';
      } catch (e) {
        return false;
      }
    }
    return false;
  }

  async function scheduleNativeBatch(items) {
    var plugin = getLocalNotificationsPlugin();
    if (!plugin || typeof plugin.schedule !== 'function') return { mode: 'web', scheduled: 0 };
    try {
      // Keep within iOS 64-pending-local-notification cap (schedule rolling 7 days max = <=42 alerts)
      var pending = typeof plugin.getPending === 'function' ? await plugin.getPending() : { notifications: [] };
      if (pending && Array.isArray(pending.notifications) && pending.notifications.length) {
        await plugin.cancel({ notifications: pending.notifications.map(function(n) { return { id: n.id }; }) });
      }
      var capped = (Array.isArray(items) ? items : []).slice(0, 60).map(function(it, idx) {
        return {
          id: ((Number(it.id) || (1000 + idx)) & 0x7fffffff) || 1001,
          title: String(it.title || 'Ibadah Quest'),
          body: String(it.body || ''),
          schedule: { at: it.at instanceof Date ? it.at : new Date(it.at), allowWhileIdle: true },
          sound: it.sound || undefined
        };
      });
      if (capped.length) await plugin.schedule({ notifications: capped });
      return { mode: 'capacitor', scheduled: capped.length };
    } catch (e) {
      return { mode: 'capacitor-error', scheduled: 0, error: e && e.message };
    }
  }

  async function sendTestNotification(title, body) {
    var ok = await requestNotificationPermissions();
    if (!ok) return { sent: false, reason: 'permission-denied' };
    var plugin = getLocalNotificationsPlugin();
    if (plugin && typeof plugin.schedule === 'function') {
      try {
        await plugin.schedule({
          notifications: [{
            id: 99991,
            title: title || 'Ibadah Quest',
            body: body || 'Assalamu Alaikum — test reminder received.',
            schedule: { at: new Date(Date.now() + 1500), allowWhileIdle: true }
          }]
        });
        return { sent: true, mode: 'capacitor' };
      } catch (e) {}
    }
    try {
      if (navigator.serviceWorker && navigator.serviceWorker.ready) {
        var reg = await navigator.serviceWorker.ready;
        if (reg && typeof reg.showNotification === 'function') {
          await reg.showNotification(title || 'Ibadah Quest', {
            body: body || 'Assalamu Alaikum — test reminder received.',
            icon: 'assets/icons/app-icon-192.png',
            badge: 'assets/icons/app-icon-192.png'
          });
          return { sent: true, mode: 'sw' };
        }
      }
    } catch (e) {}
    try {
      new Notification(title || 'Ibadah Quest', {
        body: body || 'Assalamu Alaikum — test reminder received.',
        icon: 'assets/icons/app-icon-192.png',
        badge: 'assets/icons/app-icon-192.png'
      });
      return { sent: true, mode: 'web' };
    } catch (e) {
      return { sent: false, reason: e && e.message };
    }
  }

  window.NativeBridge = {
    isCapacitorNative: isCapacitorNative,
    requestNotificationPermissions: requestNotificationPermissions,
    scheduleNativeBatch: scheduleNativeBatch,
    sendTestNotification: sendTestNotification
  };
})();
