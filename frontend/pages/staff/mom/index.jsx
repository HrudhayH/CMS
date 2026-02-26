import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import StaffLayout from '../../../layouts/staffLayout';
import { DataTable, Pagination, Alert, StatusBadge } from '../../../components';
import { formatDate } from '../../../utils/helpers';
import { getAllMOMs, deleteMOM } from '../../../services/api';

const ITEMS_PER_PAGE = 10;

/* ---------- Icons ---------- */
const FilePlusIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="12" y1="18" x2="12" y2="12" />
        <line x1="9" y1="15" x2="15" y2="15" />
    </svg>
);

const EyeIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const EditIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);

const TrashIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <line x1="10" y1="11" x2="10" y2="17" />
        <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
);

export default function StaffMOMList() {
    const router = useRouter();
    const [moms, setMoms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    const fetchMOMs = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getAllMOMs({ page, limit: ITEMS_PER_PAGE });
            setMoms(response.data || []);
            setTotal(response.data?.length || 0); // Total count handling if API supports it
        } catch (err) {
            setError(err.message || 'Failed to load MOMs');
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        fetchMOMs();
    }, [fetchMOMs]);

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this MOM?')) return;
        try {
            await deleteMOM(id);
            setSuccess('MOM deleted successfully');
            fetchMOMs();
        } catch (err) {
            setError(err.message || 'Failed to delete MOM');
        }
    };

    const columns = [
        {
            key: 'mom_id',
            title: 'MOM ID',
            render: (value) => <strong>{value}</strong>
        },
        {
            key: 'meeting_title',
            title: 'Title',
            render: (value) => <span className="title-text">{value}</span>
        },
        {
            key: 'project_id',
            title: 'Project',
            render: (value) => <span>{value?.title || 'N/A'}</span>
        },
        {
            key: 'creator',
            title: 'Created By',
            render: (value) => <span>{value?.name || 'Admin'}</span>
        },
        {
            key: 'meeting_date',
            title: 'Date',
            render: (value) => formatDate(value)
        },
        {
            key: 'status',
            title: 'Status',
            render: (value) => <StatusBadge status={value} />
        },
        {
            key: 'actions',
            title: 'Actions',
            align: 'right',
            render: (_, row) => (
                <div className="table-actions">
                    <button
                        className="btn btn-ghost btn-icon-sm"
                        onClick={() => router.push(`/staff/mom/${row._id}`)}
                        title="View Details"
                    >
                        <EyeIcon />
                    </button>
                    <button
                        className="btn btn-ghost btn-icon-sm"
                        onClick={() => handleDelete(row._id)}
                        title="Delete"
                    >
                        <TrashIcon />
                    </button>
                </div>
            )
        }
    ];

    return (
        <StaffLayout>
            <div className="mom-list-page">
                <style jsx>{`
                    .mom-list-page {
                        padding: 24px;
                    }
                    .page-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 24px;
                    }
                    .page-title {
                        font-size: 24px;
                        font-weight: 700;
                        margin: 0;
                        color: #111827;
                    }
                    .table-actions {
                        display: flex;
                        gap: 8px;
                        justify-content: flex-end;
                    }
                    .title-text {
                        font-weight: 500;
                        color: #374151;
                    }
                `}</style>

                <div className="page-header">
                    <h1 className="page-title">Minutes of Meeting (MOM)</h1>
                    <button
                        className="btn btn-primary btn-with-icon"
                        onClick={() => router.push('/staff/mom/create')}
                    >
                        <FilePlusIcon />
                        Create MOM
                    </button>
                </div>

                {error && <Alert type="error" message={error} onClose={() => setError('')} />}
                {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

                <DataTable
                    columns={columns}
                    data={moms}
                    loading={loading}
                />

                {total > ITEMS_PER_PAGE && (
                    <Pagination
                        currentPage={page}
                        totalPages={Math.ceil(total / ITEMS_PER_PAGE)}
                        onPageChange={setPage}
                    />
                )}
            </div>
        </StaffLayout>
    );
}
