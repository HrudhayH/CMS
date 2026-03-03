import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../../layouts/AdminLayout';
import { DataTable, StatusBadge, Alert, Loader } from '../../../components';
import { getClientWithProjects } from '../../../services/api';
import { formatDate } from '../../../utils/helpers';

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

    if (loading) return <div className="flex h-96 items-center justify-center"><Loader /></div>;
    if (error) return <Alert type="error" message={error} />;
    if (!client) return <Alert type="error" message="Client not found" />;

    const projectColumns = [
        {
            key: 'title',
            title: 'Project Name',
            render: (val) => <span style={{ fontWeight: 500 }}>{val}</span>
        },
        {
            key: 'status',
            title: 'Status',
            render: (val) => <StatusBadge status={val} />
        },
        {
            key: 'startDate',
            title: 'Start Date',
            render: (val) => <span style={{ color: 'var(--color-text-muted)' }}>{formatDate(val)}</span>
        },
        {
            key: 'endDate',
            title: 'End Date',
            render: (val) => <span style={{ color: 'var(--color-text-muted)' }}>{formatDate(val)}</span>
        },
        {
            key: 'actions',
            title: 'Actions',
            render: (_, project) => (
                <button
                    onClick={() => router.push(`/admin/projects/${project._id}`)}
                    className="btn btn-ghost btn-sm"
                    style={{ color: 'var(--color-primary-600)', fontSize: '13px' }}
                >
                    View Project
                </button>
            )
        }
    ];

    // Shared Card Style from clients.jsx pattern
    const cardStyle = {
        backgroundColor: 'white',
        borderRadius: 'var(--border-radius-lg, 8px)',
        border: '1px solid var(--color-border, #e5e7eb)',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        padding: '24px'
    };

    const labelStyle = {
        display: 'block',
        fontSize: '12px',
        fontWeight: '600',
        textTransform: 'uppercase',
        color: 'var(--color-text-muted)',
        marginBottom: '4px'
    };

    const valueStyle = {
        fontSize: '14px',
        color: 'var(--color-text-primary)',
        fontWeight: '500'
    };

    return (
        <div>
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <button
                        onClick={() => router.push('/admin/clients')}
                        className="btn btn-ghost"
                        style={{ paddingLeft: 0, marginBottom: '8px', color: 'var(--color-text-muted)' }}
                    >
                        &larr; Back to Clients
                    </button>
                    <h1 className="page-title">{client.name}</h1>
                    <p className="page-subtitle">Client Details & Projects</p>
                </div>
            </div>

            {/* Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px' }}>

                {/* Left Column: Client Details (4 cols) */}
                <div style={{ gridColumn: 'span 4' }}>
                    <div style={cardStyle}>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--color-border)' }}>
                            Client Information
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <span style={labelStyle}>Email</span>
                                <div style={valueStyle}>{client.email}</div>
                            </div>

                            <div>
                                <span style={labelStyle}>Phone</span>
                                <div style={valueStyle}>{client.phone || '-'}</div>
                            </div>

                            <div>
                                <span style={labelStyle}>Company</span>
                                <div style={valueStyle}>{client.company || '-'}</div>
                            </div>

                            <div>
                                <span style={labelStyle}>Status</span>
                                <div style={{ marginTop: '4px' }}>
                                    <StatusBadge status={client.status} />
                                </div>
                            </div>

                            <div>
                                <span style={labelStyle}>Joined Date</span>
                                <div style={valueStyle}>{formatDate(client.createdAt)}</div>
                            </div>

                            <div>
                                <span style={labelStyle}>Address</span>
                                <div style={{ ...valueStyle, whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                                    {client.address || '-'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Projects (8 cols) */}
                <div style={{ gridColumn: 'span 8' }}>
                    <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Assigned Projects</h3>
                            <span style={{ backgroundColor: 'var(--color-bg-secondary)', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                                {projects.length} Total
                            </span>
                        </div>

                        <DataTable
                            columns={projectColumns}
                            data={projects}
                            pagination={false}
                            loading={false}
                            emptyMessage="No projects found"
                        />
                    </div>
                </div>

            </div>
        </div>
    );
}

ClientDetails.getLayout = function getLayout(page) {
    return <AdminLayout>{page}</AdminLayout>;
};