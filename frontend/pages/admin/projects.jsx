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
const TECH_STACK_OPTIONS = [
  'React',
  'Next.js',
  'Node.js',
  'Express',
  'MongoDB',
  'PostgreSQL',
  'AWS',
  'Docker'
];

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
    startDate: '',
    endDate: '',
    assignedClients: [],
    assignedStaff: [],
    techStack: []
  });
  const [formLoading, setFormLoading] = useState(false);

  // Options for dropdowns
  const [clients, setClients] = useState([]);
  const [staff, setStaff] = useState([]);

  // Helper function to format date as "DD MMM YYYY"
  const formatDateShort = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  // Helper function to render timeline
  const renderTimeline = (startDate, endDate) => {
    const start = formatDateShort(startDate);
    const end = formatDateShort(endDate);

    if (start === '—' && end === '—') {
      return <span style={{ color: 'var(--color-text-muted)' }}>—</span>;
    }

    return (
      <span style={{ fontSize: 'var(--font-size-sm, 14px)', color: 'var(--color-text-secondary)' }}>
        {start} → {end}
      </span>
    );
  };

  // Helper function to render tech stack badges
  const renderTechStack = (techStack) => {
    if (!techStack || techStack.length === 0) {
      return <span style={{ color: 'var(--color-text-muted)' }}>—</span>;
    }

    const displayedTech = techStack.slice(0, 3);
    const remaining = techStack.length - 3;

    return (
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
        {displayedTech.map((tech, index) => (
          <span
            key={index}
            style={{
              display: 'inline-block',
              padding: '2px 8px',
              fontSize: 'var(--font-size-xs, 12px)',
              fontWeight: 'var(--font-weight-medium, 500)',
              color: 'var(--color-primary-700, #1e40af)',
              backgroundColor: 'var(--color-primary-50, #eff6ff)',
              borderRadius: 'var(--border-radius-sm, 4px)',
              whiteSpace: 'nowrap'
            }}
          >
            {tech}
          </span>
        ))}
        {remaining > 0 && (
          <span
            style={{
              fontSize: 'var(--font-size-xs, 12px)',
              color: 'var(--color-text-muted)',
              fontWeight: 'var(--font-weight-medium, 500)'
            }}
          >
            +{remaining}
          </span>
        )}
      </div>
    );
  };

  // Helper function to render staff list
  const renderStaffList = (staff) => {
    if (!staff || staff.length === 0) {
      return <span style={{ color: 'var(--color-text-muted)' }}>—</span>;
    }

    const displayedStaff = staff.slice(0, 2);
    const remaining = staff.length - 2;

    return (
      <span style={{ fontSize: 'var(--font-size-sm, 14px)', color: 'var(--color-text-secondary)' }}>
        {displayedStaff.map(s => s.name).join(', ')}
        {remaining > 0 && (
          <span style={{ color: 'var(--color-text-muted)', fontWeight: 'var(--font-weight-medium, 500)' }}>
            {' '}+{remaining}
          </span>
        )}
      </span>
    );
  };

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
      startDate: '',
      endDate: '',
      assignedClients: [],
      assignedStaff: [],
      techStack: []
    });
    setIsModalOpen(true);
  };

  const openEditModal = (project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      description: project.description || '',
      status: project.status,
      startDate: project.startDate || '',
      endDate: project.endDate || '',
      assignedClients: project.assignedClients?.map(c => c._id) || [],
      assignedStaff: project.assignedStaff?.map(s => s._id) || [],
      techStack: project.techStack || []
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

  const handleCheckboxChange = (id, field) => {
    setFormData(prev => {
      const currentValues = prev[field];
      const newValues = currentValues.includes(id)
        ? currentValues.filter(itemId => itemId !== id)
        : [...currentValues, id];
      return { ...prev, [field]: newValues };
    });
  };

  const handleTechStackChange = (tech) => {
    setFormData(prev => {
      const currentTechStack = prev.techStack;
      const newTechStack = currentTechStack.includes(tech)
        ? currentTechStack.filter(item => item !== tech)
        : [...currentTechStack, tech];
      return { ...prev, techStack: newTechStack };
    });
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
      title: 'Project Title',
      render: (value) => (
        <span style={{ fontWeight: 'var(--font-weight-semibold, 600)', fontSize: 'var(--font-size-sm, 14px)' }}>
          {value}
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
          style={{
            minWidth: '130px',
            padding: '4px 8px',
            fontSize: 'var(--font-size-xs, 12px)',
            height: '32px'
          }}
        >
          {PROJECT_STATUSES.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      )
    },
    {
      key: 'timeline',
      title: 'Timeline',
      render: (_, row) => renderTimeline(row.startDate, row.endDate)
    },
    {
      key: 'techStack',
      title: 'Tech Stack',
      render: (value) => renderTechStack(value)
    },
    {
      key: 'assignedStaff',
      title: 'Assigned Staff',
      render: (value) => renderStaffList(value)
    },
    {
      key: 'actions',
      title: 'Actions',
      align: 'right',
      render: (_, row) => (
        <div className="table-actions" style={{ justifyContent: 'flex-end', gap: '4px' }}>
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

          {/* Start Date and End Date - Side by Side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4, 16px)' }}>
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                name="startDate"
                className="form-input"
                value={formData.startDate}
                onChange={handleFormChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">End Date</label>
              <input
                type="date"
                name="endDate"
                className="form-input"
                value={formData.endDate}
                onChange={handleFormChange}
                min={formData.startDate || undefined}
              />
              {formData.startDate && formData.endDate && formData.endDate < formData.startDate && (
                <p className="form-hint" style={{ color: 'var(--color-error-600)' }}>
                  End date cannot be earlier than start date
                </p>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Assigned Clients</label>
            <div
              style={{
                border: '1px solid var(--color-border, #e5e7eb)',
                borderRadius: 'var(--border-radius-md, 6px)',
                maxHeight: '200px',
                overflowY: 'auto',
                padding: 'var(--spacing-2, 8px)'
              }}
            >
              {clients.length === 0 ? (
                <p style={{ padding: 'var(--spacing-2, 8px)', color: 'var(--color-text-muted)', margin: 0 }}>
                  No clients available
                </p>
              ) : (
                clients.map(client => (
                  <label
                    key={client._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: 'var(--spacing-2, 8px)',
                      cursor: 'pointer',
                      borderRadius: 'var(--border-radius-sm, 4px)',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-hover, #f9fafb)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <input
                      type="checkbox"
                      checked={formData.assignedClients.includes(client._id)}
                      onChange={() => handleCheckboxChange(client._id, 'assignedClients')}
                      style={{ marginRight: 'var(--spacing-2, 8px)' }}
                    />
                    <span>
                      {client.name} <span style={{ color: 'var(--color-text-muted)' }}>({client.email})</span>
                    </span>
                  </label>
                ))
              )}
            </div>
            <p className="form-hint">
              {formData.assignedClients.length > 0
                ? `${formData.assignedClients.length} client${formData.assignedClients.length !== 1 ? 's' : ''} selected`
                : 'Select one or more clients'
              }
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">Assigned Staff</label>
            <div
              style={{
                border: '1px solid var(--color-border, #e5e7eb)',
                borderRadius: 'var(--border-radius-md, 6px)',
                maxHeight: '200px',
                overflowY: 'auto',
                padding: 'var(--spacing-2, 8px)'
              }}
            >
              {staff.length === 0 ? (
                <p style={{ padding: 'var(--spacing-2, 8px)', color: 'var(--color-text-muted)', margin: 0 }}>
                  No staff available
                </p>
              ) : (
                staff.map(member => (
                  <label
                    key={member._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: 'var(--spacing-2, 8px)',
                      cursor: 'pointer',
                      borderRadius: 'var(--border-radius-sm, 4px)',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-hover, #f9fafb)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <input
                      type="checkbox"
                      checked={formData.assignedStaff.includes(member._id)}
                      onChange={() => handleCheckboxChange(member._id, 'assignedStaff')}
                      style={{ marginRight: 'var(--spacing-2, 8px)' }}
                    />
                    <span>
                      {member.name} <span style={{ color: 'var(--color-text-muted)' }}>({member.email})</span>
                    </span>
                  </label>
                ))
              )}
            </div>
            <p className="form-hint">
              {formData.assignedStaff.length > 0
                ? `${formData.assignedStaff.length} staff member${formData.assignedStaff.length !== 1 ? 's' : ''} selected`
                : 'Select one or more staff members'
              }
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">Tech Stack</label>
            <div
              style={{
                border: '1px solid var(--color-border, #e5e7eb)',
                borderRadius: 'var(--border-radius-md, 6px)',
                maxHeight: '200px',
                overflowY: 'auto',
                padding: 'var(--spacing-2, 8px)'
              }}
            >
              {TECH_STACK_OPTIONS.map(tech => (
                <label
                  key={tech}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: 'var(--spacing-2, 8px)',
                    cursor: 'pointer',
                    borderRadius: 'var(--border-radius-sm, 4px)',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-hover, #f9fafb)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <input
                    type="checkbox"
                    checked={formData.techStack.includes(tech)}
                    onChange={() => handleTechStackChange(tech)}
                    style={{ marginRight: 'var(--spacing-2, 8px)' }}
                  />
                  <span>{tech}</span>
                </label>
              ))}
            </div>
            <p className="form-hint">
              {formData.techStack.length > 0
                ? `${formData.techStack.length} technolog${formData.techStack.length !== 1 ? 'ies' : 'y'} selected`
                : 'Select one or more technologies used in this project'
              }
            </p>
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