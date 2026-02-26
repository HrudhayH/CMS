import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { DataTable, Pagination, Alert, StatusBadge, Loader, Modal } from '../../components';
import { formatDate } from '../../utils/helpers';
import { getAllMOMs, getAllClients, getAllStaff, getProjects } from '../../services/api';

const ITEMS_PER_PAGE = 10;

/* ---------- Icons ---------- */
const FilterIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
);

const EyeIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
);

export default function AdminMOM() {
    const [moms, setMoms] = useState([]);
    const [clients, setClients] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    const [filters, setFilters] = useState({
        client: '',
        project: '',
        staff: '',
        date: '',
        status: ''
    });

    const [selectedMOM, setSelectedMOM] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [momsRes, clientsRes, staffRes, projectsRes] = await Promise.all([
                getAllMOMs({ ...filters, page, limit: ITEMS_PER_PAGE }),
                getAllClients(),
                getAllStaff(),
                getProjects(1, 100)
            ]);
            setMoms(momsRes.data || []);
            setTotal(momsRes.data?.length || 0);
            setClients(clientsRes.data || []);
            setStaffList(staffRes.data || []);
            setProjects(projectsRes.data || []);
        } catch (err) {
            setError(err.message || 'Failed to load MOM data');
        } finally {
            setLoading(false);
        }
    }, [filters, page]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setPage(1);
    };

    const viewMOMDetails = (mom) => {
        setSelectedMOM(mom);
        setShowModal(true);
    };

    const columns = [
        {
            key: 'mom_id',
            title: 'MOM ID',
            render: (value) => <strong>{value}</strong>
        },
        {
            key: 'meeting_title',
            title: 'Meeting Details',
            render: (value, row) => (
                <div>
                    <div style={{ fontWeight: '600', color: '#111827' }}>{value}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Project: {row.project_id?.title}</div>
                </div>
            )
        },
        {
            key: 'client_id',
            title: 'Client',
            render: (value) => <span>{value?.company || value?.name || 'N/A'}</span>
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
                <button className="btn btn-ghost btn-icon-sm" onClick={() => viewMOMDetails(row)}>
                    <EyeIcon />
                </button>
            )
        }
    ];

    return (
        <AdminLayout>
            <div className="admin-mom-page">
                <style jsx>{`
                    .admin-mom-page { padding: 24px; }
                    .header { margin-bottom: 24px; }
                    .filters-bar {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                        gap: 16px;
                        background: white;
                        padding: 20px;
                        border-radius: 12px;
                        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                        margin-bottom: 24px;
                    }
                    .filter-group label {
                        display: block;
                        font-size: 12px;
                        font-weight: 600;
                        color: #6b7280;
                        margin-bottom: 6px;
                        text-transform: uppercase;
                    }
                    select, input {
                        width: 100%;
                        padding: 8px 12px;
                        border: 1px solid #d1d5db;
                        border-radius: 6px;
                        font-size: 14px;
                    }
                    .detail-section { margin-bottom: 24px; }
                    .detail-section h4 { 
                        font-size: 16px; 
                        font-weight: 700; 
                        margin-bottom: 12px;
                        color: #111827;
                        border-bottom: 1px solid #e5e7eb;
                        padding-bottom: 8px;
                    }
                    .point-item {
                        padding: 8px 12px;
                        background: #f9fafb;
                        border-radius: 6px;
                        margin-bottom: 6px;
                        font-size: 14px;
                    }
                    .action-table {
                        width: 100%;
                        border-collapse: collapse;
                    }
                    .action-table th { text-align: left; padding: 10px; background: #f3f4f6; font-size: 12px; }
                    .action-table td { padding: 10px; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
                `}</style>

                <div className="header">
                    <h1 style={{ fontSize: '28px', fontWeight: '800', margin: 0 }}>Minutes of Meeting Management</h1>
                    <p style={{ color: '#6b7280', marginTop: '4px' }}>View and audit all meeting minutes across the platform</p>
                </div>

                <div className="filters-bar">
                    <div className="filter-group">
                        <label>Client</label>
                        <select name="client" value={filters.client} onChange={handleFilterChange}>
                            <option value="">All Clients</option>
                            {clients.map(c => <option key={c._id} value={c._id}>{c.company || c.name}</option>)}
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Project</label>
                        <select name="project" value={filters.project} onChange={handleFilterChange}>
                            <option value="">All Projects</option>
                            {projects.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Staff</label>
                        <select name="staff" value={filters.staff} onChange={handleFilterChange}>
                            <option value="">All Staff</option>
                            {staffList.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Status</label>
                        <select name="status" value={filters.status} onChange={handleFilterChange}>
                            <option value="">All Status</option>
                            <option value="Open">Open</option>
                            <option value="Closed">Closed</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Date</label>
                        <input type="date" name="date" value={filters.date} onChange={handleFilterChange} />
                    </div>
                </div>

                {error && <Alert type="error" message={error} onClose={() => setError('')} />}

                <DataTable columns={columns} data={moms} loading={loading} />

                <Pagination
                    currentPage={page}
                    totalPages={Math.ceil(total / ITEMS_PER_PAGE)}
                    onPageChange={setPage}
                />

                {/* MOM Details Modal */}
                <Modal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    title={selectedMOM ? `${selectedMOM.mom_id}: ${selectedMOM.meeting_title}` : 'MOM Details'}
                    size="large"
                >
                    {selectedMOM && (
                        <div className="mom-modal-content">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px', padding: '16px', background: '#f3f4f6', borderRadius: '8px' }}>
                                <div><strong>Meeting Date:</strong> {formatDate(selectedMOM.meeting_date)}</div>
                                <div><strong>Status:</strong> <StatusBadge status={selectedMOM.status} /></div>
                                <div><strong>Project:</strong> {selectedMOM.project_id?.title}</div>
                                <div><strong>Created By:</strong> {selectedMOM.creator?.name || 'Admin'} ({selectedMOM.creator?.email || 'N/A'})</div>
                            </div>

                            <div className="detail-section">
                                <h4>Attendees</h4>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                                    {selectedMOM.attendees?.map((person, i) => (
                                        <span key={i} style={{ padding: '4px 12px', background: '#e0e7ff', color: '#4338ca', borderRadius: '16px', fontSize: '13px', fontWeight: '500' }}>
                                            {person}
                                        </span>
                                    )) || <span>No attendees listed</span>}
                                </div>
                            </div>

                            <div className="detail-section">
                                <h4>Discussion Points</h4>
                                {selectedMOM.discussion_points?.map((p, i) => (
                                    <div key={i} className="point-item">• {p}</div>
                                ))}
                            </div>

                            <div className="detail-section">
                                <h4>Action Items</h4>
                                <table className="action-table">
                                    <thead>
                                        <tr>
                                            <th>Point</th>
                                            <th>Assignee</th>
                                            <th>Deadline</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedMOM.action_items?.map((item, i) => (
                                            <tr key={i}>
                                                <td>{item.point}</td>
                                                <td>{item.assignee || '—'}</td>
                                                <td>{item.deadline ? formatDate(item.deadline) : '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </Modal>
            </div>
        </AdminLayout>
    );
}
