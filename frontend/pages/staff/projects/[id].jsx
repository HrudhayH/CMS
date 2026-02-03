import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import StaffLayout from '../../../layouts/staffLayout';
import { Alert } from '../../../components';
import { formatDate } from '../../../utils/helpers';

/* ---------- Dummy Projects ---------- */
const DUMMY_PROJECTS = [
    {
        id: 1,
        title: 'Ayurveda Website',
        description: 'Complete redesign and development of a modern, responsive website for an Ayurveda clinic. The project includes appointment booking, doctor profiles, treatment information, and a blog section for wellness articles.',
        status: 'In Progress',
        createdAt: '2026-01-10',
        updatedAt: '2026-01-28',
        assignedClients: [{ name: 'Wellness Pvt Ltd', email: 'contact@wellness.com', phone: '+91 98765 43210' }],
        techStack: ['React', 'Next.js', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
        progress: 65,
        priority: 'High',
        deadline: '2026-03-15',
        teamMembers: ['John Doe', 'Jane Smith', 'Mike Johnson'],
        statusHistory: [
            {
                id: 3,
                date: '2026-01-28',
                status: 'In Progress',
                comment: 'Completed the booking module integration',
                progress: 65,
                author: 'John Doe',
                time: '02:30 PM'
            },
            {
                id: 2,
                date: '2026-01-25',
                status: 'In Progress',
                comment: 'Working on the appointment booking feature',
                progress: 50,
                author: 'Jane Smith',
                time: '11:00 AM'
            },
            {
                id: 1,
                date: '2026-01-20',
                status: 'In Progress',
                comment: 'Initial setup completed, starting frontend development',
                progress: 30,
                author: 'John Doe',
                time: '09:15 AM'
            },
        ],
    },
    {
        id: 2,
        title: 'CMS Dashboard',
        description: 'Internal content management system for managing company resources, blog posts, and documentation. Features include role-based access control, media library, and analytics dashboard.',
        status: 'Completed',
        createdAt: '2025-12-01',
        updatedAt: '2026-01-15',
        assignedClients: [{ name: 'Internal', email: 'internal@company.com', phone: 'N/A' }],
        techStack: ['React', 'Express', 'MongoDB', 'Redux', 'Material-UI'],
        progress: 100,
        priority: 'Medium',
        deadline: '2026-01-15',
        teamMembers: ['Sarah Williams', 'Tom Brown'],
        statusHistory: [
            {
                id: 2,
                date: '2026-01-15',
                status: 'Completed',
                comment: 'Final testing completed and deployed to production',
                progress: 100,
                author: 'Sarah Williams',
                time: '05:00 PM'
            },
            {
                id: 1,
                date: '2026-01-10',
                status: 'In Progress',
                comment: 'Analytics dashboard integration completed',
                progress: 90,
                author: 'Tom Brown',
                time: '03:30 PM'
            },
        ],
    },
];

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

export default function StaffProjectDetails() {
    const router = useRouter();
    const { id } = router.query;

    const [project, setProject] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Update form state
    const [updateForm, setUpdateForm] = useState({
        status: '',
        progress: '',
        comment: '',
    });

    useEffect(() => {
        if (!id) return;

        const found = DUMMY_PROJECTS.find(
            (p) => String(p.id) === String(id)
        );

        if (!found) {
            setError('Project not found');
        } else {
            setProject(found);
            setUpdateForm({
                status: found.status,
                progress: found.progress,
                comment: '',
            });
        }
    }, [id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUpdateForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmitUpdate = (e) => {
        e.preventDefault();

        // Validation
        if (!updateForm.comment.trim()) {
            setError('Please add a comment about your update');
            return;
        }

        // Simulate API call
        const newUpdate = {
            id: Date.now(),
            date: new Date().toISOString().split('T')[0],
            status: updateForm.status,
            comment: updateForm.comment,
            progress: parseInt(updateForm.progress),
            author: 'Current User', // Would come from auth
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        };

        // Update project locally
        setProject(prev => ({
            ...prev,
            status: updateForm.status,
            progress: parseInt(updateForm.progress),
            statusHistory: [newUpdate, ...prev.statusHistory]
        }));

        setSuccess('Status update added successfully!');
        setUpdateForm(prev => ({ ...prev, comment: '' }));

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
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

            {project && (
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

                    {/* Main Content Layout */}
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

                                    <button type="submit" className="submit-button">
                                        <SendIcon />
                                        Submit Update
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

                                {project.statusHistory && project.statusHistory.length > 0 ? (
                                    <div className="timeline">
                                        {project.statusHistory.map((update) => {
                                            const statusColor = getStatusColor(update.status);
                                            return (
                                                <div key={update.id} className="timeline-item">
                                                    <div className="timeline-marker">
                                                        <TrendingUpIcon />
                                                    </div>
                                                    <div className="timeline-content">
                                                        <div className="timeline-date">
                                                            <CalendarIcon />
                                                            {formatDate(update.date)} at {update.time}
                                                        </div>
                                                        <div className="timeline-comment">
                                                            {update.comment}
                                                        </div>
                                                        <div className="timeline-meta">
                                                            <div className="timeline-author">
                                                                <div className="author-avatar">
                                                                    {update.author.split(' ').map(n => n[0]).join('')}
                                                                </div>
                                                                {update.author}
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
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="empty-timeline">
                                        <p>No status updates yet. Be the first to add one!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

/* ---------- Layout ---------- */
StaffProjectDetails.getLayout = function getLayout(page) {
    return <StaffLayout>{page}</StaffLayout>;
};