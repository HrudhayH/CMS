import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import StaffLayout from '../../../layouts/staffLayout';
import { DataTable, Pagination, Modal, Alert } from '../../../components';
import { formatDate } from '../../../utils/helpers';
import { getStaffProjects } from '../../../services/api';

const ITEMS_PER_PAGE = 10;

/* ---------- Icons ---------- */
const FileIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
);

const EyeIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const FolderIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
);

const ClockIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);

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

const UsersIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

const CalendarIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);

const AlertCircleIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
);

const FlagIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
        <line x1="4" y1="22" x2="4" y2="15" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
);

const SparklesIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 3v18m9-9H3m15.364-6.364L5.636 18.364M18.364 18.364L5.636 5.636" />
    </svg>
);

export default function StaffProjects() {
    const router = useRouter();

    const [projects, setProjects] = useState([]);
    const [pagination, setPagination] = useState({
        page: 1,
        totalPages: 1,
        total: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [isRequirementModalOpen, setIsRequirementModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);

    /* ---------- Fetch Projects from Backend API ---------- */
    const fetchProjects = useCallback(async (page = 1) => {
        try {
            setLoading(true);
            setError('');
            const response = await getStaffProjects(page, ITEMS_PER_PAGE);
            setProjects(response.data || []);
            setPagination(response.pagination || {
                page: 1,
                totalPages: 1,
                total: 0
            });
        } catch (err) {
            setError(err.message || 'Failed to load projects');
            setProjects([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    const handlePageChange = (page) => {
        fetchProjects(page);
    };

    const openRequirementModal = (project) => {
        setSelectedProject(project);
        setIsRequirementModalOpen(true);
    };

    // Get status badge style
    const getStatusBadgeClass = (status) => {
        const statusMap = {
            'In Progress': 'status-badge status-progress',
            'Completed': 'status-badge status-completed',
            'On Hold': 'status-badge status-hold',
            'Pending': 'status-badge status-pending',
        };
        return statusMap[status] || 'status-badge';
    };

    // Get priority badge
    const getPriorityBadge = (priority) => {
        const priorityMap = {
            high: { color: '#ef4444', label: 'High Priority' },
            medium: { color: '#f59e0b', label: 'Medium' },
            low: { color: '#10b981', label: 'Low' },
        };
        return priorityMap[priority] || priorityMap.medium;
    };

    const columns = [
        {
            key: 'title',
            title: 'Project Details',
            render: (value, row) => {
                const priority = getPriorityBadge(row.priority);
                return (
                    <div className="project-info">
                        <div className="project-title-wrapper">
                            <div className="folder-icon-wrapper">
                                <FolderIcon />
                            </div>
                            <div className="project-title-content">
                                <strong className="project-title">{value}</strong>
                                <div className="priority-badge" style={{ color: priority.color }}>
                                    <FlagIcon />
                                    <span>{priority.label}</span>
                                </div>
                            </div>
                        </div>
                        <p className="project-description">{row.description}</p>
                        {row.progress !== undefined && (
                            <div className="progress-container">
                                <div className="progress-bar">
                                    <div
                                        className="progress-fill"
                                        style={{
                                            width: `${row.progress}%`,
                                            background: row.progress === 100
                                                ? 'linear-gradient(90deg, #10b981, #34d399)'
                                                : 'linear-gradient(90deg, #6366f1, #8b5cf6)'
                                        }}
                                    />
                                </div>
                                <span className="progress-text">{row.progress}%</span>
                            </div>
                        )}
                    </div>
                );
            },
        },
        {
            key: 'assignedClients',
            title: 'Client',
            render: (value) => (
                <div className="client-info">
                    <div className="client-icon">
                        <UsersIcon />
                    </div>
                    <div>
                        {value?.length ? (
                            <span className="client-name">{value[0].name}</span>
                        ) : (
                            <span className="text-muted">-</span>
                        )}
                    </div>
                </div>
            ),
        },
        {
            key: 'status',
            title: 'Status',
            render: (value) => (
                <span className={getStatusBadgeClass(value)}>
                    <span className="status-dot"></span>
                    {value}
                </span>
            ),
        },
        {
            key: 'dates',
            title: 'Timeline',
            render: (_, row) => (
                <div className="date-info">
                    <div className="date-row">
                        <div className="date-icon green">
                            <CalendarIcon />
                        </div>
                        <div>
                            <span className="date-label">Started</span>
                            <span className="date-value">{formatDate(row.createdAt)}</span>
                        </div>
                    </div>
                    <div className="date-row">
                        <div className="date-icon blue">
                            <ClockIcon />
                        </div>
                        <div>
                            <span className="date-label">Updated</span>
                            <span className="date-value">{formatDate(row.updatedAt)}</span>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            key: 'actions',
            title: 'Actions',
            align: 'right',
            render: (_, row) => (
                <div className="table-actions">
                    <button
                        className="btn btn-ghost btn-icon-sm action-btn view-btn"
                        onClick={() => router.push(`/staff/projects/${row._id}`)}
                        title="View Project Details"
                    >
                        <EyeIcon />
                    </button>

                    <button
                        className="btn btn-ghost btn-icon-sm action-btn doc-btn"
                        onClick={() => openRequirementModal(row)}
                        title="Requirement Document"
                    >
                        <FileIcon />
                    </button>
                </div>
            ),
        },
    ];

    // Calculate stats
    const stats = {
        total: pagination.total || 0,
        inProgress: projects.filter(p => p.status === 'In Progress').length,
        completed: projects.filter(p => p.status === 'Completed').length,
    };

    return (
        <div className="projects-page">
            <style jsx>{`
                .projects-page {
                    padding: var(--spacing-6);
                    background: linear-gradient(to bottom, #f9fafb 0%, #ffffff 100%);
                    min-height: 100vh;
                }

                .page-header {
                    margin-bottom: var(--spacing-6);
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                }

                .page-title {
                    font-size: 32px;
                    font-weight: 800;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    margin: 0 0 var(--spacing-2) 0;
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-3);
                }

                .page-subtitle {
                    font-size: 15px;
                    color: #6b7280;
                    margin: 0;
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-2);
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: var(--spacing-5);
                    margin-bottom: var(--spacing-6);
                }

                .stat-card {
                    background: white;
                    border: 2px solid transparent;
                    border-radius: 16px;
                    padding: var(--spacing-6);
                    position: relative;
                    overflow: hidden;
                    transition: all 0.3s ease;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                }

                .stat-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 4px;
                    background: linear-gradient(90deg, var(--stat-color-1), var(--stat-color-2));
                }

                .stat-card:nth-child(1) {
                    --stat-color-1: #667eea;
                    --stat-color-2: #764ba2;
                }

                .stat-card:nth-child(2) {
                    --stat-color-1: #f093fb;
                    --stat-color-2: #f5576c;
                }

                .stat-card:nth-child(3) {
                    --stat-color-1: #4facfe;
                    --stat-color-2: #00f2fe;
                }

                .stat-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
                    border-color: var(--stat-color-1);
                }

                .stat-card-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .stat-icon {
                    width: 56px;
                    height: 56px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, var(--stat-color-1), var(--stat-color-2));
                    color: white;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                }

                .stat-details {
                    flex: 1;
                    text-align: right;
                }

                .stat-label {
                    font-size: 13px;
                    font-weight: 600;
                    color: #6b7280;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: var(--spacing-2);
                }

                .stat-value {
                    font-size: 36px;
                    font-weight: 800;
                    background: linear-gradient(135deg, var(--stat-color-1), var(--stat-color-2));
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    line-height: 1;
                }

                .project-info {
                    display: flex;
                    flex-direction: column;
                    gap: var(--spacing-3);
                    padding: var(--spacing-2) 0;
                }

                .project-title-wrapper {
                    display: flex;
                    align-items: flex-start;
                    gap: var(--spacing-3);
                }

                .folder-icon-wrapper {
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    flex-shrink: 0;
                }

                .project-title-content {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: var(--spacing-1);
                }

                .project-title {
                    font-size: 16px;
                    font-weight: 700;
                    color: #1a1a1a;
                    line-height: 1.4;
                }

                .priority-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 11px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .project-description {
                    font-size: 14px;
                    color: #6b7280;
                    margin: 0;
                    line-height: 1.6;
                    padding-left: 52px;
                }

                .progress-container {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-3);
                    padding-left: 52px;
                }

                .progress-bar {
                    flex: 1;
                    height: 8px;
                    background: #f3f4f6;
                    border-radius: 4px;
                    overflow: hidden;
                    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
                }

                .progress-fill {
                    height: 100%;
                    border-radius: 4px;
                    transition: width 0.5s ease;
                    position: relative;
                    overflow: hidden;
                }

                .progress-fill::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    bottom: 0;
                    right: 0;
                    background: linear-gradient(
                        90deg,
                        transparent,
                        rgba(255, 255, 255, 0.3),
                        transparent
                    );
                    animation: shimmer 2s infinite;
                }

                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }

                .progress-text {
                    font-size: 13px;
                    font-weight: 700;
                    color: #6366f1;
                    min-width: 45px;
                    text-align: right;
                }

                .client-info {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-2);
                }

                .client-icon {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    background: linear-gradient(135deg, #fbbf24, #f59e0b);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                }

                .client-name {
                    font-size: 14px;
                    font-weight: 600;
                    color: #1a1a1a;
                }

                .status-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 14px;
                    border-radius: 8px;
                    font-size: 12px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }

                .status-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: currentColor;
                    animation: pulse 2s infinite;
                }

                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }

                .status-progress {
                    background: linear-gradient(135deg, #dbeafe, #bfdbfe);
                    color: #1e40af;
                }

                .status-completed {
                    background: linear-gradient(135deg, #d1fae5, #a7f3d0);
                    color: #065f46;
                }

                .status-hold {
                    background: linear-gradient(135deg, #fef3c7, #fde68a);
                    color: #92400e;
                }

                .status-pending {
                    background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
                    color: #4b5563;
                }

                .date-info {
                    display: flex;
                    flex-direction: column;
                    gap: var(--spacing-2);
                }

                .date-row {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-2);
                }

                .date-icon {
                    width: 28px;
                    height: 28px;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                }

                .date-icon.green {
                    background: linear-gradient(135deg, #10b981, #34d399);
                }

                .date-icon.blue {
                    background: linear-gradient(135deg, #3b82f6, #60a5fa);
                }

                .date-label {
                    display: block;
                    font-size: 11px;
                    color: #9ca3af;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .date-value {
                    display: block;
                    font-size: 13px;
                    color: #1a1a1a;
                    font-weight: 600;
                }

                .table-actions {
                    display: flex;
                    gap: var(--spacing-2);
                    justify-content: flex-end;
                }

                .action-btn {
                    width: 36px;
                    height: 36px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                    border: 2px solid transparent;
                }

                .action-btn.view-btn:hover {
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
                }

                .action-btn.doc-btn:hover {
                    background: linear-gradient(135deg, #f093fb, #f5576c);
                    color: white;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(240, 147, 251, 0.4);
                }

                .text-muted {
                    color: #9ca3af;
                }

                .empty-state {
                    text-align: center;
                }

                .empty-state-title {
                    font-size: 18px;
                    font-weight: 600;
                    color: #1a1a1a;
                    margin-bottom: var(--spacing-2);
                }

                .empty-state-description {
                    font-size: 14px;
                    color: #6b7280;
                }

                @media (max-width: 768px) {
                    .stats-grid {
                        grid-template-columns: 1fr;
                    }

                    .page-header {
                        flex-direction: column;
                        gap: var(--spacing-4);
                    }

                    .project-description,
                    .progress-container {
                        padding-left: 0;
                    }
                }
            `}</style>

            <div className="page-header">
                <div>
                    <h1 className="page-title">
                        <SparklesIcon />
                        My Projects
                    </h1>
                    <p className="page-subtitle">
                        <BriefcaseIcon />
                        View and manage your assigned projects
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-card-content">
                        <div className="stat-icon">
                            <BriefcaseIcon />
                        </div>
                        <div className="stat-details">
                            <div className="stat-label">Total Projects</div>
                            <div className="stat-value">{stats.total}</div>
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-content">
                        <div className="stat-icon">
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
                        <div className="stat-icon">
                            <CheckCircleIcon />
                        </div>
                        <div className="stat-details">
                            <div className="stat-label">Completed</div>
                            <div className="stat-value">{stats.completed}</div>
                        </div>
                    </div>
                </div>
            </div>

            {error && <Alert type="error" message={error} onClose={() => setError('')} />}
            {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

            <DataTable
                columns={columns}
                data={projects}
                loading={loading}
                emptyMessage="No projects found"
                emptyDescription="You haven't been assigned to any projects yet."
            />

            <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                totalItems={pagination.total}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={handlePageChange}
            />

            {/* Requirement Modal */}
            <Modal
                isOpen={isRequirementModalOpen}
                onClose={() => setIsRequirementModalOpen(false)}
                title="Requirement Document"
                footer={
                    <button
                        className="btn btn-primary"
                        onClick={() => setIsRequirementModalOpen(false)}
                    >
                        Close
                    </button>
                }
            >
                <div className="empty-state" style={{ padding: 'var(--spacing-6)' }}>
                    <h3 className="empty-state-title">Feature Coming Soon</h3>
                    <p className="empty-state-description">
                        Requirement document will be available soon.
                    </p>
                </div>
            </Modal>
        </div>
    );
}

StaffProjects.getLayout = function getLayout(page) {
    return <StaffLayout>{page}</StaffLayout>;
};