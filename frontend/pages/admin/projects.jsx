import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { DataTable, Pagination, StatusBadge, Modal, ConfirmDialog, Alert } from '../../components';
import { 
  getProjects, 
  createProject, 
  updateProject, 
  deleteProject, 
  updateProjectStatus,
  getAllClients,
  getAllStaff
} from '../../services/api';
import { formatDate } from '../../utils/helpers';

const ITEMS_PER_PAGE = 10;
const PROJECT_STATUSES = ['New', 'In Progress', 'On Hold', 'Completed'];

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

const FileIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRequirementModalOpen, setIsRequirementModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deletingProject, setDeletingProject] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'New',
    assignedClients: [],
    assignedStaff: []
  });
  const [formLoading, setFormLoading] = useState(false);
  
  // Options for dropdowns
  const [clients, setClients] = useState([]);
  const [staff, setStaff] = useState([]);

  const fetchProjects = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const response = await getProjects(page, ITEMS_PER_PAGE);
      setProjects(response.data);
      setPagination(response.pagination);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOptions = useCallback(async () => {
    try {
      const [clientsRes, staffRes] = await Promise.all([
        getAllClients(),
        getAllStaff()
      ]);
      setClients(clientsRes.data);
      setStaff(staffRes.data);
    } catch (err) {
      console.error('Failed to load options:', err);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
    fetchOptions();
  }, [fetchProjects, fetchOptions]);

  const handlePageChange = (page) => {
    fetchProjects(page);
  };

  const openAddModal = () => {
    setEditingProject(null);
    setFormData({
      title: '',
      description: '',
      status: 'New',
      assignedClients: [],
      assignedStaff: []
    });
    setIsModalOpen(true);
  };

  const openEditModal = (project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      description: project.description || '',
      status: project.status,
      assignedClients: project.assignedClients?.map(c => c._id) || [],
      assignedStaff: project.assignedStaff?.map(s => s._id) || []
    });
    setIsModalOpen(true);
  };

  const openDeleteDialog = (project) => {
    setDeletingProject(project);
    setIsDeleteDialogOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMultiSelectChange = (e, field) => {
    const options = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({ ...prev, [field]: options }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');

    try {
      if (editingProject) {
        await updateProject(editingProject._id, formData);
        setSuccess('Project updated successfully');
      } else {
        await createProject(formData);
        setSuccess('Project created successfully');
      }
      setIsModalOpen(false);
      fetchProjects(pagination.page);
    } catch (err) {
      setError(err.message || 'Failed to save project');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingProject) return;
    
    try {
      await deleteProject(deletingProject._id);
      setSuccess('Project deleted successfully');
      setIsDeleteDialogOpen(false);
      setDeletingProject(null);
      fetchProjects(pagination.page);
    } catch (err) {
      setError(err.message || 'Failed to delete project');
    }
  };

  const handleStatusChange = async (projectId, newStatus) => {
    try {
      await updateProjectStatus(projectId, newStatus);
      setSuccess('Status updated successfully');
      fetchProjects(pagination.page);
    } catch (err) {
      setError(err.message || 'Failed to update status');
    }
  };

  const columns = [
    {
      key: 'title',
      title: 'Title',
      render: (value) => (
        <span style={{ fontWeight: 'var(--font-weight-medium)' }}>{value}</span>
      )
    },
    {
      key: 'description',
      title: 'Description',
      render: (value) => (
        <span className="text-muted text-truncate" style={{ maxWidth: '200px', display: 'block' }}>
          {value || '-'}
        </span>
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
          style={{ minWidth: '130px', padding: '4px 8px', fontSize: 'var(--font-size-xs)' }}
        >
          {PROJECT_STATUSES.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      )
    },
    {
      key: 'assignedClients',
      title: 'Clients',
      render: (value) => (
        <span className="text-small text-muted">
          {value?.length > 0 ? value.map(c => c.name).join(', ') : '-'}
        </span>
      )
    },
    {
      key: 'assignedStaff',
      title: 'Staff',
      render: (value) => (
        <span className="text-small text-muted">
          {value?.length > 0 ? value.map(s => s.name).join(', ') : '-'}
        </span>
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
            onClick={() => setIsRequirementModalOpen(true)}
            title="Requirement Document"
          >
            <FileIcon />
          </button>
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
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">Manage your projects and assignments</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={openAddModal}>
            <PlusIcon />
            Add Project
          </button>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      <DataTable
        columns={columns}
        data={projects}
        loading={loading}
        emptyMessage="No projects found"
        emptyDescription="Get started by creating your first project."
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
        title={editingProject ? 'Edit Project' : 'Add Project'}
        size="lg"
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
              {formLoading ? 'Saving...' : (editingProject ? 'Update' : 'Create')}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label form-label-required">Title</label>
            <input
              type="text"
              name="title"
              className="form-input"
              value={formData.title}
              onChange={handleFormChange}
              placeholder="Enter project title"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              className="form-textarea"
              value={formData.description}
              onChange={handleFormChange}
              placeholder="Enter project description"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              name="status"
              className="form-select"
              value={formData.status}
              onChange={handleFormChange}
            >
              {PROJECT_STATUSES.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Assigned Clients</label>
            <select
              multiple
              className="form-select"
              value={formData.assignedClients}
              onChange={(e) => handleMultiSelectChange(e, 'assignedClients')}
              style={{ minHeight: '100px' }}
            >
              {clients.map(client => (
                <option key={client._id} value={client._id}>
                  {client.name} ({client.email})
                </option>
              ))}
            </select>
            <p className="form-hint">Hold Ctrl/Cmd to select multiple clients</p>
          </div>

          <div className="form-group">
            <label className="form-label">Assigned Staff</label>
            <select
              multiple
              className="form-select"
              value={formData.assignedStaff}
              onChange={(e) => handleMultiSelectChange(e, 'assignedStaff')}
              style={{ minHeight: '100px' }}
            >
              {staff.map(member => (
                <option key={member._id} value={member._id}>
                  {member.name} ({member.email})
                </option>
              ))}
            </select>
            <p className="form-hint">Hold Ctrl/Cmd to select multiple staff members</p>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Project"
        message={`Are you sure you want to delete "${deletingProject?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />

      {/* Requirement Document Modal */}
      <Modal
        isOpen={isRequirementModalOpen}
        onClose={() => setIsRequirementModalOpen(false)}
        title="Requirement Document"
        footer={
          <button 
            className="btn btn-primary" 
            onClick={() => setIsRequirementModalOpen(false)}
          >
            Close
          </button>
        }
      >
        <div className="empty-state" style={{ padding: 'var(--spacing-6)' }}>
          <FileIcon style={{ width: 48, height: 48 }} />
          <h3 className="empty-state-title">Feature Coming Soon</h3>
          <p className="empty-state-description" style={{ marginBottom: 0 }}>
            The Requirement Document feature is currently under development. 
            Check back later for updates.
          </p>
        </div>
      </Modal>
    </div>
  );
}

Projects.getLayout = function getLayout(page) {
  return <AdminLayout>{page}</AdminLayout>;
};
