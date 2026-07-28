import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AcademicCapIcon, BellIcon, ChatBubbleLeftEllipsisIcon, MagnifyingGlassIcon, XMarkIcon, UserIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { BellIcon as BellSolid } from '@heroicons/react/24/solid';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import NotificationPanel from '../Notification/NotificationPanel';

export default function Header({ onSearch }) {
  const { user, isSuperAdmin, logout } = useAuth();
  const { unreadCount, unreadChatCount, unreadAnnouncementCount } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const userMenuRef = useRef(null);

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  // Close user menu on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { label: 'Feed', path: '/feed' },
    { label: 'Announcements', path: '/announcements' },
    { label: 'Messages', path: '/chat' },
  ];

  if (isSuperAdmin) {
    navItems.push({ label: 'Super Admin', path: '/super-admin' });
  }

  const roleLabel = (user?.role || 'student').replace('_', ' ').toUpperCase();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 lg:px-8 py-2.5 flex items-center justify-between gap-4">
      {/* Brand Logo & Title */}
      <div className="flex items-center gap-3 cursor-pointer flex-shrink-0" onClick={() => navigate('/feed')}>
        <div className="w-10 h-10 rounded-full bg-[#0F2B5C] flex items-center justify-center text-white shadow-sm">
          <AcademicCapIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-base font-bold text-slate-900 tracking-tight leading-none">PlacementHub</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">CAREER & PLACEMENT PORTAL</p>
        </div>
      </div>

      {/* Center Navigation Links */}
      <nav className="hidden md:flex items-center gap-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`relative px-4 py-1.5 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-blue-100 text-blue-700 shadow-none'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-1.5">
                {item.label}
                {item.path === '/announcements' && unreadAnnouncementCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                )}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Right Search, Actions & User Badge */}
      <div className="flex items-center gap-3">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="hidden lg:flex items-center relative w-64">
          <MagnifyingGlassIcon className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              onSearch?.(e.target.value);
            }}
            placeholder="Search opportunities, students..."
            className="w-full pl-9 pr-8 py-1.5 rounded-xl bg-slate-100/80 border border-slate-200/80 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => { setSearchQuery(''); onSearch?.(''); }}
              className="absolute right-2.5"
            >
              <XMarkIcon className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
            </button>
          )}
        </form>

        {/* Notifications Icon */}
        <div className="relative">
          <button
            id="btn-notifications"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
            title="Notifications"
          >
            {unreadCount > 0 ? (
              <BellSolid className="w-5 h-5 text-blue-600" />
            ) : (
              <BellIcon className="w-5 h-5" />
            )}
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full animate-ping" />
            )}
          </button>
          {showNotifications && (
            <NotificationPanel onClose={() => setShowNotifications(false)} />
          )}
        </div>

        {/* Direct Messages Shortcut */}
        <button
          onClick={() => navigate('/chat')}
          className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors hidden sm:block"
          title="Messages"
        >
          <ChatBubbleLeftEllipsisIcon className="w-5 h-5" />
          {unreadChatCount > 0 && (
            <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600 border border-white" />
            </span>
          )}
        </button>

        {/* User Badge with Dropdown */}
        <div className="relative" ref={userMenuRef}>
          <div
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 p-1 rounded-full hover:bg-slate-100 cursor-pointer transition-colors"
          >
            <div
              className="w-8 h-8 rounded-full bg-[#0F2B5C] text-white flex items-center justify-center font-bold text-xs shadow-sm flex-shrink-0"
              style={{ backgroundColor: user?.avatar_color || '#0F2B5C' }}
            >
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="hidden sm:block text-left pr-2">
              <h4 className="text-xs font-bold text-slate-900 leading-tight">{user?.name || 'User'}</h4>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{roleLabel}</p>
            </div>
          </div>

          {/* User Menu Dropdown (Simplified) */}
          {showUserMenu && (
            <div className="absolute right-0 top-12 w-60 bg-white rounded-3xl shadow-xl border border-slate-200/80 p-4 z-50 space-y-3 animate-in">
              {/* User Info Header */}
              <div>
                <h4 className="text-sm font-bold text-slate-900">{user?.name}</h4>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  {user?.register_number} {user?.department ? `· ${user.department}` : ''}
                </p>
              </div>

              {/* Actions */}
              <div className="border-t border-slate-100 pt-2 space-y-1 text-xs font-semibold text-slate-700">
                <button
                  onClick={() => { setShowUserMenu(false); navigate('/profile'); }}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors flex items-center gap-2"
                >
                  <UserIcon className="w-4 h-4 text-slate-500" />
                  <span>Profile & saved</span>
                </button>
                <button
                  onClick={() => { setShowUserMenu(false); logout(); navigate('/login'); }}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-red-50 text-red-600 transition-colors flex items-center gap-2"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
