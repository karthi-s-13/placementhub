import { useEffect, useState } from 'react';
import { onForegroundMessage } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';

/**
 * Play a pleasant 2-note notification chime using the Web Audio API.
 * No audio file required — generated entirely in-browser.
 */
function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();

    const notes = [
      { freq: 880, start: 0,    duration: 0.15 },  // A5
      { freq: 1174, start: 0.18, duration: 0.25 },  // D6
    ];

    notes.forEach(({ freq, start, duration }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);

      // Smooth fade-in then fade-out for a soft chime feel
      gain.gain.setValueAtTime(0, ctx.currentTime + start);
      gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + start + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);

      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    });

    // Close the AudioContext after the chime finishes to free resources
    setTimeout(() => ctx.close(), 800);
  } catch (e) {
    // Browsers may block audio before user interaction — silently ignore
    console.warn('[FCM] Could not play notification sound:', e.message);
  }
}

/**
 * FCMToast — sliding toast in the top-right corner when a push arrives
 * while the tab is open. Plays a chime on each new notification.
 */
export default function FCMToast() {
  const { user } = useAuth();
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = onForegroundMessage((payload) => {
      const { title, body } = payload.notification ?? {};
      const id = Date.now();

      // 🔔 Play chime
      playNotificationSound();

      setToasts((prev) => [
        ...prev,
        { id, title: title || 'PlacementHub', body: body || '' },
      ]);

      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 5000);
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [user]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-start gap-3 bg-white border border-slate-200
                     shadow-xl rounded-xl px-4 py-3 w-80"
          style={{ animation: 'fcmSlideIn 0.3s ease forwards' }}
        >
          {/* Bell icon */}
          <div className="flex-shrink-0 w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-lg">🔔</span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{toast.title}</p>
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{toast.body}</p>
          </div>

          {/* Dismiss */}
          <button
            onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
            className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors text-lg leading-none"
          >
            ×
          </button>
        </div>
      ))}

      <style>{`
        @keyframes fcmSlideIn {
          from { transform: translateX(110%); opacity: 0; }
          to   { transform: translateX(0);   opacity: 1; }
        }
      `}</style>
    </div>
  );
}
