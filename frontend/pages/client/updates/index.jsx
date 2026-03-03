import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { withClientLayout } from '../../../layouts/ClientLayout';
import { getClientAllUpdates, getClientProjects, addClientUpdateReply } from '../../../services/api';

const getStatusColor = (status) => {
    const colors = {
        'New': '#94a3b8',
        'In Progress': '#3b82f6',
        'Completed': '#10b981',
        'On Hold': '#f59e0b',
    };
    return colors[status] || '#3b82f6';
};

function ClientDailyUpdates() {
    const [updates, setUpdates] = useState([]);
    const [assignedProjects, setAssignedProjects] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [newComments, setNewComments] = useState({});
    const [postingComment, setPostingComment] = useState({});
    const router = useRouter();

    const fetchData = async () => {
        try {
            setLoading(true);
            const [updatesRes, projectsRes] = await Promise.all([
                getClientAllUpdates(),
                getClientProjects()
            ]);
            setUpdates(updatesRes.data || []);
            setAssignedProjects(projectsRes.data || []);
            setError('');
        } catch (err) {
            setError(err.message || 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handlePostReply = async (projectId, updateId) => {
        const replyText = newComments[updateId];
        if (!replyText || !replyText.trim()) return;

        try {
            setPostingComment({ ...postingComment, [updateId]: true });
            await addClientUpdateReply(projectId, updateId, replyText);
            setNewComments({ ...newComments, [updateId]: '' });
            // Refresh data to show the new reply
            await fetchData();
        } catch (err) {
            alert(err.message || 'Failed to post reply');
        } finally {
            setPostingComment({ ...postingComment, [updateId]: false });
        }
    };

    const handleCommentChange = (updateId, text) => {
        setNewComments({ ...newComments, [updateId]: text });
    };

    const formatTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // Filter updates based on selection
    const filteredUpdates = selectedProjectId === 'all'
        ? updates
        : updates.filter(u => u.projectId === selectedProjectId);

    // Grouping logic for the visible updates
    const groupedUpdates = filteredUpdates.reduce((acc, update) => {
        const pId = update.projectId;
        if (!acc[pId]) {
            acc[pId] = {
                id: pId,
                title: update.projectTitle,
                updates: []
            };
        }
        acc[pId].updates.push(update);
        return acc;
    }, {});

    const projectGroups = Object.values(groupedUpdates);

    return (
        <div className="updates-page">
            <style jsx>{`
                .updates-page {
                    max-width: 900px;
                    margin: 0 auto;
                    padding-bottom: 40px;
                }
                .page-header {
                    margin-bottom: 32px;
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    flex-wrap: wrap;
                    gap: 24px;
                }
                .title-area h1 {
                    font-size: 28px;
                    font-weight: 800;
                    color: #1e293b;
                    margin: 0 0 8px 0;
                }
                .title-area p {
                    color: #64748b;
                    font-size: 16px;
                    margin: 0;
                }
                .filter-card {
                    background: white;
                    padding: 8px 16px;
                    border-radius: 12px;
                    border: 1px solid #e2e8f0;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                }
                .filter-card label {
                    font-size: 13px;
                    font-weight: 700;
                    color: #64748b;
                    text-transform: uppercase;
                }
                .project-select {
                    border: none;
                    background: none;
                    font-size: 14px;
                    font-weight: 600;
                    color: #1e293b;
                    cursor: pointer;
                    outline: none;
                    padding-right: 24px;
                }
                .project-section {
                    background: white;
                    border-radius: 20px;
                    padding: 32px;
                    border: 1px solid #f1f5f9;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                    margin-bottom: 40px;
                }
                .project-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                    padding-bottom: 16px;
                    border-bottom: 2px solid #f8fafc;
                }
                .project-title-text {
                    font-size: 20px;
                    font-weight: 800;
                    color: #1e293b;
                    margin: 0;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .project-title-text::before {
                    content: '';
                    width: 4px;
                    height: 24px;
                    background: #3b82f6;
                    border-radius: 2px;
                }
                .view-project-link {
                    font-size: 13px;
                    font-weight: 700;
                    color: #3b82f6;
                    text-decoration: none;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 0;
                }
                .view-project-link:hover {
                    text-decoration: underline;
                }
                .updates-list {
                    display: flex;
                    flex-direction: column;
                    gap: 32px;
                }
                .update-item {
                    display: flex;
                    gap: 20px;
                    position: relative;
                }
                .update-timeline-dot {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    background: #3b82f6;
                    border: 3px solid #eff6ff;
                    margin-top: 6px;
                    position: relative;
                    z-index: 2;
                    flex-shrink: 0;
                }
                .update-item:not(:last-child)::after {
                    content: '';
                    position: absolute;
                    left: 5px;
                    top: 18px;
                    bottom: -32px;
                    width: 2px;
                    background: #f1f5f9;
                }
                .update-content {
                    flex: 1;
                }
                .update-meta {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 8px;
                    flex-wrap: wrap;
                    gap: 8px;
                }
                .update-staff {
                    font-size: 14px;
                    font-weight: 700;
                    color: #1e293b;
                }
                .update-date {
                    font-size: 12px;
                    color: #94a3b8;
                    font-weight: 500;
                }
                .update-comment {
                    font-size: 15px;
                    color: #475569;
                    line-height: 1.6;
                    margin: 0 0 16px 0;
                }
                .update-images {
                    display: flex;
                    gap: 12px;
                    margin-bottom: 16px;
                    overflow-x: auto;
                    padding-bottom: 8px;
                }
                .update-image {
                    width: 120px;
                    height: 80px;
                    object-fit: cover;
                    border-radius: 8px;
                    border: 1px solid #e2e8f0;
                }
                .update-footer {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    flex-wrap: wrap;
                    margin-bottom: 16px;
                }
                .progress-tag {
                    font-size: 11px;
                    font-weight: 800;
                    padding: 4px 8px;
                    border-radius: 6px;
                    background: #eff6ff;
                    color: #3b82f6;
                    text-transform: uppercase;
                }
                .status-tag {
                    font-size: 11px;
                    font-weight: 800;
                    text-transform: uppercase;
                }
                
                .feedback-section {
                    background: #f8fafc;
                    border-radius: 12px;
                    padding: 16px;
                    margin-top: 8px;
                }
                .feedback-title {
                    font-size: 12px;
                    font-weight: 700;
                    color: #64748b;
                    text-transform: uppercase;
                    margin-bottom: 12px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                .replies-thread {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    margin-bottom: 16px;
                }
                .reply-bubble {
                    padding: 10px 14px;
                    border-radius: 12px;
                    max-width: 85%;
                }
                .reply-bubble.client {
                    background: #dbeafe;
                    border: 1px solid #93c5fd;
                    align-self: flex-end;
                }
                .reply-bubble.staff {
                    background: white;
                    border: 1px solid #e2e8f0;
                    align-self: flex-start;
                }
                .reply-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 4px;
                }
                .sender-name {
                    font-size: 12px;
                    font-weight: 600;
                    color: #475569;
                }
                .reply-bubble.client .sender-name {
                    color: #1d4ed8;
                }
                .reply-time {
                    font-size: 11px;
                    color: #94a3b8;
                }
                .reply-bubble p {
                    font-size: 14px;
                    color: #334155;
                    margin: 0;
                }
                .add-feedback {
                    display: flex;
                    gap: 12px;
                }
                .feedback-input {
                    flex: 1;
                    padding: 8px 12px;
                    border-radius: 8px;
                    border: 1px solid #e2e8f0;
                    font-size: 14px;
                    resize: none;
                    height: 38px;
                    transition: all 0.2s;
                }
                .feedback-input:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                }
                .feedback-btn {
                    padding: 0 16px;
                    border-radius: 8px;
                    background: #3b82f6;
                    color: white;
                    border: none;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    white-space: nowrap;
                    transition: all 0.2s;
                }
                .feedback-btn:hover {
                    background: #2563eb;
                }
                .feedback-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .empty-state {
                    text-align: center;
                    padding: 80px 0;
                    background: white;
                    border-radius: 20px;
                    border: 1px solid #f1f5f9;
                    color: #64748b;
                }
            `}</style>

            <div className="page-header">
                <div className="title-area">
                    <h1>Project Updates</h1>
                    <p>Track progress of your assigned projects</p>
                </div>

                <div className="filter-card">
                    <label>Filter by:</label>
                    <select
                        className="project-select"
                        value={selectedProjectId}
                        onChange={(e) => setSelectedProjectId(e.target.value)}
                    >
                        <option value="all">All Projects</option>
                        {assignedProjects.map(p => (
                            <option key={p._id} value={p._id}>{p.title}</option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
                    <div className="loading-spinner loading-spinner-lg"></div>
                </div>
            ) : error ? (
                <div style={{ padding: '24px', background: '#fef2f2', color: '#dc2626', borderRadius: '12px', textAlign: 'center' }}>
                    <p>{error}</p>
                </div>
            ) : projectGroups.length === 0 ? (
                <div className="empty-state">
                    <div style={{ marginBottom: '24px', opacity: 0.5 }}>
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                        </svg>
                    </div>
                    <h2>No updates found</h2>
                    <p>There are no daily updates posted for the selected criteria.</p>
                </div>
            ) : (
                <div className="project-groups">
                    {projectGroups.map((group) => (
                        <div key={group.id} className="project-section">
                            <div className="project-header">
                                <h2 className="project-title-text">{group.title}</h2>
                                <button
                                    className="view-project-link"
                                    onClick={() => router.push(`/client/projects/${group.id}`)}
                                >
                                    Full Details
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="5" y1="12" x2="19" y2="12"></line>
                                        <polyline points="12 5 19 12 12 19"></polyline>
                                    </svg>
                                </button>
                            </div>

                            <div className="updates-list">
                                {group.updates.map((update, idx) => (
                                    <div key={update._id || idx} className="update-item">
                                        <div className="update-timeline-dot"></div>
                                        <div className="update-content">
                                            <div className="update-meta">
                                                <span className="update-staff">
                                                    Posted by {update.staff?.name || 'Staff Member'}
                                                </span>
                                                <span className="update-date">
                                                    {formatDate(update.createdAt)} • {formatTime(update.createdAt)}
                                                </span>
                                            </div>
                                            <p className="update-comment">{update.comment}</p>

                                            {update.images && update.images.length > 0 && (
                                                <div className="update-images">
                                                    {update.images.map((img, i) => (
                                                        <img key={i} src={img} alt="Update" className="update-image" />
                                                    ))}
                                                </div>
                                            )}

                                            <div className="update-footer">
                                                <span className="progress-tag">
                                                    Milestone: {update.progress}%
                                                </span>
                                                <span className="status-tag" style={{ color: getStatusColor(update.status) }}>
                                                    {update.status}
                                                </span>
                                            </div>

                                            <div className="feedback-section">
                                                <div className="feedback-title">
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                                    </svg>
                                                    Conversation ({update.replies?.length || 0})
                                                </div>

                                                {update.replies && update.replies.length > 0 && (
                                                    <div className="replies-thread">
                                                        {update.replies.map((reply, i) => (
                                                            <div key={i} className={`reply-bubble ${reply.senderType}`}>
                                                                <div className="reply-header">
                                                                    <span className="sender-name">
                                                                        {reply.senderType === 'staff' ? (reply.staff?.name || 'Staff') : 'You'}
                                                                    </span>
                                                                    <span className="reply-time">{formatDate(reply.createdAt)} {formatTime(reply.createdAt)}</span>
                                                                </div>
                                                                <p>{reply.message}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="add-feedback">
                                                    <textarea
                                                        className="feedback-input"
                                                        placeholder="Add your reply..."
                                                        value={newComments[update._id] || ''}
                                                        onChange={(e) => handleCommentChange(update._id, e.target.value)}
                                                    ></textarea>
                                                    <button
                                                        className="feedback-btn"
                                                        disabled={postingComment[update._id]}
                                                        onClick={() => handlePostReply(update.projectId, update._id)}
                                                    >
                                                        {postingComment[update._id] ? 'Posting...' : 'Reply'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default withClientLayout(ClientDailyUpdates);
