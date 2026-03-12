import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../layouts/AdminLayout';
import useActionParam from '../../hooks/useActionParam';
import { DataTable, Pagination, StatusBadge, Modal, ConfirmDialog, Alert, Button, Card, PageHeader } from '../../components';
import {
  getStaff,
  createStaff,
  updateStaff,
  deleteStaff,
  updateStaffStatus
} from '../../services/api';
import { formatDate } from '../../utils/helpers';

const ITEMS_PER_PAGE = 10;
const STAFF_STATUSES = ['Active', 'Inactive'];

// Icons
const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
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

const MailIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const FilterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
);

const DiceIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="3" ry="3" />
    <circle cx="8" cy="8" r="1.5" fill="currentColor" /><circle cx="16" cy="8" r="1.5" fill="currentColor" />
    <circle cx="8" cy="16" r="1.5" fill="currentColor" /><circle cx="16" cy="16" r="1.5" fill="currentColor" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
  </svg>
);

export default function Staff() {
  const router = useRouter();
  const [staff, setStaff] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({ role: '', department: '' });

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [deletingStaff, setDeletingStaff] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: '',
    department: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [copiedPassword, setCopiedPassword] = useState(false);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2000);
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      'Active': { bg: '#d1fae5', text: '#065f46', border: '#a7f3d0' },
      'Inactive': { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' }
    };
    return colors[status] || colors['Active'];
  };

  // Helper to get initials
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Helper to get avatar color
  const getAvatarColor = (name) => {
    const colors = [
      { bg: '#dbeafe', text: '#1e40af' },
      { bg: '#fce7f3', text: '#9f1239' },
      { bg: '#dcfce7', text: '#166534' },
      { bg: '#fef3c7', text: '#92400e' },
      { bg: '#e0e7ff', text: '#3730a3' },
      { bg: '#fce7f3', text: '#831843' }
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const fetchStaff = useCallback(async (page = 1, search = '', status = '', filters = {}) => {
    try {
      setLoading(true);
      const response = await getStaff(page, ITEMS_PER_PAGE, search, status, filters);
      setStaff(response.data);
      setPagination(response.pagination);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load staff');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff(1, searchQuery, statusFilter, advancedFilters);
  }, [searchQuery, statusFilter, advancedFilters, fetchStaff]);

  const handlePageChange = (page) => {
    fetchStaff(page, searchQuery, statusFilter, advancedFilters);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setAdvancedFilters({ role: '', department: '' });
  };

  const openAddModal = () => {
    setEditingStaff(null);
    setFormData({ name: '', email: '', phone: '', password: '', role: '', department: '' });
    setGeneratedPassword('');
    setIsModalOpen(true);
  };

  // Open Add Staff modal when navigated here via Feature Search (?action=add)
  useActionParam('add', openAddModal);

  const openEditModal = (member) => {
    setEditingStaff(member);
    setFormData({
      name: member.name,
      email: member.email,
      phone: member.phone,
      password: '', // Password is not shown during edit
      role: member.role || '',
      department: member.department || ''
    });
    setGeneratedPassword('');
    setIsModalOpen(true);
  };

  const openDeleteDialog = (member) => {
    setDeletingStaff(member);
    setIsDeleteDialogOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');

    try {
      if (editingStaff) {
        // Only send name, email, phone, role, department for updates (no password)
        const { name, email, phone, role, department } = formData;
        await updateStaff(editingStaff._id, { name, email, phone, role, department });
        setSuccess('Staff member updated successfully');
        setIsModalOpen(false);
      } else {
        const result = await createStaff(formData);
        if (result.data?.generatedPassword) {
          setGeneratedPassword(result.data.generatedPassword);
          setSuccess(`Staff member created! Generated password: ${result.data.generatedPassword}`);
        } else {
          setSuccess('Staff member created successfully');
        }
        setIsModalOpen(false);
      }
      setFormData({ name: '', email: '', phone: '', password: '', role: '', department: '' });
      fetchStaff(pagination.page, searchQuery, statusFilter, advancedFilters);
    } catch (err) {
      setError(err.message || 'Failed to save staff member');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingStaff) return;

    try {
      await deleteStaff(deletingStaff._id);
      setSuccess('Staff member deleted successfully');
      setIsDeleteDialogOpen(false);
      setDeletingStaff(null);
      fetchStaff(pagination.page, searchQuery, statusFilter, advancedFilters);
    } catch (err) {
      setError(err.message || 'Failed to delete staff member');
    }
  };

  const handleStatusChange = async (staffId, newStatus) => {
    try {
      await updateStaffStatus(staffId, newStatus);
      setSuccess('Status updated successfully');
      fetchStaff(pagination.page, searchQuery, statusFilter, advancedFilters);
    } catch (err) {
      setError(err.message || 'Failed to update status');
    }
  };

  const activeFiltersCount = [searchQuery, statusFilter, advancedFilters.role, advancedFilters.department].filter(Boolean).length;

  const columns = [
    {
      key: 'name',
      title: 'Staff Member',
      render: (value, row) => {
        const avatarColor = getAvatarColor(value);
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: avatarColor.bg,
                color: avatarColor.text,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'var(--font-size-sm, 14px)',
                fontWeight: '700',
                flexShrink: 0
              }}
            >
              {getInitials(value)}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontWeight: '600', fontSize: 'var(--font-size-sm, 14px)' }}>
                {value}
              </span>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: 'var(--font-size-xs, 12px)',
                color: 'var(--color-text-muted)'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MailIcon />
                  {row.email}
                </span>
              </div>
              {row.employeeCode && (
                <span style={{
                  display: 'inline-block',
                  fontSize: '11px',
                  fontWeight: '600',
                  color: '#1e40af',
                  backgroundColor: '#eff6ff',
                  padding: '1px 8px',
                  borderRadius: '9999px',
                  border: '1px solid #bfdbfe',
                  width: 'fit-content'
                }}>
                  {row.employeeCode}
                </span>
              )}
            </div>
          </div>
        );
      }
    },
    {
      key: 'phone',
      title: 'Contact',
      render: (value) => {
        if (!value) return <span style={{ color: 'var(--color-text-muted)' }}>—</span>;
        return (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            backgroundColor: 'var(--color-bg-secondary, #f9fafb)',
            borderRadius: 'var(--border-radius-md, 6px)',
            fontSize: 'var(--font-size-xs, 12px)',
            color: 'var(--color-text-secondary)'
          }}>
            <PhoneIcon />
            <span style={{ fontWeight: '500' }}>{value}</span>
          </div>
        );
      }
    },
    {
      key: 'projectCount',
      title: 'Projects',
      render: (value, row) => {
        const count = value || 0;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              minWidth: '28px', height: '28px', padding: '0 8px',
              fontSize: '13px', fontWeight: '700',
              color: count > 0 ? '#1e40af' : '#9ca3af',
              backgroundColor: count > 0 ? '#eff6ff' : '#f9fafb',
              border: `1px solid ${count > 0 ? '#bfdbfe' : '#e5e7eb'}`,
              borderRadius: '9999px'
            }}>
              {count}
            </span>
            {count > 0 && (
              <button
                type="button"
                onClick={() => router.push(`/admin/staff/${row._id}`)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: '12px', fontWeight: '500', color: '#667eea',
                  padding: 0, textDecoration: 'underline'
                }}
              >
                View
              </button>
            )}
          </div>
        );
      }
    },
    {
      key: 'status',
      title: 'Status',
      render: (value, row) => {
        const statusColor = getStatusColor(value);
        return (
          <select
            className="form-select"
            value={value}
            onChange={(e) => handleStatusChange(row._id, e.target.value)}
            style={{
              minWidth: '120px',
              padding: '6px 12px',
              fontSize: 'var(--font-size-xs, 12px)',
              height: '36px',
              fontWeight: '600',
              color: statusColor.text,
              backgroundColor: statusColor.bg,
              border: `1px solid ${statusColor.border}`,
              borderRadius: 'var(--border-radius-md, 6px)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {STAFF_STATUSES.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        );
      }
    },
    {
      key: 'createdAt',
      title: 'Joined',
      render: (value) => (
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: 'var(--font-size-xs, 12px)',
          color: 'var(--color-text-muted)'
        }}>
          <CalendarIcon />
          <span>{formatDate(value)}</span>
        </div>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      align: 'right',
      render: (_, row) => (
        <div className="table-actions" style={{ justifyContent: 'flex-end', gap: '6px' }}>
          <button
            className="btn btn-ghost btn-icon-sm"
            onClick={() => router.push(`/admin/staff/${row._id}`)}
            title="View Details"
            style={{ transition: 'all 0.2s ease' }}
          >
            <EyeIcon />
          </button>
          <button
            className="btn btn-ghost btn-icon-sm"
            onClick={() => openEditModal(row)}
            title="Edit"
            style={{
              transition: 'all 0.2s ease'
            }}
          >
            <EditIcon />
          </button>
          <button
            className="btn btn-ghost btn-icon-sm"
            onClick={() => openDeleteDialog(row)}
            title="Delete"
            style={{
              color: 'var(--color-error-600)',
              transition: 'all 0.2s ease'
            }}
          >
            <TrashIcon />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="staff-page">
      <PageHeader
        title="Staff"
        subtitle="Manage your staff members and their access"
        actions={
          <Button onClick={openAddModal} icon={PlusIcon}>
            Add Staff
          </Button>
        }
      />

      {error && <Alert type="error" message={error} onClose={() => setError('')} style={{ marginBottom: 'var(--spacing-4)' }} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} style={{ marginBottom: 'var(--spacing-4)' }} />}

      <Card className="mb-6">
        <div style={{ display: 'flex', gap: 'var(--spacing-4)', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '250px' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search staff members..."
                className="form-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '40px' }}
              />
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gray-400)' }}
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </div>
          </div>

          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: '160px' }}
          >
            <option value="">All Statuses</option>
            {STAFF_STATUSES.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          <Button
            variant={showAdvancedFilters ? 'secondary' : 'ghost'}
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            size="sm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            Filters
          </Button>

          {(searchQuery || statusFilter || advancedFilters.role) && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear
            </Button>
          )}
        </div>

        {showAdvancedFilters && (
          <div style={{ marginTop: 'var(--spacing-4)', paddingTop: 'var(--spacing-4)', borderTop: '1px solid var(--color-gray-100)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-4)' }}>
            <div>
              <label className="form-label">Role</label>
              <input
                type="text"
                placeholder="e.g. Developer"
                className="form-input"
                value={advancedFilters.role}
                onChange={(e) => setAdvancedFilters(prev => ({ ...prev, role: e.target.value }))}
              />
            </div>
            <div>
              <label className="form-label">Department</label>
              <input
                type="text"
                placeholder="e.g. Engineering"
                className="form-input"
                value={advancedFilters.department}
                onChange={(e) => setAdvancedFilters(prev => ({ ...prev, department: e.target.value }))}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <Button variant="secondary" size="sm" onClick={() => setAdvancedFilters({ role: '', department: '' })}>
                Reset Filters
              </Button>
            </div>
          </div>
        )}
      </Card>

      <div style={{
        backgroundColor: 'white',
        borderRadius: 'var(--border-radius-lg, 10px)',
        border: '1px solid var(--color-border, #e5e7eb)',
        overflow: 'hidden',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.08)'
      }}>
        <DataTable
          columns={columns}
          data={staff}
          loading={loading}
          emptyMessage="No staff found"
          emptyDescription="Get started by adding your first staff member."
        />
      </div>

      <div style={{ marginTop: 'var(--spacing-5, 20px)' }}>
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStaff ? 'Edit Staff' : 'Add Staff'}
        footer={
          <>
            <button
              className="btn btn-secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={formLoading}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={formLoading}
            >
              {formLoading ? 'Saving...' : (editingStaff ? 'Update' : 'Create')}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label form-label-required">Name</label>
            <input
              type="text"
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleFormChange}
              placeholder="Enter staff name"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label form-label-required">Email</label>
            <input
              type="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleFormChange}
              placeholder="Enter staff email"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              name="phone"
              className="form-input"
              value={formData.phone}
              onChange={handleFormChange}
              placeholder="Enter phone number"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Role</label>
              <input
                type="text"
                name="role"
                className="form-input"
                value={formData.role}
                onChange={handleFormChange}
                placeholder="e.g. Developer"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Department</label>
              <input
                type="text"
                name="department"
                className="form-input"
                value={formData.department}
                onChange={handleFormChange}
                placeholder="e.g. Engineering"
              />
            </div>
          </div>

          {/* Password field - only shown when creating new staff */}
          {!editingStaff && (
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  name="password"
                  className="form-input"
                  value={formData.password}
                  onChange={handleFormChange}
                  placeholder="Leave blank to auto-generate"
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#$%&*!?';
                    let pwd = '';
                    for (let i = 0; i < 12; i++) pwd += chars.charAt(Math.floor(Math.random() * chars.length));
                    setFormData(prev => ({ ...prev, password: pwd }));
                  }}
                  style={{
                    padding: '8px 14px', borderRadius: '6px', border: '1px solid var(--color-border)',
                    background: '#f9fafb', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                    fontSize: '12px', fontWeight: '600', color: '#6b7280', whiteSpace: 'nowrap'
                  }}
                  title="Generate random password"
                >
                  <DiceIcon /> Generate
                </button>
                {formData.password && (
                  <button
                    type="button"
                    onClick={() => copyToClipboard(formData.password)}
                    style={{
                      padding: '8px 14px', borderRadius: '6px',
                      border: `1px solid ${copiedPassword ? '#a7f3d0' : 'var(--color-border)'}`,
                      background: copiedPassword ? '#d1fae5' : '#f9fafb',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                      fontSize: '12px', fontWeight: '600',
                      color: copiedPassword ? '#065f46' : '#6b7280', whiteSpace: 'nowrap',
                      transition: 'all 0.2s ease'
                    }}
                    title="Copy password"
                  >
                    {copiedPassword ? '✓ Copied' : '📋 Copy'}
                  </button>
                )}
              </div>
              <p className="form-hint">Leave blank to auto-generate a secure password on the server</p>
            </div>
          )}
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Staff"
        message={`Are you sure you want to delete "${deletingStaff?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}

Staff.getLayout = function getLayout(page) {
  return <AdminLayout>{page}</AdminLayout>;
};