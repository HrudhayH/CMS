import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../layouts/AdminLayout';
import { DataTable, Pagination, StatusBadge, Modal, ConfirmDialog, Alert, Button, Card, PageHeader } from '../../components';
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
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    techStack: '',
    startDateFrom: '',
    startDateTo: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

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
    techStack: [],
    referenceLink: ''
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
        color: 'var(--color-text-secondary)',
        whiteSpace: 'nowrap'
      }}>
        <CalendarIcon />
        <span style={{ fontWeight: '500' }}>{start}</span>
        <span style={{ color: 'var(--color-text-muted)' }}>→</span>
        <span style={{ fontWeight: '500' }}>{end}</span>
      </div>
    );
  };

  // Helper function to render client column with hover popover
  const ClientCell = ({ clients: assignedClients }) => {
    const [hoveredClient, setHoveredClient] = useState(null);
    const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });
    const cellRef = useRef(null);

    if (!assignedClients || assignedClients.length === 0) {
      return <span style={{ color: 'var(--color-text-muted)' }}>—</span>;
    }

    const primary = assignedClients[0];
    const remaining = assignedClients.length - 1;

    const handleMouseEnter = (client, e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      setPopoverPos({ top: rect.bottom + 6, left: rect.left });
      setHoveredClient(client);
    };

    const getStatusDot = (status) => {
      const color = status === 'Active' ? '#10b981' : '#f59e0b';
      return (
        <span style={{
          display: 'inline-block', width: '8px', height: '8px',
          borderRadius: '50%', backgroundColor: color, marginRight: '6px'
        }} />
      );
    };

    return (
      <div ref={cellRef} style={{ position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            onMouseEnter={(e) => handleMouseEnter(primary, e)}
            onMouseLeave={() => setHoveredClient(null)}
            style={{
              fontWeight: '500', fontSize: '13px', cursor: 'pointer',
              color: 'var(--color-primary-700, #1e40af)',
              borderBottom: '1px dashed var(--color-primary-200, #bfdbfe)'
            }}
          >
            {primary.name}
          </span>
          {remaining > 0 && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              minWidth: '22px', height: '22px', padding: '0 6px',
              fontSize: '11px', fontWeight: '700',
              color: 'var(--color-text-muted)',
              backgroundColor: 'var(--color-bg-secondary, #f3f4f6)',
              borderRadius: '9999px'
            }}>
              +{remaining}
            </span>
          )}
        </div>

        {/* Client hover popover */}
        {hoveredClient && (
          <div
            onMouseEnter={() => { }}
            onMouseLeave={() => setHoveredClient(null)}
            style={{
              position: 'fixed',
              top: popoverPos.top,
              left: popoverPos.left,
              zIndex: 9999,
              minWidth: '240px',
              backgroundColor: 'white',
              border: '1px solid var(--color-border, #e5e7eb)',
              borderRadius: '10px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1), 0 4px 10px rgba(0,0,0,0.05)',
              padding: '14px',
              animation: 'popoverFadeIn 0.15s ease-out'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '14px', fontWeight: '700', flexShrink: 0
              }}>
                {hoveredClient.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: '600', fontSize: '14px' }}>{hoveredClient.name}</div>
                {hoveredClient.clientCode && (
                  <span style={{ fontSize: '11px', color: '#7c3aed', fontWeight: '600' }}>{hoveredClient.clientCode}</span>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: '#6b7280' }}>
              {hoveredClient.email && <div>✉ {hoveredClient.email}</div>}
              {hoveredClient.phone && <div>☎ {hoveredClient.phone}</div>}
              {hoveredClient.status && (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {getStatusDot(hoveredClient.status)} {hoveredClient.status}
                </div>
              )}
            </div>
          </div>
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

  const fetchProjects = useCallback(async (page = 1, search = '', status = '', filters = {}) => {
    try {
      setLoading(true);
      const response = await getProjects(page, ITEMS_PER_PAGE, search, status, filters);
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
    fetchProjects(1, searchQuery, statusFilter, advancedFilters);
    fetchOptions();
  }, [searchQuery, statusFilter, advancedFilters, fetchProjects, fetchOptions]);

  const handlePageChange = (page) => {
    fetchProjects(page, searchQuery, statusFilter, advancedFilters);
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
      techStack: [],
      referenceLink: '',
      developmentLink: '',
      productionLink: ''
    });
    setTechInput('');
    setShowTechSuggestions(false);
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
      techStack: project.techStack || [],
      referenceLink: project.referenceLink || '',
      developmentLink: project.developmentLink || '',
      productionLink: project.productionLink || ''
    });
    setTechInput('');
    setShowTechSuggestions(false);
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

  // Custom tech stack input
  const [techInput, setTechInput] = useState('');
  const [showTechSuggestions, setShowTechSuggestions] = useState(false);
  const techInputRef = useRef(null);

  const addTechTag = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    // Case-insensitive duplicate check
    const exists = formData.techStack.some(t => t.toLowerCase() === trimmed.toLowerCase());
    if (!exists) {
      setFormData(prev => ({ ...prev, techStack: [...prev.techStack, trimmed] }));
    }
    setTechInput('');
    setShowTechSuggestions(false);
  };

  const removeTechTag = (index) => {
    setFormData(prev => ({
      ...prev,
      techStack: prev.techStack.filter((_, i) => i !== index)
    }));
  };

  const handleTechInputKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      e.stopPropagation();
      addTechTag(techInput);
    } else if (e.key === 'Backspace' && !techInput && formData.techStack.length > 0) {
      removeTechTag(formData.techStack.length - 1);
    }
  };

  const filteredSuggestions = TECH_STACK_OPTIONS.filter(
    opt => opt.toLowerCase().includes(techInput.toLowerCase()) &&
      !formData.techStack.some(t => t.toLowerCase() === opt.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');

    // Commit any pending tech stack input before submit
    let finalFormData = { ...formData };
    if (techInput.trim()) {
      const pending = techInput.trim();
      const alreadyExists = finalFormData.techStack.some(t => t.toLowerCase() === pending.toLowerCase());
      if (!alreadyExists) {
        finalFormData = { ...finalFormData, techStack: [...finalFormData.techStack, pending] };
      }
      setTechInput('');
    }

    try {
      if (editingProject) {
        await updateProject(editingProject._id, finalFormData);
        setSuccess('Project updated successfully');
      } else {
        await createProject(finalFormData);
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

  // Title cell with hover description popover
  const TitleCell = ({ project }) => {
    const [showDesc, setShowDesc] = useState(false);
    const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });
    const titleRef = useRef(null);

    const handleMouseEnter = () => {
      if (!project.description) return;
      const rect = titleRef.current?.getBoundingClientRect();
      if (rect) {
        setPopoverPos({ top: rect.bottom + 6, left: rect.left });
      }
      setShowDesc(true);
    };

    return (
      <div style={{ position: 'relative' }}>
        <div
          ref={titleRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={() => setShowDesc(false)}
          style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}
        >
          <span
            onClick={() => router.push(`/admin/projects/${project._id}`)}
            style={{
              fontWeight: '600',
              fontSize: 'var(--font-size-sm, 14px)',
              color: 'var(--color-primary-700, #1e40af)',
              cursor: 'pointer',
              textDecoration: 'none',
              borderBottom: '1px solid transparent',
              transition: 'border-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderBottomColor = 'var(--color-primary-400, #818cf8)'}
            onMouseLeave={(e) => e.currentTarget.style.borderBottomColor = 'transparent'}
          >
            {project.title}
          </span>
          {project.projectCode && (
            <span style={{
              display: 'inline-block',
              fontSize: '11px',
              fontWeight: '600',
              color: '#7c3aed',
              backgroundColor: '#f5f3ff',
              padding: '1px 8px',
              borderRadius: '9999px',
              border: '1px solid #ddd6fe',
              width: 'fit-content'
            }}>
              {project.projectCode}
            </span>
          )}
        </div>

        {/* Description hover popover */}
        {showDesc && project.description && (
          <div style={{
            position: 'fixed',
            top: popoverPos.top,
            left: popoverPos.left,
            zIndex: 9999,
            maxWidth: '340px',
            backgroundColor: 'white',
            border: '1px solid var(--color-border, #e5e7eb)',
            borderRadius: '10px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1), 0 4px 10px rgba(0,0,0,0.05)',
            padding: '12px 14px',
            animation: 'popoverFadeIn 0.15s ease-out'
          }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Description</div>
            <p style={{
              margin: 0, fontSize: '13px', lineHeight: '1.6',
              color: 'var(--color-text-secondary)',
              display: '-webkit-box', WebkitLineClamp: 5,
              WebkitBoxOrient: 'vertical', overflow: 'hidden'
            }}>
              {project.description}
            </p>
          </div>
        )}
      </div>
    );
  };

  const columns = [
    {
      key: 'title',
      title: 'Project',
      render: (value, row) => <TitleCell project={row} />
    },
    {
      key: 'assignedClients',
      title: 'Client',
      render: (value) => <ClientCell clients={value} />
    },
    {
      key: 'timeline',
      title: 'Timeline',
      render: (_, row) => renderTimeline(row.startDate, row.endDate)
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
      {/* Popover animation */}
      <style jsx global>{`
        @keyframes popoverFadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <PageHeader
        title="Projects"
        subtitle="Manage your projects and assignments"
        actions={
          <Button onClick={openAddModal} icon={PlusIcon}>
            Add Project
          </Button>
        }
      />

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
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            style={{
              padding: '10px 16px',
              fontSize: 'var(--font-size-sm, 14px)',
              border: '1px solid var(--color-border, #e5e7eb)',
              borderRadius: 'var(--border-radius-md, 6px)',
              backgroundColor: showAdvancedFilters ? '#f0f0ff' : 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: '500',
              color: showAdvancedFilters ? '#667eea' : 'var(--color-text-secondary)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = showAdvancedFilters ? '#e8e8ff' : 'var(--color-bg-secondary, #f9fafb)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = showAdvancedFilters ? '#f0f0ff' : 'white';
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

      {/* Advanced Filters Panel */}
      {showAdvancedFilters && (
        <div style={{
          backgroundColor: 'white',
          padding: 'var(--spacing-4, 16px)',
          borderRadius: 'var(--border-radius-lg, 8px)',
          border: '1px solid var(--color-border, #e5e7eb)',
          marginBottom: 'var(--spacing-4, 16px)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          gap: 'var(--spacing-3, 12px)',
          alignItems: 'flex-end',
          flexWrap: 'wrap'
        }}>
          <div style={{ flex: '1', minWidth: '180px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Tech Stack</label>
            <input
              type="text"
              placeholder="e.g. React, Node.js"
              value={advancedFilters.techStack}
              onChange={(e) => setAdvancedFilters(prev => ({ ...prev, techStack: e.target.value }))}
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: '13px',
                border: '1px solid var(--color-border, #e5e7eb)',
                borderRadius: 'var(--border-radius-md, 6px)',
                outline: 'none'
              }}
            />
          </div>
          <div style={{ minWidth: '150px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Start Date From</label>
            <input
              type="date"
              value={advancedFilters.startDateFrom}
              onChange={(e) => setAdvancedFilters(prev => ({ ...prev, startDateFrom: e.target.value }))}
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: '13px',
                border: '1px solid var(--color-border, #e5e7eb)',
                borderRadius: 'var(--border-radius-md, 6px)',
                outline: 'none'
              }}
            />
          </div>
          <div style={{ minWidth: '150px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Start Date To</label>
            <input
              type="date"
              value={advancedFilters.startDateTo}
              onChange={(e) => setAdvancedFilters(prev => ({ ...prev, startDateTo: e.target.value }))}
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: '13px',
                border: '1px solid var(--color-border, #e5e7eb)',
                borderRadius: 'var(--border-radius-md, 6px)',
                outline: 'none'
              }}
            />
          </div>
          <div style={{ minWidth: '140px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Sort By</label>
            <select
              value={advancedFilters.sortBy}
              onChange={(e) => setAdvancedFilters(prev => ({ ...prev, sortBy: e.target.value }))}
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: '13px',
                border: '1px solid var(--color-border, #e5e7eb)',
                borderRadius: 'var(--border-radius-md, 6px)',
                backgroundColor: 'white',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="createdAt">Created Date</option>
              <option value="title">Title</option>
              <option value="startDate">Start Date</option>
              <option value="status">Status</option>
            </select>
          </div>
          <div style={{ minWidth: '110px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Order</label>
            <select
              value={advancedFilters.sortOrder}
              onChange={(e) => setAdvancedFilters(prev => ({ ...prev, sortOrder: e.target.value }))}
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: '13px',
                border: '1px solid var(--color-border, #e5e7eb)',
                borderRadius: 'var(--border-radius-md, 6px)',
                backgroundColor: 'white',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
          <button
            onClick={() => setAdvancedFilters({ techStack: '', startDateFrom: '', startDateTo: '', sortBy: 'createdAt', sortOrder: 'desc' })}
            style={{
              padding: '8px 14px',
              fontSize: '13px',
              border: '1px solid #fecaca',
              borderRadius: 'var(--border-radius-md, 6px)',
              backgroundColor: '#fef2f2',
              color: '#dc2626',
              cursor: 'pointer',
              fontWeight: '500',
              whiteSpace: 'nowrap'
            }}
          >
            Clear Filters
          </button>
        </div>
      )}

      <div className="table-responsive">
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
            <label className="form-label">Reference Link</label>
            <input
              type="url"
              name="referenceLink"
              className="form-input"
              value={formData.referenceLink}
              onChange={handleFormChange}
              placeholder="e.g. Figma, Google Drive, or any external URL"
            />
            <p className="form-hint">Optional link to Figma designs, Drive docs, Notion pages, etc.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4, 16px)' }}>
            <div className="form-group">
              <label className="form-label">Development Link</label>
              <input
                type="url"
                name="developmentLink"
                className="form-input"
                value={formData.developmentLink}
                onChange={handleFormChange}
                placeholder="https://dev.example.com"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Production Link</label>
              <input
                type="url"
                name="productionLink"
                className="form-input"
                value={formData.productionLink}
                onChange={handleFormChange}
                placeholder="https://www.example.com"
              />
            </div>
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
            <div style={{ position: 'relative' }}>
              <div
                onClick={() => techInputRef.current?.focus()}
                style={{
                  border: '1px solid var(--color-border, #e5e7eb)',
                  borderRadius: 'var(--border-radius-md, 6px)',
                  padding: '6px 8px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px',
                  alignItems: 'center',
                  minHeight: '42px',
                  cursor: 'text',
                  transition: 'border-color 0.2s'
                }}
              >
                {formData.techStack.map((tech, idx) => (
                  <span key={idx} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    padding: '3px 10px', fontSize: '12px', fontWeight: '600',
                    color: '#1e40af', backgroundColor: '#eff6ff',
                    border: '1px solid #bfdbfe', borderRadius: '9999px'
                  }}>
                    {tech}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeTechTag(idx); }}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        padding: '0 2px', fontSize: '14px', lineHeight: 1,
                        color: '#6b7280', fontWeight: '700'
                      }}
                      title="Remove"
                    >×</button>
                  </span>
                ))}
                <input
                  ref={techInputRef}
                  type="text"
                  value={techInput}
                  onChange={(e) => { setTechInput(e.target.value); setShowTechSuggestions(true); }}
                  onKeyDown={handleTechInputKeyDown}
                  onFocus={() => setShowTechSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowTechSuggestions(false), 150)}
                  placeholder={formData.techStack.length === 0 ? 'Type and press Enter to add…' : ''}
                  style={{
                    border: 'none', outline: 'none', flex: 1, minWidth: '120px',
                    padding: '4px 0', fontSize: '13px', backgroundColor: 'transparent'
                  }}
                />
              </div>

              {/* Suggestions dropdown */}
              {showTechSuggestions && filteredSuggestions.length > 0 && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
                  backgroundColor: 'white', border: '1px solid var(--color-border, #e5e7eb)',
                  borderRadius: '6px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  maxHeight: '160px', overflowY: 'auto', marginTop: '4px'
                }}>
                  {filteredSuggestions.map(opt => (
                    <div
                      key={opt}
                      onMouseDown={(e) => { e.preventDefault(); addTechTag(opt); }}
                      style={{
                        padding: '8px 12px', cursor: 'pointer', fontSize: '13px',
                        transition: 'background-color 0.15s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <p className="form-hint">
              {formData.techStack.length > 0
                ? `${formData.techStack.length} technolog${formData.techStack.length !== 1 ? 'ies' : 'y'} selected`
                : 'Type a technology and press Enter, or pick from suggestions'
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