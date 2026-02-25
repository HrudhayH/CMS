import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { withClientLayout } from '../../../layouts/ClientLayout';
import { getClientProject } from '../../../services/api';

const getStatusStyles = (status) => {
    const styles = {
        'New': { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' },
        'In Progress': { bg: '#eff6ff', color: '#1e40af', border: '#dbeafe' },
        'Completed': { bg: '#f0fdf4', color: '#166534', border: '#dcfce7' },
        'On Hold': { bg: '#fff7ed', color: '#9a3412', border: '#ffedd5' },
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
        if (!dateString) return 'Not set';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatUpdateDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
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

    const currentStatusStyle = getStatusStyles(project.status);

    return (
        <div className="project-details-container">
            <style jsx>{`
                .project-details-container {
                    padding-bottom: 40px;
                }

                .back-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    color: #64748b;
                    text-decoration: none;
                    font-size: 14px;
                    font-weight: 600;
                    margin-bottom: 32px;
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 0;
                    transition: color 0.2s;
                }

                .back-btn:hover {
                    color: #3b82f6;
                }

                /* Project Summary Card - Premium Header */
                .summary-card {
                    background: white;
                    border-radius: 16px;
                    padding: 40px;
                    border: none;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                    margin-bottom: 40px;
                }

                .summary-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 32px;
                    gap: 24px;
                }

                .project-title-section h1 {
                    font-size: 36px;
                    font-weight: 800;
                    color: #1e293b;
                    margin: 0 0 12px 0;
                    line-height: 1.2;
                }

                .tech-stack {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                }

                .tech-badge {
                    font-size: 12px;
                    background: #eff6ff;
                    color: #1e40af;
                    padding: 6px 12px;
                    border-radius: 8px;
                    font-weight: 600;
                }

                .status-badge {
                    padding: 10px 20px;
                    border-radius: 12px;
                    font-size: 13px;
                    font-weight: 700;
                    border: 1px solid;
                    text-transform: uppercase;
                    white-space: nowrap;
                }

                .deployment-links-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                }

                .deployment-link-item {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .deployment-link-item label {
                    font-size: 12px;
                    color: #94a3b8;
                    text-transform: uppercase;
                    font-weight: 700;
                    letter-spacing: 0.5px;
                }

                .link-button {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px 20px;
                    text-decoration: none;
                    border-radius: 10px;
                    font-weight: 600;
                    font-size: 14px;
                    transition: all 0.2s;
                    border: none;
                    cursor: pointer;
                    width: fit-content;
                }

                .link-button.production {
                    background: #10b981;
                    color: white;
                }

                .link-button.production:hover {
                    background: #059669;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
                }

                .link-button.development {
                    background: #3b82f6;
                    color: white;
                }

                .link-button.development:hover {
                    background: #2563eb;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
                }

                .link-button-disabled {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px 20px;
                    background: #f3f4f6;
                    color: #6b7280;
                    border-radius: 10px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: not-allowed;
                    border: none;
                }

                /* Main Content Grid */
                .main-content {
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    gap: 32px;
                }

                .card {
                    background: white;
                    border-radius: 16px;
                    padding: 32px;
                    border: 1px solid #f1f5f9;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
                    margin-bottom: 24px;
                }

                .card-title {
                    font-size: 20px;
                    font-weight: 700;
                    color: #1e293b;
                    margin: 0 0 24px 0;
                }

                /* Team Section */
                .team-list {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .team-member {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px;
                    border-radius: 12px;
                    background: #f8fafc;
                }

                .member-avatar {
                    width: 40px;
                    height: 40px;
                    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                    color: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: 14px;
                }

                .member-info {
                    flex: 1;
                }

                .member-name {
                    font-size: 14px;
                    font-weight: 600;
                    color: #1e293b;
                    display: block;
                    margin: 0;
                }

                .member-role {
                    font-size: 12px;
                    color: #64748b;
                    margin: 0;
                }

                /* Updates Timeline */
                .updates-timeline {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                    position: relative;
                }

                .updates-timeline::before {
                    content: '';
                    position: absolute;
                    left: 19px;
                    top: 0;
                    bottom: 0;
                    width: 2px;
                    background: #f1f5f9;
                }

                .update-item {
                    display: flex;
                    gap: 20px;
                    position: relative;
                }

                .update-dot {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: white;
                    border: 4px solid #f1f5f9;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 2;
                    flex-shrink: 0;
                }

                .update-content {
                    background: #f8fafc;
                    padding: 20px;
                    border-radius: 16px;
                    flex: 1;
                    border: 1px solid #f1f5f9;
                }

                .update-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 8px;
                    flex-wrap: wrap;
                    gap: 8px;
                }

                .update-staff {
                    font-weight: 700;
                    color: #1e293b;
                    font-size: 14px;
                }

                .update-date {
                    font-size: 12px;
                    color: #94a3b8;
                }

                .update-comment {
                    font-size: 15px;
                    color: #475569;
                    line-height: 1.6;
                    margin: 0;
                }

                /* Help Card */
                .help-card {
                    background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
                    border: 1px solid #bfdbfe;
                }

                .help-card .card-title {
                    color: #1e40af;
                }

                .help-card p {
                    color: #1e40af;
                    opacity: 0.85;
                    margin: 0;
                    line-height: 1.6;
                }

                @media (max-width: 1024px) {
                    .main-content {
                        grid-template-columns: 1fr;
                    }

                    .deployment-links-grid {
                        grid-template-columns: 1fr;
                    }

                    .summary-header {
                        flex-direction: column;
                        align-items: flex-start;
                    }
                }

                @media (max-width: 768px) {
                    .summary-card {
                        padding: 24px;
                    }

                    .project-title-section h1 {
                        font-size: 28px;
                    }

                    .summary-header {
                        flex-direction: column;
                    }

                    .deployment-links-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>

            {/* Back Button */}
            <button className="back-btn" onClick={() => router.push('/client/projects')}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                Back to Projects
            </button>

            {/* PROJECT SUMMARY CARD */}
            <div className="summary-card">
                <div className="summary-header">
                    <div className="project-title-section">
                        <h1>{project.title}</h1>
                        <div className="tech-stack">
                            {project.techStack?.map((tech, i) => (
                                <span key={i} className="tech-badge">{tech}</span>
                            ))}
                        </div>
                    </div>
                    <div
                        className="status-badge"
                        style={{
                            background: currentStatusStyle.bg,
                            color: currentStatusStyle.color,
                            borderColor: currentStatusStyle.border
                        }}
                    >
                        {project.status}
                    </div>
                </div>

                {/* Project Description */}
                <div style={{ marginBottom: '32px' }}>
                    <p style={{ fontSize: '16px', color: '#475569', lineHeight: '1.7', margin: 0 }}>
                        {project.description || 'No description provided for this project.'}
                    </p>
                </div>

                {/* Deployment Links Grid */}
                <div className="deployment-links-grid">
                    <div className="deployment-link-item">
                        <label>🚀 Production Link</label>
                        {project.productionLink ? (
                            <a 
                                href={project.productionLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="link-button production"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                    <polyline points="15 3 21 3 21 9" />
                                    <line x1="10" y1="14" x2="21" y2="3" />
                                </svg>
                                Visit Live Project
                            </a>
                        ) : (
                            <button className="link-button-disabled">
                                Not yet available
                            </button>
                        )}
                    </div>

                    <div className="deployment-link-item">
                        <label>🔧 Development Link</label>
                        {project.developmentLink ? (
                            <a 
                                href={project.developmentLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="link-button development"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                    <polyline points="15 3 21 3 21 9" />
                                    <line x1="10" y1="14" x2="21" y2="3" />
                                </svg>
                                View Development
                            </a>
                        ) : (
                            <button className="link-button-disabled">
                                Not yet available
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT GRID */}
            <div className="main-content">
                {/* LEFT COLUMN - UPDATES */}
                <div>
                    {/* Roadmap & Discussion Navigation */}
                    <div className="card">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <h3 className="card-title" style={{ margin: 0 }}>📚 Resources</h3>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <button
                                onClick={() => router.push(`/client/projects/${id}/roadmap`)}
                                style={{
                                    padding: '16px',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '10px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}
                                onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                                onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"></path>
                                </svg>
                                View Roadmap
                            </button>
                            <button
                                onClick={() => router.push(`/client/projects/${id}/updates`)}
                                style={{
                                    padding: '16px',
                                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '10px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}
                                onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                                onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 2v20M2 12h20"></path>
                                </svg>
                                View Updates
                            </button>
                        </div>
                    </div>

                    {/* Project Updates Section */}
                    <div className="card">
                        <h3 className="card-title">📋 Latest Updates</h3>
                        {!project.dailyUpdates || project.dailyUpdates.length === 0 ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', background: '#f8fafc', borderRadius: '12px' }}>
                                <p style={{ margin: 0, fontSize: '15px' }}>No updates have been posted yet. Check back soon!</p>
                            </div>
                        ) : (
                            <div className="updates-timeline">
                                {project.dailyUpdates.slice().reverse().slice(0, 3).map((update, i) => (
                                    <div key={i} className="update-item">
                                        <div className="update-dot">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="3">
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                        </div>
                                        <div className="update-content">
                                            <div className="update-header">
                                                <span className="update-staff">{update.staff?.name || 'Staff Member'}</span>
                                                <span className="update-date">{formatUpdateDate(update.createdAt)}</span>
                                            </div>
                                            <p className="update-comment">{update.comment}</p>
                                            {update.progress !== undefined && (
                                                <div style={{ marginTop: '12px', fontSize: '13px', fontWeight: '600', color: '#3b82f6' }}>
                                                    Progress: {update.progress}%
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT COLUMN - TEAM & HELP */}
                <div>
                    {/* Team Members */}
                    <div className="card">
                        <h3 className="card-title">👥 Assigned Team</h3>
                        <div className="team-list">
                            {project.assignedStaff?.length > 0 ? (
                                project.assignedStaff.map((staff, i) => (
                                    <div key={i} className="team-member">
                                        <div className="member-avatar">{staff.name?.charAt(0).toUpperCase()}</div>
                                        <div className="member-info">
                                            <span className="member-name">{staff.name}</span>
                                            <span className="member-role">Technical Staff</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p style={{ color: '#94a3b8', fontSize: '14px', textAlign: 'center', margin: 0 }}>
                                    No team members assigned yet.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Help Card */}
                    <div className="card help-card">
                        <h3 className="card-title">💬 Need Help?</h3>
                        <p>
                            If you have questions about this project, please contact your account manager directly. We're here to support you!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default withClientLayout(ClientProjectDetails);
