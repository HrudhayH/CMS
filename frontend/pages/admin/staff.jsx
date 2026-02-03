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
const STAFF_STATUSES = ['Active', 'Paused', 'Completed'];

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

export default function Staff() {
  const [staff, setStaff] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [deletingStaff, setDeletingStaff] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [formLoading, setFormLoading] = useState(false);

  const fetchStaff = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const response = await getStaff(page, ITEMS_PER_PAGE);
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
    fetchStaff();
  }, [fetchStaff]);

  const handlePageChange = (page) => {
    fetchStaff(page);
  };

  const openAddModal = () => {
    setEditingStaff(null);
    setFormData({ name: '', email: '', password: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (member) => {
    setEditingStaff(member);
    setFormData({
      name: member.name,
      email: member.email,
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
        // Only send name and email for updates (no password)
        const { name, email } = formData;
        await updateStaff(editingStaff._id, { name, email });
        setSuccess('Staff member updated successfully');
      } else {
        await createStaff(formData);
        setSuccess('Staff member created successfully');
      }
      setIsModalOpen(false);
      setFormData({ name: '', email: '', password: '' }); // Clear form including password
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

  const columns = [
    {
      key: 'name',
      title: 'Name',
      render: (value) => (
        <span style={{ fontWeight: 'var(--font-weight-medium)' }}>{value}</span>
      )
    },
    {
      key: 'email',
      title: 'Email',
      render: (value) => (
        <span className="text-muted">{value}</span>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (value, row) => (
        <select
          className="form-select"
          value={value}
          onChange={(e) => handleStatusChange(row._id, e.target.value)}
          style={{ minWidth: '110px', padding: '4px 8px', fontSize: 'var(--font-size-xs)' }}
        >
          {STAFF_STATUSES.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      )
    },
    {
      key: 'createdAt',
      title: 'Created',
      render: (value) => formatDate(value)
    },
    {
      key: 'actions',
      title: 'Actions',
      align: 'right',
      render: (_, row) => (
        <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
          <button
            className="btn btn-ghost btn-icon-sm"
            onClick={() => openEditModal(row)}
            title="Edit"
          >
            <EditIcon />
          </button>
          <button
            className="btn btn-ghost btn-icon-sm"
            onClick={() => openDeleteDialog(row)}
            title="Delete"
            style={{ color: 'var(--color-error-600)' }}
          >
            <TrashIcon />
          </button>
        </div>
      )
    }
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Staff</h1>
          <p className="page-subtitle">Manage your staff members</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={openAddModal}>
            <PlusIcon />
            Add Staff
          </button>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      <DataTable
        columns={columns}
        data={staff}
        loading={loading}
        emptyMessage="No staff found"
        emptyDescription="Get started by adding your first staff member."
      />

      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        totalItems={pagination.total}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={handlePageChange}
      />

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
