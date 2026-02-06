import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../../layouts/AdminLayout';
import { Modal, Alert } from '../../../components';
import { 
  getPaymentPlan, 
  markPhaseAsPaid, 
  markFullPayment, 
  addPaymentPhases,
  updatePaymentPlan,
  updatePaymentPhase,
  deletePaymentPhase
} from '../../../services/api';
import { formatDate } from '../../../utils/helpers';

const PAYMENT_MODES = ['UPI', 'BANK', 'CASH', 'CHEQUE'];
const PAYMENT_TYPES = ['ONE_TIME', 'PHASE_WISE'];

const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

export default function PaymentDetail() {
  const router = useRouter();
  const { id } = router.query;
  
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isPhaseModalOpen, setIsPhaseModalOpen] = useState(false);
  const [isEditPlanModalOpen, setIsEditPlanModalOpen] = useState(false);
  const [isEditPhaseModalOpen, setIsEditPhaseModalOpen] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState(null);
  const [paymentMode, setPaymentMode] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  
  const [newPhases, setNewPhases] = useState([]);
  
  // Edit plan state
  const [editPlanData, setEditPlanData] = useState({ totalAmount: '', paymentType: '' });
  
  // Edit phase state
  const [editPhaseData, setEditPhaseData] = useState({ 
    phaseName: '', amountType: '', amountValue: '', dueDate: '' 
  });

  const fetchPlan = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await getPaymentPlan(id);
      setPlan(response.data);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load payment plan');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const styles = {
      'PENDING': { bg: '#fef3c7', color: '#92400e', border: '#fcd34d' },
      'PARTIAL': { bg: '#dbeafe', color: '#1e40af', border: '#93c5fd' },
      'PAID': { bg: '#d1fae5', color: '#065f46', border: '#6ee7b7' }
    };
    const style = styles[status] || styles['PENDING'];
    return (
      <span style={{
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '600',
        backgroundColor: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`
      }}>
        {status}
      </span>
    );
  };

  const openPayModal = (phase = null) => {
    setSelectedPhase(phase);
    setPaymentMode('');
    setIsPayModalOpen(true);
  };

  const handlePayment = async () => {
    if (!paymentMode) {
      setError('Please select a payment mode');
      return;
    }

    setActionLoading(true);
    setError('');

    try {
      if (selectedPhase) {
        await markPhaseAsPaid(id, selectedPhase._id, paymentMode);
        setSuccess(`Phase "${selectedPhase.phaseName}" marked as paid`);
      } else {
        await markFullPayment(id, paymentMode);
        setSuccess('Full payment recorded successfully');
      }
      setIsPayModalOpen(false);
      fetchPlan();
    } catch (err) {
      setError(err.message || 'Failed to record payment');
    } finally {
      setActionLoading(false);
    }
  };

  const addNewPhase = () => {
    setNewPhases(prev => [...prev, { phaseName: '', amountType: 'FIXED', amountValue: '', dueDate: '' }]);
  };

  const removeNewPhase = (index) => {
    setNewPhases(prev => prev.filter((_, i) => i !== index));
  };

  const handleNewPhaseChange = (index, field, value) => {
    setNewPhases(prev => prev.map((phase, i) => 
      i === index ? { ...phase, [field]: value } : phase
    ));
  };

  const handleAddPhases = async () => {
    if (newPhases.length === 0) return;

    setActionLoading(true);
    setError('');

    try {
      await addPaymentPhases(id, newPhases.map(p => ({
        ...p,
        amountValue: parseFloat(p.amountValue)
      })));
      setSuccess('Phases added successfully');
      setIsPhaseModalOpen(false);
      setNewPhases([]);
      fetchPlan();
    } catch (err) {
      setError(err.message || 'Failed to add phases');
    } finally {
      setActionLoading(false);
    }
  };

  // Edit Plan handlers
  const openEditPlanModal = () => {
    setEditPlanData({
      totalAmount: plan.totalAmount,
      paymentType: plan.paymentType
    });
    setIsEditPlanModalOpen(true);
  };

  const handleEditPlan = async () => {
    setActionLoading(true);
    setError('');

    try {
      await updatePaymentPlan(id, {
        totalAmount: parseFloat(editPlanData.totalAmount),
        paymentType: editPlanData.paymentType
      });
      setSuccess('Payment plan updated successfully');
      setIsEditPlanModalOpen(false);
      fetchPlan();
    } catch (err) {
      setError(err.message || 'Failed to update payment plan');
    } finally {
      setActionLoading(false);
    }
  };

  // Edit Phase handlers
  const openEditPhaseModal = (phase) => {
    setSelectedPhase(phase);
    setEditPhaseData({
      phaseName: phase.phaseName,
      amountType: phase.amountType,
      amountValue: phase.amountValue,
      dueDate: phase.dueDate ? phase.dueDate.split('T')[0] : ''
    });
    setIsEditPhaseModalOpen(true);
  };

  const handleEditPhase = async () => {
    setActionLoading(true);
    setError('');

    try {
      await updatePaymentPhase(id, selectedPhase._id, {
        phaseName: editPhaseData.phaseName,
        amountType: editPhaseData.amountType,
        amountValue: parseFloat(editPhaseData.amountValue),
        dueDate: editPhaseData.dueDate || null
      });
      setSuccess('Phase updated successfully');
      setIsEditPhaseModalOpen(false);
      setSelectedPhase(null);
      fetchPlan();
    } catch (err) {
      setError(err.message || 'Failed to update phase');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Phase handler
  const handleDeletePhase = async (phase) => {
    if (phase.status === 'PAID') {
      setError('Cannot delete a paid phase');
      return;
    }
    
    if (!confirm(`Are you sure you want to delete phase "${phase.phaseName}"?`)) return;

    setActionLoading(true);
    setError('');

    try {
      await deletePaymentPhase(id, phase._id);
      setSuccess('Phase deleted successfully');
      fetchPlan();
    } catch (err) {
      setError(err.message || 'Failed to delete phase');
    } finally {
      setActionLoading(false);
    }
  };

  // Check if plan can switch payment type
  const hasPaidPhases = plan?.phases?.some(p => p.status === 'PAID') || false;
  const canSwitchToOneTime = !hasPaidPhases;
  const canSwitchToPhaseWise = plan?.status !== 'PAID';

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
          <div className="loading-spinner loading-spinner-lg"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!plan) {
    return (
      <AdminLayout>
        <div style={{ textAlign: 'center', padding: '48px' }}>
          <h2>Payment plan not found</h2>
          <button className="btn btn-primary" onClick={() => router.push('/admin/payments')}>
            Back to Payments
          </button>
        </div>
      </AdminLayout>
    );
  }

  const progressPercent = plan.totalAmount > 0 
    ? Math.round((plan.totalPaidAmount / plan.totalAmount) * 100) 
    : 0;

  return (
    <AdminLayout>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            className="btn btn-secondary btn-icon"
            onClick={() => router.push('/admin/payments')}
          >
            <BackIcon />
          </button>
          <div>
            <h1 className="page-title">Payment Details</h1>
            <p className="page-description">{plan.project?.title}</p>
          </div>
        </div>
        {plan.status !== 'PAID' && (
          <button className="btn btn-secondary" onClick={openEditPlanModal}>
            <EditIcon />
            <span>Edit Plan</span>
          </button>
        )}
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {/* Summary Card */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div className="card">
          <div style={{ padding: '20px' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '4px' }}>Client</p>
            <p style={{ fontSize: '18px', fontWeight: '600' }}>{plan.client?.name}</p>
          </div>
        </div>
        <div className="card">
          <div style={{ padding: '20px' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '4px' }}>Total Amount</p>
            <p style={{ fontSize: '18px', fontWeight: '600' }}>{formatCurrency(plan.totalAmount)}</p>
          </div>
        </div>
        <div className="card">
          <div style={{ padding: '20px' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '4px' }}>Paid</p>
            <p style={{ fontSize: '18px', fontWeight: '600', color: 'var(--color-success)' }}>
              {formatCurrency(plan.totalPaidAmount)}
            </p>
          </div>
        </div>
        <div className="card">
          <div style={{ padding: '20px' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '4px' }}>Pending</p>
            <p style={{ fontSize: '18px', fontWeight: '600', color: 'var(--color-warning)' }}>
              {formatCurrency(plan.remainingAmount)}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span>Payment Progress</span>
            <span>{progressPercent}%</span>
          </div>
          <div style={{ 
            height: '8px', 
            backgroundColor: 'var(--bg-tertiary)', 
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: `${progressPercent}%`,
              backgroundColor: progressPercent === 100 ? 'var(--color-success)' : 'var(--color-primary)',
              borderRadius: '4px',
              transition: 'width 0.3s ease'
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
            <span>Type: <strong>{plan.paymentType.replace('_', ' ')}</strong></span>
            <span>Status: {getStatusBadge(plan.status)}</span>
          </div>
        </div>
      </div>

      {/* One-Time Payment Action */}
      {plan.paymentType === 'ONE_TIME' && plan.status !== 'PAID' && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ marginBottom: '4px' }}>Full Payment</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Mark the full amount as paid</p>
            </div>
            <button className="btn btn-primary" onClick={() => openPayModal(null)}>
              <CheckIcon />
              <span>Mark as Paid</span>
            </button>
          </div>
        </div>
      )}

      {/* Phases */}
      {plan.paymentType === 'PHASE_WISE' && (
        <div className="card">
          <div style={{ 
            padding: '16px 20px', 
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{ margin: 0 }}>Payment Phases</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => setIsPhaseModalOpen(true)}>
              <PlusIcon />
              <span>Add Phase</span>
            </button>
          </div>
          
          {plan.phases && plan.phases.length > 0 ? (
            <div style={{ padding: '0' }}>
              {plan.phases.map((phase, index) => (
                <div 
                  key={phase._id}
                  style={{
                    padding: '16px 20px',
                    borderBottom: index < plan.phases.length - 1 ? '1px solid var(--border-color)' : 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: phase.status === 'PAID' ? 'var(--bg-secondary)' : 'transparent'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                      <strong>{phase.phaseName}</strong>
                      {getStatusBadge(phase.status)}
                      {phase.status === 'PAID' && (
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                          (Locked)
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '24px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                      <span>{formatCurrency(phase.calculatedAmount)}</span>
                      {phase.amountType === 'PERCENTAGE' && (
                        <span>({phase.amountValue}% of total)</span>
                      )}
                      {phase.dueDate && (
                        <span>Due: {formatDate(phase.dueDate)}</span>
                      )}
                      {phase.paidDate && (
                        <span>Paid: {formatDate(phase.paidDate)} via {phase.paymentMode}</span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {phase.status !== 'PAID' && (
                      <>
                        <button 
                          className="btn btn-secondary btn-sm btn-icon"
                          onClick={() => openEditPhaseModal(phase)}
                          title="Edit Phase"
                        >
                          <EditIcon />
                        </button>
                        <button 
                          className="btn btn-danger btn-sm btn-icon"
                          onClick={() => handleDeletePhase(phase)}
                          title="Delete Phase"
                        >
                          <TrashIcon />
                        </button>
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => openPayModal(phase)}
                        >
                          <CheckIcon />
                          <span>Mark Paid</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No phases defined. Click "Add Phase" to create payment phases.
            </div>
          )}
        </div>
      )}

      {/* Pay Modal */}
      <Modal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        title={selectedPhase ? `Pay: ${selectedPhase.phaseName}` : 'Record Full Payment'}
      >
        <div style={{ marginBottom: '16px' }}>
          <p style={{ marginBottom: '16px' }}>
            Amount: <strong>{formatCurrency(selectedPhase?.calculatedAmount || plan.totalAmount)}</strong>
          </p>
          
          <label className="form-label">Payment Mode</label>
          <select
            className="form-input"
            value={paymentMode}
            onChange={(e) => setPaymentMode(e.target.value)}
            required
          >
            <option value="">Select Payment Mode</option>
            {PAYMENT_MODES.map(mode => (
              <option key={mode} value={mode}>{mode}</option>
            ))}
          </select>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={() => setIsPayModalOpen(false)}>
            Cancel
          </button>
          <button 
            type="button" 
            className="btn btn-primary" 
            onClick={handlePayment}
            disabled={actionLoading || !paymentMode}
          >
            {actionLoading ? 'Processing...' : 'Confirm Payment'}
          </button>
        </div>
      </Modal>

      {/* Add Phases Modal */}
      <Modal
        isOpen={isPhaseModalOpen}
        onClose={() => { setIsPhaseModalOpen(false); setNewPhases([]); }}
        title="Add Payment Phases"
      >
        <div style={{ marginBottom: '16px' }}>
          <button type="button" className="btn btn-secondary btn-sm" onClick={addNewPhase}>
            + Add Phase
          </button>
        </div>

        {newPhases.map((phase, index) => (
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
                onClick={() => removeNewPhase(index)}
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
                onChange={(e) => handleNewPhaseChange(index, 'phaseName', e.target.value)}
                required
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <select
                  className="form-input"
                  value={phase.amountType}
                  onChange={(e) => handleNewPhaseChange(index, 'amountType', e.target.value)}
                >
                  <option value="FIXED">Fixed Amount</option>
                  <option value="PERCENTAGE">Percentage</option>
                </select>
                <input
                  type="number"
                  className="form-input"
                  placeholder={phase.amountType === 'PERCENTAGE' ? '%' : '₹'}
                  value={phase.amountValue}
                  onChange={(e) => handleNewPhaseChange(index, 'amountValue', e.target.value)}
                  min="0"
                  required
                />
              </div>
              <input
                type="date"
                className="form-input"
                value={phase.dueDate}
                onChange={(e) => handleNewPhaseChange(index, 'dueDate', e.target.value)}
              />
            </div>
          </div>
        ))}

        {newPhases.length === 0 && (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '16px' }}>
            Click "Add Phase" to define payment phases
          </p>
        )}

        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={() => { setIsPhaseModalOpen(false); setNewPhases([]); }}>
            Cancel
          </button>
          <button 
            type="button" 
            className="btn btn-primary" 
            onClick={handleAddPhases}
            disabled={actionLoading || newPhases.length === 0}
          >
            {actionLoading ? 'Adding...' : 'Add Phases'}
          </button>
        </div>
      </Modal>

      {/* Edit Plan Modal */}
      <Modal
        isOpen={isEditPlanModalOpen}
        onClose={() => setIsEditPlanModalOpen(false)}
        title="Edit Payment Plan"
      >
        <div style={{ marginBottom: '16px' }}>
          <label className="form-label">Total Amount (₹)</label>
          <input
            type="number"
            className="form-input"
            value={editPlanData.totalAmount}
            onChange={(e) => setEditPlanData(prev => ({ ...prev, totalAmount: e.target.value }))}
            min={plan?.totalPaidAmount || 0}
          />
          {plan?.totalPaidAmount > 0 && (
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Minimum: {formatCurrency(plan.totalPaidAmount)} (already paid)
            </p>
          )}
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label className="form-label">Payment Type</label>
          <select
            className="form-input"
            value={editPlanData.paymentType}
            onChange={(e) => setEditPlanData(prev => ({ ...prev, paymentType: e.target.value }))}
          >
            {PAYMENT_TYPES.map(type => {
              const disabled = (type === 'ONE_TIME' && !canSwitchToOneTime) || 
                               (type === 'PHASE_WISE' && !canSwitchToPhaseWise && plan?.paymentType === 'ONE_TIME');
              return (
                <option key={type} value={type} disabled={disabled}>
                  {type.replace('_', ' ')} {disabled ? '(locked)' : ''}
                </option>
              );
            })}
          </select>
          {hasPaidPhases && plan?.paymentType === 'PHASE_WISE' && (
            <p style={{ fontSize: '12px', color: '#b91c1c', marginTop: '4px' }}>
              ⚠️ Cannot switch to ONE_TIME - phases are already paid
            </p>
          )}
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={() => setIsEditPlanModalOpen(false)}>
            Cancel
          </button>
          <button 
            type="button" 
            className="btn btn-primary" 
            onClick={handleEditPlan}
            disabled={actionLoading}
          >
            {actionLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </Modal>

      {/* Edit Phase Modal */}
      <Modal
        isOpen={isEditPhaseModalOpen}
        onClose={() => { setIsEditPhaseModalOpen(false); setSelectedPhase(null); }}
        title="Edit Phase"
      >
        <div style={{ marginBottom: '16px' }}>
          <label className="form-label">Phase Name</label>
          <input
            type="text"
            className="form-input"
            value={editPhaseData.phaseName}
            onChange={(e) => setEditPhaseData(prev => ({ ...prev, phaseName: e.target.value }))}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <div>
            <label className="form-label">Amount Type</label>
            <select
              className="form-input"
              value={editPhaseData.amountType}
              onChange={(e) => setEditPhaseData(prev => ({ ...prev, amountType: e.target.value }))}
            >
              <option value="FIXED">Fixed Amount</option>
              <option value="PERCENTAGE">Percentage</option>
            </select>
          </div>
          <div>
            <label className="form-label">
              {editPhaseData.amountType === 'PERCENTAGE' ? 'Percentage (%)' : 'Amount (₹)'}
            </label>
            <input
              type="number"
              className="form-input"
              value={editPhaseData.amountValue}
              onChange={(e) => setEditPhaseData(prev => ({ ...prev, amountValue: e.target.value }))}
              min="0"
            />
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label className="form-label">Due Date (optional)</label>
          <input
            type="date"
            className="form-input"
            value={editPhaseData.dueDate}
            onChange={(e) => setEditPhaseData(prev => ({ ...prev, dueDate: e.target.value }))}
          />
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={() => { setIsEditPhaseModalOpen(false); setSelectedPhase(null); }}>
            Cancel
          </button>
          <button 
            type="button" 
            className="btn btn-primary" 
            onClick={handleEditPhase}
            disabled={actionLoading}
          >
            {actionLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </Modal>
    </AdminLayout>
  );
}
