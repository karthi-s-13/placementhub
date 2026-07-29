import { useEffect, useState } from 'react';
import { onForegroundMessage } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';

/**
 * FCMToast — renders a sliding toast in the top-right corner
 * whenever a Firebase push notification arrives while the app tab is open.
 */
export default function FCMToast() {
  const { user } = useAuth();
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = onForegroundMessage((payload) => {
      const { title, body } = payload.notification ?? {};
      const id = Date.now();

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
                     shadow-xl rounded-xl px-4 py-3 w-80 animate-slide-in"
          style={{ animation: 'slideIn 0.3s ease' }}
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

          {/* Dismiss button */}
          <button
            onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
            className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors text-lg leading-none"
          >
            ×
          </button>
        </div>
      ))}

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(110%); opacity: 0; }
          to   { transform: translateX(0);   opacity: 1; }
        }
      `}</style>
    </div>
  );
}
