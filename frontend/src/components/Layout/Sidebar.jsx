import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  HomeIcon, MegaphoneIcon, ChatBubbleLeftRightIcon,
  BookmarkIcon, UserIcon, ShieldCheckIcon,
  BriefcaseIcon, ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

export default function Sidebar() {
  const { user, isSuperAdmin, logout } = useAuth();
  const { unreadChatCount, unreadAnnouncementCount } = useNotifications();
  const navigate = useNavigate();

  const navItems = [
    { to: '/feed', icon: HomeIcon, label: 'Feed' },
    { to: '/announcements', icon: MegaphoneIcon, label: 'Announcements' },
    { to: '/chat', icon: ChatBubbleLeftRightIcon, label: 'Direct Chat' },
    { to: '/saved', icon: BookmarkIcon, label: 'Saved Jobs' },
    ...(isSuperAdmin ? [{ to: '/super-admin', icon: ShieldCheckIcon, label: 'Super Admin' }] : []),
    { to: '/profile', icon: UserIcon, label: 'Profile' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadge = (role) => {
    if (role === 'super_admin') return '👑 Super Admin';
    if (role === 'faculty') return '👨‍🏫 Faculty';
    return '🎓 Student';
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-100 h-screen sticky top-0 p-4">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-2 py-3 mb-6">
        <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-sm">
          <BriefcaseIcon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-base font-bold text-slate-900">PlacementHub</h1>
          <p className="text-xs text-slate-400">Class Career Portal</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `relative flex items-center gap-3 ${
                isActive ? 'nav-link-active' : 'nav-link'
              }`
            }
          >
            <div className="relative">
              <Icon className="w-5 h-5 flex-shrink-0" />
              {to === '/chat' && unreadChatCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-600 border-2 border-white rounded-full animate-pulse" />
              )}
              {to === '/announcements' && unreadAnnouncementCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-violet-600 border-2 border-white rounded-full animate-pulse" />
              )}
            </div>
            <span className="flex-1">{label}</span>
            {to === '/chat' && unreadChatCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                {unreadChatCount}
              </span>
            )}
            {to === '/announcements' && unreadAnnouncementCount > 0 && (
              <span className="bg-violet-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                {unreadAnnouncementCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User card */}
      <div className="mt-4 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-slate-50 transition-colors">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
            style={{ backgroundColor: user?.avatar_color || '#2563eb' }}
          >
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-800 truncate">{user?.name}</p>
            <p className="text-xs text-slate-400 capitalize">{getRoleBadge(user?.role)}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-500 text-slate-400 transition-colors"
            title="Logout"
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
