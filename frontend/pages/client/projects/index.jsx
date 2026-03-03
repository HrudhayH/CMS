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
                        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 380px))',
                        gap: '24px',
                        justifyContent: 'flex-start'
                    }}
                >
                    {projects.map(project => {
                        const statusStyle = getStatusStyle(project.status);

                        return (
                            <div
                                key={project._id}
                                style={{
                                    background: 'white',
                                    borderRadius: '20px',
                                    padding: '24px',
                                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '20px',
                                    border: '1px solid #f1f5f9',
                                    transition: 'all 0.3s ease',
                                    height: '100%',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                    e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.05)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
                                }}
                            >
                                {/* Top Decoration */}
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '4px',
                                    backgroundColor: statusStyle.text === '#4b5563' ? '#cbd5e1' :
                                        statusStyle.text === '#92400e' ? '#fbbf24' :
                                            statusStyle.text === '#065f46' ? '#10b981' : '#ef4444'
                                }}></div>

                                {/* Header */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>
                                            {project.projectCode || 'PROJECT'}
                                        </div>
                                        <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', margin: 0, lineHeight: '1.2' }}>
                                            {project.title}
                                        </h3>
                                    </div>
                                    <span
                                        style={{
                                            padding: '4px 10px',
                                            borderRadius: '6px',
                                            fontSize: '11px',
                                            fontWeight: '700',
                                            background: statusStyle.bg,
                                            color: statusStyle.text,
                                            textTransform: 'uppercase',
                                            marginTop: '4px'
                                        }}
                                    >
                                        {project.status}
                                    </span>
                                </div>

                                {/* Team */}
                                <div>
                                    <p style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                            <circle cx="9" cy="7" r="4"></circle>
                                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                        </svg>
                                        Team Members
                                    </p>
                                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                        {project.assignedStaff && project.assignedStaff.length > 0 ? (
                                            project.assignedStaff.slice(0, 3).map((staff, i) => (
                                                <div
                                                    key={i}
                                                    style={{
                                                        background: '#f8fafc',
                                                        color: '#64748b',
                                                        padding: '4px 10px',
                                                        borderRadius: '20px',
                                                        fontSize: '12px',
                                                        fontWeight: '600',
                                                        border: '1px solid #f1f5f9'
                                                    }}
                                                >
                                                    {staff.name}
                                                </div>
                                            ))
                                        ) : (
                                            <span style={{ color: '#94a3b8', fontSize: '12px', fontStyle: 'italic' }}>Allocating team...</span>
                                        )}
                                        {project.assignedStaff && project.assignedStaff.length > 3 && (
                                            <div style={{ fontSize: '12px', color: '#94a3b8', alignSelf: 'center', fontWeight: '600' }}>
                                                +{project.assignedStaff.length - 3} more
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Progress */}
                                <div style={{ marginTop: '4px' }}>
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            fontSize: '12px',
                                            marginBottom: '8px',
                                            fontWeight: '700',
                                            color: '#64748b'
                                        }}
                                    >
                                        <span>COMPLETION</span>
                                        <span style={{ color: '#3b82f6' }}>{project.progress || 0}%</span>
                                    </div>
                                    <div
                                        style={{
                                            height: '8px',
                                            background: '#f1f5f9',
                                            borderRadius: '10px',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: `${project.progress || 0}%`,
                                                height: '100%',
                                                background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)',
                                                borderRadius: '10px',
                                                transition: 'width 0.8s ease-in-out'
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* CTA */}
                                <button
                                    onClick={() => router.push(`/client/projects/${project._id}`)}
                                    style={{
                                        marginTop: 'auto',
                                        padding: '12px 16px',
                                        borderRadius: '10px',
                                        border: '1px solid #e2e8f0',
                                        background: '#fff',
                                        color: '#1e293b',
                                        fontWeight: '700',
                                        fontSize: '13px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = '#f8fafc';
                                        e.currentTarget.style.borderColor = '#cbd5e1';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = '#fff';
                                        e.currentTarget.style.borderColor = '#e2e8f0';
                                    }}
                                >
                                    View Project
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="9 18 15 12 9 6"></polyline>
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
