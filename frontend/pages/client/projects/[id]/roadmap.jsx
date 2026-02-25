import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { withClientLayout } from '../../../../layouts/ClientLayout';
import { getClientProject } from '../../../../services/api';
import ClientRoadmapTab from '../../../../components/client/ClientRoadmapTab';
import ProjectDiscussion from '../../../../components/ProjectDiscussion';
import { useClientAuth } from '../../../../hooks/useClientAuth';

function ClientProjectRoadmap() {
    const router = useRouter();
    const { id } = router.query;
    const { user: authUser } = useClientAuth();
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
                setError(err.message || 'Failed to load project');
            } finally {
                setLoading(false);
            }
        };

        fetchProject();
    }, [id]);

    if (loading) {
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

    return (
        <div className="roadmap-page-container">
            <style jsx>{`
                .roadmap-page-container {
                    padding-bottom: 40px;
                }

                .page-header {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    margin-bottom: 32px;
                }

                .back-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    color: #64748b;
                    text-decoration: none;
                    font-size: 14px;
                    font-weight: 600;
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 0;
                    transition: color 0.2s;
                }

                .back-btn:hover {
                    color: #3b82f6;
                }

                .page-title-section h1 {
                    font-size: 32px;
                    font-weight: 800;
                    color: #1e293b;
                    margin: 0;
                }

                .page-title-section p {
                    margin: 8px 0 0 0;
                    color: #64748b;
                    font-size: 15px;
                }

                .breadcrumb {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 13px;
                    color: #94a3b8;
                    margin-bottom: 24px;
                    padding: 16px;
                    background: #f8fafc;
                    border-radius: 8px;
                }

                .breadcrumb span {
                    cursor: pointer;
                    color: #3b82f6;
                    font-weight: 600;
                    transition: color 0.2s;
                }

                .breadcrumb span:hover {
                    color: #2563eb;
                }

                .breadcrumb-separator {
                    color: #cbd5e1;
                }

                .content-sections {
                    display: grid;
                    gap: 40px;
                }

                .section {
                    background: white;
                    border-radius: 16px;
                    padding: 32px;
                    border: 1px solid #f1f5f9;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
                }

                .section-title {
                    font-size: 20px;
                    font-weight: 700;
                    color: #1e293b;
                    margin: 0 0 24px 0;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .section-icon {
                    font-size: 24px;
                }

                @media (max-width: 1024px) {
                    .page-title-section h1 {
                        font-size: 24px;
                    }

                    .section {
                        padding: 24px;
                    }
                }

                @media (max-width: 768px) {
                    .page-header {
                        flex-direction: column;
                        align-items: flex-start;
                    }

                    .page-title-section h1 {
                        font-size: 20px;
                    }

                    .section {
                        padding: 16px;
                    }

                    .breadcrumb {
                        font-size: 12px;
                        padding: 12px;
                    }
                }
            `}</style>

            {/* Breadcrumb Navigation */}
            <div className="breadcrumb">
                <span onClick={() => router.push('/client/projects')}>Projects</span>
                <span className="breadcrumb-separator">/</span>
                <span onClick={() => router.push(`/client/projects/${id}`)}>{project.title}</span>
                <span className="breadcrumb-separator">/</span>
                <span>Roadmap & Support</span>
            </div>

            {/* Page Header */}
            <div className="page-header">
                <button 
                    className="back-btn" 
                    onClick={() => router.push(`/client/projects/${id}`)}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                    Back to Project
                </button>
                <div className="page-title-section">
                    <h1>📋 Project Roadmap & Support</h1>
                    <p>{project.title}</p>
                </div>
            </div>

            {/* Content Sections */}
            <div className="content-sections">
                {/* Roadmap Section */}
                <div className="section">
                    <h2 className="section-title">
                        <span className="section-icon">🗺️</span>
                        Project Roadmap
                    </h2>
                    <ClientRoadmapTab projectId={id} />
                </div>

                {/* Discussion Section */}
                {authUser && (
                    <div className="section">
                        <h2 className="section-title">
                            <span className="section-icon">💬</span>
                            Support & Feedback
                        </h2>
                        <ProjectDiscussion 
                            projectId={id}
                            userRole="client"
                            userId={authUser.id || authUser._id}
                            userName={authUser.name}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

export default withClientLayout(ClientProjectRoadmap);
