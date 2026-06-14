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

  const value = useMemo(
    () => ({
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
      hasPermission(permission) {
        if (!user) return false;
        if (user.role === 'super_admin') return true;
        const map = {
          admin: [
            'camps:read', 'camps:create', 'camps:update', 'camps:approve', 'camps:execute',
            'camps:cancel', 'camps:reschedule', 'dashboard:read', 'clients:read', 'clients:create',
            'clients:update', 'clients:delete', 'import:read', 'import:create',
            'client-masters:read', 'client-masters:create', 'client-masters:update', 'client-masters:delete',
          ],
          operations_executive: ['dashboard:read', 'clients:read'],
          reviewer: ['camps:read', 'camps:review', 'dashboard:read', 'clients:read'],
          read_only: ['camps:read', 'dashboard:read', 'clients:read'],
        };
        return (map[user.role] || []).includes(permission);
      },
      isAdminUser() {
        return user?.role === 'admin' || user?.role === 'super_admin';
      },
      isSuperAdmin() {
        return user?.role === 'super_admin';
      },
    }),
    [user, loading, navigate]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
