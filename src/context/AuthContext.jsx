import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/endpoints';
import { clearAuthSession, setUnauthorizedHandler } from '../services/authSession';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
      navigate('/login', { replace: true });
    });
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setLoading(false);
      return;
    }

    authApi
      .me()
      .then(({ data }) => setUser(data.user))
      .catch(() => {
        clearAuthSession();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo(() => {
    function checkPermission(permission) {
      if (!user) return false;
      if (user.role === 'super_admin') return true;
      const map = {
        admin: [
          'camps:read', 'camps:create', 'camps:update', 'camps:approve', 'camps:execute',
          'camps:cancel', 'dashboard:read', 'clients:read', 'clients:create',
          'clients:update', 'clients:delete', 'import:read', 'import:create',
          'client-masters:read', 'client-masters:create', 'client-masters:update', 'client-masters:delete',
          'users:read', 'users:create', 'users:update', 'campaigns:read',
        ],
        operations_executive: [
          'dashboard:read', 'clients:read', 'campaigns:read',
          'camps:read', 'camps:create', 'camps:update', 'camps:execute',
          'client-masters:read', 'client-masters:create', 'client-masters:update',
        ],
        reviewer: [
          'camps:read', 'camps:review', 'camps:edit-pending',
          'dashboard:read', 'clients:read', 'campaigns:read', 'client-masters:read',
        ],
        read_only: [
          'camps:read', 'dashboard:read', 'clients:read', 'campaigns:read', 'client-masters:read',
        ],
      };
      return (map[user.role] || []).includes(permission);
    }

    return {
      user,
      loading,
      async login(email, password) {
        const { data } = await authApi.login(email, password);
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        setUser(data.user);
        return data.user;
      },
      async logout() {
        try {
          await authApi.logout();
        } catch {
          // Session may already be expired; still clear local state.
        } finally {
          clearAuthSession();
          setUser(null);
          navigate('/login', { replace: true });
        }
      },
      hasPermission: checkPermission,
      canReviewCamps() {
        return checkPermission('camps:approve') || checkPermission('camps:review');
      },
      canApproveCamps() {
        return checkPermission('camps:approve') || checkPermission('camps:review');
      },
      canRejectCamps() {
        return checkPermission('camps:approve');
      },
      canEditCampRecord(camp) {
        if (!camp) return false;
        if (checkPermission('camps:update') || checkPermission('camps:approve')) {
          return ['pending_review', 'approved', 'rejected'].includes(camp.status);
        }
        if (checkPermission('camps:edit-pending')) {
          return camp.status === 'pending_review';
        }
        return false;
      },
      isAdminUser() {
        return user?.role === 'admin' || user?.role === 'super_admin';
      },
      isStrictAdmin() {
        return user?.role === 'admin';
      },
      isSuperAdmin() {
        return user?.role === 'super_admin';
      },
    };
  }, [user, loading, navigate]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
