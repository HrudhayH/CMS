import React, { useState, useEffect } from 'react';
import { formatDate } from '../../utils/helpers';

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

// Helper to get client token
const getAuthToken = () => {
    return typeof window !== 'undefined' ? localStorage.getItem('clientToken') : null;
};

const getStatusColor = (status) => {
    switch (status) {
        case 'Completed': return { bg: '#ecfdf5', text: '#065f46', border: '#10b981', icon: <CheckCircleIcon /> };
        case 'In Progress': return { bg: '#eff6ff', text: '#1e40af', border: '#3b82f6', icon: <ClockIcon /> };
        case 'On Hold': return { bg: '#fef3c7', text: '#92400e', border: '#f59e0b', icon: <AlertTriangleIcon /> };
        default: return { bg: '#f3f4f6', text: '#4b5563', border: '#9ca3af', icon: <CircleIcon /> };
    }
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export default function ClientRoadmapTab({ projectId }) {
    const [roadmapData, setRoadmapData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch Roadmap Data (read-only for clients)
    const fetchRoadmap = async () => {
        try {
            setLoading(true);
            const token = getAuthToken();
            
            const url = `${API_URL}/client/projects/${projectId}/roadmap`;
            
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 5000);
            
            const res = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                signal: controller.signal
            });
            clearTimeout(timeout);

            if (!res.ok) {
                if (res.status === 404) {
                    // No roadmap yet
                    setRoadmapData(null);
                } else {
                    throw new Error(`Failed to fetch roadmap (status: ${res.status})`);
                }
            } else {
                const data = await res.json();
                setRoadmapData(data);
            }
        } catch (err) {
            console.error('[ClientRoadmapTab] Error fetching roadmap:', err);
            setError(err.message);
            setRoadmapData(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (projectId) {
            fetchRoadmap();
        }
    }, [projectId]);

    return (
        <div className="roadmap-container">
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
                    padding-left: 44px;
                }

                .phase-status-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 4px 12px;
                    border-radius: 6px;
                    font-size: 12px;
                    font-weight: 600;
                    border: 1px solid;
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

                .phase-comment {
                    margin-top: 16px;
                    padding: 12px;
                    background: #fffbeb;
                    border: 1px solid #fde68a;
                    border-radius: 8px;
                    font-size: 13px;
                    color: #92400e;
                }

                .empty-state {
                    background: white;
                    border: 1px dashed #d1d5db;
                    padding: 40px;
                    border-radius: 12px;
                    text-align: center;
                }

                .empty-state h3 {
                    margin-bottom: 10px;
                    color: #1a1a1a;
                }

                .empty-state p {
                    color: #6b7280;
                    margin: 0;
                }

                .error-container {
                    background: #fee2e2;
                    border: 1px solid #fecaca;
                    color: #991b1b;
                    padding: 16px;
                    border-radius: 8px;
                    margin-bottom: 16px;
                }

                .loading-state {
                    padding: 20px;
                    text-align: center;
                    color: #6b7280;
                }

                @media (max-width: 768px) {
                    .summary-grid {
                        grid-template-columns: 1fr 1fr;
                    }
                    
                    .phase-content {
                        padding-left: 0;
                        margin-top: 10px;
                    }

                    .phase-header {
                        flex-direction: column;
                        align-items: flex-start;
                    }

                    .timeline-line {
                        display: none;
                    }
                }
            `}</style>

            {/* Loading State */}
            {loading && (
                <div className="loading-state">
                    ⏳ Loading roadmap...
                </div>
            )}

            {/* Empty State */}
            {!loading && !roadmapData && !error && (
                <div className="empty-state">
                    <h3>📋 No Roadmap Available</h3>
                    <p>
                        The project roadmap has not been created yet. Please check back later.
                    </p>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="error-container">
                    ⚠️ {error}
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
                            className="phase-status-badge"
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
                                        <div
                                            className="phase-status-badge"
                                            style={{
                                                backgroundColor: statusColors.bg,
                                                color: statusColors.text,
                                                borderColor: statusColors.border
                                            }}
                                        >
                                            {statusColors.icon}
                                            {phase.status}
                                        </div>
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

                                    <div className="milestones-section">
                                        <div className="milestones-title">Key Milestones</div>
                                        <div className="milestones-list">
                                            {phase.milestones && phase.milestones.length > 0 ? (
                                                phase.milestones.map((milestone) => {
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
                                                })
                                            ) : (
                                                <div style={{ padding: '10px', color: '#6b7280', fontSize: '13px' }}>
                                                    No milestones defined for this phase
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {phase.latestComment && (
                                        <div className="phase-comment">
                                            <strong>📝 Latest Note:</strong> {phase.latestComment}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
