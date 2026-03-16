import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useStaffAuth } from '../hooks/useStaffAuth';
import styles from './AdminLayout.module.css';
import FeatureSearch from '../components/FeatureSearch';

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

const ProfileIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

const LogoutIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
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

const RoadmapIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
        <line x1="9" y1="3" x2="9" y2="18" />
        <line x1="15" y1="6" x2="15" y2="21" />
    </svg>
);

export default function StaffLayout({ children }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const router = useRouter();
    const { user, logout, isAuthenticated, isLoading } = useStaffAuth();

    // Extract project ID from URL if present
    const { id: projectId } = router.query;

    const navItems = [
        { href: '/staff/dashboard', label: 'Dashboard', icon: DashboardIcon },
        { href: '/staff/projects', label: 'My Projects', icon: ProjectsIcon },
        { 
            href: projectId ? `/staff/projects/${projectId}/roadmap` : '/staff/projects', 
            label: 'Roadmap', 
            icon: RoadmapIcon 
        },
        { href: '/staff/mom', label: 'MOM', icon: MOMIcon },
        { href: '/staff/profile', label: 'My Profile', icon: ProfileIcon },
    ];

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
                    <FeatureSearch portal="staff" user={user} isCollapsed={isCollapsed} />
                    <ul className={styles.navList}>
                        {navItems.map((item, index) => {
                            const Icon = item.icon;
                            // Check for active state - either exact match or sub-path match for Roadmap
                            const isActive = router.pathname === item.href || 
                                           (item.label === 'Roadmap' && router.pathname.includes('/roadmap'));

                            return (
                                <li key={`${item.href}-${index}`} className={styles.navItem}>
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
