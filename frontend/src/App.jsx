import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import FCMToast from './components/Notification/FCMToast';

// Auth pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';

// Main pages
import Feed from './pages/Feed';
import OpportunityDetail from './pages/OpportunityDetail';
import NewOpportunity from './pages/NewOpportunity';
import Announcements from './pages/Announcements';
import Chat from './pages/Chat';
import SavedJobs from './pages/SavedJobs';
import Profile from './pages/Profile';

// Super Admin page
import SuperAdmin from './pages/SuperAdmin';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function SuperAdminRoute({ children }) {
  const { user, isSuperAdmin } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!isSuperAdmin) return <Navigate to="/feed" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user } = useAuth();
  return user ? <Navigate to="/feed" replace /> : children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      {/* Protected */}
      <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
      <Route path="/opportunity/:id" element={<ProtectedRoute><OpportunityDetail /></ProtectedRoute>} />
      <Route path="/post" element={<ProtectedRoute><NewOpportunity /></ProtectedRoute>} />
      <Route path="/announcements" element={<ProtectedRoute><Announcements /></ProtectedRoute>} />
      <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
      <Route path="/chat/:channelId" element={<Navigate to="/chat" replace />} />
      <Route path="/saved" element={<ProtectedRoute><SavedJobs /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

      {/* Super Admin */}
      <Route path="/super-admin" element={<SuperAdminRoute><SuperAdmin /></SuperAdminRoute>} />
      <Route path="/admin" element={<Navigate to="/super-admin" replace />} />
      <Route path="/admin/students" element={<Navigate to="/super-admin" replace />} />

      {/* Default */}
      <Route path="/" element={<Navigate to="/feed" replace />} />
      <Route path="*" element={<Navigate to="/feed" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <FCMToast />
          <AppRoutes />
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
