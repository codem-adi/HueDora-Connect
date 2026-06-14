import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './layouts/AppLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CampsPage from './pages/CampsPage';
import CampFormPage from './pages/CampFormPage';
import ClientMastersPage from './pages/ClientMastersPage';
import ClientMasterFormPage from './pages/ClientMasterFormPage';
import ImportPage from './pages/ImportPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import UsersPage from './pages/UsersPage';

function PermissionRoute({ permissions, children }) {
  const { user, loading, hasPermission } = useAuth();
  const required = Array.isArray(permissions) ? permissions : [permissions];

  if (loading) return <div className="empty-state">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!required.some((permission) => hasPermission(permission))) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function StrictAdminRoute({ children }) {
  const { user, loading, isStrictAdmin } = useAuth();
  if (loading) return <div className="empty-state">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!isStrictAdmin()) return <Navigate to="/" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { user, loading, isAdminUser } = useAuth();
  if (loading) return <div className="empty-state">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdminUser()) return <Navigate to="/" replace />;
  return children;
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="empty-state">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="camps" element={<PermissionRoute permissions={['camps:read']}><CampsPage /></PermissionRoute>} />
        <Route path="camps/new" element={<PermissionRoute permissions={['camps:create', 'camps:update']}><CampFormPage /></PermissionRoute>} />
        <Route path="camps/:id/edit" element={<PermissionRoute permissions={['camps:update', 'camps:approve', 'camps:edit-pending']}><CampFormPage /></PermissionRoute>} />
        <Route path="client-masters" element={<PermissionRoute permissions={['client-masters:read']}><ClientMastersPage /></PermissionRoute>} />
        <Route path="client-masters/new" element={<PermissionRoute permissions={['client-masters:create']}><ClientMasterFormPage /></PermissionRoute>} />
        <Route path="client-masters/:id/edit" element={<PermissionRoute permissions={['client-masters:update']}><ClientMasterFormPage /></PermissionRoute>} />
        <Route path="import" element={<AdminRoute><ImportPage /></AdminRoute>} />
        <Route path="users" element={<StrictAdminRoute><UsersPage /></StrictAdminRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
