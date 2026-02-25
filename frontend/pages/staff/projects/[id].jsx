import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import StaffLayout from '../../../layouts/staffLayout';
import { Alert } from '../../../components';
import { useStaffAuth } from '../../../hooks/useStaffAuth';
import { formatDate } from '../../../utils/helpers';
// import { getStaffProject, addStaffProjectUpdate, getStaffProjectUpdates, addStaffUpdateReply } from '../../../services/api';

import {
  getStaffProject,
  addStaffProjectUpdate,
  getStaffProjectUpdates,
  addStaffUpdateReply,
  updateStaffDeploymentLinks
} from '../../../services/api';

/* ---------- Icons ---------- */
const ArrowLeftIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
    </svg>
);

const FolderIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
);

const UsersIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

const CalendarIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);

const ClockIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);

const CodeIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
    </svg>
);

const TargetIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
    </svg>
);

const MailIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
    </svg>
);

const PhoneIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
);

const UserIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

const FlagIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
        <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
);

const FileTextIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
);

const MessageSquareIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
);

const SendIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="22" y1="2" x2="11" y2="13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
);

const ActivityIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
);

const TrendingUpIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
    </svg>
);

const LinkIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
);

const ExternalLinkIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        <polyline points="15 3 21 3 21 9" />
        <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
);

const EditIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);

const XIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

export default function StaffProjectDetails() {
    const router = useRouter();
    const { id } = router.query;
    const { user: authUser } = useStaffAuth();

    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [activeTab, setActiveTab] = useState('overview');

    // Update form state
    const [updateForm, setUpdateForm] = useState({
        status: '',
        progress: '',
        comment: '',
    });

    // Paginated updates state
    const [updates, setUpdates] = useState([]);
    const [updatesPage, setUpdatesPage] = useState(1);
    const [updatesHasMore, setUpdatesHasMore] = useState(false);
    const [updatesLoading, setUpdatesLoading] = useState(false);

    // Reply state
    const [replyTexts, setReplyTexts] = useState({});
    const [postingReply, setPostingReply] = useState({});

    // Deployment Links state
    const [deploymentLinks, setDeploymentLinks] = useState({
        development: '',
        production: ''
    });
    const [showLinksModal, setShowLinksModal] = useState(false);
    const [tempLinks, setTempLinks] = useState({
        development: '',
        production: ''
    });

    // Fetch project from backend API
    useEffect(() => {
        if (!id) return;

        const fetchProject = async () => {
            try {
                setLoading(true);
                setError('');
                const response = await getStaffProject(id);
                if (response.success && response.data) if (response.success && response.data) {
    setProject(response.data);

    // ✅ Correct mapping from backend fields
    setDeploymentLinks({
        development: response.data.developmentLink || '',
        production: response.data.productionLink || ''
    });

    setUpdateForm({
        status: response.data.status || '',
        progress: response.data.progress || 0,
        comment: '',
    });

    fetchUpdates(1, true);
}
 else {
                    setError('Project not found');
                }
            } catch (err) {
                setError(err.message || 'Failed to load project');
            } finally {
                setLoading(false);
            }
        };

        fetchProject();
    }, [id]);

    // Fetch paginated updates
    const fetchUpdates = async (page, reset = false) => {
        if (!id) return;
        try {
            setUpdatesLoading(true);
            const response = await getStaffProjectUpdates(id, page, 5);
            if (response.success) {
                if (reset) {
                    setUpdates(response.data || []);
                } else {
                    setUpdates(prev => [...prev, ...(response.data || [])]);
                }
                setUpdatesPage(page);
                setUpdatesHasMore(response.pagination?.hasMore || false);
            }
        } catch (err) {
            console.error('Failed to load updates:', err);
        } finally {
            setUpdatesLoading(false);
        }
    };

    const handleLoadMoreUpdates = () => {
        if (updatesHasMore && !updatesLoading) {
            fetchUpdates(updatesPage + 1);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUpdateForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleReplyChange = (updateId, text) => {
        setReplyTexts({ ...replyTexts, [updateId]: text });
    };

    const handlePostReply = async (updateId) => {
        const replyText = replyTexts[updateId];
        if (!replyText || !replyText.trim()) return;

        try {
            setPostingReply({ ...postingReply, [updateId]: true });
            await addStaffUpdateReply(id, updateId, replyText);
            setReplyTexts({ ...replyTexts, [updateId]: '' });
            // Refresh updates to show the new reply
            fetchUpdates(1, true);
        } catch (err) {
            alert(err.message || 'Failed to post reply');
        } finally {
            setPostingReply({ ...postingReply, [updateId]: false });
        }
    };

    const [submitting, setSubmitting] = useState(false);

    const handleSubmitUpdate = async (e) => {
        e.preventDefault();

        // Validation
        if (!updateForm.comment.trim()) {
            setError('Please add a comment about your update');
            return;
        }

        try {
            setSubmitting(true);
            setError('');

            // Call backend API to persist the update
            const response = await addStaffProjectUpdate(id, {
                status: updateForm.status,
                progress: parseInt(updateForm.progress),
                comment: updateForm.comment.trim()
            });

            if (response.success && response.data) {
                // Update project with response data from backend
                setProject(response.data);
                setSuccess('Status update added successfully!');
                setUpdateForm(prev => ({ ...prev, comment: '' }));

                // Refresh paginated updates (reset to page 1)
                fetchUpdates(1, true);

                // Clear success message after 3 seconds
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError(response.message || 'Failed to add update');
            }
        } catch (err) {
            setError(err.message || 'Failed to add update');
        } finally {
            setSubmitting(false);
        }
    };

    // Deployment Links Handlers
    const handleEditLinks = () => {
        setTempLinks({ ...deploymentLinks });
        setShowLinksModal(true);
    };

const handleSaveLinks = async () => {
  try {
    const response = await updateStaffDeploymentLinks(id, {
      developmentLink: tempLinks.development,
      productionLink: tempLinks.production
    });

    if (response.success) {
      setDeploymentLinks({
        development: response.data.developmentLink || '',
        production: response.data.productionLink || ''
      });

      setShowLinksModal(false);
      setSuccess('Deployment links updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    }
  } catch (err) {
    setError(err.message || 'Failed to update links');
  }
};



    const handleCancelLinks = () => {
        setTempLinks({ development: '', production: '' });
        setShowLinksModal(false);
    };

    const handleLinkInputChange = (e) => {
        const { name, value } = e.target;
        setTempLinks(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const getStatusColor = (status) => {
        const colors = {
            'In Progress': { bg: '#eff6ff', color: '#1e40af', border: '#3b82f6' },
            'Completed': { bg: '#ecfdf5', color: '#065f46', border: '#10b981' },
            'On Hold': { bg: '#fef3c7', color: '#92400e', border: '#f59e0b' },
            'Pending': { bg: '#f3f4f6', color: '#4b5563', border: '#6b7280' },
        };
        return colors[status] || colors['Pending'];
    };

    const getPriorityColor = (priority) => {
        const colors = {
            'High': { color: '#dc2626', bg: '#fee2e2' },
            'Medium': { color: '#f59e0b', bg: '#fef3c7' },
            'Low': { color: '#10b981', bg: '#d1fae5' },
        };
        return colors[priority] || colors['Medium'];
    };

    return (
        <div className="project-details-page">
            <style jsx>{`
                .project-details-page {
                    padding: var(--spacing-6);
                    background: #fafbfc;
                    min-height: 100vh;
                }

                .page-header {
                    margin-bottom: var(--spacing-6);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .header-content {
                    flex: 1;
                }

                .breadcrumb {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-2);
                    margin-bottom: var(--spacing-3);
                    font-size: 14px;
                    color: #6b7280;
                }

                .breadcrumb-link {
                    color: #6b7280;
                    text-decoration: none;
                    transition: color 0.2s;
                }

                .breadcrumb-link:hover {
                    color: #3b82f6;
                }

                .breadcrumb-separator {
                    color: #d1d5db;
                }

                .page-title {
                    font-size: 28px;
                    font-weight: 700;
                    color: #1a1a1a;
                    margin: 0 0 var(--spacing-2) 0;
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-2);
                }

                .page-subtitle {
                    font-size: 15px;
                    color: #6b7280;
                    margin: 0;
                }

                .back-button {
                    display: inline-flex;
                    align-items: center;
                    gap: var(--spacing-2);
                    padding: 10px 20px;
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 14px;
                    color: #4b5563;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .back-button:hover {
                    border-color: #3b82f6;
                    color: #3b82f6;
                    background: #eff6ff;
                }

                .content-layout {
                    display: grid;
                    grid-template-columns: 1fr 400px;
                    gap: var(--spacing-6);
                }

                .project-hero {
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 12px;
                    padding: var(--spacing-6);
                    margin-bottom: var(--spacing-5);
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
                }

                .tabs-container {
                    display: flex;
                    gap: var(--spacing-4);
                    border-bottom: 1px solid #e5e7eb;
                    margin-bottom: var(--spacing-5);
                }

                .tab-button {
                    padding: 12px 4px;
                    font-size: 14px;
                    font-weight: 600;
                    color: #6b7280;
                    background: none;
                    border: none;
                    border-bottom: 2px solid transparent;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    margin-bottom: -1px;
                }

                .tab-button:hover {
                    color: #3b82f6;
                }

                .tab-button.active {
                    color: #3b82f6;
                    border-bottom-color: #3b82f6;
                }

                .project-hero-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: var(--spacing-4);
                    padding-bottom: var(--spacing-4);
                    border-bottom: 1px solid #f3f4f6;
                }

                .project-hero-title {
                    font-size: 24px;
                    font-weight: 700;
                    color: #1a1a1a;
                    margin: 0 0 var(--spacing-2) 0;
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-3);
                }

                .title-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 8px;
                    background: #3b82f6;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                }

                .project-hero-description {
                    font-size: 15px;
                    line-height: 1.6;
                    color: #6b7280;
                    margin: 0;
                }

                .hero-badges {
                    display: flex;
                    gap: var(--spacing-2);
                    align-items: center;
                    flex-wrap: wrap;
                }

                .status-badge-large {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 16px;
                    border-radius: 6px;
                    font-size: 13px;
                    font-weight: 600;
                    border: 1px solid;
                }

                .status-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: currentColor;
                }

                .priority-badge-large {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 16px;
                    border-radius: 6px;
                    font-size: 13px;
                    font-weight: 600;
                }

                .progress-section {
                    margin-top: var(--spacing-4);
                }

                .progress-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: var(--spacing-2);
                }

                .progress-label {
                    font-size: 13px;
                    font-weight: 600;
                    color: #6b7280;
                }

                .progress-value {
                    font-size: 18px;
                    font-weight: 700;
                    color: #3b82f6;
                }

                .progress-bar-large {
                    height: 10px;
                    background: #f3f4f6;
                    border-radius: 5px;
                    overflow: hidden;
                }

                .progress-fill-large {
                    height: 100%;
                    background: #3b82f6;
                    border-radius: 5px;
                    transition: width 0.5s ease;
                }

                .cards-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: var(--spacing-5);
                    margin-bottom: var(--spacing-5);
                }

                .info-card {
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 12px;
                    padding: var(--spacing-5);
                    transition: all 0.2s ease;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
                }

                .info-card:hover {
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                    transform: translateY(-2px);
                }

                .card-header-custom {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-3);
                    margin-bottom: var(--spacing-4);
                    padding-bottom: var(--spacing-3);
                    border-bottom: 1px solid #f3f4f6;
                }

                .card-header-with-action {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: var(--spacing-4);
                    padding-bottom: var(--spacing-3);
                    border-bottom: 1px solid #f3f4f6;
                }

                .card-header-left {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-3);
                }

                .card-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #f3f4f6;
                    color: #4b5563;
                }

                .card-title-custom {
                    font-size: 16px;
                    font-weight: 700;
                    color: #1a1a1a;
                    margin: 0;
                }

                .edit-button {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 14px;
                    background: #f9fafb;
                    border: 1px solid #e5e7eb;
                    border-radius: 6px;
                    font-size: 13px;
                    font-weight: 600;
                    color: #4b5563;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .edit-button:hover {
                    background: #3b82f6;
                    border-color: #3b82f6;
                    color: white;
                }

                .info-row {
                    display: flex;
                    align-items: flex-start;
                    gap: var(--spacing-3);
                    padding: var(--spacing-3) 0;
                }

                .info-row:not(:last-child) {
                    border-bottom: 1px solid #f9fafb;
                }

                .info-icon {
                    width: 32px;
                    height: 32px;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #f9fafb;
                    color: #6b7280;
                    flex-shrink: 0;
                }

                .info-content {
                    flex: 1;
                }

                .info-label {
                    font-size: 12px;
                    font-weight: 600;
                    color: #9ca3af;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 4px;
                }

                .info-value {
                    font-size: 14px;
                    font-weight: 600;
                    color: #1a1a1a;
                }

                .link-value {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    color: #3b82f6;
                    text-decoration: none;
                    font-size: 14px;
                    font-weight: 500;
                    transition: all 0.2s ease;
                }

                .link-value:hover {
                    text-decoration: underline;
                    color: #2563eb;
                }

                .link-value-empty {
                    color: #9ca3af;
                    font-style: italic;
                    font-weight: 400;
                }

                .tech-stack-grid {
                    display: flex;
                    flex-wrap: wrap;
                    gap: var(--spacing-2);
                }

                .tech-badge {
                    display: inline-flex;
                    align-items: center;
                    padding: 6px 12px;
                    background: #f3f4f6;
                    color: #4b5563;
                    border: 1px solid #e5e7eb;
                    border-radius: 6px;
                    font-size: 13px;
                    font-weight: 600;
                    transition: all 0.2s ease;
                }

                .tech-badge:hover {
                    background: #3b82f6;
                    color: white;
                    border-color: #3b82f6;
                }

                .team-grid {
                    display: flex;
                    flex-direction: column;
                    gap: var(--spacing-2);
                }

                .team-member {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-3);
                    padding: var(--spacing-3);
                    background: #f9fafb;
                    border-radius: 8px;
                    transition: all 0.2s ease;
                }

                .team-member:hover {
                    background: #f3f4f6;
                }

                .member-avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: #3b82f6;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: 700;
                    font-size: 14px;
                }

                .member-name {
                    font-size: 14px;
                    font-weight: 600;
                    color: #1a1a1a;
                }

                .full-width-card {
                    grid-column: 1 / -1;
                }

                /* Modal Styles */
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 20px;
                    animation: fadeIn 0.2s ease;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .modal-content {
                    background: white;
                    border-radius: 12px;
                    width: 100%;
                    max-width: 500px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                    animation: slideUp 0.3s ease;
                }

                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .modal-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 24px;
                    border-bottom: 1px solid #e5e7eb;
                }

                .modal-title {
                    font-size: 18px;
                    font-weight: 700;
                    color: #1a1a1a;
                    margin: 0;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .modal-close {
                    width: 32px;
                    height: 32px;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #f9fafb;
                    border: 1px solid #e5e7eb;
                    color: #6b7280;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .modal-close:hover {
                    background: #fee2e2;
                    border-color: #fecaca;
                    color: #dc2626;
                }

                .modal-body {
                    padding: 24px;
                }

                .modal-footer {
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                    padding: 20px 24px;
                    border-top: 1px solid #e5e7eb;
                    background: #f9fafb;
                    border-radius: 0 0 12px 12px;
                }

                .modal-button {
                    padding: 10px 20px;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    border: 1px solid;
                }

                .modal-button-cancel {
                    background: white;
                    border-color: #e5e7eb;
                    color: #4b5563;
                }

                .modal-button-cancel:hover {
                    background: #f9fafb;
                    border-color: #d1d5db;
                }

                .modal-button-save {
                    background: #3b82f6;
                    border-color: #3b82f6;
                    color: white;
                }

                .modal-button-save:hover {
                    background: #2563eb;
                    border-color: #2563eb;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
                }

                /* Update Form Styles */
                .update-form-card {
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 12px;
                    padding: var(--spacing-5);
                    margin-bottom: var(--spacing-5);
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
                }

                .form-group {
                    margin-bottom: var(--spacing-4);
                }

                .form-label {
                    display: block;
                    font-size: 14px;
                    font-weight: 600;
                    color: #374151;
                    margin-bottom: var(--spacing-2);
                }

                .form-input, .form-select, .form-textarea {
                    width: 100%;
                    padding: 10px 14px;
                    border: 1px solid #d1d5db;
                    border-radius: 8px;
                    font-size: 14px;
                    color: #1a1a1a;
                    transition: all 0.2s ease;
                }

                .form-input:focus, .form-select:focus, .form-textarea:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                }

                .form-textarea {
                    resize: vertical;
                    min-height: 100px;
                    font-family: inherit;
                }

                .form-help {
                    font-size: 12px;
                    color: #6b7280;
                    margin-top: var(--spacing-1);
                }

                .range-container {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-3);
                }

                .range-input {
                    flex: 1;
                }

                .range-value {
                    font-size: 18px;
                    font-weight: 700;
                    color: #3b82f6;
                    min-width: 50px;
                    text-align: right;
                }

                .submit-button {
                    display: inline-flex;
                    align-items: center;
                    gap: var(--spacing-2);
                    padding: 12px 24px;
                    background: #3b82f6;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .submit-button:hover {
                    background: #2563eb;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
                }

                .submit-button:disabled {
                    background: #9ca3af;
                    cursor: not-allowed;
                    transform: none;
                }

                /* Timeline Styles */
                .timeline-container {
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 12px;
                    padding: var(--spacing-5);
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
                }

                .timeline-header {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-3);
                    margin-bottom: var(--spacing-5);
                    padding-bottom: var(--spacing-3);
                    border-bottom: 1px solid #f3f4f6;
                }

                .timeline-title {
                    font-size: 18px;
                    font-weight: 700;
                    color: #1a1a1a;
                    margin: 0;
                }

                .timeline {
                    position: relative;
                }

                .timeline::before {
                    content: '';
                    position: absolute;
                    left: 20px;
                    top: 0;
                    bottom: 0;
                    width: 2px;
                    background: #e5e7eb;
                }

                .timeline-item {
                    position: relative;
                    padding-left: 56px;
                    padding-bottom: var(--spacing-5);
                }

                .timeline-item:last-child {
                    padding-bottom: 0;
                }

                .timeline-marker {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: #3b82f6;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    z-index: 1;
                    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
                }

                .timeline-content {
                    background: #f9fafb;
                    border: 1px solid #e5e7eb;
                    border-radius: 10px;
                    padding: var(--spacing-4);
                }

                .timeline-date {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-2);
                    font-size: 13px;
                    font-weight: 600;
                    color: #3b82f6;
                    margin-bottom: var(--spacing-2);
                }

                .timeline-comment {
                    font-size: 14px;
                    color: #1a1a1a;
                    margin-bottom: var(--spacing-3);
                    line-height: 1.6;
                }

                .timeline-meta {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-3);
                    flex-wrap: wrap;
                }

                .timeline-author {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-2);
                    font-size: 12px;
                    color: #6b7280;
                }

                .author-avatar {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    background: #3b82f6;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 10px;
                    font-weight: 700;
                }

                .timeline-progress {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-2);
                    font-size: 12px;
                    color: #6b7280;
                }

                .timeline-status {
                    display: inline-flex;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 11px;
                    font-weight: 600;
                    border: 1px solid;
                }

                .empty-timeline {
                    text-align: center;
                    padding: var(--spacing-6);
                    color: #6b7280;
                }

                /* Replies Section */
                .replies-section {
                    margin-top: var(--spacing-4);
                    padding-top: var(--spacing-4);
                    border-top: 1px solid #e5e7eb;
                }
                .replies-header {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 12px;
                    font-weight: 700;
                    color: #64748b;
                    text-transform: uppercase;
                    margin-bottom: var(--spacing-3);
                }
                .replies-list {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    margin-bottom: var(--spacing-3);
                }
                .reply-item {
                    padding: 8px 12px;
                    border-radius: 8px;
                    max-width: 85%;
                }
                .reply-item.client {
                    background: #dbeafe;
                    border: 1px solid #93c5fd;
                    align-self: flex-start;
                }
                .reply-item.staff {
                    background: #ecfdf5;
                    border: 1px solid #86efac;
                    align-self: flex-end;
                }
                .reply-sender {
                    font-size: 11px;
                    font-weight: 600;
                    color: #475569;
                    margin-bottom: 2px;
                }
                .reply-message {
                    font-size: 13px;
                    color: #1a1a1a;
                }
                .reply-time {
                    font-size: 10px;
                    color: #94a3b8;
                    margin-top: 4px;
                }
                .reply-input-container {
                    display: flex;
                    gap: 8px;
                }
                .reply-input {
                    flex: 1;
                    padding: 8px 12px;
                    border: 1px solid #e5e7eb;
                    border-radius: 6px;
                    font-size: 13px;
                }
                .reply-input:focus {
                    outline: none;
                    border-color: #3b82f6;
                }
                .reply-btn {
                    padding: 8px 16px;
                    background: #3b82f6;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    font-size: 12px;
                    font-weight: 600;
                    cursor: pointer;
                }
                .reply-btn:hover {
                    background: #2563eb;
                }
                .reply-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .load-more-container {
                    display: flex;
                    justify-content: center;
                    margin-top: var(--spacing-4);
                    padding-top: var(--spacing-4);
                    border-top: 1px solid #f3f4f6;
                }

                .load-more-button {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    padding: 10px 24px;
                    background: #f9fafb;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 600;
                    color: #4b5563;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .load-more-button:hover:not(:disabled) {
                    background: #f3f4f6;
                    border-color: #d1d5db;
                    color: #1f2937;
                }

                .load-more-button:disabled {
                    cursor: not-allowed;
                    opacity: 0.6;
                }

                @media (max-width: 1200px) {
                    .content-layout {
                        grid-template-columns: 1fr;
                    }

                    .cards-grid {
                        grid-template-columns: 1fr;
                    }
                }

                @media (max-width: 768px) {
                    .page-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: var(--spacing-4);
                    }

                    .project-hero-header {
                        flex-direction: column;
                        gap: var(--spacing-3);
                    }

                    .modal-overlay {
                        padding: 16px;
                    }

                    .modal-content {
                        max-width: 100%;
                    }
                }
            `}</style>

            {/* Header */}
            <div className="page-header">
                <div className="header-content">
                    <div className="breadcrumb">
                        <a href="/staff/projects" className="breadcrumb-link">Projects</a>
                        <span className="breadcrumb-separator">/</span>
                        <span>Details</span>
                    </div>
                    <h1 className="page-title">
                        <FolderIcon />
                        Project Details
                    </h1>
                    <p className="page-subtitle">Manage and track your project progress</p>
                </div>
                <button
                    className="back-button"
                    onClick={() => router.push('/staff/projects')}
                >
                    <ArrowLeftIcon />
                    Back to Projects
                </button>
            </div>

            {error && <Alert type="error" message={error} onClose={() => setError('')} />}
            {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

            {loading && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
                    <div className="loading-spinner loading-spinner-lg"></div>
                </div>
            )}

            {!loading && project && (
                <>
                    {/* Hero Section */}
                    <div className="project-hero">
                        <div className="project-hero-header">
                            <div>
                                <h2 className="project-hero-title">
                                    <div className="title-icon">
                                        <FileTextIcon />
                                    </div>
                                    {project.title}
                                </h2>
                                <p className="project-hero-description">{project.description}</p>
                            </div>
                            <div className="hero-badges">
                                <div
                                    className="status-badge-large"
                                    style={{
                                        color: getStatusColor(project.status).color,
                                        background: getStatusColor(project.status).bg,
                                        borderColor: getStatusColor(project.status).border
                                    }}
                                >
                                    <span className="status-dot"></span>
                                    {project.status}
                                </div>
                                {project.priority && (
                                    <div
                                        className="priority-badge-large"
                                        style={{
                                            color: getPriorityColor(project.priority).color,
                                            background: getPriorityColor(project.priority).bg
                                        }}
                                    >
                                        <FlagIcon />
                                        {project.priority}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Progress Bar */}
                        {project.progress !== undefined && (
                            <div className="progress-section">
                                <div className="progress-header">
                                    <span className="progress-label">Current Progress</span>
                                    <span className="progress-value">{project.progress}%</span>
                                </div>
                                <div className="progress-bar-large">
                                    <div className="progress-fill-large" style={{ width: `${project.progress}%` }} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Tab Navigation */}
                    <div className="tabs-container">
                        <button
                            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
                            onClick={() => setActiveTab('overview')}
                        >
                            Overview
                        </button>
                        <button
                            className="tab-button"
                            onClick={() => router.push(`/staff/projects/${id}/roadmap`)}
                            style={{ color: '#3b82f6', cursor: 'pointer' }}
                        >
                            📋 View Roadmap & Support
                        </button>
                    </div>

                    {/* Main Content Layout */}
                    {activeTab === 'overview' && (
                        <div className="content-layout">
                            {/* Left Column */}
                            <div>
                                {/* Info Cards Grid */}
                                <div className="cards-grid">
                                    {/* Timeline Card */}
                                    <div className="info-card">
                                        <div className="card-header-custom">
                                            <div className="card-icon">
                                                <CalendarIcon />
                                            </div>
                                            <h3 className="card-title-custom">Timeline</h3>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-icon">
                                                <CalendarIcon />
                                            </div>
                                            <div className="info-content">
                                                <div className="info-label">Start Date</div>
                                                <div className="info-value">{formatDate(project.createdAt)}</div>
                                            </div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-icon">
                                                <ClockIcon />
                                            </div>
                                            <div className="info-content">
                                                <div className="info-label">Last Updated</div>
                                                <div className="info-value">{formatDate(project.updatedAt)}</div>
                                            </div>
                                        </div>
                                        {project.deadline && (
                                            <div className="info-row">
                                                <div className="info-icon">
                                                    <TargetIcon />
                                                </div>
                                                <div className="info-content">
                                                    <div className="info-label">Deadline</div>
                                                    <div className="info-value">{formatDate(project.deadline)}</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Client Card */}
                                    <div className="info-card">
                                        <div className="card-header-custom">
                                            <div className="card-icon">
                                                <UsersIcon />
                                            </div>
                                            <h3 className="card-title-custom">Client Information</h3>
                                        </div>
                                        {project.assignedClients && project.assignedClients.length > 0 ? (
                                            <>
                                                <div className="info-row">
                                                    <div className="info-icon">
                                                        <UserIcon />
                                                    </div>
                                                    <div className="info-content">
                                                        <div className="info-label">Client Name</div>
                                                        <div className="info-value">{project.assignedClients[0].name}</div>
                                                    </div>
                                                </div>
                                                {project.assignedClients[0].email && (
                                                    <div className="info-row">
                                                        <div className="info-icon">
                                                            <MailIcon />
                                                        </div>
                                                        <div className="info-content">
                                                            <div className="info-label">Email</div>
                                                            <div className="info-value">{project.assignedClients[0].email}</div>
                                                        </div>
                                                    </div>
                                                )}
                                                {project.assignedClients[0].phone && (
                                                    <div className="info-row">
                                                        <div className="info-icon">
                                                            <PhoneIcon />
                                                        </div>
                                                        <div className="info-content">
                                                            <div className="info-label">Phone</div>
                                                            <div className="info-value">{project.assignedClients[0].phone}</div>
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="info-value">No client assigned</div>
                                        )}
                                    </div>

                                    {/* Tech Stack Card */}
                                    <div className="info-card full-width-card">
                                        <div className="card-header-custom">
                                            <div className="card-icon">
                                                <CodeIcon />
                                            </div>
                                            <h3 className="card-title-custom">Technology Stack</h3>
                                        </div>
                                        <div className="tech-stack-grid">
                                            {project.techStack && project.techStack.length > 0 ? (
                                                project.techStack.map((tech, index) => (
                                                    <span key={index} className="tech-badge">
                                                        {tech}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="info-value">No technologies specified</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Deployment Links Card - NEW */}
                                    <div className="info-card full-width-card">
                                        <div className="card-header-with-action">
                                            <div className="card-header-left">
                                                <div className="card-icon">
                                                    <LinkIcon />
                                                </div>
                                                <h3 className="card-title-custom">Deployment Links</h3>
                                            </div>
                                            <button className="edit-button" onClick={handleEditLinks}>
                                                <EditIcon />
                                                Edit
                                            </button>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-icon">
                                                <CodeIcon />
                                            </div>
                                            <div className="info-content">
                                                <div className="info-label">Development Link</div>
                                                {deploymentLinks.development ? (
                                                    <a 
                                                        href={deploymentLinks.development} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="link-value"
                                                    >
                                                        {deploymentLinks.development}
                                                        <ExternalLinkIcon />
                                                    </a>
                                                ) : (
                                                    <div className="info-value link-value-empty">Not Added Yet</div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="info-row">
                                            <div className="info-icon">
                                                <TrendingUpIcon />
                                            </div>
                                            <div className="info-content">
                                                <div className="info-label">Production Link</div>
                                                {deploymentLinks.production ? (
                                                    <a 
                                                        href={deploymentLinks.production} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="link-value"
                                                    >
                                                        {deploymentLinks.production}
                                                        <ExternalLinkIcon />
                                                    </a>
                                                ) : (
                                                    <div className="info-value link-value-empty">Not Added Yet</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Team Members Card */}
                                    {project.teamMembers && project.teamMembers.length > 0 && (
                                        <div className="info-card full-width-card">
                                            <div className="card-header-custom">
                                                <div className="card-icon">
                                                    <UsersIcon />
                                                </div>
                                                <h3 className="card-title-custom">Team Members</h3>
                                            </div>
                                            <div className="team-grid">
                                                {project.teamMembers.map((member, index) => (
                                                    <div key={index} className="team-member">
                                                        <div className="member-avatar">
                                                            {member.split(' ').map(n => n[0]).join('').toUpperCase()}
                                                        </div>
                                                        <div className="member-name">{member}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Sidebar */}
                            <div>
                                {/* Daily Update Form */}
                                <div className="update-form-card">
                                    <div className="card-header-custom">
                                        <div className="card-icon">
                                            <MessageSquareIcon />
                                        </div>
                                        <h3 className="card-title-custom">Add Daily Update</h3>
                                    </div>

                                    <form onSubmit={handleSubmitUpdate}>
                                        <div className="form-group">
                                            <label className="form-label">Status</label>
                                            <select
                                                name="status"
                                                className="form-select"
                                                value={updateForm.status}
                                                onChange={handleInputChange}
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="In Progress">In Progress</option>
                                                <option value="On Hold">On Hold</option>
                                                <option value="Completed">Completed</option>
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Progress</label>
                                            <div className="range-container">
                                                <input
                                                    type="range"
                                                    name="progress"
                                                    className="range-input form-input"
                                                    min="0"
                                                    max="100"
                                                    value={updateForm.progress}
                                                    onChange={handleInputChange}
                                                />
                                                <span className="range-value">{updateForm.progress}%</span>
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Comment / Update</label>
                                            <textarea
                                                name="comment"
                                                className="form-textarea"
                                                placeholder="What did you work on today? Any blockers or achievements?"
                                                value={updateForm.comment}
                                                onChange={handleInputChange}
                                            />
                                            <p className="form-help">Describe your progress, challenges, or milestones</p>
                                        </div>

                                        <button type="submit" className="submit-button" disabled={submitting}>
                                            <SendIcon />
                                            {submitting ? 'Submitting...' : 'Submit Update'}
                                        </button>
                                    </form>
                                </div>

                                {/* Status History Timeline */}
                                <div className="timeline-container">
                                    <div className="timeline-header">
                                        <div className="card-icon">
                                            <ActivityIcon />
                                        </div>
                                        <h3 className="timeline-title">Status History</h3>
                                    </div>

                                    {updates && updates.length > 0 ? (
                                        <>
                                            <div className="timeline">
                                                {updates.map((update, index) => {
                                                    const statusColor = getStatusColor(update.status);
                                                    const updateDate = new Date(update.createdAt);
                                                    const staffName = update.staff?.name || 'Staff';
                                                    return (
                                                        <div key={update._id || index} className="timeline-item">
                                                            <div className="timeline-marker">
                                                                <TrendingUpIcon />
                                                            </div>
                                                            <div className="timeline-content">
                                                                <div className="timeline-date">
                                                                    <CalendarIcon />
                                                                    {formatDate(update.createdAt)} at {updateDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                                </div>
                                                                <div className="timeline-comment">
                                                                    {update.comment}
                                                                </div>
                                                                <div className="timeline-meta">
                                                                    <div className="timeline-author">
                                                                        <div className="author-avatar">
                                                                            {staffName.split(' ').map(n => n[0]).join('')}
                                                                        </div>
                                                                        {staffName}
                                                                    </div>
                                                                    <div
                                                                        className="timeline-status"
                                                                        style={{
                                                                            color: statusColor.color,
                                                                            background: statusColor.bg,
                                                                            borderColor: statusColor.border
                                                                        }}
                                                                    >
                                                                        {update.status}
                                                                    </div>
                                                                    <div className="timeline-progress">
                                                                        <TrendingUpIcon />
                                                                        Progress: {update.progress}%
                                                                    </div>
                                                                </div>

                                                                {/* Two-Way Replies Section */}
                                                                <div className="replies-section">
                                                                    <div className="replies-header">
                                                                        <MessageSquareIcon />
                                                                        Conversation ({update.replies?.length || 0})
                                                                    </div>

                                                                    {update.replies && update.replies.length > 0 && (
                                                                        <div className="replies-list">
                                                                            {update.replies.map((reply, ri) => (
                                                                                <div key={ri} className={`reply-item ${reply.senderType}`}>
                                                                                    <div className="reply-sender">
                                                                                        {reply.senderType === 'staff'
                                                                                            ? (reply.staff?.name || 'You')
                                                                                            : (reply.client?.name || 'Client')}
                                                                                    </div>
                                                                                    <div className="reply-message">{reply.message}</div>
                                                                                    <div className="reply-time">
                                                                                        {formatDate(reply.createdAt)}
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}

                                                                    <div className="reply-input-container">
                                                                        <input
                                                                            type="text"
                                                                            className="reply-input"
                                                                            placeholder="Reply to client..."
                                                                            value={replyTexts[update._id] || ''}
                                                                            onChange={(e) => handleReplyChange(update._id, e.target.value)}
                                                                        />
                                                                        <button
                                                                            className="reply-btn"
                                                                            disabled={postingReply[update._id]}
                                                                            onClick={() => handlePostReply(update._id)}
                                                                        >
                                                                            {postingReply[update._id] ? '...' : 'Reply'}
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            {updatesHasMore && (
                                                <div className="load-more-container">
                                                    <button
                                                        className="load-more-button"
                                                        onClick={handleLoadMoreUpdates}
                                                        disabled={updatesLoading}
                                                    >
                                                        {updatesLoading ? 'Loading...' : 'Load More'}
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="empty-timeline">
                                            <p>No status updates yet. Be the first to add one!</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Deployment Links Modal */}
            {showLinksModal && (
                <div className="modal-overlay" onClick={handleCancelLinks}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">
                                <LinkIcon />
                                Edit Deployment Links
                            </h3>
                            <button className="modal-close" onClick={handleCancelLinks}>
                                <XIcon />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Development URL</label>
                                <input
                                    type="url"
                                    name="development"
                                    className="form-input"
                                    placeholder="https://dev.example.com"
                                    value={tempLinks.development}
                                    onChange={handleLinkInputChange}
                                />
                                <p className="form-help">Enter the URL for your development environment</p>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Production URL</label>
                                <input
                                    type="url"
                                    name="production"
                                    className="form-input"
                                    placeholder="https://www.example.com"
                                    value={tempLinks.production}
                                    onChange={handleLinkInputChange}
                                />
                                <p className="form-help">Enter the URL for your production environment</p>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="modal-button modal-button-cancel" onClick={handleCancelLinks}>
                                Cancel
                            </button>
                            <button className="modal-button modal-button-save" onClick={handleSaveLinks}>
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ---------- Layout ---------- */
StaffProjectDetails.getLayout = function getLayout(page) {
    return <StaffLayout>{page}</StaffLayout>;
};