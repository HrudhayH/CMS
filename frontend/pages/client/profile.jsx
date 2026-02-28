import { useState, useEffect } from 'react';
import ClientLayout from '../../layouts/ClientLayout';
import { getClientProfile, uploadClientProfileImage, deleteClientProfileImage } from '../../services/api';
import ProfileImageUpload from '../../components/ProfileImageUpload';

/* ---------- Icons ---------- */
const BuildingIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
        <path d="M9 22v-4h6v4" />
        <line x1="8" y1="6" x2="10" y2="6" />
        <line x1="14" y1="6" x2="16" y2="6" />
        <line x1="8" y1="10" x2="10" y2="10" />
        <line x1="14" y1="10" x2="16" y2="10" />
        <line x1="8" y1="14" x2="10" y2="14" />
        <line x1="14" y1="14" x2="16" y2="14" />
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

const IdIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
);

const MapPinIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
    </svg>
);

const FileTextIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
);

const FolderIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
);


export default function ClientProfile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const res = await getClientProfile();
                setProfile(res.data);
                setError('');
            } catch (err) {
                setError(err.message || 'Failed to load profile');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const refreshProfile = async () => {
        try {
            const res = await getClientProfile();
            setProfile(res.data);
        } catch (err) {
            setError(err.message || 'Failed to refresh profile');
        }
    };

    const handleUpload = async (file) => {
        await uploadClientProfileImage(file);
        await refreshProfile();
    };

    const handleDelete = async () => {
        await deleteClientProfileImage();
        await refreshProfile();
    };

    const getStatusColor = (status) => {
        const colors = {
            'Active': { bg: '#ecfdf5', color: '#065f46', border: '#10b981' },
            'Inactive': { bg: '#fef2f2', color: '#991b1b', border: '#ef4444' },
            'Paused': { bg: '#fef3c7', color: '#92400e', border: '#f59e0b' },
            'Completed': { bg: '#ecfdf5', color: '#065f46', border: '#10b981' },
            'New': { bg: '#f3f4f6', color: '#4b5563', border: '#6b7280' },
            'In Progress': { bg: '#eff6ff', color: '#1e40af', border: '#3b82f6' },
            'On Hold': { bg: '#fef3c7', color: '#92400e', border: '#f59e0b' },
        };
        return colors[status] || colors['Active'];
    };

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    const formatId = (id) => {
        if (!id) return '—';
        return `CLT-${id.toString().slice(-6).toUpperCase()}`;
    };

    return (
        <div className="profile-page">
            <style jsx>{`
                .profile-page {
                    padding: var(--spacing-6);
                    background: #fafbfc;
                    min-height: 100vh;
                }

                .page-header {
                    margin-bottom: var(--spacing-6);
                }

                .page-title {
                    font-size: 28px;
                    font-weight: 700;
                    color: #1a1a1a;
                    margin: 0 0 var(--spacing-2) 0;
                }

                .page-subtitle {
                    font-size: 16px;
                    color: #6b7280;
                    margin: 0;
                }

                /* Profile Header */
                .profile-header {
                    background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
                    border-radius: 16px;
                    padding: 40px;
                    margin-bottom: var(--spacing-6);
                    color: white;
                    display: flex;
                    align-items: center;
                    gap: 28px;
                    box-shadow: 0 4px 20px rgba(139, 92, 246, 0.25);
                    position: relative;
                }

                .profile-header::before {
                    content: '';
                    position: absolute;
                    top: -50%;
                    right: -20%;
                    width: 400px;
                    height: 400px;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.05);
                    pointer-events: none;
                    z-index: 0;
                }

                .profile-header::after {
                    content: '';
                    position: absolute;
                    bottom: -60%;
                    left: -10%;
                    width: 300px;
                    height: 300px;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.03);
                    pointer-events: none;
                    z-index: 0;
                }

                .profile-avatar {
                    width: 88px;
                    height: 88px;
                    border-radius: 16px;
                    background: rgba(255,255,255,0.2);
                    backdrop-filter: blur(10px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 36px;
                    font-weight: 700;
                    flex-shrink: 0;
                    border: 3px solid rgba(255,255,255,0.3);
                    z-index: 1;
                }

                .profile-header-info {
                    flex: 1;
                    z-index: 1;
                }

                .profile-name {
                    font-size: 28px;
                    font-weight: 700;
                    margin: 0 0 4px 0;
                }

                .profile-company {
                    font-size: 15px;
                    opacity: 0.85;
                    margin: 0 0 12px 0;
                }

                .profile-header-meta {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    flex-wrap: wrap;
                }

                .profile-status-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 5px 14px;
                    border-radius: 20px;
                    font-size: 13px;
                    font-weight: 600;
                }

                .profile-status-badge.active {
                    background: rgba(16, 185, 129, 0.2);
                    color: #a7f3d0;
                }

                .profile-status-badge.inactive {
                    background: rgba(239, 68, 68, 0.2);
                    color: #fecaca;
                }

                .profile-status-badge.paused {
                    background: rgba(245, 158, 11, 0.2);
                    color: #fde68a;
                }

                .status-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                }

                .status-dot.active { background: #10b981; }
                .status-dot.inactive { background: #ef4444; }
                .status-dot.paused { background: #f59e0b; }

                /* Info Grid */
                .content-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: var(--spacing-5);
                    margin-bottom: var(--spacing-6);
                }

                .card {
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 12px;
                    padding: var(--spacing-5);
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
                }

                .card.full-width {
                    grid-column: 1 / -1;
                }

                .card-header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: var(--spacing-4);
                    padding-bottom: var(--spacing-3);
                    border-bottom: 1px solid #f3f4f6;
                }

                .card-header-icon {
                    width: 36px;
                    height: 36px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                }

                .card-header-icon.purple { background: #8b5cf6; }
                .card-header-icon.blue { background: #3b82f6; }

                .card-title {
                    font-size: 18px;
                    font-weight: 700;
                    color: #1a1a1a;
                    margin: 0;
                }

                .info-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                }

                .info-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                }

                .info-item.full-width {
                    grid-column: 1 / -1;
                }

                .info-icon {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    background: #f5f3ff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #8b5cf6;
                    flex-shrink: 0;
                    margin-top: 2px;
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
                    font-size: 15px;
                    font-weight: 600;
                    color: #1a1a1a;
                    word-break: break-word;
                }

                /* Projects Table */
                .projects-table {
                    width: 100%;
                    border-collapse: separate;
                    border-spacing: 0;
                }

                .projects-table thead th {
                    text-align: left;
                    padding: 12px 16px;
                    font-size: 12px;
                    font-weight: 700;
                    color: #6b7280;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    background: #f9fafb;
                    border-bottom: 1px solid #e5e7eb;
                }

                .projects-table thead th:first-child {
                    border-radius: 8px 0 0 0;
                }

                .projects-table thead th:last-child {
                    border-radius: 0 8px 0 0;
                }

                .projects-table tbody td {
                    padding: 14px 16px;
                    font-size: 14px;
                    color: #374151;
                    border-bottom: 1px solid #f3f4f6;
                }

                .projects-table tbody tr {
                    transition: background 0.15s ease;
                }

                .projects-table tbody tr:hover {
                    background: #f9fafb;
                }

                .projects-table tbody tr:last-child td {
                    border-bottom: none;
                }

                .project-name-cell {
                    font-weight: 600;
                    color: #1a1a1a;
                }

                .staff-list {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 4px;
                }

                .staff-chip {
                    display: inline-flex;
                    align-items: center;
                    padding: 2px 8px;
                    background: #f0f5ff;
                    color: #3b82f6;
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: 500;
                }

                .status-badge {
                    display: inline-flex;
                    align-items: center;
                    padding: 4px 12px;
                    border-radius: 6px;
                    font-size: 12px;
                    font-weight: 600;
                    border: 1px solid;
                }

                .empty-state {
                    text-align: center;
                    padding: 40px 20px;
                    color: #9ca3af;
                }

                .empty-state-icon {
                    width: 56px;
                    height: 56px;
                    border-radius: 50%;
                    background: #f3f4f6;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 16px;
                    color: #9ca3af;
                }

                .empty-state p {
                    font-size: 15px;
                    margin: 0;
                }

                /* Contact Admin */
                .contact-admin {
                    background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
                    border: 1px solid #ddd6fe;
                    border-radius: 12px;
                    padding: 28px;
                    text-align: center;
                }

                .contact-admin-title {
                    font-size: 16px;
                    font-weight: 600;
                    color: #5b21b6;
                    margin: 0 0 8px 0;
                }

                .contact-admin-text {
                    font-size: 14px;
                    color: #6b7280;
                    margin: 0 0 4px 0;
                }

                .contact-admin a {
                    color: #8b5cf6;
                    font-weight: 600;
                    text-decoration: none;
                    transition: color 0.2s ease;
                }

                .contact-admin a:hover {
                    color: #6d28d9;
                    text-decoration: underline;
                }

                /* Loading & Error */
                .loading-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: 80px;
                }

                .error-banner {
                    padding: 20px;
                    background: #fef2f2;
                    color: #dc2626;
                    border-radius: 8px;
                    text-align: center;
                    font-weight: 500;
                }

                @media (max-width: 1024px) {
                    .content-grid {
                        grid-template-columns: 1fr;
                    }
                }

                @media (max-width: 768px) {
                    .profile-header {
                        flex-direction: column;
                        text-align: center;
                        padding: 28px;
                    }

                    .profile-header-meta {
                        justify-content: center;
                    }

                    .info-grid {
                        grid-template-columns: 1fr;
                    }

                    .projects-table {
                        font-size: 13px;
                    }

                    .projects-table thead th,
                    .projects-table tbody td {
                        padding: 10px 12px;
                    }
                }
            `}</style>

            {/* Page Header */}
            <div className="page-header">
                <h1 className="page-title">Company Profile</h1>
                <p className="page-subtitle">Your company details and associated projects</p>
            </div>

            {loading ? (
                <div className="loading-container">
                    <div className="loading-spinner loading-spinner-lg"></div>
                </div>
            ) : error ? (
                <div className="error-banner">{error}</div>
            ) : profile && (
                <>
                    {/* Profile Header Card */}
                    <div className="profile-header">
                        <ProfileImageUpload
                            currentImageUrl={profile.client.profileImageUrl || null}
                            onUpload={handleUpload}
                            onDelete={handleDelete}
                            accentColor="#8b5cf6"
                            userName={profile.client.company || profile.client.name}
                        />
                        <div className="profile-header-info">
                            <h2 className="profile-name">{profile.client.company || profile.client.name}</h2>
                            {profile.client.company && profile.client.name !== profile.client.company && (
                                <p className="profile-company">Contact: {profile.client.name}</p>
                            )}
                            <div className="profile-header-meta">
                                <span className={`profile-status-badge ${profile.client.status === 'Active' ? 'active' :
                                        profile.client.status === 'Paused' ? 'paused' : 'inactive'
                                    }`}>
                                    <span className={`status-dot ${profile.client.status === 'Active' ? 'active' :
                                            profile.client.status === 'Paused' ? 'paused' : 'inactive'
                                        }`}></span>
                                    {profile.client.status}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="content-grid">
                        {/* Company Information */}
                        <div className="card">
                            <div className="card-header">
                                <div className="card-header-icon purple">
                                    <BuildingIcon />
                                </div>
                                <h3 className="card-title">Company Information</h3>
                            </div>
                            <div className="info-grid">
                                <div className="info-item">
                                    <div className="info-icon"><IdIcon /></div>
                                    <div>
                                        <div className="info-label">Client ID</div>
                                        <div className="info-value">{profile.client.clientCode || formatId(profile.client._id)}</div>
                                    </div>
                                </div>
                                <div className="info-item">
                                    <div className="info-icon"><BuildingIcon /></div>
                                    <div>
                                        <div className="info-label">Company Name</div>
                                        <div className="info-value">{profile.client.company || '—'}</div>
                                    </div>
                                </div>
                                <div className="info-item">
                                    <div className="info-icon"><MailIcon /></div>
                                    <div>
                                        <div className="info-label">Email</div>
                                        <div className="info-value">{profile.client.email || '—'}</div>
                                    </div>
                                </div>
                                <div className="info-item">
                                    <div className="info-icon"><FileTextIcon /></div>
                                    <div>
                                        <div className="info-label">GST Number</div>
                                        <div className="info-value">{profile.client.gst || '—'}</div>
                                    </div>
                                </div>
                                <div className="info-item">
                                    <div className="info-icon"><UserIcon /></div>
                                    <div>
                                        <div className="info-label">Contact Person</div>
                                        <div className="info-value">{profile.client.name || '—'}</div>
                                    </div>
                                </div>
                                <div className="info-item">
                                    <div className="info-icon"><PhoneIcon /></div>
                                    <div>
                                        <div className="info-label">Phone</div>
                                        <div className="info-value">{profile.client.phone || '—'}</div>
                                    </div>
                                </div>
                                <div className="info-item full-width">
                                    <div className="info-icon"><MapPinIcon /></div>
                                    <div>
                                        <div className="info-label">Address</div>
                                        <div className="info-value">{profile.client.address || '—'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Associated Projects */}
                        <div className="card">
                            <div className="card-header">
                                <div className="card-header-icon blue">
                                    <FolderIcon />
                                </div>
                                <h3 className="card-title">Associated Projects ({profile.projects.length})</h3>
                            </div>

                            {profile.projects.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-state-icon"><FolderIcon /></div>
                                    <p>No projects associated yet</p>
                                </div>
                            ) : (
                                <table className="projects-table">
                                    <thead>
                                        <tr>
                                            <th>Project Name</th>
                                            <th>Status</th>
                                            <th>Assigned Staff</th>
                                            <th>Start Date</th>
                                            <th>End Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {profile.projects.map((project) => {
                                            const sc = getStatusColor(project.status);
                                            return (
                                                <tr key={project._id}>
                                                    <td className="project-name-cell">{project.title}</td>
                                                    <td>
                                                        <span className="status-badge" style={{
                                                            color: sc.color, background: sc.bg, borderColor: sc.border
                                                        }}>
                                                            {project.status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="staff-list">
                                                            {(project.assignedStaff || []).length > 0
                                                                ? project.assignedStaff.map((s) => (
                                                                    <span key={s._id} className="staff-chip">{s.name}</span>
                                                                ))
                                                                : <span style={{ color: '#9ca3af' }}>—</span>
                                                            }
                                                        </div>
                                                    </td>
                                                    <td>{formatDate(project.startDate)}</td>
                                                    <td>{formatDate(project.endDate)}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                    {/* Contact Admin */}
                    <div className="contact-admin">
                        <p className="contact-admin-title">Need to update your details?</p>
                        <p className="contact-admin-text">
                            Please contact Admin at:{' '}
                            <a href="mailto:admin@yourcms.com">admin@yourcms.com</a>
                        </p>
                    </div>
                </>
            )}
        </div>
    );
}

ClientProfile.getLayout = function getLayout(page) {
    return <ClientLayout>{page}</ClientLayout>;
};
