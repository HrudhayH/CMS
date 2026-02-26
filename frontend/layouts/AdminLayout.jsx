import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';
import styles from './AdminLayout.module.css';

// Icons as simple SVG components
const DashboardIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);

const ProjectsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

const ClientsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const StaffIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const LogoutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const PaymentsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);

const AdminsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const MOMIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: DashboardIcon, permission: 'view_dashboard' },
  { href: '/admin/projects', label: 'Projects', icon: ProjectsIcon, permission: 'manage_projects' },
  { href: '/admin/clients', label: 'Clients', icon: ClientsIcon, permission: 'manage_clients' },
  { href: '/admin/staff', label: 'Staff', icon: StaffIcon, permission: 'manage_staff' },
  { href: '/admin/payments', label: 'Payments', icon: PaymentsIcon, permission: 'manage_payments' },
  { href: '/admin/mom', label: 'MOM', icon: MOMIcon, permission: 'view_dashboard' },
];

export default function AdminLayout({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const router = useRouter();
  const { user, logout, isAuthenticated, isLoading } = useAuth();

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [router.pathname]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh'
      }}>
        <div className="loading-spinner loading-spinner-lg"></div>
      </div>
    );
  }

  // Don't render layout if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    logout();
  };

  return (
    <div className={styles.adminLayout}>
      {/* Mobile overlay */}
      <div
        className={`${styles.overlay} ${isMobileOpen ? styles.overlayVisible : ''}`}
        onClick={() => setIsMobileOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`
        ${styles.sidebar} 
        ${isCollapsed ? styles.sidebarCollapsed : ''} 
        ${isMobileOpen ? styles.sidebarOpen : ''}
      `}>
        <div className={styles.sidebarHeader}>
          <Link href="/admin/dashboard" className={styles.logo}>
            <div className={styles.logoIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className={styles.logoText}>CMS Admin</span>
          </Link>
          <button
            className={styles.toggleBtn}
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </button>
        </div>

        <nav className={styles.nav}>
          <ul className={styles.navList}>
            {navItems
              .filter((item) => {
                // Super admins see everything
                if (user?.role === 'super_admin') return true;
                // Regular admins see only permitted items
                return user?.permissions?.includes(item.permission);
              })
              .map((item) => {
                const Icon = item.icon;
                const isActive = router.pathname === item.href;

                return (
                  <li key={item.href} className={styles.navItem}>
                    <Link
                      href={item.href}
                      className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
                    >
                      <span className={styles.navIcon}>
                        <Icon />
                      </span>
                      <span className={styles.navText}>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            {/* Show Manage Admins only for super_admin */}
            {user?.role === 'super_admin' && (
              <li className={styles.navItem}>
                <Link
                  href="/admin/manage-admins"
                  className={`${styles.navLink} ${router.pathname === '/admin/manage-admins' ? styles.navLinkActive : ''}`}
                >
                  <span className={styles.navIcon}>
                    <AdminsIcon />
                  </span>
                  <span className={styles.navText}>Manage Admins</span>
                </Link>
              </li>
            )}
          </ul>
        </nav>

        <div className={styles.userSection}>
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>
              {user?.email?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className={styles.userDetails}>
              <div className={styles.userName}>{user?.name || user?.email || 'Admin'}</div>
              <div className={styles.userRole}>{user?.role === 'super_admin' ? 'Super Admin' : 'Administrator'}</div>
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <LogoutIcon />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <main className={`${styles.main} ${isCollapsed ? styles.mainCollapsed : ''}`}>
        {/* Mobile header */}
        <div className={styles.mobileHeader}>
          <button
            className={styles.burgerBtn}
            onClick={() => setIsMobileOpen(true)}
            aria-label="Open menu"
          >
            <MenuIcon />
          </button>
          <span className={styles.mobileTitle}>CMS Admin</span>
        </div>

        {/* Page content */}
        <div className={styles.content}>
          {children}
        </div>
      </main>
    </div>
  );
}

// HOC to wrap pages with AdminLayout
export function withAdminLayout(Component) {
  return function WrappedComponent(props) {
    return (
      <AdminLayout>
        <Component {...props} />
      </AdminLayout>
    );
  };
}
