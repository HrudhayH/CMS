import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from './ClientLayout.module.css';
import { useClientAuth } from '../hooks/useClientAuth';

// Icons as simple SVG components
// ... (icons remain the same)
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

const UpdatesIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
);

const ProfileIcon = () => (
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

const navItems = [
    { href: '/client/dashboard', label: 'Dashboard', icon: DashboardIcon },
    { href: '/client/projects', label: 'Projects', icon: ProjectsIcon },
    { href: '/client/updates', label: 'Daily Updates', icon: UpdatesIcon },
    { href: '/client/profile', label: 'Profile', icon: ProfileIcon },
];

export default function ClientLayout({ children }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const { logout, user } = useClientAuth();
    const router = useRouter();

    // Close mobile sidebar on route change
    useEffect(() => {
        setIsMobileOpen(false);
    }, [router.pathname]);

    const handleLogout = () => {
        logout();
    };

    const activePageTitle = navItems.find(item => item.href === router.pathname)?.label || 'Client Portal';

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
                    <Link href="/client/dashboard" className={styles.logo}>
                        <div className={styles.logoIcon}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                            </svg>
                        </div>
                        <span className={styles.logoText}>Client Portal</span>
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
                        {navItems.map((item) => {
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
                    </ul>
                </nav>

                <div className={styles.userSection}>
                    <div className={styles.userInfo}>
                        <div className={styles.userAvatar}>
                            {user?.name?.charAt(0) || 'C'}
                        </div>
                        <div className={styles.userDetails}>
                            <div className={styles.userName}>{user?.name || 'Client'}</div>
                            <div className={styles.userRole}>Portal Access</div>
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
                    <span className={styles.mobileTitle}>Client Portal</span>
                </div>

                {/* Page content header */}
                <header className={styles.header}>
                    <div className={styles.headerLeft}>
                        <h2 className={styles.pageTitle}>{activePageTitle}</h2>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ textAlign: 'right', display: isCollapsed ? 'none' : 'block' }}>
                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>{user?.name || 'Client'}</div>
                        </div>
                        <div className={styles.userAvatar} style={{ width: '32px', height: '32px' }}>{user?.name?.charAt(0) || 'C'}</div>
                    </div>
                </header>

                {/* Page content */}
                <div className={styles.content}>
                    {children}
                </div>
            </main>
        </div>
    );
}

// HOC to wrap pages with ClientLayout
export function withClientLayout(Component) {
    return function WrappedComponent(props) {
        return (
            <ClientLayout>
                <Component {...props} />
            </ClientLayout>
        );
    };
}
