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

const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const UsersIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export default function Projects() {
  const [projects, setProjects] = useState([]);
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

  // Helper function to render timeline with enhanced styling
  const renderTimeline = (startDate, endDate) => {
    const start = formatDateShort(startDate);
    const end = formatDateShort(endDate);

    if (start === '—' && end === '—') {
      return <span style={{ color: 'var(--color-text-muted)' }}>—</span>;
    }

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
        <CalendarIcon />
        <span style={{ fontWeight: '500' }}>{start}</span>
        <span style={{ color: 'var(--color-text-muted)' }}>→</span>
        <span style={{ fontWeight: '500' }}>{end}</span>
      </div>
    );
  };

  // Helper function to render tech stack badges with enhanced design
  const renderTechStack = (techStack) => {
    if (!techStack || techStack.length === 0) {
      return <span style={{ color: 'var(--color-text-muted)' }}>—</span>;
    }

    const displayedTech = techStack.slice(0, 3);
    const remaining = techStack.length - 3;

    return (
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
        {displayedTech.map((tech, index) => (
          <span
            key={index}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '4px 10px',
              fontSize: 'var(--font-size-xs, 12px)',
              fontWeight: '600',
              color: 'var(--color-primary-700, #1e40af)',
              backgroundColor: 'var(--color-primary-50, #eff6ff)',
              border: '1px solid var(--color-primary-200, #bfdbfe)',
              borderRadius: 'var(--border-radius-full, 9999px)',
              whiteSpace: 'nowrap',
              letterSpacing: '0.01em'
            }}
          >
            {tech}
          </span>
        ))}
        {remaining > 0 && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '28px',
              height: '28px',
              padding: '0 8px',
              fontSize: 'var(--font-size-xs, 12px)',
              color: 'var(--color-text-muted)',
              backgroundColor: 'var(--color-bg-secondary, #f3f4f6)',
              borderRadius: 'var(--border-radius-full, 9999px)',
              fontWeight: '600'
            }}
          >
            +{remaining}
          </span>
        )}
      </div>
    );
  };

  // Helper function to render staff list with avatars
  const renderStaffList = (staff) => {
    if (!staff || staff.length === 0) {
      return <span style={{ color: 'var(--color-text-muted)' }}>—</span>;
    }

    const displayedStaff = staff.slice(0, 3);
    const remaining = staff.length - 3;

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginLeft: '-4px' }}>
          {displayedStaff.map((s, index) => (
            <div
              key={s._id}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: `hsl(${(index * 137.5) % 360}, 65%, 85%)`,
                border: '2px solid white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'var(--font-size-xs, 12px)',
                fontWeight: '600',
                color: `hsl(${(index * 137.5) % 360}, 65%, 35%)`,
                marginLeft: index > 0 ? '-8px' : '0',
                zIndex: displayedStaff.length - index,
                cursor: 'pointer',
                transition: 'transform 0.2s ease'
              }}
              title={s.name}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0) scale(1)'}
            >
              {s.name.charAt(0).toUpperCase()}
            </div>
          ))}
          {remaining > 0 && (
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-bg-secondary, #f3f4f6)',
                border: '2px solid white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'var(--font-size-xs, 11px)',
                fontWeight: '700',
                color: 'var(--color-text-secondary)',
                marginLeft: '-8px',
                zIndex: 0
              }}
              title={`+${remaining} more`}
            >
              +{remaining}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--font-size-xs, 12px)', color: 'var(--color-text-muted)' }}>
          <UsersIcon />
          <span>{staff.length}</span>
        </div>
      </div>
    );
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      'New': { bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe' },
      'In Progress': { bg: '#fef3c7', text: '#92400e', border: '#fde68a' },
      'On Hold': { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' },
      'Completed': { bg: '#d1fae5', text: '#065f46', border: '#a7f3d0' }
    };
    return colors[status] || colors['New'];
  };

  const fetchProjects = useCallback(async (page = 1, search = '', status = '') => {
    try {
      setLoading(true);
      const response = await getProjects(page, ITEMS_PER_PAGE, search, status);
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
    fetchProjects(1, searchQuery, statusFilter);
    fetchOptions();
  }, [searchQuery, statusFilter, fetchProjects, fetchOptions]);

  const handlePageChange = (page) => {
    fetchProjects(page, searchQuery, statusFilter);
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
      render: (value, row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{
            fontWeight: '600',
            fontSize: 'var(--font-size-sm, 14px)',
            color: 'var(--color-text-primary)'
          }}>
            {value}
          </span>
          {row.description && (
            <span style={{
              fontSize: 'var(--font-size-xs, 12px)',
              color: 'var(--color-text-muted)',
              maxWidth: '300px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {row.description}
            </span>
          )}
        </div>
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
      title: 'Team',
      render: (value) => renderStaffList(value)
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
              minWidth: '140px',
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
            {PROJECT_STATUSES.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        );
      }
    },
    {
      key: 'actions',
      title: 'Actions',
      align: 'right',
      render: (_, row) => (
        <div className="table-actions" style={{ justifyContent: 'flex-end', gap: '6px' }}>
          <button
            className="btn btn-ghost btn-icon-sm"
            onClick={() => setIsRequirementModalOpen(true)}
            title="Requirement Document"
            style={{
              transition: 'all 0.2s ease'
            }}
          >
            <FileIcon />
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

  // Calculate statistics


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
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Projects
          </h1>
          <p className="page-subtitle" style={{
            fontSize: 'var(--font-size-sm, 14px)',
            color: 'var(--color-text-muted)'
          }}>
            Manage your projects and assignments
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
            boxShadow: '0 4px 6px rgba(99, 102, 241, 0.15)',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none'
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 12px rgba(99, 102, 241, 0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(99, 102, 241, 0.15)';
            }}>
            <PlusIcon />
            Add Project
          </button>
        </div>
      </div>

      {/* Statistics Cards */}


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
              placeholder="Search projects..."
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
                e.currentTarget.style.borderColor = '#667eea';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
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
              minWidth: '140px'
            }}
          >
            <option value="">All Statuses</option>
            {PROJECT_STATUSES.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          <button
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
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="21" x2="4" y2="14" />
              <line x1="4" y1="10" x2="4" y2="3" />
              <line x1="12" y1="21" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12" y2="3" />
              <line x1="20" y1="21" x2="20" y2="16" />
              <line x1="20" y1="12" x2="20" y2="3" />
              <line x1="1" y1="14" x2="7" y2="14" />
              <line x1="9" y1="8" x2="15" y2="8" />
              <line x1="17" y1="16" x2="23" y2="16" />
            </svg>
            Filters
          </button>
        </div>
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
          data={projects}
          loading={loading}
          emptyMessage="No projects found"
          emptyDescription="Get started by creating your first project."
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
        <div style={{
          padding: 'var(--spacing-8, 32px)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--spacing-4, 16px)'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 'var(--spacing-2, 8px)'
          }}>
            <FileIcon style={{ width: 36, height: 36, color: 'white' }} />
          </div>
          <h3 style={{
            fontSize: 'var(--font-size-xl, 20px)',
            fontWeight: '700',
            color: 'var(--color-text-primary)',
            margin: 0
          }}>
            Feature Coming Soon
          </h3>
          <p style={{
            fontSize: 'var(--font-size-sm, 14px)',
            color: 'var(--color-text-muted)',
            lineHeight: '1.6',
            maxWidth: '400px',
            margin: 0
          }}>
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