import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../layouts/AdminLayout';
import {
  DataTable,
  Pagination,
  StatusBadge,
  Modal,
  ConfirmDialog,
  Alert,
  Button,
  Card,
  PageHeader
} from '../../components';
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

const DiceIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="3" ry="3" />
    <circle cx="8" cy="8" r="1.5" fill="currentColor" /><circle cx="16" cy="8" r="1.5" fill="currentColor" />
    <circle cx="8" cy="16" r="1.5" fill="currentColor" /><circle cx="16" cy="16" r="1.5" fill="currentColor" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
  </svg>
);

export default function Clients() {
  const router = useRouter();
  const [clients, setClients] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({ company: '' });

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
    phone: '',
    company: '',
    gst: '',
    address: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2000);
    });
  };

  const fetchClients = useCallback(async (page = 1, search = '', status = '', filters = {}) => {
    try {
      setLoading(true);
      const response = await getClients(page, ITEMS_PER_PAGE, search, status, filters);
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
    fetchClients(1, searchQuery, statusFilter, advancedFilters);
  }, [searchQuery, statusFilter, advancedFilters, fetchClients]);

  const handlePageChange = (page) => {
    fetchClients(page, searchQuery, statusFilter, advancedFilters);
  };

  const openAddModal = () => {
    setEditingClient(null);
    setFormData({ name: '', email: '', password: '', phone: '', company: '', gst: '', address: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      email: client.email,
      password: '', // Password is not shown during edit
      phone: client.phone || '',
      company: client.company || '',
      gst: client.gst || '',
      address: client.address || ''
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
    if (e) e.preventDefault();
    setFormLoading(true);
    setError('');

    try {
      if (editingClient) {
        const { name, email, phone, company, gst, address } = formData;
        await updateClient(editingClient._id, { name, email, phone, company, gst, address });
        setSuccess('Client updated successfully');
      } else {
        const result = await createClient(formData);
        if (result.data?.generatedPassword) {
          setSuccess(`Client created! Generated password: ${result.data.generatedPassword}`);
        } else {
          setSuccess('Client created successfully');
        }
      }
      setIsModalOpen(false);
      setFormData({ name: '', email: '', password: '', phone: '', company: '', gst: '', address: '' });
      fetchClients(pagination.page, searchQuery, statusFilter, advancedFilters);
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
      fetchClients(pagination.page, searchQuery, statusFilter, advancedFilters);
    } catch (err) {
      setError(err.message || 'Failed to delete client');
    }
  };

  const handleStatusChange = async (clientId, newStatus) => {
    try {
      await updateClientStatus(clientId, newStatus);
      setSuccess('Status updated successfully');
      fetchClients(pagination.page, searchQuery, statusFilter, advancedFilters);
    } catch (err) {
      setError(err.message || 'Failed to update status');
    }
  };

  const columns = [
    {
      key: 'name',
      title: 'Name',
      render: (value, row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-gray-900)' }}>{value}</span>
          {row.clientCode && (
            <span style={{
              display: 'inline-block', fontSize: '11px', fontWeight: '700',
              color: 'var(--color-success-700)', backgroundColor: 'var(--color-success-100)',
              padding: '1px 8px', borderRadius: '9999px', width: 'fit-content'
            }}>{row.clientCode}</span>
          )}
        </div>
      )
    },
    {
      key: 'email',
      title: 'Email',
      render: (value) => (
        <span style={{ color: 'var(--color-gray-500)' }}>{value}</span>
      )
    },
    {
      key: 'projects',
      title: 'Projects',
      render: (_, row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {row.projects && row.projects.length > 0 ? (
            <>
              <span style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-primary-600)' }}>
                {row.projects.length} Project{row.projects.length !== 1 ? 's' : ''}
              </span>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-400)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {row.projects.map(p => p.title).join(', ')}
              </span>
            </>
          ) : (
            <span style={{ color: 'var(--color-gray-300)', fontSize: 'var(--font-size-sm)' }}>No projects</span>
          )}
        </div>
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
          style={{ minWidth: '120px', padding: '4px 10px', fontSize: 'var(--font-size-xs)', height: '32px' }}
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
      render: (value) => <span style={{ color: 'var(--color-gray-500)' }}>{formatDate(value)}</span>
    },
    {
      key: 'actions',
      title: 'Actions',
      align: 'right',
      render: (_, row) => (
        <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/admin/clients/${row._id}`)}
            title="View Details"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openEditModal(row)}
            title="Edit"
          >
            <EditIcon />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openDeleteDialog(row)}
            title="Delete"
            style={{ color: 'var(--color-error-600)' }}
          >
            <TrashIcon />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="clients-page">
      <PageHeader
        title="Clients"
        subtitle="Manage your client accounts and their access"
        actions={
          <Button onClick={openAddModal} icon={PlusIcon}>
            Add Client
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
                placeholder="Search clients..."
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
            {CLIENT_STATUSES.map(status => (
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

          {(searchQuery || statusFilter || advancedFilters.company) && (
            <Button variant="ghost" size="sm" onClick={() => { setSearchQuery(''); setStatusFilter(''); setAdvancedFilters({ company: '' }); }}>
              Clear
            </Button>
          )}
        </div>

        {showAdvancedFilters && (
          <div style={{ marginTop: 'var(--spacing-4)', paddingTop: 'var(--spacing-4)', borderTop: '1px solid var(--color-gray-100)', display: 'flex', gap: 'var(--spacing-4)', alignItems: 'flex-end' }}>
            <div style={{ flex: '1' }}>
              <label className="form-label">Company</label>
              <input
                type="text"
                className="form-input"
                placeholder="Filter by company"
                value={advancedFilters.company}
                onChange={(e) => setAdvancedFilters(prev => ({ ...prev, company: e.target.value }))}
              />
            </div>
            <Button variant="secondary" size="sm" onClick={() => setAdvancedFilters({ company: '' })}>
              Reset
            </Button>
          </div>
        )}
      </Card>

      <div className="table-responsive">
        <DataTable
          columns={columns}
          data={clients}
          loading={loading}
          emptyMessage="No clients found"
          emptyDescription="Try adjusting your search or filters."
        />
      </div>

      <div style={{ marginTop: 'var(--spacing-5)' }}>
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
        title={editingClient ? 'Edit Client' : 'Add New Client'}
        footer={
          <div style={{ display: 'flex', gap: 'var(--spacing-3)', justifyContent: 'flex-end', width: '100%' }}>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} disabled={formLoading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={formLoading}>
              {formLoading ? 'Saving...' : (editingClient ? 'Update Client' : 'Create Client')}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label form-label-required">Full Name</label>
            <input
              type="text"
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleFormChange}
              placeholder="e.g. John Doe"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label form-label-required">Email Address</label>
            <input
              type="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleFormChange}
              placeholder="e.g. john@example.com"
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
              placeholder="+1 234 567 890"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)' }}>
            <div className="form-group">
              <label className="form-label">Company Name</label>
              <input
                type="text"
                name="company"
                className="form-input"
                value={formData.company}
                onChange={handleFormChange}
                placeholder="Business Name"
              />
            </div>
            <div className="form-group">
              <label className="form-label">GST Number</label>
              <input
                type="text"
                name="gst"
                className="form-input"
                value={formData.gst}
                onChange={handleFormChange}
                placeholder="Tax ID"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Address</label>
            <textarea
              name="address"
              className="form-textarea"
              value={formData.address}
              onChange={handleFormChange}
              placeholder="Company Address"
              rows="3"
            />
          </div>

          {!editingClient && (
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
                <input
                  type="text"
                  name="password"
                  className="form-input"
                  value={formData.password}
                  onChange={handleFormChange}
                  placeholder="Auto-generated if blank"
                  style={{ flex: 1 }}
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#$%&*!?';
                    let pwd = '';
                    for (let i = 0; i < 12; i++) pwd += chars.charAt(Math.floor(Math.random() * chars.length));
                    setFormData(prev => ({ ...prev, password: pwd }));
                  }}
                  title="Generate password"
                >
                  <DiceIcon />
                </Button>
                {formData.password && (
                  <Button
                    variant={copiedPassword ? 'success' : 'secondary'}
                    size="sm"
                    onClick={() => copyToClipboard(formData.password)}
                  >
                    {copiedPassword ? '✓' : '📋'}
                  </Button>
                )}
              </div>
              <p className="form-hint">Client will receive an email with their credentials.</p>
            </div>
          )}
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Client"
        message={`Are you sure you want to delete "${deletingClient?.name}"? All associated data will be permanently removed.`}
        confirmText="Delete Client"
        variant="danger"
      />
    </div>
  );
}

Clients.getLayout = function getLayout(page) {
  return <AdminLayout>{page}</AdminLayout>;
};
