import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  HomeIcon, MegaphoneIcon, ChatBubbleLeftRightIcon,
  BookmarkIcon, UserIcon, ShieldCheckIcon
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeSolid, MegaphoneIcon as MegaphoneSolid,
  ChatBubbleLeftRightIcon as ChatSolid, BookmarkIcon as BookmarkSolid,
  UserIcon as UserSolid, ShieldCheckIcon as ShieldSolid
} from '@heroicons/react/24/solid';

export default function BottomNav() {
  const { isSuperAdmin } = useAuth();
  const { unreadChatCount, unreadAnnouncementCount } = useNotifications();

  const items = [
    { to: '/feed', icon: HomeIcon, activeIcon: HomeSolid, label: 'Home' },
    { to: '/announcements', icon: MegaphoneIcon, activeIcon: MegaphoneSolid, label: 'News' },
    { to: '/chat', icon: ChatBubbleLeftRightIcon, activeIcon: ChatSolid, label: 'Chat' },
    ...(isSuperAdmin ? [{ to: '/super-admin', icon: ShieldCheckIcon, activeIcon: ShieldSolid, label: 'Admin' }] : [{ to: '/saved', icon: BookmarkIcon, activeIcon: BookmarkSolid, label: 'Saved' }]),
    { to: '/profile', icon: UserIcon, activeIcon: UserSolid, label: 'Profile' },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-100 shadow-nav">
      <div className="flex items-center justify-around px-2 py-1.5">
        {items.map(({ to, icon: Icon, activeIcon: ActiveIcon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-150 min-w-[56px] ${
                isActive
                  ? 'text-primary-600'
                  : 'text-slate-400 hover:text-slate-600'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  {isActive ? (
                    <ActiveIcon className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                  {to === '/chat' && unreadChatCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-600 border-2 border-white rounded-full animate-pulse" />
                  )}
                  {to === '/announcements' && unreadAnnouncementCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-violet-600 border-2 border-white rounded-full animate-pulse" />
                  )}
                </div>
                <span className="text-[10px] font-medium">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
