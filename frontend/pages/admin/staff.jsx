import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { DataTable, Pagination, StatusBadge, Modal, ConfirmDialog, Alert } from '../../components';
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

export default function Staff() {
  const [staff, setStaff] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

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
    password: ''
  });
  const [formLoading, setFormLoading] = useState(false);

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

  const fetchStaff = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const response = await getStaff(page, ITEMS_PER_PAGE);
      setStaff(response.data);
      setFilteredStaff(response.data);
      setPagination(response.pagination);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load staff');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  // Apply filters
  useEffect(() => {
    let filtered = [...staff];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        member =>
          member.name.toLowerCase().includes(query) ||
          member.email.toLowerCase().includes(query) ||
          (member.phone && member.phone.includes(query))
      );
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(member => member.status === statusFilter);
    }

    setFilteredStaff(filtered);
  }, [searchQuery, statusFilter, staff]);

  const handlePageChange = (page) => {
    fetchStaff(page);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
  };

  const openAddModal = () => {
    setEditingStaff(null);
    setFormData({ name: '', email: '', phone: '', password: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (member) => {
    setEditingStaff(member);
    setFormData({
      name: member.name,
      email: member.email,
      phone: member.phone,
      password: '' // Password is not shown during edit
    });
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

    // Validate password for new staff
    if (!editingStaff && !formData.password) {
      setError('Password is required for new staff members');
      setFormLoading(false);
      return;
    }

    try {
      if (editingStaff) {
        // Only send name, email, and phone for updates (no password)
        const { name, email, phone } = formData;
        await updateStaff(editingStaff._id, { name, email, phone });
        setSuccess('Staff member updated successfully');
      } else {
        await createStaff(formData);
        setSuccess('Staff member created successfully');
      }
      setIsModalOpen(false);
      setFormData({ name: '', email: '', phone: '', password: '' }); // Clear form including password
      fetchStaff(pagination.page);
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
      fetchStaff(pagination.page);
    } catch (err) {
      setError(err.message || 'Failed to delete staff member');
    }
  };

  const handleStatusChange = async (staffId, newStatus) => {
    try {
      await updateStaffStatus(staffId, newStatus);
      setSuccess('Status updated successfully');
      fetchStaff(pagination.page);
    } catch (err) {
      setError(err.message || 'Failed to update status');
    }
  };

  const activeFiltersCount = [searchQuery, statusFilter].filter(Boolean).length;

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
                gap: '4px',
                fontSize: 'var(--font-size-xs, 12px)',
                color: 'var(--color-text-muted)'
              }}>
                <MailIcon />
                <span>{row.email}</span>
              </div>
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
    <div>
      <div className="page-header" style={{
        marginBottom: 'var(--spacing-6, 24px)',
        paddingBottom: 'var(--spacing-6, 24px)',
        borderBottom: '1px solid var(--color-border, #e5e7eb)'
      }}>
        <div>
          <h1 className="page-title" style={{
            fontSize: 'var(--font-size-2xl, 28px)',
            fontWeight: '700',
            marginBottom: 'var(--spacing-2, 8px)',
            background: 'linear-gradient(135deg, #f59e0b 0%, #dc2626 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Staff
          </h1>
          <p className="page-subtitle" style={{
            fontSize: 'var(--font-size-sm, 14px)',
            color: 'var(--color-text-muted)'
          }}>
            Manage your staff members
          </p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={openAddModal} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            fontSize: 'var(--font-size-sm, 14px)',
            fontWeight: '600',
            borderRadius: 'var(--border-radius-lg, 8px)',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 6px rgba(245, 158, 11, 0.15)',
            background: 'linear-gradient(135deg, #f59e0b 0%, #dc2626 100%)',
            border: 'none'
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 12px rgba(245, 158, 11, 0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(245, 158, 11, 0.15)';
            }}>
            <PlusIcon />
            Add Staff
          </button>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {/* Search and Filter Bar */}
      <div style={{
        backgroundColor: 'white',
        padding: 'var(--spacing-4, 16px)',
        borderRadius: 'var(--border-radius-lg, 8px)',
        border: '1px solid var(--color-border, #e5e7eb)',
        marginBottom: 'var(--spacing-4, 16px)',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{
          display: 'flex',
          gap: 'var(--spacing-3, 12px)',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          {/* Search Input */}
          <div style={{ flex: '1', minWidth: '250px' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 40px',
                  fontSize: 'var(--font-size-sm, 14px)',
                  border: '1px solid var(--color-border, #e5e7eb)',
                  borderRadius: 'var(--border-radius-md, 6px)',
                  outline: 'none',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#f59e0b';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border, #e5e7eb)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
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
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-muted)'
                }}
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </div>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: 'var(--spacing-2, 8px)', alignItems: 'center' }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '10px 12px',
                fontSize: 'var(--font-size-sm, 14px)',
                border: '1px solid var(--color-border, #e5e7eb)',
                borderRadius: 'var(--border-radius-md, 6px)',
                backgroundColor: 'white',
                cursor: 'pointer',
                outline: 'none',
                minWidth: '140px',
                transition: 'all 0.2s ease'
              }}
            >
              <option value="">All Statuses</option>
              {STAFF_STATUSES.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>

            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                style={{
                  padding: '10px 16px',
                  fontSize: 'var(--font-size-sm, 14px)',
                  border: '1px solid var(--color-border, #e5e7eb)',
                  borderRadius: 'var(--border-radius-md, 6px)',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: '500',
                  color: 'var(--color-text-secondary)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary, #f9fafb)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                }}
              >
                <XIcon />
                Clear ({activeFiltersCount})
              </button>
            )}
          </div>
        </div>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div style={{
            display: 'flex',
            gap: '8px',
            marginTop: 'var(--spacing-3, 12px)',
            flexWrap: 'wrap'
          }}>
            {searchQuery && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                fontSize: 'var(--font-size-xs, 12px)',
                fontWeight: '500',
                color: '#92400e',
                backgroundColor: '#fef3c7',
                border: '1px solid #fde68a',
                borderRadius: 'var(--border-radius-full, 9999px)'
              }}>
                <FilterIcon style={{ width: 12, height: 12 }} />
                Search: "{searchQuery}"
              </span>
            )}
            {statusFilter && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                fontSize: 'var(--font-size-xs, 12px)',
                fontWeight: '500',
                color: '#92400e',
                backgroundColor: '#fef3c7',
                border: '1px solid #fde68a',
                borderRadius: 'var(--border-radius-full, 9999px)'
              }}>
                <FilterIcon style={{ width: 12, height: 12 }} />
                Status: {statusFilter}
              </span>
            )}
          </div>
        )}
      </div>

      <div style={{
        backgroundColor: 'white',
        borderRadius: 'var(--border-radius-lg, 10px)',
        border: '1px solid var(--color-border, #e5e7eb)',
        overflow: 'hidden',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.08)'
      }}>
        <DataTable
          columns={columns}
          data={filteredStaff}
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
              pattern="[0-9]{10}"
              title="Please enter a 10-digit phone number"
            />
            <p className="form-hint">Format: 10-digit mobile number</p>
          </div>

          {/* Password field - only shown when creating new staff */}
          {!editingStaff && (
            <div className="form-group">
              <label className="form-label form-label-required">Password</label>
              <input
                type="password"
                name="password"
                className="form-input"
                value={formData.password}
                onChange={handleFormChange}
                placeholder="Enter staff password"
                required
                minLength={6}
              />
              <p className="form-hint">Password must be at least 6 characters</p>
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