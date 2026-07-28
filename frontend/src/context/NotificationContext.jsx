import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await api.get('/api/notifications/');
      setNotifications(data || []);
      setUnreadCount((data || []).filter(n => !n.is_read).length);
    } catch { /* ignore */ }
  }, [user]);

  const fetchUnreadChatCount = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await api.get('/api/chat/users');
      const totalUnread = (data || []).reduce((acc, u) => acc + (u.unread_count || 0), 0);
      setUnreadChatCount(totalUnread);
    } catch { /* ignore */ }
  }, [user]);

  const markAsRead = useCallback(async (id) => {
    try {
      await api.patch(`/api/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch { /* ignore */ }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await api.patch('/api/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch { /* ignore */ }
  }, []);

  const clearAll = useCallback(async () => {
    try {
      await api.delete('/api/notifications/clear-all');
      setNotifications([]);
      setUnreadCount(0);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadChatCount();

    const interval = setInterval(() => {
      fetchNotifications();
      fetchUnreadChatCount();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications, fetchUnreadChatCount]);

  const unreadAnnouncementCount = (notifications || []).filter(
    (n) => !n.is_read && n.type === 'announcement'
  ).length;

  return (
    <NotificationContext.Provider value={{
      notifications, unreadCount, unreadAnnouncementCount, fetchNotifications, markAsRead, markAllAsRead, clearAll,
      unreadChatCount, fetchUnreadChatCount
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
