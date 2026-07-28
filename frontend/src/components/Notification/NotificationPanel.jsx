import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatTimeAgo } from '../../utils/date';
import { useNotifications } from '../../context/NotificationContext';
import { BriefcaseIcon, MegaphoneIcon, ChatBubbleLeftIcon, ClockIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';

const typeIcon = {
  new_opportunity: BriefcaseIcon,
  announcement: MegaphoneIcon,
  comment_reply: ChatBubbleLeftIcon,
  deadline: ClockIcon,
  approval: CheckIcon,
};

const typeColor = {
  new_opportunity: 'text-primary-600 bg-primary-50',
  announcement: 'text-violet-600 bg-violet-50',
  comment_reply: 'text-emerald-600 bg-emerald-50',
  deadline: 'text-red-500 bg-red-50',
  approval: 'text-amber-600 bg-amber-50',
};

export default function NotificationPanel({ onClose }) {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        const btn = document.getElementById('btn-notifications');
        if (!btn?.contains(e.target)) onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const handleClick = (notif) => {
    if (!notif.is_read) markAsRead(notif.id);
    if (notif.type === 'new_opportunity' && notif.reference_id) {
      navigate(`/opportunity/${notif.reference_id}`);
    } else if (notif.type === 'announcement') {
      navigate('/announcements');
    } else if (notif.type === 'comment_reply' && notif.reference_id) {
      navigate(`/opportunity/${notif.reference_id}`);
    }
    onClose();
  };

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-card-hover border border-slate-100 z-50 animate-in overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-slate-800">Notifications</h3>
          {unreadCount > 0 && (
            <span className="badge-blue">{unreadCount} new</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} className="text-xs text-primary-600 hover:text-primary-700 font-medium px-2 py-1 rounded-lg hover:bg-primary-50 transition-colors">
              Mark all read
            </button>
          )}
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="max-h-96 overflow-y-auto divide-y divide-slate-50">
        {notifications.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <BriefcaseIcon className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-sm text-slate-400">No notifications yet</p>
          </div>
        ) : (
          notifications.map((notif) => {
            const Icon = typeIcon[notif.type] || BriefcaseIcon;
            const colorClass = typeColor[notif.type] || 'text-slate-500 bg-slate-50';
            return (
              <button
                key={notif.id}
                onClick={() => handleClick(notif)}
                className={`w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors ${
                  !notif.is_read ? 'bg-primary-50/30' : ''
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${colorClass}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${!notif.is_read ? 'text-slate-900' : 'text-slate-700'}`}>
                    {notif.title}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notif.message}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {formatTimeAgo(notif.created_at)}
                  </p>
                </div>
                {!notif.is_read && (
                  <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-2" />
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
