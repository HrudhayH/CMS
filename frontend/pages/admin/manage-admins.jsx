import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { Modal, ConfirmDialog, Alert } from '../../components';
import {
  getAdmins,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser
} from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { formatDate } from '../../utils/helpers';

const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

export default function ManageAdmins() {
  const { user } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [deletingAdmin, setDeletingAdmin] = useState(null);

  const PERMISSION_OPTIONS = [
    { key: 'view_dashboard', label: 'View Dashboard' },
    { key: 'manage_projects', label: 'Manage Projects' },
    { key: 'manage_clients', label: 'Manage Clients' },
    { key: 'manage_staff', label: 'Manage Staff' },
    { key: 'manage_payments', label: 'Manage Payments' },
  ];

  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'admin', permissions: [] });
  const [formLoading, setFormLoading] = useState(false);

  const fetchAdmins = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAdmins();
      setAdmins(response.data);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load admins');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'super_admin') {
      fetchAdmins();
    }
  }, [user, fetchAdmins]);

  const openAddModal = () => {
    setEditingAdmin(null);
    setFormData({ name: '', email: '', password: '', role: 'admin', permissions: [] });
    setIsModalOpen(true);
  };

  const openEditModal = (admin) => {
    setEditingAdmin(admin);
    setFormData({ name: admin.name || '', email: admin.email, password: '', role: admin.role, permissions: admin.permissions || [] });
    setIsModalOpen(true);
  };

  const openDeleteDialog = (admin) => {
    setDeletingAdmin(admin);
    setIsDeleteDialogOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      // Clear permissions when switching to super_admin
      if (name === 'role' && value === 'super_admin') {
        updated.permissions = [];
      }
      return updated;
    });
  };

  const handlePermissionToggle = (permKey) => {
    setFormData(prev => {
      const perms = prev.permissions.includes(permKey)
        ? prev.permissions.filter(p => p !== permKey)
        : [...prev.permissions, permKey];
      return { ...prev, permissions: perms };
    });
  };

  const handleSelectAllPermissions = () => {
    const allKeys = PERMISSION_OPTIONS.map(p => p.key);
    const allSelected = allKeys.every(k => formData.permissions.includes(k));
    setFormData(prev => ({ ...prev, permissions: allSelected ? [] : allKeys }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');

    if (!editingAdmin && (!formData.email || !formData.password)) {
      setError('Email and password are required');
      setFormLoading(false);
      return;
    }

    try {
      if (editingAdmin) {
        const updateData = { name: formData.name, email: formData.email, role: formData.role, permissions: formData.role === 'super_admin' ? [] : formData.permissions };
        if (formData.password) updateData.password = formData.password;
        await updateAdminUser(editingAdmin._id, updateData);
        setSuccess('Admin updated successfully');
      } else {
        const createData = { ...formData, permissions: formData.role === 'super_admin' ? [] : formData.permissions };
        await createAdminUser(createData);
        setSuccess('Admin created successfully');
      }
      setIsModalOpen(false);
      fetchAdmins();
    } catch (err) {
      setError(err.message || 'Failed to save admin');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingAdmin) return;
    try {
      await deleteAdminUser(deletingAdmin._id);
      setSuccess('Admin deleted successfully');
      setIsDeleteDialogOpen(false);
      setDeletingAdmin(null);
      fetchAdmins();
    } catch (err) {
      setError(err.message || 'Failed to delete admin');
    }
  };

  if (user?.role !== 'super_admin') {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--color-error-600)', marginBottom: '8px' }}>Access Denied</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>Only Super Admins can manage admin accounts.</p>
      </div>
    );
  }

  const getRoleBadge = (role) => {
    const isSuperAdmin = role === 'super_admin';
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '4px',
        padding: '4px 10px', fontSize: '12px', fontWeight: '600',
        borderRadius: '9999px',
        backgroundColor: isSuperAdmin ? '#fef3c7' : '#dbeafe',
        color: isSuperAdmin ? '#92400e' : '#1e40af',
        border: `1px solid ${isSuperAdmin ? '#fde68a' : '#bfdbfe'}`
      }}>
        {isSuperAdmin && <ShieldIcon />}
        {isSuperAdmin ? 'Super Admin' : 'Admin'}
      </span>
    );
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Manage Admins</h1>
          <p className="page-subtitle">Create and manage admin accounts</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={openAddModal}>
            <PlusIcon /> Add Admin
          </button>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <div className="loading-spinner loading-spinner-lg"></div>
        </div>
      ) : (
        <div style={{
          backgroundColor: 'white', borderRadius: '10px',
          border: '1px solid var(--color-border, #e5e7eb)',
          overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)', backgroundColor: '#f9fafb' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Admin</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Permissions</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Created</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin._id} style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                        color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '14px', fontWeight: '700', flexShrink: 0
                      }}>
                        {(admin.name || admin.email).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '14px' }}>{admin.name || '—'}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>{admin.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>{getRoleBadge(admin.role)}</td>
                  <td style={{ padding: '14px 16px' }}>
                    {admin.role === 'super_admin' ? (
                      <span style={{ fontSize: '12px', color: '#92400e', fontStyle: 'italic' }}>All (Super Admin)</span>
                    ) : admin.permissions && admin.permissions.length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {admin.permissions.map(p => (
                          <span key={p} style={{
                            display: 'inline-block', padding: '2px 8px', fontSize: '11px',
                            fontWeight: '500', borderRadius: '9999px',
                            backgroundColor: '#f0fdf4', color: '#166534',
                            border: '1px solid #bbf7d0'
                          }}>
                            {p.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>None</span>
                    )}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '13px', color: '#6b7280' }}>{formatDate(admin.createdAt)}</td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    {admin._id !== user?.id && (
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button className="btn btn-ghost btn-icon-sm" onClick={() => openEditModal(admin)} title="Edit"><EditIcon /></button>
                        <button className="btn btn-ghost btn-icon-sm" onClick={() => openDeleteDialog(admin)} title="Delete" style={{ color: 'var(--color-error-600)' }}><TrashIcon /></button>
                      </div>
                    )}
                    {admin._id === user?.id && (
                      <span style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>Current user</span>
                    )}
                  </td>
                </tr>
              ))}
              {admins.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No admins found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAdmin ? 'Edit Admin' : 'Add Admin'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)} disabled={formLoading}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={formLoading}>
              {formLoading ? 'Saving...' : (editingAdmin ? 'Update' : 'Create')}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input type="text" name="name" className="form-input" value={formData.name} onChange={handleFormChange} placeholder="Enter admin name" />
          </div>
          <div className="form-group">
            <label className="form-label form-label-required">Email</label>
            <input type="email" name="email" className="form-input" value={formData.email} onChange={handleFormChange} placeholder="Enter admin email" required />
          </div>
          <div className="form-group">
            <label className="form-label form-label-required">Role</label>
            <select name="role" className="form-select" value={formData.role} onChange={handleFormChange} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: '6px', fontSize: '14px' }}>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
          {formData.role === 'admin' && (
            <div className="form-group">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Permissions</label>
                <button
                  type="button"
                  onClick={handleSelectAllPermissions}
                  style={{
                    background: 'none', border: 'none', color: '#3b82f6',
                    fontSize: '12px', fontWeight: '600', cursor: 'pointer', padding: '2px 4px'
                  }}
                >
                  {PERMISSION_OPTIONS.every(p => formData.permissions.includes(p.key)) ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div style={{
                border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '8px',
                padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px',
                backgroundColor: '#f9fafb'
              }}>
                {PERMISSION_OPTIONS.map(perm => (
                  <label key={perm.key} style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    cursor: 'pointer', fontSize: '14px', color: '#374151'
                  }}>
                    <input
                      type="checkbox"
                      checked={formData.permissions.includes(perm.key)}
                      onChange={() => handlePermissionToggle(perm.key)}
                      style={{ width: '16px', height: '16px', accentColor: '#3b82f6', cursor: 'pointer' }}
                    />
                    {perm.label}
                  </label>
                ))}
              </div>
              {formData.permissions.length === 0 && (
                <p className="form-hint" style={{ color: '#f59e0b' }}>⚠ No permissions selected — this admin won&apos;t be able to access any section.</p>
              )}
            </div>
          )}
          {formData.role === 'super_admin' && (
            <div style={{
              padding: '10px 14px', borderRadius: '8px', fontSize: '13px',
              backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fde68a',
              marginBottom: '16px'
            }}>
              🛡 Super Admins have full access to all features — no individual permissions needed.
            </div>
          )}
          <div className="form-group">
            <label className="form-label">{editingAdmin ? 'New Password (leave blank to keep)' : 'Password *'}</label>
            <input type="password" name="password" className="form-input" value={formData.password} onChange={handleFormChange} placeholder={editingAdmin ? 'Leave blank to keep current' : 'Enter password'} required={!editingAdmin} minLength={6} />
            <p className="form-hint">Password must be at least 6 characters</p>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Admin"
        message={`Are you sure you want to delete "${deletingAdmin?.email}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}

ManageAdmins.getLayout = function getLayout(page) {
  return <AdminLayout>{page}</AdminLayout>;
};
