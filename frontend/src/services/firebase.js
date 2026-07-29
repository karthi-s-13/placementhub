import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import api from './api';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

/**
 * Request notification permission, retrieve the FCM token, and save it to the backend.
 * Call this once after the user logs in.
 */
export async function requestNotificationPermission() {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.info('[FCM] Notification permission denied.');
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: await navigator.serviceWorker.register(
        '/firebase-messaging-sw.js',
        { scope: '/' }
      ),
    });

    if (token) {
      // Persist token so we can remove it on logout
      localStorage.setItem('fcm_token', token);
      // Register with backend
      await api.post('/api/notifications/fcm-token', { token });
      console.info('[FCM] Token registered:', token.slice(0, 20) + '…');
    }
    return token;
  } catch (err) {
    console.error('[FCM] Failed to get/register token:', err);
    return null;
  }
}

/**
 * Remove the FCM token from the backend on logout.
 */
export async function unregisterFCMToken() {
  const token = localStorage.getItem('fcm_token');
  if (!token) return;
  try {
    await api.delete('/api/notifications/fcm-token', { data: { token } });
    localStorage.removeItem('fcm_token');
  } catch (err) {
    console.warn('[FCM] Failed to unregister token:', err);
  }
}

/**
 * Listen for foreground messages (app is open/focused).
 * Pass a callback to handle the notification (e.g. show a toast).
 */
export function onForegroundMessage(callback) {
  return onMessage(messaging, (payload) => {
    console.info('[FCM] Foreground message:', payload);
    callback(payload);
  });
}
