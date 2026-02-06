import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../../layouts/AdminLayout';
import { DataTable, Pagination, StatusBadge, Modal, Alert } from '../../../components';
import { 
  getPaymentPlans, 
  createPaymentPlan,
  getAllClients,
  getProjects
} from '../../../services/api';
import { formatDate } from '../../../utils/helpers';

const ITEMS_PER_PAGE = 10;
const PAYMENT_TYPES = ['ONE_TIME', 'PHASE_WISE'];

const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

export default function Payments() {
  const router = useRouter();
  const [plans, setPlans] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [formLoading, setFormLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    clientId: '',
    projectId: '',
    totalAmount: '',
    paymentType: 'ONE_TIME',
    phases: []
  });

  const fetchPlans = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const response = await getPaymentPlans(page, ITEMS_PER_PAGE);
      setPlans(response.data);
      setPagination(response.pagination);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load payment plans');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDropdownData = async () => {
    try {
      const [clientsRes, projectsRes] = await Promise.all([
        getAllClients(),
        getProjects(1, 100)
      ]);
      setClients(clientsRes.data);
      setProjects(projectsRes.data);
    } catch (err) {
      console.error('Failed to load dropdown data');
    }
  };

  useEffect(() => {
    fetchPlans();
    fetchDropdownData();
  }, [fetchPlans]);

  const handlePageChange = (page) => {
    fetchPlans(page);
  };

  const openAddModal = () => {
    setFormData({
      clientId: '',
      projectId: '',
      totalAmount: '',
      paymentType: 'ONE_TIME',
      phases: []
    });
    setIsModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addPhase = () => {
    setFormData(prev => ({
      ...prev,
      phases: [...prev.phases, { phaseName: '', amountType: 'FIXED', amountValue: '', dueDate: '' }]
    }));
  };

  const removePhase = (index) => {
    setFormData(prev => ({
      ...prev,
      phases: prev.phases.filter((_, i) => i !== index)
    }));
  };

  const handlePhaseChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      phases: prev.phases.map((phase, i) => 
        i === index ? { ...phase, [field]: value } : phase
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');

    try {
      await createPaymentPlan({
        ...formData,
        totalAmount: parseFloat(formData.totalAmount),
        phases: formData.phases.map(p => ({
          ...p,
          amountValue: parseFloat(p.amountValue)
        }))
      });
      setSuccess('Payment plan created successfully');
      setIsModalOpen(false);
      fetchPlans(pagination.page);
    } catch (err) {
      setError(err.message || 'Failed to create payment plan');
    } finally {
      setFormLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getPaymentStatusBadge = (status) => {
    const styles = {
      'PENDING': 'badge-paused',
      'PARTIAL': 'badge-in-progress',
      'PAID': 'badge-completed'
    };
    return <span className={`badge ${styles[status] || 'badge-info'}`}>{status}</span>;
  };

  const columns = [
    {
      key: 'client',
      title: 'Client',
      render: (_, row) => row.client?.name || '-'
    },
    {
      key: 'project',
      title: 'Project',
      render: (_, row) => row.project?.title || '-'
    },
    {
      key: 'totalAmount',
      title: 'Total Amount',
      render: (val) => formatCurrency(val)
    },
    {
      key: 'totalPaidAmount',
      title: 'Paid',
      render: (val) => formatCurrency(val)
    },
    {
      key: 'remainingAmount',
      title: 'Pending',
      render: (val) => formatCurrency(val)
    },
    {
      key: 'paymentType',
      title: 'Type',
      render: (val) => val.replace('_', ' ')
    },
    {
      key: 'status',
      title: 'Status',
      render: (val) => getPaymentStatusBadge(val)
    },
    {
      key: 'actions',
      title: 'Actions',
      width: '100px',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className="btn btn-icon btn-secondary"
            onClick={() => router.push(`/admin/payments/${row._id}`)}
            title="View Details"
          >
            <EyeIcon />
          </button>
        </div>
      )
    }
  ];

  // Filter projects by selected client
  const filteredProjects = formData.clientId 
    ? projects.filter(p => p.assignedClients?.some(c => c._id === formData.clientId))
    : projects;

  return (
    <AdminLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Payments</h1>
          <p className="page-description">Manage payment plans and track payments</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <PlusIcon />
          <span>Add Payment Plan</span>
        </button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      <DataTable
        columns={columns}
        data={plans}
        loading={loading}
        emptyMessage="No payment plans"
        emptyDescription="Create a payment plan to start tracking payments."
      />

      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={handlePageChange}
        totalItems={pagination.total}
        itemsPerPage={ITEMS_PER_PAGE}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Payment Plan"
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Client</label>
            <select
              name="clientId"
              className="form-input"
              value={formData.clientId}
              onChange={handleFormChange}
              required
            >
              <option value="">Select Client</option>
              {clients.map(client => (
                <option key={client._id} value={client._id}>{client.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Project</label>
            <select
              name="projectId"
              className="form-input"
              value={formData.projectId}
              onChange={handleFormChange}
              required
            >
              <option value="">Select Project</option>
              {filteredProjects.map(project => (
                <option key={project._id} value={project._id}>{project.title}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Total Amount (₹)</label>
            <input
              type="number"
              name="totalAmount"
              className="form-input"
              value={formData.totalAmount}
              onChange={handleFormChange}
              placeholder="Enter total amount"
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Payment Type</label>
            <select
              name="paymentType"
              className="form-input"
              value={formData.paymentType}
              onChange={handleFormChange}
              required
            >
              {PAYMENT_TYPES.map(type => (
                <option key={type} value={type}>{type.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          {formData.paymentType === 'PHASE_WISE' && (
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <label className="form-label" style={{ margin: 0 }}>Phases</label>
                <button type="button" className="btn btn-secondary btn-sm" onClick={addPhase}>
                  + Add Phase
                </button>
              </div>
              
              {formData.phases.map((phase, index) => (
                <div key={index} style={{ 
                  padding: '12px', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '8px', 
                  marginBottom: '12px',
                  background: 'var(--bg-secondary)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <strong>Phase {index + 1}</strong>
                    <button 
                      type="button" 
                      className="btn btn-icon btn-danger btn-sm"
                      onClick={() => removePhase(index)}
                    >
                      <TrashIcon />
                    </button>
                  </div>
                  
                  <div style={{ display: 'grid', gap: '8px' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Phase Name"
                      value={phase.phaseName}
                      onChange={(e) => handlePhaseChange(index, 'phaseName', e.target.value)}
                      required
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <select
                        className="form-input"
                        value={phase.amountType}
                        onChange={(e) => handlePhaseChange(index, 'amountType', e.target.value)}
                      >
                        <option value="FIXED">Fixed Amount</option>
                        <option value="PERCENTAGE">Percentage</option>
                      </select>
                      <input
                        type="number"
                        className="form-input"
                        placeholder={phase.amountType === 'PERCENTAGE' ? 'Percentage %' : 'Amount ₹'}
                        value={phase.amountValue}
                        onChange={(e) => handlePhaseChange(index, 'amountValue', e.target.value)}
                        min="0"
                        required
                      />
                    </div>
                    <input
                      type="date"
                      className="form-input"
                      value={phase.dueDate}
                      onChange={(e) => handlePhaseChange(index, 'dueDate', e.target.value)}
                      placeholder="Due Date (optional)"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={formLoading}>
              {formLoading ? 'Creating...' : 'Create Plan'}
            </button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}
