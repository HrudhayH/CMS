import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../../layouts/AdminLayout';
import { DataTable, StatusBadge, Alert, Loader } from '../../../components';
import { getClientWithProjects } from '../../../services/api';
import { formatDate } from '../../../utils/helpers';

const MailIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
    </svg>
);

const PhoneIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l2.27-2.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
);

const BuildingIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2" width="16" height="20" rx="2" ry="2" /><line x1="9" y1="22" x2="9" y2="2" /><line x1="17" y1="22" x2="17" y2="2" />
    </svg>
);

export default function ClientDetails() {
    const router = useRouter();
    const { id } = router.query;

    const [client, setClient] = useState(null);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchClientDetails = useCallback(async () => {
        if (!id) return;
        try {
            setLoading(true);
            const response = await getClientWithProjects(id);
            setClient(response.data.client);
            setProjects(response.data.projects || []);
            setError('');
        } catch (err) {
            setError(err.message || 'Failed to load client details');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchClientDetails();
    }, [fetchClientDetails]);

    if (loading) return (
        <div style={{ display: 'flex', height: '400px', alignItems: 'center', justifyContent: 'center' }}>
            <Loader />
        </div>
    );
    if (error) return <Alert type="error" message={error} />;
    if (!client) return <Alert type="error" message="Client not found" />;

    const projectColumns = [
        {
            key: 'title',
            title: 'Project Name',
            render: (val, project) => (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 600, color: 'var(--color-primary-600)' }}>{val}</span>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>{project.projectCode}</span>
                </div>
            )
        },
        {
            key: 'status',
            title: 'Status',
            render: (val) => <StatusBadge status={val} />
        },
        {
            key: 'startDate',
            title: 'Start Date',
            render: (val) => <span style={{ fontSize: '13px', color: '#444' }}>{formatDate(val)}</span>
        },
        {
            key: 'actions',
            title: '',
            render: (_, project) => (
                <button
                    onClick={() => router.push(`/admin/projects/${project._id}`)}
                    className="btn btn-sm"
                    style={{
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        color: '#475569',
                        fontSize: '12px',
                        padding: '4px 10px'
                    }}
                >
                    Details
                </button>
            )
        }
    ];

    return (
        <div style={{ padding: '10px' }}>
            <style jsx>{`
                .header-nav {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 24px;
                }
                .back-link {
                    color: var(--color-text-muted);
                    text-decoration: none;
                    font-size: 14px;
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }
                .back-link:hover {
                    color: var(--color-primary);
                }
                .client-profile-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    margin-bottom: 32px;
                    border-bottom: 2px solid #f1f5f9;
                    padding-bottom: 24px;
                }
                .client-info-main h1 {
                    font-size: 32px;
                    font-weight: 700;
                    margin: 0 0 8px 0;
                    color: #1e293b;
                }
                .client-sub {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    color: #64748b;
                    font-size: 14px;
                    font-weight: 500;
                }
                .stats-container {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 16px;
                    margin-bottom: 32px;
                }
                .stat-box {
                    background: #fff;
                    padding: 20px;
                    border-radius: 12px;
                    border: 1px solid #e2e8f0;
                }
                .stat-label {
                    display: block;
                    font-size: 12px;
                    color: #94a3b8;
                    font-weight: 600;
                    text-transform: uppercase;
                    margin-bottom: 4px;
                }
                .stat-value {
                    font-size: 20px;
                    font-weight: 700;
                    color: #1e293b;
                }
                .details-grid {
                    display: grid;
                    grid-template-columns: 320px 1fr;
                    gap: 32px;
                    align-items: start;
                }
                .card {
                    background: white;
                    border-radius: 12px;
                    border: 1px solid #e2e8f0;
                    padding: 24px;
                }
                .card-title {
                    font-size: 16px;
                    font-weight: 700;
                    color: #1e293b;
                    margin-bottom: 20px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .info-item {
                    margin-bottom: 20px;
                }
                .info-item:last-child {
                    margin-bottom: 0;
                }
                .info-label {
                    font-size: 12px;
                    font-weight: 600;
                    color: #94a3b8;
                    text-transform: uppercase;
                    margin-bottom: 4px;
                    display: block;
                }
                .info-value {
                    font-size: 14px;
                    font-weight: 500;
                    color: #334155;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .projects-card {
                    padding: 0;
                    overflow: hidden;
                }
                .projects-header {
                    padding: 20px 24px;
                    border-bottom: 1px solid #f1f5f9;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
            `}</style>

            <div className="header-nav">
                <button
                    onClick={() => router.push('/admin/clients')}
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                    className="back-link"
                >
                    ← Back to Clients
                </button>
            </div>

            <div className="client-profile-header">
                <div className="client-info-main">
                    <h1>{client.name}</h1>
                    <div className="client-sub">
                        <span>{client.clientCode}</span>
                        <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#cbd5e1' }}></span>
                        <BuildingIcon />
                        <span>{client.company || 'Private Client'}</span>
                        <StatusBadge status={client.status} />
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>REGISTRATION DATE</div>
                    <div style={{ fontSize: '15px', fontWeight: '600', color: '#475569' }}>{formatDate(client.createdAt)}</div>
                </div>
            </div>

            <div className="stats-container">
                <div className="stat-box">
                    <span className="stat-label">Total Projects</span>
                    <span className="stat-value">{projects.length}</span>
                </div>
                <div className="stat-box">
                    <span className="stat-label">Completed</span>
                    <span className="stat-value" style={{ color: '#16a34a' }}>
                        {projects.filter(p => p.status === 'Completed').length}
                    </span>
                </div>
                <div className="stat-box">
                    <span className="stat-label">Active</span>
                    <span className="stat-value" style={{ color: '#2563eb' }}>
                        {projects.filter(p => p.status === 'In Progress').length}
                    </span>
                </div>
                <div className="stat-box">
                    <span className="stat-label">On Hold</span>
                    <span className="stat-value" style={{ color: '#f59e0b' }}>
                        {projects.filter(p => p.status === 'On Hold').length}
                    </span>
                </div>
            </div>

            <div className="details-grid">
                <div className="card">
                    <h3 className="card-title">Business Information</h3>

                    <div className="info-item">
                        <span className="info-label">Company Name</span>
                        <div className="info-value">
                            <BuildingIcon /> {client.company || <span style={{ color: '#94a3b8' }}>Not specified</span>}
                        </div>
                    </div>

                    <div className="info-item">
                        <span className="info-label">GST Number</span>
                        <div className="info-value">
                            <span style={{ fontWeight: '700', color: '#64748b', fontSize: '10px', border: '1px solid #e2e8f0', padding: '1px 4px', borderRadius: '3px', lineHeight: '1' }}>GST</span>
                            {client.gst || <span style={{ color: '#94a3b8' }}>Not provided</span>}
                        </div>
                    </div>

                    <div style={{ margin: '24px 0', borderTop: '1px solid #f1f5f9' }}></div>

                    <h3 className="card-title">Contact Information</h3>

                    <div className="info-item">
                        <span className="info-label">Email Address</span>
                        <div className="info-value">
                            <MailIcon /> {client.email}
                        </div>
                    </div>

                    <div className="info-item">
                        <span className="info-label">Phone Number</span>
                        <div className="info-value">
                            <PhoneIcon /> {client.phone || '--'}
                        </div>
                    </div>

                    <div className="info-item">
                        <span className="info-label">Postal Address</span>
                        <div className="info-value" style={{ lineHeight: '1.4' }}>
                            {client.address || '--'}
                        </div>
                    </div>
                </div>

                <div className="card projects-card">
                    <div className="projects-header">
                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>Project Portfolio</h3>
                        <div style={{ fontSize: '12px', fontWeight: '600', background: '#f1f5f9', color: '#475569', padding: '4px 12px', borderRadius: '20px' }}>
                            {projects.length} PROJECTS
                        </div>
                    </div>
                    <DataTable
                        columns={projectColumns}
                        data={projects}
                        pagination={false}
                        loading={false}
                        emptyMessage="No projects currently assigned."
                    />
                </div>
            </div>
        </div>
    );
}

ClientDetails.getLayout = function getLayout(page) {
    return <AdminLayout>{page}</AdminLayout>;
};
