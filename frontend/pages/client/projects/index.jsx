import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { withClientLayout } from '../../../layouts/ClientLayout';
import { getClientProjects } from '../../../services/api';

const getStatusStyle = (status) => {
    const styles = {
        'New': { bg: '#f3f4f6', text: '#4b5563' },
        'In Progress': { bg: '#fef3c7', text: '#92400e' },
        'Completed': { bg: '#d1fae5', text: '#065f46' },
        'On Hold': { bg: '#fee2e2', text: '#991b1b' }
    };
    return styles[status] || styles['In Progress'];
};

function ClientProjects() {
    const router = useRouter();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                setLoading(true);
                const res = await getClientProjects();
                setProjects(res.data);
                setError('');
            } catch (err) {
                setError(err.message || 'Failed to load projects');
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    return (
        <div style={{ minHeight: '100%' }}>
            <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px', color: '#0f172a' }}>
                My Projects
            </h1>
            <p style={{ color: '#64748b', marginBottom: '32px' }}>
                Track your projects and progress
            </p>

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
            ) : projects.length === 0 ? (
                <div style={{
                    padding: '48px',
                    textAlign: 'center',
                    background: 'white',
                    borderRadius: '16px',
                    border: '1px solid #f1f5f9',
                    color: '#64748b'
                }}>
                    <p style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>No projects assigned yet</p>
                    <p>Once the administrator assigns a project to you, it will appear here.</p>
                </div>
            ) : (
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                        gap: '24px'
                    }}
                >
                    {projects.map(project => {
                        const statusStyle = getStatusStyle(project.status);

                        return (
                            <div
                                key={project._id}
                                style={{
                                    background: 'white',
                                    borderRadius: '16px',
                                    padding: '24px',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '20px',
                                    border: '1px solid #f1f5f9',
                                    transition: 'transform 0.2s',
                                    cursor: 'default'
                                }}
                            >
                                {/* Header */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', margin: 0 }}>
                                        {project.title}
                                    </h3>
                                    <span
                                        style={{
                                            padding: '6px 12px',
                                            borderRadius: '8px',
                                            fontSize: '12px',
                                            fontWeight: '700',
                                            background: statusStyle.bg,
                                            color: statusStyle.text,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.025em'
                                        }}
                                    >
                                        {project.status}
                                    </span>
                                </div>

                                {/* Assigned Staff */}
                                <div>
                                    <p style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>
                                        Assigned Team
                                    </p>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        {project.assignedStaff && project.assignedStaff.length > 0 ? (
                                            project.assignedStaff.map((staff, i) => (
                                                <div
                                                    key={i}
                                                    style={{
                                                        background: '#f1f5f9',
                                                        color: '#475569',
                                                        padding: '4px 10px',
                                                        borderRadius: '6px',
                                                        fontSize: '13px',
                                                        fontWeight: '500'
                                                    }}
                                                >
                                                    {staff.name}
                                                </div>
                                            ))
                                        ) : (
                                            <span style={{ color: '#94a3b8', fontSize: '13px', fontStyle: 'italic' }}>TBA</span>
                                        )}
                                    </div>
                                </div>

                                {/* Progress */}
                                <div>
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            fontSize: '14px',
                                            marginBottom: '8px',
                                            fontWeight: '600',
                                            color: '#64748b'
                                        }}
                                    >
                                        <span>Project Progress</span>
                                        <span style={{ color: '#3b82f6' }}>{project.progress || 0}%</span>
                                    </div>
                                    <div
                                        style={{
                                            height: '10px',
                                            background: '#f1f5f9',
                                            borderRadius: '999px',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: `${project.progress || 0}%`,
                                                height: '100%',
                                                background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)',
                                                borderRadius: '999px',
                                                transition: 'width 0.5s ease-out'
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* CTA */}
                                <button
                                    onClick={() => router.push(`/client/projects/${project._id}`)}
                                    style={{
                                        marginTop: '10px',
                                        padding: '14px',
                                        borderRadius: '12px',
                                        border: 'none',
                                        background: '#1e293b',
                                        color: 'white',
                                        fontWeight: '700',
                                        fontSize: '15px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.background = '#334155'}
                                    onMouseOut={(e) => e.currentTarget.style.background = '#1e293b'}
                                >
                                    View Project Details
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="5" y1="12" x2="19" y2="12"></line>
                                        <polyline points="12 5 19 12 12 19"></polyline>
                                    </svg>
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default withClientLayout(ClientProjects);
