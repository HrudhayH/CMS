import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import StaffLayout from '../../../layouts/staffLayout';
import { Alert } from '../../../components';
import { getStaffProjects, createMOM } from '../../../services/api';

/* ---------- Icons ---------- */
const PlusIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

const TrashIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" />
    </svg>
);

export default function CreateMOM() {
    const router = useRouter();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        project_id: '',
        client_id: '',
        meeting_date: new Date().toISOString().split('T')[0],
        meeting_title: '',
        attendees: [''],
        discussion_points: [''],
        action_items: [{ point: '', assignee: '', deadline: '' }],
        next_followup_date: '',
        status: 'Open'
    });

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await getStaffProjects();
                setProjects(response.data || []);
            } catch (err) {
                console.error('Failed to load projects', err);
            }
        };
        fetchProjects();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'project_id') {
            const project = projects.find(p => p._id === value);
            setFormData(prev => ({
                ...prev,
                project_id: value,
                client_id: project?.assignedClients?.[0]?._id || ''
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    // Discussion Points Handlers
    const handlePointChange = (index, value) => {
        const newPoints = [...formData.discussion_points];
        newPoints[index] = value;
        setFormData(prev => ({ ...prev, discussion_points: newPoints }));
    };

    const addPoint = () => {
        setFormData(prev => ({
            ...prev,
            discussion_points: [...prev.discussion_points, '']
        }));
    };

    const removePoint = (index) => {
        const newPoints = formData.discussion_points.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, discussion_points: newPoints }));
    };

    // Attendees Handlers
    const handleAttendeeChange = (index, value) => {
        const newAttendees = [...formData.attendees];
        newAttendees[index] = value;
        setFormData(prev => ({ ...prev, attendees: newAttendees }));
    };

    const addAttendee = () => {
        setFormData(prev => ({
            ...prev,
            attendees: [...prev.attendees, '']
        }));
    };

    const removeAttendee = (index) => {
        const newAttendees = formData.attendees.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, attendees: newAttendees }));
    };

    // Action Items Handlers
    const handleActionChange = (index, field, value) => {
        const newActions = [...formData.action_items];
        newActions[index][field] = value;
        setFormData(prev => ({ ...prev, action_items: newActions }));
    };

    const addAction = () => {
        setFormData(prev => ({
            ...prev,
            action_items: [...prev.action_items, { point: '', assignee: '', deadline: '' }]
        }));
    };

    const removeAction = (index) => {
        const newActions = formData.action_items.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, action_items: newActions }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await createMOM(formData);
            setSuccess('MOM created successfully!');
            setTimeout(() => router.push('/staff/mom'), 1500);
        } catch (err) {
            setError(err.message || 'Failed to create MOM');
        } finally {
            setLoading(false);
        }
    };

    return (
        <StaffLayout>
            <div className="create-mom-page">
                <style jsx>{`
                    .create-mom-page {
                        max-width: 800px;
                        margin: 0 auto;
                        padding: 32px 24px;
                    }
                    .form-card {
                        background: white;
                        padding: 32px;
                        border-radius: 12px;
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                    }
                    .section-title {
                        font-size: 18px;
                        font-weight: 600;
                        color: #111827;
                        margin: 24px 0 16px;
                        padding-bottom: 8px;
                        border-bottom: 1px solid #e5e7eb;
                    }
                    .form-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 16px;
                    }
                    .form-group {
                        margin-bottom: 20px;
                    }
                    .form-group.full {
                        grid-column: span 2;
                    }
                    label {
                        display: block;
                        font-size: 14px;
                        font-weight: 500;
                        color: #374151;
                        margin-bottom: 6px;
                    }
                    input, select, textarea {
                        width: 100%;
                        padding: 10px 12px;
                        border: 1px solid #d1d5db;
                        border-radius: 6px;
                        font-size: 14px;
                        transition: border-color 0.2s;
                    }
                    input:focus, select:focus, textarea:focus {
                        outline: none;
                        border-color: #4f46e5;
                        ring: 2px solid #e0e7ff;
                    }
                    .dynamic-row {
                        display: flex;
                        gap: 8px;
                        margin-bottom: 8px;
                        align-items: flex-start;
                    }
                    .action-item-grid {
                        display: grid;
                        grid-template-columns: 2fr 1fr 1fr;
                        gap: 8px;
                        flex: 1;
                    }
                    .btn-small {
                        padding: 8px;
                        height: 38px;
                        width: 38px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    .add-btn {
                        margin-top: 8px;
                        color: #4f46e5;
                        background: #f5f3ff;
                        border: none;
                        padding: 6px 12px;
                        border-radius: 6px;
                        font-size: 13px;
                        font-weight: 500;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        gap: 4px;
                    }
                    .form-actions {
                        display: flex;
                        justify-content: flex-end;
                        gap: 12px;
                        margin-top: 32px;
                    }
                `}</style>

                <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px' }}>Create New Minutes of Meeting</h1>

                <form className="form-card" onSubmit={handleSubmit}>
                    {error && <Alert type="error" message={error} onClose={() => setError('')} />}
                    {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

                    <div className="section-title" style={{ marginTop: 0 }}>Basic Information</div>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Project *</label>
                            <select name="project_id" value={formData.project_id} onChange={handleChange} required>
                                <option value="">Select Project</option>
                                {projects.map(p => (
                                    <option key={p._id} value={p._id}>{p.title}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Meeting Date *</label>
                            <input type="date" name="meeting_date" value={formData.meeting_date} onChange={handleChange} required />
                        </div>
                        <div className="form-group full">
                            <label>Meeting Title *</label>
                            <input type="text" name="meeting_title" value={formData.meeting_title} onChange={handleChange} placeholder="e.g. Weekly Sync, Project Kickoff" required />
                        </div>
                    </div>

                    <div className="section-title">Attendees</div>
                    {formData.attendees.map((attendee, idx) => (
                        <div key={idx} className="dynamic-row">
                            <input
                                placeholder={`Attendee ${idx + 1}`}
                                value={attendee}
                                onChange={(e) => handleAttendeeChange(idx, e.target.value)}
                                required
                            />
                            {formData.attendees.length > 1 && (
                                <button type="button" className="btn btn-ghost btn-small text-danger" onClick={() => removeAttendee(idx)}>
                                    <TrashIcon />
                                </button>
                            )}
                        </div>
                    ))}
                    <button type="button" className="add-btn" onClick={addAttendee}>
                        <PlusIcon /> Add Attendee
                    </button>

                    <div className="section-title">Discussion Points</div>
                    {formData.discussion_points.map((point, idx) => (
                        <div key={idx} className="dynamic-row">
                            <input
                                placeholder={`Point ${idx + 1}`}
                                value={point}
                                onChange={(e) => handlePointChange(idx, e.target.value)}
                                required
                            />
                            {formData.discussion_points.length > 1 && (
                                <button type="button" className="btn btn-ghost btn-small text-danger" onClick={() => removePoint(idx)}>
                                    <TrashIcon />
                                </button>
                            )}
                        </div>
                    ))}
                    <button type="button" className="add-btn" onClick={addPoint}>
                        <PlusIcon /> Add Point
                    </button>

                    <div className="section-title">Action Items</div>
                    {formData.action_items.map((item, idx) => (
                        <div key={idx} className="dynamic-row">
                            <div className="action-item-grid">
                                <input
                                    placeholder="Action point"
                                    value={item.point}
                                    onChange={(e) => handleActionChange(idx, 'point', e.target.value)}
                                    required
                                />
                                <input
                                    placeholder="Assignee"
                                    value={item.assignee}
                                    onChange={(e) => handleActionChange(idx, 'assignee', e.target.value)}
                                />
                                <input
                                    type="date"
                                    value={item.deadline}
                                    onChange={(e) => handleActionChange(idx, 'deadline', e.target.value)}
                                />
                            </div>
                            {formData.action_items.length > 1 && (
                                <button type="button" className="btn btn-ghost btn-small text-danger" onClick={() => removeAction(idx)}>
                                    <TrashIcon />
                                </button>
                            )}
                        </div>
                    ))}
                    <button type="button" className="add-btn" onClick={addAction}>
                        <PlusIcon /> Add Action Item
                    </button>

                    <div className="section-title">Next Steps</div>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Next Follow-up Date</label>
                            <input type="date" name="next_followup_date" value={formData.next_followup_date} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Status</label>
                            <select name="status" value={formData.status} onChange={handleChange}>
                                <option value="Open">Open</option>
                                <option value="Closed">Closed</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn btn-secondary" onClick={() => router.back()}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Creating...' : 'Save MOM'}
                        </button>
                    </div>
                </form>
            </div>
        </StaffLayout>
    );
}
