import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { DataTable, Pagination, StatusBadge, Modal, ConfirmDialog, Alert } from '../../components';
import {
  getClients,
  createClient,
  updateClient,
  deleteClient,
  updateClientStatus
} from '../../services/api';
import { formatDate } from '../../utils/helpers';

const ITEMS_PER_PAGE = 10;
const CLIENT_STATUSES = ['Active', 'Paused', 'Completed'];

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

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [deletingClient, setDeletingClient] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });
  const [formLoading, setFormLoading] = useState(false);

  const fetchClients = useCallback(async (page = 1, search = '', status = '') => {
    try {
      setLoading(true);
      const response = await getClients(page, ITEMS_PER_PAGE, search, status);
      setClients(response.data);
      setPagination(response.pagination);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load clients');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients(1, searchQuery, statusFilter);
  }, [searchQuery, statusFilter, fetchClients]);

  const handlePageChange = (page) => {
    fetchClients(page, searchQuery, statusFilter);
  };

  const openAddModal = () => {
    setEditingClient(null);
    setFormData({ name: '', email: '', password: '', phone: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      email: client.email,
      password: '', // Password is not shown during edit
      phone: client.phone || ''
    });
    setIsModalOpen(true);
  };

  const openDeleteDialog = (client) => {
    setDeletingClient(client);
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

    // Validate password for new clients
    if (!editingClient && !formData.password) {
      setError('Password is required for new clients');
      setFormLoading(false);
      return;
    }

    try {
      if (editingClient) {
        // Only send name, email, and phone for updates (no password)
        const { name, email, phone } = formData;
        await updateClient(editingClient._id, { name, email, phone });
        setSuccess('Client updated successfully');
      } else {
        await createClient(formData);
        setSuccess('Client created successfully');
      }
      setIsModalOpen(false);
      setFormData({ name: '', email: '', password: '', phone: '' }); // Clear form including password
      fetchClients(pagination.page);
    } catch (err) {
      setError(err.message || 'Failed to save client');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingClient) return;

    try {
      await deleteClient(deletingClient._id);
      setSuccess('Client deleted successfully');
      setIsDeleteDialogOpen(false);
      setDeletingClient(null);
      fetchClients(pagination.page);
    } catch (err) {
      setError(err.message || 'Failed to delete client');
    }
  };

  const handleStatusChange = async (clientId, newStatus) => {
    try {
      await updateClientStatus(clientId, newStatus);
      setSuccess('Status updated successfully');
      fetchClients(pagination.page);
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
          {CLIENT_STATUSES.map(status => (
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
          <h1 className="page-title">Clients</h1>
          <p className="page-subtitle">Manage your client accounts</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={openAddModal}>
            <PlusIcon />
            Add Client
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
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        display: 'flex',
        gap: 'var(--spacing-3, 12px)',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
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
            minWidth: '140px'
          }}
        >
          <option value="">All Statuses</option>
          {CLIENT_STATUSES.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>

        {(searchQuery || statusFilter) && (
          <button
            onClick={() => { setSearchQuery(''); setStatusFilter(''); }}
            style={{
              padding: '10px 16px',
              fontSize: 'var(--font-size-sm, 14px)',
              border: '1px solid var(--color-border, #e5e7eb)',
              borderRadius: 'var(--border-radius-md, 6px)',
              backgroundColor: 'white',
              cursor: 'pointer',
              fontWeight: '500',
              color: 'var(--color-text-secondary)'
            }}
          >
            Clear
          </button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={clients}
        loading={loading}
        emptyMessage="No clients found"
        emptyDescription="Get started by adding your first client."
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
        title={editingClient ? 'Edit Client' : 'Add Client'}
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
              {formLoading ? 'Saving...' : (editingClient ? 'Update' : 'Create')}
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
              placeholder="Enter client name"
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
              placeholder="Enter client email"
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
              placeholder="Enter client phone number"
              maxLength={20}
            />
          </div>

          {/* Password field - only shown when creating new client */}
          {!editingClient && (
            <div className="form-group">
              <label className="form-label form-label-required">Password</label>
              <input
                type="password"
                name="password"
                className="form-input"
                value={formData.password}
                onChange={handleFormChange}
                placeholder="Enter client password"
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
        title="Delete Client"
        message={`Are you sure you want to delete "${deletingClient?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}

Clients.getLayout = function getLayout(page) {
  return <AdminLayout>{page}</AdminLayout>;
};
