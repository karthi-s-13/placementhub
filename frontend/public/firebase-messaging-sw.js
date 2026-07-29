// firebase-messaging-sw.js
// Service Worker for Firebase Cloud Messaging background push notifications.
// This file MUST live in /public so it is served from the root scope.

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// ⚠️  These values are intentionally hard-coded here because service workers
//    cannot access Vite environment variables at runtime.
firebase.initializeApp({
  apiKey: "AIzaSyCBatTU5674wov4KNuEC8_oV__vpoxzGhs",
  authDomain: "placementhub-a82a8.firebaseapp.com",
  projectId: "placementhub-a82a8",
  storageBucket: "placementhub-a82a8.firebasestorage.app",
  messagingSenderId: "567908377660",
  appId: "1:567908377660:web:7e73182663ea01ffb84f39",
});

const messaging = firebase.messaging();

/**
 * Handle background messages (tab closed or not focused).
 * The browser will show a native OS notification automatically.
 */
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Background message received:', payload);

  const { title, body, icon } = payload.notification ?? {};
  const notifTitle = title || 'PlacementHub';
  const notifOptions = {
    body: body || 'You have a new notification.',
    icon: icon || '/favicon.svg',
    badge: '/favicon.svg',
    data: payload.data || {},
    // Click opens the app
    click_action: payload.data?.link || self.location.origin,
  };

  self.registration.showNotification(notifTitle, notifOptions);
});

// Handle notification click → open/focus the app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.link || self.location.origin;
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
