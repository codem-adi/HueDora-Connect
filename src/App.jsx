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
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="camps" element={<AdminRoute><CampsPage /></AdminRoute>} />
        <Route path="camps/new" element={<AdminRoute><CampFormPage /></AdminRoute>} />
        <Route path="camps/:id/edit" element={<AdminRoute><CampFormPage /></AdminRoute>} />
        <Route path="client-masters" element={<AdminRoute><ClientMastersPage /></AdminRoute>} />
        <Route path="client-masters/new" element={<AdminRoute><ClientMasterFormPage /></AdminRoute>} />
        <Route path="client-masters/:id/edit" element={<AdminRoute><ClientMasterFormPage /></AdminRoute>} />
        <Route path="import" element={<AdminRoute><ImportPage /></AdminRoute>} />
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
