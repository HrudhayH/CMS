import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import StaffLayout from '../../../layouts/staffLayout';
import { Alert, StatusBadge, Loader } from '../../../components';
import { getMOM, updateMOM, getStaffProjects } from '../../../services/api';
import { formatDate } from '../../../utils/helpers';

/* ---------- Icons ---------- */
const EditIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);

const SaveIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
    </svg>
);

const TrashIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" />
    </svg>
);

const PlusIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

const ArrowLeftIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
    </svg>
);

export default function MOMDetail() {
    const router = useRouter();
    const { id } = router.query;
    const [mom, setMom] = useState(null);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState(null);

    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            try {
                setLoading(true);
                const [momRes, projectsRes] = await Promise.all([
                    getMOM(id),
                    getStaffProjects()
                ]);
                setMom(momRes.data);
                setFormData({
                    ...momRes.data,
                    project_id: momRes.data.project_id._id, // Flatten for select
                    meeting_date: momRes.data.meeting_date?.split('T')[0],
                    next_followup_date: momRes.data.next_followup_date?.split('T')[0],
                    action_items: momRes.data.action_items?.map(item => ({
                        ...item,
                        deadline: item.deadline?.split('T')[0]
                    })) || [],
                    attendees: momRes.data.attendees || ['']
                });
                setProjects(projectsRes.data || []);
            } catch (err) {
                setError(err.message || 'Failed to fetch MOM details');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const response = await updateMOM(id, formData);
            setMom(response.data);
            setSuccess('MOM updated successfully');
            setEditing(false);
        } catch (err) {
            setError(err.message || 'Failed to update MOM');
        }
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Discussion Points Handlers
    const handlePointChange = (index, value) => {
        const newPoints = [...formData.discussion_points];
        newPoints[index] = value;
        setFormData(prev => ({ ...prev, discussion_points: newPoints }));
    };

    const addPoint = () => setFormData(prev => ({ ...prev, discussion_points: [...prev.discussion_points, ''] }));
    const removePoint = (index) => setFormData(prev => ({ ...prev, discussion_points: prev.discussion_points.filter((_, i) => i !== index) }));

    // Attendees Handlers
    const handleAttendeeChange = (index, value) => {
        const newAttendees = [...formData.attendees];
        newAttendees[index] = value;
        setFormData(prev => ({ ...prev, attendees: newAttendees }));
    };
    const addAttendee = () => setFormData(prev => ({ ...prev, attendees: [...prev.attendees, ''] }));
    const removeAttendee = (index) => setFormData(prev => ({ ...prev, attendees: prev.attendees.filter((_, i) => i !== index) }));

    // Action Items Handlers
    const handleActionChange = (index, field, value) => {
        const newActions = [...formData.action_items];
        newActions[index][field] = value;
        setFormData(prev => ({ ...prev, action_items: newActions }));
    };

    const addAction = () => setFormData(prev => ({ ...prev, action_items: [...prev.action_items, { point: '', assignee: '', deadline: '' }] }));
    const removeAction = (index) => setFormData(prev => ({ ...prev, action_items: prev.action_items.filter((_, i) => i !== index) }));

    if (loading) return <StaffLayout><Loader /></StaffLayout>;
    if (!mom && !error) return <StaffLayout><div className="p-4">MOM not found</div></StaffLayout>;

    return (
        <StaffLayout>
            <div className="mom-detail-page">
                <style jsx>{`
                    .mom-detail-page {
                        max-width: 900px;
                        margin: 0 auto;
                        padding: 24px;
                    }
                    .header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 24px;
                    }
                    .card {
                        background: white;
                        padding: 32px;
                        border-radius: 12px;
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                    }
                    .info-grid {
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        gap: 24px;
                        margin-bottom: 32px;
                        padding: 20px;
                        background: #f9fafb;
                        border-radius: 8px;
                    }
                    .info-item label {
                        font-size: 12px;
                        color: #6b7280;
                        text-transform: uppercase;
                        font-weight: 600;
                        display: block;
                        margin-bottom: 4px;
                    }
                    .info-item span {
                        font-size: 15px;
                        font-weight: 600;
                        color: #111827;
                    }
                    .content-section {
                        margin-bottom: 32px;
                    }
                    .content-section h3 {
                        font-size: 18px;
                        font-weight: 700;
                        margin-bottom: 16px;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        color: #111827;
                    }
                    .list-item {
                        padding: 12px 16px;
                        background: #fff;
                        border: 1px solid #e5e7eb;
                        border-radius: 8px;
                        margin-bottom: 8px;
                        display: flex;
                        gap: 12px;
                    }
                    .bullet {
                        color: #4f46e5;
                        font-weight: 900;
                    }
                    .action-table {
                        width: 100%;
                        border-collapse: collapse;
                    }
                    .action-table th {
                        text-align: left;
                        padding: 12px;
                        background: #f3f4f6;
                        font-size: 13px;
                        color: #4b5563;
                    }
                    .action-table td {
                        padding: 12px;
                        border-bottom: 1px solid #e5e7eb;
                        font-size: 14px;
                    }
                    .edit-row {
                        display: flex;
                        gap: 8px;
                        margin-bottom: 8px;
                    }
                    .edit-grid {
                        display: grid;
                        grid-template-columns: 2fr 1fr 1fr;
                        gap: 8px;
                        flex: 1;
                    }
                    input, select, textarea {
                        padding: 8px 12px;
                        border: 1px solid #d1d5db;
                        border-radius: 6px;
                        width: 100%;
                    }
                `}</style>

                <button
                    className="btn btn-ghost btn-with-icon"
                    onClick={() => router.push('/staff/mom')}
                    style={{ marginBottom: '16px', padding: '0 8px', marginLeft: '-8px' }}
                >
                    <ArrowLeftIcon /> Back to List
                </button>

                <div className="header">
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: '800' }}>{mom.mom_id}: {mom.meeting_title}</h1>
                        <p style={{ color: '#6b7280' }}>Created by {mom.creator?.name || 'Unknown'} on {formatDate(mom.createdAt)}</p>
                    </div>
                    {!editing ? (
                        <button className="btn btn-primary btn-with-icon" onClick={() => setEditing(true)}>
                            <EditIcon /> Edit MOM
                        </button>
                    ) : (
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
                            <button className="btn btn-success btn-with-icon" onClick={handleUpdate}>
                                <SaveIcon /> Save Changes
                            </button>
                        </div>
                    )}
                </div>

                {error && <Alert type="error" message={error} onClose={() => setError('')} />}
                {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

                <div className="card">
                    {!editing ? (
                        <>
                            <div className="info-grid">
                                <div className="info-item">
                                    <label>Project</label>
                                    <span>{mom.project_id.title} ({mom.project_id.projectCode})</span>
                                </div>
                                <div className="info-item">
                                    <label>Meeting Date</label>
                                    <span>{formatDate(mom.meeting_date)}</span>
                                </div>
                                <div className="info-item">
                                    <label>Status</label>
                                    <StatusBadge status={mom.status} />
                                </div>
                                <div className="info-item">
                                    <label>Client</label>
                                    <span>{mom.client_id.company || mom.client_id.name}</span>
                                </div>
                                <div className="info-item">
                                    <label>Next Follow-up</label>
                                    <span>{mom.next_followup_date ? formatDate(mom.next_followup_date) : 'Not Scheduled'}</span>
                                </div>
                                <div className="info-item">
                                    <label>Created By</label>
                                    <span>{mom.creator?.name || 'Unknown'}</span>
                                </div>
                            </div>

                            <div className="content-section">
                                <h3>Attendees</h3>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {mom.attendees?.map((person, i) => (
                                        <span key={i} style={{ padding: '4px 12px', background: '#e0e7ff', color: '#4338ca', borderRadius: '16px', fontSize: '13px', fontWeight: '500' }}>
                                            {person}
                                        </span>
                                    )) || <span>No attendees listed</span>}
                                </div>
                            </div>

                            <div className="content-section">
                                <h3>Discussion Points</h3>
                                {mom.discussion_points?.map((point, i) => (
                                    <div key={i} className="list-item">
                                        <span className="bullet">•</span>
                                        <span>{point}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="content-section">
                                <h3>Action Items</h3>
                                <div style={{ overflowX: 'auto' }}>
                                    <table className="action-table">
                                        <thead>
                                            <tr>
                                                <th>Action Point</th>
                                                <th>Assignee</th>
                                                <th>Deadline</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {mom.action_items?.map((item, i) => (
                                                <tr key={i}>
                                                    <td>{item.point}</td>
                                                    <td><strong>{item.assignee || '—'}</strong></td>
                                                    <td>{item.deadline ? formatDate(item.deadline) : '—'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    ) : (
                        <form onSubmit={handleUpdate}>
                            <div className="info-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                                <div className="info-item">
                                    <label>Meeting Title</label>
                                    <input name="meeting_title" value={formData.meeting_title} onChange={handleFormChange} required />
                                </div>
                                <div className="info-item">
                                    <label>Meeting Date</label>
                                    <input type="date" name="meeting_date" value={formData.meeting_date} onChange={handleFormChange} required />
                                </div>
                                <div className="info-item">
                                    <label>Status</label>
                                    <select name="status" value={formData.status} onChange={handleFormChange}>
                                        <option value="Open">Open</option>
                                        <option value="Closed">Closed</option>
                                    </select>
                                </div>
                                <div className="info-item">
                                    <label>Next Follow-up</label>
                                    <input type="date" name="next_followup_date" value={formData.next_followup_date} onChange={handleFormChange} />
                                </div>
                            </div>

                            <div className="content-section">
                                <h3>Attendees</h3>
                                {formData.attendees.map((person, idx) => (
                                    <div key={idx} className="edit-row">
                                        <input value={person} onChange={(e) => handleAttendeeChange(idx, e.target.value)} placeholder="Attendee name" />
                                        <button type="button" className="btn btn-ghost text-danger" onClick={() => removeAttendee(idx)}><TrashIcon /></button>
                                    </div>
                                ))}
                                <button type="button" className="btn btn-ghost" onClick={addAttendee}><PlusIcon /> Add Attendee</button>
                            </div>

                            <div className="content-section">
                                <h3>Discussion Points</h3>
                                {formData.discussion_points.map((point, idx) => (
                                    <div key={idx} className="edit-row">
                                        <input value={point} onChange={(e) => handlePointChange(idx, e.target.value)} />
                                        <button type="button" className="btn btn-ghost text-danger" onClick={() => removePoint(idx)}><TrashIcon /></button>
                                    </div>
                                ))}
                                <button type="button" className="btn btn-ghost" onClick={addPoint}><PlusIcon /> Add Point</button>
                            </div>

                            <div className="content-section">
                                <h3>Action Items</h3>
                                {formData.action_items.map((item, idx) => (
                                    <div key={idx} className="edit-row">
                                        <div className="edit-grid">
                                            <input placeholder="Point" value={item.point} onChange={(e) => handleActionChange(idx, 'point', e.target.value)} />
                                            <input placeholder="Assignee" value={item.assignee} onChange={(e) => handleActionChange(idx, 'assignee', e.target.value)} />
                                            <input type="date" value={item.deadline} onChange={(e) => handleActionChange(idx, 'deadline', e.target.value)} />
                                        </div>
                                        <button type="button" className="btn btn-ghost text-danger" onClick={() => removeAction(idx)}><TrashIcon /></button>
                                    </div>
                                ))}
                                <button type="button" className="btn btn-ghost" onClick={addAction}><PlusIcon /> Add Action Item</button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </StaffLayout >
    );
}
