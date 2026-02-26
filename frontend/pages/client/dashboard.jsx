import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { withClientLayout } from '../../layouts/ClientLayout';
import { getClientDashboardStats, getClientProjects } from '../../services/api';
import { useClientAuth } from '../../hooks/useClientAuth';

/* ---------- Icons ---------- */
const BriefcaseIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
);

const TrendingUpIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
    </svg>
);

const CheckCircleIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
);

const ClockIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);

const ArrowRightIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
    </svg>
);

const FolderIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
);

function ClientDashboard() {
    const router = useRouter();
    const { user } = useClientAuth();
    const [stats, setStats] = useState({ totalProjects: 0, inProgress: 0, completed: 0, onHold: 0 });
    const [recentProjects, setRecentProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const [statsRes, projectsRes] = await Promise.all([
                    getClientDashboardStats(),
                    getClientProjects(1, 5) // Fetch first 5 most recent
                ]);
                setStats(statsRes.data);
                setRecentProjects(projectsRes.data);
                setError('');
            } catch (err) {
                setError(err.message || 'Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const getGreeting = () => {
        const hour = currentTime.getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    const getStatusStyles = (status) => {
        const styles = {
            'New': { bg: '#f3f4f6', color: '#4b5563', border: '#e5e7eb' },
            'In Progress': { bg: '#eff6ff', color: '#1e40af', border: '#dbeafe' },
            'Completed': { bg: '#ecfdf5', color: '#065f46', border: '#d1fae5' },
            'On Hold': { bg: '#fff7ed', color: '#9a3412', border: '#ffedd5' },
        };
        return styles[status] || styles['In Progress'];
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="client-dashboard">
            <style jsx>{`
                .client-dashboard {
                    padding: 0;
                }

                .welcome-section {
                    margin-bottom: 32px;
                }

                .greeting {
                    font-size: 16px;
                    color: #3b82f6;
                    font-weight: 600;
                    margin-bottom: 4px;
                    display: block;
                }

                .welcome-title {
                    font-size: 28px;
                    font-weight: 700;
                    color: #1e293b;
                    margin: 0;
                }

                .welcome-banner {
                    background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
                    border-radius: 16px;
                    padding: 32px;
                    color: white;
                    margin-bottom: 32px;
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
                }

                .banner-content {
                    position: relative;
                    z-index: 2;
                    max-width: 600px;
                }

                .banner-title {
                    font-size: 24px;
                    font-weight: 700;
                    margin-bottom: 12px;
                }

                .banner-description {
                    font-size: 16px;
                    opacity: 0.8;
                    line-height: 1.6;
                    margin-bottom: 24px;
                }

                .banner-action {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    background: white;
                    color: #1e293b;
                    padding: 12px 24px;
                    border-radius: 10px;
                    font-weight: 600;
                    transition: all 0.2s;
                    cursor: pointer;
                    border: none;
                }

                .banner-action:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(255, 255, 255, 0.2);
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                    gap: 24px;
                    margin-bottom: 32px;
                }

                .stat-card {
                    background: white;
                    border-radius: 16px;
                    padding: 24px;
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    border: 1px solid #f1f5f9;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
                    transition: all 0.3s ease;
                }

                .stat-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 20px -5px rgba(0, 0, 0, 0.05);
                }

                .stat-icon {
                    width: 56px;
                    height: 56px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .stat-details {
                    flex: 1;
                }

                .stat-value {
                    font-size: 28px;
                    font-weight: 700;
                    color: #1e293b;
                    line-height: 1.2;
                }

                .stat-label {
                    font-size: 14px;
                    color: #64748b;
                    font-weight: 500;
                }

                .blue { background: #eff6ff; color: #3b82f6; }
                .orange { background: #fff7ed; color: #f97316; }
                .green { background: #f0fdf4; color: #22c55e; }
                .purple { background: #faf5ff; color: #a855f7; }

                .main-grid {
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    gap: 24px;
                }

                .card {
                    background: white;
                    border-radius: 16px;
                    padding: 24px;
                    border: 1px solid #f1f5f9;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
                }

                .card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                }

                .card-title {
                    font-size: 18px;
                    font-weight: 700;
                    color: #1e293b;
                    margin: 0;
                }

                .view-all {
                    font-size: 14px;
                    font-weight: 600;
                    color: #3b82f6;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    text-decoration: none;
                }

                .project-list {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .project-item {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 16px;
                    border-radius: 12px;
                    border: 1px solid #f8fafc;
                    transition: all 0.2s;
                    cursor: pointer;
                    background: #f8fafc;
                }

                .project-item:hover {
                    background: #f1f5f9;
                    border-color: #e2e8f0;
                    transform: translateX(4px);
                }

                .project-icon {
                    width: 44px;
                    height: 44px;
                    border-radius: 10px;
                    background: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #3b82f6;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }

                .project-info {
                    flex: 1;
                }

                .project-name {
                    font-size: 15px;
                    font-weight: 600;
                    color: #1e293b;
                    margin-bottom: 4px;
                }

                .project-date {
                    font-size: 13px;
                    color: #94a3b8;
                }

                .status-badge {
                    padding: 6px 12px;
                    border-radius: 8px;
                    font-size: 12px;
                    font-weight: 600;
                    border: 1px solid;
                }

                .quick-links {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .link-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 16px;
                    background: #f8fafc;
                    border-radius: 12px;
                    text-decoration: none;
                    color: #1e293b;
                    font-weight: 600;
                    transition: all 0.2s;
                }

                .link-item:hover {
                    background: #3b82f6;
                    color: white;
                }

                .link-item:hover .link-icon {
                    color: white;
                }

                .link-info {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .link-icon {
                    color: #3b82f6;
                }

                @media (max-width: 1024px) {
                    .main-grid {
                        grid-template-columns: 1fr;
                    }
                }

                @media (max-width: 640px) {
                    .stats-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>

            <div className="welcome-section">
                <span className="greeting">{getGreeting()}, {user?.name || 'Client'}! 👋</span>
                <h1 className="welcome-title">Client Dashboard</h1>
            </div>

            <div className="welcome-banner">
                <div className="banner-content">
                    <h2 className="banner-title">Welcome to your Project Portal</h2>
                    <p className="banner-description">
                        Track your ongoing projects, view real-time updates from our team, and manage your professional requests all in one place.
                    </p>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button className="banner-action" onClick={() => router.push('/client/projects')}>
                            Explore Projects
                            <ArrowRightIcon />
                        </button>
                        <button
                            className="banner-action"
                            style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
                            onClick={() => router.push('/client/mom')}
                        >
                            View Minutes
                        </button>
                    </div>
                </div>
                {/* Decorative Elements */}
                <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)', borderRadius: '50%' }}></div>
                <div style={{ position: 'absolute', bottom: '-20%', left: '10%', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)', borderRadius: '50%' }}></div>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
                    <div className="loading-spinner loading-spinner-lg"></div>
                </div>
            ) : error ? (
                <div style={{
                    padding: '24px',
                    background: '#fef2f2',
                    color: '#dc2626',
                    borderRadius: '12px',
                    marginBottom: '32px'
                }}>
                    {error}
                </div>
            ) : (
                <>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon blue">
                                <BriefcaseIcon />
                            </div>
                            <div className="stat-details">
                                <div className="stat-value">{stats.totalProjects}</div>
                                <div className="stat-label">Total Projects</div>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon orange">
                                <TrendingUpIcon />
                            </div>
                            <div className="stat-details">
                                <div className="stat-value">{stats.inProgress}</div>
                                <div className="stat-label">In Progress</div>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon green">
                                <CheckCircleIcon />
                            </div>
                            <div className="stat-details">
                                <div className="stat-value">{stats.completed}</div>
                                <div className="stat-label">Completed</div>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon purple">
                                <ClockIcon />
                            </div>
                            <div className="stat-details">
                                <div className="stat-value">{stats.onHold}</div>
                                <div className="stat-label">On Hold</div>
                            </div>
                        </div>
                    </div>

                    <div className="main-grid">
                        <div className="card">
                            <div className="card-header">
                                <h3 className="card-title">Recent Projects</h3>
                                <a href="/client/projects" className="view-all">
                                    View All
                                    <ArrowRightIcon />
                                </a>
                            </div>

                            {recentProjects.length === 0 ? (
                                <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                                    No projects found in your account.
                                </div>
                            ) : (
                                <div className="project-list">
                                    {recentProjects.map((project) => {
                                        const styles = getStatusStyles(project.status);
                                        return (
                                            <div
                                                key={project._id}
                                                className="project-item"
                                                onClick={() => router.push(`/client/projects/${project._id}`)}
                                            >
                                                <div className="project-icon">
                                                    <FolderIcon />
                                                </div>
                                                <div className="project-info">
                                                    <div className="project-name">{project.title}</div>
                                                    <div className="project-date">Last updated: {formatDate(project.updatedAt)}</div>
                                                </div>
                                                <div
                                                    className="status-badge"
                                                    style={{
                                                        background: styles.bg,
                                                        color: styles.color,
                                                        borderColor: styles.border
                                                    }}
                                                >
                                                    {project.status}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="card">
                            <div className="card-header">
                                <h3 className="card-title">Quick Actions</h3>
                            </div>
                            <div className="quick-links">
                                <a href="/client/projects" className="link-item">
                                    <div className="link-info">
                                        <BriefcaseIcon className="link-icon" />
                                        <span>My Projects</span>
                                    </div>
                                    <ArrowRightIcon />
                                </a>
                                <a href="/client/updates" className="link-item">
                                    <div className="link-info">
                                        <ClockIcon className="link-icon" />
                                        <span>Daily Updates</span>
                                    </div>
                                    <ArrowRightIcon />
                                </a>
                                <a href="/client/profile" className="link-item">
                                    <div className="link-info">
                                        <TrendingUpIcon className="link-icon" />
                                        <span>My Profile</span>
                                    </div>
                                    <ArrowRightIcon />
                                </a>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default withClientLayout(ClientDashboard);
