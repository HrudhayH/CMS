import { useState, useEffect, useCallback } from 'react';
import ClientLayout from '../../layouts/ClientLayout';
import { DataTable, Pagination, Alert, StatusBadge, Loader, Modal } from '../../components';
import { formatDate } from '../../utils/helpers';
import { getAllMOMs } from '../../services/api';

const ITEMS_PER_PAGE = 10;

/* ---------- Icons ---------- */
const EyeIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
);

const CalendarIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);

export default function ClientMOM() {
    const [moms, setMoms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    const [selectedMOM, setSelectedMOM] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getAllMOMs({ page, limit: ITEMS_PER_PAGE });
            setMoms(response.data || []);
            setTotal(response.data?.length || 0);
        } catch (err) {
            setError(err.message || 'Failed to load meeting minutes');
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const viewMOMDetails = (mom) => {
        setSelectedMOM(mom);
        setShowModal(true);
    };

    const columns = [
        {
            key: 'mom_id',
            title: 'Ref ID',
            render: (value) => <span style={{ fontWeight: '600', color: '#6366f1' }}>{value}</span>
        },
        {
            key: 'meeting_title',
            title: 'Meeting Title',
            render: (value, row) => (
                <div>
                    <div style={{ fontWeight: '600', color: '#111827' }}>{value}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Project: {row.project_id?.title}</div>
                </div>
            )
        },
        {
            key: 'meeting_date',
            title: 'Date',
            render: (value) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CalendarIcon />
                    <span>{formatDate(value)}</span>
                </div>
            )
        },
        {
            key: 'creator',
            title: 'Conducted By',
            render: (value) => <span>{value?.name || 'Admin'}</span>
        },
        {
            key: 'status',
            title: 'Status',
            render: (value) => <StatusBadge status={value} />
        },
        {
            key: 'actions',
            title: 'View',
            align: 'right',
            render: (_, row) => (
                <button className="btn btn-ghost btn-icon-sm" onClick={() => viewMOMDetails(row)}>
                    <EyeIcon />
                </button>
            )
        }
    ];

    return (
        <ClientLayout>
            <div className="client-mom-page">
                <style jsx>{`
                    .client-mom-page { padding: 24px; max-width: 1200px; margin: 0 auto; }
                .header { margin-bottom: 32px; text-align: left; }
                .header h1 { font-size: 28px; font-weight: 800; color: #0f172a; margin: 0 0 8px 0; }
                .header p { color: #64748b; font-size: 15px; }
                
                .detail-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 24px; padding: 24px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; }
                .detail-label { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.025em; }
                .detail-value { font-size: 15px; font-weight: 600; color: #1e293b; }

                .section { margin-bottom: 32px; }
                .section h4 { font-size: 16px; font-weight: 700; color: #1e293b; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
                .item-card { padding: 14px 18px; background: white; border: 1px solid #e2e8f0; border-radius: 10px; margin-bottom: 10px; font-size: 14px; line-height: 1.6; color: #334155; box-shadow: 0 1px 2px rgba(0,0,0,0.02); }
                
                .action-table { width: 100%; border-collapse: separate; border-spacing: 0; }
                .action-table th { text-align: left; padding: 12px 16px; background: #f8fafc; color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; letter-spacing: 0.05em; }
                .action-table td { padding: 14px 16px; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #334155; }
                .action-table tr:last-child td { border-bottom: none; }
                `}</style>

                <div className="header">
                    <h1>Meeting Minutes</h1>
                    <p>Track discussions, decisions, and action items for your projects</p>
                </div>

                {error && <Alert type="error" message={error} onClose={() => setError('')} />}

                <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                    <DataTable columns={columns} data={moms} loading={loading} />
                </div>

                <Pagination
                    currentPage={page}
                    totalPages={Math.ceil(total / ITEMS_PER_PAGE)}
                    onPageChange={setPage}
                />

                <Modal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    title={selectedMOM ? `${selectedMOM.mom_id}: ${selectedMOM.meeting_title}` : 'Meeting Minutes'}
                    size="large"
                >
                    {selectedMOM && (
                        <div className="mom-view-content">
                            <div className="detail-grid">
                                <div>
                                    <div className="detail-label">Project</div>
                                    <div className="detail-value">{selectedMOM.project_id?.title}</div>
                                </div>
                                <div>
                                    <div className="detail-label">Meeting Date</div>
                                    <div className="detail-value">{formatDate(selectedMOM.meeting_date)}</div>
                                </div>
                                <div>
                                    <div className="detail-label">Conducted By</div>
                                    <div className="detail-value">{selectedMOM.creator?.name || 'Admin'}</div>
                                </div>
                                <div>
                                    <div className="detail-label">Status</div>
                                    <div><StatusBadge status={selectedMOM.status} /></div>
                                </div>
                            </div>

                            <div className="section">
                                <h4>Meeting Participants</h4>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                                    {selectedMOM.attendees && selectedMOM.attendees.length > 0 ? (
                                        selectedMOM.attendees.map((person, i) => (
                                            <span key={i} style={{
                                                padding: '6px 14px',
                                                background: '#f8fafc',
                                                color: '#475569',
                                                borderRadius: '20px',
                                                fontSize: '13px',
                                                fontWeight: '600',
                                                border: '1px solid #e2e8f0'
                                            }}>
                                                {person}
                                            </span>
                                        ))
                                    ) : (
                                        <span style={{ color: '#94a3b8', fontSize: '14px', fontStyle: 'italic' }}>No attendees listed</span>
                                    )}
                                </div>
                            </div>

                            <div className="section">
                                <h4>Discussion Summary</h4>
                                {selectedMOM.discussion_points?.map((p, i) => (
                                    <div key={i} className="item-card">• {p}</div>
                                ))}
                            </div>

                            <div className="section">
                                <h4>Action Items & Next Steps</h4>
                                <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                                    <table className="action-table">
                                        <thead>
                                            <tr>
                                                <th>Item</th>
                                                <th>Assignee</th>
                                                <th>Target Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedMOM.action_items?.map((item, i) => (
                                                <tr key={i}>
                                                    <td style={{ fontWeight: '500' }}>{item.point}</td>
                                                    <td>{item.assignee || '—'}</td>
                                                    <td>{item.deadline ? formatDate(item.deadline) : '—'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </Modal>
            </div>
        </ClientLayout>
    );
}
