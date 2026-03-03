import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { withClientLayout } from '../../../layouts/ClientLayout';
import { getClientProject } from '../../../services/api';

if (!process.env.NEXT_PUBLIC_API_URL) {
    throw new Error('NEXT_PUBLIC_API_URL is not defined. Set it in your .env.local (dev) or Vercel environment variables (prod).');
}
const API_URL = process.env.NEXT_PUBLIC_API_URL;

const getStatusStyles = (status) => {
    const styles = {
        'Active': { bg: '#f0fdf4', color: '#166534', border: '#dcfce7' },
        'In Progress': { bg: '#eff6ff', color: '#1e40af', border: '#dbeafe' },
        'On Hold': { bg: '#fff7ed', color: '#9a3412', border: '#ffedd5' },
        'Completed': { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' },
        'New': { bg: '#eff6ff', color: '#1e40af', border: '#dbeafe' },
    };
    return styles[status] || styles['In Progress'];
};

function ClientProjectDetails() {
    const router = useRouter();
    const { id } = router.query;
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!id) return;

        const fetchProject = async () => {
            try {
                setLoading(true);
                const res = await getClientProject(id);
                setProject(res.data);
                setError('');
            } catch (err) {
                setError(err.message || 'Failed to load project details');
            } finally {
                setLoading(false);
            }
        };

        fetchProject();
    }, [id]);

    const formatDate = (dateString) => {
        if (!dateString) return 'Not Set';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    if (loading && !project) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
                <div className="loading-spinner loading-spinner-lg"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '24px', background: '#fef2f2', color: '#dc2626', borderRadius: '12px' }}>
                <h3 style={{ margin: '0 0 8px 0' }}>Error</h3>
                <p style={{ margin: 0 }}>{error}</p>
                <button
                    onClick={() => router.back()}
                    style={{ marginTop: '16px', padding: '8px 16px', background: 'white', border: '1px solid #dc2626', borderRadius: '6px', color: '#dc2626', fontWeight: '600', cursor: 'pointer' }}
                >
                    Go Back
                </button>
            </div>
        );
    }

    if (!project) return null;

    const statusStyle = getStatusStyles(project.status);

    return (
        <div className="project-detail-view">
            <style jsx>{`
                .project-detail-view {
                    padding: 0 0 40px 0;
                    color: #1e293b;
                }

                /* Header Card */
                .header-card {
                    background: white;
                    border-radius: 12px;
                    border: 1px solid #e2e8f0;
                    padding: 24px 32px;
                    margin-bottom: 24px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 24px;
                }

                .project-header-left {
                    flex: 1;
                }

                .title-row {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    margin-bottom: 12px;
                }

                .title-row h1 {
                    font-size: 26px;
                    font-weight: 800;
                    margin: 0;
                    color: #0f172a;
                    letter-spacing: -0.02em;
                }

                .project-meta-row {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-size: 14px;
                    color: #64748b;
                    font-weight: 500;
                }

                .project-id {
                    background: #f1f5f9;
                    color: #475569;
                    padding: 2px 10px;
                    border-radius: 6px;
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 12px;
                    letter-spacing: 0.05em;
                }

                .meta-divider {
                    color: #e2e8f0;
                }

                .status-badge {
                    padding: 6px 14px;
                    border-radius: 8px;
                    font-size: 11px;
                    font-weight: 700;
                    border: 1.5px solid;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .action-button-group {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .btn-action {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 18px;
                    border-radius: 10px;
                    font-size: 14px;
                    font-weight: 600;
                    text-decoration: none;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    border: 1px solid transparent;
                }

                .btn-action.dev {
                    background: #eff6ff;
                    color: #2563eb;
                    border-color: #dbeafe;
                }

                .btn-action.dev:hover {
                    background: #dbeafe;
                    transform: translateY(-1px);
                }

                .btn-action.live {
                    background: #f0fdf4;
                    color: #16a34a;
                    border-color: #dcfce7;
                }

                .btn-action.live:hover {
                    background: #dcfce7;
                    transform: translateY(-1px);
                }

                .btn-primary-gradient {
                    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                    color: white;
                    border: none;
                    padding: 10px 22px;
                    border-radius: 10px;
                    font-weight: 600;
                    font-size: 14px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
                    transition: all 0.2s;
                }

                .btn-primary-gradient:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 6px 16px rgba(37, 99, 235, 0.3);
                    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
                }

                /* Middle Content */
                .content-grid {
                    display: grid;
                    grid-template-columns: 1.5fr 1fr;
                    gap: 24px;
                }

                .card {
                    background: white;
                    border-radius: 12px;
                    border: 1px solid #e2e8f0;
                    padding: 24px;
                    margin-bottom: 24px;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
                }

                .card-title {
                    font-size: 18px;
                    font-weight: 600;
                    margin: 0 0 20px 0;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                /* Overview Card */
                .overview-desc {
                    font-size: 15px;
                    line-height: 1.6;
                    color: #475569;
                    margin-bottom: 24px;
                }

                .tech-stack {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    margin-bottom: 24px;
                }

                .tech-tag {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    padding: 4px 10px;
                    border-radius: 6px;
                    font-size: 12px;
                    font-weight: 500;
                    color: #64748b;
                }

                .timeline-simple {
                    display: flex;
                    align-items: center;
                    margin-bottom: 24px;
                    padding: 16px;
                    background: #f8fafc;
                    border-radius: 8px;
                }

                .timeline-point {
                    flex: 1;
                    text-align: center;
                }

                .timeline-label {
                    font-size: 11px;
                    color: #94a3b8;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 4px;
                }

                .timeline-value {
                    font-size: 14px;
                    font-weight: 600;
                    color: #1e293b;
                }

                .timeline-line {
                    height: 2px;
                    background: #e2e8f0;
                    width: 40px;
                    margin: 15px 10px 0 10px;
                }

                /* Progress Bar */
                .progress-section {
                    margin-top: 24px;
                }

                .progress-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 8px;
                }

                .progress-label {
                    font-size: 14px;
                    font-weight: 600;
                }

                .progress-percent {
                    font-size: 14px;
                    font-weight: 700;
                    color: #3b82f6;
                }

                .progress-bar-container {
                    height: 10px;
                    background: #f1f5f9;
                    border-radius: 5px;
                    overflow: hidden;
                }

                .progress-bar-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%);
                    transition: width 0.5s ease-out;
                }

                /* Documents Card */
                .doc-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .doc-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 14px;
                    border: 1px solid #f1f5f9;
                    border-radius: 8px;
                    background: #f8fafc;
                    transition: all 0.2s;
                }

                .doc-item:hover {
                    border-color: #dbeafe;
                    background: #f1f7ff;
                }

                .doc-info {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .doc-name {
                    font-size: 14px;
                    font-weight: 500;
                    color: #334155;
                }

                .doc-action {
                    font-size: 12px;
                    font-weight: 600;
                    color: #3b82f6;
                    text-decoration: none;
                }

                .back-navigation {
                    margin-bottom: 24px;
                }

                .back-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: none;
                    border: none;
                    color: #64748b;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    padding: 0;
                    transition: all 0.2s;
                }

                .back-btn:hover {
                    color: #3b82f6;
                    transform: translateX(-4px);
                }

                /* Team Card */
                .team-list {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .team-member {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: #3b82f6;
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: 14px;
                    text-transform: uppercase;
                }

                .member-details {
                    display: flex;
                    flex-direction: column;
                }

                .member-name {
                    font-size: 14px;
                    font-weight: 600;
                    color: #1e293b;
                }

                .member-role {
                    font-size: 12px;
                    color: #64748b;
                }

                /* Buttons */
                .btn-primary {
                    background: #3b82f6;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 14px;
                    cursor: pointer;
                    transition: background 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .btn-primary:hover {
                    background: #2563eb;
                }

                .btn-outline {
                    background: transparent;
                    color: #3b82f6;
                    border: 1px solid #3b82f6;
                    padding: 6px 12px;
                    border-radius: 6px;
                    font-weight: 600;
                    font-size: 13px;
                    cursor: pointer;
                    text-decoration: none;
                    display: inline-block;
                }

                .btn-outline:hover {
                    background: #eff6ff;
                }

                @media (max-width: 968px) {
                    .header-card {
                        flex-direction: column;
                        align-items: stretch;
                        gap: 20px;
                        padding: 24px;
                    }

                    .action-button-group {
                        flex-direction: column;
                        width: 100%;
                    }

                    .btn-action, .btn-primary-gradient {
                        width: 100%;
                        justify-content: center;
                    }

                    .content-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>

            {/* Back Button */}
            <div className="back-navigation">
                <button
                    className="back-btn"
                    onClick={() => router.push('/client/projects')}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                    Back to Projects
                </button>
            </div>

            {/* Header Section */}
            <div className="header-card">
                <div className="project-header-left">
                    <div className="title-row">
                        <h1>{project.title}</h1>
                        <span className="status-badge" style={{ backgroundColor: statusStyle.bg, color: statusStyle.color, borderColor: statusStyle.border }}>
                            {project.status}
                        </span>
                    </div>

                    <div className="project-meta-row">
                        <span className="project-id">ID: {project.projectCode || project._id.slice(-6).toUpperCase()}</span>
                        <span className="meta-divider">|</span>
                        <span className="meta-dates">📅 {formatDate(project.startDate)} — {formatDate(project.endDate)}</span>
                    </div>
                </div>

                <div className="project-header-right">
                    <div className="action-button-group">
                        {project.developmentLink && (
                            <a href={project.developmentLink} target="_blank" rel="noopener noreferrer" className="btn-action dev">
                                <span className="icon">🛠️</span>
                                Dev Site
                            </a>
                        )}
                        {project.productionLink && (
                            <a href={project.productionLink} target="_blank" rel="noopener noreferrer" className="btn-action live">
                                <span className="icon">🌐</span>
                                Live Site
                            </a>
                        )}
                        <button
                            className="btn-primary-gradient"
                            onClick={() => router.push(`/client/updates/${project._id}`)}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                            New Updates
                        </button>
                    </div>
                </div>
            </div>

            {/* Middle Section */}
            <div className="content-grid">
                {/* Left Column */}
                <div className="left-column">
                    <div className="card">
                        <h3 className="card-title">📝 Project Overview</h3>
                        <p className="overview-desc">
                            {project.description || 'No project description provided.'}
                        </p>

                        <div className="tech-stack">
                            {project.techStack?.map((tech, i) => (
                                <span key={i} className="tech-tag">{tech}</span>
                            ))}
                        </div>

                        <div className="timeline-simple">
                            <div className="timeline-point">
                                <div className="timeline-label">Start Date</div>
                                <div className="timeline-value">{formatDate(project.startDate)}</div>
                            </div>
                            <div className="timeline-line"></div>
                            <div className="timeline-point">
                                <div className="timeline-label">Deadline</div>
                                <div className="timeline-value">{formatDate(project.endDate)}</div>
                            </div>
                        </div>

                        <div className="progress-section">
                            <div className="progress-header">
                                <span className="progress-label">Overall Completion</span>
                                <span className="progress-percent">{project.progress || 0}%</span>
                            </div>
                            <div className="progress-bar-container">
                                <div
                                    className="progress-bar-fill"
                                    style={{ width: `${project.progress || 0}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    {/* Resources section - Simplified as secondary info */}
                    <div className="card" style={{ padding: '20px' }}>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <a
                                href={`/client/projects/${project._id}/roadmap`}
                                className="btn-outline"
                                style={{ flex: 1, textAlign: 'center' }}
                            >
                                🗺️ Full Project Roadmap
                            </a>
                            <a
                                href={`/client/updates/${project._id}`}
                                className="btn-outline"
                                style={{ flex: 1, textAlign: 'center' }}
                            >
                                📋 All Daily Updates
                            </a>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="right-column">
                    <div className="card">
                        <h3 className="card-title">📁 Documents</h3>
                        <div className="doc-list">
                            {/* Document Link */}
                            {project.document_link ? (
                                <div className="doc-item">
                                    <div className="doc-info">
                                        <span style={{ fontSize: '20px' }}>🔗</span>
                                        <span className="doc-name">Project Documentation</span>
                                    </div>
                                    <a href={project.document_link} target="_blank" rel="noopener noreferrer" className="doc-action">
                                        Open Link
                                    </a>
                                </div>
                            ) : project.referenceLink ? (
                                <div className="doc-item">
                                    <div className="doc-info">
                                        <span style={{ fontSize: '20px' }}>🔗</span>
                                        <span className="doc-name">Reference Link</span>
                                    </div>
                                    <a href={project.referenceLink} target="_blank" rel="noopener noreferrer" className="doc-action">
                                        Open Link
                                    </a>
                                </div>
                            ) : null}

                            {/* Uploaded PDF */}
                            {project.document_file_url ? (
                                <div className="doc-item">
                                    <div className="doc-info">
                                        <span style={{ fontSize: '20px' }}>📄</span>
                                        <span className="doc-name">{project.document_file_name || 'Project Document.pdf'}</span>
                                    </div>
                                    <a href={`${API_URL}${project.document_file_url}`} target="_blank" rel="noopener noreferrer" className="doc-action">
                                        Download
                                    </a>
                                </div>
                            ) : null}

                            {!project.document_link && !project.document_file_url && !project.referenceLink && (
                                <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0, textAlign: 'center', padding: '10px' }}>
                                    No documents attached yet.
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="card">
                        <h3 className="card-title">👥 Assigned Team</h3>
                        <div className="team-list">
                            {project.assignedStaff?.length > 0 ? (
                                project.assignedStaff.map((staff, i) => (
                                    <div key={i} className="team-member">
                                        <div className="avatar">
                                            {staff.name?.charAt(0)}
                                        </div>
                                        <div className="member-details">
                                            <span className="member-name">{staff.name}</span>
                                            <span className="member-role">Software Engineer</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>No team assigned yet.</p>
                            )}
                        </div>
                    </div>

                    <div className="card" style={{ background: '#f8fafc', borderStyle: 'dashed' }}>
                        <h3 className="card-title" style={{ fontSize: '16px', color: '#64748b' }}>💬 Support</h3>
                        <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.5', margin: 0 }}>
                            Need assistance with this project? Contact your relationship manager for direct support.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default withClientLayout(ClientProjectDetails);
