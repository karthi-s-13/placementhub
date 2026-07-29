import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { requestNotificationPermission, unregisterFCMToken } from '../services/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('ph_user');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/login', { email, password });
      localStorage.setItem('ph_token', data.access_token);
      localStorage.setItem('ph_user', JSON.stringify(data.user));
      setUser(data.user);
      // Request FCM push permission after successful login
      requestNotificationPermission().catch(() => {});
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.detail || 'Login failed' };
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (payload) => {
    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/register', payload);
      localStorage.setItem('ph_token', data.access_token);
      localStorage.setItem('ph_user', JSON.stringify(data.user));
      setUser(data.user);
      // Request FCM push permission after successful registration
      requestNotificationPermission().catch(() => {});
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.detail || 'Registration failed' };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    // Remove FCM token from backend before clearing auth
    unregisterFCMToken().catch(() => {});
    localStorage.removeItem('ph_token');
    localStorage.removeItem('ph_user');
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await api.get('/api/auth/me');
      localStorage.setItem('ph_user', JSON.stringify(data));
      setUser(data);
    } catch { /* ignore */ }
  }, []);

  const isSuperAdmin = user?.role === 'super_admin';
  const isFaculty = user?.role === 'faculty';
  const isStudent = user?.role === 'student';

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser, isSuperAdmin, isFaculty, isStudent }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
