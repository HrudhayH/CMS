import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';
import styles from './AdminLayout.module.css';

// Icons
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
    { href: '/staff/dashboard', label: 'Dashboard', icon: DashboardIcon },
    { href: '/staff/projects', label: 'My Projects', icon: ProjectsIcon },
];

export default function StaffLayout({ children }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const router = useRouter();
    const { user, logout, isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
        setIsMobileOpen(false);
    }, [router.pathname]);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/staff/login');
        }
    }, [isLoading, isAuthenticated, router]);

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

    if (!isAuthenticated) {
        return null;
    }

    const handleLogout = () => {
        logout();
    };

    return (
        <div className={styles.adminLayout}>
            <div
                className={`${styles.overlay} ${isMobileOpen ? styles.overlayVisible : ''}`}
                onClick={() => setIsMobileOpen(false)}
            />

            <aside className={`
        ${styles.sidebar} 
        ${isCollapsed ? styles.sidebarCollapsed : ''} 
        ${isMobileOpen ? styles.sidebarOpen : ''}
      `}>
                <div className={styles.sidebarHeader}>
                    <Link href="/staff/dashboard" className={styles.logo}>
                        <div className={styles.logoIcon}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                            </svg>
                        </div>
                        <span className={styles.logoText}>Staff Portal</span>
                    </Link>
                    <button
                        className={styles.toggleBtn}
                        onClick={() => setIsCollapsed(!isCollapsed)}
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
                            {user?.email?.charAt(0).toUpperCase() || 'S'}
                        </div>
                        <div className={styles.userDetails}>
                            <div className={styles.userName}>{user?.name || user?.email || 'Staff'}</div>
                            <div className={styles.userRole}>Staff Member</div>
                        </div>
                    </div>
                    <button className={styles.logoutBtn} onClick={handleLogout}>
                        <LogoutIcon />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            <main className={`${styles.main} ${isCollapsed ? styles.mainCollapsed : ''}`}>
                <div className={styles.mobileHeader}>
                    <button
                        className={styles.burgerBtn}
                        onClick={() => setIsMobileOpen(true)}
                    >
                        <MenuIcon />
                    </button>
                    <span className={styles.mobileTitle}>Staff Portal</span>
                </div>

                <div className={styles.content}>
                    {children}
                </div>
            </main>
        </div>
    );
}
