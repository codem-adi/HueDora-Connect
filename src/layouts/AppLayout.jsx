import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SIDEBAR_COLLAPSED_KEY = 'k-dashboard-sidebar-collapsed';

const pageTitles = {
  '/': { title: 'Dashboard', subtitle: 'Camp operations overview' },
  '/camps': { title: 'Camps', subtitle: 'Review, approve, execute and manage camps' },
  '/client-masters': { title: 'Client Master', subtitle: 'Manage client program, pricing and camp configuration' },
  '/import': { title: 'Excel Import', subtitle: 'Upload, map headers, preview and import camps' },
};

function getPageMeta(pathname) {
  if (pathname.endsWith('/edit')) {
    if (pathname.startsWith('/client-masters')) {
      return { title: 'Edit Client Master', subtitle: 'Update client program and camp configuration' };
    }
    return { title: 'Edit Camp', subtitle: 'Correct camp details and save until execution' };
  }
  if (pathname === '/camps/new') {
    return { title: 'Create Camp', subtitle: 'Add a new camp manually' };
  }
  if (pathname === '/client-masters/new') {
    return { title: 'New Client Master', subtitle: 'Add client program and camp configuration' };
  }
  return pageTitles[pathname] || { title: 'Camp Operations', subtitle: '' };
}

function IconDashboard() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z" fill="currentColor" />
    </svg>
  );
}

function IconCamps() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h10v2H4v-2z" fill="currentColor" />
    </svg>
  );
}

function IconClients() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm-7 8a7 7 0 0 1 14 0H5z" fill="currentColor" />
    </svg>
  );
}

function IconImport() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3 8 7h3v6h2V7h3l-4-4zm-7 14h14v2H5v-2z" fill="currentColor" />
    </svg>
  );
}

function IconLogout() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h5v-2H5V5h5V3zm4.7 4.3-1.4 1.4L15.2 11H3v2h12.2l-1.9 1.9 1.4 1.4L20 12l-5.3-4.7z" fill="currentColor" />
    </svg>
  );
}

function IconCollapse({ collapsed }) {
  return collapsed ? (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M13 5v14l6-7-6-7zm-8 0v14h2V5H5z" fill="currentColor" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M11 5v14l-6-7 6-7zm8 0v14h-2V5h2z" fill="currentColor" />
    </svg>
  );
}

function NavItem({ to, end, label, icon, collapsed }) {
  return (
    <NavLink
      to={to}
      end={end}
      title={collapsed ? label : undefined}
      className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
    >
      <span className="nav-link-icon">{icon}</span>
      <span className="nav-link-label">{label}</span>
    </NavLink>
  );
}

export default function AppLayout() {
  const { user, logout, isAdminUser, hasPermission } = useAuth();
  const { pathname } = useLocation();
  const meta = getPageMeta(pathname);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => (
    localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === '1'
  ));
  const showNewCampButton = pathname === '/camps'
    && (hasPermission('camps:create') || hasPermission('camps:update'));

  useEffect(() => {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, sidebarCollapsed ? '1' : '0');
  }, [sidebarCollapsed]);

  const userInitial = user?.name?.trim()?.charAt(0)?.toUpperCase() || '?';

  async function handleLogoutConfirm() {
    setShowLogoutConfirm(false);
    await logout();
  }

  return (
    <div className={`app-shell${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}>
      <aside className={`sidebar${sidebarCollapsed ? ' is-collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="brand">
            <span className="brand-mark" aria-hidden="true">
              <span className="brand-mark-letter">H</span>
              <span className="brand-mark-spectrum" />
            </span>
            <div className="brand-text">
              <h1>HueDora Connect</h1>
              <p>Healthcare Camp Operations</p>
            </div>
          </div>
          <button
            type="button"
            className="sidebar-toggle"
            onClick={() => setSidebarCollapsed((value) => !value)}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <IconCollapse collapsed={sidebarCollapsed} />
          </button>
        </div>
        <nav className="nav-list">
          <NavItem to="/" end label="Dashboard" icon={<IconDashboard />} collapsed={sidebarCollapsed} />
          {isAdminUser() && (
            <>
              <NavItem to="/camps" label="Camps" icon={<IconCamps />} collapsed={sidebarCollapsed} />
              <NavItem to="/client-masters" label="Client Master" icon={<IconClients />} collapsed={sidebarCollapsed} />
              <NavItem to="/import" label="Excel Import" icon={<IconImport />} collapsed={sidebarCollapsed} />
            </>
          )}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user" title={sidebarCollapsed ? `${user?.name} (${user?.role?.replaceAll('_', ' ')})` : undefined}>
            <span className="sidebar-user-avatar" aria-hidden="true">{userInitial}</span>
            <div className="sidebar-user-details">
              <div className="sidebar-user-name">{user?.name}</div>
              <span className="sidebar-role-badge">{user?.role?.replaceAll('_', ' ')}</span>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-secondary sidebar-logout-btn"
            title={sidebarCollapsed ? 'Logout' : undefined}
            onClick={() => setShowLogoutConfirm(true)}
          >
            <span className="sidebar-logout-icon" aria-hidden="true">
              <IconLogout />
            </span>
            <span className="sidebar-logout-label">Logout</span>
          </button>
        </div>
      </aside>
      <main className="main-panel">
        <div className="topbar">
          <div className="topbar-copy">
            <h2>{meta.title}</h2>
            {meta.subtitle && <p>{meta.subtitle}</p>}
          </div>
          {showNewCampButton && (
            <Link to="/camps/new" className="btn btn-primary topbar-action">
              New Camp
            </Link>
          )}
        </div>
        <div className="page-content">
          <Outlet />
        </div>
      </main>

      {showLogoutConfirm && (
        <div className="modal-overlay" onClick={() => setShowLogoutConfirm(false)}>
          <div
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="logout-modal-title">Logout</h2>
            <p className="modal-message">Are you sure you want to logout?</p>
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowLogoutConfirm(false)}>
                Cancel
              </button>
              <button type="button" className="btn btn-danger" onClick={handleLogoutConfirm}>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
