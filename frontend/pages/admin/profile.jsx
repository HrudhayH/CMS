import { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { useAuth } from '../../hooks/useAuth';
import { uploadAdminProfileImage, deleteAdminProfileImage } from '../../services/api';
import ProfileImageUpload from '../../components/ProfileImageUpload';

if (!process.env.NEXT_PUBLIC_API_URL) {
    console.warn('NEXT_PUBLIC_API_URL is not defined. Set it in your .env.local (dev) or Vercel environment variables (prod).');
}
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AdminProfile() {
    const { user } = useAuth();
    const [profileImageUrl, setProfileImageUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Fetch current admin data to get saved profileImageUrl
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                // Decode JWT for basic info; for profileImageUrl we need a dedicated endpoint.
                // We call /admin/admins/:id using the id from the JWT user object.
                const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
                if (!token || !user?.id) return;

                const res = await fetch(`${API_URL}/admin/admins/${user.id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    setProfileImageUrl(data.data?.profileImageUrl || null);
                }
            } catch (err) {
                setError(err.message || 'Failed to load profile');
            } finally {
                setLoading(false);
            }
        };

        if (user?.id) fetchProfile();
    }, [user?.id]);

    const refreshProfile = async () => {
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
            if (!token || !user?.id) return;
            const res = await fetch(`${API_URL}/admin/admins/${user.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setProfileImageUrl(data.data?.profileImageUrl || null);
            }
        } catch (err) {
            setError(err.message || 'Failed to refresh profile');
        }
    };

    const handleUpload = async (file) => {
        await uploadAdminProfileImage(file);
        await refreshProfile();
    };

    const handleDelete = async () => {
        await deleteAdminProfileImage();
        await refreshProfile();
    };

    const formatRole = (role) => {
        if (role === 'super_admin') return 'Super Admin';
        return 'Admin';
    };

    return (
        <AdminLayout>
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

                    .profile-header {
                        background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
                        border-radius: 16px;
                        padding: 40px;
                        margin-bottom: var(--spacing-6);
                        color: white;
                        display: flex;
                        align-items: center;
                        gap: 28px;
                        box-shadow: 0 4px 20px rgba(15, 23, 42, 0.3);
                        position: relative;
                        overflow: hidden;
                    }

                    .profile-header::before {
                        content: '';
                        position: absolute;
                        top: -50%;
                        right: -20%;
                        width: 400px;
                        height: 400px;
                        border-radius: 50%;
                        background: rgba(255,255,255,0.03);
                    }

                    .profile-header-info {
                        flex: 1;
                        z-index: 1;
                    }

                    .profile-name {
                        font-size: 28px;
                        font-weight: 700;
                        margin: 0 0 8px 0;
                    }

                    .profile-header-meta {
                        display: flex;
                        align-items: center;
                        gap: 16px;
                        flex-wrap: wrap;
                    }

                    .profile-role-badge {
                        display: inline-flex;
                        align-items: center;
                        padding: 5px 14px;
                        background: rgba(255,255,255,0.15);
                        border-radius: 20px;
                        font-size: 13px;
                        font-weight: 600;
                        backdrop-filter: blur(10px);
                    }

                    .card {
                        background: white;
                        border: 1px solid #e5e7eb;
                        border-radius: 12px;
                        padding: var(--spacing-5);
                        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
                        margin-bottom: var(--spacing-5);
                    }

                    .card-title {
                        font-size: 18px;
                        font-weight: 700;
                        color: #1a1a1a;
                        margin: 0 0 var(--spacing-4) 0;
                        padding-bottom: var(--spacing-3);
                        border-bottom: 1px solid #f3f4f6;
                    }

                    .info-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 20px;
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

                    .loading-container {
                        display: flex;
                        justify-content: center;
                        padding: 60px 0;
                    }

                    .error-banner {
                        background: #fef2f2;
                        border: 1px solid #fecaca;
                        color: #991b1b;
                        padding: 14px 18px;
                        border-radius: 10px;
                        margin-bottom: var(--spacing-5);
                        font-size: 14px;
                    }
                `}</style>

                {/* Page Header */}
                <div className="page-header">
                    <h1 className="page-title">My Profile</h1>
                    <p className="page-subtitle">Your admin account details</p>
                </div>

                {error && <div className="error-banner">{error}</div>}

                {loading ? (
                    <div className="loading-container">
                        <div className="loading-spinner loading-spinner-lg"></div>
                    </div>
                ) : (
                    <>
                        {/* Profile Header */}
                        <div className="profile-header">
                            <ProfileImageUpload
                                currentImageUrl={profileImageUrl}
                                onUpload={handleUpload}
                                onDelete={handleDelete}
                                accentColor="#0f172a"
                                userName={user?.name || user?.email || 'Admin'}
                            />
                            <div className="profile-header-info">
                                <h2 className="profile-name">{user?.name || user?.email || 'Admin'}</h2>
                                <div className="profile-header-meta">
                                    <span className="profile-role-badge">
                                        {formatRole(user?.role)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Account Details */}
                        <div className="card">
                            <h3 className="card-title">Account Information</h3>
                            <div className="info-grid">
                                <div>
                                    <div className="info-label">Name</div>
                                    <div className="info-value">{user?.name || '—'}</div>
                                </div>
                                <div>
                                    <div className="info-label">Email</div>
                                    <div className="info-value">{user?.email || '—'}</div>
                                </div>
                                <div>
                                    <div className="info-label">Role</div>
                                    <div className="info-value">{formatRole(user?.role)}</div>
                                </div>
                                <div>
                                    <div className="info-label">Permissions</div>
                                    <div className="info-value">
                                        {user?.permissions?.length
                                            ? user.permissions.join(', ')
                                            : 'All (Super Admin)'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </AdminLayout>
    );
}
