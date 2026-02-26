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

function ProjectDailyUpdates() {
    const router = useRouter();
    const { projectId } = router.query;
    const [updates, setUpdates] = useState([]);
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [newComments, setNewComments] = useState({});
    const [postingComment, setPostingComment] = useState({});

    const fetchData = async () => {
        if (!projectId) return;
        try {
            setLoading(true);
            const [updatesRes, projectsRes] = await Promise.all([
                getClientAllUpdates(),
                getClientProjects()
            ]);

            // Find current project
            const currentProject = projectsRes.data?.find(p => p._id === projectId);
            setProject(currentProject);

            // Filter updates for this project
            const projectUpdates = updatesRes.data?.filter(u => u.projectId === projectId) || [];
            setUpdates(projectUpdates);

            setError('');
        } catch (err) {
            setError(err.message || 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [projectId]);

    const handlePostReply = async (pId, updateId) => {
        const replyText = newComments[updateId];
        if (!replyText || !replyText.trim()) return;

        try {
            setPostingComment({ ...postingComment, [updateId]: true });
            await addClientUpdateReply(pId, updateId, replyText);
            setNewComments({ ...newComments, [updateId]: '' });
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
        return new Date(dateString).toLocaleTimeString('en-US', {
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

    return (
        <div className="updates-page">
            <style jsx>{`
                .updates-page {
                    max-width: 800px;
                    margin: 0 auto;
                    padding-bottom: 40px;
                }
                .page-header {
                    margin-bottom: 32px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .back-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    color: #64748b;
                    text-decoration: none;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    background: none;
                    border: none;
                    padding: 0;
                }
                .back-btn:hover { color: #3b82f6; }

                .project-card {
                    background: white;
                    border-radius: 12px;
                    padding: 24px;
                    border: 1px solid #e2e8f0;
                    margin-bottom: 32px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .project-card h1 {
                    font-size: 24px;
                    font-weight: 700;
                    margin: 0 0 4px 0;
                }

                .project-card p {
                    color: #64748b;
                    font-size: 14px;
                    margin: 0;
                }

                .updates-list {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }

                .update-card {
                    background: white;
                    border-radius: 12px;
                    border: 1px solid #e2e8f0;
                    overflow: hidden;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                }

                .update-header {
                    padding: 16px 20px;
                    background: #f8fafc;
                    border-bottom: 1px solid #e2e8f0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .staff-info {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .staff-avatar {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: #3b82f6;
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: 12px;
                }

                .staff-name {
                    font-weight: 600;
                    font-size: 14px;
                    color: #1e293b;
                }

                .update-time {
                    font-size: 12px;
                    color: #94a3b8;
                }

                .update-body {
                    padding: 20px;
                }

                .update-comment {
                    font-size: 15px;
                    color: #334155;
                    line-height: 1.6;
                    margin-bottom: 16px;
                }

                .update-images {
                    display: flex;
                    gap: 12px;
                    margin-bottom: 16px;
                    overflow-x: auto;
                }

                .update-image {
                    width: 150px;
                    height: 100px;
                    object-fit: cover;
                    border-radius: 8px;
                    border: 1px solid #e2e8f0;
                }

                .update-stats {
                    display: flex;
                    gap: 16px;
                    font-size: 12px;
                    font-weight: 600;
                    color: #3b82f6;
                    background: #eff6ff;
                    padding: 8px 12px;
                    border-radius: 6px;
                    width: fit-content;
                }

                .conversation {
                    padding: 20px;
                    background: #f8fafc;
                    border-top: 1px solid #e2e8f0;
                }

                .reply-item {
                    margin-bottom: 12px;
                    display: flex;
                    flex-direction: column;
                }

                .reply-bubble {
                    padding: 10px 14px;
                    border-radius: 12px;
                    max-width: 85%;
                    font-size: 14px;
                }

                .reply-bubble.client {
                    background: #dbeafe;
                    align-self: flex-end;
                    border: 1px solid #bfdbfe;
                }

                .reply-bubble.staff {
                    background: white;
                    align-self: flex-start;
                    border: 1px solid #e2e8f0;
                }

                .reply-meta {
                    font-size: 11px;
                    color: #94a3b8;
                    margin-bottom: 4px;
                    display: flex;
                    gap: 8px;
                }

                .reply-input-area {
                    margin-top: 20px;
                    display: flex;
                    gap: 12px;
                }

                .reply-input {
                    flex: 1;
                    padding: 10px 14px;
                    border-radius: 8px;
                    border: 1px solid #e2e8f0;
                    font-size: 14px;
                    resize: none;
                    height: 40px;
                }

                .btn-reply {
                    background: #3b82f6;
                    color: white;
                    border: none;
                    padding: 0 16px;
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 13px;
                    cursor: pointer;
                }

                .empty-updates {
                    text-align: center;
                    padding: 60px;
                    background: white;
                    border-radius: 12px;
                    border: 1px dashed #cbd5e1;
                    color: #64748b;
                }
            `}</style>

            <button className="back-btn" onClick={() => router.push(`/client/projects/${projectId}`)}>
                ← Back to Project
            </button>

            <div className="page-header" style={{ marginTop: '24px' }}>
                <div className="project-title">
                    <h1 style={{ fontSize: '28px', fontWeight: '800', margin: 0 }}>Project Updates</h1>
                    <p style={{ color: '#64748b', marginTop: '4px' }}>Timeline of daily activities</p>
                </div>
            </div>

            {project && (
                <div className="project-card">
                    <div>
                        <h1>{project.title}</h1>
                        <p>Project Code: {project.projectCode}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <span className="status-badge" style={{
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '700',
                            background: getStatusColor(project.status) + '15',
                            color: getStatusColor(project.status),
                            border: `1px solid ${getStatusColor(project.status)}20`
                        }}>
                            {project.status}
                        </span>
                        <div style={{ marginTop: '8px', fontSize: '12px', color: '#94a3b8' }}>
                            {updates.length} total updates
                        </div>
                    </div>
                </div>
            )}

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <div className="loading-spinner"></div>
                </div>
            ) : updates.length === 0 ? (
                <div className="empty-updates">
                    <p>No updates found for this project yet.</p>
                </div>
            ) : (
                <div className="updates-list">
                    {updates.slice().reverse().map((update) => (
                        <div key={update._id} className="update-card">
                            <div className="update-header">
                                <div className="staff-info">
                                    <div className="staff-avatar">{update.staff?.name?.charAt(0)}</div>
                                    <span className="staff-name">{update.staff?.name || 'Staff Member'}</span>
                                </div>
                                <span className="update-time">
                                    {formatDate(update.createdAt)} • {formatTime(update.createdAt)}
                                </span>
                            </div>

                            <div className="update-body">
                                <p className="update-comment">{update.comment}</p>

                                {update.images?.length > 0 && (
                                    <div className="update-images">
                                        {update.images.map((img, i) => (
                                            <img key={i} src={img} className="update-image" alt="Update" />
                                        ))}
                                    </div>
                                )}

                                <div className="update-stats">
                                    <span>Progress: {update.progress}%</span>
                                    <span>Status: {update.status}</span>
                                </div>
                            </div>

                            <div className="conversation">
                                <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '16px', textTransform: 'uppercase' }}>
                                    Discussion ({update.replies?.length || 0})
                                </div>

                                {update.replies?.length > 0 && (
                                    <div className="replies-list">
                                        {update.replies.map((reply, i) => (
                                            <div key={i} className={`reply-item`}>
                                                <div className="reply-meta" style={{ alignSelf: reply.senderType === 'client' ? 'flex-end' : 'flex-start' }}>
                                                    <span>{reply.senderType === 'client' ? 'You' : (reply.staff?.name || 'Staff')}</span>
                                                    <span>• {formatDate(reply.createdAt)} {formatTime(reply.createdAt)}</span>
                                                </div>
                                                <div className={`reply-bubble ${reply.senderType}`}>
                                                    {reply.message}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="reply-input-area">
                                    <textarea
                                        className="reply-input"
                                        placeholder="Add a comment or ask a question..."
                                        value={newComments[update._id] || ''}
                                        onChange={(e) => handleCommentChange(update._id, e.target.value)}
                                    ></textarea>
                                    <button
                                        className="btn-reply"
                                        onClick={() => handlePostReply(projectId, update._id)}
                                        disabled={postingComment[update._id]}
                                    >
                                        {postingComment[update._id] ? '...' : 'Reply'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default withClientLayout(ProjectDailyUpdates);
