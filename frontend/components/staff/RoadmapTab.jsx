import React, { useState } from 'react';
import { formatDate } from '../../utils/helpers';
import Modal from '../Modal';

/* ---------- Icons ---------- */
const CheckCircleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
);

const ClockIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);

const CircleIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
    </svg>
);

const AlertTriangleIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
);

// Helper to get token
const getAuthToken = () => {
    return typeof window !== 'undefined' ? localStorage.getItem('staffToken') : null;
};

const EditIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);

const PlusIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

// // Dummy Data
// const dummyRoadmapData = {
//     projectName: "Website Redesign & Migration",
//     overallProgress: 65,
//     totalPhases: 4,
//     completedPhases: 1,
//     deadline: "2024-12-15",
//     status: "In Progress",
//     phases: [
//         {
//             id: 1,
//             name: "Phase 1: Discovery & Research",
//             status: "Completed",
//             startDate: "2024-09-01",
//             endDate: "2024-09-15",
//             progress: 100,
//             milestones: [
//                 { id: 101, title: "Stakeholder Interviews", status: "Completed", dueDate: "2024-09-05" },
//                 { id: 102, title: "Competitor Analysis", status: "Completed", dueDate: "2024-09-10" },
//                 { id: 103, title: "Final Requirements Doc", status: "Completed", dueDate: "2024-09-15" }
//             ]
//         },
//         {
//             id: 2,
//             name: "Phase 2: UI/UX Design",
//             status: "In Progress",
//             startDate: "2024-09-16",
//             endDate: "2024-10-15",
//             progress: 75,
//             milestones: [
//                 { id: 201, title: "Wireframes", status: "Completed", dueDate: "2024-09-25" },
//                 { id: 202, title: "High-Fidelity Mockups", status: "In Progress", dueDate: "2024-10-05" },
//                 { id: 203, title: "Design Sign-off", status: "Not Started", dueDate: "2024-10-15" }
//             ]
//         },
//         {
//             id: 3,
//             name: "Phase 3: Development",
//             status: "Not Started",
//             startDate: "2024-10-16",
//             endDate: "2024-11-30",
//             progress: 0,
//             milestones: [
//                 { id: 301, title: "Frontend Implementation", status: "Not Started", dueDate: "2024-11-10" },
//                 { id: 302, title: "Backend Integration", status: "Not Started", dueDate: "2024-11-20" },
//                 { id: 303, title: "QA Testing", status: "Not Started", dueDate: "2024-11-30" }
//             ]
//         },
//         {
//             id: 4,
//             name: "Phase 4: Deployment & Handoff",
//             status: "On Hold",
//             startDate: "2024-12-01",
//             endDate: "2024-12-15",
//             progress: 0,
//             milestones: [
//                 { id: 401, title: "UAT", status: "Not Started", dueDate: "2024-12-05" },
//                 { id: 402, title: "Production Launch", status: "On Hold", dueDate: "2024-12-15" }
//             ]
//         }
//     ]
// };

// API Base URL
if (!process.env.NEXT_PUBLIC_API_URL) {
    console.warn('NEXT_PUBLIC_API_URL is not defined. Set it in your .env.local (dev) or Vercel environment variables (prod).');
}
const API_URL = process.env.NEXT_PUBLIC_API_URL;

const getStatusColor = (status) => {
    switch (status) {
        case 'Completed': return { bg: '#ecfdf5', text: '#065f46', border: '#10b981', icon: <CheckCircleIcon /> };
        case 'In Progress': return { bg: '#eff6ff', text: '#1e40af', border: '#3b82f6', icon: <ClockIcon /> };
        case 'On Hold': return { bg: '#fef3c7', text: '#92400e', border: '#f59e0b', icon: <AlertTriangleIcon /> };
        default: return { bg: '#f3f4f6', text: '#4b5563', border: '#9ca3af', icon: <CircleIcon /> };
    }
};

export default function RoadmapTab({ projectId }) {
    console.log('[RoadmapTab] Component mounted/rendered', { projectId });
    const [roadmapData, setRoadmapData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingPhase, setEditingPhase] = useState(null); // null means adding new phase
    const [editForm, setEditForm] = useState({
        name: '',
        startDate: '',
        endDate: '',
        status: 'Not Started',
        progress: 0,
        milestones: [],
        document_link: '',
        file: null,
        comment: ''
    });

    // Fetch Roadmap Data
    const fetchRoadmap = async () => {
        try {
            console.log('[RoadmapTab] Fetching roadmap for projectId:', projectId);
            console.log('[RoadmapTab] Using API_URL:', API_URL);
            setLoading(true);
            const token = getAuthToken();
            console.log('[RoadmapTab] Auth token present:', !!token);

            const url = `${API_URL}/staff/projects/${projectId}/roadmap`;
            console.log('[RoadmapTab] Full URL:', url);

            // Add timeout to prevent hanging
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 5000); // 5 second timeout

            const res = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                signal: controller.signal
            });
            clearTimeout(timeout);

            console.log('[RoadmapTab] API Response:', { status: res.status, ok: res.ok, statusText: res.statusText });

            if (!res.ok) {
                if (res.status === 404) {
                    // Project exists but no roadmap yet (handled by null data)
                    console.log('[RoadmapTab] No roadmap found (404) - showing empty state');
                    setRoadmapData(null);
                } else {
                    const errText = await res.text();
                    console.error('[RoadmapTab] Non-OK response:', errText);
                    throw new Error(`Failed to fetch roadmap (status: ${res.status})`);
                }
            } else {
                const data = await res.json();
                console.log('[RoadmapTab] Roadmap data received:', data);
                console.log('[RoadmapTab] Data type:', typeof data, 'Is null:', data === null, 'Is object:', typeof data === 'object');
                setRoadmapData(data);
            }
        } catch (err) {
            console.error('[RoadmapTab] Error fetching roadmap:', err);
            console.error('[RoadmapTab] Error message:', err.message);
            console.error('[RoadmapTab] Error name:', err.name);
            if (err.name === 'AbortError') {
                console.error('[RoadmapTab] REQUEST TIMEOUT - Server took too long to respond');
            }
            setError(err.message);
            // Set to null so empty state is shown instead of loading forever
            setRoadmapData(null);
        } finally {
            setLoading(false);
            console.log('[RoadmapTab] Loading state set to false');
        }
    };

    React.useEffect(() => {
        console.log('[RoadmapTab] useEffect triggered');
        console.log('[RoadmapTab] projectId:', projectId);
        console.log('[RoadmapTab] projectId type:', typeof projectId);
        console.log('[RoadmapTab] projectId is truthy:', !!projectId);
        console.log('[RoadmapTab] loading state:', loading);
        console.log('[RoadmapTab] roadmapData state:', roadmapData);

        if (projectId) {
            console.log('[RoadmapTab] projectId exists, calling fetchRoadmap()');
            fetchRoadmap();
        } else {
            console.log('[RoadmapTab] projectId is falsy, NOT calling fetchRoadmap');
        }
    }, [projectId]);

    const handleCreateRoadmap = async () => {
        try {
            console.log('[RoadmapTab] Creating new roadmap for projectId:', projectId);
            setLoading(true);
            const token = getAuthToken();
            const res = await fetch(`${API_URL}/staff/projects/${projectId}/roadmap`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) throw new Error('Failed to create roadmap');

            const data = await res.json();
            console.log('[RoadmapTab] Roadmap created successfully:', data);
            setRoadmapData(data);

            // 🔥 NOW OPEN THE MODAL TO ADD FIRST PHASE
            console.log('[RoadmapTab] Opening modal to add first phase');
            setEditingPhase(null);
            setEditForm({
                name: '',
                startDate: '',
                endDate: '',
                status: 'Not Started',
                progress: 0,
                milestones: [],
                document: '',
                comment: ''
            });
            setIsEditModalOpen(true);
        } catch (err) {
            console.error('[RoadmapTab] Error creating roadmap:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (phase) => {
        console.log('[RoadmapTab] Edit phase clicked:', phase._id);
        setEditingPhase(phase);
        setEditForm({
            name: phase.name,
            startDate: phase.startDate ? phase.startDate.split('T')[0] : '',
            endDate: phase.endDate ? phase.endDate.split('T')[0] : '',
            status: phase.status,
            progress: phase.progress,
            milestones: [...phase.milestones],
            document_link: phase.document_link || '',
            file: null, // New file to upload
            remove_file: false,
            comment: phase.latestComment || ''
        });
        setIsEditModalOpen(true);
    };

    const handleAddPhaseClick = () => {
        console.log('[RoadmapTab] Add phase clicked');
        console.log('[RoadmapTab] Setting isEditModalOpen to TRUE');
        setEditingPhase(null); // Create mode
        setEditForm({
            name: '',
            startDate: '',
            endDate: '',
            status: 'Not Started',
            progress: 0,
            milestones: [],
            document_link: '',
            file: null,
            comment: ''
        });
        setIsEditModalOpen(true);
        console.log('[RoadmapTab] After setState - isEditModalOpen should be true on next render');
    };

    const handleCloseModal = () => {
        setIsEditModalOpen(false);
        setEditingPhase(null);
        setError(null);
        setEditForm({
            name: '',
            startDate: '',
            endDate: '',
            status: 'Not Started',
            progress: 0,
            milestones: [],
            document_link: '',
            file: null,
            comment: ''
        });
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleMilestoneToggle = (milestoneId) => {
        setEditForm(prev => {
            const updatedMilestones = prev.milestones.map(m => {
                if (m._id === milestoneId || m.id === milestoneId) {
                    return { ...m, status: m.status === 'Completed' ? 'Not Started' : 'Completed' };
                }
                return m;
            });
            return {
                ...prev,
                milestones: updatedMilestones
            };
        });
    };

    // ✅ NEW: Add new milestone to the form
    const handleAddMilestoneClick = () => {
        console.log('[RoadmapTab] Adding new milestone');
        setEditForm(prev => ({
            ...prev,
            milestones: [
                ...prev.milestones,
                {
                    title: '',
                    dueDate: '',
                    status: 'Not Started'
                }
            ]
        }));
    };

    // ✅ NEW: Remove milestone from form
    const handleRemoveMilestone = (index) => {
        console.log('[RoadmapTab] Removing milestone at index:', index);
        setEditForm(prev => ({
            ...prev,
            milestones: prev.milestones.filter((_, i) => i !== index)
        }));
    };

    // ✅ NEW: Update milestone field (title, dueDate, status)
    const handleMilestoneChange = (index, field, value) => {
        console.log('[RoadmapTab] Updating milestone at index:', index, 'field:', field, 'value:', value);
        setEditForm(prev => {
            const updatedMilestones = [...prev.milestones];
            updatedMilestones[index] = {
                ...updatedMilestones[index],
                [field]: value
            };
            return {
                ...prev,
                milestones: updatedMilestones
            };
        });
    };

    const handleSaveChanges = async () => {
        // ✅ FIX: Check if editingPhase exists (could be null in "add new phase" mode)
        if (!editingPhase) {
            console.warn('[RoadmapTab] Cannot save: editingPhase is null, adding new phase instead');
            // Add new phase to backend
            return handleAddNewPhase();
        }

        // ✅ Validation
        if (!editForm.name?.trim()) {
            setError('Phase name is required');
            return;
        }
        if (!editForm.startDate) {
            setError('Start date is required');
            return;
        }
        if (!editForm.endDate) {
            setError('End date is required');
            return;
        }

        // At least one document (link or file) must be provided
        const hasExistingFile = editingPhase?.document_file_url && !editForm.remove_file;
        if (!editForm.document_link?.trim() && !editForm.file && !hasExistingFile) {
            setError('At least one document (link or file) is required');
            return;
        }

        console.log('[RoadmapTab] Saving changes for phase:', editingPhase._id);

        try {
            setLoading(true);
            const token = getAuthToken();

            // ✅ Clean milestone data
            const cleanedMilestones = editForm.milestones
                .filter(m => m.title && m.title.trim())
                .map(m => ({
                    title: m.title.trim(),
                    dueDate: m.dueDate || '',
                    status: m.status || 'Not Started'
                }));

            // Use FormData for file upload
            const formData = new FormData();
            formData.append('name', editForm.name.trim());
            formData.append('startDate', editForm.startDate);
            formData.append('endDate', editForm.endDate);
            formData.append('status', editForm.status);
            formData.append('progress', editForm.progress.toString());
            formData.append('milestones', JSON.stringify(cleanedMilestones));
            formData.append('document_link', editForm.document_link.trim());
            formData.append('latestComment', editForm.comment || '');

            if (editForm.file) {
                formData.append('file', editForm.file);
            }
            if (editForm.remove_file) {
                formData.append('remove_file', 'true');
            }

            console.log('[RoadmapTab] Sending update formData');

            const res = await fetch(`${API_URL}/staff/projects/${projectId}/roadmap/phases/${editingPhase._id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // Browser automatically sets Content-Type to multipart/form-data with boundary
                },
                body: formData
            });

            const responseData = await res.json();
            console.log('[RoadmapTab] Response from backend:', { status: res.status, data: responseData });

            if (!res.ok) {
                throw new Error(responseData.message || 'Failed to update phase');
            }

            console.log('[RoadmapTab] Phase updated:', responseData);
            setRoadmapData(responseData);
            handleCloseModal();
        } catch (err) {
            console.error('[RoadmapTab] Error updating phase:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddNewPhase = async () => {
        // ✅ Validation
        if (!editForm.name?.trim()) {
            setError('Phase name is required');
            return;
        }
        if (!editForm.startDate) {
            setError('Start date is required');
            return;
        }
        if (!editForm.endDate) {
            setError('End date is required');
            return;
        }

        // At least one document (link or file) must be provided
        if (!editForm.document_link?.trim() && !editForm.file) {
            setError('At least one document (link or file) is required');
            return;
        }

        console.log('[RoadmapTab] Adding new phase');

        try {
            setLoading(true);
            const token = getAuthToken();

            // ✅ Clean milestone data
            const cleanedMilestones = editForm.milestones
                .filter(m => m.title && m.title.trim())
                .map(m => ({
                    title: m.title.trim(),
                    dueDate: m.dueDate || '',
                    status: m.status || 'Not Started'
                }));

            // Use FormData for file upload
            const formData = new FormData();
            formData.append('name', editForm.name.trim());
            formData.append('startDate', editForm.startDate);
            formData.append('endDate', editForm.endDate);
            formData.append('status', editForm.status);
            formData.append('progress', editForm.progress.toString());
            formData.append('milestones', JSON.stringify(cleanedMilestones));
            formData.append('document_link', editForm.document_link.trim());
            formData.append('latestComment', editForm.comment || '');

            if (editForm.file) {
                formData.append('file', editForm.file);
            }

            console.log('[RoadmapTab] Sending add phase formData');

            const res = await fetch(`${API_URL}/staff/projects/${projectId}/roadmap/phases`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const responseData = await res.json();
            console.log('[RoadmapTab] Response from backend:', { status: res.status, data: responseData });

            if (!res.ok) {
                throw new Error(responseData.message || 'Failed to add phase');
            }

            console.log('[RoadmapTab] Phase added:', responseData);
            setRoadmapData(responseData);
            handleCloseModal();
        } catch (err) {
            console.error('[RoadmapTab] Error adding phase:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="roadmap-container">
            {console.log('[RoadmapTab RENDER] loading:', loading, 'roadmapData:', roadmapData, 'error:', error)}
            <style jsx>{`
                .roadmap-container {
                    display: flex;
                    flex-direction: column;
                    gap: var(--spacing-5);
                }

                /* Top Summary Section */
                .summary-card {
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 12px;
                    padding: var(--spacing-5);
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
                    margin-bottom: var(--spacing-2);
                }

                .summary-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: var(--spacing-4);
                }
                
                .project-title {
                     font-size: 20px;
                     font-weight: 700;
                     color: #1a1a1a;
                     margin: 0;
                }

                .summary-status-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 12px;
                    border-radius: 6px;
                    font-size: 13px;
                    font-weight: 600;
                    border: 1px solid;
                }

                .summary-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: var(--spacing-4);
                    margin-bottom: var(--spacing-4);
                }

                .summary-item {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .summary-label {
                    font-size: 12px;
                    color: #6b7280;
                    font-weight: 600;
                    text-transform: uppercase;
                }

                .summary-value {
                    font-size: 16px;
                    font-weight: 700;
                    color: #1a1a1a;
                }

                .progress-section {
                    margin-top: var(--spacing-2);
                }

                .progress-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 6px;
                    font-size: 13px;
                    font-weight: 600;
                    color: #4b5563;
                }

                .progress-track {
                    height: 8px;
                    background: #f3f4f6;
                    border-radius: 4px;
                    overflow: hidden;
                }

                .progress-fill {
                    height: 100%;
                    background: #3b82f6;
                    border-radius: 4px;
                    transition: width 0.5s ease;
                }

                /* Timeline Section */
                .timeline-wrapper {
                     position: relative;
                     padding-left: 20px;
                }

                .timeline-line {
                     position: absolute;
                     left: 15px;
                     top: 20px;
                     bottom: 20px;
                     width: 2px;
                     background: #e5e7eb;
                     z-index: 0;
                }

                .phase-card {
                     position: relative;
                     background: white;
                     border: 1px solid #e5e7eb;
                     border-radius: 12px;
                     padding: var(--spacing-5);
                     margin-bottom: var(--spacing-5);
                     box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                     z-index: 1;
                }

                .phase-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: var(--spacing-3);
                    flex-wrap: wrap;
                    gap: 10px;
                }

                .phase-title-wrapper {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-3);
                }
                
                .phase-marker {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: 700;
                    font-size: 14px;
                    border: 2px solid white;
                    box-shadow: 0 0 0 2px #e5e7eb;
                }

                .phase-title {
                    font-size: 16px;
                    font-weight: 700;
                    color: #1a1a1a;
                    margin: 0;
                }

                .phase-dates {
                    font-size: 13px;
                    color: #6b7280;
                    font-weight: 500;
                }
                
                .phase-content {
                    padding-left: 44px; /* Align with title */
                }

                .phase-progress-wrapper {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-3);
                    margin-bottom: var(--spacing-4);
                }

                .phase-progress-track {
                    flex: 1;
                    height: 6px;
                    background: #f3f4f6;
                    border-radius: 3px;
                    overflow: hidden;
                }

                .phase-progress-fill {
                    height: 100%;
                    border-radius: 3px;
                }

                .phase-progress-text {
                    font-size: 13px;
                    font-weight: 600;
                    color: #4b5563;
                    width: 40px;
                    text-align: right;
                }

                .milestones-title {
                    font-size: 13px;
                    font-weight: 700;
                    color: #6b7280;
                    text-transform: uppercase;
                    margin-bottom: var(--spacing-2);
                    letter-spacing: 0.5px;
                }

                .milestones-list {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .milestone-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px 14px;
                    background: #f9fafb;
                    border-radius: 8px;
                    border: 1px solid #f3f4f6;
                }
                
                .milestone-left {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-3);
                }

                .milestone-status-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                }

                .milestone-name {
                    font-size: 14px;
                    font-weight: 500;
                    color: #374151;
                }

                .milestone-right {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-3);
                }

                .milestone-date {
                    font-size: 12px;
                    color: #6b7280;
                }
                
                .milestone-badge {
                    font-size: 11px;
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-weight: 600;
                    border: 1px solid;
                }

                .edit-button {
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 6px;
                    padding: 6px;
                    cursor: pointer;
                    color: #6b7280;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .edit-button:hover {
                    color: #3b82f6;
                    border-color: #3b82f6;
                    background: #eff6ff;
                }

                /* Modal Form Styles */
                .form-group {
                    margin-bottom: 16px;
                }
                
                .form-label {
                    display: block;
                    margin-bottom: 8px;
                    font-size: 14px;
                    font-weight: 600;
                    color: #374151;
                }
                
                .form-select, .form-range {
                    width: 100%;
                    padding: 8px 12px;
                    border: 1px solid #d1d5db;
                    border-radius: 6px;
                    font-size: 14px;
                }
                
                .form-range {
                    padding: 0;
                }

                .milestone-checkbox-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 10px;
                    padding: 8px;
                    border-bottom: 1px solid #f3f4f6;
                }

                .milestone-checkbox {
                    margin-top: 3px;
                }

                .modal-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                }

                .btn-cancel {
                    padding: 8px 16px;
                    background: white;
                    border: 1px solid #d1d5db;
                    border-radius: 6px;
                    font-weight: 600;
                    cursor: pointer;
                }

                .btn-save {
                    padding: 8px 16px;
                    background: #3b82f6;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    font-weight: 600;
                    cursor: pointer;
                }

                .phase-comment {
                    margin-top: 16px;
                    padding: 12px;
                    background: #fffbeb;
                    border: 1px solid #fde68a;
                    border-radius: 8px;
                    font-size: 13px;
                    color: #92400e;
                }

                .add-phase-container {
                    display: flex;
                    justify-content: center;
                    padding: 20px 0;
                }

                .btn-add-phase {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 20px;
                    background: white;
                    color: #4b5563;
                    border: 1px dashed #d1d5db;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .btn-add-phase:hover {
                    border-color: #3b82f6;
                    color: #3b82f6;
                    background: #eff6ff;
                }

                @media (max-width: 768px) {
                    .summary-grid {
                        grid-template-columns: 1fr 1fr;
                    }
                    
                    .phase-content {
                        padding-left: 0;
                        margin-top: 10px;
                    }

                    .timeline-line {
                        display: none;
                    }
                }
            `}</style>
            {/* Loading State */}
            {loading && (
                <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
                    ⏳ Loading roadmap...
                </div>
            )}

            {/* Empty State */}
            {!loading && !roadmapData && (
                <div style={{
                    background: 'white',
                    border: '1px dashed #d1d5db',
                    padding: '40px',
                    borderRadius: '12px',
                    textAlign: 'center'
                }}>
                    <h3 style={{ marginBottom: '10px', color: '#1a1a1a' }}>📋 No Roadmap Created Yet</h3>
                    <p style={{ color: '#6b7280', marginBottom: '20px' }}>
                        This project does not have a roadmap yet. Create one to start tracking phases and milestones.
                    </p>
                    <button
                        onClick={(e) => {
                            console.warn('====== [CRITICAL TEST] Create Roadmap Button Clicked! ======');
                            console.log('Event object:', e);
                            console.log('Current timestamp:', new Date().toISOString());
                            window.TEST_BUTTON_CLICKED = true;
                            console.warn('====== Window flag set ======');
                            handleCreateRoadmap();
                        }}
                        style={{
                            padding: '10px 20px',
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            transition: 'background 0.2s'
                        }}
                        onMouseOver={(e) => e.target.style.background = '#2563eb'}
                        onMouseOut={(e) => e.target.style.background = '#3b82f6'}
                    >
                        ✚ Create Roadmap
                    </button>
                </div>
            )}

            {/* Top Summary Section */}
            {roadmapData && (
                <div className="summary-card">
                    <div className="summary-header">
                        <div>
                            <h2 className="project-title">Project Roadmap</h2>
                            <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
                                track project milestones & phases
                            </div>
                        </div>
                        <div
                            className="summary-status-badge"
                            style={{
                                backgroundColor: getStatusColor(roadmapData.status).bg,
                                color: getStatusColor(roadmapData.status).text,
                                borderColor: getStatusColor(roadmapData.status).border
                            }}
                        >
                            {getStatusColor(roadmapData.status).icon}
                            {roadmapData.status}
                        </div>
                    </div>

                    <div className="summary-grid">
                        <div className="summary-item">
                            <span className="summary-label">Total Phases</span>
                            <span className="summary-value">{roadmapData.totalPhases}</span>
                        </div>
                        <div className="summary-item">
                            <span className="summary-label">Completed Phases</span>
                            <span className="summary-value">{roadmapData.completedPhases}</span>
                        </div>
                        <div className="summary-item">
                            <span className="summary-label">Deadline</span>
                            <span className="summary-value">{roadmapData.deadline ? formatDate(roadmapData.deadline) : 'N/A'}</span>
                        </div>
                        <div className="summary-item">
                            <span className="summary-label">Completion</span>
                            <span className="summary-value">{roadmapData.overallProgress}%</span>
                        </div>
                    </div>

                    <div className="progress-section">
                        <div className="progress-header">
                            <span>Overall Progress</span>
                            <span>{roadmapData.overallProgress}%</span>
                        </div>
                        <div className="progress-track">
                            <div
                                className="progress-fill"
                                style={{ width: `${roadmapData.overallProgress}%` }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Timeline Section */}
            {roadmapData && (
                <div className="timeline-wrapper">
                    <div className="timeline-line"></div>

                    {roadmapData.phases.map((phase, index) => {
                        const statusColors = getStatusColor(phase.status);

                        return (
                            <div key={phase._id} className="phase-card">
                                <div className="phase-header">
                                    <div className="phase-title-wrapper">
                                        <div
                                            className="phase-marker"
                                            style={{
                                                backgroundColor: statusColors.border
                                            }}
                                        >
                                            {index + 1}
                                        </div>
                                        <h3 className="phase-title">{phase.name}</h3>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div className="phase-dates">
                                            {formatDate(phase.startDate)} — {formatDate(phase.endDate)}
                                        </div>
                                        <button
                                            className="edit-button"
                                            onClick={(e) => {
                                                console.log('[DEBUG] Edit phase button clicked!', e);
                                                handleEditClick(phase);
                                            }}
                                            title="Edit Phase"
                                        >
                                            <EditIcon />
                                        </button>
                                    </div>
                                </div>

                                <div className="phase-content">
                                    <div className="phase-progress-wrapper">
                                        <div className="phase-progress-track">
                                            <div
                                                className="phase-progress-fill"
                                                style={{
                                                    width: `${phase.progress}%`,
                                                    backgroundColor: statusColors.border
                                                }}
                                            />
                                        </div>
                                        <div className="phase-progress-text">{phase.progress}%</div>
                                    </div>

                                    {/* Document Links & Files */}
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                                        {phase.document_type === 'link' && phase.document_value && (
                                            <a
                                                href={phase.document_value.startsWith('http') ? phase.document_value : `https://${phase.document_value}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    padding: '8px 16px',
                                                    background: '#f8fafc',
                                                    border: '1px solid #e2e8f0',
                                                    borderRadius: '8px',
                                                    color: '#2563eb',
                                                    fontSize: '13px',
                                                    fontWeight: '600',
                                                    textDecoration: 'none',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseOver={(e) => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.background = '#eff6ff'; }}
                                                onMouseOut={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f8fafc'; }}
                                            >
                                                🔗 Resource Link
                                            </a>
                                        )}

                                        {phase.document_type === 'file' && phase.document_value && (
                                            <a
                                                href={`${API_URL}/api/roadmap-file?path=${encodeURIComponent(phase.document_value)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    padding: '8px 16px',
                                                    background: '#ecfdf5',
                                                    border: '1px solid #d1fae5',
                                                    borderRadius: '8px',
                                                    color: '#059669',
                                                    fontSize: '13px',
                                                    fontWeight: '600',
                                                    textDecoration: 'none',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseOver={(e) => { e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.background = '#f0fdf4'; }}
                                                onMouseOut={(e) => { e.currentTarget.style.borderColor = '#d1fae5'; e.currentTarget.style.background = '#ecfdf5'; }}
                                            >
                                                📄 {phase.document_file_name || 'Download Document'}
                                            </a>
                                        )}
                                    </div>

                                    <div className="milestones-section">
                                        <div className="milestones-title">Key Milestones</div>
                                        <div className="milestones-list">
                                            {phase.milestones.map((milestone) => {
                                                const mColors = getStatusColor(milestone.status);
                                                return (
                                                    <div key={milestone._id} className="milestone-item">
                                                        <div className="milestone-left">
                                                            <div
                                                                className="milestone-status-dot"
                                                                style={{ backgroundColor: mColors.border }}
                                                            />
                                                            <span className="milestone-name">{milestone.title}</span>
                                                        </div>
                                                        <div className="milestone-right">
                                                            <span className="milestone-date">Due: {formatDate(milestone.dueDate)}</span>
                                                            <div
                                                                className="milestone-badge"
                                                                style={{
                                                                    backgroundColor: mColors.bg,
                                                                    color: mColors.text,
                                                                    borderColor: mColors.border
                                                                }}
                                                            >
                                                                {milestone.status}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {
                                        phase.latestComment && (
                                            <div className="phase-comment">
                                                <strong>📝 Latest Note:</strong> {phase.latestComment}
                                            </div>
                                        )
                                    }
                                </div>
                            </div>
                        );
                    })}

                    <div className="add-phase-container">
                        <button
                            className="btn-add-phase"
                            onClick={(e) => {
                                console.warn('====== [CRITICAL TEST] Add Phase Button Clicked! ======');
                                console.log('Event object:', e);
                                console.log('Current timestamp:', new Date().toISOString());
                                window.TEST_ADD_PHASE_CLICKED = true;
                                console.warn('====== Window flag set ======');
                                handleAddPhaseClick();
                            }}
                        >
                            <PlusIcon /> Add Phase
                        </button>
                    </div>
                </div>
            )}

            {/* Edit/Add Modal */}
            {console.log('[RoadmapTab MODAL RENDER] isEditModalOpen:', isEditModalOpen, 'editingPhase:', editingPhase?.name || 'null')}
            <Modal
                isOpen={isEditModalOpen}
                onClose={handleCloseModal}
                title={editingPhase ? `Edit ${editingPhase.name}` : 'Add New Phase'}
                footer={
                    < div className="modal-actions" >
                        <button className="btn-cancel" onClick={handleCloseModal}>Cancel</button>
                        <button className="btn-save" onClick={handleSaveChanges} disabled={loading}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div >
                }
            >
                <div>
                    {/* ✅ Error Message Display */}
                    {error && (
                        <div style={{
                            marginBottom: '16px',
                            padding: '12px',
                            backgroundColor: '#fee2e2',
                            color: '#991b1b',
                            borderRadius: '6px',
                            fontSize: '14px',
                            border: '1px solid #fecaca'
                        }}>
                            ⚠️ {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">Phase Name</label>
                        <input
                            type="text"
                            name="name"
                            className="form-input"
                            style={{ width: '100%' }}
                            placeholder="e.g. Phase 1: Planning"
                            value={editForm.name}
                            onChange={handleFormChange}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="form-group">
                            <label className="form-label">Start Date</label>
                            <input
                                type="date"
                                name="startDate"
                                className="form-input"
                                value={editForm.startDate}
                                onChange={handleFormChange}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">End Date</label>
                            <input
                                type="date"
                                name="endDate"
                                className="form-input"
                                value={editForm.endDate}
                                onChange={handleFormChange}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Phase Status</label>
                        <select
                            name="status"
                            className="form-select"
                            value={editForm.status}
                            onChange={handleFormChange}
                        >
                            <option value="Not Started">Not Started</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="On Hold">On Hold</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Progress</span>
                            <span>{editForm.progress}%</span>
                        </label>
                        <input
                            type="range"
                            name="progress"
                            className="form-range"
                            min="0"
                            max="100"
                            value={editForm.progress}
                            onChange={handleFormChange}
                        />
                    </div>

                    {/* Documents Section */}
                    <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                        <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '600', color: '#111827' }}>📁 Phase Documents</h4>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label" style={{ fontWeight: '500', fontSize: '13px' }}>Document Link</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="url"
                                        name="document_link"
                                        className="form-input"
                                        placeholder="https://example.com/document.pdf"
                                        style={{
                                            width: '100%',
                                            paddingRight: editForm.document_link ? '32px' : '12px',
                                            appearance: 'none',
                                            backgroundImage: 'none'
                                        }}
                                        value={editForm.document_link}
                                        onChange={handleFormChange}
                                    />
                                    {editForm.document_link && (
                                        <a href={editForm.document_link} target="_blank" rel="noopener noreferrer" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#3b82f6' }}>
                                            🔗
                                        </a>
                                    )}
                                </div>
                            </div>

                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label" style={{ fontWeight: '500', fontSize: '13px' }}>Upload Document (Max 10MB)</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {editingPhase?.document_file_name && !editForm.remove_file && !editForm.file ? (
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '6px' }}>
                                            <span style={{ fontSize: '12px', color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '150px' }}>
                                                📄 {editingPhase.document_file_name}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => setEditForm(prev => ({ ...prev, remove_file: true }))}
                                                style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ) : (
                                        <div style={{ position: 'relative' }}>
                                            <input
                                                type="file"
                                                accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg"
                                                style={{ fontSize: '12px', width: '100%' }}
                                                onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    if (file && file.size > 10 * 1024 * 1024) {
                                                        alert('File size exceeds 10MB limit');
                                                        e.target.value = null;
                                                        return;
                                                    }
                                                    setEditForm(prev => ({ ...prev, file, remove_file: false }));
                                                }}
                                            />
                                            {editForm.file && (
                                                <button
                                                    type="button"
                                                    onClick={() => setEditForm(prev => ({ ...prev, file: null }))}
                                                    style={{ position: 'absolute', right: 0, top: 0, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <p style={{ marginTop: '8px', marginBottom: 0, fontSize: '11px', color: '#6b7280' }}>
                            At least one document (link or file) is required for this phase.
                        </p>
                    </div>

                    <div className="form-group">
                        <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>Milestones</span>
                            <button
                                type="button"
                                onClick={handleAddMilestoneClick}
                                style={{
                                    padding: '4px 12px',
                                    background: '#10b981',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    fontWeight: '500'
                                }}
                            >
                                + Add Milestone
                            </button>
                        </label>

                        {/* Show existing milestones if any */}
                        {editForm.milestones.length > 0 && (
                            <div style={{ marginBottom: '16px' }}>
                                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px', fontWeight: '500' }}>
                                    {editForm.milestones.filter(m => m.title?.trim()).length} milestone{editForm.milestones.filter(m => m.title?.trim()).length !== 1 ? 's' : ''}
                                </div>
                                <div style={{ border: '1px solid #e5e7eb', borderRadius: '6px', backgroundColor: '#f9fafb' }}>
                                    {editForm.milestones.map((milestone, index) => (
                                        <div key={index} style={{ padding: '12px', borderBottom: index < editForm.milestones.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px', alignItems: 'start' }}>
                                                <div>
                                                    {/* Milestone Title */}
                                                    <div style={{ marginBottom: '8px' }}>
                                                        <input
                                                            type="text"
                                                            placeholder="Milestone title (e.g., Wireframes)"
                                                            value={milestone.title || ''}
                                                            onChange={(e) => handleMilestoneChange(index, 'title', e.target.value)}
                                                            style={{
                                                                width: '100%',
                                                                padding: '8px',
                                                                border: '1px solid #d1d5db',
                                                                borderRadius: '4px',
                                                                fontSize: '14px'
                                                            }}
                                                        />
                                                    </div>

                                                    {/* Due Date & Status in grid */}
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                                        <input
                                                            type="date"
                                                            value={milestone.dueDate || ''}
                                                            onChange={(e) => handleMilestoneChange(index, 'dueDate', e.target.value)}
                                                            style={{
                                                                padding: '8px',
                                                                border: '1px solid #d1d5db',
                                                                borderRadius: '4px',
                                                                fontSize: '12px'
                                                            }}
                                                        />
                                                        <select
                                                            value={milestone.status || 'Not Started'}
                                                            onChange={(e) => handleMilestoneChange(index, 'status', e.target.value)}
                                                            style={{
                                                                padding: '8px',
                                                                border: '1px solid #d1d5db',
                                                                borderRadius: '4px',
                                                                fontSize: '12px'
                                                            }}
                                                        >
                                                            <option value="Not Started">Not Started</option>
                                                            <option value="In Progress">In Progress</option>
                                                            <option value="Completed">Completed</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                {/* Remove Button */}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveMilestone(index)}
                                                    style={{
                                                        padding: '8px 12px',
                                                        background: '#ef4444',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        fontSize: '12px',
                                                        fontWeight: '500'
                                                    }}
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Show message if no milestones */}
                        {editForm.milestones.length === 0 && (
                            <div style={{
                                padding: '16px',
                                backgroundColor: '#f0fdf4',
                                border: '1px solid #bbf7d0',
                                borderRadius: '6px',
                                color: '#166534',
                                fontSize: '14px',
                                textAlign: 'center'
                            }}>
                                No milestones yet. Click "+ Add Milestone" to add one.
                            </div>
                        )}
                    </div>
                </div>
            </Modal >
        </div >
    );
}
