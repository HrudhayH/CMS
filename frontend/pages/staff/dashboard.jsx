import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import StaffLayout from '../../layouts/staffLayout';

/* ---------- Dummy Data ---------- */
const DUMMY_STATS = {
    totalProjects: 3,
    inProgress: 1,
    completed: 2,
    pendingTasks: 5,
};

const DUMMY_RECENT_PROJECTS = [
    {
        id: 1,
        title: 'Ayurveda Website',
        status: 'In Progress',
        progress: 65,
        updatedAt: '2026-01-28',
    },
    {
        id: 2,
        title: 'CMS Dashboard',
        status: 'Completed',
        progress: 100,
        updatedAt: '2026-01-15',
    },
];

const DUMMY_RECENT_ACTIVITIES = [
    { action: 'Updated project requirements', project: 'Ayurveda Website', time: '2 hours ago' },
    { action: 'Completed milestone review', project: 'CMS Dashboard', time: '5 hours ago' },
    { action: 'Submitted weekly report', project: 'Diet App', time: '1 day ago' },
];

/* ---------- Icons ---------- */
const BriefcaseIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
);

const TrendingUpIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
    </svg>
);

const CheckCircleIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
);

const ClipboardIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </svg>
);

const ArrowRightIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
    </svg>
);

const ClockIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);

const FolderIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
);

const ActivityIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
);

export default function StaffDashboard() {
    const router = useRouter();
    const [stats] = useState(DUMMY_STATS);
    const [recentProjects] = useState(DUMMY_RECENT_PROJECTS);
    const [activities] = useState(DUMMY_RECENT_ACTIVITIES);
    const [currentTime, setCurrentTime] = useState(new Date());

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

    const getStatusColor = (status) => {
        const colors = {
            'In Progress': { bg: '#eff6ff', color: '#1e40af', border: '#3b82f6' },
            'Completed': { bg: '#ecfdf5', color: '#065f46', border: '#10b981' },
            'On Hold': { bg: '#fef3c7', color: '#92400e', border: '#f59e0b' },
        };
        return colors[status] || colors['In Progress'];
    };

    return (
        <div className="dashboard-page">
            <style jsx>{`
                .dashboard-page {
                    padding: var(--spacing-6);
                    background: #fafbfc;
                    min-height: 100vh;
                }

                .page-header {
                    margin-bottom: var(--spacing-6);
                }

                .page-title {
                    font-size: 28px;
                    font-weight: 700;
                    color: #1a1a1a;
                    margin: 0 0 var(--spacing-2) 0;
                }

                .page-subtitle {
                    font-size: 16px;
                    color: #6b7280;
                    margin: 0;
                }

                .greeting-text {
                    font-size: 18px;
                    font-weight: 600;
                    color: #3b82f6;
                    margin-bottom: var(--spacing-1);
                }

                .welcome-banner {
                    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                    border-radius: 12px;
                    padding: var(--spacing-6);
                    margin-bottom: var(--spacing-6);
                    color: white;
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
                }

                .banner-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .banner-text h2 {
                    font-size: 24px;
                    font-weight: 700;
                    margin: 0 0 var(--spacing-2) 0;
                }

                .banner-text p {
                    font-size: 15px;
                    margin: 0;
                    opacity: 0.9;
                }

                .banner-action {
                    display: inline-flex;
                    align-items: center;
                    gap: var(--spacing-2);
                    padding: 12px 24px;
                    background: white;
                    color: #3b82f6;
                    border-radius: 8px;
                    font-weight: 600;
                    text-decoration: none;
                    transition: all 0.2s ease;
                    cursor: pointer;
                    border: none;
                }

                .banner-action:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(255, 255, 255, 0.3);
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                    gap: var(--spacing-5);
                    margin-bottom: var(--spacing-6);
                }

                .stat-card {
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 12px;
                    padding: var(--spacing-5);
                    transition: all 0.2s ease;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
                }

                .stat-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
                }

                .stat-card-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                }

                .stat-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                }

                .stat-icon.blue {
                    background: #3b82f6;
                }

                .stat-icon.green {
                    background: #10b981;
                }

                .stat-icon.purple {
                    background: #8b5cf6;
                }

                .stat-icon.orange {
                    background: #f59e0b;
                }

                .stat-details {
                    flex: 1;
                    text-align: right;
                }

                .stat-label {
                    font-size: 13px;
                    font-weight: 600;
                    color: #6b7280;
                    margin-bottom: var(--spacing-1);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .stat-value {
                    font-size: 32px;
                    font-weight: 800;
                    color: #1a1a1a;
                    line-height: 1;
                }

                .content-grid {
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    gap: var(--spacing-5);
                }

                .card {
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 12px;
                    padding: var(--spacing-5);
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
                }

                .card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: var(--spacing-4);
                    padding-bottom: var(--spacing-3);
                    border-bottom: 1px solid #f3f4f6;
                }

                .card-title {
                    font-size: 18px;
                    font-weight: 700;
                    color: #1a1a1a;
                    margin: 0;
                }

                .view-all-link {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 14px;
                    font-weight: 600;
                    color: #3b82f6;
                    text-decoration: none;
                    transition: all 0.2s ease;
                }

                .view-all-link:hover {
                    gap: 8px;
                }

                .project-item {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-3);
                    padding: var(--spacing-3);
                    background: #fafbfc;
                    border-radius: 8px;
                    margin-bottom: var(--spacing-3);
                    transition: all 0.2s ease;
                    cursor: pointer;
                }

                .project-item:hover {
                    background: #f3f4f6;
                    transform: translateX(4px);
                }

                .project-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 8px;
                    background: #3b82f6;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    flex-shrink: 0;
                }

                .project-info {
                    flex: 1;
                }

                .project-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: #1a1a1a;
                    margin-bottom: 4px;
                }

                .project-meta {
                    font-size: 12px;
                    color: #6b7280;
                }

                .progress-mini {
                    width: 80px;
                    text-align: right;
                }

                .progress-bar-mini {
                    height: 4px;
                    background: #f3f4f6;
                    border-radius: 2px;
                    overflow: hidden;
                    margin-bottom: 4px;
                }

                .progress-fill-mini {
                    height: 100%;
                    background: #3b82f6;
                    border-radius: 2px;
                }

                .progress-text-mini {
                    font-size: 11px;
                    font-weight: 600;
                    color: #6b7280;
                }

                .status-badge {
                    display: inline-flex;
                    align-items: center;
                    padding: 4px 10px;
                    border-radius: 6px;
                    font-size: 11px;
                    font-weight: 600;
                    border: 1px solid;
                }

                .activity-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }

                .activity-item {
                    display: flex;
                    gap: var(--spacing-3);
                    padding: var(--spacing-3);
                    border-bottom: 1px solid #f3f4f6;
                }

                .activity-item:last-child {
                    border-bottom: none;
                }

                .activity-icon {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: #eff6ff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #3b82f6;
                    flex-shrink: 0;
                }

                .activity-content {
                    flex: 1;
                }

                .activity-action {
                    font-size: 14px;
                    font-weight: 600;
                    color: #1a1a1a;
                    margin-bottom: 4px;
                }

                .activity-project {
                    font-size: 13px;
                    color: #6b7280;
                    margin-bottom: 4px;
                }

                .activity-time {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 12px;
                    color: #9ca3af;
                }

                .quick-links {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }

                .quick-link-item {
                    margin-bottom: var(--spacing-3);
                }

                .quick-link {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-2);
                    padding: var(--spacing-3);
                    background: #fafbfc;
                    border-radius: 8px;
                    color: #1a1a1a;
                    text-decoration: none;
                    transition: all 0.2s ease;
                }

                .quick-link:hover {
                    background: #3b82f6;
                    color: white;
                    transform: translateX(4px);
                }

                .quick-link:hover .quick-link-arrow {
                    color: white;
                }

                .quick-link-arrow {
                    margin-left: auto;
                    color: #3b82f6;
                    transition: all 0.2s ease;
                }

                @media (max-width: 1024px) {
                    .content-grid {
                        grid-template-columns: 1fr;
                    }
                }

                @media (max-width: 768px) {
                    .stats-grid {
                        grid-template-columns: 1fr;
                    }

                    .banner-content {
                        flex-direction: column;
                        gap: var(--spacing-4);
                        text-align: center;
                    }
                }
            `}</style>

            {/* Page Header */}
            <div className="page-header">
                <p className="greeting-text">{getGreeting()}! 👋</p>
                <h1 className="page-title">Staff Dashboard</h1>
                <p className="page-subtitle">Welcome back to the CMS Staff Portal</p>
            </div>

            {/* Welcome Banner */}
            <div className="welcome-banner">
                <div className="banner-content">
                    <div className="banner-text">
                        <h2>Ready to manage your projects?</h2>
                        <p>Track your progress, view assignments, and stay updated with your tasks</p>
                    </div>
                    <button className="banner-action" onClick={() => router.push('/staff/projects')}>
                        View My Projects
                        <ArrowRightIcon />
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-card-content">
                        <div className="stat-icon blue">
                            <BriefcaseIcon />
                        </div>
                        <div className="stat-details">
                            <div className="stat-label">Total Projects</div>
                            <div className="stat-value">{stats.totalProjects}</div>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-content">
                        <div className="stat-icon purple">
                            <TrendingUpIcon />
                        </div>
                        <div className="stat-details">
                            <div className="stat-label">In Progress</div>
                            <div className="stat-value">{stats.inProgress}</div>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-content">
                        <div className="stat-icon green">
                            <CheckCircleIcon />
                        </div>
                        <div className="stat-details">
                            <div className="stat-label">Completed</div>
                            <div className="stat-value">{stats.completed}</div>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-content">
                        <div className="stat-icon orange">
                            <ClipboardIcon />
                        </div>
                        <div className="stat-details">
                            <div className="stat-label">Pending Tasks</div>
                            <div className="stat-value">{stats.pendingTasks}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="content-grid">
                {/* Recent Projects */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Recent Projects</h3>
                        <a href="/staff/projects" className="view-all-link">
                            View All
                            <ArrowRightIcon />
                        </a>
                    </div>

                    {recentProjects.map((project) => {
                        const statusColor = getStatusColor(project.status);
                        return (
                            <div
                                key={project.id}
                                className="project-item"
                                onClick={() => router.push(`/staff/projects/${project.id}`)}
                            >
                                <div className="project-icon">
                                    <FolderIcon />
                                </div>
                                <div className="project-info">
                                    <div className="project-title">{project.title}</div>
                                    <div className="project-meta">
                                        <span
                                            className="status-badge"
                                            style={{
                                                color: statusColor.color,
                                                background: statusColor.bg,
                                                borderColor: statusColor.border
                                            }}
                                        >
                                            {project.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="progress-mini">
                                    <div className="progress-bar-mini">
                                        <div
                                            className="progress-fill-mini"
                                            style={{ width: `${project.progress}%` }}
                                        />
                                    </div>
                                    <div className="progress-text-mini">{project.progress}%</div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Sidebar */}
                <div>
                    {/* Recent Activity */}
                    <div className="card" style={{ marginBottom: 'var(--spacing-5)' }}>
                        <div className="card-header">
                            <h3 className="card-title">Recent Activity</h3>
                        </div>
                        <ul className="activity-list">
                            {activities.map((activity, index) => (
                                <li key={index} className="activity-item">
                                    <div className="activity-icon">
                                        <ActivityIcon />
                                    </div>
                                    <div className="activity-content">
                                        <div className="activity-action">{activity.action}</div>
                                        <div className="activity-project">{activity.project}</div>
                                        <div className="activity-time">
                                            <ClockIcon />
                                            {activity.time}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Quick Links */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Quick Links</h3>
                        </div>
                        <ul className="quick-links">
                            <li className="quick-link-item">
                                <a href="/staff/projects" className="quick-link">
                                    <FolderIcon />
                                    View My Projects
                                    <span className="quick-link-arrow">
                                        <ArrowRightIcon />
                                    </span>
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

StaffDashboard.getLayout = function getLayout(page) {
    return <StaffLayout>{page}</StaffLayout>;
};